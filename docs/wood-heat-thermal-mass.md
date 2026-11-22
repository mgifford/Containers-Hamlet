# Wood heat, masonry thermal mass and wall protection for Cabin A

**Status:** Design Lab study. Not a construction drawing, engineering stamp, WETT
certificate or permit package. The stove, chimney, hearth, clearances, floor
structure and foundation must be reviewed by a WETT-certified installer, a
structural engineer and the authority having jurisdiction.

**Building:** Cabin A, one 40-foot high-cube container, 26.7 m² clear, about 76 m³.
The authoritative layout is `data/cabin-a.json`. This document does **not** change
that file. Where a stove location requires moving an opening, it is labelled a
**Cabin A stove variant** and should be modelled as a separate design.

## 1. The constraint that changes the sketch

The earlier sketch places the stove centrally on the rear wall and the bathroom
at the kitchenette end. The actual Cabin A data is:

| Zone | x range | Openings on the long walls |
| --- | --- | --- |
| Sleeping | 0.00–3.20 m | South bedroom window W2 at 0.9–2.4 m; west window W1 |
| Living | 3.20–6.85 m | North living window W3 at 3.6–5.0 m; north entry door D1 at 5.75–6.67 m; south sliding doors D2 at 4.05–6.45 m |
| Kitchenette | 6.85–9.75 m | South sink window W4 at 7.3–8.7 m; north kitchen window W5 at 7.8–9.0 m |
| Bathroom | 9.75–12.03 m | East high window W6 |

There is **no clear 1.25 m-wide wall bay** on the north or south long wall that
does not conflict with a window, the entry door or the sliding doors:

- North living: 0.75 m between W3 and D1; 1.13 m between D1 and W5.
- South living: 1.65 m between W2 and D2, but the sleeping/living partition at
  3.2 m cuts that gap into 0.8 m and 0.85 m.
- The west and east end walls contain W1 and W6.

A 1.1–1.25 m masonry shield plus a stove with 450 mm side extensions cannot be
forced into those gaps without moving something. There are two honest options.

## 2. Two placement options

### Option A — no opening change: freestanding masonry heat wall at the sleeping/living transition

- Place a **freestanding** 1.25 m wide × 1.80 m high × 100 mm masonry wall at the
  sleeping/living transition, perpendicular to the long axis or parallel to the
  south wall but not tight to it. The stove sits on the living side.
- The wall is the thermal mass and the radiation shield. It is **not** a
  wall-mounted shield, so the 25 mm gap to the steel is only used where the stove
  is close to a side wall.
- Keep the stove at least **500 mm** from each long wall, or fit a listed heat
  shield on that side. The cabin is 2.35 m wide; a 350 mm stove plus 500 mm each
  side is 1.35 m, leaving 1.0 m of walkway.
- Exterior mineral wool is still specified in the stove bay as a safety margin.
- **Advantages:** no façade change; the wall separates the stove from the bed;
  the mass radiates to both sleeping and living.
- **Disadvantages:** it is not the requested wall-mounted shield; it occupies
  floor area; the flue is near the middle of the cabin; the partition and
  walkway need redesign.

### Option B — recommended for a wall-mounted shield: north wall at the living/kitchenette transition, with the kitchen window moved

- **Cabin A stove variant.** **Remove/close the north kitchen window W5**
  (x = 7.8–9.0 m). The kitchen retains the south sink window W4; the north wall
  becomes solid for the stove bay. This is an opening deletion, not a structural
  change, but it is a real daylight trade-off.
- Place the stove and masonry shield on the **north wall**, centred at about
  **x = 7.6 m**, with the shield from **x = 7.0–8.25 m**. This is the
  living/kitchenette transition, on the forest/entry side.
- The entry door ends at 6.67 m, so the shield has 330 mm clearance to the door
  trim; confirm the door swing and egress. The north wall beyond the shield is
  clear to the bathroom partition.
- **Advantages:** a true wall-mounted, air-gapped shield; protects the exterior
  insulation; flue on the forest side, away from the lake view; central enough
  for heat distribution; keeps the south porch and lake glazing clear.
- **Disadvantages:** loses the north kitchen window; the kitchen relies on W4;
  the stove is closer to the bathroom than the bed; the flue must avoid the roof
  PV array; the authoritative `data/cabin-a.json` is unchanged until the variant
  is accepted. If the lost north light is unacceptable, Option B is not viable
  without a larger layout change.

