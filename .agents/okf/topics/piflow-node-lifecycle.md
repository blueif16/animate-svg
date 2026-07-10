---
type: subsystem
key: piflow-node-lifecycle
title: piflow template workflow (the node.json contract — deps/tools/contract/checks/optimize.measure)
description: The piflow-native execution path for lesson-build — meta.json + workflow.json declare the 9-phase/14-node DAG (the same conceptual pipeline pi-runner-orchestration-engine also runs), and each nodes/<id>/node.json declares one node's full lifecycle contract (deps, allowed tools, inject/readScope/owns, post-run checks, and the optimize.measure ops that feed the per-node optimization runway).
resource: .piflow/lesson-build/template/workflow.json
aliases: [workflow.json, node.json, piflow template, lesson-build template, optimize.measure, w6-verification]
seeds: [.piflow/lesson-build/template/meta.json, .piflow/lesson-build/template/workflow.json, .piflow/lesson-build/template/nodes/w6-verification/node.json, .piflow/lesson-build/template/memory.md]
symbols: [stages, nodes, deps, contract, checks, optimize]
tags: [piflow, workflow, node-lifecycle, template, w6-verification]
timestamp: 2026-07-09
---

# Why / how it works (the lifecycle, end to end)
`meta.json` declares the workflow's identity (`id: "lesson-build"`) and its 9 `phases`
(setup→pedagogy→storyboard→design→assets→reconcile→compose→render→verify) — the SAME wave order and law-prose
(cue-is-the-coordination-unit, frozen-narration-after-W3a, zero-frame-literals) that
[[pi-runner-orchestration-engine]]'s `.claude/workflows/lesson-build.js` declares (`meta.description` in both
files is byte-identical — this is a separately-authored second execution path for the same conceptual
pipeline, not a generated copy). `workflow.json`'s `stages` array is the realized DAG: an array of arrays, each
inner array one parallel lane (e.g. `["w2b-audio-captions", "w2c-sound-design"]`), and `nodes` maps every node
id to its file location. Each `nodes/<id>/node.json` is that node's COMPLETE lifecycle contract — `deps` (which
upstream nodes gate it), `tools.allow`/`deny` (the node's tool surface), `inject` (files force-read into the
prompt), `contract.{artifacts,owns,readScope,returnMode}` (declared outputs + the filesystem scope it may
read/write), `checks.post` (a gate that must pass — e.g. `non-empty` on `verification.md` — before the node is
considered done), `policy.fail` (`block` halts the run), `return` (the node's required JSON return shape), and
`optimize.measure` — an array of ops the OUT-OF-BAND optimizer runs post-run (not during the node's own
execution) to score the node's output against a substrate report (e.g. `w6-verification`'s `bbox-overlay-
produced` measure checks the bbox-overlay PNG's mtime is at/after the node's own run start, so a stale upstream
leftover can't false-pass the check). `memory.md` is the SYSTEM-level standing-lessons file
[[memory-slices]] itself reads/writes — this card treats it as a seed (its existence/freshness matters to this
subsystem) without duplicating memory-slices' own procedure for it.

# Anchors
IDENTITY + PHASES
- `.piflow/lesson-build/template/meta.json:2` — `"lesson-build"` — the workflow's `id` value
- `.piflow/lesson-build/template/meta.json:5` — `phases` — the 9-phase wave order, prose-identical to [[pi-runner-orchestration-engine]]'s `lesson-build.js` meta
DAG
- `.piflow/lesson-build/template/workflow.json:7` — `stages` — array of parallel lanes, the realized 14-node DAG
- `.piflow/lesson-build/template/workflow.json:43` — `nodes` — node id → file location map
NODE CONTRACT (w6-verification as the representative instance)
- `.piflow/lesson-build/template/nodes/w6-verification/node.json:4` — `deps` — `["w5-render"]`, this node's upstream gate
- `.piflow/lesson-build/template/nodes/w6-verification/node.json:23` — `contract` — artifacts/owns/readScope/returnMode, the node's declared filesystem contract
- `.piflow/lesson-build/template/nodes/w6-verification/node.json:38` — `checks` — the post-run gate (`non-empty` on `verification.md`)
- `.piflow/lesson-build/template/nodes/w6-verification/node.json:62` — `optimize.measure` — the out-of-band optimizer's scoring ops (e.g. `bbox-overlay-produced`, `cue-coverage`, `gate-citations`)

# Freshness (anti-drift)
anchors ✓ (every line opened + confirmed) · scope = the seeds above · re-derive when they change · DRIFT NOTE:
this card deliberately anchors ONLY `w6-verification/node.json` as the representative instance — all 14
`nodes/*/node.json` files share this exact contract shape (deps/tools/contract/checks/policy/return/optimize),
so a change to the SHAPE itself (not one node's specific values) should re-derive against a second or third
node too before trusting this card blindly. Per the task boundary this card was authored under: node.json/
prompt.md files themselves are NOT to be edited from this lane (a separate lane owns in-flight sandbox fixes to
them) — this card only reads and anchors them. `piflow-maintenance` (the skill) is the canonical STANDARDS
reference for what each contract field MEANS; this card is the concrete instance in THIS repo.

<!-- okf:auto-start -->
> _Auto-generated by `_generate.mjs` — do not hand-edit between the markers; re-run `--write`._

### Final state — file set (seeds)

| File | exists |
|---|---|
| `.piflow/lesson-build/template/meta.json` | ✓ |
| `.piflow/lesson-build/template/workflow.json` | ✓ |
| `.piflow/lesson-build/template/nodes/w6-verification/node.json` | ✓ |
| `.piflow/lesson-build/template/memory.md` | ✓ |

### Evolution arc

- `2216b43` 2026-06-25 — feat: port lesson-build workflow to piflow template format
- `15872ba` 2026-07-09 — chore(lesson-build): conform template to latest maintenance standard
- `edd6321` 2026-07-09 — feat(lesson-build): per-node optimization runway (measures + memory + issues)
- `c912c29` 2026-07-09 — feat(lesson-build): harden node measures (fail-close floors, de-game criteria) + system memory
- `a0383b9` 2026-07-09 — fix(lesson-build): declare contract.execCwd on w3b/w6 — npm run works under the seatbelt jail

### Lessons — memory cluster

**Alias matches** (review — may include false positives):
- [[piflow-seatbelt-write-scope]]

### Code anchors / blast radius (codegraph)

- `Stage` (remotion-svg-primitives/src/scenes/DialogueExchangeDemo.tsx:73) — 27 callers in `remotion-svg-primitives/src/lessons/transitions/SectionHandoff.tsx`, `remotion-svg-primitives/src/lessons/transitions/TopicIntroCard.tsx`, `remotion-svg-primitives/src/scenes/DialogueExchangeDemo.tsx`, `remotion-svg-primitives/src/scenes/MatchPairsBoardDemo.tsx` +4 more; ⚠ no covering tests found

<sub>derived 2026-07-10 · arc=5 commits · files=4 · lessons=1</sub>
<!-- okf:auto-end -->
