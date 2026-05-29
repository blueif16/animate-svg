# Verification — kp1-fen-yu-he-intro

Wave 6 review. Verdict at bottom.

**Review surfaces used:**
- Primary: `contact-sheet.png` (12-keyframe sheet built by `lesson:check`, covers ALL cues).
- Cross-check via direct MP4 frame sampling at the padded-timeline keyframe offsets in `bbox-manifest.json`.
- Secondary: `kp1-fen-yu-he-intro-contact.png` (auto-generated at end of `lesson:render`) — **see Tooling Bug below**.

**Tooling bug surfaced during review (not a lesson defect).** `kp1-fen-yu-he-intro-contact.png` is unusable as a review surface: its tile midpoints come from the **raw ASR timing** (max frame 1390, total 1465) while the rendered MP4 uses the **padded timeline** (3347 frames over 111.6s). Result: tiles for `fenheshi-intro`…`outro` all sample mid-`he-name` in the padded MP4. `scripts/make-contact-sheet.mjs` reads `kp1FenYuHeIntroAlignedCues` directly instead of the padded `kp1FenYuHeIntroCues`. Flagged for orchestrator — separate from this lesson's pass/fail. The `contact-sheet.png` from `lesson:check` is correct and was used as the primary surface.

---

## §1. Pedagogy audit (per-cue discovery check, padded-MP4 frame samples)

| cue | discovery (pedagogy.md) | rendered? | notes |
|---|---|---|---|
| intro | "lesson has a name — 分与合 — about taking a small group apart and putting back" | ✓ | Mini-preview row + subtitle + 分与合 title + caption visible. |
| fen-show | "5 dots can come apart into two smaller groups" | ✓ | Symmetric cluster split, 2|3 gap clear, no chips/labels (correct). |
| fen-name | "the action has a name — 分 — and parts have counts 2 and 3" | ✓ | Chip 5/2/3 snapped above clusters, 分 term below in zone-label. |
| he-show | "two parts move back together — same picture, reversed" | ✓ | Clusters rejoin, 5 chip held, 2/3 chips faded. |
| he-name | "joining has a name — 合; 分 and 合 are two directions of one picture" | ✓ | Count strip 2↔5↔3 with two-headed arrow + 分/合 terms; emphasis caption coral. |
| **fenheshi-intro** | **"diagram records what you saw — whole top, two short lines, two parts below; called 分合式"** | **PARTIAL FAIL** | 5 at top + 2 diagonal STUBS visible, but **the migrated "2" and "3" part numbers never appear in the diagram positions** at the settled keyframe (frame 1670). The 分合式 records ONLY the whole; the kid sees an incomplete diagram and cannot read it as "5 separates into 2 and 3." Load-bearing discovery FAILS. |
| **fenheshi-read** | "diagram reads top-down (分成) and bottom-up (组成)" | **FAIL** | Sweep mark is rendered far to the LEFT of the diagram (bbox x=181, w=18 — nowhere near the diagram at x≈500–780). The "5" + diagonal stubs are still missing parts. The reading-direction signal does not land on the diagram it claims to read. |
| five-1-4 | "5 can also split as 1 and 4" | ✗ (partial) | New (1,4) diagram draws correctly at the right slot; the dimmed leftmost diagram intended to be (2,3) shows only "5 + stubs" without "2"/"3" — kid sees one full diagram next to an empty stub. |
| five-3-2-and-4-1 | "five has four splits total" | ✗ (partial) | (3,2) and (4,1) draw fully; (1,4) dimmed-but-complete; the leftmost (2,3) still shows only "5 + stubs" — only THREE diagrams read as complete, breaking the "four splits" discovery. Underline drawn across all four. |
| outro | "three things — 分, 合, four splits — co-located" | ✓ | Replay strip with 分/合 + four MINI diagrams (these render correctly, all four parts visible: 23 / 14 / 32 / 41) + "5 的分与合" title. The mini-row reveals what the main row should have looked like. |

§1 pedagogy gate: **FAIL on the load-bearing cue.** `fenheshi-intro` is the moment a picture becomes a symbol; the symbol shipped without its parts.

## §2. Visual Contract conformance

