/*
 * Containers Hamlet: residential thermal demand and heat-pump assessment.
 *
 * This module adds heating and cooling demand and heat-pump electricity to the
 * existing household energy model. It never replaces the baseline household
 * demand: every result separates household load, incremental heating and
 * cooling load, and supporting equipment.
 *
 * It is a preliminary, transparent model. It is not an HVAC design, a
 * building-performance simulation, a code calculation or an equipment
 * selection. Envelope areas come from the canonical geometry; U-values,
 * airtightness, gains, solar factors and heat-pump performance are documented
 * assumptions.
 *
 * Code licence: AGPL-3.0-or-later.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./design-schema.js'), require('./design-energy.js'), require('./design-model.js'));
  else root.DesignThermal = factory(root.DesignSchema, root.DesignEnergy, root.DesignModel);
})(typeof self !== 'undefined' ? self : this, function (Schema, Energy, Model) {
  'use strict';

  var SCHEMA = 'containers-hamlet-thermal/v1';
  var LATITUDE = 45.4;

  /* Monthly mean outdoor temperature, Ottawa (City), 1991–2020 normals, °C. */
  var MONTHLY_TEMP = [-9.6, -8.1, -2.2, 6.2, 13.8, 18.8, 21.3, 20.1, 15.6, 8.8, 2.0, -5.1];

  /* Test conditions requested for the assessment. */
  var TEMP_SCENARIOS = [
    { id: 'mild', label: 'Mild shoulder season', c: 10, note: 'Minimal heating; some dehumidification.' },
    { id: 'cool', label: 'Cool weather', c: 5, note: 'Heating begins; heat-pump efficiency still high.' },
    { id: 'early-winter', label: 'Early winter', c: 0, note: 'Freezing point; defrost cycles begin.' },
    { id: 'ordinary-cold', label: 'Ordinary cold winter', c: -10, note: 'A common cold winter condition in eastern Ontario.' },
    { id: 'severe', label: 'Severe winter', c: -20, note: 'Cold-climate heat-pump capacity is reduced.' },
    { id: 'extreme', label: 'Extreme winter design', c: -30, note: 'Near the coldest recorded conditions; resistance backup is likely.' }
  ];

  /* Cold-climate air-source performance assumptions. COP is the steady-state
     coefficient of performance; capacity is relative to the rated capacity at
     5 °C. Values are illustrative mid-range values informed by the NEEP
     cold-climate specification test points (5 °F, 17 °F and 47 °F). Confirm the
     selected model's published table before relying on any number. */
  var ASHP_POINTS = [
    { c: 10, cop: 4.2, cap: 1.05 },
    { c: 5, cop: 3.9, cap: 1.0 },
    { c: 0, cop: 3.4, cap: 0.95 },
    { c: -5, cop: 2.9, cap: 0.90 },
    { c: -10, cop: 2.4, cap: 0.83 },
    { c: -15, cop: 1.95, cap: 0.74 },
    { c: -20, cop: 1.6, cap: 0.64 },
    { c: -25, cop: 1.4, cap: 0.54 },
    { c: -30, cop: 1.25, cap: 0.44 }
  ];

  var DEFAULTS = {
    u_values: { wall: 0.18, roof: 0.12, floor: 0.15, window: 0.95, door: 1.2 },
    thermal_bridge_allowance: 0.10,
    airtightness_ach50: 1.5,
    ventilation: { mechanical_ach: 0.35, hrv_efficiency: 0.85 },
    internal_gains: { occupants_w: 80, appliances_w: 220 },
    solar: { shgc: 0.52, shading_factor: 0.55, frame_factor: 0.85 },
    conditioned_height_m: 2.45,
    party_wall_factor: 1.0,
    setpoints: { occupied_c: 20, unoccupied_c: 12, cooling_c: 24 },
    passive_cooling_fraction: 0.25,
    wood_heat: { available: true, capacity_kw: 5, efficiency: 0.7, daily_hours: 8 },
    heat_pump: {
      type: 'air-source', rated_heating_kw: 3.5, rated_cooling_kw: 3.5, min_modulation_kw: 1.2,
      operating_min_c: -30, defrost_penalty: 0.08, parasitic_w: 120, standby_w: 15,
      supplemental_resistance: true, ground_cop: 3.6, cooling_cop: 3.2, ground_cooling_cop: 4.5,
      cop_factor: 1, capacity_factor: 1
    },
    passive: { wall_u: 0.14, roof_u: 0.09, window_u: 0.75, ach50: 1.0, hrv_efficiency: 0.90, shading_factor: 0.45 }
  };

  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function num(v, d) { return typeof v === 'number' && Number.isFinite(v) ? v : d; }
  function round(v, d) { var f = Math.pow(10, d == null ? 2 : d); return Math.round(v * f) / f; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function sum(a, f) { return a.reduce(function (t, x) { return t + f(x); }, 0); }
  function monthLabel(i) { return Energy.MONTHS[i].label; }

  function thermalFor(design) {
    if (!design || !design.energy || !design.energy.thermal) return null;
    var t = clone(design.energy.thermal);
    t.u_values = Object.assign({}, DEFAULTS.u_values, t.u_values || {});
    t.ventilation = Object.assign({}, DEFAULTS.ventilation, t.ventilation || {});
    t.internal_gains = Object.assign({}, DEFAULTS.internal_gains, t.internal_gains || {});
    t.solar = Object.assign({}, DEFAULTS.solar, t.solar || {});
    t.setpoints = Object.assign({}, DEFAULTS.setpoints, t.setpoints || {});
    t.wood_heat = Object.assign({}, DEFAULTS.wood_heat, t.wood_heat || {});
    t.heat_pump = Object.assign({}, DEFAULTS.heat_pump, t.heat_pump || {});
    t.passive = Object.assign({}, DEFAULTS.passive, t.passive || {});
    return t;
  }

  function normalized(input) {
    var d = clone(input);
    if (!thermalFor(d)) return d;
    d.__thermal = thermalFor(d);
    return d;
  }

  /* ---------------- envelope ---------------- */
  function envelope(input) {
    var d = normalized(input);
    var t = d.__thermal;
    if (!t) return null;
    var tp = Model.thermalProfile(d);
    var exp = Model.exposureProfile(d);
    var conditioned = num(tp.conditioned_area_m2, 0);
    var grossWall = 0;
    var doorArea = 0;
    (d.modules || []).forEach(function (m) {
      grossWall += 2 * (m.nominal.length_m + m.nominal.width_m) * m.nominal.height_m;
      (m.openings || []).forEach(function (o) {
        var a = num(o.width_m, 0) * num(o.height_m, 0);
        if (o.type === 'door' || o.type === 'sliding-door') doorArea += a;
      });
    });
    var windowArea = num(exp.glazing_total_m2, 0);
    var wallNet = Math.max(0, grossWall * num(t.party_wall_factor, 1) - windowArea - doorArea);
    var roofArea = conditioned * 1.05;
    var floorArea = conditioned;
    var volume = conditioned * num(t.conditioned_height_m, 2.45);
    var u = t.u_values;
    var opaque = wallNet * u.wall + roofArea * u.roof + floorArea * u.floor;
    var fenestration = windowArea * u.window + doorArea * u.door;
    var ua = opaque * (1 + num(t.thermal_bridge_allowance, 0.1)) + fenestration;
    var infiltrationAch = Math.max(0, num(t.airtightness_ach50, 1.5)) / 20;
    var ventAch = Math.max(0, num(t.ventilation.mechanical_ach, 0.35)) * (1 - clamp(num(t.ventilation.hrv_efficiency, 0.85), 0, 0.95));
    var effectiveAch = infiltrationAch + ventAch;
    var ventilationWPerK = 0.33 * volume * effectiveAch;
    return {
      conditioned_area_m2: round(conditioned, 1),
      volume_m3: round(volume, 1),
      wall_gross_m2: round(grossWall, 1),
      wall_net_m2: round(wallNet, 1),
      roof_m2: round(roofArea, 1),
      floor_m2: round(floorArea, 1),
      window_m2: round(windowArea, 1),
      door_m2: round(doorArea, 1),
      u_values: u,
      opaque_ua_w_k: round(opaque, 2),
      fenestration_ua_w_k: round(fenestration, 2),
      ua_w_k: round(ua, 2),
      infiltration_ach: round(infiltrationAch, 3),
      ventilation_ach: round(ventAch, 3),
      effective_ach: round(effectiveAch, 3),
      ventilation_w_k: round(ventilationWPerK, 2),
      total_ua_w_k: round(ua + ventilationWPerK, 2),
      party_wall_factor: num(t.party_wall_factor, 1),
      note: 'Areas come from the canonical modules, roof and opening geometry. Shared party walls are approximated with a factor; wall area is not a measured quantity.'
    };
  }

  /* ---------------- gains ---------------- */
  function faceAzimuth(face) { return { north: 0, east: 90, south: 180, west: 270 }[face]; }
  function solarGainKwh(input, monthIndex, opts) {
    var d = normalized(input);
    var t = d.__thermal;
    var exp = Model.exposureProfile(d);
    var shading = opts && opts.shading_factor != null ? opts.shading_factor : num(t.solar.shading_factor, 0.55);
    var total = 0;
    ['north', 'east', 'south', 'west'].forEach(function (face) {
      var area = num(exp.glazing_by_face[face], 0);
      if (area <= 0) return;
      var irr = Energy.monthlyIrradiance(LATITUDE, 90, faceAzimuth(face), monthIndex).kwh_m2_day;
      total += area * irr * num(t.solar.shgc, 0.52) * num(t.solar.frame_factor, 0.85) * shading;
    });
    return round(total, 2);
  }

  function internalGainKwh(input, opts) {
    var d = normalized(input);
    var t = d.__thermal;
    var occupants = Math.max(1, num(opts && opts.occupants, num(d.energy.occupancy.household_size, 1)));
    var appliances = num(t.internal_gains.appliances_w, 220);
    return round((occupants * num(t.internal_gains.occupants_w, 80) + appliances) * 24 / 1000, 2);
  }

  /* ---------------- demand ---------------- */
  function demandAt(input, opts) {
    opts = opts || {};
    var d = normalized(input);
    var t = d.__thermal;
    if (!t) return null;
    var env = envelope(d);
    var indoor = num(opts.indoor_c, opts.occupied === false ? t.setpoints.unoccupied_c : t.setpoints.occupied_c);
    var outdoor = num(opts.outdoor_c, MONTHLY_TEMP[0]);
    var monthIndex = opts.monthIndex == null ? 0 : opts.monthIndex;
    var delta = indoor - outdoor;
    var lossKwh = Math.max(0, env.total_ua_w_k * delta * 24 / 1000);
    var internal = internalGainKwh(d, opts);
    var solar = opts.includeSolar === false ? 0 : solarGainKwh(d, monthIndex, opts);
    var gains = internal + solar;
    var heating = Math.max(0, lossKwh - gains);
    var internalW = (Math.max(1, num(opts.occupants, num(d.energy.occupancy.household_size, 1))) * num(t.internal_gains.occupants_w, 80) + num(t.internal_gains.appliances_w, 220));
    var peakHeatingW = Math.max(0, env.total_ua_w_k * delta - internalW);
    var cooling = 0;
    var peakCoolingW = 0;
    if (outdoor > indoor) {
      var envelopeGain = env.total_ua_w_k * (outdoor - indoor) * 24 / 1000;
      var gross = internal + solar + Math.max(0, envelopeGain);
      cooling = Math.max(0, gross * (1 - clamp(num(t.passive_cooling_fraction, 0.25), 0, 0.8)));
      var solarPeakW = num(t.solar.peak_w_m2, 500) * Math.max(0, env.window_m2) * num(t.solar.shgc, 0.52) * num(t.solar.shading_factor, 0.55);
      peakCoolingW = Math.max(0, internalW + solarPeakW + env.total_ua_w_k * (outdoor - indoor));
    }
    return {
      outdoor_c: round(outdoor, 1), indoor_c: round(indoor, 1), month: monthLabel(monthIndex),
      loss_kwh_day: round(lossKwh, 2), internal_gain_kwh_day: internal, solar_gain_kwh_day: solar,
      total_gain_kwh_day: round(gains, 2), heating_kwh_day: round(heating, 2), cooling_kwh_day: round(cooling, 2),
      peak_heating_w: round(peakHeatingW, 0), peak_cooling_w: round(peakCoolingW, 0),
      ua_w_k: env.total_ua_w_k, note: 'Steady-state daily balance. Solar gains are monthly averages, not a peak-hour cooling model.'
    };
  }

  function monthly(input, opts) {
    opts = opts || {};
    var d = normalized(input);
    var t = d.__thermal;
    if (!t) return null;
    var env = envelope(d);
    var months = MONTHLY_TEMP.map(function (temp, i) {
      var dem = demandAt(d, { outdoor_c: temp, monthIndex: i, occupants: opts.occupants, occupied: opts.occupied, includeSolar: opts.includeSolar });
      return {
        month: Energy.MONTHS[i].key, monthIndex: i, label: monthLabel(i), days: Energy.MONTHS[i].days,
        outdoor_c: round(temp, 1), heating_kwh_day: dem.heating_kwh_day, cooling_kwh_day: dem.cooling_kwh_day,
        heating_kwh: round(dem.heating_kwh_day * Energy.MONTHS[i].days, 1),
        cooling_kwh: round(dem.cooling_kwh_day * Energy.MONTHS[i].days, 1),
        solar_gain_kwh_day: dem.solar_gain_kwh_day
      };
    });
    return {
      months: months,
      annual_heating_kwh: round(sum(months, function (m) { return m.heating_kwh; }), 0),
      annual_cooling_kwh: round(sum(months, function (m) { return m.cooling_kwh; }), 0),
      peak_heating_w: Math.max.apply(null, months.map(function (m) { return demandAt(d, { outdoor_c: m.outdoor_c, monthIndex: m.monthIndex, includeSolar: false }).peak_heating_w; })),
      design_heat_load_w: demandAt(d, { outdoor_c: -30, monthIndex: 0, includeSolar: false }).peak_heating_w,
      envelope: env,
      note: 'Monthly mean temperatures are Ottawa (City) 1991–2020 normals. The model is a steady-state daily balance, not an hourly building simulation.'
    };
  }

  /* ---------------- heat pump ---------------- */
  function interpolate(points, c, key) {
    if (c >= points[0].c) return points[0][key];
    if (c <= points[points.length - 1].c) return points[points.length - 1][key];
    for (var i = 0; i < points.length - 1; i++) {
      var a = points[i], b = points[i + 1];
      if (c <= a.c && c >= b.c) {
        var f = (c - a.c) / (b.c - a.c);
        return a[key] + (b[key] - a[key]) * f;
      }
    }
    return points[0][key];
  }

  function heatPumpPerformance(input, outdoorC, type) {
    var d = normalized(input);
    var t = d.__thermal;
    var hp = t.heat_pump;
    var kind = type || hp.type || 'air-source';
    if (kind === 'ground-source') {
      return {
        type: 'ground-source', outdoor_c: round(outdoorC, 1), cop: round(num(hp.ground_cop, 3.6) * num(hp.cop_factor, 1), 2), capacity_kw: round(num(hp.rated_heating_kw, 3.5) * num(hp.capacity_factor, 1), 2),
        capacity_factor: 1, defrost: 0, supplemental_allowed: false, operating: true,
        note: 'Ground-source COP is held constant as a first approximation. Loop pumping, ground temperature, borehole field and geology are not designed.'
      };
    }
    var cop = interpolate(ASHP_POINTS, outdoorC, 'cop');
    var cap = interpolate(ASHP_POINTS, outdoorC, 'cap');
    var operating = outdoorC >= num(hp.operating_min_c, -30);
    var defrost = outdoorC < 5 ? num(hp.defrost_penalty, 0.08) : 0;
    if (!operating) cop = 0;
    return {
      type: 'air-source', outdoor_c: round(outdoorC, 1), cop: round(cop * num(hp.cop_factor, 1) * (1 - defrost), 2), raw_cop: round(cop, 2),
      capacity_kw: round(num(hp.rated_heating_kw, 3.5) * cap * num(hp.capacity_factor, 1), 2), capacity_factor: round(cap, 2), defrost: defrost,
      supplemental_allowed: !!hp.supplemental_resistance, operating: operating,
      note: 'Illustrative mid-range cold-climate curve. Published COP and capacity vary by model; verify at each temperature.'
    };
  }

  function electricalForThermal(input, thermalKwh, outdoorC, opts) {
    opts = opts || {};
    var d = normalized(input);
    var t = d.__thermal;
    if (!(thermalKwh > 0.01)) {
      return { thermal_kwh: 0, delivered_kwh: 0, supplemental_kwh: 0, electrical_kwh: 0, cop: 0, performance: null, supplemental_share: 0 };
    }
    var hp = t.heat_pump;
    var perf = heatPumpPerformance(d, outdoorC, opts.type);
    var capacityKwh = Math.max(0, perf.capacity_kw) * 24;
    var delivered = Math.min(thermalKwh, capacityKwh);
    var supplemental = Math.max(0, thermalKwh - delivered);
    if (!perf.operating) { delivered = 0; supplemental = thermalKwh; }
    var cop = perf.cop > 0 ? perf.cop : 0;
    if (delivered > 0 && thermalKwh < num(hp.min_modulation_kw, 1.2) * 24) cop = cop * 0.9;
    var electrical = (cop > 0 ? delivered / cop : delivered) + supplemental + num(hp.parasitic_w, 120) * 24 / 1000 + num(hp.standby_w, 15) * 24 / 1000;
    return {
      thermal_kwh: round(thermalKwh, 2), delivered_kwh: round(delivered, 2), supplemental_kwh: round(supplemental, 2),
      electrical_kwh: round(electrical, 2), cop: round(cop, 2), performance: perf,
      supplemental_share: thermalKwh > 0 ? round(supplemental / thermalKwh * 100, 0) : 0
    };
  }

  function coolingElectrical(input, coolingKwh, outdoorC, opts) {
    opts = opts || {};
    var d = normalized(input);
    if (!(coolingKwh > 0.01)) {
      return { cooling_kwh: 0, delivered_kwh: 0, unmet_kwh: 0, cop: 0, electrical_kwh: 0 };
    }
    var hp = d.__thermal.heat_pump;
    var kind = opts.type || hp.type;
    var cop = kind === 'ground-source' ? num(hp.ground_cooling_cop, 4.5) : num(hp.cooling_cop, 3.2);
    var cap = Math.max(0, num(hp.rated_cooling_kw, 3.5)) * 24;
    var delivered = Math.min(coolingKwh, cap);
    var unmet = Math.max(0, coolingKwh - delivered);
    var electrical = delivered / cop + unmet + num(hp.parasitic_w, 120) * 24 / 1000 * (delivered > 0 ? 1 : 0);
    return { cooling_kwh: round(coolingKwh, 2), delivered_kwh: round(delivered, 2), unmet_kwh: round(unmet, 2), cop: cop, electrical_kwh: round(electrical, 2) };
  }

  function heatPumpMonthly(input, opts) {
    opts = opts || {};
    var d = normalized(input);
    var t = d.__thermal;
    if (!t) return null;
    var base = monthly(d, opts);
    var type = opts.type || t.heat_pump.type;
    var months = base.months.map(function (m) {
      var heat = electricalForThermal(d, m.heating_kwh_day, m.outdoor_c, { type: type });
      var cool = coolingElectrical(d, m.cooling_kwh_day, m.outdoor_c, { type: type });
      return Object.assign({}, m, {
        heating_electric_kwh_day: heat.electrical_kwh, cooling_electric_kwh_day: cool.electrical_kwh,
        heating_electric_kwh: round(heat.electrical_kwh * m.days, 1), cooling_electric_kwh: round(cool.electrical_kwh * m.days, 1),
        cop: heat.cop, supplemental_kwh_day: heat.supplemental_kwh
      });
    });
    return {
      months: months,
      annual_heating_electric_kwh: round(sum(months, function (m) { return m.heating_electric_kwh; }), 0),
      annual_cooling_electric_kwh: round(sum(months, function (m) { return m.cooling_electric_kwh; }), 0),
      annual_total_electric_kwh: round(sum(months, function (m) { return m.heating_electric_kwh + m.cooling_electric_kwh; }), 0),
      annual_heating_thermal_kwh: base.annual_heating_kwh,
      annual_cooling_thermal_kwh: base.annual_cooling_kwh,
      peak_heating_w: base.design_heat_load_w,
      design_heat_load_w: base.design_heat_load_w,
      type: type,
      note: 'Heat-pump electricity is additional to the baseline household load. It is not added to the household profile.'
    };
  }

  function temperatureTable(input, opts) {
    opts = opts || {};
    var d = normalized(input);
    var t = d.__thermal;
    if (!t) return null;
    var type = opts.type || t.heat_pump.type;
    return TEMP_SCENARIOS.map(function (s) {
      var dem = demandAt(d, { outdoor_c: s.c, monthIndex: 0, includeSolar: false, occupants: opts.occupants, occupied: opts.occupied });
      var heat = electricalForThermal(d, dem.heating_kwh_day, s.c, { type: type });
      var perf = heatPumpPerformance(d, s.c, type);
      var peakElectrical = perf.capacity_kw > 0 ? Math.min(dem.peak_heating_w / 1000, perf.capacity_kw) / Math.max(0.01, perf.cop) + Math.max(0, dem.peak_heating_w / 1000 - perf.capacity_kw) + num(t.heat_pump.parasitic_w, 120) / 1000 : dem.peak_heating_w / 1000;
      return {
        id: s.id, label: s.label, outdoor_c: s.c, note: s.note,
        heating_kwh_day: dem.heating_kwh_day, heating_peak_w: dem.peak_heating_w,
        cop: heat.cop, capacity_kw: perf.capacity_kw, supplemental_kwh_day: heat.supplemental_kwh,
        electrical_kwh_day: heat.electrical_kwh, electrical_peak_kw: round(peakElectrical, 2),
        meets_design_load: dem.peak_heating_w / 1000 <= perf.capacity_kw + 0.01
      };
    });
  }

  /* ---------------- additional infrastructure ---------------- */
  function additionalPanels(input, hp, opts) {
    opts = opts || {};
    var d = normalized(input);
    var t = d.__thermal;
    if (!t || !hp) return null;
    var existing = Energy.summary(d);
    var existingPanels = existing.panels;
    var gen = Energy.monthlyGeneration(d);
    var perPanel = gen.months.map(function (m) { return m.kwh / Math.max(1, existingPanels) / m.days; });
    var householdDaily = gen.months.map(function (m) {
      if (m.season === 'summer') return existing.consumption.summer_daily_kwh;
      if (m.season === 'winter') return existing.consumption.winter_full_time_daily_kwh;
      return existing.consumption.shoulder_daily_kwh;
    });
    var winterIdx = [0, 1, 10, 11];
    var baselineWinter = Math.ceil(Math.max.apply(null, winterIdx.map(function (i) { return householdDaily[i] / Math.max(0.0001, perPanel[i]); })));
    var hpWinter = Math.ceil(Math.max.apply(null, winterIdx.map(function (i) { return hp.months[i].heating_electric_kwh_day / Math.max(0.0001, perPanel[i]); })));
    var hpAnnualElectric = hp.annual_heating_electric_kwh + hp.annual_cooling_electric_kwh;
    var hpAnnual = Math.ceil(hpAnnualElectric / Math.max(0.0001, (gen.annual_kwh / Math.max(1, existingPanels))));
    var totalWinter = Math.max(existingPanels, baselineWinter + hpWinter);
    var additionalBeyond = Math.max(0, totalWinter - existingPanels);
    var area = additionalBeyond * 1.997;
    var roof = Energy.roofInfo(d);
    var existingArea = existing.panel_area_m2;
    var availableRoof = Math.max(0, num(roof.solarArea_m2, 0) - existingArea);
    var severePerPanel = 0.15;
    var fiveDayLoad = 5 * (existing.consumption.winter_full_time_daily_kwh + hp.months[0].heating_electric_kwh_day);
    var usable = existing.battery.usable_kwh;
    var recoveryPanels = Math.ceil(Math.max(0, fiveDayLoad - usable) / (5 * severePerPanel));
    return {
      existing_panels: existingPanels,
      baseline_household_panels_winter: baselineWinter,
      heat_pump_panels_winter: hpWinter,
      heat_pump_panels_annual: hpAnnual,
      total_required_winter: totalWinter,
      additional_panels: additionalBeyond,
      additional_area_m2: round(area, 1),
      total_area_m2: round(existingArea + area, 1),
      available_roof_area_m2: round(availableRoof, 1),
      fits_existing_roof: area <= availableRoof + 0.01,
      ground_area_if_no_roof_m2: round(Math.max(0, area - availableRoof), 1),
      recovery_panels_severe_cloud: recoveryPanels,
      per_panel_winter_kwh_day: round(perPanel[0], 3),
      note: 'The winter-critical count uses January and December per-panel generation. The annual count is a lower bound and is not sufficient for winter autonomy. Additional panels are beyond the existing reference array; the array is not resized automatically.'
    };
  }

  function additionalBattery(input, hp, opts) {
    opts = opts || {};
    var d = normalized(input);
    var t = d.__thermal;
    if (!t || !hp) return null;
    var existing = Energy.summary(d);
    var winterDaily = hp.months[0].heating_electric_kwh_day;
    var usableFraction = 0.8;
    var dischargeEff = num(d.energy.battery.discharge_efficiency, 0.96);
    var coldDerate = 0.9;
    function forDays(days) {
      return Math.ceil(winterDaily * days / (usableFraction * dischargeEff * coldDerate));
    }
    return {
      winter_daily_electric_kwh: round(winterDaily, 1),
      one_day_kwh: forDays(1), three_day_kwh: forDays(3), five_day_kwh: forDays(5),
      existing_nominal_kwh: existing.battery.nominal_kwh,
      total_nominal_three_day_kwh: existing.battery.nominal_kwh + forDays(3),
      usable_fraction: usableFraction,
      note: 'Additional nominal battery capacity before further equipment limits. It excludes the existing household battery and does not include inverter, enclosure or fire-separation costs.'
    };
  }

  function inverterRequirement(input, hp) {
    var d = normalized(input);
    var t = d.__thermal;
    if (!t || !hp) return null;
    var table = temperatureTable(d, { type: hp.type });
    var worst = table.reduce(function (a, b) { return b.electrical_peak_kw > a.electrical_peak_kw ? b : a; }, table[0]);
    var baselinePeak = Math.max(2, num(d.energy.battery.inverter_kw, 3) * 0.7);
    var required = round(worst.electrical_peak_kw + baselinePeak, 1);
    return {
      heat_pump_peak_kw: worst.electrical_peak_kw,
      baseline_peak_kw: round(baselinePeak, 1),
      total_peak_kw: required,
      existing_inverter_kw: d.energy.battery.inverter_kw,
      additional_inverter_kw: round(Math.max(0, required - d.energy.battery.inverter_kw), 1),
      worst_case: worst.label
    };
  }

  /* ---------------- strategies ---------------- */
  function strategies(input, opts) {
    opts = opts || {};
    var d = normalized(input);
    var t = d.__thermal;
    if (!t) return null;
    var base = Energy.summary(d);
    var ashp = heatPumpMonthly(d, { type: 'air-source' });
    var gshp = heatPumpMonthly(d, { type: 'ground-source' });
    var panelsA = additionalPanels(d, ashp);
    var batteryA = additionalBattery(d, ashp);
    var panelsG = additionalPanels(d, gshp);
    var batteryG = additionalBattery(d, gshp);
    var annualHeat = ashp.annual_heating_thermal_kwh;
    var wood = t.wood_heat;
    var woodAvailable = !!wood.available;
    var woodDaily = woodAvailable ? wood.capacity_kw * num(wood.daily_hours, 8) * wood.efficiency : 0;
    var woodThermal = woodDaily * 150; /* 150 heating days at the recorded daily capability */
    var hpElectricAnnual = ashp.annual_heating_electric_kwh + ashp.annual_cooling_electric_kwh;
    var rows = [];
    rows.push({
      id: 'A', label: 'Passive architecture and wood heating',
      hp_electric_kwh: 0, additional_panels: 0, additional_battery_kwh: 0, wood_thermal_kwh: round(Math.min(annualHeat, woodThermal), 0),
      unserved_thermal_kwh: round(Math.max(0, annualHeat - woodThermal), 0),
      note: 'Baseline. Heat pump is not used. Wood heat must cover the heating load; stove capacity, fuel storage and physical ability are not guaranteed.'
    });
    var surplus = monthlySurplus(d, base);
    var winterSurplus = surplus.filter(function (x) { return /January|February|March|November|December/.test(x.month); });
    var shoulderSurplus = surplus.filter(function (x) { return /April|May|September|October/.test(x.month); });
    var summerSurplus = surplus.filter(function (x) { return /June|July|August/.test(x.month); });
    var solarHpElectric = sum(winterSurplus, function (x) { return x.surplus_kwh; }) + sum(shoulderSurplus, function (x) { return x.surplus_kwh; }) * 0.5;
    var solarThermal = sum(winterSurplus, function (x) { return x.surplus_kwh; }) * 2.4 + sum(shoulderSurplus, function (x) { return x.surplus_kwh; }) * 0.5 * 3.2;
    var summerCoolingElectric = Math.min(sum(summerSurplus, function (x) { return x.surplus_kwh; }), ashp.annual_cooling_electric_kwh);
    rows.push({
      id: 'B', label: 'Surplus-solar heat pump',
      hp_electric_kwh: round(solarHpElectric + summerCoolingElectric, 0), additional_panels: 0, additional_battery_kwh: 0,
      wood_thermal_kwh: round(Math.min(annualHeat, woodThermal), 0),
      unserved_thermal_kwh: round(Math.max(0, annualHeat - solarThermal - woodThermal), 0),
      note: 'Only surplus solar after household demand and reserve is used. Winter and shoulder surplus is credited to heating; summer surplus is credited to cooling. This is not a full winter heating strategy.'
    });
    var hybridWoodShare = 0.6;
    var hybridHpElectric = ashp.annual_heating_electric_kwh * (1 - hybridWoodShare);
    var hybridPanels = Math.ceil(hybridHpElectric / Math.max(1, (Energy.monthlyGeneration(d).annual_kwh / Math.max(1, base.panels))));
    rows.push({
      id: 'C', label: 'Hybrid wood and air-source heating',
      hp_electric_kwh: round(hybridHpElectric, 0), additional_panels: hybridPanels,
      additional_battery_kwh: batteryA.one_day_kwh, wood_thermal_kwh: round(annualHeat * hybridWoodShare, 0),
      unserved_thermal_kwh: 0,
      note: 'Wood provides about 60% of annual heating; the heat pump displaces the rest. This is the least electricity-intensive compressor strategy, but it still depends on physical wood handling.'
    });
    rows.push({
      id: 'D', label: 'Full-time air-source heating',
      hp_electric_kwh: ashp.annual_heating_electric_kwh, additional_panels: panelsA.additional_panels,
      additional_battery_kwh: batteryA.three_day_kwh, wood_thermal_kwh: 0, unserved_thermal_kwh: 0,
      note: 'The heat pump is the primary heat source. The winter-critical panel count and battery are much larger than the annual averages suggest.'
    });
    rows.push({
      id: 'E', label: 'Full-time ground-source heating',
      hp_electric_kwh: gshp.annual_heating_electric_kwh, additional_panels: panelsG.additional_panels,
      additional_battery_kwh: batteryG.three_day_kwh, wood_thermal_kwh: 0, unserved_thermal_kwh: 0,
      note: 'More efficient in cold weather, but requires a ground loop, drilling or excavation, circulation pumps and a larger capital project. The ground loop is not designed.'
    });
    rows.push({
      id: 'F', label: 'Passive cooling with optional mechanical cooling',
      hp_electric_kwh: ashp.annual_cooling_electric_kwh, additional_panels: Math.ceil(ashp.annual_cooling_electric_kwh / Math.max(1, (Energy.monthlyGeneration(d).annual_kwh / Math.max(1, base.panels)))),
      additional_battery_kwh: 0, wood_thermal_kwh: 0, unserved_thermal_kwh: 0,
      note: 'Cooling is a summer load and coincides with high solar generation. Passive shading, ventilation and ceiling fans are prioritised; the heat pump is supplementary.'
    });
    return {
      strategies: rows, ashp: ashp, gshp: gshp, panels_ashp: panelsA, panels_gshp: panelsG,
      battery_ashp: batteryA, battery_gshp: batteryG, inverter: inverterRequirement(d, ashp), annual_heat_kwh: annualHeat,
      note: 'Strategies are preliminary energy balances. They do not select equipment, size ductwork, design a ground loop or guarantee comfort.'
    };
  }

  function monthlySurplus(input, base) {
    var d = normalized(input);
    var gen = Energy.monthlyGeneration(d);
    return gen.months.map(function (m, i) {
      var use = m.season === 'summer' ? base.consumption.summer_daily_kwh : m.season === 'winter' ? base.consumption.winter_full_time_daily_kwh : base.consumption.shoulder_daily_kwh;
      return { month: m.label, surplus_kwh: Math.max(0, (m.kwh_per_day - use)) * m.days, reserve_kwh: 0 };
    });
  }

  /* ---------------- passive measures ---------------- */
  function passiveMeasures(input, opts) {
    opts = opts || {};
    var d = normalized(input);
    var t = d.__thermal;
    if (!t) return null;
    var baseline = monthly(d, opts);
    var improved = clone(d);
    improved.energy.thermal.u_values.wall = num(t.passive.wall_u, 0.14);
    improved.energy.thermal.u_values.roof = num(t.passive.roof_u, 0.09);
    improved.energy.thermal.u_values.window = num(t.passive.window_u, 0.75);
    improved.energy.thermal.airtightness_ach50 = num(t.passive.ach50, 1.0);
    improved.energy.thermal.ventilation.hrv_efficiency = num(t.passive.hrv_efficiency, 0.9);
    improved.energy.thermal.solar.shading_factor = num(t.passive.shading_factor, 0.45);
    delete improved.__thermal;
    var ip = thermalFor(improved);
    var better = monthly(improved, opts);
    var hpBase = heatPumpMonthly(d, { type: 'air-source' });
    var hpBetter = heatPumpMonthly(improved, { type: 'air-source' });
    var basePanels = additionalPanels(d, hpBase);
    var betterPanels = additionalPanels(improved, hpBetter);
    return {
      baseline: { annual_heating_kwh: baseline.annual_heating_kwh, design_load_w: baseline.design_heat_load_w, hp_electric_kwh: hpBase.annual_heating_electric_kwh, additional_panels: basePanels.additional_panels },
      improved: { annual_heating_kwh: better.annual_heating_kwh, design_load_w: better.design_heat_load_w, hp_electric_kwh: hpBetter.annual_heating_electric_kwh, additional_panels: betterPanels.additional_panels },
      reduction: {
        annual_heating_kwh: round(baseline.annual_heating_kwh - better.annual_heating_kwh, 0),
        design_load_w: round(baseline.design_heat_load_w - better.design_heat_load_w, 0),
        hp_electric_kwh: round(hpBase.annual_heating_electric_kwh - hpBetter.annual_heating_electric_kwh, 0),
        panels_avoided: Math.max(0, basePanels.additional_panels - betterPanels.additional_panels)
      },
      measures: [
        { id: 'wall', label: 'Increase continuous wall insulation', change: 'U-wall ' + t.u_values.wall + ' → ' + ip.u_values.wall + ' W/m²K' },
        { id: 'roof', label: 'Increase roof insulation', change: 'U-roof ' + t.u_values.roof + ' → ' + ip.u_values.roof + ' W/m²K' },
        { id: 'window', label: 'Improve window performance', change: 'U-window ' + t.u_values.window + ' → ' + ip.u_values.window + ' W/m²K' },
        { id: 'air', label: 'Improve airtightness', change: 'ACH50 ' + t.airtightness_ach50 + ' → ' + ip.airtightness_ach50 },
        { id: 'hrv', label: 'Improve heat-recovery efficiency', change: 'HRV ' + Math.round(t.ventilation.hrv_efficiency * 100) + '% → ' + Math.round(ip.ventilation.hrv_efficiency * 100) + '%' },
        { id: 'shade', label: 'Improve summer shading without blocking winter sun', change: 'Shading factor ' + t.solar.shading_factor + ' → ' + ip.solar.shading_factor }
      ],
      note: 'The passive package is illustrative. It is not costed, does not model overheating or moisture, and assumes careful detailing and commissioning.'
    };
  }

  /* ---------------- resilience ---------------- */
  function resilience(input, opts) {
    opts = opts || {};
    var d = normalized(input);
    var t = d.__thermal;
    if (!t) return null;
    var base = Energy.summary(d);
    var hp = heatPumpMonthly(d, { type: opts.type || t.heat_pump.type });
    var env = envelope(d);
    var wood = t.wood_heat;
    var scenarios = [
      { id: 'cloud-1', label: 'One cloudy winter day', days: 1, solar: 0.35, temp: -10, snow: false, hpFail: false, partial: false, shared: true },
      { id: 'cloud-3', label: 'Three cloudy winter days', days: 3, solar: 0.35, temp: -10, snow: false, hpFail: false, partial: false, shared: true },
      { id: 'cloud-5', label: 'Five cloudy winter days', days: 5, solar: 0.25, temp: -10, snow: false, hpFail: false, partial: false, shared: true },
      { id: 'snow', label: 'Snow-covered arrays', days: 3, solar: 0, temp: -20, snow: true, hpFail: false, partial: false, shared: true },
      { id: 'extreme', label: 'Extreme cold with low solar', days: 5, solar: 0.2, temp: -30, snow: false, hpFail: false, partial: false, shared: true },
      { id: 'partial', label: 'Partial battery at the start', days: 3, solar: 0.3, temp: -20, snow: false, hpFail: false, partial: true, shared: true },
      { id: 'hp-failure', label: 'Heat pump failure', days: 3, solar: 0.3, temp: -20, snow: false, hpFail: true, partial: false, shared: true },
      { id: 'no-shared', label: 'Loss of shared community electricity', days: 5, solar: 0.3, temp: -20, snow: false, hpFail: false, partial: false, shared: false }
    ];
    var gen = Energy.monthlyGeneration(d);
    var rows = scenarios.map(function (s) {
      var monthIdx = s.temp < -15 ? 0 : 0;
      var genDaily = gen.months[monthIdx].kwh_per_day * s.solar;
      var heatDem = demandAt(d, { outdoor_c: s.temp, monthIndex: monthIdx, includeSolar: false });
      var hpEl = s.hpFail ? 0 : electricalForThermal(d, heatDem.heating_kwh_day, s.temp, { type: opts.type || t.heat_pump.type }).electrical_kwh;
      var household = base.consumption.winter_full_time_daily_kwh;
      var startPct = s.partial ? 50 : 100;
      var battery = Energy.batteryLimits(d.energy.battery);
      var start = battery.maxKwh * startPct / 100;
      var totalUnserved = 0, totalHouseUnserved = 0, totalHeatUnserved = 0, totalWood = 0, soc = start, minSoc = start, end = start;
      for (var day = 0; day < s.days; day++) {
        /* Wood heat offsets thermal demand before electricity. It can only
           deliver up to its daily capacity and efficiency. */
        var woodThermal = wood.available ? Math.min(heatDem.heating_kwh_day, wood.capacity_kw * num(wood.daily_hours, 8) * wood.efficiency) : 0;
        var hpThermalNeeded = Math.max(0, heatDem.heating_kwh_day - woodThermal);
        var hpElectrical = s.hpFail ? 0 : electricalForThermal(d, hpThermalNeeded, s.temp, { type: opts.type || t.heat_pump.type }).electrical_kwh;
        var woodDelivered = woodThermal;
        var unservedHeatThermal = s.hpFail ? Math.max(0, heatDem.heating_kwh_day - woodDelivered) : 0;
        var load = household + hpElectrical;
        var sim = Energy.simulateDay({ design: d, profileId: 'winter-full-time', monthIndex: monthIdx, generationKwh: genDaily, startKwh: soc, snow: s.snow, shared: s.shared, loadKwh: load });
        var unserved = sim.unserved_kwh;
        var heatUnserved = Math.min(hpElectrical, unserved);
        var houseUnserved = Math.max(0, unserved - heatUnserved);
        totalUnserved += unserved; totalHouseUnserved += houseUnserved; totalHeatUnserved += heatUnserved; totalWood += woodDelivered;
        soc = sim.end_kwh; minSoc = Math.min(minSoc, sim.soc_min_kwh); end = sim.end_kwh;
      }
      return {
        id: s.id, label: s.label, days: s.days, outdoor_c: s.temp,
        household_kwh_day: round(household, 1), heat_pump_electric_kwh_day: round(hpEl, 1),
        generation_kwh_day: round(genDaily, 1), wood_thermal_kwh_day: round(wood.available ? Math.min(heatDem.heating_kwh_day, wood.capacity_kw * num(wood.daily_hours, 8) * wood.efficiency) : 0, 1),
        start_soc_pct: startPct, end_soc_pct: round(end / battery.nominal * 100, 0), min_soc_pct: round(minSoc / battery.nominal * 100, 0),
        unserved_electric_kwh: round(totalUnserved, 1), unserved_household_kwh: round(totalHouseUnserved, 1),
        unserved_heat_kwh: round(totalHeatUnserved, 1), wood_thermal_kwh: round(totalWood, 1),
        status: totalHouseUnserved > 0.01 ? 'household shortfall' : totalUnserved > 0.01 ? 'heating shortfall' : 'served'
      };
    });
    return {
      scenarios: rows,
      note: 'Synthetic daily scenarios. Household load is prioritised over heat-pump load when allocating unserved electricity. Wood heat is thermal and is limited by the recorded stove capacity. Heat-pump failure assumes wood backup is available.'
    };
  }

  function applyPassive(input) {
    var d = clone(input);
    if (!d.energy || !d.energy.thermal) return d;
    var t = thermalFor(d);
    d.energy.thermal.u_values.wall = num(t.passive.wall_u, 0.14);
    d.energy.thermal.u_values.roof = num(t.passive.roof_u, 0.09);
    d.energy.thermal.u_values.window = num(t.passive.window_u, 0.75);
    d.energy.thermal.airtightness_ach50 = num(t.passive.ach50, 1.0);
    d.energy.thermal.ventilation.hrv_efficiency = num(t.passive.hrv_efficiency, 0.9);
    d.energy.thermal.solar.shading_factor = num(t.passive.shading_factor, 0.45);
    return d;
  }

  /* ---------------- summary ---------------- */
  function summary(input, opts) {
    opts = opts || {};
    var d = normalized(input);
    var t = d.__thermal;
    if (!t) return null;
    var base = Energy.summary(d);
    var env = envelope(d);
    var mon = monthly(d, opts);
    var ashp = heatPumpMonthly(d, { type: 'air-source' });
    var gshp = heatPumpMonthly(d, { type: 'ground-source' });
    var panelsA = additionalPanels(d, ashp);
    var panelsG = additionalPanels(d, gshp);
    var batteryA = additionalBattery(d, ashp);
    var batteryG = additionalBattery(d, gshp);
    var inv = inverterRequirement(d, ashp);
    var strat = strategies(d, opts);
    var passive = passiveMeasures(d, opts);
    var resil = resilience(d, opts);
    var table = temperatureTable(d, opts);
    return {
      id: d.id, name: d.name,
      household: base,
      envelope: env,
      monthly: mon,
      ashp: { monthly: ashp, table: table },
      gshp: { monthly: gshp, table: temperatureTable(d, { type: 'ground-source' }) },
      additional: { panels_ashp: panelsA, panels_gshp: panelsG, battery_ashp: batteryA, battery_gshp: batteryG, inverter: inv },
      strategies: strat,
      passive: passive,
      resilience: resil,
      wood_heat: t.wood_heat,
      baseline_unchanged: true,
      note: 'Baseline household demand and the existing reference array are unchanged. Heat-pump electricity is additional. All results are preliminary.'
    };
  }

  function validate(input) {
    var d = normalized(input);
    var issues = [];
    var t = d.__thermal;
    if (!t) return { ok: true, issues: [{ category: 'unresolved-assumption', code: 'no-thermal-model', message: 'No thermal model is recorded.', severity: 'review' }] };
    var env = envelope(d);
    if (!(env.conditioned_area_m2 > 0)) issues.push({ category: 'invalid-geometry', code: 'no-conditioned-area', message: 'Conditioned floor area must be positive.', severity: 'error' });
    if (!(env.total_ua_w_k > 0)) issues.push({ category: 'invalid-geometry', code: 'no-ua', message: 'Envelope heat-loss coefficient must be positive.', severity: 'error' });
    if (!(t.airtightness_ach50 > 0)) issues.push({ category: 'invalid-geometry', code: 'invalid-airtightness', message: 'Airtightness must be positive.', severity: 'error' });
    if (!(t.heat_pump.rated_heating_kw > 0)) issues.push({ category: 'invalid-geometry', code: 'invalid-hp-capacity', message: 'Heat-pump rated capacity must be positive.', severity: 'error' });
    var mon = monthly(d);
    if (!(mon.annual_heating_kwh > 0)) issues.push({ category: 'unresolved-assumption', code: 'no-heating-demand', message: 'Annual heating demand is zero; check the assumptions.', severity: 'review' });
    if (mon.design_heat_load_w > t.heat_pump.rated_heating_kw * 1000 * 1.5) issues.push({ category: 'unresolved-assumption', code: 'heat-pump-undersized', message: 'The heat pump is much smaller than the design heat load at -30 °C; supplemental heat is likely.', severity: 'review' });
    return { ok: !issues.some(function (i) { return i.severity === 'error'; }), issues: issues };
  }

  return {
    SCHEMA: SCHEMA,
    MONTHLY_TEMP: MONTHLY_TEMP,
    TEMP_SCENARIOS: TEMP_SCENARIOS,
    ASHP_POINTS: ASHP_POINTS,
    DEFAULTS: DEFAULTS,
    thermalFor: thermalFor,
    envelope: envelope,
    solarGainKwh: solarGainKwh,
    internalGainKwh: internalGainKwh,
    demandAt: demandAt,
    monthly: monthly,
    heatPumpPerformance: heatPumpPerformance,
    electricalForThermal: electricalForThermal,
    coolingElectrical: coolingElectrical,
    heatPumpMonthly: heatPumpMonthly,
    temperatureTable: temperatureTable,
    additionalPanels: additionalPanels,
    additionalBattery: additionalBattery,
    inverterRequirement: inverterRequirement,
    strategies: strategies,
    passiveMeasures: passiveMeasures,
    applyPassive: applyPassive,
    resilience: resilience,
    summary: summary,
    validate: validate,
    round: round
  };
});
