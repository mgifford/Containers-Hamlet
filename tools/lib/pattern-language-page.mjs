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
  <p><button type="button" class="secondary pattern-site-button" data-highlight-pattern="${p.number}">Highlight on site plan</button></p>
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

function extensionCard(p, patterns) {
  const links = (p.alexander || []).map((a) => {
    const inCat = (patterns.patterns || []).some((x) => x.number === a.number);
    return inCat ? `<a href="#pattern-${a.number}">${a.number} · ${esc(a.title)}</a>` : `<span>${a.number} · ${esc(a.title)}</span>`;
  }).join(' · ');
  const homes = (p.homes || []).map((h) => `<a href="../architecture/${esc(h)}/">${esc(h.replace('hamlet-', '').replace(/-/g, ' '))}</a>`).join(' · ');
  return `<article class="pattern-card extension-card" id="extension-${esc(p.id)}" data-extension data-title="${esc(p.title)}">
  <header class="pattern-card-header">
    <p class="eyebrow">Original extension · ${esc(label(SCALE_LABEL, p.scale))}</p>
    <h3><a href="#extension-${esc(p.id)}">${esc(p.title)}</a></h3>
    <p class="pattern-badges"><span class="badge extension">Project extension, not an Alexander pattern</span> <span class="badge ${evidenceClass(p.evidenceStatus)}">${esc(label(EVIDENCE_LABEL, p.evidenceStatus))}</span></p>
  </header>
  <p class="pattern-summary">${esc(p.summary)}</p>
  <p><strong>The problem it responds to:</strong> ${esc(p.problem)}</p>
  <p><strong>What it proposes:</strong> ${esc(p.proposal)}</p>
  <p><strong>In Containers Hamlet:</strong> ${esc(p.hamletInterpretation)}</p>
  <details>
    <summary>Homes, linked patterns, trade-offs and questions</summary>
    <p><strong>Homes that demonstrate it:</strong> ${homes || 'Not recorded.'}</p>
    <p><strong>Linked Alexander patterns:</strong> ${links || 'None recorded.'}</p>
    <p><strong>Trade-offs:</strong> ${esc(p.tradeoffs)}</p>
    <p><strong>What is unresolved:</strong> ${esc(p.unresolved)}</p>
    <h4>Questions to ask</h4>
    <ul>${(p.evaluationQuestions || []).map((q) => `<li>${esc(q)}</li>`).join('')}</ul>
  </details>
  <footer class="pattern-card-footer">
    <p class="small"><strong>Status:</strong> This is an original pattern developed for Containers Hamlet. It is not from <em>A Pattern Language</em> and must not be attributed to Christopher Alexander or the book’s authors.</p>
  </footer>
</article>`;
}

