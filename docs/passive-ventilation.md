# Passive end-to-end ventilation for Cabin A

**Status:** Design Lab study. Not a construction drawing, engineering stamp,
mechanical design or permit package. Ventilation rates, penetrations, fire
stopping, structural reinforcement and controls must be reviewed by a mechanical
designer, building-envelope consultant and the authority having jurisdiction.

**Building:** Cabin A, one 40-foot high-cube container. The authoritative data is
`data/cabin-a.json`. It has a 26.7 m² clear floor area, roughly 76 m³ of interior
volume, and four zones. The room order below uses the actual opening positions,
which differ from the earlier sketch in the prompt.

## 1. What the cabin actually looks like

Interior clear dimensions: **12.03 m long × 2.35 m wide × 2.70 m high**.

| Zone | Approximate x range | Openings that matter |
| --- | --- | --- |
| Sleeping | 0.00–3.20 m | West window W1 (lake side, 0.6–1.8 m along the width); south bedroom window W2 (0.9–2.4 m) |
| Living | 3.20–6.85 m | North living window W3 (3.6–5.0 m); north entry door D1 (5.75–6.67 m); south sliding doors D2 (4.05–6.45 m) to the screened porch |
| Kitchenette | 6.85–9.75 m | South sink window W4 (7.3–8.7 m); north kitchen window W5 (7.8–9.0 m) |
| Bathroom | 9.75–12.03 m | East high bathroom window W6 (0.9–1.7 m along the width, sill 1.5 m) |

The north wall is the entry/trail side. The south wall is the lake and screened
porch side. The long axis runs east–west. The cabin is elevated about 0.6 m on
piles, so an opening 0.4 m above the interior floor is about 1.0 m above grade.

## 2. Design intent

The cabin needs three different behaviours:

1. **Unattended summer:** continuous, low-rate air exchange to remove moisture
   and avoid mustiness without pulling in hot, humid afternoon air.
2. **Occupied summer:** background exchange plus open windows and porch doors,
   with the ventilation system not fighting the occupants.
3. **Occupied winter:** a small, metered fresh-air rate that does not create a
   cold draft across the bed or living area, with a separate combustion-air path
   for the stove.

The design target is **10–20 L/s background** (roughly 0.5–1.0 air changes per
hour for 76 m³) and **25–35 L/s purge** with fan assist. These are design targets,
not a code compliance claim. A mechanical designer should confirm the rate for
the number of occupants, moisture sources and stove operation.

## 3. Placement: a diagonal low-to-high path

### 3.1 Intake

- **Wall:** north wall, in the Sleeping zone, at **x = 1.10–1.30 m**.
- **Height:** centre at **0.40 m above the interior floor** (about 1.0 m above
  grade). This is below the bed and window, in the shaded forest-side wall.
- **Sleeve:** 200 × 200 mm square (or 150 mm round), insulated, with a **2–3°
  outward slope**.
- **Exterior:** a deep, downward-facing hood at least 600 mm above grade and
  clear of snow drift, with a drip edge and removable insect screens.

Why here: it is the coolest, most shaded long wall, it is away from the porch and
lake view, and it is at one end of the narrow tube. It does not conflict with W1
or W2.

### 3.2 Main exhaust

- **Wall:** south wall, in the Kitchenette zone, at **x = 8.90–9.10 m**.
- **Height:** centre at **2.40 m above the interior floor** (about 3.0 m above
  grade), roughly 250 mm below the ceiling.
- **Sleeve:** matching 200 × 200 mm insulated sleeve, sloped outward.
- **Exterior:** hooded cap with a gravity backdraft flap, 6 mm stainless mesh and
  a removable 20 × 20 fine-mesh cassette.

Why here: it is at the opposite end and on the opposite side of the narrow cabin
from the intake, giving a **diagonal path** across the full length and width. It
is beyond the screened porch (which ends at x = 6.86 m), so it does not dump
moist air into the porch. It is high, so it captures the warm, moist air that
collects near the ceiling.

### 3.3 Bathroom exhaust

- **Wall:** east end wall, in the Bathroom, at **y = 1.95–2.05 m** across the
  width, centre at **2.35 m above the floor**.
