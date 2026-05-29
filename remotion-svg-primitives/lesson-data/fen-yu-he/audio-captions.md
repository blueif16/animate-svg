# fen-yu-he — audio & captions (Wave 2b)

Inputs (read-only): `lesson-data/fen-yu-he/pedagogy.md` (esp. §4 narration-leakage, §7
spoken-count = visual-count) and `lesson-data/fen-yu-he/visual-design.md` §3 (the per-cue
`visualMotionSeconds` budget). Voice config: `lesson-data/_shared/voice.json` (Aoede, perCue,
gap 0.25s, maxClipSeconds 6.5, scriptField `narration`).

Output: per-cue narration written to FIT each cue's `visualMotionSeconds` at the calibrated Aoede
rate of **~0.30s per Chinese character**. Narration is COMMENTARY: it names/prepares the action;
the picture delivers every count. No §3 post-narration hold table (that mechanism is deleted —
`docs/pipeline-architecture.md` §6). The machine-readable rows live in `script-cues.json`.

Calibration note: only CJK glyphs are timed (punctuation is not spoken). Target chars per cue =
`round(visualMotionSeconds / 0.30)`. Estimates below are narration-length HINTS only — the real cue
windows come from Wave 3a ASR + Wave 3.5 reconcile (`max(narration, visualMotion) + tail`).

---

## Per-cue narration table

| cue | budget (s) | target chars | narration | CJK chars | est (s) | Δ vs budget | discovery served |
|---|---|---|---|---|---|---|---|
| `intro-title` | 2.5 | 8 | 今天，我们学五的分与合。 | 10 | 3.00 | +0.50 (+20%) | (structural topic-announce) |
| `five-whole` | 2.5 | 8 | 先看中间这一堆糖。 | 8 | 2.40 | −0.10 (−4%) | the five candies are one intact whole |
| `split-into-two` | 2.5 | 8 | 画一条线，把它们分开。 | 9 | 2.70 | +0.20 (+8%) | a line splits the five into left + right |
| `recombine-inverse` | 2.0 | 7 | 再推回来，合起来。 | 7 | 2.10 | +0.10 (+5%) | push the heaps back → five again (分/合 inverse) |
| `read-fen-he-shi` | 4.0 | 13 | 这样分，可以写成分合式，上下都能读。 | 15 | 4.50 | +0.50 (+13%) | a split can be WRITTEN as a 分合式, read both ways |
| `first-ordered-split` | 3.0 | 10 | 我们从左边最少的开始排。 | 11 | 3.30 | +0.30 (+10%) | start the ordered hunt at the smallest left part |
| `slide-one-at-a-time` | 7.5 | 25 | 再挪一个到左边，又一个，再一个，每挪一次，多出一行。 | 21 | 6.30 | −1.20 (−16%) | move one candy → next split, four times |
| `ordered-column-complete` | 3.0 | 10 | 从上往下看，左边排好了。 | 10 | 3.00 | +0.00 (+0%) | sorted column → completeness is visible |
| `order-matters` | 3.5 | 12 | 这两行，左右换一下，就不一样。 | 12 | 3.60 | +0.10 (+3%) | (1,4) vs (4,1) are two different rows |

Totals: **103 CJK chars, ~30.9s** of narration across 9 cues. `sum(visualMotionSeconds) = 30.5s`.
All nine cues fall within ±20% of their motion budget (`intro-title` is exactly at the +20% edge —
accepted; it is the mandated topic-announce and trimming below 10 chars makes the title read clipped.
`slide-one-at-a-time` is at −16%, deliberately shortened — see below). Every per-cue clip is now
under `maxClipSeconds` 6.5: `slide-one-at-a-time` is the longest at ≈6.30s (21 chars).

