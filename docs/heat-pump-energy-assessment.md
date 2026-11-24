# Heat-pump energy assessment for the six residences

**Status:** preliminary concept assessment, not an HVAC design, electrical design, equipment selection, cost estimate, comfort guarantee or permit document.

**Scope:** Woodland Cottage, Offset Stack, Courtyard Residence, Cross-Stacked Retreat, Accessible Garden Home and Solar Studio Stack. The common lodge is outside this residential assessment.

**Question:** if a modest woodland home already has a solar array and battery for ordinary household services, what additional electricity, panels, storage and supporting equipment would a heat pump require — and can passive design or a hybrid strategy avoid some or all of it?

## 1. Answer in plain language

Full-time winter heat-pump heating is **not a drop-in addition** to these off-grid homes. On the modelled assumptions it would add roughly **30–56 panels** beyond the existing 8–16 panel arrays when the system is sized for the winter-critical month. It would also add tens of kilowatt-hours of battery capacity and a larger inverter. The additional photovoltaic area is often larger than the remaining roof area and, in several homes, larger than the conditioned floor area.

The annual energy total is misleading. A heat pump can use summer surplus for cooling or dehumidification, and a hybrid wood/heat-pump strategy uses far less electricity. The hard case is a cold, cloudy winter week, when the array cannot recharge the battery while supplying both the household and the heat pump.

The defensible strategy is therefore:

1. Reduce demand first: envelope, airtightness, windows, heat recovery and shading.
2. Keep a non-electric heating path (wood where it is safe and physically possible).
3. Use a heat pump for shoulder-season heating, summer cooling and surplus-solar operation.
4. Do not size the reference solar array for full-time electric heating.
5. For the Accessible Garden Home, design a specific solution because wood handling cannot be assumed.

This is the opposite of a blanket recommendation for or against heat pumps. It is a statement about the scale of the electrical infrastructure relative to these homes and their winter resource.

## 2. Baseline preserved

The existing household electricity model in [`docs/residential-energy-model.md`](residential-energy-model.md) is unchanged. Heat-pump electricity is additional:

```text
Total electrical demand
  = baseline household demand
  + incremental heating electricity
  + incremental cooling electricity
  + supporting equipment (parasitics, pumps, resistance backup)
```

The existing reference arrays and batteries are not resized automatically. The assessment reports the gap between what exists and what full-time heating would require.

## 3. Thermal model

### 3.1 Envelope geometry

Envelope areas are derived from the canonical modules, roofs and openings:

- wall gross area from each module perimeter and height, multiplied by a party-wall factor for attached modules;
- windows from the documented glazing area by orientation;
- doors from the documented door and sliding-door openings;
- roof and floor from the conditioned floor area;
- conditioned volume from floor area × 2.45 m.

Shared party walls are approximated with a factor. This is not a measured envelope survey.

### 3.2 Heat-loss assumptions

| Element | U-value (W/m²K) | Note |
|---|---:|---|
| Wall | 0.18 | Continuous exterior insulation, assumed |
| Roof | 0.12 | Assumed |
| Floor | 0.15 | Elevated floor, assumed |
| Window | 0.95 | Triple glazed, assumed |
| Door | 1.20 | Assumed |
| Thermal bridges | +10% of opaque UA | Allowance, not a calculated psi-value |

Airtightness is 1.0–1.5 ACH50 depending on the home. Effective infiltration is approximated as ACH50 ÷ 20. Mechanical ventilation is 0.35 ACH with 85% heat recovery, giving an effective ventilation rate of about 0.0525 ACH. Both are combined into a ventilation heat-loss coefficient:

```text
Q_vent = 0.33 × volume × effective ACH × ΔT
```

### 3.3 Gains

Internal gains are 80 W per occupant plus 220 W of appliance gain. This is a modelling assumption; not all household electricity becomes useful heat.

