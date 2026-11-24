/*
 * Containers Hamlet Design Lab: residential energy, photovoltaic geometry,
 * battery storage, seasonal load profiles and repeatable resilience scenarios.
 *
 * This module is deliberately transparent and dependency-free. It is shared by
 * the Node.js build and the browser so that the drawings, the comparison table,
 * the explorer and the tests all use one calculation path.
 *
 * It is a conceptual model, not an engineering design, a solar resource
 * assessment, a code calculation or a guarantee of off-grid performance.
 *
 * Code licence: AGPL-3.0-or-later. Data: CC BY-SA 4.0.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DesignEnergy = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var DEG = Math.PI / 180;

  /* ---------------- reference assumptions ---------------- */

  var REFERENCE_MODULE = {
    id: 'ref-450',
    label: '450 W reference module',
    watts: 450,
    length_m: 1.762,
    width_m: 1.134,
    area_m2: 1.997,
    efficiency: 0.2254,
    source: 'Illustrative 450 W module, about 1.76 x 1.13 m. Actual equipment varies; confirm the chosen module datasheet, dimensions, temperature coefficients and mounting requirements.',
    confidence: 'low'
  };

  var MONTHS = [
    { key: 'jan', label: 'January', days: 31, season: 'winter' },
    { key: 'feb', label: 'February', days: 28, season: 'winter' },
    { key: 'mar', label: 'March', days: 31, season: 'shoulder' },
    { key: 'apr', label: 'April', days: 30, season: 'shoulder' },
    { key: 'may', label: 'May', days: 31, season: 'shoulder' },
    { key: 'jun', label: 'June', days: 30, season: 'summer' },
    { key: 'jul', label: 'July', days: 31, season: 'summer' },
    { key: 'aug', label: 'August', days: 31, season: 'summer' },
    { key: 'sep', label: 'September', days: 30, season: 'shoulder' },
    { key: 'oct', label: 'October', days: 31, season: 'shoulder' },
    { key: 'nov', label: 'November', days: 30, season: 'winter' },
    { key: 'dec', label: 'December', days: 31, season: 'winter' }
  ];

  /* Monthly average global horizontal irradiation, kWh/m2/day.
     Illustrative eastern-Ontario / Canadian Shield values assembled from
     published regional solar-resource summaries (NRCan and PVGIS). They are
     not measured at the fictional site and are not a bankable yield study. */
  var MONTHLY_GHI = [1.42, 2.14, 3.31, 4.43, 5.33, 5.72, 5.67, 4.94, 3.78, 2.41, 1.47, 1.18];

  /* Average snow-cover availability of an unheated, un-swept array.
     A value of 0.82 means about 18% of the month's clear-sky potential is
     assumed lost to full or partial snow cover. Design intent, not measured. */
  var MONTHLY_SNOW_AVAILABILITY = [0.82, 0.85, 0.92, 0.98, 1.0, 1.0, 1.0, 1.0, 1.0, 0.99, 0.9, 0.8];

  var MONTHLY_ALBEDO = [0.5, 0.5, 0.4, 0.2, 0.18, 0.18, 0.18, 0.18, 0.18, 0.2, 0.35, 0.5];

  var LATITUDE = 45.4;

  var PROFILE_KEYS = ['summer', 'shoulder', 'winter-intermittent', 'winter-full-time', 'unoccupied-winter'];
  var ESSENTIAL_CLASSES = ['essential-continuous', 'essential-intermittent', 'accessibility'];
  var LOAD_CLASSES = ['essential-continuous', 'essential-intermittent', 'discretionary', 'high-demand', 'accessibility'];
  var CONFIDENCE = ['low', 'medium', 'high'];

  var DEFAULT_CLASS_FACTORS = {
    'essential-continuous': 1,
    'essential-intermittent': 1,
    discretionary: 1,
    'high-demand': 1,
    accessibility: 1
  };

  /* ---------------- small helpers ---------------- */

  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function isNum(v) { return typeof v === 'number' && Number.isFinite(v); }
  function num(v, d) { return isNum(v) ? v : d; }
  function round(v, d) { var f = Math.pow(10, d == null ? 2 : d); return Math.round(v * f) / f; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function sum(list, f) { return list.reduce(function (s, x) { return s + f(x); }, 0); }
  function avg(list) { return list.length ? sum(list, function (x) { return x; }) / list.length : 0; }
  function pct(list, p) {
    if (!list.length) return 0;
    var a = list.slice().sort(function (x, y) { return x - y; });
    var i = clamp(Math.round((a.length - 1) * p), 0, a.length - 1);
    return a[i];
  }
  function monthMeta(i) { return MONTHS[clamp(i, 0, 11)]; }
  function seasonMonths(season) {
    return MONTHS.map(function (m, i) { return { m: m, i: i }; }).filter(function (x) { return x.m.season === season; });
  }
  function moduleArea(mod) { return num(mod.length_m, 1.762) * num(mod.width_m, 1.134); }
  function panelCount(design) {
    var arrays = design && design.energy && design.energy.solar && design.energy.solar.arrays || [];
    return sum(arrays, function (a) { return Math.max(0, Math.round(num(a.module_count, 0))); });
  }
  function installedKwp(design) {
    var e = design && design.energy;
    if (!e) return 0;
    var rm = e.reference_module || REFERENCE_MODULE;
    var arrays = e.solar && e.solar.arrays || [];
    if (!arrays.length) return 0;
    return sum(arrays, function (a) { return num(a.module_count, 0) * num((a.module || rm).watts, rm.watts); }) / 1000;
  }
  function panelSurfaceArea(design) {
    var e = design && design.energy;
    if (!e) return 0;
    var rm = e.reference_module || REFERENCE_MODULE;
    var arrays = e.solar && e.solar.arrays || [];
    if (!arrays.length) return 0;
    return sum(arrays, function (a) { return num(a.module_count, 0) * num((a.module || rm).area_m2, moduleArea(rm)); });
  }

  /* ---------------- solar geometry ---------------- */

  function dayOfYear(monthIndex, day) {
    var n = day || 15;
    for (var i = 0; i < monthIndex; i++) n += MONTHS[i].days;
    return n;
  }
  function declination(n) { return 23.45 * Math.sin(2 * Math.PI * (284 + n) / 365) * DEG; }

  /* Sun unit vector in local (east, north, up) coordinates. */
  function sunVector(latDeg, n, solarHour) {
    var lat = latDeg * DEG;
    var dec = declination(n);
    var H = (solarHour - 12) * 15 * DEG;
    return {
      east: -Math.cos(dec) * Math.sin(H),
      north: Math.sin(dec) * Math.cos(lat) - Math.cos(dec) * Math.sin(lat) * Math.cos(H),
      up: Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(H)
    };
  }
  function sunAngles(latDeg, n, solarHour) {
    var v = sunVector(latDeg, n, solarHour);
    var elevation = Math.asin(clamp(v.up, -1, 1)) / DEG;
    var azimuth = (Math.atan2(v.east, v.north) / DEG + 360) % 360;
    return { elevation: elevation, azimuth: azimuth, vector: v };
  }
  function panelNormal(tiltDeg, azimuthDeg) {
    var b = tiltDeg * DEG, g = azimuthDeg * DEG;
    return { east: Math.sin(b) * Math.sin(g), north: Math.sin(b) * Math.cos(g), up: Math.cos(b) };
  }
  function cosIncidence(latDeg, n, solarHour, tiltDeg, azimuthDeg) {
    var s = sunVector(latDeg, n, solarHour);
    var p = panelNormal(tiltDeg, azimuthDeg);
    return s.east * p.east + s.north * p.north + s.up * p.up;
  }

  /* Hourly geometric integrals for a day: horizontal and tilted irradiation
     ratios. Used once per month, so a 0.25 h step is cheap and stable. */
  function dailyGeometry(latDeg, n, tiltDeg, azimuthDeg, albedo) {
    var horizontal = 0, tilted = 0;
    for (var h = 0; h < 24; h += 0.25) {
      var s = sunVector(latDeg, n, h);
      if (s.up <= 0.01) continue;
      horizontal += s.up;
      var ci = cosIncidence(latDeg, n, h, tiltDeg, azimuthDeg);
      if (ci > 0) tilted += ci;
    }
    var b = tiltDeg * DEG;
    var skyView = (1 + Math.cos(b)) / 2;
    var groundView = (1 - Math.cos(b)) / 2;
    var rb = horizontal > 0 ? tilted / horizontal : 0;
    return { horizontal: horizontal, tilted: tilted, rb: rb, skyView: skyView, groundView: groundView, albedo: albedo };
  }

  /* Monthly plane-of-array irradiation, kWh/m2/day, using an isotropic sky
     model and the Erbs diffuse-fraction correlation. Simple, documented and
     deliberately not presented as a bankable simulation. */
  function monthlyIrradiance(latDeg, tiltDeg, azimuthDeg, monthIndex) {
    var month = monthMeta(monthIndex);
    var n = dayOfYear(monthIndex, 15);
    var ghi = MONTHLY_GHI[monthIndex];
    var H0 = 24 / Math.PI * 1.361 * (1 + 0.033 * Math.cos(2 * Math.PI * n / 365)) *
      (Math.cos(latDeg * DEG) * Math.cos(declination(n)) * Math.sin(Math.acos(clamp(-Math.tan(latDeg * DEG) * Math.tan(declination(n)), -1, 1))) +
        Math.acos(clamp(-Math.tan(latDeg * DEG) * Math.tan(declination(n)), -1, 1)) * Math.sin(latDeg * DEG) * Math.sin(declination(n)));
    if (!isNum(H0) || H0 <= 0) H0 = ghi * 3.2;
    var kt = clamp(ghi / H0, 0, 1);
    var fd;
    if (kt <= 0.22) fd = 1 - 0.09 * kt;
    else if (kt <= 0.8) fd = 0.9511 - 0.1604 * kt + 4.388 * kt * kt - 16.638 * kt * kt * kt + 12.336 * kt * kt * kt * kt;
    else fd = 0.165;
    fd = clamp(fd, 0.05, 1);
    var beam = ghi * (1 - fd), diffuse = ghi * fd;
    var geo = dailyGeometry(latDeg, n, tiltDeg, azimuthDeg, MONTHLY_ALBEDO[monthIndex]);
    return {
      month: month.key, monthIndex: monthIndex, ghi: ghi,
      beam: beam, diffuse: diffuse,
      rb: geo.rb, skyView: geo.skyView, groundView: geo.groundView,
      kwh_m2_day: Math.max(0, beam * geo.rb + diffuse * geo.skyView + ghi * geo.albedo * geo.groundView),
      clearnessIndex: kt
    };
  }

  /* ---------------- tree and building shading ---------------- */

  /* Obstacles are simplified vertical cylinders with a canopy. They are
     derived once from the fictional deterministic woodland scatter and stored
     in the canonical data. They are not a survey, a lidar canopy model or a
     measured shade study. */
  function obstacleShade(obstacles, latDeg, tiltDeg, azimuthDeg, monthIndex, panelHeight) {
    var n = dayOfYear(monthIndex, 15);
    var month = monthMeta(monthIndex);
    var leaf = month.season === 'summer' ? 1 : month.season === 'shoulder' ? 0.6 : 0.25;
    var total = 0, weighted = 0;
    var p = panelNormal(tiltDeg, azimuthDeg);
    for (var h = 7; h <= 18; h += 0.25) {
      var s = sunVector(latDeg, n, h);
      if (s.up <= 0.03) continue;
      var ci = Math.max(0, s.east * p.east + s.north * p.north + s.up * p.up);
      if (ci <= 0) continue;
      var weight = Math.max(0.05, s.up);
      var sunAz = (Math.atan2(s.east, s.north) / DEG + 360) % 360;
      var shade = 0;
      (obstacles || []).forEach(function (o) {
        var dx = num(o.east_m, 0), dy = num(o.north_m, 0);
        var dist = Math.max(0.5, Math.hypot(dx, dy));
        var bearing = (Math.atan2(dx, dy) / DEG + 360) % 360;
        var angRadius = Math.atan2(num(o.canopy_radius_m, 2.5), dist) / DEG;
        if (Math.abs(((sunAz - bearing + 540) % 360) - 180) > angRadius) return;
        var top = num(o.height_m, 12);
        var elevToTop = Math.atan2(Math.max(0, top - panelHeight), dist) / DEG;
        var sunEl = Math.asin(clamp(s.up, -1, 1)) / DEG;
        if (sunEl > elevToTop + 2) return;
        var density = num(o.density, 0.75) * (num(o.type, 'conifer') === 'deciduous' ? leaf : 0.9);
        shade = 1 - (1 - shade) * (1 - clamp(density, 0, 0.95));
      });
      total += weight;
      weighted += weight * shade;
    }
    return total > 0 ? clamp(weighted / total, 0, 0.95) : 0;
  }

  function buildingSelfShade(design, array, monthIndex) {
    /* A very simple, conservative self-shading allowance: an array on a lower
       roof south of a taller volume, or an array on a north slope, receives an
       extra loss. The number is recorded on the array rather than invented in
       the renderer. */
    var f = num(array.self_shade_factor, 0);
    if (array.surface && array.surface.slope === 'north') return 0.5;
    return f;
  }

  /* ---------------- canonical defaults ---------------- */

  function normalizeArray(a, index, design) {
    var rm = design.energy.reference_module || REFERENCE_MODULE;
    var out = clone(a || {});
    out.id = out.id || ('pv-' + (index + 1));
    out.label = out.label || ('Array ' + (index + 1));
    out.module_count = Math.max(0, Math.round(num(out.module_count, 1)));
    out.rows = Math.max(1, Math.round(num(out.rows, 1)));
    out.columns = Math.max(1, Math.round(num(out.columns, Math.ceil(out.module_count / out.rows))));
    out.orientation = out.orientation === 'landscape' ? 'landscape' : 'portrait';
    out.tilt_deg = num(out.tilt_deg, 39);
    out.azimuth_deg = num(out.azimuth_deg, 180);
    out.mounting = out.mounting || 'roof-tilted';
    out.surface = out.surface || { kind: 'roof', module: design.modules && design.modules[0] && design.modules[0].id, slope: 'south' };
    out.edge_clearance_m = num(out.edge_clearance_m, 0.3);
    out.row_gap_m = num(out.row_gap_m, 0.08);
    out.column_gap_m = num(out.column_gap_m, 0.04);
    out.standoff_m = num(out.standoff_m, 0.12);
    out.electrical_group = out.electrical_group || ('string-' + (index + 1));
    out.rotation_deg = num(out.rotation_deg, 0);
    out.module = Object.assign({}, rm, out.module || {});
    out.shading = Object.assign({ annual_pct: 0, winter_pct: 0, monthly: null, note: 'No shading figure is recorded.' }, out.shading || {});
    out.snow = Object.assign({ guards: false, shed_to: 'south', note: 'Snow shedding needs a safe design.' }, out.snow || {});
    out.maintenance = Object.assign({ access: 'not-assessed', walkway_m: 0.5, note: 'Maintenance access needs review.' }, out.maintenance || {});
    if (out.rows * out.columns !== out.module_count) {
      /* Repair only the layout, never the installed count. */
      out.columns = Math.max(1, Math.ceil(out.module_count / out.rows));
    }
    return out;
  }

  function normalizeEnergy(input) {
    var d = clone(input || {});
    if (!d.energy) return d;
    var e = d.energy;
    e.version = e.version || '1.0';
    e.reference_module = Object.assign({}, REFERENCE_MODULE, e.reference_module || {});
    e.occupancy = Object.assign({
      household_size: 1, max_occupants: 2, pattern: 'seasonal', label: 'Seasonal occupation',
      suitable_patterns: ['Summer occupation'], notes: 'Occupancy pattern not recorded.'
    }, e.occupancy || {});
    e.solar = Object.assign({ arrays: [], canopies: [], obstacles: [], losses: {}, note: '' }, e.solar || {});
    e.solar.arrays = (e.solar.arrays || []).map(function (a, i) { return normalizeArray(a, i, d); });
    e.solar.canopies = (e.solar.canopies || []).map(function (c, i) {
      return Object.assign({
        id: 'canopy-' + (i + 1), label: 'Solar canopy', position_m: [0, 0], rotation_deg: 0,
        length_m: 4, depth_m: 2.4, height_m: 2.4, tilt_deg: 20, azimuth_deg: 180,
        note: 'Independent canopy. Structure, wind uplift, snow shedding and egress need review.'
      }, c || {});
    });
    e.solar.obstacles = Array.isArray(e.solar.obstacles) ? e.solar.obstacles : [];
    e.solar.losses = Object.assign({
      soiling_pct: 3, mismatch_dc_pct: 5, inverter_pct: 4,
      temperature_summer_pct: 6, temperature_winter_pct: 2,
      degradation_pct_per_year: 0.5, assessment_year: 10,
      note: 'Losses are applied once each, in this order: shading and snow availability, soiling, mismatch and DC wiring, temperature, inverter conversion, degradation. Battery charge and discharge losses are applied in the battery simulation, not here.'
    }, e.solar.losses || {});
    e.loads = (e.loads || []).map(function (l) {
      var out = Object.assign({
        id: 'load', name: 'Load', rated_w: 0, quantity: 1, duty_cycle: 1,
        hours: { summer: 0, shoulder: 0, winter: 0 },
        ac_dc: 'ac', class: 'discretionary', occupancy_dependency: 'occupied',
        seasonal_variation: 'None recorded.', source: 'Assumption not recorded.', confidence: 'low',
        deferrable: false, unoccupied_w: 0, notes: ''
      }, l || {});
      out.class = LOAD_CLASSES.indexOf(out.class) >= 0 ? out.class : 'discretionary';
      out.hours = Object.assign({ summer: 0, shoulder: 0, winter: 0 }, out.hours || {});
      out.quantity = Math.max(1, Math.round(num(out.quantity, 1)));
      out.rated_w = Math.max(0, num(out.rated_w, 0));
      out.duty_cycle = clamp(num(out.duty_cycle, 1), 0, 1);
      out.unoccupied_w = Math.max(0, num(out.unoccupied_w, 0));
      out.essential = ESSENTIAL_CLASSES.indexOf(out.class) >= 0;
      out.confidence = CONFIDENCE.indexOf(out.confidence) >= 0 ? out.confidence : 'low';
      return out;
    });
    e.profiles = (Array.isArray(e.profiles) && e.profiles.length ? e.profiles : defaultProfiles()).map(function (p, i) {
      var out = Object.assign({
        id: PROFILE_KEYS[i] || ('profile-' + i), label: 'Profile', season: 'summer', occupied: true,
        class_factors: {}, days_per_week: 7, notes: ''
      }, p || {});
      out.class_factors = Object.assign({}, DEFAULT_CLASS_FACTORS, out.class_factors || {});
      out.days_per_week = clamp(num(out.days_per_week, 7), 0, 7);
      return out;
    });
    e.battery = Object.assign({
      technology: 'LiFePO4', architecture_v: 48, nominal_kwh: 10, usable_kwh: 9,
      min_soc_pct: 10, max_soc_pct: 100, charge_efficiency: 0.96, discharge_efficiency: 0.96,
      max_charge_kw: 3, max_discharge_kw: 4, inverter_kw: 3, inverter_standby_w: 8,
      essential_reserve_kwh: 3, target_autonomy_days: 3,
      temp_limits: { charge_min_c: 0, discharge_min_c: -10, operating_max_c: 45 },
      heated_enclosure: true, location: 'not recorded',
      note: 'Battery sizing is a concept estimate. Cell, BMS, enclosure, ventilation, fire separation, low-temperature charging and the electrical design need professional review.',
      source: 'LiFePO4 reference assumptions; confirm with the selected equipment datasheet.'
    }, e.battery || {});
    e.battery.usable_kwh = Math.min(num(e.battery.usable_kwh, 9), e.battery.nominal_kwh);
    e.optional_profiles = Array.isArray(e.optional_profiles) ? e.optional_profiles : [];
    e.shared = Object.assign({
      primary_configuration: 'community-backup', lodge_id: 'common-lodge',
      options: defaultSharedOptions(), note: 'Shared electricity is an option, not an assumption.'
    }, e.shared || {});
    e.scenarios = Array.isArray(e.scenarios) && e.scenarios.length ? e.scenarios : defaultScenarios();
    e.evidence = Object.assign({ sources: [], uncertainties: [], professional_reviews: [] }, e.evidence || {});
    return d;
  }

  function defaultProfiles() {
    return [
      { id: 'summer', label: 'Summer occupation', season: 'summer', occupied: true, class_factors: {}, days_per_week: 7, notes: 'Long days, high solar availability, low lighting demand.' },
      { id: 'shoulder', label: 'Spring and autumn occupation', season: 'shoulder', occupied: true, class_factors: {}, days_per_week: 7, notes: 'More lighting, variable ventilation and more cloudy periods.' },
      { id: 'winter-intermittent', label: 'Intermittent winter occupation', season: 'winter', occupied: true, class_factors: { discretionary: 0.5, 'high-demand': 0.35 }, days_per_week: 2.5, notes: 'Weekend or short visits; the home is unoccupied between visits.' },
      { id: 'winter-full-time', label: 'Full-time winter occupation', season: 'winter', occupied: true, class_factors: {}, days_per_week: 7, notes: 'Continuous occupation through the winter.' },
      { id: 'unoccupied-winter', label: 'Unoccupied winter', season: 'winter', occupied: false, class_factors: {}, days_per_week: 0, notes: 'Monitoring, battery management and safety equipment only.' }
    ];
  }
  function defaultSharedOptions() {
    return [
      { id: 'independent', label: 'Independent residence', supplemental_kwh_per_day: 0, distribution_loss_pct: 0, description: 'Each residence relies on its own array and battery.', note: 'No shared electricity is assumed.' },
      { id: 'community-backup', label: 'Independent with community backup', supplemental_kwh_per_day: 4, distribution_loss_pct: 6, description: 'The residence keeps essential independent capability but can draw limited supplementary electricity from the common lodge.', note: 'Backup is limited and not guaranteed during a region-wide outage.' },
      { id: 'microgrid', label: 'Shared community microgrid', supplemental_kwh_per_day: 10, distribution_loss_pct: 9, description: 'Multiple arrays and batteries contribute to a professionally designed shared network.', note: 'A microgrid does not remove the effect of region-wide winter cloud or snow.' }
    ];
  }
  function defaultScenarios() {
    return [
      { id: 'summer-typical', label: 'Typical summer day', season: 'summer', days: 1, solar_factor: 1.0, load_profile: 'summer', snow: false, note: 'Synthetic clear summer day.' },
      { id: 'winter-typical', label: 'Typical winter day', season: 'winter', days: 1, solar_factor: 1.0, load_profile: 'winter-full-time', snow: false, note: 'Synthetic average winter day.' },
      { id: 'winter-cloud-3', label: 'Three consecutive cloudy winter days', season: 'winter', days: 3, solar_factor: 0.35, load_profile: 'winter-full-time', snow: false, note: 'Synthetic overcast sequence; not a weather forecast.' },
      { id: 'winter-cloud-5', label: 'Five consecutive cloudy winter days', season: 'winter', days: 5, solar_factor: 0.25, load_profile: 'winter-full-time', snow: false, note: 'Synthetic overcast sequence.' },
      { id: 'snow-covered', label: 'Snow-covered solar panels', season: 'winter', days: 3, solar_factor: 0, load_profile: 'winter-full-time', snow: true, note: 'Zero generation for three days.' },
      { id: 'winter-weekend', label: 'Winter weekend followed by an unoccupied period', season: 'winter', days: 7, solar_factor: 0.5, load_profile: 'winter-intermittent', snow: false, note: 'Two occupied days followed by five unoccupied days.' },
      { id: 'winter-full-time', label: 'Full-time winter occupation', season: 'winter', days: 7, solar_factor: 0.8, load_profile: 'winter-full-time', snow: false, note: 'A winter week with mixed weather.' },
      { id: 'partial-array-failure', label: 'Partial array failure', season: 'winter', days: 3, solar_factor: 0.6, load_profile: 'winter-full-time', snow: false, array_factor: 0.5, note: 'Half the array is unavailable for three days.' },
      { id: 'no-shared-electricity', label: 'Loss of shared community electricity', season: 'winter', days: 5, solar_factor: 0.3, load_profile: 'winter-full-time', snow: false, shared: false, note: 'No supplementary community electricity.' },
      { id: 'essential-only', label: 'Essential-load-only emergency operation', season: 'winter', days: 5, solar_factor: 0.3, load_profile: 'winter-full-time', snow: false, essential_only: true, shared: false, note: 'Only essential and accessibility loads are served.' }
    ];
  }

  /* ---------------- panel geometry ---------------- */

  function transformLocal(m, p) {
    var a = (m.rotation_deg || 0) * DEG;
    return [m.position_m[0] + p[0] * Math.cos(a) - p[1] * Math.sin(a), m.position_m[1] + p[0] * Math.sin(a) + p[1] * Math.cos(a)];
  }
  function moduleCorners(m) {
    var L = m.nominal.length_m, W = m.nominal.width_m;
    return [[-L / 2, -W / 2], [L / 2, -W / 2], [L / 2, W / 2], [-L / 2, W / 2]].map(function (p) { return transformLocal(m, p); });
  }
  function moduleBase(m) { return num(m.elevation_m, 0); }
  function moduleTop(m) { return moduleBase(m) + num(m.nominal && m.nominal.height_m, 2.896); }

  function roofInfo(design) {
    var d = design;
    var rf = d.roof_form || { type: 'gable', pitch_deg: 24, overhang_m: 0.6 };
    var polys = (d.modules || []).map(moduleCorners);
    if (!polys.length) return { type: rf.type, top_m: 0, base_m: 0, pitch_deg: num(rf.pitch_deg, 0), minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, depth: 0, ridgeY: 0, solarArea_m2: 0 };
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    polys.forEach(function (poly) { poly.forEach(function (p) { minX = Math.min(minX, p[0]); minY = Math.min(minY, p[1]); maxX = Math.max(maxX, p[0]); maxY = Math.max(maxY, p[1]); }); });
    var oh = num(rf.overhang_m, 0.6);
    minX -= oh; minY -= oh; maxX += oh; maxY += oh;
    var base = (d.modules || []).reduce(function (t, m) { return Math.max(t, moduleTop(m)); }, 0);
    var width = maxX - minX, depth = maxY - minY;
    var pitch = clamp(num(rf.pitch_deg, 0), 0, 45);
    var rise = Math.tan(pitch * DEG);
    var top = base, ridgeY = (minY + maxY) / 2;
    if (rf.type === 'gable') top = base + (depth / 2) * rise;
    else if (rf.type === 'shed' || rf.type === 'solar-ready') top = base + depth * rise;
    else if (rf.type === 'butterfly') top = base + (depth / 2) * rise;
    else top = base + (rf.type === 'flat' ? 0.3 : 0.25);
    var planArea = Math.max(0, width * depth);
    var roofArea = rf.type === 'flat' || rf.type === 'canopy' || rf.type === 'green' ? planArea : planArea / Math.max(0.3, Math.cos(pitch * DEG));
    return {
      type: rf.type, pitch_deg: pitch, overhang_m: oh, minX: minX, maxX: maxX, minY: minY, maxY: maxY,
      width: width, depth: depth, base_m: base, top_m: top, ridgeY: ridgeY,
      roofArea_m2: roofArea, solarArea_m2: rf.type === 'flat' || rf.type === 'canopy' || rf.type === 'green' ? planArea * 0.55 : Math.max(0, ((rf.type === 'gable' || rf.type === 'butterfly') ? depth / 2 : depth) * width)
    };
  }

  /* Height of the roof surface at a world (x, y) point. Flat and canopy roofs
     are treated as horizontal planes at their top elevation. */
  function roofHeightAt(info, y) {
    var t = info.type;
    if (t === 'gable') {
      var fromEave = y >= info.ridgeY ? info.maxY - y : y - info.minY;
      return info.base_m + Math.max(0, fromEave) * Math.tan(info.pitch_deg * DEG);
    }
    if (t === 'butterfly') {
      var h = Math.max(0.01, info.depth / 2);
      var rise = Math.tan(info.pitch_deg * DEG);
      return y >= info.ridgeY ? info.top_m - (y - info.ridgeY) * rise : info.top_m - (info.ridgeY - y) * rise;
    }
    if (t === 'shed' || t === 'solar-ready') {
      return info.top_m - (y - info.minY) * Math.tan(info.pitch_deg * DEG);
    }
    return info.top_m;
  }

  function surfaceRect(design, array, info) {
    var surface = array.surface || {};
    if (surface.kind === 'roof') {
      var slope = surface.slope || 'south';
      if (slope === 'north') return { minX: info.minX, maxX: info.maxX, minY: info.minY, maxY: info.ridgeY, kind: 'roof' };
      if (info.type === 'flat' || info.type === 'canopy' || info.type === 'green') return { minX: info.minX, maxX: info.maxX, minY: info.minY, maxY: info.maxY, kind: 'roof' };
      if (info.type === 'gable' || info.type === 'butterfly') return { minX: info.minX, maxX: info.maxX, minY: info.ridgeY, maxY: info.maxY, kind: 'roof' };
      return { minX: info.minX, maxX: info.maxX, minY: info.minY, maxY: info.maxY, kind: 'roof' };
    }
    if (surface.kind === 'canopy' || surface.kind === 'porch' || surface.kind === 'ground') {
      var el = (design.energy.solar.canopies || []).filter(function (c) { return c.id === surface.canopy; })[0];
      if (surface.kind === 'porch') {
        var p = (design.porches || []).filter(function (x) { return x.id === surface.porch; })[0];
        var m = p && (design.modules || []).filter(function (x) { return x.id === p.module; })[0];
        if (!p || !m) return null;
        var L = m.nominal.length_m, W = m.nominal.width_m;
        var pts = [[-L / 2 + p.start_m, W / 2], [-L / 2 + p.start_m + p.length_m, W / 2], [-L / 2 + p.start_m + p.length_m, W / 2 + p.depth_m], [-L / 2 + p.start_m, W / 2 + p.depth_m]].map(function (q) { return transformLocal(m, q); });
        return polyRect(pts, { kind: 'porch', height_m: moduleBase(m) + 2.65, porch: p.id, module: m.id });
      }
      if (surface.kind === 'canopy') {
        if (!el) return null;
        var c = el;
        var a = c.rotation_deg * DEG, cx = c.position_m[0], cy = c.position_m[1];
        var hw = c.length_m / 2, hd = c.depth_m / 2;
        var cp = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].map(function (q) {
          return [cx + q[0] * Math.cos(a) - q[1] * Math.sin(a), cy + q[0] * Math.sin(a) + q[1] * Math.cos(a)];
        });
        return polyRect(cp, { kind: 'canopy', height_m: c.height_m, canopy: c.id, tilt_deg: c.tilt_deg, azimuth_deg: c.azimuth_deg, rotation_deg: c.rotation_deg });
      }
      var g = surface.ground || {};
      var gc = g.position_m || [0, 0], gr = (g.rotation_deg || 0) * DEG;
      var gw = num(g.width_m, 6) / 2, gd = num(g.depth_m, 3) / 2;
      var gp = [[-gw, -gd], [gw, -gd], [gw, gd], [-gw, gd]].map(function (q) {
        return [gc[0] + q[0] * Math.cos(gr) - q[1] * Math.sin(gr), gc[1] + q[0] * Math.sin(gr) + q[1] * Math.cos(gr)];
      });
      return polyRect(gp, { kind: 'ground', height_m: num(g.height_m, 1.2), rotation_deg: g.rotation_deg || 0 });
    }
    return null;
  }

  function polyRect(pts, extra) {
    var xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
    return Object.assign({ minX: Math.min.apply(null, xs), maxX: Math.max.apply(null, xs), minY: Math.min.apply(null, ys), maxY: Math.max.apply(null, ys), points: pts }, extra);
  }

  function panelDimensions(array) {
    var m = array.module || REFERENCE_MODULE;
    var long = num(m.length_m, 1.762), short = num(m.width_m, 1.134);
    return array.orientation === 'landscape' ? { along_slope: short, across: long } : { along_slope: long, across: short };
  }

  /* Build one panel record for every installed module. No renderer is allowed
     to invent an extra panel: all views consume this list. */
  function panelGeometry(designInput, roofOverride) {
    var design = designInput && designInput.energy ? normalizeEnergy(designInput) : designInput;
    var energy = design && design.energy;
    if (!energy) return { arrays: [], panels: [], total_panels: 0, capacity_kwp: 0, area_m2: 0, warnings: [] };
    var info = roofOverride || roofInfo(design);
    var warnings = [];
    var arraysOut = [], allPanels = [];
    (energy.solar.arrays || []).forEach(function (array, ai) {
      var rect = surfaceRect(design, array, info);
      var dims = panelDimensions(array);
      var tilt = array.tilt_deg;
      var flush = array.mounting === 'roof-flush';
      var effTilt = flush ? info.pitch_deg : tilt;
      var run = dims.along_slope * Math.cos(effTilt * DEG);
      var rise = dims.along_slope * Math.sin(effTilt * DEG);
      var across = dims.across;
      var arrayOut = { id: array.id, label: array.label, module_count: array.module_count, rows: array.rows, columns: array.columns, tilt_deg: tilt, effective_tilt_deg: round(effTilt, 1), azimuth_deg: array.azimuth_deg, mounting: array.mounting, electrical_group: array.electrical_group, panels: [], surface_kind: array.surface && array.surface.kind, rect: rect, warnings: [], snow_shed_to: array.snow.shed_to, snow_guards: !!array.snow.guards, maintenance_access: array.maintenance.access };
      if (!rect) {
        warnings.push({ code: 'unsupported-surface', array: array.id, message: array.label + ' is assigned to a mounting surface that does not exist.' });
        arrayOut.warnings.push('Mounting surface not found.');
        arraysOut.push(arrayOut);
        return;
      }
      var edge = array.edge_clearance_m;
      var usableMinX = rect.minX + edge, usableMaxX = rect.maxX - edge;
      var usableMinY = rect.minY + edge, usableMaxY = rect.maxY - edge;
      var cols = array.columns, rows = array.rows;
      var needW = cols * across + Math.max(0, cols - 1) * array.column_gap_m;
      var needD = rows * run + Math.max(0, rows - 1) * array.row_gap_m;
      if (needW > (usableMaxX - usableMinX) + 0.001) warnings.push({ code: 'array-too-wide', array: array.id, message: array.label + ' needs ' + round(needW, 2) + ' m across the surface but only ' + round(usableMaxX - usableMinX, 2) + ' m is available after edge clearance.' });
      if (needD > (usableMaxY - usableMinY) + 0.001) warnings.push({ code: 'array-too-deep', array: array.id, message: array.label + ' needs ' + round(needD, 2) + ' m up the slope but only ' + round(usableMaxY - usableMinY, 2) + ' m is available after edge clearance.' });
      var startX = (usableMinX + usableMaxX) / 2 - needW / 2;
      var startY = usableMaxY - num(array.offset_m, 0); /* south edge; later rows step north (decreasing y) */
      var idx = 0;
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          if (idx >= array.module_count) break;
          var x0 = startX + c * (across + array.column_gap_m);
          var x1 = x0 + across;
          var yBottom = startY - r * (run + array.row_gap_m);
          var yTop = yBottom - run;
          var zBottom = rect.kind === 'roof' ? roofHeightAt(info, yBottom) + array.standoff_m : rect.height_m + array.standoff_m;
          var zTop = rect.kind === 'roof' && flush ? roofHeightAt(info, yTop) + array.standoff_m : zBottom + rise;
          if (rect.kind === 'roof' && !flush) {
            var roofAtTop = roofHeightAt(info, yTop);
            if (zTop < roofAtTop + 0.05) warnings.push({ code: 'panel-below-roof', array: array.id, message: array.label + ' is tilted less than the roof, so the upper edge would sit below the roof surface.' });
          }
          var id = array.id + '-p' + (idx + 1);
          var corners = [[x0, yBottom, zBottom], [x1, yBottom, zBottom], [x1, yTop, zTop], [x0, yTop, zTop]];
          var panel = {
            id: id, array: array.id, index: idx + 1, row: r + 1, column: c + 1,
            corners: corners,
            centre: [(x0 + x1) / 2, (yBottom + yTop) / 2, (zBottom + zTop) / 2],
            tilt_deg: round(effTilt, 1), azimuth_deg: array.azimuth_deg,
            watts: num((array.module || REFERENCE_MODULE).watts, 450),
            area_m2: round(num((array.module || REFERENCE_MODULE).area_m2, 1.997), 3),
            mounting: array.mounting, surface_kind: rect.kind,
            support: array.surface, electrical_group: array.electrical_group,
            maintenance_clearance_m: array.maintenance.walkway_m,
            snow_shed_to: array.snow.shed_to
          };
          arrayOut.panels.push(panel);
          allPanels.push(panel);
          idx++;
        }
      }
      if (idx !== array.module_count) warnings.push({ code: 'panel-count-mismatch', array: array.id, message: array.label + ' declares ' + array.module_count + ' panels but its row and column layout holds ' + idx + '.' });
      arraysOut.push(arrayOut);
    });
    return {
      arrays: arraysOut,
      panels: allPanels,
      total_panels: allPanels.length,
      capacity_kwp: round(sum(allPanels, function (p) { return p.watts; }) / 1000, 3),
      area_m2: round(sum(allPanels, function (p) { return p.area_m2; }), 2),
      warnings: warnings
    };
  }

  function polygonsOverlap(a, b) {
    /* Axis-aligned bounding boxes of the projected panel footprints. Panels in
       a row/column layout are rectangles; reject any positive-area overlap. */
    var ax0 = Math.min.apply(null, a.map(function (p) { return p[0]; }));
    var ax1 = Math.max.apply(null, a.map(function (p) { return p[0]; }));
    var ay0 = Math.min.apply(null, a.map(function (p) { return p[1]; }));
    var ay1 = Math.max.apply(null, a.map(function (p) { return p[1]; }));
    var bx0 = Math.min.apply(null, b.map(function (p) { return p[0]; }));
    var bx1 = Math.max.apply(null, b.map(function (p) { return p[0]; }));
    var by0 = Math.min.apply(null, b.map(function (p) { return p[1]; }));
    var by1 = Math.max.apply(null, b.map(function (p) { return p[1]; }));
    var w = Math.min(ax1, bx1) - Math.max(ax0, bx0);
    var h = Math.min(ay1, by1) - Math.max(ay0, by0);
    return w > 0.005 && h > 0.005 ? round(w * h, 3) : 0;
  }

  /* ---------------- load model ---------------- */

  function loadDailyKwh(load, season, classFactor, occupied) {
    if (!occupied) return load.unoccupied_w * 24 / 1000;
    var hours = num(load.hours[season], 0) * load.quantity;
    var kwh = load.rated_w * hours * load.duty_cycle * classFactor / 1000;
    return kwh;
  }

  function profileById(design, id) {
    return (design.energy.profiles || []).filter(function (p) { return p.id === id; })[0];
  }

  function loadsForProfile(design, profileId, opts) {
    opts = opts || {};
    var e = design.energy;
    var profile = profileById(design, profileId) || (e.profiles || [])[0];
    if (!profile) return { profile: null, rows: [], daily_kwh: 0, essential_daily_kwh: 0, discretionary_daily_kwh: 0 };
    var rows = e.loads.map(function (load) {
      var factor = load.occupancy_dependency === 'always' ? 1 : (profile.occupied ? 1 : 0);
      var classFactor = profile.occupied ? num(profile.class_factors[load.class], 1) : 0;
      var kwh = loadDailyKwh(load, profile.season, classFactor, profile.occupied) * factor;
      if (opts.essential_only && !load.essential) kwh = 0;
      return {
        id: load.id, name: load.name, class: load.class, essential: load.essential,
        rated_w: load.rated_w, quantity: load.quantity, duty_cycle: load.duty_cycle,
        hours: num(load.hours[profile.season], 0), ac_dc: load.ac_dc,
        occupancy_dependency: load.occupancy_dependency, deferrable: load.deferrable,
        daily_kwh: round(kwh, 3), source: load.source, confidence: load.confidence,
        seasonal_variation: load.seasonal_variation, notes: load.notes
      };
    });
    return {
      profile: profile, rows: rows,
      daily_kwh: round(sum(rows, function (r) { return r.daily_kwh; }), 3),
      essential_daily_kwh: round(sum(rows.filter(function (r) { return r.essential; }), function (r) { return r.daily_kwh; }), 3),
      discretionary_daily_kwh: round(sum(rows.filter(function (r) { return !r.essential; }), function (r) { return r.daily_kwh; }), 3)
    };
  }

  /* ---------------- generation ---------------- */

  function lossFactor(e, season) {
    var l = e.solar.losses;
    var temp = season === 'summer' ? num(l.temperature_summer_pct, 6) : num(l.temperature_winter_pct, 2);
    var year = num(l.assessment_year, 10);
    var degr = 1 - clamp(num(l.degradation_pct_per_year, 0.5), 0, 5) / 100 * year;
    return (1 - num(l.soiling_pct, 3) / 100) *
      (1 - num(l.mismatch_dc_pct, 5) / 100) *
      (1 - num(l.inverter_pct, 4) / 100) *
      (1 - temp / 100) * degr;
  }

  function arrayShadeFraction(design, array, monthIndex, panelZ) {
    var e = design.energy;
    var obstacles = (e.solar.obstacles || []).filter(function (o) {
      return !o.near || o.near === 'site' || o.near === array.id || (array.surface && (o.near === array.surface.module || o.near === array.surface.canopy));
    });
    var tree = obstacleShade(obstacles, LATITUDE, array.tilt_deg, array.azimuth_deg, monthIndex, num(panelZ, 4));
    var manual = array.shading && Array.isArray(array.shading.monthly) ? array.shading.monthly[monthIndex] / 100 : null;
    /* The recorded annual allowance is a design estimate from the same simplified
       woodland geometry. Use the larger of the two rather than adding them, so
       the two estimates are not double-counted. Winter is weighted more heavily
       because the low sun path passes through more of the woodland edge. */
    var recorded = array.shading && isNum(array.shading.annual_pct) ? clamp(array.shading.annual_pct / 100, 0, 0.9) : 0;
    var month = monthMeta(monthIndex);
    var seasonal = month.season === 'winter' ? 1.25 : month.season === 'summer' ? 0.85 : 1.05;
    var monthly = manual != null ? manual : Math.max(tree, recorded * seasonal);
    var self = buildingSelfShade(design, array, monthIndex);
    return clamp(1 - (1 - monthly) * (1 - self), 0, 0.95);
  }

  function monthlyGeneration(designInput, opts) {
    opts = opts || {};
    var design = normalizeEnergy(designInput);
    var e = design.energy;
    var rm = e.reference_module;
    var arrays = e.solar.arrays || [];
    var months = MONTHS.map(function (m, i) {
      var total = 0, kwp = 0, area = 0, shadeWeighted = 0, snow = 1;
      arrays.forEach(function (array) {
        var count = num(array.module_count, 0);
        if (!count) return;
        var moduleWatts = num(opts.panel_capacity, num((array.module || rm).watts, rm.watts));
        var arrayKwp = count * moduleWatts / 1000;
        var tilt = array.mounting === 'roof-flush' ? (design.roof_form ? design.roof_form.pitch_deg : array.tilt_deg) : (opts.override_tilt_deg != null ? opts.override_tilt_deg : array.tilt_deg);
        var az = opts.override_azimuth_deg != null ? opts.override_azimuth_deg : array.azimuth_deg;
        var irr = monthlyIrradiance(LATITUDE, tilt, az, i);
        var shade = arrayShadeFraction(design, array, i, 4);
        if (opts.override_shading_pct != null) shade = clamp(opts.override_shading_pct / 100, 0, 0.95);
        var snowAvail = opts.ignore_snow ? 1 : MONTHLY_SNOW_AVAILABILITY[i];
        var lf = lossFactor(e, m.season);
        var kwh = arrayKwp * irr.kwh_m2_day * (1 - shade) * snowAvail * lf * m.days;
        total += kwh; kwp += arrayKwp;
        area += count * num((array.module || rm).area_m2, rm.area_m2);
        shadeWeighted += shade * arrayKwp;
        snow = snowAvail;
      });
      return {
        month: m.key, monthIndex: i, label: m.label, season: m.season, days: m.days,
        kwp: round(kwp, 2), panel_area_m2: round(area, 1),
        irradiation_kwh_m2_day: round(monthlyIrradiance(LATITUDE, opts.override_tilt_deg != null ? opts.override_tilt_deg : (arrays[0] ? arrays[0].tilt_deg : 39), opts.override_azimuth_deg != null ? opts.override_azimuth_deg : (arrays[0] ? arrays[0].azimuth_deg : 180), i).kwh_m2_day, 2),
        shade_pct: kwp > 0 ? round(shadeWeighted / kwp * 100, 1) : 0,
        snow_availability: snow,
        loss_factor: round(lossFactor(e, m.season), 3),
        kwh: round(total, 1),
        kwh_per_day: round(total / m.days, 2),
        kwh_per_kwp_day: kwp > 0 ? round(total / kwp / m.days, 2) : 0
      };
    });
    var annual = round(sum(months, function (m) { return m.kwh; }), 1);
    return {
      months: months,
      annual_kwh: annual,
      capacity_kwp: round(sum(months, function (m) { return m.kwp; }) / 12, 2),
      specific_yield_kwh_per_kwp: months[0].kwp > 0 ? round(annual / sum(months, function (m) { return m.kwp; }) * 12, 0) : 0,
      season_totals: {
        summer: round(sum(months.filter(function (m) { return m.season === 'summer'; }), function (m) { return m.kwh; }), 1),
        shoulder: round(sum(months.filter(function (m) { return m.season === 'shoulder'; }), function (m) { return m.kwh; }), 1),
        winter: round(sum(months.filter(function (m) { return m.season === 'winter'; }), function (m) { return m.kwh; }), 1)
      },
      assumptions: {
        latitude_deg: LATITUDE,
        irradiance_source: 'Illustrative monthly global horizontal irradiation for eastern Ontario / Canadian Shield conditions, assembled from published regional summaries (NRCan, PVGIS). Not measured at the fictional site.',
        snow_availability: MONTHLY_SNOW_AVAILABILITY,
        losses: e.solar.losses,
        note: 'Monthly estimates use an isotropic sky model and the Erbs diffuse fraction. Shading is a simplified geometric estimate from modelled tree obstacles. Do not present these figures as guaranteed production.'
      }
    };
  }

  function averageDailyGeneration(design, season) {
    var gen = monthlyGeneration(design);
    var ms = gen.months.filter(function (m) { return m.season === season; });
    return round(sum(ms, function (m) { return m.kwh; }) / sum(ms, function (m) { return m.days; }), 2);
  }

  /* ---------------- battery and dispatch ---------------- */

  function batteryLimits(b) {
    var nominal = Math.max(0, num(b.nominal_kwh, 0));
    var minSoc = clamp(num(b.min_soc_pct, 10), 0, 100) / 100;
    var maxSoc = clamp(num(b.max_soc_pct, 100), 0, 100) / 100;
    var usable = Math.max(0, Math.min(num(b.usable_kwh, nominal * (maxSoc - minSoc)), nominal * (maxSoc - minSoc)));
    return {
      nominal: nominal, usable: usable,
      minKwh: nominal * minSoc, maxKwh: nominal * maxSoc,
      chargeEff: clamp(num(b.charge_efficiency, 0.96), 0.5, 1),
      dischargeEff: clamp(num(b.discharge_efficiency, 0.96), 0.5, 1),
      maxChargeKw: Math.max(0, num(b.max_charge_kw, 3)),
      maxDischargeKw: Math.max(0, num(b.max_discharge_kw, 4)),
      reserve: clamp(num(b.essential_reserve_kwh, 0), 0, usable)
    };
  }

  function hourlyLoadShape(profile, design) {
    var winter = profile.season === 'winter';
    var base = winter
      ? [0.030, 0.024, 0.022, 0.022, 0.026, 0.040, 0.060, 0.068, 0.056, 0.045, 0.042, 0.044, 0.048, 0.044, 0.042, 0.048, 0.064, 0.080, 0.080, 0.070, 0.062, 0.052, 0.042, 0.034]
      : [0.030, 0.024, 0.022, 0.022, 0.024, 0.032, 0.044, 0.052, 0.050, 0.044, 0.042, 0.044, 0.048, 0.048, 0.046, 0.046, 0.052, 0.064, 0.072, 0.072, 0.066, 0.056, 0.046, 0.036];
    var s = sum(base, function (x) { return x; });
    return base.map(function (x) { return x / s; });
  }

  function solarHourlyShape(monthIndex, tilt, azimuth, totalKwh, weatherFactor, snow) {
    var n = dayOfYear(monthIndex, 15);
    var raw = [];
    var total = 0;
    for (var h = 0; h < 24; h += 1) {
      var ci = cosIncidence(LATITUDE, n, h + 0.5, tilt, azimuth);
      var s = sunVector(LATITUDE, n, h + 0.5);
      var v = ci > 0 && s.up > 0 ? Math.pow(ci, 1.15) : 0;
      raw.push(v);
      total += v;
    }
    if (total <= 0 || snow) return raw.map(function () { return 0; });
    return raw.map(function (v) { return v / total * totalKwh * clamp(weatherFactor, 0, 1.5); });
  }

  function simulateDay(opts) {
    var design = opts.design;
    var profile = profileById(design, opts.profileId) || design.energy.profiles[0];
    var b = batteryLimits(design.energy.battery);
    var loadKwh = opts.loadKwh != null ? opts.loadKwh : loadsForProfile(design, profile.id, { essential_only: opts.essential_only }).daily_kwh;
    var essentialKwh = opts.essentialKwh != null ? opts.essentialKwh : loadsForProfile(design, profile.id, { essential_only: true }).daily_kwh;
    var monthIndex = opts.monthIndex != null ? opts.monthIndex : (profile.season === 'summer' ? 6 : profile.season === 'shoulder' ? 4 : 0);
    var gen = opts.generationKwh != null ? opts.generationKwh : 0;
    var shape = solarHourlyShape(monthIndex, opts.tilt || 39, opts.azimuth || 180, gen, opts.weatherFactor != null ? opts.weatherFactor : 1, opts.snow);
    var loadShape = hourlyLoadShape(profile, design);
    var soc = clamp(num(opts.startKwh, b.maxKwh), b.minKwh, b.maxKwh);
    var reserve = opts.essential_only ? b.minKwh : Math.min(b.reserve, Math.max(b.minKwh, b.maxKwh - 0.001));
    var allowShared = opts.shared !== false;
    var supplementalAvailable = allowShared ? (opts.supplementalKwh != null ? opts.supplementalKwh : supplementalFor(design)) : 0;
    var out = { start_kwh: round(soc, 2), generation_kwh: round(gen, 2), load_kwh: round(loadKwh, 2), essential_kwh: round(essentialKwh, 2), charge_kwh: 0, discharge_kwh: 0, curtailed_kwh: 0, unserved_kwh: 0, supplemental_kwh: 0, soc_min_kwh: soc, soc_max_kwh: soc, hours: [] };
    var supplementalLeft = Math.max(0, supplementalAvailable);
    for (var h = 0; h < 24; h++) {
      var load = loadKwh * loadShape[h];
      var solar = shape[h];
      var direct = Math.min(solar, load);
      var surplus = solar - direct;
      var deficit = load - direct;
      var charge = 0;
      if (surplus > 0 && soc < b.maxKwh) {
        charge = Math.min(surplus, b.maxChargeKw, (b.maxKwh - soc) / b.chargeEff);
        soc += charge * b.chargeEff;
      }
      var curtail = Math.max(0, surplus - charge);
      var discharge = 0;
      if (deficit > 0 && soc > reserve) {
        discharge = Math.min(deficit, b.maxDischargeKw, (soc - reserve) * b.dischargeEff);
        soc -= discharge / b.dischargeEff;
      }
      var left = Math.max(0, deficit - discharge);
      var supplement = Math.min(left, supplementalLeft);
      supplementalLeft -= supplement;
      var unserved = Math.max(0, left - supplement);
      soc = clamp(soc, 0, b.nominal);
      out.charge_kwh += charge;
      out.discharge_kwh += discharge;
      out.curtailed_kwh += curtail;
      out.unserved_kwh += unserved;
      out.supplemental_kwh += supplement;
      out.soc_min_kwh = Math.min(out.soc_min_kwh, soc);
      out.soc_max_kwh = Math.max(out.soc_max_kwh, soc);
      out.hours.push({ hour: h, load_kwh: round(load, 3), solar_kwh: round(solar, 3), direct_kwh: round(direct, 3), charge_kwh: round(charge, 3), discharge_kwh: round(discharge, 3), curtail_kwh: round(curtail, 3), supplement_kwh: round(supplement, 3), unserved_kwh: round(unserved, 3), soc_kwh: round(soc, 2) });
    }
    out.end_kwh = round(soc, 2);
    out.soc_min_kwh = round(out.soc_min_kwh, 2);
    out.soc_max_kwh = round(out.soc_max_kwh, 2);
    out.charge_kwh = round(out.charge_kwh, 2);
    out.discharge_kwh = round(out.discharge_kwh, 2);
    out.curtailed_kwh = round(out.curtailed_kwh, 2);
    out.unserved_kwh = round(out.unserved_kwh, 2);
    out.supplemental_kwh = round(out.supplemental_kwh, 2);
    out.battery_stored_change_kwh = round(out.charge_kwh * b.chargeEff - out.discharge_kwh / b.dischargeEff, 2);
    /* Demand includes unserved demand, so unserved must not be added again on
       the right-hand side. This is the bus-level energy balance. */
    out.conservation_error_kwh = round((gen + out.discharge_kwh + out.supplemental_kwh + out.unserved_kwh) - (loadKwh + out.charge_kwh + out.curtailed_kwh), 3);
    out.profile = profile.id;
    out.battery = b;
    return out;
  }

  function supplementalFor(design) {
    var shared = design.energy.shared || {};
    var opt = (shared.options || []).filter(function (o) { return o.id === shared.primary_configuration; })[0];
    return opt ? num(opt.supplemental_kwh_per_day, 0) * (1 - num(opt.distribution_loss_pct, 0) / 100) : 0;
  }

  function scenarioGeneration(design, scenario) {
    var gen = monthlyGeneration(design);
    var season = scenario.season || 'winter';
    var monthIndex = season === 'summer' ? 6 : season === 'shoulder' ? 4 : 0;
    var month = gen.months[monthIndex];
    var base = month.kwh_per_day;
    var factor = num(scenario.solar_factor, 1);
    var arrayFactor = num(scenario.array_factor, 1);
    return { daily_kwh: round(base * factor * arrayFactor, 2), clear_sky_kwh: round(base, 2), factor: factor, array_factor: arrayFactor, month: month.month };
  }

  function simulateScenario(design, scenarioOrId) {
    var e = design.energy;
    var scenario = typeof scenarioOrId === 'string' ? (e.scenarios || []).filter(function (s) { return s.id === scenarioOrId; })[0] : scenarioOrId;
    if (!scenario) return null;
    var profile = profileById(design, scenario.load_profile || (scenario.season === 'summer' ? 'summer' : 'winter-full-time'));
    var b = batteryLimits(e.battery);
    var days = Math.max(1, Math.round(num(scenario.days, 1)));
    var genDaily = scenarioGeneration(design, scenario).daily_kwh;
    var essentialOnly = !!scenario.essential_only;
    var start = num(scenario.start_soc_pct, 100) / 100 * b.maxKwh;
    var soc = clamp(start, b.minKwh, b.maxKwh);
    var sharedAvailable = scenario.shared !== false;
    var monthIndex = scenario.season === 'summer' ? 6 : scenario.season === 'shoulder' ? 4 : 0;
    var rows = [], total = { generation: 0, load: 0, charge: 0, discharge: 0, curtailed: 0, unserved: 0, supplemental: 0 };
    var profileForDay = profile;
    for (var d = 0; d < days; d++) {
      if (scenario.id === 'winter-weekend' && d >= 2) profileForDay = profileById(design, 'unoccupied-winter') || profile;
      var load = loadsForProfile(design, profileForDay.id, { essential_only: essentialOnly }).daily_kwh;
      var day = simulateDay({
        design: design, profileId: profileForDay.id, monthIndex: monthIndex,
        generationKwh: genDaily, startKwh: soc, snow: !!scenario.snow,
        weatherFactor: 1, shared: sharedAvailable,
        essential_only: essentialOnly, loadKwh: load
      });
      soc = day.end_kwh;
      total.generation += day.generation_kwh;
      total.load += day.load_kwh;
      total.charge += day.charge_kwh;
      total.discharge += day.discharge_kwh;
      total.curtailed += day.curtailed_kwh;
      total.unserved += day.unserved_kwh;
      total.supplemental += day.supplemental_kwh;
      rows.push({
        day: d + 1, profile: profileForDay.id, start_kwh: day.start_kwh, generation_kwh: day.generation_kwh,
        load_kwh: day.load_kwh, charge_kwh: day.charge_kwh, discharge_kwh: day.discharge_kwh,
        end_kwh: day.end_kwh, curtailed_kwh: day.curtailed_kwh, unserved_kwh: day.unserved_kwh,
        supplemental_kwh: day.supplemental_kwh, soc_min_kwh: day.soc_min_kwh
      });
    }
    total.generation = round(total.generation, 2);
    total.load = round(total.load, 2);
    total.charge = round(total.charge, 2);
    total.discharge = round(total.discharge, 2);
    total.curtailed = round(total.curtailed, 2);
    total.unserved = round(total.unserved, 2);
    total.supplemental = round(total.supplemental, 2);
    var b2 = batteryLimits(e.battery);
    var conservation = round((total.generation + total.discharge + total.supplemental + total.unserved) - (total.load + total.charge + total.curtailed), 2);
    return {
      id: scenario.id, label: scenario.label, note: scenario.note, days: days,
      season: scenario.season, generation_daily_kwh: genDaily, profile: profile.id,
      start_soc_pct: round(start / b2.nominal * 100, 0),
      end_soc_pct: round(soc / b2.nominal * 100, 0),
      end_kwh: round(soc, 2),
      min_soc_kwh: round(Math.min.apply(null, rows.map(function (r) { return r.soc_min_kwh; })), 2),
      total: total,
      conservation_error_kwh: conservation,
      days_rows: rows,
      meets_load: total.unserved <= 0.001,
      status: total.unserved > 0.001 ? 'shortfall' : 'served',
      synthetic: true
    };
  }

  function scenarios(design) {
    return (design.energy.scenarios || []).map(function (s) { return simulateScenario(design, s); });
  }

  /* ---------------- autonomy ---------------- */

  function autonomy(design, profileId) {
    var e = design.energy;
    var b = batteryLimits(e.battery);
    var p = loadsForProfile(design, profileId);
    var essential = p.essential_daily_kwh;
    var ordinary = p.daily_kwh;
    var reserve = Math.min(b.reserve, b.usable);
    return {
      profile: profileId,
      daily_kwh: ordinary,
      essential_daily_kwh: essential,
      usable_kwh: round(b.usable, 2),
      reserve_kwh: round(reserve, 2),
      essential_days: essential > 0 ? round(b.usable / essential, 1) : null,
      ordinary_days: ordinary > 0 ? round(Math.max(0, b.usable - reserve) / ordinary, 1) : null,
      autonomy_at_80pct_dod: ordinary > 0 ? round(b.usable * 0.8 / ordinary, 1) : null
    };
  }

  /* ---------------- optional loads ---------------- */

  function optionalProfileKwh(design, profileId, season) {
    var p = (design.energy.optional_profiles || []).filter(function (x) { return x.id === profileId; })[0];
    if (!p) return 0;
    return num(p.daily_kwh && p.daily_kwh[season], 0);
  }

  function extraPanelsFor(design, addedKwhPerDay, season) {
    var gen = averageDailyGeneration(design, season || 'winter');
    var perPanel = gen / Math.max(1, panelCount(design));
    if (perPanel <= 0) return null;
    return Math.ceil(addedKwhPerDay / perPanel);
  }

  /* ---------------- validation ---------------- */

  function validate(input) {
    var rawBattery = input && input.energy && input.energy.battery;
    var design = normalizeEnergy(input);
    var e = design && design.energy;
    var issues = [];
    function add(category, code, message, severity) {
      var sev = severity || (category === 'invalid-geometry' ? 'error' : 'review');
      issues.push({ category: category, code: code, message: message, severity: sev });
    }
    if (!e) {
      add('unresolved-assumption', 'energy-model-missing', 'No residential energy model is recorded for ' + (design.name || design.id) + '.');
      return { ok: false, issues: issues };
    }
    var geo = panelGeometry(design);
    var rm = e.reference_module;
    var kwp = installedKwp(design);
    var area = panelSurfaceArea(design);

    /* panel count and capacity */
    if (geo.total_panels !== panelCount(design)) add('invalid-geometry', 'panel-count-geometry', 'Installed panel count (' + panelCount(design) + ') does not match the number of placed panels (' + geo.total_panels + ').');
    if (!near(kwp * 1000, kwp * 1000, 0.01)) add('invalid-geometry', 'capacity-mismatch', 'Installed capacity is inconsistent.');
    var rowsLayout = sum(e.solar.arrays || [], function (a) { return a.rows * a.columns; });
    if (rowsLayout !== panelCount(design)) add('invalid-geometry', 'row-column-mismatch', 'Row and column counts hold ' + rowsLayout + ' panels but ' + panelCount(design) + ' are declared.');

    /* bounds, overlap, support */
    var panels = geo.panels;
    for (var i = 0; i < panels.length; i++) {
      var p = panels[i];
      var rect = (geo.arrays.filter(function (a) { return a.id === p.array; })[0] || {}).rect;
      if (!rect) { add('invalid-geometry', 'unsupported-panel', 'Panel ' + p.id + ' has no mounting surface.'); continue; }
      var xs = p.corners.map(function (c) { return c[0]; }), ys = p.corners.map(function (c) { return c[1]; });
      if (Math.min.apply(null, xs) < rect.minX - 0.01 || Math.max.apply(null, xs) > rect.maxX + 0.01 || Math.min.apply(null, ys) < rect.minY - 0.01 || Math.max.apply(null, ys) > rect.maxY + 0.01) {
        add('invalid-geometry', 'panel-outside-surface', 'Panel ' + p.id + ' extends beyond its mounting surface.');
      }
      for (var j = i + 1; j < panels.length; j++) {
        var overlap = polygonsOverlap(p.corners, panels[j].corners);
        if (overlap <= 0.01) continue;
        var zA = [Math.min.apply(null, p.corners.map(function (q) { return q[2]; })), Math.max.apply(null, p.corners.map(function (q) { return q[2]; }))];
        var zB = [Math.min.apply(null, panels[j].corners.map(function (q) { return q[2]; })), Math.max.apply(null, panels[j].corners.map(function (q) { return q[2]; }))];
        if (Math.min(zA[1], zB[1]) - Math.max(zA[0], zB[0]) <= 0.01) continue;
        add('invalid-geometry', 'panel-overlap', 'Panels ' + p.id + ' and ' + panels[j].id + ' overlap by ' + overlap + ' m² at the same height.');
      }
    }

    /* tilt, azimuth, pitch compatibility */
    (e.solar.arrays || []).forEach(function (a) {
      if (!isNum(a.tilt_deg) || a.tilt_deg < 0 || a.tilt_deg > 75) add('invalid-geometry', 'invalid-tilt', a.label + ' has an invalid tilt.');
      if (!isNum(a.azimuth_deg) || a.azimuth_deg < 0 || a.azimuth_deg > 360) add('invalid-geometry', 'invalid-azimuth', a.label + ' has an invalid azimuth.');
      if (a.mounting === 'roof-flush' && design.roof_form && Math.abs(a.tilt_deg - design.roof_form.pitch_deg) > 1.5) add('unresolved-assumption', 'flush-tilt', a.label + ' is flush-mounted but its tilt does not match the roof pitch.');
      if (a.surface && a.surface.kind === 'roof' && a.surface.slope === 'north') add('unresolved-assumption', 'north-array', a.label + ' is on a north-facing slope; winter yield will be very low.');
      if (e.role !== 'shared-community' && (a.module_count < 1 || a.module_count > 16)) add('unresolved-assumption', 'array-count-range', a.label + ' is outside the one-to-sixteen panel array range.');
    });

    if (e.role !== 'shared-community' && (panelCount(design) < 6 || panelCount(design) > 16)) add('unresolved-assumption', 'panel-count-range', 'The installed total of ' + panelCount(design) + ' panels is outside the initial six-to-sixteen residential range. Document the reason.');
    /* roof obstacles (chimney, flue, vent) */
    (e.solar.roof_obstacles || []).forEach(function (ob) {
      panels.forEach(function (p) {
        var cx = p.centre[0], cy = p.centre[1];
        if (cx > ob.minX - 0.1 && cx < ob.maxX + 0.1 && cy > ob.minY - 0.1 && cy < ob.maxY + 0.1) add('invalid-geometry', 'roof-obstacle-conflict', 'Panel ' + p.id + ' conflicts with ' + ob.label + '.');
      });
    });

    /* snow discharge onto entrances */
    (e.solar.arrays || []).forEach(function (a) {
      if (!a.snow || a.snow.shed_to !== 'south') return;
      if (!a.snow.discharge_clear) add('environmental-review', 'snow-discharge', a.label + ' sheds snow to the south with no recorded clear zone. Check entrances, accessible routes and paths.', 'review');
      (design.modules || []).forEach(function (m) {
        (m.openings || []).forEach(function (o) {
          if (o.type !== 'door' && o.type !== 'sliding-door') return;
          /* A south-shedding array directly above a door on the same module. */
          var arrTop = Math.max.apply(null, a.module_count ? [0] : [0]);
          if (a.surface && a.surface.kind === 'roof' && a.surface.module === m.id && o.face === 'south') add('environmental-review', 'snow-over-door', a.label + ' can discharge snow toward ' + o.name + ' (' + o.id + '). Snow guards and a protected entry need review.', 'review');
        });
      });
    });

    /* accessibility: supports and canopies must not obstruct routes */
    if (design.access && design.access.target === 'accessible') {
      (e.solar.canopies || []).forEach(function (c) {
        if (c.accessible_route_clear === false) add('environmental-review', 'canopy-route', c.label + ' is recorded as obstructing an accessible route.', 'review');
      });
      (e.solar.arrays || []).forEach(function (a) {
        if (a.maintenance && a.maintenance.access === 'ladder-only') add('unresolved-assumption', 'accessible-maintenance', a.label + ' depends on ladder-only maintenance, which is not acceptable for this accessible home.', 'review');
      });
    }

    /* battery */
    var b = e.battery;
    if (!(b.nominal_kwh > 0)) add('invalid-geometry', 'battery-nominal', 'Battery nominal capacity must be positive.');
    if (rawBattery && isNum(rawBattery.usable_kwh) && isNum(rawBattery.nominal_kwh) && rawBattery.usable_kwh > rawBattery.nominal_kwh + 0.001) add('invalid-geometry', 'battery-usable-raw', 'Recorded usable battery capacity exceeds the recorded nominal capacity.');
    if (b.usable_kwh > b.nominal_kwh + 0.001) add('invalid-geometry', 'battery-usable', 'Usable battery capacity exceeds nominal capacity.');
    if (!(b.min_soc_pct >= 0 && b.min_soc_pct < b.max_soc_pct && b.max_soc_pct <= 100)) add('invalid-geometry', 'battery-soc', 'Battery state-of-charge limits are inconsistent.');
    if (Math.abs(b.usable_kwh - b.nominal_kwh * (b.max_soc_pct - b.min_soc_pct) / 100) > Math.max(0.35, b.nominal_kwh * 0.06)) add('unresolved-assumption', 'battery-usable-derivation', 'Usable capacity does not closely match the stated SOC window and efficiencies. Document the equipment limit.');
    if (!(b.charge_efficiency > 0.5 && b.charge_efficiency <= 1 && b.discharge_efficiency > 0.5 && b.discharge_efficiency <= 1)) add('invalid-geometry', 'battery-efficiency', 'Battery charge and discharge efficiencies must be between 0.5 and 1.0.');
    if (!b.heated_enclosure && b.temp_limits && b.temp_limits.charge_min_c >= 0) add('unresolved-assumption', 'battery-cold-charge', 'The battery is not in a heated enclosure but is assumed to accept charge at or below 0 °C. LiFePO4 charging below 0 °C must be prevented.');

    /* consumption sanity */
    var summer = loadsForProfile(design, 'summer');
    var winter = loadsForProfile(design, 'winter-full-time');
    if (summer.daily_kwh <= 0 || winter.daily_kwh <= 0) add('invalid-geometry', 'zero-consumption', 'A residential load profile computes zero daily consumption.');
    if (summer.daily_kwh > 12 || winter.daily_kwh > 12) add('unresolved-assumption', 'high-consumption', 'Daily consumption exceeds the initial residential band; document the reason.');
    if (summer.daily_kwh < 0.2 && winter.daily_kwh < 0.2) add('unresolved-assumption', 'very-low-consumption', 'Daily consumption is lower than an unoccupied monitoring load; check the model.');

    /* geometry warnings are also issues */
    geo.warnings.forEach(function (w) { add('invalid-geometry', w.code, w.message); });

    /* review categories */
    if (e.solar.arrays.some(function (a) { return a.structure_review !== false; })) add('structural-review', 'pv-structure', 'Roof structure, wind uplift, snow drift and fixing for the PV arrays need structural review.', 'review');
    add('electrical-review', 'pv-electrical', 'String sizing, rapid shutdown, disconnects, bonding, grounding, battery enclosure and inspection need a licensed electrical design.', 'review');
    add('environmental-review', 'woodland', 'Keep the array on the roof, canopy or existing clearing. Do not clear mature trees to increase the modelled yield.', 'review');

    return {
      ok: !issues.some(function (x) { return x.severity === 'error'; }),
      issues: issues,
      summary: {
        panels: panelCount(design), kwp: round(kwp, 2), area_m2: round(area, 2),
        summer_kwh: summer.daily_kwh, winter_kwh: winter.daily_kwh,
        essential_winter_kwh: winter.essential_daily_kwh
      }
    };
  }

  function near(a, b, t) { return Math.abs(a - b) <= t; }

  /* ---------------- summary ---------------- */

  function summary(designInput) {
    var design = normalizeEnergy(designInput);
    var e = design.energy;
    if (!e) return null;
    var gen = monthlyGeneration(design);
    var summerGen = averageDailyGeneration(design, 'summer');
    var winterGen = averageDailyGeneration(design, 'winter');
    var summer = loadsForProfile(design, 'summer');
    var shoulder = loadsForProfile(design, 'shoulder');
    var winterFull = loadsForProfile(design, 'winter-full-time');
    var winterInt = loadsForProfile(design, 'winter-intermittent');
    var unoccupied = loadsForProfile(design, 'unoccupied-winter');
    var patterns = (e.profiles || []).filter(function (p) { return p.id !== 'unoccupied-winter'; });
    var autoWinter = autonomy(design, 'winter-full-time');
    var autoSummer = autonomy(design, 'summer');
    var b = batteryLimits(e.battery);
    var scen = scenarios(design);
    var fiveDay = scen.filter(function (s) { return s.id === 'winter-cloud-5'; })[0] || null;
    var fiveDayNoShared = simulateScenario(design, { id: 'winter-cloud-5-no-shared', label: 'Five cloudy winter days, no shared electricity', season: 'winter', days: 5, solar_factor: 0.25, load_profile: 'winter-full-time', snow: false, shared: false });
    var snowCovered = scen.filter(function (s) { return s.id === 'snow-covered'; })[0] || null;
    var primaryWinter = e.occupancy.pattern === 'intermittent-winter' ? winterInt : winterFull;
    var winterProfileId = e.occupancy.pattern === 'intermittent-winter' ? 'winter-intermittent' : 'winter-full-time';
    var autoPrimary = autonomy(design, winterProfileId);
    var supplementary = fiveDayNoShared ? round(fiveDayNoShared.total.unserved / Math.max(1, fiveDayNoShared.days), 2) : 0;
    var supplementaryWithShared = fiveDay ? round(fiveDay.total.unserved / Math.max(1, fiveDay.days), 2) : 0;
    var geo = panelGeometry(design);
    return {
      id: design.id, name: design.name,
      occupancy: e.occupancy,
      panels: panelCount(design),
      capacity_kwp: round(installedKwp(design), 2),
      panel_area_m2: round(panelSurfaceArea(design), 1),
      mounting: (e.solar.arrays || []).map(function (a) { return a.mounting; }),
      mounting_label: (e.solar.arrays || []).map(function (a) { return a.label + ' (' + a.module_count + ' × ' + ((a.module || e.reference_module).watts) + ' W, ' + a.tilt_deg + '° tilt, ' + a.azimuth_deg + '° azimuth, ' + a.mounting + ')'; }),
      arrays: (e.solar.arrays || []).map(function (a) { return { id: a.id, label: a.label, panels: a.module_count, tilt_deg: a.tilt_deg, azimuth_deg: a.azimuth_deg, mounting: a.mounting, electrical_group: a.electrical_group, watts: num((a.module || e.reference_module).watts, 450) }; }),
      generation: {
        summer_daily_kwh: summerGen,
        winter_daily_kwh: winterGen,
        annual_kwh: gen.annual_kwh,
        specific_yield: gen.specific_yield_kwh_per_kwp,
        months: gen.months
      },
      consumption: {
        summer_daily_kwh: summer.daily_kwh,
        shoulder_daily_kwh: shoulder.daily_kwh,
        winter_daily_kwh: primaryWinter.daily_kwh,
        winter_full_time_daily_kwh: winterFull.daily_kwh,
        winter_intermittent_daily_kwh: winterInt.daily_kwh,
        unoccupied_winter_daily_kwh: unoccupied.daily_kwh,
        summer_essential_kwh: summer.essential_daily_kwh,
        winter_essential_kwh: winterFull.essential_daily_kwh,
        winter_full_time_essential_kwh: winterFull.essential_daily_kwh,
        profiles: patterns.map(function (p) { var r = loadsForProfile(design, p.id); return { id: p.id, label: p.label, daily_kwh: r.daily_kwh, essential_daily_kwh: r.essential_daily_kwh }; })
      },
      battery: {
        technology: e.battery.technology, architecture_v: e.battery.architecture_v,
        nominal_kwh: e.battery.nominal_kwh, usable_kwh: round(b.usable, 2),
        reserve_kwh: round(b.reserve, 2), target_autonomy_days: e.battery.target_autonomy_days,
        heated: !!e.battery.heated_enclosure
      },
      autonomy: {
        essential_days: autoPrimary.essential_days,
        ordinary_days: autoPrimary.ordinary_days,
        summer_ordinary_days: autoSummer.ordinary_days,
        winter_full_time_ordinary_days: autoWinter.ordinary_days,
        primary_profile: winterProfileId
      },
      supplementary_daily_kwh: supplementary,
      supplementary_with_shared_daily_kwh: supplementaryWithShared,
      supplementary_note: 'Supplementary electricity is the unserved demand per day over a synthetic five-day cloudy winter period with no shared supply. With the community backup connected, the modelled shortfall is reduced but not guaranteed.',
      scenarios: scen,
      winter_risk: {
        five_day_unserved_kwh: fiveDayNoShared ? fiveDayNoShared.total.unserved : null,
        five_day_unserved_with_shared_kwh: fiveDay ? fiveDay.total.unserved : null,
        five_day_end_soc_pct: fiveDay ? fiveDay.end_soc_pct : null,
        snow_covered_end_soc_pct: snowCovered ? snowCovered.end_soc_pct : null,
        note: 'Synthetic scenarios. A positive five-day shortfall means the array cannot recharge the battery while supplying the household.'
      },
      suitable_patterns: e.occupancy.suitable_patterns,
      limitations: e.occupancy.limitations || [],
      status: e.status || 'concept-only',
      geometry: { total_panels: geo.total_panels, capacity_kwp: geo.capacity_kwp, warnings: geo.warnings },
      assumptions: {
        source: e.reference_module.source,
        note: 'Conceptual daily energy balance. Not a guarantee of off-grid performance, not a solar resource assessment and not a code or electrical design.'
      }
    };
  }

  /* ---------------- explorer overrides ---------------- */

  function applyOverrides(input, o) {
    o = o || {};
    var d = normalizeEnergy(input);
    var e = d.energy;
    if (!e) return d;
    var baseOccupants = Math.max(1, num(e.occupancy.household_size, 1));
    if (o.occupants != null && o.occupants !== baseOccupants) {
      var delta = o.occupants - baseOccupants;
      e.loads.forEach(function (l) {
        if (l.occupancy_dependency === 'always') return;
        if (l.class === 'essential-continuous') return;
        l.quantity = Math.max(1, l.quantity + (/^(laptop|phones|usb)/.test(l.id) ? delta : 0));
      });
      e.occupancy.household_size = o.occupants;
    }
    if (o.panelCount != null) {
      var arrays = e.solar.arrays || [];
      if (arrays.length) {
        arrays[0].module_count = Math.max(0, Math.round(o.panelCount));
        arrays[0].columns = Math.max(1, Math.ceil(arrays[0].module_count / arrays[0].rows));
      }
    }
    if (o.panelCapacity != null) {
      e.reference_module.watts = o.panelCapacity;
      e.solar.arrays.forEach(function (a) { a.module.watts = o.panelCapacity; });
    }
    if (o.tilt != null) e.solar.arrays.forEach(function (a) { a.tilt_deg = clamp(o.tilt, 0, 75); if (a.mounting === 'roof-flush') a.mounting = 'roof-tilted'; });
    if (o.azimuth != null) e.solar.arrays.forEach(function (a) { a.azimuth_deg = ((o.azimuth % 360) + 360) % 360; });
    if (o.shadingPct != null) e.solar.arrays.forEach(function (a) { a.shading = Object.assign({}, a.shading, { monthly: MONTHS.map(function () { return clamp(o.shadingPct, 0, 90); }) }); });
    if (o.batteryKwh != null) { e.battery.nominal_kwh = o.batteryKwh; e.battery.usable_kwh = o.batteryKwh * 0.9; }
    if (o.consumptionKwh != null && o.consumptionKwh > 0) {
      /* Scale all loads so the chosen profile lands on the requested daily total. */
      var before = loadsForProfile(d, 'summer').daily_kwh;
      if (before > 0) {
        var f = o.consumptionKwh / before;
        e.loads.forEach(function (l) { l.rated_w = l.rated_w * f; });
      }
    }
    if (o.profileId) {
      /* Keep the chosen operating profile primary for the comparison figures. */
      e.occupancy.pattern = o.profileId === 'winter-intermittent' ? 'intermittent-winter' : 'full-time';
    }
    if (o.cloudDays != null) {
      var five = e.scenarios.filter(function (s) { return s.id === 'winter-cloud-5'; })[0];
      if (five) five.days = o.cloudDays;
    }
    if (o.essentialOnly) e.scenarios.forEach(function (s) { s.essential_only = true; });
    if (o.shared === false) { e.shared.primary_configuration = 'independent'; }
    if (o.shared === true) { e.shared.primary_configuration = 'community-backup'; }
    return d;
  }

  return {
    REFERENCE_MODULE: REFERENCE_MODULE,
    MONTHS: MONTHS,
    MONTHLY_GHI: MONTHLY_GHI,
    MONTHLY_SNOW_AVAILABILITY: MONTHLY_SNOW_AVAILABILITY,
    LATITUDE: LATITUDE,
    PROFILE_KEYS: PROFILE_KEYS,
    LOAD_CLASSES: LOAD_CLASSES,
    ESSENTIAL_CLASSES: ESSENTIAL_CLASSES,
    DEFAULT_CLASS_FACTORS: DEFAULT_CLASS_FACTORS,
    normalizeEnergy: normalizeEnergy,
    panelGeometry: panelGeometry,
    roofInfo: roofInfo,
    roofHeightAt: roofHeightAt,
    moduleCorners: moduleCorners,
    panelDimensions: panelDimensions,
    dailyGeometry: dailyGeometry,
    monthlyIrradiance: monthlyIrradiance,
    sunAngles: sunAngles,
    obstacleShade: obstacleShade,
    monthlyGeneration: monthlyGeneration,
    averageDailyGeneration: averageDailyGeneration,
    loadsForProfile: loadsForProfile,
    profileById: profileById,
    panelCount: panelCount,
    installedKwp: installedKwp,
    panelSurfaceArea: panelSurfaceArea,
    batteryLimits: batteryLimits,
    simulateDay: simulateDay,
    simulateScenario: simulateScenario,
    scenarios: scenarios,
    autonomy: autonomy,
    optionalProfileKwh: optionalProfileKwh,
    extraPanelsFor: extraPanelsFor,
    summary: summary,
    validate: validate,
    applyOverrides: applyOverrides,
    supplementalFor: supplementalFor,
    round: round
  };
});
