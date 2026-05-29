# Word-Level ASR Upgrade — Design Doc

**Date.** 2026-05-29
**Owner.** Orchestrator
**Status.** Proposal. No code touched.
**Companion to.** `script-animation-coordination-2026-05-28.md` §3 (200ms rule), `ai-coordinated-voice-and-visual-2026-05-28.md` §3 (Remotion + ASR), §3b (`token.fromMs`), §3d (2026 APIs), §3e (Hartquist), §4 (adaptive tail).

---

## 1. Goal

Move the lesson pipeline from cue-level ASR timestamps to **per-word** ASR timestamps, so the composer can implement the **200ms-lead rule** mechanically: every text/label/chip entrance is anchored to `word.startFrame - 6` (≈200ms at 30fps), not to an eyeballed `REL_START` constant. This unlocks two downstream wins flagged in the companion briefs but currently un-shippable:

- **Rule #3 of the script-animation brief** ("show the text 200ms before the word") becomes pure plumbing instead of a hand-tuned offset table.
- **Rule #8 of the AI-coordination brief** (prosody-aware breathing, micro-pulse on emphasis) gains the discrete-event spine it needs: word boundaries are where syllabic emphasis lives in Mandarin, and the sketch-layer's teacher marks already want word-anchored timing rather than cue-anchored timing.

The bar is **≤ 30ms error** on per-word start times. At 30fps, one frame is 33.3ms. ≤30ms guarantees the 6-frame lead lands within ±1 frame of the audible onset — the threshold below which Yu-kai Chou and ECAbrams both report viewers stop feeling the desync.

---

## 2. Current state vs target state

**Today.** `bin/asr-align.py` runs sherpa-onnx in streaming mode with `chunk_size = int(0.05 * sample_rate)` (50ms hops). Inside the decode loop (`asr-align.py:158–179`) it does NOT read sherpa-onnx's per-token timestamp array (`OnlineRecognizerResult.timestamps: List[float]`, which the library exposes — verified at `sherpa-onnx/python/sherpa_onnx/online_recognizer.py` `timestamps()` method, https://github.com/k2-fsa/sherpa-onnx/blob/master/sherpa-onnx/python/sherpa_onnx/online_recognizer.py). Instead it polls `recognizer.get_result(stream).text`, diffs against the previous frame's text to find newly-emitted tokens, and stamps each new token with the CURRENT chunk's end time. That means a token's recorded `time` is "the chunk during which the streaming decoder first emitted it" — not when the speaker actually said it. With Zipformer's frame skip + endpoint detection, the gap between phonation onset and emission is typically 100–400ms and not constant; we are throwing away the model's native per-token timestamp in favor of a worse polled estimate. `align_cues()` then matches phrase n-grams against this noisy `tokenEvents[]` array (`asr-align.py:205–257`) and emits cue-level `startFrame`/`endFrame` — which has been good enough for cue boundaries (where ±400ms is tolerable since narration breath sits there anyway) but is far too coarse for word-anchored visual leads.

**Target.** `aligned[].words` — a per-token array with `{ token, startFrame, endFrame, confidence? }` at ≤30ms error per word start. The composer reads `wordFrame(cue, "和")` and offsets `Sequence from` by `wordFrame - LEAD_FRAMES`. `endFrame` is needed too: it pins fade-outs to actual end-of-word, not to a default duration (script-animation brief §3, Yu-kai Chou fade-out trap). Existing `tokenEvents[]`, `startFrame`/`endFrame` cue fields, and `matchScore` stay unchanged — `words` is an additive field. Existing scenes that don't read it continue to work.

---

## 3. Model choice tradeoffs

Mandarin children's narration; sample rate 24kHz (Gemini TTS Aoede output); ~50s lesson length; deterministic build (re-runs produce identical timing).

