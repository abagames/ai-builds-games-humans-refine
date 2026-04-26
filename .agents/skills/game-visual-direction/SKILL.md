---
name: game-visual-direction
description: "Design readable, coherent game visuals. Use when defining visual hierarchy, palette roles, screen composition, event feedback, or reducing generic AI-looking game art without relying on HUD text."
---

Use this skill to make game visuals communicate play state, not just decorate the screen.

Core rules:
- Establish one protagonist, one primary danger, and one primary reward signal before adding detail.
- Assign palette colors to gameplay roles.
- Feedback must be legible without UI text: motion, shape, impact, timing, contrast, and sound hooks should carry meaning.
- Keep the center readable; push noisy texture and secondary motion to the periphery unless the mechanic demands otherwise.
- Avoid familiar template symbols unless they are transformed by the game's visual logic.

Workflow:
1. Extract the mood, material, geometry, and motion implied by the game concept or visual constraints.
2. Synthesize one visual phrase for the whole game.
3. Map mechanics to visual state changes and feedback effects.
4. Choose a 3-5 color palette with explicit gameplay roles.
5. Validate readability, feedback clarity, coherence, and dynamic life.

Read `references/visual-design-guide.md` for detailed pattern tables, Godot implementation examples, and the anti-generic visual addendum template.
