# Phase 2 implementation report

## Mission

Turn the Design Lab from a strong **individual-arrangement configurator** into a
consistent, accessible environment for **six deliberately different homes**,
with explicit two-storey geometry and honest structural and accessibility
reporting, while preserving the existing site, downloads, galleries, licensing
and static GitHub Pages deployment.

## Files changed

### Data

* `data/design-lab.json` — migrated the ten existing concepts from
  `containers-hamlet-design/v1.0` to `v2.0`; added six hamlet-selected homes and
  preserved the nine original concepts as an archive. Added `role`, `levels`,
  `elevation_m`, `storey`, `support`, `review`, `access`, `roof_form` and
  `architecture` data.
* `data/site.json` — added an illustrative `design_lab_home` reference to the six
  homes and the lodge. The authoritative site geometry and building models are
  unchanged.
* `package.json` — version 2.0.0 and a Phase 2 description.

### Schema, model and rendering

* `site/js/design-schema.js` — schema v2.0, v1.0 migration, `migrateAny()`,
  explicit levels, storey/elevation/support validation, two-storey limit,
  review register validation, accessibility record validation, roof-form
  validation, rotation range, professional-assessment guard.
* `site/js/design-model.js` — 3D module boxes, 3D collisions, support analysis,
  roof geometry, structural review register, accessibility profile,
  architectural features/similarity, sustainability profile, derived
  single-storey translations, metrics (gross floor area, ground coverage,
  building height, roof/envelope/window area), floor-specific plans, four
  elevations, building section, exploded levels, solar studies and updated
  axonometrics.
* `site/js/design-model.js` also removes the old arbitrary 0.6 m cantilever
  “limit”: every recorded cantilever is now a review item, not a pass/fail
  threshold.

### Editor

* `site/design-lab/editor/index.html` — level selector, stacking controls, roof
  form, accessibility/stair controls, support report, elevations, section,
  exploded levels, solar studies, massing preview and new export buttons.
* `site/design-lab/editor/editor.js` — storey/elevation handling, stack/align/
  offset/rotate/perpendicular operations, support inspection, roof and access
  controls, keyboard Page Up/Page Down/A level controls, floor-aware plans,
  new exports and ZIP contents, v1/v0.1 import through `migrateAny()`, revised
  warning categories, summary and massing status.
* `site/design-lab/editor/editor.css` — new controls, support report, four-view
  grid, massing layout, review badge colours.

### Generator and pages

* `tools/build.mjs` — 16 concepts, six hamlet-selected homes, view generation
  for plans/elevations/section/exploded/solar, residences page, site-home
  assignment, changed validation categories.
* `tools/lib/design-gallery.mjs` — six-hamlet section, archive section, new
  badges, storey/floor-area/roof facts, floor-specific plans and elevation links.
* `tools/lib/design-architecture.mjs` — 12–15 slides per concept, floor plans,
  four elevations, section, exploded levels, solar studies, levels/support
  table, accessibility section and structural review register.
* `tools/lib/design-compare.mjs` — sixteen concepts, storeys/massing/floor area/
  ground coverage, accessibility and structural status.
* `tools/lib/design-residences.mjs` — new hamlet-wide comparison page with
  sortable/filterable table, six cards, diversity assessment, structural and
  accessibility summaries, and derived single-storey alternatives.
* `site/design-lab/residences/residences.js`, `residences.css` — local,
  dependency-free sorting/filtering with a no-JavaScript fallback.
* `tools/lib/design-nav.mjs` — Residences link.
* `site/design-lab/index.html`, `site/design-lab/style.css` — new public
  explanation, six-home hero, archive link, hamlet badges and layout.
* `tools/lib/home-pages.mjs` — links each site home to its illustrative
  architectural concept.

### Tests

* `tools/check-design-lab.mjs` — rewritten and extended to 2,237 checks:
  vertical geometry, migrations, collisions, support, 3-storey rejection,
  roof forms, floor areas, elevations/sections, accessibility, structural
  review, diversity, sustainability, residences page and site-home assignment.
