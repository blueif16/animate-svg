---
id: sha256:87bdda55074ab82b76174679e49818b662827167becd478eff9e698938d14af6
name: zesty-caramel
title: Stray `</item>` tags leak into every issues[]/pipelineFindings[] string in the structured return
severity: low
status: open
reason: null
sig: setup-scaffold::stray-item-tags-in-return-strings
firstSeen: kp3-tens-and-ones-place-r3
lastSeen: kp3-tens-and-ones-place-r3
attempts: []
---

**What happened (run `kp3-tens-and-ones-place-r3`).** Reading the actual `submit_result` tool-call args from
`.pi/nodes/setup-scaffold/events.jsonl` (not the `run.json` digest, which trims this away): every single string
in both the `issues` array and the `pipelineFindings` array ends with a literal, unexplained `</item>\n`
fragment appended after the sentence — e.g. `"...surfaced in the tier-2 log instead.</item>\n"`,
`"...canonical value remains canonical.</item>\n"`. This pattern is consistent across all 3 `issues[]` entries
and all 3 `pipelineFindings[]` entries in this run's return — not a one-off typo but a systematic leak, as if
the model were following some XML/HTML-list authoring convention (`<item>...</item>`) that bled into what
should be a plain JSON string array.

**Why it's worth tracking (low severity, not blocking).** It does not break JSON validity (the tag is inside the
string, not structural) and does not trip the return-schema gate — this run's actual blocking failure was the
separate, already-tracked `camelLessonId`/`composition` omission. But it does degrade the readability of the one
surface (`issues[]`/`pipelineFindings[]`) that downstream humans and the Hermes fixer loop read to triage
findings, and it is a new observation — not previously named in `memory.md` or `criteria.md`. `prompt.md` itself
contains no `<item>`/`</item>` markup anywhere that would explain where the model picked this convention up from,
so the leak appears to originate purely in the executor's own generation, not a prompt artifact being echoed
back.

**Scope note (separation law).** This issue names and contextualizes the defect only; no fix is proposed here.
