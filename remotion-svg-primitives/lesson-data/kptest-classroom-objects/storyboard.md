# Storyboard for kptest-classroom-objects

## Cues

1. id: pencil-reveal
   teachingActions: [model-target-slow]
   narrationIntent: Teacher says the English word "pencil" slowly and clearly, possibly within a Chinese framing phrase that leads with the word.
   requiredVisual: Pencil icon lifting from the pencil-case, with the English word "pencil" appearing big and centered.

2. id: pencil-invite-echo
   teachingActions: [invite-echo]
   narrationIntent: Teacher invites the child to say "pencil" in Chinese ("跟我说：pencil"), followed by a silent wait-time gap for the child to respond.
   requiredVisual: Clear "your turn" cue (e.g., a gesture or icon indicating the child should speak).

3. id: pencil-replay
   teachingActions: [replay]
   narrationIntent: Reuse the audio and visual from pencil-reveal (teacher says "pencil" slowly again).
   requiredVisual: Same as pencil-reveal (pencil icon lifting and word appearing).

4. id: pen-reveal
   teachingActions: [model-target-slow]
   narrationIntent: Teacher says the English word "pen" slowly and clearly.
   requiredVisual: Pen icon lifting from the pencil-case, with the English word "pen" appearing big and centered.

5. id: pen-invite-echo
   teachingActions: [invite-echo]
   narrationIntent: Teacher invites the child to say "pen" in Chinese, followed by a silent wait-time gap.
   requiredVisual: Clear "your turn" cue.

6. id: pen-replay
   teachingActions: [replay]
   narrationIntent: Reuse the audio and visual from pen-reveal.
   requiredVisual: Same as pen-reveal.

7. id: ruler-reveal
   teachingActions: [model-target-slow]
   narrationIntent: Teacher says the English word "ruler" slowly and clearly.
   requiredVisual: Ruler icon lifting from the pencil-case, with the English word "ruler" appearing big and centered.

8. id: ruler-invite-echo-first
   teachingActions: [invite-echo]
   narrationIntent: Teacher invites the child to say "ruler" in Chinese, followed by a silent wait-time gap (first echo).
   requiredVisual: Clear "your turn" cue.

9. id: ruler-invite-echo-additional
   teachingActions: [invite-echo]
   narrationIntent: Teacher invites the child to say "ruler" in Chinese again (additional echo choral cue), followed by a silent wait-time gap.
   requiredVisual: Clear "your turn" cue.

10. id: ruler-replay
    teachingActions: [replay]
    narrationIntent: Reuse the audio and visual from ruler-reveal.
    requiredVisual: Same as ruler-reveal.

11. id: recall-together
    teachingActions: [spaced-recall]
    narrationIntent: Teacher points to each object in turn (pencil, pen, ruler) and invites the child to say the word in Chinese, with a brief wait-time after each point.
    requiredVisual: The three icons appearing together in a row, with a live highlight moving to the currently-spoken object.

## Exposures ledger
exposures: {
  pencil: 3,
  pen: 3,
  ruler: 4
}