| element | spec | observed |
|---|---|---|
| 5-dot row identity | persists fen-show → fenheshi-intro at 0.25 opacity | ✓ persists; dims correctly. |
| chip-whole-5 | migrates from zone-chips into top of zone-diagram | ✓ ends at (594, 174). |
| chip-part-2, chip-part-3 | migrate from zone-chips into bottom-left/right of zone-diagram | ✗ **MISSING from rendered diagram positions** (not in bbox-manifest's `fenheshi-intro:settled` element list either — only `chip-whole-5` is listed there). |
| diagram-23 (main) | whole-on-top + 2 diagonals + 2 parts | ✗ parts not visible (manifest lists `diagram-23` as a unit but the rendered output shows only 5 + stubs). |
| diagram-14, diagram-32, diagram-41 | identical species, different parts | ✓ all three render with parts visible. |
| coral coral on connecting lines | optional accent | ✓ navy diagonals shipped (within contract). |
| settle sparkle / bouncy accent | one accent total | unclear from stills; not visible at sampled frames (likely fired briefly). |
| outro mini-diagrams (23, 14, 32, 41) | shrunk row, all four complete | ✓ all four show whole + parts + diagonals. |

Off-zone placement: the `分合式` term in zone-label (y≈566) is **occluded by the caption ribbon** (zone-caption, y=640 declared but visually the pill extends upward) in the `fenheshi-intro:settled` frame — see frame 1670: "分合式" pokes above the pill but its lower half is covered by the caption. This is a zone-label vs zone-caption collision the bbox-manifest does NOT catch (manifest reports collisionCount: 0).

## §3. Identity-invariance check

- **Dots fen-show vs he-show**: ✓ identical orange `colors.reward`, identical 84 px diameter, same instances.
- **Chips "5"/"2"/"3" migration into diagram**: ✗ **FAIL**. The "5" migrates and is visible at top of diagram. The "2" and "3" appear to leave their zone-chips positions but **never land in zone-diagram part positions** at the settled frame. This is exactly the load-bearing risk visual-design §7.3 flagged HIGH for Wave 3. The composer either (a) animates them out-of-frame, (b) sets opacity to 0 mid-migration, or (c) loses their target anchors. Without an instance-preserving migration, the kid sees "the chip disappeared and a new diagram appeared without its parts" — exactly the failure mode kids-eye §4 forbids.

## §4. Sketch-overlay realization (3 marks expected)

1. **mark-fenheshi-read-downward** — drawn at frame ~2010. ✗ **Anchored to the wrong position**. Mark bbox is (181, 279.5, 18, 161) — left edge of canvas. The diagram is centered at (640, 320). Anchors `anchors.whole` / `anchors.partsMidpoint` resolve to coordinates that bear no relation to the rendered diagram, suggesting the layout's `getFenHeDiagramAnchors` returns the WRONG coordinate space (perhaps the un-translated FenHeDiagram local space, not the composition-pixel space the spec assumes).
2. **mark-fenheshi-read-upward** — same wrong position (also bbox 181, 279.5).
3. **mark-five-splits-underline** — ✓ correctly drawn across all four diagrams (bbox x=72 to x=1208, y=479).

Two of three TeacherMark beats DO NOT land on the diagram they're meant to read. The directional reading signal is broken.

## §5. bbox-manifest

- `summary.collisionCount`: **0** (no flagged collisions).
- **However**: the visual collision between `term-fenheshi` (zone-labels, y=566.4, h=67.2 → bottom edge at 633.6) and the caption ribbon (which renders as a pill above zone-caption y=640) is NOT caught — these elements overlap visually but the manifest's `collisions` only checks declared bboxes. The caption pill's actual rendered top edge lies inside zone-labels. Manifest is silently wrong here.
- The bbox-manifest also lists `diagram-23` as an opaque unit at (500, 170.2, 280, 299.6) — but visually that diagram's part numbers are missing. The manifest does not validate that a diagram's CHILD glyphs render; it just trusts the parent bbox. Hidden defect class.

## §6. ASR / narration sanity

- `gemini-voice.json.transcriptText` mostly matches script (one ASR error: `分合适` for `分合式` — non-blocking, audio is correct). Final cue's transcript misheard `一` as `言` — also non-blocking, audio plays the script.
- All ten cues have `matchScore ≥ 0.9` per timing module — well above the 0.8 fall-back threshold. No narration swaps were triggered.
- Captions match `script-cues.json` exactly; caption ribbon visible at every sampled frame; emphasis cues (he-name, fenheshi-intro) correctly use coral text on warm pill.
- Audio plays once over frames 8..1473 (raw ASR span); hold frames 1473..3347 are silent — matches `kp1FenYuHeIntroLessonVoiceoverSpans` spec.

## §7. Final verdict — **FAIL**

The lesson teaches `intro` through `he-name` correctly and the `outro` recap holds together. But the load-bearing cue (`fenheshi-intro`) ships an incomplete diagram — the picture-becomes-symbol moment of the entire video does not deliver its symbol. The downstream cues that depend on a complete (2,3) diagram (`fenheshi-read`, `five-1-4`, `five-3-2-and-4-1`) inherit the missing parts and the sketch-overlay sweeps anchor to the wrong coordinates. KP1's claim "5 separates into 2 and 3" is never recorded in the diagram the lesson exists to teach.

### Top 3 bugs (priority order)

1. **Part-chip migration loses the "2" and "3" glyphs.** In `fenheshi-intro` and every later cue showing the (2,3) diagram, the part numbers are absent. Suggested fix: audit `Kp1FenYuHeIntroLessonScene.tsx` migration of `chip-part-2` / `chip-part-3` — likely either their target positions are off-canvas, their opacity ramps to 0 by mistake, or the FenHeDiagram primitive's part-slot positions don't match the chips' migration endpoints. The bbox-manifest must add child-element registration so the absence is caught next time.
2. **TeacherMark anchors in `fenheshi-read` resolve to (181, 280) — left edge — instead of the centered diagram (~640, 320).** The sweep marks are visually orphaned from the diagram. Suggested fix: `kp1FenYuHeIntroLayout.ts`'s diagram anchor accessor must return composition-space coordinates that include the diagram's centered translation; verify `anchors.whole` and `anchors.partsMidpoint` against the actual rendered diagram center, not the FenHeDiagram's local origin.
3. **Caption pill occludes the `分合式` term in zone-labels.** The `term-fenheshi` element at y≈566 (bottom 633) is overlapped by the caption ribbon's actual rendered height. Suggested fix: raise term-label y-anchor above 540 OR shrink the caption ribbon's pill height OR cross-fade them out of phase. The bbox-manifest should declare the ribbon's true rendered bbox and add a collision check against zone-label.

### One-sentence pedagogy §1 score for `fenheshi-intro`

The lesson's load-bearing cue settles with only the whole "5" plus two diagonal stubs and no part numbers — the diagram records WHAT-from-the-dot-row only at the level of the whole, never recording the discovery (5 separates into 2 and 3), so the picture-becomes-symbol transition fails on the very moment the video exists to deliver.
