# Generation brief — Woodland Cottage

- Model: `hamlet-woodland-cottage`
- Design hash: `d142126a` · scene hash: `4af580f8`
- Review gate: [image-review-woodland-cottage-2026-11-23.md](../image-review-woodland-cottage-2026-11-23.md)
- Status: brief only; nothing here is a construction drawing or a published image.

## Model facts

- Modules: 1 × 40ft; nominal 12.192 × 2.438 m at 0.6 m
- Cladding: timber
- Roof: gable, 24°, 0.8 m overhang
- Porch p1: 5.4 × 2.8 m on the south face, roofed
- Envelope: 205 mm added outside the steel; 209 mm total wall; 250 mm roof; 200 mm floor
- Interior: authored — opening-room-mapping-unresolved
- Site: homesite a (concept placement); use the site brief for the world view — the design-local view angle is not the site bearing

## References

- `site/design-lab/views/hamlet-woodland-cottage-site-facing.svg`
- `site/design-lab/views/hamlet-woodland-cottage-interior-plan.svg`
- `site/design-lab/views/hamlet-woodland-cottage-elevation-south.svg`
- `site/design-lab/views/hamlet-woodland-cottage-section.svg`

## Images

### woodland-cottage-exterior-hero — Woodland Cottage — garden approach and whole house (ready)

- Design hash: `d142126a` · scene hash: `4af580f8`
- Reference: `site/design-lab/views/hamlet-woodland-cottage-site-facing.svg`
- Patterns: 112, 163, 105 (primary)
- Pattern cue: Entrance Transition and Outdoor Room: a sheltered, legible arrival that leads to a covered south porch with a floor, edge and a reason to stay.
- Risk: medium · seed: `697035595`

**Prompt**

```text
Photorealistic architectural visualization of Woodland Cottage: a long, narrow single-storey container home, one 40 ft module, 12.19 x 2.44 m nominal and about 12.60 x 2.85 m finished (about 4.4:1 length to width). Camera at 1.6 m eye level from the south-west garden approach, 35 mm lens, framing the whole house with the south porch and west gable end. Timber-clad ISO container on a 0.6 m exposed helical-pile base, visible corner castings and module joint, one simple 24-degree gable with two roof planes and a 0.8 m overhang, no dormer or cross-gable, PV panels visible on the south slope, flush step-free entrance, level deck, garden sliding doors. The finished wall is about 205 mm outside the steel: 150 mm mineral wool, 10 mm thermal break, 25 mm drained cavity and 20 mm timber rainscreen, with deep reveals; the container is clad and lined, not a bare steel box. Conceptual gutter, downspout, fine-mesh ember vent and low-fuel defensible planting; the lake is only a glimpse through trunks, not a waterfront. Clear late-afternoon summer light. No people, no text, no watermark.
```

**Negative prompt**

```text
second storey, second module, balcony, chimney, wood stove, hydrant, fire cistern, potable water label, drinking water claim, rain barrel, battery, inverter, off-grid plant, noncombustible deck claim, firewood, snow guards, accessible ramp, lift, handrail, waterfront lawn, lake against the house, extra buildings, people, text, watermark, cartoon, illustration, painting, low resolution, distorted geometry, blurry, oversaturated colors, HDR halos, floating objects, duplicate elements
```

**Must show**

