# Review: six generated views of the first home

**Status:** Review complete. All six images are **rejected** as Woodland Cottage
visualisations. They may be retained only as unlabelled mood material, or
regenerated with the reference drawing and the corrected brief below.

**Subject:** six 1448 × 1086 PNG exports supplied on 2026-11-23, in generation
order `-1` to `-6`: exterior, living, kitchen/dining, bathroom, bedroom, porch.

**Compared against:** `data/design-lab.json` → `hamlet-woodland-cottage`
(design hash `d142126a`, scene hash `4af580f8`), the per-image records in
`data/image-descriptions.json`, [`image-descriptions.md`](image-descriptions.md)
and the v2 completion criteria in [`visualisation-v2-brief.md`](visualisation-v2-brief.md).

**Method:** a visual comparison against the model facts, using the same review
contract as the local FLUX pilot in [`image-generation-findings.md`](image-generation-findings.md):
record what the image invented or omitted, why it matters, and the specific
`knownDeviations` a caption must carry. This is not a measured comparison. The
camera position and lens are unknown, so dimensions and angles are qualitative.
No claim is made about the prompt, model or settings used to make the images.

## Verdict

| File | View | Verdict | Deciding reason |
| --- | --- | --- | --- |
| `-1` | Exterior, garden approach | **Rejected** | Reads as a double-width conventional cottage; no PV, container identity, 205 mm reveals or pile base |
| `-2` | Living room | **Rejected** | Gable-end glazing, vaulted ceiling and a ~5.5 m room; the modeled interior is 2.3 m wide with a flat ceiling and is itself blocked |
| `-3` | Kitchen and dining | **Rejected** | Invents a dining zone, a range without a ducted hood and an open plan; silently resolves the blocked kitchen-window position |
| `-4` | Bathroom | **Rejected** | No 1.5 m turning circle, a curbed shower and no transfer space; the accessible intent is not shown |
| `-5` | Bedroom | **Rejected** | A full-height closet wall, a ~2.4 m window and a vaulted ceiling; the modeled room is 3.1 × 2.3 m |
| `-6` | Covered porch | **Rejected (closest)** | Door, 2.4 m slider, level deck and porch depth agree; container identity, deep reveals and defensible planting do not |

**0 of 6 are publishable.** The porch is the nearest miss: its main subject — a
covered outdoor room — is modeled, and the entrance and garden-door widths agree.
It still fails the container-expression and finished-envelope checks, so it
cannot stand as the first home either.

## What the set actually shows

The six images are internally coherent as a warm, photoreal **timber lake
cottage** with:

- rooms about 4–6 m wide, with a dining table for four and a full-height
  wardrobe wall;
- vaulted, raftered ceilings in the living room, kitchen and bedroom;
- a large sliding-glass wall in the gable end of the living room and another in
  the kitchen, both looking onto the same porch and lake;
- a conventional bathroom with a 1.5 m curbed shower, vanity and WC;
- planting against the wall and deck, and a lake directly behind the house.

The first home is none of those things. It is **one 40 ft module**, 12.192 ×
2.438 m nominal and about **12.60 × 2.85 m finished (4.4:1)**. Inside it is
**2.298 m clear** across, 11.8 m long, with a **flat ceiling** at the container
height, four full-height partitions and four 0.9–1.0 m doors. It has a 24° gable,
a 5.4 × 2.8 m covered south porch with a 1 m level deck, a 0.6 m pile base, PV on
the south slope, a 205 mm added wall (209 mm total) and a lake seen only as a
glimpse through cedar and pine.

The set therefore does not show the first home at a different angle. It shows a
different, much wider building. The interiors also fall outside the publishable
set **before** image review: `woodland-cottage-interior-hero` is
`blocked-pending-reconciliation` because the authored room polygons and the
recorded opening positions do not reconcile. The images silently resolve the very
conflicts the project refuses to resolve:

- a wide kitchen window over the sink resolves the `m1-n2` "kitchen window"
  position that falls in the entrance-hall band;
- a gable-end sliding wall replaces the 2.4 m `m1-s2` garden doors on the long
  south face;
- the bedroom window is treated as a centered feature window, not the recorded
  off-centre `m1-n1` or the `m1-w1` window that is named for the living room but
  sits at the bedroom end.

