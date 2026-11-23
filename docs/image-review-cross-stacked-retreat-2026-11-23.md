# Review: Cross-Stacked Retreat exterior candidates

**Status:** Review complete. **None of the six is publishable.** The cross
massing, the two 40 ft modules, the butterfly roof (in most), the covered ground
porch, the exposed steel cross-beam and the container identity are right. The
set fails on three hard gates: **upper balconies with railings** (three
candidates), the **upper module material** (the model is timber; most candidates
are metal), and the **site** (the model is a beaver meadow with standing water;
every candidate is a dry forest). Only one candidate shows PV, and it is also
one of the balcony failures.

**Subject:** six 1536 × 1024 exterior candidates, in file order `-1` to `-6`.
The labels used here map to the suffixes:

| Label | File suffix | Upper volume | Balcony | PV | Roof | Rank |
| --- | --- | --- | --- | --- | --- | --- |
| **A** | `-1` | Red metal | No | No | Butterfly | 2 |
| **B** | `-2` | Red metal | **Yes** | No | Butterfly | 6 |
| **C** | `-3` | Black metal | **Yes** | No | Butterfly | 5 |
| **D** | `-4` | Red metal | No | No | Butterfly | **1** |
| **E** | `-5` | Black metal | No | No | Gable/hip, not butterfly | 4 |
| **F** | `-6` | Timber right / green metal left | **Yes** | **Yes** | Butterfly | 3 |

**Compared against:** `data/design-lab.json` → `hamlet-cross-stacked-retreat`
(design hash `a8e30d3c`, scene hash `c59b780d`), the
`cross-stacked-retreat-exterior-hero` and `cross-stacked-retreat-interior-hero`
records, the v2 completion criteria in
[`visualisation-v2-brief.md`](visualisation-v2-brief.md), and the review contract
used for the first four homes.

## The model in one paragraph

Cross-Stacked Retreat is **two 40 ft modules**: `m1` metal at 0.6 m running
east-west, and `m2` timber at 3.896 m rotated 90° to cross it. The roof is a
**butterfly at 12°** with a 0.8 m overhang and **installed PV** on the upper
south slope. The covered ground porch `p1` is **4.2 × 2.8 m beneath the cross**.
The east ground entry is 0.95 m with a 0 m threshold; the upper east door is
**0.9 × 2.1 m with no balcony, deck or guardrail**. The stair is a **dog-leg,
0.9 m wide, 3.0 m run, 2.9 m rise, with a landing**. The site is a **beaver
meadow with sedge, alder, standing water and a south knoll**, not a lake or a
boreal waterfront. The interior is a **provisional zone study** (no partitions,
doors or fixtures). The envelope adds **205 mm**; the modules sit at 0.6 m.

## What the set gets right

- **The cross.** Every candidate reads as a ground bar crossed by a perpendicular
  upper volume. That is the home's signature and it is present.
- **Two 40 ft modules.** The wings are long and narrow enough to read as
  containers.
- **The butterfly roof.** A and B, C, D and F show two roof planes rising to a
  central valley. E does not; it reads as a gable/hip.
- **The covered ground porch.** D, E, F and A show a shaded ground room beneath
  the cross with a table and chairs. That is the right pattern.
- **The exposed steel connection.** D and A show a cross-beam and post at the
  crossing; F shows a steel post. This is the structural expression the hero
  asks for.
- **Container identity.** Corrugation, corner castings, rust, door hardware and
  the module joint are visible. This is a container home, not a cabin.
- **No lake, no waterfront, no stove, no chimney, no people, no text.**
- **A coherent palette of forest, rock, birch and pine**, even if it is the
  wrong site.

## Shared failures

### H — upper balconies and guardrails

The exterior record's `mustNotShow` is explicit: **no balcony, deck or guardrail
at the upper east door**, because no balcony, deck or guarding is modelled. The
discrepancy file records the same unresolved condition.

B, C and F show large upper terraces with cable or steel railings, chairs and
planters. Those are direct, hard failures. They also imply a resolved upper
access and guarding condition that the model does not have.

