# Multi-container services: Cabins B, D, E and the Common Lodge

**Status:** Design Lab study. Not a construction drawing, engineering stamp,
mechanical design or permit package. The pair and lodge models are authoritative
in `data/cabin-pair.json` and `data/lodge.json`; this document does not edit them.

This is the companion to:

- [`passive-ventilation.md`](passive-ventilation.md) — Cabin A end-to-end
  ventilation, filters, pest/weather exclusion and seasonal modes.
- [`wood-heat-thermal-mass.md`](wood-heat-thermal-mass.md) — Cabin A stove,
  hearth, masonry heat wall, clearances and OAK.
- [`electrical-solar-battery.md`](electrical-solar-battery.md) — Cabin A hybrid
  AC/DC service, PV entry, battery placement and grounding; includes scaling
  notes for the pairs and the lodge.
- [`lighting-cameras-security.md`](lighting-cameras-security.md) — warm LED
  lighting, kitchen/living/bedside circuits, timers and local-only cameras.

The single-container rules do not simply scale up. A 50 m² pair has two parallel
tubes and a shared wall; the lodge has a large hall, a commercial kitchen, laundry,
washrooms, a battery room and fluctuating occupancy.

## 1. What the pair model actually contains

`data/cabin-pair.json` is two 40-foot high-cube modules, each about 12.03 m ×
2.35 m internally. The main module has Sleeping, Living, Kitchenette and Bathroom.
The annex module is a second room for work, guests or a future kitchen; its fit-out
is not designed. The pair can therefore be read as two parallel tubes joined by a
shared wall or opening, not as one 25 m × 2.35 m tube.

| Space | Main module | Annex module |
| --- | --- | --- |
| Sleeping | x 0–3.2 m | — |
| Living | x 3.2–6.85 m | — |
| Kitchenette | x 6.85–9.75 m | — |
| Bathroom | x 9.75–12.03 m | — |
| Studio / future room | — | 0–11.8 m |
| Openings | West, south and north windows; north entry; south sliding doors; south sink window; north kitchen window; east high bathroom window | South window, east window, east door |

The pair's clear floor area is roughly **50 m²** depending on the fit-out and the
shared wall. The exact number must come from the accepted plan, not from this
document.

## 2. Ventilation strategy for B, D and E

### Two loops, not one

Use **two coordinated end-to-end loops**, one per module:

- **West/main loop:** low intake in the Sleeping zone on the shaded forest side;
  high exhaust at the Kitchenette/Bathroom end.
- **East/annex loop:** low intake at the annex end away from the main intake; high
  exhaust at the annex end away from the main exhaust.
- Cross the loops diagonally where possible. Do not put both intakes on the same
  wall at the same height, and do not put both exhausts side by side.

A single 200 mm sleeve is not enough for 50 m². Use **two 200 × 200 mm intakes and
two 200 × 200 mm exhausts**, or one 250 mm intake and two 150 mm exhausts, sized by
a mechanical designer.

### Shared wall and transfer

The shared wall between the modules is the main dead-zone risk. Provide:

- A **low transfer grille** (400 × 150 mm at 150 mm above the floor) and a **high
  transfer grille** (400 × 150 mm at 2.10 m) in the shared wall, or a designed
  opening/door undercut.
- Do not rely on a closed door with a 5 mm gap. That is not a transfer path.
- If the modules are separated by a glazed link, treat the link as part of the
  path: provide low and high transfer openings, and do not block them with
  furniture.
- Keep a continuous 900 mm clear path in each module.

### Target rates

| Condition | Target |
| --- | --- |
| Unattended summer, pair | 25–40 L/s total, split between loops |
| Occupied summer, pair | 40–60 L/s with windows/porch open |
| Occupied winter, pair | 10–20 L/s total, balanced or HRV |
| Purge | 60–80 L/s short-term, with makeup air |

These are design targets. A 50 m² pair with four occupants and a stove needs a
mechanical designer's calculation, not a rule of thumb.

### Fan assist

- Use **two 140 mm 12 V DC fans**, one at each exhaust, 2–4 W each, or one
  ECM inline fan with two branches. Two smaller fans are easier to balance and
  give redundancy.
- Put each fan downstream of its filter and damper, with a backdraft flap.
- Use a **two-zone controller** with one outdoor sensor and one indoor sensor per
  module. Do not let one module run the other module's fan without a shared
  pressure path.
