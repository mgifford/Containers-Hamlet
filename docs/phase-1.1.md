# Phase 1.1: audit, changes and remaining assumptions

> Historical record. Phase 1.2 replaced the 15-acre site geometry, building placements and public narrative. This document is kept so the earlier audit and decisions remain visible. See [`phase-1.2.md`](phase-1.2.md) for the current site.

This document answers the brief in [`implementation-prompt.md`](implementation-prompt.md): audit the Phase 1 starter, deliver Phase 1.1, and document changed files and remaining assumptions. Nothing here makes the concept engineered, code-compliant or permit-ready.

## 1. Audit of the Phase 1 starter

Each finding was checked against the starter files (commit `e66cf0e`, "Import Eco Hamlet Phase 1 starter").

| # | Finding | Evidence | Resolution in 1.1 |
|---|---|---|---|
| A1 | The arrival path ran through the "protected" wetland. | In `site-plan.svg` the path from (1000, 590) to (700, 560) lies inside the wetland polygon. | The site is now drawn in metres from `data/site.json`. Arrival comes from the east to parking 35 m from the wetland. A regression test proves the old route is rejected. |
| A2 | The bathroom was a pass-through between the bedroom and the kitchen. | Floor plan zones, west to east: sleeping, bath, kitchen, living. | Rooms reordered west to east: sleeping, living, kitchenette, bathroom. No room is reached through another. |
| A3 | Drawings disagreed with each other and were not to scale. | The elevation porch extends past the container end. Plan openings do not match elevation openings. The OBJ porch (x 8.53 to 12.19 m) is in a different place from the plan. | Plan, elevations, section, axonometrics and OBJ are all generated from one JSON file at one scale. Tests cross-check the plan dimensions, OBJ extents and drawn lengths. |
| A4 | The OBJ faces pointed inward and the up axis was undocumented. | The signed volume of the starter OBJ is −88.9 m³. It uses Z-up, so Blender's default importer lays it on its side. | Faces are wound outward (verified by test). The OBJ uses the Y-up convention, has a header, and comes with an MTL file of material colours. |
| A5 | Copies in `site/` could drift from `models/` and `data/`. | Identical copies were maintained by hand. | `tools/build.mjs` writes both. `--check` fails CI if anything drifts. |
| A6 | The map interaction depended on `<object>` + `contentDocument`. | This is blocked on `file://` in Chromium. Focusable `role="button"` groups inside an `<object>` are exposed inconsistently by screen readers. | The map is inline SVG with `role="img"` and a generated description. Keyboard and screen reader users use the adjacent toggle buttons, and pointer clicks on the map do the same thing. See section 3. |
| A7 | The active drawing tab failed text contrast. | White on `#a66a29` is 4.45:1 (AA needs 4.5:1). | Pressed state uses `#8f5a21` (5.75:1) plus a ✓ glyph and bold text, so the state is not carried by colour alone. Native radio buttons replace the tab buttons. |
| A8 | `aria-label` on a plain `div` (building selector). | ARIA does not support naming generic elements, and support is unreliable. | `role="group"` with `aria-labelledby` pointing at a visible label. |
| A9 | Images had no `width`/`height`, so content shifted as they loaded. | `index.html` | Generated `width`/`height` on every image; `loading="lazy"` below the fold. |
| A10 | Site coordinates were SVG pixels with no scale; building footprints were not to scale. | `data/site.json` used `x`/`y` in pixels of a 1000×650 drawing. | Coordinates are metres (`x_m`, `y_m`). Footprints, porches and ramps come from the building models at true scale. The 15-acre area is computed from the boundary (15.0 acres). |
| A11 | No automated checks. | None in the repository. | `tools/check.mjs` (99 checks) and `tools/browser-check.mjs` (52 checks) run in CI. |

## 2. What Phase 1.1 delivers

**Single source of truth.** `data/cabin-a.json` and `data/lodge.json` describe modules, bays, envelope layers, rooms, partitions, doors, openings, fixtures, porches, ramps, trellis, foundations and roof options. `site/js/model.js` turns a spec into non-intersecting solids. The same code runs in Node, to write the SVG drawings and OBJ/MTL files, and in the browser, to draw the explorer. See [`data-model.md`](data-model.md).

**Accurate parametric openings.** Openings cut every wall layer. In the steel they get a reinforcement frame (drawn and exported as "to be engineered"). Validation rejects openings that cross partitions, overlap, crowd the corner posts or cut the top rail.

**Cutaway and interior exploration.** The "Look inside" section is plain SVG, with no WebGL. It offers four cutaway modes (exterior, roof off, near walls off, walls cut at 1.2 m), four viewpoints, two roof options and toggles for furniture, porches and trellis. Room buttons highlight a room, describe its size, use, fixtures and accessibility, and announce the change through a status message. Without JavaScript a static cutaway image is shown, and the room tables carry the same information.

**Common lodge.** Two reclaimed containers flank a 6 m timber-framed hall with clerestories. The lodge has a shared kitchen, pantry, laundry, a mechanical and battery room with exterior access only, a workshop and tool library, a washroom, a universal washroom with an adult-size change table, a boot room, a screened porch, a covered entry and two ramps.

**Provenance and material passport.** Each building records authors, revision, method, licence and verification status ("none"). Passport entries record source, condition assessment, connections, disassembly, end of life and documentation status. Each is linked to a modelled material so its volume comes from the geometry.

**Configurable terrain and no-build zones.** The site has a shoreline polyline, a wetland polygon, a hill and a hollow, 2 m contours, and placeholder 30 m shoreline and wetland buffers drawn as true distance isolines. It also has lanes, parking, crane standing points, a crane reach limit and a ramp-to-lane distance limit. The build fails if any building, porch, ramp, lane, parking area or crane pad breaks a rule. Change a number in `site.json` and the map, table and checks all follow.