Solar gains use monthly vertical-plane irradiation for each orientation, the documented glazing area, a whole-window SHGC of 0.52, a frame factor of 0.85 and a shading factor of 0.55 for overhangs, deciduous planting and frames. This is not a daylight, glare or overheating model.

### 3.4 Daily and peak demand

```text
Q_loss = UA_total × (T_indoor − T_outdoor) × 24 / 1000   [kWh/day]
Q_heat = max(0, Q_loss − internal gains − solar gains)
Q_peak = max(0, UA_total × ΔT − internal gains)           [W]
```

Cooling is treated separately at warm outdoor temperatures, with a passive-cooling allowance. It is not a humidity or latent-load model.

### 3.5 Climate

Monthly mean outdoor temperatures are the Environment and Climate Change Canada 1991–2020 Canadian Climate Normals for Ottawa (City):

| Jan | Feb | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov | Dec |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| −9.6 | −8.1 | −2.2 | 6.2 | 13.8 | 18.8 | 21.3 | 20.1 | 15.6 | 8.8 | 2.0 | −5.1 |

The −30 °C test is an extreme design condition. The normal-period extreme minimum at Ottawa is about −32 °C; the model does not claim a design-day frequency analysis.

## 4. Heat-pump model

### 4.1 Air-source

The cold-climate air-source curve is an illustrative mid-range curve informed by the NEEP cold-climate specification test points at 5 °F (−15 °C), 17 °F (−8.3 °C) and 47 °F (8.3 °C):

| Outdoor °C | COP | Capacity factor |
|---:|---:|---:|
| +10 | 4.2 | 1.05 |
| +5 | 3.9 | 1.00 |
| 0 | 3.4 | 0.95 |
| −5 | 2.9 | 0.90 |
| −10 | 2.4 | 0.83 |
| −15 | 1.95 | 0.74 |
| −20 | 1.6 | 0.64 |
| −25 | 1.4 | 0.54 |
| −30 | 1.25 | 0.44 |

A defrost penalty of 8% is applied below +5 °C. Parasitics are 120 W while running and 15 W standby. Supplemental resistance is used when the heat pump cannot meet the load. The model does not select a product; published COP and capacity vary widely.

### 4.2 Ground-source

Ground-source is modelled with a constant COP of 3.6 for heating and 4.5 for cooling, with no defrost and stable capacity. This is a first approximation. Ground temperature, borehole field, loop pumping, drilling, excavation, geology and capital cost are not designed. A ground-source system still requires electricity and a substantial site intervention.

### 4.3 Electrical calculation

```text
delivered thermal = min(heating demand, capacity × 24)
resistance backup = heating demand − delivered thermal
electricity = delivered thermal / COP + resistance backup + parasitics + standby
```

A cycling penalty of 10% is applied when the daily demand is below the minimum modulation. Cooling electricity is calculated separately.

## 5. Results at the design condition

The table below summarises the six homes. “Additional panels” is the winter-critical count beyond the existing reference array, not an annual-average count.

| Home | Conditioned m² | Design heat load at −30 °C | Annual heating kWh | Annual cooling kWh | ASHP heating kWh/yr | ASHP cooling kWh/yr | January HP kWh/day | Existing panels | Additional winter panels | Total required panels | Additional panel area | Additional battery 3 days | Total battery 3 days | Combined peak | Panels avoided by passive package |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Woodland Cottage | 29.7 | 1.88 kW | 2,190 | 690 | 1,637 | 394 | 13.2 | 8 | 33 | 41 | 65.9 m² | 58 kWh | 68 kWh | 3.9 kW | 5 |
| Offset Stack | 59.4 | 3.45 kW | 4,924 | 930 | 2,609 | 469 | 21.1 | 10 | 49 | 59 | 97.9 m² | 92 kWh | 107 kWh | 6.2 kW | 7 |
| Courtyard Residence | 63.3 | 3.83 kW | 5,168 | 1,268 | 2,721 | 575 | 22.9 | 12 | 55 | 67 | 109.8 m² | 100 kWh | 118 kWh | 7.2 kW | 8 |
| Cross-Stacked Retreat | 59.4 | 3.19 kW | 3,871 | 1,159 | 2,267 | 541 | 18.8 | 16 | 56 | 72 | 111.8 m² | 82 kWh | 106 kWh | 7.2 kW | 6 |
| Accessible Garden Home | 29.5 | 1.86 kW | 1,991 | 784 | 1,362 | 424 | 12.7 | 12 | 35 | 47 | 69.9 m² | 56 kWh | 74 kWh | 5.3 kW | 5 |
| Solar Studio Stack | 29.5 | 2.05 kW | 2,355 | 743 | 1,709 | 411 | 14.0 | 10 | 30 | 40 | 59.9 m² | 61 kWh | 73 kWh | 4.4 kW | 4 |

