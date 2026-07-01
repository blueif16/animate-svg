# audio-captions — kptest-count-to-two

W2b. Narration is COMMENTARY ON THE VISUAL, written to each cue's `visualMotionSeconds` (visual-design.md — the budget), at the calibrated Aoede Mandarin rate **0.30 s/char**. Insight lesson (no §9 acquisition → no choral/echo/wait-time, no `gap.seconds` for learner-response). §7 count-match honored: count word 一/二 lands synced to its tag attaching; tags appear in turn, never both at once. Cue-2 obeys leakage rule — the question sets up WITHOUT pre-saying the total; the picture delivers the consolidation, then narration re-voices the total naming the whole (the §6 reserved recall pulse).

## per-cue narration table

| cue | visualMotionSeconds | narration | caption (verbatim) | chars | est. s (×0.30) | Δ vs budget |
|---|---|---|---|---|---|---|
| announce-topic | 2.2 | `我们一起数到二吧。` | `我们一起数到二吧。` | 8 | 2.4 | +0.2 ✓ |
| cue-1-count | 5.0 | `你看，一个苹果来了——一；再来一个苹果——二。` | `你看，一个苹果来了——一；再来一个苹果——二。` | 16 | 4.8 | −0.2 ✓ |
| cue-2-cardinality | 6.0 | `看一看这一群，一共有几个呢？——一共二个呀。` | `看一看这一群，一共有几个呢？——一共二个呀。` | 17 | 5.1 | −0.9 ✓ |

Totals: 41 chars · ~12.3s of voiced narration across a ~13.2s visual span (motion envelopes it). No padding, no starvation.

## register / leakage / completeness notes (one line each)

- announce-topic: warm direct-address invitation, names the lesson (count to two); complete sentence.
- cue-1-count: names the ARRIVAL action per apple (`来了` / `再来`) — the one-at-a-time sequence the storyboard requires — then voices the count word synced to the tag (`——一`, `——二`). The "一" inside `一个` is grammatical (indefinite, tone-shifted); the post-em-dash `一`/`二` are the §7 count-match targets that land on each tag attaching. No group count is pre-announced. Two beats varied (not stamped): first names arrival (`来了`), second names the follow (`再来一个`). Complete utterances.
- cue-2-cardinality: question sets up the whole WITHOUT pre-saying the total (`一共有几个呢？`); the picture delivers the consolidation during the question→answer caesura; the recall re-voices the total naming the whole (`一共二个呀`), landing on the §6 reserved pulse. Names every term the relation binds (the whole `二个` + the framing `一共`). Guiding question satisfies register law #2.

minimal leakage vs storyboard draft: none — the storyboard supplied INTENT only (no copy); W2b authored copy that respects §4 (no pre-said total) and §7 (count-match).

## ASR risk note (≤5 lines)

- cue-1 single-char count words `一` (×2, one in `一个` as tone-shifted `yí`, one as count `yī`) and `二` (at cue-end before `。`). These are clean high-frequency count words, NOT homophone-hazard in a count context (low risk). Mitigation already applied: `——` em-dash before each count word gives ASR a token boundary; `；` separates the two beats; `。` closes. Keeping count words bare because §7 count-match is required (skill: document & proceed when pedagogy requires the bare term). No `……` anywhere (drone rule); all intra-cue pauses are typed `——`/`；`/`。` boundaries.
- No L2 words in this lesson (math-insight, Mandarin-only) — no bilingual ASR concern.
