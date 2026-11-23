# Review: Accessible Garden Home image set

**Status:** Review complete. **None of the three images is publishable.** The
presentation board (C) is the most useful communication piece, but its plan,
axonometric and exterior disagree with each other and with the model. The
collage (B) has the closest plan proportion but adds a wood stove and a
non-accessible bathroom. The two-wing image (A) is a different home.

**Assumption:** the third image is explicitly labelled **Accessible Garden
Home**, so the set is reviewed against `hamlet-accessible-garden-home`. Image A
is a two-wing/courtyard composition and image B is a compact one-bedroom cabin;
neither is the modelled Accessible Garden Home. If image A was intended for the
**Courtyard Residence**, it fails that model too (no L, no 45° glazed link, no
flat green roof, no timber cladding), so the verdict does not change. If the
intended home was another one, say so and this review will be re-run.

**Subject:**

| Label | File | What it is |
| --- | --- | --- |
| **A** | Modern Woodland Container Cabin | Single exterior: two metal-clad wings, a central gabled timber link and porch, a flue and stone steps |
| **B** | Modern Forest Cabin Design Collage | Six panels: exterior, living/kitchen, bedroom, exterior, floor plan, exterior |
| **C** | Accessible Garden Home Presentation Board | Board: exterior, living, porch, kitchen/dining, bedroom, plan, axonometric and pattern notes |

**Compared against:** `data/design-lab.json` → `hamlet-accessible-garden-home`
(design hash `98e11bf7`, scene hash `61536ceb`), the
`accessible-garden-home-exterior-hero` and
`accessible-garden-home-interior-hero` records, the v2 completion criteria in
[`visualisation-v2-brief.md`](visualisation-v2-brief.md), and the same review
contract used for the first two homes.

## Verdict

| | Massing | Plan | Accessible bath | Stove / flue | Interiors | Rank |
| --- | --- | --- | --- | --- | --- | --- |
| **A** | Two wings + gable link; not the model | No plan | Not shown | **Flue** | Exterior only | 3 |
| **B** | Long single-storey; plan is compact | Closest proportion, wrong arrangement | **Tub + small bath** | **Wood stove + flue** | Furnished rooms; interior blocked | 2 |
| **C** | Long single-storey; board self-inconsistent | Linear plan, not the double-width | **Tub + small bath** | None (good) | Furnished rooms; interior blocked | **1** |

**The model in one paragraph.** Accessible Garden Home is **two 20 ft modules
side by side**, each 6.058 × 2.438 m nominal and 6.468 × 2.848 m finished, for a
double-width footprint of about **6.47 × 5.70 m**. Living and kitchen are in
`m1`; bedroom, bathroom and storage are in `m2`. The bathroom is **3.1 × 2.3 m**
with a modelled **1.5 m turning circle**, a 0.9 m door, a shower, WC and sink.
The entrance is **1.0 m** wide with a **0 m threshold**; circulation is **1.2 m**;
the covered terrace is **4.6 × 2.8 m** on the south face of `m2` with a **1.2 m**
level deck; the canopy roof is flat with a 1.2 m overhang; cladding is timber;
the module sits at 0.6 m on piles; there is **no PV** and **no stove**. The
interior hero is **blocked-pending-reconciliation**; only the exterior hero is
ready.

## What C gets right

- **The pattern story is legible and well labelled.** #112 Entrance Transition,
  #163 Outdoor Room, #127 Intimacy Gradient, #159 Light on Two Sides and #180
  Window Place are the right kind of patterns for this home, and the board
  explains each one.
- **The garden setting is right in spirit:** a planted garden approach,
  boulders, ferns and flowers, a covered porch as an outdoor room.
- **Single level, no stair, no PV, no stove, no chimney.** The model excludes
  PV and combustion, and the board respects that.
- **The porch is shown as a room, not a leftover edge** — seating, plants, a
  timber ceiling and a direct garden view.
- **No "fully accessible" or code-compliance claim.** The board does not use the
  forbidden claim. It still needs the "potentially adaptable, not verified"
  qualifier.
- **The communication format is the best of the three.** A board with a plan,
  axonometric, pattern notes and room views is the right way to explain this
  home. The problem is the content, not the format.

## C — the presentation board

### H — the plan is a different home

