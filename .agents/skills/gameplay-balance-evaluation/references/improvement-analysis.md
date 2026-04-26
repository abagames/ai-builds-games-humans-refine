# Gameplay Balance Improvement Analysis

Guide for improving action mini-games based on repeatable simulation or playtest telemetry.
The purpose is structural improvement of rules, generation logic, and state transitions, not numeric micro-tuning.

## Important: Canonical Guardrails

When this reference is used inside a repository with an `AGENTS.md`, that file remains the source of truth for project-specific execution rules. This reference covers reusable improvement analysis and implementation patterns.

Notes:

- Even when this guide uses exploratory ratio, treat the metric as a detector rather than the target.
- Treat survival time as a supporting metric and prioritize experience quality.

## 1. Purpose of This Guide

Analyze output logs from a repeatable test harness and perform the following.

- **Root Cause Identification**: identify design defects, not just surface symptoms
- **Structural Improvement**: change rules and generation algorithms
- **Verification Loop**: Re-compare before and after with the same metric set

## 2. Log Input Contract

The preferred engine-neutral contract is defined in `log-contract.md`. The analysis target is the structure below.

```json
{
  "version": "1.0",
  "timestamp_utc": "2026-03-05T12:00:00",
  "monotonous": {
    "cases": {
      "no_input":     {"score": 0,  "elapsed": 4.2,  "ended": true},
      "hold_action":  {"score": 30, "elapsed": 16.7, "ended": true},
      "spam_action":  {"score": 42, "elapsed": 18.1, "ended": true}
    },
    "max_score": 42
  },
  "exploratory": {
    "best": {"score": 95, "elapsed": 24.9, "ended": true},
    "best_seed": 2001,
    "best_variant": 3
  },
  "exploratory_ratio": 2.26,
  "telemetry": {
    "death_analysis": {},
    "spawn_analysis": {},
    "scoring_analysis": {},
    "input_analysis": {}
  }
}
```

- Default keys for `monotonous.cases` are `no_input` / `hold_action` / `spam_action`; custom policies are allowed when they match the game's controls.
- `exploratory_ratio` is placed at top level (`exploratory.best.score / monotonous.max_score`).
- `telemetry` details may vary by game implementation, but the following four perspectives must be preserved.

## 3. Log Analysis Perspectives

### 3.1 Death Analysis

Check items:

- Death-position bias (clustered near the same coordinates)
- Frequent deaths within 1-3 frames right after input
- Only specific hazards have disproportionately high death rates

Typical causes:

- Unavoidable spawns
- High-speed entry without telegraph
- Insufficient failure-recovery design such as i-frames/knockback

Related balance patterns: `balance-patterns.md` §1.1 (sqrt transform), §3.1/3.3 (boundary handling), §6.1 (safe distance)

### 3.2 Spawn Analysis

Check items:

- Minimum spawn interval is below reaction limit
- Spawn positions are biased toward part of the screen
- Hazard type distribution is overly concentrated

Typical causes:

- Insufficient spawn cooldown design
- Pure random spawning without spatial-cell management
- Constraint release during difficulty increase is too abrupt

Related balance patterns: `balance-patterns.md` §1.3 (inverse spawn interval), §6.2-6.4 (spawn control)

### 3.3 Scoring Analysis

Check items:

- Only one scoring route exists
- No reward differentiation for risky actions (near misses, etc.)
- Late-game difficulty only reduces scoring opportunities
- Input amount should not correlate excessively with score (do not reward raw input count itself)

Typical causes:

- Fixed-score only
- No risk-linked multiplier
- Insufficient per-phase reward redesign

Related balance patterns: `balance-patterns.md` §2.1 (risk-link), §2.3/2.4 (combo), §8.1 (timing window)

### 3.4 Input Analysis

Check items:

- `hold_primary` / `pulse_primary` are always optimal
- A single custom-policy pattern is always optimal
- Exploratory input barely gains advantage (exploratory ratio does not improve)

Typical causes:

- No tradeoff per input state
- No context dependency in action selection
- Player state machine is too simple

Related balance patterns: `balance-patterns.md` §4.3 (miss penalty), §5.1-5.3 (input response), §9.1/9.3 (state management)

### 3.5 Experience Integrity Gate

Before KPI checks, the following must hold.

- Failure causes are explainable as in-world hazards
- Score causes are explainable as in-game event causality
- No unfair instant-death or unexplained score change in at least 2 minutes of human play

## 4. Problem Patterns and Structural Fixes

### 4.1 Unavoidable Death Clusters

Symptoms:

- Deaths repeat in the same area
- Damage taken without warning

Insufficient response:

