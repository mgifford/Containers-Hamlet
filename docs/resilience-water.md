# Community resilience and water

This extension adds a hamlet-scale resilience brief and a separate water-cycle guide. Both are design briefs, not emergency, fire-water, potable-water or sewage approvals.

## Beyond one house

`/design-lab/resilience/` covers:

- **Forest fire beyond Ontario FireSmart/compliance:** access, shared fire water, cross-parcel fuel maintenance, community wildfire protection plan, named roles, evacuation and recovery.
- **Heat:** multi-day heat without air conditioning, external shading, night ventilation, cool shared refuge and smoke filtration.
- **Flood:** overland flow, culverts, swales, rain gardens, cistern overflow, elevated foundations and protected septic.
- **Drought:** demand reduction, native planting, greywater for subsurface irrigation, trigger levels and a separate fire reserve.
- **Power/communications:** shared solar/battery, islanding, radio, printed contacts and medical plans.
- **Community capacity:** shared lodge/tools/water/power, redundant skills, refuge, governance and a reserve fund.
- **Not autarky:** the hamlet still needs the fire service, ambulance, grid/backup, road access and outside help.

## Water

`/design-lab/water/` separates:

- **Rainwater:** catchment × rainfall × efficiency; first flush, filtration, storage, freeze protection, overflow and potable treatment/testing.
- **Greywater:** showers/sinks/laundry to subsurface irrigation or permitted treatment; no potable connection, no edible-crop contact, health-unit review.
- **Blackwater:** septic or permitted alternative; Ontario Building Code Part 8, siting, separation distances, maintenance and flood protection.
- **Fire reserve:** a dedicated, tested volume with a fire-service connection — not the daily cistern's last litre.
- **Drought/flood operations:** trigger levels, separate fire reserve, overflow and water-quality testing.

The page includes an illustrative calculator:

`harvest = roof area × rainfall × capture efficiency`

`usable storage days = (storage − fire reserve) ÷ daily demand`

It deliberately does not size a real system.

## Validation

| Check | Result |
| --- | --- |
| `node tools/build.mjs --check` | 192 generated files current |
| `node tools/check.mjs` | 268 passed, 0 failed |
| `node tools/check-design-lab.mjs` | 722 passed, 0 failed |
| `node tools/browser-check.mjs` | 86 passed, 0 failed |
| `node tools/design-lab-check.mjs` | 166 passed, 0 failed |
| Initial view | 253 KB / 63 KB compressed |
| Whole site | 3422 KB |

## Screenshots

- [Community resilience](screenshots/phase-1.3-envelope-vegetation/resilience-guide.jpg)
- [Water cycle](screenshots/phase-1.3-envelope-vegetation/water-guide.jpg)

**Do not merge automatically.**
