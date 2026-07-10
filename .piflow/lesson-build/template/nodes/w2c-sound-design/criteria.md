# node: w2c-sound-design — GOLD CRITERIA (the QUALITY bar above the schema-lint floor)
<!-- JUDGE / OPTIMIZER-FACING. Consumed by the optimize loop's soft scoring, a verify/judge pass, and the
     human eye. NEVER injected into w2c-sound-design's runtime prompt — a gold example in the sound
     designer's context collapses judgment into copying and voids the clean-room signal (the same law as
     game-omni's nodes/w0-classify/criteria.md and every nodes/*/memory.md). Discovered BY CONVENTION at
     nodes/w2c-sound-design/criteria.md and pointed to by node.json's `optimize.judge`. Maintenance = the
     optimize/enhance skill (the same loop that owns memory.md). Authored via the method in
     `piflow-overlord/references/building-measures.md`. -->

## What this file is (read before judging)

The **schema-lint floor is a PRIOR, separate stage**: `node.json` `contract.schema` points every
`audio-cues.json` at `audio-cues.schema.json` (draft-2020-12) — required `lessonId`/`bed`/`sfx`, every
key a plain string (never a `{key:"..."}` wrapper), `sfx[].event` a closed enum
(`popin|count|transition|reward`), `outro.resolve` a boolean. **None of the marks below is a schema,
type, enum, or field-presence check** — those already passed (or the artifact never reached this judge at
all), and passing THEM earns NOTHING here.

These marks judge the one thing the floor cannot: **does this sound design serve the CHILD'S LEARNING,
not merely conform to the file format?** w2c-sound-design emits a small semantic manifest — bed mood,
one intro sting, one outro flag, a handful of SFX rows — but it is the ONLY node that decides what the
lesson SOUNDS like: a wrong call here can mask the exact phrase/tone the child must acquire, waste the
lesson's single reward beat, or (as repeatedly OBSERVED in this product's own history — see `memory.md`)
emit a shape the composer cannot map at all, so the rendered lesson silently ships with no working sound
layer and nothing catches it before a human notices the MP4. So the judge reads
`audio-cues.json` + `brief.md` + `pedagogy.md` + `visual-design.md` and asks, as **a senior sound designer
for early-childhood media who has never seen this pipeline** would: *does this manifest make the sound
serve the teaching moment, or does it compete with it / waste it / decorate it?*

**EVIDENCE LAW (anti-hallucination).** Every PASS requires a QUOTED cue/key from `audio-cues.json` plus
the matching line from `pedagogy.md`/`visual-design.md`/`brief.md` it is judged against — no quote ⇒ FAIL.
Cite the evidence BEFORE you mark, never mark then rationalize.

---

## The checklist — dimensions a great sound design covers (flag any it silently skips)

- [ ] Bed mood matches the lesson's KIND and register (calm math / playful literacy / flat tone-safe pad) —
      never a generic or mismatched pick.
- [ ] `toneSafe` correctly tracks GENUINE lexical-tone-discrimination teaching, not merely "Mandarin
      narration is present."
- [ ] Every SFX row is motivated by a real, named beat in `visual-design.md`/`pedagogy.md` — nothing
      decorative.
- [ ] Density discipline holds: ≤1 SFX per cue, and NEVER a sound over instruction/acquisition narration.
- [ ] The single `ta-da` (if used) lands on the lesson's TRUE discovery/reward climax, not a lesser beat.
- [ ] Every bed/sting/SFX key is a real, resolvable member of the shared library — never invented.
- [ ] `risingPitch`/`perStep` are reserved for a genuinely counted sequence, flagged `[ASSUMED]`.
- [ ] The overall sound picture reads calm and uncluttered for the target age — not a wallpaper of ticks.
- [ ] Intro/outro choices suit the lesson's cultural/topic register without adding noise the moment
      doesn't need.

---

## The six criteria (each keyed on a DECISION/RELATION, never mere PRESENCE)

**Required (R)** must ALL pass for a *sound* design. **Aspirational (A)** are the discriminators that
separate a *correct* manifest from one that *serves the teaching moment with real craft* — they are NOT
required to pass and NEVER block soundness; they are the headroom the optimize loop climbs toward.

