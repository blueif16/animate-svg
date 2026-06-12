# W3b — Primitive Gap-Scan → Build

**Lesson:** kptest-greetings-verify
**Date:** 2026-06-08
**Status:** ok (zero gaps — full reuse)

---

## INPUTS READ

| File | Purpose |
|---|---|
| `lesson-data/kptest-greetings-verify/storyboard.md` | Teaching actions per cue — the gap-detection source |
| `lesson-data/kptest-greetings-verify/visual-design.md` | Visual Contract, zones, component reuse map, asset gap |
| `lesson-data/kptest-greetings-verify/brief.md` | Lesson scope and narration notes |
| `lesson-data/kptest-greetings-verify/pedagogy.md` | Discovery per cue, reinforcement reasoning |
| `.agents/TEACHING-ACTIONS.md` | Teaching moves + their `requires` capabilities |
| `.agents/CAPABILITIES.md` | Registry protocol + technique entries |
| `src/capabilities/catalog-digest.md` | Authoritative reuse menu (generated from code) |
| `src/shape-primitives/index.ts` | Barrel exports — what's actually shipped |
| `src/motion-primitives/index.ts` | Motion component barrel exports |
| `src/shape-primitives/iconAssetData.ts` | Generated asset library (90 assets) |
| `src/motion-primitives/DialogueExchange.tsx` | Verified gesture union, emphasis flag, PulseCircle composition |
| `src/motion-primitives/ReadAlongHighlight.tsx` | Verified cursor union, beats, dimPast, highlightColor |
| `src/shape-primitives/literacy.tsx` | Verified LessonIntroCard props (progress, cardFill, title/section/teaser) |
| `.agents/skills/visual-discipline/SKILL.md` | Visual Contract discipline |
| `.agents/skills/kids-eye/SKILL.md` | Viewer-first measurement + zone discipline |
| `public/icons/boy-face.svg` + `girl-face.svg` | Cast assets confirmed on disk |

## OUTPUTS WRITTEN

| File | Purpose |
|---|---|
| `lesson-data/kptest-greetings-verify/primitive-gap-scan.md` | Reuse/gap table + scene-composed element spec + verification checklist |
| `out/kptest-greetings-verify/primitive-checks/greet-dialogue-proxy.png` | Test still: DialogueExchange + IconAsset faces (1920×1080, 148KB) |
| `out/kptest-greetings-verify/primitive-checks/im-emphasis-proxy.png` | Test still: emphasis PulseCircle + weighted RAH cursor (1920×1080, 162KB) |
| `out/kptest-greetings-verify/primitive-checks/recap-multiplicity-proxy.png` | Test still: 3-line RAH with dimPast (1920×1080, 160KB) |
| `out/kptest-greetings-verify/primitive-checks/verification-notes.md` | Per-still verification notes |

## COMMANDS RUN

| Command | Exit | Key Output |
|---|---|---|
| `ls public/icons/ \| grep -E "boy\|girl\|face"` | 0 | boy-face.svg, girl-face.svg confirmed |
| `grep -r "school-gate\|schoolGate" src/` | 0 | No school-gate asset — confirmed scene-composed |
| `npm run registry:check` | 0 | 90 assets, 62 components, 0 undocumented, all gates green |
| `npx remotion still ... --frame=180` | 0 | greet-dialogue-proxy.png rendered clean |
| `npx remotion still ... --frame=324` | 0 | im-emphasis-proxy.png rendered clean |
| `npx remotion still ... --frame=627` | 0 | recap-multiplicity-proxy.png rendered clean |

## KEY DECISIONS

1. **Zero new primitives.** All 7 teaching actions used in the storyboard (`announce-topic`, `stage-the-moment`, `model-target-slow`, `track-read-along`, `invite-echo`, `learner-response-gap`, `spaced-recall`) have their `requires` satisfied by existing catalog entries. The DEFAULT answer — COMPOSE EXISTING — held for every case.

2. **School-gate backdrop: scene-composed, not a primitive.** The visual-design §8 Asset Gap explicitly identifies it as scene-specific context, not a reusable teaching object. No teaching move's `requires` names a "school-gate" capability. Composed from simple SVG shapes (two rect pillars + path arch) in the lesson scene file. If future Unit 1 lessons reuse the gate, promote to `IconAsset` then.

3. **"Your turn" affordance: composition, not a primitive.** The C3/C4 glow is `ReadAlongHighlight.highlightColor` (sunshine) + `dimPast:false` + optional `GlowPulse` wrapping. This is a 2-component composition for a common L2 pattern. Not a gap today; flagged as a convenience opportunity in pipelineFindings.

4. **Proxy stills from kp1HelloGreetings.** Since the kptest-greetings-verify composition doesn't exist yet (built in W4), stills were rendered from the existing `CompleteKp1HelloGreetingsLesson` which uses the identical component set. This verifies the PRIMITIVES at render size (the W3b gate question), not the lesson-specific composition (the W4 gate question).

5. **Intro card: no modification needed.** The existing `LessonIntroCard` handles the topic-intro layout via its internal progress-driven stagger system. The caller passes `title`, `section`, `teaser` as ReactNodes — no topic/copy baked into the primitive.

## ISSUES

None.

## PIPELINE FINDINGS

1. **School-gate as reusable scene asset (low priority):** If ≥2 future Unit 1 lessons reuse the school-gate setting, promote the backdrop SVG to `IconAsset name="school-gate"` via the standard icon pipeline. Currently one-lesson scope makes scene-composed correct.

2. **"Your turn" affordance recipe (medium priority):** The `invite-echo` + `learner-response-gap` pattern uses `ReadAlongHighlight` + `GlowPulse` composition. If this appears in ≥3 L2 lessons, a `YourTurnPrompt` recipe in CAPABILITIES.md or a `ReadAlongHighlight` built-in `prompt` mode could simplify. Not a gap today.

3. **W4 composer note:** The school-gate backdrop must be implemented as a scene-composed SVG group in the lesson scene file. Spec is in `primitive-gap-scan.md` §2 and `visual-design.md` §4 + §8. Composer must wrap it in `<Breathe>` for rule #6.
