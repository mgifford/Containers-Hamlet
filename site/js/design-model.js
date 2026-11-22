/*
 * Containers Hamlet Design Lab geometry, assessment and SVG renderer.
 *
 * All three views (plan, exterior, roof-off cutaway) derive from the same
 * multi-container design object. No WebGL and no dependencies.
 *
 * Code licence: AGPL-3.0-or-later.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./design-schema.js'));
  else root.DesignModel = factory(root.DesignSchema);
})(typeof self !== 'undefined' ? self : this, function (Schema) {
  'use strict';

  var DEG = Math.PI / 180;
  var E = 0.0001;

  function num(v, d) { return typeof v === 'number' && Number.isFinite(v) ? v : d; }
  function round(v, d) { var f = Math.pow(10, d == null ? 2 : d); return Math.round(v * f) / f; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function n(v) { return round(v, 1); }

  function rotatePoint(p, deg) {
    var a = deg * DEG, c = Math.cos(a), s = Math.sin(a);
    return [p[0] * c - p[1] * s, p[0] * s + p[1] * c];
  }
  function worldFace(m, face) {
    var v = { north: [0, -1], south: [0, 1], east: [1, 0], west: [-1, 0] }[face] || [0, 1];
    var a = (m.rotation_deg || 0) * Math.PI / 180;
    var x = v[0] * Math.cos(a) - v[1] * Math.sin(a);
    var y = v[0] * Math.sin(a) + v[1] * Math.cos(a);
    if (Math.abs(x) >= Math.abs(y)) return x >= 0 ? 'east' : 'west';
    return y >= 0 ? 'south' : 'north';
  }

  function transform(module, local) {
    var r = rotatePoint(local, module.rotation_deg || 0);
    return [module.position_m[0] + r[0], module.position_m[1] + r[1]];
  }
  function moduleCorners(m) {
    var L = m.nominal.length_m, W = m.nominal.width_m;
    return [[-L / 2, -W / 2], [L / 2, -W / 2], [L / 2, W / 2], [-L / 2, W / 2]].map(function (p) { return transform(m, p); });
  }
  function rectCorners(cx, cy, length, width, deg) {
    var p = [cx, cy];
    return [[-length / 2, -width / 2], [length / 2, -width / 2], [length / 2, width / 2], [-length / 2, width / 2]].map(function (q) {
      var r = rotatePoint(q, deg);
      return [p[0] + r[0], p[1] + r[1]];
    });
  }
  function outdoorRect(module, face, start, length, depth, offset) {
    var L = module.nominal.length_m, W = module.nominal.width_m;
    var o = offset || 0;
    var x0, y0, x1, y1;
    if (face === 'south') { x0 = -L / 2 + start; x1 = x0 + length; y0 = W / 2 + o; y1 = y0 + depth; }
    else if (face === 'north') { x0 = -L / 2 + start; x1 = x0 + length; y1 = -W / 2 - o; y0 = y1 - depth; }
    else if (face === 'east') { y0 = -W / 2 + start; y1 = y0 + length; x0 = L / 2 + o; x1 = x0 + depth; }
    else { y0 = -W / 2 + start; y1 = y0 + length; x1 = -L / 2 - o; x0 = x1 - depth; }
    return [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(function (p) { return transform(module, p); });
  }
  function porchCorners(m, p) { return outdoorRect(m, p.face, p.start_m, p.length_m, p.depth_m, 0); }
  function deckCorners(m, p, d) { return outdoorRect(m, p.face, p.start_m, p.length_m, d.projection_m, p.depth_m); }
  function connectionCorners(c) { return rectCorners(c.position_m[0], c.position_m[1], c.length_m, c.width_m, c.rotation_deg || 0); }
  function trellisCorners(m, t) { return outdoorRect(m, t.face, t.start_m, t.length_m, 0.12, t.offset_m); }
  function vegetationDepth(v) { return v.type === 'edible-wall' ? 0.4 : v.type === 'privacy-screen' ? 0.28 : 0.18; }
  function vegetationCorners(m, v) { return outdoorRect(m, v.face, v.start_m, v.length_m, vegetationDepth(v), v.offset_m); }

  function moduleById(d, id) { return (d.modules || []).filter(function (m) { return m.id === id; })[0]; }
  function porchById(d, id) { return (d.porches || []).filter(function (p) { return p.id === id; })[0]; }

  /* ---------------- explicit vertical geometry ---------------- */

  function moduleBase(m) { return num(m.elevation_m, 0); }
  function moduleTop(m) { return moduleBase(m) + num(m.nominal && m.nominal.height_m, 2.896); }
  function envelopeThickness(m) { return num(m.insulation && m.insulation.thickness_mm, 150) / 1000 + 0.03; }
  function moduleBox3D(m) {
    var t = envelopeThickness(m);
    var L = m.nominal.length_m + 2 * t, W = m.nominal.width_m + 2 * t;
    var corners = [[-L / 2, -W / 2], [L / 2, -W / 2], [L / 2, W / 2], [-L / 2, W / 2]].map(function (p) { return transform(m, p); });
    var xs = corners.map(function (p) { return p[0]; }), ys = corners.map(function (p) { return p[1]; });
    return {
      id: m.id, storey: num(m.storey, 0),
      minX: Math.min.apply(null, xs), maxX: Math.max.apply(null, xs),
      minY: Math.min.apply(null, ys), maxY: Math.max.apply(null, ys),
      minZ: moduleBase(m), maxZ: moduleTop(m),
      corners: corners
    };
  }
  function boxOverlap3D(a, b, tolerance) {
    var t = tolerance == null ? 0.002 : tolerance;
    var ov = function (lo1, hi1, lo2, hi2) { return lo1 < hi2 - t && lo2 < hi1 - t; };
    return ov(a.minX, a.maxX, b.minX, b.maxX) && ov(a.minY, a.maxY, b.minY, b.maxY) && ov(a.minZ, a.maxZ, b.minZ, b.maxZ);
  }
  function verticalGap(a, b) {
    if (a.maxZ <= b.minZ) return b.minZ - a.maxZ;
    if (b.maxZ <= a.minZ) return a.minZ - b.maxZ;
    return 0;
  }
  function planOverlapArea(a, b) {
    return overlapArea(moduleCorners(a), moduleCorners(b));
  }
  function moduleArea(m) { return m.nominal.length_m * m.nominal.width_m; }
  function unionArea(polys) {
    if (!polys.length) return 0;
    var total = 0;
    for (var mask = 1; mask < (1 << polys.length); mask++) {
      var subset = [];
      for (var i = 0; i < polys.length; i++) if (mask & (1 << i)) subset.push(polys[i]);
      var inter = subset[0];
      for (var j = 1; j < subset.length && inter.length; j++) inter = clipPolygon(inter, subset[j]);
      var a = subset.length > 1 && inter.length >= 3 ? polygonArea(inter) : subset.length === 1 ? polygonArea(subset[0]) : 0;
      total += (subset.length % 2 ? 1 : -1) * a;
    }
    return total;
  }
  function footprintArea(d) {
    var polys = d.modules.map(moduleCorners).concat(d.connections.filter(function (c) { return c.glazed; }).map(connectionCorners));
    return unionArea(polys);
  }
  function floorAreaByStorey(d) {
    var out = {};
    d.modules.forEach(function (m) { var s = num(m.storey, 0); out[s] = (out[s] || 0) + moduleArea(m); });
    d.connections.filter(function (c) { return c.glazed; }).forEach(function (c) { out[0] = (out[0] || 0) + c.length_m * c.width_m; });
    return out;
  }

  function supportAnalysis(input) {
    var d = Schema.canonicalize(input);
    var rows = [];
    d.modules.forEach(function (m) {
      var box = moduleBox3D(m);
      var lower = d.modules.filter(function (o) { return o.id !== m.id && num(o.storey, 0) < num(m.storey, 0); });
      var contacts = lower.map(function (o) {
        var gap = moduleBase(m) - moduleTop(o);
        var area = planOverlapArea(m, o);
        return { module: o.id, gap_m: round(gap, 3), overlap_m2: round(area, 2), supports: gap >= -0.01 && gap <= 0.6 && area > 0.01 };
      }).filter(function (c) { return c.overlap_m2 > 0.01; });
      var supportedArea = contacts.filter(function (c) { return c.supports; }).reduce(function (t, c) { return t + c.overlap_m2; }, 0);
      var footprint = moduleArea(m);
      var declared = (m.support && m.support.references) || [];
      var declaredMissing = declared.filter(function (id) { return !contacts.some(function (c) { return c.module === id && c.supports; }); });
      var gapWarnings = contacts.filter(function (c) { return c.overlap_m2 > 0.01 && c.gap_m > 0.6; });
      rows.push({
        module: m.id, storey: num(m.storey, 0), elevation_m: moduleBase(m),
        supported_area_m2: round(supportedArea, 2), footprint_m2: round(footprint, 2),
        support_fraction: footprint ? round(supportedArea / footprint, 3) : 0,
        contacts: contacts, declared: declared, declared_missing: declaredMissing,
        vertical_gap_m: gapWarnings.length ? gapWarnings[0].gap_m : null,
        upper: num(m.storey, 0) > 0
      });
    });
    return { rows: rows, stacked: rows.some(function (r) { return r.upper; }) };
  }

  function metrics(input) {
    var d = Schema.canonicalize(input);
    var rg = roofGeometry(d);
    var byStorey = floorAreaByStorey(d);
    var gross = d.modules.reduce(function (t, m) { return t + moduleArea(m); }, 0) + d.connections.filter(function (c) { return c.glazed; }).reduce(function (t, c) { return t + c.length_m * c.width_m; }, 0);
    var envelope = d.modules.reduce(function (t, m) {
      var t2 = envelopeThickness(m);
      return t + 2 * (m.nominal.length_m + m.nominal.width_m + 4 * t2) * m.nominal.height_m;
    }, 0);
    var windows = d.modules.reduce(function (t, m) { return t + (m.openings || []).filter(function (o) { return o.type === 'window' || o.type === 'sliding-door'; }).reduce(function (u, o) { return u + o.width_m * o.height_m; }, 0); }, 0);
    return {
      moduleCount: d.modules.length,
      storeyCount: d.levels.length,
      maxStorey: d.levels.length ? Math.max.apply(null, d.levels.map(function (l) { return l.storey; })) : 0,
      levels: d.levels,
      grossFloorArea_m2: round(gross, 2),
      floorAreaByStorey: Object.keys(byStorey).sort().map(function (k) { return { storey: Number(k), area_m2: round(byStorey[k], 2) }; }),
      groundCoverage_m2: round(footprintArea(d), 2),
      buildingFootprint_m2: round(footprintArea(d), 2),
      upperFloorArea_m2: round(byStorey[1] || 0, 2),
      envelopeArea_m2: round(envelope, 1),
      roofArea_m2: round(rg.roofArea_m2, 1),
      roofType: rg.type,
      roofPitch_deg: rg.pitch_deg,
      roofTop_m: round(rg.top_m, 2),
      buildingHeight_m: round(rg.top_m, 2),
      windowArea_m2: round(windows, 1),
      solarArea_m2: round(rg.solarArea_m2, 1),
      structuralReview: structuralReview(d).model_status,
      accessibility: accessibilityProfile(d).classification
    };
  }

  function roofGeometry(input) {
    var d = Schema.canonicalize(input);
    var rf = d.roof_form;
    var polys = d.modules.map(moduleCorners).concat(d.connections.filter(function (c) { return c.glazed; }).map(connectionCorners));
    if (!polys.length) return { type: rf.type, top_m: 0, pitch_deg: rf.pitch_deg, roofArea_m2: 0, solarArea_m2: 0, minX: 0, maxX: 0, minY: 0, maxY: 0 };
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    polys.forEach(function (poly) { poly.forEach(function (p) { minX = Math.min(minX, p[0]); minY = Math.min(minY, p[1]); maxX = Math.max(maxX, p[0]); maxY = Math.max(maxY, p[1]); }); });
    var oh = num(rf.overhang_m, 0.6);
    minX -= oh; minY -= oh; maxX += oh; maxY += oh;
    var base = d.modules.reduce(function (t, m) { return Math.max(t, moduleTop(m)); }, 0);
    var width = maxX - minX, depth = maxY - minY;
    var pitch = Math.max(0, Math.min(45, num(rf.pitch_deg, 0)));
    var rise = Math.tan(pitch * DEG);
    var top = base;
    if (rf.type === 'gable') top = base + (depth / 2) * rise;
    else if (rf.type === 'shed' || rf.type === 'solar-ready') top = base + depth * rise;
    else if (rf.type === 'butterfly') top = base + (depth / 2) * rise;
    else if (rf.type === 'flat') top = base + 0.3;
    else if (rf.type === 'canopy') top = base + 0.25;
    else if (rf.type === 'green') top = base + 0.4;
    var planArea = Math.max(0, width * depth);
    var roofArea = rf.type === 'flat' || rf.type === 'canopy' || rf.type === 'green' ? planArea : planArea / Math.max(0.3, Math.cos(pitch * DEG));
    var southRun = rf.type === 'gable' ? depth / 2 : depth;
    return {
      type: rf.type, pitch_deg: pitch, overhang_m: oh,
      minX: minX, minY: minY, maxX: maxX, maxY: maxY, width: width, depth: depth,
      base_m: base, top_m: top, ridge_m: top, eave_m: base,
      roofArea_m2: roofArea, solarArea_m2: rf.type === 'flat' || rf.type === 'canopy' ? planArea * 0.55 : Math.max(0, southRun * width),
      green: !!rf.green_roof || rf.type === 'green',
      drainage: rf.drainage, snow: rf.snow, wind: rf.wind, maintenance: rf.maintenance
    };
  }

  function structuralReview(input) {
    var d = Schema.canonicalize(input);
    var sup = supportAnalysis(d);
    var stacked = sup.stacked;
    var multi = d.modules.length > 1;
    var concerns = [
      { id: 'corner-castings', label: 'Corner castings and corner posts', triggered: true, note: 'Openings, lifting points and stacked loads concentrate force at corner castings and posts. Capacity and condition need review.' },
      { id: 'vertical-load-transfer', label: 'Vertical load transfer', triggered: stacked, note: stacked ? 'Stacked modules need an explicit, continuous load path through posts, beams or an engineered transfer structure.' : 'Single-storey loads still need a continuous path to the foundation.' },
      { id: 'container-orientation', label: 'Container orientation and span', triggered: true, note: 'Container side walls are not designed as beams. Orientation, span and opening locations change the structural behaviour.' },
      { id: 'sidewall-openings', label: 'Openings through sidewalls', triggered: (d.modules || []).some(function (m) { return (m.openings || []).some(function (o) { return o.width_m >= 2.0 || o.type === 'sliding-door'; }) || (m.structure && m.structure.wall_removal !== 'none'); }), note: 'Large openings and removed walls need engineered framing, headers and corner reinforcement.' },
      { id: 'removed-walls', label: 'Removed structural walls', triggered: (d.modules || []).some(function (m) { return m.structure && m.structure.wall_removal !== 'none'; }), note: 'A removed sidewall changes the load path and may require a transfer frame or additional columns.' },
      { id: 'cantilevers', label: 'Cantilevers and unsupported overhangs', triggered: sup.rows.some(function (r) { return r.upper && r.support_fraction < 0.999; }), note: sup.rows.filter(function (r) { return r.upper && r.support_fraction < 0.999; }).map(function (r) { return r.module + ' is supported over ' + Math.round(r.support_fraction * 100) + '% of its footprint; ' + n(Math.max(0, r.footprint_m2 - r.supported_area_m2)) + ' m² has no supporting module below.'; }).join(' ') || 'No upper module overhang is recorded.' },
      { id: 'lateral-stability', label: 'Lateral stability and racking', triggered: stacked || multi, note: lateralNote(stacked, multi) },
      { id: 'wind-loading', label: 'Wind loading and uplift', triggered: stacked || metricsHeight(d) > 4, note: 'Exposed sites, roof overhangs, cladding and stacked modules need wind uplift and lateral load review.' },
      { id: 'snow-loading', label: 'Snow loading and drift', triggered: true, note: 'Roof geometry, valleys, parapets and adjacent taller volumes change snow accumulation and drift.' },
      { id: 'foundation-reactions', label: 'Foundation reactions', triggered: stacked || multi || !!(d.roof_form && d.roof_form.green_roof), note: 'Stacking, roof loads and green roofs change point loads, uplift and frost-depth requirements.' },
      { id: 'module-connections', label: 'Connections between modules', triggered: multi, note: 'Inter-module connections need designed shear, tension and bearing capacity, not just gravity bearing.' },
      { id: 'crane-access', label: 'Crane access and lifting', triggered: multi || d.modules.some(function (m) { return m.type === '40ft'; }), note: 'Lifting points, crane reach, ground bearing, matting and overhead clearance need a lift plan.' },
      { id: 'transport', label: 'Transport limitations', triggered: d.modules.some(function (m) { return m.type === '40ft' || m.nominal.width_m + 2 * envelopeThickness(m) > 3.0; }), note: 'Oversize width, route surveys, permits and escort requirements need checking.' },
      { id: 'fire-separation', label: 'Fire separation and egress', triggered: stacked || multi, note: 'Inter-storey separation, protected egress, cladding, cavity barriers and fire service access need review.' },
      { id: 'corrosion', label: 'Corrosion protection', triggered: true, note: 'Coastal, de-icing, ground-contact and concealed steel surfaces need a corrosion strategy and inspection plan.' },
      { id: 'thermal-bridges', label: 'Thermal bridges', triggered: true, note: 'Steel posts, floor edges, connections and penetrations create thermal bridges and condensation risk.' },
      { id: 'moisture-condensation', label: 'Moisture and condensation', triggered: true, note: 'Interstitial condensation, trapped water, roof drainage and floor build-ups need a building-envelope review.' }
    ];
    concerns.forEach(function (c) {
      var override = d.review && d.review.concerns && d.review.concerns[c.id];
      c.status = override && Schema.REVIEW_STATUSES.indexOf(override.status) >= 0 ? override.status : c.triggered ? 'requires-review' : 'not-assessed';
      c.notes = override && override.note ? override.note : c.note;
      c.assessment = override && override.assessment ? override.assessment : null;
    });
    var rank = { 'not-assessed': 0, 'requires-review': 1, 'conceptually-resolved': 2, 'professionally-verified': 3 };
    var model_status = concerns.reduce(function (s, c) { return rank[c.status] > rank[s] ? c.status : s; }, 'not-assessed');
    return { concerns: concerns, model_status: model_status, summary: concerns.filter(function (c) { return c.status === 'requires-review'; }).length + ' of ' + concerns.length + ' concerns need review.' };
  }
  function lateralNote(stacked, multi) { return stacked ? 'Stacked modules need a designed lateral system; container corner posts alone are not a lateral-force strategy.' : multi ? 'Connected single-storey modules need a designed lateral system across the links.' : 'A single module still needs its container frame, foundation and cladding to act as a designed lateral system.'; }
  function metricsHeight(d) { return d.modules.reduce(function (t, m) { return Math.max(t, moduleTop(m)); }, 0); }

  function accessibilityProfile(input) {
    var d = Schema.canonicalize(input);
    var a = d.access;
    var storeyCount = d.levels.length;
    var doors = [];
    d.modules.forEach(function (m) { m.openings.forEach(function (o) { if (o.type === 'door' || o.type === 'sliding-door') doors.push({ module: m.id, opening: o }); }); });
    var entrance = doors.filter(function (x) { return x.opening.type === 'door'; })[0] || doors[0] || null;
    var doorWidth = entrance ? entrance.opening.width_m : a.entrance_door_width_m;
    var issues = [], notes = [];
    if (!a.step_free_entrance) issues.push({ code: 'step-free-entrance', message: 'A step-free entrance is not recorded. Verify the path, threshold, door width and landing.' });
    if (doorWidth < 0.86) issues.push({ code: 'entrance-width', message: 'The entrance door is ' + n(doorWidth) + ' m wide; the project target is at least 0.86 m clear.' });
    if (a.entrance_threshold_m > 0.02) issues.push({ code: 'threshold', message: 'The entrance threshold is ' + n(a.entrance_threshold_m) + ' m; a flush or ramped threshold needs detailing.' });
    if (a.circulation_width_m < 0.9) issues.push({ code: 'circulation', message: 'The recorded circulation width is ' + n(a.circulation_width_m) + ' m; verify a 0.9 m clear route and turning spaces.' });
    if (storeyCount > 1) {
      if (!a.ground_floor_essential_functions) issues.push({ code: 'ground-functions', message: 'Ground-floor essential living functions are not recorded. Without them the home cannot offer accessible living.' });
      if (!a.ground_floor_bedroom) issues.push({ code: 'ground-bedroom', message: 'No ground-floor bedroom is recorded. Upper-floor sleeping depends on stairs.' });
      if (!a.stair || !a.stair.present || a.stair.type === 'none') issues.push({ code: 'vertical-access', message: 'An upper storey is present but no stair is recorded. Vertical access is unresolved.' });
      else if (a.stair.width_m < 0.86) issues.push({ code: 'stair-width', message: 'The stair is ' + n(a.stair.width_m) + ' m wide; verify clear width, handrails, landings and guarding.' });
      if (!a.stair || !a.stair.lift_reserve) issues.push({ code: 'lift-reserve', message: 'No space or structure is reserved for a future lift. Do not assume a lift can be added later.' });
      notes.push('A two-storey home is not described as fully accessible because its entrance is step-free.');
    }
    if (a.adaptable_bathroom) notes.push('Bathroom adaptability is recorded as an intent; verify the 1.5 m turning circle, transfer space, grab-bar blocking and door clearance against CSA B651.'); else issues.push({ code: 'bathroom-adaptable', message: 'Bathroom adaptability is not recorded. Verify turning, transfer, grab-bar and door clearances.' });
    if (a.adaptable_kitchen) notes.push('Kitchen adaptability is recorded as an intent; verify knee space, work-surface heights and clear approach.'); else issues.push({ code: 'kitchen-adaptable', message: 'Kitchen adaptability is not recorded. Verify clear approach, knee space and work-surface heights.' });
    if (!a.path_connection || /not assessed/i.test(a.path_connection)) issues.push({ code: 'path-connection', message: 'The connection to the shared hamlet path is not assessed.' });
    var classification = a.classification;
    if (classification === 'not-assessed' || !classification) {
      if (!a.step_free_entrance) classification = 'not-assessed';
      else if (storeyCount === 1) classification = 'fully-accessible-single-storey';
      else if (a.ground_floor_essential_functions && a.ground_floor_bedroom) classification = 'ground-floor-accessible-living';
      else if (a.stair && a.stair.present) classification = 'potentially-adaptable';
      else classification = 'unresolved-vertical-access';
    }
    if (storeyCount > 1 && classification === 'fully-accessible-single-storey') classification = 'unresolved-vertical-access';
    var labels = {
      'fully-accessible-single-storey': 'Single-storey, step-free concept. This is a design target, not a verified fully accessible dwelling.',
      'ground-floor-accessible-living': 'Ground-floor accessible living arrangement; the upper floor is reached by stairs and is not accessible.',
      'potentially-adaptable': 'Potentially adaptable, but vertical access and some essential functions are not resolved.',
      'unresolved-vertical-access': 'Unresolved vertical-access barrier. Do not describe this home as accessible.',
      'not-assessed': 'Accessibility not assessed.'
    };
    return {
      classification: classification,
      label: labels[classification],
      storeyCount: storeyCount,
      step_free_entrance: !!a.step_free_entrance,
      ground_floor_essential_functions: !!a.ground_floor_essential_functions,
      ground_floor_bedroom: !!a.ground_floor_bedroom,
      entrance_door_width_m: round(doorWidth, 2),
      entrance_threshold_m: a.entrance_threshold_m,
      circulation_width_m: a.circulation_width_m,
      stair: a.stair,
      lift_reserve: !!(a.stair && a.stair.lift_reserve),
      vertical_access_strategy: a.vertical_access_strategy,
      path_connection: a.path_connection,
      issues: issues,
      notes: notes,
      standards: a.standards,
      assessment: a.assessment,
      note: 'Qualitative accessibility review against project targets informed by CSA B651 and the Ontario Building Code. No compliance, licence or professional accessibility assessment is claimed.'
    };
  }

  /* A derived, non-authoritative single-storey translation of a two-storey
     home. It keeps the same modules and openings, moves the upper modules to
     the ground beside the stack and removes stair-dependent access claims.
     It is a comparison sketch, not a redesign. */
  function singleStoreyAlternative(input) {
    var d = Schema.canonicalize(input);
    if (d.levels.length < 2) return null;
    var alt = JSON.parse(JSON.stringify(d));
    var ground = alt.modules.filter(function (m) { return num(m.storey, 0) === 0; });
    var maxY = ground.reduce(function (t, m) { return Math.max(t, moduleCorners(m).reduce(function (u, p) { return Math.max(u, p[1]); }, -Infinity)); }, 0);
    var cursor = maxY + 1.5;
    alt.modules.forEach(function (m) {
      if (num(m.storey, 0) === 0) return;
      m.storey = 0;
      m.elevation_m = alt.foundation.clearance_m;
      var probe = JSON.parse(JSON.stringify(m));
      probe.position_m = [0, 0];
      var ys = moduleCorners(probe).map(function (p) { return p[1]; });
      var halfY = Math.max.apply(null, ys.map(Math.abs));
      m.position_m = [m.position_m[0], cursor + halfY];
      cursor += halfY * 2 + 1.5;
      m.support = { type: 'ground', references: [], verified: false, note: 'Derived single-storey alternative; support is ground-bearing intent only.' };
      m.structure = Object.assign({}, m.structure, { cantilever_m: 0, notes: 'Derived single-storey alternative; the original stacking structure is removed.' });
    });
    var ids = alt.modules.map(function (m) { return m.id; });
    alt.porches = alt.porches.filter(function (p) {
      if (ids.indexOf(p.module) < 0) return false;
      var m = alt.modules.filter(function (x) { return x.id === p.module; })[0];
      if (!m) return false;
      var poly = porchCorners(m, p);
      return !alt.modules.some(function (other) { return other.id !== m.id && overlapArea(poly, moduleCorners(other)) > 0.1; });
    });
    var porchIds = alt.porches.map(function (p) { return p.id; });
    alt.decks = alt.decks.filter(function (dk) { return porchIds.indexOf(dk.porch) >= 0; });
    alt.access = Schema.defaultAccess(1);
    alt.access.step_free_entrance = d.access.step_free_entrance;
    alt.access.ground_floor_essential_functions = true;
    alt.access.ground_floor_bedroom = true;
    alt.access.ground_floor_bathroom = true;
    alt.access.entrance_door_width_m = d.access.entrance_door_width_m;
    alt.access.entrance_threshold_m = d.access.entrance_threshold_m;
    alt.access.circulation_width_m = d.access.circulation_width_m;
    alt.access.path_connection = d.access.path_connection;
    alt.access.vertical_access_strategy = 'Derived single-storey alternative; no internal stair.';
    alt.access.classification = d.access.step_free_entrance ? 'fully-accessible-single-storey' : 'not-assessed';
    alt.access.stair = { present: false, type: 'none', module: '', location: 'not applicable', width_m: 0, run_m: 0, rise_m: 0, landing: false, lift_reserve: false, note: 'Removed in the single-storey translation.' };
    alt.id = d.id + '-single-storey-alternative';
    alt.name = d.name + ' — single-storey translation';
    alt.role = 'derived-alternative';
    alt.architecture = Object.assign({}, d.architecture, { intent: 'Derived single-storey translation for floor-area and access comparison. Not a redesign and not professionally reviewed.' });
    alt.provenance = Object.assign({}, d.provenance, { derived_from: d.id, method: 'Upper modules translated to the ground beside the stack; stair and support intent removed. Geometry-only comparison, not a design proposal.', verification: 'None.' });
    return Schema.canonicalize(alt);
  }

  function architectureFeatures(input) {
    var d = Schema.canonicalize(input);
    var storeys = d.levels.length;
    var upper = d.modules.filter(function (m) { return num(m.storey, 0) > 0; });
    var arrangement;
    if (d.modules.length === 1) arrangement = 'single';
    else if (upper.length) {
      var cross = upper.some(function (u) { return d.modules.some(function (g) { return num(g.storey, 0) < num(u.storey, 0) && Math.abs(((u.rotation_deg || 0) - (g.rotation_deg || 0)) % 180) > 45; }); });
      var frac = upper.length ? supportAnalysis(d).rows.filter(function (r) { return r.upper; }).reduce(function (t, r) { return Math.max(t, r.support_fraction); }, 0) : 1;
      arrangement = cross ? 'perpendicular-stack' : frac >= 0.85 ? 'aligned-stack' : 'offset-stack';
    } else if (d.modules.length === 3) arrangement = 'courtyard-or-linked';
    else {
      var rot = Math.abs(((d.modules[0].rotation_deg || 0) - (d.modules[1].rotation_deg || 0)) % 180);
      arrangement = rot > 45 ? 'l-shape' : 'parallel-pair';
    }
    var footprint = metrics(d).groundCoverage_m2;
    var b = bounds(d);
    var ratio = b.height ? b.width / b.height : 1;
    var footprintType = arrangement === 'courtyard-or-linked' ? 'courtyard' : arrangement === 'l-shape' ? 'l-shaped' : arrangement === 'perpendicular-stack' ? 'cross' : ratio > 3 ? 'linear' : ratio < 1.4 ? 'compact' : 'rectangular';
    var roof = d.roof_form.type;
    var entrance = 'south';
    var door = null;
    d.modules.forEach(function (m) { (m.openings || []).forEach(function (o) { if (!door && (o.type === 'door' || o.type === 'sliding-door')) door = { m: m, o: o }; }); });
    if (door) entrance = worldFace(door.m, door.o.face);
    var circulation = storeys > 1 ? (d.access.stair && d.access.stair.present ? 'internal-stair' : 'unresolved-vertical-access') : 'single-level';
    return {
      id: d.id, name: d.name,
      storeys: storeys,
      arrangement: arrangement,
      footprint_type: footprintType,
      roof_type: roof,
      entrance_orientation: entrance,
      circulation_type: circulation,
      proportion: round(b.height ? b.width / b.height : 0, 2),
      gross_floor_area_m2: metrics(d).grossFloorArea_m2,
      ground_coverage_m2: footprint,
      building_height_m: metrics(d).buildingHeight_m
    };
  }

  var PRIMARY_DIVERSITY_FEATURES = ['storeys', 'arrangement', 'footprint_type', 'roof_type', 'entrance_orientation', 'circulation_type'];
  function architecturalSimilarity(a, b) {
    var fa = architectureFeatures(a), fb = architectureFeatures(b);
    var known = PRIMARY_DIVERSITY_FEATURES.filter(function (k) { return fa[k] != null && fb[k] != null; });
    var matching = known.filter(function (k) { return String(fa[k]) === String(fb[k]); });
    var proportionMatch = Math.abs((fa.proportion || 0) - (fb.proportion || 0)) <= 0.35;
    var score = known.length ? (matching.length + (proportionMatch ? 1 : 0)) / (known.length + 1) : null;
    return { score: score == null ? null : round(score, 3), comparable: known.length > 0, matchingFeatures: matching, proportionMatch: proportionMatch, features: [fa, fb] };
  }
  function findSimilarHomes(homes, threshold) {
    var t = threshold == null ? 0.8 : threshold;
    var out = [];
    for (var i = 0; i < homes.length; i++) {
      for (var j = i + 1; j < homes.length; j++) {
        var r = architecturalSimilarity(homes[i], homes[j]);
        if (r.comparable && r.score >= t) out.push({ homes: [homes[i].id, homes[j].id], names: [homes[i].name, homes[j].name], score: r.score, matchingFeatures: r.matchingFeatures, proportionMatch: r.proportionMatch });
      }
    }
    return out;
  }

  function sustainabilityProfile(input) {
    var d = Schema.canonicalize(input);
    var m = metrics(d);
    var t = thermalProfile(d);
    var blocks = d.modules.map(function (mod) {
      var width = mod.nominal.width_m + 2 * envelopeThickness(mod);
      return { id: mod.id, type: mod.type, length_m: mod.nominal.length_m, width_m: round(width, 2), height_m: mod.nominal.height_m, oversize_width: width > 3.0, oversize_length: mod.nominal.length_m > 13.6 };
    });
    var strengths = [], tradeoffs = [];
    if (d.material_intent.reclaimed_containers) strengths.push('Reused containers are the stated module source; inspection, coatings, prior cargo and floor treatment still need evidence.');
    if (d.thermal.rainscreen_ventilation) strengths.push('Ventilated rainscreen and replaceable cladding support repair and drying.');
    if (d.foundation.no_compaction) strengths.push('Point-load foundation intent avoids a slab, fill and compaction.');
    if (m.storeyCount > 1) strengths.push('A smaller ground footprint may reduce foundation and site disturbance, but it adds structure, stairs and vertical-access complexity.');
    if (m.groundCoverage_m2 > m.grossFloorArea_m2 * 0.95) tradeoffs.push('Ground coverage is close to gross floor area; the design does not gain much floor area from stacking.');
    if (m.storeyCount > 1) tradeoffs.push('Stacking adds inter-storey structure, lateral bracing, fire separation, crane time and a stair. It is not automatically cheaper or lower-impact.');
    if (m.envelopeArea_m2 > 0 && m.grossFloorArea_m2 > 0) tradeoffs.push('Exposed envelope is about ' + round(m.envelopeArea_m2 / m.grossFloorArea_m2, 2) + ' m² per m² of gross floor area; a compact form reduces this, but openings and thermal bridges still matter.');
    if (d.roof_form && d.roof_form.green_roof) tradeoffs.push('A green roof adds saturated load, drainage, fire and maintenance complexity; it is not assumed to be feasible.');
    if (blocks.some(function (b) { return b.oversize_width; })) tradeoffs.push('Insulated modules may exceed about 3.0 m transport width; oversize permits and route surveys are likely.');
    return {
      container_count: d.modules.length,
      containers_reused_assumption: !!d.material_intent.reclaimed_containers,
      gross_floor_area_m2: m.grossFloorArea_m2,
      ground_coverage_m2: m.groundCoverage_m2,
      usable_floor_area_m2: null,
      usable_floor_area_note: 'Usable floor area cannot be calculated reliably from nominal container geometry. It excludes structure, services, circulation, partitions and inaccessible zones.',
      envelope_area_m2: m.envelopeArea_m2,
      roof_area_m2: m.roofArea_m2,
      window_area_m2: m.windowArea_m2,
      glazing_by_orientation: exposureProfile(d).glazing_by_face,
      roof_type: m.roofType,
      solar_ready_area_m2: m.solarArea_m2,
      insulation: { wall_mm: t.wall_insulation_mm, roof_mm: t.roof_insulation_mm, floor_mm: t.floor_insulation_mm, assembly: t.assembly, thermal_bridges: t.thermal_bridge_mitigation },
      foundation: { system: d.foundation.system, clearance_m: d.foundation.clearance_m, no_compaction: d.foundation.no_compaction },
      transport: blocks,
      lifting: { crane_lifts: d.modules.length, note: 'One lift per module is assumed for comparison; the actual lift plan and crane position need review.' },
      material_reuse: (d.materials || []).map(function (x) { return x.component + ': ' + x.material; }),
      maintenance: ['Inspect cladding, sealant, cavity, fasteners and vegetation twice a year and after severe weather.', 'Inspect roof drainage, snow accumulation and PV mounting annually.'],
      qualitative: { strengths: strengths, tradeoffs: tradeoffs },
      assumptions: ['Reused ISO containers are the module source; condition and provenance are not verified.', 'Nominal container dimensions are used; insulation and cladding increase the exposed envelope.', 'No structural, energy, carbon or cost model has been run.'],
      missing_inputs: ['Verified container condition and provenance', 'Structural design and connection details', 'Geotechnical and foundation design', 'Energy and carbon data', 'Cost and labour rates', 'Local material transport distances', 'Whole-life maintenance and replacement schedule'],
      comparator: 'A conventional timber-frame home is a valid comparator. This concept does not claim that container construction is environmentally preferable to timber construction.',
      note: 'Geometry-derived areas only. No carbon, energy, cost or durability result is invented.'
    };
  }


  function polygonArea(poly) {
    var a = 0;
    for (var i = 0; i < poly.length; i++) { var p = poly[i], q = poly[(i + 1) % poly.length]; a += p[0] * q[1] - q[0] * p[1]; }
    return Math.abs(a) / 2;
  }
  function axes(poly) {
    var out = [];
    for (var i = 0; i < poly.length; i++) {
      var p = poly[i], q = poly[(i + 1) % poly.length], dx = q[0] - p[0], dy = q[1] - p[1], len = Math.hypot(dx, dy) || 1;
      out.push([-dy / len, dx / len]);
    }
    return out;
  }
  function projectPoly(poly, axis) {
    var lo = Infinity, hi = -Infinity;
    poly.forEach(function (p) { var v = p[0] * axis[0] + p[1] * axis[1]; lo = Math.min(lo, v); hi = Math.max(hi, v); });
    return [lo, hi];
  }
  function polygonsOverlap(a, b) {
    var axesAll = axes(a).concat(axes(b));
    for (var i = 0; i < axesAll.length; i++) {
      var pa = projectPoly(a, axesAll[i]), pb = projectPoly(b, axesAll[i]);
      if (pa[1] <= pb[0] + 0.002 || pb[1] <= pa[0] + 0.002) return false;
    }
    return true;
  }
  function clipPolygon(subject, clip) {
    var output = subject;
    for (var i = 0; i < clip.length; i++) {
      var a = clip[i], b = clip[(i + 1) % clip.length];
      var input = output;
      output = [];
      if (!input.length) break;
      var inside = function (p) { return (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]) >= -E; };
      var intersect = function (p, q) {
        var x1 = p[0], y1 = p[1], x2 = q[0], y2 = q[1], x3 = a[0], y3 = a[1], x4 = b[0], y4 = b[1];
        var den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (Math.abs(den) < 1e-9) return p;
        var t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
        return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
      };
      for (var j = 0; j < input.length; j++) {
        var cur = input[j], prev = input[(j + input.length - 1) % input.length];
        var curIn = inside(cur), prevIn = inside(prev);
        if (curIn) {
          if (!prevIn) output.push(intersect(prev, cur));
          output.push(cur);
        } else if (prevIn) output.push(intersect(prev, cur));
      }
    }
    return output;
  }
  function overlapArea(a, b) {
    if (!polygonsOverlap(a, b)) return 0;
    var clipped = clipPolygon(a, b);
    return clipped.length >= 3 ? polygonArea(clipped) : 0;
  }

  function openingSegment(m, o) {
    var L = m.nominal.length_m, W = m.nominal.width_m, pos = o.position_m, w = o.width_m;
    var a, b;
    if (o.face === 'north') { a = [-L / 2 + pos - w / 2, -W / 2]; b = [-L / 2 + pos + w / 2, -W / 2]; }
    else if (o.face === 'south') { a = [-L / 2 + pos - w / 2, W / 2]; b = [-L / 2 + pos + w / 2, W / 2]; }
    else if (o.face === 'west') { a = [-L / 2, -W / 2 + pos - w / 2]; b = [-L / 2, -W / 2 + pos + w / 2]; }
    else { a = [L / 2, -W / 2 + pos - w / 2]; b = [L / 2, -W / 2 + pos + w / 2]; }
    return [transform(m, a), transform(m, b)];
  }
  function faceVector(face) {
    return face === 'north' ? [0, -1] : face === 'south' ? [0, 1] : face === 'east' ? [1, 0] : [-1, 0];
  }
  function faceNormalWorld(m, face) {
    var v = faceVector(face);
    var r = rotatePoint(v, m.rotation_deg || 0);
    return [r[0], r[1]];
  }
  function faceLength(m, face) { return face === 'east' || face === 'west' ? m.nominal.width_m : m.nominal.length_m; }

  function bounds(d) {
    var polys = [];
    d.modules.forEach(function (m) { polys.push(moduleCorners(m)); });
    d.connections.forEach(function (c) { polys.push(connectionCorners(c)); });
    d.porches.forEach(function (p) { var m = moduleById(d, p.module); if (m) polys.push(porchCorners(m, p)); });
    d.decks.forEach(function (dk) { var p = porchById(d, dk.porch); if (p) { var m = moduleById(d, p.module); if (m) polys.push(deckCorners(m, p, dk)); } });
    (d.trellises || []).forEach(function (t) { var m = moduleById(d, t.module); if (m) polys.push(trellisCorners(m, t)); });
    (d.vegetation || []).forEach(function (v) { var m = moduleById(d, v.module); if (m) polys.push(vegetationCorners(m, v)); });
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    polys.forEach(function (poly) { poly.forEach(function (pt) { minX = Math.min(minX, pt[0]); minY = Math.min(minY, pt[1]); maxX = Math.max(maxX, pt[0]); maxY = Math.max(maxY, pt[1]); }); });
    return { minX: minX, minY: minY, maxX: maxX, maxY: maxY, width: maxX - minX, height: maxY - minY };
  }

  function validateGeometry(input) {
    var d = Schema.canonicalize(input);
    var errors = [];
    var warnings = [];
    var err = function (code, message) { errors.push({ code: code, severity: 'invalid', message: message }); };
    var warn = function (code, message, category) { warnings.push({ code: code, severity: category || 'engineering', message: message }); };
    if (d.modules.length < 1) err('no-modules', 'A design needs at least one container.');
    if (d.modules.length > 3) err('too-many-modules', 'The Design Lab supports one to three containers.');
    if (d.maxOccupiedStoreys > Schema.MAX_OCCUPIED_STOREYS) err('too-many-storeys', 'A residence may not exceed two occupied storeys.');
    (d.modules || []).forEach(function (m) {
      if (num(m.storey, 0) > 1) err('too-many-storeys', 'Module ' + m.id + ' is on storey ' + num(m.storey, 0) + '; a residence may not exceed two occupied storeys.');
      if (num(m.storey, 0) < 0) err('negative-storey', 'Module ' + m.id + ' has a negative storey.');
      if (moduleBase(m) < -0.01) err('negative-elevation', 'Module ' + m.id + ' has a negative elevation.');
    });
    for (var i = 0; i < d.modules.length; i++) {
      for (var j = i + 1; j < d.modules.length; j++) {
        var a = d.modules[i], b = d.modules[j];
        var plan = polygonsOverlap(moduleCorners(a), moduleCorners(b));
        if (!plan) continue;
        var za = [moduleBase(a), moduleTop(a)], zb = [moduleBase(b), moduleTop(b)];
        var zOverlap = za[0] < zb[1] - 0.002 && zb[0] < za[1] - 0.002;
        if (zOverlap) err('module-collision-3d', 'Containers ' + a.id + ' and ' + b.id + ' collide in three dimensions. Modules may overlap in plan only when they are on different elevations.');
        else warn('module-overlap-in-plan', 'Containers ' + a.id + ' and ' + b.id + ' overlap in plan at different elevations. Verify the support path, floor assembly, fire separation and construction sequence.', 'engineering');
      }
    }
    var support = supportAnalysis(d);
    support.rows.filter(function (r) { return r.upper; }).forEach(function (r) {
      if (!r.declared.length) warn('support-not-declared', r.module + ' is on an upper storey but declares no supporting module. Support intent is uncertain; report uncertainty rather than assuming a load path.', 'engineering');
      if (r.support_fraction <= 0.001) warn('unsupported-upper', r.module + ' has no supporting module below. It requires an engineered transfer structure, or the design is not buildable as drawn.', 'engineering');
      else if (r.support_fraction < 0.999) warn('partial-support', r.module + ' is supported over ' + Math.round(r.support_fraction * 100) + '% of its footprint (' + n(r.supported_area_m2) + ' m² of ' + n(r.footprint_m2) + ' m²). The unsupported area needs engineered transfer and cantilever review; no arbitrary cantilever limit is applied.', 'engineering');
      if (r.vertical_gap_m != null) warn('inter-storey-gap', r.module + ' sits ' + n(r.vertical_gap_m) + ' m above the module below. The inter-storey floor, connectors and fire separation are not represented.', 'engineering');
      if (r.declared_missing.length) warn('support-reference-mismatch', r.module + ' names ' + r.declared_missing.join(', ') + ' as support, but that module does not provide a bearing overlap at the recorded elevation.', 'engineering');
      if (!(r.contacts || []).length) warn('no-support-contact', r.module + ' has no lower module in plan contact. An independent structure or cantilever is implied.', 'engineering');
    });
    if (support.stacked) {
      warn('stacked-lateral', 'Stacked modules need a designed lateral-force system, inter-module connections, fire separation and a crane/lift sequence. Bearing alone is not a structural design.', 'engineering');
      warn('stacked-foundation', 'Stacking changes foundation reactions, uplift and point loads. Foundation design needs geotechnical and structural review.', 'engineering');
      if (!(d.access.stair && d.access.stair.present)) warn('missing-stair', 'An upper storey is present but no stair is recorded. Vertical access is unresolved.', 'accessibility');
      else if (d.access.stair.width_m < 0.86) warn('stair-width', 'The recorded stair width is ' + n(d.access.stair.width_m) + ' m; verify clear width, handrails, landings, guarding and egress.', 'accessibility');
    }
    d.modules.forEach(function (m) {
      (m.openings || []).forEach(function (o) {
        var len = faceLength(m, o.face);
        var lo = o.position_m - o.width_m / 2, hi = o.position_m + o.width_m / 2;
        if (lo < 0.15 || hi > len - 0.15) err('opening-corner', 'Opening ' + o.id + ' is too close to the end of the ' + o.face + ' face.');
        else if (lo < 0.35 || hi > len - 0.35) warn('opening-near-corner', 'Opening ' + o.id + ' is within 350 mm of a container end; reinforcement and corner-post capacity need review.');
        if (o.sill_m + o.height_m > m.nominal.height_m - 0.15) err('opening-height', 'Opening ' + o.id + ' cuts into the top rail.');
      });
      (m.zones || []).forEach(function (z) {
        if (z.start_m < -E || z.end_m > m.nominal.length_m + E) err('zone-bounds', 'Zone ' + z.name + ' extends beyond the container.');
        if (z.end_m - z.start_m < 0.6) warn('zone-small', 'Zone ' + z.name + ' is only ' + n(z.end_m - z.start_m) + ' m long.', 'accessibility');
      });
      var zs = (m.zones || []).slice().sort(function (a, b) { return a.start_m - b.start_m; });
      for (var k = 1; k < zs.length; k++) {
        if (zs[k].start_m < zs[k - 1].end_m - 0.01) err('zone-overlap', 'Zones ' + zs[k - 1].name + ' and ' + zs[k].name + ' overlap.');
      }
      (m.openings || []).forEach(function (a, ai) {
        (m.openings || []).slice(ai + 1).forEach(function (b) {
          if (a.face !== b.face) return;
          var a0 = a.position_m - a.width_m / 2, a1 = a.position_m + a.width_m / 2;
          var b0 = b.position_m - b.width_m / 2, b1 = b.position_m + b.width_m / 2;
          if (a0 < b1 && b0 < a1) err('opening-overlap', 'Openings ' + a.id + ' and ' + b.id + ' overlap on the ' + a.face + ' face.');
        });
      });
      if (m.structure && m.structure.wall_removal === 'large') warn('wall-removal', m.id + ' assumes a large structural wall removal. Engineered framing and transfer beams are required.', 'engineering');
      if (m.structure && m.structure.cantilever_m > 0) warn('cantilever', m.id + ' records a ' + n(m.structure.cantilever_m) + ' m conceptual cantilever. No cantilever length is treated as acceptable by this model; support, tie-down, deflection and uplift need engineering review.', 'engineering');
      var doors = (m.openings || []).filter(function (o) { return o.type === 'door' || o.type === 'sliding-door'; });
      doors.forEach(function (a, di) {
        doors.slice(di + 1).forEach(function (b) {
          if (a.face !== b.face) return;
          if (Math.abs(a.position_m - b.position_m) < 1.0) warn('door-swing', 'Doors ' + a.id + ' and ' + b.id + ' are close together on the ' + a.face + ' face. Check door swings, circulation and furniture clearances.', 'accessibility');
        });
      });
      if (m.roof && m.roof.green) warn('green-roof', m.id + ' has a green roof. Saturated weight, snow, drainage, waterproofing and fire need engineering review.', 'engineering');
      if (m.insulation.thickness_mm < 100) warn('thin-insulation', m.id + ' has less than 100 mm of external insulation; thermal bridging and condensation need review.', 'engineering');
      var transportWidth = m.nominal.width_m + 2 * (m.insulation.thickness_mm / 1000 + 0.03);
      var transportHeight = m.nominal.height_m + m.insulation.thickness_mm / 1000 + 0.25;
      if (transportWidth > 3.0 || transportHeight > 3.2) warn('transport', m.id + ' is about ' + n(transportWidth) + ' m wide and ' + n(transportHeight) + ' m high after insulation and roof. Oversize transport permits and route surveys are likely.', 'engineering');
      if (m.openings.some(function (o) { return o.type === 'door' && o.width_m < 0.86; })) warn('door-width', m.id + ' has a door narrower than the 0.86 m project target.', 'accessibility');
      (m.zones || []).filter(function (z) { return z.type === 'bathroom'; }).forEach(function (z) {
        if (z.end_m - z.start_m < 2.4) warn('bathroom-clearance', 'Bathroom ' + z.name + ' is ' + n(z.end_m - z.start_m) + ' m long. Verify a 1.5 m turning circle, transfer space, grab bars and door clearance against CSA B651 and the applicable code.', 'accessibility');
      });
    });
    d.porches.forEach(function (p) {
      var m = moduleById(d, p.module);
      if (!m) return;
      if (p.start_m < 0 || p.start_m + p.length_m > faceLength(m, p.face) + 0.01) err('porch-bounds', 'Porch ' + p.id + ' extends beyond the container face.');
      if (p.depth_m > 5) err('porch-depth', 'Porch ' + p.id + ' is deeper than 5 m.');
    });
    d.decks.forEach(function (dk) {
      if (dk.projection_m > 3) err('deck-depth', 'Deck ' + dk.id + ' projects more than 3 m.');
      var p = porchById(d, dk.porch), m = p && moduleById(d, p.module);
      if (!m) return;
      var poly = deckCorners(m, p, dk);
      d.modules.forEach(function (other) {
        if (other.id === m.id) return;
        if (overlapArea(poly, moduleCorners(other)) <= 0.1) return;
        if (moduleBase(m) < moduleTop(other) - 0.002 && moduleBase(other) < moduleTop(m) - 0.002) err('deck-overlap', 'Deck ' + dk.id + ' overlaps container ' + other.id + ' at the same elevation.');
        else warn('deck-under-module', 'Deck ' + dk.id + ' sits below container ' + other.id + '. Headroom, drainage, support and fire separation need review.', 'engineering');
      });
    });
    (d.trellises || []).forEach(function (t) {
      var m = moduleById(d, t.module);
      if (!m) return;
      if (t.start_m < 0 || t.start_m + t.length_m > faceLength(m, t.face) + 0.01) err('trellis-bounds', 'Trellis ' + t.id + ' extends beyond the container face.');
      if (t.offset_m < 0.25) warn('trellis-offset', 'Trellis ' + t.id + ' is less than 250 mm from the rainscreen; roots, moisture and maintenance need clearance.', 'engineering');
      if (t.height_m > 3.5) warn('trellis-height', 'Trellis ' + t.id + ' is taller than 3.5 m; wind, fixing and maintenance need review.', 'engineering');
    });
    (d.vegetation || []).forEach(function (v) {
      var m = moduleById(d, v.module);
      if (!m) return;
      if (v.start_m < 0 || v.start_m + v.length_m > faceLength(m, v.face) + 0.01) err('vegetation-bounds', 'Vegetation ' + v.id + ' extends beyond the container face.');
      if (v.offset_m < 0.3) warn('vegetation-separation', 'Vegetation ' + v.id + ' is less than 300 mm from the wall; roots, moisture, maintenance and fire need clearance.', 'engineering');
      else if (v.offset_m < 0.45) warn('vegetation-clearance', 'Vegetation ' + v.id + ' is close to the wall; confirm the independent support and maintenance gap.', 'engineering');
      if (!/independent|piles|posts|footing/i.test(v.support || '')) warn('vegetation-support', 'Vegetation ' + v.id + ' must be independently supported; do not fix a planted wall to the container shell.', 'engineering');
      if (/none|no irrigation/i.test(v.irrigation || '')) warn('vegetation-irrigation', 'Vegetation ' + v.id + ' has no irrigation strategy; establishment, drought and maintenance need a plan.', 'accessibility');
      warn('vegetation-fire', 'Vegetation ' + v.id + ' adds a combustible or living layer close to the cladding; fire, irrigation and maintenance need review.', 'engineering');
    });
    d.connections.forEach(function (c) {
      var poly = connectionCorners(c);
      var cz0 = d.foundation.clearance_m, cz1 = cz0 + 2.65;
      d.modules.forEach(function (m) {
        var area = overlapArea(poly, moduleCorners(m));
        if (area <= 0.15) return;
        if (cz0 < moduleTop(m) - 0.002 && moduleBase(m) < cz1 - 0.002) err('connection-overlap', 'Connection ' + c.id + ' overlaps container ' + m.id + ' by ' + n(area) + ' m² at the same elevation.');
        else warn('connection-under-module', 'Connection ' + c.id + ' sits below container ' + m.id + '. Covered circulation is legitimate, but headroom, drainage, fire separation and support need review.', 'engineering');
      });
    });
    d.porches.forEach(function (p) {
      var m = moduleById(d, p.module);
      if (!m) return;
      var poly = porchCorners(m, p);
      var pz0 = moduleBase(m), pz1 = moduleTop(m);
      d.modules.forEach(function (other) {
        if (other.id === m.id) return;
        if (overlapArea(poly, moduleCorners(other)) <= 0.1) return;
        var oz0 = moduleBase(other), oz1 = moduleTop(other);
        if (pz0 < oz1 - 0.002 && oz0 < pz1 - 0.002) err('porch-overlap', 'Porch ' + p.id + ' overlaps container ' + other.id + ' at the same elevation.');
        else warn('porch-under-module', 'Porch ' + p.id + ' sits below container ' + other.id + '. Covered outdoor space is legitimate, but headroom, drainage, fire separation, support and the upper module’s loads need review.', 'engineering');
      });
    });
    if (d.modules.length > 1) warn('crane', 'More than one container means a staged lift and a crane/installation review.', 'engineering');
    if (d.modules.some(function (m) { return m.nominal.length_m > 6.1; })) warn('transport-40', 'A 40-foot module requires oversize transport planning, route surveys and permits.', 'engineering');
    if (d.modules.some(function (m) { return m.roof.solar; }) && d.porches.some(function (p) { return p.face === 'south' && p.depth_m > 2.5; })) warn('solar-shading', 'A deep south porch may shade lower roof panels in winter. Check the solar path and panel layout.', 'engineering');
    if (d.modules.some(function (m) { return m.roof.solar || m.roof.green; })) warn('roof-loads', 'PV and green roofs add dead load, snow drift, drainage and fire requirements. Roof structure and waterproofing need engineering review.', 'engineering');
    warn('envelope', 'Air, vapour, water and thermal control around steel, openings and foundations need a building-envelope review.', 'engineering');
    warn('condensation', 'Condensation on steel, fasteners and the underside of the floor is a design risk in Canadian winters.', 'engineering');
    warn('circulation', 'Door swings, circulation widths, furniture and fixture clearances have not been verified.', 'accessibility');
    warn('professional', 'This concept has not been reviewed by an architect, engineer, accessibility consultant or building official. It is not an Ontario Building Code compliance assessment.', 'review');
    warn('foundation', 'Foundation type, frost depth, bedrock, groundwater and wetland proximity need geotechnical review.', 'review');
    warn('fire', 'Spatial separation, cladding, roof coverings, PV and battery safety and wildfire interface need fire review.', 'review');
    var glazingArea = d.modules.reduce(function (t, m) { return t + m.openings.filter(function (o) { return o.type === 'window' || o.type === 'sliding-door'; }).reduce(function (u, o) { return u + o.width_m * o.height_m; }, 0); }, 0) + d.connections.reduce(function (t, c) { return t + (c.glazed ? c.glazing_area_m2 || 0 : 0); }, 0);
    var conditioned = d.modules.reduce(function (t, m) { return t + m.nominal.length_m * m.nominal.width_m; }, 0) + d.connections.filter(function (c) { return c.glazed; }).reduce(function (t, c) { return t + c.length_m * c.width_m; }, 0);
    if (conditioned > 0 && glazingArea / conditioned > 0.28) warn('glazing-ratio', 'Glazing is about ' + Math.round(glazingArea / conditioned * 100) + '% of the nominal conditioned area. Large glazed areas can overheat in summer and lose heat in winter; model shading and window performance before deciding.', 'engineering');
    if (d.thermal && /none|not decided/i.test(d.thermal.external_shading)) warn('no-shading', 'External shading is not resolved. West and south glazing need a summer overheating strategy.', 'engineering');
    if (d.thermal && d.thermal.heat_recovery_ventilation === false) warn('no-hrv', 'No heat-recovery ventilation is selected. Winter ventilation and moisture control need a designed strategy.', 'engineering');
    if (d.foundation) {
      warn('foundation-geotech', 'Foundation type, soil, bedrock, groundwater, frost depth, uplift and lateral capacity need geotechnical and structural review for the ' + d.foundation.system + ' option.', 'engineering');
      if (d.foundation.clearance_m < 0.45) warn('foundation-clearance', 'The floor clearance is below 450 mm; ventilation, inspection, snow, water and maintenance access need review.', 'engineering');
      if (!d.foundation.no_compaction) warn('foundation-compaction', 'No-compaction is not confirmed; root protection, fill, grading and construction access need an arborist and erosion-control plan.', 'engineering');
      if (!d.foundation.independent_deck) warn('foundation-deck', 'Decks and porches are not marked independent; connecting them to the container frame can transfer movement and loads.', 'engineering');
      if (d.foundation.system === 'ground-screws' || d.foundation.system === 'timber-posts') warn('foundation-light-system', 'Ground screws and timber posts are best for light decks, boardwalks or porches; a house needs an engineered primary foundation.', 'engineering');
    }
    if (d.envelope) {
      warn('envelope-condensation', 'The ' + (ENVELOPE_LABEL[d.envelope.assembly] || d.envelope.assembly) + ' assembly keeps insulation outboard, but air/vapour control, thermal bridges and condensation at steel and openings still need a building-envelope review.', 'engineering');
      warn('envelope-fire', d.envelope.fire + '.', 'engineering');
      warn('envelope-moisture', 'Rainscreen drainage, drying, ground clearance and moisture management are not proven by this configuration.', 'engineering');
      warn('envelope-fastening', d.envelope.fastening + '.', 'engineering');
      warn('envelope-penetrations', d.envelope.penetrations + '.', 'engineering');
      warn('envelope-maintenance', d.envelope.maintenance + '.', 'engineering');
      if (d.envelope.assembly === 'spray-foam') warn('envelope-spray-foam', 'Exterior closed-cell spray foam needs protection from UV and fire, a compatible substrate, controlled thickness and a moisture strategy; do not assume it is vapour-safe.', 'engineering');
    }
    if (d.connections.some(function (c) { return c.glazed && (c.glazing_area_m2 || 0) > 12; })) warn('large-glazed-hall', 'A large glazed hall or veranda needs insulated sliding/folding doors, thermal breaks and a condensation strategy. Do not assume a glazed garage door is suitable.', 'engineering');

    /* Vertical geometry, roof and accessibility checks. */
    d.modules.forEach(function (m) {
      if (moduleBase(m) + 0.01 < d.foundation.clearance_m) warn('elevation-below-clearance', m.id + ' is set at ' + n(moduleBase(m)) + ' m but the foundation clearance is ' + n(d.foundation.clearance_m) + ' m. The floor, foundation and drainage relationship is inconsistent.', 'engineering');
      if (moduleTop(m) > 8) warn('building-height', m.id + ' reaches ' + n(moduleTop(m)) + ' m above grade before the roof. Height, wind, fire access and planning limits need review.', 'engineering');
    });
    var rg = roofGeometry(d);
    if (rg.type === 'flat') warn('roof-drainage', 'A flat roof needs a designed drainage strategy: slope, outlets, overflow, ponding, snow and maintenance access are not resolved by the concept.', 'engineering');
    if (rg.type === 'butterfly') warn('roof-butterfly', 'A butterfly roof concentrates water at a central valley. Drainage, snow drift, overflow and structural loading need review.', 'engineering');
    if (rg.type === 'green' || rg.green) warn('roof-green', 'A green roof adds saturated load, drainage, root protection, fire and maintenance complexity. Do not assume it is feasible.', 'engineering');
    if (rg.type === 'canopy') warn('roof-canopy', 'A roof canopy is not an occupied storey. Fixings, uplift, snow drift and thermal continuity at the junction need review.', 'engineering');
    if (rg.type === 'solar-ready') warn('roof-solar-ready', 'A solar-ready roof records mounting intent only. Roof structure, wind uplift, snow shedding, fire access and electrical design need review.', 'engineering');
    if (rg.top_m > 0) warn('roof-wind', 'Roof overhangs, ridges, valleys and parapets change wind uplift and snow drift. Roof geometry is conceptual.', 'engineering');
    var access = accessibilityProfile(d);
    access.issues.forEach(function (i) { warn(i.code, i.message, 'accessibility'); });
    if (d.levels.length > 1 && !d.access.ground_floor_essential_functions) warn('no-ground-functions', 'A two-storey home does not record ground-floor essential living functions. It cannot be described as offering accessible living.', 'accessibility');
    if (d.review && d.review.structural === 'professionally-verified' && !Schema.hasProfessionalAssessment(d.review)) warn('review-claim', 'The structural review register claims professional verification without a documented, attributable assessment. The model does not treat that claim as evidence.', 'review');
    if (d.review && d.review.accessibility === 'professionally-verified' && !Schema.hasProfessionalAssessment(d.review)) warn('review-claim-accessibility', 'The accessibility review register claims professional verification without a documented, attributable assessment.', 'review');
    return { errors: errors, warnings: warnings, ok: errors.length === 0 };
  }

  function assess(design) {
    var schema = Schema.validateSchema(design);
    var geo = validateGeometry(design);
    var items = [];
    schema.errors.forEach(function (e) { items.push({ category: 'invalid-data', code: e.code, message: e.message }); });
    schema.warnings.forEach(function (w) { items.push({ category: 'professional-review', code: w.code, message: w.message }); });
    geo.errors.forEach(function (e) { items.push({ category: 'invalid-geometry', code: e.code, message: e.message }); });
    geo.warnings.forEach(function (w) {
      var sev = w.severity || 'engineering';
      var category = sev === 'accessibility' ? 'accessibility' : sev === 'review' ? 'professional-review' : 'structural';
      items.push({ category: category, code: w.code, message: w.message });
    });
    var invalid = items.filter(function (i) { return i.category === 'invalid-data' || i.category === 'invalid-geometry'; });
    return { ok: invalid.length === 0, items: items, warnings: geo.warnings, invalid: invalid };
  }

  var ENVELOPE_LABEL = { 'rigid-board': 'Rigid board', 'mineral-wool': 'Mineral wool', 'wood-fibre': 'Wood fibre', 'spray-foam': 'Exterior closed-cell spray foam', 'hybrid': 'Hybrid wood fibre + mineral wool' };
  var VEG_LABEL = { 'trellis': 'Freestanding trellis', 'living-wall': 'Modular living wall', 'edible-wall': 'Edible planter wall', 'privacy-screen': 'Evergreen privacy screen' };

  function envelopeFor(assembly, thickness, cladding) {
    assembly = ENVELOPE_LABEL[assembly] ? assembly : 'mineral-wool';
    thickness = Math.max(60, Math.min(300, thickness || 150));
    cladding = cladding || 'timber';
    var layers = [
      { material: 'steel container wall', thickness_mm: 3, role: 'structure' },
      { material: 'air and vapour control layer', thickness_mm: 1, role: 'air/vapour' }
    ];
    if (assembly === 'hybrid') {
      layers.push({ material: 'wood-fibre board', thickness_mm: Math.round(thickness / 2), role: 'insulation' });
      layers.push({ material: 'mineral wool', thickness_mm: thickness - Math.round(thickness / 2), role: 'insulation' });
    } else if (assembly === 'spray-foam') {
      layers.push({ material: 'exterior closed-cell spray foam (protected, fire-reviewed)', thickness_mm: thickness, role: 'insulation' });
    } else {
      layers.push({ material: assembly === 'rigid-board' ? 'rigid mineral or phenolic board (TBD)' : assembly === 'wood-fibre' ? 'wood-fibre board' : 'mineral wool', thickness_mm: thickness, role: 'insulation' });
    }
    layers.push({ material: 'continuous thermal break / insulation', thickness_mm: 10, role: 'thermal break' });
    layers.push({ material: 'ventilated drained cavity', thickness_mm: 25, role: 'rainscreen' });
    layers.push({ material: cladding + ' cladding', thickness_mm: 20, role: 'cladding' });
    return {
      version: '1.0', assembly: assembly, layers: layers,
      thermal_breaks: 'continuous external insulation with thermal washers and stainless fasteners; breaks at openings, pile caps and service penetrations',
      rainscreen: { ventilated: true, cavity_mm: 25, drained: true },
      air_vapour_control: 'exterior-insulated, vapour-open assembly with a sealed interior air barrier; joints and service penetrations to be detailed',
      fire: 'combustible insulation, cladding and cavity need a fire review; cavity barriers, cladding classification and separation are not resolved',
      fastening: 'long fasteners pass through the insulation into the steel frame; pull-out, corrosion, thermal bridging and water shedding need engineering review',
      penetrations: 'openings, cladding rails, planter brackets and service penetrations need structural and waterproofing review',
      maintenance: 'inspect cladding, sealant, cavity, fasteners and vegetation twice a year and after severe weather',
      notes: 'Conceptual assembly only. Not code-compliant or moisture-safe until reviewed by a building-envelope engineer.'
    };
  }

  function wallSectionSVG(input, moduleId, opts) {
    opts = opts || {};
    var d = Schema.canonicalize(input);
    var m = moduleById(d, moduleId) || d.modules[0];
    var env = d.envelope;
    var layers = env.layers.slice();
    var total = layers.reduce(function (t, l) { return t + l.thickness_mm; }, 0);
    var pre = opts.idPrefix || 'wall-section';
    var W = 1040, H = 640;
    var x0 = 90, y0 = 140, wallH = 170;
    var scale = Math.min(4.1, 760 / Math.max(1, total));
    var x = x0;
    var colours = { structure: '#7c8585', 'air/vapour': '#d7e2e6', insulation: '#d8bd87', 'thermal break': '#b7c9c0', rainscreen: '#dbe6d7', cladding: '#8a6a4a' };
    var out = [];
    out.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-labelledby="' + pre + '-t ' + pre + '-d">');
    var titleText = opts.title || (d.name + ' envelope wall section');
    out.push('<title id="' + pre + '-t">' + esc(titleText) + '</title>');
    out.push('<desc id="' + pre + '-d">' + esc('Explanatory wall section for the ' + (ENVELOPE_LABEL[env.assembly] || env.assembly) + ' assembly on ' + m.id + '. ' + total + ' millimetres of layers. Numbered bands correspond to the legend below. Conceptual only; not a construction detail or a code or moisture assessment.') + '</desc>');
    out.push('<rect width="' + W + '" height="' + H + '" fill="#faf8f2"/>');
    out.push('<text x="34" y="48" font-family="system-ui, sans-serif" font-size="24" font-weight="800" fill="#1d392c">' + esc(opts.title || (d.name + ' · wall section')) + '</text>');
    out.push('<text x="34" y="72" font-family="system-ui, sans-serif" font-size="14" fill="#3f5a4c">' + esc((ENVELOPE_LABEL[env.assembly] || env.assembly) + ' · ' + total + ' mm · ' + m.id + ' · conceptual assembly') + '</text>');
    layers.forEach(function (l, i) {
      var w = Math.max(16, l.thickness_mm * scale);
      var fill = colours[l.role] || '#e7dfce';
      out.push('<rect x="' + n(x) + '" y="' + y0 + '" width="' + n(w) + '" height="' + wallH + '" fill="' + fill + '" stroke="#435a4a" stroke-width="1.2"/>');
      if (l.role === 'insulation') {
        for (var yy = y0 + 10; yy < y0 + wallH; yy += 12) out.push('<line x1="' + n(x + 2) + '" y1="' + n(yy) + '" x2="' + n(x + w - 2) + '" y2="' + n(yy) + '" stroke="#a88952" stroke-width="0.7" opacity="0.55"/>');
      }
      if (l.role === 'rainscreen') {
        for (var xx = x + 6; xx < x + w; xx += 9) out.push('<line x1="' + n(xx) + '" y1="' + n(y0 + 4) + '" x2="' + n(xx) + '" y2="' + n(y0 + wallH - 4) + '" stroke="#78927c" stroke-width="0.8"/>');
      }
      out.push('<text x="' + n(x + w / 2) + '" y="' + (y0 + 16) + '" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#1d392c">' + (i + 1) + '</text>');
      x += w;
    });
    // fasteners through the insulation
    for (var fy = y0 + 44; fy < y0 + wallH; fy += 58) {
      out.push('<line x1="' + (x0 - 36) + '" y1="' + fy + '" x2="' + n(x0 + 4) + '" y2="' + fy + '" stroke="#7b4a2b" stroke-width="4"/>');
      out.push('<circle cx="' + (x0 - 36) + '" cy="' + fy + '" r="3" fill="#7b4a2b"/>');
    }
    // exterior face and vegetation offset
    out.push('<line x1="' + n(x) + '" y1="' + y0 + '" x2="' + n(x) + '" y2="' + (y0 + wallH) + '" stroke="#253a33" stroke-width="2"/>');
    out.push('<line x1="' + n(x + 44) + '" y1="' + y0 + '" x2="' + n(x + 44) + '" y2="' + (y0 + wallH) + '" stroke="#4f7d64" stroke-width="3" stroke-dasharray="6 4"/>');
    out.push('<text x="' + n(x + 52) + '" y="' + (y0 + 14) + '" font-family="system-ui, sans-serif" font-size="10" fill="#31573f">vegetation clearance</text>');
    out.push('<text x="' + n(x + 52) + '" y="' + (y0 + 29) + '" font-family="system-ui, sans-serif" font-size="10" fill="#31573f">independent support</text>');
    // dimension line
    out.push('<line x1="' + x0 + '" y1="' + (y0 + wallH + 34) + '" x2="' + n(x) + '" y2="' + (y0 + wallH + 34) + '" stroke="#435a4a" stroke-width="1"/>');
    out.push('<text x="' + n((x0 + x) / 2) + '" y="' + (y0 + wallH + 50) + '" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#1d392c">wall build-up ' + total + ' mm · nominal · fasteners pass through insulation</text>');
    // legend
    out.push('<text x="34" y="365" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#1d392c">Layers</text>');
    for (var i = 0; i < layers.length; i++) {
      var l = layers[i];
      var yy2 = 386 + i * 21;
      out.push('<text x="34" y="' + yy2 + '" font-family="system-ui, sans-serif" font-size="11" fill="#1d392c"><tspan font-weight="800">' + (i + 1) + '.</tspan> ' + esc(l.material) + ' · ' + l.thickness_mm + ' mm · ' + esc(l.role) + '</text>');
    }
    var notes = [
      'Condensation: air/vapour control, thermal breaks, ventilation and drying need a building-envelope review.',
      'Fire: insulation, cladding and cavity need a fire review; do not assume this assembly is acceptable.',
      'Moisture: drained/ventilated rainscreen and ground clearance need detailing; planting adds water and load.',
      'Fastening/penetrations: long fasteners, cladding rails and planter brackets need structural and waterproofing review.',
      'Maintenance: inspect cladding, sealant, cavity, fasteners and vegetation regularly.'
    ];
    out.push('<g font-family="system-ui, sans-serif" font-size="10.5" fill="#3f5a4c">');
    notes.forEach(function (note, i) { out.push('<text x="34" y="' + (522 + i * 15) + '">' + esc('• ' + note) + '</text>'); });
    out.push('</g>');
    out.push('<text x="34" y="' + (H - 12) + '" font-family="system-ui, sans-serif" font-size="9" fill="#5e6a58">Conceptual wall section · not a construction detail · not code-compliant or moisture-safe without engineering review · Containers Hamlet Design Lab · CC BY-SA 4.0</text>');
    out.push('</svg>');
    return out.join('');
  }

  function solarSectionSVG(input, moduleId, opts) {
    opts = opts || {};
    var d = Schema.canonicalize(input);
    var m = moduleById(d, moduleId) || d.modules[0];
    var solar = m.solar || {};
    var tilt = Math.max(0, Math.min(75, solar.tilt_deg || 39));
    var W = 1040, H = 400;
    var baseY = 270, roofX0 = 120, roofX1 = 900;
    var run = 210;
    var rise = run * Math.tan(tilt * Math.PI / 180);
    var x0 = 280, y0 = baseY, x1 = x0 + run, y1 = baseY - rise;
    var pre = opts.idPrefix || 'solar-section';
    var out = [];
    out.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-labelledby="' + pre + '-t ' + pre + '-d">');
    out.push('<title id="' + pre + '-t">' + esc(opts.title || (d.name + ' solar tilt section')) + '</title>');
    out.push('<desc id="' + pre + '-d">' + esc('Explanatory section of a roof-mounted solar array tilted ' + tilt + ' degrees, facing azimuth ' + (solar.azimuth_deg || 180) + ' degrees. Conceptual only; snow shedding, shading, wind uplift, roof structure and electrical design need professional review.') + '</desc>');
    out.push('<rect width="' + W + '" height="' + H + '" fill="#faf8f2"/>');
    out.push('<text x="34" y="44" font-family="system-ui, sans-serif" font-size="23" font-weight="800" fill="#1d392c">' + esc(opts.title || 'Solar tilt and azimuth') + '</text>');
    out.push('<text x="34" y="66" font-family="system-ui, sans-serif" font-size="13" fill="#3f5a4c">' + esc((m.id) + ' · ' + tilt + '° tilt · ' + (solar.azimuth_deg || 180) + '° azimuth · ' + (solar.season_mode || 'year-round') + ' strategy') + '</text>');
    // roof and interior
    out.push('<line x1="' + roofX0 + '" y1="' + baseY + '" x2="' + roofX1 + '" y2="' + baseY + '" stroke="#253a33" stroke-width="3"/>');
    out.push('<rect x="' + roofX0 + '" y="' + baseY + '" width="' + (roofX1 - roofX0) + '" height="42" fill="#e9e2ce" stroke="#7d8b73"/>');
    out.push('<text x="' + (roofX0 + 12) + '" y="' + (baseY + 28) + '" font-family="system-ui, sans-serif" font-size="11" fill="#3f5a4c">container roof / structure</text>');
    // panel
    out.push('<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x1 + '" y2="' + y1 + '" stroke="#245a73" stroke-width="8"/>');
    out.push('<line x1="' + x0 + '" y1="' + (y0 + 12) + '" x2="' + x1 + '" y2="' + (y1 + 12) + '" stroke="#9fc9d6" stroke-width="2"/>');
    out.push('<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x0 + '" y2="' + (y0 + 22) + '" stroke="#536b63" stroke-width="2"/>');
    out.push('<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x1 + '" y2="' + (y1 + 22) + '" stroke="#536b63" stroke-width="2"/>');
    out.push('<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x0 + '" y2="' + baseY + '" stroke="#536b63" stroke-width="2" stroke-dasharray="4 3"/>');
    out.push('<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x1 + '" y2="' + baseY + '" stroke="#536b63" stroke-width="2" stroke-dasharray="4 3"/>');
    out.push('<text x="' + (x0 + 10) + '" y="' + (y1 - 12) + '" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#245a73">solar array</text>');
    // angle arc
    out.push('<path d="M' + (x0 + 60) + ' ' + y0 + ' A60 60 0 0 0 ' + n(x0 + 60 * Math.cos(-tilt * Math.PI / 180)) + ' ' + n(y0 + 60 * Math.sin(-tilt * Math.PI / 180)) + '" fill="none" stroke="#b45e1c" stroke-width="2"/>');
    out.push('<text x="' + (x0 + 66) + '" y="' + (y0 - 10) + '" font-family="system-ui, sans-serif" font-size="18" font-weight="800" fill="#b45e1c">' + tilt + '°</text>');
    // direction arrow
    out.push('<line x1="' + (x1 + 120) + '" y1="' + (baseY - 70) + '" x2="' + (x1 + 120) + '" y2="' + (baseY + 30) + '" stroke="#3f5f8a" stroke-width="2" stroke-dasharray="5 4"/>');
    out.push('<text x="' + (x1 + 126) + '" y="' + (baseY - 78) + '" font-family="system-ui, sans-serif" font-size="12" fill="#3f5f8a">azimuth ' + (solar.azimuth_deg || 180) + '°</text>');
    // labels and options
    out.push('<text x="34" y="' + (H - 56) + '" font-family="system-ui, sans-serif" font-size="12" fill="#1d392c">Year-round 36–39° · winter ~60° for low sun and snow shedding · summer ~30° · face true south within a few degrees.</text>');
    out.push('<text x="34" y="' + (H - 36) + '" font-family="system-ui, sans-serif" font-size="11" fill="#3f5a4c">Ottawa reference: SolarCalculator.CA reports 39° optimal fixed tilt. No energy production, snow-shedding or code compliance is claimed.</text>');
    out.push('<text x="34" y="' + (H - 12) + '" font-family="system-ui, sans-serif" font-size="9" fill="#5e6a58">Conceptual solar section · roof structure, wind uplift, shading, snow and electrical design require professional review · Containers Hamlet Design Lab · CC BY-SA 4.0</text>');
    out.push('</svg>');
    return out.join('');
  }

  function foundationSectionSVG(input, opts) {
    opts = opts || {};
    var d = Schema.canonicalize(input);
    var f = d.foundation;
    var W = 1040, H = 430;
    var ground = 210, floor = 135, pileBottom = 370;
    var pre = opts.idPrefix || 'foundation-section';
    var labels = { 'helical-piles': 'Engineered helical piles', 'ground-screws': 'Ground screws', 'concrete-piers': 'Concrete piers', 'timber-posts': 'Timber posts on pads', 'bedrock-anchors': 'Bedrock anchors' };
    var out = [];
    out.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-labelledby="' + pre + '-t ' + pre + '-d">');
    out.push('<title id="' + pre + '-t">' + esc(opts.title || (d.name + ' foundation section')) + '</title>');
    out.push('<desc id="' + pre + '-d">' + esc('Conceptual elevated foundation section: ' + (labels[f.system] || f.system) + ', ' + f.clearance_m + ' metre clearance, no slab, no fill and no compaction. Piles, frost depth, uplift, corrosion, lateral capacity and permits require professional design.') + '</desc>');
    out.push('<rect width="' + W + '" height="' + H + '" fill="#faf8f2"/>');
    out.push('<text x="34" y="42" font-family="system-ui, sans-serif" font-size="23" font-weight="800" fill="#1d392c">' + esc(opts.title || 'Elevated foundation and no-compaction section') + '</text>');
    out.push('<text x="34" y="64" font-family="system-ui, sans-serif" font-size="13" fill="#3f5a4c">' + esc((labels[f.system] || f.system) + ' · ' + f.clearance_m + ' m clearance · independent deck: ' + (f.independent_deck ? 'yes' : 'no') + ' · no compaction: ' + (f.no_compaction ? 'yes' : 'no')) + '</text>');
    // ground
    out.push('<rect x="70" y="' + ground + '" width="760" height="' + (H - ground - 20) + '" fill="#e4e9dd"/>');
    out.push('<line x1="70" y1="' + ground + '" x2="830" y2="' + ground + '" stroke="#6f7b63" stroke-width="2"/>');
    out.push('<text x="82" y="' + (ground + 18) + '" font-family="system-ui, sans-serif" font-size="11" fill="#3f5a4c">existing grade · no fill · no compaction</text>');
    // floor
    out.push('<rect x="180" y="' + floor + '" width="500" height="22" fill="#8a6a4a" stroke="#3a342d" stroke-width="1.2"/>');
    out.push('<text x="190" y="' + (floor - 9) + '" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#1d392c">elevated floor / independent deck</text>');
    // piles
    [[230, 230], [370, 370], [510, 510], [650, 650]].forEach(function (x) {
      out.push('<line x1="' + x[0] + '" y1="' + floor + '" x2="' + x[1] + '" y2="' + pileBottom + '" stroke="#5d6f6a" stroke-width="7"/>');
      out.push('<rect x="' + (x[1] - 18) + '" y="' + (floor + 12) + '" width="36" height="10" fill="#455955"/>');
      out.push('<path d="M' + (x[1] - 18) + ' ' + (pileBottom - 12) + 'h36l-10 12h-16z" fill="#455955"/>');
      out.push('<path d="M' + (x[1] - 16) + ' ' + (pileBottom - 4) + 'q16 18 32 0" fill="none" stroke="#455955" stroke-width="3"/>');
    });
    // frost line
    out.push('<line x1="70" y1="300" x2="830" y2="300" stroke="#8f5a21" stroke-width="1.5" stroke-dasharray="6 4"/>');
    out.push('<text x="82" y="294" font-family="system-ui, sans-serif" font-size="11" fill="#8f5a21">frost depth to be confirmed · pile depth and uplift engineered</text>');
    // root zone
    out.push('<path d="M760 210 C720 180 700 150 735 120 C760 100 800 130 800 160" fill="none" stroke="#3f704b" stroke-width="2"/>');
    out.push('<text x="738" y="104" font-family="system-ui, sans-serif" font-size="10" fill="#31573f">root protection zone</text>');
    // notes
    out.push('<text x="34" y="' + (H - 48) + '" font-family="system-ui, sans-serif" font-size="12" fill="#1d392c">Point loads, no slab, no fill and no grade change. Matting and an arborist-reviewed sequence protect roots during construction.</text>');
    out.push('<text x="34" y="' + (H - 28) + '" font-family="system-ui, sans-serif" font-size="11" fill="#3f5a4c">Geotechnical review, frost uplift, corrosion, lateral capacity, slope stability, building permit and conservation-authority approval are required.</text>');
    out.push('<text x="34" y="' + (H - 8) + '" font-family="system-ui, sans-serif" font-size="9" fill="#5e6a58">Conceptual foundation section · not a construction detail · Containers Hamlet Design Lab · CC BY-SA 4.0</text>');
    out.push('</svg>');
    return out.join('');
  }

  /* ---------------- plan drawing ---------------- */

  var ZC = { sleeping: '#c8d7ea', bathroom: '#b9d9d2', kitchen: '#ead7b3', living: '#d8dfbf', dining: '#e5cfa7', work: '#cdc6de', storage: '#ddd4c2', circulation: '#eee8d9' };
  var CC = { timber: '#9a7350', metal: '#7d8587', mixed: '#8b7a5f' };

  function planSVG(design, opts) {
    opts = opts || {};
    var d = Schema.canonicalize(design);
    var b = bounds(d);
    var pad = 90;
    var W = 1040, H = 720;
    var availW = W - 2 * pad, availH = H - 2 * pad - 20;
    var scale = Math.min(availW / Math.max(1, b.width), availH / Math.max(1, b.height));
    var ox = (W - b.width * scale) / 2 - b.minX * scale;
    var oy = (H - b.height * scale) / 2 + 10 - b.minY * scale;
    var P = function (p) { return [ox + p[0] * scale, oy + p[1] * scale]; };
    var path = function (poly, close) { var q = poly.map(P); return 'M' + q.map(function (p) { return n(p[0]) + ' ' + n(p[1]); }).join('L') + (close === false ? '' : 'Z'); };
    var text = function (x, y, s, size, extra) { var a = 'x="' + n(x) + '" y="' + n(y) + '" font-size="' + (size || 12) + '" font-family="system-ui, sans-serif"'; if (!/fill=/.test(extra || '')) a += ' fill="#1d392c"'; return '<text ' + a + (extra || '') + '>' + esc(s) + '</text>'; };
    var pre = opts.idPrefix || 'plan';
    var out = [];
    var planLabels = [];
    var planStoreyLabel = opts.storey === undefined || opts.storey === null || opts.storey === 'all' ? 'all levels' : 'level ' + (Number(opts.storey) + 1);
    var planMetrics = metrics(d);
    var title = d.name + ' concept plan (' + planStoreyLabel + ')';
    var desc = 'Concept plan for ' + d.name + ' showing ' + planStoreyLabel + '. ' + d.modules.length + ' container module' + (d.modules.length === 1 ? '' : 's') + ', ' + planMetrics.groundCoverage_m2 + ' square metres projected ground coverage and ' + planMetrics.grossFloorArea_m2 + ' square metres gross floor area across ' + d.levels.length + ' occupied storey' + (d.levels.length === 1 ? '' : 's') + '. ' + Schema.summary(d).zoneCount + ' interior zones and ' + Schema.summary(d).openingCount + ' openings. Modules on other levels are shown as muted outlines where a single level is selected. Dimensions are nominal container sizes, not verified construction dimensions.';
    out.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" role="' + (opts.interactive ? 'group' : 'img') + '" aria-labelledby="' + pre + '-t ' + pre + '-d"' + (opts.className ? ' class="' + opts.className + '"' : '') + ' data-plan-scale="' + n(scale) + '" data-plan-width="' + W + '"' + '>');
    out.push('<title id="' + pre + '-t">' + esc(title) + '</title><desc id="' + pre + '-d">' + esc(desc) + '</desc>');
    out.push('<defs><marker id="' + pre + '-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" fill="#245a73"/></marker><pattern id="' + pre + '-porch" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#d8e6d3"/><path d="M0 7L7 0" stroke="#6b9277" stroke-width="0.8"/></pattern><pattern id="' + pre + '-deck" width="9" height="5" patternUnits="userSpaceOnUse"><rect width="9" height="5" fill="#d9c3a1"/><path d="M0 2.5H9" stroke="#9a7750" stroke-width="0.7"/></pattern><pattern id="' + pre + '-link" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#e4d7bf"/><path d="M0 6L6 0" stroke="#9a8765" stroke-width="0.7"/></pattern></defs>');
    out.push('<rect width="' + W + '" height="' + H + '" fill="#faf8f2"/>');
    // ground hint
    out.push('<rect x="18" y="18" width="' + (W - 36) + '" height="' + (H - 36) + '" fill="none" stroke="#d8d4c4" stroke-width="1"/>');
    // connections
    d.connections.forEach(function (c) {
      var poly = connectionCorners(c);
      out.push('<path d="' + path(poly) + '" fill="' + (c.glazed ? '#cfe8ec' : 'url(#' + pre + '-link)') + '" fill-opacity="' + (c.glazed ? '0.82' : '1') + '" stroke="' + (c.glazed ? '#2d6b78' : '#7b6a4d') + '" stroke-width="1.5"/>');
      if (c.glazed) {
        for (var gi = 0; gi < poly.length; gi++) {
          var a = P(poly[gi]), b = P(poly[(gi + 1) % poly.length]);
          out.push('<line x1="' + n(a[0]) + '" y1="' + n(a[1]) + '" x2="' + n(b[0]) + '" y2="' + n(b[1]) + '" stroke="#2d6b78" stroke-width="3.2" stroke-dasharray="7 2"/>');
        }
      }
      var cp = P(c.position_m);
      planLabels.push(text(cp[0] - 30, cp[1] + 4, c.glazed ? 'glazed hall' : c.screened ? 'screened link' : 'timber link', 10, ' fill="' + (c.glazed ? '#1f4f60' : '#5c4c34') + '" stroke="#faf8f2" stroke-width="2.4" paint-order="stroke"'));
      if (c.door_type && c.door_type !== 'none') planLabels.push(text(cp[0] - 30, cp[1] + 15, c.door_type.replace(/-/g, ' '), 8, ' fill="#1f4f60" stroke="#faf8f2" stroke-width="2.2" paint-order="stroke"'));
    });
    // decks
    d.decks.forEach(function (dk) {
      var p = porchById(d, dk.porch), m = p && moduleById(d, p.module);
      if (!m) return;
      out.push('<path d="' + path(deckCorners(m, p, dk)) + '" fill="url(#' + pre + '-deck)" stroke="#8a6a44" stroke-width="1"/>');
    });
    // porches
    d.porches.forEach(function (p) {
      var m = moduleById(d, p.module);
      if (!m) return;
      var poly = porchCorners(m, p);
      out.push('<path d="' + path(poly) + '" fill="url(#' + pre + '-porch)" stroke="#4f7d64" stroke-width="1.8"/>');
      var c = P([(poly[0][0] + poly[2][0]) / 2, (poly[0][1] + poly[2][1]) / 2]);
      planLabels.push(text(c[0] - 34, c[1] - 2, (p.screened ? 'screened porch' : 'covered porch'), 10, ' fill="#31573f" stroke="#faf8f2" stroke-width="2.4" paint-order="stroke"'));
      planLabels.push(text(c[0] - 34, c[1] + 12, n(p.length_m) + ' × ' + n(p.depth_m) + ' m', 10, ' fill="#31573f" stroke="#faf8f2" stroke-width="2.4" paint-order="stroke"'));
    });
    // trellises
    (d.trellises || []).forEach(function (t) {
      var m = moduleById(d, t.module);
      if (!m) return;
      var poly = trellisCorners(m, t);
      out.push('<path d="' + path(poly) + '" fill="#cfe0c2" fill-opacity="0.75" stroke="#4f7d64" stroke-width="1" stroke-dasharray="3 2"/>');
      var c = P([(poly[0][0] + poly[2][0]) / 2, (poly[0][1] + poly[2][1]) / 2]);
      planLabels.push(text(c[0] - 22, c[1] + 3, 'trellis', 8, ' fill="#31573f" stroke="#faf8f2" stroke-width="2.2" paint-order="stroke"'));
    });
    // vegetation systems (trellis is handled above for backward compatibility)
    (d.vegetation || []).forEach(function (v) {
      var m = moduleById(d, v.module);
      if (!m) return;
      var poly = vegetationCorners(m, v);
      var fill = v.type === 'living-wall' ? '#6f9d5b' : v.type === 'edible-wall' ? '#b9a45a' : '#315d43';
      out.push('<path d="' + path(poly) + '" fill="' + fill + '" fill-opacity="0.78" stroke="#31573f" stroke-width="1.2"/>');
      var c = P([(poly[0][0] + poly[2][0]) / 2, (poly[0][1] + poly[2][1]) / 2]);
      planLabels.push(text(c[0] - 34, c[1] + 3, VEG_LABEL[v.type] || v.type, 8.5, ' fill="#1d392c" stroke="#faf8f2" stroke-width="2.2" paint-order="stroke"'));
    });
    // modules. A numeric storey shows that floor; other floors stay visible
    // as muted outlines so an upper-floor selection keeps its context.
    var storeyFilter = opts.storey === undefined || opts.storey === null || opts.storey === 'all' ? 'all' : Number(opts.storey);
    var levelCount = d.levels.length;
    d.modules.forEach(function (m) {
      var onFilter = storeyFilter === 'all' || num(m.storey, 0) === storeyFilter;
      var showSolid = storeyFilter === 'all' ? (levelCount === 1 || num(m.storey, 0) === 0) : onFilter;
      var ins = m.insulation.thickness_mm / 1000 + 0.03;
      var outer = [[-m.nominal.length_m / 2 - ins, -m.nominal.width_m / 2 - ins], [m.nominal.length_m / 2 + ins, -m.nominal.width_m / 2 - ins], [m.nominal.length_m / 2 + ins, m.nominal.width_m / 2 + ins], [-m.nominal.length_m / 2 - ins, m.nominal.width_m / 2 + ins]].map(function (q) { return transform(m, q); });
      if (!showSolid) {
        out.push('<path d="' + path(outer) + '" fill="#f1ecdf" fill-opacity="0.55" stroke="#7d8b73" stroke-width="1.4" stroke-dasharray="8 5"/>');
        var mpMuted = moduleCorners(m).map(P);
        var mmx = Math.min.apply(null, mpMuted.map(function (q) { return q[0]; }));
        var mmy = Math.min.apply(null, mpMuted.map(function (q) { return q[1]; }));
        planLabels.push(text(mmx + 2, mmy - 10, m.id.toUpperCase() + ' · LEVEL ' + (num(m.storey, 0) + 1) + ' · outline', 9, ' fill="#6c7a66" font-weight="700" stroke="#faf8f2" stroke-width="2.4" paint-order="stroke"'));
        out.push('<path class="plan-module-hit" data-module-id="' + esc(m.id) + '" d="' + path(moduleCorners(m)) + '" fill="transparent" pointer-events="all" tabindex="0" role="button" aria-pressed="' + (opts.selectedModule === m.id ? 'true' : 'false') + '" aria-describedby="plan-keyboard-help" aria-label="Module ' + esc(m.id) + ', ' + esc(m.type) + ', level ' + (num(m.storey, 0) + 1) + ', shown as a muted outline because another level is being edited."/>');
        return;
      }
      out.push('<path d="' + path(outer) + '" fill="#e9e2ce" stroke="#7d8b73" stroke-width="1"/>');
      if (opts.selectedModule === m.id) out.push('<path class="plan-selected" d="' + path(outer) + '" fill="none" stroke="#b45e1c" stroke-width="4" stroke-dasharray="10 4"/>');
      out.push('<path d="' + path(moduleCorners(m)) + '" fill="#' + (CC[m.cladding.type] || '#9a7350').slice(1) + '" fill-opacity="0.18" stroke="#253a33" stroke-width="2.2" ' + (num(m.storey, 0) > 0 && storeyFilter === 'all' ? 'stroke-dasharray="12 5"' : '') + '/>');
      (m.zones || []).forEach(function (z) {
        var L = m.nominal.length_m, Wd = m.nominal.width_m;
        var zx0 = -L / 2 + z.start_m, zx1 = -L / 2 + z.end_m;
        var poly = [[zx0, -Wd / 2], [zx1, -Wd / 2], [zx1, Wd / 2], [zx0, Wd / 2]].map(function (q) { return transform(m, q); });
        out.push('<path d="' + path(poly) + '" fill="' + (ZC[z.type] || '#e8e2d2') + '" stroke="#8a9a83" stroke-width="0.8"/>');
        var c = P(transform(m, [(zx0 + zx1) / 2, 0]));
        var angle = m.rotation_deg || 0;
        out.push('<g transform="rotate(' + n(angle) + ' ' + n(c[0]) + ' ' + n(c[1]) + ')">' + text(c[0] - 34, c[1] - 2, z.name, 10.5, ' font-weight="700"') + text(c[0] - 34, c[1] + 11, n(z.end_m - z.start_m) + ' × ' + n(Wd - 0.2) + ' m', 9, ' fill="#4f5e49"') + '</g>');
      });
      (m.openings || []).forEach(function (o) {
        var seg = openingSegment(m, o);
        var a = P(seg[0]), b2 = P(seg[1]);
        var colour = o.type === 'window' ? '#1c7ca2' : '#7b4a2b';
        var width = o.type === 'window' ? 7 : 11;
        out.push('<line x1="' + n(a[0]) + '" y1="' + n(a[1]) + '" x2="' + n(b2[0]) + '" y2="' + n(b2[1]) + '" stroke="' + colour + '" stroke-width="' + width + '" stroke-linecap="butt"/>');
        var mid = P(seg[0].map(function (v, i) { return (v + seg[1][i]) / 2; }));
        var nrm = faceNormalWorld(m, o.face), off = 12;
        out.push(text(mid[0] + nrm[0] * off - 8, mid[1] + nrm[1] * off + 4, o.id, 8.5, ' fill="' + colour + '" font-weight="700"'));
      });
      var mp = moduleCorners(m).map(P);
      var mx = Math.min.apply(null, mp.map(function (q) { return q[0]; }));
      var my = Math.min.apply(null, mp.map(function (q) { return q[1]; }));
      out.push(text(mx + 2, my - 26, m.id.toUpperCase() + ' · ' + m.type + ' · L' + (num(m.storey, 0) + 1) + ' @ ' + n(moduleBase(m), 2) + ' m', 10, ' font-weight="800" stroke="#faf8f2" stroke-width="2.6" paint-order="stroke"'));
      if (m.roof.solar && m.solar && m.solar.enabled && !(d.solar_array && d.solar_array.enabled)) {
        var sc = P(m.position_m);
        var sa = (m.solar.azimuth_deg || 180) * DEG;
        var sv = [Math.sin(sa), Math.cos(sa)];
        var sx = sc[0] + sv[0] * 40, sy = sc[1] + sv[1] * 40;
        out.push('<line x1="' + n(sc[0]) + '" y1="' + n(sc[1]) + '" x2="' + n(sx) + '" y2="' + n(sy) + '" stroke="#245a73" stroke-width="2.2" marker-end="url(#' + pre + '-arrow)"/>');
        out.push(text(sx + 4, sy + 4, 'solar ' + n(m.solar.tilt_deg, 0) + '° / ' + n(m.solar.azimuth_deg, 0) + '°', 8, ' fill="#245a73" stroke="#faf8f2" stroke-width="2.2" paint-order="stroke"'));
      }
      out.push('<path class="plan-module-hit" data-module-id="' + esc(m.id) + '" d="' + path(moduleCorners(m)) + '" fill="transparent" pointer-events="all" tabindex="0" role="button" aria-pressed="' + (opts.selectedModule === m.id ? 'true' : 'false') + '" aria-describedby="plan-keyboard-help" aria-label="Module ' + esc(m.id) + ', ' + esc(m.type) + ', level ' + (num(m.storey, 0) + 1) + ', base elevation ' + n(moduleBase(m), 2) + ' metres, at ' + n(m.position_m[0]) + ', ' + n(m.position_m[1]) + ' metres. Select, then drag or use arrow keys to move; R rotates."/>');
    });
    planLabels.forEach(function (label) { out.push(label); });
    if (storeyFilter !== 'all' && !d.modules.some(function (m) { return num(m.storey, 0) === storeyFilter; })) {
      out.push(text(W / 2 - 120, H - 72, 'No modules on this level. Choose another level or add a stacked module.', 12, ' fill="#8f5a21" font-weight="700"'));
    }
    if (d.entry_shelter && d.entry_shelter.enabled) {
      var sm = d.modules[0];
      var sg = shelterGeometry(sm, d.entry_shelter);
      var start = d.entry_shelter.side === 'north' || d.entry_shelter.side === 'south' ? sm.nominal.length_m / 2 - sg.w / 2 : sm.nominal.width_m / 2 - sg.w / 2;
      var sp = outdoorRect(sm, d.entry_shelter.side, start, sg.w, sg.p, 0);
      out.push('<path d="' + path(sp) + '" fill="#3d6654" fill-opacity="0.14" stroke="#245244" stroke-width="1" stroke-dasharray="5 3"/>');
      var sc = P([(sp[0][0] + sp[2][0]) / 2, (sp[0][1] + sp[2][1]) / 2]);
      out.push(text(sc[0] + 3, sc[1] - 3, 'entry shelter', 8, ' fill="#245244" stroke="#faf8f2" stroke-width="2.2" paint-order="stroke"'));
    }
    if (d.roof_form) {
      var rgPlan = roofGeometry(d);
      var rminX = rgPlan.minX, rminY = rgPlan.minY, rmaxX = rgPlan.maxX, rmaxY = rgPlan.maxY;
      var rp = [[rminX, rminY], [rmaxX, rminY], [rmaxX, rmaxY], [rminX, rmaxY]];
      var roofLabel = { gable: 'gable roof', shed: 'shed roof', butterfly: 'butterfly roof', flat: 'flat roof', canopy: 'roof canopy (not occupied)', green: 'green roof concept', 'solar-ready': 'solar-ready shed roof' }[rgPlan.type] || rgPlan.type + ' roof';
      out.push('<path d="' + path(rp) + '" fill="none" stroke="#245244" stroke-width="1.5" stroke-dasharray="7 4"/>');
      if (rgPlan.type === 'gable' || rgPlan.type === 'butterfly') {
        var ridge = (rminY + rmaxY) / 2;
        var rl = P([rminX, ridge]), rr = P([rmaxX, ridge]);
        out.push('<line x1="' + n(rl[0]) + '" y1="' + n(rl[1]) + '" x2="' + n(rr[0]) + '" y2="' + n(rr[1]) + '" stroke="#245244" stroke-width="2" ' + (rgPlan.type === 'butterfly' ? 'stroke-dasharray="4 3"' : '') + '/>');
        if (rgPlan.type === 'butterfly') out.push(text(rl[0] + 6, rl[1] - 6, 'valley / drainage', 8, ' fill="#8f5a21" stroke="#faf8f2" stroke-width="2.2" paint-order="stroke"'));
      }
      if (rgPlan.type === 'shed' || rgPlan.type === 'solar-ready') {
        var lowA = P([rminX + (rmaxX - rminX) * 0.15, rmaxY - 0.5]), lowB = P([rminX + (rmaxX - rminX) * 0.85, rmaxY - 0.5]);
        out.push('<line x1="' + n(lowA[0]) + '" y1="' + n(lowA[1]) + '" x2="' + n(lowB[0]) + '" y2="' + n(lowB[1]) + '" stroke="#245244" stroke-width="2.4" marker-end="url(#' + pre + '-arrow)"/>');
      }
      if (rgPlan.type === 'green') {
        for (var gh = 0; gh < 6; gh++) out.push('<line x1="' + n(P([rminX + 0.4 + gh * (rmaxX - rminX) / 6, rminY + 0.4])[0]) + '" y1="' + n(P([rminX + 0.4 + gh * (rmaxX - rminX) / 6, rminY + 0.4])[1]) + '" x2="' + n(P([rminX + 0.4 + gh * (rmaxX - rminX) / 6, rmaxY - 0.4])[0]) + '" y2="' + n(P([rminX + 0.4 + gh * (rmaxX - rminX) / 6, rmaxY - 0.4])[1]) + '" stroke="#31573f" stroke-width="0.8" stroke-opacity="0.5"/>');
      }
      var sa = (d.solar_array && d.solar_array.azimuth_deg || 180) * DEG;
      var sv = [Math.sin(sa), Math.cos(sa)];
      var saBase = P([(rminX + rmaxX) / 2, rmaxY - 0.8]);
      out.push('<line x1="' + n(saBase[0]) + '" y1="' + n(saBase[1]) + '" x2="' + n(saBase[0] + sv[0] * 48) + '" y2="' + n(saBase[1] + sv[1] * 48) + '" stroke="#245a73" stroke-width="2.4" marker-end="url(#' + pre + '-arrow)"/>');
      out.push(text(W - 40, 122, roofLabel + ' · PV south only', 9, ' text-anchor="end" fill="#245244" stroke="#faf8f2" stroke-width="2.4" paint-order="stroke"'));
      out.push(text(W - 40, 134, 'solar ' + n((d.solar_array && d.solar_array.tilt_deg) || 39, 0) + '° / ' + n((d.solar_array && d.solar_array.azimuth_deg) || 180, 0) + '° · PV', 9, ' text-anchor="end" fill="#245a73" stroke="#faf8f2" stroke-width="2.4" paint-order="stroke"'));
    }
    // dimensions
    var topY = oy + b.minY * scale - 30;
    var leftX = ox + b.minX * scale - 30;
    out.push('<line x1="' + n(ox + b.minX * scale) + '" y1="' + n(topY) + '" x2="' + n(ox + b.maxX * scale) + '" y2="' + n(topY) + '" stroke="#435a4a" stroke-width="1"/>');
    out.push('<text x="' + n(ox + (b.minX + b.maxX) / 2 * scale) + '" y="' + n(topY - 8) + '" text-anchor="middle" font-size="12" font-family="system-ui, sans-serif" fill="#1d392c">' + n(b.width) + ' m overall</text>');
    out.push('<line x1="' + n(leftX) + '" y1="' + n(oy + b.minY * scale) + '" x2="' + n(leftX) + '" y2="' + n(oy + b.maxY * scale) + '" stroke="#435a4a" stroke-width="1"/>');
    out.push(text(leftX - 8, oy + (b.minY + b.maxY) / 2 * scale, n(b.height) + ' m', 12, ' text-anchor="end"'));
    // primary view arrow
    var centre = [ox + (b.minX + b.maxX) / 2 * scale, oy + (b.minY + b.maxY) / 2 * scale];
    if (d.porches.length) {
      var biggest = d.porches.slice().sort(function (a, b) { return b.length_m * b.depth_m - a.length_m * a.depth_m; })[0];
      var pm = moduleById(d, biggest.module);
      if (pm) { var pp = porchCorners(pm, biggest); centre = P([(pp[0][0] + pp[2][0]) / 2, (pp[0][1] + pp[2][1]) / 2]); }
    }
    var az = (d.primary_view_deg || 180) * DEG;
    var vx = Math.sin(az), vy = -Math.cos(az);
    out.push('<line x1="' + n(centre[0]) + '" y1="' + n(centre[1]) + '" x2="' + n(centre[0] + vx * 74) + '" y2="' + n(centre[1] + vy * 74) + '" stroke="#3f5f8a" stroke-width="2" stroke-dasharray="5 4"/>');
    out.push('<circle cx="' + n(centre[0] + vx * 74) + '" cy="' + n(centre[1] + vy * 74) + '" r="5" fill="#3f5f8a"/>');
    out.push(text(centre[0] + vx * 82 - 18, centre[1] + vy * 82 + 4, 'primary view', 10, ' fill="#3f5f8a" font-weight="700"'));
    // compass and scale
    out.push('<g aria-hidden="true"><circle cx="' + (W - 44) + '" cy="44" r="23" fill="#fffdf7" stroke="#b9c3b2"/><path d="M' + (W - 44) + ' 27l6 32l-6 -8l-6 8z" fill="#1d392c"/><text x="' + (W - 44) + '" y="78" text-anchor="middle" font-size="11" font-weight="700" font-family="system-ui, sans-serif" fill="#1d392c">N</text></g>');
    var sb = 5 * scale;
    out.push('<g font-family="system-ui, sans-serif" font-size="10" fill="#1d392c"><rect x="30" y="' + (H - 34) + '" width="' + n(sb) + '" height="4" fill="#1d392c"/><rect x="' + n(30 + sb) + '" y="' + (H - 34) + '" width="' + n(sb) + '" height="4" fill="#fff" stroke="#1d392c" stroke-width="0.7"/><text x="30" y="' + (H - 42) + '">0</text><text x="' + n(30 + sb) + '" y="' + (H - 42) + '">5</text><text x="' + n(30 + 2 * sb) + '" y="' + (H - 42) + '">10 m</text></g>');
    out.push('<text x="30" y="' + (H - 14) + '" font-family="system-ui, sans-serif" font-size="9" fill="#5e6a58">Concept plan · nominal container geometry · not for construction · Containers Hamlet Design Lab · CC BY-SA 4.0</text>');
    out.push('</svg>');
    return out.join('');
  }

  /* ---------------- axonometric / cutaway ---------------- */

  function project(p) {
    var C = Math.cos(Math.PI / 6), S = 0.5;
    return [(p[0] - p[1]) * C, (p[0] + p[1]) * S - p[2] * 1.28];
  }
  function shade(hex, f) {
    var c = [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
    return '#' + c.map(function (v) { return ('0' + Math.max(0, Math.min(255, Math.round(v * f))).toString(16)).slice(-2); }).join('');
  }
  function mix(hex, other, t) {
    var a = [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
    var b = [parseInt(other.slice(1, 3), 16), parseInt(other.slice(3, 5), 16), parseInt(other.slice(5, 7), 16)];
    return '#' + a.map(function (v, i) { return ('0' + Math.round(v + (b[i] - v) * t).toString(16)).slice(-2); }).join('');
  }
  function boxFaces(cx, cy, L, W, z0, z1, deg) {
    var c = Math.cos(deg * DEG), s = Math.sin(deg * DEG);
    var tr = function (x, y) { return [cx + x * c - y * s, cy + x * s + y * c]; };
    var q = [[-L / 2, -W / 2], [L / 2, -W / 2], [L / 2, W / 2], [-L / 2, W / 2]].map(function (pp) { var t = tr(pp[0], pp[1]); return t; });
    var v = [
      [q[0][0], q[0][1], z0], [q[1][0], q[1][1], z0], [q[2][0], q[2][1], z0], [q[3][0], q[3][1], z0],
      [q[0][0], q[0][1], z1], [q[1][0], q[1][1], z1], [q[2][0], q[2][1], z1], [q[3][0], q[3][1], z1]
    ];
    var nr = function (vx, vy) { return [vx * c - vy * s, vx * s + vy * c, 0]; };
    return [
      { i: [4, 5, 6, 7], n: [0, 0, 1], name: 'top' },
      { i: [0, 1, 5, 4], n: nr(0, -1), name: 'north' },
      { i: [3, 2, 6, 7], n: nr(0, 1), name: 'south' },
      { i: [0, 3, 7, 4], n: nr(-1, 0), name: 'west' },
      { i: [1, 2, 6, 5], n: nr(1, 0), name: 'east' },
      { i: [0, 1, 2, 3], n: [0, 0, -1], name: 'bottom' }
    ].map(function (f) { return { pts: f.i.map(function (i) { return v[i]; }), normal: f.n, name: f.name }; });
  }
  function polyScreen(points, S) { return points.map(function (p) { var q = S(p); return n(q[0]) + ' ' + n(q[1]); }).join(' '); }
  function visible(f) { return f.normal[0] * 1 + f.normal[1] * 1 + f.normal[2] * 1 > 0.001; }

  function panelGridSVG(corners, cols, rows, S) {
    var p0 = corners[0], p1 = corners[1], p2 = corners[2], p3 = corners[3];
    function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
    function at(u, v) { return mix(mix(p0, p1, u), mix(p3, p2, u), v); }
    var out = '<path d="M' + polyScreen(corners, S) + 'Z" fill="#123b4d" stroke="#0d2a36" stroke-width="1"/>';
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var u0 = c / cols + 0.018, u1 = (c + 1) / cols - 0.018;
        var v0 = r / rows + 0.028, v1 = (r + 1) / rows - 0.028;
        var q = [at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)];
        out += '<path d="M' + polyScreen(q, S) + 'Z" fill="' + ((r + c) % 2 ? '#245a73' : '#2f6d88') + '" stroke="#9fc9d6" stroke-width="0.65"/>';
      }
    }
    return out;
  }

  function axoSVG(design, opts) {
    opts = opts || {};
    var d = Schema.canonicalize(design);
    var b = bounds(d);
    var cut = opts.mode === 'cutaway';
    var winter = opts.season === 'winter';
    var focus = opts.focus === 'outdoor';
    var extend = 9;
    var minX = b.minX - extend, maxX = b.maxX + extend, minY = b.minY - extend, maxY = b.maxY + extend;
    var W = 1040, H = 700;
    var corners = [[minX, minY, 0], [maxX, minY, 0], [maxX, maxY, 0], [minX, maxY, 0]];
    var sp = corners.map(project);
    var minSX = Math.min.apply(null, sp.map(function (p) { return p[0]; })), maxSX = Math.max.apply(null, sp.map(function (p) { return p[0]; }));
    var minSY = Math.min.apply(null, sp.map(function (p) { return p[1]; })), maxSY = Math.max.apply(null, sp.map(function (p) { return p[1]; }));
    var scale = Math.min((W - 90) / Math.max(1, maxSX - minSX), (H - 120) / Math.max(1, maxSY - minSY));
    var ox = (W - (maxSX - minSX) * scale) / 2 - minSX * scale;
    var oy = (H - (maxSY - minSY) * scale) / 2 - minSY * scale + 24;
    var S = function (p) { var q = project(p); return [ox + q[0] * scale, oy + q[1] * scale]; };
    var viewBox = '0 0 ' + W + ' ' + H;
    if (focus) {
      var focusPolys = [];
      d.porches.forEach(function (p) { var m = moduleById(d, p.module); if (m) { focusPolys.push(porchCorners(m, p)); focusPolys.push(moduleCorners(m)); } });
      d.decks.forEach(function (dk) { var p = porchById(d, dk.porch), m = p && moduleById(d, p.module); if (m) focusPolys.push(deckCorners(m, p, dk)); });
      (d.trellises || []).forEach(function (t) { var m = moduleById(d, t.module); if (m) focusPolys.push(trellisCorners(m, t)); });
      if (focusPolys.length) {
        var fminX = Infinity, fminY = Infinity, fmaxX = -Infinity, fmaxY = -Infinity;
        focusPolys.forEach(function (poly) {
          poly.forEach(function (p) {
            [0, 3.2].forEach(function (z) {
              var q = S([p[0], p[1], z]);
              fminX = Math.min(fminX, q[0]); fmaxX = Math.max(fmaxX, q[0]);
              fminY = Math.min(fminY, q[1]); fmaxY = Math.max(fmaxY, q[1]);
            });
          });
        });
        var pad = 34;
        var fx = Math.max(0, fminX - pad), fy = Math.max(0, fminY - pad);
        var fw = Math.max(260, fmaxX - fminX + pad * 2), fh = Math.max(220, fmaxY - fminY + pad * 2);
        viewBox = n(fx) + ' ' + n(fy) + ' ' + n(fw) + ' ' + n(fh);
      }
    }
    var pre = opts.idPrefix || (cut ? 'cutaway' : winter ? 'winter' : focus ? 'outdoor' : 'exterior');
    var title = d.name + (cut ? ' roof-off cutaway' : focus ? ' porch and deck detail' : winter ? ' winter exterior concept' : ' exterior concept');
    var aig = metrics(d);
    var desc = (cut ? 'Roof-off cutaway' : focus ? 'Screened porch and deck detail' : winter ? 'Winter exterior axonometric' : 'Exterior axonometric') + ' of ' + d.name + ', ' + d.modules.length + ' container module' + (d.modules.length === 1 ? '' : 's') + ' across ' + d.levels.length + ' occupied storey' + (d.levels.length === 1 ? '' : 's') + ', ' + n(aig.buildingHeight_m, 2) + ' metres to the roof. Upper modules are drawn at their explicit elevations. The view is generated from the same three-dimensional geometry as the plans, elevations and section and uses no WebGL. Conceptual only.';
    var out = [];
    out.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + viewBox + '" role="img" aria-labelledby="' + pre + '-t ' + pre + '-d"' + (opts.className ? ' class="' + opts.className + '"' : '') + ' data-plan-scale="' + n(scale) + '" data-plan-width="' + W + '"' + '>');
    out.push('<title id="' + pre + '-t">' + esc(title) + '</title><desc id="' + pre + '-d">' + esc(desc) + '</desc>');
    out.push('<defs><linearGradient id="' + pre + '-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + (winter ? '#e6edf1' : '#eef0e4') + '"/><stop offset="1" stop-color="' + (winter ? '#f3f5f2' : '#dce4d0') + '"/></linearGradient></defs>');
    out.push('<rect width="' + W + '" height="' + H + '" fill="url(#' + pre + '-sky)"/>');
    // ground
    var g = corners.map(function (p) { return S([p[0], p[1], -0.15]); });
    out.push('<path d="M' + g.map(function (p) { return n(p[0]) + ' ' + n(p[1]); }).join('L') + 'Z" fill="' + (winter ? '#e4e9e5' : '#cdd8bc') + '" stroke="' + (winter ? '#c2cdc8' : '#a8b698') + '" stroke-width="1.5"/>');
    // rocks and trees (deterministic, outside the footprint)
    var seed = (d.visual_seed || 23) + (opts.seed || 0);
    var rnd = (function (a) { return function () { a = (a + 0x6d2b79f5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })(seed);
    var trees = [];
    for (var i = 0; i < 16; i++) {
      var tx = minX + 1 + rnd() * (maxX - minX - 2), ty = minY + 1 + rnd() * (maxY - minY - 2);
      var inside = d.modules.some(function (m) { return pointInPoly([tx, ty], moduleCorners(m)); });
      if (inside) continue;
      var dd = Math.hypot(tx - (b.minX + b.maxX) / 2, ty - (b.minY + b.maxY) / 2);
      if (dd < Math.max(5, b.width / 2 + 1)) continue;
      trees.push({ x: tx, y: ty, h: 3.5 + rnd() * 4.5, type: rnd() < 0.7 ? 'conifer' : 'deciduous', depth: tx + ty });
      if (winter && trees.length >= 7) break;
    }
    var objects = [];
    d.connections.forEach(function (c) {
      objects.push({ kind: 'box', depth: c.position_m[0] + c.position_m[1], draw: function () {
        var faces = boxFaces(c.position_m[0], c.position_m[1], c.length_m, c.width_m, 0.25, cut ? 1.2 : 2.65, c.rotation_deg || 0);
        var s = '';
        faces.filter(visible).forEach(function (f) {
          var isTop = f.name === 'top';
          s += '<path d="M' + polyScreen(f.pts, S) + 'Z" fill="' + (isTop ? '#8d7a5d' : '#c0aa86') + '" stroke="#5e4d38" stroke-width="0.8"/>';
        });
        if (c.screened) s += '<path d="M' + polyScreen(faces[2].pts, S) + 'Z" fill="#6b9277" fill-opacity="0.18" stroke="#4f7d64" stroke-width="1"/>';
        if (c.glazed) {
          faces.filter(visible).forEach(function (f) {
            if (f.name === 'top' || f.name === 'bottom') return;
            s += '<path d="M' + polyScreen(f.pts, S) + 'Z" fill="#bfe4ea" fill-opacity="0.72" stroke="' + (c.frame_colour || '#23616e') + '" stroke-width="2"/>';
            for (var mi = 1; mi < 5; mi++) { var mt = mi / 5; var ma = [f.pts[0][0] + (f.pts[1][0] - f.pts[0][0]) * mt, f.pts[0][1] + (f.pts[1][1] - f.pts[0][1]) * mt, f.pts[0][2]], mb = [f.pts[3][0] + (f.pts[2][0] - f.pts[3][0]) * mt, f.pts[3][1] + (f.pts[2][1] - f.pts[3][1]) * mt, f.pts[3][2]]; s += '<line x1="' + n(S(ma)[0]) + '" y1="' + n(S(ma)[1]) + '" x2="' + n(S(mb)[0]) + '" y2="' + n(S(mb)[1]) + '" stroke="' + (c.frame_colour || '#23616e') + '" stroke-width="1.2"/>'; }
          });
        }
        return s;
      } });
    });
    d.decks.forEach(function (dk) {
      var p = porchById(d, dk.porch), m = p && moduleById(d, p.module);
      if (!m) return;
      var poly = deckCorners(m, p, dk);
      var p3 = poly.map(function (q) { return [q[0], q[1], 0.24]; });
      objects.push({ kind: 'deck', depth: (poly[0][0] + poly[2][0]) / 2 + (poly[0][1] + poly[2][1]) / 2, draw: function () {
        return '<path d="M' + polyScreen(p3, S) + 'Z" fill="#c3a276" stroke="#8a6a44" stroke-width="1"/>';
      } });
    });
    (d.trellises || []).forEach(function (t) {
      var m = moduleById(d, t.module);
      if (!m) return;
      var poly = trellisCorners(m, t);
      var z0 = 0.3, z1 = Math.max(z0 + 0.5, t.height_m);
      var low = poly.map(function (p) { return [p[0], p[1], z0]; });
      var high = poly.map(function (p) { return [p[0], p[1], z1]; });
      var depth = (poly[0][0] + poly[2][0]) / 2 + (poly[0][1] + poly[2][1]) / 2;
      objects.push({ kind: 'trellis', depth: depth, draw: function () {
        var s = '<path d="M' + polyScreen(low, S) + 'Z" fill="#9ab886" fill-opacity="0.3" stroke="#4f7d64" stroke-width="0.8"/>';
        s += '<path d="M' + polyScreen(high, S) + 'Z" fill="#6f9d5b" fill-opacity="0.28" stroke="#4f7d64" stroke-width="0.8"/>';
        for (var k = 0; k < poly.length; k++) s += '<path d="M' + n(S(low[k])[0]) + ' ' + n(S(low[k])[1]) + 'L' + n(S(high[k])[0]) + ' ' + n(S(high[k])[1]) + '" stroke="#4f7d64" stroke-width="0.9"/>';
        return s;
      } });
    });
    (d.vegetation || []).forEach(function (v) {
      var m = moduleById(d, v.module);
      if (!m) return;
      var poly = vegetationCorners(m, v);
      var z0 = 0.25, z1 = Math.max(0.8, v.height_m);
      var low = poly.map(function (p) { return [p[0], p[1], z0]; });
      var high = poly.map(function (p) { return [p[0], p[1], z1]; });
      var depth = (poly[0][0] + poly[2][0]) / 2 + (poly[0][1] + poly[2][1]) / 2;
      objects.push({ kind: 'vegetation', depth: 1000 + depth, draw: function () {
        var s = '';
        if (v.type === 'privacy-screen') {
          var posts = [0, 0.33, 0.66, 1];
          posts.forEach(function (t) { var p = [low[0][0] + (low[1][0] - low[0][0]) * t, low[0][1] + (low[1][1] - low[0][1]) * t, 0]; var q = S(p); s += '<line x1="' + n(q[0]) + '" y1="' + n(q[1]) + '" x2="' + n(q[0]) + '" y2="' + n(q[1] - z1 * 1.28) + '" stroke="#5b4a35" stroke-width="4"/>'; });
          for (var pe = 0; pe < 4; pe++) {
            s += '<path d="M' + polyScreen([low[pe], low[(pe + 1) % 4], high[(pe + 1) % 4], high[pe]], S) + 'Z" fill="' + (winter ? '#315d43' : '#3f704b') + '" fill-opacity="0.92" stroke="#25452f" stroke-width="0.9"/>';
          }
          s += '<path d="M' + polyScreen(high, S) + 'Z" fill="' + (winter ? '#315d43' : '#3f704b') + '" fill-opacity="0.8" stroke="#25452f" stroke-width="1"/>';
        } else {
          var fill = v.type === 'living-wall' ? '#6f9d5b' : '#b9a45a';
          if (winter && v.seasonal_foliage === 'deciduous') fill = '#8b7a55';
          if (winter && v.type === 'living-wall') fill = '#5b7d55';
          for (var e = 0; e < 4; e++) {
            s += '<path d="M' + polyScreen([low[e], low[(e + 1) % 4], high[(e + 1) % 4], high[e]], S) + 'Z" fill="' + fill + '" fill-opacity="0.9" stroke="#31573f" stroke-width="1"/>';
          }
          s += '<path d="M' + polyScreen(high, S) + 'Z" fill="' + fill + '" fill-opacity="0.65" stroke="#31573f" stroke-width="0.8"/>';
          for (var k = 0; k < 6; k++) {
            var t = k / 5;
            var a = [high[0][0] + (high[1][0] - high[0][0]) * t, high[0][1] + (high[1][1] - high[0][1]) * t, z1 + 0.12];
            var q = S(a);
            if (winter && v.seasonal_foliage === 'deciduous') {
              s += '<line x1="' + n(q[0]) + '" y1="' + n(q[1]) + '" x2="' + n(q[0] - 3) + '" y2="' + n(q[1] - 12) + '" stroke="#7b6344" stroke-width="1.5"/><line x1="' + n(q[0]) + '" y1="' + n(q[1]) + '" x2="' + n(q[0] + 4) + '" y2="' + n(q[1] - 9) + '" stroke="#7b6344" stroke-width="1.2"/>';
            } else {
              var plant = v.type === 'living-wall' ? (winter ? '#5b7d55' : '#3f704b') : '#4f7d64';
              s += '<circle cx="' + n(q[0]) + '" cy="' + n(q[1]) + '" r="6" fill="' + plant + '"/><circle cx="' + n(q[0] + 5) + '" cy="' + n(q[1] + 2) + '" r="4" fill="' + plant + '" opacity="0.8"/>';
            }
          }
        }
        return s;
      } });
    });
    if (!cut && d.roof_form) {
      var rg = roofGeometry(d);
      var rminX = rg.minX, rminY = rg.minY, rmaxX = rg.maxX, rmaxY = rg.maxY;
      var zEave = rg.base_m + 0.12;
      var isGable = rg.type === 'gable';
      var isButterfly = rg.type === 'butterfly';
      var isShed = rg.type === 'shed' || rg.type === 'solar-ready';
      var isFlat = rg.type === 'flat' || rg.type === 'green' || rg.type === 'canopy';
      var ridgeY = (rminY + rmaxY) / 2;
      var depth = Math.max(0.01, rmaxY - rminY);
      var pitchRad = rg.pitch_deg * Math.PI / 180;
      var zRidge = zEave + (isGable || isButterfly ? depth / 2 : depth) * Math.tan(pitchRad);
      var zValley = zEave - (isButterfly ? (depth / 2) * Math.tan(pitchRad) * 0.45 : 0);
      var zAtSouth = function (y) {
        if (isGable) return zEave + (rmaxY - y) / Math.max(0.01, rmaxY - ridgeY) * (zRidge - zEave);
        if (isButterfly) return y >= ridgeY ? zValley + (y - ridgeY) / Math.max(0.01, rmaxY - ridgeY) * (zEave - zValley) : zValley + (ridgeY - y) / Math.max(0.01, ridgeY - rminY) * (zEave - zValley);
        if (isShed) return zEave + (rmaxY - y) / depth * (zRidge - zEave);
        return zEave + 0.3;
      };
      var roofWinter = winter;
      objects.push({ kind: 'roof', depth: (rminX + rmaxX + rminY + rmaxY) / 2 + 1.2, draw: function () {
        var col = roofWinter ? '#e7ece7' : (d.roof_form.colour || '#245244');
        var rs = '';
        if (isGable) {
          var south = [[rminX, rmaxY, zEave], [rmaxX, rmaxY, zEave], [rmaxX, ridgeY, zRidge], [rminX, ridgeY, zRidge]];
          var north = [[rminX, ridgeY, zRidge], [rmaxX, ridgeY, zRidge], [rmaxX, rminY, zEave], [rminX, rminY, zEave]];
          rs += '<path d="M' + polyScreen(south, S) + 'Z" fill="' + col + '" fill-opacity="0.98" stroke="#17392e" stroke-width="1.4"/>';
          rs += '<path d="M' + polyScreen(north, S) + 'Z" fill="' + (roofWinter ? '#d7e0d7' : '#1f4a3d') + '" fill-opacity="0.98" stroke="#17392e" stroke-width="1.4"/>';
          rs += '<path d="M' + polyScreen([[rminX, ridgeY, zRidge], [rmaxX, ridgeY, zRidge]], S) + '" stroke="#17392e" stroke-width="3"/>';
        } else if (isButterfly) {
          var upS = [[rminX, rmaxY, zEave], [rmaxX, rmaxY, zEave], [rmaxX, ridgeY, zValley], [rminX, ridgeY, zValley]];
          var upN = [[rminX, rminY, zEave], [rmaxX, rminY, zEave], [rmaxX, ridgeY, zValley], [rminX, ridgeY, zValley]];
          rs += '<path d="M' + polyScreen(upS, S) + 'Z" fill="' + col + '" fill-opacity="0.98" stroke="#17392e" stroke-width="1.4"/>';
          rs += '<path d="M' + polyScreen(upN, S) + 'Z" fill="' + (roofWinter ? '#d7e0d7' : '#1f4a3d') + '" fill-opacity="0.98" stroke="#17392e" stroke-width="1.4"/>';
          rs += '<path d="M' + polyScreen([[rminX, ridgeY, zValley], [rmaxX, ridgeY, zValley]], S) + '" stroke="#8f5a21" stroke-width="2.4" stroke-dasharray="5 3"/>';
          rs += '<text x="' + n(S([rminX + 0.6, ridgeY, zValley])[0]) + '" y="' + n(S([rminX + 0.6, ridgeY, zValley])[1]) + '" font-family="system-ui, sans-serif" font-size="9" font-weight="800" fill="#8f5a21">valley drainage</text>';
        } else if (isShed) {
          var shed = [[rminX, rmaxY, zEave], [rmaxX, rmaxY, zEave], [rmaxX, rminY, zRidge], [rminX, rminY, zRidge]];
          rs += '<path d="M' + polyScreen(shed, S) + 'Z" fill="' + col + '" fill-opacity="0.97" stroke="#17392e" stroke-width="1.4"/>';
          rs += '<path d="M' + polyScreen([shed[0], shed[1]], S) + '" stroke="#17392e" stroke-width="3"/>';
          rs += '<path d="M' + polyScreen([shed[2], shed[3]], S) + '" stroke="#17392e" stroke-width="2"/>';
        } else {
          var flat = [[rminX, rminY, zEave + 0.3], [rmaxX, rminY, zEave + 0.3], [rmaxX, rmaxY, zEave + 0.3], [rminX, rmaxY, zEave + 0.3]];
          rs += '<path d="M' + polyScreen(flat, S) + 'Z" fill="' + col + '" fill-opacity="0.97" stroke="#17392e" stroke-width="1.4"/>';
          if (rg.type === 'green') {
            for (var gi2 = 0; gi2 < 7; gi2++) {
              var gx = rminX + 0.5 + gi2 * (rmaxX - rminX - 1) / 6;
              rs += '<circle cx="' + n(S([gx, (rminY + rmaxY) / 2, zEave + 0.32])[0]) + '" cy="' + n(S([gx, (rminY + rmaxY) / 2, zEave + 0.32])[1]) + '" r="3" fill="#3f704b" fill-opacity="0.8"/>';
            }
          }
          rs += '<text x="' + n(S([(rminX + rmaxX) / 2, (rminY + rmaxY) / 2, zEave + 0.32])[0]) + '" y="' + n(S([(rminX + rmaxX) / 2, (rminY + rmaxY) / 2, zEave + 0.32])[1]) + '" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9" font-weight="800" fill="#faf8f2" stroke="#17392e" stroke-width="2.2" paint-order="stroke">' + esc(rg.type === 'canopy' ? 'roof canopy · not occupied' : rg.type === 'green' ? 'green roof concept' : 'flat roof · drainage to review') + '</text>';
        }
        return rs;
      } });
      if (d.solar_array && d.solar_array.enabled && !isFlat) {
        var tilt = Math.max(0, Math.min(75, d.solar_array.tilt_deg || 39));
        var pdl = Math.min(7.0, (rmaxX - rminX) * 0.72);
        var southRun = isGable ? rmaxY - ridgeY : rmaxY - rminY;
        var pdd = Math.min(1.8, southRun * 0.42);
        var cx = (rminX + rmaxX) / 2, yLow = rmaxY - 0.85, yHigh = yLow - pdd;
        var zLow = zAtSouth(yLow) + 0.22;
        var zHigh = zAtSouth(yHigh) + 0.22 + pdd * Math.tan(tilt * Math.PI / 180);
        var pCorners = [[cx - pdl / 2, yLow, zLow], [cx + pdl / 2, yLow, zLow], [cx + pdl / 2, yHigh, zHigh], [cx - pdl / 2, yHigh, zHigh]];
        objects.push({ kind: 'solar-array', depth: 2000, draw: function () {
          var ps = panelGridSVG(pCorners, 3, 2, S);
          ps += '<text x="' + n(S([cx, (yLow + yHigh) / 2, (zLow + zHigh) / 2])[0]) + '" y="' + n(S([cx, (yLow + yHigh) / 2, (zLow + zHigh) / 2])[1]) + '" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#eaf6f9" stroke="#123b4d" stroke-width="2.4" paint-order="stroke">PV ' + n(tilt, 0) + '° / ' + n(d.solar_array.azimuth_deg || 180, 0) + '°</text>';
          return ps;
        } });
      }
    }
    d.porches.forEach(function (p) {
      var m = moduleById(d, p.module);
      if (!m) return;
      var poly = porchCorners(m, p);
      var p3 = poly.map(function (q) { return [q[0], q[1], 0.24]; });
      var top = poly.map(function (q) { return [q[0], q[1], 2.65]; });
      objects.push({ kind: 'porch', depth: (poly[0][0] + poly[2][0]) / 2 + (poly[0][1] + poly[2][1]) / 2, draw: function () {
        var s = '<path d="M' + polyScreen(p3, S) + 'Z" fill="#b9976a" stroke="#806040" stroke-width="1"/>';
        if (!cut && p.roof) s += '<path d="M' + polyScreen(top, S) + 'Z" fill="#6d5b49" stroke="#4f4337" stroke-width="1"/>';
        if (p.screened) {
          for (var k = 0; k < poly.length; k++) {
            var a = poly[k], b2 = poly[(k + 1) % poly.length];
            s += '<path d="M' + n(S([a[0], a[1], 0.24])[0]) + ' ' + n(S([a[0], a[1], 0.24])[1]) + 'L' + n(S([b2[0], b2[1], 2.5])[0]) + ' ' + n(S([b2[0], b2[1], 2.5])[1]) + '" stroke="#5e8069" stroke-width="0.6" stroke-opacity="0.7"/>';
          }
        }
        return s;
      } });
    });
    d.modules.forEach(function (m) {
      var centreDepth = m.position_m[0] + m.position_m[1];
      objects.push({ kind: 'module', depth: centreDepth, draw: function () { return moduleDraw(d, m, cut, S, winter); } });
    });
    // trees behind, objects, trees in front
    var drawTree = function (t) {
      var base = S([t.x, t.y, 0]), top = S([t.x, t.y, t.h]);
      var h = base[1] - top[1], w = h * 0.32;
      if (winter && t.type !== 'conifer') {
        return '<g stroke="#5b5144" stroke-width="1.6" stroke-linecap="round">' +
          '<path d="M' + n(base[0]) + ' ' + n(base[1]) + 'L' + n(base[0]) + ' ' + n(base[1] - h * 0.72) + '"/>' +
          '<path d="M' + n(base[0]) + ' ' + n(base[1] - h * 0.45) + 'L' + n(base[0] - w * 0.65) + ' ' + n(base[1] - h * 0.68) + '"/>' +
          '<path d="M' + n(base[0]) + ' ' + n(base[1] - h * 0.52) + 'L' + n(base[0] + w * 0.7) + ' ' + n(base[1] - h * 0.75) + '"/>' +
          '<path d="M' + n(base[0]) + ' ' + n(base[1] - h * 0.62) + 'L' + n(base[0] - w * 0.55) + ' ' + n(base[1] - h * 0.86) + '"/>' +
          '<path d="M' + n(base[0]) + ' ' + n(base[1] - h * 0.56) + 'L' + n(base[0] + w * 0.5) + ' ' + n(base[1] - h * 0.86) + '"/>' +
          '</g>';
      }
      if (t.type === 'conifer') {
        var tree = '<g fill="#3d5d48" fill-opacity="0.92"><path d="M' + n(base[0]) + ' ' + n(base[1]) + 'L' + n(base[0] + w) + ' ' + n(base[1] - h * 0.55) + 'L' + n(base[0] + w * 0.5) + ' ' + n(base[1] - h * 0.55) + 'L' + n(base[0] + w * 0.8) + ' ' + n(base[1] - h * 0.8) + 'L' + n(base[0] + w * 0.35) + ' ' + n(base[1] - h * 0.8) + 'L' + n(base[0]) + ' ' + n(base[1] - h) + 'L' + n(base[0] - w * 0.35) + ' ' + n(base[1] - h * 0.8) + 'L' + n(base[0] - w * 0.8) + ' ' + n(base[1] - h * 0.8) + 'L' + n(base[0] - w * 0.5) + ' ' + n(base[1] - h * 0.55) + 'L' + n(base[0] - w) + ' ' + n(base[1] - h * 0.55) + 'Z"/></g>';
        if (winter) tree += '<g fill="#f4f6f3" fill-opacity="0.8"><path d="M' + n(base[0]) + ' ' + n(base[1] - h * 0.95) + 'l' + n(w * 0.28) + ' ' + n(h * 0.16) + 'l-' + n(w * 0.56) + ' 0Z"/></g>';
        return tree;
      }
      return '<g fill="#78935f" fill-opacity="0.92"><circle cx="' + n(base[0]) + '" cy="' + n(base[1] - h * 0.7) + '" r="' + n(w * 1.1) + '"/><circle cx="' + n(base[0] - w * 0.6) + '" cy="' + n(base[1] - h * 0.55) + '" r="' + n(w * 0.8) + '"/><circle cx="' + n(base[0] + w * 0.55) + '" cy="' + n(base[1] - h * 0.58) + '" r="' + n(w * 0.75) + '"/></g>';
    };
    if (!focus) trees.filter(function (t) { return t.depth <= (b.minX + b.maxX + b.minY + b.maxY) / 2; }).forEach(function (t) { out.push(drawTree(t)); });
    objects.sort(function (a, c) { return a.depth - c.depth; }).forEach(function (o) { out.push(o.draw()); });
    if (!focus) trees.filter(function (t) { return t.depth > (b.minX + b.maxX + b.minY + b.maxY) / 2; }).forEach(function (t) { out.push(drawTree(t)); });
    // labels
    var label = cut ? 'Roof-off cutaway · interior zones visible' : focus ? 'Screened porch and deck detail · cropped from the same geometry' : winter ? 'Winter concept · same geometry, winter setting' : 'Exterior concept · timber, metal, glass and screened outdoor rooms';
    out.push('<text x="30" y="46" font-family="system-ui, sans-serif" font-size="22" font-weight="800" fill="#1d392c">' + esc(d.name) + '</text>');
    out.push('<text x="30" y="68" font-family="system-ui, sans-serif" font-size="12" fill="#40583f">' + esc(label) + '</text>');
    if (focus) out.push('<text x="' + (parseFloat(viewBox.split(' ')[0]) + 20) + '" y="' + (parseFloat(viewBox.split(' ')[1]) + 24) + '" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#1d392c">Screened porch and deck detail</text>');
    out.push('<g aria-hidden="true"><circle cx="' + (W - 44) + '" cy="44" r="22" fill="#fffdf7" fill-opacity="0.9" stroke="#b9c3b2"/><path d="M' + (W - 44) + ' 28l6 30l-6 -8l-6 8z" fill="#1d392c"/><text x="' + (W - 44) + '" y="76" text-anchor="middle" font-size="10" font-weight="700" font-family="system-ui, sans-serif" fill="#1d392c">N</text></g>');
    out.push('<text x="30" y="' + (H - 18) + '" font-family="system-ui, sans-serif" font-size="10" fill="#5e6a58">Illustrative concept · shadows are illustrative, not a solar or overshadowing study · generated from the same geometry · not for construction · Containers Hamlet Design Lab · CC BY-SA 4.0</text>');
    out.push('</svg>');
    return out.join('');
  }

  /* ---------------- elevations, sections, exploded view, solar study ---------------- */

  function roofProfile(rg, axis) {
    var w = axis === 'x' ? rg.width : rg.depth;
    var eave = rg.base_m + 0.12;
    var top = rg.top_m;
    var valley = eave - (rg.depth / 2) * Math.tan(rg.pitch_deg * Math.PI / 180) * 0.45;
    if (axis === 'x') return { points: [[0, eave], [w, eave], [w, top], [0, top]], eave: eave, top: top, w: w };
    if (rg.type === 'gable') return { points: [[0, eave], [w / 2, top], [w, eave]], eave: eave, top: top, w: w };
    if (rg.type === 'butterfly') return { points: [[0, eave], [w / 2, valley], [w, eave]], eave: eave, top: eave, valley: valley, w: w };
    if (rg.type === 'shed' || rg.type === 'solar-ready') return { points: [[0, eave], [w, top], [w, top + 0.16], [0, eave + 0.16]], eave: eave, top: top, w: w };
    if (rg.type === 'canopy') return { points: [[0, eave + 0.25], [w, eave + 0.25], [w, eave], [0, eave]], eave: eave, top: top, w: w };
    return { points: [[0, eave], [w, eave], [w, eave + 0.3], [0, eave + 0.3]], eave: eave, top: top, w: w };
  }

  function elevationSVG(design, opts) {
    opts = opts || {};
    var d = Schema.canonicalize(design);
    var side = ['north', 'south', 'east', 'west'].indexOf(opts.side) >= 0 ? opts.side : 'south';
    var boxes = d.modules.map(moduleBox3D);
    var rg = roofGeometry(d);
    var uValues = [];
    boxes.forEach(function (b) { b.corners.forEach(function (p) { uValues.push(side === 'east' || side === 'west' ? p[1] : p[0]); }); });
    if (!uValues.length) uValues = [0, 1];
    var uMin = Math.min.apply(null, uValues), uMax = Math.max.apply(null, uValues);
    if (side === 'east' || side === 'west') { uMin = Math.min(uMin, rg.minY); uMax = Math.max(uMax, rg.maxY); }
    else { uMin = Math.min(uMin, rg.minX); uMax = Math.max(uMax, rg.maxX); }
    var zMax = Math.max(rg.top_m, 4.2) + 1.0;
    var W = 1040, H = 720, pad = 96;
    var scale = Math.min((W - 2 * pad) / Math.max(1, uMax - uMin), (H - 2 * pad) / Math.max(1, zMax));
    var ox = (W - (uMax - uMin) * scale) / 2;
    var oy = H - pad;
    var uOf = function (p) {
      if (side === 'south') return p[0] - uMin;
      if (side === 'north') return uMax - p[0];
      if (side === 'east') return p[1] - uMin;
      return uMax - p[1];
    };
    var X = function (u) { return ox + u * scale; };
    var Y = function (z) { return oy - z * scale; };
    var pre = opts.idPrefix || ('elevation-' + side);
    var title = d.name + ' · ' + side + ' elevation';
    var desc = 'Concept ' + side + ' elevation of ' + d.name + ', generated from the same module geometry as the plan and section. ' + d.levels.length + ' occupied storey' + (d.levels.length === 1 ? '' : 's') + ', ' + n(rg.top_m) + ' metres to the roof. Ground, floor levels, openings, module boundaries and a ' + rg.type + ' roof are shown. Conceptual only; not a construction drawing.';
    var out = [];
    out.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-labelledby="' + pre + '-t ' + pre + '-d"' + (opts.className ? ' class="' + opts.className + '"' : '') + '>');
    out.push('<title id="' + pre + '-t">' + esc(title) + '</title><desc id="' + pre + '-d">' + esc(desc) + '</desc>');
    out.push('<rect width="' + W + '" height="' + H + '" fill="#faf8f2"/>');
    out.push('<text x="32" y="42" font-family="system-ui, sans-serif" font-size="22" font-weight="800" fill="#1d392c">' + esc(title) + '</text>');
    out.push('<text x="32" y="64" font-family="system-ui, sans-serif" font-size="12" fill="#3f5a4c">' + esc((side === 'south' || side === 'north' ? 'Looking ' + (side === 'south' ? 'north' : 'south') : 'Looking ' + (side === 'east' ? 'west' : 'east')) + ' · ground datum 0.00 m · ' + d.levels.length + ' occupied storey' + (d.levels.length === 1 ? '' : 's')) + '</text>');
    // ground
    out.push('<rect x="0" y="' + n(Y(0)) + '" width="' + W + '" height="' + n(H - Y(0)) + '" fill="#e8ecdf"/>');
    out.push('<line x1="20" y1="' + n(Y(0)) + '" x2="' + (W - 20) + '" y2="' + n(Y(0)) + '" stroke="#6f7b63" stroke-width="2.5"/>');
    // foundation piles for ground modules
    boxes.filter(function (b) { return b.storey === 0 && b.minZ > 0.05; }).forEach(function (b) {
      var u0 = Math.min(uOf([b.minX, b.minY]), uOf([b.maxX, b.maxY]));
      var u1 = Math.max(uOf([b.minX, b.minY]), uOf([b.maxX, b.maxY]));
      [u0 + 0.12, (u0 + u1) / 2, u1 - 0.12].forEach(function (u) {
        out.push('<line x1="' + n(X(u)) + '" y1="' + n(Y(0)) + '" x2="' + n(X(u)) + '" y2="' + n(Y(b.minZ)) + '" stroke="#5d6f6a" stroke-width="4"/>');
      });
    });
    // modules, lower storey first
    boxes.slice().sort(function (a, b) { return a.minZ - b.minZ; }).forEach(function (b) {
      var m = moduleById(d, b.id);
      var u0 = Math.min(uOf([b.minX, b.minY]), uOf([b.maxX, b.maxY]), uOf([b.minX, b.maxY]), uOf([b.maxX, b.minY]));
      var u1 = Math.max(uOf([b.minX, b.minY]), uOf([b.maxX, b.maxY]), uOf([b.minX, b.maxY]), uOf([b.maxX, b.minY]));
      var fill = m.cladding.colour || CC[m.cladding.type] || '#9a7350';
      out.push('<rect x="' + n(X(u0)) + '" y="' + n(Y(b.maxZ)) + '" width="' + n((u1 - u0) * scale) + '" height="' + n((b.maxZ - b.minZ) * scale) + '" fill="' + fill + '" stroke="#253a33" stroke-width="2"/>');
      out.push('<text x="' + n(X((u0 + u1) / 2)) + '" y="' + n(Y(b.maxZ) - 5) + '" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9" font-weight="800" fill="#1d392c" stroke="#faf8f2" stroke-width="2.2" paint-order="stroke">' + esc(m.id) + ' · L' + (num(m.storey, 0) + 1) + '</text>');
      (m.openings || []).forEach(function (o) {
        if (worldFace(m, o.face) !== side) return;
        var seg = openingSegment(m, o);
        var uu0 = Math.min(uOf(seg[0]), uOf(seg[1])), uu1 = Math.max(uOf(seg[0]), uOf(seg[1]));
        var z0 = moduleBase(m) + o.sill_m, z1 = z0 + o.height_m;
        var fillO = o.type === 'window' ? '#9fd3e0' : o.type === 'sliding-door' ? '#c6e8ee' : '#5d432c';
        out.push('<rect x="' + n(X(uu0)) + '" y="' + n(Y(z1)) + '" width="' + n(Math.max(3, (uu1 - uu0) * scale)) + '" height="' + n((z1 - z0) * scale) + '" fill="' + fillO + '" stroke="#2d3a35" stroke-width="1.6"/>');
        out.push('<text x="' + n(X((uu0 + uu1) / 2)) + '" y="' + n(Y(z0) - 3) + '" text-anchor="middle" font-family="system-ui, sans-serif" font-size="8" fill="#1d392c">' + esc(o.id) + '</text>');
      });
    });
    // porches and decks, so covered outdoor areas appear in elevation
    d.porches.forEach(function (p) {
      var pm = moduleById(d, p.module);
      if (!pm) return;
      var poly = porchCorners(pm, p);
      var us = poly.map(function (pt) { return uOf(pt); });
      var u0 = Math.min.apply(null, us), u1 = Math.max.apply(null, us);
      var z0 = moduleBase(pm), z1 = z0 + (p.roof ? 2.65 : 0.15);
      out.push('<rect x="' + n(X(u0)) + '" y="' + n(Y(z1)) + '" width="' + n(Math.max(2, (u1 - u0) * scale)) + '" height="' + n((z1 - z0) * scale) + '" fill="#d8e6d3" fill-opacity="0.22" stroke="#4f7d64" stroke-width="1.6" stroke-dasharray="6 3"/>');
      out.push('<text x="' + n(X((u0 + u1) / 2)) + '" y="' + n(Y(z0) + 11) + '" text-anchor="middle" font-family="system-ui, sans-serif" font-size="8.5" font-weight="700" fill="#31573f" stroke="#faf8f2" stroke-width="2" paint-order="stroke">' + esc((p.screened ? 'screened porch' : 'covered porch') + ' · ' + n(p.length_m) + ' m') + '</text>');
    });
    d.decks.forEach(function (dk) {
      var p = porchById(d, dk.porch);
      var pm = p && moduleById(d, p.module);
      if (!pm) return;
      var poly = deckCorners(pm, p, dk);
      var us = poly.map(function (pt) { return uOf(pt); });
      var u0 = Math.min.apply(null, us), u1 = Math.max.apply(null, us);
      var z0 = moduleBase(pm);
      out.push('<rect x="' + n(X(u0)) + '" y="' + n(Y(z0)) + '" width="' + n(Math.max(2, (u1 - u0) * scale)) + '" height="' + n(0.12 * scale) + '" fill="#c3a276" stroke="#8a6a44" stroke-width="1"/>');
    });

    // roof profile
    var axis = (side === 'south' || side === 'north') ? 'x' : 'y';
    var prof = roofProfile(rg, axis);
    var roofU0 = axis === 'x' ? rg.minX : rg.minY;
    var roofU1 = axis === 'x' ? rg.maxX : rg.maxY;
    var roofMirror = side === 'west' && (rg.type === 'shed' || rg.type === 'solar-ready');
    var pts = prof.points.map(function (p) { return [X(roofMirror ? prof.w - p[0] : p[0]), Y(p[1])]; });
    out.push('<path d="M' + pts.map(function (p) { return n(p[0]) + ' ' + n(p[1]); }).join('L') + 'Z" fill="' + (rg.green ? '#3f704b' : '#245244') + '" fill-opacity="0.95" stroke="#17392e" stroke-width="2"/>');
    if (rg.type === 'gable' || rg.type === 'butterfly') {
      var ridgeU = prof.w / 2;
      out.push('<line x1="' + n(X(ridgeU)) + '" y1="' + n(Y(rg.top_m)) + '" x2="' + n(X(ridgeU)) + '" y2="' + n(Y(rg.top_m - 0.3)) + '" stroke="#faf8f2" stroke-width="2"/>');
    }
    // level lines and dimension
    d.levels.forEach(function (l) {
      out.push('<line x1="24" y1="' + n(Y(l.elevation_m)) + '" x2="' + (W - 130) + '" y2="' + n(Y(l.elevation_m)) + '" stroke="#8f5a21" stroke-width="1" stroke-dasharray="6 4"/>');
      out.push('<text x="28" y="' + n(Y(l.elevation_m) - 5) + '" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#8f5a21">' + esc(l.name + ' +' + n(l.elevation_m, 2) + ' m') + '</text>');
    });
    var dimX = W - 52;
    out.push('<line x1="' + dimX + '" y1="' + n(Y(0)) + '" x2="' + dimX + '" y2="' + n(Y(rg.top_m)) + '" stroke="#435a4a" stroke-width="1.2"/>');
    out.push('<text x="' + (dimX - 6) + '" y="' + n(Y(rg.top_m / 2)) + '" text-anchor="end" font-family="system-ui, sans-serif" font-size="11" fill="#1d392c">' + n(rg.top_m, 2) + ' m</text>');
    out.push('<text x="32" y="' + (H - 16) + '" font-family="system-ui, sans-serif" font-size="9" fill="#5e6a58">Concept elevation · generated from the same module geometry as the plan · not for construction · Containers Hamlet Design Lab · CC BY-SA 4.0</text>');
    out.push('</svg>');
    return out.join('');
  }

  function sectionSVG(design, opts) {
    opts = opts || {};
    var d = Schema.canonicalize(design);
    var axis = opts.axis === 'x' ? 'x' : 'y';
    var rg = roofGeometry(d);
    var hMin = axis === 'y' ? rg.minX : rg.minY;
    var hMax = axis === 'y' ? rg.maxX : rg.maxY;
    var cut = opts.cut_m != null ? opts.cut_m : axis === 'y' ? (rg.minY + rg.maxY) / 2 : (rg.minX + rg.maxX) / 2;
    var zMax = Math.max(rg.top_m, 4.2) + 1.0;
    var W = 1040, H = 720, pad = 96;
    var scale = Math.min((W - 2 * pad) / Math.max(1, hMax - hMin), (H - 2 * pad) / Math.max(1, zMax));
    var ox = (W - (hMax - hMin) * scale) / 2;
    var oy = H - pad;
    var X = function (v) { return ox + (v - hMin) * scale; };
    var Y = function (z) { return oy - z * scale; };
    var pre = opts.idPrefix || 'section';
    var title = d.name + ' · building section';
    var desc = 'Concept building section through ' + d.name + ' at ' + n(cut, 2) + ' metres, generated from the same module geometry, levels and roof as the plans and elevations. It shows floor levels, modules, ' + (d.access.stair && d.access.stair.present ? 'a stair, ' : 'no stair, ') + 'the roof profile and the ground. Conceptual only; not a structural or construction section.';
    var out = [];
    out.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-labelledby="' + pre + '-t ' + pre + '-d"' + (opts.className ? ' class="' + opts.className + '"' : '') + '>');
    out.push('<title id="' + pre + '-t">' + esc(title) + '</title><desc id="' + pre + '-d">' + esc(desc) + '</desc>');
    out.push('<rect width="' + W + '" height="' + H + '" fill="#faf8f2"/>');
    out.push('<text x="32" y="42" font-family="system-ui, sans-serif" font-size="22" font-weight="800" fill="#1d392c">' + esc(title) + '</text>');
    out.push('<text x="32" y="64" font-family="system-ui, sans-serif" font-size="12" fill="#3f5a4c">Cut at ' + n(cut, 2) + ' m · ' + d.levels.length + ' occupied storey' + (d.levels.length === 1 ? '' : 's') + ' · ' + n(rg.top_m, 2) + ' m to roof</text>');
    out.push('<rect x="0" y="' + n(Y(0)) + '" width="' + W + '" height="' + n(H - Y(0)) + '" fill="#e8ecdf"/>');
    out.push('<line x1="20" y1="' + n(Y(0)) + '" x2="' + (W - 20) + '" y2="' + n(Y(0)) + '" stroke="#6f7b63" stroke-width="2.5"/>');
    d.modules.forEach(function (m) {
      var box = moduleBox3D(m);
      var lo = axis === 'y' ? box.minX : box.minY;
      var hi = axis === 'y' ? box.maxX : box.maxY;
      var intersects = axis === 'y' ? (cut >= box.minY && cut <= box.maxY) : (cut >= box.minX && cut <= box.maxX);
      var fill = m.cladding.colour || CC[m.cladding.type] || '#9a7350';
      out.push('<rect x="' + n(X(lo)) + '" y="' + n(Y(box.maxZ)) + '" width="' + n((hi - lo) * scale) + '" height="' + n((box.maxZ - box.minZ) * scale) + '" fill="' + (intersects ? fill : '#e7e0cf') + '" fill-opacity="' + (intersects ? '0.82' : '0.6') + '" stroke="#253a33" stroke-width="2" ' + (intersects ? '' : 'stroke-dasharray="6 4"') + '/>');
      out.push('<text x="' + n(X((lo + hi) / 2)) + '" y="' + n(Y(box.minZ) + 14) + '" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9" font-weight="800" fill="#1d392c" stroke="#faf8f2" stroke-width="2.2" paint-order="stroke">' + esc(m.id + ' · L' + (num(m.storey, 0) + 1)) + '</text>');
      (m.zones || []).forEach(function (z) {
        var zx0 = -m.nominal.length_m / 2 + z.start_m, zx1 = -m.nominal.length_m / 2 + z.end_m;
        var p0 = transform(m, [zx0, 0]), p1 = transform(m, [zx1, 0]);
        var zl = axis === 'y' ? p0[0] : p0[1], zh = axis === 'y' ? p1[0] : p1[1];
        var zmid = moduleBase(m) + 0.25;
        if (Math.abs(zh - zl) * scale < 8) return;
        out.push('<text x="' + n(X((zl + zh) / 2)) + '" y="' + n(Y(zmid) + 10) + '" text-anchor="middle" font-family="system-ui, sans-serif" font-size="8.5" fill="#3f5a4c" stroke="#faf8f2" stroke-width="2" paint-order="stroke">' + esc(z.name) + '</text>');
      });
    });
    if (d.access.stair && d.access.stair.present) {
      var sm = moduleById(d, d.access.stair.module) || d.modules.filter(function (m) { return num(m.storey, 0) === 0; })[0];
      if (sm) {
        var run = Math.max(1.2, Math.min(4.2, d.access.stair.run_m || 2.8));
        var rise = Math.max(1.8, d.access.stair.rise_m || 2.9);
        var sx = axis === 'y' ? sm.position_m[0] - run / 2 : sm.position_m[1] - run / 2;
        var steps = 10;
        var sBase = moduleBase(sm);
        for (var si = 0; si < steps; si++) {
          var t0 = si / steps, t1 = (si + 1) / steps;
          out.push('<rect x="' + n(X(sx + run * t0)) + '" y="' + n(Y(sBase + rise * t1)) + '" width="' + n(run / steps * scale) + '" height="' + n(rise / steps * scale) + '" fill="#c9b28a" stroke="#7b6344" stroke-width="0.8"/>');
        }
        out.push('<text x="' + n(X(sx + run / 2)) + '" y="' + n(Y(sBase + rise) - 6) + '" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9" font-weight="700" fill="#5c4c34">stair · ' + n(rise, 1) + ' m rise / ' + n(run, 1) + ' m run</text>');
      }
    }
    var profAxis = axis === 'y' ? 'x' : 'y';
    var prof = roofProfile(rg, profAxis);
    var base = profAxis === 'x' ? rg.minX : rg.minY;
    var pts = prof.points.map(function (p) { return [X(base + p[0]), Y(p[1])]; });
    out.push('<path d="M' + pts.map(function (p) { return n(p[0]) + ' ' + n(p[1]); }).join('L') + 'Z" fill="#245244" fill-opacity="0.95" stroke="#17392e" stroke-width="2"/>');
    d.levels.forEach(function (l) {
      out.push('<line x1="24" y1="' + n(Y(l.elevation_m)) + '" x2="' + (W - 130) + '" y2="' + n(Y(l.elevation_m)) + '" stroke="#8f5a21" stroke-width="1" stroke-dasharray="6 4"/>');
      out.push('<text x="28" y="' + n(Y(l.elevation_m) - 5) + '" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#8f5a21">' + esc(l.name + ' +' + n(l.elevation_m, 2) + ' m') + '</text>');
    });
    out.push('<line x1="' + (W - 52) + '" y1="' + n(Y(0)) + '" x2="' + (W - 52) + '" y2="' + n(Y(rg.top_m)) + '" stroke="#435a4a" stroke-width="1.2"/>');
    out.push('<text x="' + (W - 58) + '" y="' + n(Y(rg.top_m / 2)) + '" text-anchor="end" font-family="system-ui, sans-serif" font-size="11" fill="#1d392c">' + n(rg.top_m, 2) + ' m</text>');
    out.push('<text x="32" y="' + (H - 16) + '" font-family="system-ui, sans-serif" font-size="9" fill="#5e6a58">Concept section · floor levels, modules, stair and roof are generated from one model · not for construction · Containers Hamlet Design Lab · CC BY-SA 4.0</text>');
    out.push('</svg>');
    return out.join('');
  }

  function explodedSVG(design, opts) {
    opts = opts || {};
    var d = Schema.canonicalize(design);
    var spread = opts.spread == null ? 2.2 : opts.spread;
    var ex = cloneDesign(d);
    ex.modules.forEach(function (m) { m.elevation_m = num(m.elevation_m, 0) + num(m.storey, 0) * spread; });
    var svg = axoSVG(ex, { idPrefix: opts.idPrefix || 'exploded', season: opts.season });
    var pre = opts.idPrefix || 'exploded';
    var note = '<text x="30" y="' + (700 - 34) + '" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#8f5a21" stroke="#faf8f2" stroke-width="2.6" paint-order="stroke">Exploded levels · storeys separated by ' + n(spread, 1) + ' m for reading only · not a construction sequence</text>';
    svg = svg.replace(/<text x="30" y="700"/, '<text x="30" y="700"');
    svg = svg.replace('</svg>', note + '</svg>');
    return svg;
  }
  function cloneDesign(d) { return JSON.parse(JSON.stringify(d)); }

  function solarStudySVG(design, opts) {
    opts = opts || {};
    var d = Schema.canonicalize(design);
    var season = opts.season === 'winter' ? 'winter' : 'summer';
    var rg = roofGeometry(d);
    var altitude = season === 'winter' ? 20 : 65;
    var W = 1040, H = 520, pad = 90;
    var width = Math.max(6, rg.width);
    var scale = Math.min((W - 2 * pad) / width, (H - 160) / Math.max(3.5, rg.top_m));
    var ox = (W - width * scale) / 2;
    var oy = H - 96;
    var X = function (x) { return ox + x * scale; };
    var Y = function (z) { return oy - z * scale; };
    var pre = opts.idPrefix || ('solar-study-' + season);
    var title = d.name + ' · ' + season + ' solar study';
    var desc = 'Concept ' + season + ' solar study for ' + d.name + '. A ' + altitude + ' degree sun altitude is shown against the south facade, roof overhang and glazing. It is a qualitative shading diagram, not an energy, daylight, glare or overheating calculation.';
    var out = [];
    out.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-labelledby="' + pre + '-t ' + pre + '-d">');
    out.push('<title id="' + pre + '-t">' + esc(title) + '</title><desc id="' + pre + '-d">' + esc(desc) + '</desc>');
    out.push('<rect width="' + W + '" height="' + H + '" fill="#faf8f2"/>');
    out.push('<text x="32" y="42" font-family="system-ui, sans-serif" font-size="22" font-weight="800" fill="#1d392c">' + esc(title) + '</text>');
    out.push('<text x="32" y="64" font-family="system-ui, sans-serif" font-size="12" fill="#3f5a4c">South-facing section · sun altitude about ' + altitude + '° · overhang ' + n(rg.overhang_m, 2) + ' m · qualitative shading only</text>');
    out.push('<rect x="0" y="' + n(Y(0)) + '" width="' + W + '" height="' + n(H - Y(0)) + '" fill="#e8ecdf"/>');
    out.push('<line x1="20" y1="' + n(Y(0)) + '" x2="' + (W - 20) + '" y2="' + n(Y(0)) + '" stroke="#6f7b63" stroke-width="2.5"/>');
    // building mass and glazing
    out.push('<rect x="' + n(X(0)) + '" y="' + n(Y(rg.base_m)) + '" width="' + n(width * scale) + '" height="' + n(rg.base_m * scale) + '" fill="#9a7350" stroke="#253a33" stroke-width="2"/>');
    out.push('<rect x="' + n(X(width * 0.55)) + '" y="' + n(Y(2.4)) + '" width="' + n(width * 0.35 * scale) + '" height="' + n(1.6 * scale) + '" fill="#9fd3e0" stroke="#2d3a35" stroke-width="1.6"/>');
    // roof
    var prof = roofProfile(rg, 'x');
    var pts = prof.points.map(function (p) { return [X(p[0]), Y(p[1])]; });
    out.push('<path d="M' + pts.map(function (p) { return n(p[0]) + ' ' + n(p[1]); }).join('L') + 'Z" fill="#245244" stroke="#17392e" stroke-width="2"/>');
    // sun ray from south (left)
    var sunX = 40, sunY = 100;
    var reach = 620;
    var dx = Math.cos(altitude * DEG) * reach, dz = Math.sin(altitude * DEG) * reach;
    out.push('<circle cx="' + sunX + '" cy="' + sunY + '" r="14" fill="#e5b21c" stroke="#8f5a21" stroke-width="2"/>');
    out.push('<text x="' + (sunX + 22) + '" y="' + (sunY + 5) + '" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#8f5a21">' + altitude + '° sun</text>');
    out.push('<line x1="' + sunX + '" y1="' + sunY + '" x2="' + n(sunX + dx) + '" y2="' + n(sunY + dz) + '" stroke="#e5b21c" stroke-width="2.4" stroke-dasharray="7 4"/>');
    // shadow band on the facade
    var shadowY = Y(Math.max(rg.base_m, rg.top_m - Math.tan(altitude * DEG) * rg.overhang_m));
    out.push('<rect x="' + n(X(0)) + '" y="' + n(Y(rg.top_m)) + '" width="' + n(width * scale) + '" height="' + n(Math.max(0, shadowY - Y(rg.top_m))) + '" fill="#3f5a4c" fill-opacity="0.22"/>');
    out.push('<text x="' + (W - 32) + '" y="' + (H - 64) + '" text-anchor="end" font-family="system-ui, sans-serif" font-size="11" fill="#1d392c">' + (season === 'summer' ? 'Summer: the overhang should shade high sun; west glazing needs a separate strategy.' : 'Winter: low sun should reach the glazing; snow shedding and glare need review.') + '</text>');
    out.push('<text x="32" y="' + (H - 34) + '" font-family="system-ui, sans-serif" font-size="10" fill="#3f5a4c">No energy production, overheating, daylight or glare result is calculated. Confirm with a whole-building energy and shading model.</text>');
    out.push('<text x="32" y="' + (H - 14) + '" font-family="system-ui, sans-serif" font-size="9" fill="#5e6a58">Concept solar study · schematic · Containers Hamlet Design Lab · CC BY-SA 4.0</text>');
    out.push('</svg>');
    return out.join('');
  }

  function pointInPoly(p, poly) {
    var inside = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if ((yi > p[1]) !== (yj > p[1]) && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }

  function shelterGeometry(m, s) {
    var L = m.nominal.length_m, W = m.nominal.width_m;
    var w = Math.min(Math.max(0.8, s.width_m || 2.2), L - 0.4);
    var p = Math.min(Math.max(0.4, s.projection_m || 1.2), 2.5);
    var loc0, loc1, normal;
    if (s.side === 'south') { loc0 = [-w / 2, W / 2]; loc1 = [w / 2, W / 2]; normal = [0, 1]; }
    else if (s.side === 'east') { loc0 = [L / 2, -w / 2]; loc1 = [L / 2, w / 2]; normal = [1, 0]; }
    else if (s.side === 'west') { loc0 = [-L / 2, -w / 2]; loc1 = [-L / 2, w / 2]; normal = [-1, 0]; }
    else { loc0 = [-w / 2, -W / 2]; loc1 = [w / 2, -W / 2]; normal = [0, -1]; }
    var outer0 = [loc0[0] + normal[0] * p, loc0[1] + normal[1] * p];
    var outer1 = [loc1[0] + normal[0] * p, loc1[1] + normal[1] * p];
    return { w: w, p: p, loc0: loc0, loc1: loc1, outer0: outer0, outer1: outer1, normal: normal };
  }

  function shelterSVG(d, m, S, winter) {
    var s = d.entry_shelter;
    if (!s || !s.enabled) return '';
    var g = shelterGeometry(m, s);
    var base = d.foundation ? Math.max(0, d.foundation.clearance_m || 0) : 0;
    if (m) base = moduleBase(m);
    var zWall = base + m.nominal.height_m + 0.08;
    var zOut = zWall - 0.16;
    var p0 = transform(m, g.loc0), p1 = transform(m, g.loc1);
    var q0 = transform(m, g.outer0), q1 = transform(m, g.outer1);
    var canopy = [[p0[0], p0[1], zWall], [p1[0], p1[1], zWall], [q1[0], q1[1], zOut], [q0[0], q0[1], zOut]];
    var out = '<path d="M' + polyScreen(canopy, S) + 'Z" fill="' + (winter ? '#dce5dc' : '#3d6654') + '" stroke="#17392e" stroke-width="1.1"/>';
    [q0, q1].forEach(function (q) { var a = S([q[0], q[1], 0]), b = S([q[0], q[1], zOut]); out += '<line x1="' + n(a[0]) + '" y1="' + n(a[1]) + '" x2="' + n(b[0]) + '" y2="' + n(b[1]) + '" stroke="#5d6f6a" stroke-width="3.2"/>'; });
    if (s.security_shutters) {
      var c0 = (g.loc0[0] + g.loc1[0]) / 2, c1 = (g.loc0[1] + g.loc1[1]) / 2;
      var dx = g.loc1[0] - g.loc0[0], dy = g.loc1[1] - g.loc0[1], dd = Math.max(0.01, Math.hypot(dx, dy));
      var along = [dx / dd, dy / dd];
      [-1, 1].forEach(function (side) {
        var off = side * (g.w / 2 + 0.32);
        var a = transform(m, [c0 + along[0] * off + g.normal[0] * 0.06, c1 + along[1] * off + g.normal[1] * 0.06]);
        var b = transform(m, [c0 + along[0] * (off + 0.48) + g.normal[0] * 0.06, c1 + along[1] * (off + 0.48) + g.normal[1] * 0.06]);
        var z0 = base + 0.18, z1 = base + m.nominal.height_m - 0.18;
        var panel = [[a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], z1], [a[0], a[1], z1]];
        out += '<path d="M' + polyScreen(panel, S) + 'Z" fill="#2b5c4a" stroke="' + (m.frame_colour || '#e5b21c') + '" stroke-width="1.2"/>';
        var mid = S([a[0], a[1], z0 + (z1 - z0) / 2]);
        var mid2 = S([b[0], b[1], z0 + (z1 - z0) / 2]);
        out += '<line x1="' + n(mid[0]) + '" y1="' + n(mid[1]) + '" x2="' + n(mid2[0]) + '" y2="' + n(mid2[1]) + '" stroke="' + (m.frame_colour || '#e5b21c') + '" stroke-width="0.8"/>';
      });
    }
    return out;
  }

  function moduleDraw(d, m, cut, S, winter) {
    var colour = m.cladding.colour || CC[m.cladding.type] || '#9a7350';
    var ins = m.insulation.thickness_mm / 1000;
    var baseZ = moduleBase(m);
    var zTop = baseZ + (cut ? 1.2 : m.nominal.height_m);
    var L = m.nominal.length_m + 2 * (ins + 0.03), W = m.nominal.width_m + 2 * (ins + 0.03);
    var faces = boxFaces(m.position_m[0], m.position_m[1], L, W, baseZ, zTop, m.rotation_deg || 0);
    var s = '';
    // shadow
    var base = moduleCorners(m).map(function (p) { return [p[0] + 0.35, p[1] + 0.35, 0]; });
    s += '<path d="M' + polyScreen(base, S) + 'Z" fill="#9eae8d" fill-opacity="0.55"/>';
    if (baseZ > 0.05 && num(m.storey, 0) === 0) {
      var pilePts = moduleCorners(m).concat([
        [(moduleCorners(m)[0][0] + moduleCorners(m)[1][0]) / 2, (moduleCorners(m)[0][1] + moduleCorners(m)[1][1]) / 2],
        [(moduleCorners(m)[2][0] + moduleCorners(m)[3][0]) / 2, (moduleCorners(m)[2][1] + moduleCorners(m)[3][1]) / 2]
      ]);
      pilePts.forEach(function (pp) {
        var g = S([pp[0], pp[1], 0]), t = S([pp[0], pp[1], baseZ]);
        s += '<line x1="' + n(g[0]) + '" y1="' + n(g[1]) + '" x2="' + n(t[0]) + '" y2="' + n(t[1]) + '" stroke="#5d6f6a" stroke-width="4"/>';
        s += '<circle cx="' + n(g[0]) + '" cy="' + n(g[1]) + '" r="3" fill="#455955"/>';
      });
    }
    if (num(m.storey, 0) > 0) {
      var lab = S([m.position_m[0], m.position_m[1], zTop + 0.1]);
      s += '<text x="' + n(lab[0]) + '" y="' + n(lab[1]) + '" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#1d392c" stroke="#faf8f2" stroke-width="2.4" paint-order="stroke">' + esc(m.id.toUpperCase()) + ' · LEVEL ' + (num(m.storey, 0) + 1) + '</text>';
    }
    faces.filter(visible).forEach(function (f) {
      var fill = f.name === 'top' ? (cut ? '#e6dfcd' : winter ? '#e4e9e5' : '#4b4a44') : colour;
      if (f.name === 'north' || f.name === 'west') fill = shade(colour, 0.78);
      if (f.name === 'south' || f.name === 'east') fill = shade(colour, 0.95);
      if (f.name === 'top') fill = cut ? '#e6dfcd' : winter ? '#e4e9e5' : '#4b4a44';
      s += '<path d="M' + polyScreen(f.pts, S) + 'Z" fill="' + fill + '" stroke="#3a342d" stroke-width="0.8"/>';
    });
    if (cut) {
      // zone floors
      (m.zones || []).forEach(function (z) {
        var zx0 = -m.nominal.length_m / 2 + z.start_m, zx1 = -m.nominal.length_m / 2 + z.end_m;
        var poly = [[zx0, -m.nominal.width_m / 2], [zx1, -m.nominal.width_m / 2], [zx1, m.nominal.width_m / 2], [zx0, m.nominal.width_m / 2]].map(function (q) { return transform(m, q); }).map(function (q) { return [q[0], q[1], baseZ + 0.26]; });
        s += '<path d="M' + polyScreen(poly, S) + 'Z" fill="' + (ZC[z.type] || '#e8e2d2') + '" stroke="#6d7b65" stroke-width="0.7"/>';
        var c = S(transform(m, [(zx0 + zx1) / 2, 0]).concat([0.3]));
        s += '<text x="' + n(c[0]) + '" y="' + n(c[1]) + '" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle" fill="#1d392c" stroke="#faf8f2" stroke-width="2.5" paint-order="stroke">' + esc(z.name) + '</text>';
      });
    } else {
      // openings on visible faces
      (m.openings || []).forEach(function (o) {
        var nrm = faceNormalWorld(m, o.face);
        if (nrm[0] + nrm[1] <= 0) return;
        var seg = openingSegment(m, o);
        var a = seg[0], b = seg[1];
        var z0 = baseZ + (o.sill_m || 0) + 0.06, z1 = z0 + o.height_m;
        var q = [[a[0] + nrm[0] * 0.03, a[1] + nrm[1] * 0.03, z0], [b[0] + nrm[0] * 0.03, b[1] + nrm[1] * 0.03, z0], [b[0] + nrm[0] * 0.03, b[1] + nrm[1] * 0.03, z1], [a[0] + nrm[0] * 0.03, a[1] + nrm[1] * 0.03, z1]];
        s += '<path d="M' + polyScreen(q, S) + 'Z" fill="' + (o.type === 'window' ? '#9fd3e0' : '#5d432c') + '" stroke="' + (m.frame_colour || '#2d3a35') + '" stroke-width="2.2"/>';
      });
    }
    if (!cut && m.roof.solar && m.solar && m.solar.enabled && !(d.solar_array && d.solar_array.enabled)) {
      var tilt = Math.max(0, Math.min(75, m.solar.tilt_deg || 39));
      var az = (m.solar.azimuth_deg || 180) * Math.PI / 180;
      var fw = [Math.sin(az), Math.cos(az)];
      var rot = (m.rotation_deg || 0) * Math.PI / 180;
      var f = [fw[0] * Math.cos(-rot) - fw[1] * Math.sin(-rot), fw[0] * Math.sin(-rot) + fw[1] * Math.cos(-rot)];
      var p = [-f[1], f[0]];
      var pl = Math.min(4.2, (Math.abs(p[0]) > 0.5 ? m.nominal.length_m : m.nominal.width_m) * 0.8);
      var pd = Math.min(1.55, (Math.abs(f[1]) > 0.5 ? m.nominal.width_m : m.nominal.length_m) * 0.62);
      var rise = pd * Math.tan(tilt * Math.PI / 180);
      var z0 = baseZ + m.nominal.height_m + 0.08, z1 = z0 + rise;
      var corners = [
        [f[0] * pd / 2 + p[0] * pl / 2, f[1] * pd / 2 + p[1] * pl / 2, z0],
        [f[0] * pd / 2 - p[0] * pl / 2, f[1] * pd / 2 - p[1] * pl / 2, z0],
        [-f[0] * pd / 2 - p[0] * pl / 2, -f[1] * pd / 2 - p[1] * pl / 2, z1],
        [-f[0] * pd / 2 + p[0] * pl / 2, -f[1] * pd / 2 + p[1] * pl / 2, z1]
      ].map(function (q) { var t = transform(m, [q[0], q[1]]); return [t[0], t[1], q[2]]; });
      var flat = [[corners[0][0], corners[0][1], z0], [corners[1][0], corners[1][1], z0], [corners[2][0], corners[2][1], z0], [corners[3][0], corners[3][1], z0]];
      s += '<path d="M' + polyScreen(flat, S) + 'Z" fill="#245a73" fill-opacity="0.85" stroke="#123b4d" stroke-width="1"/>';
      s += panelGridSVG(corners, 3, 1, S);
      var front = [[corners[0][0], corners[0][1], corners[0][2]], [corners[1][0], corners[1][1], corners[1][2]], [corners[1][0], corners[1][1], corners[1][2] - 0.08], [corners[0][0], corners[0][1], corners[0][2] - 0.08]];
      s += '<path d="M' + polyScreen(front, S) + 'Z" fill="#123b4d" stroke="#0d2a36" stroke-width="1"/>';
      [corners[2], corners[3]].forEach(function (q) { var r = S([q[0], q[1], baseZ + m.nominal.height_m + 0.02]); var tq = S(q); s += '<line x1="' + n(r[0]) + '" y1="' + n(r[1]) + '" x2="' + n(tq[0]) + '" y2="' + n(tq[1]) + '" stroke="#536b63" stroke-width="1.1"/>'; });
      var pc = S([(corners[0][0] + corners[2][0]) / 2, (corners[0][1] + corners[2][1]) / 2, z0 + 0.2]);
      s += '<text x="' + n(pc[0]) + '" y="' + n(pc[1]) + '" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9" font-weight="800" fill="#eaf6f9" stroke="#123b4d" stroke-width="2.2" paint-order="stroke">PV ' + n(tilt, 0) + '° / ' + n(m.solar.azimuth_deg, 0) + '°</text>';
    }
    if (!cut && d.entry_shelter && d.entry_shelter.enabled && m.id === d.modules[0].id) s += shelterSVG(d, m, S, winter);
    return s;
  }

  function exposureProfile(input) {
    var d = Schema.canonicalize(input);
    var byFace = { north: 0, east: 0, south: 0, west: 0 };
    d.modules.forEach(function (m) {
      m.openings.forEach(function (o) {
        if (o.type === 'window' || o.type === 'sliding-door') { var wf = worldFace(m, o.face); byFace[wf] = (byFace[wf] || 0) + o.width_m * o.height_m; }
      });
    });
    var total = Object.keys(byFace).reduce(function (t, k) { return t + byFace[k]; }, 0);
    var shading = [], privacy = [], maintenance = [];
    if (d.thermal && d.thermal.external_shading) shading.push('External shading intent: ' + d.thermal.external_shading + '.');
    d.trellises.forEach(function (t) {
      var tm = moduleById(d, t.module); shading.push('Freestanding trellis on the ' + (tm ? worldFace(tm, t.face) : t.face) + ' face: seasonal climber shading is not calculated.');
      maintenance.push('Trellis ' + t.id + ': prune, secure and inspect the independent frame.');
    });
    (d.vegetation || []).forEach(function (v) {
      var label = VEG_LABEL[v.type] || v.type;
      var vm = moduleById(d, v.module); shading.push(label + ' on the ' + (vm ? worldFace(vm, v.face) : v.face) + ' face (' + v.seasonal_foliage + '): approximate screening, not an energy or daylight calculation.');
      if (v.type === 'privacy-screen' || v.type === 'living-wall') privacy.push(label + ' is ' + v.length_m + ' m long and ' + v.height_m + ' m high; visual privacy is not scored.');
      maintenance.push(label + ' ' + v.id + ': ' + v.maintenance + '; irrigation: ' + v.irrigation + '.');
    });
    if (d.connections.some(function (c) { return c.glazed; })) shading.push('The glazed hall is a large solar-gain and heat-loss surface; insulated sliding/folding doors and shading need review.');
    return {
      glazing_by_face: { north: +byFace.north.toFixed(1), east: +byFace.east.toFixed(1), south: +byFace.south.toFixed(1), west: +byFace.west.toFixed(1) },
      glazing_total_m2: +total.toFixed(1),
      shading: shading,
      privacy: privacy,
      maintenance: maintenance,
      note: 'Approximate window areas and qualitative screening only. No energy savings, daylight factor, privacy score or code compliance is calculated.'
    };
  }

  function thermalProfile(input) {
    var d = Schema.canonicalize(input);
    var envWall = d.envelope && d.envelope.layers ? d.envelope.layers.filter(function (l) { return l.role === 'insulation'; }).reduce(function (t, l) { return t + l.thickness_mm; }, 0) : 0;
    var wall = envWall || Math.round(d.modules.reduce(function (t, m) { return t + m.insulation.thickness_mm; }, 0) / Math.max(1, d.modules.length));
    var glazing = d.modules.reduce(function (t, m) { return t + m.openings.filter(function (o) { return o.type === 'window' || o.type === 'sliding-door'; }).reduce(function (u, o) { return u + o.width_m * o.height_m; }, 0); }, 0) + d.connections.reduce(function (t, c) { return t + (c.glazed ? c.glazing_area_m2 || 0 : 0); }, 0);
    var conditioned = d.modules.reduce(function (t, m) { return t + m.nominal.length_m * m.nominal.width_m; }, 0) + d.connections.filter(function (c) { return c.glazed; }).reduce(function (t, c) { return t + c.length_m * c.width_m; }, 0);
    var porch = d.porches.reduce(function (t, p) { return t + p.length_m * p.depth_m; }, 0);
    var screened = d.porches.filter(function (p) { return p.screened; }).reduce(function (t, p) { return t + p.length_m * p.depth_m; }, 0);
    var ratio = conditioned ? glazing / conditioned : 0;
    var strengths = [], risks = [];
    if (wall >= 150) strengths.push('Continuous external wall insulation (' + wall + ' mm average) reduces thermal bridging.'); else risks.push('Wall insulation averages ' + wall + ' mm; thermal bridging and cold spots need review.');
    if (d.thermal.roof_insulation_mm >= 250) strengths.push('Roof insulation is ' + d.thermal.roof_insulation_mm + ' mm in the concept.'); else risks.push('Roof insulation is ' + d.thermal.roof_insulation_mm + ' mm; winter heat loss and snow-melt risks need review.');
    if (d.thermal.floor_insulation_mm >= 200) strengths.push('Floor insulation is ' + d.thermal.floor_insulation_mm + ' mm in the concept.'); else risks.push('Floor insulation is ' + d.thermal.floor_insulation_mm + ' mm; cold floors and condensation risk need review.');
    if (/triple/i.test(d.thermal.window_performance)) strengths.push('Triple glazing and thermally broken frames are the stated intent.'); else risks.push('Window performance is stated as "' + d.thermal.window_performance + '"; verify cold-climate performance and condensation resistance.');
    if (!/none|not decided/i.test(d.thermal.external_shading)) strengths.push('External shading is part of the intent: ' + d.thermal.external_shading + '.'); else risks.push('External shading is unresolved; west and south glazing may overheat in summer.');
    if (d.thermal.heat_recovery_ventilation) strengths.push('Heat-recovery ventilation is included as an intent, supporting winter ventilation and moisture control.'); else risks.push('No heat-recovery ventilation is selected; winter ventilation and moisture control need a designed strategy.');
    if (/heat pump/i.test(d.thermal.heating)) strengths.push('A cold-climate heat pump is the stated heating intent; sizing and backup are not calculated.'); else risks.push('Heating is stated as "' + d.thermal.heating + '"; cold-climate capacity and backup need review.');
    if (d.thermal.rainscreen_ventilation) strengths.push('The rainscreen is ventilated and the cladding replaceable.'); else risks.push('Rainscreen ventilation is not confirmed.');
    if (d.thermal.thermal_bridge_mitigation) strengths.push('Thermal-bridge intent: ' + d.thermal.thermal_bridge_mitigation + '.');
    if (ratio > 0.28) risks.push('Glazing is about ' + Math.round(ratio * 100) + '% of nominal conditioned area; summer overheating and winter heat loss need modelling.');
    if (d.connections.some(function (c) { return c.glazed; })) strengths.push('The central hall/veranda is modelled with insulated sliding/folding glazing intent, not an uninsulated garage door.');
    if (d.modules.some(function (m) { return m.roof.green; })) risks.push('Green roof adds saturated load, drainage and maintenance complexity; it is not a substitute for roof insulation.');
    if (ratio <= 0.2) strengths.push('The window area is relatively moderate for the nominal floor area.');
    return {
      wall_insulation_mm: wall,
      assembly: d.envelope ? d.envelope.assembly : 'unknown',
      roof_insulation_mm: d.thermal.roof_insulation_mm,
      floor_insulation_mm: d.thermal.floor_insulation_mm,
      window_performance: d.thermal.window_performance,
      external_shading: d.thermal.external_shading,
      heat_recovery_ventilation: !!d.thermal.heat_recovery_ventilation,
      heating: d.thermal.heating,
      air_vapour_control: d.thermal.air_vapour_control,
      thermal_bridge_mitigation: d.thermal.thermal_bridge_mitigation,
      rainscreen_ventilation: !!d.thermal.rainscreen_ventilation,
      glazing_m2: +glazing.toFixed(1),
      conditioned_area_m2: +conditioned.toFixed(1),
      screened_porch_m2: +screened.toFixed(1),
      porch_m2: +porch.toFixed(1),
      glazing_ratio: +(ratio * 100).toFixed(1),
      strengths: strengths,
      risks: risks,
      note: 'Qualitative comparison only. No energy, carbon, cost or code compliance is calculated.'
    };
  }

  function designProfile(input) {
    var d = Schema.canonicalize(input);
    var assessment = assess(d);
    var thermal = thermalProfile(d);
    var review = structuralReview(d);
    var access = accessibilityProfile(d);
    var structural = review.concerns.filter(function (c) { return c.status === 'requires-review' || c.status === 'not-assessed'; }).map(function (c) { return c.label + ': ' + c.notes; });
    var accessibility = (d.features && d.features.accessibility ? [d.features.accessibility] : []).concat(access.issues.map(function (i) { return i.message; }));
    return {
      id: d.id,
      name: d.name,
      group: d.group,
      editable: !!d.editable,
      container_count: d.modules.length,
      types: d.modules.map(function (m) { return m.type; }),
      storeys: d.levels.length,
      levels: d.levels,
      architecture: architectureFeatures(d),
      metrics: metrics(d),
      support: supportAnalysis(d),
      structural_review: review,
      accessibility_profile: access,
      sustainability: sustainabilityProfile(d),
      conditioned_area_m2: thermal.conditioned_area_m2,
      screened_porch_m2: thermal.screened_porch_m2,
      porch_m2: thermal.porch_m2,
      glazing_m2: thermal.glazing_m2,
      glazing_ratio: thermal.glazing_ratio,
      thermal: thermal,
      envelope: { assembly: d.envelope.assembly, layers: d.envelope.layers, version: d.envelope.version },
      solar: d.solar_array ? [{ id: 'roof', tilt_deg: d.solar_array.tilt_deg, azimuth_deg: d.solar_array.azimuth_deg, season_mode: d.solar_array.season_mode, mounting: d.solar_array.mounting }] : d.modules.filter(function (m) { return m.solar && m.solar.enabled; }).map(function (m) { return { id: m.id, tilt_deg: m.solar.tilt_deg, azimuth_deg: m.solar.azimuth_deg, season_mode: m.solar.season_mode, mounting: m.solar.mounting }; }),
      vegetation: (d.vegetation || []).map(function (v) { return { id: v.id, type: v.type, name: v.name, module: v.module, face: v.face, length_m: v.length_m, height_m: v.height_m, seasonal_foliage: v.seasonal_foliage, irrigation: v.irrigation, maintenance: v.maintenance }; }),
      exposure: exposureProfile(d),
      accessibility: accessibility,
      structural: structural,
      assessment_ok: assessment.ok
    };
  }

  function describe(design) {
    var d = Schema.canonicalize(design);
    var s = Schema.summary(d);
    var zones = [];
    d.modules.forEach(function (m) { m.zones.forEach(function (z) { zones.push(m.id + ' L' + (num(m.storey, 0) + 1) + ': ' + z.name + ' (' + n(z.end_m - z.start_m) + ' m)'); }); });
    return d.name + ': ' + s.moduleCount + ' container module' + (s.moduleCount === 1 ? '' : 's') + ' (' + s.types.join(', ') + ') across ' + s.storeyCount + ' occupied storey' + (s.storeyCount === 1 ? '' : 's') + ', ' + n(s.grossFloorArea_m2) + ' m² gross floor area and ' + n(metrics(d).groundCoverage_m2) + ' m² ground coverage. ' + (zones.length ? 'Interior zones: ' + zones.join('; ') + '. ' : '') + (s.solar ? 'Solar roof. ' : '') + (s.greenRoof ? 'Green roof concept. ' : '') + 'Concept only; not verified.';
  }

  return {
    moduleCorners: moduleCorners, connectionCorners: connectionCorners, porchCorners: porchCorners, deckCorners: deckCorners,
    openingSegment: openingSegment, faceNormalWorld: faceNormalWorld, faceLength: faceLength,
    polygonsOverlap: polygonsOverlap, overlapArea: overlapArea, bounds: bounds,
    moduleBase: moduleBase, moduleTop: moduleTop, moduleBox3D: moduleBox3D, boxOverlap3D: boxOverlap3D, verticalGap: verticalGap,
    supportAnalysis: supportAnalysis, metrics: metrics, roofGeometry: roofGeometry, structuralReview: structuralReview,
    accessibilityProfile: accessibilityProfile, architectureFeatures: architectureFeatures, architecturalSimilarity: architecturalSimilarity,
    findSimilarHomes: findSimilarHomes, sustainabilityProfile: sustainabilityProfile, singleStoreyAlternative: singleStoreyAlternative,
    validateGeometry: validateGeometry, assess: assess, thermalProfile: thermalProfile, exposureProfile: exposureProfile, designProfile: designProfile,
    envelopeFor: envelopeFor, wallSectionSVG: wallSectionSVG, solarSectionSVG: solarSectionSVG, foundationSectionSVG: foundationSectionSVG,
    elevationSVG: elevationSVG, sectionSVG: sectionSVG, explodedSVG: explodedSVG, solarStudySVG: solarStudySVG,
    ENVELOPE_LABEL: ENVELOPE_LABEL, VEG_LABEL: VEG_LABEL, PRIMARY_DIVERSITY_FEATURES: PRIMARY_DIVERSITY_FEATURES,
    renderPlan: planSVG, renderAxo: axoSVG, renderElevation: elevationSVG, renderSection: sectionSVG, renderExploded: explodedSVG, renderSolarStudy: solarStudySVG,
    describe: describe, summary: Schema.summary, canonicalize: Schema.canonicalize
  };
});
