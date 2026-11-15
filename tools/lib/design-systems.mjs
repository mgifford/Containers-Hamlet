// Code: MIT. Generated diagrams/content: CC BY-SA 4.0.
const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function vegetationComparisonSVG() {
  const W = 1040, H = 440;
  const panel = (x, title, subtitle) => `<g><rect x="${x}" y="70" width="300" height="310" rx="10" fill="#fbf9f2" stroke="#c7d4c8"/><text x="${x + 16}" y="98" font-family="system-ui, sans-serif" font-size="17" font-weight="800" fill="#1d392c">${esc(title)}</text><text x="${x + 16}" y="118" font-family="system-ui, sans-serif" font-size="11" fill="#3f5a4c">${esc(subtitle)}</text></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="veg-t veg-d">
<title id="veg-t">Rainscreen, trellis and modular living wall compared</title>
<desc id="veg-d">Three explanatory sections. A conventional timber rainscreen has steel, exterior insulation, a ventilated cavity and cladding. A planted trellis has an independent frame clear of the wall. A modular living wall has an independent frame, planted modules and irrigation clear of the wall. These are original schematic diagrams, not construction details or product drawings.</desc>
<rect width="${W}" height="${H}" fill="#faf8f2"/>
<text x="34" y="34" font-family="system-ui, sans-serif" font-size="24" font-weight="800" fill="#1d392c">Rainscreen · trellis · modular living wall</text>
<text x="34" y="54" font-family="system-ui, sans-serif" font-size="12" fill="#3f5a4c">Original schematic comparison. Not to scale; not a construction detail or product drawing.</text>
${panel(24, 'Conventional timber rainscreen', 'Separated layers; drained and ventilated cavity')}
${panel(370, 'Planted trellis', 'Independent frame; climber clear of wall')}
${panel(716, 'Modular living wall', 'Independent modules, frame and irrigation')}
<!-- panel 1 -->
<g transform="translate(48,150)">
  <rect x="0" y="20" width="18" height="180" fill="#7c8585" stroke="#435a4a"/><text x="0" y="16" font-size="9" font-family="system-ui, sans-serif" fill="#1d392c">steel</text>
  <rect x="18" y="20" width="72" height="180" fill="#d8bd87" stroke="#435a4a"/><text x="20" y="16" font-size="9" font-family="system-ui, sans-serif" fill="#1d392c">insul.</text>
  <rect x="90" y="20" width="38" height="180" fill="#dbe6d7" stroke="#435a4a"/><text x="90" y="16" font-size="9" font-family="system-ui, sans-serif" fill="#1d392c">cavity</text>
  <rect x="128" y="20" width="26" height="180" fill="#8a6a4a" stroke="#435a4a"/><text x="128" y="16" font-size="9" font-family="system-ui, sans-serif" fill="#1d392c">clad</text>
  <line x1="0" y1="220" x2="154" y2="220" stroke="#435a4a"/><text x="42" y="238" font-size="9" font-family="system-ui, sans-serif" fill="#3f5a4c">drained · ventilated · repairable</text>
</g>
<!-- panel 2 -->
<g transform="translate(394,150)">
  <rect x="0" y="20" width="18" height="180" fill="#7c8585" stroke="#435a4a"/><text x="0" y="16" font-size="9" font-family="system-ui, sans-serif" fill="#1d392c">steel</text>
  <rect x="18" y="20" width="50" height="180" fill="#d8bd87" stroke="#435a4a"/><text x="18" y="16" font-size="9" font-family="system-ui, sans-serif" fill="#1d392c">insul.</text>
  <rect x="68" y="20" width="20" height="180" fill="#dbe6d7" stroke="#435a4a"/><text x="68" y="16" font-size="9" font-family="system-ui, sans-serif" fill="#1d392c">gap</text>
  <line x1="112" y1="20" x2="112" y2="200" stroke="#5b4a35" stroke-width="5"/><line x1="152" y1="20" x2="152" y2="200" stroke="#5b4a35" stroke-width="5"/>
  <g stroke="#4f7d64" stroke-width="2" fill="none"><path d="M112 40h40v160h-40z"/><path d="M112 70l40 30M112 110l40 30M112 150l40 30M152 70l-40 30M152 110l-40 30M152 150l-40 30"/></g>
  <text x="112" y="16" font-size="9" font-family="system-ui, sans-serif" fill="#1d392c">frame</text>
  <text x="76" y="238" font-size="9" font-family="system-ui, sans-serif" fill="#3f5a4c">climber · seasonal foliage · maintenance gap</text>
</g>
<!-- panel 3 -->
<g transform="translate(740,150)">
  <rect x="0" y="20" width="18" height="180" fill="#7c8585" stroke="#435a4a"/><text x="0" y="16" font-size="9" font-family="system-ui, sans-serif" fill="#1d392c">steel</text>
  <rect x="18" y="20" width="42" height="180" fill="#d8bd87" stroke="#435a4a"/><text x="18" y="16" font-size="9" font-family="system-ui, sans-serif" fill="#1d392c">insul.</text>
  <rect x="60" y="20" width="24" height="180" fill="#dbe6d7" stroke="#435a4a"/><text x="60" y="16" font-size="9" font-family="system-ui, sans-serif" fill="#1d392c">gap</text>
  <rect x="104" y="20" width="42" height="180" fill="#6f9d5b" stroke="#31573f"/><rect x="146" y="20" width="18" height="180" fill="#4f7d64" stroke="#31573f"/>
  <g stroke="#f4f0df" stroke-width="1"><path d="M104 52h60M104 84h60M104 116h60M104 148h60M104 180h60"/><path d="M124 20v180M144 20v180"/></g>
  <line x1="104" y1="210" x2="164" y2="210" stroke="#2d6b78" stroke-width="2" stroke-dasharray="4 3"/><text x="104" y="228" font-size="9" font-family="system-ui, sans-serif" fill="#1f4f60">irrigation</text>
  <text x="104" y="16" font-size="9" font-family="system-ui, sans-serif" fill="#1d392c">modules</text>
  <text x="76" y="244" font-size="9" font-family="system-ui, sans-serif" fill="#3f5a4c">plant, growing medium, water and maintenance load</text>
</g>
<text x="34" y="422" font-family="system-ui, sans-serif" font-size="9" fill="#5e6a58">Schematic only · not product designs · independent support, fire, moisture, structural and maintenance review required · Containers Hamlet Design Lab · CC BY-SA 4.0</text>
</svg>`;
}
