# Visualisation prompts for the six hamlet residences

These are **image-generation prompts for concept visualisation**, not drawings,
construction documents or engineering images. They describe the homes as built in
`data/design-lab.json`. Do not add storeys, rooms, windows, roof forms or site
features that are not described.

Use the shared base and negative prompt with every shot. Then copy the shot text.

## Shared base prompt

> Photorealistic architectural visualisation of a concept container home in a
> fictional Canadian Shield woodland hamlet. Soft late-afternoon summer light,
> long natural shadows, muted woodland palette, realistic weathering. Weathered
> timber and dark metal cladding, large triple-glazed windows, exposed steel only
> where described. The building massing, storey count, roof form, window positions
> and outdoor spaces must match the description exactly. Eye-level human
> perspective, natural colour, no fisheye distortion, no exaggerated HDR, no text,
> no logos, no watermarks. Concept visualisation only, not a construction photo.

## Shared negative prompt

> extra storeys, extra rooms, extra windows, dormers, garage, basement, brick,
> vinyl siding, suburban house, log cabin, A-frame, tiny house on wheels, fantasy
> architecture, impossible cantilever, floating building, people, pets, cars,
> construction equipment, cranes, text, labels, logos, watermarks, oversaturated
> colours, distorted perspective, warped straight lines, duplicate openings,
> missing railings, unsafe stairs, fake snow, tropical plants.

## Source-data corrections

These prompts are retained as **creative source material**. They are not the
authoritative geometry. The generated pipeline in
[`docs/illustration-pipeline.md`](illustration-pipeline.md) supersedes them for
new work. The following contradictions with `data/design-lab.json` and
`data/site.json` were corrected on 2026-11-22:

- **Woodland Cottage:** the design entrance is on the local south face, but the
  site path approach is east. The prompts below say “south garden/entrance side”,
  not “main south approach”.
- **Offset Stack:** the upper porch `p2` is on the **south** face, not the east
  end. The upper east opening is a door. Access to the south balcony is
  unresolved because there is no recorded door on that face.
- **Courtyard Residence:** both modules are **40-foot** containers. There is no
  shorter module; the glazed link `c1` connects the L.
- **Cross-Stacked Retreat:** there is an upper east **door**, but no modeled
  balcony. Do not show a balcony. The butterfly roof is modeled on the exterior;
  the interior ceiling is not.
- **Accessible Garden Home:** the step-free entrance and adaptable bathroom and
  kitchen are **design intentions**, not a verified fully accessible home.
- **Solar Studio Stack:** installed PV is supported by the model. There is an
  upper east **door**, but no modeled balcony. The alternating-tread stair is
  recorded with unresolved usability/code concerns.
- **All homes:** interior prompts are conceptual. Rooms are longitudinal zones;
  partitions, fixtures, door swings and interior camera geometry are not modeled.

See [`data/illustration-discrepancies.json`](../data/illustration-discrepancies.json)
for the machine-readable record.

## Consistent look across all six

- **Season:** late summer, before leaf-off.
- **Time:** 4–6 pm, soft warm light, long shadows.
- **Weather:** clear with light haze; no rain.
- **People:** none.
- **Camera height:** 1.5–1.6 m for interiors and approach views; 1.2 m for seated outdoor views.
- **Lens:** 24–28 mm for interiors; 35 mm for approach views; 50 mm for detail shots.
- **Materials:** weathered cedar/timber, charcoal or pale salvaged metal, dark window frames, simple steel connections.

---

# A. Woodland Cottage

**Architecture:** one 40-foot single-storey module, gable roof at 24°, timber
cladding, covered south-facing porch, step-free entrance, ground-floor bedroom,
bathroom, kitchen and living room. **Site:** Cedar, above Heron Lake; the view is
through shoreline cedar and pine to the water, with a low far shore.

### A1. Front approach — whole house
> Front-on eye-level perspective from the south garden/entrance side (the site path
> approach is east), 35 mm lens, camera about 14 m from the house. A compact single-storey 40-foot container home with a
> 24° gable roof, weathered cedar cladding, dark window frames and a covered
> south-facing porch with a low step-free deck. The porch runs across the living
> end; the entry door and garden sliding doors face the camera. Show the whole
> house, roof ridge, porch posts, ground-floor windows and the garden edge.
> Background: cedar and white pine, a glimpse of Heron Lake through the trees, no
> other buildings. Calm, welcoming, modest scale.

