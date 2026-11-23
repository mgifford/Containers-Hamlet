# Fire and water services layer

## Status

The Design Lab now records a **conceptual water system** for each selected home and
exposes it, together with the existing fire-resilience intent, in the illustration
scene and architecture pages. This is not a water or fire design.

Every selected home currently records:

- `water.schema: "containers-hamlet-water/v1"`;
- `water.status: "conceptual"`;
- a metal roof catchment with gutters, leaf guards and first flush **required**;
- a cistern type with **no volume or location resolved**;
- non-potable treatment with filtration required, disinfection/testing not designed;
- a **separate** fire reserve with no volume, connection or verification;
- demand status `not-evaluated`;
- `fire.water_access: false`;
- `fire.noncombustible_deck: false`;
- 10 m defensible space as a concept only.

## What is not designed

- Tank/cistern sizing, location, structural support, freeze protection or access.
- Rainwater yield, dry-season reliability or overflow design.
- Potable-water treatment, testing, cross-connection control or approval.
- Fire-reserve volume, fire-service connection, hydrant/cistern flow or access.
- Building-to-building separation and fire-resistance-rated assemblies.
- Inter-storey/inter-module fire separation, protected egress and cavity barriers.
- Lodge assembly-occupancy egress, commercial cooking suppression or fire alarm.
- WUI compliance, insurance acceptability or fire-engineering approval.

## Why the existing images are insufficient

The v1 exterior shows a single rain barrel and a wood deck. That is not a system:

- a rain barrel is tiny compared with domestic demand and fire-service needs;
- no first-flush diverter, filtration, overflow, freeze protection or level gauge is visible;
- no separate fire reserve or tested fire connection is shown;
- no building separation or fire barrier is modelled;
- the wood deck and firewood storage are unresolved fire risks.

The images must not imply that a barrel, hydrant or “steel hull” makes the home
fire-safe or water-independent.

## Prompt rules

When `scene.services` exists, the generated prompt states:

- the fire intent but **not** a fire-resistance rating;
- fire-water access is not confirmed;
- the rainwater system is conceptual and non-potable;
- the fire reserve is separate and unverified;
- a single rain barrel is not a complete system;
- no confirmed hydrant, cistern, potable supply or fire barrier may be invented.

The negative prompt rejects decorative rain barrels, unverified hydrants,
combustible decks presented as noncombustible, missing chimney/OAK and missing
fire separation.

## Visual checklist for version 2

- Gutters, downspouts, leaf guards and first-flush diverter.
- Tank/cistern with level gauge, lockable access and overflow to a rain garden/swale.
- Freeze protection and winter drain.
- Non-potable labelling; no drinking-water claim.
- Separate fire cistern/dry hydrant with fire-service access and testing status.
- Noncombustible deck/porch or explicit unresolved note.
- No firewood on the porch or under the floor.
- 0–1.5 m noncombustible zone, 1.5–10 m reduced fuel, 10–30 m managed forest.
- Building separation and fire-rated assemblies shown only where modelled.
- Address sign, access width/turnaround and water connection.
- No “fireproof” or “water-independent” claim.

## Open decisions

1. Tank location and size for each home; indoor, outdoor or buried.
2. Whether any home uses rainwater for potable supply; if so, treatment/testing.
3. Fire reserve volume/connection and who maintains it.
4. Noncombustible deck/porch strategy for all six homes.
5. Building separation and fire-rated wall/opening strategy for the two-storey
   and linked homes.
6. Lodge assembly egress/fire separation and commercial cooking strategy.
7. Winter access, snow clearing and freeze protection responsibilities.

## Related

- [`fire-resilience.md`](fire-resilience.md)
- [`resilience-water.md`](resilience-water.md)
- [`visualisation-v2-brief.md`](visualisation-v2-brief.md)
- `/design-lab/fire/`
- `/design-lab/water/`
