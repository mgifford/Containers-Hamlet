// Code: MIT. Diagrams/content: CC BY-SA 4.0.
const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function svg(title, desc, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 300" role="img" aria-labelledby="arr-t arr-d"><title id="arr-t">${esc(title)}</title><desc id="arr-d">${esc(desc)}</desc><rect width="520" height="300" fill="#faf8f2"/>${body}<text x="18" y="282" font-family="system-ui" font-size="9" fill="#5e6a58">Arrangement study · not engineered · Containers Hamlet Design Lab · CC BY-SA 4.0</text></svg>`;
}
export function arrangementSVG(kind) {
  if (kind === 'stacked') return svg('Stacked pair study', 'Two containers stacked with an external stair and a shared landing.', '<rect x="150" y="160" width="190" height="70" fill="#b58a62" stroke="#274c3b" stroke-width="2"/><rect x="150" y="88" width="190" height="70" fill="#cbb08a" stroke="#274c3b" stroke-width="2"/><path d="M340 160h20v70h-20M340 88h20v70h-20" fill="none" stroke="#5d6f6a" stroke-width="4"/><path d="M20 260h480" stroke="#8aa184"/><text x="150" y="60" font-family="system-ui" font-size="13" font-weight="700" fill="#1d392c">Stacked pair</text><text x="150" y="76" font-family="system-ui" font-size="10" fill="#9a4e3a">structural + egress study</text>');
  if (kind === 'cantilever') return svg('Cantilever study', 'An upper container set forward over a sheltered entry, with a back-span and supports.', '<rect x="170" y="162" width="180" height="68" fill="#b58a62" stroke="#274c3b" stroke-width="2"/><rect x="210" y="92" width="180" height="68" fill="#cbb08a" stroke="#274c3b" stroke-width="2"/><path d="M210 160v-10M390 160v-10" stroke="#9a4e3a" stroke-width="5"/><path d="M350 162v80M390 162v80" stroke="#5d6f6a" stroke-width="3"/><text x="170" y="64" font-family="system-ui" font-size="13" font-weight="700" fill="#1d392c">Cantilever</text><text x="170" y="80" font-family="system-ui" font-size="10" fill="#9a4e3a">back-span + overturning</text>');
  if (kind === 'courtyard') return svg('L / courtyard study', 'Two container wings around a shared deck and a sheltered outdoor room.', '<rect x="120" y="120" width="190" height="62" fill="#b58a62" stroke="#274c3b" stroke-width="2"/><rect x="120" y="182" width="62" height="90" fill="#cbb08a" stroke="#274c3b" stroke-width="2"/><rect x="210" y="200" width="150" height="58" fill="#d9c7a5" stroke="#274c3b" stroke-width="2"/><text x="126" y="100" font-family="system-ui" font-size="13" font-weight="700" fill="#1d392c">L / courtyard</text><text x="126" y="116" font-family="system-ui" font-size="10" fill="#31573f">shared deck between wings</text>');
  return svg('Creek-spanning room study', 'A clear-span room over a creek, with supports outside the banks and big windows.', '<path d="M30 190c60-18 100 16 170-6s120-16 170 8 80 10 120-4" fill="none" stroke="#6b95a2" stroke-width="16" opacity=".5"/><rect x="160" y="94" width="200" height="72" fill="#b58a62" stroke="#274c3b" stroke-width="2"/><path d="M180 166v32M350 166v32" stroke="#5d6f6a" stroke-width="5"/><text x="160" y="68" font-family="system-ui" font-size="13" font-weight="700" fill="#1d392c">Creek room</text><text x="160" y="84" font-family="system-ui" font-size="10" fill="#9a4e3a">clear span outside the banks</text>');
}
export function arrangementCards(base = '') {
  const cards = [
    ['stacked', 'Stacked pair', 'Two modules, one vertical home. Test the shared landing, external stair, fire separation and second exit before the form.', 'two-storey/'],
    ['cantilever', 'Cantilever', 'A sheltered entry under an upper module. The back-span, connections, foundation uplift and snow drift are the design.', 'patterns/#stacked'],
    ['courtyard', 'L / courtyard', 'Two wings around a shared deck. A useful way to get outdoor room and privacy without a larger container footprint.', 'patterns/'],
    ['creek', 'Creek-spanning room', 'A room over water with big windows. Supports, flood/scour, debris and conservation review come before the view.', 'patterns/']
  ];
  return `<section class="concept-group arrangement-studies" aria-labelledby="arrangement-studies">
  <h3 id="arrangement-studies">Arrangement studies: possible, not offered as engineered models</h3>
  <p class="small">These are the arrangements worth testing beyond the wide pair. They are diagrams and studies, not editable or buildable models. Each card links to the structural, egress or site notes.</p>
  <div class="concept-grid arrangement-grid">
${cards.map(([kind, title, copy, href]) => `    <article class="concept-card arrangement-card">
      <div class="concept-card-media"><img src="${base}arrangements/${kind}.svg" width="520" height="300" alt="${esc(title)} arrangement diagram." loading="eager" decoding="async"></div>
      <div class="concept-card-body"><span class="concept-badge">Study</span><h4>${esc(title)}</h4><p>${esc(copy)}</p><p class="card-actions"><a class="action secondary" href="${base}${esc(href)}">Read the constraints</a></p></div>
    </article>`).join('\n')}
  </div>
</section>`;
}
