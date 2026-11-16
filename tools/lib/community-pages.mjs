// Phase 1.5 resident-facing pages. Code: MIT. New original text/diagrams: CC BY-SA 4.0.
const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const link = (href, text, cls) => `<a${cls ? ` class="${cls}"` : ''} href="${href}">${esc(text)}</a>`;

function shell(o) {
  const { title, description, prefix, current, children, pageClass = '' } = o;
  return `<!doctype html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${esc(description)}">
<title>${esc(title)} · Containers Hamlet</title>
<link rel="stylesheet" href="${prefix}style.css">
<link rel="icon" href="${prefix}assets/favicon.svg" type="image/svg+xml">
</head>
<body class="${pageClass}">
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <a class="brand" href="${prefix}index.html">Containers Hamlet</a>
  <nav aria-label="Main">
    <a href="${prefix}community/"${current === 'community' ? ' aria-current="page"' : ''}>Community</a>
    <a href="${prefix}hamlet/"${current === 'map' ? ' aria-current="page"' : ''}>Map</a>
    <a href="${prefix}homes/"${current === 'homes' ? ' aria-current="page"' : ''}>Homes</a>
    <a href="${prefix}design-lab/"${current === 'design' ? ' aria-current="page"' : ''}>Design Lab</a>
    <a href="${prefix}living/"${current === 'living' ? ' aria-current="page"' : ''}>Living Here</a>
    <a href="${prefix}participate/"${current === 'participate' ? ' aria-current="page"' : ''}>Participate</a>
  </nav>
</header>
<main id="main"${pageClass === 'lab-page' ? ' class="lab-main"' : ''} tabindex="-1">
${children}
</main>
<footer class="site-footer">
  <p><a href="${prefix}index.html">Containers Hamlet</a> · <a href="${prefix}community/ownership/">Ownership</a> · <a href="${prefix}community/costs/">Costs</a> · <a href="${prefix}community/roadmap/">Roadmap</a> · <a href="${prefix}community/usability/">Usability</a> · <a href="${prefix}licensing/">Licensing</a></p>
  <p class="small">Fictional, open-source concept. Not a property offer, lease, development approval or legal advice. No tracking, forms, cookies or third-party requests.</p>
</footer>
</body>
</html>`;
}

