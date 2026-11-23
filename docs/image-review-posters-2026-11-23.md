# Review: six home posters (PDF)

**Status:** The poster set is the **strongest presentation layer** in the project
so far: a consistent format, room-zone diagrams instead of room layouts, design
text with limitations, a form/outdoor-space line and a disclaimer. **None of the
PDFs is publishable as-is.** The blockers are:

1. **Accessibility.** Every PDF is untagged and vector/image-only: no text
   layer, no `/Lang`, no `/StructTreeRoot`, no `/MarkInfo`, no `/Alt`, no
   `/ActualText`, no `/Outlines`, and the document title is just the filename.
   A screen reader gets nothing; the plans have no text description. For this
   project, that is the biggest blocker.
2. **The hero images are the known-rejected candidates**, and the posters'
   generic "illustrations are interpretive" line does not disclose the specific
   deviations (PV, balcony, material, glazing, bath, site).
3. **The Courtyard plan is unreadable** — the zone labels collide and overlap.
4. **The Accessible poster's hero image contradicts its own plan and text**
   (a U massing against a side-by-side plan).
5. **The Cross-Stacked hero shows a forbidden upper balcony**, a red metal upper
   and no PV.
6. **Woodland, Offset and Cross-Stacked omit the PV** that the model records.

**Subject:** 11 PDF files — six unique one-page posters, one six-page
compilation, and four byte-identical duplicates:

| File | Pages | Content | Duplicate of |
| --- | --- | --- | --- |
| `woodland-cottage.pdf` | 1 | 01 Woodland Cottage | — |
| `woodland-cottage-1.pdf` | 1 | 01 Woodland Cottage | `woodland-cottage.pdf` (same SHA-256) |
| `offset-stack.pdf` | 1 | 02 Offset Stack | — |
| `offset-stack-1.pdf` | 1 | 02 Offset Stack | `offset-stack.pdf` (same SHA-256) |
| `offset-stack-2.pdf` | 1 | 02 Offset Stack | `offset-stack.pdf` (same SHA-256) |
| `courtyard-residence.pdf` | 1 | 03 Courtyard Residence | — |
| `cross-stacked-retreat.pdf` | 1 | 04 Cross-Stacked Retreat | — |
| `accessible-garden-home.pdf` | 1 | 05 Accessible Garden Home | — |
| `solar-studio-stack.pdf` | 1 | 06 Solar Studio Stack | — |
| `all-six-cottage-posters.pdf` | 6 | Pages 1–6: the six posters in order | — |
| `all-six-cottage-posters-1.pdf` | 6 | Same six-page compilation | `all-six-cottage-posters.pdf` (same SHA-256) |

The six-page compilation is a straight collection of the six posters, not a
separate document. Page 1 is Woodland, 2 Offset, 3 Courtyard, 4 Cross-Stacked,
5 Accessible, 6 Solar.

## What the posters get right

- **A consistent, legible format:** title, subtitle, one main view, three
  detail insets, a room-zone diagram, "The Design", "Design Considerations",
  "Form & Outdoor Space", a footer and a source line.
- **Room-zone diagrams, not room layouts.** This is the correct move for homes
  with provisional or blocked interiors. The labels "provisional layout" and
  "authored layout" are honest in most cases.
- **Design limitations are stated**, which the image sets never did:
  - Offset: "The 2.6 m offset requires unresolved structural support or transfer
    engineering. Upper-level rooms depend on an internal stair."
  - Courtyard: "The green roof and courtyard connections are conceptual;
    drainage, structure and the provisional room layouts need validation."
  - Cross-Stacked: "The upper module has major unsupported spans… Structural
    feasibility is unresolved and must not be inferred from the renderings."
  - Accessible: "The design includes a 1.2 m circulation target and a modeled
    1.5 m turning circle. It is not professionally verified as accessible."
  - Solar: "The solar-ready shed roof is conceptual. The compact
    alternating-tread stair and upper-level access require particular code and
    usability review; no balcony is modelled."
  - Woodland: "The model includes a step-free design intent and an indicative
    turning circle in the bathroom. Approach gradients, fixtures and
    construction details still require assessment."
