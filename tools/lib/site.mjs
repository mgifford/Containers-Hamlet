// Site analysis (terrain, buffers, slopes, access, views, building benches) and
// site-plan SVG. The plan is drawn in metres: the SVG viewBox units are metres.
// Everything here is invented for discussion, not surveyed. MIT licence.
import {
  polygonArea, pointInPolygon, distPointPolyline, distPointSegment, shapeDistance,
  nearestOnPolyline, samplePolyline, simplify, isolines, closeAlongBoundary,
  mulberry32, centroid,
} from './geo.mjs';
import { esc, fmt } from './svg.mjs';

const ACRE_M2 = 4046.8564224;
const DEG = 180 / Math.PI;

/* ---------------- terrain ---------------- */

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

function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

/** Natural ground before building benches. */
export function baseElevationFn(site) {
  const t = site.terrain;
  const shore = site.lake.shoreline;
  const seedPhase = ((t.seed || 0) % 97) / 97 * Math.PI * 2;
  const components = (t.roughness && t.roughness.components) || [];
  const amp = (t.roughness && t.roughness.amplitude_m) || 0;
  return (x, y) => {
    let z = t.lake_level_m + t.rise_from_shore_per_m * (x - shoreXAt(shore, y));
    for (const f of t.features) {
      z += f.height_m * Math.exp(-(((x - f.x) ** 2) / (2 * f.radius_x_m ** 2) + ((y - f.y) ** 2) / (2 * f.radius_y_m ** 2)));
    }
    for (const c of components) {
      z += amp * c.weight * Math.sin(x / c.wavelength_x_m + c.phase + seedPhase) *
        Math.cos(y / c.wavelength_y_m + c.phase * 1.7 + seedPhase);
    }
    return z;
  };
}

function padWeight(r, radius, blend) {
  if (r <= radius) return 1;
  if (r >= radius + blend) return 0;
  return 1 - smoothstep((r - radius) / blend);
}

/** Ground with the illustrative building benches blended in. */
export function elevationFn(site) {
  const base = baseElevationFn(site);
  const pads = site.terrain.building_pads;
  if (!pads || pads.radius_m == null) return base;
  const targets = site.buildings
    .filter((b) => b.pad !== false)
    .map((b) => ({ x: b.x_m, y: b.y_m, z: base(b.x_m, b.y_m) }));
  return (x, y) => {
    let z = base(x, y);
    for (const p of targets) {
      const r = Math.hypot(x - p.x, y - p.y);
      if (r >= pads.radius_m + pads.blend_m) continue;
      const w = padWeight(r, pads.radius_m, pads.blend_m);
      z = z * (1 - w) + p.z * w;
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

export function terrainGrid(site, step = 5) {
  const W = site.map.width_m;
  const H = site.map.height_m;
  const elev = elevationFn(site);
  const nx = Math.floor(W / step) + 1;
  const ny = Math.floor(H / step) + 1;
  const values = [];
  for (let j = 0; j < ny; j++) {
    const row = [];
    for (let i = 0; i < nx; i++) row.push(+elev(i * step, j * step).toFixed(2));
    values.push(row);
  }
  return { step_m: step, nx, ny, origin: [0, 0], x_axis_east: true, y_axis_south: true, lake_level_m: site.terrain.lake_level_m, values };
}

export function terrainHash(grid) {
  let h = 2166136261;
  const s = grid.values.map((r) => r.join(',')).join(';');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

/* ---------------- bearings and views ---------------- */

export function bearingDeg(from, to) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  return (Math.atan2(dx, -dy) * DEG + 360) % 360;
}

export function angularDiff(a, b) {
  const d = Math.abs((a - b + 540) % 360 - 180);
  return d;
}

const FACE_VECTORS = { north: [0, -1], south: [0, 1], west: [-1, 0], east: [1, 0] };

/** Compass bearing of a building face after rotation (clockwise degrees). */
export function faceBearing(side, rotationDeg = 0) {
  const v = FACE_VECTORS[side] || FACE_VECTORS.south;
  const th = (rotationDeg * Math.PI) / 180;
  const cos = Math.cos(th);
  const sin = Math.sin(th);
  const x = v[0] * cos - v[1] * sin;
  const y = v[0] * sin + v[1] * cos;
  return (Math.atan2(x, -y) * DEG + 360) % 360;
}

function principalSide(model) {
  const porch = (model.porches || []).find((p) => p.screened) || (model.porches || [])[0];
  return porch ? porch.side : 'south';
}

export function targetPoint(site, target, from) {
  if (!target) return null;
  if (target.type === 'lake') {
    return nearestOnPolyline(from, site.lake.shoreline).point;
  }
  if (target.type === 'wetland') {
    const poly = site.wetland.polygon;
    let best = null;
    for (let i = 0; i < poly.length; i++) {
      const p = nearestOnPolyline(from, [poly[i], poly[(i + 1) % poly.length]]).point;
      const d = Math.hypot(p[0] - from[0], p[1] - from[1]);
      if (!best || d < best.d) best = { point: p, d };
    }
    return best && best.point;
  }
  if (target.type === 'landmark') {
    const l = (site.landmarks || []).find((x) => x.id === target.id);
    return l ? [l.x, l.y] : null;
  }
  if (target.type === 'clearing') {
    const c = (site.clearings || []).find((x) => x.id === target.id);
    return c ? centroid(c.polygon) : null;
  }
  return null;
}

function inAnyWoodland(site, p) {
  return (site.woodland.stands || []).find((s) => pointInPolygon(p, s.polygon)) || null;
}

/** Sample three rays through the view cone to describe canopy, not to score privacy. */
function viewCanopy(site, from, azimuth, distance = 90) {
  let samples = 0;
  let wooded = 0;
  let conifer = 0;
  let open = 0;
  for (const off of [-22, 0, 22]) {
    const a = ((azimuth + off) * Math.PI) / 180;
    const dx = Math.sin(a);
    const dy = -Math.cos(a);
    for (let d = 8; d <= distance; d += 4) {
      const p = [from[0] + dx * d, from[1] + dy * d];
      samples++;
      const inWater = pointInPolygon(p, lakePolygon(site)) || pointInPolygon(p, site.wetland.polygon);
      const inClearing = (site.clearings || []).some((c) => pointInPolygon(p, c.polygon)) ||
        site.buildings.some((b) => Math.hypot(p[0] - b.x_m, p[1] - b.y_m) < (b.clearing_radius_m || 11));
      const onRock = (site.rocks || []).some((k) => pointInPolygon(p, k.polygon));
      const onLand = pointInPolygon(p, site.parcel.polygon);
      const stand = inWater || inClearing || onRock || !onLand ? null : (inAnyWoodland(site, p) || { type: 'mixed', conifer_share: 0.35 });
      if (stand) {
        wooded++;
        conifer += stand.conifer_share == null ? (stand.type === 'conifer' ? 1 : 0) : stand.conifer_share;
      } else {
        open++;
      }
    }
  }
  const pct = (n) => Math.round((n / samples) * 100);
  return { samples, wooded_pct: pct(wooded), conifer_pct: pct(conifer), open_pct: pct(open) };
}

export function describeCanopy(v) {
  if (v.wooded_pct >= 70 && v.conifer_pct >= 30) return 'mostly wooded, with a strong conifer component for winter screening';
  if (v.wooded_pct >= 70) return 'mostly wooded, with deciduous trees that open the view in winter';
  if (v.wooded_pct >= 40) return 'partly wooded, with openings that reveal the water or sky';
  return 'an open view with little tree screening';
}

/* ---------------- placement ---------------- */

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
  const rampFeet = [];
  model.ramps.forEach((r) => {
    parts.push({ kind: 'ramp', poly: rect(r.x0, r.y0, r.x1, r.y1) });
    const low = {
      west: [r.x1, (r.y0 + r.y1) / 2], east: [r.x0, (r.y0 + r.y1) / 2],
      north: [(r.x0 + r.x1) / 2, r.y1], south: [(r.x0 + r.x1) / 2, r.y0],
    }[r.high];
    rampFeet.push(to(low));
  });
  const tr = model.prims.filter((q) => q.cat === 'trellis');
  if (tr.length) {
    const x0 = Math.min(...tr.map((q) => q.min[0]));
    const y0 = Math.min(...tr.map((q) => q.min[1]));
    const x1 = Math.max(...tr.map((q) => q.max[0]));
    const y1 = Math.max(...tr.map((q) => q.max[1]));
    parts.push({ kind: 'trellis', poly: rect(x0, y0, x1, y1) });
  }
  const doors = [];
  model.openings.filter((o) => o.exterior && (o.type === 'door' || o.type === 'sliding-door')).forEach((o) => {
    const along = (o.a0 + o.a1) / 2;
    let p;
    if (o.face === 'north') p = [along, -M.tOut];
    else if (o.face === 'south') p = [along, M.Wt + M.tOut];
    else if (o.face === 'west') p = [-M.tOut, along];
    else p = [M.L + M.tOut, along];
    doors.push({ id: o.id, name: o.name, face: o.face, point: to(p) });
  });
  const side = principalSide(model);
  return {
    parts, rampFeet, doors, centre: [b.x_m, b.y_m], to,
    principal: { side, azimuth: faceBearing(side, b.rotation_deg || 0) },
  };
}

/* ---------------- site analysis ---------------- */

function polygonInside(poly, parcel) {
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 2));
    for (let k = 0; k <= n; k++) {
      const p = [a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n];
      if (!pointInPolygon(p, parcel)) return false;
    }
  }
  return true;
}

