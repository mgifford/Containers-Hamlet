# Resident scenarios and evaluation records

## Status

Phase 5 adds an evaluation framework at `/design-lab/evaluation/`:

- six resident activity sequences;
- six **open** structured records, one per sequence;
- a downloadable blank record template;
- an explicit statement that **0 of 6 records contain observations**.

No resident walkthrough, accessibility review, fire test, ecological survey or
post-occupancy evaluation has been completed.

## Separation of concerns

- **Pattern definition** — `data/patterns/patterns.json`.
- **Resident scenario** — `data/evaluation/scenarios.json`: an activity sequence,
  paired design, related patterns and evidence needed.
- **Evaluation record** — `data/evaluation/records.json`: one pattern, one design
  element, one method, one status and no fabricated observation.
- **Blank template** — `site/design-lab/evaluation/record-template.json`.

## Records

Each open record contains:

- scenario and design pairing;
- pattern and element;
- a question;
- method (walkthrough, daylight observation, occupational therapy review,
  seasonal trial, guest stay, stewardship trial);
- status `not-evaluated`;
- empty observations;
- limitations;
- null reviewer and date.

A completed record must add a reviewer, reviewer role, date, observations,
evidence and consent status. A `not-evaluated` record is deliberately incomplete.

## What the page does not claim

- No resident was consulted.
- No scenario is representative of all ages, incomes, household structures,
  disabilities or care needs.
- No design pairing is an allocation of a home.
- No score, index or community-quality rating is used.
- No accessibility, fire, water, power, cost or ecological conclusion.
- No scenario proves a pattern is achieved.

## Scenario pairings

| Scenario | Design pairing |
| --- | --- |
| Living alone, year-round | Woodland Cottage |
| A couple working remotely | Offset Stack |
| A seasonal resident | Solar Studio Stack |
| Planning for changing mobility | Accessible Garden Home |
| A household that hosts guests | Cross-Stacked Retreat |
| Gardening and land stewardship | Courtyard Residence |

Pairings are for evaluation only. The existing `/community/scenarios/` page keeps
the broader resident prompts; the Design Lab page turns them into testable
sequences.

## Completing a record

1. Choose one scenario and design.
2. Walk the sequence with a resident or a person acting the part, without coaching.
3. Record what happened, where, when and with what assistance.
4. Record evidence and limitations; leave the record open if evidence is missing.
5. Name the reviewer and date. Do not convert the outcome into a score.

## Remaining

- Actual resident walkthroughs.
- Accessibility and occupational-therapy review.
- Fire, water, power and winter tests.
- Completed records tied to a design version or scene hash.
- Phase 6 manual accessibility testing and visual regression.
