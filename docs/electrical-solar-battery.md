# Electrical, PV and battery architecture for Cabin A

**Status:** Design Lab study. Not a construction drawing, electrical design,
engineering stamp or permit package. The service, PV array, battery, bonding and
penetrations must be designed and inspected by a licensed electrical contractor /
Professional Engineer and the electrical safety authority (ESA in Ontario), under
the Canadian Electrical Code edition adopted in the province.

**Building:** Cabin A, one 40-foot high-cube container, 26.7 m² clear, about 76 m³.
The authoritative geometry and openings are in `data/cabin-a.json`. This document
does not change that file.

## 1. Design intent

The cabin needs a small, repairable, off-grid-friendly electrical system that:

- keeps **120 V AC** for ordinary appliances and receptacles;
- keeps a **24 V DC** backbone for lighting, ventilation, sensors, USB-C and
  controls, so the inverter can be off at night or when the cabin is empty;
- routes all wiring through **accessible interior steel conduit**, never through
  the earth-bermed or exterior-insulated envelope;
- places the battery where it can be kept above 0 °C without wasting interior
  space or creating a fire/egress problem;
- limits exterior penetrations to one above-grade, downward-sloped PV entry;
- bonds the steel shell, PV racking and equipment to one grounding system.

This is a **hybrid AC/DC** design. It is not a grid-tied service; if the cabin is
grid-connected, the utility service, metering and transfer equipment are a
separate design. Lighting, timers, cameras, blind spots and privacy are detailed
in [`lighting-cameras-security.md`](lighting-cameras-security.md).

## 2. Recommended architecture

### 2.1 Voltages

Use a **24 V DC nominal** battery bus, not 12 V, for a cabin with a 2–3 kW
inverter. At 2 kW, 24 V draws about 83 A instead of 167 A at 12 V; the cables,
fuses and voltage drop are much easier to manage. Keep a small **24 V → 12 V DC-DC
converter** for 12 V fans, sensors or legacy devices.

| Bus | Use |
| --- | --- |
| 24 V DC nominal (LiFePO₄, 25.6 V) | Battery, MPPT, inverter, main DC loads |
| 12 V DC | Small fans, sensors, USB-C ports, legacy devices, via a fused DC-DC converter |
| 120 V AC | Kitchen counter, fridge, induction burner, kettle, general receptacles, bathroom GFCI, optional 120 V tools |
| 240 V AC | Only if a larger appliance or a future grid connection requires it; not assumed for Cabin A |

### 2.2 Block diagram

```text
ROOF PV ARRAY (2.7-3.6 kWp at 450 W; 6-8 modules)
   |
   |  PV string conductors in surface raceway
   v
[DC combiner / rapid shutdown] --- [PV disconnect] --- [SPD]
   |
   v
[MPPT charge controller]  <---- temperature sensor at battery
   |
   v
[24 V DC bus] --- [main DC fuse/disconnect] --- [DC fuse block]
   |                                                   |
   |                                                   +--> 24 V LED lighting
   |                                                   +--> ventilation fans / controller
   |                                                   +--> smoke/CO, sensors
   |                                                   +--> 24 V->12 V converter -> USB-C
   |
   +--> [battery disconnect] --> [LiFePO4 battery bank, 5-15 kWh]
   |                                   |
   |                                   +--> [self-heating / low-temp charge cutoff]
   |
   +--> [inverter/charger, 2-3 kW pure sine]
                 |
                 v
          [120 V AC sub-panel]
                 |
                 +--> kitchen counter GFCI
                 +--> bathroom GFCI
                 +--> general receptacles (AFCI/GFCI as required)
                 +--> fridge / induction / kettle
                 +--> future 240 V (only if designed)

GROUNDING: PV rack + steel shell + battery enclosure + inverter + AC panel
           -> equipment bonding bus -> grounding electrode system
```

### 2.3 Equipment sizes

