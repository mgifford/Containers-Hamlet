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
    for (var i = 0; i < d.modules.length; i++) {
      for (var j = i + 1; j < d.modules.length; j++) {
        if (polygonsOverlap(moduleCorners(d.modules[i]), moduleCorners(d.modules[j]))) err('module-overlap', 'Containers ' + d.modules[i].id + ' and ' + d.modules[j].id + ' overlap. Move or rotate one of them.');
      }
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
      if (m.structure && m.structure.cantilever_m > 0.6) warn('cantilever', m.id + ' has a conceptual cantilever of ' + n(m.structure.cantilever_m) + ' m; support and uplift need review.', 'engineering');
      var doors = (m.openings || []).filter(function (o) { return o.type === 'door' || o.type === 'sliding-door'; });
      doors.forEach(function (a, di) {
        doors.slice(di + 1).forEach(function (b) {
          if (a.face !== b.face) return;
          if (Math.abs(a.position_m - b.position_m) < 1.0) warn('door-swing', 'Doors ' + a.id + ' and ' + b.id + ' are close together on the ' + a.face + ' face. Check door swings, circulation and furniture clearances.', 'accessibility');
        });
      });
      if (m.roof && m.roof.green) warn('green-roof', m.id + ' has a green or biosolar roof. Saturated weight, snow, drainage, waterproofing and fire need engineering review.', 'engineering');
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
        if (overlapArea(poly, moduleCorners(other)) > 0.1) err('deck-overlap', 'Deck ' + dk.id + ' overlaps container ' + other.id + '.');
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
      d.modules.forEach(function (m) {
        var area = overlapArea(poly, moduleCorners(m));
        if (area > 0.15) err('connection-overlap', 'Connection ' + c.id + ' overlaps container ' + m.id + ' by ' + n(area) + ' m².');
      });
    });
    d.porches.forEach(function (p) {
      var m = moduleById(d, p.module);
      if (!m) return;
      var poly = porchCorners(m, p);
      d.modules.forEach(function (other) {
        if (other.id === m.id) return;
        if (overlapArea(poly, moduleCorners(other)) > 0.1) err('porch-overlap', 'Porch ' + p.id + ' overlaps container ' + other.id + '.');
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
    return { errors: errors, warnings: warnings, ok: errors.length === 0 };
  }

  function assess(design) {
    var schema = Schema.validateSchema(design);
    var geo = validateGeometry(design);
    var items = [];
    schema.errors.forEach(function (e) { items.push({ category: 'invalid', code: e.code, message: e.message }); });
    schema.warnings.forEach(function (w) { items.push({ category: 'review', code: w.code, message: w.message }); });
    geo.errors.forEach(function (e) { items.push({ category: 'invalid', code: e.code, message: e.message }); });
    geo.warnings.forEach(function (w) { items.push({ category: w.severity || 'engineering', code: w.code, message: w.message }); });
    return { ok: items.filter(function (i) { return i.category === 'invalid'; }).length === 0, items: items, warnings: geo.warnings };
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
    var title = d.name + ' concept plan';
    var desc = 'Dimensioned concept plan for ' + d.name + '. ' + d.modules.length + ' container module' + (d.modules.length === 1 ? '' : 's') + ', ' + Schema.summary(d).nominalFootprint_m2 + ' square metres nominal footprint. ' + Schema.summary(d).zoneCount + ' interior zones and ' + Schema.summary(d).openingCount + ' openings. Dimensions are nominal container sizes, not verified construction dimensions.';
    out.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-labelledby="' + pre + '-t ' + pre + '-d"' + (opts.className ? ' class="' + opts.className + '"' : '') + '>');
    out.push('<title id="' + pre + '-t">' + esc(title) + '</title><desc id="' + pre + '-d">' + esc(desc) + '</desc>');
    out.push('<defs><pattern id="' + pre + '-porch" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#d8e6d3"/><path d="M0 7L7 0" stroke="#6b9277" stroke-width="0.8"/></pattern><pattern id="' + pre + '-deck" width="9" height="5" patternUnits="userSpaceOnUse"><rect width="9" height="5" fill="#d9c3a1"/><path d="M0 2.5H9" stroke="#9a7750" stroke-width="0.7"/></pattern><pattern id="' + pre + '-link" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#e4d7bf"/><path d="M0 6L6 0" stroke="#9a8765" stroke-width="0.7"/></pattern></defs>');
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
    // modules
    d.modules.forEach(function (m) {
      var ins = m.insulation.thickness_mm / 1000 + 0.03;
      var outer = [[-m.nominal.length_m / 2 - ins, -m.nominal.width_m / 2 - ins], [m.nominal.length_m / 2 + ins, -m.nominal.width_m / 2 - ins], [m.nominal.length_m / 2 + ins, m.nominal.width_m / 2 + ins], [-m.nominal.length_m / 2 - ins, m.nominal.width_m / 2 + ins]].map(function (q) { return transform(m, q); });
      out.push('<path d="' + path(outer) + '" fill="#e9e2ce" stroke="#7d8b73" stroke-width="1"/>');
      out.push('<path d="' + path(moduleCorners(m)) + '" fill="#' + (CC[m.cladding.type] || '#9a7350').slice(1) + '" fill-opacity="0.18" stroke="#253a33" stroke-width="2.2"/>');
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
      out.push(text(mx + 2, my - 26, m.id.toUpperCase() + ' · ' + m.type, 10, ' font-weight="800" stroke="#faf8f2" stroke-width="2.6" paint-order="stroke"'));
      out.push('<path class="plan-module-hit" data-module-id="' + esc(m.id) + '" d="' + path(moduleCorners(m)) + '" fill="transparent" pointer-events="all"/>');
    });
    planLabels.forEach(function (label) { out.push(label); });
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
    var desc = (cut ? 'Roof-off cutaway' : focus ? 'Screened porch and deck detail' : winter ? 'Winter exterior axonometric' : 'Exterior axonometric') + ' of ' + d.name + ', ' + d.modules.length + ' container module' + (d.modules.length === 1 ? '' : 's') + '. The view is generated from the same multi-container geometry as the plan and uses no WebGL. Conceptual only.';
    var out = [];
    out.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + viewBox + '" role="img" aria-labelledby="' + pre + '-t ' + pre + '-d"' + (opts.className ? ' class="' + opts.className + '"' : '') + '>');
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
            s += '<path d="M' + polyScreen(f.pts, S) + 'Z" fill="#bfe4ea" fill-opacity="0.72" stroke="#23616e" stroke-width="1.3"/>';
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
    var label = cut ? 'Roof-off cutaway · interior zones visible' : focus ? 'Screened porch and deck detail · cropped from the same geometry' : winter ? 'Winter concept · same geometry, winter setting' : 'Exterior concept · timber, glass and screened outdoor rooms';
    out.push('<text x="30" y="46" font-family="system-ui, sans-serif" font-size="22" font-weight="800" fill="#1d392c">' + esc(d.name) + '</text>');
    out.push('<text x="30" y="68" font-family="system-ui, sans-serif" font-size="12" fill="#40583f">' + esc(label) + '</text>');
    if (focus) out.push('<text x="' + (parseFloat(viewBox.split(' ')[0]) + 20) + '" y="' + (parseFloat(viewBox.split(' ')[1]) + 24) + '" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#1d392c">Screened porch and deck detail</text>');
    out.push('<g aria-hidden="true"><circle cx="' + (W - 44) + '" cy="44" r="22" fill="#fffdf7" fill-opacity="0.9" stroke="#b9c3b2"/><path d="M' + (W - 44) + ' 28l6 30l-6 -8l-6 8z" fill="#1d392c"/><text x="' + (W - 44) + '" y="76" text-anchor="middle" font-size="10" font-weight="700" font-family="system-ui, sans-serif" fill="#1d392c">N</text></g>');
    out.push('<text x="30" y="' + (H - 18) + '" font-family="system-ui, sans-serif" font-size="10" fill="#5e6a58">Illustrative concept · generated from the same geometry as the plan · not for construction · Containers Hamlet Design Lab · CC BY-SA 4.0</text>');
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

  function moduleDraw(d, m, cut, S, winter) {
    var colour = m.cladding.colour || CC[m.cladding.type] || '#9a7350';
    var ins = m.insulation.thickness_mm / 1000;
    var zTop = cut ? 1.2 : m.nominal.height_m;
    var L = m.nominal.length_m + 2 * (ins + 0.03), W = m.nominal.width_m + 2 * (ins + 0.03);
    var faces = boxFaces(m.position_m[0], m.position_m[1], L, W, 0, zTop, m.rotation_deg || 0);
    var s = '';
    // shadow
    var base = moduleCorners(m).map(function (p) { return [p[0] + 0.35, p[1] + 0.35, 0]; });
    s += '<path d="M' + polyScreen(base, S) + 'Z" fill="#9eae8d" fill-opacity="0.55"/>';
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
        var poly = [[zx0, -m.nominal.width_m / 2], [zx1, -m.nominal.width_m / 2], [zx1, m.nominal.width_m / 2], [zx0, m.nominal.width_m / 2]].map(function (q) { return transform(m, q); }).map(function (q) { return [q[0], q[1], 0.26]; });
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
        var z0 = (o.sill_m || 0) + 0.06, z1 = z0 + o.height_m;
        var q = [[a[0] + nrm[0] * 0.03, a[1] + nrm[1] * 0.03, z0], [b[0] + nrm[0] * 0.03, b[1] + nrm[1] * 0.03, z0], [b[0] + nrm[0] * 0.03, b[1] + nrm[1] * 0.03, z1], [a[0] + nrm[0] * 0.03, a[1] + nrm[1] * 0.03, z1]];
        s += '<path d="M' + polyScreen(q, S) + 'Z" fill="' + (o.type === 'window' ? '#9fd3e0' : '#5d432c') + '" stroke="#2d3a35" stroke-width="0.8"/>';
      });
    }
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
    if (d.modules.some(function (m) { return m.roof.green; })) risks.push('Green or biosolar roof adds saturated load, drainage and maintenance complexity; it is not a substitute for roof insulation.');
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
    var structuralCodes = ['wall-removal', 'cantilever', 'crane', 'transport', 'transport-40', 'roof-loads', 'green-roof', 'connection-overlap'];
    var structural = assessment.items.filter(function (i) { return structuralCodes.indexOf(i.code) >= 0; }).map(function (i) { return i.message; });
    var accessibility = (d.features && d.features.accessibility ? [d.features.accessibility] : []).concat(assessment.items.filter(function (i) { return i.category === 'accessibility'; }).map(function (i) { return i.message; }));
    return {
      id: d.id,
      name: d.name,
      editable: !!d.editable,
      container_count: d.modules.length,
      types: d.modules.map(function (m) { return m.type; }),
      conditioned_area_m2: thermal.conditioned_area_m2,
      screened_porch_m2: thermal.screened_porch_m2,
      porch_m2: thermal.porch_m2,
      glazing_m2: thermal.glazing_m2,
      glazing_ratio: thermal.glazing_ratio,
      thermal: thermal,
      envelope: { assembly: d.envelope.assembly, layers: d.envelope.layers, version: d.envelope.version },
      vegetation: (d.vegetation || []).map(function (v) { return { id: v.id, type: v.type, name: v.name, module: v.module, face: v.face, length_m: v.length_m, height_m: v.height_m, seasonal_foliage: v.seasonal_foliage, irrigation: v.irrigation, maintenance: v.maintenance }; }),
      exposure: exposureProfile(d),
      accessibility: accessibility,
      structural: structural,
      assessment_ok: assessment.ok
    };
  }

  function describe(design) {
    var s = Schema.summary(design);
    var zones = [];
    design.modules.forEach(function (m) { m.zones.forEach(function (z) { zones.push(z.name + ' (' + n(z.end_m - z.start_m) + ' m)'); }); });
    return design.name + ': ' + s.moduleCount + ' container module' + (s.moduleCount === 1 ? '' : 's') + ' (' + s.types.join(', ') + '), ' + s.nominalFootprint_m2 + ' m² nominal footprint. ' + (zones.length ? 'Interior zones: ' + zones.join('; ') + '. ' : '') + (s.solar ? 'Solar roof. ' : '') + (s.greenRoof ? 'Green or biosolar roof. ' : '') + 'Concept only; not verified.';
  }

  return {
    moduleCorners: moduleCorners, connectionCorners: connectionCorners, porchCorners: porchCorners, deckCorners: deckCorners,
    openingSegment: openingSegment, faceNormalWorld: faceNormalWorld, faceLength: faceLength,
    polygonsOverlap: polygonsOverlap, overlapArea: overlapArea, bounds: bounds,
    validateGeometry: validateGeometry, assess: assess, thermalProfile: thermalProfile, exposureProfile: exposureProfile, designProfile: designProfile, envelopeFor: envelopeFor, wallSectionSVG: wallSectionSVG, ENVELOPE_LABEL: ENVELOPE_LABEL, VEG_LABEL: VEG_LABEL,
    renderPlan: planSVG, renderAxo: axoSVG, describe: describe,
    summary: Schema.summary, canonicalize: Schema.canonicalize
  };
});