### A2. Sleeping room
> Interior shot from the doorway into a compact ground-floor bedroom at the quiet
> end of a single-storey container home. 24 mm lens, eye height 1.5 m. A double bed
> under a north-facing window, simple timber-lined walls, warm white ceiling,
> built-in storage, one bedside lamp, a woven rug and a chair. Soft daylight from
> the north window; the south wall is solid and private. Calm, uncluttered, real
> materials, not a show home.

### A3. Bathroom
> Interior shot of a compact accessible bathroom in a single-storey container
> home. 24 mm lens, eye height 1.5 m, slightly elevated to show the floor. Walk-in
> shower with a low threshold, wall-hung toilet, vanity with clear space beneath,
> grab-bar blocking behind the tiling, a small south-facing high window, slip-
> resistant floor, timber ceiling. Bright, clean, warm, not clinical.
> Accessible but not institutional.

### A4. Kitchen
> Interior shot from the living room toward the kitchen in a single-storey
> container home. 24 mm lens, eye height 1.5 m. A compact galley kitchen along one
> wall with a north-facing window over the sink, timber cabinets, a dark counter, a
> lowered work section, open shelves, a small fridge and a two-seat table at the
> end. Warm under-cabinet light, daylight from the window. Functional, hand-built,
> lived-in.

### A5. Living room — looking out at nature
> Interior view from the living area looking out through the south sliding glass
> doors. 24 mm lens, camera at 1.6 m, slightly to one side so the room frames the
> view. Foreground: a simple sofa, low timber table, a chair angled to the glass.
> Through the doors: the covered porch, then cedar and white pine, then a low
> glimpse of Heron Lake and the far shore. The lake is more suggested than
> dominating. Late-afternoon light, soft reflections on the glass, no people.

### A6. Covered porch seating
> Eye-level seated view on the covered south porch of the Woodland Cottage,
> camera at 1.2 m looking out from the chairs toward the garden and lake glimpse.
> Two simple timber chairs and a small low table on a level deck, roof overhang
> above, exposed porch posts, cedar and pine beyond, soft late light. Show the
> step-free threshold and the garden doors behind. Quiet, shaded, accessible,
> intimate.

---

# B. Offset Stack

**Architecture:** two 40-foot modules, two storeys. Ground module timber with
living, kitchen, bathroom and stair. Upper module pale salvaged metal, offset
2.6 m east, with sleeping, bathroom, studio and storage. Shed roof at 8°.
Covered ground porch under the offset and a small upper balcony. **Site:** Birch;
sunlit birch glade, low rock shoulder, forest floor visible beneath trunks.

### B1. Front approach — whole house
> Front-on eye-level perspective from the main east approach, 35 mm lens, camera
> about 18 m away. A two-storey container home: a dark timber ground-floor module
> with a pale metal upper module shifted clearly to one side, creating a covered
> ground-floor outdoor room under the overhang. 8° shed roof, dark window frames,
> steel connections visible at the offset. Entry door on the east face at ground
> level, stair window above, and a small upper balcony on the south face. The
> upper east opening is a door; the south balcony has no recorded door on that
> face, so treat access as unresolved. Show the whole two-storey mass, the offset
> and the covered porch. Background:
> sunlit birch glade, white birch trunks, low rock shoulder, scattered pine.

### B2. Ground-floor living room
> Interior shot of the ground-floor living room in a two-storey offset-stack
> container home. 24 mm lens, eye height 1.5 m. A long, narrow room with timber-
> lined walls, a sofa facing the south sliding doors, a low table, a chair, a
> floor lamp and open shelving. The ceiling is the underside of the upper module;
> a structural beam and steel connection are visible where the upper volume bears.
> Daylight from the south doors; a north stair window lights the far end. Warm,
> compact, honest structure.