- **Duct:** 100 mm insulated, with a small 12 V fan or a short-run bath fan.
- Keep this separate from the main path so shower moisture leaves directly and
  does not travel the length of the cabin.

The east wall has W6 at y = 0.9–1.7 m and a 2.1 m head, so the 100 mm bath
exhaust at y = 1.95–2.05 m and 2.35 m high clears the window. The container end
wall is structural; the penetration needs reinforcement and a fire-stopping
detail.

### 3.4 Plan diagram

```text
NORTH / ENTRY / FOREST SIDE  (shaded)
+-------------------------------------------------------------------+
| [INTAKE 200x200]                                                  |
| x=1.1-1.3, 0.40 m AFF                                             |
|                                                                   |
|  SLEEPING          LIVING                 KITCHENETTE    BATHROOM  |
|  0.0-3.2 m         3.2-6.85 m             6.85-9.75 m   9.75-12 m |
|       W1(west)     W3(north)  D1(entry)   W5(north)     W6(east)  |
|       W2(south)    D2(south)  W4(south)                            |
|                                                                   |
|                                      [MAIN EXHAUST 200x200]        |
|                                      x=8.9-9.1, 2.40 m AFF        |
+-------------------------------------------------------------------+
SOUTH / LAKE / SCREENED PORCH SIDE
        [BATH EXHAUST 100 mm, east wall, 2.35 m AFF]
```

The arrows are not shown as a single straight line because air will spread across
the width. The important point is that the intake is low at one end and the main
exhaust is high at the other, on the opposite side.

### 3.5 Elevation notes

```text
2.70 m  ceiling
2.40 m  main exhaust centre  -------- [hood]
2.10 m  window heads
1.50 m  bathroom window sill
0.90 m  bedroom window sill
0.40 m  intake centre       -------- [hood]
0.00 m  interior floor
-0.60 m grade / pile tops
```

## 4. Air path and dead-zone control

A 12 m long, 2.35 m wide tube can short-circuit along the ceiling or stall at the
ends. The following are part of the design, not optional trim:

- **Keep a continuous clear path** at least 900 mm wide along the cabin. Do not
  place tall furniture across the path between the intake and the exhaust.
- **Sleeping/living partition:** provide a **low transfer grille** (300 × 150 mm
  at 150 mm above the floor) and a **high transfer grille** (300 × 150 mm at
  2.10 m). The low grille carries summer air; the high grille prevents a warm
  ceiling pocket from stagnating. Use a sound-attenuating grille if the bedroom
  door is normally closed.
- **Bathroom door:** 20 mm undercut or a 300 × 100 mm transfer grille; the
  dedicated bath exhaust does the rest.
- **Kitchenette:** keep the path in front of the sink and counters clear. A
  recirculating range hood is not a moisture solution; if a vented hood is used,
  it needs its own makeup air and must not depressurize the stove.
- **Stove and thermal mass:** the stove/heat wall must not block the low path.
  Keep at least 300 mm between the hearth edge and the walking path, and do not
  store firewood under the stove.
- **Furniture:** beds and sofas should be raised on legs or kept 100 mm off the
  wall so air can move behind them. Avoid full-height wardrobes at the ends.

## 5. Fan assist when the wind is calm

Passive stack pressure is small. At a 2.0 m height difference and a 20 K indoor–
outdoor temperature difference, the theoretical stack pressure is roughly **1 Pa**;
at 10 K it is roughly **0.5 Pa**. Wind can be more or less. That is enough for a
modest background flow in a clean 200 mm sleeve, but not enough to guarantee
moisture control in still, humid weather. A small fan is the guarantee.

### Recommended fan

- **Type:** 140 mm high-static-pressure 12 V DC axial or mixed-flow fan, rated
  for at least **2.2 mm H₂O (about 22 Pa)** at the operating point.
- **Power:** **2–4 W** at 12 V nominal (brushless DC, 6–15 V range).
- **Placement:** at the **main exhaust**, downstream of the interior filter and
  damper, pushing air out. A backdraft flap prevents reverse flow when off.
- **Mounting:** rubber isolation grommets; the fan module should be removable
  from inside without disturbing the wall sleeve.
