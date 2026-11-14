/*
 * Eco Hamlet SVG renderer: axonometric and orthographic views of the
 * primitives produced by model.js. No WebGL, no dependencies: output is a
 * plain SVG string, so it works in the browser and in Node alike.
 *
 * Drawing order uses a topological sort over separating axes, which is exact
 * for non-intersecting axis-aligned solids (model.validate() guarantees that).
 * Code licence: MIT.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./model.js'));
  else root.EcoRender = factory(root.EcoModel);
})(typeof self !== 'undefined' ? self : this, function (EcoModel) {
  'use strict';

  var MATERIALS = {
    steel: { fill: '#7b8a8f', label: 'Steel container shell' },
    frame: { fill: '#3f4a4f', label: 'Opening reinforcement (to be engineered)' },
    insulation: { fill: '#e9cf8b', label: 'Insulation' },
    cladding: { fill: '#b7895a', label: 'Timber rainscreen' },
    lining: { fill: '#efe7d6', label: 'Interior lining' },
    floor: { fill: '#d9c4a0', label: 'Floor finish' },
    room: { fill: '#e8d8b8', label: 'Room floor' },
    partition: { fill: '#f3efe6', label: 'Partition' },
    glass: { fill: '#9fd3e0', opacity: 0.6, label: 'Glazing' },
    door: { fill: '#6f5136', label: 'Door' },
    membrane: { fill: '#5d646b', label: 'Roof membrane' },
    soffit: { fill: '#8d8f86', label: 'Soffit board' },
    timber: { fill: '#c99e6b', label: 'Timber frame' },
    decking: { fill: '#a97c52', label: 'Decking and ramp' },
    post: { fill: '#86613f', label: 'Timber post' },
    roofing: { fill: '#6b5a4b', label: 'Porch roof' },
    screen: { fill: '#41574c', opacity: 0.2, label: 'Insect screen' },
    pile: { fill: '#55585a', label: 'Pile' },
    pv: { fill: '#24364f', label: 'PV module' },
    green: { fill: '#6f9d5b', label: 'Extensive green roof' },
    trellis: { fill: '#6e5a3d', label: 'Trellis' },
    vine: { fill: '#4f8a4a', opacity: 0.6, label: 'Native climbing plants' },
    fixture: { fill: '#f7f4ec', label: 'Fixture' },
    joinery: { fill: '#d8b98f', label: 'Joinery and furniture' },
    soft: { fill: '#9fb6a6', label: 'Bed and seating' },
    appliance: { fill: '#f4f5f2', label: 'Appliance or sanitary fixture' },
    tile: { fill: '#c9dbe0', label: 'Shower floor' },
    battery: { fill: '#b84a3a', label: 'Battery cabinet' }
  };
  var HIGHLIGHT = { fill: '#f6c945', stroke: '#6b4200' };

  var VIEWS = {
    sw: { label: 'south-west', R: [[0, 1], [-1, 0]], near: ['south', 'west'] },
    se: { label: 'south-east', R: [[1, 0], [0, 1]], near: ['south', 'east'] },
    ne: { label: 'north-east', R: [[0, -1], [1, 0]], near: ['north', 'east'] },
    nw: { label: 'north-west', R: [[-1, 0], [0, -1]], near: ['north', 'west'] }
  };
  var ELEVATIONS = {
    south: { label: 'South', R: [[1, 0], [0, 1]] },
    north: { label: 'North', R: [[-1, 0], [0, -1]] },
    east: { label: 'East', R: [[0, -1], [1, 0]] },
    west: { label: 'West', R: [[0, 1], [-1, 0]] }
  };
  var MODES = {
    exterior: 'exterior',
    roof: 'roof removed',
    near: 'near walls cut away',
    cut: 'walls cut at 1.2 m to show the interior'
  };
  var WALLISH = { envelope: 1, structure: 1, lining: 1, glazing: 1, door: 1, screen: 1 };
  var C = Math.cos(Math.PI / 6), S = 0.5;

  function rot(R, p) {
    return [R[0][0] * p[0] + R[0][1] * p[1], R[1][0] * p[0] + R[1][1] * p[1], p[2]];
  }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }

  function hex(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
  function shade(c, f) {
    return '#' + hex(c).map(function (v) {
      var x = Math.max(0, Math.min(255, Math.round(v * f)));
      return (x < 16 ? '0' : '') + x.toString(16);
    }).join('');
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function n1(v) { return Math.round(v * 10) / 10; }

  var PROJ = {
    iso: {
      cam: [1, 1, 1],
      project: function (p) { return [(p[0] - p[1]) * C, (p[0] + p[1]) * S - p[2]]; },
      axes: function (s) { return [s[0], -S * s[0] + C * s[1], S * s[0] + C * s[1]]; },
      light: function (n) {
        var L = [0.254, 0.466, 0.847];
        return 0.62 + 0.38 * Math.max(0, dot(n, L));
      }
    },
    ortho: {
      cam: [0, 1, 0],
      project: function (p) { return [p[0], -p[2]]; },
      axes: function (s) { return [s[0], s[1]]; },
      light: function () { return 1; }
    }
  };

  /* Rotate, cull back faces and compute screen ranges for each primitive. */
  function prepare(prims, R, proj) {
    return prims.map(function (p) {
      var g = EcoModel.geometry(p);
      var v = g.v.map(function (q) { return rot(R, q); });
      var faces = g.f.map(function (f) {
        return { pts: f.i.map(function (i) { return v[i]; }), n: rot(R, f.n) };
      }).filter(function (f) { return dot(f.n, proj.cam) > 1e-9; });
      var min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
      v.forEach(function (q) { for (var k = 0; k < 3; k++) { if (q[k] < min[k]) min[k] = q[k]; if (q[k] > max[k]) max[k] = q[k]; } });
      var rng = null;
      v.forEach(function (q) {
        var a = proj.axes(proj.project(q));
        if (!rng) rng = a.map(function (x) { return [x, x]; });
        else a.forEach(function (x, k) { if (x < rng[k][0]) rng[k][0] = x; if (x > rng[k][1]) rng[k][1] = x; });
      });
      var c = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];
      return { p: p, faces: faces, min: min, max: max, rng: rng, depth: dot(c, proj.cam) };
    });
  }

  function order(items, proj) {
    var n = items.length, adj = [], indeg = [], i, j, k;
    for (i = 0; i < n; i++) { adj.push([]); indeg.push(0); }
    var cam = proj.cam, eps = 1e-6;
    for (i = 0; i < n; i++) {
      var a = items[i];
      for (j = i + 1; j < n; j++) {
        var b = items[j], overlap = true;
        for (k = 0; k < a.rng.length; k++) {
          if (a.rng[k][1] <= b.rng[k][0] + eps || b.rng[k][1] <= a.rng[k][0] + eps) { overlap = false; break; }
        }
        if (!overlap) continue;
        var o = 0;
        for (k = 0; k < 3 && !o; k++) {
          if (cam[k] <= 0) continue;
          if (a.max[k] <= b.min[k] + eps) o = -1;
          else if (b.max[k] <= a.min[k] + eps) o = 1;
        }
        if (!o) o = a.depth <= b.depth ? -1 : 1;
        if (o < 0) { adj[i].push(j); indeg[j]++; } else { adj[j].push(i); indeg[i]++; }
      }
    }
    var done = new Array(n), out = [];
    while (out.length < n) {
      var pick = -1;
      for (i = 0; i < n; i++) {
        if (done[i] || indeg[i] > 0) continue;
        if (pick < 0 || items[i].depth < items[pick].depth) pick = i;
      }
      if (pick < 0) { /* cycle: release the farthest remaining item */
        for (i = 0; i < n; i++) {
          if (done[i]) continue;
          if (pick < 0 || indeg[i] < indeg[pick] || (indeg[i] === indeg[pick] && items[i].depth < items[pick].depth)) pick = i;
        }
      }
      done[pick] = true;
      out.push(items[pick]);
      adj[pick].forEach(function (t) { indeg[t]--; });
    }
    return out;
  }

  /* Which primitives a viewer setting shows. */
  function select(model, opts) {
    var M = model.meta, view = VIEWS[opts.view || 'sw'];
    var hide = opts.hide || {}, mode = opts.mode || 'exterior';
    var cutZ = M.FFL + (opts.cutHeight || 1.2);
    var out = [];
    model.prims.forEach(function (p) {
      if (hide.fixture && p.cat === 'fixture') return;
      if (hide.porch && (p.porch || p.cat === 'ramp')) return;
      if (hide.trellis && p.cat === 'trellis') return;
      if (hide.foundation && p.cat === 'foundation') return;
      if (mode !== 'exterior' && (p.cat === 'roof' || p.cat === 'pv' || p.cat === 'porch-roof')) return;
      if (mode === 'near' && p.face && WALLISH[p.cat] && view.near.indexOf(p.face) >= 0) return;
      if (mode === 'cut' && p.cat !== 'fixture') {
        if (p.min[2] >= cutZ - 1e-6) return;
        if (p.max[2] > cutZ) { p = Object.assign({}, p, { max: [p.max[0], p.max[1], cutZ], cut: true }); }
      }
      out.push(p);
    });
    return out;
  }

  function fillFor(p, f, light, opts) {
    var m = MATERIALS[p.mat] || MATERIALS.fixture;
    var base = m.fill;
    if (opts.highlight && p.cat === 'room' && p.room === opts.highlight) base = HIGHLIGHT.fill;
    var b = light(f.n);
    if (p.cut && f.n[2] > 0.99 && opts.cutTops !== false) b = Math.min(1, b) * 0.86;
    return { fill: shade(base, b), opacity: m.opacity };
  }

  function pathOf(pts, tf) {
    return 'M' + pts.map(function (q) { var s = tf(q); return n1(s[0]) + ' ' + n1(s[1]); }).join('L') + 'Z';
  }

  /*
   * Render an axonometric (iso) view. opts:
   *   view: sw|se|ne|nw, mode: exterior|roof|near|cut, cutHeight (m above floor),
   *   hide: {fixture, porch, trellis, foundation}, highlight: room id,
   *   labels: 'all'|'highlight'|'none', scale (px per m), title, desc, id,
   *   background (colour), compass (bool)
   */
  function renderAxo(model, opts) {
    opts = opts || {};
    var view = VIEWS[opts.view || 'sw'], proj = PROJ.iso, k = opts.scale || 30, M = model.meta;
    var prims = select(model, opts);
    var items = order(prepare(prims, view.R, proj), proj);
    var b = M.bounds, g = M.zGrade, pad = 0.8;
    var ground = [[b.min[0] - pad, b.min[1] - pad, g], [b.max[0] + pad, b.min[1] - pad, g], [b.max[0] + pad, b.max[1] + pad, g], [b.min[0] - pad, b.max[1] + pad, g]]
      .map(function (q) { return rot(view.R, q); });
    var pts = [];
    ground.forEach(function (q) { pts.push(proj.project(q)); });
    items.forEach(function (it) { it.faces.forEach(function (f) { f.pts.forEach(function (q) { pts.push(proj.project(q)); }); }); });
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    pts.forEach(function (s) { minX = Math.min(minX, s[0]); maxX = Math.max(maxX, s[0]); minY = Math.min(minY, s[1]); maxY = Math.max(maxY, s[1]); });
    var m = 14, W = Math.ceil((maxX - minX) * k + 2 * m), Hh = Math.ceil((maxY - minY) * k + 2 * m);
    var tf = function (q) { var s = proj.project(q); return [(s[0] - minX) * k + m, (s[1] - minY) * k + m]; };

    var out = [];
    var aria = opts.title ? ' role="img" aria-labelledby="' + esc(opts.id || 'axo') + '-t ' + esc(opts.id || 'axo') + '-d"' : '';
    out.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + Hh + '" width="' + W + '" height="' + Hh + '"' + aria + '>');
    if (opts.title) {
      out.push('<title id="' + esc(opts.id || 'axo') + '-t">' + esc(opts.title) + '</title>');
      out.push('<desc id="' + esc(opts.id || 'axo') + '-d">' + esc(opts.desc || '') + '</desc>');
    }
    if (opts.background) out.push('<rect width="' + W + '" height="' + Hh + '" fill="' + opts.background + '"/>');
    out.push('<path d="' + pathOf(ground, tf) + '" fill="#cfdcc0" stroke="#9db08c" stroke-width="1"/>');
    out.push('<g stroke="#1d2b25" stroke-opacity="0.38" stroke-width="0.6" stroke-linejoin="round">');
    items.forEach(function (it) {
      var p = it.p, hl = opts.highlight && p.cat === 'room' && p.room === opts.highlight;
      it.faces.forEach(function (f) {
        var st = fillFor(p, f, proj.light, opts);
        out.push('<path d="' + pathOf(f.pts, tf) + '" fill="' + st.fill + '"' +
          (st.opacity != null ? ' fill-opacity="' + st.opacity + '"' : '') +
          (hl ? ' stroke="' + HIGHLIGHT.stroke + '" stroke-opacity="1" stroke-width="2"' : '') + '/>');
      });
    });
    out.push('</g>');

    /* outline the selected room on top so fixtures never hide the selection */
    if (opts.highlight) {
      var hr = model.rooms.filter(function (r) { return r.id === opts.highlight; })[0];
      if (hr) {
        var ring = [[hr.xs, hr.ys, M.FFL], [hr.xe, hr.ys, M.FFL], [hr.xe, hr.ye, M.FFL], [hr.xs, hr.ye, M.FFL]]
          .map(function (q) { return rot(view.R, q); });
        var d = pathOf(ring, tf);
        out.push('<path d="' + d + '" fill="none" stroke="#fffdf7" stroke-width="6" stroke-linejoin="round"/>' +
          '<path d="' + d + '" fill="none" stroke="' + HIGHLIGHT.stroke + '" stroke-width="3" stroke-dasharray="8 4" stroke-linejoin="round"/>');
      }
    }

    var labels = opts.labels || 'none';
    if (labels !== 'none' && (opts.mode === 'cut' || opts.mode === 'near' || opts.mode === 'roof')) {
      out.push('<g font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="12" text-anchor="middle" fill="#1d2b25" stroke="#fffdf7" stroke-width="3" paint-order="stroke" stroke-linejoin="round">');
      model.rooms.forEach(function (r) {
        var on = r.id === opts.highlight;
        if (labels === 'highlight' && !on) return;
        var c = tf(rot(view.R, [(r.xs + r.xe) / 2, (r.ys + r.ye) / 2, M.FFL]));
        out.push('<text x="' + n1(c[0]) + '" y="' + n1(c[1]) + '"' + (on ? ' font-weight="700" font-size="14"' : '') + '>' + esc(r.name) + '</text>');
      });
      out.push('</g>');
    }
    if (opts.compass !== false) {
      var o = rot(view.R, [0, 0, 0]), nn = rot(view.R, [0, -1, 0]);
      var so = proj.project(o), sn = proj.project(nn), dx = sn[0] - so[0], dy = sn[1] - so[1], len = Math.hypot(dx, dy);
      dx /= len; dy /= len;
      var cx = W - 30, cy = 30, r = 16;
      out.push('<g aria-hidden="true"><circle cx="' + cx + '" cy="' + cy + '" r="' + (r + 6) + '" fill="#fffdf7" stroke="#1d2b25" stroke-opacity=".4"/>' +
        '<path d="M' + n1(cx - dx * r) + ' ' + n1(cy - dy * r) + 'L' + n1(cx + dx * r) + ' ' + n1(cy + dy * r) + '" stroke="#1d2b25" stroke-width="2"/>' +
        '<circle cx="' + n1(cx + dx * r) + '" cy="' + n1(cy + dy * r) + '" r="3" fill="#1d2b25"/>' +
        '<text x="' + n1(cx + dx * (r + 1) - dy * 9) + '" y="' + n1(cy + dy * (r + 1) + dx * 9 + 4) + '" font-family="system-ui, sans-serif" font-size="12" font-weight="700" text-anchor="middle" fill="#1d2b25">N</text></g>');
    }
    if (opts.credit) {
      out.push('<text x="' + m + '" y="' + (Hh - 6) + '" font-family="system-ui, sans-serif" font-size="11" fill="#1d2b25">' + esc(opts.credit) + '</text>');
    }
    out.push('</svg>');
    return { svg: out.join(''), width: W, height: Hh, count: items.length };
  }

  /* Orthographic projection along a principal axis (used for elevations and sections). */
  function orthoItems(prims, R) {
    return order(prepare(prims, R, PROJ.ortho), PROJ.ortho);
  }

  function describe(model, opts) {
    var view = VIEWS[opts.view || 'sw'];
    var s = 'Viewed from the ' + view.label + ', ' + MODES[opts.mode || 'exterior'];
    if (opts.mode === 'cut' && opts.cutHeight && opts.cutHeight !== 1.2) s = s.replace('1.2 m', opts.cutHeight + ' m');
    var hidden = [];
    var h = opts.hide || {};
    if (h.fixture) hidden.push('furniture');
    if (h.porch) hidden.push('porches and ramps');
    if (h.trellis) hidden.push('trellis');
    if (hidden.length) s += '; hiding ' + hidden.join(', ');
    if (opts.highlight) {
      var r = model.rooms.filter(function (x) { return x.id === opts.highlight; })[0];
      if (r) s += '; ' + r.name + ' highlighted';
    }
    return s + '.';
  }

  return {
    MATERIALS: MATERIALS, VIEWS: VIEWS, ELEVATIONS: ELEVATIONS, MODES: MODES, HIGHLIGHT: HIGHLIGHT,
    renderAxo: renderAxo, orthoItems: orthoItems, prepare: prepare, order: order, select: select,
    describe: describe, shade: shade, esc: esc, rot: rot, PROJ: PROJ
  };
});
