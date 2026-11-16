// Code: MIT. Page/diagram content: CC BY-SA 4.0.
const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function fireZonesSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1040 470" role="img" aria-labelledby="fire-t fire-d">
<title id="fire-t">Conceptual forest-home fire-resilience zones</title>
<desc id="fire-d">Original diagram of a steel-hulled home in a managed forest. A noncombustible 0 to 1.5 metre zone surrounds the building, a reduced-fuel 1.5 to 10 metre zone follows, and a managed 10 to 30 metre forest zone beyond. Ember exposure, roof and vent vulnerabilities, access, water and evacuation are labelled. Not a code or fire-engineering drawing.</desc>
<rect width="1040" height="470" fill="#faf8f2"/>
<text x="34" y="38" font-family="system-ui, sans-serif" font-size="24" font-weight="800" fill="#1d392c">Fire resilience is a site strategy, not just a steel wall</text>
<text x="34" y="60" font-family="system-ui, sans-serif" font-size="12" fill="#3f5a4c">Defensible space · ember-resistant detailing · access and water · a home that can be defended</text>
<rect x="40" y="92" width="960" height="330" rx="14" fill="#e8efe2"/>
<circle cx="390" cy="260" r="160" fill="#d7e3cd" stroke="#7c9679"/>
<circle cx="390" cy="260" r="105" fill="#c5d8b8" stroke="#6d8c6b"/>
<circle cx="390" cy="260" r="48" fill="#efe8d5" stroke="#a78d64"/>
<rect x="350" y="232" width="82" height="56" fill="#2f6b57" stroke="#17392e" stroke-width="2"/>
<path d="M350 232h82l-41-26z" fill="#245244" stroke="#17392e"/>
<text x="391" y="266" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#fff">steel hull</text>
<text x="391" y="218" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9" fill="#31573f">0–1.5 m noncombustible</text>
<text x="391" y="134" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#31573f">1.5–10 m reduced fuel</text>
<text x="391" y="92" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#31573f">10–30 m managed forest</text>
<path d="M520 245c50-28 88-28 132-10M520 275c50 28 88 28 132 10" fill="none" stroke="#9a4e3a" stroke-width="2" stroke-dasharray="5 3"/>
<text x="666" y="238" font-family="system-ui, sans-serif" font-size="10" fill="#9a4e3a">wind-blown embers</text>
<text x="666" y="252" font-family="system-ui, sans-serif" font-size="9" fill="#5e6a58">roof edges, vents, gaps, decks</text>
<rect x="670" y="285" width="286" height="100" rx="8" fill="#f7f5ed" stroke="#b9c4b3"/>
<text x="684" y="305" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#1d392c">The weak points are openings</text>
<text x="684" y="323" font-family="system-ui, sans-serif" font-size="9" fill="#3f5a4c">roof/eave junction · vents · windows · doors</text>
<text x="684" y="339" font-family="system-ui, sans-serif" font-size="9" fill="#3f5a4c">combustible deck/porch · storage under floor</text>
<text x="684" y="355" font-family="system-ui, sans-serif" font-size="9" fill="#3f5a4c">interior contents · exposed insulation</text>
<text x="684" y="371" font-family="system-ui, sans-serif" font-size="9" fill="#9a4e3a">Steel conducts heat; thin steel loses strength.</text>
<rect x="72" y="348" width="240" height="52" rx="8" fill="#f7f5ed" stroke="#b9c4b3"/>
<text x="86" y="367" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#1d392c">Access + water</text>
<text x="86" y="383" font-family="system-ui, sans-serif" font-size="9" fill="#3f5a4c">turnaround · bridge load · hydrant/draft · address</text>
<text x="34" y="450" font-family="system-ui, sans-serif" font-size="9" fill="#5e6a58">Concept only · not a code, WUI, fire-engineering or insurance assessment · Containers Hamlet Design Lab · CC BY-SA 4.0</text>
</svg>`;
}

export function firePage() {
  return `<!doctype html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Fire-resilience best practices for a forest container home: defensible space, ember-resistant detailing, access, water and the limits of a steel hull.">
