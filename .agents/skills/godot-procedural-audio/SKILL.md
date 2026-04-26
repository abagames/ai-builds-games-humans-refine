---
name: godot-procedural-audio
description: "Design and implement procedural audio for Godot games. Use when creating runtime SFX with Godot built-in audio APIs, mapping game events to timbre, or avoiding external audio assets."
---

Use this skill for Godot game audio that is synthesized or generated inside the project.

Core rules:
- Use Godot built-in audio only; avoid external audio files unless the project explicitly allows them.
- Keep event families semantically stable within a game: score, danger, damage, and state change should have distinct timbral identities.
- Vary waveform, pitch range, envelope, modulation, rhythm, and density between games instead of reusing a global beep vocabulary.
- Continuous sounds need explicit start, stop, and release behavior.
- Prefer simple generated sample streams when possible; use `AudioStreamGenerator` when real-time synthesis is required.

Workflow:
1. Derive sound character from the visual direction and mechanics.
2. Choose 1-2 base waveforms plus a modulation method.
3. Define event-to-timbre mappings.
4. Link dynamic parameters to combo, speed, danger, or difficulty.
5. Implement through a small audio responsibility module.

Read `references/sound-design-guide.md` for event catalogues, procedural audio patterns, and design checklists.
Reusable primitives are in `assets/audio_synth.gd`.
