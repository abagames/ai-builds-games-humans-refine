# Visual Design Guide

A guide for designing the visual layer of action mini-games using visual tags as creative seeds. Parallel to `.agents/skills/mini-game-design/references/mini-game-design-guide.md` (which covers mechanics), this document covers screen composition, rendering style, feedback effects, and visual coherence.

## 1. Design Challenges

- Establishing a visually distinctive identity with minimal art assets.
- Ensuring gameplay readability — every object's role must be instantly recognizable.
- Making action feedback (hits, scoring, danger) feel satisfying through visuals alone.
- Maintaining visual coherence when combining multiple tag directions.

## 2. Four Core Visual Principles and Evaluation Criteria

### (1) Readability

- Principle: The player must instantly distinguish their character, threats, collectibles, and safe zones. Use contrast in color, brightness, size, and motion — not labels or icons.
- Evaluation: Can a first-time player identify every object's role within 2 seconds of seeing it?

### (2) Feedback Clarity

- Principle: Every meaningful game event (scoring, damage, near miss, state change) must produce a visible response. The magnitude of visual response should match the magnitude of the event.
- Evaluation: Can the player tell what happened without looking at the score counter? Is the difference between "scored 1 point" and "scored 10 points" visually obvious?

### (3) Aesthetic Coherence

- Principle: All visual elements — objects, background, particles, UI — must feel like they belong to the same world. A shared rendering style (stroke weight, color temperature, motion quality) unifies the screen.
- Evaluation: Does any element feel visually out of place? Would removing any one element break the visual identity?

### (4) Dynamic Life

- Principle: Nothing on screen should be perfectly static. Subtle motion (breathing, pulsing, drifting) keeps the world alive. Object motion should communicate physics and weight, not just position change.
- Evaluation: Does the game feel alive even when the player is not pressing anything? Do objects feel like they have mass and inertia?

## 3. Role of Visual Tags

Visual tags follow the same philosophy as mechanism tags (see `.agents/skills/mini-game-design/references/mini-game-design-guide.md` §5):

- **Stimulus, not constraint**: Tags suggest a visual direction; the final design may depart from them.
- **Contradiction is opportunity**: Conflicting tags create unique visual identities (see §7).
- **Deviation allowed**: No problem if the final visual cannot be explained by tags alone.
- **Purpose**: Prevents LLM from defaulting to generic visual styles.

## 4. Visual Tag Categories

### 4.1 Category Overview

| Category | Role | Design Impact |
|:---|:---|:---|
| `render-*` | How objects are drawn | Stroke style, fill, outline treatment for all game objects |
| `geometry-*` | Shape language | What primitives and compositional rules define the visual vocabulary |
| `motionviz-*` | Motion visualization | How movement, impact, and energy are made visible |
| `background-*` | Background treatment | Dynamic backdrop style and atmospheric depth |
| `lighting-*` | Light and atmosphere | Edge glow, depth cues, fog, bloom compositing |
| `analog-*` | Organic imperfection | Jitter, shimmer, noise, chromatic artifacts |
| `typography-*` | Text integration | How scores, labels, and glyphs exist in the game world |
| `composition-*` | Screen layout | Spatial organization, negative space, visual hierarchy |

> Note: Typography implementation and font licensing policy (including Web export redistribution) is defined in `.agents/skills/godot-web-typography/references/typography-implementation-guide.md`.

### 4.2 Category Interaction Map

Categories are not independent. Typical synergies:

| Combination | Effect |
|:---|:---|
| `render-*` + `lighting-*` | Render style defines edges; lighting adds atmosphere on top |
| `geometry-*` + `composition-*` | Shape vocabulary fills the spatial structure defined by composition |
| `motionviz-*` + `analog-*` | Motion effects gain organic texture from analog imperfections |
| `background-*` + `lighting-*` | Background and lighting together define the depth/atmosphere stack |
| `typography-*` + `geometry-*` | Glyphs become geometric entities when both tags are present |

## 5. Procedure for Visual Design from Tags

Design in the following order after the core mechanics are defined.

1. **Tag Interpretation**: Read each tag's `description` and `keywords`. Verbalize the mood, texture, and motion quality they suggest.
2. **Cross-Tag Synthesis**: Find the visual theme that unifies all selected tags. Express it in one phrase (e.g., "pulsing neon organisms," "crisp geometric clockwork").
3. **Mechanics Integration**: Identify where visual style intersects with game mechanics:
   - Which visual technique best communicates the core mechanic?
   - Which game events deserve the strongest visual response?
   - Does the visual style suggest new feedback opportunities the mechanics design didn't consider?
