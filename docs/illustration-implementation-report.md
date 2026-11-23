# Illustration pipeline implementation report

> **Historical note:** PR #19 introduced the pipeline while the selected homes
> were still partly two-storey. Phase 3 updates the scenes and prompts for the
> single-storey models and adds interior room prompts. See
> [`phase-3-implementation-report.md`](phase-3-implementation-report.md).

## Mission

Make the architectural model authoritative for drawings, descriptions,
illustration prompts and reference packages, so a design change cannot leave
contradictory prose behind, and so a user-created design gets the same pipeline
as the six published homes.

## Status

**Implemented and tested**, with explicit limits:

- no AI image generation;
- no claim that an illustration is geometrically verified;
- no interior perspective claim, because the model has room zones rather than
  partitioned volumes;
- no engineering, energy, code or accessibility approval.

## Files changed

### New pipeline

- `site/js/design-illustration.js` — illustration configuration, scene
  specification, prompt/negative/description renderers, hashes, validation,
  artifact plan and package manifest.
- `site/js/design-model.js` — container block plan, container block elevation,
  roof plan, design rotation for reference views and `renderReference`.
- `tools/lib/design-illustration-page.mjs` — public illustration page.
- `site/design-lab/illustration/` — generated six-home packages (prompt,
  negative prompt, description, config, scene, manifest, design JSON) and public
  page/CSS.
- `data/illustration-discrepancies.json` — machine-readable prompt/model
  discrepancy record.

### Editor

- `site/design-lab/editor/index.html` — Illustrate controls and output section,
  new script include.
- `site/design-lab/editor/editor.js` — config/scene state, prompt/reference
  generation, current/outdated status, copy/download, package ZIP, import/load
  resets.
- `site/design-lab/editor/editor.css` — prompt preview and illustration layout.

### Build and tests

- `tools/build.mjs` — schematics, roof plans, opposite/approach/site-facing
  references, six illustration packages, public page, site view/orientation data.
- `tools/check-design-lab.mjs` — 2,399 checks including scene validation,
  prompt consistency, hashes, packages, schematics, references and user designs.
- `tools/design-lab-check.mjs` — 208 browser checks including Illustrate,
  regeneration, downloads, package signature and public page.
- `tools/check.mjs` — page budget kept at 6 MB; legacy archive reference views are
  generated on demand rather than published by default.
- `tools/lib/design-architecture.mjs` — new schematic/roof/reference slides and
  illustration package links.
- `tools/lib/design-nav.mjs` — Illustrate navigation entry.
- `data/design-lab.json` unchanged in this phase; the pipeline reads it.
- `data/site.json` unchanged; `tools/build.mjs` now carries views and orientation
  into `site-data.js`.

### Documentation

- `docs/illustration-pipeline-audit.md`
- `docs/illustration-pipeline.md`
- `docs/illustration-implementation-report.md` (this file)
- `docs/visualisation-prompts.md` — source-data corrections and pipeline note.
- `README.md`, `docs/design-lab.md`, `docs/data-model.md`, `docs/site-pages.md`

## Schema and migration

No new architectural schema version was introduced. The design schema remains
`containers-hamlet-design/v2.0`, and v1.0/v0.1 migrations are unchanged.

Two additive schemas:

- `containers-hamlet-illustration/v1` — presentation settings only.
- `containers-hamlet-scene/v1` — generated scene, not an architectural source.

The package manifest schema is `containers-hamlet-package-manifest/v1`.

No design JSON is rewritten by the pipeline. The scene, prompt and description
are derived outputs.

## New functionality

- Canonical scene specification from design + site + illustration configuration.
- World-bearing site orientation (site rotation added to local bearings).
- Deterministic container block plan and elevation.
- Deterministic roof plan.
- Opposite/approach/site-facing reference views.
- Generated description, prompt and negative prompt from structured facts.
- Explicit facts / intentions / unresolved separation.
- Design and presentation hashes.
- Current/outdated illustration status.
- Package ZIP with manifest, design, description, scene, prompts, drawings,
  reference and an illustrations README.
- Six published illustration packages.
- Public explainer page.
- User-created designs use the same pipeline; no six-home hardcoding.
- Discrepancy report and corrected manual prompts.

## Existing functionality preserved

- Six residences, common lodge, nine archived concepts and migrations.
- All existing plans, elevations, sections, exploded views, solar studies and
  galleries.
- Editor stacking, openings, rooms, porches, decks, roof, accessibility, warning
  and import/export functions.
- Undo/redo, reset, JSON import/export, existing SVG/ZIP exports.
- Static GitHub Pages; no backend, accounts, tracking, API key or remote runtime.
- Existing browser/accessibility checks.

