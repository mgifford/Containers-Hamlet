# Containers Hamlet | Phase 1.5

Six individual woodland retreats that happen to share a community.

A fictional 15-acre Canadian Shield hamlet beside Heron Lake: six homes, one common lodge, a beaver meadow, rock ridges, mixed forest and a community land trust. Phase 1.5 adds a **resident-facing community guide**: six illustrative resident scenarios, ownership/governance, a cost-category worksheet, a ten-stage feasibility roadmap, practical living, participation and a usability plan and a two-option accessible Cedar layout study. It preserves the Phase 1.3 Container Home Design Studio: nine container homes plus a green, yellow-framed café lodge under one gable roof with south-slope solar, five-view architectural galleries, an accessible slideshow, a thermal-envelope editor, configurable exterior insulation assemblies, living green walls, elevated helical-pile foundations, a small footbridge study, a container-pattern/paint/door-shelter guide with creek and hillside options, a forest fire-resilience guide and a two-storey structural study, a community-resilience brief, a separated water-cycle guide and arrangement studies in the gallery, a side-by-side comparison tool, direct plan manipulation and descriptive shareable pages for all six cabins and the lodge, including a 20-foot compact Juniper and offset two-container pairs, and a Look inside explorer covering all seven with single- and two-container configurations. It remains a browser-based studio for container-first homes. This is a **vision and collaboration project**, not a real property, development proposal, lease offer, engineering design or building permit package.

Phase 1.5 preserves the Phase 1.2 landscape, the authoritative Cabin A and lodge models, all drawings, downloads, the cutaway explorer and the validation workflow. The new editor uses a separate, versioned multi-container schema and never overwrites the existing architectural data. See [`docs/phase-1.5.md`](docs/phase-1.5.md), the [`Phase 1.5 audit`](docs/phase-1.5-audit.md), [`LICENSING.md`](LICENSING.md), [`docs/phase-1.3.md`](docs/phase-1.3.md), the [gallery/thermal extension](docs/phase-1.3-extension.md) the [envelope/vegetation extension](docs/phase-1.3-envelope-vegetation.md) the [foundations and access study](docs/foundations-and-access.md), the [container patterns and security study](docs/container-patterns.md) and the [gallery arrangements and disclosure notes](docs/gallery-disclosure.md), the [home variation notes](docs/home-variation.md), the [fire-resilience study](docs/fire-resilience.md), the [two-storey study](docs/two-storey.md), the [community resilience and water study](docs/resilience-water.md), the [site-structure and page-weight notes](docs/site-pages.md) for the audit, changes, tests, screenshots and limitations.

## Design Lab

- Gallery: `/design-lab/` — nine homes and a common lodge, grouped by one, two, three containers and the shared lodge. Every design has a five-view architectural page: exterior, plan, cutaway, porch/deck detail and winter study, plus a seasonal summer/winter comparison, approximate window exposure, an envelope wall section, a solar section and an elevated foundation section. The vegetation guide at `site/design-lab/vegetation/` covers the four planting systems.
- Editor: `/design-lab/editor/` — three fully editable presets: Woodland Retreat, L-Shaped Haven and Woodland Courtyard. The common lodge is a developed concept with five views and a comparison entry, but is not editable yet.
- Six further homes and the common lodge are clearly labelled **inspiration only**, with source JSON, five generated views, solar tilt/azimuth and comparison entries.
- The editor supports independent module position and rotation, 20/40-foot modules, openings, screened porches, decks, independent climbing-plant trellises, living walls, edible planter walls, evergreen privacy screens, timber connectors, interior room bands, rigid-board/mineral-wool/wood-fibre/spray-foam/hybrid exterior assemblies with wall sections, roof/floor insulation, thermal-bridge mitigation, rainscreen and air/vapour strategy, window performance, shading, HRV/ERV, cold-climate heat pump, cladding, roof and colour, material intent, a summer/winter view, 39° due-south tilted solar with winter-60°/summer-30° options, elevated helical-pile foundations with no-compaction intent, approximate window exposure, click a module on the plan to select it, undo/redo, reset, JSON import/export, SVG exports, a design summary, a ZIP bundle and an illustrative hamlet preview.
- No login, account, upload, backend, WebGL or third-party runtime request. Designs stay in the browser until downloaded. The architectural gallery uses no auto-advancing carousel; keyboard buttons, arrow keys and a show-all alternative are available.
- Editor warnings cover invalid geometry, engineering concerns, accessibility concerns and items needing professional review. They are not a building code assessment.

