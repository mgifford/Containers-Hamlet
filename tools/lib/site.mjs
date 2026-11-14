// Site analysis (no-build zones, slopes, crane reach, access) and site-plan SVG.
// The plan is drawn in metres: the SVG viewBox units are metres. MIT licence.
import {
  polygonArea, pointInPolygon, distPointPolyline, shapeDistance, nearestOnPolyline,
  samplePolyline, simplify, isolines, closeAlongBoundary, mulberry32, centroid,
} from './geo.mjs';
import { esc, fmt } from './svg.mjs';

const ACRE_M2 = 4046.8564224;

export function lakePolygon(site) {
  const s = site.lake.shoreline;
  return s.concat([[0, s[s.length - 1][1]], [0, s[0][1]]]);
}

function shoreXAt(shore, y) {
  for (let i = 0; i < shore.length - 1; i++) {
    const [x0, y0] = shore[i];
    const [x1, y1] = shore[i + 1];
    if (y >= y0 && y <= y1) return x0 + ((x1 - x0) * (y - y0)) / (y1 - y0 || 1);
  }
  return y < shore[0][1] ? shore[0][0] : shore[shore.length - 1][0];
}

export function elevationFn(site) {
  const t = site.terrain;
  const shore = site.lake.shoreline;
  return (x, y) => {
    let z = t.lake_level_m + t.rise_from_shore_per_m * (x - shoreXAt(shore, y));
    for (const f of t.features) {
      z += f.height_m * Math.exp(-(((x - f.x) ** 2) / (2 * f.radius_x_m ** 2) + ((y - f.y) ** 2) / (2 * f.radius_y_m ** 2)));
    }
    return z;
  };
}

export function slopePct(fn, x, y) {
  const h = 0.5;
  const dx = (fn(x + h, y) - fn(x - h, y)) / (2 * h);
  const dy = (fn(x, y + h) - fn(x, y - h)) / (2 * h);
  return 100 * Math.hypot(dx, dy);
}

/** Place a building model on the site: footprint parts in site coordinates. */
export function placeBuilding(model, b) {
  const M = model.meta;
  const cx = (M.overall.x0 + M.overall.x1) / 2;
  const cy = (M.overall.y0 + M.overall.y1) / 2;
  const th = ((b.rotation_deg || 0) * Math.PI) / 180;
  const cos = Math.cos(th);
  const sin = Math.sin(th);
  const to = ([x, y]) => {
    const dx = x - cx;
    const dy = y - cy;
    return [b.x_m + dx * cos - dy * sin, b.y_m + dx * sin + dy * cos];
  };
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(to);
  const parts = [{ kind: 'building', poly: rect(M.overall.x0, M.overall.y0, M.overall.x1, M.overall.y1) }];
  model.porches.forEach((p) => {
    const roof = model.prims.find((q) => q.porch === p.id && q.cat === 'porch-roof');
    const r = roof ? [roof.min[0], roof.min[1], roof.max[0], roof.max[1]] : [p.x0, p.y0, p.x1, p.y1];
    parts.push({ kind: 'porch', poly: rect(...r), name: p.name });
  });
  const entrances = [];
  model.ramps.forEach((r) => {
    parts.push({ kind: 'ramp', poly: rect(r.x0, r.y0, r.x1, r.y1) });
    const low = {
      west: [r.x1, (r.y0 + r.y1) / 2], east: [r.x0, (r.y0 + r.y1) / 2],
      north: [(r.x0 + r.x1) / 2, r.y1], south: [(r.x0 + r.x1) / 2, r.y0],
    }[r.high];
    entrances.push(to(low));
  });
  const tr = model.prims.filter((q) => q.cat === 'trellis');
  if (tr.length) {
    const x0 = Math.min(...tr.map((q) => q.min[0]));
    const y0 = Math.min(...tr.map((q) => q.min[1]));
    const x1 = Math.max(...tr.map((q) => q.max[0]));
    const y1 = Math.max(...tr.map((q) => q.max[1]));
    parts.push({ kind: 'trellis', poly: rect(x0, y0, x1, y1) });
  }
  return { parts, entrances, centre: [b.x_m, b.y_m], to };
}

