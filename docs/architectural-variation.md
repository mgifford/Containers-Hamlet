# Architectural variation

## The rule

Architectural diversity is a **primary** difference, not a paint colour. The
project separates:

**Primary variation**

* number of occupied storeys
* module arrangement (single, parallel pair, L, offset stack, aligned stack,
  perpendicular stack, courtyard)
* footprint and massing
* roof geometry
* interior organisation and essential functions on the ground floor
* relationship between interior and exterior
* building orientation and entrance
* vertical circulation
* ground coverage and building height

**Secondary variation**

* window placement
* porch design
* facade rhythm
* exterior material and colour
* trellises
* vegetation
* shading devices
* solar equipment

Two homes with the same massing, roof and circulation are not architecturally
diverse merely because one is green and one is ochre. At the same time, diversity
does not require six unrelated construction systems. All six homes share the
container-first approach, a drained and ventilated exterior assembly, independent
foundations, and the same review process.

## The six hamlet residences

| Home | Family | Storeys | Modules | Arrangement | Footprint | Roof | Entrance | Circulation | Ground-floor living |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | Woodland Cottage | 1 | 1 × 40 ft | Single | Rectangular | Gable, 24° | South | Single level | Yes, bedroom/bath/kitchen/living |
| B | Offset Stack | 2 | 2 × 40 ft | Offset stack, 2.6 m | Rectangular with overhang | Shed, 8° | South | Internal stair | Yes, but no ground bedroom |
| C | Courtyard Residence | 1 | 2 × 40 ft | L-shape | L-shaped | Flat with green-roof concept | North | Single level | Yes, bedroom/bath/kitchen/living |
| D | Cross-Stacked Retreat | 2 | 2 × 40 ft | Perpendicular stack | Cross | Butterfly, 12° | South | Internal stair | Yes, but no ground bedroom |
| E | Accessible Garden Home | 1 | 2 × 20 ft | Parallel pair | Compact | Canopy | South | Single level | Yes, bedroom/bath/kitchen/living |
| F | Solar Studio Stack | 2 | 2 × 20 ft | Aligned stack, 0.8 m offset | Rectangular | Solar-ready shed, 12° | South | Internal stair | Yes, but no ground bedroom |

The dimensions and areas are nominal. The **architectural intent** is the
important part: the six are visibly different in storey count, massing, roof,
footprint and circulation.

### Home A — Woodland Cottage

A single 40-foot module under a pitched roof. The plan is conventional and
readable: bedroom, bathroom, kitchen, living, with a covered, step-free porch.
This is the control against which the other homes are compared. It is not
presented as the universally correct answer; it uses more ground than the
stacked homes and has a simple single-level plan.

### Home B — Offset Stack

A ground module with a second module shifted 2.6 m east. The offset creates a
covered ground-floor outdoor room. The upper module is only partly carried by
the ground module. The model reports the geometric support overlap and flags the
unsupported portion for engineering review; it does not pretend the offset is
structurally resolved.

### Home C — Courtyard Residence

Two 40-foot modules form an L around a sheltered courtyard. The home is
single-storey and step-free, but its footprint is larger. The flat roof is shown
with a green-roof **concept**; saturated load, drainage, fire and maintenance
are explicitly unresolved. This is the deliberate counter-example to “smaller
footprint is always better”.

### Home D — Cross-Stacked Retreat

A ground bar crossed by a perpendicular upper bar. The silhouette is strong, but
the upper module bears on only the crossing area. The structural review register
flags the unsupported area, lateral stability, transfer loads and fire
separation. It is the clearest example of “geometrically representable does not
mean structurally feasible”.

### Home E — Accessible Garden Home

Two 20-foot modules side by side, organised around a step-free route. The design
records a 1.0 m entrance door, 1.2 m circulation target, ground-floor bedroom,
adaptable bathroom and adaptable kitchen. Accessibility is treated as a
whole-home property, not a feature added to one room. The home is still a
concept; the classification is a design target, not a compliance finding.

### Home F — Solar Studio Stack

Two 20-foot modules stacked with a slight offset. The ground floor holds essential
living and a bathroom; the upper floor is a studio and sleeping space. The shed
roof is solar-ready and the south facade is shaded. The small footprint reduces
ground coverage, but the home adds stairs, structure, a more complex envelope and
a stair-only upper floor.

## Legacy concepts and families

The original nine concepts are **not deleted**. They are migrated to the current
schema and presented as an archive. Where an old concept belongs to a new family
it is linked by intent, but its original id, source JSON and provenance are
preserved:

| Legacy concept | Related family | Treatment |
| --- | --- | --- |
| Woodland Retreat | Woodland Cottage | Archive; still editable |
| Micro Studio | Compact single | Archive; inspiration |
| Lakeside Hideaway | Compact single | Archive; inspiration |
| Forest Courtyard | Courtyard | Archive; inspiration |
| L-Shaped Haven | Courtyard / L | Archive; still editable |
| Open Plan | Parallel pair | Archive; inspiration |
| Woodland Courtyard | Courtyard | Archive; still editable |
| Family Lodge | Large shared home | Archive; inspiration |
| Gathering House | Large shared home | Archive; inspiration |
| Common Lodge | Common lodge | Preserved, not replaced |

The six hamlet-selected homes are new concepts. They are not renames of the old
nine.

## The similarity heuristic

`Model.architectureFeatures()` derives primary features from the geometry:

* storey count
* arrangement
* footprint type
* roof type
* entrance orientation
* circulation type
* approximate proportions

`Model.architecturalSimilarity(a, b)` compares those features and returns a
score from 0 to 1. Colour, cladding and planting are not included. A score of
**0.8 or more** is flagged for inspection. The threshold is a design heuristic,
not an architectural standard.

The six homes produce six unique primary-feature sets and no pair is above the
0.8 threshold. That is evidence of difference, not proof of quality.

Repetition is sometimes correct. Two homes may share a plan to reduce
construction complexity, improve accessibility or keep maintenance predictable.
The comparison therefore **flags** similarity and explains which features match;
it does not force difference.

## Non-goals

* No AI-generated aesthetic score.
* No claim that more variation is always better.
* No claim that a smaller footprint is always more sustainable.
* No claim that one- or two-storey homes are inherently more accessible,
  affordable or environmentally preferable.
