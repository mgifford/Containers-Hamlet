#!/usr/bin/env node
// Browser checks with Playwright (Chromium) and axe-core:
// WCAG 2.2 A/AA rules in several states, keyboard access and focus visibility,
// reflow at 320 px, text spacing, reduced motion, dark mode, forced colours,
// no-JavaScript fallback, same-origin requests and working links.
//
//   npm install && node tools/browser-check.mjs [screenshot-dir]
//
// Set CHROMIUM_PATH to use a preinstalled Chromium. MIT licence.
import http from 'node:http';
import fs from 'node:fs';
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

let failures = 0;
let passes = 0;
const ok = (cond, msg) => {
  if (cond) { passes++; console.log(`  ok   ${msg}`); } else { failures++; console.log(`  FAIL ${msg}`); }
  return cond;
};
const section = (t) => console.log(`\n${t}`);

/* ---------- tiny static server ---------- */
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json', '.obj': 'text/plain', '.mtl': 'text/plain' };
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

async function open(url = '', options = {}) {
  if (typeof url === 'object') { options = url; url = ''; }
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...options });
  const page = await context.newPage();
  const errors = [];
  const foreign = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('request', (r) => { if (!r.url().startsWith(BASE) && !r.url().startsWith('data:')) foreign.push(r.url()); });
  await page.goto(BASE + url, { waitUntil: 'load' });
  return { context, page, errors, foreign };
}