**Clip-cap fix applied (`slide-one-at-a-time`).** The first draft of this cue was 24 chars ≈ 7.20s,
which EXCEEDS `maxClipSeconds: 6.5` — `truncateChunks` in `generate-voice.mjs` would clip the WAV
mid-phrase. The cue-plan skill says to split a >7s line on a natural pause, but the visual is ONE
continuous four-slide march the child reads as a single beat (cue-plan "don't split: viewer expects
one continuous reading"; CLAUDE.md "cue is the unit of coordination"). Splitting the cue would break
that 1:1 visual↔cue mapping and inject a TTS prosody reset mid-march. Instead the line was shortened
to 21 chars ≈ 6.30s (再来一个 → 再一个; 下面就多一行 → 多出一行), clearing the 6.5s cap with margin
while staying within ±20% of the 7.5s motion budget. No `maxClipSeconds` override and no cue split
needed; the visual stays one cue.

---

## Narration-leakage compliance (pedagogy §4 / §7)

The narrator NAMES the action; the picture DELIVERS the count. Spot checks:

- `five-whole` — "先看中间这一堆糖" points at the heap; it does **not** say "五个糖" / "这里有五个".
  The child reads "five" off the five candies that pop in. (Number 五 is reserved for the title.)
- `split-into-two` — "画一条线，把它们分开" names the act (draw a line, separate); it does **not**
  say "分成一堆和一堆" or announce left/right counts. The divider + the gap deliver the split.
- `recombine-inverse` — "再推回来，合起来" names the reverse act; it does **not** say "又变回五个".
  The heaps merging deliver "five again".
- `read-fen-he-shi` — "上下都能读" names the two read directions; it does **not** speak the actual
  numbers ("五分成一和四" / "一和四组成五"). The diagram delivers the structure. **Deliberate
  divergence from pedagogy §4's example phrasing**, which quotes the full top-down/bottom-up
  sentences — speaking those exact numbers here would announce the (1,4) split before the ordered
  hunt begins, and at 4.0s there is no budget to read both directions aloud anyway. The narration
  names the *capability* ("readable both ways"); the diagram delivers the content. Flagged so Wave 4
  knows the diagram, not the voice, carries the read-direction.
- `first-ordered-split` — "从左边最少的开始排" names the START decision (begin at the smallest
  left); it does **not** say "左1右4". The candies settling to 1|4 + the top row deliver the pair.
- `slide-one-at-a-time` — "再挪一个…又一个…再一个" names each move (one more, again, once more)
  and "多出一行" names the consequence (a new row appears). It does **not** count "左2右3,
  左3右2…". Per pedagogy §7 the ticking left/right candy counts and the 分合式 part-numbers are
  delivered visually, in lockstep with the three "挪一个" beats + the implied fourth. **Note for
  Wave 4:** there are FOUR slides but only three explicit "挪" verbs in the line (再挪一个 / 又一个 /
  再一个) plus "每挪一次" generalizing the pattern — the narration intentionally does not enumerate
  all four so it does not become a count read-aloud; the four row-freezes are visual.
- `ordered-column-complete` — "从上往下看，左边排好了" names the read direction (top→bottom) and
  that the left side is now ordered; it does **NOT** say "一共四种" / "5有四种分法". Per pedagogy §4
  the count of FOUR is delivered by the four visible rows, never announced. This is the load-bearing
  leakage guard for the whole lesson.
- `order-matters` — "左右换一下，就不一样" names the swap and that it yields a different split; it
  does **not** say "所以是四种不是两种". The two highlighted rows deliver the distinction.

No cue announces a count the child is meant to read. The single number word in the lesson (五) lives
only in the structural title, where nothing is being counted.

---

## ASR risk flags + mitigations applied

ASR is sherpa-onnx zh, `tokenPattern` `[㐀-鿿]` (CJK only). Risks for THIS lesson:

1. **Single-char 分 / 合 (the brief's named risk).** Every appearance is bound inside a multi-char
   companion so no bare one-syllable token is ever emitted — mitigation applied at authoring time:
   - `intro-title`: 分 and 合 sit inside the compound **分与合** (与 between them). Not bare.
   - `split-into-two`: 分 sits inside **分开** (分开 = separate). Not bare.
   - `recombine-inverse`: 合 sits inside **合起来** (合起来 = combine). Not bare.
   - `read-fen-he-shi`: the first 分 is followed by a comma break (这样**分**，…) giving ASR a clean
     token boundary; the second pair is the compound **分合式**. Not bare.
   - `slide-one-at-a-time`, `first-ordered-split`, `five-whole`, `ordered-column-complete`,
     `order-matters` contain no 分/合 at all (the slide/order beats name moves, not the 分/合 act).
   Result: zero bare single-char 分/合 utterances anywhere. (Verified by context scan.)

2. **`合` as the final token of `intro-title` (分与**合**。).** A single-syllable token at the very
   end of an utterance is the weakest ASR position. Mitigation considered: append a tail word
   ("…分与合啦" / "…的分与合吧"). **Not applied** — it adds a filler syllable and the brief wants
   clean all-Mandarin topic copy. Instead the term is the multi-char compound 分与合 (three glyphs
   read as a unit), which the aligner matches as a phrase, not an isolated 合. **Flagged for Wave 3a:**
   if `intro-title` matchScore is low specifically on the trailing 合, the cheapest fix is the tail
   particle 啦/吧 (re-roll voice + edit `script-cues.json`), NOT moving the term earlier (it is the
   lesson title and must close the announce).

3. **`一行` / `一个` repetition in `slide-one-at-a-time`** ("又一个，再一个… 多出一行"). Repeated
   `一X` tokens can confuse a greedy aligner. Mitigation applied: the three move-phrases are varied
   (再挪**一个** / 又**一个** / 再**一个**) and separated by commas (TTS pauses → ASR token
   boundaries); the consequence clause changes the head noun (多出一**行**, not 一个). The `phrase`
   field is the comma-stripped CJK string the aligner searches, so the variety survives. **Flagged
   for Wave 3a:** this is the longest cue (~6.30s) and the only one with internal repetition — walk its
   per-token timestamps first.

4. **No homophone traps.** No 是/事, 在/再 ambiguity carrying meaning across a token the visual
   depends on. (再 appears in 再推回来 / 再挪 / 再来 — all the same "again" sense, no 在 nearby.)

Decision log (per CLAUDE.md "upstream flags are not advisory"): risk #2's tail-particle fix is
**intentionally deferred to Wave 3a evidence**, not silently ignored — recorded here with the exact
remedy so the voice subagent applies it only if the measured matchScore on `intro-title` is bad.

---

## Caption plan

- One caption per cue, text = the `caption` field in `script-cues.json` (spoken narration verbatim,
  with punctuation). All captions are ≤16 CJK chars except `slide-one-at-a-time` (21) and
  `read-fen-he-shi` (15) — the composer's caption layer breaks at the comma boundaries:
  - `slide-one-at-a-time`: "再挪一个到左边，/ 又一个，再一个，/ 每挪一次，多出一行。" (3 phrase lines).
  - `read-fen-he-shi`: "这样分，/ 可以写成分合式，/ 上下都能读。" (3 phrase lines).
- Captions display through the **entire cue window** (start → end), lingering ≤0.3s past audio end as
  Wave 3.5's tail kicks in. The composer wires this by reading the reconciled cue boundaries from the
  timeline — Wave 2b does not set frames.
- Caption ribbon lives in `zone-caption` (x0 y620 w1280 h100), min 42px rendered (visual-design §1).
- `emphasis: true` set on the two accent cues `read-fen-he-shi` and `order-matters` (matching
  visual-design's two-pulse accent budget); the caption layer applies the theme emphasis style there.

---

## Handoff notes for Wave 3a (voice + ASR)

- `scriptField` is `narration`; the TTS reads the `narration` field, the aligner searches `phrase`
  (punctuation-stripped CJK, verified to match each narration's CJK token count 1:1).
- Audio is FROZEN after Wave 3a acceptance. If a cue's matchScore is poor, the listed remedies
  (esp. risk #2 / #3) are the pre-approved edits; otherwise correct cue boundaries from ASR evidence.
- Estimated total ~30.9s of speech; with 0.25s inter-cue gaps (8 gaps = 2.0s) the WAV is roughly 33s
  before any per-cue truncation. Longest cue is `slide-one-at-a-time` ≈6.30s — under `maxClipSeconds`
  6.5 with ~0.2s margin. If the real clip lands above 6.5s after TTS prosody, the pre-approved remedy
  is the further trim 多出一行 → 多一行 (−1 char, ≈6.0s), NOT a cue split.
