// Small 2D geometry toolkit for the site plan. Metres throughout. MIT licence.

export function polygonArea(poly) {
  let a = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i];
    const [x2, y2] = poly[(i + 1) % poly.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a) / 2;
}

export function pointInPolygon([x, y], poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function distPointSegment([px, py], [ax, ay], [bx, by]) {
  const dx = bx - ax;
  const dy = by - ay;
  const l2 = dx * dx + dy * dy;
  let t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function segments(pts, closed) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) out.push([pts[i], pts[i + 1]]);
  if (closed && pts.length > 2) out.push([pts[pts.length - 1], pts[0]]);
  return out;
}

export function distPointPolyline(p, pts, closed = false) {
  let d = Infinity;
  for (const [a, b] of segments(pts, closed)) d = Math.min(d, distPointSegment(p, a, b));
  return d;
}

function cross(o, a, b) {
  return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
}

export function segmentsIntersect(a, b, c, d) {
  const d1 = cross(c, d, a);
  const d2 = cross(c, d, b);
  const d3 = cross(a, b, c);
  const d4 = cross(a, b, d);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

/** Minimum distance between two shapes; 0 when they touch, cross or one contains the other. */
export function shapeDistance(A, aClosed, B, bClosed) {
  const sa = segments(A, aClosed);
  const sb = segments(B, bClosed);
  for (const [a, b] of sa) for (const [c, d] of sb) if (segmentsIntersect(a, b, c, d)) return 0;
  if (bClosed && A.some((p) => pointInPolygon(p, B))) return 0;
  if (aClosed && B.some((p) => pointInPolygon(p, A))) return 0;
  let d = Infinity;
  for (const p of A) d = Math.min(d, distPointPolyline(p, B, bClosed));
  for (const p of B) d = Math.min(d, distPointPolyline(p, A, aClosed));
  return d;
}

export function nearestOnPolyline(p, pts) {
  let best = { d: Infinity, point: null };
  for (const [a, b] of segments(pts, false)) {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l2 = dx * dx + dy * dy;
    let t = l2 ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2 : 0;
    t = Math.max(0, Math.min(1, t));
    const q = [a[0] + t * dx, a[1] + t * dy];
    const d = Math.hypot(p[0] - q[0], p[1] - q[1]);
    if (d < best.d) best = { d, point: q };
  }
  return best;
}

export function samplePolyline(pts, step) {
  const out = [pts[0]];
  for (let i = 0; i < pts.length - 1; i++) {
    const [a, b] = [pts[i], pts[i + 1]];
    const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let k = 1; k <= n; k++) out.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);
  }
  return out;
}

/** Ramer-Douglas-Peucker simplification. */
export function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  let idx = -1;
  let max = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = distPointSegment(pts[i], pts[0], pts[pts.length - 1]);
    if (d > max) { max = d; idx = i; }
  }
  if (max <= tol) return [pts[0], pts[pts.length - 1]];
  return simplify(pts.slice(0, idx + 1), tol).slice(0, -1).concat(simplify(pts.slice(idx), tol));
}

/**
 * Marching squares iso-lines of fn over a grid, joined into polylines.
 * Returns [{points, closed}].
 */