| Option | Best-case word-start error | Mandarin quality | Dependency cost | Integration | Recommendation |
|---|---|---|---|---|---|
| **(a)** sherpa-onnx + read native `timestamps` | **~40–80ms** floor | Already shipping — zipformer-bilingual-zh-en handles our content | None added — already installed | Trivial: replace 22 lines in `decode()`; expose `timestamps`/`tokens` from `OnlineRecognizerResult` | **YES — phase 1** |
| **(b)** `@remotion/install-whisper-cpp` w/ `tokenLevelTimestamps: true`, model `medium` (non-`.en`), `language: 'zh'` | 100–500ms, with documented Mandarin failure mode | Mixed — see below | +whisper.cpp build, +medium model (1.5GB), +ffmpeg-16kHz step | Moderate: replace asr-align.py with a Node script; `toCaptions()` gives caption shape | **NO** for Mandarin |
| **(c)** sherpa-onnx (existing) + WhisperX second-pass forced aligner on the same WAV | **~20–40ms** | Excellent — WhisperX uses wav2vec2 phoneme CTC for forced alignment, language-aware | +WhisperX (~300MB), +torch | Moderate: new Python step after sherpa-onnx; takes sherpa-onnx's transcript as the "ground truth" text | **YES — phase 2 if (a) misses 30ms bar** |
| **(d)** sherpa-onnx + Montreal Forced Aligner | **~10–20ms** | Gold standard for forced alignment | Heavy: kaldi-based, pretrained acoustic models per language, ~2GB install | High: MFA is its own pipeline (Praat TextGrid out, not JSON); needs a converter | **NO** — overkill for our budget |

### Why option (a) is the answer for phase 1

sherpa-onnx's `OnlineRecognizerResult` already carries per-token timestamps. The C++ source (https://github.com/k2-fsa/sherpa-onnx/blob/master/sherpa-onnx/csrc/online-recognizer.cc) emits `"timestamps": [...]` as part of `AsJsonString()`. The Python binding (linked above) exposes `recognizer.get_result(s).timestamps -> List[float]`. The streaming decoder's native timestamp resolution for a Zipformer transducer is **40ms** (one CTC frame after 4× subsampling of 10ms feature frames) — at 30fps render that's ±1.2 frames worst case. Likely good enough. The only reason `bin/asr-align.py` doesn't use this is historical: the decode loop was written to be chunk-time-driven before we knew the per-token timestamps were on the result object.

Phase-1 change is small: inside `decode()`, after each `recognizer.decode_stream(stream)` call, also pull `recognizer.tokens(stream)` and `recognizer.timestamps(stream)` (already-available Python methods), and emit `{ time: timestamps[i], token: tokens[i] }` instead of `{ time: chunk_end_time, token: new_token }`. Everything downstream (phrase matching in `best_phrase_match`, cue alignment) keeps working but now operates on real timestamps.

### Why (b) is wrong for us specifically

whisper.cpp's word-level mode (`--max-len 1` / Remotion's `tokenLevelTimestamps: true`) is documented as **broken for CJK languages**: GitHub issue #761 (https://github.com/ggerganov/whisper.cpp/issues/761, Apr 2023, still open at time of writing) shows `-l zh -ml 1` emitting empty timestamp brackets and split garbage characters because Mandarin words don't carry the space delimiter the splitter expects. The fix proposed in the thread (BPE-aware splitting) has not landed. Remotion's docs (`install-whisper-cpp/transcribe.mdx`, `recorder/captions.mdx`, fetched via Context7) acknowledge non-English needs `language: 'zh'` + a larger model but do not address the CJK word-split bug — meaning `toCaptions()` on a Mandarin transcript still inherits whisper.cpp's empty-bracket failure mode. Also the install cost (1.5GB model, ffmpeg-16kHz prepass, whisper.cpp build) for a worse-than-sherpa-onnx output is hard to justify when our existing ASR is already streaming-friendly and works for our content.

### Why (c) is the right phase 2 if needed

