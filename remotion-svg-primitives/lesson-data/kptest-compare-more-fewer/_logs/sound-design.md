# _logs/sound-design.md — W2c sound design (kptest-compare-more-fewer)

## INPUTS READ
- `lesson-data/kptest-compare-more-fewer/brief.md` — math compare-quantity lesson, Mandarin narration, 3–5yo; acquisition phrases 五比三多 / 三比五少.
- `lesson-data/kptest-compare-more-fewer/pedagogy.md` — discovery/reward beats; keystone = fewer-direction (same picture, two readings); insight is picture-delivered.
- `lesson-data/kptest-compare-more-fewer/visual-design.md` — per-cue motion (PopIn dot entrances, pair lines, spread/re-pair); SFX-worthy beats.
- `.agents/skills/lesson-sound-design/SKILL.md` — bed table, tone guard, SFX vocab + density rules.
- `src/lesson-media/audioCuesTypes.ts` → `@studio/sound-kit` `audioCuesTypes.ts` — `AudioCues` schema (SfxEventType = popin|count|transition|reward).
- Shared library indices `_beds/_sfx/_stings/_index.json` (key-resolution check).

## OUTPUTS WRITTEN
- `lesson-data/kptest-compare-more-fewer/audio-cues.json` (non-empty, schema-valid).
- this log.

## COMMANDS RUN
- node schema/key validator (inline) — exit 0. stdout: `VALIDATION OK — all keys resolve, all events legal, no frame fields, all cue ids exist`. bed=math-calm-68-cmaj, toneSafe=false, sting=mandarin-accent, outro.resolve=true, 3 sfx rows.

## KEY DECISIONS
- **bed = `math-calm-68-cmaj`** — number/math lesson (default math bed per skill table).
- **`toneSafe: false`** — NOT a pinyin/lexical-tone-discrimination lesson. The 比-phrases are verbal LABELS on a picture-delivered quantity insight, not tones the child must aurally discriminate; teaching point is the matched-dots picture. Per skill table math = toneSafe false. (Independently, density rules keep every SFX OFF the acquisition narration anyway, so no melodic motif lands under the 五比三多 / 三比五少 utterances.)
- **`intro.sting = mandarin-accent`** — Mandarin topic; sting allowed over the intro card before narration (skill §Intro/outro).
- **`outro.resolve: true`** — default on; the recap close (both targets retrieved, loop closed) is the celebratory beat, carried by the bed swell rather than a ta-da over retrieval narration.
- **SFX map (3 sonified beats, each motivated, none over teaching/acquisition narration):**
  - `two-groups` → `popin`/`pop` — single soft pop on the dot-row PopIn entrances. NOT per-step count ticks: the focal verb is "two groups arrive" (entrance), not a counting sweep; 8 ticks across 5+3 would be too dense and risk landing on the amount-naming line. One pop, composer fires on the PopIn.
  - `match` → `reward`/`chime` (small) — marks the surplus picture appearing (the proof, "two left over"). Lands in the post-line hold; voice here only names the ACTION, so no teaching word is occluded. Picture-delivered aha, not a pre-named answer.
  - `not-by-size` → `reward`/`chime` (small) — marks the re-pair confirming "still two over" after the voice asks 看起来变多了吗 and the picture answers in the gap. Motivated invariant-confirmation beat in a narration gap.
- **No `ta-da`** — the single-win budget is spent on the bed `outro.resolve` swell instead; the candidate win beats (fewer-direction keystone, recap) carry teaching/retrieval narration + choral invites where a ta-da would collide ("no SFX over instruction words"). When in doubt, silent.
- **Echo cues silent** — echo-more / echo-fewer are held SILENT your-turn gaps (≥3–5s wait-time); NO SFX, preserving the response silence. Replay cues + the modeling cues (more/fewer-direction) carry acquisition narration → no SFX.

## ISSUES
- None blocking. All bed/sting/SFX keys resolve in `shared-sound/public/audio/_*`.

## PIPELINE FINDINGS
- The `popin` event is one-shot per cue, but visual-design has the dots arrive in TWO staggered rows (5 then 3). The schema can't say "fire popin twice / once per row" — the composer must infer multiplicity from the scene. A future schema could carry an optional `perEntrance`/count hint (parallel to `count.perStep`) so row-by-row entrances are explicit rather than composer-inferred.
- toneSafe is a binary, but this lesson is a genuine middle case (Mandarin acquisition phrases inside a non-tone math lesson). The skill resolves it correctly via the lesson-kind table, but a one-line note in the skill ("Mandarin LABELS in a non-tone lesson ≠ toneSafe; only lexical-TONE-discrimination teaching flips it") would remove the judgment call each Mandarin-math run faces.
- No `[ASSUMED]` flags this run (risingPitch not used — no counted set is sonified).
