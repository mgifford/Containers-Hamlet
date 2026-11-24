#!/usr/bin/env node
// Deterministic tests for the residential energy model, panel geometry,
// seasonal loads, battery dispatch and resilience scenarios.
//
//   node tools/check-energy.mjs
//
// No network. No measured data. These tests check that the documented model is
// internally consistent and reproducible; they do not validate its accuracy.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const Energy = require('../site/js/design-energy.js');
const Schema = require('../site/js/design-schema.js');
const Model = require('../site/js/design-model.js');
const Illustration = require('../site/js/design-illustration.js');
const { validateExtensions, VERIFIED_TITLES } = require('./lib/patterns.mjs');

let passes = 0, failures = 0;
const ok = (cond, msg) => { if (cond) { passes++; console.log('  ok   ' + msg); } else { failures++; console.log('  FAIL ' + msg); } };
const near = (a, b, t = 0.02) => Math.abs(a - b) <= t;
const section = (t) => console.log('\n' + t);
const clone = (v) => JSON.parse(JSON.stringify(v));

const lab = read('data/design-lab.json');
const site = read('data/site.json');
const homes = lab.concepts.filter((c) => c.role === 'hamlet-selected');
const byId = (id) => lab.concepts.find((c) => c.id === id);
const expected = {
  'hamlet-woodland-cottage': 8,
  'hamlet-offset-stack': 10,
  'hamlet-courtyard-residence': 12,
  'hamlet-cross-stacked-retreat': 16,
  'hamlet-accessible-garden-home': 12,
  'hamlet-solar-studio-stack': 10
};

section('Reference module and installed capacity');
ok(Energy.REFERENCE_MODULE.watts === 450, 'the reference module is 450 W');
ok(near(Energy.REFERENCE_MODULE.length_m, 1.762, 0.001) && near(Energy.REFERENCE_MODULE.width_m, 1.134, 0.001), 'reference module dimensions are about 1.76 × 1.13 m');
ok(near(Energy.REFERENCE_MODULE.area_m2, 1.997, 0.002), 'reference module area is about 2 m²');
ok(homes.length === 6, 'six hamlet-selected residences are present');
let totalPanels = 0, totalKwp = 0;
for (const h of homes) {
  const n = Energy.panelCount(h);
  const geo = Energy.panelGeometry(h);
  totalPanels += n;
  totalKwp += Energy.installedKwp(h);
  ok(n === expected[h.id], h.name + ' has ' + expected[h.id] + ' panels');
  ok(geo.total_panels === n, h.name + ': placed panel count matches the declared count');
  ok(near(geo.capacity_kwp, n * 450 / 1000, 0.001), h.name + ': installed capacity matches panel count × 450 W');
  ok(near(geo.area_m2, n * 1.997, 0.03), h.name + ': panel surface area matches the reference module');
  ok(geo.panels.every((p) => p.corners.length === 4 && p.corners.every((c) => c.length === 3 && c.every(Number.isFinite))), h.name + ': every panel has four finite 3D corners');
  ok(geo.panels.every((p) => p.watts === 450 && p.area_m2 > 1.9 && p.area_m2 < 2.1), h.name + ': every panel carries its rated power and area');
}
ok(totalPanels === 68, 'the six reference systems total 68 panels');
ok(near(totalKwp, 30.6, 0.05), 'the six reference systems total 30.6 kWp');

section('Panel geometry, movement and validation');
const cottage = byId('hamlet-woodland-cottage');
const cottageGeo = Energy.panelGeometry(cottage);
const moved = clone(cottage);
moved.modules[0].position_m = [2, 0];
const movedGeo = Energy.panelGeometry(moved);
ok(movedGeo.total_panels === cottageGeo.total_panels, 'moving a module does not change the installed panel count');
ok(near(movedGeo.panels[0].centre[0] - cottageGeo.panels[0].centre[0], 2, 0.01), 'moving a module moves its panels with the canonical geometry');
ok(Energy.validate(moved).ok, 'a moved module does not create invalid panel geometry');

