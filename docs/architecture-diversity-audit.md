# Architecture and diversity audit

Phase 2 begins with an audit of the repository as it stood at commit `93db570`
(“Fix crowded Design Lab navigation and mobile overflow”). The audit was made
before the versioned vertical geometry was introduced. The status column records
both the baseline and the post-implementation result, so the document doubles as
a change record.

The short finding: the project already had a strong Design Lab for **configuring
individual container arrangements**, but it was not yet designed to demonstrate
a **genuinely diverse collection of homes**. The geometry model was horizontal,
the drawings were generated from that horizontal model, and the six homes on the
site shared one authoritative cabin model.

## 1. Baseline architecture and data flow

```
data/site.json ──────────────┐
data/cabin-a.json ───────────┤  tools/build.mjs
data/lodge.json ─────────────┤      │
data/design-lab.json ────────┘      ├─ site/js/model.js (Cabin A / lodge)
                                    ├─ site/js/design-model.js (Design Lab)
                                    ├─ website pages, maps, SVG, OBJ
                                    └─ site/design-lab/concepts.js
                                            │
                                     site/design-lab/editor/editor.js
                                            │
                                  download / import / share URLs
```

* `data/cabin-a.json` and `data/lodge.json` remain the authoritative models for
  Cabin A and the common lodge. `site/js/model.js` and `site/js/render.js` build
  their drawings.
* `data/design-lab.json` is the separate Design Lab interchange source. It had
  ten concepts: nine homes plus the common lodge.
* `tools/build.mjs` validates and generates the site. `tools/lib/design-adapter.mjs`
  converts between Cabin A and the Design Lab schema in both directions and
  reports every loss.
* `site/design-lab/editor/editor.js` is a dependency-light browser application.
  It uses the same `design-schema.js` and `design-model.js` as the generator.
* No backend, accounts, analytics or remote requests exist.

## 2. Model versions and migration at baseline

| Version | Location | Behaviour |
| --- | --- | --- |
| `containers-hamlet-design/v1.0` | `design-schema.js` | Two-dimensional module positions, no storey or elevation. |
| `containers-hamlet-editor/v0.1` | `design-schema.js` | Legacy prototype. `migrateV01()` converts it to v1 and reports unmapped fields. |
| Cabin A / lodge native schema | `data/cabin-a.json`, `data/lodge.json` | Authoritative, not replaced by the Design Lab. |

There was **no v1 → v2 vertical migration** because vertical positioning did not
exist. There was no schema-level support relationship, review register or
accessibility record.

## 3. Which concepts were editable

Three of ten: Woodland Retreat, L-Shaped Haven and Woodland Courtyard. The other
six homes and the common lodge were labelled “Inspiration only” and had source
JSON, five generated views and comparison entries, but no editor preset.

## 4. Module coordinates and rotation

Modules used `position_m: [x, y]` in metres, `rotation_deg` around the vertical
axis, and nominal 20-foot or 40-foot dimensions. The world coordinate system was
X east, Y south, with local container coordinates transformed by rotation and
translation. There was no Z coordinate, no storey, no support reference and no
inter-storey assembly.

## 5. Vertical positioning

Absent. Rendering used the design-level `foundation.clearance_m` as a base for
every module. A “two-storey study” page existed as a separate explanatory page
(`site/design-lab/two-storey/index.html`), but the Design Lab geometry could not
represent a second storey. This was the most important technical risk identified
by the brief: a visual second floor without a vertical model would create
drawings that disagreed with each other.

## 6. Whether rendering used shared geometry

Partially. Plans, axonometric exteriors, cutaways, porch details, winter views,
wall sections, solar sections and foundation sections all came from the same
horizontal design object. There were **no generated elevations, building
sections, exploded views or floor-specific plans**, and the axonometric used one
common base elevation for every module.

## 7. How the six homes related to Design Lab concepts

They did not. The six site homes used `cabin-a`, `cabin-20` or `cabin-pair`
models through `data/site.json`. The nine Design Lab concepts were a separate
exploration. There was no explicit mapping from a site home to a Design Lab
concept, and no shared architectural family language.

## 8. How the lodge was represented

Two ways: an authoritative `data/lodge.json` model used by the main site, and a
separate Design Lab `common-lodge` concept used by the gallery. The Design Lab
concept was not editable. Both were single-storey; the Design Lab concept had a
gable roof and a south solar array on the roof only.

## 9. Keyboard equivalents at baseline

The editor already supported keyboard operation for most controls, because it
used native form elements and buttons. On the plan, modules were focusable with
`tabindex="0"`, and Enter/Space, arrow keys and R worked. Drag-and-drop was a
shortcut, not the only method. Undo/redo had keyboard shortcuts. There were no
keyboard shortcuts for storeys because storeys did not exist.

## 10. Validation and test coverage at baseline

* `tools/check.mjs`: 289 static checks.
* `tools/check-design-lab.mjs`: 724 schema, geometry, envelope, vegetation,
  solar, foundation, gallery and comparison checks.
* `tools/browser-check.mjs`: 107 main-site browser checks.
* `tools/design-lab-check.mjs`: 171 Design Lab browser checks (axe-core,
  keyboard, reflow, colour schemes, no-JavaScript, forced colours).

Validation distinguished invalid geometry, engineering prompts, accessibility
prompts and professional-review prompts. It did not distinguish horizontal from
vertical collisions, and it had no support, storey, stair or review-register
model.

## 11. Known limitations at baseline

* No vertical geometry, storeys, elevations or 3D collisions.
* No support relationships or structural review register.
* The six site homes and the Design Lab homes were unrelated.
* No generated elevations, sections, exploded views or floor-specific plans.
* Accessibility was recorded mostly as prose and a few warnings.
* No explicit diversity measure.
* No hamlet-wide comparison of six homes with sort/filter and alternatives.
* Site-plan previews were plan-only; a two-storey building could not be shown as
  two storeys.
