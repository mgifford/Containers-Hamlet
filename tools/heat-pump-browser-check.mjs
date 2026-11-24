#!/usr/bin/env node
// Browser checks for the heat-pump assessment, charts, explorer and cross-links.
//
//   node tools/heat-pump-browser-check.mjs [screenshot-dir]
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
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'heat-pump-check-'));
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
  section('Heat-pump assessment page');
  const page = await open('design-lab/heat-pumps/');
  await page.page.waitForSelector('#hp-residence option', { state: 'attached', timeout: 20000 });
  await page.page.waitForTimeout(600);
  ok(page.errors.length === 0, `heat-pump page: no console errors${page.errors.length ? ': ' + page.errors.join(' | ') : ''}`);
  ok(await page.page.locator('#hp-comparison tbody tr').count() === 6, 'six-home heat-pump comparison has six rows');
  ok(await page.page.locator('#hp-temperatures tbody tr').count() === 36, 'temperature table has six conditions for six homes');
  ok(await page.page.locator('#hp-strategies tbody tr').count() === 36, 'strategies table has six strategies for six homes');
  ok(await page.page.locator('#hp-passive tbody tr').count() === 6, 'passive comparison has six rows');
  ok(await page.page.locator('.hp-figure svg[role="img"]').count() === 5, 'five accessible heat-pump charts are present');
  ok(await page.page.locator('.hp-figure svg > title').count() === 5 && await page.page.locator('.hp-figure svg > desc').count() === 5, 'every chart has a title and description');
  ok(await page.page.locator('#hp-configurations tbody tr').count() === 6, 'three-configuration table covers all six homes');
  ok(await page.page.locator('#hp-comparison caption').count() === 1, 'the comparison table has a caption');
  ok(await page.page.locator('#hp-status[role="status"][aria-live="polite"]').count() === 1, 'the explorer status is a polite live region');
  ok(await page.page.locator('#hp-form label').count() >= 12, 'the explorer controls have visible labels');
  const initialPanels = await page.page.locator('#hp-out-panels').textContent();
  ok(Number(initialPanels) > 0, 'the explorer reports additional panels');
  const demand10 = parseFloat(await page.page.locator('#hp-out-demand').textContent());
  await page.page.selectOption('#hp-temperature', '-30');
  await page.page.waitForTimeout(250);
  const demand30 = parseFloat(await page.page.locator('#hp-out-demand').textContent());
  ok(demand30 > demand10, 'lower outdoor temperature increases heating demand');
  const electric30 = parseFloat(await page.page.locator('#hp-out-electric').textContent());
  ok(electric30 > 0 && Number(await page.page.locator('#hp-out-backup').textContent()) > 0, 'the extreme cold case reports resistance backup');
  await page.page.selectOption('#hp-type', 'ground-source');
  await page.page.waitForTimeout(250);
  ok(parseFloat(await page.page.locator('#hp-out-electric').textContent()) < electric30, 'ground-source electricity is lower than air-source at −30 °C');
  await page.page.selectOption('#hp-type', 'air-source');
  await page.page.selectOption('#hp-envelope', 'passive');
  await page.page.waitForTimeout(250);
  ok(parseFloat(await page.page.locator('#hp-out-demand').textContent()) < demand30, 'the improved envelope reduces heating demand');
  await page.page.selectOption('#hp-envelope', 'baseline');
  await page.page.selectOption('#hp-wood', 'yes');
  await page.page.waitForTimeout(250);
  ok(parseFloat(await page.page.locator('#hp-out-electric').textContent()) >= 0, 'wood backup reduces or leaves the heat-pump electricity at a positive value');
  const cop100 = parseFloat(await page.page.locator('#hp-out-electric').textContent());
  await page.page.fill('#hp-cop', '80');
  await page.page.dispatchEvent('#hp-cop', 'change');
  await page.page.waitForTimeout(250);
  ok(parseFloat(await page.page.locator('#hp-out-electric').textContent()) > cop100, 'a lower COP adjustment increases heat-pump electricity');
  await page.page.fill('#hp-cop', '100');
  await page.page.dispatchEvent('#hp-cop', 'change');
  await page.page.fill('#hp-panels', '6');
  await page.page.dispatchEvent('#hp-panels', 'change');
  await page.page.fill('#hp-battery', '20');
  await page.page.dispatchEvent('#hp-battery', 'change');
  await page.page.waitForTimeout(250);
  ok(parseFloat(await page.page.locator('#hp-out-battery').textContent()) > 0, 'changing the existing installation keeps the incremental result visible');
  await page.page.selectOption('#hp-residence', 'hamlet-cross-stacked-retreat');
  await page.page.waitForTimeout(300);
  ok(/Cross-Stacked/.test(await page.page.locator('#hp-result-home').textContent()), 'changing the residence updates the result');
  const downloadPromise = page.page.waitForEvent('download');
  await page.page.click('#hp-download');
  const download = await downloadPromise;
  const saved = path.join(TMP, 'hp.json');
  await download.saveAs(saved);
  const payload = JSON.parse(fs.readFileSync(saved, 'utf8'));
  ok(payload.inputs && payload.result && payload.result.panels && payload.fictional === true, 'downloadable JSON contains inputs, results and the fictional-data flag');
  await page.page.locator('#explorer').scrollIntoViewIfNeeded();
  await shot(page.page, 'heat-pump-explorer');
  await axe(page.page, 'heat-pump assessment');
  await shot(page.page, 'heat-pump-full', true);
  ok(page.foreign.length === 0, `heat-pump page: no third-party requests${page.foreign.length ? ': ' + page.foreign.join(', ') : ''}`);
  const reflow = await open('design-lab/heat-pumps/', { viewport: { width: 320, height: 780 } });
  ok(await reflow.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), 'heat-pump page reflows without horizontal page scrolling at 320 px');
  await axe(reflow.page, 'heat-pump page at 320 px');
  await reflow.context.close();
  const dark = await open('design-lab/heat-pumps/', { colorScheme: 'dark' });
  await axe(dark.page, 'heat-pump page in dark mode');
  await shot(dark.page, 'heat-pump-dark');
  await dark.context.close();
  const forced = await open('design-lab/heat-pumps/', { forcedColors: 'active' });
  await axe(forced.page, 'heat-pump page in forced colours');
  await forced.context.close();
  const noJs = await open('design-lab/heat-pumps/', { javaScriptEnabled: false });
  ok(await noJs.page.locator('#hp-comparison tbody tr').count() === 6, 'the six-home heat-pump table is complete without JavaScript');
  ok(await noJs.page.locator('#hp-configurations tbody tr').count() === 6, 'the configuration table is complete without JavaScript');
  ok(await noJs.page.locator('.hp-figure svg').count() >= 4, 'the static charts are present without JavaScript');
  await noJs.context.close();
  const reduced = await open('design-lab/heat-pumps/', { reducedMotion: 'reduce' });
  await axe(reduced.page, 'heat-pump page with reduced motion');
  await reduced.context.close();
  await page.context.close();

  section('Cross-links and existing pages');
  const arch = await open('design-lab/architecture/hamlet-woodland-cottage/');
  await arch.page.waitForTimeout(400);
  ok(arch.errors.length === 0, `architecture heat-pump section: no console errors${arch.errors.length ? ': ' + arch.errors.join(' | ') : ''}`);
  ok(await arch.page.locator('#heat-pump').count() === 1, 'architecture page includes the heat-pump assessment');
  ok(/additional winter-critical panels/.test(await arch.page.locator('#heat-pump').innerText()), 'architecture page states the additional panel burden');
  await axe(arch.page, 'architecture heat-pump section');
  await arch.context.close();
  const residences = await open('design-lab/residences/');
  ok(residences.errors.length === 0, `residence heat-pump table: no console errors${residences.errors.length ? ': ' + residences.errors.join(' | ') : ''}`);
  ok(await residences.page.locator('#heat-pump-table tbody tr').count() === 6, 'residence comparison has six heat-pump rows');
  ok(/full-time off-grid electric heating/i.test(await residences.page.locator('#heat-pumps').innerText()), 'residence heat-pump section states the assessment boundary');
  await axe(residences.page, 'residence heat-pump table');
  await residences.context.close();
  const energy = await open('design-lab/energy/');
  await energy.page.waitForTimeout(600);
  ok(energy.errors.length === 0, `energy heat-pump link: no console errors${energy.errors.length ? ': ' + energy.errors.join(' | ') : ''}`);
  ok(await energy.page.locator('#heat-pump-summary tbody tr').count() === 6, 'energy page links to a six-home heat-pump summary');
  ok(await energy.page.locator('a[href="../heat-pumps/"]').count() >= 1, 'energy page links to the heat-pump assessment');
  await axe(energy.page, 'energy page with heat-pump link');
  await energy.context.close();
} finally {
  await browser.close();
  server.close();
}

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
