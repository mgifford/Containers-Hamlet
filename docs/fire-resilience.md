# Fire resilience in the forest hamlet

This extension adds a fire-resilience layer. It is not a fire-resistance rating, a wildland–urban interface (WUI) approval or an insurance guarantee.

## The steel hull is one layer

A steel container is noncombustible, but a home still has:

- roof-to-wall junctions, eaves and vents;
- doors, windows and service penetrations;
- external insulation, rainscreen cavities and timber cladding;
- decks, porches and stored goods;
- interior furnishings, batteries and PV equipment.

Steel conducts heat and thin steel can lose strength when hot. A steel shell is not automatically a fire-resistance-rated assembly.

## The three layers

1. **Site and fuel:** defensible space, limbing, spacing, removing dead material, noncombustible 0–1.5 m zone, access and evacuation.
2. **Building:** Class A roof assembly, closed noncombustible eaves/soffits, ember-resistant vents, tempered/laminated glazing, noncombustible deck/porch, exterior shutters, no combustible storage under the floor.
3. **Response:** fire apparatus access, turnaround, bridge load limits, address signage, hydrant/draft/cistern and a water supply the fire service can actually use.

## What changed

- Added `/design-lab/fire/` with an original fire-zone diagram, steel-hull limits, defensible-space guidance, building measures and code context.
- Added fire-resilience fields to the design schema and editor:
  - roof class;
  - closed noncombustible eaves;
  - ember-resistant vents;
  - tempered/laminated glazing;
  - noncombustible deck/porch;
  - exterior shutters;
  - defensible-space distance;
  - fire access/water confirmed.
- The editor records these as **intent**, not a fire-resistance calculation. It does not model fire spread, radiant heat, ember exposure, sprinklers or insurance acceptability.
- Added a fire-resilience link on the main site and Design Lab navigation.

## Codes and sources

- [2025 National Model Codes](https://cbhcc-cchcc.ca/en/2025-national-model-codes-now-available/) — model codes are not automatically in force; Ontario adoption and amendments govern.
- [Housing, Infrastructure and Communities Canada — climate-resilient codes, standards and guidance](https://housing-infrastructure.canada.ca/climate-resilience-climatique/codes-standards-normes-guidances-eng.html) — federal guidance, not a site approval.
- [FM Approvals — modern buildings burn differently](https://www.fmapprovals.com/resources/insights/modern-buildings-burn-differently-implementing-fire-resilience-for-a-changing-climate) — insulation, cavities, roof assemblies and PV change fire behaviour.
- [Senator Rosa Galvez — building code discussion paper](https://rosagalvez.ca/en/initiatives/building-code/building-code-discussion-paper/) — policy commentary.
- [University of Waterloo thesis](https://uwspace.uwaterloo.ca/items/3a288546-59d8-4b4b-af56-3177fd327824) — research context.
- [NEEP — energy efficiency is life-safety](https://neep.org/blog/energy-efficiency-life-safety-shifting-conversation-around-purpose-building-codes) — energy efficiency, resilience and life-safety.
- [ClimateData.ca buildings module](https://climatedata.ca/buildings-module-overview/) — climate data context.
- [Canadian Consulting Engineer — aligning building codes with sustainability](https://www.canadianconsultingengineer.com/features/aligning-building-codes-with-sustainability/) — industry commentary.
- [IBHS wildfire demonstration](https://ibhs.org/wildfire/wildfire-demo-2019/) — ember/building-performance research, not a product certification.

## What is not claimed

- No fire-resistance rating, WUI setback, sprinkler design, hydrant flow, water storage, access width or evacuation plan is designed.
- No material or assembly is certified by inclusion here.
- No insurance acceptability is implied.
- No local by-law, Ontario Building Code or Ontario Fire Code compliance is established.

A fire-protection engineer, building official, local fire department, insurer and conservation authority must review the real site.

## Validation

| Check | Result |
| --- | --- |
| `node tools/build.mjs --check` | 205 generated files current |
| `node tools/check.mjs` | 289 passed, 0 failed |
| `node tools/check-design-lab.mjs` | 724 passed, 0 failed |
| `node tools/browser-check.mjs` | 107 passed, 0 failed |
| `node tools/design-lab-check.mjs` | 171 passed, 0 failed |
| Main first view | 259 KB uncompressed / 64 KB gzipped |
| Whole published site | 3516 KB (under 3.5 MB) |

## Screenshot

- [Fire guide](screenshots/phase-1.3-envelope-vegetation/fire-guide.jpg)

**Do not merge automatically.**
