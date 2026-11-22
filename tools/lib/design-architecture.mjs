// Code: MIT.
import { designShellNav } from './design-nav.mjs';
// // Generated page content: CC BY-SA 4.0.
const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const n = (v) => (Math.round(v * 10) / 10).toString();

function viewCaption(c, kind) {
  const porch = c.porches && c.porches[0];
  const porchText = porch ? `${n(porch.length_m)} × ${n(porch.depth_m)} m ${porch.screened ? 'screened porch' : 'covered porch'}` : 'outdoor room';
  const levels = c.levels.length;
  if (kind === 'exterior') return `An exterior concept of ${c.name}. The timber-clad containers and ${porchText} are set against the woodland. ${levels > 1 ? 'Both storeys are drawn at their explicit elevations.' : ''}`;
  if (kind === 'container-layout') return `Proportional container block plan: ${c.modules.length} modules across ${levels} storey${levels === 1 ? '' : 's'}, with ground modules solid and upper modules dashed and hatched. Dimensions are nominal.`;
  if (kind === 'container-layout-elevation') return `Proportional container block elevation with ground and upper modules at their explicit elevations. This is a schematic, not a construction elevation.`;
  if (kind === 'roof-plan') return `Roof plan generated from the roof geometry: form, pitch, overhang, ridge/valley and slope direction. Roof drainage, snow, wind and structure still need review.`;
  if (kind === 'exterior-opposite') return `Opposite exterior reference from the same geometry and a rotated camera. It is a concept reference, not a measured photograph.`;
  if (kind === 'approach') return `Approach reference. This is an orthographic elevation of the entrance facade; the world bearing in the prompt describes the site orientation.`;
  if (kind === 'site-facing') return `Site-facing reference view, rotated so the assigned principal view faces the viewer. It is an approximate concept reference.`;
  if (kind === 'plan') return `Combined concept plan with ${c.modules.length} container module${c.modules.length === 1 ? '' : 's'}, interior room bands, openings, ${porchText}, deck and primary view.${levels > 1 ? ' Upper modules are drawn with a dashed outline over the ground floor.' : ''}`;
  if (kind === 'plan-ground') return `Ground-floor concept plan. Every module is shown with its room bands, openings and outdoor rooms.${levels > 1 ? ' Upper modules are muted outlines so the ground-floor layout stays readable.' : ''}`;
  if (kind === 'plan-upper') return `Upper-floor concept plan. The upper modules are solid and the ground-floor modules stay visible as muted outlines for context.`;
  if (kind === 'cutaway') return `Roof-off cutaway through the same geometry, showing the room bands, structural openings and the relationship to the outdoor rooms.`;
  if (kind === 'porch') return `A cropped porch and deck detail from the same model. It shows the screened or covered outdoor room, deck projection and the adjacent container face.`;
  if (kind && kind.indexOf('elevation') === 0) return `${kind.split('-')[1]} elevation generated from the same module elevations and openings as the plan. It is a concept drawing, not a construction elevation.`;
  if (kind === 'section') return `Building section through the same geometry, showing the floor levels, modules, roof profile, stair and ground. It is not a structural section.`;
  if (kind === 'exploded') return `Exploded-level view. Storeys are separated for reading only; the separation is not a construction sequence.`;
  if (kind === 'solar-summer') return `Summer solar study with a high sun angle. The overhang and glazing are shown qualitatively; no overheating, daylight or energy result is calculated.`;
  if (kind === 'solar-winter') return `Winter solar study with a low sun angle. Snow shedding, glare and heat loss are not calculated.`;
  return `A winter study of the same building geometry, with snow, bare deciduous trees and a low, cool light. It is an atmospheric study, not a snow-load calculation.`;
}

function slide(c, kind, title, src, size) {
  const geometry = ['plan', 'plan-ground', 'plan-upper', 'cutaway', 'porch', 'section', 'exploded', 'elevation-south', 'elevation-north', 'elevation-east', 'elevation-west', 'container-layout', 'container-layout-elevation', 'roof-plan', 'exterior-opposite', 'approach', 'site-facing'].indexOf(kind) >= 0;
  const badge = geometry ? 'Geometry-backed drawing' : 'Illustrative / explanatory study';
  const badgeClass = geometry ? 'geometry' : 'illustrative';
  const alt = kind && kind.indexOf('elevation') === 0
    ? `${c.name}: ${title}. The ${kind.split('-')[1]} elevation is generated from the same module elevations, openings and roof as the plan. Conceptual only.`
    : `${c.name}: ${title.toLowerCase()}. ${viewCaption(c, kind)}`;
  return `        <figure class="slide" data-slide data-title="${esc(title)}">
          <img src="${src}" alt="${esc(alt)}" width="${size.width}" height="${size.height}" loading="eager" decoding="async">
          <figcaption><span class="badge ${badgeClass}">${badge}</span> <strong>${esc(title)}</strong> ${esc(viewCaption(c, kind))}</figcaption>
        </figure>`;
}

