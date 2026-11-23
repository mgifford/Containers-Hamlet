# Image review summary: six homes, changes and recommendations

**Status:** Synthesis of the seven image reviews and the poster review, written
2026-11-23. **No image, model or PDF was changed.** The only repository changes
are the review records and a link from the reference-generation document. This
document summarises what was found, what was suggested, and what to do next.

## The reviews at a glance

| Home | Set reviewed | Verdict | Closest thing to a base |
| --- | --- | --- | --- |
| Woodland Cottage | 6 views (garden, porch, living, kitchen, bedroom, bath) | 0 / 6 publishable | The porch/exterior composition; not the massing |
| Offset Stack | 6 collage candidates | 0 / 6 publishable | **B** (`-2`) |
| Courtyard Residence | 6 views + board | 0 / 6 publishable | The **courtyard view** (image 5) and the board format |
| Cross-Stacked Retreat | 6 exterior candidates | 0 / 6 publishable | **D** (`-4`, no balcony) |
| Accessible Garden Home | 3 images (first set) | 0 / 3 publishable | The **B** compact plan proportion |
| Accessible Garden Home | 6 views (second set) | 0 / 6 publishable | The **entry porch / level patio** and two 20 ft containers |
| Solar Studio Stack | 6 collage candidates | 0 / 6 publishable | **B** (`-2`, stair with landing) |
| Poster set | 6 posters + 6-page compilation | Not publishable as-is | The **poster format**; the Solar text is the best |

Across roughly forty images, collages and posters, **nothing passed the
model contract**. That is the headline. The reviews were not a search for a
pretty picture; they tested each artefact against the model's modules, storeys,
openings, roof, porch, foundation, services, site, interior status and
publication rules.

## What the reviews changed

- Added seven home reviews and one poster review under `docs/`:
  Woodland Cottage, Offset Stack, Courtyard Residence, Cross-Stacked Retreat,
  Accessible Garden Home (two sets) and Solar Studio Stack.
- Added this summary.
- Linked the reviews from
  [`reference-conditioned-generation.md`](reference-conditioned-generation.md).
- Established, per home, a **closest base**, the **specific known deviations**
  and a **generation brief** for the next pass.
- Flagged three upstream problems that no amount of image iteration can fix:
  1. **Model/brief contradictions** — the Offset Stack porch/cantilever; the
     Woodland and Accessible interiors blocked pending reconciliation; the
     Courtyard board's U plan vs L axonometric; the Solar stair and roof.
  2. **The interior policy is not being followed** — provisional and blocked
     interiors are shown as furnished room layouts in almost every set.
  3. **The poster layer is inaccessible** — all seven PDFs are untagged,
     vector/image-only exports with no text layer, language, alt text or reading
     order.

No design decision was taken on the user's behalf. The reviews recommend; the
model and the images still need the fixes.

## The recurring failures

| Failure | Homes where it appears | Why it matters | Required fix |
| --- | --- | --- | --- |
| Wrong plan or massing | All six | The home stops being the selected home | Front-load module count, offset, storeys and plan; use the reference drawing |
| Porch/offset or plan contradiction | Offset, Courtyard, Accessible | The image and the model tell different stories | Resolve the model/brief before generating |
| Forbidden or missing services | All six | PV missing; stove, gas, hood, fire pit or balcony added | Show the modelled services; never add a forbidden one |
| Furnished interiors for provisional/blocked rooms | Woodland, Offset, Courtyard, Cross-Stacked, Accessible, Solar | The project has not reconciled these interiors | Zone study, or author the interior first |
| Thin envelope, slab base | All six | The 205 mm wall, deep reveals and 0.6 m pile base are the container story | Show reveals, roof/floor insulation, piles, corner castings |
| Wall-of-glass instead of the opening schedule | All six | Changes the thermal, structural and privacy story | Use the exact openings; no continuous glazing |
| Wrong site | Woodland, Offset, Cross-Stacked, Accessible, Solar (partly) | The lake glimpse, beaver meadow, cove or garden is part of each home | Use the site brief; no generic lake or forest |
| Undocumented material changes | Cross-Stacked, Courtyard, Offset, Accessible, Solar | Black, red or green metal replaces timber without a record | Use the documented cladding or record the change |
| No captions, hashes or known deviations | All image sets and posters | The project cannot publish an unverified image | Add hash, status, knownDeviations and the disclaimer |
| Inaccessible PDFs and posters | Poster set | A screen reader gets nothing; the plans have no text alternative | Accessible HTML or tagged PDF/UA, alt text and plan descriptions |

