// A deterministic concept impression of a lake-edge home at Heron Lake.
// This is illustration, not a surveyed view or a photorealistic rendering.
// The composition takes its cue from the site data: cedar and pine shore,
// rock, a screened porch facing the water and a low timber-clad home.
// MIT licence (code); CC BY 4.0 (illustration).
import { mulberry32 } from './geo.mjs';
import { esc, fmt } from './svg.mjs';

function conifer(x, base, h, fill, opacity = 1) {
  const w = h * 0.34;
  return `<g fill="${fill}" fill-opacity="${opacity}">` +
    `<rect x="${fmt(x - h * 0.018, 1)}" y="${fmt(base - h * 0.2, 1)}" width="${fmt(h * 0.036, 1)}" height="${fmt(h * 0.25, 1)}" fill="#4a3a2a"/>` +
    `<path d="M${fmt(x, 1)} ${fmt(base - h, 1)}L${fmt(x + w * 0.55, 1)} ${fmt(base - h * 0.62, 1)}L${fmt(x + w * 0.3, 1)} ${fmt(base - h * 0.62, 1)}L${fmt(x + w * 0.8, 1)} ${fmt(base - h * 0.3, 1)}L${fmt(x + w * 0.45, 1)} ${fmt(base - h * 0.3, 1)}L${fmt(x + w, 1)} ${fmt(base, 1)}L${fmt(x - w, 1)} ${fmt(base, 1)}L${fmt(x - w * 0.45, 1)} ${fmt(base - h * 0.3, 1)}L${fmt(x - w * 0.8, 1)} ${fmt(base - h * 0.3, 1)}L${fmt(x - w * 0.3, 1)} ${fmt(base - h * 0.62, 1)}L${fmt(x - w * 0.55, 1)} ${fmt(base - h * 0.62, 1)}Z"/>` +
    `</g>`;
}

function deciduous(x, base, r, fill, opacity = 1) {
  return `<g fill="${fill}" fill-opacity="${opacity}">` +
    `<rect x="${fmt(x - r * 0.08, 1)}" y="${fmt(base - r * 0.7, 1)}" width="${fmt(r * 0.16, 1)}" height="${fmt(r * 0.7, 1)}" fill="#54432f"/>` +
    `<circle cx="${fmt(x - r * 0.35, 1)}" cy="${fmt(base - r * 0.95, 1)}" r="${fmt(r * 0.62, 1)}"/>` +
    `<circle cx="${fmt(x + r * 0.3, 1)}" cy="${fmt(base - r * 1.0, 1)}" r="${fmt(r * 0.58, 1)}"/>` +
    `<circle cx="${fmt(x, 1)}" cy="${fmt(base - r * 1.3, 1)}" r="${fmt(r * 0.55, 1)}"/>` +
    `</g>`;
}

function rock(cx, cy, w, h, fill, rnd) {
  const n = 7;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * w * (0.7 + rnd() * 0.4), cy + Math.sin(a) * h * (0.55 + rnd() * 0.45)]);
  }
  return `<path d="M${pts.map((p) => `${fmt(p[0], 1)} ${fmt(p[1], 1)}`).join('L')}Z" fill="${fill}"/>`;
}

function ripple(x, y, w, color, opacity) {
  return `<path d="M${fmt(x, 1)} ${fmt(y, 1)}q${fmt(w * 0.25, 1)} ${fmt(-1.6, 1)} ${fmt(w * 0.5, 1)} 0t${fmt(w * 0.5, 1)} 0" fill="none" stroke="${color}" stroke-width="1.2" stroke-opacity="${opacity}" stroke-linecap="round"/>`;
}

