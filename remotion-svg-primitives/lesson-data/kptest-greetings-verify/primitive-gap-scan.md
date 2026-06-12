# Primitive Gap-Scan — kptest-greetings-verify

> W3b artifact. Teaching-driven gap detection: start from the moves, not a drawn layout.
> Cross-referenced: storyboard.md teaching actions → TEACHING-ACTIONS.md `requires` → catalog-digest.md (generated, cannot lie) → source code verification.

---

## 1. Teaching-Action → Capability Cross-Reference

### C0 — topic-intro (`announce-topic`)

| Requirement (from TEACHING-ACTIONS.md) | Source in catalog | Verdict |
|---|---|---|
| `component` = `LessonIntroCard` | `lesson-intro-card` (literacy family, `src/shape-primitives/literacy.tsx`) | **REUSE** |
| Card reads alone first; cast enters after | Sequencing constraint (composer discipline) | N/A — no primitive needed |

**Props intent:** `title`, `section`, `teaser` (caller ReactNodes — bakes no copy). `cardFill` off or omitted (canvas is background). `progress` from `cues["topic-intro"].startFrame + offset`.

---

### C1 — greet (`stage-the-moment` → `model-target-slow` → `track-read-along`)

| Requirement | Source in catalog | Verdict |
|---|---|---|
| `DialogueExchange` turn | `dialogue-exchange` (motion family, `src/motion-primitives/DialogueExchange.tsx`) | **REUSE** |
| Identity-invariant cast (boy-face, girl-face) | `icon-asset` (asset family, `src/shape-primitives/asset.tsx`); assets `boy-face` + `girl-face` exist in `public/icons/` | **REUSE** |
| `gesture: wave` on both turns | `DialogueSpeakerGesture` union: `"none" \| "wave" \| "point-self" \| "point-other"` — `wave` confirmed in source | **REUSE** |
| `ReadAlongHighlight` cursor tracks tokens | `read-along-highlight` (motion family, `src/motion-primitives/ReadAlongHighlight.tsx`); `cursor: "ball"` confirmed | **REUSE** |
| School-gate backdrop | Not in catalog; not a primitive. Scene-composed SVG group (two pillars + low arch) | See §2 |

---

### C2 — im-slow-model (`model-target-slow` → `track-read-along`)

| Requirement | Source in catalog | Verdict |
|---|---|---|
| `DialogueExchange` emphasis turn on "I'm Sam" | `dialogue-exchange` — `turn.emphasis?: boolean` confirmed in source; fires `<PulseCircle>` ring on emphasis turn | **REUSE** |
| `PulseCircle` on /aɪm/ token | `pulse-circle` (motion family, `src/motion-primitives/PulseCircle.tsx`) — composed inside DialogueExchange on emphasis flag | **REUSE** |
| `PopIn motion="bouncy"` on the "I'm Sam" bubble | `pop-in` (motion family, `src/motion-primitives/PopIn.tsx`) — `motion: "snap" \| "bouncy" \| "settle"` confirmed; composed inside DialogueExchange | **REUSE** |
| `ReadAlongHighlight` with beats weight on "I'm" | `read-along-highlight` — `beats?: number[]` (flat per-item duration weights) confirmed; beat weight 3 on "I'm" extends cursor dwell | **REUSE** |

---

### C3 — im-choral-echo (`invite-echo` → `track-read-along`)

| Requirement | Source in catalog | Verdict |
|---|---|---|
| `ReadAlongHighlight` text "I'm Sam", cursor sweeps then holds | `read-along-highlight` — `cursor: "underline"` for variety from C2's "ball" | **REUSE** |
| "Your turn" visual affordance (soft glow) | Composed from `ReadAlongHighlight`'s own `highlightColor` (sunshine) + `activeScale` swell; optionally wrapped in `<GlowPulse>` from FX family | **REUSE** (composition) |
| `GlowPulse` for the invitation glow | `glow-pulse` (FX family, `src/fx/`) — confirmed in catalog | **REUSE** |

---

### C4 — im-learner-gap (`learner-response-gap`)

| Requirement | Source in catalog | Verdict |
|---|---|---|
| `ReadAlongHighlight` cursor:"none" — text visible, cursor inactive | `read-along-highlight` — `cursor: "none"` confirmed in source (`ReadAlongCursor` union includes `"none"`) | **REUSE** |
| Text glowing (sunshine highlightColor) through silence | `ReadAlongHighlight` `highlightColor` prop + `dimPast: false` (past items stay lit in `highlightColorAlready`) | **REUSE** (composition) |

---

### C5 — farewell (`stage-the-moment` → `model-target-slow` → `track-read-along`)

| Requirement | Source in catalog | Verdict |
|---|---|---|
| `DialogueExchange` with gesture:'wave' on both turns | `dialogue-exchange` — gesture prop confirmed | **REUSE** |
| Characters separating (parting motion) | Scene-composed transform (EASE.inOutCubic lerp on x positions) — not a primitive, just a motion curve from `EASE.*` | N/A |
| `ReadAlongHighlight` lines:[["Goodbye","Bye-Bye"]] | `read-along-highlight` — same component, different props | **REUSE** |

---

### C6 — recap (`spaced-recall`)

| Requirement | Source in catalog | Verdict |
|---|---|---|
| Recap stack with three phrases, single live marker | `ReadAlongHighlight` multi-line mode — `lines:[["Hello / Hi"],["I'm Sam"],["Goodbye / Bye-Bye"]]` with `beats` array weighting "I'm" higher, `dimPast: true`, `cursor: "ball"` | **REUSE** |
| Live highlight lands on currently-spoken item only | `ReadAlongHighlight` internal — `cumulativeBeatWindow(index)` drives which item is active; only one active at a time | **REUSE** |

