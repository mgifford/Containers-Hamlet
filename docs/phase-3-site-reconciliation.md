# Phase 3 site and residence reconciliation

The site model remains the authoritative fictional landscape. The six selected
Design Lab homes are illustrative assignments, not surveyed placements. This note
makes their geometric relationship explicit and records conflicts instead of
silently changing parcels, clearings or paths.

## Method

For each site building with a `design_lab_home`:

- derive the selected design footprint, height, storey count and entrance
  orientation from `site/js/design-model.js`;
- derive the design's maximum radial reach from the site building centre,
  including the longest porch depth;
- compare that reach with the recorded `clearing_radius_m`;
- compare the selected footprint with the older site-model footprint;
- compare the design entrance side with the recorded path approach;
- record every difference as a site-placement conflict.

The comparison is a design review, not a survey, setback, geotechnical, fire,
privacy or permission assessment. A mismatch does not authorise moving a path or
parcel.

## Current results

See the generated table at `/design-lab/residences/#site-reconciliation` and
`site/data/homes.json` (`design_lab_reconciliation` and each building's
`design_lab_geometry.modules`). The module polygons are the selected design
footprints transformed into site coordinates. The site plan remains the
older authoritative landscape representation; the derived footprints are a
reconciliation layer, not a replacement survey.

| Site | Design | Design m² | Site model m² | Difference | Entrance / path | Clearing margin | Conflict |
| --- | --- | ---: | ---: | ---: | --- | ---: | --- |
| Cabin A | Woodland Cottage | 29.72 | 35.64 | −16.6% | south / east | +3.0 m | entrance/path mismatch |
| Cabin B | Offset Stack | 36.06 | 66.30 | −45.6% | east / south-west | −0.4 m | reach beyond clearing; entrance/path mismatch |
| Cabin C | Courtyard Residence | 63.29 | 35.64 | +77.6% | east / east | −5.7 m | reach beyond clearing; footprint much larger than the old site model |
| Cabin D | Cross-Stacked Retreat | 53.50 | 66.30 | −19.3% | east / north | +2.0 m | reach beyond clearing; entrance/path mismatch |
| Cabin E | Accessible Garden Home | 29.54 | 66.30 | −55.4% | south / east | +3.5 m | entrance/path mismatch; old site model much larger |
| Cabin F | Solar Studio Stack | 16.72 | 18.27 | −8.5% | south / north-east | +3.6 m | entrance/path mismatch; footprint much larger than the old site model |
| Lodge | Common Lodge | 215.17 | 141.84 | +51.7% | north / east | +1.3 m | entrance/path mismatch; existing lodge model not replaced |

The numbers are nominal concept geometry. The site footprint is the older
simplified building model, not a design of the selected home.

## Unresolved site decisions

- Cabin B and Cabin C are the tight/oversized placements. Cabin B is slightly
  over its clearing radius; Cabin C is nearly twice the footprint of the old site
  model. Both need a site survey, tree/rock preservation review and a revised
  clearing or different assignment.
- Cabin D and Cabin F fit within their recorded clearing radii, but their
  entrance directions and the old site-model footprints still differ.
- The two-storey stacked homes have a smaller ground footprint than their
  single-storey translations; the trade-off is stairs, structure and vertical
  access.
- The entrance side and path approach differ at most sites. A path can turn at the
  door, so this is a review flag, not necessarily an error.
- The lodge is a separate community building; its existing model was not replaced
  by the Design Lab concept.
- No parcel boundary, no-build area, shoreline buffer or neighbour distance was
  changed to accommodate a design.

## What was not done

- No survey or terrain re-survey.
- No new road, path, parking or clearing geometry.
- No geotechnical, drainage, fire-access or accessibility-route assessment.
- No privacy or overlook analysis.
- No construction setout.

These are separate professional and site-planning milestones.
