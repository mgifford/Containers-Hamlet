# Phase 1.3 extension: architectural galleries, thermal comfort and a common lodge

> A further extension adds configurable exterior insulation assemblies, wall sections and living vegetation systems. See [`phase-1.3-envelope-vegetation.md`](phase-1.3-envelope-vegetation.md). Current counts are 246 main static, 712 Design Lab static, 79 main browser and 150 Design Lab browser checks; whole site 3145 KB under a revised 3.2 MB budget.

This extension builds on the Phase 1.3 Container Home Design Studio. It adds a five-view architectural gallery for every developed design, a café-inspired common lodge concept, thermal-envelope options, and a side-by-side comparison tool. It keeps the project container-first and does not turn it into a generic architecture application.

The existing authoritative `data/cabin-a.json` and `data/lodge.json` remain unchanged. The common lodge in this extension is an additional Design Lab concept, not a replacement for the authoritative lodge model or its drawings.

## A. Architectural gallery and accessible slideshow

Every developed design now has five views generated from one multi-container model:

1. an exterior architectural view;
2. a dimensioned concept floor plan;
3. an interior roof-off cutaway;
4. a screened porch or deck detail;
5. a winter exterior study.

The gallery at `/design-lab/` has ten cards: nine homes and the common lodge. Each card links to `/design-lab/architecture/<id>/`, which contains the five views.

- Visible **Previous**, **Next** and **Show all views** buttons. Nothing advances automatically.
- The slide region is focusable; **Left/Right arrows**, **Home** and **End** move through views when it has focus.
- A polite live status announces the current view and the total.
- **Show all views** exposes the non-carousel alternative: all five figures in one column. It does not remove any content.
- Without JavaScript, all five views are shown as static figures and the controls are hidden. A `<noscript>` explanation says so.
- Every slide has descriptive `alt` text and a visible caption with a drawable description.
- **Geometry-backed** labels are used for the plan, cutaway and porch/deck detail. The exterior and winter images are **illustrative studies** generated from the same geometry. The page states the difference explicitly.
- The porch/deck view is a cropped detail of the same axonometric geometry, not a separate hand-drawn image. The winter view changes the setting, vegetation and roof snow treatment but not the building geometry.

The slideshow has no timer, autoplay, remote asset, animation or storage call.

## B. Common lodge concept

`common-lodge` is a three-container community building around a large timber-framed, glazed central hall. It is café-inspired in programme and atmosphere, not a reproduction of any photographed building.

Programme:

- shared kitchen, pantry, laundry and two accessible washrooms in the north container wing;
- workshop, meeting room, maintenance store and boot room in the south wing;
- café servery, office and a universal washroom in the west wing;
- a large central gathering/dining hall between the north and south wings;
- an 8 × 3 m screened veranda, a covered west entrance and two decks;
- large landscape-facing windows, a green roof on the north module, solar on the other modules, and a separate trellis.

The central hall is modelled as a glazed timber connection with yellow mullions, with `glazed`, `door_type` and `glazing_area_m2` fields. The single gable roof is 10° with a clear ridge; the 39° solar array is mounted only on its south slope and is aligned to true south independently of the building rotation. No north-side array is drawn. It is intended to use **insulated sliding or folding doors**, not an uninsulated glazed garage door. The reference palette is deep green containers with yellow frames and a large glazed café frontage. The thermal panel and comparison flag the large glazing, condensation, solar-gain and door-performance risks. The design does not claim that the glazing meets a required thermal performance.

The common lodge is currently **inspiration only**, like the six further homes. The three editable presets remain Woodland Retreat, L-Shaped Haven and Woodland Courtyard. The lodge has source JSON, five views and a comparison entry.

## C. Thermal envelope

Each design now carries a `thermal` object:

- `wall_insulation_strategy` and average per-module external wall insulation;
- `roof_insulation_mm` and `floor_insulation_mm`;
- `thermal_bridge_mitigation`;
- `rainscreen_ventilation`;
- `air_vapour_control`;
- `window_performance`;
- `external_shading`;
- `heat_recovery_ventilation`;
- `heating`;
- explanatory `notes`.

The editor exposes roof and floor insulation, thermal-bridge mitigation, rainscreen, air/vapour strategy, window performance, external shading, HRV/ERV and a cold-climate heat pump. Per-module wall insulation remains in the module controls. The values persist in JSON export and import.

The editor's **Thermal envelope** panel includes a plain-language explanation of:

- summer overheating from large west/south glazing, unshaded glass and internal gains;
- winter heat loss through the envelope, glazing, air leakage and thermal bridges;
- condensation where warm moist air meets cold steel, glass or a thermal bridge;
- moisture risks around the rainscreen, foundations, roof and green roof;
- why a large glazed hall needs insulated sliding/folding doors and a condensation strategy.

