# Data model and generator

Every drawing, model and table on the site comes from three JSON files:

| File | Describes |
|---|---|
| `data/cabin-a.json` | Cabin A: one container module |
| `data/lodge.json` | Common lodge: two container modules and a timber hall |
| `data/site.json` | Terrain, water, wetland, buffers, lanes, parking, crane limits and building positions |

Edit these, then run:

```sh
node tools/build.mjs          # regenerate drawings, models, data copies and page fragments
node tools/check.mjs          # static checks (no install needed)
npm install && node tools/browser-check.mjs   # browser and accessibility checks
```

The build stops with an error if the data describes something impossible, or if it breaks a site rule. Examples: two solids that intersect, an opening that crosses a partition, a cabin inside the shoreline setback, a crane pad in the wetland buffer.

## Building coordinates

Metres. `x` runs east along the containers, `y` runs south across them, `z` is up. The origin is the north-west bottom corner of the first container's steel shell. So the steel spans `x` 0 to 12.192 m and the first module spans `y` 0 to 2.438 m. The finished floor sits at `z` = floor structure + floor finish (0.18 m).

### Main fields

- **`module`**: container dimensions. External and internal sizes set the steel thickness of walls, ends, floor and roof.
- **`bays`**: modules side by side from north to south. A `container` bay is one module. A `hall` bay is a timber-framed space with `width_m`, `roof_underside_m` and `roof_thickness_m`, and it must sit between two containers. Clerestory walls are generated wherever a hall rises above its neighbours.
- **`envelope`**: lining, finish and ceiling thicknesses. `wall_layers`, `roof_layers` and `floor_layers` run from the structure outward. A layer with `material: "cavity"` takes up space but is left empty.
- **`rooms`**: listed in order from west to east within a bay. `end_m` is the room's east boundary. `boundary: "partition"` builds a partition wall there, with an optional `door` (`from_m`/`to_m` measured from the bay's north edge). The last room in a bay runs to the east wall. Clear sizes and areas are computed inside the lining.
- **`fixtures`**: placed relative to a room corner (`nw`, `ne`, `sw`, `se`) with `at: [dx, dy]`, `size: [x, y, height]` and an optional `elevation_m`.
- **`openings`**: `bay`, `face` (`north`, `south`, `east`, `west`), `type` (`window`, `door`, `sliding-door`, `opening`), `from_m`/`to_m` along the face, and `sill_m`/`head_m` above the finished floor. Along north and south faces, positions are measured from the west end. Along east and west faces they are measured from the bay's north edge. Doors can set `swing` (`in`/`out`) and `hinge` (`east`, `west`, `north`, `south` or `both` for a pair).
- **`porches`**: `side`, `from_m`, `length_m` and `depth_m`, plus deck, post and roof sizes, `screened`, and an optional `screen_door`. Each porch stands on its own piles.
- **`ramps`**: start from a porch `side`. The run length is computed as floor height above grade × `slope_ratio`, so changing the floor height or the foundation clearance changes the ramp.
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

- **`terrain`**: lake level, the ground rise from the shore, and Gaussian `hill`/`hollow` features. Contours are traced from this surface, and `max_building_slope_pct` is checked at each building's centre and corners.
- **`lake.shoreline`**, **`wetland.polygon`**, **`parcel.polygon`**: the parcel area is computed from its polygon.
- **`no_build`**: `shoreline_setback_m` and `wetland_buffer_m`. Buffers are drawn as true distance isolines and enforced for buildings, porches, ramps, trellises, lanes, parking and crane pads.
- **`circulation`**: `lanes` (polylines with widths), `parking`, `trails` (not checked against buffers; see the note in the file) and `max_entrance_to_lane_m`. Footpaths from each ramp foot to the nearest lane are generated.
- **`crane.max_reach_m`**: checked from each building's `crane_pad` to its centre.
- **`buildings`**: `model` (which building file), `x_m`/`y_m` (centre of the main volume) and `rotation_deg` (clockwise).

### Example: test a bigger shoreline setback

Set `"shoreline_setback_m": 60` and run the build. It stops and lists every building and lane now inside the setback. Move them (or reduce the number) and the map, buffers and siting table regenerate.

## Outputs

| Output | From |
|---|---|
| `models/<id>/floor-plan.svg` | horizontal cut 1.2 m above the floor |
| `models/<id>/elevations.svg` | orthographic projection on four sides |
| `models/<id>/section.svg` | vertical cut at `section_x_m`, plus the wall build-up |
| `models/<id>/axonometric.svg`, `cutaway.svg` | isometric view, exterior and cut |
| `models/<id>/<id>.obj` + `.mtl` | all solids except room floor zones; Y up, +X east, +Z south |
| `site/assets/site-plan.svg` | site data and analysis |
| `site/data/site-analysis.json` | computed siting checks |
| `site/js/data.js` | geometry data for the in-browser explorer |
| `site/index.html` fragments | facts, room tables, siting table, passports, reviews, downloads |

The browser explorer runs the same `model.js` and `render.js` as the generator, so it cannot drift from the drawings.
