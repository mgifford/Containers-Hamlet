/*
 * Eco Hamlet parametric building model.
 *
 * One source of truth: a building spec (data/*.json) becomes a list of solid
 * primitives (axis-aligned boxes and ramp wedges). The same list feeds the
 * browser explorer, the generated SVG drawings and the OBJ export, so every
 * view is dimensionally consistent with the data.
 *
 * Coordinates are metres. x runs east along the containers, y runs south
 * across them, z is up. The origin is the north-west bottom corner of the
 * first container's steel shell. Concept geometry only: not engineered.
 *
 * Works as a classic browser script (window.EcoModel) and as a CommonJS
 * module for Node. Code licence: MIT.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.EcoModel = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var EPS = 1e-6;
  var FACES = ['north', 'south', 'west', 'east'];

  function round(v, d) {
    var f = Math.pow(10, d == null ? 3 : d);
    return Math.round(v * f) / f;
  }
  function sum(list, fn) {
    return list.reduce(function (t, v) { return t + fn(v); }, 0);
  }

  /* ---------- primitives ---------- */

  function mkBox(o) {
    var b = Object.assign({}, o);
    b.kind = 'box';
    b.min = [Math.min(o.x[0], o.x[1]), Math.min(o.y[0], o.y[1]), Math.min(o.z[0], o.z[1])];
    b.max = [Math.max(o.x[0], o.x[1]), Math.max(o.y[0], o.y[1]), Math.max(o.z[0], o.z[1])];
    delete b.x; delete b.y; delete b.z;
    return b;
  }

  /* Vertices, faces and outward normals for a primitive. */
  function geometry(p) {
    var a = p.min, b = p.max;
    if (p.kind === 'box') {
      var v = [
        [a[0], a[1], a[2]], [b[0], a[1], a[2]], [b[0], b[1], a[2]], [a[0], b[1], a[2]],
        [a[0], a[1], b[2]], [b[0], a[1], b[2]], [b[0], b[1], b[2]], [a[0], b[1], b[2]]
      ];
      return {
        v: v,
        f: [
          { i: [0, 1, 2, 3], n: [0, 0, -1] },
          { i: [4, 5, 6, 7], n: [0, 0, 1] },
          { i: [0, 1, 5, 4], n: [0, -1, 0] },
          { i: [3, 2, 6, 7], n: [0, 1, 0] },
          { i: [0, 3, 7, 4], n: [-1, 0, 0] },
          { i: [1, 2, 6, 5], n: [1, 0, 0] }
        ]
      };
    }
    /* Wedge: solid ramp, full height on the `high` side, zero at the opposite side. */
    var h = p.high, x0 = a[0], x1 = b[0], y0 = a[1], y1 = b[1], z0 = a[2], z1 = b[2];
    var run, rise = z1 - z0, verts, faces;
    if (h === 'west' || h === 'east') {
      run = x1 - x0;
      var xh = h === 'west' ? x0 : x1, xl = h === 'west' ? x1 : x0, s = h === 'west' ? 1 : -1;
      verts = [[xh, y0, z0], [xl, y0, z0], [xl, y1, z0], [xh, y1, z0], [xh, y0, z1], [xh, y1, z1]];
      var nl = Math.hypot(rise, run);
      faces = [
        { i: [0, 1, 2, 3], n: [0, 0, -1] },
        { i: [4, 1, 2, 5], n: [s * rise / nl, 0, run / nl] },
        { i: [0, 3, 5, 4], n: [-s, 0, 0] },
        { i: [0, 1, 4], n: [0, -1, 0] },
        { i: [3, 2, 5], n: [0, 1, 0] }
      ];
    } else {
      run = y1 - y0;
      var yh = h === 'north' ? y0 : y1, yl = h === 'north' ? y1 : y0, t = h === 'north' ? 1 : -1;
      verts = [[x0, yh, z0], [x0, yl, z0], [x1, yl, z0], [x1, yh, z0], [x0, yh, z1], [x1, yh, z1]];
      var nm = Math.hypot(rise, run);
      faces = [
        { i: [0, 1, 2, 3], n: [0, 0, -1] },
        { i: [4, 1, 2, 5], n: [0, t * rise / nm, run / nm] },
        { i: [0, 3, 5, 4], n: [0, -t, 0] },
        { i: [0, 1, 4], n: [-1, 0, 0] },
        { i: [3, 2, 5], n: [1, 0, 0] }
      ];
    }
    return { v: verts, f: faces };
  }

  function volume(p) {
    var d = [p.max[0] - p.min[0], p.max[1] - p.min[1], p.max[2] - p.min[2]];
    return d[0] * d[1] * d[2] * (p.kind === 'wedge' ? 0.5 : 1);
  }

  /*
   * Subtract rectangular holes from a wall rectangle expressed in
   * (a = along the wall, z = height) coordinates. Returns non-overlapping panels.
   */
  function panelize(a0, a1, z0, z1, holes) {
    var hs = (holes || []).map(function (h) {
      return { a0: Math.max(a0, h.a0), a1: Math.min(a1, h.a1), z0: Math.max(z0, h.z0), z1: Math.min(z1, h.z1) };
    }).filter(function (h) { return h.a1 - h.a0 > EPS && h.z1 - h.z0 > EPS; });
    var cuts = [a0, a1];
    hs.forEach(function (h) { cuts.push(h.a0, h.a1); });
    var xs = cuts.map(function (v) { return round(v, 6); })
      .filter(function (v, i, arr) { return arr.indexOf(v) === i; })
      .sort(function (p, q) { return p - q; });
    var out = [], cur = null;
    function flush() {
      if (!cur) return;
      cur.segs.forEach(function (s) { out.push({ a0: cur.s0, a1: cur.s1, z0: s[0], z1: s[1] }); });
    }
    for (var i = 0; i < xs.length - 1; i++) {
      var s0 = xs[i], s1 = xs[i + 1];
      if (s1 - s0 < EPS) continue;
      var mid = (s0 + s1) / 2, segs = [[z0, z1]];
      hs.forEach(function (h) {
        if (!(h.a0 < mid && h.a1 > mid)) return;
        var next = [];
        segs.forEach(function (sg) {
          if (h.z1 <= sg[0] + EPS || h.z0 >= sg[1] - EPS) { next.push(sg); return; }
          if (h.z0 > sg[0] + EPS) next.push([sg[0], h.z0]);
          if (h.z1 < sg[1] - EPS) next.push([h.z1, sg[1]]);
        });
        segs = next;
      });
      var key = segs.map(function (sg) { return round(sg[0], 6) + ',' + round(sg[1], 6); }).join(';');
      if (cur && cur.key === key && Math.abs(cur.s1 - s0) < EPS) cur.s1 = s1;
      else { flush(); cur = { key: key, s0: s0, s1: s1, segs: segs }; }
    }
    flush();
    return out;
  }

  /* Add a (possibly perforated) wall. axis 'x' = wall runs east-west. */
  function addWall(list, o) {
    panelize(o.a[0], o.a[1], o.z[0], o.z[1], o.holes).forEach(function (r, i) {
      var meta = Object.assign({}, o);
      delete meta.a; delete meta.c; delete meta.z; delete meta.holes; delete meta.axis;
      meta.z = [r.z0, r.z1];
      if (o.axis === 'x') { meta.x = [r.a0, r.a1]; meta.y = o.c; } else { meta.y = [r.a0, r.a1]; meta.x = o.c; }
      meta.part = i;
      list.push(mkBox(meta));
    });
  }

  /* ---------- the building ---------- */

  function buildModel(spec, options) {
    options = options || {};
    var prims = [];
    var push = function (o) {
      var b = mkBox(o);
      if (b.max[0] - b.min[0] > 1e-4 && b.max[1] - b.min[1] > 1e-4 && b.max[2] - b.min[2] > 1e-4) prims.push(b);
    };

    var m = spec.module;
    var L = m.external_length_m, W = m.external_width_m, H = m.external_height_m;
    var te = (L - m.internal_length_m) / 2;
    var ts = (W - m.internal_width_m) / 2;
    var tf = m.floor_structure_m;
    var tr = H - tf - m.internal_height_m;
    var env = spec.envelope;
    var li = env.interior_lining_m, ff = env.floor_finish_m, cl = env.ceiling_lining_m;
    var FFL = tf + ff;
    var zr = FFL - 0.004; /* underside of the room floor zones */
    var ceil = H - tr - cl;
    var hf = env.hall_frame_m || 0.14;
    var fm = env.opening_frame_m || 0.06;

    var off = 0;
    var wallLayers = env.wall_layers.map(function (l) {
      var o = Object.assign({}, l, { a: off, b: off + l.thickness_m });
      off += l.thickness_m;
      return o;
    });
    var tOut = off;
    var rz = H;
    var roofLayers = env.roof_layers.map(function (l) {
      var o = Object.assign({}, l, { z0: rz, z1: rz + l.thickness_m });
      rz += l.thickness_m;
      return o;
    });
    var contTop = rz;
    var fz = 0;
    var floorLayers = env.floor_layers.map(function (l) {
      var o = Object.assign({}, l, { z1: fz, z0: fz - l.thickness_m });
      fz -= l.thickness_m;
      return o;
    });
    var zSoffit = fz;
    var zGrade = zSoffit - spec.foundation.clearance_above_grade_m;

    var y = 0;
    var bays = spec.bays.map(function (b, i) {
      var w = b.type === 'container' ? W : b.width_m;
      var top = b.type === 'container' ? contTop : b.roof_underside_m + b.roof_thickness_m;
      var o = Object.assign({}, b, { index: i, y0: y, y1: y + w, width: w, top: top });
      y += w;
      return o;
    });
    var Wt = y;
    var first = bays[0], last = bays[bays.length - 1];
    var bayById = {};
    bays.forEach(function (b, i) { b.prev = bays[i - 1] || null; b.next = bays[i + 1] || null; bayById[b.id] = b; });

    /* clear interior per bay */
    bays.forEach(function (b) {
      if (b.type === 'container') {
        b.cx0 = te + li; b.cx1 = L - te - li;
        b.cy0 = b.y0 + ts + li; b.cy1 = b.y1 - ts - li;
        b.ceiling = ceil;
      } else {
        b.cx0 = hf; b.cx1 = L - hf;
        b.cy0 = b.y0; b.cy1 = b.y1;
        b.ceiling = b.roof_underside_m;
      }
    });

    /* openings in building coordinates */
    var openings = (spec.openings || []).map(function (o) {
      var bay = bayById[o.bay];
      var along = (o.face === 'north' || o.face === 'south') ? 'x' : 'y';
      var base = along === 'x' ? 0 : bay.y0;
      var exterior = along === 'y' ||
        (bay.type === 'container' && ((o.face === 'north' && bay === first) || (o.face === 'south' && bay === last))) ||
        bay.type === 'hall';
      return Object.assign({}, o, {
        bayRef: bay, along: along, exterior: exterior,
        a0: base + o.from_m, a1: base + o.to_m,
        z0: o.sill_m ? FFL + o.sill_m : zr, z1: FFL + o.head_m
      });
    });
    function holes(bay, face) {
      return openings.filter(function (o) { return o.bayRef === bay && o.face === face; })
        .map(function (o) { return { a0: o.a0, a1: o.a1, z0: o.z0, z1: o.z1, o: o }; });
    }
    function steelHoles(bay, face) {
      return holes(bay, face).map(function (h) {
        return { a0: h.a0 - fm, a1: h.a1 + fm, z0: h.o.sill_m ? h.z0 - fm : h.z0, z1: h.z1 + fm, o: h.o };
      });
    }

    /* --- outer envelope: insulation, cavity and rainscreen rings --- */
    wallLayers.forEach(function (layer) {
      if (layer.material === 'cavity') return;
      var a = layer.a, b = layer.b;
      var common = { cat: 'envelope', mat: layer.material, layer: layer.id };
      addWall(prims, Object.assign({}, common, {
        axis: 'x', a: [-b, L + b], c: [-b, -a], z: [zSoffit, first.top], holes: holes(first, 'north'),
        name: 'North wall: ' + layer.name, group: 'north_' + layer.id, face: 'north', bay: first.id
      }));
      addWall(prims, Object.assign({}, common, {
        axis: 'x', a: [-b, L + b], c: [Wt + a, Wt + b], z: [zSoffit, last.top], holes: holes(last, 'south'),
        name: 'South wall: ' + layer.name, group: 'south_' + layer.id, face: 'south', bay: last.id
      }));
      bays.forEach(function (bay) {
        var ya = bay === first ? -a : bay.y0, yb = bay === last ? Wt + a : bay.y1;
        addWall(prims, Object.assign({}, common, {
          axis: 'y', a: [ya, yb], c: [-b, -a], z: [zSoffit, bay.top], holes: holes(bay, 'west'),
          name: 'West wall: ' + layer.name, group: 'west_' + layer.id, face: 'west', bay: bay.id
        }));
        addWall(prims, Object.assign({}, common, {
          axis: 'y', a: [ya, yb], c: [L + a, L + b], z: [zSoffit, bay.top], holes: holes(bay, 'east'),
          name: 'East wall: ' + layer.name, group: 'east_' + layer.id, face: 'east', bay: bay.id
        }));
      });
    });

    /* --- bays --- */
    bays.forEach(function (bay) {
      var y0 = bay.y0, y1 = bay.y1, id = bay.id;
      if (bay.type === 'container') {
        push({ x: [0, L], y: [y0, y1], z: [0, tf], name: 'Container floor frame and deck', group: id + '_floor_frame', cat: 'structure', mat: 'steel', bay: id });
        push({ x: [te, L - te], y: [y0 + ts, y1 - ts], z: [tf, zr], name: 'Floor finish', group: id + '_floor_finish', cat: 'floor', mat: 'floor', bay: id });
        floorLayers.forEach(function (l) {
          push({ x: [0, L], y: [y0, y1], z: [l.z0, l.z1], name: l.name, group: id + '_' + l.id, cat: 'envelope', mat: l.material, bay: id, layer: l.id });
        });
        /* steel long walls and their framed openings */
        [['north', y0, y0 + ts, 1], ['south', y1 - ts, y1, -1]].forEach(function (w) {
          var face = w[0], interior = (face === 'north' && bay !== first) || (face === 'south' && bay !== last);
          var sh = steelHoles(bay, face);
          addWall(prims, {
            axis: 'x', a: [0, L], c: [w[1], w[2]], z: [tf, H - tr], holes: sh,
            name: 'Container ' + face + ' wall (steel)', group: id + '_' + face + '_steel', cat: 'structure', mat: 'steel', face: face, bay: id, interior: interior
          });
          sh.forEach(function (h) { frames(prims, 'x', [w[1], w[2]], h, [tf, H - tr], id, face, interior); });
          var lc = w[3] > 0 ? [w[2], w[2] + li] : [w[1] - li, w[1]];
          addWall(prims, {
            axis: 'x', a: [te, L - te], c: lc, z: [zr, ceil], holes: holes(bay, face),
            name: 'Interior lining (' + face + ')', group: id + '_' + face + '_lining', cat: 'lining', mat: 'lining', face: face, bay: id, interior: interior
          });
        });
        [['west', 0, te, 1], ['east', L - te, L, -1]].forEach(function (w) {
          var face = w[0], sh = steelHoles(bay, face);
          addWall(prims, {
            axis: 'y', a: [y0 + ts, y1 - ts], c: [w[1], w[2]], z: [tf, H - tr], holes: sh,
            name: 'Container ' + face + ' end wall (steel)', group: id + '_' + face + '_steel', cat: 'structure', mat: 'steel', face: face, bay: id
          });
          sh.forEach(function (h) { frames(prims, 'y', [w[1], w[2]], h, [tf, H - tr], id, face, false); });
          var lc = w[3] > 0 ? [w[2], w[2] + li] : [w[1] - li, w[1]];
          addWall(prims, {
            axis: 'y', a: [y0 + ts + li, y1 - ts - li], c: lc, z: [zr, ceil], holes: holes(bay, face),
            name: 'Interior lining (' + face + ')', group: id + '_' + face + '_lining', cat: 'lining', mat: 'lining', face: face, bay: id
          });
        });
        push({ x: [te, L - te], y: [y0 + ts, y1 - ts], z: [ceil, H - tr], name: 'Ceiling lining', group: id + '_ceiling', cat: 'roof', mat: 'lining', bay: id });
        push({ x: [0, L], y: [y0, y1], z: [H - tr, H], name: 'Container roof (steel)', group: id + '_roof_steel', cat: 'roof', mat: 'steel', bay: id });
        roofLayers.forEach(function (l) {
          push({ x: [0, L], y: [y0, y1], z: [l.z0, l.z1], name: l.name, group: id + '_' + l.id, cat: 'roof', mat: l.material, bay: id, layer: l.id });
        });
      } else {
        var ru = bay.roof_underside_m;
        push({ x: [0, L], y: [y0, y1], z: [zSoffit, zr], name: 'Insulated timber floor cassette', group: id + '_floor', cat: 'floor', mat: 'timber', bay: id });
        [['west', 0, hf], ['east', L - hf, L]].forEach(function (w) {
          addWall(prims, {
            axis: 'y', a: [y0, y1], c: [w[1], w[2]], z: [zr, ru], holes: holes(bay, w[0]),
            name: 'Hall ' + w[0] + ' end wall (timber frame)', group: id + '_' + w[0] + '_frame', cat: 'structure', mat: 'timber', face: w[0], bay: id
          });
        });
        /* clerestory walls where the hall rises above its neighbours */
        [['north', bay.prev, 1], ['south', bay.next, -1]].forEach(function (w) {
          var face = w[0], nb = w[1];
          if (!nb || nb.top >= ru - EPS) return;
          var edge = face === 'north' ? y0 : y1, s = w[2];
          wallLayers.forEach(function (layer) {
            if (layer.material === 'cavity') return;
            var c = [edge + s * (tOut - layer.b), edge + s * (tOut - layer.a)];
            addWall(prims, {
              axis: 'x', a: [hf, L - hf], c: c, z: [nb.top, ru], holes: holes(bay, face),
              name: 'Clerestory (' + face + '): ' + layer.name, group: id + '_clerestory_' + face + '_' + layer.id, cat: 'envelope', mat: layer.material, face: face, bay: id, layer: layer.id
            });
          });
          addWall(prims, {
            axis: 'x', a: [hf, L - hf], c: [edge + s * tOut, edge + s * (tOut + hf)], z: [nb.top, ru], holes: holes(bay, face),
            name: 'Clerestory (' + face + ') timber frame', group: id + '_clerestory_' + face + '_frame', cat: 'structure', mat: 'timber', face: face, bay: id
          });
        });
        push({ x: [0, L], y: [y0, y1], z: [ru, bay.top - 0.02], name: 'Hall roof: timber structure and insulation', group: id + '_roof', cat: 'roof', mat: 'timber', bay: id });
        push({ x: [0, L], y: [y0, y1], z: [bay.top - 0.02, bay.top], name: 'Hall roof membrane', group: id + '_roof_membrane', cat: 'roof', mat: 'membrane', bay: id });
      }
    });

    /* panes and door leaves for exterior openings */
    openings.forEach(function (o) {
      if (!o.exterior) return;
      var mat = o.type === 'door' ? 'door' : 'glass';
      var cat = o.type === 'door' ? 'door' : 'glazing';
      var bay = o.bayRef, c;
      if (o.face === 'west') c = [-0.09, -0.05];
      else if (o.face === 'east') c = [L + 0.05, L + 0.09];
      else if (bay.type === 'hall') {
        c = o.face === 'north' ? [bay.y0 + tOut - 0.09, bay.y0 + tOut - 0.05] : [bay.y1 - tOut + 0.05, bay.y1 - tOut + 0.09];
      } else c = o.face === 'north' ? [-0.09, -0.05] : [Wt + 0.05, Wt + 0.09];
      var box = { z: [o.z0, o.z1], name: (o.name || o.id), group: 'opening_' + o.id, cat: cat, mat: mat, face: o.face, bay: bay.id, opening: o.id };
      if (o.along === 'x') { box.x = [o.a0, o.a1]; box.y = c; } else { box.y = [o.a0, o.a1]; box.x = c; }
      push(box);
    });

    /* --- rooms, partitions, fixtures --- */
    var pt = spec.partition_thickness_m || 0.1;
    var rooms = [];
    bays.forEach(function (bay) {
      var list = (spec.rooms || []).filter(function (r) { return r.bay === bay.id; });
      var xs = bay.cx0;
      list.forEach(function (r, i) {
        var isLast = i === list.length - 1;
        var xe = isLast ? bay.cx1 : (r.boundary === 'partition' ? r.end_m - pt / 2 : r.end_m);
        var room = {
          id: r.id, name: r.name, bay: bay.id, use: r.use, description: r.description, accessibility: r.accessibility,
          xs: xs, xe: xe, ys: bay.cy0, ye: bay.cy1, ceiling: bay.ceiling
        };
        room.clear_length_m = round(xe - xs, 3);
        room.clear_width_m = round(bay.cy1 - bay.cy0, 3);
        room.area_m2 = round((xe - xs) * (bay.cy1 - bay.cy0), 2);
        room.clear_height_m = round(bay.ceiling - FFL, 3);
        rooms.push(room);
        push({ x: [xs, xe], y: [bay.cy0, bay.cy1], z: [zr, FFL], name: r.name + ' (floor zone)', group: 'room_' + r.id, cat: 'room', mat: 'room', room: r.id, bay: bay.id });
        if (!isLast && r.boundary === 'partition') {
          var dh = [];
          if (r.door) dh.push({ a0: bay.y0 + r.door.from_m, a1: bay.y0 + r.door.to_m, z0: zr, z1: FFL + (r.door.head_m || 2.1) });
          addWall(prims, {
            axis: 'y', a: [bay.cy0, bay.cy1], c: [r.end_m - pt / 2, r.end_m + pt / 2], z: [zr, bay.ceiling], holes: dh,
            name: 'Partition: ' + r.name + ' / ' + list[i + 1].name, group: 'partition_' + r.id, cat: 'partition', mat: 'partition', bay: bay.id
          });
          xs = r.end_m + pt / 2;
        } else xs = xe;
      });
    });
    var roomById = {};
    rooms.forEach(function (r) { roomById[r.id] = r; });

    (spec.fixtures || []).forEach(function (f) {
      var r = roomById[f.room];
      if (!r) return;
      var corner = f.corner || 'nw', at = f.at || [0, 0], s = f.size;
      var x0 = corner.indexOf('e') >= 0 ? r.xe - at[0] - s[0] : r.xs + at[0];
      var y0 = corner.indexOf('s') === 0 ? r.ye - at[1] - s[1] : r.ys + at[1];
      var z0 = FFL + (f.elevation_m || 0);
      push({ x: [x0, x0 + s[0]], y: [y0, y0 + s[1]], z: [z0, z0 + s[2]], name: f.name, group: 'fixture_' + f.id, cat: 'fixture', mat: f.material || 'fixture', room: f.room, fixture: f.id });
    });

    /* --- porches and ramps --- */
    var porches = [];
    (spec.porches || []).forEach(function (p) {
      var g = p.gap_m == null ? 0.02 : p.gap_m;
      var fx0, fx1, fy0, fy1;
      if (p.side === 'south' || p.side === 'north') {
        fx0 = p.from_m; fx1 = p.from_m + p.length_m;
        if (p.side === 'south') { fy0 = Wt + tOut + g; fy1 = fy0 + p.depth_m; } else { fy1 = -tOut - g; fy0 = fy1 - p.depth_m; }
      } else {
        fy0 = p.from_m; fy1 = p.from_m + p.length_m;
        if (p.side === 'east') { fx0 = L + tOut + g; fx1 = fx0 + p.depth_m; } else { fx1 = -tOut - g; fx0 = fx1 - p.depth_m; }
      }
      var dt = p.deck_thickness_m || 0.2, ps = p.post_size_m || 0.14, ch = p.clear_height_m || 2.5;
      var info = { id: p.id, name: p.name, side: p.side, x0: fx0, x1: fx1, y0: fy0, y1: fy1, screened: !!p.screened, roofed: p.roof !== false };
      porches.push(info);
      var gid = 'porch_' + p.id;
      push({ x: [fx0, fx1], y: [fy0, fy1], z: [FFL - dt, FFL], name: p.name + ': deck', group: gid + '_deck', cat: 'porch', mat: 'decking', porch: p.id });
      [[fx0, fy0], [fx1 - ps, fy0], [fx0, fy1 - ps], [fx1 - ps, fy1 - ps]].forEach(function (c, i) {
        push({ x: [c[0], c[0] + ps], y: [c[1], c[1] + ps], z: [FFL, FFL + ch], name: p.name + ': post', group: gid + '_posts', cat: 'porch', mat: 'post', porch: p.id, part: i });
        var pi = 0.15;
        var px = c[0] === fx0 ? fx0 + pi : fx1 - pi - ps, py = c[1] === fy0 ? fy0 + pi : fy1 - pi - ps;
        push({ x: [px, px + ps], y: [py, py + ps], z: [zGrade, FFL - dt], name: p.name + ': pile', group: gid + '_piles', cat: 'foundation', mat: 'pile', porch: p.id, part: i });
      });
      if (p.roof !== false) {
        var ov = p.roof_overhang_m == null ? 0.2 : p.roof_overhang_m;
        /* overhang on every side except the one facing the building */
        var rx = [fx0 - (p.side === 'east' ? 0 : ov), fx1 + (p.side === 'west' ? 0 : ov)];
        var ry = [fy0 - (p.side === 'south' ? 0 : ov), fy1 + (p.side === 'north' ? 0 : ov)];
        push({ x: rx, y: ry, z: [FFL + ch, FFL + ch + (p.roof_thickness_m || 0.15)], name: p.name + ': roof', group: gid + '_roof', cat: 'porch-roof', mat: 'roofing', porch: p.id });
      }
      if (p.screened) {
        var outer = { south: ['south', 'west', 'east'], north: ['north', 'west', 'east'], west: ['west', 'north', 'south'], east: ['east', 'north', 'south'] }[p.side];
        outer.forEach(function (side) {
          var sd = p.screen_door && p.screen_door.side === side ? [{ a0: p.screen_door.from_m, a1: p.screen_door.to_m, z0: FFL, z1: FFL + 2.05 }] : [];
          var o = { z: [FFL, FFL + ch], holes: sd, name: p.name + ': insect screen (' + side + ')', group: gid + '_screen_' + side, cat: 'screen', mat: 'screen', face: side, porch: p.id };
          if (side === 'south' || side === 'north') {
            var yy = side === 'south' ? fy1 - ps / 2 : fy0 + ps / 2;
            addWall(prims, Object.assign(o, { axis: 'x', a: [fx0 + ps, fx1 - ps], c: [yy - 0.006, yy + 0.006] }));
          } else {
            var xx = side === 'east' ? fx1 - ps / 2 : fx0 + ps / 2;
            addWall(prims, Object.assign(o, { axis: 'y', a: [fy0 + ps, fy1 - ps], c: [xx - 0.006, xx + 0.006] }));
          }
        });
      }
    });
    var porchById = {};
    porches.forEach(function (p) { porchById[p.id] = p; });

    var ramps = [];
    (spec.ramps || []).forEach(function (r) {
      var p = porchById[r.porch];
      if (!p) return;
      var rise = FFL - zGrade, run = rise * r.slope_ratio, w;
      if (r.side === 'east') w = { x: [p.x1, p.x1 + run], y: [r.from_m, r.to_m], high: 'west' };
      else if (r.side === 'west') w = { x: [p.x0 - run, p.x0], y: [r.from_m, r.to_m], high: 'east' };
      else if (r.side === 'south') w = { x: [r.from_m, r.to_m], y: [p.y1, p.y1 + run], high: 'north' };
      else w = { x: [r.from_m, r.to_m], y: [p.y0 - run, p.y0], high: 'south' };
      var b = mkBox({ x: w.x, y: w.y, z: [zGrade, FFL], name: (r.surface === 'gravel' ? 'Graded gravel trail' : 'Ramp') + ' (1:' + r.slope_ratio + ' concept)', group: 'ramp_' + r.id, cat: 'ramp', mat: r.surface === 'gravel' ? 'gravel' : 'decking', ramp: r.id });
      b.kind = 'wedge';
      b.high = w.high;
      prims.push(b);
      ramps.push({ id: r.id, porch: r.porch, side: r.side, surface: r.surface || 'decking', rise_m: round(rise, 3), run_m: round(run, 2), slope_ratio: r.slope_ratio, width_m: round(Math.abs(r.to_m - r.from_m), 2), x0: b.min[0], x1: b.max[0], y0: b.min[1], y1: b.max[1], high: w.high });
    });

    /* --- trellis (independent of the shell) --- */
    if (spec.trellis) {
      var t = spec.trellis, tps = t.post_size_m || 0.09, n = t.posts || 3;
      var plane, sgn;
      if (t.face === 'west') { plane = -tOut - t.offset_m; sgn = 1; }
      else if (t.face === 'east') { plane = L + tOut + t.offset_m; sgn = -1; }
      else if (t.face === 'north') { plane = -tOut - t.offset_m; sgn = 1; }
      else { plane = Wt + tOut + t.offset_m; sgn = -1; }
      var along = (t.face === 'west' || t.face === 'east') ? 'y' : 'x';
      var pos = [];
      for (var k = 0; k < n; k++) pos.push(t.from_m + (t.to_m - t.from_m) * k / (n - 1));
      var put = function (o, a, c) { if (along === 'y') { o.y = a; o.x = c; } else { o.x = a; o.y = c; } push(o); };
      pos.forEach(function (pp, i) {
        put({ z: [zGrade, zGrade + t.height_m], name: 'Trellis post', group: 'trellis_posts', cat: 'trellis', mat: 'trellis', part: i }, [pp - tps / 2, pp + tps / 2], [plane - tps / 2, plane + tps / 2]);
      });
      for (var zz = zGrade + 0.5; zz < zGrade + t.height_m - 0.1; zz += t.rail_spacing_m) {
        for (var j = 0; j < pos.length - 1; j++) {
          put({ z: [zz, zz + 0.03], name: 'Trellis rail', group: 'trellis_rails', cat: 'trellis', mat: 'trellis' }, [pos[j] + tps / 2, pos[j + 1] - tps / 2], [plane - 0.015, plane + 0.015]);
        }
      }
      var vc = sgn > 0 ? [plane + tps / 2 + 0.005, plane + tps / 2 + 0.05] : [plane - tps / 2 - 0.05, plane - tps / 2 - 0.005];
      put({ z: [zGrade + 0.1, zGrade + t.planting_height_m], name: 'Native climbing plants (indicative maturity)', group: 'trellis_planting', cat: 'trellis', mat: 'vine' }, [t.from_m - tps / 2, t.to_m + tps / 2], vc);
    }

    /* --- foundations --- */
    var fd = spec.foundation, fps = fd.pile_size_m || 0.14;
    bays.forEach(function (bay) {
      var xsP = fd.pile_x_m || [0.3, L / 2, L - 0.3];
      var ysP = bay.type === 'container' ? [bay.y0 + 0.15, bay.y1 - 0.15] : [bay.y0 + bay.width / 3, bay.y0 + 2 * bay.width / 3];
      if (bay.type !== 'container') xsP = [0.3, L / 3, 2 * L / 3, L - 0.3];
      xsP.forEach(function (px) {
        ysP.forEach(function (py) {
          push({ x: [px - fps / 2, px + fps / 2], y: [py - fps / 2, py + fps / 2], z: [zGrade, zSoffit], name: 'Pile (type to be engineered)', group: 'piles', cat: 'foundation', mat: 'pile', bay: bay.id });
        });
      });
    });

    /* --- roof option: PV and/or extensive green roof --- */
    var roofOpt = options.roof || (spec.roof && spec.roof.default_option) || 'pv';
    var ro = (spec.roof && spec.roof.options && spec.roof.options[roofOpt]) || {};
    var panel = (spec.roof && spec.roof.pv_panel) || { width_m: 1.134, length_m: 2.278, watts: 420, gap_m: 0.02 };
    var pvCount = 0;
    bays.forEach(function (bay) {
      var isGreen = (ro.green_bays || []).indexOf(bay.id) >= 0 && bay.type === 'container';
      var isPv = (ro.pv_bays || []).indexOf(bay.id) >= 0;
      var ex0 = -tOut, ex1 = L + tOut;
      var ey0 = bay === first ? -tOut : bay.y0, ey1 = bay === last ? Wt + tOut : bay.y1;
      var gt = spec.roof.green_roof_depth_m || 0.1;
      if (isGreen) {
        var gs = spec.roof.green_edge_setback_m || 0.5;
        push({ x: [ex0 + gs, ex1 - gs], y: [ey0 + gs, ey1 - gs], z: [bay.top, bay.top + gt], name: 'Extensive green roof (growing medium and low planting)', group: bay.id + '_green_roof', cat: 'roof', mat: 'green', bay: bay.id });
      }
      if (isPv) {
        var s = spec.roof.pv_edge_setback_m || 0.25, gap = panel.gap_m || 0.02;
        var ax = ex1 - ex0 - 2 * s, ay = ey1 - ey0 - 2 * s;
        var opts = [
          { pw: panel.width_m, pl: panel.length_m },
          { pw: panel.length_m, pl: panel.width_m }
        ].map(function (o) {
          o.cols = Math.floor((ax + gap) / (o.pw + gap));
          o.rows = Math.floor((ay + gap) / (o.pl + gap));
          o.n = o.cols * o.rows;
          return o;
        }).sort(function (p, q) { return q.n - p.n; });
        var best = opts[0];
        if (best.n > 0) {
          var x0 = ex0 + s + (ax - (best.cols * (best.pw + gap) - gap)) / 2;
          var y0p = ey0 + s + (ay - (best.rows * (best.pl + gap) - gap)) / 2;
          var pz = isGreen ? bay.top + gt + 0.3 : bay.top + 0.08;
          for (var r = 0; r < best.rows; r++) {
            for (var c = 0; c < best.cols; c++) {
              var px0 = x0 + c * (best.pw + gap), py0 = y0p + r * (best.pl + gap);
              push({ x: [px0, px0 + best.pw], y: [py0, py0 + best.pl], z: [pz, pz + 0.04], name: 'PV module' + (isGreen ? ' (raised above planting)' : ''), group: bay.id + '_pv', cat: 'pv', mat: 'pv', bay: bay.id, part: pvCount });
              pvCount++;
            }
          }
        }
      }
    });

    /* --- summary --- */
    var bmin = [Infinity, Infinity, Infinity], bmax = [-Infinity, -Infinity, -Infinity];
    prims.forEach(function (p) {
      for (var k = 0; k < 3; k++) { bmin[k] = Math.min(bmin[k], p.min[k]); bmax[k] = Math.max(bmax[k], p.max[k]); }
    });
    prims.forEach(function (p, i) { p.id = i; });

    var quantities = {};
    prims.forEach(function (p) {
      var q = quantities[p.mat] || (quantities[p.mat] = { volume_m3: 0, count: 0 });
      q.volume_m3 += volume(p);
      q.count++;
    });
    Object.keys(quantities).forEach(function (k) { quantities[k].volume_m3 = round(quantities[k].volume_m3, 3); });

    var clearArea = sum(rooms, function (r) { return r.area_m2; });
    var meta = {
      L: L, W: W, H: H, te: te, ts: ts, tf: tf, tr: tr, li: li, FFL: FFL, zr: zr, ceiling: ceil,
      zGrade: zGrade, zSoffit: zSoffit, contTop: contTop, tOut: tOut, Wt: Wt, fm: fm, hf: hf,
      roof_option: roofOpt,
      bounds: { min: bmin, max: bmax },
      overall: {
        x0: -tOut, x1: L + tOut, y0: -tOut, y1: Wt + tOut,
        length_m: round(L + 2 * tOut, 3), width_m: round(Wt + 2 * tOut, 3),
        height_above_grade_m: round(Math.max.apply(null, bays.map(function (b) { return b.top; })) - zGrade, 3)
      },
      ffl_above_grade_m: round(FFL - zGrade, 3),
      clear_height_m: round(ceil - FFL, 3),
      footprint_m2: round((L + 2 * tOut) * (Wt + 2 * tOut), 2),
      clear_floor_area_m2: round(clearArea, 2),
      porch_area_m2: round(sum(porches, function (p) { return (p.x1 - p.x0) * (p.y1 - p.y0); }), 2),
      pv: { panels: pvCount, kwp: round(pvCount * (panel.watts || 0) / 1000, 2), panel: panel },
      wall_layers: wallLayers, roof_layers: roofLayers, floor_layers: floorLayers
    };

    return {
      spec: spec, prims: prims, rooms: rooms, bays: bays.map(function (b) {
        return { id: b.id, type: b.type, name: b.name, y0: b.y0, y1: b.y1, width: b.width, top: b.top, cx0: b.cx0, cx1: b.cx1, cy0: b.cy0, cy1: b.cy1, ceiling: b.ceiling };
      }),
      openings: openings.map(function (o) {
        var c = Object.assign({}, o);
        c.bay = o.bayRef.id; delete c.bayRef;
        return c;
      }),
      porches: porches, ramps: ramps, meta: meta, quantities: quantities
    };
  }

  /* Steel reinforcement frame around a cut opening (concept only). */
  function frames(list, axis, c, h, zr, bay, face, interior) {
    var o = h.o, a0 = o.a0, a1 = o.a1, z0 = o.z0, z1 = o.z1, f = h.a0 < a0 ? a0 - h.a0 : 0;
    var parts = [
      { a: [h.a0, h.a1], z: [z1, h.z1] },
      { a: [h.a0, a0], z: [z0, z1] },
      { a: [a1, h.a1], z: [z0, z1] }
    ];
    if (o.sill_m) parts.push({ a: [h.a0, h.a1], z: [h.z0, z0] });
    parts.forEach(function (p, i) {
      var zz = [Math.max(zr[0], p.z[0]), Math.min(zr[1], p.z[1])];
      if (zz[1] - zz[0] < 1e-4 || f <= 0) return;
      var b = { z: zz, name: 'Opening reinforcement frame (to be engineered)', group: bay + '_' + face + '_frames', cat: 'structure', mat: 'frame', face: face, bay: bay, interior: interior, part: i };
      if (axis === 'x') { b.x = p.a; b.y = c; } else { b.y = p.a; b.x = c; }
      list.push(mkBox(b));
    });
  }

  /* ---------- checks shared by the generator and tests ---------- */

  function overlaps(a, b, eps) {
    eps = eps == null ? 1e-5 : eps;
    for (var k = 0; k < 3; k++) {
      if (a.max[k] <= b.min[k] + eps || b.max[k] <= a.min[k] + eps) return false;
    }
    return true;
  }

  function validate(spec, model) {
    var issues = [];
    var err = function (m) { issues.push({ level: 'error', message: m }); };
    var warn = function (m) { issues.push({ level: 'warning', message: m }); };
    var M = model.meta, L = M.L, fm = M.fm;
    var bays = {};
    model.bays.forEach(function (b) { bays[b.id] = b; });
    var targets = spec.design_targets || {};
    var minDoor = targets.min_clear_door_width_m || 0.86;
    var pt = spec.partition_thickness_m || 0.1;

    model.openings.forEach(function (o) {
      var bay = bays[o.bay];
      if (!bay) { err('Opening ' + o.id + ' refers to unknown bay ' + o.bay); return; }
      if (o.to_m <= o.from_m) err('Opening ' + o.id + ' has zero or negative width');
      if (o.head_m <= (o.sill_m || 0)) err('Opening ' + o.id + ' head is below its sill');
      var steel = bay.type === 'container';
      if (o.along === 'x') {
        var lim = steel ? 0.3 : M.hf + 0.1;
        if (o.a0 - fm < lim || o.a1 + fm > L - lim) err('Opening ' + o.id + ' is too close to the corner posts/ends of the ' + o.face + ' wall');
      } else {
        var y0 = bay.y0 + (steel ? M.ts + 0.15 : 0.1), y1 = bay.y1 - (steel ? M.ts + 0.15 : 0.1);
        if (o.a0 - fm < y0 || o.a1 + fm > y1) err('Opening ' + o.id + ' extends beyond the usable width of the ' + o.face + ' end wall');
      }
      if (steel && o.z1 + fm > M.H - M.tr) err('Opening ' + o.id + ' head (with frame) cuts into the container top rail');
      if ((o.type === 'door' || o.type === 'sliding-door') && o.to_m - o.from_m < minDoor) {
        warn('Door ' + o.id + ' is narrower (' + round(o.to_m - o.from_m, 2) + ' m) than the project clear-width target of ' + minDoor + ' m');
      }
      if (steel && o.along === 'x') {
        (spec.rooms || []).forEach(function (r) {
          if (r.bay !== o.bay || r.boundary !== 'partition') return;
          if (o.a1 + fm > r.end_m - pt / 2 && o.a0 - fm < r.end_m + pt / 2) err('Opening ' + o.id + ' crosses the partition at x = ' + r.end_m + ' m');
        });
      }
    });
    /* overlapping openings on the same face */
    model.openings.forEach(function (a, i) {
      model.openings.slice(i + 1).forEach(function (b) {
        if (a.bay !== b.bay || a.face !== b.face) return;
        if (a.a0 - fm < b.a1 + fm && b.a0 - fm < a.a1 + fm && a.z0 < b.z1 && b.z0 < a.z1) err('Openings ' + a.id + ' and ' + b.id + ' overlap (including reinforcement frames)');
      });
    });
    (spec.rooms || []).forEach(function (r) {
      if (r.door && r.door.to_m - r.door.from_m < minDoor) warn('Door from ' + r.name + ' is narrower than the clear-width target of ' + minDoor + ' m');
    });
    model.rooms.forEach(function (r) {
      if (r.clear_length_m <= 0.5) err('Room ' + r.id + ' is too short or out of order (' + r.clear_length_m + ' m)');
    });
    /* fixtures inside rooms */
    var roomById = {};
    model.rooms.forEach(function (r) { roomById[r.id] = r; });
    model.prims.forEach(function (p) {
      if (p.cat !== 'fixture') return;
      var r = roomById[p.room];
      if (p.min[0] < r.xs - EPS || p.max[0] > r.xe + EPS || p.min[1] < r.ys - EPS || p.max[1] > r.ye + EPS) err('Fixture "' + p.name + '" sits outside room ' + r.id);
      if (p.max[2] > r.ceiling + EPS) err('Fixture "' + p.name + '" is taller than the ceiling');
    });
    /* solids must not intersect (required for correct drawing order) */
    var P = model.prims;
    for (var i = 0; i < P.length; i++) {
      for (var j = i + 1; j < P.length; j++) {
        if (overlaps(P[i], P[j])) err('Geometry overlap: "' + P[i].name + '" and "' + P[j].name + '"');
      }
    }
    model.ramps.forEach(function (r) {
      if (r.slope_ratio < 12) err('Ramp ' + r.id + ' is steeper than 1:12');
      else if (r.slope_ratio < (targets.preferred_ramp_ratio || 15)) warn('Ramp ' + r.id + ' is steeper than the preferred 1:' + targets.preferred_ramp_ratio);
    });
    return issues;
  }

  return {
    buildModel: buildModel,
    geometry: geometry,
    volume: volume,
    panelize: panelize,
    overlaps: overlaps,
    validate: validate,
    round: round,
    FACES: FACES
  };
});
