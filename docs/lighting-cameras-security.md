# Lighting, timers, cameras and blind spots

**Status:** Design Lab study. Not a construction drawing, electrical design,
security system specification or privacy assessment. The electrical contractor,
ESA/AHJ, camera vendor and community governance process must review the final
installation.

This is the companion to
[`electrical-solar-battery.md`](electrical-solar-battery.md). It covers the parts
of the electrical brief that are about daily use rather than distribution:
kitchen and living-area receptacles, charging on both sides of the bed, warm LED
lighting, security timers, wildlife/security cameras and container blind spots.

## 1. Resident needs

The cabin is small, but it is not a campsite. A workable electrical layout needs:

- **More than one kitchen circuit** so the kettle, coffee maker, fridge and a
  portable induction cooker do not all share one outlet.
- **Living-area receptacles** at the sofa, desk and a lamp, not just at the walls.
- **Charging on both sides of the bed** at nightstand height, without a power bar
  on the floor.
- **Warm, dimmable LED light** inside and outside, so the cabin is comfortable at
  night and the entry, steps and path are safe.
- **Timers** for some interior and exterior lights, so an empty cabin does not
  look abandoned.
- **Local cameras** for wildlife, the entry/porch and the blind spots around the
  container — without turning the hamlet into a surveillance system.

## 2. Lighting design

### 2.1 Colour and quality

- **Colour temperature:** 2700 K in the living and sleeping areas; 3000 K in the
  kitchen and bathroom; 2700 K outside. Avoid 4000–5000 K “cool white” for
  general cabin lighting; it feels institutional and is harsh at night.
- **CRI:** 90+ where available. Warm light with poor colour rendering makes wood,
  food and faces look grey.
- **Dimming:** every interior fixture dimmable to at least 5%; use a compatible
  dimmer/driver. Cheap dimmers buzz and flicker at low output.
- **Flicker:** specify flicker-free drivers; avoid cheap AC LED lamps on a
  modified sine inverter. Use a pure sine inverter and quality 24 V DC drivers.
- **Glare:** use diffuse downlights, opal diffusers or wall washers. Do not put a
  bare LED strip in the eyeline of someone sitting on the sofa or lying in bed.

### 2.2 Interior layers

| Layer | Location | Purpose |
| --- | --- | --- |
| General | ceiling downlights or a cove | soft background light |
| Task | kitchen counter, desk, bathroom vanity | cooking, reading, shaving |
| Reading | both sides of the bed, sofa | individually switched, dimmable |
| Night | toe-kick or low wall | safe route to the bathroom without waking the cabin |
| Entry | inside the door | light the lock, bench and boot area |
| Bathroom | vanity and shower | warm, IP-rated, no glare |

Use **24 V DC** for the fixed LED lighting. It keeps the lighting alive when the
inverter is off and avoids a 120 V circuit in every ceiling penetration. Provide a
**24 V DC lighting controller** with a master switch, zone dimming and a
**manual override** at the door.

### 2.3 Exterior lighting

- **Porch:** a warm, shielded ceiling or wall light over the seating area, on a
  dimmer and a timer.
- **Entry:** a warm light at the door, with a **motion sensor** and a manual
  override. It should light the lock and the step, not the whole forest.
- **Path and steps:** low bollards or step lights, 2700 K, shielded and aimed
  down. Use **dark-sky friendly** fixtures; no uplighting, no bare lamps visible
  from the trail.
- **Service tower / battery bay:** a small warm task light inside the cabinet or
  above it, on a door switch, so maintenance does not need a headlamp.
- **Security:** a low-level porch/entry light on an **astronomical timer** with a
  randomized “lived-in” schedule; a motion boost is optional. Do not use a bright
  floodlight that spills into the wetland, the neighbours or the lake view.
- **Winter:** exterior fixtures rated for **-30 °C**, IP65, stainless or
  powder-coated aluminium, with a gasketed lens and a drain path. Cheap plastic
  lenses crack in cold.

### 2.4 Lighting load

| Load | Watts | Hours/day | Wh/day |
| --- | ---: | ---: | ---: |
| Interior LED, 6–10 fixtures at 20–40% average | 20–40 W | 5 | 100–200 |
| Exterior porch/entry/path | 8–20 W | 6 (timer) | 50–120 |
| Night/toe-kick | 2–4 W | 8 | 16–32 |
| Camera/NVR | 15–40 W | 24 | 360–960 |

