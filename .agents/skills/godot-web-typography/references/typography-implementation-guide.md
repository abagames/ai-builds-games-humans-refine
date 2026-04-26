# Typography Implementation Guide (Godot Web)

Implementation guide for stylish text rendering in Godot 4.2+ action mini-games while staying consistent with visual design.
This guide covers unified management via `Theme`, text effect design, and font-license handling for Web export.

## 1. Purpose

- Design UI/HUD/effect text using the same visual language as the game concept.
- Balance readability with symbolic style and atmosphere.
- Prevent license issues in Web distribution.

## 2. Design Principles (Connected to Visual Design)

1. Role separation
- Split display roles into `Heading / Info / Numeric / Emphasis`.
- Fix size/weight/color/motion rules per role.

2. Consistency
- Keep text in the same world as the rest of visuals by matching stroke quality, color temperature, and motion quality.

3. Readability first
- For critical info (HP, score, warnings), prioritize readability speed over decoration.
- On noisy backgrounds, secure contrast with outlines/shadows.

4. State communication
- Use text as a state indicator, not decoration.
- Provide visual reactions for score gain, damage, danger, combos, etc.

## 3. Phased Implementation Flow

Typography is usually implemented in two stages: a fallback-font stage during early implementation, then a full font-adoption stage after the game feel and visual direction are stable.

### Initial implementation

- Implement with `ThemeDB.fallback_font` only (no external font bundling).
- Define role-based size/color tokens in a `Theme` resource (see §4).
- Keep font slots empty and finish layout/effect logic first.
- Record in `TYPOGRAPHY_DECISION.md` that fonts are not selected yet and fallback is in use.

### Full font adoption

- Compare and select fonts using human feedback.
- Bundle only adopted fonts into `res://assets/fonts/` (no bulk candidate bundling).
- Complete license checks and bundling following §7.
- Record rationale/comparison/license info in `TYPOGRAPHY_DECISION.md`.
- Update `THIRD_PARTY_LICENSES.md` and `licenses/`.

## 4. Unified Font Management via Theme

In Godot, treat `Theme` as the typography unit for the project.

### 4.1 Recommended Token Set

- Font families:
  - `font_ui_base` (body/general)
  - `font_ui_display` (headings/effects)
  - `font_ui_numeric` (score/timer)
- Sizes:
  - `size_xs`, `size_sm`, `size_md`, `size_lg`, `size_xl`
- Colors:
  - `text_primary`, `text_muted`, `text_positive`, `text_warning`, `text_danger`
- Effects:
  - `outline_size`, `outline_color`, `shadow_size`, `shadow_color`

### 4.2 Operational Rules

1. Define globally in `Theme` first; minimize per-node overrides.
2. Keep heading/body to at most two families; at most three including numeric.
3. Reuse same token for same semantic meaning (e.g., all warning text uses `text_warning`).
4. Avoid readability-breaking decoration (excessive glow, heavy blur).

## 5. Implementation Patterns (Godot 4.2+)

### 5.1 Basics

- Set `FontFile` in `Theme` and apply globally to UI.
- Use `theme_override_*` in `Label`/`RichTextLabel` only for exceptions.
- Use monospaced or stable-width fonts for numeric HUD.

### 5.2 Practical Styling

- Edge emphasis: small outlines for background separation.
- Layer feel: subtle shadows for depth.
- State color: shift to warm hue only during danger.
- Kinetic display: brief scale/position change only during combos.
- Contextual decoration: emphasize only on important events.

### 5.3 Choosing `_draw()` Text Rendering

- Normal UI: `Label`/`RichTextLabel` (maintainability first)
- Effect UI: `CanvasItem._draw()` + `draw_string()` (effect first)
- Rule: informational text is node-based, effect text is draw-based.

### 5.4 `draw_string()` Layout Notes (Important)

- `draw_string()` `position` is baseline-based, not visual-center based.
- With `HORIZONTAL_ALIGNMENT_CENTER`, `width=-1` may not center as expected.
- For center-fixed text (e.g., `GAME OVER`), use one of:
  1. Set `width = viewport_width` and center-align drawing.
  2. Measure text with `font.get_string_size()` and manually apply `x -= width / 2`.
- Extra shadow/outline draws shift visual center to bottom-right; verify final placement on screen.

## 6. Mapping to Visual Tags

- `typography-*`: primary axis for font selection, spacing, and motion behavior
- `render-*`: consistency of outline/fill/line quality
- `lighting-*`: compatibility with glow/additive expressions
- `analog-*`: subtle jitter/aberration only on events
- `composition-*`: whitespace and gaze-guidance for text placement

## 7. License Operation for Web Export

### 7.1 Recommended Licenses

- `SIL Open Font License 1.1 (OFL)`
- `Apache License 2.0`
- `Ubuntu Font Licence`

### 7.2 Pre-Adoption Checklist

- [ ] Redistribution (bundling) is explicitly permitted
- [ ] Embedding use is permitted
- [ ] Commercial-use conditions are satisfied
- [ ] Naming conditions for modifications are understood (e.g., OFL RFN)
- [ ] License-text bundling requirement can be met

### 7.3 Bundling Steps

1. Place fonts in `res://assets/fonts/`
2. Place corresponding license texts in `res://licenses/fonts/`
3. Verify export settings so non-resource text files are not dropped
4. Document font name/source/license in `THIRD_PARTY_LICENSES.md`
5. Confirm code no longer relies only on `ThemeDB.fallback_font`; explicitly load `FontFile`

## 8. Recommended Directory Structure

```text
res://
  assets/fonts/
    UiBase-Regular.ttf
    UiDisplay-Bold.ttf
    UiNumeric-Semibold.ttf
  themes/
    default_theme.tres
  licenses/fonts/
    OFL-UiBase.txt
    LICENSE-UiDisplay.txt
```

## 9. Required Deliverables per Game

For each game project, record the typography decision and license state. In this repository, the target path is `tmp/games/<slug>/`.

- `VISUAL_DESIGN.md`
  - Document typography policy (roles, size hierarchy, colors, effect rules)
- `THIRD_PARTY_LICENSES.md`
  - Document font source and license
- `licenses/`
  - Include full license texts for used fonts

## 10. Review Checklist

- [ ] UI text follows the same visual grammar as the visual concept
- [ ] HUD readability remains acceptable during intense action
- [ ] Emphasis effects are event-driven, not always-on
- [ ] Font/color/size are centrally managed by Theme
- [ ] Web distribution license bundling is completed
- [ ] Center-fixed text (e.g., game over) is visually centered in real rendering (`draw_string` align/width checked)
- [ ] Baseline-derived Y offset is within acceptable range
- [ ] After headless tests pass, UI layout is still correct in real Web rendering

## 11. Web Visual Check (Required)

Headless tests can miss typography placement drift. After Web export, check at minimum:

- HUD remains readable in both 16:9 and tall-ish windows
- Center text like `GAME OVER` is truly centered
- Decorations (shadow/outline/color separation) do not hurt readability

## 12. Anti-Patterns

- Per-node font settings that break global consistency
- No role separation for heading/body/numeric, reducing readability
- Always-on animation that destroys information priority
- Bundling fonts without license verification
- Assuming `draw_string` align alone guarantees centering and skipping visual confirmation
