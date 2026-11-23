// Design pattern-lens annotations. Code: MIT.
const SCHEMA = 'containers-hamlet-pattern-design-annotations/v1';
const STATUS = ['conceptual', 'evidence-needed', 'not-evaluated', 'evidence-supported', 'trade-off-identified'];
const esc = (v) => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function validateDesignAnnotations(data, patterns, designs) {
  const errors = [];
  if (!data || data.schema !== SCHEMA) errors.push('design annotations schema must be ' + SCHEMA);
  if (!data || !data.designs || typeof data.designs !== 'object') { errors.push('designs object required'); return { ok: false, errors }; }
  const designById = new Map(designs.map((d) => [d.id, d]));
  Object.keys(data.designs).forEach((id) => {
    const design = designById.get(id);
    if (!design) errors.push('unknown design ' + id + '.');
    const entry = data.designs[id];
    if (!entry || !Array.isArray(entry.annotations) || !entry.annotations.length) errors.push(id + ': at least one annotation required.');
    const seen = new Set();
    (entry.annotations || []).forEach((a, i) => {
      const where = id + '[' + i + ']';
      if (!patterns.patterns.some((p) => p.number === a.pattern)) errors.push(where + ': unknown pattern ' + a.pattern + '.');
      if (seen.has(a.pattern)) errors.push(where + ': duplicate pattern ' + a.pattern + '.');
      seen.add(a.pattern);
      if (!STATUS.includes(a.status)) errors.push(where + ': invalid status ' + a.status + '.');
      ['summary', 'question'].forEach((k) => { if (!a[k] || !String(a[k]).trim()) errors.push(where + ': ' + k + ' required.'); });
      ['observations', 'limits'].forEach((k) => { if (!Array.isArray(a[k]) || !a[k].length) errors.push(where + ': ' + k + ' required.'); });
      if (!Array.isArray(a.selectors)) errors.push(where + ': selectors array required.');
      (a.selectors || []).forEach((s) => {
        if (!/^#room-/.test(s) || /javascript:/i.test(s)) { errors.push(where + ': invalid room selector ' + s + '.'); return; }
        const roomId = s.slice(6);
        if (!design || !design.interior || !design.interior.rooms || !design.interior.rooms.some((r) => r.id === roomId)) errors.push(where + ': unknown room ' + roomId + ' for ' + id + '.');
      });
      if (!a.selectors.length && design && design.interior && design.interior.rooms && design.interior.rooms.length && !/text-only|no room|not overlaid/i.test(a.summary + ' ' + a.limits.join(' '))) {
        errors.push(where + ': empty selectors need an explicit text-only explanation for a design with rooms.');
      }
      if (/satisfied|compliant|verified by this annotation/i.test(a.summary + ' ' + a.observations.join(' ') + ' ' + a.limits.join(' '))) errors.push(where + ': do not claim the pattern is satisfied.');
    });
  });
  return { ok: errors.length === 0, errors };
}

export function patternLensSection(design, data, patterns) {
  const entry = data && data.designs && data.designs[design.id];
  if (!entry || !entry.annotations || !entry.annotations.length) return '';
  const hasPlan = !!(design.interior && design.interior.rooms && design.interior.rooms.length);
  const byNumber = {}; (patterns && patterns.patterns || []).forEach((p) => { byNumber[p.number] = p; });
  const buttons = entry.annotations.map((a) => `<button type="button" class="secondary lens-button" data-lens-pattern="${a.pattern}">${a.pattern} · ${esc(byNumber[a.pattern] ? byNumber[a.pattern].title : 'Pattern')}</button>`).join('');
  const detail = entry.annotations.map((a) => `<details class="lens-detail"><summary>${a.pattern} · ${esc(byNumber[a.pattern] ? byNumber[a.pattern].title : 'Pattern')} <span class="lens-status">${esc(a.status)}</span></summary><p>${esc(a.summary)}</p><p class="small"><strong>Question:</strong> ${esc(a.question)}</p><p class="small"><strong>Limits:</strong> ${esc(a.limits.join(' '))}</p><p class="small"><a href="../../pattern-language/#pattern-${a.pattern}">Read pattern ${a.pattern} in the Pattern Language Explorer</a></p></details>`).join('');
  return `<section class="assembly-section pattern-lens" id="pattern-lens" aria-labelledby="pattern-lens-title">
    <h2 id="pattern-lens-title">Pattern lens</h2>
    <p><strong>A reading aid, not a finding.</strong> Select a pattern to highlight the relevant authored room polygon${hasPlan ? ' in the interior plan' : ''}. The same observations, questions and limits are below and remain available without JavaScript.</p>
    <div class="lens-layout">
      <div class="lens-plan">
        ${hasPlan ? `<object id="pattern-lens-plan" data="../../views/${esc(design.id)}-interior-plan.svg" type="image/svg+xml" aria-label="Interior plan for ${esc(design.name)}. Room highlights are a reading aid, not a verified pattern assessment."><p>Open the <a href="../../views/${esc(design.id)}-interior-plan.svg">interior plan SVG</a>.</p></object>` : '<p class="notice">No authored interior room plan exists for this design. The annotations are text-only; no room polygon is being highlighted.</p>'}
      </div>
      <div class="lens-panel">
        <div id="pattern-lens-controls" class="lens-controls">${buttons}<button type="button" id="lens-clear" class="secondary" disabled>Clear highlight</button></div>
        <p id="pattern-lens-status" class="status" role="status" aria-live="polite">No pattern selected. All annotations remain available in the list below.</p>
        <ul id="pattern-lens-list" class="highlight-list"></ul>
        <noscript><p class="small">Highlighting needs JavaScript; the annotations and limits below remain available.</p></noscript>
      </div>
    </div>
    <details class="lens-details"><summary>All annotations, evidence and limits</summary>${detail}</details>
    <p class="small">Pattern numbers/titles are referenced from <em>A Pattern Language</em>; the interpretations are original. An annotation does not prove privacy, daylight, accessibility, fire safety or resident satisfaction.</p>
  </section>
  <script type="application/json" id="pattern-lens-data">${JSON.stringify({ design: design.id, name: design.name, annotations: entry.annotations }).replace(/</g, '\\u003c')}</script>
  <script src="../../../js/design-pattern-lens.js" defer></script>`;
}
