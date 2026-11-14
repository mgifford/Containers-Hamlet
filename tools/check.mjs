#!/usr/bin/env node
// Static checks that need nothing but Node: generated files current, data
// valid, siting rules enforced, dimensions consistent across outputs, SVG and
// HTML accessibility basics, links, licences, privacy and page weight.
// Usage: node tools/check.mjs        MIT licence.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { createRequire } from 'node:module';
import { generate, ROOT } from './build.mjs';
import { analyseSite } from './lib/site.mjs';
import { parseOBJ } from './lib/obj.mjs';
import { SCALE } from './lib/drawings.mjs';

const require = createRequire(import.meta.url);
const EcoModel = require('../site/js/model.js');

let failures = 0;
let passes = 0;
const section = (t) => console.log(`\n${t}`);
function ok(cond, msg) {
  if (cond) { passes++; console.log(`  ok   ${msg}`); } else { failures++; console.log(`  FAIL ${msg}`); }
  return cond;
}
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const near = (a, b, tol = 0.002) => Math.abs(a - b) <= tol;

/* ------------------------------------------------------------------ */
section('Generated files');
const { files, issues, models, analysis } = generate();
const errors = issues.filter((i) => i.level === 'error');
ok(errors.length === 0, `data builds without errors${errors.length ? ': ' + errors.map((e) => e.message).join('; ') : ''}`);
const stale = [...files].filter(([p, c]) => !exists(p) || read(p) !== c).map(([p]) => p);
ok(stale.length === 0, `all ${files.size} generated files match the data${stale.length ? ' (stale: ' + stale.join(', ') + ')' : ''}`);

/* ------------------------------------------------------------------ */
section('Source data');
const cabin = JSON.parse(read('data/cabin-a.json'));
const lodge = JSON.parse(read('data/lodge.json'));
const site = JSON.parse(read('data/site.json'));
// Phase 1 fields that other people may already rely on
ok(['name', 'status', 'drawing_accuracy', 'interior_zones', 'design_intent'].every((k) => k in cabin), 'cabin-a.json keeps its Phase 1 fields');
ok(['external_length_m', 'external_width_m', 'external_height_m'].every((k) => typeof cabin.module[k] === 'number'), 'cabin-a.json keeps module.external_* dimensions');
ok(cabin.screened_porch && cabin.screened_porch.length_m === cabin.porches[0].length_m && cabin.screened_porch.depth_m === cabin.porches[0].depth_m, 'legacy screened_porch agrees with porches[0]');
ok(['fictional', 'area_acres', 'setting', 'ecology', 'access'].every((k) => k in site) && site.buildings.every((b) => b.id && b.name && b.use), 'site.json keeps its Phase 1 fields');
for (const spec of [cabin, lodge]) {
  ok(spec.provenance && /CC BY 4\.0/.test(spec.provenance.licence) && spec.provenance.verification, `${spec.id}: provenance names a licence and verification status`);
  ok(Array.isArray(spec.material_passport) && spec.material_passport.length > 0 && spec.material_passport.every((p) => ['component', 'material', 'source', 'condition_assessment', 'connections', 'disassembly', 'end_of_life', 'documentation'].every((k) => p[k])), `${spec.id}: every material passport entry is complete`);
  ok(spec.material_passport.every((p) => p.material_key in models[spec.id].quantities), `${spec.id}: passport entries link to modelled materials`);
  ok(Array.isArray(spec.reviews_required) && spec.reviews_required.length >= 4, `${spec.id}: lists required professional reviews`);
  ok(spec.roof.options[spec.roof.default_option] && Object.keys(spec.roof.options).length >= 2, `${spec.id}: has a default roof and at least one alternative`);
}
ok(near(analysis.area_acres, site.area_acres, 0.2), `parcel polygon is ${analysis.area_acres} acres (declared ${site.area_acres})`);

