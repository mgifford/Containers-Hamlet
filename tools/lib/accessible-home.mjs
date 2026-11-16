// Cedar accessible layout study. Code: MIT. Diagrams/text: CC BY-SA 4.0.
const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function accessiblePlanSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1040 520" role="img" aria-labelledby="acc-t acc-d">
<title id="acc-t">Two accessible Cedar layout options</title>
<desc id="acc-d">Original concept plans. Left: one 40-foot container with a full-width bathroom, open living and kitchen, and a single bedroom with a 1.5 metre transfer side. Right: two 40-foot containers side by side, giving a double bedroom, accessible bathroom, wider living and a work nook. Both show 0.9 metre door openings, step-free porch routes and a 1.5 metre turning circle. These are layout studies, not certified accessible or construction drawings.</desc>
<rect width="1040" height="520" fill="#faf8f2"/>
<g font-family="system-ui, sans-serif">
<text x="30" y="32" font-size="18" font-weight="800" fill="#1d392c">Option A · one 40-ft module</text>
<text x="30" y="50" font-size="11" fill="#9a4e3a">One-person accessible layout · single bed · 1.5 m turning</text>
<rect x="30" y="70" width="460" height="108" fill="#f7f5ed" stroke="#274c3b" stroke-width="3"/>
<path d="M30 178h460" stroke="#8aa184"/>
<path d="M120 70v108M235 70v108M365 70v108" stroke="#5d6f6a" stroke-width="2"/>
<text x="42" y="120" font-size="10" font-weight="700" fill="#1d392c">entry / living / kitchen</text>
<text x="135" y="120" font-size="10" font-weight="700" fill="#1d392c">bath</text>
<text x="250" y="120" font-size="10" font-weight="700" fill="#1d392c">single bedroom</text>
<text x="380" y="120" font-size="10" fill="#31573f">storage</text>
<circle cx="88" cy="145" r="30" fill="none" stroke="#3f5f8a" stroke-width="1.2" stroke-dasharray="3 3"/>
<text x="88" y="195" text-anchor="middle" font-size="8" fill="#3f5f8a">1.5 m</text>
<text x="42" y="210" font-size="9" fill="#31573f">0.9 m door · step-free porch · lowered work surface</text>
<text x="30" y="235" font-size="9" fill="#9a4e3a">A double bed with 1.5 m transfer space does not fit across 2.35 m clear width.</text>

<text x="550" y="32" font-size="18" font-weight="800" fill="#1d392c">Option B · two 40-ft modules</text>
<text x="550" y="50" font-size="11" fill="#9a4e3a">One-bedroom accessible layout · 5 m combined width</text>
<rect x="550" y="70" width="460" height="218" fill="#f7f5ed" stroke="#274c3b" stroke-width="3"/>
<path d="M550 178h460M550 260h460" stroke="#8aa184"/>
<path d="M675 70v108M800 70v108M920 70v108" stroke="#5d6f6a" stroke-width="2"/>
<path d="M550 120h460" stroke="#b9c4b3" stroke-width="1"/>
<text x="562" y="100" font-size="10" font-weight="700" fill="#1d392c">living / dining</text>
<text x="810" y="100" font-size="10" font-weight="700" fill="#1d392c">kitchen</text>
<text x="562" y="150" font-size="9" fill="#31573f">wider circulation + work nook</text>
<text x="680" y="150" font-size="10" font-weight="700" fill="#1d392c">accessible bath</text>
<text x="810" y="150" font-size="10" font-weight="700" fill="#1d392c">bedroom</text>
<text x="810" y="166" font-size="9" fill="#31573f">double bed + transfer</text>
<circle cx="620" cy="220" r="34" fill="none" stroke="#3f5f8a" stroke-width="1.2" stroke-dasharray="3 3"/>
<text x="620" y="224" text-anchor="middle" font-size="9" fill="#3f5f8a">1.5 m</text>
<text x="562" y="245" font-size="9" fill="#31573f">0.9 m doors · roll-in shower · step-free porch · clear turning</text>
<text x="550" y="275" font-size="9" fill="#9a4e3a">Requires a structural opening/transfer frame between the two shells.</text>

<text x="30" y="330" font-size="12" font-weight="800" fill="#1d392c">What both options keep</text>
<text x="30" y="350" font-size="10" fill="#31573f">Step-free approach · 1.5 m turning in kitchen/living · 0.9 m door leaves · reachable storage · no threshold at the porch</text>
<text x="30" y="368" font-size="10" fill="#31573f">A firm, drained, snow-cleared route to the parking/drop-off · accessible emergency egress · a place to wait for help</text>
<text x="30" y="395" font-size="12" font-weight="800" fill="#1d392c">What is not resolved by a drawing</text>
<text x="30" y="415" font-size="10" fill="#9a4e3a">Structural opening and reinforcement · fire separation/egress · foundation and drainage · door hardware/operable windows ·</text>
<text x="30" y="433" font-size="10" fill="#9a4e3a">kitchen/bath fixture clearances · winter maintenance · personal care · CSA B651/code review · consultant sign-off</text>
<text x="30" y="470" font-size="9" fill="#5e6a58">Concept layout study · not certified accessible · not construction drawings · Containers Hamlet · CC BY-SA 4.0</text>
</g></svg>`;
}

export function accessibleHomePage() {
  return `<!doctype html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Cedar Accessible: two container-home layout options with real turning-space, bathroom, door and transfer-space tradeoffs. A study, not an accessibility certification.">