const overlap = clone(cottage);
overlap.energy.solar.arrays.push({
  id: 'pv-test', label: 'Overlap test', module_count: 1, rows: 1, columns: 1, orientation: 'portrait',
  tilt_deg: 24, azimuth_deg: 180, mounting: 'roof-flush', surface: { kind: 'roof', module: 'm1', slope: 'south' },
  edge_clearance_m: 0.15, standoff_m: 0.08, electrical_group: 'test', offset_m: 0,
  snow: { guards: false, shed_to: 'south', discharge_clear: true }, maintenance: { access: 'test', walkway_m: 0.5 }
});
const overlapCheck = Energy.validate(overlap);
ok(!overlapCheck.ok && overlapCheck.issues.some((i) => i.code === 'panel-overlap'), 'overlapping panels are rejected');

const tooWide = clone(cottage);
tooWide.energy.solar.arrays[0].module_count = 16;
tooWide.energy.solar.arrays[0].rows = 1;
tooWide.energy.solar.arrays[0].columns = 16;
const wideCheck = Energy.validate(tooWide);
ok(!wideCheck.ok && wideCheck.issues.some((i) => i.code === 'array-too-wide' || i.code === 'panel-outside-surface'), 'an array that does not fit its roof is rejected');

const badTilt = clone(cottage);
badTilt.energy.solar.arrays[0].tilt_deg = 120;
ok(!Energy.validate(badTilt).ok, 'an invalid tilt is rejected');
const badAzimuth = clone(cottage);
badAzimuth.energy.solar.arrays[0].azimuth_deg = 400;
ok(!Energy.validate(badAzimuth).ok, 'an invalid azimuth is rejected');
const badBattery = clone(cottage);
badBattery.energy.battery.usable_kwh = 20;
ok(!Energy.validate(badBattery).ok, 'usable battery capacity greater than nominal is rejected');

section('Monthly generation and orientation');
for (const h of homes) {
  const g = Energy.monthlyGeneration(h);
  ok(g.months.length === 12, h.name + ': twelve monthly estimates are produced');
  ok(g.months.every((m) => Number.isFinite(m.kwh) && m.kwh >= 0), h.name + ': every monthly estimate is finite and non-negative');
  ok(g.annual_kwh > 0 && g.specific_yield_kwh_per_kwp > 500, h.name + ': annual yield is plausible for the illustrative resource');
  const summer = g.months.filter((m) => m.season === 'summer');
  const winter = g.months.filter((m) => m.season === 'winter');
  ok(avg(summer, 'kwh_per_day') > avg(winter, 'kwh_per_day'), h.name + ': summer daily generation exceeds winter');
  ok(g.months.every((m) => m.shade_pct >= 0 && m.shade_pct <= 95), h.name + ': shading losses are bounded');
}
const genA = Energy.monthlyGeneration(cottage);
const genB = Energy.monthlyGeneration(cottage);
ok(JSON.stringify(genA) === JSON.stringify(genB), 'generation is deterministic for the same input');
ok(Energy.monthlyIrradiance(45.4, 40, 180, 11).kwh_m2_day > Energy.monthlyIrradiance(45.4, 40, 0, 11).kwh_m2_day, 'a south-facing plane receives more December irradiation than a north-facing plane');
ok(Energy.monthlyIrradiance(45.4, 65, 180, 11).kwh_m2_day > Energy.monthlyIrradiance(45.4, 25, 180, 11).kwh_m2_day, 'a steep December array out-performs a shallow one at this latitude');
const noSnow = Energy.monthlyGeneration(cottage, { ignore_snow: true });
ok(noSnow.months[11].kwh > Energy.monthlyGeneration(cottage).months[11].kwh, 'snow availability reduces the modelled December output');
const northArray = clone(cottage);
northArray.energy.solar.arrays[0].azimuth_deg = 0;
ok(Energy.averageDailyGeneration(northArray, 'winter') < Energy.averageDailyGeneration(cottage, 'winter'), 'a north-facing array produces less winter energy than a south-facing one');
function avg(list, key) { return list.reduce((s, x) => s + x[key], 0) / Math.max(1, list.length); }