* `tools/design-lab-check.mjs` — extended to 194 browser checks: six-home
  gallery, 12+ slide architectural pages, residences sorting/filtering,
  editor level selector, stack operations, support inspection, keyboard level
  controls, v2 export, v0.1 import, axe-core, 320 px reflow, dark scheme,
  forced colours and no-JavaScript fallbacks.
* `tools/check.mjs` — page-weight budget revised to 6 MB and renamed.

### Documentation

* `docs/architecture-diversity-audit.md` (new)
* `docs/architectural-variation.md` (new)
* `docs/stacked-containers.md` (new)
* `docs/structural-review.md` (new)
* `docs/accessibility.md` (updated)
* `docs/design-lab.md` (updated)
* `docs/data-model.md` (updated)
* `docs/build-strategy.md` (updated)
* `docs/site-pages.md` (updated)
* `README.md` (updated)
* `docs/implementation-report.md` (this file)
* `docs/screenshots/phase-2/README.md` (new screenshot record)

## Existing features preserved

* The fictional 15-acre Canadian Shield site, its terrain, buffers, paths,
  crane access and six residential sites.
* The common lodge as a distinct community building with its original
  single-storey default; it was not replaced by a generic home.
* `data/cabin-a.json` and `data/lodge.json` remain authoritative and unchanged.
* The `design-adapter.mjs` conversion in both directions, with loss reporting.
* The nine original Design Lab concepts, their ids, source JSON, provenance,
  drawings, downloads and comparison entries.
* The v0.1 import path and the v1.0 import path.
* The gallery, arrangement studies, envelope/vegetation/solar/foundation
  systems, cutaway explorer, comparison tool and downloads.
* No backend, accounts, analytics, cookies, remote scripts, web fonts or WebGL.
* Static GitHub Pages compatibility; the build remains `node tools/build.mjs`.

## Features replaced or changed

* **Schema v1.0 is no longer the current schema.** It is migrated to v2.0
  explicitly; existing files still import. This is a versioned extension, not a
  silent rewrite.
* **The whole-site page-weight budget moved from 3.5 MB to 6 MB.** The site now
  carries six more homes and a much larger generated drawing set (~5.2 MB). The
  initial view is still about 259 KB uncompressed / 64 KB compressed.
* **The old cantilever threshold (0.6 m) was removed.** It implied an arbitrary
  engineering limit. Every cantilever now appears in the review register with
  its geometric context.
* **The “three editable presets” statement is no longer true.** Nine concepts
  are editable: six hamlet residences plus three archive presets.
* **The gallery is no longer one undifferentiated list.** The six hamlet homes
  are separated from the preserved archive.
