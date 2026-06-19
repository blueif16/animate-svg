# capability-gallery — map

_The human/agent-facing AUDIT + browse surface for the whole reusable library, and the agent-facing selection digest. Free-form, no scores. Registry row: `.agents/tracked-systems.md#capability-gallery`._

**Scope reminder:** we optimize the **taste + convention markdowns** (the visual-critic prompt, the sizing standard, the `demoProps`/digest exposure rules). The gallery/digest **scripts** are wiring — out of Hermes edit-scope.

## What it is
- **`npm run gallery`** (`http://localhost:4317`) — a functionality-first, tag-filterable view of the ENTIRE library (primitives + motion + fx + IconAssets), each card a **live rendered preview** with a **true-size** mode (component at its real DEFAULT size 1:1 inside the to-scale 1280×720 frame). The canonical surface for **browsing what exists to REUSE** and **auditing decorative-vs-load-bearing**.
- **`catalog-digest.md`** — the agent-facing twin: the text menu W2a/W3b/gap-filler read to pick components (intent-leading, `avoidWhen` shown).

## The surface scripts (wiring — read to diagnose, don't edit here)
`scripts/gallery/`: `build-gallery-data.mjs` (registry → gallery JSON), `render-previews.mjs` (per-component poster + loop from `demoProps`, ~2 min, derivable), `serve.mjs`. Plus `catalog-digest.mjs` (the agent menu) + `check-gallery.mjs` (self-completing gate: a component without `demoProps` fails `registry:check`).

## What we optimize (the markdown surfaces — the owners routing points to)
| Surface | Owns | Optimize when |
|---|---|---|
| `.agents/critics/visual-critic.md` | the **taste** the vision-MCP critic applies — detect decorative-no-referent FX, flat/unrecognizable primitives, sub-legible text, on-text overlays | a real defect slips past, or a false flag fires |
| `kids-eye §1.6` + `CAPABILITIES.md §A` | the **sizing standard** (36px legibility floor = 5% frame height; default-size = good-size; too-small → raise the default, never flag-and-leave) | a true-size review surfaces specks or false warnings |
| `demoProps` conventions (in kids-eye / CAPABILITIES) | what a preview shows (a `unit` + the typical group for an atom; the focal `render()` for a composite; honest motion only) | a preview lies (false-live badge, scale-hack thumbnail) |
| the digest exposure rules | which fields the agent sees (intent first, `avoidWhen` exposed, `source` hidden) | the agent picks on the wrong/missing signal |

## Wiring — who relies on this
- **Humans** audit component quality here (decoration restraint, primitive aesthetics) — the surface for the flaw-B audit.
- **The `vision-image` MCP** (`critique_images`) reads the native critique-frames; its taste lives in `visual-critic.md`.
- **lesson-build** + **capability-gap-filler** read `catalog-digest.md` to choose REUSE targets.

## Observability (where a flaw shows)
The gallery itself (:4317), the rendered `previews/`, the `critique-frames/` (full-res, native — NOT the downscaled sheet), the `critique_images` output, `check-gallery.mjs`.

## Quality bar → `.agents/capability-gallery-criteria.md`
