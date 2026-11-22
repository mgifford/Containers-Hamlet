#!/usr/bin/env node
// Static and schema checks for the Container Home Design Lab.
// Usage: node tools/check-design-lab.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { fromCabinA, toCabinAProposal } from './lib/design-adapter.mjs';

const require = createRequire(import.meta.url);
const Schema = require('../site/js/design-schema.js');
const Model = require('../site/js/design-model.js');
const Illustration = require('../site/js/design-illustration.js');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(ROOT, p));
let passes = 0, failures = 0;
function ok(cond, msg) { if (cond) { passes++; console.log('  ok   ' + msg); } else { failures++; console.log('  FAIL ' + msg); } }
const section = (t) => console.log('\n' + t);
const near = (a, b, t = 0.01) => Math.abs(a - b) <= t;
const clone = (v) => JSON.parse(JSON.stringify(v));

section('Concept data and architectural families');
const data = JSON.parse(read('data/design-lab.json'));
ok(data.concepts.length === 16, 'sixteen concepts are present: nine archived, six hamlet residences and the common lodge');
const hamlet = data.concepts.filter((c) => c.role === 'hamlet-selected');
ok(hamlet.length === 6, 'exactly six concepts are hamlet-selected');
ok(hamlet.filter((c) => c.group === 'Single storey').length === 3 && hamlet.filter((c) => c.group === 'Two storeys').length === 3, 'the six residences include three single-storey and three two-storey homes');
ok(data.concepts.filter((c) => c.role === 'legacy-concept').length === 9, 'the nine original concepts are preserved as legacy concepts');
ok(data.concepts.filter((c) => c.role === 'common-lodge').length === 1, 'the common lodge keeps its own role');
ok(data.concepts.filter((c) => c.editable).length === 9, 'nine concepts are editable: six hamlet residences and three archive presets');
ok(data.concepts.every((c) => c.schema === Schema.SCHEMA), 'every concept uses the versioned v2 schema');
ok(data.concepts.every((c) => c.levels.length <= 2 && c.maxOccupiedStoreys <= 2), 'no residence exceeds two occupied storeys');
for (const c of data.concepts) {
  const v = Schema.validateSchema(c);
  const a = Model.assess(c);
  ok(v.ok, `${c.id}: schema validates${v.errors.length ? ': ' + v.errors.map((e) => e.message).join('; ') : ''}`);
  ok(a.ok, `${c.id}: no invalid data or geometry${a.invalid.map((i) => i.message).join('; ')}`);
  ok(c.modules.every((m) => Number.isInteger(m.storey) && typeof m.elevation_m === 'number' && m.support && m.support.references), `${c.id}: every module has storey, elevation and support intent`);
  ok(Array.isArray(c.levels) && c.levels.length >= 1 && c.levels.every((l) => typeof l.elevation_m === 'number'), `${c.id}: explicit levels and elevations are present`);
  ok(c.review && Schema.REVIEW_STATUSES.indexOf(c.review.structural) >= 0 && c.access && c.roof_form, `${c.id}: review register, accessibility record and roof form are present`);
  ok(Array.isArray(c.trellises), `${c.id}: trellis array is present`);
  ok(!JSON.stringify(c).match(/https?:\/\//), `${c.id}: concept data has no remote references`);
}
const legacyGroups = ['One container', 'Two containers', 'Three containers'];
ok(legacyGroups.every((g) => data.concepts.filter((c) => c.role === 'legacy-concept' && c.group === g).length === 3), 'the archive still has three concepts in each original module-count group');
const features = hamlet.map((c) => Model.architectureFeatures(c));
const primary = features.map((f) => [f.storeys, f.arrangement, f.footprint_type, f.roof_type, f.entrance_orientation, f.circulation_type].join('|'));
ok(new Set(primary).size === 6, 'the six residences differ in every primary architectural feature set');
ok(new Set(features.map((f) => f.roof_type)).size >= 5, 'at least five distinct roof forms are represented across the six homes');
ok(features.filter((f) => f.storeys === 2).length === 3 && features.filter((f) => f.storeys === 1).length === 3, 'single-storey and two-storey homes are both represented');
const similar = Model.findSimilarHomes(hamlet, 0.8);
ok(similar.length === 0, 'no pair of hamlet residences is above the 0.8 similarity heuristic');
ok(Model.architecturalSimilarity(hamlet[0], hamlet[0]).score === 1, 'a home is identical to itself under the diversity measure');

section('Versioned vertical geometry and migration');
const base = data.concepts.find((c) => c.id === 'hamlet-woodland-cottage');
const stacked = clone(base);
const upper = clone(base.modules[0]);
upper.id = 'm2';
upper.storey = 1;
upper.elevation_m = Model.moduleTop(base.modules[0]) + Schema.INTER_STOREY_FLOOR_M;
upper.position_m = [0, 0];
upper.support = { type: 'module', references: ['m1'], verified: false, note: 'Concept bearing intent.' };
upper.openings = upper.openings.map((o, i) => Object.assign({}, o, { id: 'm2-o' + (i + 1) }));
upper.zones = upper.zones.map((z, i) => Object.assign({}, z, { id: 'm2-z' + (i + 1) }));
stacked.modules.push(upper);
stacked.id = 'stack-test';
const stackDesign = Schema.canonicalize(stacked);
ok(Schema.validateSchema(stackDesign).ok && Model.assess(stackDesign).ok, 'a valid two-storey stacked design validates');
ok(stackDesign.levels.length === 2 && stackDesign.levels[1].storey === 1, 'the stacked design has two explicit levels');
const stackSupport = Model.supportAnalysis(stackDesign);
ok(stackSupport.rows.find((r) => r.module === 'm2').support_fraction === 1, 'an aligned stack reports full geometric bearing overlap');
const stackMetrics = Model.metrics(stackDesign);
ok(near(stackMetrics.grossFloorArea_m2, 59.45, 0.2) && near(stackMetrics.groundCoverage_m2, 29.72, 0.2), 'gross floor area counts both storeys while ground coverage counts the projected footprint');
ok(stackMetrics.buildingHeight_m > Model.moduleTop(stackDesign.modules[1]), 'the building height includes the roof above the upper module');

const offset = clone(stackDesign);
offset.modules[1].position_m = [2.5, 0];
const offsetDesign = Schema.canonicalize(offset);
const offsetSupport = Model.supportAnalysis(offsetDesign).rows.find((r) => r.module === 'm2');
ok(offsetSupport.support_fraction < 1 && offsetSupport.support_fraction > 0, 'an offset upper module reports partial geometric support');
ok(Model.assess(offsetDesign).items.some((i) => i.code === 'partial-support'), 'an offset upper module produces an explicit partial-support review prompt');
ok(!Model.assess(offsetDesign).items.some((i) => i.code === 'unsupported-upper'), 'a partially supported module is not mislabelled as having no support');

const perpendicular = clone(stackDesign);
perpendicular.modules[1].rotation_deg = 90;
const perpendicularDesign = Schema.canonicalize(perpendicular);
ok(Model.architectureFeatures(perpendicularDesign).arrangement === 'perpendicular-stack', 'a perpendicular upper module is recognised as a cross-stack');
const perpendicularSupport = Model.supportAnalysis(perpendicularDesign).rows.find((r) => r.module === 'm2');
ok(perpendicularSupport.support_fraction < 0.5 && Model.assess(perpendicularDesign).items.some((i) => i.code === 'partial-support'), 'a cross-stack reports its small bearing overlap and requires review');

const collision = clone(stackDesign);
collision.modules[1].elevation_m = collision.modules[0].elevation_m;
const collisionDesign = Schema.canonicalize(collision);
ok(Model.assess(collisionDesign).items.some((i) => i.code === 'module-collision-3d'), 'two modules on the same elevation are a three-dimensional collision');
const samePlanDifferentLevel = Model.assess(stackDesign).items.some((i) => i.code === 'module-overlap-in-plan');
ok(samePlanDifferentLevel && Model.assess(stackDesign).ok, 'plan overlap at different elevations is a review prompt, not an invalid collision');

const noElevation = clone(base);
delete noElevation.modules[0].elevation_m;
ok(!Schema.validateSchema(noElevation).ok, 'a module without an explicit elevation is rejected');
const noStorey = clone(base);
delete noStorey.modules[0].storey;
ok(!Schema.validateSchema(noStorey).ok, 'a module without a storey is rejected');
const badRotation = clone(base);
badRotation.modules[0].rotation_deg = 400;
ok(!Schema.validateSchema(badRotation).ok, 'an invalid rotation is rejected');
const brokenSupport = clone(stackDesign);
brokenSupport.modules[1].support.references = ['missing-module'];
ok(!Schema.validateSchema(brokenSupport).ok, 'a broken support reference is rejected');
const selfSupport = clone(stackDesign);
selfSupport.modules[1].support.references = ['m2'];
ok(!Schema.validateSchema(selfSupport).ok, 'a module cannot support itself');
const verifiedClaim = clone(stackDesign);
verifiedClaim.modules[1].support.verified = true;
ok(!Schema.validateSchema(verifiedClaim).ok, 'verified support is rejected without a documented professional assessment');
const verifiedWithAssessment = clone(stackDesign);
verifiedWithAssessment.modules[1].support.verified = true;
verifiedWithAssessment.modules[1].support.assessment = { reviewer: 'A. Engineer', organisation: 'Example Engineering', date: '2026-11-20', document: 'structural-review-01', scope: 'Bearing and connection review for the concept only' };
ok(Schema.validateSchema(verifiedWithAssessment).ok, 'verified support is accepted with a named, attributable assessment');
const threeStoreys = clone(stackDesign);
const third = clone(stackDesign.modules[1]);
third.id = 'm3';
third.storey = 2;
third.elevation_m = 7.5;
third.support = { type: 'module', references: ['m2'], verified: false, note: '' };
threeStoreys.modules.push(third);
ok(!Schema.validateSchema(threeStoreys).ok, 'a three-storey residence is rejected');
const unsupported = clone(stackDesign);
unsupported.modules[1].position_m = [30, 0];
unsupported.modules[1].support.references = [];
const unsupportedDesign = Schema.canonicalize(unsupported);
ok(Model.assess(unsupportedDesign).items.some((i) => i.code === 'unsupported-upper'), 'an upper module with no module below is reported as unsupported');
ok(Model.assess(unsupportedDesign).items.some((i) => i.code === 'support-not-declared'), 'missing support intent is reported as uncertainty, not guessed');

const v1 = clone(base);
v1.schema = Schema.SCHEMA_V1;
delete v1.levels;
delete v1.maxOccupiedStoreys;
delete v1.review;
delete v1.access;
delete v1.architecture;
v1.modules.forEach((m) => { delete m.storey; delete m.elevation_m; delete m.support; });
const migratedV1 = Schema.migrateV1(v1);
ok(migratedV1.design.schema === Schema.SCHEMA && migratedV1.design.modules[0].storey === 0, 'v1 designs migrate to v2 on storey 0');
ok(Model.assess(migratedV1.design).ok, 'the migrated v1 design has valid geometry');
ok(migratedV1.report.unmapped.length >= 2, 'v1 migration reports what it cannot infer');

section('Geometry, roofs and floor areas');
for (const c of hamlet) {
  const m = Model.metrics(c);
  const rg = Model.roofGeometry(c);
  ok(m.grossFloorArea_m2 >= m.groundCoverage_m2 - 0.1, `${c.id}: gross floor area is not smaller than ground coverage`);
  ok(m.groundCoverage_m2 > 0 && m.buildingHeight_m > 0 && m.roofArea_m2 > 0, `${c.id}: footprint, height and roof area are calculated`);
  ok(near(m.buildingHeight_m, rg.top_m, 0.02), `${c.id}: building height comes from the roof geometry`);
  if (m.storeyCount > 1) ok(m.upperFloorArea_m2 > 0 && m.groundCoverage_m2 < m.grossFloorArea_m2, `${c.id}: stacking adds upper floor area on a smaller ground footprint`);
  const alt = Model.singleStoreyAlternative(c);
  if (alt) {
    const am = Model.metrics(alt);
    ok(am.storeyCount === 1 && near(am.grossFloorArea_m2, m.grossFloorArea_m2, 0.2), `${c.id}: the derived single-storey translation keeps approximate floor area and removes the upper storey`);
    ok(am.groundCoverage_m2 > m.groundCoverage_m2, `${c.id}: the single-storey translation increases ground coverage`);
    ok(Model.assess(alt).ok, `${c.id}: the single-storey translation has valid geometry`);
  }
}
const cottage = data.concepts.find((c) => c.id === 'hamlet-woodland-cottage');
const cottagePlan = Model.renderPlan(cottage, { idPrefix: 'test-plan' });
ok(cottagePlan.includes('L1 @') && / m overall/.test(cottagePlan) && cottagePlan.includes('gable roof'), 'the plan shows module levels, overall dimensions and the roof type');
ok(Model.renderPlan(cottage, { idPrefix: 'test-ground', storey: 0 }) !== Model.renderPlan(cottage, { idPrefix: 'test-ground', storey: 1 }), 'floor-specific plans differ by level');

section('Deterministic views and gallery outputs');
for (const c of data.concepts) {
  const kindList = ['plan', 'plan-ground', 'elevation-south', 'elevation-north', 'elevation-east', 'elevation-west', 'section', 'exploded', 'solar-summer', 'solar-winter', 'exterior', 'cutaway', 'porch', 'winter'];
  for (const kind of kindList) {
    const render = () => kind === 'plan' ? Model.renderPlan(c, { idPrefix: 'concept-' + c.id + '-' + kind })
      : kind === 'plan-ground' ? Model.renderPlan(c, { idPrefix: 'concept-' + c.id + '-' + kind, storey: 0 })
      : kind.indexOf('elevation-') === 0 ? Model.renderElevation(c, { idPrefix: 'concept-' + c.id + '-' + kind, side: kind.split('-')[1] })
      : kind === 'section' ? Model.renderSection(c, { idPrefix: 'concept-' + c.id + '-' + kind })
      : kind === 'exploded' ? Model.renderExploded(c, { idPrefix: 'concept-' + c.id + '-' + kind })
      : kind.indexOf('solar-') === 0 ? Model.renderSolarStudy(c, { idPrefix: 'concept-' + c.id + '-' + kind, season: kind.split('-')[1] })
      : Model.renderAxo(c, { idPrefix: 'concept-' + c.id + '-' + kind, mode: kind === 'cutaway' ? 'cutaway' : undefined, focus: kind === 'porch' ? 'outdoor' : undefined, season: kind === 'winter' ? 'winter' : undefined });
    const svg1 = render(), svg2 = render();
    ok(svg1 === svg2 && svg1.length > 1200, `${c.id} ${kind}: deterministic render`);
    ok(/role="img"/.test(svg1) && /<title id="/.test(svg1) && /<desc id="/.test(svg1) && /CC BY-SA 4\.0/.test(svg1), `${c.id} ${kind}: accessible SVG with licence notice`);
    ok(!/NaN/.test(svg1), `${c.id} ${kind}: no NaN coordinates`);
    ok(!/<script|https?:\/\//i.test(svg1.replace(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, '')), `${c.id} ${kind}: no scripts or remote references`);
    ok(!/<[^>]+\bfill="[^"]*"[^>]*\bfill="/.test(svg1), `${c.id} ${kind}: no duplicate XML attributes`);
    ok(exists(`site/design-lab/views/${c.id}-${kind}.svg`), `${c.id} ${kind}: generated file exists`);
    ok(read(`site/design-lab/views/${c.id}-${kind}.svg`) === svg1, `${c.id} ${kind}: committed SVG matches a fresh render`);
  }
  if (c.levels.length > 1) {
    const upperPlan = Model.renderPlan(c, { idPrefix: 't-upper-' + c.id, storey: 1 });
    ok(/outline/.test(upperPlan) && c.modules.filter((m) => m.storey === 0).every((m) => upperPlan.includes(m.id.toUpperCase())), `${c.id}: upper plan keeps the ground floor visible as muted outlines`);
    ok(exists(`site/design-lab/views/${c.id}-plan-upper.svg`), `${c.id}: upper-floor plan file exists`);
  }
  const plan = read(`site/design-lab/views/${c.id}-plan-ground.svg`);
  ok(c.modules.every((m) => plan.includes(m.id.toUpperCase())), `${c.id}: ground plan labels every module, including upper outlines`);
  ok(c.levels.every((l) => Model.renderElevation(c, { idPrefix: 't-level-' + c.id, side: 'south' }).includes(l.name)), `${c.id}: south elevation labels every floor level`);
  ok(c.modules.every((m) => Model.renderElevation(c, { idPrefix: 't-elev-' + c.id, side: 'south' }).includes(m.id)), `${c.id}: south elevation places every module at its elevation`);
  ok(c.modules.every((m) => Model.renderSection(c, { idPrefix: 't-sec-' + c.id }).includes(m.id)), `${c.id}: section places every module`);
  ok(exists(`site/design-lab/data/${c.id}.json`), `${c.id}: downloadable JSON exists`);
  ok(JSON.parse(read(`site/design-lab/data/${c.id}.json`)).id === c.id, `${c.id}: downloaded JSON matches the source`);
}

section('Gallery, editor and residences pages');
const gallery = read('site/design-lab/index.html');
ok((gallery.match(/class="concept-card"/g) || []).length === 16, 'gallery has sixteen concept cards');
ok((gallery.match(/class="concept-badge hamlet"/g) || []).length === 6, 'gallery marks the six hamlet residences');
ok((gallery.match(/class="concept-badge editable"/g) || []).length === 3, 'gallery marks the three editable archive presets');
ok((gallery.match(/Inspiration only/g) || []).length >= 6, 'gallery labels the inspiration-only concepts');
ok(/Six intentionally different hamlet residences/.test(gallery) && /Concept archive and the common lodge/.test(gallery), 'gallery separates hamlet residences from the preserved archive');
ok((gallery.match(/<img /g) || []).length >= 16 && [...gallery.matchAll(/<img [^>]*>/g)].every((m) => /alt="[^"]{12,}"/.test(m[0]) && /width="\d+"/.test(m[0]) && /height="\d+"/.test(m[0])), 'gallery images have alt text, width and height');
ok(['hamlet-woodland-cottage', 'hamlet-offset-stack', 'hamlet-accessible-garden-home', 'woodland-retreat', 'l-shaped-haven', 'woodland-courtyard'].every((id) => gallery.includes('editor/?preset=' + id)), 'gallery links the six hamlet homes and the three archive presets');
ok(gallery.includes('residences/') && gallery.includes('Compare the six residences'), 'gallery links the hamlet-wide comparison');
ok(gallery.includes('LICENSE.txt') && gallery.includes('CONTENT-LICENSE.md'), 'gallery links its licences');
const editor = read('site/design-lab/editor/index.html');
ok(editor.includes('id="controls"') && editor.includes('id="plan"') && editor.includes('id="exterior"') && editor.includes('id="cutaway"'), 'editor has controls and the primary synchronized views');
ok(editor.includes('id="edit-storey"') && editor.includes('id="stack-above"') && editor.includes('id="inspect-support"'), 'editor has level selection and stacking operations');
ok(editor.includes('id="elevation-south"') && editor.includes('id="section"') && editor.includes('id="exploded"') && editor.includes('id="solar-summer"') && editor.includes('id="solar-winter"'), 'editor shows elevations, section, exploded levels and solar studies');
ok(editor.includes('id="access-controls"') && editor.includes('id="roof-controls"') && editor.includes('id="support-report"'), 'editor has accessibility, roof and support controls');
ok(editor.includes('id="warning-list"') && editor.includes('id="site-preview"') && editor.includes('id="massing"') && editor.includes('id="summary"'), 'editor has checks, site and massing previews and a summary');
ok(editor.includes('<noscript>') && editor.includes('js/design-schema.js') && editor.includes('js/design-model.js') && editor.includes('concepts.js') && editor.includes('site-data.js'), 'editor has a no-JavaScript message and loads the shared model');
ok(!/<script[^>]+src="https?:/i.test(editor) && !/<link[^>]+href="https?:/i.test(editor), 'editor has no remote scripts or styles');
ok(exists('site/design-lab/LICENSE.txt') && /GNU AFFERO GENERAL PUBLIC LICENSE/.test(read('site/design-lab/LICENSE.txt')), 'full AGPL text is included');
ok(exists('site/design-lab/CONTENT-LICENSE.md') && /CC BY-SA 4\.0/.test(read('site/design-lab/CONTENT-LICENSE.md')), 'Design Lab content licence is present');
ok(exists('site/design-lab/THIRD-PARTY-NOTICES.md'), 'third-party notices file is present');
const residences = read('site/design-lab/residences/index.html');
ok((residences.match(/<tr data-home=/g) || []).length === 6, 'residence comparison has six accessible table rows');
ok(/id="sort-residences"/.test(residences) && /id="filter-storeys"/.test(residences) && /id="filter-arrangement"/.test(residences), 'residence comparison offers sorting and filtering');
ok(/Stacked and single-storey alternatives/.test(residences) && /single-storey translation/.test(residences), 'residence comparison includes single-storey alternatives');
ok(/Architectural diversity assessment/.test(residences) && /0\.8/.test(residences), 'residence comparison includes the rule-based diversity assessment');
ok(/Gross floor area counts nominal module areas/.test(residences) && /No cost, carbon or energy figure is included/.test(residences), 'residence comparison states its area and evidence boundaries');
ok(exists('site/design-lab/residences/residences.js') && !/fetch\(|localStorage|sessionStorage/.test(read('site/design-lab/residences/residences.js')), 'residence sorting is local and stores nothing');

section('Architectural galleries and comparison');
for (const c of data.concepts) {
  const page = read(`site/design-lab/architecture/${c.id}/index.html`);
  const slides = (page.match(/class="slide"/g) || []).length;
  ok(/data-slideshow/.test(page) && slides >= 12, `${c.id}: architectural page has at least twelve views`);
  ok(/data-slide-prev/.test(page) && /data-slide-next/.test(page) && /data-slide-all/.test(page), `${c.id}: slideshow has visible keyboard controls`);
  ok(/Ground-floor plan/.test(page) && /South elevation/.test(page) && /Building section/.test(page) && /Exploded levels/.test(page), `${c.id}: gallery includes plans, elevations, section and exploded levels`);
  ok(/Summer solar study/.test(page) && /Winter solar study/.test(page), `${c.id}: gallery includes summer and winter solar studies`);
  if (c.levels.length > 1) ok(/Upper-floor plan/.test(page), `${c.id}: two-storey gallery includes an upper-floor plan`);
  ok(/Geometry-backed drawing/.test(page) && /Illustrative \/ explanatory study/.test(page) && /<noscript>/.test(page), `${c.id}: distinguishes drawing types and explains the no-JS fallback`);
  ok(/Accessibility/.test(page) && /Structural review register/.test(page) && /Levels, stacking and support/.test(page), `${c.id}: accessibility, structural and stacking sections are present`);
  ok(!/setInterval|setTimeout/.test(read('site/design-lab/architecture.js')), `${c.id}: slideshow has no auto-advance timer`);
}
ok(exists('site/design-lab/architecture.css') && exists('site/design-lab/architecture.js') && !/<script[^>]+src="https?:/i.test(read('site/design-lab/architecture.css')), 'architectural gallery styles and script are local');
const compare = read('site/design-lab/compare/index.html');
ok((compare.match(/<option /g) || []).length === 32 && (compare.match(/class="compare-panel"/g) || []).length === 2, 'comparison page offers sixteen concepts and two side-by-side panels');
ok(/Storeys and massing/.test(compare) && /Nominal conditioned footprint/.test(compare) && /Accessibility/.test(compare) && /Structural \/ installation review/.test(compare), 'comparison shows massing, area, envelope, accessibility and structural metrics');
ok(!/\b(kWh|kgCO2|cost \$|\$\d)/i.test(compare), 'comparison contains no invented energy, carbon or cost figures');
ok(/All sixteen concepts/.test(compare) && /<caption>/.test(compare) && /<th scope="col">/.test(compare), 'comparison includes an accessible all-concepts table');
ok(exists('site/design-lab/compare.css') && exists('site/design-lab/compare.js') && !/fetch\(|localStorage|sessionStorage/.test(read('site/design-lab/compare.js')), 'comparison is local and does not store or transmit data');

const lodge = data.concepts.find((c) => c.id === 'common-lodge');
ok(lodge && lodge.features.interior_uses.includes('Shared kitchen') && lodge.modules.some((m) => m.zones.some((z) => z.type === 'bathroom')) && lodge.porches.some((p) => p.screened) && lodge.connections.some((c) => c.glazed && c.door_type === 'insulated-sliding'), 'common lodge keeps its shared kitchen, washrooms, glazed hall and screened veranda');
ok(lodge.access.step_free_entrance && lodge.levels.length === 1, 'common lodge keeps its step-free single-storey default');

section('Envelope assemblies and vegetation systems');
for (const c of data.concepts) {
  const env = c.envelope;
  ok(env && env.version === '1.0' && Schema.ENVELOPE_ASSEMBLIES.indexOf(env.assembly) >= 0 && env.layers.length >= 4, `${c.id}: versioned envelope assembly with layers`);
  const wall1 = Model.wallSectionSVG(c, c.modules[0].id, { idPrefix: 'test-wall-' + c.id });
  const wall2 = Model.wallSectionSVG(c, c.modules[0].id, { idPrefix: 'test-wall-' + c.id });
  ok(wall1 === wall2 && /role="img"/.test(wall1) && /<title id=/.test(wall1) && /<desc id=/.test(wall1) && /CC BY-SA 4\.0/.test(wall1), `${c.id}: wall section is deterministic and accessible`);
  const summer = Model.renderAxo(c, { idPrefix: 'test-summer-' + c.id });
  const winter = Model.renderAxo(c, { idPrefix: 'test-winter-' + c.id, season: 'winter' });
  ok(summer !== winter, `${c.id}: summer and winter views differ`);
  const exp = Model.exposureProfile(c);
  ok(['north','east','south','west'].every((f) => typeof exp.glazing_by_face[f] === 'number') && exp.glazing_total_m2 >= 0 && /No energy savings/.test(exp.note), `${c.id}: approximate window exposure has no energy or privacy score`);
  (c.vegetation || []).forEach((v) => {
    ok(Schema.VEGETATION_TYPES.indexOf(v.type) >= 0 && v.offset_m >= 0.3 && /independent|piles|posts|footing/i.test(v.support), `${c.id} ${v.id}: vegetation is independently supported and clear of the wall`);
  });
  const warnings = Model.assess(c).warnings.map((w) => w.code);
  ok(warnings.indexOf('envelope-condensation') >= 0 && warnings.indexOf('envelope-fire') >= 0 && warnings.indexOf('envelope-moisture') >= 0, `${c.id}: envelope condensation, fire and moisture warnings are present`);
}
const vegTypes = new Set();
data.concepts.forEach((c) => { if ((c.trellises || []).length) vegTypes.add('trellis'); (c.vegetation || []).forEach((v) => vegTypes.add(v.type)); });
ok(['trellis', 'living-wall', 'edible-wall', 'privacy-screen'].every((t) => vegTypes.has(t)), 'all four vegetation systems have examples');
ok(['rigid-board', 'mineral-wool', 'wood-fibre', 'spray-foam', 'hybrid'].every((a) => data.concepts.some((c) => c.envelope.assembly === a)), 'all five envelope assemblies have examples');
ok(['rigid-board', 'mineral-wool', 'wood-fibre', 'spray-foam', 'hybrid'].every((a) => exists(`site/design-lab/systems/wall-${a}.svg`)), 'shared wall sections exist for all five assemblies');
const badEnv = clone(data.concepts[0]); badEnv.envelope.assembly = 'not-real';
ok(!Schema.validateSchema(badEnv).ok, 'unknown envelope assemblies are rejected');
const badVeg = clone(data.concepts[0]); badVeg.vegetation[0].offset_m = 0.1;
ok(!Schema.validateSchema(badVeg).ok, 'vegetation closer than 300 mm is rejected');

section('Roof forms, solar and foundations');
for (const c of hamlet) {
  ok(Schema.ROOF_FORMS.indexOf(c.roof_form.type) >= 0 && c.roof_form.pitch_deg >= 0 && c.roof_form.pitch_deg <= 45, `${c.id}: roof form and pitch are valid`);
  const rg = Model.roofGeometry(c);
  ok(rg.top_m > 0 && rg.roofArea_m2 > 0, `${c.id}: roof geometry returns a top elevation and area`);
  const summer = Model.renderSolarStudy(c, { idPrefix: 'test-solar-summer-' + c.id, season: 'summer' });
  const winter = Model.renderSolarStudy(c, { idPrefix: 'test-solar-winter-' + c.id, season: 'winter' });
  ok(summer !== winter && /65°/.test(summer) && /20°/.test(winter) && /no energy/i.test(summer.replace(/<[^>]+>/g, ' ')), `${c.id}: summer and winter solar studies differ and state their limits`);
  const sec = Model.solarSectionSVG(c, c.modules[0].id, { idPrefix: 'test-solar-section-' + c.id });
  ok(/role="img"/.test(sec) && /CC BY-SA 4\.0/.test(sec), `${c.id}: solar tilt section is accessible`);
  const f = c.foundation;
  ok(f && Schema.FOUNDATION_SYSTEMS.indexOf(f.system) >= 0 && f.clearance_m >= 0.45 && f.clearance_m <= 2, `${c.id}: elevated foundation configuration`);
  const fsec = Model.foundationSectionSVG(c, { idPrefix: 'test-foundation-' + c.id });
  ok(/role="img"/.test(fsec) && /no compaction/.test(fsec), `${c.id}: foundation section is accessible and records no compaction`);
}
ok(['gable', 'shed', 'flat', 'butterfly', 'canopy', 'solar-ready'].every((t) => hamlet.some((c) => c.roof_form.type === t)), 'six distinct roof forms are represented across the six homes');
const badRoof = clone(data.concepts.find((c) => c.id === 'common-lodge')); badRoof.roof_form.solar_side = 'north';
ok(!Schema.validateSchema(badRoof).ok, 'north-side roof solar is rejected');
const badArray = clone(data.concepts.find((c) => c.id === 'common-lodge')); badArray.solar_array.side = 'north';
ok(!Schema.validateSchema(badArray).ok, 'north-side solar array is rejected');
const badFoundation = clone(base); badFoundation.foundation.system = 'magic-pad';
ok(!Schema.validateSchema(badFoundation).ok, 'unknown foundation systems are rejected');

section('Accessibility and structural review');
for (const c of hamlet) {
  const a = Model.accessibilityProfile(c);
  ok(a.classification !== 'not-assessed', `${c.id}: accessibility is classified`);
  ok(a.entrance_door_width_m >= 0.86, `${c.id}: the entrance door is at least 0.86 m wide in the concept`);
  ok(a.step_free_entrance, `${c.id}: a step-free entrance is recorded`);
  if (c.levels.length > 1) {
    ok(a.classification !== 'fully-accessible-single-storey', `${c.id}: a two-storey home is not classified as fully accessible`);
    ok(a.issues.some((i) => i.code === 'lift-reserve') || a.issues.some((i) => i.code === 'vertical-access'), `${c.id}: vertical access or lift-reserve limitations are explicit`);
    ok(a.stair && a.stair.present, `${c.id}: a stair is recorded for the upper floor`);
  }
  const review = Model.structuralReview(c);
  ok(review.concerns.length >= 16, `${c.id}: the structural review register covers corner castings, loads, openings, cantilevers, stability, wind, snow, foundation, connections, crane, transport, fire, corrosion, thermal bridges and moisture`);
  ok(review.concerns.every((x) => Schema.REVIEW_STATUSES.indexOf(x.status) >= 0), `${c.id}: every structural concern has a visible review status`);
  ok(review.model_status !== 'professionally-verified', `${c.id}: automatic generation never claims professional verification`);
  if (c.levels.length > 1) {
    ok(review.concerns.find((x) => x.id === 'vertical-load-transfer').status === 'requires-review', `${c.id}: vertical load transfer is flagged for review`);
    ok(review.concerns.find((x) => x.id === 'lateral-stability').status === 'requires-review', `${c.id}: lateral stability is flagged for review`);
    ok(review.concerns.find((x) => x.id === 'fire-separation').status === 'requires-review', `${c.id}: fire separation is flagged for review`);
  }
}
const badAccess = clone(base); badAccess.access.classification = 'fully-accessible';
ok(!Schema.validateSchema(badAccess).ok, 'unknown accessibility classifications are rejected');
const verifiedReview = clone(base);
verifiedReview.review.concerns['corner-castings'] = { status: 'professionally-verified' };
ok(!Schema.validateSchema(verifiedReview).ok, 'a professionally verified structural claim without evidence is rejected');

section('Diversity, sustainability and shared data model');
for (const c of hamlet) {
  const sus = Model.sustainabilityProfile(c);
  ok(sus.gross_floor_area_m2 > 0 && sus.ground_coverage_m2 > 0 && sus.usable_floor_area_m2 === null, `${c.id}: sustainability profile reports geometry and refuses unusable precision`);
  ok(sus.missing_inputs.length >= 5 && sus.comparator.includes('timber-frame'), `${c.id}: sustainability profile lists missing inputs and a timber comparator`);
  ok(sus.qualitative.strengths.length >= 1 && sus.qualitative.tradeoffs.length >= 1, `${c.id}: sustainability profile separates strengths from trade-offs`);
  ok(!/\b(kWh|kgCO2|\$\d|cost of)\b/i.test(JSON.stringify(sus)), `${c.id}: sustainability profile contains no invented energy, carbon or cost result`);
}
const diversityA = Model.architectureFeatures(cottage);
ok(diversityA.storeys === 1 && diversityA.roof_type === 'gable' && diversityA.arrangement === 'single', 'diversity features describe the cottage massing');
const offsetConcept = hamlet.find((c) => c.id === 'hamlet-offset-stack');
ok(Model.architectureFeatures(offsetConcept).arrangement === 'offset-stack', 'diversity features describe the offset stack');
const sim = Model.architecturalSimilarity(cottage, offsetConcept);
ok(sim.score < 0.8 && sim.matchingFeatures.indexOf('roof_type') < 0, 'the cottage and offset stack are not flagged as similar');
const colorOnly = clone(offsetConcept);
colorOnly.modules.forEach((m) => { m.cladding.colour = '#ff0000'; });
ok(Model.architecturalSimilarity(offsetConcept, colorOnly).score === 1, 'colour changes do not alter the architectural similarity score');

const legacy = { schema: Schema.LEGACY_SCHEMA, name: 'Legacy pair', preset: 'pair', modules: 2, module: { length_m: 12.192, width_m: 2.438, nominal: true }, envelope: { external_insulation_mm: 150, cladding: 'timber', roof: 'solar' }, porch: { depth_m: 3, start_m: 3, length_m: 4, screened: true }, openings: [{ id: 'W-N', face: 'north', position_m: 4, width_m: 1.2 }, { id: 'W-S', face: 'south', position_m: 8, width_m: 1.2 }], status: 'concept only', professional_review_required: true };
const migrated = Schema.migrateV01(legacy);
ok(migrated.design.schema === Schema.SCHEMA && migrated.design.modules.length === 2, 'v0.1 pair migrates to two explicit modules');
ok(Model.assess(migrated.design).ok, 'the migrated v0.1 pair has valid geometry');
ok(migrated.report.unmapped.join(' ').includes('storeys'), 'the v0.1 migration reports that vertical geometry and review evidence did not exist');
const round = clone(base);
ok(JSON.stringify(Schema.canonicalize(round)) === JSON.stringify(Schema.canonicalize(round)), 'JSON round trip is stable');
ok(Schema.summary(round).moduleCount === 1 && Schema.summary(round).storeyCount === 1 && Schema.summary(round).openingCount > 0, 'summary derives counts from the design');
ok(Schema.migrateAny(base).design.schema === Schema.SCHEMA, 'migrateAny accepts a current design without changing its schema');

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

section('Illustration pipeline');
const siteData = JSON.parse(read('data/site.json'));
const hamletHomes = data.concepts.filter((c) => c.role === 'hamlet-selected');
ok(hamletHomes.length === 6, 'illustration pipeline has six hamlet residences');
const discrepancyReport = JSON.parse(read('data/illustration-discrepancies.json'));
ok(discrepancyReport.schema === 'containers-hamlet-illustration-discrepancies/v1' && discrepancyReport.items.length >= 8, 'machine-readable discrepancy report is present');
for (const c of hamletHomes) {
  const config = Illustration.defaultConfig(c);
  const cfg = Illustration.validateConfig(config);
  ok(cfg.ok, `${c.id}: default illustration configuration validates`);
  const scene = Illustration.sceneSpec(c, config, siteData);
  ok(scene.schema === Illustration.SCENE_SCHEMA && scene.designId === c.id, `${c.id}: scene has the canonical design identity`);
  ok(scene.validation.ok, `${c.id}: scene consistency validation passes${scene.validation.errors.join('; ')}`);
  ok(scene.designHash === Illustration.designHash(c), `${c.id}: scene records the design hash`);
  ok(scene.building.storeys === c.levels.length && scene.building.moduleCount === c.modules.length, `${c.id}: scene storey and module counts match the model`);
  ok(scene.building.roofType === c.roof_form.type && scene.building.roofPitch_deg === c.roof_form.pitch_deg, `${c.id}: scene roof matches the model`);
  ok(scene.requiredElements.length === c.modules.length && c.modules.every((m) => scene.requiredElements.some((x) => x.sourceId === m.id)), `${c.id}: scene includes every module`);
  ok(scene.openings.length === c.modules.reduce((t, m) => t + m.openings.length, 0), `${c.id}: scene includes every opening`);
  ok(scene.capabilities.interiorPerspective === false && scene.capabilities.roomZonePlan === true, `${c.id}: interior perspective is not overclaimed`);
  ok(scene.unresolved.some((u) => u.code === 'interior-partitions'), `${c.id}: room-zone limitation is explicit`);
  ok(scene.prompt.text.includes(c.name) && scene.prompt.text.includes(String(scene.building.storeys)), `${c.id}: prompt uses the current name and storey count`);
  ok(/do not add or remove storeys/i.test(scene.prompt.text) && /not a construction drawing/i.test(scene.prompt.text), `${c.id}: prompt carries explicit geometric and authority restrictions`);
  ok(scene.negativePrompt.groups.length >= 5, `${c.id}: negative prompt separates contradiction categories`);
  ok(scene.description.text.includes(c.name) && /Architectural facts/.test(scene.description.text), `${c.id}: description is structured and generated`);
  ok(exists(`site/design-lab/illustration/${c.id}/prompt.md`) && exists(`site/design-lab/illustration/${c.id}/scene.json`) && exists(`site/design-lab/illustration/${c.id}/manifest.json`), `${c.id}: illustration package files exist`);
  const pkgManifest = JSON.parse(read(`site/design-lab/illustration/${c.id}/manifest.json`));
  ok(pkgManifest.designId === c.id && pkgManifest.designHash === scene.designHash && pkgManifest.sceneHash === Illustration.sceneHash(scene), `${c.id}: package manifest hashes match the scene`);
  ok(pkgManifest.artifacts.every((a) => a.hash && a.dependencies && a.path), `${c.id}: manifest artifacts have hashes and dependencies`);
  const schematicPlan = Model.containerSchematicSVG(c, { idPrefix: 'test-schematic-' + c.id });
  const schematicElevation = Model.containerSchematicSVG(c, { idPrefix: 'test-schematic-elev-' + c.id, mode: 'elevation' });
  ok(schematicPlan === Model.containerSchematicSVG(c, { idPrefix: 'test-schematic-' + c.id }) && /role="img"/.test(schematicPlan) && /<title id=/.test(schematicPlan) && /<desc id=/.test(schematicPlan) && /data-schematic="plan"/.test(schematicPlan), `${c.id}: container block plan is deterministic and accessible`);
  ok(/data-schematic="elevation"/.test(schematicElevation) && /upper module/i.test(schematicElevation), `${c.id}: container block elevation distinguishes upper modules by hatch and dash`);
  const roofPlan = Model.roofPlanSVG(c, { idPrefix: 'test-roof-plan-' + c.id });
  ok(roofPlan === Model.roofPlanSVG(c, { idPrefix: 'test-roof-plan-' + c.id }) && /role="img"/.test(roofPlan) && /roof plan/i.test(roofPlan) && /data-drawing="roof-plan"/.test(roofPlan), `${c.id}: roof plan is deterministic and accessible`);
  const ref = Model.renderReference(c, { view: 'site-facing', rotationDeg: scene.camera.renderRotationDeg, idPrefix: 'test-scene-ref-' + c.id });
  ok(ref === Model.renderReference(c, { view: 'site-facing', rotationDeg: scene.camera.renderRotationDeg, idPrefix: 'test-scene-ref-' + c.id }) && /role="img"/.test(ref) && /<desc id=/.test(ref), `${c.id}: site-facing reference is deterministic and accessible`);
  ok(exists(`site/design-lab/views/${c.id}-container-layout.svg`) && exists(`site/design-lab/views/${c.id}-roof-plan.svg`) && exists(`site/design-lab/views/${c.id}-site-facing.svg`), `${c.id}: schematic, roof and reference SVGs are published`);
  const page = read(`site/design-lab/architecture/${c.id}/index.html`);
  ok(/Container block plan/.test(page) && /Roof plan/.test(page) && /Site-facing reference/.test(page), `${c.id}: architecture page includes the schematic, roof plan and reference`);
}
const illCottage = hamletHomes.find((c) => c.id === 'hamlet-woodland-cottage');
const illOffset = hamletHomes.find((c) => c.id === 'hamlet-offset-stack');
const illCourtyard = hamletHomes.find((c) => c.id === 'hamlet-courtyard-residence');
const illCross = hamletHomes.find((c) => c.id === 'hamlet-cross-stacked-retreat');
const illAccessible = hamletHomes.find((c) => c.id === 'hamlet-accessible-garden-home');
const illSolar = hamletHomes.find((c) => c.id === 'hamlet-solar-studio-stack');
const illCottageScene = Illustration.sceneSpec(illCottage, Illustration.defaultConfig(illCottage), siteData);
const illOffsetScene = Illustration.sceneSpec(illOffset, Illustration.defaultConfig(illOffset), siteData);
const illCourtyardScene = Illustration.sceneSpec(illCourtyard, Illustration.defaultConfig(illCourtyard), siteData);
const illCrossScene = Illustration.sceneSpec(illCross, Illustration.defaultConfig(illCross), siteData);
const illAccessibleScene = Illustration.sceneSpec(illAccessible, Illustration.defaultConfig(illAccessible), siteData);
const illSolarScene = Illustration.sceneSpec(illSolar, Illustration.defaultConfig(illSolar), siteData);
ok(illCottageScene.environment.siteName === 'Cabin A' && illOffsetScene.environment.siteName === 'Cabin B' && illCourtyardScene.environment.siteName === 'Cabin C' && illCrossScene.environment.siteName === 'Cabin D' && illAccessibleScene.environment.siteName === 'Cabin E' && illSolarScene.environment.siteName === 'Cabin F', 'the six homes use their assigned site views');
ok(near(illCottageScene.camera.azimuth_deg, (245 + 35) % 360, 0.2) && near(illOffsetScene.camera.azimuth_deg, (138 + 35) % 360, 0.2), 'camera azimuth is a world bearing from the site principal view');
ok(illOffsetScene.outdoor.some((o) => o.type === 'porch' && o.module === 'm2' && o.face === 'south'), 'Offset Stack upper porch is recorded on the south face');
ok(illOffsetScene.unresolved.some((u) => u.code === 'unmodeled-balcony') && illOffsetScene.unresolved.some((u) => u.code === 'balcony-access'), 'Offset Stack balcony access inconsistency is reported instead of hidden');
ok(illCourtyardScene.building.moduleTypes.every((t) => t === '40ft'), 'Courtyard Residence is described as two 40-foot modules');
ok(illCrossScene.unresolved.some((u) => u.code === 'unmodeled-balcony') && illCrossScene.unresolved.some((u) => u.code === 'interior-ceiling'), 'Cross-Stacked Retreat balcony and interior ceiling limitations are explicit');
ok(!/fully illAccessible/i.test(illAccessibleScene.prompt.text) && illAccessibleScene.unresolved.some((u) => u.code === 'accessibility-verification'), 'Accessible Garden Home prompt does not claim full accessibility');
ok(illSolarScene.building.installedPv === true && /installed PV array/i.test(illSolarScene.prompt.text), 'Solar Studio Stack prompt may show installed PV');
ok(illSolarScene.unresolved.some((u) => u.code === 'alternating-tread-stair'), 'Solar Studio Stack alternating stair is carried as an unresolved usability concern');
ok(/path approach recorded as east/i.test(illCottageScene.prompt.text) && !/main south approach/i.test(illCottageScene.prompt.text), 'Woodland Cottage prompt records the east site path approach and does not call it the main approach');
ok(illCottageScene.unresolved.some((u) => u.code === 'site-approach'), 'Woodland Cottage site approach discrepancy is reported');
const cottageMoved = clone(illCottage); cottageMoved.modules[0].position_m = [1.2, 0.4];
ok(Illustration.designHash(cottageMoved) !== Illustration.designHash(illCottage), 'moving a module changes the design hash');
const cottageRoof = clone(illCottage); cottageRoof.roof_form.pitch_deg = 30;
ok(Illustration.designHash(cottageRoof) !== Illustration.designHash(illCottage), 'changing the roof pitch changes the design hash');
const styleConfig = Illustration.defaultConfig(illCottage); styleConfig.presentation.style = 'architectural-watercolour';
ok(Illustration.designHash(illCottage) === Illustration.designHash(illCottage) && Illustration.presentationHash(styleConfig) !== Illustration.presentationHash(Illustration.defaultConfig(illCottage)), 'presentation changes do not change the design hash');
const winterScene = Illustration.sceneSpec(illCottage, styleConfig, siteData);
ok(/architectural watercolour/i.test(winterScene.prompt.text) && winterScene.building.roofPitch_deg === illCottage.roof_form.pitch_deg, 'presentation changes affect the prompt but not the geometry facts');
const badConfig = Illustration.defaultConfig(illCottage); badConfig.view.type = 'not-a-view';
ok(!Illustration.validateConfig(badConfig).ok, 'unknown illustration views are rejected');
const badStyle = Illustration.defaultConfig(illCottage); badStyle.presentation.style = 'not-a-style';
ok(!Illustration.validateConfig(badStyle).ok, 'unknown illustration styles are rejected');
const userDesign = clone(illCottage); userDesign.id = 'user-custom-home'; userDesign.name = 'Custom Home';
const userScene = Illustration.sceneSpec(userDesign, Illustration.defaultConfig(userDesign), siteData);
ok(userScene.designId === 'user-custom-home' && /Custom Home/.test(userScene.prompt.text) && userScene.validation.ok, 'the prompt generator works for an arbitrary user design, not only the six homes');
const illManifest = Illustration.manifest(illCottageScene, illCottage, Illustration.artifactPlan(illCottageScene), '2026-11-22T00:00:00.000Z');
ok(illManifest.designId === illCottage.id && illManifest.generatorVersion === Illustration.GENERATOR_VERSION && illManifest.artifacts.length >= 8, 'package manifest records identity, generator and artifact plan');
ok(illManifest.limitations.some((l) => /interior/i.test(l)) && illManifest.limitations.some((l) => /interpretation/i.test(l)), 'manifest carries interior and interpretation limitations');
ok(Illustration.artifactPlan(illCottageScene).some((a) => a.path === 'prompts/exterior.md') && Illustration.artifactPlan(illCottageScene).some((a) => a.path === 'references/exterior-reference.svg'), 'artifact plan includes prompts and references');
ok(exists('site/design-lab/illustration/index.html') && /Design once/.test(read('site/design-lab/illustration/index.html')), 'public illustration pipeline page is generated');

section('Privacy and remote assets');
const labCode = ['site/design-lab/editor/editor.js', 'site/js/design-schema.js', 'site/js/design-model.js', 'site/js/design-illustration.js'].map(read).join('\n');
ok(!/fetch\(|XMLHttpRequest|sendBeacon|document\.cookie|localStorage|sessionStorage|geolocation|WebSocket/.test(labCode), 'Design Lab code makes no network requests or storage calls');
ok(!/https?:\/\//.test(labCode.replace(/http:\/\/www\.w3\.org\/2000\/svg/g, '')), 'Design Lab code has no remote endpoint');
ok(!/(latitude|longitude|"lat"\s*:|"lng"\s*:|geojson|\bkml\b|EPSG|UTM zone)/i.test(read('data/design-lab.json')), 'Design Lab data contains no real-world coordinates');

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
