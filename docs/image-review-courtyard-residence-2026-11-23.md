# Review: Courtyard Residence image set

**Status:** Review complete. **None of the six images is publishable.** This is
the closest set so far on massing and pattern intent: the L, the courtyard, the
green roof, the glazed link and the two 40 ft modules are right. It fails on the
**installed PV** (explicitly excluded), the **black metal cladding** (the model
is timber), the **wall-of-glass openings**, the **furnished interiors** (the
model has a provisional zone study), the missing deep reveals and pile base, and
the board's inconsistent plan and axonometric.

**Subject:**

| # | Image | What it shows |
| --- | --- | --- |
| 1 | `-6` | Elevated exterior of the L, green roofs, PV, courtyard, lake |
| 2 | `-5` | Bedroom with a large courtyard-facing window |
| 3 | `-4` | Kitchen and dining with courtyard glazing |
| 4 | `-3` | Living room with a wall of glass to the courtyard |
| 5 | `-2` | Courtyard as an outdoor room |
| 6 | `Courtyard Residence Architectural Collage` | Board: exterior, courtyard, living, kitchen, bedroom, plan, axonometric, pattern notes |

**Compared against:** `data/design-lab.json` → `hamlet-courtyard-residence`
(design hash `30eb578a`, scene hash `6669c001`), the
`courtyard-residence-exterior-hero` and `courtyard-residence-interior-hero`
records, the v2 completion criteria in
[`visualisation-v2-brief.md`](visualisation-v2-brief.md), and the review contract
used for the first three homes.

**Method:** visual comparison against the model facts. The set is a coherent
group of views of one home, not six candidates. The camera and prompt are
unknown; dimensions are qualitative.

## The model in one paragraph

Courtyard Residence is **two 40 ft timber modules in an L**, each 12.192 ×
2.438 m nominal and 12.602 × 2.848 m finished. `m1` runs east-west with the
sleeping, bathroom, dining and living zones; `m2` runs north-south with the
kitchen, workspace, storage and circulation zones. The L wraps a **sheltered
courtyard** with a covered north porch **6.4 × 2.8 m**, a courtyard deck
**1.4 m** deep, and a **2.4 × 1.6 m glazed timber link** at 45°. The roof is a
**flat green-roof concept** with a 0.5 m overhang; drainage, outlet, overflow,
ponding, root protection and fire are **unresolved**. There is **no installed
PV**. Cladding is **timber** for both modules. The envelope adds **205 mm**;
the modules sit at 0.6 m. The interior is **provisional** — eight zone bands, no
partitions, no doors, no fixtures — and the interior hero is a **zone study**.
The exterior hero asks for a **narrow strip of lake light** through pine trunks,
not a waterfront.

## What the set gets right

- **The L.** Two long wings at 90° with a courtyard in the angle. This is the
  closest match so far to the selected home's massing.
- **The courtyard as an outdoor room.** Image 5 is the best view in the set: a
  paved courtyard enclosed by glazed walls, a dining table, planters, green
  roofs and a clear edge. Pattern 163 and 106 are legible.
- **The green roof.** A low, planted edge with flowers and grasses. The concept
  is right; the drainage must stay unresolved and be captioned.
- **The glazed timber link.** The link between the wings is present and reads as
  the connection, even if it is oversized.
- **Two 40 ft modules.** The wings are long and narrow enough to read as
  containers.
- **No stove, chimney, hydrant or cistern.** Correct.
- **No gutter or downspout.** Correct, because the flat green-roof drainage is
  unresolved.
- **No people, no text, no watermark; consistent late-summer light.**
- **The board's pattern notes are its strongest element.** #106 Positive
  Outdoor Space, #163 Outdoor Room, #36 Degrees of Publicness, #127 Intimacy
  Gradient, #159 Light on Two Sides and #180 Window Place are all in the
  project's pattern set, and the explanations are clear. #36 is a good addition
  for the courtyard threshold.

## Shared failures

### H — installed PV

The model has `solar_array.enabled = false`; the exterior record's
`mustNotShow` explicitly forbids "an installed PV array" and the caption says
"No PV is installed." Image 1 shows a large tilted array on the left wing's
green roof, and the board's axonometric shows PV on the same roof. This is a
direct contradiction of the model, not a styling choice.

### H — black metal cladding

Both modules are **timber** in the model. The images clad the wings in black
corrugated metal and reserve timber for the link and soffits. The metal is a
strong container expression, but it is not the documented material. The board's
axonometric does the same.

