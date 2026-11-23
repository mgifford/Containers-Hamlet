// Hamlet-wide residence comparison. Code: MIT. Generated content: CC BY-SA 4.0.
import { designShellNav } from './design-nav.mjs';
const esc = (v) => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const n = (v) => (Math.round(v * 10) / 10).toString();

function statusCount(profile) {
  return profile.structural_review.concerns.filter((c) => c.status === 'requires-review').length;
}

function row(profile, concept) {
  const a = profile.accessibility_profile;
  const met = profile.metrics;
  const sus = profile.sustainability;
  return `<tr data-home="${esc(profile.id)}" data-storeys="${profile.storeys}" data-arrangement="${esc(profile.architecture.arrangement)}" data-name="${esc(profile.name)}" data-floor="${met.grossFloorArea_m2}" data-cover="${met.groundCoverage_m2}" data-height="${met.buildingHeight_m}" data-review="${statusCount(profile)}">
    <th scope="row"><a href="../architecture/${esc(profile.id)}/">${esc(profile.name)}</a><br><span class="small">${esc(concept.architecture && concept.architecture.family || profile.architecture.arrangement)}</span></th>
    <td>${esc(profile.architecture.arrangement.replace(/-/g, ' '))}<br><span class="small">${esc(profile.architecture.footprint_type.replace(/-/g, ' '))}</span></td>
    <td>${profile.storeys}</td>
    <td>${profile.container_count} × ${esc(profile.types.join(' + '))}</td>
    <td>${n(met.grossFloorArea_m2)}</td>
    <td>${n(met.groundCoverage_m2)}</td>
    <td>${esc(profile.architecture.roof_type.replace(/-/g, ' '))}<br><span class="small">${n(met.buildingHeight_m)} m to roof</span></td>
    <td>${a.ground_floor_essential_functions ? 'Yes' : 'No / not recorded'}</td>
    <td>${esc(a.classification.replace(/-/g, ' '))}<br><span class="small">${a.stair && a.stair.present ? 'Stair; no lift space reserved' : 'No stair'}</span></td>
    <td>${statusCount(profile)} of ${profile.structural_review.concerns.length}<br><span class="small">${esc(profile.structural_review.model_status.replace(/-/g, ' '))}</span></td>
    <td>${esc((sus.qualitative.tradeoffs[0] || 'No specific sustainability trade-off recorded.'))}</td>
    <td>Concept only<br><span class="small">not professionally reviewed</span></td>
  </tr>`;
}

function card(profile, concept) {
  const met = profile.metrics;
  const a = profile.accessibility_profile;
  const review = profile.structural_review;
  const sus = profile.sustainability;
  const concerns = review.concerns.filter((c) => c.status === 'requires-review').slice(0, 4);
  return `<article class="concept-card residence-card">
    <div class="concept-card-body">
      <span class="concept-badge hamlet">Hamlet selected · ${profile.storeys === 1 ? 'Single storey' : 'Two storeys'}</span>
      <h3><a href="../architecture/${esc(profile.id)}/">${esc(profile.name)}</a></h3>
      <p class="tagline">${esc(concept.tagline)}</p>
      <dl class="concept-facts">
        <div><dt>Family</dt><dd>${esc(concept.architecture && concept.architecture.family || profile.architecture.arrangement)}</dd></div>
        <div><dt>Massing</dt><dd>${esc(profile.architecture.arrangement.replace(/-/g, ' '))} · ${esc(profile.architecture.footprint_type.replace(/-/g, ' '))} · ${esc(profile.architecture.roof_type)} roof</dd></div>
        <div><dt>Floor area</dt><dd>${n(met.grossFloorArea_m2)} m² gross · ${n(met.groundCoverage_m2)} m² ground coverage · ${n(met.buildingHeight_m)} m high</dd></div>
        <div><dt>Accessibility</dt><dd>${esc(a.label)}</dd></div>
        <div><dt>Structural review</dt><dd>${review.concerns.filter((c) => c.status === 'requires-review').length} concern${review.concerns.filter((c) => c.status === 'requires-review').length === 1 ? '' : 's'} need review. ${esc(review.summary)}</dd></div>
        <div><dt>Sustainability evidence</dt><dd>${esc(sus.qualitative.strengths[0] || 'No specific strength recorded.')} ${esc(sus.qualitative.tradeoffs[0] || '')}</dd></div>
      </dl>
      ${concerns.length ? `<details><summary>Why this home needs structural review</summary><ul>${concerns.map((c) => `<li><strong>${esc(c.label)}:</strong> ${esc(c.notes)}</li>`).join('')}</ul></details>` : ''}
      <div class="card-actions">
        <a class="action" href="../architecture/${esc(profile.id)}/">Plans, elevations and review</a>
        <a class="action secondary" href="../editor/?preset=${esc(profile.id)}">Open in the editor</a>
      </div>
      <p class="small">Concept only. Not engineered, permit-ready or professionally reviewed.</p>
    </div>
  </article>`;
}

