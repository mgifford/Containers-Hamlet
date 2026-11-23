/*
 * Containers Hamlet Design Lab schema, migration and summary.
 *
 * v2.0 adds explicit vertical module geometry: storeys, elevations, support
 * intent, a structural review register and an accessibility record. It keeps
 * the v1.0 interchange format and the v0.1 prototype as explicit migrations.
 *
 * The authoritative existing architectural models (data/cabin-a.json and
 * data/lodge.json) are not replaced by this schema. It is a design-lab
 * interchange format with an explicit adapter on the Node side.
 *
 * Code licence: AGPL-3.0-or-later.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DesignSchema = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var SCHEMA = 'containers-hamlet-design/v2.0';
  var SCHEMA_V1 = 'containers-hamlet-design/v1.0';
  var LEGACY_SCHEMA = 'containers-hamlet-editor/v0.1';
  var MAX_OCCUPIED_STOREYS = 2;
  var MODULE_TYPES = {
    '20ft': { length_m: 6.058, width_m: 2.438, height_m: 2.896 },
    '40ft': { length_m: 12.192, width_m: 2.438, height_m: 2.896 }
  };
  var FACES = ['north', 'south', 'east', 'west'];
  var OPENING_TYPES = ['window', 'door', 'sliding-door', 'opening'];
  var ZONE_TYPES = ['sleeping', 'bathroom', 'kitchen', 'living', 'dining', 'work', 'storage', 'circulation'];
  var CLADDING = ['timber', 'metal', 'mixed'];
  var ROOFS = ['solar', 'green', 'membrane'];
  var ROOF_FORMS = ['gable', 'shed', 'butterfly', 'flat', 'canopy', 'green', 'solar-ready'];
  var ENVELOPE_ASSEMBLIES = ['rigid-board', 'mineral-wool', 'wood-fibre', 'spray-foam', 'hybrid'];
  var VEGETATION_TYPES = ['trellis', 'living-wall', 'edible-wall', 'privacy-screen'];
  var SOLAR_SEASONS = ['year-round', 'winter', 'summer'];
  var FOUNDATION_SYSTEMS = ['helical-piles', 'ground-screws', 'concrete-piers', 'timber-posts', 'bedrock-anchors'];
  var SUPPORT_TYPES = ['ground', 'module', 'engineered-transfer', 'not-assessed'];
  var REVIEW_STATUSES = ['not-assessed', 'requires-review', 'conceptually-resolved', 'professionally-verified'];
  var ACCESS_CLASSIFICATIONS = ['fully-accessible-single-storey', 'single-storey-step-free-candidate', 'ground-floor-accessible-living', 'potentially-adaptable', 'accessibility-not-required', 'unresolved-vertical-access', 'not-assessed'];
  var STAIR_TYPES = ['straight-run', 'dog-leg', 'spiral', 'alternating-tread', 'external', 'none'];
  var INTER_STOREY_FLOOR_M = 0.4;

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function isNum(v) { return typeof v === 'number' && Number.isFinite(v); }
  function round(v, d) { var f = Math.pow(10, d == null ? 3 : d); return Math.round(v * f) / f; }
  function oneOf(list, v) { return list.indexOf(v) >= 0; }

  function moduleDefaults(type) {
    var t = MODULE_TYPES[type] || MODULE_TYPES['40ft'];
    return { length_m: t.length_m, width_m: t.width_m, height_m: t.height_m };
  }

  function newId(prefix, existing) {
    var n = 1;
    var set = {};
    (existing || []).forEach(function (x) { set[x] = true; });
    while (set[prefix + n]) n++;
    return prefix + n;
  }

  function requiredIds(design) {
    var ids = [];
    (design.modules || []).forEach(function (m) {
      ids.push(m.id);
      (m.openings || []).forEach(function (o) { ids.push(o.id); });
      (m.zones || []).forEach(function (z) { ids.push(z.id); });
    });
    (design.porches || []).forEach(function (p) { ids.push(p.id); });
    (design.decks || []).forEach(function (d) { ids.push(d.id); });
    (design.trellises || []).forEach(function (t) { ids.push(t.id); });
    (design.vegetation || []).forEach(function (v) { ids.push(v.id); });
    (design.connections || []).forEach(function (c) { ids.push(c.id); });
    return ids;
  }

  function hasProfessionalAssessment(review) {
    var a = review && review.assessment;
    return !!(a && typeof a.reviewer === 'string' && a.reviewer.length > 1 &&
      typeof a.organisation === 'string' && a.organisation.length > 1 &&
      typeof a.date === 'string' && a.date.length >= 4 &&
      typeof a.document === 'string' && a.document.length > 1 &&
      typeof a.scope === 'string' && a.scope.length > 1);
  }

  function defaultSupport(storey) {
    return {
      type: storey === 0 ? 'ground' : 'not-assessed',
      references: [],
      verified: false,
      note: storey === 0 ? 'Bears on the foundation; foundation design still needs geotechnical and structural review.' : 'Support intent not yet recorded. A module directly above another is not automatically supported.'
    };
  }

  function defaultAccess(storeys) {
    return {
      step_free_entrance: false,
      entrance_door_width_m: 0.9,
      entrance_threshold_m: 0,
      ground_floor_essential_functions: storeys === 1,
      ground_floor_bedroom: storeys === 1,
      ground_floor_bathroom: true,
      adaptable_bathroom: false,
      adaptable_kitchen: false,
      circulation_width_m: 0.9,
      path_connection: 'Not assessed against the shared hamlet path network.',
      vertical_access_strategy: storeys > 1 ? 'Stair intent not yet recorded.' : 'Single occupied storey; no internal stair required.',
      stair: {
        present: false,
        type: 'none',
        module: '',
        location: 'not recorded',
        width_m: 0,
        run_m: 0,
        rise_m: 0,
        landing: false,
        lift_reserve: false,
        note: 'No stair recorded.'
      },
      classification: 'not-assessed',
      standards: 'Project targets informed by the Ontario Building Code and CSA B651. No code compliance, licence or professional accessibility review is claimed.',
      assessment: 'not-assessed'
    };
  }

  function defaultRoofForm() {
    return {
      type: 'flat',
      pitch_deg: 0,
      overhang_m: 0.6,
      solar_side: 'south',
      green_roof: false,
      drainage: 'Drainage strategy not resolved; ponding, outlets, overflow and snow accumulation need review.',
      snow: 'Snow accumulation, drift and sliding need structural review.',
      wind: 'Wind uplift at eaves, corners and overhangs needs review.',
      maintenance: 'Maintenance access not resolved.',
      note: 'Roof geometry is conceptual and independent of the container geometry. It does not create an occupied storey.'
    };
  }

  function defaultReview() {
    return {
      structural: 'not-assessed',
      accessibility: 'not-assessed',
      energy: 'not-assessed',
      fire: 'not-assessed',
      concerns: {},
      notes: 'Conceptual review status only. Automatic generation never assigns professionally verified.'
    };
  }

  function normalizeRoofForm(input) {
    var r = Object.assign(defaultRoofForm(), input || {});
    if (r.type === 'south-shed' || r.type === 'north-shed') r.type = 'shed';
    if (ROOF_FORMS.indexOf(r.type) < 0) r.type = 'flat';
    r.pitch_deg = isNum(r.pitch_deg) ? r.pitch_deg : (r.type === 'flat' || r.type === 'canopy' || r.type === 'green' ? 0 : 10);
    r.overhang_m = isNum(r.overhang_m) ? r.overhang_m : 0.6;
    r.solar_side = r.solar_side === 'north' ? 'south' : (r.solar_side || 'south');
    r.green_roof = !!r.green_roof;
    return r;
  }

  function canonicalize(input) {
    var d = clone(input || {});
    d.schema = SCHEMA;
    d.modules = Array.isArray(d.modules) ? d.modules : [];
    d.connections = Array.isArray(d.connections) ? d.connections : [];
    d.porches = Array.isArray(d.porches) ? d.porches : [];
    d.decks = Array.isArray(d.decks) ? d.decks : [];
    d.trellises = Array.isArray(d.trellises) ? d.trellises : [];
    d.material_intent = Object.assign({ reclaimed_containers: true, reused_timber: true, replaceable_cladding: true, continuous_external_insulation: true, selective_spray_foam: false, reversible_connections: true, modular_porch: true, solar_ready: true, green_roof_investigated: false }, d.material_intent || {});
    d.thermal = Object.assign({ wall_insulation_strategy: 'continuous external insulation with thermal breaks at openings, pile caps and service penetrations',
      thermal_bridge_mitigation: 'continuous external insulation and thermal breaks at openings and pile caps', roof_insulation_mm: 250, floor_insulation_mm: 200, rainscreen_ventilation: true, air_vapour_control: 'exterior-insulated, vapour-open assembly; sealed interior air barrier (to be detailed)', window_performance: 'triple glazed, low-e, argon, thermally broken frames', external_shading: 'fixed overhang and deciduous planting', heat_recovery_ventilation: true, heating: 'cold-climate air-source heat pump', notes: 'Conceptual thermal intent only. No energy or code calculation.' }, d.thermal || {});
    d.envelope = Object.assign({ version: '1.0', assembly: 'mineral-wool', layers: [
      { material: 'steel container wall', thickness_mm: 3, role: 'structure' },
      { material: 'air and vapour control layer', thickness_mm: 1, role: 'air/vapour' },
      { material: 'mineral wool', thickness_mm: 150, role: 'insulation' },
      { material: 'continuous thermal break / insulation', thickness_mm: 10, role: 'thermal break' },
      { material: 'ventilated drained cavity', thickness_mm: 25, role: 'rainscreen' },
      { material: 'timber cladding', thickness_mm: 20, role: 'cladding' }
    ], thermal_breaks: 'continuous external insulation with thermal washers and stainless fasteners; breaks at openings, pile caps and service penetrations', rainscreen: { ventilated: true, cavity_mm: 25, drained: true }, air_vapour_control: 'exterior-insulated, vapour-open assembly with a sealed interior air barrier; joints and service penetrations to be detailed', fire: 'combustible insulation, cladding and cavity need a fire review; cavity barriers, cladding classification and separation are not resolved', fastening: 'long fasteners pass through the insulation into the steel frame; pull-out, corrosion, thermal bridging and water shedding need engineering review', penetrations: 'openings, cladding rails, planter brackets and service penetrations need structural and waterproofing review', maintenance: 'inspect cladding, sealant, cavity, fasteners and vegetation twice a year and after severe weather', notes: 'Conceptual assembly only. Not code-compliant or moisture-safe until reviewed by a building-envelope engineer.' }, d.envelope || {});
    d.envelope.rainscreen = Object.assign({ ventilated: true, cavity_mm: 25, drained: true }, d.envelope.rainscreen || {});
    d.envelope.layers = Array.isArray(d.envelope.layers) ? d.envelope.layers : [];
    d.vegetation = Array.isArray(d.vegetation) ? d.vegetation : [];
    d.vegetation.forEach(function (v) { v.offset_m = isNum(v.offset_m) ? v.offset_m : 0.5; v.separation_m = isNum(v.separation_m) ? v.separation_m : v.offset_m; v.height_m = isNum(v.height_m) ? v.height_m : 2.5; v.length_m = isNum(v.length_m) ? v.length_m : 2; v.start_m = isNum(v.start_m) ? v.start_m : 0; });
    d.foundation = Object.assign({ system: 'helical-piles', type: 'Engineered helical piles with adjustable brackets', clearance_m: 0.6, no_compaction: true, independent_deck: true, frost_design: 'Engineered pile depth and uplift resistance below frost; geotechnical review required.', ground_disturbance: 'Point loads only; no slab, fill or grade change. Use matting and root protection during construction.', note: 'Elevated floor on engineered piles. Confirm soil, frost uplift, corrosion, lateral capacity and permits.' }, d.foundation || {});
    d.fire = Object.assign({ roof_class: 'A', noncombustible_eaves: true, ember_resistant_vents: true, tempered_glazing: true, noncombustible_deck: false, exterior_shutters: true, defensible_space_m: 10, water_access: false, note: 'Fire measures are design intentions, not a fire-resistance rating, WUI approval or insurance guarantee.' }, d.fire || {});
    d.entry_shelter = Object.assign({ enabled: false, side: 'north', width_m: 2.2, projection_m: 1.2, security_shutters: true, note: 'Reused container-door leaves can form a shelter and shutters; hinges, wind uplift, egress, fire and security need review.' }, d.entry_shelter || {});
    if (d.solar_array) d.solar_array = Object.assign({ enabled: false, tilt_deg: 39, azimuth_deg: 180, season_mode: 'year-round', side: 'south', mounting: 'tilted racks on a south roof slope', source: 'SolarCalculator.CA Ottawa', note: 'True south; review required.' }, d.solar_array);
    d.connections.forEach(function (c) { c.glazed = !!c.glazed; c.door_type = c.door_type || 'none'; c.glazing_area_m2 = isNum(c.glazing_area_m2) ? c.glazing_area_m2 : 0; });
    d.materials = Array.isArray(d.materials) ? d.materials : [];

    /* First pass: module identity and plan placement. */
    d.modules.forEach(function (m) {
      m.openings = Array.isArray(m.openings) ? m.openings : [];
      m.zones = Array.isArray(m.zones) ? m.zones : [];
      m.nominal = Object.assign(moduleDefaults(m.type), m.nominal || {});
      m.position_m = Array.isArray(m.position_m) ? m.position_m : [0, 0];
      m.rotation_deg = isNum(m.rotation_deg) ? m.rotation_deg : 0;
      m.storey = isNum(m.storey) ? Math.max(0, Math.round(m.storey)) : 0;
      m.insulation = Object.assign({ thickness_mm: 150, type: 'wood-fibre or documented reclaimed board' }, m.insulation || {});
      m.cladding = Object.assign({ type: 'timber', colour: '#8a6a4a' }, m.cladding || {});
      m.roof = Object.assign({ type: 'solar', solar: true, green: false }, m.roof || {});
      m.solar = Object.assign({ enabled: !!m.roof.solar, tilt_deg: 39, azimuth_deg: 180, season_mode: 'year-round', mounting: 'fixed tilt, due south; snow-shedding; roof structure and wind uplift need review', source: 'SolarCalculator.CA Ottawa: 39° optimal fixed tilt; brief range 36–39° year-round, winter ~60°, summer ~30°, due south.', note: 'True south; confirm magnetic declination, shading, snow shedding and structural fixing.' }, m.solar || {});
      m.structure = Object.assign({ openings_reinforced: true, wall_removal: 'none', cantilever_m: 0, notes: '' }, m.structure || {});
    });

    /* Second pass: elevation defaults. A storey-0 module sits on the
       foundation; an upper module defaults to the highest module below plus
       an inter-storey floor assembly. The value is then explicit. */
    d.modules.forEach(function (m) {
      if (isNum(m.elevation_m)) return;
      if (m.storey === 0) { m.elevation_m = Math.max(0, isNum(d.foundation.clearance_m) ? d.foundation.clearance_m : 0.6); return; }
      var below = d.modules.filter(function (x) { return x.storey < m.storey; });
      var top = below.reduce(function (t, x) { return Math.max(t, (isNum(x.elevation_m) ? x.elevation_m : 0) + x.nominal.height_m); }, 0);
      m.elevation_m = round((top || 2.896) + INTER_STOREY_FLOOR_M, 3);
    });

    d.modules.forEach(function (m) {
      var s = Object.assign(defaultSupport(m.storey), m.support || {});
      s.references = Array.isArray(s.references) ? s.references.filter(function (x) { return typeof x === 'string'; }) : [];
      s.verified = !!s.verified;
      m.support = s;
    });

    d.roof_form = normalizeRoofForm(d.roof_form);
    d.review = Object.assign(defaultReview(), d.review || {});
    d.review.concerns = Object.assign({}, d.review.concerns || {});
    d.access = Object.assign(defaultAccess(1), d.access || {});
    d.access.stair = Object.assign(defaultAccess(1).stair, d.access.stair || {});

    d.levels = levelsFor(d);
    d.maxOccupiedStoreys = Math.max(1, d.levels.length);
    d.site = Object.assign({ homesite: 'a', rotation_deg: 0, note: 'Illustrative placement only; not part of the published community layout.' }, d.site || {});
    d.architecture = Object.assign({ family: d.architecture && d.architecture.family || '', intent: d.architecture && d.architecture.intent || '' }, d.architecture || {});
    d.provenance = Object.assign({ authors: 'Containers Hamlet contributors', created: '2026', revision: '2.0.0', method: 'Design Lab concept geometry; not verified.', verification: 'None.' }, d.provenance || {});
    d.licence = Object.assign({ code: 'AGPL-3.0-or-later', content: 'CC BY-SA 4.0' }, d.licence || {});
    d.authorship = Object.assign({ name: 'Containers Hamlet contributors', tool: 'Containers Hamlet Design Lab', version: '2.0.0' }, d.authorship || {});
    d.status = d.status || 'concept only; not reviewed; not for construction';
    d.professional_review_required = true;
    return d;
  }

  function levelsFor(d) {
    var seen = {};
    var levels = [];
    (d.modules || []).forEach(function (m) {
      var s = isNum(m.storey) ? m.storey : 0;
      if (!seen[s]) {
        seen[s] = { id: 'level-' + s, storey: s, name: s === 0 ? 'Ground floor' : s === 1 ? 'Upper floor' : 'Storey ' + s, elevation_m: isNum(m.elevation_m) ? m.elevation_m : 0, moduleIds: [] };
        levels.push(seen[s]);
      }
      seen[s].moduleIds.push(m.id);
      seen[s].elevation_m = Math.min(seen[s].elevation_m, isNum(m.elevation_m) ? m.elevation_m : 0);
    });
    levels.sort(function (a, b) { return a.storey - b.storey; });
    levels.forEach(function (l) {
      var tops = (d.modules || []).filter(function (m) { return m.storey === l.storey; }).map(function (m) { return (isNum(m.elevation_m) ? m.elevation_m : 0) + (m.nominal ? m.nominal.height_m : 0); });
      l.top_m = tops.length ? Math.max.apply(null, tops) : l.elevation_m;
      l.split_elevations = (d.modules || []).filter(function (m) { return m.storey === l.storey; }).some(function (m) { return Math.abs((m.elevation_m || 0) - l.elevation_m) > 0.01; });
    });
    return levels;
  }

  function validateSchema(input) {
    var d = clone(input || {});
    var errors = [];
    var warnings = [];
    var err = function (m) { errors.push({ code: 'schema', message: m }); };
    if (d.schema !== SCHEMA) err('Expected schema ' + SCHEMA + '. Use an explicit migration for older files.');
    if (!Array.isArray(d.modules) || d.modules.length < 1 || d.modules.length > 3) err('A design must have one to three container modules.');
    if (!Array.isArray(d.connections)) err('connections must be an array.');
    if (!Array.isArray(d.porches)) err('porches must be an array.');
    if (!Array.isArray(d.decks)) err('decks must be an array.');
    if (!Array.isArray(d.trellises)) err('trellises must be an array.');
    if (!d.thermal || typeof d.thermal !== 'object') err('thermal must be an object.');
    if (d.thermal) {
      if (!isNum(d.thermal.roof_insulation_mm) || d.thermal.roof_insulation_mm < 50 || d.thermal.roof_insulation_mm > 600) err('Roof insulation must be 50–600 mm.');
      if (!isNum(d.thermal.floor_insulation_mm) || d.thermal.floor_insulation_mm < 50 || d.thermal.floor_insulation_mm > 500) err('Floor insulation must be 50–500 mm.');
      if (typeof d.thermal.air_vapour_control !== 'string' || d.thermal.air_vapour_control.length < 4) err('Air and vapour control strategy is required.');
      if (typeof d.thermal.window_performance !== 'string' || d.thermal.window_performance.length < 4) err('Window performance description is required.');
      if (typeof d.thermal.external_shading !== 'string' || d.thermal.external_shading.length < 3) err('External shading description is required.');
      if (typeof d.thermal.heating !== 'string' || d.thermal.heating.length < 3) err('Heating description is required.');
    }
    if (!d.envelope || typeof d.envelope !== 'object') err('envelope must be an object.');
    if (d.envelope) {
      if (d.envelope.version !== '1.0') err('Envelope version must be 1.0.');
      if (ENVELOPE_ASSEMBLIES.indexOf(d.envelope.assembly) < 0) err('Unknown envelope assembly.');
      if (!Array.isArray(d.envelope.layers) || d.envelope.layers.length < 3) err('Envelope layers must be an array of at least three layers.');
      (d.envelope.layers || []).forEach(function (l) {
        if (!l.material || !l.role || !isNum(l.thickness_mm) || l.thickness_mm <= 0) err('An envelope layer needs material, role and positive thickness.');
      });
      if (!d.envelope.rainscreen || typeof d.envelope.rainscreen.ventilated !== 'boolean') err('Envelope rainscreen configuration is required.');
    }
    if (!Array.isArray(d.vegetation)) err('vegetation must be an array.');
    (d.vegetation || []).forEach(function (v) {
      if (!v.id) err('A vegetation component has no id.');
      if (VEGETATION_TYPES.indexOf(v.type) < 0) err('Vegetation ' + v.id + ' has an unknown type.');
      if (!(d.modules || []).some(function (m) { return m.id === v.module; })) err('Vegetation ' + v.id + ' references an unknown module.');
      if (FACES.indexOf(v.face) < 0) err('Vegetation ' + v.id + ' has an unknown face.');
      if (![v.start_m, v.length_m, v.height_m, v.offset_m].every(isNum) || v.length_m <= 0 || v.height_m <= 0 || v.offset_m < 0.3) err('Vegetation ' + v.id + ' has invalid dimensions or separation.');
      ['plant_type', 'mature_height_m', 'seasonal_foliage', 'irrigation', 'maintenance', 'support'].forEach(function (k) { if (v[k] === undefined || v[k] === '') err('Vegetation ' + v.id + ' is missing ' + k + '.'); });
    });
    if (!d.foundation || typeof d.foundation !== 'object') err('foundation must be an object.');
    if (d.foundation) {
      if (FOUNDATION_SYSTEMS.indexOf(d.foundation.system) < 0) err('Unknown foundation system.');
      if (!isNum(d.foundation.clearance_m) || d.foundation.clearance_m < 0 || d.foundation.clearance_m > 2) err('Foundation clearance must be 0–2 m.');
      if (typeof d.foundation.no_compaction !== 'boolean') err('Foundation no-compaction flag is required.');
      if (typeof d.foundation.independent_deck !== 'boolean') err('Foundation independent-deck flag is required.');
    }
    if (d.fire) {
      if (['A','B','C'].indexOf(d.fire.roof_class) < 0) err('fire.roof_class must be A, B or C.');
      ['noncombustible_eaves','ember_resistant_vents','tempered_glazing','noncombustible_deck','exterior_shutters','water_access'].forEach(function (k) { if (typeof d.fire[k] !== 'boolean') err('fire.' + k + ' must be boolean.'); });
      if (!isNum(d.fire.defensible_space_m) || d.fire.defensible_space_m < 0 || d.fire.defensible_space_m > 100) err('fire.defensible_space_m must be 0–100 m.');
    }
    if (d.entry_shelter) {
      if (typeof d.entry_shelter.enabled !== 'boolean') err('entry_shelter.enabled must be boolean.');
      if (['north','south','east','west'].indexOf(d.entry_shelter.side) < 0) err('entry_shelter.side must be north, south, east or west.');
      if (!isNum(d.entry_shelter.width_m) || d.entry_shelter.width_m < 0.8 || d.entry_shelter.width_m > 4) err('entry_shelter.width_m must be 0.8–4 m.');
      if (!isNum(d.entry_shelter.projection_m) || d.entry_shelter.projection_m < 0.4 || d.entry_shelter.projection_m > 2.5) err('entry_shelter.projection_m must be 0.4–2.5 m.');
      if (typeof d.entry_shelter.security_shutters !== 'boolean') err('entry_shelter.security_shutters must be boolean.');
    }
    if (d.solar_array) {
      if (typeof d.solar_array.enabled !== 'boolean' || d.solar_array.side !== 'south') err('solar_array must be a south-side array with an enabled flag.');
      if (!isNum(d.solar_array.tilt_deg) || d.solar_array.tilt_deg < 0 || d.solar_array.tilt_deg > 75) err('solar_array tilt must be 0–75 degrees.');
      if (!isNum(d.solar_array.azimuth_deg) || d.solar_array.azimuth_deg < 0 || d.solar_array.azimuth_deg > 360) err('solar_array azimuth must be 0–360 degrees.');
    }
    if (d.roof_form) {
      if (ROOF_FORMS.indexOf(d.roof_form.type) < 0) err('Roof form must be one of: ' + ROOF_FORMS.join(', ') + '.');
      if (!isNum(d.roof_form.pitch_deg) || d.roof_form.pitch_deg < 0 || d.roof_form.pitch_deg > 45) err('Roof pitch must be 0–45 degrees.');
      if (d.roof_form.solar_side !== 'south') err('Roof solar must be on the south side.');
      if (d.roof_form.green_roof !== undefined && typeof d.roof_form.green_roof !== 'boolean') err('roof_form.green_roof must be boolean.');
    }
    if (!d.review || typeof d.review !== 'object') err('A review register is required.');
    if (d.review) {
      ['structural','accessibility','energy','fire'].forEach(function (k) {
        if (REVIEW_STATUSES.indexOf(d.review[k]) < 0) err('review.' + k + ' must be one of: ' + REVIEW_STATUSES.join(', ') + '.');
        if (d.review[k] === 'professionally-verified' && !hasProfessionalAssessment(d.review)) err('review.' + k + ' claims professional verification without a documented, attributable assessment.');
      });
      Object.keys(d.review.concerns || {}).forEach(function (k) {
        var c = d.review.concerns[k];
        if (!c || REVIEW_STATUSES.indexOf(c.status) < 0) err('review.concerns.' + k + ' has an invalid status.');
        if (c && c.status === 'professionally-verified' && !hasProfessionalAssessment(c)) err('review.concerns.' + k + ' claims professional verification without a documented, attributable assessment.');
      });
    }
    if (d.access) {
      ['step_free_entrance','ground_floor_essential_functions','ground_floor_bedroom','ground_floor_bathroom','adaptable_bathroom','adaptable_kitchen'].forEach(function (k) { if (typeof d.access[k] !== 'boolean') err('access.' + k + ' must be boolean.'); });
      if (!isNum(d.access.entrance_door_width_m) || d.access.entrance_door_width_m < 0.6 || d.access.entrance_door_width_m > 3) err('access.entrance_door_width_m must be 0.6–3 m.');
      if (!isNum(d.access.entrance_threshold_m) || d.access.entrance_threshold_m < 0 || d.access.entrance_threshold_m > 0.5) err('access.entrance_threshold_m must be 0–0.5 m.');
      if (!isNum(d.access.circulation_width_m) || d.access.circulation_width_m < 0.6 || d.access.circulation_width_m > 4) err('access.circulation_width_m must be 0.6–4 m.');
      if (ACCESS_CLASSIFICATIONS.indexOf(d.access.classification) < 0) err('access.classification is invalid.');
      if (!d.access.stair || STAIR_TYPES.indexOf(d.access.stair.type) < 0) err('access.stair.type is invalid.');
      if (typeof d.access.stair.present !== 'boolean') err('access.stair.present must be boolean.');
    } else err('An accessibility record is required.');
    if (!Array.isArray(d.levels) || d.levels.length < 1) err('levels must be an explicit array.');
    if (isNum(d.maxOccupiedStoreys) && d.maxOccupiedStoreys > MAX_OCCUPIED_STOREYS) err('A residence may not exceed two occupied storeys.');
    if (!d.provenance || !d.licence) warnings.push({ code: 'provenance', message: 'Provenance or licence metadata is missing; it will be added on export.' });
    var ids = requiredIds(d);
    var dup = ids.filter(function (id, i) { return ids.indexOf(id) !== i; });
    if (dup.length) err('Duplicate ids: ' + dup.join(', '));
    var storeys = {};
    (d.modules || []).forEach(function (m, i) {
      if (!m.id) err('Module ' + (i + 1) + ' has no stable id.');
      if (!MODULE_TYPES[m.type]) err('Module ' + m.id + ' has unknown type ' + m.type + '.');
      if (!Array.isArray(m.position_m) || m.position_m.length !== 2 || !m.position_m.every(isNum)) err('Module ' + m.id + ' needs a two-number position_m.');
      if (!isNum(m.rotation_deg) || Math.abs(m.rotation_deg) > 360) err('Module ' + m.id + ' needs a numeric rotation_deg between -360 and 360.');
      if (!m.nominal || !isNum(m.nominal.length_m) || !isNum(m.nominal.width_m) || !isNum(m.nominal.height_m)) err('Module ' + m.id + ' needs nominal length, width and height.');
      if (m.nominal && MODULE_TYPES[m.type]) {
        var t = MODULE_TYPES[m.type];
        if (Math.abs(m.nominal.length_m - t.length_m) > 0.01 || Math.abs(m.nominal.width_m - t.width_m) > 0.01) err('Module ' + m.id + ' nominal dimensions do not match its type.');
      }
      if (!isNum(m.storey) || m.storey < 0 || Math.round(m.storey) !== m.storey) err('Module ' + m.id + ' needs an integer storey of 0 or 1.');
      if (isNum(m.storey) && m.storey >= MAX_OCCUPIED_STOREYS) err('Module ' + m.id + ' is on storey ' + m.storey + '; a residence may not exceed two occupied storeys.');
      if (!isNum(m.elevation_m) || m.elevation_m < 0 || m.elevation_m > 8) err('Module ' + m.id + ' needs an explicit elevation_m between 0 and 8 m.');
      if (isNum(m.storey)) storeys[m.storey] = true;
      if (!m.support || SUPPORT_TYPES.indexOf(m.support.type) < 0) err('Module ' + m.id + ' needs a known support type.');
      if (m.support) {
        if (!Array.isArray(m.support.references)) err('Module ' + m.id + ' support.references must be an array.');
        (m.support.references || []).forEach(function (ref) {
          if (ref === m.id) err('Module ' + m.id + ' cannot support itself.');
          var other = (d.modules || []).filter(function (x) { return x.id === ref; })[0];
          if (!other) err('Module ' + m.id + ' references unknown supporter ' + ref + '.');
          else if (isNum(other.storey) && isNum(m.storey) && other.storey >= m.storey) err('Module ' + m.id + ' cannot be supported by ' + ref + ' on the same or a higher storey.');
        });
        if (typeof m.support.verified !== 'boolean') err('Module ' + m.id + ' support.verified must be boolean.');
        if (m.support.verified && !hasProfessionalAssessment(m.support)) err('Module ' + m.id + ' claims verified support without a documented, attributable professional assessment.');
      }
      if (!m.insulation || !isNum(m.insulation.thickness_mm) || m.insulation.thickness_mm < 50 || m.insulation.thickness_mm > 300) err('Module ' + m.id + ' insulation must be 50–300 mm.');
      if (!m.cladding || CLADDING.indexOf(m.cladding.type) < 0) err('Module ' + m.id + ' needs a known cladding type.');
      if (!m.roof || ROOFS.indexOf(m.roof.type) < 0) err('Module ' + m.id + ' needs a known roof type.');
      if (!m.solar || typeof m.solar !== 'object') err('Module ' + m.id + ' needs a solar configuration object.');
      if (m.solar) {
        if (!isNum(m.solar.tilt_deg) || m.solar.tilt_deg < 0 || m.solar.tilt_deg > 75) err('Module ' + m.id + ' solar tilt must be 0–75 degrees.');
        if (!isNum(m.solar.azimuth_deg) || m.solar.azimuth_deg < 0 || m.solar.azimuth_deg > 360) err('Module ' + m.id + ' solar azimuth must be 0–360 degrees.');
        if (SOLAR_SEASONS.indexOf(m.solar.season_mode) < 0) err('Module ' + m.id + ' solar season must be year-round, winter or summer.');
        if (m.solar.enabled && !m.roof.solar) warnings.push({ code: 'solar-roof', message: 'Module ' + m.id + ' has solar enabled but no solar roof type.' });
      }
      if (!Array.isArray(m.openings)) err('Module ' + m.id + ' openings must be an array.');
      (m.openings || []).forEach(function (o) {
        if (!o.id) err('An opening on ' + m.id + ' has no id.');
        if (FACES.indexOf(o.face) < 0) err('Opening ' + o.id + ' has an unknown face.');
        if (OPENING_TYPES.indexOf(o.type) < 0) err('Opening ' + o.id + ' has an unknown type.');
        if (![o.position_m, o.width_m, o.height_m, o.sill_m].every(isNum)) err('Opening ' + o.id + ' needs numeric position, width, height and sill.');
        if (o.width_m <= 0 || o.height_m <= 0) err('Opening ' + o.id + ' has a non-positive size.');
        if (o.sill_m < 0) err('Opening ' + o.id + ' has a negative sill.');
      });
      (m.zones || []).forEach(function (z) {
        if (!z.id) err('A zone on ' + m.id + ' has no id.');
        if (ZONE_TYPES.indexOf(z.type) < 0) err('Zone ' + z.id + ' has an unknown type.');
        if (!isNum(z.start_m) || !isNum(z.end_m) || z.end_m <= z.start_m) err('Zone ' + z.id + ' needs a positive start/end range.');
      });
    });
    var storeyCount = Object.keys(storeys).length;
    if (storeyCount > MAX_OCCUPIED_STOREYS) err('A residence may have at most two occupied storeys.');
    (d.levels || []).forEach(function (l) {
      if (!l.id || !isNum(l.storey) || !isNum(l.elevation_m)) err('Every level needs an id, storey and elevation_m.');
      if (l.storey >= MAX_OCCUPIED_STOREYS) err('Level ' + l.id + ' exceeds the two-storey limit.');
    });
    (d.porches || []).forEach(function (p) {
      if (!p.id) err('A porch has no id.');
      if (!(d.modules || []).some(function (m) { return m.id === p.module; })) err('Porch ' + p.id + ' references an unknown module.');
      if (FACES.indexOf(p.face) < 0) err('Porch ' + p.id + ' has an unknown face.');
      if (![p.start_m, p.length_m, p.depth_m].every(isNum) || p.length_m <= 0 || p.depth_m < 0) err('Porch ' + p.id + ' has invalid dimensions.');
    });
    (d.decks || []).forEach(function (dk) {
      if (!(d.porches || []).some(function (p) { return p.id === dk.porch; })) err('Deck ' + dk.id + ' references an unknown porch.');
      if (!isNum(dk.projection_m) || dk.projection_m < 0) err('Deck ' + dk.id + ' has an invalid projection.');
    });
    (d.trellises || []).forEach(function (t) {
      if (!t.id) err('A trellis has no id.');
      if (!(d.modules || []).some(function (m) { return m.id === t.module; })) err('Trellis ' + t.id + ' references an unknown module.');
      if (FACES.indexOf(t.face) < 0) err('Trellis ' + t.id + ' has an unknown face.');
      if (![t.start_m, t.length_m, t.offset_m, t.height_m].every(isNum) || t.length_m <= 0 || t.height_m <= 0 || t.offset_m < 0) err('Trellis ' + t.id + ' has invalid dimensions.');
    });
    (d.connections || []).forEach(function (c) {
      if (!(d.modules || []).some(function (m) { return m.id === c.from; }) || !(d.modules || []).some(function (m) { return m.id === c.to; })) err('Connection ' + c.id + ' references an unknown module.');
      if (!Array.isArray(c.position_m) || c.position_m.length !== 2 || !c.position_m.every(isNum)) err('Connection ' + c.id + ' needs a position.');
      if (![c.length_m, c.width_m].every(isNum) || c.length_m <= 0 || c.width_m <= 0) err('Connection ' + c.id + ' has invalid dimensions.');
      if (c.door_type && ['none','insulated-sliding','folding','garage'].indexOf(c.door_type) < 0) err('Connection ' + c.id + ' has an unknown door type.');
      if (!isNum(c.glazing_area_m2) || c.glazing_area_m2 < 0) err('Connection ' + c.id + ' has an invalid glazing area.');
    });
    if (d.water !== undefined && d.water !== null) {
      if (!d.water || d.water.schema !== 'containers-hamlet-water/v1') err('water.schema must be containers-hamlet-water/v1.');
      if (d.water) {
        if (['conceptual', 'designed', 'verified', 'not-assessed'].indexOf(d.water.status) < 0) err('water.status must be conceptual, designed, verified or not-assessed.');
        if (!d.water.treatment || typeof d.water.treatment.potable !== 'boolean') err('water.treatment.potable must be an explicit boolean.');
        if (!d.water.fireReserve || d.water.fireReserve.separate !== true) err('water.fireReserve.separate must be true; a daily rain barrel cannot be the fire reserve.');
        if (d.water.storage && d.water.storage.volume_L !== null && (!Number.isFinite(d.water.storage.volume_L) || d.water.storage.volume_L <= 0)) err('water.storage.volume_L must be null or a positive number.');
      }
    }
    if (d.interior !== undefined && d.interior !== null) {
      if (!d.interior || d.interior.schema !== 'containers-hamlet-interior/v1') err('interior.schema must be containers-hamlet-interior/v1.');
      if (d.interior) {
        if (!Array.isArray(d.interior.rooms)) err('interior.rooms must be an array.');
        if (!Array.isArray(d.interior.partitions)) err('interior.partitions must be an array.');
        if (!Array.isArray(d.interior.doors)) err('interior.doors must be an array.');
        if (!Array.isArray(d.interior.fixtures)) err('interior.fixtures must be an array.');
        if (!Array.isArray(d.interior.clearances)) err('interior.clearances must be an array.');
        if (d.interior.status !== 'authored' && d.interior.status !== 'provisional') err('interior.status must be authored or provisional.');
        (d.interior.rooms || []).forEach(function (r) {
          if (!r.id || !r.module || !Array.isArray(r.polygon) || r.polygon.length < 3) err('Interior room needs id, module and a polygon with at least three points.');
          if (!(d.modules || []).some(function (m) { return m.id === r.module; })) err('Interior room ' + r.id + ' references an unknown module.');
        });
      }
    }
    return {
      ok: errors.length === 0,
      errors: errors,
      warnings: warnings,
      unknownKeys: Object.keys(d).filter(function (k) {
        return ['schema','id','name','group','editable','visual_seed','tagline','description','primary_view_deg','modules','connections','porches','decks','foundation','features','materials','provenance','licence','authorship','status','units','professional_review_required','site','assessment','trellises','material_intent','thermal','envelope','vegetation','roof_form','solar_array','entry_shelter','paint','fire','levels','maxOccupiedStoreys','support','review','access','architecture','storeys','role','interior','formerName'].indexOf(k) < 0;
      })
    };
  }

  /* Migrate the Design Lab v1.0 design (no vertical geometry) to v2.0.
     Nothing is dropped silently: the report lists what changed and what
     could not be inferred. */
  function migrateV1(old) {
    if (!old || old.schema !== SCHEMA_V1) throw new Error('Not a ' + SCHEMA_V1 + ' design.');
    var d = clone(old);
    d.schema = SCHEMA;
    (d.modules || []).forEach(function (m) {
      m.storey = 0;
      m.elevation_m = isNum(d.foundation && d.foundation.clearance_m) ? d.foundation.clearance_m : 0.6;
      m.support = { type: 'ground', references: [], verified: false, note: 'Migrated as a ground-level module. Support and foundation capacity were not recorded in v1.0.' };
    });
    d.roof_form = normalizeRoofForm(d.roof_form);
    d.review = defaultReview();
    d.access = defaultAccess(1);
    d.access.vertical_access_strategy = 'Single occupied storey in the migrated design. Vertical access was not recorded.';
    var migrated = canonicalize(d);
    var report = {
      ok: true,
      from: SCHEMA_V1,
      to: SCHEMA,
      preserved: ['all v1 module geometry', 'openings', 'zones', 'porches', 'decks', 'connections', 'trellises', 'vegetation', 'thermal and envelope data', 'foundation', 'fire data', 'provenance'],
      inferred: ['Every module is placed on storey 0 at the recorded foundation clearance.', 'Support is recorded as a ground-bearing design intent, not a verified load path.', 'A structural review register and accessibility record are added with not-assessed defaults.', 'Roof form geometry is normalised.'],
      unmapped: ['No v1 field was dropped.', 'Vertical geometry, storey assignment and professional review evidence did not exist in v1.0 and cannot be invented.'],
      warnings: ['Migrated designs are single-storey concepts. Any later stacking must add elevations, support intent and a structural review.']
    };
    return { design: migrated, report: report };
  }

  /* Migrate the supplied prototype's v0.1 JSON. */
  function migrateV01(old) {
    if (!old || old.schema !== LEGACY_SCHEMA) throw new Error('Not a containers-hamlet-editor/v0.1 design.');
    var preset = old.preset === 'studio' ? 'studio' : old.preset === 'pair' ? 'pair' : 'retreat';
    var type = preset === 'studio' ? '20ft' : '40ft';
    var dims = MODULE_TYPES[type];
    var count = preset === 'pair' ? 2 : 1;
    var modules = [];
    for (var i = 0; i < count; i++) {
      modules.push({
        id: 'm' + (i + 1),
        type: type,
        nominal: { length_m: dims.length_m, width_m: dims.width_m, height_m: dims.height_m },
        position_m: [0, i * dims.width_m],
        rotation_deg: 0,
        storey: 0,
        elevation_m: 0.6,
        support: { type: 'ground', references: [], verified: false, note: 'Migrated from v0.1; foundation and support were not recorded.' },
        insulation: { thickness_mm: Number(old.envelope && old.envelope.external_insulation_mm) || 150, type: 'migrated from v0.1 (type not recorded)' },
        cladding: { type: old.envelope && old.envelope.cladding || 'timber', colour: '#8a6a4a' },
        roof: { type: old.envelope && old.envelope.roof === 'biosolar' ? 'solar' : (old.envelope && old.envelope.roof || 'solar'), solar: (old.envelope && old.envelope.roof) !== 'green', green: (old.envelope && old.envelope.roof) === 'green' },
        structure: { openings_reinforced: true, wall_removal: 'none', cantilever_m: 0, notes: 'Migrated from v0.1; no structural assessment was present.' },
        openings: i === 0 ? (old.openings || []).map(function (o) {
          return { id: o.id || 'opening', face: o.face || 'south', type: 'window', position_m: Number(o.position_m), width_m: Number(o.width_m), height_m: 1.4, sill_m: 0.9, name: (o.id || 'Window') + ' (migrated)' };
        }) : [],
        zones: []
      });
    }
    var porch = old.porch || {};
    var design = canonicalize({
      schema: SCHEMA,
      id: (old.preset || 'migrated') + '-migrated',
      name: String(old.name || 'Migrated design').slice(0, 80),
      modules: modules,
      connections: [],
      porches: porch.length_m > 0 ? [{ id: 'p1', module: count === 2 ? 'm2' : 'm1', face: 'south', start_m: Number(porch.start_m) || 0, length_m: Number(porch.length_m) || 0, depth_m: Number(porch.depth_m) || 0, screened: !!porch.screened, roof: true, note: 'Migrated from v0.1. The porch is placed on the outer module of a migrated pair.' }] : [],
      decks: [],
      site: { homesite: 'a', rotation_deg: 0, note: 'Migrated design; placement is illustrative only.' },
      review: defaultReview(),
      access: defaultAccess(1),
      provenance: {
        authors: 'Containers Hamlet contributors', created: '2026', revision: '2.0.0',
        method: 'Migrated from the supplied containers-hamlet-editor/v0.1 prototype.',
        verification: 'None.',
        migration: {
          source_schema: LEGACY_SCHEMA,
          source_preset: old.preset || 'retreat',
          unmapped: ['interior zones (v0.1 did not model them)', 'decks', 'fixtures', 'visible interior descriptions', 'storeys and elevations (v0.1 had no vertical geometry)', 'structural and accessibility review evidence'],
          notes: ['Two-container v0.1 designs are migrated as adjacent ground-level modules; the original simplified combined width is not retained as geometry.']
        }
      },
      licence: { code: 'AGPL-3.0-or-later', content: 'CC BY-SA 4.0' },
      status: old.status || 'concept only',
      professional_review_required: true
    });
    var report = {
      ok: true,
      from: LEGACY_SCHEMA,
      to: SCHEMA,
      preserved: ['name', 'preset', 'envelope.external_insulation_mm', 'envelope.cladding', 'envelope.roof', 'porch.depth_m', 'porch.start_m', 'porch.length_m', 'porch.screened', 'openings.id', 'openings.face', 'openings.position_m', 'openings.width_m', 'status', 'professional_review_required'],
      unmapped: ['interior zones were not present', 'window height and sill were not recorded; 1.4 m / 0.9 m are migration defaults', 'the v0.1 two-container combined width is not retained as separate geometry', 'storeys, elevations, support and review evidence did not exist in v0.1 and are not invented'],
      warnings: design.modules.length === 2 ? ['The v0.1 pair is now two explicit adjacent ground-level modules. Review the connection and shared wall.', 'The single v0.1 porch is placed on the outer module of the pair to avoid overlapping the other module.'] : []
    };
    return { design: design, report: report };
  }

  function migrateAny(old) {
    if (!old || typeof old !== 'object') throw new Error('Not a design object.');
    if (old.schema === SCHEMA) return { design: canonicalize(old), report: { ok: true, from: SCHEMA, to: SCHEMA, preserved: ['all current fields'], inferred: [], unmapped: [], warnings: [] } };
    if (old.schema === SCHEMA_V1) return migrateV1(old);
    if (old.schema === LEGACY_SCHEMA) return migrateV01(old);
    throw new Error('Unsupported schema. Use ' + SCHEMA + ', ' + SCHEMA_V1 + ' or ' + LEGACY_SCHEMA + '.');
  }

  function summary(design) {
    var d = canonicalize(design);
    var modules = d.modules;
    var nominal = modules.reduce(function (s, m) { return s + m.nominal.length_m * m.nominal.width_m; }, 0);
    var zones = modules.reduce(function (s, m) { return s + (m.zones || []).length; }, 0);
    var openings = modules.reduce(function (s, m) { return s + (m.openings || []).length; }, 0);
    var porch = d.porches.reduce(function (s, p) { return s + p.length_m * p.depth_m; }, 0);
    var storeys = d.levels.length;
    return {
      moduleCount: modules.length,
      storeyCount: storeys,
      maxStorey: storeys ? Math.max.apply(null, d.levels.map(function (l) { return l.storey; })) : 0,
      levels: d.levels,
      types: modules.map(function (m) { return m.type; }),
      nominalFootprint_m2: round(nominal, 1),
      grossFloorArea_m2: round(nominal + d.connections.filter(function (c) { return c.glazed; }).reduce(function (t, c) { return t + c.length_m * c.width_m; }, 0), 1),
      groundFloorArea_m2: round(modules.filter(function (m) { return m.storey === 0; }).reduce(function (s, m) { return s + m.nominal.length_m * m.nominal.width_m; }, 0), 1),
      upperFloorArea_m2: round(modules.filter(function (m) { return m.storey > 0; }).reduce(function (s, m) { return s + m.nominal.length_m * m.nominal.width_m; }, 0), 1),
      zoneCount: zones,
      openingCount: openings,
      screenedPorch_m2: round(porch, 1),
      greenRoof: modules.some(function (m) { return m.roof.green; }) || !!(d.roof_form && d.roof_form.green_roof),
      solar: modules.some(function (m) { return m.roof.solar; }) || !!(d.solar_array && d.solar_array.enabled),
      maxInsulation_mm: Math.max.apply(null, modules.map(function (m) { return m.insulation.thickness_mm; })),
      trellisCount: (d.trellises || []).length,
      vegetationCount: (d.vegetation || []).length
    };
  }

  return {
    SCHEMA: SCHEMA, SCHEMA_V1: SCHEMA_V1, LEGACY_SCHEMA: LEGACY_SCHEMA, MAX_OCCUPIED_STOREYS: MAX_OCCUPIED_STOREYS,
    MODULE_TYPES: MODULE_TYPES, FACES: FACES, OPENING_TYPES: OPENING_TYPES, ZONE_TYPES: ZONE_TYPES, CLADDING: CLADDING, ROOFS: ROOFS, ROOF_FORMS: ROOF_FORMS,
    ENVELOPE_ASSEMBLIES: ENVELOPE_ASSEMBLIES, VEGETATION_TYPES: VEGETATION_TYPES, SOLAR_SEASONS: SOLAR_SEASONS, FOUNDATION_SYSTEMS: FOUNDATION_SYSTEMS,
    SUPPORT_TYPES: SUPPORT_TYPES, REVIEW_STATUSES: REVIEW_STATUSES, ACCESS_CLASSIFICATIONS: ACCESS_CLASSIFICATIONS, STAIR_TYPES: STAIR_TYPES,
    INTER_STOREY_FLOOR_M: INTER_STOREY_FLOOR_M,
    clone: clone, canonicalize: canonicalize, validateSchema: validateSchema, migrateV1: migrateV1, migrateV01: migrateV01, migrateAny: migrateAny,
    summary: summary, moduleDefaults: moduleDefaults, newId: newId, requiredIds: requiredIds, round: round,
    hasProfessionalAssessment: hasProfessionalAssessment, defaultAccess: defaultAccess, defaultReview: defaultReview, defaultRoofForm: defaultRoofForm
  };
});
