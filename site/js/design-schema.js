/*
 * Containers Hamlet Design Lab schema and migration.
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

  var SCHEMA = 'containers-hamlet-design/v1.0';
  var LEGACY_SCHEMA = 'containers-hamlet-editor/v0.1';
  var MODULE_TYPES = {
    '20ft': { length_m: 6.058, width_m: 2.438, height_m: 2.896 },
    '40ft': { length_m: 12.192, width_m: 2.438, height_m: 2.896 }
  };
  var FACES = ['north', 'south', 'east', 'west'];
  var OPENING_TYPES = ['window', 'door', 'sliding-door', 'opening'];
  var ZONE_TYPES = ['sleeping', 'bathroom', 'kitchen', 'living', 'dining', 'work', 'storage', 'circulation'];
  var CLADDING = ['timber', 'metal', 'mixed'];
  var ROOFS = ['solar', 'green', 'biosolar', 'membrane'];
  var ENVELOPE_ASSEMBLIES = ['rigid-board', 'mineral-wool', 'wood-fibre', 'spray-foam', 'hybrid'];
  var VEGETATION_TYPES = ['trellis', 'living-wall', 'edible-wall', 'privacy-screen'];

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function isNum(v) { return typeof v === 'number' && Number.isFinite(v); }
  function round(v, d) { var f = Math.pow(10, d == null ? 3 : d); return Math.round(v * f) / f; }

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
    d.connections.forEach(function (c) { c.glazed = !!c.glazed; c.door_type = c.door_type || 'none'; c.glazing_area_m2 = isNum(c.glazing_area_m2) ? c.glazing_area_m2 : 0; });
    d.materials = Array.isArray(d.materials) ? d.materials : [];
    d.modules.forEach(function (m) {
      m.openings = Array.isArray(m.openings) ? m.openings : [];
      m.zones = Array.isArray(m.zones) ? m.zones : [];
      m.nominal = Object.assign(moduleDefaults(m.type), m.nominal || {});
      m.position_m = Array.isArray(m.position_m) ? m.position_m : [0, 0];
      m.rotation_deg = isNum(m.rotation_deg) ? m.rotation_deg : 0;
      m.insulation = Object.assign({ thickness_mm: 150, type: 'wood-fibre or documented reclaimed board' }, m.insulation || {});
      m.cladding = Object.assign({ type: 'timber', colour: '#8a6a4a' }, m.cladding || {});
      m.roof = Object.assign({ type: 'solar', solar: true, green: false }, m.roof || {});
      m.structure = Object.assign({ openings_reinforced: true, wall_removal: 'none', cantilever_m: 0, notes: '' }, m.structure || {});
    });
    d.site = Object.assign({ homesite: 'a', rotation_deg: 0, note: 'Illustrative placement only; not part of the published community layout.' }, d.site || {});
    d.provenance = Object.assign({ authors: 'Containers Hamlet contributors', created: '2026', revision: '1.3.0', method: 'Design Lab concept geometry; not verified.', verification: 'None.' }, d.provenance || {});
    d.licence = Object.assign({ code: 'AGPL-3.0-or-later', content: 'CC BY-SA 4.0' }, d.licence || {});
    d.authorship = Object.assign({ name: 'Containers Hamlet contributors', tool: 'Containers Hamlet Design Lab', version: '1.3.0' }, d.authorship || {});
    d.status = d.status || 'concept only; not reviewed; not for construction';
    d.professional_review_required = true;
    return d;
  }

  function validateSchema(input) {
    var d = clone(input || {});
    var errors = [];
    var warnings = [];
    var err = function (m) { errors.push({ code: 'schema', message: m }); };
    if (d.schema !== SCHEMA) err('Expected schema ' + SCHEMA + '.');
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
    if (!d.provenance || !d.licence) warnings.push({ code: 'provenance', message: 'Provenance or licence metadata is missing; it will be added on export.' });
    var ids = requiredIds(d);
    var dup = ids.filter(function (id, i) { return ids.indexOf(id) !== i; });
    if (dup.length) err('Duplicate ids: ' + dup.join(', '));
    (d.modules || []).forEach(function (m, i) {
      if (!m.id) err('Module ' + (i + 1) + ' has no stable id.');
      if (!MODULE_TYPES[m.type]) err('Module ' + m.id + ' has unknown type ' + m.type + '.');
      if (!Array.isArray(m.position_m) || m.position_m.length !== 2 || !m.position_m.every(isNum)) err('Module ' + m.id + ' needs a two-number position_m.');
      if (!isNum(m.rotation_deg)) err('Module ' + m.id + ' needs a numeric rotation_deg.');
      if (!m.nominal || !isNum(m.nominal.length_m) || !isNum(m.nominal.width_m)) err('Module ' + m.id + ' needs nominal dimensions.');
      if (m.nominal && MODULE_TYPES[m.type]) {
        var t = MODULE_TYPES[m.type];
        if (Math.abs(m.nominal.length_m - t.length_m) > 0.01 || Math.abs(m.nominal.width_m - t.width_m) > 0.01) err('Module ' + m.id + ' nominal dimensions do not match its type.');
      }
      if (!m.insulation || !isNum(m.insulation.thickness_mm) || m.insulation.thickness_mm < 50 || m.insulation.thickness_mm > 300) err('Module ' + m.id + ' insulation must be 50–300 mm.');
      if (!m.cladding || CLADDING.indexOf(m.cladding.type) < 0) err('Module ' + m.id + ' needs a known cladding type.');
      if (!m.roof || ROOFS.indexOf(m.roof.type) < 0) err('Module ' + m.id + ' needs a known roof type.');
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
    return { ok: errors.length === 0, errors: errors, warnings: warnings, unknownKeys: Object.keys(d).filter(function (k) { return ['schema','id','name','group','editable','visual_seed','tagline','description','primary_view_deg','modules','connections','porches','decks','foundation','features','materials','provenance','licence','authorship','status','units','professional_review_required','site','assessment','trellises','material_intent','thermal','envelope','vegetation'].indexOf(k) < 0; }) };
  }

  /* Migrate the supplied prototype's v0.1 JSON. Nothing is dropped silently:
     the report lists every v0.1 key and any field that did not map. */
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
        insulation: { thickness_mm: Number(old.envelope && old.envelope.external_insulation_mm) || 150, type: 'migrated from v0.1 (type not recorded)' },
        cladding: { type: old.envelope && old.envelope.cladding || 'timber', colour: '#8a6a4a' },
        roof: { type: old.envelope && old.envelope.roof || 'solar', solar: (old.envelope && old.envelope.roof) !== 'green', green: (old.envelope && old.envelope.roof) === 'green' || (old.envelope && old.envelope.roof) === 'biosolar' },
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
      provenance: {
        authors: 'Containers Hamlet contributors', created: '2026', revision: '1.3.0',
        method: 'Migrated from the supplied containers-hamlet-editor/v0.1 prototype.',
        verification: 'None.',
        migration: {
          source_schema: LEGACY_SCHEMA,
          source_preset: old.preset || 'retreat',
          unmapped: ['interior zones (v0.1 did not model them)', 'decks', 'fixtures', 'visible interior descriptions'],
          notes: ['Two-container v0.1 designs are migrated as adjacent modules; the original simplified combined width is not retained as geometry.']
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
      unmapped: ['interior zones were not present', 'window height and sill were not recorded; 1.4 m / 0.9 m are migration defaults', 'the v0.1 two-container combined width is not retained as separate geometry'],
      warnings: design.modules.length === 2 ? ['The v0.1 pair is now two explicit adjacent modules. Review the connection and shared wall.', 'The single v0.1 porch is placed on the outer module of the pair to avoid overlapping the other module.'] : []
    };
    return { design: design, report: report };
  }

  function summary(design) {
    var d = canonicalize(design);
    var modules = d.modules;
    var nominal = modules.reduce(function (s, m) { return s + m.nominal.length_m * m.nominal.width_m; }, 0);
    var zones = modules.reduce(function (s, m) { return s + (m.zones || []).length; }, 0);
    var openings = modules.reduce(function (s, m) { return s + (m.openings || []).length; }, 0);
    var porch = d.porches.reduce(function (s, p) { return s + p.length_m * p.depth_m; }, 0);
    return {
      moduleCount: modules.length,
      types: modules.map(function (m) { return m.type; }),
      nominalFootprint_m2: round(nominal, 1),
      zoneCount: zones,
      openingCount: openings,
      screenedPorch_m2: round(porch, 1),
      greenRoof: modules.some(function (m) { return m.roof.green; }),
      solar: modules.some(function (m) { return m.roof.solar; }),
      maxInsulation_mm: Math.max.apply(null, modules.map(function (m) { return m.insulation.thickness_mm; }))
    };
  }

  return { SCHEMA: SCHEMA, LEGACY_SCHEMA: LEGACY_SCHEMA, MODULE_TYPES: MODULE_TYPES, FACES: FACES, OPENING_TYPES: OPENING_TYPES, ZONE_TYPES: ZONE_TYPES, CLADDING: CLADDING, ROOFS: ROOFS, ENVELOPE_ASSEMBLIES: ENVELOPE_ASSEMBLIES, VEGETATION_TYPES: VEGETATION_TYPES, clone: clone, canonicalize: canonicalize, validateSchema: validateSchema, migrateV01: migrateV01, summary: summary, moduleDefaults: moduleDefaults, newId: newId, requiredIds: requiredIds, round: round };
});
