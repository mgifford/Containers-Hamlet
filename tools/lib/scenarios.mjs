// Scenario comparison validation. Code: MIT.
export const SCHEMA = 'containers-hamlet-site-scenarios/v1';
export const EVIDENCE_STATES = ['not-evaluated', 'conceptual', 'evidence-needed', 'evidence-supported', 'trade-off-identified', 'not-applicable'];

const text = (v) => typeof v === 'string' && v.trim().length > 0;

export function validateScenarios(data, patterns) {
  const errors = [];
  const warnings = [];
  const err = (m) => errors.push(m);
  if (!data || data.schema !== SCHEMA) err('scenario schema must be ' + SCHEMA);
  if (!data || !Array.isArray(data.scenarios) || data.scenarios.length !== 3) { errors.push('exactly three scenarios are required'); return { ok: false, errors, warnings }; }
  if (!text(data.baselineId)) err('baselineId is required.');
  const ids = new Set();
  data.scenarios.forEach((s, i) => {
    const where = 'scenario[' + i + ']';
    ['id', 'label', 'title', 'status', 'geometryStatus', 'summary'].forEach((k) => { if (!text(s[k])) err(where + ': ' + k + ' is required.'); });
    if (ids.has(s.id)) err(where + ': duplicate id ' + s.id + '.');
    ids.add(s.id);
    if (!Array.isArray(s.advantages) || s.advantages.length < 2) err(where + ': at least two advantages/observations required.');
    if (!Array.isArray(s.disadvantages) || s.disadvantages.length < 2) err(where + ': at least two disadvantages/trade-offs required.');
    if (!Array.isArray(s.evaluationQuestions) || s.evaluationQuestions.length < 2) err(where + ': at least two evaluation questions required.');
    if (!EVIDENCE_STATES.includes(s.evidenceStatus)) err(where + ': invalid evidenceStatus.');
    if (!Array.isArray(s.patterns) || s.patterns.length < 1) err(where + ': at least one pattern reference required.');
    if (!s.diagram || !Array.isArray(s.diagram.homes) || s.diagram.homes.length !== 6) err(where + ': a six-home schematic diagram is required.');
    if (s.diagram && (!Array.isArray(s.diagram.paths) || !Array.isArray(s.diagram.common) || !Array.isArray(s.diagram.pockets))) err(where + ': diagram paths/common/pockets arrays are required.');
    if (!s.geometryStatus.includes('schematic') && s.status !== 'baseline' && !s.geometryStatus.includes('existing')) err(where + ': alternatives must be marked schematic or existing-assignment.');
    if (s.status === 'baseline' && s.id !== data.baselineId) err(where + ': only the baselineId scenario may have baseline status.');
    if (s.status === 'alternative' && s.id === data.baselineId) err(where + ': baseline scenario must not be marked alternative.');
    if (/winning|best|preferred|optimum/i.test(s.summary + ' ' + s.title)) err(where + ': do not label a scenario as the best/winner.');
    if (patterns) (s.patterns || []).forEach((n) => { if (!patterns.patterns.some((p) => p.number === n)) err(where + ': unknown pattern ' + n + '.'); });
  });
  if (!ids.has(data.baselineId)) err('baselineId does not match a scenario.');
  const base = data.scenarios.filter((s) => s.id === data.baselineId)[0];
  if (!base || base.status !== 'baseline') err('the baseline scenario must exist and be marked baseline.');
  return { ok: errors.length === 0, errors, warnings };
}
