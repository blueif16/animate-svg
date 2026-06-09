# W2a — Visual Design Log

## INPUTS READ

| File | Purpose |
|---|---|
| `.agents/skills/kids-eye/SKILL.md` | Viewer-first discipline — measurement block, zones, finger-cover, identity-invariant |
| `.agents/skills/visual-discipline/SKILL.md` | Visual Contract mechanics — one-metaphor, container audit, occupancy, motion-budget |
| `.agents/skills/early-childhood-visual-taste/SKILL.md` | Palette, typography, motion vocabulary, sketch tone |
| `lesson-data/kptest-greetings-verify/brief.md` | Lesson brief — audience, KP, the one beat, continuity |
| `lesson-data/kptest-greetings-verify/pedagogy.md` | Per-cue discovery, focal, reinforcement plan |
| `lesson-data/kptest-greetings-verify/storyboard.md` | Per-cue teaching actions, required visuals, capability gap flags |
| `.agents/TEACHING-ACTIONS.md` | Move vocabulary — requires constraints (announce-topic, model-target-slow, etc.) |
| `.agents/CAPABILITIES.md` | Capability registry — motion vocabulary, PopIn variants, sketch, Breathe, etc. |
| `src/capabilities/catalog-digest.md` | Registered primitive/component inventory — 62 entries, 90 icon assets |
| `src/theme.ts` | Confirmed composition = 1280×720 @ 30fps |
| `src/lessons/kp1HelloGreetings/layout.ts` | Prior greetings lesson layout — validated zone geometry at 1280×720 |
| `src/motion-primitives/DialogueExchange.tsx` | DialogueExchange prop surface — confirmed gesture, emphasis, speaker types |
| `lesson-data/kptest-greetings-verify/pipeline.json` | Pipeline config — confirmed lesson structure |

## OUTPUTS WRITTEN

| File | Description |
|---|---|
| `lesson-data/kptest-greetings-verify/visual-design.md` | Visual Contract: measurement block, 7 zones, palette, motion vocabulary, contract block, per-cue visualMotionSeconds, capability inventory, finger-cover test, identity-invariant analysis, one-metaphor rule, container audit |

## COMMANDS RUN

| Command | Exit | Notes |
|---|---|---|
| `ls lesson-data/kptest-greetings-verify/` | 0 | Confirmed existing files: _logs, brief.md, pedagogy.md, pipeline.json, storyboard.md |
| `ls out/kptest-greetings-verify/_pi/` | 0 | Confirmed prior wave prompts and logs present |
| `find src -name "*.tsx" \| xargs grep -l "boy-face\|girl-face"` | 0 | Confirmed both character assets exist in code |
| `grep video/width/height theme.ts` | 0 | Confirmed 1280×720 @ 30fps composition |
| `cat pipeline.json` | 0 | Confirmed pipeline configuration |
| `head -100 DialogueExchange.tsx` | 0 | Read prop surface for gesture/emphasis/speaker types |

## KEY DECISIONS

1. **Composition 1280×720, not 1920×1080.** The kids-eye skill template says 1920×1080 but the repo standard (`theme.ts video`) is 1280×720. The prior kp1-hello-greetings lesson confirms this. All measurement-block numbers are calculated against 720px short-side. The prior lesson's layout.ts explicitly notes: "visual-design.md's 1920×1080 numbers are %-of-short-side and are translated here."

2. **Zone geometry adapted from kp1-hello-greetings.** The prior greetings lesson validated these zones at 1280×720: characters at y≈272, bubbles at y≈102, read-along at y≈510, caption ribbon at y≈620-720. This visual-design reuses the same proven zone structure with the addition of zone-gloss (L1 translation) and zone-intro-card.

3. **`motion="bouncy"` reserved for meet-hello's first bubble.** ONE accent moment per video (early-childhood-visual-taste). All subsequent bubble entrances use `motion="snap"`.

4. **School-gate backdrop flagged as medium-priority gap.** Not in the IconAsset library. Needs a simple silhouette SVG — low complexity, likely a new `IconAsset name="school-gate"` or a minimal inline SVG. Flagged for W3b gap scan.

5. **Im-echo zoom-in is a scene-level composition technique, not a new primitive.** The composer interpolates the SVG group's scale + translate centered on the "I'm" bubble while dimming siblings. Flagged for W4 composer awareness.

6. **Gloss "你好" shown only in meet-hello.** Per pedagogy: one L1 bridge is sufficient. After the first exposure, the child has the meaning. Subsequent cues don't need it — avoids redundant text (visual-discipline §7).

7. **Identity-invariant cast: same ReactNode instances, not recreated.** The two IconAsset faces are created once and persist from meet-hello through recap-encounter. Only DialogueExchange props (turns, gesture, emphasis) change per cue.

## ISSUES

None. All inputs were present and consistent. The storyboard's capability gap flags align with the catalog-digest inventory.

## PIPELINE FINDINGS

1. **Kids-eye skill template hardcodes 1920×1080.** The SKILL.md §1 measurement block template declares "composition: 1920×1080 @ 30fps (fixed; non-negotiable)" but the actual repo standard is 1280×720. The skill should either parameterize this or note that 1920×1080 is the reference size and %-of-short-side translates to any composition. Minor — W3b layout already handles the translation, but the visual-design agent has to reconcile the discrepancy.

2. **No "school-gate" or generic backdrop primitive in the asset library.** Language/L2 lessons set in a specific location (school gate, classroom, playground) need simple backdrop silhouettes. The 90 existing IconAssets cover objects, characters, and symbols but not scene-setting backdrops. Consider adding a `backdrop` asset category or a lightweight `SceneBackdrop` primitive that takes a name prop.

3. **"Your turn" visual cue has no dedicated primitive.** The `invite-echo` teaching action requires a clear "your turn" signal. Current workaround: compose existing `<PointerHandArrow>` or `<PulseCircle>`. This works but lacks semantic clarity — a small `<EchoPrompt>` primitive (microphone icon + "跟我说：" text slot) would be more reusable across L2 lessons. Low priority — the composition approach is adequate for this lesson.

4. **ReadAlongHighlight `beats` prop for echo timing.** The im-echo cue needs the cursor to DWELL on "I'm" during the slow model, then reset for normal-speed replay, then reset again for the echo invitation. It's unclear whether a single ReadAlongHighlight instance can handle three sequential sweeps with different pacing within one cue, or if the composer needs three instances (one per exposure). Flag for W4 composer to evaluate against the component's actual `beats` + `atFrame` mechanics.
