// Check the v2 image-description set against the design model.
// Code: MIT. Generated content: CC BY-SA 4.0.
import { readFileSync } from 'node:fs';
import { validateImageDescriptions, imageDescriptionSummary } from './lib/image-descriptions.mjs';

const read = (p) => readFileSync(p, 'utf8');
const data = JSON.parse(read('data/image-descriptions.json'));
const designLab = JSON.parse(read('data/design-lab.json'));
const siteData = JSON.parse(read('data/site.json'));
const designs = designLab.concepts.filter((c) => c.role === 'hamlet-selected');

let failed = 0;
const ok = (condition, label) => {
  if (condition) console.log('ok   ' + label);
  else { failed += 1; console.log('FAIL ' + label); }
};

const result = validateImageDescriptions(data, designs, siteData, {
  checkFile: (rel) => {
    try { read(rel); return true; } catch { return false; }
  }
});

console.log('Image descriptions: ' + result.summary.images + ' images across ' + result.summary.designs + ' designs');
console.log('  ' + result.summary.ready + ' ready, ' + result.summary.blocked + ' blocked, ' + result.summary.services + ' service placements, ' + result.summary.conceptual + ' conceptual, ' + result.summary.excluded + ' exclusions');
for (const error of result.errors) console.log('  error: ' + error);
for (const warning of result.warnings) console.log('  warning: ' + warning);
for (const item of result.unresolved) console.log('  unresolved: ' + item.message);

ok(result.ok, 'image descriptions validate against the model');
ok(result.summary.images === 16, 'six homes have twelve hero images and Woodland Cottage has four detail shots');
ok(result.summary.ready === 14 && result.summary.blocked === 2, 'fourteen descriptions are ready and two authored interiors are blocked pending reconciliation');
ok(result.unresolved.some((u) => /opening-room-mismatch/.test(u.code)), 'the room-opening mismatch is reported rather than hidden');
ok(result.unresolved.some((u) => /blocked-image/.test(u.code)), 'blocked descriptions are listed as unresolved');
ok(result.summary.conceptual > 0 && result.summary.excluded > 0, 'conceptual service placements and exclusions are recorded');

const rows = imageDescriptionSummary(data);
ok(rows.filter((r) => r.view === 'exterior-three-quarter').length === 6, 'one exterior hero per home');
ok(rows.filter((r) => r.view === 'interior').length === 6, 'one interior hero per home');
ok(rows.filter((r) => r.view === 'detail').length === 4, 'four Woodland Cottage detail shots');
ok(rows.every((r) => r.mustShow > 0 && r.mustNotShow > 0), 'every image has must-show and must-not-show items');
ok(rows.filter((r) => r.status === 'blocked-pending-reconciliation').every((r) => /interior/.test(r.view)), 'only interior descriptions are blocked');

const ready = data.designs ? Object.values(data.designs).flatMap((d) => d.images).filter((i) => i.status === 'ready') : [];
const blocked = data.designs ? Object.values(data.designs).flatMap((d) => d.images).filter((i) => i.status === 'blocked-pending-reconciliation') : [];
ok(ready.every((i) => i.generation && i.generation.prompt && i.generation.negativePrompt && i.generation.reference), 'every ready image has a generation prompt, negative prompt and reference');
ok(blocked.every((i) => !i.generation), 'blocked images do not carry a generation prompt');
ok(ready.every((i) => /No people, no text, no watermark\.$/.test(i.generation.prompt.trim())), 'every generation prompt ends with the no-people, no-text, no-watermark constraint');
const woodlandExt = ready.find((i) => i.id === 'woodland-cottage-exterior-hero');
ok(/no dormer/i.test(woodlandExt.generation.prompt) && /helical-pile/i.test(woodlandExt.generation.prompt) && /not a waterfront/i.test(woodlandExt.generation.prompt), 'Woodland exterior prompt carries the observed dormer, foundation and waterfront guards');
const fire = ready.find((i) => i.id === 'woodland-cottage-fire-edge');
ok(/lower third/i.test(fire.generation.prompt) && /fine stainless-mesh/i.test(fire.generation.prompt), 'fire-edge prompt keeps the ground plane and specifies a fine-mesh vent');
const water = ready.find((i) => i.id === 'woodland-cottage-water-edge');
ok(/first-flush chamber/i.test(water.generation.prompt), 'water-edge prompt describes the first-flush device visually');
const core = ready.find((i) => i.id === 'woodland-cottage-service-core');
ok(/no chimney, no flue/i.test(core.generation.prompt), 'service-core prompt states no chimney or flue in the positive text');
ok(ready.filter((i) => i.view === 'interior').every((i) => /No walls, no doors/i.test(i.generation.prompt)), 'provisional interior prompts repeat the no-walls guard');

if (failed) {
  console.error('\n' + failed + ' image-description checks failed.');
  process.exit(1);
}
console.log('\nAll image-description checks passed.');