## Start

1. In **Settings > Pages**, select **GitHub Actions** as the build and deployment source. The included workflow checks the generated files and publishes `/site` on pushes to `main`.
2. Open `site/index.html` locally to preview the main site without a build step. The Design Lab editor uses ES5-style classic scripts and works from the GitHub Pages site; a local server is recommended for `/design-lab/` because of browser file restrictions.
3. Change the design in `data/site.json`, `data/cabin-a.json`, `data/lodge.json` or `data/design-lab.json`, then regenerate:

   ```sh
   node tools/build.mjs       # Node.js 22+ (CI uses 26 LTS, see .nvmrc), no dependencies
   node tools/check.mjs       # 289 main-site static checks
   node tools/check-design-lab.mjs   # 722 Design Lab schema, geometry, envelope, vegetation, solar, foundation, gallery and comparison checks
   npm install
   npm run test:browser       # 107 main-site browser checks
   npm run test:design-lab    # 171 Design Lab browser checks
   ```

   The build refuses data that cannot be built or that breaks a site rule, such as a home inside the shoreline setback, an overlapping container module, a porch beyond its face, or a concept with no valid editable presets. See [`docs/data-model.md`](docs/data-model.md) and [`docs/design-lab.md`](docs/design-lab.md).

   If Playwright's browser download is unavailable, set `CHROMIUM_PATH` to an installed Chromium or Chrome for Testing binary.

## Resident pages

- `/community/` — what the hamlet is, private/shared/hypothetical questions.
- `/community/scenarios/` — six resident situations linked to existing homes.
- `/community/ownership/` — ownership, lease, membership, governance and protections.
- `/community/costs/` — cost categories and a user-entered worksheet; no invented prices.
- `/community/roadmap/` — ten-stage feasibility sequence.
- `/living/` — practical life, tradeoffs and accessibility limits.
- `/participate/` — contribution paths without a contact database.
- `/community/usability/` — testing plan and results template, not a completed test.
- `/licensing/` — current/intended licence matrix.

## Main site

The site includes:

- a to-scale fictional landscape with terrain relief, 2 m contours, lake, beaver meadow, seasonal drainage, woodland stands, rock outcrops, clearings and building benches
- six individually oriented homes and a common lodge, with principal view arrows and generated view diagrams
- an interactive hamlet map with layers for terrain, buffers, woodland, rocks, clearings, potential building areas, paths, views and construction
- structured, keyboard-accessible home briefs
- Cabin A and common lodge drawings, a cutaway and interior explorer
- material passports, provenance and a review register
- downloadable site, terrain, home, drawing and 3D assets
- a long-form community, construction and adaptability narrative
- a **Design** section that introduces the Design Lab, its five-view architectural galleries, the common lodge concept, its thermal and envelope options, its vegetation systems, its elevated foundations and footbridge study, and its comparison tool

No tracking, data-collecting forms, cookies, remote scripts, web fonts or WebGL dependency. The first page view is about 258 KB uncompressed / 62 KB compressed. The whole published site is about 3516 KB, under the revised 3.5 MB budget.

## The fictional landscape

Everything is generated deterministically from `data/site.json` with seed `1202`:

