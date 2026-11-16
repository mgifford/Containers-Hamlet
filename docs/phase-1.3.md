# Phase 1.3: Container Home Design Studio

> The Phase 1.3 extension adds five-view architectural galleries, a common lodge concept, thermal-envelope options and comparison. See [`phase-1.3-extension.md`](phase-1.3-extension.md). Current counts are 247 main static, 717 Design Lab static, 79 main browser and 163 Design Lab browser checks; the original Phase 1.3 figures below are retained as a historical record. The [envelope/vegetation extension](phase-1.3-envelope-vegetation.md) adds configurable assemblies, wall sections and planted systems; the [foundations and access study](foundations-and-access.md) adds elevated piles, no-compaction guidance and a footbridge concept, and the [container patterns study](container-patterns.md) adds configurations, paint and doors as shelter.

This phase integrates the supplied Container Home Design Lab starter into Containers Hamlet, adds a nine-concept container-home gallery, and builds a browser-based editor for three matured presets. The project remains container-first. Timber, glass, screened porches, decks, green roofs and planting are complementary layers, not a move toward a generic home builder.

The authoritative Cabin A and lodge models, drawings, downloads, cutaway explorer and landscape data from Phase 1.2 are preserved. The Design Lab uses a separate, versioned schema and an explicit adapter; it never overwrites the existing architectural data.

## 1. Baseline before implementation

Baseline on `main` at the Phase 1.2 merge (`36f3124`):

| Check | Result |
|---|---|
| `node tools/build.mjs --check` | 45 generated files current |
| `node tools/check.mjs` | 140 passed, 0 failed |
| `node tools/browser-check.mjs` | 79 passed, 0 failed |
| Main site | 15 acres, six oriented homes, lodge, landscape, home briefs and view diagrams; the map key sits beside the map and the selected-building panel has a stable height |
| Existing models | Cabin A and lodge authoritative; all drawings and downloads working |
| Design Lab | Absent; no gallery or editor |

The supplied archive `container-home-design-lab-AGPL-starter.zip` contained:

- `editor/index.html`, `editor/editor.js`, `editor/style.css`
- a README, AGPL-3.0-or-later licence notice, CC BY-SA 4.0 content licence and third-party notices

The prototype had 20-foot/40-foot presets, a simplified two-container hybrid, basic windows, porch dimensions, insulation, roof/cladding, a plan SVG, JSON/SVG export and JSON import. It used `containers-hamlet-editor/v0.1`, had no explicit module objects, no interior zones, no cutaway, no undo/redo and no hamlet placement.

Its licence was respected: the full AGPL text is now included at `site/design-lab/LICENSE.txt`; the original Design Lab content is CC BY-SA 4.0; third-party notices are preserved.

## 2. What was delivered

### 2.1 Integration

- `site/design-lab/index.html` is the gallery and introduction.
- `site/design-lab/editor/index.html` is the editor.
- The main site gains a **Design** navigation link and a **Design your container home** section with three editable preset cards and links to the gallery/editor.
- The static-site/GitHub Pages architecture is unchanged. No backend, login, account, upload service or runtime third-party request.
- The Design Lab is a separate licence scope: AGPL-3.0-or-later for code, CC BY-SA 4.0 for original Design Lab content.

### 2.2 Nine concepts, three editable

| Group | Concept | Editable |
|---|---|---|
| One container | Woodland Retreat (40 ft) | Yes |
| One container | Micro Studio (20 ft) | No, inspiration |
| One container | Lakeside Hideaway (40 ft) | No, inspiration |
| Two containers | Forest Courtyard | No, inspiration |
| Two containers | L-Shaped Haven | Yes |
| Two containers | Open Plan | No, inspiration |
| Three containers | Woodland Courtyard | Yes |
| Three containers | Family Lodge | No, inspiration |
| Three containers | Gathering House | No, inspiration |

Each concept has:

- source JSON using `containers-hamlet-design/v1.0`;
- an exterior concept SVG;
- a roof-off cutaway SVG;
- a dimensioned plan SVG;
- a card with description, container count/type, approximate nominal footprint, interior uses, outdoor living, solar/green-roof opportunities, accessibility and environmental notes;
- download links for JSON and all three views.

All three views for a concept are generated from the same multi-container geometry. The gallery does not use unrelated images as a substitute for drawings; the exterior view is an illustrative axonometric generated from that geometry, not a photograph or AI image.

### 2.3 Shared schema and adapter

`site/js/design-schema.js` defines `containers-hamlet-design/v1.0` with:

- stable module ids and explicit nominal dimensions;
- per-module position, rotation, insulation, cladding and roof;
- openings with face, type, centre position, width, height and sill;
- interior zones with type and range;
- separate porches, decks and connectors;
- conceptual foundation, materials, provenance, licence and warnings;
- migration from `containers-hamlet-editor/v0.1`.

`site/js/design-model.js` provides the shared geometry, validation, assessment and all three SVG views. It runs in Node for the gallery and in the browser for the editor.

`tools/lib/design-adapter.mjs` maps Cabin A into the Design Lab schema and a compatible design back to a Cabin A **proposal**. Both directions return a report of preserved and unmapped information. The existing `data/cabin-a.json` is not changed; a static check asserts that.