/* ------------------------------------------------------------------ */
section('Siting rules are enforced');
ok(analysis.buildings.every((b) => b.ok), 'every building passes its siting checks');
const clone = (o) => JSON.parse(JSON.stringify(o));
const s1 = clone(site);
s1.buildings.find((b) => b.id === 'c').x_m = 121.4; // Phase 1 position
const a1 = analyseSite(s1, models);
ok(a1.issues.some((i) => /Cabin C/.test(i.message) && /shoreline/.test(i.message)), 'Cabin C at its Phase 1 position is rejected for the shoreline setback');
const s2 = clone(site);
Object.assign(s2.buildings.find((b) => b.id === 'e'), { x_m: 300, y_m: 200 });
ok(analyseSite(s2, models).issues.some((i) => /Cabin E/.test(i.message) && /wetland/.test(i.message)), 'a cabin moved into the wetland is rejected');
const s3 = clone(site);
s3.circulation.lanes.push({ id: 'bad', name: 'Phase 1 arrival route', kind: 'vehicle', width_m: 6, points: [[357, 211], [300, 205], [250, 200]] });
ok(analyseSite(s3, models).issues.some((i) => /Phase 1 arrival route/.test(i.message) && /wetland/.test(i.message)), 'the Phase 1 arrival route through the wetland is rejected');
const s4 = clone(site);
s4.no_build.shoreline_setback_m = 60;
ok(analyseSite(s4, models).issues.some((i) => /shoreline/.test(i.message)), 'raising the shoreline setback to 60 m flags buildings (buffers are configurable)');

