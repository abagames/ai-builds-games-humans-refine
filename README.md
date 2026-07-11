# AI Builds Games, Humans Refine

## A Tiny Story

> **AI:** "I made a game! Wanna try it?"
>
> **Human:** "Of course. Let me play... This is fun. Maybe this part could feel clearer, and this moment could pop more."
>
> **AI:** "Okay! I'll fix it and show you the next version."

This project is a human-in-the-loop mini-game workshop:

- AI quickly builds a playable Godot mini-game.
- A human plays it and gives warm, practical feedback.
- AI improves the game and brings back a better version.
- Repeat until it feels genuinely fun.

## What This Repo Is For

- Fast game prototyping with AI
- Human feedback-driven refinement
- Iterative quality improvement (design, mechanics, visuals, sound)

## Sample Games

<a href="https://abagames.github.io/ai-builds-games-humans-refine/games/prooffall-cascade/build/web/index.html"><img src="https://github.com/abagames/ai-builds-games-humans-refine/raw/main/docs/games/prooffall-cascade/screenshot.gif" width="25%" loading="lazy"></a><a href="https://abagames.github.io/ai-builds-games-humans-refine/games/warp-chase-holdline/build/web/index.html"><img src="https://github.com/abagames/ai-builds-games-humans-refine/raw/main/docs/games/warp-chase-holdline/screenshot.gif" width="25%" loading="lazy"></a><a href="https://abagames.github.io/ai-builds-games-humans-refine/games/polarity-lasso-chain/build/web/index.html"><img src="https://github.com/abagames/ai-builds-games-humans-refine/raw/main/docs/games/polarity-lasso-chain/screenshot.gif" width="25%" loading="lazy"></a><a href="https://abagames.github.io/ai-builds-games-humans-refine/games/chain_circuit_vault/build/web/index.html"><img src="https://github.com/abagames/ai-builds-games-humans-refine/raw/main/docs/games/chain_circuit_vault/screenshot.gif" width="25%" loading="lazy"></a>

## Workflow Overview

`AGENTS.md` defines a 9-phase workflow for generating and refining a mini-game:

1. Phase 1: Randomly choose mechanic, visual, and structure tags, plus the number of button types.
2. Phase 2: Turn those tags into a concrete game design with rules, controls, and state definitions.
3. Phase 3: Define the visual direction, palette, composition, and non-text feedback rules.
4. Phase 4: Design procedural sound effects and event-to-sound mappings.
5. Phase 5: Implement the game in Godot from the base template, following headless and structure rules.
6. Phase 6: Run headless tests and evaluate whether skillful play beats monotonous input.
7. Phase 7: Write an evaluation report with multiple improvement options, without changing the implementation.
8. Phase 8: Apply human feedback, re-test, and export the updated game for further iteration.
9. Phase 9: On explicit human request, publish the approved game to `docs/games/` for GitHub Pages.