| Item | Concept range | Notes |
| --- | --- | --- |
| PV array | **2.7–3.6 kWp at 450 W** (3.3–4.4 kWp at 550 W) | 6–8 modules; at 450 W, 6 panels = 2.7 kWp and 8 = 3.6 kWp. The earlier 3.5–4.5 kWp line applies only to 550–580 W modules. Confirm roof area, chimney/PV clearance, snow and wind uplift. |
| MPPT | **60–100 A** at 24 V | Sized for array Isc and cold-temperature Voc; use a listed controller with battery temperature compensation |
| Battery | **5–15 kWh LiFePO₄** | 5–10 kWh for essential loads; 10–15 kWh for full-time off-grid winter use; run a load calculation |
| Inverter/charger | **2–3 kW pure sine** | 24 V input; 120 V output; surge for a fridge/induction; low idle draw |
| AC sub-panel | **8–12 circuits** | AFCI/GFCI as required; main breaker and a clearly labelled `PV / BATTERY / INVERTER` disconnect group |
| DC fuse block | **6–8 fused circuits** | Marine-grade, accessible, labelled; separate 24 V and 12 V sections |

At **450 W**, the module-count arithmetic is:

- 6 panels = **2.7 kWp**
- 8 panels = **3.6 kWp**
- 10 panels = **4.5 kWp**
- 12 panels = **5.4 kWp**
- 14 panels = **6.3 kWp**
- 16 panels = **7.2 kWp**

Do not size the battery from floor area. Use a load table: fridge, induction,
kettle, lights, fans, pumps, tools, devices and a 2–3 day autonomy target. A
wood-heated cabin can use less energy than an all-electric one, but a 5 kWh
battery will not run an induction burner and a fridge through a cloudy week.

### 2.4 Residential allocation for the six selected homes

The Design Lab now carries a separate per-home energy model. These are the
canonical residential allocations; they do not change the Cabin A geometry or
the authoritative `data/cabin-a.json` model.

| Residence | Panels | kWp at 450 W | Battery nominal | Intended occupancy |
|---|---:|---:|---:|---|
| Woodland Cottage | 8 | 3.6 | 10 kWh | Seasonal, intermittent winter |
| Offset Stack | 10 | 4.5 | 15 kWh | Three-season, frequent winter weekends |
| Courtyard Residence | 12 | 5.4 | 18 kWh | Three-season with guests |
| Cross-Stacked Retreat | 16 | 7.2 | 24 kWh | Full-time family |
| Accessible Garden Home | 12 | 5.4 | 18 kWh | Full-time, step-free |
| Solar Studio Stack | 10 | 4.5 | 12 kWh | Full-time single person |

The six reference systems total **68 panels, 30.6 kWp and 136 m²** of module
surface. Sixteen panels is the upper end of the initial residential range, not
a target. The arrays are not derived from floor area; they are tested against
occupancy, loads, roof geometry, shading and winter autonomy. The full method,
load lists and monthly estimates are in
[`residential-energy-model.md`](residential-energy-model.md).

**Heat pumps are excluded from these baseline arrays.** Full-time electric
heating would require a much larger array and battery; see
[`heat-pump-energy-assessment.md`](heat-pump-energy-assessment.md). The
reference arrays support ordinary household services and a non-electric heating
path, not full-time resistance or heat-pump heating through a Canadian winter.

## 3. AC/DC separation and the service core

### 3.1 Service core

Put the AC panel, DC fuse block, MPPT, inverter/charger, shunts, disconnects and
labels in one **accessible, ventilated service tower** at the kitchenette/bathroom
end. Do not scatter them through the cabin.

- **Location:** high cabinet on the south wall at approximately **x = 8.9–9.5 m**,
  **1.70–2.50 m above the floor**, 600 mm wide × 900 mm high × 250 mm deep.
  This is at the kitchenette/bathroom transition, clear of W4 (which ends at
  8.7 m) and clear of the stove bay on the north wall.
- **Access:** a hinged, removable front door; a 900 mm clear work zone in front;
  no ladder-only access for the main disconnect. A stool is acceptable for the
  upper indicators, not for the main breaker.
- **Ventilation:** high and low louvres into the room, with a small thermostatic
  fan if the inverter/MPPT compartment exceeds 30 °C. Do not seal electronics in
  a closed cupboard.
- **Heat separation:** keep the service tower at least **1.0 m** from the stove
  and flue, and never inside the masonry air gap. Use a mineral-wool-lined
  partition if the cabinet is closer than the appliance listing allows.
- **Labelling:** a single-line diagram inside the door; each circuit named;
  `PV DC`, `BATTERY`, `INVERTER`, `AC MAINS` and `GROUND` identified.

