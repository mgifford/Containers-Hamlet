/* User-entered cost worksheet. MIT. No prices are supplied. */
(function () {
  'use strict';
  var form = document.getElementById('cost-worksheet');
  if (!form) return;
  var result = document.getElementById('cost-result');
  function sum(group) {
    return Array.prototype.slice.call(document.querySelectorAll('[data-worksheet="' + group + '"]')).reduce(function (total, input) {
      var n = Number(input.value);
      return total + (isFinite(n) && n > 0 ? n : 0);
    }, 0);
  }
  function money(n) { return '$' + Math.round(n).toLocaleString('en-CA'); }
  function calculate() {
    var initial = sum('initial');
    var operating = sum('operating');
    var individual = sum('individual');
    var households = Math.max(1, Number(document.getElementById('worksheet-households').value) || 1);
    result.textContent = 'Your entered assumptions: ' + money(initial) + ' initial capital, ' + money(operating) + ' annual shared operating, and ' + money(individual) + ' individual costs. Shared operating per household: ' + money(operating / households) + ' per year (' + money(operating / households / 12) + ' per month), before individual costs. These are your figures, not a quote or an affordability test.';
  }
  document.getElementById('calculate-costs').addEventListener('click', calculate);
  form.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target && e.target.tagName === 'INPUT') { e.preventDefault(); calculate(); } });
  calculate();
})();