* No clear distinction between legacy concepts, editable concepts and
  hamlet-selected concepts.

## 12. Existing design variations and duplication

The nine concepts differed mainly in module count and arrangement (single, pair,
L, courtyard), with similar timber cladding, roof treatment and facade
composition. Three were editable. The six site homes reused one Cabin A model or
one pair model. The common lodge was the only clearly different building type.
There was no rule-based duplication check, and colour or cladding changes were
not distinguished from primary architectural variation.

## 13. Capability matrix

Status after Phase 2. “Partial” means a capability exists but has a documented
limit.

| Capability | Baseline | After Phase 2 | Source |
| --- | --- | --- | --- |
| Explicit module type and nominal dimensions | Implemented | Implemented | `site/js/design-schema.js` |
| Horizontal module position and rotation | Implemented | Implemented | `site/js/design-schema.js`, `design-model.js` |
| Explicit vertical position and storey | Absent | Implemented | `design-schema.js` (`elevation_m`, `storey`, `levels`) |
| Two occupied storeys maximum | Absent | Implemented and tested | `design-schema.js`, `validateGeometry()` |
| Three-storey rejection | Absent | Implemented | `design-schema.js`, `tools/check-design-lab.mjs` |
| 3D collision detection | Absent | Implemented | `design-model.js` (`moduleBox3D`, `boxOverlap3D`) |
| Plan overlap at different elevations | Absent | Implemented as a review prompt, not an error | `validateGeometry()` |
| Support references | Absent | Implemented as design intent | `design-schema.js` (`support`) |
| Geometric support overlap and cantilever reporting | Absent | Implemented | `design-model.js` (`supportAnalysis`) |
| Structural review register with statuses | Absent | Implemented | `design-model.js` (`structuralReview`) |
| Professional verification without evidence | Absent | Rejected by schema | `design-schema.js` |
| Accessibility record and classification | Partial prose | Implemented | `design-schema.js` (`access`), `accessibilityProfile()` |
| Stair and lift-reserve record | Absent | Implemented | `access.stair` |
| Independent roof geometry | Partial (`roof_form` gable/shed) | Implemented for seven forms | `roof_form`, `roofGeometry()` |
| Floor-specific plans | Absent | Implemented | `renderPlan({storey})` |
| Ground and upper plans with muted other level | Absent | Implemented | `renderPlan` |
| Four elevations | Absent | Implemented | `renderElevation` |
| Building section | Absent | Implemented | `renderSection` |
| Exploded levels | Absent | Implemented | `renderExploded` |
| Summer and winter solar studies | Partial (seasonal axo) | Implemented as separate studies | `renderSolarStudy` |
| Isometric / axonometric | Implemented | Implemented with explicit Z | `renderAxo` |
| Editor storey selector | Absent | Implemented | `site/design-lab/editor/editor.js` |
| Stack, align, offset, rotate, perpendicular operations | Absent | Implemented | `editor.js` |
| Support inspection in editor | Absent | Implemented | `editor.js` |
| Keyboard level controls | Absent | Implemented (Page Up/Down, A) | `editor.js` |
| Undo/redo, reset, import/export, ZIP | Implemented | Preserved and extended | `editor.js` |
| Hamlet massing preview | Plan footprint only | Implemented as storey/height labels plus an axonometric massing panel | `editor.js` |
| Six distinct homes | Absent | Implemented | `data/design-lab.json` |
| Legacy-concept preservation | Implemented | Preserved and migrated | `data/design-lab.json`, `Schema.migrateV1` |
| Rule-based diversity measure | Absent | Implemented | `architectureFeatures`, `architecturalSimilarity` |
| Hamlet-wide comparison with sort/filter | Absent | Implemented | `site/design-lab/residences/` |
| Sustainability evidence fields | Partial qualitative | Implemented with explicit missing inputs | `sustainabilityProfile` |
| Site-home architectural assignment | Absent | Implemented as illustrative metadata | `data/site.json` |
| Automated vertical/stacking tests | Absent | Implemented | `tools/check-design-lab.mjs` |
| Browser keyboard/stacking tests | Partial | Implemented | `tools/design-lab-check.mjs` |
| Generated elevations/sections for all concepts | Absent | Implemented | `tools/build.mjs` |

## 14. Migration and preservation record

* The ten v1.0 concepts were migrated to v2.0 in place. Every module became
  storey 0 at the recorded foundation clearance. No v1 field was dropped.
* The six new homes are additive. The nine original concepts are retained as
  `role: "legacy-concept"` and remain in the gallery under an archive heading.
* The common lodge is retained with `role: "common-lodge"` and its original
  single-storey default. An optional two-storey lodge remains a separate study,
  not the default.
* `data/cabin-a.json` and `data/lodge.json` are unchanged. `tools/lib/design-adapter.mjs`
  still reports its conversion losses.
* The six site buildings now carry an illustrative `design_lab_home` reference.
  This does **not** change the authoritative site geometry, Cabin A, the lodge,
  or the published community layout.

## 15. Residual limitations

The audit deliberately leaves the following unresolved:

* No structural analysis, finite-element model, connection design or foundation
  capacity calculation.
* No energy, carbon, cost or whole-life model.
* No verified accessibility compliance assessment.
* No construction documents or permit drawings.
* No BIM/IFC exchange.
* The site-plan footprint preview is still a plan overlay; the massing panel is
  an axonometric concept, not a georeferenced 3D site model.
* The six homes are design briefs, not resident-specific or site-surveyed
  designs.
