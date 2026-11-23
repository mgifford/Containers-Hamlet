// Public scenario comparison. Code: MIT. Scenario text: CC BY-SA 4.0.
import { designShellNav } from './design-nav.mjs';

const esc = (v) => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const label = (s) => s.label + ' · ' + s.title;

export function scenarioSVG(s) {
  const id = 'scenario-' + s.id;
  const homeSquares = s.diagram.homes.map((p, i) => `<g class="diagram-home"><rect x="${p[0] - 13}" y="${p[1] - 13}" width="26" height="26" fill="#d9c7a5" stroke="#274c3b" stroke-width="2"/><text x="${p[0]}" y="${p[1] + 4}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#1d392c">H${i + 1}</text></g>`).join('');
  const paths = s.diagram.paths.map((line) => `<polyline points="${line.map((p) => p[0] + ',' + p[1]).join(' ')}" fill="none" stroke="#8a5a32" stroke-width="3" stroke-dasharray="6 5"/>`).join('');
  const common = s.diagram.common.map((c) => `<ellipse cx="${c[0]}" cy="${c[1]}" rx="${c[2]}" ry="${c[3]}" fill="#dce8cf" stroke="#5c7a51" stroke-width="2" stroke-dasharray="5 4"/><text x="${c[0]}" y="${c[1] + 4}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#31573f">common clearing</text>`).join('');
  const pockets = s.diagram.pockets.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="17" fill="#e7dfb9" stroke="#7c6b3f" stroke-width="2"/><text x="${p[0]}" y="${p[1] + 3}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9" font-weight="700" fill="#5e4a20">P${i + 1}</text>`).join('');
  const lodge = `<g class="diagram-lodge"><rect x="${s.diagram.lodge[0] - 18}" y="${s.diagram.lodge[1] - 18}" width="36" height="36" rx="4" fill="#b58a62" stroke="#17392e" stroke-width="2"/><text x="${s.diagram.lodge[0]}" y="${s.diagram.lodge[1] + 4}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#fff">L</text></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" role="img" aria-labelledby="${id}-t ${id}-d" data-scenario-diagram="${esc(s.id)}">
<title id="${id}-t">${esc(s.label)} — ${esc(s.title)} schematic arrangement</title>
<desc id="${id}-d">Conceptual diagram of six homes, the common lodge and ${s.id === 'distributed' ? 'dispersed paths' : s.id === 'central-clearing' ? 'a central common clearing' : 'a pedestrian spine with three social pockets'}. This is not a site plan, survey or construction layout; shapes are schematic and not to scale.</desc>
<rect width="640" height="400" fill="#faf8f2"/>
<text x="24" y="30" font-family="system-ui, sans-serif" font-size="18" font-weight="800" fill="#1d392c">${esc(s.label)} · ${esc(s.title)}</text>
<text x="24" y="48" font-family="system-ui, sans-serif" font-size="10" fill="#3f5a4c">Schematic concept · not to scale · no site coordinates · not a construction layout</text>
<rect x="20" y="64" width="600" height="284" fill="#f3f0e5" stroke="#b8b29e"/>
${common}${pockets}${paths}${homeSquares}${lodge}
<text x="24" y="392" font-family="system-ui, sans-serif" font-size="8" fill="#5e6a58">Original concept | CC BY-SA 4.0 | Containers Hamlet contributors 2026 | Schematic; not a site plan or surveyed layout</text>
<g font-family="system-ui, sans-serif" font-size="10" fill="#3f5a4c"><rect x="30" y="365" width="14" height="14" fill="#d9c7a5" stroke="#274c3b"/><text x="50" y="376">home H1–H6</text><rect x="130" y="365" width="14" height="14" fill="#b58a62" stroke="#17392e"/><text x="150" y="376">lodge L</text><line x1="225" y1="372" x2="255" y2="372" stroke="#8a5a32" stroke-width="3" stroke-dasharray="5 4"/><text x="262" y="376">conceptual route</text><ellipse cx="405" cy="372" rx="12" ry="8" fill="#dce8cf" stroke="#5c7a51"/><text x="424" y="376">common place</text><text x="530" y="376">${esc(s.status === 'baseline' ? 'baseline assignment' : 'alternative concept')}</text></g>
</svg>`;
}

function list(items) { return '<ul>' + items.map((x) => `<li>${esc(x)}</li>`).join('') + '</ul>'; }
function patternLinks(patterns, byNumber) { return patterns.map((n) => { const p = byNumber[n]; return p ? `<a href="../pattern-language/#pattern-${n}">${n} · ${esc(p.title)}</a>` : ''; }).filter(Boolean).join(' · '); }

export function scenariosPage(data, patterns) {
  const byNumber = {}; patterns.patterns.forEach((p) => { byNumber[p.number] = p; });
  const options = data.scenarios.map((s) => `<option value="${esc(s.id)}">${esc(label(s))}</option>`).join('');
  const cards = data.scenarios.map((s) => `<article class="scenario-card" id="scenario-${esc(s.id)}" data-scenario="${esc(s.id)}">
    <header><p class="eyebrow">Scenario ${esc(s.label)} · ${esc(s.status === 'baseline' ? 'baseline' : 'alternative')}</p><h3>${esc(s.title)}</h3><p class="small"><strong>Geometry:</strong> ${esc(s.geometryStatus)} · <strong>Evidence:</strong> ${esc(s.evidenceStatus)}</p></header>
    <img src="${esc(s.id)}.svg" width="640" height="400" alt="${esc(s.label)} ${esc(s.title)}: schematic diagram of six homes, lodge and ${esc(s.id === 'distributed' ? 'dispersed paths' : s.id === 'central-clearing' ? 'a central common clearing' : 'a spine with social pockets')}. Not to scale and not a site plan." loading="lazy" decoding="async">
    <p>${esc(s.summary)}</p>
    <div class="scenario-columns"><section><h4>Potential advantages</h4>${list(s.advantages)}</section><section><h4>Trade-offs</h4>${list(s.disadvantages)}</section></div>
    <h4>Evaluation questions</h4>${list(s.evaluationQuestions)}
    <p class="small"><strong>Related patterns:</strong> ${patternLinks(s.patterns, byNumber)}</p>
    <p class="small">${s.status === 'baseline' ? 'This is the current illustrative assignment, not a surveyed plan.' : 'This is a schematic alternative, not a proposed site layout. No site coordinates or construction feasibility are established.'}</p>
  </article>`).join('\n');
  return `<!doctype html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Compare the Containers Hamlet baseline with three conceptual arrangements: distributed woodland retreats, a shared central clearing and a woodland spine with social pockets. Trade-offs, evidence limits and pattern links.">
<meta name="color-scheme" content="light dark">
<title>Compare hamlet arrangements | Containers Hamlet Design Lab</title>
<link rel="stylesheet" href="../../style.css">
<link rel="stylesheet" href="../style.css">
<link rel="stylesheet" href="scenarios.css">
<link rel="icon" href="../../assets/favicon.svg" type="image/svg+xml">
<noscript><style>#scenario-compare{display:none}</style></noscript>
</head>
<body class="lab-page">
<a class="skip" href="#main">Skip to content</a>
${designShellNav(2, 'scenarios')}
<main id="main" class="lab-main">
  <p class="eyebrow">Design Lab · site scenarios</p>
  <h1>Three ways to hold a hamlet together.</h1>
  <p class="lede">The existing distributed arrangement is the baseline. Two alternatives explore a central clearing and a woodland spine with social pockets. They are conceptual comparisons, not proposals, and no arrangement is declared best.</p>
  <p class="notice"><strong>Baseline preserved.</strong> The current site plan remains the baseline. The two alternatives are schematic: they do not use surveyed coordinates, do not replace the site plan and do not establish feasibility, cost, ecological performance or accessibility.</p>
  <div class="button-row"><a class="action" href="../pattern-language/">Open the Pattern Language Explorer</a><a class="action secondary" href="../../assets/site-plan.svg">Open the baseline site plan</a></div>
  <figure class="baseline-plan">
    <object id="baseline-site-plan" data="../../assets/site-plan.svg" type="image/svg+xml" aria-label="Current Containers Hamlet site plan, the preserved baseline. The alternative diagrams below are schematic and are not overlays on this plan.">
      <p>Your browser cannot display the inline baseline plan. <a href="../../assets/site-plan.svg">Open the baseline site plan SVG</a>.</p>
    </object>
    <figcaption>The current illustrative site plan is the baseline. The alternative diagrams below are schematic and do not use its coordinates.</figcaption>
  </figure>

  <section id="scenario-compare" aria-labelledby="compare-title">
    <h2 id="compare-title">Compare two arrangements</h2>
    <form class="scenario-controls" id="scenario-controls" aria-label="Compare two scenarios">
      <label>Left <select id="scenario-left">${options}</select></label>
      <label>Right <select id="scenario-right">${options}</select></label>
      <button type="button" id="scenario-reset" class="secondary">Restore baseline</button>
    </form>
    <p id="scenario-status" class="status" role="status" aria-live="polite">Comparing the baseline with the central clearing.</p>
    <div class="scenario-compare-grid">
      <section class="scenario-panel" aria-labelledby="left-title"><h3 id="left-title">Left</h3><img id="compare-left-img" src="distributed.svg" width="640" height="400" alt="Baseline distributed woodland retreats schematic."><div id="compare-left-text"></div></section>
      <section class="scenario-panel" aria-labelledby="right-title"><h3 id="right-title">Right</h3><img id="compare-right-img" src="central-clearing.svg" width="640" height="400" alt="Central clearing alternative schematic."><div id="compare-right-text"></div></section>
    </div>
    <p class="small">Switch with the native selects. The comparison updates the URL so it can be shared; the baseline can be restored at any time. No scenario is automatically ranked.</p>
  </section>

  <section aria-labelledby="all-title">
    <h2 id="all-title">All three arrangements</h2>
    <p>The full descriptions, trade-offs and questions are below, so the page remains useful without JavaScript.</p>
    <div class="scenario-list">${cards}</div>
  </section>

  <section aria-labelledby="tradeoffs-title">
    <h2 id="tradeoffs-title">What changes between them</h2>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Scenario trade-off summary"><table><caption>Arrangement comparison. These are hypotheses, not measurements or findings.</caption><thead><tr><th scope="col">Question</th><th scope="col">Distributed</th><th scope="col">Central clearing</th><th scope="col">Woodland spine</th></tr></thead><tbody>
      <tr><th scope="row">Privacy</th><td>More separation; longer edges</td><td>More overlooked; concentrated activity</td><td>Mixed; pockets may sit near private edges</td></tr>
      <tr><th scope="row">Spontaneous contact</th><td>Lower</td><td>Higher</td><td>Moderate and repeated</td></tr>
      <tr><th scope="row">Walking distance</th><td>Longer</td><td>Shorter to the centre</td><td>Moderate; spine can be legible</td></tr>
      <tr><th scope="row">Infrastructure</th><td>Dispersed</td><td>Concentrated</td><td>Linear, with several shared pockets</td></tr>
      <tr><th scope="row">Ecological risk</th><td>Dispersed disturbance</td><td>Concentrated clearing pressure</td><td>Linear corridors and pocket maintenance</td></tr>
      <tr><th scope="row">Winter maintenance</th><td>Many segments</td><td>One central area</td><td>Spine plus several pockets</td></tr>
      <tr><th scope="row">Evidence status</th><td>Conceptual baseline</td><td>Conceptual alternative</td><td>Conceptual alternative</td></tr>
    </tbody></table></div>
    <p class="small">No row proves a winner. Each requires site survey, ecological assessment, accessibility review, fire access, infrastructure design and resident input.</p>
  </section>

  <section aria-labelledby="limits-title">
    <h2 id="limits-title">Limits</h2>
    <ul><li>The baseline is an illustrative Design Lab assignment, not a survey.</li><li>Alternatives are schematic diagrams, not georeferenced site plans.</li><li>No scenario has been tested with residents, priced, engineered or ecologically assessed.</li><li>Accessibility, winter access, fire access, privacy and noise are hypotheses, not measurements.</li><li>The common land, ownership and governance relationships are not mapped.</li></ul>
  </section>
</main>
<footer class="site-footer"><p><a href="../../index.html">Containers Hamlet</a> · <a href="../index.html">Design Lab</a> · <a href="../LICENSE.txt">AGPL-3.0-or-later</a> · <a href="../CONTENT-LICENSE.md">CC BY-SA 4.0 content</a></p></footer>
<script type="application/json" id="scenario-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
<script src="scenarios.js" defer></script>
</body>
</html>`;
}