## Severity legend

| Tag | Meaning |
| --- | --- |
| **H** | Contradicts modeled geometry or a recorded service; or makes a claim the project does not support. Blocks publication. |
| **M** | Changes scale, site story, finish or accessibility reading without necessarily contradicting a dimension. Needs correction or explicit disclosure. |
| **L** | Presentation or detail issue; disclose or fix in the next pass. |

## Per-image review

### `-1` Exterior, garden approach

What matches: one occupied storey; a metal gable roof at a plausible pitch; timber
cladding; a covered porch with a level deck; a 0.95 m entrance door beside a
2.4 m two-panel slider; late-summer late-afternoon light; cedar, pine, rock and a
lake glimpse; no people, text, dormer, chimney, stove, steps, ramp, balcony or
snow guards.

What deviates:

- **H — plan width.** The gable end and the interiors read as a roughly 5.7–6 m
  deep, 12–13 m long cottage. The model is a 2.85 m deep single module. The
  building can no longer be read as 4.4:1.
- **H — opening schedule.** Three window openings appear west of the entrance on
  the visible wall, two of them wide and low-silled. Even allowing one to be the
  west-face window seen obliquely, that leaves two extra windows. The model
  records **one** south window there: the 0.8 × 1.0 m bathroom window at 1.4 m
  sill.
- **H — missing PV.** The visible south roof slope is bare. Installed PV on that
  slope is modeled and must be visible when the slope is in view.
- **H — no container expression.** There is no corner casting, module joint,
  lifting point, corrugation at a protected edge or exposed steel frame. A steel
  knife plate at the porch beam is the only steel detail, and it reads as a
  conventional timber connector. The building is a generic timber cabin.
- **H — no finished envelope.** Door and window frames sit nearly flush with the
  cladding; no ~205 mm reveal is legible. The roof edge is thin. The wall reads as
  a single-layer board wall, not 150 mm insulation + 10 mm break + 25 mm cavity +
  20 mm cladding.
- **H — no pile base.** A continuous dark skirt/plinth runs at grade. The 0.6 m
  undercroft and exposed helical piles are absent, so the building appears to sit
  on the ground.
- **M — no gutter or downspout.** At most a fascia/drip edge is visible. The
  conceptual south gutter and east downspout are part of this view's service
  story.
- **M — no ember-resistant vent.** No fine-mesh eave or gable vent is visible.
- **M — no defensible space.** Ferns, coneflowers and black-eyed Susans grow
  against the wall and deck; a potted hydrangea sits on the porch. The recorded
  10 m defensible-space intent is not shown.
- **M — waterfront, not a glimpse.** The lake is wide, close and directly behind
  the house with a clear shoreline. The brief allows only a glimpse through
  trunks, with the far shore low on the horizon.
- **M — porch ends at the gable.** The porch reads as running to the gable end.
  The model's porch starts 5.1 m along the south face, is 5.4 m long and stops
  about 1.7 m short of the east end.
- **L — camera.** The view is from the south-east, showing the east gable end. The
  record asks for the south-west garden approach with the west gable end.

### `-2` Living room

What matches: a timber-lined interior with a sofa, a strong view to the porch,
forest and lake, warm late-afternoon light, and no stove or chimney. Pattern 180
(Window Place) and 163 (Outdoor Room) are legible.

What deviates:

- **H — width.** The room reads about 5.5 m wide by 6 m long. The modeled living
  zone is 2.5 × 2.3 m (5.75 m²).
- **H — ceiling.** A vaulted gable ceiling with rafters and a ridge beam replaces
  the container's flat ceiling. No interior roof or gable ceiling is modeled.
- **H — glazing position.** A ~3.6 m sliding-glass wall fills the gable end. The
  model puts the 2.4 m garden doors on the long south face; the gable end is
  solid.
- **H — second glass wall.** The kitchen view shows another gable-end slider. The
  plan has one set of garden doors, not two.
- **H — no partitions or hall.** The view is an open-plan room; the modeled
  sequence has a hall, a kitchen and a living room separated by 1.0 m doors.
- **M — side window.** The left-hand window is about 1.8 m wide. The modeled
  living window is 1.0 × 1.3 m, and its recorded position is itself one of the
  blocked items.