### B3. Ground-floor kitchen
> Interior shot of the kitchen along the south wall of the ground-floor module.
> 24 mm lens, eye height 1.5 m. Compact L-shaped kitchen with timber fronts, dark
> counter, a south window over the sink, open shelves, a slot for a small fridge
> and a two-seat table. The upper module creates a lower ceiling near the offset;
> show the change in ceiling height and the structural edge. Daylight, warm wood,
> simple fittings.

### B4. Ground-floor bathroom
> Interior shot of a compact ground-floor bathroom beside the stair. 24 mm lens,
> eye height 1.5 m. Walk-in shower, wall-hung toilet, small vanity, a high north
> window, timber ceiling, dark tile floor, grab-bar blocking. The stair is just
> visible through the door. Clean, warm, modest, no luxury styling.

### B5. Stair
> Interior shot looking up the straight-run stair in a two-storey container home.
> 24 mm lens, camera at the foot of the stair, eye height 1.5 m. Steel-and-timber
> stair with a simple handrail, a landing at the top, a north window throwing light
> across the treads, exposed container wall and a glimpse of the upper floor.
> Compact but safe-looking; no open risers, no floating fantasy stair.

### B6. Upper sleeping room
> Interior shot of the upper-floor bedroom in the offset upper module. 24 mm lens,
> eye height 1.5 m. A double bed under a north window, pale metal-lined walls with
> timber accents, a low dresser, a chair, a small rug. The room feels like a calm
> retreat above the trees. Daylight from the north window and the east upper
> door; the modeled south balcony has unresolved access. Birch canopy visible
> outside. Quiet, private, simple.

### B7. Upper bathroom
> Interior shot of the small upper bathroom. 24 mm lens, eye height 1.5 m. Shower,
> toilet, compact vanity, a high window, pale walls, timber ceiling, dark floor.
> No bathtub. Daylight from a small window; restrained fittings.

### B8. Upper studio
> Interior shot of the upper studio in the offset module. 24 mm lens, eye height
> 1.5 m. A long desk under the south window, a task chair, shelves, a pinboard, a
> daybed or reading chair at the end. Pale metal walls, timber floor, black window
> frames. Birch glade visible through the south window; strong daylight. A
> workspace in the trees, tidy but used.

### B9. Upper storage
> Interior shot of a narrow upper storage room. 35 mm lens, eye height 1.5 m.
> Built-in timber shelving, storage boxes, a small high window, exposed metal wall
> and ceiling structure. Clean, dry, uncluttered. No decorative styling.

### B10. Living room — looking out at nature
> Interior view from the ground-floor living area looking south through the
> sliding doors, under the overhang created by the offset upper module. 24 mm lens,
> camera at 1.6 m. Foreground sofa and low table; frame of the covered outdoor room;
> beyond it, a sunlit birch glade, white trunks, forest floor and a low rock
> shoulder. The upper module shades the top of the opening. Late-afternoon light,
> dappled birch shadows, no people.

### B11. Covered ground porch seating
> Eye-level seated view in the covered outdoor room beneath the offset upper
> module. Camera at 1.2 m, looking out from two simple chairs and a low table
> toward the birch glade. Deep roof shadow overhead, bright glade beyond, exposed
> steel connection and timber soffit visible. Show the covered outdoor room as a
> genuine outdoor living space. Calm, shaded, sheltered.

### B12. Upper balcony
> Eye-level view from the modeled upper south balcony, camera at 1.2 m looking out
> over the birch canopy. A simple metal guardrail, two folding chairs, a small side
> table. The balcony has no recorded door on the south face; do not show a door
> onto it. Birch tops and the low rock shoulder beyond. Show the guardrail clearly;
> the view is elevated but not vertiginous. Late light, quiet.

---

# C. Courtyard Residence

**Architecture:** two 40-foot single-storey modules in an L, flat roof with a
green-roof concept, timber cladding, sheltered courtyard, covered porch and
courtyard deck. Rooms: sleeping, bathroom, dining and living in the long module;
kitchen, workspace, storage and circulation in the short module. **Site:** Pine;
a long view west between pine trunks to a narrow strip of lake; more water than
sky.