Notes:

- Annual heat-pump electricity includes heat-pump parasitics but not the additional resistance heating on extreme days separately; the electricity total includes the modelled resistance backup through the COP calculation.
- Additional battery is nominal capacity for three days of heat-pump electricity at 80% usable capacity, 96% discharge efficiency and a 10% cold derating. It is additional to the existing household battery.
- The combined peak is the heat-pump electrical peak at the worst temperature plus an approximate baseline household peak. It is not a service calculation.
- The passive package is a plausible set of improvements, not a costed retrofit.

## 6. Temperature behaviour

Example, Woodland Cottage:

| Condition | Heating demand kWh/day | Peak load kW | COP | Available capacity kW | Resistance backup kWh/day | Electrical kWh/day |
|---|---:|---:|---:|---:|---:|---:|
| +10 °C | 3.3 | 0.9 | 3.78 | 2.63 | 0 | 4.1 |
| +5 °C | 8.5 | 1.3 | 3.51 | 2.50 | 0 | 5.7 |
| 0 °C | 13.7 | 1.6 | 2.82 | 2.38 | 0 | 8.1 |
| −10 °C | 24.2 | 2.1 | 1.99 | 2.07 | 0 | 15.4 |
| −20 °C | 34.6 | 2.6 | 1.47 | 1.60 | 14.0 | 26.8 |
| −30 °C | 45.1 | 3.1 | 1.15 | 1.10 | 15.0 | 44.9 |

At −20 °C and below, the illustrative 2.5 kW unit no longer meets the design load and resistance backup is required. A larger unit would reduce backup but increase peak demand, cycling and oversizing risk.

## 7. Additional panels: method and meaning

For each home:

- `per-panel` monthly generation comes from the existing canonical array model, including shading, snow and losses.
- `household-only winter panels` = the maximum over November–February of household daily demand ÷ winter per-panel daily generation.
- `heat-pump winter panels` = the same calculation for heat-pump electricity.
- `total required` = the larger of the existing array and the sum of household and heat-pump requirements.
- `additional panels` = total required − existing panels.
- `annual panels` = annual heat-pump electricity ÷ annual per-panel generation. This is a lower bound and is not sufficient for winter autonomy.

The winter-critical count is the headline because that is when the system is stressed. The annual count is shown to prevent the winter result from being mistaken for an annual energy match.

Panel surface area uses 1.997 m² per 450 W module. Mounting clearances, row spacing, walkways and snow guards are excluded. The remaining roof area is the modelled south roof area minus the existing panel area. It is not a structural or code assessment.

A separate “severe-cloud recovery” figure estimates panels needed to recharge the battery while serving a five-day load at 0.15 kWh per panel per day. It is deliberately large and illustrates why battery recovery, not just daily generation, governs winter design.

## 8. Additional battery, inverter and physical infrastructure

Additional nominal battery:

```text
additional kWh = heat-pump daily winter electricity × autonomy days
                 ÷ (0.80 usable fraction × 0.96 discharge efficiency × 0.90 cold derating)
```

