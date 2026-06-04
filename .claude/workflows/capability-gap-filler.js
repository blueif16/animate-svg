export const meta = {
  name: 'capability-gap-filler',
  description: 'Curriculum-driven capability factory — read the curriculum content, detect which visual capabilities the lessons will need but the registry lacks, and have ONE subagent per gap AUTHOR the missing capability across three parallel layers (SVG assets, primitives, special components), each reusable + prop-driven + frame-disciplined + wired into the drift-gated registry. Proactive and library-WIDE (vs the lesson-build W3b node, which is reactive/per-lesson). Phases: Scope (index curriculum → sections) → Demand (one subagent per section: KP content+difficulties → visual demands) → Gap (barrier: dedup demands, diff vs catalog-digest → classified gap set, REUSE is the default) → Build (one subagent per gap; serial because barrel+registry:build+icons:build write shared files and parallel builds race) → Verify (registry:check + completeness critic). args.dryRun stops after Gap with the report, building nothing. Methodology contract: .agents/skills/capability-gap-filler/SKILL.md. THE LAWS: a capability is lesson-AGNOSTIC + prop-driven (never bakes a topic/value/Chinese string); every build is wired into the registry (export → registry:build → prose → registry:check GREEN) or the pre-commit gate rejects it; ZERO frame/motion literals in component code (public API takes atFrame/startFrame/progress + offsets); REUSE > compose > build-primitive > build-special-component > make-asset, stop at the first hit. DRAFT — validate with dryRun before a building run.',
  phases: [
    { title: 'Scope', detail: 'index the curriculum JSON → the sections in scope (subject/grade/section filter)' },
    { title: 'Demand', detail: 'one subagent per section: KP content + common_difficulties → the concrete visual demands, each tagged asset|primitive|special-component' },
    { title: 'Gap', detail: 'barrier: dedup demands across sections + diff vs src/capabilities/catalog-digest.md → classified gap set (REUSE vs build), the default is REUSE' },
    { title: 'Build', detail: 'one subagent per gap (serial — shared barrel/registry/icons): author a reusable registered capability + verify its own test stills' },
    { title: 'Verify', detail: 'registry:check GREEN + a completeness critic: what curriculum demand is still uncovered (the next run\'s input)' },
  ],
}

// ---------------------------------------------------------------------------
// Parameters (args):
//   curriculumFile — path to ONE curriculum JSON. Default math G1 vol1.
//                    Snapshot dir: /Users/tk/Desktop/Omniscience/curriculum_snapshot/
//                      math_renjiao_grade1_vol1.json | chinese_tongbian_grade1_vol1.json
//                      | english_renjiao_grade3_vol1.json
//   sections       — array of section codes to cover (e.g. ["1.1","1.2"]). Default: first maxSections.
//   maxSections    — cap when `sections` is unset. Default 4.
//   layers         — which layers to BUILD: subset of ["asset","primitive","special-component"]. Default all.
//   maxBuild       — cap on capabilities built in one run (safety). Default 6.
//   dryRun         — stop after Gap with the report; build nothing. Default false.
// Only the SHARED LIBRARY changes (assets/primitives/special-components + their registry
// entries). No lesson is authored here — this fills the toolbox the lessons draw from.
// ---------------------------------------------------------------------------
const ROOT = '/Users/tk/Desktop/animation-test'
const REPO = `${ROOT}/remotion-svg-primitives`
const OMNI = '/Users/tk/Desktop/Omniscience'

const A = (typeof args === 'object' && args) ? args : {}
const curriculumFile = A.curriculumFile || `${OMNI}/curriculum_snapshot/math_renjiao_grade1_vol1.json`
const sectionFilter = Array.isArray(A.sections) ? A.sections : null
const maxSections = Number.isFinite(A.maxSections) ? A.maxSections : 4
const layers = Array.isArray(A.layers) ? A.layers : ['asset', 'primitive', 'special-component']
const maxBuild = Number.isFinite(A.maxBuild) ? A.maxBuild : 6
const dryRun = A.dryRun === true

const SK = {
  gapFiller: `${ROOT}/.agents/skills/capability-gap-filler/SKILL.md`,
  visualDiscipline: `${ROOT}/.agents/skills/visual-discipline/SKILL.md`,
  kidsEye: `${ROOT}/.agents/skills/kids-eye/SKILL.md`,
  taste: `${ROOT}/.agents/skills/early-childhood-visual-taste/SKILL.md`,
}
const CAP = `${ROOT}/.agents/CAPABILITIES.md`                          // craft-technique prose + reach guides
const CATALOG = `${REPO}/src/capabilities/catalog-digest.md`          // GENERATED reuse menu (primitives + motion + fx + 70+ asset names)
const REGISTRY_JSON = `${REPO}/src/capabilities/primitive-registry.json`
const LAW = 'LESSON-AGNOSTIC LAW: every capability is prop-driven and reusable — NEVER bake a lesson topic, a specific value, or a Chinese string into it; everything varies by prop. ZERO frame literals + ZERO raw motion literals in component code (the public API takes atFrame/startFrame/progress + caller offsets; curves are EASE.*/SPRING.*). If a thing only fits ONE lesson it is scene composition, not a capability — do not build it.'

