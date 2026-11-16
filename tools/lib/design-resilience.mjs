// Code: MIT. Content: CC BY-SA 4.0.
const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function nav(current) {
  const links = [['../index.html','Design gallery'],['../editor/','Editor'],['../vegetation/','Vegetation'],['../ground/','Ground'],['../patterns/','Patterns'],['../fire/','Fire'],['../two-storey/','Two-storey'],['../resilience/','Resilience'],['../water/','Water'],['../compare/','Compare']];
  return `<header class="site-header"><a class="brand" href="../../../index.html">Containers Hamlet</a><nav aria-label="Design Lab">${links.map(([h,l]) => `<a href="${h}"${l === current ? ' aria-current="page"' : ''}>${l}</a>`).join('')}<a href="../../../index.html">Main site</a></nav></header>`;
}
export function resiliencePage() {
  return `<!doctype html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Hamlet-scale climate resilience: fire response beyond one house, heat, flooding, drought, power, water and social capacity at Containers Hamlet.">
<title>Community resilience · Containers Hamlet Design Lab</title>
<link rel="stylesheet" href="../../../style.css">
<link rel="stylesheet" href="../style.css">
<link rel="stylesheet" href="../architecture.css">
<link rel="icon" href="../../../assets/favicon.svg" type="image/svg+xml">
</head>
<body class="lab-page">
<a class="skip" href="#main">Skip to content</a>
${nav('Resilience')}
<main id="main" class="lab-main">
  <p class="eyebrow">Small community, real hazards</p>
  <h1>Resilience is a hamlet-scale system.</h1>
  <p class="lede">Six efficient homes do not make a resilient community by themselves. Resilience is the shared water, the road that firefighters can use, the lodge that can become a refuge, the neighbour who checks on someone during a heat event, and the maintenance fund that keeps all of it working.</p>
  <p class="notice"><strong>Not a emergency plan or engineering approval.</strong> This page is a design brief. Confirm every measure with the local fire department, conservation authority, health unit, building official, insurer and a qualified engineer.</p>

  <section aria-labelledby="fire-scale-title">
    <h2 id="fire-scale-title">Forest fire: beyond the Ontario guidance</h2>
    <p>Ontario publishes forest-fire danger, restrictions, FireSmart guidance and outdoor-fire rules. Those are necessary, but they are mostly about <em>property</em> and <em>compliance</em>. A hamlet needs a <strong>community wildfire protection plan</strong> that connects the homes to each other and to the fire service.</p>
    <div class="table-wrap" role="region" aria-label="Hamlet fire protection layers" tabindex="0"><table>
      <caption>What changes when the unit of design is the hamlet, not one house.</caption>
      <thead><tr><th scope="col">Layer</th><th scope="col">Hamlet-scale action</th><th scope="col">Why it matters</th></tr></thead>
      <tbody>
        <tr><th scope="row">Access</th><td>A loop or two-way route, turnaround, bridge load limits, year-round clearance and address signs.</td><td>A fire truck that cannot reach or turn around cannot defend the homes.</td></tr>
        <tr><th scope="row">Water</th><td>A dedicated fire reserve, dry hydrant/draft point or cistern, with a connection the fire service has tested.</td><td>Domestic rainwater storage is not automatically fire water.</td></tr>
        <tr><th scope="row">Fuel</th><td>Shaded fuel breaks, limbing, spacing, dead-material removal and a maintenance calendar across parcel boundaries.</td><td>One untreated lot can carry fire into the next.</td></tr>
        <tr><th scope="row">Buildings</th><td>Class A roof intent, closed eaves, ember-resistant vents, tempered glazing, noncombustible deck/porch and shutters.</td><td>Home ignition zone work is only as good as the weakest opening.</td></tr>
        <tr><th scope="row">People</th><td>Named roles, a phone tree/radio, evacuation triggers, a meeting point, medication/pet plan and vulnerable-neighbour check-ins.</td><td>Most wildfire deaths and losses are not solved by a cistern.</td></tr>
        <tr><th scope="row">Recovery</th><td>Insurance review, document copies, tools, temporary shelter in the lodge and a rebuilding plan.</td><td>Response ends; recovery is where a small community can fail.</td></tr>
      </tbody>
    </table></div>
    <p>Read the <a href="../fire/">forest fire-resilience guide</a> for building measures and the difference between a steel hull and a fire-resistance rating.</p>
  </section>

  <details class="deep-dive"><summary>Climate stress tests</summary>
<section aria-labelledby="climate-title">
    <h2 id="climate-title">Hotter, wetter, drier, smokier</h2>
    <p>The design has to work across a wider range, not just a design-day average. These are the stress tests to carry into the next review.</p>
    <div class="table-wrap" role="region" aria-label="Climate stress tests" tabindex="0"><table>
      <caption>Stress tests for the hamlet, not predictions for this site.</caption>
      <thead><tr><th scope="col">Hazard</th><th scope="col">What to test</th><th scope="col">Design response</th></tr></thead>
      <tbody>
        <tr><th scope="row">Heat</th><td>Multi-day 35–40 °C, no air conditioning, power outage, overnight recovery.</td><td>External shading, cross/night ventilation, reflective surfaces, shaded outdoor rooms, a cool shared lodge, water and ceiling fans.</td></tr>
        <tr><th scope="row">Flood</th><td>Short intense rain, spring melt, blocked culvert, overland flow, septic/foundation saturation.</td><td>Grade away from homes, swales, rain gardens, permeable surfaces, cistern overflow, elevated foundations, protected septic and bridge/culvert capacity.</td></tr>
        <tr><th scope="row">Drought</th><td>Low well/cistern recharge, restricted watering, fire reserve still full.</td><td>Demand reduction, native planting, mulch, greywater for subsurface irrigation, storage with trigger levels and a separate fire reserve.</td></tr>
        <tr><th scope="row">Wildfire smoke</th><td>Days of poor air quality; windows closed in heat.</td><td>Filtered ventilation/recirculation, a clean-air room, spare filters, community check-ins and a lodge refuge.</td></tr>
        <tr><th scope="row">Power/communications</th><td>Multi-day outage, no cell service, frozen pipes, medical equipment.</td><td>Shared solar/battery, islanding plan, radio, printed contacts, water and medication plan.</td></tr>
        <tr><th scope="row">Freeze/thaw</th><td>Ice, frost heave, frozen pipes, inaccessible trails.</td><td>Frost-protected water lines, drain-down, heated/insulated service spaces, winter access and snow-load design.</td></tr>
      </tbody>
    </table></div>
  </section>
</details>

  <section aria-labelledby="water-title">
    <h2 id="water-title">Water is the common thread</h2>
    <p>Rainwater, greywater, blackwater and fire water are different qualities with different rules. Do not merge them into one “water system” without treatment, testing and approval.</p>
    <ul>
      <li><strong>Rainwater</strong> for non-potable use and fire reserve; potable use needs filtration, disinfection and testing.</li>
      <li><strong>Greywater</strong> from showers, sinks and laundry for subsurface irrigation or treatment; health-unit and Building Code review.</li>
      <li><strong>Blackwater</strong> to a properly designed septic system or a permitted composting/alternative system; not a DIY barrel.</li>
      <li><strong>Fire water</strong> as a dedicated, accessible reserve with a fire-service connection, not the daily cistern's last litre.</li>
    </ul>
    <p><a class="action" href="../water/">Plan the water cycle</a></p>
  </section>

  <section aria-labelledby="community-title">
    <h2 id="community-title">How a container hamlet builds community resilience</h2>
    <ul>
      <li><strong>Shared assets:</strong> one lodge, one tool library, one water/power system, one maintenance fund — fewer things to maintain badly.</li>
      <li><strong>Clustered footprint:</strong> smaller private homes with shared guest, workshop, laundry and gathering space; more forest left intact.</li>
      <li><strong>Redundant skills:</strong> people who can run the pump, check the cistern, use the radio, cook for a group and check on a neighbour.</li>
      <li><strong>A refuge:</strong> the lodge can be the cool/clean-air room and the emergency kitchen, if it has backup power, water and sanitation.</li>
      <li><strong>Governance:</strong> a written water budget, fire-maintenance calendar, insurance review, reserve fund and decision process before a crisis.</li>
      <li><strong>Not autarky:</strong> the hamlet still needs the fire service, ambulance, grid/backup, road access and outside help. Resilience is the ability to function until help arrives and to recover afterwards.</li>
    </ul>
  </section>

  <details class="deep-dive"><summary>Resilience indicators</summary>
<section aria-labelledby="indicators-title">
    <h2 id="indicators-title">Indicators worth tracking</h2>
    <div class="table-wrap" role="region" aria-label="Resilience indicators" tabindex="0"><table>
      <caption>Start with measurable indicators, not a slogan.</caption>
      <thead><tr><th scope="col">Indicator</th><th scope="col">Target to agree</th></tr></thead>
      <tbody>
        <tr><td>Fire water available and tested</td><td>Volume, flow, connection and access confirmed by the fire service</td></tr>
        <tr><td>Two viable exits from the hamlet</td><td>Year-round route, turnaround and bridge load</td></tr>
        <tr><td>Days of potable water without delivery</td><td>Agreed minimum for residents and pets</td></tr>
        <tr><td>Days of back-up power for the lodge</td><td>Enough for water, refrigeration, communications and medical needs</td></tr>
        <tr><td>Defensible-space maintenance</td><td>Annual inspection with a written record</td></tr>
        <tr><td>Heat/cold refuge capacity</td><td>Beds, water, sanitation and cooking for the agreed population</td></tr>
        <tr><td>Reserve fund</td><td>Funded replacement/repair plan for pump, cistern, roof and access</td></tr>
      </tbody>
    </table></div>
  </section>
</details>

  <p><a class="action" href="../water/">Water cycle</a> <a class="action secondary" href="../fire/">Fire resilience</a> <a class="action secondary" href="../two-storey/">Two-storey study</a></p>
</main>
<footer class="site-footer"><p><a href="../../../index.html">Containers Hamlet</a> · <a href="../index.html">Design Lab</a> · <a href="../LICENSE.txt">AGPL-3.0-or-later</a> · <a href="../CONTENT-LICENSE.md">CC BY-SA 4.0 content</a></p></footer>
</body>
</html>`;
}