- **M — loose furniture.** Coffee table, armchair, side tables, stump table,
  lamps, plants, books, bowl, vases, rug and throw are outside the modeled
  fixtures. Only the 1.5 × 0.8 m sofa is recorded, and the sofa shown is about
  2.5 m long.
- **M — finishes.** The timber lining, floor and window frames are presented as a
  finished scheme. Interior finishes are not documented and must be disclosed as
  illustrative defaults.

### `-3` Kitchen and dining

What matches: a counter with a sink, a forest window, a useful link to the porch
and a domestic scale that a reader can understand.

What deviates:

- **H — dining zone.** A table for four and a rug occupy a room with no dining
  zone in the model. The kitchen is 2.0 × 2.3 m; the counter is 1.6 × 0.55 m.
- **H — range without a hood.** A freestanding range and oven appear with no
  ducted hood and no documented cooking fuel. The brief requires a ducted hood
  and a stated fuel; the model records neither a range nor a hood.
- **H — unresolved window silently resolved.** A wide window sits over the sink.
  `m1-n2` is the blocked "kitchen window" at 6.2 m, which falls in the entrance
  hall band. The description forbids correcting that in an image.
- **H — open plan.** No hall/kitchen partition (`w-p3`), no 1.0 m door, and no
  kitchen/living partition (`w-p4`) appear. The entrance door at the right opens
  directly into the kitchen/dining space.
- **H — gable-end glazing.** The sliding wall is again in the gable end, not the
  south long face.
- **H — vaulted ceiling.** The container's flat ceiling is replaced by a raftered
  gable ceiling.
- **H — counter run.** The counter runs about 5 m, including the range and sink;
  the modeled work counter is 1.6 m.
- **M — unmodeled fixtures and loose items.** Fridge, open shelves, dishes, jars,
  utensils, cutting board, plant, dining table, four chairs and rug are all
  additions. Only the counter is modeled.
- **M — finishes.** Cabinet, worktop, floor and wall finishes are presented as
  specified without disclosure.

### `-4` Bathroom

What matches: a WC, a sink, a shower and a window in a timber-lined room; no grab
bars are invented, and the ceiling is flat, which is the one interior ceiling
that agrees with the container.

What deviates:

- **H — no turning circle.** The room reads about 3.4 × 3 m, but the layout does
  not show a clear 1.5 m diameter circle. The vanity, WC and shower crowd the
  floor, and the model's 2.8 × 2.3 m bathroom is smaller still.
- **H — curbed shower.** The shower has a raised curb of roughly 100–150 mm. The
  accessible intent needs a curbless shower or a documented transfer; a curb
  blocks the route.
- **H — no transfer space.** No transfer space or grab-bar blocking is shown
  beside the WC. The project may not claim an accessible bathroom from this
  layout.
- **M — unmodeled fixtures.** The 1.4 m vanity, mirror, sconce, open shelf,
  basket, towel rail, toiletries, plants and rug are not modeled.
- **M — window.** The window reads about 0.9 × 0.9 m at a ~1.0 m sill over the
  WC. The recorded bathroom window is 0.8 × 1.0 m at a 1.4 m sill on the south
  face, and the room orientation cannot be reconciled with the authored plan.
- **M — no exhaust.** No bathroom exhaust is visible. The brief requires one; its
  absence cannot be confirmed either way from a still, so it is recorded as not
  evidenced.
- **M — finishes.** Tile, stone and joinery are presented as specified without
  disclosure.

### `-5` Bedroom

What matches: a bed, timber lining, a forest window and warm light; no stove or
chimney.

What deviates:

- **H — width and length.** The room reads about 4.5 × 4 m. The modeled bedroom
  is 3.1 × 2.3 m.
- **H — closet wall.** A full-height double wardrobe fills the right wall. No
  closet, wardrobe or additional partition is modeled; the room has four
  partitions and four doors only.
- **H — window.** The window reads about 2.4 m wide and centered. The recorded
  openings are a 1.4 × 1.3 m north window at 1.8 m and a 1.0 × 1.3 m west window
  at 1.2 m; neither is a centered 2.4 m window.
- **H — vaulted ceiling.** The raftered gable ceiling replaces the flat container
  ceiling.
