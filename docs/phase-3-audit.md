# Phase 3 audit: single-storey residences and spatially accurate interiors

**Status:** Audit before Phase 3 changes. Baseline is `main` after PR #19
(illustration pipeline). Phase 3 is built as a stacked branch on PR #19 because
the interior scene/prompt integration depends on it.

## 1. Baseline tests

| Command | Result |
| --- | --- |
| `node tools/build.mjs --check` | OK — 480 generated files current |
| `node tools/check.mjs` | 508 passed, 0 failed |
| `node tools/check-design-lab.mjs` | 2,399 passed, 0 failed |
| `node tools/browser-check.mjs` | 107 passed, 0 failed |
| `node tools/design-lab-check.mjs` | 208 passed, 0 failed |

## 2. Current architectural and interior data

- `data/design-lab.json` uses `containers-hamlet-design/v2.0`.
- Modules carry `position_m`, `rotation_deg`, `storey`, `elevation_m`, nominal
  dimensions, support, openings, insulation, cladding and roof.
- Rooms are **longitudinal zones**: `start_m` and `end_m` along each module,
  with a type and an accessibility note. There are no room polygons, partitions,
  door openings, fixtures, clearances or circulation routes.
- The Design Lab geometry engine (`site/js/design-model.js`) computes plan
  polygons, elevations, sections, roof geometry, metrics and validation.
- The illustration pipeline (`site/js/design-illustration.js`) records
  `interiorPerspective: false` and a room-zone limitation. It has no interior
  room geometry to consume.

## 3. Selected residences at baseline

| Home | Storeys | Modules | Interior data |
| --- | --- | --- | --- |
| Woodland Cottage | 1 | 1 × 40 ft | Zones only |
| Offset Stack | **2** | 2 × 40 ft | Zones only; upper module |
| Courtyard Residence | 1 | 2 × 40 ft L | Zones only |
| Cross-Stacked Retreat | **2** | 2 × 40 ft perpendicular | Zones only; upper module |
| Accessible Garden Home | 1 | 2 × 20 ft | Zones only |
| Solar Studio Stack | **2** | 2 × 20 ft | Zones only; upper module |

The common lodge is single-storey. The nine legacy concepts and the three
two-storey selected homes are the only occupied upper levels in the active set.

## 4. Existing single-storey alternatives

- `Model.singleStoreyAlternative()` exists for floor-area comparison. It moves
  upper modules to the ground but is explicitly a geometry-only translation,
  not a redesign.
- Woodland Cottage, Courtyard Residence and Accessible Garden Home are already
  single-storey.
- The `docs/architectural-variation.md` comparison uses these alternatives but
  they are not selected residence models.

## 5. Unsupported interior geometries

- No room polygons, partitions, interior doors, fixtures, furniture, circulation
  routes, turning circles, kitchen work zones or service areas.
- Room zones cannot establish real partitions, door positions or clearances.
- The plan renderer draws room bands across the full module width; it cannot show
  a bathroom/kitchen layout, door swing or fixture conflict.
- Interior illustration is limited to a room-zone plan and a prompt; no
  perspective claim.

## 6. Accessibility classification problems

- `access.classification` is a manually supplied string. `accessibilityProfile()`
  mostly trusts it.
- `fully-accessible-single-storey` can be assigned without modeled door widths,
  turning circles, fixture clearances or threshold evidence.
- There is no link between the accessibility record and room geometry.
- A single-storey step-free home is not the same as a verified accessible home.

## 7. Dependencies

```
data/design-lab.json
  -> design-schema/model -> plans/elevations/sections/metrics
  -> design-illustration -> scene/prompt/reference/manifest
  -> editor -> imports/exports/ZIP
  -> tools/build -> pages/views/packages
  -> tools/check* -> static/browser tests
data/site.json
  -> site plan and home pages
  -> design_lab_home assignment (illustrative)
```

Changing storeys, module positions or rooms affects drawings, illustration
scenes, hashes, manifests, site metrics and tests. The change must be explicit,
versioned and reversible.

## 8. Proposed schema extension

Add an optional design-level `interior` object, schema
`containers-hamlet-interior/v1`, rather than bumping the architectural schema to
v3.0. This preserves v2.0 imports and exports.

```json
{
  "interior": {
    "schema": "containers-hamlet-interior/v1",
    "status": "authored | provisional",
    "clearances": { "circulation_width_m": 1.0, "turning_circle_m": 1.5, "door_width_m": 0.86 },
    "rooms": [
      {
        "id": "m1-living",
        "name": "Living",
        "type": "living",
        "module": "m1",
        "level": 0,
        "polygon": [[x, y], ...],
        "provenance": "authored | inferred-from-zone",
        "sourceZoneId": "m1-z4",
        "openingIds": ["m1-s1"],
        "accessibility": { "assessment": "not-verified" }
      }
    ],
    "partitions": [],
    "doors": [],
    "fixtures": [],
    "circulation": [],
    "clearances": [],
    "service": [],
    "provenance": {}
  }
}
```

Coordinates are **module-local metres**, origin at the module centre, x along
the container length, y across its width. This reuses the existing transform and
avoids a second geometry engine. Room polygons must fit inside the computed clear
envelope (nominal dimensions minus a documented lining allowance).

Migration: `Interior.fromZones()` converts each band into a provisional
rectangle across the clear width, preserves `sourceZoneId`, and marks
`provenance: "inferred-from-zone"`. It does not invent partitions, doors,
fixtures or clearances. Authored rooms for the demonstration cases override the
inferred rooms. Historical designs keep their original zones and JSON.

## 9. Risks

- Changing selected two-storey homes breaks existing illustration packages,
  prompts, screenshots, site metrics and tests. Preserve originals as archive
  concepts and rebuild selected packages.
- Adding `interior` changes design hashes and invalidates existing manifests.
  Regenerate packages; document the revision.
- Room polygons could imply more precision than the model supports. Mark
  inferred rooms provisional and never claim verified clearances.
- A single-storey conversion could reduce diversity. Preserve offset, T/cross,
  courtyard, compact pair and solar identities through massing, not cladding.
- Updating site footprints could conflict with the authoritative site models.
  Derive and flag conflicts; do not silently change parcel/buffer geometry.
- Accessibility classification must not be trusted from a string. Derive from
  evidence and report not-verified where geometry is missing.

## 10. Implementation sequence

1. Add `design-interior.js` with schema, clear envelope, migration, validation,
   accessibility evidence and plan renderer.
2. Add `interior` to schema canonicalisation/validation and the illustration
   scene/prompt/manifest.
3. Create archive copies of the three two-storey selected homes; convert the
   selected ids to single-storey layouts; add interiors (authored B/E, inferred
   others).
4. Add interior editing and plan view to the editor; extend drawings/build.
5. Update accessibility classification to a non-verified candidate that cannot
   claim full accessibility without professional evidence.
6. Derive site metrics and flag conflicts.
7. Extend tests, packages, docs and screenshots.
