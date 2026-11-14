# Accessibility

**Target:** WCAG 2.2 Level AA for the website. The building concepts carry their own accessibility notes, to be verified against CSA B651 and the applicable building code; they are not claims of compliance.

## How the site is built for access

- **Progressive enhancement.** Without JavaScript, every drawing is shown, every table is present and a static cutaway replaces the explorer. Controls that need the script stay `hidden` until it runs.
- **Native controls first.** Drawing and explorer options are native radio buttons and checkboxes in `fieldset`s with `legend`s. Building and room choices are `button`s with `aria-pressed`. There are no custom widgets that need their own keyboard handling.
- **One route per action.** On the site map, the seven buttons beside the map are the keyboard and screen reader route. Clicking a building on the map is a pointer shortcut to the same action.
- **Text alternatives.** Each generated SVG has `role="img"` and is labelled by a `<title>` and a generated `<desc>` (dimensions, rooms, layout). On the page, images have short `alt` text, and the room, siting, passport and review tables carry the detail. The explorer's SVG gets a new `aria-label` and visible caption on every change. Room selections are announced through a `role="status"` message.
- **No information by colour alone.** Pressed and checked states add a ✓ glyph, bold text and a border. No-build zones are hatched as well as coloured, and screens and buffers are dashed.
- **Focus.** Every focus stop has a 3 px outline (a light colour on the dark header and footer). The skip link moves focus to `main`.
- **Reflow and spacing.** No horizontal scrolling at 320 px, including with WCAG text-spacing overrides. Wide tables scroll inside a focusable, labelled region. Interactive targets are at least 24 px, and most are 40 to 44 px.
- **Motion.** Nothing animates. Smooth scrolling is used only under `prefers-reduced-motion: no-preference`.
- **Colour schemes.** Light and dark schemes meet contrast requirements. Drawings keep a light "paper" background in both, and keep their colours in forced-colours mode (`forced-color-adjust: none`), where interactive states switch to system colours.
- **Low-vision zoom.** Every drawing and the site plan link to the full-size SVG, which stays sharp at any zoom.

## Automated testing (CI)

`tools/browser-check.mjs` runs axe-core (WCAG 2.0 to 2.2, A and AA) on five page states. It also checks:

- a full Tab walk: visible focus on every stop, nothing obscured, no keyboard trap
- keyboard operation of every control
- reflow and text spacing at 320 px, and the 24 px target size
- reduced motion, forced colours and dark mode
- the page with its scripts blocked

`tools/check.mjs` checks the SVG titles and descriptions, heading order, labels, unique ids, image dimensions, links and the absence of third-party requests.

## Known limitations and work still needed

- **No assistive technology testing yet.** The site has not been tested with screen readers (NVDA, JAWS, VoiceOver, TalkBack), voice control, magnification software or switch access, or by disabled people. Automated tools find only part of the issues.
- **Drawings are complex images.** The text alternatives give the key facts; they do not replace the drawing. A structured, navigable description of the floor plan (room by room, wall by wall) would help non-visual users more.
- **The site map's labels are small on narrow screens.** The full-size SVG link mitigates this but does not solve it.
- **Explorer labels** can overlap at some viewpoints.
- **SVG text inside images** is not translated by browser translation tools.

Please report barriers through a GitHub issue. Do not include personal information.
