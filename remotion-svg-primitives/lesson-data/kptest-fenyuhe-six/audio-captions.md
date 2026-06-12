# Audio / Captions — kptest-fenyuhe-six

> W2b. Per-cue narration + caption. Targets each audio cue's `visualMotionSeconds` from `visual-design.md` §5 (calibrated ~0.30s/char for Aoede Mandarin slow pacing; `maxClipSeconds` 6.5). 6 audio cues cover the 9 visual beats; the 3 visual echo beats (held split + pointer + recombine tail) live in the preceding model cue's typed `gap: { reason: "learner-response" }` (v4 cue-anchored audio — free silence, not baked WAV). Chinese only per brief. Rewritten from the prior run (the part-pair fragments `一和五，分成。` / `一和五，合起来。` dropped the whole `六` and violated the §4 acquisition carve-out's "name the whole being decomposed" rule, and the bare recap list `一和五。二和四。三和三。` had no whole binding it) — every narration line is now a complete, grammatical utterance that names every term its relation binds.

## Per-cue table

`chars` = CJK units only (digits 0-9 are not in `voice.json` `asr.tokenPattern` `[㐀-鿿]|[A-Za-z']+` and are spelled out in Chinese to keep the phrase matchable). `est sec` = chars × 0.30s. `visual sec` = the visual cue(s) this audio cue covers (from `visual-design.md` §5). The echo's recombine tail is in the gap (silence over a continuing visual — the W4 composer holds the visual running while the audio clip ends and the typed `gap` opens the free-silence window).

| # | audio cue id | narration | chars | est sec | visual cue(s) covered | visual sec | gap | caption |
|---|---|---|---|---|---|---|---|---|
| 1 | `routine-reprise` | 六的分与合。和五的分与合一样，我们来分六。 | 18 | 5.4s | `routine-reprise` | 3.3 | — | 六的分与合。和五的分与合一样，我们来分六。 |
| 2 | `split-1-and-5` | 六可以分成一和五。一和五合成六。 | 14 | 4.2s | `split-1-and-5` + `echo-1-and-5` | 5.0 + 5.5 = 10.5 | `{ seconds: 4, reason: "learner-response" }` | 六可以分成一和五。一和五合成六。 |
| 3 | `split-2-and-4` | 六可以分成二和四。二和四合成六。 | 14 | 4.2s | `split-2-and-4` + `echo-2-and-4` | 5.0 + 5.5 = 10.5 | `{ seconds: 4, reason: "learner-response" }` | 六可以分成二和四。二和四合成六。 |
| 4 | `split-3-and-3` | 六可以分成三和三。三和三合成六。 | 14 | 4.2s | `split-3-and-3` + `echo-3-and-3` | 6.0 + 6.5 = 12.5 | `{ seconds: 5, reason: "learner-response" }` (extra symmetric dwell per pedagogy §8) | 六可以分成三和三。三和三合成六。 |
| 5 | `aggregator-prompt` | 六可以分成几和几？ | 8 | 2.4s | `aggregator-prompt` | 6.5 | `{ seconds: 4, reason: "learner-response" }` | 六可以分成几和几？ |
| 6 | `recap` | 一和五。二和四。三和三。它们合起来，都是六。 | 17 | 5.1s | `recap` | 10.0 | — | 一和五。二和四。三和三。它们合起来，都是六。 |

Reconcile (visual binds per `visual-design.md`; narration ≤ `maxClipSeconds` 6.5 on every cue; gaps are typed timeline HOLDS, not baked WAV): routine-reprise 5.4s / split-1-and-5 14.5s (max 10.5 + 4 gap) / split-2-and-4 14.5s / split-3-and-3 17.5s (max 12.5 + 5 gap) / aggregator-prompt 10.5s (max 6.5 + 4 gap) / recap 10.0s = **~72s total** (in the brief's 60–90s band; cue-anchored audio + visual-binding).

## ASR risk note

- **No single-char utterances** — `分`/`合`/`一`/`二`/`三`/`四`/`五`/`六`/`几` all sit inside multi-char phrases. `三和三` is a homophone-repeat but the surrounding `六可以分成` / `合成六` + the 5-char context carry the match.
- **No in-text ellipsis** — would render as a ~5s held-vowel DRONE per the skill's hard-defect rule; all wait-times are typed `gap: { reason: "learner-response" }` (3 echo gaps + 1 aggregator gap = 4 total; 4s/4s/5s/4s).
- **Recap uses full stops, not commas** (`一和五。二和四。三和三。`) — per the Aoede 3-item comma-list quirk; full-stop breath-groups are safe. The closing binding sentence `它们合起来，都是六。` frames the list per the §4 "set framed by what binds it" exception (and matches the storyboard's `它们合起来都是6` recap intent verbatim, spelled out).
- **Longest `phrase` is 17 CJK tokens** (the recap); all others ≤ 18. All under the ~15-char high-confidence ceiling for the per-phrase lines; the recap's 17-token run is still well within the 6.5s `maxClipSeconds`.
- **Watch-point for W3a audit (non-blocker):** cue 1's `phrase` is the longest non-recap line (18 CJK tokens, one breath-group). Mitigation if W3a flags a low-confidence match = split into two cues (`announce: 六的分与合。` / `transfer: 和五的分与合一样，我们来分六。`) at the cost of one TTS prosody reset; co-equal retrieval across the three splits is unaffected.