The camera load is often larger than the lighting load. See §4.

## 3. Timers and security

- Use a **local astronomical/time-clock controller** with a battery backup. It
  should not depend on Wi-Fi, a cloud account or a phone app.
- Provide **two schedules**:
  - exterior porch/entry lights: dusk to a set time, then motion only;
  - interior living/kitchen lamp: a randomized evening schedule when the cabin is
    empty.
- Randomize by ±15–30 minutes; a light that switches at exactly 19:00 every night
  is not a convincing security measure.
- Provide a **manual override** at the door and at the service tower. A guest must
  be able to turn the lights on without finding the controller.
- Keep the **smoke/CO and battery-temperature sensors on an always-on circuit**
  that the lighting master cannot switch off.
- Do not use a camera or a cloud service as the only timer. The cabin should still
  light up if the network is down.

## 4. Cameras: wildlife, security and blind spots

### 4.1 Purpose

Cameras are for:

- **wildlife observation** at the meadow/forest edge, so residents can share
  sightings;
- **entry and porch safety**, so a resident can see who is at the door;
- **blind spots** around the container corners, the service tower and the battery
  bay, where a person cannot see from inside.

They are **not** for monitoring neighbours, shared paths, or people’s comings and
goings. The hamlet’s privacy commitments still apply.

### 4.2 Camera placement

| Location | Camera | Purpose | Privacy note |
| --- | --- | --- | --- |
| Entry door, under the hood | 1 wide-angle, 2K, IR | See the doorstep and path | Point down; mask the neighbour’s porch |
| Screened porch, corner | 1 wide-angle | See the porch and lake edge | Do not point into the porch seating when occupied; no audio |
| Four exterior container corners | 1–2 cameras, not four by default | Cover the blind sides and the utility bay | Use privacy masks for shared paths and neighbouring homes |
| Service tower / battery bay | 1 small interior camera or door contact | Maintenance and fire/smoke verification | No camera in the bathroom or bedroom |
| Meadow/forest edge | 1–2 trail cameras, battery/solar | Wildlife sightings | Point away from cabins and the shared trail; no cloud upload |
| Living/kitchen | Optional only | Check a stove, a pet or a door | No camera in the bathroom or sleeping area; disable when occupied if preferred |

**Do not** put cameras in the bathroom, bedroom or shower. **Do not** use audio.
**Do not** use facial recognition or “human detection” analytics that identify
people. If a camera can see a shared path or a neighbour’s door, use a **privacy
mask** and document it.

### 4.3 Blind spots

A 40-foot container is a long steel box. The blind spots are:

- the two corners on the side away from the main window;
- behind the service tower and battery bay;
- the entry side of the porch;
- the path junction and the space under the building;
- the roof/PV array (a camera cannot see the roof from inside).

Use a **combination** of cameras, mirrors, warm lighting and physical inspection.
A camera at each corner is not automatically the answer: four cameras add power,
cable, maintenance and privacy load to a 27 m² cabin. Start with **two**: entry
and the side with the service tower. Add the wildlife camera at the meadow edge as
a separate trail camera, not part of the security system.

### 4.4 Local-only recording

- Use a **local NVR or a small recorder** in the service tower, with a **1–2 TB**
  drive. Do not require a cloud account.
- If the camera is Wi-Fi, keep it on a **local-only VLAN** with no internet
  route; block outbound cloud access at the router. A camera that phones home is
  not consistent with the project’s no-tracking commitment.
- Prefer **PoE** cameras (one cable for power and data) or **12 V DC** cameras with
  a local recorder. PoE needs a PoE switch/injector and a 48 V supply; a 24 V
  camera needs a 24 V→12 V converter or a 12 V branch.
- Put the camera cables in **steel conduit** or a protected raceway. Do not run
  them in the exterior insulation.
- Use **surge protection** at the camera and the recorder; exterior cameras are
  exposed to lightning-induced surges.
- Rate cameras and cable for **-30 °C**; avoid cameras with a built-in heater
  unless the power budget supports it. A heated camera can draw 10–20 W.
- Use **motion-triggered recording** and a **retention limit** (14–30 days) to
  reduce storage and power. The camera still draws standby power; do not assume
  motion recording means zero load.

### 4.5 Power budget

