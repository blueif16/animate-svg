export const meta = {
  name: 'lesson-build',
  description: 'FULL early-childhood SVG-lesson build workflow — the single self-contained loop CLAUDE.md mandates, parameterized by ONE lesson (args.lessonId + optional brief) and runnable in parallel across many lessons (the orchestrator spawns one run per lesson and only observes). It realizes the CLAUDE.md wave order natively: Setup(scaffold) → W0 pedagogy gate → W1 storyboard → W2a visual-design (SERIAL) → {W2b audio/captions ∥ W2c sound-design} → {W3a voice+ASR ∥ W3b primitive gap-scan/build ∥ W3c sound-asset gap-scan} → W3.5 cue-timeline reconcile (mechanical) → {W4a composer ∥ W4b sketch} → W5 render+loudnorm → W6 verification. THE LAWS (CLAUDE.md "Discipline"): the CUE is the unit of coordination — its ONE window is set by W3.5 reconcile = max(narrationFrames, visualMotionFrames)+tail, and audio+visuals+captions all read it (never re-introduce PADDED_CUE_DURATIONS_FRAMES); NARRATION audio is FROZEN after W3a (music+SFX is a 2nd track added at W4 that consumes the timeline and changes no cue length); MEASURE-don\'t-assume (the composer never runs before real voice timing + reconcile exist); ZERO frame literals and ZERO raw motion literals in scene code (every frame = cues[id].startFrame+offset; every curve = EASE.*/SPRING.*); primitives are REUSED by default and W3 owns primitive aesthetic quality. ENTRY-POINT LEVER: args.startAt resumes mid-pipeline (default "setup"); preflight verifies the upstream artifacts a mid-start depends on. Each node returns {node,status,outputArtifacts,summary,issues,pipelineFindings} and writes lesson-data/<id>/_logs/<wave>.md; the run aggregates them — the union of pipelineFindings is the workflow-improvement backlog. Improve a wave by editing its SKILL; improve the chain by editing this file. DO NOT confuse this DRAFT with a tested workflow — validate node-by-node before trusting an unattended run.',
  phases: [
    { title: 'Setup', detail: 'ensure brief.md + scaffold pipeline.json (lesson:scaffold)' },
    { title: 'Pedagogy', detail: 'W0 pedagogy.md — what the child discovers at each cue (the gate every downstream wave reads)' },
    { title: 'Storyboard', detail: 'W1 storyboard.md — cue IDs + narration beats + required visuals; NO durations' },
    { title: 'Design', detail: 'W2a visual-design.md (SERIAL: Visual Contract + per-cue visualMotionSeconds) → W2b audio/captions (script-cues.json) ∥ W2c sound-design (audio-cues.json)' },
    { title: 'Voice & Assets', detail: 'W3a voice+ASR (verify+freeze) ∥ W3b primitive gap-scan→build (default reuse; owns intro card) ∥ W3c sound-asset gap-scan (default reuse the minted library)' },
    { title: 'Reconcile', detail: 'W3.5 mechanical: cueFrames=max(narrationFrames+gapFrames,motionFrames)+tail from the per-cue clip module → embed <X>Cues + <X>VoiceClips into <X>LessonTimeline.ts (kit reconcileClipTimeline); animatic gate' },
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
  voiceWav: `public/audio/${lessonId}-voice.wav`,        // QA/scrub master (render uses the per-cue clips)
  voiceClipsDir: `public/audio/${lessonId}/clips`,        // v4: one trimmed clip per cue
  clipsTs: `src/lessons/generated/${camel}Clips.ts`,      // v4: the AUDIO TRUTH the reconcile chains
  timingTs: `src/lessons/generated/${camel}Timing.ts`,    // ASR alignment — QA only (matchScore audit)
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
  primitiveBuilder: `${ROOT}/.agents/skills/primitive-builder/SKILL.md`,
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
//
// VERIFY EVERY EDIT WITH `node pi-runner/extract.mjs` — NOT `node --check`. extract.mjs parses the
// body the way pi does (de-export meta → new AsyncFunction(body)); `node --check` ESM-parses the
// file and SILENTLY tolerates an unclosed template literal (e.g. a `${...}` string closed with `'`
// instead of a backtick) that makes extraction — and therefore every pi run — fail. A green
// `node --check` is NOT sufficient; a clean `extract.mjs` (prints all N nodes/stages) is.
function discipline(extra) {
  return [
    'You are ONE node in the lesson-build workflow. Your operating system-prompt is the SKILL file(s) listed below — Read them FIRST and follow them literally. Also Read this lesson\'s pedagogy.md (once it exists) — every visual/audio choice must serve a named discovery in it.',
    `LESSON: "${lessonId}" — a single early-childhood SVG lesson video. The brief at ${REPO}/${P.brief} is the ONLY lesson-specific human input; everything else is derived by the waves.`,
    'CUE IS THE UNIT (v4 cue-anchored audio): the cue window is set ONLY by W3.5 reconcile = max(narration+gap, motion)+tail; each cue owns its own measured clip in its own <Sequence from={startFrame}> (no continuous WAV). NEVER re-introduce PADDED_CUE_DURATIONS_FRAMES, a continuous voice Sequence, or detect-silence snapping. (Full mechanics live in the reconcile + composer nodes.)',
    'AUDIO FROZEN AFTER W3a: the per-cue clips are canonical; if motion overruns, cut flourishes then compress motion — never extend the cue or re-record. Music+SFX is a 2nd W4 track that changes no cue length. MEASURE, don\'t assume: the composer runs only after real W3a timing + W3.5 reconcile exist (audio-captions estimates are hints, not contract).',
    'ZERO FRAME LITERALS + ZERO RAW MOTION LITERALS in scene code — every frame = cues[id].startFrame+offset (or endFrame−offset); every curve = a named EASE.*/SPRING.* / <PopIn motion> / <TeacherMark boil>. (Detail: the remotion-lesson-composer skill; only W4a/W4b write scene code.)',
    `PRIMITIVES: default = REUSE existing; ${CATALOG} is the authoritative inventory — consult it, never read primitive source or guess. A new primitive is W3b's job only (named explicitly, registered, aesthetic quality gated at the W3→W4 boundary).`,
    `READING LAW — your knowledge comes from the SKILL SYSTEM, never from other lessons. Your ONLY permitted sources are EXACTLY: (1) the SKILL file(s) named below for your wave — read them FIRST and follow them LITERALLY; (2) ${CATALOG} — the COMPLETE, code-generated, authoritative inventory of every primitive + variants + useWhen (for "what can I use / how is it used", consult THIS; NEVER read primitive source to learn usage, NEVER guess); (3) THIS lesson's OWN upstream artifacts under ${REPO}/${data}/ that your INPUT names. That set is COMPLETE — it is everything you need. Do NOT gather extra context. NEVER read, grep, find, ls, or otherwise "explore" any OTHER lesson (lesson-data/<other>/**, src/lessons/<other>/**, out/<other>/**) or any file outside your declared scope. NEVER learn from, copy, imitate, or "continue from" a prior lesson's artifacts — prior artifacts are presumed flawed AND learning from them is hidden hard-coding that would mask whether the skill system itself works. Continuity with a "builds-on" lesson is delivered THROUGH the skills + registered capabilities (e.g. "reuse the registered dot primitive / the 分合 motion vocabulary"), NEVER by opening that lesson. If the skills feel insufficient, that is a SKILL GAP → record it in pipelineFindings and proceed from the skills as written; do NOT compensate by spelunking the repo.`,
    `SCOPE: write ONLY your declared outputs (under ${REPO}/${data}/ and ${REPO}/${out}/, plus the named technical-exception paths ${P.voiceWav} and src/lessons/generated/*, plus running the named npm/bash). Never hardcode lesson topic/copy/timings/paths into shared scripts, primitives or components — those stay lesson-agnostic. Anything out of scope → report it in issues/pipelineFindings; do NOT edit other lessons or unrelated files.`,
    'DETERMINISM: scene/3D code is useCurrentFrame-driven — no useFrame / Date.now / Math.random.',
    'LEAN ARTIFACT: your output is a SPEC the next wave consumes, not an essay. State each rule ONCE (cross-reference; never restate it in a later section), prefer tables to prose, and NEVER re-quote another doc (cite a catalog primitive by id — do not paste its useWhen). Put ALL self-audit / self-check / ✓-checklist / one-metaphor-check / finger-cover / "contract complete" results in your structured return + the tier-2 log — NEVER as prose sections inside the artifact. A verbose artifact stalls the downstream model; concision IS quality here.',
    `RETURN the structured result. Put what should be IMPROVED about THIS node (the workflow backlog) into pipelineFindings. As your FINAL action, write the tier-2 log ${REPO}/${P.logs}/<wave>.md (INPUTS READ / OUTPUTS WRITTEN / COMMANDS RUN +exit +key stdout-stderr / KEY DECISIONS / ISSUES / PIPELINE FINDINGS).`,
    extra || '',
  ].join('\n')
}

// OUTPUT CONTRACT (the 4th contract layer). Claude-native gives a skill `description`
// (requirements), `## Inputs`/`## Output` prose (I/O), and a return `schema` (the RETURN shape,
// validated + retried) — but it verifies the returned MESSAGE, never the FILESYSTEM. So a producing
// node DECLARES, as DATA, the files it MUST leave on disk and the only paths it may write — authored
// once, the same double-duty economy as `schema`. This renders BOTH the forceful Definition-of-Done
// prose (the model reads it) AND the DRIVER-ARTIFACTS / DRIVER-OWNS machine markers (the pi driver
// parses them and VERIFIES the required files exist, independent of the self-reported
// outputArtifacts). In the dev Workflow the prose guides Claude (no fs post-hook); on pi the driver
// enforces. `artifacts` = files that MUST exist (non-empty) on exit — the hard gate. `owns` = the
// ONLY paths this node may write (a trailing /* or /** marks a directory it owns; defaults to
// `artifacts`). `readScope` = the node's full legitimate READ surface (renders DRIVER-READ-SCOPE; its
// roots are ABSOLUTE and joined AS-IS, NOT abs()-prefixed — they span outside REPO, e.g. ${ROOT}/.agents;
// OS-enforced under --sandbox, inert otherwise) — EVERY producing node declares one (same tier as owns).
// `note` = an optional extra owned-path caveat. Full spec:
// ~/.claude/skills/transform-workflow-to-pi/reference/artifact-contract.md.
function contract({ artifacts = [], owns = [], readScope = [], note = '', lint = false }) {
  const abs = (p) => `${REPO}/${p}`
  const code = artifacts.filter((p) => /\.tsx?$/.test(p)) // the .ts/.tsx artifacts this node is on the hook to lint
  return [
    'OUTPUT CONTRACT — you are DONE only when EVERY file below exists and is non-empty at EXACTLY its path. Write NOTHING outside the owned paths (never another lesson\'s files). If you cannot produce them, set status="blocked" and say why — do NOT exit clean (an empty or wrong-path artifact set is a FAILURE, not an ok).',
    `DRIVER-ARTIFACTS: ${artifacts.map(abs).join(' ')}`,
    `DRIVER-OWNS: ${[...(owns.length ? owns : artifacts), `${P.logs}/*`].map(abs).join(' ')}`, // every node may always write its own _logs/<wave>.md (observability) — never over-block it
    // READ-SCOPE — the node's full legitimate read surface (its own data/out dirs + the shared
    // skills/catalog roots it reads). ABSOLUTE roots joined AS-IS (NOT abs()-prefixed — they span
    // outside REPO, e.g. ${ROOT}/.agents). OS-enforced under --sandbox; inert otherwise.
    readScope.length ? `DRIVER-READ-SCOPE: ${readScope.join(' ')}` : '',
    note ? `OWNED-PATH NOTE: ${note}` : '',
    // LINT GATE — lint-clean is part of "done" for any node that writes code. The W5 render gate is
    // whole-repo `eslint src && tsc`, so ONE dirty file blocks EVERY lesson's render; each code-writing
    // node must therefore lint its OWN files clean in its OWN lane (not gate on whole-repo lint — another
    // half-built lesson's errors aren't its lane). Scoped to the .ts/.tsx artifacts above.
    lint && code.length
      ? `LINT GATE — before status="ok", run \`(cd ${REPO} && npx eslint ${code.join(' ')})\` and FIX EVERY error (re-run until clean). Lint-clean means: every exported React component is PascalCase (a lowercase component name makes useCurrentFrame()/useMeasureHook() a react-hooks/rules-of-hooks ERROR), ESM \`import\` only (NEVER require()), and ZERO unused imports/vars. A lint error in YOUR file is a contract breach (status="blocked"), not a downstream surprise — do NOT gate yourself on whole-repo \`npm run lint\`, only on YOUR files.`
      : '',
  ].filter(Boolean).join('\n')
}

// READ-SCOPE roots (absolute, joined AS-IS by contract({readScope})) — OS-enforced under --sandbox,
// inert otherwise. EVERY producing node declares one (same tier as owns/artifacts). Two reusable shapes:
//   contentScope — pure authoring nodes (W0/W1/W2a/W2b/W2c/W4b): ONLY this lesson's data + out dirs +
//                  the shared skills/docs (.agents). Excludes every OTHER lesson's data and the wider tree.
//   codeScope    — code-touching nodes (W3a/W3b/W3.5/W4a/W5): contentScope PLUS the shared src/public/
//                  scripts + the lint/render configs they legitimately read (a self-check that BUNDLES
//                  the project pulls sibling source into the bundle graph, so the src root is unavoidable).
// What is ALWAYS excluded: other lessons' lesson-data/<other> + out/<other> (the hidden-hard-coding
// surface) and the external filesystem (the `find /` / shared-sound spelunk).
const contentScope = [`${REPO}/${data}`, `${REPO}/${out}`, `${ROOT}/.agents`]
const codeScope = [`${REPO}/src`, `${REPO}/public`, `${REPO}/scripts`, `${REPO}/package.json`, `${REPO}/tsconfig.json`, `${REPO}/eslint.config.mjs`, `${REPO}/remotion.config.ts`, ...contentScope]

// ===========================================================================
// Preflight: a mid-chain start must find its upstream artifacts already on disk.
const REQUIRED_PRESENT = {
  setup: [],
  ped: [P.brief, P.pipeline],
  story: [P.pedagogy],
  design: [P.storyboard],
  wave3: [P.visualDesign, P.scriptCues, P.audioCues],
  reconcile: [P.visualDesign, P.clipsTs],
  compose: [P.timeline, P.primitiveGapScan, P.audioCues],
  render: [P.complete, P.timeline],
  verify: [P.mp4, P.contact],
}
const mustExist = REQUIRED_PRESENT[startAt] || []
if (mustExist.length > 0) {
  log(`Preflight: startAt=${startAt} needs ${mustExist.length} upstream artifact(s) on disk`)
  const pf = await agent([
    `DRIVER-PREFLIGHT: ${mustExist.map((p) => `${REPO}/${p}`).join(' ')}`,
    `PREFLIGHT — verify a mid-chain start is safe. The workflow starts at "${startAt}", so earlier waves are skipped and their outputs must already exist.`,
    'Check EACH path exists and is non-empty (ls -l). Report ok=true only if ALL are present; else ok=false and list the missing ones.',
    'This is a CHECK node that writes NO artifacts. In your final RETURN BLOCK set outputArtifacts:[] and status MUST MIRROR ok: all present ⇒ status="ok" (an empty artifact list with status="ok" is correct for a check node); any missing ⇒ status="blocked". NEVER report status="blocked" when ok=true.',
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
  `OUTPUT: confirm ${P.brief} present + ${P.pipeline} scaffolded; report the lessonId, the brief **Style.** value, and the exact paths pipeline.json declares for the timing module + timeline + composition.`,
  contract({ artifacts: [P.brief, P.pipeline], readScope: codeScope, note: 'the scaffold script (npm run lesson:scaffold) is shared — never edit it for this lesson.' }),
].join('\n'), { label: 'Setup scaffold', phase: 'Setup', agentType: 'claude', schema: NODE_RESULT }) : (log(`Setup ${skip('setup')}`), null)

// ===========================================================================
phase('Pedagogy')

const rPed = run('ped') ? await agent([
  discipline(),
  'W0 — PEDAGOGY GATE. Before any visual choice, decide what the child DISCOVERS at each beat. For each prospective cue answer: what does the child leave knowing that they did not know walking in? No downstream wave advances without this.',
  `SKILLS: ${SK.pedagogy}`,
  `INPUT: ${REPO}/${P.brief} (Knowledge point / the one beat / out-of-scope / continuity).`,
  `OUTPUT ARTIFACT: ${REPO}/${P.pedagogy} — per-cue discovery list (the spine every later wave references). LEAN: each cue = the fenced discovery/stage/focal/reinforcement block ONLY (no prose paragraph re-saying the fence); state the reinforcement plan ONCE. Any downstream audit checklist you specify is "run in your head, report pass/fail in the structured return" — it must NOT instruct later waves to emit ✓-audit sections into their artifacts. Target ≤ 8k chars.`,
  contract({ artifacts: [P.pedagogy], readScope: contentScope, note: 'pure pedagogy reasoning; touches no code.' }),
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
  contract({ artifacts: [P.storyboard], readScope: contentScope, note: 'NO durations, no frames, no code.' }),
].join('\n'), { label: 'W1 storyboard', phase: 'Storyboard', agentType: 'claude', schema: NODE_RESULT }) : (log(`W1 ${skip('story')}`), null)

// ===========================================================================
phase('Design')   // 2a SERIAL, then 2b ∥ 2c

const rVdesign = run('design') ? await agent([
  discipline(),
  'W2a — VISUAL DESIGN (SERIAL — must finish before W2b/W2c). Author the Visual Contract: the kids-eye measurement block, zones declaration, the identity-invariant, one-metaphor rule, semantic groups, and the per-cue visualMotionSeconds (the MOTION budget — how long the motion needs to READ, intent only, no absolute frames). Every row references a pedagogy discovery.',
  `SKILLS: ${SK.kidsEye} ; ${SK.visualDiscipline} ; ${SK.taste}` + (style ? ` ; STYLE OVERLAY = "${style}" (see ${ROOT}/.agents/styles/${style}/).` : ''),
  `INPUT: ${REPO}/${P.storyboard} (each cue's teaching action(s)) ; ${REPO}/${P.pedagogy} ; ${TEACH} (each move's \`requires\` — the layout/legibility constraints are BINDING, e.g. announce-topic: title reads alone first, cast enters after; model-target-slow: target big+centered+nothing-on-top) ; ${CAP} (reuse vocabulary).`,
  `OUTPUT ARTIFACT: ${REPO}/${P.visualDesign} — Visual Contract with zones + identity-invariant + per-cue visualMotionSeconds. INTENT ONLY, no absolute frames. LEAN (this artifact is the composer's biggest input): the measurement block, zones, the contract block, the per-cue motion-budget TABLE, palette/motion vocab, the reuse-primitive table, and a terse anti-pattern list — and NOTHING ELSE. NO §audit / §self-check / §one-metaphor-check / §finger-cover / "contract complete" prose; state each rule ONCE (≤1-sentence notes per cue). Target ≤ 13k chars.`,
  contract({ artifacts: [P.visualDesign], readScope: contentScope, note: 'design intent, not code.' }),
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
      `  1. ${REPO}/${P.audioCaptions} — LEAN: the per-cue narration/caption TABLE + a ≤5-line ASR-risk note ONLY. NO per-cue "why this shape" rationale, NO narration-leakage audit table, NO totals recompute, NO continuity section (run those in your head; surface only failures in the structured return). Target ≤ 5k chars.`,
      `  2. ${REPO}/${P.scriptCues} — the canonical CuePlan JSON per /cue-plan-author (ordered cues: stable id + spoken text + role) — the input the voice kit consumes. Flag any ASR risk with a proposed fix (W3a must apply it or record a reasoned ignore).`,
      contract({ artifacts: [P.audioCaptions, P.scriptCues], readScope: contentScope }),
    ].join('\n'), { label: 'W2b audio/captions', phase: 'Design', agentType: 'claude', schema: NODE_RESULT }),
    () => agent([
      discipline(),
      'W2c — SOUND DESIGN (∥ W2b; depends on visual-design + pedagogy, NOT on voice). Author the per-lesson sound manifest: bed mood, intro sting, outro resolve, and the SFX→beat map. SEMANTIC ONLY — declare moods + sound KEYS into the shared library, never frames.',
      `SKILLS: ${SK.soundDesign}`,
      `INPUT: ${REPO}/${P.brief} (topic → bed mood + tone-language flag) ; ${REPO}/${P.pedagogy} (reward/discovery beats → where the single ta-da goes) ; ${REPO}/${P.visualDesign} (SFX-worthy beats).`,
      `OUTPUT ARTIFACT: ${REPO}/${P.audioCues} — bed key, toneSafe (true for pinyin/tone lessons → flat pad bed + no melodic motif under narration), intro.sting, outro.resolve, sfx[] (each row: cue + event + sound KEY; the composer computes the FRAME). Keys must resolve in the shared library ${SOUND_LIB}/_*/_index.json.`,
      contract({ artifacts: [P.audioCues], readScope: [...contentScope, SOUND_LIB], note: 'keys reference the shared library; never author a new asset here, and NEVER read or write another lesson\'s audio-cues.json (this is the cross-contamination guard).' }),
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
      'STEP 1 — generate voice + ASR alignment (v4 cue-anchored audio):',
      `  (cd ${REPO} && npm run lesson:voice -- --config ${P.pipeline})  — generates ONE TRIMMED clip per cue under ${P.voiceClipsDir}, writes the per-cue CLIP MODULE ${P.clipsTs} (the AUDIO TRUTH: clipSrc + exact narrationFrames + any typed gap), a QA master ${P.voiceWav}, ${P.geminiVoice}, the manifest out/${lessonId}/voice-clips.json, and the ASR alignment ${P.asr} + ${P.timingTs} (QA only — matchScore audit; the reconcile does NOT use ASR frames).`,
      `  THEN run the deterministic AUDIO GATE explicitly (it does NOT run inside lesson:voice — you MUST invoke it here, before freeze): (cd ${REPO} && npm run lesson:audio-gate -- --config ${P.pipeline}). It writes out/${lessonId}/audio-gate.json with THREE HARD checks that gate \`pass\`: 🔴 held-vowel DRONE, 🔴 EMPTY/SHORT clip (the TTS silently produced near-silence for a cue that has a phrase — catastrophic on a climax, invisible to drone/dead-air), 🟡 untrimmed dead-air — PLUS one ADVISORY (non-blocking) signal: ⚠ possible TRUNCATION (a NON-empty clip that may stop mid-phrase; detected by per-cue ASR-coverage vs the expected line AND by seconds-per-token far below this lesson's own cohort median). \`pass:false\` means at least one HARD check failed; truncation NEVER sets pass:false (its \`truncationAdvisories\` count + per-cue \`truncation\` block are surfaced for a human spot-check). The structural cure for mid-utterance truncation is the dedicated-TTS model itself; the advisory is a noisy backstop that false-positives on clean longer-sentence / drill cues, so it must not block.`,
      'STEP 2 — VERIFY (do not trust): read gemini-voice.json transcriptText vs the script; walk per-cue matchScore + asrText in the ASR module + the audio-gate report (out/<id>/audio-gate.json, incl. its `truncation` block). A 🔴 DRONE flag means a cue authored an intra-cue pause as in-text dots ("I\'m…… Sam") — Gemini holds the vowel into a ~5s drone. A 🔴 EMPTY/SHORT flag means the TTS silently FAILED to render that cue (e.g. a 1-frame climax clip) — the cue plays SILENT and the lesson reads as "voice out of sync". FIX ANY HARD FLAG: edit that cue\'s text in script-cues.json (a drone → typed gap/sub-beat, never in-text dots; an empty clip → reword the phrase the TTS choked on) and RE-ROLL voice for the affected cue(s) — repeat up to a SMALL N (≈3) re-rolls per cue, re-running the gate each time, until matchScore is acceptable AND audio-gate.json reports pass:true (the three HARD checks). The ⚠ TRUNCATION ADVISORY is NON-BLOCKING and does NOT gate the freeze: the dedicated-TTS model is the STRUCTURAL prevention (it eliminates mid-utterance truncation at the source), and the advisory is a noisy ASR/cohort backstop that false-positives on clean renders (a longer Mandarin sentence ASRs low even when fully spoken; a `target×3` drill cue skews the s/char cohort). REVIEW each advisory clip: if it is GENUINELY cut on a spot-check listen, you MAY re-roll it (same path as above); if it is a full clip, note it and move on — a truncation advisory NEVER blocks the freeze and NEVER forces a re-roll. Apply any ASR risk W2b flagged, or record a reasoned ignore.',
      'STEP 3 — FREEZE: once accepted, the per-cue CLIPS are canonical. The run does NOT advance to reconcile/composer until this audit passes AND audio-gate.json has pass:true (the three HARD checks: 0 drones AND 0 empty/short AND 0 dead-air). Truncation ADVISORIES do NOT block the freeze — they are surfaced (truncationAdvisories count) for a human spot-check, and the dedicated-TTS model is the structural prevention. Freeze as soon as the hard checks pass.',
      contract({ artifacts: [P.clipsTs, P.voiceWav, P.timingTs, `out/${lessonId}/audio-gate.json`], owns: [P.voiceClipsDir, P.clipsTs, P.voiceWav, P.geminiVoice, P.asr, P.timingTs, P.scriptCues], readScope: codeScope, note: 'scriptCues is owned ONLY for ASR-friendliness / anti-drone / anti-empty-clip re-rolls.' }),
      'RETURN accepted=true only when every cue\'s matchScore is acceptable AND audio-gate.json reports pass:true (the three HARD checks: 0 drones AND 0 empty/short AND 0 dead-air); truncation advisories do NOT block accepted (note any flagged cue + your spot-check decision). Include the per-cue cueAudit (id, matchScore, durationFrames, reRolled, truncated).',
    ].join('\n'), { label: 'W3a voice+ASR', phase: 'Voice & Assets', agentType: 'claude', schema: VOICE_RESULT }),
    // --- W3b: primitive gap-scan → build (default REUSE) ---
    () => agent([
      discipline(),
      'W3b — PRIMITIVE GAP-SCAN → BUILD (∥ voice). Name every visual demand the lesson makes; default = COMPOSE EXISTING primitives. A new primitive ships ONLY when a gap is named explicitly. Follow the primitive-builder SKILL literally — it owns the teaching-driven scan, the REUSE-is-membership law, the build + registration protocol, the test-stills aesthetic gate, and the topic-intro-card layout.',
      `SKILLS: ${SK.primitiveBuilder} ; ${SK.visualDiscipline} ; ${SK.kidsEye} ; the capability protocol ${CAP}.`,
      `INPUT: ${REPO}/${P.storyboard} (teaching action(s) per cue — the scan is TEACHING-driven, start from the moves) ; ${TEACH} (each move's \`requires\` capability) ; ${REPO}/${P.visualDesign} ; the AUTHORITATIVE reuse menu ${CATALOG} (the ONLY inventory source for the scan — decide REUSE vs GAP from it alone; do NOT read primitive source during the scan).`,
      `VERIFY: after writing the reuse table, \`(cd ${REPO} && npm run registry:check-lesson -- ${P.primitiveGapScan})\` MUST pass — it diffs every component you named against the generated registry (the oracle that cannot lie). A phantom REUSE fails the node; fix the table (real id, or mark GAP) and re-verify before finishing. When a gap ships a primitive, also confirm \`(cd ${REPO} && npm run registry:check)\` is GREEN.`,
      `OUTPUT ARTIFACTS: ${REPO}/${P.primitiveGapScan} (the reuse/gap table) ; any new primitives under src/shape-primitives/ (exported from index.ts) ; their registry entries in ${REGISTRY_JSON} (regenerated + prose authored, registry:check green) ; test stills under ${REPO}/${P.primitiveChecks}/. LEAN: a 2-column demand→primitive REUSE table citing catalog ids — NEVER paste a catalog useWhen blurb. If zero-gap (the common case), the result line + REUSE list IS the whole artifact. Target ≤ 4k chars.`,
      contract({ artifacts: [P.primitiveGapScan], owns: ['src/shape-primitives/*', 'src/capabilities/primitive-registry.json', 'src/capabilities/catalog-digest.md', 'src/capabilities/catalog-digest.schema.json', 'src/component-gallery/demoProps.tsx', P.primitiveGapScan, P.primitiveChecks], readScope: codeScope, note: 'new prop-driven primitives ONLY (lesson-agnostic, never hardcode this lesson); the registry generated files are written via registry:build, never hand-edited. Primitive aesthetic quality is YOURS, gated at the W3→W4 boundary. The gap-scan table always ships; new primitives only when a gap is named.' }),
    ].join('\n'), { label: 'W3b primitive build', phase: 'Voice & Assets', agentType: 'claude', schema: NODE_RESULT }),
    // --- W3c: sound-asset gap-scan (default REUSE the minted library) ---
    () => agent([
      discipline(),
      'W3c — SOUND-ASSET GAP-SCAN (∥ voice). Confirm the curated shared library covers every key in audio-cues.json. DEFAULT = REUSE — the library is already richly minted (ElevenLabs Eleven Music beds + Text-to-SFX), so this is usually a fast pass.',
      `SKILLS: ${SK.soundDesign} (asset side).`,
      `INPUT: ${REPO}/${P.audioCues} ; the library index ${SOUND_LIB}/_beds|_sfx|_stings/_index.json.`,
      `WORK: for every bed/sting/sfx KEY in audio-cues.json, confirm it resolves to a licensed WAV in the library. If ALL resolve → status ok in seconds. For a genuine GAP (rare): NAME it, add a spec row to the generator manifest (vlog_test/pipeline/sound-assets.manifest.json), mint it author-time with ${SOUND_GEN} (ElevenLabs, owned commercial license + .license.txt), verify the WAV, and FREEZE before W4. Never wire a download into the render path; renders stay offline-deterministic.`,
      `OUTPUT: ${REPO}/${P.logs}/sound-asset.md — every key → resolved file (or the gap + how it was minted).`,
      contract({ artifacts: [`${P.logs}/sound-asset.md`], readScope: [...contentScope, SOUND_LIB, '/Users/tk/Desktop/vlog_test/pipeline'], note: 'the library + generator are shared; only this lesson\'s key→file resolution is reported. SOUND_LIB (index) + the vlog_test sound-pipeline (generator + manifest) are the only off-repo roots it reads.' }),
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
  'W3.5 — CUE-TIMELINE RECONCILE (mechanical, v4 cue-anchored). Set the ONE window per cue and embed it as the single shared timeline. This is the only place cue durations are decided — and it is now a TRIVIAL, deterministic chain (no ASR-boundary correction, no detected-silence snapping).',
  `INPUT: per-cue visualMotionSeconds from ${REPO}/${P.visualDesign} ; the per-cue CLIP MODULE ${REPO}/${P.clipsTs} (each ClipCue carries clipSrc + EXACT narrationFrames + any typed gap — this is the audio truth; do NOT read ASR frames).`,
  'COMPUTE (use the kit @studio/narration-kit reconcileClipTimeline): for each cue, cueFrames = max(narrationFrames + gapFrames, round(visualMotionSeconds*fps)) + tailFrames (tail ≤ 9 frames / 0.3s). Chain cues end-to-end. The clip plays at the cue START for narrationFrames; the rest of the window is FREE silence (a motion hold and/or a typed gap). No ASR_CORRECTIONS, no Silences import.',
  `EMBED the reconciled output into ${REPO}/${P.timeline}: import ${camel}Clips, call reconcileClipTimeline(visualBudgets), and export the ${camel}Cues array AND the ${camel}VoiceClips array (the AudioLayer mounts one Sequence per clip). Audio, visuals and captions all read THIS. Do NOT create PADDED_CUE_DURATIONS_FRAMES, a continuous-WAV span, or any padding table. The brief **Length** is a HINT only — the true length is sum(cueFrames); accept drift.`,
  'INTENTIONAL SILENCE IS A TYPED TIMELINE HOLD. A `gap` (learner-response wait-time, animation-hold, …) authored by W2b on a cue is carried on its ClipCue; reconcileClipTimeline adds gapFrames to that cue\'s window as FREE silence (nothing schedules audio across it — the clip plays at the start, then the picture holds). It is NOT baked into any WAV and there is NO detect-silences step. The composer fills a learner-response hold with a "your turn" affordance. (docs/pipeline-architecture.md §10 + the v4 changelog.)',
  `COMPREHENSION-FLOOR ADVISORY (advisory, NEVER blocking — like lesson:check): if ${REPO}/${P.storyboard} declares an \`exposures\` ledger and the lesson has acquisition targets, compare per-target counts against the lesson-pedagogy §8 floor (≥6–10 spaced exposures; ≥3–5s wait-time per echo) and the reconciled per-cue durations. If a target lands UNDER its floor, record a WARN in this node's \`issues\` + \`pipelineFindings\` (e.g. "acquisition target 'I'm' has 4 exposures < §8 floor"). Report the emergent total length as-is — never score it against a number. If the ledger is absent, print \`SKIP: no exposures ledger\` — do not silently pass.`,
  skipSmoke ? 'ANIMATIC GATE: skipped (args.skipSmoke).' : `ANIMATIC GATE (pre-W4): (cd ${REPO} && npm run lesson:animatic -- --config ${P.pipeline}) — render the cue-boundary animatic strip + waveform; confirm each cue's clip sits inside its window before composing.`,
  `OUTPUT: ${REPO}/${P.timeline} carries the ${camel}Cues + ${camel}VoiceClips arrays.`,
  contract({ artifacts: [P.timeline], readScope: codeScope, lint: true }),
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
      // READ-SCOPE = codeScope (rendered by contract({readScope}) below; OS-enforced under --sandbox, inert otherwise):
      // the composer's WHOLE legitimate read surface — all of src/ + public/ + scripts/ + the lint/render configs (its
      // self-check `lesson:check --measured` BUNDLES the project, and the auto-discovery registry imports EVERY lesson's
      // wrapper, so sibling scene source is unavoidably in the bundle graph) + THIS lesson's lesson-data/out + .agents.
      // BLOCKED: every OTHER lesson's lesson-data/<other> + out/<other> (the hidden-hard-coding surface) and the entire
      // external filesystem (the `find /` / shared-sound spelunk). The motive to read a sibling SCENE is removed in the SKILL.
      `PREFLIGHT (before composing): run \`(cd ${REPO} && npm run registry:check-lesson -- ${P.primitiveGapScan})\`. Every component the gap-scan marks REUSE MUST be a real registry id. If it flags a name, that component DOES NOT EXIST — it is a GAP, NOT a reuse. Do NOT grep/find the repo or read any OTHER lesson trying to locate it (it is not there — that hunt is the exact failure this gate prevents): either reach for the real registry primitive the beat needs, or hand-roll the mechanic inline from registered primitives, and record the phantom in \`issues\`. NEVER mount a component that isn't registered. (The gate runs on the gap-scan, not your scene: your scene legitimately defines its OWN non-registry components — the scene component, local layout helpers — and a phantom IMPORT there is caught by tsc/lint instead.)`,
      'EMIT (consume existing primitives + generated timing — do not author one-off SVG art):',
      `  - ${REPO}/${P.complete} (the Complete wrapper) + ${REPO}/${P.scene} (scene) + src/lessons/${camel}/layout.ts (offset constants) + src/lessons/${camel}/manifest.ts (bboxAt per load-bearing element; contract src/lessons/manifestTypes.ts).`,
      `  - AUDIO WIRING: <LessonAudioLayer voiceClips={${camel}VoiceClips}> (v4 per-cue voice — the kit mounts one Sequence per clip; pass the ${camel}VoiceClips array straight from the timeline, NEVER a single teacherAudioSrc/continuous WAV), <LessonBgmLayer> (bed — MECHANICAL envelope; derive the duck windows from the voiceClip spans via spansToWindows), <LessonSfxLayer> with SFX fired at YOUR OWN motion frames from audio-cues.json (bed = mechanical; SFX frames = composer-owned, derived from cueFrames + layout.ts offsets, NEVER literals), and the caption layer.`,
      `SELF-CHECK before declaring done: (cd ${REPO} && npm run lesson:check -- --config ${P.pipeline} --measured) — review summary.collisionCount (linear) AND summary.measuredCollisionCount + summary.gatesFailed (real-pixel + LUFS/caption/contrast/legibility/motion gates). Any non-zero collision or failed gate requires a fix or an explicit written justification. Then rerun the pedagogy discovery audit against the rendered still.`,
      `REGISTER BY DESCRIPTOR (never hand-edit a shared file): in ${REPO}/${P.complete}, export the uniform descriptor \`export const lessonComposition: LessonComposition = { id: "Complete${Pascal}Lesson", component: Complete${Pascal}Lesson, durationInFrames: ${camel}Duration, defaultProps: complete${Pascal}LessonDefaultProps }\` (type from src/lessons/lessonRegistryTypes.ts; duration from the reconciled timeline module — NEVER a literal). The lesson registry (npm run lessons:registry, auto-run by lesson:render) discovers it into src/lessons/_lessonRegistry.generated.tsx and Root.tsx maps over it. DO NOT edit src/Root.tsx or src/Composition.tsx — under worktree-isolated parallel runs those shared lists are the merge-conflict surface; your lesson must write ONLY its own disjoint files so the merge-back is a conflict-free union.`,
      contract({ artifacts: [P.complete, P.scene, `src/lessons/${camel}/layout.ts`, `src/lessons/${camel}/manifest.ts`], owns: [P.complete, P.scene, `src/lessons/${camel}/*`], readScope: codeScope, lint: true, note: 'register ONLY by exporting lessonComposition from your Complete wrapper — NEVER hand-edit src/Root.tsx or src/Composition.tsx (the registry auto-discovers it). Reuse primitives + kit layers, never hardcode timings (lesson-agnostic). The scene component MUST be PascalCase `' + Pascal + 'LessonScene` (a lowercase name fails react-hooks/rules-of-hooks).' }),
    ].join('\n'), { label: 'W4a composer', phase: 'Compose', agentType: 'claude', schema: NODE_RESULT }),
    () => agent([
      discipline(),
      'W4b — SKETCH OVERLAY (∥ composer). Specify the hand-drawn teacher-mark overlays in CUE-RELATIVE frames (never master-timeline absolutes). Restraint is the rule — marks point at the load-bearing moment, nothing decorative.',
      `SKILLS: ${SK.sketch}`,
      `INPUT: the reconciled ${camel}Cues in ${REPO}/${P.timeline} ; ${REPO}/${P.visualDesign} ; ${REPO}/${P.pedagogy} (mark the discovery).`,
      `OUTPUT: ${REPO}/${P.sketchOverlay} — per-mark spec in cue-relative frames (use <TeacherMark> + boil from ${CAP}).`,
      contract({ artifacts: [P.sketchOverlay], readScope: contentScope }),
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
  `OUTPUT: ${REPO}/${P.mp4} ; ${REPO}/${P.contact} (+ contact json) ; ${REPO}/${P.bbox}. Report ffprobe WxH/fps/frames/duration + measured loudness.`,
  contract({ artifacts: [P.mp4, P.contact, P.bbox], owns: [out], readScope: codeScope, note: 'everything generated lands under out/<id>/.' }),
].join('\n'), { label: 'W5 render', phase: 'Render', agentType: 'claude', schema: NODE_RESULT }) : (log(`W5 ${skip('render')}`), null)

// ===========================================================================
phase('Verify')

const rVerify = run('verify') ? await agent([
  discipline(),
  'W6 — VERIFICATION. Review the rendered output against the pedagogy discoveries. The PRIMARY surface is the action-aware contact sheet (5 samples per cue: start / narr-mid / narr-end / hold-mid / cue-end) — stagnation is visible at a glance. You CANNOT watch the mp4; judge from the contact sheet + frames.',
  `SKILLS: ${SK.verification}`,
  `INPUT: the contact sheet ${REPO}/${P.contact} (Read as image) ; ${REPO}/${P.mp4} (ffprobe only) ; ${REPO}/${P.bbox} (linear + measured collisions, gates) ; ${REPO}/${P.primitiveChecks}/*.png ; ${REPO}/${P.pedagogy}.`,
  'JUDGE: (1) does each cue TEACH its pedagogy discovery (re-run the §1 audit)? (2) layout/legibility — any collision or failed gate from bbox-manifest unaddressed? (3) SOUND checks: melody NOT identifiable under narration ; 3-point duck (intro duck / mid-gap rise / outro resolve) ; measured master ≈ -16 LUFS / TP ≤ -1 dB (the LUFS gate in lesson:check --measured) ; no SFX louder than narration.',
  `OUTPUT: ${REPO}/${P.verification} — per-cue pedagogy verdict + the sound/layout gate results + a punch list of any fixes (mapped to the owning wave for a targeted re-run).`,
  contract({ artifacts: [P.verification], readScope: contentScope }),
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
