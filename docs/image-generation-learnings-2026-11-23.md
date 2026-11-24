# Image-generation learnings from the six-view test

**Status:** Session close-out, 2026-11-23. This records what the six-view prompt
test actually produced and what it changes for the next pass. No model, image or
poster was changed.

## What was tested

Two master prompts and six view blocks were written for Woodland Cottage:
hero, porch, entrance, roof/PV/west gable, fire edge and envelope reveal. Each
prompt carried the model facts (one 40 ft module, 12.60 × 2.85 m finished, 4.4:1,
24° gable, 5.4 × 2.8 m porch, 205 mm wall, 0.6 m piles, PV, lake glimpse) and a
long exclusion list.

The generated images were plausible, consistent with each other and wrong for
the home.

## What the images actually show

- **A single-storey timber cabin roughly twice the modelled footprint.** The
  canonical Woodland Cottage is **29.7 m²**, 12.60 × 2.85 m, 4.4 m to the roof.
  The images read as a 55–70 m² cabin with a gable end about 6–7 m wide.
- **The 4.4:1 proportion is gone.** The long, narrow module is the home's
  defining constraint. The images widen it until it becomes a conventional
  cottage.
- **The container identity is gone.** There are no ISO corner castings or
  lifting points; the black base boxes are a fake detail. The wall reads as a
  timber cabin, not a clad and insulated container.
- **The glazing is about twice the recorded area.** The canonical total is
  **10.2 m²**; the west window alone is about 2–3 m² in the images against the
  recorded 1.0 × 1.3 m.
- **The fire edge is the wrong product.** The eave grille is a large louvered
  vent, not the intended fine-mesh ember-resistant vent.
- **The porch, PV, piles, timber, lake glimpse and no-stove condition are
  right.** The envelope reveal is the most useful image: it shows the layer
  build-up and the floor edge on piles, even if the proportions are generic.

## Why it happened

Text-to-image does not treat “12.60 × 2.85 m, 4.4:1, 29.7 m²” as a constraint.
It treats those numbers as nearby words in a prompt dominated by “cottage,
gable, timber, porch, lake”. The result is the building those words imply.

The reference drawing was not the controlling input. Attaching an SVG or a
drawing as a loose style reference does not preserve a plan. The six views are
six camera angles on the same invented cabin, so they agree with each other and
still disagree with the model.

This is the same finding as
[`image-generation-findings.md`](image-generation-findings.md): text alone cannot
hold a 4.4:1 module, a specific opening layout or an open plan. The reference
drawing or a 3D model is required.

## The smoke stack

There is no chimney because there is no stove. Woodland Cottage is heat-pump
heated; the v2 records exclude a stove and chimney. The v1 image had a stove
without a chimney or outside-air duct, which is why the project removed it.

The fire story is **wildfire resilience** — closed noncombustible eaves, an
ember-resistant vent and defensible space — not a fireplace. The large eave
grille is not a flue and not the intended fine-mesh vent.

A wood stove is a **model change**: add the stove, chimney/flue, hearth,
clearances, outside-air kit and CO alarms (see
[`wood-heat-thermal-mass.md`](wood-heat-thermal-mass.md)), then update the image
record. It is not a prompt tweak.

## What changed in the approach

1. **Stop treating the prompt as the fix.** The prompt is already more
   specific than the tool can hold. The missing input is the geometry.
2. **Use a reference-conditioned workflow, one view at a time.** Image-to-image
   or a control/reference workflow with a PNG of the site-facing drawing, the
   south elevation or the plan. Do not ask for six views in one pass.
3. **Or use a 3D model.** A 12.60 × 2.85 m box, 24° gable, 5.4 × 2.8 m porch and
   the six openings in SketchUp, Blender or Rhino gives consistent views and
   accurate proportions. This is more reliable than another prompt.
4. **Or publish the drawings as the visual.** The Design Lab page already has
   the plan, elevations, section, interior plan and references generated from
   the model. The AI images are concept/mood only.
5. **Keep the review gate.** Hash, known deviations, human review, status and a
   caption. The six-image set would have failed the gate at the first check.

## What to keep

- The porch, PV, piles, timber and lake-glimpse composition.
- The envelope reveal as a material study.
- The six-view structure (hero, porch, entrance, roof/PV, fire edge, envelope
  reveal) as a checklist, not as six text-to-image prompts.
- The model facts from the
  [Woodland Cottage architecture page](https://mgifford.github.io/Containers-Hamlet/design-lab/architecture/hamlet-woodland-cottage/):
  29.7 m², one 40 ft module, 4.4 m to the roof, 24° gable, 0.8 m overhang,
  5.4 × 2.8 m porch, 10.2 m² glazing, 950 mm door, 205 mm wall, 0.6 m piles.

## Next step

Produce **one** image from the south elevation or the site-facing drawing using
an image-edit/reference workflow, check the 12.60 × 2.85 m proportion and the
container corner before doing anything else. If that one image cannot hold the
proportion, the tool is wrong for this task; use the drawings or a 3D render.

The generated briefs are in [`generation-briefs/`](generation-briefs/), produced
by `npm run briefs` from the image records. They are the source material for
that one-view test.

## Related

- [`image-review-summary-2026-11-23.md`](image-review-summary-2026-11-23.md)
- [`image-review-woodland-cottage-2026-11-23.md`](image-review-woodland-cottage-2026-11-23.md)
- [`image-generation-findings.md`](image-generation-findings.md)
- [`image-descriptions.md`](image-descriptions.md)
- [`wood-heat-thermal-mass.md`](wood-heat-thermal-mass.md)
- [`visualisation-v2-brief.md`](visualisation-v2-brief.md)
