# Containers Hamlet | Phase 1.2

Six individual woodland retreats that happen to share a community.

A fictional 13.5-acre Canadian Shield hamlet beside Heron Lake: six homes, one common lodge, a beaver meadow, rock ridges, mixed forest and a community land trust. This is a **vision and collaboration project**, not a real property, development proposal, lease offer, engineering design or building permit package.

Phase 1.2 rebuilds the fictional landscape around a written description, gives each home its own orientation, view and path, and turns the map into an explorable hamlet. It preserves the existing Cabin A and lodge models, drawings, downloads, cutaway explorer and validation workflow. The full audit, changed-file list and remaining assumptions are in [`docs/phase-1.2.md`](docs/phase-1.2.md).

## Start

1. In **Settings > Pages**, select **GitHub Actions** as the build and deployment source. The included workflow checks the generated files and publishes `/site` on pushes to `main`.
2. Open `site/index.html` locally to preview without a build step: it works from `file://`, with no server needed.
3. Change the design in `data/site.json`, `data/cabin-a.json` or `data/lodge.json`, then regenerate:

   ```sh
   node tools/build.mjs       # Node.js 22+ (CI uses 26 LTS, see .nvmrc), no dependencies
   node tools/check.mjs       # 140 static checks
   npm install && node tools/browser-check.mjs   # axe-core, keyboard, reflow, motion, no-JS
   ```

   The build refuses data that cannot be built or that breaks a site rule, such as a home inside the shoreline setback, a crane mat on a rock outcrop, or a walking path through the wet meadow. See [`docs/data-model.md`](docs/data-model.md).

   If Playwright's browser download is unavailable, set `CHROMIUM_PATH` to an installed Chromium or Chrome for Testing binary.

The site includes:

- a to-scale fictional landscape with terrain relief, 2 m contours, lake, beaver meadow, seasonal drainage, woodland stands, rock outcrops, clearings and building benches
- six individually oriented homes and a common lodge, with principal view arrows and generated view diagrams
- an interactive hamlet map with layers for terrain, buffers, woodland, rocks, clearings, potential building areas, paths, views and construction
- a structured, keyboard-accessible home selector with a full brief for each home
- Cabin A and common lodge drawings, a cutaway and interior explorer
- material passports, provenance and a review register
- downloadable site, terrain, home, drawing and 3D assets
- a long-form community, construction and adaptability narrative

No tracking, forms, cookies, remote scripts, web fonts or WebGL dependency. The first page view is about 400 KB uncompressed / 98 KB compressed.

## The fictional landscape

Everything is generated deterministically from `data/site.json` with seed `1202`:

- 13.5 acres / 5.46 ha, computed from an irregular parcel polygon
- Heron Lake along the west edge, with a beaver-influenced inlet
- a beaver meadow wetland, seasonally connected by two drainage channels
- a north ridge, south knoll, rock outcrops and mixed woodland stands
- small graded building benches, so homes sit on believable ground rather than a flat plane
- illustrative no-build buffers: 30 m shoreline, 30 m wetland, 10 m drainage, 8 m rock (not legal setbacks)
- one entrance, shared parking, an accessible drop-off, walking paths and a narrow emergency/construction track
- no private driveways and no road to any home

The elevation grid is exported to `site/data/terrain.json`; `site/data/homes.json` carries the home briefs and computed observations.

## Assets

Generated from the JSON (do not edit by hand; edit the data and rebuild):

- `site/assets/site-plan.svg`: the fictional 13.5-acre property in metres, with terrain relief, contours, water, wetland, woodland, rocks, clearings, buffers, paths, tracks, parking, view arrows, crane mats, homes and lodge at true scale.
- `site/assets/lake-impression.svg`: an original concept impression of a lake-edge home. Illustration, not a surveyed view.
- `site/assets/views/<home>.svg`: a plan-centred view diagram for each home and the lodge.
- `models/cabin-a/*` and `models/lodge/*`: floor plans, elevations, sections, axonometrics, cutaways, OBJ and MTL.
- `site/data/site-analysis.json`, `site/data/terrain.json`, `site/data/homes.json`: computed siting, access and view observations.
- `site/data/site.json`, `site/data/cabin-a.json`, `site/data/lodge.json`: public copies of the source data.