function similarityTable(profiles, similarities) {
  const rows = [];
  for (let i = 0; i < profiles.length; i++) {
    for (let j = i + 1; j < profiles.length; j++) {
      const a = profiles[i], b = profiles[j];
      const match = similarities.find((s) => s.homes.includes(a.id) && s.homes.includes(b.id));
      rows.push({ a, b, score: match ? match.score : null, matching: match ? match.matchingFeatures : [], proportion: match ? match.proportionMatch : false });
    }
  }
  rows.sort((x, y) => (y.score || 0) - (x.score || 0));
  return `<div class="table-wrap" tabindex="0" role="region" aria-label="Architectural similarity table"><table id="similarity-table"><caption>Rule-based architectural similarity. A high score is a prompt to inspect, not a finding that the design is bad.</caption><thead><tr><th scope="col">Home</th><th scope="col">Home</th><th scope="col">Similarity</th><th scope="col">Matching primary features</th><th scope="col">Flag</th></tr></thead><tbody>
    ${rows.map((r) => `<tr${r.score >= 0.8 ? ' class="duplicate-flag"' : ''}><th scope="row">${esc(r.a.name)}</th><td>${esc(r.b.name)}</td><td>${r.score == null ? 'not comparable' : Math.round(r.score * 100) + '%'}</td><td>${esc(r.matching.join(', ') || 'none')}${r.proportion ? ', similar proportions' : ''}</td><td>${r.score >= 0.8 ? '<strong>Near-duplicate primary characteristics; inspect before accepting.</strong>' : 'Below the 0.8 heuristic'}</td></tr>`).join('')}
  </tbody></table></div>`;
}

function altRow(profile, altProfile, concept) {
  if (!altProfile) return '';
  const m = profile.metrics, am = altProfile.metrics;
  const aa = altProfile.accessibility_profile, a = profile.accessibility_profile;
  const deltaCover = am.groundCoverage_m2 - m.groundCoverage_m2;
  const deltaHeight = am.buildingHeight_m - m.buildingHeight_m;
  return `<tr><th scope="row">${esc(profile.name)}</th><td>${profile.storeys} storeys<br>${n(m.grossFloorArea_m2)} m²</td><td>${n(m.groundCoverage_m2)} m²</td><td>${n(m.buildingHeight_m)} m</td><td>${esc(a.classification.replace(/-/g, ' '))}</td><td>${altProfile.storeys} storey<br>${n(am.grossFloorArea_m2)} m²</td><td>${n(am.groundCoverage_m2)} m² <span class="small">(${deltaCover >= 0 ? '+' : ''}${n(deltaCover)} m²)</span></td><td>${n(am.buildingHeight_m)} m <span class="small">(${deltaHeight >= 0 ? '+' : ''}${n(deltaHeight)} m)</span></td><td>${esc(aa.classification.replace(/-/g, ' '))}</td></tr>`;
}