<title>Fire resilience · Containers Hamlet Design Lab</title>
<link rel="stylesheet" href="../../../style.css">
<link rel="stylesheet" href="../style.css">
<link rel="stylesheet" href="../architecture.css">
<link rel="icon" href="../../../assets/favicon.svg" type="image/svg+xml">
</head>
<body class="lab-page">
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <a class="brand" href="../../../index.html">Containers Hamlet</a>
  <nav aria-label="Design Lab">
    <a href="../index.html">Design gallery</a>
    <a href="../editor/">Editor</a>
    <a href="../vegetation/">Vegetation</a>
    <a href="../ground/">Ground</a>
    <a href="../patterns/">Patterns</a>
    <a href="../fire/" aria-current="page">Fire</a>
    <a href="../two-storey/">Two-storey</a>
    <a href="../resilience/">Resilience</a>
    <a href="../water/">Water</a>
    <a href="../compare/">Compare</a>
    <a href="../../living/">Living Here</a>
    <a href="../../participate/">Participate</a>
    <a href="../../../index.html">Main site</a>
  </nav>
</header>
<main id="main" class="lab-main">
  <p class="eyebrow">Forest fire resilience</p>
  <h1>Steel helps. It is not a fire strategy.</h1>
  <p class="lede">A steel container is noncombustible, but a home burns through its openings, roof edges, vents, decks and contents. In a forest, the site, the ember detail and the ability of firefighters to reach water matter as much as the hull. This page sets out the questions and the limits; it is not a fire-resistance rating or a WUI approval.</p>
  <p class="notice"><strong>Concept only.</strong> No assembly, clearance, water supply or access route here is certified. Confirm the actual site with the local fire department, building official, conservation authority, insurer and a fire-protection engineer.</p>

  <section aria-labelledby="hamlet-fire-title">
    <h2 id="hamlet-fire-title">From one home to a defendable hamlet</h2>
    <p>Ontario's <a href="https://www.ontario.ca/page/firesmart">FireSmart guidance</a>, forest-fire danger ratings and outdoor-fire rules are necessary, but they are mostly property and compliance measures. A hamlet needs a <strong>community wildfire protection plan</strong> that links the homes to each other and to the fire service.</p>
    <ul>
      <li><strong>Access:</strong> a loop or two-way route, turnaround, bridge load limits, year-round clearance and address signs.</li>
      <li><strong>Water:</strong> a dedicated fire reserve, dry hydrant/draft point or cistern with a connection the fire service has tested.</li>
      <li><strong>Fuel:</strong> shaded fuel breaks, limbing, spacing, dead-material removal and a maintenance calendar across parcel boundaries.</li>
      <li><strong>People:</strong> named roles, a phone tree/radio, evacuation triggers, a meeting point, medication/pet plans and vulnerable-neighbour check-ins.</li>
      <li><strong>Recovery:</strong> insurance review, document copies, temporary shelter and a rebuilding plan.</li>
    </ul>
    <p>Owner-level FireSmart work is necessary but not sufficient. The <a href="../resilience/">community resilience brief</a> sets out the hamlet-scale layers; the <a href="../water/">water page</a> separates domestic storage from a tested fire reserve.</p>
  </section>

  <section aria-labelledby="steel-title">
    <h2 id="steel-title">What the steel hull does and does not do</h2>
    <div class="table-wrap" role="region" aria-label="Steel hull fire advantages and limits" tabindex="0"><table>
      <caption>A steel shell changes the fuel load; it does not remove fire exposure.</caption>
      <thead><tr><th scope="col">Helps</th><th scope="col">Still exposed</th></tr></thead>
      <tbody>
        <tr><td>The hull is noncombustible and does not add timber-frame fuel to the wall.</td><td>Thin steel conducts heat and can lose strength when hot; it is not automatically a fire-resistance rating.</td></tr>
        <tr><td>A simple metal roof and closed eaves can reduce ember entry.</td><td>Roof-to-wall junctions, vents, doors, windows, service penetrations and open soffits are entry points.</td></tr>
        <tr><td>A steel shell can limit concealed combustible cavities if the insulation and cladding are detailed correctly.</td><td>External insulation, rainscreen cavities, timber cladding, decks, porches and stored goods can burn.</td></tr>
        <tr><td>The shell may survive a passing fire better than a timber wall.</td><td>Smoke, interior furnishings, battery/PV systems and heat transfer can make the home uninhabitable.</td></tr>
      </tbody>
    </table></div>
  </section>

  <section aria-labelledby="zones-title">
    <h2 id="zones-title">Defensible space, without clearing the forest</h2>
    <figure class="system-figure">
      <img src="../systems/fire-zones.svg" width="1040" height="470" alt="Original diagram of a steel-hulled home in managed forest with a 0 to 1.5 metre noncombustible zone, a 1.5 to 10 metre reduced-fuel zone, a 10 to 30 metre managed forest zone, ember arrows and access/water notes." loading="eager" decoding="async">
      <figcaption>Original concept diagram. Zones are a discussion framework, not a prescription; local fire departments and insurers use different guidance and site conditions.</figcaption>
    </figure>
    <ul>
      <li><strong>0–1.5 m:</strong> noncombustible surface and wall base; no wood mulch, firewood, propane, vehicles or combustible storage. Keep the foundation/floor edge clear.</li>
      <li><strong>1.5–10 m:</strong> low-density, low-height planting; separate shrubs; prune lower limbs; maintain irrigation and remove dead material. This is a fuel-reduction zone, not a bare-earth moat.</li>
      <li><strong>10–30 m:</strong> managed forest with limbing, spacing, ladder-fuel removal and access for maintenance. Preserve mature trees and shade where the fire plan allows.</li>
      <li><strong>Access:</strong> a road and turnaround that fire apparatus can use, with bridge load limits and address signage. A narrow path is not fire access.</li>
      <li><strong>Water:</strong> a hydrant, draft point, cistern or stored water that the fire service can actually use; confirm with the department, not just the design team.</li>
    </ul>
  </section>

  <details class="deep-dive"><summary>Building measures worth specifying</summary>