- [modeled] one 40 ft module, 12.19 x 2.44 m, base 0.6 m, timber cladding
- [modeled] finished external envelope: 150 mm mineral wool + 10 mm thermal break + 25 mm drained cavity + 20 mm cladding (about 205 mm added per side), with deep window reveals and a clad wall, not a bare container
- [modeled] gable roof at 24 degrees with a 0.8 m overhang and a standing-seam metal finish
- [modeled] installed PV array on the south roof slope, tilted racks
- [modeled] south face: bathroom window at 4.4 m (0.8 x 1 m, sill 1.4 m), step-free entrance at 6.1 m (0.95 x 2.1 m), garden sliding doors at 8.4 m (2.4 x 2.1 m)
- [modeled] west face: one 1 x 1.3 m window at 1.2 m, sill 0.9 m; north windows remain out of view
- [modeled] covered south porch 5.4 x 2.8 m, roofed, and a level deck projecting 1 m
- [modeled] a level, step-free threshold at the entrance; no ramp
- [inferred] one visible corner casting and the module joint at the porch end, consistent with an ISO container
- [conceptual] a gutter along the south eave and one downspout at its east end
- [conceptual] closed noncombustible eaves and one fine-mesh ember-resistant vent
- [conceptual] defensible-space planting: low fuel within 1.5 m, reduced fuel to 10 m, no firewood against the house
- [modeled] cedar and pine, with the lake seen only as a glimpse through trunks; no other buildings

**Must not show**

- a second storey, a second module or a balcony — The model has one storey and one module.
- a chimney or a wood stove — Neither is recorded; heating is a heat pump.
- a hydrant or a fire cistern — Fire-service water access is not confirmed.
- a potable-water label or drinking-water claim — The rainwater system is non-potable and treatment is not designed.
- a rain barrel as the water system — A rain barrel is not a system or a fire reserve.
- a battery, inverter or off-grid plant — None is recorded.
- a deck presented as noncombustible, or firewood under the floor or against the wall — The deck is not recorded as noncombustible; storage is unresolved.
- snow guards installed above the entry — Snow guards are unresolved, not designed.
- an accessible ramp, lift or handrail not modeled — The entrance is level; no ramp or lift is recorded.
- a waterfront lawn or a lake immediately at the house — The site view is through cedar and pine, with the far shore low on the horizon.
- a dormer, cross-gable, second gable or loft — The model has one 24-degree gable, two roof planes and one occupied storey.
- a stone or concrete foundation, plinth or slab — The model uses exposed helical piles with a 0.6 m undercroft; no slab or stone base is modeled.
- steps, a raised deck or a ramp — The entrance and deck are recorded as level and step-free.
- a lake or waterfront directly behind the house — The site view is through cedar and pine, with the far shore low on the horizon.
- missing or hidden PV panels — Installed PV on the south slope is modeled and must be visible when that slope is in view.

### woodland-cottage-interior-hero — Woodland Cottage — entrance hall, kitchen and living (blocked-pending-reconciliation)

- Design hash: `d142126a` · scene hash: `4af580f8`
- Reference: `site/design-lab/views/hamlet-woodland-cottage-interior-plan.svg`
- Patterns: 127, 159, 180 (primary)
- Pattern cue: Intimacy Gradient and Light on Two Sides: a public-to-private sequence with daylight from more than one direction.

**Blocked.** Do not generate this view until the interior is reconciled.

- modules[0].openings[m1-n2] is named Kitchen window but its position (6.2 m) falls in the authored entrance hall band.
- modules[0].openings[m1-s2] is named Garden doors but its position (8.4 m) falls at the kitchen/living boundary, not inside the authored living room.
- modules[0].openings[m1-w1] is named Living window but it is on the west face, which is the bedroom end in the authored plan.
- The interior plan does not draw the perimeter openings, so the room-opening assignment cannot be checked visually.

**Must show**

- [modeled] the authored room sequence west to east: bedroom, bathroom, entrance hall, kitchen, living
- [modeled] four full-height partitions and four 0.9-1.0 m doors; doors are drawn as open connections, not missing walls
- [inferred] the narrow 2.44 m internal width and the container's flat ceiling; no raised or pitched interior ceiling
- [modeled] the entrance door (m1-s3) and the south garden doors (m1-s2) at their recorded positions
- [modeled] the kitchen counter (1.6 x 0.55 m) and the living sofa (1.5 x 0.8 m) only
- [conceptual] a neutral pale interior lining with exposed container steel at the door and window reveals
- [modeled] the 1.0 m hall-to-kitchen door and the 1.0 m kitchen-to-living door, both open

