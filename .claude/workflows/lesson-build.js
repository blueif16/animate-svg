export const meta = {
  name: 'lesson-build',
  description: 'FULL early-childhood SVG-lesson build workflow — the single self-contained loop CLAUDE.md mandates, parameterized by ONE lesson (args.lessonId + optional brief) and runnable in parallel across many lessons (the orchestrator spawns one run per lesson and only observes). It realizes the CLAUDE.md wave order natively: Setup(scaffold) → W0 pedagogy gate → W1 storyboard → W2a visual-design (SERIAL) → {W2b audio/captions ∥ W2c sound-design} → {W3a voice+ASR ∥ W3b primitive gap-scan/build ∥ W3c sound-asset gap-scan} → W3.5 cue-timeline reconcile (mechanical) → {W4a composer ∥ W4b sketch} → W5 render+loudnorm → W6 verification. THE LAWS (CLAUDE.md "Discipline"): the CUE is the unit of coordination — its ONE window is set by W3.5 reconcile = max(narrationFrames, visualMotionFrames)+tail, and audio+visuals+captions all read it (never re-introduce PADDED_CUE_DURATIONS_FRAMES); NARRATION audio is FROZEN after W3a (music+SFX is a 2nd track added at W4 that consumes the timeline and changes no cue length); MEASURE-don\'t-assume (the composer never runs before real voice timing + reconcile exist); ZERO frame literals and ZERO raw motion literals in scene code (every frame = cues[id].startFrame+offset; every curve = EASE.*/SPRING.*); primitives are REUSED by default and W3 owns primitive aesthetic quality. ENTRY-POINT LEVER: args.startAt resumes mid-pipeline (default "setup"); preflight verifies the upstream artifacts a mid-start depends on. Each node returns {node,status,outputArtifacts,summary,issues,pipelineFindings} and writes lesson-data/<id>/_logs/<wave>.md; the run aggregates them — the union of pipelineFindings is the workflow-improvement backlog. Improve a wave by editing its SKILL; improve the chain by editing this file. DO NOT confuse this DRAFT with a tested workflow — validate node-by-node before trusting an unattended run.',
  phases: [
    { title: 'Setup', detail: 'ensure brief.md + scaffold pipeline.json (lesson:scaffold)' },
    { title: 'Pedagogy', detail: 'W0 pedagogy.md — what the child discovers at each cue (the gate every downstream wave reads)' },
    { title: 'Storyboard', detail: 'W1 storyboard.md — cue IDs + narration beats + required visuals; NO durations' },
    { title: 'Design', detail: 'W2a visual-design.md (SERIAL: Visual Contract + per-cue visualMotionSeconds) → W2b audio/captions (script-cues.json) ∥ W2c sound-design (audio-cues.json)' },
    { title: 'Voice & Assets', detail: 'W3a voice+ASR (verify+freeze) ∥ W3b primitive gap-scan→build (default reuse; owns intro card) ∥ W3c sound-asset gap-scan (default reuse the minted library)' },
    { title: 'Reconcile', detail: 'W3.5 mechanical: cueFrames=max(narrationFrames,motionFrames)+tail → embed <X>Cues into <X>LessonTimeline.ts (kit reconcileCueTimeline); animatic gate' },
    { title: 'Compose', detail: 'W4a composer (Complete<X>Lesson.tsx + scene + layout.ts + manifest.ts; bed+SFX+captions wired; lesson:check --measured) ∥ W4b sketch overlay' },
    { title: 'Render', detail: 'W5 lesson:render --skip-voice + loudnorm -16 LUFS/-1 dBTP; auto contact sheet' },
    { title: 'Verify', detail: 'W6 verification.md against pedagogy discoveries + the 4 sound checks; contact sheet is the primary surface' },
  ],
}

// ---------------------------------------------------------------------------
// Parameters (args):
//   lessonId    — kebab-case id, kp<n>-<semantic> (e.g. "kp4-make-ten"). REQUIRED.
//   brief       — optional brief.md TEXT; if given and brief.md is absent, Setup writes it.
//                 If omitted, lesson-data/<id>/brief.md MUST already exist (it is the only
//                 lesson-specific human input — CLAUDE.md "Entry Point").
//   startAt     — entry phase: setup|ped|story|design|wave3|reconcile|compose|render|verify
//                 (default "setup"). Everything from the entry phase onward is a real e2e.
//   style       — optional style-id (e.g. "ink-wash"); overrides the brief **Style.** hint.
//   skipSmoke   — skip the W3.5 animatic gate (default false).
//   renderScale — RENDER_SCALE for fast iterations (the render node honors it). Default "1".
// THE ONLY thing reused across lessons is the shared library (primitives in src/shape-
// primitives/, the curated sound library in @studio/sound-kit, capabilities). The brief,
// pedagogy, script, voice and scene are authored FRESH per lesson.
// ---------------------------------------------------------------------------
const ROOT = '/Users/tk/Desktop/animation-test'
const REPO = `${ROOT}/remotion-svg-primitives`        // npm runs here; lesson-data/ + out/ are relative to it
const NARR = '/Users/tk/Desktop/shared-narration'      // narration kit (voice/asr/cue-plan skills + bin)
const SOUND = '/Users/tk/Desktop/shared-sound'         // sound kit (curated bed/SFX library + mix engine)
const SHARED3D = '/Users/tk/Desktop/shared-3d'         // three-effects kit (decorative 3D only)

const A = (typeof args === 'object' && args) ? args : {}
const lessonId = A.lessonId || A.id || 'demo-lesson'
// Conventional derived names (kebab → camel → Pascal). pipeline.json (scaffolded) is the
// SOURCE OF TRUTH for the exact generated-module / timeline / composition paths; nodes are
// told to read it. These are for path hints + labels only.
const camel = lessonId.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase())
const Pascal = camel.charAt(0).toUpperCase() + camel.slice(1)
const briefText = typeof A.brief === 'string' ? A.brief : null
const style = A.style || null
const skipSmoke = A.skipSmoke === true
const renderScale = A.renderScale || '1'
const startAt = A.startAt || 'setup'

