# capability-registry — criteria (the judging bar)

_What a GOOD registry + a good item looks like. The standing reference the human/steward judges against; sharpened as the system matures. **A judging fixture — NEVER injected into an authoring prompt** (that teaches-to-the-test). Generalize every line across all future items; never encode the one in front of you._

## The registry as a whole
- `npm run registry:check` is **GREEN** — all 6 gates pass, the documented count matches, zero drift between `primitive-registry.json` and the code it claims to describe.
- `catalog-digest.md` reads as a **usable selection menu**: each row leads with its `intent` sentence, shows `avoidWhen`, and is **not truncated** (no `;`-split eating half the sentence). An agent can pick the right component from the digest alone.
- **No deprecated id is visible to or citable by an agent** — deprecated entries are absent from the agent digest (gallery Legacy band only); any live→deprecated reference fails the gate.

## A single LIVE item
- **Lesson-agnostic + prop-driven** — bakes no topic, value, count, or Chinese/English string; behavior comes from props.
- Has a hand-authored **`intent`** that is a real *selection sentence* ("use this to …"), not a keyword bag — and the two best disambiguators vs its siblings are visible (`avoidWhen`: "not for X; use `<sibling>`").
- Its **default size IS its good size** (CAPABILITIES.md §A) — renders legibly at the 36px floor (5% frame height) at real render size; carries a `demoProps` entry so the gallery can preview it.
- Sits in the right tier (ATOM → MODIFIER → COMPOSITE → INFRA); a composite is not mis-filed as a motion atom.

## Red flags (known failure modes)
- A sibling wrong-pick or a duplicate-build → the digest prose was thin/ambiguous/truncated (the composing model picked on a half-sentence).
- "ISSUES: None" laundered a deprecated reuse → membership-only checking instead of liveness.
- A new entry that describes a built-but-unwired capability (export missing) → drift the gate should have caught.
