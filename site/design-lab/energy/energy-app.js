/*
 * Accessible residential energy explorer.
 * Progressive enhancement over the server-rendered tables on the page.
 * No network requests, no storage, no third-party runtime.
 */
(function () {
  'use strict';

  var E = window.DesignEnergy;
  if (!E) return;

  var data = window.DesignLabConcepts;
  var concepts = data && data.concepts ? data.concepts.filter(function (c) { return c.role === 'hamlet-selected'; }) : [];
  var byId = {};
  concepts.forEach(function (c) { byId[c.id] = c; });
  if (!concepts.length) return;

  var $ = function (id) { return document.getElementById(id); };
  var form = $('energy-form');
  var compareSelect = $('compare-home');
  var status = $('energy-status');
  var current = null;
  var lastAnnounce = 0;

  function fmt(v, d) {
    if (v == null || !isFinite(v)) return '—';
    var f = Math.pow(10, d == null ? 1 : d);
    return (Math.round(v * f) / f).toFixed(d == null ? 1 : d);
  }
  function esc(v) {
    return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function num(id) {
    var el = $(id);
    if (!el) return null;
    var v = parseFloat(el.value);
    return isFinite(v) ? v : null;
  }
  function defaultPattern(concept) {
    var p = concept.energy.occupancy.pattern;
    if (p === 'intermittent-winter') return 'winter-intermittent';
    if (p === 'summer') return 'summer';
    return 'winter-full-time';
  }

  function setDefaults(concept) {
    var s = E.summary(concept);
    var arrays = s.arrays;
    $('residence').value = concept.id;
    $('occupants').value = s.occupancy.household_size;
    $('occupancy').value = defaultPattern(concept);
    $('panels').value = s.panels;
    $('panel-watts').value = 450;
    $('tilt').value = arrays[0] ? arrays[0].tilt_deg : 39;
    $('azimuth').value = arrays[0] ? arrays[0].azimuth_deg : 180;
    $('shading').value = Math.round(s.generation.months[0].shade_pct);
    $('battery').value = s.battery.nominal_kwh;
    $('consumption').value = s.consumption.summer_daily_kwh;
    $('cloud-days').value = 5;
    $('mode').value = 'ordinary';
    $('shared').value = 'backup';
  }

  function resizeArrays(design, total) {
    var arrays = design.energy.solar.arrays || [];
    if (!arrays.length) return;
    var fixed = arrays.slice(1).reduce(function (t, a) { return t + a.module_count; }, 0);
    var first = Math.max(0, Math.min(16, total - fixed));
    if (first < 1) {
      /* Reduce the other arrays too, keeping at least one panel in the first. */
      first = 1;
      var left = Math.max(0, total - first);
      arrays.slice(1).forEach(function (a) { a.module_count = Math.min(a.module_count, left); left -= a.module_count; });
    }
    arrays[0].module_count = first;
    arrays[0].columns = Math.max(1, Math.ceil(first / Math.max(1, arrays[0].rows)));
  }

  function buildDesign() {
    var base = byId[$('residence').value] || concepts[0];
    var d = JSON.parse(JSON.stringify(base));
    var occ = $('occupancy').value;
    var shared = $('shared').value === 'backup';
    resizeArrays(d, Math.max(2, Math.min(16, Math.round(num('panels') || 2))));
    d.energy.reference_module.watts = num('panel-watts') || 450;
    d.energy.solar.arrays.forEach(function (a) { a.module.watts = num('panel-watts') || 450; a.tilt_deg = num('tilt') == null ? a.tilt_deg : num('tilt'); a.azimuth_deg = num('azimuth') == null ? a.azimuth_deg : num('azimuth'); a.mounting = a.mounting === 'roof-flush' && Math.abs(a.tilt_deg - base.roof_form.pitch_deg) > 1 ? 'roof-tilted' : a.mounting; });
    var shade = num('shading');
    if (shade != null) d.energy.solar.arrays.forEach(function (a) { a.shading = Object.assign({}, a.shading, { monthly: E.MONTHS.map(function () { return Math.max(0, Math.min(90, shade)); }) }); });
    var batt = num('battery');
    if (batt) { d.energy.battery.nominal_kwh = batt; d.energy.battery.usable_kwh = Math.round(batt * 0.9 * 10) / 10; }
    var consumption = num('consumption');
    if (consumption && consumption > 0) {
      var before = E.loadsForProfile(d, 'summer').daily_kwh;
      if (before > 0) d.energy.loads.forEach(function (l) { l.rated_w = l.rated_w * consumption / before; });
    }
    d.energy.occupancy.pattern = occ === 'winter-intermittent' ? 'intermittent-winter' : occ;
    d.energy.scenarios.forEach(function (s) {
      if (s.season === 'summer') s.load_profile = 'summer';
      else if (s.id === 'winter-weekend') s.load_profile = 'winter-intermittent';
      else if (s.season === 'winter' && occ === 'winter-intermittent') s.load_profile = 'winter-intermittent';
      else if (s.season === 'winter') s.load_profile = 'winter-full-time';
    });
    d.energy.shared.primary_configuration = shared ? 'community-backup' : 'independent';
    return d;
  }

  function monthlyUse(s, m) {
    if (m.season === 'summer') return s.consumption.summer_daily_kwh;
    if (m.season === 'winter') return s.consumption.winter_full_time_daily_kwh;
    return s.consumption.shoulder_daily_kwh;
  }

  function chart(s, id) {
    var W = 720, H = 300, left = 56, right = 20, top = 22, bottom = 58;
    var months = s.generation.months;
    var use = months.map(function (m) { return monthlyUse(s, m); });
    var max = Math.max(1, Math.max.apply(null, months.map(function (m) { return m.kwh_per_day; })) * 1.1, Math.max.apply(null, use) * 1.1);
    var bw = (W - left - right) / 12;
    var y = function (v) { return top + (H - top - bottom) * (1 - v / max); };
    var bars = months.map(function (m, i) {
      var x = left + i * bw + bw * 0.18;
      var h = Math.max(0, H - bottom - y(m.kwh_per_day));
      return '<rect x="' + fmt(x, 1) + '" y="' + fmt(y(m.kwh_per_day), 1) + '" width="' + fmt(bw * 0.64, 1) + '" height="' + fmt(h, 1) + '" fill="#245a73" rx="1"><title>' + esc(m.label) + ': ' + fmt(m.kwh_per_day, 1) + ' kWh/day generation</title></rect>';
    }).join('');
    var points = months.map(function (m, i) { return fmt(left + i * bw + bw / 2, 1) + ',' + fmt(y(use[i]), 1); }).join(' ');
    var labels = months.map(function (m, i) {
      return '<text x="' + fmt(left + i * bw + bw / 2, 1) + '" y="' + (H - 34) + '" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#3f5a4c">' + esc(m.label.slice(0, 1)) + '</text>';
    }).join('');
    var grid = [0, 0.25, 0.5, 0.75, 1].map(function (t) {
      return '<line x1="' + left + '" y1="' + fmt(y(max * t), 1) + '" x2="' + (W - right) + '" y2="' + fmt(y(max * t), 1) + '" stroke="#c9d2c2" stroke-width="1"/><text x="' + (left - 8) + '" y="' + fmt(y(max * t) + 4, 1) + '" text-anchor="end" font-family="system-ui,sans-serif" font-size="10" fill="#3f5a4c">' + fmt(max * t, 1) + '</text>';
    }).join('');
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-labelledby="' + id + '-t ' + id + '-d"><title id="' + id + '-t">Monthly generation and consumption for ' + esc(s.name) + '</title><desc id="' + id + '-d">A bar chart of estimated daily generation and a line of daily consumption for each month. The same values are in the monthly table below. Generation is highest from May to August and lowest in December and January.</desc><rect width="' + W + '" height="' + H + '" fill="#faf8f2"/>' + grid + bars + '<polyline points="' + points + '" fill="none" stroke="#b45e1c" stroke-width="2.5"/>' + months.map(function (m, i) { return '<circle cx="' + fmt(left + i * bw + bw / 2, 1) + '" cy="' + fmt(y(use[i]), 1) + '" r="2.6" fill="#b45e1c"><title>' + esc(m.label) + ': ' + fmt(use[i], 1) + ' kWh/day consumption</title></circle>'; }).join('') + labels + '<text x="' + left + '" y="16" font-family="system-ui,sans-serif" font-size="11" fill="#245a73">■ generation</text><text x="' + (left + 110) + '" y="16" font-family="system-ui,sans-serif" font-size="11" fill="#b45e1c">— consumption</text><text x="' + (W - right) + '" y="' + (H - 10) + '" text-anchor="end" font-family="system-ui,sans-serif" font-size="9" fill="#5e6a58">kWh per day · modelled estimate</text></svg>';
  }

  function updateMonthly(s) {
    var body = $('energy-monthly-body');
    if (!body) return;
    body.innerHTML = s.generation.months.map(function (m) {
      var use = monthlyUse(s, m);
      var bal = m.kwh_per_day - use;
      return '<tr><th scope="row">' + esc(m.label) + '</th><td>' + fmt(m.kwh_per_day, 1) + '</td><td>' + fmt(use, 1) + '</td><td>' + (bal >= 0 ? '+' : '') + fmt(bal, 1) + '</td><td>' + fmt(m.shade_pct, 0) + '%</td></tr>';
    }).join('');
    $('monthly-home').textContent = s.name;
  }

  function compareTable(a, b, aName, bName) {
    var rows = [
      ['Panels', a.panels, b.panels],
      ['Installed capacity (kWp)', fmt(a.capacity_kwp, 1), fmt(b.capacity_kwp, 1)],
      ['Panel surface (m²)', fmt(a.panel_area_m2, 1), fmt(b.panel_area_m2, 1)],
      ['Summer generation (kWh/day)', fmt(a.generation.summer_daily_kwh, 1), fmt(b.generation.summer_daily_kwh, 1)],
      ['Winter generation (kWh/day)', fmt(a.generation.winter_daily_kwh, 1), fmt(b.generation.winter_daily_kwh, 1)],
      ['Summer consumption (kWh/day)', fmt(a.consumption.summer_daily_kwh, 1), fmt(b.consumption.summer_daily_kwh, 1)],
      ['Winter consumption (kWh/day)', fmt(a.consumption.winter_full_time_daily_kwh, 1), fmt(b.consumption.winter_full_time_daily_kwh, 1)],
      ['Battery nominal / usable (kWh)', fmt(a.battery.nominal_kwh, 0) + ' / ' + fmt(a.battery.usable_kwh, 1), fmt(b.battery.nominal_kwh, 0) + ' / ' + fmt(b.battery.usable_kwh, 1)],
      ['Essential autonomy (days)', fmt(a.autonomy.essential_days, 1), fmt(b.autonomy.essential_days, 1)],
      ['Ordinary autonomy (days)', fmt(a.autonomy.ordinary_days, 1), fmt(b.autonomy.ordinary_days, 1)],
      ['Five-cloudy-day shortfall, no shared supply (kWh/day)', fmt(a.supplementary_daily_kwh, 1), fmt(b.supplementary_daily_kwh, 1)],
      ['Intended occupancy', (a.suitable_patterns || []).join('; '), (b.suitable_patterns || []).join('; ')]
    ];
    var body = $('compare-two-body');
    if (!body) return;
    body.innerHTML = rows.map(function (r) { return '<tr><th scope="row">' + esc(r[0]) + '</th><td>' + esc(String(r[1])) + '</td><td>' + esc(String(r[2])) + '</td></tr>'; }).join('');
    $('compare-a-head').textContent = aName;
    $('compare-b-head').textContent = bName;
  }

  function warningsFor(d, v) {
    var list = [];
    (v.issues || []).forEach(function (i) {
      if (i.category === 'invalid-geometry' || /panel|array|surface|snow|obstacle|tilt|azimuth|battery/.test(i.code)) list.push(i.message);
    });
    (d.energy.solar.arrays || []).forEach(function (a) {
      if (a.module_count * a.rows * a.columns === 0) list.push(a.label + ': the panel count is zero.');
    });
    return list;
  }

  function render(announce) {
    var d = buildDesign();
    var s = E.summary(d);
    var v = E.validate(d);
    var occ = $('occupancy').value;
    var winterProfile = occ === 'winter-full-time' ? 'winter-full-time' : occ === 'winter-intermittent' ? 'winter-intermittent' : 'winter-full-time';
    var cloudDays = Math.max(1, Math.round(num('cloud-days') || 5));
    var cloud = E.simulateScenario(d, {
      id: 'explorer-cloud', label: 'Explorer cloudy period', season: 'winter', days: cloudDays,
      solar_factor: 0.25, load_profile: winterProfile, snow: false,
      essential_only: $('mode').value === 'essential',
      shared: $('shared').value === 'backup'
    });
    var shortfall = cloud ? cloud.total.unserved / cloudDays : 0;
    var surplus = Math.max(0, s.generation.winter_daily_kwh - (occ === 'winter-intermittent' ? s.consumption.winter_intermittent_daily_kwh : s.consumption.winter_full_time_daily_kwh));
    var winterUse = $('mode').value === 'essential' ? s.consumption.winter_essential_kwh : (occ === 'winter-intermittent' ? s.consumption.winter_intermittent_daily_kwh : s.consumption.winter_full_time_daily_kwh);

    $('result-home').textContent = s.name;
    $('out-kwp').textContent = fmt(s.capacity_kwp, 1);
    $('out-area').textContent = fmt(s.panel_area_m2, 1);
    $('out-gen-summer').textContent = fmt(s.generation.summer_daily_kwh, 1);
    $('out-gen-winter').textContent = fmt(s.generation.winter_daily_kwh, 1);
    $('out-use-summer').textContent = fmt(s.consumption.summer_daily_kwh, 1);
    $('out-use-winter').textContent = fmt(winterUse, 1);
    $('out-battery').textContent = fmt(s.battery.usable_kwh, 1);
    $('out-essential').textContent = fmt(s.autonomy.essential_days, 1);
    $('out-ordinary').textContent = fmt(s.autonomy.ordinary_days, 1);
    $('out-shortfall').textContent = fmt(shortfall, 1);
    $('out-surplus').textContent = fmt(surplus, 1);
    var warns = warningsFor(d, v);
    $('out-warnings').textContent = String(warns.length);
    var warnBox = $('energy-warning-list');
    warnBox.innerHTML = warns.length ? '<h3>Layout and assumption warnings</h3><ul>' + warns.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ul>' : '<p class="small">No panel-placement warnings at this configuration. This is not a structural or electrical approval.</p>';
    var occLabel = {
      summer: 'summer occupation',
      shoulder: 'three-season occupation',
      'winter-intermittent': 'intermittent winter occupation',
      'winter-full-time': 'full-time winter occupation'
    }[occ] || s.occupancy.label.toLowerCase();
    $('energy-summary').textContent = s.name + ' is modelled for ' + occLabel + '. ' + ((s.limitations && s.limitations[0]) || 'No specific limitation recorded.') + ' ' + (shortfall > 0.01 ? 'A ' + cloudDays + '-day cloudy period leaves about ' + fmt(shortfall, 1) + ' kWh/day unserved without shared electricity.' : 'The modelled battery covers the selected cloudy period with shared electricity available.');
    $('energy-chart').innerHTML = chart(s, 'energy-chart');
    updateMonthly(s);

    var bConcept = byId[compareSelect.value] || concepts[1] || concepts[0];
    var bSummary = E.summary(bConcept);
    compareTable(s, bSummary, s.name, bConcept.name + ' (modelled)');

    current = { conceptId: d.id, name: s.name, inputs: readInputs(), summary: s, validation: v, monthly: s.generation.months, cloud: cloud };
    var text = 'Updated for ' + s.name + ': ' + s.panels + ' panels, ' + fmt(s.capacity_kwp, 1) + ' kWp; ' + fmt(s.generation.winter_daily_kwh, 1) + ' kWh/day estimated winter generation; ' + fmt(shortfall, 1) + ' kWh/day shortfall over ' + cloudDays + ' cloudy days without shared electricity.';
    if (announce) {
      var now = Date.now();
      if (now - lastAnnounce > 250) { status.textContent = text; lastAnnounce = now; }
    }
  }

  function readInputs() {
    return {
      residence: $('residence').value,
      occupants: num('occupants'),
      occupancy: $('occupancy').value,
      panels: num('panels'),
      panel_watts: num('panel-watts'),
      tilt_deg: num('tilt'),
      azimuth_deg: num('azimuth'),
      shading_pct: num('shading'),
      battery_kwh: num('battery'),
      consumption_kwh: num('consumption'),
      cloudy_days: num('cloud-days'),
      mode: $('mode').value,
      shared: $('shared').value
    };
  }

  function download() {
    if (!current) return;
    var payload = {
      generated_by: 'Containers Hamlet residential energy explorer',
      fictional: true,
      note: 'Concept estimate. Not a solar resource assessment, electrical design, structural design or off-grid guarantee.',
      inputs: current.inputs,
      summary: current.summary,
      cloud_scenario: current.cloud,
      monthly: current.monthly,
      validation: current.validation
    };
    var blob = new Blob([JSON.stringify(payload, null, 2) + '\n'], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'energy-' + current.conceptId.replace(/^hamlet-/, '') + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    status.textContent = 'Downloaded the current energy result as JSON.';
  }

  if (!form) return;
  setDefaults(concepts[0]);
  render(false);

  form.addEventListener('input', function () { render(false); });
  form.addEventListener('change', function () { render(true); });
  $('residence').addEventListener('change', function () {
    var c = byId[$('residence').value] || concepts[0];
    setDefaults(c);
    render(true);
  });
  $('reset-energy').addEventListener('click', function () {
    var c = byId[$('residence').value] || concepts[0];
    setDefaults(c);
    render(true);
  });
  $('download-energy').addEventListener('click', download);
  if (compareSelect) compareSelect.addEventListener('change', function () { render(true); });
})();
