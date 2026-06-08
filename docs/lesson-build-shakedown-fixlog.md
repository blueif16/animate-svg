# lesson-build shakedown — fix log

First end-to-end run of the `lesson-build` Workflow (`.claude/workflows/lesson-build.js`).
Purpose: **probe for problems**. Run the whole loop, watch progress, kill-and-fix on any
stall, and record every edit here so the chain (and skills) improve from this run.

- **Subject lesson:** `kp1-hello-greetings` — PEP English G3 Unit 1 §1.1 (Hello/Hi · I'm… · Goodbye).
- **Run mode:** full unattended; monitor and intervene on stall/failure.
- **Narration:** Chinese-medium + embedded English targets (existing Aoede + CJK-token ASR, no voice.json change).
- **Started:** 2026-06-04.

## Known risks going in (hypotheses to confirm/refute)
1. Workflow is a syntax-checked DRAFT — never run e2e before. Expect node-contract / path bugs.
2. Pipeline skills are tuned for early-childhood **math**; this is a dialogue-driven **English** lesson.
3. Voice/ASR is Chinese-only — English target words won't ASR-align (intended; Chinese sets cue timing).
4. Reuse target: `DialogueExchange` + `ReadAlongHighlight` already registered — W3b should mostly reuse.

## Findings observed (surfaced by nodes' pipelineFindings — triage below)

### 2026-06-04 — W1 storyboard — `lesson-storyboard` skill is a stub + math-only
- **Symptom:** node reports SKILL.md is TODO-only and scoped to "early math one-to-one comparison (5>3)"; gave no usable guidance for a language/routine lesson. Node fell back to CLAUDE.md + pedagogy.md and still produced a clean 5-cue spine.
- **Impact:** not a blocker this run (output good), but every non-math lesson gets no W1 guidance.
- **Proposed fix (deferred):** generalize `lesson-storyboard` skill to subject-agnostic contract (cue-id spine + narration-intent + required-visual + no-durations). Scope: skill.

### 2026-06-04 — W1/W3b — GAP-1 topic-intro card not a registered capability
- **Symptom:** CLAUDE.md mandates a topic-intro card per lesson; no `topic-intro` primitive in the catalog. Flagged as a build demand for W3b.
- **Watch:** W3b must design+build+register it (its job, not composer's). Recurs every new lesson until pre-seeded.

### 2026-06-04 — W1/W3b — GAP-2 only one kid face asset (`boy-face`)
- **Symptom:** `DialogueExchange` needs two DISTINCT kid speakers; asset pool has only `boy-face` among kid faces.
- **Watch:** W3b asset lane would need to GENERATE a 2nd kid face → Gemini (`GOOGLE_API_KEY`). Per memory, organic asset generation has been blocked on that key — **likely first real stall point.**

### 2026-06-04 — W0/W2b — ⭐ English targets never VOICED (undercuts the key_difficult KP)
- **Symptom:** `script-cues.json` narration is 100% Chinese; no English word (Hello / I'm / Goodbye) appears in any cue's `narration`. Pedagogy deliberately routed English to on-screen character bubbles + read-along, reasoning "if the Chinese narration spoke the English answer, the picture would be decoration."
- **Why it matters:** §1.1's `key_difficult` is literally *I'm pronunciation* (curriculum: teacher must exaggerate-model the sound). With English only shown (text) and never spoken, the child cannot HEAR a pronunciation model — the core difficulty isn't taught aurally. Diverges from the chosen "Chinese-medium + English targets" intent (targets ended up visual-only).
- **Decision this run:** NOT a stall → let it ride, evaluate the rendered output. Candidate fix (post-run, pre-freeze is cheapest): embed the English target into the relevant cues' narration (e.g. `…打招呼：Hello！` / `…叫 I'm Sam` / `…说 Goodbye`), accept that the Chinese ASR tokenPattern won't align the English (Chinese still sets cue timing), and verify Aoede's English diction is acceptable. Scope: lesson script + possibly voice-config note for English diction.
- **Status:** ✅ FIXED 2026-06-04 (pre-freeze, cheapest moment) — rewrote `script-cues.json` to embed the English targets into the spoken narration, matched to the visual-design copy (name "Sam", bubbles Hello! / Hi! I'm Sam. / Goodbye!):
  - `meet-hello` → `看，他们见面，打招呼：Hello！`
  - `intro-self` → `现在，轮到自我介绍：I'm Sam。` (emphasis; the key_difficult sound now spoken)
  - `part-goodbye` → `时间到了，该说再见：Goodbye！`
  - `recap` → `见面说 Hello，介绍说 I'm，再见说 Goodbye。`
  - `intro` left as pure-Chinese topic framing. `phrase` fields kept CJK-only (Chinese ASR `tokenPattern` ignores English; Chinese still sets cue timing; the spoken English lengthens the per-cue clip so its time IS counted). Scope: lesson script only.

### 2026-06-04 — W1↔W2a — MINOR: gender-pronoun drift across waves
- **Symptom:** storyboard says the self-introducer is "she" ("one names *herself*"); visual-design renders the right kid as male ("*his* reply bubble 'Hi! I'm Sam.'"). Original `script-cues.json` used 她.
- **Fix:** kept the rewritten narration pronoun-free (`轮到自我介绍`) so audio doesn't commit to a gender that contradicts the rendered figure. Scope: lesson script. Low severity; worth a downstream-consistency note (storyboard ↔ visual-design should agree on cast gender).

## Fixes applied

> Format per entry:
> ### YYYY-MM-DD — <wave/node> — <one-line symptom>
> - **Symptom:** what failed (verbatim error if any).
> - **Root cause:** why.
> - **Fix:** file:line / config change.
> - **Scope:** lesson-only | workflow | skill | voice-config | repo-wide.

### 2026-06-04 — W3a voice — 🛑 BLOCKER: GCP billing-dunning DENY (human-only fix)
- **Symptom:** `npm run lesson:voice` exit 1, `Error: Gemini returned no audio chunks` (×2). `--debug` revealed the real cause: Gemini Live close code **1008** — `Lightning dunning decision is deny for project: projects/956065465952`. A plain REST `GET v1beta/models?key=…` returns **HTTP 403 PERMISSION_DENIED**, same message. The whole Generative Language API is blocked for this GCP project.
- **Root cause:** the `GOOGLE_API_KEY` in `remotion-svg-primitives/.env.local` belongs to GCP project `956065465952`, which is in a denied billing state. Not an endpoint, prompt, ASR, or cue-quality problem — the narration never reached the model.
- **Fix (HUMAN-ONLY — cannot self-resolve):** EITHER restore billing on project `956065465952`, OR swap `.env.local` `GOOGLE_API_KEY` for a key from a project with active billing. Same key gates Gemini asset generation (GAP-2 2nd kid face) — fixing it unblocks both.
- **Scope:** account/billing (external). **Status: ✅ RESOLVED 2026-06-04** — user supplied a key from a billed project; I swapped `.env.local` `GOOGLE_API_KEY` → `AIza…EtMo4`. Verified: `models.list` HTTP 200 (50 models) AND `models/gemini-3.1-flash-live-preview` (the Live voice model `voice.json` uses) HTTP 200. Both voice gen and Gemini asset gen now unblocked.
- **Resume after fix:** relaunch `Workflow(lesson-build, {lessonId:"kp1-hello-greetings", startAt:"wave3"})` — W0–W2c + W3c artifacts are all on disk; preflight re-verifies them and the run re-enters at the voice+assets fan-out.

### 2026-06-04 — W3a voice — SECONDARY: kit swallows the actionable error
- **Symptom:** the generator's `onclose` resolves cleanly, so a server-side DENY (close 1008) surfaces only as generic "Gemini returned no audio chunks" — every retry above was blind. No preflight, so the account-state block is discovered only after a full connect+timeout per cue.
- **Proposed fix (applyable now, touches shared kit `@studio/narration-kit`):**
  1. In `onclose`: if `chunks.length===0` and a close reason exists, reject with `Gemini Live closed: <code> <reason>` (surface the dunning reason without `--debug`).
  2. `lesson:voice` preflight: one cheap `models.list` ping at W3a start → fail in seconds with "billing/permission denied — fix GCP project or swap GOOGLE_API_KEY (project <id>)".
- **Scope:** shared narration kit. **Status: PROPOSED — awaiting go (modifies a shared dependency).**

### 2026-06-04 — W3a voice — ⭐⭐ STRUCTURAL: voice node reverts L2 target words (pedagogy §4 + ASR contract)
- **Symptom:** on the resumed run, the voice node READ my English-embedded `script-cues.json` and deliberately **reverted narration + caption to pure Chinese**, then generated Chinese-only audio (timing module `asrText` is 100% CJK; no Hello / I'm Sam / Goodbye anywhere). It also overwrote `script-cues.json` on disk back to Chinese-only.
- **Node's stated reasons (both legitimate per its skill):** (1) pedagogy §4 — "narration leaks the English answer → the picture (bubble/wave/read-along) becomes decoration"; (2) ASR contract — English is untokenizable Latin under tokenPattern `[㐀-鿿]`. "UPSTREAM FLAGS ARE NOT ADVISORY" → it enforced the W2b/pedagogy table.
- **Root cause (structural, not a bug):** the lesson pipeline assumes **L1 = the narration language = the ASR language**. An L2-teaching lesson where the *target* words are in a different language has no first-class path: the single teacher-narration track + L1-only ASR + the §4 "narration never speaks the answer" rule together force the L2 words OUT of the audio. The node is working exactly as designed.
- **Consequence:** the user's explicit "voice the English" request cannot be honored by re-running the node — it will revert every time. Requires an OVERRIDE.
- **Fix paths:**
  - *One-off (this run):* bypass the node — generate voice manually from the English-locked script (`npm run lesson:voice` reads the script as INPUT and does not rewrite it), then `startAt:"reconcile"` for reconcile→compose→render→verify. (Backup of the node's Chinese-only script saved at `script-cues.node-chinese-only.json`.)
  - *Repeatable (proper):* a real design decision + skill change (needs approval) — e.g. an L2-lesson mode where (a) pedagogy §4 permits the teacher to MODEL the target sound aloud, (b) the voice node treats caller-locked L2 tokens in `narration` as intentional (keep, don't ASR-match), (c) optionally a bilingual/relaxed ASR so the L2 word still gets word-timing. This is the honest fix for teaching ANY language whose words aren't in the narration/ASR language.
- **Status: OPEN — decision needed.** Honoring "voice the English" now = one-off override; doing it right for all future language lessons = skill change.

### 2026-06-04 — W3b primitive/asset — ✅ both gaps closed (after key fix)
- GAP-1 topic-intro card → `LessonIntroCard` / `lesson-intro-card` built + registered (now reusable by every lesson; addresses the "intro card not pre-seeded" finding).
- GAP-2 2nd kid face → `girl-face.svg` generated via Gemini (unblocked by the new key) + registered in `asset-catalog.json`. `DialogueExchange` now has two distinct kid speakers.

### 2026-06-04 — W3a voice — ✅ POSITIVE: node quality is high
- Legitimately re-rolled `recap` to fix a TTS run-on/truncation (matchScore 0.486→0.870) and freed `part-goodbye` from a 9-frame squeeze to 67 frames — a real measure-don't-assume win.
- Correctly accepted perfect-homophone ASR substitutions (他↔她 tā, 啦→了 le, 相遇→香芋 xiāngyù) as audio-correct rather than wastefully re-rolling. Frame timing trustworthy (matchScores ≥0.87).

## ✅ RUN COMPLETED end-to-end (2026-06-04, run wf_af882f3f-24d) — W6 verdict YELLOW
First-ever full e2e of `lesson-build`. Every node returned `ok`. Output: `out/kp1-hello-greetings/kp1-hello-greetings.mp4` (607f / 20.23s / 1280×720 / h264+AAC), final contact sheet, verification.md. Master loudness −16.0 LUFS / −3.2 dBTP (loudnorm verified). The composition is coherent and on-topic: intro card "Hello & Greetings", two distinct kids (boy+girl) carrying Hello! → Hi! I'm Sam. → Goodbye!, read-along + I'm emphasis, recap.

### YELLOW — two real polish defects (both W4-composer-owned)
1. **HIGH — intro title occluded.** The 92px "Hello & Greetings" title (y=320) is covered by the two kid faces (cast y=272) once the cast ramps to full opacity (~f52); title flanks unreadable. BOTH gate passes missed it — the bbox sampler never samples a late-intro frame at full cast opacity (only f30 @ 33% opacity). Fix: raise TITLE_CY or stage/fade the cast in after the title reads.
2. **MEDIUM — recap pulse on the wrong phrase.** The closing coral PulseCircle is centered at RECAP_PULSE_CY=480 (the dimmed middle row "I'm Sam.") while the live read-along sweep is on "Goodbye!" (row 552); punctuation lands on the wrong line. Fix: retarget the pulse to the closing phrase or make it arc-wide.
- lufs/captionRedundancy gate "fails" are non-defects: lufs comes from a STALE pre-loudnorm `measured` block (real master = −16.0/PASS); captionRedundancy is the literacy carve-out (caption==narration by design).

### ⭐ The English-voicing request is STILL UNFULFILLED (voice node reverted it again — final)
On completion, the W3a node's own log calls my English injection an "out-of-band regression" and reverted narration+caption to pure Chinese, citing pedagogy §4 + ASR-untokenizable Latin. **The final MP4 SHOWS the English (bubbles + read-along) but VOICES only Chinese.** The verify node did NOT flag this as a defect — because §4 makes "English in picture, Chinese in narration" the *intended* design; by the pipeline's own rules the lesson is correct. So honoring "voice the English" requires an explicit OVERRIDE the pipeline currently has no path for.
- **Node's own proposed fix (principled):** a `lesson:voice` preflight lint that, for a CJK tokenPattern, forbids Latin/digits in narration/phrase/caption **unless explicitly opted in**. That opt-in flag IS the clean L2-lesson mechanism: set it → node keeps the English instead of reverting. This is the repeatable fix (small voice-node/skill contract change — needs approval).
- **One-off path (no approval):** generate voice manually from the English-locked script (the raw `npm run lesson:voice` doesn't self-revert), then `startAt:"reconcile"` → reconcile→compose→render. Reuses the already-composed scene.

### Findings backlog captured
The run aggregated ~35 `pipelineFindings` (full list in the task output / each `_logs/<wave>.md`). High-value recurring ones: (a) no gate guards script-cues integrity post-W2b; (b) `isLiteracyLesson` regex misses English/PEP lessons → false captionRedundancy; (c) bbox sampler misses full-opacity late-cue frames (caused the missed intro occlusion); (d) `<X>Silences.ts` required by W3.5 but not produced by W3a; (e) animatic gate unrunnable at W3.5 (needs the W4 composition); (f) ReadAlongHighlight JSDoc shows invisible `<tspan>` (must be `<text>`); (g) visual-design says 1920×1080 but everything renders 1280×720; (h) 3-item comma lists make Aoede run-on (use 和 / two breath-groups).

### 2026-06-04 — W3a voice — ✅✅ RESOLVED the English-voicing the RIGHT way (bilingual ASR, not separation)
- **The real root cause was a config lie, not a limitation.** The "Chinese ASR" is actually `k2fsa-zipformer-chinese-english-mixed` — a zh-en **bilingual** sherpa model (`tokens.txt`: 5755 CJK + 494 English BPE; `bpe.model` present). It transcribes English natively. The ONLY thing discarding English was `voice.json`'s `tokenPattern: "[㐀-鿿]"` (CJK-only regex, applied `re.IGNORECASE` in asr-align.py:386) — it threw away every English token the model already produced. The TTS (Aoede) speaks English fine; that was never the issue. So the pedagogy-§4 "separation" was solving a non-problem.
- **Fix (one line, safe globally):** widened `lesson-data/_shared/voice.json` `tokenPattern` → `"[㐀-鿿]|[A-Za-z']+"`. Pure-Chinese narration contains no Latin, so this is a no-op for every existing math/Chinese lesson; for mixed/English it makes English words first-class alignable tokens with timestamps. Scope: shared voice-config (intentional, architectural — removes the L1-only assumption).
- **Result (empirical, what the user asked to "just try"):** restored English into `script-cues.json` (narration + `phrase` + caption; recap broken into 。breath-groups to dodge the Aoede 3-item run-on), regenerated voice. New WAV 23.99s (vs 20.67s) — English audibly spoken. Bilingual ASR aligned EVERY English word: meet-hello `…打招呼 hello` (1.0), intro-self `…自我介绍 im sam` (0.878), part-goodbye `…该说再见 goodbye` (0.978), recap `见面说 hello 介绍说 im 再见说 good` (0.939). All cues asr-derived.
- **Re-render was cheap — no recompose.** `kp1HelloGreetingsLessonTimeline.ts` calls `reconcileCueTimeline()` live at import from the timing module + silences (zero hardcoded frames), and the scene has zero frame literals, so it auto-adapts. `lesson:render --skip-voice` regenerated silences, re-reconciled (620→~701 frames / 23.5s), re-rendered, loudnorm'd to −16.0 LUFS / −3.3 dBTP. Final MP4 now SHOWS and VOICES the English.
- **Remaining repeatability gap (not blocking the artifact):** a fresh `lesson-build` run would STILL regress this — the W3a voice NODE's skill enforces pedagogy §4 ("narration never speaks the answer") and treats English-in-narration as a "regression" to revert. The current lesson is correct because the voice is frozen on disk; but to make L2 voicing survive an unattended run, the voice skill needs: (a) drop/condition §4 for language lessons, (b) the node's own proposed preflight that ALLOWS Latin when opted in (now that the ASR handles it). PROPOSED — needs approval (skill/contract change).

## 2026-06-04 — Skill redesign: teaching rhythm + L2 (skills only, NOT re-run per user)
User feedback: the video is a rushed slideshow (~23s); real teaching needs REPETITION/reinforcement and proper rhythm, decided FLEXIBLY by the planner (never hard-coded counts/templates); language/English especially. Also confirmed the intro overlay (avatars on top of the title) and approved the §4 voicing fix. Edits made (no pipeline re-run — user will trigger):

- **`lesson-pedagogy/SKILL.md`** — §4 got a Language/L2 carve-out (voicing the target IS the delivery, not leakage); NEW §8 "Reinforcement and rhythm — reason about it, never template it" (acquisition vs insight; reinforcement ∝ difficulty/novelty; palette = replay/replicate · choral · gradual-release · spaced recall · contrast · future learner-gap; length EMERGES, never padded/rushed); NEW §9 "Language and L2 lessons" (voice delivers the sound, picture delivers the moment; mixed L1+L2 is supported, don't strip L2); old §8/9/10 → §10/11/12; Wave-0 output now carries a `lesson kind:` header + per-cue `reinforcement:` line.
- **`lesson-storyboard/SKILL.md`** — replaced the math-only TODO stub with a real subject-agnostic skill: the cue spine CARRIES the reinforcement rhythm (allocate model→replay→recall cues by reasoning, not template); a reinforcement cue can be `replay of <id>` (reuse the same clip); cumulative recap = spaced recall; intro must not crowd the title.
- **`lesson-audio-captions/SKILL.md`** — §4 Language/L2 carve-out (mixed `…打招呼：Hello！` is correct, don't Chinese-only it); "L2/mixed is NOT an ASR risk to strip — Wave 3a must NOT revert a deliberate L2 target" (model bilingual + tokenPattern widened); Reinforcement & replay section (replay cues reuse the same clip; choral lines); calibration generalized for mixed L1+L2; "no padding ≠ rush — reinforcement cues are real content."
- **`remotion-lesson-composer/SKILL.md`** — NEW intro-card choreography rule (title readable first, cast enters after / disjoint zone — never stack cast over the title; cue-relative, no literals); render-and-self-critique now renders SEVERAL stills incl. a FULL-OPACITY intro frame + per-cue peak-opacity frames (the climax-only still is why the overlay shipped) + an explicit "is any title/text occluded by a figure at full opacity?" grade.

THE LAW encoded (per user): the skill teaches the planner to REASON about where reinforcement serves learning — it never hard-codes a recipe. Hard-coding a fixed pattern is the bug.

### Still TODO (proposed — code, or pending approval)
- **§4 voice-node revert** is now defused by the skill edits above (no §4 violation + no ASR hazard). If a fresh run STILL strips L2, the W3a node prompt / `cue-plan-author` skill may also need an explicit "L2 target words are frozen content" line. Verify on the next run.
- **Gate blind spots (code, scripts/lesson-measured.mjs):** sample a full-opacity / all-elements-present frame per cue (would have caught the intro overlay); extend `isLiteracyLesson` regex to match english/greet/pep so captionRedundancy stops false-failing language lessons.
- **Replay/repeat-audio mechanism:** replaying a prior cue's clip in the timeline (for §8 replays) may need a small reconcile/timeline capability — build when first re-run needs it.
- **CLAUDE.md** one-line teaching-rhythm principle in the Discipline section — PROPOSED, awaiting approval (structural).
- **visual-design** (early-childhood-visual-taste / visual-discipline): optional note that reinforcement/replay cues can reuse the same visual; budgets grow naturally with more cues.

## Run status snapshot (2026-06-04, stopped at W3)
- ✅ Setup, W0 pedagogy, W1 storyboard, W2a visual-design, W2b audio/captions, W2c sound-design, **W3c sound-asset (REUSE-only, all keys resolve)** — all clean, artifacts on disk.
- 🛑 W3a voice — BLOCKED (billing). 
- ⏹ W3b primitive (intro-card GAP-1 + 2nd-kid-face GAP-2) — was still running; **cut off** (would also hit the same 403 on asset gen, and the run dies at reconcile without voice anyway).
- Pipeline got 8/13 nodes deep cleanly on its first-ever e2e run; the only hard stop is external (billing). Two upstream findings (storyboard skill stub, intro-card not pre-seeded) + one content divergence (English never voiced) logged above.