### H — the upper module is not timber

The model's `m2` is **timber**. A, B and D show a red metal upper volume; C and
E show a black metal upper; F shows a timber right-hand upper volume but a green
metal left-hand upper volume. Only F is partially correct. The metal uppers are
a strong container expression, but they are not the documented material.

### H — PV is missing in five of six

The model has `solar_array.enabled = true` and the upper roof is a solar roof.
Only F shows a PV array. A, B, C, D and E have bare metal roofs. The energy
story is absent from five candidates.

### H — the site is wrong

The hero asks for a **beaver meadow, sedge, alder, standing water and a south
knoll**, and explicitly **no lake**. Every candidate is a dry forest floor with
birch, pine, rock and gravel. The meadow, the sedge, the alder and the standing
water are absent. This is not a small styling difference: it removes the site
story that distinguishes this home from the other five.

### H — the glazing is a wall of glass

The recorded openings are modest: a 2.8 m ground living slider; 1.2 m ground
north and west windows; 1.6 m upper studio and bedroom windows; 1.2 m upper west
window; the 0.9 m upper east door. The candidates use continuous 6–10 m glazed
walls on both floors. This changes the thermal, structural and privacy story,
and it erases the distinction between the documented openings.

### H — the finished envelope is missing

- Window and door frames sit nearly flush with the cladding; no ~205 mm reveal
  is legible.
- The containers sit on a slab, plinth or grade; the 0.6 m undercroft and piles
  are absent.
- The roof edge is thin; the 250 mm roof and 200 mm floor insulation are not
  visible.
- The result reads as a thin-skinned box on a slab, not the clad, drained,
  insulated assembly.

### H — no captions, scene hash or review status

None carries the required caption, scene hash `c59b780d`, review status, known
deviations or the "illustrative interpretation, not a construction drawing"
label.

### M — the upper east door is missing or replaced

The model records a 0.9 × 2.1 m upper east door with no balcony. The candidates
show a large window or a glazed corner in that position, and the three balcony
candidates imply a door onto the terrace. The recorded door is not clearly
shown, so neither the door nor the "no balcony" condition can be read.

### M — decks and steps

The model has **no deck**; it has the 4.2 × 2.8 m covered porch under the cross.
Most candidates add a large timber deck with steps down to the gravel. The
recorded entrance is step-free with a 0 m threshold; a stepped deck at the main
approach contradicts that, and the deck itself is not modelled.

### M — the fire pit

E adds a circular fire pit with an open flame in the yard. No fire pit, stove,
chimney or hydrant is recorded, and the project's fire story is built around
defensible space and ember resistance. An open fire beside the house is a new
fire risk, not a rendering detail.

### M — no gutter, downspout, ember vent or defensible space

The exterior requires a gutter and one downspout on the low south eave, closed
ember-resistant vents and defensible-space planting. None is visible, and the
planting and rocks press against the walls and deck.

### M — roof pitch, overhang and valley

The model is a 12° butterfly with a 0.8 m overhang. The candidates' roofs read
steeper, with larger overhangs, and the valley is drawn as a clean resolved
detail. The butterfly valley drainage, overflow and ponding are unresolved in
the model and must be captioned.

### M — the ground porch and deck are oversized

The recorded porch is 4.2 × 2.8 m. The candidates show a much larger deck and,
in some, a full-width terrace. The outdoor room is the right idea; its size and
the added deck are not the model's.

## Candidate notes

### D — `-4` — best base

The closest to the model: a clear cross, a butterfly roof with a valley, a
covered ground porch, no upper balcony, and a visible steel cross-beam. It fails
on the red metal upper (the model is timber), the missing PV, the dry forest
site, the wall-of-glass openings, the thin reveals and the slab base. Start
here: change the upper to timber, add PV, reduce the glazing to the opening
schedule, set the house in the meadow, and add the reveals, piles, gutter and
ember vent.

### A — `-1`

Very close to D: cross, butterfly, no upper balcony, ground deck with chairs,
corner castings and a steel frame. It shares D's red metal upper, missing PV,
dry site and wall-of-glass, and it adds a stepped deck. Rank 2 because it keeps
the no-balcony gate.

