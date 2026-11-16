// Code: MIT.
import { designShellNav } from './design-nav.mjs';
// // Generated page content: CC BY-SA 4.0.
const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const label = { 'trellis': 'Freestanding climbing-plant trellis', 'living-wall': 'Modular living wall', 'edible-wall': 'Edible herb and perennial planter wall', 'privacy-screen': 'Evergreen privacy screen' };

const systems = [
  { id: 'trellis', name: label.trellis, summary: 'A separate frame with climbers, held away from the rainscreen.', benefits: ['Seasonal shade and a green edge.', 'Can screen a window or porch without using interior space.', 'Repairable and replaceable independent frame.'], limits: ['Climbers need pruning, ties and a safe maintenance route.', 'Roots and moisture must stay out of the wall and foundation.', 'Fire, structural fixing and plant selection need review.'], questions: ['Which native or non-invasive climber suits the exposure and soil?', 'Who prunes and inspects the frame?', 'How is the frame anchored without loading the container?'] },
  { id: 'living-wall', name: label["living-wall"], summary: 'Modular planted panels on an independent frame, with irrigation and drainage.', benefits: ['High visual density in a small footprint.', 'Modules can be replaced individually.', 'Can shade a west or south façade.'], limits: ['Water, growing medium and plants add load and maintenance.', 'Irrigation leaks, freeze-thaw, fire and electrical services need design.', 'Supplier performance claims require independent verification.'], questions: ['What is the fire classification of the module and growing medium?', 'How is irrigation water contained and drained?', 'What is the replacement and maintenance access strategy?'] },
  { id: 'edible-wall', name: label["edible-wall"], summary: 'Planter modules for herbs, strawberries and perennials at accessible heights.', benefits: ['Food and education close to the kitchen.', 'Accessible working height.', 'Seasonal interest and pollinator habitat.'], limits: ['Frequent watering, feeding and replanting.', 'Contaminants, food safety and accessibility need attention.', 'Planter load and brackets need structural review.'], questions: ['Is the water supply frost-free and safe?', 'Who maintains the crop and replaces soil?', 'How are reach, drainage and overflow resolved?'] },
  { id: 'privacy-screen', name: label["privacy-screen"], summary: 'An independently supported evergreen screen, clear of the building and services.', benefits: ['Year-round visual screening.', 'Wind buffering and habitat.', 'Can define an outdoor room.'], limits: ['Slow establishment and eventual root volume.', 'Height, bylaw, fire and utility clearance need checking.', 'No privacy score is calculated.'], questions: ['Is the species native, climate-appropriate and non-invasive?', 'What is the root barrier and utility clearance?', 'Who prunes and replaces the screen?'] }
];