### 3.2 Battery bay

Put the battery low, near the service tower, in a **sealed, insulated, fire-rated
bay** at approximately **x = 8.9–9.5 m**, **0.20–0.85 m above the floor**. A
600 mm wide × 600 mm deep × 650 mm high bay gives about 0.23 m³, enough for a
5–10 kWh pack and its clearances. This is under the kitchen counter/bench, not
under the bed.

- **Why not under the bed:** fire load, egress, access, lifting and the difficulty
  of keeping the enclosure sealed and ventilated. Under-bed storage is possible
  only with a listed enclosure, a fire separation and a documented review; it is
  not the default.
- **Access:** removable front panel, no tools for the isolation switch, a clear
  path for lifting the pack.
- **Ventilation:** a small passive vent to the exterior through a **6 mm stainless
  screen**, plus a sealed cable gland. LiFePO₄ does not vent like lead-acid, but
  the enclosure must follow the battery manufacturer’s requirements and the CEC
  ESS rules.
- **Fire:** line the bay with 12 mm cement board or a listed fire-rated board;
  keep it away from the only egress path; install a smoke/heat alarm above it.
- **Thermal:** insulate the bay on the exterior/floor sides; keep it inside the
  conditioned envelope. Do not put it against an exterior steel wall without a
  thermal break.

### 3.3 AC/DC separation

- Run **two separate 3/4-inch (21 mm) EMT raceways** in the ceiling cove: one
  marked **120 V AC**, one marked **24 V DC / DATA**.
- Do not share a box between AC and DC unless it has a listed barrier. Keep the
  separation required by the CEC for the circuit class and voltage.
- Use separate colours/labels at every pull box: red for AC, blue for DC, yellow
  for data.
- Keep DC and AC conduits at least the CEC-required separation; where they cross,
  cross at 90° and use a listed barrier/sleeve.
- Do not run AC and DC in the same conduit “for future capacity.” That is a
  code and troubleshooting problem, not a space saving.

### 3.4 Resident circuit and receptacle schedule

The original electrical brief was too thin on everyday use. The kitchen needs
more than one general circuit, the living area needs receptacles where people
actually sit, and both sides of the bed need charging without a power bar on the
floor.

#### 120 V AC circuits

| Circuit | Load | Protection | Notes |
| --- | --- | --- | --- |
| AC-1 | Kitchen counter, west of sink | 20 A GFCI | Small appliances, kettle, coffee |
| AC-2 | Kitchen counter, east of sink | 20 A GFCI | Split from AC-1 so two appliances can run |
| AC-3 | Fridge | 15–20 A dedicated | Do not share with counter; allow a low-temperature fridge |
| AC-4 | Induction or kettle | 20 A dedicated, load-managed | A portable 120 V induction can draw ~1.8 kW; interlock with AC-1/AC-2 to avoid inverter overload |
| AC-5 | Living general receptacles | 20 A AFCI/GFCI | Sofa, desk, lamp, media; split among two or three locations |
| AC-6 | Sleeping receptacles, both sides of bed | 20 A AFCI | One 120 V and one USB-C PD outlet each side, above nightstand height |
| AC-7 | Bathroom | 20 A GFCI | Vanity, shaver, small appliance; not the only bathroom circuit if a washer is added |
| AC-8 | Exterior porch and entry | 20 A GFCI, weatherproof | For tools, a grill, or a temporary light; in-use covers |
| AC-9 | Spare / future | 20 A | Leave a labelled spare breaker and a pull string to the service tower |

A 2 kW inverter cannot run an induction burner, a kettle and a fridge at the same
time. Use a **priority/load-shedding panel** or a clearly labelled operator card:
the high-draw kitchen circuits are interlocked so only one runs at a time. If
full electric cooking is a requirement, size the inverter and battery for it, or
use a 240 V range on a separate service.

#### 24 V DC circuits

