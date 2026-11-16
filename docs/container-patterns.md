# Container patterns, paint and doors as shelter

This extension adds a precedent-led guide to container configurations, paint and reused door leaves. It is a design reference, not a construction manual, a security specification or a claim that any precedent is suitable for Ontario.

## What was added

- A **pattern guide** at `/design-lab/patterns/` covering six configurations, paint palettes, doors as canopy/shutters/privacy screens, and a security checklist.
- An original **configuration diagram** (`systems/container-patterns.svg`) — no stock or project photograph is copied.
- An editable **paint palette** and **entry shelter** layer in the Design Lab editor.
- A **Micro Studio** example with a green body, ochre trim, a shallow reused-door canopy and open security shutters. It is a design study, not a product specification.

## Configurations

| Pattern | What it can buy | What it still needs |
| --- | --- | --- |
| Single container + entry shelter | A dry, legible entry; a small wind lobby; a place for a lockable shutter. | Hinge and wind design, snow shedding, door swing, egress, fire separation, paint touch-up. |
| Staggered pair / dogtrot | Cross-ventilation, a covered outdoor gap, a clear front door and a social edge. | Structural connections, roof drainage at the gap, snow drift, fire separation, privacy and maintenance access. |
| L-shape / courtyard | A sheltered court, a clear entry and a defended outdoor room without a fortress wall. | Setbacks, glazing and shading, drainage, root protection and a door visible from the approach. |
| Stacked pair | A smaller footprint and a two-level home or guest space. | Part 4 structural design, foundation, load transfer, wind uplift, fire separation, stairs, guards and egress. |
| Cantilever | A dramatic overhang, a sheltered below-space and a lighter footprint. | Engineer the overturning path, back-span, connection, foundation, wind uplift, snow and services. Do not copy a photograph. |
| Secure entry porch | One visible, lit threshold; a place for shutters, a parcel box and a lockable outer door. | Two ways out, breakable/lockable hardware, visibility, fire, accessibility and a lock strategy that works for all residents. |

The Design Lab models the **entry shelter and open door-leaf shutters** as a configurable add-on and paint as a design choice. It does **not** model a cantilever or a stacked structure as buildable geometry; those remain structural studies.

## Doors as shelter and security

Container doors are heavy steel leaves. Three uses should not be conflated:

- **Canopy:** a leaf held above the entry, with engineered hinges, stays and a wind/snow release strategy. It must not block the door swing or egress.
- **Open shutters:** leaves hinged beside glazing and held open in normal use. In a storm they close over the opening. They need a positive hold-open, controlled closing, and a way to open from inside.
- **Privacy screen:** a fixed or sliding leaf beside a porch. It can shade and screen without pretending to be a security door.

Security is layered, not guaranteed. Useful moves are a **visible entry**, a lit approach, a lockable outer shutter, laminated or toughened glazing, reinforced strike plates, and neighbours or paths with sightlines. A solid shutter can also hide an intruder, block a rescuer or trap an occupant. Every bedroom needs a viable escape route; security hardware must not override it.

## Paint

The guide includes five sample palettes: forest/ochre, charcoal/cedar, oxide/cream, chalk/black and marine/sand. They are visual intents only. For steel containers, specify surface preparation, a compatible primer and a topcoat for the exposure. Keep the entry trim distinct from the body, paint door edges and frames, and do not paint over hinges, locks, seals, data plates or inspection marks. Dark bodies can gain heat; light bodies can glare; all colours need a maintenance and touch-up plan.

## Precedents

- [Dornob — Containers of Hope](https://dornob.com/containers-of-hope-cheap-modern-cargo-container-home/): two staggered containers, raised on stilts, tilted roof, cross-ventilation, low-cost approach. Costa Rica, not Ontario.
- [Discover Containers — Utah cantilevered container house](https://www.discovercontainers.com/projects/utah-cantilevered-container-house/): cantilever precedent; the photograph is not a structural drawing.
- [Instructables — Tiny Shipping Container Home](https://www.instructables.com/Tiny-Shipping-Container-Home/): DIY sequence and small-space thinking; not a code or engineering source.
- [Homesteading — cool container homes](https://homesteading.com/cool-container-homes/) and [Morning Chores — shipping container homes](https://morningchores.com/shipping-container-homes/): image-led collections; dimensions, costs and construction claims are unverified.
- [Houzz — shipping-container house photos](https://www.houzz.com/photos/query/shipping-container-houses) and [Adobe Stock — container interiors](https://stock.adobe.com/ca/search?k=shipping+container+house+interior): visual references only; no image is copied.

These sources inspired the patterns and questions. They are not evidence that a configuration is lawful, safe, affordable, secure or suitable for a Canadian climate.

## What is supported

| Claim | Status |
| --- | --- |
| Reusing container doors can make a canopy or shutters. | Possible, but hinges, wind, snow, fire, egress and locks need engineering. A door is not a canopy by default. |
| A shallow entry canopy improves weather protection. | Plausible; it must be designed and maintained, and must not block escape or door swing. |
| Paint protects steel and improves legibility. | A paint system can protect and improve visibility; preparation, primer, topcoat and maintenance determine performance. |
| A dark body is always better/worse. | Neither; heat gain, glare, fading and context need review. |
| A shutter or lock makes a home secure. | No. Security is layered and site-specific; hardware can fail or trap occupants. |
| A cantilever is a style choice. | It is a structural design with overturning, back-span, connection and foundation consequences. |
| A stacked container is just two boxes. | It needs Part 4 engineering, foundation, load path, wind uplift, fire separation, stairs and egress. |

## Validation

| Check | Result |
| --- | --- |
| `node tools/build.mjs --check` | 165 generated files current |
| `node tools/check.mjs` | 249 passed, 0 failed |
| `node tools/check-design-lab.mjs` | 717 passed, 0 failed |
| `node tools/browser-check.mjs` | 84 passed, 0 failed |
| `node tools/design-lab-check.mjs` | 163 passed, 0 failed |
| Main first view | 238 KB uncompressed / 62 KB gzipped |
| Whole published site | 3177 KB (under 3.2 MB) |

Browser checks cover the pattern guide at 320 px and in dark mode, the configuration image, source links, editor paint/shelter persistence, export/import and axe-core.

## Screenshots

- [Pattern guide](screenshots/phase-1.3-envelope-vegetation/patterns-guide.jpg)
- [Doors and security](screenshots/phase-1.3-envelope-vegetation/patterns-doors.jpg)
- [Editor paint and shelter controls](screenshots/phase-1.3-envelope-vegetation/editor-patterns.jpg)
- [Micro Studio shelter](screenshots/phase-1.3-envelope-vegetation/micro-shelter.jpg)

## Deferred

- Structural design for stacking or cantilever; foundation and wind-uplift calculations.
- Hinge, shutter, wind/snow release and lock specification.
- Fire, egress and accessibility review with the building official.
- Paint manufacturer system, surface preparation and trial panels.
- Security assessment with the actual residents and local police/crime-prevention practitioner.
- Real product costs and maintenance intervals.
- Screen-reader and disabled-person testing.

**Do not merge automatically.**
