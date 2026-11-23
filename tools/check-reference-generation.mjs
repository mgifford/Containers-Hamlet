// Check the reference-conditioned generation plan without rendering or network.
// Code: MIT. Generated content: CC BY-SA 4.0.
import { readFileSync, existsSync } from 'node:fs';
import { buildPlan, composePrompt, wordCount, REFERENCE_INSTRUCTION } from './lib/reference-generation.mjs';

const read = (p) => readFileSync(p, 'utf8');
const data = JSON.parse(read('data/image-descriptions.json'));
const patternData = JSON.parse(read('data/patterns/patterns.json'));

let failed = 0;
const ok = (condition, label) => {
  if (condition) console.log('ok   ' + label);
  else { failed += 1; console.log('FAIL ' + label); }
};

const plan = buildPlan(data, patternData, { checkFile: (p) => existsSync(p) });
for (const error of plan.errors) console.log('  error: ' + error);
for (const warning of plan.warnings) console.log('  warning: ' + warning);

console.log('Reference plan: ' + plan.entries.length + ' ready images');
ok(plan.ok, 'reference-generation plan validates');
ok(plan.entries.length === 14, 'the default plan covers the fourteen pattern-led images');
const fullPlan = buildPlan(data, patternData, { includeOptional: true, checkFile: (p) => existsSync(p) });
ok(fullPlan.entries.length === 15 && fullPlan.entries.some((e) => e.id === 'woodland-cottage-service-core'), '--include-optional adds the service-core technical detail');
ok(plan.entries.every((e) => e.prompt.startsWith(e.patternCue)), 'every prompt starts with its Pattern Language cue');
ok(plan.entries.every((e) => e.prompt.includes(REFERENCE_INSTRUCTION)), 'every prompt includes the reference-drawing instruction');
ok(plan.entries.every((e) => Number.isInteger(e.seed) && e.seed >= 0), 'every prompt has a reproducible seed');
ok(plan.entries.every((e) => e.words >= 80 && e.words <= 240), 'composed prompts are 80–240 words');
ok(plan.entries.every((e) => /No people, no text, no watermark\.$/.test(e.prompt)), 'composed prompts end with the no-people/no-text constraint');
ok(plan.entries.every((e) => e.referenceSvg && existsSync(e.referenceSvg)), 'every image resolves to an existing deterministic reference drawing');

const primary = data.patternDefaults.primary;
ok([112, 127, 159, 163, 180].every((n) => primary.includes(n)), 'the plan uses the five primary Pattern Language patterns');
ok(primary.every((n) => plan.entries.some((e) => e.patterns.includes(n))), 'every primary pattern appears in the reference plan');
ok(plan.entries.filter((e) => e.patternRole === 'primary').length >= 12, 'the default plan is mostly pattern-primary images');
ok(fullPlan.entries.find((e) => e.id === 'woodland-cottage-service-core').patternRole === 'supporting', 'the service-core detail remains explicitly supporting when included');

// A simple guard against presenting an excluded service as a positive element.
const banned = ['hydrant', 'fire cistern', 'potable water', 'wood stove', 'chimney', 'battery', 'inverter', 'snow guard', 'balcony'];
for (const entry of plan.entries) {
  for (const term of banned) {
    const re = new RegExp('(^|[^a-z])' + term + '\\b', 'gi');
    let m;
    while ((m = re.exec(entry.prompt))) {
      const start = m.index + m[0].toLowerCase().indexOf(term);
      const before = entry.prompt.slice(Math.max(0, start - 10), start).toLowerCase();
      if (!/(no|not|without)\s+$/.test(before)) {
        ok(false, entry.id + ': may present "' + term + '" as a positive element');
        break;
      }
    }
  }
}

ok(wordCount(composePrompt({ patternCue: '', generation: { prompt: 'one two three' } })) > 0, 'prompt composer handles a minimal record');

if (failed) {
  console.error('\n' + failed + ' reference-generation checks failed.');
  process.exit(1);
}
console.log('\nAll reference-generation checks passed.');
