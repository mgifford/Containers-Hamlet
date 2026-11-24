# Residential energy model: solar, batteries and seasonal demand

**Status:** concept model. Not a solar resource assessment, electrical design, structural design, code calculation or off-grid guarantee.

**Scope:** the six hamlet residences: Woodland Cottage, Offset Stack, Courtyard Residence, Cross-Stacked Retreat, Accessible Garden Home and Solar Studio Stack. Cabin A and the common lodge keep their separate existing models; the common lodge also carries a shared array outside the residential total.

This document explains how the residential electricity demand, solar generation, battery storage and winter resilience estimates were established. The canonical inputs live in `data/design-lab.json` under each concept's `energy` object. The engine is `site/js/design-energy.js`. Heat-pump heating and cooling are assessed separately in [`heat-pump-energy-assessment.md`](heat-pump-energy-assessment.md); they are not part of the baseline household demand.

## 1. Design objectives

- Give each home a system sized to its own occupancy and equipment, not to a universal panel count.
- Keep small homes modest and let larger households have more capacity only when the loads justify it.
- Separate essential, ordinary, high-demand and accessibility-related loads.
- Model summer, shoulder-season, intermittent winter, full-time winter and unoccupied winter operation.
- Represent every installed panel in the canonical architectural geometry, so drawings, calculations and illustration references agree.
- Keep winter shortfalls visible.
- Treat shared community electricity as an option with governance and failure modes, not as an unexplained assumption.
- Reduce demand before increasing generation.
- Preserve the woodland and avoid clearing trees to improve a modelled yield.

## 2. Reference module and installed arrays

The initial reference module is a **450 W panel, about 1.762 × 1.134 m (1.997 m²)**. It is illustrative and configurable. Actual equipment varies.

| Residence | Array strategy | Panels | kWp | Panel area | Battery nominal |
|---|---|---:|---:|---:|---:|
| Woodland Cottage | One flush south roof row | 8 | 3.6 | 16.0 m² | 10 kWh |
| Offset Stack | 6 on upper shed roof + 4 ground-mounted in the east clearing | 10 | 4.5 | 20.0 m² | 15 kWh |
| Courtyard Residence | 8 tilted racks on the flat roof + 4 on a detached east-path canopy | 12 | 5.4 | 24.0 m² | 18 kWh |
| Cross-Stacked Retreat | Two roof groups of 8 on the butterfly roof | 16 | 7.2 | 32.0 m² | 24 kWh |
| Accessible Garden Home | 8 on the canopy roof + 4 on the accessible porch roof | 12 | 5.4 | 24.0 m² | 18 kWh |
| Solar Studio Stack | 6 on the upper roof at 40° + 4 on a steep 65° winter canopy | 10 | 4.5 | 20.0 m² | 12 kWh |
| **Residential total** | | **68** | **30.6** | **136 m²** | **97 kWh** |

Sixteen panels is the upper end of the initial residential design range, not a target. The arrays are hypotheses confirmed against floor area, roof geometry, occupancy and load; they are not derived from floor area alone.

The common lodge carries a 24-panel, 10.8 kWp shared array and a 20 kWh shared battery. It is outside the 68-panel residential total and is intended for shared laundry, water pumping, tools and emergency charging.

## 3. Load model

Each load records:

- rated power in watts;
- quantity;
- estimated hours for summer, shoulder and winter;
- duty cycle;
- AC or DC supply;
- load class;
- occupancy dependency;
- unoccupied standby power;
- seasonal variation;
- assumption source and confidence;
- whether the resident can defer it.

Daily consumption is calculated, not assigned by floor area:

```text
daily kWh = rated W × quantity × hours[season] × duty cycle × class factor / 1000
```

The five classes are:

1. essential continuous;
2. essential intermittent;
3. ordinary discretionary;
4. high-demand flexible;
5. accessibility-related.

Essential classes are included in essential autonomy. High-demand and discretionary loads are reduced in the intermittent winter profile. Accessibility loads are included when they are actually present; no particular medical or mobility device is assumed.

