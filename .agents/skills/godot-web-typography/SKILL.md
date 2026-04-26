---
name: godot-web-typography
description: "Implement readable, licensed typography for Godot Web games. Use when defining Theme-based text roles, adopting fonts, handling font licenses, or checking HUD readability."
---

Use this skill when a Godot game needs intentional text styling or font adoption.

Core rules:
- Centralize font, color, and size through `Theme`; minimize per-node overrides.
- Use explicit roles: Heading, Info, Numeric, and Emphasis.
- Keep HUD text informational; reserve emphasis treatments for events.
- Use stable-width numeric presentation for score, timers, and counters.
- Ensure text remains readable over motion or noisy backgrounds with outline, shadow, or contrast bands.
- Bundle only adopted fonts and include their license texts.

Workflow:
1. Start with `ThemeDB.fallback_font` during early implementation.
2. Define role tokens in a Theme resource.
3. During final adoption, compare candidate fonts against visual direction and readability.
4. Bundle only the chosen font files.
5. Update license docs and Web export checks.

Read `references/typography-implementation-guide.md` for Godot implementation patterns, directory structure, licensing steps, and review checklists.