The rest of this document details **Option B**, because it is the only option
that gives the requested `stove → air space → masonry → 25 mm gap → steel →
exterior insulation` cross-section. Option A uses the same hearth and mass but a
freestanding wall.

### Option B plan diagram

```text
NORTH / ENTRY / FOREST SIDE
+-------------------------------------------------------------------+
|  SLEEPING          LIVING              KITCHENETTE       BATHROOM  |
|  0.0-3.2           3.2-6.85            6.85-9.75         9.75-12  |
|                    W3 3.6-5.0  D1 5.75-6.67   W5 deleted/closed     |
|                                                                   |
|                              [STOVE + HEAT WALL]                  |
|                               x=7.0-8.25, north wall              |
|                                                                   |
|                    D2 4.05-6.45       W4 7.3-8.7                  |
+-------------------------------------------------------------------+
SOUTH / LAKE / SCREENED PORCH SIDE
```

The stove door faces south into the kitchenette/living. The hearth projects
1.10 m into the room. The clear path between the hearth and the south wall is
about 1.25 m.

## 3. Stove sizing

Cabin A is a small, moderately insulated box. Oversizing is the main risk: a large
stove cannot be run cleanly at low output, so it smoulders, makes creosote and
overheats the room.

| Parameter | Concept target |
| --- | --- |
| Nominal output | **8,000–12,000 BTU/h** (about 2.3–3.5 kW) |
| Maximum short-term output | 15,000 BTU/h (about 4.4 kW), not a continuous target |
| Firebox | **20–30 L** (about 0.02–0.03 m³) |
| Footprint | about 350 × 350 mm, plus rear heat shield and clearances |
| Burn cycle | 2–4 hours of useful heat per load; overnight requires a second load or a soapstone/masonry heater |
| Fuel | 1.5–2.5 cords of seasoned hardwood per winter for intermittent/part-time use; 2.5–3.5 cords for full-time winter occupancy |
| Wood moisture | 15–20% measured on a split, not the bark |

These are planning ranges, not a heat-loss calculation. A 27 m² cabin with R-15
to R-20 walls and R-25 to R-30 roof may need only 2–3 kW at design conditions.
A smaller stove run at a clean, hot output is better than a large stove dampered
down. If the cabin is used only in shoulder seasons, a 6,000–10,000 BTU/h stove
may be enough.

Avoid stoves above about 20,000 BTU/h for Cabin A unless the heat-loss calculation
and the room layout justify it.

## 4. Hearth, masonry wall and mass

### Hearth pad

| Item | Concept dimension |
| --- | --- |
| Width | **1,250 mm** (to support a 1,250 mm heat wall and 450 mm side protection) |
| Depth | **1,100 mm** from the wall face |
| Thickness | **65 mm** non-combustible assembly |
| Front ember protection | at least **450 mm** in front of the fuel-loading door |
| Side/rear protection | at least **200 mm** beyond the stove body, or per the stove listing |
| Materials | 12 mm cement board over 0.6 mm steel sheet, topped with 50 mm granite, firebrick or listed hearth stone |
| Thermal resistance | must meet the stove manufacturer’s required floor protection; the 65 mm assembly is a concept, not a rated assembly |

The 1,250 mm width is deliberately wider than the heat wall. A 900 mm hearth
cannot support a 1,100–1,250 mm masonry wall and does not give the required side
protection.

### Masonry heat wall

| Item | Concept dimension |
| --- | --- |
| Width | **1,250 mm** |
| Height | **1,800 mm** above the hearth |
| Thickness | **100 mm** solid clay brick or split Shield stone |
| Air space to steel | **25 mm** continuous, open at top and bottom |
| Bottom opening | 50 mm slot above the hearth |
| Top opening | 50 mm slot near the ceiling, with a non-combustible top trim |
| Spacers | non-combustible ceramic or stainless standoffs, not wood or plastic |
| Reinforcement | stainless or galvanised wall ties; isolate dissimilar metals |
| Finish | breathable mineral paint or none; no vinyl wallpaper or plastic trim |

### Mass estimate

