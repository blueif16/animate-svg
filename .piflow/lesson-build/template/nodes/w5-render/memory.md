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

### stale-contact-sheet-no-freshness-bridge
recurrence: 1 (found by an adversarial verification pass over this node's runway itself, not a live run defect —
`w5-render` has no run-ledger history yet under this template, so this is a runway-authoring finding)
[[render-pipeline]]
**Root:** `make-contact-sheet.mjs`'s call site in `render-complete-lesson.mjs` (the "Contact sheet" step, wrapped
in a non-fatal try/catch by design) can fail or be skipped silently, leaving whichever `<lessonId>-contact.png`
was already on disk — a PRIOR run's, possibly a different/shorter cut — untouched. The soft judge in
`criteria.md` only ever reads this PNG as a still image; it has no way to know it's stale. `checks.post` only
ever asserted the PNG is non-empty, never fresh or corresponding to THIS run's mp4 — so a stale-but-visually-
clean PNG could false-green a broken/changed render exactly as the adversarial pass named.
**Prevention:** landed as CODE — `measure-render.mjs` now takes `--contact-png`/`--contact-json` and adds two
hard checks: `contactFreshness` (the PNG's mtime must not be older than the mp4's, within a 5s tolerance — a
stale prior-run PNG left behind by a swallowed regen failure fails this) and `contactDurationMatch` (the sidecar
legend JSON's own `totalDuration`/`fps` must match the mp4's ffprobe-measured duration within 2s — a CONTENT
correspondence check, so it also catches a PNG copied/touched forward from a different render, which a
mtime-only check would miss). `render-stream-sanity-gate`'s count-floor raised 6→8. See `criteria.md` "Wiring"
for the validity proof (fires on a constructed touched-mtime evasion; still passes the real fen-yu-he artifact).

## Open threads (known runway gaps, not yet observed failures — see `criteria.md` "Open items")
- **No expected-duration cross-check.** `durationFloorMet` (≥2s) is a sanity floor, not a correctness oracle for
  "matches the reconciled timeline's length"; `contactDurationMatch` (above) only ties the contact PNG to THIS
  mp4's own duration, not to the RECONCILED timeline's expected duration. Closing it needs a cross-node read of
  `w3-5-reconcile`'s output — deliberately deferred, not forgotten.
- **Step-label coupling.** `render-loudnorm-completed`'s regex gate keys on the LITERAL string
  `"Loudnorm verify (re-measure)"` in `render-timing.json` — re-sync this gate if `render-complete-lesson.mjs`'s
  loudnorm section is ever relabeled (a prior script version used a single `"Loudnorm (-16 LUFS / -1 dBTP)"`
  step name; historical `_logs/render-timing.json` files under other lessonIds still show that older shape).
