// Public Pattern Language Explorer. Code: MIT. Pattern catalogue text: CC BY-SA 4.0.
import { designShellNav } from './design-nav.mjs';
import { ELEMENT_LABEL, EVIDENCE_LABEL, SCALE_LABEL } from './patterns.mjs';

const esc = (v) => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const label = (map, key) => map[key] || key;
const byNumber = (p) => new Map(p.patterns.map((x) => [x.number, x]));
const titleOf = (patterns, n) => (byNumber(patterns).get(n) || {}).title || 'Pattern ' + n;
const evidenceClass = (s) => 'evidence-' + String(s).replace(/[^a-z-]/g, '');

function card(p, patterns) {
  const related = (p.relatedPatterns || []).map((n) => {
    const r = byNumber(patterns).get(n);
    return r ? `<a href="#pattern-${n}">${n} · ${esc(r.title)}</a>` : '';
  }).filter(Boolean).join(' · ');
  return `<article class="pattern-card" id="pattern-${p.number}" data-pattern data-number="${p.number}" data-title="${esc(p.title)}" data-scale="${esc(p.scale)}" data-elements="${esc(p.applicableElements.join(' '))}" data-evidence="${esc(p.evidenceStatus)}" data-search="${esc([p.number, p.title, p.summary, p.hamletInterpretation, p.currentResponse].join(' '))}">
  <header class="pattern-card-header">
    <p class="eyebrow">Pattern ${p.number} · ${esc(label(SCALE_LABEL, p.scale))}</p>
    <h3><a href="#pattern-${p.number}">${esc(p.title)}</a></h3>
    <p class="pattern-badges"><span class="badge ${evidenceClass(p.evidenceStatus)}">${esc(label(EVIDENCE_LABEL, p.evidenceStatus))}</span> <span class="badge">${esc(label(ELEMENT_LABEL, p.applicableElements[0]))}${p.applicableElements.length > 1 ? ' +' + (p.applicableElements.length - 1) : ''}</span> <span class="badge verified">Title/number verified</span></p>
  </header>
  <p class="pattern-summary">${esc(p.summary)}</p>
  <p><strong>In Containers Hamlet:</strong> ${esc(p.hamletInterpretation)}</p>
  <p class="small"><strong>Current response:</strong> ${esc(p.currentResponse)}</p>
  <details>
    <summary>Design questions, trade-offs, evidence and limits</summary>
    <div class="pattern-detail-grid">
      <section><h4>Questions to ask</h4><ul>${p.evaluationQuestions.map((q) => `<li>${esc(q)}</li>`).join('')}</ul></section>
      <section><h4>Design alternatives</h4><p>${esc(p.alternatives)}</p><h4>Trade-offs and competing priorities</h4><p>${esc(p.tradeoffs)}</p></section>
      <section><h4>What is unresolved</h4><p>${esc(p.unresolved)}</p><h4>Limitations</h4><ul>${p.limitations.map((q) => `<li>${esc(q)}</li>`).join('')}</ul></section>
    </div>
    <p><strong>Why these patterns are linked:</strong> ${esc(p.relationshipNote)}</p>
    <p class="small"><strong>Related patterns:</strong> ${related || 'None recorded.'}</p>
  </details>
  <footer class="pattern-card-footer">
    <p class="small"><strong>Source:</strong> ${esc(patterns.source.work)} (${patterns.source.year}), pattern ${p.number}. <a href="${esc(patterns.source.url)}" rel="noopener">Open the primary source PDF</a>. ${p.sourceVerified ? 'Title and number checked against the source.' : 'Verification pending.'}</p>
    <p class="small">This is an original interpretation, not a quotation from the book. It is not a building-code, accessibility or ecological-compliance finding.</p>
  </footer>
</article>`;
}