- Provide a **manual boost** in the kitchenette and bathroom.

### Filters and insects

- Each intake gets a **320 × 320 × 120 mm interior filter plenum** with a
  250 × 250 × 25 mm MERV 8–11 filter and a washable prefilter.
- Each exterior hood gets a 6 mm stainless hardware cloth and a removable 20 × 20
  fine-mesh cassette.
- Service both filters from inside; label them “west” and “east.”

### Winter

- Insulated dampers on all four penetrations.
- Meter both intake and exhaust; do not open only one side.
- For full-time winter occupancy, use a **compact HRV** sized for 15–25 L/s,
  with a frost-control preheat and a condensate drain. A pair has more volume and
  more occupants than Cabin A, so the heat-loss penalty of pure exhaust is larger.
- The stove OAK is separate and direct. Do not use the ventilation intake as
  combustion makeup air.

## 3. Wood heat for B, D and E

### Capacity

| Pair | Clear area | Stove target | Masonry wall | Hearth | Mass |
| --- | --- | --- | --- | --- | --- |
| B | ~50 m² | 12,000–18,000 BTU/h | 1,250–1,500 mm W × 1,800 mm H × 100 mm | 1,350 × 1,100 mm | 700–1,000 kg |
| D | ~50 m² | 12,000–18,000 BTU/h | 1,250–1,500 mm W × 1,800 mm H × 100 mm | 1,350 × 1,100 mm | 700–1,000 kg |
| E | ~50 m² | 12,000–18,000 BTU/h | 1,250–1,500 mm W × 1,800 mm H × 100 mm | 1,350 × 1,100 mm | 700–1,000 kg |

These are concept ranges. A pair with a glazed link, a large porch and more
glazing may need more; a compact pair with a good envelope may need less. Run a
heat-loss calculation before selecting the stove.

### Location

- Put the stove near the **shared wall/connection**, but not inside a glazed link
  unless the link is designed for the heat, flue and fire separation.
- The stove should face the main living space, with the masonry wall between the
  stove and the sleeping zone or the shared wall.
- Keep a 1.1–1.3 m clear walkway. Do not place the hearth where it blocks the
  route between modules or the egress door.
- If the pair has two sleeping areas, do not put the only stove in one bedroom.
  The living/connection location is better.

### Foundation

A 700–1,000 kg hearth cannot sit on the container floor without engineering.
Use an **independent hearth plinth** on two or four helical piles, isolated from
the container floor, or a steel spreader frame designed by a structural engineer.
The pair has two container floor frames; do not assume one frame can carry the
other's load.

### Cross-section

Use the same layer sequence as Cabin A:

```text
stove → 175 mm air → 100 mm masonry → 25 mm ventilated gap → steel →
150 mm mineral wool → 25 mm cavity → timber rainscreen
```

The 25 mm gap must be open at the bottom and top. The exterior mineral wool is
non-combustible; do not substitute foam in the stove bay.

### OAK and chimney

- 75 mm insulated OAK direct to the stove, with a gravity or “open when burning”
  damper, 6 mm screen and a drain.
- Vertical listed chimney through the roof, clear of the PV array and the porch
  roof. Do not use a wall thimble through the glazed link.
- CO and smoke alarms in both modules.

## 4. Common Lodge

The lodge is a different problem: two service containers around a 6 m-wide timber
hall, about 124 m² clear. It has a shared kitchen, pantry, laundry, mechanical and
battery room, gathering hall, workshop, washrooms and boot room. It is a
**single-storey default**; an optional two-storey lodge is a separate study and is
not assumed here.

### Ventilation

Passive end-to-end vents are not enough for a community building with a kitchen,
laundry, showers, workshops and variable occupancy. Use **balanced ventilation**:

- **Primary:** a central ERV/HRV, sized for the hall, kitchen, laundry and
  washrooms, with a frost-control preheat and a condensate drain. Route supply to
  the hall and the occupied rooms; route exhaust from the kitchen, laundry,
  washrooms and boot room.
- **Kitchen:** a dedicated kitchen hood, with makeup air. Do not let the hood
  depressurize the hall or backdraft the stove. Use a **makeup-air unit** or a
  pressure-relief path interlocked with the hood.