function minDistanceToParts(parts, target, closed) {
  let d = Infinity;
  for (const p of parts) d = Math.min(d, shapeDistance(p.poly, true, target, closed));
  return d;
}

function minDistanceToDrainage(site, parts) {
  let best = { d: Infinity, id: null };
  for (const d of site.drainage || []) {
    for (const p of parts) {
      const dist = Math.max(0, shapeDistance(p.poly, true, d.points, false) - (d.width_m || 0) / 2);
      if (dist < best.d) best = { d: dist, id: d.id };
    }
  }
  return best;
}

function padCutFill(site, b, model) {
  const base = baseElevationFn(site);
  const target = base(b.x_m, b.y_m);
  const M = model.meta;
  const th = ((b.rotation_deg || 0) * Math.PI) / 180;
  const cos = Math.cos(th);
  const sin = Math.sin(th);
  const cx = (M.overall.x0 + M.overall.x1) / 2;
  const cy = (M.overall.y0 + M.overall.y1) / 2;
  const local = [
    [M.overall.x0, M.overall.y0], [M.overall.x1, M.overall.y0],
    [M.overall.x1, M.overall.y1], [M.overall.x0, M.overall.y1],
    [cx, M.overall.y0], [cx, M.overall.y1], [M.overall.x0, cy], [M.overall.x1, cy],
  ];
  let cut = 0;
  let fill = 0;
  for (const [lx, ly] of local) {
    const dx = lx - cx;
    const dy = ly - cy;
    const x = b.x_m + dx * cos - dy * sin;
    const y = b.y_m + dx * sin + dy * cos;
    const diff = base(x, y) - target;
    cut = Math.max(cut, diff);
    fill = Math.max(fill, -diff);
  }
  return { target_m: +target.toFixed(2), cut_m: +cut.toFixed(2), fill_m: +fill.toFixed(2), max_m: +Math.max(cut, fill).toFixed(2) };
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
  const baseElev = baseElevationFn(site);
  const elev = elevationFn(site);
  const lanes = site.circulation.lanes;
  const area = polygonArea(parcel);
  const pads = site.terrain.building_pads || { max_cut_fill_m: 1.6 };

  const placed = {};
  const results = site.buildings.map((b) => {
    const model = models[b.model];
    if (!model) {
      err(`${b.name}: unknown building model "${b.model}"`);
      return { id: b.id, name: b.name, use: b.use, model: b.model, ok: false, checks: [] };
    }
    const pl = placeBuilding(model, b);
    placed[b.id] = pl;
    const polys = pl.parts.map((p) => p.poly);
    const shoreD = Math.min(...polys.map((p) => (p.some((q) => pointInPolygon(q, lake)) ? 0 : shapeDistance(p, true, shore, false))));
    const wetD = Math.min(...polys.map((p) => shapeDistance(p, true, wet, true)));
    const inside = polys.every((p) => polygonInside(p, parcel));
    const rock = (site.rocks || []).reduce((best, r) => {
      const d = minDistanceToParts(pl.parts, r.polygon, true);
      return d < best.d ? { d, id: r.id, name: r.name } : best;
    }, { d: Infinity, id: null, name: null });
    const drain = minDistanceToDrainage(site, pl.parts);
    const naturalSlope = Math.max(
      slopePct(baseElev, b.x_m, b.y_m),
      ...polys[0].map(([x, y]) => slopePct(baseElev, x, y)),
    );
    const pad = padCutFill(site, b, model);
    const crane = b.crane_pad ? Math.hypot(b.crane_pad[0] - b.x_m, b.crane_pad[1] - b.y_m) : null;
    const laneEdge = (p) => Math.min(...lanes.map((l) => nearestOnPolyline(p, l.points).d - l.width_m / 2));
    const rampToLane = pl.rampFeet.length ? Math.min(...pl.rampFeet.map(laneEdge)) : null;
    const trailEdge = (p) => Math.min(...(site.circulation.trails || []).map((t) => nearestOnPolyline(p, t.points).d - t.width_m / 2));
    const doorToTrail = pl.doors.length ? Math.min(...pl.doors.map((d) => trailEdge(d.point))) : null;
    const rampToTrail = pl.rampFeet.length ? Math.min(...pl.rampFeet.map(trailEdge)) : null;
    const r = {
      id: b.id, name: b.name, short_name: b.short_name || b.name, use: b.use, model: b.model,
      x_m: b.x_m, y_m: b.y_m, rotation_deg: b.rotation_deg || 0,
      footprint_m2: model.meta.footprint_m2,
      clear_floor_area_m2: model.meta.clear_floor_area_m2,
      ground_elevation_m: +elev(b.x_m, b.y_m).toFixed(1),
      natural_slope_pct: +naturalSlope.toFixed(1),
      pad,
      shoreline_m: +shoreD.toFixed(1),
      wetland_m: +wetD.toFixed(1),
      rock_m: rock.id ? +rock.d.toFixed(1) : null,
      rock_name: rock.name,
      drainage_m: drain.id ? +drain.d.toFixed(1) : null,
      drainage_name: drain.id,
      inside_parcel: inside,
      crane_reach_m: crane == null ? null : +crane.toFixed(1),
      entrance_to_lane_m: rampToLane == null ? null : +Math.max(0, rampToLane).toFixed(1),
      door_to_trail_m: doorToTrail == null ? null : +Math.max(0, doorToTrail).toFixed(1),
      ramp_to_trail_m: rampToTrail == null ? null : +Math.max(0, rampToTrail).toFixed(1),
      principal_facade: pl.principal.side,
      principal_azimuth_deg: +pl.principal.azimuth.toFixed(1),
      views: {},
      checks: [],
    };
    const check = (ok, label) => r.checks.push({ ok, label });
    check(shoreD >= nb.shoreline_setback_m, `${r.shoreline_m} m from the shoreline (setback ${nb.shoreline_setback_m} m)`);
    check(wetD >= nb.wetland_buffer_m, `${r.wetland_m} m from the wetland (buffer ${nb.wetland_buffer_m} m)`);
    check(inside, inside ? 'Inside the parcel' : 'Outside the parcel');
    check(r.rock_m == null || r.rock_m >= nb.rock_buffer_m, r.rock_m == null ? 'No rock outcrop nearby' : `${r.rock_m} m from ${r.rock_name} (buffer ${nb.rock_buffer_m} m)`);
    check(r.drainage_m == null || r.drainage_m >= nb.drainage_buffer_m, r.drainage_m == null ? 'No drainage channel nearby' : `${r.drainage_m} m from a drainage channel (buffer ${nb.drainage_buffer_m} m)`);
    check(r.natural_slope_pct <= site.terrain.max_building_slope_pct, `Natural ground slope ${r.natural_slope_pct}% (limit ${site.terrain.max_building_slope_pct}%)`);
    check(pad.max_m <= (pads.max_cut_fill_m || 1.6), `Building bench cut/fill ${pad.max_m} m (limit ${pads.max_cut_fill_m || 1.6} m)`);
    if (crane != null) check(crane <= site.crane.max_reach_m, `Crane reach ${r.crane_reach_m} m (limit ${site.crane.max_reach_m} m)`);
    if (rampToLane != null) check(rampToLane <= site.circulation.max_entrance_to_lane_m, `Ramp foot ${r.entrance_to_lane_m} m from an emergency or access lane (limit ${site.circulation.max_entrance_to_lane_m} m)`);
    if (doorToTrail != null) check(doorToTrail <= 18, `Entry ${r.door_to_trail_m} m from a walking path (limit 18 m)`);
    if (rampToTrail != null) check(rampToTrail <= 18, `Ramp foot ${r.ramp_to_trail_m} m from a walking path (limit 18 m)`);

    const v = b.views || {};
    const main = v.main || {};
    const target = targetPoint(site, main.target, [b.x_m, b.y_m]);
    if (!target) err(`${b.name}: the main view has no resolvable landscape target`);
    else {
      const bearing = bearingDeg([b.x_m, b.y_m], target);
      const distance = Math.hypot(target[0] - b.x_m, target[1] - b.y_m);
      const alignment = angularDiff(pl.principal.azimuth, bearing);
      const canopy = viewCanopy(site, [b.x_m, b.y_m], bearing);
      const declared = main.azimuth_deg == null ? pl.principal.azimuth : main.azimuth_deg;
      r.views = {
        main_target: main.target,
        main_bearing_deg: +bearing.toFixed(1),
        main_distance_m: +distance.toFixed(1),
        alignment_deg: +alignment.toFixed(1),
        declared_azimuth_deg: declared,
        canopy,
        canopy_description: describeCanopy(canopy),
        secondary: (() => {
          const p = targetPoint(site, v.secondary && v.secondary.target, [b.x_m, b.y_m]);
          return p ? { bearing_deg: +bearingDeg([b.x_m, b.y_m], p).toFixed(1), distance_m: +Math.hypot(p[0] - b.x_m, p[1] - b.y_m).toFixed(1) } : null;
        })(),
        neighbours_in_view: [],
      };
      if (angularDiff(declared, pl.principal.azimuth) > 2) err(`${b.name}: declared main view azimuth ${declared}° does not match the ${pl.principal.side} facade at ${pl.principal.azimuth.toFixed(0)}°`);
      if (alignment > 55) err(`${b.name}: main view target is ${alignment.toFixed(0)}° off the principal facade`);
      if (!v.winter) err(`${b.name}: no winter view consideration recorded`);
    }
    r.checks.forEach((c) => { if (!c.ok) err(`${b.name}: ${c.label}`); });
    r.ok = r.checks.every((c) => c.ok);
    return r;
  });

  /* neighbours in the principal view cone: approximate, descriptive only */
  const byId = Object.fromEntries(results.map((r) => [r.id, r]));
  results.forEach((r) => {
    if (!r.views || !r.views.main_bearing_deg) return;
    site.buildings.filter((b) => b.id !== r.id).forEach((b) => {
      const d = Math.hypot(b.x_m - r.x_m, b.y_m - r.y_m);
      const bearing = bearingDeg([r.x_m, r.y_m], [b.x_m, b.y_m]);
      const diff = angularDiff(r.views.main_bearing_deg, bearing);
      if (d < 120 && diff < 35) {
        r.views.neighbours_in_view.push({ id: b.id, name: b.name, distance_m: +d.toFixed(1), bearing_deg: +bearing.toFixed(1), off_axis_deg: +diff.toFixed(1) });
        if (d < 35) warn(`${r.name}: ${b.name} is ${d.toFixed(1)} m away inside the main view cone; check screening and spatial separation`);
      }
    });
  });

  /* buildings must not collide with each other or with lanes */
  const ids = Object.keys(placed);
  ids.forEach((a, i) => {
    ids.slice(i + 1).forEach((c) => {
      let d = Infinity;
      placed[a].parts.forEach((p) => placed[c].parts.forEach((q) => { d = Math.min(d, shapeDistance(p.poly, true, q.poly, true)); }));
      if (d === 0) err(`Buildings ${a} and ${c} overlap`);
      else if (d < 8) warn(`Buildings ${a} and ${c} are only ${d.toFixed(1)} m apart: check spatial separation, fire spread and privacy`);
      const ra = results.find((r) => r.id === a);
      const rc = results.find((r) => r.id === c);
      if (ra) ra.nearest_building_m = Math.min(ra.nearest_building_m ?? Infinity, +d.toFixed(1));
      if (rc) rc.nearest_building_m = Math.min(rc.nearest_building_m ?? Infinity, +d.toFixed(1));
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
  const laneCrossings = [];
  lanes.forEach((l) => {
    clearOf(l.points, false, l.name, l.width_m / 2);
    (site.drainage || []).forEach((d) => {
      const dist = shapeDistance(l.points, false, d.points, false);
      if (dist < d.width_m / 2 + l.width_m / 2) laneCrossings.push({ lane: l.id, drainage: d.id, crossing: true });
    });
  });
  clearOf(site.circulation.parking.polygon, true, 'Parking');
  site.buildings.forEach((b) => {
    if (!b.crane_pad) return;
    const [x, y] = b.crane_pad;
    const pad = [[x - 4, y - 4], [x + 4, y - 4], [x + 4, y + 4], [x - 4, y + 4]];
    clearOf(pad, true, `${b.name} crane pad`);
    (site.rocks || []).forEach((r) => {
      if (shapeDistance(pad, true, r.polygon, true) < nb.rock_buffer_m / 2) err(`${b.name} crane pad is too close to ${r.name}`);
    });
  });

  /* walking paths: outside buffers, not through buildings, reach every home */
  const drainageCrossings = [];
  (site.circulation.trails || []).forEach((t) => {
    const pts = samplePolyline(t.points, 2);
    const ds = Math.min(...pts.map((p) => distPointPolyline(p, shore)));
    const dw = Math.min(...pts.map((p) => (pointInPolygon(p, wet) ? 0 : distPointPolyline(p, wet, true))));
    if (ds - t.width_m / 2 < nb.shoreline_setback_m) err(`${t.name} enters the shoreline setback`);
    if (dw - t.width_m / 2 < nb.wetland_buffer_m) err(`${t.name} enters the wetland buffer`);
    (site.drainage || []).forEach((d) => {
      const dist = shapeDistance(t.points, false, d.points, false);
      if (dist < d.width_m / 2 + t.width_m / 2) drainageCrossings.push({ trail: t.id, drainage: d.id, crossing: true });
    });
    Object.keys(placed).forEach((id) => {
      placed[id].parts.forEach((p) => {
        const d = shapeDistance(t.points, false, p.poly, true);
        if (d < 1.5) err(`${t.name} runs through or against the ${p.kind} of building ${id}`);
      });
    });
  });

  /* potential building areas: illustrative, not permissions */
  const potential = [];
  const step = 8;
  for (let y = 12; y < site.map.height_m - 8; y += step) {
    for (let x = 80; x < site.map.width_m - 8; x += step) {
      const p = [x, y];
      if (!pointInPolygon(p, parcel) || pointInPolygon(p, lake) || pointInPolygon(p, wet)) continue;
      if (slopePct(baseElev, x, y) > 15) continue;
      if (distPointPolyline(p, shore) < nb.shoreline_setback_m + 4) continue;
      if (distPointPolyline(p, wet, true) < nb.wetland_buffer_m + 4) continue;
      if ((site.drainage || []).some((d) => distPointPolyline(p, d.points) < nb.drainage_buffer_m + 2)) continue;
      if ((site.rocks || []).some((r) => pointInPolygon(p, r.polygon) || distPointPolyline(p, r.polygon, true) < nb.rock_buffer_m)) continue;
      if (Object.values(placed).some((pl) => pl.parts.some((part) => pointInPolygon(p, part.poly) || distPointPolyline(p, part.poly, true) < 12))) continue;
      if (site.buildings.some((b) => Math.hypot(p[0] - b.x_m, p[1] - b.y_m) < (b.clearing_radius_m || 11) + 4)) continue;
      if ((site.clearings || []).some((c) => pointInPolygon(p, c.polygon) || distPointPolyline(p, c.polygon, true) < 4)) continue;
      if (site.circulation.lanes.some((l) => distPointPolyline(p, l.points) < l.width_m / 2 + 6)) continue;
      if ((site.circulation.trails || []).some((t) => distPointPolyline(p, t.points) < 4)) continue;
      potential.push([x, y]);
    }
  }

  const grid = terrainGrid(site, 5);
  return {
    area_m2: Math.round(area),
    area_acres: +(area / ACRE_M2).toFixed(2),
    area_ha: +(area / 10000).toFixed(2),
    buildings: results,
    issues,
    placed,
    potential_areas: { step_m: step, count: potential.length, points: potential, note: 'Illustrative cells that meet the project constraints. They are not available lots, permissions or surveyed building sites.' },
    drainage_crossings: drainageCrossings,
    lane_drainage_crossings: laneCrossings,
    terrain_hash: terrainHash(grid),
    terrain_grid: { step_m: grid.step_m, nx: grid.nx, ny: grid.ny, hash: terrainHash(grid) },
    view_tolerance_deg: 55,
    seed: site.terrain.seed,
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

function irregularClearing(cx, cy, r, seed) {
  const rnd = mulberry32(seed);
  const pts = [];
  const n = 18;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (0.78 + rnd() * 0.34);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return pts;
}

function hexToRgb(c) {
  return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
}
function mix(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

export function siteLayers(site, models, analysis) {
  const W = site.map.width_m;
  const H = site.map.height_m;
  const elev = elevationFn(site);
  const lake = lakePolygon(site);
  const shore = site.lake.shoreline;
  const wet = site.wetland.polygon;
  const nb = site.no_build;

  /* contours */
  const contours = [];
  const t = site.terrain;
  let hi = -Infinity;
  for (let x = 0; x <= W; x += 5) for (let y = 0; y <= H; y += 5) hi = Math.max(hi, elev(x, y));
  for (let z = t.lake_level_m + t.contour_interval_m; z < hi; z += t.contour_interval_m) {
    isolines(elev, 0, 0, W, H, 3, z).forEach((l) => {
      const pts = simplify(l.points, 0.4).filter((p) => !pointInPolygon(p, lake));
      if (pts.length > 1) contours.push({ z, pts, closed: l.closed });
    });
  }

  /* hillshade: shaded cells grouped into a small number of paths */
  const cell = 6;
  // A small fixed palette keeps the relief legible and the SVG compact.
  const palette = ['#c3ccb3', '#ccd3b9', '#d5d9c0', '#dedfc7', '#e6e3cd', '#ece7d5', '#f1ecdc', '#f5f0e1'];
  const relief = new Map();
  for (let y = 0; y < H; y += cell) {
    for (let x = 0; x < W; x += cell) {
      const z = elev(x + cell / 2, y + cell / 2);
      const dx = (elev(x + cell, y + cell / 2) - elev(x, y + cell / 2)) / cell;
      const dy = (elev(x + cell / 2, y + cell) - elev(x + cell / 2, y)) / cell;
      // light from the north-west
      const light = Math.max(0, Math.min(1, 0.55 + (-dx * 0.7 - dy * 0.7) * 3.2));
      const e = Math.max(0, Math.min(1, (z - t.lake_level_m) / 24));
      const idx = Math.max(0, Math.min(palette.length - 1, Math.round(e * (palette.length - 1) + (light - 0.55) * 2)));
      const colour = palette[idx];
      if (!relief.has(colour)) relief.set(colour, []);
      relief.get(colour).push([x, y]);
    }
  }
  const reliefPaths = [...relief.entries()].map(([colour, cells]) => ({
    colour,
    d: cells.map(([x, y]) => `M${x} ${y}h${cell}v${cell}h-${cell}z`).join(''),
  }));

  /* buffers */
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

  /* home clearings */
  const homeClearings = site.buildings.map((b, i) => ({
    id: 'home-' + b.id,
    name: `${b.short_name || b.name} clearing`,
    building: b.id,
    radius_m: b.clearing_radius_m || 11,
    polygon: irregularClearing(b.x_m, b.y_m, b.clearing_radius_m || 11, 900 + i * 17),
    note: b.clearing_note || '',
  }));
  const clearings = (site.clearings || []).concat(homeClearings);

  /* trees: deterministic scatter outside cleared and wet areas */
  const rnd = mulberry32(site.trees.seed);
  const trees = [];
  const lanes = site.circulation.lanes;
  const placed = analysis.placed;
  const clear = site.trees.clearance_m;
  const stands = site.woodland.stands || [];
  let guard = 0;
  while (trees.length < site.trees.count && guard++ < 40000) {
    const x = rnd() * W;
    const y = rnd() * H;
    const r = 2.6 + rnd() * 2.8;
    const p = [x, y];
    if (pointInPolygon(p, lake) || pointInPolygon(p, wet)) continue;
    if (distPointPolyline(p, shore) < r * 0.35) continue;
    if ((site.rocks || []).some((q) => pointInPolygon(p, q.polygon) || distPointPolyline(p, q.polygon, true) < r * 0.25)) continue;
    if (clearings.some((c) => pointInPolygon(p, c.polygon) || distPointPolyline(p, c.polygon, true) < r * 0.25)) continue;
    if (pointInPolygon(p, site.circulation.parking.polygon) || distPointPolyline(p, site.circulation.parking.polygon, true) < r) continue;
    if (lanes.some((l) => distPointPolyline(p, l.points) < l.width_m / 2 + r * 0.7)) continue;
    if ((site.circulation.trails || []).some((t) => distPointPolyline(p, t.points) < t.width_m / 2 + r * 0.5)) continue;
    let blocked = false;
    for (const id of Object.keys(placed)) {
      for (const part of placed[id].parts) {
        if (pointInPolygon(p, part.poly) || distPointPolyline(p, part.poly, true) < clear + r * 0.4) { blocked = true; break; }
      }
      if (blocked) break;
      const b = site.buildings.find((bb) => bb.id === id);
      if (b.crane_pad && Math.hypot(b.crane_pad[0] - x, b.crane_pad[1] - y) < 6 + r) blocked = true;
      for (const e of placed[id].rampFeet) {
        const near = lanes.map((l) => nearestOnPolyline(e, l.points)).sort((a, c) => a.d - c.d)[0];
        if (distPointPolyline(p, [e, near.point]) < r * 0.4 + 1) blocked = true;
      }
      if (blocked) break;
    }
    if (blocked) continue;
    if (trees.some((q) => Math.hypot(q[0] - x, q[1] - y) < (q[2] + r) * 0.72)) continue;
    const stand = stands.find((s) => pointInPolygon(p, s.polygon));
    let type = 'deciduous';
    if (stand) type = stand.type === 'conifer' ? 'conifer' : stand.type === 'deciduous' ? 'deciduous' : (rnd() < 0.48 ? 'conifer' : 'deciduous');
    else type = rnd() < 0.4 ? 'conifer' : 'deciduous';
    trees.push([x, y, r, type, 0.55 + rnd() * 0.45]);
  }

  /* pedestrian spurs from each ramp foot to the nearest lane, for the plan */
  const spurs = [];
  Object.keys(placed).forEach((id) => {
    placed[id].rampFeet.forEach((e) => {
      const near = lanes.map((l) => ({ l, ...nearestOnPolyline(e, l.points) })).sort((a, c) => a.d - c.d)[0];
      spurs.push({ id, from: e, to: near.point });
    });
  });

  return { contours, reliefPaths, shoreBuffer, wetBuffer, trees, spurs, lake, W, H, clearings, homeClearings };
}

export function renderSitePlan(site, models, analysis, layers, opts = {}) {
  const { W, H, contours, reliefPaths, shoreBuffer, wetBuffer, trees, lake, clearings } = layers;
  const wet = site.wetland.polygon;
  const shore = site.lake.shoreline;
  const pre = opts.idPrefix || 'site-';
  const legendH = opts.legend ? 64 : 0;
  const nb = site.no_build;
  const out = [];
  const titleId = `${pre}title`;
  const descId = `${pre}desc`;
  const names = site.buildings.map((b) => {
    const r = analysis.buildings.find((x) => x.id === b.id);
    return `${b.name}${b.short_name ? `, ${b.short_name}` : ''} (${b.use}, ${r.shoreline_m} m from the shoreline)`;
  });
  const viewText = analysis.buildings.filter((b) => b.views && b.views.main_bearing_deg != null)
    .map((b) => `${b.short_name || b.name} faces ${b.views.main_bearing_deg.toFixed(0)}° toward ${b.views.main_target.type === 'lake' ? 'the lake' : b.views.main_target.type === 'wetland' ? 'the wet meadow' : (b.views.main_target.id || 'the forest')}`);
  const desc = `Fictional ${analysis.area_acres}-acre (${analysis.area_ha} ha) wooded parcel drawn to scale in metres, north up. ` +
    `Heron Lake lies along the west boundary, with a beaver meadow wetland in the south and two seasonal drainage channels. ` +
    `Rock outcrops, mixed woodland, natural clearings and small building benches are shown. ` +
    `Hatched no-build zones show a ${nb.shoreline_setback_m} m shoreline setback and a ${nb.wetland_buffer_m} m wetland buffer (placeholder values). ` +
    `One entrance from the east leads to shared parking, an accessible drop-off and the lodge. A narrow emergency, construction and maintenance track loops through the woods; walking paths serve each home. ` +
    `Views: ${viewText.join('; ')}. ` +
    `Buildings: ${names.join('; ')}. Not surveyed; not for construction.`;
  const strip = `Original concept | CC BY 4.0 | Containers Hamlet contributors 2026 | Fictional site; contours, buffers, benches and positions are illustrative`;

  out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H + legendH}"${opts.inline ? ' class="site-map-svg"' : ` width="${W * 2.8}" height="${(H + legendH) * 2.8}"`} role="img" aria-labelledby="${titleId} ${descId}">`);
  out.push(`<title id="${titleId}">Fictional ${analysis.area_acres}-acre Containers Hamlet woodland site plan</title>`);
  out.push(`<desc id="${descId}">${esc(desc)}</desc>`);
  out.push('<defs>' +
    `<pattern id="${pre}hatch" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="3" fill="#f3e3c3" fill-opacity="0.6"/><path d="M0 0V3" stroke="#a5552d" stroke-width="0.55"/></pattern>` +
    `<pattern id="${pre}marsh" width="7" height="6" patternUnits="userSpaceOnUse"><rect width="7" height="6" fill="#9cc3a7"/><path d="M1.5 4.5l1-2 1 2M4.5 2.2l1-1.6 1 1.6" fill="none" stroke="#4f7d64" stroke-width="0.45"/></pattern>` +
    `<pattern id="${pre}rock" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="#b9b3a4"/><path d="M0 5L5 0M1.5 5L5 1.5" stroke="#8b8475" stroke-width="0.4"/></pattern>` +
    `<clipPath id="${pre}land"><path d="${PZ(site.parcel.polygon)}"/></clipPath>` +
    '</defs>');
  out.push(`<rect width="${W}" height="${H}" fill="#d7deca"/>`);
  out.push(`<rect x="${fmt(site.parcel.polygon[site.parcel.polygon.length - 1][0], 1)}" width="${fmt(W - site.parcel.polygon[site.parcel.polygon.length - 1][0], 1)}" height="${H}" fill="#cdd5c0"/>`);

  // terrain relief
  out.push(`<g id="${pre}layer-terrain" class="layer layer-terrain" clip-path="url(#${pre}land)">`);
  reliefPaths.forEach((r) => out.push(`<path d="${r.d}" fill="${r.colour}"/>`));
  out.push('</g>');

  // woodland tint
  out.push(`<g id="${pre}layer-woodland" class="layer layer-woodland" clip-path="url(#${pre}land)">`);
  (site.woodland.stands || []).forEach((s) => {
    const fill = s.type === 'conifer' ? '#b7c7a6' : s.type === 'deciduous' ? '#c9d4a9' : '#bfcea9';
    out.push(`<path d="${smoothPath(s.polygon, true)}" fill="${fill}" fill-opacity="0.28"/>`);
  });
  out.push('</g>');

  // clearings
  out.push(`<g id="${pre}layer-clearings" class="layer layer-clearings" clip-path="url(#${pre}land)">`);
  clearings.forEach((c) => {
    out.push(`<path d="${smoothPath(c.polygon, true)}" fill="#e7dfb9" fill-opacity="0.75"/>`);
    if (!c.building) {
      const p = centroid(c.polygon);
      out.push(`<text x="${fmt(p[0], 1)}" y="${fmt(p[1], 1)}" font-size="3.8" text-anchor="middle" font-family="system-ui, sans-serif" fill="#5e6440" stroke="#e7dfb9" stroke-width="1" paint-order="stroke">${esc(c.name.toLowerCase())}</text>`);
    }
  });
  out.push('</g>');

  // rocks
  out.push(`<g id="${pre}layer-rocks" class="layer layer-rocks">`);
  (site.rocks || []).forEach((r) => {
    out.push(`<path d="${smoothPath(r.polygon, true)}" fill="url(#${pre}rock)" stroke="#7d7668" stroke-width="0.7" stroke-dasharray="4 1 1 1"/>`);
    out.push(`<path d="${smoothPath(r.polygon, true)}" fill="none" stroke="#8a6a3a" stroke-width="${(nb.rock_buffer_m || 8) * 2}" stroke-opacity="0.08" stroke-dasharray="2 3"/>`);
  });
  out.push('</g>');

  // contours
  out.push(`<g id="${pre}layer-contours" class="layer layer-contours" fill="none" stroke="#8ca17e" stroke-width="0.38" stroke-opacity="0.75">`);
  contours.forEach((c) => {
    const major = Math.round(c.z) % 10 === 0;
    out.push(`<path d="${smoothPath(c.pts, c.closed)}"${major ? ' stroke-width="0.8" stroke-opacity="0.9"' : ''}/>`);
  });
  contours.filter((c) => Math.round(c.z) % 10 === 0 && c.pts.length > 6).forEach((c) => {
    const p = c.pts[Math.floor(c.pts.length / 2)];
    out.push(`<text x="${fmt(p[0], 1)}" y="${fmt(p[1], 1)}" font-size="3.6" fill="#5e7352" stroke="#e8e4cf" stroke-width="1" paint-order="stroke" font-family="system-ui, sans-serif" text-anchor="middle">${Math.round(c.z)} m</text>`);
  });
  out.push('</g>');

  // no-build buffers
  out.push(`<g id="${pre}layer-buffers" class="layer layer-buffers" clip-path="url(#${pre}land)">`);
  if (shoreBuffer) out.push(`<path d="${PZ(shoreBuffer.poly)}" fill="url(#${pre}hatch)"/>`);
  if (wetBuffer) out.push(`<path d="${PZ(wetBuffer.poly)}" fill="url(#${pre}hatch)"/>`);
  [shoreBuffer, wetBuffer].forEach((b) => { if (b) out.push(`<path d="${P(b.edge)}" fill="none" stroke="#a5552d" stroke-width="0.8" stroke-dasharray="3 2"/>`); });
  (site.drainage || []).forEach((d) => {
    out.push(`<path d="${smoothPath(d.points, false)}" fill="none" stroke="#a5552d" stroke-width="${(nb.drainage_buffer_m || 10) * 2}" stroke-opacity="0.12" stroke-dasharray="2 3"/>`);
    out.push(`<path d="${smoothPath(d.points, false)}" fill="none" stroke="#a5552d" stroke-width="0.7" stroke-dasharray="3.5 2"/>`);
  });
  out.push('</g>');

  // water and wetland
  out.push(`<path d="${smoothPath(wet, true)}" fill="url(#${pre}marsh)" stroke="#4f7d64" stroke-width="0.8"/>`);
  out.push(`<path d="${PZ(lake)}" fill="#8ebdcc"/>`);
  out.push(`<path d="${smoothPath(shore, false)}" fill="none" stroke="#d8d2a0" stroke-width="4.5" stroke-opacity="0.8"/>`);
  out.push(`<path d="${smoothPath(shore, false)}" fill="none" stroke="#e4dfb3" stroke-width="2"/>`);
  out.push(`<path d="${smoothPath(shore, false)}" fill="none" stroke="#4d8ba0" stroke-width="0.8"/>`);
  // shallow-water tone
  out.push(`<path d="${smoothPath(shore, false)}" fill="none" stroke="#a8d0d9" stroke-width="9" stroke-opacity="0.22"/>`);

  // parcel line
  const parcel = site.parcel.polygon;
  const boundary = parcel.slice(site.lake.shoreline.length - 1).concat([parcel[0]]);
  out.push(`<path d="${P(boundary)}" fill="none" stroke="#7a3b2e" stroke-width="1" stroke-dasharray="8 2 1.5 2"/>`);

  // potential building areas (illustrative)
  out.push(`<g id="${pre}layer-potential" class="layer layer-potential" clip-path="url(#${pre}land)">`);
  analysis.potential_areas.points.forEach(([x, y]) => {
    out.push(`<rect x="${x - 2.6}" y="${y - 2.6}" width="5.2" height="5.2" fill="#f6f1d8" fill-opacity="0.35" stroke="#8a8f5e" stroke-width="0.35" stroke-dasharray="1 1"/>`);
  });
  out.push('</g>');

  // trees
  out.push(`<g id="${pre}layer-trees" class="layer layer-trees">`);
  trees.forEach((t) => {
    const [x, y, r, type, shade] = t;
    if (type === 'conifer') {
      const c = mix('#2f5c45', '#6f9464', shade * 0.5);
      out.push(`<path d="M${fmt(x, 1)} ${fmt(y - r, 1)}L${fmt(x + r * 0.62, 1)} ${fmt(y + r * 0.55, 1)}L${fmt(x - r * 0.62, 1)} ${fmt(y + r * 0.55, 1)}Z" fill="${c}" fill-opacity="0.9"/>`);
      out.push(`<path d="M${fmt(x, 1)} ${fmt(y - r * 0.55, 1)}L${fmt(x + r * 0.48, 1)} ${fmt(y + r * 0.8, 1)}L${fmt(x - r * 0.48, 1)} ${fmt(y + r * 0.8, 1)}Z" fill="${mix(c, '#1f3f30', 0.25)}" fill-opacity="0.75"/>`);
    } else {
      const c = mix('#5a8a5d', '#a9bd7a', shade * 0.55);
      out.push(`<circle cx="${fmt(x, 1)}" cy="${fmt(y, 1)}" r="${fmt(r * 0.8, 1)}" fill="${c}" fill-opacity="0.85"/>`);
      out.push(`<circle cx="${fmt(x - r * 0.22, 1)}" cy="${fmt(y + r * 0.16, 1)}" r="${fmt(r * 0.5, 1)}" fill="${mix(c, '#365f3f', 0.25)}" fill-opacity="0.7"/>`);
    }
  });
  out.push('</g>');

  // circulation
  const circ = site.circulation;
  out.push(`<g id="${pre}layer-access" class="layer layer-access" fill="none" stroke-linecap="round" stroke-linejoin="round">`);
  out.push(`<path d="${PZ(circ.parking.polygon)}" fill="#e6dfca" stroke="#94845f" stroke-width="0.8"/>`);
  circ.lanes.forEach((l) => {
    const track = l.kind !== 'vehicle';
    const casing = track ? '#9da17a' : '#94845f';
    const fill = track ? '#d9ddb5' : '#e6dfca';
    out.push(`<path d="${smoothPath(l.points, false)}" stroke="${casing}" stroke-width="${l.width_m + 0.9}"/>`);
    out.push(`<path d="${smoothPath(l.points, false)}" stroke="${fill}" stroke-width="${l.width_m}"/>`);
    if (track) out.push(`<path d="${smoothPath(l.points, false)}" stroke="#7f8455" stroke-width="0.45" stroke-dasharray="2.5 2"/>`);
    if (l.turnaround) {
      const e = l.points[l.points.length - 1];
      out.push(`<circle cx="${fmt(e[0], 1)}" cy="${fmt(e[1], 1)}" r="8" fill="${fill}" stroke="${casing}" stroke-width="0.8"/>`);
    }
  });
  (circ.trails || []).forEach((t) => {
    const accessible = t.kind === 'accessible';
    out.push(`<path d="${smoothPath(t.points, false)}" stroke="#c9b78b" stroke-width="${t.width_m + 1.1}" stroke-opacity="0.55"/>`);
    out.push(`<path d="${smoothPath(t.points, false)}" stroke="${accessible ? '#f4ecd4' : '#f0e6cc'}" stroke-width="${t.width_m}"${accessible ? '' : ' stroke-dasharray="0.4 2.1"'}/>`);
  });
  out.push('</g>');

  // construction: crane mats
  out.push(`<g id="${pre}layer-construction" class="layer layer-construction" fill="none">`);
  site.buildings.forEach((b) => {
    if (!b.crane_pad) return;
    const [x, y] = b.crane_pad;
    out.push(`<circle cx="${fmt(x, 1)}" cy="${fmt(y, 1)}" r="${site.crane.max_reach_m}" stroke="#b45e1c" stroke-width="0.45" stroke-dasharray="1.5 2" stroke-opacity="0.55"/>` +
      `<rect x="${fmt(x - 4, 1)}" y="${fmt(y - 4, 1)}" width="8" height="8" stroke="#b45e1c" stroke-width="0.8" fill="#f6e2cf" fill-opacity="0.55"/>` +
      `<path d="M${fmt(x - 2.4, 1)} ${fmt(y - 2.4, 1)}l4.8 4.8m0 -4.8l-4.8 4.8" stroke="#b45e1c" stroke-width="0.7"/>`);
  });
  out.push('</g>');

  // view arrows
  out.push(`<g id="${pre}layer-views" class="layer layer-views">`);
  site.buildings.forEach((b) => {
    const r = analysis.buildings.find((x) => x.id === b.id);
    if (!r || r.views == null || r.views.main_bearing_deg == null) return;
    const a = (r.views.main_bearing_deg * Math.PI) / 180;
    const dx = Math.sin(a);
    const dy = -Math.cos(a);
    const x0 = b.x_m + dx * 9;
    const y0 = b.y_m + dy * 9;
    const len = r.id === 'lodge' ? 20 : 17;
    const x1 = b.x_m + dx * len;
    const y1 = b.y_m + dy * len;
    const head = 3.2;
    const px = -dy;
    const py = dx;
    out.push(`<path d="M${fmt(x0, 1)} ${fmt(y0, 1)}L${fmt(x1, 1)} ${fmt(y1, 1)}" stroke="#3f5f8a" stroke-width="0.9" stroke-dasharray="2 1.4"/>` +
      `<path d="M${fmt(x1, 1)} ${fmt(y1, 1)}L${fmt(x1 - dx * head + px * head * 0.55, 1)} ${fmt(y1 - dy * head + py * head * 0.55, 1)}L${fmt(x1 - dx * head - px * head * 0.55, 1)} ${fmt(y1 - dy * head - py * head * 0.55, 1)}Z" fill="#3f5f8a"/>`);
    const label = r.views.main_target.type === 'lake' ? 'lake' : r.views.main_target.type === 'wetland' ? 'meadow' : (r.views.main_target.id || '').replace(/-/g, ' ');
    out.push(`<text x="${fmt(x1 + px * 4, 1)}" y="${fmt(y1 + py * 4 + 1.2, 1)}" font-size="3.4" font-family="system-ui, sans-serif" fill="#2f4f78" stroke="#f6f3e6" stroke-width="1" paint-order="stroke" text-anchor="middle">${esc(label)}</text>`);
  });
  out.push('</g>');

  // buildings
  out.push(`<g id="${pre}buildings" class="buildings">`);
  site.buildings.forEach((b) => {
    const pl = analysis.placed[b.id];
    if (!pl) return;
    out.push(`<g id="${pre}building-${b.id}" class="building" data-building="${b.id}">`);
    const fills = { building: b.id === 'lodge' ? '#8a694d' : '#b58a62', porch: '#d9c7a5', ramp: '#cdb48e', trellis: '#6e5a3d' };
    pl.parts.forEach((p) => {
      out.push(`<path class="part part-${p.kind}" d="${PZ(p.poly)}" fill="${fills[p.kind]}" stroke="#274c3b" stroke-width="${p.kind === 'building' ? 0.7 : 0.4}"/>`);
    });
    // roof ridge line, to read the building's long axis
    const main = pl.parts[0].poly;
    const a = main[0];
    const c = main[2];
    out.push(`<path d="M${fmt(a[0], 1)} ${fmt(a[1], 1)}L${fmt(c[0], 1)} ${fmt(c[1], 1)}" stroke="#6f4c2c" stroke-width="0.4" stroke-opacity="0.6"/>`);
    const label = b.id === 'lodge' ? 'LODGE' : `${b.id.toUpperCase()} ${(b.short_name || '').toUpperCase()}`.trim();
    const top = Math.min(...main.map((p) => p[1]));
    out.push(`<text x="${fmt(b.x_m, 1)}" y="${fmt(top - 2.4, 1)}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="${b.id === 'lodge' ? 5.4 : 5}" font-weight="700" fill="#1d392c" stroke="#f6f5ee" stroke-width="1.3" paint-order="stroke">${esc(label)}</text>`);
    out.push(`<circle class="hit" cx="${fmt(b.x_m, 1)}" cy="${fmt(b.y_m, 1)}" r="${b.id === 'lodge' ? 14 : 10}" fill="transparent"/>`);
    out.push('</g>');
  });
  out.push('</g>');

  // labels
  const T = (x, y, s, size, extra = '') => `<text x="${x}" y="${y}" font-size="${size}"${extra}>${esc(s)}</text>`;
  out.push('<g font-family="system-ui, sans-serif" fill="#1d392c" stroke="#f6f5ee" stroke-width="1.2" paint-order="stroke">');
  out.push(T(9, 14, 'CONTAINERS HAMLET', 8.5, ' font-weight="800" letter-spacing="1"'));
  out.push(T(9, 22, `Fictional ${analysis.area_acres}-acre site • not surveyed`, 4.6));
  out.push(T(14, 112, 'HERON LAKE', 7.5, ' fill="#1f4f60" stroke="#8ebdcc"'));
  out.push(T(182, 201, 'BEAVER MEADOW', 5.4, ' font-weight="700"'));
  out.push(T(182, 207, 'protected wetland', 3.8));
  out.push(T(118, 18, 'NORTH RIDGE', 5, ' fill="#3d6b53" font-weight="700"'));
  out.push(T(270, 147, 'SOUTH KNOLL', 4.2, ' fill="#3d6b53" font-weight="700"'));
  out.push(T(287, 86, 'ROCK', 3.8, ' fill="#6b6456" font-weight="700"'));
  out.push(T(300, 96, 'PARKING', 4.2, ' font-weight="700"'));
  out.push(T(319, 109, 'ARRIVAL →', 3.8));
  out.push(T(294, 118, 'drop-off', 3.2, ' fill="#5a5541"'));
  out.push(T(88, 45, `${nb.shoreline_setback_m} m shoreline setback`, 4, ' fill="#7d3a18"'));
  out.push(T(212, 158, `${nb.wetland_buffer_m} m wetland buffer`, 3.8, ' fill="#7d3a18"'));
  out.push(T(175, 86, 'emergency / construction track', 3.4, ' fill="#5f6338"'));
  out.push(T(183, 128, 'walking paths', 3.4, ' fill="#6b5735"'));
  out.push(T(147, 160, 'seasonal drainage', 3.2, ' fill="#4d7890"'));
  out.push('</g>');

  // north arrow and scale bar
  out.push(`<g aria-hidden="true" font-family="system-ui, sans-serif"><circle cx="${W - 12}" cy="28" r="11" fill="#f6f5ee" fill-opacity="0.88"/><path d="M${W - 17} 33l5 -16l5 16l-5 -4z" fill="#1d392c"/><text x="${W - 12}" y="41" font-size="6" text-anchor="middle" font-weight="700" fill="#1d392c">N</text></g>`);
  const sx = 10;
  const sy = H - 9;
  out.push(`<g font-family="system-ui, sans-serif" font-size="4.2" fill="#1d392c"><rect x="${sx}" y="${sy}" width="25" height="1.8" fill="#1d392c"/><rect x="${sx + 25}" y="${sy}" width="25" height="1.8" fill="#fff" stroke="#1d392c" stroke-width="0.4"/><text x="${sx}" y="${sy - 1.8}">0</text><text x="${sx + 25}" y="${sy - 1.8}" text-anchor="middle">25</text><text x="${sx + 50}" y="${sy - 1.8}" text-anchor="middle">50 m</text></g>`);

  if (opts.legend) {
    const y0 = H + 7;
    const items = [
      ['url(#' + pre + 'hatch)', 'No-build zone (placeholder)'],
      ['url(#' + pre + 'marsh)', 'Wetland / beaver meadow'],
      ['#8ebdcc', 'Lake'],
      ['url(#' + pre + 'rock)', 'Rock outcrop'],
      ['#e7dfb9', 'Natural clearing / bench'],
      ['#d9ddb5', 'Emergency / construction track'],
      ['#e6dfca', 'Access lane and parking'],
      ['#f0e6cc', 'Walking path'],
      ['#f6e2cf', 'Temporary crane mat + reach'],
      ['#b58a62', 'Home (true scale)'],
      ['#8a694d', 'Common lodge'],
      ['#3f5f8a', 'Principal view direction'],
    ];
    out.push(`<rect y="${H}" width="${W}" height="${legendH}" fill="#faf8f2"/>`);
    out.push('<g font-family="system-ui, sans-serif" font-size="3.8" fill="#1d392c">');
    items.forEach(([f, l], i) => {
      const x = 9 + (i % 4) * 78;
      const y = y0 + Math.floor(i / 4) * 8;
      out.push(`<rect x="${x}" y="${y}" width="6" height="4.4" fill="${f}" stroke="#1d392c" stroke-width="0.3"/><text x="${x + 8.5}" y="${y + 3.8}">${esc(l)}</text>`);
    });
    out.push(`<text x="9" y="${H + legendH - 3.5}" font-size="3.4">${esc(strip)}</text>`);
    out.push('</g>');
  }
  out.push('</svg>');
  return out.join('');
}
