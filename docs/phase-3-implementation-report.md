# Phase 3 implementation report

**Milestone:** credible interiors, two-storey container homes and two accessible
demonstrations
**Status:** implemented and tested; remaining decisions listed below.

## Final design set

| Home | Storeys | Accessibility target | Interior |
| --- | --- | --- | --- |
| Woodland Cottage | 1 | **Accessible demonstration** | Authored, 5 rooms, 2.8 m bathroom with 1.5 m turning circle |
| Offset Stack | 2 | Not required | Provisional from room bands |
| Courtyard Residence | 1 | Not required | Provisional from room bands |
| Cross-Stacked Retreat | 2 | Not required | Provisional from room bands |
| Accessible Garden Home | 1 | **Accessible demonstration** | Authored, 5 rooms, double-width, 3.0 m bathroom with 1.5 m turning circle |
| Solar Studio Stack | 2 | Not required | Provisional from room bands |

The selected set therefore has **three single-storey and three two-storey homes**.
Only **Woodland Cottage** and **Accessible Garden Home** are designed as
whole-home wheelchair-accessible units. The other four are ordinary concept
homes and are not failed for lacking accessible bathrooms or clearances.

## What changed

### Data

- `data/design-lab.json` retains 16 concepts: six selected residences, nine
  legacy concepts and the common lodge.
- Offset Stack, Cross-Stacked Retreat and Solar Studio Stack remain two-storey.
- Woodland Cottage, Courtyard Residence and Accessible Garden Home are
  single-storey.
- Two selected homes have authored interiors:
  - **Woodland Cottage:** bedroom, 2.8 m accessible bathroom, entrance hall,
    kitchen and living; four partitions/doors; 1.2 m circulation; turning circle.
  - **Accessible Garden Home:** double-width pair; living, kitchen, bedroom,
    3.0 m accessible bathroom and storage; four partitions/doors; 1.2 m route;
    turning circle.
- Offset Stack, Courtyard Residence, Cross-Stacked Retreat and Solar Studio Stack
  have provisional interiors inferred from room bands. No partitions or doors
  are invented.
- Accessibility targets:
  - `accessible`: Woodland Cottage, Accessible Garden Home;
  - `not-required`: the other four.

No separate experimental archive duplicates the selected homes.

### Schema and validation

- Optional `interior` object, schema `containers-hamlet-interior/v1`, in
  module-local metres.
- Room polygons, partitions, interior doors, fixtures, circulation, clearances
  and service areas.
- `DesignInterior.validate()` reports `invalid-geometry`, `unresolved-design` and
  `review-required` separately.
- Accessible-bathroom and kitchen-work-zone requirements apply only when
  `access.target === "accessible"`.
- `access.target` supports `accessible`, `adaptable` and `not-required`.
- Accessibility classifications are derived from modeled evidence; a manual
  "fully accessible" string cannot override missing evidence.
- `Interior.migrate()` converts room bands to provisional rectangles, preserves
  source zone ids and does not invent walls or doors.

### Editor and drawings

- Interior mode with numeric room position/size, add/remove rooms, partitions,
  doors and fixtures, undo/redo, live validation and accessibility status.
- Ground-floor and upper-floor interior plans are generated separately for the
  two-storey homes.
- Interior plans show room areas, partitions, door symbols, fixtures, turning
  circles and inferred-room hatching.
- Existing plans, elevations, sections, roof plans, exploded views, isometrics
  and solar studies remain generated from the same model.

### Illustration integration

- Scenes include interior rooms, schedules, validation and accessibility
  evidence.
- Interior prompts are generated from rooms, fixtures, doors and unresolved
  matters.
- Manifest dependencies include `prompts/interior.md` and
  `drawings/interior-plan.svg`.
- Interior changes alter the design hash; presentation-only changes do not.
- No interior perspective is claimed.

### Site reconciliation

- `site/data/homes.json` records derived footprint, height, module polygons,
  entrance, porch area, clearing margin and conflicts.
- The two-storey homes have smaller ground footprints than their derived
  single-storey translations.
- Cabin B slightly exceeds its recorded clearing radius; Cabin C is much larger
  than the old site model and extends beyond its clearing.
- No parcel, path, clearing or shoreline geometry was silently changed.

## Tests

| Command | Result |
| --- | --- |
| `node tools/build.mjs --check` | OK — 498 generated files current |
| `node tools/check.mjs` | 517 passed, 0 failed |
| `node tools/check-design-lab.mjs` | 2,482 passed, 0 failed |
| `node tools/browser-check.mjs` | 107 passed, 0 failed |
| `node tools/design-lab-check.mjs` | 236 passed, 0 failed |

Published site: about 6130 KB, under the 6.25 MB budget.

## Screenshots

See [`docs/screenshots/phase-3`](screenshots/phase-3/README.md). They include
the two-storey selected homes, the two accessible interiors, and the site
reconciliation table.

## Unresolved decisions

1. **Woodland Cottage** is a constrained single-module accessible layout. The
   2.8 m bathroom fits the turning circle, but the plan is tight and requires
   professional review; a double-width accessible unit is preferable.
2. **Accessible Garden Home** still needs shared-path grades, transfer details
   and a professional accessibility review.
3. **Offset Stack, Cross-Stacked Retreat and Solar Studio Stack** are two-storey
   and not wheelchair accessible. Their upper floors remain stair-only.
4. **Provisional interiors** for Offset Stack, Courtyard Residence,
   Cross-Stacked Retreat and Solar Studio Stack.
5. **Cabin B/C clearing conflicts** and entrance/path differences remain site
   review items.
6. **Interior perspective** remains unavailable; no camera or renderer.
7. No code, structural, accessibility, fire or energy certification is claimed.

## Non-claims

- No building-code or accessibility certification.
- No CSA B651 conformity claim.
- No construction documents or BIM/IFC export.
- No AI image generation.
- No claim that an illustration is a measured perspective.
