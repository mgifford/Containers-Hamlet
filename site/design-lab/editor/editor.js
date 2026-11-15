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
  var $ = function (id) { return document.getElementById(id); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var clone = function (v) { return JSON.parse(JSON.stringify(v)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var n = function (v, d) { return Number(v).toFixed(d == null ? 1 : d); };
  var slug = function (s) { return String(s || 'container-home').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'container-home'; };

  if (!Schema || !Model || !DATA || !SITE) {
    var missing = $('status');
    if (missing) missing.textContent = 'The Design Lab scripts did not load. Please reload the page.';
    return;
  }

  var EDITABLE = DATA.concepts.filter(function (c) { return c.editable; });
  var state = {
    design: null,
    preset: null,
    history: [],
    future: [],
    selectedModule: null,
    selectedOpening: null,
    selectedZone: null,
    editBase: null,
    arrangement: 'single'
  };

  var ZONE_LABEL = { sleeping: 'Sleeping', bathroom: 'Bathroom', kitchen: 'Kitchen', living: 'Living', dining: 'Dining', work: 'Workspace', storage: 'Storage', circulation: 'Circulation' };
  var FACE_LABEL = { north: 'North', south: 'South', east: 'East', west: 'West' };
  var OPENING_LABEL = { window: 'Window', door: 'Door', 'sliding-door': 'Sliding door', opening: 'Open passage' };
  var ROOF_LABEL = { solar: 'Solar array', green: 'Green roof', biosolar: 'Biosolar roof', membrane: 'Membrane roof' };
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

  function loadPreset(id, silent) {
    var concept = EDITABLE.filter(function (c) { return c.id === id; })[0] || EDITABLE[0];
    if (!concept) return;
    state.preset = concept.id;
    state.design = clone(concept);
    state.design.site = Object.assign({ homesite: 'a', rotation_deg: 0, note: 'Illustrative placement only; not part of the published community layout.' }, state.design.site || {});
    state.design.provenance = Object.assign({ exported_with: 'Containers Hamlet Design Lab 1.3.0' }, state.design.provenance || {});
    state.history = [];
    state.future = [];
    state.editBase = null;
    state.selectedModule = state.design.modules[0].id;
    state.selectedOpening = state.design.modules[0].openings[0] ? state.design.modules[0].openings[0].id : null;
    state.selectedZone = state.design.modules[0].zones[0] ? state.design.modules[0].zones[0].id : null;
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
        field('Rotation (degrees)', numberInput('modules.' + i + '.rotation_deg', m.rotation_deg, idBase + '-rot', ' step="1" min="-180" max="180"')) +
        field('External insulation (mm)', numberInput('modules.' + i + '.insulation.thickness_mm', m.insulation.thickness_mm, idBase + '-ins', ' step="10" min="50" max="300"')) +
        field('Cladding', selectInput('modules.' + i + '.cladding.type', m.cladding.type, idBase + '-clad', Object.keys(CLAD_LABEL).map(function (k) { return option(k, CLAD_LABEL[k], m.cladding.type); }).join(''))) +
        field('Cladding colour', selectInput('modules.' + i + '.cladding.colour', m.cladding.colour, idBase + '-colour', COLOURS.map(function (c) { return option(c[0], c[1], m.cladding.colour); }).join(''))) +
        field('Roof', selectInput('modules.' + i + '.roof.type', m.roof.type, idBase + '-roof', Object.keys(ROOF_LABEL).map(function (k) { return option(k, ROOF_LABEL[k], m.roof.type); }).join(''))) +
        field('Structural wall removal', selectInput('modules.' + i + '.structure.wall_removal', m.structure.wall_removal, idBase + '-wall', option('none', 'No large removal', m.structure.wall_removal) + option('partial', 'Partial wall removal', m.structure.wall_removal) + option('large', 'Large structural removal', m.structure.wall_removal))) +
        field('Conceptual cantilever (m)', numberInput('modules.' + i + '.structure.cantilever_m', m.structure.cantilever_m || 0, idBase + '-cant', ' step="0.1" min="0" max="2"')) +
        '</div>' +
        '<button type="button" class="secondary" data-action="select-module" data-module="' + esc(m.id) + '">Select module for openings and rooms</button>' +
        '</fieldset>';
    }).join('');

    var moduleOptions = d.modules.map(function (m) { return option(m.id, m.id + ' · ' + moduleTypeLabel(m.type), state.selectedModule); }).join('');
    $('opening-target').innerHTML = moduleOptions;
    $('zone-target').innerHTML = moduleOptions;
    $('homesite').innerHTML = SITE.buildings.map(function (b) { return option(b.id, b.name + (b.short_name ? ' · ' + b.short_name : ''), d.site.homesite); }).join('');
    $('site-rotation').value = d.site.rotation_deg || 0;
    renderOpenings();
    renderZones();
    renderPorches();
    renderDecks();
    renderTrellises();
    renderConnections();
    renderThermal();
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

  function renderVisuals() {
    var d = state.design;
    var assessment = Model.assess(d);
    var summary = Schema.summary(d);
    try {
      $('plan').innerHTML = Model.renderPlan(d, { idPrefix: 'editor-plan' });
      $('exterior').innerHTML = Model.renderAxo(d, { idPrefix: 'editor-exterior' });
      $('cutaway').innerHTML = Model.renderAxo(d, { idPrefix: 'editor-cutaway', mode: 'cutaway' });
    } catch (err) {
      announce('The view could not be drawn: ' + err.message);
    }
    renderWarnings(assessment);
    renderSummary(d, summary, assessment);
    renderHamlet(d);
    $('export-plan').disabled = !assessment.ok;
    $('export-exterior').disabled = !assessment.ok;
    $('export-cutaway').disabled = !assessment.ok;
    $('export-porch').disabled = !assessment.ok;
    $('export-winter').disabled = !assessment.ok;
    $('export-zip').disabled = !assessment.ok;
    $('export-summary').disabled = !assessment.ok;
  }

  function renderWarnings(assessment) {
    var groups = { invalid: [], engineering: [], accessibility: [], review: [] };
    assessment.items.forEach(function (i) { if (groups[i.category]) groups[i.category].push(i); });
    var labels = { invalid: 'Invalid geometry', engineering: 'Engineering review', accessibility: 'Accessibility review', review: 'Professional review' };
    var status = $('assessment-status');
    if (status) status.textContent = assessment.ok ? 'No invalid geometry. ' + groups.engineering.length + ' engineering, ' + groups.accessibility.length + ' accessibility and ' + groups.review.length + ' professional-review prompts.' : groups.invalid.length + ' invalid geometry issue' + (groups.invalid.length === 1 ? '' : 's') + '. Fix these before exporting drawings.';
    var out = '';
    Object.keys(groups).forEach(function (key) {
      if (!groups[key].length) return;
      out += '<div class="warning-group"><h3><span class="badge ' + key + '">' + esc(labels[key]) + '</span> ' + groups[key].length + '</h3><ul>' + groups[key].map(function (i) { return '<li>' + esc(i.message) + '</li>'; }).join('') + '</ul></div>';
    });
    $('warning-list').innerHTML = out || '<p>No checks returned.</p>';
  }

  function renderSummary(d, s, assessment) {
    var rows = [
      ['Design', d.name],
      ['Containers', s.moduleCount + ' × ' + s.types.join(', ')],
      ['Nominal footprint', n(s.nominalFootprint_m2) + ' m² before insulation'],
      ['Interior zones', s.zoneCount],
      ['Openings', s.openingCount],
      ['Screened porch', n(s.screenedPorch_m2) + ' m²'],
      ['Trellises', s.trellisCount || 0],
      ['Thermal envelope', (d.thermal.roof_insulation_mm || '–') + ' mm roof / ' + (d.thermal.floor_insulation_mm || '–') + ' mm floor / ' + d.thermal.window_performance],
      ['Roof', (s.solar ? 'Solar ' : '') + (s.greenRoof ? 'Green/biosolar ' : '') || 'Membrane'],
      ['Insulation', 'Up to ' + s.maxInsulation_mm + ' mm external'],
      ['Status', assessment.ok ? 'No invalid geometry; professional review required' : 'Invalid geometry; drawings disabled'],
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
    var label = 'Illustrative placement at ' + site.name + '. ' + (unique.length ? 'Conflicts: ' + unique.join('; ') + '. ' : 'No conflict with the modelled buffers or other buildings. ') + pathNote + ' This preview does not add the design to the community layout.';
    host.setAttribute('aria-label', label);
    var fp = polys.map(function (poly) { return '<path d="M' + poly.map(function (p) { return n(p[0]) + ' ' + n(p[1]); }).join('L') + 'Z" fill="' + (unique.length ? '#9b2c2c' : '#246b4a') + '" fill-opacity="0.35" stroke="' + (unique.length ? '#9b2c2c' : '#174d35') + '" stroke-width="1.4"' + (unique.length ? ' stroke-dasharray="3 2"' : '') + '/>'; }).join('');
    var existing = SITE.buildings.filter(function (b) { return b.id !== site.id; }).map(function (b) { return b.footprint ? '<path d="M' + b.footprint.map(function (p) { return n(p[0]) + ' ' + n(p[1]); }).join('L') + 'Z" fill="none" stroke="#5b4a36" stroke-width="0.8" stroke-dasharray="2 1"/>' : ''; }).join('');
    var az = ((Number(d.primary_view_deg) || 0) + (Number(d.site.rotation_deg) || 0)) * Math.PI / 180;
    var arrow = '<line x1="' + site.x_m + '" y1="' + site.y_m + '" x2="' + n(site.x_m + Math.sin(az) * 22) + '" y2="' + n(site.y_m - Math.cos(az) * 22) + '" stroke="#3f5f8a" stroke-width="1.4" stroke-dasharray="3 2"/><circle cx="' + n(site.x_m + Math.sin(az) * 22) + '" cy="' + n(site.y_m - Math.cos(az) * 22) + '" r="2.4" fill="#3f5f8a"/>';
    var overlay = host.querySelector('svg');
    if (!overlay) {
      host.innerHTML = '<img src="../../assets/site-plan.svg" width="924" height="781" alt="Fictional Containers Hamlet site plan used as an illustrative placement background." loading="eager" decoding="async">' +
        '<svg viewBox="0 0 330 279" aria-hidden="true" focusable="false"></svg>';
      overlay = host.querySelector('svg');
    }
    overlay.innerHTML = existing + fp + arrow + '<text x="' + n(site.x_m + 5) + '" y="' + n(site.y_m - 6) + '" font-family="system-ui, sans-serif" font-size="6" font-weight="800" fill="#1d392c" stroke="#faf8f2" stroke-width="1.6" paint-order="stroke">YOUR DESIGN</text>';
    $('site-status').textContent = label;
  }

  /* ---------------- events ---------------- */

  function applyRoof(m, type) {
    m.roof.type = type;
    m.roof.solar = type === 'solar' || type === 'biosolar';
    m.roof.green = type === 'green' || type === 'biosolar';
  }

  function onFieldInput(event) {
    var el = event.target;
    if (!el || !el.getAttribute) return;
    var path = el.getAttribute('data-path');
    if (!path) return;
    if (!state.editBase) state.editBase = clone(state.design);
    var value = el.type === 'checkbox' ? el.checked : el.value;
    if (path.indexOf('.roof.type') >= 0) {
      var parts = path.split('.');
      var mi = Number(parts[1]);
      applyRoof(state.design.modules[mi], value);
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
    if (path.indexOf('.type') >= 0 || path.indexOf('.roof.type') >= 0) {
      renderControls();
      renderVisuals();
    }
    updateHistoryButtons();
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
    out.provenance = Object.assign({ exported_with: 'Containers Hamlet Design Lab 1.3.0', review_required: true }, out.provenance || {});
    out.assessment = { generated_by: 'Containers Hamlet Design Lab 1.3.0', authoritative: false, ok: Model.assess(out).ok, items: Model.assess(out).items };
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
    lines.push('- Schema: ' + state.design.schema);
    lines.push('- Containers: ' + s.moduleCount + ' × ' + s.types.join(', '));
    lines.push('- Nominal footprint: ' + n(s.nominalFootprint_m2) + ' m² before external insulation');
    lines.push('- Interior zones: ' + s.zoneCount);
    lines.push('- Openings: ' + s.openingCount);
    lines.push('- Screened porch: ' + n(s.screenedPorch_m2) + ' m²');
    lines.push('- Roof: ' + (s.solar ? 'solar ' : '') + (s.greenRoof ? 'green/biosolar ' : '') || 'membrane');
    lines.push('- Maximum external insulation: ' + s.maxInsulation_mm + ' mm');
    lines.push('');
    lines.push('## Containers');
    state.design.modules.forEach(function (m) {
      lines.push('- ' + m.id + ': ' + m.type + ' at ' + m.position_m[0] + ', ' + m.position_m[1] + ' m, rotation ' + m.rotation_deg + '°, ' + m.insulation.thickness_mm + ' mm insulation, ' + CLAD_LABEL[m.cladding.type] + ', ' + ROOF_LABEL[m.roof.type]);
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
    lines.push(a.ok ? 'No invalid geometry; professional review still required.' : 'Invalid geometry must be fixed before drawings are exported.');
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
    var svg = kind === 'plan' ? Model.renderPlan(state.design, { idPrefix: 'export-plan' }) : Model.renderAxo(state.design, { idPrefix: 'export-' + kind, mode: kind === 'cutaway' ? 'cutaway' : undefined, focus: kind === 'porch' ? 'outdoor' : undefined, season: kind === 'winter' ? 'winter' : undefined });
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
      { name: base + '-exterior.svg', data: Model.renderAxo(state.design, { idPrefix: 'zip-exterior' }) },
      { name: base + '-cutaway.svg', data: Model.renderAxo(state.design, { idPrefix: 'zip-cutaway', mode: 'cutaway' }) },
      { name: base + '-porch.svg', data: Model.renderAxo(state.design, { idPrefix: 'zip-porch', focus: 'outdoor' }) },
      { name: base + '-winter.svg', data: Model.renderAxo(state.design, { idPrefix: 'zip-winter', season: 'winter' }) },
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
      if (raw.schema === Schema.LEGACY_SCHEMA) {
        var migrated = Schema.migrateV01(raw);
        design = migrated.design; report = migrated.report;
      } else if (raw.schema === Schema.SCHEMA) {
        design = Schema.canonicalize(raw);
        var check = Schema.validateSchema(design);
        if (!check.ok) throw new Error(check.errors.map(function (e) { return e.message; }).join(' '));
        var unknown = check.unknownKeys || [];
        if (unknown.length) {
          design.provenance = Object.assign({}, design.provenance, { imported_unknown: {} });
          unknown.forEach(function (k) { design.provenance.imported_unknown[k] = raw[k]; });
        }
      } else {
        throw new Error('Unsupported schema. Use ' + Schema.SCHEMA + ' or ' + Schema.LEGACY_SCHEMA + '.');
      }
      state.design = design;
      state.preset = null;
      state.history = [];
      state.future = [];
      state.editBase = null;
      state.selectedModule = state.design.modules[0].id;
      state.selectedOpening = state.design.modules[0].openings[0] ? state.design.modules[0].openings[0].id : null;
      state.selectedZone = state.design.modules[0].zones[0] ? state.design.modules[0].zones[0].id : null;
      renderAll();
      var msg = 'Imported design. ';
      if (report) msg += 'Migrated from v0.1. ' + report.warnings.join(' ');
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
    var initial = EDITABLE.filter(function (c) { return c.id === requested; })[0] || EDITABLE[0];
    loadPreset(initial.id, true);
    renderArrangementFromState();
    announce('Loaded ' + initial.name + '. Three presets are editable; the gallery has six more inspiration concepts.');

    $('preset').addEventListener('change', function () { if ($('preset').value) loadPreset($('preset').value); });
    $('undo').addEventListener('click', undo);
    $('redo').addEventListener('click', redo);
    $('reset').addEventListener('click', function () { if (state.preset) loadPreset(state.preset); else loadPreset(EDITABLE[0].id); });
    $('add-module').addEventListener('click', addModule);
    $('remove-module').addEventListener('click', removeModule);
    $('apply-arrangement').addEventListener('click', applyArrangement);
    $('add-opening').addEventListener('click', addOpening);
    $('remove-opening').addEventListener('click', function () { if (state.selectedOpening) removeOpening(state.selectedOpening); else announce('Choose an opening card to remove.'); });
    $('add-zone').addEventListener('click', addZone);
    $('remove-zone').addEventListener('click', function () { if (state.selectedZone) removeZone(state.selectedZone); else announce('Choose a room card to remove.'); });
    $('add-porch').addEventListener('click', addPorch);
    $('remove-porch').addEventListener('click', function () { if (state.design.porches.length) removePorch(state.design.porches.length - 1); else announce('There is no porch to remove.'); });
    $('add-deck').addEventListener('click', addDeck);
    $('add-trellis').addEventListener('click', addTrellis);
    $('add-connection').addEventListener('click', addConnection);
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
      var hit = e.target.closest ? e.target.closest('[data-module-id]') : null;
      if (!hit) return;
      state.selectedModule = hit.getAttribute('data-module-id');
      renderControls();
      announce('Module ' + state.selectedModule + ' selected from the plan. Use the module controls to move or rotate it.');
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
    $('export-plan').addEventListener('click', function () { exportSVG('plan'); });
    $('export-exterior').addEventListener('click', function () { exportSVG('exterior'); });
    $('export-cutaway').addEventListener('click', function () { exportSVG('cutaway'); });
    $('export-porch').addEventListener('click', function () { exportSVG('porch'); });
    $('export-winter').addEventListener('click', function () { exportSVG('winter'); });
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
