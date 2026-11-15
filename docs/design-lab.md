# Container Home Design Lab

The Design Lab is a container-first design gallery and editor at `/design-lab/`. It is a separate, explicitly scoped part of Containers Hamlet:

- **Gallery:** `/design-lab/` — nine homes and the common lodge
- **Architecture pages:** `/design-lab/architecture/<id>/` — five views per design, seasonal pair, approximate exposure and envelope section
- **Editor:** `/design-lab/editor/`
- **Vegetation guide:** `/design-lab/vegetation/` — four systems, evidence and sources
- **Ground guide:** `/design-lab/ground/` — Ontario foundation options, no-compaction and a footbridge concept
- **Comparison:** `/design-lab/compare/`
- **Schema:** `containers-hamlet-design/v1.0`
- **Legacy import:** `containers-hamlet-editor/v0.1` (the supplied starter schema)

It is not a generic home builder. The container is the core of every design; timber, glass, screens, decks, roofs and planting are supporting layers.

## What the editor does

- One, two or three container modules.
- 20-foot and 40-foot high-cube nominal sizes.
- Independent module position and rotation.
- Arrangement presets: single, parallel, adjacent, L-shaped and three-module courtyard.
- Windows, doors, sliding doors and open passages, with face, centre position, width, height and sill.
- Screened or covered porches, decks beyond porches, independent climbing-plant trellises, and separate timber connectors.
- A five-view architectural gallery for every design: exterior, plan, cutaway, porch/deck detail and winter study.
- Thermal-envelope choices: roof and floor insulation, thermal-bridge mitigation, ventilated rainscreen, air/vapour strategy, window performance, external shading, HRV/ERV and a cold-climate heat pump.
- Versioned exterior envelope assemblies: rigid board, mineral wool, wood fibre, exterior closed-cell spray foam and hybrid, with an explanatory wall section and warnings.
- Vegetation systems: freestanding trellis, modular living wall, edible planter wall and evergreen privacy screen; each records plant type, mature height, seasonal foliage, irrigation, maintenance, separation and support.
- Summer/winter view control, approximate window exposure by world-facing side, and qualitative shading/privacy/maintenance notes.
- Elevated foundation options: engineered helical piles (default), ground screws, concrete piers, timber posts on pads and bedrock anchors, with an elevated no-compaction section, root-protection notes and geotechnical/frost/permit warnings.
- A separate 1.2 m × 8 m pedestrian footbridge study with helical-pile/ground-screw abutments, clear-span/no-fill intent and conservation-authority/permit notes.
- Per-module tilted solar: default 39° due south (year-round 36–39°), winter ≈60° and summer ≈30° options, with a solar section diagram and PV label in the exterior/winter views.
- Solar tilt, azimuth and strategy persist in JSON; the plan shows the solar arrow and tilt/azimuth label.
- Interior room bands: sleeping, bathroom, kitchen, living, dining, workspace, storage and circulation.
- External insulation thickness, cladding type and colour, roof type (solar, green, biosolar, membrane).
- Material-intent choices for reuse, repairability, insulation, selective spray foam, connections, modular outdoor rooms, solar and green roofs.
- Structural warnings fields: large wall removals and conceptual cantilevers.
- Undo, redo and reset to preset.
- JSON import/export, plan/exterior/cutaway/porch/winter/wall-section SVG downloads, a Markdown summary and a ZIP with all available files.
- An illustrative hamlet preview with homesite, rotation, footprint, primary view and conflict prompts.

The exported JSON includes the `thermal`, `envelope` and `vegetation` objects and a derived `assessment` snapshot so warnings travel with the file. It is not authoritative; the editor recomputes the assessment on import and the reader must not treat the snapshot as a professional review. The editor does **not** calculate structure, fire, energy, acoustics, cost or code compliance. It does not produce construction documents, BIM, IFC or DXF. It does not write to the repository or upload a design. It does not add a customised home to the published community layout.

## Schema

Each concept or edited design is one JSON object:

