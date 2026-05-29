# kp2v2-counting-by-tens — audio + captions

Wave 2b output. Final teacher script (zh), caption ribbon text, ASR risk flags, and per-cue duration intent. Five cues, 1:1 with `storyboard.md` and `pedagogy.md` Beats 1–5. Frames are not owned here; Wave 3 ASR sets the real boundaries.

Governing constraints, applied to every cue:

- Brief out-of-scope: no spoken "二十/三十," no 十位/个位, no 计数单位, no re-teaching the bundle.
- Pedagogy §4: narration **prepares or names**; picture **delivers**. Script never announces a count the picture is still in the middle of showing.
- Pedagogy §7: every number spoken matches a number visible in that cue.
- Brief narration-notes: Gemini's KP1 precedent stuttered on enumerated 一、二、三…十 (the `一一` repetition class). Where the count is the *labor*, framing narration ("我们一根一根地数") carries the action while the on-screen ticker delivers the actual enumeration.

---

## cue: loose-count-felt

- **serves beat:** Beat 1 — Loose count, felt
- **final script (zh):** 我们一根一根地数……十根，走了十步。
- **caption ribbon:** 我们一根一根地数 …… 十根，走了十步。
- **gloss (for orchestrator only, never spoken):** "We count one stick at a time …… ten sticks, that was ten steps."
- **picture/narration handoff:** The on-screen count ticker walks 1 → 10 across the ten loose sticks during the ellipsis hold. The narrator names the *action* (counting one at a time); the ticker *delivers* the actual sequence 1..10. The endpoint "十根，走了十步" lands as the ticker rests on 10 — naming the labor the child just watched.
- **ASR risk:** Avoided enumerated 一、二、三…十 per brief — replaced with framing narration "一根一根地" (reduplication of one short word, not chained ordinals, well within Gemini's safe range). Trailing "走了十步" introduces 十 once, in context, no stutter risk.
- **fix / accept:** Fix applied (framing replaces enumeration). Accept the risk on "一根一根" reduplication — Gemini handles AABB-style reduplication cleanly; the failure mode was specifically *chained different ordinals*.

## cue: bundle-is-one-count

- **serves beat:** Beat 2 — The bundle is one count
- **final script (zh):** 这十根，捆成一捆 —— 一个十。
- **caption ribbon:** 这十根，捆成一捆 —— 一个十。
- **gloss:** "These ten sticks, bundled into one bundle — one ten."
- **picture/narration handoff:** "捆成一捆" lands while the rope visibly ties; "一个十" lands **after** the rope has finished tying and the count display has flipped from ten ticks to one count. The new unit-name attaches to a unit the picture has already made.
- **ASR risk:** "一个十" (yī gè shí) — three short syllables, one of them the lesson's load-bearing unit name. No chained-ordinal risk (it's a unit phrase, not an enumeration). The em-dash pause before "一个十" gives Gemini a clean prosodic break to deliver the name as a unit, not as a syllable run.
- **fix / accept:** Accept. The em-dash pause is the fix.

## cue: tens-count-like-ones

- **serves beat:** Beat 3 — Tens count like ones
- **final script (zh):** 再来一捆 —— 两个十。
- **caption ribbon:** 再来一捆 —— 两个十。
- **gloss:** "Another bundle — two tens."
- **picture/narration handoff:** "再来一捆" lands as the second bundle slides into the row (atomically — never re-bundling). "两个十" lands **after** the bundle has settled and the tens-count ticker has advanced 1 → 2. The narrator names the new ordinal of the new unit only when the picture has delivered the count.
- **ASR risk:** "两个十" (liǎng gè shí) — standard Mandarin classifier phrase, no stutter class.
- **fix / accept:** Accept.

## cue: pattern-holds

- **serves beat:** Beat 4 — The pattern holds
- **final script (zh):** 再加一捆 —— 三个十。
- **caption ribbon:** 再加一捆 —— 三个十。
- **gloss:** "One more bundle — three tens."
- **picture/narration handoff:** Identical shape to cue 3 — narration names the action ("再加一捆"); the third bundle slides in atomically; the tens-count advances 2 → 3; the narrator names "三个十" only as the ticker rests on 3. The *sameness* of the operation is the discovery, so the script intentionally mirrors cue 3's rhythm — only the verb changes (再来 → 再加, a tiny variation to keep the ear awake without disrupting parallelism).
- **ASR risk:** "三个十" (sān gè shí) — clean. Across cues 2–4, Gemini will read "一个十 / 两个十 / 三个十" as three separate utterances (one per cue, not chained in one breath), which is the safe pattern.
- **fix / accept:** Accept. (If Wave 3 reveals Gemini collapsing 再来/再加 into the same hesitation, fall back to "又来一捆" for cue 4 — but try the variation first.)

