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
ok(data.concepts.length === 9, 'nine concepts are present');
ok(['One container', 'Two containers', 'Three containers'].every((g) => data.concepts.filter((c) => c.group === g).length === 3), 'three concepts in each module-count group');
ok(data.concepts.filter((c) => c.editable).map((c) => c.id).join(',') === 'woodland-retreat,l-shaped-haven,woodland-courtyard', 'the three editable presets are the required ones');
ok(data.concepts.filter((c) => !c.editable).length === 6, 'six concepts are marked inspiration-only');
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
  ok(plan1 === plan2, `${c.id}: plan SVG is deterministic`);
  ok(ext1 === ext2 && cut1.length > 2000, `${c.id}: exterior and cutaway render deterministically`);
  for (const [kind, svg] of [['plan', plan1], ['exterior', ext1], ['cutaway', cut1]]) {
    ok(/role="img"/.test(svg) && /<title id="/.test(svg) && /<desc id="/.test(svg) && /CC BY-SA 4\.0/.test(svg), `${c.id} ${kind}: accessible SVG with licence notice`);
    ok(!/<script|https?:\/\//i.test(svg.replace(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, '')), `${c.id} ${kind}: no scripts or remote references`);
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
ok((gallery.match(/class="concept-card"/g) || []).length === 9, 'gallery has nine concept cards');
ok((gallery.match(/class="concept-badge editable"/g) || []).length === 3, 'gallery marks three editable cards');
ok((gallery.match(/Inspiration only/g) || []).length >= 6, 'gallery labels six inspiration-only cards');
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