- Brick wall: 1.25 × 1.80 × 0.10 = 0.225 m³. At 1,800–2,000 kg/m³: **405–450 kg**.
- Stone wall: same volume at 2,400–2,700 kg/m³: **540–608 kg**.
- Hearth: 1.25 × 1.10 × 0.065 = 0.089 m³. At 2,300–2,700 kg/m³: **205–241 kg**.
- **Total: about 610–850 kg**, depending on material. That is heavier than the
  400–700 kg in the prompt; the larger hearth and 1.25 m wall explain the
  difference. If 400–500 kg is a hard limit, use a 1,000 mm wide wall (about
  320–400 kg) and confirm clearances; do not shrink the hearth below the stove
  listing.

## 5. Structural support

Do not assume the container floor can carry 600–850 kg on four small feet.

### Recommended: independent hearth plinth

- Build the hearth and masonry wall on a **self-supporting steel frame** founded
  on **two or four helical piles or concrete piers** directly below the hearth.
- Isolate the plinth from the container floor with a **10 mm mineral-wool or
  neoprene isolation strip** so the container floor does not carry the mass and
  the plinth does not become a thermal bridge.
- The plinth can sit inside the container footprint if the floor is cut around
  it; the cut is a structural alteration and needs an engineer. Alternatively,
  design a **steel spreader frame** that passes under the container floor and
  supports the hearth through the floor with isolated bearing pads.
- Provide **adjustable pile caps** so the hearth can be levelled independently of
  the cabin.

### If the hearth must bear on the container floor

- A structural engineer must check the container cross-members, the floor
  corrugation and the local bearing. Add a **6–10 mm steel spreader plate** and
  transfer the load to the container corner posts or a new steel beam.
- Do not rely on the plywood floor or a few screws. Do not cut the top flange of
  a floor cross-member without engineering.
- The pile/beam design must also resist uplift and frost movement; the cabin is
  in a Canadian Shield wetland with seasonal frost.

## 6. Cross-section: stove to exterior

```text
INTERIOR                                                         EXTERIOR
+---------+  175 mm  +---------+  25 mm  +--------+  150 mm  +--------+ 25 mm +--------+
|  STOVE  |   air    | BRICK / |  open   | CORTEN | mineral  |  steel | cavity| timber |
|  350 mm |  space   |  STONE  |  air    | STEEL  |   wool   |  wall  |       | rainscreen |
|         |          | 100 mm  |  gap    |  3 mm  | R-15-20  |        |       |  22 mm |
+---------+          +---------+         +--------+          +--------+       +--------+
     |                    |                  ^
     |                    |                  |
     |              +-----+-----+            |
     +------------> |  HEARTH   |            |
                    | 65 mm     |            |
                    +-----------+            |
                         |                   |
                 [independent pier]     [25 mm slot top and bottom]
```

Notes:

- The **175 mm stove-to-masonry air space** is a concept. The stove’s rear heat
  shield and the manufacturer’s clearance take priority. Do not block the stove’s
  convection openings.
- The **25 mm gap** between the masonry and the steel is a continuous convective
  channel, open at the bottom (above the hearth) and at the top (near the
  ceiling). It is not a sealed cavity. Air enters cool at the bottom, rises, and
  spills warm into the room at the top.
- The **150 mm exterior mineral wool** replaces foam in the stove bay. The rest of
  the cabin can use the selected exterior insulation; the stove bay is
  non-combustible mineral wool as a safety margin. The 25 mm rainscreen cavity and
  timber rainscreen remain outside.
- The steel wall is non-combustible, but heat conducted through it can still
  overheat the exterior insulation. The air gap and the mineral wool are both
  there to keep that from happening.

## 7. Air gap and exterior insulation protection

- **Gap:** 25 mm continuous, not 10 mm and not 50 mm. Use non-combustible spacers
  at 400–600 mm centres. Keep the gap clear of mortar droppings, insulation,
  wiring and stored items.
- **Openings:** 50 mm slot at the bottom and top. The bottom slot must be above
  the hearth surface and clear of ash; the top slot must be below the ceiling
  lining and not blocked by a shelf.
- **Top trim:** a non-combustible angle or perforated metal strip. Do not close
  the top with wood trim.
- **Exterior bay:** mineral wool (non-combustible, rated above 1,000 °C) in the
  stove bay, not foam. Keep the exterior rainscreen ventilated. Do not seal the
  exterior cavity; it is a separate rain screen, not the thermal gap.
- **Thermal imaging:** after commissioning, check the exterior surface above the
  stove during a hot burn. It should not be hot enough to soften the insulation
  or cladding. This is a verification step, not a calculation.