export function architecturePage(c, sizes, profile) {
  const multi = c.levels.length > 1;
  const slides = [
    slide(c, 'exterior', 'Exterior architectural view', `../../views/${c.id}-exterior.svg`, sizes.exterior),
    sizes['container-layout'] ? slide(c, 'container-layout', 'Container block plan', `../../views/${c.id}-container-layout.svg`, sizes['container-layout']) : '',
    sizes['container-layout-elevation'] ? slide(c, 'container-layout-elevation', 'Container block elevation', `../../views/${c.id}-container-layout-elevation.svg`, sizes['container-layout-elevation']) : '',
    slide(c, 'plan', 'Combined concept plan', `../../views/${c.id}-plan.svg`, sizes.plan),
    slide(c, 'plan-ground', 'Ground-floor plan', `../../views/${c.id}-plan-ground.svg`, sizes['plan-ground']),
    multi ? slide(c, 'plan-upper', 'Upper-floor plan', `../../views/${c.id}-plan-upper.svg`, sizes['plan-upper']) : '',
    slide(c, 'elevation-south', 'South elevation', `../../views/${c.id}-elevation-south.svg`, sizes['elevation-south']),
    slide(c, 'elevation-north', 'North elevation', `../../views/${c.id}-elevation-north.svg`, sizes['elevation-north']),
    slide(c, 'elevation-east', 'East elevation', `../../views/${c.id}-elevation-east.svg`, sizes['elevation-east']),
    slide(c, 'elevation-west', 'West elevation', `../../views/${c.id}-elevation-west.svg`, sizes['elevation-west']),
    sizes['roof-plan'] ? slide(c, 'roof-plan', 'Roof plan', `../../views/${c.id}-roof-plan.svg`, sizes['roof-plan']) : '',
    slide(c, 'section', 'Building section', `../../views/${c.id}-section.svg`, sizes.section),
    slide(c, 'exploded', 'Exploded levels', `../../views/${c.id}-exploded.svg`, sizes.exploded),
    sizes['exterior-opposite'] ? slide(c, 'exterior-opposite', 'Opposite exterior reference', `../../views/${c.id}-exterior-opposite.svg`, sizes['exterior-opposite']) : '',
    sizes.approach ? slide(c, 'approach', 'Approach reference', `../../views/${c.id}-approach.svg`, sizes.approach) : '',
    sizes['site-facing'] ? slide(c, 'site-facing', 'Site-facing reference', `../../views/${c.id}-site-facing.svg`, sizes['site-facing']) : '',
    slide(c, 'cutaway', 'Interior roof-off cutaway', `../../views/${c.id}-cutaway.svg`, sizes.cutaway),
    slide(c, 'porch', 'Screened porch or deck view', `../../views/${c.id}-porch.svg`, sizes.porch),
    slide(c, 'solar-summer', 'Summer solar study', `../../views/${c.id}-solar-summer.svg`, sizes['solar-summer']),
    slide(c, 'solar-winter', 'Winter solar study', `../../views/${c.id}-solar-winter.svg`, sizes['solar-winter']),
    slide(c, 'winter', 'Winter exterior view', `../../views/${c.id}-winter.svg`, sizes.winter)
  ].filter(Boolean).join('\n');
  const editable = c.editable === true;
  const a = profile.accessibility_profile;
  const review = profile.structural_review;
  const met = profile.metrics;
  const facts = [
    ['Storeys', `${c.levels.length} occupied storey${c.levels.length === 1 ? '' : 's'}${multi ? ' (' + c.levels.map((l) => l.name + ' at +' + n(l.elevation_m) + ' m').join('; ') + ')' : ''}`],
    ['Containers', `${c.modules.length} × ${c.modules.map((m) => m.type).join(' + ')}`],
    ['Gross floor area', `${n(met.grossFloorArea_m2)} m² nominal modules plus glazed links`],
    ['Ground coverage', `${n(met.groundCoverage_m2)} m² projected footprint`],
    ['Building height', `${n(met.buildingHeight_m)} m to the roof`],
    ['Roof', `${c.roof_form.type.replace(/-/g, ' ')} · ${c.roof_form.pitch_deg}° pitch · ${n(c.roof_form.overhang_m)} m overhang${c.roof_form.green_roof ? ' · green roof concept' : ''}`],
    ['Nominal conditioned area', `${n(profile.thermal.conditioned_area_m2)} m² (modules plus glazed hall)`],
    ['Screened / covered outdoor', c.porches.map((p) => `${n(p.length_m)} × ${n(p.depth_m)} m ${p.screened ? 'screened' : 'covered'}`).join('; ') || 'None'],
    ['Glazing intent', `${n(profile.thermal.glazing_m2)} m² approximate glazed area`],
    ['Thermal envelope', `${c.thermal.window_performance}; ${c.thermal.roof_insulation_mm} mm roof; ${c.thermal.floor_insulation_mm} mm floor; ${c.thermal.heat_recovery_ventilation ? 'HRV/ERV' : 'no HRV'}`],
    ['Accessibility classification', a.label],
    ['Structural review status', `Model status: ${review.model_status.replace(/-/g, ' ')}. ${review.concerns.filter((x) => x.status === 'requires-review').length} concern${review.concerns.filter((x) => x.status === 'requires-review').length === 1 ? '' : 's'} need review.`],
    ['Architectural family', `${profile.architecture.arrangement.replace(/-/g, ' ')} · ${profile.architecture.footprint_type.replace(/-/g, ' ')} · entrance to the ${profile.architecture.entrance_orientation}`]
  ];
  const concernRows = review.concerns.map((x) => `<tr><th scope="row">${esc(x.label)}</th><td><span class="review-status">${esc(x.status.replace(/-/g, ' '))}</span></td><td>${esc(x.notes)}</td></tr>`).join('');
  const accessIssues = a.issues.length ? `<ul>${a.issues.map((i) => `<li>${esc(i.message)}</li>`).join('')}</ul>` : '<p>No recorded accessibility issue in the current checks. This is not a conformance finding.</p>';
  return `<!doctype html>
<html lang="en-CA">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Architectural gallery for the ${esc(c.name)} container home concept: combined and floor-specific plans, four elevations, building section, exploded levels, isometric exterior, solar studies and accessibility and structural review status.">
  <title>${esc(c.name)} architectural gallery · Containers Hamlet Design Lab</title>
  <link rel="stylesheet" href="../../../style.css">
  <link rel="stylesheet" href="../../style.css">
  <link rel="stylesheet" href="../../architecture.css">
</head>
<body class="lab-page">
<a class="skip" href="#main">Skip to content</a>
${designShellNav(3, 'gallery')}
<main id="main" class="lab-main">
  <p class="eyebrow">Architectural gallery · ${esc(c.group)} · ${esc(c.role === 'hamlet-selected' ? 'hamlet residence' : c.role === 'common-lodge' ? 'common lodge' : 'archive concept')}</p>
  <h1>${esc(c.name)}</h1>
  <p class="lede">${esc(c.description)}</p>
  <p class="notice">${editable ? 'Editable concept.' : 'Concept only; this design is not editable in the current editor.'} ${c.id === 'common-lodge' ? 'The existing authoritative lodge model remains the baseline; this is an additional Design Lab concept.' : ''} Every plan, elevation, section and isometric on this page is generated from the same JSON model. The drawings are conceptual and are not a construction set.</p>
  <div class="slideshow" data-slideshow>
    <div class="slide-head">
      <div>
        <h2 id="views-title">Plans, elevations, section and studies</h2>
        <p class="slide-status" data-slide-status role="status" aria-live="polite">View 1 of ${slides.split('data-slide').length - 1}: Exterior architectural view</p>
      </div>
      <div class="slide-controls" data-slide-controls>
        <button type="button" data-slide-prev>Previous</button>
        <button type="button" data-slide-next>Next</button>
        <button type="button" data-slide-all aria-expanded="false" aria-controls="slide-viewport">Show all views</button>
      </div>
    </div>
    <noscript><p class="notice">JavaScript is off. All views are shown below in order; the carousel controls are not needed.</p></noscript>
    <div class="slide-viewport" id="slide-viewport" data-slide-viewport tabindex="0" aria-label="Architectural views. Use the Previous and Next buttons, or the Left and Right arrow keys.">
${slides}
    </div>
    <p class="slide-help">The plans, elevations, section and exploded view share one model. The exterior, porch and winter views are illustrative studies. Solar studies are qualitative. No slide advances automatically.</p>
  </div>
  <section class="seasonal-section" aria-labelledby="seasonal-title">
    <h2 id="seasonal-title">Summer and winter</h2>
    <p>Both views use the same building and vegetation geometry. Evergreen systems remain visible in winter; deciduous climbers and edible planting are shown as dormant. No energy, daylight or privacy score is calculated.</p>
    <div class="season-pair">
      <figure><img src="../../views/${c.id}-exterior.svg" width="1040" height="700" alt="Summer exterior of ${esc(c.name)} with vegetation and seasonal foliage." loading="eager" decoding="async"><figcaption><span class="badge illustrative">Illustrative study</span> Summer: planting, shade and outdoor use.</figcaption></figure>
      <figure><img src="../../views/${c.id}-winter.svg" width="1040" height="700" alt="Winter exterior of ${esc(c.name)} showing evergreen screening and dormant deciduous planting." loading="eager" decoding="async"><figcaption><span class="badge illustrative">Illustrative study</span> Winter: evergreen screening, dormant deciduous planting and snow.</figcaption></figure>
    </div>
    <h3>Summer and winter solar studies</h3>
    <div class="season-pair">
      <figure><img src="../../views/${c.id}-solar-summer.svg" width="1040" height="520" alt="Summer solar study for ${esc(c.name)}: a high sun angle and the roof overhang are shown qualitatively." loading="eager" decoding="async"><figcaption><span class="badge illustrative">Explanatory study</span> Summer: high sun and overhang.</figcaption></figure>
      <figure><img src="../../views/${c.id}-solar-winter.svg" width="1040" height="520" alt="Winter solar study for ${esc(c.name)}: a low sun angle and the south glazing are shown qualitatively." loading="eager" decoding="async"><figcaption><span class="badge illustrative">Explanatory study</span> Winter: low sun and south glazing.</figcaption></figure>
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

  <section class="assembly-section" aria-labelledby="storeys-title">
    <h2 id="storeys-title">Levels, stacking and support</h2>
    <p><strong>${c.levels.length} occupied storey${c.levels.length === 1 ? '' : 's'}.</strong> ${multi ? 'The upper floor is explicit geometry, not a drawing trick. Every upper module records an elevation and a support intent.' : 'The home is single-storey. No upper floor is implied by the roof.'}</p>
    <table class="exposure-table"><caption>Module elevations and declared support intent. A support reference is design intent, not a verified load path.</caption><thead><tr><th scope="col">Module</th><th scope="col">Level</th><th scope="col">Base elevation</th><th scope="col">Declared support</th><th scope="col">Support overlap</th></tr></thead><tbody>
      ${c.modules.map((m) => {
        const row = profile.support.rows.find((r) => r.module === m.id);
        return `<tr><th scope="row">${esc(m.id)}</th><td>${m.storey + 1}</td><td>${n(m.elevation_m)} m</td><td>${esc((m.support.references || []).join(', ') || m.support.type)} · ${m.support.verified ? 'professionally verified (documented)' : 'not verified'}</td><td>${row ? Math.round(row.support_fraction * 100) + '% of footprint' : '—'}</td></tr>`;
      }).join('')}
    </tbody></table>
    <p class="small">A module directly above another is not automatically supported. The model reports the geometric bearing overlap; it does not calculate capacity, connection strength, lateral stability or foundation reactions.</p>
  </section>

  <section class="assembly-section" aria-labelledby="access-title">
    <h2 id="access-title">Accessibility</h2>
    <p><strong>${esc(a.label)}</strong></p>
    <dl class="fact-grid">
      <div><dt>Step-free entrance</dt><dd>${a.step_free_entrance ? 'Recorded as an intent' : 'Not recorded'}</dd></div>
      <div><dt>Ground-floor essential functions</dt><dd>${a.ground_floor_essential_functions ? 'Recorded' : 'Not recorded'}</dd></div>
      <div><dt>Ground-floor bedroom</dt><dd>${a.ground_floor_bedroom ? 'Recorded' : 'Not recorded'}</dd></div>
      <div><dt>Entrance door</dt><dd>${n(a.entrance_door_width_m * 1000)} mm wide · ${n(a.entrance_threshold_m * 1000)} mm threshold</dd></div>
      <div><dt>Circulation target</dt><dd>${n(a.circulation_width_m * 100)} cm</dd></div>
      <div><dt>Stair</dt><dd>${a.stair && a.stair.present ? esc(a.stair.type.replace(/-/g, ' ')) + ' · ' + n(a.stair.width_m * 100) + ' cm wide' : 'None recorded'}</dd></div>
      <div><dt>Lift space reserved</dt><dd>${a.lift_reserve ? 'Yes' : 'No'}</dd></div>
      <div><dt>Path connection</dt><dd>${esc(a.path_connection)}</dd></div>
    </dl>
    <h3>Recorded accessibility issues</h3>
    ${accessIssues}
    <p class="small">${esc(a.standards)} ${esc(a.note)}</p>
  </section>

  <section class="assembly-section" aria-labelledby="review-title">
    <h2 id="review-title">Structural review register</h2>
    <p><strong>Model status: ${esc(review.model_status.replace(/-/g, ' '))}.</strong> ${esc(review.summary)} This register is generated from the geometry and the recorded review data. It is not an engineering assessment. The only status that can mean professional verification is one with a named reviewer, organisation, date, scope and document; automatic generation never assigns it.</p>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Structural review concerns"><table class="exposure-table"><caption>Structural concerns and their visible status.</caption><thead><tr><th scope="col">Concern</th><th scope="col">Status</th><th scope="col">Why it is flagged</th></tr></thead><tbody>${concernRows}</tbody></table></div>
    <p class="small">Do not read a <em>requires review</em> row as a defect, or a blank row as an approval. The register records what still needs professional work.</p>
  </section>

  <section class="assembly-section" aria-labelledby="assembly-title">
    <h2 id="assembly-title">Envelope assembly</h2>
    <p><strong>${esc((c.envelope && c.envelope.assembly) || 'unknown')}</strong> · version ${esc((c.envelope && c.envelope.version) || '—')}. The diagram is explanatory, not a construction detail; it is not code-compliant or moisture-safe without engineering review.</p>
    <img src="../../systems/wall-${esc(c.envelope.assembly)}.svg" width="1040" height="640" alt="Explanatory wall section for the ${esc(c.envelope.assembly)} assembly: steel container wall, air and vapour control, insulation, thermal break, ventilated cavity and cladding, with vegetation clearance." loading="eager" decoding="async">
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
    ${(() => { const sm = c.solar_array || (c.modules.find((m) => m.solar && m.solar.enabled) || c.modules[0]).solar; return `<p><strong>${sm.tilt_deg}° tilt</strong> · ${sm.azimuth_deg}° azimuth · ${esc(sm.season_mode)} strategy. ${esc(sm.note || '')}</p>${c.roof_form ? `<p class="small">Roof: one ${c.roof_form.pitch_deg}° ${c.roof_form.type.replace(/-/g, ' ')} roof${c.roof_form.type === 'gable' ? ' with a clear ridge' : ''}. Solar is mounted only on the south slope; the north slope has no array. Array azimuth is true south, independent of building rotation.</p>` : ''}<img src="../../systems/solar-${sm.tilt_deg}.svg" width="1040" height="400" alt="Explanatory solar section with a ${sm.tilt_deg} degree tilted array facing azimuth ${sm.azimuth_deg} degrees." loading="eager" decoding="async">`; })()}
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
      ${c.role === 'hamlet-selected' ? `<a class="action secondary" href="../../illustration/${esc(c.id)}/">Illustration package</a>` : ''}
      <a class="action secondary" href="../../residences/">Compare the six hamlet homes</a>
      <a class="action secondary" href="../../index.html">Back to the gallery</a>
    </div>
    <p class="small">Concept only. Not reviewed by an architect, engineer, building official or accessibility consultant. No construction, energy, code or cost claim.</p>
  </section>
</main>
<footer class="site-footer"><p><a href="../../../index.html">Containers Hamlet</a> · <a href="../../index.html">Design Lab</a> · <a href="../../LICENSE.txt">AGPL-3.0-or-later</a> · <a href="../../CONTENT-LICENSE.md">CC BY-SA 4.0 content</a></p></footer>
<script src="../../architecture.js"></script>
</body>
</html>`;
}
