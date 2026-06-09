# Cheap-default model that escalates to *consult* a stronger model — what actually triggers the escalation when you don't trust the model's own confidence

_scope: last ~6 months (≥ 2025-12-01), generic (LLM-agent) lens, deep dive • generated 2026-06-26_
_source tags: **[E]** = Exa web (papers / blogs / repos) • **[Y]** = YouTube via yt-rag (curated transcripts). Inline citations name the specific paper/creator + date/timestamp so every claim is traceable. Reddit leg intentionally skipped._

## How to read this
This is a reusable reference, not a one-off answer. The framing question is **not** "static per-task model routing." It is: *a cheap/basic model runs the average task and decides, on its own, to consult a stronger model on the hard tail.* The requester's stated prior — **you cannot trust a model's self-reported confidence score** — is the organizing lens. Findings below are sorted around that: first the evidence that self-scores are untrustworthy, then the trigger signals that work *instead*, then how they ship, then the failure modes. "Claimed" numbers are flagged where they're vendor/practitioner rather than independently replicated.

---

## TL;DR
- **Your skepticism is now well-supported by fresh evidence.** A 48-model study (npj/Nature, 2026-02-05) found *every* model systematically overconfident, with AUROC ≈ 0.6 (near-random at telling its own right answers from wrong) and confidence essentially flat regardless of difficulty — "should not be relied upon as a standalone signal." Only 5 of 48 models beat random calibration. **[E]**
- **The reliable trigger is external and empirical, not introspective.** In rough order of trustworthiness: (1) **ground-truth execution feedback / retry-budget** (tests fail, tool errors, N failed fixes), (2) **a separate verifier/critic or process-reward model** (ideally cross-family), (3) **answer/representation agreement across samples** (disagreement → escalate), (4) **conformal / calibrated thresholds**, (5) **deterministic progress heuristics**. **[E][Y]**
- **The single worst trigger is the cheap model's own confidence** — "high logprobs do not guarantee correctness… the hardest failure mode to detect." Same-model self-review fails because of **correlated blind spots** (the third attempt repeats the same confident wrong answer). **[E][Y]**
- **It ships today.** Anthropic's **advisor tool** (executor calls Opus mid-task), Codex-as-second-opinion (escalate after **two** failed fixes), GitHub Copilot **Auto** (task-complexity router), generator→critic loops in ADK/LangGraph. But the *signal* firing the escalation matters more than the plumbing. **[E][Y]**
- **Caveat that bites:** a **leaky verifier inverts inference-scaling** — more retries against a verifier with false positives make results *worse*, not better. Harden the decision module, not just the models. **[E][Y]**

---

## Key findings (in depth)

### 1. Self-reported confidence is untrustworthy — the newest, strongest evidence
This is the load-bearing point for the whole design, and recent work lands squarely on the skeptic's side.

- **48-model overconfidence study** [E] (npj Digital Medicine / Nature, 2026-02-05, `s44355-026-00053-3`): 48 LLMs × 300 board MCQs. *"All models demonstrated systematic overconfidence."* Best discrimination AUROC = **0.626** (o1-mini), all < 0.7. Confidence was *"unvarying regardless of question difficulty or correctness."* *"Only 5 of 48 models demonstrated better-than-random calibration."* Verdict: *"self-reported confidence should not be relied upon as a standalone LLM safety signal… confidence outputs are simply statistically generated text outputs, rather than true reflections of model uncertainty."* (code: github.com/narimannr2x/confidence_scoring)
- **RiskEval** [E] (OpenReview `FJHcNH5auD`, 2026-03-20): a *second, distinct* failure mode — even when a model verbalizes confidence, it **doesn't act on it**. *"Even when extreme penalties render frequent abstention the mathematically optimal strategy, models almost never abstain, resulting in utility collapse."* So a confidence number doesn't convert into a trustworthy escalate/abstain decision.
- **The "reasoning tax"** [Y] (The Bearded AI Guy, 2026-05-23, `NuX7htWy8D4` @06:09): training a model to think harder *"makes it an exceptional search engine but a terrible self-judge"* — long-CoT training **degrades abstention calibration**, citing the paper *"Do reasoning models know when they're right?"* The harder-reasoning model is *less* able to gate itself.
- **Confidently wrong is the undetectable case** [E] (genaipatterns.dev "Cascading", 2026-04-29): *"Logprob-based gates will not catch [a confidently wrong cheap model] because token probabilities are high. This is the hardest failure mode to detect."*
- **Self-confidence is socially manipulable** [Y] (AI Agent Frontier / Prof. Lifu Huang, `UYAfS9xy5Tw` @12:14): models capitulate when challenged (sycophancy), so a confidence figure can be talked down — it can't be the gate.

> **One honest counterpoint** [E] (*"Verbalized Confidence Now Works"*, OpenReview `X2NIpkT2eY`, 2026-06-02): for **post-2025 flagship models used as JUDGES of *other* outputs**, a well-prompted verbal-confidence recipe has become more robust than logprobs. Note the scope: this is a model scoring *someone else's* output, **not** a model scoring *its own* — it does not rescue self-confidence as a deferral signal.

### 2. What fires escalation when you don't trust self-scores (ranked)