const ORDER = ['setup', 'ped', 'story', 'design', 'wave3', 'reconcile', 'compose', 'render', 'verify']
const startIdx = Math.max(0, ORDER.indexOf(startAt))
const run = (n) => ORDER.indexOf(n) >= startIdx
const skip = (n) => `(reused from disk — ${n} skipped via startAt=${startAt})`

// All lesson artifacts live UNDER remotion-svg-primitives (paths are relative to REPO; npm
// configs take them relative to REPO too). The two technical exceptions (voice wav under
// public/, generated timing modules under src/) are dictated by Remotion/TS imports.
const data = `lesson-data/${lessonId}`
const out = `out/${lessonId}`
const P = {
  // inputs (authored, version-controlled)
  brief: `${data}/brief.md`,
  pipeline: `${data}/pipeline.json`,
  pedagogy: `${data}/pedagogy.md`,
  storyboard: `${data}/storyboard.md`,
  visualDesign: `${data}/visual-design.md`,
  audioCaptions: `${data}/audio-captions.md`,
  scriptCues: `${data}/script-cues.json`,
  audioCues: `${data}/audio-cues.json`,
  primitiveGapScan: `${data}/primitive-gap-scan.md`,
  sketchOverlay: `${data}/sketch-overlay.md`,
  verification: `${data}/verification.md`,
  logs: `${data}/_logs`,
  // generated outputs (derivable)
  mp4: `${out}/${lessonId}.mp4`,
  contact: `${out}/${lessonId}-contact.png`,
  bbox: `${out}/bbox-manifest.json`,
  geminiVoice: `${out}/gemini-voice.json`,
  asr: `${out}/asr-alignment.json`,
  primitiveChecks: `${out}/primitive-checks`,
  // technical exceptions (Remotion/TS-dictated locations)
  voiceWav: `public/audio/${lessonId}-voice.wav`,
  timingTs: `src/lessons/generated/${camel}Timing.ts`,
  silencesTs: `src/lessons/generated/${camel}Silences.ts`,
  timeline: `src/lessons/${camel}LessonTimeline.ts`,
  scene: `src/lessons/${camel}LessonScene.tsx`,
  complete: `src/lessons/Complete${Pascal}Lesson.tsx`,
}

// SKILLS — the per-wave operating system-prompts. Lesson skills are owned by
// animation-test/.agents/skills; voice/asr/cue-plan are owned by the narration kit.
const SK = {
  pipeline: `${ROOT}/.agents/skills/complete-video-pipeline/SKILL.md`,
  pedagogy: `${ROOT}/.agents/skills/lesson-pedagogy/SKILL.md`,
  storyboard: `${ROOT}/.agents/skills/lesson-storyboard/SKILL.md`,
  kidsEye: `${ROOT}/.agents/skills/kids-eye/SKILL.md`,
  visualDiscipline: `${ROOT}/.agents/skills/visual-discipline/SKILL.md`,
  taste: `${ROOT}/.agents/skills/early-childhood-visual-taste/SKILL.md`,
  audioCaptions: `${ROOT}/.agents/skills/lesson-audio-captions/SKILL.md`,
  soundDesign: `${ROOT}/.agents/skills/lesson-sound-design/SKILL.md`,
  composer: `${ROOT}/.agents/skills/remotion-lesson-composer/SKILL.md`,
  sketch: `${ROOT}/.agents/skills/sketch-explainer-layer/SKILL.md`,
  verification: `${ROOT}/.agents/skills/lesson-verification/SKILL.md`,
  ttsVoice: `${NARR}/.agents/skills/tts-voice-direction/SKILL.md`,
  asrAligner: `${NARR}/.agents/skills/asr-cue-aligner/SKILL.md`,
  cuePlan: `${NARR}/.agents/skills/cue-plan-author/SKILL.md`,
}
const CAP = `${ROOT}/.agents/CAPABILITIES.md`                       // craft-technique prose (props/systems/reach-guides)
const TEACH = `${ROOT}/.agents/TEACHING-ACTIONS.md`                 // teaching-MOVE registry — what we teach WITH + each move's requires (pedagogical twin of CAP)
const CATALOG = `${REPO}/src/capabilities/catalog-digest.md`       // GENERATED agent menu — the authoritative "what primitives exist" list
const REGISTRY_JSON = `${REPO}/src/capabilities/primitive-registry.json` // the catalog (prose is the hand-authored layer)
const SOUND_LIB = `${SOUND}/public/audio`                          // _beds|_sfx|_stings + _index.json
const SOUND_GEN = `/Users/tk/Desktop/vlog_test/pipeline/generate-sound-assets.mjs` // author-time minter

const NODE_RESULT = {
  type: 'object',
  additionalProperties: false,
  properties: {
    node: { type: 'string' },
    status: { type: 'string', enum: ['ok', 'gap', 'blocked'] },
    outputArtifacts: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
    issues: { type: 'array', items: { type: 'string' } },
    pipelineFindings: { type: 'array', items: { type: 'string' } },
  },
  required: ['node', 'status', 'outputArtifacts', 'summary', 'pipelineFindings'],
}
// Voice node also reports its per-cue ASR audit (the freeze gate).
const VOICE_RESULT = {
  type: 'object',
  additionalProperties: false,
  properties: {
    ...NODE_RESULT.properties,
    accepted: { type: 'boolean' },
    cueAudit: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: { type: 'string' },
          matchScore: { type: 'number' },
          durationFrames: { type: 'number' },
          reRolled: { type: 'boolean' },
        },
        required: ['id', 'matchScore'],
      },
    },
  },
  required: ['node', 'status', 'outputArtifacts', 'summary', 'pipelineFindings', 'accepted', 'cueAudit'],
}
const PREFLIGHT_RESULT = {
  type: 'object',
  additionalProperties: false,
  properties: {
    ok: { type: 'boolean' },
    missing: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
  },
  required: ['ok', 'missing', 'summary'],
}