The load lists include lighting, exterior lighting, refrigeration, phone/laptop/USB charging, internet and LTE, ventilation/HRV, ceiling fans, water pumping and treatment, sensors, cameras, battery management, inverter standby, battery heating, induction cooking, kettle, toaster, small appliances, and the appliances present in each home (freezer, dishwasher, microwave, television, washer, workshop tools, monitor, NAS, dehumidifier, powered door, adjustable counter, accessibility reserve).

Not every home has every load. The full list and calculation are published on each architecture page and in `data/design-lab.json`.

### 3.1 Daily consumption results

| Residence | Summer kWh/day | Winter full-time kWh/day | Winter primary pattern kWh/day | Unoccupied winter kWh/day |
|---|---:|---:|---:|---:|
| Woodland Cottage | 2.59 | 3.17 | 2.34 (intermittent) | 0.58 |
| Offset Stack | 4.55 | 5.41 | 5.41 | 0.74 |
| Courtyard Residence | 4.55 | 5.51 | 5.51 | 0.67 |
| Cross-Stacked Retreat | 6.81 | 7.99 | 7.99 | 0.74 |
| Accessible Garden Home | 4.69 | 5.56 | 5.56 | 0.74 |
| Solar Studio Stack | 3.89 | 4.61 | 4.61 | 0.74 |

The initial bands were: unoccupied monitoring 0.2–0.8 kWh/day; minimal single-person 1.5–2.5; modest cottage 2.5–3.5; comfortable single-person 3.5–4.5; comfortable two-person 4.5–6; higher-demand 6–8. The results sit within or close to these bands. The 0.74 kWh unoccupied figure is at the top of the monitoring band because the larger homes keep a camera, NAS, router, LTE radio, sensors, BMS and inverter standby alive.

### 3.2 Heating and hot water are excluded

The baseline does not include electric resistance space heating, conventional electric domestic hot water, electric laundry, additional cooking appliances or electric vehicle charging. Optional profiles show their indicative demand separately. A heat pump is assessed in the separate heat-pump document and is additional to the baseline.

## 4. Seasonal operating profiles

Five profiles are recorded for each home:

- **summer:** long days, high solar availability, low lighting, fans and cooling;
- **spring and autumn:** more lighting, variable ventilation and more cloud;
- **intermittent winter:** occupied weekends or short visits, reduced discretionary and high-demand loads, plus unoccupied days between visits;
- **full-time winter:** continuous occupation with the full winter load;
- **unoccupied winter:** monitoring, communications, BMS, sensors and battery heating only.

The intended pattern differs by home. Woodland Cottage is seasonal with intermittent winter visits; Offset Stack and Courtyard Residence are three-season homes used in winter; Cross-Stacked Retreat, Accessible Garden Home and Solar Studio Stack are modelled as full-time.

## 5. Solar generation model

### 5.1 Method

- Monthly global horizontal irradiation is illustrative eastern-Ontario / Canadian Shield data assembled from published regional summaries (NRCan, PVGIS), not measured at the site.
- An isotropic sky transposition with the Erbs diffuse fraction converts horizontal to plane-of-array irradiation for the array tilt and azimuth.
- Monthly snow availability reduces winter output.
- Shading is a simplified geometric estimate from modelled tree cylinders and building self-shading, with the larger of that estimate and the recorded design allowance used so the two are not added.
- Losses are applied once: soiling 3%, mismatch and DC wiring 5%, inverter 4%, temperature 6% summer / 2% winter, degradation 0.5%/year at an assessment year of 10.
- Battery charge and discharge losses are applied in the battery simulation, not in the generation chain.

### 5.2 Results