<title>Cedar Accessible · Containers Hamlet</title>
<link rel="stylesheet" href="../../style.css">
<link rel="stylesheet" href="../homes.css">
<link rel="icon" href="../../assets/favicon.svg" type="image/svg+xml">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <a class="brand" href="../../index.html">Containers Hamlet</a>
  <nav aria-label="Main">
    <a href="../../community/">Community</a><a href="../../hamlet/">Map</a><a href="../../homes/">Homes</a><a href="../../design-lab/">Design Lab</a><a href="../../living/">Living Here</a><a href="../../participate/">Participate</a>
  </nav>
</header>
<main id="main" class="home-page" tabindex="-1">
  <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Containers Hamlet</a> / <a href="../">Homes</a> / Cedar Accessible</nav>
  <p class="eyebrow">Layout study · not a seventh home</p>
  <h1>Cedar Accessible: two honest options</h1>
  <p class="lede">The current compact homes do not provide accessible bathrooms or a 1.5 m turning circle. This study tests what a redesigned Cedar could do. The single-container version can work for one person with a single bed; a double bed with proper transfer space needs the two-container version.</p>
  <p class="notice"><strong>Not certified accessible.</strong> These are concept plans, not construction drawings or a code/CSA B651 assessment. Structural, fire, egress, fixture, winter-path and personal-care questions remain. Confirm with an accessibility consultant, engineer and building official.</p>
  <section aria-labelledby="options-title"><h2 id="options-title">The two options</h2><ul><li><strong>Option A · one 40-ft module:</strong> one-person layout with a single bed and 1.5 m transfer side.</li><li><strong>Option B · two 40-ft modules:</strong> one-bedroom layout with a double bed and proper transfer space.</li></ul></section>
  <figure class="system-figure"><img src="accessibility-plan.svg" width="1040" height="520" alt="Two concept plans: a one-container accessible layout with a single bedroom and a two-container layout with a double bedroom and accessible bathroom." loading="eager" decoding="async"><figcaption>Original layout study. Not to construction scale; verify every dimension.</figcaption></figure>

  <div class="table-wrap" role="region" aria-label="Accessible layout comparison" tabindex="0"><table><caption>What each option actually provides.</caption><thead><tr><th scope="col">Requirement</th><th scope="col">One 40-ft module</th><th scope="col">Two 40-ft modules</th></tr></thead><tbody>
    <tr><th scope="row">Step-free approach</th><td>Graded trail/porch; firm, drained, snow-cleared route</td><td>Same, with a wider arrival and more turning space</td></tr>
    <tr><th scope="row">1.5 m turning</th><td>Kitchen/living and bathroom; not the single-bedroom transfer side</td><td>Kitchen/living, bathroom and bedroom</td></tr>
    <tr><th scope="row">Bed</th><td>Single bed with a 1.5 m transfer side</td><td>Double bed with transfer space</td></tr>
    <tr><th scope="row">Bathroom</th><td>Full-width roll-in shower, toilet, vanity; exact clearances need testing</td><td>Larger bathroom with a more credible 1.5 m circle</td></tr>
    <tr><th scope="row">Doors</th><td>0.9 m leaves; threshold detail unresolved</td><td>0.9 m leaves; wider internal route possible</td></tr>
    <tr><th scope="row">Storage</th><td>Reachable storage only; no ladder storage</td><td>More reachable storage and a work/guest nook</td></tr>
    <tr><th scope="row">Footprint</th><td>One module, ~36 m² footprint</td><td>Two modules, ~66 m² footprint plus porch</td></tr>
    <tr><th scope="row">Main risk</th><td>A single bed may not suit a couple or a carer staying over</td><td>Structural opening between shells, fire separation and cost</td></tr>
  </tbody></table></div>

  <section id="what-changed" aria-labelledby="changed-title"><h2 id="changed-title">What changed from the current Cedar</h2>
    <ul><li>Bathroom moved to a full-width 2.3 m bay with a roll-in shower and a credible 1.5 m circle.</li><li>Doors widened to a 0.9 m target leaf; thresholds and hardware still need design.</li><li>Kitchen work surface lowered with knee space; storage kept in the 0.4–1.2 m reach band.</li><li>Step-free porch and a firm, drained trail; no long timber ramp.</li><li>Single-level sleeping and living; no ladder or step to the bedroom.</li><li>A clear place to wait for help and an accessible emergency exit.</li></ul>
    <p class="small">The current Cedar page remains the base 40-foot home. This page does not replace it or place a seventh building on the hamlet map.</p>
  </section>

  <section id="unresolved" aria-labelledby="unresolved-title"><h2 id="unresolved-title">What still needs professional work</h2>
    <ul><li>Structural opening, transfer frame and reinforcement between two containers.</li><li>Fire separation, protected egress and emergency evacuation from both options.</li><li>Foundation, drainage, frost and a firm winter route.</li><li>Fixture-by-fixture clearances, door swings, operable windows and controls.</li><li>Personal care, overnight support and aging in place — layout alone does not provide care.</li><li>CSA B651, Ontario Building Code and local accessibility review.</li></ul>
    <p>Read the <a href="../../living/#accessibility">practical accessibility notes</a> and the <a href="../../homes/Cedar-1-simple/">base Cedar page</a>.</p>
  </section>
  <p><a class="action" href="../../living/#accessibility">Accessibility in the community</a> <a class="action secondary" href="../../homes/">All homes</a></p>
</main>
<footer class="site-footer"><p><a href="../../index.html">Containers Hamlet</a> · <a href="../../homes/">Homes</a> · <a href="../../living/">Living Here</a> · CC BY-SA 4.0 content · MIT software</p></footer>
</body>
</html>`;
}