// The shared system-prompt preamble. THIS FILE is the single source of truth for execution —
// the wave order (meta.phases + node prompts) AND the Discipline laws, inlined below so the
// PRODUCTION executor (pi agents, which extract.mjs derives from this file and which NEVER load
// CLAUDE.md) receives them through their only channel. CLAUDE.md mirrors these laws as the ambient
// summary for Claude-Code-only sessions; on any disagreement THIS file wins — edit it first.
function discipline(extra) {
  return [
    'You are ONE node in the lesson-build workflow. Your operating system-prompt is the SKILL file(s) listed below — Read them FIRST and follow them literally. Also Read this lesson\'s pedagogy.md (once it exists) — every visual/audio choice must serve a named discovery in it.',
    `LESSON: "${lessonId}" — a single early-childhood SVG lesson video. The brief at ${REPO}/${P.brief} is the ONLY lesson-specific human input; everything else is derived by the waves.`,
    'CUE IS THE UNIT OF COORDINATION. Each cue has ONE timeline window, set by W3.5 reconcile = max(narrationFrames, visualMotionFrames) + tail (tail ≤ 9 frames). Audio, visuals and captions all read THAT window. NEVER re-introduce PADDED_CUE_DURATIONS_FRAMES or any composer-applied padding table independent of audio.',
    'NARRATION AUDIO IS FROZEN AFTER W3a. Once a cue\'s voice is accepted the WAV is canonical — never re-generate for visual fit; if motion overruns its cue, cut non-load-bearing flourishes first, then compress motion uniformly, never extend the cue or re-record. Music + SFX are a SECOND track added at W4 that consumes the reconciled timeline and changes NO cue length.',
    'MEASURE, DON\'T ASSUME. Anything depending on voice output waits for real voice + ASR; the composer never runs before W3a timing AND W3.5 reconcile exist. audio-captions estimates are narration-length hints, not contract.',
    'ZERO FRAME LITERALS in scene code — every frame derives from cues[id].startFrame + offset or endFrame - offset. ZERO RAW MOTION LITERALS — every easing/spring reaches a named export (EASE.*, SPRING.* from src/motion-primitives/curves.ts; <PopIn motion=...>, <TeacherMark boil=...>). ' + `Read ${CAP} before reaching for any motion/sketch/primitive API.`,
    'PRIMITIVES: default = compose EXISTING primitives (src/shape-primitives/, prop-driven, reusable); the AUTHORITATIVE inventory of what exists (every primitive + variants + useWhen) is src/capabilities/catalog-digest.md — generated from code, drift-gated, never hand-edited; consult it instead of guessing. A new primitive ships only when a gap is named explicitly, and W3b MUST wire it into the registry (export from the barrel → npm run registry:build → author prose → registry:check green) or the pre-commit gate rejects it. Primitive aesthetic quality is owned by W3, verified at the W3→W4 boundary — a bad-looking primitive is a W3 bug, kicked back, not patched in the scene.',
    `SCOPE: read ONLY your declared inputs; write ONLY your declared outputs (under ${REPO}/${data}/ and ${REPO}/${out}/, plus the named technical-exception paths ${P.voiceWav} and src/lessons/generated/*, plus running the named npm/bash). Never hardcode lesson topic/copy/timings/paths into shared scripts, primitives or components — those stay lesson-agnostic. Anything out of scope → report it in issues/pipelineFindings; do NOT edit other lessons or unrelated files.`,
    'DETERMINISM: scene/3D code is useCurrentFrame-driven — no useFrame / Date.now / Math.random.',
    `RETURN the structured result. Put what should be IMPROVED about THIS node (the workflow backlog) into pipelineFindings. As your FINAL action, write the tier-2 log ${REPO}/${P.logs}/<wave>.md (INPUTS READ / OUTPUTS WRITTEN / COMMANDS RUN +exit +key stdout-stderr / KEY DECISIONS / ISSUES / PIPELINE FINDINGS).`,
    extra || '',
  ].join('\n')
}

// ===========================================================================
// Preflight: a mid-chain start must find its upstream artifacts already on disk.
const REQUIRED_PRESENT = {
  setup: [],
  ped: [P.brief, P.pipeline],
  story: [P.pedagogy],
  design: [P.storyboard],
  wave3: [P.visualDesign, P.scriptCues, P.audioCues],
  reconcile: [P.visualDesign, P.timingTs],
  compose: [P.timeline, P.primitiveGapScan, P.audioCues],
  render: [P.complete, P.timeline],
  verify: [P.mp4, P.contact],
}
const mustExist = REQUIRED_PRESENT[startAt] || []
if (mustExist.length > 0) {
  log(`Preflight: startAt=${startAt} needs ${mustExist.length} upstream artifact(s) on disk`)
  const pf = await agent([
    `PREFLIGHT — verify a mid-chain start is safe. The workflow starts at "${startAt}", so earlier waves are skipped and their outputs must already exist.`,
    'Check EACH path exists and is non-empty (ls -l). Report ok=true only if ALL are present; else ok=false and list the missing ones.',
    ...mustExist.map((p) => `  - ${REPO}/${p}`),
  ].join('\n'), { label: `preflight ${startAt}`, phase: 'Setup', agentType: 'claude', schema: PREFLIGHT_RESULT })
  if (!pf.ok) {
    log(`Preflight FAILED — missing: ${(pf.missing || []).join(', ')}. Abort; re-run with an earlier startAt.`)
    return { aborted: true, reason: 'preflight-missing-upstream', missing: pf.missing, startAt }
  }
}

