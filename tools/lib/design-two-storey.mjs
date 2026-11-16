// Code: MIT. Page/diagram content: CC BY-SA 4.0.
const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function twoStoreySVG() {
  const panel = (x, label, draw) => `<g transform="translate(${x},0)"><rect x="0" y="54" width="300" height="300" rx="10" fill="#f7f5ed" stroke="#b9c4b3"/><text x="14" y="38" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#1d392c">${esc(label)}</text>${draw}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 390" role="img" aria-labelledby="storey-t storey-d">
<title id="storey-t">Three conceptual two-storey container options</title>
<desc id="storey-d">Original schematic sections: a stacked pair with an external stair, an offset stack with a set-back upper container, and a hillside two-level home with grade entry on the uphill side. Each shows structure, stair/egress and foundation questions. These are not engineered buildings.</desc>
<rect width="1000" height="390" fill="#faf8f2"/>
${panel(10, 'Stacked pair + external stair', '<rect x="74" y="160" width="150" height="72" fill="#8a6a4a" stroke="#274c3b" stroke-width="2"/><rect x="74" y="88" width="150" height="72" fill="#9a7a58" stroke="#274c3b" stroke-width="2"/><path d="M224 160h18v72h-18M224 88h18v72h-18" fill="none" stroke="#5d6f6a" stroke-width="4"/><path d="M242 160h30v84h-30M272 244l-22 18M250 262l-22 18" fill="none" stroke="#9a4e3a" stroke-width="3"/><text x="74" y="314" font-size="8" fill="#3f5a4c">vertical load path · two exits · fire separation</text>')}
${panel(340, 'Offset stack / cantilever', '<rect x="392" y="174" width="160" height="62" fill="#8a6a4a" stroke="#274c3b" stroke-width="2"/><rect x="430" y="96" width="130" height="64" fill="#9a7a58" stroke="#274c3b" stroke-width="2"/><path d="M430 160v-8M560 160v-8" stroke="#9a4e3a" stroke-width="4"/><path d="M552 174h42v50" fill="none" stroke="#5d6f6a" stroke-width="4"/><path d="M552 224h42" stroke="#5d6f6a" stroke-width="4"/><text x="392" y="314" font-size="8" fill="#3f5a4c">overturning · back-span · protected stair</text>')}
${panel(670, 'Hillside two-level', '<path d="M712 230l70-72 92 72" fill="#d7e3cd" stroke="#6d8c6b"/><rect x="746" y="186" width="128" height="58" fill="#8a6a4a" stroke="#274c3b" stroke-width="2"/><rect x="776" y="228" width="128" height="58" fill="#9a7a58" stroke="#274c3b" stroke-width="2"/><path d="M746 186h128M776 228h128" stroke="#17392e" stroke-width="1.5"/><path d="M746 244h30v-58M806 244v-58" stroke="#5d6f6a" stroke-width="3"/><text x="712" y="314" font-size="8" fill="#3f5a4c">grade entry · retaining · downhill egress</text>')}
<text x="34" y="380" font-family="system-ui, sans-serif" font-size="9" fill="#5e6a58">Concept only · not engineered · not a Look inside model · Containers Hamlet Design Lab · CC BY-SA 4.0</text>
</svg>`;
}

