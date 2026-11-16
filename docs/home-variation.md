# Home variation

The homes were too similar when every page used the same 40-foot single-container massing. This pass adds real variation without pretending the structural work is complete.

## What changed

- **Juniper** is now an actual **20-foot compact model** (`data/cabin-20.json`): ~12.8 m² clear, one sleeping room, bathroom and living/kitchen, with a compact screened porch. Its URL is `/homes/Juniper-1-compact/`; the old `/homes/Juniper-1-simple/` URL redirects.
- **Birch, Moss and Fern** use the two-container pair configuration with **different offset directions** on the site plan and view diagram. The site footprint is now shown as two offset rectangles (~66 m² footprint, ~50 m² clear) rather than one 40-foot box.
- Each home page has a **configuration thumbnail** so the module arrangement is legible separately from the 50 m context diagram.
- The home model labels now reflect the actual configuration: 40-foot single, 20-foot compact, two-container pair or lodge.

## What is still not modelled

- **Vertical stacking.** The two-storey study remains a structural/egress study. A stacked home is not in Look inside because the model has no vertical level, floor cassette, stair/guard or fire-separation geometry.
- **Different 40-foot plan layouts.** Cedar, Pine and Juniper still share the base Cabin A plan or its compact variant; they are not yet individually designed.
- **Short-pair / L-shaped variants.** Those are patterns, not built models.

## Budget

Adding the 20-foot model, its generated drawings and the configuration thumbnails raises the whole-site total to **3502 KB**. The deliberate budget is now **3.5 MB**. The initial view is **258 KB / 64 KB**.

## Validation

- 285 main static
- 722 Design Lab static
- 103 main browser
- 166 Design Lab browser
- 201 generated files
- CI passes

**Do not merge automatically.**