| Circuit | Load | Protection | Notes |
| --- | --- | --- | --- |
| DC-1 | Interior lighting | 5 A | Warm 2700–3000 K dimmable LED; see [`lighting-cameras-security.md`](lighting-cameras-security.md) |
| DC-2 | Exterior lighting | 5 A | Porch, entry, path, step and service-tower lights; timer/motion |
| DC-3 | Ventilation fans/controller | 3 A | 2–4 W fans, dew-point controller |
| DC-4 | Cameras/NVR or PoE injector | 10 A | Local-only recording; see the companion lighting/camera doc |
| DC-5 | Smoke/CO, temperature, water sensors | 2 A | Keep on a separately fused always-on branch |
| DC-6 | USB-C charging | 10 A | 24 V→USB-PD modules at bed and sofa; no floor power bars |
| DC-7 | 24 V→12 V converter | 10 A | For 12 V fans, sensors or legacy devices |

Keep smoke/CO and the low-temperature battery sensor on an **always-on** DC
branch that cannot be switched off by the lighting master. The inverter can be
off while these circuits remain live.

## 4. Interior conduit routing

The rule is: **no wiring in the exterior insulation, rainscreen or earth-bermed
wall.** All distribution is inside the steel shell, in accessible steel conduit.

### 4.1 Ceiling cove

- Two parallel 3/4-inch EMT conduits in the **high-ceiling cove**, at about
  **2.55 m above the floor**, behind a removable timber cove trim.
- Run along the south wall from the service tower to the west end, then cross to
  the north wall at the sleeping end. The cove is above the window and door
  heads (2.15 m), so it does not cut a header.
- Use **4-inch (100 mm) removable cove trim**; do not bury the conduit behind
  fixed drywall or spray foam.
- Support the conduit every 1.5 m and within 300 mm of each box.

### 4.2 Toe-kick and partition drops

- Run a 3/4-inch EMT branch in the **kitchen toe-kick** (150 mm high, 75 mm deep,
  removable kickboard) for the counter receptacles, fridge and future dishwasher.
- Run vertical drops in the **interior partitions** at x = 3.2 m (sleeping/living)
  and x = 9.75 m (kitchen/bath), not in the exterior long walls.
- Surface-mount the final drops in a timber chase or a painted EMT; do not cut the
  exterior insulation.
- Keep the conduit at least **300 mm** from the flue and outside the stove’s
  required clearance. Never route through the masonry air gap.

### 4.3 Pull boxes and bends

- Install accessible **4 × 4 inch (100 × 100 mm) pull boxes** at:
  - the service tower;
  - the living/kitchen transition (x ≈ 6.85 m);
  - the sleeping/living partition (x ≈ 3.2 m);
  - the west end (x ≈ 0.3 m);
  - the kitchen/bath partition (x ≈ 9.75 m).
- Keep bends to a minimum. The CEC limits the total bend between pull points
  (commonly 360°); design for **less than 180°** where practical so a fish tape
  moves easily.
- Use **removable-cover LB/LL conduit bodies** at corners, not sealed elbows.
- Leave a **nylon pull string** in every conduit and label both ends.
- Use **3/4-inch EMT** as the minimum main run. A 1/2-inch run is too tight for
  future replacement and is not the “evergreen” choice.

### 4.4 Conduit fill

Keep the initial fill at **40% or less** for three or more conductors. The point
of the oversized conduit is future capacity; filling it now defeats the purpose.
Use a **steel** raceway, not plastic, in the cabin and at the exterior wall; steel
is non-chewable and provides some physical protection. At the exterior, use
listed wet-location fittings and stainless hardware.

### 4.5 Cabin A plan diagram

```text
NORTH / ENTRY / FOREST SIDE
+-------------------------------------------------------------------+
|  ===== 3/4" EMT AC + 3/4" EMT DC ceiling cove at 2.55 m ========== |
|  |                                                                |
|  |  SLEEPING          LIVING              KITCHENETTE    BATHROOM  |
|  |  0.0-3.2           3.2-6.85            6.85-9.75     9.75-12  |
|  |                                                                |
|  |  [pull box]        [pull box]          [SERVICE TOWER]         |
|  |  x=3.2             x=6.85              x=8.9-9.5, high         |
|  |                                        [BATTERY BAY]           |
|  |                                        x=8.9-9.5, low          |
|  |                                                                |
|  |  drops in partition                     drops in partition     |
|  |  (not exterior wall)                    (not exterior wall)    |
+-------------------------------------------------------------------+
SOUTH / LAKE / SCREENED PORCH SIDE
     [single PV entry / DC junction / drip loop on non-bermed wall]
```

## 5. Exterior penetrations and water/vermin exclusion

### 5.1 Single PV entry