export function communityPage(data) {
  const prefix = '../';
  const scenarios = data.scenarios.map((s) => `<li><a href="scenarios/#${esc(s.id)}"><strong>${esc(s.title)}</strong><span>${esc(s.summary)}</span></a></li>`).join('\n');
  return shell({ title: 'The community', description: 'What Containers Hamlet is, what a resident would have privately and share, and what remains hypothetical.', prefix, current: 'community', children: `
<nav class="breadcrumb" aria-label="Breadcrumb"><a href="${prefix}index.html">Containers Hamlet</a> / The community</nav>
<p class="eyebrow">A fictional community, a real question</p>
<h1>Six woodland retreats that happen to share a community.</h1>
<p class="lede">Containers Hamlet is a design exploration of six small homes and a shared lodge in a Canadian Shield forest. It is not a property sale, a lease offer or an approved development. It is a way to test how privacy, shared responsibility and a lighter footprint could fit together.</p>
<div class="notice"><strong>Start with the honest version.</strong> The buildings are concept models. The land is fictional. The ownership, costs, water, fire response and approvals are questions to resolve, not settled facts.</div>

<section aria-labelledby="questions-title">
  <h2 id="questions-title">Five questions to start with</h2>
  <div class="resident-questions">
    <article><h3>What is it?</h3><p>Six one- or two-container homes and a common lodge on a fictional 15-acre parcel beside Heron Lake. The architecture is container-first; timber, glazing, insulation and porches are supporting layers.</p></article>
    <article><h3>What would living feel like?</h3><p>A small private home in the trees, a screened porch, a walk instead of a driveway, and a shared lodge for meals, laundry, tools and gatherings.</p></article>
    <article><h3>What would I have privately?</h3><p>Your own sleeping/living space, bathroom, kitchen, storage and porch. The home is compact; it is not a conventional suburban house with a basement and a two-car garage.</p></article>
    <article><h3>What would we share?</h3><p>Land, water and wastewater systems, roads and snow clearing, the lodge, tools, guest space and the maintenance and governance work that keeps them running.</p></article>
    <article><h3>What is unresolved?</h3><p>Tenure and resale, fees, insurance, water capacity, fire response, accessibility, short-term rentals, privacy and the legal structure. See <a href="ownership/">ownership</a>, <a href="costs/">costs</a> and <a href="roadmap/">roadmap</a>.</p></article>
  </div>
</section>

<section aria-labelledby="scenarios-title">
  <h2 id="scenarios-title">Start from a resident, not a floor plan</h2>
  <p>These are illustrative situations, not stereotypes or financial assumptions. Each links to a home concept and the questions it still leaves open.</p>
  <ul class="scenario-list">${scenarios}</ul>
  <p><a class="action" href="scenarios/">Explore all six resident scenarios</a></p>
</section>

<section aria-labelledby="deeper-title">
  <h2 id="deeper-title">Go deeper</h2>
  <div class="hub-grid">
    <a href="ownership/"><strong>Ownership and governance</strong><span>Land trust, home ownership, leases, membership, decision-making and protections.</span></a>
    <a href="costs/"><strong>Financial framework</strong><span>Capital, operating and individual cost categories with a user-entered worksheet.</span></a>
    <a href="roadmap/"><strong>Feasibility roadmap</strong><span>Ten stages from interested people to approvals and operation.</span></a>
    <a href="${prefix}living/"><strong>Living here</strong><span>Winter, groceries, internet, water, wastewater, guests, pets and conflict.</span></a>
    <a href="${prefix}living/#accessibility"><strong>Accessibility</strong><span>What the compact homes do not yet provide, and what must be redesigned.</span></a>
    <a href="${prefix}participate/"><strong>Participate</strong><span>Ways to contribute without disclosing personal circumstances.</span></a>
  </div>
</section>

<section aria-labelledby="fiction-title">
  <h2 id="fiction-title">Fictional example, transferable questions</h2>
  <p>The hamlet is an example, not a claim that this parcel exists or that these homes are permitted. The useful part is the set of questions: how much land a small community needs, how services are shared, who decides, what it costs and what a resident gives up. Those questions can be applied to a real site elsewhere only with local planning, engineering, legal and community work.</p>
</section>

<p class="lab-note"><strong>Do not rely on this page for a real decision.</strong> Confirm land status, planning, water, sewage, fire, insurance, accessibility and tenure with the relevant authorities and professionals.</p>
` });
}

export function scenariosPage(data) {
  const prefix = '../../';
  const cards = data.scenarios.map((s) => `<article class="scenario-card" id="${esc(s.id)}">
    <p class="eyebrow">${esc(s.configuration)}</p>
    <h2>${esc(s.title)}</h2>
    <p>${esc(s.summary)}</p>
    <dl class="scenario-facts">
      <div><dt>Home concept</dt><dd><a href="${prefix}homes/${esc(s.home)}/">${esc(s.home_name)}</a></dd></div>
      <div><dt>Space</dt><dd>${esc(s.space)}</dd></div>
      <div><dt>Storage</dt><dd>${esc(s.storage)}</dd></div>
      <div><dt>Winter</dt><dd>${esc(s.winter)}</dd></div>
      <div><dt>Accessibility</dt><dd>${esc(s.access)}</dd></div>
      <div><dt>Privacy</dt><dd>${esc(s.privacy)}</dd></div>
      <div><dt>Work and connectivity</dt><dd>${esc(s.work)}</dd></div>
      <div><dt>Shared facilities</dt><dd>${esc(s.shared)}</dd></div>
      <div><dt>Responsibilities</dt><dd>${esc(s.responsibilities)}</dd></div>
    </dl>
    <details><summary>Questions that remain unresolved</summary><p>${esc(s.unresolved)}</p></details>
  </article>`).join('\n');
  return shell({ title: 'Resident scenarios', description: 'Six illustrative resident situations and the container-home questions they raise.', prefix, current: 'community', children: `
<nav class="breadcrumb" aria-label="Breadcrumb"><a href="${prefix}index.html">Containers Hamlet</a> / <a href="../">Community</a> / Resident scenarios</nav>
<p class="eyebrow">Illustrative, not representative</p>
<h1>Start from a resident, not a floor plan.</h1>
<p class="lede">These six situations are prompts for design and community decisions. They do not assume incomes, household structures or care needs beyond what is stated, and they are not a waiting list or an application.</p>
<div class="notice"><strong>A 20-foot seasonal cabin is not a universal home.</strong> Juniper is presented as compact seasonal accommodation. A resident with changing mobility, full-time work or significant storage needs may need a larger or redesigned home.</div>
<div class="scenario-grid">${cards}</div>
<p><a class="action" href="../ownership/">Ownership and governance</a> <a class="action secondary" href="../costs/">Costs</a> <a class="action secondary" href="../roadmap/">Roadmap</a></p>
` });
}

