/*
 * Eco Hamlet page behaviour. Progressive enhancement only: without this
 * script every drawing, table and download is still present.
 * No tracking, storage, cookies or network requests. MIT licence.
 */
(function () {
  'use strict';

  var doc = document;
  var DATA = window.EcoHamletData;
  var Model = window.EcoModel;
  var Render = window.EcoRender;
  doc.documentElement.classList.add('js');

  var USES = {
    a: 'Cabin A: permanent residence', b: 'Cabin B: permanent residence', c: 'Cabin C: permanent residence',
    d: 'Cabin D: seasonal residence', e: 'Cabin E: seasonal residence', f: 'Cabin F: community-operated rental',
    lodge: 'Common lodge: shared kitchen, gathering space and services'
  };

  function $(sel, root) { return (root || doc).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); }
  function el(tag, attrs, text) {
    var n = doc.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text != null) n.textContent = text;
    return n;
  }
  function reveal(root) { $$('[data-enhance]', root).forEach(function (n) { n.hidden = false; }); }
  function fixed(v, d) { return Number(v).toFixed(d); }

  /* ---------- drawing switchers ---------- */
  $$('.drawings').forEach(function (block) {
    var figs = $$('figure.drawing', block);
    function show(view) {
      figs.forEach(function (f) { f.classList.toggle('is-current', f.getAttribute('data-view') === view); });
    }
    $$('input[type="radio"]', block).forEach(function (r) {
      r.addEventListener('change', function () { if (r.checked) show(r.value); });
    });
    var checked = $('input[type="radio"]:checked', block);
    show(checked ? checked.value : 'floor-plan');
    reveal(block);
  });

  /* ---------- site map ---------- */
  var mapSvg = $('#site-map svg');
  var status = $('#selected');
  var details = $('#building-details');
  var siteInfo = DATA && DATA.site ? DATA.site.buildings : [];

  function detailsFor(id) {
    var b = siteInfo.filter(function (x) { return x.id === id; })[0];
    if (!b) return;
    details.textContent = '';
    details.appendChild(el('h3', {}, b.name));
    var model = b.model === 'lodge' ? 'Common lodge concept' : (b.id === 'a' ? 'Cabin A concept' : 'Uses the Cabin A concept; a site-specific variant has not been designed');
    details.appendChild(el('p', {}, model + '. ' + fixed(b.clear_floor_area_m2, 1) + ' m² clear floor area, ' + fixed(b.footprint_m2, 1) + ' m² footprint.'));
    var ul = el('ul');
    b.checks.forEach(function (c) { ul.appendChild(el('li', {}, (c.ok ? 'Pass: ' : 'Fails: ') + c.label)); });
    details.appendChild(el('p', {}, 'Siting checks against the placeholder limits:'));
    details.appendChild(ul);
    if (b.moved) details.appendChild(el('p', { class: 'note' }, b.moved));
    var p = el('p');
    var a1 = el('a', { href: b.model === 'lodge' ? '#lodge' : '#home' }, b.model === 'lodge' ? 'Lodge drawings' : 'Cabin A drawings');
    var a2 = el('a', { href: '#inside', 'data-explore': b.model }, 'Look inside');
    p.appendChild(a1); p.appendChild(doc.createTextNode(' • ')); p.appendChild(a2);
    details.appendChild(p);
  }

  function choose(id) {
    status.textContent = USES[id] + '. Conceptual placement; no land rights or building permissions are implied.';
    $$('[data-choice]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-choice') === id)); });
    if (mapSvg) $$('.building', mapSvg).forEach(function (g) { g.classList.toggle('selected', g.getAttribute('data-building') === id); });
    detailsFor(id);
  }

  if (status && mapSvg && siteInfo.length) {
    $$('[data-choice]').forEach(function (b) {
      b.addEventListener('click', function () { choose(b.getAttribute('data-choice')); });
    });
    /* Pointer shortcut: the buttons beside the map are the keyboard and screen reader route. */
    $$('.building', mapSvg).forEach(function (g) {
      g.addEventListener('click', function () {
        var id = g.getAttribute('data-building');
        choose(id);
        var btn = $('[data-choice="' + id + '"]');
        if (btn) btn.focus({ preventScroll: true });
      });
    });
    $$('[data-layer]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var layer = mapSvg.querySelector('#map-layer-' + cb.getAttribute('data-layer'));
        if (layer) layer.style.display = cb.checked ? '' : 'none';
      });
    });
    reveal($('#explore'));
  }

  /* ---------- cutaway explorer ---------- */
  var canvas = $('#explorer-canvas');
  var caption = $('#explorer-caption');
  var controls = $('.explorer-controls');
  var roomList = $('#room-buttons');
  var roomInfo = $('#room-info');
  var roomStatus = $('#room-status');
  if (!canvas || !Model || !Render || !DATA) return;

  var state = { building: 'cabin-a', mode: 'cut', view: 'sw', roof: 'pv', hide: {}, room: null };
  var cache = {};

  function model() {
    var key = state.building + ':' + state.roof;
    if (!cache[key]) cache[key] = Model.buildModel(DATA.buildings[state.building], { roof: state.roof });
    return cache[key];
  }
  function spec() { return DATA.buildings[state.building]; }

  function draw() {
    var m = model();
    var opts = {
      view: state.view, mode: state.mode, hide: state.hide, highlight: state.room,
      labels: state.room ? 'highlight' : 'all', scale: state.building === 'lodge' ? 24 : 32
    };
    var out = Render.renderAxo(m, opts);
    canvas.innerHTML = out.svg;
    var svg = $('svg', canvas);
    var text = (spec().short_name || spec().name) + ': ' + Render.describe(m, opts);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', text);
    svg.setAttribute('focusable', 'false');
    caption.textContent = text;
  }

  function roomText(r) {
    return r.name + ': ' + fixed(r.clear_length_m, 2) + ' by ' + fixed(r.clear_width_m, 2) + ' m clear, ' + fixed(r.area_m2, 1) + ' m²';
  }

  function showRoom() {
    $$('button', roomList).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-room') === state.room)); });
    roomInfo.textContent = '';
    var r = model().rooms.filter(function (x) { return x.id === state.room; })[0];
    if (!r) {
      roomInfo.appendChild(el('p', {}, 'Choose a room to highlight it and read about its size, use and accessibility.'));
      return;
    }
    roomInfo.appendChild(el('h4', {}, r.name));
    roomInfo.appendChild(el('p', {}, fixed(r.clear_length_m, 2) + ' × ' + fixed(r.clear_width_m, 2) + ' m clear (' + fixed(r.area_m2, 1) + ' m²), ceiling height ' + fixed(r.clear_height_m, 2) + ' m.'));
    if (r.use) roomInfo.appendChild(el('p', {}, r.use));
    var fixtures = model().prims.filter(function (p) { return p.cat === 'fixture' && p.room === r.id; }).map(function (p) { return p.name; });
    if (fixtures.length) roomInfo.appendChild(el('p', {}, 'Fixtures: ' + fixtures.join(', ') + '.'));
    if (r.accessibility) {
      var p = el('p');
      p.appendChild(el('strong', {}, 'Accessibility: '));
      p.appendChild(doc.createTextNode(r.accessibility));
      roomInfo.appendChild(p);
    }
  }

  function buildRooms() {
    roomList.textContent = '';
    model().rooms.forEach(function (r) {
      var li = el('li');
      var b = el('button', { type: 'button', 'aria-pressed': 'false', 'data-room': r.id }, r.name);
      b.addEventListener('click', function () {
        var on = state.room !== r.id;
        state.room = on ? r.id : null;
        var note = '';
        if (on && (state.mode === 'exterior' || state.mode === 'roof')) {
          state.mode = 'cut';
          var radio = $('input[name="ex-mode"][value="cut"]');
          if (radio) radio.checked = true;
          note = ' View changed to walls cut at 1.2 m.';
        }
        draw();
        showRoom();
        roomStatus.textContent = on ? roomText(r) + '.' + note : r.name + ' no longer highlighted.';
      });
      li.appendChild(b);
      roomList.appendChild(li);
    });
    showRoom();
  }

  function setBuilding(id) {
    if (!DATA.buildings[id]) return;
    state.building = id;
    state.room = null;
    var radio = $('input[name="ex-building"][value="' + id + '"]');
    if (radio) radio.checked = true;
    draw();
    buildRooms();
  }

  $$('input[name="ex-building"]').forEach(function (r) { r.addEventListener('change', function () { if (r.checked) setBuilding(r.value); }); });
  $$('input[name="ex-mode"]').forEach(function (r) { r.addEventListener('change', function () { if (r.checked) { state.mode = r.value; draw(); } }); });
  $$('input[name="ex-view"]').forEach(function (r) { r.addEventListener('change', function () { if (r.checked) { state.view = r.value; draw(); } }); });
  $$('input[name="ex-roof"]').forEach(function (r) { r.addEventListener('change', function () { if (r.checked) { state.roof = r.value; draw(); } }); });
  $$('input[name="ex-show"]').forEach(function (c) {
    c.addEventListener('change', function () { state.hide[c.value] = !c.checked; draw(); });
  });
  doc.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('[data-explore]') : null;
    if (a) setBuilding(a.getAttribute('data-explore'));
  });

  try {
    draw();
    buildRooms();
    reveal($('#inside'));
  } catch (err) {
    /* Keep the static cutaway image if anything goes wrong. */
    if (window.console) console.error(err);
  }
})();
