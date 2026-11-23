# Interior spatial model

**Schema:** `containers-hamlet-interior/v1`  
**Status:** Concept model for editing, drawings and prompts. Not a construction
model, code check or accessibility certificate.

## What it adds

The original Design Lab rooms are **longitudinal bands**: a start and end
position along a container, with a room type. They are useful for massing and a
simple programme, but they cannot represent a real bathroom, a kitchen run, a
door swing or a turning circle.

The interior model adds:

- room polygons in module-local metres;
- interior partitions;
- interior doors and the rooms they connect;
- references to exterior windows/openings;
- bathroom and kitchen fixtures;
- circulation routes;
- clearance and turning spaces;
- service/mechanical zones;
- provenance and accessibility assessment records.

The room bands remain in the data and remain editable in simple mode. The
interior model is additive and optional.

## Coordinate system

Interior coordinates are **module-local metres**, not world metres and not
container-relative percentage positions.

- origin: module centre at finished floor level;
- **x**: along the container length;
- **y**: across the container width;
- polygons: arrays of `[x, y]` points, counter-clockwise or clockwise;
- doors/partitions: points in the same module-local system;
- fixtures: centre position plus width/depth and rotation.

The clear envelope is derived from the nominal module dimensions minus a
documented lining allowance:

```
clear length = nominal length - 2 × 0.07 m
clear width  = nominal width  - 2 × 0.07 m
```

The allowance is conceptual. It is not a substitute for the actual wall, floor,
ceiling, service and finish build-up. A real design must use the selected
assembly and verified dimensions.

## Structure

```json
{
  "interior": {
    "schema": "containers-hamlet-interior/v1",
    "status": "authored | provisional",
    "clearances": {
      "circulation_width_m": 0.95,
      "turning_circle_m": 1.5,
      "door_width_m": 0.86
    },
    "rooms": [
      {
        "id": "b-bath",
        "name": "Bathroom",
        "type": "bathroom",
        "module": "m1",
        "level": 0,
        "polygon": [[1.1, -1.149], [3.4, -1.149], [3.4, 1.149], [1.1, 1.149]],
        "provenance": "authored",
        "sourceZoneId": "m1-z3",
        "openingIds": [],
        "accessibility": { "assessment": "not-verified", "notes": "" }
      }
    ],
    "partitions": [
      { "id": "b-p2", "module": "m1", "from": [1.1, -1.149], "to": [1.1, 1.149], "thickness_m": 0.1, "type": "partition" }
    ],
    "doors": [
      { "id": "b-d2", "partition": "b-p2", "type": "swing", "width_m": 0.85, "position_m": 0.5, "connects": ["b-kitchen", "b-bath"], "swing": "in" }
    ],
    "fixtures": [
      { "id": "b-wc", "room": "b-bath", "type": "wc", "position_m": [3.15, 0.85], "rotation_deg": 0, "size_m": [0.45, 0.5] }
    ],
    "circulation": [],
    "clearances": [
      { "id": "b-work", "room": "b-kitchen", "type": "work-zone", "center_m": [-0.2, 0], "size_m": [1.2, 0.6], "status": "not-verified" }
    ],
    "service": [],
    "provenance": {
      "method": "Authored concept interior",
      "source": "design-lab",
      "verification": "None. Conceptual; not a professional accessibility assessment."
    }
  }
}
```

Ids are stable and unique across rooms, partitions, doors and fixtures. Doors
reference a partition and two rooms; fixtures reference a room; rooms reference
a module and any exterior openings they use.

## Migration from room bands

`DesignInterior.migrate(design)`:

1. copies each zone into a rectangle spanning the clear module width;
2. preserves the zone name, type, start/end range and id in `sourceZoneId`;
3. marks the room `provenance: "inferred-from-zone"`;
4. marks the whole interior `status: "provisional"`;
5. records what was **not** inferable: partitions, door positions/swings,
   fixtures, clearances, circulation.

It does not invent a partition at a zone boundary. A zone boundary is a
programme band, not a wall.

The original zone data remains untouched. Imports of v2.0 designs without an
interior continue to work; the editor offers the migration and marks the result
provisional. Archived two-storey concepts are not silently converted.

## Validation categories

