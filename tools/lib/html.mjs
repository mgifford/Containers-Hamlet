// HTML fragments generated from the data and injected into site/index.html
// between <!-- gen:name --> and <!-- /gen:name --> markers. MIT licence.
import { esc, m } from './svg.mjs';

const a2 = (v) => (Math.round(v * 10) / 10).toFixed(1);

export function replaceFragments(html, fragments) {
  let out = html;
  const missing = [];
  for (const [name, content] of Object.entries(fragments)) {
    const re = new RegExp(`(<!-- gen:${name} -->)[\\s\\S]*?(<!-- /gen:${name} -->)`);
    if (!re.test(out)) { missing.push(name); continue; }
    out = out.replace(re, (_, a, b) => `${a}\n${content}\n${b}`);
  }
  return { html: out, missing };
}

export function factsList(model) {
  const { meta: M, spec } = model;
  const modules = model.bays.filter((b) => b.type === 'container').length;
  const ramp = model.ramps[0];
  const wall = M.wall_layers.reduce((s, l) => s + l.thickness_m, 0) + M.ts + M.li;
  const rows = [
    ['Overall size', `${m(M.overall.length_m, 2)} × ${m(M.overall.width_m, 2)} m outside the rainscreen (${a2(M.footprint_m2)} m² footprint)`],
    ['Modules', `${modules} × ${esc(spec.module.type)}, ${m(M.L, 3)} × ${m(M.W, 3)} × ${m(M.H, 3)} m`],
    ['Clear floor area', `${a2(M.clear_floor_area_m2)} m² inside the lining, plus ${a2(M.porch_area_m2)} m² of porch and deck`],
    ['Clear height', `${m(M.clear_height_m, 2)} m in the modules${model.bays.some((b) => b.type === 'hall') ? `; ${m(model.bays.find((b) => b.type === 'hall').ceiling - M.FFL, 2)} m in the hall` : ''}`],
    ['Floor above grade', `${m(M.ffl_above_grade_m, 2)} m on piles${ramp ? `, so step-free access needs ${m(ramp.run_m, 2)} m of ramp at 1:${ramp.slope_ratio} per entrance` : ''}`],
    ['Exterior wall', `${Math.round(wall * 1000)} mm: lining, steel, ${Math.round(M.wall_layers[0].thickness_m * 1000)} mm external insulation, ventilated cavity, timber rainscreen`],
    ['Roof PV (concept)', `${M.pv.panels} modules, about ${M.pv.kwp} kWp, drawn flat; sizing needs measured solar resource and winter loads`],
  ];
  return `<dl class="facts">\n${rows.map(([k, v]) => `  <div><dt>${k}</dt><dd>${v}</dd></div>`).join('\n')}\n</dl>`;
}

export function roomsTable(model, caption) {
  const rows = model.rooms.map((r) => `    <tr><th scope="row">${esc(r.name)}</th><td>${m(r.clear_length_m, 2)} × ${m(r.clear_width_m, 2)} m</td><td>${a2(r.area_m2)} m²</td><td>${esc(r.use || '')}</td><td>${esc(r.accessibility || '')}</td></tr>`);
  return `<div class="table-wrap" role="region" aria-label="${esc(caption)}" tabindex="0">
<table>
  <caption>${esc(caption)}</caption>
  <thead><tr><th scope="col">Room</th><th scope="col">Clear size</th><th scope="col">Area</th><th scope="col">Use</th><th scope="col">Accessibility notes</th></tr></thead>
  <tbody>
${rows.join('\n')}
  </tbody>
</table>
</div>`;
}

