# Data model and generator

Every drawing, model, map, view diagram and table on the site comes from three JSON files:

| File | Describes |
|---|---|
| `data/cabin-a.json` | Cabin A: one container module, screened porch and graded trail |
| `data/cabin-pair.json` | Two-container explorer variant used by Cabin B and D; no site-plan change |
| `data/lodge.json` | Common lodge: two container modules and a timber hall |
| `data/site.json` | Fictional terrain, water, wetland, drainage, woodland, rock, clearings, access, views and building placements |

Edit these, then run:

```sh
node tools/build.mjs          # regenerate drawings, models, maps, view diagrams, data copies and page fragments
node tools/check.mjs          # static checks (no install needed)
npm install && node tools/browser-check.mjs   # browser and accessibility checks
```

The build stops with an error if the data describes something impossible, or if it breaks a site rule. Examples: two solids that intersect, an opening that crosses a partition, a home inside the shoreline setback, a crane mat on a rock outcrop, a building bench requiring more than 1.6 m of cut or fill, or a walking path through the wet meadow.

## Building coordinates

Metres. `x` runs east along the containers, `y` runs south across them, `z` is up. The origin is the north-west bottom corner of the first container's steel shell. So the steel spans `x` 0 to 12.192 m and the first module spans `y` 0 to 2.438 m. The finished floor sits at `z` = floor structure + floor finish (0.18 m).

### Main fields

- **`module`**: container dimensions. External and internal sizes set the steel thickness of walls, ends, floor and roof.
- **`bays`**: modules side by side from north to south. A `container` bay is one module. A `hall` bay is a timber-framed space with `width_m`, `roof_underside_m` and `roof_thickness_m`, and it must sit between two containers. Clerestory walls are generated wherever a hall rises above its neighbours.
- **`envelope`**: lining, finish and ceiling thicknesses. `wall_layers`, `roof_layers` and `floor_layers` run from the structure outward. A layer with `material: "cavity"` takes up space but is left empty.
- **`rooms`**: listed in order from west to east within a bay. `end_m` is the room's east boundary. `boundary: "partition"` builds a partition wall there, with an optional `door` (`from_m`/`to_m` measured from the bay's north edge). The last room in a bay runs to the east wall. Clear sizes and areas are computed inside the lining.
- **`fixtures`**: placed relative to a room corner (`nw`, `ne`, `sw`, `se`) with `at: [dx, dy]`, `size: [x, y, height]` and an optional `elevation_m`.
- **`openings`**: `bay`, `face` (`north`, `south`, `east`, `west`), `type` (`window`, `door`, `sliding-door`, `opening`), `from_m`/`to_m` along the face, and `sill_m`/`head_m` above the finished floor. Along north and south faces, positions are measured from the west end. Along east and west faces they are measured from the bay's north edge. Doors can set `swing` (`in`/`out`) and `hinge` (`east`, `west`, `north`, `south` or `both` for a pair).
- **`porches`**: `side`, `from_m`, `length_m` and `depth_m`, plus deck, post and roof sizes, `screened`, and an optional `screen_door`. Each porch stands on its own piles. The model stores placed porch bounds as `x0/x1/y0/y1`.
- **`cabin-pair.json`**: a browser-explorer-only two-container variant. `site/js/data.js` maps `b` and `d` to it; the landscape plan still uses the single-container site footprints, so this is not a site-plan approval.
- **`ramps`**: start from a porch `side`. The run length is computed as floor height above grade × `slope_ratio`; `surface: "gravel"` presents the section as a graded compacted-gravel trail with landings rather than a timber walkway. The run length still needs accessibility, drainage and geotechnical review.
- **`trellis`**: a free-standing trellis on one face at `offset_m` from the rainscreen.
- **`roof`**: named `options`. Each lists `pv_bays` and `green_bays`. PV over a green roof is raised above the planting automatically, and the module count is fitted to the roof.
- **`material_passport`**: one entry per component. `material_key` links the entry to modelled solids for the volume column.
- **`reviews_required`**, **`provenance`**, **`design_targets`**: shown on the page and used in checks.