export function twoStoreyPage() {
  return `<!doctype html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Three conceptual two-storey container options with structural, fire, egress, foundation and hillside questions for Containers Hamlet.">
<title>Two-storey containers · Containers Hamlet Design Lab</title>
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
    <a href="../fire/">Fire</a>
    <a href="../two-storey/" aria-current="page">Two-storey</a>
    <a href="../compare/">Compare</a>
    <a href="../../../index.html">Main site</a>
  </nav>
</header>
<main id="main" class="lab-main">
  <p class="eyebrow">Two-storey containers</p>
  <h1>Three ways to stack. One structural question.</h1>
  <p class="lede">A two-storey container home is not a second box placed on the first. It is a vertical load path, a fire-separated egress strategy, a foundation with overturning, and a construction sequence. These three options are studies for an engineer and building official — not buildable models yet.</p>
  <p class="notice"><strong>Not a Look inside model.</strong> The current Design Lab geometry is horizontal. Adding a second storey to the explorer without the structure, fire separation, stairs, guards and egress would be false precision. This page shows what must be resolved first.</p>

  <section aria-labelledby="options-title">
    <h2 id="options-title">The three options</h2>
    <figure class="system-figure">
      <img src="../systems/two-storey-options.svg" width="1000" height="390" alt="Original schematic sections of a stacked pair with an external stair, an offset stack with a set-back upper container, and a hillside two-level home with grade entry." loading="eager" decoding="async">
      <figcaption>Original concept sections. Structure, fire separation, stair protection, foundation and egress are not designed.</figcaption>
    </figure>
    <div class="table-wrap" role="region" aria-label="Two-storey container options" tabindex="0"><table>
      <caption>Options to take to a structural engineer and building official.</caption>
      <thead><tr><th scope="col">Option</th><th scope="col">What it buys</th><th scope="col">What must be resolved</th></tr></thead>
      <tbody>
        <tr><th scope="row">Stacked pair + external stair</th><td>A clear two-storey house on a small footprint; an external stair can keep the upper floor independent.</td><td>Vertical load path through corner castings, lateral bracing, external stair weather/egress, fire separation, guards, two exits.</td></tr>
        <tr><th scope="row">Offset stack / cantilever</th><td>A sheltered lower entry or deck, a smaller upper floor and a more interesting section.</td><td>Back-span and overturning, connection design, foundation uplift, upper-floor egress, snow drift and wind.</td></tr>
        <tr><th scope="row">Hillside two-level</th><td>Grade entry on the uphill side; the lower level walks out downslope; can shorten the accessible route.</td><td>Retaining, drainage, slope stability, foundation, fire separation, internal stair, downhill egress and tree/rock protection.</td></tr>
      </tbody>
    </table></div>
  </section>

  <section aria-labelledby="structure-title">
    <h2 id="structure-title">Structure and foundation</h2>
    <ul>
      <li><strong>Load path:</strong> each upper container needs a continuous path through its corner castings, a steel transfer frame or a designed bearing wall to the foundation.</li>
      <li><strong>Lateral stability:</strong> stacked containers are tall, light and stiff; bracing, diaphragm action and connection slip need engineering.</li>
      <li><strong>Foundation:</strong> overturning, uplift, frost and point loads increase. A pile layout for a single container is not automatically adequate for two.</li>
      <li><strong>Wind and seismic:</strong> the upper storey has greater exposure; cladding, solar, guards and shutters add load.</li>
      <li><strong>Lift and sequence:</strong> crane reach, rigging, temporary stability and connection access before the second lift.</li>
    </ul>
  </section>

  <section aria-labelledby="fire-title">
    <h2 id="fire-title">Fire separation and egress</h2>
    <ul>
      <li><strong>Two remote exits:</strong> an upper floor cannot rely on one external stair. Egress windows, a protected stair and a second route need review.</li>
      <li><strong>Fire separation:</strong> floor/ceiling assembly, penetrations, stair enclosure and exterior spread between levels.</li>
      <li><strong>Smoke and CO:</strong> interconnected alarms, a CO strategy for battery/PV/garage risks, and a clear evacuation plan.</li>
      <li><strong>Guards and stairs:</strong> width, rise/run, headroom, landings, handrails and weather protection.</li>
      <li><strong>Fire department:</strong> access, water, address signage and the ability to reach both levels.</li>
    </ul>
    <p class="small">See the <a href="../fire/">forest fire-resilience guide</a>. That page is also a design brief, not a rating.</p>
  </section>

  <section aria-labelledby="envelope-title">
    <h2 id="envelope-title">Envelope, services and comfort</h2>
    <ul>
      <li><strong>Thermal bridging:</strong> the steel frame and floor cassette are thermal bridges; continuous insulation and a thermal break need detail.</li>
      <li><strong>Air/vapour:</strong> the floor/ceiling junction is a condensation risk; do not rely on the steel as the air barrier.</li>
      <li><strong>Services:</strong> plumbing, drainage, ventilation and electrical risers need a planned vertical chase.</li>
      <li><strong>Acoustics:</strong> impact noise and flanking between levels.</li>
      <li><strong>Solar:</strong> the upper roof may be the only good array location; structure, wind uplift and fire access still apply.</li>
    </ul>
  </section>

  <section aria-labelledby="model-title">
    <h2 id="model-title">What would change in the model</h2>
    <p>To make a real Look inside two-storey model, the data and renderer need:</p>
    <ul>
      <li>a vertical <code>level</code> or <code>base_elevation_m</code> per module;</li>
      <li>a structural connection/transfer model and foundation uplift checks;</li>
      <li>stairs, landings, guards and two exit paths;</li>
      <li>a fire-separated floor/ceiling assembly and penetration model;</li>
      <li>level-aware openings, rooms, zones, solar, porches and cutaways.</li>
    </ul>
    <p>None of that is in the current horizontal model. The next step is an engineering brief, not a visual-only stack.</p>
  </section>

  <section aria-labelledby="decision-title">
    <h2 id="decision-title">My recommendation</h2>
    <p>Test the <strong>hillside two-level</strong> option first if the site has a real grade change: it can give a grade entry and a walk-out lower level while keeping the footprint small. Test the <strong>stacked pair</strong> only if the foundation, crane access and a second egress route are credible. The <strong>offset stack</strong> is the most structurally demanding and should follow, not lead.</p>
    <p>Before any of them enters Look inside, ask a structural engineer and building official for a written opinion on the load path, fire separation, stair/egress strategy, foundation and height/zoning.</p>
  </section>

  <p><a class="action" href="../patterns/">Container patterns</a> <a class="action secondary" href="../fire/">Fire resilience</a></p>
</main>
<footer class="site-footer"><p><a href="../../../index.html">Containers Hamlet</a> · <a href="../index.html">Design Lab</a> · <a href="../LICENSE.txt">AGPL-3.0-or-later</a> · <a href="../CONTENT-LICENSE.md">CC BY-SA 4.0 content</a></p></footer>
</body>
</html>`;
}
