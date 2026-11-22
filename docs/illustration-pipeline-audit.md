# Illustration pipeline audit

**Status:** Phase 1 audit for the reproducible architectural illustration system.
The repository is at Phase 2 (`main` after PR #16). This audit was made before
the new pipeline code was added.

## 1. Current data flow

```
data/design-lab.json (schema v2.0)
   |
   +-- site/js/design-schema.js       validate, canonicalize, migrate
   +-- site/js/design-model.js        geometry, metrics, plans, elevations,
   |                                  sections, exploded views, axonometrics,
   |                                  solar studies, diversity, sustainability
   |
   +-- tools/build.mjs                writes design-lab/views/*.svg,
   |                                  data/*.json, architecture pages,
   |                                  residences comparison, editor presets
   |
   +-- site/design-lab/editor/        live editor, same schema/model
   |
   +-- docs/visualisation-prompts.md  manually written creative prompts
```

The architectural model is authoritative for the SVG drawings. The existing
Markdown prompts are a **separate, manually maintained narrative**, not generated
from the model. That is the main gap this phase must close.

## 2. Capability audit

| Capability | Status | Evidence / limitation |
| --- | --- | --- |
| Canonical v2.0 design model | Complete | `site/js/design-schema.js`, `data/design-lab.json` |
| Explicit storeys/elevations | Complete | `elevation_m`, `storey`, `levels` |
| 3D collision/support checks | Complete | `design-model.js` |
| Six distinct homes | Complete | `data/design-lab.json` |
| Container block schematic | Missing | No dedicated schematic; plan/axo only |
| Container plan/elevation block layout | Missing | Current plan includes rooms/openings; no simplified block diagram |
| Ground/upper plans | Complete | `renderPlan({storey})` |
| Four elevations | Complete | `renderElevation` |
| Building section | Complete | `renderSection` |
| Exploded levels | Complete | `renderExploded` |
| Axonometric | Complete | `renderAxo`; fixed camera |
| Opposite exterior / site-facing references | Missing | Axo has no camera rotation option |
| Ground-level approach reference | Partial | Front elevation exists; no perspective approach |
| Roof plan | Missing | Roof geometry exists; no roof plan SVG |
| Interior reference | Partial / limited | Room zones are longitudinal bands; no partitions or interior camera geometry |
| Room schedule | Complete | Zones, openings, metrics |
| Material schedule | Partial | `materials` passport and cladding types; not a normalized palette |
| Text description | Partial | `describe()` is a short summary; no structured facts |
| Illustration configuration | Missing | No separate config schema |
| Scene specification | Missing | No normalized machine-readable scene |
| Generated prompt | Missing | `docs/visualisation-prompts.md` is hand-written |
| Negative prompt library | Partial | One shared negative prompt in Markdown |
| Artifact hashes/manifest | Missing | ZIP has files but no manifest/hashes |
| Freshness tracking | Missing | No current/outdated state |
| User-created homes | Complete for editing/export | Editor supports arbitrary designs; no illustration pipeline |
| GitHub Pages static compatibility | Complete | Current build; no backend |
| Accessibility tests | Complete for current pages | axe/keyboard/reflow/no-JS suites |
| Illustration editor section | Missing | No Illustrate controls |

## 3. Known inconsistencies between prompts and model

The machine-readable report is
[`data/illustration-discrepancies.json`](../data/illustration-discrepancies.json).
Summary:

| # | Design | Prompt says | Model says | Decision |
| --- | --- | --- | --- | --- |
| 1 | Woodland Cottage | “main south approach” | Site path approach is east; entrance is on the local south face; principal view 245° SW | **Unresolved** — generated prompt describes the south garden/entrance side and states the site path approach is east. Do not call it the main approach. |
| 2 | Offset Stack | Upper balcony at the east end | Upper porch `p2` is on the **south** face | **Correct prompt** to south balcony. |
| 3 | Courtyard Residence | One long and one short module | Both modules are 40 ft | **Correct prompt** to two 40 ft modules. |
| 4 | Cross-Stacked Retreat | Upper balcony | Only an upper east **door**; no balcony/porch object | **Correct prompt**; record balcony as unresolved, not modeled. |
| 5 | Cross-Stacked Retreat | Butterfly interior ceiling | Roof form is modeled; interior ceiling geometry is not | **Correct prompt**; do not invent a ceiling. |
| 6 | Accessible Garden Home | “fully accessible” implication | Access classification is a design target; 20 ft zones; no verified turning circles | **Correct prompt**; say “step-free design intent”, not “fully accessible”. |
| 7 | Solar Studio Stack | Installed PV panels | `solar_array.enabled = true`; upper module roof is solar | **Supported**; generated prompt may say installed PV. |
| 8 | Solar Studio Stack | Upper balcony | Only an upper east door; no balcony object | **Correct prompt**; record unresolved. |
| 9 | Solar Studio Stack | Alternating-tread stair | Model records it; usability/code concerns remain | **Keep as unresolved**; generated prompt warns. |
| 10 | All homes | Interior perspectives | Room zones only; no partitions/fixtures/camera geometry | **Limit**; no spatially accurate interior perspective. |

## 4. Reusable components

- `Schema.canonicalize`, `validateSchema`, `migrateAny`.
- `Model.moduleCorners`, `moduleBox3D`, `moduleBase`, `moduleTop`, `roofGeometry`,
  `metrics`, `architectureFeatures`, `accessibilityProfile`,
  `structuralReview`, `sustainabilityProfile`.
- `Model.renderPlan`, `renderElevation`, `renderSection`, `renderExploded`,
  `renderAxo`, `renderSolarStudy`.
- `tools/build.mjs` view generation and `site/design-lab/concepts.js`.
- Editor `state.design`, `mutate`, `renderAll`, ZIP writer, download helper,
  import/export, undo/redo.
- Playwright/axe test harness.

## 5. New pipeline design

```
Design JSON (v2.0)
   |
   v
normalized design (Schema.canonicalize)
   |
   +-- design hash (architecture only)
   |
   v
illustration configuration (presentation only)
   |
   v
scene specification (design facts + site + camera + constraints + unresolved)
   |
   +-- consistency validation
   +-- container schematic SVG
   +-- roof plan SVG
   +-- reference views (axo/elevation rotations)
   +-- structured description
   +-- prompt / negative prompt
   +-- manifest + artifact hashes + freshness
   +-- ZIP package
```

### Separation

- **Architectural facts** come from the design model and are never changed by the
  illustration configuration.
- **Architectural intentions** come from `access`, `features`, review records and
  `architecture.intent`. They are labelled as intentions.
- **Illustration preferences** come from the illustration configuration: view,
  camera, style, season, time, weather, people, material policy. They never
  modify geometry.

### Camera and site orientation

`site.rotation_deg` is the model-to-site rotation. Local bearings are converted to
world bearings by adding that rotation. The site's `views.main.azimuth_deg` is the
authoritative principal view. The prompt generator uses the **world** bearing, not
the local south face.

## 6. Implementation plan

1. Add `site/js/design-illustration.js` with config validation, scene spec,
   prompt/negative/description renderers, hashes, manifest and consistency checks.
2. Add deterministic container schematic, roof plan and reference-view renderers
   to `design-model.js`; rotate a copy of the design for opposite/site-facing
   views.
3. Add the **Illustrate** section to the editor: view/style/environment/detail
   controls, prompt preview, reference view, copy/download, package ZIP, freshness.
4. Extend `tools/build.mjs` to generate schematics, roof plans, opposite/site
   references, six-home prompt packages and a public illustration page.
5. Add static/browser tests for schema, geometry, prompts, hashes, freshness,
   accessibility and exports.
6. Correct the hand-written prompt contradictions, preserve the creative intent,
   and document the difference between deterministic drawings and generative
   illustrations.

## 7. Baseline results

Before changes:

| Command | Result |
| --- | --- |
| `node tools/build.mjs --check` | OK — 395 generated files current |
| `node tools/check.mjs` | 466 passed, 0 failed |
| `node tools/check-design-lab.mjs` | 2,237 passed, 0 failed |
| `node tools/browser-check.mjs` | 107 passed, 0 failed |
| `node tools/design-lab-check.mjs` | 194 passed, 0 failed |

## 8. Deliberate limits

- No AI image generation in this phase.
- No claim that an interior perspective is accurate: the model has longitudinal
  room zones, not partitions/fixtures/camera geometry.
- No claim that an illustration is a construction drawing.
- No new 3D framework or WebGL. SVG and existing projections are extended first.
- No account, backend, tracking or API key.