**Must not show**

- a wood stove, chimney, range hood or bathroom exhaust fan — None is recorded or designed; heating is a heat pump.
- loose furniture, rugs, lamps, art, plants, books or dishes — Only the modeled fixtures may be shown; loose furniture is not modeled.
- a wall, door or window that is not in the interior model — The interior has four partitions and four doors only.
- a timber species, stain, tile or paint colour presented as specified — Interior finishes are not documented.
- the garden doors forced into the middle of the living room, or the west window called a living window — The recorded positions and the authored room names do not reconcile; do not correct the plan in the image.
- an accessible route or turning circle claim beyond the modeled 1.5 m bathroom circle — Clearances are not professionally verified.

### woodland-cottage-fire-edge — Woodland Cottage — fire-resilient roof edge and defensible space (ready)

- Design hash: `d142126a` · scene hash: `4af580f8`
- Reference: `site/design-lab/views/hamlet-woodland-cottage-elevation-south.svg`
- Patterns: 104, 171 (supporting)
- Pattern cue: Site Repair and Tree Places: keep fuel away from the building, preserve the trees and repair the disturbed ground.
- Risk: medium · seed: `46511572`

**Prompt**

```text
Photorealistic wide detail of the Woodland Cottage south-west roof edge and immediate ground plane. Camera at 1.6 m with a 50 mm lens, three-quarter view; the lower third of the frame is ground and wall base, the roof edge sits in the upper third. Standing-seam gable roof with a 0.8 m overhang, closed noncombustible soffit and fascia, one fine stainless-mesh ember-resistant vent (not a louver), tempered glazing, conceptual gutter and downspout, low-fuel ground cover within 1.5 m and reduced fuel to 10 m, exposed helical piles and a clear undercroft, no stone foundation. Soft raking daylight; The wall is a thick clad and insulated assembly with a deep ~205 mm reveal, not a thin bare container edge. No people, no text, no watermark.
```

**Negative prompt**

```text
fire resistance rating, fireproof label, WUI approval sign, chimney, wood stove, hydrant, fire cistern, firewood, underfloor storage, noncombustible deck claim, snow guards, balcony, accessible ramp, second storey, second module, people, text, watermark, cartoon, illustration, painting, low resolution, distorted geometry, blurry, oversaturated colors, HDR halos, floating objects, duplicate elements
```

**Must show**

- [modeled] standing-seam metal roof edge with a 0.8 m overhang
- [modeled] finished external envelope: 150 mm mineral wool + 10 mm thermal break + 25 mm drained cavity + 20 mm cladding (about 205 mm added per side), with deep window reveals and a clad wall, not a bare container
- [conceptual] closed, noncombustible soffit and fascia at the eave
- [conceptual] one fine-mesh ember-resistant vent, closed and defended
- [conceptual] tempered glazing at the windows in frame; no combustible trim against the glass
- [conceptual] a gutter and downspout at the eave
- [conceptual] low-fuel ground cover within 1.5 m, reduced fuel from 1.5 m to 10 m, and no firewood, propane or storage against the wall
- [modeled] an elevated floor on piles with a clear, non-storage undercroft

**Must not show**

- a fire-resistance rating, fireproof label or WUI approval — No rating or approval is designed.
- a chimney, stove, hydrant or fire cistern — None is recorded or verified.
- firewood stacked under the floor or against the house — This is an unresolved fire risk, not a design feature.
- a noncombustible deck claim — The deck is not recorded as noncombustible.
- snow guards as installed — Snow guards and entry protection are unresolved.
- a louvered vent instead of a fine-mesh ember vent — The fire intent is a closed, fine-mesh ember-resistant vent, not an open louver.
- a stone or concrete foundation — The model uses exposed helical piles, not a stone plinth.

### woodland-cottage-water-edge — Woodland Cottage — rainwater collection edge (ready)

