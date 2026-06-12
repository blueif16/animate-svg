# kptest-fenyuhe-five Sketch Overlay

Each mark is specified in cue-relative frames (use <TeacherMark> + boil from CAPABILITIES.md).

## 1. Sketch language
- Stroke color: `textNavy` (theme)
- Stroke width: `4`
- Opacity: `0.92`
- Jitter: default magnitude (1.5 viewBox units) as applied by TeacherMark when boil is omitted.
- Animation: stroke-on draw-on (never fade-in), fade-out starts 8 frames before cue end.

## 2. Per-cue mark table (CUE-RELATIVE frames)

| cue id | mark? | mark type | anchor (zone-aware) | drawOnRelativeStart | drawOnDuration | fadeOutRelativeStart | purpose |
|---|---|---|---|---|---|---|---|
| cue-announce-topic-split-1of4 | n | — | — | — | — | — | Avoid clutter; the separating dots already carry the split signal. |
| cue-conserve-1of4 | y | label-arrow | start: center of bond glyph "合" (zone-labels); end: center of dot groups combining into five (zone-objects) | 19 | 24 | 44 | This mark carries signal 'combining', which is not yet carried by the bond glyph alone; it shows the action of merging groups. |
| cue-split-2of3 | n | — | — | — | — | — | Avoid clutter; the separating dots already carry the split signal. |
| cue-conserve-2of3 | y | label-arrow | start: center of bond glyph "合" (zone-labels); end: center of dot groups combining into five (zone-objects) | 73 | 24 | 98 | This mark carries signal 'combining', reinforcing the conservation principle across different splits. |
| cue-learner-response-gap | n | — | — | — | — | — | Avoid clutter; the invite-echo prompt and silent gap already carry the thinking signal. |
| cue-reveal-answer | y | underline | start: left edge of the one-and-four dot group; end: right edge of the one-and-four dot group (zone-objects) | 2 | 12 | 15 | This mark carries signal 'answer', highlighting the correct split that the child should recognize as the solution. |
| cue-spaced-recap-both | n | — | — | — | — | — | Avoid clutter; the rapid alternation of splits already carries the recall signal. |

## 3. Climax sketch
No settled mark is used; the underline in cue-reveal-answer serves as a climax highlight but without settle animation to avoid over-decoration.

## 4. Composer hand-off
Each mark spec becomes a `<TeacherMark>` instance in the scene. The composer resolves `{ cueId, drawOnRelativeStart, drawOnDuration, fadeOutRelativeStart }` to real frames via `cues[cueId].startFrame`. Anchors are resolved to coordinates using the scene layout: bond glyph center and dot-group center for label-arrows, and group edges for underline.
