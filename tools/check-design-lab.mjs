#!/usr/bin/env node
// Static and schema checks for the Container Home Design Lab.
// Usage: node tools/check-design-lab.mjs
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { fromCabinA, toCabinAProposal } from './lib/design-adapter.mjs';

const require = createRequire(import.meta.url);
const Schema = require('../site/js/design-schema.js');
const Model = require('../site/js/design-model.js');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(ROOT, p));
let passes = 0, failures = 0;
function ok(cond, msg) { if (cond) { passes++; console.log('  ok   ' + msg); } else { failures++; console.log('  FAIL ' + msg); } }
const section = (t) => console.log('\n' + t);
const near = (a, b, t = 0.01) => Math.abs(a - b) <= t;

section('Concept data');
const data = JSON.parse(read('data/design-lab.json'));
ok(data.concepts.length === 10, 'nine home concepts and the common lodge are present');
ok(['One container', 'Two containers', 'Three containers'].every((g) => data.concepts.filter((c) => c.group === g).length === 3) && data.concepts.filter((c) => c.group === 'Common lodge').length === 1, 'three homes in each module-count group plus the common lodge');
ok(data.concepts.filter((c) => c.editable).map((c) => c.id).join(',') === 'woodland-retreat,l-shaped-haven,woodland-courtyard', 'the three editable presets are the required ones');
ok(data.concepts.filter((c) => !c.editable).length === 7, 'six home concepts and the lodge are marked inspiration-only');
ok(data.concepts.every((c) => c.schema === Schema.SCHEMA), 'every concept uses the versioned v1 schema');
for (const c of data.concepts) {
  const v = Schema.validateSchema(c);
  const a = Model.assess(c);
  ok(v.ok, `${c.id}: schema validates${v.errors.length ? ': ' + v.errors.map((e) => e.message).join('; ') : ''}`);
  ok(a.ok, `${c.id}: no invalid geometry${a.items.filter((i) => i.category === 'invalid').map((i) => i.message).join('; ')}`);
  ok(c.modules.length === (c.group === 'One container' ? 1 : c.group === 'Two containers' ? 2 : 3), `${c.id}: module count matches its group`);
  ok(c.modules.every((m) => m.openings && m.zones && m.structure && m.insulation && m.cladding && m.roof), `${c.id}: modules carry openings, zones, structure, insulation, cladding and roof`);
  ok(Array.isArray(c.trellises), `${c.id}: trellis array is present`);
  ok(!JSON.stringify(c).match(/https?:\/\//), `${c.id}: concept data has no remote references`);
}

section('Deterministic views and gallery outputs');
for (const c of data.concepts) {
  const plan1 = Model.renderPlan(c, { idPrefix: 'concept-' + c.id + '-plan' });
  const plan2 = Model.renderPlan(c, { idPrefix: 'concept-' + c.id + '-plan' });
  const ext1 = Model.renderAxo(c, { idPrefix: 'concept-' + c.id + '-exterior' });
  const ext2 = Model.renderAxo(c, { idPrefix: 'concept-' + c.id + '-exterior' });
  const cut1 = Model.renderAxo(c, { idPrefix: 'concept-' + c.id + '-cutaway', mode: 'cutaway' });
  const porch1 = Model.renderAxo(c, { idPrefix: 'concept-' + c.id + '-porch', focus: 'outdoor' });
  const winter1 = Model.renderAxo(c, { idPrefix: 'concept-' + c.id + '-winter', season: 'winter' });
  ok(plan1 === plan2, `${c.id}: plan SVG is deterministic`);
  ok(ext1 === ext2 && cut1.length > 2000, `${c.id}: exterior and cutaway render deterministically`);
  ok(porch1 === Model.renderAxo(c, { idPrefix: 'concept-' + c.id + '-porch', focus: 'outdoor' }) && winter1 === Model.renderAxo(c, { idPrefix: 'concept-' + c.id + '-winter', season: 'winter' }), `${c.id}: porch and winter views render deterministically`);
  ok(c.thermal && c.thermal.roof_insulation_mm > 0 && c.thermal.floor_insulation_mm > 0, `${c.id}: thermal envelope values are present`);
  for (const [kind, svg] of [['plan', plan1], ['exterior', ext1], ['cutaway', cut1], ['porch', porch1], ['winter', winter1]]) {
    ok(/role="img"/.test(svg) && /<title id="/.test(svg) && /<desc id="/.test(svg) && /CC BY-SA 4\.0/.test(svg), `${c.id} ${kind}: accessible SVG with licence notice`);
    ok(!/<script|https?:\/\//i.test(svg.replace(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, '')), `${c.id} ${kind}: no scripts or remote references`);
    ok(!/<[^>]+\bfill="[^"]*"[^>]*\bfill="/.test(svg), `${c.id} ${kind}: no duplicate XML attributes`);
    ok(exists(`site/design-lab/views/${c.id}-${kind}.svg`), `${c.id} ${kind}: generated file exists`);
    ok(read(`site/design-lab/views/${c.id}-${kind}.svg`) === svg, `${c.id} ${kind}: committed SVG matches a fresh render`);
  }
  ok(exists(`site/design-lab/data/${c.id}.json`), `${c.id}: downloadable JSON exists`);
  ok(JSON.parse(read(`site/design-lab/data/${c.id}.json`)).id === c.id, `${c.id}: downloaded JSON matches the source`);
  const plan = read(`site/design-lab/views/${c.id}-plan.svg`);
  ok(c.modules.every((m) => plan.includes(m.id.toUpperCase())), `${c.id}: plan labels every container`);
  ok(/ m overall/.test(plan), `${c.id}: plan includes overall dimensions`);
}

section('Gallery and editor pages');
const gallery = read('site/design-lab/index.html');
ok((gallery.match(/class="concept-card"/g) || []).length === 10, 'gallery has ten concept cards, including the common lodge');
ok((gallery.match(/class="concept-badge editable"/g) || []).length === 3, 'gallery marks three editable cards');
ok((gallery.match(/Inspiration only/g) || []).length >= 7, 'gallery labels six inspiration-only homes and the lodge');
ok((gallery.match(/<img /g) || []).length >= 9 && [...gallery.matchAll(/<img [^>]*>/g)].every((m) => /alt="[^"]{12,}"/.test(m[0]) && /width="\d+"/.test(m[0]) && /height="\d+"/.test(m[0])), 'gallery images have alt text, width and height');
ok(gallery.includes('editor/?preset=woodland-retreat') && gallery.includes('editor/?preset=l-shaped-haven') && gallery.includes('editor/?preset=woodland-courtyard'), 'gallery links to all three editable presets');
ok(gallery.includes('LICENSE.txt') && gallery.includes('CONTENT-LICENSE.md'), 'gallery links its licences');
const editor = read('site/design-lab/editor/index.html');
ok(editor.includes('id="controls"') && editor.includes('id="plan"') && editor.includes('id="exterior"') && editor.includes('id="cutaway"'), 'editor has controls and three synchronized views');
ok(editor.includes('id="warning-list"') && editor.includes('id="site-preview"') && editor.includes('id="summary"'), 'editor has checks, hamlet preview and summary');
ok(editor.includes('<noscript>'), 'editor has a no-JavaScript message');
ok(editor.includes('js/design-schema.js') && editor.includes('js/design-model.js') && editor.includes('concepts.js') && editor.includes('site-data.js'), 'editor loads the shared schema, model and generated data');
ok(!/<script[^>]+src="https?:/i.test(editor) && !/<link[^>]+href="https?:/i.test(editor), 'editor has no remote scripts or styles');
ok(exists('site/design-lab/LICENSE.txt') && /GNU AFFERO GENERAL PUBLIC LICENSE/.test(read('site/design-lab/LICENSE.txt')) && /Version 3/.test(read('site/design-lab/LICENSE.txt')), 'full AGPL text is included');
ok(exists('site/design-lab/CONTENT-LICENSE.md') && /CC BY-SA 4\.0/.test(read('site/design-lab/CONTENT-LICENSE.md')), 'Design Lab content licence is present');
ok(exists('site/design-lab/THIRD-PARTY-NOTICES.md'), 'third-party notices file is present');

section('Architectural galleries and comparison');
for (const c of data.concepts) {
  const page = read(`site/design-lab/architecture/${c.id}/index.html`);
  ok(/data-slideshow/.test(page) && (page.match(/<img /g) || []).length >= 5 && (page.match(/class="slide"/g) || []).length === 5, `${c.id}: five-image architectural page exists`);
  ok((page.match(/class="slide"/g) || []).length === 5 && /data-slide-prev/.test(page) && /data-slide-next/.test(page) && /data-slide-all/.test(page), `${c.id}: slideshow has five slides and visible controls`);
  ok(/data-title="Exterior architectural view"/.test(page) && /data-title="Dimensioned concept floor plan"/.test(page) && /data-title="Interior roof-off cutaway"/.test(page) && /data-title="Screened porch or deck view"/.test(page) && /data-title="Winter exterior view"/.test(page), `${c.id}: gallery has all five required views`);
  ok(/Geometry-backed drawing/.test(page) && /Illustrative study/.test(page) && /<noscript>/.test(page), `${c.id}: distinguishes drawing types and explains the no-JS fallback`);
  ok(/Summer and winter/.test(page) && /Approximate window exposure/.test(page) && /Envelope assembly/.test(page) && /Vegetation systems/.test(page), `${c.id}: seasonal, exposure, envelope and vegetation sections are present`);
  ok(!/setInterval|setTimeout/.test(read('site/design-lab/architecture.js')), `${c.id}: slideshow has no auto-advance timer`);
}
ok(exists('site/design-lab/architecture.css') && exists('site/design-lab/architecture.js') && !/<script[^>]+src="https?:/i.test(read('site/design-lab/architecture.css')), 'architectural gallery styles and script are local');
const compare = read('site/design-lab/compare/index.html');
ok((compare.match(/<option /g) || []).length === 20 && (compare.match(/class="compare-panel"/g) || []).length === 2, 'comparison page offers ten concepts and two side-by-side panels');
ok(/Nominal conditioned footprint/.test(compare) && /Screened porch area/.test(compare) && /Glazing area/.test(compare) && /Thermal strengths/.test(compare) && /Thermal risks/.test(compare) && /Accessibility considerations/.test(compare) && /Structural \/ installation review/.test(compare), 'comparison shows area, envelope, thermal, accessibility and structural metrics');
ok(!/\b(kWh|kgCO2|cost \$|\$\d)/i.test(compare), 'comparison contains no invented energy, carbon or cost figures');
ok(/All ten concepts/.test(compare) && /<caption>/.test(compare) && /<th scope="col">/.test(compare), 'comparison includes an accessible all-concepts table');
ok(exists('site/design-lab/compare.css') && exists('site/design-lab/compare.js') && !/fetch\(|localStorage|sessionStorage/.test(read('site/design-lab/compare.js')), 'comparison is local and does not store or transmit data');

const lodge = data.concepts.find((c) => c.id === 'common-lodge');
ok(lodge && lodge.features.interior_uses.includes('Shared kitchen') && lodge.features.interior_uses.includes('Shared dining') && lodge.features.interior_uses.includes('Workshop') && lodge.features.interior_uses.includes('Meeting room') && lodge.modules.some((m) => m.zones.some((z) => z.type === 'bathroom')) && lodge.porches.some((p) => p.screened) && lodge.connections.some((c) => c.glazed && c.door_type === 'insulated-sliding'), 'common lodge combines shared kitchen/dining, workshop/meeting, accessible washrooms, a glazed hall and a screened veranda');

section('Envelope assemblies and vegetation systems');
for (const c of data.concepts) {
  const env = c.envelope;
  ok(env && env.version === '1.0' && Schema.ENVELOPE_ASSEMBLIES.indexOf(env.assembly) >= 0 && env.layers.length >= 4, `${c.id}: versioned envelope assembly with layers`);
  const wall1 = Model.wallSectionSVG(c, c.modules[0].id, { idPrefix: 'test-wall-' + c.id });
  const wall2 = Model.wallSectionSVG(c, c.modules[0].id, { idPrefix: 'test-wall-' + c.id });
  ok(wall1 === wall2 && /role="img"/.test(wall1) && /<title id=/.test(wall1) && /<desc id=/.test(wall1) && /CC BY-SA 4\.0/.test(wall1), `${c.id}: wall section is deterministic and accessible`);
  ok(!/<[^>]+\bfill="[^"]*"[^>]*\bfill="/.test(wall1), `${c.id}: wall section has no duplicate XML attributes`);
  const summer = Model.renderAxo(c, { idPrefix: 'test-summer-' + c.id });
  const winter = Model.renderAxo(c, { idPrefix: 'test-winter-' + c.id, season: 'winter' });
  ok(summer !== winter, `${c.id}: summer and winter views differ`);
  const exp = Model.exposureProfile(c);
  ok(['north','east','south','west'].every((f) => typeof exp.glazing_by_face[f] === 'number') && exp.glazing_total_m2 >= 0 && /No energy savings/.test(exp.note), `${c.id}: approximate window exposure has no energy or privacy score`);
  (c.vegetation || []).forEach((v) => {
    ok(Schema.VEGETATION_TYPES.indexOf(v.type) >= 0 && v.offset_m >= 0.3 && /independent|piles|posts|footing/i.test(v.support), `${c.id} ${v.id}: vegetation is independently supported and clear of the wall`);
  });
  const warnings = Model.assess(c).warnings.map((w) => w.code);
  ok(warnings.indexOf('envelope-condensation') >= 0 && warnings.indexOf('envelope-fire') >= 0 && warnings.indexOf('envelope-moisture') >= 0 && warnings.indexOf('envelope-fastening') >= 0 && warnings.indexOf('envelope-penetrations') >= 0 && warnings.indexOf('envelope-maintenance') >= 0, `${c.id}: envelope condensation, fire, moisture, fastening, penetration and maintenance warnings are present`);
}
const vegTypes = new Set();
data.concepts.forEach((c) => { if ((c.trellises || []).length) vegTypes.add('trellis'); (c.vegetation || []).forEach((v) => vegTypes.add(v.type)); });
ok(['trellis', 'living-wall', 'edible-wall', 'privacy-screen'].every((t) => vegTypes.has(t)), 'all four vegetation systems have examples');
ok(['rigid-board', 'mineral-wool', 'wood-fibre', 'spray-foam', 'hybrid'].every((a) => data.concepts.some((c) => c.envelope.assembly === a)), 'all five envelope assemblies have examples');
ok(['rigid-board', 'mineral-wool', 'wood-fibre', 'spray-foam', 'hybrid'].every((a) => exists(`site/design-lab/systems/wall-${a}.svg`)), 'shared wall sections exist for all five assemblies');
ok(exists('site/design-lab/systems/vegetation-comparison.svg') && /Rainscreen · trellis · modular living wall/.test(read('site/design-lab/systems/vegetation-comparison.svg')), 'original rainscreen/trellis/living-wall comparison diagram exists');
const vegPage = read('site/design-lab/vegetation/index.html');
ok(/Four systems/.test(vegPage) && /Freestanding climbing-plant trellis/.test(vegPage) && /Modular living wall/.test(vegPage) && /Edible herb and perennial planter wall/.test(vegPage) && /Evergreen privacy screen/.test(vegPage), 'vegetation guide has all four systems');
ok(/ecohome\.net/.test(vegPage) && /gsky\.com/.test(vegPage) && /livewall\.com/.test(vegPage) && /wallemi\.com/.test(vegPage) && /buildingscience\.com/.test(vegPage) && /rdh\.com/.test(vegPage), 'vegetation guide cites supplier and building-science sources');
ok(/No energy savings, privacy score, carbon figure or code compliance is claimed/.test(vegPage), 'vegetation guide does not claim invented performance');
const badEnv = JSON.parse(JSON.stringify(data.concepts[0])); badEnv.envelope.assembly = 'not-real';
ok(!Schema.validateSchema(badEnv).ok, 'unknown envelope assemblies are rejected');
const badVeg = JSON.parse(JSON.stringify(data.concepts[0])); badVeg.vegetation[0].offset_m = 0.1;
ok(!Schema.validateSchema(badVeg).ok, 'vegetation closer than 300 mm is rejected');

section('Solar tilt and azimuth');
for (const c of data.concepts) {
  const solarModules = c.modules.filter((m) => m.solar && m.solar.enabled);
  ok(c.modules.every((m) => m.solar && m.solar.tilt_deg >= 0 && m.solar.tilt_deg <= 75 && m.solar.azimuth_deg >= 0 && m.solar.azimuth_deg <= 360), `${c.id}: every module has a valid solar configuration`);
  ok(solarModules.every((m) => m.solar.tilt_deg === 39 && m.solar.azimuth_deg === 180), `${c.id}: solar defaults to 39° due south`);
  if (solarModules.length) {
    const sec = Model.solarSectionSVG(c, solarModules[0].id, { idPrefix: 'test-solar-' + c.id });
    ok(sec === Model.solarSectionSVG(c, solarModules[0].id, { idPrefix: 'test-solar-' + c.id }) && /role="img"/.test(sec) && /39°/.test(sec) && /180/.test(sec) && /CC BY-SA 4\.0/.test(sec), `${c.id}: solar section is deterministic, accessible and shows the tilt/azimuth`);
    const ext = Model.renderAxo(c, { idPrefix: 'test-solar-ext-' + c.id });
    ok(new RegExp('PV ' + solarModules[0].solar.tilt_deg + '°').test(ext), `${c.id}: exterior labels the tilted PV array`);
    ok(/solar 39° \/ 180°/.test(Model.renderPlan(c, { idPrefix: 'test-solar-plan-' + c.id })), `${c.id}: plan labels the solar azimuth and tilt`);
  }
}
ok(exists('site/design-lab/systems/solar-39.svg'), 'shared 39° solar section exists');
const badSolar = JSON.parse(JSON.stringify(data.concepts[0])); badSolar.modules[0].solar.tilt_deg = 90;
ok(!Schema.validateSchema(badSolar).ok, 'solar tilt above 75° is rejected');
const badAzimuth = JSON.parse(JSON.stringify(data.concepts[0])); badAzimuth.modules[0].solar.azimuth_deg = 400;
ok(!Schema.validateSchema(badAzimuth).ok, 'solar azimuth outside 0–360° is rejected');

section('Foundations and footbridge');
for (const c of data.concepts) {
  const f = c.foundation;
  ok(f && Schema.FOUNDATION_SYSTEMS.indexOf(f.system) >= 0 && f.clearance_m >= 0.45 && f.clearance_m <= 2, `${c.id}: elevated foundation configuration`);
  const sec = Model.foundationSectionSVG(c, { idPrefix: 'test-foundation-' + c.id });
  ok(sec === Model.foundationSectionSVG(c, { idPrefix: 'test-foundation-' + c.id }) && /role="img"/.test(sec) && /<title id=/.test(sec) && /<desc id=/.test(sec) && /no compaction/.test(sec) && /CC BY-SA 4\.0/.test(sec), `${c.id}: foundation section is deterministic and accessible`);
  ok(new RegExp(f.clearance_m + ' m clearance').test(sec), `${c.id}: foundation section shows the clearance`);
  const ext = Model.renderAxo(c, { idPrefix: 'test-foundation-ext-' + c.id });
  ok(/stroke="#5d6f6a"/.test(ext), `${c.id}: exterior draws the elevated piles`);
  const warnings = Model.assess(c).warnings.map((w) => w.code);
  ok(warnings.indexOf('foundation-geotech') >= 0 && warnings.indexOf('foundation-compaction') < 0, `${c.id}: foundation geotechnical warning is present and no-compaction is recorded`);
}
ok(exists('site/design-lab/systems/foundation-helical-piles.svg'), 'shared helical-pile foundation section exists');
const ground = read('site/design-lab/ground/index.html');
ok(/Ontario-appropriate options/.test(ground) && /Engineered helical piles/.test(ground) && /Ground screws/.test(ground) && /Concrete piers/.test(ground) && /Timber posts/.test(ground) && /Bedrock anchors/.test(ground), 'ground page documents the five foundation options');
ok(/not compacted/.test(ground) && /root-protection zone/i.test(ground) && /No fill/.test(ground), 'ground page explains no-compaction and root protection');
ok(/small footbridge/.test(ground) && /8 m clear-span/.test(ground) && /conservation authority/.test(ground) && /Ontario Building Code/.test(ground), 'ground page documents the footbridge and Ontario approvals');
ok(/wcl\.org\.uk/.test(ground) && /technometalpost\.com/.test(ground) && /naturalbuildingcollective\.com/.test(ground) && /solidearthtech\.com/.test(ground) && /houzz/.test(ground), 'ground page cites the supplied sources');
ok(exists('site/design-lab/systems/footbridge.svg') && /role="img"/.test(read('site/design-lab/systems/footbridge.svg')) && /8 metre clear-span/.test(read('site/design-lab/systems/footbridge.svg')), 'original footbridge diagram exists');
const badFoundation = JSON.parse(JSON.stringify(data.concepts[0])); badFoundation.foundation.system = 'magic-pad';
ok(!Schema.validateSchema(badFoundation).ok, 'unknown foundation systems are rejected');
const badClearance = JSON.parse(JSON.stringify(data.concepts[0])); badClearance.foundation.clearance_m = 3;
ok(!Schema.validateSchema(badClearance).ok, 'foundation clearance above 2 m is rejected');

section('Shared data model and migration');
const base = data.concepts[0];
const badSchema = JSON.parse(JSON.stringify(base)); badSchema.schema = 'wrong/schema';
ok(!Schema.validateSchema(badSchema).ok, 'unknown schema versions are rejected');
const tooMany = JSON.parse(JSON.stringify(data.concepts.find((c) => c.id === 'woodland-courtyard'))); tooMany.id = 'too-many'; tooMany.modules.push(JSON.parse(JSON.stringify(tooMany.modules[0])));
ok(!Schema.validateSchema(tooMany).ok, 'more than three modules is rejected by schema validation');
const dup = JSON.parse(JSON.stringify(base)); dup.modules[0].openings[1].id = dup.modules[0].openings[0].id;
ok(!Schema.validateSchema(dup).ok, 'duplicate opening ids are rejected');
const badOpening = JSON.parse(JSON.stringify(base)); badOpening.modules[0].openings[0].position_m = 0.1;
ok(!Model.assess(badOpening).ok, 'an opening near a container end is invalid geometry');
const badPorch = JSON.parse(JSON.stringify(base)); badPorch.porches[0].start_m = badPorch.porches[0].length_m + 11;
ok(!Model.assess(badPorch).ok, 'a porch beyond the module face is invalid geometry');
const badDeck = JSON.parse(JSON.stringify(base)); badDeck.decks[0].projection_m = 5;
ok(!Model.assess(badDeck).ok, 'a deck projecting more than 3 m is invalid geometry');
const badTrellis = JSON.parse(JSON.stringify(base)); badTrellis.trellises[0].offset_m = 0.1;
ok(Model.assess(badTrellis).warnings.some((w) => w.code === 'trellis-offset'), 'a trellis too close to the rainscreen is flagged');
const moved = JSON.parse(JSON.stringify(base)); moved.modules[0].position_m = [100, 100];
const before = Model.bounds(base), after = Model.bounds(moved);
ok(after.minX > before.minX + 90 && near(after.width, before.width), 'moving a module changes the overall position but not its size');
const two = data.concepts.find((c) => c.id === 'l-shaped-haven');
const otherBefore = JSON.stringify(Model.moduleCorners(two.modules[1]));
const movedTwo = JSON.parse(JSON.stringify(two)); movedTwo.modules[0].position_m = [4, 4];
ok(JSON.stringify(Model.moduleCorners(movedTwo.modules[1])) === otherBefore, 'moving one container does not alter another');
const overlap = JSON.parse(JSON.stringify(two)); overlap.modules[1].position_m = overlap.modules[0].position_m;
ok(!Model.assess(overlap).ok, 'overlapping containers are invalid geometry');
const legacy = { schema: Schema.LEGACY_SCHEMA, name: 'Legacy pair', preset: 'pair', modules: 2, module: { length_m: 12.192, width_m: 2.438, nominal: true }, envelope: { external_insulation_mm: 150, cladding: 'timber', roof: 'solar' }, porch: { depth_m: 3, start_m: 3, length_m: 4, screened: true }, openings: [{ id: 'W-N', face: 'north', position_m: 4, width_m: 1.2 }, { id: 'W-S', face: 'south', position_m: 8, width_m: 1.2 }], status: 'concept only', professional_review_required: true };
const migrated = Schema.migrateV01(legacy);
ok(migrated.design.schema === Schema.SCHEMA && migrated.design.modules.length === 2, 'v0.1 pair migrates to two explicit modules');
ok(Model.assess(migrated.design).ok, 'the migrated v0.1 pair has valid geometry');
ok(migrated.report.unmapped.length >= 3 && /combined width/.test(migrated.report.unmapped.join(' ')), 'the v0.1 migration reports what it cannot preserve');
const round = JSON.parse(JSON.stringify(base));
ok(JSON.stringify(Schema.canonicalize(round)) === JSON.stringify(Schema.canonicalize(round)), 'JSON round trip is stable');
ok(Schema.summary(round).moduleCount === 1 && Schema.summary(round).openingCount > 0, 'summary derives counts from the design');

section('Cabin A adapter');
const cabinBefore = read('data/cabin-a.json');
const cabin = JSON.parse(cabinBefore);
const adapted = fromCabinA(cabin);
ok(adapted.design.modules.length === 1 && adapted.design.modules[0].type === '40ft', 'Cabin A adapts as a single 40-foot module');
ok(adapted.design.modules[0].openings.length === cabin.openings.length, 'Cabin A openings adapt without loss of count');
ok(adapted.report.unmapped.includes('fixtures') && adapted.report.unmapped.includes('ramps') && adapted.report.unmapped.includes('trellis'), 'Cabin A adapter reports unmapped fixtures, ramps and trellis');
const proposal = toCabinAProposal(adapted.design, cabin);
ok(proposal.report.compatible && proposal.spec.openings.length === adapted.design.modules[0].openings.length, 'a compatible design can produce a Cabin A proposal');
ok(proposal.report.unmapped.length > 0, 'the Cabin A proposal reports its losses');
ok(read('data/cabin-a.json') === cabinBefore, 'the authoritative Cabin A file is unchanged');
const lodgeBefore = read('data/lodge.json');
ok(JSON.parse(lodgeBefore).id === 'lodge' && exists('models/lodge/floor-plan.svg'), 'the authoritative lodge data and drawings remain available');

section('Privacy and remote assets');
const labCode = ['site/design-lab/editor/editor.js', 'site/js/design-schema.js', 'site/js/design-model.js'].map(read).join('\n');
ok(!/fetch\(|XMLHttpRequest|sendBeacon|document\.cookie|localStorage|sessionStorage|geolocation|WebSocket/.test(labCode), 'Design Lab code makes no network requests or storage calls');
ok(!/https?:\/\//.test(labCode.replace(/http:\/\/www\.w3\.org\/2000\/svg/g, '')), 'Design Lab code has no remote endpoint');
ok(!/(latitude|longitude|"lat"\s*:|"lng"\s*:|geojson|\bkml\b|EPSG|UTM zone)/i.test(read('data/design-lab.json')), 'Design Lab data contains no real-world coordinates');

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