### F — `-6`

The only candidate with PV and a timber upper (on the right), and the butterfly
roof and ground porch are right. It also has a large upper terrace with a
railing — a hard failure — and a green metal upper on the left. If the terrace
and railing are removed and the left upper is timber, it becomes the strongest
candidate. Rank 3 because the balcony gate is failed.

### E — `-5`

A dramatic dusk view with a ground fire pit and a large deck. The roof reads as
a gable/hip rather than a butterfly, the fire pit is an unmodelled fire risk,
the upper is black metal, PV is missing, and the site is dry forest. Rank 4:
usable as a mood image only.

### C — `-3`

A clear cross and butterfly, but a large upper balcony with a cable railing, a
black metal upper, no PV and a dry site. Rank 5: the balcony is a hard failure.

### B — `-2`

A strong cross and butterfly, but a large upper balcony with a railing, a red
metal upper, no PV and a dry site. Rank 6: the balcony and the material both
fail, and it is the least distinct of the balcony candidates.

## What would make a publishable set

1. **Use the site-facing reference** (`site-facing.svg`) and the exact modules:
   `m1` metal at 0.6 m, `m2` timber at 3.896 m, rotated 90° to cross.
2. **Show the butterfly at 12° with a 0.8 m overhang and installed PV** on the
   upper south slope.
3. **No balcony, deck or guardrail at the upper east door.** Show the 0.9 × 2.1 m
   door and the unresolved access/guarding in the caption.
4. **Keep the ground porch 4.2 × 2.8 m** and do not add a stepped deck; the
   entrance is step-free with a 0 m threshold.
5. **Use the exact openings:** 2.8 m ground living slider, 1.2 m ground north
   and west windows, 1.6 m upper studio and bedroom windows, 1.2 m upper west
   window, 0.9 m upper east door. No continuous glass walls.
6. **Set the house in the beaver meadow:** sedge, alder, standing water and the
   south knoll. No lake, no dry forest floor, no boreal waterfront.
7. **Show the finished envelope:** ~205 mm reveals, 0.6 m pile base, 250 mm roof,
   200 mm floor, exposed steel connection and cross-beam at the crossing.
8. **Show the services:** gutter and one downspout on the low south eave, closed
   ember-resistant vents, defensible-space planting, no fire pit, no firewood
   against the house.
9. **Caption the roof:** the butterfly valley drainage, overflow and ponding are
   unresolved; the interior butterfly ceiling is not modelled.
10. **Caption every image** with scene hash `c59b780d`, review status, known
    deviations and "not a construction drawing".

## Ready-to-paste `knownDeviations`