The board's plan is a **long single-storey rectangle**: porch at one end, then
living, dining/kitchen, a central bath, and a bedroom at the far end. It is
roughly 12 m long and 4.5 m deep. The model is a **6.47 × 5.70 m double-width**
home with living/kitchen in one module and bedroom/bath in the other.

The plan also puts the porch at the **living** end; the model puts the terrace on
the south face of `m2`, the bedroom/bath module. The plan's bath is central and
small; the model's bath is 3.1 × 2.3 m with a 1.5 m circle. The plan's living,
dining and kitchen are one open space; the model's living and kitchen are
separate rooms with a 0.9 m door. This is not a small drafting difference: it is
a different plan.

### H — the board disagrees with itself

- The **plan** puts the porch at the **left** end.
- The **axonometric** puts the porch in the **middle** of the long facade.
- The **exterior photo** puts the porch at the **right** end.
- The **axonometric** shows a pitched/gabled roof; the **exterior** shows a
  flat/shed canopy; the model is a flat 0° canopy.
- The **plan** is a long thin home; the **exterior photo** is a long
  single-storey; the model is a compact double-width.

A board whose plan, axonometric and hero photo show three different houses
cannot be published.

### H — the bathroom is not the accessible bathroom

The board's plan shows a small bathroom with a **bathtub**, a WC and a sink.
The model's bathroom is **3.1 × 2.3 m**, with a **1.5 m turning circle**, a 0.9 m
door and a shower — no tub. The board's bath door reads about 0.8 m, and no
turning circle or transfer space is shown. For the accessible demonstration,
this is the wrong room.

### H — the interior is blocked and the board publishes it anyway

The `accessible-garden-home-interior-hero` record is
`blocked-pending-reconciliation` because the authored rooms and the recorded
openings do not reconcile. The board nevertheless publishes four interior views:
a large open living/dining/kitchen, a galley kitchen with a dining table, a
bedroom with a large bed, and a porch. The interior hero's `mustNotShow` forbids
loose furniture, rugs, lamps, plants and dishes, a second entrance or garden
doors in the living module, a service core, a hood or an HRV terminal, and
requires only the 1.8 × 0.55 m counter and the 0.7 × 0.7 m table. The board shows
all of the forbidden things and none of the authored room sequence.

### H — the "central service core" claim is unsupported

The board's plan caption says the home has "a central service core". The model
has no service-core geometry; the service is a water-heater/electrical reserve
in the `m2` storage zone. The interior record explicitly forbids a service core.
The caption asserts a design element that is not modelled.

### H — no canonical drawing, no status, no hash

The plan and axonometric are generated illustrations, not the canonical
`plan-ground.svg`, `interior-plan.svg` or `site-facing.svg`. The project's rule
is that the deterministic drawings stay primary and a generative image must not
replace them. The board carries no scene hash, review status, known deviations
or "not a construction drawing" caption.

### M — the envelope and services are missing

- The exterior sits on a slab/plinth at grade; the 0.6 m pile base and
  undercroft are absent.
- Door and window frames are nearly flush; no ~205 mm reveal is legible.
- The cladding is black corrugated metal and timber; the model's cladding is
  timber for both modules. A metal accent is a design change, not a documented
  material.
- No gutter, downspout, ember vent or defensible-space zone is shown.
- The windows are larger than the recorded 1.4 m living, 1.0 m kitchen and
  0.8 m bathroom windows.
- The porch is raised above the gravel with a step; the model's threshold is 0.
- The garden is a flower garden; the exterior hero asks for fern, hemlock and a
  distant plane of lake light, more forest than water.
- The board omits pattern **155 Old Age Cottage**, which is in both image
  records, and adds 180 in places where the record does not.

### M — scale

The living area reads about 10 m long and 5 m wide; the model's living is
2.7 × 2.3 m and the kitchen 2.1 × 2.3 m. The bedroom reads about 4 × 4 m; the
model's is 2.7 × 2.3 m. The kitchen has a full fridge, a long counter and a
dining table; the model records a 1.8 × 0.55 m counter and no fridge.

## B — the compact collage

### H — a wood stove and flue

The living/kitchen panel has a freestanding **wood stove with a black flue**.
The model records heat-pump heating and forbids a stove or chimney. The stove
and flue alone disqualify the set.

### H — the bathroom is small and has a tub