### 2.4 Editor

The editor supports:

- three presets: Woodland Retreat, L-Shaped Haven and Woodland Courtyard;
- one to three containers;
- 20-foot and 40-foot modules;
- independent x/y position and rotation;
- arrangement presets (single, parallel, adjacent, L and courtyard);
- per-module insulation, cladding type/colour, roof type, structural wall-removal and conceptual cantilever;
- adding, editing and removing windows, doors, sliding doors and open passages;
- porches with module, face, start, length, depth, screening and roof;
- decks beyond porches;
- independent climbing-plant trellises with offset, length and height;
- material-intent choices (reclaimed containers, reused timber, replaceable cladding, continuous external insulation, selective spray foam, reversible connections, modular porch/deck, solar-ready, green-roof investigation);
- separate timber connectors with explicit position, size, rotation, covering and screening;
- room zones with type, range and accessibility note;
- select a module by clicking the plan (pointer shortcut) or using the module controls;
- undo, redo and reset;
- JSON import/export, plan/exterior/cutaway SVG export, Markdown summary and ZIP;
- import of the old v0.1 schema through the migration path;
- a hamlet preview with homesite, rotation, footprint, primary-view arrow and conflict prompts.

All controls are native form controls with labels. The editor is entirely client-side. Export is blocked only when the editor's explicit geometric rules fail; JSON remains available to preserve the work.

### 2.5 Assessment and warnings

Warnings are grouped as:

- **Invalid geometry** — duplicate ids, wrong module count, opening bounds/overlaps, zone bounds/overlaps, porch/deck bounds, module overlap, connector overlap, references.
- **Engineering review** — openings near corners, large structural wall removals, conceptual cantilevers, green roof loads, thin insulation, transport width/height, 40-foot modules, multiple lifts, deep porch shading, general envelope/condensation.
- **Accessibility review** — narrow doors, small bathroom zones, door-swing proximity, circulation and fixture clearance.
- **Professional review** — structure, foundation, fire, code and the fact that no professional has reviewed the design.

The editor does not claim Ontario Building Code compliance or any structural, energy or fire result.

### 2.6 Hamlet preview

The preview places the customised footprint at a selected fictional homesite and rotation over the Phase 1.2 site plan. It shows the primary-view direction, existing building footprints, and conflicts with:

- the parcel boundary;
- the 30 m shoreline buffer;
- the 30 m wetland buffer;
- rock buffers;
- drainage buffers;
- other buildings (the selected homesite's own illustrative building is excluded).

Paths/tracks are reported separately as a possible adjustment note. The preview is illustrative and does not add the design to the published community layout.

### 2.7 Downloads and provenance

Exports include:

- JSON with the full editable design, provenance and licence;
- plan, exterior and cutaway SVG;
- a Markdown summary with counts, rooms, checks and provenance;
- a ZIP with the JSON, three SVGs, summary and notice.

No personal information is collected. There is no repository write access or design submission service.

## 3. What changed or was removed, and why

| Change | Reason |
|---|---|
| Added a Design Lab and a main-site Design section | Integrate the supplied editor and make the container concepts discoverable without replacing the existing site. |
| Added a new v1 schema instead of reusing Cabin A | The editor needs one-to-three independent modules, porches, decks and connectors. The existing Cabin A format is authoritative and remains unchanged. |
| Added an adapter and migration | Preserve the existing data, support the starter's v0.1 files, and report any information that cannot be represented. |
| Replaced the starter's simplified pair with explicit modules | The brief requires stable module ids, independent positions/rotations and no implicit combined width. |
| Rebuilt the starter's plan and added exterior/cutaway views | The brief requires three synchronized representations from one geometry. |
| Added warning categories and undo/redo | The starter had only input-range warnings and no history. |
| Added hamlet placement preview | Connect a custom design to the existing fictional landscape without changing the community layout. |
| Added AGPL/CC BY-SA scopes and full licence text | The supplied starter is AGPL-3.0-or-later / CC BY-SA 4.0; the core project remains MIT / CC BY 4.0. |

Nothing was removed from the core site's six homes, lodge, landscape, drawings, downloads, material passports or reviews. The six inspiration-only Design Lab concepts are explicitly not yet editable, not silently disabled.

## 4. Validation

### Static

- `node tools/build.mjs --check`: **84 generated files current**.
- `node tools/check.mjs`: **167 passed, 0 failed**.
- `node tools/check-design-lab.mjs`: **260 passed, 0 failed**.

The Design Lab checks cover:

- nine concepts, three per group, three editable and six inspiration-only;
- schema validation for every concept and negative tests for bad schema, too many modules and duplicate ids;
- no invalid geometry in any gallery concept;
- deterministic plan/exterior/cutaway SVG output;
- every generated view has a title, description, `role="img"` and the CC BY-SA notice;
- every concept has JSON and three views that match a fresh render;
- gallery cards, alt text, dimensions, links and licence links;
- editor structure, scripts, no-JS message and no remote assets;
- full AGPL text and content licence;
- migration of v0.1 (including the pair and its porch), with an unmapped report;
- multi-container geometry: independent movement, overlap rejection, opening and porch rules;
- Cabin A adapter reports, a compatible proposal, and confirmation that `data/cabin-a.json` is unchanged;
- the lodge data and drawings still exist;
- no network/storage calls, remote endpoints or real-world coordinates.

### Browser

- `node tools/browser-check.mjs`: **79 passed, 0 failed** for the main site.
- `node tools/design-lab-check.mjs`: **53 passed, 0 failed**.

Design Lab browser checks cover:

- gallery axe-core WCAG 2.2 A/AA, nine cards, three editable, six inspiration-only, images loaded with alt text, all 47 local links returning 200;
- editor axe-core, initial three views, three presets, independent module movement, undo/redo, rotation updates both plan and exterior, adding openings/rooms/porches/decks/connectors by keyboard;
- invalid geometry reporting, disabled drawing/ZIP exports, JSON still available, undo recovery;
- hamlet preview image load, homesite change and text alternative;
- JSON, SVG and ZIP downloads; ZIP signature and contents; JSON re-import; v0.1 migration import;
- 320 px reflow, axe at 320 px, forced colours, reduced motion, no-JS message, no third-party requests.

### Page weight

| Measure | Result |
|---|---|
| Main first view | 235 KB uncompressed, 62 KB gzipped, 8 requests |
| Whole published site | 2240 KB |

The whole site includes the gallery, three views for nine concepts, source JSON, the editor, the full AGPL text and the Phase 1.2 assets. It remains under the 2.5 MB budget.

### Screenshots

- [Main site: Design your container home](screenshots/phase-1.3/main-design-section.jpg)
- [Gallery desktop](screenshots/phase-1.3/gallery-top.jpg)
- [Gallery mobile](screenshots/phase-1.3/gallery-mobile-top.jpg)
- [Editor desktop](screenshots/phase-1.3/editor-top.jpg)
- [Three-container editor plan](screenshots/phase-1.3/editor-courtyard-views.jpg)
- [Editor mobile](screenshots/phase-1.3/editor-mobile-top.jpg)
- Earlier Phase 1.2 [before screenshots](screenshots/after/) remain useful for comparison of the main site.

### What has not been validated

- No screen reader, voice control, switch access or disabled-user testing of the Design Lab.
- No structural, envelope, fire, energy, acoustic, transport, geotechnical or wastewater engineering.
- No Ontario Building Code, CSA B651, zoning, wetland, shoreline or species-at-risk review.
- No cost, life-cycle or embodied-carbon model.
- No full 3D walkthrough, BIM, IFC or DXF.
- No real property mapping or survey.
- No test that every possible editor configuration is structurally feasible.

## 5. Deliberately deferred

- Direct drag-and-drop manipulation of every component (numeric and keyboard controls are the current editable route; undo/redo is implemented).
- Editing the six inspiration-only concepts.
- A full 3D walkthrough, BIM/IFC/DXF, construction drawings or permit documents.
- Structural, energy, fire, acoustic and life-cycle calculators.
- A public design submission service or repository write access.
- Rental booking, financial modelling, legal ground leases or real property mapping.
- A generic home builder or non-container typologies.

## 6. Remaining assumptions

- Container dimensions are nominal published values; actual units vary.
- Insulation thickness, roof build-up, cladding, glazing and foundation details are conceptual.
- Module adjacency, connectors and lift points have not been engineered.
- Opening reinforcement and wall removals need a structural engineer.
- Room zones are conceptual bands, not partitions or verified clear areas.
- The hamlet preview uses the Phase 1.2 fictional site and is not a survey.
- The gallery's "approximate footprint" is nominal external module area before insulation, not a measured building area.
- The editor's warnings are prompts, not a compliance or engineering assessment.

## 7. Licensing

- Core Containers Hamlet code: MIT; core original content: CC BY 4.0.
- Design Lab code: AGPL-3.0-or-later; full text at `site/design-lab/LICENSE.txt`.
- Original Design Lab documentation, concepts, illustrations and generated views: CC BY-SA 4.0.
- Third-party notices: `site/design-lab/THIRD-PARTY-NOTICES.md`.

No third-party architectural plans or media are bundled. The supplied starter's notices are preserved in scope.

## 8. Pull request summary

This branch:

- integrates a separate Design Lab under `/design-lab/` with a gallery and editor;
- adds nine original container concepts with three synchronized generated views each;
- makes Woodland Retreat, L-Shaped Haven and Woodland Courtyard editable, with explicit one-to-three-module geometry;
- adds a versioned schema, v0.1 migration, Cabin A adapter, validation and deterministic SVG generation;
- adds undo/redo, presets, openings, porches, decks, trellises, connectors, room zones, roof/cladding/insulation options, exports/imports and a hamlet preview;
- extends validation to 167 main static, 260 Design Lab static, 79 main browser and 53 Design Lab browser checks;
- preserves the existing models, drawings, downloads and landscape;
- documents licensing, limitations and deferred work.

It should be reviewed before merge. It does not claim structural feasibility, code compliance, accessibility certification or approval for any particular design.
EOF