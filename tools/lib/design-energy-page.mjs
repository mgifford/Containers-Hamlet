// Residential energy explorer and six-home comparison. Code: MIT. Generated content: CC BY-SA 4.0.
import { designShellNav } from './design-nav.mjs';

const esc = (v) => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const n = (v, d = 1) => (v == null || !Number.isFinite(Number(v)) ? '—' : (Math.round(Number(v) * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d));

function mountLabel(m) {
  return String(m || '').replace(/-/g, ' ');
}
function row(e) {
  const s = e.summary;
  const c = e.concept;
  const occ = s.occupancy;
  const lim = (s.limitations && s.limitations[0]) || 'No specific limitation recorded.';
  return `<tr>
    <th scope="row"><a href="../architecture/${esc(c.id)}/">${esc(c.name)}</a><br><span class="small">${esc(occ.label)}</span></th>
    <td>${n(e.conditionedArea, 1)} m²</td>
    <td>${esc(String(occ.household_size))}${occ.max_occupants ? '–' + esc(String(occ.max_occupants)) : ''}</td>
    <td>${s.panels}</td>
    <td>${n(s.capacity_kwp, 1)} kWp</td>
    <td>${n(s.panel_area_m2, 1)} m²</td>
    <td>${esc((s.mounting || []).map(mountLabel).join(' + '))}</td>
    <td>${n(s.generation.summer_daily_kwh, 1)} kWh</td>
    <td>${n(s.generation.winter_daily_kwh, 1)} kWh</td>
    <td>${n(s.consumption.summer_daily_kwh, 1)} kWh</td>
    <td>${n(s.consumption.winter_daily_kwh, 1)} kWh<br><span class="small">${n(s.consumption.winter_full_time_daily_kwh, 1)} full-time</span></td>
    <td>${n(s.battery.nominal_kwh, 0)} / ${n(s.battery.usable_kwh, 1)} kWh</td>
    <td>${s.autonomy.essential_days == null ? '—' : n(s.autonomy.essential_days, 1)} days</td>
    <td>${s.autonomy.ordinary_days == null ? '—' : n(s.autonomy.ordinary_days, 1)} days</td>
    <td>${n(s.supplementary_daily_kwh, 1)} kWh/day<br><span class="small">five cloudy days, no shared supply</span></td>
    <td>${esc((s.suitable_patterns || []).join('; '))}</td>
    <td>${esc(lim)}</td>
  </tr>`;
}

function monthlyTable(e, caption) {
  const s = e.summary;
  const months = s.generation.months;
  const winterP = s.consumption.profiles.find((p) => p.id === 'winter-full-time');
  const sumP = s.consumption.profiles.find((p) => p.id === 'summer');
  const rows = months.map((m) => {
    const use = m.season === 'summer' ? sumP.daily_kwh : m.season === 'winter' ? winterP.daily_kwh : s.consumption.shoulder_daily_kwh;
    const balance = m.kwh_per_day - use;
    return `<tr><th scope="row">${esc(m.label)}</th><td>${n(m.kwh, 1)}</td><td>${n(m.kwh_per_day, 1)}</td><td>${n(use, 1)}</td><td>${balance >= 0 ? '+' : ''}${n(balance, 1)}</td><td>${n(m.shade_pct, 0)}%</td></tr>`;
  });
  return `<details class="energy-monthly">
    <summary>${esc(caption)}</summary>
    <div class="table-wrap" tabindex="0" role="region" aria-label="${esc(caption)} table">
      <table>
        <caption>${esc(caption)}. Monthly generation is an estimate from the shared model, not a guaranteed yield.</caption>
        <thead><tr><th scope="col">Month</th><th scope="col">Generation (kWh)</th><th scope="col">Generation per day (kWh)</th><th scope="col">Consumption per day (kWh)</th><th scope="col">Daily balance (kWh)</th><th scope="col">Shading loss</th></tr></thead>
        <tbody>${rows.join('')}</tbody>
      </table>
    </div>
    <p class="small">Consumption uses the summer profile in June–August, the shoulder profile in March–May and September–October, and the full-time winter profile in November–February. The balance does not model battery state of charge day by day; use the resilience scenarios for that.</p>
  </details>`;
}

function homeCard(e) {
  const s = e.summary;
  return `<article class="energy-card">
    <h3>${esc(e.concept.name)}</h3>
    <p class="tagline">${esc(e.concept.tagline)}</p>
    <dl class="concept-facts">
      <div><dt>Array</dt><dd>${s.arrays.map((a) => `${esc(a.label)}: ${a.panels} × ${esc(String(a.watts))} W at ${a.tilt_deg}°, ${a.azimuth_deg}° (${esc(mountLabel(a.mounting))})`).join('; ')}</dd></div>
      <div><dt>Consumption</dt><dd>${n(s.consumption.summer_daily_kwh, 1)} kWh/day in summer; ${n(s.consumption.winter_daily_kwh, 1)} kWh/day in winter for the stated pattern; ${n(s.consumption.winter_full_time_daily_kwh, 1)} kWh/day full-time.</dd></div>
      <div><dt>Battery</dt><dd>${n(s.battery.nominal_kwh, 0)} kWh nominal, ${n(s.battery.usable_kwh, 1)} kWh usable; ${s.autonomy.essential_days == null ? '—' : n(s.autonomy.essential_days, 1)} days of essential load and ${s.autonomy.ordinary_days == null ? '—' : n(s.autonomy.ordinary_days, 1)} days of ordinary load without sun.</dd></div>
      <div><dt>Five cloudy winter days</dt><dd>${n(s.supplementary_daily_kwh, 1)} kWh/day unserved without shared electricity${s.winter_risk.five_day_end_soc_pct == null ? '' : `; the battery ends at about ${s.winter_risk.five_day_end_soc_pct}% with shared backup available`}.</dd></div>
      <div><dt>Suitable patterns</dt><dd>${esc((s.suitable_patterns || []).join('; '))}</dd></div>
    </dl>
    <details><summary>Assumptions, exclusions and reviews for ${esc(e.concept.name)}</summary>
      <ul>
        ${(e.validation.issues || []).map((i) => `<li><strong>${esc(i.category.replace(/-/g, ' '))}:</strong> ${esc(i.message)}</li>`).join('')}
        <li><strong>Excluded:</strong> electric resistance space heating, conventional electric domestic hot water, electric vehicle charging, and electric laundry are not in the base estimate. Optional profiles show their effect separately.</li>
      </ul>
    </details>
    ${monthlyTable(e, `${e.concept.name}: monthly generation and consumption`)}
    <p><a href="../architecture/${esc(e.concept.id)}/">Architecture and full energy tables</a></p>
  </article>`;
}

export function energyPage(entries, options = {}) {
  const first = entries[0];
  const totalPanels = entries.reduce((t, e) => t + e.summary.panels, 0);
  const totalKwp = entries.reduce((t, e) => t + e.summary.capacity_kwp, 0);
  const totalArea = entries.reduce((t, e) => t + e.summary.panel_area_m2, 0);
  const s0 = first.summary;
  return `<!doctype html>
<html lang="en-CA">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Compare and explore the solar, battery and seasonal electricity systems of the six Containers Hamlet residences. Transparent load assumptions, monthly generation, autonomy and winter resilience scenarios.">
  <title>Residential energy explorer · Containers Hamlet Design Lab</title>
  <link rel="stylesheet" href="../../../style.css">
  <link rel="stylesheet" href="../style.css">
  <link rel="stylesheet" href="energy.css">
  <link rel="icon" href="../../assets/favicon.svg" type="image/svg+xml">
</head>
<body class="lab-page">
<a class="skip" href="#main">Skip to content</a>
${designShellNav(2, 'energy')}
<main id="main" class="lab-main">
  <p class="eyebrow">Residential energy</p>
  <h1>Right-sized energy, six different answers</h1>
  <p class="lede">The six homes share a construction language but not an electrical system. Each has a documented load list, a different panel count, a different mounting strategy and a battery sized against its own occupancy. The reference set is <strong>${totalPanels} panels, ${n(totalKwp, 1)} kWp and ${n(totalArea, 0)} m² of module surface</strong>. That is a design hypothesis for six homes, not a target for any one home.</p>
  <p class="notice"><strong>Concept model only.</strong> These are illustrative estimates from a fictional site. There is no surveyed solar resource, measured weather, metered consumption, structural design, electrical design or solar installer review. Do not present these figures as guaranteed production or as an off-grid guarantee. See <a href="https://github.com/mgifford/Containers-Hamlet/blob/main/docs/residential-energy-model.md">the residential energy model</a> for the method and unresolved assumptions.</p>

  <section aria-labelledby="compare-title">
    <h2 id="compare-title">Six systems compared</h2>
    <p>Read the table as a set of trade-offs, not a ranking. A smaller array serving a smaller home is not worse than a larger array serving a larger household. The question is whether the system fits the life it is meant to support, and whether the winter shortfall has an honest plan.</p>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Six-home energy comparison table">
      <table id="energy-comparison">
        <caption>Residential energy comparison. Generation is a modelled average daily estimate; consumption is calculated from the equipment assumptions in each home's load list. "Supplementary" is the unserved demand per day over a synthetic five-day cloudy winter period with no shared electricity.</caption>
        <thead>
          <tr>
            <th scope="col">Home and intended occupancy</th>
            <th scope="col">Conditioned floor</th>
            <th scope="col">Occupants</th>
            <th scope="col">Panels</th>
            <th scope="col">Installed capacity</th>
            <th scope="col">Panel surface</th>
            <th scope="col">Mounting</th>
            <th scope="col">Summer generation (daily)</th>
            <th scope="col">Winter generation (daily)</th>
            <th scope="col">Summer use (daily)</th>
            <th scope="col">Winter use (daily)</th>
            <th scope="col">Battery nominal / usable</th>
            <th scope="col">Essential autonomy</th>
            <th scope="col">Ordinary autonomy</th>
            <th scope="col">Supplementary need</th>
            <th scope="col">Suitable occupancy patterns</th>
            <th scope="col">Key limitation</th>
          </tr>
        </thead>
        <tbody>${entries.map(row).join('')}</tbody>
      </table>
    </div>
    <p class="small">Autonomy is calculated without solar input: essential autonomy uses the whole usable battery, ordinary autonomy keeps the essential reserve intact. A battery that lasts three days is not sufficient if the array cannot recharge it while supplying the house, so read the resilience scenarios as well as the autonomy figures.</p>
  </section>

  <section aria-labelledby="heat-pump-link-title" id="heat-pump-link">
    <h2 id="heat-pump-link-title">What about a heat pump?</h2>
    <p>The energy explorer models ordinary household electricity. A heat pump is <strong>additional</strong> to that load. The separate heat-pump assessment keeps these arrays and batteries fixed and quantifies the extra winter electricity, panels, storage and inverter capacity. It is the honest place to test a heating or cooling scenario.</p>
    ${options.heatPumpByHome ? `<div class="table-wrap" tabindex="0" role="region" aria-label="Heat-pump impact summary"><table id="heat-pump-summary"><caption>Full-time air-source heat-pump impact at a glance. Additional panels are winter-critical, not annual averages.</caption><thead><tr><th scope="col">Home</th><th scope="col">Design heat load (−30 °C)</th><th scope="col">Heat-pump electricity (heating)</th><th scope="col">Additional winter panels</th><th scope="col">Additional battery (3 days)</th><th scope="col">Combined peak</th></tr></thead><tbody>${entries.map((e) => { const hp = options.heatPumpByHome[e.concept.id]; if (!hp) return `<tr><th scope="row">${esc(e.concept.name)}</th><td colspan="5">No assessment recorded.</td></tr>`; return `<tr><th scope="row"><a href="../architecture/${esc(e.concept.id)}/#heat-pump">${esc(e.concept.name)}</a></th><td>${n(hp.monthly.design_heat_load_w / 1000, 1)} kW</td><td>${n(hp.ashp.monthly.annual_heating_electric_kwh, 0)} kWh/yr</td><td>${hp.additional.panels_ashp.additional_panels}</td><td>${hp.additional.battery_ashp.three_day_kwh} kWh</td><td>${n(hp.additional.inverter.total_peak_kw, 1)} kW</td></tr>`; }).join('')}</tbody></table></div>` : ''}
    <p><a href="../heat-pumps/">Open the heat-pump assessment and explorer</a> to change the outdoor temperature, heat-pump type, envelope, wood backup and shared electricity, and to see the operating strategies and passive alternatives.</p>
  </section>

  <section id="explorer" aria-labelledby="explorer-title">
    <h2 id="explorer-title">Energy explorer</h2>
    <p>Change one home or one assumption at a time. The results update in this page and never leave your browser. Every control has a visible label and a text result; the chart has a data table underneath.</p>
    <form id="energy-form" class="energy-form" novalidate>
      <fieldset>
        <legend>Home and household</legend>
        <div class="energy-field">
          <label for="residence">Residence</label>
          <select id="residence" name="residence">
            ${entries.map((e) => `<option value="${esc(e.concept.id)}">${esc(e.concept.name)}</option>`).join('')}
          </select>
        </div>
        <div class="energy-field">
          <label for="occupants">Number of occupants</label>
          <input id="occupants" name="occupants" type="number" min="1" max="6" step="1" value="${esc(String(s0.occupancy.household_size))}" inputmode="numeric">
          <p class="field-help" id="occupants-help">Scales the occupant-dependent loads in the model. It does not add a second household.</p>
        </div>
        <div class="energy-field">
          <label for="occupancy">Occupancy pattern</label>
          <select id="occupancy" name="occupancy">
            <option value="summer">Summer occupation</option>
            <option value="shoulder">Three-season occupation</option>
            <option value="winter-intermittent">Intermittent winter occupation</option>
            <option value="winter-full-time">Full-time winter occupation</option>
          </select>
          <p class="field-help" id="occupancy-help">The comparison figures use the home's intended pattern. The explorer lets you test another pattern.</p>
        </div>
      </fieldset>
      <fieldset>
        <legend>Solar array</legend>
        <div class="energy-field">
          <label for="panels">Number of panels</label>
          <input id="panels" name="panels" type="number" min="2" max="16" step="1" value="${esc(String(s0.panels))}" inputmode="numeric">
          <p class="field-help" id="panels-help">The first array is resized; other arrays keep their count. Placement warnings appear below when the panels no longer fit.</p>
        </div>
        <div class="energy-field">
          <label for="panel-watts">Panel capacity (W each)</label>
          <input id="panel-watts" name="panel-watts" type="number" min="250" max="700" step="5" value="450" inputmode="numeric">
          <p class="field-help" id="panel-watts-help">450 W is the initial reference module. Confirm the chosen product.</p>
        </div>
        <div class="energy-field">
          <label for="tilt">Panel tilt (degrees)</label>
          <input id="tilt" name="tilt" type="number" min="0" max="75" step="1" value="${esc(String(s0.arrays[0] ? s0.arrays[0].tilt_deg : 39))}" inputmode="numeric">
          <p class="field-help" id="tilt-help">30–45° is the initial annual-production range; 55–70° is the winter-oriented range.</p>
        </div>
        <div class="energy-field">
          <label for="azimuth">Solar orientation (degrees from north)</label>
          <input id="azimuth" name="azimuth" type="number" min="0" max="360" step="5" value="${esc(String(s0.arrays[0] ? s0.arrays[0].azimuth_deg : 180))}" inputmode="numeric">
          <p class="field-help" id="azimuth-help">180° is true south. This is geographic orientation, not the drawing orientation.</p>
        </div>
        <div class="energy-field">
          <label for="shading">Approximate shading loss (%)</label>
          <input id="shading" name="shading" type="number" min="0" max="80" step="1" value="${esc(String(s0.generation.months[0].shade_pct))}" inputmode="numeric">
          <p class="field-help" id="shading-help">A simplified annual shading loss applied to every month. The default is the modelled woodland and building shade.</p>
        </div>
      </fieldset>
      <fieldset>
        <legend>Storage and operation</legend>
        <div class="energy-field">
          <label for="battery">Battery capacity (kWh nominal)</label>
          <input id="battery" name="battery" type="number" min="2" max="40" step="1" value="${esc(String(s0.battery.nominal_kwh))}" inputmode="numeric">
          <p class="field-help" id="battery-help">Usable capacity is recalculated at 90% of nominal for the explorer.</p>
        </div>
        <div class="energy-field">
          <label for="consumption">Daily consumption override (kWh)</label>
          <input id="consumption" name="consumption" type="number" min="0" max="12" step="0.1" value="${esc(String(s0.consumption.summer_daily_kwh))}" inputmode="decimal">
          <p class="field-help" id="consumption-help">Optional. If you change it, the equipment assumptions are scaled to the summer daily total. Clear it to return to the calculated load model.</p>
        </div>
        <div class="energy-field">
          <label for="cloud-days">Consecutive cloudy winter days</label>
          <input id="cloud-days" name="cloud-days" type="number" min="1" max="10" step="1" value="5" inputmode="numeric">
          <p class="field-help" id="cloud-days-help">Used for the resilience result. The weather is synthetic, not a forecast.</p>
        </div>
        <div class="energy-field">
          <label for="mode">Operating mode</label>
          <select id="mode" name="mode">
            <option value="ordinary">Ordinary household consumption</option>
            <option value="essential">Essential and accessibility loads only</option>
          </select>
        </div>
        <div class="energy-field">
          <label for="shared">Shared community electricity</label>
          <select id="shared" name="shared">
            <option value="backup">Community backup available</option>
            <option value="none">No shared electricity</option>
          </select>
        </div>
      </fieldset>
      <div class="energy-actions">
        <button type="button" id="reset-energy">Reset to the modelled home</button>
        <button type="button" id="download-energy">Download this result as JSON</button>
      </div>
    </form>

    <div id="energy-status" role="status" aria-live="polite" aria-atomic="true" class="energy-status">Showing the modelled values for ${esc(first.concept.name)}.</div>

    <div id="energy-results" class="energy-results">
      <h3>Results for <span id="result-home">${esc(first.concept.name)}</span></h3>
      <dl class="energy-metrics">
        <div><dt>Installed capacity</dt><dd><output id="out-kwp">${n(s0.capacity_kwp, 1)}</output> kWp</dd></div>
        <div><dt>Required panel area</dt><dd><output id="out-area">${n(s0.panel_area_m2, 1)}</output> m²</dd></div>
        <div><dt>Summer generation</dt><dd><output id="out-gen-summer">${n(s0.generation.summer_daily_kwh, 1)}</output> kWh/day</dd></div>
        <div><dt>Winter generation</dt><dd><output id="out-gen-winter">${n(s0.generation.winter_daily_kwh, 1)}</output> kWh/day</dd></div>
        <div><dt>Summer consumption</dt><dd><output id="out-use-summer">${n(s0.consumption.summer_daily_kwh, 1)}</output> kWh/day</dd></div>
        <div><dt>Winter consumption</dt><dd><output id="out-use-winter">${n(s0.consumption.winter_full_time_daily_kwh, 1)}</output> kWh/day</dd></div>
        <div><dt>Battery usable</dt><dd><output id="out-battery">${n(s0.battery.usable_kwh, 1)}</output> kWh</dd></div>
        <div><dt>Essential autonomy</dt><dd><output id="out-essential">${n(s0.autonomy.essential_days, 1)}</output> days</dd></div>
        <div><dt>Ordinary autonomy</dt><dd><output id="out-ordinary">${n(s0.autonomy.ordinary_days, 1)}</output> days</dd></div>
        <div><dt>Cloudy-period shortfall</dt><dd><output id="out-shortfall">${n(s0.supplementary_daily_kwh, 1)}</output> kWh/day</dd></div>
        <div><dt>Surplus after load</dt><dd><output id="out-surplus">${n(Math.max(0, s0.generation.winter_daily_kwh - s0.consumption.winter_full_time_daily_kwh), 1)}</output> kWh/day (winter average)</dd></div>
        <div><dt>Layout warnings</dt><dd><output id="out-warnings">${s0.geometry.warnings.length}</output></dd></div>
      </dl>
      <div id="energy-warning-list" class="energy-warnings"></div>
      <p id="energy-summary" class="small">${esc(first.concept.name)} is modelled for ${esc(s0.occupancy.label.toLowerCase())}. ${esc((s0.limitations && s0.limitations[0]) || '')}</p>
    </div>

    <h3 id="chart-title">Monthly generation and consumption</h3>
    <p class="small">Bars show modelled generation. The line shows the daily consumption for that month. Both values are in kWh per day.</p>
    <div id="energy-chart" class="energy-chart" tabindex="0" role="region" aria-label="Scrollable monthly generation and consumption chart">${chartSVG(s0, 'energy-chart')}</div>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Monthly generation and consumption table">
      <table id="energy-monthly-table">
        <caption>Monthly generation and consumption for <span id="monthly-home">${esc(first.concept.name)}</span>. Generation is an estimate; consumption is calculated from the load list.</caption>
        <thead><tr><th scope="col">Month</th><th scope="col">Generation (kWh/day)</th><th scope="col">Consumption (kWh/day)</th><th scope="col">Balance (kWh/day)</th><th scope="col">Shading loss</th></tr></thead>
        <tbody id="energy-monthly-body">${monthlyRows(s0)}</tbody>
      </table>
    </div>

    <h3 id="compare-two-title">Compare two configurations</h3>
    <p>Choose a second residence to see the two systems side by side. This is a comparison of modelled service, not a sustainability ranking.</p>
    <div class="energy-compare-controls">
      <label for="compare-home">Compare with</label>
      <select id="compare-home">
        ${entries.map((e) => `<option value="${esc(e.concept.id)}"${e.concept.id === (entries[1] || first).concept.id ? ' selected' : ''}>${esc(e.concept.name)}</option>`).join('')}
      </select>
    </div>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Two-home comparison table">
      <table id="compare-two">
        <caption>Side-by-side modelled comparison of the selected home and the comparison home.</caption>
        <thead><tr><th scope="col">Measure</th><th scope="col" id="compare-a-head">${esc(first.concept.name)}</th><th scope="col" id="compare-b-head">${esc((entries[1] || first).concept.name)}</th></tr></thead>
        <tbody id="compare-two-body">${compareRows(s0, (entries[1] || first).summary)}</tbody>
      </table>
    </div>
  </section>

  <section aria-labelledby="cards-title">
    <h2 id="cards-title">Each home's system in plain language</h2>
    <div class="energy-cards">${entries.map(homeCard).join('')}</div>
  </section>

  <section aria-labelledby="assumptions-title">
    <h2 id="assumptions-title">Assumptions, limits and reviews</h2>
    <ul>
      <li><strong>No measured data.</strong> The property is fictional. Monthly irradiation is illustrative eastern-Ontario / Canadian Shield data, not a solar resource assessment. Shading comes from simplified tree cylinders derived from the fictional woodland scatter.</li>
      <li><strong>Losses are applied once.</strong> Shading and snow availability, soiling, mismatch and DC wiring, temperature, inverter conversion and degradation. Battery charge and discharge losses are applied in the storage simulation, not in the generation chain.</li>
      <li><strong>Heating and hot water are excluded.</strong> Electric resistance heating, conventional electric domestic hot water, electric laundry, extra cooking and electric vehicle charging are separate optional profiles. A heat pump would change the system size substantially.</li>
      <li><strong>Energy shortfalls are shown.</strong> A positive shortfall is a result to design for, not a software failure. Load reduction, shared backup and an emergency generator are different answers with different costs and governance.</li>
      <li><strong>Required reviews.</strong> Licensed electrical design and inspection; structural review of roof and canopy loads; building-envelope and mechanical review; accessibility review for the accessible home; fire and building-code review; solar installer review of array layout, fixing and maintenance access.</li>
    </ul>
    <p class="small">See <a href="https://github.com/mgifford/Containers-Hamlet/blob/main/docs/residential-energy-model.md">Residential energy model</a> and <a href="https://github.com/mgifford/Containers-Hamlet/blob/main/docs/electrical-solar-battery.md">Electrical, PV and battery architecture</a>. The geometric models and the load lists remain authoritative over any generated image or summary.</p>
  </section>
</main>
<script src="../../js/design-energy.js"></script>
<script src="../concepts-selected.js"></script>
<script src="energy-app.js"></script>
</body>
</html>`;
}

function chartSVG(summary, id) {
  const W = 720, H = 300, left = 56, right = 20, top = 22, bottom = 58;
  const months = summary.generation.months;
  const use = months.map((m) => m.season === 'summer' ? summary.consumption.summer_daily_kwh : m.season === 'winter' ? summary.consumption.winter_full_time_daily_kwh : summary.consumption.shoulder_daily_kwh);
  const max = Math.max(1, ...months.map((m) => m.kwh_per_day), ...use);
  const bw = (W - left - right) / 12;
  const y = (v) => top + (H - top - bottom) * (1 - v / max);
  const bars = months.map((m, i) => {
    const x = left + i * bw + bw * 0.18;
    const h = Math.max(0, H - bottom - y(m.kwh_per_day));
    return `<rect x="${n(x, 1)}" y="${n(y(m.kwh_per_day), 1)}" width="${n(bw * 0.64, 1)}" height="${n(h, 1)}" fill="#245a73" rx="1"><title>${esc(m.label)}: ${n(m.kwh_per_day, 1)} kWh/day generation</title></rect>`;
  }).join('');
  const points = months.map((m, i) => `${n(left + i * bw + bw / 2, 1)},${n(y(use[i]), 1)}`).join(' ');
  const labels = months.map((m, i) => `<text x="${n(left + i * bw + bw / 2, 1)}" y="${H - 34}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#3f5a4c">${esc(m.label.slice(0, 1))}</text>`).join('');
  const grid = [0, 0.25, 0.5, 0.75, 1].map((t) => `<line x1="${left}" y1="${n(y(max * t), 1)}" x2="${W - right}" y2="${n(y(max * t), 1)}" stroke="#c9d2c2" stroke-width="1"/><text x="${left - 8}" y="${n(y(max * t) + 4, 1)}" text-anchor="end" font-family="system-ui,sans-serif" font-size="10" fill="#3f5a4c">${n(max * t, 1)}</text>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${id}-t ${id}-d">
    <title id="${id}-t">Monthly generation and consumption for ${esc(summary.name)}</title>
    <desc id="${id}-d">A bar chart of estimated daily generation and a line of daily consumption for each month. The same values are in the monthly table below. Generation is highest from May to August and lowest in December and January.</desc>
    <rect width="${W}" height="${H}" fill="#faf8f2"/>
    ${grid}
    ${bars}
    <polyline points="${points}" fill="none" stroke="#b45e1c" stroke-width="2.5"/>
    ${months.map((m, i) => `<circle cx="${n(left + i * bw + bw / 2, 1)}" cy="${n(y(use[i]), 1)}" r="2.6" fill="#b45e1c"><title>${esc(m.label)}: ${n(use[i], 1)} kWh/day consumption</title></circle>`).join('')}
    ${labels}
    <text x="${left}" y="16" font-family="system-ui,sans-serif" font-size="11" fill="#245a73">■ generation</text>
    <text x="${left + 110}" y="16" font-family="system-ui,sans-serif" font-size="11" fill="#b45e1c">— consumption</text>
    <text x="${W - right}" y="${H - 10}" text-anchor="end" font-family="system-ui,sans-serif" font-size="9" fill="#5e6a58">kWh per day · modelled estimate</text>
  </svg>`;
}

function monthlyRows(summary) {
  return summary.generation.months.map((m) => {
    const use = m.season === 'summer' ? summary.consumption.summer_daily_kwh : m.season === 'winter' ? summary.consumption.winter_full_time_daily_kwh : summary.consumption.shoulder_daily_kwh;
    const bal = m.kwh_per_day - use;
    return `<tr><th scope="row">${esc(m.label)}</th><td>${n(m.kwh_per_day, 1)}</td><td>${n(use, 1)}</td><td>${bal >= 0 ? '+' : ''}${n(bal, 1)}</td><td>${n(m.shade_pct, 0)}%</td></tr>`;
  }).join('');
}

function compareRows(a, b) {
  const rows = [
    ['Panels', a.panels, b.panels, ''],
    ['Installed capacity (kWp)', n(a.capacity_kwp, 1), n(b.capacity_kwp, 1), ''],
    ['Panel surface (m²)', n(a.panel_area_m2, 1), n(b.panel_area_m2, 1), ''],
    ['Summer generation (kWh/day)', n(a.generation.summer_daily_kwh, 1), n(b.generation.summer_daily_kwh, 1), ''],
    ['Winter generation (kWh/day)', n(a.generation.winter_daily_kwh, 1), n(b.generation.winter_daily_kwh, 1), ''],
    ['Summer consumption (kWh/day)', n(a.consumption.summer_daily_kwh, 1), n(b.consumption.summer_daily_kwh, 1), ''],
    ['Winter consumption (kWh/day)', n(a.consumption.winter_full_time_daily_kwh, 1), n(b.consumption.winter_full_time_daily_kwh, 1), ''],
    ['Battery nominal / usable (kWh)', n(a.battery.nominal_kwh, 0) + ' / ' + n(a.battery.usable_kwh, 1), n(b.battery.nominal_kwh, 0) + ' / ' + n(b.battery.usable_kwh, 1), ''],
    ['Essential autonomy (days)', n(a.autonomy.essential_days, 1), n(b.autonomy.essential_days, 1), ''],
    ['Ordinary autonomy (days)', n(a.autonomy.ordinary_days, 1), n(b.autonomy.ordinary_days, 1), ''],
    ['Five-cloudy-day shortfall with no shared supply (kWh/day)', n(a.supplementary_daily_kwh, 1), n(b.supplementary_daily_kwh, 1), ''],
    ['Intended occupancy', (a.suitable_patterns || []).join('; '), (b.suitable_patterns || []).join('; '), '']
  ];
  return rows.map(([label, av, bv]) => `<tr><th scope="row">${esc(label)}</th><td>${esc(String(av))}</td><td>${esc(String(bv))}</td></tr>`).join('');
}