```json
{
  "schema": "containers-hamlet-design/v1.0",
  "id": "woodland-retreat",
  "name": "Woodland Retreat",
  "primary_view_deg": 180,
  "modules": [
    {
      "id": "m1",
      "type": "40ft",
      "nominal": { "length_m": 12.192, "width_m": 2.438, "height_m": 2.896 },
      "position_m": [0, 0],
      "rotation_deg": 0,
      "insulation": { "thickness_mm": 150, "type": "wood-fibre or documented reclaimed board" },
      "cladding": { "type": "timber", "colour": "#8a6a4a" },
      "roof": { "type": "solar", "solar": true, "green": false },
      "structure": { "openings_reinforced": true, "wall_removal": "none", "cantilever_m": 0 },
      "openings": [
        {
          "id": "m1-n1", "face": "north", "type": "window",
          "position_m": 1.8, "width_m": 1.4, "height_m": 1.4, "sill_m": 0.9
        }
      ],
      "zones": [
        { "id": "m1-z1", "name": "Sleeping", "type": "sleeping", "start_m": 0, "end_m": 3.2 }
      ]
    }
  ],
  "connections": [],
  "porches": [
    {
      "id": "p1", "module": "m1", "face": "south",
      "start_m": 5.6, "length_m": 4.4, "depth_m": 3.05,
      "screened": true, "roof": true
    }
  ],
  "decks": [
    { "id": "d1", "porch": "p1", "projection_m": 1.2 }
  ],
  "trellises": [
    { "id": "t1", "module": "m1", "face": "west", "start_m": 0.3, "length_m": 1.8, "offset_m": 0.35, "height_m": 3.2 }
  ],
  "thermal": {
    "wall_insulation_strategy": "continuous external insulation with thermal breaks",
    "roof_insulation_mm": 250,
    "floor_insulation_mm": 200,
    "thermal_bridge_mitigation": "continuous external insulation and thermal breaks at openings and pile caps",
    "rainscreen_ventilation": true,
    "air_vapour_control": "exterior-insulated, vapour-open assembly; sealed interior air barrier (to be detailed)",
    "window_performance": "triple glazed, low-e, argon, thermally broken frames",
    "external_shading": "fixed overhang and deciduous planting",
    "heat_recovery_ventilation": true,
    "heating": "cold-climate air-source heat pump"
  },
  "site": { "homesite": "a", "rotation_deg": 0 },
  "provenance": { "authors": "Containers Hamlet contributors", "revision": "1.3.0" },
  "licence": { "code": "AGPL-3.0-or-later", "content": "CC BY-SA 4.0" },
  "assessment": { "authoritative": false, "items": [] },
  "material_intent": {
    "reclaimed_containers": true,
    "reused_timber": true,
    "replaceable_cladding": true,
    "continuous_external_insulation": true,
    "selective_spray_foam": false,
    "reversible_connections": true,
    "modular_porch": true,
    "solar_ready": true,
    "green_roof_investigated": false
  }
}
```

### Coordinates and rules