## cue: tens-are-the-faster-way

- **serves beat:** Beat 5 — Why this is the faster way
- **final script (zh):** 数"一"要走十步，数"十"只走三步。
- **caption ribbon:** 数 "一" 要走十步，数 "十" 只走三步。
- **gloss:** "Counting by 'ones' takes ten steps; counting by 'tens' takes only three steps."
- **picture/narration handoff:** Both rows are already on stage side-by-side before this cue speaks. "十步" lands as the loose-row's ten ticks are visible (count-of-10 label settled); "三步" lands as the bundle-row's three ticks are visible (count-of-3 label settled). The script names *only* the two count-lengths — never says "二十," "三十," or any digit-symbol, per brief out-of-scope.
- **ASR risk:** Quoted single characters — "一" and "十" — wrapped in 数 (shǔ). Gemini will read the quote marks as a slight prosodic break, which is exactly what's wanted (the quote treats "一" and "十" as named units, not as parts of a number). The pair 十步 / 三步 are distinct enough phonetically (shí bù / sān bù) that the contrast carries.
- **fix / accept:** Accept. If Wave 3 ASR shows Gemini eliding the quote prosody and reading "数一要走十步" as a slur, fall back to "数 '一' 的话，要走十步；数 '十' 的话，只走三步" (adds "的话" as a stronger prosodic anchor) — but try the cleaner version first.

---

## Cue Boundary Intent

Estimated narration durations, slow children's voice at ~2.8 zh-chars/sec, including the picture/narration handoff holds (silence between phrases while the picture delivers). These are **intent**, not contract — Wave 3 ASR sets the real boundaries; this block exists so visual-design and composer have a floor to plan phases against.

| cue | spoken chars | speech-only (s) | with delivery hold (s) | band intent |
|---|---|---|---|---|
| loose-count-felt | ~14 | ~5.0 | **~10–11** | long — the ticker has to walk 1..10 across the ten-stick row before "走了十步" lands; this hold is the labor the brief calls for |
| bundle-is-one-count | ~12 | ~4.3 | **~7** | medium — em-dash pause holds the rope-tie + count-flip in the gap before "一个十" |
| tens-count-like-ones | ~9 | ~3.2 | **~5–6** | medium — bundle slides in during em-dash pause; tens-ticker advances 1→2 before "两个十" lands |
| pattern-holds | ~9 | ~3.2 | **~5–6** | medium — same shape as cue 3; parallelism is the point |
| tens-are-the-faster-way | ~16 | ~5.7 | **~9–10** | long — closing image needs a hold *after* the script ends so the child sees both rows together with their counts settled |

**Total intent: ~36–40s.** Lands at the lower end of the brief's 35–55s band with five cues, honoring pedagogy §1 (no invented cues to hit a length target). If Wave 3 ASR returns the script noticeably faster (e.g. ~30s), the fix is to extend per-cue holds via composer phase budget — not to add a sixth cue.

---

## Notes for downstream waves

- **Visual-design (Wave 2a, parallel):** cue 1's on-screen count ticker is the focal element and must walk 1..10 during the ellipsis hold — the ticker carries the enumeration the narration intentionally doesn't. Cue 5's two count-length labels (十步 / 三步) are load-bearing — they must be visible and settled when the corresponding phrase lands.
- **Composer (Wave 4):** the em-dash pause in cues 2–5 is a real silent gap (~600–900ms expected) — Wave 3 ASR will resolve it. Do not pre-bake the bundle entry on a fixed offset from cue start; key it to the em-dash gap surfaced by ASR.
- **Voice (Wave 3):** if Gemini outputs a transcript where any cue's `matchScore` drops below the lesson's threshold or `asrText` shows a stutter, the proposed fall-back phrasings above are the first thing to try before regenerating.
