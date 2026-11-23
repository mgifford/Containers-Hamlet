/*
 * Containers Hamlet interior spatial model.
 *
 * Room polygons, partitions, doors, fixtures, circulation and clearances are
 * module-local metres. The model is conceptual: it validates consistency, not
 * building-code compliance or professional accessibility.
 *
 * Code licence: AGPL-3.0-or-later.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./design-schema.js'), require('./design-model.js'));
  else root.DesignInterior = factory(root.DesignSchema, root.DesignModel);
})(typeof self !== 'undefined' ? self : this, function (Schema, Model) {
  'use strict';

  var SCHEMA = 'containers-hamlet-interior/v1';
  var ROOM_TYPES = ['sleeping', 'bathroom', 'kitchen', 'living', 'dining', 'work', 'storage', 'circulation', 'entry', 'utility'];
  var FIXTURE_TYPES = ['wc', 'sink', 'shower', 'bath', 'vanity', 'counter', 'fridge', 'stove', 'bed', 'wardrobe', 'table', 'sofa', 'washer', 'water-heater', 'electrical-panel', 'wood-stove'];
  var CLEARANCE_TYPES = ['turning-circle', 'work-zone', 'door-clearance', 'circulation'];
  var LINING_M = 0.07;
  var E = 0.001;

  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function num(v, d) { return typeof v === 'number' && Number.isFinite(v) ? v : d; }
  function round(v, d) { var f = Math.pow(10, d == null ? 2 : d); return Math.round(v * f) / f; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function n(v) { return round(v, 1); }
  function oneOf(list, v) { return list.indexOf(v) >= 0; }

  function clearEnvelope(module) {
    var L = module.nominal.length_m - 2 * LINING_M;
    var W = module.nominal.width_m - 2 * LINING_M;
    return { minX: -L / 2, maxX: L / 2, minY: -W / 2, maxY: W / 2, width: W, length: L, area_m2: L * W };
  }
  function pointInPoly(p, poly) {
    var inside = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if ((yi > p[1]) !== (yj > p[1]) && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  function polygonArea(poly) {
    var a = 0;
    for (var i = 0; i < poly.length; i++) { var p = poly[i], q = poly[(i + 1) % poly.length]; a += p[0] * q[1] - q[0] * p[1]; }
    return Math.abs(a) / 2;
  }
  function bbox(poly) {
    var xs = poly.map(function (p) { return p[0]; }), ys = poly.map(function (p) { return p[1]; });
    return { minX: Math.min.apply(null, xs), maxX: Math.max.apply(null, xs), minY: Math.min.apply(null, ys), maxY: Math.max.apply(null, ys) };
  }
  function rectPolygon(cx, cy, w, d) { return [[cx - w / 2, cy - d / 2], [cx + w / 2, cy - d / 2], [cx + w / 2, cy + d / 2], [cx - w / 2, cy + d / 2]]; }
  function rectCorners(item) {
    var w = item.size_m ? item.size_m[0] : 0.6, d = item.size_m ? item.size_m[1] : 0.6;
    var a = (item.rotation_deg || 0) * Math.PI / 180;
    var c = Math.cos(a), s = Math.sin(a);
    return [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]].map(function (p) {
      return [item.position_m[0] + p[0] * c - p[1] * s, item.position_m[1] + p[0] * s + p[1] * c];
    });
  }
  function distPointSeg(p, a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1];
    var l2 = dx * dx + dy * dy;
    var t = l2 ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2 : 0;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
  }
  function polygonOverlap(a, b) { return Model.overlapArea(a, b); }

  function fromZones(designInput) {
    var d = Schema.canonicalize(designInput);
    var rooms = [];
    d.modules.forEach(function (m) {
      var env = clearEnvelope(m);
      (m.zones || []).forEach(function (z) {
        var x0 = Math.max(env.minX, -m.nominal.length_m / 2 + z.start_m + LINING_M);
        var x1 = Math.min(env.maxX, -m.nominal.length_m / 2 + z.end_m - LINING_M);
        if (x1 - x0 < 0.2) return;
        rooms.push({
          id: 'room-' + m.id + '-' + z.id,
          name: z.name,
          type: z.type === 'work' ? 'work' : z.type,
          module: m.id,
          level: m.storey,
          polygon: [[x0, env.minY], [x1, env.minY], [x1, env.maxY], [x0, env.maxY]],
          provenance: 'inferred-from-zone',
          sourceZoneId: z.id,
          openingIds: (m.openings || []).filter(function (o) {
            if (o.type !== 'window' && o.type !== 'sliding-door' && o.type !== 'door') return false;
            if (o.face !== 'north' && o.face !== 'south') return false;
            var ox = -m.nominal.length_m / 2 + o.position_m;
            return ox >= x0 - 0.2 && ox <= x1 + 0.2;
          }).map(function (o) { return o.id; }),
          accessibility: { assessment: 'not-verified', notes: z.accessibility || '' }
        });
      });
    });
    return {
      schema: SCHEMA,
      status: 'provisional',
      clearances: { circulation_width_m: 0.9, turning_circle_m: 1.5, door_width_m: 0.86 },
      rooms: rooms,
      partitions: [],
      doors: [],
      fixtures: [],
      circulation: [],
      clearances: [],
      service: [],
      provenance: { method: 'Inferred from longitudinal room bands. No partition or door positions were invented.', source: 'design-lab room zones', verification: 'None. Provisional geometry.' }
    };
  }

  function migrate(designInput) {
    var d = Schema.canonicalize(designInput);
    if (d.interior && d.interior.schema === SCHEMA) return { design: d, report: { ok: true, from: SCHEMA, to: SCHEMA, preserved: ['existing interior'], inferred: [], unmapped: [] } };
    var interior = fromZones(d);
    d.interior = interior;
    return {
      design: Schema.canonicalize(d),
      report: {
        ok: true, from: 'room-zones', to: SCHEMA,
        preserved: ['zone names', 'zone types', 'zone start/end ranges', 'source zone ids', 'module references', 'accessibility notes'],
        inferred: ['room rectangles across the clear module width', 'room provenance marked inferred-from-zone', 'interior status marked provisional'],
        unmapped: ['partitions were not present', 'door positions and swings were not present', 'fixtures were not present', 'clearances and turning circles were not present', 'circulation routes were not present']
      }
    };
  }

  function roomById(design, id) { return ((design.interior && design.interior.rooms) || []).filter(function (r) { return r.id === id; })[0]; }
  function moduleById(design, id) { return design.modules.filter(function (m) { return m.id === id; })[0]; }
  function partitionById(design, id) { return ((design.interior && design.interior.partitions) || []).filter(function (p) { return p.id === id; })[0]; }
  function doorCenter(partition, door) {
    if (!partition) return null;
    var t = Math.max(0, Math.min(1, num(door.position_m, 0.5)));
    return [partition.from[0] + (partition.to[0] - partition.from[0]) * t, partition.from[1] + (partition.to[1] - partition.from[1]) * t];
  }

  function validate(designInput) {
    var d = Schema.canonicalize(designInput);
    var invalid = [], unresolved = [], review = [];
    var err = function (code, message) { invalid.push({ category: 'invalid-geometry', code: code, message: message }); };
    var unres = function (code, message) { unresolved.push({ category: 'unresolved-design', code: code, message: message }); };
    var rev = function (code, message) { review.push({ category: 'review-required', code: code, message: message }); };
    var interior = d.interior;
    if (!interior || interior.schema !== SCHEMA) {
      unres('interior-missing', 'No interior spatial model is recorded. Room bands are the only room information.');
      return { ok: true, invalid: invalid, unresolved: unresolved, review: review, items: invalid.concat(unresolved, review) };
    }
    if (interior.status !== 'authored') unres('provisional-interior', 'Interior geometry is provisional. Partitions, doors and fixtures may be incomplete.');
    var ids = {};
    (interior.rooms || []).forEach(function (r) { if (ids[r.id]) err('duplicate-room-id', 'Room id ' + r.id + ' is duplicated.'); ids[r.id] = true; });
    (interior.partitions || []).forEach(function (p) { if (ids[p.id]) err('duplicate-partition-id', 'Partition id ' + p.id + ' is duplicated.'); ids[p.id] = true; });
    (interior.doors || []).forEach(function (x) { if (ids[x.id]) err('duplicate-door-id', 'Door id ' + x.id + ' is duplicated.'); ids[x.id] = true; });
    (interior.fixtures || []).forEach(function (x) { if (ids[x.id]) err('duplicate-fixture-id', 'Fixture id ' + x.id + ' is duplicated.'); ids[x.id] = true; });
    var totalRoomArea = 0, totalClearArea = 0;
    (interior.rooms || []).forEach(function (r) {
      var m = moduleById(d, r.module);
      if (!m) { err('room-module', 'Room ' + r.id + ' references unknown module ' + r.module + '.'); return; }
      if (!Array.isArray(r.polygon) || r.polygon.length < 3) { err('room-polygon', 'Room ' + r.id + ' needs a polygon with at least three points.'); return; }
      if (!oneOf(ROOM_TYPES, r.type)) err('room-type', 'Room ' + r.id + ' has unknown type ' + r.type + '.');
      if (r.level !== m.storey) err('room-level', 'Room ' + r.id + ' level does not match module ' + m.id + '.');
      var env = clearEnvelope(m);
      r.polygon.forEach(function (p) {
        if (!Array.isArray(p) || p.length !== 2 || !Number.isFinite(p[0]) || !Number.isFinite(p[1])) err('room-point', 'Room ' + r.id + ' has an invalid polygon point.');
        else if (p[0] < env.minX - E || p[0] > env.maxX + E || p[1] < env.minY - E || p[1] > env.maxY + E) err('room-bounds', 'Room ' + r.id + ' extends beyond the usable interior of ' + m.id + '.');
      });
      var a = polygonArea(r.polygon);
      if (a < 0.5) err('room-area', 'Room ' + r.id + ' has an unusable area.');
      totalRoomArea += a;
      totalClearArea += env.area_m2;
      (interior.rooms || []).forEach(function (other) {
        if (other.id <= r.id || other.module !== r.module) return;
        if (polygonOverlap(r.polygon, other.polygon) > 0.05) err('room-overlap', 'Rooms ' + r.id + ' and ' + other.id + ' overlap.');
      });
      (r.openingIds || []).forEach(function (id) {
        var exists = (m.openings || []).some(function (o) { return o.id === id; });
        if (!exists) err('room-opening', 'Room ' + r.id + ' references unknown opening ' + id + '.');
      });
      if (r.provenance === 'inferred-from-zone') unres('inferred-room', 'Room ' + r.id + ' is inferred from a zone band, not an authored layout.');
      if (!r.accessibility || r.accessibility.assessment !== 'professionally-verified') rev('room-accessibility', 'Room ' + r.id + ' accessibility is not professionally verified.');
    });
    if (totalClearArea > 0 && totalRoomArea / totalClearArea < 0.55) unres('room-coverage', 'Room polygons cover less than 55% of the clear interior. Unassigned floor area may be unresolved.');
    (interior.partitions || []).forEach(function (p) {
      var m = moduleById(d, p.module);
      if (!m) { err('partition-module', 'Partition ' + p.id + ' references unknown module.'); return; }
      if (!Array.isArray(p.from) || !Array.isArray(p.to)) { err('partition-geometry', 'Partition ' + p.id + ' needs from/to points.'); return; }
      var env = clearEnvelope(m);
      [p.from, p.to].forEach(function (q) { if (q[0] < env.minX - E || q[0] > env.maxX + E || q[1] < env.minY - E || q[1] > env.maxY + E) err('partition-bounds', 'Partition ' + p.id + ' extends beyond ' + m.id + '.'); });
      if (Math.hypot(p.to[0] - p.from[0], p.to[1] - p.from[1]) < 0.2) err('partition-length', 'Partition ' + p.id + ' is too short.');
      if (!num(p.thickness_m, 0) || p.thickness_m < 0.04 || p.thickness_m > 0.4) rev('partition-thickness', 'Partition ' + p.id + ' thickness is outside a typical concept range.');
    });
    (interior.doors || []).forEach(function (x) {
      var p = partitionById(d, x.partition);
      if (!p) { err('door-partition', 'Door ' + x.id + ' references unknown partition.'); return; }
      if (!num(x.width_m, 0) || x.width_m < 0.6 || x.width_m > 2.5) err('door-width', 'Door ' + x.id + ' has an invalid width.');
      if (!Array.isArray(x.connects) || x.connects.length !== 2 || x.connects[0] === x.connects[1]) err('door-connects', 'Door ' + x.id + ' must connect two distinct rooms.');
      (x.connects || []).forEach(function (rid) { if (!roomById(d, rid)) err('door-room', 'Door ' + x.id + ' references unknown room ' + rid + '.'); });
      var c = doorCenter(p, x);
      if (c) (interior.fixtures || []).forEach(function (f) {
        if (distPointSeg(c, rectCorners(f)[0], rectCorners(f)[1]) < 0.35) err('door-blocked', 'Door ' + x.id + ' is within 350 mm of fixture ' + f.id + '.');
      });
      if (x.width_m < 0.86) rev('door-clearance', 'Door ' + x.id + ' is narrower than the 0.86 m project target.');
    });
    (interior.fixtures || []).forEach(function (f) {
      var r = roomById(d, f.room);
      if (!r) { err('fixture-room', 'Fixture ' + f.id + ' references unknown room ' + f.room + '.'); return; }
      if (!oneOf(FIXTURE_TYPES, f.type)) err('fixture-type', 'Fixture ' + f.id + ' has unknown type ' + f.type + '.');
      var corners = rectCorners(f);
      if (!corners.every(function (p) { return pointInPoly(p, r.polygon); })) err('fixture-outside-room', 'Fixture ' + f.id + ' is outside room ' + r.id + '.');
      (interior.fixtures || []).forEach(function (other) {
        if (other.id <= f.id || other.room !== f.room) return;
        if (polygonOverlap(corners, rectCorners(other)) > 0.02) rev('fixture-overlap', 'Fixtures ' + f.id + ' and ' + other.id + ' overlap.');
      });
    });
    (interior.clearances || []).forEach(function (c) {
      var r = roomById(d, c.room);
      if (!r) { err('clearance-room', 'Clearance ' + c.id + ' references unknown room.'); return; }
      if (c.type === 'work-zone') {
        var zone = c.size_m && c.size_m.length === 2 ? c.size_m : [1.2, 0.6];
        if (!c.center_m || !Array.isArray(c.center_m)) err('work-zone-center', 'Work zone ' + c.id + ' needs a centre point.');
        else {
          var zc = rectPolygon(c.center_m[0], c.center_m[1], zone[0], zone[1]);
          if (!zc.every(function (p) { return pointInPoly(p, r.polygon); })) err('work-zone-bounds', 'Work zone ' + c.id + ' extends outside room ' + r.id + '.');
          if (zone[0] < 1.2 && zone[1] < 1.2) rev('work-zone-size', 'Work zone ' + c.id + ' is smaller than a 1.2 m approach.');
        }
      }
      if (c.type === 'turning-circle') {
        var diam = num(c.diameter_m, 0);
        if (diam < 1.2) err('turning-circle-size', 'Clearance ' + c.id + ' has an invalid turning-circle diameter.');
        var pts = [];
        for (var i = 0; i < 12; i++) { var a = (i / 12) * Math.PI * 2; pts.push([c.center_m[0] + Math.cos(a) * diam / 2, c.center_m[1] + Math.sin(a) * diam / 2]); }
        if (!pts.every(function (p) { return pointInPoly(p, r.polygon); })) err('turning-circle-bounds', 'Turning circle ' + c.id + ' does not fit inside room ' + r.id + '.');
        (interior.fixtures || []).forEach(function (f) {
          if (f.room !== r.id) return;
          var circle = rectPolygon(c.center_m[0], c.center_m[1], diam, diam);
          if (polygonOverlap(circle, rectCorners(f)) > 0.02) err('turning-circle-blocked', 'Turning circle ' + c.id + ' is blocked by fixture ' + f.id + '.');
        });
        if (c.status !== 'professionally-verified') rev('turning-circle-review', 'Turning circle ' + c.id + ' is a modeled check, not a professional accessibility assessment.');
      }
    });
    // Connectivity
    var rooms = interior.rooms || [], doors = interior.doors || [];
    if (!doors.length && rooms.length > 1) unres('doors-missing', 'No interior doors are modeled. Room connectivity cannot be assessed.');
    else if (rooms.length > 1) {
      var graph = {};
      rooms.forEach(function (r) { graph[r.id] = []; });
      doors.forEach(function (x) { if (x.connects && x.connects.length === 2) { graph[x.connects[0]].push(x.connects[1]); graph[x.connects[1]].push(x.connects[0]); } });
      var seen = {}, stack = [rooms[0].id];
      while (stack.length) { var id = stack.pop(); if (seen[id]) continue; seen[id] = true; (graph[id] || []).forEach(function (nid) { if (!seen[nid]) stack.push(nid); }); }
      var essential = rooms.filter(function (r) { return ['living', 'kitchen', 'bathroom', 'sleeping'].indexOf(r.type) >= 0; });
      essential.forEach(function (r) { if (!seen[r.id]) err('room-connectivity', 'Essential room ' + r.id + ' is not connected to the rest of the home by modeled doors.'); });
    }
    (interior.circulation || []).forEach(function (c) {
      if (!num(c.width_m, 0) || c.width_m < 0.9) rev('circulation-width', 'Circulation route ' + c.id + ' is narrower than the 0.9 m project target.');
    });
    if (interior.status === 'authored') {
      (interior.rooms || []).forEach(function (r) {
        if (r.type === 'bathroom') {
          var has = (interior.clearances || []).some(function (c) { return c.room === r.id && c.type === 'turning-circle' && num(c.diameter_m, 0) >= 1.5; });
          if (!has) unres('bathroom-turning-circle', 'Bathroom ' + r.id + ' has no modeled 1.5 m turning circle.');
        }
        if (r.type === 'kitchen') {
          var hasWork = (interior.clearances || []).some(function (c) { return c.room === r.id && c.type === 'work-zone'; });
          if (!hasWork) unres('kitchen-approach', 'Kitchen ' + r.id + ' has no modeled work-zone approach.');
        }
      });
    }
    return { ok: invalid.length === 0, invalid: invalid, unresolved: unresolved, review: review, items: invalid.concat(unresolved, review) };
  }

  function accessibilityEvidence(designInput) {
    var d = Schema.canonicalize(designInput);
    var v = validate(d);
    var interior = d.interior || {};
    var rooms = interior.rooms || [];
    var bathrooms = rooms.filter(function (r) { return r.type === 'bathroom'; });
    var kitchens = rooms.filter(function (r) { return r.type === 'kitchen'; });
    var doors = interior.doors || [];
    var turning = (interior.clearances || []).filter(function (c) { return c.type === 'turning-circle'; });
    var workZones = (interior.clearances || []).filter(function (c) { return c.type === 'work-zone'; });
    var stepFree = !!(d.access && d.access.step_free_entrance);
    var essential = ['living', 'kitchen', 'bathroom', 'sleeping'].every(function (t) { return rooms.some(function (r) { return r.type === t; }); });
    var entrance = num(d.access && d.access.entrance_door_width_m, 0);
    var circulation = Math.max.apply(null, [0].concat(doors.map(function (x) { return x.width_m; }), (interior.circulation || []).map(function (c) { return c.width_m; })));
    var pathOk = !!(d.access && d.access.path_connection && !/not (surveyed|assessed|verified|measured)/i.test(d.access.path_connection) && /(surveyed|assessed|verified|measured)/i.test(d.access.path_connection));
    var bathroomTurning = bathrooms.length > 0 && bathrooms.every(function (r) { return turning.some(function (c) { return c.room === r.id && num(c.diameter_m, 0) >= 1.5 && c.status !== 'failed'; }); });
    var kitchenApproach = kitchens.length > 0 && kitchens.every(function (r) { return workZones.some(function (c) { return c.room === r.id; }); });
    var doorsOk = doors.length > 0 && doors.every(function (x) { return x.width_m >= 0.86; });
    var single = d.levels.length === 1;
    var classification = 'not-assessed';
    if (single && stepFree && essential) {
      classification = (bathroomTurning && kitchenApproach && doorsOk && entrance >= 0.86 && circulation >= 0.9 && pathOk && v.ok) ? 'single-storey-step-free-candidate' : 'potentially-adaptable';
    } else if (!single) {
      classification = stepFree ? 'ground-floor-accessible-living' : 'unresolved-vertical-access';
    }
    return {
      classification: classification,
      stepFree: stepFree,
      singleStorey: single,
      essentialFunctions: essential,
      entranceWidth_m: entrance,
      minDoorWidth_m: doors.length ? Math.min.apply(null, doors.map(function (x) { return x.width_m; })) : null,
      minCirculationWidth_m: circulation || null,
      bathroomTurningCircle: bathroomTurning,
      kitchenApproach: kitchenApproach,
      pathConnection: pathOk,
      turningCircles: turning.length,
      workZones: workZones.length,
      issues: v.items,
      note: 'Automated evidence only. No code compliance, CSA B651 conformity or professional accessibility assessment is claimed.'
    };
  }

  function schedule(designInput) {
    var d = Schema.canonicalize(designInput);
    var rooms = ((d.interior && d.interior.rooms) || []).map(function (r) {
      return { id: r.id, name: r.name, type: r.type, module: r.module, level: r.level, area_m2: round(polygonArea(r.polygon), 2), provenance: r.provenance || 'authored', fixtures: ((d.interior.fixtures || []).filter(function (f) { return f.room === r.id; }).map(function (f) { return f.type; })) };
    });
    return { rooms: rooms, total_area_m2: round(rooms.reduce(function (s, r) { return s + r.area_m2; }, 0), 2) };
  }

  function planSVG(designInput, opts) {
    opts = opts || {};
    var d = Schema.canonicalize(designInput);
    if (!d.interior || !d.interior.rooms || !d.interior.rooms.length) return '';
    var W = 1200, H = 820, pad = 96;
    var polys = d.modules.map(Model.moduleCorners);
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    polys.forEach(function (poly) { poly.forEach(function (p) { minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]); minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); }); });
    var scale = Math.min((W - 2 * pad) / Math.max(1, maxX - minX), (H - 2 * pad - 10) / Math.max(1, maxY - minY));
    var ox = (W - (maxX - minX) * scale) / 2 - minX * scale;
    var oy = (H - (maxY - minY) * scale) / 2 - minY * scale;
    var P = function (p) { return [ox + p[0] * scale, oy + p[1] * scale]; };
    var pre = opts.idPrefix || 'interior-plan';
    var title = d.name + ' · interior floor plan';
    var desc = 'Concept interior floor plan for ' + d.name + '. ' + d.interior.rooms.length + ' rooms, ' + (d.interior.partitions || []).length + ' partitions, ' + (d.interior.doors || []).length + ' doors and ' + (d.interior.fixtures || []).length + ' fixtures. Inferred rooms are hatched. The plan is a conceptual spatial model, not a construction drawing or a verified accessibility assessment.';
    var out = [];
    var typeFill = { sleeping: '#c8d7ea', bathroom: '#b9d9d2', kitchen: '#ead7b3', living: '#d8dfbf', dining: '#e5cfa7', work: '#cdc6de', storage: '#ddd4c2', circulation: '#eee8d9', entry: '#e2d6c3', utility: '#d5d8d2' };
    out.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-labelledby="' + pre + '-t ' + pre + '-d" data-interior-plan="true">');
    out.push('<title id="' + pre + '-t">' + esc(title) + '</title><desc id="' + pre + '-d">' + esc(desc) + '</desc>');
    out.push('<defs><pattern id="' + pre + '-inferred" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#efe9dc"/><path d="M0 8L8 0" stroke="#9a8765" stroke-width="0.8"/></pattern></defs>');
    out.push('<rect width="' + W + '" height="' + H + '" fill="#faf8f2"/>');
    out.push('<text x="30" y="42" font-family="system-ui, sans-serif" font-size="22" font-weight="800" fill="#1d392c">' + esc(title) + '</text>');
    out.push('<text x="30" y="64" font-family="system-ui, sans-serif" font-size="12" fill="#3f5a4c">' + (d.interior.status === 'authored' ? 'Authored interior' : 'Provisional interior inferred from zones') + ' · ' + (d.interior.rooms.length) + ' rooms · conceptual / not for construction</text>');
    d.modules.forEach(function (m) {
      var corners = Model.moduleCorners(m).map(P);
      out.push('<path d="M' + corners.map(function (p) { return n(p[0]) + ' ' + n(p[1]); }).join('L') + 'Z" fill="none" stroke="#253a33" stroke-width="5"/>');
    });
    d.interior.rooms.forEach(function (r) {
      var m = moduleById(d, r.module);
      if (!m) return;
      var world = r.polygon.map(function (p) { return Model.transformModulePoint(m, p); });
      var sp = world.map(P);
      out.push('<path d="M' + sp.map(function (p) { return n(p[0]) + ' ' + n(p[1]); }).join('L') + 'Z" fill="' + (r.provenance === 'inferred-from-zone' ? 'url(#' + pre + '-inferred)' : (typeFill[r.type] || '#eee8d9')) + '" stroke="#6f7b63" stroke-width="1.6"/>');
      var c = P([world.reduce(function (t, p) { return t + p[0]; }, 0) / world.length, world.reduce(function (t, p) { return t + p[1]; }, 0) / world.length]);
      out.push('<text x="' + n(c[0]) + '" y="' + n(c[1] - 3) + '" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#1d392c" stroke="#faf8f2" stroke-width="2.4" paint-order="stroke">' + esc(r.name) + '</text>');
      out.push('<text x="' + n(c[0]) + '" y="' + n(c[1] + 12) + '" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9" fill="#3f5a4c" stroke="#faf8f2" stroke-width="2" paint-order="stroke">' + n(polygonArea(r.polygon)) + ' m² · ' + esc(r.type) + '</text>');
      if (r.provenance === 'inferred-from-zone') out.push('<text x="' + n(c[0]) + '" y="' + n(c[1] + 24) + '" text-anchor="middle" font-family="system-ui, sans-serif" font-size="8" fill="#8f5a21">inferred band</text>');
    });
    (d.interior.partitions || []).forEach(function (p) {
      var m = moduleById(d, p.module);
      if (!m) return;
      var a = P(Model.transformModulePoint(m, p.from)), b = P(Model.transformModulePoint(m, p.to));
      out.push('<line x1="' + n(a[0]) + '" y1="' + n(a[1]) + '" x2="' + n(b[0]) + '" y2="' + n(b[1]) + '" stroke="#253a33" stroke-width="' + n(Math.max(2, (p.thickness_m || 0.1) * scale)) + '"/>');
    });
    (d.interior.doors || []).forEach(function (door) {
      var p = partitionById(d, door.partition);
      var m = p && moduleById(d, p.module);
      if (!m) return;
      var c = doorCenter(p, door);
      var a = P(Model.transformModulePoint(m, c));
      var pa = P(Model.transformModulePoint(m, p.from));
      var pb = P(Model.transformModulePoint(m, p.to));
      var dx = pb[0] - pa[0], dy = pb[1] - pa[1], len = Math.hypot(dx, dy) || 1;
      var ux = dx / len, uy = dy / len;
      var half = Math.max(5, door.width_m * scale / 2);
      out.push('<line x1="' + n(a[0] - ux * half) + '" y1="' + n(a[1] - uy * half) + '" x2="' + n(a[0] + ux * half) + '" y2="' + n(a[1] + uy * half) + '" stroke="#faf8f2" stroke-width="' + n(Math.max(3, (p.thickness_m || 0.1) * scale + 2)) + '"/>');
      out.push('<circle cx="' + n(a[0]) + '" cy="' + n(a[1]) + '" r="3.2" fill="#faf8f2" stroke="#245a73" stroke-width="1.4"/>');
      out.push('<text x="' + n(a[0] - uy * 10) + '" y="' + n(a[1] + ux * 10 + 3) + '" text-anchor="middle" font-family="system-ui, sans-serif" font-size="7" fill="#245a73" stroke="#faf8f2" stroke-width="1.8" paint-order="stroke">' + esc(door.id) + '</text>');
    });
    (d.interior.fixtures || []).forEach(function (f) {
      var r = roomById(d, f.room);
      var m = r && moduleById(d, r.module);
      if (!m) return;
      var corners = rectCorners(f).map(function (p) { return P(Model.transformModulePoint(m, p)); });
      out.push('<path d="M' + corners.map(function (p) { return n(p[0]) + ' ' + n(p[1]); }).join('L') + 'Z" fill="#8a9a83" fill-opacity="0.55" stroke="#3f5a4c" stroke-width="1"/>');
      var c = P(Model.transformModulePoint(m, f.position_m));
      out.push('<text x="' + n(c[0]) + '" y="' + n(c[1] + 3) + '" text-anchor="middle" font-family="system-ui, sans-serif" font-size="7" fill="#1d392c">' + esc(f.type) + '</text>');
    });
    (d.interior.clearances || []).filter(function (c) { return c.type === 'turning-circle'; }).forEach(function (c) {
      var r = roomById(d, c.room);
      var m = r && moduleById(d, r.module);
      if (!m) return;
      var cc = P(Model.transformModulePoint(m, c.center_m));
      out.push('<circle cx="' + n(cc[0]) + '" cy="' + n(cc[1]) + '" r="' + n(c.diameter_m * scale / 2) + '" fill="none" stroke="#8f5a21" stroke-width="1.6" stroke-dasharray="7 4"/>');
    });
    out.push('<g font-family="system-ui, sans-serif" font-size="10" fill="#3f5a4c"><rect x="30" y="' + (H - 48) + '" width="28" height="12" fill="url(#' + pre + '-inferred)" stroke="#9a8765"/><text x="66" y="' + (H - 38) + '">inferred room band · not an authored partition</text><circle cx="360" cy="' + (H - 42) + '" r="7" fill="none" stroke="#8f5a21" stroke-dasharray="4 3"/><text x="374" y="' + (H - 38) + '">turning circle · unverified</text></g>');
    out.push('<text x="30" y="' + (H - 14) + '" font-family="system-ui, sans-serif" font-size="9" fill="#5e6a58">Concept interior plan · room polygons are module-local · not a construction drawing or accessibility certification · CC BY-SA 4.0</text>');
    out.push('</svg>');
    return out.join('');
  }

  return {
    SCHEMA: SCHEMA, ROOM_TYPES: ROOM_TYPES, FIXTURE_TYPES: FIXTURE_TYPES, CLEARANCE_TYPES: CLEARANCE_TYPES,
    LINING_M: LINING_M, clearEnvelope: clearEnvelope, pointInPoly: pointInPoly, polygonArea: polygonArea,
    rectPolygon: rectPolygon, rectCorners: rectCorners, doorCenter: doorCenter,
    fromZones: fromZones, migrate: migrate, validate: validate, accessibilityEvidence: accessibilityEvidence, schedule: schedule, planSVG: planSVG,
    roomById: roomById, moduleById: moduleById, partitionById: partitionById
  };
});
