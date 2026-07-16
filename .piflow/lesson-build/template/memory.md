# lesson-build — system memory
<!-- SYSTEM · Leg A · the RECONCILE summary. OPTIMIZER-FACING — ONLY the reconcile node edits this
     (disjoint write authority; per-node fixers never touch it). NEVER injected into any node's prompt.
     Capped (~40 lines, top-loaded). Maintenance contract = the memory-slices skill (MODE B). -->

_status: 3 lessons, bucket ARCH/COORDINATION (fix-surface spans nodes or lives outside any one node's
owns) — seeded 2026-07-09 consolidating the concurrent per-node memory.md hardening pass._

## Known failure modes (cross-node)

### npm run EPERMs under --sandbox local (uv_cwd — project subtree ungranted)
sig: system::sandbox-npm-run-eperm
recurrence: 2 confirmed (w3b-primitive-build: `mig-e2e-1`, `e10e11-accept-1`) + corroborating friction in
w3a-voice-asr (`npm run lesson:voice`/`lesson:audio-gate` needed `execCwd`/`execReads`) and setup-scaffold
(`sandbox-write-permission-friction`, `kp3-tens-and-ones-place-r1`/`-r3`)
[[lesson-pipeline-scaffold]] (closest slice — the seatbelt/sandbox layer itself has no OKF-mapped code slice)
**Root (corrected 2026-07-09, live-probed in the SDK):** the seatbelt read-jail grants only declared roots;
when the node's project dir isn't one of them, npm's `process.cwd()` fails FIRST (`EPERM: uv_cwd`) before any
node_modules read. Enumerating leaf entries (node_modules, .env.local) in readScope does NOT fix it — the cwd
dir entry itself is ungranted. The earlier "node_modules read-EPERM" framing was imprecise, and the
direct-`node scripts/x.mjs` workaround only masked the symptom (measure/op[] `run` cmds are additionally
UNSANDBOXED today — raw spawnSync — so they never hit the jail at all).
**Prevention (USER LAW — npm run is the system contract, never route around it):** declare
`contract.execCwd: "{{WORKSPACE}}/remotion-svg-primitives"` on any node whose in-prompt bash runs npm scripts
(E10 mechanism; recursive read grant on the tree + getcwd, covers node_modules AND `.env.local`). w3a is the
reference; applied to w3b + w6 2026-07-09. Add `execReads` only for imports OUTSIDE the tree (w3a's ASR venv).

### image-blind review — a text-only judge cannot see a PNG
sig: system::image-blind-review
recurrence: 3 (w6-verification: 2 confirmed + 1 human-caught `W6-GREEN`/video-bad divergence,
`kptest-fenyuhe-six`) — touches every visual-artifact surface: w5-render's contact sheet, w3b-primitive-build's
aesthetic stills, w4a-composer's boxed bbox stills.
(no okf-slice — prose/infra: the judging model's own capability ceiling, not a code path)
**Root:** any criterion whose PASS requires visual inspection is unfalsifiable to this substrate — the model
can't decode PNGs, so it substitutes structural/numeric proxies that can read clean while the real visual
experience is unverified.
**Prevention:** route any such criterion to a VISION-capable judge tier (functionality/model-routing, not a
prompt edit). Until routed, the affected criteria.md files must scope confidence to what a proxy can prove and
surface the capability wall in `pipelineFindings`, never silently work around it.

### captionRedundancy/contrast gate false-positive family
sig: system::gate-def-false-positive-family
recurrence: 4 (grep-confirmed across `kptest-fenyuhe-six`, `kptest-greetings-verify`,
`kptest-compare-more-fewer`, `kp1-hello-greetings` verification logs — w6-verification's own lesson)
[[render-pipeline]]
**Root:** two gates in the SHARED `remotion-svg-primitives/scripts/lesson-measured.mjs` are miscalibrated: (1)
`captionRedundancy` flags jaccard≈1.0 even when on-screen-text-as-subset-of-speech is the DESIGN INTENT
(read-along/L2 lessons); (2) `contrast` samples a single frame that can be a worst-case entrance-fade moment,
not the held-state value a child reads. Every real run hand-waives both.
**Prevention:** fix at the source in `lesson-measured.mjs` (held-state re-sampling for contrast; a
`captionMode:"verbatim"` carve-out for redundancy) — this is upstream/system work, the script is not any one
node's `owns`. Until fixed, waivers must cite THIS lesson's specific evidence, never a blanket exemption.

## Cross-node decisions
<!-- standing decisions that span nodes: shared interfaces/contracts, how the stack runs. -->

## Architecture changes
<!-- L2 COMPOSE: nodes added / rewired and WHY. -->

## Open threads (DAG-level)
- Route w6-verification (and any visual-judging node) to a vision-capable tier — closes image-blind-review by
  capability, not disclosure.
- Fix `lesson-measured.mjs`'s `captionRedundancy`/`contrast` gate definitions at the source.
- op[] `run`/measure cmds execute UNSANDBOXED in the SDK today (raw spawnSync, `merge.ts:212`); if the SDK ever
  routes them through the jail, w5-render + every measure op will need `execCwd` declared too — latent, watch it.

## History
git log --grep '^skillsys('
