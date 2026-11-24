/*
 * Containers Hamlet illustration pipeline.
 *
 * Converts the canonical design model into a structured scene specification,
 * then into deterministic reference metadata, a human-readable description and
 * an image-generation prompt. It never changes architectural geometry.
 *
 * Code licence: AGPL-3.0-or-later.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./design-schema.js'), require('./design-model.js'), require('./design-interior.js'), require('./design-energy.js'));
  else root.DesignIllustration = factory(root.DesignSchema, root.DesignModel, root.DesignInterior, root.DesignEnergy);
})(typeof self !== 'undefined' ? self : this, function (Schema, Model, Interior, Energy) {
  'use strict';

  var ILLUSTRATION_SCHEMA = 'containers-hamlet-illustration/v1';
  var SCENE_SCHEMA = 'containers-hamlet-scene/v1';
  var GENERATOR_VERSION = '1.0.0';
  var VIEWS = ['exterior-three-quarter', 'front-approach', 'rear-landscape', 'elevated-isometric', 'interior-looking-out', 'courtyard-porch', 'room'];
  var STYLES = ['photorealistic', 'architectural-watercolour', 'hand-drawn-sketch', 'presentation-rendering', 'neutral-material-study', 'winter-visualisation'];
  var SEASONS = ['late-summer', 'autumn', 'winter', 'spring'];
  var TIMES = ['early-morning', 'midday', 'late-afternoon', 'dusk'];
  var WEATHER = ['clear', 'overcast', 'light-rain', 'snow'];
  var MATERIAL_POLICIES = ['strict-documented', 'neutral-unspecified', 'exploratory'];
  var VIEW_LABEL = {
    'exterior-three-quarter': 'exterior three-quarter view',
    'front-approach': 'front approach view',
    'rear-landscape': 'rear or landscape-facing view',
    'elevated-isometric': 'elevated isometric view',
    'interior-looking-out': 'interior view looking outward',
    'courtyard-porch': 'courtyard or porch view',
    'room': 'selected room view'
  };
  var STYLE_LABEL = {
    'photorealistic': 'photorealistic architectural illustration',
    'architectural-watercolour': 'architectural watercolour',
    'hand-drawn-sketch': 'hand-drawn architectural sketch',
    'presentation-rendering': 'architectural presentation rendering',
    'neutral-material-study': 'neutral material study',
    'winter-visualisation': 'winter architectural visualisation'
  };
  var FACES = ['north', 'south', 'east', 'west'];
  var DEG = Math.PI / 180;

  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function num(v, d) { return typeof v === 'number' && Number.isFinite(v) ? v : d; }
  function round(v, d) { var f = Math.pow(10, d == null ? 2 : d); return Math.round(v * f) / f; }
  function norm(deg) { var v = deg % 360; return v < 0 ? v + 360 : v; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function oneOf(list, v) { return list.indexOf(v) >= 0; }
  function angleDiff(a, b) { return Math.abs(((a - b + 540) % 360) - 180); }
  function pvScene(design, cameraAzimuth, viewType) {
    if (!Energy || !design.energy) return null;
    var g = Energy.panelGeometry(design);
    var s = Energy.summary(design);
    var total = g.total_panels;
    var visible;
    if (viewType === 'elevated-isometric' || viewType === 'roof-level' || viewType === 'roof') visible = total;
    else if (viewType === 'interior-looking-out') visible = 0;
    else visible = g.panels.filter(function (p) { return angleDiff(p.azimuth_deg, cameraAzimuth) <= 90; }).length;
    return {
      totalPanels: total,
      capacity_kwp: g.capacity_kwp,
      moduleWatts: design.energy.reference_module.watts,
      panelArea_m2: g.area_m2,
      visiblePanels: visible,
      cameraAzimuth_deg: round(cameraAzimuth, 1),
      arrays: g.arrays.map(function (a) {
        return {
          id: a.id, label: a.label, panelCount: a.module_count, rows: a.rows, columns: a.columns,
          tilt_deg: a.tilt_deg, azimuth_deg: a.azimuth_deg, mounting: a.mounting,
          surface: a.surface_kind, electricalGroup: a.electrical_group,
          panelDimensions_m: { length_m: design.energy.reference_module.length_m, width_m: design.energy.reference_module.width_m },
          maintenanceAccess: a.maintenance_access,
          snowShed: a.snow_shed_to,
          snowGuards: !!a.snow_guards
        };
      }),
      canopies: (design.energy.solar.canopies || []).map(function (c) {
        return { id: c.id, label: c.label, length_m: c.length_m, depth_m: c.depth_m, height_m: c.height_m, tilt_deg: c.tilt_deg, azimuth_deg: c.azimuth_deg };
      }),
      snowNote: 'Snow shedding, guards and clear zones must match the recorded array geometry. Do not draw snow sliding onto an entrance or accessible route.',
      note: 'The geometric model is authoritative. The illustration must show exactly this many panels on these surfaces and must not invent a different layout.'
    };
  }

  function stableStringify(value) {
    if (value === null || typeof value !== 'object') return JSON.stringify(value);
    if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
    return '{' + Object.keys(value).sort().filter(function (k) { return value[k] !== undefined; }).map(function (k) { return JSON.stringify(k) + ':' + stableStringify(value[k]); }).join(',') + '}';
  }
  function hashString(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return ('00000000' + h.toString(16)).slice(-8);
  }
  function designHash(design) {
    var d = clone(design || {});
    delete d.assessment;
    if (d.provenance) delete d.provenance.exported_with;
    return hashString(stableStringify(Schema.canonicalize(d)));
  }
  function presentationHash(config) { return hashString(stableStringify(config || {})); }
  function sceneHash(scene) { return hashString(stableStringify(scene)); }

  function defaultConfig(design) {
    return {
      schema: ILLUSTRATION_SCHEMA,
      designId: design && design.id || '',
      view: { type: 'exterior-three-quarter', camera: { position: 'approach', height_m: 1.6, lens_mm: 35 } },
      presentation: { style: 'photorealistic', season: 'late-summer', time: 'late-afternoon', weather: 'clear', people: false },
      materialPolicy: 'strict-documented'
    };
  }

  function validateConfig(config) {
    var errors = [];
    var c = config || {};
    if (c.schema !== ILLUSTRATION_SCHEMA) errors.push('Expected illustration schema ' + ILLUSTRATION_SCHEMA + '.');
    if (!c.designId) errors.push('designId is required.');
    if (!c.view || !oneOf(VIEWS, c.view.type)) errors.push('view.type must be one of: ' + VIEWS.join(', ') + '.');
    if (c.view && c.view.camera) {
      if (!isNum(c.view.camera.height_m) || c.view.camera.height_m < 0.5 || c.view.camera.height_m > 30) errors.push('camera.height_m must be 0.5–30 m.');
      if (!isNum(c.view.camera.lens_mm) || c.view.camera.lens_mm < 12 || c.view.camera.lens_mm > 200) errors.push('camera.lens_mm must be 12–200 mm.');
    } else if (c.view) errors.push('view.camera is required.');
    if (!c.presentation || !oneOf(STYLES, c.presentation.style)) errors.push('presentation.style must be one of: ' + STYLES.join(', ') + '.');
    if (c.presentation) {
      if (!oneOf(SEASONS, c.presentation.season)) errors.push('presentation.season must be one of: ' + SEASONS.join(', ') + '.');
      if (!oneOf(TIMES, c.presentation.time)) errors.push('presentation.time must be one of: ' + TIMES.join(', ') + '.');
      if (!oneOf(WEATHER, c.presentation.weather)) errors.push('presentation.weather must be one of: ' + WEATHER.join(', ') + '.');
      if (typeof c.presentation.people !== 'boolean') errors.push('presentation.people must be boolean.');
    }
    if (!oneOf(MATERIAL_POLICIES, c.materialPolicy)) errors.push('materialPolicy must be one of: ' + MATERIAL_POLICIES.join(', ') + '.');
    return { ok: errors.length === 0, errors: errors };
  }
  function isNum(v) { return typeof v === 'number' && Number.isFinite(v); }

  function siteFor(design, siteData) {
    var homesite = design.site && design.site.homesite;
    var buildings = siteData && siteData.buildings || [];
    return buildings.filter(function (b) { return b.design_lab_home === design.id; })[0] || buildings.filter(function (b) { return b.id === homesite; })[0] || null;
  }
  function principalView(design, siteData) {
    var site = siteFor(design, siteData);
    return site && site.views && site.views.main ? site.views.main : null;
  }
  function siteRotation(design, siteData) {
    var site = siteFor(design, siteData);
    return num(site && site.rotation_deg, num(design.site && design.site.rotation_deg, 0));
  }
  function worldAzimuth(design, siteData, localAzimuth) {
    return norm(num(localAzimuth, 0) + siteRotation(design, siteData));
  }
  var ORIENTATION_DEG = { north: 0, east: 90, south: 180, west: 270 };
  function entranceBearing(design, siteData) {
    var f = Model.architectureFeatures(design);
    return worldAzimuth(design, siteData, ORIENTATION_DEG[f.entrance_orientation] == null ? 180 : ORIENTATION_DEG[f.entrance_orientation]);
  }
  function viewAzimuth(design, config, siteData) {
    var main = principalView(design, siteData);
    var base = main && isNum(main.azimuth_deg) ? main.azimuth_deg : worldAzimuth(design, siteData, design.primary_view_deg || 180);
    var type = config.view.type;
    if (type === 'front-approach') return entranceBearing(design, siteData);
    if (type === 'rear-landscape') return norm(base + 180);
    if (type === 'exterior-three-quarter') return norm(base + 35);
    if (type === 'elevated-isometric') return norm(base + 45);
    return base;
  }
  function referenceRotation(azimuth) { return norm(135 - azimuth); }

  function offsetSentence(design, module) {
    if (num(module.storey, 0) === 0) return '';
    var ground = design.modules.filter(function (m) { return num(m.storey, 0) < num(module.storey, 0); });
    if (!ground.length) return '';
    var g = ground.sort(function (a, b) { return Math.abs(a.position_m[0] - module.position_m[0]) + Math.abs(a.position_m[1] - module.position_m[1]) - (Math.abs(b.position_m[0] - module.position_m[0]) + Math.abs(b.position_m[1] - module.position_m[1])); })[0];
    var dx = round(module.position_m[0] - g.position_m[0], 2);
    var dy = round(module.position_m[1] - g.position_m[1], 2);
    var parts = [];
    if (Math.abs(dx) > 0.01) parts.push(Math.abs(dx) + ' m ' + (dx > 0 ? 'east' : 'west'));
    if (Math.abs(dy) > 0.01) parts.push(Math.abs(dy) + ' m ' + (dy > 0 ? 'south' : 'north'));
    var rot = round((module.rotation_deg || 0) - (g.rotation_deg || 0), 0);
    var rotTxt = Math.abs(rot) > 0.1 ? ', rotated ' + Math.abs(rot) + ' degrees ' + (rot > 0 ? 'clockwise' : 'counter-clockwise') + ' relative to ' + g.id : '';
    return module.id + ' is ' + (parts.length ? 'offset ' + parts.join(' and ') + ' relative to ' + g.id : 'aligned with ' + g.id) + rotTxt + '.';
  }

  function materialRows(design) {
    return design.modules.map(function (m) {
      return {
        module: m.id, cladding: m.cladding.type, colour: m.cladding.colour,
        frame: m.frame_colour || null, roof: m.roof.type,
        insulation_mm: m.insulation.thickness_mm,
        solar: !!(m.solar && m.solar.enabled)
      };
    });
  }
  function openingRows(design) {
    var out = [];
    design.modules.forEach(function (m) {
      (m.openings || []).forEach(function (o) {
        var nrm = Model.faceNormalWorld(m, o.face);
        var wf = Math.abs(nrm[0]) >= Math.abs(nrm[1]) ? (nrm[0] >= 0 ? 'east' : 'west') : (nrm[1] >= 0 ? 'south' : 'north');
        out.push({ module: m.id, storey: m.storey, id: o.id, name: o.name || o.id, face: o.face, worldFace: wf, type: o.type, width_m: o.width_m, height_m: o.height_m, sill_m: o.sill_m, position_m: o.position_m });
      });
    });
    return out;
  }
  function outdoorRows(design) {
    var out = [];
    (design.porches || []).forEach(function (p) {
      var m = design.modules.filter(function (x) { return x.id === p.module; })[0];
      out.push({ type: 'porch', id: p.id, module: p.module, storey: m ? m.storey : 0, face: p.face, length_m: p.length_m, depth_m: p.depth_m, screened: !!p.screened, roof: !!p.roof, note: p.note || '' });
    });
    (design.decks || []).forEach(function (d) {
      out.push({ type: 'deck', id: d.id, porch: d.porch, projection_m: d.projection_m, note: d.note || '' });
    });
    (design.connections || []).forEach(function (c) {
      out.push({ type: 'connection', id: c.id, from: c.from, to: c.to, glazed: !!c.glazed, width_m: c.width_m, length_m: c.length_m, note: c.note || '' });
    });
    return out;
  }
  function zoneRows(design) {
    var out = [];
    design.modules.forEach(function (m) {
      (m.zones || []).forEach(function (z) {
        out.push({ module: m.id, storey: m.storey, id: z.id, name: z.name, type: z.type, start_m: z.start_m, end_m: z.end_m, accessibility: z.accessibility || '' });
      });
    });
    return out;
  }

  function unresolvedFor(design, siteData) {
    var out = [];
    var zones = zoneRows(design);
    if (zones.length) out.push({ code: 'interior-partitions', severity: 'limitation', message: 'Interior partitions, fixtures and camera geometry are conceptual or provisional. Do not claim a spatially accurate perspective or verified clearance.' });
    design.modules.forEach(function (m) {
      (m.openings || []).forEach(function (o) {
        if (!/balcony/i.test(String(o.name || '') + ' ' + String(o.id || ''))) return;
        var hasPorch = (design.porches || []).some(function (p) { return p.module === m.id && p.face === o.face; });
        if (!hasPorch) out.push({ code: 'unmodeled-balcony', severity: 'unresolved', module: m.id, opening: o.id, message: 'The upper ' + o.face + ' door is not accompanied by a modeled balcony, porch or deck on the same face. Do not draw an accessible balcony; guarding, support and egress are unresolved.' });
      });
    });
    (design.porches || []).forEach(function (p) {
      var m = design.modules.filter(function (x) { return x.id === p.module; })[0];
      if (!m || m.storey === 0) return;
      var hasDoor = (m.openings || []).some(function (o) { return o.face === p.face && (o.type === 'door' || o.type === 'sliding-door'); });
      if (!hasDoor) out.push({ code: 'balcony-access', severity: 'unresolved', module: m.id, porch: p.id, message: 'The upper porch ' + p.id + ' has no recorded door on the same ' + p.face + ' face. Do not show it as an accessible balcony; access is unresolved.' });
    });
    if (design.roof_form && design.roof_form.type === 'butterfly' && !design.roof_form.interior_ceiling) out.push({ code: 'interior-ceiling', severity: 'unresolved', message: 'The butterfly roof is modeled on the exterior. The interior ceiling geometry is not modeled; do not invent a ridge or valley inside.' });
    if (design.access && design.access.stair && design.access.stair.type === 'alternating-tread') out.push({ code: 'alternating-tread-stair', severity: 'unresolved', message: 'The alternating-tread stair is recorded but its usability and code acceptability are unresolved. Do not present it as an acceptable permanent-residence solution.' });
    if (design.access && String(design.access.classification || '').indexOf('fully-accessible') === 0) out.push({ code: 'accessibility-verification', severity: 'review', message: 'Accessibility is a design target, not a verified assessment. Turning circles, thresholds, fixtures and clearances have not been measured.' });
    var main = principalView(design, siteData);
    var site = siteFor(design, siteData);
    if (site && site.orientation && site.orientation.path_approach) {
      var path = String(site.orientation.path_approach).toLowerCase();
      var entrance = Model.architectureFeatures(design).entrance_orientation;
      if (path.indexOf(entrance) < 0) out.push({ code: 'site-approach', severity: 'unresolved', message: 'The site path approach is ' + path + ' while the design entrance is ' + entrance + '. The generated prompt does not call any side the main approach without qualification.' });
    }
    if (!main) out.push({ code: 'site-view', severity: 'unresolved', message: 'No principal site view is recorded. Use the design primary view direction and say the site view is unspecified.' });
    if (!design.water) out.push({ code: 'water-system-not-recorded', severity: 'unresolved', message: 'No rainwater or fire-water system is recorded. Do not invent a tank, cistern, hydrant or potable supply.' });
    else {
      if (design.water.status === 'conceptual' || design.water.status === 'not-assessed') out.push({ code: 'water-system-conceptual', severity: 'unresolved', message: 'Rainwater collection is a conceptual intent only. Tank size, location, yield, freeze protection, overflow, filtration and treatment are not designed.' });
      if (!design.water.fireReserve || design.water.fireReserve.verified !== true) out.push({ code: 'fire-water-not-verified', severity: 'unresolved', message: 'The fire reserve is separate in intent but no volume, connection or fire-service verification is recorded. Do not show a confirmed hydrant or cistern.' });
      if (!design.water.treatment || design.water.treatment.potable !== true) out.push({ code: 'non-potable-water', severity: 'limitation', message: 'The rainwater system is not recorded as potable. Do not imply drinking-water safety; treatment and testing are unresolved.' });
    }
    if (design.fire && design.fire.water_access !== true) out.push({ code: 'fire-water-access-unconfirmed', severity: 'unresolved', message: 'Fire-service water access is not confirmed. Do not draw a working hydrant, cistern or draft point as if verified.' });
    if (design.fire && design.fire.noncombustible_deck === false) out.push({ code: 'combustible-deck', severity: 'unresolved', message: 'The deck/porch is not recorded as noncombustible. Combustible decking, stored firewood and under-floor storage are fire risks; do not present them as resolved.' });
    if (design.levels.length > 1) out.push({ code: 'fire-separation-not-assessed', severity: 'unresolved', message: 'Inter-storey and inter-module fire separation, protected egress and cavity barriers are not assessed. Do not imply a fire-resistance rating.' });
    var installedPv = !!(design.solar_array && design.solar_array.enabled) || design.modules.some(function (m) { return m.solar && m.solar.enabled; });
    if (!installedPv && design.roof_form && design.roof_form.type === 'solar-ready') out.push({ code: 'solar-ready-only', severity: 'unresolved', message: 'The roof is solar-ready but no installed array is recorded. Do not show installed PV panels.' });
    return out;
  }

  function sceneSpec(designInput, configInput, siteData) {
    var design = Schema.canonicalize(designInput);
    var config = configInput ? clone(configInput) : defaultConfig(design);
    var configCheck = validateConfig(config);
    if (!configCheck.ok) throw new Error('Illustration configuration is invalid: ' + configCheck.errors.join(' '));
    var site = siteFor(design, siteData);
    var main = principalView(design, siteData);
    var metrics = Model.metrics(design);
    var arch = Model.architectureFeatures(design);
    var access = Model.accessibilityProfile(design);
    var review = Model.structuralReview(design);
    var interiorValidation = Interior ? Interior.validate(design) : null;
    var interiorSchedule = Interior ? Interior.schedule(design) : null;
    var interiorAccess = Interior ? Interior.accessibilityEvidence(design) : null;
    var azimuth = viewAzimuth(design, config, siteData);
    var unresolved = unresolvedFor(design, siteData);
    var pv = pvScene(design, azimuth, config.view.type);
    if (interiorValidation) {
      interiorValidation.invalid.forEach(function (i) { unresolved.push({ code: i.code, severity: 'invalid-interior', message: i.message }); });
      interiorValidation.unresolved.forEach(function (i) { unresolved.push({ code: i.code, severity: 'unresolved', message: i.message }); });
    }
    var scene = {
      schema: SCENE_SCHEMA,
      designId: design.id,
      name: design.name,
      revision: design.provenance && design.provenance.revision || 'unknown',
      designSchema: design.schema,
      designHash: designHash(design),
      sceneType: config.view.type,
      camera: {
        view: config.view.type,
        viewLabel: VIEW_LABEL[config.view.type] || config.view.type,
        height_m: config.view.camera.height_m,
        lens_mm: config.view.camera.lens_mm,
        azimuth_deg: round(azimuth, 1),
        target: 'building',
        renderRotationDeg: round(referenceRotation(azimuth), 1),
        note: 'Azimuth is a world bearing from north. Reference SVG rendering is approximate; it is a concept reference, not a measured perspective.'
      },
      building: {
        storeys: metrics.storeyCount,
        moduleCount: metrics.moduleCount,
        moduleTypes: design.modules.map(function (m) { return m.type; }),
        arrangement: arch.arrangement,
        footprintType: arch.footprint_type,
        grossFloorArea_m2: metrics.grossFloorArea_m2,
        groundCoverage_m2: metrics.groundCoverage_m2,
        buildingHeight_m: metrics.buildingHeight_m,
        roofType: metrics.roofType,
        roofPitch_deg: metrics.roofPitch_deg,
        roofOverhang_m: design.roof_form.overhang_m,
        roofGreen: !!(design.roof_form && design.roof_form.green_roof),
        installedPv: !!(design.solar_array && design.solar_array.enabled) || design.modules.some(function (m) { return m.solar && m.solar.enabled; })
      },
      requiredElements: design.modules.map(function (m) {
        return {
          type: 'container', sourceId: m.id, storey: m.storey, elevation_m: m.elevation_m,
          position_m: [m.position_m[0], m.position_m[1]], rotation_deg: m.rotation_deg,
          nominal: { length_m: m.nominal.length_m, width_m: m.nominal.width_m, height_m: m.nominal.height_m },
          support: { type: m.support.type, references: m.support.references.slice(), verified: m.support.verified },
          cladding: { type: m.cladding.type, colour: m.cladding.colour },
          roof: m.roof.type,
          offsetNote: offsetSentence(design, m)
        };
      }),
      openings: openingRows(design),
      outdoor: outdoorRows(design),
      spaces: zoneRows(design),
      interior: {
        schema: design.interior ? design.interior.schema : null,
        status: design.interior ? design.interior.status : 'absent',
        rooms: design.interior ? clone(design.interior.rooms || []) : [],
        partitions: design.interior ? clone(design.interior.partitions || []) : [],
        doors: design.interior ? clone(design.interior.doors || []) : [],
        fixtures: design.interior ? clone(design.interior.fixtures || []) : [],
        clearances: design.interior ? clone(design.interior.clearances || []) : [],
        schedule: interiorSchedule,
        validation: interiorValidation,
        accessibilityEvidence: interiorAccess,
        capabilities: {
          detailedFloorPlan: !!(design.interior && design.interior.rooms && design.interior.rooms.length),
          interiorIllustrationPrompt: !!(design.interior && design.interior.rooms && design.interior.rooms.length),
          interiorPerspective: false,
          roomZonePlan: true,
          note: 'Room polygons and fixtures support a detailed interior prompt and plan. No interior camera or perspective renderer is implemented, so perspective accuracy is not claimed.'
        }
      },
      solar: pv,
      services: {
        fire: design.fire ? clone(design.fire) : null,
        water: design.water ? clone(design.water) : null,
        note: 'Fire protection, fire-water access and rainwater collection are conceptual intents/unknowns. No fire-resistance rating, WUI approval, tank sizing, potable-water testing or fire-service connection is designed.'
      },
      materials: { modules: materialRows(design), palette: (design.materials || []).map(function (x) { return { component: x.component, material: x.material, disclosure: x.disclosure }; }), roofFinish: design.roof_form.type, windowFrames: design.modules.map(function (m) { return m.frame_colour || null; }) },
      environment: {
        siteId: site ? site.id : (design.site && design.site.homesite) || null,
        siteName: site ? site.name : 'unassigned site',
        siteRotation_deg: siteRotation(design, siteData),
        principalView: main ? main.description : 'not recorded',
        principalViewAzimuth_deg: main && isNum(main.azimuth_deg) ? main.azimuth_deg : null,
        pathApproach: site && site.orientation ? site.orientation.path_approach : 'not recorded',
        season: config.presentation.season,
        time: config.presentation.time,
        weather: config.presentation.weather,
        people: config.presentation.people
      },
      constraints: {
        preserveGeometry: true,
        allowAdditionalOpenings: false,
        allowAdditionalStoreys: false,
        allowAdditionalOutdoorSpaces: false,
        allowMaterialInvention: config.materialPolicy === 'exploratory',
        materialPolicy: config.materialPolicy
      },
      capabilities: {
        exteriorReference: true,
        interiorZoneDiagram: true,
        interiorGeometry: !!(design.interior && design.interior.rooms && design.interior.rooms.length),
        detailedFloorPlan: !!(design.interior && design.interior.rooms && design.interior.rooms.length),
        interiorPerspective: false,
        interiorIllustrationPrompt: !!(design.interior && design.interior.rooms && design.interior.rooms.length),
        roomZonePlan: true,
        roofPlan: true,
        containerSchematic: true
      },
      facts: [],
      intentions: [],
      unresolved: unresolved,
      presentation: clone(config.presentation),
      materialPolicy: config.materialPolicy,
      prompt: {},
      negativePrompt: {},
      description: {}
    };
    scene.facts = [
      metrics.storeyCount + ' occupied storey' + (metrics.storeyCount === 1 ? '' : 's'),
      metrics.moduleCount + ' container module' + (metrics.moduleCount === 1 ? '' : 's') + ' (' + design.modules.map(function (m) { return m.type; }).join(', ') + ')',
      metrics.roofType + ' roof at ' + metrics.roofPitch_deg + ' degrees',
      round(metrics.grossFloorArea_m2, 1) + ' m2 gross floor area',
      round(metrics.groundCoverage_m2, 1) + ' m2 ground coverage',
      round(metrics.buildingHeight_m, 2) + ' m to the roof'
    ];
    scene.intentions = [];
    if (design.access && design.access.step_free_entrance) scene.intentions.push('Step-free entrance is a design intent, not a verified measurement.');
    if (design.access && design.access.adaptable_bathroom) scene.intentions.push('Adaptable bathroom is a design intent, not a verified layout.');
    if (design.access && design.access.adaptable_kitchen) scene.intentions.push('Adaptable kitchen is a design intent, not a verified layout.');
    if (design.roof_form && design.roof_form.green_roof) scene.intentions.push('Green roof is a concept with unresolved load, drainage, fire and maintenance questions.');
    if (pv) scene.intentions.push('The illustration must show ' + pv.totalPanels + ' installed PV panels, not a generic panel pattern. This viewpoint shows ' + pv.visiblePanels + ' of them.');
    if (design.roof_form && design.roof_form.type === 'butterfly') scene.intentions.push('Butterfly roof is an exterior form; the interior ceiling is not resolved.');
    scene.prompt = promptFor(scene);
    scene.interiorPrompt = interiorPromptFor(scene);
    scene.negativePrompt = negativeFor(scene);
    scene.description = descriptionFor(scene);
    scene.validation = validateScene(scene, design);
    return scene;
  }

  function promptFor(scene) {
    var b = scene.building;
    var lines = [];
    lines.push('Create a ' + (STYLE_LABEL[scene.presentation.style] || scene.presentation.style) + ' of the ' + scene.name + ' residence.');
    lines.push('Use the accompanying architectural reference SVG as the authoritative source for building geometry. This is a conceptual architectural illustration, not a photograph of an existing building.');
    lines.push('The building has ' + b.storeys + ' occupied storey' + (b.storeys === 1 ? '' : 's') + ' and ' + b.moduleCount + ' container module' + (b.moduleCount === 1 ? '' : 's') + '.');
    lines.push('Module geometry:');
    scene.requiredElements.forEach(function (m) {
      lines.push('- ' + m.sourceId + ': ' + (m.storey + 1) + ' storey, ' + round(m.nominal.length_m, 2) + ' m x ' + round(m.nominal.width_m, 2) + ' m, base elevation ' + round(m.elevation_m, 2) + ' m, rotation ' + m.rotation_deg + ' degrees, ' + m.cladding.type + ' cladding.' + (m.offsetNote ? ' ' + m.offsetNote : ''));
    });
    lines.push('Roof: ' + b.roofType + ' at ' + b.roofPitch_deg + ' degrees, ' + round(b.roofOverhang_m, 2) + ' m overhang' + (b.roofGreen ? ', green-roof concept' : '') + (b.installedPv ? ', installed PV array' : (b.roofType === 'solar-ready' ? ', solar-ready only — do not show installed panels' : '')) + '.');
    if (scene.solar) {
      lines.push('Solar: exactly ' + scene.solar.totalPanels + ' installed ' + scene.solar.moduleWatts + ' W panels (' + round(scene.solar.capacity_kwp, 1) + ' kWp, ' + round(scene.solar.panelArea_m2, 1) + ' m²) in total. This viewpoint shows ' + scene.solar.visiblePanels + ' of them. Do not add, remove, merge or rearrange panels.');
      scene.solar.arrays.forEach(function (a) {
        lines.push('- ' + a.id + ': ' + a.panelCount + ' panels in ' + a.rows + ' row(s) x ' + a.columns + ' column(s), ' + a.tilt_deg + '° tilt, ' + a.azimuth_deg + '° from north, ' + a.mounting.replace(/-/g, ' ') + ' on the ' + a.surface + ' surface; group ' + a.electricalGroup + '.');
      });
      if (scene.solar.canopies.length) scene.solar.canopies.forEach(function (c) { lines.push('- Solar canopy ' + c.id + ': ' + round(c.length_m, 1) + ' × ' + round(c.depth_m, 1) + ' m at ' + round(c.height_m, 1) + ' m, panels at ' + c.tilt_deg + '°.'); });
      lines.push('Panel snow: ' + scene.solar.arrays.map(function (a) { return a.id + ' sheds to ' + a.snowShed + (a.snowGuards ? ' with snow guards' : ' without snow guards'); }).join('; ') + '. Do not draw snow discharging onto an entrance or accessible route.');
    } else if (scene.building.installedPv) {
      lines.push('Solar: the design records an installed PV array but no canonical panel geometry. Do not invent a panel count; show the array as an unresolved intent and report the omission.');
    }
    lines.push('Openings:');
    var byModule = {};
    scene.openings.forEach(function (o) { (byModule[o.module] = byModule[o.module] || []).push(o); });
    Object.keys(byModule).forEach(function (id) {
      lines.push('- ' + id + ': ' + byModule[id].map(function (o) { return o.face + ' ' + o.type + ' "' + o.name + '" at ' + o.position_m + ' m, ' + o.width_m + ' x ' + o.height_m + ' m, sill ' + o.sill_m + ' m'; }).join('; ') + '.');
    });
    if (!scene.openings.length) lines.push('- No openings are recorded. Do not add any.');
    lines.push('Outdoor spaces:');
    if (!scene.outdoor.length) lines.push('- None recorded. Do not add a porch, deck or balcony.');
    else scene.outdoor.forEach(function (o) {
      if (o.type === 'porch') lines.push('- ' + o.id + ': ' + o.length_m + ' m x ' + o.depth_m + ' m ' + (o.screened ? 'screened' : 'covered') + ' porch on the ' + o.face + ' face of ' + o.module + ', ' + (o.roof ? 'roofed' : 'open') + '.');
      else if (o.type === 'deck') lines.push('- ' + o.id + ': deck beyond ' + o.porch + ', projecting ' + o.projection_m + ' m.');
      else lines.push('- ' + o.id + ': ' + (o.glazed ? 'glazed ' : '') + 'connection between ' + o.from + ' and ' + o.to + '.');
    });
    lines.push('Site: ' + scene.environment.siteName + '. Principal view: ' + scene.environment.principalView + ' Path approach recorded as ' + scene.environment.pathApproach + '.');
    lines.push('Camera: ' + scene.camera.viewLabel + ', ' + scene.camera.height_m + ' m eye height, ' + scene.camera.lens_mm + ' mm lens, world bearing ' + scene.camera.azimuth_deg + ' degrees.');
    lines.push('Presentation: ' + scene.presentation.season.replace(/-/g, ' ') + ', ' + scene.presentation.time.replace(/-/g, ' ') + ', ' + scene.presentation.weather.replace(/-/g, ' ') + ', ' + (scene.presentation.people ? 'people may be shown' : 'no people') + '.');
    lines.push('Material policy: ' + scene.materialPolicy.replace(/-/g, ' ') + '. Preserve the documented materials. ' + (scene.materialPolicy === 'strict-documented' ? 'Do not invent a material for an unspecified element.' : scene.materialPolicy === 'neutral-unspecified' ? 'Show unspecified materials neutrally, without a new claim.' : 'Exploratory materials are not authoritative; label them as exploratory in the accompanying notes.'));
    lines.push('Fire and water services:');
    if (scene.services && scene.services.fire) {
      lines.push('- Fire: roof class ' + scene.services.fire.roof_class + ', closed noncombustible eaves ' + (scene.services.fire.noncombustible_eaves ? 'intended' : 'not recorded') + ', ember-resistant vents ' + (scene.services.fire.ember_resistant_vents ? 'intended' : 'not recorded') + ', tempered glazing ' + (scene.services.fire.tempered_glazing ? 'intended' : 'not recorded') + ', noncombustible deck ' + (scene.services.fire.noncombustible_deck ? 'intended' : 'not recorded') + ', defensible space ' + scene.services.fire.defensible_space_m + ' m (conceptual), fire water access ' + (scene.services.fire.water_access ? 'recorded' : 'not confirmed') + '.');
    } else lines.push('- Fire: no fire-resilience data recorded. Do not add a fire rating, hydrant or fire barrier claim.');
    if (scene.services && scene.services.water) {
      var w = scene.services.water;
      lines.push('- Rainwater: status ' + w.status + '; catchment ' + (w.catchment && w.catchment.roof) + '; gutters/leaf guards/first flush ' + (w.collection ? 'required' : 'not recorded') + '; storage ' + (w.storage ? w.storage.type : 'not recorded') + ' with volume/location ' + (w.storage && w.storage.volume_L === null ? 'not resolved' : 'not recorded') + '; potable ' + (w.treatment && w.treatment.potable ? 'claimed' : 'no') + '; fire reserve separate ' + (w.fireReserve && w.fireReserve.separate) + ', verified ' + (w.fireReserve && w.fireReserve.verified) + '.');
      lines.push('- Do not depict a single rain barrel as a complete system. Do not show a confirmed hydrant, fire cistern, potable supply or fire-resistance rating.');
    } else lines.push('- Rainwater/fire water: not recorded. Do not invent a tank, cistern, hydrant or potable supply.');
    lines.push('Restrictions: do not add or remove storeys, modules, windows, doors, stairs, balconies, porches, decks, rooms, roof features or structural supports. Do not change module positions, rotations or offsets. Do not add landscape elements that contradict the assigned site.');
    if (scene.unresolved.length) {
      lines.push('Unresolved matters to carry into the illustration notes:');
      scene.unresolved.forEach(function (u) { lines.push('- ' + u.message); });
    }
    lines.push('This is an interpretation for communication. It is not a construction drawing and must not be used to verify dimensions, structure, accessibility or code compliance.');
    return { text: lines.join('\n').replace(/[ \t]+$/gm, ''), lines: lines };
  }

  function interiorPromptFor(scene) {
    var interior = scene.interior || {};
    var lines = [];
    lines.push('# Interior illustration prompt — ' + scene.name);
    lines.push('');
    lines.push('Use the accompanying interior floor plan as the authoritative room-layout reference. This is a conceptual interpretation of a modeled floor plan, not a spatially accurate perspective and not a construction drawing.');
    if (!interior.rooms || !interior.rooms.length) {
      lines.push('');
      lines.push('No interior room geometry is modeled. Only a room-zone plan is available. Do not invent walls, doors, fixtures or furniture.');
      return { text: lines.join('\n').replace(/[ \t]+$/gm, '') + '\n', lines: lines };
    }
    lines.push('');
    lines.push('Rooms:');
    (interior.schedule ? interior.schedule.rooms : []).forEach(function (r) {
      lines.push('- ' + r.name + ' (' + r.type + ', ' + r.id + '): ' + r.area_m2 + ' m², ' + r.module + ', ' + r.provenance + (r.fixtures.length ? ', fixtures: ' + r.fixtures.join(', ') : '') + '.');
    });
    lines.push('');
    var provisional = interior.status === 'provisional' || ((interior.rooms || []).length && (interior.rooms || []).every(function (r) { return r.provenance === 'inferred-from-zone'; }));
    if (provisional) {
      lines.push('The room bands are provisional: no partitions, doors or fixtures are modeled. Do not invent walls, doorways, furniture or room-specific uses. The zone labels describe areas, not rooms.');
    } else {
      lines.push('Partitions and doors: ' + (interior.partitions || []).length + ' partitions and ' + (interior.doors || []).length + ' doors are modeled. Preserve the room boundaries and door connections shown in the reference plan.');
      lines.push('The plan does not reconcile every recorded opening with a room. Do not move or resize an opening to make a room work; report the conflict instead.');
    }
    lines.push('Fixtures: ' + ((interior.fixtures || []).map(function (f) { return f.type + ' in ' + f.room; }).join('; ') || 'none recorded') + '. Show only these modeled fixtures. Do not add loose furniture, rugs, lamps, art or dishes.');
    if (provisional) lines.push('Windows: only the documented openings listed below exist. Do not add or move a window, and do not assign a window to a room by name.');
    else lines.push('Windows: the room polygons reference the documented opening ids. Do not add windows or move them.');
    lines.push('');
    lines.push('Camera: no interior camera position is modeled. Choose a plausible eye-level view, but label the result as a conceptual interpretation, not a measured perspective.');
    lines.push('Presentation: ' + scene.presentation.season.replace(/-/g, ' ') + ', ' + scene.presentation.time.replace(/-/g, ' ') + ', ' + (scene.presentation.people ? 'people may be shown' : 'no people') + '.');
    lines.push('');
    lines.push('Restrictions: do not add or remove rooms, partitions, doors, windows, fixtures or level changes. Do not change room proportions. Do not imply that the view is spatially accurate or that the room-opening assignment is resolved.');
    if (interior.validation && interior.validation.items.length) {
      lines.push('');
      lines.push('Unresolved interior matters:');
      interior.validation.items.forEach(function (i) { lines.push('- ' + i.code + ': ' + i.message); });
    }
    lines.push('');
    lines.push('No accessibility, code or construction claim is made.');
    return { text: lines.join('\n').replace(/[ \t]+$/gm, '') + '\n', lines: lines };
  }

  function negativeFor(scene) {
    var groups = [
      { category: 'geometric contradictions', text: 'extra storeys, extra containers, changed module offsets, changed rotations, missing or duplicated modules, wrong roof form, wrong roof pitch, extra windows, missing windows, extra doors, missing doors, extra balconies, extra stairs' },
      { category: 'architectural additions', text: 'garage, basement, dormers, extra rooms, extra porches, extra decks, structural supports not shown, chimney not recorded, skylights not recorded' },
      { category: 'solar contradictions', text: 'extra solar panels, missing solar panels, invented panel layout, panels on a north slope, panels floating above the roof, panels through a window, a different panel count from the stated count, panels on a canopy that is not recorded' },
      { category: 'rendering artifacts', text: 'warped straight lines, floating building, impossible cantilever, duplicate openings, inconsistent perspective, text, labels, watermarks, logos' },
      { category: 'environmental contradictions', text: 'tropical plants, wrong season, wrong site view, neighbouring buildings not recorded, lake or meadow in the wrong direction' },
      { category: 'safety-related visual errors', text: 'missing guardrails, unsafe stairs, blocked egress, exposed structural collapse, missing fire separation, wood deck presented as noncombustible, firewood stored against the house, missing chimney, missing stove outside-air duct, confirmed hydrant without a verified supply, single rain barrel presented as a complete system, potable-water claim without treatment' }
    ];
    var text = groups.map(function (g) { return g.text; }).join(', ');
    if (scene && scene.solar) text += ', solar array with ' + scene.solar.totalPanels + ' panels shown as ' + scene.solar.visiblePanels + ' visible panels from this viewpoint';
    return { text: text, groups: groups };
  }

  function descriptionFor(scene) {
    var lines = [];
    lines.push('# ' + scene.name + ' — illustration reference');
    lines.push('');
    lines.push('Design revision: ' + scene.revision + ' · schema ' + scene.designSchema + ' · design hash ' + scene.designHash);
    lines.push('');
    lines.push('This description is generated from the canonical design model. The reference SVG is the authoritative geometric reference. The illustration prompt is an interpretation.');
    lines.push('');
    lines.push('## Architectural facts');
    scene.facts.forEach(function (f) { lines.push('- ' + f); });
    lines.push('');
    lines.push('## Modules');
    scene.requiredElements.forEach(function (m) {
      lines.push('- **' + m.sourceId + '** — storey ' + (m.storey + 1) + ', ' + m.nominal.length_m + ' × ' + m.nominal.width_m + ' m, base ' + m.elevation_m + ' m, rotation ' + m.rotation_deg + '°, ' + m.cladding.type + ' cladding. ' + (m.offsetNote || ''));
    });
    lines.push('');
    lines.push('## Solar array');
    if (scene.solar) {
      lines.push('- Installed: ' + scene.solar.totalPanels + ' × ' + scene.solar.moduleWatts + ' W = ' + round(scene.solar.capacity_kwp, 1) + ' kWp; ' + round(scene.solar.panelArea_m2, 1) + ' m² of module surface; ' + scene.solar.visiblePanels + ' visible from this viewpoint.');
      scene.solar.arrays.forEach(function (a) { lines.push('- ' + a.id + ': ' + a.panelCount + ' panels, ' + a.rows + ' × ' + a.columns + ', ' + a.tilt_deg + '° tilt, ' + a.azimuth_deg + '° from north, ' + a.mounting + ', ' + a.surface + ' surface, group ' + a.electricalGroup + '. Snow sheds ' + a.snowShed + (a.snowGuards ? ' behind guards' : ' without guards') + '.'); });
      scene.solar.canopies.forEach(function (c) { lines.push('- Canopy ' + c.id + ': ' + c.length_m + ' × ' + c.depth_m + ' m, ' + c.height_m + ' m high.'); });
    } else if (scene.building.installedPv) lines.push('- Installed PV is recorded without canonical panel geometry. Do not invent a panel count.');
    else lines.push('- No installed PV array.');
    lines.push('');
    lines.push('## Openings');
    if (!scene.openings.length) lines.push('- None recorded.');
    scene.openings.forEach(function (o) { lines.push('- ' + o.module + ' / ' + o.name + ' — ' + o.face + ' ' + o.type + ', ' + o.width_m + ' × ' + o.height_m + ' m, sill ' + o.sill_m + ' m.'); });
    lines.push('');
    lines.push('## Rooms and zones');
    if (!scene.spaces.length) lines.push('- None recorded.');
    scene.spaces.forEach(function (z) { lines.push('- ' + z.module + ' / ' + z.name + ' — ' + z.type + ', ' + z.start_m + '–' + z.end_m + ' m.' + (z.accessibility ? ' ' + z.accessibility : '')); });
    lines.push('');
    lines.push('## Outdoor spaces');
    if (!scene.outdoor.length) lines.push('- None recorded.');
    scene.outdoor.forEach(function (o) {
      if (o.type === 'porch') lines.push('- ' + o.id + ': ' + o.length_m + ' × ' + o.depth_m + ' m ' + (o.screened ? 'screened' : 'covered') + ' porch on the ' + o.face + ' face of ' + o.module + '.');
      else if (o.type === 'deck') lines.push('- ' + o.id + ': deck beyond ' + o.porch + ', ' + o.projection_m + ' m.');
      else lines.push('- ' + o.id + ': ' + (o.glazed ? 'glazed ' : '') + ' connection between ' + o.from + ' and ' + o.to + '.');
    });
    lines.push('');
    lines.push('## Site and camera');
    lines.push('- Assigned site: ' + scene.environment.siteName + ' (site rotation ' + scene.environment.siteRotation_deg + '°).');
    lines.push('- Principal view: ' + scene.environment.principalView);
    lines.push('- Path approach: ' + scene.environment.pathApproach);
    lines.push('- Camera: ' + scene.camera.viewLabel + ', ' + scene.camera.height_m + ' m, ' + scene.camera.lens_mm + ' mm, bearing ' + scene.camera.azimuth_deg + '°.');
    lines.push('');
    if (scene.interior && scene.interior.rooms && scene.interior.rooms.length) {
      lines.push('## Interior schedule');
      (scene.interior.schedule ? scene.interior.schedule.rooms : []).forEach(function (r) { lines.push('- ' + r.name + ' (' + r.type + ') — ' + r.area_m2 + ' m², ' + r.module + ', ' + r.provenance + (r.fixtures.length ? ', fixtures: ' + r.fixtures.join(', ') : '') + '.'); });
      lines.push('- Partitions: ' + (scene.interior.partitions || []).length + ' · doors: ' + (scene.interior.doors || []).length + ' · fixtures: ' + (scene.interior.fixtures || []).length + '.');
      if (scene.interior.validation) lines.push('- Validation: ' + scene.interior.validation.invalid.length + ' invalid, ' + scene.interior.validation.unresolved.length + ' unresolved, ' + scene.interior.validation.review.length + ' review.');
      lines.push('');
    }
    if (scene.services) {
      lines.push('## Fire and water services');
      if (scene.services.fire) lines.push('- Fire intent: roof class ' + scene.services.fire.roof_class + '; noncombustible deck: ' + scene.services.fire.noncombustible_deck + '; fire-water access confirmed: ' + scene.services.fire.water_access + '; defensible space: ' + scene.services.fire.defensible_space_m + ' m (conceptual).');
      if (scene.services.water) lines.push('- Rainwater: ' + scene.services.water.status + '; storage ' + (scene.services.water.storage ? scene.services.water.storage.type : 'not recorded') + '; potable: ' + (scene.services.water.treatment ? scene.services.water.treatment.potable : 'not recorded') + '; fire reserve separate: ' + (scene.services.water.fireReserve ? scene.services.water.fireReserve.separate : 'not recorded') + '; fire connection verified: ' + (scene.services.water.fireReserve ? scene.services.water.fireReserve.verified : 'not recorded') + '.');
      lines.push('- ' + scene.services.note);
      lines.push('');
    }
    lines.push('## Intentions');
    if (!scene.intentions.length) lines.push('- None recorded.');
    scene.intentions.forEach(function (i) { lines.push('- ' + i); });
    lines.push('');
    lines.push('## Unresolved matters');
    if (!scene.unresolved.length) lines.push('- None recorded by the checks.');
    scene.unresolved.forEach(function (u) { lines.push('- **' + u.code + '**: ' + u.message); });
    lines.push('');
    lines.push('## Capability notes');
    lines.push('- Exterior reference: ' + (scene.capabilities.exteriorReference ? 'available' : 'not available'));
    lines.push('- Interior perspective: ' + (scene.capabilities.interiorPerspective ? 'available' : 'not available — no interior camera or perspective renderer is implemented'));
    lines.push('- Room-zone plan: ' + (scene.capabilities.roomZonePlan ? 'available' : 'not available'));
    lines.push('- Roof plan: ' + (scene.capabilities.roofPlan ? 'available' : 'not available'));
    lines.push('');
    lines.push('## Licence and status');
    lines.push('Concept only. Not engineered, permit-ready or professionally reviewed. Code AGPL-3.0-or-later; original content CC BY-SA 4.0.');
    return { text: lines.join('\n').replace(/[ \t]+$/gm, ''), lines: lines };
  }

  function validateScene(scene, designInput) {
    var design = Schema.canonicalize(designInput);
    var errors = [];
    var warnings = [];
    var metrics = Model.metrics(design);
    if (scene.schema !== SCENE_SCHEMA) errors.push('Invalid scene schema.');
    if (scene.designId !== design.id) errors.push('Scene designId does not match the design.');
    if (scene.designHash !== designHash(design)) errors.push('Scene design hash does not match the design.');
    if (scene.building.storeys !== metrics.storeyCount) errors.push('Scene storey count does not match the model.');
    if (scene.building.moduleCount !== metrics.moduleCount) errors.push('Scene module count does not match the model.');
    if (scene.requiredElements.length !== metrics.moduleCount) errors.push('Scene does not include every module.');
    if (scene.openings.length !== design.modules.reduce(function (t, m) { return t + (m.openings || []).length; }, 0)) errors.push('Scene opening count does not match the model.');
    if (scene.building.roofType !== metrics.roofType) errors.push('Scene roof type does not match the model.');
    if (scene.building.roofPitch_deg !== metrics.roofPitch_deg) errors.push('Scene roof pitch does not match the model.');
    var moduleIds = design.modules.map(function (m) { return m.id; });
    scene.requiredElements.forEach(function (m) { if (moduleIds.indexOf(m.sourceId) < 0) errors.push('Scene references unknown module ' + m.sourceId + '.'); });
    if (!scene.constraints.preserveGeometry) errors.push('Scene must preserve geometry.');
    if (scene.constraints.allowAdditionalStoreys !== false) errors.push('Scene must not allow additional storeys.');
    if (scene.constraints.allowAdditionalOpenings !== false) errors.push('Scene must not allow additional openings.');
    if (scene.capabilities.interiorPerspective && !scene.capabilities.interiorGeometry) warnings.push('Interior perspective is claimed without modeled partitions or camera geometry.');
    if (scene.interior && scene.interior.validation && !scene.interior.validation.ok) errors.push('Interior spatial model has invalid geometry.');
    if (scene.interior && scene.interior.rooms && scene.interior.rooms.length && !scene.capabilities.interiorIllustrationPrompt) errors.push('Interior prompt capability is missing despite modeled rooms.');
    if (scene.presentation.people !== false) warnings.push('People are enabled; this is a presentation choice, not an architectural fact.');
    if (design.energy && Energy) {
      var pv = Energy.panelGeometry(design);
      if (!scene.solar) errors.push('Scene does not carry the canonical solar array facts.');
      else {
        if (scene.solar.totalPanels !== pv.total_panels) errors.push('Scene solar panel count does not match the canonical array geometry.');
        if (scene.solar.visiblePanels > scene.solar.totalPanels) errors.push('Scene claims more visible panels than are installed.');
        if (scene.prompt && scene.prompt.text.indexOf('exactly ' + scene.solar.totalPanels + ' installed') < 0) errors.push('Prompt does not state the exact installed panel count.');
      }
    }
    if (scene.materialPolicy === 'exploratory') warnings.push('Exploratory materials are non-authoritative.');
    return { ok: errors.length === 0, errors: errors, warnings: warnings };
  }

  function manifestRecord(scene, designInput, artifacts, sharedArtifacts, generatedAt) {
    var design = Schema.canonicalize(designInput);
    return {
      schema: 'containers-hamlet-package-manifest/v1',
      designId: design.id,
      designRevision: design.provenance && design.provenance.revision || 'unknown',
      designSchema: design.schema,
      designHash: designHash(design),
      sceneHash: sceneHash(scene),
      presentationHash: presentationHash({ view: scene.camera, presentation: scene.presentation, materialPolicy: scene.materialPolicy }),
      generatorVersion: GENERATOR_VERSION,
      generatedAt: generatedAt || new Date().toISOString(),
      artifacts: artifacts || [],
      sharedArtifacts: sharedArtifacts || [],
      limitations: [
        'Reference SVG views are deterministic concept references, not measured photographs.',
        'Interior drawings are conceptual or provisional; no interior perspective or verified clearances are claimed.',
        'Fire protection, fire separation, hydrant/cistern supply and WUI performance are not designed or verified.',
        'Rainwater storage, tank sizing, freeze protection, potable treatment and fire-reserve volume are not designed or verified.',
        'Illustrations generated from the prompt are interpretations, not authoritative drawings.',
        'No structural, accessibility, energy or code compliance is verified.'
      ]
    };
  }

  function manifest(scene, designInput, artifacts, generatedAt) {
    return manifestRecord(scene, designInput, artifacts, [], generatedAt);
  }

  function manifestWithShared(scene, designInput, artifacts, sharedArtifacts, generatedAt) {
    return manifestRecord(scene, designInput, artifacts, sharedArtifacts, generatedAt);
  }

  function publishedArtifactPlan() {
    return [
      { id: 'design-json', path: 'design.json', type: 'design', dependencies: ['design'] },
      { id: 'description', path: 'description.md', type: 'description', dependencies: ['design', 'scene'] },
      { id: 'exterior-prompt', path: 'prompt.md', type: 'prompt', dependencies: ['design', 'scene', 'presentation'] },
      { id: 'interior-prompt', path: 'interior.md', type: 'prompt', dependencies: ['design', 'scene', 'presentation'] },
      { id: 'negative-prompt', path: 'negative.md', type: 'prompt', dependencies: ['design', 'scene'] },
      { id: 'illustration-config', path: 'config.json', type: 'config', dependencies: ['presentation'] },
      { id: 'scene', path: 'scene.json', type: 'scene', dependencies: ['design', 'presentation'] }
    ];
  }

  function sharedArtifactPlan(designInput) {
    var design = Schema.canonicalize(designInput);
    var base = '../../views/' + design.id + '-';
    var out = [
      { id: 'container-layout-plan', view: 'container-layout', path: base + 'container-layout.svg', type: 'drawing', dependencies: ['design'] },
      { id: 'container-layout-elevation', view: 'container-layout-elevation', path: base + 'container-layout-elevation.svg', type: 'drawing', dependencies: ['design'] },
      { id: 'plan-ground', view: 'plan-ground', path: base + 'plan-ground.svg', type: 'drawing', dependencies: ['design'] },
      { id: 'roof-plan', view: 'roof-plan', path: base + 'roof-plan.svg', type: 'drawing', dependencies: ['design', 'roof'] },
      { id: 'elevation-south', view: 'elevation-south', path: base + 'elevation-south.svg', type: 'drawing', dependencies: ['design'] },
      { id: 'section', view: 'section', path: base + 'section.svg', type: 'drawing', dependencies: ['design'] },
      { id: 'isometric', view: 'exterior', path: base + 'exterior.svg', type: 'drawing', dependencies: ['design', 'camera'] },
      { id: 'exterior-reference', view: 'site-facing', path: base + 'site-facing.svg', type: 'reference', dependencies: ['design', 'camera'] }
    ];
    if (design.interior && design.interior.rooms && design.interior.rooms.length) out.splice(3, 0, { id: 'interior-plan', view: 'interior-plan', path: base + 'interior-plan.svg', type: 'drawing', dependencies: ['design', 'interior'] });
    return out;
  }

  function artifactPlan(scene) {
    var designDeps = ['design'];
    return [
      { id: 'design-json', path: 'design.json', type: 'design', dependencies: designDeps },
      { id: 'description', path: 'description.md', type: 'description', dependencies: ['design', 'scene'] },
      { id: 'exterior-prompt', path: 'prompts/exterior.md', type: 'prompt', dependencies: ['design', 'scene', 'presentation'] },
      { id: 'interior-prompt', path: 'prompts/interior.md', type: 'prompt', dependencies: ['design', 'scene', 'presentation'] },
      { id: 'negative-prompt', path: 'prompts/negative.md', type: 'prompt', dependencies: ['design', 'scene'] },
      { id: 'illustration-config', path: 'prompts/illustration-config.json', type: 'config', dependencies: ['presentation'] },
      { id: 'scene', path: 'scene.json', type: 'scene', dependencies: ['design', 'presentation'] },
      { id: 'container-layout-plan', path: 'drawings/container-layout-plan.svg', type: 'drawing', dependencies: ['design'] },
      { id: 'container-layout-elevation', path: 'drawings/container-layout-elevation.svg', type: 'drawing', dependencies: ['design'] },
      { id: 'plan-ground', path: 'drawings/plan-ground.svg', type: 'drawing', dependencies: ['design'] },
      { id: 'interior-plan', path: 'drawings/interior-plan.svg', type: 'drawing', dependencies: ['design', 'interior'] },
      { id: 'roof-plan', path: 'drawings/roof-plan.svg', type: 'drawing', dependencies: ['design', 'roof'] },
      { id: 'elevation-south', path: 'drawings/elevation-south.svg', type: 'drawing', dependencies: ['design'] },
      { id: 'section', path: 'drawings/section.svg', type: 'drawing', dependencies: ['design'] },
      { id: 'isometric', path: 'drawings/isometric.svg', type: 'drawing', dependencies: ['design', 'camera'] },
      { id: 'exterior-reference', path: 'references/exterior-reference.svg', type: 'reference', dependencies: ['design', 'camera'] }
    ];
  }

  return {
    ILLUSTRATION_SCHEMA: ILLUSTRATION_SCHEMA, SCENE_SCHEMA: SCENE_SCHEMA, GENERATOR_VERSION: GENERATOR_VERSION,
    VIEWS: VIEWS, STYLES: STYLES, SEASONS: SEASONS, TIMES: TIMES, WEATHER: WEATHER, MATERIAL_POLICIES: MATERIAL_POLICIES,
    VIEW_LABEL: VIEW_LABEL, STYLE_LABEL: STYLE_LABEL,
    stableStringify: stableStringify, hashString: hashString, designHash: designHash, presentationHash: presentationHash, sceneHash: sceneHash,
    defaultConfig: defaultConfig, validateConfig: validateConfig, siteFor: siteFor, principalView: principalView,
    worldAzimuth: worldAzimuth, entranceBearing: entranceBearing, viewAzimuth: viewAzimuth, referenceRotation: referenceRotation,
    sceneSpec: sceneSpec, promptFor: promptFor, interiorPromptFor: interiorPromptFor, negativeFor: negativeFor, descriptionFor: descriptionFor,
    validateScene: validateScene, manifest: manifest, manifestWithShared: manifestWithShared, publishedArtifactPlan: publishedArtifactPlan, sharedArtifactPlan: sharedArtifactPlan, artifactPlan: artifactPlan, unresolvedFor: unresolvedFor
  };
});