- **Control:** PWM speed control, a 12 V fuse, a manual override, and a
  low-voltage disconnect. No mains voltage in the duct.
- **Airflow:** target 20–30 L/s at full speed. At 20 L/s and 30–50 Pa, a 30%
  efficient fan draws roughly 2–3.3 W, so 2–4 W is realistic.

### Controller logic

Use a **differential temperature/humidity controller** that calculates dew point,
not a simple humidistat:

- Run when **outdoor dew point is at least 2 °C below indoor dew point** and
  outdoor air is not hotter than indoor air by more than about 2 °C.
- In summer, bias operation to **night and early morning**. Stop during hot,
  humid afternoons when outdoor dew point is higher than indoor.
- Use a 5–10 minute minimum run and a 10–15 minute off delay to avoid short
  cycling and to let the duct dry.
- In winter, disable automatic summer control; the occupant uses the metered
  winter mode.
- Provide a **manual boost** for cooking, showering or a stuffy room, with a
  timed off.

A **solar chimney** can add stack effect, but it is not the base design. It adds a
roof penetration, fire and weather detail, and it cannot be turned off when the
outdoor air is hotter or more humid than the indoor air. The high exhaust plus a
2–4 W fan is simpler and more controllable.

## 6. Pollen, dust and filter housing

The filter must be on the **warm, dry side** of the wall and serviceable from
inside without tools.

### Filter plenum

- **Location:** interior north wall in the Sleeping zone, at **1.10–1.30 m above
  the floor**, with a 200 mm insulated riser from the low exterior intake. The
  low intake is at 0.40 m; the filter is higher, so it is easier to service and
  stays warmer.
- **Box:** 320 × 320 × 120 mm powder-coated steel or aluminium, with a hinged,
  gasketed grille and two quarter-turn latches. It protrudes about 120 mm into the
  room; keep 900 mm clear in front.
- **Filter:** 250 × 250 × 25 mm **MERV 8–11** pleated filter. MERV 13 is allowed
  only if the fan is running; it is too restrictive for passive-only flow.
  Provide a **washable coarse prefilter** in front of the pleated filter.
- **Face velocity:** at 20 L/s through 0.0625 m², about 0.32 m/s. That is low
  enough for a light pressure drop. A 200 × 200 mm filter would have twice the
  velocity; use the larger 250 × 250 mm face.
- **Bypass:** gasket the filter frame. A 5 mm bypass around a filter is a direct
  dust path.
- **Service:** tool-free latch; the filter slides out toward the room. Label the
  airflow direction and the replacement date. Provide a spare filter clip inside
  the cover.
- **Condensation:** the exterior sleeve slopes out, the hood has a drip edge, and
  the interior box has a **drip lip and removable condensate tray** at the bottom.
  In winter, run the fan for 10 minutes after a cold-air episode to dry the
  filter. If the filter is wet, remove and dry it; do not leave a damp filter in
  the box.

### Dual outlet for summer and winter

A single low inlet is good for stack effect but can produce a cold floor pool in
winter. The filter plenum therefore has two outlets:

- **Summer outlet:** low, at **0.45 m above the floor**, directed along the floor
  away from the bed. This preserves the low-to-high stack path.
- **Winter outlet:** high, at **1.85–1.95 m above the floor**, with a perforated
  diffuser directed along the ceiling away from the bed and sofa. A manual
  changeover flap selects summer or winter. The flap is inside the hinged cover
  and can be changed without tools.
- The winter outlet is fed by a short **50 mm insulated internal riser** from the
  filter box. Keep the riser on the wall and out of the walking path.
- The high outlet does not replace the exhaust path. In winter, crack **both**
  the intake and the main exhaust to a metered position, or use the optional HRV
  described below.

## 7. Pest and insect exclusion

Use defence in depth. No single mesh should be the only barrier.

