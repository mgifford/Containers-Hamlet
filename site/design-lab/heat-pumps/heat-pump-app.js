/*
 * Accessible heat-pump explorer.
 * Progressive enhancement over the server-rendered tables on the page.
 * No network requests, no storage, no third-party runtime.
 */
(function () {
  'use strict';

  var T = window.DesignThermal;
  var E = window.DesignEnergy;
  var data = window.DesignLabConcepts;
  var concepts = data && data.concepts ? data.concepts.filter(function (c) { return c.role === 'hamlet-selected'; }) : [];
  var byId = {};
  concepts.forEach(function (c) { byId[c.id] = c; });
  if (!T || !E || !concepts.length) return;

  var $ = function (id) { return document.getElementById(id); };
  var form = $('hp-form');
  var status = $('hp-status');
  var current = null;
  var lastAnnounce = 0;

  function fmt(v, d) {
    if (v == null || !isFinite(v)) return '—';
    var f = Math.pow(10, d == null ? 1 : d);
    return (Math.round(v * f) / f).toFixed(d == null ? 1 : d);
  }
  function esc(v) { return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function num(id) { var el = $(id); if (!el) return null; var v = parseFloat(el.value); return isFinite(v) ? v : null; }
  function resizeArrays(design, total) {
    var arrays = design.energy.solar.arrays || [];
    if (!arrays.length) return;
    var fixed = arrays.slice(1).reduce(function (t, a) { return t + a.module_count; }, 0);
    var first = Math.max(0, Math.min(16, total - fixed));
    if (first < 1) {
      first = 1;
      var left = Math.max(0, total - first);
      arrays.slice(1).forEach(function (a) { a.module_count = Math.min(a.module_count, left); left -= a.module_count; });
    }
    arrays[0].module_count = first;
    arrays[0].columns = Math.max(1, Math.ceil(first / Math.max(1, arrays[0].rows)));
  }

  function setDefaults(concept) {
    var s = T.summary(concept);
    $('hp-residence').value = concept.id;
    $('hp-type').value = 'air-source';
    $('hp-temperature').value = '-10';
    $('hp-indoor').value = '20';
    $('hp-panels').value = s.additional.panels_ashp.existing_panels;
    $('hp-battery').value = s.additional.battery_ashp.existing_nominal_kwh;
    $('hp-consumption').value = s.household.consumption.summer_daily_kwh;
    $('hp-solar').value = '25';
    $('hp-envelope').value = 'baseline';
    $('hp-wood').value = 'no';
    $('hp-shared').value = 'yes';
    $('hp-days').value = '3';
    $('hp-cloud-days').value = '5';
    $('hp-shading').value = '0.55';
    $('hp-cop').value = '100';
  }

  function buildDesign() {
    var base = byId[$('hp-residence').value] || concepts[0];
    var d = JSON.parse(JSON.stringify(base));
    var panels = Math.max(2, Math.min(16, Math.round(num('hp-panels') || 8)));
    resizeArrays(d, panels);
    var battery = num('hp-battery');
    if (battery) { d.energy.battery.nominal_kwh = battery; d.energy.battery.usable_kwh = Math.round(battery * 0.9 * 10) / 10; }
    var consumption = num('hp-consumption');
    if (consumption && consumption > 0) {
      var before = E.loadsForProfile(d, 'summer').daily_kwh;
      if (before > 0) d.energy.loads.forEach(function (l) { l.rated_w = l.rated_w * consumption / before; });
    }
    d.energy.thermal.wood_heat.available = $('hp-wood').value === 'yes';
    d.energy.thermal.solar.shading_factor = parseFloat($('hp-shading').value) || 0.55;
    d.energy.thermal.heat_pump.cop_factor = Math.max(0.6, Math.min(1.4, (parseFloat($('hp-cop').value) || 100) / 100));
    d.energy.shared.primary_configuration = $('hp-shared').value === 'yes' ? 'community-backup' : 'independent';
    if ($('hp-envelope').value === 'passive') d = T.applyPassive(d);
    return d;
  }

  function fiveDayShortfall(d, household, hpDaily, temp, solarPct, shared, woodAvailable, days) {
    days = Math.max(1, Math.min(10, days || 5));
    var battery = E.batteryLimits(d.energy.battery);
    var soc = battery.maxKwh;
    var total = { unserved: 0, house: 0, heat: 0, end: soc };
    var genDaily = E.monthlyGeneration(d).months[temp < 5 ? 0 : temp > 20 ? 6 : 4].kwh_per_day * (solarPct / 100);
    for (var day = 0; day < days; day++) {
      var sim = E.simulateDay({
        design: d, profileId: 'winter-full-time', monthIndex: temp < 5 ? 0 : temp > 20 ? 6 : 4,
        generationKwh: genDaily, startKwh: soc, shared: shared, loadKwh: household + hpDaily
      });
      var unserved = sim.unserved_kwh;
      var heatUnserved = Math.min(hpDaily, unserved);
      total.unserved += unserved;
      total.house += Math.max(0, unserved - heatUnserved);
      total.heat += heatUnserved;
      soc = sim.end_kwh;
      total.end = soc;
    }
    return total;
  }

  function render(announce) {
    var d = buildDesign();
    var s = T.summary(d);
    var type = $('hp-type').value;
    var temp = num('hp-temperature') == null ? -10 : num('hp-temperature');
    var indoor = num('hp-indoor') || 20;
    var month = temp > 20 ? 6 : 0;
    var demand = T.demandAt(d, { outdoor_c: temp, indoor_c: indoor, monthIndex: month, includeSolar: true });
    var wood = d.energy.thermal.wood_heat;
    var woodThermal = wood.available ? Math.min(demand.heating_kwh_day, wood.capacity_kw * (wood.daily_hours || 8) * wood.efficiency) : 0;
    var hpThermal = Math.max(0, demand.heating_kwh_day - woodThermal);
    var hp = T.electricalForThermal(d, hpThermal, temp, { type: type });
    var cool = T.coolingElectrical(d, demand.cooling_kwh_day, temp, { type: type });
    if (!hp.performance) hp.performance = { capacity_kw: 0, cop: 0 };
    var hpMonth = T.heatPumpMonthly(d, { type: type });
    var panels = T.additionalPanels(d, hpMonth);
    var battery = T.additionalBattery(d, hpMonth);
    var inv = T.inverterRequirement(d, hpMonth);
    var days = Math.max(1, Math.min(5, Math.round(num('hp-days') || 3)));
    var additionalBattery = Math.ceil(battery.winter_daily_electric_kwh * days / (0.8 * 0.96 * 0.9));
    var household = s.household.consumption.winter_full_time_daily_kwh;
    var shortfall = fiveDayShortfall(d, household, hp.electrical_kwh, temp, num('hp-solar') || 25, $('hp-shared').value === 'yes', $('hp-wood').value === 'yes', num('hp-cloud-days') || 5);
    var total = household + hp.electrical_kwh + cool.electrical_kwh;

    $('hp-result-home').textContent = s.name;
    $('hp-out-demand').textContent = fmt(demand.heating_kwh_day, 1);
    $('hp-out-electric').textContent = fmt(hp.electrical_kwh, 1);
    $('hp-out-cool-demand').textContent = fmt(demand.cooling_kwh_day, 1);
    $('hp-out-cool-electric').textContent = fmt(cool.electrical_kwh, 1);
    $('hp-out-backup').textContent = fmt(hp.supplemental_kwh, 1);
    $('hp-out-total').textContent = fmt(total, 1);
    $('hp-out-panels').textContent = String(panels.additional_panels);
    $('hp-out-area').textContent = fmt(panels.additional_area_m2, 1);
    $('hp-out-roof').textContent = fmt(panels.available_roof_area_m2, 1);
    $('hp-out-battery').textContent = String(additionalBattery);
    $('hp-out-peak').textContent = fmt(inv.total_peak_kw, 1);
    $('hp-out-shortfall').textContent = fmt(shortfall.unserved, 1);

    var warningList = [];
    if (!panels.fits_existing_roof) warningList.push('The additional winter-critical panels do not fit the remaining roof area. A ground array, canopy or shared array would be required.');
    if (inv.additional_inverter_kw > 0) warningList.push('The existing inverter is below the combined peak. A larger inverter or load management is required.');
    if (demand.peak_heating_w > 0 && hp.performance.capacity_kw * 1000 < demand.peak_heating_w && hp.supplemental_kwh > 0) warningList.push('At this temperature the heat pump cannot meet the heating demand alone; resistance backup or a second heat source is required.');
    if (shortfall.house > 0.01) warningList.push('The five-day stress test leaves household electricity unserved. Essential services are at risk.');
    else if (shortfall.unserved > 0.01) warningList.push('The five-day stress test leaves heating unserved while household services are maintained.');
    $('hp-warnings').innerHTML = warningList.length ? '<h3>Warnings</h3><ul>' + warningList.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ul>' : '<p class="small">No layout or capacity warning at this configuration. This is not an HVAC or electrical approval.</p>';

    $('hp-summary').textContent = s.name + ' at ' + indoor + ' °C indoors and ' + temp + ' °C outdoors: heating demand ' + fmt(demand.heating_kwh_day, 1) + ' kWh/day, heat-pump electricity ' + fmt(hp.electrical_kwh, 1) + ' kWh/day, household plus heat pump ' + fmt(total, 1) + ' kWh/day. Full-time winter-critical additional panels: ' + panels.additional_panels + '; additional battery for ' + days + ' days: ' + additionalBattery + ' kWh. ' + (shortfall.house > 0.01 ? 'The five-day test leaves ' + fmt(shortfall.house, 1) + ' kWh of household demand unserved.' : shortfall.unserved > 0.01 ? 'The five-day test leaves ' + fmt(shortfall.unserved, 1) + ' kWh of heating demand unserved.' : 'The five-day test is served under these assumptions.');

    current = {
      residence: d.id, name: s.name, inputs: readInputs(), demand: demand, hp: hp, cooling: cool,
      panels: panels, battery: battery, additional_battery_for_target: additionalBattery,
      inverter: inv, shortfall: shortfall, annual: hpMonth
    };
    if (announce) {
      var now = Date.now();
      if (now - lastAnnounce > 250) {
        status.textContent = 'Updated for ' + s.name + ': ' + fmt(hp.electrical_kwh, 1) + ' kWh/day heat-pump electricity at ' + temp + ' °C; ' + panels.additional_panels + ' additional winter-critical panels; ' + additionalBattery + ' kWh additional battery for ' + days + ' days.';
        lastAnnounce = now;
      }
    }
  }

  function readInputs() {
    return {
      residence: $('hp-residence').value,
      type: $('hp-type').value,
      outdoor_c: num('hp-temperature'),
      indoor_c: num('hp-indoor'),
      panels: num('hp-panels'),
      battery_kwh: num('hp-battery'),
      baseline_consumption: num('hp-consumption'),
      solar_availability_pct: num('hp-solar'),
      envelope: $('hp-envelope').value,
      wood_heat: $('hp-wood').value,
      shared_electricity: $('hp-shared').value,
      autonomy_days: num('hp-days'),
      cloud_days: num('hp-cloud-days'),
      shading_factor: num('hp-shading'),
      cop_adjustment_pct: num('hp-cop')
    };
  }

  function download() {
    if (!current) return;
    var payload = {
      generated_by: 'Containers Hamlet heat-pump explorer',
      fictional: true,
      note: 'Preliminary concept assessment. Not an HVAC design, electrical design, equipment selection or comfort guarantee.',
      inputs: current.inputs,
      result: current
    };
    var blob = new Blob([JSON.stringify(payload, null, 2) + '\n'], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'heat-pump-' + current.residence.replace(/^hamlet-/, '') + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    status.textContent = 'Downloaded the current heat-pump result as JSON.';
  }

  if (!form) return;
  setDefaults(concepts[0]);
  render(false);
  form.addEventListener('input', function () { render(false); });
  form.addEventListener('change', function () { render(true); });
  $('hp-residence').addEventListener('change', function () { setDefaults(byId[$('hp-residence').value] || concepts[0]); render(true); });
  $('hp-reset').addEventListener('click', function () { setDefaults(byId[$('hp-residence').value] || concepts[0]); render(true); });
  $('hp-download').addEventListener('click', download);
})();
