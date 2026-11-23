# Pattern Language implementation report

## Phase status

**Phase 0 — repository audit:** complete.  
**Phase 1 — pattern library and explanation:** complete on this branch.  
**Phases 2–6:** not implemented yet; the route and data model are designed to
extend the existing site plan and Design Lab rather than replace them.

## What changed

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
| `node tools/build.mjs --check` | OK — 499 generated files current |
| `node tools/check.mjs` | 517 passed, 0 failed |
| `node tools/check-design-lab.mjs` | 2,508 passed, 0 failed |
| `node tools/browser-check.mjs` | 107 passed, 0 failed |
| `node tools/design-lab-check.mjs` | 249 passed, 0 failed |

Browser tests cover search, scale and evidence filters, reset, shareable
fragments, related-pattern links, live status, no-JS readability, axe-core and
320 px reflow.

The published site is about **6277 KB**, under the 6.25 MB budget.

## What remains uncertain

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
