# Local image-generation pilot: findings

**Status:** Stopped. The local model was too heavy for a 16 GB M2 while other work
was running. Four drafts were produced and are kept only in the git-ignored
`screenshots/v2-images/` folder. They are not published, not committed and not
model-verified.

## What was tried

- **Model:** `black-forest-labs/FLUX.2-klein-4B`, 4-bit, 4 steps, guidance 1.0,
  small text encoder, `768 × 576` drafts.
- **Runtime:** `mflux` on Apple Silicon, Python 3.12, MLX.
- **Cost:** about 10 GB of model download, 3.36 GB peak MLX memory, roughly
  2–6 minutes per image, and noticeable system-wide memory pressure.
- **Scope:** the 15 `ready` descriptions; the two blocked interiors were skipped. Four were generated.
- **Result:** four drafts before stopping: Woodland Cottage exterior, fire edge,
  water edge and service core.

The model is a useful smoke test, not an architectural renderer. It produced
plausible cabins, not model-faithful container homes.

## What the drafts got wrong

| Image | What the model invented or omitted | Why it matters |
| --- | --- | --- |
| Woodland exterior | A second gable/dormer, a wider plan, extra windows and a raised step; a lake directly behind the house; weak or missing PV; a conventional cabin rather than a container | The model has one 24° gable, one 40 ft module, a level deck, PV on the south slope and a view through trees, not a waterfront |
| Fire edge | Cropped out the defensible ground plane; invented a stone plinth; rendered a louver, not a fine-mesh ember vent | The image is about the ground plane and the ember-resistant edge, not a roof close-up |
| Water edge | Omitted the first-flush device and cistern inlet; added a splash block and stone base | The collection sequence is the subject; a splash block is not the system |
| Service core | Added a chimney/flue; rendered the HRV like a mini-split; invented a kitchen and door beyond | The home is heat-pump heated; no combustion flue is recorded |

## What this teaches the descriptions

0. **The container is not the building.** The model records a 12.19 × 2.44 m
   module, but the finished wall adds 205 mm per side (150 mm mineral wool,
   10 mm thermal break, 25 mm drained cavity, 20 mm cladding). The finished
   envelope is about 12.60 × 2.85 m, or roughly 4.4:1, not 5:1. Window reveals
   are about 205 mm deep; the roof adds 250 mm and the floor 200 mm. Every
   exterior description now uses the finished dimensions and requires a clad,
   insulated, drained wall, not a bare container. The new
   `woodland-cottage-envelope-reveal` detail makes the layer sequence visible.
1. **Negative prompts are model-dependent.** Guidance-1 distilled models often
   ignore them. Critical exclusions must be written into the positive prompt:
   "no dormer, no cross-gable", "no stone base", "no steps", "no chimney or
   flue", "not a waterfront".
2. **Technical terms need visual recipes.** "First-flush diverter" produced a
   splash block. "HRV" produced a mini-split. Write the form: "a vertical
   cylindrical first-flush chamber with a screw cap", "a rectangular wall-mounted
   HRV with two insulated ducts, filter and condensate drain".
3. **Geometry-critical images need a reference drawing.** Text alone cannot hold
   a 5:1 module proportion, a specific window layout or an open zone plan. Use
   the deterministic `site-facing.svg`, `elevation-south.svg` or
   `interior-plan.svg` as an image reference (img2img or a depth/edge
   conditioner) rather than relying on prose.
4. **Front-load container identity and proportion.** The model defaults to a
   conventional cabin. Start with "long narrow single-storey ISO container
   module, 12.19 × 2.44 m, about 5:1 length to width", then the corner castings
   and module joint, then the cottage details.
5. **Separate the review contract from the generation brief.** A human can follow
   a 12-item `mustShow` list; a diffusion model cannot. Keep `mustShow` and
   `mustNotShow` for review, and add a compact `generation.prompt` with 3–5
   visual anchors and the top failure guards.
6. **Interiors are the highest-risk images.** Text-only generation invents
   partitions, furniture and room uses. Mark them `risk: high`, require the
   interior plan as a reference, and do not publish a text-only room layout.
7. **A generic caption is not enough for a generated draft.** The caption must
   record the known deviations ("dormer invented", "stone base invented",
   "first-flush device omitted"), not only "not a construction drawing". Example
   for the Woodland exterior draft:

   > AI concept draft, not a model-verified drawing. Known deviations: a dormer
   > and cross-gable were invented; the plan reads wider than the finished
   > 12.60 m module; steps were added; the lake is too close; the PV array is
   > missing. Do not use for dimensions, structure or code.
8. **Do not run this on a working laptop.** A 4B diffusion model with a 10 GB
   download and multi-minute generations competes with the rest of the session.
   Use a hosted image API or a dedicated machine, and keep the model cache out
   of the repository.

## Changes made to the descriptions

- Added a `generation` object to each of the 15 ready records:
  `prompt`, `negativePrompt`, `risk` (`low` / `medium` / `high`), `reference`
  and `referenceRequired`.
- Added the Woodland guards learned from the drafts: no dormer/cross-gable/loft,
  no stone or concrete foundation, no steps or ramp, no waterfront, visible PV,
  a fine-mesh rather than louvered vent, a visual first-flush chamber, and no
  chimney or flue in the service core.
- Marked all interiors `risk: high` and pointed them at `interior-plan.svg`.
- Added a validator check that every ready image has a generation prompt, every
  prompt ends with the no-people/no-text/no-watermark constraint, and the
  observed Woodland guards are present.
- Added a per-design `envelope` object with the wall layers, finished module dimensions, roof and floor insulation.
- Added the `woodland-cottage-envelope-reveal` detail image, tied to `section.svg`, to show the 205 mm wall and deep reveals.
- Left the two blocked interiors without generation prompts.

## What is still needed

- Test the improved prompts in a model that supports reference conditioning.
- Add the reference image to the generation workflow; text-only will keep
  inventing massing.
- Record known deviations in the caption of any generated draft.
- Reconcile the two authored interiors before generating them.
- Use a hosted API or a dedicated machine, not this laptop, for a full set.

## Related

- [`image-descriptions.md`](image-descriptions.md)
- [`reference-conditioned-generation.md`](reference-conditioned-generation.md)
- [`visualisation-v2-brief.md`](visualisation-v2-brief.md)
- [`../data/image-descriptions.json`](../data/image-descriptions.json)
