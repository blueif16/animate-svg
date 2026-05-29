# kp2v2-counting-by-tens — sketch overlay

Wave 4b spec. One mark, total, for the whole video. All timing is cue-relative — the composer maps to absolute frames via `cues[cueId].startFrame + offset`. No master-timeline literals appear in this file.

The restraint is mandated upstream, not invented here: visual-design §7 risk flag #6 ("Sketch layer: ONE mark in the whole video, Cue 5 only") and §2 motion vocabulary ("Beat 5 only: a single `<TeacherMark kind='vs-mark'>`… restraint over flourish") are explicit. Sketch-layer's job is to respect that ceiling, not to top it up.

---

## 1. Sketch language

- **Ink color.** `colors.textNavy` (`#24324B`). Under the `ink-wash` style overlay, this maps to sumi (`#1F2230`) via the style's ink token — the mark inherits the style's ink automatically; the spec stays palette-token-named, not hex-named.
  - Visual-design §2 mentions an ink-wash vermilion-accent option for this mark. We are NOT taking that option. The vermilion seal-stamp is at most a 5%-frame-area accent reserved for ink-wash signature; if the orchestrator later decides to use it, that is a style-overlay-level decision in `<StylePreset>`, not a teacher-mark choice. The teacher mark itself stays navy/sumi.
- **Stroke width.** 4 px (the default `<TeacherMark>` stroke at 1280×720 — reads as a confident teacher stroke without competing with the tally pill text above it).
- **Opacity.** 1.0 during draw-on hold; ramped to 0 across the fade window.
- **Jitter.** Default `<TeacherMark>` hand-drawn jitter. NO `boil` prop — the mark holds for ~3.5 s after draw-on and ink-wash's calm pacing rules already discourage extra micro-motion on a closing accent (boil is reserved for marks that visibly hold ≥ 1.5 s in a busy cue; this cue is calm and the boil would compete with the tally pills rather than support them).
- **Animation.** Stroke-on draw-on (never fade-in). Fade-out across the last 8 frames before `cueEnd`. No `settle` prop — the vs-mark is a quick two-stroke X, not a climactic curve; the eye does not benefit from a final scale settle on a 2-stroke glyph.

---

## 2. Per-cue mark table (CUE-RELATIVE frames)

| cue id | mark? | mark type | anchor (zone-aware) | drawOnRelativeStart | drawOnDuration | fadeOutRelativeStart | purpose |
|---|---|---|---|---|---|---|---|
| `loose-count-felt` | n | — | — | — | — | — | The ten-badge cascade IS the labor. A mark would underline the labor instead of letting the child feel it — pedagogy §1 says "discovery is felt, not pointed at." |
| `bundle-is-one-count` | n | — | — | — | — | — | The rope + the single "1" badge + the "一个十" label already carry "this is one count of a new unit." Visual-design §4 Cue 2 forbidden list calls out "no sparkle/glow… the new badge value `1` IS the punchline — no chrome." A mark would be chrome. |
| `tens-count-like-ones` | n | — | — | — | — | — | The badge advance 1 → 2 carries the signal. A mark beside badge `2` would be redundant per kids-eye §2 (one element, one unique signal). |
| `pattern-holds` | n | — | — | — | — | — | The badge row reading `1 2 3` IS the visible pattern. Per visual-design §7 #6, marks must be refused here even if instinct says "underline the pattern." |
| `tens-are-the-faster-way` | y | `vs-mark` | span: `(p1, p2)` where `p1` = right edge of `step-tally-ten` (zone-tally) at its centroid y, `p2` = left edge of `step-tally-three` (zone-tally) at its centroid y — a short horizontal span in the gap BETWEEN the two pills, NOT over either pill | `cueLength × 0.55` (after both tallies have settled and the narrator has spoken "十步… 三步") | `~14f` (two strokes of an X, each ~7f — quick teacher hand) | `cueLength - 8` (fade out across the last 8 frames before cueEnd, so the X is gone by the time the scene ends) | Names the comparison the picture is making — "this count-length versus that count-length." Without the X, the two pills sit in parallel like a list; the X says "compare these." Pedagogy Beat 5: the speed difference is the discovery; the vs-mark is the teacher's hand saying "look at this contrast." |