4. **Palette Decision**: Choose 3–5 colors derived from the tag mood. Assign each color a gameplay role. Typical roles include Player, Threat, Background, Positive feedback, Warning — but adapt roles to the game's actual needs (e.g., a game with state-switching may need State-A / State-B instead of fixed Threat / Warning).
5. **Layer Structure**: Define visual depth layers:
   - Background (atmospheric, low contrast)
   - Play field (mid layer, primary action)
   - Foreground effects (particles, flashes, UI)
6. **Feedback Mapping**: For each game event, define the visual response using the tag style:
   - Score gain → (e.g., additive glow burst, ripple expansion)
   - Damage / game over → (e.g., chromatic split, screen shake)
   - Near miss → (e.g., subtle rim flash, trail intensification)
   - State change → (e.g., palette shift, geometry transformation)
7. **Checklist Verification**: Confirm with the checklist in §10.

## 6. Mechanics × Visual Integration Patterns

Visual design is not decoration — it communicates game state. The following patterns show how visual tags directly serve gameplay.

### 6.1 Game Feel Techniques

Apply these to **all objects** (player, enemies, obstacles, items), not just the player. Consistent application across objects creates a cohesive "lively" world.

| Technique | Description | Relevant Visual Tags |
|:---|:---|:---|
| **Squash & Stretch** | Deform objects on impact, jump, landing. Idle objects breathe subtly. | `motionviz-elastic-deformation`, `analog-micro-jitter` |
| **Dynamic Tilt** | Tilt objects toward movement direction. Spinning enemies rotate with velocity. | `motionviz-rotation-reactive`, `geometry-diagonal-dominance` |
| **Afterimage Trail** | Leave fading copies during fast movement. Apply to enemies and projectiles too. | `motionviz-afterimage-trail`, `analog-frame-blend` |
| **Impact Particles** | Scatter fragments on collision, destruction, landing, spawning. | `motionviz-impact-ripple`, `background-particle-layer` |
| **Glow Buildup** | Gradually intensify glow to telegraph danger or charge state. | `motionviz-energy-glow-build`, `lighting-additive-glow` |

### 6.2 Mechanic-to-Visual Mapping Examples

| Mechanism Tag | Visual Tag | Combined Effect |
|:---|:---|:---|
| `player-rotate` | `motionviz-velocity-hue-shift` | Color shifts with rotation speed — faster = warmer hue |
| `weapon-ray` | `render-glow-outline` | Laser rendered as bright emissive line with bloom halo |
| `obstacle-chase` | `motionviz-afterimage-trail` | Pursuing enemies leave ghost trails showing trajectory |
| `on_holding-charge` | `motionviz-energy-glow-build` | Held button builds visible glow around player |
| `field-auto_scroll` | `background-flow-lines` | Scrolling direction visualized by flowing streamlines |
| `rule-combo_multiplier` | `typography-numeric-focus` | Combo counter grows in size/brightness with multiplier |
| `on_pressed-reverse_state` | `analog-chromatic-offset` | State flip triggers brief RGB split across entire screen |
| `player-bounce` | `motionviz-elastic-deformation` | Bouncing object squashes on contact, stretches in air |

## 7. Visual Tag Contradiction and Creative Tension

When contradicting visual tags are given, invent a unified style, don't pick one.

| Contradiction | Conventional Approach | Creative Interpretation |
|:---|:---|:---|
| `render-wireframe-lines` + `lighting-additive-glow` | Choose wireframe OR glow | Wireframe lines that glow additively — luminous skeletal forms |
| `composition-negative-space` + `geometry-primitive-modularity` | Sparse OR dense | Dense clusters isolated in vast empty space — "islands of complexity" |
| `analog-micro-jitter` + `geometry-grid-alignment` | Organic OR geometric | Grid-locked positions that tremble with analog vibration — "restless order" |
| `background-noise-field` + `composition-centered-stage` | Noisy OR clean | Clean center surrounded by noisy periphery — noise as vignette |
| `typography-kinetic-motion` + `render-uniform-stroke` | Dynamic text OR static lines | Text moves but maintains uniform stroke — disciplined kinetics |

**Principle**: Same as mechanism tags — don't resolve the contradiction, invent a new concept that makes both true simultaneously.

## 7.1 VISUAL_DESIGN.md Required Addendum Template (AI-Generated Look Suppression)

When producing a visual design document, include the following section template verbatim and fill each field.