section('Seasonal load model');
const bands = {
  'hamlet-woodland-cottage': [2.5, 3.5],
  'hamlet-offset-stack': [4.5, 6],
  'hamlet-courtyard-residence': [4.5, 6],
  'hamlet-cross-stacked-retreat': [6, 8.1],
  'hamlet-accessible-garden-home': [4.5, 6],
  'hamlet-solar-studio-stack': [3.5, 4.7]
};
for (const h of homes) {
  const s = Energy.summary(h);
  const summer = Energy.loadsForProfile(h, 'summer');
  const winter = Energy.loadsForProfile(h, 'winter-full-time');
  const intermittent = Energy.loadsForProfile(h, 'winter-intermittent');
  const unoccupied = Energy.loadsForProfile(h, 'unoccupied-winter');
  ok(summer.daily_kwh > 0 && winter.daily_kwh > 0, h.name + ': summer and winter loads are positive');
  ok(summer.essential_daily_kwh <= summer.daily_kwh + 0.001 && winter.essential_daily_kwh <= winter.daily_kwh + 0.001, h.name + ': essential loads do not exceed total loads');
  ok(intermittent.daily_kwh <= winter.daily_kwh + 0.001, h.name + ': intermittent winter use is not higher than full-time use');
  ok(unoccupied.daily_kwh >= 0.2 && unoccupied.daily_kwh <= 0.8, h.name + ': unoccupied monitoring is within the 0.2–0.8 kWh/day band');
  ok(s.consumption.summer_daily_kwh >= bands[h.id][0] && s.consumption.summer_daily_kwh <= bands[h.id][1], h.name + ': summer consumption is within the documented band');
  ok(s.consumption.winter_full_time_daily_kwh >= bands[h.id][0] && s.consumption.winter_full_time_daily_kwh <= bands[h.id][1] + 0.2, h.name + ': winter consumption is within the documented band');
  ok(s.consumption.winter_intermittent_daily_kwh < s.consumption.winter_full_time_daily_kwh, h.name + ': intermittent winter use is lower than full-time use');
  ok(h.energy.loads.every((l) => l.source && l.confidence && l.class && l.hours && typeof l.rated_w === 'number'), h.name + ': every load records power, hours, class, source and confidence');
  const sumRows = summer.rows.reduce((t, r) => t + r.daily_kwh, 0);
  ok(near(sumRows, summer.daily_kwh, 0.01), h.name + ': daily consumption equals the sum of its load rows');
}
const onePerson = Energy.summary(byId('hamlet-woodland-cottage')).consumption.summer_daily_kwh;
const fourPerson = Energy.summary(byId('hamlet-cross-stacked-retreat')).consumption.summer_daily_kwh;
ok(fourPerson > onePerson, 'a four-person home consumes more than a one-person cottage');
const scaled = Energy.applyOverrides(byId('hamlet-woodland-cottage'), { occupants: 3 });
ok(Energy.summary(scaled).consumption.summer_daily_kwh > onePerson, 'adding occupants increases the modelled consumption');
const smaller = Energy.applyOverrides(byId('hamlet-woodland-cottage'), { panelCount: 6 });
ok(Energy.summary(smaller).panels === 6 && near(Energy.summary(smaller).capacity_kwp, 2.7, 0.01), 'changing the panel count changes the installed capacity consistently');
const biggerBattery = Energy.applyOverrides(byId('hamlet-woodland-cottage'), { batteryKwh: 20 });
ok(Energy.summary(biggerBattery).battery.nominal_kwh === 20 && near(Energy.summary(biggerBattery).battery.usable_kwh, 18, 0.05), 'changing the battery changes nominal and usable capacity together');

