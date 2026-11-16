// Code: MIT.
import { designShellNav } from './design-nav.mjs';
// // Generated page content: CC BY-SA 4.0.
const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const n = (v) => (Math.round(v * 10) / 10).toString();

export function panel(p, c) {
  const t = p.thermal;
  const list = (items, empty) => items && items.length ? `<ul>${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : `<p class="small">${esc(empty)}</p>`;
  return `<article class="compare-panel" data-compare-panel="${esc(p.id)}">
    <img src="../views/${esc(p.id)}-exterior.svg" alt="Exterior concept of ${esc(p.name)}" width="1040" height="700" loading="lazy" decoding="async">
    <div class="compare-panel-body">
      <p class="eyebrow">${esc(c.group)} · ${p.container_count} container${p.container_count === 1 ? '' : 's'}</p>
      <h2>${esc(p.name)}</h2>
      <p>${esc(c.tagline)}</p>
      <dl class="compare-facts">
        <div><dt>Container count</dt><dd>${p.container_count} × ${esc(p.types.join(' + '))}</dd></div>
        <div><dt>Nominal conditioned footprint</dt><dd>${n(p.conditioned_area_m2)} m² modules plus glazed hall</dd></div>
        <div><dt>Screened porch area</dt><dd>${n(p.screened_porch_m2)} m²${p.screened_porch_m2 ? '' : ' (no screened porch)'}</dd></div>
        <div><dt>Porch and deck area</dt><dd>${n(p.porch_m2)} m²</dd></div>
        <div><dt>Glazing area</dt><dd>${n(p.glazing_m2)} m² · ${n(p.glazing_ratio)}% of nominal conditioned area</dd></div>
      </dl>
      <h3>Envelope options</h3>
      <dl class="compare-facts">
        <div><dt>Walls</dt><dd>${n(t.wall_insulation_mm)} mm average continuous external insulation</dd></div>
        <div><dt>Roof</dt><dd>${n(t.roof_insulation_mm)} mm · ${esc(t.rainscreen_ventilation ? 'ventilated rainscreen' : 'rainscreen not confirmed')}</dd></div>
        <div><dt>Floor</dt><dd>${n(t.floor_insulation_mm)} mm</dd></div>
        <div><dt>Windows and doors</dt><dd>${esc(t.window_performance)}</dd></div>
        <div><dt>Shading</dt><dd>${esc(t.external_shading)}</dd></div>
        <div><dt>Air and vapour</dt><dd>${esc(t.air_vapour_control)}</dd></div>
        <div><dt>Thermal bridges</dt><dd>${esc(t.thermal_bridge_mitigation)}</dd></div>
        <div><dt>Ventilation</dt><dd>${t.heat_recovery_ventilation ? 'Heat-recovery ventilation (HRV/ERV) intent' : 'No HRV/ERV selected'}</dd></div>
        <div><dt>Heating</dt><dd>${esc(t.heating)}</dd></div>
      </dl>
      <h3>Thermal strengths</h3>
      ${list(t.strengths, 'No specific strengths recorded.')}
      <h3>Thermal risks</h3>
      ${list(t.risks, 'No specific risks recorded beyond the general review prompts.')}
      <h3>Accessibility considerations</h3>
      ${list(p.accessibility, 'No accessibility notes recorded.')}
      <h3>Structural / installation review</h3>
      ${list(p.structural, 'No specific structural warning recorded; openings and lifting still need review.')}
      <p class="small"><strong>No cost, carbon, energy or code-compliance figures are calculated.</strong> Areas are approximate nominal geometry. Thermal notes are qualitative design prompts, not performance claims.</p>
      <p class="compare-links"><a class="action" href="../architecture/${esc(p.id)}/">Five-view architectural gallery</a> ${p.editable ? `<a class="action secondary" href="../editor/?preset=${esc(p.id)}">Open in editor</a>` : ''}</p>
    </div>
  </article>`;
}

export function table(profiles, concepts) {
  return `<div class="table-wrap"><table>
    <caption>All ten concepts at a glance. Areas are approximate nominal geometry; thermal notes are qualitative.</caption>
    <thead><tr><th scope="col">Concept</th><th scope="col">Containers</th><th scope="col">Conditioned m²</th><th scope="col">Screened porch m²</th><th scope="col">Glazing m²</th><th scope="col">Envelope</th><th scope="col">Thermal strengths and risks</th><th scope="col">Accessibility</th><th scope="col">Structural review</th></tr></thead>
    <tbody>${profiles.map((p) => {
      const c = concepts.find((x) => x.id === p.id);
      const t = p.thermal;
      return `<tr><th scope="row"><a href="../architecture/${esc(p.id)}/">${esc(p.name)}</a></th><td>${p.container_count} × ${esc(p.types.join(' + '))}</td><td>${n(p.conditioned_area_m2)}</td><td>${n(p.screened_porch_m2)}</td><td>${n(p.glazing_m2)} (${n(p.glazing_ratio)}%)</td><td>${n(t.wall_insulation_mm)} / ${n(t.roof_insulation_mm)} / ${n(t.floor_insulation_mm)} mm wall / roof / floor; ${esc(t.window_performance)}</td><td>${esc((t.strengths[0] || '') + ' ' + (t.risks[0] || ''))}</td><td>${esc((p.accessibility[0] || '') + (p.accessibility.length > 1 ? ' ' + p.accessibility[1] : ''))}</td><td>${esc((p.structural[0] || 'Openings and lifting need review.'))}</td></tr>`;
    }).join('')}</tbody>
  </table></div>`;
}

export function comparePage(profiles, concepts) {
  const a = profiles.find((p) => p.id === 'woodland-retreat') || profiles[0];
  const b = profiles.find((p) => p.id === 'common-lodge') || profiles[1];
  const options = (selected) => concepts.map((c) => `<option value="${esc(c.id)}"${c.id === selected ? ' selected' : ''}>${esc(c.name)}</option>`).join('');
  const aConcept = concepts.find((c) => c.id === a.id), bConcept = concepts.find((c) => c.id === b.id);
  return `<!doctype html>
<html lang="en-CA">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Compare two container-home concepts side by side: container count, approximate floor and porch areas, glazing, envelope options, accessibility, thermal strengths and risks, and structural review prompts.">
  <title>Compare container concepts · Containers Hamlet Design Lab</title>
  <link rel="stylesheet" href="../../../style.css">
  <link rel="stylesheet" href="../style.css">
  <link rel="stylesheet" href="../compare.css">
</head>
<body class="lab-page">
<a class="skip" href="#main">Skip to content</a>
${designShellNav(2, 'compare')}
<main id="main" class="lab-main">
  <p class="eyebrow">Design comparison</p>
  <h1>Compare two container concepts</h1>
  <p class="lede">Compare container count, approximate conditioned and porch areas, glazing, envelope intentions, accessibility considerations, thermal strengths and risks, and the structural items that need engineering review. The comparison uses the same geometry and envelope data as the drawings. It does not invent cost, carbon, energy or code figures.</p>
  <form class="compare-controls" id="compare-controls">
    <label for="compare-a">Concept A</label>
    <select id="compare-a" name="a">${options(a.id)}</select>
    <label for="compare-b">Concept B</label>
    <select id="compare-b" name="b">${options(b.id)}</select>
    <button type="button" id="compare-swap">Swap A and B</button>
  </form>
  <noscript><p class="notice">JavaScript is off. The default comparison and the full table remain available; the selectors and Swap button need JavaScript.</p></noscript>
  <p class="status" id="compare-status" role="status" aria-live="polite">Comparing Woodland Retreat and Common Lodge.</p>
  <div class="compare-grid" id="compare-grid">
    ${panel(a, aConcept)}
    ${panel(b, bConcept)}
  </div>
  <details class="all-concepts" open>
    <summary>All ten concepts at a glance</summary>
    ${table(profiles, concepts)}
  </details>
  <p class="small">The comparison is qualitative. It does not calculate heating load, energy use, carbon, cost, structural capacity or code compliance. Existing authoritative Cabin A and lodge models are unchanged.</p>
</main>
<footer class="site-footer"><p><a href="../../../index.html">Containers Hamlet</a> · <a href="../index.html">Design Lab</a> · <a href="../LICENSE.txt">AGPL-3.0-or-later</a> · <a href="../CONTENT-LICENSE.md">CC BY-SA 4.0 content</a></p></footer>
<script src="../../js/design-schema.js"></script>
<script src="../../js/design-model.js"></script>
<script src="../concepts.js"></script>
<script src="../compare.js"></script>
</body>
</html>`;
}
