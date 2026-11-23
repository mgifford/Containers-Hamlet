# Pattern evaluation methodology

This document defines how Containers Hamlet records a design observation without
turning *A Pattern Language* into a scorecard.

## Separation of data

1. **Pattern definition** — number, title, source, original summary,
   interpretation, related patterns and limitations.
2. **Design element** — a stable site, building or interior identifier.
3. **Evaluation record** — a dated observation about one pattern applied to one
   design version.
4. **Resident scenario** — a reusable activity sequence used to test a design.

Pattern definitions live in `data/patterns/patterns.json`. Evaluation records and
scenarios are future phases; they must not be embedded in the pattern catalogue.

## Evidence states

| State | Use |
| --- | --- |
| Not evaluated | The question has not been considered. |
| Conceptual | A response is illustrated but untested. |
| Evidence needed | A concern is identified but supporting information is missing. |
| Evidence-supported | A conclusion is supported only within a stated scope. |
| Trade-off identified | One consideration improves while another may worsen. |
| Not applicable | The pattern is irrelevant here, with an explanation. |

Passing a pattern check is not building-code, accessibility or ecological
compliance.

## Evaluation record (future)

Each record will reference:

- pattern number and design element;
- design version or scene hash;
- the question/observation;
- evidence and method, if any;
- limitations;
- date;
- outcome state;
- reviewer/source.

No unsupported numerical community-quality index. If a quantitative metric is
added, it needs a definition, inputs, units, method and limitations.

## Resident scenarios

Future scenarios should describe an activity sequence, not a stereotype. Example:

- leave home;
- use a shared path;
- enter the lodge;
- use a facility;
- return home.

Scenarios can be applied to the baseline and conceptual arrangements. They record
whether the design supports the activity, what evidence is missing and what
trade-off is exposed.

## Pattern relationships

Related patterns are navigational hypotheses. A relationship may be:

- reinforcing;
- constraining;
- in tension/conflicting.

The catalogue currently stores a short relationship note and a list of related
numbers. It does not claim to reproduce the book's complete network.

## Review discipline

- Do not invent evidence.
- Do not convert a pattern into a mandatory rule.
- Do not describe a concept as professionally verified.
- Record uncertainty near the claim it qualifies.
- Keep accessibility, ecology and climate evidence distinct from aesthetic
  preference.

## Phase status

Phase 1 implements definitions, validation, public explanation and Explorer
navigation. Phase 2 adds stable site-element mappings, map highlighting and text
alternatives. Scenario comparison, annotations, resident scenarios and
evaluation records remain later phases.
