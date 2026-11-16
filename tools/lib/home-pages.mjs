// Code: MIT. Page content: CC BY 4.0.
const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const useLabel = (use) => ({ permanent: 'Permanent home', seasonal: 'Seasonal home', 'community rental': 'Community rental home', shared: 'Shared community building' }[use] || use);
const targetName = (target) => !target ? 'the forest' : target.type === 'lake' ? 'Heron Lake' : target.type === 'wetland' ? 'the beaver meadow' : (target.id || 'the forest').replace(/-/g, ' ');
const approx = (v, d = 0) => '~' + (d === 0 ? Math.round(v) : Number(v).toFixed(d));
const heading = (id, label) => `<h2 id="${id}">${esc(label)} <a class="heading-link" href="#${id}" aria-label="Link to ${esc(label)}">#</a></h2>`;

function nav(prefix, current) {
  return `<header class="site-header">
  <a class="brand" href="${prefix}index.html">Containers Hamlet</a>
  <nav aria-label="Main">
    <a href="${prefix}index.html#day">The day</a>
    <a href="${prefix}index.html#explore">Hamlet map</a>
    <a href="${prefix}homes/"${current === 'homes' ? ' aria-current="page"' : ''}>Homes</a>
    <a href="${prefix}index.html#cabin">Cabin A</a>
    <a href="${prefix}index.html#lodge">Lodge</a>
    <a href="${prefix}design-lab/">Design Lab</a>
  </nav>
</header>`;
}

function footer(prefix) {
  return `<footer class="site-footer"><p><a href="${prefix}index.html">Containers Hamlet</a> · <a href="${prefix}homes/">Homes</a> · <a href="${prefix}index.html#downloads">Downloads</a> · CC BY 4.0 content · MIT software</p></footer>`;
}

export function homesIndexPage(homes) {
  const cards = homes.map((h) => {
    const a = h.analysis;
    return `<article class="home-index-card" id="home-${esc(h.id)}">
      <p class="eyebrow">${esc(useLabel(h.use))}</p>
      <h2><a href="${esc(h.id)}/">${esc(h.name)} <span>· ${esc(h.short_name || '')}</span></a></h2>
      <p>${esc(h.character || '')}</p>
      <dl>
        <div><dt>Main view</dt><dd>${esc(h.views && h.views.main ? h.views.main.description : '')}</dd></div>
        <div><dt>Orientation</dt><dd>${esc(h.orientation && h.orientation.reason ? h.orientation.reason : '')}</dd></div>
        <div><dt>Approximate</dt><dd>${approx(a.clear_floor_area_m2, 0)} m² clear · ${approx(a.footprint_m2, 0)} m² footprint</dd></div>
      </dl>
      <p class="home-index-links"><a href="${esc(h.id)}/">Open ${esc(h.name)} page</a> <a href="${esc(h.id)}/#main-view">Main view</a> <a href="${esc(h.id)}/#siting">Siting</a></p>
    </article>`;
  }).join('\n');
  return `<!doctype html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Six individual cabins and the common lodge at Containers Hamlet, each with its own shareable page and anchor links.">
<title>Homes · Containers Hamlet</title>
<link rel="stylesheet" href="../style.css">
<link rel="stylesheet" href="homes.css">
<link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${nav('../', 'homes')}
<main id="main" tabindex="-1">
  <p class="eyebrow">The homes</p>
  <h1>Six cabins, one lodge, seven shareable pages</h1>
  <p class="lede">The map is a shared overview. Each home has its own page for the orientation, main view, path, winter notes and siting checks, with anchors so a particular section can be shared directly.</p>
  <p class="notice"><strong>Fictional concepts.</strong> Placements, views and checks are illustrative. No land rights, building permission or privacy guarantee is implied.</p>
  <div class="home-index-grid">${cards}</div>
  <p><a class="action" href="../index.html#explore">Open the hamlet map</a> <a class="action secondary" href="../design-lab/">Design Lab</a></p>
</main>
${footer('../')}
</body>
</html>`;
}

