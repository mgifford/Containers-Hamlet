# Stacked containers

## Why stacking is in scope

Stacking two containers can reduce ground coverage, foundation area and site
disturbance. It is not automatically cheaper, lower-carbon, more comfortable or
more accessible. A second storey adds:

* inter-storey structure and connections
* a continuous vertical load path
* lateral bracing and uplift resistance
* fire separation and protected egress
* a stair, and a vertical-access barrier for some residents
* crane time and a more complex construction sequence
* a more complex envelope and roof junction

The project therefore treats stacking as a **design option with explicit
trade-offs**, not as a sustainability claim.

## Coordinate system

All Design Lab geometry uses metres.

| Axis | Meaning |
| --- | --- |
| X | east–west model coordinate, positive east |
| Y | north–south model coordinate, positive south |
| Z | vertical elevation above finished exterior grade |
| Rotation | degrees around the vertical axis |

Local container coordinates are transformed into model coordinates by rotating
around the module centre and translating by `position_m`. Site placement is a
separate transformation (`site.homesite` and `site.rotation_deg`). The model
never mixes local container coordinates with site coordinates without that
explicit transformation.

## Schema v2.0 fields

```json
{
  "schema": "containers-hamlet-design/v2.0",
  "id": "hamlet-offset-stack",
  "maxOccupiedStoreys": 2,
  "levels": [
    { "id": "level-0", "storey": 0, "name": "Ground floor", "elevation_m": 0.6 },
    { "id": "level-1", "storey": 1, "name": "Upper floor", "elevation_m": 3.896 }
  ],
  "modules": [
    {
      "id": "m1",
      "containerType": "40ft",
      "nominal": { "length_m": 12.192, "width_m": 2.438, "height_m": 2.896 },
      "position_m": [0, 0],
      "elevation_m": 0.6,
      "rotation_deg": 0,
      "storey": 0,
      "support": { "type": "ground", "references": [], "verified": false }
    },
    {
      "id": "m2",
      "containerType": "40ft",
      "nominal": { "length_m": 12.192, "width_m": 2.438, "height_m": 2.896 },
      "position_m": [2.6, 0],
      "elevation_m": 3.896,
      "rotation_deg": 0,
      "storey": 1,
      "support": {
        "type": "module",
        "references": ["m1"],
        "verified": false,
        "note": "Bearing intent only. The unsupported area needs engineered transfer or cantilever review."
      }
    }
  ]
}
```

`elevation_m` is the **base** of the module above grade. It is explicit; the
model does not assume that every upper module starts at the same height. The
editor defaults an upper module to the highest module below plus the inter-storey
floor assembly (`0.4 m`), but the value remains editable.

`levels` is generated from the modules on canonicalisation. It records the
lowest base elevation on each storey and the module ids on that storey. A storey
can therefore contain modules at different elevations (a split-level condition),
and the level record marks `split_elevations: true`.

## Storey limit

A residence may have **one or two occupied storeys**. Three storeys are rejected
by schema validation and by geometry validation, and the editor refuses to stack
above an upper module. Three containers do not imply three storeys.

## Collision detection

Two modules may overlap in plan when they are at different elevations. They may
not overlap in three dimensions. The model uses oriented plan polygons (not an
axis-aligned bounding box) plus a vertical interval test:

```js
planOverlap && a.minZ < b.maxZ - tolerance && b.minZ < a.maxZ - tolerance
```

A same-level plan overlap is an **invalid geometry** error. A plan overlap at
different elevations is a **review prompt**: the support path, floor assembly,
fire separation and construction sequence still need review.

## Support relationships

A module directly above another is **not automatically supported**.

`supportAnalysis()` computes, for each upper module:

* the plan overlap area with every lower module
* the vertical gap to each lower module
* the fraction of the upper module's footprint that has a bearing overlap
* whether the declared support references match the geometric contacts

The model reports:

| Code | Meaning |
| --- | --- |
| `support-not-declared` | Upper module has no declared supporter. Support intent is uncertain. |
| `unsupported-upper` | No lower module overlaps in plan. A transfer structure is implied. |
| `partial-support` | Part of the footprint has no module below. Cantilever/transfer review is required. |
| `support-reference-mismatch` | A named supporter does not provide bearing overlap at the recorded elevation. |
| `inter-storey-gap` | A vertical gap larger than the floor assembly is recorded. |
| `no-support-contact` | No lower module is in plan contact. |
| `stacked-lateral` | Stacked modules need a designed lateral-force system. |
| `stacked-foundation` | Stacking changes foundation reactions and uplift. |
| `missing-stair` | Upper storey without a recorded stair. |

The **declared** support is design intent. The **geometric** overlap is a
measurement. Neither is a capacity calculation. Only a documented professional
assessment can set `verified: true`, and the schema rejects a verified claim
without reviewer, organisation, date, scope and document reference.

## Structural review register

Every concept carries a review register with at least sixteen concerns:
corner castings/posts, vertical load transfer, container orientation, sidewall
openings, removed walls, cantilevers, lateral stability, wind, snow, foundation
reactions, inter-module connections, crane access, transport, fire separation,
corrosion, thermal bridges and moisture/condensation.

Statuses are `not-assessed`, `requires-review`, `conceptually-resolved` and
`professionally-verified`. Automatic generation assigns `requires-review` when a
trigger applies and never assigns `professionally-verified`.

## Roof geometry

Roof geometry is independent of module geometry and does **not** create an
occupied storey. Supported forms:

* simple gable
* shed
* butterfly
* flat with a drainage strategy
* roof canopy above stacked modules
* green roof concept
* solar-ready roof

`roofGeometry()` returns the roof type, pitch, overhang, eave and top elevation,
roof area and solar-ready area. The renderer uses that same object for plans,
elevations, sections, axonometrics and solar studies.

A butterfly roof concentrates water at a central valley. A flat roof needs slope,
outlets, overflow and ponding review. A green roof adds saturated load, drainage,
fire and maintenance complexity. A canopy is not an occupied floor.

## Editor operations

The editor supports:

* storey selection (all, ground, upper)
* explicit module elevation input
* stack above the selected ground module
* align an upper module to the module below
* offset the upper module by 1.5 m
* rotate the upper module by 90°
* create a perpendicular stack
* inspect support relationships
* configure stair type, module, width, run, rise, landing and lift reserve
* choose the roof form, pitch, overhang and green-roof concept

Every operation has a keyboard-operable button or native form control. Drag-and-drop
is a shortcut, never the only method. On the plan, Page Up and Page Down change
the level and A shows all levels.

## Rendering

The same model produces:

* combined plan
* ground-floor plan
* upper-floor plan, when present
* four elevations
* building section
* exploded levels
* exterior and cutaway axonometrics
* summer and winter solar studies

When one level is selected, modules on the other level remain visible as muted
outlines. This is deliberate: an upper-floor selection must keep its ground-floor
context.

## Migration

`Schema.migrateV1()` converts a v1 design to v2 by placing every module on storey
0 at the recorded foundation clearance. It adds a not-assessed review register
and accessibility record. It reports that vertical geometry, support evidence
and professional review evidence did not exist in v1 and were not invented.

`Schema.migrateV01()` converts the older prototype to v2 with the same honesty:
it lists every unmapped field, including storeys, support and review evidence.

## What the model does not do

* No structural analysis, member sizing, connection design or foundation capacity.
* No fire-resistance rating or egress calculation.
* No energy, carbon, cost or whole-life assessment.
* No claim that a geometric support overlap is adequate.
* No claim that a two-storey home is accessible because its entrance is step-free.
