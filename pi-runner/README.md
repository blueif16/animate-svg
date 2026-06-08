# pi-runner

Run the **lesson-build workflow on pi agents** instead of Claude Code's Workflow tool — on cheap
non-Claude coding-plan models, orchestrated entirely from Claude Code (the user runs nothing).

## Single source of truth: `.claude/workflows/lesson-build.js`

You author and **prove** the workflow the normal way — by spawning the real Claude Code Workflow
(`lesson-build.js`). pi-runner does **not** re-define the waves. It **executes that file under
recording stubs** (`extract.mjs`) for the Workflow hooks (`agent`/`parallel`/`phase`/`log`) and
captures the *exact* realized prompts + DAG, then spawns one `pi` per node.

> Edit `lesson-build.js` → prove it via the Claude Code Workflow → pi runs the **identical**
> prompts automatically. **No hand-sync, no codegen, no drift** — by construction.

What this gives you for free:
- **All 14 waves**, not a hand-ported subset — extraction reads whatever the JS produces.
- **New / reordered / removed waves** propagate automatically.
- **Skill refs** propagate automatically (they come from `lesson-build.js`'s `SK` map). And skill
  *content* edits already flow to both, since every node reads `SKILL.md` by path at runtime.
- The only transform on `lesson-build.js` is mechanical (de-export `meta` + wrap in a function —
  the Workflow runtime wraps it the same way). Wave prose, paths and control-flow run verbatim.

## Architecture

```
Claude Code (us) ─ spawns 1 driver per lesson ─► run.mjs   (DETERMINISTIC graph)
                                                  │ extract.mjs executes lesson-build.js
                                                  │ → exact prompts + stages
                                                  │ spawns one `pi` per node
                                                  ▼
                                       pi (per-node executor: read/bash/edit/write,
                                           non-Claude coding-plan model)
                                                  │ reads/writes
                                                  ▼
                  lesson-data/<id>/*  +  out/<id>/run-status.json (we poll)
```

The **driver owns determinism** (stage order, parallel lanes, status, watchdog). **pi owns each
node.** Nodes coordinate through the **filesystem**, exactly like the waves do.

## Run (the orchestrator runs these — never the user)

```bash
# Dry-run (no model): extract + build prompts + print exact pi commands
node pi-runner/run.mjs --lesson <id> --until all --dry-run

# Live, always with --debug:
node pi-runner/run.mjs --lesson <id> --until design --debug      # dependency-light slice
node pi-runner/run.mjs --lesson <id> --until verify --debug      # full pipeline
```

- `--until {design|voice|compose|render|verify|all}` truncates after that phase. **Default `design`**
  — the block that needs no Gemini/Remotion — so a bare run can't hit the voice/render walls during
  bring-up. Later waves need their toolchains + a billed `GOOGLE_API_KEY` (voice/assets).
- `--brief <file>` seeds Setup (passed into the workflow so the setup prompt matches).
- **Fleet:** one driver per lesson in the background; poll each `out/<id>/run-status.json`.

## Debug vs production mode

- **`--debug` (always while developing):** 4s heartbeat (`t=elapsed · ev · tools · cur=tool ·
  last=event · Δ=since-last-event · ⚠STALLED`), continuous `run-status.json` refresh, per-node
  `*.debug.log`, **stall flag at >45s**, and a hard `--node-timeout` (default 600s) that kills a
  runaway node. A hang is visible in seconds, never minutes.
- **Production (no `--debug`):** lean — 10s status refresh, no console heartbeat — for the fleet.
- **Status is verified, not trusted:** a node is `ok` only if the artifacts it reports actually
  exist on disk.

## Generic engine — `.env` is the only per-repo file

`run.mjs`, `extract.mjs`, and `providers/coding-plan.ts` are **byte-identical** to the global
skill template `transform-workflow-to-pi` (`~/.claude/skills/transform-workflow-to-pi/templates/
pi-runner/`). Nothing in them is lesson- or repo-specific. **Never edit them for this repo** — a
fix flows both ways by `cp`. Everything project-specific lives in gitignored `pi-runner/.env`:

- **Wiring** — `PI_RUNNER_CWD=remotion-svg-primitives` (npm runs there; artifact paths resolve
  there), `PI_RUNNER_WORKFLOW=.claude/workflows/lesson-build.js`, `PI_RUNNER_UNTIL=design` (the
  bring-up default that keeps a bare run off the voice/render walls). `PI_RUNNER_ROOT` defaults to
  this dir's parent. Paths are relative to ROOT.
- **Model / credential** — `providers/coding-plan.ts` registers one OpenAI-compatible provider
  `cp` from env (Alibaba DashScope-intl; default `qwen3.7-max`; also exposes `qwen3.7-plus`,
  `glm-5.1`, `kimi-k2.6`, `deepseek-v4`, …). Set once; swap providers by editing `.env`, never code.

The convenience flags `--lesson <id>` (sets the run id + `args.lessonId`), `--brief <file>`, and
`--style <v>` map onto the generic `--arg`/`--arg-file` mechanism, so the commands below are
unchanged by the convergence.

## Files

- `extract.mjs` — execute-and-record extractor (**the sync**): runs `lesson-build.js` → prompts + DAG.
- `run.mjs` — driver: stages + parallel lanes + pi spawning + debug/status/watchdog.
- `providers/coding-plan.ts` — non-Claude provider, configured from `.env`.
- `.env` — wiring + credential + model defaults (gitignored, never committed). The ONLY per-repo file.

## Headless pi invariants (learned from a real stall)

Close stdin, pass `--offline` and `--no-extensions` (the explicit `-e` provider still loads). An
open stdin pipe makes a headless CLI block forever waiting for EOF — that caused a silent ~10-min
startup hang; the driver sets all three.
