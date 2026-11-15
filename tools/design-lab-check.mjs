#!/usr/bin/env node
// Browser checks for the Design Lab gallery and editor.
// Usage: node tools/design-lab-check.mjs [screenshot-dir]
// Set CHROMIUM_PATH to use a preinstalled Chromium. Code: MIT.
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = path.join(ROOT, 'site');
const SHOTS = process.argv[2] || null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'design-lab-'));
let passes = 0, failures = 0;
const ok = (c, m) => { if (c) { passes++; console.log('  ok   ' + m); } else { failures++; console.log('  FAIL ' + m); } };
const section = (t) => console.log('\n' + t);

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json' };
const log = [];
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  let file = path.join(SITE, url.endsWith('/') ? url + 'index.html' : url);
  if (!file.startsWith(SITE)) file = '';
  const found = file && fs.existsSync(file) && fs.statSync(file).isFile();
  log.push({ url, status: found ? 200 : 404 });
  if (!found) { res.writeHead(404); res.end('not found'); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

async function open(url, options = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true, ...options });
  const page = await context.newPage();
  const errors = [], foreign = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('request', (r) => { if (!r.url().startsWith(BASE) && !r.url().startsWith('data:')) foreign.push(r.url()); });
  await page.goto(BASE + url, { waitUntil: 'load' });
  return { context, page, errors, foreign };
}
async function axe(page, label) {
  if (!(await page.evaluate(() => !!window.axe))) await page.addScriptTag({ content: AXE });
  const r = await page.evaluate(() => window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }));
  ok(r.violations.length === 0, `${label}: axe-core finds no WCAG 2.2 A/AA violations${r.violations.length ? ' -> ' + r.violations.map((v) => v.id).join(', ') : ''}`);
}
const shot = async (page, name, full = false) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: full }); };
const visible = (page, sel) => page.evaluate((s) => { const e = document.querySelector(s); return !!e && e.offsetParent !== null; }, sel);

