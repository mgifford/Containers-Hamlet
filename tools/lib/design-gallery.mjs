// Static gallery cards for the Design Lab. Code: MIT. Concept text/data: CC BY-SA 4.0.
import { esc } from './svg.mjs';

const n = (v, d = 1) => Number(v).toFixed(d);

function images(id, base = '') {
  return {
    plan: `${base}views/${id}-plan.svg`,
    'plan-ground': `${base}views/${id}-plan-ground.svg`,
    'plan-upper': `${base}views/${id}-plan-upper.svg`,
    exterior: `${base}views/${id}-exterior.svg`,
    cutaway: `${base}views/${id}-cutaway.svg`,
    'elevation-south': `${base}views/${id}-elevation-south.svg`,
    section: `${base}views/${id}-section.svg`,
    exploded: `${base}views/${id}-exploded.svg`,
  };
}

function containerLabel(concept) {
  const types = concept.modules.map((m) => m.type);
  const counts = types.reduce((acc, t) => { acc[t] = (acc[t] || 0) + 1; return acc; }, {});
  return Object.keys(counts).sort().map((t) => `${counts[t]} × ${t}`).join(' + ');
}

function storeyLabel(concept) {
  const levels = concept.levels ? concept.levels.length : 1;
  return levels === 1 ? 'Single storey' : 'Two storeys';
}

function roofLabel(concept) {
  return (concept.roof_form && concept.roof_form.type ? concept.roof_form.type : 'flat').replace(/-/g, ' ');
}

const GROUP_ORDER = ['Single storey', 'Two storeys', 'One container', 'Two containers', 'Three containers', 'Common lodge'];
const GROUP_TEXT = {
  'Single storey': 'Single-storey homes. Two are whole-home accessibility demonstrations; the others are ordinary concept homes.',
  'Two storeys': 'Container homes with an occupied upper level. They add stairs, structure, fire separation and vertical-access questions.',
  'One container': 'Archived one-module concepts. Preserved for provenance and comparison, not removed.',
  'Two containers': 'Archived two-module concepts. Some are editable; others remain inspiration only.',
  'Three containers': 'Archived three-module concepts, including the courtyard studies.',
  'Common lodge': 'The preserved community building. Its single-storey default is unchanged; an optional two-storey lodge is a separate study.'
};

