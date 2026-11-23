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

  // Phase 2: site-plan highlighting from stable element mappings.
  var siteObject = document.getElementById('pattern-site-plan');
  var siteStatus = document.getElementById('site-highlight-status');
  var siteList = document.getElementById('site-highlight-list');
  var siteClear = document.getElementById('site-clear');
  var mappingNode = document.getElementById('pattern-site-elements');
  var mapping = null;
  try { mapping = mappingNode ? JSON.parse(mappingNode.textContent) : null; } catch (err) { mapping = null; }
  var pendingNumber = null;
  var activeNumber = null;
  var evidenceLabel = { 'not-evaluated': 'Not evaluated', conceptual: 'Conceptual', 'evidence-needed': 'Evidence needed', 'evidence-supported': 'Evidence-supported within scope', 'trade-off-identified': 'Trade-off identified', 'not-applicable': 'Not applicable' };

  function mapFor(id) {
    if (!mapping || !mapping.elements) return null;
    return mapping.elements.filter(function (e) { return e.id === id; })[0] || null;
  }
  function clearSite() {
    if (!siteObject || !siteObject.contentDocument) return;
    var doc = siteObject.contentDocument;
    Array.prototype.forEach.call(doc.querySelectorAll('.pattern-highlight'), function (el) { el.classList.remove('pattern-highlight'); });
    Array.prototype.forEach.call(doc.querySelectorAll('.pattern-site-selected'), function (el) { el.classList.remove('pattern-site-selected'); });
    activeNumber = null;
    Array.prototype.forEach.call(document.querySelectorAll('.pattern-card.is-selected'), function (el) { el.classList.remove('is-selected'); });
    Array.prototype.forEach.call(document.querySelectorAll('.pattern-site-button'), function (b) { b.setAttribute('aria-pressed', 'false'); });
    if (siteStatus) siteStatus.textContent = 'No pattern selected. The full site plan and the element key below are available without JavaScript.';
    if (siteList) siteList.textContent = '';
    if (siteClear) siteClear.disabled = true;
  }
  function styleSite(doc) {
    if (!doc || doc.getElementById('pattern-highlight-style')) return;
    var st = doc.createElementNS('http://www.w3.org/2000/svg', 'style');
    st.setAttribute('id', 'pattern-highlight-style');
    st.textContent = '.pattern-highlight{filter:drop-shadow(0 0 1.5px #fff) drop-shadow(0 0 3.5px #b45e1c)!important;opacity:1!important}.pattern-highlight text{font-weight:800!important}.pattern-site-selected{fill:#b45e1c!important;fill-opacity:.9!important}';
    doc.documentElement.appendChild(st);
  }
  function highlight(number) {
    var card = document.querySelector('[data-pattern][data-number="' + number + '"]');
    if (!card || !mapping || !siteObject) return;
    if (!siteObject.contentDocument) { pendingNumber = number; return; }
    var doc = siteObject.contentDocument;
    styleSite(doc);
    clearSite();
    activeNumber = number;
    var elementIds = card.getAttribute('data-elements').split(' ');
    var selectors = [];
    var rows = [];
    elementIds.forEach(function (id) {
      var m = mapFor(id);
      if (!m) return;
      (m.selectors || []).forEach(function (s) { if (selectors.indexOf(s) < 0) selectors.push(s); });
      rows.push(m);
    });
    selectors.forEach(function (s) {
      var nodes = s === 'svg' ? [doc.documentElement] : doc.querySelectorAll(s);
      Array.prototype.forEach.call(nodes, function (n) { n.classList.add('pattern-highlight'); });
    });
    card.classList.add('is-selected');
    Array.prototype.forEach.call(document.querySelectorAll('.pattern-site-button'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-highlight-pattern') === String(number) ? 'true' : 'false'); });
    if (siteStatus) siteStatus.textContent = 'Pattern ' + number + ' — ' + card.getAttribute('data-title') + ': highlighting ' + rows.map(function (r) { return r.label; }).join(', ') + '.';
    if (siteList) {
      siteList.textContent = '';
      rows.forEach(function (r) {
        var li = document.createElement('li');
        var strong = document.createElement('strong');
        strong.textContent = r.label;
        li.appendChild(strong);
        li.appendChild(document.createTextNode(' — ' + r.description + ' '));
        var meta = document.createElement('span');
        meta.className = 'small';
        meta.textContent = (evidenceLabel[r.evidenceStatus] || r.evidenceStatus) + '. ' + r.note + (r.selectors.length ? '' : ' Not shown at site-plan scale.');
        li.appendChild(meta);
        siteList.appendChild(li);
      });
    }
    if (siteClear) siteClear.disabled = false;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.getElementById('site-plan-section').scrollIntoView({ block: 'start' });
    } else {
      document.getElementById('site-plan-section').scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-highlight-pattern]'), function (button) {
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', function () { highlight(Number(button.getAttribute('data-highlight-pattern'))); });
  });
  if (siteClear) siteClear.addEventListener('click', clearSite);
  if (siteObject) siteObject.addEventListener('load', function () {
    styleSite(siteObject.contentDocument);
    if (pendingNumber) { var n = pendingNumber; pendingNumber = null; highlight(n); }
  });
  if (location.hash && /^#pattern-\d+$/.test(location.hash)) {
    var n = Number(location.hash.replace('#pattern-', ''));
    if (n) pendingNumber = n;
  }
  if (siteObject && siteObject.contentDocument && pendingNumber) {
    var ready = pendingNumber;
    pendingNumber = null;
    highlight(ready);
  }