### C1 · Acquisition-safety — no SFX collides with instruction/acquisition narration or a tone word (R, top leverage)
**PASS —** every `sfx` row's `cue` maps to a beat `visual-design.md` marks as non-narration (a gap, a
pure transition, a silent visual moment), and — when `toneSafe`— no melodic `intro.sting`/motif is audible
under any narration cue. Quote the cue and the visual-design line placing it in a gap.
**Failure signature —** an SFX row on a cue where `pedagogy.md`/`visual-design.md` shows the teaching
phrase or a lexical tone is being spoken; a melodic sting or bed motif riding under a `toneSafe` lesson's
narration.
**Grounding —** lesson-sound-design SKILL "Density discipline… NO SFX over instruction words" + "the
tone-language guard." **Why this can't be gamed —** sonifying every cue "to be safe" would satisfy a bare
presence check but fails HERE because the mark is keyed on the RELATION between the cue and the narration
window, not on whether a sound exists.

### C2 · The single reward beat lands on the true climax (R for the count rule; A for precision)
**PASS (R) —** if `ta-da` is used, it appears **at most once**, on the cue `pedagogy.md` names as the
lesson's actual discovery/reward beat — not the intro, not a mid-lesson step. Quote the pedagogy.md
discovery line and the matching `cue`.
**PASS (A, aspirational) —** every lesser beat is left silent or given a small `chime`/`sparkle` at most,
so the `ta-da` reads as singular and earned, never pre-empted.
**Failure signature —** `ta-da` used more than once; a reward sound spent on a non-climactic beat, diluting
or pre-empting the lesson's actual payoff.
**Grounding —** SKILL "`ta-da` at most ONCE per lesson, on the single success beat."

### C3 · Every sonified beat is genuinely motivated, and density stays disciplined (R)
**PASS —** each `sfx` row's `cue` corresponds to a real motion/discovery event named in
`visual-design.md`/`pedagogy.md` (a PopIn, a transition, a counted step, a reward), and no cue carries more
than one row. Quote the motivating visual-design line for at least one row.
**Failure signature —** an SFX row with no traceable motivating event (decorative sound); more than one row
on the same cue; a lesson that sonifies nearly every beat regardless of whether it is load-bearing.
**Grounding —** SKILL "Map only MOTIVATED beats" + "≤1 motivated SFX per beat."

### C4 · Bed + `toneSafe` fit the lesson's TEACHING DEMANDS, not just its topic label (R)
**PASS —** `bed` matches the lesson kind per the SKILL's bed table, and `toneSafe` is true only when the
child must aurally discriminate a lexical tone/sound — not merely because the narration language is
Mandarin. Quote the brief/pedagogy evidence that decided the call.
**Failure signature —** `toneSafe:false` on a genuine tone-discrimination lesson (risks a motif masking the
tone); `toneSafe:true` on an ordinary Mandarin-narrated math/literacy lesson (over-cautious, flattens the
bed with no teaching reason).
**Grounding —** SKILL bed table + tone-language guard. This is exactly the judgment call
`kptest-compare-more-fewer`'s own `_logs/sound-design.md` had to reason through explicitly (Mandarin
acquisition-phrase LABELS in a non-tone math lesson ≠ `toneSafe`) — the correct call is a genuine RELATION,
not a keyword match on "Mandarin."

### C5 · Keys are real and resolvable, never invented (R)
**PASS —** every `bed`/`intro.sting`/`sfx[].sound` value is a byte-identical member of the shared
library's `_beds`/`_stings`/`_sfx` `_index.json`. Quote the key and confirm it resolves.
**Failure signature —** an invented key with no library entry — it silently fails to play with no error
(`LessonSfxLayer`'s concurrent-audio-tag budget assumes every declared tag resolves to a real asset).
**Grounding —** `[[sound-design-sfx]]` (the OKF slice); SKILL "Keys must resolve in the shared library."

### C6 · The sound picture reads calm and age-appropriate (A)
**PASS —** read end-to-end, the manifest's total sonified-beat count and mix (bed mood, sting, SFX
density) reads as a calm, uncluttered accompaniment fit for an early-childhood attention span — no cue
feels like a barrage.
**Failure signature —** a lesson that sonifies most/every cue, or stacks bed + sting + several SFX rows in
a way that reads as noisy against the palette-discipline research.
**Grounding —** SKILL "Palette discipline… calm, major/neutral, no vocals."

---

## Calibration note — which marks a typical current good run is expected to pass vs. stall on

