<!-- LEG A memory for `w5-render` (per memory-slices SKILL.md). Optimizer-facing STANDING STATE — lessons +
     open threads, never a run transcript or a changelog (git is the log; query it, don't duplicate it here).
     Bounded (~40 lines, top-loaded); only the optimizer's MEMORIZE step (or a human) edits this file via
     append/update/retire, never a full rewrite. NEVER injected into any node's runtime prompt. -->

# w5-render — memory

## Lessons

### render-loudnorm-silently-skips-on-failure
recurrence: 1 (observed directly on a pre-harness historical artifact — `out/fen-yu-he/fen-yu-he.mp4` — not a
piflow-tracked run; `w5-render` has no run-ledger history yet under this template, so this is a runway-authoring
finding, not a cross-run count)
[[render-pipeline]]
**Root:** `render-complete-lesson.mjs`'s 2-pass ffmpeg loudnorm block (main() line ~278) wraps the whole
measure→apply→verify sequence in a try/catch that WARNS and continues on any failure — by design, so a missing
ffmpeg never blocks a render. But nothing downstream ever re-checks whether the master actually landed the
-16 LUFS / -1 dBTP target; `checks.post` only asserts the mp4 is non-empty. Verified directly: re-measuring
`fen-yu-he.mp4`'s actual loudness gave I=-17.22 LUFS, TP=-4.56 dBTP — outside the ±1/-1 target — while every
existing gate (this node's + `lesson-measured.mjs`'s LUFS gate, which only ever sees a pre-render voice proxy or
a stale prior master, per its own `lesson-measured.mjs:760-803` comments) would have reported this run clean.
**Prevention:** landed as CODE, not prose (there is no agent here to instruct) — `node.json` `optimize.measure`
now runs `measure-render.mjs`, which independently re-measures the DELIVERABLE mp4's loudness and fails the
`render-stream-sanity-gate` if it's outside tolerance. See `criteria.md` "Wiring" for the validity proof (fires
on this exact historical case, 5/6 → correctly flags `lufsWithinTolerance`).

## Open threads (known runway gaps, not yet observed failures — see `criteria.md` "Open items")
- **No expected-duration cross-check.** `durationFloorMet` (≥2s) is a sanity floor, not a correctness oracle for
  "matches the reconciled timeline's length." Closing it needs a cross-node read of `w3-5-reconcile`'s output —
  deliberately deferred, not forgotten.
- **Stale contact-sheet risk.** `make-contact-sheet.mjs`'s call site swallows its own errors; `checks.post` only
  asserts non-empty, not fresh, so a failed regen could in principle hide behind a prior run's PNG. Would need a
  freshness/mtime check kind that doesn't exist in `CHECK_KINDS` today.
- **Step-label coupling.** `render-loudnorm-completed`'s regex gate keys on the LITERAL string
  `"Loudnorm verify (re-measure)"` in `render-timing.json` — re-sync this gate if `render-complete-lesson.mjs`'s
  loudnorm section is ever relabeled (a prior script version used a single `"Loudnorm (-16 LUFS / -1 dBTP)"`
  step name; historical `_logs/render-timing.json` files under other lessonIds still show that older shape).
