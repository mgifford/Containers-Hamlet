// Code: MIT. Page content: CC BY 4.0.
import { factsList, roomsTable } from './html.mjs';
const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function nav(prefix, current) {
  return `<header class="site-header">
  <a class="brand" href="${prefix}index.html">Containers Hamlet</a>
  <nav aria-label="Main">
    <a href="${prefix}community/">Community</a>
    <a href="${prefix}hamlet/">Map</a>
    <a href="${prefix}homes/">Homes</a>
    <a href="${prefix}design-lab/">Design Lab</a>
    <a href="${prefix}living/">Living Here</a>
    <a href="${prefix}participate/">Participate</a>
  </nav>
</header>`;
}
function figure(src, w, h, alt, cap, id, eager) {
  return `<figure class="model-page-figure" id="${id}"><img src="${src}" width="${w}" height="${h}" alt="${esc(alt)}"${eager ? '' : ' loading="lazy"'} decoding="async"><figcaption>${esc(cap)}</figcaption></figure>`;
}
export function modelPage(model, sizes, kind) {
  const isLodge = kind === 'lodge';
  const id = isLodge ? 'lodge' : 'cabin-a';
  const title = isLodge ? 'The common lodge' : 'Cabin A · The Retreat';
  const prefix = '../';
  const s = sizes;
  return `<!doctype html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${esc(title)} at Containers Hamlet: floor plan, elevations, envelope section, rooms and downloads.">
<title>${esc(title)} · Containers Hamlet</title>
<link rel="stylesheet" href="../style.css">
<link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${nav(prefix, isLodge ? 'lodge' : 'cabin')}
<main id="main" class="lab-main" tabindex="-1">
  <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../index.html">Containers Hamlet</a> / <a href="./">${esc(title)}</a></nav>
  <p class="eyebrow">Concept drawings and rooms</p>
  <h1>${esc(title)}</h1>
  <p class="lede">${isLodge ? 'Two reused containers and a glazed timber hall under one roof, with a shared kitchen, gathering hall, workshop and universal washroom.' : 'One 40-foot high-cube container, continuous external insulation, a screened porch and a graded trail approach.'} Concept only; not construction drawings.</p>
  <p class="notice"><strong>Not engineered.</strong> Dimensions, openings, structure, fire separation, accessibility and energy performance require professional review. See the <a href="../index.html#inside">Look inside explorer</a> for the room model.</p>
  <div class="model-page-grid">
    <section aria-labelledby="facts-title">
      <h2 id="facts-title">Facts and intent</h2>
      ${factsList(model)}
    </section>
    <section id="rooms" aria-labelledby="rooms-title">
      <h2 id="rooms-title">Rooms</h2>
      ${roomsTable(model, title + ' rooms, clear dimensions inside the lining')}
    </section>
  </div>

  <section aria-labelledby="drawings-title">
    <h2 id="drawings-title">Drawings</h2>
    ${figure('../models/' + id + '/floor-plan.svg', s['floor-plan.svg'].width, s['floor-plan.svg'].height, title + ' floor plan, north up, with rooms, doors, windows, porch and trail approach.', 'Floor plan cut 1.2 m above the floor. Dimensions and openings need professional review.', 'plan', true)}
    ${figure('../models/' + id + '/elevations.svg', s['elevations.svg'].width, s['elevations.svg'].height, title + ' south, north, east and west elevations with solar panels, porch and trail approach.', 'Four elevations at the same scale as the plan. Not engineered.', 'elevations')}
    ${figure('../models/' + id + '/section.svg', s['section.svg'].width, s['section.svg'].height, title + ' cross-section with the to-scale wall build-up.', 'Section and wall build-up. Not a specified assembly; not for construction.', 'section')}
    ${figure('../models/' + id + '/axonometric.svg', s['axonometric.svg'].width, s['axonometric.svg'].height, title + ' exterior axonometric.', 'Exterior concept. Not engineered.', 'axonometric')}
  </section>

  <section aria-labelledby="next-title">
    <h2 id="next-title">Continue</h2>
    <p><a href="../index.html#inside">Look inside ${isLodge ? 'the lodge' : 'Cabin A'}</a> · <a href="../hamlet/">Hamlet map</a> · <a href="../homes/">All homes</a> · <a href="../design-lab/">Design Lab</a></p>
    <p class="small">The underlying data and downloads remain available from the <a href="../index.html#downloads">downloads section</a>.</p>
  </section>
</main>
<footer class="site-footer"><p><a href="../index.html">Containers Hamlet</a> · <a href="../homes/">Homes</a> · <a href="../index.html#downloads">Downloads</a> · CC BY 4.0 content · MIT software</p></footer>
</body>
</html>`;
}
