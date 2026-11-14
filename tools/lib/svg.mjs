// Tiny SVG string helpers. MIT licence.

export function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function fmt(v, d = 1) {
  const f = 10 ** d;
  const r = Math.round(v * f) / f;
  return Object.is(r, -0) ? '0' : String(r);
}

/** Metres with a fixed number of decimals, e.g. "12.586". */
export function m(v, d = 3) {
  return (Math.round(v * 10 ** d) / 10 ** d).toFixed(d);
}

/** Wrap text into lines of at most `max` characters. */
export function wrap(text, max) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if (cur && (cur + ' ' + w).length > max) { lines.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w;
  }
  if (cur) lines.push(cur);
  return lines;
}

/**
 * Linear dimension with slash ticks. Horizontal when y1 === y2, otherwise vertical.
 * `data` is written as data-* attributes so tests can check the drawing against the model.
 */
export function dimension(x1, y1, x2, y2, label, data = {}, opts = {}) {
  const attrs = Object.entries(data).map(([k, v]) => ` data-${k}="${esc(v)}"`).join('');
  const horiz = Math.abs(y1 - y2) < 1e-9;
  const t = 5;
  const tick = (x, y) => `M${fmt(x - t)} ${fmt(y + t)}L${fmt(x + t)} ${fmt(y - t)}`;
  const ext = opts.ext || 0;
  let extLines = '';
  if (ext) {
    extLines = horiz
      ? `M${fmt(x1)} ${fmt(y1 - 4)}V${fmt(y1 + ext)}M${fmt(x2)} ${fmt(y2 - 4)}V${fmt(y2 + ext)}`
      : `M${fmt(x1 - 4)} ${fmt(y1)}H${fmt(x1 + ext)}M${fmt(x2 - 4)} ${fmt(y2)}H${fmt(x2 + ext)}`;
  }
  const size = opts.size || 15;
  const text = horiz
    ? `<text x="${fmt((x1 + x2) / 2)}" y="${fmt(y1 - 7)}" text-anchor="middle" font-size="${size}">${esc(label)}</text>`
    : `<text x="${fmt(x1 - 8)}" y="${fmt((y1 + y2) / 2)}" text-anchor="middle" font-size="${size}" transform="rotate(-90 ${fmt(x1 - 8)} ${fmt((y1 + y2) / 2)})">${esc(label)}</text>`;
  return `<g class="dim"${attrs}><path d="M${fmt(x1)} ${fmt(y1)}L${fmt(x2)} ${fmt(y2)}${tick(x1, y1)}${tick(x2, y2)}${extLines}" stroke="#34483f" stroke-width="1.2" fill="none"/>${text}</g>`;
}

export function northArrow(x, y, size = 22) {
  return `<g aria-hidden="true"><path d="M${x} ${y + size}l${size / 3} -${size}l${size / 3} ${size}l-${size / 3} -${size / 4}z" fill="#21382c"/>` +
    `<text x="${x + size / 3}" y="${y + size + 16}" text-anchor="middle" font-size="14" font-weight="700" fill="#21382c">N</text></g>`;
}

export function scaleBar(x, y, k, metres = 5) {
  let s = `<g class="scale-bar" data-px-per-m="${k}" font-size="12" fill="#21382c">`;
  for (let i = 0; i < metres; i++) {
    s += `<rect x="${fmt(x + i * k)}" y="${y}" width="${fmt(k)}" height="6" fill="${i % 2 ? '#fff' : '#21382c'}" stroke="#21382c" stroke-width="0.8"/>`;
  }
  s += `<text x="${x}" y="${y - 5}">0</text><text x="${fmt(x + k)}" y="${y - 5}" text-anchor="middle">1</text>`;
  s += `<text x="${fmt(x + metres * k)}" y="${y - 5}" text-anchor="middle">${metres} m</text></g>`;
  return s;
}