export function galleryCards(concepts, summaryOf, opts = {}) {
  const body = GROUP_ORDER.map((group) => {
    const items = concepts.filter((c) => c.group === group);
    if (!items.length) return '';
    const groupId = (opts.idPrefix || '') + group.toLowerCase().replace(/[^a-z]+/g, '-');
    return `<section class="concept-group" aria-labelledby="${groupId}">
  <h3 id="${groupId}">${esc(group)}</h3>
  <p class="small">${esc(GROUP_TEXT[group] || '')}</p>
  <div class="concept-grid">
${items.map((c, i) => {
      const s = summaryOf(c);
      const imgs = images(c.id, opts.base || '');
      const editable = c.editable === true;
      const hamlet = c.role === 'hamlet-selected';
      const badge = hamlet ? 'Hamlet selected · Editable' : c.role === 'archive-experimental' ? 'Experimental archive · not selected' : editable ? 'Editable archive concept' : 'Inspiration only';
      const badgeClass = hamlet ? 'hamlet' : editable ? 'editable' : '';
      const upper = c.levels && c.levels.length > 1;
      return `    <article class="concept-card" id="concept-${esc(c.id)}">
      <div class="concept-card-media">
        <img src="${imgs.exterior}" width="1040" height="700" alt="Illustrative exterior concept of ${esc(c.name)}: ${esc(c.tagline)}" loading="${i === 0 ? 'eager' : 'lazy'}" decoding="async">
      </div>
      <div class="concept-card-body">
        <span class="concept-badge${badgeClass ? ' ' + badgeClass : ''}">${badge}</span>
        <h4>${esc(c.name)}</h4>
        <p class="tagline">${esc(c.tagline)}</p>
        <p>${esc(c.description)}</p>
        <p class="small"><strong>${esc(storeyLabel(c))}</strong> · ${esc(containerLabel(c))} · ${n(s.grossFloorArea_m2 != null ? s.grossFloorArea_m2 : s.nominalFootprint_m2)} m² gross floor area · ${esc(roofLabel(c))} roof</p>
        <details class="concept-specs"><summary>Dimensions, access and performance</summary>
        <dl class="concept-facts">
          <div><dt>Storeys</dt><dd>${esc(storeyLabel(c))}${upper ? ' · ' + c.modules.filter((m) => m.storey > 0).length + ' upper module' + (c.modules.filter((m) => m.storey > 0).length === 1 ? '' : 's') : ''}</dd></div>
          <div><dt>Containers</dt><dd>${esc(containerLabel(c))}</dd></div>
          <div><dt>Gross floor area</dt><dd>${n(s.grossFloorArea_m2 != null ? s.grossFloorArea_m2 : s.nominalFootprint_m2)} m² nominal modules plus glazed links</dd></div>
          <div><dt>Ground coverage</dt><dd>${n(s.groundCoverage_m2 != null ? s.groundCoverage_m2 : s.nominalFootprint_m2)} m² projected footprint</dd></div>
          <div><dt>Roof</dt><dd>${esc(roofLabel(c))}${c.roof_form ? ' · ' + c.roof_form.pitch_deg + '° pitch · ' + n(c.roof_form.overhang_m, 2) + ' m overhang' : ''}</dd></div>
          <div><dt>Interior uses</dt><dd>${esc((c.features.interior_uses || []).join(', '))}</dd></div>
          <div><dt>Outdoor living</dt><dd>${esc(c.features.outdoor)}</dd></div>
          <div><dt>Accessibility</dt><dd>${esc(c.features.accessibility)}</dd></div>
          <div><dt>Structural review</dt><dd>${esc(ModelReview(c))}</dd></div>
        </dl></details>
        <details>
          <summary>Views and source files for ${esc(c.name)}</summary>
          <div class="concept-view-stack">
            <figure><img src="${imgs['plan-ground']}" width="1040" height="720" alt="Ground-floor concept plan for ${esc(c.name)}: ${esc(containerLabel(c))}, interior zones, openings, porches and decks." loading="lazy" decoding="async"><figcaption>Ground-floor concept plan. Nominal dimensions, not verified clearances.</figcaption></figure>
            ${upper ? `<figure><img src="${imgs['plan-upper']}" width="1040" height="720" alt="Upper-floor concept plan for ${esc(c.name)}, with the ground-floor modules shown as muted outlines." loading="lazy" decoding="async"><figcaption>Upper-floor concept plan with the level below muted.</figcaption></figure>` : ''}
            <figure><img src="${imgs['elevation-south']}" width="1040" height="720" alt="South elevation of ${esc(c.name)} generated from the same module geometry as the plan." loading="lazy" decoding="async"><figcaption>South elevation from the shared geometry. Other elevations and the section are on the architectural page.</figcaption></figure>
            <figure><img src="${imgs.cutaway}" width="1040" height="700" alt="Roof-off cutaway of ${esc(c.name)} showing the interior zones in the same geometry as the plan." loading="lazy" decoding="async"><figcaption>Roof-off cutaway with the same geometry and interior zones.</figcaption></figure>
          </div>
          <ul class="concept-files">
            <li><a href="${opts.base || ''}data/${esc(c.id)}.json" download>Design JSON (${esc(c.schema)})</a></li>
            <li><a href="${imgs.plan}" download>Combined concept plan SVG</a></li>
            <li><a href="${imgs['plan-ground']}" download>Ground-floor plan SVG</a></li>
            ${upper ? `<li><a href="${imgs['plan-upper']}" download>Upper-floor plan SVG</a></li>` : ''}
            <li><a href="${imgs['elevation-south']}" download>South elevation SVG</a></li>
            <li><a href="${imgs.section}" download>Building section SVG</a></li>
            <li><a href="${imgs.exploded}" download>Exploded levels SVG</a></li>
          </ul>
        </details>
        <div class="card-actions">
          <a class="action" href="${opts.base || ''}architecture/${esc(c.id)}/">Architectural gallery: plans, elevations, section</a>
          ${editable
            ? `<a class="action secondary" href="${opts.base || ''}editor/?preset=${esc(c.id)}">Customize ${esc(c.name)}</a>`
            : `<p class="small"><strong>Not editable.</strong> This concept is preserved with source files, generated views and a comparison entry.</p>`}
        </div>
        <p class="small">Concept only. Not reviewed by an architect, engineer, building official or accessibility consultant.</p>
      </div>
    </article>`;
    }).join('\n')}
  </div>
</section>`;
  }).join('\n');
  if (!opts.heading) return body;
  return `<section class="gallery-chapter" aria-labelledby="${esc(opts.headingId || 'gallery-chapter')}">
  <h2 id="${esc(opts.headingId || 'gallery-chapter')}">${esc(opts.heading)}</h2>
  <p>${esc(opts.intro || '')}</p>
  ${body}
</section>`;
}

function ModelReview(c) {
  const stack = c.levels && c.levels.length > 1;
  const support = (c.modules || []).filter((m) => m.storey > 0);
  if (!stack) return 'Single-level concept; openings, roof and foundation still need engineering review.';
  return support.length + ' upper module' + (support.length === 1 ? '' : 's') + ' with a declared, unverified support intent. Stacking, lateral stability and transfer loads require professional review.';
}
