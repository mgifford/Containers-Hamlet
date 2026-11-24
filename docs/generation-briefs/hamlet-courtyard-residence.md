# Generation brief — Courtyard Residence

- Model: `hamlet-courtyard-residence`
- Design hash: `30eb578a` · scene hash: `6669c001`
- Review gate: [image-review-courtyard-residence-2026-11-23.md](../image-review-courtyard-residence-2026-11-23.md)
- Status: brief only; nothing here is a construction drawing or a published image.

## Model facts

- Modules: 2 modules: 40ft + 40ft; nominal 12.192 × 2.438 m at 0.6 m
- Cladding: timber
- Roof: flat, 0°, 0.5 m overhang, green roof concept
- Porch p1: 6.4 × 2.8 m on the north face, roofed
- Envelope: 205 mm added outside the steel; 209 mm total wall; 250 mm roof; 200 mm floor
- Interior: provisional
- Site: homesite c (concept placement); use the site brief for the world view — the design-local view angle is not the site bearing

## References

- `site/design-lab/views/hamlet-courtyard-residence-site-facing.svg`
- `site/design-lab/views/hamlet-courtyard-residence-interior-plan.svg`

## Images

### courtyard-residence-exterior-hero — Courtyard Residence — east approach and courtyard (ready)

- Design hash: `30eb578a` · scene hash: `6669c001`
- Reference: `site/design-lab/views/hamlet-courtyard-residence-site-facing.svg`
- Patterns: 163, 106, 105 (primary)
- Pattern cue: Outdoor Room, Positive Outdoor Space and South Facing Outdoors: the L shapes a sheltered courtyard with a clear edge and a sunny side.
- Risk: medium · seed: `833011685`

**Prompt**

```text
Photorealistic architectural visualization of the Courtyard Residence, an L-shaped single-storey home of two 40 ft timber modules. Camera at 1.6 m on the east approach at the courtyard corner, 35 mm lens, framing the whole L, courtyard opening, covered north porch and glazed timber link. Flat roof with a 0.5 m overhang and low green-roof edge, courtyard deck projecting 1.4 m, east entry, courtyard sliding doors and documented windows, one visible corner casting, conceptual ember-resistant vents and defensible-space planting. Pine trunks and a narrow strip of lake light beyond. Soft daylight. One flat roof, no dormer; exposed helical piles, no stone base; no steps; visible steel corner castings; no waterfront. Each 40 ft module is finished about 12.60 x 2.85 m with 205 mm external insulation, drained cavity and rainscreen; deep reveals; not a bare container. No people, no text, no watermark.
```

**Negative prompt**

```text
green roof drainage outlet, gutter, downspout, installed PV array, solar panels, second storey, third module, warm roof claim, dry roof claim, chimney, wood stove, hydrant, fire cistern, noncombustible deck claim, potable water label, battery, inverter, extra buildings, people, text, watermark, cartoon, illustration, painting, low resolution, distorted geometry, blurry, oversaturated colors, HDR halos, floating objects, duplicate elements
```

**Must show**

- [modeled] two 40 ft timber modules, one rotated 90 degrees to form an L
- [modeled] finished external envelope: 150 mm mineral wool + 10 mm thermal break + 25 mm drained cavity + 20 mm cladding (about 205 mm added per side), with deep window reveals and a clad wall, not a bare container
- [conceptual] flat roof with a 0.5 m overhang and a low green-roof edge
- [modeled] covered north porch p1 6.4 x 2.8 m at the courtyard edge
- [modeled] courtyard deck d1 projecting 1.4 m
- [modeled] glazed timber link c1 between the modules
- [modeled] east entry door, courtyard sliding doors and the documented windows on both modules
- [modeled] a narrow strip of lake light beyond the west end, seen through pine trunks
- [inferred] one visible corner casting and the module joint at the link
- [conceptual] closed ember-resistant vents and defensible-space planting

**Must not show**

- a resolved green-roof drainage outlet, gutter or downspout — Flat green-roof slope, outlet, overflow and ponding are unresolved.
- an installed PV array — No installed PV is recorded.
- a second storey or a third module — Two modules and one storey are modeled.
- a flat roof presented as a warm or dry assembly — Saturated load, drainage, root protection and fire are unresolved.
- a chimney, stove, hydrant or fire cistern — None is recorded or verified.
- a noncombustible deck claim — The deck is not recorded as noncombustible.

### courtyard-residence-interior-hero — Courtyard Residence — living and dining zone (ready)

- Design hash: `30eb578a` · scene hash: `6669c001`
- Reference: `site/design-lab/views/hamlet-courtyard-residence-interior-plan.svg`
- Patterns: 127, 159, 180 (primary)
- Pattern cue: Intimacy Gradient and Light on Two Sides: a public-to-private sequence around the courtyard, with daylight from more than one direction.
- Risk: high · seed: `299776458`

**Prompt**

```text
Photorealistic open zone study, no partitions, inside the Courtyard Residence living and dining side. Camera at 1.5 m with a 24 mm lens at the east end looking west toward the north courtyard sliding doors and the open volume of one module. The courtyard beyond the doors, the 0.8 m and 1.4 m south windows on the opposite wall, and the glazed link at the edge of frame. Neutral lining, flat container ceiling, exposed steel at the reveals, zone bands in floor finish only. Soft daylight from the courtyard. No walls, no doors, no furniture, no kitchen cabinets, no loose objects. Window and door reveals are deep because of the 205 mm external envelope. No people, no text, no watermark.
```

**Negative prompt**

```text
partitions, interior walls, interior doors, bathroom enclosure, bed, sofa, dining table, kitchen counter, toilet, fixtures, loose furniture, rug, lamp, indoor plant, kitchen hood, service core, HRV terminal, green roof visible through ceiling, coffered ceiling, pitched ceiling, unlisted window, room layout, fully accessible claim, people, text, watermark, cartoon, illustration, painting, low resolution, distorted geometry, blurry, oversaturated colors, HDR halos, floating objects, duplicate elements
```

**Must show**

- [modeled] one open module volume with no partitions; living, dining and sleeping are zone bands only
- [modeled] finished external envelope: 150 mm mineral wool + 10 mm thermal break + 25 mm drained cavity + 20 mm cladding (about 205 mm added per side), with deep window reveals and a clad wall, not a bare container
- [modeled] the north sliding courtyard doors (m1-n1) and the courtyard beyond
- [modeled] the 0.8 m south window (m1-s2) and the 1.4 m south window (m1-s1) on the opposite wall
- [modeled] the glazed link c1 visible at the edge of frame, connecting to the second module
- [conceptual] a neutral lining and the flat container ceiling; no pitched or coffered ceiling

**Must not show**

- partitions, doors or a defined bathroom enclosure — None is modeled.
- a bed, sofa, table, kitchen counter or other fixture — No fixtures are modeled.
- a room-specific window not in the opening list — Only the listed openings are recorded.
- a kitchen hood, service core or HRV terminal — No service-core geometry is modeled.
- a green-roof planting visible through the ceiling — The green roof is an exterior concept; no interior ceiling geometry is modeled.
- a room layout or fully accessible claim — The image is a zone study; accessibility is not a target for this home.

## Review gate

Do not publish an image from this brief until the review record is cleared, the specific known deviations are recorded, and the image has been checked against the model. The prompt is not a substitute for the reference drawing or a 3D model.
