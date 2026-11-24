// Hamlet-wide residence comparison. Code: MIT. Generated content: CC BY-SA 4.0.
import { designShellNav } from './design-nav.mjs';
const esc = (v) => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const n = (v) => (Math.round(v * 10) / 10).toString();

function statusCount(profile) {
  return profile.structural_review.concerns.filter((c) => c.status === 'requires-review').length;
}

function row(profile, concept) {
  const a = profile.accessibility_profile;
  const met = profile.metrics;
  const sus = profile.sustainability;
  return `<tr data-home="${esc(profile.id)}" data-storeys="${profile.storeys}" data-arrangement="${esc(profile.architecture.arrangement)}" data-name="${esc(profile.name)}" data-floor="${met.grossFloorArea_m2}" data-cover="${met.groundCoverage_m2}" data-height="${met.buildingHeight_m}" data-review="${statusCount(profile)}">
    <th scope="row"><a href="../architecture/${esc(profile.id)}/">${esc(profile.name)}</a><br><span class="small">${esc(concept.architecture && concept.architecture.family || profile.architecture.arrangement)}</span></th>
    <td>${esc(profile.architecture.arrangement.replace(/-/g, ' '))}<br><span class="small">${esc(profile.architecture.footprint_type.replace(/-/g, ' '))}</span></td>
    <td>${profile.storeys}</td>
    <td>${profile.container_count} × ${esc(profile.types.join(' + '))}</td>
    <td>${n(met.grossFloorArea_m2)}</td>
    <td>${n(met.groundCoverage_m2)}</td>
    <td>${esc(profile.architecture.roof_type.replace(/-/g, ' '))}<br><span class="small">${n(met.buildingHeight_m)} m to roof</span></td>
    <td>${a.ground_floor_essential_functions ? 'Yes' : 'No / not recorded'}</td>
    <td>${esc(a.classification.replace(/-/g, ' '))}<br><span class="small">${a.stair && a.stair.present ? 'Stair; no lift space reserved' : 'No stair'}</span></td>
    <td>${statusCount(profile)} of ${profile.structural_review.concerns.length}<br><span class="small">${esc(profile.structural_review.model_status.replace(/-/g, ' '))}</span></td>
    <td>${esc((sus.qualitative.tradeoffs[0] || 'No specific sustainability trade-off recorded.'))}</td>
    <td>Concept only<br><span class="small">not professionally reviewed</span></td>
  </tr>`;
}

function card(profile, concept) {
  const met = profile.metrics;
  const a = profile.accessibility_profile;
  const review = profile.structural_review;
  const sus = profile.sustainability;
  const concerns = review.concerns.filter((c) => c.status === 'requires-review').slice(0, 4);
  return `<article class="concept-card residence-card">
    <div class="concept-card-body">
      <span class="concept-badge hamlet">Hamlet selected · ${profile.storeys === 1 ? 'Single storey' : 'Two storeys'}</span>
      <h3><a href="../architecture/${esc(profile.id)}/">${esc(profile.name)}</a></h3>
      <p class="tagline">${esc(concept.tagline)}</p>
      <dl class="concept-facts">
        <div><dt>Family</dt><dd>${esc(concept.architecture && concept.architecture.family || profile.architecture.arrangement)}</dd></div>
        <div><dt>Massing</dt><dd>${esc(profile.architecture.arrangement.replace(/-/g, ' '))} · ${esc(profile.architecture.footprint_type.replace(/-/g, ' '))} · ${esc(profile.architecture.roof_type)} roof</dd></div>
        <div><dt>Floor area</dt><dd>${n(met.grossFloorArea_m2)} m² gross · ${n(met.groundCoverage_m2)} m² ground coverage · ${n(met.buildingHeight_m)} m high</dd></div>
        <div><dt>Accessibility</dt><dd>${esc(a.label)}</dd></div>
        <div><dt>Structural review</dt><dd>${review.concerns.filter((c) => c.status === 'requires-review').length} concern${review.concerns.filter((c) => c.status === 'requires-review').length === 1 ? '' : 's'} need review. ${esc(review.summary)}</dd></div>
        <div><dt>Sustainability evidence</dt><dd>${esc(sus.qualitative.strengths[0] || 'No specific strength recorded.')} ${esc(sus.qualitative.tradeoffs[0] || '')}</dd></div>
        ${profile.energy ? `<div><dt>Energy</dt><dd>${profile.energy.panels} panels, ${n(profile.energy.capacity_kwp)} kWp; ${n(profile.energy.generation.winter_daily_kwh)} kWh/day modelled winter generation; ${n(profile.energy.consumption.winter_daily_kwh)} kWh/day winter use; ${n(profile.energy.battery.nominal_kwh, 0)} kWh battery. <a href="../energy/">Explore this system</a>.</dd></div>` : ''}
      </dl>
      ${concerns.length ? `<details><summary>Why this home needs structural review</summary><ul>${concerns.map((c) => `<li><strong>${esc(c.label)}:</strong> ${esc(c.notes)}</li>`).join('')}</ul></details>` : ''}
      <div class="card-actions">
        <a class="action" href="../architecture/${esc(profile.id)}/">Plans, elevations and review</a>
        <a class="action secondary" href="../editor/?preset=${esc(profile.id)}">Open in the editor</a>
      </div>
      <p class="small">Concept only. Not engineered, permit-ready or professionally reviewed.</p>
    </div>
  </article>`;
}