export function residencesPage(profiles, concepts, alternatives, siteReconciliation) {
  const byId = Object.fromEntries(concepts.map((c) => [c.id, c]));
  const similarities = [];
  for (let i = 0; i < profiles.length; i++) {
    for (let j = i + 1; j < profiles.length; j++) {
      const fa = profiles[i].architecture, fb = profiles[j].architecture;
      const keys = ['storeys', 'arrangement', 'footprint_type', 'roof_type', 'entrance_orientation', 'circulation_type'];
      const matching = keys.filter((k) => String(fa[k]) === String(fb[k]));
      const proportion = Math.abs(fa.proportion - fb.proportion) <= 0.35;
      const score = (matching.length + (proportion ? 1 : 0)) / (keys.length + 1);
      similarities.push({ homes: [profiles[i].id, profiles[j].id], score: Math.round(score * 1000) / 1000, matchingFeatures: matching, proportionMatch: proportion });
    }
  }
  const altProfiles = profiles.filter((p) => p.storeys > 1 && alternatives[p.id]).map((p) => alternatives[p.id]);
  const tableRows = profiles.map((p, i) => row(p, byId[p.id] || concepts.find((c) => c.id === p.id))).join('');
  const cards = profiles.map((p) => card(p, byId[p.id] || concepts.find((c) => c.id === p.id))).join('');
  return `<!doctype html>
<html lang="en-CA">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Compare the six Containers Hamlet residences: storeys, massing, floor area, ground coverage, roof, accessibility, structural review concerns and sustainability assumptions. Sort and filter the accessible table.">
  <title>Compare the six hamlet residences · Containers Hamlet Design Lab</title>
  <link rel="stylesheet" href="../../../style.css">
  <link rel="stylesheet" href="../style.css">
  <link rel="stylesheet" href="../compare.css">
  <link rel="stylesheet" href="residences.css">
</head>
<body class="lab-page">
<a class="skip" href="#main">Skip to content</a>
${designShellNav(2, 'residences')}
<main id="main" class="lab-main">
  <p class="eyebrow">Hamlet-wide comparison</p>
  <h1>Six homes, one construction language</h1>
  <p class="lede">The six residences are all single-storey and deliberately different in massing, footprint, roof, entrance, circulation and relationship to the garden. They share construction principles: reused containers, a drained and ventilated exterior assembly, independent foundations, and a design review before construction. Architectural diversity is not achieved by changing paint colours.</p>
  <p class="notice"><strong>Concept only.</strong> Nothing on this page is engineered, permit-ready, costed or professionally reviewed. Areas are nominal geometry. Sustainability evidence is qualitative and identifies missing inputs rather than inventing carbon, energy or cost results.</p>

  <form class="compare-controls" id="residence-controls" aria-label="Sort and filter the residence table">
    <label>Sort by
      <select id="sort-residences">
        <option value="name">Home name</option>
        <option value="storeys">Storey count</option>
        <option value="floor">Gross floor area</option>
        <option value="cover">Ground coverage</option>
        <option value="height">Building height</option>
        <option value="review">Structural review concerns</option>
      </select>
    </label>
    <label>Storeys
      <select id="filter-storeys">
        <option value="all">All homes</option>
        <option value="1">Single storey</option>
      </select>
    </label>
    <label>Arrangement
      <select id="filter-arrangement">
        <option value="all">All arrangements</option>
        <option value="single">Single module</option>
        <option value="parallel-pair">Parallel pair</option>
        <option value="l-shape">L-shape</option>
        <option value="offset-pair">Offset pair</option>
        <option value="t-wing">T-wing</option>
      </select>
    </label>
    <button type="button" id="apply-residences">Apply</button>
    <button type="button" id="reset-residences" class="secondary">Reset</button>
  </form>
  <p class="status" id="residence-status" role="status" aria-live="polite">Showing all six residences. Sort and filter controls update the table without hiding the accessible table view.</p>
  <noscript><p class="notice">JavaScript is off. The complete table and all six cards are shown in source order; sorting and filtering need JavaScript.</p></noscript>

  <section aria-labelledby="table-title">
    <h2 id="table-title">All six residences</h2>
    <p id="residence-table-desc" class="small">Gross floor area counts nominal module areas plus glazed links. Ground coverage is the projected union of the modules and glazed links. Height is measured to the roof. No cost, carbon or energy figure is included.</p>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Six residences comparison table"><table id="residence-table" aria-describedby="residence-table-desc">
      <caption>Six hamlet-selected residences</caption>
      <thead><tr><th scope="col">Home</th><th scope="col">Massing</th><th scope="col">Storeys</th><th scope="col">Modules</th><th scope="col">Gross m²</th><th scope="col">Ground m²</th><th scope="col">Roof / height</th><th scope="col">Ground-floor living</th><th scope="col">Accessibility</th><th scope="col">Structural review</th><th scope="col">Sustainability assumption</th><th scope="col">Maturity</th></tr></thead>
      <tbody>${tableRows}</tbody>
    </table></div>
  </section>

  <section aria-labelledby="alternatives-title">
    <h2 id="alternatives-title">Historical stacked alternatives</h2>
    <p>All six selected homes are single-storey. The three historical two-storey studies are retained in the <a href="../index.html#experimental-archive">Experimental archive</a>: they are not selected homes and are not compared as current designs. The table below would show a geometry-only single-storey translation for any two-storey selected home; it is empty in this milestone by design.</p>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Stacked and single-storey alternatives table"><table id="alternatives-table"><caption>Two-storey designs and a geometry-only single-storey translation with approximately the same gross floor area.</caption><thead><tr><th scope="col">Home</th><th scope="col">Stacked</th><th scope="col">Stacked ground cover</th><th scope="col">Stacked height</th><th scope="col">Stacked access</th><th scope="col">Single-storey translation</th><th scope="col">Translation ground cover</th><th scope="col">Translation height</th><th scope="col">Translation access</th></tr></thead><tbody>
      ${profiles.filter((p) => p.storeys > 1).map((p) => altRow(p, alternatives[p.id], byId[p.id] || concepts.find((c) => c.id === p.id))).join('')}
    </tbody></table></div>
    <p class="small">A single-storey translation usually increases ground coverage and roof area while removing stairs and upper-floor access barriers. It can also increase foundation and site disturbance. The model does not calculate which is better; it exposes the trade.</p>
  </section>

  <section aria-labelledby="site-reconciliation-title" id="site-reconciliation">
    <h2 id="site-reconciliation-title">Site and residence reconciliation</h2>
    <p>The site plan keeps its fictional parcel, clearing and path geometry. The selected Design Lab models have been compared with the older simplified site buildings so differences are visible rather than silently overwritten. A negative clearance margin or an entrance/path mismatch is an unresolved site-placement conflict.</p>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Design Lab and site geometry reconciliation table"><table id="site-reconciliation-table"><caption>Selected residence geometry compared with the recorded site building. Footprint and height are derived from the Design Lab model; the site footprint is the older site model.</caption><thead><tr><th scope="col">Site</th><th scope="col">Selected design</th><th scope="col">Design footprint</th><th scope="col">Site footprint</th><th scope="col">Difference</th><th scope="col">Height</th><th scope="col">Entrance / path</th><th scope="col">Clearing margin</th><th scope="col">Conflict</th></tr></thead><tbody>
      ${(siteReconciliation || []).map((r) => `<tr><th scope="row">${esc(r.site_name)}</th><td>${esc(r.design_name)}</td><td>${n(r.design_footprint_m2)} m²</td><td>${r.site_footprint_m2 == null ? '—' : n(r.site_footprint_m2) + ' m²'}</td><td>${r.difference_pct == null ? '—' : (r.difference_pct > 0 ? '+' : '') + n(r.difference_pct) + '%'}</td><td>${n(r.design_height_m)} m</td><td>${esc(r.entrance)} / ${esc(r.path_approach || 'not recorded')}</td><td>${n(r.clearance_margin_m)} m</td><td>${r.conflicts && r.conflicts.length ? r.conflicts.map(esc).join('; ') : 'No recorded conflict'}</td></tr>`).join('')}
    </tbody></table></div>
    <p class="small">The reconciliation is a design check, not a survey, setback assessment, geotechnical review or permission. See <a href="https://github.com/mgifford/Containers-Hamlet/blob/main/docs/phase-3-site-reconciliation.md">the site reconciliation note</a> for the method and unresolved conflicts.</p>
  </section>

  <section aria-labelledby="diversity-title">
    <h2 id="diversity-title">Architectural diversity assessment</h2>
    <p>Similarity is a rule-based heuristic over primary architectural characteristics: storey count, arrangement, footprint type, roof type, entrance orientation, circulation type and approximate proportions. Colour, cladding and planting are excluded. A score of 0.8 or more is flagged for inspection. The threshold is not an architectural standard, and repetition can be the right choice for accessibility, affordability, construction or maintenance.</p>
    ${similarityTable(profiles, similarities)}
    ${similarities.some((s) => s.score >= 0.8) ? '<p class="notice">At least one pair is above the heuristic threshold. Inspect the pair rather than assuming the homes are duplicate designs.</p>' : '<p class="small">No pair is above the 0.8 heuristic threshold in this set. This does not prove the designs are good, only that their primary characteristics differ.</p>'}
  </section>

  <section aria-labelledby="homes-title">
    <h2 id="homes-title">The six homes in detail</h2>
    ${cards}
  </section>

  <section aria-labelledby="boundary-title">
    <h2 id="boundary-title">What this comparison does not do</h2>
    <ul>
      <li>It does not calculate structural capacity, connection design, foundation reactions or lateral stability.</li>
      <li>It does not calculate energy use, carbon, cost, daylight, overheating, privacy or acoustic performance.</li>
      <li>It does not claim that container construction is better than a conventional timber-frame comparator.</li>
      <li>It does not treat a support reference as a verified load path.</li>
      <li>It does not claim code compliance or a professional accessibility assessment.</li>
    </ul>
    <p class="small">The project preserves the fictional 15-acre Canadian Shield setting, six residential sites and the common lodge. Site assignments are illustrative and are not a planning application.</p>
  </section>
</main>
<footer class="site-footer"><p><a href="../../../index.html">Containers Hamlet</a> · <a href="../index.html">Design Lab</a> · <a href="../LICENSE.txt">AGPL-3.0-or-later</a> · <a href="../CONTENT-LICENSE.md">CC BY-SA 4.0 content</a></p></footer>
<script src="residences.js"></script>
</body>
</html>`;
}
