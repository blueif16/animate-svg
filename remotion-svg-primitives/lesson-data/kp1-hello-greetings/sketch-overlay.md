# kp1-hello-greetings — Sketch Overlay (Wave 4b)

Hand-drawn teacher-mark overlays, specified in **cue-relative frames** (never
master-timeline absolutes). The composer resolves each `{ cueId, drawOnRelativeStart, … }`
to real frames at scene-build time via `cues[cueId].startFrame` from
`src/lessons/kp1HelloGreetingsLessonTimeline.ts` (`kp1HelloGreetingsCues`).

**Restraint is the rule.** This is a 5-cue lesson → cap = `floor(5 × 0.6) = 3` marks.
This overlay ships **2 marks total**, on the two load-bearing discoveries that the
existing visuals do NOT already carry by themselves. Three of five cues have ZERO marks.

This is a SPOKEN-ROUTINE language lesson — there are no sticks/bundles/rope. The mark
vocabulary discipline (one ink color, draw-on never fade-in, fade-out before cue end,
trace-over-objects-never-sit-in-labels) is unchanged; the targets are the kid figure and
the read-along phrase glyphs.

---

## 1. Sketch language

- **Stroke color:** single ink — `textNavy` (`#24324B`), resolved via `resolveColor("textNavy")`.
  Matches visual-design's "ink: sketch marks" palette row. No second mark color anywhere.
- **Stroke width:** 5 px (FocusPointer uses its own `PointerHandArrow` weight; the underline
  uses TeacherMark's default sketch weight ≈ 5 viewBox units, legible against the read-along row).
- **Opacity:** 1.0 while live; the draw-on `stroke-dashoffset` reveal carries the entrance,
  fade-out carries the exit. Never a CSS fade-IN.
- **Jitter:** TeacherMark baseline hand-jitter (±1.5 viewBox units), kept as-is. `boil` is
  used on the one held climax mark only (see §1.1); the FocusPointer is signal chrome, not
  a TeacherMark, and takes no boil.
- **Animation rule:** every mark enters by stroke-on **draw-on** (never fade-in) and exits by
  **fade-out 8 frames before its cue's end** (`fadeOutRelativeStart` is set per mark so the
  mark is fully gone before the next cue opens).

### 1.1 Boil (decorative-only, ≤ 1–2 per video)

The `intro-self` climax underline stays on screen ≥ 1.5s after draw-on (it traces the held
"I'm" span while the read-along swells), and the cue is calm enough (one bubble, one pulse,
one slow swell) that micro-motion will not compete. → it gets `boil={{ magnitude: 3, holdFrames: 5 }}`
(medium-mark range from `CAPABILITIES.md#sketch-boil`: ~5 Hz, visible craft, not dazzle).
This is the lesson's **only** boiled mark. The FocusPointer is not boiled.

### 1.2 Settle (climax-only, ≤ 1 per video)

The same `intro-self` underline is the lesson's one climax mark, so it carries the pen-settle:
`settle={{ magnitude: 0.08 }}` (the default 92% → 100% grow over the last 15% of draw-on, from
`CAPABILITIES.md#sketch-settle`) — it lands like a teacher lifting the pen at the end of one
deliberate stroke under /aɪm/. No other mark settles (the FocusPointer reveals via its own
`EASE.enter` and is short-lived chrome).

---

## 2. Per-cue mark table (CUE-RELATIVE frames; 30 fps)

