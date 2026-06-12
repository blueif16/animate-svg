# Primitive Gap Scan for kptest-fenyuhe-five

## Teaching Actions and Required Components

| Teaching Action | Required Component(s) | Existing Component | Reuse/Gap | Notes |
| --- | --- | --- | --- | --- |
| announce-topic | LessonIntroCard | LessonIntroCard (literacy) | REUSE | Use for topic title "5的分与合" |
| model-target-slow | large glyph / DialogueExchange emphasis turn | LabelCallout (counting) | REUSE | Use LabelCallout to display bond glyph big and centered; can also use DialogueExchange for emphasis turn if needed |
| reveal | None (visual/audio) | N/A | N/A | Implement via animation of dot groups using CountableObject and motion primitives |
| invite-echo | clear "your turn" cue | LabelCallout (counting) | REUSE | Use LabelCallout to display prompt text (e.g., "你的 turno") |
| learner-response-gap | clear "your turn" cue through gap | LabelCallout (counting) | REUSE | Same as invite-echo; cue spans the silent gap |
| spaced-recall | recap stack + single live marker | ReadAlongHighlight (motion) | REUSE | Use ReadAlongHighlight to sweep highlight across items for recall |

## Visual Contract Cross-Check
All proposed primitives fit within the defined zones:
- LessonIntroCard, LabelCallout for bond glyph and prompt → zone-labels
- CountableObject for dots → zone-objects
- ReadAlongHighlight for recall sweep → zone-objects (highlight moves over dots)
No primitives violate zone boundaries.

## New Primitives Built
None. All required capabilities are satisfied by existing primitives.

## Registry Status
No new primitives to register; existing primitives are already in the catalog.