### Example: add a window

```json
{ "id": "W7", "name": "Second north bedroom window", "bay": "main", "face": "north",
  "type": "window", "from_m": 0.6, "to_m": 1.6, "sill_m": 1.1, "head_m": 2.1 }
```

Run `node tools/build.mjs`. The plan, the elevations, the 3D model and the explorer all gain the window, with its reinforcement frame in the steel. If it overlapped another opening, crossed a partition or crowded a corner post, the build would stop and say why.

## Site coordinates

Metres, with `x` east and `y` south from the north-west corner of the map. The site plan's SVG `viewBox` is in metres, so a vector editor shows real distances.

- **`map`**: `width_m` and `height_m`.
- **`terrain`**: `lake_level_m`, `rise_from_shore_per_m`, Gaussian `hill`/`hollow`/`ridge` features, and seeded `roughness` components. The seed is recorded so every generated surface is reproducible. `contour_interval_m`, `max_building_slope_pct` and `building_pads` control contours and siting checks.
- **`building_pads`**: an illustrative levelled bench under each building, blended into the natural surface. `radius_m`, `blend_m` and `max_cut_fill_m`. This is a design assumption, not permission to excavate.
- **`lake.shoreline`**, **`wetland.polygon`**, **`parcel.polygon`**: the shoreline is a polyline; the parcel includes the water's edge. The parcel area is computed from its polygon and must be about 15 acres.
- **`drainage`**: seasonal channels with a width. Buildings must stay outside `no_build.drainage_buffer_m`; walking paths may cross only where a crossing is recorded.
- **`woodland.stands`**: indicative stand polygons with `type` (`conifer`, `mixed`, `deciduous`) and `conifer_share`. Used for map tint, tree species and the view canopy observation.
- **`rocks`**: outcrop polygons with an illustrative buffer.
- **`clearings`**: shared natural openings. Each building also has a generated `clearing_radius_m` around it.
- **`no_build`**: shoreline, wetland, drainage and rock buffers, plus `applies_to`. Buffers are drawn as true distance isolines or buffer corridors and enforced for buildings, porches, ramps, trellises, lanes, parking and crane pads. Lanes and paths stay out of the shoreline and wetland buffers; a track may cross a seasonal drainage channel on a recorded culvert. They are **not** legal setbacks.
- **`circulation`**: `entrance`, `lanes` (polylines with widths and kinds), `parking`, `dropoff`, `trails`, and `max_entrance_to_lane_m`. Footpaths and the emergency track are checked against the buffers and building footprints.
- **`crane.max_reach_m`**: checked from each building's `crane_pad` to its centre. The pad is treated as temporary matting, not a permanent road.
- **`buildings`**: `id`, `name`, `short_name`, `use`, `model`, `x_m`/`y_m` (centre of the main volume), `rotation_deg` (clockwise), `crane_pad`, `clearing_radius_m`, `clearing_note`, `character`, `orientation`, `views` and `design_note`. An optional `design_lab_home` records an illustrative architectural concept for the site; it does not change the authoritative model or the published layout.
- **`landmarks`**: named points used as view targets (`north-ridge`, `south-knoll`, `east-rock`, glades).
- **`trees`**: deterministic scatter count, seed, clearance and conifer/deciduous mix. Indicative canopy only, not a tree survey.

### Views

Each building's `views.main` names a `target` (`lake`, `wetland`, `landmark` or `clearing`) and a declared `azimuth_deg`. The analysis:

1. Derives the principal facade from the first screened porch and the building's rotation.
2. Finds the nearest point on the named target.
3. Computes the bearing and distance from the building centre.
4. Checks the bearing against the principal facade within `55°`.
5. Samples three rays through a ±22° cone and reports the share of woodland, conifer and open ground, plus a qualitative description. This is an observation, not a privacy score or sightline study.
6. Lists neighbouring buildings inside the 120 m view cone with their approximate bearings, so the page can say what may be glimpsed.

`views.secondary`, `views.nearby`, `views.path` and `views.winter` are written descriptions. The analysis checks that a winter note exists.

