---
id: sha256:cee13963a206176228f3ca15ba5c0e1b197770ca7760b8ef846d63bee73117a1
name: baked-southern-tomato
title: STATE PROMOTE fields (camelLessonId/composition) computed but dropped from the structured return
severity: critical
status: fix-landed
reason: structural fix landed 2026-07-10 — file-sourced promote takes the model out of the loop; awaiting live-run verification before adopt
sig: setup-scaffold::state-promote-fields-dropped
firstSeen: kp3-tens-and-ones-place-r3
lastSeen: kp3-tens-and-ones-place-r3
attempts:
  - date: 2026-07-10
    actor: human-path fixer (Claude Code main session)
    kind: structural (mechanism, not prompt)
    change: >-
      node.json promote ops re-sourced from @return:camelLessonId / @return:composition to
      pipeline.json:voice.constPrefix / pipeline.json:composition (the SDK file-sourced promote,
      node-lifecycle.ts:940-945 — built for exactly this "deterministic field of a produced file" case);
      camelLessonId/composition dropped from the return schema's required (kept as optional properties);
      prompt.md STATE PROMOTE paragraph rewritten (engine handles it; the model no longer echoes);
      criteria.md C1 restructured to the state-vs-file enforcement.
    rationale: >-
      3 identical recurrences of narrate-but-drop on this model+prompt pairing is an executor adherence
      ceiling (same signature as game-omni's guidance node), not a wording problem. Enforcement preserved:
      promote-of-nothing throws (node → error) + hard-checks promote-fidelity measures state-vs-file.
    verify: >-
      VERIFIED LIVE 2026-07-10, twice, two providers: run count-three-e2e-1 (mmgw/MiniMax-M3) and run
      count-three-glm-1 (nebius/GLM-5.2) both show state.json carrying camelLessonId=kptestCountThree +
      composition=CompleteKptestCountThreeLesson byte-equal to pipeline.json, setup-scaffold ok. The GLM
      run completed the FULL 14-node pipeline on this state (every downstream token resolved). Awaiting
      `optimize adopt` to land resolved.
---

**What happened (run `kp3-tens-and-ones-place-r3`).** The node correctly read `pipeline.json`, correctly
computed `camelLessonId = "kp3TensAndOnesPlace"` and `composition = "CompleteKp3TensAndOnesPlaceLesson"`, and
even narrates both values verbatim inside the free-text `summary` field ("Promoted
`camelLessonId=voice.constPrefix=kp3TensAndOnesPlace` and `composition=CompleteKp3TensAndOnesPlaceLesson`
verbatim from pipeline.json"). But the actual `submit_result` tool-call args, confirmed by reading
`.pi/nodes/setup-scaffold/events.jsonl` directly, carry only `node`/`status`/`outputArtifacts`/`summary`/
`issues`/`pipelineFindings` — no `camelLessonId` or `composition` key anywhere in the payload. The hard
return-schema gate correctly caught this and forced `status=blocked`
(`returnSchemaInvalid: ["/ must have required property 'camelLessonId'", "/ must have required property
'composition'"]`), so the whole 3-node run ended `ok=false` (`totals: {ok:0, failed:1}`).

**Why this is critical, not cosmetic.** Per this node's own criteria (`criteria.md` C1, Required): the return
schema requiring these two fields is the ONLY mechanical enforcement that every downstream wave's file paths
resolve correctly — `camelLessonId`/`composition` are the state channels every later node's generated-module,
timeline, scene, and Complete-wrapper paths are built from. A dropped field isn't a missed nicety; it halts the
entire pipeline at the very first node.

**Recurrence — this is NOT a one-off.** `memory.md` already documents the IDENTICAL signature (same two missing
fields, same narrate-but-drop pattern) on `kp3-tens-and-ones-place-r2`. This run (`-r3`) is the 3rd observed
occurrence with the exact same failure shape, across two separate runs of the same lesson. The hard gate is
working as designed (a fabricated-looking `ok` never gets through), but the underlying executor behavior — a
computed value narrated in prose yet omitted from the structured tool-call payload — keeps recurring, suggesting
a genuine skill/prompt gap for this specific model+prompt pairing rather than an isolated lapse. See `criteria.md`'s
Red-flag exemplar, which is drawn directly from this same recurring pattern.

**Scope note (separation law).** This issue names and contextualizes the defect only; no fix is proposed here.
