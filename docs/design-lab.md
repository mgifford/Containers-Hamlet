# Container Home Design Lab

The Design Lab is a container-first design gallery and editor at `/design-lab/`. It is a separate, explicitly scoped part of Containers Hamlet:

- **Gallery:** `/design-lab/` — six selected hamlet residences
- **Concept archive:** `/design-lab/concepts/` — nine legacy concepts, the common lodge and four arrangement studies
- **Concept visualisations:** `/design-lab/visualisations/` — three v1 AI-assisted placeholders with explicit limits and a version 2 checklist
- **Residences comparison:** `/design-lab/residences/` — all six homes, sortable/filterable table, diversity heuristic, structural/accessibility summaries and stacked-versus-single-storey translations
- **Architecture pages:** `/design-lab/architecture/<id>/` — combined and floor-specific plans, interior plans, four elevations, section, exploded levels, isometric, solar studies, seasonal pair, approximate exposure and envelope section
- **Editor:** `/design-lab/editor/`
- **Vegetation guide:** `/design-lab/vegetation/` — four systems, evidence and sources
- **Ground guide:** `/design-lab/ground/` — Ontario foundation options, no-compaction and a footbridge concept
- **Patterns guide:** `/design-lab/patterns/` — container configurations, paint, doors as shelter and security
- **Fire guide:** `/design-lab/fire/` — steel-hull limits, defensible space, ember-resistant detailing, access and water
- **Arrangement studies:** stacked, cantilever, L/courtyard and creek-spanning cards, clearly marked as studies
- **Two-storey study:** `/design-lab/two-storey/` — three stacking options with structural, fire, egress and hillside questions
- **Resilience:** `/design-lab/resilience/` — fire beyond one house, heat, flood, drought, power and social capacity
- **Water:** `/design-lab/water/` — rainwater, greywater, blackwater, fire reserve and an illustrative calculator
- **Pattern Language Explorer:** `/design-lab/pattern-language/` — 20 source-verified patterns with original hamlet interpretations, related-pattern navigation, evidence states and limitations
- **Comparison:** `/design-lab/compare/`
- **Schema:** `containers-hamlet-design/v2.0` (v1.0 is migrated explicitly)
- **Legacy import:** `containers-hamlet-editor/v0.1` (the supplied starter schema)

It is not a generic home builder. The container is the core of every design; timber, glass, screens, decks, roofs and planting are supporting layers.

## Pattern Language Explorer

The Design Lab now includes a curated [`Pattern Language Explorer`](pattern-language.md) at `/design-lab/pattern-language/`. It references 20 pattern numbers/titles from *A Pattern Language*, with original summaries, hamlet interpretations, related-pattern links, evidence states and limitations. It is not a code, a scorecard or a replacement for professional assessment. Site-plan highlighting, the baseline-preserving scenario comparison at `/design-lab/scenarios/` and an initial room-level pattern lens on three architecture pages are included; resident evaluation and the remaining homes’ annotations are later phases.

## Phase 3: interiors, two-storey homes and accessible demonstrations

The selected set has **three single-storey and three two-storey homes**.
Woodland Cottage, Courtyard Residence and Accessible Garden Home are
single-storey; Offset Stack, Cross-Stacked Retreat and Solar Studio Stack are
two-storey. Historical two-storey JSON imports are still supported.

**Woodland Cottage** and **Accessible Garden Home** are the two whole-home
wheelchair-accessible demonstrations. Their interiors are authored, with
accessible bathrooms and turning circles. Offset Stack, Courtyard Residence,
Cross-Stacked Retreat and Solar Studio Stack use provisional interiors inferred
from room bands; their bathrooms are ordinary concept bathrooms and are not
failed for lacking accessible clearances.

The editor has a **Detailed interior plan** mode with room polygons, partitions,
interior doors, fixtures and validation. Two-storey homes generate ground and
upper interior plans separately. See
[`interior-spatial-model.md`](interior-spatial-model.md) and
[`phase-3-audit.md`](phase-3-audit.md).

The site comparison page reconciles the selected footprints and entrances with
the older site models and flags conflicts. The site's parcel, clearing and path
geometry is not silently rewritten.

## Illustration pipeline

