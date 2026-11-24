// Code: MIT.
import { designShellNav } from './design-nav.mjs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const DesignEnergy = require('../../site/js/design-energy.js');
const DesignThermal = require('../../site/js/design-thermal.js');
const f2 = (v) => (v == null || !Number.isFinite(Number(v)) ? '—' : (Math.round(Number(v) * 100) / 100).toFixed(2));
const f1 = (v) => (v == null || !Number.isFinite(Number(v)) ? '—' : (Math.round(Number(v) * 10) / 10).toFixed(1));
const f0 = (v) => (v == null || !Number.isFinite(Number(v)) ? '—' : (Math.round(Number(v))).toString());
import { patternLensSection } from './design-annotations.mjs';
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
  if (kind === 'interior-plan-upper') return `Concept upper-floor interior plan generated from the provisional room bands. It is not a construction drawing or a verified accessibility assessment.`;
  if (kind === 'interior-plan') return `Concept interior floor plan generated from the room polygons, partitions, doors, fixtures and clearances. Inferred rooms are hatched. The plan is a spatial model, not a construction drawing or a verified accessibility assessment.`;
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
  const geometry = ['plan', 'plan-ground', 'plan-upper', 'cutaway', 'porch', 'section', 'exploded', 'elevation-south', 'elevation-north', 'elevation-east', 'elevation-west', 'container-layout', 'container-layout-elevation', 'roof-plan', 'interior-plan', 'interior-plan-upper', 'exterior-opposite', 'approach', 'site-facing'].indexOf(kind) >= 0;
  const badge = geometry ? 'Geometry-backed drawing' : 'Illustrative / explanatory study';
  const badgeClass = geometry ? 'geometry' : 'illustrative';
  const alt = kind && kind.indexOf('elevation') === 0
    ? `${c.name}: ${title}. The ${kind.split('-')[1]} elevation is generated from the same module elevations, openings and roof as the plan. Conceptual only.`
    : `${c.name}: ${title.toLowerCase()}. ${viewCaption(c, kind)}`;
  return `        <figure class="slide" data-slide data-title="${esc(title)}">
          <img src="${src}" alt="${esc(alt)}" width="${size.width}" height="${size.height}" loading="${kind === 'exterior' ? 'eager' : 'lazy'}" decoding="async">
          <figcaption><span class="badge ${badgeClass}">${badge}</span> <strong>${esc(title)}</strong> ${esc(viewCaption(c, kind))}</figcaption>
        </figure>`;
}