- Design coordinates are metres, x east and y south.
- A module is placed by its centre `position_m` and clockwise `rotation_deg`.
- Opening positions are measured along the face from the west end on north/south faces, and from the north end on east/west faces. They are the **centre** of the opening.
- Porches attach to a module face with `start_m`, `length_m` and `depth_m` measured from that face.
- Decks are an additional projection beyond a porch.
- Trellises are independent vertical planes with their own offset, length and height, clear of the rainscreen. They are not attached to the steel shell.
- `thermal` records conceptual envelope choices. `wall_insulation_strategy` and module insulation describe the wall; roof/floor thicknesses, bridge mitigation, rainscreen, air/vapour control, window performance, shading, HRV/ERV and heating are design-level. These are prompts for review, not energy or code claims.
- `envelope` is a versioned, design-level assembly (`version: "1.0"`, `assembly`, `layers`, `thermal_breaks`, `rainscreen`, `air_vapour_control`, `fire`, `fastening`, `penetrations`, `maintenance`). It is conceptual; the wall section is not a construction detail.
- `foundation` records the system, clearance, no-compaction intent, independent deck, frost/geotechnical notes and ground-disturbance assumptions.
- `solar` records `enabled`, `tilt_deg`, `azimuth_deg`, `season_mode`, mounting, source and review notes for each module.
- `vegetation` records independently supported systems with `type` (trellis, living-wall, edible-wall, privacy-screen), module/face/start/length/height, plant type, mature height, seasonal foliage, irrigation, maintenance, separation, support and notes.
- `material_intent` records conceptual choices (reclaimed containers, reused timber, replaceable cladding, continuous external insulation, selective spray foam, reversible connections, modular porch/deck, solar-ready, green-roof investigation). These are prompts for discussion, not verified environmental claims.
- A connection is an explicit rectangle with its own position, length, width and rotation. It is not assumed to follow a module edge. A glazed connection can carry `glazed`, `door_type` (`insulated-sliding`, `folding`, `garage` or `none`) and a conceptual `glazing_area_m2`.
- Room zones are conceptual bands along a module's length. They do not model partitions, door swings, fixtures or structural walls.
- The editor's invalid geometry rules cover duplicate ids, one-to-three modules, opening bounds and overlaps, zone bounds and overlaps, porch/deck bounds, module overlap, connector overlap and references. Engineering, accessibility and professional-review prompts do not block editing or JSON export; invalid geometry disables drawing exports.

## Source of truth

`data/design-lab.json` is the source for the ten gallery designs (nine homes and the common lodge). `tools/build.mjs` generates:

- `site/design-lab/views/<id>-plan.svg`
- `site/design-lab/views/<id>-exterior.svg`
- `site/design-lab/views/<id>-cutaway.svg`
- `site/design-lab/views/<id>-porch.svg`
- `site/design-lab/views/<id>-winter.svg`
- `site/design-lab/data/<id>.json`
- `site/design-lab/architecture/<id>/index.html`
- `site/design-lab/vegetation/index.html`
- `site/design-lab/ground/index.html`
- `site/design-lab/systems/foundation-<system>.svg`
- `site/design-lab/systems/footbridge.svg`
- `site/design-lab/systems/wall-<assembly>.svg`
- `site/design-lab/systems/vegetation-comparison.svg`
- `site/design-lab/compare/index.html`
- `site/design-lab/concepts.js`
- `site/design-lab/site-data.js`
- the gallery cards in `site/design-lab/index.html`

`site/js/design-schema.js` and `site/js/design-model.js` are shared by Node and the browser. The same model produces the plan, exterior, cutaway, porch/deck detail, winter study and wall section, so they cannot drift. Vegetation is part of the same geometry and seasonal rendering.

The existing `data/cabin-a.json` and `data/lodge.json` remain authoritative. The Design Lab does not edit or replace them.

## Cabin A adapter

`tools/lib/design-adapter.mjs` provides:

- `fromCabinA(spec)` — maps the authoritative Cabin A spec into a Design Lab design for preview. It returns `{ design, report }`.
- `toCabinAProposal(design, template)` — maps a compatible single-module design back to a **copy** of the Cabin A spec. It returns `{ spec, report }` and never writes.

Both functions report preserved and unmapped information. The adapter cannot represent fixtures, ramps, the trellis, all roof options, detailed room use or the full material passport. That information remains in the authoritative file and is listed in `report.unmapped`. A conversion that cannot be made is blocked rather than silently discarding data.

## v0.1 migration

`DesignSchema.migrateV01()` accepts the supplied `containers-hamlet-editor/v0.1` JSON. It:

- creates explicit one- or two-module geometry;
- places the v0.1 pair as adjacent modules;
- places the single v0.1 porch on the outer module of a pair;
- maps the old window fields;
- adds the missing height and sill as migration defaults;
- returns a report listing unmapped or defaulted information.

