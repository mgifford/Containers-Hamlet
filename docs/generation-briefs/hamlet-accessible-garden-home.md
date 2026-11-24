# Generation brief — Accessible Garden Home

- Model: `hamlet-accessible-garden-home`
- Design hash: `98e11bf7` · scene hash: `61536ceb`
- Review gate: [image-review-accessible-garden-home-v2-2026-11-23.md](../image-review-accessible-garden-home-v2-2026-11-23.md)
- Status: brief only; nothing here is a construction drawing or a published image.

## Model facts

- Modules: 2 modules: 20ft + 20ft; nominal 6.058 × 2.438 m at 0.6 m
- Cladding: timber
- Roof: canopy, 0°, 1.2 m overhang
- Porch p1: 4.6 × 2.8 m on the south face, roofed
- Envelope: 205 mm added outside the steel; 209 mm total wall; 250 mm roof; 200 mm floor
- Interior: authored — opening-room-mapping-unresolved
- Site: homesite e (concept placement); use the site brief for the world view — the design-local view angle is not the site bearing

## References

- `site/design-lab/views/hamlet-accessible-garden-home-site-facing.svg`
- `site/design-lab/views/hamlet-accessible-garden-home-interior-plan.svg`

## Images

### accessible-garden-home-exterior-hero — Accessible Garden Home — garden approach and terrace (ready)

- Design hash: `98e11bf7` · scene hash: `61536ceb`
- Reference: `site/design-lab/views/hamlet-accessible-garden-home-site-facing.svg`
- Patterns: 112, 155, 163 (primary)
- Pattern cue: Entrance Transition, Old Age Cottage and Outdoor Room: a step-free, sheltered arrival and a terrace that works as an outdoor room.
- Risk: medium · seed: `865419585`

**Prompt**

```text
Photorealistic architectural visualization of the Accessible Garden Home, a compact single-storey double-width home of two 20 ft timber modules. Camera at 1.6 m on the garden approach at the south-west corner, 35 mm lens, framing both modules, the canopy roof, covered terrace and level route. Two 6.06 x 2.44 m modules at 0.6 m, canopy with a 1.2 m overhang, covered south terrace 4.6 x 2.8 m, level terrace projecting 1.2 m, south step-free entrance, garden sliding doors, east utility door, internal 1.4 m opening and one corner casting. Conceptual gutter, downspout, ember vent and defensible-space planting; fern, hemlock and distant lake light. Soft daylight. One canopy roof, no dormer; exposed helical piles, no stone base; no steps or ramp; visible steel corner castings; forest, no waterfront. Each 20 ft module is finished about 6.47 x 2.85 m with 205 mm external insulation, drained cavity and rainscreen; deep reveals; not a bare container. No people, no text, no watermark.
```

**Negative prompt**

```text
third module, second storey, ramp, lift, stair, level change, fully accessible claim, code compliance label, grab bar, handrail, chimney, wood stove, hydrant, fire cistern, installed PV array, solar panels, noncombustible deck claim, potable water label, battery, inverter, people, text, watermark, cartoon, illustration, painting, low resolution, distorted geometry, blurry, oversaturated colors, HDR halos, floating objects, duplicate elements
```

**Must show**

- [modeled] two 20 ft modules side by side, timber, at 0.6 m; a 6.06 m double-width footprint
- [modeled] finished external envelope: 150 mm mineral wool + 10 mm thermal break + 25 mm drained cavity + 20 mm cladding (about 205 mm added per side), with deep window reveals and a clad wall, not a bare container
- [modeled] canopy roof with a 1.2 m overhang
- [modeled] covered terrace p1 4.6 x 2.8 m on the south face of m2
- [modeled] level terrace d1 projecting 1.2 m; no step to the garden
- [modeled] south step-free entrance (1.0 m) and garden sliding doors (2.4 m); east utility door
- [modeled] the internal 1.4 m opening between the modules, visible as a glazed or open connection
- [inferred] one visible corner casting at the terrace edge
- [conceptual] a gutter and one downspout at the canopy edge
- [modeled] fern, hemlock and a distant plane of lake light; more forest than water

**Must not show**

- a third module or a second storey — Two modules and one storey are modeled.
- a ramp, lift or stair — The home is single-storey and step-free; no ramp or lift is modeled.
- a fully accessible, code-compliant or certified-accessible claim — Accessibility is a potential, not a verified assessment.
- a chimney, stove, hydrant or fire cistern — None is recorded or verified.
- an installed PV array — No installed PV is recorded.
- a noncombustible deck claim — The deck is not recorded as noncombustible.

### accessible-garden-home-interior-hero — Accessible Garden Home — living, kitchen and link (blocked-pending-reconciliation)

- Design hash: `98e11bf7` · scene hash: `61536ceb`
- Reference: `site/design-lab/views/hamlet-accessible-garden-home-interior-plan.svg`
- Patterns: 127, 155, 159 (primary)
- Pattern cue: Intimacy Gradient and Old Age Cottage: an accessible, public-to-private sequence with daylight from more than one direction.

**Blocked.** Do not generate this view until the interior is reconciled.

- modules[1].openings[m2-s1] is named Step-free entrance but its position (1.6 m) falls in the authored bedroom band of m2, not the living/kitchen module.
- modules[1].openings[m2-s2] is named Garden doors but its position (4.4 m) falls in the authored bathroom band of m2.
- modules[0].openings[m1-s1] and modules[1].openings[m2-n1] are named internal openings to the other module, but the authored link is the 1.0 m door e-d4 in partition e-link; the two internal openings are not the link.
- The authored rooms put living and kitchen in m1 and bedroom and bathroom in m2, while the entrance, garden doors and covered terrace are on m2.
- The authored 1.0 m link door e-d4 sits in the interface partition, but the entrance and garden doors remain on the module whose rooms are bedroom and bathroom.

**Must show**

- [modeled] the authored rooms: living, kitchen and store in m1; bedroom and bathroom in m2
- [modeled] a 1.0 m link door between the kitchen and the bedroom module
- [modeled] the 1.5 m bathroom turning circle
- [modeled] the kitchen counter (1.8 x 0.55 m) and the living table (0.7 x 0.7 m) only
- [conceptual] a neutral lining and the flat container ceiling

**Must not show**

- a fully accessible, code-compliant or certified-accessible claim — The home is potentially adaptable, not verified.
- loose furniture, rugs, lamps, plants or dishes — Only modeled fixtures may be shown.
- a second entrance or garden doors in the living module — The recorded entrance and garden doors are on m2, which the authored rooms use for bedroom and bathroom; the assignment is unresolved.
- grab bars or a transfer seat not in the model — Only the turning circle is modeled; no grab bars are recorded.
- a stair, lift or level change — The home is single-storey.
- a service core, hood or HRV terminal — No service-core geometry is modeled.

## Review gate

Do not publish an image from this brief until the review record is cleared, the specific known deviations are recorded, and the image has been checked against the model. The prompt is not a substitute for the reference drawing or a 3D model.