The plan's bath is about 2.2 × 2.2 m with a **tub**, a shower, a WC and a sink.
It is not the 3.1 × 2.3 m accessible bathroom with the 1.5 m turning circle and
0.9 m door. The bath door reads about 0.8 m.

### H — the plan is close in proportion, wrong in arrangement

The compact plan is the closest of the three to the model's double-width
proportion (about 8 × 6.5 m versus 6.47 × 5.7 m). But:

- the porch is on the south side of the **living/kitchen**; the model's terrace
  is on the south face of the **bedroom/bath** module;
- the bedroom and bath are on the north side, the living/kitchen on the south,
  and the porch runs along the living/kitchen;
- the living and kitchen are one open space;
- the bath is beside the bedroom but not in the modelled position;
- no 1.2 m route or level threshold is shown, and the porch has a step.

### H — the exterior and plan disagree

The plan is a compact double-width home; the exterior panels show a long
single-storey with a long facade and a porch at the end. The two cannot be the
same building.

### H — the interior is published as a room layout

The same issue as C: the interior hero is blocked, and the collage shows
furnished rooms, loose furniture, rugs, plants and a dining set. The model's
interior record allows only the counter and table.

### M — the site and envelope

The garden/rock setting is plausible, but the module sits on a slab, the reveals
are thin, there is no gutter/downspout/ember vent, and the home has no PV
(which is correct); the stove is not.

## A — the two-wing image

### H — it is not this home

The image is a symmetrical two-wing home with a central gabled timber link and a
porch between the wings. The Accessible Garden Home is a compact 6.47 × 5.7 m
double-width home. The image is roughly three times the footprint and reads as a
small lodge.

### H — a flue and a gable

A black flue/chimney is visible on the right wing. No stove or chimney is
recorded. The central gable and clerestory are not the flat 0° canopy.

### H — steps at the entrance

The porch is reached by stone steps. The model's entrance threshold is 0 and the
route is step-free. This contradicts the accessible demonstration.

### M — if it was meant for Courtyard Residence

The Courtyard Residence is two 40 ft modules at 90°, a 45° glazed timber link, a
flat green roof, timber cladding and a courtyard. Image A has two parallel metal
wings, a gabled link, no courtyard enclosure and a flue. It does not match that
model either.

## What would make a publishable board

1. **Use the canonical plan**, not a generated one: two 20 ft modules side by
   side, 6.47 × 5.70 m; living and kitchen in `m1`; bedroom, bathroom and
   storage in `m2`; the 1.4 m internal opening; the 4.6 × 2.8 m terrace on the
   south face of `m2`.
2. **Draw the accessible bathroom correctly:** 3.1 × 2.3 m, 1.5 m turning
   circle, 0.9 m door, curbless shower, WC and sink, grab-bar blocking (not
   invented bars).
3. **Show the step-free route:** 1.0 m entrance, 0 threshold, 1.2 m clear route
   from the terrace through the home; no step at the porch; a level 1.2 m deck.
4. **Respect the interior gate:** unblock and reconcile the interior hero
   before publishing interior views, or show only the exterior, terrace and
   plan. If interiors are shown, use only the authored rooms and the counter and
   table; no loose furniture, rugs, lamps, plants or dishes.
5. **Remove the service-core claim** unless the model gains a service core. The
   current service is a reserve in the `m2` storage zone.
6. **Use the model's materials and envelope:** timber cladding for both modules,
   205 mm reveals, 0.6 m pile base, 250 mm roof, 200 mm floor, flat canopy with
   a 1.2 m overhang, gutter and downspout, ember vent, defensible planting.
7. **Keep the pattern labels accurate:** 112, 155 and 163 for the exterior;
   127, 155 and 159 for the interior; 180 only where the record supports it.
8. **Add the qualifier:** "potentially adaptable, not verified"; no "fully
   accessible" or code-compliance claim.
9. **Add the caption:** scene hash, review status, known deviations and "not a
   construction drawing". A board is a communication piece, not a substitute for
   the canonical drawings.
10. **Make the plan, axonometric and hero agree.** One porch position, one roof
    form, one footprint.

## Ready-to-paste `knownDeviations`