- Bring the PV strings through **one above-grade, downward-sloped weatherproof
  junction box** on the non-bermed utility wall near the service tower.
- Use a **listed PV junction box** with a gasketed cover, a **drip loop** in each
  conductor, and **downward-facing cable glands**.
- Slope the sleeve **2–3° outward**. Seal the annular gap with EPDM gaskets and
  stainless hardware; do not rely on silicone alone.
- Provide a **DC disconnect** at the entry, a **surge protective device (SPD)**,
  and a **rapid shutdown** device as required by the CEC edition and the AHJ.
- The roof raceway should be **surface-mounted galvanized steel** or a listed
  PV raceway, with a **roof curb/flashing** at the penetration. Avoid multiple
  roof holes.
- If the cabin is grid-connected, the utility AC service is a **separate**
  penetration and mast; do not combine AC and DC in one entry.

### 5.2 Vermin

| Location | Barrier |
| --- | --- |
| PV junction box | 6 mm stainless mesh over every unused opening; gasketed cover; no foam |
| Conduit collars | Stainless steel mesh + listed sealing gland; stainless hose clamps |
| Battery bay vent | 6 mm stainless mesh + removable fine 20 × 20 cassette |
| Service tower vents | 6 mm stainless mesh; no horizontal open louvers |
| Roof raceway ends | Stainless mesh + weatherproof cap; drip loop |
| Wall sleeve | Non-chewable steel sleeve; seal with EPDM, not expanding foam |

Use **steel conduit**, metal enclosures and stainless mesh. Mice and squirrels
chew plastic conduit, foam and many cable jackets. Inspect the PV junction,
battery vent and service tower annually, and after any roof work.

### 5.3 Water

- Drip loops at every exterior connection.
- Downward-facing glands and hoods.
- Sloped sleeves, drip edges and flashing.
- Keep the PV junction above snow and away from roof runoff.
- Use **wet-location rated** fittings and conductors at the exterior.
- Do not penetrate the roof at a low point or in a valley.

## 6. PV array and snow

- Mount the array on a **tilted aluminium rack** above the roof membrane, on
  structural rails designed for snow and wind uplift. The existing roof is a
  low-slope membrane roof with PV; a 45–55° winter tilt is a **structural and wind
  uplift change**, not a simple bracket swap. Have the roof structure and
  attachments reviewed.
- A steeper tilt sheds snow better but catches more wind and can create snow
  drift against the chimney or the porch roof. Detail a **snow guard/snow fence**
  where sliding snow would land on an entry, path or porch.
- Keep the array clear of the chimney, flue, roof vents and the porch roof. Leave
  a service walkway and a fall-protection plan.
- Use **MC4 connectors** with a drip loop and a strain relief; do not leave
  connectors lying on the roof.
- String sizing must use **cold-temperature Voc** (the voltage rises at -30 °C)
  and the MPPT window. Do not size at 25 °C only.
- The site has seasonal tree shade. Model the actual shade; a string MPPT cannot
  recover a fully shaded module. Consider **two MPPTs** or parallel strings if the
  chimney/trees split the array.

## 7. Battery inside vs outside

LiFePO₄ cells must not be charged below **0 °C**. Many BMS units stop charging
at 0–5 °C; some self-heating packs use 30–100 W while charging. Discharging is
also limited at low temperature. The battery must be kept in a stable,
above-freezing space.

| Criterion | Inside conditioned envelope (recommended) | Outside insulated vault |
| --- | --- | --- |
| Freeze protection | Passive warmth from the cabin; self-heating only when charging below 5 °C | Requires thermostatic heat, often 30–100 W continuous in deep cold |
| Winter parasitic load | Low; heating only during charge | High; can consume 15–30% of winter solar harvest |
| Interior space | Uses a 600 × 600 mm low bay; no living-area loss if under the counter | None |
| Fire/egress | Needs a listed enclosure, fire lining, smoke alarm and separation from the only exit | Isolated from the cabin, but fire exposure to the exterior wall and snow access |
| Ventilation | Small exterior vent; follow CEC ESS and manufacturer rules | Easier to vent outside, but the enclosure must be sealed and insulated |
| Water/snow | Protected by the envelope | Snow burial, drifting, ice and access problems |
| Vermin | Interior bay is easier to seal | High risk at the exterior cable entries; requires stainless mesh and inspections |
| Maintenance | Easy, warm, inside | Difficult in winter; snow removal and cold hands |
| Code | CEC ESS rules, UL 9540/9540A listed pack, disconnects, signage, fire separation | Same, plus exterior enclosure rating and heating circuit |
| Recommendation | **Default for Cabin A** | Only if the interior cannot accommodate a listed enclosure |

