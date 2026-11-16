# Phase 1.3 extension: exterior insulation and living green walls

This extension adds versioned envelope assemblies, explanatory wall sections, four independently supported vegetation systems, summer/winter views, approximate window exposure, and a vegetation guide with evidence and sourcing. It keeps the container as the architectural core and keeps the existing GitHub Pages site static and accessible.

The existing authoritative `data/cabin-a.json` and `data/lodge.json` remain unchanged. The editor remains client-only and never writes to the repository.

## A. Envelope assemblies

Each design now has an `envelope` object with `version`, an assembly type, layers, thermal-break strategy, rainscreen configuration, air/vapour strategy, fire strategy, fastening, penetration and maintenance notes.

Supported assemblies:

| Assembly | Example concepts | Main opportunity | Main caution |
| --- | --- | --- | --- |
| Rigid board | Open Plan | Thin build-up | Joints, fasteners, fire and long-term performance |
| Mineral wool | Woodland Retreat, L-Shaped Haven, Gathering House | Vapour-open, non-combustible fibre | Cavity, cladding and fastener details |
| Wood fibre | Lakeside Hideaway, Family Lodge | Vapour-open, renewable board | Weather protection during construction; fire detailing |
| Exterior closed-cell spray foam | Micro Studio | Continuous, thin layer | UV/fire protection, substrate, thickness, moisture and repairability |
| Hybrid wood fibre + mineral wool | Forest Courtyard, Woodland Courtyard, Common Lodge | Combines vapour-open layers | Layer order, drying and interfaces need review |

The editor generates an explanatory **wall section** from the selected configuration. Numbered layers show the steel shell, air/vapour control, insulation, thermal break, drained/ventilated cavity and cladding, with fasteners passing through the insulation and a vegetation-clearance line. Shared wall sections are generated for each of the five assembly types and appear on the architecture pages.

Warnings cover condensation, fire, moisture, fastening, structural penetrations and maintenance. **No configuration is claimed to be code-compliant or moisture-safe.** Those conclusions require project-specific building-envelope engineering.

The editor updates the wall section, module insulation values, assessment warnings and exported JSON when the assembly, thickness, cavity, thermal-break, air/vapour or fire choice changes.

## B. Vegetation systems

Four reusable systems are recorded:

| System | Example concepts | Independently supported? | Seasonal character |
| --- | --- | --- | --- |
| Freestanding climbing-plant trellis | All concepts | Separate frame/posts | Deciduous or evergreen climber to be selected |
| Modular living wall | Woodland Retreat, Woodland Courtyard, Common Lodge | Galvanised frame on screw piles | Evergreen/persistent modules in the concept |
| Edible herb and perennial planter wall | Woodland Retreat, Forest Courtyard, Common Lodge | Planter frames on footings | Deciduous, dormant in winter |
| Evergreen privacy screen | Micro Studio, L-Shaped Haven, Woodland Courtyard, Gathering House, Common Lodge | Independent posts and root barrier | Evergreen |

Each component records:

- plant type;
- mature height;
- seasonal foliage;
- irrigation needs;
- maintenance assumptions;
- separation from the building envelope;
- support strategy.

Planted structures are held clear of the rainscreen and independently supported wherever practical. The editor blocks systems closer than 300 mm and warns below 450 mm. It also warns when support is not independent, irrigation is unresolved, or the fire/maintenance risk needs review.

## C. Seasonal visualization

- The editor has a visible **Summer / Winter** season control. It changes the exterior view from summer to winter using the same geometry.
- Every architecture page has a **Summer and winter** section with both views and a note that evergreen systems remain visible while deciduous planting is dormant.
- The plan, cutaway and wall section are not season-specific; the plan records the vegetation footprints.
- **Approximate window exposure** is reported by world-facing side (north/east/south/west), taking module rotation into account.
- Shading, screening and maintenance are described qualitatively. There is **no energy saving, daylight factor, privacy score, carbon figure or code claim**.
- The editor shows the same exposure panel under the views.

## D. Architectural gallery

The four systems are distributed across one-, two- and three-container concepts and the common lodge. The [vegetation guide](../site/design-lab/vegetation/index.html) has a matrix, benefits, limitations and open questions, plus the original comparison diagram:

- conventional timber rainscreen;
- planted trellis on an independent frame;
- fully modular living wall with independent modules, frame and irrigation.

The diagram is an original schematic. No supplier diagram, photograph or product design is copied.

## E. Documentation, provenance and evidence

Supplier references:

- [Ecohome — living green wall guides](https://www.ecohome.net/en/guides/query/living+green+wall/)
- [Ecohome — living wall guides](https://www.ecohome.net/en/guides/query/living+wall/)
- [GSky Plant Systems](https://www.gsky.com/) — supplier
- [LiveWall vertical plant wall system](https://livewall.com/products/) — supplier
- [Wallemi living walls](https://wallemi.com/our-products/) — supplier

Building-science and research references:

- [Building Science Corporation — moisture durability with vapour-permeable insulating sheathing](https://buildingscience.com/sites/default/files/migrate/pdf/BA-1313_Moisture%20Durablity%20with%20Vapor%20Permeable%20Insulating%20Sheathing.pdf)
- [RDH — exterior insulation](https://www.rdh.com/wp-content/uploads/2022/12/Exterior-Insulation_2020-05-06.pdf)
- [Green building envelopes — moisture safety in ventilated lightweight envelopes](https://www.sciencedirect.com/science/article/pii/S1876610215019116)

Supplier pages describe proprietary products and performance claims; they are not independent verification. The building-science references describe enclosure principles, not a review of these designs.

### Claims supported by evidence, and claims requiring assessment

| Claim | Status |
| --- | --- |
| Continuous exterior insulation can reduce thermal bridging and keep the steel shell warmer when detailed continuously. | Supported as a general building-science principle; project-specific condensation, fire and structural performance still need review. |
| A drained, ventilated rainscreen can support drying and reduce rain penetration. | Broadly supported as a principle; assembly, climate, exposure and detailing determine actual performance. |
| Vegetation can shade glazing and provide visual screening. | Plausible and visible in the seasonal studies; no energy or privacy score is calculated. |
| Independent supports keep planting loads off the container shell. | Sound design principle where the frame, footings and connections are engineered; the editor does not engineer them. |
| This specific assembly is moisture-safe or code-compliant. | Not supported; requires project-specific building-envelope, fire and code analysis. |
| A living wall saves a stated amount of energy or carbon. | Not supported here; no energy or carbon figure is invented. |
| A privacy screen achieves a privacy score. | Not supported; no privacy score is calculated. |
| The plants will survive and the irrigation will work. | Not established; species, climate, water, maintenance and fire need local review. |

## Solar tilt and azimuth

Roof-mounted solar is now configured per module and drawn as a tilted array. The default is:

- **39° tilt**, due south (**180° azimuth**), year-round fixed. This is within the 36–39° year-round range and matches the SolarCalculator.CA Ottawa report's 39° optimal fixed angle.
- **Winter ≈60°** for the lower winter sun and better snow shedding.
- **Summer ≈30°** for the higher summer sun.
- Face true south within a few degrees; confirm magnetic declination, local shading and roof geometry.

The editor exposes tilt, azimuth and a year-round/winter/summer strategy. Selecting winter or summer sets the tilt preset to 60° or 30°; the user can then fine-tune it. The editor and architecture pages include a **solar section diagram** showing the tilt, azimuth, roof line and snow/wind review note. The exterior and winter views show the tilted array and label `PV 39° / 180°`; the plan adds a solar azimuth/tilt arrow.

Source: [SolarCalculator.CA — Ottawa, Ontario](https://solarcalculator.ca/report/Ontario/Ottawa/). The report is for a 100 kWp fixed system and reports 39° optimal; the brief gives a 36–39° year-round range, winter ≈60° and summer ≈30°. The source notes losses, assumptions and the need for a local installer's site-specific report.

No energy production, snow-shedding, wind-uplift, structural or code performance is calculated. Roof structure, mounting, fire access, rapid shutdown, snow guards and electrical design require professional review.

## F. Validation

| Check | Result |
| --- | --- |
| `node tools/build.mjs --check` | 130 generated files current |
| `node tools/check.mjs` | 246 passed, 0 failed |
| `node tools/check-design-lab.mjs` | 712 passed, 0 failed |
| `node tools/browser-check.mjs` | 79 passed, 0 failed |
| `node tools/design-lab-check.mjs` | 150 passed, 0 failed |
| Main first view | 235 KB uncompressed / 62 KB gzipped |
| Whole published site | 3145 KB (under the revised 3.2 MB budget) |

The whole-site budget was raised from 3.0 MB to 3.2 MB for the seven shareable home pages and the richer roof/solar/trail detail. The main first view remains about 235 KB.

Screenshots: [`screenshots/phase-1.3-envelope-vegetation/`](screenshots/phase-1.3-envelope-vegetation/).

- [Envelope controls](screenshots/phase-1.3-envelope-vegetation/editor-envelope.jpg)
- [Wall section](screenshots/phase-1.3-envelope-vegetation/envelope-wall.jpg)
- [Vegetation controls](screenshots/phase-1.3-envelope-vegetation/editor-vegetation.jpg)
- [Summer/winter and exposure](screenshots/phase-1.3-envelope-vegetation/architecture-seasonal.jpg)
- [Vegetation guide](screenshots/phase-1.3-envelope-vegetation/vegetation-guide.jpg)
- [Rainscreen/trellis/living-wall comparison](screenshots/phase-1.3-envelope-vegetation/vegetation-comparison.jpg)
- [Solar tilt section](screenshots/phase-1.3-envelope-vegetation/solar-section.jpg)

Tests cover:

- envelope configuration persistence in JSON export/import;
- wall-section determinism, accessibility and XML attribute integrity;
- all five assemblies and all four vegetation systems;
- independent support, separation and irrigation warnings;
- summer/winter rendering differences;
- approximate window exposure by world-facing side;
- architecture pages with seasonal pairs, wall section and vegetation notes;
- vegetation guide sources and four system cards;
- 320 px reflow, dark scheme, axe-core and keyboard operation;
- existing models and authoritative data unchanged.

## Deferred

- Editing the Common Lodge and the six inspiration-only homes.
- Direct drag-and-drop manipulation.
- A real hygrothermal, energy, carbon, cost or fire model.
- Structural design of independent frames, footings, planter brackets and privacy-screen posts.
- Plant selection, irrigation design, water testing and maintenance planning.
- Publishing any café, supplier or third-party photograph or diagram.
- Screen-reader and disabled-person testing.

**Do not merge automatically.** The design drawings are concepts; they are not construction documents or permit packages.