**Construction notes.** [`build-strategy.md`](build-strategy.md) and the page now cover off-site fabrication, crane access, low-disturbance foundations, external insulation with moisture and fire reviews, selectively assessed spray foam, solar-friendly green roofs, independent living-wall trellises, screened porches and step-free access.

## 3. Deliberate behaviour changes (nothing silently removed)

- **Map keyboard access.** In Phase 1, keyboard focus could enter the map's building shapes inside an `<object>` where the browser allowed it. In 1.1 the seven toggle buttons beside the map are the single keyboard and screen reader route. Map shapes remain pointer shortcuts that do the same thing, so keyboard users don't meet two tab stops per building. The map itself is described in text, and the siting table lists every building.
- **Drawing tabs** became a native radio group. Arrow keys move between drawings, and without JavaScript all drawings are shown.
- **Room order and porch position** changed (A2). The porch keeps its 3.66 × 3.05 m size and moves to the south side of the living room.
- **`site.json` building coordinates** moved from pixels (`x`, `y`) to metres (`x_m`, `y_m`). Cabins C, E and F and the lodge moved, for the reasons recorded in their `moved` fields.
- **`cabin-a.json`**: the porch is now defined in `porches[0]`. The Phase 1 `screened_porch` object stays for compatibility, and a test keeps the two consistent.
- **The hero image** is now the generated Cabin A axonometric. The site plan still appears in "The landscape" section and in Downloads.

## 4. Changed and added files

| Path | Status |
|---|---|
| `data/cabin-a.json`, `data/site.json` | Extended (Phase 1 fields kept) |
| `data/lodge.json` | New |
| `site/js/model.js`, `site/js/render.js` | New: shared geometry and SVG renderer |
| `site/js/data.js` | New, generated |
| `site/index.html` | Rewritten around generated fragments; Phase 1 copy kept |
| `site/style.css`, `site/script.js` | Rewritten |
| `site/assets/site-plan.svg` | Regenerated in metres with a key |
| `models/cabin-a/*`, `site/models/cabin-a/*` | Regenerated; `axonometric.svg`, `cutaway.svg`, `cabin-a.mtl` added |
| `models/lodge/*`, `site/models/lodge/*` | New, generated |
| `site/data/*.json` | Copies of `data/`; `site-analysis.json` is new and generated |
| `tools/build.mjs`, `tools/lib/*.mjs` | New generator |
| `tools/check.mjs`, `tools/browser-check.mjs` | New tests |
| `package.json`, `package-lock.json`, `.gitignore` | New (test dependencies only) |
| `.github/workflows/pages.yml` | Verifies generated files and runs static checks before deploying |
| `.github/workflows/checks.yml` | New CI |
| `README.md`, `CONTRIBUTING.md`, `docs/build-strategy.md` | Extended |
| `docs/phase-1.1.md`, `docs/data-model.md`, `docs/accessibility.md` | New |
| `LICENSE`, `CONTENT-LICENSE.md`, `docs/vision.md`, `docs/community-model.md`, `docs/implementation-prompt.md`, `site/assets/favicon.svg` | Unchanged |

## 5. Remaining assumptions

- **Container dimensions** are typical published values for a 40-foot high cube. Real units vary.
- **Envelope thicknesses** (150 mm external insulation, 25 mm cavity, 22 mm rainscreen, 200 mm roof insulation, 150 mm under-floor insulation) are placeholders chosen for drawing, not from energy modelling or code review.
- **Grade is level** under each building in the drawings. The site model has slopes of 3 to 9 percent at the building locations, so real pile heights, floor heights and ramp lengths will differ.
- **Foundations** are drawn as helical piles at a fixed layout. Type, number, depth and bearing are unknown.
- **No-build buffers (30 m), slope limit (15%), crane reach (24 m), lane width (6 m) and ramp-to-lane distance (45 m)** are placeholders, not regulatory values.
- **The parcel runs to the water's edge.** Many Canadian shorelines include a shore road allowance or Crown land.
- **PV** is drawn flat. Module size and power (1.134 × 2.278 m, 420 W) are typical values, and the kWp figures are counts, not energy yields.
- **Accessibility notes** in the room data are design intentions to verify against CSA B651 and the applicable building code. Several rooms do not meet turning-space expectations, and the data says so.
- **Material volumes** are summed solid volumes for display, not a bill of quantities. Container corrugation, fasteners and waste are ignored.
- **The site is fictional.** No survey, environmental assessment or legal review stands behind it.

## 6. Testing done

- `node tools/build.mjs --check`: all 35 generated files match the JSON.
- `node tools/check.mjs`: 99 checks, all passing. They cover data validity, the Phase 1 fields kept, enforcement of the siting rules (including regression cases for the Phase 1 Cabin C position and the arrival route), outward OBJ normals, plan, elevation and section dimensions against the OBJ and the data, SVG titles and descriptions, heading order, labels, links, licences, privacy and the page-weight budget. The first page view is about 59 KB gzipped.
- `node tools/browser-check.mjs`: 52 checks, all passing, in Chromium with axe-core 4.14. They cover WCAG 2.2 A/AA rules in five states (initial, after interaction, 320 px, dark scheme, scripts blocked), a full Tab walk (78 stops, visible focus on every stop, nothing obscured, no trap), keyboard operation of every control, 320 px reflow with WCAG text-spacing overrides, 24 px target size, reduced motion, forced colours, no third-party requests and every local link returning 200.
- **Not done:** testing with screen readers (NVDA, JAWS, VoiceOver, TalkBack), voice control, switch access, or with disabled people. Automated tools catch only part of WCAG. See [`accessibility.md`](accessibility.md).