**Total marks across the lesson: 1.** Floor of `cueCount × 0.6` = 3; we are well under (sketch-explainer-layer §"Self-check" #4). Restraint is intentional, not a compromise.

---

## 3. Climax sketch

The Cue 5 `vs-mark` IS the climax sketch. It is the lesson's single accent — the one moment where the teacher's hand leans in and says "compare." Spec:

- **id.** `mark-tens-vs-ones`
- **cue.** `tens-are-the-faster-way`
- **kind.** `vs-mark` — two short crossing strokes (a quick X), the authorized vocabulary for contrast cues (sketch-explainer-layer §"Mark vocabulary").
- **anchor.** `{ kind: "span", start: <right-of-step-tally-ten>, end: <left-of-step-tally-three> }` — span lives in `zone-tally`'s horizontal gap. The mark's stroke extents stay above the two `<StepTally>` pills' y-baselines + ~12 px clearance and below their cap heights — i.e. it occupies the gap, not the pills' silhouettes. Composer resolves the precise `(x, y)` from the StepTally positions in `layout.ts`.
- **zone discipline.** The mark sits in `zone-marks` (full-bleed) but its anchor span lives ENTIRELY within `zone-tally`'s horizontal extent (kids-eye §1.5: "Marks may trace OVER zone-objects… but never sit inside zone-labels"). It does not touch `zone-labels`, `zone-objects`, or `zone-caption`.
- **drawProgress curve.** Cue-relative. The X begins drawing after both StepTally pills have entered and the narrator has named "三步" — the picture's argument is complete, then the teacher's hand crosses it. Approximately the cue's middle-to-last quarter boundary (`drawOnRelativeStart ≈ cueLength × 0.55`, `drawOnDuration ≈ 14f`). The two strokes are sequential — first stroke 0 → 0.5, second stroke 0.5 → 1.0, both with `EASE.outCubic` per ink-wash overrides.
- **fade-out.** Cue-relative, counted backward from `cueEnd`: fade across the last 8 frames before `cueEnd`. Composer expression: `fadeOutRelativeStart = cueLength - 8`. The X is gone by the time the scene cuts.
- **rationale.** Names "compare" — the signal no other element on stage carries. The two `<StepTally>` pills carry their respective counts (10 and 3); the two rows carry their respective lengths; but nothing on stage tells the child that the two pills are TO BE COMPARED rather than read as a list. The vs-mark is the teacher's hand crossing the gap. Without it, Cue 5 reads as "here are two facts"; with it, Cue 5 reads as "10 versus 3" — which is the pedagogical Beat 5 discovery.

---

## 4. Composer hand-off

The composer instantiates one `<TeacherMark>`:

```tsx
<TeacherMark
  kind="vs-mark"
  anchor={{
    kind: "span",
    start: { x: stepTallyTen.rightEdge, y: tallyRowCenterY },
    end:   { x: stepTallyThree.leftEdge, y: tallyRowCenterY },
  }}
  drawProgress={drawProgress}
  // no boil, no settle — see §1
/>
```

Frame resolution (composer):

```ts
const cue = cues["tens-are-the-faster-way"];
const cueLength = cue.endFrame - cue.startFrame;
const drawStart = cue.startFrame + Math.round(cueLength * 0.55);
const drawEnd   = drawStart + 14;
const fadeStart = cue.startFrame + (cueLength - 8);
// drawProgress = clamp((frame - drawStart) / (drawEnd - drawStart), 0, 1)
// opacity = drawProgress until fadeStart, then linearly ramps to 0 across 8 frames
```

Per the sketch-explainer-layer skill §4: register `mark-tens-vs-ones` as a `SceneElement` in `src/lessons/kp2v2CountingByTens/manifest.ts` with `zone: "marks"`, `bboxAt(frame)` = the anchor span padded by stroke width (4 px), `opacityAt(frame)` = the same draw-on × fade-out math above. This is what makes `npm run lesson:check` catch a regression where the mark drifts over a StepTally pill.

---

## 5. Self-check

1. **Restraint principle (kids-eye §2).** The one mark completes the sentence: "This mark carries the signal `compare these two counts`, which is not yet carried by the StepTally pills (they carry the counts themselves), the two rows (they carry the row-lengths), the caption ribbon (it carries the spoken narration), or the bundles/sticks (they carry the unit identity)." Signal is unique. PASS.
2. **Cue-relative frames everywhere.** No master-timeline absolutes. All timings expressed as `cueLength × 0.55`, `drawOnDuration ≈ 14f`, `cueLength - 8`. PASS.
3. **Zone discipline.** Mark lives in `zone-marks`; anchor span lies entirely within `zone-tally`'s horizontal extent. Does not touch `zone-labels`. PASS.
4. **Total ≤ floor(cueCount × 0.6).** 1 ≤ 3. PASS (well under ceiling — restraint, not compromise).
5. **Visual-design §7 #6 honored literally.** ONE mark, Cue 5 only. PASS.