- **The Solar poster is the best of the six.** It is the only one that names the
  stair warning and the no-balcony condition, and its zone diagram (Living,
  Kitchen, Bath, Stair; Studio, Sleeping) matches the model.
- **The footer is honest:** "Concept imagery and schematic plans. Fictional
  site; not for construction, sale or compliance assessment… All illustrations
  are interpretive and may differ from modelled geometry."
- **The set is internally consistent** in type, colour, numbering and order.

## Critical issue 1 — the PDFs are inaccessible

This is not a styling problem. The files are untagged, vector/image exports:

- no text layer: no extractable text in any content stream; the visible text is
  drawn as outlines;
- no `/Lang` (no language);
- no `/StructTreeRoot` or `/MarkInfo` (no tags);
- no `/Alt`, `/ActualText` or `/Outlines` (no image alternatives, no
  bookmarks/table of contents);
- the `/Title` metadata is the filename (`woodland-cottage`, `offset-stack`,
  etc.);
- no `/Metadata` or XMP;
- the six-page compilation has no cover, contents or page bookmarks.

A screen reader would announce nothing but an untitled document. The main
photos, the three insets and the zone diagrams have no text alternatives, and
the plans have no textual description of the zones, relationships or
dimensions.

For an accessibility-focused project, the posters need either:

1. an **accessible HTML companion** with real headings, text, alt text for every
   image, a text description of each plan, and a reading order; or
2. a **tagged PDF** (PDF/UA) with real text, `/Lang`, a document title, alt text
   for the main and inset images, a text description of the plans, tags and
   reading order, and bookmarks/contents for the compilation.

Until then, the posters are a print/visual artefact only. They should not be the
only published version of the six homes.

## Critical issue 2 — the hero images are the rejected candidates

The posters use the most attractive candidate images from the reviews, but those
images carry known hard failures. The generic "illustrations are interpretive"
line is true but not enough; the project's own standard asks for the specific
deviations.

### 01 Woodland Cottage — `woodland-cottage.pdf`

- **Hero:** the conventional gable cottage with **no PV**. The model records an
  installed PV array on the south slope; the "Form & Outdoor Space" line
  ("Gable roof / 24 degrees | Covered garden porch") omits it. The image also
  lacks the container expression and deep reveals the model requires.
- **Plan:** the zones (Bedroom, Bath, Entry, Kitchen, Living) match the authored
  room order, but the poster says "authored layout" without noting that the
  interior hero is `blocked-pending-reconciliation`; the plan omits the covered
  porch.
- **Text:** the step-free/turning-circle note is good; the main omission is PV.

### 02 Offset Stack — `offset-stack.pdf`

- **Hero:** the upper cantilever sits over the ground porch. The model puts the
  porch at the west and the upper offset east, so the cantilever is over the
  east entry, not the porch. This is the reversed relationship identified in the
  Offset Stack review. The image also has no PV.
- **Plan:** the ground zones (Living, Kitchen, Bath, Stair) and upper zones
  (Sleeping, Bath, Studio, Storage) match the model; the plan omits the porch.
- **Text:** the 2.6 m transfer note is good, but the text says "sheltered outdoor
  room" as if the image's composition were the model's. It is not.

### 03 Courtyard Residence — `courtyard-residence.pdf`

- **Hero:** the L with green roofs, black metal wings and very large glazing. The
  model is timber-clad with a documented opening schedule; the image is the
  black-metal candidate. No PV is shown, which is correct for this home.
- **Plan:** the room-zone diagram is **broken**. "Link zone", "Storage",
  "Workspace", "Kitchen", "Sleeping", "Bath", "Dining" and "Living" collide and
  overlap in a skinny stack; the L is not legible. This is a publication
  blocker on its own.
- **Text:** the green-roof/drainage caveat is good; the plan does not support it.