async function axe(page, label) {
  if (!(await page.evaluate(() => !!window.axe))) await page.addScriptTag({ content: AXE });
  const r = await page.evaluate(() => window.axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    resultTypes: ['violations'],
  }));
  const detail = r.violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`).join('; ');
  ok(r.violations.length === 0, `${label}: axe-core finds no WCAG 2.2 A/AA violations${detail ? ' -> ' + detail : ''}`);
  const bp = await page.evaluate(() => window.axe.run(document, { runOnly: { type: 'tag', values: ['best-practice'] }, resultTypes: ['violations'] }));
  bp.violations.forEach((v) => console.log(`       note (best practice) ${v.id}: ${v.nodes.length} node(s)`));
}

const shot = async (page, name, full = false) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: full }); };
const visible = (page, sel) => page.evaluate((s) => { const e = document.querySelector(s); return !!e && e.offsetParent !== null && getComputedStyle(e).display !== 'none'; }, sel);

try {
  /* ------------------------------------------------------------ */
  section('Desktop, light scheme');
  let { context, page, errors, foreign } = await open();
  ok(errors.length === 0, `no console or script errors${errors.length ? ': ' + errors.join(' | ') : ''}`);
  await axe(page, 'initial page');
  await shot(page, 'desktop-top');

  section('Keyboard: skip link and focus order');
  await page.keyboard.press('Tab');
  const skip = await page.evaluate(() => { const e = document.activeElement; const r = e.getBoundingClientRect(); return { cls: e.className, top: r.top, bottom: r.bottom }; });
  ok(skip.cls === 'skip' && skip.top >= 0 && skip.bottom <= 900, 'first Tab reaches a visible skip link');
  await page.keyboard.press('Enter');
  ok(await page.evaluate(() => document.activeElement.id === 'main'), 'skip link moves focus to main content');

  // Walk with reduced motion so focus scrolling is instant and positions can be measured.
  const walk = await open({ reducedMotion: 'reduce' });
  const stops = [];
  for (let i = 0; i < 400; i++) {
    await walk.page.keyboard.press('Tab');
    const info = await walk.page.evaluate((n) => {
      const e = document.activeElement;
      if (!e || e === document.body) return { body: true };
      if (!e.dataset.walk) e.dataset.walk = String(n);
      const cs = getComputedStyle(e);
      const lab = e.closest('label');
      const ls = lab ? getComputedStyle(lab) : null;
      const ring = (s) => s && s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2;
      const r = e.getBoundingClientRect();
      const hit = document.elementFromPoint(Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2)), Math.min(innerHeight - 1, Math.max(0, r.top + Math.min(r.height / 2, 20))));
      return {
        key: e.dataset.walk,
        label: `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''} "${(e.getAttribute('aria-label') || (lab ? lab.textContent : e.textContent) || e.value || '').trim().slice(0, 40)}"`,
        ring: ring(cs) || ring(ls),
        inView: r.bottom > 0 && r.top < innerHeight && r.width > 0 && r.height > 0,
        clear: !!hit && (hit === e || e.contains(hit) || hit.contains(e) || (lab && lab.contains(hit))),
      };
    }, i);
    if (info.body) continue;
    if (stops.length && info.key === stops[0].key) break;
    stops.push(info);
  }
  ok(stops.length > 40 && stops.length < 400, `Tab cycles through ${stops.length} stops and returns to the start (no keyboard trap)`);
  const noRing = stops.filter((s) => !s.ring);
  ok(noRing.length === 0, `every focus stop shows a visible focus indicator${noRing.length ? ': ' + noRing.map((s) => s.label).join(', ') : ''}`);
  const hidden = stops.filter((s) => !s.inView || !s.clear);
  ok(hidden.length === 0, `every focused element is scrolled into view and not obscured${hidden.length ? ': ' + hidden.map((s) => s.label).join(', ') : ''}`);
  await walk.context.close();

  section('Keyboard: operating the controls');
  const detailsHeightBefore = await page.evaluate(() => document.querySelector('#building-details').getBoundingClientRect().height);
  await page.focus('[data-choice="c"]');
  await page.keyboard.press('Space');
  ok(await page.getAttribute('[data-choice="c"]', 'aria-pressed') === 'true', 'Space selects Cabin C (aria-pressed)');
  ok(/Cabin C, permanent home/.test(await page.textContent('#selected')), 'the status message announces the selection');
  ok(await page.evaluate(() => document.querySelector('#map-building-c').classList.contains('selected')), 'the map highlights Cabin C');
  ok(/from the shoreline/.test(await page.textContent('#building-details')) && /Main view/.test(await page.textContent('#building-details')), 'the details panel lists the view and computed siting checks');
  ok(Math.abs(await page.evaluate(() => document.querySelector('#building-details').getBoundingClientRect().height) - detailsHeightBefore) < 2, 'selecting a building does not resize the details panel');
  const mapKeyLayout = await page.evaluate(() => { const m = document.querySelector('.map').getBoundingClientRect(); const k = document.querySelector('#map-key').getBoundingClientRect(); return { mapRight: m.right, keyLeft: k.left, mapTop: m.top, keyTop: k.top }; });
  ok(mapKeyLayout.keyLeft >= mapKeyLayout.mapRight - 2 && Math.abs(mapKeyLayout.keyTop - mapKeyLayout.mapTop) < 80, 'the map key sits beside the map');
  await page.focus('.skip-local');
  await page.waitForTimeout(120);
  const localSkip = await page.evaluate(() => { const e = document.activeElement; const r = e.getBoundingClientRect(); return { cls: e.className, top: r.top, href: e.getAttribute('href') }; });
  ok(/skip-local/.test(localSkip.cls) && localSkip.href === '#map-key', 'the local skip link is focusable and targets the map key');
  await page.focus('[data-choice="lodge"]');
  await page.keyboard.press('Enter');
  ok(await page.getAttribute('[data-choice="c"]', 'aria-pressed') === 'false' && await page.getAttribute('[data-choice="lodge"]', 'aria-pressed') === 'true', 'Enter selects the lodge and releases Cabin C');
  await page.focus('[data-layer="trees"]');
  await page.keyboard.press('Space');
  ok(await page.evaluate(() => getComputedStyle(document.querySelector('#map-layer-trees')).display === 'none'), 'map layer checkbox hides the tree canopy');
  await page.keyboard.press('Space');
  await page.focus('[data-layer="terrain"]');
  await page.keyboard.press('Space');
  ok(await page.evaluate(() => getComputedStyle(document.querySelector('#map-layer-terrain')).display === 'none'), 'map layer checkbox hides the terrain relief');
  await page.keyboard.press('Space');
  ok(await page.evaluate(() => getComputedStyle(document.querySelector('#map-layer-potential')).display === 'none'), 'the illustrative potential-building layer starts hidden');

  section('Dedicated home pages');
  const homesIndex = await open('homes/');
  ok(homesIndex.errors.length === 0, `homes index: no console errors${homesIndex.errors.length ? ': ' + homesIndex.errors.join(' | ') : ''}`);
  const homesState = await homesIndex.page.evaluate(() => ({ cards: document.querySelectorAll('.home-index-card').length, links: [...document.querySelectorAll('.home-index-card h2 a')].map((a) => a.href) }));
  ok(homesState.cards === 7 && homesState.links.every((u) => /\/homes\/[a-z]+\/$/.test(u)), 'homes index has seven shareable home links');
  await axe(homesIndex.page, 'homes index');
  await shot(homesIndex.page, 'homes-index');
  const pine = await open('homes/c/');
  ok(pine.errors.length === 0, `Cabin C page: no console errors${pine.errors.length ? ': ' + pine.errors.join(' | ') : ''}`);
  const pineState = await pine.page.evaluate(() => ({ title: document.title, h1: document.querySelector('h1') && document.querySelector('h1').textContent, ids: [...document.querySelectorAll('h2[id]')].map((h) => h.id) }));
  ok(/Cabin C/.test(pineState.title) && /Pine/.test(pineState.h1), 'Cabin C page has its own title and heading');
  ok(['orientation','main-view','nearby','path','winter','siting','design-note','drawings'].every((id) => pineState.ids.indexOf(id) >= 0), 'Cabin C page has the shareable section anchors');
  await pine.page.goto(BASE + 'homes/c/#main-view');
  await pine.page.waitForTimeout(1200);
  ok(await pine.page.evaluate(() => location.hash === '#main-view' && document.querySelector('#main-view').getBoundingClientRect().top < 200), 'Cabin C #main-view anchor opens at the section');
  await axe(pine.page, 'Cabin C page');
  await shot(pine.page, 'cabin-c-page', true);
  await pine.context.close();
  await homesIndex.context.close();

  section('Main-page home cards and drawings');
  ok(await page.locator('#homes .home-index-card').count() === 7, 'the main page shows seven home cards');
  ok(await page.locator('#homes .home-card-image img').first().evaluate((i) => i.getAttribute('loading') === 'lazy'), 'home card diagrams are lazy-loaded');
  await page.click('[data-choice="a"]');
  const homeHref = await page.getAttribute('#building-details a', 'href');
  ok(/homes\/a\/$/.test(homeHref), 'the map details link points to the dedicated Cabin A page');

  await page.focus('input[name="cabin-a-view"]:checked');
  ok(await visible(page, '#cabin-a-floor-plan') && !(await visible(page, '#cabin-a-elevations')), 'only the chosen drawing is shown');
  await page.keyboard.press('ArrowRight');
  ok(await visible(page, '#cabin-a-elevations') && !(await visible(page, '#cabin-a-floor-plan')), 'arrow key switches the drawing to elevations');
  await page.keyboard.press('ArrowRight');
  ok(await visible(page, '#cabin-a-section'), 'arrow key switches the drawing to the section');

  const label = () => page.getAttribute('#explorer-canvas svg', 'aria-label');
  ok(/Cabin A: Viewed from the south-west, walls cut at 1\.2 m/.test(await label()), 'explorer renders an SVG with a text description');
  await page.focus('button[data-room="bath"]');
  await page.keyboard.press('Enter');
  ok(await page.getAttribute('button[data-room="bath"]', 'aria-pressed') === 'true', 'Enter highlights the bathroom');
  ok(/Bathroom: 2\.27 by 2\.27 m/.test(await page.textContent('#room-status')), 'room selection is announced through a status message');
  ok(/Bathroom highlighted/.test(await label()) && /Bathroom highlighted/.test(await page.textContent('#explorer-caption')), 'image description and caption follow the selection');
  await page.focus('input[name="ex-mode"]:checked');
  await page.keyboard.press('ArrowLeft');
  ok(/near walls cut away/.test(await label()), 'arrow keys change the cutaway mode');
  await page.focus('input[name="ex-view"]:checked');
  await page.keyboard.press('ArrowRight');
  ok(/south-east/.test(await label()), 'arrow keys turn the model');
  await page.focus('input[name="ex-roof"]:checked');
  await page.keyboard.press('ArrowRight');
  ok(await page.evaluate(() => document.querySelector('input[name="ex-roof"][value="biosolar"]').checked), 'roof option switches to the green roof');
  await page.focus('input[name="ex-building"]:checked');
  await page.keyboard.press('ArrowRight');
  ok(/Lodge:/.test(await label()) && await page.$('button[data-room="hall"]') !== null, 'building switch loads the lodge and its rooms');
  await shot(page, 'desktop-explorer-lodge');
  await page.locator('#homes').screenshot({ path: SHOTS ? path.join(SHOTS, 'desktop-homes.png') : undefined }).catch(() => {});
  await page.click('[data-choice="a"]');
  await page.click('#building-details a[data-explore]');
  ok(/Cabin A:/.test(await label()), '"Look inside" from the map opens that building in the explorer');
  await axe(page, 'after interaction');
  ok(errors.length === 0, `no errors during interaction${errors.length ? ': ' + errors.join(' | ') : ''}`);
  ok(await page.evaluate(() => document.getAnimations().length === 0), 'no running animations');

  section('Requests and links');
  ok(foreign.length === 0, `no third-party requests${foreign.length ? ': ' + foreign.join(', ') : ''}`);
  const bad = log.filter((l) => l.status !== 200);
  ok(bad.length === 0, `every requested file exists${bad.length ? ': ' + bad.map((b) => b.url).join(', ') : ''}`);
  const hrefs = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => !/^(https?:|#|mailto:)/.test(h)))]);
  const broken = [];
  for (const h of hrefs) { const r = await page.request.get(BASE + h); if (r.status() !== 200) broken.push(h); }
  ok(broken.length === 0, `all ${hrefs.length} local links return 200${broken.length ? ': ' + broken.join(', ') : ''}`);
  await context.close();

  /* ------------------------------------------------------------ */
  section('Small screens (320 px, equivalent to 400% zoom)');
  ({ context, page, errors } = await open({ viewport: { width: 320, height: 640 } }));
  ok(await page.evaluate(() => document.documentElement.scrollWidth <= 320), 'no horizontal scrolling at 320 px');
  const small = await page.evaluate(() => [...document.querySelectorAll('button, fieldset.segmented label, .layers label, fieldset.checks label, .action, summary')]
    .filter((e) => e.offsetParent !== null).map((e) => { const r = e.getBoundingClientRect(); return { t: e.textContent.trim().slice(0, 30), w: r.width, h: r.height }; })
    .filter((r) => r.w < 24 || r.h < 24));
  ok(small.length === 0, `controls meet the 24 px target size${small.length ? ': ' + small.map((s) => s.t).join(', ') : ''}`);
  await axe(page, '320 px');
  await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }' });
  ok(await page.evaluate(() => document.documentElement.scrollWidth <= 320), 'WCAG text spacing overrides cause no horizontal scrolling at 320 px');
  await shot(page, 'mobile-full', true);
  await context.close();

  /* ------------------------------------------------------------ */
  section('Motion preferences');
  ({ context, page } = await open({ reducedMotion: 'reduce' }));
  ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scrolling');
  const moving = await page.evaluate(() => [...document.querySelectorAll('*')].filter((e) => { const s = getComputedStyle(e); return parseFloat(s.transitionDuration) > 0 || (s.animationName !== 'none' && parseFloat(s.animationDuration) > 0); }).length);
  ok(moving === 0, 'reduced motion: no transitions or animations anywhere');
  await context.close();
  ({ context, page } = await open({ reducedMotion: 'no-preference' }));
  ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'smooth', 'smooth scrolling only when motion is welcome');
  await context.close();

  /* ------------------------------------------------------------ */
  section('Dark scheme and forced colours');
  ({ context, page } = await open({ colorScheme: 'dark' }));
  await page.click('[data-choice="b"]');
  await axe(page, 'dark scheme');
  await shot(page, 'dark-top');
  await context.close();
  ({ context, page, errors } = await open({ forcedColors: 'active' }));
  await page.click('[data-choice="b"]');
  ok(await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('[data-choice="b"]')).borderTopWidth) >= 3), 'forced colours: pressed buttons keep a visible border');
  ok(errors.length === 0, 'forced colours: no errors');
  await shot(page, 'forced-colours');
  await context.close();

  /* ------------------------------------------------------------ */
  section('Without JavaScript (site scripts blocked)');
  context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.route(/\/(script|js\/[a-z-]+)\.js$/, (r) => r.abort());
  page = await context.newPage();
  await page.goto(BASE, { waitUntil: 'load' });
  ok(await page.evaluate(() => !document.documentElement.classList.contains('js') && !window.EcoModel), 'page loaded with its scripts blocked');
  for (const id of ['cabin-a-floor-plan', 'cabin-a-elevations', 'cabin-a-section', 'lodge-floor-plan', 'lodge-elevations', 'lodge-section']) {
    ok(await visible(page, `#${id}`), `#${id} is shown`);
  }
  ok(await visible(page, '#explorer-canvas img'), 'static cutaway image stands in for the explorer');
  ok(await page.evaluate(() => [...document.querySelectorAll('[data-enhance]')].every((e) => e.offsetParent === null)), 'script-only controls stay hidden');
  ok(await page.evaluate(() => document.querySelectorAll('table').length >= 7), 'all data tables are present');
  ok(await page.evaluate(() => [...document.querySelectorAll('#homes .home-index-card')].filter((e) => e.offsetParent !== null).length === 7), 'all seven home cards are visible without JavaScript');
  ok(await page.evaluate(() => document.querySelectorAll('#homes .home-card-image img').length === 7), 'all seven home-card view diagrams are present without JavaScript');
  await axe(page, 'no JavaScript');
  await context.close();
} finally {
  await browser.close();
  server.close();
}

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
