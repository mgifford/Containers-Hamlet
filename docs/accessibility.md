# Accessibility

**Target:** WCAG 2.2 Level AA for the website. The building concepts carry their own accessibility notes, to be verified against CSA B651 and the applicable building code; they are not claims of compliance.

## How the site is built for access

- **Progressive enhancement.** Without JavaScript, every drawing is shown, every home brief is present, every view diagram is present, every table is present and a static cutaway replaces the explorer. Controls that need the script stay `hidden` until it runs.
- **Native controls first.** Drawing, explorer and home options are native radio buttons and checkboxes in `fieldset`s with `legend`s. Building and room choices are `button`s with `aria-pressed`. There are no custom widgets that need their own keyboard handling.
- **One route per action.** On the site map, the seven buttons beside the map are the keyboard and screen reader route. Clicking a building on the map is a pointer shortcut to the same action. The home selector and the map share the same data, so choosing a home in either place announces the same information.
- **Text alternatives.** Each generated SVG has `role="img"` and is labelled by a `<title>` and a generated `<desc>` (dimensions, rooms, layout or view geometry). The map has a long generated description covering the lake, wetland, woodland, rock, buffers, access, view directions and each building. On the page, images have descriptive `alt` text, and the home briefs, siting table, passport and review tables carry the detail. The explorer's SVG gets a new `aria-label` and visible caption on every change. Room and building selections are announced through a `role="status"` message.
- **Home briefs.** Each home has a structured brief with a view diagram, setting, orientation, main and secondary views, nearby buildings, path, winter conditions, screened porch, design note and siting summary. The briefs are native radio tabs with the script and all seven are visible without it.
- **No information by colour alone.** Pressed and checked states add a ✓ glyph, bold text and a border. No-build zones are hatched as well as coloured, rock is hatched, screens and buffers are dashed, view arrows are labelled with their target, and every map layer has a text key.
- **Focus.** Every focus stop has a 3 px outline (a light colour on the dark header and footer). The skip link moves focus to `main`. "Show on the map" moves focus to the matching map button.
- **Reflow and spacing.** No horizontal scrolling at 320 px, including with WCAG text-spacing overrides. Wide tables, the map and the comparison table scroll or shrink inside labelled regions. Interactive targets are at least 24 px, and most are 40 to 44 px.
- **Motion.** Nothing animates. Smooth scrolling is used only under `prefers-reduced-motion: no-preference`.
- **Colour schemes.** Light and dark schemes meet contrast requirements. Drawings, view diagrams and the concept illustration keep a light "paper" background in both, and keep their colours in forced-colours mode (`forced-color-adjust: none`), where interactive states switch to system colours.
- **Low-vision zoom.** Every drawing, the site plan and every view diagram link or resolve to a full-size SVG, which stays sharp at any zoom.

## Automated testing (CI)

`tools/browser-check.mjs` runs axe-core (WCAG 2.0 to 2.2, A and AA) on five page states. It also checks:

- a full Tab walk: visible focus on every stop, nothing obscured, no keyboard trap
- keyboard operation of every control, including the home tabs, map layers and "Show on the map"
- the view diagram's alt text and actual image load
- reflow and text spacing at 320 px, and the 24 px target size
- reduced motion, forced colours and dark mode
- the page with its scripts blocked, including all seven home briefs and view diagrams
- same-origin requests, no third-party requests and all local links

`tools/check.mjs` checks the SVG titles and descriptions, unique ids, heading order, labels, image dimensions, links, licences, privacy, the landscape and view data, and the absence of third-party requests. It runs 466 static checks; the main browser suite runs 107 checks. `tools/check-design-lab.mjs` adds more than 2,200 schema, vertical-geometry, stacking, support, diversity, accessibility, roof, rendering and comparison checks, and `tools/design-lab-check.mjs` adds 194 browser checks for the gallery, residences, editor, architectural slideshow, vegetation guide, ground guide and comparison.

## Manual testing still required

Automated tools find only part of the issues. Before calling the site accessible, a person should:

1. **Screen reader, desktop.** With VoiceOver (macOS) or NVDA (Windows), read the page from the top. Confirm the skip link, headings, map description, home tabs, home briefs, view diagram alt text, drawings, tables and downloads are understandable in reading order. Check that dynamic map, home and explorer updates are announced once, not twice.
2. **Screen reader, mobile.** With VoiceOver (iOS) or TalkBack (Android), check the map, home tabs and explorer controls at 390 px and at 200% text.
3. **Keyboard only.** Tab through the page without a pointer. Confirm the skip link, map selector, layer toggles, home tabs, drawing tabs, explorer, "Show on the map" and downloads are operable, with visible focus and no trap. Confirm focus does not jump to a hidden home brief.
4. **Zoom and reflow.** At 400% browser zoom / 320 CSS px, check that nothing is clipped, the map remains readable through the full-size SVG, and the table scroll regions are labelled and keyboard-scrollable.
5. **Forced colours and dark mode.** Confirm map layers, view arrows, home tabs and explorer states remain distinguishable and that no text disappears.
6. **Reduced motion.** Confirm no smooth scrolling or other motion when the preference is set.
7. **Voice control and switch access.** Check that visible labels match accessible names for the map, home and explorer controls.
8. **Disabled people.** Test with people who use these technologies and with people with cognitive, low-vision and motor disabilities. Their experience, not this checklist, decides whether the site is usable.