---

## 2. Scene-Composed Elements (Not Primitives, Not Registered)

### School-gate backdrop

**What:** Two simple pillars + low arch establishing the "school gate" context behind zone-characters.
**Why not a primitive:** This is scene-specific context, not a reusable teaching object. No teaching move's `requires` names it. The visual-design §8 Asset Gap explicitly says it "does NOT need to be a registered primitive since it is scene-specific context, not a reusable teaching object."
**Composition:** Simple SVG group:
- Two `<rect>` pillars (~40px wide, ~300px tall each, rounded top)
- One `<path>` low arch connecting pillar tops
- Fill: warm gray / light beige close to cream (`#F0E8D8` or similar from `resolveColor`)
- No text, no signs, no decorative elements (trees, flowers, birds)
- Positioned behind zone-characters (rendered first in SVG z-order)
- Wrapped in `<Breathe originX originY bpm={15} amplitudeScale={0.005} phaseSeed="school-gate" drift={0.5}>` for rule #6
- Active C1–C5; absent C0 (intro card alone) and C6 (recap layout)

### Character approach / parting motion

**What:** Slide-in from off-screen (C1) and parting separation (C5).
**Why not a primitive:** These are caller-owned transform animations driven by `EASE.enter` and `EASE.inOutCubic` respectively. The composer interpolates x/y positions per cue — no reusable primitive is needed for simple eased translations.

---

## 3. Summary Table

| Cue | Teaching Actions | Components Needed | REUSE | GAP |
|---|---|---|---|---|
| C0 topic-intro | announce-topic | LessonIntroCard | ✅ LessonIntroCard | — |
| C1 greet | stage-the-moment, model-target-slow, track-read-along | DialogueExchange, IconAsset ×2, ReadAlongHighlight | ✅ all three | — |
| C2 im-slow-model | model-target-slow, track-read-along | DialogueExchange (emphasis), PulseCircle (composed), PopIn (composed), ReadAlongHighlight (beats) | ✅ all four | — |
| C3 im-choral-echo | invite-echo, track-read-along | ReadAlongHighlight (underline cursor), GlowPulse | ✅ both | — |
| C4 im-learner-gap | learner-response-gap | ReadAlongHighlight (cursor:none) | ✅ | — |
| C5 farewell | stage-the-moment, model-target-slow, track-read-along | DialogueExchange (wave gesture), ReadAlongHighlight | ✅ both | — |
| C6 recap | spaced-recall | ReadAlongHighlight (multi-line + beats) | ✅ | — |

**Total new primitives needed: 0**

---

## 4. Intro Card Layout (W3b owns this per the prompt)

The `LessonIntroCard` normalized intro primitives fit this subject without modification:

- **Section eyebrow:** "PEP English · Unit 1" (or caller-localized equivalent)
- **Title:** "Hello!" (the lesson's anchor word, largest line)
- **Teaser:** "Greet, introduce yourself, and say goodbye in English" (one-line KP teaser)
- **Layout:** Default `LessonIntroCard` centered layout. `cardFill` omitted (canvas cream is background). `progress` derived from `cues["topic-intro"].startFrame + offset`.
- **Stagger order:** eyebrow fade+rise → title fade+rise → teaser fade+rise → accent underline draw-on → settle.
- **Cast does NOT appear** during the intro. Gate backdrop does NOT appear. The card IS the picture.

The existing `LessonIntroCard` primitive handles all of this via its internal stagger system driven by one `progress` prop. No modification or new primitive needed.

---

## 5. Verification Checklist

- [x] Every teaching action's `requires` is satisfied by an existing catalog entry
- [x] All gesture variants used (`wave`, `point-self`) confirmed in `DialogueSpeakerGesture` union
- [x] All cursor variants used (`ball`, `underline`, `none`) confirmed in `ReadAlongCursor` union
- [x] `emphasis` flag on DialogueExchange turn confirmed to fire `<PulseCircle>` ring
- [x] `beats` array on ReadAlongHighlight confirmed to weight per-item dwell
- [x] `dimPast` prop confirmed for recap's single-live-marker requirement
- [x] `IconAsset` names `boy-face` and `girl-face` confirmed to exist in `public/icons/`
- [x] `LessonIntroCard` confirmed with `progress`, `cardFill`, `title`, `section`, `teaser` props
- [x] `PopIn motion="bouncy"` confirmed in `PopMotion` union
- [x] `Breathe` confirmed with `bpm`, `amplitudeScale`, `phaseSeed`, `drift` props
- [x] `GlowPulse` confirmed in FX family
- [x] All `EASE.*` curves used (`enter`, `outCubic`, `inOutCubic`) confirmed in `curves.ts`
- [x] School-gate backdrop: scene-composed SVG, not a primitive (visual-design §8 explicit)
- [x] Zero frame literals: all timing derives from `cues[id].startFrame + offset`
- [x] Zero raw motion literals: all easing uses `EASE.*` names

---

## 6. Pipeline Findings

1. **School-gate as reusable scene asset (low priority):** If future Unit 1 lessons (What's your name? / stationery vocab) also use the school-gate setting, the backdrop SVG could be promoted to an `IconAsset` (`school-gate`) at that point. For now, scene-composed is correct per the "container earns existence" rule — only one lesson needs it.

2. **"Your turn" affordance pattern (medium priority):** The C3/C4 "your turn" glow is composed from `ReadAlongHighlight.highlightColor` + optional `GlowPulse` wrapping. This is a 2-component composition for a common L2 teaching pattern (`invite-echo` + `learner-response-gap`). If this pattern appears in ≥3 lessons, a `YourTurnPrompt` recipe or a `ReadAlongHighlight` built-in "prompt" mode could simplify it. Not a gap today — composition works — but a convenience opportunity.
