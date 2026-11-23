/*
 * Containers Hamlet Design Lab editor.
 * No backend, no upload, no tracking. All geometry and SVG rendering are local.
 * Code licence: AGPL-3.0-or-later.
 */
(function () {
  'use strict';

  var Schema = window.DesignSchema;
  var Model = window.DesignModel;
  var DATA = window.DesignLabConcepts;
  var SITE = window.DesignLabSite;
  var Illustration = window.DesignIllustration;
  var Interior = window.DesignInterior;
  var $ = function (id) { return document.getElementById(id); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var clone = function (v) { return JSON.parse(JSON.stringify(v)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var n = function (v, d) { return Number(v).toFixed(d == null ? 1 : d); };
  var slug = function (s) { return String(s || 'container-home').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'container-home'; };

  if (!Schema || !Model || !DATA || !SITE || !Illustration || !Interior) {
    var missing = $('status');
    if (missing) missing.textContent = 'The Design Lab scripts did not load. Please reload the page.';
    return;
  }

  var EDITABLE = DATA.concepts.filter(function (c) { return c.editable; }).concat(DATA.archivePresets || []);
  var archiveLoading = null;
  var DEFAULT_PRESET_ID = 'hamlet-woodland-cottage';
  var state = {
    design: null,
    preset: null,
    history: [],
    future: [],
    selectedModule: null,
    selectedOpening: null,
    selectedZone: null,
    season: 'summer',
    editBase: null,
    arrangement: 'single',
    editStorey: 'all',
    planStorey: 'all',
    illustrationConfig: null,
    illustrationScene: null,
    illustrationGeneratedHash: null,
    illustrationReferenceSvg: null,
    editMode: 'arrangement'
  };

  var ZONE_LABEL = { sleeping: 'Sleeping', bathroom: 'Bathroom', kitchen: 'Kitchen', living: 'Living', dining: 'Dining', work: 'Workspace', storage: 'Storage', circulation: 'Circulation' };
  var FACE_LABEL = { north: 'North', south: 'South', east: 'East', west: 'West' };
  var OPENING_LABEL = { window: 'Window', door: 'Door', 'sliding-door': 'Sliding door', opening: 'Open passage' };
  var ROOF_LABEL = { solar: 'Solar array', green: 'Green roof (not offered)', membrane: 'Membrane roof' };
  var CLAD_LABEL = { timber: 'Timber rainscreen', metal: 'Reused metal', mixed: 'Timber and metal' };
  var COLOURS = [
    ['#8a6a4a', 'Weathered timber'], ['#6f6a5d', 'Charcoal timber'], ['#7a5a3d', 'Warm cedar'],
    ['#6f5a41', 'Moss brown'], ['#8c8578', 'Pale salvaged metal']
  ];

  function announce(message) { var s = $('status'); if (s) s.textContent = message; }
  function option(value, label, selected) { return '<option value="' + esc(value) + '"' + (String(value) === String(selected) ? ' selected' : '') + '>' + esc(label) + '</option>'; }

  function moduleTypeLabel(type) { return type === '20ft' ? '20-foot container' : '40-foot container'; }

  function setPath(obj, path, value) {
    var parts = path.split('.');
    var cur = obj;
    for (var i = 0; i < parts.length - 1; i++) {
      var k = parts[i];
      if (cur[k] == null) cur[k] = /^\d+$/.test(parts[i + 1]) ? [] : {};
      cur = cur[k];
    }
    var last = parts[parts.length - 1];
    if (typeof cur[last] === 'number' || /^\d+$/.test(last)) value = Number(value);
    cur[last] = value;
  }

  function currentModule() {
    if (!state.design) return null;
    return state.design.modules.filter(function (m) { return m.id === state.selectedModule; })[0] || state.design.modules[0];
  }
  function moduleIndex(id) { return state.design.modules.findIndex(function (m) { return m.id === id; }); }
  function openingFor(module, id) { return module.openings.filter(function (o) { return o.id === id; })[0]; }
  function zoneFor(module, id) { return module.zones.filter(function (z) { return z.id === id; })[0]; }

  function pushHistory(before) {
    if (!before) return;
    state.history.push(clone(before));
    if (state.history.length > 60) state.history.shift();
    state.future = [];
    updateHistoryButtons();
  }
  function updateHistoryButtons() {
    if ($('undo')) $('undo').disabled = state.history.length === 0;
    if ($('redo')) $('redo').disabled = state.future.length === 0;
  }

  function allConcepts() {
    return DATA.concepts.concat((window.DesignLabArchiveConcepts && window.DesignLabArchiveConcepts.concepts) || []);
  }
  function loadArchive() {
    if (window.DesignLabArchiveConcepts) return Promise.resolve();
    if (archiveLoading) return archiveLoading;
    archiveLoading = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = '../concepts-archive.js';
      script.onload = function () {
        if (window.DesignLabArchiveConcepts && window.DesignLabArchiveConcepts.concepts) {
          var known = {};
          DATA.concepts.forEach(function (c) { known[c.id] = true; });
          window.DesignLabArchiveConcepts.concepts.forEach(function (c) { if (!known[c.id]) DATA.concepts.push(c); });
        }
        resolve();
      };
      script.onerror = function () { archiveLoading = null; reject(new Error('The archive preset script did not load.')); };
      document.head.appendChild(script);
    });
    return archiveLoading;
  }
  function loadPreset(id, silent) {
    var concept = allConcepts().filter(function (c) { return c.id === id; })[0];
    if (!concept) {
      var meta = EDITABLE.filter(function (c) { return c.id === id; })[0];
      if (meta) {
        announce('Loading archive preset ' + meta.name + '…');
        loadArchive().then(function () { loadPreset(id, silent); }).catch(function (err) { announce(err.message); });
        return;
      }
      concept = allConcepts().filter(function (c) { return c.id === DEFAULT_PRESET_ID; })[0] || allConcepts()[0];
    }
    if (!concept) return;
    state.preset = concept.id;
    state.design = clone(concept);
    state.design.site = Object.assign({ homesite: 'a', rotation_deg: 0, note: 'Illustrative placement only; not part of the published community layout.' }, state.design.site || {});
    state.design.provenance = Object.assign({ exported_with: 'Containers Hamlet Design Lab 2.0.0' }, state.design.provenance || {});
    state.history = [];
    state.future = [];
    state.editBase = null;
    state.selectedModule = state.design.modules[0].id;
    state.selectedOpening = state.design.modules[0].openings[0] ? state.design.modules[0].openings[0].id : null;
    state.selectedZone = state.design.modules[0].zones[0] ? state.design.modules[0].zones[0].id : null;
    state.editStorey = 'all';
    state.planStorey = 'all';
    state.illustrationConfig = Illustration.defaultConfig(state.design);
    state.illustrationScene = null;
    state.illustrationGeneratedHash = null;
    state.arrangement = state.design.modules.length === 1 ? 'single' : state.design.modules.length === 2 && state.design.modules[1].rotation_deg === 90 ? 'l-shape' : state.design.modules.length === 2 ? 'parallel' : 'courtyard';
    renderAll();
    if (!silent) announce('Loaded ' + concept.name + '. Edit the controls; use Undo to step back.');
    try { history.replaceState(null, '', '?preset=' + encodeURIComponent(concept.id)); } catch (e) { /* file:// */ }
  }

  function renderAll() {
    if (!state.design) return;
    state.design = Schema.canonicalize(state.design);
    renderControls();
    renderVisuals();
    updateHistoryButtons();
  }

  function field(label, input, wide) {
    return '<label' + (wide ? ' class="wide"' : '') + '>' + esc(label) + input + '</label>';
  }
  function numberInput(path, value, id, attrs) {
    return '<input type="number" id="' + esc(id) + '" data-path="' + esc(path) + '" value="' + esc(value) + '"' + (attrs || '') + '>';
  }
  function textInput(path, value, id, attrs) {
    return '<input type="text" id="' + esc(id) + '" data-path="' + esc(path) + '" value="' + esc(value) + '"' + (attrs || '') + '>';
  }
  function selectInput(path, value, id, options) {
    return '<select id="' + esc(id) + '" data-path="' + esc(path) + '">' + options + '</select>';
  }
  function checkbox(path, checked, id, label) {
    return '<label><input type="checkbox" id="' + esc(id) + '" data-path="' + esc(path) + '"' + (checked ? ' checked' : '') + '> ' + esc(label) + '</label>';
  }

  function renderPresetOptions() {
    var sel = $('preset');
    if (!sel) return;
    sel.innerHTML = (state.preset === null ? '<option value="" selected>Imported / custom design</option>' : '') + EDITABLE.map(function (c) { return option(c.id, c.name, state.preset); }).join('');
  }

  function renderControls() {
    var d = state.design;
    renderPresetOptions();
    $('design-name').value = d.name;
    $('primary-view').value = d.primary_view_deg;
    $('arrangement').value = state.arrangement;
    $('default-colour').value = d.modules[0] ? d.modules[0].cladding.colour : '#8a6a4a';
    ['reclaimed_containers','reused_timber','replaceable_cladding','continuous_external_insulation','selective_spray_foam','reversible_connections','modular_porch','solar_ready','green_roof_investigated'].forEach(function (k) {
      var el = $('mi-' + ({ reclaimed_containers: 'reclaimed', reused_timber: 'timber', replaceable_cladding: 'cladding', continuous_external_insulation: 'insulation', selective_spray_foam: 'foam', reversible_connections: 'reversible', modular_porch: 'porch', solar_ready: 'solar', green_roof_investigated: 'green' })[k]);
      if (el) el.checked = !!d.material_intent[k];
    });
    if (!state.selectedModule || !d.modules.some(function (m) { return m.id === state.selectedModule; })) state.selectedModule = d.modules[0].id;

    $('module-controls').innerHTML = d.modules.map(function (m, i) {
      var idBase = 'm-' + i;
      return '<fieldset class="module-card" data-module-card="' + esc(m.id) + '">' +
        '<legend>Module ' + (i + 1) + ' · ' + esc(m.id) + '</legend>' +
        '<div class="field-grid">' +
        field('Type', selectInput('modules.' + i + '.type', m.type, idBase + '-type', option('40ft', '40-foot high cube', m.type) + option('20ft', '20-foot high cube', m.type))) +
        field('X position (m)', numberInput('modules.' + i + '.position_m.0', m.position_m[0], idBase + '-x', ' step="0.1"')) +
        field('Y position (m)', numberInput('modules.' + i + '.position_m.1', m.position_m[1], idBase + '-y', ' step="0.1"')) +
        field('Storey', selectInput('modules.' + i + '.storey', m.storey, idBase + '-storey', option('0', 'Ground floor (level 1)', m.storey) + option('1', 'Upper floor (level 2)', m.storey))) +
        field('Base elevation (m above grade)', numberInput('modules.' + i + '.elevation_m', m.elevation_m, idBase + '-elev', ' step="0.05" min="0" max="8"')) +
        field('Rotation (degrees)', numberInput('modules.' + i + '.rotation_deg', m.rotation_deg, idBase + '-rot', ' step="1" min="-180" max="180"')) +
        field('External insulation (mm)', numberInput('modules.' + i + '.insulation.thickness_mm', m.insulation.thickness_mm, idBase + '-ins', ' step="10" min="50" max="300"')) +
        field('Cladding', selectInput('modules.' + i + '.cladding.type', m.cladding.type, idBase + '-clad', Object.keys(CLAD_LABEL).map(function (k) { return option(k, CLAD_LABEL[k], m.cladding.type); }).join(''))) +
        field('Cladding colour', selectInput('modules.' + i + '.cladding.colour', m.cladding.colour, idBase + '-colour', COLOURS.map(function (c) { return option(c[0], c[1], m.cladding.colour); }).join(''))) +
        field('Roof', selectInput('modules.' + i + '.roof.type', m.roof.type, idBase + '-roof', Object.keys(ROOF_LABEL).map(function (k) { return option(k, ROOF_LABEL[k], m.roof.type); }).join(''))) +
        field('Solar tilt (degrees)', numberInput('modules.' + i + '.solar.tilt_deg', m.solar.tilt_deg, idBase + '-solar-tilt', ' step="1" min="0" max="75"')) +
        field('Solar azimuth (degrees)', numberInput('modules.' + i + '.solar.azimuth_deg', m.solar.azimuth_deg, idBase + '-solar-az', ' step="5" min="0" max="360"')) +
        field('Solar strategy', selectInput('modules.' + i + '.solar.season_mode', m.solar.season_mode, idBase + '-solar-season', option('year-round', 'Year-round fixed (39°)', m.solar.season_mode) + option('winter', 'Winter (60°)', m.solar.season_mode) + option('summer', 'Summer (30°)', m.solar.season_mode))) +
        field('Structural wall removal', selectInput('modules.' + i + '.structure.wall_removal', m.structure.wall_removal, idBase + '-wall', option('none', 'No large removal', m.structure.wall_removal) + option('partial', 'Partial wall removal', m.structure.wall_removal) + option('large', 'Large structural removal', m.structure.wall_removal))) +
        field('Conceptual cantilever (m)', numberInput('modules.' + i + '.structure.cantilever_m', m.structure.cantilever_m || 0, idBase + '-cant', ' step="0.1" min="0" max="2"')) +
        field('Declared support modules (ids, comma separated)', '<input type="text" id="' + idBase + '-support" data-support-refs="' + i + '" value="' + esc((m.support.references || []).join(', ')) + '" autocomplete="off">', true) +
        '</div>' + checkbox('modules.' + i + '.solar.enabled', m.solar.enabled, idBase + '-solar-enabled', 'Solar array enabled') +
        '<p class="small module-support-note">Level ' + (m.storey + 1) + ' · base ' + n(m.elevation_m, 2) + ' m · support: ' + esc(m.support.type) + (m.support.references.length ? ' (' + esc(m.support.references.join(', ')) + ')' : '') + ' · ' + (m.support.verified ? 'professionally verified with documentation' : 'not professionally verified') + '</p>' +
        '<button type="button" class="secondary" data-action="select-module" data-module="' + esc(m.id) + '">Select module for openings and rooms</button>' +
        '</fieldset>';
    }).join('');

    var moduleOptions = d.modules.map(function (m) { return option(m.id, m.id + ' · ' + moduleTypeLabel(m.type), state.selectedModule); }).join('');
    $('opening-target').innerHTML = moduleOptions;
    $('zone-target').innerHTML = moduleOptions;
    $('homesite').innerHTML = SITE.buildings.map(function (b) { return option(b.id, b.name + (b.short_name ? ' · ' + b.short_name : ''), d.site.homesite); }).join('');
    $('site-rotation').value = d.site.rotation_deg || 0;
    $('season').value = state.season;
    renderSolarSection();
    renderFoundation();
    renderFinish();
    renderFire();
    renderStoreyControls();
    renderRoofControls();
    renderAccessControls();
    renderIllustrationControls();
    renderInteriorControls();
    renderOpenings();
    renderZones();
    renderPorches();
    renderDecks();
    renderTrellises();
    renderConnections();
    renderThermal();
    renderEnvelope();
    renderVegetation();
  }

  function renderStoreyControls() {
    var d = state.design;
    var upper = d.levels.some(function (l) { return l.storey > 0; });
    var edit = $('edit-storey'), plan = $('plan-level');
    if (edit) {
      edit.innerHTML = option('all', 'All levels', state.editStorey) + option('0', 'Ground floor', state.editStorey) + option('1', 'Upper floor', state.editStorey);
      edit.value = state.editStorey;
    }
    if (plan) {
      plan.innerHTML = option('all', 'All levels (combined footprint)', state.planStorey) + option('0', 'Ground floor', state.planStorey) + option('1', 'Upper floor', state.planStorey);
      plan.value = state.planStorey;
    }
    if ($('stack-above')) $('stack-above').disabled = false;
    if ($('inspect-support')) $('inspect-support').disabled = false;
    var note = $('support-report');
    if (note && !note.getAttribute('data-rendered')) {
      note.innerHTML = '<p class="small">Select a module, then inspect its support. The report gives geometric bearing overlap and flags unsupported area; it is not a capacity calculation.</p>';
    }
  }

  function renderRoofControls() {
    var r = state.design.roof_form;
    var panel = $('roof-controls');
    if (!panel) return;
    var labels = { gable: 'Simple gable', shed: 'Shed roof', butterfly: 'Butterfly roof', flat: 'Flat roof with drainage strategy', canopy: 'Roof canopy (not an occupied floor)', green: 'Green roof concept', 'solar-ready': 'Solar-ready roof' };
    panel.innerHTML = '<div class="field-grid">' +
      field('Roof form', selectInput('roof_form.type', r.type, 'roof-type', Object.keys(labels).map(function (k) { return option(k, labels[k], r.type); }).join(''))) +
      field('Pitch (degrees)', numberInput('roof_form.pitch_deg', r.pitch_deg, 'roof-pitch', ' step="1" min="0" max="45"')) +
      field('Overhang (m)', numberInput('roof_form.overhang_m', r.overhang_m, 'roof-overhang', ' step="0.05" min="0" max="2"')) +
      field('Drainage strategy', '<textarea id="roof-drainage" data-path="roof_form.drainage" rows="2">' + esc(r.drainage) + '</textarea>', true) +
      '</div>' + checkbox('roof_form.green_roof', !!r.green_roof, 'roof-green', 'Green roof concept (adds load, drainage and fire review)') +
      '<p class="small" id="roof-note">' + esc(r.snow + ' ' + r.wind + ' ' + r.maintenance) + '</p>';
  }

  function renderAccessControls() {
    var a = state.design.access;
    var panel = $('access-controls');
    if (!panel) return;
    var stair = a.stair || {};
    var storeys = state.design.levels.length;
    panel.innerHTML = '<div class="field-grid">' +
      field('Entrance door clear width (m)', numberInput('access.entrance_door_width_m', a.entrance_door_width_m, 'access-door', ' step="0.01" min="0.6" max="3"')) +
      field('Entrance threshold (m)', numberInput('access.entrance_threshold_m', a.entrance_threshold_m, 'access-threshold', ' step="0.01" min="0" max="0.5"')) +
      field('Circulation target (m)', numberInput('access.circulation_width_m', a.circulation_width_m, 'access-circulation', ' step="0.05" min="0.6" max="4"')) +
      field('Accessibility classification', selectInput('access.classification', a.classification, 'access-classification', [
        option('fully-accessible-single-storey', 'Single-storey, step-free concept', a.classification),
        option('ground-floor-accessible-living', 'Ground-floor accessible living', a.classification),
        option('potentially-adaptable', 'Potentially adaptable', a.classification),
        option('unresolved-vertical-access', 'Unresolved vertical-access barrier', a.classification),
        option('not-assessed', 'Not assessed', a.classification)
      ].join(''))) +
      '</div>' +
      checkbox('access.step_free_entrance', a.step_free_entrance, 'access-step-free', 'Step-free entrance recorded') +
      checkbox('access.ground_floor_essential_functions', a.ground_floor_essential_functions, 'access-ground-functions', 'Essential living functions on the ground floor') +
      checkbox('access.ground_floor_bedroom', a.ground_floor_bedroom, 'access-ground-bedroom', 'Ground-floor bedroom') +
      checkbox('access.ground_floor_bathroom', a.ground_floor_bathroom, 'access-ground-bathroom', 'Ground-floor bathroom') +
      checkbox('access.adaptable_bathroom', a.adaptable_bathroom, 'access-bathroom-adaptable', 'Adaptable bathroom target') +
      checkbox('access.adaptable_kitchen', a.adaptable_kitchen, 'access-kitchen-adaptable', 'Adaptable kitchen target') +
      field('Path connection', '<textarea id="access-path" data-path="access.path_connection" rows="2">' + esc(a.path_connection) + '</textarea>', true) +
      '<h3>Vertical circulation</h3>' +
      '<p class="small">' + (storeys > 1 ? 'A two-storey home with a step-free entrance is not fully accessible. Record the stair and whether space is reserved for a future lift.' : 'Single-storey concept. A stair is not required, but the entrance and internal route still need verification.') + '</p>' +
      '<div class="field-grid">' +
      field('Stair type', selectInput('access.stair.type', stair.type || 'none', 'stair-type', ['none','straight-run','dog-leg','spiral','alternating-tread','external'].map(function (t) { return option(t, t.replace(/-/g, ' '), stair.type || 'none'); }).join(''))) +
      field('Stair module', selectInput('access.stair.module', stair.module || '', 'stair-module', option('', 'Not assigned', stair.module || '') + state.design.modules.map(function (m) { return option(m.id, m.id, stair.module || ''); }).join(''))) +
      field('Stair clear width (m)', numberInput('access.stair.width_m', stair.width_m || 0, 'stair-width', ' step="0.05" min="0" max="3"')) +
      field('Stair run (m)', numberInput('access.stair.run_m', stair.run_m || 0, 'stair-run', ' step="0.1" min="0" max="8"')) +
      field('Stair rise (m)', numberInput('access.stair.rise_m', stair.rise_m || 0, 'stair-rise', ' step="0.1" min="0" max="6"')) +
      field('Stair location', textInput('access.stair.location', stair.location || '', 'stair-location', ' maxlength="80"'), true) +
      '</div>' +
      checkbox('access.stair.present', !!stair.present, 'stair-present', 'Stair present') +
      checkbox('access.stair.landing', !!stair.landing, 'stair-landing', 'Landing recorded') +
      checkbox('access.stair.lift_reserve', !!stair.lift_reserve, 'stair-lift-reserve', 'Space and structure reserved for a future lift') +
      field('Vertical access strategy', '<textarea id="access-vertical" data-path="access.vertical_access_strategy" rows="2">' + esc(a.vertical_access_strategy) + '</textarea>', true) +
      '<p class="small" id="access-note">' + esc(a.standards) + '</p>';
  }

  function illustrationLabels() {
    return {
      views: [
        ['exterior-three-quarter', 'Exterior three-quarter'],
        ['front-approach', 'Front approach'],
        ['rear-landscape', 'Rear / landscape-facing'],
        ['elevated-isometric', 'Elevated isometric'],
        ['courtyard-porch', 'Courtyard / porch'],
        ['interior-looking-out', 'Interior looking outward (zone plan only)']
      ],
      styles: [
        ['photorealistic', 'Photorealistic'],
        ['architectural-watercolour', 'Architectural watercolour'],
        ['hand-drawn-sketch', 'Hand-drawn sketch'],
        ['presentation-rendering', 'Presentation rendering'],
        ['neutral-material-study', 'Neutral material study'],
        ['winter-visualisation', 'Winter visualisation']
      ],
      seasons: [['late-summer', 'Late summer'], ['autumn', 'Autumn'], ['winter', 'Winter'], ['spring', 'Spring']],
      times: [['early-morning', 'Early morning'], ['midday', 'Midday'], ['late-afternoon', 'Late afternoon'], ['dusk', 'Dusk']],
      weather: [['clear', 'Clear'], ['overcast', 'Overcast'], ['light-rain', 'Light rain'], ['snow', 'Snow']],
      materials: [['strict-documented', 'Strict documented materials'], ['neutral-unspecified', 'Neutral treatment of unspecified'], ['exploratory', 'Exploratory (non-authoritative)']]
    };
  }
  function renderIllustrationControls() {
    if (!state.design) return;
    if (!state.illustrationConfig) state.illustrationConfig = Illustration.defaultConfig(state.design);
    var c = state.illustrationConfig;
    var L = illustrationLabels();
    var fill = function (id, rows, value) { var el = $(id); if (!el) return; el.innerHTML = rows.map(function (r) { return option(r[0], r[1], value); }).join(''); el.value = value; };
    fill('illus-view', L.views, c.view.type);
    fill('illus-style', L.styles, c.presentation.style);
    fill('illus-season', L.seasons, c.presentation.season);
    fill('illus-time', L.times, c.presentation.time);
    fill('illus-weather', L.weather, c.presentation.weather);
    fill('illus-material-policy', L.materials, c.materialPolicy);
    if ($('illus-height')) $('illus-height').value = c.view.camera.height_m;
    if ($('illus-lens')) $('illus-lens').value = c.view.camera.lens_mm;
    if ($('illus-people')) $('illus-people').checked = !!c.presentation.people;
    renderIllustrationPreview();
  }

  function readIllustrationConfig() {
    var config = Illustration.defaultConfig(state.design);
    config.view.type = $('illus-view') ? $('illus-view').value : 'exterior-three-quarter';
    config.view.camera.height_m = Math.max(0.5, Math.min(30, Number($('illus-height') && $('illus-height').value) || 1.6));
    config.view.camera.lens_mm = Math.max(12, Math.min(200, Number($('illus-lens') && $('illus-lens').value) || 35));
    config.presentation.style = $('illus-style') ? $('illus-style').value : 'photorealistic';
    config.presentation.season = $('illus-season') ? $('illus-season').value : 'late-summer';
    config.presentation.time = $('illus-time') ? $('illus-time').value : 'late-afternoon';
    config.presentation.weather = $('illus-weather') ? $('illus-weather').value : 'clear';
    config.presentation.people = !!($('illus-people') && $('illus-people').checked);
    config.materialPolicy = $('illus-material-policy') ? $('illus-material-policy').value : 'strict-documented';
    return config;
  }

  function illustrationStale() {
    if (!state.illustrationScene) return true;
    return state.illustrationGeneratedHash !== Illustration.designHash(state.design);
  }
  function updateIllustrationFreshness() {
    var status = $('illustration-status');
    var stale = $('illustration-stale');
    if (!status) return;
    if (!state.illustrationScene) {
      status.textContent = 'Choose a viewpoint and generate a prompt. No image is generated in this browser.';
      if (stale) { stale.hidden = true; stale.textContent = ''; }
      return;
    }
    var outdated = illustrationStale();
    status.textContent = outdated ? 'Illustration prompt and reference are outdated because the design has changed. Regenerate them.' : 'Illustration prompt and reference are current for design hash ' + state.illustrationGeneratedHash + '.';
    if (stale) {
      stale.hidden = !outdated;
      stale.textContent = outdated ? 'Outdated: the design has changed since this prompt and reference were generated. The old prompt is kept below for comparison; regenerate before using it.' : '';
    }
    var host = $('illustration-reference');
    if (host) {
      if (state.illustrationReferenceSvg) host.innerHTML = state.illustrationReferenceSvg;
      else if (state.illustrationScene) host.innerHTML = '<p class="small">No reference view was stored. Generate the prompt and reference again.</p>';
    }
    var prompt = $('illustration-prompt');
    if (prompt) prompt.textContent = state.illustrationScene ? state.illustrationScene.prompt.text : '';
    var neg = $('illustration-negative');
    if (neg) neg.textContent = state.illustrationScene ? state.illustrationScene.negativePrompt.text : '';
    var summary = $('illustration-scene-summary');
    if (summary && state.illustrationScene) {
      var sc = state.illustrationScene;
      summary.innerHTML = '<h3>Facts</h3><ul>' + sc.facts.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' +
        '<h3>Intentions</h3>' + (sc.intentions.length ? '<ul>' + sc.intentions.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' : '<p class="small">None recorded.</p>') +
        '<h3>Unresolved / limitations</h3>' + (sc.unresolved.length ? '<ul>' + sc.unresolved.map(function (u) { return '<li><strong>' + esc(u.code) + ':</strong> ' + esc(u.message) + '</li>'; }).join('') + '</ul>' : '<p class="small">None recorded.</p>') +
        '<p class="small">Design hash <code>' + esc(sc.designHash) + '</code> · scene ' + esc(sc.schema) + ' · camera bearing ' + esc(sc.camera.azimuth_deg) + '°</p>';
    }
  }
  function renderIllustrationPreview() {
    if (!state.design) return;
    updateIllustrationFreshness();
  }

  function generateIllustration() {
    var config = readIllustrationConfig();
    try {
      var scene = Illustration.sceneSpec(state.design, config, SITE);
      if (!scene.validation.ok) throw new Error(scene.validation.errors.join(' '));
      state.illustrationConfig = config;
      state.illustrationScene = scene;
      state.illustrationGeneratedHash = Illustration.designHash(state.design);
      state.illustrationReferenceSvg = Model.renderReference(state.design, { view: config.view.type, rotationDeg: scene.camera.renderRotationDeg, idPrefix: 'editor-reference' });
      renderIllustrationPreview();
      announce('Illustration prompt and reference generated for the current design. The reference is a concept view; the prompt is an interpretation.');
    } catch (err) {
      announce('The illustration prompt could not be generated: ' + err.message);
    }
  }

  function illustrationNotice(message) {
    announce(message);
    if ($('illustration-status')) $('illustration-status').textContent = message;
  }
  function copyIllustrationPrompt() {
    var text = state.illustrationScene ? state.illustrationScene.prompt.text : '';
    if (!text) { illustrationNotice('Generate the prompt first.'); return; }
    var done = function () { illustrationNotice('Illustration prompt copied to the clipboard.'); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); });
    else fallbackCopy(text);
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.left = '-9999px';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); illustrationNotice('Illustration prompt copied.'); } catch (e) { illustrationNotice('Copy is unavailable; select the prompt text and copy it manually.'); }
    ta.remove();
  }

  function illustrationFileMap() {
    if (!state.illustrationScene) return null;
    var scene = state.illustrationScene;
    var config = state.illustrationConfig;
    var files = {
      'design.json': JSON.stringify(state.design, null, 2) + '\n',
      'description.md': scene.description.text + '\n',
      'scene.json': JSON.stringify(scene, null, 2) + '\n',
      'prompts/exterior.md': scene.prompt.text + '\n',
      'prompts/interior.md': scene.interiorPrompt.text + '\n',
      'prompts/negative.md': scene.negativePrompt.text + '\n',
      'prompts/illustration-config.json': JSON.stringify(config, null, 2) + '\n',
      'prompts/interior.md': '# Interior illustration prompt\n\n' + (scene.capabilities.interiorPerspective ? 'Interior perspective is available.\n' : 'Interior perspective is not available. The model has longitudinal room zones, not partitions, fixtures or camera geometry. Use the room-zone plan and describe the view as a conceptual interpretation, not a spatially accurate perspective.\n') + '\n' + scene.description.text + '\n'
    };
    var drawings = {
      'container-layout-plan.svg': Model.containerSchematicSVG(state.design, { mode: 'plan', idPrefix: 'package-container-layout' }),
      'container-layout-elevation.svg': Model.containerSchematicSVG(state.design, { mode: 'elevation', idPrefix: 'package-container-layout-elevation' }),
      'plan-ground.svg': Model.renderPlan(state.design, { idPrefix: 'package-plan-ground', storey: 0 }),
      'interior-plan.svg': state.design.interior ? Interior.planSVG(state.design, { idPrefix: 'package-interior-plan', storey: 0 }) : '',
      'roof-plan.svg': Model.roofPlanSVG(state.design, { idPrefix: 'package-roof-plan' }),
      'elevation-south.svg': Model.renderElevation(state.design, { idPrefix: 'package-elevation-south', side: 'south' }),
      'elevation-north.svg': Model.renderElevation(state.design, { idPrefix: 'package-elevation-north', side: 'north' }),
      'elevation-east.svg': Model.renderElevation(state.design, { idPrefix: 'package-elevation-east', side: 'east' }),
      'elevation-west.svg': Model.renderElevation(state.design, { idPrefix: 'package-elevation-west', side: 'west' }),
      'section.svg': Model.renderSection(state.design, { idPrefix: 'package-section' }),
      'isometric.svg': Model.renderAxo(state.design, { idPrefix: 'package-isometric' })
    };
    if (state.design.levels.length > 1) drawings['plan-upper.svg'] = Model.renderPlan(state.design, { idPrefix: 'package-plan-upper', storey: 1 });
    if (state.design.levels.length > 1 && state.design.interior) drawings['interior-plan-upper.svg'] = Interior.planSVG(state.design, { idPrefix: 'package-interior-plan-upper', storey: 1 });
    Object.keys(drawings).forEach(function (name) { files['drawings/' + name] = drawings[name]; });
    files['references/exterior-reference.svg'] = state.illustrationReferenceSvg || Model.renderReference(state.design, { view: config.view.type, rotationDeg: scene.camera.renderRotationDeg, idPrefix: 'package-reference' });
    files['illustrations/README.md'] = '# Illustrations\n\nNo AI-generated image is included. Use `prompts/exterior.md` and `references/exterior-reference.svg` with an external image-generation tool. Treat the result as an interpretation, not a measured architectural drawing.\n';
    var artifacts = Object.keys(files).filter(function (p) { return p !== 'manifest.json'; }).map(function (p) {
      return { id: p.replace(/[^a-z0-9]+/gi, '-'), path: p, type: p.indexOf('drawings/') === 0 ? 'drawing' : p.indexOf('references/') === 0 ? 'reference' : p.indexOf('prompts/') === 0 ? 'prompt' : 'metadata', dependencies: p === 'design.json' ? ['design'] : ['design', 'scene', 'presentation'], hash: Illustration.hashString(files[p]) };
    });
    files['manifest.json'] = JSON.stringify(Illustration.manifest(scene, state.design, artifacts, new Date().toISOString()), null, 2) + '\n';
    return files;
  }

  function downloadIllustrationPrompt() {
    if (!state.illustrationScene) { announce('Generate the prompt first.'); return; }
    download(slug(state.design.name) + '-illustration-prompt.md', state.illustrationScene.prompt.text + '\n', 'text/markdown');
    announce('Downloaded the illustration prompt.');
  }
  function downloadIllustrationConfig() {
    var config = state.illustrationConfig || readIllustrationConfig();
    download(slug(state.design.name) + '-illustration-config.json', JSON.stringify(config, null, 2) + '\n', 'application/json');
    announce('Downloaded the illustration configuration.');
  }
  function downloadIllustrationPackage() {
    if (!state.illustrationScene) { announce('Generate the prompt and reference first.'); return; }
    var files = illustrationFileMap();
    if (!files) return;
    var entries = Object.keys(files).map(function (name) { return { name: name, data: files[name] }; });
    var blob = zip(entries);
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = slug(state.design.name) + '-illustration-package.zip';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    announce('Downloaded the illustration package: design, description, scene, prompts, drawings, reference and manifest.');
  }

  function interiorRoomBox(r) {
    var xs = r.polygon.map(function (p) { return p[0]; }), ys = r.polygon.map(function (p) { return p[1]; });
    return { x: (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2, y: (Math.min.apply(null, ys) + Math.max.apply(null, ys)) / 2, w: Math.max.apply(null, xs) - Math.min.apply(null, xs), d: Math.max.apply(null, ys) - Math.min.apply(null, ys) };
  }
  function renderInteriorControls() {
    var d = state.design;
    var host = $('interior-rooms');
    var details = $('interior-details');
    var status = $('interior-status');
    if (!host || !status) return;
    if (!d.interior) {
      status.textContent = 'No interior spatial model. The room bands remain available; create a provisional interior or import one.';
      host.innerHTML = '<p class="small">No room polygons. Use “Create provisional interior from room bands” to start, then refine rooms, partitions, doors and fixtures.</p>';
      if (details) details.innerHTML = '';
      return;
    }
    var v = Interior.validate(d);
    var a = Interior.accessibilityEvidence(d);
    status.textContent = d.interior.status + ' interior · ' + d.interior.rooms.length + ' rooms · ' + v.invalid.length + ' invalid, ' + v.unresolved.length + ' unresolved, ' + v.review.length + ' review · accessibility: ' + a.classification.replace(/-/g, ' ') + '.';
    host.innerHTML = d.interior.rooms.map(function (r, i) {
      var box = interiorRoomBox(r);
      var base = 'ir-' + i;
      return '<fieldset class="module-card interior-room-card" data-interior-room="' + esc(r.id) + '"><legend>' + esc(r.name) + ' · ' + esc(r.module) + '</legend><div class="field-grid">' +
        field('Name', textInput('', r.name, base + '-name', ' maxlength="60" data-interior-room-field="name"'), true) +
        field('Type', selectInput('', r.type, base + '-type', Interior.ROOM_TYPES.map(function (t) { return option(t, t, r.type); }).join(''))) +
        field('Centre x (m)', numberInput('', box.x, base + '-x', ' step="0.05" data-interior-room-field="x"')) +
        field('Centre y (m)', numberInput('', box.y, base + '-y', ' step="0.05" data-interior-room-field="y"')) +
        field('Width (m)', numberInput('', box.w, base + '-w', ' step="0.05" min="0.3" data-interior-room-field="w"')) +
        field('Depth (m)', numberInput('', box.d, base + '-d', ' step="0.05" min="0.3" data-interior-room-field="d"')) +
        '</div><p class="small">' + esc(r.provenance || 'authored') + ' · ' + n(Interior.polygonArea(r.polygon), 2) + ' m² · ' + esc(r.type) + '</p>' +
        '<button type="button" class="secondary" data-action="remove-interior-room" data-room="' + esc(r.id) + '">Remove ' + esc(r.name) + '</button></fieldset>';
    }).join('');
    if (details) {
      var parts = (d.interior.partitions || []).map(function (p) {
        return '<div class="interior-detail"><strong>' + esc(p.id) + '</strong> · ' + esc(p.module) + ' · ' + n(p.from[0], 2) + ',' + n(p.from[1], 2) + ' → ' + n(p.to[0], 2) + ',' + n(p.to[1], 2) + ' · ' + n(p.thickness_m, 2) + ' m <button type="button" class="secondary" data-action="remove-partition" data-id="' + esc(p.id) + '">Remove</button></div>';
      }).join('');
      var doors = (d.interior.doors || []).map(function (x) {
        return '<div class="interior-detail"><strong>' + esc(x.id) + '</strong> · ' + esc(x.partition) + ' · ' + n(x.width_m, 2) + ' m · connects ' + esc((x.connects || []).join(' / ')) + ' <button type="button" class="secondary" data-action="remove-door" data-id="' + esc(x.id) + '">Remove</button></div>';
      }).join('');
      var fixtures = (d.interior.fixtures || []).map(function (f) {
        return '<div class="interior-detail"><strong>' + esc(f.id) + '</strong> · ' + esc(f.type) + ' in ' + esc(f.room) + ' · ' + n(f.position_m[0], 2) + ',' + n(f.position_m[1], 2) + ' m <button type="button" class="secondary" data-action="remove-fixture" data-id="' + esc(f.id) + '">Remove</button></div>';
      }).join('');
      details.innerHTML = '<h4>Partitions</h4>' + (parts || '<p class="small">None.</p>') + '<h4>Doors</h4>' + (doors || '<p class="small">None.</p>') + '<h4>Fixtures</h4>' + (fixtures || '<p class="small">None.</p>') + '<h4>Validation</h4>' + (v.items.length ? '<ul>' + v.items.map(function (i) { return '<li><strong>' + esc(i.category.replace(/-/g, ' ')) + ' · ' + esc(i.code) + ':</strong> ' + esc(i.message) + '</li>'; }).join('') + '</ul>' : '<p class="small">No validation issues.</p>');
    }
  }

  function ensureInterior() {
    if (state.design.interior) { announce('This design already has an interior spatial model.'); return; }
    mutate(function () {
      var migrated = Interior.fromZones(state.design);
      state.design.interior = migrated;
    }, 'Provisional interior created from the room bands. Inferred room polygons are marked; partitions, doors and fixtures are not invented.');
  }
  function addInteriorRoom() {
    var d = state.design;
    if (!d.interior) { ensureInterior(); return; }
    var m = d.modules[0];
    mutate(function () {
      var id = nextId('room', d.interior.rooms.map(function (r) { return r.id; }));
      d.interior.rooms.push({ id: id, name: 'New room', type: 'living', module: m.id, level: m.storey, polygon: Interior.rectPolygon(0, 0, 1.8, 1.6), provenance: 'authored', openingIds: [], accessibility: { assessment: 'not-verified', notes: '' } });
      d.interior.status = 'authored';
    }, 'Room added at the module centre. Adjust its numeric position and size; it may overlap until placed.');
  }
  function addPartition() {
    if (!state.design.interior) { ensureInterior(); return; }
    var m = state.design.modules[0];
    var env = Interior.clearEnvelope(m);
    mutate(function () {
      var id = nextId('part', state.design.interior.partitions.map(function (p) { return p.id; }));
      state.design.interior.partitions.push({ id: id, module: m.id, from: [0, env.minY], to: [0, env.maxY], thickness_m: 0.1, type: 'partition' });
      state.design.interior.status = 'authored';
    }, 'Partition added at the module centre. Adjust its endpoints and add a door if needed.');
  }
  function addInteriorDoor() {
    var int = state.design.interior;
    if (!int || !int.partitions.length) { announce('Add a partition before adding a door.'); return; }
    var p = int.partitions[0];
    var rooms = int.rooms.filter(function (r) { return r.module === p.module; });
    if (rooms.length < 2) { announce('Two rooms in the same module are needed before adding a door.'); return; }
    mutate(function () {
      var id = nextId('door', int.doors.map(function (x) { return x.id; }));
      int.doors.push({ id: id, partition: p.id, type: 'swing', width_m: 0.9, position_m: 0.5, connects: [rooms[0].id, rooms[1].id], swing: 'in', provenance: 'authored' });
      int.status = 'authored';
    }, 'Interior door added. Check that the two rooms and the partition are correct; the validation will report a blocked or invalid door.');
  }
  function addFixture() {
    var int = state.design.interior;
    if (!int || !int.rooms.length) { ensureInterior(); return; }
    var room = int.rooms[0];
    mutate(function () {
      var id = nextId('fix', int.fixtures.map(function (f) { return f.id; }));
      var type = room.type === 'bathroom' ? 'wc' : 'table';
      int.fixtures.push({ id: id, room: room.id, type: type, position_m: [0, 0], rotation_deg: 0, size_m: type === 'wc' ? [0.45, 0.5] : [0.8, 0.8], provenance: 'authored' });
      int.status = 'authored';
    }, 'Fixture added at the room centre. Adjust its position and size; check that it is inside the room and clear of doors.');
  }
  function removeInteriorItem(kind, id) {
    mutate(function () {
      var int = state.design.interior;
      if (kind === 'room') { int.rooms = int.rooms.filter(function (r) { return r.id !== id; }); int.doors = int.doors.filter(function (x) { return (x.connects || []).indexOf(id) < 0; }); int.fixtures = int.fixtures.filter(function (f) { return f.room !== id; }); int.clearances = int.clearances.filter(function (c) { return c.room !== id; }); }
      if (kind === 'partition') { int.partitions = int.partitions.filter(function (p) { return p.id !== id; }); var removed = int.doors.filter(function (d) { return d.partition === id; }).map(function (d) { return d.id; }); int.doors = int.doors.filter(function (d) { return d.partition !== id; }); }
      if (kind === 'door') int.doors = int.doors.filter(function (d) { return d.id !== id; });
      if (kind === 'fixture') int.fixtures = int.fixtures.filter(function (f) { return f.id !== id; });
    }, 'Interior element removed. Undo is available.');
  }

  function renderOpenings() {
    var m = currentModule();
    var panel = $('opening-controls');
    if (!m) { panel.innerHTML = '<p>No container.</p>'; return; }
    if (!m.openings.length) { panel.innerHTML = '<p>No openings on ' + esc(m.id) + '. Add a window or door.</p>'; return; }
    panel.innerHTML = m.openings.map(function (o, i) {
      var base = 'op-' + m.id + '-' + i;
      var idx = m.openings.indexOf(o);
      return '<fieldset class="opening-card" data-opening-id="' + esc(o.id) + '"><legend>' + esc(o.name || o.id) + '</legend><div class="field-grid">' +
        field('Name', textInput('modules.' + moduleIndex(m.id) + '.openings.' + idx + '.name', o.name || '', base + '-name', ' maxlength="60"'), true) +
        field('Face', selectInput('modules.' + moduleIndex(m.id) + '.openings.' + idx + '.face', o.face, base + '-face', Object.keys(FACE_LABEL).map(function (k) { return option(k, FACE_LABEL[k], o.face); }).join(''))) +
        field('Type', selectInput('modules.' + moduleIndex(m.id) + '.openings.' + idx + '.type', o.type, base + '-type', Object.keys(OPENING_LABEL).map(function (k) { return option(k, OPENING_LABEL[k], o.type); }).join(''))) +
        field('Position (m)', numberInput('modules.' + moduleIndex(m.id) + '.openings.' + idx + '.position_m', o.position_m, base + '-pos', ' step="0.05"')) +
        field('Width (m)', numberInput('modules.' + moduleIndex(m.id) + '.openings.' + idx + '.width_m', o.width_m, base + '-w', ' step="0.05" min="0.3"')) +
        field('Height (m)', numberInput('modules.' + moduleIndex(m.id) + '.openings.' + idx + '.height_m', o.height_m, base + '-h', ' step="0.05" min="0.3"')) +
        field('Sill (m)', numberInput('modules.' + moduleIndex(m.id) + '.openings.' + idx + '.sill_m', o.sill_m, base + '-sill', ' step="0.05" min="0"')) +
        '</div><button type="button" class="secondary" data-action="remove-opening" data-id="' + esc(o.id) + '">Remove ' + esc(o.id) + '</button></fieldset>';
    }).join('');
  }

  function renderZones() {
    var m = currentModule();
    var panel = $('zone-controls');
    if (!m) { panel.innerHTML = '<p>No container.</p>'; return; }
    if (!m.zones.length) { panel.innerHTML = '<p>No room zones on ' + esc(m.id) + '. Add a room band.</p>'; return; }
    panel.innerHTML = m.zones.map(function (z, i) {
      var base = 'zone-' + m.id + '-' + i;
      var idx = m.zones.indexOf(z);
      return '<fieldset class="zone-card" data-zone-id="' + esc(z.id) + '"><legend>' + esc(z.name) + '</legend><div class="field-grid">' +
        field('Name', textInput('modules.' + moduleIndex(m.id) + '.zones.' + idx + '.name', z.name, base + '-name', ' maxlength="60"')) +
        field('Type', selectInput('modules.' + moduleIndex(m.id) + '.zones.' + idx + '.type', z.type, base + '-type', Object.keys(ZONE_LABEL).map(function (k) { return option(k, ZONE_LABEL[k], z.type); }).join(''))) +
        field('Start (m)', numberInput('modules.' + moduleIndex(m.id) + '.zones.' + idx + '.start_m', z.start_m, base + '-start', ' step="0.1"')) +
        field('End (m)', numberInput('modules.' + moduleIndex(m.id) + '.zones.' + idx + '.end_m', z.end_m, base + '-end', ' step="0.1"')) +
        field('Accessibility note', '<textarea id="' + base + '-access" data-path="modules.' + moduleIndex(m.id) + '.zones.' + idx + '.accessibility" rows="2">' + esc(z.accessibility || '') + '</textarea>', true) +
        '</div><button type="button" class="secondary" data-action="remove-zone" data-id="' + esc(z.id) + '">Remove ' + esc(z.name) + '</button></fieldset>';
    }).join('');
  }

  function renderPorches() {
    var d = state.design;
    var panel = $('porch-controls');
    if (!d.porches.length) { panel.innerHTML = '<p>No porch. Add a screened outdoor room.</p>'; return; }
    panel.innerHTML = d.porches.map(function (p, i) {
      var base = 'porch-' + i;
      return '<fieldset class="porch-card"><legend>Porch ' + esc(p.id) + '</legend><div class="field-grid">' +
        field('Module', selectInput('porches.' + i + '.module', p.module, base + '-module', d.modules.map(function (m) { return option(m.id, m.id, p.module); }).join(''))) +
        field('Face', selectInput('porches.' + i + '.face', p.face, base + '-face', Object.keys(FACE_LABEL).map(function (k) { return option(k, FACE_LABEL[k], p.face); }).join(''))) +
        field('Start (m)', numberInput('porches.' + i + '.start_m', p.start_m, base + '-start', ' step="0.1" min="0"')) +
        field('Length (m)', numberInput('porches.' + i + '.length_m', p.length_m, base + '-length', ' step="0.1" min="0.5"')) +
        field('Depth (m)', numberInput('porches.' + i + '.depth_m', p.depth_m, base + '-depth', ' step="0.1" min="0" max="5"')) +
        '</div>' + checkbox('porches.' + i + '.screened', p.screened, base + '-screened', 'Insect-screened') +
        checkbox('porches.' + i + '.roof', p.roof, base + '-roof', 'Covered') +
        '<button type="button" class="secondary" data-action="remove-porch" data-index="' + i + '">Remove this porch</button></fieldset>';
    }).join('');
  }

  function renderDecks() {
    var d = state.design;
    var panel = $('deck-controls');
    if (!d.decks.length) { panel.innerHTML = '<p>No deck. Add a deck beyond a porch.</p>'; return; }
    panel.innerHTML = d.decks.map(function (dk, i) {
      var base = 'deck-' + i;
      return '<fieldset class="deck-card"><legend>Deck ' + esc(dk.id) + '</legend><div class="field-grid">' +
        field('Porch', selectInput('decks.' + i + '.porch', dk.porch, base + '-porch', d.porches.map(function (p) { return option(p.id, p.id, dk.porch); }).join(''))) +
        field('Projection beyond porch (m)', numberInput('decks.' + i + '.projection_m', dk.projection_m, base + '-projection', ' step="0.1" min="0" max="3"')) +
        '</div><button type="button" class="secondary" data-action="remove-deck" data-index="' + i + '">Remove this deck</button></fieldset>';
    }).join('');
  }

  function renderThermal() {
    var t = state.design.thermal;
    var panel = $('thermal-controls');
    if (!panel) return;
    panel.innerHTML = '<div class="field-grid">' +
      field('Roof insulation (mm)', numberInput('thermal.roof_insulation_mm', t.roof_insulation_mm, 'thermal-roof', ' step="10" min="50" max="600"')) +
      field('Floor insulation (mm)', numberInput('thermal.floor_insulation_mm', t.floor_insulation_mm, 'thermal-floor', ' step="10" min="50" max="500"')) +
      field('Window performance', selectInput('thermal.window_performance', t.window_performance, 'thermal-window', option('triple glazed, low-e, argon, thermally broken frames', 'Triple glazed', t.window_performance) + option('double glazed, low-e, thermally broken frames', 'Double glazed', t.window_performance) + option('not decided', 'Not decided', t.window_performance))) +
      field('External shading', selectInput('thermal.external_shading', t.external_shading, 'thermal-shade', option('fixed overhang and deciduous planting', 'Overhang + planting', t.external_shading) + option('seasonal shutters or screens', 'Seasonal screens', t.external_shading) + option('none or not decided', 'None / not decided', t.external_shading))) +
      field('Air and vapour control', selectInput('thermal.air_vapour_control', t.air_vapour_control, 'thermal-air', option('exterior-insulated, vapour-open assembly; sealed interior air barrier (to be detailed)', 'Exterior insulated', t.air_vapour_control) + option('interior vapour-retarder with sealed service penetrations (to be detailed)', 'Interior vapour retarder', t.air_vapour_control) + option('not decided', 'Not decided', t.air_vapour_control))) +
      field('Thermal bridge mitigation', selectInput('thermal.thermal_bridge_mitigation', t.thermal_bridge_mitigation, 'thermal-bridge', option('continuous external insulation and thermal breaks at openings and pile caps', 'Continuous + breaks', t.thermal_bridge_mitigation) + option('partial mitigation; junctions to be reviewed', 'Partial mitigation', t.thermal_bridge_mitigation) + option('not decided', 'Not decided', t.thermal_bridge_mitigation))) +
      field('Heating', selectInput('thermal.heating', t.heating, 'thermal-heat', option('cold-climate air-source heat pump', 'Cold-climate heat pump', t.heating) + option('heat pump with backup', 'Heat pump + backup', t.heating) + option('not decided', 'Not decided', t.heating))) +
      '</div>' + checkbox('thermal.rainscreen_ventilation', t.rainscreen_ventilation, 'thermal-rainscreen', 'Ventilated rainscreen and replaceable cladding') + checkbox('thermal.heat_recovery_ventilation', t.heat_recovery_ventilation, 'thermal-hrv', 'Heat-recovery ventilation (HRV/ERV)');
  }

  function renderFoundation() {
    var f = state.design.foundation;
    var panel = $('foundation-controls');
    if (!panel) return;
    var labels = { 'helical-piles': 'Engineered helical piles', 'ground-screws': 'Ground screws (light structures)', 'concrete-piers': 'Concrete piers', 'timber-posts': 'Timber posts (decks)', 'bedrock-anchors': 'Bedrock anchors' };
    panel.innerHTML = '<div class="field-grid">' +
      field('System', selectInput('', f.system, 'foundation-system', Object.keys(labels).map(function (k) { return option(k, labels[k], f.system); }).join(''))) +
      field('Floor clearance (m)', numberInput('', f.clearance_m, 'foundation-clearance', ' step="0.05" min="0" max="2"')) +
      '</div>' +
      checkbox('', f.no_compaction, 'foundation-no-compaction', 'No fill, no slab and no compaction') +
      checkbox('', f.independent_deck, 'foundation-independent-deck', 'Independent decks and porches') +
      '<p class="small">' + esc(f.note) + '</p>';
    $('foundation-section').innerHTML = Model.foundationSectionSVG(state.design, { idPrefix: 'editor-foundation' });
  }

  function applyFoundationChoice() {
    var system = $('foundation-system').value;
    var clearance = Math.max(0, Math.min(2, Number($('foundation-clearance').value) || 0.6));
    var noCompaction = $('foundation-no-compaction').checked;
    var independentDeck = $('foundation-independent-deck').checked;
    mutate(function () {
      state.design.foundation.system = system;
      state.design.foundation.clearance_m = clearance;
      state.design.foundation.no_compaction = noCompaction;
      state.design.foundation.independent_deck = independentDeck;
    }, 'Foundation changed. Recheck soil, frost uplift, corrosion, lateral capacity, slope stability, permits and conservation-authority requirements.');
  }

  var PAINT_PALETTES = [
    { id: 'forest-ochre', label: 'Forest green / ochre trim', body: '#2f7d5f', trim: '#e5b21c', sheen: 'satin', note: 'Light-responsive body colour; bright trim marks the entry.' },
    { id: 'charcoal-cedar', label: 'Charcoal / cedar trim', body: '#3f4a45', trim: '#b07a45', sheen: 'satin', note: 'Dark body with warm trim; heat gain and visibility at the entry need review.' },
    { id: 'oxide-cream', label: 'Oxide red / cream trim', body: '#9a4e3a', trim: '#efe2c4', sheen: 'matte', note: 'High-contrast entry; confirm fade and touch-up.' },
    { id: 'chalk-black', label: 'Chalk / black trim', body: '#d9d4c5', trim: '#202826', sheen: 'matte', note: 'Light body, dark trim; glare and dirt showing need review.' },
    { id: 'marine-sand', label: 'Marine blue / sand trim', body: '#2f6473', trim: '#d8b878', sheen: 'satin', note: 'Cool body with warm entry; check salt/chloride exposure if near water.' }
  ];

  function renderFinish() {
    var d = state.design, panel = $('finish-controls');
    if (!panel) return;
    var f = d.entry_shelter || {};
    var palette = d.paint && PAINT_PALETTES.some(function (p) { return p.id === d.paint.id; }) ? d.paint.id : 'custom';
    panel.innerHTML = '<div class="field-grid">' +
      field('Paint palette', selectInput('', palette, 'paint-palette', option('custom', 'Keep current colours', palette) + PAINT_PALETTES.map(function (p) { return option(p.id, p.label, palette); }).join(''))) +
      field('Shelter side', selectInput('', f.side || 'north', 'shelter-side', ['north','south','east','west'].map(function (v) { return option(v, v, f.side || 'north'); }).join(''))) +
      field('Shelter width (m)', numberInput('', f.width_m || 2.2, 'shelter-width', ' step="0.1" min="0.8" max="4"')) +
      field('Projection (m)', numberInput('', f.projection_m || 1.2, 'shelter-projection', ' step="0.05" min="0.4" max="2.5"')) +
      '</div>' +
      checkbox('', !!f.enabled, 'shelter-enabled', 'Reused container-door canopy') +
      checkbox('', !!f.security_shutters, 'shelter-shutters', 'Open door leaves as security shutters') +
      '<p class="small" id="finish-note">' + esc((d.paint && d.paint.note) || 'Choose a palette. Paint colour is not a security or durability guarantee.') + '</p>';
  }

  function applyFinishChoice() {
    var palette = $('paint-palette').value;
    var chosen = PAINT_PALETTES.filter(function (p) { return p.id === palette; })[0];
    var side = $('shelter-side').value;
    var width = Math.max(0.8, Math.min(4, Number($('shelter-width').value) || 2.4));
    var projection = Math.max(0.4, Math.min(2.5, Number($('shelter-projection').value) || 1.2));
    var enabled = $('shelter-enabled').checked;
    var shutters = $('shelter-shutters').checked;
    mutate(function () {
      if (chosen) {
        state.design.modules.forEach(function (m) {
          m.cladding.colour = chosen.body;
          m.frame_colour = chosen.trim;
        });
        state.design.paint = { id: chosen.id, name: chosen.label, body: chosen.body, trim: chosen.trim, sheen: chosen.sheen, note: chosen.note };
      }
      state.design.entry_shelter.side = side;
      state.design.entry_shelter.width_m = width;
      state.design.entry_shelter.projection_m = projection;
      state.design.entry_shelter.enabled = enabled;
      state.design.entry_shelter.security_shutters = shutters;
    }, 'Paint and entry shelter updated. Hinges, wind, snow, egress and lock strategy still need review.');
  }

  function renderFire() {
    var f = state.design.fire, panel = $('fire-controls');
    if (!panel) return;
    panel.innerHTML = '<div class="field-grid">' +
      field('Roof class', selectInput('', f.roof_class, 'fire-roof', option('A', 'Class A / most resistant', f.roof_class) + option('B', 'Class B', f.roof_class) + option('C', 'Class C / least resistant', f.roof_class))) +
      field('Defensible space (m)', numberInput('', f.defensible_space_m, 'fire-space', ' step="1" min="0" max="100"')) +
      '</div>' +
      checkbox('', f.noncombustible_eaves, 'fire-eaves', 'Noncombustible, closed eaves and soffits') +
      checkbox('', f.ember_resistant_vents, 'fire-vents', 'Ember-resistant vents and screening') +
      checkbox('', f.tempered_glazing, 'fire-glazing', 'Tempered or laminated glazing') +
      checkbox('', f.noncombustible_deck, 'fire-deck', 'Noncombustible deck and porch surface') +
      checkbox('', f.exterior_shutters, 'fire-shutters', 'Exterior shutters or fire-rated covers') +
      checkbox('', f.water_access, 'fire-water', 'Fire access and water supply confirmed') +
      '<p class="small">' + esc(f.note) + ' The model does not calculate fire resistance, radiant heat, ember exposure or sprinkler performance.</p>';
  }

  function applyFireChoice() {
    mutate(function () {
      state.design.fire.roof_class = $('fire-roof').value;
      state.design.fire.defensible_space_m = Math.max(0, Math.min(100, Number($('fire-space').value) || 0));
      state.design.fire.noncombustible_eaves = $('fire-eaves').checked;
      state.design.fire.ember_resistant_vents = $('fire-vents').checked;
      state.design.fire.tempered_glazing = $('fire-glazing').checked;
      state.design.fire.noncombustible_deck = $('fire-deck').checked;
      state.design.fire.exterior_shutters = $('fire-shutters').checked;
      state.design.fire.water_access = $('fire-water').checked;
    }, 'Fire-resilience measures updated. This is not a fire-resistance rating or WUI approval.');
  }

  function renderSolarSection() {
    var panel = $('solar-section');
    var m = currentModule();
    if (!panel || !m) return;
    if (!m.solar.enabled) { panel.innerHTML = '<p class="small">Solar is disabled for this module. Choose a solar roof, then enable the array.</p>'; return; }
    panel.innerHTML = Model.solarSectionSVG(state.design, m.id, { idPrefix: 'editor-solar' });
  }

  function renderEnvelope() {
    var d = state.design;
    var env = d.envelope;
    var panel = $('envelope-controls');
    if (!panel) return;
    var labels = Model.ENVELOPE_LABEL || {};
    var assemblyOptions = Object.keys(labels).map(function (k) { return option(k, labels[k], env.assembly); }).join('');
    var mm = env.layers.filter(function (l) { return l.role === 'insulation'; }).reduce(function (t, l) { return t + l.thickness_mm; }, 0);
    var bridge = /continuous/i.test(env.thermal_breaks) ? 'continuous' : /partial/i.test(env.thermal_breaks) ? 'partial' : 'not decided';
    var air = /exterior-insulated/i.test(env.air_vapour_control) ? 'exterior' : /interior/i.test(env.air_vapour_control) ? 'interior' : 'not decided';
    var fire = /review/i.test(env.fire) ? 'review' : 'not decided';
    panel.innerHTML = '<div class="field-grid">' +
      field('Assembly', selectInput('', env.assembly, 'env-assembly', assemblyOptions)) +
      field('Insulation (mm)', numberInput('', mm, 'env-thickness', ' step="10" min="60" max="300"')) +
      field('Rainscreen cavity (mm)', numberInput('', env.rainscreen.cavity_mm || 25, 'env-cavity', ' step="5" min="15" max="60"')) +
      field('Thermal breaks', selectInput('', bridge, 'env-bridge', option('continuous', 'Continuous', bridge) + option('partial', 'Partial mitigation', bridge) + option('not decided', 'Not decided', bridge))) +
      field('Air and vapour', selectInput('', air, 'env-air', option('exterior', 'Exterior insulated', air) + option('interior', 'Interior vapour retarder', air) + option('not decided', 'Not decided', air))) +
      field('Fire review', selectInput('', fire, 'env-fire', option('review', 'Fire review', fire) + option('not decided', 'Not decided', fire))) +
      '</div>' +
      '<p class="small">The layers below are conceptual. Long fasteners, fire, moisture, maintenance and structural penetrations need engineering review.</p>';
    $('wall-section').innerHTML = Model.wallSectionSVG(d, state.selectedModule, { idPrefix: 'editor-wall' });
  }

  function applyEnvelopeChoice() {
    var assembly = $('env-assembly').value;
    var mm = Math.max(60, Math.min(300, Number($('env-thickness').value) || 150));
    var cavity = Math.max(15, Math.min(60, Number($('env-cavity').value) || 25));
    var bridge = $('env-bridge').value;
    var air = $('env-air').value;
    var fire = $('env-fire').value;
    var cladding = currentModule() ? currentModule().cladding.type : 'timber';
    mutate(function () {
      var env = Model.envelopeFor(assembly, mm, cladding);
      env.rainscreen.cavity_mm = cavity;
      env.thermal_breaks = bridge === 'continuous' ? 'continuous external insulation with thermal washers and stainless fasteners; breaks at openings, pile caps and service penetrations' : bridge === 'partial' ? 'partial thermal-break mitigation; junctions to be reviewed' : 'thermal-break strategy not decided';
      env.air_vapour_control = air === 'exterior' ? 'exterior-insulated, vapour-open assembly with a sealed interior air barrier; joints and service penetrations to be detailed' : air === 'interior' ? 'interior vapour-retarder with sealed service penetrations (to be detailed)' : 'air and vapour control strategy not decided';
      env.fire = fire === 'review' ? 'combustible insulation, cladding and cavity need a fire review; cavity barriers, cladding classification and separation are not resolved' : 'fire strategy not decided';
      state.design.envelope = env;
      state.design.thermal.wall_insulation_strategy = env.layers.filter(function (l) { return l.role === 'insulation'; }).map(function (l) { return l.material; }).join(' + ') + ' (' + mm + ' mm) with thermal breaks and a ventilated rainscreen';
      state.design.thermal.thermal_bridge_mitigation = env.thermal_breaks;
      state.design.thermal.air_vapour_control = env.air_vapour_control;
      state.design.thermal.rainscreen_ventilation = !!env.rainscreen.ventilated;
      state.design.modules.forEach(function (m) { m.insulation.thickness_mm = mm; m.insulation.type = env.layers.filter(function (l) { return l.role === 'insulation'; }).map(function (l) { return l.material; }).join(' + '); });
    }, 'Envelope assembly updated. The wall section and warnings have changed; professional review is still required.');
  }

  function renderVegetation() {
    var d = state.design;
    var panel = $('vegetation-controls');
    if (!panel) return;
    if (!d.vegetation.length) { panel.innerHTML = '<p>No living wall, edible planter wall or evergreen privacy screen. The climbing-plant trellis is in the outdoor controls above.</p>'; return; }
    panel.innerHTML = d.vegetation.map(function (v, i) {
      var base = 'vegetation-' + i;
      var labels = Model.VEG_LABEL || {};
      return '<fieldset class="vegetation-card"><legend>' + esc(labels[v.type] || v.type) + ' · ' + esc(v.id) + '</legend><div class="field-grid">' +
        field('System', selectInput('vegetation.' + i + '.type', v.type, base + '-type', Object.keys(labels).filter(function (k) { return k !== 'trellis'; }).map(function (k) { return option(k, labels[k], v.type); }).join(''))) +
        field('Module', selectInput('vegetation.' + i + '.module', v.module, base + '-module', d.modules.map(function (m) { return option(m.id, m.id, v.module); }).join(''))) +
        field('Face', selectInput('vegetation.' + i + '.face', v.face, base + '-face', Object.keys(FACE_LABEL).map(function (k) { return option(k, FACE_LABEL[k], v.face); }).join(''))) +
        field('Start (m)', numberInput('vegetation.' + i + '.start_m', v.start_m, base + '-start', ' step="0.1" min="0"')) +
        field('Length (m)', numberInput('vegetation.' + i + '.length_m', v.length_m, base + '-length', ' step="0.1" min="0.5"')) +
        field('Height (m)', numberInput('vegetation.' + i + '.height_m', v.height_m, base + '-height', ' step="0.1" min="0.5" max="6"')) +
        field('Clearance (m)', numberInput('vegetation.' + i + '.offset_m', v.offset_m, base + '-offset', ' step="0.05" min="0.3" max="2"')) +
        field('Plant type', textInput('vegetation.' + i + '.plant_type', v.plant_type, base + '-plant')) +
        field('Mature height (m)', numberInput('vegetation.' + i + '.mature_height_m', v.mature_height_m, base + '-mature', ' step="0.1" min="0.5" max="8"')) +
        field('Seasonal foliage', selectInput('vegetation.' + i + '.seasonal_foliage', v.seasonal_foliage, base + '-foliage', option('evergreen', 'Evergreen', v.seasonal_foliage) + option('deciduous', 'Deciduous', v.seasonal_foliage) + option('mixed', 'Mixed', v.seasonal_foliage))) +
        field('Irrigation', selectInput('vegetation.' + i + '.irrigation', v.irrigation, base + '-irrigation', option('drip with recirculation', 'Drip / recirculating', v.irrigation) + option('drip and hand watering', 'Drip and hand watering', v.irrigation) + option('establishment watering only', 'Establishment only', v.irrigation) + option('none', 'None / not decided', v.irrigation))) +
        field('Support', textInput('vegetation.' + i + '.support', v.support, base + '-support')) +
        field('Maintenance', textInput('vegetation.' + i + '.maintenance', v.maintenance, base + '-maintenance', ' class="wide"')) +
        '</div><button type="button" class="secondary" data-action="remove-vegetation" data-index="' + i + '">Remove this system</button></fieldset>';
    }).join('');
  }

  function addVegetation() {
    var m = currentModule();
    if (!m) return;
    var type = 'living-wall';
    mutate(function () {
      state.design.vegetation.push({ id: nextId('v', state.design.vegetation), type: type, name: 'Modular living wall', module: m.id, face: 'south', start_m: 1, length_m: Math.min(3, m.nominal.length_m - 1), height_m: 2.6, offset_m: 0.5, plant_type: 'sedum, native ferns and mosses', mature_height_m: 2.6, seasonal_foliage: 'evergreen', irrigation: 'drip with recirculation', maintenance: 'Quarterly module and irrigation checks; replace failed modules', separation_m: 0.5, support: 'independent galvanised frame on screw piles', notes: 'Independently supported; clear of the rainscreen.' });
    }, 'Vegetation system added. Confirm plant selection, irrigation, fire separation and maintenance.');
  }

  function renderExposure() {
    var panel = $('exposure');
    if (!panel) return;
    var e = Model.exposureProfile(state.design);
    var face = ['north', 'east', 'south', 'west'].map(function (k) { return '<div><dt>' + k + '</dt><dd>' + n(e.glazing_by_face[k]) + ' m² glazing</dd></div>'; }).join('');
    panel.innerHTML = '<dl class="exposure-grid">' + face + '<div><dt>Total</dt><dd>' + n(e.glazing_total_m2) + ' m² approximate</dd></div></dl>' +
      (e.privacy.length ? '<h3>Privacy and screening</h3><ul>' + e.privacy.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') +
      (e.shading.length ? '<h3>Shading and seasonal notes</h3><ul>' + e.shading.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') +
      (e.maintenance.length ? '<h3>Maintenance</h3><ul>' + e.maintenance.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') +
      '<p class="small">' + esc(e.note) + '</p>';
  }

  function renderTrellises() {
    var d = state.design;
    var panel = $('trellis-controls');
    if (!d.trellises.length) { panel.innerHTML = '<p>No climbing-plant trellis. Add an independent trellis clear of the rainscreen.</p>'; return; }
    panel.innerHTML = d.trellises.map(function (t, i) {
      var base = 'trellis-' + i;
      return '<fieldset class="trellis-card"><legend>Trellis ' + esc(t.id) + '</legend><div class="field-grid">' +
        field('Module', selectInput('trellises.' + i + '.module', t.module, base + '-module', d.modules.map(function (m) { return option(m.id, m.id, t.module); }).join(''))) +
        field('Face', selectInput('trellises.' + i + '.face', t.face, base + '-face', Object.keys(FACE_LABEL).map(function (k) { return option(k, FACE_LABEL[k], t.face); }).join(''))) +
        field('Start (m)', numberInput('trellises.' + i + '.start_m', t.start_m, base + '-start', ' step="0.1" min="0"')) +
        field('Length (m)', numberInput('trellises.' + i + '.length_m', t.length_m, base + '-length', ' step="0.1" min="0.5"')) +
        field('Offset from rainscreen (m)', numberInput('trellises.' + i + '.offset_m', t.offset_m, base + '-offset', ' step="0.05" min="0.25" max="1"')) +
        field('Height (m)', numberInput('trellises.' + i + '.height_m', t.height_m, base + '-height', ' step="0.1" min="1" max="5"')) +
        '</div><button type="button" class="secondary" data-action="remove-trellis" data-index="' + i + '">Remove this trellis</button></fieldset>';
    }).join('');
  }

  function renderConnections() {
    var d = state.design;
    var panel = $('connection-controls');
    if (!d.connections.length) { panel.innerHTML = '<p>No timber connector. Add one to model a separate link between two modules.</p>'; return; }
    panel.innerHTML = d.connections.map(function (c, i) {
      var base = 'connection-' + i;
      return '<fieldset class="connection-card"><legend>Connector ' + esc(c.id) + '</legend><div class="field-grid">' +
        field('From module', selectInput('connections.' + i + '.from', c.from, base + '-from', d.modules.map(function (m) { return option(m.id, m.id, c.from); }).join(''))) +
        field('To module', selectInput('connections.' + i + '.to', c.to, base + '-to', d.modules.map(function (m) { return option(m.id, m.id, c.to); }).join(''))) +
        field('X position (m)', numberInput('connections.' + i + '.position_m.0', c.position_m[0], base + '-x', ' step="0.1"')) +
        field('Y position (m)', numberInput('connections.' + i + '.position_m.1', c.position_m[1], base + '-y', ' step="0.1"')) +
        field('Length (m)', numberInput('connections.' + i + '.length_m', c.length_m, base + '-length', ' step="0.1" min="0.5"')) +
        field('Width (m)', numberInput('connections.' + i + '.width_m', c.width_m, base + '-width', ' step="0.1" min="0.5"')) +
        field('Rotation (degrees)', numberInput('connections.' + i + '.rotation_deg', c.rotation_deg || 0, base + '-rot', ' step="1"')) +
        field('Glazing area (m², concept)', numberInput('connections.' + i + '.glazing_area_m2', c.glazing_area_m2 || 0, base + '-glazing-area', ' step="0.5" min="0"')) +
        field('Glazed door type', selectInput('connections.' + i + '.door_type', c.door_type || 'none', base + '-door', option('none', 'No glazed door', c.door_type) + option('insulated-sliding', 'Insulated sliding doors', c.door_type) + option('folding', 'Insulated folding doors', c.door_type) + option('garage', 'Glazed garage door (review)', c.door_type))) +
        '</div>' + checkbox('connections.' + i + '.roof', c.roof, base + '-roof', 'Covered') +
        checkbox('connections.' + i + '.screened', c.screened, base + '-screened', 'Screened') +
        checkbox('connections.' + i + '.glazed', c.glazed, base + '-glazed', 'Glazed enclosure') +
        '<button type="button" class="secondary" data-action="remove-connection" data-index="' + i + '">Remove this connector</button></fieldset>';
    }).join('');
  }

  function syncModulePositionInputs(m) {
    var i = moduleIndex(m.id);
    if (i < 0) return;
    ['0', '1'].forEach(function (axis) {
      var el = document.querySelector('[data-path="modules.' + i + '.position_m.' + axis + '"]');
      if (el && document.activeElement !== el) el.value = m.position_m[Number(axis)];
    });
  }

  function focusPlanModule(id) {
    var hit = document.querySelector('#plan .plan-module-hit[data-module-id="' + id + '"]');
    if (hit) hit.focus({ preventScroll: true });
  }

  function nudgeModule(m, dx, dy, message) {
    var before = clone(state.design);
    m.position_m[0] = Math.round((m.position_m[0] + dx) * 10) / 10;
    m.position_m[1] = Math.round((m.position_m[1] + dy) * 10) / 10;
    pushHistory(before);
    state.design = Schema.canonicalize(state.design);
    renderControls();
    renderVisuals();
    focusPlanModule(m.id);
    announce(message || ('Module ' + m.id + ' moved to ' + m.position_m[0] + ', ' + m.position_m[1] + ' metres.'));
  }

  function rotateModule(m, delta) {
    var before = clone(state.design);
    m.rotation_deg = ((m.rotation_deg || 0) + delta + 360) % 360;
    pushHistory(before);
    state.design = Schema.canonicalize(state.design);
    renderControls();
    renderVisuals();
    focusPlanModule(m.id);
    announce('Module ' + m.id + ' rotated to ' + m.rotation_deg + ' degrees.');
  }

  var planDrag = null;

  function renderVisuals() {
    var d = state.design;
    var assessment = Model.assess(d);
    var summary = Schema.summary(d);
    var storey = state.planStorey === 'all' ? undefined : Number(state.planStorey);
    try {
      $('plan').innerHTML = Model.renderPlan(d, { idPrefix: 'editor-plan', selectedModule: state.selectedModule, interactive: true, storey: storey });
      $('exterior').innerHTML = Model.renderAxo(d, { idPrefix: 'editor-exterior', season: state.season === 'winter' ? 'winter' : undefined });
      $('cutaway').innerHTML = Model.renderAxo(d, { idPrefix: 'editor-cutaway', mode: 'cutaway' });
      ['south', 'north', 'east', 'west'].forEach(function (side) {
        var host = $('elevation-' + side);
        if (host) host.innerHTML = Model.renderElevation(d, { idPrefix: 'editor-elevation-' + side, side: side });
      });
      if ($('section')) $('section').innerHTML = Model.renderSection(d, { idPrefix: 'editor-section' });
      if ($('exploded')) $('exploded').innerHTML = Model.renderExploded(d, { idPrefix: 'editor-exploded' });
      if ($('solar-summer')) $('solar-summer').innerHTML = Model.renderSolarStudy(d, { idPrefix: 'editor-solar-summer', season: 'summer' });
      if ($('solar-winter')) $('solar-winter').innerHTML = Model.renderSolarStudy(d, { idPrefix: 'editor-solar-winter', season: 'winter' });
      if ($('massing')) $('massing').innerHTML = Model.renderAxo(d, { idPrefix: 'editor-massing' });
      if ($('interior-plan')) { var interiorStorey = state.planStorey === 'all' ? 0 : Number(state.planStorey); $('interior-plan').innerHTML = d.interior ? Interior.planSVG(d, { idPrefix: 'editor-interior-plan', storey: interiorStorey }) : '<p class="small">No interior model. Create one from the room bands or import an interior design.</p>'; }
    } catch (err) {
      announce('The view could not be drawn: ' + err.message);
    }
    renderWarnings(assessment);
    renderSummary(d, summary, assessment);
    renderExposure();
    renderHamlet(d);
    var m = Model.metrics(d);
    updateIllustrationFreshness();
    if ($('massing-status')) $('massing-status').textContent = m.storeyCount + ' occupied storey' + (m.storeyCount === 1 ? '' : 's') + ' · ' + n(m.groundCoverage_m2) + ' m² ground coverage · ' + n(m.buildingHeight_m) + ' m to the roof. Massing only; no engineering or privacy assessment.';
    ['export-plan', 'export-plan-ground', 'export-plan-upper', 'export-elevation-south', 'export-section', 'export-exploded', 'export-solar-summer', 'export-solar-winter', 'export-exterior', 'export-cutaway', 'export-porch', 'export-winter', 'download-wall', 'export-wall', 'export-zip', 'export-summary'].forEach(function (id) {
      var el = $(id);
      if (el) el.disabled = !assessment.ok;
    });
  }

  function renderWarnings(assessment) {
    var groups = { 'invalid-data': [], 'invalid-geometry': [], structural: [], accessibility: [], 'professional-review': [] };
    assessment.items.forEach(function (i) { if (groups[i.category]) groups[i.category].push(i); });
    var labels = { 'invalid-data': 'Invalid data', 'invalid-geometry': 'Invalid geometry', structural: 'Structural review', accessibility: 'Accessibility review', 'professional-review': 'Professional review' };
    var invalidCount = groups['invalid-data'].length + groups['invalid-geometry'].length;
    var status = $('assessment-status');
    if (status) status.textContent = assessment.ok ? 'No invalid data or geometry. ' + groups.structural.length + ' structural, ' + groups.accessibility.length + ' accessibility and ' + groups['professional-review'].length + ' professional-review prompts.' : invalidCount + ' invalid data or geometry issue' + (invalidCount === 1 ? '' : 's') + '. Fix these before exporting drawings.';
    var out = '';
    Object.keys(groups).forEach(function (key) {
      if (!groups[key].length) return;
      out += '<div class="warning-group"><h3><span class="badge ' + key + '">' + esc(labels[key]) + '</span> ' + groups[key].length + '</h3><ul>' + groups[key].map(function (i) { return '<li>' + esc(i.message) + '</li>'; }).join('') + '</ul></div>';
    });
    $('warning-list').innerHTML = out || '<p>No checks returned.</p>';
  }

  function renderSummary(d, s, assessment) {
    var met = Model.metrics(d);
    var access = Model.accessibilityProfile(d);
    var review = Model.structuralReview(d);
    var rows = [
      ['Design', d.name],
      ['Storeys', met.storeyCount + ' occupied · ' + met.levels.map(function (l) { return l.name + ' at ' + n(l.elevation_m, 2) + ' m'; }).join('; ')],
      ['Containers', s.moduleCount + ' × ' + s.types.join(', ')],
      ['Gross floor area', n(met.grossFloorArea_m2) + ' m² nominal modules plus glazed links'],
      ['Ground coverage', n(met.groundCoverage_m2) + ' m² projected footprint'],
      ['Building height', n(met.buildingHeight_m) + ' m to the roof'],
      ['Roof form', d.roof_form.type.replace(/-/g, ' ') + ' · ' + d.roof_form.pitch_deg + '° pitch · ' + n(d.roof_form.overhang_m, 2) + ' m overhang'],
      ['Accessibility', access.classification.replace(/-/g, ' ') + (' · ' + access.issues.length + ' recorded issue(s)')],
      ['Structural review', review.model_status.replace(/-/g, ' ') + ' · ' + review.concerns.filter(function (c) { return c.status === 'requires-review'; }).length + ' concern(s) require review'],
      ['Nominal module area', n(s.nominalFootprint_m2) + ' m² before insulation'],
      ['Interior zones', s.zoneCount],
      ['Openings', s.openingCount],
      ['Screened porch', n(s.screenedPorch_m2) + ' m²'],
      ['Trellises', s.trellisCount || 0],
      ['Thermal envelope', (d.thermal.roof_insulation_mm || '–') + ' mm roof / ' + (d.thermal.floor_insulation_mm || '–') + ' mm floor / ' + d.thermal.window_performance],
      ['Envelope assembly', (Model.ENVELOPE_LABEL[d.envelope.assembly] || d.envelope.assembly) + ' · ' + d.envelope.layers.filter(function (l) { return l.role === 'insulation'; }).reduce(function (t, l) { return t + l.thickness_mm; }, 0) + ' mm insulation'],
      ['Vegetation', d.vegetation.length + ' separate system' + (d.vegetation.length === 1 ? '' : 's')],
      ['Solar', d.modules.filter(function (m) { return m.solar.enabled; }).map(function (m) { return m.id + ': ' + m.solar.tilt_deg + '° / ' + m.solar.azimuth_deg + '° ' + m.solar.season_mode; }).join(' · ') || 'No solar array enabled'],
      ['Foundation', d.foundation.system + ' · ' + d.foundation.clearance_m + ' m clearance · ' + (d.foundation.no_compaction ? 'no compaction' : 'compaction unresolved')],
      ['Paint and shelter', (d.paint ? d.paint.name : 'current palette') + ' · ' + (d.entry_shelter.enabled ? 'entry shelter on ' + d.entry_shelter.side : 'no entry shelter')],
      ['Fire resilience', d.fire.roof_class + ' roof · ' + d.fire.defensible_space_m + ' m defensible space · ' + ['noncombustible_eaves','ember_resistant_vents','tempered_glazing','noncombustible_deck','exterior_shutters','water_access'].filter(function (k) { return d.fire[k]; }).length + ' measures'],
      ['Roof finish', (s.solar ? 'Solar-ready ' : '') + (s.greenRoof ? 'Green roof concept ' : '') + '· ' + d.roof_form.type.replace(/-/g, ' ')],
      ['Insulation', 'Up to ' + s.maxInsulation_mm + ' mm external'],
      ['Status', assessment.ok ? 'No invalid data or geometry; professional review required' : 'Invalid data or geometry; drawings disabled'],
      ['Material intent', Object.keys(d.material_intent || {}).filter(function (k) { return d.material_intent[k]; }).length + ' selected; see the Material intent controls'],
      ['Licence', 'Code AGPL-3.0-or-later · content CC BY-SA 4.0']
    ];
    $('summary').innerHTML = '<dl class="summary-grid">' + rows.map(function (r) { return '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('') + '</dl><p class="small">' + esc(Model.describe(d)) + '</p>';
  }

  /* ---------------- hamlet preview ---------------- */

  function pointInPoly(p, poly) {
    var inside = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if ((yi > p[1]) !== (yj > p[1]) && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  function distSeg(px, py, ax, ay, bx, by) {
    var dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    var t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
  }
  function distPolyline(p, pts, closed) {
    var d = Infinity;
    var nseg = closed ? pts.length : pts.length - 1;
    for (var i = 0; i < nseg; i++) d = Math.min(d, distSeg(p[0], p[1], pts[i][0], pts[i][1], pts[(i + 1) % pts.length][0], pts[(i + 1) % pts.length][1]));
    return d;
  }
  function distPolygon(p, poly) { return pointInPoly(p, poly) ? 0 : distPolyline(p, poly, true); }
  function rotatePt(p, deg) { var a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; }
  function toSite(poly, site) {
    var rot = Number(state.design.site.rotation_deg) || 0;
    return poly.map(function (p) { var q = rotatePt(p, rot); return [q[0] + site.x_m, q[1] + site.y_m]; });
  }
  function polyOverlap(a, b) {
    var axes = [];
    [a, b].forEach(function (poly) { for (var i = 0; i < poly.length; i++) { var p = poly[i], q = poly[(i + 1) % poly.length]; var dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1; axes.push([-dy / l, dx / l]); } });
    for (var i = 0; i < axes.length; i++) {
      var pa = a.map(function (p) { return p[0] * axes[i][0] + p[1] * axes[i][1]; });
      var pb = b.map(function (p) { return p[0] * axes[i][0] + p[1] * axes[i][1]; });
      if (Math.max.apply(null, pa) <= Math.min.apply(null, pb) + 0.002 || Math.max.apply(null, pb) <= Math.min.apply(null, pa) + 0.002) return false;
    }
    return true;
  }

  function renderHamlet(d) {
    var host = $('site-preview');
    if (!host || !SITE || !SITE.buildings) return;
    var site = SITE.buildings.filter(function (b) { return b.id === d.site.homesite; })[0] || SITE.buildings[0];
    if (!site) { host.innerHTML = '<p>No fictional homesite data.</p>'; return; }
    var polys = d.modules.map(function (m) { return toSite(Model.moduleCorners(m), site); });
    var conflicts = [];
    polys.forEach(function (poly) {
      if (poly.some(function (p) { return !pointInPoly(p, SITE.parcel); })) conflicts.push('part of the footprint is outside the fictional parcel');
      var shore = Math.min.apply(null, poly.map(function (p) { return distPolyline(p, SITE.lake.shoreline, false); }));
      if (shore < SITE.no_build.shoreline_setback_m) conflicts.push('inside the ' + SITE.no_build.shoreline_setback_m + ' m shoreline buffer');
      var wet = Math.min.apply(null, poly.map(function (p) { return distPolygon(p, SITE.wetland.polygon); }));
      if (wet < SITE.no_build.wetland_buffer_m) conflicts.push('inside the ' + SITE.no_build.wetland_buffer_m + ' m wetland buffer');
      (SITE.rocks || []).forEach(function (r) {
        var dd = Math.min.apply(null, poly.map(function (p) { return distPolygon(p, r.polygon); }));
        if (dd < SITE.no_build.rock_buffer_m) conflicts.push('inside the rock buffer at ' + r.name);
      });
      (SITE.drainage || []).forEach(function (ch) {
        var dd = Math.min.apply(null, poly.map(function (p) { return distPolyline(p, ch.points, false); }));
        if (dd < SITE.no_build.drainage_buffer_m) conflicts.push('inside the drainage buffer at ' + ch.name);
      });
      SITE.buildings.forEach(function (b) {
        if (!b.footprint || b.id === site.id) return;
        if (polyOverlap(poly, b.footprint)) conflicts.push('overlaps ' + b.name);
      });
    });
    var unique = conflicts.filter(function (v, i) { return conflicts.indexOf(v) === i; });
    var pathNote = '';
    polys.forEach(function (poly) {
      SITE.trails.concat(SITE.lanes).forEach(function (t) {
        var dd = Math.min.apply(null, poly.map(function (p) { return distPolyline(p, t.points, false); }));
        if (dd < (t.width_m || 1) / 2 + 0.5) pathNote = ' The existing path or track may need adjustment around the illustrated footprint.';
      });
    });
    var met = Model.metrics(d);
    var assigned = site.design_lab_home ? ' The site’s illustrative architectural assignment is ' + site.design_lab_home.replace(/-/g, ' ') + '.' : '';
    var label = 'Illustrative placement at ' + site.name + '.' + assigned + ' ' + met.storeyCount + ' occupied storey' + (met.storeyCount === 1 ? '' : 's') + ', ' + n(met.groundCoverage_m2) + ' square metres ground coverage and ' + n(met.buildingHeight_m) + ' metres to the roof. ' + (unique.length ? 'Conflicts: ' + unique.join('; ') + '. ' : 'No conflict with the modelled buffers or other buildings. ') + pathNote + ' This preview does not add the design to the community layout.';
    host.setAttribute('aria-label', label);
    var fp = d.modules.map(function (m) {
      var poly = toSite(Model.moduleCorners(m), site);
      var upper = m.storey > 0;
      return '<path d="M' + poly.map(function (p) { return n(p[0]) + ' ' + n(p[1]); }).join('L') + 'Z" fill="' + (unique.length ? '#9b2c2c' : upper ? '#3f6f9a' : '#246b4a') + '" fill-opacity="' + (upper ? '0.16' : '0.35') + '" stroke="' + (unique.length ? '#9b2c2c' : upper ? '#245a73' : '#174d35') + '" stroke-width="' + (upper ? '1' : '1.4') + '"' + (upper || unique.length ? ' stroke-dasharray="3 2"' : '') + '/>' + (upper ? '<text x="' + n(poly[0][0] + 2) + '" y="' + n(poly[0][1] - 2) + '" font-family="system-ui, sans-serif" font-size="5" font-weight="800" fill="#245a73" stroke="#faf8f2" stroke-width="1.4" paint-order="stroke">L' + (m.storey + 1) + '</text>' : '');
    }).join('');
    var existing = SITE.buildings.filter(function (b) { return b.id !== site.id; }).map(function (b) { return b.footprint ? '<path d="M' + b.footprint.map(function (p) { return n(p[0]) + ' ' + n(p[1]); }).join('L') + 'Z" fill="none" stroke="#5b4a36" stroke-width="0.8" stroke-dasharray="2 1"/>' : ''; }).join('');
    var az = ((Number(d.primary_view_deg) || 0) + (Number(d.site.rotation_deg) || 0)) * Math.PI / 180;
    var arrow = '<line x1="' + site.x_m + '" y1="' + site.y_m + '" x2="' + n(site.x_m + Math.sin(az) * 22) + '" y2="' + n(site.y_m - Math.cos(az) * 22) + '" stroke="#3f5f8a" stroke-width="1.4" stroke-dasharray="3 2"/><circle cx="' + n(site.x_m + Math.sin(az) * 22) + '" cy="' + n(site.y_m - Math.cos(az) * 22) + '" r="2.4" fill="#3f5f8a"/>';
    var overlay = host.querySelector('svg');
    if (!overlay) {
      host.innerHTML = '<img src="../../assets/site-plan.svg" width="924" height="781" alt="Fictional Containers Hamlet site plan used as an illustrative placement background." loading="eager" decoding="async">' +
        '<svg viewBox="0 0 330 279" aria-hidden="true" focusable="false"></svg>';
      overlay = host.querySelector('svg');
    }
    overlay.innerHTML = existing + fp + arrow + '<text x="' + n(site.x_m + 5) + '" y="' + n(site.y_m - 6) + '" font-family="system-ui, sans-serif" font-size="6" font-weight="800" fill="#1d392c" stroke="#faf8f2" stroke-width="1.6" paint-order="stroke">YOUR DESIGN · ' + met.storeyCount + ' STOREY' + (met.storeyCount === 1 ? '' : 'S') + ' · ' + n(met.buildingHeight_m) + ' m</text>';
    $('site-status').textContent = label;
  }

  /* ---------------- events ---------------- */

  function applyRoof(m, type) {
    m.roof.type = type;
    m.roof.solar = type === 'solar';
    m.roof.green = type === 'green';
    if (m.solar) m.solar.enabled = !!m.roof.solar;
  }

  function onFieldInput(event) {
    var el = event.target;
    if (!el || !el.getAttribute) return;
    var path = el.getAttribute('data-path');
    if (!path) return;
    if (!state.editBase) state.editBase = clone(state.design);
    if (/^modules\.\d+\.solar\./.test(path)) renderSolarSection();
    var value = el.type === 'checkbox' ? el.checked : el.value;
    if (path.indexOf('.roof.type') >= 0) {
      var parts = path.split('.');
      var mi = Number(parts[1]);
      applyRoof(state.design.modules[mi], value);
    } else if (/^modules\.\d+\.solar\.season_mode$/.test(path)) {
      var si = Number(path.split('.')[1]);
      state.design.modules[si].solar.season_mode = value;
      state.design.modules[si].solar.tilt_deg = value === 'winter' ? 60 : value === 'summer' ? 30 : 39;
    } else if (/^modules\.\d+\.storey$/.test(path)) {
      var sti = Number(path.split('.')[1]);
      var stm = state.design.modules[sti];
      stm.storey = Number(value);
      stm.elevation_m = defaultElevationFor(stm);
      stm.support = { type: stm.storey === 0 ? 'ground' : 'not-assessed', references: [], verified: false, note: stm.storey === 0 ? 'Ground-bearing design intent.' : 'Support intent not yet recorded.' };
      announce('Module ' + stm.id + ' moved to level ' + (stm.storey + 1) + ' at ' + n(stm.elevation_m, 2) + ' m. Add support references if a module below carries it.');
    } else if (path.indexOf('.type') >= 0 && /^modules\.\d+\.type$/.test(path)) {
      var idx = Number(path.split('.')[1]);
      var m = state.design.modules[idx];
      m.type = value;
      m.nominal = Schema.moduleDefaults(value);
      if (value === '20ft') {
        m.zones.forEach(function (z) { z.start_m = Math.min(z.start_m, 6.0); z.end_m = Math.min(z.end_m, 6.0); });
        m.openings.forEach(function (o) { o.position_m = Math.min(o.position_m, 2.0); });
        announce('Module ' + m.id + ' changed to a 20-foot container. Zones and openings were clamped to the shorter module; Undo is available.');
      }
    } else {
      setPath(state.design, path, value);
    }
    state.design = Schema.canonicalize(state.design);
    renderVisuals();
  }

  function onFieldCommit(event) {
    var el = event.target;
    if (!el || !el.getAttribute) return;
    var path = el.getAttribute('data-path');
    if (!path) return;
    if (state.editBase && JSON.stringify(state.editBase) !== JSON.stringify(state.design)) pushHistory(state.editBase);
    state.editBase = null;
    if (path.indexOf('.type') >= 0 || path.indexOf('.roof.type') >= 0 || path.indexOf('.storey') >= 0 || path.indexOf('elevation_m') >= 0 || /^modules\.\d+\.solar\./.test(path) || /^roof_form\./.test(path) || /^access\./.test(path)) {
      renderControls();
      renderVisuals();
    }
    updateHistoryButtons();
  }

  function defaultElevationFor(m) {
    if (m.storey === 0) return Math.max(0, Number(state.design.foundation.clearance_m) || 0.6);
    var below = state.design.modules.filter(function (x) { return x.id !== m.id && x.storey < m.storey; });
    var top = below.reduce(function (t, x) { return Math.max(t, Model.moduleTop(x)); }, 0);
    return Math.round(((top || 2.896) + Schema.INTER_STOREY_FLOOR_M) * 1000) / 1000;
  }

  function mutate(fn, message) {
    var before = clone(state.design);
    fn();
    state.design = Schema.canonicalize(state.design);
    pushHistory(before);
    state.editBase = null;
    renderAll();
    if (message) announce(message);
  }

  function nextId(prefix, list) {
    var n = 1;
    var used = list.map(function (x) { return x.id; });
    while (used.indexOf(prefix + n) >= 0) n++;
    return prefix + n;
  }

  function addModule() {
    if (state.design.modules.length >= 3) { announce('The Design Lab supports up to three containers.'); return; }
    mutate(function () {
      var count = state.design.modules.length;
      var type = count === 0 ? '40ft' : '40ft';
      var dims = Schema.moduleDefaults(type);
      var id = nextId('m', state.design.modules);
      var pos = count === 0 ? [0, 0] : [0, 4.5 * count];
      state.design.modules.push({
        id: id, type: type, nominal: dims, position_m: pos, rotation_deg: 0,
        insulation: { thickness_mm: 150, type: 'wood-fibre or documented reclaimed board' },
        cladding: { type: 'timber', colour: '#8a6a4a' },
        roof: { type: 'solar', solar: true, green: false },
        structure: { openings_reinforced: true, wall_removal: 'none', cantilever_m: 0, notes: '' },
        openings: [{ id: id + '-o1', name: 'South window', face: 'south', type: 'window', position_m: 3.0, width_m: 1.2, height_m: 1.4, sill_m: 0.9 }],
        zones: [{ id: id + '-z1', name: 'Living', type: 'living', start_m: 0, end_m: Math.min(4, dims.length_m), accessibility: '' }]
      });
      state.selectedModule = id;
      state.arrangement = state.design.modules.length === 1 ? 'single' : state.design.modules.length === 2 ? 'parallel' : 'courtyard';
    }, 'Container added. Move it with the position and rotation controls; Undo is available.');
  }

  function removeModule() {
    if (state.design.modules.length <= 1) { announce('A design needs at least one container.'); return; }
    var id = state.selectedModule;
    mutate(function () {
      state.design.modules = state.design.modules.filter(function (m) { return m.id !== id; });
      state.design.porches = state.design.porches.filter(function (p) { return p.module !== id; });
      var porchIds = state.design.porches.map(function (p) { return p.id; });
      state.design.decks = state.design.decks.filter(function (d) { return porchIds.indexOf(d.porch) >= 0; });
      state.design.connections = state.design.connections.filter(function (c) { return c.from !== id && c.to !== id; });
      state.selectedModule = state.design.modules[0].id;
    }, 'Container ' + id + ' and its connected porch/deck references were removed. Undo is available.');
  }

  function applyArrangement() {
    var arrangement = $('arrangement').value;
    mutate(function () {
      var modules = state.design.modules;
      function ensure(count) {
        while (modules.length < count) {
          var id = nextId('m', modules);
          var dims = Schema.moduleDefaults('40ft');
          modules.push({
            id: id, type: '40ft', nominal: dims, position_m: [0, 0], rotation_deg: 0,
            insulation: { thickness_mm: 150, type: 'wood-fibre or documented reclaimed board' },
            cladding: { type: 'timber', colour: '#8a6a4a' },
            roof: { type: 'solar', solar: true, green: false },
            structure: { openings_reinforced: true, wall_removal: 'none', cantilever_m: 0, notes: '' },
            openings: [{ id: id + '-o1', name: 'South window', face: 'south', type: 'window', position_m: 3.0, width_m: 1.2, height_m: 1.4, sill_m: 0.9 }],
            zones: [{ id: id + '-z1', name: 'Living', type: 'living', start_m: 0, end_m: 4, accessibility: '' }]
          });
        }
      }
      if (arrangement === 'single') {
        modules.length = Math.min(modules.length, 1);
        modules[0].position_m = [0, 0]; modules[0].rotation_deg = 0;
      } else if (arrangement === 'parallel') {
        ensure(2); modules[0].position_m = [0, -2.9]; modules[0].rotation_deg = 0; modules[1].position_m = [0, 2.9]; modules[1].rotation_deg = 0;
      } else if (arrangement === 'adjacent') {
        ensure(2); modules[0].position_m = [0, 0]; modules[0].rotation_deg = 0; modules[1].position_m = [0, 2.438]; modules[1].rotation_deg = 0;
      } else if (arrangement === 'l-shape') {
        ensure(2); modules[0].position_m = [0, 0]; modules[0].rotation_deg = 0; modules[1].position_m = [-7.4, 6.1]; modules[1].rotation_deg = 90;
      } else {
        ensure(3); modules[0].position_m = [0, -7.4]; modules[0].rotation_deg = 0;
        modules[1].position_m = [-7.4, 0]; modules[1].rotation_deg = 90;
        modules[2].position_m = [7.4, 0]; modules[2].rotation_deg = 90;
      }
      var ids = modules.map(function (m) { return m.id; });
      state.design.porches = state.design.porches.filter(function (p) { return ids.indexOf(p.module) >= 0; });
      var porchIds = state.design.porches.map(function (p) { return p.id; });
      state.design.decks = state.design.decks.filter(function (d) { return porchIds.indexOf(d.porch) >= 0; });
      state.design.connections = state.design.connections.filter(function (c) { return ids.indexOf(c.from) >= 0 && ids.indexOf(c.to) >= 0; });
      state.selectedModule = modules[0].id;
      state.arrangement = arrangement;
    }, 'Arrangement applied. Moving modules independently is still available; Undo is available.');
  }

  function stackingTarget() {
    var m = currentModule();
    if (!m) { announce('Select a module first.'); return null; }
    return m;
  }

  function stackAbove() {
    var m = stackingTarget();
    if (!m) return;
    if (m.storey >= 1) { announce('The selected module is already on the upper floor. Select a ground-floor module to stack above it.'); return; }
    if (state.design.modules.length >= 3) { announce('The Design Lab supports up to three containers. Remove one before stacking another.'); return; }
    mutate(function () {
      var id = nextId('m', state.design.modules);
      var copy = clone(m);
      copy.id = id;
      copy.storey = 1;
      copy.elevation_m = Math.round((Model.moduleTop(m) + Schema.INTER_STOREY_FLOOR_M) * 1000) / 1000;
      copy.position_m = [m.position_m[0], m.position_m[1]];
      copy.support = { type: 'module', references: [m.id], verified: false, note: 'Design intent only. A module directly above another is not automatically supported; capacity, connections, lateral stability and uplift need professional review.' };
      copy.structure = Object.assign({}, copy.structure, { cantilever_m: 0, notes: 'Stacked above ' + m.id + '; load path and connections are not designed.' });
      copy.cladding = Object.assign({}, copy.cladding, { type: 'metal', colour: '#7d8587' });
      copy.openings = (m.openings || []).map(function (o, i) { var c = clone(o); c.id = id + '-o' + (i + 1); return c; });
      copy.zones = (m.zones || []).map(function (z, i) { var c = clone(z); c.id = id + '-z' + (i + 1); return c; });
      state.design.modules.push(copy);
      state.selectedModule = id;
      state.editStorey = '1';
      state.planStorey = '1';
    }, 'Upper module added above ' + m.id + ' at ' + n(Model.moduleTop(m) + Schema.INTER_STOREY_FLOOR_M, 2) + ' m. The support reference is design intent only; inspect and review it.');
  }

  function alignBelow() {
    var m = stackingTarget();
    if (!m) return;
    if (m.storey < 1) { announce('Select an upper-floor module to align it to the module below.'); return; }
    var row = Model.supportAnalysis(state.design).rows.filter(function (r) { return r.module === m.id; })[0];
    var ref = (m.support.references || [])[0] || (row && row.contacts[0] && row.contacts[0].module);
    var below = state.design.modules.filter(function (x) { return x.id === ref; })[0];
    if (!below) { announce('No supporting module is recorded below ' + m.id + '. Add a support reference first.'); return; }
    mutate(function () {
      m.position_m = [below.position_m[0], below.position_m[1]];
      m.elevation_m = Math.round((Model.moduleTop(below) + Schema.INTER_STOREY_FLOOR_M) * 1000) / 1000;
      m.support = Object.assign({}, m.support, { type: 'module', references: [below.id], verified: false, note: 'Aligned bearing intent only; capacity and connections are not designed.' });
    }, 'Module ' + m.id + ' aligned over ' + below.id + ' at ' + n(m.elevation_m, 2) + ' m.');
  }

  function offsetUpper() {
    var m = stackingTarget();
    if (!m) return;
    if (m.storey < 1) { announce('Select an upper-floor module to offset it.'); return; }
    mutate(function () {
      m.position_m[0] = Math.round((m.position_m[0] + 1.5) * 100) / 100;
      m.structure.cantilever_m = Math.max(m.structure.cantilever_m || 0, 1.5);
    }, 'Upper module ' + m.id + ' offset by 1.5 m. The unsupported area and cantilever now need structural review.');
  }

  function rotateUpper() {
    var m = stackingTarget();
    if (!m) return;
    if (m.storey < 1) { announce('Select an upper-floor module to rotate it.'); return; }
    mutate(function () {
      m.rotation_deg = ((m.rotation_deg || 0) + 90) % 360;
    }, 'Upper module ' + m.id + ' rotated to ' + m.rotation_deg + ' degrees. Recheck plan overlap, support contact and lateral stability.');
  }

  function perpendicularStack() {
    var m = stackingTarget();
    if (!m) return;
    var ground = m.storey > 0 ? state.design.modules.filter(function (x) { return x.storey < m.storey; })[0] : m;
    if (!ground) { announce('No ground-floor module is available.'); return; }
    var upper = state.design.modules.filter(function (x) { return x.storey > 0; })[0];
    if (!upper) {
      stackAbove();
      upper = state.design.modules.filter(function (x) { return x.storey > 0; })[0];
      if (!upper) return;
    }
    mutate(function () {
      upper.rotation_deg = ((ground.rotation_deg || 0) + 90) % 360;
      upper.position_m = [ground.position_m[0], ground.position_m[1]];
      upper.elevation_m = Math.round((Model.moduleTop(ground) + Schema.INTER_STOREY_FLOOR_M) * 1000) / 1000;
      upper.support = Object.assign({}, upper.support, { type: 'module', references: [ground.id], verified: false, note: 'Perpendicular bearing intent only. The crossing requires an engineered transfer and lateral system.' });
      state.selectedModule = upper.id;
      state.editStorey = '1';
      state.planStorey = '1';
    }, 'Perpendicular stack created. The upper module crosses the ground module and needs an engineered transfer and lateral review.');
  }

  function inspectSupport() {
    var host = $('support-report');
    if (!host) return;
    var analysis = Model.supportAnalysis(state.design);
    var rows = analysis.rows;
    var html = '<h3>Support relationship</h3>';
    if (!rows.some(function (r) { return r.upper; })) {
      html += '<p>This design is single-storey. Every module is recorded as ground-bearing; foundation capacity still needs geotechnical and structural review.</p>';
    } else {
      html += '<ul>' + rows.map(function (r) {
        if (!r.upper) return '<li><strong>' + esc(r.module) + '</strong> is ground-bearing at ' + n(r.elevation_m, 2) + ' m. Foundation capacity is not designed.</li>';
        return '<li><strong>' + esc(r.module) + '</strong> is at ' + n(r.elevation_m, 2) + ' m and is geometrically supported over ' + Math.round(r.support_fraction * 100) + '% of its footprint (' + n(r.supported_area_m2) + ' of ' + n(r.footprint_m2) + ' m²). ' + (r.declared.length ? 'Declared support: ' + esc(r.declared.join(', ')) + '. ' : 'No support module is declared. ') + (r.support_fraction <= 0.001 ? 'No supporting module is below it.' : r.support_fraction < 0.999 ? 'The unsupported area requires engineered transfer or cantilever review.' : 'Geometric bearing only; capacity and connections are not verified.') + '</li>';
      }).join('') + '</ul>';
      html += '<p class="small">This report is geometric. It does not calculate load capacity, connection strength, lateral stability, wind uplift or foundation reactions. A support reference is design intent, not a verified load path.</p>';
    }
    host.innerHTML = html;
    host.setAttribute('data-rendered', 'true');
    var analysisStatus = Model.structuralReview(state.design);
    announce('Support inspected. ' + analysisStatus.summary + ' No capacity is calculated.');
  }

  function addOpening() {
    var m = currentModule();
    if (!m) return;
    mutate(function () {
      var dims = Schema.moduleDefaults(m.type);
      var len = m.openings.length;
      m.openings.push({ id: m.id + '-o' + (len + 2), name: 'New opening', face: 'south', type: 'window', position_m: Math.min(len + 2, dims.length_m / 2), width_m: 1.2, height_m: 1.4, sill_m: 0.9 });
      state.selectedOpening = m.openings[m.openings.length - 1].id;
    }, 'Opening added. Adjust its face, position and size.');
  }
  function removeOpening(id) {
    var m = currentModule();
    if (!m) return;
    mutate(function () { m.openings = m.openings.filter(function (o) { return o.id !== id; }); }, 'Opening removed. Undo is available.');
  }
  function addZone() {
    var m = currentModule();
    if (!m) return;
    mutate(function () {
      var dims = Schema.moduleDefaults(m.type);
      var start = m.zones.length ? Math.max.apply(null, m.zones.map(function (z) { return z.end_m; })) : 0;
      var end = Math.min(dims.length_m, start + 3);
      if (end - start < 0.6) { start = 0; end = Math.min(dims.length_m, 3); }
      m.zones.push({ id: m.id + '-z' + (m.zones.length + 2), name: 'New room', type: 'living', start_m: start, end_m: end, accessibility: '' });
      state.selectedZone = m.zones[m.zones.length - 1].id;
    }, 'Room zone added. Adjust its type and range.');
  }
  function removeZone(id) {
    var m = currentModule();
    if (!m) return;
    mutate(function () { m.zones = m.zones.filter(function (z) { return z.id !== id; }); }, 'Room zone removed. Undo is available.');
  }
  function addPorch() {
    var m = currentModule();
    if (!m) return;
    mutate(function () {
      var len = Math.min(4, m.nominal.length_m - 1);
      state.design.porches.push({ id: nextId('p', state.design.porches), module: m.id, face: 'south', start_m: 1, length_m: len, depth_m: 2.8, screened: true, roof: true, note: 'Screened outdoor room.' });
    }, 'Porch added. Adjust its module, face and dimensions.');
  }
  function removePorch(index) {
    mutate(function () {
      var p = state.design.porches[index];
      state.design.porches.splice(index, 1);
      if (p) state.design.decks = state.design.decks.filter(function (d) { return d.porch !== p.id; });
    }, 'Porch removed. Undo is available.');
  }
  function addTrellis() {
    var m = currentModule();
    if (!m) return;
    mutate(function () {
      state.design.trellises.push({ id: nextId('t', state.design.trellises), module: m.id, face: 'west', start_m: 0.3, length_m: Math.min(1.8, m.nominal.width_m - 0.5), offset_m: 0.35, height_m: 3.2, note: 'Independent climbing-plant trellis.' });
    }, 'Trellis added. It stands on its own footings, clear of the rainscreen.');
  }
  function addDeck() {
    if (!state.design.porches.length) { announce('Add a porch before adding a deck.'); return; }
    mutate(function () {
      state.design.decks.push({ id: nextId('d', state.design.decks), porch: state.design.porches[0].id, projection_m: 1.2, note: 'Deck beyond the porch.' });
    }, 'Deck added. Adjust its projection.');
  }
  function addConnection() {
    if (state.design.modules.length < 2) { announce('A connector needs at least two containers.'); return; }
    mutate(function () {
      var a = state.design.modules[0], b = state.design.modules[1];
      state.design.connections.push({
        id: nextId('c', state.design.connections), from: a.id, to: b.id, type: 'timber-link',
        position_m: [(a.position_m[0] + b.position_m[0]) / 2, (a.position_m[1] + b.position_m[1]) / 2],
        length_m: 2, width_m: 2, rotation_deg: 0, roof: true, screened: false, note: 'Timber connector; adjust its position and size.'
      });
    }, 'Connector added. Adjust its position, size and screening; it may conflict until placed.');
  }

  function onAction(event) {
    var button = event.target.closest ? event.target.closest('[data-action]') : null;
    if (!button) return;
    var action = button.getAttribute('data-action');
    if (action === 'select-module') {
      state.selectedModule = button.getAttribute('data-module');
      renderControls();
      announce('Module ' + state.selectedModule + ' selected for openings and rooms.');
      return;
    }
    if (action === 'remove-opening') { removeOpening(button.getAttribute('data-id')); return; }
    if (action === 'remove-zone') { removeZone(button.getAttribute('data-id')); return; }
    if (action === 'remove-porch') { removePorch(Number(button.getAttribute('data-index'))); return; }
    if (action === 'remove-deck') { mutate(function () { state.design.decks.splice(Number(button.getAttribute('data-index')), 1); }, 'Deck removed. Undo is available.'); return; }
    if (action === 'remove-trellis') { mutate(function () { state.design.trellises.splice(Number(button.getAttribute('data-index')), 1); }, 'Trellis removed. Undo is available.'); return; }
    if (action === 'remove-vegetation') { mutate(function () { state.design.vegetation.splice(Number(button.getAttribute('data-index')), 1); }, 'Vegetation system removed. Undo is available.'); return; }
    if (action === 'remove-connection') { mutate(function () { state.design.connections.splice(Number(button.getAttribute('data-index')), 1); }, 'Connector removed. Undo is available.'); }
  }

  function undo() {
    if (!state.history.length) return;
    state.future.push(clone(state.design));
    state.design = state.history.pop();
    state.editBase = null;
    renderAll();
    announce('Undo. ' + (state.history.length ? 'More steps are available.' : 'Back to the loaded design.'));
  }
  function redo() {
    if (!state.future.length) return;
    state.history.push(clone(state.design));
    state.design = state.future.pop();
    state.editBase = null;
    renderAll();
    announce('Redo.');
  }

  /* ---------------- export ---------------- */

  function download(name, content, type) {
    var blob = new Blob([content], { type: type || 'application/octet-stream' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }
  function exportDesignJSON() {
    var out = clone(state.design);
    out.provenance = Object.assign({ exported_with: 'Containers Hamlet Design Lab 2.0.0', review_required: true }, out.provenance || {});
    out.assessment = { generated_by: 'Containers Hamlet Design Lab 2.0.0', authoritative: false, ok: Model.assess(out).ok, items: Model.assess(out).items };
    download(slug(out.name) + '-design.json', JSON.stringify(out, null, 2) + '\n', 'application/json');
    $('export-status').textContent = 'Downloaded the editable design JSON. Reopen it with Import JSON.';
  }
  function summaryText() {
    var s = Schema.summary(state.design);
    var a = Model.assess(state.design);
    var lines = [];
    lines.push('# ' + state.design.name);
    lines.push('');
    lines.push('Concept only. Not engineered, not permit-ready and not a building code assessment.');
    lines.push('');
    var met = Model.metrics(state.design);
    var access = Model.accessibilityProfile(state.design);
    var review = Model.structuralReview(state.design);
    lines.push('- Schema: ' + state.design.schema);
    lines.push('- Storeys: ' + met.storeyCount + ' occupied (' + met.levels.map(function (l) { return l.name + ' at ' + n(l.elevation_m, 2) + ' m'; }).join('; ') + ')');
    lines.push('- Containers: ' + s.moduleCount + ' × ' + s.types.join(', '));
    lines.push('- Gross floor area: ' + n(met.grossFloorArea_m2) + ' m² nominal modules plus glazed links');
    lines.push('- Ground coverage: ' + n(met.groundCoverage_m2) + ' m² projected footprint');
    lines.push('- Building height: ' + n(met.buildingHeight_m) + ' m to the roof');
    lines.push('- Roof form: ' + state.design.roof_form.type + ' · ' + state.design.roof_form.pitch_deg + '° pitch · ' + n(state.design.roof_form.overhang_m, 2) + ' m overhang');
    lines.push('- Nominal module area: ' + n(s.nominalFootprint_m2) + ' m² before external insulation');
    lines.push('- Interior zones: ' + s.zoneCount);
    lines.push('- Openings: ' + s.openingCount);
    lines.push('- Screened porch: ' + n(s.screenedPorch_m2) + ' m²');
    lines.push('- Accessibility: ' + access.classification + ' · ' + access.label);
    lines.push('- Structural review: ' + review.model_status + ' · ' + review.summary);
    lines.push('- Maximum external insulation: ' + s.maxInsulation_mm + ' mm');
    lines.push('');
    lines.push('## Containers');
    state.design.modules.forEach(function (m) {
      lines.push('- ' + m.id + ': ' + m.type + ' on level ' + (m.storey + 1) + ' at ' + m.position_m[0] + ', ' + m.position_m[1] + ' m, base elevation ' + n(m.elevation_m, 2) + ' m, rotation ' + m.rotation_deg + '°, ' + m.insulation.thickness_mm + ' mm insulation, ' + CLAD_LABEL[m.cladding.type] + ', ' + ROOF_LABEL[m.roof.type] + '. Support: ' + m.support.type + (m.support.references.length ? ' (' + m.support.references.join(', ') + ')' : '') + ', ' + (m.support.verified ? 'professionally verified' : 'not professionally verified') + '.');
    });
    lines.push('');
    lines.push('## Openings');
    state.design.modules.forEach(function (m) {
      m.openings.forEach(function (o) { lines.push('- ' + m.id + ' / ' + o.id + ': ' + OPENING_LABEL[o.type] + ' on ' + o.face + ', centre ' + o.position_m + ' m, ' + o.width_m + ' × ' + o.height_m + ' m, sill ' + o.sill_m + ' m'); });
    });
    lines.push('');
    lines.push('## Rooms');
    state.design.modules.forEach(function (m) {
      m.zones.forEach(function (z) { lines.push('- ' + m.id + ' / ' + z.name + ': ' + ZONE_LABEL[z.type] + ' from ' + z.start_m + ' to ' + z.end_m + ' m' + (z.accessibility ? '. ' + z.accessibility : '')); });
    });
    lines.push('');
    lines.push('## Design checks');
    lines.push(a.ok ? 'No invalid data or geometry; professional review still required.' : 'Invalid data or geometry must be fixed before drawings are exported.');
    a.items.forEach(function (i) { lines.push('- [' + i.category + '] ' + i.message); });
    lines.push('');
    lines.push('## Provenance and licence');
    lines.push('- ' + (state.design.provenance.authors || 'Containers Hamlet contributors') + ', ' + (state.design.provenance.created || '2026') + '.');
    lines.push('- Method: ' + (state.design.provenance.method || 'Design Lab concept geometry.'));
    lines.push('- Verification: ' + (state.design.provenance.verification || 'None.'));
    lines.push('- Code: AGPL-3.0-or-later. Original concept documentation, drawings and data: CC BY-SA 4.0.');
    lines.push('- Not reviewed by an architect, engineer, building official or accessibility consultant.');
    return lines.join('\n') + '\n';
  }
  function exportSummary() { download(slug(state.design.name) + '-summary.md', summaryText(), 'text/markdown'); $('export-status').textContent = 'Downloaded the design summary.'; }
  function exportSVG(kind) {
    var svg;
    if (kind === 'wall') svg = Model.wallSectionSVG(state.design, state.selectedModule, { idPrefix: 'export-wall' });
    else if (kind === 'plan') svg = Model.renderPlan(state.design, { idPrefix: 'export-plan' });
    else if (kind === 'plan-ground') svg = Model.renderPlan(state.design, { idPrefix: 'export-plan-ground', storey: 0 });
    else if (kind === 'plan-upper') svg = Model.renderPlan(state.design, { idPrefix: 'export-plan-upper', storey: 1 });
    else if (kind === 'elevation-south') svg = Model.renderElevation(state.design, { idPrefix: 'export-elevation-south', side: 'south' });
    else if (kind === 'section') svg = Model.renderSection(state.design, { idPrefix: 'export-section' });
    else if (kind === 'exploded') svg = Model.renderExploded(state.design, { idPrefix: 'export-exploded' });
    else if (kind === 'solar-summer') svg = Model.renderSolarStudy(state.design, { idPrefix: 'export-solar-summer', season: 'summer' });
    else if (kind === 'solar-winter') svg = Model.renderSolarStudy(state.design, { idPrefix: 'export-solar-winter', season: 'winter' });
    else svg = Model.renderAxo(state.design, { idPrefix: 'export-' + kind, mode: kind === 'cutaway' ? 'cutaway' : undefined, focus: kind === 'porch' ? 'outdoor' : undefined, season: kind === 'winter' ? 'winter' : undefined });
    download(slug(state.design.name) + '-' + kind + '.svg', '<?xml version="1.0" encoding="UTF-8"?>\n' + svg, 'image/svg+xml');
    $('export-status').textContent = 'Downloaded the ' + kind + ' SVG.';
  }

  var CRC_TABLE = (function () {
    var table = [], c;
    for (var n = 0; n < 256; n++) {
      c = n;
      for (var k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
    return table;
  })();
  function crc32(bytes) {
    var c = 0xffffffff;
    for (var i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }
  function zip(files) {
    var encoder = new TextEncoder();
    var parts = [], central = [], offset = 0;
    function u16(v) { return [v & 255, (v >>> 8) & 255]; }
    function u32(v) { return [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255]; }
    var time = u16(0); var date = u16((2026 - 1980) << 9 | 1 << 5 | 1);
    files.forEach(function (f) {
      var name = encoder.encode(f.name);
      var data = typeof f.data === 'string' ? encoder.encode(f.data) : f.data;
      var crc = crc32(data);
      var local = [].concat(u32(0x04034b50), u16(20), u16(0), u16(0), time, date, u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0));
      parts.push(new Uint8Array(local), name, data);
      central.push({ name: name, crc: crc, size: data.length, offset: offset });
      offset += local.length + name.length + data.length;
    });
    var centralStart = offset;
    central.forEach(function (c) {
      var h = [].concat(u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), time, date, u32(c.crc), u32(c.size), u32(c.size), u16(c.name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(c.offset));
      parts.push(new Uint8Array(h), c.name);
      offset += h.length + c.name.length;
    });
    var end = [].concat(u32(0x06054b50), u16(0), u16(0), u16(central.length), u16(central.length), u32(offset - centralStart), u32(centralStart), u16(0));
    parts.push(new Uint8Array(end));
    return new Blob(parts, { type: 'application/zip' });
  }
  function exportZip() {
    var base = slug(state.design.name);
    var files = [
      { name: base + '-design.json', data: JSON.stringify(state.design, null, 2) + '\n' },
      { name: base + '-plan.svg', data: Model.renderPlan(state.design, { idPrefix: 'zip-plan' }) },
      { name: base + '-plan-ground.svg', data: Model.renderPlan(state.design, { idPrefix: 'zip-plan-ground', storey: 0 }) },
      { name: base + '-plan-upper.svg', data: Model.renderPlan(state.design, { idPrefix: 'zip-plan-upper', storey: 1 }) },
      { name: base + '-elevation-south.svg', data: Model.renderElevation(state.design, { idPrefix: 'zip-elevation-south', side: 'south' }) },
      { name: base + '-elevation-north.svg', data: Model.renderElevation(state.design, { idPrefix: 'zip-elevation-north', side: 'north' }) },
      { name: base + '-elevation-east.svg', data: Model.renderElevation(state.design, { idPrefix: 'zip-elevation-east', side: 'east' }) },
      { name: base + '-elevation-west.svg', data: Model.renderElevation(state.design, { idPrefix: 'zip-elevation-west', side: 'west' }) },
      { name: base + '-section.svg', data: Model.renderSection(state.design, { idPrefix: 'zip-section' }) },
      { name: base + '-exploded.svg', data: Model.renderExploded(state.design, { idPrefix: 'zip-exploded' }) },
      { name: base + '-solar-summer.svg', data: Model.renderSolarStudy(state.design, { idPrefix: 'zip-solar-summer', season: 'summer' }) },
      { name: base + '-solar-winter.svg', data: Model.renderSolarStudy(state.design, { idPrefix: 'zip-solar-winter', season: 'winter' }) },
      { name: base + '-exterior.svg', data: Model.renderAxo(state.design, { idPrefix: 'zip-exterior' }) },
      { name: base + '-cutaway.svg', data: Model.renderAxo(state.design, { idPrefix: 'zip-cutaway', mode: 'cutaway' }) },
      { name: base + '-porch.svg', data: Model.renderAxo(state.design, { idPrefix: 'zip-porch', focus: 'outdoor' }) },
      { name: base + '-winter.svg', data: Model.renderAxo(state.design, { idPrefix: 'zip-winter', season: 'winter' }) },
      { name: base + '-wall.svg', data: Model.wallSectionSVG(state.design, state.selectedModule, { idPrefix: 'zip-wall' }) },
      { name: base + '-summary.md', data: summaryText() },
      { name: 'NOTICE.txt', data: 'Containers Hamlet Design Lab\n\nConcept only. Not engineered, not permit-ready and not a building code assessment.\nEditor code: AGPL-3.0-or-later. Original concept data, drawings and documentation: CC BY-SA 4.0.\nNo personal information is included. The design remains the responsibility of its author and requires professional review before construction.\n' }
    ];
    var blob = zip(files);
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = base + '-design-lab.zip';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    $('export-status').textContent = 'Downloaded a ZIP with the JSON, plan, exterior, cutaway, porch/deck, winter, summary and notice.';
  }

  /* ---------------- import ---------------- */

  function importFile(file) {
    file.text().then(function (text) {
      var raw = JSON.parse(text);
      var design = null, report = null;
      var migrated = Schema.migrateAny(raw);
      design = migrated.design; report = migrated.report;
      var check = Schema.validateSchema(design);
      if (!check.ok) throw new Error(check.errors.map(function (e) { return e.message; }).join(' '));
      var unknown = check.unknownKeys || [];
      if (unknown.length) {
        design.provenance = Object.assign({}, design.provenance, { imported_unknown: {} });
        unknown.forEach(function (k) { design.provenance.imported_unknown[k] = raw[k]; });
      }
      state.design = design;
      state.preset = null;
      state.history = [];
      state.future = [];
      state.editBase = null;
      state.editStorey = 'all';
      state.planStorey = 'all';
      state.illustrationConfig = Illustration.defaultConfig(state.design);
      state.illustrationScene = null;
      state.illustrationGeneratedHash = null;
      state.illustrationReferenceSvg = null;
      state.selectedModule = state.design.modules[0].id;
      state.selectedOpening = state.design.modules[0].openings[0] ? state.design.modules[0].openings[0].id : null;
      state.selectedZone = state.design.modules[0].zones[0] ? state.design.modules[0].zones[0].id : null;
      renderAll();
      var msg = 'Imported design. ';
      if (report && report.from && report.from !== Schema.SCHEMA) msg += 'Migrated from ' + report.from + '. ' + (report.warnings || []).join(' ');
      var assessment = Model.assess(state.design);
      if (!assessment.ok) msg += ' The imported geometry has invalid issues; fix them before exporting drawings.';
      announce(msg);
    }).catch(function (err) {
      announce('Import failed: ' + err.message);
    });
  }

  /* ---------------- wiring ---------------- */

  function renderArrangementFromState() {
    if (!state.design) return;
    if (state.design.modules.length === 1) state.arrangement = 'single';
    else if (state.design.modules.length === 2) state.arrangement = state.design.modules[1].rotation_deg === 90 ? 'l-shape' : 'parallel';
    else state.arrangement = 'courtyard';
    if ($('arrangement')) $('arrangement').value = state.arrangement;
  }

  function init() {
    if (!EDITABLE.length) { announce('No editable presets were found.'); return; }
    renderPresetOptions();
    var params = new URLSearchParams(location.search);
    var requested = params.get('preset');
    var initial = EDITABLE.filter(function (c) { return c.id === requested; })[0] || EDITABLE.filter(function (c) { return c.id === DEFAULT_PRESET_ID; })[0] || EDITABLE[0];
    loadPreset(initial.id, true);
    if (state.design) renderArrangementFromState();
    announce('Loaded ' + initial.name + '. Six hamlet residences and three archive concepts are editable; the gallery also preserves six inspiration concepts.');

    $('preset').addEventListener('change', function () { if ($('preset').value) loadPreset($('preset').value); });
    $('undo').addEventListener('click', undo);
    $('redo').addEventListener('click', redo);
    $('reset').addEventListener('click', function () { if (state.preset) loadPreset(state.preset); else loadPreset(DEFAULT_PRESET_ID); });
    $('add-module').addEventListener('click', addModule);
    $('remove-module').addEventListener('click', removeModule);
    $('apply-arrangement').addEventListener('click', applyArrangement);
    $('stack-above').addEventListener('click', stackAbove);
    $('align-below').addEventListener('click', alignBelow);
    $('offset-upper').addEventListener('click', offsetUpper);
    $('rotate-upper').addEventListener('click', rotateUpper);
    $('perpendicular-stack').addEventListener('click', perpendicularStack);
    $('inspect-support').addEventListener('click', inspectSupport);
    ['edit-storey', 'plan-level'].forEach(function (id) {
      var el = $(id);
      if (el) el.addEventListener('change', function () {
        state.editStorey = el.value;
        state.planStorey = el.value;
        renderControls();
        renderVisuals();
        focusPlanModule(state.selectedModule);
        announce('Editing level: ' + (el.value === 'all' ? 'all levels' : 'level ' + (Number(el.value) + 1)) + '.');
      });
    });
    $('apply-roof').addEventListener('click', function () { renderControls(); renderVisuals(); announce('Roof form applied to the generated views. Drainage, snow, wind and maintenance remain review items.'); });
    $('apply-access').addEventListener('click', function () { renderControls(); renderVisuals(); announce('Accessibility record updated. This is a design intent, not a compliance assessment.'); });
    ['illus-view', 'illus-style', 'illus-season', 'illus-time', 'illus-weather', 'illus-material-policy', 'illus-height', 'illus-lens', 'illus-people'].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.addEventListener('change', function () {
        state.illustrationConfig = readIllustrationConfig();
        state.illustrationScene = null;
        state.illustrationReferenceSvg = null;
        renderIllustrationPreview();
        announce('Illustration settings changed. Generate a new prompt and reference.');
      });
      if (el.type === 'number') el.addEventListener('input', function () { state.illustrationConfig = readIllustrationConfig(); state.illustrationScene = null; state.illustrationReferenceSvg = null; renderIllustrationPreview(); });
    });
    $('illus-generate').addEventListener('click', generateIllustration);
    $('illus-copy').addEventListener('click', copyIllustrationPrompt);
    $('illus-download-prompt').addEventListener('click', downloadIllustrationPrompt);
    $('illus-download-config').addEventListener('click', downloadIllustrationConfig);
    $('illus-download-package').addEventListener('click', downloadIllustrationPackage);
    $('edit-mode').addEventListener('change', function () {
      state.editMode = $('edit-mode').value;
      announce(state.editMode === 'interior' ? 'Detailed interior editing. Room polygons, partitions, doors and fixtures are available.' : 'Simple container arrangement editing.');
    });
    $('migrate-interior').addEventListener('click', ensureInterior);
    $('add-interior-room').addEventListener('click', addInteriorRoom);
    $('add-partition').addEventListener('click', addPartition);
    $('add-door').addEventListener('click', addInteriorDoor);
    $('add-fixture').addEventListener('click', addFixture);
    $('interior-rooms').addEventListener('change', function (event) {
      var card = event.target.closest ? event.target.closest('[data-interior-room]') : null;
      var fieldName = event.target.getAttribute && event.target.getAttribute('data-interior-room-field');
      if (!card || !fieldName) return;
      var room = state.design.interior.rooms.filter(function (r) { return r.id === card.getAttribute('data-interior-room'); })[0];
      if (!room) return;
      mutate(function () {
        if (fieldName === 'name') room.name = event.target.value;
        else if (fieldName === 'type') room.type = event.target.value;
        else {
          var box = interiorRoomBox(room);
          box[fieldName] = Number(event.target.value);
          room.polygon = Interior.rectPolygon(box.x, box.y, Math.max(0.3, box.w), Math.max(0.3, box.d));
        }
        room.provenance = 'authored';
        state.design.interior.status = 'authored';
      }, 'Interior room updated.');
    });
    $('interior-details').addEventListener('click', function (event) {
      var button = event.target.closest ? event.target.closest('[data-action]') : null;
      if (!button) return;
      var action = button.getAttribute('data-action');
      if (action === 'remove-partition') removeInteriorItem('partition', button.getAttribute('data-id'));
      if (action === 'remove-door') removeInteriorItem('door', button.getAttribute('data-id'));
      if (action === 'remove-fixture') removeInteriorItem('fixture', button.getAttribute('data-id'));
    });
    $('interior-rooms').addEventListener('click', function (event) {
      var button = event.target.closest ? event.target.closest('[data-action="remove-interior-room"]') : null;
      if (button) removeInteriorItem('room', button.getAttribute('data-room'));
    });
    $('module-controls').addEventListener('change', function (event) {
      var input = event.target;
      if (!input || !input.getAttribute || !input.getAttribute('data-support-refs')) return;
      var idx = Number(input.getAttribute('data-support-refs'));
      var m = state.design.modules[idx];
      if (!m) return;
      var refs = input.value.split(',').map(function (x) { return x.trim(); }).filter(Boolean);
      mutate(function () {
        m.support.references = refs;
        m.support.type = refs.length ? 'module' : m.storey === 0 ? 'ground' : 'not-assessed';
        m.support.verified = false;
        m.support.note = refs.length ? 'Declared support intent only; capacity and connections are not verified.' : 'Support intent not recorded.';
      }, 'Support references for ' + m.id + ' recorded as design intent. No capacity is calculated.');
    });
    $('add-opening').addEventListener('click', addOpening);
    $('remove-opening').addEventListener('click', function () { if (state.selectedOpening) removeOpening(state.selectedOpening); else announce('Choose an opening card to remove.'); });
    $('add-zone').addEventListener('click', addZone);
    $('remove-zone').addEventListener('click', function () { if (state.selectedZone) removeZone(state.selectedZone); else announce('Choose a room card to remove.'); });
    $('add-porch').addEventListener('click', addPorch);
    $('remove-porch').addEventListener('click', function () { if (state.design.porches.length) removePorch(state.design.porches.length - 1); else announce('There is no porch to remove.'); });
    $('add-deck').addEventListener('click', addDeck);
    $('add-trellis').addEventListener('click', addTrellis);
    $('add-connection').addEventListener('click', addConnection);
    $('add-vegetation').addEventListener('click', addVegetation);
    $('envelope-controls').addEventListener('change', applyEnvelopeChoice);
    $('foundation-controls').addEventListener('change', applyFoundationChoice);
    $('finish-controls').addEventListener('change', applyFinishChoice);
    $('fire-controls').addEventListener('change', applyFireChoice);
    $('season').addEventListener('change', function () { state.season = $('season').value; renderVisuals(); announce('Season switched to ' + state.season + '. The plan and cutaway are unchanged.'); });
    $('apply-colour').addEventListener('click', function () {
      var colour = $('default-colour').value;
      mutate(function () { state.design.modules.forEach(function (m) { m.cladding.colour = colour; }); }, 'Cladding colour applied to all containers.');
    });
    $('opening-target').addEventListener('change', function () { state.selectedModule = $('opening-target').value; renderOpenings(); });
    $('zone-target').addEventListener('change', function () { state.selectedModule = $('zone-target').value; renderZones(); });
    $('controls').addEventListener('submit', function (e) { e.preventDefault(); });
    $('controls').addEventListener('input', onFieldInput);
    $('controls').addEventListener('change', onFieldCommit);
    ['homesite', 'site-rotation'].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.addEventListener('focusin', function () { if (!state.editBase) state.editBase = clone(state.design); });
      el.addEventListener('input', onFieldInput);
      el.addEventListener('change', onFieldCommit);
    });
    $('controls').addEventListener('click', onAction);
    $('plan').addEventListener('click', function (e) {
      var hit = e.target.closest ? e.target.closest('.plan-module-hit') : null;
      if (!hit || planDrag) return;
      state.selectedModule = hit.getAttribute('data-module-id');
      renderControls();
      renderVisuals();
      focusPlanModule(state.selectedModule);
      announce('Module ' + state.selectedModule + ' selected from the plan. Drag it or use the arrow keys; R rotates.');
    });

    $('plan').addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      var hit = e.target.closest ? e.target.closest('.plan-module-hit') : null;
      if (!hit) return;
      e.preventDefault();
      var id = hit.getAttribute('data-module-id');
      var m = state.design.modules.filter(function (x) { return x.id === id; })[0];
      var svg = $('plan').querySelector('svg');
      if (!m || !svg || !svg.getScreenCTM) return;
      state.selectedModule = id;
      renderControls();
      renderVisuals();
      svg = $('plan').querySelector('svg');
      var planScale = Number(svg.getAttribute('data-plan-scale')) || 1;
      var planWidth = Number(svg.getAttribute('data-plan-width')) || 1040;
      var renderedWidth = svg.getBoundingClientRect().width || planWidth;
      var pixelsPerMetre = planScale * (renderedWidth / planWidth);
      planDrag = { id: id, startX: e.clientX, startY: e.clientY, x: m.position_m[0], y: m.position_m[1], pixelsPerMetre: pixelsPerMetre, before: clone(state.design), moved: false };
      document.body.classList.add('dragging-module');
      announce('Module ' + id + ' selected for dragging.');
    });

    document.addEventListener('pointermove', function (e) {
      if (!planDrag) return;
      e.preventDefault();
      var m = state.design.modules.filter(function (x) { return x.id === planDrag.id; })[0];
      if (!m) return;
      var dx = (e.clientX - planDrag.startX) / planDrag.pixelsPerMetre;
      var dy = (e.clientY - planDrag.startY) / planDrag.pixelsPerMetre;
      if (Math.abs(dx) + Math.abs(dy) > 0.02) planDrag.moved = true;
      m.position_m[0] = Math.round((planDrag.x + dx) * 10) / 10;
      m.position_m[1] = Math.round((planDrag.y + dy) * 10) / 10;
      renderVisuals();
      syncModulePositionInputs(m);
    });

    document.addEventListener('pointerup', function () {
      if (!planDrag) return;
      var drag = planDrag;
      planDrag = null;
      document.body.classList.remove('dragging-module');
      if (drag.moved) {
        pushHistory(drag.before);
        renderControls();
        renderVisuals();
        focusPlanModule(drag.id);
        var m = state.design.modules.filter(function (x) { return x.id === drag.id; })[0];
        announce('Module ' + drag.id + ' moved to ' + m.position_m[0] + ', ' + m.position_m[1] + ' metres. Undo is available.');
      }
    });

    $('plan').addEventListener('keydown', function (e) {
      var hit = e.target.closest ? e.target.closest('.plan-module-hit') : null;
      if (!hit) return;
      var m = state.design.modules.filter(function (x) { return x.id === hit.getAttribute('data-module-id'); })[0];
      if (!m) return;
      var step = e.shiftKey ? 0.5 : 0.1;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        state.selectedModule = m.id;
        renderControls();
        renderVisuals();
        focusPlanModule(m.id);
        announce('Module ' + m.id + ' selected.');
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        var dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        var dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        state.selectedModule = m.id;
        nudgeModule(m, dx, dy);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        state.selectedModule = m.id;
        rotateModule(m, e.shiftKey ? -15 : 15);
      } else if (e.key === 'PageUp' || e.key === 'PageDown' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        if (e.key === 'a' || e.key === 'A') state.planStorey = 'all';
        else if (e.key === 'PageUp') state.planStorey = '1';
        else state.planStorey = '0';
        state.editStorey = state.planStorey;
        renderControls();
        renderVisuals();
        focusPlanModule(state.selectedModule);
        announce('Plan level: ' + (state.planStorey === 'all' ? 'all levels' : 'level ' + (Number(state.planStorey) + 1)) + '.');
      }
    });

    $('plan').addEventListener('focusin', function (e) {
      var hit = e.target.closest ? e.target.closest('.plan-module-hit') : null;
      if (!hit) return;
      var id = hit.getAttribute('data-module-id');
      if (state.selectedModule !== id) {
        state.selectedModule = id;
        renderControls();
      }
    });
    $('controls').addEventListener('focusin', function (e) {
      var card = e.target.closest ? e.target.closest('[data-module-card]') : null;
      if (card) state.selectedModule = card.getAttribute('data-module-card');
      var oc = e.target.closest ? e.target.closest('[data-opening-id]') : null;
      if (oc) state.selectedOpening = oc.getAttribute('data-opening-id');
      var zc = e.target.closest ? e.target.closest('[data-zone-id]') : null;
      if (zc) state.selectedZone = zc.getAttribute('data-zone-id');
    });
    $('export-json').addEventListener('click', exportDesignJSON);
    ['plan', 'plan-ground', 'plan-upper', 'elevation-south', 'section', 'exploded', 'solar-summer', 'solar-winter', 'exterior', 'cutaway', 'porch', 'winter'].forEach(function (kind) {
      var el = $('export-' + kind);
      if (el) el.addEventListener('click', function () { exportSVG(kind); });
    });
    $('download-wall').addEventListener('click', function () { exportSVG('wall'); });
    $('export-wall').addEventListener('click', function () { exportSVG('wall'); });
    $('export-summary').addEventListener('click', exportSummary);
    $('export-zip').addEventListener('click', exportZip);
    $('import-button').addEventListener('click', function () { $('import-file').click(); });
    $('import-file').addEventListener('change', function (e) { var f = e.target.files[0]; if (f) importFile(f); e.target.value = ''; });
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
        e.preventDefault(); if (e.shiftKey) redo(); else undo();
      }
    });
  }

  try { init(); } catch (err) { announce('The editor could not start: ' + err.message); if (window.console) console.error(err); }
})();
