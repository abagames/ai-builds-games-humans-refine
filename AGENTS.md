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
Each phase below lists required files and commands.

If you modify the game based on human instructions, you must run through Web export.

---

## Phase 1: Tag Selection

Randomly select 3 mechanic tags, 2 visual tags, and 1 structure tag.
Mechanic tags must satisfy at least one non-obvious pair based on `data/tags/obvious_pairs.json`.
Also choose a random integer `button_types` from `1-5`.

```bash
node scripts/random_tag_selector.js --file data/tags/mechanism_tags.csv -n 3 --require-unexpected-pair --obvious-pairs data/tags/obvious_pairs.json
node scripts/random_tag_selector.js --file data/tags/visual_tags.csv -n 2
node scripts/random_tag_selector.js --file data/tags/structure_tags.csv -n 1
node -e "console.log(Math.floor(Math.random() * 5) + 1)"  # button_types (1-5)
```

To reproduce with the same seed, add `-s <number>`.
If `button_types` must also be reproducible, use the same `-s <number>` and a seeded random call in `node` to generate the same value.

**How to treat tags**: Tags are creative seeds, not strict specs. Use contradictory tags as creative tension. Do not fear divergence.

**Minimum validation**:

- [ ] Selected 1 structure tag from `data/tags/structure_tags.csv`
- [ ] Recorded `mechanism 3 + visual 2 + structure 1` in `README.md`
- [ ] Recorded `button_types: <1-5>` in `README.md`
- [ ] Satisfied `non-obvious pair >= 1` under `data/tags/obvious_pairs.json`

---

## Phase 2: Game Design

**Skill**: `mini-game-design`
**Reference**: `.agents/skills/mini-game-design/references/mini-game-design-guide.md`

Design game rules using mechanic tags as seeds.

1. Free-association and deliberate deviation from tags
2. Define the core experience in one sentence
3. Design controls (within `button_types` chosen in Phase 1)
4. Validate via checklist (`.agents/skills/mini-game-design/references/mini-game-design-guide.md` §10)

**Output**: `tmp/games/<slug>/README.md` (core mechanics, controls, object specs, novelty rationale, tag log, state-variable table, tradeoff explanation)

**Visible-Causality Guard (required)**:

- State variables must not exist "just to have a number." Before adding one, explicitly state one new decision that existing rules cannot express.
- Each state variable must have at least one in-world, non-HUD causal manifestation (terrain/behavior/color/shape/speed/sound).
- If expressible with existing state, prefer integration (state reduction) over adding new state.

---

## Phase 3: Visual Design

**Skill**: `game-visual-direction`
**Reference**: `.agents/skills/game-visual-direction/references/visual-design-guide.md`

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

6. Validate via checklist (`.agents/skills/game-visual-direction/references/visual-design-guide.md` §10)

**Output**: `tmp/games/<slug>/VISUAL_DESIGN.md` (concept, palette, rendering specs, effect design)
Use `.agents/skills/game-visual-direction/references/visual-design-guide.md` §7.1 (`VISUAL_DESIGN.md Required Addendum Template`) for required addendum text.

## Phase 4: Sound Design

**Skill**: `godot-procedural-audio`
**Reference**: `.agents/skills/godot-procedural-audio/references/sound-design-guide.md`

Use visual tags as input to define SFX direction. Do not choose separate sound tags.
All SFX must be generated procedurally with Godot `AudioStreamGenerator`; no external audio files.

1. Derive sound style from visual tags (`.agents/skills/godot-procedural-audio/references/sound-design-guide.md` §3 mapping table)
2. Define one-sentence sound concept
3. Select waveform palette (1-2 base waveforms + modulation method)
4. Design SFX per game event (`.agents/skills/godot-procedural-audio/references/sound-design-guide.md` §4)
5. Define dynamic parameters (combo/speed/difficulty linkage)
6. For continuous sounds, specify start condition, stop condition, and release on stop (allowed reverb tail)
7. Validate via checklist (`.agents/skills/godot-procedural-audio/references/sound-design-guide.md` §8)
8. Lock event-to-timbre mapping for `score / danger / damage / state change` within a game
9. Vary timbre design per game (waveform, pitch range, envelope, modulation, rhythm)