export function analyseSite(site, models) {
  const issues = [];
  const err = (m) => issues.push({ level: 'error', message: m });
  const warn = (m) => issues.push({ level: 'warning', message: m });
  const nb = site.no_build;
  const shore = site.lake.shoreline;
  const lake = lakePolygon(site);
  const wet = site.wetland.polygon;
  const parcel = site.parcel.polygon;
  const elev = elevationFn(site);
  const lanes = site.circulation.lanes;
  const area = polygonArea(parcel);

  const placed = {};
  const results = site.buildings.map((b) => {
    const model = models[b.model];
    const pl = placeBuilding(model, b);
    placed[b.id] = pl;
    const polys = pl.parts.map((p) => p.poly);
    const shoreD = Math.min(...polys.map((p) => (p.some((q) => pointInPolygon(q, lake)) ? 0 : shapeDistance(p, true, shore, false))));
    const wetD = Math.min(...polys.map((p) => shapeDistance(p, true, wet, true)));
    const inside = polys.every((p) => p.every((q) => pointInPolygon(q, parcel)));
    const main = pl.parts[0].poly;
    const slope = Math.max(slopePct(elev, b.x_m, b.y_m), ...main.map(([x, y]) => slopePct(elev, x, y)));
    const crane = b.crane_pad ? Math.hypot(b.crane_pad[0] - b.x_m, b.crane_pad[1] - b.y_m) : null;
    const laneEdge = (p) => Math.min(...lanes.map((l) => nearestOnPolyline(p, l.points).d - l.width_m / 2));
    const ent = pl.entrances.length ? Math.min(...pl.entrances.map(laneEdge)) : null;
    const r = {
      id: b.id, name: b.name, use: b.use, model: b.model,
      x_m: b.x_m, y_m: b.y_m, rotation_deg: b.rotation_deg || 0,
      footprint_m2: model.meta.footprint_m2,
      clear_floor_area_m2: model.meta.clear_floor_area_m2,
      ground_elevation_m: +elev(b.x_m, b.y_m).toFixed(1),
      slope_pct: +slope.toFixed(1),
      shoreline_m: +shoreD.toFixed(1),
      wetland_m: +wetD.toFixed(1),
      inside_parcel: inside,
      crane_reach_m: crane == null ? null : +crane.toFixed(1),
      entrance_to_lane_m: ent == null ? null : +Math.max(0, ent).toFixed(1),
      moved: b.moved || null,
      checks: [],
    };
    const check = (ok, label) => r.checks.push({ ok, label });
    check(shoreD >= nb.shoreline_setback_m, `${r.shoreline_m} m from the shoreline (setback ${nb.shoreline_setback_m} m)`);
    check(wetD >= nb.wetland_buffer_m, `${r.wetland_m} m from the wetland (buffer ${nb.wetland_buffer_m} m)`);
    check(inside, inside ? 'Inside the parcel' : 'Outside the parcel');
    check(slope <= site.terrain.max_building_slope_pct, `Ground slope ${r.slope_pct}% (limit ${site.terrain.max_building_slope_pct}%)`);
    if (crane != null) check(crane <= site.crane.max_reach_m, `Crane reach ${r.crane_reach_m} m (limit ${site.crane.max_reach_m} m)`);
    if (ent != null) check(ent <= site.circulation.max_entrance_to_lane_m, `Ramp foot ${r.entrance_to_lane_m} m from an emergency or access lane (limit ${site.circulation.max_entrance_to_lane_m} m)`);
    r.checks.forEach((c) => { if (!c.ok) err(`${b.name}: ${c.label}`); });
    r.ok = r.checks.every((c) => c.ok);
    return r;
  });

  /* buildings must not collide with each other or with lanes */
  const ids = Object.keys(placed);
  ids.forEach((a, i) => {
    ids.slice(i + 1).forEach((c) => {
      let d = Infinity;
      placed[a].parts.forEach((p) => placed[c].parts.forEach((q) => { d = Math.min(d, shapeDistance(p.poly, true, q.poly, true)); }));
      if (d === 0) err(`Buildings ${a} and ${c} overlap`);
      else if (d < 6) warn(`Buildings ${a} and ${c} are only ${d.toFixed(1)} m apart: check spatial separation and fire spread`);
      const ra = results.find((r) => r.id === a);
      const rc = results.find((r) => r.id === c);
      ra.nearest_building_m = Math.min(ra.nearest_building_m ?? Infinity, +d.toFixed(1));
      rc.nearest_building_m = Math.min(rc.nearest_building_m ?? Infinity, +d.toFixed(1));
    });
    placed[a].parts.forEach((p) => {
      lanes.forEach((l) => {
        const d = shapeDistance(p.poly, true, l.points, false) - l.width_m / 2;
        if (d < 1) err(`${a} ${p.kind} is within ${Math.max(0, d).toFixed(1)} m of the ${l.name}`);
      });
    });
  });

  /* lanes, parking and crane pads stay out of the no-build zones */
  const clearOf = (pts, closed, label, halfWidth = 0) => {
    const ds = closed ? shapeDistance(pts, true, shore, false) : Math.min(...samplePolyline(pts, 2).map((p) => (pointInPolygon(p, lake) ? 0 : distPointPolyline(p, shore))));
    const dw = closed ? shapeDistance(pts, true, wet, true) : Math.min(...samplePolyline(pts, 2).map((p) => (pointInPolygon(p, wet) ? 0 : distPointPolyline(p, wet, true))));
    if (ds - halfWidth < nb.shoreline_setback_m) err(`${label} enters the shoreline setback`);
    if (dw - halfWidth < nb.wetland_buffer_m) err(`${label} enters the wetland buffer`);
  };
  lanes.forEach((l) => clearOf(l.points, false, l.name, l.width_m / 2));
  clearOf(site.circulation.parking.polygon, true, 'Parking');
  site.buildings.forEach((b) => {
    if (!b.crane_pad) return;
    const [x, y] = b.crane_pad;
    clearOf([[x - 4, y - 4], [x + 4, y - 4], [x + 4, y + 4], [x - 4, y + 4]], true, `${b.name} crane pad`);
  });

  return {
    area_m2: Math.round(area),
    area_acres: +(area / ACRE_M2).toFixed(2),
    area_ha: +(area / 10000).toFixed(2),
    buildings: results,
    issues,
    placed,
  };
}