export function drawingsBlock(id, name, sizes) {
  const views = [
    ['floor-plan', 'Floor plan', `${name} floor plan, north up, with rooms, doors, windows, porch and ramp. Room sizes are listed in the table below.`, 'Floor plan cut 1.2 m above the floor. Dimensions and openings need professional review.'],
    ['elevations', 'Elevations', `${name} south, north, east and west elevations: timber-clad modules on piles with solar panels, porch and ramp.`, 'Four elevations at the same scale as the plan. Not engineered.'],
    ['section', 'Envelope section', `${name} cross-section with a to-scale wall build-up: lining, steel, external insulation, ventilated cavity and timber rainscreen.`, 'Section and wall build-up. Not a specified assembly; not for construction.'],
  ];
  const radios = views.map(([v, label], i) => `    <label><input type="radio" name="${id}-view" value="${v}"${i === 0 ? ' checked' : ''}> ${label}</label>`).join('\n');
  const figs = views.map(([v, label, alt, cap]) => {
    const s = sizes[`${v}.svg`];
    return `  <figure class="drawing" data-view="${v}" id="${id}-${v}">
    <img src="models/${id}/${v}.svg" width="${s.width}" height="${s.height}" alt="${esc(alt)}" loading="lazy" decoding="async">
    <figcaption>${esc(cap)} <a href="models/${id}/${v}.svg">Open full size<span class="visually-hidden">: ${esc(name)} ${label.toLowerCase()}</span></a> (SVG, ${s.kb} KB).</figcaption>
  </figure>`;
  }).join('\n');
  return `<fieldset class="segmented" data-enhance hidden>
    <legend>Drawing</legend>
${radios}
  </fieldset>
${figs}`;
}

export function siteChecks(site, analysis) {
  const rows = analysis.buildings.map((r) => {
    const status = r.ok ? '<span class="ok">Pass</span>' : '<span class="fail">Fails</span>';
    const moved = r.moved ? `<br><span class="note">${esc(r.moved)}</span>` : '';
    const rock = r.rock_m == null ? '–' : `${a2(r.rock_m)} m`;
    return `    <tr><th scope="row">${esc(r.name)}</th><td>${esc(r.use)}</td><td>${a2(r.shoreline_m)} m</td><td>${a2(r.wetland_m)} m</td><td>${a2(r.natural_slope_pct)}%</td><td>${a2(r.pad.max_m)} m</td><td>${rock}</td><td>${r.crane_reach_m == null ? '–' : `${a2(r.crane_reach_m)} m`}</td><td>${r.entrance_to_lane_m == null ? '–' : `${a2(r.entrance_to_lane_m)} m`}</td><td>${status}${moved}</td></tr>`;
  });
  const nb = site.no_build;
  const padLimit = (site.terrain.building_pads && site.terrain.building_pads.max_cut_fill_m) || 1.6;
  return `<div class="table-wrap" role="region" aria-label="Siting checks" tabindex="0">
<table class="checks">
  <caption>Siting checks, computed from the site data. Limits: shoreline setback ${nb.shoreline_setback_m} m, wetland buffer ${nb.wetland_buffer_m} m, rock buffer ${nb.rock_buffer_m} m, drainage buffer ${nb.drainage_buffer_m} m, natural ground slope ${site.terrain.max_building_slope_pct}%, building bench cut or fill ${padLimit} m, crane reach ${site.crane.max_reach_m} m, ramp foot to an emergency or access lane ${site.circulation.max_entrance_to_lane_m} m. All limits are placeholders.</caption>
  <thead><tr><th scope="col">Building</th><th scope="col">Use</th><th scope="col">To shoreline</th><th scope="col">To wetland</th><th scope="col">Natural slope</th><th scope="col">Bench cut/fill</th><th scope="col">To rock</th><th scope="col">Crane reach</th><th scope="col">Ramp foot to lane</th><th scope="col">Result</th></tr></thead>
  <tbody>
${rows.join('\n')}
  </tbody>
</table>
</div>
<p class="small">Parcel area ${analysis.area_acres} acres (${analysis.area_ha} ha), computed from the boundary polygon. ${analysis.potential_areas.count} illustrative potential building cells remain outside the buffers, water, rocks, paths and existing buildings. Distances are measured from the nearest part of each building, porch, ramp or trellis. Terrain seed ${analysis.seed}; elevation grid hash ${analysis.terrain_hash}.</p>`;
}

