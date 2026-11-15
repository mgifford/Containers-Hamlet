// Code: MIT. Generated page content: CC BY-SA 4.0.
const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const n = (v) => (Math.round(v * 10) / 10).toString();

function viewCaption(c, kind) {
  const porch = c.porches && c.porches[0];
  const porchText = porch ? `${n(porch.length_m)} × ${n(porch.depth_m)} m ${porch.screened ? 'screened porch' : 'covered porch'}` : 'outdoor room';
  if (kind === 'exterior') return `An exterior concept of ${c.name}. The timber-clad containers and ${porchText} are set against the woodland.`;
  if (kind === 'plan') return `Dimensioned concept plan with ${c.modules.length} container module${c.modules.length === 1 ? '' : 's'}, interior room bands, openings, ${porchText}, deck and primary view.`;
  if (kind === 'cutaway') return `Roof-off cutaway through the same geometry, showing the room bands, structural openings and the relationship to the outdoor rooms.`;
  if (kind === 'porch') return `A cropped porch and deck detail from the same model. It shows the screened or covered outdoor room, deck projection and the adjacent container face.`;
  return `A winter study of the same building geometry, with snow, bare deciduous trees and a low, cool light. It is an atmospheric study, not a snow-load calculation.`;
}

function slide(c, kind, title, src, size) {
  const geometry = kind === 'plan' || kind === 'cutaway' || kind === 'porch';
  const badge = geometry ? 'Geometry-backed drawing' : 'Illustrative study';
  const badgeClass = geometry ? 'geometry' : 'illustrative';
  const alt = `${c.name}: ${title.toLowerCase()}. ${viewCaption(c, kind)}`;
  return `        <figure class="slide" data-slide data-title="${esc(title)}">
          <img src="${src}" alt="${esc(alt)}" width="${size.width}" height="${size.height}" loading="eager" decoding="async">
          <figcaption><span class="badge ${badgeClass}">${badge}</span> <strong>${esc(title)}</strong> ${esc(viewCaption(c, kind))}</figcaption>
        </figure>`;
}

