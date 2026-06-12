# Audio Captions — kptest-greetings-verify

> Wave 2b artifact. INTENT ONLY — no absolute frames. Every cue boundary derives from Wave 3.5 reconcile.

## Voice Configuration

- **Voice:** Aoede (via `lesson-data/_shared/voice.json`)
- **Calibrated rate:** ~0.30s per Chinese character; ~0.4–0.7s per short English word (1–2 syllables)
- **maxClipSeconds:** 6.5 (TTS engine hard limit per cue)
- **gapSeconds:** 0.4 (default inter-cue breath)
- **Language:** Chinese-medium with embedded English target words (L1+L2 mix)
- **ASR:** bilingual sherpa-onnx; tokenPattern `[㐀-鿿]|[A-Za-z']+` matches both scripts

---

## Per-Cue Narration

### C0 — topic-intro

| | |
|---|---|
| **Narration** | 今天我们来学打招呼、介绍自己，还有说再见。 |
| **Phrase** | 今天我们来学打招呼介绍自己还有说再见 |
| **Caption** | 今天我们来学打招呼、介绍自己，还有说再见。 |
| **Chars (CN)** | 16 |
| **Est. seconds** | ~4.8s |
| **Visual budget** | 2.5s |
| **Delta** | +2.3s |
| **Emphasis** | false |
| **Gap** | — |

**Narration-leakage check:** ✓ Announces the lesson topic (per `announce-topic` move). The L2 carve-out is not active here — no English target is voiced; the card provides the topic text. The narration names what we'll learn; the card delivers the visual reading.

**Caption break:** Two lines if needed — "今天我们来学打招呼、介绍自己，" / "还有说再见。" (15 + 6 chars).

---

### C1 — greet

| | |
|---|---|
| **Narration** | 看，他们见面了，打招呼：Hello！Hi！ |
| **Phrase** | 看他们见面了打招呼 Hello Hi |
| **Caption** | 看，他们见面了，打招呼：Hello！Hi！ |
| **Chars (CN)** | 10 |
| **Eng tokens** | Hello, Hi |
| **Est. seconds** | ~4.1s |
| **Visual budget** | 4.0s |
| **Delta** | +0.1s |
| **Emphasis** | false |
| **Gap** | — |

**Narration-leakage check:** ✓ Chinese frames the meeting moment ("看，他们见面了，打招呼"); the English target words (Hello, Hi) ride as isolated tokens. The picture delivers the greeting action (Kid A waves → bubble; Kid B waves → bubble); the narration names the action, not the words the bubbles show.

---

### C2 — im-slow-model

| | |
|---|---|
| **Narration** | I'm…… Sam。I'm Sam。我是Sam。 |
| **Phrase** | I'm Sam I'm Sam 我是 Sam |
| **Caption** | I'm…… Sam。I'm Sam。我是Sam。 |
| **Chars (CN)** | 3 |
| **Eng tokens** | I'm (×2), Sam (×2) |
| **Est. seconds** | ~5.0s |
| **Visual budget** | 9.0s |
| **Delta** | −4.0s (narration under visual; visual holds with PulseCircle repeats + slow cursor dwell + settle) |
| **Emphasis** | **true** — fires DialogueExchange emphasisColor (coral) + PulseCircle on "I'm" turn |
| **Gap** | — |

**Narration-leakage check:** ✓ The L2 carve-out (pedagogy §4/§9) is fully active — voicing "I'm" IS the teaching act. The child learns /aɪm/ by hearing it. Two breath-groups carry two slow models of the target. "我是Sam" is a brief L1 gloss, not leakage — it says what the utterance means after the sound has been modeled twice.

**Delivery note for TTS:** The first "I'm" is delivered slowly and held (~1.2–1.5s), with a predictive pause (……) before "Sam". The second "I'm" at natural speed (~0.8s) completes into "Sam". The brief Chinese gloss "我是Sam" closes the cue. Total well under maxClipSeconds (6.5s). The visual's 9.0s budget absorbs the 4.0s of non-narrated dwell (PulseCircle repeat, cursor settle, predictive pause).

---

### C3 — im-choral-echo

