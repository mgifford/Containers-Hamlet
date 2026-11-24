// Pattern-library validation and shared metadata. Code: MIT.
export const SCHEMA = 'containers-hamlet-patterns/v1';
export const VERIFIED_TITLES = {
  36: 'Degrees of Publicness',
  37: 'House Cluster',
  61: 'Small Public Squares',
  67: 'Common Land',
  81: 'Small Services Without Red Tape',
  69: 'Public Outdoor Room',
  104: 'Site Repair',
  105: 'South Facing Outdoors',
  106: 'Positive Outdoor Space',
  112: 'Entrance Transition',
  119: 'Arcades',
  120: 'Paths and Goals',
  127: 'Intimacy Gradient',
  129: 'Common Areas at the Heart',
  141: 'A Room of One’s Own',
  155: 'Old Age Cottage',
  159: 'Light on Two Sides of Every Room',
  163: 'Outdoor Room',
  171: 'Tree Places',
  179: 'Alcoves',
  180: 'Window Place'
};
export const SCALES = ['landscape', 'community', 'infrastructure', 'building', 'interior'];
export const EVIDENCE_STATES = ['not-evaluated', 'conceptual', 'evidence-needed', 'evidence-supported', 'trade-off-identified', 'not-applicable'];
export const EVIDENCE_LABEL = {
  'not-evaluated': 'Not evaluated',
  conceptual: 'Conceptual',
  'evidence-needed': 'Evidence needed',
  'evidence-supported': 'Evidence-supported within scope',
  'trade-off-identified': 'Trade-off identified',
  'not-applicable': 'Not applicable'
};
export const ELEMENT_LABEL = {
  'site-plan': 'Site plan',
  landscape: 'Landscape',
  'common-land': 'Common land',
  paths: 'Paths',
  lodge: 'Common lodge',
  homes: 'Individual homes',
  porches: 'Porches and outdoor rooms',
  interiors: 'Interiors',
  'shared-workshop': 'Shared workshop',
  'visitor-arrival': 'Visitor arrival'
};
export const SCALE_LABEL = { landscape: 'Landscape', community: 'Community', infrastructure: 'Infrastructure', building: 'Building', interior: 'Interior' };

const slug = (s) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(s || ''));
const text = (v) => typeof v === 'string' && v.trim().length > 0;

