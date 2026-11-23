# Concept visualisation v2 brief

The v1 images are published at `/design-lab/visualisations/` as placeholders.
They are useful for mood, massing and material direction. They are **not**
model-verified records and must not be used for construction, accessibility or
service design.

This brief defines what v2 must show before an image can be labelled as a
selected-home visualisation. The per-image descriptions that implement this
brief are in [`image-descriptions.md`](image-descriptions.md).

## What v1 gets right

- Woodland/rock setting and warm interior light.
- A believable long, narrow single-storey cabin proportion.
- A generous covered porch, ramp and guardrail in the exterior.
- Timber interior, compact kitchen, wood stove and a strong visual link to the
  forest.
- A useful first impression for people who cannot read an SVG plan.

## What v1 is missing

### Ventilation and airflow

The images show a sealed wood box with a stove. They do not show the ventilation
system described in [`passive-ventilation.md`](passive-ventilation.md) and
[`multi-container-services.md`](multi-container-services.md).

Required, and visible or clearly accessible:

- two **200 mm insulated wall sleeves** at opposite ends;
- low fresh-air intake at about **0.40 m** and a high exhaust;
- compact **HRV/ERV**, 15–25 L/s, frost control, accessible filter and condensate
  drain;
- low/high **transfer grilles** in the bedroom partition;
- bathroom door undercut or transfer grille;
- dedicated bathroom exhaust with humidity sensor and backdraft damper;
- **ducted** kitchen hood with grease filter and makeup air;
- a **75 mm dedicated stove OAK**, separate from the ventilation intake;
- CO and smoke alarms in the sleeping zone and near the stove.

A recirculating microwave is not a moisture solution. If gas is used, the gas
supply, shutoff, CO alarm and makeup air must be shown. Otherwise specify
induction.

### Combustion and wood heat

- Insulated exterior chimney above the roof with the required clearance.
- Ceiling support box/thimble, spark-arresting cap.
- Non-combustible hearth and wall shield.
- Firewood stored outside the required clearance.
- Clearance from the stove to the wood-lined wall and furniture.

### Service core

The following cannot be made to disappear:

- meter, main disconnect and panel, or a labelled off-grid service;
- inverter/charger and battery, with fire separation and ventilation;
- water heater/heat-pump water heater with drain and TPR;
- heat-pump outdoor unit, snow stand and condensate;
- plumbing supply, drain/waste/vent, shutoffs and cleanouts;
- dryer vent if laundry is present;
- solar conduit, rapid shutdown and flashed roof penetrations;
- access panels or louvred doors for every concealed service.

### Kitchen and bathroom

- Ducted hood, grease filter, makeup air and a clear work zone.
- Accessible bathroom with 1.5 m turning circle, 0.9 m door, grab-bar blocking,
  curbless shower or documented transfer, and exhaust.
- 1.2 m accessible route clear of the sofa, table and kitchen counters.

### Envelope, water, fire and snow

- Gutters and downspouts, leaf guards, first-flush diverter and a cistern with level gauge, freeze protection and overflow to a rain garden/swale.
- A **separate** fire reserve with a tested fire-service connection; never present a single rain barrel as the system or as fire water.
- Non-potable rainwater labelled as such unless treatment and testing are modelled.
- Ember-resistant foundation/roof vents and a non-combustible edge.
- Metal roof snow guards above the entry/porch.
- Firewood, propane and battery storage separated from the sleeping zone and the porch.
- Noncombustible deck/porch or an explicit unresolved note; no combustible storage under the floor.
- Building separation, fire-rated assemblies and protected egress only where modelled; no "fireproof" claim.
- Pile caps, rock anchors and cross-bracing that read as structural, not decorative.

### Container expression

The house currently reads as a conventional timber cabin. At least one of these
must be visible:

- corner casting;
- module joint/reveal;
- lifting point;
- exposed steel frame at the porch or roof;
- container corrugation at a protected edge.

The timber rainscreen can remain, but it must not erase the container identity.

## Version 2 completion criteria

An image set is complete only when:

1. It is generated from the canonical scene/model with matching modules, storeys,
   openings, roof, porch, foundation and camera.
2. Exterior and interior views agree on sun, time, materials and geometry.
3. The required ventilation and service terminals are shown or clearly accessible.
4. The stove has a chimney, OAK, hearth and clearance.
5. The kitchen has a ducted hood and a documented cooking fuel.
6. The accessible home shows the bathroom and 1.2 m route.
7. The container detail is visible.
8. The caption states the scene hash, review status and known limitations.
9. A human has checked the image against the model.
10. It is labelled **illustrative interpretation**, not a construction drawing.

## Per-home visual direction

Do not clone the v1 cabin for the other selected homes. The current set is:

| Home | Storeys | Visual identity | Must not be flattened into |
| --- | --- | --- | --- |
| Woodland Cottage | 1 | Single 40 ft, gable 24°, south porch, accessible | A generic long cabin with no accessible entrance/bathroom |
| Offset Stack | 2 | Two 40 ft, upper offset 2.6 m, shed 8°, stair | A single-storey cabin with no upper volume or stair |
| Courtyard Residence | 1 | Two 40 ft L, flat/green roof, courtyard link | A linear cabin with no courtyard |
| Cross-Stacked Retreat | 2 | Two 40 ft perpendicular, butterfly 12°, stair | A simple gable cabin; no invented balcony where only a door is modeled |
| Accessible Garden Home | 1 | Two 20 ft double-width, canopy, 3.0 m accessible bathroom | A narrow single-module layout |
| Solar Studio Stack | 2 | Two 20 ft aligned/offset, solar-ready shed 12°, compact stair | A wide cabin or a single-storey bungalow |

The two accessible demonstrations are **Woodland Cottage** and **Accessible
Garden Home**. The other four are ordinary concept homes; their bathrooms are not
held to accessible clearances.

## Prompt structure

Add a structured `services` block to the scene specification:

```json
{
  "ventilation": {
    "strategy": "HRV",
    "intake": { "face": "west", "height_m": 0.4, "diameter_mm": 200 },
    "exhaust": { "face": "east", "height_m": 2.0, "diameter_mm": 200 },
    "transferGrilles": ["bedroom-low", "bedroom-high", "bathroom-undercut"]
  },
  "combustion": {
    "stove": true,
    "chimney": true,
    "oak_mm": 75,
    "co_alarm": true
  },
  "kitchen": { "hood": "ducted", "fuel": "induction" },
  "bathroom": { "exhaust": true, "turningCircle_m": 1.5 },
  "electrical": ["meter", "panel", "inverter", "battery", "rapid-shutdown"],
  "water": ["heat-pump-water-heater", "plumbing-vent", "cleanout"]
}
```

The prompt generator should turn each item into a visible requirement for the
named view. The negative prompt should reject unvented stoves, recirculating
hoods, missing service cores, missing accessible bathrooms, missing chimney/OAK
and invented windows/doors/lofts.

## Publication rule

Do not replace a selected-home drawing with a generative image. Keep the
canonical SVG drawings and scene specification primary. Publish v2 images only
with a caption, scene hash and review status; keep v1 placeholders clearly
labelled until then.