* **The editor's warning categories changed** from `invalid / engineering /
  accessibility / review` to `invalid-data / invalid-geometry / structural /
  accessibility / professional-review`.
* **The editor defaults to the Woodland Cottage**, not the archive Woodland
  Retreat.

## New functionality

* Explicit two-storey module geometry with elevations, storeys and levels.
* 3D collision detection that distinguishes same-level collisions from
  plan overlap at different elevations.
* Support intent, geometric bearing-overlap analysis and cantilever reporting.
* Structural review register with four statuses and a documented-evidence rule.
* Accessibility record, classification, stair/lift-reserve checks and a
  conservative two-storey classification.
* Independent roof forms: gable, shed, butterfly, flat, canopy, green and
  solar-ready.
* Ground/upper/combined plans, four elevations, section, exploded levels,
  isometric and summer/winter solar studies from one model.
* Six distinct homes with different storeys, massing, footprint, roof,
  entrance and circulation.
* Hamlet-wide comparison with sorting, filtering, similarity assessment,
  structural/accessibility summaries and derived single-storey alternatives.
* Sustainability profile with geometry-derived areas and explicit missing
  inputs; no invented carbon, energy or cost.
* Editor stacking operations, support inspection, massing preview and keyboard
  level controls.
* Site-home illustrative architectural assignment links.

## Tests run and results

All commands below were run in this environment on 2026-11-22. The bundled
Playwright browser download was absent, so browser suites were run with
`CHROMIUM_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`.
No test result is claimed that was not executed.

| Command | Result |
| --- | --- |
| `node tools/build.mjs` | Wrote 395 files; 7/7 buildings pass siting checks |
| `node tools/build.mjs --check` | OK: 395 generated files up to date |
| `node tools/check.mjs` | 466 passed, 0 failed |
| `node tools/check-design-lab.mjs` | 2,237 passed, 0 failed |
| `node tools/browser-check.mjs` | 107 passed, 0 failed |
| `node tools/design-lab-check.mjs` | 194 passed, 0 failed |
| `npm test` | Full suite passed (same five suites) |

The browser suites cover axe-core WCAG 2.2 A/AA, keyboard interactions, 320 px
reflow, dark scheme, forced colours, reduced motion, no-JavaScript fallbacks,
local-only requests and the new stacking/residences flows.

## Structural assumptions requiring professional review

* Every support reference is **design intent**, not a verified load path.
* Geometric bearing overlap does not establish capacity, connection strength,
  lateral stability, uplift resistance or foundation adequacy.
* The Offset Stack, Cross-Stacked Retreat and Solar Studio Stack have partial
  support and need an engineered transfer or cantilever.
* The Courtyard Residence includes a partial wall removal and a green-roof
  concept; both need structural, drainage and fire review.
* The Accessible Garden Home has a large canopy and wide openings; uplift and
  framing need review.
* No fire-resistance rating, egress calculation, wind/snow load or geotechnical
  capacity is calculated.

## Accessibility assumptions requiring professional review

* Step-free entrance, door widths, thresholds, circulation targets and
  adaptability are **design intents**, not measured conditions.
* A two-storey home is not fully accessible. The Offset Stack, Cross-Stacked
  Retreat and Solar Studio Stack are ground-floor accessible living
  arrangements; their upper floors are stair-only.
* No lift is designed. A future lift is not assumed to be feasible unless space
  and structure are reserved and assessed.
* CSA B651 and Ontario Building Code references are project targets; no
  compliance, licence or professional accessibility assessment is claimed.
* The path connection to the shared hamlet network is not surveyed.

## Remaining limitations

* No structural analysis, member sizing, connection design or foundation design.
* No energy, carbon, cost, daylight, overheating or acoustic model.
* No fire engineering, egress calculation or fire-resistance rating.
* No construction documents, permit drawings, BIM, IFC or DXF.
* The site plan still uses the authoritative Cabin A/pair/lodge geometry. The
  six `design_lab_home` references are illustrative assignments, not a
  replacement site model.
* The massing preview is an axonometric concept, not a georeferenced 3D site
  model with tree canopy, overshadowing or privacy analysis.
* The editor does not have screen-reader or disabled-user testing; manual
  testing is still required.
* The page-weight budget was raised to 6 MB. Further gallery growth will need
  another explicit budget decision or a view-generation reduction.
* The `usable_floor_area_m2` field is deliberately `null`; nominal container
  geometry cannot support a defensible usable-area figure.

## Work deliberately deferred

* Structural finite-element analysis and connection design.
* Automated building-code or accessibility certification.
* AI-generated architectural designs.
* A Three.js or WebGL renderer. The SVG renderer was extended and remains
  dependency-light.
* Full BIM/IFC exchange.
* A georeferenced 3D hamlet model with overshadowing, wind and privacy analysis.
* Construction cost and whole-life carbon accounting.
* A two-storey common lodge. The single-storey default is preserved; an optional
  two-storey lodge remains a separate study.

## Next useful step

Commission a structural and accessibility review of **one** stacked home —
the Offset Stack is the clearest case — and record the named reviewer,
organisation, date, scope and document against the relevant review-register
concerns. Do not change the model to claim verification without that evidence.
