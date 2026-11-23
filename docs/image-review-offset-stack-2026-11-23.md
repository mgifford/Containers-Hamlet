# Review: six Offset Stack collages

**Status:** Review complete. **None of the six is publishable.** Candidate **B**
(`-2`) is the best base for a re-generation; candidate **D** (`-4`) is the
furthest from the model.

**Subject:** six 1536 × 1024 collages supplied on 2026-11-23. Each is a 3 × 2
set of panels in the same order: exterior, living, kitchen, bathroom, stair,
bedroom. The labels used here map to the file suffixes:

| Label | File suffix | Collage title |
| --- | --- | --- |
| **A** | `-1` | Modern Birch Forest Container Cabin |
| **B** | `-2` | Modern Container Home in a Birch Forest |
| **C** | `-3` | Birch Forest Container Home Collage |
| **D** | `-4` | Modern Container Cabin in the Birch Forest |
| **E** | `-5` | Offset Stack: A Warm Woodland Retreat |
| **F** | `-6` | Warm Modern Container Home in Birch Woods |

The six are near-identical variants of one composition, not six independent
views. The panels differ mainly in which end carries the cantilever, whether a
stove, hood or gas appliance appears, and whether the bathroom has a window.
That is why the review ranks them rather than treating them as separate homes.

**Compared against:** `data/design-lab.json` → `hamlet-offset-stack` (design
hash `12ecfb76`, scene hash `9e294428`), the image records in
`data/image-descriptions.json`, [`illustration-discrepancies.json`](../data/illustration-discrepancies.json),
the v2 completion criteria in [`visualisation-v2-brief.md`](visualisation-v2-brief.md),
and the same review contract used for the first home in
[`image-review-woodland-cottage-2026-11-23.md`](image-review-woodland-cottage-2026-11-23.md).

**Method:** a visual comparison against the model facts. Each collage panel is
about 512 px wide, so fine detail is limited. The camera, lens and prompt are
unknown; dimensions and angles are qualitative. No claim is made about the
provider or settings used to make the images.

## Verdict

| Candidate | Exterior | Living | Kitchen | Bath | Stair | Bedroom | Rank |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **A** | Porch under cantilever; no PV | No stove | Hood; no gas visible | Window (unlisted) | Good type | Bed + desk | 4 |
| **B** | Porch under cantilever; no PV | No stove; opens to porch | No hood, no range, no gas | Window (unlisted) | Good type | Bed + desk | **1** |
| **C** | Porch under cantilever; no PV | No stove | Hood + gas | Window (unlisted) | Good type | Bed + desk | 5 |
| **D** | Porch under cantilever; no PV | **Wood stove** | Gas hob; no hood | No window | Good type | Bed + desk | **6** |
| **E** | Porch under cantilever; no PV | No stove | Gas range; no hood | No window | Good type | Bed + desk | 3 |
| **F** | Porch under cantilever; no PV | No stove | Hood + gas | No window | Good type | Bed + desk | 2 |

The ranking is only about **which set is the least misleading base for a
re-generation**. Every candidate fails the same core tests: the offset/porch
relationship is reversed, the interiors are presented as finished room layouts
when the model has only a provisional zone band, and the PV, upper porch, deep
reveals, pile base and captions are missing.

The most important thing this set gets right is **container identity**. The
upper module is a corrugated metal box, the lower module is timber, the module
band and some corner details read as steel, and the two-storey stack reads as a
container home rather than a cabin. That is a real advance over the first-home
set and should be kept.

## What the set gets right

- **Massing:** two storeys, two 40 ft modules, the upper volume shifted, a
  cantilevered upper box over a covered ground porch, an exposed post at the
  outer corner.
- **Materials:** corrugated galvanised upper cladding, dark timber lower
  cladding, black frames, a dark module band. This is close to the model's
  `m1` timber and `m2` metal.
- **Container expression:** corrugation, a visible module joint, corner
  framing and, in some panels, corner castings and lifting-point detail.
- **Site:** birch glade, rock shoulder, gravel path, ferns and moss. This
  matches the "birch glade and rock shoulder; no lake or meadow" brief.
- **Programme:** ground living, kitchen and bathroom; upper bedroom and study;
  an internal straight-run stair; no external stair; no third storey; no
  invented balcony or railing; no lake or meadow.