- Design hash: `d142126a` · scene hash: `4af580f8`
- Reference: `site/design-lab/views/hamlet-woodland-cottage-elevation-south.svg`
- Patterns: 104 (supporting)
- Pattern cue: Site Repair: place the water collection at the edge so it does not damage the building or the ground.
- Risk: medium · seed: `125213091`

**Prompt**

```text
Photorealistic close view of the Woodland Cottage rainwater-collection edge. Camera at 1.6 m with a 50 mm lens, looking up the south-east downspout and along the garden edge. Standing-seam metal roof, gutter with a fine mesh leaf guard, one downspout at the east end of the south eave, a vertical cylindrical first-flush chamber with a screw cap at its base, and a small inlet pipe turning into the garden soil beyond frame. Timber wall on a 0.6 m exposed pile base, no stone foundation, no splash block. Conceptual collection hardware in clear late-afternoon summer light; The wall is a thick clad and insulated assembly with a deep ~205 mm reveal, not a thin bare container edge. No people, no text, no watermark.
```

**Negative prompt**

```text
cistern in view, water tank, rain barrel, hydrant, fire cistern, draft point, potable tap, water filter, drinking water label, pump, pressure tank, treatment plant, chimney, wood stove, battery, inverter, snow guards, balcony, second storey, second module, people, text, watermark, cartoon, illustration, painting, low resolution, distorted geometry, blurry, oversaturated colors, HDR halos, floating objects, duplicate elements
```

**Must show**

- [conceptual] standing-seam metal roof and a gutter with a fine leaf guard
- [modeled] finished external envelope: 150 mm mineral wool + 10 mm thermal break + 25 mm drained cavity + 20 mm cladding (about 205 mm added per side), with deep window reveals and a clad wall, not a bare container
- [conceptual] one downspout at the east end of the south eave
- [conceptual] a first-flush diverter at the downspout base
- [conceptual] an inlet pipe turning into the garden edge, with the cistern itself out of frame
- [conceptual] a splash pad or stone apron at the wall base, not a stored-water feature
- [modeled] the clear undercroft and no storage against the wall

**Must not show**

- a cistern, tank or barrel in a resolved location — Cistern type is recorded but volume and location are not resolved.
- a hydrant, fire cistern or draft point — Fire-service water access is not confirmed.
- a potable-water tap, filter or drinking-water label — The system is non-potable; treatment and testing are not designed.
- a single rain barrel presented as the system — A rain barrel is not a system or a fire reserve.
- a pump, pressure tank or treatment plant — None is recorded.
- a splash block instead of a first-flush device — The first-flush device is required; a splash block is not the collection system.

### woodland-cottage-service-core — Woodland Cottage — service core and ventilation (ready)

- Design hash: `d142126a` · scene hash: `4af580f8`
- Reference: `site/design-lab/views/hamlet-woodland-cottage-interior-plan.svg`
- Pattern cue: Supporting technical detail: it enables comfort and resilience but is not itself a Pattern Language image.
- Risk: high · seed: `642782706`

**Prompt**

```text
Photorealistic interior visualization of the Woodland Cottage service core. Camera at 1.5 m with a 24 mm lens, standing in the entrance hall with a three-quarter view of a compact utility wall at the kitchen and bathroom end. Neutral pale lining with exposed container steel at the reveals; accessible labelled panels, a rectangular wall-mounted heat-recovery ventilator with two insulated ducts, replaceable filter, frost control and condensate drain, a small electrical panel, and an electric heat-pump water heater with drain and relief valve. Low 200 mm fresh-air intake, high 200 mm exhaust, clear floor in front of every panel. Sealed electric appliances only: no chimney, no flue, no gas vent. Soft interior daylight; The wall is a thick clad and insulated assembly with a deep ~205 mm reveal, not a thin bare container edge. No people, no text, no watermark.
```

**Negative prompt**

