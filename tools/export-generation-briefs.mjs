#!/usr/bin/env node
// Export one generation brief per home from the image descriptions and the
// Design Lab model. The brief is the reference + prompt + review gate for the
// next image pass; it does not generate anything. MIT licence.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'docs', 'generation-briefs');

const descriptions = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data', 'image-descriptions.json'), 'utf8')
);
const lab = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data', 'design-lab.json'), 'utf8')
);

const REVIEW = {
  'hamlet-woodland-cottage': 'image-review-woodland-cottage-2026-11-23.md',
  'hamlet-offset-stack': 'image-review-offset-stack-2026-11-23.md',
  'hamlet-courtyard-residence': 'image-review-courtyard-residence-2026-11-23.md',
  'hamlet-cross-stacked-retreat': 'image-review-cross-stacked-retreat-2026-11-23.md',
  'hamlet-accessible-garden-home': 'image-review-accessible-garden-home-v2-2026-11-23.md',
  'hamlet-solar-studio-stack': 'image-review-solar-studio-stack-2026-11-23.md'
};

const referencePath = (designId, ref) => {
  if (!ref) return null;
  return ref.includes('/') ? `site/design-lab/${ref}` : `site/design-lab/views/${designId}-${ref}`;
};

const renderImage = (image, designId) => {
  const lines = [];
  lines.push(`### ${image.id} — ${image.title || image.id} (${image.status})`);
  lines.push('');
  const source = image.source || {};
  if (source.designHash) {
    lines.push(`- Design hash: \`${source.designHash}\` · scene hash: \`${source.sceneHash || '—'}\``);
  }
  if (source.reference) {
    lines.push(`- Reference: \`${referencePath(designId, source.reference)}\``);
  }
  if (image.patterns && image.patterns.length) {
    lines.push(`- Patterns: ${image.patterns.join(', ')} (${image.patternRole || 'supporting'})`);
  }
  if (image.patternCue) lines.push(`- Pattern cue: ${image.patternCue}`);
  if (image.generation) {
    lines.push(`- Risk: ${image.generation.risk || 'not recorded'} · seed: \`${image.generation.seed ?? '—'}\``);
  }
  lines.push('');

  if (image.blockedBy && image.blockedBy.length) {
    lines.push('**Blocked.** Do not generate this view until the interior is reconciled.');
    lines.push('');
    for (const reason of image.blockedBy) lines.push(`- ${reason}`);
    lines.push('');
  }

  if (image.generation) {
    lines.push('**Prompt**');
    lines.push('');
    lines.push('```text');
    lines.push(image.generation.prompt);
    lines.push('```');
    lines.push('');
    lines.push('**Negative prompt**');
    lines.push('');
    lines.push('```text');
    lines.push(image.generation.negativePrompt || '');
    lines.push('```');
    lines.push('');
  } else if (!image.blockedBy || !image.blockedBy.length) {
    lines.push('_No generation prompt is recorded._');
    lines.push('');
  }

  lines.push('**Must show**');
  lines.push('');
  const mustShow = image.mustShow || [];
  if (!mustShow.length) lines.push('- none recorded');
  for (const item of mustShow) {
    lines.push(`- [${item.status || '—'}] ${item.item}`);
  }
  lines.push('');
  lines.push('**Must not show**');
  lines.push('');
  const mustNotShow = image.mustNotShow || [];
  if (!mustNotShow.length) lines.push('- none recorded');
  for (const item of mustNotShow) {
    lines.push(`- ${item.item}${item.reason ? ` — ${item.reason}` : ''}`);
  }
  lines.push('');
  return lines;
};

