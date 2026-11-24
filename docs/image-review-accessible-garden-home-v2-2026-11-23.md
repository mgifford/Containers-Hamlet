# Review: Accessible Garden Home, second image set

**Status:** Review complete. **None of the six images is publishable.** This is
the best massing and identity yet for the Accessible Garden Home: two 20 ft
containers, a single level, a real garden, a level concrete patio and a wide
entry. It fails on the plan (a U, not the model's side-by-side 6.47 × 5.70 m),
the missing accessible bathroom and 1.2 m route, the gravel path, the furnished
interiors (the interior hero is blocked), the green metal cladding (the model is
timber), the missing deep reveals and pile base, and the absent captions.

**Assumption:** the set is a single-storey, two-container garden home with a
central entry, a raised-bed garden and a step-free patio. That matches the
**Accessible Garden Home** brief, so it is reviewed against
`hamlet-accessible-garden-home` (design hash `98e11bf7`, scene hash `61536ceb`).
If it was meant for **Cross-Stacked Retreat** (the next home in the project
order), it is single-storey and cannot be that home; if it is a new design,
create a new design record and re-run the description and reference pipeline.

**Subject:**

| # | Image | What it shows |
| --- | --- | --- |
| 1 | `-1` | Exterior, front three-quarter, two green containers and the central timber link |
| 2 | `-2` | Exterior, same massing with raised beds in the foreground |
| 3 | `-3` | Entry porch close-up: double doors, bench, planter, level patio |
| 4 | `-4` | Living room with a wide garden window |
| 5 | `-5` | Kitchen and dining with a garden window |
| 6 | `-6` | Open living/dining/kitchen with the bedroom through a wide opening |

## The model in one paragraph

Accessible Garden Home is **two 20 ft modules side by side**, each 6.058 ×
2.438 m nominal and 6.468 × 2.848 m finished, for a **6.47 × 5.70 m** footprint.
Living and kitchen are in `m1`; bedroom, bathroom and storage are in `m2`. The
bathroom is **3.1 × 2.3 m** with a **1.5 m turning circle**, a 0.9 m door, a
shower, WC and sink. The entrance is **1.0 m** with a **0 m threshold**;
circulation is **1.2 m**; the covered terrace is **4.6 × 2.8 m** on the south
face of `m2` with a **1.2 m** level deck; the canopy is flat with a 1.2 m
overhang; cladding is **timber**; the modules sit at 0.6 m; there is **no PV**
and **no stove**. The interior hero is **blocked-pending-reconciliation**, so no
interior view is publishable until the rooms and openings reconcile.

## What this set gets right

- **The module count and type:** two 20 ft containers, single level. That is the
  right starting point.
- **Container identity:** corrugated walls, visible corner castings at the top
  corners, a module joint at the link, a clad and lined assembly rather than a
  bare box.
- **A real garden:** raised beds, gravel, birch, pine, rock and flowers. The
  garden is the home's best idea and matches the "accessible garden" brief.
- **A level patio:** the concrete patio is at grade with the gravel and the
  threshold is nearly flush. The entry is step-free in spirit.
- **A wide entry:** the double doors are much wider than the recorded 1.0 m
  door. Wider is not an access barrier, even though it is not the model.
- **No PV, no stove, no chimney.** Correct.
- **A coherent set:** the six views read as one home, with consistent light,
  materials and garden. No people, text or watermark.

## Shared failures

### H — the plan is a U, not the model's side-by-side pair

The model is a compact **6.47 × 5.70 m** double-width home: living/kitchen in
`m1`, bedroom/bath in `m2`, side by side. The images are a **U**: a living wing
on the left with the bedroom behind it, a central entry link, and a kitchen/
dining wing on the right, with the garden in front. The footprint is roughly
**12–14 m wide by 6 m deep**, about twice the modelled width.

The room arrangement is also different:

- the model's living and kitchen are in the same module; the images put the
  living in the left wing and the kitchen/dining in the right wing;
- the model's bedroom and bathroom are in the second module; the images put the
  bedroom behind the living and do not show the bathroom;
- the model's terrace is on the south face of `m2`; the images have a central
  entry porch between the wings.

This is a different house, not a different view of the model.

### H — the accessible bathroom is absent

The accessible demonstration's core room is the **3.1 × 2.3 m** bathroom with a
**1.5 m turning circle**, a 0.9 m door and a shower. None of the six images
shows a bathroom. The set presents a one-bedroom home without its most important
accessible space. The board's plan in the earlier set was already rejected for a
small bath with a tub; this set omits the bath entirely.

### H — the 1.2 m route and turning circle are not demonstrated

The open plan is wide, and the bedroom opening is wide, which is promising. But
no dimension, clear route, turning circle or threshold detail is shown. The
model's 1.2 m circulation target and 1.5 m bathroom circle cannot be verified
from these images, and the missing bath means the key move cannot be shown at
all.

### H — the gravel path is not an accessible surface

The approach is loose gravel from the drive to the concrete patio. Loose gravel
is not firm, stable or slip-resistant for a wheelchair, walker or stroller. The
patio itself is level and the threshold is low, but the route to it fails the
accessible intent. The model's path connection is a design intent, not a
surveyed route; the image makes it look resolved with a surface that would not
work.

### H — the interior hero is blocked and the images publish a furnished home

The `accessible-garden-home-interior-hero` is
`blocked-pending-reconciliation`. Its record forbids partitions, doors, loose
furniture, rugs, lamps, plants, dishes, a service core, a hood and an HRV
terminal, and allows only the 1.8 × 0.55 m counter and the 0.7 × 0.7 m table.
The images show a furnished living room, a fitted kitchen with a hood, range,
fridge and cabinets, a dining table for six, a bedroom with a bed, nightstands
and lamps, rugs, plants and art. That is a room layout the project has not
reconciled.

### H — green metal cladding

The model's cladding is **timber** for both modules. The images use green
corrugated metal on both containers and reserve timber for the central link and
the porch. The green metal is a strong container expression, but it is not the
documented material. If it is a deliberate change, record it first; otherwise
use timber.

### H — the finished envelope is missing

- The windows sit nearly flush in the corrugation; no ~205 mm reveal is legible.
- The containers sit on a dark base or slab at grade; the 0.6 m undercroft and
  piles are absent.
- The roof edge is a thin metal fascia; the 250 mm roof and 200 mm floor
  insulation are not visible.
- The result reads as a thin-skinned box on a slab, not a clad, drained,
  insulated container assembly.

### H — no captions, scene hash or review status

None of the six carries the required caption, scene hash `61536ceb`, review
status, known deviations or the "illustrative interpretation, not a
construction drawing" label.

### M — the porch and terrace are repositioned

The model's terrace is **4.6 × 2.8 m** on the south face of `m2`, with a 1.2 m
deck. The images put a smaller central entry porch between the wings. The
central porch is a good outdoor room, but it is not the modelled terrace.

### M — the roof form

The images show separate flat/shed roofs over the two containers and a flat link
roof. The model's roof is a single **flat 0° canopy** with a 1.2 m overhang. The
difference is subtle in elevation, but it changes the canopy/drainage story.

### M — no gutter, downspout, ember vent or defensible space

The exterior hero requires a gutter and one downspout at the canopy edge, a
closed ember-resistant vent and defensible-space planting. None is visible, and
the raised beds and plants sit close to the walls and patio.

### M — the site brief is not met

The exterior hero asks for fern, hemlock and a **distant plane of lake light**,
more forest than water. The images are a flower and vegetable garden with birch,
pine and rock, and no lake. The garden is a good idea, but it is not the site
brief; either update the brief or add the lake light.

### M — the interiors are oversized

The living room reads about 5 × 5 m, the kitchen/dining about 5 × 3 m, and the
bedroom about 4 × 4 m. The model's living is **2.7 × 2.3 m**, the kitchen
**2.1 × 2.3 m**, and the bedroom **2.7 × 2.3 m**. The images are roughly twice
the modelled area.

### M — windows and finishes

The containers have large picture windows; the model records a 1.4 m living
window, a 1.0 m kitchen window, a 0.8 m bathroom window and a 1.0 m west window.
The interior floors, ceilings, cabinets and joinery are presented as specified;
interior finishes are not documented and must be disclosed as illustrative.

## Per-image notes

### 1 and 2 — exterior

The best views of the massing: two green containers, a timber link, a central
porch, a garden, a level patio and a rock/birch setting. The two variants are
nearly identical. They also carry the clearest failures: green metal instead of
timber, a U instead of the side-by-side pair, a slab base instead of piles, thin
reveals, and a central porch instead of the south terrace.

### 3 — entry porch

The strongest accessible detail: a wide double door, a level concrete patio, a
low threshold, a bench and a planter. The porch is generous and legible. But the
gravel path leading to it is not an accessible surface, and the entry width and
porch position are not the model's.

### 4 — living room

A warm, plausible living room with a large garden window, a sofa, a chair,
built-in shelves and a wood ceiling. It reads about 5 × 5 m; the model's living
is 2.7 × 2.3 m. The loose furniture is not modelled.

### 5 — kitchen and dining

A generous kitchen with green cabinets, open shelves, a hood, a range, a fridge,
a sink and a dining table for six. The model has a 1.8 × 0.55 m counter and no
hood, range or fridge. The kitchen is attractive, but it is a different,
unmodelled room.

### 6 — open living/dining with bedroom

A clear one-bedroom plan: living on the left, bedroom through a wide cased
opening, dining and kitchen on the right, a double door to the patio. The wide
bedroom opening is a promising accessible detail, but the room layout,
furniture, kitchen and missing bathroom are all outside the model. The bedroom
opening is not a door in the model; no interior partitions are modelled.

## What would make a publishable set

1. **Use the model's plan:** two 20 ft modules side by side, 6.47 × 5.70 m;
   living/kitchen in `m1`; bedroom/bath/storage in `m2`.
2. **Show the accessible bathroom:** 3.1 × 2.3 m, 1.5 m turning circle, 0.9 m
   door, curbless shower, WC, sink, transfer space and grab-bar blocking.
3. **Show the 1.2 m route** from the entrance through the home, with the 1.0 m
   entrance and 0 m threshold.
4. **Replace the gravel with a firm, stable surface** (concrete, pavers or a
   bound path) and show the level connection to the patio.
5. **Respect the interior gate:** unblock and reconcile the interior hero before
   publishing interiors; then use only the authored rooms and the counter and
   table, with no loose furniture, rugs, lamps, plants or dishes.
6. **Use timber cladding** unless the green metal is recorded as a material
   change.
7. **Restore the envelope:** 205 mm reveals, 0.6 m pile base, 250 mm roof,
   200 mm floor, flat canopy with a 1.2 m overhang, gutter and downspout, ember
   vent, defensible planting.
8. **Show the modelled south terrace** 4.6 × 2.8 m, or record the central porch
   as a design change.
9. **Add the site brief:** fern, hemlock and a distant plane of lake light, or
   update the brief to the garden.
10. **Caption every image** with the scene hash, review status, known deviations
    and "not a construction drawing".

## Ready-to-paste `knownDeviations`

```json
{
  "exterior": [
    "U plan with two wings and a central link, about 12-14 m wide; the model is a 6.47 x 5.70 m side-by-side pair",
    "living and bedroom in one wing, kitchen/dining in the other; the model puts living/kitchen in m1 and bedroom/bath in m2",
    "green metal cladding on both containers; the model cladding is timber",
    "central entry porch instead of the modelled 4.6 x 2.8 m south terrace",
    "slab/plinth at grade; no 0.6 m undercroft or piles",
    "windows nearly flush; no ~205 mm reveal",
    "no gutter, downspout, ember-resistant vent or defensible-space zone",
    "no distant lake light; the site brief asks for fern, hemlock and lake light",
    "loose gravel path to the patio; not a firm, stable accessible surface",
    "no caption, scene hash or review status"
  ],
  "porch": [
    "central porch between the wings; the model terrace is on the south face of m2",
    "double doors wider than the recorded 1.0 m entrance",
    "level concrete patio and low threshold, but the gravel approach is not accessible",
    "no gutter or downspout at the porch/canopy edge",
    "no caption, scene hash or review status"
  ],
  "living": [
    "room reads about 5 x 5 m; the model living is 2.7 x 2.3 m",
    "sofa, chair, coffee table, pouf, shelves, rug, lamps and plants are not modelled",
    "large garden window larger than the recorded 1.4 m living window",
    "wood ceiling and floor finishes are illustrative, not specified",
    "interior hero is blocked; no room layout is publishable"
  ],
  "kitchen": [
    "kitchen reads about 5 x 3 m; the model kitchen is 2.1 x 2.3 m",
    "hood, range, fridge, cabinets, sink and dining table are not modelled",
    "large windows larger than the recorded 1.0 m kitchen window",
    "no service core or HRV terminal modelled",
    "interior hero is blocked; no room layout is publishable"
  ],
  "bedroom": [
    "bedroom reads about 4 x 4 m; the model bedroom is 2.7 x 2.3 m",
    "bed, nightstands, lamps, rug and art are not modelled",
    "wide cased opening instead of the modelled partition/door arrangement",
    "the accessible bathroom is not shown",
    "interior hero is blocked; no room layout is publishable"
  ]
}
```

## Recommendation

- **Keep the two 20 ft containers, the garden, the level patio and the wide
  entry.** They are the right ingredients and the best Accessible Garden Home
  identity so far.
- **Rebuild on the model's plan.** The U with a central link is a different
  house; the model is a compact side-by-side pair. If the U is wanted, create a
  new design record and design the accessible bathroom and route into it.
- **Do not publish the interiors.** The interior hero is blocked; the images are
  furnished room layouts with a hood, range, fridge, bed and sofa the model does
  not contain.
- **Fix the path and the bath.** A loose gravel path and a missing 3.1 m
  bathroom defeat the accessible demonstration.
- **Then regenerate the exterior** from `site-facing.svg` with timber cladding,
  the 4.6 × 2.8 m terrace, the flat canopy, 205 mm reveals, the 0.6 m pile base,
  the gutter/downspout, ember vent and defensible planting, and the fern/
  hemlock/lake-light site brief.

## Limits of this review

- Visual comparison only; no photogrammetry, lens calibration or camera match.
- No provider, prompt or seed metadata was supplied.
- No structural, energy, fire, plumbing or code assessment is made or implied.
- Accessibility observations are visual; they are not a professional
  accessibility assessment.
- The set is treated as an Accessible Garden Home attempt because of the
  single-level garden home, the two 20 ft containers and the step-free patio. If
  it belongs to another home, the massing, material, interior and access gates
  still apply, but the home-specific verdict would not.

## Related

- [`image-review-accessible-garden-home-2026-11-23.md`](image-review-accessible-garden-home-2026-11-23.md)
- [`image-review-courtyard-residence-2026-11-23.md`](image-review-courtyard-residence-2026-11-23.md)
- [`image-review-offset-stack-2026-11-23.md`](image-review-offset-stack-2026-11-23.md)
- [`image-review-woodland-cottage-2026-11-23.md`](image-review-woodland-cottage-2026-11-23.md)
- [`image-descriptions.md`](image-descriptions.md)
- [`visualisation-v2-brief.md`](visualisation-v2-brief.md)
- [`../data/image-descriptions.json`](../data/image-descriptions.json)
