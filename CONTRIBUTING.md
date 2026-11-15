# Contributing

Open an issue before major architectural revisions. Describe the intended change, dimensions, accessibility implications, climate assumptions, materials and reuse provenance, and any effects on embodied carbon or repairability. Do not submit third-party plans unless their licence permits redistribution and modification. Identify generated concept imagery and never label it as a surveyed or engineered drawing. Preserve SVG text labels and semantic descriptions. Do not submit personal information about prospective residents to public issues.

## Changing the design

Drawings, models and most page content are generated. Edit the data, not the outputs:

1. Change `data/cabin-a.json`, `data/lodge.json`, `data/site.json` or `data/design-lab.json` (see [`docs/data-model.md`](docs/data-model.md) and [`docs/design-lab.md`](docs/design-lab.md)). The site data includes the terrain seed, water, wetland, drainage, woodland stands, rocks, clearings, access, building benches and each home's orientation and view brief. The Design Lab data is separate and never replaces Cabin A or the lodge.
2. Run `node tools/build.mjs`. If the data cannot be built or breaks a site rule, the build stops and explains why.
3. Run `node tools/check.mjs`, `node tools/check-design-lab.mjs`, and if you changed a page or script, `npm install && node tools/browser-check.mjs && node tools/design-lab-check.mjs`.
4. Commit the data and the regenerated files together. CI fails if they disagree. Keep the terrain and tree seeds fixed unless you intend to change the whole fictional landscape; a seed change invalidates the documented elevation hash and every view diagram.

Hand-written files are `site/index.html` (outside the `<!-- gen:… -->` markers), `site/style.css`, `site/script.js`, `site/js/model.js`, `site/js/render.js`, `site/design-lab/` (outside the generated gallery cards), `site/js/design-*.js`, `tools/` and `docs/`.

## Ground rules

- Keep the site static: no backend, tracking, cookies, third-party requests or proprietary model formats. The Design Lab must remain entirely client-side.
- Keep the Design Lab container-first. Do not turn it into a generic home builder or add non-container typologies without a project decision.
- Preserve the licence scopes: core code MIT and core content CC BY 4.0; Design Lab code AGPL-3.0-or-later and original Design Lab content CC BY-SA 4.0. Include the full AGPL text and update the third-party notices when adding dependencies.
- Never overwrite `data/cabin-a.json` or `data/lodge.json` with editor or adapter output. Conversions must report preserved and unmapped information.
- Keep it accessible: native controls first, visible focus, text alternatives for every drawing and view diagram, nothing conveyed by colour alone, no motion without consent. Keep the browser checks passing, and describe any manual assistive technology testing you did. The home selector must keep all briefs available without JavaScript.
- Keep it light: system fonts, SVG, lazy-loaded drawings. The checks enforce a page-weight budget.
- Keep the three Design Lab views synchronized with the same geometry. Do not substitute unrelated images for generated plans or cutaways.
- Record provenance: update `provenance` and the `material_passport` when you change materials or sources. The site illustration is original concept art, not a photograph, survey or rendering of a real place.
- Do not add private geographic information: no coordinates, KML, GeoJSON, property maps, survey data or photographs of a real parcel. The site uses local fictional metres only.
- When you change a home's position, rotation or view target, update its `character`, `orientation`, `views` (including `winter`) and `design_note` so the brief still matches the model. The build will reject a view that no longer faces its named target.
- Placeholder values such as setbacks, thicknesses and limits must stay labelled as placeholders unless a qualified reviewer has confirmed them for a real site.
