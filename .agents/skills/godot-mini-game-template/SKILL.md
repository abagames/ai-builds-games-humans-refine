---
name: godot-mini-game-template
description: "Scaffold a minimal Godot mini-game project from a reusable infrastructure-only template. Use when starting a Godot 4.2+ mini-game that needs headless tests, Web export defaults, canvas shell, telemetry helpers, and procedural audio primitives."
---

Use this skill to initialize a Godot mini-game from the bundled base project.

Template path:
- `assets/godot-base/`

Core rules:
- The template is infrastructure only. Do not treat it as gameplay, visual identity, or audio identity.
- Implement game-specific mechanics, visuals, and SFX in the target project after copying.
- Keep `main.gd` as orchestration and split responsibilities into focused scripts.
- Preserve Web export canvas sizing rules unless the project updates `project.godot`, `export_presets.cfg`, and `web/custom_shell.html` together.
- Do not hardcode machine-specific export template paths in the bundled template. After copying, a project may set `custom_template/debug` and `custom_template/release` to absolute local paths when using project-local XDG directories.

Typical start:

```bash
cp -r .agents/skills/godot-mini-game-template/assets/godot-base/ tmp/games/<slug>/
```

After copying, use `headless-godot` for scene editing, runtime verification, and Web export.
Read `assets/godot-base/TEMPLATE_SCOPE.md` before changing the template itself.
