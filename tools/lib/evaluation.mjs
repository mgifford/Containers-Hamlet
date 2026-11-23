// Resident scenarios and structured evaluation-record validation. Code: MIT.
export const SCENARIO_SCHEMA = 'containers-hamlet-resident-scenarios/v1';
export const RECORD_SCHEMA = 'containers-hamlet-evaluation-records/v1';
export const STATUSES = ['not-evaluated', 'conceptual', 'evidence-needed', 'evidence-supported', 'trade-off-identified', 'not-applicable'];
const text = (v) => typeof v === 'string' && v.trim().length > 0;

export function validateEvaluation(scenarioData, recordData, patterns, designs) {
  const errors = [];
  if (!scenarioData || scenarioData.schema !== SCENARIO_SCHEMA) errors.push('scenario schema must be ' + SCENARIO_SCHEMA);
  if (!recordData || recordData.schema !== RECORD_SCHEMA) errors.push('record schema must be ' + RECORD_SCHEMA);
  if (!scenarioData || !Array.isArray(scenarioData.scenarios) || scenarioData.scenarios.length !== 6) { errors.push('six resident scenarios are required'); return { ok: false, errors }; }
  if (!recordData || !Array.isArray(recordData.records)) { errors.push('records array required'); return { ok: false, errors }; }
  const designById = new Map(designs.map((d) => [d.id, d]));
  const scenarioIds = new Set();
  scenarioData.scenarios.forEach((s, i) => {
    const where = 'scenario[' + i + ']';
    ['id', 'title', 'resident', 'design', 'designLabel', 'question', 'status'].forEach((k) => { if (!text(s[k])) errors.push(where + ': ' + k + ' required.'); });
    if (scenarioIds.has(s.id)) errors.push(where + ': duplicate id.');
    scenarioIds.add(s.id);
    if (!Array.isArray(s.steps) || s.steps.length < 4) errors.push(where + ': at least four activity steps required.');
    if (!Array.isArray(s.evidenceNeeded) || s.evidenceNeeded.length < 1) errors.push(where + ': evidenceNeeded required.');
    if (!Array.isArray(s.patterns) || !s.patterns.length) errors.push(where + ': pattern references required.');
    if (s.status !== 'not-evaluated') errors.push(where + ': initial scenarios must be not-evaluated.');
    if (!designById.has(s.design)) errors.push(where + ': unknown design ' + s.design + '.');
    (s.patterns || []).forEach((n) => { if (!patterns.patterns.some((p) => p.number === n)) errors.push(where + ': unknown pattern ' + n + '.'); });
    if (/stereotype|typical resident|proves/i.test(s.resident + ' ' + s.question)) errors.push(where + ': scenarios must not stereotype or claim proof.');
  });
  const recordIds = new Set();
  recordData.records.forEach((r, i) => {
    const where = 'record[' + i + ']';
    ['id', 'scenario', 'design', 'pattern', 'element', 'question', 'method', 'status'].forEach((k) => { if (r[k] === undefined || r[k] === null || r[k] === '') errors.push(where + ': ' + k + ' required.'); });
    if (recordIds.has(r.id)) errors.push(where + ': duplicate id.');
    recordIds.add(r.id);
    if (!scenarioIds.has(r.scenario)) errors.push(where + ': unknown scenario ' + r.scenario + '.');
    if (!designById.has(r.design)) errors.push(where + ': unknown design ' + r.design + '.');
    if (!patterns.patterns.some((p) => p.number === r.pattern)) errors.push(where + ': unknown pattern ' + r.pattern + '.');
    if (!STATUSES.includes(r.status)) errors.push(where + ': invalid status.');
    if (!Array.isArray(r.observations) || !Array.isArray(r.limitations)) errors.push(where + ': observations and limitations must be arrays.');
    if (r.status === 'not-evaluated' && ((r.observations || []).length || r.reviewer !== null || r.date !== null)) errors.push(where + ': a not-evaluated record must have no observations, reviewer or date.');
    if (r.status !== 'not-evaluated' && (!r.reviewer || !r.date)) errors.push(where + ': a completed record needs reviewer and date.');
    if (/\b(score|index|rating)\b/i.test(JSON.stringify(r))) errors.push(where + ': do not add a score/index/rating.');
  });
  if (recordData.records.length < 6) errors.push('at least one open record per resident scenario is required.');
  return { ok: errors.length === 0, errors };
}