function similarityTable(profiles, similarities) {
  const rows = [];
  for (let i = 0; i < profiles.length; i++) {
    for (let j = i + 1; j < profiles.length; j++) {
      const a = profiles[i], b = profiles[j];
      const match = similarities.find((s) => s.homes.includes(a.id) && s.homes.includes(b.id));
      rows.push({ a, b, score: match ? match.score : null, matching: match ? match.matchingFeatures : [], proportion: match ? match.proportionMatch : false });
    }
  }
  rows.sort((x, y) => (y.score || 0) - (x.score || 0));
  return `<div class="table-wrap" tabindex="0" role="region" aria-label="Architectural similarity table"><table id="similarity-table"><caption>Rule-based architectural similarity. A high score is a prompt to inspect, not a finding that the design is bad.</caption><thead><tr><th scope="col">Home</th><th scope="col">Home</th><th scope="col">Similarity</th><th scope="col">Matching primary features</th><th scope="col">Flag</th></tr></thead><tbody>
    ${rows.map((r) => `<tr${r.score >= 0.8 ? ' class="duplicate-flag"' : ''}><th scope="row">${esc(r.a.name)}</th><td>${esc(r.b.name)}</td><td>${r.score == null ? 'not comparable' : Math.round(r.score * 100) + '%'}</td><td>${esc(r.matching.join(', ') || 'none')}${r.proportion ? ', similar proportions' : ''}</td><td>${r.score >= 0.8 ? '<strong>Near-duplicate primary characteristics; inspect before accepting.</strong>' : 'Below the 0.8 heuristic'}</td></tr>`).join('')}
  </tbody></table></div>`;
}

function altRow(profile, altProfile, concept) {
  if (!altProfile) return '';
  const m = profile.metrics, am = altProfile.metrics;
  const aa = altProfile.accessibility_profile, a = profile.accessibility_profile;
  const deltaCover = am.groundCoverage_m2 - m.groundCoverage_m2;
  const deltaHeight = am.buildingHeight_m - m.buildingHeight_m;
  return `<tr><th scope="row">${esc(profile.name)}</th><td>${profile.storeys} storeys<br>${n(m.grossFloorArea_m2)} m²</td><td>${n(m.groundCoverage_m2)} m²</td><td>${n(m.buildingHeight_m)} m</td><td>${esc(a.classification.replace(/-/g, ' '))}</td><td>${altProfile.storeys} storey<br>${n(am.grossFloorArea_m2)} m²</td><td>${n(am.groundCoverage_m2)} m² <span class="small">(${deltaCover >= 0 ? '+' : ''}${n(deltaCover)} m²)</span></td><td>${n(am.buildingHeight_m)} m <span class="small">(${deltaHeight >= 0 ? '+' : ''}${n(deltaHeight)} m)</span></td><td>${esc(aa.classification.replace(/-/g, ' '))}</td></tr>`;
}

