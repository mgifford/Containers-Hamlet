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
  const guides = await open('design-lab/guides/');
  ok(guides.errors.length === 0, `guide hub: no console errors${guides.errors.length ? ': ' + guides.errors.join(' | ') : ''}`);
  ok(await guides.page.locator('.hub-grid a').count() === 7, 'guide hub shows seven guides');
  await axe(guides.page, 'guide hub');
  await shot(guides.page, 'design-guides');
  const vegetation = await open('design-lab/vegetation/');
  const navHeights = await vegetation.page.evaluate(() => [...document.querySelectorAll('header nav, .subnav')].map((n) => n.getBoundingClientRect().height));
  ok(navHeights.length === 2 && navHeights.every((h) => h < 70), 'vegetation page has a compact two-level navigation');
  await axe(vegetation.page, 'vegetation navigation');
  await vegetation.context.close();
  await guides.context.close();

  section('Design gallery');
  let { context, page, errors, foreign } = await open('design-lab/');
  ok(errors.length === 0, `gallery: no console errors${errors.length ? ': ' + errors.join(' | ') : ''}`);
  const count = await page.evaluate(() => ({ cards: document.querySelectorAll('.concept-card:not(.arrangement-card)').length, editable: document.querySelectorAll('.concept-badge.editable').length, hamlet: document.querySelectorAll('.concept-badge.hamlet').length, inspiration: [...document.querySelectorAll('.concept-badge')].filter((b) => /Inspiration only/.test(b.textContent)).length, archive: [...document.querySelectorAll('.concept-badge')].filter((b) => /Experimental archive/.test(b.textContent)).length, headings: document.querySelectorAll('h1').length }));
  ok(count.cards === 6 && count.editable === 0 && count.hamlet === 6 && count.inspiration === 0 && count.archive === 0 && count.headings === 1, 'selected gallery shows six concept cards and six hamlet residences');
  ok(await page.locator('.arrangement-card').count() === 0, 'selected gallery does not load the arrangement studies');
  ok(await page.locator('.concept-specs').first().evaluate((d) => !d.open), 'technical specification lists start collapsed');
  await page.locator('.concept-specs').first().locator('summary').click();
  ok(await page.locator('.concept-specs').first().evaluate((d) => d.open), 'specification disclosure opens by keyboard or pointer');

  await page.locator('#gallery').scrollIntoViewIfNeeded();
  await page.evaluate(async () => { for (const img of document.querySelectorAll('.concept-card-media img')) { img.scrollIntoView({ block: 'center' }); await new Promise((r) => setTimeout(r, 120)); } window.scrollTo(0, 0); });
  await page.waitForTimeout(1200);
  const imgs = await page.evaluate(() => [...document.querySelectorAll('.concept-card-media img')].map((i) => ({ w: i.naturalWidth, alt: i.alt })));
  ok(imgs.every((i) => i.w > 0 && i.alt.length > 20), 'every gallery illustration loads with descriptive alt text');
  ok(await page.locator('.concept-card').count() === 6 && await page.locator('a[href="concepts/"]').count() > 0, 'selected gallery exposes source files and links to the archive');
  await axe(page, 'gallery');
  await shot(page, 'gallery-top');
  await shot(page, 'gallery-full', true);
  ok(foreign.length === 0, `gallery: no third-party requests${foreign.length ? ': ' + foreign.join(', ') : ''}`);
  const hrefs = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => !/^(https?:|#|mailto:)/.test(h)))]);
  const broken = [];
  for (const h of hrefs) { const r = await page.request.get(new URL(h, BASE + 'design-lab/').href); if (r.status() !== 200) broken.push(h); }
  ok(broken.length === 0, `gallery: all ${hrefs.length} local links return 200${broken.length ? ': ' + broken.join(', ') : ''}`);
  await context.close();

  section('Concept archive page');
  const archive = await open('design-lab/concepts/');
  ok(archive.errors.length === 0, `archive: no console errors${archive.errors.length ? ': ' + archive.errors.join(' | ') : ''}`);
  const archiveState = await archive.page.evaluate(() => ({ cards: document.querySelectorAll('.concept-card:not(.arrangement-card)').length, editable: document.querySelectorAll('.concept-badge.editable').length, inspiration: [...document.querySelectorAll('.concept-badge')].filter((b) => /Inspiration only/.test(b.textContent)).length, arrangements: document.querySelectorAll('.arrangement-card').length, headings: document.querySelectorAll('h1').length }));
  ok(archiveState.cards === 10 && archiveState.editable === 3 && archiveState.inspiration === 7 && archiveState.arrangements === 4 && archiveState.headings === 1, 'archive page carries ten concepts, three editable presets and four arrangement studies');
  await archive.page.locator('.concept-card-media img').first().scrollIntoViewIfNeeded();
  await archive.page.waitForTimeout(600);
  ok(await archive.page.locator('.concept-card-media img').first().evaluate((i) => i.naturalWidth > 0), 'archive loads its first illustration');
  await axe(archive.page, 'concept archive');
  await shot(archive.page, 'archive-top');
  await archive.context.close();

  section('Concept visualisation placeholders');
  const visuals = await open('design-lab/visualisations/');
  ok(visuals.errors.length === 0, `visualisations: no console errors${visuals.errors.length ? ': ' + visuals.errors.join(' | ') : ''}`);
  const visualState = await visuals.page.evaluate(() => ({ images: document.querySelectorAll('.visual-card img').length, alts: [...document.querySelectorAll('.visual-card img')].every((i) => i.alt.length > 40), notice: /not model-verified/i.test(document.body.textContent), checklist: /Version 2 completion checklist/.test(document.body.textContent) }));
  ok(visualState.images === 3 && visualState.alts && visualState.notice && visualState.checklist, 'visualisation page shows three placeholders, descriptive alternatives, limits and the v2 checklist');
  await visuals.page.locator('.visual-card img').first().scrollIntoViewIfNeeded();
  await visuals.page.waitForTimeout(500);
  ok(await visuals.page.locator('.visual-card img').first().evaluate((i) => i.naturalWidth > 0), 'visualisation placeholder image loads');
  await axe(visuals.page, 'concept visualisations');
  await shot(visuals.page, 'visualisations-top');
  await visuals.context.close();

  section('Architectural gallery and accessible slideshow');
  let arch = await open('design-lab/architecture/common-lodge/');
  ok(arch.errors.length === 0, `architecture: no console errors${arch.errors.length ? ': ' + arch.errors.join(' | ') : ''}`);
  const archState = await arch.page.evaluate(() => ({
    slides: document.querySelectorAll('[data-slide]').length,
    current: document.querySelectorAll('.slide.is-current').length,
    visible: [...document.querySelectorAll('[data-slide]')].filter((e) => e.offsetParent !== null).length,
    controls: !!document.querySelector('[data-slide-controls]') && document.querySelector('[data-slide-controls]').offsetParent !== null,
    status: document.querySelector('[data-slide-status]').textContent,
    geometry: document.querySelectorAll('[data-slide] .badge.geometry').length,
    illustrative: document.querySelectorAll('[data-slide] .badge.illustrative').length,
    caps: [...document.querySelectorAll('[data-slide] figcaption')].every((e) => e.textContent.trim().length > 70),
    imgs: [...document.querySelectorAll('[data-slide] img')].every((i) => i.alt.length > 30),
    seasonal: document.querySelectorAll('.season-pair img').length,
    wall: !!document.querySelector('.assembly-section img'),
    veg: !!document.querySelector('.vegetation-section'),
    solar: !!document.querySelector('.solar-section img'),
    foundation: !!document.querySelector('.foundation-section img')
  }));
  ok(archState.slides >= 12 && archState.current === 1 && archState.visible === 1 && archState.controls, `architecture: ${archState.slides} slides, one current and visible controls`);
  ok(archState.geometry >= 9 && archState.illustrative >= 2, 'architecture: geometry-backed drawings and illustrative studies are labelled');
  ok(archState.caps && archState.imgs && (await arch.page.evaluate(() => document.querySelector('[data-slide].is-current img').naturalWidth > 0)), 'architecture: every view has a descriptive caption and alt text');
  ok(archState.seasonal >= 2 && archState.wall && archState.veg && archState.solar && archState.foundation, 'architecture: seasonal pair, wall, solar, foundation and vegetation sections are present');
  for (const sel of ['.season-pair', '.assembly-section', '.solar-section', '.foundation-section']) { await arch.page.locator(sel).first().scrollIntoViewIfNeeded(); await arch.page.waitForTimeout(250); }
  ok(await arch.page.evaluate(() => [...document.querySelectorAll('.season-pair img, .assembly-section img, .solar-section img, .foundation-section img')].every((i) => i.naturalWidth > 0)), 'architecture: seasonal, wall-section, solar and foundation images load');
  await arch.page.waitForTimeout(900);
  ok(new RegExp('View 1 of ' + archState.slides).test(await arch.page.textContent('[data-slide-status]')), 'architecture: does not advance automatically');
  await arch.page.focus('[data-slide-viewport]');
  await arch.page.keyboard.press('ArrowRight');
  await arch.page.waitForTimeout(150);
  ok(new RegExp('View 2 of ' + archState.slides).test(await arch.page.textContent('[data-slide-status]')), 'architecture: Right Arrow advances a view');
  await arch.page.keyboard.press('ArrowLeft');
  await arch.page.waitForTimeout(150);
  ok(new RegExp('View 1 of ' + archState.slides).test(await arch.page.textContent('[data-slide-status]')), 'architecture: Left Arrow returns a view');
  await arch.page.click('[data-slide-all]');
  await arch.page.waitForTimeout(150);
  const allShown = await arch.page.evaluate(() => ({ count: [...document.querySelectorAll('[data-slide]')].filter((e) => e.offsetParent !== null).length, expanded: document.querySelector('[data-slide-all]').getAttribute('aria-expanded') }));
  ok(allShown.count === archState.slides && allShown.expanded === 'true', 'architecture: Show all views exposes the non-carousel alternative');
  for (const img of await arch.page.locator('[data-slide] img').all()) { await img.scrollIntoViewIfNeeded(); await arch.page.waitForTimeout(40); }
  await arch.page.waitForTimeout(700);
  ok(await arch.page.evaluate(() => [...document.querySelectorAll('[data-slide] img')].every((i) => i.naturalWidth > 0)), 'architecture: all views load when the non-carousel alternative is shown');
  await arch.page.click('[data-slide-all]');
  await arch.page.waitForTimeout(150);
  await axe(arch.page, 'architecture');
  await shot(arch.page, 'architecture-top');
  await shot(arch.page, 'architecture-full', true);
  const archHrefs = await arch.page.evaluate(() => [...new Set([...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => !/^(https?:|#|mailto:)/.test(h)))]);
  const archBroken = [];
  for (const h of archHrefs) { const r = await arch.page.request.get(new URL(h, BASE + 'design-lab/architecture/common-lodge/').href); if (r.status() !== 200) archBroken.push(h); }
  ok(archBroken.length === 0, `architecture: all ${archHrefs.length} local links return 200${archBroken.length ? ': ' + archBroken.join(', ') : ''}`);
  await arch.context.close();

  const nojsArch = await open('design-lab/architecture/woodland-retreat/', { javaScriptEnabled: false });
  const nojsState = await nojsArch.page.evaluate(() => ({ visible: [...document.querySelectorAll('[data-slide]')].filter((e) => e.offsetParent !== null).length, controls: !!document.querySelector('[data-slide-controls]') && document.querySelector('[data-slide-controls]').offsetParent !== null, note: /JavaScript is off/.test(document.body.textContent) }));
  ok(nojsState.visible >= 12 && nojsState.controls === false && nojsState.note, 'architecture: no-JavaScript fallback shows all views and explains itself');
  await nojsArch.context.close();

  section('Gallery-to-editor navigation');
  const fromArch = await open('design-lab/architecture/woodland-retreat/');
  await Promise.all([
    fromArch.page.waitForURL('**/design-lab/editor/?preset=woodland-retreat'),
    fromArch.page.click('a[href*="editor/?preset=woodland-retreat"]')
  ]);
  await fromArch.page.waitForSelector('#preset');
  ok(/design-lab\/editor/.test(fromArch.page.url()) && (await fromArch.page.inputValue('#preset')) === 'woodland-retreat', 'architectural gallery links to the matching editable preset');
  await fromArch.context.close();

  section('Design comparison');
  let compare = await open('design-lab/compare/');
  ok(compare.errors.length === 0, `compare: no console errors${compare.errors.length ? ': ' + compare.errors.join(' | ') : ''}`);
  const compareState = await compare.page.evaluate(() => ({ options: document.querySelectorAll('#compare-a option').length, panels: document.querySelectorAll('.compare-panel').length, rows: document.querySelectorAll('.all-concepts tbody tr').length, text: document.body.textContent }));
  ok(compareState.options === 16 && compareState.panels === 2 && compareState.rows === 16, 'compare: two side-by-side panels and all sixteen concepts in the table');
  ok(!/\b(kWh|kgCO2|cost \$|\$\d)/i.test(compareState.text), 'compare: no invented energy, carbon or cost figures');
  await compare.page.selectOption('#compare-a', 'common-lodge');
  await compare.page.waitForTimeout(250);
  ok(/Common Lodge/.test(await compare.page.textContent('#compare-grid .compare-panel h2')), 'compare: changing Concept A updates the side-by-side view');
  const beforeSwap = [await compare.page.inputValue('#compare-a'), await compare.page.inputValue('#compare-b')];
  await compare.page.click('#compare-swap');
  await compare.page.waitForTimeout(200);
  const afterSwap = [await compare.page.inputValue('#compare-a'), await compare.page.inputValue('#compare-b')];
  ok(afterSwap[0] === beforeSwap[1] && afterSwap[1] === beforeSwap[0], 'compare: Swap A and B exchanges the two concepts');
  await axe(compare.page, 'compare');
  await shot(compare.page, 'compare-top');
  await shot(compare.page, 'compare-full', true);
  await compare.context.close();

  const nojsCompare = await open('design-lab/compare/', { javaScriptEnabled: false });
  const nojsCompareState = await nojsCompare.page.evaluate(() => ({ panels: document.querySelectorAll('.compare-panel').length, rows: document.querySelectorAll('.all-concepts tbody tr').length, note: /JavaScript is off/.test(document.body.textContent) }));
  ok(nojsCompareState.panels === 2 && nojsCompareState.rows === 16 && nojsCompareState.note, 'compare: no-JavaScript fallback keeps the default comparison and table');
  await nojsCompare.context.close();

  section('Hamlet residences comparison');
  const residences = await open('design-lab/residences/');
  ok(residences.errors.length === 0, `residences: no console errors${residences.errors.length ? ': ' + residences.errors.join(' | ') : ''}`);
  const resState = await residences.page.evaluate(() => ({ rows: document.querySelectorAll('#residence-table tbody tr').length, cards: document.querySelectorAll('.residence-card').length, options: document.querySelectorAll('#sort-residences option').length, similarity: document.querySelectorAll('#similarity-table tbody tr').length, alternatives: document.querySelectorAll('#alternatives-table tbody tr').length }));
  ok(resState.rows === 6 && resState.cards === 6 && resState.options >= 6, 'residences page shows six accessible rows and six cards with sorting controls');
  const siteRecon = await residences.page.evaluate(() => ({ rows: document.querySelectorAll('#site-reconciliation-table tbody tr').length, conflicts: /unresolved|conflict/i.test(document.querySelector('#site-reconciliation-table').textContent) }));
  ok(siteRecon.rows === 7 && siteRecon.conflicts, 'residences page reconciles seven site buildings and records placement conflicts');
  ok(resState.similarity === 15 && resState.alternatives === 3, 'residences page shows pairwise diversity and three two-storey alternatives');
  await residences.page.selectOption('#filter-storeys', '2');
  await residences.page.click('#apply-residences');
  await residences.page.waitForTimeout(250);
  const filtered = await residences.page.evaluate(() => [...document.querySelectorAll('#residence-table tbody tr')].filter((r) => !r.hidden).length);
  ok(filtered === 3 && /Showing 3 of 6/.test(await residences.page.textContent('#residence-status')), 'storey filter shows the three two-storey homes');
  await residences.page.click('#reset-residences');
  await residences.page.waitForTimeout(250);
  ok(/Showing all 6/.test(await residences.page.textContent('#residence-status')), 'reset restores all six residences');
  await axe(residences.page, 'residences comparison');
  await shot(residences.page, 'residences-top');
  await shot(residences.page, 'residences-full', true);
  await residences.context.close();
  const nojsResidences = await open('design-lab/residences/', { javaScriptEnabled: false });
  const nojsResState = await nojsResidences.page.evaluate(() => ({ rows: document.querySelectorAll('#residence-table tbody tr').length, cards: document.querySelectorAll('.residence-card').length, note: /JavaScript is off/.test(document.body.textContent) }));
  ok(nojsResState.rows === 6 && nojsResState.cards === 6 && nojsResState.note, 'residences: no-JavaScript fallback keeps the full table and cards');
  await nojsResidences.context.close();

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
  ok(initial.presets === 9, 'editor lists the nine editable concepts');
  ok(initial.modules === 1 && initial.openings > 0 && initial.zones > 0, 'editor loads modules, openings and room zones');
  ok(initial.plan && initial.exterior && initial.cutaway, 'editor renders plan, exterior and cutaway from the start');
  ok(/No invalid data or geometry/.test(initial.status) && initial.warnings > 0, 'editor starts with valid geometry and professional-review prompts');
  const editorHrefs = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => !/^(https?:|#|mailto:)/.test(h)))]);
  const editorBroken = [];
  for (const h of editorHrefs) { const r = await page.request.get(new URL(h, BASE + 'design-lab/editor/').href); if (r.status() !== 200) editorBroken.push(h); }
  ok(editorBroken.length === 0, `editor: all ${editorHrefs.length} local links return 200${editorBroken.length ? ': ' + editorBroken.join(', ') : ''}`);
  await axe(page, 'editor');
  await shot(page, 'editor-top');
  await shot(page, 'editor-full', true);

  section('Editor: storeys, stacking and support');
  await page.selectOption('#preset', 'hamlet-offset-stack');
  await page.waitForTimeout(400);
  ok(await page.evaluate(() => document.querySelectorAll('[data-module-card]').length === 2), 'two-storey preset loads both modules');
  ok(await page.evaluate(() => document.querySelectorAll('#edit-storey option').length === 3 && document.querySelectorAll('#plan-level option').length === 3), 'editor offers all-levels, ground and upper level selectors');
  ok(Number(await page.inputValue('#m-1-elev')) > Number(await page.inputValue('#m-0-elev')), 'upper module has a higher explicit base elevation');
  await page.selectOption('#plan-level', '1');
  await page.waitForTimeout(300);
  ok(/outline/.test(await page.evaluate(() => document.querySelector('#plan').innerHTML)), 'upper plan keeps the ground floor as muted outlines');
  await page.selectOption('#plan-level', 'all');
  await page.waitForTimeout(200);
  await page.click('#inspect-support');
  await page.waitForTimeout(200);
  ok(/geometrically supported over/.test(await page.textContent('#support-report')), 'support inspection reports geometric bearing overlap');
  ok(/does not calculate load capacity/.test(await page.textContent('#support-report')), 'support inspection states that capacity is not calculated');
  await page.click('#stack-above');
  await page.waitForTimeout(200);
  await page.click('[data-action="select-module"][data-module="m2"]');
  await page.waitForTimeout(200);
  await page.click('#stack-above');
  await page.waitForTimeout(200);
  ok(/already on the upper floor/i.test(await page.textContent('#status')), 'the editor refuses to stack above an upper module');
  await page.selectOption('#preset', 'hamlet-woodland-cottage');
  await page.waitForTimeout(400);
  await page.click('#stack-above');
  await page.waitForTimeout(400);
  ok(await page.evaluate(() => document.querySelectorAll('[data-module-card]').length === 2 && document.querySelector('#plan-level').value === '1'), 'Stack above adds an upper module and switches to the upper plan');
  ok(/upper module added/i.test(await page.textContent('#status')) && /design intent only/i.test(await page.textContent('#status')), 'stacking announces that support is design intent only');
  await page.focus('#undo');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  ok(await page.evaluate(() => document.querySelectorAll('[data-module-card]').length === 1), 'Undo removes the stacked module');
  await page.focus('#plan .plan-module-hit');
  await page.keyboard.press('PageUp');
  await page.waitForTimeout(300);
  ok((await page.inputValue('#plan-level')) === '1', 'Page Up switches the plan to the upper level');
  await page.keyboard.press('PageDown');
  await page.waitForTimeout(300);
  ok((await page.inputValue('#plan-level')) === '0', 'Page Down switches the plan to the ground level');
  await page.keyboard.press('a');
  await page.waitForTimeout(300);
  ok((await page.inputValue('#plan-level')) === 'all', 'A returns the plan to all levels');
  ok(await page.evaluate(() => !!document.querySelector('#roof-type') && !!document.querySelector('#access-classification') && !!document.querySelector('#stair-type')), 'roof and accessibility controls are available');
  await page.selectOption('#roof-type', 'butterfly');
  await page.waitForTimeout(300);
  ok(/butterfly/i.test(await page.textContent('#summary')), 'changing the roof form updates the summary and views');
  await page.selectOption('#access-classification', 'potentially-adaptable');
  await page.waitForTimeout(300);
  ok(/potentially adaptable/i.test(await page.textContent('#summary')), 'changing accessibility classification updates the summary');
  await page.selectOption('#preset', 'hamlet-woodland-cottage');
  await page.waitForTimeout(300);

  section('Editor: illustration pipeline');
  ok(await page.evaluate(() => !!document.querySelector('#illus-view') && !!document.querySelector('#illus-generate') && !!document.querySelector('#illustration-prompt')), 'editor exposes the Illustrate controls and prompt output');
  await page.selectOption('#illus-view', 'front-approach');
  await page.waitForTimeout(200);
  await page.click('#illus-generate');
  await page.waitForTimeout(400);
  const illusFirst = await page.evaluate(() => ({ prompt: document.querySelector('#illustration-prompt').textContent, status: document.querySelector('#illustration-status').textContent, svg: !!document.querySelector('#illustration-reference svg') }));
  ok(illusFirst.svg && /front approach/i.test(illusFirst.prompt) && /Woodland Cottage/.test(illusFirst.prompt), 'Generate produces a reference SVG and a prompt from the current design');
  ok(/current for design hash/.test(illusFirst.status), 'generated illustration is marked current');
  const illusPromptBefore = illusFirst.prompt;
  await page.fill('#roof-pitch', '30');
  await page.locator('#roof-pitch').blur();
  await page.waitForTimeout(400);
  ok(/outdated/i.test(await page.textContent('#illustration-status')), 'changing the roof pitch marks the illustration prompt and reference outdated');
  await page.click('#illus-generate');
  await page.waitForTimeout(400);
  const illusAfter = await page.textContent('#illustration-prompt');
  ok(illusAfter !== illusPromptBefore && /30 degrees/.test(illusAfter) && /current for design hash/.test(await page.textContent('#illustration-status')), 'regeneration produces a new current prompt with the new roof pitch');
  await page.focus('#illus-generate');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  ok(/current for design hash/.test(await page.textContent('#illustration-status')), 'the Generate control is keyboard operable');
  const illusDl = page.waitForEvent('download');
  await page.click('#illus-download-prompt');
  const illusPromptFile = await illusDl;
  const illusPromptPath = path.join(TMP, 'illustration-prompt.md');
  await illusPromptFile.saveAs(illusPromptPath);
  ok(/Offset Stack|Woodland Cottage/.test(fs.readFileSync(illusPromptPath, 'utf8')), 'Download prompt saves the generated prompt');
  const pkgDl = page.waitForEvent('download');
  await page.click('#illus-download-package');
  const pkgFile = await pkgDl;
  const pkgPath = path.join(TMP, 'illustration-package.zip');
  await pkgFile.saveAs(pkgPath);
  const pkgBytes = fs.readFileSync(pkgPath);
  const pkgText = pkgBytes.toString('latin1');
  ok(pkgBytes.subarray(0, 4).toString('hex') === '504b0304', 'illustration package ZIP has a valid signature');
  ok(pkgText.includes('manifest.json') && pkgText.includes('prompts/exterior.md') && pkgText.includes('references/exterior-reference.svg') && pkgText.includes('drawings/roof-plan.svg'), 'illustration package ZIP contains the manifest, prompt, reference and drawings');
  await page.click('#illus-copy');
  await page.waitForTimeout(250);
  ok(/copied|select the prompt/i.test(await page.textContent('#illustration-status')), 'Copy prompt reports a copy or a manual fallback');

  section('Illustration pipeline page');
  const illusPage = await open('design-lab/illustration/');
  ok(illusPage.errors.length === 0, `illustration page: no console errors${illusPage.errors.length ? ': ' + illusPage.errors.join(' | ') : ''}`);
  const illusState = await illusPage.page.evaluate(() => ({ cards: document.querySelectorAll('.illustration-card').length, prompts: document.querySelectorAll('.prompt-preview').length, links: [...document.querySelectorAll('a[href]')].filter((a) => /illustration\//.test(a.getAttribute('href'))).length }));
  ok(illusState.cards === 6 && illusState.prompts >= 6, 'illustration page shows six generated packages and prompt previews');
  ok(/Design once|No AI image/.test(await illusPage.page.textContent('main')), 'illustration page explains the deterministic/generative distinction');
  await axe(illusPage.page, 'illustration page');
  await shot(illusPage.page, 'illustration-top');
  await shot(illusPage.page, 'illustration-full', true);
  await illusPage.context.close();

  section('Phase 3: interior editing and single-storey homes');
  const intEditor = await open('design-lab/editor/?preset=hamlet-woodland-cottage');
  ok(intEditor.errors.length === 0, `interior editor: no console errors${intEditor.errors.length ? ': ' + intEditor.errors.join(' | ') : ''}`);
  await intEditor.page.waitForTimeout(500);
  ok(/authored interior · 5 rooms · 0 invalid/.test(await intEditor.page.textContent('#interior-status')), 'Woodland Cottage opens with an authored five-room accessible interior and no invalid geometry');
  ok(await intEditor.page.locator('[data-interior-room]').count() === 5 && !!(await intEditor.page.$('#interior-plan svg')), 'interior editor shows five room cards and the generated interior plan');
  const interiorBeforeX = await intEditor.page.inputValue('[data-interior-room="w-living"] [data-interior-room-field="x"]');
  const interiorX = intEditor.page.locator('[data-interior-room="w-living"] [data-interior-room-field="x"]');
  await interiorX.focus();
  await interiorX.fill('-2');
  await interiorX.press('Tab');
  await intEditor.page.waitForTimeout(300);
  ok(/[1-9]\d* invalid/.test(await intEditor.page.textContent('#interior-status')), 'moving a room into another room is announced as invalid geometry');
  await intEditor.page.click('#undo');
  await intEditor.page.waitForTimeout(300);
  ok(/0 invalid/.test(await intEditor.page.textContent('#interior-status')) && await intEditor.page.inputValue('[data-interior-room="w-living"] [data-interior-room-field="x"]') === interiorBeforeX, 'undo restores the room geometry and validity');
  await intEditor.page.click('#add-interior-room');
  await intEditor.page.waitForTimeout(300);
  ok(await intEditor.page.locator('[data-interior-room]').count() === 6, 'Add room adds an editable room');
  await intEditor.page.locator('[data-action="remove-interior-room"]').last().click();
  await intEditor.page.waitForTimeout(300);
  ok(await intEditor.page.locator('[data-interior-room]').count() === 5, 'Remove room removes the selected room');
  await intEditor.page.click('#add-partition');
  await intEditor.page.waitForTimeout(300);
  ok(/Partitions/.test(await intEditor.page.textContent('#interior-details')), 'Add partition adds a removable partition');
  await intEditor.page.click('#add-fixture');
  await intEditor.page.waitForTimeout(300);
  ok(/Fixtures/.test(await intEditor.page.textContent('#interior-details')), 'Add fixture adds a fixture to the first room');
  await intEditor.page.locator('[data-action="remove-fixture"]').last().click();
  await intEditor.page.waitForTimeout(250);
  const intPkg = intEditor.page.waitForEvent('download');
  await intEditor.page.click('#illus-generate');
  await intEditor.page.waitForTimeout(300);
  await intEditor.page.click('#illus-download-package');
  const intPkgFile = await intPkg;
  const intPkgPath = path.join(TMP, 'interior-package.zip');
  await intPkgFile.saveAs(intPkgPath);
  const intPkgText = fs.readFileSync(intPkgPath).toString('latin1');
  ok(intPkgText.includes('prompts/interior.md') && intPkgText.includes('drawings/interior-plan.svg'), 'editor package includes the interior prompt and plan');
  await axe(intEditor.page, 'interior editor');
  await shot(intEditor.page, 'editor-interior');
  await intEditor.context.close();
  const accessibleEditor = await open('design-lab/editor/?preset=hamlet-accessible-garden-home');
  await accessibleEditor.page.waitForTimeout(500);
  ok(!/bathroom-turning-circle/.test(await accessibleEditor.page.textContent('#interior-details')) && /potentially adaptable/.test(await accessibleEditor.page.textContent('#interior-status')) && !/fully accessible/i.test(await accessibleEditor.page.textContent('#interior-status')), 'Accessible Garden Home has a modeled turning circle and does not claim full accessibility');
  const archiveEditor = await open('design-lab/editor/?preset=hamlet-offset-stack');
  await archiveEditor.page.waitForTimeout(500);
  ok(await archiveEditor.page.evaluate(() => document.querySelectorAll('[data-module-card]').length === 2 && document.querySelectorAll('#edit-storey option').length === 3), 'Offset Stack is an editable two-storey selected home');
  await archiveEditor.context.close();
  await accessibleEditor.context.close();

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

  section('Editor: envelope, season and vegetation');
  ok(await page.evaluate(() => !!document.querySelector('#env-assembly') && !!document.querySelector('#wall-section svg')), 'envelope controls and an explanatory wall section are available');
  const wallBefore = await page.evaluate(() => document.querySelector('#wall-section').innerHTML);
  await page.selectOption('#paint-palette', 'forest-ochre');
  await page.waitForTimeout(200);
  await page.check('#shelter-enabled');
  await page.uncheck('#fire-vents');
  await page.fill('#fire-space', '20');
  await page.locator('#fire-space').blur();
  await page.waitForTimeout(200);
  await page.selectOption('#foundation-system', 'ground-screws');
  await page.waitForTimeout(250);
  await page.fill('#foundation-clearance', '0.9');
  await page.locator('#foundation-clearance').blur();
  await page.waitForTimeout(250);
  await page.selectOption('#m-0-solar-season', 'winter');
  await page.waitForTimeout(250);
  await page.selectOption('#env-assembly', 'wood-fibre');
  await page.waitForTimeout(300);
  const wallAfter = await page.evaluate(() => document.querySelector('#wall-section').innerHTML);
  ok(wallBefore !== wallAfter && /Wood fibre/i.test(await page.evaluate(() => document.querySelector('#wall-section').textContent)), 'changing the assembly rebuilds the wall section');
  ok(await page.evaluate(() => !!document.querySelector('#solar-section svg')), 'solar tilt section is available');
  await page.fill('#m-0-solar-tilt', '60');
  await page.locator('#m-0-solar-tilt').blur();
  await page.waitForTimeout(300);
  ok(/60°/.test(await page.textContent('#solar-section')) && /PV 60°/.test(await page.evaluate(() => document.querySelector('#exterior').innerHTML)), 'changing solar tilt updates the section and exterior array label');
  ok(await page.evaluate(() => !!document.querySelector('#foundation-section svg')), 'foundation section is available');
  await page.fill('#foundation-clearance', '0.9');
  await page.locator('#foundation-clearance').blur();
  await page.waitForTimeout(300);
  ok(/0.9 m clearance/.test(await page.textContent('#foundation-section')), 'changing foundation clearance updates the section');
  await page.selectOption('#foundation-system', 'ground-screws');
  await page.waitForTimeout(300);
  ok(/ground-screws|Ground screws/i.test(await page.textContent('#foundation-section')), 'changing foundation system updates the section');
  const planHits = page.locator('#plan .plan-module-hit');
  ok(await planHits.count() === 2, 'the plan exposes each module as a focusable element');
  await planHits.first().focus();
  const beforeX = Number(await page.inputValue('[data-path="modules.0.position_m.0"]'));
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(250);
  const nudgedX = Number(await page.inputValue('[data-path="modules.0.position_m.0"]'));
  ok(Math.abs(nudgedX - (beforeX + 0.1)) < 0.001, 'arrow keys move the focused module by 0.1 m');
  await page.keyboard.press('Shift+ArrowRight');
  await page.waitForTimeout(250);
  const shiftedX = Number(await page.inputValue('[data-path="modules.0.position_m.0"]'));
  ok(Math.abs(shiftedX - (nudgedX + 0.5)) < 0.001, 'Shift+arrow moves the focused module by 0.5 m');
  const beforeRot = Number(await page.inputValue('[data-path="modules.0.rotation_deg"]'));
  await page.keyboard.press('r');
  await page.waitForTimeout(250);
  ok(Number(await page.inputValue('[data-path="modules.0.rotation_deg"]')) === (beforeRot + 15) % 360, 'R rotates the focused module');
  await planHits.first().scrollIntoViewIfNeeded();
  const box = await planHits.first().boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(80);
  await page.mouse.move(box.x + box.width / 2 + 20, box.y + box.height / 2 + 10, { steps: 4 });
  await page.mouse.up();
  await page.waitForTimeout(250);
  const dragX = Number(await page.inputValue('[data-path="modules.0.position_m.0"]')); ok(dragX !== shiftedX, 'dragging a plan module updates its position');
  ok(await page.locator('#plan .plan-module-hit').first().evaluate((e) => document.activeElement === e || document.activeElement === document.body), 'a dragged module returns focus to the plan');
  ok(await page.locator('#finish-controls').count() === 1, 'paint and entry-shelter controls are available');
  ok(await page.locator('#fire-controls').count() === 1, 'fire-resilience controls are available');
  await page.uncheck('#fire-vents');
  await page.fill('#fire-space', '20');
  await page.locator('#fire-space').blur();
  await page.waitForTimeout(300);
  ok(/20 m defensible space/.test(await page.textContent('#summary')), 'fire measures update the design summary');

  await page.selectOption('#paint-palette', 'forest-ochre');
  await page.waitForTimeout(300);
  ok(/Light-responsive body colour/.test(await page.textContent('#finish-note')) && /2f7d5f|2d775a/.test(await page.evaluate(() => document.querySelector('#exterior').innerHTML)), 'paint palette updates the model and note');
  await page.check('#shelter-enabled');
  await page.waitForTimeout(300);
  ok(/entry shelter/.test(await page.evaluate(() => document.querySelector('#plan').innerHTML)), 'enabling the entry shelter updates the plan');

  const summerExterior = await page.evaluate(() => document.querySelector('#exterior').innerHTML);
  await page.selectOption('#season', 'winter');
  await page.waitForTimeout(300);
  const winterExterior = await page.evaluate(() => document.querySelector('#exterior').innerHTML);
  ok(summerExterior !== winterExterior, 'Season control changes the exterior view');
  ok(/winter/i.test(await page.textContent('#status')), 'Season change is announced');
  await page.selectOption('#season', 'summer');
  await page.waitForTimeout(200);
  const vegBefore = await page.evaluate(() => document.querySelectorAll('.vegetation-card').length);
  await page.focus('#add-vegetation');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
  ok((await page.evaluate(() => document.querySelectorAll('.vegetation-card').length)) === vegBefore + 1, 'keyboard activation adds a vegetation system');
  ok((await page.textContent('#exposure')).length > 40, 'seasonal exposure panel describes glazing and maintenance');

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
  await page.selectOption('#preset', 'l-shaped-haven');
  await page.waitForTimeout(300);
  await page.fill('#m-1-x', '0');
  await page.locator('#m-1-x').blur();
  await page.fill('#m-1-y', '0');
  await page.locator('#m-1-y').blur();
  await page.waitForTimeout(300);
  ok(/invalid data or geometry/i.test(await page.textContent('#assessment-status')), 'same-level overlapping containers are reported as invalid geometry');
  ok(await page.evaluate(() => document.querySelector('#export-plan').disabled && document.querySelector('#export-zip').disabled), 'drawing and ZIP exports are disabled for invalid geometry');
  ok(await page.evaluate(() => !document.querySelector('#export-json').disabled), 'JSON export remains available to preserve the work');
  for (let u = 0; u < 4; u++) {
    if (/No invalid data or geometry/.test(await page.textContent('#assessment-status'))) break;
    await page.focus('#undo');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
  }
  ok(/No invalid data or geometry/.test(await page.textContent('#assessment-status')), 'Undo recovers valid geometry');

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
  await page.selectOption('#paint-palette', 'forest-ochre');
  await page.waitForTimeout(200);
  await page.check('#shelter-enabled');
  await page.uncheck('#fire-vents');
  await page.fill('#fire-space', '20');
  await page.locator('#fire-space').blur();
  await page.waitForTimeout(200);
  async function downloadFile(selector, name) {
    const ev = page.waitForEvent('download');
    await page.click(selector);
    const d = await ev;
    const file = path.join(TMP, name);
    await d.saveAs(file);
    return file;
  }
  await page.selectOption('#foundation-system', 'ground-screws');
  await page.waitForTimeout(250);
  await page.fill('#foundation-clearance', '0.9');
  await page.locator('#foundation-clearance').blur();
  await page.waitForTimeout(250);
  await page.selectOption('#m-0-solar-season', 'winter');
  await page.waitForTimeout(250);
  await page.selectOption('#env-assembly', 'wood-fibre');
  await page.waitForTimeout(250);
  await page.fill('#env-thickness', '180');
  await page.locator('#env-thickness').blur();
  await page.waitForTimeout(250);
  await page.fill('#thermal-roof', '360');
  await page.locator('#thermal-roof').blur();
  await page.selectOption('#thermal-window', 'double glazed, low-e, thermally broken frames');
  await page.waitForTimeout(200);
  const jsonFile = await downloadFile('#export-json', 'design.json');
  const parsed = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  ok(parsed.schema === 'containers-hamlet-design/v2.0' && parsed.modules.length === 2, 'exported JSON carries the v2 schema and both modules');
  ok(parsed.thermal && parsed.thermal.roof_insulation_mm === 360 && /double glazed/i.test(parsed.thermal.window_performance), 'thermal envelope choices persist in the exported JSON');
  ok(parsed.envelope && parsed.envelope.assembly === 'wood-fibre' && parsed.envelope.layers.some((l) => l.role === 'insulation'), 'envelope assembly and layers persist in the exported JSON');
  ok(parsed.vegetation && parsed.vegetation.length >= 1 && parsed.vegetation.every((v) => v.plant_type && v.irrigation && v.support && v.offset_m >= 0.3), 'vegetation and planting metadata persist in the exported JSON');
  ok(parsed.modules.some((m) => m.solar && m.solar.tilt_deg === 60 && m.solar.season_mode === 'winter'), 'solar tilt, azimuth and season persist in the exported JSON');
  ok(parsed.foundation && parsed.foundation.system === 'ground-screws' && parsed.foundation.clearance_m === 0.9 && parsed.foundation.no_compaction, 'foundation system, clearance and no-compaction persist in the exported JSON');
  ok(parsed.paint && parsed.paint.id === 'forest-ochre' && parsed.entry_shelter && parsed.entry_shelter.enabled && parsed.entry_shelter.security_shutters, 'paint and entry-shelter choices persist in the exported JSON');
  ok(parsed.fire && parsed.fire.defensible_space_m === 20 && parsed.fire.ember_resistant_vents === false, 'fire-resilience measures persist in the exported JSON');
  const wallFile = await downloadFile('#export-wall', 'wall.svg');
  ok(/^<svg|^<\?xml/.test(fs.readFileSync(wallFile, 'utf8').trim()), 'wall section SVG exports');
  const planFile = await downloadFile('#export-plan', 'plan.svg');
  ok(/^<svg|^<\?xml/.test(fs.readFileSync(planFile, 'utf8').trim()), 'exported plan is an SVG');
  const zipFile = await downloadFile('#export-zip', 'design.zip');
  ok(fs.readFileSync(zipFile).subarray(0, 4).toString('hex') === '504b0304', 'ZIP download has a valid ZIP signature');
  ok(fs.readFileSync(zipFile).toString('latin1').includes('design.json') && fs.readFileSync(zipFile).toString('latin1').includes('-porch.svg') && fs.readFileSync(zipFile).toString('latin1').includes('-winter.svg') && fs.readFileSync(zipFile).toString('latin1').includes('-wall.svg'), 'ZIP contains the editable JSON, outdoor/winter views and wall section');
  await page.setInputFiles('#import-file', jsonFile);
  await page.waitForTimeout(500);
  ok(/Imported design/.test(await page.textContent('#status')) && (await page.inputValue('#thermal-roof')) === '360' && (await page.inputValue('#env-assembly')) === 'wood-fibre' && (await page.evaluate(() => document.querySelectorAll('.vegetation-card').length)) >= 1, 'exported JSON reopens through Import with thermal, envelope, vegetation and solar values');
  const legacy = { schema: 'containers-hamlet-editor/v0.1', name: 'Legacy pair', preset: 'pair', modules: 2, module: { length_m: 12.192, width_m: 2.438, nominal: true }, envelope: { external_insulation_mm: 150, cladding: 'timber', roof: 'solar' }, porch: { depth_m: 3, start_m: 3, length_m: 4, screened: true }, openings: [{ id: 'W-N', face: 'north', position_m: 4, width_m: 1.2 }, { id: 'W-S', face: 'south', position_m: 8, width_m: 1.2 }], status: 'concept only', professional_review_required: true };
  const legacyFile = path.join(TMP, 'legacy.json');
  fs.writeFileSync(legacyFile, JSON.stringify(legacy));
  await page.setInputFiles('#import-file', legacyFile);
  await page.waitForTimeout(500);
  ok(/Migrated from containers-hamlet-editor\/v0\.1/.test(await page.textContent('#status')) && await page.evaluate(() => document.querySelectorAll('[data-module-card]').length === 2), 'v0.1 JSON imports through the migration path');
  await axe(page, 'editor after interaction');

  section('Vegetation guide');
  const vegPage = await open('design-lab/vegetation/');
  ok(vegPage.errors.length === 0, `vegetation guide: no console errors${vegPage.errors.length ? ': ' + vegPage.errors.join(' | ') : ''}`);
  const vegState = await vegPage.page.evaluate(() => ({ cards: document.querySelectorAll('.system-card').length, sources: [...document.querySelectorAll('.source-list a')].map((a) => a.href), text: document.body.textContent }));
  ok(vegState.cards === 4, 'vegetation guide: four system cards');
  ok(vegState.sources.length >= 8 && vegState.sources.some((u) => /ecohome/.test(u)) && vegState.sources.some((u) => /gsky/.test(u)) && vegState.sources.some((u) => /livewall/.test(u)) && vegState.sources.some((u) => /wallemi/.test(u)), 'vegetation guide: supplier and building-science sources');
  ok(!/\b(kWh|kgCO2|privacy score of|energy savings of)/i.test(vegState.text), 'vegetation guide: no invented energy, carbon or privacy figures');
  await axe(vegPage.page, 'vegetation guide');
  await shot(vegPage.page, 'vegetation-top');
  await shot(vegPage.page, 'vegetation-full', true);
  await vegPage.context.close();

  section('Community resilience and water');
  const resilience = await open('design-lab/resilience/');
  ok(resilience.errors.length === 0, `resilience page: no console errors${resilience.errors.length ? ': ' + resilience.errors.join(' | ') : ''}`);
  const resilienceText = await resilience.page.textContent('main');
  ok(/hamlet-scale system/.test(resilienceText) && /beyond the Ontario guidance/.test(resilienceText) && /Hotter, wetter, drier, smokier/.test(resilienceText) && /community resilience/.test(resilienceText), 'resilience page: fire, climate and community sections are present');
  await axe(resilience.page, 'resilience page');
  await shot(resilience.page, 'resilience-guide');
  await resilience.context.close();

  const water = await open('design-lab/water/');
  ok(water.errors.length === 0, `water page: no console errors${water.errors.length ? ': ' + water.errors.join(' | ') : ''}`);
  const waterState = await water.page.evaluate(() => ({ image: !!document.querySelector('.system-figure img'), output: document.querySelector('#water-result').textContent, inputs: document.querySelectorAll('#water-calc input').length }));
  ok(waterState.image && waterState.inputs === 7 && /Illustrative harvest/.test(waterState.output), 'water page: diagram, seven inputs and calculated result are present');
  await water.page.fill('#roof-area', '72');
  await water.page.fill('#people', '4');
  await water.page.click('#calc-water');
  await water.page.waitForTimeout(200);
  ok(/Illustrative harvest/.test(await water.page.textContent('#water-result')) && /L\/year/.test(await water.page.textContent('#water-result')), 'water calculator updates from the inputs');
  await axe(water.page, 'water page');
  await shot(water.page, 'water-guide');
  await water.context.close();

  section('Two-storey study');
  const storey = await open('design-lab/two-storey/');
  ok(storey.errors.length === 0, `two-storey study: no console errors${storey.errors.length ? ': ' + storey.errors.join(' | ') : ''}`);
  const storeyState = await storey.page.evaluate(() => ({ image: !!document.querySelector('.system-figure img'), text: document.body.textContent }));
  ok(storeyState.image && /Three ways to stack/.test(storeyState.text) && /Fire separation and egress/.test(storeyState.text) && /Not a Look inside model/.test(storeyState.text), 'two-storey study: options and model limits are present');
  ok(await storey.page.evaluate(() => document.querySelector('.system-figure img').naturalWidth > 0), 'two-storey study: option diagram loads');
  await axe(storey.page, 'two-storey study');
  await shot(storey.page, 'two-storey-study');
  await storey.context.close();

  section('Fire resilience guide');
  const firePage = await open('design-lab/fire/');
  ok(firePage.errors.length === 0, `fire guide: no console errors${firePage.errors.length ? ': ' + firePage.errors.join(' | ') : ''}`);
  const fireState = await firePage.page.evaluate(() => ({ image: !!document.querySelector('.system-figure img'), text: document.body.textContent, links: [...document.querySelectorAll('a')].map((a) => a.href) }));
  ok(fireState.image && /Steel helps/.test(fireState.text) && /Defensible space/.test(fireState.text) && /Codes, standards/.test(fireState.text), 'fire guide: steel limits, zones and code context are present');
  ok(await firePage.page.evaluate(() => document.querySelector('.system-figure img').naturalWidth > 0), 'fire guide: fire-zone diagram loads');
  ok(fireState.links.some((u) => /cbhcc-cchcc\.ca/.test(u)) && fireState.links.some((u) => /fmapprovals\.com/.test(u)) && fireState.links.some((u) => /ibhs\.org/.test(u)), 'fire guide: key fire references are linked');
  await axe(firePage.page, 'fire guide');
  await shot(firePage.page, 'fire-guide');
  await firePage.context.close();

  section('Container patterns and security');
  const patterns = await open('design-lab/patterns/');
  ok(patterns.errors.length === 0, `patterns guide: no console errors${patterns.errors.length ? ': ' + patterns.errors.join(' | ') : ''}`);
  const patternState = await patterns.page.evaluate(() => ({ rows: document.querySelectorAll('tbody tr').length, figure: !!document.querySelector('.system-figure img'), text: document.body.textContent, links: [...document.querySelectorAll('a')].map((a) => a.href) }));
  ok(patternState.rows >= 10 && patternState.figure && /doors as shelter/i.test(patternState.text) && /security checklist/i.test(patternState.text), 'patterns guide: configurations, doors, paint and security are present');
  ok(await patterns.page.evaluate(() => document.querySelector('.system-figure img').naturalWidth > 0), 'patterns guide: configuration diagram loads');
  ok(patternState.links.some((u) => /dornob\.com/.test(u)) && patternState.links.some((u) => /discovercontainers\.com/.test(u)) && patternState.links.some((u) => /instructables\.com/.test(u)) && patternState.links.some((u) => /houzz\.com/.test(u)), 'patterns guide: supplied precedents are linked');
  await axe(patterns.page, 'patterns guide');
  await shot(patterns.page, 'patterns-guide');
  await patterns.context.close();

  section('Ground and footbridge');
  const ground = await open('design-lab/ground/');
  ok(ground.errors.length === 0, `ground guide: no console errors${ground.errors.length ? ': ' + ground.errors.join(' | ') : ''}`);
  const groundState = await ground.page.evaluate(() => ({ rows: document.querySelectorAll('tbody tr').length, bridge: !!document.querySelector('.system-figure img'), text: document.body.textContent, links: [...document.querySelectorAll('.source-list a')].map((a) => a.href) }));
  ok(groundState.rows >= 10 && groundState.bridge && /footbridge/i.test(groundState.text), 'ground guide: foundation options and footbridge are present');
  await ground.page.waitForTimeout(300);
  ok(await ground.page.evaluate(() => document.querySelector('.system-figure img').naturalWidth > 0), 'ground guide: footbridge diagram loads');
  ok(groundState.links.some((u) => /wcl\.org\.uk/.test(u)) && groundState.links.some((u) => /technometalpost/.test(u)) && groundState.links.some((u) => /naturalbuildingcollective/.test(u)) && groundState.links.some((u) => /solidearthtech/.test(u)) && groundState.links.some((u) => /houzz/.test(u)), 'ground guide: supplied sources are linked');
  await axe(ground.page, 'ground guide');
  await shot(ground.page, 'ground-top');
  await shot(ground.page, 'ground-full', true);
  await ground.context.close();

  section('Responsive and preferences');
  const smallGallery = await open('design-lab/', { viewport: { width: 320, height: 640 } });
  await smallGallery.page.waitForTimeout(250);
  ok(await smallGallery.page.evaluate(() => document.documentElement.scrollWidth <= 320), 'gallery has no horizontal scrolling at 320 px');
  await axe(smallGallery.page, 'gallery at 320 px');
  await smallGallery.context.close();
  const smallVisuals = await open('design-lab/visualisations/', { viewport: { width: 320, height: 640 } });
  await smallVisuals.page.waitForTimeout(300);
  ok(await smallVisuals.page.evaluate(() => document.documentElement.scrollWidth <= 320), 'concept visualisations have no horizontal scrolling at 320 px');
  await axe(smallVisuals.page, 'concept visualisations at 320 px');
  await smallVisuals.context.close();
  const small = await open('design-lab/editor/', { viewport: { width: 320, height: 640 } });
  await small.page.waitForSelector('#plan svg');
  await small.page.waitForTimeout(250);
  const smallWidth = await small.page.evaluate(() => document.documentElement.scrollWidth);
  ok(smallWidth <= 320, `editor has no horizontal scrolling at 320 px (${smallWidth}px)`);
  await axe(small.page, 'editor at 320 px');
  await small.context.close();
  const forcedEditor = await open('design-lab/editor/?preset=hamlet-offset-stack', { forcedEditorColors: 'active' });
  await forcedEditor.page.waitForTimeout(400);
  ok(await forcedEditor.page.evaluate(() => !!document.querySelector('#interior-plan svg') && !!document.querySelector('#illustration-prompt')), 'forcedEditor-colours mode keeps the interior plan and prompt available');
  await axe(forcedEditor.page, 'editor in forcedEditor-colours mode');
  await forcedEditor.context.close();
  const reducedMotionPage = await open('design-lab/illustration/', { reducedMotionPageMotion: 'reduce' });
  await reducedMotionPage.page.waitForTimeout(300);
  ok(await reducedMotionPage.page.evaluate(() => document.documentElement.scrollWidth <= 1280 && !!document.querySelector('main')), 'reducedMotionPage-motion mode preserves the illustration page content');
  await axe(reducedMotionPage.page, 'illustration page with reducedMotionPage motion');
  await reducedMotionPage.context.close();
  const smallArch = await open('design-lab/architecture/woodland-retreat/', { viewport: { width: 320, height: 640 } });
  await smallArch.page.waitForTimeout(300);
  ok(await smallArch.page.evaluate(() => document.documentElement.scrollWidth <= 320), 'architecture gallery has no horizontal scrolling at 320 px');
  await axe(smallArch.page, 'architecture at 320 px');
  await smallArch.context.close();
  const smallCompare = await open('design-lab/compare/', { viewport: { width: 320, height: 640 } });
  await smallCompare.page.waitForTimeout(300);
  ok(await smallCompare.page.evaluate(() => document.documentElement.scrollWidth <= 320), 'comparison has no horizontal scrolling at 320 px');
  await axe(smallCompare.page, 'comparison at 320 px');
  await smallCompare.context.close();
  const darkArch = await open('design-lab/architecture/woodland-retreat/', { colorScheme: 'dark' });
  await axe(darkArch.page, 'architecture in dark scheme');
  await darkArch.context.close();
  const darkCompare = await open('design-lab/compare/', { colorScheme: 'dark' });
  await axe(darkCompare.page, 'comparison in dark scheme');
  await darkCompare.context.close();
  const smallResilience = await open('design-lab/resilience/', { viewport: { width: 320, height: 640 } });
  await smallResilience.page.waitForTimeout(300);
  ok(await smallResilience.page.evaluate(() => document.documentElement.scrollWidth <= 320), 'resilience page has no horizontal scrolling at 320 px');
  await axe(smallResilience.page, 'resilience page at 320 px');
  await smallResilience.context.close();
  const darkResilience = await open('design-lab/resilience/', { colorScheme: 'dark' });
  await axe(darkResilience.page, 'resilience page in dark scheme');
  await darkResilience.context.close();
  const smallWater = await open('design-lab/water/', { viewport: { width: 320, height: 640 } });
  await smallWater.page.waitForTimeout(300);
  ok(await smallWater.page.evaluate(() => document.documentElement.scrollWidth <= 320), 'water page has no horizontal scrolling at 320 px');
  await axe(smallWater.page, 'water page at 320 px');
  await smallWater.context.close();
  const darkWater = await open('design-lab/water/', { colorScheme: 'dark' });
  await axe(darkWater.page, 'water page in dark scheme');
  await darkWater.context.close();
  const smallStorey = await open('design-lab/two-storey/', { viewport: { width: 320, height: 640 } });
  await smallStorey.page.waitForTimeout(300);
  ok(await smallStorey.page.evaluate(() => document.documentElement.scrollWidth <= 320), 'two-storey study has no horizontal scrolling at 320 px');
  await axe(smallStorey.page, 'two-storey study at 320 px');
  await smallStorey.context.close();
  const darkStorey = await open('design-lab/two-storey/', { colorScheme: 'dark' });
  await axe(darkStorey.page, 'two-storey study in dark scheme');
  await darkStorey.context.close();
  const smallFire = await open('design-lab/fire/', { viewport: { width: 320, height: 640 } });
  await smallFire.page.waitForTimeout(300);
  ok(await smallFire.page.evaluate(() => document.documentElement.scrollWidth <= 320), 'fire guide has no horizontal scrolling at 320 px');
  await axe(smallFire.page, 'fire guide at 320 px');
  await smallFire.context.close();
  const darkFire = await open('design-lab/fire/', { colorScheme: 'dark' });
  await axe(darkFire.page, 'fire guide in dark scheme');
  await darkFire.context.close();
  const smallPatterns = await open('design-lab/patterns/', { viewport: { width: 320, height: 640 } });
  await smallPatterns.page.waitForTimeout(300);
  ok(await smallPatterns.page.evaluate(() => document.documentElement.scrollWidth <= 320), 'patterns guide has no horizontal scrolling at 320 px');
  await axe(smallPatterns.page, 'patterns guide at 320 px');
  await smallPatterns.context.close();
  const darkPatterns = await open('design-lab/patterns/', { colorScheme: 'dark' });
  await axe(darkPatterns.page, 'patterns guide in dark scheme');
  await darkPatterns.context.close();
  const smallGround = await open('design-lab/ground/', { viewport: { width: 320, height: 640 } });
  await smallGround.page.waitForTimeout(300);
  ok(await smallGround.page.evaluate(() => document.documentElement.scrollWidth <= 320), 'ground guide has no horizontal scrolling at 320 px');
  await axe(smallGround.page, 'ground guide at 320 px');
  await smallGround.context.close();
  const darkGround = await open('design-lab/ground/', { colorScheme: 'dark' });
  await axe(darkGround.page, 'ground guide in dark scheme');
  await darkGround.context.close();
  const smallVeg = await open('design-lab/vegetation/', { viewport: { width: 320, height: 640 } });
  await smallVeg.page.waitForTimeout(250);
  ok(await smallVeg.page.evaluate(() => document.documentElement.scrollWidth <= 320), 'vegetation guide has no horizontal scrolling at 320 px');
  await axe(smallVeg.page, 'vegetation guide at 320 px');
  await smallVeg.context.close();
  const darkVeg = await open('design-lab/vegetation/', { colorScheme: 'dark' });
  await axe(darkVeg.page, 'vegetation guide in dark scheme');
  await darkVeg.context.close();
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
