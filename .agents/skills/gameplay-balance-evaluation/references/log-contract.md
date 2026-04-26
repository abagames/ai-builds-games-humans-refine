# Gameplay Balance Log Contract

This schema is engine-neutral. A Godot, Unity, web, native, or custom simulation harness can use it as long as the values are comparable across runs.

Required top-level fields:

```json
{
  "version": "1.0",
  "timestamp_utc": "2026-03-05T12:00:00Z",
  "monotonous": {
    "cases": {
      "no_input": {"score": 0, "elapsed": 4.2, "ended": true},
      "hold_action": {"score": 30, "elapsed": 16.7, "ended": true},
      "spam_action": {"score": 42, "elapsed": 18.1, "ended": true}
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

Policy expectations:
- `monotonous.cases` should include idle/no-input and simple repeated-action policies relevant to the game.
- `exploratory.best` should come from random, heuristic, or search-based policies with multiple trials.
- `exploratory_ratio` is `exploratory.best.score / monotonous.max_score`.
- If `monotonous.max_score` is zero, report the ratio with an explicit convention and explain it in the analysis.
- Telemetry details may vary by engine, but preserve the four analysis perspectives.

Interpretation guide:
- `<= 1.0`: fail; monotonous play is optimal or tied.
- `1.0-1.5`: needs work; skill reflection is weak.
- `> 1.5`: pass as a detector, subject to experience guardrails.
