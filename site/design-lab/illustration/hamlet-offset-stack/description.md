# Offset Stack — illustration reference

Design revision: 2.0.0 · schema containers-hamlet-design/v2.0 · design hash d33d6863

This description is generated from the canonical design model. The reference SVG is the authoritative geometric reference. The illustration prompt is an interpretation.

## Architectural facts
- 2 occupied storeys
- 2 container modules (40ft, 40ft)
- shed roof at 8 degrees
- 59.5 m2 gross floor area
- 36.1 m2 ground coverage
- 7.33 m to the roof

## Modules
- **m1** — storey 1, 12.192 × 2.438 m, base 0.6 m, rotation 0°, timber cladding.
- **m2** — storey 2, 12.192 × 2.438 m, base 3.896 m, rotation 0°, metal cladding. m2 is offset 2.6 m east relative to m1.

## Openings
- m1 / Stair window — north window, 0.9 × 1.2 m, sill 1 m.
- m1 / Living doors — south sliding-door, 2.4 × 2.1 m, sill 0 m.
- m1 / Kitchen window — south window, 1.2 × 1.2 m, sill 1 m.
- m1 / Entry door — east door, 0.95 × 2.1 m, sill 0 m.
- m1 / West window — west window, 1 × 1.2 m, sill 1 m.
- m2 / Bedroom window — north window, 1.4 × 1.3 m, sill 0.9 m.
- m2 / Studio window — south window, 1.6 × 1.4 m, sill 0.8 m.
- m2 / Balcony door — east door, 0.9 × 2.1 m, sill 0 m.
- m2 / Stair window — west window, 0.8 × 1.2 m, sill 1.2 m.

## Rooms and zones
- m1 / Living — living, 0–4.6 m. Ground-floor essential living function.
- m1 / Kitchen — kitchen, 4.6–7.4 m. Ground-floor kitchen; verify clear approach.
- m1 / Bathroom — bathroom, 7.4–9.2 m. Ground-floor bathroom; adaptable layout target.
- m1 / Stair — circulation, 9.2–12 m. Internal stair to the upper floor; not step-free.
- m2 / Sleeping — sleeping, 0–4.2 m. Upper floor reached by stair only.
- m2 / Bathroom — bathroom, 4.2–6.2 m. Upper bathroom; not accessible without a lift.
- m2 / Studio — work, 6.2–10.2 m. Upper studio; stair access only.
- m2 / Storage — storage, 10.2–12 m. Upper storage.

## Outdoor spaces
- p1: 4 × 2.6 m covered porch on the south face of m1.
- p2: 2.4 × 1.4 m covered porch on the south face of m2.

## Site and camera
- Assigned site: Cabin B (site rotation -42°).
- Principal view: A sunlit birch glade and a low rock shoulder, with the forest floor visible beneath the trunks.
- Path approach: south-west
- Camera: exterior three-quarter view, 1.6 m, 35 mm, bearing 173°.

## Interior schedule
- Living (living) — 10.25 m², m1, inferred-from-zone.
- Kitchen (kitchen) — 6.11 m², m1, inferred-from-zone.
- Bathroom (bathroom) — 3.81 m², m1, inferred-from-zone.
- Stair (circulation) — 6.11 m², m1, inferred-from-zone.
- Sleeping (sleeping) — 9.33 m², m2, inferred-from-zone.
- Bathroom (bathroom) — 4.27 m², m2, inferred-from-zone.
- Studio (work) — 8.87 m², m2, inferred-from-zone.
- Storage (storage) — 3.81 m², m2, inferred-from-zone.
- Partitions: 0 · doors: 0 · fixtures: 0.
- Validation: 0 invalid, 10 unresolved, 8 review.

## Intentions
- Step-free entrance is a design intent, not a verified measurement.
- Adaptable bathroom is a design intent, not a verified layout.
- Adaptable kitchen is a design intent, not a verified layout.

## Unresolved matters
- **interior-partitions**: Rooms are longitudinal zones. Partitions, fixtures, door swings and interior camera geometry are not modeled. Do not claim a spatially accurate interior perspective.
- **unmodeled-balcony**: The upper east door is not accompanied by a modeled balcony, porch or deck on the same face. Do not draw an accessible balcony; guarding, support and egress are unresolved.
- **balcony-access**: The upper porch p2 has no recorded door on the same south face. Do not show it as an accessible balcony; access is unresolved.
- **site-approach**: The site path approach is south-west while the design entrance is east. The generated prompt does not call any side the main approach without qualification.
- **provisional-interior**: Interior geometry is provisional. Partitions, doors and fixtures may be incomplete.
- **inferred-room**: Room room-m1-m1-z1 is inferred from a zone band, not an authored layout.
- **inferred-room**: Room room-m1-m1-z2 is inferred from a zone band, not an authored layout.
- **inferred-room**: Room room-m1-m1-z3 is inferred from a zone band, not an authored layout.
- **inferred-room**: Room room-m1-m1-z4 is inferred from a zone band, not an authored layout.
- **inferred-room**: Room room-m2-m2-z1 is inferred from a zone band, not an authored layout.
- **inferred-room**: Room room-m2-m2-z2 is inferred from a zone band, not an authored layout.
- **inferred-room**: Room room-m2-m2-z3 is inferred from a zone band, not an authored layout.
- **inferred-room**: Room room-m2-m2-z4 is inferred from a zone band, not an authored layout.
- **doors-missing**: No interior doors are modeled. Room connectivity cannot be assessed.

## Capability notes
- Exterior reference: available
- Interior perspective: not available — no interior camera or perspective renderer is implemented
- Room-zone plan: available
- Roof plan: available

## Licence and status
Concept only. Not engineered, permit-ready or professionally reviewed. Code AGPL-3.0-or-later; original content CC BY-SA 4.0.