export function ownershipPage() {
  const prefix = '../../';
  return shell({ title: 'Ownership and governance', description: 'Possible ownership, lease, membership and governance structures for a small community, with unresolved legal questions.', prefix, current: 'community', children: `
<nav class="breadcrumb" aria-label="Breadcrumb"><a href="${prefix}index.html">Containers Hamlet</a> / <a href="../">Community</a> / Ownership</nav>
<p class="eyebrow">Possible structures, not legal advice</p>
<h1>Who owns what, and who decides?</h1>
<p class="lede">A community land trust is one possible structure. It is not the only one and it is not legally established here. These are questions for future residents, a lawyer, an accountant, a planner and the relevant authorities.</p>
<div class="notice"><strong>No binding model.</strong> Nothing on this page creates a lease, membership, tenancy, ownership interest or legal relationship.</div>

<section aria-labelledby="layers-title"><h2 id="layers-title">Separate the layers</h2>
<div class="table-wrap" role="region" aria-label="Ownership layers" tabindex="0"><table><caption>Six different things that are often blurred together.</caption><thead><tr><th scope="col">Layer</th><th scope="col">What it could mean</th><th scope="col">Unresolved</th></tr></thead><tbody>
<tr><th scope="row">Land</th><td>Held by a trust, co-op, corporation or private owner; may be leased, never sold, or sold with conditions.</td><td>Title, first nation consultation, zoning, financing and perpetuity.</td></tr>
<tr><th scope="row">Individual home</th><td>The resident may own the container dwelling and improvements, or the trust may own and lease it.</td><td>Tax, financing, insurance, removal and resale.</td></tr>
<tr><th scope="row">Homesite lease</th><td>A long-term, transferable right to occupy a defined site, with fees and conditions.</td><td>Term, rent review, default, inheritance and termination.</td></tr>
<tr><th scope="row">Land-trust membership</th><td>A governance relationship with rights to vote, receive information and stand for the board.</td><td>Eligibility, fees, voting weight and exit.</td></tr>
<tr><th scope="row">Residents' association</th><td>Operates shared services, budgets, maintenance and rules.</td><td>Powers, enforcement, meetings, records and dispute resolution.</td></tr>
<tr><th scope="row">Shared infrastructure</th><td>Water, wastewater, roads, power, fire water and the lodge may be owned by a separate entity.</td><td>Cost allocation, replacement reserves and liability.</td></tr>
</tbody></table></div>
</section>

<section aria-labelledby="decisions-title"><h2 id="decisions-title">Decision-making options</h2>
<div class="table-wrap" role="region" aria-label="Decision-making approaches" tabindex="0"><table><caption>Compare the tradeoffs; do not pick one by default.</caption><thead><tr><th scope="col">Approach</th><th scope="col">Strength</th><th scope="col">Risk</th></tr></thead><tbody>
<tr><th scope="row">Consensus</th><td>Strong buy-in and protection for minorities.</td><td>Slow; can be blocked by one person; burnout.</td></tr>
<tr><th scope="row">Consent-based</th><td>Focuses on whether a proposal is good enough to try, not perfect.</td><td>Needs facilitation skill and clear boundaries.</td></tr>
<tr><th scope="row">Elected board</th><td>Clear accountability and operational speed.</td><td>Can drift from residents; needs transparency and recall.</td></tr>
<tr><th scope="row">Delegated operations</th><td>Lets a maintenance or finance lead act within a budget.</td><td>Must have limits, reporting and override.</td></tr>
<tr><th scope="row">Supermajority</th><td>Protects significant decisions from a narrow majority.</td><td>Can make necessary change impossible.</td></tr>
</tbody></table></div>
<p>Whichever mix is chosen, write down who decides, how someone appeals, how records are kept, how conflicts are managed and how a resident can leave.</p>
</section>

<section aria-labelledby="protections-title"><h2 id="protections-title">Protections to negotiate</h2>
<ul>
<li><strong>Housing security:</strong> lease term, renewal, termination, sale of the land and change of use.</li>
<li><strong>Transparent fees:</strong> what is included, how it changes and what happens if a resident cannot pay.</li>
<li><strong>Accessibility accommodations:</strong> physical modifications, meeting access and personal support.</li>
<li><strong>Dispute resolution:</strong> informal steps, mediation, appeal and records.</li>
<li><strong>Participation:</strong> notice, speaking rights, voting, board access and minority protection.</li>
<li><strong>Resale and succession:</strong> who can buy, at what price, and whether the community has a right of first refusal.</li>
<li><strong>Leaving:</strong> notice, removal of the home, restoration and deposit.</li>
<li><strong>Financial distress:</strong> hardship policy, payment plan and non-eviction alternatives.</li>
<li><strong>Household change:</strong> birth, death, divorce, care needs and additional occupants.</li>
</ul>
</section>

<section aria-labelledby="unresolved-title"><h2 id="unresolved-title">What future residents and advisers must decide</h2>
<ul><li>Legal entity and jurisdiction.</li><li>Whether homes can be owned separately and financed.</li><li>Lease term, rent review, resale formula and anti-speculation rules.</li><li>Membership, voting, board powers and dispute resolution.</li><li>Short-term rental, guest and occupancy rules.</li><li>Shared infrastructure ownership, cost allocation and reserves.</li><li>Insurance, wildfire/flood liability and evacuation responsibilities.</li><li>Accessibility modifications and personal support boundaries.</li></ul>
<p class="lab-note">This page is a discussion framework. It is not legal, tax, planning or financial advice.</p>
` });
}