### C1. Front approach — whole house
> Front-on eye-level perspective from the main east approach, 35 mm lens, camera
> about 18 m away. A single-storey L-shaped container home around a sheltered
> courtyard: two 40-foot timber modules, one running left-right and one rotated
> 90° to form the L, joined by a glazed link. Flat roof with a low green-roof edge, deep overhangs,
> timber cladding, dark windows. Entry door on the east face of the long module.
> Show the whole L, the courtyard opening, the covered porch edge and the garden
> beyond. Background: mature white pine and hemlock; a narrow strip of lake light
> between trunks. Calm, horizontal, grounded.

### C2. Sleeping room
> Interior shot of the ground-floor bedroom in the long module, away from the
> courtyard. 24 mm lens, eye height 1.5 m. Double bed under a south window, timber
> walls, built-in wardrobe, a chair, a small rug, a bedside lamp. Soft daylight
> from the south; the courtyard side is solid for privacy. Simple, calm, private.

### C3. Bathroom
> Interior shot of the ground-floor bathroom. 24 mm lens, eye height 1.5 m.
> Walk-in shower, wall-hung toilet, timber vanity, a high south window, dark floor
> tile, grab-bar blocking. Warm timber ceiling, soft daylight. Accessible without
> looking clinical.

### C4. Dining room
> Interior shot of the dining area opening to the courtyard. 24 mm lens, eye
> height 1.5 m. A timber table for four, simple chairs, a low pendant light, a north
> window and the courtyard sliding doors. Through the glass: the covered porch, a
> planted courtyard and pine trunks. Warm, sociable, not formal.

### C5. Living room
> Interior shot of the living room at the courtyard corner. 24 mm lens, eye height
> 1.5 m. A low sofa, two chairs, a timber coffee table, a shelf with books and
> pottery, a wood stove or small heat source only if it fits the concept. Large
> north sliding doors open to the courtyard; a west window shows pine trunks and a
> strip of lake. Daylight from two sides. Calm, generous, connected to the garden.

### C6. Kitchen
> Interior shot of the kitchen in the perpendicular module. 24 mm lens, eye height
> 1.5 m. A long timber kitchen with a dark counter, open shelves, a north window
> over the sink, a courtyard window, a freestanding table and a clear route to the
> courtyard doors. Warm daylight, simple fittings, a working kitchen.

### C7. Workspace
> Interior shot of the flexible workspace in the perpendicular module. 24 mm lens,
> eye height 1.5 m. A long desk under a south window, a task chair, shelves, a
> pinboard, a daybed, a courtyard window on the north side. Timber walls, dark
> window frames, pine trunks outside. Quiet, flexible, not a corporate office.

### C8. Storage
> Interior shot of the compact storage room. 35 mm lens, eye height 1.5 m. Timber
> shelving, hooks, storage boxes, a small high window, a clear floor. Dry, tidy,
> utilitarian.

### C9. Circulation / courtyard link
> Interior shot of the covered circulation route between the two modules. 24 mm
> lens, eye height 1.5 m. A short glazed link with a timber floor, a view into the
> courtyard on one side and into the kitchen on the other, a bench and coat hooks.
> Daylight from the courtyard, a glimpse of pine trunks. The link feels like a
> porch, not a corridor.

### C10. Living room — looking out at nature
> Interior view from the living room through the north courtyard doors and the
> west window. 24 mm lens, camera at 1.6 m. Foreground sofa and low table; the
> covered porch frames a planted courtyard with ferns, a small tree and a timber
> deck; beyond, white pine trunks and a narrow strip of lake light. The courtyard
> is sheltered but open to the sky. Late-afternoon light, soft reflections, no
> people.

### C11. Courtyard porch and deck seating
> Eye-level view from the covered courtyard porch, camera at 1.2 m, looking across
> the timber deck to the planted courtyard. A small outdoor table with four chairs,
> a bench along the wall, potted ferns and a low planter, the L of the house
> framing two sides. Roof overhang above, pine trunks beyond the courtyard opening.
> Show the sheltered outdoor room and the level, step-free deck. Calm, green,
> private.

---

# D. Cross-Stacked Retreat

