# W3b — Primitive Build — kptest-fenyuhe-six

## INPUTS READ

- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/brief.md` — knowledge point (6的分与合), continuity directive (reuse dot / part-whole primitives; same 分/合 motion vocabulary as 5), out-of-scope fence (no +/−/=, no counting past six, only 6).
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/storyboard.md` — 9 cues, each tagged with its teaching actions. Used as the input to the teaching-driven REUSE/GAP diff.
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/visual-design.md` — Visual Contract §1, kids-eye measurement block §0, zones §0.5, palette/motion §3, REUSE map §4, anti-patterns §5, audits §6, continuity §8, hand-off §10.
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/pedagogy.md` — discovery per cue, reinforcement plan (model ×3, conserve ×3, learner-response ×1, reveal ×1, spaced-recall ×1), audit checklist.
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/audio-cues.json` — sound manifest (bed + per-cue SFX); referenced for awareness, not for primitive needs.
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/pipeline.json` — composition / fps / output paths.
- `/Users/tk/.agents/skills/visual-discipline/SKILL.md` — read in full; the contract mechanics (Visual Contract, one-metaphor, container-earns-existence, occupancy, semantic groups, color channel, text budget, render-and-self-critique) and the W3b-owned zone work (cue-relative frames, identity-preservation across transformations) were applied.
- `/Users/tk/.agents/skills/kids-eye/SKILL.md` — read in full; the §1 measurement block + §1.5 zones (declared by W2a; verified by this scan) + §4 identity-preservation (verified by this scan — six `<UnitBlock variant="dot">` instances identity-preserved across the whole video) + §5 self-check (run in §6 of the gap-scan) + §6 "two pictures, one teaching object" (the lesson's three splits are sequential states of the SAME six dots, not stapled panels).
- `/Users/tk/.agents/CAPABILITIES.md` — read in full; the protocol for "no new primitive" (a gap is only real if NO move's requirement is satisfied) and the moving-hold `<Breathe>` wrap convention were applied.
- `/Users/tk/.agents/TEACHING-ACTIONS.md` — read in full; the move menu + each move's `requires` (audio | visual/layout | component) drove the §1 demand list and the §2 REUSE/GAP diff.
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/src/capabilities/catalog-digest.md` — **the** authoritative reuse menu. Code-generated, drift-gated, never hand-edited. 63/63 catalog entries have hand-authored prose. This is the ONLY inventory source consulted for the REUSE/GAP diff (per the W3b protocol: "decide REUSE/GAP from catalog-digest ONLY, do NOT open primitive source for the scan"). Did NOT read `src/shape-primitives/*` or `src/motion-primitives/*` source during the scan.

## OUTPUTS WRITTEN

- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/primitive-gap-scan.md` — the REUSE/GAP table (8 REUSE rows, 0 GAP rows), the resolution of the visual-design §4 recap hedge (`RecapSpotlight` exists; use it), the title/intro layout (designed here per W3b's owned scope), the hardest-frame pre-verification note, and 2 pipeline findings (workflow backlog).
- This log file.

No files were written outside the declared owned paths.

## COMMANDS RUN

- `ls -la /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/` → confirmed the upstream artifacts exist (brief, storyboard, pedagogy, visual-design, audio-cues, audio-captions, pipeline, sound-asset, _logs/).
- `ls -la /Users/tk/Desktop/animation-test/remotion-svg-primitives/src/shape-primitives/ /Users/tk/Desktop/animation-test/remotion-svg-primitives/src/motion-primitives/ /Users/tk/Desktop/animation-test/remotion-svg-primitives/src/component-gallery/ /Users/tk/Desktop/animation-test/remotion-svg-primitives/src/capabilities/` → confirmed the barrel layout (asset, counting, iconAssetData, index, interaction, literacy, shared, sketch in `shape-primitives/`; the catalog-digest, primitive-registry, schema, etc. in `capabilities/`). **Did not read** any of these source files — the W3b protocol forbids source reads during the scan.
- `ls -la /Users/tk/Desktop/animation-test/remotion-svg-primitives/scripts/registry/` → confirmed the registry scripts (`build-registry.mjs`, `catalog-digest.mjs`, `check-gallery.mjs`, `drift-report.mjs`, `schema-check.mjs`, etc.) are present; not invoked because no registry changes are needed (no new exports).
- `ls /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/_logs/` → confirmed the _logs directory; this entry is the W3b log.

## KEY DECISIONS

1. **No gap. Pure REUSE.** Every demand in §1 of the gap-scan (8 unique component-level demands) is satisfied by an existing catalog entry. The lesson will be built from 8 registered primitives: `LessonIntroCard`, `LabelCallout`, `UnitBlock variant="dot"`, `PartWholeComposer`, `RecapSpotlight`, `Breathe`, `TeacherMark`, `PopIn`. The W3b protocol's "default = compose existing primitives" holds.

2. **`RecapSpotlight` is the recap primitive — the visual-design's §4 hedge resolves in favor of REUSE.** The visual-design said "if the W3b gap-scan later decides to ship a `RecapSpotlight` primitive, that is its call (not W2a's)." The W3b scan confirms the primitive ALREADY exists in the catalog, with its useWhen literally reading "Drives 6的分与合's recap (1+5 → 2+4 → 3+3, the live highlight follows the spoken item)." The composer reaches for `<RecapSpotlight currentHighlight={i} items={[...]} ringCenter={[cx,cy]} ringRadius={r} />` — pre-positioned items per sub-beat, `currentHighlight` driven by the cue's `startFrame + offset` (NO frame literals). The hand-rolled per-cue color override path is no longer needed.

3. **Title layout designed here, per W3b's owned scope.** The visual-design §4 prescribed `<LessonIntroCard title="6的分与合" cardFill={null} ...>`. The W3b node filled in the full prop set: `cardStroke={null}` (no border), `titleSize={120}` (matches the visual-design's title-target), `titleColor={theme.colors.textNavy}` (matches the palette), `accentColor={theme.colors.coral}` (the write-on accent underline; matches the Visual Contract's coral-as-action-accent), `underline={true}`, `section=""`, `teaser=""` (zone-title holds the title alone; no eyebrow, no teaser). The `cardFill={null}` declaration is the load-bearing line: the cream canvas stays the only background (per the Visual Contract's `decoration-budget = 2 surfaces total`).

4. **`UnitBlock variant="dot"` × 6 is the six dots** (per the catalog's useWhen: "Showing 1-10 place-value units as cubes, dots, chips, or a segmented rod, optionally stacked, with a value label"). The lesson creates the six React instances ONCE in the scene file; the cluster layout is driven by `PartWholeComposer`'s `partition` + `mode` per cue. The six dots are identity-preserved across the whole video per `kids-eye` §4.

5. **`PartWholeComposer` covers every modeling + conservation + recap cue.** Mode coverage: `mode="split"` for the 1\|5, 2\|4, 3\|3 modeling beats and the recap's per-step 1\|5 → 2\|4 → 3\|3 cycle; `mode="merge"` for the conservation beats (1+5→6, 2+4→6, 3+3→6). The `mode="enumerate"` mode is NOT used (the recap is sequenced `split` calls + `RecapSpotlight`, not a tight 列举 walk — per the visual-design's per-cue motion-budget table). The composer drives `partition: {left:1\|2\|3}` per modeling cue, and `atFrame = cues[id].startFrame + offset` (NEVER a literal).

6. **`Breathe` wraps the six-dot group and (when held) the bond-glyph group** with `bpm=15`, `amplitudeScale=0.005`, distinct `phaseSeed` per group ("kp6-dot-group", "kp6-bond-glyph-*") — per `CAPABILITIES.md#magic-fx-library` `<Breathe>` "moving-hold wrap convention" + Visual Contract §1 re-engagement / rule-of-#6 ("no truly frozen frames"). The recap at cue 9 is the re-engagement beat that breaks the long modeling+conservation stretch (cues 2-6).

7. **No `+` / `=` / count-badge / chrome-card** — per the visual-design §5 anti-patterns and the brief's out-of-scope fence. The bond glyph "一和五" / "二和四" / "三和三" / "合" is the only numeral in the picture (per `kids-eye` §2 "one element, one unique signal"). The dots count themselves; no `<CountStepIndicator>` above individual dots.

8. **The `motion="bouncy"` accent moment is cue-split-3of3's "三和三" bond-glyph appearance** — the one bouncy entrance per video (per `CAPABILITIES.md#popin-motion-variants`: "Introduction of a NEW concept — one accent moment per video"). Every other entrance is `motion="snap"` (the default). NO `motion="bouncy"` on the dots themselves — the symmetry IS the discovery, piling effects on it dilutes the climax.

9. **No `+` / `=` / "1+5=6" labels anywhere**, not even in the recap. The brief is explicit: "ONLY 6的分与合"; the bond glyph is "一和五" (Chinese "one AND five"), not "1+5=6".

10. **No new primitive ships; no family file is touched; no `npm run registry:build` is required** (no source changes). `npm run registry:check` is green by inheritance. The Component Gallery's `demoProps.tsx` is unchanged.

## ISSUES

None. The REUSE/GAP diff converged on the first read of the catalog-digest (the catalog is the COMPLETE inventory, and every demand had a clear catalog match). No source-read → no surprise.

## PIPELINE FINDINGS

(P1, P2 below were also recorded in the gap-scan §7; restating here for the workflow backlog.)

- **P1 — Visual-design's "if the W3b gap-scan later decides to ship" hedge is expensive in context.** A `RecapSpotlight` entry already existed when the W2a was written, but the visual-design author could not know that without diffing against the catalog themselves. The W3b protocol already names catalog-digest.md as the authoritative inventory for W3b, but the visual-design subagent is upstream of W3b and so the hedge was the only safe behavior. Consider exposing catalog-digest.md to the W2a subagent as a READ-ONLY reference (a single line in the W2a prompt: "consult the catalog; a primitive named for your beat may already exist, in which case say 'reuse <name>' instead of 'hand-roll'"). The cost is one file read in W2a context; the benefit is fewer downstream hedges and tighter visual-design specs (the recap would not have been left as a hand-rolled override).

- **P2 — `part-whole-composer`'s `mode="enumerate"` vs the recap's sequenced `mode="split"` calls is worth a one-line catalog note.** The `mode="enumerate"` is the canonical 全列举 routine (the §1.4 routine — walks all ordered decompositions in one continuous motion); the recap's three `mode="split"` calls + `RecapSpotlight` is a different mechanic (a paced per-sub-beat highlight). The current `useWhen` prose doesn't separate the two cases clearly. A one-line clarification in the next registry:build pass would help future W2a authors pick the right mode for their recap beats.

- **P3 (workflow-level, NOT a lesson issue) — the W3b "if there is NO gap, write the reuse table and you are DONE" branch was the right call here.** The protocol is well-designed: it says "if the gap-scan is the only output, skip source reads, skip builds, skip registry rebuild, skip the gallery demoProps update, skip the primitive self-check stills." This lesson hit that branch cleanly. The cost of running registry:build / registry:check / check-gallery in the no-gap case is real (each is a node-level +context cost); the W3b protocol's "DONE" exit prevents that. No change needed — filing as a positive confirmation of the protocol's design.

- **P4 — the catalog-digest's 63/63 prose coverage is a real win for W3b.** Every catalog entry has hand-authored `useWhen` prose; the `recap-spotlight`'s prose explicitly names "Drives 6的分与合's recap" — the gap-scan was able to resolve the visual-design's hedge in one read. The 63/63 ratio is the right target for the registry; if it drops, the W3b scan's quality drops with it (the scan would have to read primitive source to fill the gap, and the protocol forbids that during the scan).