```gdscript
# ❌ Only lower speed
enemy_speed *= 0.8
```

Recommended response:

```gdscript
# ✅ Spawn checks that guarantee an escape route
func spawn_enemy() -> void:
    for _i in range(8):
        var p := _random_spawn_point()
        if _has_escape_route(p):
            _commit_spawn(p)
            return
    # Skip spawn on failure to prevent unfair death

func _has_escape_route(spawn_pos: Vector2) -> bool:
    var min_clearance := player_radius * 3.0
    return spawn_pos.distance_to(player.global_position) >= min_clearance
```

### 4.2 Monotonous Input Dominance

Symptoms:

- Only mashing or holding yields high score

Insufficient response:

```gdscript
# ❌ Only add a fixed cooldown
if action_cooldown > 0.0:
    return
```

Recommended response:

```gdscript
# ✅ Make environment-side behavior also change by input state
func apply_action_rule(action_mode: String) -> void:
    match action_mode:
        "spam":
            heat += 0.25            # Mashing raises danger
            score_multiplier = 1.0
        "rhythm":
            heat = max(0.0, heat - 0.1)
            score_multiplier = 1.5  # Reward successful rhythm
        "hold":
            charge += 0.2
            if charge > 1.0:
                expose_hitbox()     # Holding increases power while also increasing hit risk
```

### 4.3 Flat Difficulty Curve

`difficulty` convention: initial value `1`, then `+1` every elapsed minute (see `balance-patterns.md` §1).

Symptoms:

- Early and late-game feel the same
- Difficulty increase is "just faster"

Insufficient response:

```gdscript
# ❌ Linear increment only
difficulty += delta * 0.1
```

Recommended response:

```gdscript
# ✅ Add rules via phase transitions
func update_phase(elapsed_sec: float) -> void:
    if elapsed_sec < 20.0:
        phase = 0
    elif elapsed_sec < 45.0:
        phase = 1
    else:
        phase = 2

func apply_phase_rules() -> void:
    match phase:
        0:
            enable_homing = false
            warning_time = 0.35
        1:
            enable_homing = true
            warning_time = 0.25
        2:
            enable_homing = true
            enable_near_miss_bonus = true
            warning_time = 0.20
```

### 4.4 Spatial Distribution Bias

Symptoms:

- Spawn points are biased to center or edges
- Unused screen areas become fixed

Recommended response:

```gdscript
# ✅ Spawn with cell cooldown
var last_spawn_tick_by_cell: Dictionary = {}
const CELL_COOLDOWN := 45

func choose_spawn_cell(cells: Array, tick: int) -> int:
    var best_idx := -1
    var best_score := -INF
    for i in range(cells.size()):
        var id: String = cells[i].id
        var last_tick: int = int(last_spawn_tick_by_cell.get(id, -100000))
        var cooldown_ok := tick - last_tick >= CELL_COOLDOWN
        if not cooldown_ok:
            continue
        var score := cells[i].distance_from_player
        if score > best_score:
            best_score = score
            best_idx = i
    return best_idx
```

## 5. Improvement Process

### 5.1 Acquire Baseline Logs

Collect a baseline log from the project's repeatable test harness.

Minimum values to persist:

- `monotonous.max_score`
- `exploratory.best.score`
- `exploratory_ratio`
- `telemetry` (death_analysis / spawn_analysis / scoring_analysis / input_analysis)

### 5.2 Generate Improvement Proposal

Focus on one problem per improvement.

- Problem name
- Root cause (logic)
- Target module/script/system to change (by responsibility)
- Change details (rules/generation/state transitions)
- Expected effect (which metrics change and how)
- Experience hypothesis (what players learn and what feels good)
- Expected side effects (risk of unfairness/monotony)

### 5.3 Implement and Re-test

- Apply **one** applicable pattern from `balance-patterns.md`
- Re-test and compare exploratory ratio and supporting metrics again
- If worsened, apply another pattern rather than immediate rollback

### 5.4 State Snapshot Policy (Optional)

Treat generated screenshots or state summaries as **state-consistency evidence**, not exact final-render judgment.

- Purpose:
  - Record Scene A/B/C phase differences (low-density/high-density/pre-post damage) reproducibly
  - Verify separation of placement, density, and protagonist/danger/reward roles
- Non-purpose:
  - Judging final quality of glow, post effects, fonts, or final UI appearance
- Implementation recommendation:
  - From the test harness, call an API such as `capture_debug_frame(path)` to generate images from game state
  - Fix capture timing (encode Scene A/B/C conditions) and prioritize comparability
  - If the engine's render capture is unstable in automation, use the state-snapshot method as canonical