- 15 acres / 6.07 ha, computed from an irregular parcel polygon
- Heron Lake along the west edge, with a beaver-influenced inlet
- a beaver meadow wetland, seasonally connected by two drainage channels
- a north ridge, south knoll, rock outcrops and mixed woodland stands
- small graded building benches, so homes sit on believable ground rather than a flat plane
- illustrative no-build buffers: 30 m shoreline, 30 m wetland, 10 m drainage, 8 m rock (not legal setbacks)
- one entrance, shared parking, an accessible drop-off, walking paths and a narrow emergency/construction track
- no private driveways and no road to any home

The elevation grid is exported to `site/data/terrain.json`; `site/data/homes.json` carries the home briefs and computed observations.

## Design Lab data flow

```
data/design-lab.json
   ├─ concepts (9)
   ├─ modules, openings, zones, porches, decks, connections
   └─ provenance, material notes, warnings (derived)
        ↓ tools/build.mjs + site/js/design-model.js
site/design-lab/views/*.svg            plan, exterior, cutaway
site/design-lab/data/*.json            downloadable source
site/design-lab/concepts.js            editor presets
site/design-lab/site-data.js           hamlet preview
site/design-lab/index.html             gallery
site/design-lab/editor/                editor
```

The existing `data/cabin-a.json` remains authoritative for Cabin A. `tools/lib/design-adapter.mjs` provides an explicit, reported conversion in both directions; it never writes Cabin A data and lists everything it cannot preserve.

## Assets

Generated from the JSON (do not edit by hand; edit the data and rebuild):

- `site/assets/site-plan.svg`: the fictional 15-acre property in metres, with terrain relief, contours, water, wetland, woodland, rocks, clearings, buffers, paths, tracks, parking, view arrows, crane mats, homes and lodge at true scale.
- `site/assets/lake-impression.svg`: an original concept impression of a lake-edge home. Illustration, not a surveyed view.
- `site/assets/views/<home>.svg`: a plan-centred view diagram for each home and the lodge.
- `models/cabin-a/*` and `models/lodge/*`: floor plans, elevations, sections, axonometrics, cutaways, OBJ and MTL.
- `site/design-lab/views/<concept>-{plan,exterior,cutaway}.svg`: three views per Design Lab concept.
- `site/design-lab/data/*.json`: downloadable concept designs.
- `site/data/site-analysis.json`, `site/data/terrain.json`, `site/data/homes.json`: computed siting, access and view observations.

Source:

- `data/*.json`: human-readable concept data, with provenance, material passport and required reviews.
- `site/js/model.js`, `site/js/render.js`: shared geometry and SVG renderer for Cabin A and the lodge.
- `site/js/design-schema.js`, `site/js/design-model.js`: Design Lab schema, migration, geometry, assessment and SVG views.
- `site/design-lab/editor/editor.js`: the editor application.
- `tools/`: generator, concept views, static tests and browser tests.

## Construction intent

Workshop fabrication and fit-out; staged transport; minimal suitable engineered foundations; small graded benches; preplanned crane and emergency access on temporary matting; removable and repairable assemblies; external continuous insulation and a ventilated rainscreen; selective foam only after assessment; green roofs and walls only after structural, fire, moisture, biodiversity and maintenance review; native planting and monitoring. Reused containers are **not** assumed to outperform conventional timber construction. Details: [`docs/build-strategy.md`](docs/build-strategy.md).

## Important cautions

All plans are **illustrative, not permit-ready**. Shipping containers need structural verification, especially where walls are cut. Exterior insulation, vapour and air control, thermal bridging, freeze-thaw, condensation, snow loads, fire separation and ventilation require professional detailing for the actual Canadian location. Roof gardens require engineering for saturated soil and snow loads. A wetland and shoreline may be regulated. A 15-acre parcel does not imply permission for six residences or rentals. Ground lease and container ownership terms require provincial legal advice.

