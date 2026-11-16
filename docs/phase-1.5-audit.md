# Phase 1.5 audit: baseline, data and licensing

## Baseline

- Branch: `main` after PR #9 (`45ff2ad`, merge `363f4e6`).
- Existing build: 192 generated files; 268 main static; 724 Design Lab static; 86 main browser; 171 Design Lab browser.
- Existing initial view: 253 KB uncompressed / 63 KB gzipped.
- Existing whole site: 3,422 KB under the deliberate 3.5 MB budget.
- Existing authoritative data: `data/site.json`, `data/cabin-a.json`, `data/cabin-20.json`, `data/lodge.json`, `data/design-lab.json`, `data/community.json`.
- Generated: `site/assets/**`, `site/models/**`, `site/data/**`, `site/design-lab/views/**`, static HTML pages and the home/map/drawing outputs. Do not edit generated files by hand.

## Site area: 13.5 vs 15 acres

The original Phase 1.2 brief used **13.5 acres**. Commit `0999fe8` is titled **“Expand the woodland to 15 acres and stabilise the map layout”**, so the change was deliberate, not an accidental drift.

- Current authoritative geometry remains `data/site.json`: **15 acres / 6.07 ha**, computed from the parcel polygon.
- Historical `docs/phase-1.2.md` retains the 13.5-acre figures as history.
- No parcel boundary or building placement was changed in Phase 1.5.
- All new pages use the computed area from `data/site.json`; none hard-code a second area.
- If the maintainer prefers 13.5 acres, that is a separate geometry decision requiring `data/site.json` and regeneration — not a text-only edit.

## Licensing audit

Current repository position:

| Material | Current licence | Evidence |
| --- | --- | --- |
| Core application code | MIT | `LICENSE` |
| Core original text/drawings/geometry/data | CC BY 4.0 | `CONTENT-LICENSE.md` |
| Design Lab code | AGPL-3.0-or-later | `site/design-lab/LICENSE.txt` |
| Design Lab concept data/drawings/docs | CC BY-SA 4.0 | `site/design-lab/CONTENT-LICENSE.md` |
| Third-party plans/photos | Not bundled unless rights confirmed | README provenance notes |

Intended policy for **new original work**:

- application code: AGPL-3.0-or-later;
- documentation and new resident guides: CC BY-SA 4.0;
- new original architectural drawings/illustrations: CC BY-SA 4.0;
- third-party works: retain notices and comply with their licences.

**No automatic relicensing.** Existing MIT/CC BY 4.0 files remain under their current notices until rights-holders and third-party material are reviewed. New Phase 1.5 resident-facing text is published as CC BY-SA 4.0 in the new pages and licensing matrix. A full relicensing would require contributor and rights review and is not claimed here.

## Content consistency

- Home names and configuration labels come from `data/site.json` plus `HOME_META` in `tools/build.mjs`.
- Home pages, home index, map details and map deep links are generated from those sources.
- Pair homes now report pair area and draw two offset footprints; Juniper uses `data/cabin-20.json`.
- Resident scenarios use explicit home slugs and are tested against the existing home pages.
- One remaining limitation: Fern/Birch/Moss share the same pair plan; their difference is site, orientation, offset direction and area. This is documented rather than hidden.

## Material passport volumes

Passport volumes come from built primitives (`p.quantities`) and are tested against generated OBJ geometry by signed volume. No demonstrated calculation error was found in this audit. The passport remains **draft** and is not a quantity survey or procurement document.

## Validation after Phase 1.5

| Check | Result |
| --- | --- |
| `node tools/build.mjs --check` | 205 generated files |
| `node tools/check.mjs` | 285 passed |
| `node tools/check-design-lab.mjs` | 722 passed |
| `node tools/browser-check.mjs` | 103 passed |
| `node tools/design-lab-check.mjs` | 166 passed |
| Initial view | 259 KB / 64 KB compressed |
| Whole site | 3,502 KB under 3.5 MB |

**Do not merge automatically.**
