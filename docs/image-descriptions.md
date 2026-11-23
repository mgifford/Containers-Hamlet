# Image descriptions for v2

**Status:** Working definition. Sixteen image descriptions are recorded in
[`data/image-descriptions.json`](../data/image-descriptions.json): twelve hero
images (one exterior and one interior for each selected home) and four Woodland
Cottage detail shots. Fourteen are ready; two authored interiors are blocked
because the room polygons and the recorded opening positions do not reconcile.

This document defines **what each image is supposed to draw**. It is not a
construction document, a measured perspective or a service design. The
authoritative geometry remains [`data/design-lab.json`](../data/design-lab.json);
the descriptions add visual intent and explicit exclusions.

## Why a separate description layer

The generated prompt in
[`site/js/design-illustration.js`](../site/js/design-illustration.js) is a model
fact sheet. It lists modules, openings and prohibitions, but it does not say what
the viewer sees, which service elements are in frame, what is deliberately hidden,
or what the caption must disclose. The v1 images showed the gap: a wood stove
without a chimney or outside-air duct, a single rain barrel presented as a water
system and an interior that did not match the model.

The description layer closes that gap without inventing architecture. Every
element in an image is tagged:

| Status | Meaning |
| --- | --- |
| **modeled** | Recorded in the design model and checkable against it. |
| **inferred** | Follows directly from a modeled element, but is not individually authored (for example, a corner casting on a modeled container). |
| **conceptual** | An illustration placement or intent from the project brief. It is not designed; the caption must say so. |
| **not-resolved** | A known gap. It must not appear as a resolved element. |
| **excluded** | Explicitly kept out of the image, with a reason and, where possible, a machine check. |

## The sixteen images

| ID | Home | View | Status | Purpose |
| --- | --- | --- | --- | --- |
| `woodland-cottage-exterior-hero` | Woodland Cottage | exterior | ready | Single-storey cottage, porch, PV, fire/water edge |
| `woodland-cottage-interior-hero` | Woodland Cottage | interior | **blocked** | Authored hall/kitchen/living sequence |
| `woodland-cottage-fire-edge` | Woodland Cottage | detail | ready | Roof edge, ember vent, defensible space |
| `woodland-cottage-water-edge` | Woodland Cottage | detail | ready | Gutter, downspout, first flush, cistern inlet |
| `woodland-cottage-service-core` | Woodland Cottage | detail | ready | Accessible service wall, HRV, filter, condensate |
| `woodland-cottage-accessible-entry` | Woodland Cottage | detail | ready | Level threshold, porch and 1.2 m route |
| `offset-stack-exterior-hero` | Offset Stack | exterior | ready | Two-storey offset, shed roof, ground porch |
| `offset-stack-interior-hero` | Offset Stack | interior | ready | Ground-floor zone study with conceptual stair |
| `courtyard-residence-exterior-hero` | Courtyard Residence | exterior | ready | L, courtyard, glazed link, green-roof concept |
| `courtyard-residence-interior-hero` | Courtyard Residence | interior | ready | Courtyard-facing zone study |
| `cross-stacked-retreat-exterior-hero` | Cross-Stacked Retreat | exterior | ready | Cross volume, butterfly roof, shaded porch |
| `cross-stacked-retreat-interior-hero` | Cross-Stacked Retreat | interior | ready | Ground-floor zone study beneath the cross |
| `accessible-garden-home-exterior-hero` | Accessible Garden Home | exterior | ready | Double-width home, canopy, terrace, level entry |
| `accessible-garden-home-interior-hero` | Accessible Garden Home | interior | **blocked** | Authored living/kitchen/link and turning circle |
| `solar-studio-stack-exterior-hero` | Solar Studio Stack | exterior | ready | Compact stack, PV shed roof, shaded terrace |
| `solar-studio-stack-interior-hero` | Solar Studio Stack | interior | ready | Upper studio zone study with no balcony |

Each record carries a purpose, camera and framing, a `mustShow` list, a
`mustNotShow` list, a visible-service list, a caption, alt text, limitations and a
source hash. The caption and alt text are part of the definition, not an
afterthought: an image that cannot be captioned honestly is not ready.

## The visible-services layer

[`data/image-descriptions.json`](../data/image-descriptions.json) records, per
home, which service elements may appear, where, and at what status. It is an
illustration layer, not a water, fire, ventilation or electrical design.

What the heroes may show:

- **Woodland Cottage:** PV, gutter, downspout, ember vent and defensible-space
  planting. Detail shots add the leaf guard, first-flush device, cistern inlet,
  HRV intake/exhaust, service wall, level threshold and 1.2 m route.
- **Offset Stack / Cross-Stacked Retreat / Solar Studio Stack:** PV, gutter,
  downspout, ember vent and defensible-space planting.
- **Courtyard Residence:** green-roof edge, ember vent and defensible-space
  planting. No gutter, downspout or overflow is resolved because the flat
  green-roof drainage is unresolved.
- **Accessible Garden Home:** gutter, downspout, ember vent, defensible-space
  planting and the level threshold.

