# capability-gap-filler — map

_The curriculum-driven factory that GROWS the library ahead of (and across) lessons. Free-form, no scores. Registry row: `.agents/tracked-systems.md#capability-gap-filler`._

**Scope reminder:** the user's directive — "we are not improving the workflow, we are improving the **markdowns inside it**." We optimize the SKILL's prompts/methodology; the `.js` orchestrator is wiring — out of Hermes edit-scope.

## What it is / what orchestrates it
- **Workflow:** `.claude/workflows/capability-gap-filler.js` (wiring) — proactive + library-WIDE (vs the lesson-build W3b node, which is reactive / per-lesson).
- **Skill (the surface we optimize):** `.agents/skills/capability-gap-filler/SKILL.md` — the methodology contract.

## Nodes (in order) — responsibility · reads · writes
| Node | Responsibility | Reads | Writes |
|---|---|---|---|
| **Scope** | index the curriculum → sections | curriculum JSON | section list |
| **Demand** | per section: KP content + difficulties → **visual demands** (teaching-driven, not layout) | section + lesson content + `TEACHING-ACTIONS.md` | per-section demand set |
| **Gap** (barrier) | dedup demands, diff vs `catalog-digest` → **classified gap set; REUSE is the default** | all demands + `catalog-digest.md` | gap report (`args.dryRun` STOPS here, building nothing) |
| **Build** (serial) | one subagent per gap across **asset ∥ primitive ∥ special-component**; serial because barrel + `registry:build` + `icons:build` write shared files (parallel builds race) | the gap + craft skills (`visual-discipline`, `kids-eye`, `early-childhood-visual-taste`) | new registered capability (export → `registry:build` → prose → green) |
| **Verify** | `registry:check` + a completeness critic | the build set | verification |

## THE LAWS (what the SKILL must keep enforcing)
- A capability is **lesson-AGNOSTIC + prop-driven** (never bakes a topic/value/Chinese string).
- Every build is **wired into the registry** (export → `registry:build` → prose → `registry:check` GREEN) or the pre-commit gate rejects it.
- **ZERO frame/motion literals** in component code (public API takes `atFrame`/`startFrame`/`progress` + offsets).
- The ladder: **REUSE > compose > build-primitive > build-special-component > make-asset — stop at the first hit.**

## What we optimize (the markdown surface)
The `SKILL.md`: the Demand prompts (keep gap-detection teaching-driven), the Gap classification (REUSE-default, the ladder), the per-layer authoring discipline, the Build wiring contract, the Verify completeness critic.

## Wiring — who relies on this
Feeds **capability-registry** (new entries) + **capability-gallery** (new previews). Shares the W3b protocol + craft skills with **lesson-build**.

## Observability (where a flaw shows)
The workflow's structured returns, the `dryRun` gap report (does it classify REUSE-vs-build correctly?), `registry:check`, the gallery (do the built components look right?).

## Quality bar → `.agents/capability-gap-filler-criteria.md`