## 8. Clearances and CSA B365

This is the part where the prompt’s “up to 66%” needs correction.

- CSA B365 is the Canadian installation code for solid-fuel-burning appliances.
  The current edition and the **stove’s certified clearance label/instructions**
  govern. A generic percentage is not a substitute for the listing.
- Public summaries of B365 describe a **masonry screen with a 25 mm air space**
  reducing the required clearance to a combustible wall by about **50%**. Other
  shield types and spacings have different values. The 66% figure in the prompt
  is not supported by the public summaries reviewed for this document.
- The container steel wall is non-combustible, so the “clearance to combustible”
  question is mainly about the **interior lining, trim, floor and exterior
  insulation/rainscreen**, not the steel itself. Do not assume “steel wall = no
  clearance.”
- A 25 mm ventilated masonry shield can reduce clearance only if it is built and
  installed exactly as the standard and the stove listing require: continuous air
  space, open top and bottom, non-combustible spacers, minimum thickness, minimum
  extension above the stove and beyond its sides, and no combustible trim.
- **Do not design to 50% or 66% on the drawing.** Have a WETT-certified installer
  confirm the exact clearance for the selected stove and shield, and record the
  stove model, serial number, clearance table and installation date.

### Clearance schedule to complete

| Item | Concept target | To confirm |
| --- | --- | --- |
| Stove to masonry shield | 175 mm air space | Stove listing |
| Stove to side walls | 500 mm, or listed shield | Stove listing / B365 |
| Stove to combustible trim | per listing | WETT |
| Shield above stove top | at least 500 mm | B365 / listing |
| Shield beyond stove sides | at least 450 mm each side | B365 / listing |
| Hearth front | at least 450 mm | Stove listing / B365 |
| Hearth sides/rear | at least 200 mm | Stove listing / B365 |
| Chimney to combustibles | per listing | WETT / chimney manufacturer |

If the selected stove already has a **listed reduced-clearance heat shield**, use
the manufacturer’s table first. Do not stack a generic B365 reduction on top of a
listed reduced clearance.

## 9. Chimney and roof penetration

- Use a **listed factory-built chimney** rated for the stove and the Canadian
  climate. Do not use single-wall stovepipe through a roof or wall.
- Route the flue **vertically through the roof** near the stove. A wall thimble
  through the exterior insulation/rainscreen creates a difficult water, thermal
  and fire detail, especially beside the screened porch. Roof penetration is
  preferred.
- In the Option B location, the flue is on the north side, away from the lake
  view. Check it against the roof PV array: keep the chimney and its clearances
  clear of panels, mounting rails and wiring. The PV layout may need to shift.
- Provide a **ceiling support box**, **roof flashing**, **storm collar**, **rain
  cap/spark arrestor**, and a **snow cricket** on the uphill side. The roof is a
  low-slope membrane roof; the curb and flashing need to suit the membrane.
- Chimney height and clearance to the roof and nearby combustibles are set by the
  chimney listing and CSA B365. Do not guess. The common rule of thumb is at
  least 3 ft (900 mm) above the roof penetration and 2 ft (600 mm) above anything
  within 10 ft (3 m), but confirm the actual requirement.
- Support the chimney independently of the roof where required. Keep it away from
  the porch roof, trees and the fire-resilience defensible space.

## 10. Outside air kit

- **Duct:** 75 mm (3 in) insulated metal flex or rigid duct, as short and straight
  as possible, direct to the stove’s combustion-air inlet.
- **Exterior:** downward-facing hood with 6 mm stainless mesh, above snow and
  clear of the ventilation intake. Do not tee it into the ventilation system.
- **Damper:** a gravity flap or a manual “open when burning” damper. Do not leave
  a manual damper closed while the stove is lit.
- **Drain:** a low-point drain or a slope to the exterior so condensation does not
  fill the duct. Insulate the full run.
- **Sealing:** the OAK connection to the stove must be sealed so the stove does
  not draw room air. If the stove is not OAK-capable, choose one that is.
- **Makeup air:** if the cabin has a bath fan or a vented kitchen hood, provide a
  makeup-air path. A 100–150 mm hood can depressurize the cabin and backdraft the
  stove. Interlock or provide a pressure-relief damper.
- **Alarms:** CO and smoke alarms are required. Test them. Keep a fire
  extinguisher and a clear exit path.

## 11. What the masonry actually does

