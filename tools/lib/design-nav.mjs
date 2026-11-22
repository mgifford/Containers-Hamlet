// Shared top-level and Design Lab navigation. Code: MIT.
const up = (n) => '../'.repeat(n);
export function designHeader(depth) {
  const p = up(depth);
  return `<header class="site-header">
  <a class="brand" href="${p}index.html">Containers Hamlet</a>
  <nav aria-label="Main">
    <a href="${p}community/">Community</a>
    <a href="${p}hamlet/">Map</a>
    <a href="${p}homes/">Homes</a>
    <a href="${p}design-lab/" aria-current="page">Design Lab</a>
    <a href="${p}living/">Living Here</a>
    <a href="${p}participate/">Participate</a>
  </nav>
</header>`;
}
export function designSubnav(depth, current) {
  const p = up(depth);
  const link = (href, label, id) => `<a href="${href}"${current === id ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<nav class="subnav" aria-label="Design Lab sections">
  ${link(p + 'design-lab/', 'Gallery', 'gallery')}
  ${link(p + 'design-lab/residences/', 'Residences', 'residences')}
  ${link(p + 'design-lab/illustration/', 'Illustrate', 'illustrate')}
  ${link(p + 'design-lab/editor/', 'Editor', 'editor')}
  ${link(p + 'design-lab/guides/', 'Guides', 'guides')}
  ${link(p + 'design-lab/compare/', 'Compare', 'compare')}
</nav>`;
}
export function designShellNav(depth, current) { return designHeader(depth) + '\n' + designSubnav(depth, current); }
