# capability-gap-filler — criteria (the judging bar)

_What a GOOD gap-fill run looks like, per node. The standing reference the steward judges against; sharpened as the skill leaves DRAFT. A judging fixture, NEVER injected into a node prompt. Generalize every line; never encode the one curriculum in front of you._

## Scope
- Indexes the curriculum into real sections — no section invented, none dropped.

## Demand
- Demands are **teaching-driven** — derived from each KP's content + difficulties (what the child must SEE to grasp it), not reverse-engineered from a layout already imagined.

## Gap (the decisive node)
- Demands are deduped across sections before any build.
- Each demand is diffed against the **live** `catalog-digest` and classified, with **REUSE as the default** — a build is named only when the gap is explicit.
- The ladder is honored and **stops at the first hit** (REUSE > compose > build-primitive > build-special-component > make-asset). `dryRun` produces a gap report that a human can trust before any building run.

## Build
- Every built capability is **lesson-agnostic + prop-driven** (no baked topic/value/string), **frame-disciplined** (no frame/motion literals in its API), and **registered + wired** (`registry:check` GREEN).
- Built at the right tier; looks like what it claims at real render size (true-size view).

## Verify
- `registry:check` GREEN + a completeness critic that asks "what demand went unbuilt / unwired?"

## Red flags (known failure modes)
- A build that REUSE would have covered (the ladder skipped) → duplicate capability.
- A built-but-unwired capability (export/registry step missed) → drift.
- A demand classified from a truncated/stale digest → wrong REUSE-vs-build call.
- Parallel Build subagents racing on the shared barrel/registry files (must stay serial).