const render = (designId, record, concept) => {
  const lines = [];
  const label = record.label || concept.name || designId;
  const firstSource = (record.images.find((x) => x.source) || {}).source || {};
  const review = REVIEW[designId] ? `../${REVIEW[designId]}` : null;

  lines.push(`# Generation brief — ${label}`);
  lines.push('');
  lines.push(`- Model: \`${designId}\``);
  if (firstSource.designHash) {
    lines.push(`- Design hash: \`${firstSource.designHash}\` · scene hash: \`${firstSource.sceneHash || '—'}\``);
  }
  lines.push(`- Review gate: ${review ? `[${REVIEW[designId]}](${review})` : 'not recorded'}`);
  lines.push('- Status: brief only; nothing here is a construction drawing or a published image.');
  lines.push('');
  lines.push('## Model facts');
  lines.push('');
  const modules = concept.modules || [];
  const types = modules.map((m) => m.type);
  const moduleLabel = modules.length === 1 ? `1 × ${types[0]}` : `${modules.length} modules: ${types.join(' + ')}`;
  const nominal = [...new Set(modules.map((m) => `${m.nominal.length_m} × ${m.nominal.width_m} m at ${m.elevation_m} m`))];
  lines.push(`- Modules: ${moduleLabel}${nominal.length ? `; nominal ${nominal.join('; ')}` : ''}`);
  const cladding = [...new Set(modules.map((m) => (m.cladding ? m.cladding.type : 'not recorded')))];
  lines.push(`- Cladding: ${cladding.join(' + ') || 'not recorded'}`);
  const roof = concept.roof_form || {};
  lines.push(`- Roof: ${roof.type || 'not recorded'}${roof.pitch_deg != null ? `, ${roof.pitch_deg}°` : ''}${roof.overhang_m != null ? `, ${roof.overhang_m} m overhang` : ''}${roof.green_roof ? ', green roof concept' : ''}`);
  for (const porch of concept.porches || []) {
    lines.push(`- Porch ${porch.id}: ${porch.length_m} × ${porch.depth_m} m on the ${porch.face} face${porch.roof ? ', roofed' : ', unroofed'}`);
  }
  if (record.envelope) {
    const e = record.envelope;
    lines.push(`- Envelope: ${e.addedExterior_mm} mm added outside the steel; ${e.totalWall_mm} mm total wall; ${e.roofInsulation_mm} mm roof; ${e.floorInsulation_mm} mm floor`);
  }
  lines.push(`- Interior: ${record.interiorProvenance || concept.interior || 'not recorded'}${record.interiorReconciliation ? ` — ${record.interiorReconciliation}` : ''}`);
  if (concept.site) lines.push(`- Site: homesite ${concept.site.homesite} (concept placement); use the site brief for the world view — the design-local view angle is not the site bearing`);
  lines.push('');
  lines.push('## References');
  lines.push('');
  const refs = [...new Set(record.images.map((x) => x.source && x.source.reference).filter(Boolean))];
  if (!refs.length) lines.push('- none recorded');
  for (const ref of refs) lines.push(`- \`${referencePath(designId, ref)}\``);
  lines.push('');
  lines.push('## Images');
  lines.push('');
  for (const image of record.images) lines.push(...renderImage(image, designId));
  lines.push('## Review gate');
  lines.push('');
  lines.push('Do not publish an image from this brief until the review record is cleared, the specific known deviations are recorded, and the image has been checked against the model. The prompt is not a substitute for the reference drawing or a 3D model.');
  lines.push('');
  return lines.join('\n');
};

fs.mkdirSync(OUT, { recursive: true });
let count = 0;
for (const [designId, record] of Object.entries(descriptions.designs)) {
  const concept = lab.concepts.find((c) => c.id === designId);
  if (!concept) {
    console.error(`skip ${designId}: no Design Lab concept`);
    continue;
  }
  const file = path.join(OUT, `${designId}.md`);
  fs.writeFileSync(file, render(designId, record, concept));
  console.log(`wrote ${path.relative(ROOT, file)}`);
  count += 1;
}
console.log(`\n${count} generation briefs in ${path.relative(ROOT, OUT)}`);
