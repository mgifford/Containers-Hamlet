/* Containers Hamlet residence comparison. Code licence: AGPL-3.0-or-later. */
(function () {
  'use strict';
  var table = document.getElementById('residence-table');
  var body = table && table.tBodies[0];
  if (!body) return;
  var rows = Array.prototype.slice.call(body.rows);
  var sort = document.getElementById('sort-residences');
  var filterStoreys = document.getElementById('filter-storeys');
  var filterArrangement = document.getElementById('filter-arrangement');
  var status = document.getElementById('residence-status');
  var apply = document.getElementById('apply-residences');
  var reset = document.getElementById('reset-residences');

  function value(row, key) {
    if (key === 'name') return row.getAttribute('data-name') || '';
    return Number(row.getAttribute('data-' + key)) || 0;
  }
  function announce(message) { if (status) status.textContent = message; }

  function applyControls() {
    var s = sort ? sort.value : 'name';
    var storeys = filterStoreys ? filterStoreys.value : 'all';
    var arrangement = filterArrangement ? filterArrangement.value : 'all';
    var visible = rows.filter(function (row) {
      var okStorey = storeys === 'all' || row.getAttribute('data-storeys') === storeys;
      var okArrangement = arrangement === 'all' || row.getAttribute('data-arrangement') === arrangement;
      return okStorey && okArrangement;
    });
    rows.forEach(function (row) { row.hidden = visible.indexOf(row) < 0; });
    visible.sort(function (a, b) {
      if (s === 'name') return String(value(a, 'name')).localeCompare(String(value(b, 'name')));
      if (s === 'storeys' || s === 'review') return value(a, s) - value(b, s) || String(value(a, 'name')).localeCompare(String(value(b, 'name')));
      return value(b, s) - value(a, s) || String(value(a, 'name')).localeCompare(String(value(b, 'name')));
    });
    visible.forEach(function (row) { body.appendChild(row); });
    var names = visible.map(function (row) { return row.getAttribute('data-name'); });
    announce('Showing ' + visible.length + ' of ' + rows.length + ' residences. ' + (names.length ? names.join(', ') + '.' : 'No residence matches the current filters.'));
  }

  if (apply) apply.addEventListener('click', applyControls);
  [sort, filterStoreys, filterArrangement].forEach(function (el) { if (el) el.addEventListener('change', applyControls); });
  if (reset) reset.addEventListener('click', function () {
    if (sort) sort.value = 'name';
    if (filterStoreys) filterStoreys.value = 'all';
    if (filterArrangement) filterArrangement.value = 'all';
    rows.forEach(function (row) { row.hidden = false; });
    rows.sort(function (a, b) { return String(value(a, 'name')).localeCompare(String(value(b, 'name'))); });
    rows.forEach(function (row) { body.appendChild(row); });
    announce('Showing all ' + rows.length + ' residences.');
  });
  applyControls();
}());