| Residence | Summer kWh/day | Winter kWh/day | Annual kWh | Specific yield kWh/kWp |
|---|---:|---:|---:|---:|
| Woodland Cottage | 13.08 | 3.71 | 3,145 | 874 |
| Offset Stack | 15.36 | 5.06 | 3,873 | 861 |
| Courtyard Residence | 20.34 | 5.85 | 4,917 | 911 |
| Cross-Stacked Retreat | 21.97 | 6.85 | 5,431 | 754 |
| Accessible Garden Home | 20.37 | 5.62 | 4,865 | 901 |
| Solar Studio Stack | 14.57 | 5.22 | 3,778 | 840 |

Example, Woodland Cottage:

| Month | Generation kWh | kWh/day | Shading | Snow availability |
|---|---:|---:|---:|---:|
| January | 107.6 | 3.47 | 19.2% | 0.82 |
| February | 142.5 | 5.09 | 19.2% | 0.85 |
| March | 260.1 | 8.39 | 16.4% | 0.92 |
| April | 330.5 | 11.02 | 16.4% | 0.98 |
| May | 401.8 | 12.96 | 16.4% | 1.00 |
| June | 405.7 | 13.52 | 13.7% | 1.00 |
| July | 418.8 | 13.51 | 13.7% | 1.00 |
| August | 378.4 | 12.21 | 13.7% | 1.00 |
| September | 300.4 | 10.01 | 16.4% | 1.00 |
| October | 204.2 | 6.59 | 16.4% | 0.99 |
| November | 109.8 | 3.66 | 19.2% | 0.90 |
| December | 85.6 | 2.76 | 19.2% | 0.80 |

These are estimates, not guaranteed production. A December day is far below a June day, and a snowy or overcast week can be below either.

## 6. Panel geometry

Every installed panel has:

- a unique id;
- an array id and electrical group;
- module count, rows, columns and orientation;
- panel dimensions, rated power and area;
- tilt and azimuth measured from geographic north;
- mounting type and supporting surface (roof, canopy, porch or ground);
- standoff, edge clearance and placement offset;
- maintenance access and snow-shedding notes;
- coordinates and four 3D corners derived from the canonical geometry.

The same panel list feeds the roof plan, elevations, axonometric, cutaway, exploded view, section, solar studies and illustration reference data. No renderer invents a panel. When a panel is hidden from a viewpoint, the view says so or omits it; it does not add another.

## 7. Battery model

Each home records LiFePO4 nominal and usable capacity, minimum and maximum state of charge, charge and discharge efficiency, maximum charge/discharge power, inverter capacity, inverter standby, essential reserve and target autonomy. Woodland Cottage uses a 24 V architecture; the larger homes use 48 V. Battery temperature limits and the heated enclosure are recorded; charging below 0 °C is not assumed.

Autonomy is calculated without solar input:

- **essential autonomy** = usable battery ÷ essential daily load;
- **ordinary autonomy** = (usable battery − essential reserve) ÷ ordinary daily load.

| Residence | Nominal / usable | Essential autonomy | Ordinary autonomy |
|---|---:|---:|---:|
| Woodland Cottage | 10 / 9.0 kWh | 5.0 days | 2.4 days |
| Offset Stack | 15 / 13.5 kWh | 4.0 | 1.6 |
| Courtyard Residence | 18 / 16.2 kWh | 5.4 | 1.9 |
| Cross-Stacked Retreat | 24 / 21.6 kWh | 4.9 | 1.7 |
| Accessible Garden Home | 18 / 16.2 kWh | 4.6 | 1.7 |
| Solar Studio Stack | 12 / 10.8 kWh | 4.3 | 1.5 |

A battery that lasts three days is not sufficient if the array cannot recharge it while supplying the house. The autonomy figures are a first test, not a resilience conclusion.

## 8. Resilience scenarios

Ten repeatable scenarios are run for each home:

1. typical summer day;
2. typical winter day;
3. three consecutive cloudy winter days;
4. five consecutive cloudy winter days;
5. snow-covered arrays;
6. winter weekend followed by an unoccupied period;
7. full-time winter week;
8. partial array failure;
9. loss of shared community electricity;
10. essential-load-only emergency operation.