// ===========================================================================
phase('Setup')

const rSetup = run('setup') ? await agent([
  discipline(),
  'SETUP (mechanical) — make the lesson runnable: ensure the brief exists, then scaffold the mechanical pipeline.json. Author NO lesson content here.',
  `SKILLS: ${SK.pipeline} (orchestrator overview — read for the folder/command contract).`,
  briefText
    ? `STEP 1 — if ${REPO}/${P.brief} does NOT already exist, write it verbatim from the BRIEF TEXT below (7-section schema). If it exists, leave it untouched.\n--- BRIEF TEXT ---\n${briefText}\n--- END BRIEF ---`
    : `STEP 1 — verify ${REPO}/${P.brief} already exists (it is the human input). If missing, status=blocked (no brief, nothing to build).`,
  `STEP 2 — if ${REPO}/${P.pipeline} is missing, scaffold it: (cd ${REPO} && npm run lesson:scaffold -- --id ${lessonId}). pipeline.json is MECHANICAL (paths + voice config) — do not hand-edit it; it is the source of truth for the exact generated-module / timeline / composition paths the later waves use.`,
  `OWNED PATHS: ${P.brief} (only if writing from BRIEF TEXT), ${P.pipeline}. LESSON-AGNOSTIC: the scaffold script is shared — never edit it for this lesson.`,
  `OUTPUT: confirm ${P.brief} present + ${P.pipeline} scaffolded; report the lessonId, the brief **Style.** value, and the exact paths pipeline.json declares for the timing module + timeline + composition.`,
].join('\n'), { label: 'Setup scaffold', phase: 'Setup', agentType: 'claude', schema: NODE_RESULT }) : (log(`Setup ${skip('setup')}`), null)

// ===========================================================================
phase('Pedagogy')

const rPed = run('ped') ? await agent([
  discipline(),
  'W0 — PEDAGOGY GATE. Before any visual choice, decide what the child DISCOVERS at each beat. For each prospective cue answer: what does the child leave knowing that they did not know walking in? No downstream wave advances without this.',
  `SKILLS: ${SK.pedagogy}`,
  `INPUT: ${REPO}/${P.brief} (Knowledge point / the one beat / out-of-scope / continuity).`,
  `OUTPUT ARTIFACT: ${REPO}/${P.pedagogy} — per-cue discovery list (the spine every later wave references).`,
  `OWNED PATHS: ${P.pedagogy} only. LESSON-AGNOSTIC: pure pedagogy reasoning; touches no code.`,
].join('\n'), { label: 'W0 pedagogy', phase: 'Pedagogy', agentType: 'claude', schema: NODE_RESULT }) : (log(`W0 ${skip('ped')}`), null)

// ===========================================================================
phase('Storyboard')

const rStory = run('story') ? await agent([
  discipline(),
  'W1 — STORYBOARD. Define the cue IDs, the TEACHING ACTION(S) per cue, the narration beat, and the required visual per cue. Decide the teaching VERB before any layout. NO duration estimates anywhere (timing is decided only by W3.5).',
  `SKILLS: ${SK.storyboard}`,
  `INPUT: ${REPO}/${P.pedagogy} (each cue must carry a discovery) ; ${TEACH} (the teaching-move menu — tag each cue with its move(s); required-visual is read off each move's \`requires\`) ; ${REPO}/${P.brief}.`,
  'ACQUISITION RHYTHM: give every invite-echo its OWN `echo-<target>` cue (the wait-time is a real beat; a two-variant echo → two echo cues). End the storyboard with a machine-readable `exposures: { <target>: <n> }` ledger (spaced encounters per acquisition target) — the reconcile reads it for the comprehension-floor advisory.',
  `OUTPUT ARTIFACT: ${REPO}/${P.storyboard} — ordered cues (stable kebab ids), teaching action(s) per cue, narration beat intent, required visual, and the \`exposures\` ledger. The cue ids + order DEFINE the spine that voice / visuals / timing all bind to.`,
  `OWNED PATHS: ${P.storyboard} only. NO durations, no frames, no code.`,
].join('\n'), { label: 'W1 storyboard', phase: 'Storyboard', agentType: 'claude', schema: NODE_RESULT }) : (log(`W1 ${skip('story')}`), null)

// ===========================================================================
phase('Design')   // 2a SERIAL, then 2b ∥ 2c

const rVdesign = run('design') ? await agent([
  discipline(),
  'W2a — VISUAL DESIGN (SERIAL — must finish before W2b/W2c). Author the Visual Contract: the kids-eye measurement block, zones declaration, the identity-invariant, one-metaphor rule, semantic groups, and the per-cue visualMotionSeconds (the MOTION budget — how long the motion needs to READ, intent only, no absolute frames). Every row references a pedagogy discovery.',
  `SKILLS: ${SK.kidsEye} ; ${SK.visualDiscipline} ; ${SK.taste}` + (style ? ` ; STYLE OVERLAY = "${style}" (see ${ROOT}/.agents/styles/${style}/).` : ''),
  `INPUT: ${REPO}/${P.storyboard} (each cue's teaching action(s)) ; ${REPO}/${P.pedagogy} ; ${TEACH} (each move's \`requires\` — the layout/legibility constraints are BINDING, e.g. announce-topic: title reads alone first, cast enters after; model-target-slow: target big+centered+nothing-on-top) ; ${CAP} (reuse vocabulary).`,
  `OUTPUT ARTIFACT: ${REPO}/${P.visualDesign} — Visual Contract with zones + identity-invariant + per-cue visualMotionSeconds. INTENT ONLY, no absolute frames.`,
  `OWNED PATHS: ${P.visualDesign} only. LESSON-AGNOSTIC: design intent, not code.`,
].join('\n'), { label: 'W2a visual-design', phase: 'Design', agentType: 'claude', schema: NODE_RESULT }) : (log(`W2a ${skip('design')}`), null)