Record the browser, assistive technology, version, page state and result in the pull request or an issue. Do not include personal information.

## Known limitations and work still needed

- **No assistive technology testing yet.** The site has not been tested with screen readers (NVDA, JAWS, VoiceOver, TalkBack), voice control, magnification software or switch access, or by disabled people. Automated tools find only part of the issues.
- **The map is dense.** Labels are small on narrow screens. The full-size SVG, the text description, the home briefs and the siting table mitigate this but do not replace the map.
- **View diagrams are geometric.** They show the principal view cone, target and nearby buildings; they do not prove what a person will see through vegetation, in winter or at eye height.
- **Drawings are complex images.** The text alternatives give the key facts; they do not replace the drawing. A structured, room-by-room navigable description would help non-visual users more.
- **SVG text inside images** is not translated by browser translation tools.

Please report barriers through a GitHub issue. Do not include personal information.


## Design Lab accessibility

The architectural slideshow is a progressive enhancement over a static list of every figure, including plans, four elevations, a section, exploded levels and solar studies.

- **No autoplay.** Nothing advances on a timer. The controls are visible only when the script runs; without JavaScript every figure is shown in order.
- **Keyboard.** The slide region is focusable. Left/Right move one view, Home/End move to the ends; the visible Previous/Next buttons are native buttons. Show all views exposes the non-carousel alternative.
- **Announcement.** A polite status announces the current view and total. The images have descriptive `alt` text and visible captions.
- **Drawing types.** Plans, elevations, section, exploded levels and cutaway are labelled geometry-backed drawings; exterior, porch, winter and solar studies are labelled illustrative or explanatory studies. Colour is not the only distinction.
- **Floor-specific plans.** The plan level is a native select. When one floor is selected, the other floor remains as muted outlines rather than disappearing. The level is also announced in text.
- **Stacking controls.** Storey selection, elevation, stack, align, offset, rotate, perpendicular arrangement and support inspection are native buttons, selects and number inputs. Drag-and-drop is a shortcut only. Page Up/Page Down change the level and A shows all levels when a plan module has focus.
- **Residences comparison.** The hamlet-wide table is a caption/scope table with native select and button sorting/filtering, a polite status message and a complete no-JavaScript fallback. The similarity and alternatives tables are also caption/scope tables.
- **Comparison.** The two side-by-side panels and all-concepts table use native selects, buttons and a caption/scope table. Without JavaScript the default pair and the table remain.
- **Thermal explanations.** The editor gives plain-language explanations of overheating, heat loss, condensation and moisture without claiming code compliance or certified performance.
- **Patterns and shelter.** The pattern guide uses labelled tables, a titled/described configuration diagram, native links and a visible entry-shelter explanation. The editor paint palette and shelter controls are native selects, number inputs and checkboxes.
- **Foundations and bridge.** The foundation system is a native select, clearance is a number field, and no-compaction/independent-deck are checkboxes. The foundation section is a keyboard-scrollable labelled group. The ground guide uses native tables with captions and scope headers; the bridge diagram has a title, description and visible caveats.
- **Solar.** Solar tilt and azimuth are native number fields; the strategy is a native select. The solar section is a keyboard-scrollable labelled group. The exterior view labels `PV 39° / 180°`; the plan adds a solar arrow and text. No energy or snow-shedding claim is made.
- **Envelope and vegetation.** The wall-section container is keyboard-scrollable and labelled; assembly and planting controls are native selects, numbers, text fields and buttons. Seasonal and exposure panels use headings, lists and a caption/scope table. The wall section is a complex image with a text title/desc and a layer legend; the exposure panel repeats the approximate areas as text.
- **Tested.** Browser checks cover no autoplay, keyboard movement, Show all, image loading, no-JavaScript fallback, envelope/vegetation persistence, seasonal changes, 320 px, dark scheme, forced colours, reduced motion, gallery-to-editor navigation and axe-core. Manual screen-reader testing is still required.


The gallery is a static page: all sixteen concepts, their facts, plans, elevations, source files and licence links are present without JavaScript. The six hamlet residences are separated from the preserved archive. Every gallery image has descriptive alt text and dimensions; the containing `<details>` elements are native and keyboard operable.

The editor adds:

- native labelled inputs, selects and checkboxes, grouped in fieldsets with legends;
- visible focus on every control and button;
- keyboard-operable add/remove, undo/redo, preset, export and import actions;
- `role="status"` messages for loading, imports, exports, undo/redo and assessment changes;
- generated plan, floor-specific plans, four elevations, section, exploded levels, solar studies, exterior and cutaway SVGs, each with `role="img"`, a `<title>` and a `<desc>`;
- a level selector, stacking buttons and a support report;
- roof-form, accessibility and stair controls, all native and labelled;
- a hamlet preview with a text label describing the homesite, storey count, ground coverage, building height, conflicts and the fact that it is illustrative;
- an axonometric massing panel with a text status;
- a no-JavaScript message and a link back to the static gallery;
- 320 px reflow, dark mode and forced-colours support, with drawings retaining their colours;
- reduced-motion support (no animations).

The editor does **not** yet support screen-reader or disabled-user testing, or a full keyboard Tab-walk test for every generated control. That work remains manual. The hamlet preview is explicitly illustrative and is not a privacy or sightline assessment.

## Building accessibility across one and two storeys

Physical accessibility is a separate question from WCAG. Each concept records:

- step-free entrance availability
- ground-floor essential functions
- entrance door clear width and threshold
- circulation target
- ground-floor bedroom and bathroom
- bathroom and kitchen adaptability
- stair type, module, width, run, rise, landing and lift reserve
- the connection to the shared hamlet path
- a vertical-access strategy

A home is **not** described as fully accessible because its entrance is
step-free or because it is single-storey. The model distinguishes:

| Classification | Meaning |
| --- | --- |
| `fully-accessible-single-storey` | Legacy label. No selected home is assigned this label. It requires documented professional evidence, not just a single storey. |
| `single-storey-step-free-candidate` | All modeled evidence targets are met: single storey, step-free, essential rooms, door/circulation widths, bathroom turning space, kitchen approach and path connection. Still not a professional certification. |
| `ground-floor-accessible-living` | Essential living and a bathroom are on the ground floor; the upper floor is reached by stairs and is not accessible. |
| `potentially-adaptable` | The home is single-storey and step-free, but an adaptable/accessibility target or evidence item remains unresolved. |
| `accessibility-not-required` | Physical accessibility is not a design target for this home. Step-free or adaptable features may still be present. |
| `unresolved-vertical-access` | A material vertical-access barrier exists. Do not describe the home as accessible. |
| `not-assessed` | Accessibility has not been recorded. |

The model never automatically sets `professionally-verified`. It warns when a
two-storey home has no stair, no lift reserve, a stair narrower than 0.86 m, no
ground-floor bedroom or essential functions, a narrow entrance, a raised
threshold or an unresolved path connection. These are project targets informed
by CSA B651 and the Ontario Building Code, not a compliance assessment.

The selected set has three single-storey and three two-storey homes.
Accessibility is a **per-building target**, not a universal requirement:

- **Woodland Cottage** and **Accessible Garden Home** are the two
  whole-home wheelchair-accessible demonstrations (`access.target: "accessible"`).
  Both are single-storey, with an authored interior, 1.5 m bathroom turning
  circle, 0.9 m or wider internal doors and a modeled circulation route.
- **Accessible Garden Home** is a double-width pair of 20-foot modules with a
  3.0 m bathroom. **Woodland Cottage** is a constrained single 40-foot module
  with a 2.8 m bathroom; its accessible layout is tighter and needs professional
  review. Both remain `potentially-adaptable` because shared-path grades,
  transfers and professional review are incomplete—not because the washroom is
  missing.
- **Offset Stack**, **Cross-Stacked Retreat**, **Solar Studio Stack** and
  **Courtyard Residence** use `access.target: "not-required"`. They are ordinary
  concept homes, not accessible units. Their bathrooms are not failed for
  lacking a turning circle, and the two-storey homes are not presented as
  wheelchair accessible.
- No home is described as fully accessible. A future accessible unit should
  budget for the extra width needed by the 1.5 m turning circle, door clearances
  and circulation.

The two-storey selected homes are not presented as wheelchair accessible.
Their ground floors may be step-free, but the upper floors are stair-only.

A future lift is not assumed to be feasible. A concept must reserve space and
record structural implications before a lift can be considered. The model does
not design a lift or claim that one can be added later.

A qualified accessibility consultant must review any real home.

## Energy and heat-pump interfaces

The energy explorer (`/design-lab/energy/`) and heat-pump explorer
(`/design-lab/heat-pumps/`) are progressive enhancements over server-rendered
tables. They use native form controls with visible labels, fieldsets and
legends, help text, a polite status region, and text results before charts.
Charts are SVG images with a title and description; the same values are always
available in a table. Scrollable chart and table regions are keyboard focusable.
The pages are tested with axe-core in light, dark, forced-colours and
320 px-reflow states, and the controls are operated by keyboard in the browser
tests.

The heat-pump assessment keeps the baseline household demand visible and labels
the additional heating/cooling electricity separately. It does not present a
single "energy score". The Accessible Garden Home assessment explicitly does not
assume wood handling or a particular medical device.

Known gaps remain: no screen-reader testing and no testing with disabled
residents. The number inputs accept direct text entry; a future version should
add step buttons and a more forgiving numeric entry pattern after user testing.