A 600–850 kg surface masonry wall is useful, but it is not a masonry heater.

- It absorbs radiant heat during the burn and releases it for roughly **2–4
  hours** after the fire dies, depending on thickness, material and how hot the
  burn was.
- It does **not** reliably heat the cabin all night. For overnight heat, use a
  **soapstone-clad stove** with a larger mass, or a **masonry heater** with
  internal flue channels and a proper bypass. Those are different appliances and
  need a different footprint and foundation.
- A 100 mm brick veneer has limited storage. If overnight performance is a hard
  requirement, do not promise it from this wall alone.
- The wall also protects the steel and exterior insulation by intercepting radiant
  heat and creating the convective gap. That is a safety function, not just a
  comfort function.

## 12. Scaling to the two-container cabins and the Common Lodge

- **Cabin F (20 ft, ~13 m²):** 6,000–10,000 BTU/h, 800 mm wide × 1,500 mm high ×
  100 mm wall, 350–450 kg, 900 × 900 mm hearth. A smaller stove and smaller mass
  are appropriate; do not use the Cabin A hearth.
- **Cabins B, D and E (two-container pairs, ~50 m²):** 12,000–18,000 BTU/h,
  1,250–1,500 mm wide × 1,800 mm high wall, 700–1,000 kg, independent foundation.
  Place the stove near the connection between modules, but not in the glazed link
  unless the link is designed for it. See
  [`multi-container-services.md`](multi-container-services.md).
- **Common Lodge (~124 m²):** a single wood stove is supplemental, not the primary
  heating system. Use a **masonry heater** or a larger listed stove in the hall,
  with a dedicated OAK, a structural hearth, and a balanced ERV/HRV. Confirm the
  fire separation, egress and insurance requirements. Do not scale the Cabin A
  hearth directly.

## 13. Verification checklist

- [ ] Confirm the Cabin A stove variant (W5 deleted) and update the authoritative
      model only if the community accepts the daylight trade-off.
- [ ] Select the stove model and record its certified clearance table.
- [ ] WETT-certified installer confirms clearances to the steel, interior lining,
      floor, exterior insulation and any combustible trim.
- [ ] Structural engineer approves the independent hearth plinth, piers, floor
      penetration and chimney curb.
- [ ] Building-envelope consultant details the air/vapour control, mineral wool,
      thermal break and exterior flashing.
- [ ] Chimney manufacturer’s listing and roof flashing/snow cricket are followed.
- [ ] OAK is sealed to the stove, insulated, screened and drained.
- [ ] CO/smoke alarms installed; fire extinguisher; clear egress.
- [ ] Thermal imaging after a hot burn confirms the exterior insulation and
      cladding are not overheated.
- [ ] Insurance and AHJ accept the installation.
- [ ] Operating card: “open OAK when burning; do not store wood under the stove;
      clean the flue; test alarms.”

## 14. Limitations

This document does not calculate the heat loss, stove output, chimney draft,
clearance, floor capacity or foundation. It does not approve the 25 mm shield for
any particular stove. It does not claim that a surface masonry wall provides
overnight heat. It does not replace CSA B365, the stove listing, a WETT-certified
installer, a structural engineer or the authority having jurisdiction.

## References

CSA B365 is a copyrighted standard and is not reproduced here. Public summaries
used only for context:

- Yukon Government, *Safe and Efficient Home Heating* — heat shields and
  clearance reduction:
  <https://yukon.ca/sites/default/files/yhc/yhc-safe-efficient-home-heating-2017.pdf>
- Municipal summary of Quebec requirements for masonry screens with a 25 mm air
  space (public summary):
  <http://www.ville.st-henri-de-taillon.qc.ca/userfiles/file/P-V-%204%20avril%202011.pdf>
- HomeGauge, *Solid Fuel Heating System Clearances* — public summary of B365
  clearance reduction:
  <https://www.homegauge.com/report/4669358/SolidFuelClearance-1.pdf>
- True North TN20 owner’s manual — example of OAK, floor protection and
  clearance instructions:
  <https://www.woodstove-fireplaceglass.com/cdn/shop/files/True_North_TN20_Owners_Manual.pdf?v=8374948074406643872>
- Natural Resources Canada, chimney and clearance guidance:
  <https://publications-cnrc.canada.ca/eng/view/ft/?id=b8d9bf89-326c-4022-aee7-1fbc65b1e8ed>
