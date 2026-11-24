// Heat-pump assessment: six-home comparison, charts, strategies and explorer.
// Code: MIT. Generated content: CC BY-SA 4.0.
import { designShellNav } from './design-nav.mjs';

const esc = (v) => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const n = (v, d = 1) => (v == null || !Number.isFinite(Number(v)) ? '—' : (Math.round(Number(v) * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d));
const f0 = (v) => n(v, 0);
const short = (name) => name.replace(' Residence', '').replace(' Retreat', '').replace(' Stack', '').replace(' Home', '').replace(' Cottage', '');

function annualHousehold(s) {
  const months = s.household.generation.months;
  return months.reduce((t, m) => {
    const use = m.season === 'summer' ? s.household.consumption.summer_daily_kwh : m.season === 'winter' ? s.household.consumption.winter_full_time_daily_kwh : s.household.consumption.shoulder_daily_kwh;
    return t + use * m.days;
  }, 0);
}

function row(e) {
  const s = e.s, p = s.additional.panels_ashp, b = s.additional.battery_ashp, inv = s.additional.inverter;
  const constraint = !p.fits_existing_roof
    ? 'Additional panels exceed the remaining roof area; a ground array, canopy or shared array is required.'
    : inv.additional_inverter_kw > 0
      ? 'The existing inverter is below the combined peak; a larger inverter or load management is required.'
      : 'The additional array could fit the remaining roof area in principle; structure and access still need review.';
  return `<tr>
    <th scope="row"><a href="../architecture/${esc(e.c.id)}/">${esc(e.c.name)}</a><br><span class="small">${esc(s.household.occupancy.label)}</span></th>
    <td>${n(s.envelope.conditioned_area_m2, 1)} m²</td>
    <td>${f0(s.monthly.design_heat_load_w / 1000 * 10) / 10} kW</td>
    <td>${f0(s.monthly.annual_heating_kwh)} kWh</td>
    <td>${f0(s.ashp.monthly.annual_heating_electric_kwh)} kWh<br><span class="small">+ ${f0(s.ashp.monthly.annual_cooling_electric_kwh)} cooling</span></td>
    <td>${n(s.ashp.monthly.months[0].heating_electric_kwh_day, 1)} kWh/day</td>
    <td>${p.existing_panels}</td>
    <td>${p.baseline_household_panels_winter}</td>
    <td>${p.heat_pump_panels_winter}</td>
    <td><strong>${p.additional_panels}</strong></td>
    <td>${p.total_required_winter}</td>
    <td>${n(p.additional_area_m2, 0)} m²</td>
    <td>${n(p.available_roof_area_m2, 0)} m²<br><span class="small">${p.fits_existing_roof ? 'fits in principle' : 'insufficient'}</span></td>
    <td>${b.three_day_kwh} kWh</td>
    <td>${b.total_nominal_three_day_kwh} kWh</td>
    <td>${n(inv.total_peak_kw, 1)} kW</td>
    <td>${esc(constraint)}</td>
  </tr>`;
}

function temperatureRows(e) {
  return e.s.ashp.table.map((r) => `<tr>
    <th scope="row">${esc(r.label)}<br><span class="small">${r.outdoor_c} °C</span></th>
    <td>${n(r.heating_kwh_day, 1)}</td>
    <td>${n(r.heating_peak_w / 1000, 1)} kW</td>
    <td>${n(r.cop, 2)}</td>
    <td>${n(r.capacity_kw, 1)} kW</td>
    <td>${n(r.supplemental_kwh_day, 1)}</td>
    <td>${n(r.electrical_kwh_day, 1)}</td>
    <td>${r.meets_design_load ? 'Capacity covers the load' : 'Supplemental heat needed'}</td>
  </tr>`).join('');
}

function strategyRows(e) {
  return e.s.strategies.strategies.map((r) => `<tr>
    <th scope="row">${esc(r.id)} · ${esc(r.label)}</th>
    <td>${f0(r.hp_electric_kwh)}</td>
    <td>${r.additional_panels}</td>
    <td>${r.additional_battery_kwh}</td>
    <td>${f0(r.wood_thermal_kwh)}</td>
    <td>${f0(r.unserved_thermal_kwh)}</td>
    <td>${esc(r.note)}</td>
  </tr>`).join('');
}

function resilienceRows(e) {
  return e.s.resilience.scenarios.map((r) => `<tr>
    <th scope="row">${esc(r.label)}</th>
    <td>${r.days}</td>
    <td>${n(r.outdoor_c, 0)} °C</td>
    <td>${n(r.household_kwh_day, 1)}</td>
    <td>${n(r.heat_pump_electric_kwh_day, 1)}</td>
    <td>${n(r.generation_kwh_day, 1)}</td>
    <td>${n(r.wood_thermal_kwh_day, 1)}</td>
    <td>${r.end_soc_pct}%</td>
    <td>${n(r.unserved_household_kwh, 1)}</td>
    <td>${n(r.unserved_heat_kwh, 1)}</td>
    <td>${esc(r.status)}</td>
  </tr>`).join('');
}

function barChart(items, opts) {
  const W = 860, H = 360, left = 190, right = 30, top = 30, bottom = 44;
  const max = Math.max(1, ...items.flatMap((i) => i.values));
  const groupH = (H - top - bottom) / items.length;
  const bars = items.map((item, i) => {
    const y0 = top + i * groupH + groupH * 0.12;
    const bh = (groupH * 0.68) / item.values.length;
    return item.values.map((v, j) => {
      const w = (W - left - right) * v / max;
      return `<rect x="${left}" y="${n(y0 + j * bh, 1)}" width="${n(w, 1)}" height="${n(Math.max(1, bh - 2), 1)}" fill="${item.colours[j]}" rx="1"><title>${esc(item.label)} — ${esc(item.series[j])}: ${n(v, 0)}</title></rect>`;
    }).join('');
  }).join('');
  const labels = items.map((item, i) => `<text x="${left - 8}" y="${n(top + i * groupH + groupH * 0.5 + 4, 1)}" text-anchor="end" font-family="system-ui,sans-serif" font-size="11" fill="#3f5a4c">${esc(item.label)}</text>`).join('');
  const legend = opts.legend.map((l, i) => `<rect x="${left + i * 150}" y="8" width="10" height="10" fill="${l.colour}"/><text x="${left + i * 150 + 15}" y="17" font-family="system-ui,sans-serif" font-size="10" fill="#3f5a4c">${esc(l.label)}</text>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${opts.id}-t ${opts.id}-d"><title id="${opts.id}-t">${esc(opts.title)}</title><desc id="${opts.id}-d">${esc(opts.desc)}</desc><rect width="${W}" height="${H}" fill="#faf8f2"/>${legend}${bars}${labels}<text x="${left}" y="${H - 14}" font-family="system-ui,sans-serif" font-size="10" fill="#5e6a58">${esc(opts.unit)}</text></svg>`;
}

function monthlyChart(e) {
  const s = e.s;
  const months = s.ashp.monthly.months;
  const W = 860, H = 340, left = 56, right = 24, top = 28, bottom = 46;
  const values = months.map((m) => (m.season === 'summer' ? s.household.consumption.summer_daily_kwh : m.season === 'winter' ? s.household.consumption.winter_full_time_daily_kwh : s.household.consumption.shoulder_daily_kwh));
  const genMonths = e.s.household.generation.months;
  const max = Math.max(1, ...months.map((m) => values[m.monthIndex] + m.heating_electric_kwh_day + m.cooling_electric_kwh_day), ...genMonths.map((m) => m.kwh_per_day)) * 1.1;
  const bw = (W - left - right) / 12;
  const y = (v) => top + (H - top - bottom) * (1 - v / max);
  const bars = months.map((m, i) => {
    const house = values[i];
    const heat = m.heating_electric_kwh_day;
    const cool = m.cooling_electric_kwh_day;
    const x = left + i * bw + bw * 0.18;
    const w = bw * 0.64;
    const h1 = (H - bottom - y(house));
    const h2 = (H - bottom - y(house + heat));
    const h3 = (H - bottom - y(house + heat + cool));
    return `<rect x="${n(x, 1)}" y="${n(y(house), 1)}" width="${n(w, 1)}" height="${n(h1, 1)}" fill="#245a73"><title>${esc(m.label)} household: ${n(house, 1)} kWh/day</title></rect>` +
      `<rect x="${n(x, 1)}" y="${n(y(house + heat), 1)}" width="${n(w, 1)}" height="${n(h2 - h1, 1)}" fill="#b45e1c"><title>${esc(m.label)} heat-pump heating: ${n(heat, 1)} kWh/day</title></rect>` +
      `<rect x="${n(x, 1)}" y="${n(y(house + heat + cool), 1)}" width="${n(w, 1)}" height="${n(h3 - h2, 1)}" fill="#6f9d5b"><title>${esc(m.label)} cooling: ${n(cool, 1)} kWh/day</title></rect>`;
  }).join('');
  const gen = genMonths;
  const points = gen.map((m, i) => `${n(left + i * bw + bw / 2, 1)},${n(y(m.kwh_per_day), 1)}`).join(' ');
  const labels = months.map((m, i) => `<text x="${n(left + i * bw + bw / 2, 1)}" y="${H - 30}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#3f5a4c">${esc(m.label.slice(0, 1))}</text>`).join('');
  const grid = [0, 0.25, 0.5, 0.75, 1].map((t) => `<line x1="${left}" y1="${n(y(max * t), 1)}" x2="${W - right}" y2="${n(y(max * t), 1)}" stroke="#c9d2c2" stroke-width="1"/><text x="${left - 8}" y="${n(y(max * t) + 4, 1)}" text-anchor="end" font-family="system-ui,sans-serif" font-size="10" fill="#3f5a4c">${n(max * t, 1)}</text>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="hp-seasonal-t hp-seasonal-d"><title id="hp-seasonal-t">Monthly household, heat-pump and generation balance for ${esc(e.c.name)}</title><desc id="hp-seasonal-d">Stacked bars show household electricity, additional heat-pump heating and cooling for each month; the line shows existing photovoltaic generation. The values are in the monthly table below.</desc><rect width="${W}" height="${H}" fill="#faf8f2"/>${grid}${bars}<polyline points="${points}" fill="none" stroke="#8f5a21" stroke-width="2.3"/>${labels}<text x="${left}" y="16" font-family="system-ui,sans-serif" font-size="10" fill="#245a73">■ household</text><text x="${left + 100}" y="16" font-family="system-ui,sans-serif" font-size="10" fill="#b45e1c">■ HP heating</text><text x="${left + 205}" y="16" font-family="system-ui,sans-serif" font-size="10" fill="#6f9d5b">■ cooling</text><text x="${left + 295}" y="16" font-family="system-ui,sans-serif" font-size="10" fill="#8f5a21">— generation</text><text x="${W - right}" y="${H - 10}" text-anchor="end" font-family="system-ui,sans-serif" font-size="9" fill="#5e6a58">kWh per day · modelled estimate</text></svg>`;
}

function configurationTable(entries) {
  return `<div class="table-wrap" tabindex="0" role="region" aria-label="Heat-pump configurations at two outdoor temperatures"><table id="hp-configurations"><caption>Household, air-source and ground-source demand at −10 °C and −20 °C. Heat-pump electricity is additional. “Without” is the household load only.</caption><thead><tr><th scope="col">Home</th><th scope="col">Without HP at −10 °C</th><th scope="col">Air-source at −10 °C</th><th scope="col">Ground-source at −10 °C</th><th scope="col">Without HP at −20 °C</th><th scope="col">Air-source at −20 °C</th><th scope="col">Ground-source at −20 °C</th></tr></thead><tbody>${entries.map((e) => { const a10 = e.s.ashp.table.find((x) => x.outdoor_c === -10); const g10 = e.s.gshp.table.find((x) => x.outdoor_c === -10); const a20 = e.s.ashp.table.find((x) => x.outdoor_c === -20); const g20 = e.s.gshp.table.find((x) => x.outdoor_c === -20); const h = e.s.household.consumption.winter_full_time_daily_kwh; return `<tr><th scope="row">${esc(e.c.name)}</th><td>${n(h, 1)} kWh/day</td><td>${n(h + a10.electrical_kwh_day, 1)} kWh/day<br><span class="small">+${n(a10.electrical_kwh_day, 1)} HP</span></td><td>${n(h + g10.electrical_kwh_day, 1)} kWh/day<br><span class="small">+${n(g10.electrical_kwh_day, 1)} HP</span></td><td>${n(h, 1)} kWh/day</td><td>${n(h + a20.electrical_kwh_day, 1)} kWh/day<br><span class="small">+${n(a20.electrical_kwh_day, 1)} HP</span></td><td>${n(h + g20.electrical_kwh_day, 1)} kWh/day<br><span class="small">+${n(g20.electrical_kwh_day, 1)} HP</span></td></tr>`; }).join('')}</tbody></table></div>`;
}

export function heatPumpPage(entries) {
  const first = entries[0];
  const additionalRange = entries.map((e) => e.s.additional.panels_ashp.additional_panels);
  const minAdditional = Math.min(...additionalRange), maxAdditional = Math.max(...additionalRange);
  const electricityItems = entries.map((e) => ({
    label: short(e.c.name),
    series: ['Household', 'Heat pump heating', 'Cooling'],
    colours: ['#245a73', '#b45e1c', '#6f9d5b'],
    values: [annualHousehold(e.s), e.s.ashp.monthly.annual_heating_electric_kwh, e.s.ashp.monthly.annual_cooling_electric_kwh]
  }));
  const panelItems = entries.map((e) => ({
    label: short(e.c.name),
    series: ['Existing', 'Additional', 'Total required'],
    colours: ['#245a73', '#b45e1c', '#6f9d5b'],
    values: [e.s.additional.panels_ashp.existing_panels, e.s.additional.panels_ashp.additional_panels, e.s.additional.panels_ashp.total_required_winter]
  }));
  const batteryItems = entries.map((e) => ({
    label: short(e.c.name),
    series: ['Existing', '+1 day', '+3 days', '+5 days'],
    colours: ['#245a73', '#8a6a4a', '#b45e1c', '#6f9d5b'],
    values: [e.s.additional.battery_ashp.existing_nominal_kwh, e.s.additional.battery_ashp.one_day_kwh, e.s.additional.battery_ashp.three_day_kwh, e.s.additional.battery_ashp.five_day_kwh]
  }));
  const areaItems = entries.map((e) => ({
    label: short(e.c.name),
    series: ['Conditioned floor', 'Existing PV', 'Total PV required'],
    colours: ['#8a9a83', '#245a73', '#b45e1c'],
    values: [e.s.envelope.conditioned_area_m2, e.s.household.panel_area_m2, e.s.additional.panels_ashp.total_area_m2]
  }));
  return `<!doctype html>
<html lang="en-CA">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="A quantified heat-pump assessment for the six Containers Hamlet residences: heating and cooling demand, incremental electricity, additional solar panels, battery storage, inverter capacity, resilience, hybrid and passive alternatives.">
  <title>Heat-pump assessment · Containers Hamlet Design Lab</title>
  <link rel="stylesheet" href="../../../style.css">
  <link rel="stylesheet" href="../style.css">
  <link rel="stylesheet" href="heat-pumps.css">
  <link rel="icon" href="../../assets/favicon.svg" type="image/svg+xml">
</head>
<body class="lab-page">
<a class="skip" href="#main">Skip to content</a>
${designShellNav(2, 'heat-pumps')}
<main id="main" class="lab-main">
  <p class="eyebrow">Residential heating and cooling</p>
  <h1>Heating without wiring the woods</h1>
  <p class="lede">A heat pump is efficient, but it is not free. This assessment keeps the existing household load and reference solar arrays unchanged and asks a narrower question: <strong>what additional electricity, panels, battery and inverter capacity would each home need for a heat pump, and could passive design or a hybrid strategy avoid it?</strong></p>
  <p class="notice"><strong>Preliminary assessment, not an HVAC design.</strong> The model uses canonical geometry but assumed U-values, airtightness, gains, solar factors and heat-pump performance. It is not a building-performance simulation, equipment selection, electrical design, ground-loop design, cost estimate or comfort guarantee. Confirm every result with a mechanical designer and the selected equipment data.</p>

  <section aria-labelledby="answer-title">
    <h2 id="answer-title">The short answer</h2>
    <p>For the six homes, full-time winter heat-pump heating would add roughly <strong>${minAdditional}–${maxAdditional} panels</strong> beyond the existing reference arrays when sized for the winter-critical month. That is ${minAdditional === maxAdditional ? 'a consistent' : 'a large'} increase on arrays of 8–16 panels, and it does not include the additional battery, inverter and enclosure work.</p>
    <p>The annual energy total alone is misleading. Summer and shoulder-season surplus can run a heat pump for cooling, dehumidification or occasional heating, and a hybrid wood/heat-pump strategy is much smaller. The winter-critical result is the one that determines whether a home can operate off-grid through a cold, cloudy week.</p>
    <p><strong>Recommendation:</strong> do not size the reference arrays for full-time electric heating. Treat heat pumps as a hybrid or surplus-solar service, improve the envelope and airtightness first, and keep a non-electric heating path. The Accessible Garden Home needs a specific solution because wood handling cannot be assumed.</p>
  </section>

  <section aria-labelledby="compare-title">
    <h2 id="compare-title">Six homes, same question</h2>
    <p>The table keeps household demand separate from heating and cooling. “Additional panels” is the winter-critical count beyond the existing array; “total required” is the sum of the household requirement and the heat-pump requirement, not a replacement array. The existing reference installation is not resized.</p>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Heat-pump impacts for the six residences">
      <table id="hp-comparison">
        <caption>Air-source heat-pump impacts. Design heat load is at −30 °C; annual heating is a steady-state monthly estimate. Panel counts use each home's modelled winter generation per panel. Battery is additional nominal capacity for three days of heat-pump electricity at 80% usable capacity. All figures are conceptual.</caption>
        <thead><tr>
          <th scope="col">Home</th><th scope="col">Conditioned floor</th><th scope="col">Design heat load</th><th scope="col">Annual heating</th>
          <th scope="col">Heat-pump electricity</th><th scope="col">January HP electricity</th><th scope="col">Existing panels</th>
          <th scope="col">Household-only winter panels</th><th scope="col">HP winter panels</th><th scope="col">Additional panels</th>
          <th scope="col">Total required</th><th scope="col">Additional panel area</th><th scope="col">Remaining roof area</th>
          <th scope="col">Additional battery (3 days)</th><th scope="col">Total battery (3 days)</th><th scope="col">Combined peak</th><th scope="col">Key constraint</th>
        </tr></thead>
        <tbody>${entries.map(row).join('')}</tbody>
      </table>
    </div>
    <p class="small">The household-only winter panel count can already exceed the existing array in December. That is the baseline winter shortfall, before any heat pump. Adding heating makes it much larger.</p>
  </section>

  <section aria-labelledby="charts-title">
    <h2 id="charts-title">The scale of the change</h2>
    <p>Each chart has a title and description, and the values are repeated in the comparison table and the chart data below. None of the charts is needed to understand the result.</p>
    <figure class="hp-figure" tabindex="0" role="region" aria-label="Scrollable heat-pump chart">
      <figcaption><strong>Annual electricity by service.</strong> Household electricity stays the baseline; heat-pump heating and cooling are additional.</figcaption>
      ${barChart(electricityItems, { id: 'hp-chart-electricity', title: 'Annual household and heat-pump electricity by residence', desc: 'Grouped bars for each residence showing annual baseline household electricity, additional heat-pump heating electricity and additional cooling electricity in kilowatt-hours. The values are in the table below.', unit: 'kWh per year', legend: [{ label: 'Household', colour: '#245a73' }, { label: 'HP heating', colour: '#b45e1c' }, { label: 'Cooling', colour: '#6f9d5b' }] })}
    </figure>
    <figure class="hp-figure" tabindex="0" role="region" aria-label="Scrollable heat-pump chart">
      <figcaption><strong>Panels: existing, additional and total required.</strong> The total is a winter-critical count, not a recommendation to build it.</figcaption>
      ${barChart(panelItems, { id: 'hp-chart-panels', title: 'Existing, additional and total required solar panels', desc: 'Grouped bars for each residence showing the existing panel count, the additional winter-critical panels for an air-source heat pump and the total required count. The values are in the comparison table.', unit: 'panels', legend: [{ label: 'Existing', colour: '#245a73' }, { label: 'Additional', colour: '#b45e1c' }, { label: 'Total required', colour: '#6f9d5b' }] })}
    </figure>
    <figure class="hp-figure" tabindex="0" role="region" aria-label="Scrollable heat-pump chart">
      <figcaption><strong>Battery: existing and additional for one, three and five days.</strong> Nominal capacity; usable capacity is lower.</figcaption>
      ${barChart(batteryItems, { id: 'hp-chart-battery', title: 'Existing and additional battery capacity for heat-pump heating', desc: 'Grouped bars for each residence showing the existing nominal battery capacity and the additional nominal capacity for one, three and five days of heat-pump electricity.', unit: 'kWh nominal', legend: [{ label: 'Existing', colour: '#245a73' }, { label: '+1 day', colour: '#8a6a4a' }, { label: '+3 days', colour: '#b45e1c' }, { label: '+5 days', colour: '#6f9d5b' }] })}
    </figure>
    <figure class="hp-figure" tabindex="0" role="region" aria-label="Scrollable heat-pump chart">
      <figcaption><strong>Conditioned floor area compared with photovoltaic surface area.</strong> When the bars cross, the solar infrastructure is larger than the home.</figcaption>
      ${barChart(areaItems, { id: 'hp-chart-area', title: 'Conditioned floor area and photovoltaic surface area', desc: 'Grouped bars for each residence comparing conditioned floor area, the area of the existing installed panels and the total panel area required for full-time air-source heat-pump heating. The values are in the comparison table.', unit: 'm²', legend: [{ label: 'Floor area', colour: '#8a9a83' }, { label: 'Existing PV', colour: '#245a73' }, { label: 'Total PV required', colour: '#b45e1c' }] })}
    </figure>
    <details>
      <summary>Chart data as a table</summary>
      <div class="table-wrap" tabindex="0" role="region" aria-label="Chart data for annual electricity, panels, battery and area">
        <table><caption>Values plotted in the four charts. Annual household electricity is the sum of the monthly household profiles.</caption><thead><tr><th scope="col">Home</th><th scope="col">Household kWh/yr</th><th scope="col">HP heating kWh/yr</th><th scope="col">Cooling kWh/yr</th><th scope="col">Existing panels</th><th scope="col">Additional panels</th><th scope="col">Total panels</th><th scope="col">Existing battery kWh</th><th scope="col">+1 day kWh</th><th scope="col">+3 days kWh</th><th scope="col">+5 days kWh</th><th scope="col">Floor m²</th><th scope="col">Existing PV m²</th><th scope="col">Total PV m²</th></tr></thead><tbody>
          ${entries.map((e) => `<tr><th scope="row">${esc(e.c.name)}</th><td>${f0(annualHousehold(e.s))}</td><td>${f0(e.s.ashp.monthly.annual_heating_electric_kwh)}</td><td>${f0(e.s.ashp.monthly.annual_cooling_electric_kwh)}</td><td>${e.s.additional.panels_ashp.existing_panels}</td><td>${e.s.additional.panels_ashp.additional_panels}</td><td>${e.s.additional.panels_ashp.total_required_winter}</td><td>${f0(e.s.additional.battery_ashp.existing_nominal_kwh)}</td><td>${e.s.additional.battery_ashp.one_day_kwh}</td><td>${e.s.additional.battery_ashp.three_day_kwh}</td><td>${e.s.additional.battery_ashp.five_day_kwh}</td><td>${n(e.s.envelope.conditioned_area_m2, 1)}</td><td>${n(e.s.household.panel_area_m2, 1)}</td><td>${n(e.s.additional.panels_ashp.total_area_m2, 1)}</td></tr>`).join('')}
        </tbody></table>
      </div>
    </details>
  </section>

  <section aria-labelledby="temperatures-title">
    <h2 id="temperatures-title">What happens as it gets colder</h2>
    <p>Heating demand rises with the temperature difference, while heat-pump capacity and COP fall. At the extreme condition the compressor may no longer meet the design load, and resistance backup or a second heat source is required.</p>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Temperature scenarios for the six homes">
      <table id="hp-temperatures">
        <caption>Air-source heat-pump performance at the six test conditions. Electrical energy includes parasitics and supplemental resistance; COP is the compressor COP before parasitics.</caption>
        <thead><tr><th scope="col">Home</th><th scope="col">Outdoor temperature</th><th scope="col">Heating demand (kWh/day)</th><th scope="col">Peak heating load</th><th scope="col">COP</th><th scope="col">Available capacity</th><th scope="col">Resistance backup (kWh/day)</th><th scope="col">Heat-pump electricity (kWh/day)</th><th scope="col">Capacity result</th></tr></thead>
        <tbody>
          ${entries.map((e) => temperatureRows(e).replace(/<tr>/g, `<tr data-home="${esc(e.c.id)}">`).replace(/<th scope="row">/, `<th scope="row">${esc(e.c.name)} · `)).join('')}
        </tbody>
      </table>
    </div>
    <p class="small">The −30 °C case is an extreme design condition, not a typical winter day. Ottawa's 1991–2020 January mean is −9.6 °C; extreme minima near −32 °C have been recorded. A heat pump that works at −30 °C may still be operating at low capacity and low COP.</p>
  </section>

  <section aria-labelledby="configurations-title">
    <h2 id="configurations-title">Three configurations at two temperatures</h2>
    <p>This is the comparison the residents actually face: household only, household plus an air-source heat pump, and household plus a ground-source heat pump. The heat-pump electricity is additional in every case.</p>
    ${configurationTable(entries)}
  </section>

  <section aria-labelledby="seasonal-title">
    <h2 id="seasonal-title">Seasonal balance</h2>
    <p>The monthly chart and table for Woodland Cottage show the shape of the problem: household demand is fairly flat, heat-pump electricity peaks in winter, and generation peaks in summer. The battery has to bridge the mismatch.</p>
    <figure class="hp-figure" tabindex="0" role="region" aria-label="Scrollable seasonal heat-pump chart">
      <figcaption><strong>Monthly household, heat-pump and generation balance for Woodland Cottage.</strong> Stacked bars are demand; the line is existing generation.</figcaption>
      ${monthlyChart(first)}
    </figure>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Monthly seasonal balance for Woodland Cottage"><table><caption>Woodland Cottage: monthly household, heat-pump heating, cooling, generation and balance. Daily averages, modelled estimate.</caption><thead><tr><th scope="col">Month</th><th scope="col">Household kWh/day</th><th scope="col">HP heating kWh/day</th><th scope="col">Cooling kWh/day</th><th scope="col">Combined kWh/day</th><th scope="col">Generation kWh/day</th><th scope="col">Balance kWh/day</th></tr></thead><tbody>${first.s.ashp.monthly.months.map((m) => { const house = m.season === 'summer' ? first.s.household.consumption.summer_daily_kwh : m.season === 'winter' ? first.s.household.consumption.winter_full_time_daily_kwh : first.s.household.consumption.shoulder_daily_kwh; const combined = house + m.heating_electric_kwh_day + m.cooling_electric_kwh_day; const gen = first.s.household.generation.months[m.monthIndex].kwh_per_day; const bal = gen - combined; return `<tr><th scope="row">${esc(m.label)}</th><td>${n(house, 1)}</td><td>${n(m.heating_electric_kwh_day, 1)}</td><td>${n(m.cooling_electric_kwh_day, 1)}</td><td>${n(combined, 1)}</td><td>${n(gen, 1)}</td><td>${bal >= 0 ? '+' : ''}${n(bal, 1)}</td></tr>`; }).join('')}</tbody></table></div>
  </section>

  <section aria-labelledby="strategies-title">
    <h2 id="strategies-title">Six operating strategies</h2>
    <p>The question is not only “which heat pump?” but “when should it run, and what covers the rest?” The strategies are annual energy balances, not control designs.</p>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Heat-pump operating strategies for the six homes">
      <table id="hp-strategies">
        <caption>Operating strategies. The additional panels and battery are indicative; the hybrid strategy still depends on physical wood handling.</caption>
        <thead><tr><th scope="col">Home and strategy</th><th scope="col">Heat-pump electricity (kWh/yr)</th><th scope="col">Additional panels</th><th scope="col">Additional battery (kWh)</th><th scope="col">Wood heat (kWh thermal)</th><th scope="col">Unserved heat (kWh thermal)</th><th scope="col">Note</th></tr></thead>
        <tbody>${entries.map((e) => strategyRows(e)).join('')}</tbody>
      </table>
    </div>
    <p class="small">Strategy B uses only surplus solar after household demand and reserve. It is a summer cooling, shoulder-season and occasional winter-day strategy; it is not full winter heating. Strategy C assumes wood provides about 60% of annual heating and the heat pump displaces the rest. Strategy D is the full-electric case that drives the large panel and battery counts.</p>
  </section>

  <section aria-labelledby="passive-title">
    <h2 id="passive-title">Passive design first</h2>
    <p>A plausible passive package — better walls, roof and windows, lower airtightness, better heat recovery and better summer shading — reduces the heating demand before any equipment is added. The table shows the reduction and the panels avoided.</p>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Passive design benefits">
      <table id="hp-passive">
        <caption>Effect of a plausible passive package on annual heating, design load, heat-pump electricity and additional panels. Not costed and not a guarantee.</caption>
        <thead><tr><th scope="col">Home</th><th scope="col">Annual heating before</th><th scope="col">Annual heating after</th><th scope="col">Design load before</th><th scope="col">Design load after</th><th scope="col">HP electricity avoided</th><th scope="col">Panels avoided</th></tr></thead>
        <tbody>${entries.map((e) => `<tr><th scope="row">${esc(e.c.name)}</th><td>${f0(e.s.passive.baseline.annual_heating_kwh)} kWh</td><td>${f0(e.s.passive.improved.annual_heating_kwh)} kWh</td><td>${n(e.s.passive.baseline.design_load_w / 1000, 1)} kW</td><td>${n(e.s.passive.improved.design_load_w / 1000, 1)} kW</td><td>${f0(e.s.passive.reduction.hp_electric_kwh)} kWh</td><td>${e.s.passive.reduction.panels_avoided}</td></tr>`).join('')}</tbody>
      </table>
    </div>
    <p class="small">The passive package is not a substitute for a heat pump in every home, and it does not solve the winter cloud problem. It reduces the size of the system that would otherwise be needed.</p>
  </section>

  <section aria-labelledby="resilience-title">
    <h2 id="resilience-title">Winter resilience, with the heat pump on</h2>
    <p>These scenarios keep the existing household battery and add the heat-pump load. Household electricity is prioritised over heating when supply is short. Wood heat is limited to the recorded daily stove capability; it is not assumed to run at full output for 24 hours.</p>
    ${entries.map((e) => `<details class="hp-resilience"><summary>${esc(e.c.name)}: resilience scenarios</summary><div class="table-wrap" tabindex="0" role="region" aria-label="${esc(e.c.name)} heat-pump resilience scenarios"><table><caption>${esc(e.c.name)}: synthetic heat-pump resilience scenarios. Not a weather forecast.</caption><thead><tr><th scope="col">Scenario</th><th scope="col">Days</th><th scope="col">Outdoor</th><th scope="col">Household kWh/day</th><th scope="col">HP electricity kWh/day</th><th scope="col">Generation kWh/day</th><th scope="col">Wood heat kWh/day</th><th scope="col">End SOC</th><th scope="col">Household unserved</th><th scope="col">Heat unserved</th><th scope="col">Status</th></tr></thead><tbody>${resilienceRows(e)}</tbody></table></div></details>`).join('')}
  </section>

  <section id="explorer" aria-labelledby="explorer-title">
    <h2 id="explorer-title">Heat-pump explorer</h2>
    <p>Change one assumption at a time. The existing reference array and battery are the starting point; enabling a heat pump adds load rather than resizing the installation. The results never leave your browser.</p>
    <noscript><p class="notice">The interactive explorer needs JavaScript. The comparison, temperature, configuration, strategy, passive and resilience tables above and below are complete without it.</p></noscript>
    <form id="hp-form" class="hp-form" novalidate>
      <fieldset><legend>Home</legend>
        <div class="hp-field"><label for="hp-residence">Residence</label><select id="hp-residence">${entries.map((e) => `<option value="${esc(e.c.id)}">${esc(e.c.name)}</option>`).join('')}</select></div>
        <div class="hp-field"><label for="hp-type">Heat pump type</label><select id="hp-type"><option value="air-source">Air-source (cold climate)</option><option value="ground-source">Ground-source</option></select></div>
        <div class="hp-field"><label for="hp-temperature">Outdoor temperature</label><select id="hp-temperature">${[-30, -20, -10, 0, 5, 10, 25, 30].map((c) => `<option value="${c}">${c} °C</option>`).join('')}</select></div>
        <div class="hp-field"><label for="hp-indoor">Indoor target temperature (°C)</label><input id="hp-indoor" type="number" min="16" max="22" step="1" value="20"></div>
      </fieldset>
      <fieldset><legend>Existing installation and demand</legend>
        <div class="hp-field"><label for="hp-panels">Existing panels</label><input id="hp-panels" type="number" min="2" max="16" step="1" value="${first.s.additional.panels_ashp.existing_panels}"></div>
        <div class="hp-field"><label for="hp-battery">Existing battery (kWh nominal)</label><input id="hp-battery" type="number" min="2" max="40" step="1" value="${first.s.additional.battery_ashp.existing_nominal_kwh}"></div>
        <div class="hp-field"><label for="hp-consumption">Baseline household electricity (kWh/day)</label><input id="hp-consumption" type="number" min="0.5" max="12" step="0.1" value="${first.s.household.consumption.summer_daily_kwh}"><p class="hp-help">Scales the appliance assumptions to this summer daily total. The heat-pump load stays additional.</p></div>
        <div class="hp-field"><label for="hp-solar">Solar availability for the stress test (%)</label><input id="hp-solar" type="number" min="0" max="100" step="5" value="25"><p class="hp-help">Used for the five-day shortfall only. It does not change the annual panel calculation.</p></div>
      </fieldset>
      <fieldset><legend>Envelope and supply</legend>
        <div class="hp-field"><label for="hp-envelope">Envelope</label><select id="hp-envelope"><option value="baseline">Baseline assumptions</option><option value="passive">Improved passive package</option></select></div>
        <div class="hp-field"><label for="hp-shading">Exterior summer shading</label><select id="hp-shading"><option value="0.55">Documented shading intent</option><option value="0.35">More effective shading</option><option value="0.75">Limited shading</option></select></div>
        <div class="hp-field"><label for="hp-cop">Heat-pump COP adjustment (%)</label><input id="hp-cop" type="number" min="60" max="140" step="5" value="100"><p class="hp-help">Use 100% for the illustrative curve; test a lower value for a conservative product or installation.</p></div>
        <div class="hp-field"><label for="hp-wood">Wood heating</label><select id="hp-wood"><option value="yes">Available</option><option value="no">Not assumed</option></select></div>
        <div class="hp-field"><label for="hp-shared">Shared electricity</label><select id="hp-shared"><option value="yes">Community backup</option><option value="no">None</option></select></div>
        <div class="hp-field"><label for="hp-days">Autonomy target (days)</label><input id="hp-days" type="number" min="1" max="5" step="1" value="3"></div>
        <div class="hp-field"><label for="hp-cloud-days">Cloudy days in the stress test</label><input id="hp-cloud-days" type="number" min="1" max="10" step="1" value="5"></div>
      </fieldset>
      <div class="hp-actions"><button type="button" id="hp-reset">Reset</button><button type="button" id="hp-download">Download this result as JSON</button></div>
    </form>
    <div id="hp-status" class="hp-status" role="status" aria-live="polite" aria-atomic="true">Showing the baseline air-source case for ${esc(first.c.name)}.</div>
    <div id="hp-results" class="hp-results">
      <h3>Results for <span id="hp-result-home">${esc(first.c.name)}</span></h3>
      <dl class="hp-metrics">
        <div><dt>Heating demand</dt><dd><output id="hp-out-demand">—</output> kWh/day</dd></div>
        <div><dt>Heat-pump electricity</dt><dd><output id="hp-out-electric">—</output> kWh/day</dd></div>
        <div><dt>Cooling demand</dt><dd><output id="hp-out-cool-demand">—</output> kWh/day</dd></div>
        <div><dt>Cooling electricity</dt><dd><output id="hp-out-cool-electric">—</output> kWh/day</dd></div>
        <div><dt>Resistance backup</dt><dd><output id="hp-out-backup">—</output> kWh/day</dd></div>
        <div><dt>Household + HP total</dt><dd><output id="hp-out-total">—</output> kWh/day</dd></div>
        <div><dt>Additional panels</dt><dd><output id="hp-out-panels">—</output></dd></div>
        <div><dt>Additional panel area</dt><dd><output id="hp-out-area">—</output> m²</dd></div>
        <div><dt>Remaining roof area</dt><dd><output id="hp-out-roof">—</output> m²</dd></div>
        <div><dt>Additional battery</dt><dd><output id="hp-out-battery">—</output> kWh</dd></div>
        <div><dt>Combined peak</dt><dd><output id="hp-out-peak">—</output> kW</dd></div>
        <div><dt>Five-day shortfall</dt><dd><output id="hp-out-shortfall">—</output> kWh</dd></div>
      </dl>
      <p id="hp-summary" class="small">—</p>
      <div id="hp-warnings"></div>
    </div>
    <p class="small">The calculator reports the incremental result at one outdoor temperature and the full winter-critical panel count for the selected home. It does not select equipment, size ductwork or design a ground loop.</p>
  </section>

  <section aria-labelledby="assumptions-title">
    <h2 id="assumptions-title">Assumptions, exclusions and reviews</h2>
    <ul>
      <li><strong>Baseline unchanged.</strong> Household electricity and the existing reference arrays are unchanged. Heat-pump electricity is additional. No panel is removed or resized automatically.</li>
      <li><strong>Envelope.</strong> U-values: wall 0.18, roof 0.12, floor 0.15, window 0.95, door 1.2 W/m²K; thermal-bridge allowance 10%; ACH50 1.0–1.5; HRV 85%. These are assumptions, not tested performance.</li>
      <li><strong>Climate.</strong> Monthly mean temperatures are Ottawa (City) 1991–2020 normals. The −30 °C case is an extreme design condition. The model is a steady-state daily balance, not an hourly simulation.</li>
      <li><strong>Heat pump.</strong> Illustrative cold-climate COP and capacity curves informed by the NEEP cold-climate specification test points. Confirm the selected model's published table. Ground-source COP is held constant; the ground loop, boreholes and geology are not designed.</li>
      <li><strong>Excluded.</strong> Ductwork, distribution losses, domestic hot water, laundry, EV charging, cooking changes, cooling humidity, defrost water disposal, noise, refrigerant, maintenance and cost.</li>
      <li><strong>Wood heat is not universal.</strong> Stove capacity, fuel storage, physical ability, indoor air quality and chimney maintenance are not guaranteed. The Accessible Garden Home cannot rely on wood handling by a resident.</li>
      <li><strong>Required reviews.</strong> Mechanical design and heat-loss calculation; electrical design and service upgrade; structural review for additional panels and equipment; ground-source geotechnical and hydrogeological review; fire separation for battery and plant; accessibility review; cost and lifecycle assessment.</li>
    </ul>
    <p class="small">Sources: Natural Resources Canada heat-pump guidance; NRCan <em>Keeping the Heat In</em>; Environment and Climate Change Canada 1991–2020 climate normals for Ottawa; NEEP cold-climate air-source heat-pump specification; the project's residential energy model. See <a href="https://github.com/mgifford/Containers-Hamlet/blob/main/docs/heat-pump-energy-assessment.md">the full methodology</a>.</p>
  </section>
</main>
<script src="../../js/design-schema.js"></script>
<script src="../../js/design-energy.js"></script>
<script src="../../js/design-model.js"></script>
<script src="../../js/design-thermal.js"></script>
<script src="../concepts-selected.js"></script>
<script src="heat-pump-app.js"></script>
</body>
</html>`;
}