function energySection(c, profile) {
  if (!c.energy || !profile.energy) return '';
  const e = DesignEnergy.normalizeEnergy(c).energy;
  const s = profile.energy;
  const summer = DesignEnergy.loadsForProfile(c, 'summer');
  const winter = DesignEnergy.loadsForProfile(c, 'winter-full-time');
  const summerById = Object.fromEntries(summer.rows.map((r) => [r.id, r]));
  const winterById = Object.fromEntries(winter.rows.map((r) => [r.id, r]));
  const arrays = e.solar.arrays || [];
  const canopies = e.solar.canopies || [];
  const scenarios = s.scenarios || [];
  const b = e.battery;
  const loadRows = e.loads.map((l) => {
    const a = summerById[l.id] || { daily_kwh: 0, hours: 0 };
    const w = winterById[l.id] || { daily_kwh: 0, hours: 0 };
    return `<tr>
      <th scope="row">${esc(l.name)}</th>
      <td>${esc(l.class.replace(/-/g, ' '))}${l.essential ? ' · essential' : ''}</td>
      <td>${f1(l.rated_w)} W${l.quantity > 1 ? ' × ' + l.quantity : ''}</td>
      <td>${f1(a.hours)} / ${f1(l.hours.shoulder)} / ${f1(w.hours)} h</td>
      <td>${f1(l.duty_cycle * 100)}%</td>
      <td>${f2(a.daily_kwh)}</td>
      <td>${f2(w.daily_kwh)}</td>
      <td>${esc(l.ac_dc.toUpperCase())}</td>
      <td>${l.deferrable ? 'Yes' : 'No'}</td>
      <td>${esc(l.confidence)}</td>
      <td>${esc(l.source)} ${l.notes ? '<br><span class="small">' + esc(l.notes) + '</span>' : ''}</td>
    </tr>`;
  }).join('');
  const monthlyRows = s.generation.months.map((m) => {
    const use = m.season === 'summer' ? s.consumption.summer_daily_kwh : m.season === 'winter' ? s.consumption.winter_full_time_daily_kwh : s.consumption.shoulder_daily_kwh;
    const bal = m.kwh_per_day - use;
    return `<tr><th scope="row">${esc(m.label)}</th><td>${f1(m.kwh)}</td><td>${f1(m.kwh_per_day)}</td><td>${f1(use)}</td><td>${bal >= 0 ? '+' : ''}${f1(bal)}</td><td>${f1(m.shade_pct)}%</td><td>${f2(m.snow_availability)}</td></tr>`;
  }).join('');
  const scenarioRows = scenarios.map((sc) => `<tr>
    <th scope="row">${esc(sc.label)}</th>
    <td>${sc.days}</td>
    <td>${f1(sc.total.load)}</td>
    <td>${f1(sc.total.generation)}</td>
    <td>${f1(sc.total.supplemental)}</td>
    <td>${f1(sc.total.unserved)}</td>
    <td>${sc.end_soc_pct}%</td>
    <td>${esc(sc.status)}</td>
  </tr>`).join('');
  return `<section class="assembly-section energy-section" aria-labelledby="energy-title" id="energy">
    <h2 id="energy-title">Residential energy model</h2>
    <p><strong>${s.panels} panels · ${f1(s.capacity_kwp)} kWp · ${f1(s.panel_area_m2)} m² of module surface · ${f1(s.battery.nominal_kwh)} kWh battery (${f1(s.battery.usable_kwh)} kWh usable).</strong> ${esc(s.occupancy.label)}. Suitable for: ${esc((s.suitable_patterns || []).join('; '))}.</p>
    <p>${esc(s.occupancy.notes)}</p>
    <p class="notice">This is a conceptual daily and hourly energy balance, not a solar resource assessment, electrical design, structural design or off-grid guarantee. The load list, array geometry and battery limits are the canonical inputs; the drawings and this table are generated from them. <a href="../../energy/">Open the energy explorer</a> to test another configuration.</p>
    <h3>Arrays and mounting</h3>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Photovoltaic arrays for ${esc(c.name)}"><table class="exposure-table"><caption>Every installed panel is placed in the canonical geometry. The count here is the count used in the energy calculation and in every drawing.</caption><thead><tr><th scope="col">Array</th><th scope="col">Panels</th><th scope="col">Tilt / azimuth</th><th scope="col">Mounting</th><th scope="col">Supporting surface</th><th scope="col">Electrical group</th><th scope="col">Maintenance</th><th scope="col">Snow</th></tr></thead><tbody>
      ${arrays.map((a) => `<tr><th scope="row">${esc(a.label)} <span class="small">(${esc(a.id)})</span></th><td>${a.module_count} × ${a.module.watts} W</td><td>${a.tilt_deg}° / ${a.azimuth_deg}°</td><td>${esc(a.mounting.replace(/-/g, ' '))}</td><td>${esc((a.surface.kind || '') + (a.surface.module ? ' · ' + a.surface.module : '') + (a.surface.canopy ? ' · ' + a.surface.canopy : '') + (a.surface.porch ? ' · ' + a.surface.porch : ''))}</td><td>${esc(a.electrical_group)}</td><td>${esc(a.maintenance.access)}; ${esc(a.maintenance.note)}</td><td>${esc(a.snow.note)}</td></tr>`).join('')}
    </tbody></table></div>
    ${canopies.length ? `<h3>Independent canopies</h3><ul>${canopies.map((cp) => `<li><strong>${esc(cp.label)}</strong>: ${f1(cp.length_m)} × ${f1(cp.depth_m)} m, ${f1(cp.height_m)} m high, at (${f1(cp.position_m[0])}, ${f1(cp.position_m[1])}) m. ${esc(cp.note)}</li>`).join('')}</ul>` : ''}
    <h3>Battery and inverter</h3>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Battery and inverter assumptions"><table class="exposure-table"><caption>Battery assumptions. Usable capacity, SOC limits and efficiencies are equipment-dependent and require confirmation.</caption><tbody>
      <tr><th scope="row">Technology / architecture</th><td>${esc(b.technology)} · ${b.architecture_v} V</td></tr>
      <tr><th scope="row">Nominal / usable</th><td>${f1(b.nominal_kwh)} kWh / ${f1(b.usable_kwh)} kWh</td></tr>
      <tr><th scope="row">SOC window</th><td>${b.min_soc_pct}%–${b.max_soc_pct}%</td></tr>
      <tr><th scope="row">Charge / discharge efficiency</th><td>${Math.round(b.charge_efficiency * 100)}% / ${Math.round(b.discharge_efficiency * 100)}%</td></tr>
      <tr><th scope="row">Max charge / discharge</th><td>${f1(b.max_charge_kw)} kW / ${f1(b.max_discharge_kw)} kW</td></tr>
      <tr><th scope="row">Inverter / standby</th><td>${f1(b.inverter_kw)} kW / ${f1(b.inverter_standby_w)} W</td></tr>
      <tr><th scope="row">Essential reserve / target</th><td>${f1(b.essential_reserve_kwh)} kWh / ${b.target_autonomy_days} days</td></tr>
      <tr><th scope="row">Temperature and enclosure</th><td>Charge min ${b.temp_limits.charge_min_c} °C · discharge min ${b.temp_limits.discharge_min_c} °C · ${b.heated_enclosure ? 'heated enclosure' : 'no heated enclosure'}</td></tr>
      <tr><th scope="row">Location</th><td>${esc(b.location)}</td></tr>
    </tbody></table></div>
    <p class="small">${esc(b.note)}</p>
    <h3>Autonomy and winter resilience</h3>
    <p>Essential autonomy: <strong>${s.autonomy.essential_days == null ? '—' : f1(s.autonomy.essential_days) + ' days'}</strong>. Ordinary autonomy: <strong>${s.autonomy.ordinary_days == null ? '—' : f1(s.autonomy.ordinary_days) + ' days'}</strong> (the essential reserve stays intact). The figures below are deterministic synthetic scenarios; weather is not a forecast.</p>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Energy resilience scenarios"><table class="exposure-table"><caption>Ten repeatable resilience scenarios. A positive unserved value is a design result, not a software failure.</caption><thead><tr><th scope="col">Scenario</th><th scope="col">Days</th><th scope="col">Load (kWh)</th><th scope="col">Generation (kWh)</th><th scope="col">Shared supply (kWh)</th><th scope="col">Unserved (kWh)</th><th scope="col">End SOC</th><th scope="col">Status</th></tr></thead><tbody>${scenarioRows}</tbody></table></div>
    <p class="small">The five-day cloudy result without shared electricity is <strong>${f1(s.supplementary_daily_kwh)} kWh/day</strong> unserved. A battery that lasts three days is not sufficient if the array cannot recharge it while supplying the household. ${esc(s.winter_risk.note)}</p>
    <h3>Monthly generation and consumption</h3>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Monthly generation and consumption"><table class="exposure-table"><caption>Monthly estimates. Snow availability reduces winter generation; the shading column is the modelled monthly shade loss. Losses are applied once and are listed in the model assumptions.</caption><thead><tr><th scope="col">Month</th><th scope="col">Generation (kWh)</th><th scope="col">Per day</th><th scope="col">Consumption per day</th><th scope="col">Balance per day</th><th scope="col">Shading</th><th scope="col">Snow availability</th></tr></thead><tbody>${monthlyRows}</tbody></table></div>
    <details class="energy-loads"><summary>Load list and calculation for ${esc(c.name)}</summary>
      <p>Daily consumption is calculated from rated power, quantity, hours, duty cycle and the profile's class factor. It is not assigned from floor area. Summer and winter columns show the full-time profiles; the intermittent winter profile reduces discretionary and high-demand loads.</p>
      <div class="table-wrap" tabindex="0" role="region" aria-label="Residential load list"><table class="exposure-table"><caption>Every load present in the residence. "Summer" and "winter" are daily kWh for the full-time profile. The assumption source and confidence are part of the record.</caption><thead><tr><th scope="col">Load</th><th scope="col">Class</th><th scope="col">Rated power</th><th scope="col">Summer / shoulder / winter hours</th><th scope="col">Duty</th><th scope="col">Summer kWh/day</th><th scope="col">Winter kWh/day</th><th scope="col">Supply</th><th scope="col">Deferrable</th><th scope="col">Confidence</th><th scope="col">Source and note</th></tr></thead><tbody>${loadRows}</tbody></table></div>
    </details>
    <h3>Heating, hot water and other excluded loads</h3>
    <p>The base estimate excludes electric resistance space heating, conventional electric domestic hot water, electric laundry, additional cooking appliances and electric vehicle charging. These optional profiles are shown separately:</p>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Optional energy profiles"><table class="exposure-table"><caption>Optional loads and their indicative daily demand. Enabling any of them changes the required array and battery; the note explains the consequence.</caption><thead><tr><th scope="col">Optional profile</th><th scope="col">Summer</th><th scope="col">Shoulder</th><th scope="col">Winter</th><th scope="col">Consequence</th></tr></thead><tbody>${(e.optional_profiles || []).map((o) => `<tr><th scope="row">${esc(o.label)}</th><td>${f1(o.daily_kwh.summer)} kWh</td><td>${f1(o.daily_kwh.shoulder)} kWh</td><td>${f1(o.daily_kwh.winter)} kWh</td><td>${esc(o.note)}</td></tr>`).join('')}</tbody></table></div>
    <p class="small">A heat pump would change the system substantially. The project does not quietly absorb heating into the residential totals; the shared lodge is the preferred location for higher-energy services such as laundry and emergency charging.</p>
    <h3>Shared community electricity</h3>
    <p>The primary configuration is <strong>${esc(e.shared.primary_configuration.replace(/-/g, ' '))}</strong>. Shared electricity is an option, not an unexplained assumption.</p>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Shared electricity configurations"><table class="exposure-table"><caption>Three configurations compared. A microgrid shares supply and demand but does not remove the effect of region-wide winter cloud or snow.</caption><thead><tr><th scope="col">Configuration</th><th scope="col">Description</th><th scope="col">Supplementary (kWh/day)</th><th scope="col">Distribution loss</th><th scope="col">Note</th></tr></thead><tbody>${(e.shared.options || []).map((o) => `<tr><th scope="row">${esc(o.label)}</th><td>${esc(o.description)}</td><td>${f1(o.supplemental_kwh_per_day)}</td><td>${o.distribution_loss_pct}%</td><td>${esc(o.note)}</td></tr>`).join('')}</tbody></table></div>
    <p class="small">${esc(e.shared.governance_note)}</p>
    <h3>Validation and required reviews</h3>
    <ul>${(profile.energy_validation.issues || []).map((i) => `<li><strong>${esc(i.category.replace(/-/g, ' '))}:</strong> ${esc(i.message)}</li>`).join('')}</ul>
    <p class="small">${esc((e.evidence && e.evidence.uncertainties || []).join(' '))}</p>
  </section>`;
}