let rAudio = null, rSound = null
if (run('design')) {
  // W2b (audio/captions) depends on 2a; W2c (sound-design) depends on 2a + pedagogy. Parallel.
  ;[rAudio, rSound] = await parallel([
    () => agent([
      discipline(),
      'W2b — AUDIO / CAPTIONS. Write the teacher narration TO FIT each cue\'s visualMotionSeconds at the calibrated voice rate (~0.30s per Chinese character for Aoede). Narration is COMMENTARY ON THE VISUAL. NO §3 hold table — that mechanism is deleted; do not invent hold timings.',
      `SKILLS: ${SK.audioCaptions} ; ${SK.cuePlan}`,
      `INPUT: ${REPO}/${P.visualDesign} (per-cue visualMotionSeconds = the budget you write to) ; ${REPO}/${P.storyboard} ; ${REPO}/${P.pedagogy}.`,
      'OUTPUT ARTIFACTS:',
      `  1. ${REPO}/${P.audioCaptions} — per-cue narration + caption text + cue-boundary INTENT (not absolute frames).`,
      `  2. ${REPO}/${P.scriptCues} — the canonical CuePlan JSON per /cue-plan-author (ordered cues: stable id + spoken text + role) — the input the voice kit consumes. Flag any ASR risk with a proposed fix (W3a must apply it or record a reasoned ignore).`,
      `OWNED PATHS: ${P.audioCaptions}, ${P.scriptCues}.`,
    ].join('\n'), { label: 'W2b audio/captions', phase: 'Design', agentType: 'claude', schema: NODE_RESULT }),
    () => agent([
      discipline(),
      'W2c — SOUND DESIGN (∥ W2b; depends on visual-design + pedagogy, NOT on voice). Author the per-lesson sound manifest: bed mood, intro sting, outro resolve, and the SFX→beat map. SEMANTIC ONLY — declare moods + sound KEYS into the shared library, never frames.',
      `SKILLS: ${SK.soundDesign}`,
      `INPUT: ${REPO}/${P.brief} (topic → bed mood + tone-language flag) ; ${REPO}/${P.pedagogy} (reward/discovery beats → where the single ta-da goes) ; ${REPO}/${P.visualDesign} (SFX-worthy beats).`,
      `OUTPUT ARTIFACT: ${REPO}/${P.audioCues} — bed key, toneSafe (true for pinyin/tone lessons → flat pad bed + no melodic motif under narration), intro.sting, outro.resolve, sfx[] (each row: cue + event + sound KEY; the composer computes the FRAME). Keys must resolve in the shared library ${SOUND_LIB}/_*/_index.json.`,
      `OWNED PATHS: ${P.audioCues} only. LESSON-AGNOSTIC: keys reference the shared library; never author a new asset here.`,
    ].join('\n'), { label: 'W2c sound-design', phase: 'Design', agentType: 'claude', schema: NODE_RESULT }),
  ])
} else {
  log(`W2b/W2c ${skip('design')}`)
}

// ===========================================================================
phase('Voice & Assets')   // W3a ∥ W3b ∥ W3c — three independent Wave-3 lanes (barrier before reconcile)