- **Interior ceiling:** the ground-floor rooms keep a flat ceiling rather than
  inventing a vaulted one. That is a useful correction relative to the
  first-home set.
- **Stair type:** straight run, about 0.9–1.0 m wide, with a landing and a
  handrail. This is broadly the recorded stair, with the caveats below.
- **Pattern legibility:** the entrance transition, the covered outdoor room,
  the ground-to-upper intimacy gradient, light from more than one side and a
  window place are all readable.
- **No people, no text, no watermark; late-summer late-afternoon light is
  consistent across the panels.**

## Shared failures

### H — the offset/porch relationship is reversed

This is the signature failure and it appears in all six. In every collage the
ground porch sits **under the upper cantilever**, with the ground module
projecting beyond the upper at the far end. The model is the other way round:

- ground module `m1` at the origin, upper module `m2` at **+2.6 m east**;
- the upper cantilever is therefore over the **east entry end**;
- the ground porch `p1` starts at **0.6 m** and runs 4 m at the **west end**,
  the end where the ground module projects beyond the upper.

The hero brief nevertheless says the porch is "sheltered by the overhang". The
elevation drawing confirms the coordinates, not the sentence. The images
realize the sentence's reading. Until the model or the brief is corrected, every
generation will reproduce a porch under a cantilever that is at the wrong end.

The set also exaggerates the overlap: the upper box covers most or all of the
porch, while the modelled overlap is 2 m of a 4 m porch.

### H — no PV on the upper south slope

The model records an installed PV array on the upper roof (`solar_array.enabled
= true`, `m2.roof.type = solar`). All six roofs are bare corrugated metal. This
is the same failure as the first-home set and it removes the energy story.

### H — the provisional interior is presented as a finished room layout

The Offset Stack interior is **provisional**: four longitudinal zone bands, no
partitions, no doors and no fixtures. Its image record is explicit:

- one open ground-floor volume 12.19 × 2.44 m, **no partitions**;
- **no** bathroom or stair enclosure;
- **no** bed, sofa, counter, toilet or other fixture;
- **no** kitchen hood, bathroom exhaust, service core or HRV terminal;
- a caption that says "zone study … not a room layout".

Every collage does the opposite: a furnished living room, a galley kitchen with
cabinets and appliances, an enclosed bathroom, a walled stair hall, and an
upper bedroom with a bed, desk, shelves and window seat. This is a governance
failure independent of image quality. A set that shows a room layout for a
provisional interior cannot be published, however attractive it is.

### H — the interiors are too wide

The model's clear internal width is **2.298 m**. The living rooms read about
4 m wide (a 2.4 m sofa plus a chair, side table and walkway); the bedrooms read
about 4 m wide. The galley kitchen is the one room that reads close to
2.4 m: a 1.2 m aisle between counters is plausible. The living and bedroom
cannot be the modelled modules.

### H — the finished envelope is missing

- Door and window frames sit nearly flush with the cladding; no ~205 mm reveal
  is legible. The upper windows sit almost flush in the corrugation.
- The roof edge is thin; the 250 mm roof insulation and 200 mm floor
  insulation are not visible.
- The ground module sits on a slab, skirt or plinth at grade. The 0.6 m
  undercroft and exposed helical piles are absent, and the entry/porch shows a
  step or an unshown transition rather than the recorded step-free threshold.
- The result reads as a thin-skinned cabin on a slab, not the clad, drained,
  insulated container assembly.

### H — no captions, scene hash or review status

The project requires a caption with the scene hash, review status, known
limitations and the "illustrative interpretation, not a construction drawing"
label. None of the collages carries any text, alt text or review record.

### M — the upper south porch is omitted

The hero must show `p2`, the 2.4 × 1.4 m open, unroofed upper south porch, and
the unresolved access/guarding. None of the six shows an upper porch; the upper
south face is windows only.

### M — the upper east door is replaced by a window

The model records a 0.9 × 2.1 m door on the upper east face (`m2-e1`) with no
balcony. All six show a large window in that position. The panel therefore
neither shows the recorded door nor the unresolved access condition.

### M — glazing is oversized and sometimes unlisted

- The upper south studio window is a long horizontal band, about 2.5–3 m wide;
  the model records 1.6 × 1.4 m.
- The ground living glazing is wider than the 2.4 m sliding door and sometimes
  wraps a corner. The west window is 1.0 × 1.2 m; the images often show a
  larger window.