// --- structured schemas -----------------------------------------------------
const SCOPE_RESULT = {
  type: 'object', additionalProperties: false,
  properties: {
    subject: { type: 'string' }, grade: { type: 'string' }, volume: { type: 'string' },
    sections: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          sectionCode: { type: 'string' }, title: { type: 'string' },
          kpTitles: { type: 'array', items: { type: 'string' } },
        },
        required: ['sectionCode', 'title', 'kpTitles'],
      },
    },
  },
  required: ['sections'],
}
const DEMAND_LIST = {
  type: 'object', additionalProperties: false,
  properties: {
    sectionCode: { type: 'string' },
    demands: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          demand: { type: 'string' },
          kp: { type: 'string' },
          importance: { type: 'string' },
          difficulty: { type: 'string' },
          layerHint: { type: 'string', enum: ['asset', 'primitive', 'special-component', 'unknown'] },
        },
        required: ['demand', 'kp', 'layerHint'],
      },
    },
  },
  required: ['sectionCode', 'demands'],
}
const GAP_REPORT = {
  type: 'object', additionalProperties: false,
  properties: {
    reused: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: { demand: { type: 'string' }, reuseId: { type: 'string' } },
        required: ['demand', 'reuseId'],
      },
    },
    gaps: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          demand: { type: 'string' },
          from: { type: 'string' },
          decision: { type: 'string', enum: ['build-primitive', 'build-special-component', 'make-asset', 'compose'] },
          layer: { type: 'string', enum: ['asset', 'primitive', 'special-component', 'none'] },
          name: { type: 'string' },
          spec: { type: 'string' },
        },
        required: ['demand', 'decision', 'layer', 'name', 'spec'],
      },
    },
    notes: { type: 'string' },
  },
  required: ['reused', 'gaps'],
}
const BUILD_RESULT = {
  type: 'object', additionalProperties: false,
  properties: {
    name: { type: 'string' },
    layer: { type: 'string' },
    status: { type: 'string', enum: ['built', 'skipped', 'failed'] },
    files: { type: 'array', items: { type: 'string' } },
    registryGreen: { type: 'boolean' },
    testStills: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
    issues: { type: 'array', items: { type: 'string' } },
  },
  required: ['name', 'layer', 'status', 'registryGreen', 'summary'],
}
const VERIFY_RESULT = {
  type: 'object', additionalProperties: false,
  properties: {
    registryCheck: { type: 'string', enum: ['green', 'failed', 'skipped'] },
    uncoveredDemands: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
  },
  required: ['registryCheck', 'summary'],
}

// ===========================================================================
// Scope — index the curriculum JSON into the sections in scope.
// ===========================================================================
phase('Scope')
const filterClause = sectionFilter
  ? `ONLY these section codes: ${sectionFilter.join(', ')}.`
  : `the FIRST ${maxSections} sections (by sort_order).`
const scope = await agent([
  'You are indexing a Chinese K-12 curriculum snapshot so a capability factory knows what content to scan.',
  `INPUT: the curriculum JSON at ${curriculumFile}. Read it (it is ~90KB; use \`python3 -c\` or jq to extract — do NOT paste the whole file).`,
  `TASK: return book subject/grade/volume and the sections in scope — ${filterClause}`,
  'For each section return { sectionCode (e.g. "1.1"), title (e.g. "1~5的认识"), kpTitles: the titles of its context.knowledge_points }.',
  'OUTPUT: the structured object only. OWNED PATHS: none (read-only).',
].join('\n'), { agentType: 'claude', schema: SCOPE_RESULT, phase: 'Scope', label: 'curriculum-index' })

const sections = (scope && scope.sections) || []
log(`Scope: ${scope?.subject || '?'} ${scope?.grade || ''} ${scope?.volume || ''} — ${sections.length} section(s): ${sections.map((s) => s.sectionCode).join(', ')}`)
if (!sections.length) return { error: 'no sections in scope', curriculumFile }

