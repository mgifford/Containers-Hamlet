// Per-home view diagrams: a small plan-centred graphic generated from the site
// data. It shows the principal view cone, the target landscape feature, nearby
// homes and paths. Descriptive only: it is not a sightline or privacy rating.
// MIT licence.
import { placeBuilding, lakePolygon, targetPoint, bearingDeg, angularDiff } from './site.mjs';
import { esc, fmt } from './svg.mjs';

const R = 138;
const SIZE = 280;
const C = SIZE / 2;
const S = 1; // px per metre

function labelFor(target) {
  if (!target) return 'the forest';
  if (target.type === 'lake') return 'Heron Lake';
  if (target.type === 'wetland') return 'the beaver meadow';
  if (target.type === 'landmark') return target.id.replace(/-/g, ' ');
  if (target.type === 'clearing') return target.id.replace(/-/g, ' ');
  return 'the landscape';
}

function homeLabel(b) {
  return b.id === 'lodge' ? 'Lodge' : `${b.id.toUpperCase()} ${b.short_name || ''}`.trim();
}

export function renderViewDiagram(site, models, analysis, b) {
  const pre = `view-${b.id}`;
  const r = analysis.buildings.find((x) => x.id === b.id);
  const pl = analysis.placed[b.id];
  if (!r || !pl) return '';
  const to = ([x, y]) => [C + (x - b.x_m) * S, C + (y - b.y_m) * S];
  const d = (pts, closed) => 'M' + pts.map(to).map((p) => `${fmt(p[0], 1)} ${fmt(p[1], 1)}`).join('L') + (closed ? 'Z' : '');
  const mainBearing = r.views.main_bearing_deg;
  const target = targetPoint(site, b.views.main.target, [b.x_m, b.y_m]);
  const out = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" role="img" aria-labelledby="${pre}-t ${pre}-d">`);
  out.push(`<title id="${pre}-t">${esc(homeLabel(b))} view diagram</title>`);
  const targetDesc = target ? `${labelFor(b.views.main.target)} at ${r.views.main_distance_m} m, bearing ${Math.round(mainBearing)} degrees` : 'no target';
  const neighbourText = r.views.neighbours_in_view && r.views.neighbours_in_view.length
    ? `Neighbouring buildings in the view cone: ${r.views.neighbours_in_view.map((n) => `${n.name} at ${n.distance_m} m`).join(', ')}.`
    : 'No neighbouring building is inside the principal view cone within 120 m.';
  out.push(`<desc id="${pre}-d">${esc(`Plan-centred view diagram for ${b.name}${b.short_name ? ` (${b.short_name})` : ''}. North is up. The principal ${pl.principal.side} facade and screened porch face ${Math.round(pl.principal.azimuth)} degrees, toward ${targetDesc}. The view passes through ${r.views.canopy_description}. ${neighbourText} The walking path arrives from the ${b.orientation ? b.orientation.path_approach : 'north'}. The diagram is illustrative and is not a sightline or privacy assessment.`)}</desc>`);
  out.push(`<defs><clipPath id="${pre}-clip"><circle cx="${C}" cy="${C}" r="${R}"/></clipPath></defs>`);
  out.push(`<rect width="${SIZE}" height="${SIZE}" fill="#f7f5eb"/>`);
  out.push(`<g clip-path="url(#${pre}-clip)">`);
  // woodland
  (site.woodland.stands || []).forEach((s) => {
    const fill = s.type === 'conifer' ? '#cfd9c0' : s.type === 'deciduous' ? '#dde4c4' : '#d7dfc4';
    out.push(`<path d="${d(s.polygon, true)}" fill="${fill}" fill-opacity="0.75"/>`);
  });
  // clearings
  const clearings = (site.clearings || []).concat((analysis.placed ? [] : []));
  clearings.forEach((c) => out.push(`<path d="${d(c.polygon, true)}" fill="#e8dfb8" fill-opacity="0.8"/>`));
  // home clearings (rough circles)
  site.buildings.forEach((bb) => {
    const rr = bb.clearing_radius_m || 11;
    out.push(`<circle cx="${to([bb.x_m, bb.y_m])[0]}" cy="${to([bb.x_m, bb.y_m])[1]}" r="${rr * S}" fill="#e8dfb8" fill-opacity="0.55"/>`);
  });
  // rocks
  (site.rocks || []).forEach((k) => out.push(`<path d="${d(k.polygon, true)}" fill="#b8b1a2" stroke="#8b8475" stroke-width="0.7"/>`));
  // buffers
  out.push(`<path d="${d(site.lake.shoreline, false)}" fill="none" stroke="#c98b58" stroke-width="${site.no_build.shoreline_setback_m * 2 * S}" stroke-opacity="0.1"/>`);
  out.push(`<path d="${d(site.wetland.polygon, true)}" fill="none" stroke="#c98b58" stroke-width="${site.no_build.wetland_buffer_m * 2 * S}" stroke-opacity="0.1"/>`);
  (site.drainage || []).forEach((ch) => out.push(`<path d="${d(ch.points, false)}" fill="none" stroke="#4d7890" stroke-width="${Math.max(1.4, ch.width_m * S)}" stroke-dasharray="3 2" stroke-opacity="0.8"/>`));
  // water
  out.push(`<path d="${d(lakePolygon(site), true)}" fill="#8ebdcc"/>`);
  out.push(`<path d="${d(site.wetland.polygon, true)}" fill="#9cc3a7" stroke="#4f7d64" stroke-width="0.7"/>`);
  // paths and tracks
  (site.circulation.lanes || []).forEach((l) => out.push(`<path d="${d(l.points, false)}" fill="none" stroke="${l.kind === 'vehicle' ? '#b9a984' : '#b4b88a'}" stroke-width="${Math.max(1, l.width_m * S)}" stroke-dasharray="${l.kind === 'vehicle' ? '' : '4 2'}"/>`));
  (site.circulation.trails || []).forEach((t) => out.push(`<path d="${d(t.points, false)}" fill="none" stroke="#b59a66" stroke-width="${Math.max(0.9, t.width_m * S)}" stroke-dasharray="0.6 2.4"/>`));
  // view cone
  const radius = 128;
  const arc = [];
  for (let a = -30; a <= 30; a += 5) {
    const rad = ((mainBearing + a) * Math.PI) / 180;
    arc.push([b.x_m + Math.sin(rad) * radius, b.y_m - Math.cos(rad) * radius]);
  }
  const wedge = [to([b.x_m, b.y_m])].concat(arc.map(to));
  out.push(`<path d="${'M' + wedge.map((p) => `${fmt(p[0], 1)} ${fmt(p[1], 1)}`).join('L')}Z" fill="#5b86b4" fill-opacity="0.18" stroke="#3f5f8a" stroke-width="0.9" stroke-dasharray="3 2"/>`);
  // neighbours
  site.buildings.forEach((bb) => {
    if (bb.id === b.id) return;
    const pp = to([bb.x_m, bb.y_m]);
    if (Math.hypot(pp[0] - C, pp[1] - C) > R - 4) return;
    const nb = placeBuilding(models[bb.model], bb);
    const poly = nb.parts[0].poly.map(to);
    out.push(`<path d="${'M' + poly.map((p) => `${fmt(p[0], 1)} ${fmt(p[1], 1)}`).join('L')}Z" fill="${bb.id === 'lodge' ? '#8a694d' : '#b58a62'}" stroke="#274c3b" stroke-width="0.6"/>`);
    out.push(`<text x="${fmt(pp[0], 1)}" y="${fmt(pp[1] - 5, 1)}" font-family="system-ui, sans-serif" font-size="8" font-weight="700" fill="#24452f" stroke="#f7f5eb" stroke-width="2" paint-order="stroke" text-anchor="middle">${esc(homeLabel(bb))}</text>`);
  });
  // home
  const poly = pl.parts[0].poly.map(to);
  out.push(`<path d="${'M' + poly.map((p) => `${fmt(p[0], 1)} ${fmt(p[1], 1)}`).join('L')}Z" fill="#b58a62" stroke="#7a3b14" stroke-width="1.6"/>`);
  pl.parts.filter((p) => p.kind === 'porch').forEach((p) => {
    out.push(`<path d="${'M' + p.poly.map(to).map((q) => `${fmt(q[0], 1)} ${fmt(q[1], 1)}`).join('L')}Z" fill="#d9c7a5" stroke="#7a3b14" stroke-width="1"/>`);
  });
  // target marker
  if (target) {
    const dist = Math.hypot(target[0] - b.x_m, target[1] - b.y_m);
    const tt = to(target);
    if (Math.hypot(tt[0] - C, tt[1] - C) < R - 8) {
      out.push(`<circle cx="${fmt(tt[0], 1)}" cy="${fmt(tt[1], 1)}" r="5" fill="#3f5f8a" stroke="#fffdf7" stroke-width="1.5"/>`);
    }
    const edge = [b.x_m + Math.sin((mainBearing * Math.PI) / 180) * Math.min(dist, 125), b.y_m - Math.cos((mainBearing * Math.PI) / 180) * Math.min(dist, 125)];
    const ep = to(edge);
    out.push(`<text x="${fmt(ep[0], 1)}" y="${fmt(ep[1] - 7, 1)}" font-family="system-ui, sans-serif" font-size="8.5" fill="#2f4f78" stroke="#f7f5eb" stroke-width="2.4" paint-order="stroke" text-anchor="middle">${esc(labelFor(b.views.main.target))}</text>`);
  }
  // rings and compass
  [50, 100].forEach((rr) => out.push(`<circle cx="${C}" cy="${C}" r="${rr * S}" fill="none" stroke="#7f8f78" stroke-width="0.6" stroke-dasharray="2 3" stroke-opacity="0.6"/>`));
  out.push(`<text x="${C}" y="${C - 50 * S - 4}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="7" fill="#53634d">50 m</text>`);
  out.push('</g>');
  out.push(`<circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="#d3d8c6" stroke-width="2"/>`);
  out.push(`<g aria-hidden="true"><circle cx="${SIZE - 24}" cy="24" r="14" fill="#fffdf7" fill-opacity="0.9"/><path d="M${SIZE - 24} 12l4 20l-4 -5l-4 5z" fill="#1d392c"/><text x="${SIZE - 24}" y="44" font-family="system-ui, sans-serif" font-size="9" font-weight="700" text-anchor="middle" fill="#1d392c">N</text></g>`);
  out.push(`<text x="10" y="${SIZE - 8}" font-family="system-ui, sans-serif" font-size="7" fill="#5c6655">Illustrative view diagram · not a sightline assessment · CC BY 4.0</text>`);
  out.push('</svg>');
  return out.join('');
}
