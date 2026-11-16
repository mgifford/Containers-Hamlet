/* Illustrative rainwater arithmetic only. MIT. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  function num(id) { return Math.max(0, Number($(id).value) || 0); }
  function calc() {
    var area = num('roof-area'), rain = num('rainfall'), eff = Math.min(100, Math.max(0, num('efficiency'))) / 100;
    var storage = num('storage'), people = Math.max(1, num('people')), demand = num('demand'), reserve = num('fire-reserve');
    var harvest = area * rain * eff;
    var daily = people * demand;
    var usable = Math.max(0, storage - reserve);
    var storageDays = daily > 0 ? usable / daily : 0;
    $('water-result').textContent = 'Illustrative harvest: ' + Math.round(harvest).toLocaleString('en-CA') + ' L/year. Daily use: ' + Math.round(daily).toLocaleString('en-CA') + ' L/day. Dedicated fire reserve: ' + Math.round(reserve).toLocaleString('en-CA') + ' L. Usable non-fire storage: ' + Math.round(usable).toLocaleString('en-CA') + ' L, about ' + storageDays.toFixed(1) + ' days at that demand. Overflow and first-flush losses still need design.';
  }
  var form = $('water-calc');
  if (!form) return;
  $('calc-water').addEventListener('click', calc);
  form.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); calc(); } });
  calc();
})();
