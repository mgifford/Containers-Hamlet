/*
 * Containers Hamlet page behaviour. Progressive enhancement only: without this
 * script every drawing, home brief, table and download is still present.
 * No tracking, storage, cookies or network requests. MIT licence.
 */
(function () {
  'use strict';

  var doc = document;
  var DATA = window.EcoHamletData;
  var Model = window.EcoModel;
  var Render = window.EcoRender;
  doc.documentElement.classList.add('js');

  var USE_LABEL = {
    permanent: 'Permanent home',
    seasonal: 'Seasonal home',
    'community rental': 'Community rental home',
    shared: 'Shared community building'
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
  function r1(v) { return (Math.round((Number(v) + Number.EPSILON) * 10) / 10).toFixed(1); }
  function approx(v, d) { return '~' + (d === 0 ? Math.round(Number(v)) : r1(v)); }
  function useLabel(use) { return USE_LABEL[use] || use; }
  function targetName(target) {
    if (!target) return 'the forest';
    if (target.type === 'lake') return 'Heron Lake';
    if (target.type === 'wetland') return 'the beaver meadow';
    return (target.id || 'the forest').replace(/-/g, ' ');
  }

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
  var byId = {};
  siteInfo.forEach(function (b) { byId[b.id] = b; });

  function detailsFor(id) {
    var b = byId[id];
    if (!b || !details) return;
    details.textContent = '';
    details.appendChild(el('h3', {}, b.name + (b.short_name ? ' · ' + b.short_name : '')));
    details.appendChild(el('p', {}, useLabel(b.use) + ' using the ' + (b.model === 'lodge' ? 'common lodge' : 'Cabin A') + ' concept. ' + approx(b.clear_floor_area_m2, 0) + ' m² clear floor area, ' + approx(b.footprint_m2, 0) + ' m² footprint.'));
    var dl = el('dl', { class: 'detail-facts' });
    function row(k, v) {
      var d = el('div');
      d.appendChild(el('dt', {}, k));
      d.appendChild(el('dd', {}, v));
      dl.appendChild(d);
    }
    if (b.orientation) row('Orientation', b.orientation.reason || '');
    if (b.views_text && b.views_text.main) {
      row('Main view', b.views_text.main.description + (b.views ? ' Bearing ' + fixed(b.views.main_bearing_deg, 0) + '°, ' + fixed(b.views.main_distance_m, 0) + ' m to ' + targetName(b.views.main_target) + '. ' + b.views.canopy_description + '.' : ''));
    }
    if (b.views_text && b.views_text.nearby) row('Nearby homes', b.views_text.nearby + (b.views && b.views.neighbours_in_view.length ? ' In the view cone: ' + b.views.neighbours_in_view.map(function (n) { return n.name + ' at ' + fixed(n.distance_m, 0) + ' m'; }).join(', ') + '.' : ' No other building is inside the principal view cone.'));
    if (b.views_text && b.views_text.path) row('Path and entry', b.views_text.path);
    if (b.views_text && b.views_text.winter) row('Winter', b.views_text.winter);
    if (b.checks) row('Siting', (b.ok ? 'All illustrative checks pass' : 'One or more illustrative checks fail') + ': ' + fixed(b.shoreline_m, 0) + ' m from the shoreline, ' + fixed(b.wetland_m, 0) + ' m from the wetland, ' + approx(b.pad.max_m) + ' m maximum bench cut or fill, ' + fixed(b.crane_reach_m, 0) + ' m crane reach.');
    details.appendChild(dl);
    var p = el('p', { class: 'detail-links' });
    var brief = el('a', { href: 'homes/' + b.id + '/' }, 'Read the full home brief');
    var inside = el('a', { href: '#inside', 'data-explore': b.model }, 'Look inside');
    var drawings = el('a', { href: b.model === 'lodge' ? '#lodge' : '#cabin' }, b.model === 'lodge' ? 'Lodge drawings' : 'Cabin drawings');
    p.appendChild(brief); p.appendChild(doc.createTextNode(' • ')); p.appendChild(inside); p.appendChild(doc.createTextNode(' • ')); p.appendChild(drawings);
    details.appendChild(p);
  }

  function choose(id) {
    var b = byId[id];
    if (!b) return;
    if (status) status.textContent = b.name + ', ' + useLabel(b.use).toLowerCase() + '. ' + (b.views_text && b.views_text.main ? b.views_text.main.description : '') + ' Conceptual placement; no land rights or building permissions are implied.';
    $$('[data-choice]').forEach(function (button) { button.setAttribute('aria-pressed', String(button.getAttribute('data-choice') === id)); });
    if (mapSvg) $$('.building', mapSvg).forEach(function (g) { g.classList.toggle('selected', g.getAttribute('data-building') === id); });
    detailsFor(id);
  }

  if (status && mapSvg && siteInfo.length) {
    $$('[data-choice]').forEach(function (button) {
      button.addEventListener('click', function () { choose(button.getAttribute('data-choice')); });
    });
    /* Pointer shortcut: the buttons beside the map are the keyboard and screen reader route. */
    $$('.building', mapSvg).forEach(function (g) {
      g.addEventListener('click', function () {
        var id = g.getAttribute('data-building');
        choose(id);
        var button = $('[data-choice="' + id + '"]');
        if (button) button.focus({ preventScroll: true });
      });
    });
    $$('[data-layer]').forEach(function (checkbox) {
      var layer = mapSvg.querySelector('#map-layer-' + checkbox.getAttribute('data-layer'));
      if (layer) layer.style.display = checkbox.checked ? '' : 'none';
      checkbox.addEventListener('change', function () {
        if (layer) layer.style.display = checkbox.checked ? '' : 'none';
      });
    });
    reveal($('#explore'));
  }

  /* ---------- home dossiers ---------- */
  var homeRadios = $$('input[name="home-choice"]');
  var homeArticles = $$('.home-dossiers .home');
  function showHome(id, scroll) {
    homeArticles.forEach(function (a) { a.classList.toggle('is-current', a.getAttribute('data-home') === id); });
    homeRadios.forEach(function (r) { r.checked = r.value === id; });
    if (scroll) {
      var article = doc.getElementById('home-' + id);
      if (article) article.scrollIntoView({ block: 'start' });
    }
  }
  if (homeRadios.length && homeArticles.length) {
    var initial = $('input[name="home-choice"]:checked');
    showHome(initial ? initial.value : homeArticles[0].getAttribute('data-home'));
    homeRadios.forEach(function (r) {
      r.addEventListener('change', function () {
        if (!r.checked) return;
        showHome(r.value);
        if (byId[r.value]) choose(r.value);
      });
    });
    $$('[data-select-home]').forEach(function (button) {
      button.addEventListener('click', function () {
        var id = button.getAttribute('data-select-home');
        showHome(id);
        choose(id);
        var map = doc.getElementById('explore');
        if (map) map.scrollIntoView({ block: 'start' });
        var choice = $('[data-choice="' + id + '"]');
        if (choice) choice.focus({ preventScroll: true });
        if (status) status.textContent = (byId[id] ? byId[id].name : 'Home') + ' selected on the map.';
      });
    });
    reveal($('#homes'));
  }
  doc.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('[data-home-link]') : null;
    if (!link) return;
    e.preventDefault();
    var id = link.getAttribute('data-home-link');
    showHome(id, true);
    var radio = $('input[name="home-choice"][value="' + id + '"]');
    if (radio) radio.focus({ preventScroll: true });
  });

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
    return r.name + ': ~' + r1(r.clear_length_m) + ' by ' + r1(r.clear_width_m) + ' m clear, ~' + r1(r.area_m2) + ' m²';
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
    roomInfo.appendChild(el('p', {}, '~' + r1(r.clear_length_m) + ' × ' + r1(r.clear_width_m) + ' m clear (~' + r1(r.area_m2) + ' m²), ceiling height ~' + r1(r.clear_height_m) + ' m.'));
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