- **Laundry:** dedicated exhaust, with a lint trap and a backdraft damper.
- **Washrooms:** dedicated exhaust, with a short run and a tight damper.
- **Hall:** low-level supply diffusers and high-level relief; the clerestory
  windows are not a substitute for mechanical ventilation.
- **Battery/mechanical room:** separate ventilation and fire separation per the
  battery manufacturer, electrical code and fire code. Do not recirculate battery
  room air into the hall.
- **Passive background:** provide two low intakes and two high exhausts at
  opposite ends of the hall/containers for power-off resilience. They are a
  backup, not the primary system.

Target rates must be engineered for the actual occupancy, kitchen hood, laundry
and washroom count. Do not scale the Cabin A 10–20 L/s to 124 m².

### Wood heat

- The wood stove is **supplemental**, not the only heat source. The lodge has a
  cold-climate heat pump for baseline freeze protection and shoulder seasons.
- Use a **masonry heater** or a larger listed stove in the hall, with a dedicated
  OAK and a structural hearth. A single small cabin stove will not carry 124 m².
- **Capacity:** a 25,000–40,000 BTU/h appliance may be appropriate, but only after
  a heat-loss calculation. Do not size by floor area alone.
- **Masonry mass:** 1,500–2,500 kg for a masonry heater or a large heat wall;
  independent foundation, not the container floor.
- **Clearances:** the hall has a timber frame and combustible finishes. Follow the
  appliance listing and CSA B365; do not use the Cabin A reduced-clearance
  assumptions.
- **Chimney:** listed chimney through the hall roof, with a curb, flashing, snow
  cricket and spark arrestor. Keep it clear of the clerestory and PV.
- **OAK:** direct, insulated, screened and drained. The hall is large; a room-air
  stove would be more likely to depressurize the building than in a tiny cabin.
- **Fire separation:** the battery room, mechanical room and wood heat need
  separated construction and fire stopping. Confirm with the fire code and insurer.
- **Egress:** the hall has multiple exits; keep the hearth out of the egress path.

### Accessibility

The lodge is the community's accessible building. Do not put the hearth, wood
storage or a fan cabinet in the accessible route. Keep 1.5 m turning space, clear
door widths, a level hearth edge and a clear path to the universal washroom. The
Cabin A clearances are not an accessibility standard.

### Two-storey option

The single-storey lodge remains the default. A two-storey lodge would need a new
structural model, stair/lift strategy, fire separation, egress and ventilation
design. It is not part of this specification.

## 5. Shared rules for all multi-container buildings

1. **One loop per module or zone.** Two modules do not automatically share air.
2. **Low intake, high exhaust, opposite ends.** Keep the path clear.
3. **Two transfer paths** (low and high) at every shared wall or door.
4. **Filters inside, insect screens outside.** Service both.
5. **Insulated dampers, closed in winter.** Meter both sides when occupied.
6. **OAK direct to the stove.** Never use the cabin ventilation as combustion air.
7. **Independent hearth foundation.** Do not load the container floor without
   engineering.
8. **Mineral wool, not foam, in the stove bay.** Keep the 25 mm gap open.
9. **Verify clearances with a WETT-certified installer.** Do not rely on a generic
   percentage.
10. **Commission and label.** Measure flows, test dampers, test alarms and leave an
    operating card.

## 6. Verification checklist

- [ ] Mechanical designer: ventilation rates, ERV/HRV sizing, kitchen/laundry/
      washroom exhaust, makeup air and pressure balance.
- [ ] Structural engineer: independent hearth plinth, piers, floor penetrations,
      chimney curb and snow loads.
- [ ] WETT-certified installer: stove, clearances, hearth, chimney and OAK.
- [ ] Building-envelope consultant: four wall sleeves, thermal breaks, air/vapour
      control and fire stopping.
- [ ] Electrical: 12 V fans, HRV power, battery room separation and alarms.
- [ ] Fire: battery room, wood heat, egress, fire stopping and insurer.
- [ ] Accessibility: clear routes, hearth edge, controls and washroom access.
- [ ] Commissioning: flow, pressure, CO, smoke, damper operation and filter
      service.

## 7. Limitations

This document does not calculate ventilation, heat loss, stove output, chimney
draft, structural capacity or fire separation. It does not certify any stove,
hearth or clearance. It does not change `data/cabin-pair.json` or
`data/lodge.json`. A mechanical designer, structural engineer, WETT-certified
installer and the authority having jurisdiction must review the final design.