export function patternLanguagePage(patterns) {
  const scaleOptions = patterns.scales.map((s) => `<option value="${esc(s)}">${esc(label(SCALE_LABEL, s))}</option>`).join('');
  const elementOptions = patterns.elements.map((e) => `<option value="${esc(e)}">${esc(label(ELEMENT_LABEL, e))}</option>`).join('');
  const evidenceOptions = patterns.evidenceStates.map((s) => `<option value="${esc(s)}">${esc(label(EVIDENCE_LABEL, s))}</option>`).join('');
  return `<!doctype html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="A curated, source-verified Pattern Language Explorer for Containers Hamlet: 20 patterns on landscape, community, buildings and interiors, with original hamlet interpretations, evidence limits and design questions.">
<meta name="color-scheme" content="light dark">
<title>Pattern Language Explorer | Containers Hamlet Design Lab</title>
<link rel="stylesheet" href="../../style.css">
<link rel="stylesheet" href="../style.css">
<link rel="stylesheet" href="pattern-language.css">
<link rel="icon" href="../../assets/favicon.svg" type="image/svg+xml">
<noscript><style>#pattern-controls{display:none}</style></noscript>
</head>
<body class="lab-page">
<a class="skip" href="#main">Skip to content</a>
${designShellNav(2, 'pattern-language')}
<main id="main" class="lab-main">
  <p class="eyebrow">Design Lab · pattern language</p>
  <h1>Designing a Hamlet: Patterns, People and Place</h1>
  <p class="lede">A Pattern Language is useful here as a set of questions about relationships — between private homes and shared places, between paths and destinations, between a room and the weather outside. It is not a rulebook, a code or a scorecard.</p>
  <p class="notice"><strong>How to read this:</strong> the pattern number and title are referenced from the 1977 book by Christopher Alexander, Sara Ishikawa and Murray Silverstein, with Max Jacobson, Ingrid Fiksdahl-King and Shlomo Angel. Every summary, hamlet interpretation and evaluation here is new text. Pattern titles/numbers were checked against the primary source; the interpretations are design propositions, not claims about the authors’ intent. The book is copyrighted; no book text or illustrations are reproduced.</p>

  <section aria-labelledby="philosophy-title">
    <h2 id="philosophy-title">The design philosophy</h2>
    <p>Containers Hamlet starts with six private homes, a shared lodge and a fictional Canadian Shield landscape. The homes should support independence and privacy. The community should support cooperation, companionship and mutual assistance. Neither objective should dominate the other.</p>
    <p>The aim is <strong>voluntary community</strong>: opportunities for contact without compulsory participation, and private places to withdraw without feeling excluded. The landscape is not a backdrop; ecological protection, water, biodiversity, climate resilience and maintenance shape every decision.</p>
    <ol class="principles">
      <li><strong>Protect the landscape first.</strong> Buildings and infrastructure respond to existing conditions rather than forcing the land to fit an arbitrary plan.</li>
      <li><strong>Support voluntary community.</strong> Shared spaces invite participation without making residents dependent on communal activity.</li>
      <li><strong>Preserve meaningful privacy.</strong> Each home needs visual, acoustic and social independence.</li>
      <li><strong>Make walking useful and pleasant.</strong> Routes connect real destinations and everyday activities.</li>
      <li><strong>Create positive outdoor spaces.</strong> Outdoor areas are usable places, not leftover gaps.</li>
      <li><strong>Build for diverse residents.</strong> Accessibility, mobility, sensory differences, ageing, visitors and changing households shape the design.</li>
      <li><strong>Design for the actual climate.</strong> Winter, rain, heat, snow, smoke, wildfire, power interruptions and changing weather matter.</li>
      <li><strong>Prefer simplicity and repairability.</strong> Avoid unnecessary technical complexity and fragile infrastructure.</li>
      <li><strong>Evaluate materials honestly.</strong> Shipping containers are an option, not an assumed environmental advantage.</li>
      <li><strong>Make assumptions visible.</strong> Separate conceptual design, evidence and questions requiring professional assessment.</li>
      <li><strong>Support adaptation.</strong> Homes, shared spaces and infrastructure should accommodate changing residents and needs.</li>
      <li><strong>Avoid false precision.</strong> Do not invent costs, energy savings, ecological benefits or accessibility conformance.</li>
    </ol>
    <p class="small">This is a conceptual, fictional project. The site is not surveyed, the buildings are not construction-ready, and the pattern language is not a compliance standard. See the <a href="https://github.com/mgifford/Containers-Hamlet/blob/main/docs/design-philosophy.md">design philosophy notes</a> and <a href="https://github.com/mgifford/Containers-Hamlet/blob/main/docs/pattern-language.md">pattern-language method</a>.</p>
  </section>

  <section aria-labelledby="explorer-title">
    <h2 id="explorer-title">Pattern Explorer</h2>
    <p>Start with a plain-language problem. Filter by scale, hamlet element or evidence state. Each pattern has a stable fragment link such as <code>#pattern-104</code>; related-pattern links stay inside the page and work with the keyboard.</p>
    <form id="pattern-controls" class="pattern-controls" role="search" aria-label="Search and filter patterns">
      <label>Search <input type="search" id="pattern-search" placeholder="Name, number or phrase" autocomplete="off"></label>
      <label>Scale <select id="pattern-scale"><option value="">All scales</option>${scaleOptions}</select></label>
      <label>Hamlet element <select id="pattern-element"><option value="">All elements</option>${elementOptions}</select></label>
      <label>Evidence <select id="pattern-evidence"><option value="">All evidence states</option>${evidenceOptions}</select></label>
      <button type="button" id="pattern-reset" class="secondary">Reset</button>
    </form>
    <p id="pattern-status" class="status" role="status" aria-live="polite">Showing all ${patterns.patterns.length} patterns.</p>
    <noscript><p class="notice">Filtering needs JavaScript. All ${patterns.patterns.length} patterns are listed below and remain readable without it.</p></noscript>
    <div class="pattern-list" id="pattern-list">
      ${patterns.patterns.map((p) => card(p, patterns)).join('\n')}
    </div>
    <p class="small">A pattern may be partially applicable or deliberately rejected. There are no pass/fail scores and no single “community quality” index. Evidence states describe the <em>current</em> application, not the pattern’s worth.</p>
  </section>

  <section aria-labelledby="reading-title">
    <h2 id="reading-title">What the evidence labels mean</h2>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Evidence states"><table><caption>Evidence states used in the Explorer.</caption><thead><tr><th scope="col">State</th><th scope="col">Meaning</th></tr></thead><tbody>
      <tr><th scope="row">Not evaluated</th><td>The design question has not been considered.</td></tr>
      <tr><th scope="row">Conceptual</th><td>A potential response has been illustrated but not tested.</td></tr>
      <tr><th scope="row">Evidence needed</th><td>A relevant concern is identified, but the supporting information is missing.</td></tr>
      <tr><th scope="row">Evidence-supported</th><td>A conclusion is supported only within the stated scope.</td></tr>
      <tr><th scope="row">Trade-off identified</th><td>The design improves one consideration while potentially weakening another.</td></tr>
      <tr><th scope="row">Not applicable</th><td>The pattern is not relevant here, with an explanation.</td></tr>
    </tbody></table></div>
    <p class="small">Evidence states are stored on the application, not the pattern definition. The same pattern may be conceptual for one home, evidence-needed for the site and not applicable to the lodge.</p>
  </section>

  <section aria-labelledby="next-title">
    <h2 id="next-title">Where this connects</h2>
    <ul>
      <li><a href="../">Design Lab gallery</a> — the six selected homes.</li>
      <li><a href="../architecture/hamlet-woodland-cottage/">Woodland Cottage drawings</a> — the canonical SVG reference.</li>
      <li><a href="../illustration/">Illustration pipeline</a> — scene, prompt and manifest rules.</li>
      <li><a href="https://github.com/mgifford/Containers-Hamlet/blob/main/docs/pattern-language.md">Pattern-language method and copyright notes</a></li>
      <li><a href="https://github.com/mgifford/Containers-Hamlet/blob/main/docs/pattern-methodology.md">Evaluation methodology and evidence policy</a></li>
    </ul>
    <p class="small">This Explorer is Phase 1 of the pattern-language work. Site-plan highlighting, scenario comparison, lodge/cabin annotations, resident scenarios and structured evaluation records are the next phases. They are not implied by this page.</p>
  </section>
</main>
<footer class="site-footer"><p><a href="../../index.html">Containers Hamlet</a> · <a href="../index.html">Design Lab</a> · <a href="../LICENSE.txt">AGPL-3.0-or-later</a> · <a href="../CONTENT-LICENSE.md">CC BY-SA 4.0 content</a></p></footer>
<script src="patterns.js" defer></script>
</body>
</html>`;
}
