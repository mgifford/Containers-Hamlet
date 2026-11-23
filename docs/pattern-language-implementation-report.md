# Pattern Language implementation report

## Phase status

**Phase 0 — repository audit:** complete.  
**Phase 1 — pattern library and explanation:** complete on this branch.  
**Phases 2–6:** not implemented yet; the route and data model are designed to
extend the existing site plan and Design Lab rather than replace them.

## What changed

### Phase 2 site-plan integration

- Added `data/patterns/site-elements.json` with stable selectors for the generated site plan (landscape, common land, paths, lodge, homes, visitor arrival) and explicit text-only elements for porches/interiors.
- Explorer now embeds the canonical `site-plan.svg` as an `<object>` and adds a **Highlight on site plan** button to every pattern.
- Highlighting uses same-origin DOM access, not a duplicated map or fetch/XHR.
- Every highlight has a text list of the mapped elements, evidence state, limitation and a **not shown at site-plan scale** note where applicable.
- A site-element key and clear-highlight control are available; the map/key remain usable without JavaScript.


### New canonical data

- `data/patterns/patterns.json` — 20 curated patterns with:
  - number, title, scale and source verification;
  - original summary, problem, proposal and hamlet interpretation;
  - current design response, alternatives, trade-offs and unresolved issues;
  - related patterns and relationship notes;
  - applicable hamlet elements;
  - evaluation questions, evidence state and limitations.
- `data/patterns/schema.json` — documented JSON Schema for the catalogue.
- `tools/lib/patterns.mjs` — verified number/title map and validation.
- `tools/lib/pattern-language-page.mjs` — generated Explorer page.
- `site/design-lab/pattern-language/` — public page, CSS and local filtering JS.

### Public feature

`/design-lab/pattern-language/` provides:

- a plain-language design-philosophy introduction and 12 principles;
- search by name, number or phrase;
- filters by scale, applicable hamlet element and evidence state;
- 20 pattern cards with stable fragments (`#pattern-104`);
- related-pattern navigation;
- source links and attribution;
- explicit evidence and limitation labels;
- a no-JavaScript readable list;
- a visible statement that patterns are not codes, scores or guarantees.

### Documentation

- `docs/pattern-language-audit.md` — Phase 0 audit.
- `docs/design-philosophy.md` — 12 principles, privacy/community, climate.
- `docs/pattern-language.md` — source/copyright policy, catalogue, relationships.
- `docs/pattern-methodology.md` — evidence states, future evaluation records.
- `docs/pattern-language-implementation-report.md` — this report.

## What was reused

- Existing static Node build and GitHub Pages deployment.
- `designShellNav`/Design Lab navigation, CSS and native controls.
- Existing card, status/live-region, table and responsive patterns.
- Existing Playwright/axe test harness.
- Existing static/no-JS conventions.
- Existing data, site geometry, Design Lab, illustration pipeline and tests were
  not replaced.

## What was removed or replaced

Nothing in the existing site was removed. The new feature lives at
`/design-lab/pattern-language/`, distinct from the existing container
configuration guide at `/design-lab/patterns/`.

## Source and copyright approach

- Pattern numbers/titles were checked against the 1977 edition contents/summary.
- Only numbers and titles are referenced; no book text or illustrations are
  reproduced.
- All summaries, hamlet interpretations and questions are original.
- The page links to the primary source and names all six contributors.
- It states that verification covers title/number mapping, not author intent or
  endorsement.

## What was tested

| Command | Result |
| --- | --- |
| `node tools/build.mjs --check` | OK — 505 generated files current |
| `node tools/check.mjs` | 520 passed, 0 failed |
| `node tools/check-design-lab.mjs` | 2,542 passed, 0 failed |
| `node tools/browser-check.mjs` | 107 passed, 0 failed |
| `node tools/design-lab-check.mjs` | 273 passed, 0 failed |

Browser tests cover search, scale and evidence filters, reset, shareable
fragments, related-pattern links, live status, no-JS readability, axe-core and
320 px reflow.

The published site is about **6437 KB**, under the 6.5 MB budget after adding the four remaining homes and their provisional room-band annotations.

## Phase 3 scenario comparison

- Added `data/scenarios/site-layouts.json` with the baseline and two conceptual arrangements.
- Added `/design-lab/scenarios/` with baseline link, two-sided comparison, shareable URL, baseline restore and full no-JS alternatives.
- Added three original schematic SVGs with titles, descriptions, licence and “not to scale / not a site plan” caveats.
- Added validation that requires three arrangements, a single baseline, trade-offs, questions, pattern references and no “best/winning” label.
- Added browser tests for comparison, URL, reset, no-JS, axe and 320 px reflow.

## Phase 4 pattern lens

- Added annotations for patterns 127, 112, 159, 163 and 180.
- Woodland Cottage and Accessible Garden Home use authored room polygons; Offset Stack, Courtyard Residence, Cross-Stacked Retreat and Solar Studio Stack use provisional room bands inferred from zones; the common lodge is explicitly text-only.
- Each annotation declares its evidence geometry (`authored`, `inferred` or `none`); the lens and validation disclose it.
- Interior plans now carry stable `#room-*` IDs, including the inferred room bands.
- The lens lists observations, questions, limits and links back to the Explorer.
- No annotation claims that a pattern is satisfied.
- The two authored interiors are marked blocked in the v2 image descriptions because their room polygons and opening positions do not reconcile.

## Phase 5 evaluation framework

- Added six resident activity sequences and six open records.
- Added a blank record template and explicit completion rules.
- Every record is `not-evaluated` with null reviewer/date and no observations.
- Added page, validation, no-JS, axe, 320 px and template-download tests.
- No resident was consulted; no finding is claimed.

## What remains uncertain

- Site-plan highlighting is a reading aid; it does not prove the pattern is achieved.
- Common-land ownership/stewardship is not mapped.
- Path widths/grades/winter access are placeholders.

- The pattern-to-hamlet interpretations are conceptual; no resident, ecological
  or post-occupancy evidence exists.
- The pattern catalogue covers 20 patterns, not the full book.
- No site-plan highlighting or scenario comparison exists yet.
- No structured evaluation records or resident scenarios are implemented yet.
- No lodge/cabin pattern annotations exist in the Design Lab yet.
- No patterns have been professionally reviewed for applicability.
- Accessibility, ecology, climate and structural claims remain outside this
  phase.

## What comes next

1. **Phase 2:** stable site-element IDs, pattern-to-site annotations and a
   site-plan highlighting layer with text alternatives.
2. **Phase 3:** baseline plus three conceptual arrangements and a comparison UI.
3. **Phase 4:** pattern annotations in the Design Lab for Intimacy Gradient,
   Entrance Transition, Light on Two Sides, Outdoor Room and Window Place.
4. **Phase 5:** resident scenarios and dated evaluation records.
5. **Phase 6:** manual accessibility testing, visual regression, deployment
   verification and contributor documentation.

Do not treat the Phase 1 Explorer as evidence that the hamlet or any home
satisfies a pattern, code or accessibility requirement.
