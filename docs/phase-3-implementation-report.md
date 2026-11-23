# Phase 3 implementation report

**Milestone:** single-storey selected residences and spatially credible interiors  
**Base:** stacked on PR #19 (illustration pipeline)  
**Status:** implemented, tested and documented; remaining decisions listed below.

## Result

All six selected hamlet residences are now **single-storey**:

| Home | Former name | Modules | Arrangement | Roof |
| --- | --- | --- | --- | --- |
| Woodland Cottage | — | 1 × 40 ft | single | gable |
| Offset Pair | Offset Stack | 2 × 40 ft | offset pair | shed |
| Courtyard Residence | — | 2 × 40 ft | L-shape | flat/green concept |
| Cross-Wing House | Cross-Stacked Retreat | 2 × 40 ft | T-wing | butterfly |
| Accessible Garden Home | — | 2 × 20 ft | parallel pair | canopy |
| Solar Studio | Solar Studio Stack | 2 × 20 ft | offset pair | solar-ready |

The three former two-storey selected studies are retained as
`archive-offset-stack`, `archive-cross-stacked-retreat` and
`archive-solar-studio-stack` in the Experimental archive. They remain editable,
renderable and importable, but are not selected homes and are not included in the
selected illustration packages.

## What was changed

### Data

- `data/design-lab.json` now has 19 concepts: six selected single-storey homes,
  three experimental two-storey archives, nine legacy concepts and the common
  lodge.
- Selected homes have only ground-level modules and no stair.
- The Offset Stack became an offset pair with a shared-wall link.
- The Cross-Stacked Retreat became a single-storey T-wing.
- The Solar Studio Stack became a compact single-storey offset pair.
- Selected homes now have `interior` data:
  - **Offset Pair:** authored, 8 rooms, 7 partitions, 7 doors, bathroom/kitchen
    fixtures, furniture, circulation, service area, kitchen work zone.
  - **Accessible Garden Home:** authored, 5 rooms, 4 partitions, 4 doors,
    bathroom/kitchen fixtures, furniture, circulation, service area, kitchen
    work zone.
  - **Woodland Cottage, Courtyard Residence, Cross-Wing House, Solar Studio:**
    provisional interiors inferred from room bands, with no invented partitions
    or doors.
- Access classifications replaced overclaims with evidence-derived status. No
  selected home is fully accessible; all currently report
  `potentially-adaptable`.

### Schema

- Added optional `interior` with
  `containers-hamlet-interior/v1`.
- Architectural schema remains v2.0, preserving v2.0/v1.0/v0.1 imports.
- `Interior.fromZones()` migrates room bands to provisional rectangles and
  preserves source zone ids.
- No selected home source is silently converted; the archive copies preserve the
  former two-storey designs.

### Geometry and validation

New `site/js/design-interior.js`:

- clear interior envelope from nominal module dimensions and a lining allowance;
- room polygons, partitions, doors, fixtures, circulation, clearances and service
  areas;
- three result categories: invalid geometry, unresolved design, review required;
- checks for room bounds/overlap, partition and door references, fixture
  placement, door blocking, connectivity, turning circles, kitchen work zones,
  room coverage and provisional/inferred geometry;
- accessibility evidence derived from the modeled rooms, doors, bathroom turning
  space, kitchen work zone and path connection;
- deterministic interior plan SVG with title, description, labels, inferred-room
  hatching and door/fixture symbols.

### Editor

- Added a **Detailed interior plan** mode.
- Room cards expose numeric centre, width and depth plus name and type.
- Add/remove room, partition, interior door and fixture.
- Undo/redo, import/export and the existing arrangement editor remain.
- Live validation status and accessibility evidence.
- Keyboard-operable native controls; no drag-only requirement.
- The interior plan updates with every edit.

### Drawings

- Published `<home>-interior-plan.svg` for selected homes.
- Added an interior plan slide to architecture pages.
- Interior plans use title/description, text labels, room areas and line/hatch
  distinctions, not colour alone.
- Existing plans, elevations, sections, roof plans, exploded views, isometrics
  and solar studies continue to come from the same model.

### Illustration pipeline

- Scenes now include interior rooms, partitions, doors, fixtures, clearances,
  schedule, validation and accessibility evidence.
- Added `interiorPrompt` generated from room areas, module references, doors,
  fixtures and unresolved items.
- Capabilities distinguish:
  - exterior reference;
  - interior zone diagram;
  - detailed floor plan;
  - interior illustration prompt;
  - interior perspective (still false).