| cue id | mark? | mark type | anchor (zone-aware) | drawOnRelativeStart | drawOnDuration | fadeOutRelativeStart | purpose |
|---|---|---|---|---|---|---|---|
| intro | **n** | — | — | — | — | — | Title carries "topic", two faces carry "cast" (visual-design one-signal). Nothing to point at yet — no English word shown. A mark here would be decoration. |
| meet-hello | **y** | `FocusPointer` (signal-focus-pointer) | point AT the LEFT speaking kid: `anchorX≈520, anchorY≈430` (top of `zone-kid-left`), `direction="down"` so the pointer sits ABOVE the figure in `zone-marks` and never enters `zone-bubble-left` or a face | 9 (≈0.3s after the wave begins — `onsetOffsetFrames` style; first speaker reveal) | reveal via `EASE.enter` (FocusPointer owns its onset) | `cueEnd - 8` (FocusPointer auto-fades before `cueEndFrame`; pass `cueEndFrame=cueOf("meet-hello").endFrame`) | Direct the eye to WHICH of the two kids is speaking, the FIRST time a single speaker is singled out. The wave + bubble say "greeting with this word"; the pointer adds the distinct signal "it's HER, the left one." (visual-design names this the one likely mark.) |
| intro-self | **y** | `TeacherMark kind="underline"` | **span** under the "I'm" read-along segment in `zone-readalong` — trace UNDER the glyph row, not over it: `start={{x: imSegLeftX, y: readAlongBaselineY + 14}}`, `end={{x: imSegRightX, y: readAlongBaselineY + 14}}` (composer reads the "I'm" segment's measured x-extent from `ReadAlongHighlight`; the underline sits ~14 px BELOW the baseline so it never collides with the glyphs — anchor is in `zone-readalong` only as an UNDER-trace, mark is in `zone-marks`) | 12 (after the bubble pops and the read-along swell on "I'm" begins, so the underline grows WITH the swell, not before it) | 18 (slow, deliberate single stroke — this is the climax mark, drawn unhurried) | `cueEnd - 10` (held through the swell, then fades before recap) | Trace /aɪm/ as ONE continuous span — the pedagogy match-the-spoken-count-for-sound rule: "I'm" is one syllable, one held unit, NEVER two ticks. The coral PulseCircle (composer-owned) says "pay attention HERE"; the underline says "this is ONE unbroken beat, read it as one." Distinct signal from the pulse — not duplication. The lesson's single climax mark (boil + settle). |
| part-goodbye | **n** | — | — | — | — | — | Symmetric beat — BOTH kids wave, two bubbles, read-along sweeps the farewell. There is no single focal kid to point at; a pointer toward "both" carries no signal. Parting is self-evident. No mark. |
| recap | **n** | — | — | — | — | — | The closing coral PulseCircle (composer-owned, pulse #2/2) already punctuates the arc; the three phrases are lined up by ReadAlongHighlight. A sketch mark on top would be decoration competing with the pulse. No mark. |

**Totals:** 2 marks across 5 cues (cap = 3). 3 cues are mark-free.

---

## 3. Climax sketch

The one mark tied to the visual climax is the **`intro-self` underline under "I'm"**.

- **Co-timing with the teaching primitive:** its `drawOnRelativeStart = 12` and
  `drawOnDuration = 18` are chosen so the underline grows IN STEP with `ReadAlongHighlight`'s
  swell on the single weighted "I'm" `beats[]` entry (the read-along's slowest, biggest sweep).
  The underline must not finish before the swell peaks — both land together, then hold.
- **Anchor co-location:** the underline span's `start.x`/`end.x` are the LEFT and RIGHT
  x-extent of the swelled "I'm" segment as `ReadAlongHighlight` measures it — the mark and the
  highlight describe the SAME span, so they read as one gesture, not two.
- **Settle + boil:** `settle={{ magnitude: 0.08 }}` lands the stroke like a lifted pen at the
  end of draw-on; `boil={{ magnitude: 3, holdFrames: 5 }}` keeps the held stroke alive as a
  teacher's hand during the ~1.5s+ hold. This is the lesson's only mark carrying either prop.
- **Why it earns its place (restraint sentence):** "This mark carries signal *I'm is ONE
  continuous beat /aɪm/*, which is not carried by the PulseCircle (says 'attention here, but
  not how long') nor by the read-along swell alone (says 'this is active', but a 6yo can still
  read a swelling word as two ticks)." The underline is the only mark that asserts the SPAN.

---

## 4. Composer hand-off

Each mark below becomes one instance in `src/lessons/kp1HelloGreetings/…` scene code. The
composer resolves cue-relative → real frames with the SAME math for both:

```ts
const cue = cues[mark.cueId];                       // from kp1HelloGreetingsCues
const drawStart = cue.startFrame + mark.drawOnRelativeStart;
const drawEnd   = drawStart + mark.drawOnDuration;
const fadeStart = cue.startFrame + mark.fadeOutRelativeStart;   // clamp ≤ cue.endFrame - 8
// drawProgress = clamp01( (frame - drawStart) / mark.drawOnDuration )
// opacity      = draw-on (handled by stroke-dashoffset) × fade-out after fadeStart
```

### Mark A — meet-hello first-speaker pointer (FocusPointer, signal chrome)

```tsx
<FocusPointer
  cueId="meet-hello"
  anchorX={LEFT_KID_CX}                 // ≈ 520 (zone-kid-left, layout.ts constant)
  anchorY={LEFT_KID_TOP_Y}             // ≈ 430 (top of zone-kid-left)
  direction="down"                      // pointer sits ABOVE the kid, points down at her
  onsetOffsetFrames={9}                 // ≈0.3s after wave begins
  frame={frame}
  cueStartFrame={cueOf("meet-hello").startFrame}
  cueEndFrame={cueOf("meet-hello").endFrame}
  id="mark-meet-hello-pointer"
/>
```

`FocusPointer` is signaling chrome (marks∩objects allowed), NOT a load-bearing manifest
element — do not register it as load-bearing; it tags itself via `measureProps` so `--measured`
confirms it covers nothing. (See `CAPABILITIES.md#signal-focus-pointer`.)

### Mark B — intro-self climax underline (TeacherMark, climax)

```tsx
const cue = cueOf("intro-self");
const drawStart = cue.startFrame + 12;
const drawProgress = clamp01((frame - drawStart) / 18);
const fadeStart = cue.startFrame + 12 + 18;          // hold begins at draw-end
// opacity fades over the last 10 frames before cue.endFrame (fadeOutRelativeStart = cueLen-10)

<TeacherMark
  id="mark-intro-self-im-underline"
  kind="underline"
  anchor={{
    kind: "span",
    start: { x: IM_SEG_LEFT_X,  y: READALONG_BASELINE_Y + 14 },
    end:   { x: IM_SEG_RIGHT_X, y: READALONG_BASELINE_Y + 14 },
  }}
  drawProgress={drawProgress}
  stroke={resolveColor("textNavy")}
  boil={{ magnitude: 3, holdFrames: 5 }}
  settle={{ magnitude: 0.08 }}
  opacity={fadeOutOpacity}             // 1 → 0 over last 10 frames before cue.endFrame
  {...measureProps("mark-intro-self-im-underline")}
/>
```

### Manifest registration (REQUIRED — so `npm run lesson:check` can see the marks)

- Register **Mark B** (the climax underline) as a `SceneElement` in
  `src/lessons/kp1HelloGreetings/manifest.ts` with `zone: "marks"`,
  `bboxAt(frame)` = the "I'm" underline span padded by stroke width (~5) **plus boil
  magnitude headroom (~5)** so the bbox check accounts for the wobble, and `opacityAt(frame)`
  = the SAME draw-on × fade-out math the scene uses. This is what catches a mark drawing over
  the read-along glyphs in `--measured` before render. The underline anchor sits ~14 px BELOW
  the baseline by design, so a correct manifest entry should report **no** collision with the
  `zone-readalong` glyph row.
- **Mark A** (FocusPointer) is signaling chrome — tagged via its own `measureProps`, NOT
  registered as a load-bearing manifest element (per `CAPABILITIES.md#signal-focus-pointer`).

---

## 5. Self-check (per skill §"Self-check")

1. **Restraint sentence — every mark passes.**
   - Mark A: "carries *which of the two kids is speaking*, not carried by the wave/bubble alone
     when the eye has two figures to choose from at the first single-speaker beat." ✓
   - Mark B: "carries */aɪm/ is ONE continuous beat (span)*, not carried by the attention-pulse
     nor by the swell, which a 6yo can still read as two ticks." ✓
2. **Cue-relative frames only.** No master-timeline absolute appears anywhere above; every frame
   is `drawOnRelativeStart` / `drawOnDuration` / `fadeOutRelativeStart` resolved via
   `cues[id].startFrame`. ✓
3. **Anchors respect zones (kids-eye §1.5).** Mark A sits in `zone-marks` ABOVE the figure
   (`direction="down"`), never inside `zone-bubble-left` or a face. Mark B traces ~14 px BELOW
   the read-along baseline — it under-traces `zone-readalong` (allowed: marks may trace over
   objects) but never SITS ON the glyphs. Neither mark enters `zone-title` or `zone-caption`. ✓
4. **Total marks ≤ floor(5 × 0.6) = 3.** Ships 2. ✓