let rVoice = null, rPrim = null, rSndAsset = null
if (run('wave3')) {
  ;[rVoice, rPrim, rSndAsset] = await parallel([
    // --- W3a: voice + ASR — VERIFIED, then FROZEN ---
    () => agent([
      discipline(),
      'W3a — VOICE + ASR (verify, then FREEZE). Generate the voice, then VERIFY it before the run advances. You OWN both running the generator AND auditing the result.',
      `SKILLS: ${SK.ttsVoice} ; ${SK.asrAligner}`,
      `INPUT: ${REPO}/${P.scriptCues} ; ${REPO}/${P.pipeline} (voice config + the exact generated-module paths).`,
      'STEP 1 — generate voice + ASR alignment:',
      `  (cd ${REPO} && npm run lesson:voice -- --config ${P.pipeline})  — writes ${P.voiceWav}, ${P.geminiVoice}, ${P.asr}, and the generated timing module ${P.timingTs} (+ ${P.silencesTs}).`,
      'STEP 2 — VERIFY (do not trust): read gemini-voice.json transcriptText vs the script; walk per-cue matchScore + asrText + durationFrames in the generated timing module. If a cue\'s matchScore is bad, edit that cue\'s text in script-cues.json for ASR-friendliness (or adjust the cue) and RE-ROLL voice — repeat until the audit passes. Apply any ASR risk W2b flagged, or record a reasoned ignore.',
      'STEP 3 — FREEZE: once accepted, the WAV is canonical. The run does NOT advance to reconcile/composer until this audit passes.',
      `OWNED PATHS: ${P.voiceWav}, ${P.geminiVoice}, ${P.asr}, ${P.timingTs}, ${P.silencesTs}, and (only for ASR-friendliness re-rolls) ${P.scriptCues}.`,
      'RETURN accepted=true only when every cue\'s matchScore is acceptable; include the per-cue cueAudit (id, matchScore, durationFrames, reRolled).',
    ].join('\n'), { label: 'W3a voice+ASR', phase: 'Voice & Assets', agentType: 'claude', schema: VOICE_RESULT }),
    // --- W3b: primitive gap-scan → build (default REUSE) ---
    () => agent([
      discipline(),
      'W3b — PRIMITIVE GAP-SCAN → BUILD (∥ voice). Name every visual demand the lesson makes; the DEFAULT answer is COMPOSE EXISTING primitives. A new primitive ships ONLY when the gap is named explicitly.',
      `SKILLS: ${SK.visualDiscipline} ; ${SK.kidsEye} ; the capability protocol ${CAP}.`,
      `INPUT: ${REPO}/${P.storyboard} (the teaching action(s) per cue — gap detection is TEACHING-driven: start from the moves, not a drawn layout) ; ${TEACH} (each move's \`requires\` capability) ; ${REPO}/${P.visualDesign} ; the AUTHORITATIVE reuse menu ${CATALOG} (every existing primitive + its variants + useWhen — consult THIS to decide REUSE vs GAP; it is generated from code and cannot lie) ; the source in ${REPO}/src/shape-primitives/.`,
      'WORK: (1) for every TEACHING ACTION the storyboard used, read its `requires` capability from TEACHING-ACTIONS.md, then list the primitive(s)/component(s) it needs (cross-check the Visual Contract); (2) mark each REUSE (name the existing catalog entry) or GAP (explicitly named — a gap is only real if NO teaching move\'s requirement is already satisfied by the catalog); (3) build any GAP primitive by ADDING IT TO THE APPROPRIATE FAMILY FILE under src/shape-primitives/ (counting.tsx / literacy.tsx / interaction.tsx / sketch.tsx) — prop-driven, reusable, lesson-agnostic (never hardcode this lesson\'s topic). The registry catalogues primitives BY FAMILY, so a brand-new standalone file is NOT discovered and will FAIL registry:check as a stranded export; prefer an existing family file, and only introduce a new family if genuinely needed (then register it: MODULE_KIND + KIND_ORDER in scripts/registry/build-registry.mjs AND the `kind` union in src/capabilities/schema.ts). (4) WIRE IT INTO THE REGISTRY (the registry is drift-gated — an exported-but-unregistered primitive FAILS `npm run registry:check` and cannot be committed): (a) export the new primitive + its public types from the barrel src/shape-primitives/index.ts; (b) `(cd ' + REPO + ' && npm run registry:build)` — discovers it and writes its catalog entry (component/kind/source) + the agent digest; (c) author the entry\'s prose (intent / useWhen / avoidWhen / variants, and flip status off "undocumented") in src/capabilities/primitive-registry.json, then re-run registry:build (prose is carried forward); (c2) ADD A demoProps ENTRY for the new primitive in src/component-gallery/demoProps.tsx (a centered render at the gallery still frame + a short strip of its key variants) — a registered component with no demo FAILS registry:check via the gallery gate (scripts/registry/check-gallery.mjs), so the Component Gallery auto-includes every new component; (d) confirm `(cd ' + REPO + ' && npm run registry:check)` is GREEN; (5) render test stills at REAL render size for the single hardest frame AND the worst-case multiplicity, and VERIFY them yourself before the composer consumes them. ALSO: every lesson opens with a short topic-intro card — if the normalized intro primitives do not fit this subject, DESIGN the intro layout here (it is your job, never the composer\'s).',
      `OUTPUT ARTIFACTS: ${REPO}/${P.primitiveGapScan} (the reuse/gap table) ; any new primitives under src/shape-primitives/ (exported from index.ts) ; their registry entries in ${REGISTRY_JSON} (regenerated + prose authored, registry:check green) ; test stills under ${REPO}/${P.primitiveChecks}/.`,
      `OWNED PATHS: ${P.primitiveGapScan}, src/shape-primitives/* (new prop-driven primitives only) + src/shape-primitives/index.ts (barrel export), src/capabilities/primitive-registry.json + its generated catalog-digest.md/.schema.json (via registry:build — never hand-edit the generated structure), src/component-gallery/demoProps.tsx (the gallery demo entry for any new primitive — required by the gallery gate), ${P.primitiveChecks}/. Primitive aesthetic quality is YOURS and is gated at the W3→W4 boundary.`,
    ].join('\n'), { label: 'W3b primitive build', phase: 'Voice & Assets', agentType: 'claude', schema: NODE_RESULT }),
    // --- W3c: sound-asset gap-scan (default REUSE the minted library) ---
    () => agent([
      discipline(),
      'W3c — SOUND-ASSET GAP-SCAN (∥ voice). Confirm the curated shared library covers every key in audio-cues.json. DEFAULT = REUSE — the library is already richly minted (ElevenLabs Eleven Music beds + Text-to-SFX), so this is usually a fast pass.',
      `SKILLS: ${SK.soundDesign} (asset side).`,
      `INPUT: ${REPO}/${P.audioCues} ; the library index ${SOUND_LIB}/_beds|_sfx|_stings/_index.json.`,
      `WORK: for every bed/sting/sfx KEY in audio-cues.json, confirm it resolves to a licensed WAV in the library. If ALL resolve → status ok in seconds. For a genuine GAP (rare): NAME it, add a spec row to the generator manifest (vlog_test/pipeline/sound-assets.manifest.json), mint it author-time with ${SOUND_GEN} (ElevenLabs, owned commercial license + .license.txt), verify the WAV, and FREEZE before W4. Never wire a download into the render path; renders stay offline-deterministic.`,
      `OUTPUT ARTIFACT: ${REPO}/${P.logs}/sound-asset.md — every key → resolved file (or the gap + how it was minted). LESSON-AGNOSTIC: the library + generator are shared; only this lesson\'s key→file resolution is reported.`,
    ].join('\n'), { label: 'W3c sound-asset', phase: 'Voice & Assets', agentType: 'claude', schema: NODE_RESULT }),
  ])
  if (rVoice && rVoice.accepted === false) {
    log('W3a voice audit did NOT pass (accepted=false). The run continues, but reconcile/composer depend on a frozen-good timing module — inspect _logs/voice.md before trusting downstream.')
  }
} else {
  log(`W3 lanes ${skip('wave3')}`)
}

