# AGENTS.md — Godot Mini-Game Auto-Generation

Entry point for AI agents to automatically design, implement, and improve mini-games in Godot 4.2+.

## Operational Principle (Single Source of Truth)

- The only source of truth for execution steps, constraints, and evaluation criteria is this `AGENTS.md`.
- Skill reference documents are guides for principles/patterns only; do not duplicate procedural definitions there.
- When procedures change, update this document and keep referenced guides focused on principles and implementation patterns.

## Experience-First Principle (KPI Guardrails)

- KPIs (such as exploratory ratio) are **detectors for gameplay quality**, not optimization goals.
- Changes that degrade player experience must be rejected even if KPI values improve.
- Scoring must be tied only to in-game event causality. Direct scoring for raw input facts is prohibited.
- Game-over conditions must be tied to in-world hazards/state collapse. Do not directly punish non-action itself.
- Test-agent-specific branching (hidden behavior that is only advantageous/disadvantageous during tests) is prohibited.

## Instruction: When You Are Told “Make a Game”

Execute Phases 1–8 in order.
Phase 7 is evaluation-report only (no implementation changes). Implementation changes are allowed only in Phase 8 from human feedback.
Phase 9 (publication) is executed only on an explicit human request, never automatically.
Each phase below lists required files and commands.

If you modify the game based on human instructions, you must run through Web export.

---

## Phase 1: Tag Selection

Randomly select 3 mechanic tags, 2 visual tags, and 1 structure tag.
The mechanic tag selection must not contain any obvious pair listed in `data/tags/obvious_pairs.json`.
Also choose a random integer `button_types` from `1-5`.

```bash
node scripts/random_tag_selector.js --file data/tags/mechanism_tags.csv -n 3 --avoid-obvious-pairs --obvious-pairs data/tags/obvious_pairs.json
node scripts/random_tag_selector.js --file data/tags/visual_tags.csv -n 2
node scripts/random_tag_selector.js --file data/tags/structure_tags.csv -n 1
node scripts/random_tag_selector.js --button-types  # button_types (1-5)
```

To reproduce, add `-s <number>` to each command; this covers tag selection and `--button-types` alike.

**How to treat tags**: Tags are creative seeds, not strict specs. Use contradictory tags as creative tension. Do not fear divergence.

**Minimum validation**:

- [ ] Selected 1 structure tag from `data/tags/structure_tags.csv`
- [ ] Recorded `mechanism 3 + visual 2 + structure 1` in `README.md`
- [ ] Recorded `button_types: <1-5>` in `README.md`
- [ ] No obvious pair (per `data/tags/obvious_pairs.json`) among selected mechanism tags

---

## Phase 2: Game Design

**Skill**: `designing-mini-games`
**Reference**: `.agents/skills/designing-mini-games/references/mini-game-design-guide.md`

Design game rules using mechanic tags as seeds.

