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
    return `    <tr><th scope="row">${esc(r.name)}</th><td>${esc(r.use)}</td><td>${a2(r.shoreline_m)} m</td><td>${a2(r.wetland_m)} m</td><td>${a2(r.slope_pct)}%</td><td>${r.crane_reach_m == null ? '–' : `${a2(r.crane_reach_m)} m`}</td><td>${r.entrance_to_lane_m == null ? '–' : `${a2(r.entrance_to_lane_m)} m`}</td><td>${status}${moved}</td></tr>`;
  });
  const nb = site.no_build;
  return `<div class="table-wrap" role="region" aria-label="Siting checks" tabindex="0">
<table class="checks">
  <caption>Siting checks, computed from the site data. Limits: shoreline setback ${nb.shoreline_setback_m} m, wetland buffer ${nb.wetland_buffer_m} m, ground slope ${site.terrain.max_building_slope_pct}%, crane reach ${site.crane.max_reach_m} m, ramp foot to lane ${site.circulation.max_entrance_to_lane_m} m. All limits are placeholders.</caption>
  <thead><tr><th scope="col">Building</th><th scope="col">Use</th><th scope="col">To shoreline</th><th scope="col">To wetland</th><th scope="col">Ground slope</th><th scope="col">Crane reach</th><th scope="col">Ramp foot to lane</th><th scope="col">Result</th></tr></thead>
  <tbody>
${rows.join('\n')}
  </tbody>
</table>
</div>
<p class="small">Parcel area ${analysis.area_acres} acres (${analysis.area_ha} ha), computed from the boundary polygon. Distances are measured from the nearest part of each building, porch, ramp or trellis.</p>`;
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