## General recommendations

### 1. Fix the model and the brief before generating again

The same failures recur because the source is ambiguous or contradictory:

- **Offset Stack:** the hero says the porch is sheltered by the overhang, but
  `p1` is at the west and `m2` is offset 2.6 m east, so the cantilever is over
  the east entry. Decide whether the porch moves, the offset changes, or the
  text changes.
- **Woodland Cottage:** the interior hero is `blocked-pending-reconciliation`;
  the kitchen window, garden doors and west window do not agree with the authored
  rooms.
- **Accessible Garden Home:** the interior hero is blocked for the same reason;
  the 3.0 m bathroom and 1.2 m route cannot be shown until the rooms reconcile.
- **Courtyard Residence:** the board's U plan and L axonometric disagree; the
  green roof, plan and model need one consistent story.
- **Cross-Stacked Retreat:** the no-balcony condition and the meadow site are
  recorded but ignored by every candidate.
- **Solar Studio Stack:** the alternating-tread stair and the 12° shed are the
  two things the images replace; the model's warnings must survive into the
  image or be changed deliberately.

Write the decision down in the relevant record before regenerating. A new image
cannot settle a model question.

### 2. Generate from the reference drawings, not from prose

Use the existing harness:

```sh
node tools/generate-reference-images.mjs --only <image-id>
```

The reference drawings (`site-facing.svg`, `elevation-south.svg`,
`interior-plan.svg`) carry the geometry. The prompt carries the material,
service and site intent. Text-only generation will keep producing a wide,
glassy, gabled lake cottage, whichever home it is asked for.

### 3. Enforce a publish gate

No image, poster or PDF should be published without:

- the scene/design hash;
- the specific `knownDeviations`, not a generic disclaimer;
- a human review against the model;
- the status (`concept`, `zone study`, `blocked`, `not publishable`);
- a caption that says "not a construction drawing";
- alt text and a text description of any plan.

The review documents are the template. Add the gate to the workflow, not just
to the documentation.

### 4. Make the interiors honest

The project has two legitimate interior states:

- **authored** (Woodland, Accessible), but both are currently **blocked**;
- **provisional** (Offset, Courtyard, Cross-Stacked, Solar), which may only be
  shown as a **zone study** — no partitions, doors, fixtures, furniture, beds,
  kitchens, bathroom enclosures, sloping ceilings or room-layout claims.

Every set broke this rule. Until the interiors are authored and reconciled,
publish the zone diagram, the terrace and the exterior — not the room.

### 5. Show the finished envelope and the modelled services

Every exterior should show, or explicitly caption the absence of:

- the 205 mm wall and deep reveals;
- the 0.6 m undercroft and piles;
- the roof and floor insulation at the edge;
- a corner casting and the module joint;
- PV where modelled;
- a gutter and downspout where required;
- a closed ember-resistant vent and defensible planting;
- the recorded site (lake glimpse, meadow, cove, garden).

No stove, chimney, gas, hood, fire pit, hydrant, battery, balcony or
noncombustible-deck claim unless the model records it.

### 6. Keep the site story

Each home has a different site, and the images keep flattening it into a generic
lake or forest:

- Woodland: lake glimpsed through cedar and pine, not a waterfront.
- Offset: birch glade and rock shoulder.
- Courtyard: L around a sheltered garden courtyard.
- Cross-Stacked: beaver meadow, sedge, alder, standing water, south knoll.
- Accessible: garden, fern/hemlock and a distant plane of lake light.
- Solar: juniper and cedar, the opposite shore of the cove close enough to read
  the rock.

The site is not background. It is part of the design brief.

### 7. Record material changes