- Candidates A, B and C add a bathroom window. The ground opening list has no
  bathroom window, so that is an unlisted opening.
- Some panels add a hinged door under the porch on the south face, where the
  model has the living slider and the kitchen window; the east entry is not
  clearly shown.

### M — no gutter, downspout, ember vent or defensible space

The low south eave has no gutter or downspout, no ember-resistant vent is
visible, and ferns and shrubs grow against the ground wall and porch. The
recorded conceptual gutter, downspout, ember vent and 10 m defensible-space
intent are all absent.

### M — no service core, HRV or bathroom exhaust

The kitchen, bathroom and stair panels show no mechanical service, no HRV
terminal, no bathroom exhaust and no accessible service panel. The kitchen
appliances are covered below.

### M — finishes are presented as specified

Timber linings, stone and tile, black frames, wood counters, cabinet colours
and the exposed corrugated interior are presented as a finished scheme.
Interior finishes are not documented and must be disclosed as illustrative
defaults. The fully corrugated bathroom and living walls in D and E are a
strong container expression, but they are a design choice, not a recorded
finish.

### M — the upper bathroom is omitted

The model has a ground bathroom zone and an upper bathroom zone. The collages
show a ground bathroom only. The upper bathroom is missing from a set that
otherwise presents the whole home.

### M — the stair enclosure and glazing are unmodeled

The stair type is right, but the stair is enclosed by walls on both sides and
lit by extra windows, and its relationship to the living/kitchen changes
between panels. The model has no stair enclosure and only the one north stair
window at 9.6 m; the stair itself is conceptual.

## The model/brief contradiction to fix first

The Offset Stack hero record and the geometry disagree:

- `mustShow` says "covered ground porch p1 4 × 2.6 m on the south face, created
  by the upper offset";
- `p1` starts at 0.6 m and runs to 4.6 m, at the **west** end;
- `m2` is at **+2.6 m east**, so its cantilever is over the **east** entry, not
  over `p1`.

The south elevation in `screenshots/phase-2/offset-stack-elevation.png` shows
this clearly: the ground porch is at the left (west), the upper box is shifted
right (east), and the upper's overhang is at the right. The images follow the
brief's prose, not the model's coordinates.

Decide one of these before generating again:

1. **Keep the model:** the porch is at the west, the upper is offset east, and
   the cantilever is over the east entry. The hero prompt and caption must say
   that; the porch is covered by its own roof and only partly by the upper.
2. **Move the porch or the offset:** if the design intent is a porch under the
   upper cantilever, move `p1` to the east end or change the offset direction,
   then regenerate the reference drawings and the scene hash.

Do not generate another set until this is resolved. Every candidate reproduces
the same contradiction, which is a sign that the brief is driving the image,
not the model.

## Candidate notes

### A — `-1`

Clean living room and a strong porch link; no stove. The kitchen carries a
range hood, which the provisional interior forbids, and the bathroom has an
unlisted window. The exterior puts the porch under the cantilever and reads
well as a container home. Rank 4: usable mood, but two service/interior
violations.

### B — `-2`

The best base. No stove, no hood and no gas appliance appear; the living room
opens to the porch through a large slider, which is the closest to the ground
living/porch relationship. The bathroom has an unlisted window and the kitchen
has no documented cooking appliance at all, which is an omission rather than a
false claim. The exterior is clean and the birch/rock setting is right. If one
set is reworked, start here.

### C — `-3`

A strong exterior with a clear cantilever and a good porch, but the kitchen has
a **hood and a gas range**, and the bathroom has an unlisted window. The gas
range without a modelled service core is a combustion and indoor-air problem,
not just a visual one. Rank 5.

### D — `-4`

The most container-forward interior: corrugated walls and ceiling, dark steel,
a convincing stair. It is also the worst on services: a **freestanding wood
stove with a flue** in the living room, a **gas hob** in the kitchen and no
hood. The model records heat-pump heating and no stove, no chimney, no gas. The
stove alone disqualifies the set. Rank 6.

### E — `-5`

A calm, plausible set with no stove and no bathroom window, but the kitchen has
a **gas range and no hood**, and the living-room glazing is oversized. The
exterior is one of the better compositions. Rank 3.

### F — `-6`

The best exterior on container detail: visible corner castings, a clear module
band, a tall east-end glass door that reads as the entry, and a clean porch.
The kitchen has a **hood and a gas hob**, and the upper glazing is oversized.
Rank 2.

