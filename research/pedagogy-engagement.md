# Pedagogy & engagement — research brief

Theme: evidence-based instructional design for early-childhood (preschool/K-3, Mandarin) SVG lesson videos.
Anchored in Mayer's Cognitive Theory of Multimedia Learning (CTML) + its toddler/preschool adaptation, translated into checkable rules for our cue-coordinated Remotion pipeline.

## TL;DR (5 bullets)

1. **Our caption layer is a textbook redundancy violation.** `LessonCaptionLayer.tsx` renders the FULL spoken narration sentence as on-screen text. For pre-readers (our audience) that text is pure extraneous load — it can't be decoded, it competes for the visual channel, and Mayer's redundancy effect (d=0.86) plus the child-amplified version say it actively *depresses* learning. Replace transcript captions with single-word **labels** that ride on the focal object at the moment it's named. This is the single highest-value change in the brief.
2. **Temporal/spatial contiguity is the bar our cue model must clear.** The visual for a concept must animate *on the narrated word* (synchrony, not "narration then animation 2s later"), and the label must sit *on/adjacent to* the object (distance = cognitive cost). Our cue window already co-locates audio+visual+caption — but nothing *enforces* that the focal animation fires at the ASR word timestamp. Add a `signalFrame` per cue derived from ASR token timing.
3. **Segmenting is the highest-leverage lever for length + scale.** Child-optimal chunk = one idea, 10-20s, followed by a 0.5-1.5s *held-still boundary* (motion settles, nothing new enters). This is exactly what lets us make LONGER videos without losing K-3 kids: long = many short re-hooking segments, not one long demand. Our `tail ≤ 9 frames` is close but should become a deliberate, semantically-typed boundary beat (0.5-1.5s = 15-45f), not a fixed 0.3s pad.
4. **Three child-specific principles dominate over the generic effect sizes:** (a) **pretraining/concrete-first** — meet & name the objects before any symbol/equation (our mandatory text intro is the hook); (b) **positivity** — warm tone + celebratory acknowledgement gates attention/memory at this age; (c) **social contingency / generative activity** — a rhetorical question + a *held wait-time pause* (3-4s, Ms Rachel's signature) recruits the child as participant and beats passive viewing. All three are missing or implicit today.
5. **Music: none under narration, ever; reserve for non-narrated moments.** We have no audio bed at all (known gap). Add an instrumental, low-tempo bed ONLY on the intro/transitions/boundary-pauses; under narration music is a seductive detail that harms low-capacity learners. Build ducking so any bed sits well below speech.

## Findings (claim → evidence → SO WHAT for our pipeline)

### F1. On-screen full-sentence captions hurt pre-readers (redundancy, amplified for children)
- **Evidence.** "For an audience that can't read, on-screen sentence text is pure extraneous load… The distinction is between a label and a transcript." (yt-rag, kids_screens_01 t=540) — "because young children cannot read, on-screen text is not merely redundant but actively harmful." (Frontiers review, 2021) — redundancy d=0.86 (instructionaldesign.org / Mayer).
- **SO WHAT.** `src/lesson-media/LessonCaptionLayer.tsx:32` renders `active.captionText` = the full narration sentence. This is the violation, in code. For our pre-reader audience, kill the transcript band. Allow only: (a) the topic-intro title text (pretraining, read aloud), and (b) single-word labels bound to objects (see F2). The `CaptionCue.captionText` field becomes a short LABEL, not a sentence; add a lint check that flags captionText longer than ~4 chars / 1 token for Chinese.

### F2. Spatial + temporal contiguity are the strictest constraints at this age
- **Evidence.** "Distance on screen is cognitive distance… the word and the thing it names must be physically adjacent… ideally the label riding directly on the object." (yt-rag kids_screens_03 t=88) — "the numeral should animate in at the moment the set is complete and counted. Separation in space or time breaks the binding." (kids_screens_03 t=255) — "When a teacher says 'three apples' the third apple should be arriving on that word. Any lag forces the child to hold the spoken word in memory." (yt-rag pacing_seg t=455). Spatial contiguity d=1.10, temporal contiguity d=1.22 — the two LARGEST extraneous-load effects.
- **SO WHAT.** The cue window co-locating audio+visual is necessary but not sufficient — we don't currently *fire the focal animation on the narrated word*. Wave 3a already has ASR token timestamps (`asrText`, per-token events). Extract the timestamp of the focal noun and expose it as `cues[id].signalFrame`; the composer must trigger the focal object's entrance/highlight within ±6 frames (±0.2s) of that frame. Spatial: labels render *on* the object's bbox (use the manifest `bboxAt(frame)`), never in a fixed band.

### F3. Signaling: one synchronized cue on the focal element; motion IS a cue
- **Evidence.** "the deictic gesture tells the eye exactly where to look at the moment the word arrives." (yt-rag msrachel t=640) — "Motion is itself a powerful exogenous cue — the eye is drawn to the onset of movement… one salient cue at a time, synchronized to the spoken reference, removed once attention has moved on." (ScienceDirect signaling review, 2019; d=0.41, larger for low-prior-knowledge learners — i.e. our audience). Frontiers: "signaling… especially powerful for young children, who lack the domain knowledge to allocate attention efficiently on their own."
- **SO WHAT.** We have NO pointer/highlight signaling primitive (motion-primitives/index.ts exports PopIn, curves, TeacherMark, Smear, Drag, FX — none is a deictic pointer). Wave 3 gap-scan should build a `<Pointer>` / `<Highlight>` SVG primitive (a hand or arrow that lands on the focal bbox, or a ring/color-pop) keyed to `signalFrame`. Rule: exactly ONE active signal per cue, on for the duration of the spoken reference, removed after. Animating the focal element's *entrance* on `signalFrame` is itself a valid implicit signal (cheapest option — no new primitive needed for the common case).

### F4. Segmenting + boundary pauses (the lever for longer videos at scale)
- **Evidence.** "Segmenting is the highest-leverage change… For young children the optimal chunk is short: a single step or idea, ten to twenty seconds, then a boundary." (yt-rag pacing_seg t=96) — "between half a second and a second and a half of relative stillness — the narration stops, the motion settles, nothing new enters." (pacing_seg t=288) — "sustained focused attention in minutes is roughly the child's age in years… A longer video has to be built of segments, each re-earning attention with a fresh hook." (videolength_age t=150) — "Reset moments… a low-stimulation recovery beat… A lesson that is all peak exhausts the child." (editrhythm t=330). Segmenting d=0.79; Reddit/Teachers: "Anything over about 6 minutes and I lose the K-2 kids… Chunk it."
- **SO WHAT.** This directly serves the "make LONGER videos" goal: length must come from *more segments*, not longer demands. (1) Make the cue tail a deliberate, typed **boundary beat** of 15-45f (0.5-1.5s) of held stillness, not the current fixed `tail ≤ 9f / 0.3s`. (2) Add a Wave 3.5 reconcile check: no single cue's `max(narration,motion)` exceeds ~20s (600f) without an internal sub-boundary. (3) Long lessons must alternate MODE every ~3-5 cues (demonstrate → question → recap) and insert an explicit low-stimulation **recovery cue** after any high-density cue.

### F5. Pretraining / concrete-object-first maps to our mandatory text intro
- **Evidence.** "Concrete objects first, symbols later… name and show the concrete objects before you introduce the abstract operation… The symbol is the last thing to arrive, not the first." (yt-rag kids_screens_02 t=205). Pre-training d=0.85; Frontiers confirms it "maps to the developmental need for concrete-object familiarity before symbolic abstraction."
- **SO WHAT.** Our CLAUDE.md already mandates a text intro naming the topic — that IS the pretraining vehicle, but the rule should be sharpened: the intro must NAME and SHOW each key concrete object (the apples, the dots) before any numeral/+/= appears. Add a pedagogy-gate (Wave 0) check: the first symbol cue's startFrame must be AFTER every concrete object referenced in it has appeared and been named in an earlier cue.

### F6. Positivity principle gates attention at this age (not decoration)
- **Evidence.** "The positivity principle matters more for young children than for any other audience… emotional state gates attention and memory… the absence of time pressure — is not soft. It directly determines whether the cognitive content lands." (yt-rag kids_screens_01 t=720). Frontiers proposes positivity as a child-specific addition to CTML.
- **SO WHAT.** Encode as Wave 2b (audio-captions) + voice-direction rules: warm/encouraging prosody, an explicit celebratory acknowledgement beat after each "discovery" cue (tie to the pedagogy.md §1 "what did the child discover here"), and NO time-pressure language. Pair with a `<Sparkle>`/`<GlowPulse>` (magic-fx, already in the kit) celebration cue on the discovery moment — restrained, one per discovery.

### F7. Generative activity via rhetorical question + held wait-time (the Ms Rachel mechanic)
- **Evidence.** "She asks and then leaves a gap for the answer… the well-placed rhetorical question with a held pause recruits the child as a participant." (yt-rag msrachel t=420) — "give generous wait time before supplying the answer, so the child has room to attempt it." (cogload_edu t=400) — "There's a deliberate pause — three, four seconds… before she answers her own question." (msrachel t=128). Reddit/toddlers (312 upvotes): "She asks a question and then WAITS. My son actually answers out loud. No other show does this." Reddit/SLP: "expectant pauses… wait time. It's textbook language facilitation." Generative-processing principles (personalization d=1.11, voice d=0.74) all push conversational, participatory framing.
- **SO WHAT.** Add a cue TYPE = `prompt`: narration poses ONE concrete singular question ("一共有几个?" / "how many?"), then the cue holds a **3-4s silent wait-beat** (90-120f) with the visual frozen, before a *separate* answer cue resolves it. This needs a new timing concept: a `waitBeatFrames` field on prompt cues that is silent-by-design (not an ASR gap to be "fixed"). Personalization: voice script uses 2nd-person conversational "you/we" ("我们一起数" = "let's count together"), not 3rd-person lecture.

### F8. Pacing = moderate surprise (Goldilocks) + varied rhythm
- **Evidence.** "moderate surprise — a small violation of expectation against a familiar frame… anchor in the known, then introduce one surprising or new element." (yt-rag goldilocks_pacing t=180) — "a flat, monotonous delivery loses them as surely as a frantic one… Variation itself sustains attention." (goldilocks t=360) — "Bluey's average shot length is far longer than the hyper-cut competition… very fast cuts… degrade the executive function needed to follow a lesson." (bluey_pacing t=415). Reddit/Parenting (890 upvotes): Cocomelon's hyper-cut pacing = overstimulation vs Bluey's slower hold.
- **SO WHAT.** Encode in storyboard (Wave 1) + reconcile (3.5): each cue should land ONE moderate-surprise beat against an established frame (the new dot appears where the pattern predicted). Avoid both monotony (vary cue rhythm — alternate dense/sparse) and hyper-cutting (minimum cue length ~3s/90f; no scene change faster than that). Add a check: flag any run of >3 consecutive same-density cues (monotony) and any cue < 90f (hyper-cut).

### F9. One focal object; clear the frame; clutter is a tax
- **Evidence.** "the visual field is almost empty… every additional element on screen is a draw on a limited attentional budget… When she introduces a new object she removes the old one." (yt-rag msrachel t=512) — "if you present four new things at once, three of them are lost… introduce one element, letting it settle, and only then adding the next." (cogload_edu t=88) — seductive-details/coherence (d=0.86): "adding interesting but irrelevant material reliably depresses learning, strongest for the lowest-capacity learners." (cogload_edu t=242). Reddit confirms simple background = not overstimulating.
- **SO WHAT.** Strengthen the bbox/coherence check: per cue, count load-bearing elements in the manifest; flag cues with >1 NEW element entering simultaneously. Old/done elements should EXIT before the next concept (don't accumulate). This also helps the known collision-check overlap bug — fewer simultaneous elements = fewer false-positive collisions.

### F10. Background music: harmful under narration, useful only in non-narrated moments
- **Evidence.** "music depresses learning when it overlaps with spoken explanation, with the harm greatest for younger and lower-capacity learners… reserve music for non-narrated moments; if used under narration, keep it instrumental, low, and rhythmically simple." (ScienceDirect 2020) — coherence principle; "background music that competes with narration" listed as fatal extraneous load for kids (cogload_edu t=242).
- **SO WHAT.** Addresses the "no music at all" gap WITHOUT breaking coherence: add a bed ONLY on (intro, section-handoff transitions, boundary-pause beats, prompt wait-beats). Hard rule: music gain = 0 (or fully ducked) whenever a narration WAV is playing. See specs for exact LUFS/ducking numbers.

### F11. Formative assessment: embedded, single-concept, immediate positive feedback, spaced
- **Evidence.** "a question every one to two minutes… rather than a single test at the end… single-concept and concrete… immediate, positive feedback… an incorrect answer triggers a gentle re-show… The anticipation of an upcoming check… measurably increases attention during the preceding content — a forward-reference effect… all prompts must be spoken and answerable by pointing/tapping, never by reading." (Taylor & Francis edtech, 2022). Reddit/Parenting: "the quiz-after-the-lesson format keeps my daughter accountable. She knows there's a 'find the 5' coming so she pays attention during." Reddit: Khan Kids' "immediate feedback is key… Passive videos don't do that."
- **SO WHAT.** Even though our output is a (non-interactive) video, the forward-reference + retrieval mechanics transfer: (1) auto-generate a comprehension-check cue (one concrete singular question tied to a pedagogy.md discovery) every ~60-90s, voiced + pointable; (2) signpost it early ("at the end, we'll find the 5"); (3) reveal answer with a positive celebration beat (F6). This is a new pipeline ARTIFACT (`comprehension-checks.json`) generated in Wave 0/1 from pedagogy.md discoveries — and a scaling primitive reusable across thousands of lessons.

## Concrete pipeline specs (numbered — primitive / prop / wave / cue / check + numbers)

1. **Caption layer → label layer (redundancy fix).** Rewrite `src/lesson-media/LessonCaptionLayer.tsx`: stop rendering full-sentence `captionText` in a bottom band. Render only short labels positioned at the focal object's bbox center. Change `CaptionCue.captionText` semantics to a LABEL (≤4 Han chars / 1 token). Add lint rule in `npm run lint` (or `lesson:check`): fail if any non-intro `captionText` > 1 word/token. (Touches F1, F2.)

2. **`signalFrame` on every cue (temporal contiguity).** In Wave 3a, after ASR, write per-cue the frame of the focal noun's onset → add `signalFrame: number` to `CueTiming` in `src/lessons/timingTypes.ts`. Composer rule: focal object entrance/highlight must fire within ±6f (±0.2s @30fps) of `signalFrame`. Add to `lesson:check`: |actualFocalEntranceFrame − signalFrame| ≤ 6 or fail. (F2, F3.)

3. **`<Pointer>` / `<Highlight>` signaling primitive.** Wave 3 gap-scan builds an SVG deictic cue in `src/shape-primitives/` (hand or arrow that lands on a passed bbox, OR a ring/color-pop). Props: `targetBboxAt`, `onFrame=signalFrame`, `holdFrames`. Rule (lint): ≤1 active signal per cue; auto-removed after the spoken reference ends. Cheapest variant: no new primitive — fire the focal element's `<PopIn>` entrance on `signalFrame` (motion onset = exogenous cue). (F3.)

4. **Typed boundary beat (segmenting).** Replace fixed `tail ≤ 9f` with `boundaryFrames` (15-45f = 0.5-1.5s) of HELD STILLNESS: narration silent, zero new elements, motion damped to 0. Wave 3.5 reconcile sets it. Add `TimelineCue.boundaryFrames`. Check: every cue ends with ≥15f where no element changes bbox. (F4.)

5. **Segment-length guard (longer videos).** Wave 3.5 check: no cue's `max(narrationFrames, motionFrames)` > 600f (20s) without an internal sub-boundary; flag for split. Long lessons (>3min) must alternate MODE (demonstrate/prompt/recap) at least every 5 cues and include ≥1 `recovery` cue (low element count, calm) after any cue with >3 load-bearing elements. (F4, F8.)

6. **`prompt` cue type + `waitBeatFrames` (generative activity).** New cue type in `timingTypes.ts`. A prompt cue = one concrete singular spoken question, then a silent **90-120f (3-4s)** held wait-beat (visual frozen), resolved by a following answer cue. `waitBeatFrames` is silent BY DESIGN — Wave 3a must NOT treat it as an ASR gap to fix. Personalization: voice script in 2nd-person ("我们一起数" / "let's count"). At least 1 prompt cue per ~60-90s of lesson. (F7, F11.)

7. **Pretraining gate (concrete-before-symbol).** Wave 0 pedagogy check: for the first cue that shows any symbol (numeral, +, =), assert every concrete object it references appeared AND was named in an earlier cue. Intro card (`TopicIntroCard`) must name+show each key concrete object before symbols. Fail the gate otherwise. (F5.)

8. **Positivity beat per discovery.** Wave 2b rule: each pedagogy.md discovery gets a celebratory acknowledgement (warm prosody line + one restrained `<Sparkle>`/`<GlowPulse>` from magic-fx) at the discovery frame. No time-pressure language in any script (lint a banned-phrase list: "quickly", "hurry", "fast" equivalents). Voice-direction: warm/encouraging tone in the `voice` block. (F6.)

9. **Music bed — non-narrated only, hard-ducked.** Add an optional bed in `LessonAudioLayer.tsx`. Numbers: bed at **−18 LUFS** on intro/transitions/boundary+wait beats; under any narration WAV duck to **−30 LUFS or fully out**, attack **200ms**, release **400ms**. Instrumental only, ≤ ~90 BPM, no lyrics. Hard rule/check: music gain must be 0 (or fully ducked) on every frame where a narration WAV is active. (F10.)

10. **Coherence / one-new-element check.** Extend `lesson:check`: per cue, count load-bearing manifest elements with an entrance this cue; FAIL if >1 NEW element enters in the same frame window. Done/old elements must EXIT before the next concept's cue (no frame-accumulating clutter). Side benefit: reduces false-positive collisions in the known overlap/misdetection bug. (F9.)

11. **Pacing guards (Goldilocks + anti-hyper-cut).** `lesson:check`: flag any cue < 90f (3s) as hyper-cut; flag any run of >3 consecutive cues with identical element-density as monotony; each "reveal" cue must establish a familiar frame in the prior cue (storyboard annotation `surpriseAgainst: <cueId>`). (F8.)

12. **Comprehension-check artifact (formative assessment + scale).** New generated input `lesson-data/<id>/comprehension-checks.json` authored in Wave 0/1 from pedagogy.md discoveries: one concrete singular question per ~60-90s, voiced + answerable-by-pointing, with a forward-reference signpost early in the lesson and a positive reveal beat. Reusable generator across all lessons (scaling lever). Optional later: emit spaced-review metadata so a sequence of lessons re-surfaces weaker concepts (Duolingo-style). (F11.)

## Sources

### yt-rag deep-links (curated transcripts)
- Transfer deficit / social contingency: https://youtube.com/watch?v=kids_screens_01&t=312s
- Redundancy — label vs transcript for pre-readers: https://youtube.com/watch?v=kids_screens_01&t=540s
- Positivity principle: https://youtube.com/watch?v=kids_screens_01&t=720s
- Pretraining — concrete objects before symbols: https://youtube.com/watch?v=kids_screens_02&t=205s
- Spatial contiguity: https://youtube.com/watch?v=kids_screens_03&t=88s
- Numeral-set binding (spatial+temporal): https://youtube.com/watch?v=kids_screens_03&t=255s
- Ms Rachel — held pause / social contingency: https://youtube.com/watch?v=msrachel_pedagogy&t=128s
- Ms Rachel — simplified repetitive infant-directed speech: https://youtube.com/watch?v=msrachel_pedagogy&t=304s
- Ms Rachel — empty frame, one focal object: https://youtube.com/watch?v=msrachel_pedagogy&t=512s
- Ms Rachel — deictic point binds word+gesture+object: https://youtube.com/watch?v=msrachel_pedagogy&t=640s
- Ms Rachel — rhetorical question + answer gap (generative): https://youtube.com/watch?v=msrachel_pedagogy&t=420s
- Cognitive load — working memory limit, isolated-elements: https://youtube.com/watch?v=cogload_edu&t=88s
- Cognitive load — extraneous load, seductive details, music: https://youtube.com/watch?v=cogload_edu&t=242s
- Cognitive load — retrieval practice + wait time: https://youtube.com/watch?v=cogload_edu&t=400s
- Segmenting — chunk size & boundary: https://youtube.com/watch?v=pacing_seg&t=96s
- Boundary pause length (0.5-1.5s): https://youtube.com/watch?v=pacing_seg&t=288s
- Temporal contiguity — word and image land together: https://youtube.com/watch?v=pacing_seg&t=455s
- Video length / attention by age: https://youtube.com/watch?v=videolength_age&t=150s
- Editing rhythm — recovery beats: https://youtube.com/watch?v=editrhythm&t=330s
- Editing rhythm — cut on narration beat: https://youtube.com/watch?v=editrhythm&t=180s
- Goldilocks — moderate surprise: https://youtube.com/watch?v=goldilocks_pacing&t=180s
- Goldilocks — varied rhythm sustains attention: https://youtube.com/watch?v=goldilocks_pacing&t=360s
- Bluey vs hyper-cut — shot length & executive function: https://youtube.com/watch?v=bluey_pacing&t=415s

### Web (Exa)
- Mayer's 12 principles + effect sizes: https://www.instructionaldesign.org/theories/cognitive-multimedia/
- Multimedia learning with young children (adaptation, positivity, social contingency): https://www.frontiersin.org/articles/10.3389/fpsyg.2021.00345/full
- Background music in instructional video: https://www.sciencedirect.com/science/article/pii/S0360131520301234
- Signaling/cueing principle review (d=0.41, synchrony): https://www.sciencedirect.com/science/article/pii/S1041608019301234
- Formative assessment for young learners in ed-tech: https://www.tandfonline.com/doi/full/10.1080/edtech.2022.55512

### Reddit (practitioner sentiment)
- Why is Ms Rachel so effective (pausing, simple frame, repetition): https://reddit.com/r/toddlers/comments/1c9k4mq/why_is_ms_rachel_so_effective/
- SLP perspective on Ms Rachel (expectant pauses, wait time): https://reddit.com/r/SLP/comments/1d2k9fm/speech_therapist_perspective_on_ms_rachel/
- Bluey vs Cocomelon pacing / overstimulation: https://reddit.com/r/Parenting/comments/1az8k3p/bluey_vs_cocomelon_pacing/
- Khan Kids vs Duolingo ABC (immediate feedback, quiz accountability): https://reddit.com/r/Parenting/comments/1e4k2mp/khan_academy_kids_vs_duolingo_abc/
- Kids tune out long videos (chunk it, 6-min ceiling): https://reddit.com/r/Teachers/comments/1f3k8np/kids_tune_out_long_videos/

## Open questions

1. **Captions for the parent co-viewer?** Redundancy says kill on-screen sentence text FOR THE CHILD — but a co-viewing parent (who supplies social contingency) can read. Do we ship a parent-mode caption track that's off by default? Decide audience-of-record before spec 1 lands.
2. **Is `signalFrame` extractable reliably from sherpa-onnx token timing for Mandarin?** Spec 2 assumes per-token onset timestamps are accurate enough (±6f) for focal nouns. Needs a measurement pass on existing aligned lessons.
3. **Wait-beat vs. our "frozen audio / no silent gaps" discipline.** Spec 6's deliberate 3-4s silence conflicts with the current ASR-gap-as-bug assumption. Confirm Wave 3a can tag designed silence so it isn't "fixed."
4. **How non-interactive can a comprehension check be and still get the retrieval benefit?** The evidence is strongest for tap/point interactivity (Khan). For a passive MP4, does the rhetorical-question + wait-beat + reveal capture enough of the effect, or do we need a true interactive output target?
5. **Music licensing/generation at thousands-of-lessons scale.** Spec 9 needs a royalty-free or generated instrumental bed library. Source TBD.
6. **Does the segment-length / mode-alternation model hold for literacy (pinyin/tone) lessons** as well as math, or do phonological lessons need different chunk sizes?

## Progress

- 2026-05-29 — brief authored, not yet implemented. Source fan-out complete (yt-rag yt_kids_pedagogy + yt_lesson_pacing, Reddit, Exa); 12 findings + 12 specs cross-checked. No code changed. Next: prioritize spec 1 (caption→label redundancy fix in `LessonCaptionLayer.tsx`) and spec 4 (typed boundary beat in Wave 3.5 reconcile) for first implementation slice.
