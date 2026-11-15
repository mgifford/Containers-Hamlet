# Eco Hamlet | Phase 1.1

A fictional 15-acre Canadian lakeside community-land-trust concept. This is a **vision and recruitment prototype**, not an existing property, lease offer, engineering design, or building permit package.

Phase 1.1 makes the JSON data the single source of truth. Floor plans, elevations, sections, axonometric views, OBJ/MTL models, the site plan, the page's tables and the in-browser cutaway explorer are all generated from `data/*.json`. Changes and the audit of the Phase 1 starter are in [`docs/phase-1.1.md`](docs/phase-1.1.md).

## Start

1. In **Settings > Pages**, select **GitHub Actions** as the build and deployment source. The included workflow checks the generated files and publishes `/site` on pushes to `main`.
2. Open `site/index.html` locally to preview without a build step: it works from `file://`, with no server needed.
3. Change the design in `data/site.json`, `data/cabin-a.json` or `data/lodge.json`, then regenerate:

   ```sh
   node tools/build.mjs       # Node.js 22+ (CI uses 26 LTS, see .nvmrc), no dependencies
   node tools/check.mjs       # 99 static checks
   npm install && node tools/browser-check.mjs   # axe-core, keyboard, reflow, motion, no-JS
   ```

   The build refuses data that cannot be built or that breaks a site rule, such as a cabin inside the shoreline setback. See [`docs/data-model.md`](docs/data-model.md).

The site includes:

- a to-scale fictional property map with contours, no-build buffers, lanes, crane standing points and computed siting checks
- selectable buildings with details
- Cabin A and common lodge drawings
- a cutaway and interior explorer
- material passports and a review register
- downloadable data

No tracking, forms, cookies, remote scripts, web fonts or WebGL dependency. The first page view is about 59 KB compressed.

## Assets

Generated from the JSON (do not edit by hand; edit the data and rebuild):

- `site/assets/site-plan.svg`: the fictional 15-acre property in metres, with lake, wetland, hill, buffers, lanes, parking, crane reach, homes, porches and ramps at true scale, and a key.
- `models/cabin-a/floor-plan.svg` and `models/lodge/floor-plan.svg`: dimensioned conceptual plans cut 1.2 m above the floor, with clear room sizes, doors, windows, porches and ramps.
- `models/*/elevations.svg`: four elevations at the plan's scale.
- `models/*/section.svg`: transverse section and a to-scale wall build-up (lining, steel, external insulation, ventilated cavity, timber rainscreen).
- `models/*/axonometric.svg` and `cutaway.svg`: exterior and interior views.
- `models/cabin-a/cabin-a.obj` and `models/lodge/lodge.obj`, each with an `.mtl` file: editable 3D geometry in metres, Y up, faces wound outward. Envelope layers, framed openings, fixtures, porch, ramp, trellis and piles are named objects. Import into Blender or FreeCAD.
- `site/data/site-analysis.json`: computed distances, slopes, crane reach and access checks.

Source:

- `data/*.json`: human-readable concept data, with provenance, material passport and required reviews.
- `site/js/model.js` and `site/js/render.js`: shared geometry and SVG renderer, used by the generator and the browser.
- `tools/`: generator and tests.

## Construction intent

Workshop fabrication and fit-out; staged transport; minimal suitable engineered foundations; preplanned crane and emergency access; removable/repairable assemblies; external continuous insulation and ventilated rainscreen; selective foam only following assessment; green roofs/walls only after structural, fire, moisture, biodiversity, and maintenance review; avoid shading solar. Minimize habitat disruption, preserve wetlands, and prioritize reclaimed material where safe and documented. Details: [`docs/build-strategy.md`](docs/build-strategy.md).

## Important cautions

All plans are **illustrative, not permit-ready**. Shipping containers need structural verification, especially where walls are cut. Exterior insulation, vapour/air control, thermal bridging, freeze-thaw, condensation, snow loads, fire separation, and ventilation require professional detailing for the actual Canadian location. Roof gardens require engineering for saturated soil and snow loads. A wetland and shoreline may be regulated. A 15-acre parcel does not imply permission for six residences or rentals. Ground lease and container ownership terms require provincial legal advice.

The depicted site is fictional; no cadastral, contour, or environmental survey is represented. The contours come from an invented formula. Buffer widths, slope limits, crane reach and lane widths are placeholders. Dimensions are conceptual. The 40-foot high-cube shell is represented by approximate external dimensions 12.192 x 2.438 x 2.896 m; confirm the actual container and clear interior after insulation/services. Accessibility notes are intentions to verify against CSA B651 and the applicable code; several rooms are known not to meet turning-space expectations.

## Accessibility

The website targets WCAG 2.2 AA and is tested in CI with axe-core and scripted keyboard, reflow, text-spacing, motion and colour-scheme checks. It has not yet been tested with assistive technologies or by disabled people. See [`docs/accessibility.md`](docs/accessibility.md).

## Licence

Original code: MIT (`LICENSE`). Original text, site illustration, SVG drawings, OBJ geometry and data: CC BY 4.0 (`CONTENT-LICENSE.md`). Third-party plans are **not bundled** because free download is not the same as an open redistribution licence. Attribution required for adapted content. Contributors must confirm rights and provenance.

## Next phase

Delivered in 1.1:

- JSON source authoritative for SVG and 3D geometry
- parametric openings
- an accessible cutaway and interior explorer
- the common lodge
- the material passport
- a configurable terrain with no-build zones

Still to do:

- A first-person or room-by-room walk-through, with a structured, navigable text description of each plan.
- Site-specific cabin variants (B to F currently reuse Cabin A), including an accessible variant with a 1.5 m turning space in every room.
- Grading-aware foundations and ramps from the terrain model, instead of assuming level grade.
- Independently verified design variants (structure, envelope, fire, accessibility).
- Energy and embodied-carbon estimates with stated methods.
- Opt-in non-GitHub interest collection with a privacy policy.
- Testing with screen readers and other assistive technologies, and with disabled people.
