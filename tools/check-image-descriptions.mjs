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

if (failed) {
  console.error('\n' + failed + ' image-description checks failed.');
  process.exit(1);
}
console.log('\nAll image-description checks passed.');