`DesignInterior.validate(design)` returns three separate lists:

### Invalid geometry

A demonstrable contradiction:

- room point outside the clear interior;
- invalid polygon or room area;
- overlapping rooms in the same module;
- partition outside the module;
- door without a partition or with unknown rooms;
- fixture outside its room;
- turning circle outside the room or blocked by a fixture;
- essential room disconnected from the door graph.

### Unresolved design

Information is missing or only inferred:

- no interior at all;
- provisional interior;
- inferred room;
- no doors, so connectivity cannot be assessed;
- bathroom without a 1.5 m turning circle;
- kitchen without a modeled work-zone approach;
- low room coverage.

### Review required

Geometry looks plausible, but professional/manual assessment remains:

- door narrower than the 0.86 m project target;
- partition thickness outside a typical range;
- fixture overlap;
- turning circle not professionally verified;
- room accessibility not professionally verified.

Passing these checks is not code compliance and not accessibility conformance.

## Accessibility classification

`Model.accessibilityProfile()` now overrides a manually supplied
`fully-accessible-single-storey` classification when interior evidence is
missing. Selected homes report:

- `single-storey-step-free-candidate` only when all of the following are
  recorded: single storey, step-free entrance, essential ground-floor rooms,
  doors ≥0.86 m, bathroom 1.5 m turning circle, kitchen work zone, circulation
  ≥0.9 m, and a recorded path connection;
- `potentially-adaptable` when the home is single-storey and step-free but one
  or more of those items is missing or unresolved;
- `not-assessed` when the essential programme is not modeled.

No selected home is classified as fully accessible. The candidate label still
requires professional assessment and evidence. CSA B651 and Ontario requirements
remain assessment targets, not claims of conformity.

## Demonstration interiors

### Offset Pair (`hamlet-offset-stack`)

- eight rooms across two 40-foot modules: living, kitchen, bathroom, hall,
  bedroom, second bathroom, studio and storage;
- seven partitions and seven doors;
- bathroom, kitchen counter and second-bath fixtures;
- kitchen work zone;
- no modeled 1.5 m bathroom turning circle, so both bathrooms remain unresolved
  rather than being declared accessible.

The offset massing, shed roof and covered outdoor room preserve the original
stacked home's identity without an upper floor.

### Accessible Garden Home (`hamlet-accessible-garden-home`)

- five rooms across two 20-foot modules: living, kitchen, bedroom, bathroom,
  storage;
- three partitions, three internal doors and a shared-wall link door;
- bathroom fixtures, kitchen counter and bed;
- kitchen work zone;
- the 1.7 m bathroom length cannot fit the 1.5 m turning circle alongside the
  recorded fixtures. The model reports `bathroom-turning-circle`, keeps the
  target and classifies the home `potentially-adaptable`.

This is the demonstration that nominal 20-foot modules constrain the accessible
layout. A better arrangement would need a longer/wider bathroom bay or a
different module composition; the project does not lower the clearance target to
make the current model pass.

The other four selected homes currently use provisional zone-derived interiors.
They are published as provisional and are not presented as authored room
layouts.

## Drawings and prompts

- `DesignInterior.planSVG()` renders rooms, partitions, doors, fixtures,
  turning circles and inferred-room hatching with a title and description.
- The build publishes `<home>-interior-plan.svg` and an interior prompt.
- The illustration scene includes interior rooms, schedule, validation,
  accessibility evidence and canonical hash.
- `scene.interiorPrompt` is generated from rooms, dimensions, fixtures,
  openings and unresolved items.
- `interiorIllustrationPrompt` can be available while
  `interiorPerspective` remains false: room polygons support a detailed prompt,
  not a geometrically accurate perspective.

Interior edits change the design hash and invalidate dependent drawings,
scenes and prompts. Presentation-only style changes do not change the design
hash or the architectural floor plans.

## Limits

- No partitions are inferred from room bands.
- No interior camera, hidden-surface removal or perspective renderer.
- Furniture is optional and is not evidence of usability.
- Fixture dimensions are nominal concept sizes.
- No structural opening design, lintel sizing or services coordination.
- No code, fire, egress, acoustics, moisture or accessibility certification.
- No construction documents or BIM/IFC export.