<section aria-labelledby="building-title">
    <h2 id="building-title">Building measures worth specifying</h2>
    <div class="table-wrap" role="region" aria-label="Fire-resilience building measures" tabindex="0"><table>
      <caption>Measures to discuss with the fire-protection engineer and building official.</caption>
      <thead><tr><th scope="col">Measure</th><th scope="col">Why</th><th scope="col">Limit</th></tr></thead>
      <tbody>
        <tr><th scope="row">Class A roof assembly</th><td>Reduces roof-covering fire performance risk.</td><td>Class A is not a wildfire rating; edge, eave and vent details still matter.</td></tr>
        <tr><th scope="row">Closed, noncombustible eaves/soffits</th><td>Denies embers a sheltered entry into the roof cavity.</td><td>Ventilation must still work; do not seal a roof that needs venting without redesign.</td></tr>
        <tr><th scope="row">Ember-resistant vents</th><td>Blocks the most common ignition path.</td><td>Must be listed/tested for the application and maintained; not a screen tacked over an opening.</td></tr>
        <tr><th scope="row">Tempered or laminated glazing</th><td>Resists radiant heat and breakage better than annealed glass.</td><td>No glazing is fireproof; frame, seal and shutter details matter.</td></tr>
        <tr><th scope="row">Noncombustible deck/porch</th><td>Removes a large horizontal fuel surface and ember trap.</td><td>Structure, connections and drainage still need design; a steel pan is not automatically fire-rated.</td></tr>
        <tr><th scope="row">Exterior shutters/covers</th><td>Protects openings when the home is closed during an evacuation.</td><td>Must be deployable before evacuation and must not block egress from inside.</td></tr>
        <tr><th scope="row">No combustible storage under the floor</th><td>Removes a fire directly below the home.</td><td>Skirting can hide storage; design explicit, lockable, noncombustible storage elsewhere.</td></tr>
      </tbody>
    </table></div>
  </section>