| Device | Watts | 24 h Wh | Notes |
| --- | ---: | ---: | --- |
| 2 × PoE cameras | 8–16 W | 190–380 | 4–8 W each |
| 1 × NVR + 2 TB drive | 10–20 W | 240–480 | Local recording |
| 1 × trail camera (battery/solar) | 0 | 0 | Separate power; no cabin load |
| PoE injector/switch | 3–8 W | 70–190 | Include in the total |

Two cameras plus an NVR can use **0.4–0.9 kWh/day**, which may be 10–20% of a
small off-grid winter budget. This is why the camera count is deliberately small
and the trail camera is separate. If the battery is marginal, use one entry camera
and a door contact instead of four cameras.

### 4.6 Sharing wildlife (and human) sightings

- Share **wildlife clips** by manually exporting a clip to a community folder or a
  local device. Do not auto-upload to a cloud or social platform.
- Treat images of **people** as personal information. Do not share them without
  consent, and do not use the system to identify or track people.
- Put a small **sign at the entry/trail** saying cameras are in use for wildlife
  and building safety, with a contact for questions.
- Set a **retention period** (for example 14 days) and delete automatically.
- If the hamlet wants shared wildlife footage, make it a **community governance**
  decision with a written policy, not a default camera feature.
- Do not point a camera at a neighbour’s door, window, porch or private path. If
  the field of view cannot avoid it, use a privacy mask or move the camera.

## 5. Wiring and service-core changes

The lighting/camera system adds to the service core:

- a **24 V DC lighting controller** with zone dimming and a timer;
- a **camera PoE injector/switch or 12 V DC branch**;
- a **local NVR** on a ventilated shelf;
- a **timer/controller** with battery backup;
- a ** surge protective device** on the camera/PoE cable.

If the service tower is the 600 × 900 × 250 mm cabinet from the electrical doc,
add a **separate locked media shelf** above or beside it, or increase the cabinet
to **600 × 1,000 × 300 mm**. Do not pack the NVR against the inverter; both make
heat. Keep the camera recorder accessible without removing the AC panel cover.

Use the existing two raceways: AC in the red AC conduit, DC/data in the blue
DC/data conduit. Do not run PoE and 120 V AC in the same conduit.

## 6. Seasonal operation

| Mode | Lighting | Timers | Cameras |
| --- | --- | --- | --- |
| Unattended summer | Exterior dusk/motion; interior off | Randomized evening lamp | Entry + side camera on; trail camera on its own battery |
| Occupied summer | Interior zones as needed; exterior porch/path | Manual override | Entry/side on; disable interior camera if preferred |
| Occupied winter | Warm interior, entry and path; battery bay task light | Astronomical + manual | Entry/side on; check camera heaters and snow |
| Closed winter | Exterior entry on timer/motion; interior off | Randomized lamp | Entry camera on; trail camera may be removed or left on solar |

## 7. Verification checklist

- [ ] Count and label every AC and DC circuit; confirm the kitchen has at least
      two counter circuits, a fridge circuit and a dedicated high-draw circuit.
- [ ] Confirm bedside charging on both sides, at nightstand height, with USB-C PD
      and a 120 V receptacle.
- [ ] Check living-area receptacle locations against the furniture layout.
- [ ] Verify LED colour temperature, CRI, dimming range, flicker and driver
      compatibility.
- [ ] Verify exterior fixture IP rating, -30 °C rating, shielding and light spill.
- [ ] Test the timer schedules, randomized variation, manual override and
      battery-backed clock.
- [ ] Confirm cameras are local-only, no cloud, no audio, no facial recognition.
- [ ] Check every camera field of view for neighbour windows, shared paths and
      private porches; apply privacy masks.
- [ ] Confirm the camera/NVR load in the battery calculation.
- [ ] Confirm the service tower ventilation and NVR operating temperature.
- [ ] Install signage, retention policy and a community camera/wildlife policy.

## 8. Limitations

This document does not design the lighting, camera, network or security system.
It does not calculate the load, battery autonomy, PoE budget, camera coverage or
storage. It does not certify the electrical installation or the privacy
compliance of any camera. A licensed electrical contractor, ESA/AHJ, camera
vendor and the community governance process must review the final design. The
camera system must remain local-only by default and must not become a tool for
monitoring neighbours or shared paths.
