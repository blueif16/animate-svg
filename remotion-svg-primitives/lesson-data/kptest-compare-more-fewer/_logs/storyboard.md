# W1 storyboard — _logs/storyboard.md

## INPUTS READ
- `.agents/skills/lesson-storyboard/SKILL.md` (my operating spec)
- `lesson-data/kptest-compare-more-fewer/pedagogy.md` (8 cues: intro, two-groups, match, more-direction, fewer-direction, not-by-size, recap; lesson kind = math-insight + L2 acquisition layer; acquisition targets 五比三多 / 三比五少)
- `.agents/TEACHING-ACTIONS.md` (teaching-move menu; read each move's `requires` for the required-visual)
- `lesson-data/kptest-compare-more-fewer/brief.md` (KP, audience 3–5 zh, out-of-scope fence, continuity: reuse counting-dot + one-to-one pairing)
- `src/capabilities/catalog-digest.md` (authoritative component vocabulary for required-visual naming)

## OUTPUTS WRITTEN
- `lesson-data/kptest-compare-more-fewer/storyboard.md` — 11-cue spine (ids + order + teaching action(s) + narration intent + required visual + exposures ledger)

## COMMANDS RUN
- `mkdir -p _logs && test -s storyboard.md && echo OK` → exit 0; stdout: "storyboard.md exists and is non-empty: OK"

## KEY DECISIONS
- **Expanded 8 pedagogy cues → 11 spine cues.** Pedagogy's `more-direction` and `fewer-direction` each chain `model-target-slow` + an invite-echo. Per the skill ("an invite-echo gets its OWN cue — the wait-time is a real beat"), I split each into THREE cues: model (`more-direction`/`fewer-direction`) → echo+wait (`echo-more`/`echo-fewer`) → replay (`more-replay`/`fewer-replay`). This makes the ≥3–5s learner-response wait a real silent beat downstream (W2b puts `gap:{reason:"learner-response"}` on the echo cue) and gives each co-equal target identical reinforcement (§8 breadth).
- **No durations / frames / code anywhere** (per skill + node law). Timing is W3.5's alone.
- **Required-visuals named from the catalog only** — `lesson-intro-card`, `countable-object`, `pair-connector`, `unmatched-slot`, `comparison-symbol` (> formal), `pulse-circle`, `read-along-highlight`, `pointer-hand-arrow` (hand), `recap-spotlight`. All exist; no Wave-3 primitive gap surfaced — the compare-by-matching surplus (`unmatched-slot`) and the > symbol are both already in the catalog, satisfying the brief's "reuse the counting-dot primitive and a one-to-one pairing layout."
- **Single closing retrieval recap** (not two near-identical closers) — `recap` walks BOTH targets with one live `recap-spotlight` highlight, equal airtime, neither name-checked (skill recap rule).
- **Keystone honored structurally** — added a binding composer note that the SAME dot layout + pair lines from `match` are HELD unchanged through more/echo/fewer/echo; `not-by-size` is the only cue allowed to move dots (spread → re-match → same surplus). This is the "same picture, two readings" insight made a layout invariant, not a redraw.
- **Beat-ordering note** for `intro` (title reads alone; cast enters in `two-groups`) from `announce-topic.requires` — flagged for composer, not just one frame.
- **Syncable-target placement** — both 比-utterances are L2 acquisition targets voiced in their own model/echo cues (their own beats), satisfying the skill's "syncable target at the HEAD of its cue" so ASR can timestamp them and the surplus pulse / read-along can anchor on the cue start.
- **exposures ledger:** 五比三多: 4, 三比五少: 4 (model + echo + replay + recap per target) — co-equal, neither starved; feeds the W3.5 comprehension-floor advisory.

## ISSUES
- none blocking. The brief's length HINT (75–105s) is not a contract (length emerges at W3.5); the 11-cue spine with two acquisition triads + a keystone dwell + a recap is sized to the teaching, not padded to the band.

## PIPELINE FINDINGS
- The skill's invite-echo rule + the §8 co-equal-breadth rule TOGETHER deterministically expand a "model + echo" pedagogy cue into a model/echo/replay triad — but that 3:1 expansion is currently re-derived by hand each run. A one-line note in the storyboard skill ("an acquisition cue that pedagogy tags `model-target-slow → invite-echo` standardly expands to model → echo-<target> → replay-of-model, one triad per co-equal target") would make the spine size reproducible across runs and across models (matters for the cheap pi executor).
- pedagogy.md's `more-direction` / `fewer-direction` cues each silently bundle model + invite-echo + replay into one `reinforcement` line; W1 must split them. Pedagogy could emit the echo as its own intended beat (or flag "this acquisition cue expands to a triad") so W1's expansion is confirming pedagogy's intent rather than inferring it — reduces the chance a weaker executor ships one flat cue per target (the narrated-slideshow failure the skill warns about).