export function passportTables(models) {
  return models.map((model) => {
    const spec = model.spec;
    const rows = (spec.material_passport || []).map((p) => {
      const q = model.quantities[p.material_key];
      const vol = q ? `${q.volume_m3.toFixed(2)} m³` : '–';
      return `    <tr><th scope="row">${esc(p.component)}</th><td>${esc(p.material)}</td><td>${vol}</td><td>${esc(p.source)}</td><td>${esc(p.condition_assessment)}</td><td>${esc(p.connections)} ${esc(p.disassembly)}</td><td>${esc(p.end_of_life)}</td><td>${esc(p.documentation)}</td></tr>`;
    });
    const cap = `${spec.short_name || spec.name} material passport (draft)`;
    return `<div class="table-wrap" role="region" aria-label="${esc(cap)}" tabindex="0">
<table class="passport">
  <caption>${esc(cap)}. Volumes are summed from the model geometry for every part using that material, rounded; they are not a bill of quantities.</caption>
  <thead><tr><th scope="col">Component</th><th scope="col">Material</th><th scope="col">Modelled volume</th><th scope="col">Source</th><th scope="col">Condition assessment</th><th scope="col">Connections and disassembly</th><th scope="col">End of life</th><th scope="col">Documentation</th></tr></thead>
  <tbody>
${rows.join('\n')}
  </tbody>
</table>
</div>`;
  }).join('\n');
}

export function provenanceList(models, site) {
  const item = (name, p) => `  <div><dt>${esc(name)}</dt><dd>${esc(p.source)} ${esc(p.method || '')} Revision ${esc(p.revision)}. Verification: ${esc(p.verification || 'none')}.</dd></div>`;
  return `<dl class="facts">\n${models.map((md) => item(md.spec.short_name || md.spec.name, md.spec.provenance)).join('\n')}\n${item('Site', Object.assign({ method: 'Terrain, buffers, contours and checks are computed by tools/build.mjs.', verification: 'none' }, site.provenance))}\n</dl>`;
}

export function reviewsTables(models) {
  return models.map((model) => {
    const spec = model.spec;
    const cap = `${spec.short_name || spec.name}: reviews required before anything is built`;
    const rows = (spec.reviews_required || []).map((r) => `    <tr><th scope="row">${esc(r.topic)}</th><td>${esc(r.reviewer)}</td><td>${esc(r.status)}</td></tr>`);
    return `<div class="table-wrap" role="region" aria-label="${esc(cap)}" tabindex="0">
<table>
  <caption>${esc(cap)}</caption>
  <thead><tr><th scope="col">Topic</th><th scope="col">Reviewer</th><th scope="col">Status</th></tr></thead>
  <tbody>
${rows.join('\n')}
  </tbody>
</table>
</div>`;
  }).join('\n');
}

export function downloadsList(groups, sizes) {
  return groups.map(([heading, files]) => `<h3>${esc(heading)}</h3>
<ul class="downloads">
${files.map(([path, label, fmtName]) => `  <li><a href="${path}" download>${esc(label)}</a> <span class="meta">(${fmtName}, ${sizes[path]} KB)</span></li>`).join('\n')}
</ul>`).join('\n');
}

/* ---------------- homes, views and landscape fragments ---------------- */

const useLabel = (use) => ({
  permanent: 'Permanent home',
  seasonal: 'Seasonal home',
  'community rental': 'Community rental home',
  shared: 'Shared community building',
}[use] || use);

function targetName(site, target) {
  if (!target) return 'the forest';
  if (target.type === 'lake') return site.lake.name;
  if (target.type === 'wetland') return site.wetland.name;
  if (target.type === 'clearing') {
    const c = (site.clearings || []).find((x) => x.id === target.id);
    return c ? c.name : target.id;
  }
  if (target.type === 'landmark') {
    const l = (site.landmarks || []).find((x) => x.id === target.id);
    return l ? l.name : target.id;
  }
  return 'the landscape';
}

