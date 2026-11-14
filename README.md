# Eco Hamlet | Phase 1

A fictional 15-acre Canadian lakeside community-land-trust concept. This is a **vision and recruitment prototype**, not an existing property, lease offer, engineering design, or building permit package.

## Start

1. Upload the contents of this directory to a new GitHub repository.
2. In **Settings > Pages**, select **GitHub Actions** as the build and deployment source. The included workflow publishes `/site` on pushes to `main`.
3. Open `site/index.html` locally to preview without a build step.
4. Modify `data/site.json` and `data/cabin-a.json` as the design evolves. The SVG drawings are editable in Inkscape or any vector editor.

The site includes an illustrated fictional property map, interactive selectable buildings, cabin interior/exterior views, a downloadable dimensioned concept plan, elevations, a section, an editable OBJ geometry model, and downloadable data. No tracking, forms, cookies, remote scripts, or WebGL dependency.

## Assets

- `site/assets/site-plan.svg`: illustrated 15-acre fictional property, with lake, wetland, hill, paths, and proposed cabins.
- `models/cabin-a/floor-plan.svg`: dimensioned conceptual layout, including screened porch.
- `models/cabin-a/elevations.svg`: conceptual front and side elevations.
- `models/cabin-a/section.svg`: envelope and external insulation concept.
- `models/cabin-a/cabin-a.obj`: basic editable 3D massing geometry, in metres. Import into Blender or FreeCAD (OBJ import supported depending on installation).
- `data/*.json`: human-readable concept metadata.

## Construction intent

Workshop fabrication and fit-out; staged transport; minimal suitable engineered foundations; preplanned crane and emergency access; removable/repairable assemblies; external continuous insulation and ventilated rainscreen; selective foam only following assessment; green roofs/walls only after structural, fire, moisture, biodiversity, and maintenance review; avoid shading solar. Minimize habitat disruption, preserve wetlands, and prioritize reclaimed material where safe and documented.

## Important cautions

All plans are **illustrative, not permit-ready**. Shipping containers need structural verification, especially where walls are cut. Exterior insulation, vapour/air control, thermal bridging, freeze-thaw, condensation, snow loads, fire separation, and ventilation require professional detailing for the actual Canadian location. Roof gardens require engineering for saturated soil and snow loads. A wetland and shoreline may be regulated. A 15-acre parcel does not imply permission for six residences or rentals. Ground lease and container ownership terms require provincial legal advice.

The depicted site is fictional; no cadastral, contour, or environmental survey is represented. Dimensions are conceptual. The 40-foot high-cube shell is represented by approximate external dimensions 12.192 x 2.438 x 2.896 m; confirm the actual container and clear interior after insulation/services.

## Licence

Original code: MIT (`LICENSE`). Original text, site illustration, and SVG drawings: CC BY 4.0 (`CONTENT-LICENSE.md`). Original OBJ geometry: CC BY 4.0. Third-party plans are **not bundled** because free download is not the same as an open redistribution licence. Attribution required for adapted content. Contributors must confirm rights and provenance.

## Next phase

Make the JSON source authoritative for generating SVG and 3D geometry, add accurate parametric door/window openings, accessible walk-through and cutaway modes, independently verified design variants, and opt-in non-GitHub interest collection with a privacy policy.