**Architecture:** two 40-foot modules, two storeys. Ground module dark metal with
living, kitchen, bathroom and stair. Upper module pale timber, rotated 90° to
cross the ground module, with sleeping, bathroom, studio and storage. Butterfly
roof at 12°. Shaded ground porch under the cross. **Site:** Moss; the beaver
meadow, open sedge, alder and standing water, south knoll and rock shoulder beyond.

### D1. Front approach — whole house
> Front-on eye-level perspective from the main east approach, 35 mm lens, camera
> about 20 m away. A two-storey cross-stacked container home: a dark metal ground
> bar running left-right, crossed at 90° by a pale timber upper bar, creating a
> strong cross silhouette and a deep shaded outdoor room beneath the crossing.
> Butterfly roof with two shallow slopes meeting at a central valley, dark window
> frames, visible steel connections at the crossing. Entry door on the east face of
> the ground module; an upper east door, with no modeled balcony. Show the whole cross, the
> shaded porch and the meadow beyond. Background: beaver meadow, sedge, alder,
> standing water, low rock shoulder. Late light, long shadows.

### D2. Ground-floor living room
> Interior shot of the ground-floor living room beneath the cross. 24 mm lens, eye
> height 1.5 m. A sofa, two chairs, a low table, a shelf, a floor lamp. The ceiling
> changes where the upper module crosses; show the structural beam and the shaded
> outdoor room through the south sliding doors. North window lights the back wall.
> Warm, grounded, slightly moody because of the cross volume.

### D3. Ground-floor kitchen
> Interior shot of the kitchen along the south wall. 24 mm lens, eye height 1.5 m.
> Compact kitchen with timber fronts, dark counter, a south window, open shelves,
> a small table for two. The upper cross volume lowers the ceiling near one end;
> show the structural edge. Daylight from the south, warm wood, simple fittings.

### D4. Ground-floor bathroom
> Interior shot of the ground-floor bathroom. 24 mm lens, eye height 1.5 m.
> Walk-in shower, wall-hung toilet, small vanity, high window, dark tile, timber
> ceiling, grab-bar blocking. Clean, warm, modest.

### D5. Stair
> Interior shot looking up the dog-leg stair at the east end of the ground module.
> 24 mm lens, eye height 1.5 m. Steel-and-timber stair, landing, handrail, a north
> window lighting the treads, exposed container wall, a glimpse of the upper floor.
> Compact, safe-looking, no open risers.

### D6. Upper sleeping room
> Interior shot of the upper bedroom in the crossing timber module. 24 mm lens,
> eye height 1.5 m. Double bed under a south window, timber-lined walls, a low
> dresser, a chair, a rug. The butterfly roof is an exterior form; the interior
> ceiling is not modeled, so do not invent a ridge or valley line. Daylight from
> the south and east upper door; no balcony is modeled. Alder and meadow visible
> outside. Quiet, tucked-in, distinctive.

### D7. Upper bathroom
> Interior shot of the upper bathroom. 24 mm lens, eye height 1.5 m. Shower,
> toilet, compact vanity, high window, timber ceiling, dark floor. Simple, clean,
> no luxury styling.

### D8. Upper studio
> Interior shot of the upper studio in the crossing module. 24 mm lens, eye
> height 1.5 m. A long desk under the south window, task chair, shelves, pinboard,
> a daybed. Timber walls, dark frames. The butterfly roof is visible outside; do
> not invent an interior ceiling. Meadow and alder through the south window. A quiet
> workspace with a strong roof line.

### D9. Upper storage
> Interior shot of the narrow upper storage room. 35 mm lens, eye height 1.5 m.
> Timber shelving, storage boxes, a small high window, exposed structure, clear
> floor. Dry, tidy, utilitarian.

### D10. Living room — looking out at nature
> Interior view from the ground-floor living room looking south through the
> sliding doors, beneath the cross volume. 24 mm lens, camera at 1.6 m. Foreground
> sofa and low table; the shaded porch frames the beaver meadow: sedge, alder,
> standing water and the low rock shoulder beyond. The upper cross volume shades
> the top of the opening. Late-afternoon light, still water, no people. The meadow
> is the subject, not the room.