export function homeTabs(site) {
  const items = site.buildings.map((b, i) => {
    const label = b.id === 'lodge' ? 'Common lodge' : `${b.name} · ${b.short_name}`;
    return `    <label><input type="radio" name="home-choice" value="${esc(b.id)}"${i === 0 ? ' checked' : ''}> ${esc(label)}</label>`;
  });
  return `<fieldset class="segmented home-tabs" data-enhance hidden>
    <legend>Choose a home</legend>
${items.join('\n')}
  </fieldset>`;
}

export function homeDossiers(site, analysis, models, diagrams) {
  return `<div class="home-dossiers">\n${site.buildings.map((b) => {
    const r = analysis.buildings.find((x) => x.id === b.id);
    const model = models[b.model];
    const porch = model && model.porches.find((p) => p.screened);
    const views = r && r.views;
    const v = b.views || {};
    const target = v.main && v.main.target;
    const canopy = views ? views.canopy_description : 'not assessed';
    const neighbours = views && views.neighbours_in_view.length
      ? `Inside the 120 m view cone: ${views.neighbours_in_view.map((n) => `${n.name} at ${a2(n.distance_m)} m, ${a2(n.off_axis_deg)}° off the view axis`).join('; ')}. These are approximate bearings, not a visibility or privacy rating.`
      : 'No other building lies inside the principal 120 m view cone. This is a geometric observation, not a guarantee of privacy.';
    const porchText = porch
      ? `${m(porch.x1 - porch.x0, 2)} × ${m(porch.y1 - porch.y0, 2)} m screened porch on the ${esc(porch.side)} side of the building, with its own frame and piles.`
      : 'No screened porch is defined in this concept.';
    const status = r && r.ok ? '<span class="ok">All illustrative siting checks pass</span>' : '<span class="fail">One or more siting checks fail</span>';
    const rows = [
      ['Setting', `${useLabel(b.use)} using the ${esc(model ? model.spec.name : b.model)} concept. ${esc(b.clearing_note || '')}`],
      ['Orientation', `${esc((b.orientation && b.orientation.reason) || '')} The model places the principal ${esc(r ? r.principal_facade : 'porch')} facade at ${r ? a2(r.principal_azimuth_deg) : '–'}°.`],
      ['Main view', `${esc(v.main ? v.main.description : '')} The nearest ${esc(targetName(site, target))} lies ${views ? a2(views.main_distance_m) : '–'} m away at a bearing of ${views ? a2(views.main_bearing_deg) : '–'}°. ${esc(canopy)}.`],
      ['Second view', esc(v.secondary ? v.secondary.description : '')],
      ['Nearby homes', `${esc(v.nearby || '')} ${neighbours}`],
      ['Path and entry', esc(v.path || '')],
      ['Winter', esc(v.winter || '')],
      ['Screened outdoor room', `${porchText} This is part of the architectural concept, not an addition.`],
      ['Design note', esc(b.design_note || '')],
      ['Siting', `${status}: ${r ? `${a2(r.shoreline_m)} m from the shoreline, ${a2(r.wetland_m)} m from the wetland, ${a2(r.pad.max_m)} m maximum bench cut or fill, ${a2(r.crane_reach_m)} m crane reach, ${a2(r.entrance_to_lane_m)} m from ramp foot to lane` : 'not assessed'}. All limits are placeholders; see the siting table.`],
    ];
    return `  <article class="home" data-home="${esc(b.id)}" id="home-${esc(b.id)}">
    <header class="home-head">
      <p class="eyebrow">${esc(useLabel(b.use))} · ${esc(model ? model.spec.name : b.model)} concept</p>
      <h3>${esc(b.name)} <span class="home-name">· ${esc(b.short_name || '')}</span></h3>
      <p class="home-lede">${esc(b.character || '')}</p>
    </header>
    <div class="home-grid">
      <figure class="view-diagram">
${diagrams[b.id] || ''}
        <figcaption>View diagram for ${esc(b.name)}. North is up; the shaded wedge shows the principal view direction, not a guaranteed sightline.</figcaption>
      </figure>
      <div class="home-brief">
        <dl class="home-facts">
${rows.map(([k, val]) => `          <div><dt>${k}</dt><dd>${val}</dd></div>`).join('\n')}
        </dl>
        <p class="home-actions"><button type="button" data-select-home="${esc(b.id)}">Show on the map</button> <a href="#${b.id === 'lodge' ? 'lodge' : 'cabin'}">${b.id === 'lodge' ? 'Lodge drawings and rooms' : 'Cabin concept drawings'}</a></p>
      </div>
    </div>
  </article>`;
  }).join('\n')}\n</div>`;
}

