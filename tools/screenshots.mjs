#!/usr/bin/env node
// Capture review screenshots of the static site with Playwright.
// Usage: node tools/screenshots.mjs <output-dir>
// Set CHROMIUM_PATH to use a preinstalled Chromium. MIT licence.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = path.join(ROOT, 'site');
const OUT = path.resolve(ROOT, process.argv[2] || 'screenshots');
fs.mkdirSync(OUT, { recursive: true });

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json', '.obj': 'text/plain', '.mtl': 'text/plain' };
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(SITE, url.endsWith('/') ? url + 'index.html' : url);
  if (!file.startsWith(SITE) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404); res.end('not found'); return;
  }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const page = await context.newPage();
await page.goto(BASE, { waitUntil: 'load' });
await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

const shot = async (name, opts = {}) => {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), ...opts });
  console.log(`wrote ${path.join(OUT, `${name}.png`)}`);
};
const sectionShot = async (sel, name) => {
  const el = await page.$(sel);
  if (!el) { console.log(`skip ${name}: no ${sel}`); return; }
  await el.scrollIntoViewIfNeeded();
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await shot(name, { fullPage: false });
  await el.screenshot({ path: path.join(OUT, `${name}-section.png`) });
  console.log(`wrote ${path.join(OUT, `${name}-section.png`)}`);
};

await shot('desktop-top');
await shot('desktop-full', { fullPage: true });
await sectionShot('#explore', 'map');
const home = await page.$('[data-choice="a"]');
if (home) {
  await home.click();
  await page.waitForTimeout(100);
  await sectionShot('#explore', 'map-home-a');
}
for (const id of ['homes', 'cabin', 'inside', 'lodge', 'living', 'nature', 'adapt', 'downloads']) {
  const el = await page.$(`#${id}`);
  if (el) await sectionShot(`#${id}`, id);
}

const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const mp = await mobile.newPage();
await mp.goto(BASE, { waitUntil: 'load' });
await mp.screenshot({ path: path.join(OUT, 'mobile-top.png') });
await mp.screenshot({ path: path.join(OUT, 'mobile-full.png'), fullPage: true });
console.log(`wrote ${path.join(OUT, 'mobile-top.png')}`);
console.log(`wrote ${path.join(OUT, 'mobile-full.png')}`);

await mobile.close();
await context.close();
await browser.close();
server.close();
