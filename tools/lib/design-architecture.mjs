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

export function architecturePage(c, sizes, profile) {
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
    <a href="../../vegetation/">Vegetation</a>
    <a href="../../ground/">Ground</a>
    <a href="../../patterns/">Patterns</a>
    <a href="../../fire/">Fire</a>
    <a href="../../two-storey/">Two-storey</a>
    <a href="../../resilience/">Resilience</a>
    <a href="../../water/">Water</a>
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
  <section class="seasonal-section" aria-labelledby="seasonal-title">
    <h2 id="seasonal-title">Summer and winter</h2>
    <p>Both views use the same building and vegetation geometry. Evergreen systems remain visible in winter; deciduous climbers and edible planting are shown as dormant. No energy, daylight or privacy score is calculated.</p>
    <div class="season-pair">
      <figure><img src="../../views/${c.id}-exterior.svg" width="1040" height="700" alt="Summer exterior of ${esc(c.name)} with vegetation and seasonal foliage." loading="eager" decoding="async"><figcaption><span class="badge illustrative">Illustrative study</span> Summer: planting, shade and outdoor use.</figcaption></figure>
      <figure><img src="../../views/${c.id}-winter.svg" width="1040" height="700" alt="Winter exterior of ${esc(c.name)} showing evergreen screening and dormant deciduous planting." loading="eager" decoding="async"><figcaption><span class="badge illustrative">Illustrative study</span> Winter: evergreen screening, dormant deciduous planting and snow.</figcaption></figure>
    </div>
    <h3>Approximate window exposure</h3>
    <table class="exposure-table"><caption>Approximate glazing area by world-facing side. Not an energy or daylight model.</caption><thead><tr><th scope="col">Side</th><th scope="col">Approximate glazing</th></tr></thead><tbody>
      ${['north','east','south','west'].map((f) => `<tr><th scope="row">${f}</th><td>${profile.exposure.glazing_by_face[f]} m²</td></tr>`).join('')}
      <tr><th scope="row">Total</th><td>${profile.exposure.glazing_total_m2} m²</td></tr>
    </tbody></table>
    ${profile.exposure.shading.length ? `<h3>Shading and seasonal notes</h3><ul>${profile.exposure.shading.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
    ${profile.exposure.privacy.length ? `<h3>Privacy and screening</h3><ul>${profile.exposure.privacy.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
    ${profile.exposure.maintenance.length ? `<h3>Maintenance</h3><ul>${profile.exposure.maintenance.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
    <p class="small">${esc(profile.exposure.note)}</p>
  </section>

  <section class="assembly-section" aria-labelledby="assembly-title">
    <h2 id="assembly-title">Envelope assembly</h2>
    <p><strong>${esc((c.envelope && c.envelope.assembly) || 'unknown')}</strong> · version ${esc((c.envelope && c.envelope.version) || '—')}. The diagram is explanatory, not a construction detail; it is not code-compliant or moisture-safe without engineering review.</p>
    <img src="../../systems/wall-${esc(c.envelope.assembly)}.svg" width="1040" height="560" alt="Explanatory wall section for the ${esc(c.envelope.assembly)} assembly: steel container wall, air and vapour control, insulation, thermal break, ventilated cavity and cladding, with vegetation clearance." loading="eager" decoding="async">
    <h3>Layers</h3>
    <ul class="assembly-layers">${c.envelope.layers.map((l) => `<li>${esc(l.material)} — ${l.thickness_mm} mm (${esc(l.role)})</li>`).join('')}</ul>
    <p class="small">Condensation, fire, moisture, fastening, structural penetrations and maintenance all need project review. The designer does not claim this assembly is compliant or moisture-safe.</p>
  </section>

  <section class="foundation-section" aria-labelledby="foundation-title">
    <h2 id="foundation-title">Foundation and ground</h2>
    <p><strong>${esc(c.foundation.system)}</strong> · ${c.foundation.clearance_m} m clearance · ${c.foundation.no_compaction ? 'no compaction intent' : 'compaction unresolved'} · independent decks: ${c.foundation.independent_deck ? 'yes' : 'no'}.</p>
    <img src="../../systems/foundation-${esc(c.foundation.system)}.svg" width="1040" height="430" alt="Elevated ${esc(c.foundation.system)} foundation section with piles, floor, no fill and a root protection zone." loading="eager" decoding="async">
    <p class="small">${esc(c.foundation.note)} Geotechnical, frost-uplift, corrosion, lateral, slope, permit and conservation-authority review are required. No fill, slab or compaction is the intent; the construction sequence still needs an arborist and erosion-control plan.</p>
  </section>

  <section class="solar-section" aria-labelledby="solar-title">
    <h2 id="solar-title">Solar tilt and azimuth</h2>
    ${(() => { const sm = c.solar_array || (c.modules.find((m) => m.solar && m.solar.enabled) || c.modules[0]).solar; return `<p><strong>${sm.tilt_deg}° tilt</strong> · ${sm.azimuth_deg}° azimuth · ${esc(sm.season_mode)} strategy. ${esc(sm.note || '')}</p>${c.roof_form ? `<p class="small">Roof: one ${c.roof_form.pitch_deg}° ${c.roof_form.type === 'gable' ? 'gable roof with a clear ridge' : 'south-facing shed roof'}. Solar is mounted only on the south slope; the north slope has no array. Array azimuth is true south, independent of building rotation.</p>` : ''}<img src="../../systems/solar-${sm.tilt_deg}.svg" width="1040" height="400" alt="Explanatory solar section with a ${sm.tilt_deg} degree tilted array facing azimuth ${sm.azimuth_deg} degrees." loading="eager" decoding="async">`; })()}
    <p class="small">Ottawa reference: the year-round fixed range is 36–39° (SolarCalculator.CA reports 39° optimal), winter is about 60° and summer about 30°, facing true south within a few degrees. No energy production, snow-shedding, wind-uplift or code compliance is calculated.</p>
  </section>

  <section class="vegetation-section" aria-labelledby="vegetation-title">
    <h2 id="vegetation-title">Vegetation systems</h2>
    ${(c.trellises && c.trellises.length) || (c.vegetation && c.vegetation.length) ? `<ul>
      ${(c.trellises || []).map((t) => `<li><strong>Freestanding trellis</strong> on the ${esc(t.face)} face, ${t.length_m} × ${t.height_m} m; independent support; ${esc(t.note || '')}</li>`).join('')}
      ${(c.vegetation || []).map((v) => `<li><strong>${esc({ 'living-wall': 'Modular living wall', 'edible-wall': 'Edible planter wall', 'privacy-screen': 'Evergreen privacy screen' }[v.type] || v.type)}</strong> on the ${esc(v.face)} face, ${v.length_m} × ${v.height_m} m; ${esc(v.seasonal_foliage)}; clearance ${v.offset_m} m; ${esc(v.support)}; irrigation: ${esc(v.irrigation)}; maintenance: ${esc(v.maintenance)}.</li>`).join('')}
    </ul>` : '<p>No vegetation system is recorded for this concept.</p>'}
    <p class="small">Planting is independently supported where practical. Fire, moisture, structural loads, irrigation, plant selection and maintenance require professional review. <a href="../../vegetation/">Compare the four vegetation systems</a>.</p>
  </section>

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
