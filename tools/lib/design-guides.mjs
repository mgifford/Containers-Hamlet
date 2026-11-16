// Design Lab guide hub. Code: MIT. Text: CC BY-SA 4.0.
const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
import { designShellNav } from './design-nav.mjs';
export function guidesPage() {
  const guides = [
    ['vegetation/','Vegetation','Trellis, living wall, edible planter wall and privacy screen; held clear of the rainscreen.'],
    ['ground/','Ground and access','Piles, grading, no-compaction, footbridge and accessible route questions.'],
    ['patterns/','Patterns','Single, staggered, L/courtyard, stacked, cantilever and creek/hillside arrangements.'],
    ['fire/','Fire resilience','Steel-hull limits, defensible space, ember detailing, hamlet fire response and water.'],
    ['two-storey/','Two-storey','Stacked, offset and hillside options; structure, fire, egress and what the model cannot yet show.'],
    ['resilience/','Resilience','Heat, flood, drought, smoke, power, community capacity and shared responsibilities.'],
    ['water/','Water','Rainwater, greywater, blackwater, fire reserve and an illustrative calculator.']
  ];
  return `<!doctype html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Design Lab guides: vegetation, ground and access, arrangements, fire, two-storey, resilience and water.">
<title>Design Lab guides · Containers Hamlet</title>
<link rel="stylesheet" href="../../../style.css">
<link rel="stylesheet" href="../style.css">
<link rel="icon" href="../../../assets/favicon.svg" type="image/svg+xml">
</head>
<body class="lab-page">
<a class="skip" href="#main">Skip to content</a>
${designShellNav(2, 'guides')}
<main id="main" class="lab-main">
  <p class="eyebrow">Design Lab guides</p>
  <h1>Go deeper, without the whole manual on every page.</h1>
  <p class="lede">These guides hold the technical and site-specific material that does not belong in the gallery cards. Each one is a concept or research note, not an engineering approval.</p>
  <div class="hub-grid">
    ${guides.map(([href,title,copy]) => `<a href="../${esc(href)}"><strong>${esc(title)}</strong><span>${esc(copy)}</span></a>`).join('\n    ')}
  </div>
  <p><a class="action" href="../">Back to the gallery</a> <a class="action secondary" href="../editor/">Open the editor</a></p>
</main>
<footer class="site-footer"><p><a href="../../../index.html">Containers Hamlet</a> · <a href="../">Design Lab</a> · <a href="../../living/">Living Here</a> · <a href="../../participate/">Participate</a></p></footer>
</body>
</html>`;
}
