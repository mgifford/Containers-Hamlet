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

`tools/check.mjs` checks the SVG titles and descriptions, unique ids, heading order, labels, image dimensions, links, licences, privacy, the landscape and view data, and the absence of third-party requests. It runs 242 static checks; the main browser suite runs 73 checks. `tools/check-design-lab.mjs` adds 704 schema, geometry, envelope, vegetation, solar, foundation, five-view, gallery and comparison checks, and `tools/design-lab-check.mjs` adds 143 browser checks for the gallery, editor, architectural slideshow, vegetation guide, ground guide and comparison.

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

The architectural slideshow is a progressive enhancement over a static list of all five figures.

- **No autoplay.** Nothing advances on a timer. The controls are visible only when the script runs; without JavaScript all five figures are shown in order.
- **Keyboard.** The slide region is focusable. Left/Right move one view, Home/End move to the ends; the visible Previous/Next buttons are native buttons. Show all views exposes the non-carousel alternative.
- **Announcement.** A polite status announces the current view and total. The images have descriptive `alt` text and visible captions.
- **Drawing types.** Plan, cutaway and porch detail are labelled geometry-backed drawings; exterior and winter images are labelled illustrative studies. Colour is not the only distinction.
- **Comparison.** The two side-by-side panels and all-concepts table use native selects, buttons and a caption/scope table. Without JavaScript the default pair and the table remain.
- **Thermal explanations.** The editor gives plain-language explanations of overheating, heat loss, condensation and moisture without claiming code compliance or certified performance.
- **Patterns and shelter.** The pattern guide uses labelled tables, a titled/described configuration diagram, native links and a visible entry-shelter explanation. The editor paint palette and shelter controls are native selects, number inputs and checkboxes.
- **Foundations and bridge.** The foundation system is a native select, clearance is a number field, and no-compaction/independent-deck are checkboxes. The foundation section is a keyboard-scrollable labelled group. The ground guide uses native tables with captions and scope headers; the bridge diagram has a title, description and visible caveats.
- **Solar.** Solar tilt and azimuth are native number fields; the strategy is a native select. The solar section is a keyboard-scrollable labelled group. The exterior view labels `PV 39° / 180°`; the plan adds a solar arrow and text. No energy or snow-shedding claim is made.
- **Envelope and vegetation.** The wall-section container is keyboard-scrollable and labelled; assembly and planting controls are native selects, numbers, text fields and buttons. Seasonal and exposure panels use headings, lists and a caption/scope table. The wall section is a complex image with a text title/desc and a layer legend; the exposure panel repeats the approximate areas as text.
- **Tested.** Browser checks cover no autoplay, keyboard movement, Show all, image loading, no-JavaScript fallback, envelope/vegetation persistence, seasonal changes, 320 px, dark scheme, forced colours, reduced motion, gallery-to-editor navigation and axe-core. Manual screen-reader testing is still required.


The gallery is a static page: all nine concepts, their facts, three views, source files and licence links are present without JavaScript. Every gallery image has descriptive alt text and dimensions; the containing `<details>` elements are native and keyboard operable.

The editor adds:

- native labelled inputs, selects and checkboxes, grouped in fieldsets with legends;
- visible focus on every control and button;
- keyboard-operable add/remove, undo/redo, preset, export and import actions;
- `role="status"` messages for loading, imports, exports, undo/redo and assessment changes;
- three generated SVG views, each with `role="img"`, a `<title>` and a `<desc>`;
- a hamlet preview with a text label describing the homesite, conflicts and the fact that it is illustrative;
- a no-JavaScript message and a link back to the static gallery;
- 320 px reflow, dark mode and forced-colours support, with drawings retaining their colours;
- reduced-motion support (no animations).

The editor does **not** yet support screen-reader or disabled-user testing, direct visual dragging, or a full keyboard Tab-walk test for every generated control. That work remains manual. The hamlet preview is explicitly illustrative and is not a privacy or sightline assessment.

The Design Lab's physical building accessibility is a separate question from WCAG. The editor's accessibility prompts (door widths, bathroom zones, door swings) are design review reminders, not a CSA B651 or building-code assessment. A qualified accessibility consultant must review any real home.
