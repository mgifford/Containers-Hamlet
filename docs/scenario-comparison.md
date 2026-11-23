# Site-arrangement comparison

## Status

Phase 3 adds a conceptual comparison of three arrangements at
`/design-lab/scenarios/`:

- **A. Distributed woodland retreats** — the current illustrative assignment and
  the preserved baseline;
- **B. Shared central clearing** — homes grouped around a common clearing;
- **C. Woodland spine with social pockets** — dispersed homes connected by a
  pedestrian spine and several small shared places.

The alternatives are **schematic diagrams**, not georeferenced site plans. They
do not replace the canonical site plan, use surveyed coordinates or establish
feasibility.

## What the page does

- Shows the baseline link to the canonical site plan.
- Compares any two arrangements side by side using native selects.
- Updates the URL query (`?left=…&right=…`) so a comparison can be shared.
- Provides a **Restore baseline** control.
- Publishes all three descriptions, advantages, trade-offs, evaluation questions
  and pattern links without JavaScript.
- Uses descriptive image alternatives and an accessible comparison status.
- States clearly that no arrangement is ranked or declared best.

## What it does not claim

- No resident testing, cost estimate, ecological assessment, accessibility
  review, fire review, engineering or construction feasibility.
- No surveyed building positions or boundary.
- No ownership, tenure or governance mapping.
- No measured privacy, noise, walking distance or social outcome.
- No pattern is “satisfied” by an arrangement diagram.

## Baseline

The baseline is the current illustrative six-home assignment. It is not a
proposal to move homes or a claim that the current arrangement is optimal. The
baseline remains the only arrangement represented in the canonical site plan.

## The three hypotheses

| | Distributed (baseline) | Central clearing | Woodland spine |
| --- | --- | --- | --- |
| Main idea | Separate homes across the land | Shared centre | Linear route with small shared pockets |
| Potential strength | Privacy and distinct settings | Visibility and easy contact | Balance and repeated small contact |
| Main risk | Long, dispersed connections | Overlooked homes and concentrated disturbance | Complex routes and maintenance |
| Evidence | Conceptual baseline | Conceptual alternative | Conceptual alternative |

## Pattern links

Scenarios link to relevant pattern entries rather than using patterns as a score:

- Distributed: 37, 36, 120, 129
- Central clearing: 37, 61, 129, 36, 106
- Woodland spine: 120, 61, 69, 36, 129

## Next evaluation work

1. Walk each arrangement with residents and record route lengths, thresholds and
   places where people actually pause.
2. Test privacy/noise hypotheses rather than asserting them.
3. Test winter access, accessible routes and emergency access.
4. Overlay ecological constraints and fire access.
5. Record trade-offs in structured evaluation records; do not convert them into
   a single score.

## Validation

| Check | Result |
| --- | --- |
| `node tools/build.mjs --check` | 503 generated files current |
| `node tools/check.mjs` | 520 passed, 0 failed |
| `node tools/check-design-lab.mjs` | 2,526 passed, 0 failed |
| `node tools/browser-check.mjs` | 107 passed, 0 failed |
| `node tools/design-lab-check.mjs` | 261 passed, 0 failed |
| Whole site | 6332 KB (6.25 MB budget) |