### D11. Shaded porch seating
> Eye-level seated view in the shaded outdoor room beneath the cross volume.
> Camera at 1.2 m, looking out from two chairs and a low table toward the meadow.
> Deep roof shadow overhead, bright meadow beyond, exposed steel connection and
> timber soffit visible. A bench along the wall. Show the outdoor room as a cool,
> sheltered place to sit. Quiet, contemplative, slightly dramatic.

---

# E. Accessible Garden Home

**Architecture:** two 20-foot single-storey modules side by side, wide low
footprint, canopy roof, timber cladding, step-free entrance, 1.0 m entrance door,
1.2 m circulation target, ground-floor bedroom, adaptable bathroom and kitchen,
covered terrace and level deck. **Site:** Fern; fern, hemlock and a distant plane
of lake light; more forest than water.

### E1. Front approach — whole house
> Front-on eye-level perspective from the south garden side (the site path
> approach is east), 35 mm lens, camera about 14 m away. A wide, low single-storey home made of two 20-foot container
> modules side by side, with a shallow canopy roof extending over a covered
> south-facing terrace. Timber cladding, dark window frames, a wide 1.0 m step-free
> entrance door, a garden sliding door and a level deck. Show the whole low
> footprint, the canopy, the terrace and the step-free route. Background: fern,
> hemlock and yellow birch, with a distant plane of lake light through the trees.
> Calm, accessible, grounded, not institutional.

### E2. Living room
> Interior shot of the living room in the north module. 24 mm lens, eye height
> 1.5 m. A sofa, two chairs, a low table, open shelves, clear 1.2 m circulation
> route, a north window looking into fern and hemlock, and an internal wide opening
> to the bedroom module. Timber walls, warm white ceiling, slip-resistant floor.
> Soft daylight, calm, uncluttered, easy to move through.

### E3. Kitchen
> Interior shot of the adaptable kitchen. 24 mm lens, eye height 1.5 m. A lowered
> work section, clear knee space, varied counter heights, timber fronts, a north
> window, open shelves, a small table. Clear turning space in front of the counter,
> lever taps, simple fittings. Daylight, warm wood, practical.

### E4. Sleeping room
> Interior shot of the ground-floor bedroom in the south module. 24 mm lens, eye
> height 1.5 m. A double bed with clear space on both sides for a 1.5 m turning
> circle, built-in wardrobe, a chair, a rug, a north internal opening to the living
> room, and a south window. Soft daylight, calm, accessible, not clinical.

### E5. Bathroom
> Interior shot of the adaptable bathroom. 24 mm lens, eye height 1.5 m. Walk-in
> shower with a low threshold, wall-hung toilet, vanity with clear space beneath,
> grab-bar blocking, a west high window, slip-resistant floor, timber ceiling.
> Clear transfer space. Warm, clean, dignified.

### E6. Storage / utility
> Interior shot of the compact storage and utility room. 35 mm lens, eye height
> 1.5 m. Timber shelving, a washer/dryer or utility sink only if it fits, storage
> boxes, a small high window, clear floor. Dry, tidy, practical.

### E7. Living room — looking out at nature
> Interior view from the living room looking north through the wide window and
> internal opening toward the garden. 24 mm lens, camera at 1.6 m. Foreground
> sofa and low table; beyond the glass, fern, hemlock, yellow birch and a distant
> plane of lake light. The room is low and calm; the forest fills the opening.
> Late-afternoon light, soft green reflections, no people. The view is more forest
> than water.

### E8. Covered terrace seating
> Eye-level seated view on the covered south terrace, camera at 1.2 m looking out
> from two chairs and a small table toward the garden. A level deck with no step,
> a wide sliding door behind, the canopy roof above, fern and hemlock beyond. Show
> the clear step-free route from the door to the terrace and garden. Quiet,
> accessible, sheltered, domestic.

---

# F. Solar Studio Stack

**Architecture:** two 20-foot modules, two storeys. Ground module timber with
living, kitchen, bathroom and compact stair. Upper module pale metal with studio
and sleeping, offset 0.8 m. Solar-ready shed roof at 12°, south overhang, covered
terrace. **Site:** Juniper; the southern cove of Heron Lake through juniper and
cedar, opposite shore close enough to read the rock.

