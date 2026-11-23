(function () {
  'use strict';
  var list = document.getElementById('pattern-list');
  if (!list) return;
  var cards = Array.prototype.slice.call(list.querySelectorAll('[data-pattern]'));
  var search = document.getElementById('pattern-search');
  var scale = document.getElementById('pattern-scale');
  var element = document.getElementById('pattern-element');
  var evidence = document.getElementById('pattern-evidence');
  var reset = document.getElementById('pattern-reset');
  var status = document.getElementById('pattern-status');
  var form = document.getElementById('pattern-controls');
  if (!search || !scale || !element || !evidence || !status) return;

  function apply() {
    var q = search.value.trim().toLowerCase();
    var s = scale.value;
    var e = element.value;
    var v = evidence.value;
    var shown = 0;
    cards.forEach(function (card) {
      var ok = (!q || card.getAttribute('data-search').toLowerCase().indexOf(q) >= 0) &&
        (!s || card.getAttribute('data-scale') === s) &&
        (!e || card.getAttribute('data-elements').split(' ').indexOf(e) >= 0) &&
        (!v || card.getAttribute('data-evidence') === v);
      card.hidden = !ok;
      if (ok) shown++;
    });
    status.textContent = shown === cards.length ? 'Showing all ' + cards.length + ' patterns.' : 'Showing ' + shown + ' of ' + cards.length + ' patterns.';
  }
  function resetAll() {
    search.value = ''; scale.value = ''; element.value = ''; evidence.value = '';
    apply();
    search.focus();
  }
  [search, scale, element, evidence].forEach(function (el) { el.addEventListener('input', apply); el.addEventListener('change', apply); });
  if (reset) reset.addEventListener('click', resetAll);
  if (form) form.addEventListener('submit', function (ev) { ev.preventDefault(); apply(); });

  function openHash() {
    if (!location.hash || location.hash.indexOf('#pattern-') !== 0) return;
    var card = document.getElementById(location.hash.slice(1));
    if (!card) return;
    var details = card.querySelector('details');
    if (details) details.open = true;
    card.scrollIntoView({ block: 'start' });
  }
  window.addEventListener('hashchange', openHash);
  apply();
  openHash();
})();