**(1) Ground-truth execution feedback + bounded retry-budget — most reliable for coding/agent work.**
The trigger is reality, not introspection: a test failed, a build broke, a tool errored, or the agent burned its retry budget.
- **Codex-advisor** [E] (stevekinney.com, 2026-06-04): escalate to `gpt-5.4` at `xhigh` reasoning on *"root-cause analysis after **two failed fixes**. This is the big one… Same priors, third attempt: probably the same wrong answer."* Explicitly invokes **"correlated blind spots"** as why same-model self-review is worthless. Fail-warn never fail-stop; idle-timeout kills a hung consult after 5 min.
- **Meta "Recovering from Misbehaviors in Coding Agents"** [E] (OpenReview `gJ9pQ8xLs0`, 2026-03-28): a trajectory observer fires on **loops / specification-drift / tool-call-failures** (these occur in **~30% of agent trajectories**) and *"resolves 90% of misbehaviors that require a single intervention"* across **10,000+** real production traces.
- **PALADIN** [E] (OpenReview `NVTtoO297p`, 2026-01-10): trigger = detected execution failure (timeout / malformed output / silent API); recovery rate **32.8% → 89.7%**, > 95% on out-of-distribution APIs. Trained on 50k+ recovery-annotated trajectories.
- **Failing Tools benchmark** [E] (OpenReview `j7YsSnA64D`, 2026-06-02): under injected runtime tool failures, *"no model exceeds **11.47%** accuracy,"* the *"dominant failure being missing verification or recovery steps."* The fix is detection + **calling confirmation functions to verify state** — not self-confidence.
- **Deterministic harness over self-report** [Y] (AI Engineer / Tejas Kumar–IBM, `C_GG5g38vLU` @13:54): a deterministic `verify_successful_upvote` reads the *tool history* and fails the agent when it lied about success — *"We're removing the lie. It stopped lying because our harness checks the tool history and actually sees what happened."*
- **Reflexion gating** [Y] (Vinh Nguyen, `1eXGiDirvdU` @21:18): trigger = first reward **R1 below the success threshold**; *"if R1 is above the success threshold it skips the reflection phase entirely… reserve the heavy expensive cognitive lifting strictly for the actual errors."*

**(2) External verifier / critic / process-reward model (PRM) — ideally cross-family.**
A *separate* model (or a trained reward model) checks the output and gates escalation. Cross-family breaks correlated blind spots.
- **ThinkPRM** [E] (OpenReview `FPVCb0WMuN`, 2026-01-17): a long-CoT *generative* process-reward verifier trained on **1% of PRM800K** labels beats a discriminative PRM by **8%** (GPQA-Diamond) / **4.5%** (LiveCodeBench) and LLM-as-Judge by **7.2%** on ProcessBench at equal token budget. (code: github.com/mukhal/thinkprm)
- **GroundedPRM** [E] (OpenReview `Kl1A5Kfv1U`, 2026-03-20): tree-guided, fidelity-aware step-level verification.
- **LLM-as-Judge hygiene** [Y] (The Bearded AI Guy, `8fNWDEsQCiY` @06:08): *"If you allow an AI to certify its own worldview without independent verification, it will silently lie to you. It is a calibrated proxy, not a source of truth."* Five-step fix: version/freeze the judge, build human-calibration subsets, **prefer executable checks (200 status? unit test passed?) over fluent text**, multi-judge aggregation for subjective cases, read transcripts. (Anthropic moved a score **53 points** by fixing grading scripts alone — zero model change.)
- **Cross-family rescue plumbing** [E] (github.com/xuio/claude-code-codex-subagents, 2026-05-09): shipping plugin for adversarial cross-model review/rescue over daemonless MCP.