```markdown
## 7. AI-Generated Look Suppression Rules

### 7.1 Visual Hierarchy Rules

- Protagonist:
- Threat:
- Reward:
- 2-second recognition check:

### 7.2 Limits on Familiar Template Symbols

- Adopted familiar elements (max 2):
- Replaced unique element:

### 7.3 UI-Independent Feedback

| Event | Non-UI visual response | Intensity (Low/Med/High) |
| :---- | :--------------------- | :----------------------- |
| Score | ...                    | ...                      |
| Damage | ...                   | ...                      |
| Near miss | ...                | ...                      |

### 7.4 Composition and Gaze Guidance

- Initial focal point:
- Visual flow:
- Anti-center-clutter implementation:
```

## 8. Godot Implementation Patterns

The patterns below are **starter examples**, not an exhaustive catalog. Combine, modify, and invent new effects per game. Reusing the same set across games produces visual monotony.

### 8.1 Rendering Approaches

| Visual Tag Category | Godot Implementation |
|:---|:---|
| `render-*` (outlines, strokes) | `_draw()` with `draw_arc()`, `draw_polyline()`, `draw_line()` |
| `render-*` (glow, bloom) | `WorldEnvironment` + `Environment.glow_enabled` or `ShaderMaterial` |
| `geometry-*` | `_draw()` primitives, or `Polygon2D` nodes |
| `motionviz-*` | GDScript logic in `_process()` + `_draw()`, or `GPUParticles2D` |
| `background-*` | `ParallaxBackground` + `ShaderMaterial` for procedural effects |
| `lighting-*` | `PointLight2D`, `CanvasModulate`, or shader-based post-processing |
| `analog-*` | `ShaderMaterial` on `CanvasLayer` for screen-space effects |
| `typography-*` | `Label` / `RichTextLabel` with custom fonts, or `_draw()` for glyphs as geometry |
| `composition-*` | Layout through node positioning, `Camera2D` framing, `Marker2D` guides |

### 8.2 Common Shader Patterns

```gdscript
# Chromatic offset (analog-chromatic-offset)
shader_type canvas_item;
uniform sampler2D screen_texture : hint_screen_texture, filter_linear_mipmap;
uniform float offset_amount : hint_range(0.0, 5.0) = 1.5;

void fragment() {
    vec2 uv = SCREEN_UV;
    float r = texture(screen_texture, uv + vec2(offset_amount / 1000.0, 0.0)).r;
    float g = texture(screen_texture, uv).g;
    float b = texture(screen_texture, uv - vec2(offset_amount / 1000.0, 0.0)).b;
    COLOR = vec4(r, g, b, 1.0);
}
```

```gdscript
# Noise field background (background-noise-field)
shader_type canvas_item;
uniform float time_scale : hint_range(0.1, 5.0) = 1.0;
uniform float grain_intensity : hint_range(0.0, 1.0) = 0.15;

void fragment() {
    float noise = fract(sin(dot(UV + TIME * time_scale, vec2(12.9898, 78.233))) * 43758.5453);
    COLOR = vec4(vec3(noise * grain_intensity), 1.0);
}
```

### 8.3 Particle and Trail Patterns

```gdscript
# Impact ripple (motionviz-impact-ripple)
class RippleEffect extends Node2D:
    var radius: float = 0.0
    var max_radius: float = 60.0
    var lifetime: float = 0.4
    var age: float = 0.0
    var color: Color = Color.CYAN

    func _process(delta):
        age += delta
        radius = max_radius * (age / lifetime)
        if age >= lifetime:
            queue_free()
        queue_redraw()

    func _draw():
        var alpha = 1.0 - (age / lifetime)
        draw_arc(Vector2.ZERO, radius, 0, TAU, 64, Color(color, alpha), 2.0)
```

```gdscript
# Afterimage trail (motionviz-afterimage-trail)
var trail_positions: Array[Vector2] = []
const TRAIL_LENGTH = 8

func _process(delta):
    trail_positions.push_front(global_position)
    if trail_positions.size() > TRAIL_LENGTH:
        trail_positions.resize(TRAIL_LENGTH)
    queue_redraw()

func _draw():
    for i in range(trail_positions.size()):
        var alpha = 1.0 - float(i) / TRAIL_LENGTH
        var size = base_size * (1.0 - float(i) / TRAIL_LENGTH * 0.5)
        draw_circle(to_local(trail_positions[i]), size, Color(color, alpha * 0.4))
```

### 8.4 Dynamic Background Patterns

```gdscript
# Flow lines (background-flow-lines)
var flow_particles: Array[Dictionary] = []

func _ready():
    for i in range(40):
        flow_particles.append({
            "pos": Vector2(randf() * get_viewport_rect().size.x,
                          randf() * get_viewport_rect().size.y),
            "speed": randf_range(20.0, 60.0),
            "length": randf_range(10.0, 30.0),
        })

func _process(delta):
    for p in flow_particles:
        p.pos.x += p.speed * delta
        if p.pos.x > get_viewport_rect().size.x + p.length:
            p.pos.x = -p.length
            p.pos.y = randf() * get_viewport_rect().size.y
    queue_redraw()

func _draw():
    for p in flow_particles:
        var end = p.pos + Vector2(p.length, 0)
        draw_line(p.pos, end, Color(1, 1, 1, 0.1), 1.0)
```