Each scenario tracks starting charge, generation, load, battery charge and discharge, ending charge, curtailment, unserved demand and supplementary electricity. The model conserves energy:

```text
generation + battery discharge + supplementary + unserved
  = load + battery charge + curtailed generation
```

The five-day cloudy shortfall without shared electricity is:

| Residence | Unserved kWh/day |
|---|---:|
| Woodland Cottage | 1.05 |
| Offset Stack | 2.27 |
| Courtyard Residence | 1.83 |
| Cross-Stacked Retreat | 3.29 |
| Accessible Garden Home | 2.15 |
| Solar Studio Stack | 1.81 |

These are synthetic stress tests, not weather forecasts.

## 9. Shared community electricity

Three configurations are compared:

- **independent residence:** own array and battery, no shared supply;
- **independent with community backup:** essential independent capability plus limited shared electricity;
- **shared community microgrid:** multiple arrays and batteries in a professionally designed network.

The default is community backup, but it is modelled as an option. Distribution loss, a limited daily supplement, governance, metering, equipment failure and equitable access are recorded. A microgrid does not remove the effect of region-wide winter cloud or snow.

## 10. Validation

Validation covers:

- panel count matching installed capacity and placed geometry;
- panels fitting their surface and edge clearance;
- overlapping panels;
- unsupported placement;
- invalid tilt or orientation;
- roof obstacles and snow discharge;
- accessible routes and maintenance access;
- battery nominal/usable consistency and SOC limits;
- load calculation completeness;
- energy conservation in simulations;
- energy shortfall as a displayed result, not a software failure.

Categories distinguish invalid geometry, energy shortfall, unresolved assumptions, and structural, electrical and environmental review.

## 11. Illustration integration

The illustration scene specification includes the exact installed panel count, the count visible from the viewpoint, array arrangement, mounting, tilt, azimuth, surface and electrical group, canopy dimensions, maintenance access and snow-shedding. The prompt states the count and forbids adding, removing or rearranging panels. The geometric model remains authoritative; generated images that deviate are discrepancies, not new evidence.

## 12. Sustainability and sufficiency

The project prioritises:

- demand reduction before generation;
- efficient appliances and DC-native devices;
- shared laundry and high-demand equipment;
- passive heating, cooling and daylight;
- repairable, accessible equipment;
- avoiding woodland clearing;
- battery and panel longevity and replacement.

It does not claim carbon neutrality, lifecycle benefits or a complete environmental comparison. More panels are not automatically better; a smaller home with a smaller system can be the more appropriate result.

## 13. Evidence and known uncertainties

Sources used for the solar resource and method:

- Natural Resources Canada solar resource pages: <https://natural-resources.canada.ca/>
- European Commission PVGIS: <https://re.jrc.ec.europa.eu/pvg_tools/en/>
- Existing Containers Hamlet electrical, ventilation, wood-heat, lighting and water studies.

Uncertainties:

- no surveyed coordinates, measured weather, shading study or solar resource assessment;
- panel and battery specifications vary by product;
- tree height, canopy density and snow cover are simplified;
- occupancy and appliance use are assumptions, not metered data;
- battery ageing, cold derating and inverter surge are simplified;
- no resident has tested the homes.

## 14. Resident-facing explanation

A home can have enough summer electricity and still need winter backup. In summer the array may make two to five times the daily household demand, and the battery fills early. In December the same array may make less than the daily demand, and a cloudy week can make almost nothing. The battery carries the house for a few days, but it cannot refill while it is also supplying the load. That is why the design keeps a non-electric heating path, reduces winter demand and treats shared electricity as a backup rather than a guarantee.

The goal is not to be independent on the best day. It is to be comfortable, safe and honest about the worst week.

## 15. Reproduction

```sh
node tools/check-energy.mjs
node tools/energy-browser-check.mjs
```

The public comparison is at `/design-lab/residences/` and `/design-lab/energy/`; each architecture page carries the arrays, load list, monthly table and resilience scenarios.