The v0.1 schema had no interior zones, decks, connections or explicit module positions. Those are reported, not silently invented as if they were original.

## Adding a concept

1. Add a complete object to `data/design-lab.json` using the schema above.
2. Set `group` to `One container`, `Two containers`, `Three containers` or `Common lodge`.
3. Set `editable: true` only when the concept is one of the three matured presets; otherwise `false`. The common lodge is a developed, non-editable concept.
4. Run `node tools/build.mjs`. The build stops on invalid geometry.
5. Run `node tools/check-design-lab.mjs` and `node tools/design-lab-check.mjs`.

The gallery uses the generated exterior and source JSON; each architectural page uses all five generated views. No hand-drawn image is substituted for geometry.

## Editing and export

Clicking a module on the plan is a pointer shortcut for selecting it; the module buttons and the opening/room selectors provide the keyboard route. Dragging modules on the plan is not implemented. The editor keeps history in memory. It does not use local storage, cookies or a backend. Closing the page loses unsaved work; download the JSON to reopen it later. The JSON import accepts v1.0 and v0.1.

The ZIP contains the JSON, plan, exterior, cutaway, porch/deck, winter, a Markdown summary and a notice. The summary includes a warning snapshot and provenance. The exported files remain concept material under CC BY-SA 4.0; the editor code is AGPL-3.0-or-later. No café photographs are bundled or redistributed.

## Architectural galleries and comparison

Every design has a five-view page under `site/design-lab/architecture/<id>/`. The page is a progressive enhancement: without JavaScript all five figures are visible; with JavaScript the same figures become a slideshow with visible Previous/Next and Show-all controls, Left/Right/Home/End keyboard support, a polite live status and no auto-advance. The plan, cutaway and porch detail are labelled **geometry-backed drawings**; the exterior and winter images are labelled **illustrative studies**.

`/design-lab/compare/` compares two concepts. It reports container count, nominal conditioned area (modules plus glazed hall), screened porch area, porch/deck area, approximate glazing area and ratio, envelope choices, accessibility notes, qualitative thermal strengths and risks, and structural/installation review items. It does not calculate cost, carbon, energy or code compliance. The all-concepts table and default pair remain available without JavaScript.

## Tests

```sh
node tools/check-design-lab.mjs      # 697 schema, geometry, envelope, vegetation, solar, foundation, five-view, gallery, comparison, licence and privacy checks
node tools/design-lab-check.mjs      # 114 browser checks: gallery, carousel keyboard, editor, envelope/vegetation/solar/foundation persistence, seasonal views, comparison, 320 px, axe
```

The main site checks and browser checks continue to run separately.

## Licensing

- Design Lab code, including the schema, model, editor and adapter: **AGPL-3.0-or-later**. Full text: `site/design-lab/LICENSE.txt`.
- Original Design Lab documentation, diagrams, concept data and generated views: **CC BY-SA 4.0**. See `site/design-lab/CONTENT-LICENSE.md`.
- Core Containers Hamlet code: **MIT**; core original content: **CC BY 4.0**. Those licences do not extend to the Design Lab files.
- Third-party notices: `site/design-lab/THIRD-PARTY-NOTICES.md`.
- No café photographs are bundled or published. Redistribution rights were not confirmed; the lodge is an original interpretation of the written brief.

The existing Cabin A and lodge data remain under their existing provenance. The adapter does not relicense or overwrite them.

## Known limitations

- Six homes and the common lodge are inspiration-only.
- Envelope, planting, irrigation, fire, moisture, foundation and bridge performance are qualitative; no hygrothermal, geotechnical or structural calculation is performed.
- No visual drag manipulation; numeric and keyboard controls are the editable route.
- No full 3D walkthrough, BIM, IFC or DXF.
- No structural, energy, fire, acoustic, cost or code calculation.
- Room zones do not model partitions or fixtures.
- The hamlet preview is illustrative and does not add a design to the community.
- No test with screen readers or disabled people yet.
- The container modifications still need professional engineering review.
EOF