section('Battery dispatch and energy conservation');
const limits = Energy.batteryLimits(cottage.energy.battery);
ok(limits.usable > 0 && limits.usable <= limits.nominal, 'battery limits keep usable capacity within nominal');
const noSun = Energy.simulateDay({ design: cottage, profileId: 'winter-full-time', generationKwh: 0, startKwh: limits.maxKwh, shared: false, monthIndex: 0 });
ok(noSun.end_kwh >= limits.minKwh - 0.01, 'the battery does not fall below its minimum SOC');
ok(noSun.end_kwh < noSun.start_kwh && noSun.discharge_kwh > 0, 'a zero-generation day discharges the battery');
ok(Math.abs(noSun.conservation_error_kwh) < 0.05, 'a zero-generation day conserves energy');
const threeDayNoSun = Energy.simulateScenario(cottage, { id: 'test-snow', label: 'Three snow days', season: 'winter', days: 3, solar_factor: 0, load_profile: 'winter-full-time', snow: true, shared: false });
ok(threeDayNoSun.total.unserved > 0, 'three zero-generation days leave unserved demand');
const sunny = Energy.simulateDay({ design: cottage, profileId: 'summer', generationKwh: 30, startKwh: limits.minKwh, shared: false, monthIndex: 6 });
ok(sunny.charge_kwh > 0 && sunny.curtailed_kwh > 0, 'surplus solar charges the battery and then curtails');
ok(sunny.end_kwh <= limits.maxKwh + 0.01, 'the battery does not exceed its maximum SOC');
ok(Math.abs(sunny.conservation_error_kwh) < 0.05, 'a high-generation day conserves energy');
const essentialOnly = Energy.simulateDay({ design: cottage, profileId: 'winter-full-time', generationKwh: 0, startKwh: limits.maxKwh, shared: false, monthIndex: 0, essential_only: true });
ok(essentialOnly.unserved_kwh <= noSun.unserved_kwh, 'essential-only operation does not increase unserved demand');

section('Resilience scenarios');
for (const h of homes) {
  const list = Energy.scenarios(h);
  ok(list.length === 10, h.name + ': ten resilience scenarios are produced');
  ok(list.every((s) => s.conservation_error_kwh == null || Math.abs(s.conservation_error_kwh) < 0.1), h.name + ': every scenario conserves energy');
  ok(list.every((s) => s.end_soc_pct >= 0 && s.end_soc_pct <= 100), h.name + ': every scenario keeps the SOC between 0 and 100%');
  ok(list.every((s) => s.synthetic === true), h.name + ': scenarios are labelled synthetic');
  const three = list.find((s) => s.id === 'winter-cloud-3');
  const five = list.find((s) => s.id === 'winter-cloud-5');
  const snow = list.find((s) => s.id === 'snow-covered');
  ok(five.total.unserved + 0.01 >= three.total.unserved, h.name + ': five cloudy days are not better than three');
  ok(snow.generation_daily_kwh === 0, h.name + ': a snow-covered array produces zero generation');
  ok(three.end_soc_pct >= five.end_soc_pct - 0.01, h.name + ': the battery state of charge after five cloudy days is not higher than after three');
}
const sharedOn = Energy.simulateScenario(cottage, { id: 'test-cloud', label: 'Test cloud', season: 'winter', days: 5, solar_factor: 0.25, load_profile: 'winter-full-time', shared: true });
const sharedOff = Energy.simulateScenario(cottage, { id: 'test-cloud', label: 'Test cloud', season: 'winter', days: 5, solar_factor: 0.25, load_profile: 'winter-full-time', shared: false });
ok(sharedOn.total.unserved <= sharedOff.total.unserved + 0.01, 'community backup does not increase unserved demand');
ok(sharedOff.total.unserved > 0, 'a five-day cloudy period without shared supply creates a shortfall for the cottage');
const essential = Energy.simulateScenario(cottage, { id: 'test-cloud', label: 'Test cloud', season: 'winter', days: 5, solar_factor: 0.25, load_profile: 'winter-full-time', shared: false, essential_only: true });
ok(essential.total.unserved <= sharedOff.total.unserved + 0.01, 'essential-only operation reduces unserved demand');
const scA = Energy.scenarios(cottage);
const scB = Energy.scenarios(cottage);
ok(JSON.stringify(scA) === JSON.stringify(scB), 'scenarios are deterministic');