export function costsPage(data) {
  const prefix = '../../';
  const rows = (items, group) => items.map(([name, description], i) => `<tr><th scope="row"><label for="${group}-${i}">${esc(name)}</label><p class="small">${esc(description)}</p></th><td><input id="${group}-${i}" data-worksheet="${group}" type="number" min="0" step="100" inputmode="numeric" placeholder="0"></td></tr>`).join('');
  return shell({ title: 'Financial framework', description: 'A transparent cost-category worksheet for a small container community. No invented prices.', prefix, current: 'community', children: `
<nav class="breadcrumb" aria-label="Breadcrumb"><a href="${prefix}index.html">Containers Hamlet</a> / <a href="../">Community</a> / Costs</nav>
<p class="eyebrow">Categories, not prices</p>
<h1>What would it cost? Start with the categories.</h1>
<p class="lede">There is no credible single price for this hamlet. Land, servicing, approvals, transport, foundations and insurance vary too much. This page gives a worksheet for real quotes and clearly labelled assumptions. It does not invent regional market prices.</p>
<div class="notice"><strong>Not a cost estimate.</strong> Enter your own assumptions. A zero or blank field means “not known”, not “free”. Container construction is not assumed to be cheaper than conventional construction.</div>

<section aria-labelledby="categories-title"><h2 id="categories-title">Cost categories</h2>
<details open><summary>Initial capital costs</summary><ul>${data.costs.initial.map(([n,d]) => `<li><strong>${esc(n)}:</strong> ${esc(d)}</li>`).join('')}</ul></details>
<details><summary>Recurring operating costs</summary><ul>${data.costs.recurring.map(([n,d]) => `<li><strong>${esc(n)}:</strong> ${esc(d)}</li>`).join('')}</ul></details>
<details><summary>Individual resident costs</summary><ul>${data.costs.individual.map(([n,d]) => `<li><strong>${esc(n)}:</strong> ${esc(d)}</li>`).join('')}</ul></details>
</section>

<section aria-labelledby="worksheet-title"><h2 id="worksheet-title">Your worksheet</h2>
<p>Enter figures from quotes, local data or assumptions you can explain. The worksheet adds them; it does not validate them.</p>
<form id="cost-worksheet" class="cost-worksheet">
<fieldset><legend>Initial capital</legend><table><caption>Initial costs</caption><thead><tr><th scope="col">Category</th><th scope="col">Your assumption (CAD)</th></tr></thead><tbody>${rows(data.costs.initial, 'initial')}</tbody></table></fieldset>
<fieldset><legend>Annual operating</legend><table><caption>Annual shared operating costs</caption><thead><tr><th scope="col">Category</th><th scope="col">Your assumption (CAD/year)</th></tr></thead><tbody>${rows(data.costs.recurring, 'operating')}</tbody></table></fieldset>
<fieldset><legend>Individual resident</legend><table><caption>Individual costs</caption><thead><tr><th scope="col">Category</th><th scope="col">Your assumption (CAD)</th></tr></thead><tbody>${rows(data.costs.individual, 'individual')}</tbody></table></fieldset>
<div class="field-grid"><label>Households sharing operating costs<input id="worksheet-households" type="number" min="1" max="30" step="1" value="6"></label></div>
<button type="button" id="calculate-costs">Recalculate worksheet</button>
<p id="cost-result" class="notice" role="status" aria-live="polite">Enter your assumptions, then recalculate.</p>
<p class="small">${esc(data.costs.note)}</p>
</form>
<p class="small">The worksheet is a planning aid, not a budget, quote, mortgage calculation, tax calculation or affordability test.</p>
</section>
<script src="worksheet.js" defer></script>
` });
}