// ===========================================================================
// Demand — one subagent per section extracts the concrete VISUAL demands.
// Barrier (parallel): Gap needs ALL demands together to dedup.
// ===========================================================================
phase('Demand')
const demandSets = (await parallel(sections.map((s) => () => agent([
  'You extract the VISUAL DEMANDS a lesson must show to teach one curriculum section — what must appear on screen, NOT how to animate it.',
  `READ FIRST (skill): ${SK.gapFiller} (§"Reading the curriculum" + the three layers). Craft lenses: ${SK.kidsEye}, ${SK.visualDiscipline}.`,
  `INPUT: section ${s.sectionCode} "${s.title}" in ${curriculumFile}. Extract that section with \`python3 -c\`/jq and read each context.knowledge_points[].content AND the matching context.common_difficulties (the misconceptions).`,
  'TASK: list the concrete visual demands. The KP content names what to SHOW (objects to count, a numeral to write, a comparison, a part-whole); the difficulty names what the visual must make UNMISTAKABLE. Tie EVERY demand to its kp + importance + (difficulty if any).',
  'Tag each demand with a layerHint: "asset" (a fixed-form object — animal/prop/food, no count/progress/state), "primitive" (a NEW teaching atom that counts/progresses/preserves identity), "special-component" (a recurring COMBINATION of pieces + a self-contained animation), or "unknown".',
  'Be concrete and MINIMAL — one demand per distinct visual need; do not invent decoration. Do NOT decide reuse-vs-build here (that is the Gap node); just name the demand + layerHint.',
  'OUTPUT: { sectionCode, demands[] } structured. OWNED PATHS: none (read-only).',
].join('\n'), { agentType: 'claude', schema: DEMAND_LIST, phase: 'Demand', label: `demand:${s.sectionCode}` })))).filter(Boolean)

const allDemands = demandSets.flatMap((d) => (d.demands || []).map((x) => ({ ...x, sectionCode: d.sectionCode })))
log(`Demand: ${allDemands.length} visual demand(s) across ${demandSets.length} section(s)`)

// ===========================================================================
// Gap — single barrier agent: dedup demands + diff vs the catalog → gap set.
// REUSE is the default; a gap is real only when nothing in the catalog covers it.
// ===========================================================================
phase('Gap')
const gapReport = await agent([
  'You convert a list of visual demands into a REUSE-vs-BUILD plan against the existing capability library. REUSE is the default; over-building is the failure mode.',
  `READ FIRST: the authoritative reuse menu ${CATALOG} (every primitive + variants + useWhen, the motion + fx components, AND the 70+ <IconAsset> asset names by category). Also ${CAP} (techniques) and the decision rule + gap record schema in ${SK.gapFiller}.`,
  `INPUT (the demands, JSON):\n${JSON.stringify(allDemands)}`,
  'TASK: (1) DEDUP demands across sections (the same visual asked by multiple KPs = ONE entry). (2) For each, walk the decision rule and STOP at the first hit: REUSE (name the exact catalog id) → COMPOSE (existing pieces, no new capability) → build-primitive → build-special-component → make-asset. (3) Emit `reused[]` (demand + the catalog reuseId) and `gaps[]` (only the genuine BUILD/compose residue), each gap with decision, layer, a kebab `name`, and a `spec` = the prop-driven API (props that VARY — no baked topic), the pieces it composes, the self-contained animation (for primitives/special-components), and the single hardest test frame + worst-case multiplicity to render.',
  LAW,
  'OUTPUT: { reused[], gaps[], notes } structured. OWNED PATHS: none (read-only — this node decides, it does not build).',
].join('\n'), { agentType: 'claude', schema: GAP_REPORT, phase: 'Gap', label: 'gap-diff' })

const reused = (gapReport && gapReport.reused) || []
const gaps = (gapReport && gapReport.gaps) || []
log(`Gap: ${reused.length} REUSE, ${gaps.length} gap(s) — ${gaps.map((g) => `${g.name}[${g.layer}]`).join(', ') || 'none'}`)

if (dryRun) {
  log('dryRun — stopping after Gap. No capabilities built.')
  return { mode: 'dryRun', subject: scope?.subject, sections: sections.map((s) => s.sectionCode), demandCount: allDemands.length, reused, gaps, notes: gapReport?.notes }
}

// ===========================================================================
// Build — one subagent per gap. SERIAL: the shape/motion barrels, registry:build
// and icons:build all write SHARED files; parallel builds race + corrupt the gate.
// ===========================================================================
phase('Build')
const buildable = gaps
  .filter((g) => g.decision !== 'compose')
  .filter((g) => layers.includes(g.layer))
  .slice(0, maxBuild)
if (gaps.length > buildable.length) {
  log(`Build: ${buildable.length}/${gaps.length} gap(s) in scope (layers=${layers.join('/')}, maxBuild=${maxBuild}) — the rest are this run's residual backlog.`)
}