/* ---------------- rendering ---------------- */

const P = (pts) => 'M' + pts.map((p) => `${fmt(p[0], 1)} ${fmt(p[1], 1)}`).join('L');
const PZ = (pts) => P(pts) + 'Z';

function smoothPath(pts, closed) {
  // Catmull-Rom to cubic Bezier, for natural shorelines and contours.
  if (pts.length < 3) return closed ? PZ(pts) : P(pts);
  const n = pts.length;
  const get = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${fmt(pts[0][0], 1)} ${fmt(pts[0][1], 1)}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = get(i - 1); const p1 = get(i); const p2 = get(i + 1); const p3 = get(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${fmt(c1[0], 1)} ${fmt(c1[1], 1)} ${fmt(c2[0], 1)} ${fmt(c2[1], 1)} ${fmt(p2[0], 1)} ${fmt(p2[1], 1)}`;
  }
  return closed ? d + 'Z' : d;
}

export function siteLayers(site, models, analysis) {
  const W = site.map.width_m;
  const H = site.map.height_m;
  const elev = elevationFn(site);
  const lake = lakePolygon(site);
  const shore = site.lake.shoreline;
  const wet = site.wetland.polygon;
  const nb = site.no_build;

  const contours = [];
  const t = site.terrain;
  let lo = Infinity;
  let hi = -Infinity;
  for (let x = 0; x <= W; x += 5) for (let y = 0; y <= H; y += 5) { const z = elev(x, y); lo = Math.min(lo, z); hi = Math.max(hi, z); }
  for (let z = t.lake_level_m + t.contour_interval_m; z < hi; z += t.contour_interval_m) {
    isolines(elev, 0, 0, W, H, 3, z).forEach((l) => {
      const pts = simplify(l.points, 0.4).filter((p) => !pointInPolygon(p, lake));
      if (pts.length > 1) contours.push({ z, pts, closed: l.closed });
    });
  }

  const signedShore = (x, y) => (pointInPolygon([x, y], lake) ? -1 : 1) * distPointPolyline([x, y], shore);
  const signedWet = (x, y) => (pointInPolygon([x, y], wet) ? -1 : 1) * distPointPolyline([x, y], wet, true);
  const bufferPoly = (fn, d, insidePt) => {
    const ls = isolines(fn, 0, 0, W, H, 2, d).sort((a, b) => b.points.length - a.points.length);
    if (!ls.length) return null;
    const line = simplify(ls[0].points, 0.3);
    return { edge: line, poly: ls[0].closed ? line : closeAlongBoundary(line, W, H, insidePt) };
  };
  const shoreBuffer = bufferPoly(signedShore, nb.shoreline_setback_m, [5, H / 2]);
  const wetBuffer = bufferPoly(signedWet, nb.wetland_buffer_m, centroid(wet));

  /* trees: deterministic scatter outside cleared areas */
  const rnd = mulberry32(site.trees.seed);
  const trees = [];
  const lanes = site.circulation.lanes;
  const placed = analysis.placed;
  const clear = site.trees.clearance_m;
  let guard = 0;
  while (trees.length < site.trees.count && guard++ < 20000) {
    const x = rnd() * W;
    const y = rnd() * H;
    const r = 3.2 + rnd() * 2.8;
    const p = [x, y];
    if (pointInPolygon(p, lake) || pointInPolygon(p, wet)) continue;
    if (distPointPolyline(p, shore) < r * 0.6) continue;
    if (pointInPolygon(p, site.circulation.parking.polygon) || distPointPolyline(p, site.circulation.parking.polygon, true) < r) continue;
    if (lanes.some((l) => distPointPolyline(p, l.points) < l.width_m / 2 + r * 0.7)) continue;
    let blocked = false;
    for (const id of Object.keys(placed)) {
      for (const part of placed[id].parts) {
        if (pointInPolygon(p, part.poly) || distPointPolyline(p, part.poly, true) < clear + r * 0.5) { blocked = true; break; }
      }
      if (blocked) break;
      const b = site.buildings.find((bb) => bb.id === id);
      if (b.crane_pad && Math.hypot(b.crane_pad[0] - x, b.crane_pad[1] - y) < 6 + r) blocked = true;
      for (const e of placed[id].entrances) {
        const near = lanes.map((l) => nearestOnPolyline(e, l.points)).sort((a, c) => a.d - c.d)[0];
        if (distPointPolyline(p, [e, near.point]) < r * 0.6 + 1) blocked = true;
      }
      if (blocked) break;
    }
    if (blocked) continue;
    if (trees.some((q) => Math.hypot(q[0] - x, q[1] - y) < (q[2] + r) * 0.8)) continue;
    trees.push([x, y, r]);
  }

  /* footpath spurs from each ramp foot to the nearest lane */
  const spurs = [];
  Object.keys(placed).forEach((id) => {
    placed[id].entrances.forEach((e) => {
      const near = lanes.map((l) => ({ l, ...nearestOnPolyline(e, l.points) })).sort((a, c) => a.d - c.d)[0];
      spurs.push({ id, from: e, to: near.point });
    });
  });

  return { contours, shoreBuffer, wetBuffer, trees, spurs, lake, W, H };
}

export function renderSitePlan(site, models, analysis, layers, opts = {}) {
  const { W, H, contours, shoreBuffer, wetBuffer, trees, spurs, lake } = layers;
  const pre = opts.idPrefix || 'site-';
  const legendH = opts.legend ? 46 : 0;
  const nb = site.no_build;
  const out = [];
  const titleId = `${pre}title`;
  const descId = `${pre}desc`;
  const names = site.buildings.map((b) => {
    const r = analysis.buildings.find((x) => x.id === b.id);
    return `${b.name} (${b.use}, ${r.shoreline_m} m from the shoreline)`;
  });
  const desc = `Fictional ${analysis.area_acres}-acre (${analysis.area_ha} ha) parcel drawn to scale in metres, north up. ` +
    `A lake lies along the west boundary and a protected wetland in the south-east corner. ` +
    `Hatched no-build zones show a ${nb.shoreline_setback_m} m shoreline setback and a ${nb.wetland_buffer_m} m wetland buffer (placeholder values). ` +
    `A wooded hill rises to the north. Vehicles arrive from the east at shared parking beside the common lodge; ` +
    `a gravel emergency and construction lane with a south spur runs west past the homes, with crane standing points beside each building. ` +
    `Buildings: ${names.join('; ')}. Not surveyed; not for construction.`;

  out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H + legendH}"${opts.inline ? ' class="site-map-svg"' : ` width="${W * 2.8}" height="${(H + legendH) * 2.8}"`} role="img" aria-labelledby="${titleId} ${descId}">`);
  out.push(`<title id="${titleId}">Fictional 15-acre Eco Hamlet site plan</title>`);
  out.push(`<desc id="${descId}">${esc(desc)}</desc>`);
  out.push('<defs>' +
    `<pattern id="${pre}hatch" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="3" fill="#f3e3c3" fill-opacity="0.55"/><path d="M0 0V3" stroke="#a5552d" stroke-width="0.55"/></pattern>` +
    `<pattern id="${pre}marsh" width="7" height="6" patternUnits="userSpaceOnUse"><rect width="7" height="6" fill="#9cc3a7"/><path d="M1.5 4.5l1-2 1 2M4.5 2.2l1-1.6 1 1.6" fill="none" stroke="#4f7d64" stroke-width="0.45"/></pattern>` +
    `<clipPath id="${pre}land"><path d="${PZ(site.parcel.polygon)}"/></clipPath>` +
    '</defs>');
  out.push(`<rect width="${W}" height="${H}" fill="#dfe8cf"/>`);
  out.push(`<rect x="${fmt(site.parcel.polygon[site.parcel.polygon.length - 1][0], 1)}" width="${fmt(W - site.parcel.polygon[site.parcel.polygon.length - 1][0], 1)}" height="${H}" fill="#d3dcc4"/>`);

  // contours
  out.push(`<g id="${pre}layer-contours" class="layer layer-contours" fill="none" stroke="#9fb791" stroke-width="0.45">`);
  contours.forEach((c) => {
    const major = Math.round(c.z) % 10 === 0;
    out.push(`<path d="${smoothPath(c.pts, c.closed)}"${major ? ' stroke-width="0.9"' : ''}/>`);
  });
  contours.filter((c) => Math.round(c.z) % 10 === 0 && c.pts.length > 6).forEach((c) => {
    const p = c.pts[Math.floor(c.pts.length / 2)];
    out.push(`<text x="${fmt(p[0], 1)}" y="${fmt(p[1], 1)}" font-size="4" fill="#5e7a52" stroke="#dfe8cf" stroke-width="1.2" paint-order="stroke" font-family="system-ui, sans-serif" text-anchor="middle">${Math.round(c.z)} m</text>`);
  });
  out.push('</g>');

  // no-build buffers
  out.push(`<g id="${pre}layer-buffers" class="layer layer-buffers" clip-path="url(#${pre}land)">`);
  if (shoreBuffer) out.push(`<path d="${PZ(shoreBuffer.poly)}" fill="url(#${pre}hatch)"/>`);
  if (wetBuffer) out.push(`<path d="${PZ(wetBuffer.poly)}" fill="url(#${pre}hatch)"/>`);
  [shoreBuffer, wetBuffer].forEach((b) => { if (b) out.push(`<path d="${P(b.edge)}" fill="none" stroke="#a5552d" stroke-width="0.8" stroke-dasharray="3 2"/>`); });
  out.push('</g>');

  // water and wetland
  out.push(`<path d="${smoothPath(site.wetland.polygon, true)}" fill="url(#${pre}marsh)" stroke="#4f7d64" stroke-width="0.8"/>`);
  out.push(`<path d="${PZ(lake)}" fill="#8ebdcc"/>`);
  out.push(`<path d="${smoothPath(site.lake.shoreline, false)}" fill="none" stroke="#e4dfb3" stroke-width="3.5"/>`);
  out.push(`<path d="${smoothPath(site.lake.shoreline, false)}" fill="none" stroke="#4d8ba0" stroke-width="0.8"/>`);

  // parcel line
  const parcel = site.parcel.polygon;
  const boundary = parcel.slice(site.lake.shoreline.length - 1).concat([parcel[0]]);
  out.push(`<path d="${P(boundary)}" fill="none" stroke="#7a3b2e" stroke-width="0.9" stroke-dasharray="8 2 1.5 2"/>`);

  // trees
  out.push(`<g id="${pre}layer-trees" class="layer layer-trees">`);
  out.push('<g fill="#4f8062" fill-opacity="0.85">' + trees.map((t) => `<circle cx="${fmt(t[0], 1)}" cy="${fmt(t[1], 1)}" r="${fmt(t[2], 1)}"/>`).join('') + '</g>');
  out.push('<g fill="#3f6d52" fill-opacity="0.7">' + trees.map((t) => `<circle cx="${fmt(t[0] - t[2] * 0.25, 1)}" cy="${fmt(t[1] + t[2] * 0.2, 1)}" r="${fmt(t[2] * 0.62, 1)}"/>`).join('') + '</g>');
  out.push('</g>');

  // circulation
  const circ = site.circulation;
  out.push(`<g id="${pre}layer-access" class="layer layer-access" fill="none" stroke-linecap="round" stroke-linejoin="round">`);
  out.push(`<path d="${PZ(circ.parking.polygon)}" fill="#e9dfc5" stroke="#9b8a6a" stroke-width="0.8"/>`);
  circ.lanes.forEach((l) => {
    const casing = l.kind === 'vehicle' ? '#9b8a6a' : '#b7ad85';
    const fill = l.kind === 'vehicle' ? '#e9dfc5' : '#e4e0bd';
    out.push(`<path d="${P(l.points)}" stroke="${casing}" stroke-width="${l.width_m + 1}"/>`);
    out.push(`<path d="${P(l.points)}" stroke="${fill}" stroke-width="${l.width_m}"${l.kind === 'vehicle' ? '' : ''}/>`);
    if (l.kind !== 'vehicle') out.push(`<path d="${P(l.points)}" stroke="#a69b6b" stroke-width="0.4" stroke-dasharray="2 2"/>`);
    if (l.turnaround) {
      const e = l.points[l.points.length - 1];
      out.push(`<circle cx="${fmt(e[0], 1)}" cy="${fmt(e[1], 1)}" r="9" fill="${fill}" stroke="${casing}" stroke-width="0.8"/>`);
    }
  });
  spurs.forEach((s) => {
    out.push(`<path d="${P([s.from, s.to])}" stroke="#bfae86" stroke-width="2.6"/><path d="${P([s.from, s.to])}" stroke="#f3ecd8" stroke-width="1.8"/>`);
  });
  circ.trails.forEach((t) => {
    out.push(`<path d="${P(t.points)}" stroke="#8a6a48" stroke-width="0.8" stroke-dasharray="2.5 1.5"/>`);
  });
  out.push('</g>');

  // construction: crane standing points and reach
  out.push(`<g id="${pre}layer-construction" class="layer layer-construction" fill="none">`);
  site.buildings.forEach((b) => {
    if (!b.crane_pad) return;
    const [x, y] = b.crane_pad;
    out.push(`<circle cx="${fmt(x, 1)}" cy="${fmt(y, 1)}" r="${site.crane.max_reach_m}" stroke="#b45e1c" stroke-width="0.5" stroke-dasharray="1.5 1.5"/>` +
      `<rect x="${fmt(x - 4, 1)}" y="${fmt(y - 4, 1)}" width="8" height="8" stroke="#b45e1c" stroke-width="0.9" fill="#f6e2cf" fill-opacity="0.6"/>` +
      `<path d="M${fmt(x - 2.5, 1)} ${fmt(y - 2.5, 1)}l5 5m0 -5l-5 5" stroke="#b45e1c" stroke-width="0.7"/>`);
  });
  out.push('</g>');

  // buildings
  out.push(`<g id="${pre}buildings" class="buildings">`);
  site.buildings.forEach((b) => {
    const pl = analysis.placed[b.id];
    out.push(`<g id="${pre}building-${b.id}" class="building" data-building="${b.id}">`);
    const fills = { building: b.id === 'lodge' ? '#8a694d' : '#b58a62', porch: '#d9c7a5', ramp: '#cdb48e', trellis: '#6e5a3d' };
    pl.parts.forEach((p) => {
      out.push(`<path class="part part-${p.kind}" d="${PZ(p.poly)}" fill="${fills[p.kind]}" stroke="#274c3b" stroke-width="${p.kind === 'building' ? 0.7 : 0.4}"/>`);
    });
    const label = b.id === 'lodge' ? 'LODGE' : b.id.toUpperCase();
    const main = pl.parts[0].poly;
    const top = Math.min(...main.map((p) => p[1]));
    out.push(`<text x="${fmt(b.x_m, 1)}" y="${fmt(top - 2.5, 1)}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="${b.id === 'lodge' ? 5.5 : 6.5}" font-weight="700" fill="#1d392c" stroke="#f6f5ee" stroke-width="1.4" paint-order="stroke">${label}</text>`);
    out.push(`<circle class="hit" cx="${fmt(b.x_m, 1)}" cy="${fmt(b.y_m, 1)}" r="${b.id === 'lodge' ? 15 : 11}" fill="transparent"/>`);
    out.push('</g>');
  });
  out.push('</g>');

  // labels
  const T = (x, y, s, size, extra = '') => `<text x="${x}" y="${y}" font-size="${size}"${extra}>${esc(s)}</text>`;
  out.push('<g font-family="system-ui, sans-serif" fill="#1d392c" stroke="#f6f5ee" stroke-width="1.2" paint-order="stroke">');
  out.push(T(10, 16, 'ECO HAMLET', 9, ' font-weight="800" letter-spacing="1"'));
  out.push(T(10, 25, `Fictional ${analysis.area_acres}-acre site • not surveyed`, 5));
  out.push(T(18, 118, 'LAKE', 8, ' fill="#1f4f60" stroke="#8ebdcc"'));
  out.push(T(286, 200, 'WETLAND', 6.5, ' font-weight="700"'));
  out.push(T(286, 207, 'protected', 4.5));
  out.push(T(296, 99, 'PARKING', 5, ' font-weight="700"'));
  out.push(T(318, 112, 'ARRIVAL →', 4.5));
  out.push(T(100, 48, `${nb.shoreline_setback_m} m shoreline setback`, 4.5, ' fill="#7d3a18"'));
  out.push(T(214, 154, `${nb.wetland_buffer_m} m wetland buffer`, 4.5, ' fill="#7d3a18"'));
  out.push(T(98, 101, 'shore trail', 4, ' fill="#5a4026"'));
  out.push(T(306, 14, 'HILL', 6, ' fill="#3d6b53" font-weight="700"'));
  out.push('</g>');

  // north arrow and scale bar
  out.push(`<g aria-hidden="true" font-family="system-ui, sans-serif"><circle cx="${W - 11}" cy="29" r="11" fill="#f6f5ee" fill-opacity="0.85"/><path d="M${W - 16} 34l5 -16l5 16l-5 -4z" fill="#1d392c"/><text x="${W - 11}" y="42" font-size="6" text-anchor="middle" font-weight="700" fill="#1d392c">N</text></g>`);
  const sx = 12;
  const sy = H - 10;
  out.push(`<g font-family="system-ui, sans-serif" font-size="4.5" fill="#1d392c"><rect x="${sx}" y="${sy}" width="25" height="2" fill="#1d392c"/><rect x="${sx + 25}" y="${sy}" width="25" height="2" fill="#fff" stroke="#1d392c" stroke-width="0.4"/><text x="${sx}" y="${sy - 2}">0</text><text x="${sx + 25}" y="${sy - 2}" text-anchor="middle">25</text><text x="${sx + 50}" y="${sy - 2}" text-anchor="middle">50 m</text></g>`);

  if (opts.legend) {
    const y0 = H + 6;
    const items = [
      ['url(#' + pre + 'hatch)', 'No-build zone (placeholder)'],
      ['url(#' + pre + 'marsh)', 'Protected wetland'],
      ['#8ebdcc', 'Lake'],
      ['#e4e0bd', 'Emergency / construction lane'],
      ['#e9dfc5', 'Access lane and parking'],
      ['#f3ecd8', 'Accessible path to ramp'],
      ['#f6e2cf', 'Crane standing point and reach'],
      ['#b58a62', 'Home (true scale)'],
      ['#d9c7a5', 'Porch'],
      ['#cdb48e', 'Ramp'],
    ];
    out.push(`<rect y="${H}" width="${W}" height="${legendH}" fill="#faf8f2"/>`);
    out.push('<g font-family="system-ui, sans-serif" font-size="4.2" fill="#1d392c">');
    items.forEach(([f, l], i) => {
      const x = 10 + (i % 4) * 86;
      const y = y0 + Math.floor(i / 4) * 9;
      out.push(`<rect x="${x}" y="${y}" width="7" height="5" fill="${f}" stroke="#1d392c" stroke-width="0.3"/><text x="${x + 10}" y="${y + 4.3}">${esc(l)}</text>`);
    });
    out.push(`<text x="10" y="${H + legendH - 4}" font-size="3.8">Original concept | CC BY 4.0 | Eco Hamlet contributors 2026 | Fictional site; contours, buffers and positions are illustrative</text>`);
    out.push('</g>');
  }
  out.push('</svg>');
  return out.join('');
}