```json
{
  "A": [
    "red metal upper module; the model upper module is timber",
    "no PV on the upper south slope",
    "no upper balcony (correct), but a stepped deck is added; the model has no deck and the entrance is step-free",
    "continuous glazed walls instead of the documented 1.6 m upper and 1.2 m ground windows",
    "dry forest and rock site; the model is a beaver meadow with sedge, alder and standing water",
    "slab/grade base; no 0.6 m undercroft or piles",
    "window and door frames nearly flush; no ~205 mm reveal",
    "no gutter, downspout, ember-resistant vent or defensible-space zone",
    "no caption, scene hash or review status"
  ],
  "B": [
    "upper balcony with railing; no balcony, deck or guardrail is modelled",
    "red metal upper module; the model upper module is timber",
    "no PV on the upper south slope",
    "continuous glazed walls instead of the documented openings",
    "dry forest and rock site; the model is a beaver meadow with standing water",
    "slab/grade base; no 0.6 m undercroft or piles",
    "no caption, scene hash or review status"
  ],
  "C": [
    "upper balcony with railing; no balcony, deck or guardrail is modelled",
    "black metal upper module; the model upper module is timber",
    "no PV on the upper south slope",
    "continuous glazed walls instead of the documented openings",
    "dry forest and rock site; the model is a beaver meadow with standing water",
    "slab/grade base; no 0.6 m undercroft or piles",
    "no caption, scene hash or review status"
  ],
  "D": [
    "red metal upper module; the model upper module is timber",
    "no PV on the upper south slope",
    "no upper balcony (correct), but a stepped deck is added; the model has no deck and the entrance is step-free",
    "continuous glazed walls instead of the documented 2.8 m slider and 1.2-1.6 m windows",
    "dry forest and rock site; the model is a beaver meadow with sedge, alder and standing water",
    "slab/grade base; no 0.6 m undercroft or piles",
    "window and door frames nearly flush; no ~205 mm reveal",
    "no gutter, downspout, ember-resistant vent or defensible-space zone",
    "no caption, scene hash or review status"
  ],
  "E": [
    "roof reads as a gable/hip; the model roof is a 12-degree butterfly",
    "open fire pit in the yard; no fire pit, stove or chimney is recorded",
    "black metal upper module; the model upper module is timber",
    "no PV on the upper south slope",
    "no upper balcony (correct), but a stepped deck is added",
    "continuous glazed walls instead of the documented openings",
    "dry forest and rock site; the model is a beaver meadow with standing water",
    "no caption, scene hash or review status"
  ],
  "F": [
    "upper terrace with railing; no balcony, deck or guardrail is modelled",
    "green metal upper on the left; the model upper module is timber",
    "installed PV is correct",
    "stepped deck; the model has no deck and the entrance is step-free",
    "continuous glazed walls instead of the documented openings",
    "dry forest and rock site; the model is a beaver meadow with standing water",
    "slab/grade base; no 0.6 m undercroft or piles",
    "no caption, scene hash or review status"
  ]
}
```

## Recommendation

- **Reject all six as selected-home exteriors.** Three fail the explicit
  no-balcony gate, five have the wrong upper material, five omit PV, and all six
  have the wrong site.
- **Use D as the base.** It keeps the cross, butterfly, ground porch, steel
  cross-beam and no-balcony condition. Change the upper to timber, add PV, use
  the exact openings, set it in the meadow, and add the reveals, piles, gutter
  and ember vent.
- **Use F only as a PV/timber reference.** Remove the upper terrace and railing;
  change the left upper to timber; then it becomes the strongest candidate.
- **Do not use C or B** without removing the upper balcony and changing the
  material.
- **Use E as a mood image only.** The fire pit is a new fire risk and the roof is
  not the butterfly.

## Limits of this review

- Visual comparison only; no photogrammetry, lens calibration or camera match.
- No provider, prompt or seed metadata was supplied.
- No structural, energy, fire, plumbing or code assessment is made or implied.
- The upper balconies are read as balconies because they have decks, railings and
  outdoor furniture at the upper level; if they were intended as unguarded
  shallow projections, they still exceed the modelled condition.
- The set is treated as six exterior candidates for one home. If any candidate
  belongs to another design, the balcony, material, PV and site gates still
  apply, but the home-specific verdict would not.

## Related

- [`image-review-posters-2026-11-23.md`](image-review-posters-2026-11-23.md)
- [`image-review-solar-studio-stack-2026-11-23.md`](image-review-solar-studio-stack-2026-11-23.md)
- [`image-review-courtyard-residence-2026-11-23.md`](image-review-courtyard-residence-2026-11-23.md)
- [`image-review-accessible-garden-home-v2-2026-11-23.md`](image-review-accessible-garden-home-v2-2026-11-23.md)
- [`image-review-accessible-garden-home-2026-11-23.md`](image-review-accessible-garden-home-2026-11-23.md)
- [`image-review-offset-stack-2026-11-23.md`](image-review-offset-stack-2026-11-23.md)
- [`image-review-woodland-cottage-2026-11-23.md`](image-review-woodland-cottage-2026-11-23.md)
- [`image-descriptions.md`](image-descriptions.md)
- [`visualisation-v2-brief.md`](visualisation-v2-brief.md)
- [`../data/image-descriptions.json`](../data/image-descriptions.json)
- [`../data/illustration-discrepancies.json`](../data/illustration-discrepancies.json)
