(function () {
  'use strict';
  var node = document.getElementById('pattern-lens-data');
  var object = document.getElementById('pattern-lens-plan');
  if (!node) return;
  var data;
  try { data = JSON.parse(node.textContent); } catch (err) { return; }
  var byNumber = {};
  data.annotations.forEach(function (a) { byNumber[a.pattern] = a; });
  var status = document.getElementById('pattern-lens-status');
  var list = document.getElementById('pattern-lens-list');
  var clear = document.getElementById('lens-clear');
  var pending = null;

  function style(doc) {
    if (!doc || doc.getElementById('pattern-lens-style')) return;
    var st = doc.createElementNS('http://www.w3.org/2000/svg', 'style');
    st.setAttribute('id', 'pattern-lens-style');
    st.textContent = '.pattern-highlight{filter:drop-shadow(0 0 2px #fff) drop-shadow(0 0 5px #b45e1c)!important;fill-opacity:1!important}.pattern-highlight text{font-weight:800!important}';
    doc.documentElement.appendChild(st);
  }
  function clearLens() {
    if (object && object.contentDocument) {
      var doc = object.contentDocument;
      Array.prototype.forEach.call(doc.querySelectorAll('.pattern-highlight'), function (el) { el.classList.remove('pattern-highlight'); });
    }
    Array.prototype.forEach.call(document.querySelectorAll('.lens-button'), function (b) { b.setAttribute('aria-pressed', 'false'); });
    if (status) status.textContent = 'No pattern selected. All annotations remain available in the list below.';
    if (list) list.textContent = '';
    if (clear) clear.disabled = true;
  }
  function show(number, doc) {
    var a = byNumber[number];
    if (!a) return;
    if (object && !doc) { pending = number; return; }
    if (object && doc) {
      style(doc);
      Array.prototype.forEach.call(doc.querySelectorAll('.pattern-highlight'), function (el) { el.classList.remove('pattern-highlight'); });
      a.selectors.forEach(function (sel) {
        Array.prototype.forEach.call(doc.querySelectorAll(sel), function (el) { el.classList.add('pattern-highlight'); });
      });
    }
    Array.prototype.forEach.call(document.querySelectorAll('.lens-button'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-lens-pattern') === String(number) ? 'true' : 'false'); });
    if (status) status.textContent = 'Pattern ' + number + ' — ' + (a.summary || '') + ' Status: ' + a.status + '.';
    if (list) {
      list.textContent = '';
      var obs = document.createElement('li');
      obs.textContent = 'Observations: ' + a.observations.join(' ');
      var lim = document.createElement('li');
      lim.textContent = 'Limits: ' + a.limits.join(' ');
      var q = document.createElement('li');
      q.textContent = 'Question: ' + a.question;
      list.appendChild(obs); list.appendChild(lim); list.appendChild(q);
      if (!a.selectors.length) {
        var none = document.createElement('li');
        none.textContent = 'No room polygon is highlighted for this annotation.';
        list.appendChild(none);
      }
    }
    if (clear) clear.disabled = false;
  }
  Array.prototype.forEach.call(document.querySelectorAll('.lens-button'), function (b) {
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', function () { show(Number(b.getAttribute('data-lens-pattern')), object && object.contentDocument); });
  });
  if (clear) clear.addEventListener('click', clearLens);
  if (object) object.addEventListener('load', function () {
    style(object.contentDocument);
    if (pending) { var n = pending; pending = null; show(n, object.contentDocument); }
  });
})();
