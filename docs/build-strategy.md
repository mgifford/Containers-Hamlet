# Off-site construction, low-disturbance assembly

1. **Survey before design:** establish boundaries, slope, hydrology, wetlands, protected habitat, shoreline buffers, subsurface conditions, emergency access and applicable law.
2. **Select and inspect reused modules:** check prior cargo history, contamination, corrosion, deformation, structural condition, and repair needs. Avoid unsafe or undocumented coatings.
3. **Design for disassembly:** bolted/reversible connections where feasible, modular service chases, repairable cladding, standard replacement parts and a materials passport.
4. **Fabricate off site:** make and reinforce openings under engineering review, install external envelope, windows, MEP rough-ins and interior fit-out in controlled conditions.
5. **Prepare the site lightly:** engineered pier/screw-pile/other foundation selected for actual soils and frost, utility connections, crane pads and a construction access plan. Piles are not automatically appropriate near wetlands or on rock.
6. **Transport and assemble:** route survey, dimensional/weight permits, lifting points, crane access, weatherproof joints and commissioning.
7. **Restore and monitor:** native planting, erosion control, habitat protection, low-impact paths, dark-sky lighting, seasonal inspections and monitoring.

## Envelope

Prefer continuous external insulation with a designed air/water/vapour control strategy and ventilated rainscreen; avoid simplistic assumptions about condensation on steel. Evaluate wood fibre/mineral wool/reclaimed insulation by performance, moisture tolerance, fire code and embodied carbon. Spray foam may be used selectively for difficult junctions only after considering blowing agents, repairability, fire protection, worker exposure, and end-of-life impacts. No envelope assembly is specified here as code-compliant.

## Green systems

Use native climbing vegetation on independent trellises rather than roots against the steel shell. Green roofs are optional, never assumed: engineer for saturated growing medium, snow, waterproofing, drainage, maintenance, and fire requirements. Keep vegetation and roof features clear of PV and maintenance routes. Solar/wind siting requires measured resources, winter demand, battery safety and backup planning.


## Phase 1.1 additions

The notes below expand the principles above. The parametric model already expresses them, so each one can be seen in the drawings, the explorer and the siting checks. They are directions for professional design, not specifications.

### Off-site fabrication

- Cut and reinforce openings in the workshop under engineering review. The model draws a 60 mm steel frame around every cut opening as a reminder, not as a design.
- Install the external insulation, cavity battens, rainscreen, windows (set in the insulation layer), service chases and interior fit-out before transport. Protect exposed edges for the journey.
- Test airtightness, plumbing and electrical systems at the workshop, and record results in the material passport.
- Keep a module's transport size within routine permit limits wherever possible. External insulation and cladding widen a 2.438 m container to about 2.83 m.

### Crane access and lift planning

- Each building has a crane standing point on the gravel emergency and construction lane (`crane_pad` in `data/site.json`), checked against a placeholder reach of 24 m to the module centre.
- No lifts or slews over the wetland or shoreline buffers; standing points are checked to be outside them.
- Before any clearing: a route survey, dimensional and weight permits, lifting points engineered into the module, ground bearing checks under outriggers, overhead hazards, and a written lift plan by a qualified person.
- Lanes double as fire department access. Width, turnarounds, gradients and winter load capacity must be confirmed with the fire department.

### Low-disturbance foundations

- The model shows helical piles at the corner castings and mid-span (six per module), plus independent piles for porches and trellises. This is a placeholder.
- Choose foundations from a geotechnical investigation: frost depth, bedrock, groundwater, organic soils. Piles are not automatically appropriate near wetlands or on rock, and pinned or ballasted options may suit some locations.
- Piles bear on the steel through the under-floor insulation, which creates thermal bridges to be detailed.
- Keep 300 mm or more of clearance under the soffit for ventilation, inspection and snow. Every 0.1 m of floor height adds 1.5 m of ramp at 1:15, so this is an accessibility trade-off to weigh.

### External insulation, moisture and fire reviews

Review checklist before anything is specified:

1. Air, water and vapour control layers: continuity at openings, roof steps, corners and pile penetrations.
2. Condensation risk on the steel and on fasteners under Canadian winter conditions (hygrothermal modelling).
3. Thermal bridges at piles, lifting points, opening frames and the module-to-hall junctions of the lodge.
4. Combustibility of cladding, insulation and cavities. Cavity fire-stopping. Spatial separation between buildings.
5. Wildland-urban interface risk for a forested site: ember-resistant vents, a non-combustible zone near walls, roof and gutter maintenance.
6. Battery and PV safety: separation, ventilation, clearances and firefighter disconnects. On the lodge, the battery room opens only to the outside.

### Spray foam, only where assessed

Spray foam is not part of the base assembly. It may be considered for difficult junctions only after assessing:

- blowing agent and global warming potential
- fire protection and thermal barrier requirements
- adhesion to the steel and long-term moisture behaviour
- worker and occupant exposure during installation and curing
- repairability and separation at end of life

Record any use in the material passport.

### Solar-friendly green roofs

- The default roof carries a PV array, fitted automatically with edge setbacks: about 4.2 kWp on a cabin, 10.5 kWp on the lodge.
- The "biosolar" alternative adds a 100 mm extensive green roof with a gravel edge and raises the PV above the planting, so the vegetation never shades the panels.
- On the lodge, the taller hall would shade the north module, so that roof gets planting but no PV.
- Never assume a green roof. Engineer it for saturated weight, snow and drift (especially at the lodge's roof steps), drainage, root barriers, waterproofing, maintenance access and fire.

### Independent living-wall trellises

- Trellises stand on their own footings 350 mm from the rainscreen, with posts, rails and native climbers.
- Roots, moisture and maintenance stay off the envelope, and the planting shades the west wall of each cabin and the south wall of the lodge workshop in summer.
- Choose native species that will not damage the rainscreen if they reach it, and keep them clear of vents, PV and roof edges.

### Screened porches

- Every porch is an independent timber frame on its own piles, 20 mm clear of the rainscreen, so it can be repaired or replaced without disturbing the envelope.
- Decks sit at floor level, so each porch is also the landing at the top of a ramp.
- Insect screens enclose the outer sides, with a screen door aligned with the ramp.
- Porch roofs stay below the main roof so they never shade the PV.

### Step-free access

- Ramps are part of the model. Their run is computed from the floor height above grade and the slope ratio (1:15 by default).
- In the current data each entrance needs a 9.6 m ramp, plus landings, edge protection, handrails, a firm slip-resistant surface and drainage.
- The site plan generates a path from each ramp foot to the nearest lane, and the build checks that distance.
- Alternatives such as a graded path or a lower floor should be compared case by case, with their effects on drainage, roots and snow.
- Design to CSA B651 and the applicable building code with an accessibility consultant.