| Layer | Specification | Service |
| --- | --- | --- |
| Outer rodent/bird barrier | 6 mm (1/4 in) stainless-steel hardware cloth, mechanically fixed behind the hood | Remove and clean annually |
| Fine insect cassette | 20 × 20 mesh (about 0.8 mm openings), stainless or aluminium, in a removable frame | Clean monthly in blackfly/mosquito season; keep a spare |
| Interior pollen filter | MERV 8–11 pleated, gasketed | Replace every 2–3 months in use, or when pressure drop/visible dust increases |
| Sleeve collar | Stainless wool and EPDM gasket around the sleeve, not steel wool (it rusts) | Inspect annually |
| Exhaust | Gravity backdraft flap + 6 mm mesh + 20 × 20 cassette | Clean annually; confirm the flap closes |

The 20 × 20 mesh is fine enough for blackflies and mosquitoes but will load with
pollen and dust. That is why it is a **large-area removable cassette** outside the
filter, not a small screen stretched over the 200 mm sleeve. Give it at least
**three times the sleeve free area**.

Do not use horizontal open louvers, which collect nests and debris. Use a
downward-facing hood with a removable front. Do not use expanding foam as a pest
seal; rodents chew it and it traps moisture.

## 8. Rain, snow and wind

### Exterior intake hood

- 300 × 300 mm face, **100 mm deep**, with a **30–45° downward** opening.
- **Drip edge** and a 20 mm front lip.
- Back flange with EPDM gasket against the cladding; stainless screws.
- Top and side flashings integrated with the rainscreen; the hood is removable
  for service.
- Bottom of the hood at least **600 mm above grade and above the expected snow
  drift**. In Cabin A the intake is about 1.0 m above grade, which is a reasonable
  start; confirm local snow depth.

### Wall sleeve

- 200 × 200 mm square or 150 mm round, **insulated** (25 mm closed-cell or
  mineral wool) to avoid a cold bridge and condensation.
- **2–3° outward slope** so any water runs out, not in.
- Sleeve extends **20 mm beyond the cladding** and is sealed to the weather
  barrier with a compatible tape or liquid membrane, not just sealant.
- Interior trim is removable for filter service.
- The sleeve must not compress the exterior insulation or create a thermal
  bridge. Use a **non-metallic or thermally broken** sleeve where possible.

### Exhaust hood

- Same hood body, but with a **gravity backdraft flap** and a removable fine-mesh
  cassette.
- Locate it so it does not discharge into the porch, the lake view or the fresh-air
  intake. In this layout it is at the kitchenette end, beyond the porch.
- Keep the exhaust at least **1.5 m** from the intake and not directly across a
  corner where wind can short-circuit.

### Wind-driven rain

The north and south long walls can both take wind-driven rain. The hood depth,
gaskets, outward slope and drip edge matter more than the louver style. Avoid a
flush grille with no hood. In exposed locations, add a **removable storm cover**
for the intake during a driving-rain event if the cabin is unattended; the
exhaust backdraft flap can stay closed. Do not seal the intake permanently.

## 9. Summer heat and moisture management

### Unattended summer

- Both dampers open; fan in automatic dew-point mode.
- Run at night/early morning; stop when outdoor dew point is higher than indoor
  or when outdoor air is much hotter.
- Keep the cabin shaded: the screened porch roof, the west trellis and the
  exterior overhangs reduce solar gain. Do not rely on ventilation to cool a
  sun-baked box.
- Close the cabin during hot, humid afternoons. The thermal mass and shade slow
  the temperature rise; the night purge removes the moisture.
- Leave the bathroom door open and the bath exhaust off when unattended. Do not
  leave wet towels, standing water or a full sink.
- Inspect the filter and the condensate tray monthly.

### Occupied summer

- Open the screened porch doors and the leeward windows for cross-breeze.
- Run the background fan on low. Use the bath fan during and after showers; open
  the intake to provide makeup air.
- If a vented kitchen hood is used, it must have makeup air. A 100–150 mm hood can
  depressurize the cabin and backdraft the stove. Do not run a large hood with the
  stove burning unless the OAK and pressure path are designed.
- At night, use the fan to purge; close up in the morning.

### Condensation in a shaded cabin

Ventilation removes moisture only when the incoming air is drier. A shaded steel
box can stay cool while humid air enters; the dew point is the controlling
variable. The controller must use **dew point**, not relative humidity alone. If
the outdoor dew point is higher than indoor, keep the dampers closed and wait for
a drier period. A small **12 V desiccant dehumidifier** is an option for a closed
cabin, but it adds power and maintenance; it is not part of the passive base.

