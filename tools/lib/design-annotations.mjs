// Design pattern-lens annotations. Code: MIT.
const SCHEMA = 'containers-hamlet-pattern-design-annotations/v1';
const STATUS = ['conceptual', 'evidence-needed', 'not-evaluated', 'evidence-supported', 'trade-off-identified'];
const GEOMETRY = ['authored', 'inferred', 'none'];
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
      if (!GEOMETRY.includes(a.geometry)) errors.push(where + ': geometry must be authored, inferred or none.');
      if (a.geometry === 'none' && Array.isArray(a.selectors) && a.selectors.length) errors.push(where + ': geometry none cannot have room selectors.');
      ['summary', 'question'].forEach((k) => { if (!a[k] || !String(a[k]).trim()) errors.push(where + ': ' + k + ' required.'); });
      ['observations', 'limits'].forEach((k) => { if (!Array.isArray(a[k]) || !a[k].length) errors.push(where + ': ' + k + ' required.'); });
      if (!Array.isArray(a.selectors)) errors.push(where + ': selectors array required.');
      (a.selectors || []).forEach((s) => {
        if (!/^#room-/.test(s) || /javascript:/i.test(s)) { errors.push(where + ': invalid room selector ' + s + '.'); return; }
        const roomId = s.slice(6);
        const room = design && design.interior && design.interior.rooms && design.interior.rooms.find((r) => r.id === roomId || r.id === 'room-' + roomId);
        if (!room) { errors.push(where + ': unknown room ' + roomId + ' for ' + id + '.'); return; }
        if (a.geometry === 'authored' && room.provenance !== 'authored') errors.push(where + ': room ' + roomId + ' is not authored but the annotation declares authored geometry.');
        if (a.geometry === 'inferred' && room.provenance !== 'inferred-from-zone') errors.push(where + ': room ' + roomId + ' is not an inferred room band but the annotation declares inferred geometry.');
      });
      if (a.geometry === 'authored' && (!design || !design.interior || design.interior.status !== 'authored')) errors.push(where + ': authored geometry requires an authored interior model.');
      if (a.geometry === 'inferred' && (!design || !design.interior || design.interior.status !== 'provisional')) errors.push(where + ': inferred geometry requires a provisional interior model.');
      if (Array.isArray(a.selectors) && !a.selectors.length && design && design.interior && design.interior.rooms && design.interior.rooms.length && !/text-only|no room|not overlaid/i.test(a.summary + ' ' + a.limits.join(' '))) {
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
  const hasRooms = !!(design.interior && design.interior.rooms && design.interior.rooms.length);
  const hasAuthored = entry.annotations.some((a) => a.geometry === 'authored');
  const hasInferred = entry.annotations.some((a) => a.geometry === 'inferred');
  const hasTextOnly = entry.annotations.some((a) => a.geometry === 'none');
  const byNumber = {}; (patterns && patterns.patterns || []).forEach((p) => { byNumber[p.number] = p; });
  const geometryLabel = (g) => g === 'authored' ? 'authored plan' : g === 'inferred' ? 'provisional plan' : 'text-only';
  const buttons = entry.annotations.map((a) => `<button type="button" class="secondary lens-button" data-lens-pattern="${a.pattern}">${a.pattern} · ${esc(byNumber[a.pattern] ? byNumber[a.pattern].title : 'Pattern')}</button>`).join('');
  const detail = entry.annotations.map((a) => `<details class="lens-detail"><summary>${a.pattern} · ${esc(byNumber[a.pattern] ? byNumber[a.pattern].title : 'Pattern')} <span class="lens-status">${esc(a.status)}</span> <span class="lens-geometry">${esc(geometryLabel(a.geometry))}</span></summary><p>${esc(a.summary)}</p><p class="small"><strong>Observations:</strong> ${esc(a.observations.join(' '))}</p><p class="small"><strong>Question:</strong> ${esc(a.question)}</p><p class="small"><strong>Limits:</strong> ${esc(a.limits.join(' '))}</p><p class="small"><a href="../../pattern-language/#pattern-${a.pattern}">Read pattern ${a.pattern} in the Pattern Language Explorer</a></p></details>`).join('');
  let provenance = '';
  if (hasAuthored && hasInferred) provenance = 'This design uses authored room polygons for some annotations and provisional inferred room bands for others; each annotation states which.';
  else if (hasAuthored) provenance = 'The highlighted room polygons are authored.';
  else if (hasInferred) provenance = 'The highlighted room bands are provisional and inferred from the model, not an authored layout.';
  else if (hasTextOnly) provenance = 'No interior room model exists; the annotations are text-only.';
  const planLabel = hasAuthored && !hasInferred ? 'authored room polygon' : hasInferred && !hasAuthored ? 'provisional inferred room band' : 'room polygon';
  const plan = hasRooms
    ? `<object id="pattern-lens-plan" data="../../views/${esc(design.id)}-interior-plan.svg" type="image/svg+xml" aria-label="Interior plan for ${esc(design.name)}. ${esc(provenance)} Room highlights are a reading aid, not a verified pattern assessment."><p>Open the <a href="../../views/${esc(design.id)}-interior-plan.svg">interior plan SVG</a>.</p></object>`
    : '<p class="notice">No interior room model exists for this design. The annotations are text-only; no room polygon is being highlighted.</p>';
  return `<section class="assembly-section pattern-lens" id="pattern-lens" aria-labelledby="pattern-lens-title">
    <h2 id="pattern-lens-title">Pattern lens</h2>
    <p><strong>A reading aid, not a finding.</strong> Select a pattern to highlight the relevant ${hasRooms ? planLabel : 'room polygon'}. ${esc(provenance)} The same observations, questions and limits are below and remain available without JavaScript.</p>
    <div class="lens-layout">
      <div class="lens-plan">${plan}</div>
      <div class="lens-panel">
        <div id="pattern-lens-controls" class="lens-controls">${buttons}<button type="button" id="lens-clear" class="secondary" disabled>Clear highlight</button></div>
        <p id="pattern-lens-status" class="status" role="status" aria-live="polite">No pattern selected. All annotations remain available in the list below.</p>
        <ul id="pattern-lens-list" class="highlight-list"></ul>
        <noscript><p class="small">Highlighting needs JavaScript; the annotations and limits below remain available.</p></noscript>
      </div>
    </div>
    <details class="lens-details"><summary>All annotations, evidence and limits</summary>${detail}</details>
    <p class="small">Pattern numbers/titles are referenced from <em>A Pattern Language</em>; the interpretations are original. An annotation does not prove privacy, daylight, accessibility, fire safety or resident satisfaction. A provisional plan is not an authored room layout.</p>
  </section>
  <script type="application/json" id="pattern-lens-data">${JSON.stringify({ design: design.id, name: design.name, annotations: entry.annotations }).replace(/</g, '\\u003c')}</script>
  <script src="../../../js/design-pattern-lens.js" defer></script>`;
}