// ===========================================================================
phase('Reconcile')   // W3.5 — mechanical; the cue is set HERE and nowhere else

const rReconcile = run('reconcile') ? await agent([
  discipline(),
  'W3.5 — CUE-TIMELINE RECONCILE (mechanical). Set the ONE window per cue and embed it as the single shared timeline. This is the only place cue durations are decided.',
  `INPUT: per-cue visualMotionSeconds from ${REPO}/${P.visualDesign} ; per-cue narrationFrames from the generated timing module ${REPO}/${P.timingTs}.`,
  'COMPUTE (use the kit @studio/narration-kit reconcileCueTimeline): for each cue, cueFrames = max(narrationFrames, round(visualMotionSeconds*fps)) + tailFrames (tail ≤ 9 frames / 0.3s). Chain cues end-to-end into startFrame/endFrame.',
  `EMBED the reconciled cue list directly into ${REPO}/${P.timeline} as the exported ${camel}Cues array (audio, visuals and captions all read THIS). Do NOT create PADDED_CUE_DURATIONS_FRAMES or any padding table. The brief **Length** is a HINT only — the true length is sum(cueFrames); accept drift.`,
  'INTENTIONAL SILENCE IS ALREADY IN THE WAV. Any `gap` (learner-response wait-time, animation-hold, …) authored by W2b was baked into the frozen WAV at W3a as zero-cost local silence and detected by detect-silences — so it is absorbed into the cue window via audioSpanFrames with NO reconcile-math change. Do not re-pad it. (docs/pipeline-architecture.md §10.)',
  `COMPREHENSION-FLOOR ADVISORY (advisory, NEVER blocking — like lesson:check): if ${REPO}/${P.storyboard} declares an \`exposures\` ledger and the lesson has acquisition targets, compare per-target counts against the lesson-pedagogy §8 floor (≥6–10 spaced exposures; ≥3–5s wait-time per echo) and the reconciled per-cue durations. If a target lands UNDER its floor, record a WARN in this node's \`issues\` + \`pipelineFindings\` (e.g. "acquisition target 'I'm' has 4 exposures < §8 floor"). Report the emergent total length as-is — never score it against a number. If the ledger is absent, print \`SKIP: no exposures ledger\` — do not silently pass.`,
  skipSmoke ? 'ANIMATIC GATE: skipped (args.skipSmoke).' : `ANIMATIC GATE (pre-W4): (cd ${REPO} && npm run lesson:animatic -- --config ${P.pipeline}) — render the cue-boundary animatic strip + waveform; confirm cue windows align with the voice (incl. the baked silences) before composing.`,
  `OUTPUT ARTIFACT: ${REPO}/${P.timeline} (with the ${camel}Cues array). OWNED PATHS: ${P.timeline} only.`,
].join('\n'), { label: 'W3.5 reconcile', phase: 'Reconcile', agentType: 'claude', schema: NODE_RESULT }) : (log(`W3.5 ${skip('reconcile')}`), null)

// ===========================================================================
phase('Compose')   // W4a composer ∥ W4b sketch — both consume the reconciled cues

let rCompose = null, rSketch = null
if (run('compose')) {
  ;[rCompose, rSketch] = await parallel([
    () => agent([
      discipline(),
      'W4a — COMPOSER. Build the lesson scene from the approved artifacts + the RECONCILED cue boundaries. ZERO frame literals: every frame derives from cues[id].startFrame + offset (offsets are layout.ts constants). Never re-pad — if motion overruns its cue, cut non-load-bearing flourishes first, then compress uniformly.',
      `SKILLS: ${SK.composer}` + (style ? ` ; wrap the scene root in <StylePreset> for style "${style}".` : ''),
      `INPUT: the reconciled ${camel}Cues in ${REPO}/${P.timeline} ; ${REPO}/${P.storyboard} (each cue's teaching action(s)) ; ${TEACH} (HONOR each move's \`requires\` — the layout/legibility constraints are binding: announce-topic ⇒ the title reads ALONE first, cast enters after (never overlay art on text); model-target-slow ⇒ target big+centered+nothing-on-top, held; spaced-recall ⇒ the live marker lands on the CURRENTLY-spoken item, never a stale row) ; ${REPO}/${P.visualDesign} ; ${REPO}/${P.audioCaptions} ; ${REPO}/${P.audioCues} ; the verified primitives + test stills from W3b ; ${REPO}/${P.primitiveGapScan} ; ${CAP}.`,
      'EMIT (consume existing primitives + generated timing — do not author one-off SVG art):',
      `  - ${REPO}/${P.complete} (the Complete wrapper) + ${REPO}/${P.scene} (scene) + src/lessons/${camel}/layout.ts (offset constants) + src/lessons/${camel}/manifest.ts (bboxAt per load-bearing element; contract src/lessons/manifestTypes.ts).`,
      '  - AUDIO WIRING: <LessonAudioLayer> (voice), <LessonBgmLayer> (bed — MECHANICAL envelope over the cue narration windows + total), <LessonSfxLayer> with SFX fired at YOUR OWN motion frames from audio-cues.json (bed = mechanical; SFX frames = composer-owned, derived from cueFrames + layout.ts offsets, NEVER literals), and the caption layer.',
      `SELF-CHECK before declaring done: (cd ${REPO} && npm run lesson:check -- --config ${P.pipeline} --measured) — review summary.collisionCount (linear) AND summary.measuredCollisionCount + summary.gatesFailed (real-pixel + LUFS/caption/contrast/legibility/motion gates). Any non-zero collision or failed gate requires a fix or an explicit written justification. Then rerun the pedagogy discovery audit against the rendered still.`,
      `OWNED PATHS: ${P.complete}, ${P.scene}, src/lessons/${camel}/layout.ts, src/lessons/${camel}/manifest.ts. Register the composition. LESSON-AGNOSTIC: reuse primitives + kit layers; never hardcode timings.`,
    ].join('\n'), { label: 'W4a composer', phase: 'Compose', agentType: 'claude', schema: NODE_RESULT }),
    () => agent([
      discipline(),
      'W4b — SKETCH OVERLAY (∥ composer). Specify the hand-drawn teacher-mark overlays in CUE-RELATIVE frames (never master-timeline absolutes). Restraint is the rule — marks point at the load-bearing moment, nothing decorative.',
      `SKILLS: ${SK.sketch}`,
      `INPUT: the reconciled ${camel}Cues in ${REPO}/${P.timeline} ; ${REPO}/${P.visualDesign} ; ${REPO}/${P.pedagogy} (mark the discovery).`,
      `OUTPUT ARTIFACT: ${REPO}/${P.sketchOverlay} — per-mark spec in cue-relative frames (use <TeacherMark> + boil from ${CAP}). OWNED PATHS: ${P.sketchOverlay} only.`,
    ].join('\n'), { label: 'W4b sketch', phase: 'Compose', agentType: 'claude', schema: NODE_RESULT }),
  ])
} else {
  log(`W4 ${skip('compose')}`)
}