### Inside installation rules of thumb

- Use a **UL 9540/9540A-listed LiFePO₄ pack**, not loose cells.
- Keep the battery **out of the sleeping area and the only egress path**.
- Line the bay with fire-rated board; install a **smoke/heat alarm** above it.
- Provide a **class T fuse** at the battery positive terminal, a **battery
  disconnect**, and a **label** at the service tower.
- Provide the manufacturer’s clearances; do not pack insulation against the
  battery terminals or vents.
- Vent the bay to the exterior with a **6 mm stainless screen** and a **20 × 20
  fine cassette**; do not recirculate into the cabin.
- Keep the battery away from the stove, flue and direct sunlight. A stable
  15–25 °C is better than hot/cold cycling.
- Use a **battery temperature sensor** to the MPPT/inverter and a **low-temperature
  charge cutoff**. Self-heating alone is not a substitute for a BMS cutoff.

## 8. Grounding and bonding

The steel shell is conductive. A fault in a conductor or appliance could energize
the shell, doorframe or PV rack. Bonding is mandatory, not optional.

- Bond the **Corten steel shell**, **PV module frames/racking**, **battery
  enclosure**, **inverter**, **AC panel** and **DC negative bus** to a common
  **equipment grounding bus**.
- Connect the equipment grounding bus to a **grounding electrode system**:
  driven rods/plates, a concrete-encased electrode if available, or a listed
  ground electrode. Do not use the container shell as the only electrode.
- Size bonding and grounding conductors per **CEC Table 16** and the service
  configuration. The #6 AWG bare copper in the prompt is a reasonable concept for
  a small service, but the final size must be calculated.
- Bond the PV rack to the module frames with listed **WEEB/racking bonding**
  hardware; do not rely on a bolted connection through paint or Corten.
- Bond the steel shell at **two separate points** to avoid a single loose
  connection; use stainless fasteners and antioxidant.
- Install a **ground-fault protection** device for the PV array as required by
  the CEC and the inverter listing.
- Install **SPDs** at the PV entry and the AC panel. In a Canadian Shield
  woodland, lightning and switching surges are real.
- Label the grounding electrode conductor and the bonding jumpers.
- Do not bond the DC negative to the shell at more than one point unless the
  inverter/charge controller is listed for that configuration. Follow the
  equipment listing.

## 9. Service core schedule

| Component | Location | Notes |
| --- | --- | --- |
| 120 V AC sub-panel | service tower, 1.7–2.5 m | 8–12 circuits, main breaker, AFCI/GFCI, labels |
| 24 V DC main fuse/disconnect | service tower, 1.7–2.5 m | Class T fuse at battery; lockable disconnect |
| MPPT charge controller | service tower | 60–100 A, temperature sensor, PV disconnect |
| Inverter/charger | service tower | 2–3 kW, 24 V, pure sine, low idle |
| DC fuse block | service tower | 6–8 fused circuits, 24 V and 12 V sections |
| Shunt/battery monitor | service tower | State of charge, current, temperature |
| Battery | low bay, 0.2–0.85 m | UL 9540/9540A listed, fire-lined, vented |
| PV junction/DC disconnect | exterior utility wall | Single entry, drip loop, SPD, rapid shutdown |
| Ground bus | service tower | Bonded to shell, rack, battery, panel, electrode |

## 10. Operating modes

| Mode | AC inverter | DC loads | Battery heating | Notes |
| --- | --- | --- | --- | --- |
| Unattended summer | Off | Ventilation, sensors, USB standby | Off | Inverter idle draw eliminated; MPPT still charges |
| Occupied summer | On demand | Lighting, fans, devices | Off | Use DC lighting at night; inverter for cooking/tools |
| Occupied winter | On demand | Lighting, fans, controls | Self-heating only while charging below 5 °C | Keep battery above 0 °C; stove OAK separate |
| Closed winter | Off | Smoke/CO, low-temp sensor | Off unless charging | Battery at low SOC? Follow manufacturer storage voltage; do not charge below 0 °C |
| Emergency | Off or inverter only | Lights, radio, CO | Off | Manual disconnect labels; keep a headlamp and a paper card |

