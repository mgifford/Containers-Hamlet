// Reference-conditioned image-generation planning. Code: MIT.
// The plan is deterministic and network-free. The CLI adds an optional provider.
import { existsSync } from 'node:fs';
import path from 'node:path';

export const REFERENCE_INSTRUCTION =
  'Use the attached drawing for massing, openings and proportions; do not add or remove elements.';

export function wordCount(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}

export function composePrompt(image) {
  return [image.patternCue, REFERENCE_INSTRUCTION, image.generation && image.generation.prompt]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildPlan(data, patternData, options) {
  const opts = options || {};
  const patterns = (patternData && patternData.patterns) || [];
  const byNumber = new Map(patterns.map((p) => [p.number, p]));
  const defaults = data.patternDefaults || {};
  const primary = new Set(defaults.primary || []);
  const errors = [];
  const warnings = [];
  const entries = [];

  if (!data.designs) {
    return { ok: false, errors: ['image descriptions have no designs.'], warnings, entries };
  }

  for (const [designId, design] of Object.entries(data.designs)) {
    for (const image of design.images || []) {
      if (image.status !== 'ready') continue;
      if (image.defaultSet === false && !opts.includeOptional) continue;
      const where = image.id;
      if (!image.generation) { errors.push(where + ': no generation brief.'); continue; }
      if (!image.patternCue) errors.push(where + ': no pattern cue.');
      if (!Array.isArray(image.patterns) || !image.patterns.length) {
        if (image.patternRole !== 'supporting') errors.push(where + ': no patterns and not marked supporting.');
      }
      for (const n of image.patterns || []) if (!byNumber.has(n)) errors.push(where + ': unknown pattern ' + n + '.');
      if (image.patternRole === 'primary' && !(image.patterns || []).some((n) => primary.has(n))) errors.push(where + ': primary image has no primary pattern.');
      if (!image.generation.reference) { errors.push(where + ': no reference drawing.'); continue; }

      const referenceSvg = image.generation.referencePath || path.join('site', 'design-lab', 'views', designId + '-' + image.generation.reference);
      if (opts.checkFile ? !opts.checkFile(referenceSvg) : !existsSync(referenceSvg)) {
        errors.push(where + ': reference ' + referenceSvg + ' does not exist.');
        continue;
      }
      const prompt = composePrompt(image);
      const words = wordCount(prompt);
      if (words > 240) warnings.push(where + ': composed prompt is ' + words + ' words; the model may truncate it.');
      if (!/no people, no text, no watermark/i.test(prompt)) warnings.push(where + ': composed prompt should keep the no-people/no-text constraint.');

      entries.push({
        id: image.id,
        designId,
        title: image.title,
        patterns: image.patterns || [],
        patternRole: image.patternRole,
        patternCue: image.patternCue,
        prompt,
        basePrompt: image.generation.prompt,
        negativePrompt: image.generation.negativePrompt,
        referenceSvg,
        referencePng: null,
        seed: image.generation.seed || null,
        risk: image.generation.risk,
        words,
        status: 'planned',
      });
    }
  }

  return { ok: errors.length === 0, errors, warnings, entries };
}