## Contract check against the v2 completion criteria

Using B, the best base, as the reference:

| # | Criterion | Result |
| --- | --- | --- |
| 1 | Generated from the canonical scene with matching modules, storeys, openings, roof, porch, foundation and camera | **No** — offset/porch, glazing, bath window and foundation differ |
| 2 | Exterior and interior agree on sun, time, materials and geometry | **Partly** — light, materials and birch setting agree; geometry does not |
| 3 | Ventilation and service terminals shown or clearly accessible | **No** — no PV, HRV, service core or exhaust |
| 4 | Stove has a chimney, OAK, hearth and clearance | **N/A** — no stove in B; D fails |
| 5 | Kitchen has a ducted hood and documented cooking fuel | **No** — B has neither; A, C and F show a hood, C, D, E and F show gas |
| 6 | Accessible home shows the bathroom and 1.2 m route | **N/A** — this home is `accessibility-not-required`; the stair and ground bathroom are the relevant checks |
| 7 | Container detail is visible | **Yes** — corrugation, module band, corner detail; the strongest part of the set |
| 8 | Caption states scene hash, review status and known limitations | **No** — no captions |
| 9 | A human has checked the image against the model | **Yes** — this review |
| 10 | Labelled illustrative interpretation, not a construction drawing | **No** — no labels |

## What a publishable Offset Stack set needs

1. **Resolve the offset/porch contradiction** and regenerate the
   `site-facing.svg` reference. Decide whether the porch is at the west with
   the cantilever over the east entry (the current coordinates), or move the
   porch/offset to match the "sheltered by the overhang" prose.
2. **Generate from the reference drawings** (`site-facing.svg`,
   `interior-plan.svg`) with the pattern cue and the pattern-led prompt, not
   from a scene description alone.
3. **Show PV** as tilted racks on the upper south slope; show the 8° shed roof,
   the 0.7 m overhang and the low south eave.
4. **Show `p2`** as the 2.4 × 1.4 m open, unroofed upper south porch with no
   invented railing, and show the upper east door at 0.9 × 2.1 m with no
   balcony. Caption the unresolved access and guarding.
5. **Restore the finished envelope:** ~205 mm reveals, 250 mm roof, 200 mm
   floor, a visible insulated floor edge, exposed helical piles at 0.6 m, no
   slab or plinth, and a step-free entry with a graded path rather than a step.
6. **Keep the opening schedule exact:** ground south living slider 2.4 × 2.1 at
   3.2 m, kitchen window 1.2 × 1.2 at 8.4 m, north stair window 0.9 × 1.2 at
   9.6 m, east entry 0.95 × 2.1, west window 1.0 × 1.2; upper north bedroom
   1.4 × 1.3 at 2.4 m, south studio 1.6 × 1.4 at 7.0 m, east door 0.9 × 2.1 at
   1.6 m, west stair window 0.8 × 1.2 at 1.2 m. No bathroom window; no extra
   ground door.
7. **Show the services:** gutter and downspout on the low south eave, a
   fine-mesh ember vent, low-fuel defensible planting to 10 m, and no firewood
   against the house.
8. **Either model the interior or keep it a zone study.** If the interior stays
   provisional, show one open 12.19 × 2.44 m volume with no partitions, doors,
   fixtures, hood, exhaust or service core, and the conceptual straight stair
   (0.9 × 3.2 m, landing). If a furnished home is wanted, author the interior
   first: partitions, doors, fixtures, bathroom enclosure, kitchen, service
   core and exhaust, then regenerate.
9. **Do not show a stove or gas.** Heating is a heat pump. If a range is shown,
   it must be a modelled induction hob with a ducted hood, a documented fuel
   and a service core.
10. **Caption every panel and the collage:** scene hash `9e294428`, review
    status, the specific `knownDeviations`, and "illustrative interpretation,
    not a construction drawing". Interior panels add "zone study, not a room
    layout" only when they really are.

## Ready-to-paste `knownDeviations`

Use the shared list for every candidate, then add the candidate-specific items.
The result is the list for that collage; split it per panel if a per-image
record is created later.