The panel is qualitative. It does not calculate U-values, heating load, energy use, carbon, cost or code compliance, and it does not certify performance.

## D. Comparison

`/design-lab/compare/` compares two concepts side by side. It shows:

- container count and type;
- nominal conditioned area (modules plus glazed hall), screened porch area and total porch/deck area;
- approximate glazing area and glazing as a percentage of nominal conditioned area;
- wall/roof/floor insulation, windows, shading, air/vapour strategy, thermal bridges, ventilation and heating;
- accessibility considerations;
- qualitative thermal strengths and risks;
- structural and installation items that need engineering review.

The page also includes an all-concepts table. Without JavaScript, the default pair and the table remain available. The selectors and Swap button need JavaScript. There are no cost, carbon, energy or code figures; areas are nominal geometry and the thermal notes are design prompts.

## E. Licensing and attribution

- Original application code, including the architecture and comparison scripts, is **AGPL-3.0-or-later**. Full text: `site/design-lab/LICENSE.txt`.
- Original documentation, architectural illustrations and concept data are **CC BY-SA 4.0**. See `site/design-lab/CONTENT-LICENSE.md`.
- The core Containers Hamlet site remains **MIT** and **CC BY 4.0**.
- No third-party code was added. Third-party notices: `site/design-lab/THIRD-PARTY-NOTICES.md`.

### Café photographs

No café photographs are bundled or published. The locally reviewed reference files did not have confirmed redistribution rights, and they were not plans or container-café drawings. The Common Lodge is an original interpretation of the written café/lodge brief: shared kitchen and dining, a generous hall, accessible washrooms, workshop/meeting space, large landscape windows, a screened veranda and covered entrances. It does not reproduce any photographed building, interior or sign.

## F. Validation

At the time of this extension:

| Check | Result |
| --- | --- |
| `node tools/build.mjs --check` | 119 generated files current |
| `node tools/check.mjs` | 190 passed, 0 failed |
| `node tools/check-design-lab.mjs` | 491 passed, 0 failed |
| `node tools/browser-check.mjs` | 79 passed, 0 failed |
| `node tools/design-lab-check.mjs` | 80 passed, 0 failed |
| Main first view | 235 KB uncompressed / 62 KB gzipped |
| Whole published site | 2536 KB (under 2.5 MB) |

Design Lab static checks cover the schema, thermal fields, five-view determinism, XML attribute integrity, gallery and architecture pages, the no-auto-advance code, comparison metrics, licence and privacy constraints.

Browser checks cover the carousel's visible controls, no autoplay after a wait, Left/Right/Home/End keys, Show-all alternative, five loaded views, descriptive captions and alt text, geometry-vs-illustrative labels, no-JavaScript fallback, gallery-to-editor navigation, comparison selection and swapping, thermal values persisting through export/import, 320 px reflow, dark scheme, forced colours, reduced motion and axe-core WCAG 2.2 A/AA.

Screenshots: [`screenshots/phase-1.3-extension/`](screenshots/phase-1.3-extension/).

- [Ten-concept gallery](screenshots/phase-1.3-extension/gallery-top.jpg)
- [Common Lodge five-view page](screenshots/phase-1.3-extension/architecture-top.jpg)
- [Show-all/non-carousel alternative](screenshots/phase-1.3-extension/architecture-all.jpg)
- [Common Lodge plan](screenshots/phase-1.3-extension/lodge-plan.jpg), [exterior](screenshots/phase-1.3-extension/lodge-ext.jpg), [winter](screenshots/phase-1.3-extension/lodge-winter.jpg), [porch detail](screenshots/phase-1.3-extension/lodge-porch.jpg)
- [Common Lodge architecture page](screenshots/phase-1.3-envelope-vegetation/lodge-architecture.jpg)
- [Thermal-envelope controls](screenshots/phase-1.3-extension/editor-thermal.jpg)
- [Comparison](screenshots/phase-1.3-extension/compare-top.jpg)
- [Architecture page at mobile width](screenshots/phase-1.3-extension/architecture-mobile.jpg)
- [Updated main Design section](screenshots/phase-1.3-extension/main-design.jpg)

## Deferred

- Editing the common lodge and the six inspiration-only homes in the editor.
- Direct drag-and-drop movement of modules and openings.
- Publishing the café photographs or any other third-party reference image.
- A real thermal model, energy/carbon/cost calculation, code check or certification.
- Structural, fire, acoustic, accessibility and building-envelope engineering review.
- A full 3D walkthrough, BIM/IFC/DXF or construction documents.
- A backend, public design submission, login or personal-data collection.
- Testing with screen readers and disabled people, and with architects, engineers and builders.

The design views are concepts. They are not construction drawings and must not be built without professional review.