A typical CORRECT run (e.g. `kp1-hello-greetings`, `kptest-fenyuhe-six`) reliably passes the
**mechanical-craft cluster — C1 (acquisition-safety), C3 (motivated + disciplined density), C4 (bed/toneSafe
fit), C5 (real keys)** — these largely follow directly from reading the SKILL literally. It is expected to
be LESS consistent on **C2's aspirational half** (precisely locating the one true climax vs. defaulting to
a safe `chime` on the recap rather than confirming pedagogy's actual discovery beat) and **C6** (the
holistic calm/busy judgment, which needs reading the lesson's whole emotional arc, not a rule lookup). When
a run passes those too, that is the signal of real craft, not mere correctness — hold C2-A/C6 above what
the current best run reaches; do not lower them to make a correct-but-unremarkable run look complete.

---

## GOLD — annotated exemplar: "the four tones of mā" (off-distribution, so the judge calibrates on the bar)

> A manifest for a lesson unlike any current test case (so the judge cannot pattern-match the answer).
> Read it, then the quote-map. The example IS the specification — it calibrates the judge's eye for "sound
> that serves a tone-discrimination lesson."

**Lesson (hypothetical):** `kp-tone-ma-four-tones` — the child hears the four Mandarin tones on "ma" (mā
mother / má hemp / mǎ horse / mà scold) modeled one at a time, then a recap where all four resolve
correctly in a row — pedagogy's discovery/reward beat.

```json
{
  "lessonId": "kp-tone-ma-four-tones",
  "bed": "tone-safe-pad",
  "toneSafe": true,
  "intro": { "sting": "mandarin-accent" },
  "outro": { "resolve": true },
  "sfx": [
    { "cue": "tone-compare-transition", "event": "transition", "sound": "whoosh" },
    { "cue": "four-tones-recap", "event": "reward", "sound": "ta-da" }
  ]
}
```