### 04 Cross-Stacked Retreat — `cross-stacked-retreat.pdf`

- **Hero and insets:** the "Elevated Perspective" inset shows a **large upper
  terrace with a railing**; the set therefore publishes the balcony condition
  the model forbids ("no balcony, deck or guardrail at the upper east door").
  The upper is red metal where the model is timber, and there is no PV.
- **Plan:** the ground zones (Living, Kitchen, Bath, Stair) and upper zones
  (Storage, Studio, Bath, Sleeping) are correct, but the upper plan is drawn as
  a vertical column; the model's upper module is rotated 90° and crosses the
  ground. The cross is lost.
- **Text:** the unsupported-span note is good; the poster does not mention the
  no-balcony condition or the beaver-meadow site.

### 05 Accessible Garden Home — `accessible-garden-home.pdf`

- **Hero:** the green-metal U with a central link and a garden. The model is
  **two 20 ft modules side by side** (6.47 × 5.70 m) with living/kitchen in one
  and bedroom/bath in the other. The poster's own plan is a side-by-side 2 × 3
  grid and its text says "Two short containers placed side by side" — so the
  **hero image contradicts the plan and text.**
- **Plan:** the grid (Bedroom/Bathroom; Living/Kitchen/Storage) is the right
  side-by-side arrangement, but it omits the 4.6 × 2.8 m terrace, the 1.4 m
  internal opening and the 1.5 m bathroom circle. The Bathroom is a plain block;
  the accessible bathroom is not shown.
- **Text:** the 1.2 m/1.5 m note is good, but "authored layout" should say the
  interior hero is blocked; the hero image has no bathroom and green metal
  cladding where the model is timber.

### 06 Solar Studio Stack — `solar-studio-stack.pdf`

- **Hero:** the two-storey cabin with the upper metal box, lower timber, a solar
  array, a covered terrace and the cove. The roof form is cropped and does not
  clearly demonstrate the 12° shed; the full candidate exteriors read as gables.
  The poster says "solar-ready shed"; the image must prove it.
- **Plan:** the zones (Living, Kitchen, Bath, Stair; Studio, Sleeping) match the
  model; the plan omits the 4.4 × 2.4 m terrace.
- **Text:** the best of the six — it names the alternating-tread stair and the
  no-balcony condition. The "Upper Studio" inset shows a desk **and a bed**; the
  model's studio has no bed, and the interior is a provisional zone study.
- **Verdict:** the closest to publishable because the text is honest; the hero
  roof, the deck/terrace and the inset bed still need correction.

## Critical issue 3 — the plans

The zone diagrams are the right idea, but they need a second pass:

| Poster | Plan issue |
| --- | --- |
| Woodland | "Authored layout" but the interior hero is blocked; porch omitted |
| Offset | Zones correct; porch omitted |
| Courtyard | **Unreadable**: labels collide; the L is a skinny stack |
| Cross-Stacked | Upper plan is a column; the perpendicular cross is lost |
| Accessible | Grid is right for the model but contradicts the U hero image; terrace, 1.4 m opening and 1.5 m circle omitted |
| Solar | Zones correct; terrace omitted |

A plan on a poster does not need dimensions, but it must be legible, must match
the hero image and the text, and must show the one feature the home is about —
the porch, the courtyard, the cross, the side-by-side pair, the terrace.

## Critical issue 4 — the compilation

The six-page `all-six-cottage-posters.pdf` is a straight collection of the six
posters. It inherits every issue above and adds:

- no cover, contents or bookmarks;
- no page labels as text;
- no reading order;
- duplicate files (`-1`, `-2`) that add nothing.

If the compilation is the published artefact, it needs a cover, a contents page,
bookmarks, page labels, and the same accessibility treatment as the posters.

## What would make the posters publishable

1. **Fix accessibility.** Publish an accessible HTML version with headings,
   real text, alt text for every image and a text description of every plan, or
   a tagged PDF/UA with `/Lang`, title, tags, alt text, plan descriptions,
   reading order and bookmarks. Add a cover/contents and page labels to the
   compilation.