Source:

- `data/*.json`: human-readable concept data, with provenance, material passport and required reviews.
- `site/js/model.js` and `site/js/render.js`: shared geometry and SVG renderer, used by the generator and the browser.
- `tools/`: generator, view diagrams, illustration, static tests and browser tests.

## Construction intent

Workshop fabrication and fit-out; staged transport; minimal suitable engineered foundations; small graded benches; preplanned crane and emergency access on temporary matting; removable and repairable assemblies; external continuous insulation and a ventilated rainscreen; selective foam only after assessment; green roofs and walls only after structural, fire, moisture, biodiversity and maintenance review; native planting and monitoring. Reused containers are **not** assumed to outperform conventional timber construction. Details: [`docs/build-strategy.md`](docs/build-strategy.md).

## Important cautions

All plans are **illustrative, not permit-ready**. Shipping containers need structural verification, especially where walls are cut. External insulation, vapour and air control, thermal bridging, freeze-thaw, condensation, snow loads, fire separation and ventilation require professional detailing for the actual Canadian location. Roof gardens require engineering for saturated soil and snow loads. A wetland and shoreline may be regulated. A 13.5-acre parcel does not imply permission for six residences or rentals. Ground lease and container ownership terms require provincial legal advice.

The depicted site is fictional; no cadastral, contour, lidar, photographic, coordinate or environmental survey is represented. The terrain is an invented formula with seeded roughness and assumed building benches. Contours, view diagrams, buffer widths, slope limits, crane reach, lane widths, parking counts and path alignments are placeholders. Dimensions are conceptual. The 40-foot high-cube shell is represented by approximate external dimensions 12.192 × 2.438 × 2.896 m; confirm the actual container and clear interior after insulation and services. Accessibility notes are intentions to verify against CSA B651 and the applicable code; several rooms are known not to meet turning-space expectations.

Some neighbouring buildings may be visible. The layout aims for privacy through placement, orientation, terrain and trees; it does not guarantee visual isolation. The view assessment is a geometric and canopy observation, not a sightline study or privacy score.

## Accessibility

The website targets WCAG 2.2 AA and is tested in CI with axe-core and scripted keyboard, reflow, text-spacing, motion and colour-scheme checks. The home selector is a native radio group; every home brief is present without JavaScript; every view diagram has a title, description and alt text; the map has a generated text description, a layer legend and a siting table. It has not yet been tested with assistive technologies or by disabled people. See [`docs/accessibility.md`](docs/accessibility.md).

## Licence

Original code: MIT (`LICENSE`). Original text, site illustration, SVG drawings, OBJ geometry and data: CC BY 4.0 (`CONTENT-LICENSE.md`). Third-party plans are **not bundled** because free download is not the same as an open redistribution licence. Attribution required for adapted content. Contributors must confirm rights and provenance.

## What Phase 1.2 deliberately leaves out

- A browser-based architectural editor
- A sophisticated automated privacy optimiser or any guarantee of privacy
- Detailed construction engineering, energy modelling or embodied-carbon estimates
- Legal ground lease templates, rental booking or financial modelling
- Real property mapping or private geographic reference files
- Final housing designs for individual residents
- A backend service

These may be considered in later phases. The data architecture anticipates different housing models and an editor, but neither is implemented here.

## Next

- Site-specific cabin variants (A to F currently reuse Cabin A as a placeholder), including an accessible variant with a 1.5 m turning circle in every room.
- Grading-aware pile lengths and ramp designs from the terrain model instead of assumed ground under each building.
- A room-by-room, navigable text description of each plan.
- Independently verified structure, envelope, fire and accessibility designs.
- Energy and embodied-carbon estimates with stated methods.
- Testing with screen readers and other assistive technologies, and with disabled people.
