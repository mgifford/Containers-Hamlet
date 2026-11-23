// Public illustration-pipeline page. Code: MIT. Generated content: CC BY-SA 4.0.
import { designShellNav } from './design-nav.mjs';
const esc = (v) => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const n = (v) => (Math.round(v * 10) / 10).toString();

export function illustrationPage(entries, lab) {
  const cards = entries.map(({ concept, scene }) => {
    const unresolved = scene.unresolved.length;
    return `<article class="concept-card illustration-card" id="illustration-${esc(concept.id)}">
      <div class="concept-card-media"><img src="../views/${esc(concept.id)}-site-facing.svg" width="1040" height="700" alt="Deterministic site-facing reference view of ${esc(concept.name)}. It is a concept reference, not a photograph or construction drawing." loading="lazy" decoding="async"></div>
      <div class="concept-card-body">
        <span class="concept-badge hamlet">Illustration package</span>
        <h2>${esc(concept.name)}</h2>
        <p class="small"><strong>${scene.building.storeys} storey${scene.building.storeys === 1 ? '' : 's'}</strong> · ${scene.building.moduleCount} module${scene.building.moduleCount === 1 ? '' : 's'} · ${esc(scene.building.roofType)} roof · ${esc(scene.environment.siteName)}</p>
        <p>${esc(concept.tagline)}</p>
        <details><summary>Generated prompt for ${esc(concept.name)}</summary><pre class="prompt-preview">${esc(scene.prompt.text)}</pre></details>
        <details><summary>Negative prompt and unresolved matters</summary><pre class="prompt-preview">${esc(scene.negativePrompt.text)}</pre>${unresolved ? `<ul>${scene.unresolved.map((u) => `<li><strong>${esc(u.code)}:</strong> ${esc(u.message)}</li>`).join('')}</ul>` : '<p class="small">No unresolved matters recorded by the checks.</p>'}</details>
        <p class="small"><strong>${unresolved}</strong> unresolved/limitation note${unresolved === 1 ? '' : 's'} · design hash <code>${esc(scene.designHash)}</code></p>
        <div class="button-row">
          <a class="action" href="${esc(concept.id)}/prompt.md" download>Download prompt</a>
          <a class="action secondary" href="${esc(concept.id)}/interior.md" download>Interior prompt</a>
          <a class="action secondary" href="${esc(concept.id)}/scene.json" download>Scene JSON</a>
          <a class="action secondary" href="${esc(concept.id)}/description.md" download>Description</a>
          <a class="action secondary" href="${esc(concept.id)}/manifest.json" download>Manifest</a>
          <a class="action secondary" href="../architecture/${esc(concept.id)}/">Architectural gallery</a>
        </div>
      </div>
    </article>`;
  }).join('\n');
  return `<!doctype html>
<html lang="en-CA">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Reproducible architectural illustration pipeline for Containers Hamlet: deterministic schematics and reference views, generated prompts, scene specifications and illustration packages.">
  <title>Illustration pipeline · Containers Hamlet Design Lab</title>
  <link rel="stylesheet" href="../../../style.css">
  <link rel="stylesheet" href="../style.css">
  <link rel="stylesheet" href="illustration.css">
</head>
<body class="lab-page">
<a class="skip" href="#main">Skip to content</a>
${designShellNav(2, 'illustrate')}
<main id="main" class="lab-main">
  <p class="eyebrow">Design Lab · illustration pipeline</p>
  <h1>Design once. Explore it in different ways.</h1>
  <p class="lede">The House Studio uses one architectural model to produce container schematics, floor plans, elevations, sections and illustration references. You can also generate prompts for architectural illustrations that help explain what living in the proposed home might feel like. The drawings describe the modeled design. Illustrations are interpretations and may not reproduce every architectural detail accurately. Changing the design updates the drawings and identifies illustrations that need to be regenerated.</p>
  <p class="notice"><strong>No AI image was generated for this page.</strong> This is the deterministic reference and prompt pipeline. Generated images are an external, optional workflow. They are never treated as architectural drawings or as evidence of code, structural or accessibility compliance.</p>
  <div class="button-row"><a class="action" href="../editor/">Open the editor and generate a package</a><a class="action secondary" href="../guides/">Design Lab guides</a><a class="action secondary" href="../../index.html">Containers Hamlet</a></div>

  <section aria-labelledby="what-title">
    <h2 id="what-title">What is deterministic and what is generative</h2>
    <div class="table-wrap"><table><caption>Output types and their authority.</caption><thead><tr><th scope="col">Output</th><th scope="col">Source</th><th scope="col">Authority</th></tr></thead><tbody>
      <tr><th scope="row">Container schematic</th><td>Design geometry</td><td>Deterministic concept schematic</td></tr>
      <tr><th scope="row">Plans, elevations, section, roof plan</th><td>Design geometry</td><td>Deterministic concept drawings</td></tr>
      <tr><th scope="row">Interior floor plan</th><td>Room polygons, partitions, doors, fixtures, clearances</td><td>Deterministic concept spatial model; inferred rooms are marked</td></tr>
      <tr><th scope="row">Exterior/site reference</th><td>Design geometry + camera</td><td>Deterministic concept reference; not a measured photograph</td></tr>
      <tr><th scope="row">Description and prompt</th><td>Scene specification</td><td>Generated interpretation; facts are checked against the model</td></tr>
      <tr><th scope="row">AI illustration</th><td>Prompt + reference package</td><td>Generative interpretation; never an authoritative drawing</td></tr>
    </tbody></table></div>
    <p class="small">The pipeline refuses to invent storeys, modules, windows, doors, stairs, balconies, porches, decks, rooms, roof features or structural supports. If a feature is not modeled, the prompt says so. The selected homes are single-storey. Interior room polygons and fixtures are modeled for the demonstration homes and inferred provisionally for the others; a spatially accurate interior perspective is still not claimed because no interior camera or perspective renderer exists.</p>
  </section>

  <section aria-labelledby="packages-title">
    <h2 id="packages-title">Six residence packages</h2>
    <p>Each package contains the design JSON, a generated description, the exterior and interior prompts, the negative prompt, the illustration configuration, the scene specification and a manifest with hashes and dependencies. The drawings, interior plans and reference views are shared from the same generated model.</p>
    <div class="concept-grid">${cards}</div>
  </section>

  <section aria-labelledby="revision-title">
    <h2 id="revision-title">Revisions and regeneration</h2>
    <p>The editor compares the current design hash with the hash used to generate the prompt. If you move a module, change a roof pitch or edit an opening, the illustration is marked <strong>outdated</strong>. Changing only a presentation setting changes the illustration configuration and prompt, not the plans or elevations. Regenerate the affected outputs from the editor.</p>
    <p class="small">The hashes cover the architectural model and the presentation configuration separately. The manifest records the design revision, schema version, content hash, generator version, generation date, artifact dependencies and known limitations.</p>
  </section>

  <section aria-labelledby="privacy-title">
    <h2 id="privacy-title">What this page does not do</h2>
    <ul>
      <li>It does not call an AI image service or transmit a design anywhere.</li>
      <li>It does not store a user account, cookie or design on a server.</li>
      <li>It does not claim that an illustration is geometrically verified.</li>
      <li>It does not claim engineering, building-code or accessibility approval.</li>
      <li>It does not add a user design to the published hamlet layout.</li>
    </ul>
  </section>
</main>
<footer class="site-footer"><p><a href="../../../index.html">Containers Hamlet</a> · <a href="../index.html">Design Lab</a> · <a href="../LICENSE.txt">AGPL-3.0-or-later</a> · <a href="../CONTENT-LICENSE.md">CC BY-SA 4.0 content</a></p></footer>
</body>
</html>`;
}
