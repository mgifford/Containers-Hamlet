#!/usr/bin/env node
// Deterministic tests for the residential thermal and heat-pump assessment.
//
//   node tools/check-heat-pump.mjs
//
// The tests check internal consistency and reproducibility. They do not
// validate the accuracy of the assumed U-values, airtightness, climate or
// equipment performance.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const Energy = require('../site/js/design-energy.js');
const Thermal = require('../site/js/design-thermal.js');
const Schema = require('../site/js/design-schema.js');

let passes = 0, failures = 0;
const ok = (c, m) => { if (c) { passes++; console.log('  ok   ' + m); } else { failures++; console.log('  FAIL ' + m); } };
const near = (a, b, t = 0.02) => Math.abs(a - b) <= t;
const section = (t) => console.log('\n' + t);
const clone = (v) => JSON.parse(JSON.stringify(v));

const lab = read('data/design-lab.json');
const homes = lab.concepts.filter((c) => c.role === 'hamlet-selected');
const byId = (id) => lab.concepts.find((c) => c.id === id);

section('Thermal data and geometry');
ok(homes.length === 6, 'six residences are present');
for (const h of homes) {
  ok(h.energy && h.energy.thermal, `${h.name}: a thermal model is recorded`);
  const env = Thermal.envelope(h);
  ok(env && env.conditioned_area_m2 > 0, `${h.name}: conditioned floor area is positive`);
  ok(env.total_ua_w_k > 0 && env.total_ua_w_k < 500, `${h.name}: the envelope heat-loss coefficient is plausible and positive`);
  ok(env.wall_net_m2 >= 0 && env.roof_m2 > 0 && env.floor_m2 > 0, `${h.name}: wall, roof and floor areas are present`);
  ok(env.window_m2 >= 0 && env.door_m2 >= 0, `${h.name}: window and door areas are present`);
  ok(env.volume_m3 > 0 && env.effective_ach > 0, `${h.name}: volume and effective air change rate are positive`);
  ok(env.ua_w_k > 0 && env.ventilation_w_k > 0, `${h.name}: fabric and ventilation losses are separated`);
  const v = Thermal.validate(h);
  ok(v.ok, `${h.name}: thermal validation passes${v.issues.filter((i) => i.severity === 'error').map((i) => i.message).join('; ')}`);
}

section('Heating and cooling demand');
for (const h of homes) {
  const warm = Thermal.demandAt(h, { outdoor_c: 10, indoor_c: 20, monthIndex: 4, includeSolar: true });
  const cold = Thermal.demandAt(h, { outdoor_c: -20, indoor_c: 20, monthIndex: 0, includeSolar: true });
  const colder = Thermal.demandAt(h, { outdoor_c: -30, indoor_c: 20, monthIndex: 0, includeSolar: false });
  ok(cold.heating_kwh_day > warm.heating_kwh_day, `${h.name}: colder weather increases heating demand`);
  ok(colder.peak_heating_w > cold.peak_heating_w, `${h.name}: the design peak increases at −30 °C`);
  ok(cold.heating_kwh_day > 0, `${h.name}: heating demand is positive in cold weather`);
  const summer = Thermal.demandAt(h, { outdoor_c: 30, indoor_c: 24, monthIndex: 6, includeSolar: true });
  ok(summer.cooling_kwh_day > 0, `${h.name}: cooling demand is positive at 30 °C`);
  ok(summer.peak_cooling_w > 0, `${h.name}: a cooling peak is calculated`);
  const unoccupied = Thermal.demandAt(h, { outdoor_c: -20, indoor_c: 12, monthIndex: 0, occupied: false, includeSolar: true });
  ok(unoccupied.heating_kwh_day < cold.heating_kwh_day, `${h.name}: a lower unoccupied setpoint reduces heating demand`);
  const mon = Thermal.monthly(h);
  ok(mon.months.length === 12, `${h.name}: twelve monthly heating estimates are produced`);
  ok(mon.annual_heating_kwh > 0 && mon.annual_cooling_kwh > 0, `${h.name}: annual heating and cooling are positive`);
  ok(mon.months[0].heating_kwh > mon.months[6].heating_kwh, `${h.name}: January heating exceeds July heating`);
  ok(mon.design_heat_load_w > 0, `${h.name}: a design heat load is calculated`);
}