The green, red and black metal containers are strong images, but the models
specify timber in several places. Either use the documented cladding or record
the change as a design decision with its thermal, fire and maintenance
consequences. "Strict-documented" material policy means the image cannot quietly
change the material.

### 8. Fix the poster layer

The posters are the right communication format: title, main view, insets, zone
diagram, design notes, limitations and a disclaimer. Keep that format. But:

- replace or caption the rejected hero images;
- redraw the Courtyard plan (labels collide) and the Cross-Stacked plan (the
  cross is lost);
- align the Accessible hero with its side-by-side plan and text;
- add the porches/terraces and the 1.5 m bathroom circle to the plans;
- add the specific known deviations to each poster;
- publish an accessible HTML version or a tagged PDF/UA with alt text and plan
  descriptions;
- add a cover, contents and bookmarks to the six-page compilation;
- drop the duplicate `-1`/`-2` files;
- mark blocked interiors as blocked, not "authored layout".

### 9. Accessibility is a gate, not a polish step

The project's central value is accessibility. The PDFs currently fail it at the
file level: no text layer, no language, no tags, no alt text, no reading order.
An accessible HTML companion is the simplest fix; a tagged PDF/UA is the
alternative. The same applies to the images: every image needs meaningful alt
text and, for the plans, a text description of the zones and relationships.

### 10. Stop generating variants; fix the base

There is no shortage of candidates. The project needs six corrected homes, not
another forty images. Take the closest base for each home, fix the model/brief
issue, regenerate once with the reference drawing, review it, and only then
produce the poster.

## Specific recommendations by home

### 1. Woodland Cottage

**Model:** one 40 ft module, 12.60 × 2.85 m finished (4.4:1), 2.298 m clear,
flat 2.9 m container ceiling, 24° gable, PV on the south slope, 5.4 × 2.8 m
porch, 205 mm envelope, 0.6 m pile base. The interior is authored but **blocked**
because the recorded openings and the room polygons do not reconcile.

**Keep:** the porch view and the warm material palette; the single-storey
garden-approach idea.

**Fix:**

- show **one module and the 4.4:1 proportion**, not a double-width cottage;
- show **installed PV**;
- keep the **flat ceiling** and the 2.3 m clear width;
- use the exact south openings (bath 0.8 at 4.4, entrance 0.95 at 6.1, garden
  doors 2.4 at 8.4), the north bedroom and kitchen windows and the west window;
- show the 205 mm reveals and the pile base; no slab, no stone plinth;
- no gable-end glass wall, no extra windows, no loft;
- do not publish an interior until the opening/room reconciliation is done;
- poster: add PV, mark the interior blocked, redraw the plan with the porch, and
  fix the hero (currently no PV).

**Closest:** the porch/exterior composition; there is no model-faithful
candidate.

### 2. Offset Stack

**Model:** two 40 ft modules; timber `m1` at 0.6 m, metal `m2` at 3.896 m,
offset 2.6 m east; 8° shed, PV; ground porch `p1` 4 × 2.6 m; upper south porch `p2`
2.4 × 1.4 m (no door) and the east door with no balcony; interior provisional; 205 mm; 0.6 m piles.

**Keep:** candidate **B** (`-2`) for the living/porch link and the container
identity; the offset massing and the exposed steel.

**Fix:**

- resolve the **porch/cantilever contradiction** (p1 is at the west, m2 is
  offset east; the hero text says the porch is sheltered by the overhang);
- show **PV**;
- keep the timber lower / metal upper and the exposed structure;
- use the exact openings;
- show the 205 mm reveals, piles and the module joint;
- show the interior as a **zone study** only; no partitions, doors or fixtures;
- no stove, gas, range hood or battery;
- poster: fix the hero's porch and missing PV, add the porch to the plan, and
  keep the 2.6 m transfer note.

**Closest:** B; D is the furthest.

### 3. Courtyard Residence

**Model:** two 40 ft modules in an L, timber, flat green roof, 45° glazed timber
link 2.4 × 1.6 m, porch 6.4 × 2.8 m, deck 1.4 m, **no PV**, interior
provisional, 205 mm, 0.6 m piles; site c.

