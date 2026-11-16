# Two-storey container study

This study asks what a real two-storey container home would require. It deliberately does not add a second storey to Look inside.

## Why it is not modelled

The current geometry is horizontal. A trustworthy two-storey model needs:

- a vertical `level` or `base_elevation_m` per module;
- a structural connection and transfer-frame model;
- foundation overturning/uplift checks;
- level-aware stairs, landings, guards and two exits;
- a fire-separated floor/ceiling assembly and penetration model;
- level-aware openings, rooms, zones, solar, porches and cutaways.

Adding a visual stack without these would be false precision.

## Three options

| Option | What it buys | What must be resolved |
| --- | --- | --- |
| Stacked pair + external stair | Small footprint; an external stair can keep the upper floor independent | Vertical load path, lateral bracing, stair weather/egress, fire separation, guards, two exits |
| Offset stack / cantilever | Sheltered lower entry/deck; smaller upper floor; more interesting section | Back-span and overturning, connections, foundation uplift, upper-floor egress, snow drift and wind |
| Hillside two-level | Grade entry uphill; lower level walks out downslope; can shorten the accessible route | Retaining, drainage, slope stability, foundation, fire separation, internal stair, downhill egress, tree/rock protection |

## Structure and foundation

- Continuous load path through corner castings, steel transfer frame or designed bearing walls.
- Lateral stability, diaphragm action, connection slip and bracing.
- Overturning, uplift, frost and increased point loads.
- Wind/seismic exposure, cladding/solar/guard loads.
- Crane reach, rigging, temporary stability and connection access.

## Fire and egress

- Two remote exits; one external stair is not automatically enough.
- Fire-separated floor/ceiling assembly, protected stair and penetration details.
- Interconnected smoke/CO alarms and an evacuation plan.
- Stair width, rise/run, headroom, landings, handrails and guards.
- Fire department access to both levels and water supply.

## Recommendation

Test the **hillside two-level** first where there is a real grade change. Test the **stacked pair** only where the foundation, crane access and second egress route are credible. The **offset stack** is the most structurally demanding and should follow, not lead.

## Sources and context

- [2025 National Model Codes](https://cbhcc-cchcc.ca/en/2025-national-model-codes-now-available/) — model codes, subject to provincial adoption.
- [Ontario Building Code](https://www.ontario.ca/laws/regulation/120332) — legal framework, not a design.
- [Fire resilience study](fire-resilience.md) — steel-hull limits, fire separation, access and water.
- [Pattern study](container-patterns.md) — stacked pair as a visual pattern only.

No structural, fire, egress, foundation, height or zoning compliance is claimed.

## Validation

| Check | Result |
| --- | --- |
| `node tools/build.mjs --check` | 188 generated files current |
| `node tools/check.mjs` | 264 passed, 0 failed |
| `node tools/check-design-lab.mjs` | 717 passed, 0 failed |
| `node tools/browser-check.mjs` | 86 passed, 0 failed |
| `node tools/design-lab-check.mjs` | 163 passed, 0 failed |
| Initial view | 253 KB / 63 KB compressed |
| Whole site | 3412 KB |

## Screenshot

- [Two-storey study](screenshots/phase-1.3-envelope-vegetation/two-storey-study.jpg)

**Do not merge automatically.**