| | |
|---|---|
| **Narration** | I'm Sam。跟我说：I'm Sam。 |
| **Phrase** | I'm Sam 跟我说 I'm Sam |
| **Caption** | I'm Sam。跟我说：I'm Sam。 |
| **Chars (CN)** | 3 |
| **Eng tokens** | I'm (×2), Sam (×2) |
| **Est. seconds** | ~4.4s |
| **Visual budget** | 7.0s |
| **Delta** | −2.6s (visual holds through the choral echo window with "your turn" glow affordance) |
| **Emphasis** | false |
| **Gap** | — |

**Narration-leakage check:** ✓ "跟我说" is the choral invitation (teaching move `invite-echo`). The target phrase "I'm Sam" is voiced as the model the child echoes. The picture delivers the "your turn" affordance (glow on RAH text).

---

### C4 — im-learner-gap

| | |
|---|---|
| **Narration** | 你来试试：I'm…… Sam。 |
| **Phrase** | 你来试试 I'm Sam |
| **Caption** | 你来试试：I'm…… Sam。 |
| **Chars (CN)** | 4 |
| **Eng tokens** | I'm, Sam |
| **Est. seconds** | ~3.2s (narration only) |
| **Gap** | **{ "seconds": 4, "reason": "learner-response" }** — zero-cost silence baked into WAV |
| **Total cue est.** | ~7.2s (3.2s narration + 4.0s silent gap) |
| **Visual budget** | 5.0s |
| **Delta** | +2.2s (reconcile absorbs via max(narration+gap, visual) + tail) |
| **Emphasis** | false |

**Narration-leakage check:** ✓ The prompt "你来试试" names the action (your turn); the held picture (Kid A looking expectantly at Kid B, RAH text glowing, cursor inactive) delivers the social motivation. The 4-second silence IS the focal change.

**Gap design:** The `learner-response` gap is the acquisition floor — the child must retrieve and produce /aɪm/ without teacher support. 4 seconds is within the ≥3–5s floor for L2 production (pedagogy §8). The voice generator bakes this as `Buffer.alloc` silence at zero TTS cost.

---

### C5 — farewell

| | |
|---|---|
| **Narration** | 要分开了，说再见：Goodbye！Bye-Bye！ |
| **Phrase** | 要分开了说再见 Goodbye Bye-Bye |
| **Caption** | 要分开了，说再见：Goodbye！Bye-Bye！ |
| **Chars (CN)** | 8 |
| **Eng tokens** | Goodbye, Bye-Bye |
| **Est. seconds** | ~4.6s |
| **Visual budget** | 4.5s |
| **Delta** | +0.1s |
| **Emphasis** | false |
| **Gap** | — |

**Narration-leakage check:** ✓ Chinese frames the parting moment ("要分开了，说再见"); the English target words ride as isolated tokens. The picture delivers the parting action (characters separating, waving).

---

### C6a — recap (part 1: greet + introduce)