**Keep:** the courtyard as an outdoor room (image 5), the L, the green roof, the
glazed link and the board format.

**Fix:**

- **remove the PV** — the model explicitly excludes it;
- use **timber cladding**, not black metal;
- use the exact openings (2.6 m courtyard doors, 2.0 m studio doors, 0.8–1.6 m
  windows), not continuous glass;
- keep the interior a **zone study**; no furniture, kitchens, beds or room
  layout;
- show the 205 mm reveals, piles, green-roof edge and the drainage caveat;
- no gutter/downspout layout (unresolved);
- poster: **redraw the unreadable plan**, fix the hero's black metal and glazing,
  keep the no-PV condition and the green-roof caveat.

**Closest:** image 5 and the board format.

### 4. Cross-Stacked Retreat

**Model:** two 40 ft modules, metal `m1` at 0.6 m and timber `m2` at 3.896 m
rotated 90°; butterfly 12° with 0.8 m overhang and PV; porch 4.2 × 2.8 m; east
ground entry and upper east door with **no balcony/guardrail**; dog-leg stair
0.9 m / 3.0 m run / 2.9 m rise; beaver meadow, sedge, alder, standing water,
south knoll; no lake; interior provisional; 205 mm; 0.6 m piles.

**Keep:** candidate **D** (`-4`) for the no-balcony cross, the butterfly, the
ground porch and the exposed steel; the container identity.

**Fix:**

- **no upper balcony, deck or guardrail**; B, C and F fail this hard gate;
- make the upper module **timber** (A, B, D red metal; C/E black metal);
- show **PV** (only F does);
- set the home in the **beaver meadow**, not a dry forest;
- use the exact openings and the dog-leg stair;
- show 205 mm reveals and piles; no stepped deck; no fire pit;
- poster: remove the "Elevated Perspective" balcony, change the red metal, add
  PV, fix the site and redraw the plan to show the perpendicular cross.

**Closest:** D.

### 5. Accessible Garden Home

**Model:** two 20 ft modules **side by side**, 6.47 × 5.70 m finished; living and
kitchen in `m1`; bedroom, bathroom and storage in `m2`; bathroom 3.1 × 2.3 m
with a 1.5 m turning circle, 0.9 m door and shower; entrance 1.0 m with a 0 m
threshold; 1.2 m circulation; terrace 4.6 × 2.8 m with a 1.2 m level deck; flat
canopy with a 1.2 m overhang; timber; no PV; interior **blocked**; 205 mm; 0.6 m
piles.

**Keep:** the two 20 ft containers, the garden and raised beds, the level
concrete patio and the wide entry from the second set; the compact plan
proportion from the first set.

**Fix:**

- use the **side-by-side plan**, not the U with a central link;
- show the **3.1 × 2.3 m bathroom**, 1.5 m turning circle, 0.9 m door, curbless
  shower and transfer space;
- show the **1.0 m entrance, 0 m threshold and 1.2 m route**;
- replace the **loose gravel** with a firm, stable surface;
- show the 4.6 × 2.8 m terrace and the 1.2 m canopy;
- use timber cladding (the green metal is a change, not the model);
- unblock and reconcile the interior before publishing interiors;
- no "fully accessible" or code-compliance claim; use "potentially adaptable,
  not verified";
- poster: align the U hero with the side-by-side plan, show the bathroom, mark
  the interior blocked.

**Closest:** the entry porch/level patio (second set) and the compact plan
proportion (first set).

### 6. Solar Studio Stack

**Model:** two 20 ft modules, timber `m1` at 0.6 m, metal `m2` at 3.896 m offset
0.8 m east; 12° shed roof with 0.9 m overhang and PV; terrace 4.4 × 2.4 m;
ground living/kitchen/bath/stair; upper studio/sleeping; east door with no
balcony; **alternating-tread stair** 0.9 m / 2.6 m run / 2.9 m rise, no landing;
juniper/cedar cove with the opposite shore; no deck; snow guards unresolved;
interior provisional; 205 mm; 0.6 m piles.

**Keep:** candidate **B** (`-2`) for the stair and the solar/cove massing; the
best poster text (it names the stair and no balcony).

