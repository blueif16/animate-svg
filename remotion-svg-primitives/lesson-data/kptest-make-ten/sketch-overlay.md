# Sketch Overlay for kptest-make-ten

## 1. Sketch language
- Stroke color: textNavy (#24324B)
- Stroke width: 2
- Opacity: 1.0
- Animation: stroke-on draw-on (never fade-in), fade-out 8 frames before cue end.
- Boil: not used (decorative-only, not needed)
- Settle: not used (climax-only, not needed)

## 2. Per-cue mark table (CUE-RELATIVE frames)
| cue id | mark? | mark type | anchor (zone-aware) | drawOnRelativeStart | drawOnDuration | fadeOutRelativeStart | purpose |
|--------|-------|-----------|---------------------|---------------------|----------------|----------------------|---------|
| announce-topic | n | - | - | - | - | - | No mark needed; topic introduction is carried by narration and title. |
| bond-9-1 | n | - | - | - | - | - | Visual highlight on empty cell and sliding dot already signal the gap and reveal. |
| bond-8-2 | n | - | - | - | - | - | Same as above. |
| bond-7-3 | n | - | - | - | - | - | Same as above. |
| bond-6-4 | n | - | - | - | - | - | Same as above. |
| bond-5-5 | n | - | - | - | - | - | Same as above. |
| recap | n | - | - | - | - | - | Recap uses synchronized visual and narration; no additional mark needed. |

## 3. Climax sketch
No climax mark selected. The visual completion of the ten-frame (full frame) serves as the climax for each bond cue and is already highlighted by the sliding dots reveal.

## 4. Composer hand-off
No <TeacherMark> instances are to be inserted into the scene. All cues rely on existing visuals and narration for load-bearing signals.