export function renderImpression(site) {
  const rnd = mulberry32((site.trees.seed || 1202) + 41);
  const out = [];
  const W = 1400;
  const H = 760;
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="imp-t imp-d">`);
  out.push(`<title id="imp-t">Concept impression: a lake-edge home at Heron Lake</title>`);
  out.push(`<desc id="imp-d">An original illustration, not a surveyed view. Dawn light across a rocky Canadian Shield lake. Cedar and pine frame a low timber-clad home with a solar roof and a screened porch facing the water; a path leads into the forest. The landscape, home and vegetation are invented for discussion.</desc>`);
  out.push(`<defs>
    <linearGradient id="imp-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9d1d5"/><stop offset="0.55" stop-color="#dce3d6"/><stop offset="1" stop-color="#f3e5cb"/></linearGradient>
    <linearGradient id="imp-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9bbcc0"/><stop offset="0.45" stop-color="#6f9aa3"/><stop offset="1" stop-color="#3f6f7c"/></linearGradient>
    <linearGradient id="imp-shore" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4f6a50"/><stop offset="1" stop-color="#2f4736"/></linearGradient>
    <linearGradient id="imp-cabin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b98a5b"/><stop offset="1" stop-color="#8d623d"/></linearGradient>
    <linearGradient id="imp-glow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe0a3"/><stop offset="1" stop-color="#efb45f"/></linearGradient>
    <linearGradient id="imp-mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6efe0" stop-opacity="0"/><stop offset="0.5" stop-color="#f6efe0" stop-opacity="0.65"/><stop offset="1" stop-color="#f6efe0" stop-opacity="0"/></linearGradient>
  </defs>`);
  // sky and sun
  out.push(`<rect width="${W}" height="${H}" fill="url(#imp-sky)"/>`);
  out.push(`<circle cx="430" cy="235" r="46" fill="#f7d9a4" fill-opacity="0.55"/>`);
  out.push(`<circle cx="430" cy="235" r="22" fill="#f8e6c1" fill-opacity="0.85"/>`);

  // distant ridges
  out.push(`<path d="M0 318L90 292L150 306L230 270L310 300L380 282L460 310L540 290L620 312L710 286L790 308L880 292L960 312L1040 296L1120 314L1210 294L1300 312L1400 300V380H0Z" fill="#a9bdb2" fill-opacity="0.8"/>`);
  out.push(`<path d="M0 340L80 322L160 334L250 312L330 336L420 320L510 340L600 322L690 342L780 326L870 344L960 328L1050 344L1140 330L1230 346L1320 332L1400 342V390H0Z" fill="#7f9a8a" fill-opacity="0.9"/>`);
  out.push(`<rect x="0" y="330" width="${W}" height="120" fill="url(#imp-mist)"/>`);
  // far shore
  out.push(`<path d="M0 372L60 366L140 374L230 362L320 372L420 360L520 370L620 358L720 368L820 360L910 370L1010 358L1110 368L1210 360L1300 368L1400 360V392H0Z" fill="#3d5a49"/>`);
  for (let x = 10; x < W; x += 18 + rnd() * 20) {
    const h = 10 + rnd() * 16;
    out.push(conifer(x, 374 + rnd() * 5, h, '#31503f', 0.8));
  }
  // lake
  out.push(`<rect y="388" width="${W}" height="${H - 388}" fill="url(#imp-water)"/>`);
  // sun reflection
  out.push(`<path d="M360 390L500 390L560 760L300 760Z" fill="#f4dfb7" fill-opacity="0.13"/>`);
  for (let i = 0; i < 28; i++) {
    const y = 400 + rnd() * 330;
    const x = 30 + rnd() * (W - 120);
    const w = 30 + rnd() * 170;
    out.push(ripple(x, y, w, i % 4 === 0 ? '#f4e3c2' : '#c8dde0', 0.18 + rnd() * 0.3));
  }

  // right-hand rocky point
  out.push(`<path d="M760 760L840 560L900 500L980 462L1080 448L1190 456L1300 478L1400 500V760Z" fill="url(#imp-shore)"/>`);
  out.push(`<path d="M780 760L852 578L910 522L990 486L1090 474L1200 482L1400 520V760Z" fill="#3b5742"/>`);
  // rock face at the water
  for (let i = 0; i < 12; i++) {
    out.push(rock(790 + rnd() * 130, 700 + rnd() * 70, 34 + rnd() * 54, 16 + rnd() * 26, i % 2 ? '#6d6a5d' : '#575b50', rnd));
  }
  // beach / path to the water
  out.push(`<path d="M940 760Q980 650 1060 600T1180 560" fill="none" stroke="#b9a37a" stroke-width="10" stroke-opacity="0.55"/>`);
  out.push(`<path d="M946 760Q986 656 1064 606T1184 566" fill="none" stroke="#d4c49b" stroke-width="4" stroke-opacity="0.6" stroke-dasharray="8 5"/>`);

  // forest behind the home: conifers and birch, back to front
  for (let i = 0; i < 36; i++) {
    const x = 820 + rnd() * 580;
    const base = 500 + rnd() * 120;
    const h = 46 + rnd() * 110;
    out.push(conifer(x, base, h, i % 5 === 0 ? '#42664b' : '#2f4e3b', 0.85 + rnd() * 0.15));
  }
  for (let i = 0; i < 14; i++) {
    const x = 860 + rnd() * 500;
    const base = 540 + rnd() * 120;
    const r = 16 + rnd() * 20;
    out.push(deciduous(x, base, r, i % 3 === 0 ? '#9aab6d' : '#7f955f', 0.9));
  }

  // the home: long low volume, solar roof, screened porch facing the lake
  const cx = 1060;
  const base = 552;
  out.push(`<g>`);
  // porch deck and screen frame
  out.push(`<rect x="${cx - 176}" y="${base - 6}" width="204" height="10" fill="#9c7448"/>`);
  out.push(`<rect x="${cx - 168}" y="${base - 92}" width="190" height="88" fill="#2f4035" fill-opacity="0.35"/>`);
  out.push(`<rect x="${cx - 168}" y="${base - 92}" width="190" height="88" fill="none" stroke="#7b5b39" stroke-width="4"/>`);
  for (let i = 0; i <= 5; i++) out.push(`<rect x="${cx - 168 + i * 38}" y="${base - 92}" width="2.4" height="88" fill="#6e5135"/>`);
  out.push(`<rect x="${cx - 168}" y="${base - 92}" width="190" height="20" fill="#3b2f24"/>`);
  // warm interior seen through the screen
  out.push(`<rect x="${cx - 150}" y="${base - 64}" width="62" height="34" fill="url(#imp-glow)" fill-opacity="0.9"/>`);
  out.push(`<rect x="${cx - 74}" y="${base - 64}" width="72" height="34" fill="url(#imp-glow)" fill-opacity="0.72"/>`);
  out.push(`<path d="M${cx - 160} ${base - 26}H${cx + 12}" stroke="#6e5135" stroke-width="2"/>`);

  // main body
  out.push(`<rect x="${cx - 20}" y="${base - 88}" width="300" height="82" fill="url(#imp-cabin)"/>`);
  for (let y = base - 82; y < base; y += 9) out.push(`<path d="M${cx - 18} ${y}H${cx + 278}" stroke="#7b5534" stroke-width="1.2" stroke-opacity="0.55"/>`);
  // glazing
  out.push(`<rect x="${cx + 18}" y="${base - 72}" width="74" height="40" fill="url(#imp-glow)" fill-opacity="0.92"/>`);
  out.push(`<rect x="${cx + 104}" y="${base - 72}" width="46" height="40" fill="#6f8f8a" fill-opacity="0.8"/>`);
  out.push(`<rect x="${cx + 162}" y="${base - 70}" width="66" height="34" fill="#3c4b44"/>`);
  // front door
  out.push(`<rect x="${cx + 238}" y="${base - 64}" width="30" height="58" fill="#5a3f29"/>`);
  out.push(`<circle cx="${cx + 262}" cy="${base - 34}" r="2" fill="#e0c58c"/>`);
  // roof
  out.push(`<path d="M${cx - 32} ${base - 88}L${cx - 6} ${base - 122}L${cx + 304} ${base - 110}L${cx + 288} ${base - 84}Z" fill="#3c4741"/>`);
  out.push(`<path d="M${cx - 32} ${base - 88}L${cx + 288} ${base - 84}" stroke="#26302c" stroke-width="4"/>`);
  // solar panels
  for (let i = 0; i < 5; i++) {
    out.push(`<path d="M${cx + 18 + i * 48} ${base - 112}l30 -3l-6 18l-30 3z" fill="#23364b" stroke="#141f2c" stroke-width="1"/>`);
    out.push(`<path d="M${cx + 24 + i * 48} ${base - 108}l24 0" stroke="#4b6a86" stroke-width="1"/>`);
  }
  // chimney with a thin smoke line
  out.push(`<rect x="${cx + 252}" y="${base - 140}" width="12" height="26" fill="#6a5b4d"/>`);
  out.push(`<path d="M${cx + 258} ${base - 146}c-8 -18 10 -24 2 -42s10 -22 4 -38" fill="none" stroke="#f2eee2" stroke-width="3" stroke-opacity="0.35" stroke-linecap="round"/>`);
  out.push(`</g>`);

  // midground trees at the point edge, overlapping the home a little
  for (let i = 0; i < 14; i++) {
    const t = i / 14;
    const x = 820 + t * 220;
    const y = 570 + t * 150;
    out.push(conifer(x, y, 34 + rnd() * 52, i % 3 === 0 ? '#28452f' : '#34563a', 0.95));
  }
  for (let i = 0; i < 8; i++) {
    const x = 880 + rnd() * 120;
    const y = 690 + rnd() * 50;
    out.push(deciduous(x, y, 10 + rnd() * 14, '#84995c', 0.9));
  }

  // foreground reeds and rocks at the left
  out.push(`<path d="M0 760V610L60 640L120 630L190 680L220 760Z" fill="#33513e"/>`);
  for (let i = 0; i < 34; i++) {
    const x = 10 + rnd() * 240;
    const y = 760;
    const h = 40 + rnd() * 90;
    out.push(`<path d="M${fmt(x, 1)} ${y}q${fmt(-8 + rnd() * 16, 1)} ${fmt(-h * 0.6, 1)} ${fmt(-4 + rnd() * 10, 1)} ${fmt(-h, 1)}" fill="none" stroke="${i % 3 === 0 ? '#8b9b63' : '#6f8455'}" stroke-width="1.6" stroke-opacity="0.85"/>`);
  }
  for (let i = 0; i < 10; i++) out.push(rock(30 + rnd() * 190, 700 + rnd() * 50, 18 + rnd() * 34, 8 + rnd() * 16, i % 2 ? '#5c5e53' : '#717063', rnd));
  // a few birds
  for (let i = 0; i < 6; i++) {
    const x = 620 + rnd() * 400;
    const y = 120 + rnd() * 120;
    out.push(`<path d="M${fmt(x, 1)} ${fmt(y, 1)}q5 -5 10 0M${fmt(x + 10, 1)} ${fmt(y, 1)}q5 -5 10 0" fill="none" stroke="#5b6e6b" stroke-width="1.6" stroke-linecap="round" stroke-opacity="0.65"/>`);
  }
  // foreground water ripples
  for (let i = 0; i < 18; i++) {
    const y = 660 + rnd() * 90;
    out.push(ripple(10 + rnd() * 760, y, 60 + rnd() * 260, '#bcd6d8', 0.16 + rnd() * 0.18));
  }
  // attribution (also keeps the SVG text-labelled)
  out.push(`<text x="18" y="${H - 16}" font-family="system-ui, sans-serif" font-size="13" fill="#f4f0e4" fill-opacity="0.8" stroke="#2f4736" stroke-width="3" paint-order="stroke">Concept impression · Heron Lake · Containers Hamlet · CC BY 4.0</text>`);
  out.push('</svg>');
  return out.join('');
}