section('Summary and comparisons');
for (const h of homes) {
  const s = Energy.summary(h);
  ok(s.panels === expected[h.id] && s.capacity_kwp > 0, h.name + ': summary reports panels and installed capacity');
  ok(s.generation.summer_daily_kwh > s.generation.winter_daily_kwh, h.name + ': summary reports seasonal generation');
  ok(s.consumption.summer_daily_kwh > 0 && s.consumption.winter_daily_kwh > 0, h.name + ': summary reports seasonal consumption');
  ok(s.battery.nominal_kwh > 0 && s.battery.usable_kwh > 0, h.name + ': summary reports battery capacity');
  ok(s.suitable_patterns.length > 0 && s.limitations.length > 0, h.name + ': summary reports suitable patterns and limitations');
  ok(s.supplementary_daily_kwh >= 0, h.name + ': summary reports a supplementary electricity requirement');
}
const summaries = homes.map((h) => Energy.summary(h));
ok(summaries.reduce((t, s) => t + s.panels, 0) === 68, 'the summary set totals 68 panels');
ok(summaries.reduce((t, s) => t + s.capacity_kwp, 0) > 30 && summaries.reduce((t, s) => t + s.capacity_kwp, 0) < 31, 'the summary set totals about 30.6 kWp');

section('Schema, migration and data hygiene');
for (const c of lab.concepts) {
  const v = Schema.validateSchema(c);
  ok(v.ok, c.id + ': schema validation passes');
}
const v1 = clone(cottage);
v1.schema = Schema.SCHEMA_V1;
const migrated = Schema.migrateAny(v1);
ok(migrated.design.schema === Schema.SCHEMA && migrated.design.energy && migrated.design.energy.solar.arrays.length > 0, 'a v1 design migrates to v2 and preserves the energy model');
const v01 = { schema: Schema.LEGACY_SCHEMA, modules: [{ id: 'm1', type: '40ft', position_m: [0, 0], rotation_deg: 0 }], porches: [], decks: [], connections: [] };
const migrated01 = Schema.migrateAny(v01);
ok(migrated01.design.schema === Schema.SCHEMA && migrated01.design.energy === null, 'a v0.1 prototype still migrates and has no invented energy model');
ok(lab.concepts.filter((c) => c.role === 'hamlet-selected').every((c) => !/https?:\/\//.test(JSON.stringify(c.energy))), 'residential energy data contains no remote references');
ok(lab.concepts.filter((c) => c.role === 'hamlet-selected').every((c) => c.energy.scenarios.length === 10), 'every residence records ten resilience scenarios');
ok(lab.concepts.filter((c) => c.role === 'hamlet-selected').every((c) => c.energy.loads.every((l) => !/medical device is assumed|requires a ventilator|mobility scooter/i.test(l.notes || ''))), 'the load model does not assume particular medical or mobility equipment');

section('Illustration and pattern-language integration');
for (const h of homes) {
  const scene = Illustration.sceneSpec(h, Illustration.defaultConfig(h), site);
  const geo = Energy.panelGeometry(h);
  ok(scene.solar && scene.solar.totalPanels === geo.total_panels, h.name + ': the illustration scene carries the exact installed panel count');
  ok(scene.solar.visiblePanels <= scene.solar.totalPanels, h.name + ': the visible panel count never exceeds the installed count');
  ok(scene.prompt.text.includes('exactly ' + geo.total_panels + ' installed'), h.name + ': the illustration prompt states the exact panel count');
  ok(!/invent a suitable number/i.test(scene.prompt.text), h.name + ': the prompt does not ask the image system to invent a panel count');
  ok(scene.validation.ok, h.name + ': the solar-aware scene validates');
}
const patterns = read('data/patterns/patterns.json');
const ext = validateExtensions(patterns);
ok(ext.ok, 'the ten original energy patterns validate');
ok(patterns.extensions.patterns.length === 10, 'ten original energy-pattern extensions are published');
ok(/not Christopher Alexander/i.test(patterns.extensions.attribution), 'the extension attribution disclaims Christopher Alexander authorship');
ok(patterns.extensions.patterns.every((p) => p.alexander.every((a) => VERIFIED_TITLES[a.number] === a.title)), 'every extension link uses a verified Alexander title');
ok(patterns.extensions.patterns.every((p) => p.evaluationQuestions.length >= 2 && p.unresolved), 'every extension records questions and unresolved matters');
ok(!patterns.extensions.patterns.some((p) => patterns.patterns.some((q) => q.title.toLowerCase() === p.title.toLowerCase())), 'no extension reuses an Alexander pattern title');

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