- **M — bed and loose items.** The bed reads as a queen or king (about 1.6–1.8 m
  wide); the modeled bed is 1.4 × 1.9 m. Art, lamps, flowers, books and rug are
  unmodeled.
- **M — door.** A door is visible at the left, but it is not clear whether it
  leads to the bathroom (the only modeled bedroom connection, `w-d1`) or to a
  hall that does not exist in the authored plan.
- **M — finishes.** Lining, floor and joinery are presented as specified without
  disclosure.

### `-6` Covered porch

What matches: a roofed porch with exposed rafters and a beam; a timber deck level
with the interior; a flush threshold; a 0.95 m entrance door; a 2.4 m two-panel
slider; Adirondack chairs, a stump table and a jute rug that read as an outdoor
room (pattern 163); no steps, ramp, snow guards, stove or chimney.

What deviates:

- **H — no container expression.** The same absence as the exterior: no corner
  casting, module joint, lifting point, corrugation or exposed container steel.
- **H — no finished envelope.** The door and slider frames are nearly flush; the
  ~205 mm reveal is absent, so the wall reads thin.
- **M — defensible space.** A potted hydrangea sits on the porch and a fern in a
  stone pot sits at the door; planting presses against the deck.
- **M — loose interior furniture.** The sofa, lamp, coffee table, rug and plant
  visible through the glass are outside the modeled fixture list.
- **L — gutter.** No gutter or downspout is visible at the porch eave. This view
  is not required to show the water edge, but the roof edge is part of the porch
  story.
- **L — finishes.** The door glazing pattern and the cladding profile are not
  documented; disclose as illustrative.

## Cross-image failures

1. **Width.** Every interior is at least ~4 m wide; no view shows the 2.298 m
   clear width. The set cannot be the modeled single module.
2. **Ceiling.** Vaulted in the living room, kitchen and bedroom; flat in the
   bathroom and porch. The set cannot be one building.
3. **Glazing.** The exterior puts the garden doors on the long wall; the living
   and kitchen put sliding walls in the gable ends. Two different plans.
4. **Plan.** No hall, four partitions, four doors or 1.2 m route appears. The
   interiors are open-plan rooms that do not exist in the model.
5. **Services.** No PV, gutter, downspout, ember vent, HRV or service core; a
   range without a hood. The service story is absent.
6. **Accessibility.** A level deck and flush threshold appear, but the 1.2 m
   route, the 1.5 m turning circle and the adaptable bathroom do not.
7. **Site.** The lake is a waterfront; the model allows a glimpse.
8. **Content policy.** Loose furniture, appliances, art, plants, books, dishes
   and specified finishes appear throughout, contrary to the interior policy.
9. **Container identity.** Absent in all six views. This is the single most
   important visual failure: the set reads as a conventional timber cottage, not
   a container home.

## Contract check against the v2 completion criteria

| # | Criterion | Result |
| --- | --- | --- |
| 1 | Generated from the canonical scene with matching modules, storeys, openings, roof, porch, foundation and camera | **No** — width, openings, glazing and foundation differ |
| 2 | Exterior and interior agree on sun, time, materials and geometry | **Partly** — light and materials agree; geometry does not |
| 3 | Ventilation and service terminals shown or clearly accessible | **No** — no PV, gutter, downspout, ember vent, HRV or service core |
| 4 | Stove has a chimney, OAK, hearth and clearance | **N/A** — no stove is shown, which is correct |
| 5 | Kitchen has a ducted hood and documented cooking fuel | **No** — a range appears with no hood and no stated fuel |
| 6 | Accessible home shows the bathroom and 1.2 m route | **No** — no turning circle, curbless shower or 1.2 m route |
| 7 | Container detail is visible | **No** — absent in all six |
| 8 | Caption states scene hash, review status and known limitations | **No** — no captions are supplied |
| 9 | A human has checked the image against the model | **Yes** — this review |
| 10 | Labelled illustrative interpretation, not a construction drawing | **No** — no labels are supplied |

## What would make a publishable set

1. **Reconcile the interior first.** Until the room polygons and the recorded
   openings agree, no interior view of this home is publishable, however good it
   looks. The two blocked records are the gate.