const buildResults = []
for (const g of buildable) {
  const r = await agent([
    `You AUTHOR one reusable capability to fill a named curriculum gap: "${g.name}" (layer: ${g.layer}, decision: ${g.decision}).`,
    `DEMAND: ${g.demand}\nFROM: ${g.from || ''}\nSPEC: ${g.spec}`,
    `READ FIRST: ${SK.gapFiller} (§"Authoring + registration (per layer)" — follow the registry loop EXACTLY) + the craft skills ${SK.taste}, ${SK.visualDiscipline}, ${SK.kidsEye}. The reuse menu is ${CATALOG}; compose existing pieces, do not reinvent.`,
    'BUILD per the layer:',
    `• primitive → implement prop-driven in the right FAMILY file under ${REPO}/src/shape-primitives/ (counting|literacy|interaction|sketch.tsx — a standalone file is a stranded export that FAILS registry:check); export from src/shape-primitives/index.ts.`,
    `• special-component → implement in ${REPO}/src/special-components/<Name>.tsx (create the dir + an index.ts barrel if absent), composing registered primitives/assets/fx + named EASE.*/SPRING.* motion; export from that barrel. If the registry has no specialComponents tier yet, register it through the motion-primitives barrel instead (the AssetMorph precedent) — state which you did.`,
    `• make-asset → first try \`node ${REPO}/scripts/import-origin-icons.mjs\` (origin library) ; else generate author-time via the trace pipeline ; land <name>.svg + mono/<name>.svg + <name>.meta.json under ${REPO}/public/icons and run \`npm run icons:build\`.`,
    `THEN WIRE INTO THE REGISTRY (drift-gated — unregistered = uncommittable): (a) export from the barrel; (b) \`(cd ${REPO} && npm run registry:build)\`; (c) author prose (intent/useWhen/avoidWhen/variants, flip status off "undocumented") in ${REGISTRY_JSON}, re-run registry:build; (d) \`(cd ${REPO} && npm run registry:check)\` must be GREEN. (Assets need only \`npm run icons:build\`; registry:check now gates the asset-catalog too.)`,
    'THEN VERIFY YOURSELF (you own aesthetic quality): render a test still at REAL render size for the single hardest frame AND the worst-case multiplicity; a flat/ambiguous result is YOUR bug to fix now. Run `npm run lint` clean.',
    LAW,
    `OUTPUT: structured { name, layer, status, files[], registryGreen, testStills[], summary, issues[] }. OWNED PATHS: the component file(s) + its barrel, ${REGISTRY_JSON} (+ generated catalog-digest/schema via registry:build — never hand-edit the generated structure), public/icons/* (assets), out/* (test stills). Do NOT touch any lesson scene.`,
  ].join('\n'), { agentType: 'claude', schema: BUILD_RESULT, phase: 'Build', label: `build:${g.name}` })
  if (r) buildResults.push(r)
}
const built = buildResults.filter((r) => r.status === 'built')
log(`Build: ${built.length}/${buildable.length} built — ${built.map((r) => r.name).join(', ') || 'none'}`)

// ===========================================================================
// Verify — registry gate + completeness critic.
// ===========================================================================
phase('Verify')
const verify = await agent([
  'You are the gate + completeness critic for a capability-building run.',
  `TASK: (1) run \`(cd ${REPO} && npm run registry:check)\` and \`(cd ${REPO} && npm run lint)\`; report registryCheck = green|failed (paste the failing lines if red). (2) Completeness: given the demands that were meant to be covered and what was built/reused, list the curriculum demands STILL uncovered (the next run's input).`,
  `CONTEXT — reused: ${JSON.stringify(reused.map((r) => r.reuseId))} ; built: ${JSON.stringify(built.map((b) => b.name))} ; residual gaps not built this run: ${JSON.stringify(gaps.map((g) => g.name).filter((n) => !built.find((b) => b.name === n)))}.`,
  'OUTPUT: structured { registryCheck, uncoveredDemands[], summary }. OWNED PATHS: none (read-only — it verifies, it does not fix; a red gate is a finding for the next build).',
].join('\n'), { agentType: 'claude', schema: VERIFY_RESULT, phase: 'Verify', label: 'verify+critic' })

return {
  subject: scope?.subject,
  sections: sections.map((s) => s.sectionCode),
  demandCount: allDemands.length,
  reusedCount: reused.length,
  built: built.map((b) => ({ name: b.name, layer: b.layer, files: b.files })),
  failed: buildResults.filter((r) => r.status !== 'built').map((r) => ({ name: r.name, status: r.status, issues: r.issues })),
  residualGaps: gaps.map((g) => g.name).filter((n) => !built.find((b) => b.name === n)),
  registryCheck: verify?.registryCheck,
  uncoveredDemands: verify?.uncoveredDemands || [],
}
