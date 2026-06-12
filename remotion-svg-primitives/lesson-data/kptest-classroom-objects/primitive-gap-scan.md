# Primitive Gap Scan for kptest-classroom-objects

## Teaching Actions and Requirements

| Teaching Action | Requirements (from TEACHING-ACTIONS.md) | Reuse? | Primitive Used (if reused) | Notes |
|-----------------|-----------------------------------------|--------|----------------------------|-------|
| model-target-slow | **visual/layout**: the target glyph big, centered, nothing on top, held at least its spoken length.<br>**component**: a large glyph / `DialogueExchange` emphasis turn. | Yes | `target-word` (literacy) | Matches exactly: displays a single word big and centered with nothing on top. |
| invite-echo | **visual/layout**: a clear "your turn" cue. | Yes | `pointer-hand-arrow` (interaction) | Use variant=`hand` with appropriate direction (e.g., down) to show a pointing hand gesture. Animates via progress (nudges and scales in). |
| replay | **requires**: nothing new — reuse the same voiced clip and visual from the earlier cue. | Yes | (N/A) | No primitive needed; reuse audio and visual from the reveal cue. |
| spaced-recall | **visual/layout**: the live highlight / punctuation lands on the currently-spoken item.<br>**component**: a recap stack + a single live marker. | Yes | `icon-asset` (asset) for each object icon (to form the recap stack)<br>`read-along-highlight` (motion) for the live highlight | Place three `icon-asset` (pencil, pen, ruler) in a row to form the recap stack. Use `read-along-highlight` to sweep a highlight across the icons, marking the currently-spoken item. |
| Topic-Intro Card | Normalized lesson intro card (title + section/unit eyebrow + one-line KP teaser) as mandated by CLAUDE.md. | Yes | `lesson-intro-card` (literacy) | Fits the subject: can display the lesson title (e.g., "Classroom Objects") and optional teaser. No custom layout needed. |

## Gap Summary
All teaching actions and the topic-intro card can be satisfied by existing primitives. No gaps detected.

## New Primitives to Build
None.

## Primitives Reused (Inventory)
- `target-word` (literacy)
- `pointer-hand-arrow` (interaction)
- `icon-asset` (asset)
- `read-along-highlight` (motion)
- `lesson-intro-card` (literacy)

## Verification
All reused primitives are present in the authoritative catalog (`src/capabilities/catalog-digest.md`) and are exported via the barrel (`src/shape-primitives/index.ts`). The registry is drift-gated; running `npm run registry:check` must pass.