WhisperX (https://github.com/m-bain/whisperX) treats word timing as a forced-alignment problem on top of any transcript: it takes the sherpa-onnx text + WAV, runs a wav2vec2 phoneme-CTC model in alignment mode, and emits per-word `start`/`end` at the CTC frame resolution (~20ms). Mandarin support via `wav2vec2-large-xlsr-53-chinese-zh-cn` (or equivalents listed in the WhisperX README). The phase-2 plan if phase 1's 40ms floor proves insufficient: keep sherpa-onnx as the transcription engine and add WhisperX as a **forced-alignment pass** on the accepted transcript. Adds ~300MB and a torch dep; integrates as one new Python step that takes `(wav, transcript)` and emits `(words, timestamps)`.

### Why (d) is overkill

MFA (Montreal Forced Aligner, https://montreal-forced-aligner.readthedocs.io) is the academic gold standard but it's a full kaldi pipeline with per-language acoustic models, dictionary lookup, and Praat TextGrid I/O. The integration cost (new binary, new I/O format, GMM/HMM training corpus per voice) buys us maybe 20ms over WhisperX. Not worth it for 30fps render output where 1 frame is 33ms.

### Recommendation

**Ship phase 1 (option a) first.** Two-line change in `decode()` (in spirit; ~20 lines including the JSON shape change) gets us per-word timestamps at the Zipformer frame resolution. Measure on the kp1 pilot lesson; if mean word-start error against a hand-labeled 10-word ground-truth sample is ≤30ms, we're done. If not, **layer (c) WhisperX** as a forced-alignment pass on top — sherpa-onnx stays as the transcriber, WhisperX takes its output and refines the timestamps. Do not switch to whisper.cpp.

---

## 4. Data shape

Extend `@studio/narration-kit`'s `src/types.ts`:

```ts
export type WordTiming = {
  token: string;          // Single Chinese character or English word, post-tokenize
  startFrame: number;     // Inclusive, in lesson FPS (typically 30)
  endFrame: number;       // Exclusive (matches Remotion Sequence convention)
  confidence?: number;    // Optional model-side confidence (0..1), omit if not provided
};

export type AlignedLessonCue = {
  // ... all existing fields untouched ...
  words?: WordTiming[];   // NEW — optional, populated when ASR emitted per-token timestamps
};
```

`words` is **optional**. Legacy alignment JSONs and legacy generated timing modules that pre-date the upgrade simply omit the field; consumers that read it must guard with `if (cue.words) { ... }`.

The generated per-lesson timing module (e.g. `src/lessons/generated/kp1FenYuHeIntroTiming.ts`) gains the field naturally on the next ASR re-run:

```ts
export const kp1FenYuHeIntroAlignedCues = [
  {
    asrText: "今 天 我 们 来 认 识 分 与 和 看 这 一 堆",
    caption: "今天，我们来认识分与合。",
    confidence: "asr-derived",
    endFrame: 122,
    endSeconds: 4.07,
    id: "intro",
    startFrame: 8,
    startSeconds: 0.25,
    targetTokens: ["今", "天", "我", "们", "来", "认", "识", "分", "与", "合"],
    words: [
      { token: "今", startFrame: 8,  endFrame: 14, confidence: 0.94 },
      { token: "天", startFrame: 14, endFrame: 22, confidence: 0.96 },
      { token: "我", startFrame: 22, endFrame: 30, confidence: 0.92 },
      // ...
      { token: "合", startFrame: 110, endFrame: 122, confidence: 0.89 },
    ],
  },
  // ...
] satisfies AlignedLessonCue[];
```

The `asr-alignment.json` artifact mirrors the same shape (the generator already writes one and the other from the same `aligned` list).

**Frame derivation rule.** `startFrame = round(timestamp_seconds * fps)`. `endFrame` for token *i* is the start of token *i+1* OR, for the last token in a cue, `min(cue.endFrame, startFrame + ceil(0.30 * fps))` — the 0.30s cap matches the Aoede per-character voice rate from the audio-captions skill. This keeps `endFrame` truthful for fade-out anchoring without pinning the last word's tail to the cue boundary (which would inherit the cue's natural breath silence).

---

## 5. Composer consumption API

Add to `@studio/narration-kit`:

```ts
/**
 * Look up a word's frame within a cue's word list.
 *
 * @param cue      The aligned cue (must have `words` populated).
 * @param token    Either the literal token string ("和") OR the zero-based
 *                 index into cue.words ("the 3rd word").
 * @param anchor   'start' (default) returns word.startFrame.
 *                 'end' returns word.endFrame — for fade-out anchoring.
 *
 * Throws if cue.words is missing or token is not found.
 */
export const wordFrame = (
  cue: AlignedLessonCue,
  token: string | number,
  anchor: 'start' | 'end' = 'start',
): number => { /* ... */ };

/**
 * The canonical 200ms-lead constant. At 30fps, 200ms = 6 frames.
 * Visual entrances anchor to `wordFrame(cue, t) - leadFrames()`.
 * Fade-outs anchor to `wordFrame(cue, t, 'end')` — NO lead.
 *
 * Returns 6 (frames) when fps is 30. Other fps values are not supported
 * yet; callers should pass fps explicitly if a non-30 lesson ships.
 */
export const leadFrames = (fps: number = 30): number =>
  Math.round((200 / 1000) * fps);
```

**Anti-pattern to flag in the composer skill.** Hand-tuned `*_REL_START` constants in scene code, when the actual intent is "appear shortly before the matching word is spoken". Today's kp1 example:

**Before (current `src/lessons/kp1FenYuHeIntro/layout.ts:222`).**

```ts
// Eyeballed against the WAV — fragile, lesson-specific, will drift if
// audio is ever re-rolled. The 58 means nothing semantically.
export const HE_NAME_FEN_REL_START = 58;

// Consumed at src/lessons/kp1FenYuHeIntro/manifest.ts:445
const stripFenOpacity = (frame: number): number => {
  const fadeIn = reveal(frame, cHeName.startFrame + HE_NAME_FEN_REL_START, HE_NAME_FEN_DUR);
  // ...
};
```

**After (proposed, with word-level ASR shipped).**

```ts
// No constant. The intent ("the 分 strip appears 200ms before the narrator
// says 分 in the he-name cue") is encoded as a direct lookup.
const fadeIn = reveal(
  frame,
  wordFrame(cues.heName, "分") - leadFrames(),
  HE_NAME_FEN_DUR,
);
```

Read: "fade the 分 strip in starting 6 frames before the spoken `分`". If the audio is re-rolled and `分` lands 200ms later, the visual moves with it. Zero edits to the scene.

For words that appear multiple times in a cue (e.g. `合` appears 3 times in `heName`'s narration `合到一起就叫做合分和合方向相反`), `wordFrame(cue, "合")` returns the FIRST occurrence; pass the index (`wordFrame(cue, 2)`) for nth-occurrence. The composer skill should document this; the `lesson-debugger` skill's triage table should add a row for "visual lands on wrong syllable of repeated word → use word index, not token string".

---

## 6. Migration path — no breakage for the 6 existing lessons

`words` is OPTIONAL on `AlignedLessonCue`. Existing generated timing modules (kp1, comparison-5-gt-3, make-10-6-and-4, pinyin-four-tones, etc.) keep their current shape on disk. They do not gain `words` until their lesson is re-rendered with the upgraded `asr-align.py`. Existing scenes (which read `cue.startFrame`/`cue.endFrame` and use hand-tuned `REL_START` constants) ignore the new field — `words?` means TypeScript flags absence at the call site, so any scene that accidentally reads `cue.words[0]` fails compile, not runtime.

Concretely:

1. **Schema PR.** Add `words?: WordTiming[]` to `AlignedLessonCue`. Add `WordTiming` type. No other type changes.
2. **`asr-align.py` PR.** Switch the decode loop to read sherpa-onnx's native `timestamps` + `tokens`. Emit per-token `{ time, token }` from the model's timestamps, not chunk-end times. Group tokens into per-cue `words[]` using the existing phrase-match logic in `align_cues()` — when `tokenStartIndex` and `tokenEndIndex` are known, the `words[]` for that cue is exactly `tokenEvents[tokenStartIndex..=tokenEndIndex]` mapped to `{ token, startFrame, endFrame }`. This is purely additive; existing `startFrame`/`endFrame`/`asrText`/`matchScore` outputs do not change.
3. **`narration-kit` PR.** Ship `wordFrame()` + `leadFrames()`.
4. **Composer skill spec edit.** Add the "use `wordFrame() - leadFrames()` for any visual that should land near a spoken word" rule. Flag hand-tuned `*_REL_START` constants as a code-review smell.
5. **One pilot lesson scene PR** (see §7). Migrate ONLY the chip/label entrances that today use a `_REL_START` constant tuned against a spoken word; leave motion-budget-driven entrances (the strip animation in `fenheshi`) on cue-relative offsets — they're not word-anchored intent, they're motion-budget intent.

Old lessons keep running. New lessons opt in cue-by-cue.

**Re-rendering the 5 non-pilot lessons** is not required by this design and would be a separate decision. If we choose to re-render (likely valuable for kp1 anyway because it's the bug-test bed), the new ASR run replaces the existing generated timing module on disk with the same fields + the new `words[]` field — the scene continues compiling because the existing fields are unchanged.

---

## 7. Pilot lesson choice

**`kp1-fen-yu-he-intro`.** Three reasons:

1. **It's already the test bed.** Two recent research briefs (`script-animation-coordination-2026-05-28.md`, `ai-coordinated-voice-and-visual-2026-05-28.md`) and the recent Wave 3.5 timeline rewrite all used kp1 as the worked example. The team has the audio, the ASR alignment, the cue boundaries, and the visual contract all in working memory.
2. **It contains the exact anti-pattern.** `HE_NAME_FEN_REL_START = 58` (cue-relative frame number tuned by eye against `分`'s spoken onset in the `he-name` cue) is the canonical case for word-anchored offsets. We can ship the migration AND prove the 200ms-lead rule on the same scene.
3. **Manual ground truth is cheap.** kp1 narration is 50s and ~120 tokens. Hand-labeling 10 word starts from the WAV (in Audacity or `ffplay`) for the phase-1 error measurement is a 15-minute task, not a research project.

Once kp1 ships with `words[]` populated and the chip-label entrances re-anchored, run the pedagogy-rerun audit from the `complete-video-pipeline` skill: did `分` and `和` reveals feel more "in time" against the narration than the previous render? That's the qualitative gate on whether the 200ms-lead rule is doing what the briefs promised.

---

## 8. Open questions

- **Silence-handling vs word timestamps.** `SilenceInterval` in `types.ts` is computed from WAV RMS (in `bin/detect-silences.mjs`), not from ASR. With word-level timestamps, do we still need silence intervals? Probably yes — silences ANCHOR cue boundaries (where the visual hands off), word timestamps ANCHOR intra-cue element timing. They answer different questions. But the `findBoundarySilence` helper might want a word-aware variant: `findBoundaryByLastWord(cue) = cue.words[cue.words.length - 1].endFrame`, which is cheaper than RMS detection and equally correct for the "snap cue boundary to end of speech" use case. Worth a focused follow-up after phase 1 ships.
- **Non-Mandarin lessons.** sherpa-onnx zipformer-bilingual-zh-en handles English embedded in Mandarin (e.g. "y = mx + b" in a math lesson). The token regex `args.token_pattern` currently splits on CJK ideographs OR `[a-z]+`. For an English-primary lesson the regex flips, but the per-token timestamp logic is identical. WhisperX (if we go phase 2) is language-agnostic via wav2vec2's multilingual model. No blocker, but the `tts-voice-direction` skill should note which voices we've verified.
- **Token-grouping for polysyllabic Mandarin "words" (词).** sherpa-onnx tokenizes at the character level (`modeling_unit = "cjkchar"`, https://github.com/k2-fsa/sherpa-onnx/blob/master/sherpa-onnx/python/sherpa_onnx/online_recognizer.py). 分合式 is three tokens. If the composer wants to anchor a visual to "the word 分合式" (a polysyllabic term), they have to look up token-by-token: `wordFrame(cue, "分")` for the start of `分合式`, or add a `wordSpanFrame(cue, "分合式")` helper that runs a substring match across the token sequence. Phase 1: ship the character-level API. Phase 2 (if needed): add the span helper.
- **Confidence threshold for skipping lead.** If a token's confidence is low (sherpa-onnx's `ys_probs`, available on the result object), we may not want to anchor a visual to it — the timing is uncertain. Possible rule: `wordFrame()` throws on `confidence < 0.5`, composer falls back to cue-relative offset. Defer to phase 2; phase 1 just exposes the field.
- **Re-rendering existing lessons.** Not required by this design, but the question of "do we regenerate all 6 lessons' timing modules to gain `words[]`?" is a separate orchestrator call. Argument for: lesson-debugger can use word timestamps for triage even on lessons that don't use the 200ms rule. Argument against: re-rendering means re-rolling voice (Wave 3 frozen-audio rule), which is a real cost. Probably: regenerate only when a lesson is being modified for another reason.
- **WhisperX as a forced-aligner: streaming vs batch.** WhisperX is batch-only — needs the full transcript before it runs. sherpa-onnx today is streaming. If phase 2 ships, the pipeline becomes: streaming sherpa-onnx → full transcript → batch WhisperX → per-word timestamps. That adds maybe 5–10s of post-processing on a 50s lesson WAV. Acceptable; ASR is one-time per render.

---

## 9. Progress

(Section per CLAUDE.md "Research → implementation logging" rule. Empty; future fills land here.)

- *(future)* Phase 1: sherpa-onnx native `timestamps` exposure in `bin/asr-align.py` — pending decode-loop edit and JSON shape extension.
- *(future)* `WordTiming` type added to `@studio/narration-kit` — pending types PR.
- *(future)* `wordFrame()` / `leadFrames()` helpers shipped — pending narration-kit PR.
- *(future)* kp1 pilot scene migration (`HE_NAME_FEN_REL_START` → `wordFrame - leadFrames`) — pending Wave 4 composer rerun on kp1.
- *(future)* Phase 1 error measurement (10-word hand-labeled ground truth on kp1) — pending pilot.
- *(future)* Decision: phase 2 (WhisperX forced-aligner pass) yes/no — pending phase-1 measurement.
