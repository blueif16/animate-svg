# Intentional silence is typed — the gap (proposal → shipped)

**Status:** shipped 2026-06-08. Supersedes `learner-response-gap-timeline.md` (single-purpose draft, removed). Author: 2026-06-08.
**Scope:** make *intentional silence* a first-class, **typed** timeline element so the comprehension-floor **wait-time** (`lesson-pedagogy` §8) — and any other reason the voice goes empty — actually occupies real seconds in the rendered lesson, at zero TTS cost. Closes the deferred follow-up in `.agents/skill-system-map.md`.

**Decisions locked (this session, user-approved):**
1. **Seam = bake into the frozen WAV.** Silence is generated INTO the canonical WAV; reconcile reads it with **zero math change**.
2. **Granularity = echo is its own beat.** Each `invite-echo → wait` is a first-class `echo-*` cue whose *trailing* gap is the wait → every gap is a boundary gap; the interior/multi-echo problem dissolves.
3. **Generic, not purpose-named.** The field is `gap: { seconds, reason }`, NOT `responseGapSeconds`. `learner-response` is *one reason value*; the namespace is the universal `gap`.
4. **Silence is free.** A gap is locally-generated zero PCM (`Buffer.alloc`), **never** a TTS call (billed by duration). Authoring silence as an empty spoken cue is forbidden.

**Preserves every hard rule** in `pipeline-architecture.md` / `CLAUDE.md`: the cue stays the unit of coordination; audio is the skeleton and frozen after W3a (the silence is baked *before* freeze, as part of producing the canonical WAV); MEASURE-don't-assume (the gap is a real detected silence); one timeline (the silence lives in the shared cue window); scripts stay lesson-agnostic.

---

## 0. The one idea

> **Silence is never accidental. When the voice goes empty it is for a *reason*, and the reason is part of the data — but the *mechanism* is one generic, free gap.**

Two corrections drove the design:

- **Naming/robustness (user).** Silence has many legitimate reasons — the child answering, an animation landing, a breath, a dramatic beat. A purpose-named field (`responseGapSeconds`) bakes one reason into the namespace, so the *next* kind of silence can't reuse it. The durable shape is a generic `gap` carrying an **open** `reason` union; a new reason extends the union, never adds a field.
- **Cost (user).** TTS is billed by spoken duration. A gap is `Buffer.alloc` of zero samples spliced between clips — the API is only ever called for real speech. We never pay to "say nothing."

And the architectural seam is forced by "audio is the skeleton": a wait that must show in the *visual* timeline must exist as real silence in the WAV, or the next cue's audio plays during the hold (the `pipeline-architecture.md` §6 desync). So the gap is baked into the WAV; reconcile absorbs it for free.

---

## 1. Problem (grounded in files/lines) — as found

1. Reconcile (`shared-narration/src/reconcileTimeline.ts:144`) = `max(motionFrames, audioSpanFrames)`, tail ≤ 0.3s. The wait is "neither narration nor motion" → in neither term. [VERIFIED]
2. The only baked silence was a **uniform 0.4s** `gapSeconds` between every perCue clip (`generate-voice.mjs`), far short of 3–5s, at every boundary, never per-reason. [VERIFIED]
3. Planning already prescribed it (`lesson-pedagogy` §8, `6d79eb1`), but `§8` + `TEACHING-ACTIONS.md learner-response-gap` carried a "reconcile follow-up / fake it for now" **hedge** because the mechanism didn't exist. [VERIFIED]
4. No under-floor signal when an acquisition lesson lands below its §8 floor. [VERIFIED]

---

## 2. The design — three layers made to agree

### Layer A — Plan: the gap becomes addressable

- **Storyboard** emits the echo+wait as its own `echo-<target>` cue (a two-variant parting → two echo cues, two waits). It also emits a machine-readable `exposures: { <target>: n }` block for the advisory.
- **Audio-captions + CuePlan** put a `gap: { seconds, reason }` on the cue that *precedes* the silence. The echo cue's narration is the short prompt only ("跟我说：Hello"); its trailing `gap` (reason `learner-response`, 3–5s) is the wait. Other reasons (`animation-hold`, `beat`) are authored the same way.
- **Pedagogy §8 + TEACHING-ACTIONS** drop the hedge; `learner-response-gap` is documented as one `gap` reason, baked into the WAV.

### Layer B — Audio: bake the silence into the frozen WAV (kit) — ZERO cost

- `@studio/narration-kit` `types.ts`: `GapReason` (open union) + `CueGap = { seconds, reason }` + `CuePlanItem.gap?`.
- `generate-voice.mjs` (+ elevenlabs twin): the inter-clip silence is per-cue — `cue.gap.seconds ?? default breath` — and is `Buffer.alloc` zeros (no API). Empty spoken cues throw with a pointer to `gap`.
- `detect-silences.mjs` finds the baked gap; `reconcileCueTimeline` absorbs it into `audioSpanFrames`. **No reconcile-math change.**

### Layer C — Timeline: respect the reason

- **Composer** fills a `learner-response` window with a held "your turn" affordance (compose `PulseCircle` + prompt + read-along first; a `<ResponseGapPrompt>` capability only if W3b names the gap). Frames are cue-relative — zero literals. An `animation-hold` window just lets the visual breathe.
- **Under-floor advisory** at the reconcile node: WARN (never block) when total acquisition reinforcement < §8 floor, from the storyboard `exposures` + reconciled durations.

---

## 3. Why not the alternatives

- **`responseGapSeconds` / purpose-named field** — collides with the next reason; rejected for the generic `gap { reason }`.
- **Motion-dwell only (`visualMotionSeconds`)** — grows the visual timeline but leaves the WAV short → §6 desync unless you also bake WAV silence (then you're doing Layer B anyway). Rejected as a standalone.
- **A third reconcile term** — gap lives only in the visual timeline unless mirrored to the WAV → same desync + a kit-math change. The WAV-baked seam gets the result with less surface. Rejected.
- **Standalone empty silent cue** — a cue with no speech has no ASR tokens, so reconcile (ASR-driven) can't give it a window; it would have to merge cue-plan structure with ASR. Authoring the silence as the *preceding* cue's `gap` is equivalent on the timeline and keeps every cue ASR-visible. Rejected in favor of the `gap` field.

---

## 4. Verification (human is the eye)

Clean-room rerun on `kptest-greetings-verify` (no hints):
1. **Plan** — `storyboard.md` emits `echo-*` cues + `exposures`; `script-cues.json` echo rows carry `gap` (reason `learner-response`, 3–5s).
2. **Audio** — the generated `Silences.ts` shows 3–5s intervals at echo boundaries (not uniform 0.4s); the WAV holds real silence; TTS was billed only for spoken text.
3. **Timeline** — reconciled `echo-*` windows grew to ~prompt+gap; audio still sits inside each window.
4. **Affordance** — the contact sheet's `hold·mid` tile for an echo cue shows the "your turn" pulse, not a frozen frame.
5. **Advisory** — the reconcile node warns iff total acquisition time < §8 floor.

---

## 5. Status — what shipped vs deferred

**Shipped (this session):** the kit type + per-cue zero-cost gap; the architecture §10 model; the skill edits (author + respect + drop the hedge + echo-as-own-beat); the proposal doc; the changelog. **Deferred (logged in the map):** a render-time `<ResponseGapPrompt>` capability *if* compose-from-primitives proves insufficient at size; the under-floor advisory's exact host (reconcile node vs `lesson:check`) once a real rerun exercises it.