export function vegetationPage(concepts) {
  const rows = concepts.map((c) => {
    const systemsFor = [];
    if ((c.trellises || []).length) systemsFor.push('trellis');
    (c.vegetation || []).forEach((v) => systemsFor.push(v.type));
    return `<tr><th scope="row"><a href="../architecture/${esc(c.id)}/">${esc(c.name)}</a></th><td>${c.modules.length}</td><td>${systemsFor.length ? systemsFor.map((s) => esc(label[s] || s)).join(', ') : 'None recorded'}</td></tr>`;
  }).join('');
  return `<!doctype html>
<html lang="en-CA">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Vegetation systems for the Containers Hamlet Design Lab: independent trellis, modular living wall, edible planter wall and evergreen privacy screen, with benefits, limitations, open questions and sources.">
  <title>Vegetation systems · Containers Hamlet Design Lab</title>
  <link rel="stylesheet" href="../../../style.css">
  <link rel="stylesheet" href="../style.css">
  <link rel="stylesheet" href="../architecture.css">
</head>
<body class="lab-page">
<a class="skip" href="#main">Skip to content</a>
${designShellNav(2, 'guides')}
<main id="main" class="lab-main">
  <p class="eyebrow">Envelope and vegetation</p>
  <h1>Planting systems, held clear of the wall</h1>
  <p class="lede">Four reusable systems: a freestanding climbing-plant trellis, a modular living wall, an edible herb and perennial planter wall, and an evergreen privacy screen. They are shown on one-, two- and three-container concepts and the common lodge. Planted structures are independently supported wherever practical; none is a substitute for the rainscreen, insulation or structural design.</p>
  <p class="notice"><strong>No energy savings, privacy score, carbon figure or code compliance is claimed.</strong> Supplier pages describe products and claims; independent building science and a project-specific review are still required.</p>

  <section aria-labelledby="systems-title">
    <h2 id="systems-title">Four systems</h2>
    <div class="system-grid">
      ${systems.map((s) => `<article class="system-card"><h3>${esc(s.name)}</h3><p>${esc(s.summary)}</p><h4>Benefits</h4><ul>${s.benefits.map((x) => `<li>${esc(x)}</li>`).join('')}</ul><h4>Limitations</h4><ul>${s.limits.map((x) => `<li>${esc(x)}</li>`).join('')}</ul><h4>Open questions</h4><ul>${s.questions.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></article>`).join('')}
    </div>
  </section>

  <section aria-labelledby="compare-title">
    <h2 id="compare-title">Rainscreen, trellis and living wall</h2>
    <figure class="system-figure">
      <img src="../systems/vegetation-comparison.svg" width="1040" height="440" alt="Schematic comparison: a conventional timber rainscreen with steel, exterior insulation, a ventilated cavity and cladding; a planted trellis on an independent frame clear of the wall; and a modular living wall with independent modules, frame and irrigation." loading="lazy" decoding="async">
      <figcaption>Original schematic, not to scale. The conventional rainscreen is a wall assembly; the trellis and living wall are independent outdoor structures with their own supports, water and maintenance needs.</figcaption>
    </figure>
  </section>

  <section aria-labelledby="examples-title">
    <h2 id="examples-title">Examples by design</h2>
    <p class="small">The four systems are distributed across one-, two- and three-container concepts and the common lodge. Open a design for its five-view gallery and seasonal views.</p>
    <div class="table-wrap"><table>
      <caption>Recorded vegetation systems by Design Lab concept. Not every design uses every system.</caption>
      <thead><tr><th scope="col">Design</th><th scope="col">Containers</th><th scope="col">Recorded systems</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
  </section>

  <section aria-labelledby="evidence-title">
    <h2 id="evidence-title">What is supported, and what is not</h2>
    <div class="table-wrap"><table>
      <caption>Evidence posture for claims in this Design Lab. This is a design prompt, not a literature review or a product certification.</caption>
      <thead><tr><th scope="col">Claim</th><th scope="col">Evidence posture</th></tr></thead>
      <tbody>
        <tr><th scope="row">Exterior insulation can reduce thermal bridging and keep the steel shell warmer when detailed continuously.</th><td>Supported by general building-science principles; project-specific condensation and fire performance still require engineering analysis.</td></tr>
        <tr><th scope="row">A drained, ventilated rainscreen can support drying and reduce rain penetration.</th><td>Broadly supported as a principle; the actual assembly, climate, exposure and detailing determine performance.</td></tr>
        <tr><th scope="row">Vegetation can shade glazing and provide visual screening.</th><td>Plausible and visually demonstrable; the amount depends on species, season, growth, maintenance and placement. No energy or privacy score is calculated.</td></tr>
        <tr><th scope="row">Independent supports keep planting loads off the container shell.</th><td>A sound design principle where the independent frame, footings and connections are engineered; the editor does not engineer them.</td></tr>
        <tr><th scope="row">A specific assembly is moisture-safe or code-compliant.</th><td>Not supported. This requires project-specific building-envelope, fire and code analysis.</td></tr>
        <tr><th scope="row">A living wall saves a stated amount of energy or carbon.</th><td>Not supported here. No energy, carbon or life-cycle figure is invented.</td></tr>
        <tr><th scope="row">A privacy screen achieves a privacy score.</th><td>Not supported. No privacy score is calculated.</td></tr>
      </tbody>
    </table></div>
  </section>

  <section aria-labelledby="sources-title">
    <h2 id="sources-title">Sources and supplier claims</h2>
    <p>Supplier pages are useful for understanding proprietary systems, but their performance and sustainability claims are not independently verified here. The building-science references discuss moisture, insulation and enclosure principles; they are not reviews of these designs.</p>
    <ul class="source-list">
      <li><a href="https://www.ecohome.net/en/guides/query/living+green+wall/">Ecohome — living green wall guides</a> (publisher guidance; not a product certification).</li>
      <li><a href="https://www.ecohome.net/en/guides/query/living+wall/">Ecohome — living wall guides</a>.</li>
      <li><a href="https://www.gsky.com/">GSky Plant Systems</a> (supplier; proprietary systems and claims).</li>
      <li><a href="https://livewall.com/products/">LiveWall vertical plant wall system</a> (supplier; proprietary systems and claims).</li>
      <li><a href="https://wallemi.com/our-products/">Wallemi living walls</a> (supplier; proprietary systems and claims).</li>
      <li><a href="https://buildingscience.com/sites/default/files/migrate/pdf/BA-1313_Moisture%20Durablity%20with%20Vapor%20Permeable%20Insulating%20Sheathing.pdf">Building Science Corporation — moisture durability with vapour-permeable insulating sheathing</a> (building-science guidance; not a project review).</li>
      <li><a href="https://www.rdh.com/wp-content/uploads/2022/12/Exterior-Insulation_2020-05-06.pdf">RDH — exterior insulation</a> (building-science guidance; not a project review).</li>
      <li><a href="https://www.sciencedirect.com/science/article/pii/S1876610215019116">Green building envelopes — moisture safety in ventilated lightweight envelopes</a> (research paper; not a product endorsement).</li>
    </ul>
    <p class="small">No proprietary diagrams, photographs or product designs are copied. The diagrams on this page are original schematics. See <a href="../THIRD-PARTY-NOTICES.md">third-party notices</a>.</p>
  </section>

  <p><a class="action" href="../index.html">Back to the design gallery</a> <a class="action secondary" href="../compare/">Compare concepts</a></p>
</main>
<footer class="site-footer"><p><a href="../../../index.html">Containers Hamlet</a> · <a href="../index.html">Design Lab</a> · <a href="../LICENSE.txt">AGPL-3.0-or-later</a> · <a href="../CONTENT-LICENSE.md">CC BY-SA 4.0 content</a></p></footer>
</body>
</html>`;
}
