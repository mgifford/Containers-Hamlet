// Orthographic drawings generated from the parametric model:
// floor plan (horizontal cut), elevations and a transverse section.
// Every line is derived from model primitives, so drawings, the OBJ model
// and the browser explorer always agree. MIT licence.
import { createRequire } from 'node:module';
import { esc, fmt, m, wrap, dimension, northArrow, scaleBar } from './svg.mjs';

const require = createRequire(import.meta.url);
const R = require('../../site/js/render.js');

export const SCALE = 45; // px per metre on every orthographic sheet
const FONT = 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';
const INK = '#21382c';
const PAPER = '#faf8f2';
const LICENCE = 'Original concept | CC BY 4.0 | Eco Hamlet contributors 2026';

const CUT = {
  steel: '#55646a', frame: '#2c3539', insulation: 'url(#ins)', cladding: '#9a6b3f', lining: '#e3d6bb',
  partition: '#a3a89f', glass: '#cbe8ef', door: '#6f5136', timber: '#b88a57', membrane: '#4d545b',
  soffit: '#7d7f77', post: '#6e4f33', trellis: '#6e5a3d', screen: '#3e755d', decking: '#a97c52',
  pile: '#4c4f51', floor: '#cdb791', roofing: '#5e4f42', pv: '#24364f', green: '#6f9d5b', vine: '#4f8a4a',
  room: '#e8d8b8', joinery: '#d8b98f', soft: '#9fb6a6', appliance: '#f4f5f2', tile: '#c9dbe0', battery: '#b84a3a', fixture: '#f7f4ec',
};

const DEFS = '<defs>' +
  '<pattern id="ins" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#f1dc9f"/><path d="M0 7L7 0" stroke="#b9963f" stroke-width="0.8"/></pattern>' +
  `<pattern id="boards" width="${fmt(SCALE * 0.15)}" height="10" patternUnits="userSpaceOnUse"><rect width="${fmt(SCALE * 0.15)}" height="10" fill="#c49a6a"/><path d="M0.5 0V10" stroke="#8f6a43" stroke-width="1"/></pattern>` +
  '</defs>';