## 11. Scaling to the pair cabins and the Common Lodge

- **Cabin F (20 ft, ~13 m²):** 1.5–2.5 kWp PV, 5–10 kWh battery, 1.5–2 kW
  inverter, 24 V DC, single 3/4-inch AC and DC cove runs. The service tower can be
  smaller (450 × 700 × 250 mm). At 450 W this is roughly 3–5 panels; at 550 W it
  is roughly 3–5 panels as well, but confirm the actual module.
- **Cabins B, D and E (two-container pairs, ~50 m²):** 4–6 kWp PV (roughly 9–13
  panels at 450 W), 10–20 kWh battery, 3–5 kW inverter, **two** AC/DC cove loops
  from one service core. Keep the battery inside the conditioned envelope if
  possible; a pair has more space for a listed bay. Do not run one 3/4-inch
  conduit for the whole pair.
- **Common Lodge (~124 m²):** 120/240 V split-phase service, 8–12 kW inverter,
  20–40 kWh battery or a shared community microgrid, 10–20 kWp PV (the Design Lab
  lodge reference is 24 × 450 W = 10.8 kWp with a 20 kWh shared battery), a
  dedicated battery room with fire separation and ventilation, and a licensed
  electrical engineer. The lodge's kitchen, laundry, heat pump and battery room
  need a commercial-grade design, not a scaled cabin panel.

These earlier Cabin F and pair estimates are schematic. The six selected homes
supersede them for the Design Lab; do not combine the two sets into one design
without a new load calculation.
- A **two-storey lodge** would need a new vertical conduit riser, fire stopping
  and egress design; it is not part of this document.

## 12. Verification checklist

- [ ] Licensed electrical contractor / engineer produces the service, feeder,
      conduit fill, voltage-drop, bonding and PV string calculations.
- [ ] ESA / AHJ reviews the ESS, PV rapid shutdown, disconnects, labeling and
      grounding.
- [ ] Battery is a UL 9540/9540A listed pack with a low-temperature charge cutoff.
- [ ] Battery bay is fire-lined, vented, isolated from the egress path and
      accessible.
- [ ] PV rack and roof structure are reviewed for snow, wind uplift and tilt.
- [ ] Roof penetration is a single listed curb/flashing with a drip loop.
- [ ] AC and DC raceways are separate, labelled and sized for future pull.
- [ ] Pull boxes are accessible; bends are less than 180° where practical; pull
      strings are installed.
- [ ] Steel shell, PV rack, battery enclosure and equipment are bonded; electrode
      system is tested.
- [ ] SPDs, GFCI/AFCI, smoke/CO alarms and a fire extinguisher are installed.
- [ ] A single-line diagram, circuit directory and operating card are inside the
      service tower door.
- [ ] Commissioning: insulation resistance, polarity, open-circuit voltage,
      short-circuit current, ground continuity, inverter settings, low-temperature
      charge cutoff and battery heating test.

## 13. Limitations

This document does not calculate the load, PV yield, string voltage, conduit fill,
voltage drop, battery autonomy, bonding conductor size, fire separation or
structural loads. It does not certify a battery, inverter, PV system or service.
It does not replace the CEC, the equipment listings, a licensed electrical
contractor, a Professional Engineer, ESA or the AHJ. It does not change
`data/cabin-a.json`.

## 14. References

- Electrical Safety Authority (Ontario) — renewable energy and ESS guidance:
  <https://www.esasafe.com/>
- Canadian Electrical Code, Section 50 (solar PV) and Section 64 (energy storage
  systems), as adopted in the province. The standard is copyrighted and is not
  reproduced here.
- UL 9540 / UL 9540A — energy storage system and cell-level fire testing:
  <https://www.ul.com/>
- Natural Resources Canada, photovoltaic and battery guidance:
  <https://natural-resources.canada.ca/energy-efficiency/renewable-energy>
- CSA C22.1 (Canadian Electrical Code) — current edition, as adopted.
- Manufacturer instructions for the selected PV modules, MPPT, inverter, battery
  and rapid-shutdown device.