### H — the openings are a wall of glass

The recorded openings are specific and modest:

- `m1` north: courtyard sliding doors 2.6 m at 6.2 m, dining window 1.4 m at
  3 m; south: bedroom 1.4 m at 2 m, bathroom 0.8 m at 9.6 m; east entry 0.95 m;
  west garden window 1.2 m.
- `m2` north: kitchen 1.2 m at 2.2 m, courtyard window 1.6 m at 4.8 m, studio
  doors 2.0 m at 8.2 m; south: workspace 1.2 m at 2.4 m, garden 1.4 m at 7.6 m.

The images replace most of these with continuous 6–10 m glazed walls. The
living room's glass wall is far wider than the recorded partial wall opening;
the kitchen window is about twice the recorded 1.2 m; the bedroom's courtyard
window is not in the opening list; the courtyard view shows full-height glazing
where the model has windows and two door sets. This changes the thermal,
structural and privacy story.

### H — the provisional interior is furnished as a home

The interior is eight zone bands with **no partitions, no doors and no
fixtures**. The interior record's `mustNotShow` lists partitions, doors,
bathroom enclosures, beds, sofas, tables, kitchen counters and other fixtures,
a room-specific window not in the list, a kitchen hood, a service core, a green
roof seen through the ceiling, and a room layout.

The images show a furnished bedroom with a large bed and nightstands, a fitted
kitchen with a fridge and cabinets, a dining table for four, a living room with
a sofa, coffee table, pouf and armchair, and a bedroom that reads as an enclosed
room. None of that is modelled. The zone study is a legitimate image; a
furnished room layout is not.

### H — the finished envelope is missing

- The glass and door frames sit nearly flush with the cladding; no ~205 mm
  reveal is legible.
- The wings sit on a slab or plinth at grade; the 0.6 m undercroft and piles
  are absent.
- The roof edge is a thin metal fascia; the 250 mm roof and 200 mm floor
  insulation are not visible.
- The green roof reads as a resolved planted assembly. The record says the
  slope, outlet, overflow, ponding and root protection are unresolved, and the
  caption must say so. The clean edge implies a resolved roof.

### H — no captions, scene hash or review status

None of the six carries the required caption, scene hash `6669c001`, review
status, known deviations or the "illustrative interpretation, not a
construction drawing" label.

### M — the exterior camera is elevated, not eye level

The exterior hero asks for a 1.6 m eye-level view from the east approach at the
courtyard corner. Image 1 is an elevated/aerial view looking down on the roofs
and courtyard. It shows the L and green roofs well, but it is a different view
type. The board's top-left panel uses the same elevated view.

### M — the lake is too prominent

The hero asks for a **narrow strip of lake light** beyond the west end, seen
through pine trunks, and explicitly no waterfront. Image 1 shows a wide, close
lake beyond the right wing. The courtyard view keeps the lake as a glimpse,
which is better.

### M — the courtyard and link are oversized

The recorded covered porch is 6.4 × 2.8 m and the deck projects 1.4 m. The
images show a much larger paved courtyard and a glazed link/porch that reads as
a full room. The outdoor room is the right idea; its size and enclosure are not
the model's.

### M — no ember vent, no defensible space

The exterior record asks for closed ember-resistant vents and defensible-space
planting. No vent is visible, and the planting, rocks and grasses press against
the walls and courtyard edge. The 10 m low-fuel intent is not shown.

### M — the board's plan and axonometric disagree

- The **plan** is a U/rectangle with a courtyard notched into the south side:
  living on the left, glazed link across the top, kitchen/dining on the right,
  bath and bedroom at the right. It is a three-sided courtyard.
- The **axonometric** is an L: two wings meeting at a corner, with the courtyard
  open on two sides.
- The plan does not show PV; the axonometric and image 1 do.
- The plan puts the living in one wing and the kitchen/dining in the other; the
  model puts the living and dining in `m1` and the kitchen in `m2`.
- The plan's bath and bedroom sit at the far right; the model's bedroom and bath
  are in `m1` at the west end.

The board is a useful communication piece, but it is not a consistent plan set.

### M — the board's plan and axonometric are generated

They are illustrations, not the canonical `site-facing.svg`,
`interior-plan.svg` or plan drawings. The project's rule is that the
deterministic drawings stay primary. The board should use the canonical plan,
not a generated one.

