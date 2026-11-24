#!/usr/bin/env node
// Browser checks for the residential energy explorer, the energy sections and
// the energy controls in the Design Lab editor.
//
//   node tools/energy-browser-check.mjs [screenshot-dir]
//   Set CHROMIUM_PATH to use a preinstalled Chromium. Code: MIT.
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
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'energy-check-'));
let passes = 0, failures = 0;
const ok = (c, m) => { if (c) { passes++; console.log('  ok   ' + m); } else { failures++; console.log('  FAIL ' + m); } };
const section = (t) => console.log('\n' + t);

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  let file = path.join(SITE, url.endsWith('/') ? url + 'index.html' : url);
  if (!file.startsWith(SITE)) file = '';
  const found = file && fs.existsSync(file) && fs.statSync(file).isFile();
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

try {
  section('Energy explorer page');
  const energy = await open('design-lab/energy/');
  await energy.page.waitForSelector('#residence', { state: 'attached', timeout: 15000 });
  await energy.page.waitForTimeout(300);
  ok(energy.errors.length === 0, `energy page: no console errors${energy.errors.length ? ': ' + energy.errors.join(' | ') : ''}`);
  ok(await energy.page.locator('#residence option').count() === 6, 'energy explorer offers all six residences');
  ok(await energy.page.locator('#energy-comparison tbody tr').count() === 6, 'static comparison table has six rows without JavaScript');
  ok(await energy.page.locator('#energy-chart svg[role="img"]').count() === 1, 'monthly chart is exposed as an image with a title and description');
  ok((await energy.page.locator('#energy-chart > svg > title').count()) === 1 && (await energy.page.locator('#energy-chart > svg > desc').count()) === 1, 'monthly chart has a title and description');
  ok(await energy.page.locator('#energy-monthly-table tbody tr').count() === 12, 'monthly table has twelve rows');
  ok(await energy.page.locator('#energy-monthly-table caption').count() === 1, 'monthly table has a caption');
  ok(await energy.page.locator('#energy-form fieldset').count() === 3, 'explorer groups controls into three fieldsets');
  ok(await energy.page.locator('#energy-form label').count() >= 12, 'every explorer control has a visible label');
  ok(await energy.page.locator('#energy-status[role="status"][aria-live="polite"]').count() === 1, 'explorer status is a polite live region');
  ok(await energy.page.locator('#out-kwp').textContent() === '3.6', 'initial result shows the modelled Woodland Cottage capacity');
  ok(/Woodland Cottage/.test(await energy.page.locator('#result-home').textContent()), 'initial result names the selected home');
  await energy.page.locator('#explorer').scrollIntoViewIfNeeded();
  await shot(energy.page, 'energy-explorer');

  await energy.page.selectOption('#residence', 'hamlet-cross-stacked-retreat');
  await energy.page.waitForTimeout(250);
  ok(await energy.page.locator('#out-kwp').textContent() === '7.2', 'changing the residence updates installed capacity');
  ok(/Cross-Stacked/.test(await energy.page.locator('#result-home').textContent()), 'changing the residence updates the result heading');
  await energy.page.fill('#panels', '6');
  await energy.page.dispatchEvent('#panels', 'change');
  await energy.page.waitForTimeout(250);
  ok(await energy.page.locator('#out-kwp').textContent() === '2.7', 'changing the panel count updates capacity consistently');
  ok(Number(await energy.page.locator('#out-warnings').textContent()) > 0, 'an undersized or misfitting array reports layout warnings');
  await energy.page.fill('#panels', '16');
  await energy.page.dispatchEvent('#panels', 'change');
  await energy.page.waitForTimeout(250);
  ok(await energy.page.locator('#out-kwp').textContent() === '7.2', 'restoring sixteen panels restores the capacity');
  await energy.page.selectOption('#occupancy', 'winter-intermittent');
  await energy.page.waitForTimeout(250);
  ok(/intermittent winter/i.test(await energy.page.locator('#energy-summary').textContent()), 'changing occupancy updates the plain-language summary');
  await energy.page.selectOption('#shared', 'none');
  await energy.page.waitForTimeout(250);
  const noShared = parseFloat(await energy.page.locator('#out-shortfall').textContent());
  await energy.page.selectOption('#shared', 'backup');
  await energy.page.waitForTimeout(250);
  const withShared = parseFloat(await energy.page.locator('#out-shortfall').textContent());
  ok(noShared >= withShared, 'removing shared electricity does not reduce the modelled shortfall');
  await energy.page.selectOption('#compare-home', 'hamlet-woodland-cottage');
  await energy.page.waitForTimeout(250);
  ok((await energy.page.locator('#compare-two-body tr').count()) >= 10, 'two-home comparison shows the full measure set');
  ok(/Woodland Cottage/.test(await energy.page.locator('#compare-b-head').textContent()), 'two-home comparison updates the comparison heading');
  await energy.page.selectOption('#residence', 'hamlet-woodland-cottage');
  await energy.page.waitForTimeout(250);
  const downloadPromise = energy.page.waitForEvent('download');
  await energy.page.click('#download-energy');
  const download = await downloadPromise;
  const saved = path.join(TMP, 'energy.json');
  await download.saveAs(saved);
  const payload = JSON.parse(fs.readFileSync(saved, 'utf8'));
  ok(payload.summary && payload.inputs && Array.isArray(payload.monthly) && payload.monthly.length === 12, 'downloadable JSON contains inputs, summary and twelve monthly rows');
  ok(/Concept estimate/.test(payload.note) && payload.fictional === true, 'downloadable JSON states that it is a fictional concept estimate');
  await axe(energy.page, 'energy explorer');
  await shot(energy.page, 'energy-explorer-full', true);

  // Keyboard operation of the native controls.
  await energy.page.locator('#residence').focus();
  await energy.page.keyboard.press('ArrowDown');
  await energy.page.waitForTimeout(200);
  ok(await energy.page.evaluate(() => document.activeElement && document.activeElement.id === 'residence'), 'the residence select keeps a visible focus target after keyboard use');
  ok(await energy.page.evaluate(() => { const s = getComputedStyle(document.activeElement); return s.outlineStyle !== 'none' || s.boxShadow !== 'none' || s.outlineWidth !== '0px'; }), 'the focused control has a visible focus indicator');
  ok(energy.foreign.length === 0, `energy page: no third-party requests${energy.foreign.length ? ': ' + energy.foreign.join(', ') : ''}`);

  const reflow = await open('design-lab/energy/', { viewport: { width: 320, height: 780 } });
  ok(await reflow.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), 'energy page reflows without horizontal page scrolling at 320 px');
  await axe(reflow.page, 'energy page at 320 px');
  await reflow.context.close();
  const dark = await open('design-lab/energy/', { colorScheme: 'dark' });
  await axe(dark.page, 'energy page in dark mode');
  await shot(dark.page, 'energy-dark');
  await dark.context.close();
  const forced = await open('design-lab/energy/', { forcedColors: 'active' });
  await axe(forced.page, 'energy page in forced colours');
  await forced.context.close();
  const reduced = await open('design-lab/energy/', { reducedMotion: 'reduce' });
  await axe(reduced.page, 'energy page with reduced motion');
  await reduced.context.close();

  section('Architecture energy sections');
  const arch = await open('design-lab/architecture/hamlet-solar-studio-stack/');
  await arch.page.waitForTimeout(500);
  ok(arch.errors.length === 0, `architecture energy section: no console errors${arch.errors.length ? ': ' + arch.errors.join(' | ') : ''}`);
  ok(await arch.page.locator('#energy').count() === 1, 'architecture page carries the residential energy section');
  ok(await arch.page.locator('#energy table').count() >= 4, 'architecture energy section includes arrays, battery, scenarios and monthly tables');
  const energyText = await arch.page.locator('#energy').innerText();
  ok(/10 panels/.test(energyText) && /4.5 kWp/.test(energyText), 'architecture energy section states the installed array');
  ok(/Five cloudy|five-day/i.test(energyText), 'architecture energy section states the winter shortfall');
  await axe(arch.page, 'architecture energy section');
  await arch.context.close();

  section('Residences energy comparison');
  const residences = await open('design-lab/residences/');
  ok(residences.errors.length === 0, `residence energy comparison: no console errors${residences.errors.length ? ': ' + residences.errors.join(' | ') : ''}`);
  ok(await residences.page.locator('#energy-table tbody tr').count() === 6, 'residence page has six energy comparison rows');
  ok(/68 panels/.test(await residences.page.locator('#energy').innerText()) && /30.6 kWp/.test(await residences.page.locator('#energy').innerText()), 'residence energy comparison states the 68-panel, 30.6 kWp reference set');
  ok(await residences.page.locator('#energy-table caption').count() === 1, 'residence energy table has a caption');
  await axe(residences.page, 'residence energy comparison');
  await residences.context.close();

  section('Design Lab editor energy controls');
  const editor = await open('design-lab/editor/?preset=hamlet-woodland-cottage');
  await editor.page.waitForSelector('#en-panels', { timeout: 20000 });
  ok(editor.errors.length === 0, `editor energy controls: no console errors${editor.errors.length ? ': ' + editor.errors.join(' | ') : ''}`);
  ok(await editor.page.locator('#energy-controls input').count() >= 10, 'editor exposes energy, array and battery inputs');
  ok(await editor.page.locator('#en-panels').inputValue() === '8', 'editor starts from the canonical eight-panel array');
  await editor.page.fill('#en-panels', '6');
  await editor.page.dispatchEvent('#en-panels', 'change');
  await editor.page.waitForTimeout(400);
  ok(/6 panels/.test(await editor.page.locator('#energy-report').innerText()), 'editor recalculates the modelled panel count');
  ok(/autonomy/.test(await editor.page.locator('#energy-report').innerText()), 'editor reports battery autonomy');
  await editor.page.fill('#m-0-x', '1.5');
  await editor.page.dispatchEvent('#m-0-x', 'change');
  await editor.page.waitForTimeout(400);
  ok(/No panel-placement warnings|placement or assumption warning/.test(await editor.page.locator('#energy-report').innerText()), 'moving a module revalidates the solar placement');
  ok(await editor.page.locator('#energy-report').innerText().then((t) => t.length > 50), 'editor keeps the energy report visible after a geometry change');
  const undoDisabled = await editor.page.locator('#undo').isDisabled();
  ok(undoDisabled === false, 'energy edits remain in the undo history');
  await axe(editor.page, 'editor energy controls');
  await shot(editor.page, 'editor-energy');
  await editor.context.close();

  section('Pattern language extensions');
  const patterns = await open('design-lab/pattern-language/');
  ok(patterns.errors.length === 0, `pattern extensions: no console errors${patterns.errors.length ? ': ' + patterns.errors.join(' | ') : ''}`);
  ok(await patterns.page.locator('#extension-right-sized-energy').count() === 1, 'energy pattern extensions are rendered in the Explorer');
  ok(await patterns.page.locator('[data-extension]').count() === 10, 'ten original energy-pattern extensions are shown');
  ok(/Project extension, not an Alexander pattern/.test(await patterns.page.locator('#extension-right-sized-energy').innerText()), 'each extension is labelled as a project extension');
  ok(/not from A Pattern Language/i.test(await patterns.page.locator('#extension-right-sized-energy').innerText()), 'extension card disclaims Alexander authorship');
  await axe(patterns.page, 'pattern language extensions');
  await patterns.context.close();

  section('Local links and cleanup');
  ok(fs.readFileSync(path.join(SITE, 'design-lab/energy/index.html'), 'utf8').includes('energy-app.js'), 'published energy page loads its local application script');
} finally {
  await browser.close();
  server.close();
}

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