export function patternLanguagePage(patterns, siteElements) {
  const scaleOptions = patterns.scales.map((s) => `<option value="${esc(s)}">${esc(label(SCALE_LABEL, s))}</option>`).join('');
  const elementOptions = patterns.elements.map((e) => `<option value="${esc(e)}">${esc(label(ELEMENT_LABEL, e))}</option>`).join('');
  const evidenceOptions = patterns.evidenceStates.map((s) => `<option value="${esc(s)}">${esc(label(EVIDENCE_LABEL, s))}</option>`).join('');
  return `<!doctype html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="A curated, source-verified Pattern Language Explorer for Containers Hamlet: 20 verified Alexander patterns, 10 original energy-pattern extensions, hamlet interpretations, evidence limits and design questions.">
<meta name="color-scheme" content="light dark">
<title>Pattern Language Explorer | Containers Hamlet Design Lab</title>
<link rel="stylesheet" href="../../style.css">
<link rel="stylesheet" href="../style.css">
<link rel="stylesheet" href="pattern-language.css">
<link rel="icon" href="../../assets/favicon.svg" type="image/svg+xml">
<noscript><style>#pattern-controls,.pattern-site-button,#site-clear{display:none}</style></noscript>
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

  <section id="site-plan-section" aria-labelledby="site-plan-title">
    <h2 id="site-plan-title">Pattern and the site plan</h2>
    <p>Select a pattern’s <strong>Highlight on site plan</strong> button. The panel highlights the mapped site-plan layers and lists the same elements as text. Highlights are a reading aid, not a finding that the layout satisfies the pattern.</p>
    <div class="site-pattern-layout">
      <div class="site-plan-frame">
        <object id="pattern-site-plan" data="${esc(siteElements.sitePlan)}" type="image/svg+xml" aria-label="Containers Hamlet site plan. Use the pattern list for highlights and text alternatives.">
          <p>Your browser cannot display the inline site plan. <a href="${esc(siteElements.sitePlan)}">Open the site plan SVG</a>.</p>
        </object>
        <p class="small">The site plan is the same generated fictional plan used elsewhere; no coordinates are duplicated here. Select a pattern to outline the relevant layers.</p>
      </div>
      <aside class="site-highlight-panel" aria-labelledby="highlight-title">
        <h3 id="highlight-title">Highlighted elements</h3>
        <p id="site-highlight-status" class="status" role="status" aria-live="polite">No pattern selected. The full site plan and the element key below are available without JavaScript.</p>
        <ul id="site-highlight-list" class="highlight-list"></ul>
        <button type="button" id="site-clear" class="secondary" disabled>Clear highlight</button>
        <noscript><p class="small">Highlighting needs JavaScript; the site plan, element key and pattern text remain available.</p></noscript>
      </aside>
    </div>
    <details class="site-key">
      <summary>Site-element key and limitations</summary>
      <div class="table-wrap" tabindex="0" role="region" aria-label="Site-element key"><table><caption>Stable site elements used by the pattern Explorer.</caption><thead><tr><th scope="col">Element</th><th scope="col">What it covers</th><th scope="col">Evidence / limitation</th></tr></thead><tbody>
        ${siteElements.elements.map((e) => `<tr><th scope="row">${esc(e.label)}</th><td>${esc(e.description)}${e.selectors.length ? '' : ' <strong>Not shown at site-plan scale.</strong>'}</td><td>${esc(label(EVIDENCE_LABEL, e.evidenceStatus))}. ${esc(e.note)}</td></tr>`).join('')}
      </tbody></table></div>
    </details>
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

  <section aria-labelledby="energy-patterns-title" id="energy-patterns">
    <h2 id="energy-patterns-title">Energy patterns developed for this project</h2>
    <p class="notice"><strong>These are original extensions, not Christopher Alexander patterns.</strong> They connect the residential energy work to the architectural pattern language. Each is a design proposition developed for Containers Hamlet, deliberately separated from the numbered Alexander patterns. The links back to Alexander patterns use only verified titles.</p>
    <p>The extensions describe right-sized energy, solar outdoor rooms, shared infrastructure, winter resilience, essential services, repairable technology, woodland preservation, seasonal adaptation, accessible service infrastructure and low-energy domestic life. They are not a checklist and do not replace the measured-energy and professional-review gaps recorded elsewhere.</p>
    <div class="pattern-grid">
      ${(patterns.extensions && patterns.extensions.patterns || []).map((p) => extensionCard(p, patterns)).join('\n')}
    </div>
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
      <li><a href="../scenarios/">Site scenarios</a> — baseline and two conceptual arrangements.</li>
      <li><a href="../evaluation/">Resident evaluation</a> — six open activity sequences and records.</li>
      <li><a href="../illustration/">Illustration pipeline</a> — scene, prompt and manifest rules.</li>
      <li><a href="https://github.com/mgifford/Containers-Hamlet/blob/main/docs/pattern-language.md">Pattern-language method and copyright notes</a></li>
      <li><a href="https://github.com/mgifford/Containers-Hamlet/blob/main/docs/pattern-methodology.md">Evaluation methodology and evidence policy</a></li>
    </ul>
    <p class="small">This Explorer includes the Phase 2 site-plan highlighting layer. The Phase 3 scenario comparison is at <a href="../scenarios/">/design-lab/scenarios/</a> and the Phase 5 evaluation framework is at <a href="../evaluation/">/design-lab/evaluation/</a>. Completed resident evaluations remain later work; they are not implied by this page.</p>
  </section>
</main>
<footer class="site-footer"><p><a href="../../index.html">Containers Hamlet</a> · <a href="../index.html">Design Lab</a> · <a href="../LICENSE.txt">AGPL-3.0-or-later</a> · <a href="../CONTENT-LICENSE.md">CC BY-SA 4.0 content</a></p></footer>
<script type="application/json" id="pattern-site-elements">${JSON.stringify(siteElements).replace(/</g, "\\u003c")}</script>
<script src="patterns.js" defer></script>
</body>
</html>`;
}
