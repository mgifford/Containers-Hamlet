# Pattern lens annotations

## Status

The pattern lens is published on the Design Lab architecture pages for all six
selected homes and the common lodge:

| Design | Annotations | Evidence geometry |
| --- | --- | --- |
| Woodland Cottage | 5 | **authored** room polygons |
| Accessible Garden Home | 5 | **authored** room polygons |
| Offset Stack | 5 | **provisional** room bands inferred from zones |
| Courtyard Residence | 5 | **provisional** room bands inferred from zones |
| Cross-Stacked Retreat | 5 | **provisional** room bands inferred from zones |
| Solar Studio Stack | 5 | **provisional** room bands inferred from zones |
| Common lodge | 3 | **none**; text-only |

The lens covers:

- 127 · Intimacy Gradient;
- 112 · Entrance Transition;
- 159 · Light on Two Sides of Every Room;
- 163 · Outdoor Room;
- 180 · Window Place.

The lodge uses 112, 159 and 163 only, because it has no interior room model.

## Evidence geometry

Each annotation declares its evidence:

- **authored** — the room polygon is authored as part of the interior model. It
  can still be wrong, but it is a designed layout, not an inference.
- **inferred** — the room band is inferred from a longitudinal zone in the
  design model. There are no partitions, doors or fixtures. The highlight shows
  where a zone sits, not where a wall is.
- **none** — the design has no interior room model. The annotation is text-only
  and no polygon is highlighted.

The lens states the geometry in the section introduction, in each annotation's
summary badge and in the live status message. A provisional highlight must not be
read as an authored room layout.

## What the lens does

- Select a pattern to highlight the relevant room polygon or inferred room band.
- Lists observations, limits, status, evidence geometry and an evaluation
  question.
- Links back to the full pattern entry.
- Provides all annotations in a details list without JavaScript.
- Uses stable room IDs (`#room-w-hall`, `#room-e-living`,
  `#room-m1-m1-z1`, etc.).
- Keeps the plan and text available without JavaScript.
- States that the lens is a reading aid, not a finding.

## What it does not do

- Prove that a pattern is satisfied.
- Measure daylight, privacy, acoustics, views or resident satisfaction.
- Model door swings, furniture, sightlines or daylight factors.
- Show the porch/deck on the interior plan; those are noted as text-only or shown
  on the building views.
- Treat a provisional room band as an authored room layout.
- Fix the authored room-opening mismatch. The Woodland Cottage and Accessible
  Garden Home interiors are marked
  `blocked-pending-reconciliation` in
  [`image-descriptions.json`](../data/image-descriptions.json) because the room
  polygons and the recorded opening positions disagree. The lens is not a
  correction for that.
- Fabricate a lodge interior. The lodge annotations are explicitly text-only.
- Replace professional accessibility, fire, structural or architectural review.

## Status vocabulary

- **conceptual** — a design reading, not a measured result.
- **evidence-needed** — the plan lacks the information needed to evaluate it.
- **trade-off-identified** — the annotations record a conflict or cost, not a
  solution.
- **not-evaluated** — no daylight, privacy, acoustic or resident study exists.
- **evidence-supported** — reserved for a future annotation with measured or
  documented evidence; none is currently used.

## Next

1. Reconcile the authored Woodland Cottage and Accessible Garden Home interiors:
   room polygons, opening positions, internal openings and the terrace/entrance
   relationship. Then unblock their image descriptions.
2. Add opening/elevation references for Light on Two Sides and Window Place.
3. Add porch/deck overlays rather than text-only notes.
4. Test the lens with residents and record whether the described sequence matches
   use.

## Related

- [`image-descriptions.md`](image-descriptions.md)
- [`pattern-language.md`](pattern-language.md)
- [`pattern-language-implementation-report.md`](pattern-language-implementation-report.md)
- [`../data/patterns/design-annotations.json`](../data/patterns/design-annotations.json)