export function architecturePage(c, sizes) {
  const slides = [
    slide(c, 'exterior', 'Exterior architectural view', `../../views/${c.id}-exterior.svg`, sizes.exterior),
    slide(c, 'plan', 'Dimensioned concept floor plan', `../../views/${c.id}-plan.svg`, sizes.plan),
    slide(c, 'cutaway', 'Interior roof-off cutaway', `../../views/${c.id}-cutaway.svg`, sizes.cutaway),
    slide(c, 'porch', 'Screened porch or deck view', `../../views/${c.id}-porch.svg`, sizes.porch),
    slide(c, 'winter', 'Winter exterior view', `../../views/${c.id}-winter.svg`, sizes.winter)
  ].join('\n');
  const editable = c.editable === true;
  const facts = [
    ['Containers', `${c.modules.length} × ${c.modules.map((m) => m.type).join(' + ')}`],
    ['Nominal conditioned area', `${n(c.modules.reduce((t, m) => t + m.nominal.length_m * m.nominal.width_m, 0) + c.connections.filter((x) => x.glazed).reduce((t, x) => t + x.length_m * x.width_m, 0))} m² (modules plus glazed hall)`],
    ['Screened / covered outdoor', c.porches.map((p) => `${n(p.length_m)} × ${n(p.depth_m)} m ${p.screened ? 'screened' : 'covered'}`).join('; ') || 'None'],
    ['Glazing intent', `${n(c.modules.reduce((t, m) => t + m.openings.filter((o) => o.type === 'window' || o.type === 'sliding-door').reduce((u, o) => u + o.width_m * o.height_m, 0), 0) + c.connections.reduce((t, x) => t + (x.glazed ? x.glazing_area_m2 || 0 : 0), 0))} m² approximate glazed area`],
    ['Thermal envelope', `${c.thermal.window_performance}; ${c.thermal.roof_insulation_mm} mm roof; ${c.thermal.floor_insulation_mm} mm floor; ${c.thermal.heat_recovery_ventilation ? 'HRV/ERV' : 'no HRV'}`],
    ['Accessibility', c.features.accessibility],
    ['Structure', c.modules.some((m) => m.structure.wall_removal !== 'none') || c.modules.length > 1 ? 'Multiple modules and/or wall removals need structural engineering review.' : 'Container openings still need structural review.']
  ];
  return `<!doctype html>
<html lang="en-CA">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Five-view architectural gallery for the ${esc(c.name)} container home concept: exterior, dimensioned plan, cutaway, porch detail and winter study.">
  <title>${esc(c.name)} architectural gallery · Containers Hamlet Design Lab</title>
  <link rel="stylesheet" href="../../../style.css">
  <link rel="stylesheet" href="../../style.css">
  <link rel="stylesheet" href="../../architecture.css">
</head>
<body class="lab-page">
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <a class="brand" href="../../../index.html">Containers Hamlet</a>
  <nav aria-label="Design Lab">
    <a href="../../index.html">Design gallery</a>
    <a href="../../editor/">Editor</a>
    <a href="../../compare/">Compare</a>
    <a href="../../../index.html#design-lab">Design on the main site</a>
    <a href="../../../index.html">Main site</a>
  </nav>
</header>
<main id="main" class="lab-main">
  <p class="eyebrow">Architectural gallery · ${esc(c.group)}</p>
  <h1>${esc(c.name)}</h1>
  <p class="lede">${esc(c.description)}</p>
  <p class="notice">${editable ? 'Editable concept.' : 'Concept only; this design is not editable in the current editor.'} ${c.id === 'common-lodge' ? 'The existing authoritative lodge model remains the baseline; this is an additional Design Lab concept.' : ''}</p>
  <div class="slideshow" data-slideshow>
    <div class="slide-head">
      <div>
        <h2 id="views-title">Five views</h2>
        <p class="slide-status" data-slide-status role="status" aria-live="polite">View 1 of 5: Exterior architectural view</p>
      </div>
      <div class="slide-controls" data-slide-controls>
        <button type="button" data-slide-prev>Previous</button>
        <button type="button" data-slide-next>Next</button>
        <button type="button" data-slide-all aria-expanded="false" aria-controls="slide-viewport">Show all views</button>
      </div>
    </div>
    <noscript><p class="notice">JavaScript is off. All five views are shown below in order; the carousel controls are not needed.</p></noscript>
    <div class="slide-viewport" id="slide-viewport" data-slide-viewport tabindex="0" aria-label="Five architectural views. Use the Previous and Next buttons, or the Left and Right arrow keys.">
${slides}
    </div>
    <p class="slide-help">The five views share one model. The plan, cutaway and porch detail are geometry-backed drawings; the exterior and winter images are illustrative studies. No slide advances automatically.</p>
  </div>
  <section class="architecture-facts" aria-labelledby="facts-title">
    <h2 id="facts-title">Concept facts</h2>
    <dl class="fact-grid">${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    <div class="button-row">
      <a class="action" href="../../data/${c.id}.json" download>Download source JSON</a>
      ${editable ? `<a class="action secondary" href="../../editor/?preset=${c.id}">Open in the editor</a>` : '<a class="action secondary" href="../../editor/">Open the editor</a>'}
      <a class="action secondary" href="../../compare/?a=${c.id}">Compare this concept</a>
      <a class="action secondary" href="../../index.html">Back to the gallery</a>
    </div>
    <p class="small">Concept only. Not reviewed by an architect, engineer or building official. No construction, energy, code or cost claim.</p>
  </section>
</main>
<footer class="site-footer"><p><a href="../../../index.html">Containers Hamlet</a> · <a href="../../index.html">Design Lab</a> · <a href="../../LICENSE.txt">AGPL-3.0-or-later</a> · <a href="../../CONTENT-LICENSE.md">CC BY-SA 4.0 content</a></p></footer>
<script src="../../architecture.js"></script>
</body>
</html>
`;
}