2. **Replace the hero images or caption them with the specific deviations.** The
   cleanest route is to regenerate the heroes from the corrected model, or use
   the canonical exterior drawings on the poster and keep the images as
   "concept" thumbnails.
3. **Add the specific known deviations to each poster**, not only the generic
   "illustrations are interpretive" footer:
   - Woodland: no PV, no container expression, blocked interior.
   - Offset: porch under the cantilever, no PV.
   - Courtyard: black metal vs timber, oversized glazing, unreadable plan.
   - Cross-Stacked: upper balcony/railing, red metal upper, no PV, forest site.
   - Accessible: U image vs side-by-side model, no bathroom, green metal,
     blocked interior.
   - Solar: gable/cropped roof vs shed, deck/terrace, studio bed.
4. **Redraw the plans:** Courtyard legible; Cross-Stacked cross; Accessible
   align with its plan and add terrace/opening/circle; add porches/terraces to
   Woodland, Offset and Solar; mark the blocked interiors as blocked.
5. **Fix the text:** Woodland/Accessible "authored layout" → "blocked pending
   reconciliation"; Offset "sheltered outdoor room" → the model's porch
   position; Solar "shed" must match the image; "Heron Lake" is fine (the cove
   is on Heron Lake), but the site brief says cove/juniper/cedar.
6. **Deduplicate** the `-1`/`-2` files and decide whether the all-six
   compilation or the six single posters is the deliverable.
7. **Test the result:** screen reader, keyboard, PDF/UA checker, and a printed
   proof at A3/A2; the current text is small at 916 × 648 preview.

## Recommendation

- **Keep the poster format.** It is the best communication layer the project has
  produced: the zone diagrams and the design/limitations text are exactly the
  right move.
- **Do not publish the current PDFs.** They are untagged/vector-only and carry
  the rejected hero images.
- **Fix accessibility first**, because it is the project's central value and the
  hardest to retrofit.
- **Then fix the hero images, the Courtyard plan, the Accessible image/plan
  contradiction, the Cross-Stacked balcony and the missing PV.** The Solar
  poster is the closest; use it as the model for the other five.
- **Use the six single posters as the source of truth**, and rebuild the
  compilation from them with a cover, contents and bookmarks; drop the
  duplicates.

## Limits of this review

- Visual review of the rendered pages and a metadata/stream inspection of the
  PDFs; no PDF/UA validator, screen-reader session or professional accessibility
  audit was run.
- The PDF text is outlined, so the review reads the rendered text; no claim is
  made about the exact wording beyond what is visible.
- The posters use the candidate images; the image-specific findings are carried
  over from the six home reviews.
- The all-six pages were checked in order; pages 4 (Cross-Stacked) and the
  remaining details are covered by the per-home posters.
- No structural, energy, fire, planning or code assessment is made or implied.

## Related

- [`image-review-solar-studio-stack-2026-11-23.md`](image-review-solar-studio-stack-2026-11-23.md)
- [`image-review-cross-stacked-retreat-2026-11-23.md`](image-review-cross-stacked-retreat-2026-11-23.md)
- [`image-review-courtyard-residence-2026-11-23.md`](image-review-courtyard-residence-2026-11-23.md)
- [`image-review-accessible-garden-home-v2-2026-11-23.md`](image-review-accessible-garden-home-v2-2026-11-23.md)
- [`image-review-accessible-garden-home-2026-11-23.md`](image-review-accessible-garden-home-2026-11-23.md)
- [`image-review-offset-stack-2026-11-23.md`](image-review-offset-stack-2026-11-23.md)
- [`image-review-woodland-cottage-2026-11-23.md`](image-review-woodland-cottage-2026-11-23.md)
- [`image-descriptions.md`](image-descriptions.md)
- [`visualisation-v2-brief.md`](visualisation-v2-brief.md)
- [`../data/image-descriptions.json`](../data/image-descriptions.json)