The Design Lab now has a reproducible illustration pipeline. It generates a
normalized scene specification from the design model, then deterministic
container schematics, a roof plan, exterior/approach/site reference views, a
structured description, an image-generation prompt, a negative prompt and a
package manifest with hashes. The editor's **Illustrate** section controls
viewpoint, camera, style, season, time, weather, people and material policy,
without changing the building geometry.

Start with [`illustration-pipeline.md`](illustration-pipeline.md) and the
[`audit`](illustration-pipeline-audit.md). The six-home packages are published at
`/design-lab/illustration/`. Interior perspective is not claimed because the
model records longitudinal room zones, not partitions and camera geometry.

## Cabin services studies

The cabin services are documented separately from the drawing editor:

- [`passive-ventilation.md`](passive-ventilation.md) — Cabin A end-to-end ventilation, filters, insect/weather exclusion and seasonal modes.
- [`wood-heat-thermal-mass.md`](wood-heat-thermal-mass.md) — Cabin A stove, hearth, masonry heat wall, air gap, OAK and clearance caveats.
- [`electrical-solar-battery.md`](electrical-solar-battery.md) — hybrid AC/DC service, interior EMT routing, PV entry, battery placement and grounding.
- [`lighting-cameras-security.md`](lighting-cameras-security.md) — warm LED lighting, timers, local-only cameras and blind spots.
- [`multi-container-services.md`](multi-container-services.md) — two-container pairs and the Common Lodge.

These are Design Lab studies. They do not change `data/cabin-a.json`,
`data/cabin-pair.json` or `data/lodge.json`, and they are not construction
documents.

## What the editor does

- One, two or three container modules.
- 20-foot and 40-foot high-cube nominal sizes.
- Independent module position and rotation.
- **One or two occupied storeys, never three.** Each module has an explicit
  storey and base elevation above grade. The editor can stack above a ground
  module, align an upper module, offset it, rotate it or create a perpendicular
  stack.
- **Storey/level selector** with all-levels, ground and upper views. When one
  level is edited, the other level remains visible as a muted outline.
- **Support inspection** that reports geometric bearing overlap, unsupported
  area and declared support intent. It does not calculate capacity.
- **Roof form** independent of module geometry: gable, shed, butterfly, flat,
  canopy, green-roof concept and solar-ready.
- **Accessibility and vertical circulation** controls: step-free entrance,
  entrance width/threshold, circulation target, ground-floor essential
  functions and bedroom, adaptable bathroom/kitchen, stair data and lift reserve.
- Arrangement presets: single, parallel, adjacent, L-shaped and three-module courtyard.
- Windows, doors, sliding doors and open passages, with face, centre position, width, height and sill.
- Screened or covered porches, decks beyond porches, independent climbing-plant trellises, and separate timber connectors.
- A generated architectural set for every design: combined plan, ground plan,
  upper plan when present, four elevations, section, exploded levels, isometric
  exterior, cutaway, porch detail, winter view and summer/winter solar studies.
- Thermal-envelope choices: roof and floor insulation, thermal-bridge mitigation, ventilated rainscreen, air/vapour strategy, window performance, external shading, HRV/ERV and a cold-climate heat pump.
- Versioned exterior envelope assemblies: rigid board, mineral wool, wood fibre, exterior closed-cell spray foam and hybrid, with an explanatory wall section and warnings.
- Vegetation systems: freestanding trellis, modular living wall, edible planter wall and evergreen privacy screen; each records plant type, mature height, seasonal foliage, irrigation, maintenance, separation and support.
- Summer/winter view control, approximate window exposure by world-facing side, and qualitative shading/privacy/maintenance notes.
- Elevated foundation options: engineered helical piles (default), ground screws, concrete piers, timber posts on pads and bedrock anchors, with an elevated no-compaction section, root-protection notes and geotechnical/frost/permit warnings.
- A paint palette and entry-shelter control with a Micro Studio example using reused-door shutters.
- **Direct plan manipulation**: click/tap or Tab to a module, drag it with a pointer, or use arrow keys (Shift = 0.5 m), Enter/Space to select and R/Shift+R to rotate. Selected modules have a visible outline and an announced position.
- A separate 1.2 m × 8 m pedestrian footbridge study with helical-pile/ground-screw abutments, clear-span/no-fill intent and conservation-authority/permit notes.
- Per-module tilted solar: default 39° due south (year-round 36–39°), winter ≈60° and summer ≈30° options, with a solar section diagram and PV label in the exterior/winter views.
- Solar tilt, azimuth and strategy persist in JSON; the plan shows the solar arrow and tilt/azimuth label.
- Interior room bands: sleeping, bathroom, kitchen, living, dining, workspace, storage and circulation.
- External insulation thickness, cladding type and colour, roof type (solar, green, membrane).
- Material-intent choices for reuse, repairability, insulation, selective spray foam, connections, modular outdoor rooms, solar and green roofs.
- Structural warnings fields: large wall removals and conceptual cantilevers.
- Undo, redo and reset to preset.
- JSON import/export, plan/ground/upper/elevation/section/exploded/solar/exterior/cutaway/porch/winter/wall-section SVG downloads, a Markdown summary and a ZIP with all available files.
- An illustrative hamlet preview with homesite, rotation, footprint, storey count, ground coverage, height, primary view and conflict prompts, plus an axonometric massing panel.
- Keyboard level controls on the plan: Page Up (upper), Page Down (ground) and A (all levels).

