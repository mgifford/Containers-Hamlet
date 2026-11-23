#!/usr/bin/env node
// Reference-conditioned image generation. Code: MIT.
// Default behaviour is a network-free plan + reference render. Image generation
// requires an explicit --provider and provider credentials.
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { buildPlan, composePrompt } from './lib/reference-generation.mjs';

const ROOT = process.cwd();
const DEFAULT_OUT = path.join('screenshots', 'v2-generation');

function parse() {
  const { values } = parseArgs({
    allowPositionals: false,
    options: {
      provider: { type: 'string', default: 'mock' },
      model: { type: 'string' },
      out: { type: 'string', default: DEFAULT_OUT },
      width: { type: 'string', default: '1024' },
      height: { type: 'string', default: '768' },
      size: { type: 'string', default: '1536x1024' },
      only: { type: 'string', multiple: true },
      limit: { type: 'string', default: '0' },
      'no-render': { type: 'boolean', default: false },
      'reference-style': { type: 'string', default: 'color' },
      'keep-reference-text': { type: 'boolean', default: false },
      'include-optional': { type: 'boolean', default: false },
      force: { type: 'boolean', default: false },
    },
  });
  values.only = values.only || [];
  values.width = Number(values.width);
  values.height = Number(values.height);
  values.limit = Number(values.limit);
  return values;
}

function readJson(p) {
  return JSON.parse(readFileSync(p, 'utf8'));
}

function writeJson(p, value) {
  writeFileSync(p, JSON.stringify(value, null, 2) + '\n');
}

async function renderReferences(entries, outDir, options) {
  const { chromium } = await import('playwright');
  const launchOptions = { headless: true };
  if (process.env.CHROMIUM_PATH) launchOptions.executablePath = process.env.CHROMIUM_PATH;
  const browser = await chromium.launch(launchOptions);
  try {
    for (const entry of entries) {
      const svgPath = path.resolve(ROOT, entry.referenceSvg);
      const pngPath = path.join(outDir, 'references', entry.id + '.png');
      const svg = readFileSync(svgPath, 'utf8');
      const vb = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
      const width = vb ? Math.round(Number(vb[1])) : 1040;
      const height = vb ? Math.round(Number(vb[2])) : 720;
      const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto(pathToFileURL(svgPath).href, { waitUntil: 'load' });
      const css = [];
      if (!options['keep-reference-text']) css.push('svg text{display:none !important}');
      if (options['reference-style'] === 'gray') css.push('svg{filter:grayscale(1) contrast(1.25)}');
      if (css.length) await page.evaluate((content) => {
        const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        style.textContent = content;
        document.documentElement.appendChild(style);
      }, css.join('\n'));
      await page.screenshot({ path: pngPath });
      await page.close();
      entry.referencePng = path.relative(ROOT, pngPath);
      entry.referenceSize = { width, height };
      entry.referenceStyle = options['reference-style'] + (options['keep-reference-text'] ? '-with-text' : '-no-text');
      console.log('rendered ' + entry.id + ' reference ' + entry.referenceSize.width + 'x' + entry.referenceSize.height);
    }
  } finally {
    await browser.close();
  }
}

async function generateOpenAI(entry, args) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY is not set.');
  if (!entry.referencePng) throw new Error('No rendered reference PNG. Remove --no-render.');
  const model = args.model || 'gpt-image-1';
  const form = new FormData();
  form.append('model', model);
  form.append('image', new Blob([readFileSync(path.resolve(ROOT, entry.referencePng))], { type: 'image/png' }), path.basename(entry.referencePng));
  form.append('prompt', entry.prompt);
  form.append('size', args.size);
  form.append('n', '1');
  const res = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + key },
    body: form,
  });
  if (!res.ok) throw new Error('OpenAI Images API ' + res.status + ': ' + (await res.text()).slice(0, 500));
  const json = await res.json();
  const item = (json.data || [])[0] || {};
  if (item.b64_json) return Buffer.from(item.b64_json, 'base64');
  if (item.url) {
    const img = await fetch(item.url);
    if (!img.ok) throw new Error('Could not download the generated image.');
    return Buffer.from(await img.arrayBuffer());
  }
  throw new Error('OpenAI response had no image data.');
}

async function generateReplicate(entry, args) {
  const key = process.env.REPLICATE_API_TOKEN;
  if (!key) throw new Error('REPLICATE_API_TOKEN is not set.');
  if (!entry.referencePng) throw new Error('No rendered reference PNG. Remove --no-render.');
  const model = args.model || 'black-forest-labs/flux-kontext-pro';
  const b64 = readFileSync(path.resolve(ROOT, entry.referencePng)).toString('base64');
  const headers = { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json', Prefer: 'wait' };
  const body = JSON.stringify({
    input: {
      prompt: entry.prompt,
      input_image: 'data:image/png;base64,' + b64,
      aspect_ratio: '4:3',
      output_format: 'png',
      safety_tolerance: 2,
    },
  });
  let res = await fetch('https://api.replicate.com/v1/models/' + model + '/predictions', { method: 'POST', headers, body });
  if (!res.ok) throw new Error('Replicate API ' + res.status + ': ' + (await res.text()).slice(0, 500));
  let json = await res.json();
  const deadline = Date.now() + 180000;
  while (json.status && !['succeeded', 'failed', 'canceled'].includes(json.status) && Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 2500));
    const poll = await fetch(json.urls.get, { headers: { Authorization: 'Bearer ' + key } });
    if (!poll.ok) throw new Error('Replicate poll ' + poll.status);
    json = await poll.json();
  }
  if (json.status !== 'succeeded') throw new Error('Replicate prediction ' + (json.status || 'unknown') + (json.error ? ': ' + json.error : ''));
  const output = Array.isArray(json.output) ? json.output[0] : json.output;
  if (!output) throw new Error('Replicate returned no image.');
  const img = await fetch(output);
  if (!img.ok) throw new Error('Could not download the Replicate image.');
  return Buffer.from(await img.arrayBuffer());
}