### M — finishes and services

The interiors present wood ceilings, oak joinery, stone counters and black
frames as specified. Interior finishes are not documented; disclose them as
illustrative. No service core, HRV terminal, bathroom exhaust or kitchen hood
is shown, and none is modelled.

## Per-image notes

### 1 — elevated exterior

Best massing view: the L, green roofs, courtyard, link and forest all read. It
also contains the two clearest violations: the PV array and the black metal
cladding. The elevated camera, wide lake and slab base compound it. Use it as a
massing study, not a hero.

### 2 — bedroom

A warm, plausible room, but it is the most contradictory interior: a large
courtyard-facing window in a zone whose recorded window is a 1.4 m south window,
a king-size bed in a 3.8 × 2.3 m zone, and an enclosed room where the model has
no partitions. The green roof and the other wing visible through the window are
a nice touch, but they confirm the window is not the recorded one.

### 3 — kitchen and dining

A generous, well-lit kitchen; the model's kitchen is 3.4 × 2.3 m and the dining
zone is in the other module. The image combines them, adds a fridge, cabinets,
a dining table and a 2.5 m window, and opens a wall of glass to the courtyard.
It is a good kitchen, not this home's kitchen.

### 4 — living room

The glass wall to the courtyard and the green roof beyond are the right idea,
but the living zone is 3.3 × 2.3 m with a partial wall opening, not a 6–8 m
glazed wall. The sofa, coffee table, pouf, armchair and bookshelf are all
unmodelled. The room reads as a large open-plan living/dining space, not a
container zone.

### 5 — courtyard

The best image in the set. The courtyard as a defined outdoor room, the green
roof edge, the glazed walls, the table and planters, the rock and flowers all
work. The glazing is still too extensive, the paving is larger than the 1.4 m
deck, and the ember vent and defensible-space intent are absent, but this is the
view to keep as the pattern reference.

### 6 — board

The best board format so far: a clear title, pattern notes, a plan, an
axonometric and room views. It is also the most internally inconsistent: U plan
vs L axonometric, PV in the axonometric but not the plan, living/kitchen/dining
in the wrong wings, and furnished interiors for a provisional zone study. It
should be rebuilt, not discarded.

## What would make a publishable set

1. **Remove the PV.** It is explicitly excluded; the green roof is the energy
   story, and the roof drainage is unresolved.
2. **Use timber cladding** for both modules. If a metal accent is wanted, it
   must be recorded as a material change first.
3. **Follow the exact opening schedule.** No continuous glass walls; the
   courtyard doors are 2.6 m, the studio doors 2.0 m, the windows 0.8–1.6 m.
4. **Keep the interior a zone study**, or author the interior first. No
   partitions, doors, fixtures, loose furniture or room-specific windows until
   the interior is modelled. The interior hero is ready as a zone study; use
   that.
5. **Show the finished envelope:** ~205 mm reveals, 250 mm roof, 200 mm floor,
   0.6 m pile base, no slab/plinth, cross-bracing and corner castings.
6. **Caption the green roof as a concept.** No resolved outlet, overflow,
   gutter or downspout; state that drainage, load, root protection and fire are
   unresolved.
7. **Show the ember vent and defensible space**, and keep the lake to a narrow
   strip through pines.
8. **Make the board agree with itself and the model:** one plan (the L), one
   courtyard enclosure, one material palette, one set of openings, no PV.
9. **Use the canonical drawings** for the plan and axonometric, not generated
   illustrations.
10. **Caption every image and the board** with scene hash `6669c001`, review
    status, known deviations and "not a construction drawing".

## Ready-to-paste `knownDeviations`

