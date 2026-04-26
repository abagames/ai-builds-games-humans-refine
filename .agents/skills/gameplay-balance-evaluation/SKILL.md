---
name: gameplay-balance-evaluation
description: "Evaluate and improve gameplay balance from telemetry in any engine. Use when comparing monotonous vs exploratory play, diagnosing death/spawn/scoring/input issues, or proposing structural balance fixes instead of numeric tuning."
---

Use this skill to analyze whether a game rewards skillful play and to propose structural improvements.

Engine-neutral contract:
- Produce comparable runs for monotonous policies and exploratory policies.
- Record score, elapsed time, end state, and telemetry for death, spawn, scoring, and input behavior.
- Compute `exploratory_ratio = exploratory.best.score / monotonous.max_score`.
- Treat the ratio as a quality detector, not an optimization target.

Experience guardrails:
- Reject changes that degrade play experience even if metrics improve.
- Score only in-game causal events; do not award points for raw input facts.
- Game-over should be tied to hazards or world-state collapse.
- Do not add hidden behavior that only helps or hurts test agents.
- Avoid numeric-only tuning, branch-only fixes, and added randomness as the primary answer.

Workflow:
1. Validate that the telemetry has the required fields.
2. Analyze death, spawn, scoring, and input patterns.
3. Identify root causes in rules or generation logic.
4. Propose at least three candidate fixes with expected impact, risk, and complexity.
5. Re-test with the same policies after implementation.

Read these references as needed:
- `references/log-contract.md` for the engine-neutral telemetry schema.
- `references/improvement-analysis.md` for analysis perspectives and report templates.
- `references/balance-patterns.md` for structural balance patterns.