### F1. Front approach — whole house
> Front-on eye-level perspective from the south garden/lake side (the site path
> approach is north-east), 35 mm lens, camera about 15 m away. A compact two-storey home made of two 20-foot container modules,
> the pale metal upper module slightly offset from the dark timber ground module.
> A 12° solar-ready shed roof with dark PV panels on the south slope, a deep south
> overhang and a covered terrace. Ground-floor entry door and living sliding door;
> upper studio glazing and an east upper door; no balcony is modeled. Show the
> whole compact mass, the roof and the terrace. Background: juniper, cedar and red pine, the southern cove of
> Heron Lake with the opposite rocky shore. Late-afternoon light.

### F2. Ground-floor living room
> Interior shot of the compact ground-floor living room. 24 mm lens, eye height
> 1.5 m. A two-seat sofa, a chair, a low table, a wall shelf, a south sliding door
> to the terrace, a north kitchen window beyond. Timber walls, pale ceiling, dark
> frames. The room is small but not cramped; the glazing makes it feel open.
> Daylight, warm wood, simple.

### F3. Ground-floor kitchen
> Interior shot of the compact kitchen. 24 mm lens, eye height 1.5 m. A short
> galley along the north wall, timber fronts, dark counter, a north window, open
> shelves, a small fridge, a two-seat table. Clear route to the living room.
> Daylight, practical, compact.

### F4. Ground-floor bathroom
> Interior shot of the compact bathroom. 24 mm lens, eye height 1.5 m. Shower,
> wall-hung toilet, small vanity, high west window, dark floor, timber ceiling,
> grab-bar blocking. Clean, warm, modest.

### F5. Compact stair
> Interior shot looking up the compact stair. 24 mm lens, eye height 1.5 m. The
> model records an alternating-tread stair; its usability and code acceptability
> are unresolved. Timber treads, steel stringer, a simple handrail, a landing or
> turn, a small window lighting the stair, exposed container wall. Do not present
> it as an acceptable permanent-residence solution.

### F6. Upper studio
> Interior shot of the upper studio. 24 mm lens, eye height 1.5 m. A long desk
> under the south glazing, task chair, shelves, pinboard, a daybed. Pale metal
> walls, timber floor, dark frames, the shed ceiling visible. Juniper and the lake
> cove through the south glazing; strong daylight. A small, bright workspace.

### F7. Upper sleeping area
> Interior shot of the upper sleeping area. 24 mm lens, eye height 1.5 m. A double
> bed or Murphy bed under the north window, a low dresser, a chair, a rug, the shed
> ceiling above. Pale metal walls, timber floor. Quiet, compact, private.

### F8. Living room — looking out at nature
> Interior view from the ground-floor living room looking south through the
> sliding doors. 24 mm lens, camera at 1.6 m. Foreground sofa and low table; the
> covered terrace frames juniper, cedar and red pine, then the southern cove of
> Heron Lake and the opposite rocky shore. The upper module’s offset shades the top
> of the opening. Late-afternoon light on the water, no people. The cove is the
> subject.

### F9. Covered terrace seating
> Eye-level seated view on the covered south terrace, camera at 1.2 m looking out
> from two chairs and a small table toward the lake cove. A level deck, the wide
> living sliding door behind, the upper module and roof overhang above, juniper and
> cedar framing the water. Show the shaded terrace as a place to sit and watch the
> cove. Calm, private, sheltered.

### F10. Upper east door / unresolved balcony
> Eye-level view from the upper level beside the east door, camera at 1.2 m looking
> south over the juniper and cedar toward the lake cove. The model records a door
> but no balcony, so do not draw a balcony, guardrail or chair outside it. Show the
> compact scale and the unresolved access condition in the accompanying notes. The
> opposite rocky shore is close enough to read. Late light, quiet.

---

# Reusable prompt template

For a new home or a new shot, use:

> **[Shared base prompt]** + **[House description: storey count, module
> arrangement, roof form and pitch, cladding, entrance side, room list, outdoor
> spaces]** + **[Shot: camera position, lens, what must be visible, what must not
> be added]** + **[Site and view: the assigned nature view]** + **[Shared negative
> prompt]**

Keep the house description identical across all shots of one home. That is the
main trick for getting a coherent set rather than six unrelated images.