## 10. Winter fresh-air control and heat retention

### Insulated dampers

- **Interior slide damper:** 50 mm closed-cell insulation in a rigid frame,
  EPDM compression gasket, cam latch, adjustable stop. The damper is in the warm
  filter box, not on the cold exterior face.
- **Exterior backdraft flap:** gravity or spring, with a gasket and a screen. It
  closes when the fan is off and the wind is not pressing.
- **Thermal break:** the damper frame is isolated from the steel wall with a
  neoprene or mineral-wool gasket. Avoid a continuous steel path from the interior
  frame to the exterior hood.
- When closed, the assembly should be **airtight enough that you cannot feel a
  draft**. Test with a smoke pencil or a low-pressure gauge.

### Metered winter mode

The earlier sketch says “close both dampers and crack the intake.” That does not
work: with no exhaust path, fresh air cannot flow. Use one of these instead:

1. **Manual balanced crack:** set both the intake and the main exhaust to a
   marked 10–20% position (target 5–10 L/s). The intake discharges at the high
   winter outlet, along the ceiling away from the bed. The exhaust is high at the
   far end. This is simple and uses no power, but the rate is approximate.
2. **Small HRV (recommended for full-time winter occupancy):** a compact
   room-sized HRV, 15–25 L/s, with a frost-control preheat and a balanced supply/
   exhaust. Use the same two wall sleeves; the HRV replaces the filter plenum
   fan. It recovers roughly 60–75% of the sensible heat, so 10 L/s costs about
   150–200 W instead of 480 W at -20 °C. It needs 10–30 W of fan power and a
   condensate drain.

### Heat-loss reality check

Approximate sensible heat loss from ventilation at -20 °C outdoor and +20 °C
indoor:

| Fresh-air rate | Heat loss without recovery | With 70% HRV |
| --- | ---: | ---: |
| 5 L/s | ~240 W | ~70 W |
| 10 L/s | ~480 W | ~145 W |
| 15 L/s | ~720 W | ~215 W |
| 20 L/s | ~960 W | ~290 W |

These are approximate. They show why “crack a vent” in winter is not free. For a
27 m² cabin, 5–10 L/s is a reasonable occupied-winter target; 20 L/s is a summer
or purge rate, not a winter default. A full-time winter occupant should use an
HRV or accept the heat loss.

### Cold-draft control

- Winter air discharges **high**, at 1.85–1.95 m, along the ceiling, away from the
  bed and sofa. Do not dump it at floor level beside the bed.
- Keep the winter outlet at least **1.5 m** from the bed and 1 m from the stove
  flue.
- Use a **perforated diffuser** or a slot diffuser, not an open 200 mm hole.
- The stove and masonry mass are between the intake and the living zone in the
  recommended layout; the air passes over the warm mass before reaching occupants.
- If the cabin is very tight, provide a **pressure-relief path** for the bath fan.
  Do not rely on door undercuts as the only makeup air.

### Makeup air and the stove

- The stove gets a dedicated **75 mm (3 in) insulated OAK** direct to its
  combustion-air inlet. It does not draw from the cabin.
- The OAK is separate from the ventilation intake. Do not tee them together.
- Fit the OAK with a **gravity damper or a manual “open when burning” damper**,
  a 6 mm rodent screen, and a drain at the low point. Insulate the full run.
- If the stove is not connected to a sealed OAK, it can depressurize the cabin and
  pull cold air through the ventilation dampers and door gaskets. That is the
  condition the OAK is meant to prevent.
- Install **CO and smoke alarms** in the sleeping zone and near the stove. Test
  them monthly.

## 11. Seasonal operating modes