- Package manifest tracks `drawings/interior-plan.svg` and
  `prompts/interior.md` dependencies.
- Interior changes alter the design hash and invalidate dependent prompts;
  presentation-only changes do not.
- Six published packages regenerated for the single-storey models.

### Site reconciliation

- `site/data/homes.json` now records derived design footprint, height, entrance,
  porch area, reach, clearing margin, transformed module footprints and conflicts
  for the six homes and lodge.
- Residences page publishes a reconciliation table.
- Conflicts are documented in
  [`phase-3-site-reconciliation.md`](phase-3-site-reconciliation.md): Cabin C and
  D/D exceed their recorded clearing radii; several entrance/path directions
  differ; old site footprints differ substantially from the selected designs.
- No parcel, clearing, path, shoreline or no-build geometry was changed.

## What was preserved

- All nine legacy concepts and the common lodge.
- The three former two-storey selected designs as experimental archives.
- Historical two-storey JSON import and migration.
- Existing Design Lab gallery, comparison, residences, editor, guides, site plan,
  Cabin A/lodge models and downloads.
- Existing illustration pipeline schemas, hashes, manifests, prompts, reference
  views, copy/download and ZIP.
- No-JavaScript documentation and native form controls.
- No backend, account, API key, tracking or remote runtime dependency.

## What was removed from selected designs and why

- The occupied upper floor of Offset Stack, Cross-Stacked Retreat and Solar
  Studio Stack. All bedrooms and bathrooms are now on the single occupied level.
- The selected homes' internal stairs and upper balconies. They remain in the
  archived studies, not in the selected homes.
- The claim that any selected home is `fully-accessible-single-storey`. The
  evidence does not support it.
- The unmodeled Offset Pair "glazed link" claim. The modules now abut and share a
  modeled wall/door; the description matches the model.

## Tests

| Command | Result |
| --- | --- |
| `node tools/build.mjs --check` | OK — 540 generated files current |
| `node tools/check.mjs` | 556 passed, 0 failed |
| `node tools/check-design-lab.mjs` | 2,813 passed, 0 failed |
| `node tools/browser-check.mjs` | 107 passed, 0 failed |
| `node tools/design-lab-check.mjs` | 226 passed, 0 failed |

Browser tests include interior editing, invalid-geometry announcement, undo,
add/remove room/partition/fixture, package interior files, 320 px reflow, dark
mode, forced colours, reduced motion, axe and archive access.

Published site: 540 files, about 6844 KB, under the revised 7 MB budget.

## Screenshots

[`docs/screenshots/phase-3`](screenshots/phase-3/README.md) contains before/after
evidence: single-storey Offset Pair architecture, authored interior plan, editor
interior mode, Accessible Garden Home constraint and site reconciliation.

## Unresolved architectural decisions

1. **Offset Pair bathrooms** do not have a modeled 1.5 m turning circle. Decide
   whether to enlarge/rearrange the bathrooms or accept a non-accessible
   bathroom.
2. **Accessible Garden Home bathroom** is 1.7 m long and cannot fit the 1.5 m
   turning circle alongside the recorded fixtures. A longer/wider bathroom bay or
   different module composition is required; the target was not reduced.
3. **Provisional interiors** for Woodland Cottage, Courtyard Residence,
   Cross-Wing House and Solar Studio. Partition, door and fixture positions are
   not authored.
4. **Cross-Wing and Solar Studio** shared-wall/transition doors are not fully
   modeled because their interiors are provisional. The selected massing abuts,
   but the interior door graph needs authoring.
5. **Cabin C/D clearing conflicts:** Courtyard Residence and Cross-Wing House
   extend beyond the recorded clearing radius. Resolve with a site survey,
   redesign or different assignment; no clearing was enlarged.
6. **Entrance/path mismatches** at several sites. A path can turn at the door, so
   these are review flags, not automatic design failures.
7. **Interior perspective** remains unavailable; no camera or renderer.
8. **Accessibility, structure, fire, energy and code** remain unverified. The
   model is not a professional assessment.

## Explicit non-claims

- No building-code or accessibility certification.
- No CSA B651 conformity claim.
- No structural, geotechnical, fire, energy or cost verification.
- No construction documents.
- No BIM/IFC export.
- No AI image generation.
- No claim that an illustration is a measured perspective or construction
  drawing.

## Recommended next step

Author the remaining four interiors; resolve the two bathroom constraints and the
Cabin C/D clearing conflicts; then commission a professional review of one
single-storey home and attach the evidence to the review register.