| # | Criterion | The line that earns the PASS |
|---|-----------|------------------------------|
| C1 | Acquisition-safety (R) | `bed:"tone-safe-pad"` is a flat pad (no melody) + `toneSafe:true`, and ZERO sfx rows sit on any of the four tone-teaching cues themselves — only `tone-compare-transition` (an explicit scene change BETWEEN tones, not narration) and the final recap carry sound. Nothing rides under mā/má/mǎ/mà. |
| C2 | Reward lands on the true climax (R + **A**) | `ta-da` appears exactly once, on `four-tones-recap` — the cue where the child hears all four tones resolve correctly, pedagogy's actual discovery beat — not spent earlier on any single tone's introduction. |
| C3 | Motivated + disciplined density (R) | Only 2 sfx rows total across the whole lesson: one transition, one reward — each maps to a real named beat, no cue carries more than one row. |
| C4 | Bed/toneSafe fit the teaching demand (R) | `toneSafe:true` is genuinely warranted here — FOUR LEXICAL TONES the child must discriminate is the textbook case the guard exists for, unlike a Mandarin-narrated non-tone lesson where `toneSafe` would be over-cautious (see C4's grounding). |
| C5 | Real, resolvable keys (R) | `tone-safe-pad`, `mandarin-accent`, `whoosh`, `ta-da` are each a confirmed member of the shared library's `_beds`/`_stings`/`_sfx` `_index.json` — nothing invented. |
| C6 | Calm, age-appropriate picture (A) | Two sonified beats + a flat pad bed for the whole lesson — about as calm and uncluttered as a manifest gets, appropriate for the attention economy of the format. |

> This exemplar clears every Required mark AND both Aspirational discriminators (C2-A precision + C6
> calm-picture) — it is the apex made concrete for a genuine tone-discrimination lesson.

---

## Wiring + readiness (how these plug into triage, per the runway)

- **HARD** → `node.json` `contract.schema` = `audio-cues.schema.json` (draft-2020-12): `lessonId`/`bed`/`sfx`
  required, every key a plain string, `additionalProperties:false` at every object level, `sfx[].event` a
  closed enum, `outro.resolve` a boolean. This is a REAL blocking gate on every future run (not merely an
  optimize-time measure) — a present-but-invalid artifact is `blocked`, per `packages/core/src/runner/schema.ts`.
  ALSO already-reused, zero new code: the existing `checks.post` (`non-empty`/`json-parses`), the substrate's
  built-in trace detectors + digest anomalies (`runSubstrateMeasure`), and `piflowctl telemetry`/`trace` for
  the agent-facing efficiency/blind-spot read (see `memory.md`'s Known failure modes for what each has
  already caught).
- **VALIDITY CONFIRMED (do NOT skip re-checking this).** The schema was run directly (ajv 2020-12) against
  6 real historical `lesson-data/*/audio-cues.json` artifacts already in this repo:
  - `kp1-hello-greetings`, `kptest-fenyuhe-six` → **PASS** (no false positive on clean output).
  - `kptest-make-ten` → **FAIL**, exactly as evidenced in `memory.md`: missing `lessonId`, `/outro/resolve
    must be boolean`, and every one of its 11 `sfx[].event` values (`title-settle`, `highlight-empty`,
    `slide-in-dots`) flagged off-enum.
  - `kp2-counting-by-tens` → **FAIL**: missing `lessonId` only (otherwise schema-clean).
  - An empty-object stub → **FAIL** on all three required fields (the degenerate "produced nothing" case).
  - `kptest-classroom-objects` is NOT reachable by this test at all — its `audio-cues.json` is not even
    parseable JSON (a stray `]` at line 142 where a `}` was needed), which the ALREADY-WIRED `json-parses`
    check should have caught. That it didn't suggests THAT historical run's post-checks were elided (a
    companion/dev profile) — a cross-cutting WIRING gap, not specific to this node's own measures; worth the
    orchestrator's attention across the whole workflow, not just here.
  - ⚠️ **KNOWN SKIP RISK.** `defaultSchemaValidator()` (`packages/core/src/runner/schema.ts`) best-effort
    `import('ajv/dist/2020.js')`s and WARNS+SKIPS (non-blocking) if that fails to resolve — the exact
    "game-omni blueprint schema-compile gate silently skipped" failure class cited in
    `piflow-overlord/references/measurement-runway.md`. CONFIRMED in this environment: the only `ajv`
    resolvable from `@piflow/core`'s dependency chain is `/Users/tk/node_modules/ajv` **v6.12.6** (draft-07 —
    no `dist/2020.js` at all). Until a real ajv 8+ is a resolvable dependency somewhere in that chain, this
    gate DEGRADES TO A SILENT SKIP at run time even though the schema itself is proven correct above. This is
    an SDK/environment-wide gap (every `contract.schema` in every piflow product is affected, not just this
    node) — flagged as the consolidation item this node owes the orchestrator. Re-run the same 6-sample test
    after any ajv dependency change to reconfirm the gate is LIVE, not merely present.
- **SOFT** → this file's checklist + rubric + gold (above) as the blind judge's references — JUDGING only,
  never injected into w2c-sound-design's prompt.
- **DEFERRED follow-on (documented, NOT wired — see `memory.md` "Open threads" for the exact blocker).**
  Two node-specific deterministic invariants a static schema cannot express: (1) **registry-membership** —
  `bed`/`intro.sting`/`sfx[].sound` must be a LIVE member of the shared library's `_beds`/`_stings`/`_sfx`
  `_index.json` (a growing, data-driven registry — exactly the same class of gap as game-omni w0-classify's
  documented `archetype ∈ live registry` follow-on); (2) **density ceilings** — ≤1 `sfx` row per `cue`, and
  `ta-da` used ≤1 time across the whole file (C2/C3's Required floor, currently judged only by the SOFT
  rubric above). Both are mechanically trivial (read `audio-cues.json` + the three `_index.json` files;
  group-count by `cue`; count `sound==="ta-da"`) but CANNOT be wired as an `optimize.measure` op today: that
  stage's `ResolveCtx` (`packages/core/src/optimize/substrate/measure.ts:122` — `{run, workspace, state}`)
  carries no `{{arg.*}}`, and no `lessonId` state channel is promoted anywhere in the template (only
  `camelLessonId`/`composition`, by `setup-scaffold`) — so a measure op has no way to locate WHICH lesson's
  `audio-cues.json` to check. Unblocking this needs either (a) `setup-scaffold` promoting a plain `lessonId`
  state channel, or (b) `runSubstrateMeasure` extending its `ResolveCtx` to carry the run's `args`. Once
  either lands, wiring the two checks above is a direct copy of the logic already specified here.