```json
{
  "A": [
    "two-wing massing with a gabled central link; the model is a compact 6.47 x 5.70 m double-width home",
    "flue/chimney shown; no stove or chimney is recorded",
    "stone steps at the porch; the entrance is step-free with a 0 m threshold",
    "central gable and clerestory; the model roof is a flat 0-degree canopy",
    "black metal cladding on the wings; the model cladding is timber",
    "slab/plinth at grade; no 0.6 m pile base"
  ],
  "B": [
    "freestanding wood stove with a flue; the model records heat-pump heating and no stove",
    "small bathroom with a tub; the model has a 3.1 x 2.3 m accessible bathroom with a 1.5 m turning circle and a shower",
    "bath door about 0.8 m; the model door is 0.9 m",
    "porch on the living/kitchen side; the model terrace is on the south face of the bedroom/bath module",
    "compact plan reads about 8 x 6.5 m; the model is 6.47 x 5.70 m",
    "long single-storey exterior does not match the compact plan",
    "step at the porch; the entrance is step-free with a 0 m threshold",
    "furnished room layout; the interior hero is blocked and allows only the counter and table",
    "no caption, scene hash or review status"
  ],
  "C": [
    "linear plan about 12 x 4.5 m; the model is a 6.47 x 5.70 m double-width home",
    "porch at the living end in the plan, mid-facade in the axonometric and at the other end in the photo",
    "small bathroom with a tub; the model has a 3.1 x 2.3 m accessible bathroom with a 1.5 m turning circle and a shower",
    "no 1.2 m route or level threshold shown; a step at the porch",
    "central service core claimed; no service core is modelled",
    "furnished interior views; the interior hero is blocked and forbids loose furniture, rugs, lamps, plants and dishes",
    "generated plan and axonometric instead of the canonical drawings",
    "black metal and timber cladding; the model cladding is timber",
    "pitched/gabled roof in the axonometric; the model roof is a flat 0-degree canopy",
    "window sizes larger than the recorded 1.4 m living, 1.0 m kitchen and 0.8 m bathroom windows",
    "no gutter, downspout, ember vent or defensible-space zone",
    "no scene hash, review status or known deviations; no 'potentially adaptable' qualifier"
  ]
}
```

## Recommendation

- **Reject A.** It is not the Accessible Garden Home, and the flue, steps and
  gable are each independently disqualifying. If it was a Courtyard concept, it
  does not match that model either.
- **Keep B only as a proportion study.** Its compact plan is the closest to the
  model's footprint, but the stove, tub, step and plan arrangement make it
  unusable as a selected-home image.
- **Use C's board format, not its content.** The pattern labels, garden setting
  and room-view layout are the right way to explain this home. Rebuild the
  board on the canonical plan and the authored interior, with the accessible
  bathroom, the step-free route and the model's materials.
- **Unblock the interior first.** The interior hero is blocked; no interior
  view of this home is publishable until the rooms and openings reconcile.
- **Then regenerate the exterior** from `site-facing.svg` with the two-module
  double-width massing, the 4.6 × 2.8 m terrace, the flat canopy, the 205 mm
  envelope, the 0.6 m pile base, the timber cladding and the fern/hemlock/lake
  light site brief.

## Limits of this review

- Visual comparison only; no photogrammetry or dimension scaling.
- The board's plan has no dimensions or scale bar, so its size is estimated
  from the room labels and the recorded furniture.
- No provider, prompt or seed metadata was supplied.
- No structural, energy, fire, plumbing or code assessment is made or implied.
- Accessibility observations are visual; they are not a professional
  accessibility assessment.
- The set is treated as three attempts at the Accessible Garden Home because
  C is labelled that way. If A or B belongs to another home, the massing,
  services and access findings still apply, but the home-specific verdict
  would not.

## Related

- [`image-review-courtyard-residence-2026-11-23.md`](image-review-courtyard-residence-2026-11-23.md)
- [`image-review-woodland-cottage-2026-11-23.md`](image-review-woodland-cottage-2026-11-23.md)
- [`image-review-offset-stack-2026-11-23.md`](image-review-offset-stack-2026-11-23.md)
- [`image-descriptions.md`](image-descriptions.md)
- [`reference-conditioned-generation.md`](reference-conditioned-generation.md)
- [`visualisation-v2-brief.md`](visualisation-v2-brief.md)
- [`../data/image-descriptions.json`](../data/image-descriptions.json)