export function roadmapPage(data) {
  const prefix = '../../';
  const stages = data.roadmap.map((s) => `<li><details><summary><strong>Stage ${esc(s.stage)}: ${esc(s.title)}</strong></summary>
  <h3>Key questions</h3><ul>${s.questions.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
  <h3>Responsible</h3><ul>${s.responsible.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
  <h3>Evidence</h3><ul>${s.evidence.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
  <h3>Possible blockers</h3><ul>${s.blockers.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
  <h3>Depends on</h3><p>${esc(s.dependencies.join(', '))}</p></details></li>`).join('\n');
  return shell({ title: 'Feasibility roadmap', description: 'A plain-language sequence for turning a fictional community idea into a real project, with authorities and evidence.', prefix, current: 'community', children: `
<nav class="breadcrumb" aria-label="Breadcrumb"><a href="${prefix}index.html">Containers Hamlet</a> / <a href="../">Community</a> / Roadmap</nav>
<p class="eyebrow">From idea to approvals</p>
<h1>A realistic sequence, not a promise.</h1>
<p class="lede">This is a plain-language path for a real project elsewhere. It is not a schedule, a guarantee of approval or a statement that Containers Hamlet has done any of these steps.</p>
<ol class="roadmap-list">${stages}</ol>
<div class="notice"><strong>Ontario references are starting points, not a permit.</strong> Confirm the applicable official plan, zoning by-law, Ontario Building Code, Ontario Fire Code, conservation authority, health unit and municipal requirements for the actual site.</div>
` });
}

