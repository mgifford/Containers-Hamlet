(function () {
  'use strict';
  var node = document.getElementById('scenario-data');
  var left = document.getElementById('scenario-left');
  var right = document.getElementById('scenario-right');
  if (!node || !left || !right) return;
  var data;
  try { data = JSON.parse(node.textContent); } catch (err) { return; }
  var byId = {};
  data.scenarios.forEach(function (s) { byId[s.id] = s; });
  var status = document.getElementById('scenario-status');
  var reset = document.getElementById('scenario-reset');
  var leftImg = document.getElementById('compare-left-img');
  var rightImg = document.getElementById('compare-right-img');
  var leftText = document.getElementById('compare-left-text');
  var rightText = document.getElementById('compare-right-text');

  function valid(id) { return byId[id] ? id : data.baselineId; }
  function list(items) {
    var ul = document.createElement('ul');
    items.forEach(function (x) { var li = document.createElement('li'); li.textContent = x; ul.appendChild(li); });
    return ul;
  }
  function paint(id, img, host) {
    var s = byId[id];
    img.src = s.id + '.svg';
    img.alt = s.label + ' ' + s.title + ': schematic arrangement diagram. Not to scale and not a site plan.';
    host.textContent = '';
    var p = document.createElement('p');
    p.textContent = s.summary;
    host.appendChild(p);
    var h = document.createElement('h4');
    h.textContent = 'Potential advantages';
    host.appendChild(h);
    host.appendChild(list(s.advantages));
    h = document.createElement('h4');
    h.textContent = 'Trade-offs';
    host.appendChild(h);
    host.appendChild(list(s.disadvantages));
    h = document.createElement('h4');
    h.textContent = 'Evidence';
    host.appendChild(h);
    var ev = document.createElement('p');
    ev.className = 'small';
    ev.textContent = s.evidenceStatus + ' · geometry: ' + s.geometryStatus + '. This is not a finding or a preferred option.';
    host.appendChild(ev);
    return s;
  }
  function apply(updateUrl) {
    var a = valid(left.value), b = valid(right.value);
    left.value = a; right.value = b;
    var sa = paint(a, leftImg, leftText);
    var sb = paint(b, rightImg, rightText);
    if (status) status.textContent = 'Comparing ' + sa.label + ' — ' + sa.title + ' with ' + sb.label + ' — ' + sb.title + '.';
    if (updateUrl) {
      try { history.replaceState(null, '', '?left=' + encodeURIComponent(a) + '&right=' + encodeURIComponent(b)); } catch (e) { /* file:// */ }
    }
  }
  var params = new URLSearchParams(location.search);
  left.value = valid(params.get('left') || data.baselineId);
  right.value = valid(params.get('right') || (data.scenarios.filter(function (s) { return s.id !== data.baselineId; })[0] || {}).id || data.baselineId);
  left.addEventListener('change', function () { apply(true); });
  right.addEventListener('change', function () { apply(true); });
  if (reset) reset.addEventListener('click', function () { left.value = data.baselineId; right.value = data.baselineId; apply(true); });
  apply(false);
})();
