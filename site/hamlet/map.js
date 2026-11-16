/* Containers Hamlet map page. MIT. Data CC BY 4.0. */
(function () {
  'use strict';
  var DATA = window.EcoHamletData;
  if (!DATA) return;
  var doc = document;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var USE_LABEL = { permanent: 'Permanent home', seasonal: 'Seasonal home', 'community rental': 'Community rental home', shared: 'Shared community building' };
  function el(tag, attrs, text) { var n = doc.createElement(tag); Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); }); if (text != null) n.textContent = text; return n; }
  function fixed(v, d) { return Number(v).toFixed(d); }
  function approx(v, d) { return '~' + (d === 0 ? Math.round(Number(v)) : Number(v).toFixed(d == null ? 1 : d)); }
  function targetName(t) { return !t ? 'the forest' : t.type === 'lake' ? 'Heron Lake' : t.type === 'wetland' ? 'the beaver meadow' : (t.id || 'the forest').replace(/-/g, ' '); }
  function useLabel(u) { return USE_LABEL[u] || u; }
  var mapSvg = $('#site-map svg');
  var status = $('#selected');
  var details = $('#building-details');
  var siteInfo = DATA.site ? DATA.site.buildings : [];
  var byId = {};
  siteInfo.forEach(function (b) { byId[b.id] = b; });

  function detailsFor(id) {
    var b = byId[id];
    if (!b || !details) return;
    details.textContent = '';
    details.appendChild(el('h3', {}, b.name + (b.short_name ? ' · ' + b.short_name : '')));
    details.appendChild(el('p', {}, useLabel(b.use) + ' using the ' + (b.model === 'lodge' ? 'common lodge' : 'Cabin A') + ' concept. ' + approx(b.clear_floor_area_m2, 0) + ' m² clear floor area, ' + approx(b.footprint_m2, 0) + ' m² footprint.'));
    var dl = el('dl', { class: 'detail-facts' });
    function row(k, v) { var d = el('div'); d.appendChild(el('dt', {}, k)); d.appendChild(el('dd', {}, v)); dl.appendChild(d); }
    if (b.orientation) row('Orientation', b.orientation.reason || '');
    if (b.views_text && b.views_text.main) row('Main view', b.views_text.main.description + (b.views ? ' Bearing ' + fixed(b.views.main_bearing_deg, 0) + '°, ' + fixed(b.views.main_distance_m, 0) + ' m to ' + targetName(b.views.main_target) + '. ' + b.views.canopy_description + '.' : ''));
    if (b.views_text && b.views_text.nearby) row('Nearby homes', b.views_text.nearby + (b.views && b.views.neighbours_in_view.length ? ' In the view cone: ' + b.views.neighbours_in_view.map(function (n) { return n.name + ' at ' + fixed(n.distance_m, 0) + ' m'; }).join(', ') + '.' : ' No other building is inside the principal view cone.'));
    if (b.views_text && b.views_text.path) row('Path and entry', b.views_text.path);
    if (b.views_text && b.views_text.winter) row('Winter', b.views_text.winter);
    if (b.checks) row('Siting', (b.ok ? 'All illustrative checks pass' : 'One or more illustrative checks fail') + ': ' + fixed(b.shoreline_m, 0) + ' m from the shoreline, ' + fixed(b.wetland_m, 0) + ' m from the wetland, ' + approx(b.pad.max_m) + ' m maximum bench cut or fill, ' + fixed(b.crane_reach_m, 0) + ' m crane reach.');
    details.appendChild(dl);
    var p = el('p', { class: 'detail-links' });
    var slug = (DATA.homeSlugs && DATA.homeSlugs[b.id]) || b.id;
    p.appendChild(el('a', { href: '../homes/' + slug + '/' }, 'Read the full home brief'));
    p.appendChild(doc.createTextNode(' • '));
    p.appendChild(el('a', { href: '../index.html#inside' }, 'Look inside'));
    p.appendChild(doc.createTextNode(' • '));
    p.appendChild(el('a', { href: b.model === 'lodge' ? '../lodge/' : '../cabin-a/' }, b.model === 'lodge' ? 'Lodge drawings' : 'Cabin drawings'));
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
    $$('[data-choice]').forEach(function (button) { button.addEventListener('click', function () { choose(button.getAttribute('data-choice')); }); });
    $$('.building', mapSvg).forEach(function (g) { g.addEventListener('click', function () { var id = g.getAttribute('data-building'); choose(id); var button = $('[data-choice="' + id + '"]'); if (button) button.focus({ preventScroll: true }); }); });
    $$('[data-layer]').forEach(function (checkbox) { var layer = mapSvg.querySelector('#map-layer-' + checkbox.getAttribute('data-layer')); if (layer) layer.style.display = checkbox.checked ? '' : 'none'; checkbox.addEventListener('change', function () { if (layer) layer.style.display = checkbox.checked ? '' : 'none'; }); });
    $$('[data-enhance]').forEach(function (n) { n.hidden = false; });
    choose(siteInfo[0].id);
  }
})();