```text
wood stove, chimney, stove outside air kit, gas supply, propane tank, combustion appliance, battery, inverter, off-grid plant, recirculating microwave hood, sealed service wall, concealed equipment, equipment brand, pipe route, electrical layout, loose furniture, rug, lamp, indoor plant, wall art, people, text, watermark, cartoon, illustration, painting, low resolution, distorted geometry, blurry, oversaturated colors, HDR halos, floating objects, duplicate elements
```

**Must show**

- [conceptual] a compact service wall with accessible, labelled panels; no concealed equipment without an access door
- [modeled] finished external envelope: 150 mm mineral wool + 10 mm thermal break + 25 mm drained cavity + 20 mm cladding (about 205 mm added per side), with deep window reveals and a clad wall, not a bare container
- [conceptual] a compact HRV with a replaceable filter, frost control and a condensate drain
- [conceptual] a low fresh-air intake and a high exhaust, each a 200 mm insulated wall sleeve
- [conceptual] a small electrical panel and a water heater with a drain and TPR relief
- [conceptual] a clear floor in front of every panel and a door or access panel that opens fully
- [conceptual] a neutral lining with exposed steel at the reveals; no applied timber feature wall

**Must not show**

- a wood stove, chimney or stove OAK — No stove is recorded; the recorded heating is a heat pump.
- a gas supply, propane tank or combustion appliance — No gas or propane is recorded.
- a battery, inverter or off-grid plant — None is recorded.
- a recirculating microwave presented as kitchen ventilation — A recirculating hood is not a moisture solution; the brief requires a ducted hood.
- specific equipment brands, sizes, pipe routes or electrical layouts presented as designed — The service core is not designed; show generic, labelled equipment only.
- a sealed service wall with no access — Every concealed service must have an access panel.
- a chimney, flue or gas vent — The home is heat-pump heated; no combustion appliance or flue is recorded.
- a mini-split indoor head presented as an HRV — The HRV is a ducted balanced unit with a filter and condensate drain, not a single-head heat pump.

### woodland-cottage-accessible-entry — Woodland Cottage — step-free entry and accessible route (ready)

- Design hash: `d142126a` · scene hash: `4af580f8`
- Reference: `site/design-lab/views/hamlet-woodland-cottage-elevation-south.svg`
- Patterns: 112, 155 (primary)
- Pattern cue: Entrance Transition and Old Age Cottage: a step-free, sheltered arrival for a small accessible home.
- Risk: medium · seed: `872682298`

**Prompt**

```text
Photorealistic eye-level view of the Woodland Cottage step-free entrance. Camera at 1.5 m with a 35 mm lens from the garden deck, centred on the open 0.95 m entrance door and the covered south porch. Level deck and flush threshold, no step, porch 5.4 x 2.8 m with roof and posts, continuous slip-resistant surface, clear 1.2 m route through the hall toward the 1.0 m hall-to-kitchen door. Timber cladding, neutral lining and exposed steel reveals beyond. Clear late-afternoon daylight through cedar and pine; The wall is a thick clad and insulated assembly with a deep ~205 mm reveal, not a thin bare container edge. No people, no text, no watermark.
```

**Negative prompt**

```text
ramp, lift, stair, level change, grab bar, handrail, doormat, loose furniture, potted plant, fully accessible claim, code compliance label, snow bank, ice, chimney, wood stove, hydrant, fire cistern, potable tap, battery, inverter, balcony, second storey, second module, people, text, watermark, cartoon, illustration, painting, low resolution, distorted geometry, blurry, oversaturated colors, HDR halos, floating objects, duplicate elements
```

**Must show**

- [modeled] a level deck and a level threshold at the entrance, with no step and no ramp
- [modeled] finished external envelope: 150 mm mineral wool + 10 mm thermal break + 25 mm drained cavity + 20 mm cladding (about 205 mm added per side), with deep window reveals and a clad wall, not a bare container
- [modeled] the 0.95 m entrance door, open, with a clear approach
- [modeled] the covered porch 5.4 x 2.8 m with a roof and posts
- [conceptual] a 1.2 m clear route from the threshold through the hall, without a loose mat or furniture
- [conceptual] a continuous, slip-resistant surface across deck and threshold
- [modeled] the hall and the 1.0 m hall-to-kitchen door beyond