section('Heat-pump performance and incremental electricity');
for (const h of homes) {
  const t = Thermal.thermalFor(h);
  const at10 = Thermal.heatPumpPerformance(h, 10, 'air-source');
  const atMinus20 = Thermal.heatPumpPerformance(h, -20, 'air-source');
  ok(at10.cop > atMinus20.cop, `${h.name}: COP falls as outdoor temperature falls`);
  ok(at10.capacity_kw > atMinus20.capacity_kw, `${h.name}: available capacity falls as outdoor temperature falls`);
  const gs = Thermal.heatPumpPerformance(h, -20, 'ground-source');
  ok(gs.cop > atMinus20.cop, `${h.name}: the ground-source COP is higher in cold weather in this model`);
  const hp = Thermal.heatPumpMonthly(h, { type: 'air-source' });
  ok(hp.annual_heating_electric_kwh > 0 && hp.annual_cooling_electric_kwh > 0, `${h.name}: heat-pump electricity is positive`);
  ok(near(hp.annual_total_electric_kwh, hp.annual_heating_electric_kwh + hp.annual_cooling_electric_kwh, 1), `${h.name}: heating and cooling electricity add without double counting`);
  ok(hp.months.every((m) => m.heating_electric_kwh >= 0 && m.cooling_electric_kwh >= 0), `${h.name}: no negative heat-pump electricity`);
  const base = Energy.summary(h);
  const sum = Thermal.summary(h);
  ok(sum.household.consumption.summer_daily_kwh === base.consumption.summer_daily_kwh, `${h.name}: the baseline household demand is unchanged`);
  ok(sum.household.panels === base.panels, `${h.name}: the existing reference array is unchanged`);
  const table = Thermal.temperatureTable(h);
  ok(table.length === 6, `${h.name}: six outdoor temperature scenarios are assessed`);
  ok(table.every((r) => r.heating_kwh_day >= 0 && r.electrical_kwh_day >= 0), `${h.name}: temperature results are non-negative`);
  ok(table[0].heating_kwh_day <= table[5].heating_kwh_day, `${h.name}: heating demand is not higher at +10 °C than at −30 °C`);
  ok(table[5].electrical_kwh_day > table[0].electrical_kwh_day, `${h.name}: heat-pump electricity is higher at −30 °C than at +10 °C`);
}

section('Additional panels and battery');
for (const h of homes) {
  const s = Thermal.summary(h);
  const p = s.additional.panels_ashp;
  const b = s.additional.battery_ashp;
  ok(p.additional_panels > 0, `${h.name}: full-time heat-pump heating needs additional panels`);
  ok(p.total_required_winter >= p.existing_panels, `${h.name}: total required panels are not fewer than the existing array`);
  ok(p.additional_panels === Math.max(0, p.total_required_winter - p.existing_panels), `${h.name}: additional panels are the gap beyond the existing array`);
  ok(near(p.additional_area_m2, p.additional_panels * 1.997, 0.1), `${h.name}: additional panel area uses the 2 m² reference module`);
  ok(p.heat_pump_panels_winter >= p.heat_pump_panels_annual, `${h.name}: the winter-critical panel count is not lower than the annual count`);
  ok(p.fits_existing_roof === (p.additional_area_m2 <= p.available_roof_area_m2 + 0.01), `${h.name}: the roof-fit flag matches the area comparison`);
  ok(b.one_day_kwh < b.three_day_kwh && b.three_day_kwh < b.five_day_kwh, `${h.name}: additional battery increases with autonomy days`);
  ok(b.total_nominal_three_day_kwh === b.existing_nominal_kwh + b.three_day_kwh, `${h.name}: total battery is existing plus additional`);
  ok(b.three_day_kwh > 0, `${h.name}: three-day heat-pump storage is positive`);
  const inv = s.additional.inverter;
  ok(inv.total_peak_kw > 0 && inv.total_peak_kw >= inv.heat_pump_peak_kw, `${h.name}: combined peak includes the heat pump`);
}
ok(homes.every((h) => Thermal.summary(h).additional.panels_ashp.available_roof_area_m2 >= 0), 'remaining roof areas are non-negative');