export function homePage(h, site) {
  const a = h.analysis;
  const v = h.views || {};
  const main = v.main || {};
  const mainTarget = targetName(main.target);
  const checks = (a.checks || []).map((c) => `<li class="${c.ok ? 'ok' : 'fail'}">${esc(c.label)}</li>`).join('\n');
  const neighbours = (a.views && a.views.neighbours_in_view && a.views.neighbours_in_view.length)
    ? a.views.neighbours_in_view.map((n) => `${esc(n.name)} at ${approx(n.distance_m, 0)} m`).join('; ')
    : 'No other building inside the principal view cone.';
  const isLodge = h.id === 'lodge';
  const concept = isLodge ? 'lodge' : 'cabin';
  const conceptLabel = isLodge ? 'Lodge concept drawings' : 'Cabin A concept drawings';
  return `<!doctype html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${esc(h.name)} ${esc(h.short_name || '')} at Containers Hamlet: orientation, main view, path, winter notes and siting checks.">
<title>${esc(h.name)} · ${esc(h.short_name || '')} · Containers Hamlet</title>
<link rel="stylesheet" href="../../style.css">
<link rel="stylesheet" href="../homes.css">
<link rel="icon" href="../../assets/favicon.svg" type="image/svg+xml">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${nav('../../', 'home')}
<main id="main" class="home-page" tabindex="-1">
  <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Containers Hamlet</a> / <a href="../">Homes</a> / ${esc(h.name)}</nav>
  <p class="eyebrow">${esc(useLabel(h.use))} · ${esc(h.model === 'lodge' ? 'common lodge concept' : 'Cabin A concept')}</p>
  <h1>${esc(h.name)} <span class="home-name">· ${esc(h.short_name || '')}</span></h1>
  <p class="lede">${esc(h.character || '')}</p>
  <p class="home-share">Share this home: <code>homes/${esc(h.id)}/</code> · <a href="#orientation">orientation</a> · <a href="#main-view">main view</a> · <a href="#siting">siting</a></p>
  <nav class="on-page" aria-label="On this page">
    <a href="#orientation">Orientation</a>
    <a href="#main-view">Main view</a>
    <a href="#nearby">Nearby homes</a>
    <a href="#path">Path and entry</a>
    <a href="#winter">Winter</a>
    <a href="#siting">Siting</a>
    <a href="#design-note">Design note</a>
  </nav>

  <div class="home-detail-grid">
    <figure class="view-diagram">
      <img src="../../assets/views/${esc(h.id)}.svg" width="280" height="280" alt="${esc(h.name)} view diagram: the principal porch faces ${Math.round(a.principal_azimuth_deg)} degrees toward ${esc(mainTarget)}, ${Math.round(a.views.main_distance_m)} metres away. North is up; the shaded wedge is illustrative." loading="lazy" decoding="async">
      <figcaption>View diagram for ${esc(h.name)}. North is up; the wedge is illustrative, not a sightline or privacy assessment.</figcaption>
    </figure>
    <dl class="facts">
      <div><dt>Use</dt><dd>${esc(useLabel(h.use))}</dd></div>
      <div><dt>Approximate size</dt><dd>${approx(a.clear_floor_area_m2, 0)} m² clear floor area · ${approx(a.footprint_m2, 0)} m² footprint</dd></div>
      <div><dt>Principal facade</dt><dd>${esc(a.principal_facade)} · ${approx(a.principal_azimuth_deg, 0)}°</dd></div>
      <div><dt>Placed</dt><dd>${esc(h.x_m)} m east, ${esc(h.y_m)} m south of the fictional map origin</dd></div>
      <div><dt>Shoreline</dt><dd>${approx(a.shoreline_m, 0)} m</dd></div>
      <div><dt>Wetland</dt><dd>${approx(a.wetland_m, 0)} m</dd></div>
    </dl>
  </div>

  <section aria-labelledby="orientation">
    ${heading('orientation', 'Orientation')}
    <p>${esc(h.orientation && h.orientation.reason ? h.orientation.reason : '')}</p>
  </section>

  <section aria-labelledby="main-view">
    ${heading('main-view', 'Main view')}
    <p>${esc(main.description || '')} Bearing ${approx(a.views.main_bearing_deg, 0)}°, ${approx(a.views.main_distance_m, 0)} m to ${esc(mainTarget)}. ${esc(a.views.canopy_description || '')}.</p>
    <p class="small">Through ${esc(main.through || 'mixed woodland')}.</p>
  </section>

  <section aria-labelledby="nearby">
    ${heading('nearby', 'Nearby homes')}
    <p>${esc(v.nearby || '')} In the view cone: ${neighbours}.</p>
  </section>

  <section aria-labelledby="path">
    ${heading('path', 'Path and entry')}
    <p>${esc(v.path || '')}</p>
  </section>

  <section aria-labelledby="winter">
    ${heading('winter', 'Winter')}
    <p>${esc(v.winter || '')}</p>
  </section>

  <section aria-labelledby="siting">
    ${heading('siting', 'Siting')}
    <p>${a.ok ? 'All illustrative checks pass.' : 'One or more illustrative checks fail.'} These are project assumptions, not legal setbacks or a permit.</p>
    <ul class="check-list">${checks}</ul>
  </section>

  <section aria-labelledby="design-note">
    ${heading('design-note', 'Design note')}
    <p>${esc(h.design_note || '')}</p>
  </section>

  <section aria-labelledby="drawings">
    ${heading('drawings', 'Drawings and next steps')}
    <p><a href="../../index.html#${concept}">${esc(conceptLabel)}</a> · <a href="../../index.html#explore">Show ${esc(h.name)} on the hamlet map</a> · <a href="../../design-lab/">Design Lab</a></p>
    <p class="small">This page is a brief, not a construction drawing. No photograph, stock image or proprietary design is reproduced.</p>
  </section>
</main>
${footer('../../')}
</body>
</html>`;
}

export function homeCards(homes) {
  return `<div class="home-index-grid">${homes.map((h) => {
    const a = h.analysis;
    return `<article class="home-index-card" id="home-${esc(h.id)}">
      <a class="home-card-image" href="homes/${esc(h.id)}/"><img src="assets/views/${esc(h.id)}.svg" width="280" height="280" alt="${esc(h.name)} view diagram" loading="lazy" decoding="async"></a>
      <div class="home-card-body">
        <p class="eyebrow">${esc(useLabel(h.use))}</p>
        <h3><a href="homes/${esc(h.id)}/">${esc(h.name)} <span>· ${esc(h.short_name || '')}</span></a></h3>
        <p>${esc(h.character || '')}</p>
        <p class="small">${approx(a.clear_floor_area_m2, 0)} m² clear · ${approx(a.footprint_m2, 0)} m² footprint</p>
        <p class="home-card-links"><a href="homes/${esc(h.id)}/">Open page</a> <a href="homes/${esc(h.id)}/#main-view">Main view</a> <a href="homes/${esc(h.id)}/#siting">Siting</a></p>
      </div>
    </article>`;
  }).join('\n')}</div>`;
}