The table reports 1, 3 and 5 days. The total is the existing household battery plus the additional capacity. It is not a recommendation to install that much battery; it is a measure of the gap.

Combined peak electrical demand includes the heat-pump compressor, resistance backup, fans and baseline household peak. The existing inverter is compared with this peak. A larger inverter, load management or a non-electric heating path changes the result.

Physical implications:

- Additional panel area is compared with the remaining roof area and the conditioned floor area.
- Several homes cannot fit the additional winter-critical array on the remaining roof. A ground array, canopy or shared array would be required, with snow, wind, structure and woodland impacts.
- The additional battery needs a fire-separated, ventilated, accessible location. It is not a cupboard-sized addition.

## 9. Winter resilience

Eight synthetic scenarios are run for each home:

1. one cloudy winter day;
2. three cloudy winter days;
3. five cloudy winter days;
4. snow-covered arrays;
5. extreme cold with low solar;
6. partial battery at the start;
7. heat-pump failure;
8. loss of shared community electricity.

Household electricity is prioritised over heat-pump electricity when supply is short. Wood heat is limited by the recorded stove capacity and an assumed 8 hours per day, not 24-hour full output. The scenarios are weather-synthetic, not forecasts.

Key results:

- With a heat pump on, a single cloudy day can exhaust the existing battery in the larger homes.
- Five cloudy days produce household shortfalls, not only heating shortfalls, unless the array and battery are greatly enlarged or shared supply is available.
- Heat-pump failure is survivable only if wood backup is available and the resident can operate it.
- Snow-covered arrays produce zero generation; the battery and the non-electric heat source do the work.

## 10. Operating strategies

| Strategy | What it means | Result |
|---|---|---|
| A. Passive + wood | No heat pump. Wood covers the heating load. | Lowest electricity; depends on physical wood handling and stove capacity. |
| B. Surplus-solar heat pump | Runs only on surplus after household demand and reserve. | Good for summer cooling, shoulder-season and occasional winter daytime heat; not full winter heating. |
| C. Hybrid wood + air-source | Wood provides about 60% of annual heat; the heat pump displaces the rest. | Much smaller array and battery than full-time electric; still wood-dependent. |
| D. Full-time air-source | Heat pump is the primary heat source. | Large additional array and battery; resistance backup at extreme cold. |
| E. Full-time ground-source | Higher cold-weather efficiency, stable capacity. | Smaller array than D, but a ground loop, drilling/excavation and a larger capital project. |
| F. Passive cooling + optional mechanical | Shading, ventilation and fans first; small heat pump for extreme heat. | Cooling coincides with summer solar surplus; low additional infrastructure. |

The full-time strategies are not presented as recommendations. They are the upper bound that makes the scale of the change visible.

## 11. Passive design

The passive package tested here:

- wall U 0.18 → 0.14 W/m²K;
- roof U 0.12 → 0.09 W/m²K;
- window U 0.95 → 0.75 W/m²K;
- ACH50 reduced by 0.4;
- HRV efficiency 85% → 90%;
- shading factor 0.55 → 0.45.

It reduces annual heating by roughly 10–20%, avoids several additional panels and reduces the design load. It does not remove the need for a non-electric heat source in extreme cold, and it is not costed.

The order matters: demand reduction before generation and storage. A panel avoided is usually cheaper and lower-impact than a panel added.

## 12. Architectural implications

- Additional panels compete with roof geometry, chimneys, vents, snow shedding, maintenance access and the existing array.
- A ground array consumes clearing or garden space and can conflict with woodland preservation, fire resilience and habitat.
- A larger battery needs accessible, fire-separated, ventilated space.
- A larger inverter and service may require an electrical room and a service upgrade.
- A heat pump needs outdoor unit space, clearances, noise separation, defrost water management and snow protection.
- A ground-source loop needs drilling or excavation, which is a major intervention on Canadian Shield terrain.