section('Strategies and passive design');
for (const h of homes) {
  const s = Thermal.summary(h);
  const st = s.strategies.strategies;
  ok(st.length === 6, `${h.name}: six operating strategies are compared`);
  ok(st.find((x) => x.id === 'A').hp_electric_kwh === 0, `${h.name}: the passive/wood baseline uses no heat-pump electricity`);
  ok(st.find((x) => x.id === 'B').additional_panels === 0, `${h.name}: surplus-solar operation does not add panels in this model`);
  ok(st.find((x) => x.id === 'C').hp_electric_kwh < st.find((x) => x.id === 'D').hp_electric_kwh, `${h.name}: the hybrid uses less electricity than full-time heating`);
  ok(st.find((x) => x.id === 'D').additional_panels === s.additional.panels_ashp.additional_panels, `${h.name}: the full-time strategy uses the headline panel count`);
  ok(st.find((x) => x.id === 'E').hp_electric_kwh < st.find((x) => x.id === 'D').hp_electric_kwh, `${h.name}: the ground-source case uses less electricity than the air-source case`);
  const pas = s.passive;
  ok(pas.improved.annual_heating_kwh < pas.baseline.annual_heating_kwh, `${h.name}: the passive package reduces annual heating`);
  ok(pas.improved.design_load_w < pas.baseline.design_load_w, `${h.name}: the passive package reduces the design load`);
  ok(pas.reduction.panels_avoided >= 0 && pas.reduction.hp_electric_kwh > 0, `${h.name}: passive design avoids heat-pump electricity and panels`);
  ok(pas.measures.length >= 5, `${h.name}: passive measures are listed individually`);
}

section('Resilience and energy conservation');
for (const h of homes) {
  const s = Thermal.summary(h);
  const r = s.resilience.scenarios;
  ok(r.length === 8, `${h.name}: eight heat-pump resilience scenarios are produced`);
  ok(r.every((x) => x.end_soc_pct >= 0 && x.end_soc_pct <= 100), `${h.name}: scenario state of charge stays within 0–100%`);
  ok(r.every((x) => x.unserved_household_kwh >= 0 && x.unserved_heat_kwh >= 0), `${h.name}: unserved demand is not negative`);
  const snow = r.find((x) => x.id === 'snow');
  ok(snow.generation_kwh_day === 0, `${h.name}: snow-covered arrays produce zero generation`);
  const five = r.find((x) => x.id === 'cloud-5');
  ok(five.unserved_electric_kwh >= 0, `${h.name}: the five-day cloud scenario has a bounded result`);
  ok(r.every((x) => ['served', 'heating shortfall', 'household shortfall'].indexOf(x.status) >= 0), `${h.name}: scenarios use the documented status labels`);
}

section('Data hygiene, schema and documentation');
for (const h of homes) {
  ok(!/https?:\/\//.test(JSON.stringify(h.energy.thermal)), `${h.name}: thermal data contains no remote references`);
  ok(h.energy.thermal.heat_pump && h.energy.thermal.heat_pump.rated_heating_kw > 0, `${h.name}: a heat-pump capacity is recorded`);
  ok(typeof h.energy.thermal.wood_heat.available === 'boolean', `${h.name}: wood-heat availability is explicit`);
  ok(!/assumes? (a )?(ventilator|dialysis|mobility scooter|powered wheelchair)/i.test(JSON.stringify(h.energy.thermal)), `${h.name}: the thermal model does not assume a particular medical device`);
}
for (const c of homes) {
  const v = Schema.validateSchema(c);
  ok(v.ok, `${c.id}: schema validation still passes with thermal data`);
}
ok(fs.existsSync(path.join(ROOT, 'docs/heat-pump-energy-assessment.md')), 'the heat-pump assessment documentation exists');
ok(Thermal.MONTHLY_TEMP.length === 12, 'twelve monthly climate normals are recorded');
ok(Thermal.TEMP_SCENARIOS.length === 6, 'six temperature test conditions are recorded');
ok(Thermal.ASHP_POINTS.every((p, i, a) => i === 0 || p.cop <= a[i - 1].cop), 'the air-source COP curve decreases monotonically with temperature');

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