export function validatePatterns(data) {
  const errors = [];
  const warnings = [];
  const err = (m) => errors.push(m);
  const warn = (m) => warnings.push(m);
  if (!data || data.schema !== SCHEMA) err('patterns.schema must be ' + SCHEMA);
  if (!data || !Array.isArray(data.patterns)) { errors.push('patterns must be an array'); return { ok: false, errors, warnings }; }
  if (data.patterns.length < 15 || data.patterns.length > 20) err('The initial catalogue must contain 15–20 patterns.');
  if (!data.source || data.source.work !== 'A Pattern Language' || !/^https:\/\//.test(data.source.url || '')) err('A primary source URL is required.');
  if (!data.source || !Array.isArray(data.source.authors) || !data.source.authors.some((a) => /Alexander/.test(a)) || !data.source.authors.some((a) => /Ishikawa/.test(a)) || !data.source.authors.some((a) => /Silverstein/.test(a))) err('Source attribution must name Alexander, Ishikawa and Silverstein.');
  if (!text(data.attribution) || !/Alexander/.test(data.attribution)) err('Attribution text is required.');
  if (!text(data.copyrightNote)) err('Copyright note is required.');
  if (!data.verification || data.verification.status !== 'titles-and-numbers-verified') err('Pattern title/number verification status is required.');
  const numbers = new Map();
  const ids = new Set();
  data.patterns.forEach((p, i) => {
    const where = 'pattern[' + i + ']';
    if (!slug(p.id)) err(where + ': id must be a kebab-case slug.');
    if (ids.has(p.id)) err(where + ': duplicate id ' + p.id + '.');
    ids.add(p.id);
    if (!Number.isInteger(p.number) || p.number < 1) err(where + ': number must be a positive integer.');
    if (numbers.has(p.number)) err(where + ': duplicate number ' + p.number + '.');
    numbers.set(p.number, p);
    if (VERIFIED_TITLES[p.number] !== p.title) err(where + ': title does not match the verified mapping for pattern ' + p.number + '.');
    if (!SCALES.includes(p.scale)) err(where + ': invalid scale.');
    ['summary', 'problem', 'proposal', 'hamletInterpretation', 'currentResponse', 'alternatives', 'tradeoffs', 'unresolved', 'relationshipNote'].forEach((k) => { if (!text(p[k])) err(where + ': ' + k + ' is required.'); });
    if (!Array.isArray(p.evaluationQuestions) || p.evaluationQuestions.length < 2 || p.evaluationQuestions.some((q) => !text(q))) err(where + ': at least two evaluation questions are required.');
    if (!Array.isArray(p.limitations) || p.limitations.length < 1 || p.limitations.some((q) => !text(q))) err(where + ': at least one limitation is required.');
    if (!EVIDENCE_STATES.includes(p.evidenceStatus)) err(where + ': invalid evidenceStatus.');
    if (!Array.isArray(p.applicableElements) || p.applicableElements.length < 1) err(where + ': applicableElements are required.');
    else p.applicableElements.forEach((e) => { if (!data.elements.includes(e)) err(where + ': unknown applicable element ' + e + '.'); });
    if (!p.sourceVerified) err(where + ': sourceVerified must be true for the curated catalogue.');
    if (!Array.isArray(p.relatedPatterns) || p.relatedPatterns.length < 1) err(where + ': relatedPatterns are required.');
  });
  data.patterns.forEach((p) => {
    (p.relatedPatterns || []).forEach((n) => {
      if (n === p.number) err(p.id + ': pattern cannot relate to itself.');
      if (!numbers.has(n)) err(p.id + ': related pattern ' + n + ' does not exist.');
    });
  });
  // A pattern should not be completely isolated from the connected language.
  data.patterns.forEach((p) => {
    const inbound = data.patterns.some((q) => q.number !== p.number && (q.relatedPatterns || []).includes(p.number));
    if (!inbound) warn(p.id + ': no other pattern links to this one.');
  });
  return { ok: errors.length === 0, errors, warnings };
}

export const SITE_ELEMENT_SCHEMA = 'containers-hamlet-pattern-site-elements/v1';

const EXTENSION_HOMES = ['hamlet-woodland-cottage','hamlet-offset-stack','hamlet-courtyard-residence','hamlet-cross-stacked-retreat','hamlet-accessible-garden-home','hamlet-solar-studio-stack'];
export function validateExtensions(data) {
  const errors = [];
  const warnings = [];
  const err = (m) => errors.push(m);
  if (!data || !data.extensions) return { ok: true, errors: [], warnings: ['No extension patterns are recorded.'], skipped: true };
  const e = data.extensions;
  if (e.schema !== 'containers-hamlet-pattern-extensions/v1') err('Extension schema must be containers-hamlet-pattern-extensions/v1.');
  if (!text(e.attribution) || !/not Christopher Alexander/i.test(e.attribution)) err('Extension attribution must state that the patterns are not Christopher Alexander patterns.');
  if (!Array.isArray(e.patterns) || e.patterns.length < 8 || e.patterns.length > 12) err('The extension set must contain 8–12 original patterns.');
  const ids = new Set();
  (e.patterns || []).forEach((p, i) => {
    const where = 'extension[' + i + ']';
    if (!slug(p.id)) err(where + ': id must be a kebab-case slug.');
    if (ids.has(p.id)) err(where + ': duplicate id ' + p.id + '.');
    ids.add(p.id);
    ['title','summary','problem','proposal','hamletInterpretation','tradeoffs','unresolved'].forEach((k) => { if (!text(p[k])) err(where + ': ' + k + ' is required.'); });
    if (!SCALES.includes(p.scale)) err(where + ': invalid scale.');
    if (!EVIDENCE_STATES.includes(p.evidenceStatus)) err(where + ': invalid evidenceStatus.');
    if (!Array.isArray(p.homes) || !p.homes.length || p.homes.some((h) => EXTENSION_HOMES.indexOf(h) < 0)) err(where + ': homes must reference the six hamlet residence ids.');
    if (!Array.isArray(p.evaluationQuestions) || p.evaluationQuestions.length < 2) err(where + ': at least two evaluation questions are required.');
    if (!Array.isArray(p.alexander) || !p.alexander.length) err(where + ': at least one verified Alexander link is required.');
    (p.alexander || []).forEach((a) => {
      if (VERIFIED_TITLES[a.number] !== a.title) err(where + ': Alexander link ' + a.number + ' does not match the verified title mapping.');
    });
    if ((data.patterns || []).some((q) => q.title.toLowerCase() === String(p.title).toLowerCase())) err(where + ': an extension may not reuse an Alexander pattern title.');
  });
  return { ok: errors.length === 0, errors, warnings };
}

export function validateSiteElements(siteData, patterns) {
  const errors = [];
  const warnings = [];
  const err = (m) => errors.push(m);
  const warn = (m) => warnings.push(m);
  if (!siteData || siteData.schema !== SITE_ELEMENT_SCHEMA) err('site-elements.schema must be ' + SITE_ELEMENT_SCHEMA);
  if (!siteData || !/^\.\.\/\.\.\/assets\/site-plan\.svg$/.test(siteData.sitePlan || '')) err('site-elements.sitePlan must point to the existing site plan.');
  if (!siteData || !Array.isArray(siteData.elements)) { errors.push('site-elements.elements must be an array'); return { ok: false, errors, warnings }; }
  const ids = new Set();
  siteData.elements.forEach((e, i) => {
    const where = 'site-element[' + i + ']';
    if (!slug(e.id)) err(where + ': invalid id.');
    if (ids.has(e.id)) err(where + ': duplicate id ' + e.id + '.');
    ids.add(e.id);
    ['label', 'description', 'evidenceStatus', 'note'].forEach((k) => { if (!text(e[k])) err(where + ': ' + k + ' is required.'); });
    if (!EVIDENCE_STATES.includes(e.evidenceStatus)) err(where + ': invalid evidenceStatus.');
    if (!Array.isArray(e.selectors)) err(where + ': selectors must be an array.');
    else e.selectors.forEach((s) => { if (!/^(#|svg$)/.test(s) || /javascript:/i.test(s)) err(where + ': invalid selector ' + s + '.'); });
  });
  if (patterns && patterns.elements) {
    patterns.elements.forEach((id) => { if (!ids.has(id)) err('pattern element ' + id + ' has no site-element mapping.'); });
    siteData.elements.forEach((e) => { if (patterns.elements.indexOf(e.id) < 0) warn('site element ' + e.id + ' is not used by any pattern definition.'); });
    patterns.patterns.forEach((p) => p.applicableElements.forEach((id) => { if (!ids.has(id)) err(p.id + ': missing site-element mapping for ' + id + '.'); }));
  }
  return { ok: errors.length === 0, errors, warnings };
}
