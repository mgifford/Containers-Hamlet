# Site structure, shareable home pages and page weight

This extension starts splitting the dense single-page hamlet into shareable pages. It is a structural change, not a new architectural claim.

## What changed

- Added `/homes/`, an index of all six cabins and the lodge.
- Added `/homes/<id>/` pages for **Cedar, Birch, Pine, Moss, Fern, Juniper and the lodge**.
- Each home page has stable anchors:
  - `#orientation`
  - `#main-view`
  - `#nearby`
  - `#path`
  - `#winter`
  - `#siting`
  - `#design-note`
  - `#drawings`
- Each heading has a visible permalink `#`; the page also has an **On this page** navigation.
- The landing page now shows **seven compact home cards** instead of seven long hidden briefs. The cards are lazy-loaded and link to the dedicated pages.
- The map's “Read the full home brief” link now goes to the matching home page.
- Legacy `#home-a` … `#home-lodge` anchors remain on the landing-page cards.
- Home pages use the existing view diagrams with `loading="lazy"`; all text and anchors work without JavaScript.

## Why the home page was split

The landing page was carrying the whole site: hero, day-in-the-life, a 158 KB inline map, seven long home briefs, Cabin A drawings and rooms, the lodge drawings and rooms, living/nature/materials, downloads, and the Design Lab entry. The map and Cabin A/lodge still remain on the landing page; the seven home briefs moved to their own pages first. The next split should move the map to `/hamlet/` and the Cabin A/lodge drawing sections to their own pages.

## What the page budget measures

The check is **not just JavaScript**. `tools/check.mjs` measures:

1. **Initial view**: these eight requests:
   - `index.html`
   - `style.css`
   - `script.js`
   - `js/data.js`
   - `js/model.js`
   - `js/render.js`
   - `assets/favicon.svg`
   - `assets/lake-impression.svg`
2. **Whole published site**: every file under `site/`, including HTML, CSS, JS, JSON, SVG drawings, OBJ/MTL models and downloads.

Current limits:

| Measure | Limit | Current |
|---|---:|---:|
| Initial view, compressed | 120 KB | 95 KB |
| Initial view, uncompressed | 400 KB | 381 KB |
| Whole published site | 3.2 MB | 3074 KB |

The initial view is under 400 KB by about **20 KB**. The whole site is under 3.2 MB by about **200 KB**. Adding another substantial page or gallery item will still require either:

- moving the inline map and its optional layers behind a route or lazy request;
- removing or compressing the duplicate full-size site-plan asset;
- reducing the optional potential-building/tree layers; or
- deliberately raising the total budget above 3.2 MB.

Lazy loading improves **when bytes are requested**, not the total byte count. A lazy image still counts in the whole-site budget once published.

## Accessibility and anchors

- `<h2 id>` targets have `scroll-margin-top`.
- Heading permalinks use `aria-label="Link to …"`.
- The on-page navigation uses native links and no JavaScript.
- Home cards keep their legacy IDs so old `#home-b` links do not silently break.
- The site’s global skip link remains; the map’s local skip link is unchanged.

## Validation

| Check | Result |
|---|---|
| `node tools/build.mjs --check` | 140 generated files current |
| `node tools/check.mjs` | 222 passed, 0 failed |
| `node tools/check-design-lab.mjs` | 704 passed, 0 failed |
| `node tools/browser-check.mjs` | 70 passed, 0 failed |
| `node tools/design-lab-check.mjs` | 126 passed, 0 failed |
| Initial view | 381 KB / 95 KB compressed |
| Whole site | 3074 KB |

Browser checks cover the homes index, all seven cards, the Cabin C page, `#main-view`, each section ID, lazy card diagrams, no-JavaScript cards and axe-core.

## Deferred

- Move the map and its layers to `/hamlet/`.
- Move Cabin A/lodge drawings and rooms to their own pages.
- Split living/nature/materials/downloads if still needed after the map and model pages move.
- Reduce or raise the whole-site budget.
- Real screen-reader/disabled-person testing.

**Do not merge automatically.**