/* ------------------------------------------------------------------ */
section('Geometry and dimensional consistency');
for (const id of ['cabin-a', 'lodge']) {
  const model = models[id];
  const M = model.meta;
  const spec = model.spec;
  const issuesAlt = Object.keys(spec.roof.options).flatMap((o) => EcoModel.validate(spec, EcoModel.buildModel(spec, { roof: o })).filter((i) => i.level === 'error'));
  ok(issuesAlt.length === 0, `${id}: no intersecting solids or invalid openings in any roof option`);

  const obj = parseOBJ(read(`models/${id}/${id}.obj`));
  ok(obj.f.every((f) => f.every((i) => i >= 1 && i <= obj.v.length)), `${id}.obj: ${obj.f.length} faces reference valid vertices`);
  // signed volume by the divergence theorem; any inward-facing face changes the total
  let vol = 0;
  for (const f of obj.f) {
    const p = f.map((i) => obj.v[i - 1]);
    for (let k = 1; k < p.length - 1; k++) {
      const [a, b, c] = [p[0], p[k], p[k + 1]];
      vol += (a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0])) / 6;
    }
  }
  const expected = model.prims.filter((p) => p.cat !== 'room').reduce((s, p) => s + EcoModel.volume(p), 0);
  ok(near(vol, expected, 0.01), `${id}.obj: all faces point outward (signed volume ${vol.toFixed(3)} = model ${expected.toFixed(3)} m³)`);

  // OBJ extents vs plan and elevation dimensions
  const lines = read(`models/${id}/${id}.obj`).split('\n');
  const extent = (pattern) => {
    let on = false;
    const lo = [Infinity, Infinity, Infinity];
    const hi = [-Infinity, -Infinity, -Infinity];
    for (const l of lines) {
      if (l.startsWith('o ')) on = pattern.test(l.slice(2));
      else if (on && l.startsWith('v ')) {
        const v = l.slice(2).split(' ').map(Number);
        v.forEach((x, k) => { lo[k] = Math.min(lo[k], x); hi[k] = Math.max(hi[k], x); });
      }
    }
    return { lo, hi };
  };
  const clad = extent(/_rainscreen$/);
  const piles = extent(/^piles$/);
  const plan = read(`models/${id}/floor-plan.svg`);
  const dimOf = (svg, role) => {
    const mm = new RegExp(`<g class="dim" data-length-m="([\\d.]+)" data-role="${role}"><path d="M([\\d.-]+) ([\\d.-]+)L([\\d.-]+) ([\\d.-]+)`).exec(svg);
    return mm ? { m: +mm[1], px: Math.hypot(mm[4] - mm[2], mm[5] - mm[3]) } : null;
  };
  const len = dimOf(plan, 'overall-length');
  const wid = dimOf(plan, 'overall-width');
  ok(len && near(len.m, clad.hi[0] - clad.lo[0]) && near(len.px / SCALE, len.m, 0.03), `${id}: plan overall length ${len && len.m} m = OBJ rainscreen extent = drawn length at scale`);
  ok(wid && near(wid.m, clad.hi[2] - clad.lo[2]) && near(wid.px / SCALE, wid.m, 0.03), `${id}: plan overall width ${wid && wid.m} m = OBJ rainscreen extent = drawn length at scale`);
  const mod = dimOf(plan, 'module-length');
  ok(mod && near(mod.m, spec.module.external_length_m), `${id}: plan module length equals the container length in the data`);
  model.rooms.filter((r) => r.bay === model.bays[model.bays.length - 1].id).forEach((r) => {
    const d = dimOf(plan, `room-${r.id}`);
    ok(d && near(d.m, r.clear_length_m) && near(d.px / SCALE, r.clear_length_m, 0.03), `${id}: ${r.name} clear length ${r.clear_length_m} m matches the drawn chain dimension`);
  });
  const elev = read(`models/${id}/elevations.svg`);
  const h = dimOf(elev, 'height-above-grade');
  ok(h && near(h.m, clad.hi[1] - piles.lo[1]) && near(h.px / SCALE, h.m, 0.03), `${id}: elevation height ${h && h.m} m = OBJ roof top minus grade = drawn height at scale`);
  const sec = read(`models/${id}/section.svg`);
  const ch = dimOf(sec, 'clear-height');
  ok(ch && near(ch.m, spec.module.internal_height_m - spec.envelope.floor_finish_m - spec.envelope.ceiling_lining_m), `${id}: section clear height ${ch && ch.m} m follows from the module and lining data`);
  const wall = dimOf(sec, 'wall-thickness');
  const wallExpected = spec.envelope.interior_lining_m + (spec.module.external_width_m - spec.module.internal_width_m) / 2 + spec.envelope.wall_layers.reduce((s, l) => s + l.thickness_m, 0);
  ok(wall && near(wall.m, wallExpected), `${id}: wall build-up ${wall && wall.m} m equals the sum of the envelope layers`);
  for (const f of ['floor-plan', 'elevations', 'section']) {
    ok(new RegExp(`data-px-per-m="${SCALE}"`).test(read(`models/${id}/${f}.svg`)), `${id}/${f}.svg: scale bar drawn at the sheet scale (${SCALE} px/m)`);
  }
  ok(read(`models/${id}/floor-plan.svg`).includes(`data-x-m="${spec.section_x_m}"`), `${id}: section mark on the plan is at the section position in the data`);
}

/* ------------------------------------------------------------------ */
section('SVG accessibility');
const svgFiles = [...files.keys()].filter((p) => p.endsWith('.svg') && p.startsWith('site/'));
svgFiles.push('site/assets/favicon.svg');
const svgOk = (label, svg, requireImg = true) => {
  const root = /<svg\b[^>]*>/.exec(svg)[0];
  const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map((x) => x[1]);
  const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (!requireImg) return ok(dup.length === 0, `${label}: unique ids`);
  const lab = /aria-labelledby="([^"]+)"/.exec(root);
  const refs = lab ? lab[1].split(/\s+/) : [];
  const title = /<title id="([^"]+)">([^<]{8,})<\/title>/.exec(svg);
  const desc = /<desc id="([^"]+)">([^<]{40,})<\/desc>/.exec(svg);
  return ok(/role="img"/.test(root) && refs.length === 2 && title && desc && refs.includes(title[1]) && refs.includes(desc[1]) && dup.length === 0,
    `${label}: role="img", labelled by a title and a description${dup.length ? ` (duplicate ids: ${dup.join(', ')})` : ''}`);
};
svgFiles.forEach((p) => svgOk(p, read(p), !p.endsWith('favicon.svg')));
const html = read('site/index.html');
[...html.matchAll(/<svg\b[\s\S]*?<\/svg>/g)].forEach((m, i) => svgOk(`index.html inline SVG ${i + 1}`, m[0]));
ok([...files.keys()].filter((p) => p.endsWith('.svg')).every((p) => /<text\b/.test(files.get(p))), 'drawings keep real SVG text labels (not outlined paths)');

