// Static gallery cards for the Design Lab. Code: MIT. Concept text/data: CC BY-SA 4.0.
import { esc } from './svg.mjs';

const n = (v, d = 1) => Number(v).toFixed(d);

function images(id) {
  return {
    plan: `views/${id}-plan.svg`,
    exterior: `views/${id}-exterior.svg`,
    cutaway: `views/${id}-cutaway.svg`,
  };
}

function containerLabel(concept) {
  const types = concept.modules.map((m) => m.type);
  const counts = types.reduce((acc, t) => { acc[t] = (acc[t] || 0) + 1; return acc; }, {});
  return Object.keys(counts).sort().map((t) => `${counts[t]} × ${t}`).join(' + ');
}

export function galleryCards(concepts, summaryOf) {
  const groups = ['One container', 'Two containers', 'Three containers', 'Common lodge'];
  return groups.map((group) => {
    const items = concepts.filter((c) => c.group === group);
    if (!items.length) return '';
    const groupId = group.toLowerCase().replace(/[^a-z]+/g, '-');
    return `<section class="concept-group" aria-labelledby="${groupId}">
  <h3 id="${groupId}">${esc(group)}</h3>
  <p class="small">${group === 'One container' ? 'A single reused module, with the porch and deck doing much of the work.' : group === 'Two containers' ? 'Two modules can form a wider home, an L, or a courtyard without becoming a suburban footprint.' : group === 'Three containers' ? 'Three modules support a larger household or a shared retreat, always around a compact outdoor room.' : 'A café-inspired community building: three reused containers around a generous, accessible shared hall.'}</p>
  <div class="concept-grid">
${items.map((c) => {
      const s = summaryOf(c);
      const imgs = images(c.id);
      const editable = c.editable === true;
      return `    <article class="concept-card" id="concept-${esc(c.id)}">
      <div class="concept-card-media">
        <img src="${imgs.exterior}" width="1040" height="700" alt="Illustrative exterior concept of ${esc(c.name)}: ${esc(c.tagline)}" loading="eager" decoding="async">
      </div>
      <div class="concept-card-body">
        <span class="concept-badge${editable ? ' editable' : ''}">${editable ? 'Editable' : 'Inspiration only'}</span>
        <h4>${esc(c.name)}</h4>
        <p class="tagline">${esc(c.tagline)}</p>
        <p>${esc(c.description)}</p>
        <p class="small"><strong>${esc(containerLabel(c))}</strong> · ${n(s.nominalFootprint_m2)} m² nominal footprint</p>
        <details class="concept-specs"><summary>Dimensions, access and performance</summary>
        <dl class="concept-facts">
          <div><dt>Containers</dt><dd>${esc(containerLabel(c))}</dd></div>
          <div><dt>Container footprint</dt><dd>${n(s.nominalFootprint_m2)} m² nominal, before external insulation</dd></div>
          <div><dt>Interior uses</dt><dd>${esc((c.features.interior_uses || []).join(', '))}</dd></div>
          <div><dt>Outdoor living</dt><dd>${esc(c.features.outdoor)}</dd></div>
          ${c.trellises && c.trellises.length ? `<div><dt>Trellis</dt><dd>${esc(c.trellises.map((t) => t.face + ' face, ' + n(t.length_m) + ' m long').join('; '))}</dd></div>` : ''}
          <div><dt>Solar / roof</dt><dd>${esc(c.features.solar)}${c.features.green_roof ? ' ' + esc(c.features.green_roof) : ''}</dd></div>
          ${c.solar_array ? `<div><dt>Solar tilt</dt><dd>South roof slope: ${c.solar_array.tilt_deg}° / ${c.solar_array.azimuth_deg}° ${c.solar_array.season_mode}; no north array</dd></div>` : c.modules.some((m) => m.solar && m.solar.enabled) ? `<div><dt>Solar tilt</dt><dd>${c.modules.filter((m) => m.solar && m.solar.enabled).map((m) => `${m.id}: ${m.solar.tilt_deg}° / ${m.solar.azimuth_deg}° ${m.solar.season_mode}`).join('; ')}</dd></div>` : ''}
          <div><dt>Accessibility</dt><dd>${esc(c.features.accessibility)}</dd></div>
          <div><dt>Environmental</dt><dd>${esc(c.features.environment)}</dd></div>
        </dl></details>
        <details>
          <summary>Views and source files for ${esc(c.name)}</summary>
          <div class="concept-view-stack">
            <figure><img src="${imgs.plan}" width="1040" height="720" alt="Dimensioned concept plan for ${esc(c.name)}: ${esc(containerLabel(c))}, interior zones, openings, porches and decks." loading="lazy" decoding="async"><figcaption>Dimensioned concept plan. Nominal dimensions, not verified clearances.</figcaption></figure>
            <figure><img src="${imgs.cutaway}" width="1040" height="700" alt="Roof-off cutaway of ${esc(c.name)} showing the interior zones in the same geometry as the plan." loading="lazy" decoding="async"><figcaption>Roof-off cutaway with the same geometry and interior zones.</figcaption></figure>
          </div>
          <ul class="concept-files">
            <li><a href="data/${esc(c.id)}.json" download>Design JSON (${esc(c.schema)})</a></li>
            <li><a href="${imgs.plan}" download>Concept plan SVG</a></li>
            <li><a href="${imgs.exterior}" download>Exterior concept SVG</a></li>
            <li><a href="${imgs.cutaway}" download>Roof-off cutaway SVG</a></li>
          </ul>
        </details>
        <div class="card-actions">
          <a class="action" href="architecture/${esc(c.id)}/">Five-view architectural gallery</a>
          ${editable
            ? `<a class="action secondary" href="editor/?preset=${esc(c.id)}">Customize ${esc(c.name)}</a>`
            : `<p class="small"><strong>Not yet editable.</strong> This concept has source files, five generated views and a comparison entry. Start from one of the three editable presets in the <a href="editor/">Design Lab editor</a>.</p>`}
        </div>
        <p class="small">Concept only. Not reviewed by an architect, engineer or building official.</p>
      </div>
    </article>`;
    }).join('\n')}
  </div>
</section>`;
  }).join('\n');
}
