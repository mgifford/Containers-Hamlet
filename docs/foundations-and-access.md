# Foundations, no-compaction and a small footbridge

This extension adds a ground-and-access study to Containers Hamlet: alternatives to a poured foundation, an elevated no-compaction strategy, and a small footbridge concept for a remote part of the land. It is a design study, not an engineered foundation or bridge design.

## Recommendation

For the hamlet, the default is:

- **engineered helical piles** with adjustable brackets under each container;
- an **elevated floor** with 0.6 m nominal clearance;
- **independent decks and porches**;
- **no slab, no fill and no grade change**;
- point loads, matting, root protection and an arborist-reviewed construction sequence;
- geotechnical, structural, frost-uplift, corrosion, lateral, slope, permit and conservation-authority review before anything is built.

This is a design intent. It is not a claim that helical piles are automatically suitable on this site, that the ground is stable, or that a permit will be issued.

## Ontario-appropriate options

| Option | Best use | What it still needs | Evidence status |
| --- | --- | --- | --- |
| Engineered helical piles | Primary house, deck, boardwalk and bridge abutments | Geotechnical investigation, torque/installation records, frost uplift, corrosion, lateral capacity, slope stability, building permit | Established foundation practice; supplier environmental claims are not independent test results. [Techno Metal Post](https://www.technometalpost.com/en-CA/environmental-benefits-of-using-helical-piles/) is a supplier. |
| Ground screws | Light decks, boardwalks, small bridge abutments, signs | Engineered capacity and uplift; not a generic house foundation | Product/supplier claims; engineering required. |
| Concrete piers / sonotubes | Point foundations where concrete is preferred | Bearing, frost depth, uplift, reinforcement, inspection | Conventional practice; still concrete and excavation. Smaller footprint than a slab but not concrete-free. |
| Timber posts on pads | Decks, porches, boardwalk, temporary structures | Rot, uplift, bearing, frost heave; not a primary house foundation in Ontario without engineering | Conventional light-frame detail; site-specific. |
| Bedrock anchors / pins | Shallow, sound bedrock | Geotechnical continuity, anchor capacity, corrosion, waterproofing | Engineering-led; not a generic DIY option. |

A rubble trench, tyre foundation or “no foundation” approach can be appropriate in some natural-building contexts. It is **not** presented here as an Ontario house foundation without geotechnical and code review. The [Natural Building Collective overview](https://www.naturalbuildingcollective.com/from-the-ground-up-approaches-to-building-a-foundation-for-your-natural-building/) is practitioner experience/opinion; it is not an Ontario code approval.

## No compaction and root protection

- **Point loads, not a slab.** Piles or piers carry the house at discrete points; the ground between remains undisturbed.
- **No fill and no grade change.** Do not raise a building pad with imported fill or cut into a slope without an engineered design.
- **Root protection.** Fence the root-protection zone, use matting for access, keep parking and stockpiles away from roots, and have an arborist review the construction sequence.
- **Water.** Keep runoff away from piles and excavations; use silt fencing and erosion control near slopes and wetlands.
- **Elevation.** The 0.6 m default clearance gives ventilation, inspection and snow/water separation. Confirm the actual clearance with the foundation and envelope designers.
- **Independent decks and porches.** Separate structures can move with frost and be repaired without loading the container frame.

Ontario building permits, the Ontario Building Code, conservation-authority regulations, tree bylaws, species-at-risk rules and local site-plan requirements may all apply.

## Footbridge concept

The concept is a **1.2 m wide, 8 m clear-span pedestrian timber footbridge** on two independently founded abutments, with helical piles or engineered ground screws outside the drainage channel. It is not a road bridge and is not designed for vehicles.

- Span the drainage or wet ground rather than filling it.
- Keep abutments outside the ordinary high-water line and root-protection zones where possible.
- Design for pedestrian loads, guards, slip resistance, frost uplift, corrosion and flood/debris.
- Check scour, freeboard and safe shutdown/removal.
- A conservation authority, Fisheries Act review, species-at-risk check and building permit may be required.
- No fill, no compaction and no construction traffic in the channel.

## Sources and evidence

- [Wildlife and Countryside Link — pylon projects and nature](https://www.wcl.org.uk/pylon-projects-what-do-they-mean-for-nature.asp) — UK policy article about routing and smaller ground footprints; **not evidence for a house foundation**.
- [Techno Metal Post — environmental benefits of helical piles](https://www.technometalpost.com/en-CA/environmental-benefits-of-using-helical-piles/) — supplier claims about reduced concrete, minimal disturbance and reuse; not independently verified.
- [Natural Building Collective — foundation approaches](https://www.naturalbuildingcollective.com/from-the-ground-up-approaches-to-building-a-foundation-for-your-natural-building/) — practitioner experience with hard, soft, mixed and clay ground; not an Ontario code approval.
- [Solid Earth Technologies — boardwalk and bridge helical piers](https://solidearthtech.com/helical-pier-installers/environmental-boardwalks-and-bridges/) — supplier examples and claims for wetland boardwalks and pedestrian bridges.
- [Houzz — a house that sits lightly on the earth](https://www.houzz.co.nz/magazine/design-a-house-that-sits-lightly-on-the-earth-stsetivw-vs~45438885) — design inspiration, not engineering.
- [Ontario Building Code, O. Reg. 332/12](https://www.ontario.ca/laws/regulation/120332) — legal framework; foundation design still needs professional review.
- [Conservation Ontario](https://conservationontario.ca/) — conservation-authority permitting; check the local authority.

### What is supported, and what is not

| Claim | Status |
| --- | --- |
| Helical piles can reduce excavation and concrete compared with a full poured foundation. | Generally plausible and supported by foundation practice; the amount and suitability are site-specific. |
| Helical piles are removable/reusable and can be installed with smaller equipment. | Supplier-reported and consistent with the method; installation records and condition determine reuse. |
| Ground screws are suitable for a primary house on this site. | Not established; use only for light structures unless an engineer designs the foundation. |
| Timber posts on pads are adequate for a house in Ontario frost conditions. | Not supported without engineering; best for decks/porches. |
| A concrete pier is concrete-free or low-carbon. | False; it is still concrete, though the volume may be smaller than a slab. |
| A rubble trench or tyre foundation is an Ontario house foundation. | Not supported here; natural-building experience is not a code approval. |
| No compaction protects roots and soil. | A sound principle; it needs a site plan, arborist, matting, erosion control and monitoring. |
| The footbridge is engineered or permitted. | No. It is a concept; engineering, conservation-authority and building permits are required. |

## Licensing

The foundation section, footbridge diagram, page text and concept data are original and licensed **CC BY-SA 4.0**. The application code is **AGPL-3.0-or-later**. No supplier diagram, photograph or product design is copied. See `site/design-lab/THIRD-PARTY-NOTICES.md`.

## Validation

| Check | Result |
| --- | --- |
| `node tools/build.mjs --check` | 130 generated files current |
| `node tools/check.mjs` | 222 passed, 0 failed |
| `node tools/check-design-lab.mjs` | 704 passed, 0 failed |
| `node tools/browser-check.mjs` | 70 passed, 0 failed |
| `node tools/design-lab-check.mjs` | 126 passed, 0 failed |
| Main first view | 381 KB uncompressed / 95 KB gzipped |
| Whole published site | 3074 KB (under 3.2 MB) |

Screenshots: [`screenshots/phase-1.3-envelope-vegetation/`](screenshots/phase-1.3-envelope-vegetation/).

- [Foundation options](screenshots/phase-1.3-envelope-vegetation/ground-options.jpg)
- [Foundation section](screenshots/phase-1.3-envelope-vegetation/foundation-section.jpg)
- [Editor foundation controls](screenshots/phase-1.3-envelope-vegetation/editor-foundation.jpg)
- [Elevated exterior](screenshots/phase-1.3-envelope-vegetation/editor-elevated.jpg)
- [Footbridge](screenshots/phase-1.3-envelope-vegetation/footbridge.jpg)

Tests cover foundation configuration and persistence, elevated-pile rendering, the foundation section, all five options, no-compaction/root-protection content, the bridge diagram and page, 320 px reflow, dark scheme, axe-core, export/import and existing model compatibility.

## Deferred

- Geotechnical investigation, pile design, torque records and frost-uplift calculations.
- Structural design of the container frame, piles, brackets, deck and bridge.
- Arborist report, root-protection plan and construction sequencing.
- Conservation-authority, Fisheries Act, species-at-risk and building-permit review.
- Bridge loads, guards, flood/debris, scour and accessibility verification.
- A real construction cost, carbon or life-cycle comparison.
- Screen-reader and disabled-person testing.

**Do not merge automatically.**
