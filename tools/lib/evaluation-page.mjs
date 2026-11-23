// Evaluation framework. Code: MIT. Scenario text: CC BY-SA 4.0.
import { designShellNav } from './design-nav.mjs';
const esc = (v) => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const LIST = (a) => '<ul>' + a.map((x) => `<li>${esc(x)}</li>`).join('') + '</ul>';
export function evaluationPage(scenarios, records, patterns, designs) {
  const byDesign = {}; designs.forEach((d) => { byDesign[d.id] = d; });
  const byPattern = {}; patterns.patterns.forEach((p) => { byPattern[p.number] = p; });
  const byScenario = {}; scenarios.scenarios.forEach((s) => { byScenario[s.id] = s; });
  const completed = records.records.filter((r) => r.status !== 'not-evaluated').length;
  const cards = scenarios.scenarios.map((s) => `<article class="scenario-card evaluation-card" id="scenario-${esc(s.id)}">
    <header><p class="eyebrow">Resident sequence · ${esc(s.id)}</p><h2>${esc(s.title)}</h2><p>${esc(s.resident)}</p></header>
    <dl class="evaluation-facts">
      <div><dt>Design pairing</dt><dd><a href="../architecture/${esc(s.design)}/">${esc(s.designLabel)}</a> — illustrative, not an allocation.</dd></div>
      <div><dt>Status</dt><dd><span class="record-status">Not evaluated</span></dd></div>
      <div><dt>Evaluation question</dt><dd>${esc(s.question)}</dd></div>
    </dl>
    <h3>Activity sequence</h3><ol>${s.steps.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
    <h3>Evidence needed</h3>${LIST(s.evidenceNeeded)}
    <p class="small"><strong>Related patterns:</strong> ${s.patterns.map((n) => byPattern[n] ? `<a href="../pattern-language/#pattern-${n}">${n} · ${esc(byPattern[n].title)}</a>` : '').join(' · ')}</p>
    <p class="small">This scenario is a prompt for a real walkthrough. It does not record an observation or a resident's view.</p>
  </article>`).join('\n');
  const recordRows = records.records.map((r) => `<tr><th scope="row">${esc(r.id)}</th><td>${esc(byScenario[r.scenario] ? byScenario[r.scenario].title : r.scenario)}</td><td>${esc(byDesign[r.design] ? byDesign[r.design].name : r.design)}</td><td>${esc(r.pattern)} · ${esc(byPattern[r.pattern] ? byPattern[r.pattern].title : '')}</td><td>${esc(r.method)}</td><td><span class="record-status">Not evaluated</span></td><td>—</td><td>—</td></tr>`).join('');
  return `<!doctype html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Open resident scenarios and structured evaluation records for Containers Hamlet. No walkthrough has been completed; these are evaluation prompts, not findings.">
<meta name="color-scheme" content="light dark">
<title>Resident evaluation records | Containers Hamlet Design Lab</title>
<link rel="stylesheet" href="../../style.css">
<link rel="stylesheet" href="../style.css">
<link rel="stylesheet" href="evaluation.css">
<link rel="icon" href="../../assets/favicon.svg" type="image/svg+xml">
</head>
<body class="lab-page">
<a class="skip" href="#main">Skip to content</a>
${designShellNav(2, 'evaluation')}
<main id="main" class="lab-main">
  <p class="eyebrow">Design Lab · resident evaluation</p>
  <h1>Evaluate use, not taste.</h1>
  <p class="lede">Six resident activity sequences turn the pattern, fire/water and site-arrangement questions into walkthroughs someone can actually perform. The records are intentionally empty.</p>
  <p class="notice"><strong>No evaluation has been completed.</strong> ${completed} of ${records.records.length} records contain observations. Every scenario below is a prompt, not a finding. Do not read “not evaluated” as a pass or a failure.</p>
  <div class="button-row"><a class="action" href="../../community/scenarios/">Read the resident scenarios</a><a class="action secondary" href="../scenarios/">Compare site arrangements</a><a class="action secondary" href="../pattern-language/">Open the Pattern Language Explorer</a><a class="action secondary" href="record-template.json">Download the blank record template</a></div>

  <section aria-labelledby="how-title">
    <h2 id="how-title">How a record is completed</h2>
    <ol class="evaluation-steps"><li>Choose one scenario and its paired design.</li><li>Walk the activity sequence with a resident or a person acting the part; do not coach the result.</li><li>Record what happened, where, when and with what assistance.</li><li>Record the evidence and its limits; leave the record open if evidence is missing.</li><li>Name the reviewer and date. Do not turn the outcome into a score.</li></ol>
    <p class="small">The blank template is <a href="record-template.json">record-template.json</a>. A completed record must add a reviewer, date, observations and evidence. The current records deliberately have none of those.</p>
  </section>

  <section aria-labelledby="records-title">
    <h2 id="records-title">Open evaluation records</h2>
    <p>One open record per scenario. They are a work queue, not results.</p>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Open evaluation records"><table><caption>Structured records. All are not evaluated.</caption><thead><tr><th scope="col">Record</th><th scope="col">Scenario</th><th scope="col">Design</th><th scope="col">Pattern</th><th scope="col">Method</th><th scope="col">Status</th><th scope="col">Reviewer</th><th scope="col">Date</th></tr></thead><tbody>${recordRows}</tbody></table></div>
    <p class="small">No score, index or community-quality rating is used. A record is evidence about one question, on one date, for one design version.</p>
  </section>

  <section aria-labelledby="scenarios-title">
    <h2 id="scenarios-title">The six sequences</h2>
    <p>These are illustrative activity sequences. They are not resident stereotypes, a waiting list or an application process.</p>
    <div class="scenario-list evaluation-list">${cards}</div>
  </section>

  <section aria-labelledby="limits-title">
    <h2 id="limits-title">Limits</h2>
    <ul><li>No resident, occupational therapist, accessibility professional, fire reviewer or engineer has completed these records.</li><li>The design pairings are illustrative; they do not assign anyone to a home.</li><li>No water, fire, power, accessibility, cost or ecological test has been completed.</li><li>The scenarios do not represent all ages, incomes, household structures, disabilities or care needs.</li><li>A future record must state who observed, when, with what assistance and what evidence was used.</li></ul>
  </section>
</main>
<footer class="site-footer"><p><a href="../../index.html">Containers Hamlet</a> · <a href="../index.html">Design Lab</a> · <a href="../LICENSE.txt">AGPL-3.0-or-later</a> · <a href="../CONTENT-LICENSE.md">CC BY-SA 4.0 content</a></p></footer>
</body>
</html>`;
}

export function blankRecordTemplate() {
  return {
    schema: 'containers-hamlet-evaluation-record/v1',
    note: 'Blank record. Do not add observations until a real walkthrough has occurred. Remove this note only when the record is complete.',
    id: null,
    scenario: null,
    design: null,
    designVersion: null,
    pattern: null,
    element: null,
    question: null,
    method: null,
    evidence: [],
    observations: [],
    limitations: [],
    status: 'not-evaluated',
    reviewer: null,
    reviewerRole: null,
    date: null,
    consent: null
  };
}