### Example: move and rotate a home

Change `x_m`, `y_m` or `rotation_deg` in a `buildings` entry. The map, porch and ramp footprints, paths, siting table, view diagram and home brief all follow. The building's architectural definition does not change.

### Example: add a different housing model

1. Create `data/my-cabin.json` using the same schema.
2. Add it to `BUILDINGS` and `DATA_FILES` in `tools/build.mjs`.
3. Reference it from a homesite: `"model": "my-cabin"`.
4. Run the build. The drawings, OBJ, MTL, explorer data and downloads are generated from the new file.

The landscape system does not assume a single footprint. The current page uses Cabin A for all six homes as a placeholder and says so.

## Outputs

| Output | From |
|---|---|
| `models/<id>/floor-plan.svg` | horizontal cut 1.2 m above the floor |
| `models/<id>/elevations.svg` | orthographic projection on four sides |
| `models/<id>/section.svg` | vertical cut at `section_x_m`, plus the wall build-up |
| `models/<id>/axonometric.svg`, `cutaway.svg` | isometric view, exterior and cut |
| `models/<id>/<id>.obj` + `.mtl` | all solids except room floor zones; Y up, +X east, +Z south |
| `site/assets/site-plan.svg` | site data, terrain, access, views and analysis |
| `site/assets/views/<id>.svg` | plan-centred view diagram for each home and the lodge |
| `site/assets/lake-impression.svg` | original concept illustration |
| `site/data/site-analysis.json` | computed siting, access, view and terrain observations |
| `site/data/terrain.json` | seeded 5 m elevation grid and hash |
| `site/data/homes.json` | home briefs, placements, orientations and computed observations |
| `site/js/data.js` | compact geometry and site data for the in-browser explorer and map |
| `site/index.html` fragments | facts, home briefs, map, tables, passports, reviews, downloads |

The browser explorer runs the same `model.js` and `render.js` as the generator, so it cannot drift from the drawings.

## Reproducibility

`terrain.seed` fixes the roughness phases. `trees.seed` fixes the tree scatter. The build writes an FNV hash of the 5 m elevation grid into `site/data/site-analysis.json` and `site/data/terrain.json`. The static checks rebuild the grid and compare it with the hash, so an accidental change to the surface is visible in review.


## Interior spatial schema

`containers-hamlet-interior/v1` is an optional design-level `interior` object.
It adds room polygons, partitions, interior doors, fixture references, circulation,
clearances and service areas in module-local metres. The architectural schema
remains v2.0 so existing imports stay valid.

Room bands (`start_m`/`end_m`) remain the simple editing representation and are
not overwritten. `DesignInterior.fromZones()` converts bands to provisional room
rectangles and marks them `inferred-from-zone`; it does not invent partitions,
doors, fixtures or clearances. Authored interiors are marked `status: "authored"`.
Ids are stable and reference their module, level and containing room.

The model distinguishes `invalid-geometry`, `unresolved-design` and
`review-required`. Accessibility classification is derived from recorded
interior evidence and cannot be overridden by a manually supplied
`fully-accessible-single-storey` string. See
[`interior-spatial-model.md`](interior-spatial-model.md).

## Design Lab illustration schemas

Two additive schemas sit beside the architectural design model:

- **`containers-hamlet-illustration/v1`** — presentation only: design id, view,
  camera height/lens, style, season, time, weather, people and material policy.
- **`containers-hamlet-scene/v1`** — a normalized scene derived from the design:
  design hash, building facts, required module elements, openings, rooms,
  outdoor spaces, materials, site/view, camera, constraints, capabilities,
  unresolved matters, generated prompt, negative prompt and description.

The scene does not replace the design and does not duplicate the whole geometry.
It references source module ids and records the facts needed for outputs. The
editor compares `designHash` and `presentationHash` to mark outputs current or
outdated. `site/js/design-illustration.js` implements the schemas,
`validateScene`, `promptFor`, `negativeFor`, `descriptionFor`, `artifactPlan` and
`manifest`.

## Design Lab schema v2.0