export function livingPage(data) {
  const prefix = '../';
  const items = data.living.map(([topic, community, individual, tradeoff]) => `<article class="living-card"><h3>${esc(topic)}</h3><dl><div><dt>Community</dt><dd>${esc(community)}</dd></div><div><dt>Individual</dt><dd>${esc(individual)}</dd></div><div><dt>Tradeoff</dt><dd>${esc(tradeoff)}</dd></div></dl></article>`).join('\n');
  return shell({ title: 'Living here', description: 'Everyday life in a small rural container community: winter, access, water, wastewater, guests, wildlife, privacy and accessibility.', prefix, current: 'living', children: `
<nav class="breadcrumb" aria-label="Breadcrumb"><a href="${prefix}index.html">Containers Hamlet</a> / Living here</nav>
<p class="eyebrow">The ordinary day</p>
<h1>Living here is a set of tradeoffs.</h1>
<p class="lede">The appeal is a small home, a short walk and shared company. The cost is maintenance, distance, winter, shared decisions and systems that only work if people look after them.</p>
<div class="notice"><strong>Not a service promise.</strong> None of these services exists. The table separates what a community might share from what remains an individual responsibility.</div>
<section aria-labelledby="everyday-title"><h2 id="everyday-title">Everyday practicalities</h2><div class="living-grid">${items}</div></section>
<section id="accessibility" aria-labelledby="accessibility-title"><h2 id="accessibility-title">Accessibility: step-free is not enough</h2>
<p>A nominally step-free entrance does not make a compact container home accessible. The current models show specific limitations:</p>
<ul><li>The Cabin A bathroom does not fit a 1.5 m turning circle with the current layout.</li><li>Juniper's compact bathroom and circulation are not designed for wheelchair use.</li><li>An accessible route must stay clear in winter; a gravel trail can be firm in summer and impassable in ice.</li><li>Doors, thresholds, kitchen work surfaces, storage, controls and emergency egress all need review.</li><li>The lodge has a universal washroom concept, but it is not a substitute for accessible homes or personal care.</li></ul>
<p>Use CSA B651 and the applicable building code as references, with an accessibility consultant. WCAG applies to this website, not to the physical buildings.</p>
<p><a href="${prefix}homes/">Review the homes</a>, the <a href="${prefix}homes/Cedar-Accessible/">Cedar accessible layout study</a> and <a href="${prefix}design-lab/foundations-and-access/">the access study</a>.</p>
</section>
<section aria-labelledby="responsibility-title"><h2 id="responsibility-title">Shared work is real work</h2>
<p>Snow clearing, water testing, septic maintenance, fire-fuel management, bookkeeping and conflict resolution do not happen by themselves. A small community has fewer people to carry them. The governance page sets out the decision and dispute questions; the roadmap sets out the evidence a real project needs.</p>
<p><a class="action" href="${prefix}community/ownership/">Ownership and governance</a> <a class="action secondary" href="${prefix}community/roadmap/">Feasibility roadmap</a></p>
</section>
` });
}