try {
  section('Design gallery');
  let { context, page, errors, foreign } = await open('design-lab/');
  ok(errors.length === 0, `gallery: no console errors${errors.length ? ': ' + errors.join(' | ') : ''}`);
  const count = await page.evaluate(() => ({ cards: document.querySelectorAll('.concept-card').length, editable: document.querySelectorAll('.concept-badge.editable').length, inspiration: [...document.querySelectorAll('.concept-badge')].filter((b) => /Inspiration only/.test(b.textContent)).length, headings: document.querySelectorAll('h1').length }));
  ok(count.cards === 9 && count.editable === 3 && count.inspiration === 6 && count.headings === 1, 'gallery shows nine cards, three editable and six inspiration-only');
  await page.locator('#gallery').scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  const imgs = await page.evaluate(() => [...document.querySelectorAll('.concept-card-media img')].map((i) => ({ w: i.naturalWidth, alt: i.alt })));
  ok(imgs.every((i) => i.w > 0 && i.alt.length > 20), 'every gallery illustration loads with descriptive alt text');
  ok(await visible(page, '#concept-woodland-retreat details'), 'gallery exposes further views and source files');
  await axe(page, 'gallery');
  await shot(page, 'gallery-top');
  await shot(page, 'gallery-full', true);
  ok(foreign.length === 0, `gallery: no third-party requests${foreign.length ? ': ' + foreign.join(', ') : ''}`);
  const hrefs = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => !/^(https?:|#|mailto:)/.test(h)))]);
  const broken = [];
  for (const h of hrefs) { const r = await page.request.get(new URL(h, BASE + 'design-lab/').href); if (r.status() !== 200) broken.push(h); }
  ok(broken.length === 0, `gallery: all ${hrefs.length} local links return 200${broken.length ? ': ' + broken.join(', ') : ''}`);
  await context.close();

  section('Editor: initial state and accessibility');
  ({ context, page, errors, foreign } = await open('design-lab/editor/'));
  await page.waitForSelector('#plan svg');
  ok(errors.length === 0, `editor: no console errors${errors.length ? ': ' + errors.join(' | ') : ''}`);
  const initial = await page.evaluate(() => ({
    presets: document.querySelectorAll('#preset option').length,
    modules: document.querySelectorAll('[data-module-card]').length,
    openings: document.querySelectorAll('.opening-card').length,
    zones: document.querySelectorAll('.zone-card').length,
    plan: !!document.querySelector('#plan svg'),
    exterior: !!document.querySelector('#exterior svg'),
    cutaway: !!document.querySelector('#cutaway svg'),
    status: document.querySelector('#assessment-status').textContent,
    warnings: document.querySelectorAll('.warning-group').length
  }));
  ok(initial.presets === 3, 'editor lists the three editable presets');
  ok(initial.modules === 1 && initial.openings > 0 && initial.zones > 0, 'editor loads modules, openings and room zones');
  ok(initial.plan && initial.exterior && initial.cutaway, 'editor renders plan, exterior and cutaway from the start');
  ok(/No invalid geometry/.test(initial.status) && initial.warnings > 0, 'editor starts with valid geometry and professional-review prompts');
  const editorHrefs = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => !/^(https?:|#|mailto:)/.test(h)))]);
  const editorBroken = [];
  for (const h of editorHrefs) { const r = await page.request.get(new URL(h, BASE + 'design-lab/editor/').href); if (r.status() !== 200) editorBroken.push(h); }
  ok(editorBroken.length === 0, `editor: all ${editorHrefs.length} local links return 200${editorBroken.length ? ': ' + editorBroken.join(', ') : ''}`);
  await axe(page, 'editor');
  await shot(page, 'editor-top');
  await shot(page, 'editor-full', true);

  section('Editor: keyboard, presets and independent modules');
  await page.focus('#preset');
  await page.selectOption('#preset', 'l-shaped-haven');
  await page.waitForTimeout(300);
  ok(await page.evaluate(() => document.querySelectorAll('[data-module-card]').length === 2 && document.querySelector('#preset').value === 'l-shaped-haven'), 'preset switch loads the two-container L-Shaped Haven');
  await page.evaluate(() => { const hit = document.querySelector('#plan [data-module-id="m2"]'); if (hit) hit.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
  await page.waitForTimeout(200);
  ok(/selected from the plan/.test(await page.textContent('#status')), 'clicking a module on the plan selects it (pointer shortcut)');
  const m2Before = await page.inputValue('#m-1-x');
  await page.fill('#m-0-x', '1.5');
  await page.locator('#m-0-x').blur();
  await page.waitForTimeout(200);
  ok((await page.inputValue('#m-1-x')) === m2Before, 'moving one container does not move the other');
  ok(!(await page.evaluate(() => document.querySelector('#undo').disabled)), 'a change enables Undo');
  await page.focus('#undo');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  ok((await page.inputValue('#m-0-x')) === '0', 'Undo restores the previous position');
  ok(!(await page.evaluate(() => document.querySelector('#redo').disabled)), 'Undo enables Redo');
  await page.focus('#redo');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  ok((await page.inputValue('#m-0-x')) === '1.5', 'Redo restores the change');

  const planBefore = await page.evaluate(() => document.querySelector('#plan').innerHTML);
  await page.fill('#m-0-rot', '10');
  await page.locator('#m-0-rot').blur();
  await page.waitForTimeout(200);
  const planAfter = await page.evaluate(() => document.querySelector('#plan').innerHTML);
  ok(planBefore !== planAfter, 'rotating a container updates the plan');
  const extBefore = await page.evaluate(() => document.querySelector('#exterior').innerHTML);
  await page.fill('#m-0-rot', '20');
  await page.locator('#m-0-rot').blur();
  await page.waitForTimeout(200);
  ok(extBefore !== (await page.evaluate(() => document.querySelector('#exterior').innerHTML)), 'rotating a container updates the exterior view');

  section('Editor: adding components');
  await page.focus('#add-opening');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  ok((await page.evaluate(() => document.querySelectorAll('.opening-card').length)) === 5, 'keyboard activation adds an opening');
  await page.focus('#add-zone');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  ok((await page.evaluate(() => document.querySelectorAll('.zone-card').length)) === 5, 'keyboard activation adds a room zone');
  const porchBefore = await page.evaluate(() => document.querySelectorAll('.porch-card').length);
  await page.focus('#add-porch');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  ok((await page.evaluate(() => document.querySelectorAll('.porch-card').length)) === porchBefore + 1, 'keyboard activation adds a porch');
  const deckBefore = await page.evaluate(() => document.querySelectorAll('.deck-card').length);
  await page.focus('#add-deck');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  ok((await page.evaluate(() => document.querySelectorAll('.deck-card').length)) === deckBefore + 1, 'keyboard activation adds a deck');
  await page.focus('#add-trellis');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  ok((await page.evaluate(() => document.querySelectorAll('.trellis-card').length)) >= 1, 'keyboard activation adds a trellis');
  await page.focus('#add-connection');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  ok((await page.evaluate(() => document.querySelectorAll('.connection-card').length)) >= 1, 'keyboard activation adds a timber connector');

  section('Editor: invalid geometry and recovery');
  await page.click('#reset');
  await page.waitForTimeout(300);
  await page.fill('#m-1-x', '0');
  await page.locator('#m-1-x').blur();
  await page.waitForTimeout(300);
  ok(/invalid geometry/i.test(await page.textContent('#assessment-status')), 'overlapping containers are reported as invalid geometry');
  ok(await page.evaluate(() => document.querySelector('#export-plan').disabled && document.querySelector('#export-zip').disabled), 'drawing and ZIP exports are disabled for invalid geometry');
  ok(await page.evaluate(() => !document.querySelector('#export-json').disabled), 'JSON export remains available to preserve the work');
  await page.focus('#undo');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  ok(/No invalid geometry/.test(await page.textContent('#assessment-status')), 'Undo recovers valid geometry');

  section('Editor: hamlet preview');
  await page.click('#reset');
  await page.waitForTimeout(300);
  await page.locator('#site-preview').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  ok(await page.evaluate(() => document.querySelector('#site-preview img').naturalWidth > 0), 'hamlet preview loads the site-plan background');
  await page.selectOption('#homesite', 'b');
  await page.waitForTimeout(300);
  ok(/Illustrative placement at Cabin B/.test(await page.textContent('#site-status')), 'changing the homesite updates the illustrative placement');
  ok(await page.evaluate(() => document.querySelector('#site-preview').getAttribute('aria-label').length > 80), 'hamlet preview has a text description for screen readers');

  section('Editor: export and reopen');
  await page.click('#reset');
  await page.waitForTimeout(300);
  async function downloadFile(selector, name) {
    const ev = page.waitForEvent('download');
    await page.click(selector);
    const d = await ev;
    const file = path.join(TMP, name);
    await d.saveAs(file);
    return file;
  }
  const jsonFile = await downloadFile('#export-json', 'design.json');
  const parsed = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  ok(parsed.schema === 'containers-hamlet-design/v1.0' && parsed.modules.length === 2, 'exported JSON carries the v1 schema and both modules');
  const planFile = await downloadFile('#export-plan', 'plan.svg');
  ok(/^<svg|^<\?xml/.test(fs.readFileSync(planFile, 'utf8').trim()), 'exported plan is an SVG');
  const zipFile = await downloadFile('#export-zip', 'design.zip');
  ok(fs.readFileSync(zipFile).subarray(0, 4).toString('hex') === '504b0304', 'ZIP download has a valid ZIP signature');
  ok(fs.readFileSync(zipFile).toString('latin1').includes('design.json'), 'ZIP contains the editable JSON');
  await page.setInputFiles('#import-file', jsonFile);
  await page.waitForTimeout(500);
  ok(/Imported design/.test(await page.textContent('#status')), 'exported JSON reopens through Import');
  const legacy = { schema: 'containers-hamlet-editor/v0.1', name: 'Legacy pair', preset: 'pair', modules: 2, module: { length_m: 12.192, width_m: 2.438, nominal: true }, envelope: { external_insulation_mm: 150, cladding: 'timber', roof: 'solar' }, porch: { depth_m: 3, start_m: 3, length_m: 4, screened: true }, openings: [{ id: 'W-N', face: 'north', position_m: 4, width_m: 1.2 }, { id: 'W-S', face: 'south', position_m: 8, width_m: 1.2 }], status: 'concept only', professional_review_required: true };
  const legacyFile = path.join(TMP, 'legacy.json');
  fs.writeFileSync(legacyFile, JSON.stringify(legacy));
  await page.setInputFiles('#import-file', legacyFile);
  await page.waitForTimeout(500);
  ok(/Migrated from v0.1/.test(await page.textContent('#status')) && await page.evaluate(() => document.querySelectorAll('[data-module-card]').length === 2), 'v0.1 JSON imports through the migration path');
  await axe(page, 'editor after interaction');

  section('Responsive and preferences');
  const smallGallery = await open('design-lab/', { viewport: { width: 320, height: 640 } });
  await smallGallery.page.waitForTimeout(250);
  ok(await smallGallery.page.evaluate(() => document.documentElement.scrollWidth <= 320), 'gallery has no horizontal scrolling at 320 px');
  await axe(smallGallery.page, 'gallery at 320 px');
  await smallGallery.context.close();
  const small = await open('design-lab/editor/', { viewport: { width: 320, height: 640 } });
  await small.page.waitForSelector('#plan svg');
  await small.page.waitForTimeout(250);
  const smallWidth = await small.page.evaluate(() => document.documentElement.scrollWidth);
  ok(smallWidth <= 320, `editor has no horizontal scrolling at 320 px (${smallWidth}px)`);
  await axe(small.page, 'editor at 320 px');
  await small.context.close();
  const darkGallery = await open('design-lab/', { colorScheme: 'dark' });
  await axe(darkGallery.page, 'gallery in dark scheme');
  await darkGallery.context.close();
  const darkEditor = await open('design-lab/editor/', { colorScheme: 'dark' });
  await axe(darkEditor.page, 'editor in dark scheme');
  await darkEditor.context.close();
  const forced = await open('design-lab/editor/', { forcedColors: 'active' });
  ok(await forced.page.evaluate(() => getComputedStyle(document.querySelector('.view-svg')).forcedColorAdjust === 'none'), 'forced colours keep the drawing colours');
  await forced.context.close();
  const reduced = await open('design-lab/editor/', { reducedMotion: 'reduce' });
  ok(await reduced.page.evaluate(() => document.getAnimations().length === 0), 'reduced motion: no animations');
  await reduced.context.close();
  const nojs = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await nojs.route(/\/(editor|design-schema|design-model|concepts|site-data)\.js$/, (r) => r.abort());
  const np = await nojs.newPage();
  await np.goto(BASE + 'design-lab/editor/', { waitUntil: 'load' });
  ok(await np.evaluate(() => !!document.querySelector('noscript')), 'editor offers a no-JavaScript explanation');
  await nojs.close();
  ok(foreign.length === 0, `editor: no third-party requests${foreign.length ? ': ' + foreign.join(', ') : ''}`);
  await context.close();
} finally {
  await browser.close();
  server.close();
  fs.rmSync(TMP, { recursive: true, force: true });
}

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
