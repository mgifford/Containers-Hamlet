/* Containers Hamlet Design Lab. Code licence: AGPL-3.0-or-later. */
(function () {
  'use strict';
  var data = window.DesignLabConcepts;
  if (!data || !window.DesignModel) return;
  var concepts = data.concepts;
  var a = document.getElementById('compare-a');
  var b = document.getElementById('compare-b');
  var grid = document.getElementById('compare-grid');
  var swap = document.getElementById('compare-swap');
  var form = document.getElementById('compare-controls');
  var status = document.getElementById('compare-status');
  if (!a || !b || !grid) return;
  var esc = function (v) { return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var n = function (v) { return (Math.round(v * 10) / 10).toString(); };
  function profile(id) {
    var c = concepts.filter(function (x) { return x.id === id; })[0];
    return { c: c, p: window.DesignModel.designProfile(c) };
  }
  function list(items, empty) {
    return items && items.length ? '<ul>' + items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '<p class="small">' + esc(empty) + '</p>';
  }
  function panel(p, c) {
    var t = p.thermal;
    return '<article class="compare-panel" data-compare-panel="' + esc(p.id) + '">' +
      '<img src="../views/' + esc(p.id) + '-exterior.svg" alt="Exterior concept of ' + esc(p.name) + '" width="1040" height="700" loading="lazy" decoding="async">' +
      '<div class="compare-panel-body"><p class="eyebrow">' + esc(c.group) + ' · ' + p.container_count + ' container' + (p.container_count === 1 ? '' : 's') + '</p>' +
      '<h2>' + esc(p.name) + '</h2><p>' + esc(c.tagline) + '</p>' +
      '<dl class="compare-facts">' +
      '<div><dt>Container count</dt><dd>' + p.container_count + ' × ' + esc(p.types.join(' + ')) + '</dd></div>' +
      '<div><dt>Nominal conditioned footprint</dt><dd>' + n(p.conditioned_area_m2) + ' m² modules plus glazed hall</dd></div>' +
      '<div><dt>Screened porch area</dt><dd>' + n(p.screened_porch_m2) + ' m²' + (p.screened_porch_m2 ? '' : ' (no screened porch)') + '</dd></div>' +
      '<div><dt>Porch and deck area</dt><dd>' + n(p.porch_m2) + ' m²</dd></div>' +
      '<div><dt>Glazing area</dt><dd>' + n(p.glazing_m2) + ' m² · ' + n(p.glazing_ratio) + '% of nominal conditioned area</dd></div>' + (p.solar && p.solar.length ? '<div><dt>Solar</dt><dd>' + p.solar.map((x) => x.id + ': ' + x.tilt_deg + '° / ' + x.azimuth_deg + '° ' + x.season_mode).join('; ') + '</dd></div>' : '') + '</dl>' +
      '<h3>Envelope options</h3><dl class="compare-facts">' +
      '<div><dt>Walls</dt><dd>' + n(t.wall_insulation_mm) + ' mm average continuous external insulation</dd></div>' +
      '<div><dt>Roof</dt><dd>' + n(t.roof_insulation_mm) + ' mm · ' + esc(t.rainscreen_ventilation ? 'ventilated rainscreen' : 'rainscreen not confirmed') + '</dd></div>' +
      '<div><dt>Floor</dt><dd>' + n(t.floor_insulation_mm) + ' mm</dd></div>' +
      '<div><dt>Windows and doors</dt><dd>' + esc(t.window_performance) + '</dd></div>' +
      '<div><dt>Shading</dt><dd>' + esc(t.external_shading) + '</dd></div>' +
      '<div><dt>Air and vapour</dt><dd>' + esc(t.air_vapour_control) + '</dd></div>' +
      '<div><dt>Thermal bridges</dt><dd>' + esc(t.thermal_bridge_mitigation) + '</dd></div>' +
      '<div><dt>Ventilation</dt><dd>' + (t.heat_recovery_ventilation ? 'Heat-recovery ventilation (HRV/ERV) intent' : 'No HRV/ERV selected') + '</dd></div>' +
      '<div><dt>Heating</dt><dd>' + esc(t.heating) + '</dd></div></dl>' +
      '<h3>Thermal strengths</h3>' + list(t.strengths, 'No specific strengths recorded.') +
      '<h3>Thermal risks</h3>' + list(t.risks, 'No specific risks recorded beyond the general review prompts.') +
      '<h3>Accessibility considerations</h3>' + list(p.accessibility, 'No accessibility notes recorded.') +
      '<h3>Structural / installation review</h3>' + list(p.structural, 'No specific structural warning recorded; openings and lifting still need review.') +
      '<p class="small"><strong>No cost, carbon, energy or code-compliance figures are calculated.</strong> Areas are approximate nominal geometry. Thermal notes are qualitative design prompts, not performance claims.</p>' +
      '<p class="compare-links"><a class="action" href="../architecture/' + esc(p.id) + '/">Five-view architectural gallery</a>' + (p.editable ? '<a class="action secondary" href="../editor/?preset=' + esc(p.id) + '">Open in editor</a>' : '') + '</p></div></article>';
  }
  function render() {
    var A = profile(a.value), B = profile(b.value);
    grid.innerHTML = panel(A.p, A.c) + panel(B.p, B.c);
    if (window.history && history.replaceState) history.replaceState(null, '', '?a=' + encodeURIComponent(a.value) + '&b=' + encodeURIComponent(b.value));
    form.setAttribute('aria-label', 'Compare ' + A.c.name + ' with ' + B.c.name);
    if (status) status.textContent = 'Comparing ' + A.c.name + ' with ' + B.c.name + '.';
  }
  function setPair(idA, idB) {
    if (idA === idB) idB = concepts.filter(function (c) { return c.id !== idA; })[0].id;
    a.value = idA; b.value = idB; render();
  }
  var q = new URLSearchParams(location.search);
  if (q.get('a') && concepts.some(function (c) { return c.id === q.get('a'); })) a.value = q.get('a');
  if (q.get('b') && concepts.some(function (c) { return c.id === q.get('b'); })) b.value = q.get('b');
  if (a.value === b.value) b.value = concepts.filter(function (c) { return c.id !== a.value; })[0].id;
  a.addEventListener('change', function () { setPair(a.value, b.value); });
  b.addEventListener('change', function () { setPair(a.value, b.value); });
  swap.addEventListener('click', function () { setPair(b.value, a.value); });
  render();
}());