What no image may show as resolved:

- a wood stove, chimney or gas supply (none is recorded; heating is a heat pump);
- a hydrant or verified fire cistern (fire-service water access is not confirmed);
- potable rainwater (treatment and testing are not designed);
- a single rain barrel as the system;
- a battery or inverter (none is recorded);
- a noncombustible deck (not recorded);
- installed snow guards (unresolved);
- an upper balcony at an upper door that has no modeled balcony or guarding.

Conceptual placements are allowed only where the caption discloses them. A
conceptual downspout is not a designed downspout.

## Interior policy

Only **Woodland Cottage** and **Accessible Garden Home** have authored interiors.
The other four have provisional zone bands with no partitions, doors or fixtures.
Their interior heroes are deliberately **zone studies**, not room layouts:

- describe the open volume, the recorded perimeter openings and the conceptual
  stair;
- do not invent partitions, doors, fixtures, room-specific windows, a kitchen
  hood or a service core;
- use the caption "not a room layout".

The generated interior prompt used to say "preserve the room boundaries and
door connections shown in the reference plan" for all six homes. That was false
for the four provisional interiors. The generator now distinguishes provisional
room bands from authored interiors and forbids invented walls, fixtures and
room-specific uses; the description layer adds the per-image limitation.

## The two blocked authored interiors

The authored room polygons and the recorded opening positions do not reconcile:

- **Woodland Cottage:** `m1-n2` is named "Kitchen window" but sits at 6.2 m,
  which falls in the authored entrance hall band. `m1-s2` is named "Garden doors"
  but sits in the kitchen band, short of the living room. `m1-w1` is
  named "Living window" but is on the west face, which is the bedroom end in the
  authored plan.
- **Accessible Garden Home:** the south entrance `m2-s1` and garden doors
  `m2-s2` are on the module whose authored rooms are bedroom and bathroom, while
  living and kitchen are in the other module. The authored 1.0 m link door
  `e-d4` sits in the interface partition, but the entry sequence still crosses
  the bedroom/bathroom module.

Writing those two images now would force a choice between the room names and the
opening geometry. The description layer refuses to make that choice silently. The
two records are marked `blocked-pending-reconciliation` and the validator reports
the mismatch. The next step is to correct the interior model or the opening
positions, then regenerate the scene hashes.

## Generation briefs

Each of the 14 ready records now also carries a `generation` object:

- `prompt` — an 89–150 word model-facing brief, front-loading proportion,
  container identity and the view's main visual anchors;
- `negativePrompt` — a model-dependent exclusion list;
- `risk` — `low`, `medium` or `high`;
- `reference` and `referenceRequired` — the deterministic drawing that should
  condition the image, not just prose.

The `mustShow` / `mustNotShow` lists remain the review contract. The generation
prompt must agree with them and must not introduce an element the record
excludes. Critical exclusions are repeated in the positive prompt because
guidance-1 distilled models often ignore a negative prompt.

The local FLUX.2 pilot and the four observed failure cases are recorded in
[`image-generation-findings.md`](image-generation-findings.md). The main lesson:
text alone cannot hold a 5:1 container proportion, a specific window layout or an
open zone plan; the reference drawing is required.

## What is intentionally excluded

- Loose furniture, rugs, lamps, art, plants, books and dishes. Only the modeled
  fixtures (bed, sofa, counter, table, toilet, sink, shower) may be shown.
- Interior finishes presented as specified. Linings, floors, ceilings, joinery
  and window-frame colours are not documented; the images use a neutral pale
  lining with exposed steel at reveals and a neutral dark frame, disclosed as
  illustrative defaults.
- The 58-shot library in
  [`visualisation-prompts.md`](visualisation-prompts.md). It remains creative
  source material, but it is not model-verified and it invents room-specific
  windows, furniture and uses. The sixteen descriptions here supersede it for the
  v2 hero set.
- Lodge interiors. The lodge has no authored interior model; its annotations
  remain text-only.

## How to check

```sh
node tools/check-image-descriptions.mjs
```

The check validates schema, design and scene hashes, geometry counts, room and
opening provenance, service visibility, exclusions against the model, reference-
file existence and the generation brief (present for every ready image, absent
for blocked ones, no positive mention of an excluded service). It reports the two
blocked interiors and the room-opening mismatches as unresolved rather than
failing silently.

The image descriptions are not yet wired into the prompt generator. That is the
next integration step: `promptFor()` should compose the exterior prompt from the
exterior-hero record, and `interiorPromptFor()` from the interior record, with
the status tags and exclusions carried into the text.

## Related

- [`visualisation-v2-brief.md`](visualisation-v2-brief.md)
- [`illustration-pipeline.md`](illustration-pipeline.md)
- [`image-generation-findings.md`](image-generation-findings.md)
- [`water-fire-services.md`](water-fire-services.md)
- [`pattern-lens.md`](pattern-lens.md)
- [`../data/image-descriptions.json`](../data/image-descriptions.json)
