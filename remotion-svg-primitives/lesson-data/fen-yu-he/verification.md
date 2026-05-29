# fen-yu-he — verification (Wave 6)

Reviewed: `out/fen-yu-he/contact-sheet.png` (primary surface, 9 cues), cross-checked against
`out/fen-yu-he/bbox-manifest.json`, the composer test stills (`read-climax.png`, `col-climax`/
`col-complete.png`, `order-climax.png`, `slide-*.png`), `out/fen-yu-he/fen-yu-he.mp4` (frames
sampled with ffmpeg), `gemini-voice.json` + `asr-alignment.json`, and `fen-yu-he-animatic.json`
(reconciled cue windows). Graded against `pedagogy.md`. No primitive-checks/ folder exists.

## VERDICT: YELLOW

The arc teaches the KP. A child who does not know 5's splits would learn the ordered-enumeration
heart from this video: they watch one heap of five come apart, push back together, get written as a
分合式, then watch a single candy slide left one at a time while a sorted column of four 分合式
builds row by row — 1|4, 2|3, 3|2, 4|1 — and the recap lights the (1,4)-vs-(4,1) contrast. The
ordered method, completeness, and "order matters" all read. **One real defect keeps it from GREEN:**
the read-direction arrows in `read-fen-he-shi` overlap each other and the whole-number, so the cue's
declared discovery ("read both directions") is not legibly delivered. Two pedagogy-vs-brief gaps
(narration never reads the 分合式 either direction; narration never speaks the per-slide counts) are
inherited from Wave 2b/3a, audio is frozen, and the picture carries enough — recorded, not blocking.

---

## Contact-sheet teach test

The strip teaches. Reading-order is intact and each transition is a *change the child watches*, not a
tableau: intact-five → split → recombine → 分合式 → first row → column building → completed column →
order contrast. The single-candy slide with its sunshine highlight ring is visible across the slide
cue, and the right-hand column climbs 1,2,3,4 on the left part — the completeness payoff is visible at
a glance. The heart (ordered enumeration) is the strongest part of the render.

## Per-cue pass/fail (against pedagogy discovery)

| cue | discovery delivered? | note |
|---|---|---|
| `intro-title` | PASS (structural) | "五的分与合" title + "把五分开,再合起来" teaser + caption. Clean, no candies. |
| `five-whole` | PASS | five candies settle as one centered heap; nothing else moves. |
| `split-into-two` | PASS | coral divider draws on, candies separate (shown as 1\|4 — pre-stages the ordered start, continuous with later cues). |
| `recombine-inverse` | PASS | two heaps slide back to one centered heap, divider gone — reverse of prior cue reads clearly. |
| `read-fen-he-shi` | **PARTIAL/FAIL** | 分合式 (5 / 1 / 4) draws above quieted candies — the WRITTEN form lands. BUT the two read-direction arrows render as near-identical vertical loops over/through the "5" card (bbox-manifest: read-arrow-1 and read-arrow-2 both `[616,160,48,204]`), obscuring the whole numeral and NOT distinguishing top-down 分成 from bottom-up 组成. The cue's "read both directions" discovery is not legibly delivered. |
| `first-ordered-split` | PASS | candies settle to 1\|4, first 分合式 settles into the top column slot. |
| `slide-one-at-a-time` | PASS | one candy slides right→left, sunshine highlight on the active candy, column rows freeze in order (1,4)→(2,3)→(3,2)→(4,1). The ordered method reads. |
| `ordered-column-complete` | PASS | completed four-row column held, left parts climb 1,2,3,4 — completeness visible. |
| `order-matters` | PASS | top (1,4) and bottom (4,1) rows light sunshine, middle two dim, navy "×" vs-mark between candies and column — order-distinguishes-them reads. |

## bbox-manifest

`summary.collisionCount: 0` across 11 keyframes scanned. No collisions — zones held disjoint as the
Visual Contract §1.5 promised. The read-arrow overlap is NOT flagged as a collision because both
arrows are in `zone-marks` (allowed to trace over zone-diagram); the manifest's zero-collision result
is technically correct but does not catch the legibility defect, which is purely visual. All
visual-design §3 contract elements have a manifest SceneElement (intro-title, candy-group, divider,
big-diagram, column rows via keyframes, order-vs-mark).

## Audio / pacing

- **No audio overrun.** Every cue's ASR-detected speech ends at or before its reconciled cue
  endFrame (intro 120≤122, five-whole 218≤225, split 314≤321, recombine 401≤412, read 563≤580,
  first-split 707≤720, slide 946≤954, column-complete 1034≤1053, order-matters 1178=1178). Total WAV
  39.28s ≈ 1178 frames = last cue end exactly; no dangling audio, no truncation into the next cue.
- **No >1s unjustified stagnation.** Every cue has a watched change; the held beats (column-complete,
  order-matters) are integration holds following a delivered change, per pedagogy §6, and carry the
  travelling emphasis / highlight so they are not frozen.
- **Captions align to cue windows.** Each caption matches its cue's narration and the reconciled
  window; the two emphasis cues (read-fen-he-shi, order-matters) render coral caption text as
  intended.
- **matchScore healthy** on the load-bearing cues (1.0 on six of nine); the two below 0.9
  (intro 0.895, slide 0.854) are explained by known ASR mishears ("五"→"舞", "合"→"和", "又"→"右",
  "每"→"美") that do not affect the audible narration — audio is frozen and acceptable.

## Pedagogy-vs-brief gaps (inherited upstream; recorded, not blocking)

1. **The 分合式 is never *read* in narration.** Brief Narration notes require reading top-down
   "五分成一和四" and bottom-up "一和四组成五". The frozen narration for `read-fen-he-shi` is only
   "这样分,可以写成分合式,上下都能读" — it *names* that both directions exist but never reads either.
   Combined with the overlapping arrows, the "read both ways" discovery is the weakest beat. The
   picture (5 over 1 and 4) still carries the written form, so the cue half-delivers.
2. **Per-slide counts are not spoken.** Pedagogy §7 / brief require the spoken count to track the
   visual (左1右4 → 左2右3 …). The frozen slide narration is "再挪一个到左边,又一个,再一个,每挪一次,
   多出一行" — it names the *action* (one more, again) but never speaks 1/2/3/4. The on-screen column
   numbers deliver the count, so §4 (picture delivers) is satisfied; the §7 mouth-matches-count
   intent is only partially met. Acceptable given audio is frozen.

## Recommended fix (single defect for GREEN)

Kick `read-fen-he-shi` back to Wave 4 (composer) — NOT a re-record. The two read arrows need distinct
geometry so the child can see two directions: route arrow #1 top→down along the diagonals (whole to
the two parts) and arrow #2 bottom→up (parts back to whole), offset so neither sits on the "5" glyph.
Root cause is in `src/lessons/fenYuHe/layout.ts` (`arrow1Start: 30, arrow2Start: 66` — both short
arrows on the central vertical axis, hence the identical `[616,160,48,204]` bboxes). This is a
composer/sketch-layer geometry fix; the primitive (`FenHeDiagram`/`TeacherMark`) is fine.
