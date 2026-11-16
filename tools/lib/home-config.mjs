// Code: MIT. Geometry: CC BY 4.0.
const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export function configurationSVG(id, name, kind) {
  const pair = kind === 'pair';
  const compact = kind === 'compact';
  const lodge = kind === 'lodge';
  const W = 520, H = 190;
  const u = 22; // pixels per metre
  const moduleL = compact ? 6.058 : 12.192;
  const moduleW = 2.438;
  const x0 = 120, y0 = 78;
  const rect = (x, y, l, w, fill, label) => `<rect x="${x}" y="${y}" width="${l * u}" height="${w * u}" fill="${fill}" stroke="#274c3b" stroke-width="2"/><text x="${x + (l * u) / 2}" y="${y + (w * u) / 2 + 4}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#17392e">${esc(label)}</text>`;
  let body = '';
  if (lodge) {
    body = rect(x0, y0, moduleL, moduleW, '#b58a62', 'container') +
      `<rect x="${x0 + moduleL * u + 10}" y="${y0}" width="${6 * u}" height="${moduleW * u + 4}" fill="#d9c7a5" stroke="#274c3b" stroke-width="2"/><text x="${x0 + moduleL * u + 10 + 3 * u}" y="${y0 + (moduleW * u) / 2 + 4}" text-anchor="middle" font-family="system-ui" font-size="11" font-weight="700" fill="#17392e">hall</text>` +
      rect(x0 + moduleL * u + 10 + 6 * u + 10, y0, moduleL, moduleW, '#b58a62', 'container');
  } else if (pair) {
    body = rect(x0, y0, moduleL, moduleW, '#b58a62', 'module 1') +
      rect(x0 + 1.9 * u, y0 + (moduleW + 1.15) * u, moduleL, moduleW, '#cbb08a', 'module 2') +
      `<text x="${x0}" y="${y0 - 10}" font-family="system-ui" font-size="10" fill="#5e6a58">offset pair · two 40-ft modules</text>`;
  } else {
    body = rect(x0, y0, moduleL, moduleW, '#b58a62', compact ? '20-ft module' : '40-ft module');
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="cfg-t cfg-d">
<title id="cfg-t">${esc(name)} configuration</title>
<desc id="cfg-d">${esc(pair ? 'Two 40-foot containers shown as an offset pair.' : compact ? 'One short 20-foot container.' : lodge ? 'Two containers either side of a shared hall.' : 'One 40-foot container.')} Concept massing only; not a floor plan or construction drawing.</desc>
<rect width="${W}" height="${H}" fill="#faf8f2"/>
${body}
<text x="20" y="172" font-family="system-ui" font-size="10" fill="#5e6a58">Concept massing · not to scale for construction · CC BY 4.0</text>
</svg>`;
}