function generateLocal(entry, args, outputPath) {
  if (!entry.referencePng) throw new Error('No rendered reference PNG. Remove --no-render.');
  const bin = process.env.MFLUX_BIN || 'mflux-generate-flux2-edit';
  const cliArgs = [
    '--model', args.model || 'flux2-klein-4b',
    '--image-path', path.resolve(ROOT, entry.referencePng),
    '--prompt', entry.prompt,
    '--steps', '4',
    '--guidance', '1.0',
    '--width', String(args.width),
    '--height', String(args.height),
    '--output', outputPath,
  ];
  if (entry.seed != null) cliArgs.push('--seed', String(entry.seed));
  const res = spawnSync(bin, cliArgs, { stdio: 'inherit' });
  if (res.error) throw new Error('Could not run ' + bin + ': ' + res.error.message);
  if (res.status !== 0) throw new Error(bin + ' exited with ' + res.status + '.');
  if (!existsSync(outputPath)) throw new Error(bin + ' did not write ' + outputPath + '.');
}

async function main() {
  const args = parse();
  const provider = args.provider;
  if (!['mock', 'openai', 'replicate', 'local'].includes(provider)) {
    throw new Error('Unknown provider "' + provider + '". Use mock, openai, replicate or local.');
  }
  if (!['color', 'gray'].includes(args['reference-style'])) throw new Error('reference-style must be color or gray.');
  const outDir = path.resolve(ROOT, args.out);
  mkdirSync(path.join(outDir, 'references'), { recursive: true });
  mkdirSync(path.join(outDir, 'images'), { recursive: true });

  const data = readJson(path.join(ROOT, 'data', 'image-descriptions.json'));
  const patternData = readJson(path.join(ROOT, 'data', 'patterns', 'patterns.json'));
  const plan = buildPlan(data, patternData, { includeOptional: args['include-optional'], checkFile: (p) => existsSync(path.resolve(ROOT, p)) });
  if (!plan.ok) {
    console.error('Reference-generation plan has errors:');
    for (const e of plan.errors) console.error('  - ' + e);
    process.exit(1);
  }
  for (const w of plan.warnings) console.warn('  warning: ' + w);

  let entries = plan.entries;
  if (args.only.length) {
    const wanted = new Set(args.only);
    entries = entries.filter((e) => wanted.has(e.id));
  }
  if (args.limit > 0) entries = entries.slice(0, args.limit);
  if (!entries.length) {
    console.error('No matching ready images.');
    process.exit(2);
  }

  if (!args['no-render']) {
    try {
      await renderReferences(entries, outDir, args);
    } catch (err) {
      console.error('Reference rendering failed: ' + err.message);
      console.error('Install a Playwright browser or run with --no-render to write the plan only.');
      process.exit(3);
    }
  }

  const manifestPath = path.join(outDir, 'manifest.json');
  const manifest = {
    schema: 'containers-hamlet-reference-generation/v1',
    generatedAt: new Date().toISOString(),
    provider,
    model: provider === 'mock' ? null : (args.model || (provider === 'openai' ? 'gpt-image-1' : provider === 'replicate' ? 'black-forest-labs/flux-kontext-pro' : 'flux2-klein-4b')),
    width: args.width,
    height: args.height,
    note: 'Reference-conditioned drafts. The deterministic drawing is the geometric reference; the generated image is not a construction drawing. Record known deviations before publishing.',
    patternDefaults: data.patternDefaults ? { primary: data.patternDefaults.primary, supporting: data.patternDefaults.supporting } : null,
    referenceStyle: args['reference-style'] + (args['keep-reference-text'] ? '-with-text' : '-no-text'),
    images: entries,
  };
  writeJson(manifestPath, manifest);

  if (provider === 'mock') {
    console.log('\nPlan only (' + entries.length + ' images). ' + (args['no-render'] ? 'References were not rendered.' : 'References are under ' + path.join(args.out, 'references') + '.'));
    console.log('To synthesize, set a provider credential and rerun with --provider openai, replicate or local.');
    console.log('Manifest: ' + path.relative(ROOT, manifestPath));
    return;
  }

  let generated = 0;
  for (const entry of entries) {
    const outputPath = path.join(outDir, 'images', entry.id + '.png');
    if (existsSync(outputPath) && !args.force) {
      entry.status = 'existing';
      entry.output = path.relative(ROOT, outputPath);
      writeJson(manifestPath, manifest);
      console.log('skip existing ' + entry.id);
      generated += 1;
      continue;
    }
    console.log('generating ' + entry.id + ' with ' + provider + ' ...');
    try {
      let buffer;
      if (provider === 'openai') buffer = await generateOpenAI(entry, args);
      else if (provider === 'replicate') buffer = await generateReplicate(entry, args);
      else {
        generateLocal(entry, args, outputPath);
        buffer = null;
      }
      if (buffer) writeFileSync(outputPath, buffer);
      entry.status = 'generated';
      entry.output = path.relative(ROOT, outputPath);
      entry.knownDeviations = [];
      generated += 1;
    } catch (err) {
      entry.status = 'failed';
      entry.error = err.message;
      console.error('  failed: ' + err.message);
    }
    writeJson(manifestPath, manifest);
  }
  console.log('\n' + generated + '/' + entries.length + ' images ready. Manifest: ' + path.relative(ROOT, manifestPath));
  if (entries.some((e) => e.status === 'failed')) process.exit(1);
}

main().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