```json
{
  "shared": [
    "ground porch is under the upper cantilever; the model puts the porch at the west and the cantilever over the east entry",
    "no PV array on the upper south slope",
    "interior is a finished room layout; the model is a provisional zone band with no partitions, doors or fixtures",
    "living and bedroom read about 4 m wide; the model's clear width is 2.298 m",
    "door and window frames nearly flush; no ~205 mm reveal",
    "thin roof edge; no 250 mm roof or 200 mm floor insulation visible",
    "ground module sits on a slab or plinth at grade; no 0.6 m undercroft or helical piles",
    "entry and porch show a step or unshown transition; the recorded entrance is step-free",
    "upper south porch p2 omitted",
    "upper east door replaced by a window",
    "upper studio window reads 2.5-3 m; the model records 1.6 x 1.4 m",
    "living glazing wider than the 2.4 m sliding door; extra glazing at the corner",
    "no gutter, downspout, ember vent or defensible-space zone",
    "no service core, HRV terminal or bathroom exhaust",
    "upper bathroom omitted",
    "stair is enclosed by walls and lit by extra windows; the model has no stair enclosure",
    "finishes are illustrative, not specified",
    "no caption, scene hash or review status"
  ],
  "candidateSpecific": {
    "A": [
      "range hood shown; the provisional interior forbids a hood and the model has no service core",
      "bathroom window not in the ground opening list"
    ],
    "B": [
      "bathroom window not in the ground opening list",
      "no cooking appliance or ducted hood shown"
    ],
    "C": [
      "range hood shown; the provisional interior forbids a hood and the model has no service core",
      "gas range shown; no gas is recorded",
      "bathroom window not in the ground opening list"
    ],
    "D": [
      "freestanding wood stove with a flue shown; no stove, chimney or gas is recorded",
      "gas hob shown; no gas is recorded",
      "fully corrugated interior walls and ceiling presented as a finish"
    ],
    "E": [
      "gas range shown with no ducted hood; no gas is recorded"
    ],
    "F": [
      "range hood shown; the provisional interior forbids a hood and the model has no service core",
      "gas hob shown; no gas is recorded"
    ]
  }
}
```

## Recommendation

- **Reject all six as Offset Stack visualisations.** The set is the closest the
  project has come on massing and container expression, but it cannot be
  published while the offset/porch relationship is reversed and the provisional
  interior is shown as a finished home.
- **Keep B and F as mood/reference only**, labelled "concept mood image — not
  the modelled Offset Stack; geometry, services and interiors are
  illustrative". Their light, materials, birch setting, porch and stair are
  useful.
- **Fix the model or the brief before generating again.** The porch/cantilever
  contradiction is upstream of every image; the interior status is the other
  gate.
- **Then run the reference-conditioned harness** with the exact opening
  schedule, PV, p2, the finished envelope, the services and the zone-study
  interior. Review the output against this document and the first-home review.
- **If the intent is a fully furnished home**, author the Offset Stack interior
  first (partitions, doors, fixtures, bathroom, kitchen, service core), update
  the scene hash and regenerate. Do not let a collage define the interior by
  accident.

## Limits of this review

- Visual comparison only; no photogrammetry, lens calibration or camera match.
- Panels are about 512 px wide, so small details (corner castings, vent
  products, reveal depth) are judged from a low-resolution crop.
- No provider, prompt or seed metadata was supplied; the review cannot say
  whether the reference drawing was used.
- No structural, energy, fire, plumbing or code assessment is made or implied.
- Accessibility is not a target for this home; the stair and ground bathroom
  observations are not an accessibility assessment.
- The set is treated as six candidates for one home. If the images were meant
  for a different design, the geometry findings still apply, but the Offset
  Stack verdict would not.

## Related

- [`image-review-courtyard-residence-2026-11-23.md`](image-review-courtyard-residence-2026-11-23.md)
- [`image-review-woodland-cottage-2026-11-23.md`](image-review-woodland-cottage-2026-11-23.md)
- [`image-review-accessible-garden-home-2026-11-23.md`](image-review-accessible-garden-home-2026-11-23.md)
- [`image-generation-findings.md`](image-generation-findings.md)
- [`image-descriptions.md`](image-descriptions.md)
- [`reference-conditioned-generation.md`](reference-conditioned-generation.md)
- [`visualisation-v2-brief.md`](visualisation-v2-brief.md)
- [`../data/illustration-discrepancies.json`](../data/illustration-discrepancies.json)
- [`../data/image-descriptions.json`](../data/image-descriptions.json)