## Replaced or changed

- The hand-written `docs/visualisation-prompts.md` is no longer the generator;
  it is retained as creative source with corrections. Generated prompts
  supersede it.
- The architecture pages now include schematic/roof/reference slides for the six
  homes and the lodge.
- The whole-site page budget remains 6 MB; the pipeline adds schematics,
  references, package metadata and six package pages, and legacy archive views
  are not pre-generated.
- The site navigation adds an **Illustrate** entry.

## Generated output examples

- `site/design-lab/views/<id>-container-layout.svg`
- `site/design-lab/views/<id>-container-layout-elevation.svg`
- `site/design-lab/views/<id>-roof-plan.svg`
- `site/design-lab/views/<id>-exterior-opposite.svg`
- `site/design-lab/views/<id>-approach.svg`
- `site/design-lab/views/<id>-site-facing.svg`
- `site/design-lab/illustration/<id>/prompt.md`
- `site/design-lab/illustration/<id>/scene.json`
- `site/design-lab/illustration/<id>/manifest.json`
- `site/design-lab/illustration/index.html`

## Tests run

| Command | Result |
| --- | --- |
| `node tools/build.mjs --check` | OK — 480 generated files current |
| `node tools/check.mjs` | 508 passed, 0 failed |
| `node tools/check-design-lab.mjs` | 2,399 passed, 0 failed |
| `node tools/browser-check.mjs` | 107 passed, 0 failed |
| `node tools/design-lab-check.mjs` | 208 passed, 0 failed |

Browser suites used `CHROMIUM_PATH` pointing at installed Chrome because the
bundled Playwright browser download was unavailable.

## Prompt/model discrepancies resolved

| Issue | Resolution |
| --- | --- |
| Woodland Cottage “main south approach” vs east path | Prompt uses south garden/entrance side and records east path approach; unresolved site decision remains. |
| Offset Stack upper balcony east vs south | Prompt places modeled p2 on the south face; access unresolved because no south door. |
| Courtyard “short module” | Both modules are 40 ft; prompt corrected. |
| Cross-Stacked upper balcony | Only an east door is modeled; prompt says balcony not modeled. |
| Cross-Stacked butterfly ceiling | Exterior roof modeled; interior ceiling not; prompt refuses to invent it. |
| Accessible Garden “fully accessible” | Prompt says step-free design intent and carries the accessibility verification limit. |
| Solar Studio installed PV | Supported by model; prompt may show installed PV. |
| Solar Studio upper balcony | Only an east door is modeled; prompt says balcony not modeled. |
| Solar Studio alternating stair | Recorded stair type; prompt carries unresolved usability/code concern. |
| Interior perspectives | Pipeline states interior perspective is unavailable and generates room-zone plans only. |

## Accessibility limitations

- Automated axe checks are not proof of WCAG conformance.
- Manual screen-reader, zoom, voice-control and disabled-user testing still
  required.
- The prompt/negative text is in labelled focusable regions, and all controls are
  native, but a full manual keyboard/screen-reader pass is still needed.
- No interior perspective means no false visual accessibility claim; the
  room-zone plan and description carry the limitation.

## Known geometry limitations

- Room zones are longitudinal bands; partitions, fixtures, door swings and
  interior camera positions are not modeled.
- Reference views are SVG projections/rotations, not measured photographs.
- Exterior reference camera rotation is approximate.
- A balcony can exist in the model without a door on the same face; the pipeline
  reports this rather than drawing an accessible balcony.
- A butterfly roof is modeled externally but not as an interior ceiling.
- No 3D site/terrain model for overshadowing or privacy.

## Unresolved architectural decisions

- Woodland Cottage site path approach (east) versus south garden entrance.
- Offset Stack south balcony access (no south door).
- Cross-Stacked and Solar Studio upper doors without modeled balconies.
- Cross-Stacked butterfly interior ceiling.
- Alternating-tread stair acceptability.
- Accessible Garden Home turning circles, thresholds and fixture clearances.
- Roof/PV structural and snow/wind design for the reference camera.

## Deferred

- AI image generation, image verification and API integrations.
- PNG reference export (SVG is canonical).
- 3D perspective camera with hidden-surface handling.
- BIM/IFC, measured site model, overshadowing/privacy simulation.
- Automated construction documents.
- Manual accessibility testing with disabled users.

## Next steps

1. Resolve the Woodland path/entrance and upper-balcony access decisions in the
   model or in the site brief.
2. Add real partition/fixture geometry before offering interior perspective.
3. Commission a structural/accessibility review of one stacked home and attach
   the documented evidence to the review register.
4. Add PNG export only after the SVG reference is stable and a dependency-light
   raster path is justified.