</details>

  <details class="deep-dive"><summary>Codes, standards and what is actually in force</summary>
<section aria-labelledby="codes-title">
    <h2 id="codes-title">Codes, standards and what is actually in force</h2>
    <ul>
      <li><a href="https://cbhcc-cchcc.ca/en/2025-national-model-codes-now-available/">2025 National Model Codes</a> are available from the Canadian Board for Harmonized Construction Codes. Model codes are not automatically the law in Ontario; provincial/territorial adoption and amendments govern.</li>
      <li><a href="https://housing-infrastructure.canada.ca/climate-resilience-climatique/codes-standards-normes-guidances-eng.html">Housing, Infrastructure and Communities Canada — climate-resilient codes, standards and guidance</a> is a federal resource, not a site approval.</li>
      <li><a href="https://www.fmapprovals.com/resources/insights/modern-buildings-burn-differently-implementing-fire-resilience-for-a-changing-climate">FM Approvals — modern buildings burn differently</a> explains why insulation, cavities, roof assemblies and PV change fire behaviour. It is an industry/standards perspective, not a Canadian code.</li>
      <li><a href="https://rosagalvez.ca/en/initiatives/building-code/building-code-discussion-paper/">Senator Rosa Galvez — building code discussion paper</a> and <a href="https://neep.org/blog/energy-efficiency-life-safety-shifting-conversation-around-purpose-building-codes">NEEP — energy efficiency is life-safety</a> frame codes as more than minimum fire safety; they are policy commentary.</li>
      <li><a href="https://uwspace.uwaterloo.ca/items/3a288546-59d8-4b4b-af56-3177fd327824">University of Waterloo thesis</a>, <a href="https://climatedata.ca/buildings-module-overview/">ClimateData.ca buildings module</a> and <a href="https://www.canadianconsultingengineer.com/features/aligning-building-codes-with-sustainability/">Canadian Consulting Engineer</a> provide climate/design context; they are not a fire test of this house.</li>
      <li><a href="https://ibhs.org/wildfire/wildfire-demo-2019/">IBHS wildfire demonstration</a> illustrates ember and building-performance research; it is not a product certification for this design.</li>
    </ul>
    <p>The current model has no sprinkler, fire-resistance rating, WUI setback, hydrant or water-supply design. Those are open questions, not hidden assumptions.</p>
  </section>
</details>

  <details class="deep-dive"><summary>What the editor can record now</summary>
<section aria-labelledby="model-title">
    <h2 id="model-title">What the editor can record now</h2>
    <p>The <a href="../editor/">editor</a> now records a fire-resilience intent: roof class, closed eaves, ember-resistant vents, tempered/laminated glazing, noncombustible deck, exterior shutters, defensible-space distance and whether fire access/water is confirmed. It does <strong>not</strong> calculate fire resistance, radiant heat, ember exposure, sprinkler performance or insurance acceptability.</p>
    <p>Use the checklist as a brief for the fire department and insurer. Do not treat a checked box as a code approval.</p>
  </section>
</details>

  <p><a class="action" href="../editor/">Open the editor</a> <a class="action secondary" href="../ground/">Ground and access</a></p>
</main>
<footer class="site-footer"><p><a href="../../../index.html">Containers Hamlet</a> · <a href="../index.html">Design Lab</a> · <a href="../LICENSE.txt">AGPL-3.0-or-later</a> · <a href="../CONTENT-LICENSE.md">CC BY-SA 4.0 content</a></p></footer>
</body>
</html>`;
}