export function isolines(fn, x0, y0, x1, y1, step, level) {
  const nx = Math.ceil((x1 - x0) / step);
  const ny = Math.ceil((y1 - y0) / step);
  const X = (i) => Math.min(x1, x0 + i * step);
  const Y = (j) => Math.min(y1, y0 + j * step);
  const v = [];
  for (let j = 0; j <= ny; j++) {
    const row = [];
    for (let i = 0; i <= nx; i++) row.push(fn(X(i), Y(j)) - level);
    v.push(row);
  }
  const pt = new Map();
  const edgePoint = (key, ax, ay, av, bx, by, bv) => {
    if (!pt.has(key)) {
      const t = av / (av - bv);
      pt.set(key, [ax + (bx - ax) * t, ay + (by - ay) * t]);
    }
    return key;
  };
  const segs = [];
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const a = v[j][i]; const b = v[j][i + 1]; const c = v[j + 1][i + 1]; const d = v[j + 1][i];
      const idx = (a > 0 ? 8 : 0) | (b > 0 ? 4 : 0) | (c > 0 ? 2 : 0) | (d > 0 ? 1 : 0);
      if (idx === 0 || idx === 15) continue;
      const top = () => edgePoint(`h${i},${j}`, X(i), Y(j), a, X(i + 1), Y(j), b);
      const right = () => edgePoint(`v${i + 1},${j}`, X(i + 1), Y(j), b, X(i + 1), Y(j + 1), c);
      const bottom = () => edgePoint(`h${i},${j + 1}`, X(i), Y(j + 1), d, X(i + 1), Y(j + 1), c);
      const left = () => edgePoint(`v${i},${j}`, X(i), Y(j), a, X(i), Y(j + 1), d);
      const centre = (a + b + c + d) / 4 > 0;
      switch (idx) {
        case 1: case 14: segs.push([left(), bottom()]); break;
        case 2: case 13: segs.push([bottom(), right()]); break;
        case 3: case 12: segs.push([left(), right()]); break;
        case 4: case 11: segs.push([top(), right()]); break;
        case 6: case 9: segs.push([top(), bottom()]); break;
        case 7: case 8: segs.push([left(), top()]); break;
        case 5: if (centre) { segs.push([left(), top()], [bottom(), right()]); } else { segs.push([left(), bottom()], [top(), right()]); } break;
        case 10: if (centre) { segs.push([top(), right()], [left(), bottom()]); } else { segs.push([left(), top()], [bottom(), right()]); } break;
        default: break;
      }
    }
  }
  const byKey = new Map();
  segs.forEach((s, n) => {
    for (const k of s) {
      if (!byKey.has(k)) byKey.set(k, []);
      byKey.get(k).push(n);
    }
  });
  const used = new Array(segs.length).fill(false);
  const lines = [];
  for (let n = 0; n < segs.length; n++) {
    if (used[n]) continue;
    used[n] = true;
    const chain = [segs[n][0], segs[n][1]];
    const extend = (atEnd) => {
      for (;;) {
        const k = atEnd ? chain[chain.length - 1] : chain[0];
        const next = (byKey.get(k) || []).find((m) => !used[m]);
        if (next == null) return;
        used[next] = true;
        const o = segs[next][0] === k ? segs[next][1] : segs[next][0];
        if (atEnd) chain.push(o); else chain.unshift(o);
      }
    };
    extend(true);
    extend(false);
    const closed = chain.length > 2 && chain[0] === chain[chain.length - 1];
    lines.push({ points: chain.map((k) => pt.get(k)), closed });
  }
  return lines;
}

/** Close an open line that ends on the map boundary, walking around the side that contains `inside`. */
export function closeAlongBoundary(line, W, H, inside) {
  const per = (p) => {
    const [x, y] = p;
    const e = 1e-3 * Math.max(W, H);
    if (Math.abs(y) < e) return x;
    if (Math.abs(x - W) < e) return W + y;
    if (Math.abs(y - H) < e) return W + H + (W - x);
    return 2 * W + H + (H - y);
  };
  const corners = [[W, 0, W], [W, H, W + H], [0, H, 2 * W + H], [0, 0, 0]];
  const total = 2 * (W + H);
  const walk = (from, to, dir) => {
    const out = [];
    const span = dir > 0 ? (to - from + total) % total : (from - to + total) % total;
    const list = corners
      .map(([x, y, t]) => ({ p: [x, y], d: dir > 0 ? (t - from + total) % total : (from - t + total) % total }))
      .filter((c) => c.d > 0 && c.d < span)
      .sort((a, b) => a.d - b.d);
    for (const c of list) out.push(c.p);
    return out;
  };
  const a = per(line[line.length - 1]);
  const b = per(line[0]);
  for (const dir of [1, -1]) {
    const poly = line.concat(walk(a, b, dir));
    if (pointInPolygon(inside, poly)) return poly;
  }
  return line;
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function centroid(poly) {
  let x = 0;
  let y = 0;
  for (const p of poly) { x += p[0]; y += p[1]; }
  return [x / poly.length, y / poly.length];
}