The exported JSON includes the `thermal`, `envelope` and `vegetation` objects and a derived `assessment` snapshot so warnings travel with the file. It is not authoritative; the editor recomputes the assessment on import and the reader must not treat the snapshot as a professional review. The editor does **not** calculate structure, fire, energy, acoustics, cost or code compliance. It does not produce construction documents, BIM, IFC or DXF. It does not write to the repository or upload a design. It does not add a customised home to the published community layout.

## Schema

Each concept or edited design is one JSON object:

```json
{
  "schema": "containers-hamlet-design/v2.0",
  "id": "woodland-retreat",
  "name": "Woodland Retreat",
  "primary_view_deg": 180,
  "modules": [
    {
      "id": "m1",
      "type": "40ft",
      "nominal": { "length_m": 12.192, "width_m": 2.438, "height_m": 2.896 },
      "position_m": [0, 0],
      "elevation_m": 0.6,
      "rotation_deg": 0,
      "storey": 0,
      "support": { "type": "ground", "references": [], "verified": false },
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

`data/design-lab.json` is the source for the sixteen gallery concepts (nine legacy concepts, six selected residences and the common lodge). `tools/build.mjs` generates:

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

Clicking a module on the plan is a pointer shortcut for selecting it; the module buttons, opening/room selectors and keyboard arrow keys provide the keyboard route. Dragging a module on the plan is a pointer shortcut, not the only way to move it. The editor keeps history in memory. It does not use local storage, cookies or a backend. Closing the page loses unsaved work; download the JSON to reopen it later. The JSON import accepts v2.0, v1.0 and v0.1 through explicit migrations.

The ZIP contains the JSON, plan, exterior, cutaway, porch/deck, winter, a Markdown summary and a notice. The summary includes a warning snapshot and provenance. The exported files remain concept material under CC BY-SA 4.0; the editor code is AGPL-3.0-or-later. No café photographs are bundled or redistributed.

## Architectural galleries and comparison

Every design has an architectural page under `site/design-lab/architecture/<id>/` with 12–15 views: combined, ground and (when present) upper plans, four elevations, building section, exploded levels, isometric exterior, cutaway, porch detail, winter view and summer/winter solar studies. The page is a progressive enhancement: without JavaScript every figure is visible; with JavaScript the same figures become a slideshow with visible Previous/Next and Show-all controls, Left/Right/Home/End keyboard support, a polite live status and no auto-advance. Plans, elevations, section, exploded levels and cutaway are labelled **geometry-backed drawings**; exterior, porch, winter and solar studies are labelled **illustrative or explanatory studies**. The page also shows the levels/support table, accessibility record and structural review register.

`/design-lab/compare/` compares two concepts. It reports container count, nominal conditioned area (modules plus glazed hall), screened porch area, porch/deck area, approximate glazing area and ratio, envelope choices, accessibility notes, qualitative thermal strengths and risks, and structural/installation review items. It does not calculate cost, carbon, energy or code compliance. The all-concepts table and default pair remain available without JavaScript.

## Tests

```sh
node tools/check-design-lab.mjs      # 2,533 schema, geometry, interior, illustration, pattern-language and comparison checks
node tools/design-lab-check.mjs      # 126 browser checks: gallery, carousel keyboard, editor, envelope/vegetation/solar/foundation persistence, seasonal views, comparison, 320 px, axe
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