- Evaluation operation:
  - Web/manual-play screenshots are the source of truth for visual quality
  - Limit headless images to CI regression checks (composition/density/role breakdown detection)

#### Minimal Implementation Pattern

Provide an image-generation or state-summary API callable from tests. The example below uses GDScript-style pseudocode, but the contract is engine-neutral.

```gdscript
# main.gd
func capture_debug_frame(path: String) -> void:
    var img := Image.create(960, 540, false, Image.FORMAT_RGBA8)
    img.fill(Color8(10, 18, 32, 255)) # background

    var snap: Dictionary = world_system.get_capture_snapshot()
    for hazard in snap.get("hazards", []):
        var x := int((hazard as Dictionary).get("x", 0.0))
        var y := int((hazard as Dictionary).get("y", 0.0))
        var w := int((hazard as Dictionary).get("w", 16.0))
        var h := int((hazard as Dictionary).get("h", 16.0))
        img.fill_rect(Rect2i(x, y, w, h), Color8(211, 77, 91, 255))

    var p := player.get_debug_position()
    img.fill_rect(Rect2i(int(p.x) - 4, int(p.y) - 4, 8, 8), Color8(255, 242, 209, 255))
    img.save_png(path)
```

Invoke from the automated test harness under fixed-scene conditions.

```gdscript
# test harness pseudocode
func _capture_screenshots(game: Node) -> void:
    game.force_reset_for_test(3001) # Scene A: low density
    _step_for_scene_a(game)
    game.capture_debug_frame("res://logs/screens/scene_a.png")

    game.force_reset_for_test(3002) # Scene B: high density
    game.set_wave_for_test(8)
    _step_for_scene_b(game)
    game.capture_debug_frame("res://logs/screens/scene_b.png")

    game.force_reset_for_test(3003) # Scene C: near failure
    _step_until_near_failure(game)
    game.capture_debug_frame("res://logs/screens/scene_c.png")
```

Fallback rules:

- If `capture_debug_frame` is not implemented, treat as failure (test fail), not a single-color placeholder  
- Fix Scene A/B/C seed and frame conditions as constants so the comparison axis remains stable after improvements

## 6. Evaluation Criteria

### 6.1 Primary Metric

| Exploratory Ratio | Evaluation | Meaning |
| :--- | :--- | :--- |
| <= 1.0 | Fail | Monotonous input is optimal |
| 1.0 - 1.5 | Needs work | Skill differential is weak |
| > 1.5 | Pass | Skillful play is rewarded |

### 6.2 Auxiliary Metrics

| Metric | Good state | Problem state |
| :--- | :--- | :--- |
| Death diversity | Spread across multiple causes | Concentrated into one cause |
| Spawn fairness | Reactable minimum interval | Back-to-back instant-death interval |
| Scoring routes | Two or more scoring routes | Fixed action only |
| Input dominance | Exploratory is superior | Spam/hold always wins |

### 6.3 Mandatory Experience Gates

If any of the following is `No`, fail even if exploratory ratio is high.

| Gate | Pass condition |
| :--- | :--- |
| Scoring causality | Score ties to event causality, not raw input fact |
| Failure causality | Failure ties to in-world hazards, not non-action meta penalty |
| Human sanity check | At least 2 minutes of manual play does not increase unfairness |

## 7. Anti-patterns

### ❌ Parameter-Only Fix

```gdscript
enemy_speed *= 0.8
spawn_interval += 0.2
```

### ❌ Branch-Only Fix

```gdscript
if too_hard:
    make_easier()
```

### ❌ Randomness Creep

```gdscript
spawn_pos.y += randf_range(-80.0, 80.0)
```

### ❌ UI-Only Compensation

- Only adding HUD text while leaving root issue unresolved
- Covering feedback defects with text explanation

### ❌ KPI Gaming

```gdscript
# Awarding points for raw input facts (prohibited)
if input_pressed:
    score += 1

# Instant game over for non-movement fact alone (prohibited)
if idle_time > 1.5:
    trigger_game_over()
```

## 8. Recommended Change Set Template

```markdown
## Problem Analysis

### Problem 1: <name>
- Symptom:
- Root cause:
- Impact:

## Improvement Proposal

### Improvement 1: <name>
- Target script:
- Structural change:
- Why it should work:

## Expected Effect
- Exploratory ratio: <before> -> <after target>
- Secondary metrics:
```

## 9. Before/After Verification Template

```markdown
| Metric | Before | After |
|:---|:---|:---|
| monotonous.max_score |  |  |
| exploratory.best.score |  |  |
| exploratory_ratio |  |  |
| death diversity |  |  |
| spawn fairness |  |  |
```

Create this comparison table for each improvement and stop after at most 3 loops.