| | |
|---|---|
| **Narration** | 见面打招呼：Hello！Hi！介绍自己：I'm Sam。 |
| **Phrase** | 见面打招呼 Hello Hi 介绍自己 I'm Sam |
| **Caption** | 见面打招呼：Hello！Hi！/ 介绍自己：I'm Sam。 |
| **Chars (CN)** | 9 |
| **Eng tokens** | Hello, Hi, I'm, Sam |
| **Est. seconds** | ~6.3s |
| **Visual budget** | ~7.5s (of recap's 13.0s total; phrase 1 + phrase 2 activation) |
| **Delta** | −1.2s |
| **Emphasis** | false |
| **Gap** | — |

**Split rationale:** The full recap narration (~11.5s) exceeds `maxClipSeconds` (6.5s). Split at the natural pause between the greet+intro group and the farewell group. Both halves play sequentially within the single 13.0s visual recap cue.

---

### C6b — recap (part 2: farewell + I'm retrieval)

| | |
|---|---|
| **Narration** | 分别的时候说：Goodbye！Bye-Bye！I'm，记住这个音。 |
| **Phrase** | 分别的时候说 Goodbye Bye-Bye I'm 记住这个音 |
| **Caption** | 分别的时候说：Goodbye！Bye-Bye！/ I'm，记住这个音。 |
| **Chars (CN)** | 10 |
| **Eng tokens** | Goodbye, Bye-Bye, I'm |
| **Est. seconds** | ~5.5s |
| **Visual budget** | ~5.5s (of recap's 13.0s total; phrase 3 activation + final hold) |
| **Delta** | 0.0s |
| **Emphasis** | false |
| **Gap** | — |

**Recap combined:** 6.3 + 5.5 = 11.8s narration vs 13.0s visual. Δ = −1.2s (91% of visual budget). ✓ Within ±20%.

**Retrieval design:** "I'm，记住这个音" gives the hardest target (/aɪm/) a final retrieval moment in the recap. The visual's RAH dwell on "I'm" (beat weight 3) extends beyond the narration, letting the sound linger in the child's memory.

---

## Summary Statistics

| Metric | Value |
|---|---|
| **Total cues** | 8 (6 storyboard cues + 2 recap halves) |
| **Total CN characters** | 63 |
| **Total Eng tokens** | 21 |
| **Total est. narration** | ~38.9s (excl. learner-response gap) |
| **Learner-response gap** | 4.0s (C4) |
| **Grand total est.** | ~42.9s (narration + gap, excl. reconcile tails) |
| **Visual motion total** | 45.0s |
| **Combined lesson est.** | ~47–50s (after reconcile adds tails ≤9 frames each) |

### Per-Cue Timing Table

| Cue ID | CN chars | Eng tokens | Est. (s) | Visual (s) | Δ (s) | Δ% |
|---|---|---|---|---|---|---|
| topic-intro | 16 | 0 | 4.8 | 2.5 | +2.3 | +92% |
| greet | 10 | 2 | 4.1 | 4.0 | +0.1 | +3% |
| im-slow-model | 3 | 4 | 5.0 | 9.0 | −4.0 | −44% |
| im-choral-echo | 3 | 4 | 4.4 | 7.0 | −2.6 | −37% |
| im-learner-gap | 4 | 2 | 3.2+4.0gap | 5.0 | +2.2 | +44% |
| farewell | 8 | 2 | 4.6 | 4.5 | +0.1 | +2% |
| recap-1 | 9 | 4 | 6.3 | 7.5* | −1.2 | −16% |
| recap-2 | 10 | 3 | 5.5 | 5.5* | 0.0 | 0% |

*recap visual budget split: 13.0s total ÷ ~7.5s (phrases 1–2) + ~5.5s (phrase 3 + hold).

**Notes on drift:**
- `topic-intro` narration (4.8s) exceeds the visual card budget (2.5s) by +92%. This is expected for `announce-topic` — the card's 2.5s is the write-on animation; the narration continues through the reading hold. Reconcile uses max(narration, visual) + tail.
- `im-slow-model` narration (5.0s) is well under the 9.0s visual budget. The visual's extended dwell (PulseCircle ×2, slow cursor, predictive pause, settle) fills the gap. The sound models are the teaching content; the visual holds the emphasis.
- `im-choral-echo` narration (4.4s) is under the 7.0s visual. The "your turn" glow + choral echo window fill the hold.
- `im-learner-gap` total (3.2s narration + 4.0s gap = 7.2s) exceeds the 5.0s visual. The silent gap is load-bearing teaching content; reconcile absorbs it.

---

## ASR Risk Flags

| Cue | Risk | Severity | Mitigation | Status |
|---|---|---|---|---|
| im-slow-model (C2) | Slow-delivered "I'm" (held 1.2–1.5s) may produce atypical formant pattern | **Moderate** | Phrase field keeps `I'm Sam` as token pair (not bare `I'm`). Bilingual ASR aligns "I'm" at matchScore ≥0.87 per prior verification. | **Monitor** — W3a must verify alignment confidence on the slow "I'm". If score < 0.7, consider accepting the cue with a manual boundary override rather than re-recording (the slow delivery is pedagogically required). |
| im-slow-model (C2) | Bare "我" (single CJK char) in "我是Sam" | Low | Paired with multi-char "是Sam" in same breath-group; bilingual ASR handles short CN runs. | **Accept** — no fix needed. |
| im-learner-gap (C4) | 4.0s silence may confuse ASR segmenter | Low | Gap is `Buffer.alloc` silence appended to WAV; ASR aligner processes the spoken portion only. The gap has no tokens to match. | **Accept** — standard gap mechanism. |
| All L2 cues | English target words in CN narration | **Not a risk** | Bilingual ASR + tokenPattern `[㐀-鿿]\|[A-Za-z']+` matches both scripts. L2 words (Hello, Hi, I'm, Sam, Goodbye, Bye-Bye) align with matchScores ≥0.87. W3a must NOT revert or delete deliberate L2 target words. | **Accept** — frozen teaching content. |

**3-item comma-list check:** No cue uses a 3-item comma-separated list (Aoede quirk: `A，B，C，` runs on). Greet has 2 items (Hello, Hi). Farewell has 2 items (Goodbye, Bye-Bye). ✓ Clear.

---

## Cue-Boundary Intent

> These are INTENT descriptions, not absolute frames. The composer derives all frame positions from `cues[id].startFrame + offset`.

| Cue | Boundary Intent |
|---|---|
| topic-intro | Card write-on starts at cue onset. Narration begins with card visible. Card holds through narration. Cast does NOT enter during this cue. |
| greet | Gate backdrop + characters enter at cue onset. Narration starts as Kid A approaches. "Hello" bubble pops in synced with spoken "Hello". "Hi" bubble pops in synced with spoken "Hi". RAH cursor tracks. |
| im-slow-model | Predictive pause first (~0.5s, scene holds). Kid B leans + bubble pops in. First slow "I'm" synced with PulseCircle fire. Pause. "Sam" synced with cursor reaching "Sam". Second "I'm" synced with second PulseCircle. "我是Sam" as cursor settles on "Sam". |
| im-choral-echo | RAH text "I'm Sam" enters. Narration starts with teacher model ("I'm Sam"). Cursor sweeps at natural speed. "跟我说" synced with "your turn" glow appearing on RAH text. Second "I'm Sam" synced with cursor re-sweep. Glow holds through echo window. |
| im-learner-gap | Narration prompt ("你来试试：I'm…… Sam。") plays first (~3.2s). Then 4.0s of silence (gap baked into WAV). Scene holds throughout — RAH text glowing, cursor inactive, Kid A looking expectantly at Kid B. |
| farewell | Characters begin parting motion at cue onset. Narration starts as parting begins. "Goodbye" bubble synced with Kid A's wave. "Bye-Bye" bubble synced with Kid B's wave. RAH cursor tracks. Characters at final distance by cue end. |
| recap-1 | Recap stack visible (all three phrases dimmed). Narration starts. "Hello！Hi！" synced with phrase 1 activating (brightening + cursor sweep). "I'm Sam" synced with phrase 2 activating (extra dwell on "I'm"). |
| recap-2 | Narration continues from recap-1. "Goodbye！Bye-Bye！" synced with phrase 3 activating. "I'm，记住这个音" synced with phrase 2 re-highlighting briefly (final retrieval of the hard target). All phrases visible at cue end. |

---

## Pipeline Findings

1. **Recap split for maxClipSeconds:** The recap's full narration (~11.5s) exceeds `maxClipSeconds` (6.5s), requiring a split into two CuePlan rows (recap-1, recap-2) for a single visual cue. The composer must handle two sequential TTS clips within one cue's window. This is the standard split mechanism per cue-plan-author guidelines ("Split when the line is longer than ~7 seconds"). Consider whether `maxClipSeconds` should be increased for recap cues in future lessons, or whether the recap should be authored as two visual sub-cues with a transition.

2. **topic-intro narration/visual mismatch:** The `announce-topic` narration (4.8s) significantly exceeds the card's visual motion budget (2.5s). The card's write-on animation completes in 2.5s, but the narration continues through a reading hold. This is expected behavior — the card is designed to hold for reading — but the visual-design budget could more accurately reflect the reading-hold duration. Consider updating the visual contract to separate "card animation" from "card reading hold" durations.

3. **L2 word count in phrase field:** The bilingual ASR tokenPattern treats English words as single tokens (`[A-Za-z']+`). For "Bye-Bye" the hyphen may split into two tokens ("Bye" + "Bye") depending on whether the tokenizer treats the hyphen as a boundary. The phrase field uses "Bye-Bye" as written; W3a should verify the token count matches the ASR output. If not, the phrase could be adjusted to "Bye Bye" (no hyphen) without affecting pedagogy.