export function landscapeFacts(site, analysis) {
  const homes = site.buildings.filter((b) => b.id !== 'lodge').length;
  const rows = [
    ['Parcel', `${analysis.area_acres} acres (${analysis.area_ha} ha), computed from the fictional boundary polygon`],
    ['Terrain', `Lake level ${site.terrain.lake_level_m} m, ${site.terrain.contour_interval_m} m contours, seeded roughness and small building benches. Seed ${analysis.seed}; elevation grid hash ${analysis.terrain_hash}`],
    ['Water', `${esc(site.lake.name)}: ${esc(site.lake.type)}. The shoreline is illustrative and is not a surveyed water's edge`],
    ['Wetland', `${esc(site.wetland.name)}, seasonally connected to the lake by two drainage channels`],
    ['Forest', `${esc(site.woodland.name)} with four indicative stands, rock outcrops and natural clearings`],
    ['Homes and lodge', `${homes} homes and one common lodge, placed on small benches and individually oriented`],
    ['Constraints', `${site.no_build.shoreline_setback_m} m shoreline and ${site.no_build.wetland_buffer_m} m wetland buffers, ${site.no_build.drainage_buffer_m} m drainage buffer and ${site.no_build.rock_buffer_m} m rock buffer. All are illustrative planning assumptions, not legal setbacks`],
    ['Access', `${site.circulation.parking.spaces} shared parking spaces (${site.circulation.parking.accessible_spaces} accessible), one accessible drop-off, walking paths and one narrow emergency, construction and maintenance track. No private driveways`],
    ['Unbuilt areas', `${analysis.potential_areas.count} illustrative 8 m cells meet the project constraints outside the buffers, water, rocks, paths and buildings. They are not available lots`],
  ];
  return `<dl class="facts landscape-facts">\n${rows.map(([k, v]) => `  <div><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join('\n')}\n</dl>`;
}

export function modelCards(models, images) {
  const cards = models.map((model) => {
    const spec = model.spec;
    const porch = model.porches.find((p) => p.screened);
    return `<article class="model-card">
      <div class="model-card-image">${images[model.spec.id] || ''}</div>
      <div class="model-card-body">
        <p class="eyebrow">${model.spec.id === 'lodge' ? 'Shared building concept' : 'Housing concept'}</p>
        <h3>${esc(spec.name)}</h3>
        <p>${esc(spec.summary || '')}</p>
        <ul class="plain-list">
          <li>${a2(model.meta.clear_floor_area_m2)} m² clear floor area inside the lining${porch ? `, plus a ${m(porch.x1 - porch.x0, 2)} × ${m(porch.y1 - porch.y0, 2)} m screened porch` : ''}.</li>
          <li>${model.bays.filter((b) => b.type === 'container').length} reused container module${model.bays.filter((b) => b.type === 'container').length === 1 ? '' : 's'}${model.bays.some((b) => b.type === 'hall') ? ' and a timber hall' : ''}.</li>
          <li>Continuous external insulation, ventilated rainscreen and a replaceable envelope. Concept only.</li>
        </ul>
        <p><a href="#${spec.id === 'lodge' ? 'lodge' : 'cabin'}">Drawings, rooms and downloads</a></p>
      </div>
    </article>`;
  });
  return `<div class="model-cards">\n${cards.join('\n')}\n</div>`;
}