| Mode | Intake | Main exhaust | Fan | Bath exhaust | Target | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| **Unattended Summer** | Open | Open | Auto dew-point/night | Off | 10–20 L/s | Close during hot humid afternoons; purge at night; inspect filter monthly |
| **Occupied Summer** | Open | Open | Low/auto | On after showers | 15–30 L/s | Windows/porch open; do not run a large hood without makeup air |
| **Occupied Winter** | Metered 10–20% | Metered 10–20% | Off, or HRV | Short run after showers | 5–10 L/s | High winter outlet; stove OAK open when burning; CO alarm |
| **Closed Winter** | Closed/latched | Closed/latched | Off | Off | ~0 | Heat-retention mode; air on mild days; not a substitute for an HRV if occupied |

## 12. Scaling to the two-container cabins and the Common Lodge

- **Cabin F (20 ft, ~13 m²):** one 150 mm intake/exhaust pair, 6–10 L/s
  background, 15–20 L/s purge, 6–10 k BTU/h stove. See the companion spec.
- **Cabins B, D and E (two-container pairs, ~50 m²):** two low intakes and two
  high exhausts, one per module, or a cross-flow with high and low transfer
  grilles at the connection. Target 25–40 L/s background. Do not rely on one
  200 mm sleeve for 50 m². The stove and heat wall need an independent foundation;
  see the companion spec.
- **Common Lodge (~124 m²):** passive end-to-end flow is not enough for a
  community kitchen, laundry and gathering occupancy. Use a balanced ERV/HRV with
  kitchen and washroom exhaust, plus passive background vents. The wood stove is
  supplemental, with a dedicated OAK. See
  [`multi-container-services.md`](multi-container-services.md).

## 13. Verification checklist

- [ ] Mechanical designer confirms ventilation rates for occupancy, moisture
      sources, stove operation and the number of bedrooms.
- [ ] Structural engineer reviews both wall penetrations, the east end-wall
      penetration, the sleeve reinforcement and the chimney/roof curb.
- [ ] Building-envelope consultant details the air/vapour control, insulation,
      thermal break, flashing and fire stopping at each sleeve.
- [ ] WETT-certified installer confirms the stove OAK, clearances and chimney.
- [ ] Electrician/designer confirms the 12 V circuit, fuse, disconnect, fan
      current and low-voltage cutoff.
- [ ] Commissioning: measure flow at each hood; smoke-pencil the dampers; check
      the fan curve; test the controller with a calibrated hygrometer; confirm the
      bath fan does not backdraft the stove.
- [ ] Install CO and smoke alarms; test them.
- [ ] Label every damper “summer / winter / open when burning” and include a
      one-page operating card inside the cabin.
- [ ] Re-check snow clearance, insect screens and filter condition after the
      first winter and the first blackfly season.

## 14. Limitations

This is a concept. It does not calculate the actual flow, pressure balance,
condensation risk or heating load. It does not certify a ventilation rate or a
stove installation. It does not replace a mechanical designer, WETT-certified
installer, building-envelope consultant, structural engineer or the authority
having jurisdiction. The 20 × 20 mesh and MERV 8–11 filter will need real-world
maintenance trials in Heron Lake’s blackfly and pollen seasons.

## References

Public references used for the clearance and ventilation context. CSA B365 is a
copyrighted standard and is not reproduced here; the current edition and the
stove’s certified listing govern.

- Yukon Government, *Safe and Efficient Home Heating* — heat shields and
  clearance reduction per CSA B365:
  <https://yukon.ca/sites/default/files/yhc/yhc-safe-efficient-home-heating-2017.pdf>
- Municipal summary of Quebec requirements for masonry screens with a 25 mm air
  space (public summary, not the standard):
  <http://www.ville.st-henri-de-taillon.qc.ca/userfiles/file/P-V-%204%20avril%202011.pdf>
- HomeGauge, *Solid Fuel Heating System Clearances* — public summary of B365
  clearance reduction:
  <https://www.homegauge.com/report/4669358/SolidFuelClearance-1.pdf>
- True North TN20 owner’s manual — example of OAK, floor protection and
  clearance instructions:
  <https://www.woodstove-fireplaceglass.com/cdn/shop/files/True_North_TN20_Owners_Manual.pdf?v=8374948074406643872>
- Natural Resources Canada, chimney and clearance guidance:
  <https://publications-cnrc.canada.ca/eng/view/ft/?id=b8d9bf89-326c-4022-aee7-1fbc65b1e8ed>