These are architectural conflicts, not just equipment sizes. The project exposes them rather than expanding the roofs or clearing trees to make the numbers work.

## 13. Accessibility and resident independence

Wood heating is not appropriate for every resident. The Accessible Garden Home assessment therefore treats wood as optional, not as the assumed backup. Its result should be read as a prompt for a specific solution: a larger electrical service, a shared community heating service, a different backup fuel, or a different heating strategy altogether.

Automatic freeze protection, accessible controls, remote monitoring, maintenance arrangements and emergency heating need to be designed with residents, not assumed.

## 14. Evidence sources

Verified before publication:

- Natural Resources Canada, heat-pump guidance for the insurance industry (2024): <https://natural-resources.canada.ca/sites/nrcan/files/energy/efficiency/heat-pumps/pdf/NRCan%20IBC%20Guidance%20FINAL%20(EN)%20(GoC%20Accesibility).pdf>
- Natural Resources Canada, *Keeping the Heat In*, Section 4: comprehensive air leakage control: <https://natural-resources.canada.ca/energy-efficiency/home-energy-efficiency/keeping-heat-section-4-comprehensive-air-leakage-control-your-home>
- Environment and Climate Change Canada, Canadian Climate Normals 1991–2020, Ottawa (City): <https://climate.weather.gc.ca/climate_normals/results_1991_2020_e.html?searchType=stnName_1991&txtStationName_1991=ottawa&searchMethod=contains&climate_id=6105976&dispBack=0>
- Northeast Energy Efficiency Partnerships, cold-climate air-source heat-pump specification and product list: <https://neep.org/heating-electrification/ccashp-specification-product-list>
- Natural Resources Canada solar resource and photovoltaic references: <https://natural-resources.canada.ca/>
- European Commission PVGIS: <https://re.jrc.ec.europa.eu/pvg_tools/en/>

The heat-pump COP and capacity curves are illustrative mid-range assumptions informed by the NEEP test points, not a manufacturer's table. The climate data is for Ottawa, not the fictional site.

## 15. Known uncertainties

- Envelope U-values, airtightness, thermal bridging, gains and solar factors are assumptions, not measured or tested performance.
- The model is a steady-state daily balance, not an hourly building simulation. It does not model thermal mass, overheating, humidity, defrost water, wind-driven infiltration or part-load cycling in detail.
- Heat-pump performance varies by model, refrigerant, climate, installation and controls. The curve is not an equipment selection.
- Ground-source COP, ground temperature, loop length, pumping and geology are not designed.
- Snow, ice, drifting and panel clearing are simplified. A snow-covered array is modelled as zero output.
- Battery ageing, cold derating, inverter surge and state-of-health are simplified.
- Wood heat capacity, efficiency, real burn schedule and resident ability are assumptions.
- No costs, lifecycle carbon, refrigerant emissions or maintenance labour are calculated.
- No resident has tested the controls or lived in the homes.

## 16. Required professional reviews

- Mechanical designer: room-by-room heat loss, equipment selection, distribution, ventilation and controls.
- Electrical contractor and electrical safety authority: service, inverter, battery, grounding, rapid shutdown and inspection.
- Structural engineer: additional panel and equipment loads, roof and canopy fixing, snow drift.
- Geotechnical and hydrogeological review for any ground-source option.
- Fire and building code review for battery and plant rooms, separation, ventilation and egress.
- Accessibility consultant and disabled residents for controls, maintenance and backup arrangements.
- Cost and lifecycle assessment, including battery replacement and woodland impacts.

## 17. Reproduction

```sh
node tools/check-heat-pump.mjs
node tools/heat-pump-browser-check.mjs
```

The public assessment is at `/design-lab/heat-pumps/`. The six-home comparison is also on `/design-lab/residences/` and each architecture page. The interactive explorer keeps the baseline installation fixed and reports the incremental burden.