export function participatePage() {
  const prefix = '../';
  const paths = [
    ['Architectural concepts','Test a plan, section, porch or container arrangement against structure, fire, accessibility and buildability.'],
    ['Accessibility','Review the homes, paths and shared facilities; identify barriers and propose redesigns.'],
    ['Community governance','Compare ownership, membership, decision-making and dispute-resolution models.'],
    ['Environmental stewardship','Review water, wastewater, fire, wetland, tree protection and material choices.'],
    ['Financial models','Build transparent cost categories and challenge assumptions; do not submit personal financial data.'],
    ['Planning research','Investigate a real jurisdiction, official plan, zoning and approval path.'],
    ['Open-source development','Improve the static site, tests, JSON models and accessibility.'],
    ['Usability testing','Run the testing plan with representative participants and report what failed.']
  ];
  return shell({ title: 'Participate', description: 'Ways to contribute to Containers Hamlet without a membership form or personal disclosure.', prefix, current: 'participate', children: `
<nav class="breadcrumb" aria-label="Breadcrumb"><a href="${prefix}index.html">Containers Hamlet</a> / Participate</nav>
<p class="eyebrow">An invitation, not a sales funnel</p>
<h1>Help test the idea.</h1>
<p class="lede">Containers Hamlet is open-source and exploratory. You can contribute a question, a critique, a drawing, a test or a source. You do not need to apply, disclose your income or circumstances, or join anything.</p>
<div class="notice"><strong>No contact database.</strong> There is no membership application, mailing list, account or tracking form. Do not post personal circumstances publicly.</div>
<section aria-labelledby="paths-title"><h2 id="paths-title">Ways to contribute</h2><div class="hub-grid">${paths.map(([t,d]) => `<article><h3>${esc(t)}</h3><p>${esc(d)}</p></article>`).join('')}</div></section>
<section aria-labelledby="how-title"><h2 id="how-title">How to contribute without being a developer</h2>
<ol><li>Read the <a href="${prefix}community/">community introduction</a> and choose one question.</li><li>Open a GitHub issue with the question, evidence and what you would change.</li><li>For a design or document change, describe the tradeoff and the source. Do not upload third-party images you do not have rights to use.</li><li>For accessibility or usability, use the <a href="${prefix}community/usability/">testing plan</a> and report tasks, barriers and assistive technology used.</li></ol>
<p><a class="action" href="https://github.com/mgifford/Containers-Hamlet/issues">Open a GitHub issue</a> <a class="action secondary" href="${prefix}community/usability/">Usability plan</a></p>
</section>
<section aria-labelledby="privacy-title"><h2 id="privacy-title">Privacy and boundaries</h2><p>Do not include your address, health information, financial information, immigration status or other personal circumstances in a public issue. If a contribution needs private context, describe the issue without the personal detail. No contribution is a promise of housing, membership or investment.</p></section>
` });
}

export function usabilityPage() {
  const prefix = '../../';
  return shell({ title: 'Usability plan', description: 'A small repeatable usability study for prospective residents, with tasks, script and results template. No testing has been conducted yet.', prefix, current: 'community', children: `
<nav class="breadcrumb" aria-label="Breadcrumb"><a href="${prefix}index.html">Containers Hamlet</a> / <a href="../">Community</a> / Usability</nav>
<p class="eyebrow">Plan, not results</p>
<h1>A usability test a small team can actually run.</h1>
<p class="lede">This is a proposed study. No representative residents have completed it yet. Do not describe it as completed validation until real participants have taken part and the results are published.</p>
<div class="notice"><strong>No personal data collection.</strong> Use anonymous task codes. Do not record health, income or immigration status. Obtain consent for any recording and offer a non-recorded option.</div>
<section aria-labelledby="tasks-title"><h2 id="tasks-title">Tasks</h2><ol class="usability-tasks"><li>Find a home suitable for year-round living.</li><li>Determine what a resident would own and what the land trust would own.</li><li>Identify the shared operating costs and who pays them.</li><li>Find the accessibility limitations of the compact homes.</li><li>Understand whether short-term rentals are permitted.</li><li>Locate the water and wastewater assumptions.</li><li>Customize a container design and download the result.</li><li>Find a way to contribute without creating an account.</li></ol></section>
<section aria-labelledby="script-title"><h2 id="script-title">Script outline</h2><ol><li>Explain the fictional status and that this is not a sales process.</li><li>Ask for consent to observe; offer to stop at any time.</li><li>Read each task without pointing to the answer.</li><li>Ask the participant to think aloud, but do not lead.</li><li>Record completion, time, wrong turns, misunderstood words and accessibility barriers.</li><li>Debrief: what was believable, what was missing, what felt like sales pressure?</li></ol></section>
<section aria-labelledby="template-title"><h2 id="template-title">Results template</h2>
<div class="table-wrap" role="region" aria-label="Usability results template" tabindex="0"><table><caption>Copy this table into the project issue or report.</caption><thead><tr><th scope="col">Task</th><th scope="col">Completed?</th><th scope="col">Barrier / wrong turn</th><th scope="col">Assistive technology</th><th scope="col">Severity</th></tr></thead><tbody>${['1','2','3','4','5','6','7','8'].map((n) => `<tr><th scope="row">Task ${n}</th><td></td><td></td><td></td><td></td></tr>`).join('')}</tbody></table></div></section>
<section aria-labelledby="participants-title"><h2 id="participants-title">Participants</h2><p>Recruit a small mix of people: at least one keyboard-only or screen-reader user, one older person, one person who has lived rurally, and one person who has not. Do not ask them to represent a whole group. Record only what they consent to share.</p></section>
<p><a class="action" href="${prefix}participate/">How to contribute</a> <a class="action secondary" href="${prefix}community/">Community</a></p>
` });
}