2. **Generate from the reference drawings.** Use `site-facing.svg` for the
   exterior and `interior-plan.svg` for an interior once it is unblocked, with
   the pattern cue and geometry prompt. Text-only generation will keep inventing
   the wide cottage.
3. **Front-load the facts.** One 40 ft module, 12.60 × 2.85 m finished, 4.4:1,
   single storey, 2.298 m clear inside, a flat ceiling at the 2.9 m container
   height, 24° gable, 0.6 m pile base, 205 mm added wall and reveals.
4. **Give the exact opening schedule.** South: 0.8 × 1.0 m bathroom window at
   1.4 m sill, 0.95 × 2.1 m entrance, 2.4 × 2.1 m garden doors. North: 1.4 × 1.3 m
   bedroom window, 1.0 × 1.2 m kitchen window. West: 1.0 × 1.3 m window. No
   gable-end glazing.
5. **Restore container expression.** Corner castings at both ends, a module
   joint, lifting points, exposed steel at the porch beam and corrugation at one
   protected edge. The timber rainscreen may stay; it must not erase the
   container.
6. **Show the finished envelope.** Deep ~205 mm reveals, a thicker roof edge, an
   insulated floor edge, black helical piles and cross-bracing, no plinth.
7. **Show the services.** PV on the south slope, a south gutter and east
   downspout, a fine-mesh ember vent, low-fuel defensible planting to 10 m, and a
   lake glimpsed through trunks rather than a waterfront.
8. **Keep the interior policy.** Only the six modeled fixtures, no loose
   furniture, no closet, no dining set, no range unless the model gains an
   induction hob and a ducted hood, and finishes disclosed as illustrative.
9. **Show the accessible bathroom.** A curbless shower, a clear 1.5 m turning
   circle, a 0.9 m door, grab-bar blocking (not invented bars) and exhaust.
10. **Caption every draft.** Scene hash, review status and the specific
    `knownDeviations` below. "Not a construction drawing" alone is not enough.

## Ready-to-paste `knownDeviations`

Add these to the manifest or review record for each image. They follow the
convention established for the first home's FLUX drafts.

```json
{
  "exterior": [
    "read as a roughly 6 m deep double-width cottage; the model is one 12.60 x 2.85 m finished module (4.4:1)",
    "three window openings west of the entrance; even allowing one to be the west-face window, two are extra to the single 0.8 x 1.0 m bathroom window",
    "no PV array on the visible south roof slope",
    "no corner casting, module joint, lifting point or exposed container steel; reads as a conventional timber cabin",
    "window and door frames nearly flush; no ~205 mm reveal",
    "continuous dark skirt/plinth at grade; no 0.6 m undercroft, helical piles or insulated floor edge",
    "no gutter, downspout or ember-resistant vent visible",
    "planting against the wall and deck; no defensible-space zone",
    "lake reads as a waterfront, not a glimpse through trunks",
    "porch runs to the gable end; the modeled 5.4 m porch stops about 1.7 m short"
  ],
  "porch": [
    "no corner casting, module joint, lifting point or exposed container steel",
    "door and slider frames nearly flush; no ~205 mm reveal",
    "potted plants against the porch and door; no defensible-space zone",
    "loose interior furniture visible through the glass",
    "no gutter or downspout at the porch eave"
  ],
  "living": [
    "room reads about 5.5 m wide; the modeled living zone is 2.5 x 2.3 m",
    "vaulted raftered ceiling; the container ceiling is flat",
    "3.6 m sliding wall in the gable end; the modeled garden doors are 2.4 m on the south long face",
    "a second gable-end sliding wall is invented in the kitchen view; the plan has one set of garden doors",
    "open plan; the modeled hall, kitchen and living are separated by 1.0 m doors",
    "1.8 m side window; the modeled living window is 1.0 x 1.3 m",
    "coffee table, armchair, side tables, lamps, plants, books, bowl, vases, rug and throw are not modeled",
    "sofa reads about 2.5 m; the modeled sofa is 1.5 x 0.8 m",
    "interior finishes are illustrative, not specified"
  ],
  "kitchen": [
    "dining table for four and a rug in a room with no modeled dining zone",
    "freestanding range and oven with no ducted hood and no documented cooking fuel",
    "wide window over the sink silently resolves the blocked m1-n2 position",
    "no hall/kitchen partition or 1.0 m door; the entrance opens into the kitchen",
    "no kitchen/living partition or 1.0 m door",
    "sliding wall in the gable end, not the modeled south garden doors",
    "vaulted raftered ceiling; the container ceiling is flat",
    "counter run about 5 m; the modeled counter is 1.6 x 0.55 m",
    "fridge, open shelves, dishes, jars, utensils, cutting board, plant and chairs are not modeled",
    "finishes are illustrative, not specified"
  ],
  "bathroom": [
    "no clear 1.5 m turning circle",
    "shower has a raised curb (~100-150 mm); the accessible intent needs a curbless shower or documented transfer",
    "WC with no transfer space or grab-bar blocking shown",
    "1.4 m vanity, mirror, sconce, open shelf, basket, towel rail, toiletries, plants and rug are not modeled",
    "window reads about 0.9 x 0.9 m at a ~1.0 m sill; the modeled window is 0.8 x 1.0 m at a 1.4 m sill",
    "no bathroom exhaust evidenced",
    "finishes are illustrative, not specified"
  ],
  "bedroom": [
    "room reads about 4.5 x 4 m; the modeled bedroom is 3.1 x 2.3 m",
    "full-height wardrobe wall is not modeled",
    "2.4 m centered window; the modeled openings are 1.4 x 1.3 m and 1.0 x 1.3 m, neither centred at that size",
    "vaulted raftered ceiling; the container ceiling is flat",
    "bed reads as a queen or king; the modeled bed is 1.4 x 1.9 m",
    "art, lamps, flowers, books and rug are not modeled",
    "door connection to the bathroom or hall is unclear",
    "finishes are illustrative, not specified"
  ]
}
```