### 8.5 Screen-Space Effect Patterns

```gdscript
# Screen shake (feedback on damage/impact)
var shake_intensity := 0.0
var shake_decay := 5.0

func trigger_shake(intensity: float) -> void:
    shake_intensity = intensity

func _process(delta: float) -> void:
    if shake_intensity > 0.1:
        offset = Vector2(randf_range(-1.0, 1.0), randf_range(-1.0, 1.0)) * shake_intensity
        shake_intensity = lerpf(shake_intensity, 0.0, shake_decay * delta)
    else:
        offset = Vector2.ZERO
        shake_intensity = 0.0
```

```gdscript
# Pulse/breathe animation (dynamic life for any object)
var base_scale := Vector2.ONE
var pulse_speed := 2.0
var pulse_amount := 0.05

func _process(delta: float) -> void:
    var t := sin(Time.get_ticks_msec() / 1000.0 * pulse_speed) * pulse_amount
    scale = base_scale * (1.0 + t)
```

### 8.6 Color and State Transition Patterns

```gdscript
# Smooth palette shift on state change
var target_color := Color.WHITE
var current_color := Color.WHITE
const COLOR_LERP_SPEED := 4.0

func set_state_color(new_color: Color) -> void:
    target_color = new_color

func _process(delta: float) -> void:
    current_color = current_color.lerp(target_color, COLOR_LERP_SPEED * delta)
    modulate = current_color
```

```gdscript
# Flash on hit (brief brightness spike then restore)
func flash_hit() -> void:
    modulate = Color(3.0, 3.0, 3.0, 1.0)  # HDR white
    var tween := create_tween()
    tween.tween_property(self, "modulate", Color.WHITE, 0.15)
```

## 9. Output Format

Output in the following format to the project's visual design document, e.g. `tmp/games/<slug>/VISUAL_DESIGN.md` in this repository.

```markdown
# Visual Design: <GAME_NAME>

**Visual Tags**: #vtag1, #vtag2

## 1. Visual Concept

<Overall mood and direction in one phrase>

## 2. Color Palette

| Role | Color | Hex | Usage |
|:---|:---|:---|:---|
| <role_1> | ... | #... | ... |
| <role_2> | ... | #... | ... |
| <role_3> | ... | #... | ... |

Assign 3–5 roles based on the game's actual needs (e.g., Player, Threat, Background, Positive feedback, Warning — or substitute with game-specific roles like State-A / State-B).

## 3. Object Rendering Specifications

<Drawing style for each object, with reference to visual tags>

## 4. Background & Environment

<Dynamic background expression, layer structure>

## 5. Feedback Effects

| Event | Visual Response | Tag Reference |
|:---|:---|:---|
| Score gain | ... | ... |
| Damage | ... | ... |
| Near miss | ... | ... |
| Game over | ... | ... |
| State change | ... | ... |

## 6. Relationship with Visual Tags

<How each tag influenced the design decisions>
```

## 10. Visual Design Quality Checklist

Confirm the following before completing visual design.

- [ ] Can every object's role (player, threat, collectible, environment) be identified at a glance?
- [ ] Does every game event (score, damage, near miss) have a distinct visual response?
- [ ] Do all visual elements share a coherent style (consistent stroke, color temperature, motion quality)?
- [ ] Does the screen feel alive even during idle moments (subtle motion, breathing, ambient effects)?
- [ ] Is the visual style grounded in the selected tags while going beyond literal interpretation?
- [ ] Does the visual design enhance gameplay readability rather than compete with it?

## Appendix: Visual Anti-Patterns

Avoid the following:

### ❌ Decoration Without Function

```
Adding particles and glow everywhere without connecting them to game events.
Visual noise that obscures gameplay readability.
```

### ❌ Literal Tag Interpretation

```
Tag says "wireframe" → make everything wireframe with no variation.
Tags are seeds, not specifications. Interpret, combine, and transcend.
```

### ❌ Style Inconsistency

```
Player drawn with glow outlines, enemies drawn with solid fills, background uses pixel art.
All elements must share the same visual language.
```

### ❌ Static Feedback

```
Score gain shows a "+10" text and nothing else.
Events need motion, color, and spatial response — not just UI text.
```

### ❌ Ignoring Mechanics

```
Beautiful visual design that doesn't help the player understand the game.
Visuals must serve readability and feedback, not just aesthetics.
```