```json
{
  "exterior": [
    "installed PV array on the left wing roof; the model records no PV and the exterior record forbids it",
    "black metal cladding on both wings; the model cladding is timber",
    "continuous glazed walls instead of the documented 2.6 m courtyard doors, 2.0 m studio doors and 0.8-1.6 m windows",
    "elevated/aerial camera; the exterior hero asks for a 1.6 m eye-level view from the east approach",
    "wide lake beyond the right wing; the hero asks for a narrow strip of lake light through pine trunks",
    "slab/plinth at grade; no 0.6 m undercroft or piles",
    "glass and door frames nearly flush; no ~205 mm reveal",
    "green roof reads as a resolved planted assembly; drainage, outlet, overflow and root protection are unresolved",
    "no ember-resistant vent or defensible-space zone",
    "no caption, scene hash or review status"
  ],
  "bedroom": [
    "large courtyard-facing window not in the opening list; the recorded bedroom window is 1.4 x 1.3 m on the south face",
    "enclosed bedroom with partitions/doors; the model has no partitions or doors",
    "king-size bed, nightstands, art, rug and plant are not modelled",
    "room reads about 4.5 x 4 m; the model's sleeping zone is 3.8 x 2.3 m",
    "flat wood ceiling and wood lining are illustrative, not specified"
  ],
  "kitchen": [
    "kitchen and dining combined in one open room; the model puts the kitchen in m2 and the dining in m1",
    "wall of glass to the courtyard; the recorded kitchen window is 1.2 m and the courtyard doors are in the dining zone",
    "fridge, cabinets, sink, dining table and chairs are not modelled",
    "kitchen window about 2.5 m; the recorded window is 1.2 m",
    "no service core or kitchen exhaust modelled"
  ],
  "living": [
    "6-8 m glass wall to the courtyard; the model has a partial wall opening and the 2.6 m courtyard doors are in the dining zone",
    "sofa, coffee table, pouf, armchair, bookshelf, rug and plants are not modelled",
    "living reads as a large open-plan living/dining room; the model's living zone is 3.3 x 2.3 m",
    "wood lining and flat ceiling are illustrative, not specified"
  ],
  "courtyard": [
    "glazed walls larger than the recorded openings",
    "courtyard paving larger than the modelled 1.4 m deck projection",
    "no ember-resistant vent or defensible-space zone",
    "green roof edge reads as a resolved assembly; drainage and overflow are unresolved",
    "no caption, scene hash or review status"
  ],
  "board": [
    "plan is a U with a three-sided courtyard; the axonometric is an L; they disagree",
    "installed PV shown in the axonometric and exterior but not in the plan; the model has no PV",
    "black metal cladding; the model cladding is timber",
    "living in one wing and kitchen/dining in the other; the model puts living and dining in m1 and the kitchen in m2",
    "bath and bedroom at the far right; the model's bedroom and bath are in m1 at the west end",
    "furnished interiors for a provisional zone study; no partitions or fixtures are modelled",
    "generated plan and axonometric instead of the canonical drawings",
    "no scene hash, review status, known deviations or 'not a construction drawing' caption"
  ]
}
```

## Recommendation

- **Keep the massing and the courtyard.** This is the first set where the
  selected home is legible: the L, the green roof, the link and the courtyard
  are the right idea. Do not start over from a generic cabin.
- **Keep image 5 as the pattern reference** and the board's format. Rebuild the
  rest.
- **Remove the PV, restore timber cladding and the exact openings.** These are
  the three changes that would move the exterior from "a different home" to
  "this home".
- **Do not publish the interiors.** The interior is a provisional zone study;
  either publish the zone study (no partitions, fixtures or loose furniture) or
  author the interior first. The bedroom, kitchen and living images are room
  layouts that the model does not support.
- **Fix the board.** One plan, one axonometric, one material palette, no PV; use
  the canonical drawings and add the caption and scene hash.
- **Caption the green roof as a concept** and show the ember vent and
  defensible space before the exterior is published.

## Limits of this review

- Visual comparison only; no photogrammetry, lens calibration or camera match.
- No provider, prompt or seed metadata was supplied.
- No structural, energy, fire, plumbing or code assessment is made or implied.
- The green roof, drainage, load and fire performance are unresolved in the
  model and are not assessed here.
- The set is treated as one home's views plus a summary board; if any image was
  meant for a different design, the same geometry, material and interior gates
  apply.

## Related

- [`image-review-cross-stacked-retreat-2026-11-23.md`](image-review-cross-stacked-retreat-2026-11-23.md)
- [`image-review-woodland-cottage-2026-11-23.md`](image-review-woodland-cottage-2026-11-23.md)
- [`image-review-offset-stack-2026-11-23.md`](image-review-offset-stack-2026-11-23.md)
- [`image-review-accessible-garden-home-2026-11-23.md`](image-review-accessible-garden-home-2026-11-23.md)
- [`image-descriptions.md`](image-descriptions.md)
- [`reference-conditioned-generation.md`](reference-conditioned-generation.md)
- [`visualisation-v2-brief.md`](visualisation-v2-brief.md)
- [`../data/image-descriptions.json`](../data/image-descriptions.json)