**Must not show**

- a ramp, lift, stair or level change at the entrance — No ramp, lift or stair is modeled; the entrance is level.
- a grab bar, handrail or accessible fixture not in the model — Only the bathroom turning circle is modeled; no grab bars are recorded.
- a doormat, loose furniture or planting that narrows the route — The 1.2 m route is a design target and must stay clear.
- a 'fully accessible' or code-compliance claim — Accessibility is a design target, not a verified assessment.
- a snow bank or ice on the route presented as resolved — Winter access and snow clearing are unresolved.

### woodland-cottage-envelope-reveal — Woodland Cottage — wall build-up and window reveal (ready)

- Design hash: `d142126a` · scene hash: `4af580f8`
- Reference: `site/design-lab/views/hamlet-woodland-cottage-section.svg`
- Patterns: 159, 180 (primary)
- Pattern cue: Light on Two Sides and Window Place: a deep reveal that gives the window a place to pause and light from more than one direction.
- Risk: medium · seed: `353521320`

**Prompt**

```text
Photorealistic close three-quarter detail of the Woodland Cottage south window reveal and wall build-up. Camera at 1.6 m with a 50 mm lens, from outside at the porch. The reveal is deep, about 205 mm. From the interior out: neutral lining, 3 mm steel container wall, 1 mm air/vapour control, 150 mm mineral wool, 10 mm thermal break, 25 mm ventilated drained cavity and 20 mm vertical timber rainscreen. Show the continuous insulation, a clean thermal break at the opening, the drained cavity, the 250 mm roof edge above and the 200 mm floor over an exposed helical pile below; one steel corner casting at the module joint. No visible thermal bridge, no bare steel, no spray foam, no stone base, no chimney. Clear late-afternoon light. No people, no text, no watermark.
```

**Negative prompt**

```text
bare steel container wall, thin wall, missing insulation, exposed spray foam, thermal bridge, stone foundation, concrete plinth, chimney, flue, wood stove, dormer, second gable, extra storey, extra module, timber feature wall, people, text, watermark, cartoon, illustration, painting, low resolution, distorted geometry, blurry, oversaturated colors, HDR halos, floating objects
```

**Must show**

- [modeled] 3 mm steel container wall, 1 mm air/vapour control, 150 mm mineral wool, 10 mm thermal break, 25 mm ventilated drained cavity and 20 mm timber rainscreen
- [modeled] about 205 mm added outside the steel wall (209 mm total wall), producing a deep window reveal
- [modeled] continuous external insulation with a thermal break at the opening and pile cap; no visible thermal bridge
- [modeled] a drained and ventilated cavity behind the timber rainscreen
- [modeled] a roof edge with 250 mm insulation and a standing-seam metal finish
- [modeled] a floor with 200 mm insulation over exposed helical piles and a 0.6 m undercroft
- [inferred] one visible corner casting and the module joint at the reveal
- [conceptual] neutral interior lining and exposed steel at the inner reveal

**Must not show**

- a bare steel container wall as the finished exterior — The wall is externally insulated, drained, ventilated and clad.
- a thin wall, an uninsulated wall or exposed spray foam — The assembly is 150 mm mineral wool with a thermal break; spray foam is not selected.
- a stone or concrete foundation — The model uses exposed helical piles.
- a chimney, flue or stove — None is recorded; heating is a heat pump.
- an extra storey, module or dormer — One storey, one module and one gable are modeled.

## Review gate

Do not publish an image from this brief until the review record is cleared, the specific known deviations are recorded, and the image has been checked against the model. The prompt is not a substitute for the reference drawing or a 3D model.