1. Free-association and deliberate deviation from tags
2. Write 2-3 candidate core-experience sentences from the same tag set (no tag redraws between candidates)
3. Select exactly one candidate: the one that most directly **uses** the tag tension instead of avoiding it (per the guide's §7 principle — invent a concept that makes the contradiction possible). When candidates are otherwise equal, prefer the stranger one. Do not rank candidates by which sounds most plausible or coherent on paper.
4. Commit all further design depth to the selected candidate only; design controls (within `button_types` chosen in Phase 1)
5. Produce the LLM-guardrail artifacts of the guide's Appendix A: the causal chain audit (0.6) and the degenerate strategy declaration (0.7). These are mandatory tables, not yes/no checks — writing them forces retrieval of failure knowledge that self-affirming review skips.
6. Validate via checklist (`.agents/skills/designing-mini-games/references/mini-game-design-guide.md` §9)

**Output**: `tmp/games/<slug>/README.md` (core mechanics, controls, object specs, novelty rationale, tag log, core-experience candidate log — the selected sentence plus each rejected candidate with a one-line rejection reason — state-variable table, causal chain audit, degenerate strategy declaration, tradeoff explanation)

**Slug rule**: `<slug>` must be kebab-case — lowercase letters, digits, and hyphens only (e.g., `warp-chase-holdline`). The same slug is used unchanged when the game is published in Phase 9.

**Visible-Causality Guard (required)**:

- State variables must not exist "just to have a number." Before adding one, explicitly state one new decision that existing rules cannot express.
- Each state variable must have at least one in-world, non-HUD causal manifestation (terrain/behavior/color/shape/speed/sound).
- If expressible with existing state, prefer integration (state reduction) over adding new state.

---

## Phase 3: Visual Design

**Skill**: `directing-game-visuals`
**Reference**: `.agents/skills/directing-game-visuals/references/visual-design-guide.md`

Design the screen using visual tags as seeds.

1. Verbalize visual direction from tags
2. Identify integration points with mechanics
3. Decide a 3-5 color palette
4. Design feedback effects aligned to tag style
5. Document anti-AI-generic rules in `VISUAL_DESIGN.md`

- Visual hierarchy rule (1 protagonist / 1 danger / 1 reward)
- Upper bound on template-like symbols
- Feedback design that does not rely on UI text
- Composition rules (gaze guidance and center-clutter avoidance)

6. Validate via checklist (`.agents/skills/directing-game-visuals/references/visual-design-guide.md` §10)

**Output**: `tmp/games/<slug>/VISUAL_DESIGN.md` (concept, palette, rendering specs, effect design)
Use `.agents/skills/directing-game-visuals/references/visual-design-guide.md` §7.1 (`VISUAL_DESIGN.md Required Addendum Template`) for required addendum text.

## Phase 4: Sound Design

**Skill**: `creating-godot-procedural-audio`
**Reference**: `.agents/skills/creating-godot-procedural-audio/references/sound-design-guide.md`

Use visual tags as input to define SFX direction. Do not choose separate sound tags.
All SFX must be generated procedurally with Godot `AudioStreamGenerator`; no external audio files.

1. Derive sound style from visual tags (`.agents/skills/creating-godot-procedural-audio/references/sound-design-guide.md` §3 mapping table)
2. Define one-sentence sound concept
3. Select waveform palette (1-2 base waveforms + modulation method)
4. Design SFX per game event (`.agents/skills/creating-godot-procedural-audio/references/sound-design-guide.md` §4)
5. Define dynamic parameters (combo/speed/difficulty linkage)
6. For continuous sounds, specify start condition, stop condition, and release on stop (allowed reverb tail)
7. Validate via checklist (`.agents/skills/creating-godot-procedural-audio/references/sound-design-guide.md` §8)
8. Lock event-to-timbre mapping for `score / danger / damage / state change` within a game
9. Vary timbre design per game (waveform, pitch range, envelope, modulation, rhythm)

**Output**: `tmp/games/<slug>/SOUND_DESIGN.md` (concept, waveform palette, per-event specs, dynamic parameters)

---

## Phase 5: Godot Implementation

**Skills**: `scaffolding-godot-mini-games`, `running-headless-godot` (load before implementation)

Create the Godot project based on Phase 2/3/4 design docs.
Initialization must start from template.

```bash
PROJECT_DIR=tmp/games/<slug>
mkdir -p "$PROJECT_DIR"
cp -R .agents/skills/scaffolding-godot-mini-games/assets/godot-base/. "$PROJECT_DIR"/
mkdir -p "$PROJECT_DIR/logs" "$PROJECT_DIR/build/web"
```

Template default resolution is `960x540`. If changing resolution, update `project.godot`, `web/custom_shell.html`, and `export_presets.cfg` together.

Template scope is documented in `.agents/skills/scaffolding-godot-mini-games/assets/godot-base/TEMPLATE_SCOPE.md`.

### Implementation Constraints

- GDScript (Godot 4.2+)
- Godot built-in nodes only (no external addons)
- Must run with `--headless`
- Before font adoption, implement using `ThemeDB` fallback only (no pre-bundled fonts)

### Implementation Policy (for iterative improvement)

- Split into multiple scripts by responsibility, not one giant script.
- Keep `main.gd` as orchestrator only (update order and dependency wiring).
- Example responsibility axes:
  1. **Game state** (score/progression/multiplier/win-loss)
  2. **Player controls** (input/movement/actions)
  3. **World entities/environment** (non-player dynamics/environmental change)
  4. **UI/HUD** (display/notifications/transitions)
  5. **Effects/Audio** (visual FX/procedural sound)
- During improvements, edit only scripts for the target responsibility whenever possible; minimize cross-cutting changes.

### Deliverable Structure

```text
tmp/games/<slug>/
├── project.godot
├── main.tscn
├── main.gd
├── README.md
├── VISUAL_DESIGN.md
├── TYPOGRAPHY_DECISION.md
├── SOUND_DESIGN.md
├── THIRD_PARTY_LICENSES.md
├── assets/
│   └── fonts/        # bundle only adopted fonts (minimal)
├── licenses/         # original font license texts
├── tools/
│   └── tests/
│       └── run_tests.gd
├── logs/
│   ├── test.log
│   ├── test.json
│   └── improvement_report.md
└── scripts/          # as needed
```

### Deliverable Traceability Rule

Do not merge all documents into one file; use `README.md` as the index page.
`README.md` must include at least relative links to:

- `VISUAL_DESIGN.md`
- `TYPOGRAPHY_DECISION.md`
- `SOUND_DESIGN.md`
- `THIRD_PARTY_LICENSES.md`
- `logs/test.json`
- `logs/improvement_report.md`

### Godot Headless Rules

- Always use `--headless --path <PROJECT_DIR>`
- Capture logs with `mkdir -p logs && ... 2>&1 | tee logs/<name>.log`
- Do not edit `.tscn` directly as text (use `--headless --script`)
- In sandbox/CI/WSL, set `XDG_DATA_HOME`, `XDG_CONFIG_HOME`, `XDG_CACHE_HOME` to absolute paths under `<PROJECT_DIR>`

### Web Export Resolution and Canvas Layout

- Separate in-game render resolution (fixed) from page layout (centered placement).
- Choose render resolution per game (example: `960x540`; can be changed by project requirements).
- Match `project.godot` `window/size/viewport_width` and `window/size/viewport_height` to chosen render resolution.
- In `export_presets.cfg`, default to `html/canvas_resize_policy=0` and explicitly manage canvas buffer size.
- If using `export_filter="all_resources"` in `export_presets.cfg`, include at least these in `exclude_filter`: `build/web/*`, `.godot/*`, `.tmp-godot-data/*`, `.tmp-godot-config/*`, `.tmp-godot-cache/*`, `logs/*`, `tools/tests/*`.
- When using project-local XDG directories for export, Godot searches for export templates under project-local `XDG_DATA_HOME`; if templates are installed under the normal user data directory, set `custom_template/debug` and `custom_template/release` in the copied project's `export_presets.cfg` to absolute template paths before export.
- Create the Web export output directory (for example `mkdir -p build/web`) before running `--export-release`; Godot does not reliably create missing parent directories.
- Require `html/custom_html_shell` and treat `res://web/custom_shell.html` as source of truth.
- `web/custom_shell.html` must:
  - Explicitly set `<canvas id="canvas" width="..." height="...">`
  - Re-assign same values to `canvas.width` / `canvas.height` before startup
  - Center canvas via centered `body` layout
- Do not directly edit `build/web/index.html` (it is overwritten on re-export).

### Typography Implementation

**Skill**: `styling-web-game-typography`

Apply rules from `.agents/skills/styling-web-game-typography/references/typography-implementation-guide.md`:

- Centralize font/color/size with `Theme` (minimize per-node overrides)
- Split display roles into `Heading / Info / Numeric / Emphasis`
- Restrict HUD to info display; emphasis only for events (no constant blinking/glow)
- Use stable-width font for numeric HUD
- Ensure readability over noisy backgrounds with outline/shadow
- Full font adoption (compare/adopt/bundle/license integration) is done in Phase 8
- Do not bundle non-adopted candidate fonts
- Reflect license info in `THIRD_PARTY_LICENSES.md` and `licenses/`

---

## Phase 6: Testing & Evaluation

Evaluate implemented game via manual play and/or headless execution.

### 6a: Runtime Verification

```bash
PROJECT_DIR="$(pwd)/tmp/games/<slug>" && \
mkdir -p "$PROJECT_DIR"/.godot-xdg/data "$PROJECT_DIR"/.godot-xdg/config "$PROJECT_DIR"/.godot-xdg/cache "$PROJECT_DIR"/logs && \
XDG_DATA_HOME="$PROJECT_DIR/.godot-xdg/data" \
XDG_CONFIG_HOME="$PROJECT_DIR/.godot-xdg/config" \
XDG_CACHE_HOME="$PROJECT_DIR/.godot-xdg/cache" \
godot --headless --path "$PROJECT_DIR" --script res://tools/tests/run_tests.gd 2>&1 | tee "$PROJECT_DIR/logs/test.log"
```

If you create `run_tests.gd`, include at least:

- Monotonous input tests (`no_input` / `spam_action` / `hold_action`)
- Exploratory input tests (random or heuristic, multiple trials)
- Run monotonous and exploratory policies with the **same number of seeds per policy** (the template uses 8). Never compare a single-seed monotonous baseline against a multi-seed exploratory best; that lets exploratory cherry-pick lucky world seeds and inflates the ratio.
- Output of `exploratory.best.score` and `monotonous.max_score`
- Output `logs/test.json` on every run with required minimum fields:
  - `seed_policy` (seed bases, seeds per policy, variant count)
  - `monotonous.max_score`
  - `exploratory.best.score`
  - `exploratory_ratio`
  - `telemetry.death_analysis / spawn_analysis / scoring_analysis / input_analysis`
  - `input_sensitivity` (replay the best exploratory run's recorded input stream with ±2/±4-frame shifts on the same seed; report base and shifted scores)
  - `exploration_policy_exclusions` (per policy, the state-space regions/filters it needed to function; empty arrays allowed but the key must exist)
- Treat missing required fields as test failure
- Interpret `input_sensitivity` as a diagnostic, not an auto-fail: near-identical scores under shifts mean input timing is irrelevant (mash-equivalent design); collapse under a ±2-frame shift means outcomes are not player-predictable. Either extreme must be analyzed in Phase 7.
- Treat systematic `exploration_policy_exclusions` over reachable-looking space (visible targets, usable-looking areas/actions) as an affordance-defect signal: optimal play is routing around something human players will still try, and the LLM must report it instead of silently adapting to it.
- Treat `monotonous.max_score == 0` as test failure (`exploratory_ratio` is indeterminate; do not substitute a sentinel value)
- If the game has staged/unlocked content (waves, phases, rule reveals), implement a stage-forcing test hook (e.g., `set_wave_for_test`) plus `run_staged_content_checks()` on `main.gd` so that every stage executes at least once; the template harness records its result under `staged_content_checks` in `logs/test.json`. A stage that never spawns/behaves in any check is a test failure.
- Auto-update `logs/improvement_report.md` for improvement-history comparison

### 6b: Mechanics Evaluation (Exploratory Ratio)

```text
exploratory_ratio = exploratory.best.score / monotonous.max_score
```

| Exploratory Ratio | Evaluation  | Meaning                                   |
| :---------------- | :---------- | :---------------------------------------- |
| <= 1.0            | Fail        | Monotonous input is optimal (no skill)    |
| 1.0 - 1.5         | Needs work  | Skill reflection is insufficient           |
| > 1.5             | Pass        | Better play is rewarded                    |

Treat command success as runtime/schema success only. Mechanics pass/fail must be judged from `logs/test.json` `exploratory_ratio` and the checklist below; a test command may exit 0 while mechanics evaluation fails.

Exploratory ratio is necessary but not sufficient. KPI gains with degraded experience are rejected.

Check:

- [ ] Game-over conditions function correctly
- [ ] Score is added as intended
- [ ] Difficulty increases over time
- [ ] Button-mashing/idle is not optimal
- [ ] Skillful play is rewarded
- [ ] For each added state variable, non-HUD in-world causality is implemented in code
- [ ] If the game has staged/unlocked content, every stage is exercised at least once via stage-forcing checks (`staged_content_checks` in `logs/test.json`); content the 30-second window never reaches must not go unevaluated

Subjective visual/sound evaluation and UI-hidden comprehension checks are done in Phase 8.

---

## Phase 7: Improvement Evaluation Report

Analyze issues found in Phase 6 and propose improvement candidates.

- Propose at least 3 options (not just one)
- Breakdown:
  - Option A: uses improvement operators (below)
  - Option B: uses a different operator combination from A
  - Option C: free-form option without those operator types (for comparison)
- For each option, write expected impact, risk, and complexity cost (state count / exception-rule count)
- Record proposals in `README.md` and `logs/improvement_report.md`
- After Phase 7 completion, execute Web export and proceed to Phase 8

### Improvement Operators (Search Algorithm)

- `State reduction`: Remove state variables that require explanation and merge into existing state
- `Integrate into world representation`: Move HUD-only info into terrain/behavior/color/sound causality
- `Input semantics inversion`: Switch same input role by context/phase to create judgment context
- `Spatial historization`: Persist player action results in environment to affect next decisions
- `Risk reward shift`: Reduce safe-zone steady scoring and shift rewards toward risky success

Per evaluation, choose 2-3 operators and vary combinations across proposals.

### Violation Fix Templates

- If monotonous input is optimal:
  - Reduce safe steady scoring
  - Move scoring opportunities to ones achievable only under risk
  - Document expected exploratory-ratio change as a forecast
- If state variables are excessive:
  - Remove weakly-justified added states
  - Merge into existing state while preserving decision structure
  - Explicitly state decisions that must remain after reduction

### Mechanics Improvement

**Skill**: `evaluating-gameplay-balance`
**Reference**: `.agents/skills/evaluating-gameplay-balance/references/improvement-analysis.md`, `.agents/skills/evaluating-gameplay-balance/references/balance-patterns.md`

- Identify root causes (logic changes, not mere numeric tuning)
- Apply/compare patterns from `.agents/skills/evaluating-gameplay-balance/references/balance-patterns.md` in candidate options
- For later Godot implementation in Phase 8, consult `.agents/skills/scaffolding-godot-mini-games/references/godot-balance-pattern-examples.md` after choosing an engine-neutral pattern.
- Treat "state variables requiring explanation" as reduction targets and integrate into world-side behavior
- Improvement report must record: "3 presented options", "adoption-candidate rationale", and "rejection rationale"
- Implement only after humans choose an option in Phase 8

Subjective visual/sound improvements are out of Phase 7 scope.

### Prohibited

- Numeric tuning only (e.g., `speed *= 0.8`)
- Condition-branch addition only (e.g., `if too_hard: make_easier()`)
- Increasing randomness
- Claiming depth improvement by merely adding state variables
- Treating color-only changes as sufficient anti-AI-generic measures
- Treating HUD text addition as sufficient feedback fix
- Direct score for input facts (e.g., activity bonus)
- Meta penalties that directly fail on non-action (e.g., instant death for idle/stall)
- Hidden rules added only to pass test metrics (autoplay-specialized branches)

---

## Phase 8: Human-in-the-Loop Improvement

Optional phase where humans view/play Web export and iterate improvements through dialogue with the AI agent.

### Goal

- Complement headless metrics with lived experience quality (feel/readability/sound impression/tempo)
- Reduce mismatch between design intent and real play experience by incorporating human feedback

### Minimum Operation Rules

- Record short notes from human play observations and pass requests to AI
- AI implements requests and re-runs Phase 6 tests every time
- After tests, always update Phase 7 evaluation report
- After modifications, execute Web export
- Iterative dialogue can continue for as many rounds as needed
- Full typography execution (font comparison/adoption/bundling/license reflection) should generally happen here
- For typography implementation, follow `.agents/skills/styling-web-game-typography/references/typography-implementation-guide.md` and update `TYPOGRAPHY_DECISION.md`, `THIRD_PARTY_LICENSES.md`, and `licenses/`

### Recording (recommended)

- Add a "Human Feedback" section to `logs/improvement_report.md` with reasons and changes

---

## Phase 9: Publication (Human-Triggered)

Execute only when a human explicitly asks to publish a game. Publication promotes the working game from `tmp/games/<slug>` to `docs/games/<slug>` (served via GitHub Pages).

### Publication Criteria

- A human has played the Web export in Phase 8 and approved publication.
- The latest Phase 6 run passes runtime/schema checks (`monotonous.max_score > 0`, all required `test.json` fields present, staged-content checks pass if applicable).
- Record the final `exploratory_ratio` in the game's `README.md`. If it is `<= 1.5` (below the mechanics pass bar), record a one-line human rationale for publishing anyway.

### Steps

1. Re-run Phase 6 tests and Web export on the final implementation.
2. Copy `tmp/games/<slug>` to `docs/games/<slug>`. Exclude `TEMPLATE_SCOPE.md` (template-internal documentation; it must not ship with a published game). Transient artifacts (`.godot/`, `.godot-xdg/`, `.tmp-godot-*/`, `logs/`, `tools/tests/`, `*.uid`, `*.import`) are filtered by the root `.gitignore`; `build/web/` must be included because it is the playable deliverable linked from the root `README.md`.
3. Create `docs/games/<slug>/screenshot.gif` (short gameplay capture).
4. Add the game (Pages link + screenshot) to the root `README.md` Sample Games section.
5. Keep the slug identical to the development slug (kebab-case rule from Phase 2).

---

## Final Report

At Phase 7 completion, you must output the following report.
Because Phase 7 is evaluation-only, "Not implemented / N/A" is allowed in the after-improvement column.
If implementation occurs in Phase 8, update this report using re-run Phase 6 results.

```markdown
# Game Generation Report: <GAME_NAME>

## Selected Tags

### Mechanics Tags

- tag1, tag2, tag3

### Visual Tags

- vtag1, vtag2

### Structure Tags

- stag1

## Test Results

| Metric            | Initial | After Improvement |
| :---------------- | :------ | :---------------- |
| Exploratory Ratio | X.Xx    | Y.Yx              |

Note: Visual/sound/AI-genericness evaluations are added only if Phase 8 is executed.

## Improvements

### Mechanics Improvement

1. <What changed and why>

### Visual Improvement

1. <What changed and why>

### Sound Improvement

1. <What changed and why>
```

---

## File List

| File                                        | Purpose                                       | Referenced Phase |
| :------------------------------------------ | :-------------------------------------------- | :--------------- |
| `data/tags/mechanism_tags.csv`              | Mechanics tags (107 tags)                     | Phase 1          |
| `data/tags/visual_tags.csv`                 | Visual tags (54 tags)                         | Phase 1          |
| `data/tags/structure_tags.csv`              | Structure tags (game skeleton)                | Phase 1          |
| `data/tags/obvious_pairs.json`              | Obvious-pair definitions (non-obvious check)  | Phase 1          |
| `scripts/random_tag_selector.js`            | Tag selection script                          | Phase 1          |
| `.agents/skills/designing-mini-games/`      | Mechanics design skill and reference          | Phase 2          |
| `.agents/skills/directing-game-visuals/`    | Visual design skill and reference             | Phase 3          |
| `.agents/skills/creating-godot-procedural-audio/` | Procedural audio skill and reference/assets | Phase 4          |
| `.agents/skills/scaffolding-godot-mini-games/` | New game initialization template skill     | Phase 5          |
| `.agents/skills/running-headless-godot/`    | Godot headless operation skill                | Phase 5-6        |
| `.agents/skills/styling-web-game-typography/` | Typography implementation/license skill     | Phase 5/8        |
| `.agents/skills/evaluating-gameplay-balance/` | Balance analysis and improvement skill      | Phase 7          |
