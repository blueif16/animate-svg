# node: w6-verification — memory
<!-- Leg A · OPTIMIZER-FACING. The optimize loop's MEMORIZE step READS + UPDATES this from run traces.
     NEVER injected into w6-verification's runtime prompt — a node must not see its own failure history.
     Capped (~40 lines, top-loaded: the bottom truncates first). Maintenance contract = the memory-slices skill.
     CURRENT-TRUTH ONLY: correction chains and dated narratives live in git.

     PROVENANCE OF THIS SEED (2026-07-09): no `.pi/` piflow-orchestrated run has reached w6-verification yet
     (every runs/*/…/w6-verification/events.jsonl on disk is 0 bytes) — the pipeline was only ported to the
     piflow template format in commit 2216b43. The two lessons below are instead mined DIRECTLY from real
     pre-piflow production artifacts this same node (the `lesson-verification` skill + a materially identical
     prompt) actually produced: the tier-2 logs + verification.md at
     `remotion-svg-primitives/lesson-data/{kptest-fenyuhe-six,kptest-greetings-verify,kp2-counting-by-tens,
     kptest-compare-more-fewer,kp1-hello-greetings}/`, cross-referenced against `.agents/skill-system-map.md`
     commit f24fe86. Recurrence counts below are grep-verified against those real files, not asserted. -->

_status: 2 lessons (image-blind-review: OPEN, environment-intrinsic · gate-def-false-positive-family: PARTLY MITIGATED)_

## Current behavior
No piflow-orchestrated run has exercised this node yet — no `Current behavior` line can be traced from `.pi/`
telemetry. The lessons below describe the node's PRE-piflow track record under an equivalent prompt/skill.

## Known failure modes

### verdict reads GREEN off proxy JSON while the actual rendered video is bad — the false-green risk
sig: w6-verification::image-blind-review
recurrence: 2 (confirmed instances) + 1 corroborating human-caught incident
[[understand w6-verification]] (no code slice — this is a prose verify node; see criteria.md R1)
**Root:** the node's whole method assumes image-viewing capability (`prompt.md`: "the contact sheet…(Read as
image)"), but the model actually driving this node cannot decode PNGs — confirmed verbatim in TWO real tier-2
logs: `kptest-fenyuhe-six/_logs/w6-verification.md` ("the model in this environment cannot view PNGs… the
verdict below is reconstructed from the contact.json legend") and `kptest-greetings-verify/_logs/w6-verification.md`
("images not renderable by this model"). The reviewer substitutes structural/numeric proxies (contact.json,
bbox-manifest `measured.elements`) — which can all read clean while the actual visual/motion/aesthetic
experience is invisible to the model. **This is not hypothetical:** `.agents/skill-system-map.md` commit
`f24fe86` records "kptest-fenyuhe-six ran W6-GREEN but the rendered VIDEO QUALITY is bad (user's eye)" —a
real, human-caught divergence between this node's verdict and the truth.
**Prevention:** criteria.md R1 now requires the verdict to scope its confidence to what proxy evidence can
actually prove (layout/timing/text-audio/loudness) and explicitly decline a confident aesthetic/motion-feel
claim it never really made — never silently extend proxy certainty into a visual judgment. criteria.md A3
requires the image-viewing capability wall itself to be surfaced in `pipelineFindings` every run, not
privately worked around forever. **Still OPEN:** the underlying capability gap (route this node to a
vision-capable model tier) is a FUNCTIONALITY-level fix outside a prose node's own reach — flag for the
orchestrator/model-routing layer, not a prompt edit.

### known bbox-manifest gate false-positive families recur and are hand-waived per-run, never fixed at the source
sig: w6-verification::gate-def-false-positive-family
recurrence: 4 (grep-confirmed across kptest-fenyuhe-six, kptest-greetings-verify, kptest-compare-more-fewer,
kp1-hello-greetings verification.md)
[[understand w6-verification]]
**Root:** two gate definitions are structurally miscalibrated and every real run has had to manually work
around them: (1) `captionRedundancy` flags jaccard≈1.0 as a defect, but for a read-along/L2 lesson OR a
bond-glyph-named-in-audio lesson, on-screen text being a SUBSET of the spoken phrase is the DESIGN INTENT, not
redundancy; (2) the `contrast` gate samples a single frame that is sometimes the worst-case ENTRANCE-fade
moment (e.g. bond-glyph at ~33% opacity 4 frames into its cue) rather than the held-state value a child
actually reads. `.agents/skill-system-map.md` f24fe86 records both as an explicit "W6 advisory backlog."
**Prevention:** criteria.md R4 requires each waiver to be reasoned through THIS lesson's specific evidence (a
quoted frame/ratio/subset relationship), never invoked as a blanket "known false positive, ignore it" — that
distinction is what stops the SAME exemption phrase from later waving away a genuinely new redundancy or
contrast defect. **Still OPEN at the source:** the gate scripts themselves (`lesson-measured.mjs`) are not
this node's `owns` — a durable fix (held-state contrast re-sampling, a `captionMode:"verbatim"` carve-out) is
upstream/system-level work, tracked here so the per-run waiver discipline doesn't quietly substitute for it.

## Active invariants
- w6-verification creates NOTHING load-bearing (one-node-one-job law) — it may recommend a re-run via the
  punch list, but never edits another node's owned artifacts itself.
- The soft criteria (criteria.md) are JUDGE-FACING only — never read by this node's own runtime prompt.

## Open threads
- Route this node to a vision-capable model tier so R1's proxy-vs-real distinction can eventually be closed
  by CAPABILITY rather than by honest disclosure alone (the honest-disclosure path is necessary but not
  sufficient — it documents the gap, it doesn't close it).
- Fix the `captionRedundancy`/`contrast`-sampling gate definitions at the source (`lesson-measured.mjs`) so
  the per-run waiver stops being the only line of defense.

## History
git log --grep '^skillsys(w6-verification)' ; git log --grep '^optimize(w6-verification)'
