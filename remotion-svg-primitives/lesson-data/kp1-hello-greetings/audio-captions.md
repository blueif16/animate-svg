# kp1-hello-greetings — Audio & Captions (Wave 2b)

Per-cue teacher narration written TO FIT each cue's `visualMotionSeconds` (from
`visual-design.md` §1 motion-budget) at the calibrated Aoede rate (~0.30s per
Chinese character). Narration is **commentary on the visual** — it NAMES the
moment in Chinese and NEVER speaks the English answer; the picture (kid + wave +
bubble + read-along) delivers Hello / I'm Sam / Goodbye (pedagogy §4). No §3 hold
table (deleted mechanism). These are narration-LENGTH targets, not cue contracts —
cue windows are decided by Wave 3a (real ASR) + Wave 3.5 reconcile =
max(narrationFrames, visualMotionFrames) + tail.

---

## Per-cue narration table

| cue          | narration (Chinese)                | CJK chars | est. sec @0.30 | motion budget | Δ signed | discovery named (no English answer) |
|--------------|------------------------------------|:---------:|:--------------:|:-------------:|:--------:|--------------------------------------|
| intro        | 今天，我们学三句英语。              | 9         | 2.70s          | 3.0s          | −10.0%   | "we're starting; today = three English things to say" |
| meet-hello   | 看，他们见面，打招呼。              | 8         | 2.40s          | 2.5s          | −4.0%    | names the MEETING moment (打招呼 / 见面); greeting word said by the picture |
| intro-self   | 现在，她告诉他，自己叫什么名字。    | 13        | 3.90s          | 4.0s          | −2.5%    | names the SELF-INTRO moment WARMLY (告诉…自己叫什么名字); "I'm"/"Sam" delivered by the picture, not corrected-drilled |
| part-goodbye | 时间到了，该说再见啦。              | 9         | 2.70s          | 3.0s          | −10.0%   | names the PARTING moment (该说再见 / 时间到了); farewell word said by the picture |
| recap        | 见面、问好、再见，一次小相遇。      | 11        | 3.30s          | 3.5s          | −5.7%    | names the whole ARC as begin→middle→end (见面→问好→再见), framed as ONE 小相遇, not three words to drill |

**Totals.** 50 CJK characters, ~15.00s estimated narration across the 5 cues.
Every cue lands inside ±20% of its motion budget (worst |Δ| = 10.0%). All narration
runs ≤ budget, so where motion is the longer track the cue window is motion-driven
(correct: the budgets are read-time MINIMUMS for the motion).

## Calibration note

Rate used: 0.30s/Chinese-char (Aoede Mandarin slow, mid-band of the 0.28–0.32
empirical window; per kp1-fen-yu-he-intro post-mortem the old 0.42 was wrong).
The estimates above are HINTS for narration length only — Wave 3a measures the real
WAV + ASR and Wave 3.5 sets the binding cue frames. Do NOT treat any second-value
here as a contract.

## Narration-leakage (pedagogy §4) — verified clean

The narration NAMES the moment; the picture DELIVERS the routine. NO line speaks an
English target token (Hello / Hi / I'm / Sam / Goodbye / Bye-Bye). If any of these
ever appeared in the Chinese ribbon, the bubble + wave + read-along would become
decoration — they do not.

- `intro` — frames the job ("学三句英语"), counts no specific phrase. The picture
  shows topic card + cast; the three English phrases are NOT pre-announced.
- `meet-hello` — "见面，打招呼" names the act of greeting; the WORD ("Hello!"/"Hi!")
  rides the left kid's wave in the bubble + read-along.
- `intro-self` — "告诉他，自己叫什么名字" names self-introduction WARMLY (curriculum
  应对建议: model, don't harshly correct-drill). The hard sound "I'm" and the name
  "Sam" are delivered BIG+SLOW by the read-along swell + bubble, not by the ribbon.
- `part-goodbye` — "该说再见啦" names parting; the farewell WORD rides both kids' waves.
- `recap` — "见面、问好、再见" names the three MOMENTS in order and "一次小相遇" binds
  them as one encounter; the three English phrases are SHOWN (recalled marks), not
  re-spoken as the answer.

No leakage fixes vs the storyboard draft were needed — the storyboard's narration
beats were already intent-only and English-free; this wave only sized the copy to
the motion budgets.

## ASR risk flags (for Wave 3a)

The ASR tokenizer (`voice.json` → `asr.tokenPattern = [㐀-鿿]`) tokenizes
**CJK glyphs only**. Because the narration is pure Chinese with zero embedded Latin
or numerals, every `phrase` is clean CJK and ASR risk is **LOW** across the board.

- **No bare single-character utterances** (the classic 分/合 risk) anywhere — the
  shortest cue is 8 CJK chars. No mitigation needed.
- **`phrase` is punctuation-stripped CJK** for every cue (drops ，。、) so the aligner
  matches tokens, not punctuation (cue-plan-author narration≠phrase rule applied).
- **`intro` ends on "英语" (yīngyǔ)** — common, multi-char, ASR-safe; the risky
  English-NAME concept is never an utterance.
- **`recap` opens with a 3-item list "见面、问好、再见"** read with comma pauses in
  `narration` (TTS prosody) but flattened to "见面问好再见" in `phrase` (ASR). This is
  the only cue with internal list cadence; if Wave 3a sees a low matchScore on recap,
  the likely cause is TTS inserting an audible pause the ASR splits on — the proposed
  fix is to re-roll recap (audio not yet frozen at 3a) or, if persistent, soften the
  enumerated cadence to "见面、问好和再见" so the list reads as one breath. Apply or
  record a reasoned ignore (UPSTREAM FLAGS ARE NOT ADVISORY).

## Caption plan

One caption per cue. Caption text = the spoken `narration` verbatim (with its
punctuation), shown in `zone-caption` (the Chinese ribbon, ≥56px, bottom-docked) for
the ENTIRE cue window — lingering ≤0.3s past audio end as Wave 3.5's tail kicks in.
The English answer NEVER enters `zone-caption` (the bubble + read-along own English);
the Chinese ribbon NEVER enters the bubble/read-along zones (pedagogy §4 made spatial
by visual-design §1.5). Captions are short enough (8–13 chars) that no phrase-boundary
break is required; the composer's caption layer reads cue boundaries — no frames here.

`emphasis: true` is set on `intro-self` (the "I'm" key_difficult beat — pulse #1) and
`recap` (the closing punctuation pulse — pulse #2), matching the two-pulse budget. The
caption layer applies the theme emphasis style on those two cues; it does NOT add a
third emphasis anywhere.