**Fix:**

- change the **gable to the 12° shed** with PV;
- show the **alternating-tread stair** and its usability/code warning, or change
  the model and record the new stair — do not silently substitute a conventional
  stair;
- keep the interior a **zone study** with a flat underside; no beds, desks,
  kitchen, sofa, sloped ceiling or room layout;
- remove the **lakeside deck**; keep the 4.4 × 2.4 m terrace;
- show the ground bathroom, the exact openings and the 205 mm/pile base;
- keep the cove/juniper/cedar site; caption snow guards as unresolved;
- poster: verify the hero's shed, remove the studio bed, add the terrace to the
  plan and keep the limitation text.

**Closest:** B.

## Priority order

1. **P0 — Model/brief decisions.** Offset porch/cantilever; Woodland and
   Accessible interior reconciliation; Courtyard plan/axon; Cross-Stacked
   balcony/PV; Solar stair/roof. Record each decision.
2. **P1 — One reference-conditioned regeneration per home**, using the exact
   brief and the deterministic reference. Review each against its home record.
3. **P2 — Poster rebuild.** Replace/caption the hero images; redraw the plans;
   fix the Accessible image/plan contradiction; add the known deviations.
4. **P3 — Accessible publication.** HTML or tagged PDF/UA with alt text, plan
   descriptions, reading order, cover/contents/bookmarks; deduplicate the PDFs.
5. **P4 — Retire the rejected images** from any gallery or board; keep only the
   reviewed, captioned set.

## Acceptance checklist

An image or poster is publishable only when all of these are true:

- [ ] The design/scene hash is current.
- [ ] Modules, storeys, rotation, offset, roof, porch and foundation match.
- [ ] Every opening matches the schedule; no extra glazing.
- [ ] The 205 mm envelope, deep reveals and 0.6 m pile base are visible.
- [ ] The recorded services are visible or explicitly captioned absent.
- [ ] No stove, gas, hood, fire pit, hydrant, battery, balcony or noncombustible
      deck claim unless modelled.
- [ ] The site matches the home's brief, not a generic lake or forest.
- [ ] The interior is a zone study, or an authored and reconciled interior.
- [ ] The specific `knownDeviations` are recorded, not just a generic disclaimer.
- [ ] A human has reviewed it against the model.
- [ ] Alt text and, for plans, a text description exist.
- [ ] The caption says "concept, not a construction drawing".

## What to keep

- The **poster format**: title, main view, insets, zone diagram, design notes,
  limitations, form/outdoor space, disclaimer.
- The **zone-diagram approach** to interiors.
- The **closest candidates**: Offset B, Cross-Stacked D, Solar B, Courtyard
  image 5, Accessible entry porch/compact plan, Woodland porch.
- The **pattern lens** where the plan supports it (112, 127, 159, 163, 180, 106,
  36, 155) — but patterns do not excuse the geometry.
- The **reference-conditioned harness** and the deterministic drawings.

## Related reviews

- [`image-review-woodland-cottage-2026-11-23.md`](image-review-woodland-cottage-2026-11-23.md)
- [`image-review-offset-stack-2026-11-23.md`](image-review-offset-stack-2026-11-23.md)
- [`image-review-courtyard-residence-2026-11-23.md`](image-review-courtyard-residence-2026-11-23.md)
- [`image-review-cross-stacked-retreat-2026-11-23.md`](image-review-cross-stacked-retreat-2026-11-23.md)
- [`image-review-accessible-garden-home-2026-11-23.md`](image-review-accessible-garden-home-2026-11-23.md)
- [`image-review-accessible-garden-home-v2-2026-11-23.md`](image-review-accessible-garden-home-v2-2026-11-23.md)
- [`image-review-solar-studio-stack-2026-11-23.md`](image-review-solar-studio-stack-2026-11-23.md)
- [`image-review-posters-2026-11-23.md`](image-review-posters-2026-11-23.md)
- [`image-descriptions.md`](image-descriptions.md)
- [`reference-conditioned-generation.md`](reference-conditioned-generation.md)
- [`visualisation-v2-brief.md`](visualisation-v2-brief.md)