Phase 2 adds explicit vertical geometry and an architectural review model to the
separate Design Lab schema. It is documented in [`design-lab.md`](design-lab.md),
[`stacked-containers.md`](stacked-containers.md) and
[`structural-review.md`](structural-review.md), and implemented in
`site/js/design-schema.js` / `site/js/design-model.js`.

- **`containers-hamlet-design/v2.0`** supports one to three explicit module
  objects. Each module has a stable id, type, nominal dimensions, `position_m`
  (x, y), `elevation_m` (base above grade), `storey` (0 or 1), rotation,
  insulation, cladding, roof, openings, zones, structure and a `support` intent.
- A design has generated `levels` (storey, name, elevation, module ids),
  `maxOccupiedStoreys` (1 or 2), `roof_form`, `review`, `access` and
  `architecture` records.
- `review` holds the structural, accessibility, energy and fire status plus a
  per-concern register. `professionally-verified` requires a documented,
  attributable assessment.
- `access` holds the step-free entrance, ground-floor functions, entrance width
  and threshold, circulation target, bathroom/kitchen adaptability, stair and
  lift-reserve data, path connection and a classification.
- `roof_form` is independent of module geometry: gable, shed, butterfly, flat,
  canopy, green or solar-ready, with pitch, overhang and drainage/snow/wind notes.
- Porches, decks, trellises, vegetation and timber/glazed connectors remain
  separate components. A porch or deck below an upper module is now allowed and
  flagged for headroom, drainage, fire separation and support review.
- `containers-hamlet-design/v1.0` is migrated to v2.0 by placing every module on
  storey 0 at the recorded foundation clearance. The migration reports that
  vertical geometry, support evidence and review evidence did not exist.
- `containers-hamlet-editor/v0.1` (the supplied prototype) is migrated to v2.0
  with a report of defaulted or unmapped information.
- `tools/lib/design-adapter.mjs` maps Cabin A into the Design Lab schema and a
  compatible design back to a Cabin A proposal. It never writes
  `data/cabin-a.json` and reports everything it cannot represent.
- The Design Lab does not replace the authoritative Cabin A or lodge data. Its
  generated views and downloads are copies.

### Design Lab coordinates

X is east, Y south, Z up, in metres. `position_m` is the module centre in the
model plane; `elevation_m` is the module base above finished exterior grade. A
rotation is around the vertical axis. Site placement is a separate transformation.
The foundation clearance is a design-level value; a module's explicit elevation
must be consistent with it.

### Design Lab outputs

For each concept, the build writes:

| Output | Description |
| --- | --- |
| `site/design-lab/views/<id>-plan.svg` | Combined plan |
| `site/design-lab/views/<id>-plan-ground.svg` | Ground-floor plan |
| `site/design-lab/views/<id>-plan-upper.svg` | Upper-floor plan, when the home has two storeys |
| `site/design-lab/views/<id>-elevation-{north,south,east,west}.svg` | Four elevations |
| `site/design-lab/views/<id>-section.svg` | Building section |
| `site/design-lab/views/<id>-exploded.svg` | Exploded levels |
| `site/design-lab/views/<id>-solar-{summer,winter}.svg` | Solar studies |
| `site/design-lab/views/<id>-exterior.svg`, `cutaway.svg`, `porch.svg`, `winter.svg` | Illustrative studies |
| `site/design-lab/data/<id>.json` | Downloadable source |
| `site/design-lab/architecture/<id>/index.html` | Gallery with plans, elevations, section, review and access |

All views derive from one design object. The plans, elevations, section and
exploded view cannot drift from one another. The wall section is generated from
`envelope`; solar studies use the roof geometry and glazing. Each module carries
a tilted `solar` configuration (tilt, azimuth, season strategy); the
exterior/winter views and plan use it, and the solar section is generated from it.

### Adding or changing a Design Lab concept

Edit `data/design-lab.json`, then run `node tools/build.mjs`. A schema error, an
invalid 3D collision, a three-storey residence, an opening outside its face or a
porch beyond its module stops the build with a specific message. Generated files
must be committed; `node tools/build.mjs --check` verifies them.
