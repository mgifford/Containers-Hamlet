# Phase 2 screenshots

These screenshots were captured from the generated static site on 2026-11-22
with Chromium at 1280 × 900 unless noted. They are visual review aids, not
drawings for construction.

| Image | What it shows |
| --- | --- |
| `six-homes-comparison.png` | The six residences from the same generated isometric camera and a common card size. The framing is illustrative, not a measured same-scale drawing; it is used for the visual acceptance question: can the homes be distinguished without labels or colour? |
| `gallery-top.png` | The gallery hero, six-hamlet section, archive link and the revised public explanation. |
| `residences-top.png` | The hamlet-wide comparison, sorting/filtering controls, accessible table and the stated evidence boundaries. |
| `residences-full.jpg` | The full comparison page, including the diversity assessment, six cards, structural/accessibility summaries and stacked-versus-single-storey translations. |
| `editor-top.png` | The editor hero, preset selector, level selector, plan and toolbar. |
| `editor-full.jpg` | The full editor with stacking, roof, accessibility, views, support, warnings and downloads. |
| `architecture-top.png` | A generated architectural gallery with 14 views, the accessible slideshow and drawing-type badges. |
| `offset-stack-architecture.png` | The Offset Stack architectural page, including its two-storey geometry and review status. |
| `offset-stack-elevation.png` | The Offset Stack south elevation with both storeys, floor levels, roof, porch and 7.3 m height. |
| `offset-stack-north.png` | The Offset Stack north elevation. The mirrored roof and opening projection are checked against the same geometry. |
| `offset-stack-section.png` | The Offset Stack building section with levels, rooms, stair and roof. |
| `offset-stack-exploded.png` | The Offset Stack exploded-level view. Storeys are separated for reading only. |
| `compare-top.png` | The two-concept comparison with massing, floor area, accessibility and structural status. |

## Visual acceptance questions

1. **Can the six residences be distinguished without labels or colour?**
   Yes in this review. The cottage is a low single-storey gable; the Offset
   Stack has two offset volumes; the Courtyard Residence is a large L with a
   flat green roof; the Cross-Stacked Retreat is a perpendicular cross with a
   butterfly roof; the Accessible Garden Home is a wide low pair under a canopy;
   the Solar Studio Stack is a compact two-storey volume with a solar-ready
   shed roof. The primary-feature similarity check finds no pair above 0.8.

2. **Do plans, elevations, sections and the site preview describe the same
   buildings?**
   They are generated from one design object. The static checks rebuild every
   view and compare it byte-for-byte with the committed SVG; the browser checks
   confirm the views load and the editor updates them together. The site preview
   uses the same module footprints and reports storey count, ground coverage and
   height. The site plan itself still uses the authoritative Cabin A/pair/lodge
   geometry; the Design Lab assignment is illustrative.

3. **Does the interface explain the consequences of one storey versus two?**
   The residences page compares each two-storey home with a derived single-storey
   translation: the same modules moved to the ground. Ground coverage increases,
   the stair disappears, and the accessibility classification changes. The
   structural review register stays visible for the stacked version.

4. **Does a two-storey design become a single-storey alternative with roughly
   equivalent usable area?**
   The derived translation keeps the same gross floor area and removes the upper
   storey. It is a geometry comparison, not a redesign. It deliberately does not
   claim that the alternative is better; it exposes the change in ground
   coverage, roof area, foundation area and vertical access.

## Manual review still required

These screenshots do not replace manual screen-reader, keyboard, zoom, forced
colours, voice-control or disabled-user testing. They also do not replace a
professional structural, envelope, fire or accessibility review.