function sheet(W, H, id, title, desc, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="${id}-t ${id}-d" font-family="${FONT}">` +
    `<title id="${id}-t">${esc(title)}</title><desc id="${id}-d">${esc(desc)}</desc>${DEFS}` +
    `<rect width="${W}" height="${H}" fill="${PAPER}"/>${body}</svg>`;
}

function heading(spec, line2) {
  const name = spec.name.replace(':', ' |').toUpperCase();
  return `<g fill="${INK}"><text x="40" y="48" font-size="28" font-weight="700">${esc(name)}</text>` +
    `<text x="40" y="76" font-size="16">${esc(line2)}</text></g>`;
}

const area = (v) => `${(Math.round(v * 10) / 10).toFixed(1)} m²`;

/* ---------------------------------------------------------------- plan */

export function planSVG(model) {
  const { spec, meta: M, rooms } = model;
  const k = SCALE;
  const cutZ = M.FFL + 1.2;
  const b = M.bounds;
  const pad = { l: 130, r: 80, t: 210, b: 270 };
  const X = (x) => pad.l + (x - b.min[0]) * k;
  const Y = (y) => pad.t + (y - b.min[1]) * k;
  const W = Math.ceil(pad.l + (b.max[0] - b.min[0]) * k + pad.r);
  const H = Math.ceil(pad.t + (b.max[1] - b.min[1]) * k + pad.b);
  const rect = (p, attrs) => `<rect x="${fmt(X(p.min[0]))}" y="${fmt(Y(p.min[1]))}" width="${fmt((p.max[0] - p.min[0]) * k)}" height="${fmt((p.max[1] - p.min[1]) * k)}" ${attrs}/>`;
  const o = [];

  o.push(heading(spec, 'Floor plan • cut 1.2 m above the floor • conceptual, not for construction'));

  // below the cut: floors, decks, ramps, fixtures
  o.push('<g>');
  model.prims.filter((p) => p.cat === 'room').forEach((p) => o.push(rect(p, 'fill="#f6efe1" stroke="none"')));
  model.prims.filter((p) => p.cat === 'porch' && p.mat === 'decking').forEach((p) => {
    o.push(rect(p, 'fill="#ead8ba" stroke="#8a6a48" stroke-width="1"'));
    let lines = '';
    for (let y = p.min[1] + 0.14; y < p.max[1]; y += 0.14) lines += `M${fmt(X(p.min[0]))} ${fmt(Y(y))}H${fmt(X(p.max[0]))}`;
    o.push(`<path d="${lines}" stroke="#c9ad85" stroke-width="0.6"/>`);
  });
  model.prims.filter((p) => p.kind === 'wedge').forEach((p) => {
    o.push(rect(p, 'fill="#ecdcc0" stroke="#8a6a48" stroke-width="1" stroke-dasharray="6 3"'));
  });
  model.prims.filter((p) => p.cat === 'fixture').forEach((p) => {
    o.push(rect(p, `fill="${p.mat === 'tile' ? '#e3eef1' : '#ffffff'}" stroke="#7a7a72" stroke-width="1.1"`));
    if (p.mat === 'tile') o.push(`<path d="M${fmt(X(p.min[0]))} ${fmt(Y(p.min[1]))}L${fmt(X(p.max[0]))} ${fmt(Y(p.max[1]))}M${fmt(X(p.max[0]))} ${fmt(Y(p.min[1]))}L${fmt(X(p.min[0]))} ${fmt(Y(p.max[1]))}" stroke="#9db6bd" stroke-width="0.8"/>`);
  });
  o.push('</g>');

  // cut elements
  const cutCats = { envelope: 1, structure: 1, lining: 1, partition: 1, glazing: 1, screen: 1, porch: 1, trellis: 1 };
  o.push('<g class="cut">');
  model.prims.forEach((p) => {
    if (!cutCats[p.cat] || p.mat === 'vine' || p.mat === 'decking') return;
    if (!(p.min[2] < cutZ && p.max[2] > cutZ)) return;
    if (p.mat === 'screen') {
      const horiz = p.max[0] - p.min[0] > p.max[1] - p.min[1];
      const yy = (p.min[1] + p.max[1]) / 2;
      const xx = (p.min[0] + p.max[0]) / 2;
      o.push(horiz
        ? `<path d="M${fmt(X(p.min[0]))} ${fmt(Y(yy))}H${fmt(X(p.max[0]))}" stroke="${CUT.screen}" stroke-width="2.2" stroke-dasharray="5 3"/>`
        : `<path d="M${fmt(X(xx))} ${fmt(Y(p.min[1]))}V${fmt(Y(p.max[1]))}" stroke="${CUT.screen}" stroke-width="2.2" stroke-dasharray="5 3"/>`);
      return;
    }
    const extra = p.mat === 'glass' ? ' stroke="#3b7f91" stroke-width="1"' : '';
    o.push(rect(p, `fill="${CUT[p.mat] || '#888'}"${extra}`));
  });
  o.push('</g>');

  // overhead: porch roofs and high windows
  o.push('<g fill="none" stroke="#6b5a4b" stroke-width="1.1" stroke-dasharray="7 4">');
  model.prims.filter((p) => p.cat === 'porch-roof').forEach((p) => o.push(rect(p, '')));
  model.openings.filter((op) => op.z0 > cutZ && !(op.along === 'x' && model.bays.find((bb) => bb.id === op.bay).type === 'hall')).forEach((op) => {
    const f = wallFaces(model, op);
    if (op.along === 'x') o.push(`<path d="M${fmt(X(op.a0))} ${fmt(Y(f.mid))}H${fmt(X(op.a1))}" stroke="#3b7f91"/>`);
    else o.push(`<path d="M${fmt(X(f.mid))} ${fmt(Y(op.a0))}V${fmt(Y(op.a1))}" stroke="#3b7f91"/>`);
  });
  o.push('</g>');

  // door symbols
  o.push(`<g fill="none" stroke="${INK}" stroke-width="1.3">`);
  model.openings.forEach((op) => {
    const f = wallFaces(model, op);
    if (op.type === 'door') {
      const leaves = op.hinge === 'both' ? [[op.a0, (op.a0 + op.a1) / 2, op.a0], [(op.a0 + op.a1) / 2, op.a1, op.a1]] : [[op.a0, op.a1, hingeEnd(op)]];
      leaves.forEach(([a0, a1, h]) => o.push(swing(op, f, a0, a1, h, X, Y)));
    } else if (op.type === 'opening') {
      if (op.along === 'x') o.push(`<path d="M${fmt(X(op.a0))} ${fmt(Y(f.inner))}H${fmt(X(op.a1))}M${fmt(X(op.a0))} ${fmt(Y(f.outer))}H${fmt(X(op.a1))}" stroke-dasharray="4 4" stroke-width="1"/>`);
    } else if (op.type === 'sliding-door') {
      const w = op.a1 - op.a0;
      if (op.along === 'x') {
        const y = Y(f.inner) + f.dir * 10;
        o.push(`<path d="M${fmt(X(op.a0 + w * 0.3))} ${fmt(y)}H${fmt(X(op.a0 + w * 0.7))}m-6 -4l6 4l-6 4" stroke-width="1"/>`);
      } else {
        const x = X(f.inner) + f.dir * 10;
        o.push(`<path d="M${fmt(x)} ${fmt(Y(op.a0 + w * 0.3))}V${fmt(Y(op.a0 + w * 0.7))}m-4 -6l4 6l4 -6" stroke-width="1"/>`);
      }
    }
  });
  // sliding partition doors, parked beside the opening
  (spec.rooms || []).forEach((r) => {
    if (!r.door) return;
    const bay = model.bays.find((bb) => bb.id === r.bay);
    const pt = spec.partition_thickness_m || 0.1;
    const a0 = bay.y0 + r.door.from_m;
    const a1 = bay.y0 + r.door.to_m;
    const w = a1 - a0;
    const north = a0 - w + 0.05 >= bay.cy0;
    const s0 = north ? a0 - w + 0.05 : a1 - 0.05;
    const x = r.end_m + pt / 2 + 0.01;
    o.push(`<rect x="${fmt(X(x))}" y="${fmt(Y(s0))}" width="${fmt(0.04 * k)}" height="${fmt(w * k)}" fill="#fff" stroke="${INK}" stroke-width="1"/>`);
    const ym = Y((a0 + a1) / 2);
    o.push(`<path d="M${fmt(X(x) + 9)} ${fmt(ym - 10)}V${fmt(ym + 10)}m-3 ${north ? '-20' : '0'}l3 ${north ? '-5' : '5'}l3 ${north ? '5' : '-5'}" stroke-width="1"/>`);
  });
  o.push('</g>');

  // section mark
  const sx = X(spec.section_x_m);
  const sy0 = Y(b.min[1]) - 8;
  const sy1 = Y(b.max[1]) + 8;
  o.push(`<g class="section-mark" data-x-m="${spec.section_x_m}" stroke="${INK}" fill="${INK}">` +
    `<path d="M${fmt(sx)} ${fmt(sy0)}V${fmt(sy1)}" stroke-width="1.2" stroke-dasharray="14 4 3 4" fill="none"/>` +
    [sy0 - 14, sy1 + 14].map((y) => `<circle cx="${fmt(sx)}" cy="${fmt(y)}" r="12" fill="#fff" stroke-width="1.5"/><text x="${fmt(sx)}" y="${fmt(y + 5)}" font-size="14" font-weight="700" text-anchor="middle" stroke="none">A</text><path d="M${fmt(sx + 14)} ${fmt(y)}h14l-6 -5m6 5l-6 5" fill="none" stroke-width="1.5"/>`).join('') +
    '</g>');

  // labels
  o.push(`<g fill="${INK}" text-anchor="middle" stroke="#f6efe1" stroke-width="3" paint-order="stroke" stroke-linejoin="round">`);
  rooms.forEach((r) => {
    const cx = X((r.xs + r.xe) / 2);
    const w = (r.xe - r.xs) * k;
    const size = r.id === 'hall' ? 20 : (w < 2.5 * k ? 12 : 15);
    const lines = wrap(r.name.toUpperCase(), Math.max(6, Math.floor((w - 10) / (size * 0.62))));
    const cy = Y((r.ys + r.ye) / 2) - (lines.length * size) / 2 + 2;
    lines.forEach((l, i) => o.push(`<text x="${fmt(cx)}" y="${fmt(cy + i * (size + 2))}" font-size="${size}" font-weight="700">${esc(l)}</text>`));
    const y2 = cy + lines.length * (size + 2) + 2;
    o.push(`<text x="${fmt(cx)}" y="${fmt(y2)}" font-size="12">${m(r.clear_length_m, 2)} × ${m(r.clear_width_m, 2)} m</text>`);
    o.push(`<text x="${fmt(cx)}" y="${fmt(y2 + 15)}" font-size="12">${area(r.area_m2)} clear</text>`);
  });
  model.porches.forEach((p) => {
    const cx = X((p.x0 + p.x1) / 2);
    const cy = Y((p.y0 + p.y1) / 2);
    const lines = wrap(p.name.toUpperCase(), Math.max(8, Math.floor(((p.x1 - p.x0) * k - 16) / 9)));
    lines.forEach((l, i) => o.push(`<text x="${fmt(cx)}" y="${fmt(cy - 6 + i * 16 - (lines.length - 1) * 8)}" font-size="14" font-weight="700" fill="#204b36">${esc(l)}</text>`));
    const dx = p.x1 - p.x0;
    const dy = p.y1 - p.y0;
    o.push(`<text x="${fmt(cx)}" y="${fmt(cy + 12 + (lines.length - 1) * 8)}" font-size="12" fill="#204b36">${m(p.side === 'south' || p.side === 'north' ? dx : dy, 2)} × ${m(p.side === 'south' || p.side === 'north' ? dy : dx, 2)} m</text>`);
  });
  model.ramps.forEach((r) => {
    const cx = X((r.x0 + r.x1) / 2);
    const cy = Y((r.y0 + r.y1) / 2);
    const vertical = r.high === 'north' || r.high === 'south';
    const label = `RAMP 1:${r.slope_ratio} • ${m(r.run_m, 2)} m • DOWN`;
    const arrow = { west: '→', east: '←', north: '↓', south: '↑' }[r.high];
    o.push(`<text x="${fmt(cx)}" y="${fmt(cy + 4)}" font-size="12" fill="#5a4026"${vertical ? ` transform="rotate(90 ${fmt(cx)} ${fmt(cy)})"` : ''}>${esc(label)} ${vertical ? '→' : arrow}</text>`);
  });
  o.push('</g>');

  // dimensions
  const ov = M.overall;
  const top = Y(b.min[1]);
  o.push(`<g fill="${INK}">`);
  o.push(dimension(X(ov.x0), top - 95, X(ov.x1), top - 95, `${m(ov.length_m)} m overall, outside of rainscreen`, { 'length-m': m(ov.length_m), role: 'overall-length' }, { ext: 85 }));
  o.push(dimension(X(0), top - 55, X(M.L), top - 55, `${m(M.L)} m container (steel)`, { 'length-m': m(M.L), role: 'module-length' }, { ext: 45 }));
  const left = X(b.min[0]);
  o.push(dimension(left - 85, Y(ov.y0), left - 85, Y(ov.y1), `${m(ov.width_m)} m overall`, { 'length-m': m(ov.width_m), role: 'overall-width' }, { ext: 75 }));
  model.bays.forEach((bay) => {
    o.push(dimension(left - 45, Y(bay.y0), left - 45, Y(bay.y1), `${m(bay.width)}`, { 'length-m': m(bay.width), role: `bay-width-${bay.id}` }, { size: 13 }));
  });
  const lastBay = model.bays[model.bays.length - 1];
  const yb = Y(b.max[1]);
  const chainY = yb + 62;
  rooms.filter((r) => r.bay === lastBay.id).forEach((r) => {
    o.push(dimension(X(r.xs), chainY, X(r.xe), chainY, m(r.clear_length_m, 2), { 'length-m': m(r.clear_length_m, 3), role: `room-${r.id}` }, { size: 13 }));
  });
  o.push(`<text x="${fmt(X(rooms.filter((r) => r.bay === lastBay.id)[0].xs))}" y="${fmt(chainY + 20)}" font-size="12">Clear room lengths inside the lining (m)</text>`);
  o.push('</g>');

  o.push(northArrow(W - 60, 30));
  o.push(scaleBar(40, yb + 128, k, 5));

  // legend and notes
  const lg = [['#55646a', 'Steel shell'], ['url(#ins)', 'Insulation'], ['#9a6b3f', 'Timber rainscreen'], ['#e3d6bb', 'Lining'], ['#a3a89f', 'Partition'], ['#cbe8ef', 'Glazing']];
  o.push(`<g font-size="12" fill="${INK}">`);
  let lx = 330;
  let ly = yb + 122;
  const room = (l) => { const w = 22 + l.length * 7 + 26; if (lx + w > W - 30) { lx = 330; ly += 22; } return w; };
  lg.forEach(([f, l]) => {
    const w = room(l);
    o.push(`<rect x="${lx}" y="${ly}" width="16" height="12" fill="${f}" stroke="${INK}" stroke-width="0.6"/><text x="${lx + 22}" y="${ly + 10}">${esc(l)}</text>`);
    lx += w;
  });
  room('Insect screen xx');
  o.push(`<path d="M${lx} ${ly + 6}h22" stroke="${CUT.screen}" stroke-width="2.2" stroke-dasharray="5 3"/><text x="${lx + 28}" y="${ly + 10}">Insect screen</text>`);
  const notes = [
    'Walls, openings and zones are diagrammatic. Clear dimensions are measured inside the interior lining.',
    `Finished floor ${m(M.ffl_above_grade_m, 2)} m above assumed level grade. At 1:15, every 0.1 m of floor height adds 1.5 m of ramp.`,
    'Cut openings in the steel need engineered reinforcement. Accessibility, egress and fire separations need professional review.',
    LICENCE,
  ];
  notes.forEach((n, i) => o.push(`<text x="40" y="${fmt(yb + 182 + i * 18)}" font-size="13">${esc(n)}</text>`));
  o.push('</g>');

  const rl = rooms.map((r) => `${r.name} ${m(r.clear_length_m, 2)} by ${m(r.clear_width_m, 2)} m (${area(r.area_m2)})`).join('; ');
  const pl = model.porches.map((p) => `${p.name} on the ${p.side} side`).join('; ');
  const ra = model.ramps.map((r) => `ramp at 1:${r.slope_ratio}, ${m(r.run_m, 2)} m long`).join('; ');
  const desc = `Floor plan of ${spec.name}, north up, cut 1.2 m above the floor. Overall ${m(ov.length_m, 2)} by ${m(ov.width_m, 2)} m outside the rainscreen; ` +
    `${model.bays.filter((bb) => bb.type === 'container').length} container module(s) of ${m(M.L, 3)} by ${m(M.W, 3)} m. Rooms with clear dimensions: ${rl}. ${pl}. ${ra}. Not for construction.`;
  return sheet(W, H, `${spec.id}-plan`, `${spec.short_name || spec.name} conceptual floor plan`, desc, o.join(''));
}

/** Room-side and outside faces of the wall assembly an opening sits in. */
function wallFaces(model, op) {
  const M = model.meta;
  const bay = model.bays.find((bb) => bb.id === op.bay);
  const ext = op.exterior;
  if (op.face === 'north') {
    if (bay.type === 'hall') return { inner: bay.y0 + M.tOut + M.hf, outer: bay.y0, dir: 1, mid: bay.y0 + (M.tOut + M.hf) / 2 };
    const inner = bay.y0 + M.ts + M.li;
    const outer = ext ? -M.tOut : bay.y0;
    return { inner, outer, dir: 1, mid: (inner + outer) / 2 };
  }
  if (op.face === 'south') {
    if (bay.type === 'hall') return { inner: bay.y1 - M.tOut - M.hf, outer: bay.y1, dir: -1, mid: bay.y1 - (M.tOut + M.hf) / 2 };
    const inner = bay.y1 - M.ts - M.li;
    const outer = ext ? M.Wt + M.tOut : bay.y1;
    return { inner, outer, dir: -1, mid: (inner + outer) / 2 };
  }
  const steel = bay.type === 'container';
  if (op.face === 'west') {
    const inner = steel ? M.te + M.li : M.hf;
    return { inner, outer: -M.tOut, dir: 1, mid: (inner - M.tOut) / 2 };
  }
  const inner = M.L - (steel ? M.te + M.li : M.hf);
  return { inner, outer: M.L + M.tOut, dir: -1, mid: (inner + M.L + M.tOut) / 2 };
}

function hingeEnd(op) {
  const h = op.hinge;
  if (op.along === 'x') return h === 'east' ? op.a1 : op.a0;
  return h === 'south' ? op.a1 : op.a0;
}

function swing(op, f, a0, a1, hinge, X, Y) {
  const w = a1 - a0;
  const inward = op.swing !== 'out';
  const base = inward ? f.inner : f.outer;
  const dir = inward ? f.dir : -f.dir;
  const free = hinge === a0 ? a1 : a0;
  if (op.along === 'x') {
    const hx = X(hinge); const hy = Y(base); const ey = Y(base + dir * w); const fx = X(free);
    const sweep = ((free > hinge) === (dir > 0)) ? 1 : 0;
    return `<path d="M${fmt(hx)} ${fmt(hy)}V${fmt(ey)}" stroke-width="2"/><path d="M${fmt(fx)} ${fmt(hy)}A${fmt(w * SCALE)} ${fmt(w * SCALE)} 0 0 ${sweep} ${fmt(hx)} ${fmt(ey)}" stroke-width="0.8" stroke-dasharray="3 3"/>`;
  }
  const hy = Y(hinge); const hx = X(base); const ex = X(base + dir * w); const fy = Y(free);
  const sweep = ((free > hinge) === (dir > 0)) ? 0 : 1;
  return `<path d="M${fmt(hx)} ${fmt(hy)}H${fmt(ex)}" stroke-width="2"/><path d="M${fmt(hx)} ${fmt(fy)}A${fmt(w * SCALE)} ${fmt(w * SCALE)} 0 0 ${sweep} ${fmt(ex)} ${fmt(hy)}" stroke-width="0.8" stroke-dasharray="3 3"/>`;
}

/* ----------------------------------------------------------- elevations */

function projectView(prims, view) {
  const items = R.orthoItems(prims, R.ELEVATIONS[view].R);
  let minX = Infinity; let maxX = -Infinity; let minY = Infinity; let maxY = -Infinity;
  items.forEach((it) => it.faces.forEach((f) => f.pts.forEach((q) => {
    minX = Math.min(minX, q[0]); maxX = Math.max(maxX, q[0]); minY = Math.min(minY, -q[2]); maxY = Math.max(maxY, -q[2]);
  })));
  return { items, minX, maxX, minY, maxY };
}

function elevationFill(p) {
  const mat = R.MATERIALS[p.mat] || R.MATERIALS.fixture;
  if (p.mat === 'cladding') return 'fill="url(#boards)"';
  if (p.mat === 'glass') return 'fill="#a9d4dc" fill-opacity="0.8" stroke="#244c4f" stroke-width="1.5" stroke-opacity="1"';
  return `fill="${mat.fill}"${mat.opacity != null ? ` fill-opacity="${mat.opacity}"` : ''}`;
}

export function elevationsSVG(model) {
  const { spec, meta: M } = model;
  const k = SCALE;
  const prims = model.prims.filter((p) => p.cat !== 'room');
  const views = ['south', 'north', 'east', 'west'].map((v) => ({ v, ...projectView(prims, v) }));
  const gap = 230;
  const left = 70;
  const width = (pv) => (pv.maxX - pv.minX) * k;
  const height = (pv) => (pv.maxY - pv.minY) * k;
  const [S, N, E, Wv] = views;
  const longW = Math.max(width(S), width(N));
  const endW = width(E) + gap + width(Wv);
  const W = Math.ceil(left + Math.max(longW, endW) + 190);
  let y = 130;
  const placed = [];
  placed.push({ pv: S, x: left, y: y + 30 }); y += 30 + height(S) + 75;
  placed.push({ pv: N, x: left, y: y + 30 }); y += 30 + height(N) + 75;
  placed.push({ pv: E, x: left, y: y + 30 });
  placed.push({ pv: Wv, x: left + width(E) + gap, y: y + 30 });
  y += 30 + Math.max(height(E), height(Wv)) + 120;
  const H = Math.ceil(y + 90);
  const o = [];
  o.push(heading(spec, 'Elevations • conceptual • not engineered • drawn to the same scale as the plan'));
  const names = { south: 'SOUTH ELEVATION', north: 'NORTH ELEVATION', east: 'EAST ELEVATION', west: 'WEST ELEVATION' };
  placed.forEach(({ pv, x, y: y0 }) => {
    const tx = (q) => x + (q[0] - pv.minX) * k;
    const ty = (q) => y0 + (-q[2] - pv.minY) * k;
    o.push(`<g class="elevation" data-view="${pv.v}">`);
    o.push(`<text x="${x}" y="${y0 - 14}" font-size="18" font-weight="700" fill="${INK}">${names[pv.v]}</text>`);
    o.push('<g stroke="#26352d" stroke-opacity="0.55" stroke-width="0.7" stroke-linejoin="round">');
    pv.items.forEach((it) => it.faces.forEach((f) => {
      o.push(`<path d="M${f.pts.map((q) => `${fmt(tx(q))} ${fmt(ty(q))}`).join('L')}Z" ${elevationFill(it.p)}/>`);
    }));
    o.push('</g>');
    const gy = ty([0, 0, M.zGrade]);
    o.push(`<path d="M${fmt(x - 20)} ${fmt(gy)}H${fmt(x + width(pv) + 20)}" stroke="${INK}" stroke-width="2.5"/>`);
    // levels on the right
    const rx = x + width(pv) + 28;
    const lv = [['Grade', M.zGrade], ['Floor', M.FFL], ['Top of roof', Math.max(...model.bays.map((bb) => bb.top))]];
    lv.forEach(([label, z]) => {
      const yy = ty([0, 0, z]);
      o.push(`<path d="M${fmt(rx - 8)} ${fmt(yy)}h16" stroke="${INK}" stroke-width="1.2"/><text x="${fmt(rx + 12)}" y="${fmt(yy + 4)}" font-size="12" fill="${INK}">${label} +${m(z - M.zGrade, 2)}</text>`);
    });
    if (pv.v === 'south') {
      const top = Math.max(...model.bays.map((bb) => bb.top));
      o.push(`<g fill="${INK}">${dimension(rx + 120, ty([0, 0, top]), rx + 120, gy, `${m(top - M.zGrade, 3)} m`, { 'length-m': m(top - M.zGrade), role: 'height-above-grade' }, { size: 13 })}</g>`);
    }
    o.push('</g>');
  });
  o.push(`<g fill="${INK}" font-size="13">`);
  const notes = [
    'Cladding boards, openings and foundations are shown diagrammatically. PV is drawn flat: tilt and racking are not designed.',
    'Grade is assumed level for these drawings; the site model has real slopes and the pile heights will vary.',
    LICENCE,
  ];
  notes.forEach((n, i) => o.push(`<text x="40" y="${H - 66 + i * 18}">${esc(n)}</text>`));
  o.push(scaleBar(40, H - 100, k, 5));
  o.push('</g>');
  const top = Math.max(...model.bays.map((bb) => bb.top));
  const desc = `Four elevations of ${spec.name} at one scale. Top of roof ${m(top - M.zGrade, 2)} m above grade, finished floor ${m(M.ffl_above_grade_m, 2)} m above grade on piles. ` +
    `Timber rainscreen over continuous external insulation; ${model.openings.filter((op) => op.exterior).length} exterior openings; ` +
    `${model.porches.map((p) => p.name.toLowerCase()).join(' and ')}${model.ramps.length ? `; ${model.ramps.length} ramp(s) at 1:${model.ramps[0].slope_ratio}` : ''}; ${M.pv.panels} PV modules drawn flat. Not engineered.`;
  return sheet(W, H, `${spec.id}-elev`, `${spec.short_name || spec.name} exterior elevations`, desc, o.join(''));
}

/* -------------------------------------------------------------- section */

function lighten(c, t) {
  if (!c.startsWith('#')) return c;
  const h = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  return '#' + h.map((v) => Math.round(v + (255 - v) * t).toString(16).padStart(2, '0')).join('');
}

export function sectionSVG(model) {
  const { spec, meta: M, rooms } = model;
  const k = SCALE;
  const xs = spec.section_x_m;
  const cut = model.prims.filter((p) => p.min[0] < xs && p.max[0] > xs && p.cat !== 'room');
  const beyond = model.prims.filter((p) => p.min[0] >= xs && p.cat !== 'room');
  const items = R.orthoItems(beyond, R.ELEVATIONS.west.R);
  // west view: screen x = y, screen y = -z
  let minX = Infinity; let maxX = -Infinity; let minY = Infinity; let maxY = -Infinity;
  const grow = (sx, sy) => { minX = Math.min(minX, sx); maxX = Math.max(maxX, sx); minY = Math.min(minY, sy); maxY = Math.max(maxY, sy); };
  cut.forEach((p) => { grow(p.min[1], -p.max[2]); grow(p.max[1], -p.min[2]); });
  items.forEach((it) => it.faces.forEach((f) => f.pts.forEach((q) => grow(q[0], -q[2]))));
  const left = 140;
  const topY = 170;
  const X = (y) => left + (y - minX) * k;
  const Y = (sy) => topY + (sy - minY) * k;
  const secW = (maxX - minX) * k;
  const secH = (maxY - minY) * k;
  const detailX = left + secW + 260;
  const W = Math.ceil(detailX + 760);
  const H = Math.ceil(Math.max(topY + secH + 260, 820));
  const o = [];
  o.push(heading(spec, `Section A–A, cut ${m(xs, 2)} m from the west end, looking east • envelope concept • not a specified assembly`));

  o.push('<g stroke="#26352d" stroke-opacity="0.4" stroke-width="0.6">');
  items.forEach((it) => it.faces.forEach((f) => {
    const mat = R.MATERIALS[it.p.mat] || R.MATERIALS.fixture;
    o.push(`<path d="M${f.pts.map((q) => `${fmt(X(q[0]))} ${fmt(Y(-q[2]))}`).join('L')}Z" fill="${lighten(mat.fill, 0.5)}"${mat.opacity != null ? ` fill-opacity="${mat.opacity}"` : ''}/>`);
  }));
  o.push('</g>');
  o.push('<g class="cut" stroke="#1d2b25" stroke-width="0.8">');
  cut.forEach((p) => {
    const fill = CUT[p.mat] || '#888';
    o.push(`<rect x="${fmt(X(p.min[1]))}" y="${fmt(Y(-p.max[2]))}" width="${fmt((p.max[1] - p.min[1]) * k)}" height="${fmt((p.max[2] - p.min[2]) * k)}" fill="${fill}"${p.mat === 'glass' || p.mat === 'screen' || p.mat === 'vine' ? ' fill-opacity="0.7"' : ''}/>`);
  });
  o.push('</g>');
  const gy = Y(-M.zGrade);
  o.push(`<path d="M${fmt(X(minX) - 30)} ${fmt(gy)}H${fmt(X(maxX) + 30)}" stroke="${INK}" stroke-width="2.5"/>`);

  // room names at the cut
  o.push(`<g fill="${INK}" text-anchor="middle" font-size="14" font-weight="700">`);
  rooms.filter((r) => r.xs < xs && r.xe > xs).forEach((r) => {
    o.push(`<text x="${fmt(X((r.ys + r.ye) / 2))}" y="${fmt(Y(-(M.FFL + 1.6)))}" stroke="#fffdf7" stroke-width="3" paint-order="stroke">${esc(r.name.toUpperCase())}</text>`);
  });
  o.push('</g>');

  // levels and dimensions
  const rx = X(maxX) + 40;
  const top = Math.max(...model.bays.map((bb) => bb.top));
  o.push(`<g fill="${INK}">`);
  [['Grade', M.zGrade], ['Floor', M.FFL], ['Ceiling', M.ceiling], ['Top of roof', top]].forEach(([label, z]) => {
    const yy = Y(-z);
    o.push(`<path d="M${fmt(rx - 8)} ${fmt(yy)}h16" stroke="${INK}" stroke-width="1.2"/><text x="${fmt(rx + 12)}" y="${fmt(yy + 4)}" font-size="12">${label} +${m(z - M.zGrade, 2)}</text>`);
  });
  o.push(dimension(X(minX) - 40, Y(-M.ceiling), X(minX) - 40, Y(-M.FFL), `${m(M.clear_height_m, 3)} m clear`, { 'length-m': m(M.clear_height_m), role: 'clear-height' }, { size: 13 }));
  const ov = M.overall;
  const bottom = Y(-M.zGrade) + 60;
  o.push(dimension(X(ov.y0), bottom, X(ov.y1), bottom, `${m(ov.width_m)} m overall`, { 'length-m': m(ov.width_m), role: 'overall-width' }, { ext: 0 }));
  model.bays.filter((bb) => bb.type === 'container').forEach((bb, i) => {
    o.push(dimension(X(bb.cy0), bottom + 45, X(bb.cy1), bottom + 45, `${m(bb.cy1 - bb.cy0)} clear`, { 'length-m': m(bb.cy1 - bb.cy0), role: `clear-width-${bb.id}` }, { size: 12 }));
  });
  o.push('</g>');

  // wall build-up detail, to a larger scale
  const kd = 800;
  const layers = [
    { name: 'Interior lining on service battens', t: M.li, fill: CUT.lining },
    { name: 'Steel container shell (corrugation depth)', t: M.ts, fill: CUT.steel },
  ].concat(M.wall_layers.map((l) => ({ name: l.name, t: l.thickness_m, fill: l.material === 'cavity' ? '#cfe4d8' : CUT[l.material] })));
  const dy = topY + 30;
  const dh = 340;
  let x = detailX;
  o.push(`<g class="buildup" fill="${INK}"><text x="${detailX}" y="${dy - 32}" font-size="18" font-weight="700">WALL BUILD-UP (CONCEPT)</text>`);
  o.push(`<text x="${detailX}" y="${dy - 12}" font-size="13">Drawn at about ${Math.round(kd / k)}× the section scale; interior on the left</text>`);
  const total = layers.reduce((s, l) => s + l.t, 0);
  layers.forEach((l, i) => {
    const w = l.t * kd;
    o.push(`<rect x="${fmt(x)}" y="${dy}" width="${fmt(w)}" height="${dh}" fill="${l.fill}" stroke="${INK}" stroke-width="0.8"/>`);
    const ly = dy + 30 + i * 62;
    const lx = detailX + total * kd + 40;
    o.push(`<path d="M${fmt(x + w / 2)} ${fmt(ly)}H${fmt(lx - 6)}" stroke="${INK}" stroke-width="1.2" fill="none"/><circle cx="${fmt(x + w / 2)}" cy="${fmt(ly)}" r="2.5"/>`);
    o.push(`<text x="${fmt(lx)}" y="${fmt(ly + 5)}" font-size="15">${esc(l.name)}: ${Math.round(l.t * 1000)} mm</text>`);
    x += w;
  });
  o.push(`<text x="${detailX}" y="${dy + dh + 24}" font-size="14">Interior</text><text x="${fmt(x)}" y="${dy + dh + 24}" font-size="14" text-anchor="end">Exterior</text>`);
  o.push(dimension(detailX, dy + dh + 58, x, dy + dh + 58, `${Math.round(total * 1000)} mm`, { 'length-m': m(total), role: 'wall-thickness' }, { size: 13 }));
  const roofTxt = 'Roof: ' + [`${Math.round(M.tr * 1000)} mm steel roof`].concat(M.roof_layers.map((l) => `${Math.round(l.thickness_m * 1000)} mm ${l.name.toLowerCase()}`)).join(', ');
  const floorTxt = 'Floor: ' + [`${Math.round((M.FFL - M.tf) * 1000)} mm finish`, `${Math.round(M.tf * 1000)} mm container floor`].concat(M.floor_layers.map((l) => `${Math.round(l.thickness_m * 1000)} mm ${l.name.toLowerCase()}`)).join(', ');
  const lines = wrap(roofTxt, 88).concat(wrap(floorTxt, 88)).concat(wrap(spec.envelope.unspecified || '', 88));
  lines.forEach((l, i) => o.push(`<text x="${detailX}" y="${dy + dh + 110 + i * 19}" font-size="14">${esc(l)}</text>`));
  o.push('</g>');

  o.push(`<g fill="${INK}" font-size="13"><text x="40" y="${H - 48}">Diagram only. Assembly, fire, moisture and code compliance must be designed. Selective spray foam requires separate assessment.</text><text x="40" y="${H - 28}">${LICENCE}</text></g>`);
  o.push(scaleBar(left, H - 100, k, 2));

  const desc = `Transverse section of ${spec.name} looking east, ${m(xs, 2)} m from the west end, with a wall build-up detail. ` +
    `From inside to outside: ${layers.map((l) => `${l.name.toLowerCase()} ${Math.round(l.t * 1000)} mm`).join(', ')}; ${Math.round(total * 1000)} mm in total. ` +
    `Clear interior height ${m(M.clear_height_m, 2)} m; floor ${m(M.ffl_above_grade_m, 2)} m above grade on piles. Not a specified building assembly.`;
  return sheet(W, H, `${spec.id}-section`, `${spec.short_name || spec.name} conceptual section and envelope build-up`, desc, o.join(''));
}

/* --------------------------------------------------------- axonometrics */

export function axoSVG(model, which) {
  const { spec } = model;
  const cut = which === 'cutaway';
  const opts = cut
    ? { view: 'sw', mode: 'cut', labels: 'all', scale: model.bays.length > 1 ? 26 : 34 }
    : { view: 'sw', mode: 'exterior', scale: model.bays.length > 1 ? 26 : 34 };
  opts.id = `${spec.id}-${which}`;
  opts.background = PAPER;
  opts.credit = `${LICENCE} | Concept only, not for construction`;
  opts.title = cut ? `${spec.short_name || spec.name} cutaway: walls cut at 1.2 m, viewed from the south-west` : `${spec.short_name || spec.name} exterior, viewed from the south-west`;
  const rooms = model.rooms.map((r) => r.name).join(', ');
  opts.desc = cut
    ? `Axonometric cutaway of ${spec.name} with the roof removed and walls cut 1.2 m above the floor, showing ${rooms}, furniture, the envelope layers in the cut walls, ${model.porches.map((p) => p.name.toLowerCase()).join(' and ')}, ramps and piles. Concept only.`
    : `Axonometric view of ${spec.name} from the south-west: timber rainscreen, ${model.meta.pv.panels} PV modules, ${model.porches.map((p) => p.name.toLowerCase()).join(' and ')}, ${model.ramps.length} ramp(s), independent trellis and piles. Concept only.`;
  return R.renderAxo(model, opts).svg;
}
