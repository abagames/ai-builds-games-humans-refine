---
name: headless-godot
description: "Headless Godot (4.2+) development rules: CLI conventions, export, scene editing via script, and testing. Use when running Godot CLI commands, editing .tscn via script, or exporting in headless mode."
---

Rules for making headless Godot (4.2+) development reproducible, avoiding drift and environment-specific failures.

Scope:
- Godot 4.2+ (Godot 3.x is out of scope)

Required rules (highest priority):
- Always use `--headless --path <PROJECT_DIR>` (removes `cwd` dependency)
- Always capture logs: `2>&1 | tee logs/<name>.log`
- In sandbox/CI, or after `user://` / XDG write failures, use project-local `XDG_DATA_HOME`, `XDG_CONFIG_HOME`, and `XDG_CACHE_HOME`
- Never edit `.tscn` as raw text (edits must go through `--headless --script`)
- For repeated validation commands, standardize them as `tools/*.sh`; after manual tweaks, re-run via the same scripts
- If `res://tools/godot_apply_patch.gd` is missing, copy `.agents/skills/headless-godot/tools/godot_apply_patch.gd` to `<PROJECT_DIR>/tools/godot_apply_patch.gd` before running patch commands
- Keep startup smoke and logic tests separate: smoke starts `run/main_scene`; `run_tests.gd` holds project-specific logic checks

If you get stuck, provide:
- Full command lines and `logs/*.log`
- `godot --version` output
- Whether `export_presets.cfg` exists (when exporting)

Out of scope:
- GUI/OS-specific setup beyond the project-local XDG wrapper
- Level design, render validation, performance tuning
- Game-specific scoring, win/loss rules, controls, and simulation policies

When you need details, read these files (relative to this skill's base directory):
- `skills/headless_cli.md` — CLI conventions, XDG setup, known warnings
- `skills/export_and_import.md` — export/import rules
- `skills/scene_editing_via_godot.md` — safe `.tscn` editing, patch JSON schema and operations
- `skills/testing_headless.md` — headless testing strategy

If unsure about Godot CLI or features, consult:
- https://docs.godotengine.org/en/4.4/tutorials/editor/command_line_tutorial.html
- https://docs.godotengine.org/en/4.4/tutorials/export/exporting_for_dedicated_servers.html
- https://docs.godotengine.org/en/stable/tutorials/export/exporting_projects.html