function heatPumpSection(c) {
  if (!c.energy || !c.energy.thermal) return '';
  const s = DesignThermal.summary(c);
  if (!s) return '';
  const p = s.additional.panels_ashp, b = s.additional.battery_ashp, inv = s.additional.inverter;
  const tRows = s.ashp.table.map((r) => `<tr><th scope="row">${esc(r.label)} (${r.outdoor_c} °C)</th><td>${f1(r.heating_kwh_day)}</td><td>${f1(r.heating_peak_w / 1000)}</td><td>${f2(r.cop)}</td><td>${f1(r.capacity_kw)}</td><td>${f1(r.supplemental_kwh_day)}</td><td>${f1(r.electrical_kwh_day)}</td><td>${r.meets_design_load ? 'Capacity covers the load' : 'Supplemental heat needed'}</td></tr>`).join('');
  const stratRows = s.strategies.strategies.map((r) => `<tr><th scope="row">${esc(r.id)} · ${esc(r.label)}</th><td>${f0(r.hp_electric_kwh)}</td><td>${r.additional_panels}</td><td>${r.additional_battery_kwh}</td><td>${f0(r.wood_thermal_kwh)}</td><td>${f0(r.unserved_thermal_kwh)}</td></tr>`).join('');
  const resilRows = s.resilience.scenarios.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${r.days}</td><td>${r.outdoor_c} °C</td><td>${f1(r.heat_pump_electric_kwh_day)}</td><td>${f1(r.generation_kwh_day)}</td><td>${r.end_soc_pct}%</td><td>${f1(r.unserved_household_kwh)}</td><td>${f1(r.unserved_heat_kwh)}</td><td>${esc(r.status)}</td></tr>`).join('');
  return `<section class="assembly-section heat-pump-section" aria-labelledby="heat-pump-title" id="heat-pump">
    <h2 id="heat-pump-title">Heat-pump assessment</h2>
    <p><strong>Design heat load at −30 °C: ${f1(s.monthly.design_heat_load_w / 1000)} kW.</strong> Annual heating ${f0(s.monthly.annual_heating_kwh)} kWh thermal; annual cooling ${f0(s.monthly.annual_cooling_kwh)} kWh. An air-source heat pump would use about <strong>${f0(s.ashp.monthly.annual_heating_electric_kwh)} kWh/year for heating</strong> and ${f0(s.ashp.monthly.annual_cooling_electric_kwh)} kWh/year for cooling, in addition to the household load.</p>
    <p class="notice">The existing household demand and reference array are unchanged. Full-time heat-pump heating would require about <strong>${p.additional_panels} additional winter-critical panels</strong> (${f1(p.additional_area_m2)} m²), ${b.three_day_kwh} kWh of additional battery for three days and a combined peak of ${f1(inv.total_peak_kw)} kW. ${p.fits_existing_roof ? 'The additional area is within the remaining roof area in principle.' : 'That panel area exceeds the remaining roof area; a ground array, canopy or shared array would be required.'} This is why the project does not present full-time electric heating as a drop-in off-grid service.</p>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Heat-pump performance at six temperatures"><table class="exposure-table"><caption>Air-source heat-pump performance. COP is the compressor COP; electrical energy includes parasitics and supplemental resistance. These are illustrative curves, not a selected product.</caption><thead><tr><th scope="col">Condition</th><th scope="col">Heating demand (kWh/day)</th><th scope="col">Peak load (kW)</th><th scope="col">COP</th><th scope="col">Available capacity (kW)</th><th scope="col">Resistance backup (kWh/day)</th><th scope="col">Electrical (kWh/day)</th><th scope="col">Capacity result</th></tr></thead><tbody>${tRows}</tbody></table></div>
    <h3>Operating strategies</h3>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Heat-pump operating strategies"><table class="exposure-table"><caption>Annual energy balances for six strategies. Strategy D is the full-electric case; it is not the recommended default.</caption><thead><tr><th scope="col">Strategy</th><th scope="col">HP electricity (kWh/yr)</th><th scope="col">Additional panels</th><th scope="col">Additional battery (kWh)</th><th scope="col">Wood heat (kWh thermal)</th><th scope="col">Unserved heat (kWh thermal)</th></tr></thead><tbody>${stratRows}</tbody></table></div>
    <h3>Passive design and resilience</h3>
    <p>A plausible passive package would reduce annual heating by ${f0(s.passive.reduction.annual_heating_kwh)} kWh, avoid about ${f0(s.passive.reduction.hp_electric_kwh)} kWh/year of heat-pump electricity and avoid ${s.passive.reduction.panels_avoided} additional panels. It does not remove the winter cloud risk.</p>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Heat-pump resilience scenarios"><table class="exposure-table"><caption>Synthetic heat-pump resilience scenarios. Household electricity is prioritised over heating when supply is short.</caption><thead><tr><th scope="col">Scenario</th><th scope="col">Days</th><th scope="col">Outdoor</th><th scope="col">HP electricity (kWh/day)</th><th scope="col">Generation (kWh/day)</th><th scope="col">End SOC</th><th scope="col">Household unserved</th><th scope="col">Heat unserved</th><th scope="col">Status</th></tr></thead><tbody>${resilRows}</tbody></table></div>
    <p class="small">${esc(s.note)} Wood heat is a design intent and is not appropriate for every resident. See <a href="../../heat-pumps/">the heat-pump assessment</a> for the method, charts and the interactive explorer.</p>
  </section>`;
}

export function architecturePage(c, sizes, profile, annotationData, patterns) {
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
    sizes['interior-plan'] ? slide(c, 'interior-plan', 'Ground-floor interior plan', `../../views/${c.id}-interior-plan.svg`, sizes['interior-plan']) : '',
    sizes['interior-plan-upper'] ? slide(c, 'interior-plan-upper', 'Upper-floor interior plan', `../../views/${c.id}-interior-plan-upper.svg`, sizes['interior-plan-upper']) : '',
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
  <link rel="icon" href="../../../assets/favicon.svg" type="image/svg+xml">
</head>
<body class="lab-page">
<a class="skip" href="#main">Skip to content</a>
${designShellNav(3, 'gallery')}
<main id="main" class="lab-main">
  <p class="eyebrow">Architectural gallery · ${esc(c.group)} · ${esc(c.role === 'hamlet-selected' ? 'hamlet residence' : c.role === 'common-lodge' ? 'common lodge' : c.role === 'archive-experimental' ? 'experimental archive' : 'archive concept')}</p>
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
      <figure><img src="../../views/${c.id}-exterior.svg" width="1040" height="700" alt="Summer exterior of ${esc(c.name)} with vegetation and seasonal foliage." loading="lazy" decoding="async"><figcaption><span class="badge illustrative">Illustrative study</span> Summer: planting, shade and outdoor use.</figcaption></figure>
      <figure><img src="../../views/${c.id}-winter.svg" width="1040" height="700" alt="Winter exterior of ${esc(c.name)} showing evergreen screening and dormant deciduous planting." loading="lazy" decoding="async"><figcaption><span class="badge illustrative">Illustrative study</span> Winter: evergreen screening, dormant deciduous planting and snow.</figcaption></figure>
    </div>
    <h3>Summer and winter solar studies</h3>
    <div class="season-pair">
      <figure><img src="../../views/${c.id}-solar-summer.svg" width="1040" height="520" alt="Summer solar study for ${esc(c.name)}: a high sun angle and the roof overhang are shown qualitatively." loading="lazy" decoding="async"><figcaption><span class="badge illustrative">Explanatory study</span> Summer: high sun and overhang.</figcaption></figure>
      <figure><img src="../../views/${c.id}-solar-winter.svg" width="1040" height="520" alt="Winter solar study for ${esc(c.name)}: a low sun angle and the south glazing are shown qualitatively." loading="lazy" decoding="async"><figcaption><span class="badge illustrative">Explanatory study</span> Winter: low sun and south glazing.</figcaption></figure>
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
    <img src="../../systems/wall-${esc(c.envelope.assembly)}.svg" width="1040" height="640" alt="Explanatory wall section for the ${esc(c.envelope.assembly)} assembly: steel container wall, air and vapour control, insulation, thermal break, ventilated cavity and cladding, with vegetation clearance." loading="lazy" decoding="async">
    <h3>Layers</h3>
    <ul class="assembly-layers">${c.envelope.layers.map((l) => `<li>${esc(l.material)} — ${l.thickness_mm} mm (${esc(l.role)})</li>`).join('')}</ul>
    <p class="small">Condensation, fire, moisture, fastening, structural penetrations and maintenance all need project review. The designer does not claim this assembly is compliant or moisture-safe.</p>
  </section>

  <section class="foundation-section" aria-labelledby="foundation-title">
    <h2 id="foundation-title">Foundation and ground</h2>
    <p><strong>${esc(c.foundation.system)}</strong> · ${c.foundation.clearance_m} m clearance · ${c.foundation.no_compaction ? 'no compaction intent' : 'compaction unresolved'} · independent decks: ${c.foundation.independent_deck ? 'yes' : 'no'}.</p>
    <img src="../../systems/foundation-${esc(c.foundation.system)}.svg" width="1040" height="430" alt="Elevated ${esc(c.foundation.system)} foundation section with piles, floor, no fill and a root protection zone." loading="lazy" decoding="async">
    <p class="small">${esc(c.foundation.note)} Geotechnical, frost-uplift, corrosion, lateral, slope, permit and conservation-authority review are required. No fill, slab or compaction is the intent; the construction sequence still needs an arborist and erosion-control plan.</p>
  </section>

  <section class="solar-section" aria-labelledby="solar-title">
    <h2 id="solar-title">Solar tilt and azimuth</h2>
    ${(() => { const sm = c.solar_array || (c.modules.find((m) => m.solar && m.solar.enabled) || c.modules[0]).solar; return `<p><strong>${sm.tilt_deg}° tilt</strong> · ${sm.azimuth_deg}° azimuth · ${esc(sm.season_mode)} strategy. ${esc(sm.note || '')}</p>${c.roof_form ? `<p class="small">Roof: one ${c.roof_form.pitch_deg}° ${c.roof_form.type.replace(/-/g, ' ')} roof${c.roof_form.type === 'gable' ? ' with a clear ridge' : ''}. Solar is mounted only on the south slope; the north slope has no array. Array azimuth is true south, independent of building rotation.</p>` : ''}<img src="../../systems/solar-${sm.tilt_deg}.svg" width="1040" height="400" alt="Explanatory solar section with a ${sm.tilt_deg} degree tilted array facing azimuth ${sm.azimuth_deg} degrees." loading="lazy" decoding="async">`; })()}
    <p class="small">The array layout, tilt and azimuth shown in the drawings come from the same canonical energy model that calculates monthly generation. The tilt range 30–45° is an annual-production exploration range; 55–70° is the winter-oriented range. Orientation is measured from geographic north, independent of the SVG canvas or building rotation. Snow-shedding, wind uplift, roof structure and electrical design still require professional review.</p>
  </section>
  ${energySection(c, profile)}
  ${heatPumpSection(c)}

  <section class="vegetation-section" aria-labelledby="vegetation-title">
    <h2 id="vegetation-title">Vegetation systems</h2>
    ${(c.trellises && c.trellises.length) || (c.vegetation && c.vegetation.length) ? `<ul>
      ${(c.trellises || []).map((t) => `<li><strong>Freestanding trellis</strong> on the ${esc(t.face)} face, ${t.length_m} × ${t.height_m} m; independent support; ${esc(t.note || '')}</li>`).join('')}
      ${(c.vegetation || []).map((v) => `<li><strong>${esc({ 'living-wall': 'Modular living wall', 'edible-wall': 'Edible planter wall', 'privacy-screen': 'Evergreen privacy screen' }[v.type] || v.type)}</strong> on the ${esc(v.face)} face, ${v.length_m} × ${v.height_m} m; ${esc(v.seasonal_foliage)}; clearance ${v.offset_m} m; ${esc(v.support)}; irrigation: ${esc(v.irrigation)}; maintenance: ${esc(v.maintenance)}.</li>`).join('')}
    </ul>` : '<p>No vegetation system is recorded for this concept.</p>'}
    <p class="small">Planting is independently supported where practical. Fire, moisture, structural loads, irrigation, plant selection and maintenance require professional review. <a href="../../vegetation/">Compare the four vegetation systems</a>.</p>
  </section>

  <section class="assembly-section services-section" aria-labelledby="services-title">
    <h2 id="services-title">Fire and water services</h2>
    <p><strong>These are intents and unknowns, not approvals.</strong> The model does not calculate fire-resistance ratings, building separation, radiant heat, sprinkler performance, WUI compliance, rainwater yield, tank sizing, potable-water safety or fire-service water supply.</p>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Fire and water service intents"><table class="exposure-table"><caption>Recorded fire and water intents. A blank or unchecked row is an unresolved question, not a pass.</caption><thead><tr><th scope="col">Service</th><th scope="col">Recorded intent</th><th scope="col">Status</th></tr></thead><tbody>
      <tr><th scope="row">Roof / eave / vent / glazing</th><td>${c.fire ? 'Class ' + esc(c.fire.roof_class) + ' roof; closed noncombustible eaves ' + (c.fire.noncombustible_eaves ? 'intended' : 'not recorded') + '; ember-resistant vents ' + (c.fire.ember_resistant_vents ? 'intended' : 'not recorded') + '; tempered glazing ' + (c.fire.tempered_glazing ? 'intended' : 'not recorded') : 'Not recorded'}</td><td>Concept intent; not a fire-resistance rating</td></tr>
      <tr><th scope="row">Deck / porch / storage</th><td>${c.fire ? 'Noncombustible deck ' + (c.fire.noncombustible_deck ? 'intended' : 'not recorded') + '; exterior shutters ' + (c.fire.exterior_shutters ? 'intended' : 'not recorded') : 'Not recorded'}</td><td>${c.fire && c.fire.noncombustible_deck ? 'Intent' : 'Unresolved — combustible deck/storage risk'}</td></tr>
      <tr><th scope="row">Defensible space</th><td>${c.fire ? esc(String(c.fire.defensible_space_m)) + ' m concept distance' : 'Not recorded'}</td><td>Concept; requires site/fire review</td></tr>
      <tr><th scope="row">Fire-service water</th><td>${c.fire && c.fire.water_access ? 'Recorded as available' : 'Not confirmed'}</td><td>Unresolved; confirm with fire department</td></tr>
      <tr><th scope="row">Rainwater catchment</th><td>${c.water ? esc(c.water.catchment && c.water.catchment.roof ? 'Metal roof catchment; gutters, leaf guards and first flush required' : 'Recorded') : 'Not recorded'}</td><td>${c.water ? esc(c.water.status) : 'Unresolved'}</td></tr>
      <tr><th scope="row">Storage / treatment</th><td>${c.water && c.water.storage ? esc(c.water.storage.type) + '; volume ' + (c.water.storage.volume_L === null ? 'not sized' : esc(String(c.water.storage.volume_L)) + ' L') + '; potable ' + (c.water.treatment && c.water.treatment.potable ? 'claimed' : 'no') : 'Not recorded'}</td><td>No yield, freeze, overflow or water-quality design claimed</td></tr>
      <tr><th scope="row">Fire reserve</th><td>${c.water && c.water.fireReserve ? 'Separate: ' + (c.water.fireReserve.separate ? 'yes' : 'no') + '; connection: ' + esc(c.water.fireReserve.connection) + '; verified: ' + (c.water.fireReserve.verified ? 'yes' : 'no') : 'Not recorded'}</td><td>Unresolved; a daily tank is not a fire reserve</td></tr>
    </tbody></table></div>
    <p class="small">See <a href="../../fire/">fire resilience</a> and <a href="../../water/">water and resilience</a>. No building separation, inter-storey fire separation, cavity barrier, hydrant flow, cistern volume or potable-water treatment is designed here.</p>
  </section>

  ${patternLensSection(c, annotationData, patterns)}
  <section class="architecture-facts" aria-labelledby="facts-title">
    <h2 id="facts-title">Concept facts</h2>
    <dl class="fact-grid">${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    <div class="button-row">
      <a class="action" href="../../data/${c.id}.json" download>Download source JSON</a>
      ${editable ? `<a class="action secondary" href="../../editor/?preset=${c.id}">Open in the editor</a>` : '<a class="action secondary" href="../../editor/">Open the editor</a>'}
      <a class="action secondary" href="../../compare/?a=${c.id}">Compare this concept</a>
      ${c.role === 'hamlet-selected' ? `<a class="action secondary" href="../../illustration/${esc(c.id)}/description.md">Illustration package</a>` : ''}
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