export function residencesPage(profiles, concepts, alternatives, siteReconciliation, heatPumpByHome = {}) {
  const byId = Object.fromEntries(concepts.map((c) => [c.id, c]));
  const similarities = [];
  for (let i = 0; i < profiles.length; i++) {
    for (let j = i + 1; j < profiles.length; j++) {
      const fa = profiles[i].architecture, fb = profiles[j].architecture;
      const keys = ['storeys', 'arrangement', 'footprint_type', 'roof_type', 'entrance_orientation', 'circulation_type'];
      const matching = keys.filter((k) => String(fa[k]) === String(fb[k]));
      const proportion = Math.abs(fa.proportion - fb.proportion) <= 0.35;
      const score = (matching.length + (proportion ? 1 : 0)) / (keys.length + 1);
      similarities.push({ homes: [profiles[i].id, profiles[j].id], score: Math.round(score * 1000) / 1000, matchingFeatures: matching, proportionMatch: proportion });
    }
  }
  const altProfiles = profiles.filter((p) => p.storeys > 1 && alternatives[p.id]).map((p) => alternatives[p.id]);
  const tableRows = profiles.map((p, i) => row(p, byId[p.id] || concepts.find((c) => c.id === p.id))).join('');
  const cards = profiles.map((p) => card(p, byId[p.id] || concepts.find((c) => c.id === p.id))).join('');
  return `<!doctype html>
<html lang="en-CA">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Compare the six Containers Hamlet residences: storeys, massing, floor area, ground coverage, roof, accessibility, structural review concerns and sustainability assumptions. Sort and filter the accessible table.">
  <title>Compare the six hamlet residences · Containers Hamlet Design Lab</title>
  <link rel="stylesheet" href="../../../style.css">
  <link rel="stylesheet" href="../style.css">
  <link rel="stylesheet" href="../compare.css">
  <link rel="stylesheet" href="residences.css">
  <link rel="icon" href="../../../assets/favicon.svg" type="image/svg+xml">
</head>
<body class="lab-page">
<a class="skip" href="#main">Skip to content</a>
${designShellNav(2, 'residences')}
<main id="main" class="lab-main">
  <p class="eyebrow">Hamlet-wide comparison</p>
  <h1>Six homes, one construction language</h1>
  <p class="lede">The six residences are deliberately different in storeys, massing, footprint, roof, entrance, circulation and relationship to the garden. Three are single-storey and three are two-storey. They share construction principles: reused containers, a drained and ventilated exterior assembly, independent foundations, and a design review before construction. Architectural diversity is not achieved by changing paint colours.</p>
  <p class="notice"><strong>Concept only.</strong> Nothing on this page is engineered, permit-ready, costed or professionally reviewed. Areas are nominal geometry. Sustainability evidence is qualitative and identifies missing inputs rather than inventing carbon, energy or cost results.</p>

  <form class="compare-controls" id="residence-controls" aria-label="Sort and filter the residence table">
    <label>Sort by
      <select id="sort-residences">
        <option value="name">Home name</option>
        <option value="storeys">Storey count</option>
        <option value="floor">Gross floor area</option>
        <option value="cover">Ground coverage</option>
        <option value="height">Building height</option>
        <option value="review">Structural review concerns</option>
      </select>
    </label>
    <label>Storeys
      <select id="filter-storeys">
        <option value="all">All homes</option>
        <option value="1">Single storey</option>
        <option value="2">Two storeys</option>
      </select>
    </label>
    <label>Arrangement
      <select id="filter-arrangement">
        <option value="all">All arrangements</option>
        <option value="single">Single module</option>
        <option value="parallel-pair">Parallel pair</option>
        <option value="l-shape">L-shape</option>
        <option value="offset-stack">Offset stack</option>
        <option value="perpendicular-stack">Perpendicular stack</option>
        <option value="aligned-stack">Aligned stack</option>
      </select>
    </label>
    <button type="button" id="apply-residences">Apply</button>
    <button type="button" id="reset-residences" class="secondary">Reset</button>
  </form>
  <p class="status" id="residence-status" role="status" aria-live="polite">Showing all six residences. Sort and filter controls update the table without hiding the accessible table view.</p>
  <noscript><p class="notice">JavaScript is off. The complete table and all six cards are shown in source order; sorting and filtering need JavaScript.</p></noscript>

  <section aria-labelledby="table-title">
    <h2 id="table-title">All six residences</h2>
    <p id="residence-table-desc" class="small">Gross floor area counts nominal module areas plus glazed links. Ground coverage is the projected union of the modules and glazed links. Height is measured to the roof. No cost or carbon figure is included; the separate energy table below records the modelled electrical assumptions.</p>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Six residences comparison table"><table id="residence-table" aria-describedby="residence-table-desc">
      <caption>Six hamlet-selected residences</caption>
      <thead><tr><th scope="col">Home</th><th scope="col">Massing</th><th scope="col">Storeys</th><th scope="col">Modules</th><th scope="col">Gross m²</th><th scope="col">Ground m²</th><th scope="col">Roof / height</th><th scope="col">Ground-floor living</th><th scope="col">Accessibility</th><th scope="col">Structural review</th><th scope="col">Sustainability assumption</th><th scope="col">Maturity</th></tr></thead>
      <tbody>${tableRows}</tbody>
    </table></div>
  </section>

  <section aria-labelledby="energy-title" id="energy">
    <h2 id="energy-title">Energy, solar and battery comparison</h2>
    <p>The six homes have <strong>${profiles.reduce((t, p) => t + (p.energy ? p.energy.panels : 0), 0)} panels and ${n(profiles.reduce((t, p) => t + (p.energy ? p.energy.capacity_kwp : 0), 0))} kWp</strong> in the reference configuration, not a target for any one home. Consumption is calculated from each home's documented equipment list, not from floor area. Generation is a monthly estimate with modelled shading, snow availability and system losses. Read the intended occupancy pattern and the limitation column before comparing capacities.</p>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Residential energy comparison table">
      <table id="energy-table">
        <caption>Solar, battery and seasonal electricity assumptions for the six residences. A smaller system serving a smaller home is not automatically worse than a larger system. The modelled winter shortfall is shown rather than hidden.</caption>
        <thead><tr><th scope="col">Home</th><th scope="col">Occupants / pattern</th><th scope="col">Panels</th><th scope="col">kWp</th><th scope="col">Panel area</th><th scope="col">Mounting</th><th scope="col">Summer generation</th><th scope="col">Winter generation</th><th scope="col">Summer use</th><th scope="col">Winter use</th><th scope="col">Battery nominal / usable</th><th scope="col">Essential autonomy</th><th scope="col">Ordinary autonomy</th><th scope="col">Five-day cloudy shortfall</th><th scope="col">Suitable patterns</th><th scope="col">Key limitation</th></tr></thead>
        <tbody>${profiles.map((p) => {
          const e = p.energy;
          if (!e) return `<tr><th scope="row">${esc(p.name)}</th><td colspan="15">No residential energy model recorded.</td></tr>`;
          return `<tr data-energy-home="${esc(p.id)}" data-panels="${e.panels}" data-kwp="${e.capacity_kwp}">
            <th scope="row"><a href="../architecture/${esc(p.id)}/">${esc(p.name)}</a></th>
            <td>${esc(String(e.occupancy.household_size))}${e.occupancy.max_occupants ? '–' + esc(String(e.occupancy.max_occupants)) : ''}<br><span class="small">${esc(e.occupancy.pattern.replace(/-/g, ' '))}</span></td>
            <td>${e.panels}</td>
            <td>${n(e.capacity_kwp)}</td>
            <td>${n(e.panel_area_m2)} m²</td>
            <td>${esc((e.mounting || []).map((m) => m.replace(/-/g, ' ')).join(' + '))}</td>
            <td>${n(e.generation.summer_daily_kwh)} kWh/day</td>
            <td>${n(e.generation.winter_daily_kwh)} kWh/day</td>
            <td>${n(e.consumption.summer_daily_kwh)} kWh/day</td>
            <td>${n(e.consumption.winter_daily_kwh)} kWh/day<br><span class="small">${n(e.consumption.winter_full_time_daily_kwh)} full-time</span></td>
            <td>${n(e.battery.nominal_kwh, 0)} / ${n(e.battery.usable_kwh)} kWh</td>
            <td>${e.autonomy.essential_days == null ? '—' : n(e.autonomy.essential_days) + ' days'}</td>
            <td>${e.autonomy.ordinary_days == null ? '—' : n(e.autonomy.ordinary_days) + ' days'}</td>
            <td>${n(e.supplementary_daily_kwh)} kWh/day</td>
            <td>${esc((e.suitable_patterns || []).join('; '))}</td>
            <td>${esc((e.limitations && e.limitations[0]) || 'No specific limitation recorded.')}</td>
          </tr>`;
        }).join('')}</tbody>
      </table>
    </div>
    <p class="small">Autonomy is calculated without solar input. Ordinary autonomy keeps the essential reserve intact; essential autonomy can use the whole usable battery. A five-day cloudy period is a synthetic stress test, not a weather forecast. <a href="../energy/">Open the interactive energy explorer</a> to change one home or one assumption at a time.</p>
  </section>

  <section aria-labelledby="heat-pump-title" id="heat-pumps">
    <h2 id="heat-pump-title">Heat pumps: the additional burden</h2>
    <p>A heat pump is additional to the household load, not a replacement for it. The table keeps the existing reference array and battery fixed and shows what full-time winter heating would require. It is a preliminary assessment, not an HVAC design.</p>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Heat-pump comparison for the six residences">
      <table id="heat-pump-table">
        <caption>Full-time air-source heat-pump impacts. Additional panels are winter-critical; additional battery is for three days of heat-pump electricity. The existing array is not resized.</caption>
        <thead><tr><th scope="col">Home</th><th scope="col">Design heat load (−30 °C)</th><th scope="col">Annual heating</th><th scope="col">ASHP electricity (heating)</th><th scope="col">Additional winter panels</th><th scope="col">Total required panels</th><th scope="col">Additional battery (3 days)</th><th scope="col">Total battery</th><th scope="col">Combined peak</th><th scope="col">Assessment</th></tr></thead>
        <tbody>${profiles.map((p) => {
          const hp = heatPumpByHome[p.id];
          if (!hp) return `<tr><th scope="row">${esc(p.name)}</th><td colspan="9">No heat-pump assessment recorded.</td></tr>`;
          const panels = hp.additional.panels_ashp, bat = hp.additional.battery_ashp, inv = hp.additional.inverter;
          const assessment = hp.id === 'hamlet-accessible-garden-home'
            ? 'Needs a specific solution: wood handling cannot be assumed. A shared or community heating service and a larger electrical supply should be evaluated.'
            : 'Not recommended as full-time off-grid electric heating. Use a hybrid wood/heat-pump or surplus-solar strategy, and improve the envelope first.';
          return `<tr data-hp-home="${esc(p.id)}">
            <th scope="row"><a href="../architecture/${esc(p.id)}/">${esc(p.name)}</a></th>
            <td>${n(hp.monthly.design_heat_load_w / 1000)} kW</td>
            <td>${n(hp.monthly.annual_heating_kwh, 0)} kWh</td>
            <td>${n(hp.ashp.monthly.annual_heating_electric_kwh, 0)} kWh<br><span class="small">+ ${n(hp.ashp.monthly.annual_cooling_electric_kwh, 0)} cooling</span></td>
            <td>${panels.additional_panels}</td>
            <td>${panels.total_required_winter}</td>
            <td>${bat.three_day_kwh} kWh</td>
            <td>${bat.total_nominal_three_day_kwh} kWh</td>
            <td>${n(inv.total_peak_kw)} kW</td>
            <td>${esc(assessment)}</td>
          </tr>`;
        }).join('')}</tbody>
      </table>
    </div>
    <p class="small">The panel count is driven by the winter-critical month, not the annual average. A larger summer array does not solve a cold, cloudy week. <a href="../heat-pumps/">Open the heat-pump assessment</a> for the temperature scenarios, strategies, passive alternatives and interactive explorer.</p>
  </section>

  <section aria-labelledby="alternatives-title">
    <h2 id="alternatives-title">Stacked and single-storey alternatives</h2>
    <p>For each two-storey home, the table below shows a <strong>derived single-storey translation</strong>: the same modules and openings moved to the ground beside the stack, with the stair and stacking structure removed. It is a geometry comparison, not a redesign. It shows why a smaller footprint is not the same as a smaller environmental or accessibility burden.</p>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Stacked and single-storey alternatives table"><table id="alternatives-table"><caption>Two-storey designs and a geometry-only single-storey translation with approximately the same gross floor area.</caption><thead><tr><th scope="col">Home</th><th scope="col">Stacked</th><th scope="col">Stacked ground cover</th><th scope="col">Stacked height</th><th scope="col">Stacked access</th><th scope="col">Single-storey translation</th><th scope="col">Translation ground cover</th><th scope="col">Translation height</th><th scope="col">Translation access</th></tr></thead><tbody>
      ${profiles.filter((p) => p.storeys > 1).map((p) => altRow(p, alternatives[p.id], byId[p.id] || concepts.find((c) => c.id === p.id))).join('')}
    </tbody></table></div>
    <p class="small">A single-storey translation usually increases ground coverage and roof area while removing stairs and upper-floor access barriers. It can also increase foundation and site disturbance. The model does not calculate which is better; it exposes the trade.</p>
  </section>

  <section aria-labelledby="site-reconciliation-title" id="site-reconciliation">
    <h2 id="site-reconciliation-title">Site and residence reconciliation</h2>
    <p>The site plan keeps its fictional parcel, clearing and path geometry. The selected Design Lab models have been compared with the older simplified site buildings so differences are visible rather than silently overwritten. Two homes are designed as accessible demonstrations; the others are ordinary concept homes and their bathrooms are not held to accessible-washroom targets. A negative clearance margin or an entrance/path mismatch is an unresolved site-placement conflict.</p>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Design Lab and site geometry reconciliation table"><table id="site-reconciliation-table"><caption>Selected residence geometry compared with the recorded site building. Footprint and height are derived from the Design Lab model; the site footprint is the older site model.</caption><thead><tr><th scope="col">Site</th><th scope="col">Selected design</th><th scope="col">Design footprint</th><th scope="col">Site footprint</th><th scope="col">Difference</th><th scope="col">Height</th><th scope="col">Entrance / path</th><th scope="col">Clearing margin</th><th scope="col">Conflict</th></tr></thead><tbody>
      ${(siteReconciliation || []).map((r) => `<tr><th scope="row">${esc(r.site_name)}</th><td>${esc(r.design_name)}</td><td>${n(r.design_footprint_m2)} m²</td><td>${r.site_footprint_m2 == null ? '—' : n(r.site_footprint_m2) + ' m²'}</td><td>${r.difference_pct == null ? '—' : (r.difference_pct > 0 ? '+' : '') + n(r.difference_pct) + '%'}</td><td>${n(r.design_height_m)} m</td><td>${esc(r.entrance)} / ${esc(r.path_approach || 'not recorded')}</td><td>${n(r.clearance_margin_m)} m</td><td>${r.conflicts && r.conflicts.length ? r.conflicts.map(esc).join('; ') : 'No recorded conflict'}</td></tr>`).join('')}
    </tbody></table></div>
    <p class="small">The reconciliation is a design check, not a survey, setback assessment, geotechnical review or permission. See <a href="https://github.com/mgifford/Containers-Hamlet/blob/main/docs/phase-3-site-reconciliation.md">the site reconciliation note</a> for the method and unresolved conflicts.</p>
  </section>

  <section aria-labelledby="diversity-title">
    <h2 id="diversity-title">Architectural diversity assessment</h2>
    <p>Similarity is a rule-based heuristic over primary architectural characteristics: storey count, arrangement, footprint type, roof type, entrance orientation, circulation type and approximate proportions. Colour, cladding and planting are excluded. A score of 0.8 or more is flagged for inspection. The threshold is not an architectural standard, and repetition can be the right choice for accessibility, affordability, construction or maintenance.</p>
    ${similarityTable(profiles, similarities)}
    ${similarities.some((s) => s.score >= 0.8) ? '<p class="notice">At least one pair is above the heuristic threshold. Inspect the pair rather than assuming the homes are duplicate designs.</p>' : '<p class="small">No pair is above the 0.8 heuristic threshold in this set. This does not prove the designs are good, only that their primary characteristics differ.</p>'}
  </section>

  <section aria-labelledby="homes-title">
    <h2 id="homes-title">The six homes in detail</h2>
    ${cards}
  </section>

  <section aria-labelledby="boundary-title">
    <h2 id="boundary-title">What this comparison does not do</h2>
    <ul>
      <li>It does not calculate structural capacity, connection design, foundation reactions or lateral stability.</li>
      <li>It does not calculate carbon, cost, daylight, overheating, privacy or acoustic performance. Energy use is a separate conceptual model in the energy section and the <a href="../energy/">energy explorer</a>; it is not a measured or certified result.</li>
      <li>It does not claim that container construction is better than a conventional timber-frame comparator.</li>
      <li>It does not treat a support reference as a verified load path.</li>
      <li>It does not claim code compliance or a professional accessibility assessment.</li>
    </ul>
    <p class="small">The project preserves the fictional 15-acre Canadian Shield setting, six residential sites and the common lodge. Site assignments are illustrative and are not a planning application.</p>
  </section>
</main>
<footer class="site-footer"><p><a href="../../../index.html">Containers Hamlet</a> · <a href="../index.html">Design Lab</a> · <a href="../LICENSE.txt">AGPL-3.0-or-later</a> · <a href="../CONTENT-LICENSE.md">CC BY-SA 4.0 content</a></p></footer>
<script src="residences.js"></script>
</body>
</html>`;
}
