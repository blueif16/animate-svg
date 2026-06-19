# capability-gallery — criteria (the judging bar)

_What a GOOD audit surface + a good preview looks like. The standing reference the human eye judges against — **the human is the eye for visuals here.** A judging fixture, NEVER injected into a producing prompt. Generalize every line; never encode the one component in front of you._

## The gallery surface
- **Previews are honest** — a card animates only if the component TRULY moves; no "live" badge on 45-identical-frame loops.
- The **true-size view is accurate by construction** — the component renders at its real DEFAULT size, 1:1, inside the to-scale 1280×720 frame (no `scale(0.4)` thumbnail hacks that make a small `label-callout` and a big `place-value-mat` look identical). Relative sizes across components are readable.
- Every component **appears** (has `demoProps`) — `check-gallery.mjs` green; nothing built-but-invisible.

## The agent digest (`catalog-digest.md`)
- Leads with the **`intent` selection sentence**, exposes **`avoidWhen`**, hides `source`, and is not truncated — an agent picks correctly from the digest alone.

## The visual-critic's taste
- Flags **decorative-no-referent** FX (a ring/sparkle/arrow with nothing it points at), **flat/unrecognizable** primitives at render size, **sub-legible** text (< 36px floor), and **on-teaching-mark overlays** (decoration sitting on the dots).
- Does **not** false-flag a legitimate background (`zone:"decoration"`) or a design-intent caption subset.
- One pass, no N-vote (user directive); full-res frames in, not the downscaled sheet.

## Red flags (known failure modes)
- A specks-and-false-warnings true-size view → the preview used the bare design unit, not the in-context group/default.
- A decorative asset (`pulse-circle`/`glow-pulse`/`glint-flash`/`shine-sweep`, a default arrow) survives the audit because it was reviewed on a bare screenshot, not on the gallery with its referent.
- A too-small default left flagged-but-unfixed → the rule is raise-the-default + re-render + human final eye, never flag-and-leave.