export function licensingPage() {
  const prefix = '../';
  return shell({ title: 'Licensing', description: 'Current and intended licensing for Containers Hamlet, with a clear matrix and no automatic relicensing of existing contributions.', prefix, current: 'community', children: `
<nav class="breadcrumb" aria-label="Breadcrumb"><a href="${prefix}index.html">Containers Hamlet</a> / Licensing</nav>
<p class="eyebrow">Audit and matrix</p>
<h1>What is licensed, and what is changing?</h1>
<p class="lede">The repository currently mixes MIT, CC BY 4.0, AGPL-3.0-or-later and CC BY-SA 4.0. This page records the existing position and the intended policy for new original work. It does not relicense existing contributions.</p>
<div class="notice"><strong>No automatic relicensing.</strong> Changing a repository licence requires the rights-holders' permission and a review of third-party material. Existing files keep their current notices until that review is complete.</div>
<section aria-labelledby="matrix-title"><h2 id="matrix-title">Licensing matrix</h2>
<div class="table-wrap" role="region" aria-label="Licensing matrix" tabindex="0"><table><caption>Current and intended licensing.</caption><thead><tr><th scope="col">Material</th><th scope="col">Current</th><th scope="col">Intended for new original work</th><th scope="col">Action</th></tr></thead><tbody>
<tr><th scope="row">Core application code</th><td>MIT</td><td>AGPL-3.0-or-later</td><td>Do not relicense existing code without contributor review; apply AGPL to new application code where possible.</td></tr>
<tr><th scope="row">Design Lab code</th><td>AGPL-3.0-or-later</td><td>AGPL-3.0-or-later</td><td>Keep.</td></tr>
<tr><th scope="row">Documentation and new resident guides</th><td>CC BY 4.0 (core), CC BY-SA 4.0 (Design Lab)</td><td>CC BY-SA 4.0</td><td>New Phase 1.5 resident-facing text is CC BY-SA 4.0 with attribution.</td></tr>
<tr><th scope="row">Original architectural drawings, models, data</th><td>CC BY 4.0 (core), CC BY-SA 4.0 (Design Lab)</td><td>CC BY-SA 4.0</td><td>Do not relicense existing geometry without review; new original drawings CC BY-SA 4.0.</td></tr>
<tr><th scope="row">Third-party images, plans, product designs</th><td>Not bundled unless rights confirmed</td><td>Retain original notices; do not relicense</td><td>Keep references only; document provenance.</td></tr>
</tbody></table></div>
</section>
<section aria-labelledby="attribution-title"><h2 id="attribution-title">Attribution</h2><p>Original work: Containers Hamlet contributors. Design Lab code: AGPL-3.0-or-later. Design Lab concept data, diagrams and new resident guides: CC BY-SA 4.0. Core architectural models and text remain under their existing MIT/CC BY 4.0 notices until a rights review says otherwise.</p></section>
<section aria-labelledby="next-title"><h2 id="next-title">What must happen next</h2><ul><li>List every contributor and confirm whether relicensing is permitted.</li><li>Audit third-party references and bundled assets.</li><li>Add SPDX headers and a root licensing matrix.</li><li>Do not remove existing notices.</li></ul></section>
<p><a class="action" href="${prefix}participate/">Contribute</a> <a class="action secondary" href="${prefix}index.html">Home</a></p>
` });
}