// ===========================================================================
phase('Render')

const rRender = run('render') ? await agent([
  discipline(),
  'W5 — RENDER (mechanical). Render the full lesson against the FROZEN voice + reconciled timeline, then loudness-normalize. You need bash/npm.',
  `INPUT: ${REPO}/${P.pipeline} ; the composed scene + ${P.timeline} ; the frozen ${P.voiceWav}.`,
  `STEP 1 — render (voice frozen from W3a; the script auto-skips voice when the timing module exists, but pass --skip-voice to be explicit): (cd ${REPO} && RENDER_SCALE=${renderScale} npm run lesson:render -- --config ${P.pipeline} --skip-voice). This auto-builds the contact sheet at the end.`,
  'STEP 2 — a post-render ffmpeg loudnorm pass normalizes the master to -16 LUFS / -1 dBTP (deterministic 2nd pass; it runs inside lesson:render unless --skip-loudnorm). For a fast scale<1 iteration you MAY pass --skip-loudnorm, but the final 1.0 render must be normalized.',
  `OUTPUT ARTIFACTS: ${REPO}/${P.mp4} ; ${REPO}/${P.contact} (+ contact json) ; ${REPO}/${P.bbox}. Report ffprobe WxH/fps/frames/duration + measured loudness. OWNED PATHS: everything under ${out}/ + the master mp4.`,
].join('\n'), { label: 'W5 render', phase: 'Render', agentType: 'claude', schema: NODE_RESULT }) : (log(`W5 ${skip('render')}`), null)

// ===========================================================================
phase('Verify')

const rVerify = run('verify') ? await agent([
  discipline(),
  'W6 — VERIFICATION. Review the rendered output against the pedagogy discoveries. The PRIMARY surface is the action-aware contact sheet (5 samples per cue: start / narr-mid / narr-end / hold-mid / cue-end) — stagnation is visible at a glance. You CANNOT watch the mp4; judge from the contact sheet + frames.',
  `SKILLS: ${SK.verification}`,
  `INPUT: the contact sheet ${REPO}/${P.contact} (Read as image) ; ${REPO}/${P.mp4} (ffprobe only) ; ${REPO}/${P.bbox} (linear + measured collisions, gates) ; ${REPO}/${P.primitiveChecks}/*.png ; ${REPO}/${P.pedagogy}.`,
  'JUDGE: (1) does each cue TEACH its pedagogy discovery (re-run the §1 audit)? (2) layout/legibility — any collision or failed gate from bbox-manifest unaddressed? (3) SOUND checks: melody NOT identifiable under narration ; 3-point duck (intro duck / mid-gap rise / outro resolve) ; measured master ≈ -16 LUFS / TP ≤ -1 dB (the LUFS gate in lesson:check --measured) ; no SFX louder than narration.',
  `OUTPUT ARTIFACT: ${REPO}/${P.verification} — per-cue pedagogy verdict + the sound/layout gate results + a punch list of any fixes (mapped to the owning wave for a targeted re-run). OWNED PATHS: ${P.verification} only.`,
].join('\n'), { label: 'W6 verification', phase: 'Verify', agentType: 'claude', schema: NODE_RESULT }) : (log(`W6 ${skip('verify')}`), null)

// ===========================================================================
// Aggregate — the whole run at a glance (CLAUDE.md observability tier 1). The union of
// every node's pipelineFindings is the workflow-improvement backlog.
return {
  lessonId,
  startAt,
  artifacts: { brief: P.brief, mp4: P.mp4, contact: P.contact, verification: P.verification },
  nodes: {
    setup: rSetup, w0_pedagogy: rPed, w1_storyboard: rStory, w2a_visualDesign: rVdesign,
    w2b_audioCaptions: rAudio, w2c_soundDesign: rSound,
    w3a_voice: rVoice, w3b_primitive: rPrim, w3c_soundAsset: rSndAsset,
    w35_reconcile: rReconcile, w4a_composer: rCompose, w4b_sketch: rSketch,
    w5_render: rRender, w6_verification: rVerify,
  },
  pipelineFindings: [
    rSetup, rPed, rStory, rVdesign, rAudio, rSound, rVoice, rPrim, rSndAsset,
    rReconcile, rCompose, rSketch, rRender, rVerify,
  ].filter(Boolean).flatMap((r) => (r && Array.isArray(r.pipelineFindings)) ? r.pipelineFindings : []),
}