**Output**: `tmp/games/<slug>/SOUND_DESIGN.md` (concept, waveform palette, per-event specs, dynamic parameters)

---

## Phase 5: Godot Implementation

**Skills**: `godot-mini-game-template`, `headless-godot` (load before implementation)

Create the Godot project based on Phase 2/3/4 design docs.
Initialization must start from template.

```bash
cp -r .agents/skills/godot-mini-game-template/assets/godot-base/ tmp/games/<slug>/
```

Template default resolution is `960x540`. If changing resolution, update `project.godot`, `web/custom_shell.html`, and `export_presets.cfg` together.

Template scope is documented in `.agents/skills/godot-mini-game-template/assets/godot-base/TEMPLATE_SCOPE.md`.

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

**Skill**: `godot-web-typography`

Apply rules from `.agents/skills/godot-web-typography/references/typography-implementation-guide.md`:

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
mkdir -p "$PROJECT_DIR"/.tmp-godot-data "$PROJECT_DIR"/.tmp-godot-config "$PROJECT_DIR"/.tmp-godot-cache "$PROJECT_DIR"/logs && \
XDG_DATA_HOME="$PROJECT_DIR/.tmp-godot-data" \
XDG_CONFIG_HOME="$PROJECT_DIR/.tmp-godot-config" \
XDG_CACHE_HOME="$PROJECT_DIR/.tmp-godot-cache" \
godot --headless --path "$PROJECT_DIR" --script res://tools/tests/run_tests.gd 2>&1 | tee "$PROJECT_DIR/logs/test.log"
```

If you create `run_tests.gd`, include at least:

- Monotonous input tests (`no_input` / `spam_action` / `hold_action`)
- Exploratory input tests (random or heuristic, multiple trials)
- Output of `exploratory.best.score` and `monotonous.max_score`
- Output `logs/test.json` on every run with required minimum fields:
  - `monotonous.max_score`
  - `exploratory.best.score`
  - `exploratory_ratio`
  - `telemetry.death_analysis / spawn_analysis / scoring_analysis / input_analysis`
- Treat missing required fields as test failure
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

Exploratory ratio is necessary but not sufficient. KPI gains with degraded experience are rejected.

Check:

- [ ] Game-over conditions function correctly
- [ ] Score is added as intended
- [ ] Difficulty increases over time
- [ ] Button-mashing/idle is not optimal
- [ ] Skillful play is rewarded
- [ ] For each added state variable, non-HUD in-world causality is implemented in code

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

**Skill**: `gameplay-balance-evaluation`
**Reference**: `.agents/skills/gameplay-balance-evaluation/references/improvement-analysis.md`, `.agents/skills/gameplay-balance-evaluation/references/balance-patterns.md`

- Identify root causes (logic changes, not mere numeric tuning)
- Apply/compare patterns from `.agents/skills/gameplay-balance-evaluation/references/balance-patterns.md` in candidate options
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
- For typography implementation, follow `.agents/skills/godot-web-typography/references/typography-implementation-guide.md` and update `TYPOGRAPHY_DECISION.md`, `THIRD_PARTY_LICENSES.md`, and `licenses/`

### Recording (recommended)

- Add a "Human Feedback" section to `logs/improvement_report.md` with reasons and changes

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
| `.agents/skills/mini-game-design/`          | Mechanics design skill and reference          | Phase 2          |
| `.agents/skills/game-visual-direction/`     | Visual design skill and reference             | Phase 3          |
| `.agents/skills/godot-procedural-audio/`    | Procedural audio skill and reference/assets   | Phase 4          |
| `.agents/skills/godot-mini-game-template/`  | New game initialization template skill        | Phase 5          |
| `.agents/skills/headless-godot/`            | Godot headless operation skill                | Phase 5-6        |
| `.agents/skills/godot-web-typography/`      | Typography implementation/license skill       | Phase 5/8        |
| `.agents/skills/gameplay-balance-evaluation/` | Balance analysis and improvement skill      | Phase 7          |