## Caption template

> AI concept draft, not a model-verified drawing. Scene hash `4af580f8`.
> Known deviations: [the list for this view]. Do not use for dimensions,
> structure, accessibility or code.

Do not publish these as "Woodland Cottage" on `/design-lab/visualisations/` or in
any selected-home gallery. If they are used at all, label them:

> Concept mood image — not the modeled Woodland Cottage. Geometry, services and
> accessibility are illustrative.

## Recommendation

- **Reject the set as a selected-home visualisation.** The model's defining
  constraint — the long, narrow, single-module plan — is absent, and the set
  removes the container identity the project is about.
- **Keep the porch and exterior as mood/reference only**, with the label above.
  Their light, materials, porch proportions and pattern legibility are useful.
- **Do not treat the interiors as draft interiors of this home.** The interior
  hero is blocked; these images would publish a resolution the project has
  explicitly refused to make.
- **If a wider home is wanted**, create a new design record (two 20 ft modules or
  a double-width plan, a flat canopy or roof, a 3.0 m bathroom) and generate
  against that model. Do not rename the first home to fit the images.
- **Next generation pass:** unblock and reconcile the interior, then run the
  reference-conditioned harness with the opening schedule, container expression,
  envelope, services and accessibility requirements above. Review again with
  this document as the checklist.

## Limits of this review

- Visual comparison only; no metric photogrammetry, lens calibration or camera
  match.
- No provider, prompt or seed metadata was supplied, so the review cannot say
  whether the reference drawing was used.
- No structural, energy, fire, plumbing or code assessment is made or implied.
- Accessibility observations are visual; they are not a professional
  accessibility assessment.
- The images are treated as a single set for one home. If they were intended as a
  different, wider home, the geometry findings still apply, but the first-home
  verdict would not.

## Related

- [`image-review-courtyard-residence-2026-11-23.md`](image-review-courtyard-residence-2026-11-23.md)
- [`image-review-offset-stack-2026-11-23.md`](image-review-offset-stack-2026-11-23.md)
- [`image-review-accessible-garden-home-2026-11-23.md`](image-review-accessible-garden-home-2026-11-23.md)
- [`image-generation-findings.md`](image-generation-findings.md)
- [`image-descriptions.md`](image-descriptions.md)
- [`reference-conditioned-generation.md`](reference-conditioned-generation.md)
- [`visualisation-v2-brief.md`](visualisation-v2-brief.md)
- [`../data/image-descriptions.json`](../data/image-descriptions.json)
- [`../data/design-lab.json`](../data/design-lab.json)
