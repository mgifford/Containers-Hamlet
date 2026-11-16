// Code: MIT. Generated page/diagram content: CC BY-SA 4.0.
const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function footbridgeSVG() {
  const W = 1040, H = 520;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="bridge-t bridge-d">
<title id="bridge-t">Conceptual eight-metre footbridge with helical pile abutments</title>
<desc id="bridge-d">Original schematic plan and elevation of a 1.2 metre wide, 8 metre clear-span timber footbridge. Two independently founded abutments sit outside the drainage channel; no fill is placed in the channel. Handrails, deck, helical piles and a root protection zone are labelled. This is a concept, not an engineered bridge or a permit drawing.</desc>
<rect width="${W}" height="${H}" fill="#faf8f2"/>
<text x="34" y="38" font-family="system-ui, sans-serif" font-size="24" font-weight="800" fill="#1d392c">Footbridge concept · 8 m clear span</text>
<text x="34" y="60" font-family="system-ui, sans-serif" font-size="12" fill="#3f5a4c">1.2 m wide · independently founded abutments · no fill in the channel · pedestrian only · engineering and permits required</text>
<!-- plan -->
<text x="34" y="100" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#1d392c">Plan</text>
<rect x="120" y="120" width="160" height="120" rx="10" fill="#dbe6d7" stroke="#78927c"/>
<path d="M120 160 C220 130 300 190 400 160 C500 130 600 190 700 160 C780 140 840 150 880 160" fill="none" stroke="#2d6b78" stroke-width="8" opacity="0.45"/>
<rect x="300" y="145" width="440" height="44" fill="#c3a276" stroke="#7b5b3a" stroke-width="2"/>
<line x1="300" y1="145" x2="300" y2="189" stroke="#5b4a35" stroke-width="8"/>
<line x1="740" y1="145" x2="740" y2="189" stroke="#5b4a35" stroke-width="8"/>
<text x="360" y="172" font-family="system-ui, sans-serif" font-size="12" fill="#1d392c">1.2 m deck · 8 m clear span</text>
<text x="312" y="136" font-family="system-ui, sans-serif" font-size="10" fill="#31573f">abutment</text>
<text x="700" y="136" font-family="system-ui, sans-serif" font-size="10" fill="#31573f">abutment</text>
<text x="150" y="250" font-family="system-ui, sans-serif" font-size="10" fill="#2d6b78">drainage / wetland — no fill</text>
<!-- elevation -->
<text x="34" y="310" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#1d392c">Elevation</text>
<line x1="100" y1="430" x2="940" y2="430" stroke="#6f7b63" stroke-width="2"/>
<path d="M100 430 C250 410 360 450 500 430 C650 410 800 450 940 430" fill="none" stroke="#2d6b78" stroke-width="6" opacity="0.4"/>
<rect x="230" y="330" width="580" height="18" fill="#c3a276" stroke="#7b5b3a" stroke-width="2"/>
<line x1="230" y1="330" x2="230" y2="430" stroke="#5b4a35" stroke-width="3"/>
<line x1="810" y1="330" x2="810" y2="430" stroke="#5b4a35" stroke-width="3"/>
<line x1="230" y1="300" x2="810" y2="300" stroke="#4f7d64" stroke-width="3"/>
<line x1="230" y1="300" x2="230" y2="330" stroke="#4f7d64" stroke-width="2"/><line x1="810" y1="300" x2="810" y2="330" stroke="#4f7d64" stroke-width="2"/>
<line x1="210" y1="348" x2="210" y2="470" stroke="#5d6f6a" stroke-width="7"/><line x1="250" y1="348" x2="250" y2="470" stroke="#5d6f6a" stroke-width="7"/>
<line x1="790" y1="348" x2="790" y2="470" stroke="#5d6f6a" stroke-width="7"/><line x1="830" y1="348" x2="830" y2="470" stroke="#5d6f6a" stroke-width="7"/>
<text x="300" y="286" font-family="system-ui, sans-serif" font-size="10" fill="#31573f">handrail / guard · 1.1 m concept</text>
<text x="270" y="484" font-family="system-ui, sans-serif" font-size="10" fill="#3f5a4c">helical pile abutments · independently founded · no fill</text>
<text x="34" y="510" font-family="system-ui, sans-serif" font-size="9" fill="#5e6a58">Concept only · not engineered · pedestrian loads, frost uplift, corrosion, flood/debris, guards, conservation-authority and building permits require review · Containers Hamlet Design Lab · CC BY-SA 4.0</text>
</svg>`;
}

export function groundPage(concepts) {
  const rows = concepts.map((c) => `<tr><th scope="row"><a href="../architecture/${esc(c.id)}/">${esc(c.name)}</a></th><td>${esc(c.foundation.system)}</td><td>${c.foundation.clearance_m} m</td><td>${c.foundation.no_compaction ? 'No fill / no compaction intent' : 'Unresolved'}</td><td>${c.foundation.independent_deck ? 'Independent' : 'Connected'}</td></tr>`).join('');
  return `<!doctype html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Ontario-appropriate alternatives to poured foundations for the Containers Hamlet: engineered helical piles, ground screws, concrete piers, timber posts and bedrock anchors, no-compaction construction and a conceptual footbridge.">
<title>Foundations, no-compaction and footbridge · Containers Hamlet Design Lab</title>
<link rel="stylesheet" href="../../../style.css">
<link rel="stylesheet" href="../style.css">
<link rel="stylesheet" href="../architecture.css">
</head>
<body class="lab-page">
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <a class="brand" href="../../../index.html">Containers Hamlet</a>
  <nav aria-label="Design Lab">
    <a href="../index.html">Design gallery</a>
    <a href="../editor/">Editor</a>
    <a href="../vegetation/">Vegetation</a>
    <a href="../ground/" aria-current="page">Ground</a>
    <a href="../patterns/">Patterns</a>
    <a href="../fire/">Fire</a>
    <a href="../two-storey/">Two-storey</a>
    <a href="../resilience/">Resilience</a>
    <a href="../water/">Water</a>
    <a href="../compare/">Compare</a>
    <a href="../../../index.html#design-lab">Design on the main site</a>
    <a href="../../../index.html">Main site</a>
  </nav>
</header>
<main id="main" class="lab-main">
  <p class="eyebrow">Ground and access</p>
  <h1>Foundations that sit lightly, and a small bridge</h1>
  <p class="lede">The houses are elevated on point foundations instead of a poured slab. The default is engineered helical piles with adjustable brackets and an independent deck. Ground screws, concrete piers, timber posts on pads and bedrock anchors are alternatives with different limits. The design intent is no fill, no slab and no compaction; that still needs a geotechnical investigation, an arborist-reviewed construction plan and permits.</p>
  <p class="notice"><strong>Concept only.</strong> No foundation or bridge here is engineered, code-compliant or permit-ready. Supplier pages describe products and claims; they are not independent test reports or a review of this site.</p>

  <section aria-labelledby="options-title">
    <h2 id="options-title">Ontario-appropriate options</h2>
    <div class="table-wrap"><table>
      <caption>Alternatives to a poured foundation. Suitability depends on soil, bedrock, groundwater, frost, slope, access and the structure above.</caption>
      <thead><tr><th scope="col">Option</th><th scope="col">Best use</th><th scope="col">Ontario considerations</th><th scope="col">Evidence status</th></tr></thead>
      <tbody>
        <tr><th scope="row">Engineered helical piles</th><td>Primary house, deck, boardwalk and bridge abutments</td><td>Geotechnical review, torque/installation records, frost uplift, corrosion, lateral capacity, slope stability, building permit; can be installed with small equipment and removed.</td><td>Established foundation practice; supplier claims about environmental benefits need independent verification. <a href="https://www.technometalpost.com/en-CA/environmental-benefits-of-using-helical-piles/">Techno Metal Post</a>.</td></tr>
        <tr><th scope="row">Ground screws</th><td>Light decks, boardwalks, small bridge abutments, signs</td><td>Smaller equipment and disturbance; lower capacity. A house needs an engineered primary foundation, not a generic ground-screw kit.</td><td>Supplier/product claims; engineering required. Treat as a light-structure option.</td></tr>
        <tr><th scope="row">Concrete piers / sonotubes</th><td>Point foundations where concrete is preferred</td><td>Still concrete, excavation and frost-depth design; smaller footprint than a slab but not concrete-free. Confirm bearing, uplift and reinforcement.</td><td>Conventional practice; no claim of low carbon.</td></tr>
        <tr><th scope="row">Timber posts on pads</th><td>Decks, porches, boardwalk, temporary structures</td><td>Rot, uplift, bearing and frost heave; not a primary house foundation in Ontario without engineering.</td><td>Conventional light-frame detail; site-specific.</td></tr>
        <tr><th scope="row">Bedrock anchors / pins</th><td>Shallow, sound bedrock</td><td>Requires geotechnical confirmation of bedrock continuity and anchor capacity; corrosion and waterproofing details.</td><td>Engineering-led; not a generic DIY option.</td></tr>
      </tbody>
    </table></div>
    <p class="small">A rubble trench, tyre foundation or “no foundation” approach can be appropriate in some natural-building contexts, but it is not presented here as an Ontario house foundation without geotechnical and code review. See the <a href="https://www.naturalbuildingcollective.com/from-the-ground-up-approaches-to-building-a-foundation-for-your-natural-building/">Natural Building Collective overview</a> as experience/opinion, not an Ontario code approval.</p>
  </section>

  <section aria-labelledby="light-title">
    <h2 id="light-title">What “not compacted” means</h2>
    <ul>
      <li><strong>Point loads, not a slab.</strong> Piles or piers carry the house at discrete locations; the ground between them stays undisturbed.</li>
      <li><strong>No fill and no grade change.</strong> Do not raise the building pad with imported fill or cut into the slope without an engineered design.</li>
      <li><strong>Root protection.</strong> Fence the root-protection zone, use matting for access, avoid parking and stockpiles under trees, and have an arborist review the sequence.</li>
      <li><strong>Water.</strong> Keep runoff away from piles and excavations; silt fencing and erosion control are required near slopes and wetlands.</li>
      <li><strong>Elevation.</strong> A 0.6 m default clearance gives ventilation, inspection and snow/water separation; confirm with the foundation and envelope designers.</li>
      <li><strong>Independent decks and porches.</strong> Separate structures can move with frost and be repaired without loading the container frame.</li>
    </ul>
    <p>These are design intentions, not a prescription. Ontario building permits, the Ontario Building Code, conservation-authority regulations, tree bylaws, species-at-risk rules and local site-plan requirements may all apply.</p>
  </section>

  <section aria-labelledby="bridge-title">
    <h2 id="bridge-title">A small footbridge to the remote part of the land</h2>
    <p>A pedestrian bridge should <strong>span</strong> the drainage or wet ground rather than fill it. The concept is a 1.2 m wide, 8 m clear-span timber footbridge on two independently founded abutments, with helical piles or engineered ground screws outside the channel. It is not a road bridge and is not designed for vehicles.</p>
    <figure class="system-figure">
      <img src="../systems/footbridge.svg" width="1040" height="520" alt="Original schematic plan and elevation of a 1.2 metre wide, 8 metre clear-span timber footbridge with two independently founded helical pile abutments, handrails and no fill in the drainage channel." loading="eager" decoding="async">
      <figcaption>Original concept diagram, not an engineered bridge. The clear span avoids fill and compaction in the drainage corridor; the abutments still need geotechnical, frost-uplift, corrosion, flood/debris, guard and structural design.</figcaption>
    </figure>
    <ul>
      <li><strong>Span the channel.</strong> Keep abutments outside the ordinary high-water line and the root-protection zones where possible.</li>
      <li><strong>Independent abutments.</strong> Helical piles or engineered ground screws; no concrete fill in the watercourse.</li>
      <li><strong>Pedestrian design.</strong> Confirm deck width, guards, slip resistance, lighting if needed, and accessibility with the actual users.</li>
      <li><strong>Flood and debris.</strong> Check scour, debris loading, freeboard and safe shutdown/removal.</li>
      <li><strong>Permits.</strong> A conservation authority, Fisheries Act review, species-at-risk check and building permit may be required. Do not build in or near water without advice.</li>
      <li><strong>Material.</strong> Durable, repairable timber or steel deck with galvanized or stainless connections; confirm fire, rot and maintenance.</li>
    </ul>
  </section>

  <section aria-labelledby="examples-title">
    <h2 id="examples-title">Foundation settings in the concepts</h2>
    <div class="table-wrap"><table>
      <caption>Current Design Lab foundation intent. All concepts use an elevated, no-compaction intent; the editor can test other systems.</caption>
      <thead><tr><th scope="col">Design</th><th scope="col">System</th><th scope="col">Clearance</th><th scope="col">Ground</th><th scope="col">Deck</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
  </section>

  <section aria-labelledby="sources-title">
    <h2 id="sources-title">Sources and evidence</h2>
    <ul class="source-list">
      <li><a href="https://www.wcl.org.uk/pylon-projects-what-do-they-mean-for-nature.asp">Wildlife and Countryside Link — pylon projects and nature</a> (UK policy article; useful on routing and smaller ground footprints, not evidence for a house foundation).</li>
      <li><a href="https://www.technometalpost.com/en-CA/environmental-benefits-of-using-helical-piles/">Techno Metal Post — environmental benefits of helical piles</a> (supplier claims: reduced concrete, minimal disturbance, reuse; not independently verified).</li>
      <li><a href="https://www.naturalbuildingcollective.com/from-the-ground-up-approaches-to-building-a-foundation-for-your-natural-building/">Natural Building Collective — foundation approaches</a> (practitioner experience/opinion; hard, soft, mixed and clay ground; not an Ontario code approval).</li>
      <li><a href="https://solidearthtech.com/helical-pier-installers/environmental-boardwalks-and-bridges/">Solid Earth Technologies — boardwalk and bridge helical piers</a> (supplier; wetland boardwalk/bridge examples and claims).</li>
      <li><a href="https://www.houzz.co.nz/magazine/design-a-house-that-sits-lightly-on-the-earth-stsetivw-vs~45438885">Houzz — a house that sits lightly on the earth</a> (design article/inspiration, not engineering).</li>
      <li><a href="https://www.ontario.ca/laws/regulation/120332">Ontario Building Code, O. Reg. 332/12</a> (legal framework; foundation design still needs professional review).</li>
      <li><a href="https://conservationontario.ca/">Conservation Ontario</a> (conservation-authority permitting; check the local authority).</li>
    </ul>
    <p class="small">No supplier diagram, photograph or product design is copied. The foundation and bridge diagrams on this page are original schematics. Supplier claims are not independent test results. A geotechnical engineer, structural engineer, building official, conservation authority and arborist should review the actual site before construction.</p>
  </section>

  <p><a class="action" href="../index.html">Back to the design gallery</a> <a class="action secondary" href="../editor/">Open the editor</a></p>
</main>
<footer class="site-footer"><p><a href="../../../index.html">Containers Hamlet</a> · <a href="../index.html">Design Lab</a> · <a href="../LICENSE.txt">AGPL-3.0-or-later</a> · <a href="../CONTENT-LICENSE.md">CC BY-SA 4.0 content</a></p></footer>
</body>
</html>`;
}