The depicted site is fictional; no cadastral, contour, lidar, photographic, coordinate or environmental survey is represented. The terrain is an invented formula with seeded roughness and assumed building benches. Contours, view diagrams, buffer widths, slope limits, crane reach, lane widths, parking counts and path alignments are placeholders. Dimensions are conceptual. The 40-foot high-cube shell is represented by approximate external dimensions 12.192 × 2.438 × 2.896 m; confirm the actual container and clear interior after insulation and services. Accessibility notes are intentions to verify against CSA B651 and the applicable code; several rooms are known not to meet turning-space expectations.

Some neighbouring buildings may be visible. The layout aims for privacy through placement, orientation, terrain and trees; it does not guarantee visual isolation. The view assessment is a geometric and canopy observation, not a sightline study or privacy score.

## Accessibility

The website targets WCAG 2.2 AA and is tested in CI with axe-core and scripted keyboard, reflow, text-spacing, motion and colour-scheme checks. The Design Lab gallery, architectural slideshows and vegetation guide are progressive enhancements over static HTML; the editor uses native form controls, labelled inputs, visible focus, live status messages, undo/redo and keyboard-operable actions. The slideshow has no auto-advance, visible Previous/Next and Show-all controls, arrow-key support, descriptive captions and a non-carousel alternative. Every generated view has a title and description; the hamlet preview has a text alternative. It has not yet been tested with screen readers or by disabled people. See [`docs/accessibility.md`](docs/accessibility.md).

## Licence

- Core Containers Hamlet code: MIT (`LICENSE`).
- Core original text, site illustration, SVG drawings, OBJ geometry and data: CC BY 4.0 (`CONTENT-LICENSE.md`).
- Design Lab code under `site/design-lab/`, `site/js/design-*.js` and the Design Lab adapter: **AGPL-3.0-or-later** (`site/design-lab/LICENSE.txt`).
- Original Design Lab documentation, diagrams, wall sections, concept data and generated views: **CC BY-SA 4.0** (`site/design-lab/CONTENT-LICENSE.md`).
- Third-party notices: `site/design-lab/THIRD-PARTY-NOTICES.md`.

Third-party plans are **not bundled** because free download is not the same as an open redistribution licence. No café photographs are bundled or published: redistribution rights were not confirmed, so they were used only as private reference. Supplier links (Ecohome, GSky, LiveWall, Wallemi and building-science sources) are references only; no supplier diagrams, photographs or product designs are copied. The Common Lodge is an original interpretation of the written brief, not a reproduction of a photographed building or interior. Attribution required for adapted content. Contributors must confirm rights and provenance.

## What Phase 1.3/1.5 deliberately leaves out

- A generic home builder; the project remains container-focused.
- Direct drag-and-drop manipulation of every component (numeric/keyboard controls and click-to-select are the current route).
- A structural, geotechnical, energy, hygrothermal, fire, acoustic, carbon, cost or life-cycle calculator; the foundation, thermal and envelope panels are qualitative and require professional design.
- A full 3D walkthrough, BIM/IFC/DXF export or construction documents.
- Public repository write access or a design submission service.
- Rental booking, financial modelling, legal lease templates or real property mapping.
- Final housing designs or a claim that every configuration is buildable.
- A backend service.

Six homes and the common lodge remain inspiration-only. The editor supports one to three containers; more would need a different structural and transport story.

## Next

- Add the six remaining homes and the common lodge to the editable set, one at a time.
- Add a fully accessible 1.5 m turning-circle variant and verify it against CSA B651.
- Add a direct-manipulation plan editor with complete keyboard equivalents and undo/redo.
- Add structural, envelope, fire, transport and accessibility review workflows with named reviewers.
- Add a contributor submission process through pull requests, without public write access.
- Test with screen readers and disabled people, and with architects, engineers and builders.
- Extend the existing Design Lab editor with direct manipulation, a proper hygrothermal/energy model, geotechnical/foundation and bridge design, planting and irrigation design, more housing variants and a professional review workflow without pretending to be a code or engineering check.
EOF