**(3) Answer / representation agreement across samples — a confidence *substitute*.**
Disagreement across independent samples or models → escalate. Different from one self-reported number.
- **Consensus Entropy** [Y] (CVPR'26, tianyi lIang, `vcpFUJ77dD0` @00:02): *"If several independent models read an image correctly, their answers usually land close together… when confused, their answers drift apart."* Spread is measured by char-level edit distance (exact) or embedding distance (semantic); agree → combine cheaply, **disagree → send the risky case to a stronger model**. Beats an LLM judge, needs **no trained verifier**.
- **Karpathy "LLM Council"** [Y] (The Cloud Girl, `YCZSFoFTUHg` @03:04 & @09:06): *"models are better discriminators than generators."* Pipeline: parallel first opinions → **blind peer review** (names stripped, each ranks the others) → chairman synthesis. *"If response B ranked first by 3 of 4 models, that's a strong statistical signal."* Cites MIT debate result: accuracy **70% → 95%**.
- **Routing-aware inference** [E] (OpenReview `oz9qDN6GKn`, 2026-03-20): selects among reasoning trajectories by **representational agreement** — *"correct trajectories exhibit stable representational alignment, whereas erroneous trajectories diverge"* — variance reduction with **no extra token budget**, and distinct from answer-level voting.

**(4) Conformal / calibrated thresholds — statistically-grounded gates.**
- **RouteNLP** [E] (OpenReview `H9KBJXHoA8`, 2026-04-18): confidence-calibrated cascading via **conformal prediction** for distribution-free thresholds. Enterprise pilot (~5k queries/day, 8 weeks): **58% cost reduction**, 91% acceptance, p99 latency **1,847 ms → 387 ms**, 74.5% of routed outputs match/beat frontier quality.
- **AVA** [E] (OpenReview `JMDCMf7mlF`, 2025-12-03): *"selective verification cascades with early exits"*; a controller allocates compute by calibrated uncertainty + value-of-information. (code: github.com/llmsresearch/AVA)
- **UCCI** [E] (anchor, calibration emphasis): isotonic calibration drops ECE 0.12 → 0.03 and beats entropy/FrugalGPT-style thresholds — *calibrating the signal matters more than tuning the threshold.*

**(5) Deterministic progress / shape heuristics — cheap front-line gates.**
- **DPR** [E] (OpenReview `u3I4CRwe6D`, 2026-05-23): route to a slow causal-diagnosis process after **m = 5 consecutive low-progress steps** (an empirical per-step progress gate, *not* a self-score). ALFWorld: Qwen-3-8B 35.1% → **75.4%** (+40.3pp); GPT-5 46.3 → **88.1%** (+41.8pp).
- **Deterministic auto-approve gate** [Y] (Merantix AI Campus, `YuTn29Y04KM` @27:21): *"We never auto-approve anything unless it's up to two files and 20 lines of code each… where the risk is fairly low."* Everything beyond escalates to a fan-out of specialist sub-agent critics + humans — not one self-score.
- **Reasoning-effort routing by task shape** [Y] (The Bearded AI Guy, `NuX7htWy8D4`): escalate on *"find vs format"* — high reasoning *degrades* grounded extraction (GPT-5 high effort 48.1% vs low 49.6%), so route by task type, not confidence.
- **Cheap deterministic gates** [E] (genaipatterns.dev): escalate on hedging phrases ("I'm not sure") or suspiciously short output. *"The best quality gates combine multiple signals."*

### 3. The "consult a stronger model" pattern as it ships (mid-2026)
- **Anthropic advisor tool** [E][Y] (claude.com/blog/the-advisor-strategy; Julian Goldie `mH8232pVlwU` @03:04): executor (Sonnet/Haiku) works step-by-step and *calls* Opus when it hits a hard fork; Opus returns *"a plan, a fix, or a direction change"* in one API call with shared context. Claimed **+2.7 pts SWE-bench Multilingual** and **−11.9% cost per agentic task** vs Sonnet alone; Haiku+Opus **more than doubled** BrowseComp (19.7 → 41.2%). *Note: the escalation here is still model-initiated; the open question is what internal signal Anthropic uses to fire it — no recent source names it precisely.* (Vendor-reported; no independent replication at launch.)
- **GitHub Copilot Auto** [Y] (GitHub, `a-c1M8QwK84` @04:31): a real-time router scores models on latency/capacity/errors + task intent — Haiku for low-reasoning, escalate to Sonnet for refactors; classifies at session start/compaction, not per-prompt. Found *"some tasks only solved by smaller, some only by larger"* models — i.e., escalation can *improve* quality, not just cut cost.
- **Generator→critic loops** [Y] (Google Cloud Tech ADK, `89KKm_a4M7A`; Atef Ataya `ZLhc814hLo4`): iterate until a **critic approves or max-iterations** hits; retry is *diagnostic, not blind* — *"the judge tells the agent what was wrong, so the second attempt is actually better"* (trigger = judge Z-score < 70 → one more attempt).
- **FrugalGPT cascade, restated for 2026** [Y] (Uplatz, `qj5xMu_IsFA` @03:03): *"always asks the cheapest, fastest model first, and only if that model can't give a good answer does it escalate… to the next, more expensive model."* Names the **Router Arena** benchmark and the finding that commercial routers over-pick expensive models.

---

## What's working (claimed)
- Escalate-after-**two**-failed-fixes for coding agents (cross-family second opinion) — Codex-advisor. **[E]**
- Trajectory observer on loops/drift/tool-failures → **90%** single-intervention resolution over 10k+ traces (Meta). **[E]**
- **Consensus entropy** (inter-model disagreement) as a no-training verifier that routes only the risky tail up. **[Y]** (CVPR'26)
- Conformal-thresholded cascade → **58%** cost cut, 91% acceptance in an 8-week enterprise pilot (RouteNLP). **[E]**
- Generative PRM (ThinkPRM) beating LLM-judge by **7.2%** on ProcessBench at equal budget, with 1% of the labels. **[E]**
- Anthropic advisor: **+2.7 pts** / **−11.9%** cost claimed; Haiku+Opus doubled BrowseComp. **[E][Y]** (vendor-reported)

## What's broken / contested
- **Self-confidence as a gate: broken.** 48-model AUROC ≈ 0.6; flat across difficulty; only 5/48 better than random (npj/Nature). **[E]**
- **Leaky-verifier scaling inversion** [Y] (AI Engineer / Sayash Kapoor, `d5EltXhbcfA` @16:56): verifier false positives *"bend inference-scaling curves downward"* — code passes a unit test while still wrong, so more retries make it *worse*. A direct caution on naive retry-budget + verifier triggers.
- **Reflection-on-success is harmful** [Y] (Vinh Nguyen @21:18): forcing self-critique after a *passing* reward makes the model hallucinate spurious rationalizations — only ever trigger reflection on a *failed* reward.
- **Adversarial escalation abuse** [E] ("When Efficiency Backfires", anchor): crafted inputs can force needless escalation — accuracy −84.6%, token cost +148.9%, jailbreak success +81.4%. Harden the *decision module*.
- **Over-escalation erases savings** [E] (genaipatterns.dev): if escalation rate > 50–60%, the cheap model or the gate is mis-set; long shared context re-billed at the strong model's input rate eats the advisor's savings.
- **LLM-judge reliability itself is suspect** [E] (arxiv 2604.15302, 2026-04-16): conformal prediction sets + transitivity-violation tests expose judge unreliability — so verifier-gated triggers need their *own* calibration.

## Numbers worth verifying
| Number | Claim | Source |
|---|---|---|
| AUROC **0.626** (best), 5/48 > random | LLM self-confidence ≈ uninformative | npj/Nature `s44355-026-00053-3`, 2026-02-05 **[E]** |
| **90%** single-intervention resolution / ~30% of trajectories misbehave | trajectory-observer trigger, 10k+ prod traces | Meta `gJ9pQ8xLs0`, 2026-03-28 **[E]** |
| **32.8% → 89.7%** recovery | execution-failure trigger (PALADIN) | `NVTtoO297p`, 2026-01-10 **[E]** |
| **< 11.47%** best accuracy under tool failure | missing verification/recovery is dominant failure | `j7YsSnA64D`, 2026-06-02 **[E]** |
| **+8% / +4.5% / +7.2%** over PRM/judge, 1% labels | generative PRM as trigger (ThinkPRM) | `FPVCb0WMuN`, 2026-01-17 **[E]** |
| **58%** cost cut, p99 1847→387ms | conformal cascade (RouteNLP) | `H9KBJXHoA8`, 2026-04-18 **[E]** |
| **+40.3pp / +41.8pp** ALFWorld | m=5 low-progress-step gate (DPR) | `u3I4CRwe6D`, 2026-05-23 **[E]** |
| **+2.7 pts / −11.9% cost**; BrowseComp 19.7→41.2% | advisor tool (vendor) | claude.com/blog/the-advisor-strategy **[E][Y]** |
| **70% → 95%** | debate/peer-review vs solo (MIT, via creator) | The Cloud Girl `YCZSFoFTUHg` **[Y]** |
| GPT-5 high **48.1%** vs low **49.6%** | high reasoning *hurts* extraction | The Bearded AI Guy `NuX7htWy8D4` **[Y]** |

---

## Practice → source quick-reference
| Practice (trigger to fire escalation) | Why it works | Source | Leg |
|---|---|---|---|
| Escalate on test fail / build break / tool error | ground truth, not introspection | Failing Tools `j7YsSnA64D`; IBM harness `C_GG5g38vLU` | [E][Y] |
| Escalate after **N** failed self-fixes (N≈2) to a **different-family** model | correlated blind spots make attempt #3 repeat the wrong answer | Codex-advisor (stevekinney) | [E] |
| Trajectory observer on loops/spec-drift/tool-failure | catches misbehavior the model won't self-report | Meta `gJ9pQ8xLs0` | [E] |
| Gate on a **generative PRM / frozen judge**, prefer **executable** checks | discriminate > generate; reality > fluent text | ThinkPRM `FPVCb0WMuN`; Bearded AI Guy `8fNWDEsQCiY` | [E][Y] |
| Escalate on **inter-sample/inter-model disagreement** (consensus entropy) | spread is a real uncertainty estimate, no training | CVPR'26 `vcpFUJ77dD0`; routing-aware `oz9qDN6GKn` | [Y][E] |
| **Conformal** thresholds for accept/escalate | distribution-free statistical guarantee | RouteNLP `H9KBJXHoA8`; AVA `JMDCMf7mlF` | [E] |
| **m consecutive low-progress steps** → slow/strong path | empirical progress, not a self-score | DPR `u3I4CRwe6D` | [E] |
| Reflect/retry **only on failed reward**, never on success | self-critique on success hallucinates | Reflexion (Vinh Nguyen) | [Y] |
| Deterministic auto-approve only for tiny diffs; else escalate to critics | remove model judgment from the risk gate | Merantix `YuTn29Y04KM` | [Y] |
| **Don't** trust raw verbalized/logit confidence as the gate | overconfident, flat, undetectable when wrong | npj/Nature; genaipatterns.dev | [E] |
| Watch for **leaky-verifier scaling inversion** | false-positive verifier makes retries worse | Sayash Kapoor `d5EltXhbcfA` | [Y] |

## Next moves
- **Concrete experiment (maps to our pi-runner):** make the cheap pi node's "consult Opus" trigger **empirical, not self-reported** — fire on (a) a wave node that fails its declared-artifact check, or (b) **two** failed self-fix attempts on the same node, then hand the full node context to a stronger advisor. This mirrors Codex-advisor's two-failed-fixes rule and dovetails with our existing `run-status.json` artifact-verified status. (See memory: pi-runner lesson workflow; v4 cue-anchored audio.)
- **Second experiment:** for any node that emits a *graded* artifact, add a **cross-family critic** (or consensus across 2 cheap samples) as the escalation gate rather than asking the cheap model "are you confident?" — consensus-entropy style.
- **Follow-up search if needed:** (a) Anthropic's *exact* advisor-tool internal trigger signal (gap — unnamed in current sources); (b) head-to-head of trigger families on one escalation benchmark at fixed cost (gap); (c) semantic-entropy vs representational-agreement as deferral signals (thin since 2025-12).

---

## Sources

### Exa (papers / blogs / repos) — all ≥ 2025-12-01 unless flagged anchor
- npj/Nature — 48-model overconfidence study (2026-02-05) — https://www.nature.com/articles/s44355-026-00053-3
- RiskEval — verbal confidence ≠ risk-sensitive abstention (2026-03-20) — https://openreview.net/forum?id=FJHcNH5auD
- GenAI Patterns — Cascading routing pattern + gate taxonomy (2026-04-29) — https://www.genaipatterns.dev/patterns/routing/cascading
- DPR — m=5 low-progress-step routing gate (2026-05-23) — https://openreview.net/forum?id=u3I4CRwe6D
- Meta — Recovering from Misbehaviors in Coding Agents (2026-03-28) — https://openreview.net/forum?id=gJ9pQ8xLs0
- Codex as a Second Opinion — escalate after two failed fixes (2026-06-04) — https://stevekinney.com/writing/codex-as-a-second-opinion
- ThinkPRM — generative process-reward verifier (2026-01-17) — https://openreview.net/forum?id=FPVCb0WMuN
- Failing Tools benchmark — recovery under tool failure (2026-06-02) — https://openreview.net/forum?id=j7YsSnA64D
- PALADIN — execution-failure recovery (2026-01-10) — https://openreview.net/forum?id=NVTtoO297p
- RouteNLP — conformal cascade, production pilot (2026-04-18) — https://openreview.net/forum?id=H9KBJXHoA8
- AVA — selective verification cascades + early exits (2025-12-03) — https://openreview.net/forum?id=JMDCMf7mlF
- Routing-aware inference — representational agreement (2026-03-20) — https://openreview.net/forum?id=oz9qDN6GKn
- CritiCal — NL critique improves calibration (2026-03-20) — https://openreview.net/forum?id=nkCbYg6P5p
- Dynamic Routing & Cascading survey (2026-05-04) — https://openreview.net/forum?id=ypRg1TvQaM
- "Verbalized Confidence Now Works" (counterpoint, judges only) (2026-06-02) — https://openreview.net/forum?id=X2NIpkT2eY
- GroundedPRM — tree-guided process reward model (2026-03-20) — https://openreview.net/forum?id=Kl1A5Kfv1U
- Diagnosing LLM-Judge Reliability — conformal + transitivity (2026-04-16) — https://arxiv.org/abs/2604.15302v1
- claude-code-codex-subagents — cross-family review/rescue plugin (2026-05-09) — https://github.com/xuio/claude-code-codex-subagents
- Anthropic — The advisor strategy (2026-04, vendor) — https://claude.com/blog/the-advisor-strategy

### YouTube (yt-rag; namespace `yt_llm_escalation` + agent namespaces) — deep-links keep MM:SS
- Consensus Entropy (CVPR'26) — tianyi lIang (2026-05-18) — https://youtu.be/vcpFUJ77dD0?t=2
- Karpathy LLM Council / "discriminate > generate" — The Cloud Girl (2026-05-21) — https://youtu.be/YCZSFoFTUHg?t=546
- LLM-as-Judge: why evals break + 5-step fix — The Bearded AI Guy (2026-05-21) — https://youtu.be/8fNWDEsQCiY?t=368
- FrugalGPT / cascade explainer + Router Arena — Uplatz (2026-02-26) — https://youtu.be/qj5xMu_IsFA?t=183
- Anthropic advisor "two-brain" strategy — Julian Goldie SEO (2026-04-11) — https://youtu.be/mH8232pVlwU?t=274
- Generator-evaluator deterministic verifier — AI Engineer / Tejas Kumar-IBM (2026-05-17) — https://youtu.be/C_GG5g38vLU?t=834
- Reflexion / experiential RL gating — Vinh Nguyen (2026-03-11) — https://youtu.be/1eXGiDirvdU?t=1278
- Reasoning-effort routing / "reasoning tax" — The Bearded AI Guy (2026-05-23) — https://youtu.be/NuX7htWy8D4?t=369
- Smart AI retries / evaluator + retry loop — Atef Ataya (2026-04-13) — https://youtu.be/ZLhc814hLo4?t=2
- Metacognition as control layer — The Hidden Layer (2026-06-02) — https://youtu.be/2ONizx32mWs?t=273
- Reliability vs capability / leaky-verifier scaling — AI Engineer / Sayash Kapoor (2025-04-17, anchor) — https://youtu.be/d5EltXhbcfA?t=1016
- GitHub Copilot Auto model selection — GitHub (2026-05-19) — https://youtu.be/a-c1M8QwK84?t=271
- Deterministic auto-approve gate + critic fan-out — Merantix AI Campus (2026-05-20) — https://youtu.be/YuTn29Y04KM?t=1641
- Complexity-classifier router (hands-on) — Beyond Tokens (2026-03-05) — https://youtu.be/2YTcQgrdEGc?t=92
- 3 agent design patterns (loop/critic, router) — Google Cloud Tech (2026-03-17) — https://youtu.be/89KKm_a4M7A
- Sycophancy / models capitulate when challenged — AI Agent Frontier / Lifu Huang — https://youtu.be/UYAfS9xy5Tw?t=734
- AWS progressive-autonomy confidence threshold — AWS re:Invent — https://youtu.be/SC3pHo-CycI?t=547

## Method notes
- Legs run: **Exa web** (date-bounded ≥ 2025-12-01) + **YouTube** (discover → ingest 14 videos / 110 chunks into `yt_llm_escalation` → search, also `yt_self_improving_agents` / `yt_agent_prevention_hitl` / `yt_hermes_agent`). **Reddit leg skipped per request.** No A/B WebSearch probe.
- Recency held tight: nearly all sources Jan–Jun 2026; two clearly-flagged anchors (FrugalGPT framing; Kapoor reliability talk) kept for foundational context.
- The yt-rag corpus is global, so the 14-video `yt_llm_escalation` ingest benefits every future run.

---

# Update (2026-06-26, pass 2) — does it actually pay off, wider token-saving levers, and the pi-runner design

_added legs: an adversarial "does consult actually net-save" Exa leg, a wider token-efficiency mechanism-catalog Exa leg, and a yt-rag leg over `yt_llm_escalation` + agent namespaces. Reddit still skipped._

## Does the consult/cascade pattern actually pay off? (adversarial verdict)
**Conditionally — and the naive "try cheap first, escalate on a bad answer" cascade is often the WRONG shape.**
- **A pre-generation router beats a try-cheap-first cascade on 4/5 benchmarks** [E] (pith.science/paper/2605.06350, 2026-05-07): *"cascade performance is limited primarily by the structural cost of always invoking the cheap model before any escalation decision rather than by a shortage of intermediate stages."* The cascade's mandatory cheap-model floor is the limiter.
- **Independent router benchmark is sobering** [E] (github.com/ynulihao/LLMRouterBench, arXiv:2601.07206, 2025-12-09): top methods reach only *"~4% PerfGain and 31.7% CostSave"* vs GPT-5; *"some routers (incl. commercial ones like OpenRouter) fail to outperform the Best Single."*
- **Tail-latency tax** [E] (tianpan.co, 2026-04-23): an escalated request pays cheap-reject (~400ms) + strong-completion (~2,400ms) = 2,800ms; *"Cost went down. Tail latency went up… a 5-point increase in escalation rate is a 5-point degradation of tail latency."*
- **Verifier/judge can cost more than it saves** [E] (zylos.ai, 2026-04-10): judge cost spans **175×** across models; intrinsic self-correction *"does not reliably improve performance and often degrades it"*; best-of-N+verifier wins are large in **code (+15–20pp)/math**, weak/negative in open-ended generation.
- **Where it IS clearly worth it** (both true for pi-runner): (1) **long loops where the strong model only *consults*** — short output over shared context, doesn't re-run the work (Anthropic advisor: +2.7 pts SWE-bench, −11.9% cost; Haiku+Opus −85%/task) [E][Y]; (2) **escalation gated on a cheaply-verifiable signal** — schema validation / test execution / **artifact exists** — *"cascade beats router when difficulty is unjudgeable from the input and output is cheaply verifiable"* [E] (genaipatterns.dev, 2026-04-19).
- **Practitioner net numbers** [Y]: cascade routing *"saves 30–40% on API costs with no meaningful quality drop"* (Beau Carnes, freeCodeCamp, `YDUv3YaqOcc` @10:45); FrugalGPT up to 98% (Uplatz `qj5xMu_IsFA`). Counter [Y]: *"finding requires reasoning; formatting punishes it"* — high reasoning made GPT-5 web research **worse** (49.6%→48.1%) at +56% cost (The Bearded AI Guy `NuX7htWy8D4`).
> **Bottom line for us:** don't build a generic try-cheap-first cascade. Build the **advisor inversion gated on the artifact contract** — the cheap model does the real work and we only consult a stronger model on a *verified* failure. Our "cheap floor" is not waste (the pith.science critique) because the cheap attempt's partial work + its failure evidence *feeds* the consult.

## Wider token-saving mechanisms (catalog, ranked by leverage)
1. **Prompt / prefix caching (KV reuse)** [E] — cache the stable prefix (CLAUDE.md laws + skill bodies + workflow extract) shared across all 14 waves & every parallel lesson. Anthropic cache-read ≈ **0.10× input**; *"cuts total input cost 60–90%"*; break-even **1.4–2 hits**; 5-min TTL, busts on any pre-marker token change. (claudeguide.io 2026-04-26; zylos.ai 2026-03-27). **Caveat: must verify DashScope/qwen (`cp`) honors prefix caching — not assumable from Anthropic numbers.**
2. **Deterministic code instead of an LLM call** [E][Y] — mechanical nodes (scaffold, path-resolve, reconcile, status-check, preflight) = **zero tokens**. We already do this (`DRIVER-PREFLIGHT` short-circuit `run.mjs:153,309-333`; Wave 3.5 reconcile is mechanical). Extend it. (tianpan.co/when-code-beats-the-model 2026-04-18; We Learn for Future `XoWzOH1lLVg` @06:06).
3. **Context engineering: sub-agent isolation + don't carry raw artifacts** [E][Y] — orchestrator keeps only the `{status, outputArtifact, summary}` digest; nodes JIT-read files by path. This is *the* avoid-recomputation lever and **pi-runner already coordinates via filesystem** exactly so. *"multi-agent systems use ~15× more tokens than chats"* if you don't isolate (anthropic.com 2025-06-13); *"file system for shared state instead of leaning on context windows"* (Anthropic Workshop `mR-WAvEPRwE` @10:54).
4. **Memory / experience reuse (skip re-derivation)** [E][Y] — cache a node's successful output keyed by an input hash; unchanged upstream → hydrate, **zero tokens**. *"reads prior agent's memory note, short-circuits the investigation — an immediate token-efficiency gain"* (Claude `RtywqDFBYnQ` @18:25); MemRL utility-scores which memories actually worked, +56% ALFWorld (Emergent Mind). Early-stage plan-cache repos claim 90–93% on repeats (treat as self-report).
5. **Batch API (flat 50% off in+out)** [E] — for the unattended **fleet** (many lessons, latency slack); needs `custom_id`, ≤24h. (burnwise.io 2026-01-12).
6. **Small/distilled specialist + transferable skill-text** [E][Y] — fine-tuned SLM at *"100× lower cost"* within ~2 acc pts (distil labs 2026-03-06); a trained skill file is *"under 2,000 tokens, zero inference cost, train on a big model and hand down to a cheaper one"* (SkillOpt `86_LUP699Bs`) — directly the Hermes skill-as-artifact idea.
7. **Structured output / constrained decoding** [E][Y] — eliminates the malformed-JSON retry class (~2% of requests). Our `lastJsonBlock` (`run.mjs:258-286`) is a *forgiving parser* compensating for the cheap model botching the fence — provider-enforced JSON would remove that whole failure class where `cp` supports it.

---

## DESIGN — merging the retry gate with a *consult* gate in pi-runner

### The merge
Extract one decision from the scattered detectors in `runNode`'s close handler. Today (`run.mjs:504-510`) the driver computes a terminal status, then the stage loop (`:570-576`) halts on any `error`/`blocked`. Insert a single classifier between them:

```
runNodeWithEscalation(node):
  result = runNode(node, model=CHEAP)          # attempt 0
  while result is a failure:
    decision = classify(result)                # ONE gate, fed by the existing signals
    if decision == RETRY_SAME and retriesLeft  # transient infra noise only
        → result = runNode(node, model=CHEAP)
    elif decision == ESCALATE and not escalatedYet and ESCALATE_MODEL
        → result = runNode(node, model=ESCALATE, promptPrefix=consultEvidence(result))
    else
        → return result                        # terminal → stage loop halts as today
  return result
```

### Criteria for consulting (the classifier — all EMPIRICAL, never self-confidence)
| Detected signal (already computed) | Class | Action |
|---|---|---|
| `contractMissing.length` — `DRIVER-ARTIFACTS` verified missing (`run.mjs:488-494`) | **capability/contract** | **ESCALATE** (strongest, ground-truth trigger) |
| `n.killedRepeat` — stuck-loop, same delta ×N (`:439`) | **capability** | **ESCALATE** (retry-same just loops again — correlated blind spots) |
| `n.killedTimeout` — exceeded node budget (`:463`) | **capability** | **ESCALATE** (optionally with a larger timeout) |
| `!parsed` — degenerate, no return JSON (`:509`) | **degenerate** | retry-same once → then **ESCALATE** |
| `code !== 0` w/ stderr ∈ /rate.limit\|ECONN\|429\|5xx\|network/ | **transient** | **RETRY-SAME** (cheap; infra, not capability) |
| self-reported `blocked`/`gap` whose issue names a missing **upstream input** | **upstream gap** | **HALT** (escalation can't manufacture a missing input) |
| any other failure | capability | ESCALATE |

The **contract check is the centerpiece** — it is the *cheaply-verifiable, external* signal the research names as the only trustworthy escalation trigger. We don't ask the model "are you sure"; we `stat()` the files it was required to produce.

### The consult is NOT blind (research: "the retry is not blind")
On escalate, prepend a `CONSULT` preamble carrying the cheap attempt's **failure evidence** (the verified signal, not a score):
```
CONSULT — a cheaper model attempted this node and FAILED; do not repeat its mistake.
Failure class: <contract|loop|timeout|degenerate>
Evidence: missing required artifact(s): <DRIVER-ARTIFACTS diff> | stderr tail: <…> | "looped on: <delta>"
Produce every required artifact and end with the return JSON block.
```

### Implementation (stays generic + one-file; per-repo wiring in `.env`)
1. **`.env` (per-repo wiring only, byte-identical run.mjs):** `PI_RUNNER_ESCALATE_MODEL` (stronger consult model; optional `PI_RUNNER_ESCALATE_PROVIDER`), `PI_RUNNER_MAX_RETRIES` (default 1, same-model transient retries), `PI_RUNNER_ESCALATE` (on/off).
2. **`piArgs(promptFileAbs, modelOverride, providerOverride)`** (`run.mjs:288-300`) — currently reads module-level `model`; thread an override so a single node can run on the consult model.
3. **`runNode(node, opts)`** — accept `{model, provider, promptPrefix}`; write `promptPrefix + node.prompt + returnProtocol(...)` to the prompt file.
4. **`classifyFailure(n, stderr)`** — the table above; pure function on signals `runNode` already sets (`killedTimeout`, `killedRepeat`, `contractMissing`, `parsed`, `exitCode`, `stderrTail`).
5. **Wrapper `runNodeWithEscalation`** between `runNode` and the stage loop; the stage loop (`:568`) calls the wrapper. Record `n.attempts=[{model,status,durationMs,tokens}]` + `n.escalated` in status for observability.
6. **Per-node opt-out marker** `DRIVER-NO-ESCALATE` for nodes where consulting is pointless (pure gates) — same marker convention as `DRIVER-ARTIFACTS`.

### Why this is the *right* shape (ties back to the verdict)
- It is the **advisor inversion**, not a generic cascade: cheap model does 90%+ of nodes; the strong model is consulted **only on a verified failure** → we sit in the regime the evidence says pays off, and dodge the pith.science "wasted cheap floor" critique (the cheap attempt feeds the consult).
- It **avoids the same-model retry trap** (correlated blind spots): a capability failure jumps to a *different/stronger* model with evidence, instead of looping the same one.
- **Token economics:** transient noise gets a cheap retry; only the hard tail pays strong-model rates; everything else is unchanged. Pairs with prefix-caching the invariant context (lever 1) and output-reuse (lever 4) for the biggest wins.

### Tie to the Hermes self-improvement loop
`n.escalated` + `n.attempts` is a first-class `pipelineFindings` signal: **a wave that escalates every run is a skill/prompt flaw, not a model flaw.** Feed escalation-rate-per-wave into Hermes → either fix the skill (so the cheap model succeeds) or pin that wave to the stronger model permanently. The consult gate thus doubles as the instrumentation that tells the self-improvement loop *where to look*. (Also: the SkillOpt finding — a <2k-token trained skill handed from a big model down to the cheap one — is the token-cheap way to *raise the cheap model's floor* so fewer nodes escalate at all.)

### Open questions to resolve before shipping
- Does the `cp` provider expose a second, stronger model id (a bigger qwen tier) — or do we point `PI_RUNNER_ESCALATE_PROVIDER` at a different provider/credential for the consult? (Verify `pi --list-models cp`.)
- Same-model transient retry vs. straight-to-escalate: start conservative (`MAX_RETRIES=1`, escalate on capability classes) and tune from `n.attempts` telemetry.
- Does `cp`/DashScope honor prefix caching + batch discounts (levers 1 & 5)? Measure before assuming the Anthropic/OpenAI numbers.

---

# Update (pass 3) — pi-runner harness: the changes to add + the decisions

_This folds the whole-system keep/change decision into this doc (no separate file). It records what we are CHANGING in the pi-runner harness and the decisions behind those choices. Source: memory `pi-harness-native-mechanism-decision` (researched via 4 parallel subagents — harness git-archaeology, pi SDK ground-truth, prior-decision synthesis, external pi.dev grounding) + the escalation design above. Canonical operational doc stays `pi-runner/README.md`; generic spec stays `~/.claude/skills/transform-workflow-to-pi/reference/`._

## The framing decision (why we are NOT rebuilding the harness)
**DECISION: the architecture is RIGHT, not a missed advantage.** pi's own positioning is *"minimal harness, build orchestration AROUND me"* — it ships **no sub-agents, no MCP, no native typed-return**. So our shape — filesystem-coordination + driver-owns-graph + spawn-per-node clean-room + scrape-the-fenced-JSON + stat()-artifacts-on-disk — is the INTENDED design, not an under-use. The earlier "we use almost none of pi's advantage" framing was too strong and is corrected.

**The sharper finding:** harness fragility is **localized** to the few surfaces where the driver must INTERPRET the cheap model's free-form output — and pi has purpose-built native mechanisms for exactly those. The git history proves it: the most-patched surface is return-block parsing (3 commits, over-corrected within hours: 98fcdd3→89fe3ac); cross-contamination (a W2c agent writing a sibling lesson's file) is still OPEN.

## DECISIONS — what we KEEP (don't touch working-but-non-native parts)
- **Filesystem coordination** between nodes — pi's intended shape.
- **Driver-owns-graph** (stage order / parallel lanes / status / watchdog in plain code).
- **Spawn-per-node clean-room** `-p --mode json` — **REJECT an RPC/warm-session migration**: it would break the deliberate clean-room-per-wave discipline AND re-bill accumulated context. (Explicit decision, not an omission.)
- **Artifact-existence `stat()`** as truth — there is no native typed return to lean on.
- **Watchdogs / event-slimming / telemetry / `DRIVER-PREFLIGHT` / forgiving-paths** — all working, no better native equivalent.
- **Skill-as-prose** — headless `--skill` is marginal (a cheap model may not auto-load it), so keep injecting prose.
- **git-worktree isolation** — native containerization isolates FS/process, not git history; worktree is the right tool for conflict-free merge-back.
- **Template law:** generic mechanism → the byte-identical template `run.mjs` (then `cp` to the repo); per-repo selection → wiring `.env`; credential/consult-model → `~/.pi/agent/models.json`. The `-e` extension file is generic plumbing too — **never per-repo logic. Edit the GLOBAL template, never `pi-runner/run.mjs` directly.**
- **Escalation trigger = the artifact contract** — the only empirically-trustworthy signal (self-confidence is not, per the research above).

## CHANGES TO ADD — only the fragile / open-problem surfaces, in priority order
1. **Per-node tool gating** — `--tools` / `--exclude-tools` (pure flag, no extension, headless-confirmed). Shrinks the "wander surface" behind BOTH the contamination class AND the preflight loop. **Easiest win; do first.**
2. **Escalation / consult gate** — per-node `--model`/`--provider` override + `classifyFailure()` over signals the driver ALREADY computes (`contractMissing` / `killedRepeat` / `killedTimeout` / `!parsed`). Driver-side, **no extension**. Cheap default fails a *verified* check → consult a stronger, different-family model with the failure evidence (not a blind retry). Full criteria + the 6 code changes are in the pass-2 design above.
3. **`submit_result` typed tool** (`terminate:true`; read `details` off `tool_execution_end`) — replaces the #1-fragile fenced-JSON parser with a real typed return. Needs a generic `-e` extension (ships with the template like `providers/coding-plan.ts`; an explicit `-e` still loads under `--no-extensions`). **Spike required:** does qwen reliably emit the tool call headless, and does pi re-prompt on bad args?
4. **`pi.on("tool_call", …{block:true})` owned-paths sandbox** — fixes the OPEN contamination class; strictly better than the soft self-report AND the planned post-hoc `git diff ⊆ owns` gate (it PREVENTS the bad write rather than DETECTS it). Same `-e` extension as #3; verified headless via `examples/extensions/permission-gate.ts` (`!ctx.hasUI` branch).

## DECISION — the cross-family escalation target
`cp` (DashScope) = `qwen3.7-max` (top tier, our default) + `qwen3.7-plus` (cheaper) — **both non-reasoning, NO upward headroom inside `cp`.** So escalation cannot stay in-provider. **DECISION: route cross-family to a second provider — `minimax / MiniMax-M3`** (reasoning:true, 1M ctx), now wired + live-verified in `~/.pi/agent/models.json`. The two-directional lever:
- **Down:** demote purely-mechanical nodes to `qwen3.7-plus` (cheaper).
- **Up:** escalate capability-class failures cross-family to `MiniMax-M3` (reasoning — exactly what loop/timeout/contract failures need).

## Build sequence (decision)
1. **Tool-gating (#1)** — easiest, biggest contamination/loop-surface reduction, pure flag.
2. **Escalation gate (#2)** — driver-side; target already wired; instrument `n.escalated` (feeds Hermes: a wave that escalates every run is a SKILL flaw, not a model flaw).
3. **`submit_result` + owned-paths sandbox (#3, #4)** — one shared `-e` extension; spike qwen-headless first.
Each lands in the **global template** first, then `cp` to `pi-runner/`, then is validated by a **real pi run** (`--until all --debug`) on a deliberately-derailed node — per CLAUDE.md, an engine edit is only PROVEN by a clean-room run + inspecting the artifact, not by tsc/extract-green.

## Status flag
- node-timeout default reconciled to **1800s** in `run.mjs` (some older files say 600 — fix on sight).
- Escalation gate: designed + target wired + live-verified; **gate code BUILT 2026-06-09** (see ## Progress). Real end-to-end qwen-fail→minimax consult still to run.
- Contamination prevention: contract closes the silent-failure half; the in-loop owned-paths block (#4, node-contract ext) now PREVENTS the wander (spike-verified); worktree-per-run remains the physical backstop.

## Progress

### 2026-06-09 — built all four harness additions (#1–#4) + recorded per Hermes
Addressed the pass-2 "DESIGN — merging the retry gate with a consult gate" (lines 204–264) and the pass-3 "CHANGES TO ADD" (lines 288–303).

- **#1 per-node tool gating** — `DRIVER-TOOLS`/`DRIVER-EXCLUDE-TOOLS` markers → `--tools`/`--exclude-tools`. Landed: template `run.mjs` `piArgs()`/`runNode()` (`~/.claude/skills/transform-workflow-to-pi/templates/pi-runner/run.mjs`) → `cp` → `pi-runner/run.mjs`.
- **#2 escalation gate** — built verbatim to the 6-change design: `.env` wiring; `piArgs(file, {model,provider,toolsAllow,toolsDeny})`; `runNode(node, {model,provider,promptPrefix})`; `classifyFailure(n)` (the line-224 table); `runNodeWithEscalation` wrapper the stage loop calls; `DRIVER-NO-ESCALATE` opt-out; non-blind `consultPreamble(n)`. Records `n.attempts[]`/`n.escalated`. `run.mjs:classifyFailure/consultPreamble/runNodeWithEscalation`. Consult target = cross-family `minimax/MiniMax-M3` (resolves the open question at line 262 — `cp` has no upward headroom, `qwen3.7-max` is top tier).
- **#3 `submit_result` typed tool + #4 owned-paths block** — new generic extension `templates/pi-runner/extensions/node-contract.ts` (`defineTool` + `pi.on("tool_call")`), loaded via `-e`, opt-in `PI_RUNNER_CONTRACT_EXT`. Driver reads `result.details` off `tool_execution_end` (`submittedResult`), fenced-JSON parser kept as fallback (addresses token-lever #7, line 200). Owns-block reads `PI_NODE_OWNS` the driver sets per node from `DRIVER-OWNS`.
- **Decision NOT to bridge yet:** prefix-caching/batch levers (lines 194/198, 264) NOT built — needs a DashScope/qwen cache-honor measurement first (logged as open). Per-stage-commit hard owns-gate NOT built — the in-loop block (#4) supersedes its prevention role; the git-diff gate remains for bash-redirect writes the hook can't see.
- **Validation:** `node --check` + extract (14 nodes/10 stages) + dry-run (off & armed) green; **live qwen3.7-max spikes PASS** — extension loads (2.7s), `submit_result` called reliably with `details` at `ev.result.details`, out-of-lane write BLOCKED (not created) + in-lane write OK. Per CLAUDE.md "validation = a real run", the FULL-lesson end-to-end (escalation consult + owns-block over-block check) is the remaining rerun-decision before arming the flags in production.
- **Recorded:** `transform-workflow-to-pi` SKILL (steps 10–11, two laws, reference index) + new `reference/escalation.md` + extended `reference/artifact-contract.md`; `pi-runner/README.md`; `.agents/skill-system-map.md` diary; memory `pi-harness-native-mechanism-decision`.
