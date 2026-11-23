# Page-weight refactor

The published site was 6370 KB and the selected gallery, architecture pages and
editor were larger than necessary. The refactor reduces both individual page
weight and the total to **5987 KB**, back under the original 6 MB budget.

## What changed

### Selected gallery and concept archive

The main gallery now carries only the six selected homes. The nine legacy
concepts, the common lodge and four arrangement studies moved to
`/design-lab/concepts/`.

- selected gallery: **289 KB → 87 KB** transfer;
- new archive page: **82 KB**;
- main gallery HTML: **88 KB → 40 KB**;
- concept cards on the main page: **16 → 6**.

This is a real split, not a hidden tab. The archive is linked from the main
gallery and remains fully accessible.

### Architecture pages

All non-current slides and below-the-fold drawings now use `loading="lazy"`.
Only the first exterior view is eager.

- Offset Stack architecture page: **216 KB → 90 KB** transfer;
- one visible slide and its controls still work without JavaScript;
- "Show all views" still loads every drawing when requested.

### Editor

The editor now loads only the six selected concepts and metadata for the three
editable legacy presets. The legacy concept data is fetched locally as
`concepts-archive.js` only when a legacy preset is selected.

- editor initial transfer: **907 KB → 767 KB**;
- selecting a legacy preset loads the archive script and remains same-origin;
- compare page still loads the full selected + archive concept data.

### Compact generated data

Package `design.json`, `config.json`, `scene.json` and `manifest.json` are now
compact JSON. Public `homes.json`, `terrain.json`, `site.json` and package
manifests were compacted as well.

### Compressed 3D downloads

Published OBJ downloads are now gzip-compressed (`*.obj.gz`) and are clearly
labelled as needing decompression before import. The source OBJ/MTL files remain
in the repository for build/tests and 3D download generation.

This saves about 220 KB without deleting the geometry. MTL files remain
uncompressed because they are tiny.

## Measurements

| Page | Before | After |
| --- | ---: | ---: |
| Selected gallery | 289 KB | 87 KB |
| Concept archive | — | 82 KB |
| Offset Stack architecture | 216 KB | 90 KB |
| Editor (selected preset) | 907 KB | 767 KB |
| Whole published site | 6370 KB | **5987 KB** |

The 6 MB budget is restored in `tools/check.mjs`.

## Trade-offs

- The archive is one extra click away.
- Legacy presets in the editor need a local script fetch on first selection.
- OBJ downloads need decompression; the download label says so.
- Images below the fold load later, so print/full-page screenshots need explicit
  scrolling (tests do this).
- The total still includes all drawings, packages, model downloads and source
  data; it is not a single page.

## Not done

- No removal of legacy concepts, drawings, model downloads or packages.
- No external image CDN, backend or runtime dependency.
- No SVG rasterisation or lossy image conversion.
- No change to the accessibility, no-JavaScript or print behaviour.
