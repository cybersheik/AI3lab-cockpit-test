# AI³Lab Agent Avatar — Canonical Specification v1.0

## NEVER DEVIATE FROM THIS SPEC WITHOUT HUMAN APPROVAL

## Visual Identity
Avatars are **ethereal, ghostly, holographic entities** — NOT solid objects.
Think: glowing nebulae, spirit orbs, holographic projections.

## Geometry Stack (per agent)
| Layer | Geometry | Radius | Opacity | Blending | Side |
|-------|----------|--------|---------|----------|------|
| Inner core | sphere | 0.4 | 0.20 | Additive | Front |
| Mid glow | sphere | 0.7 | 0.08 | Additive | BackSide |
| Outer halo | sphere | 1.2 | 0.04 | Additive | BackSide |
| Orbital ring | torus | 1.0/0.008 | 0.25 | Additive | Front |
| Particles | points ×75 | spread 0.8-1.2 | 0.9 | Additive | — |

## Color Palette (from appStore agents)
| Agent | Color | Role |
|-------|-------|------|
| Creator (Claude) | #4CAF50 green | Creation engine |
| Red Team (ChatGPT) | #FF5722 orange | Adversarial testing |
| Co-Creator (Gemini) | #9C27B0 purple | Creative partner |
| Coordinator (Qwen) | #2196F3 blue | Central orchestrator |

## Critical Rules
1. **ALL materials use AdditiveBlending** — no StandardMaterial, no Phong, no Lambert
2. **Maximum opacity for any solid geometry: 0.25** — nothing looks "solid"
3. **Particles are the primary visual**, spheres are just ambient glow
4. **Particle texture**: canvas-drawn radial gradient (white center → transparent edge)
5. **Particle size**: 0.04 with sizeAttenuation
6. **No ground planes, no platforms** — agents float in space
7. **Labels use glass-panel CSS** with agent border color and glow

## Animations
- Creator: gentle vertical float `sin(t * 0.8) * 0.15`
- Red Team: static position (stable threat)
- Co-Creator: subtle vertical float `sin(t * 1.2) * 0.08`
- Coordinator: slow rotation `t * 0.1`
- All: subtle pulse `scale = 1 + sin(t * 3) * 0.025`
- Particles: slow rotation `t * 0.2`

## Responsive
- Must work on screens from 6.7" (iPhone) to 15" (Tab S10)
- circleRadius adjusts based on viewport
- distanceFactor on Html labels: 4 (agents), 8 (coordinator)

## What NOT to do
- ❌ Solid-looking spheres (opacity > 0.3)
- ❌ CircleGeometry flat disks ("корытца")
- ❌ MeshStandardMaterial or any lit material
- ❌ Ground rings / platforms
- ❌ Thick orbital rings (max tube radius: 0.01)
- ❌ Changing this spec without explicit human approval