/* ------------------------------------------------------------------ */
section('HTML structure and links');
const strip = html.replace(/<svg\b[\s\S]*?<\/svg>/g, '');
ok(/<html lang="en-CA">/.test(html), 'document language is set');
ok((strip.match(/<h1\b/g) || []).length === 1, 'exactly one h1');
const levels = [...strip.matchAll(/<h([1-6])\b/g)].map((x) => +x[1]);
ok(levels.every((l, i) => i === 0 || l <= levels[i - 1] + 1), 'heading levels never skip');
const allIds = [...html.matchAll(/\sid="([^"]+)"/g)].map((x) => x[1]);
const dupIds = allIds.filter((x, i) => allIds.indexOf(x) !== i);
ok(dupIds.length === 0, `ids are unique across the page${dupIds.length ? ': ' + dupIds.join(', ') : ''}`);
const imgs = [...strip.matchAll(/<img\b[^>]*>/g)].map((x) => x[0]);
ok(imgs.length > 0 && imgs.every((t) => /\salt="[^"]{12,}"/.test(t)), `all ${imgs.length} images have meaningful alt text`);
ok(imgs.every((t) => /\swidth="\d+"/.test(t) && /\sheight="\d+"/.test(t)), 'all images declare width and height (no layout shift)');
ok([...strip.matchAll(/<button\b[^>]*>/g)].every((x) => /type="button"/.test(x[0])), 'buttons declare type="button"');
const inputs = (strip.match(/<input\b/g) || []).length;
const labelled = [...strip.matchAll(/<label\b[^>]*>([\s\S]*?)<\/label>/g)].reduce((n, x) => n + (x[1].match(/<input\b/g) || []).length, 0);
ok(inputs > 0 && inputs === labelled, `every form control (${inputs}) is inside a label`);
ok([...strip.matchAll(/<fieldset\b[^>]*>\s*<legend>/g)].length === (strip.match(/<fieldset\b/g) || []).length, 'every fieldset has a legend');
ok(!/<form\b|<iframe\b|<object\b|<embed\b/.test(strip), 'no forms, iframes, objects or embeds');
const refs = [...strip.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((x) => x[1]);
const external = refs.filter((r) => /^https?:/.test(r));
const allowed = /^https:\/\/(creativecommons\.org|opensource\.org|github\.com)\//;
ok(external.every((r) => allowed.test(r)), `external links go only to licence pages and the source repository (${external.length})`);
ok(![...strip.matchAll(/<(script|link)\b[^>]*>/g)].some((x) => /(src|href)="https?:/.test(x[0])), 'no third-party scripts, styles or fonts');
const local = refs.filter((r) => !/^(https?:|mailto:|#)/.test(r));
const missing = local.filter((r) => !fs.existsSync(path.join(ROOT, 'site', r.split(/[?#]/)[0])));
ok(missing.length === 0, `all ${local.length} local links and sources resolve${missing.length ? ': ' + missing.join(', ') : ''}`);
const frags = refs.filter((r) => r.startsWith('#') && r.length > 1).map((r) => r.slice(1));
ok(frags.every((f) => allIds.includes(f)), `all ${frags.length} in-page links have targets`);
ok(/class="skip" href="#main"/.test(html) && /<main id="main"/.test(html), 'skip link targets the main landmark');
ok([...strip.matchAll(/<section\b[^>]*>/g)].every((x) => /aria-labelledby="/.test(x[0])), 'every section is labelled by its heading');
const enhance = [...strip.matchAll(/<[^>]*data-enhance[^>]*>/g)].map((x) => x[0]);
ok(enhance.length > 0 && enhance.every((t) => /\shidden(\s|>|=)/.test(t)), 'script-only controls are hidden until the script runs');

/* ------------------------------------------------------------------ */
section('Licences and attribution');
ok(/MIT License/.test(read('LICENSE')), 'LICENSE is MIT');
ok(/Creative Commons Attribution 4\.0/.test(read('CONTENT-LICENSE.md')), 'CONTENT-LICENSE.md is CC BY 4.0');
const generatedAssets = [...files.keys()].filter((p) => /\.(svg|obj|mtl)$/.test(p));
ok(generatedAssets.every((p) => /CC BY 4\.0/.test(files.get(p))), `every generated drawing and model (${generatedAssets.length}) carries the CC BY 4.0 notice`);
ok(['site/script.js', 'site/js/model.js', 'site/js/render.js', 'tools/build.mjs'].every((p) => /MIT/.test(read(p))), 'code files state the MIT licence');
ok(/creativecommons\.org\/licenses\/by\/4\.0/.test(html) && /MIT/.test(html), 'page footer links both licences');
ok(/not for construction/i.test(html) && /Disclaimer/.test(html), 'page keeps the concept-only disclaimer');

/* ------------------------------------------------------------------ */
section('Privacy');
const code = ['site/script.js', 'site/js/model.js', 'site/js/render.js'].map(read).join('\n').split('http://www.w3.org/2000/svg').join('SVG_NS');
const banned = ['fetch(', 'XMLHttpRequest', 'sendBeacon', 'document.cookie', 'localStorage', 'sessionStorage', 'geolocation', 'http://', 'https://', 'WebSocket', 'import('];
const found = banned.filter((b) => code.includes(b));
ok(found.length === 0, `scripts make no network requests and store nothing${found.length ? ' (found ' + found.join(', ') + ')' : ''}`);

/* ------------------------------------------------------------------ */
section('Page weight (sustainability budget)');
const initial = ['index.html', 'style.css', 'script.js', 'js/data.js', 'js/model.js', 'js/render.js', 'assets/favicon.svg', 'models/cabin-a/axonometric.svg'];
const bytes = (p) => fs.statSync(path.join(ROOT, 'site', p)).size;
const gz = (p) => zlib.gzipSync(fs.readFileSync(path.join(ROOT, 'site', p)), { level: 9 }).length;
const raw = initial.reduce((s, p) => s + bytes(p), 0);
const comp = initial.reduce((s, p) => s + gz(p), 0);
console.log(`       initial view: ${(raw / 1024).toFixed(0)} KB uncompressed, ${(comp / 1024).toFixed(0)} KB gzipped, ${initial.length} requests`);
ok(comp <= 120 * 1024, 'initial page view stays under 120 KB compressed');
ok(raw <= 400 * 1024, 'initial page view stays under 400 KB uncompressed');
let total = 0;
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => { const f = path.join(d, e.name); if (e.isDirectory()) walk(f); else total += fs.statSync(f).size; });
walk(path.join(ROOT, 'site'));
console.log(`       whole published site: ${(total / 1024).toFixed(0)} KB`);
ok(total <= 2.5 * 1024 * 1024, 'whole published site stays under 2.5 MB');
ok(/loading="lazy"/.test(html), 'below-the-fold drawings load lazily');
ok(!/@import|@font-face|url\(http/.test(read('site/style.css')), 'no web fonts or remote CSS');

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
