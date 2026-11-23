# Reference-conditioned image generation

**Status:** Implemented as a network-free planning and reference-rendering tool with
opt-in OpenAI, Replicate and local adapters. No provider is called by default.

The point is to stop asking a text model to invent a container home from a long
paragraph. Each image now has:

- a **Pattern Language cue** that leads the prompt;
- a compact geometry prompt;
- a **deterministic reference drawing** that carries massing, module count, roof
  form, opening positions and proportions;
- the finished-envelope facts (205 mm added wall, deep reveals, roof and floor
  insulation);
- a negative prompt and a seed.

## Default: plan and render only

```sh
node tools/generate-reference-images.mjs
```

This:

1. reads the 14 **pattern-led default** records in
   [`data/image-descriptions.json`](../data/image-descriptions.json) (15 with
   `--include-optional`);
2. resolves each record's `generation.reference` drawing under
   `site/design-lab/views/`;
3. renders it to PNG under
   `screenshots/v2-generation/references/<image-id>.png`;
4. writes `screenshots/v2-generation/manifest.json` with the pattern cue, prompt,
   negative prompt, reference, seed and status.

No network request is made. The `screenshots/` folder is git-ignored.

Useful options:

```sh
node tools/generate-reference-images.mjs --no-render          # plan only, no browser
node tools/generate-reference-images.mjs --only woodland-cottage-exterior-hero
node tools/generate-reference-images.mjs --limit 4
node tools/generate-reference-images.mjs --reference-style gray
node tools/generate-reference-images.mjs --keep-reference-text
node tools/generate-reference-images.mjs --include-optional   # adds the service-core detail
```

`--reference-style gray` desaturates the drawing; text labels are hidden by
default so they do not leak into the generated image.

## Opt-in synthesis

### OpenAI Images

```sh
OPENAI_API_KEY=... node tools/generate-reference-images.mjs \
  --provider openai --model gpt-image-1 --limit 2
```

Uses the image-edit endpoint with the rendered reference and the composed
pattern-led prompt. The output size defaults to `1536x1024`.

### Replicate / FLUX Kontext

```sh
REPLICATE_API_TOKEN=... node tools/generate-reference-images.mjs \
  --provider replicate --model black-forest-labs/flux-kontext-pro --limit 2
```

Sends the reference as a data URL and polls the prediction. `--model` can be
changed to another Kontext-style model that accepts `input_image`.

### Local mflux

```sh
MFLUX_BIN=/path/to/mflux-generate-flux2-edit \
  node tools/generate-reference-images.mjs --provider local \
  --model flux2-klein-4b --limit 2
```

The local adapter assumes the mflux FLUX.2 edit CLI. It is not installed in this
repository and was not run here; the 4B local run was too heavy for the working
laptop. The adapter is provided for a dedicated machine.

## Pattern defaults

The default image set is chosen for Pattern Language fit. The five primary
patterns are:

| Pattern | Meaning for the image |
| --- | --- |
| 112 · Entrance Transition | path, porch and a sheltered threshold before the shared room |
| 127 · Intimacy Gradient | a public-to-private sequence with a clear threshold |
| 159 · Light on Two Sides | openings on more than one face, balanced daylight |
| 163 · Outdoor Room | a porch, terrace or courtyard with floor, shelter and edge |
| 180 · Window Place | a comfortable place to sit at a window |

Supporting patterns: 104 Site Repair, 105 South Facing Outdoors, 106 Positive
Outdoor Space, 155 Old Age Cottage and 171 Tree Places. The service-core detail
is explicitly supporting and is **outside the default set**; add it with
`--include-optional` when the fire/water service story needs it.

Each ready record has `patterns`, `patternRole` and `patternCue`. The generation
harness composes:

```
patternCue
+ "Use the attached drawing for massing, openings and proportions; do not add or
   remove elements."
+ generation.prompt
```

The geometry prompt still ends with the no-people/no-text/no-watermark
constraint.

## Reference choices

| Image type | Reference |
| --- | --- |
| Exterior heroes | `site-facing.svg` |
| Fire and water edges | `elevation-south.svg` |
| Accessible entry | `elevation-south.svg` |
| Envelope reveal | `site/design-lab/systems/wall-mineral-wool.svg` (via `referencePath`) |
| Interiors and service core | `interior-plan.svg` |

The reference is a **concept drawing**, not a photograph. It biases the output
toward the drawing's stylised trees, flat colours and axonometric view. Hiding
text removes labels but not the drawing style. A future version should add a
line/depth extraction step or use the orthographic elevations for the most
geometry-critical images.

## Manifest and review

Each generated image gets an entry with:

- `id`, `designId`, `patterns`, `patternRole`, `patternCue`;
- `prompt`, `negativePrompt`, `seed`, `risk`;
- `referenceSvg`, `referencePng`, `referenceStyle`, `referenceSize`;
- `status` (`planned`, `existing`, `generated`, `failed`), `output`, `error`;
- `knownDeviations` for generated images (initially empty).

A generated draft is not publishable until a human has reviewed it against the
description and recorded the specific deviations — invented dormer, wrong width,
added steps, missing PV, etc. A generic "not a construction drawing" caption is
not enough. Worked examples of that review are in
[`image-review-woodland-cottage-2026-11-23.md`](image-review-woodland-cottage-2026-11-23.md)
for the first home,
[`image-review-offset-stack-2026-11-23.md`](image-review-offset-stack-2026-11-23.md)
for the Offset Stack and
[`image-review-accessible-garden-home-2026-11-23.md`](image-review-accessible-garden-home-2026-11-23.md)
for the Accessible Garden Home and
[`image-review-courtyard-residence-2026-11-23.md`](image-review-courtyard-residence-2026-11-23.md)
for the Courtyard Residence.

## Checks

```sh
node tools/check-reference-generation.mjs
```

The check is network-free. It verifies the default plan covers the 14 pattern-led images (15 with `--include-optional`), every
prompt starts with its pattern cue and includes the reference instruction, every
seed is reproducible, every reference exists, every primary pattern is covered,
and the service-core detail is supporting only.

`npm run check` includes this check.

## Security and privacy

- No provider is called without an explicit `--provider`.
- API keys are read from `OPENAI_API_KEY` or `REPLICATE_API_TOKEN`; they are
  never written to the manifest or printed.
- The default plan writes only local files under the git-ignored `screenshots/`
  folder.
- The published site has no network calls; this is an offline tool.

## Related

- [`image-descriptions.md`](image-descriptions.md)
- [`image-generation-findings.md`](image-generation-findings.md)
- [`pattern-lens.md`](pattern-lens.md)
- [`visualisation-v2-brief.md`](visualisation-v2-brief.md)
- [`../data/image-descriptions.json`](../data/image-descriptions.json)
