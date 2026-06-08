# kp1-hello-greetings — Verification (Wave 6)

**Verdict: YELLOW** — the arc teaches the KP and reads clearly on every teaching beat;
two real defects keep it off GREEN: (1) the INTRO title card is occluded by the cast so
the lesson title is partly unreadable, and (2) the recap closing PulseCircle lands on the
stale MIDDLE phrase ("I'm Sam.") instead of punctuating the live/closing phrase. Both are
targeted, single-element fixes. The LUFS gate is −1.2 LU quiet (cosmetic). The
captionRedundancy gate failure is a known false-positive for a language lesson and is
justified-exempt below.

Reviewed: `kp1-hello-greetings-contact.png` (5×5 action-aware), `bbox-manifest.json`
(linear + measured + gates), `measured-frames/f4,f52,f122,f533,f577.png`,
`primitive-checks/Hardest.png` + `Multiplicity.png`, `climax-still.png`, `recap-still.png`,
`pedagogy.md`, `visual-design.md §1`, `script-cues.json`, `audio-cues.json`, the scene +
layout source. MP4 probed: 607 frames / 20.23s @ 30fps, 1280×720, stereo AAC 48 kHz —
consistent with `contact.json` (totalDuration 607).

---

## §1 per-cue pedagogy audit (does each cue TEACH its discovery?)

| cue | discovery | verdict | evidence |
|---|---|---|---|
| **intro** | "today we learn hello / who-I-am / goodbye; meet the two kids" | **PARTIAL** | Title card "Hello & Greetings", eyebrow "Unit 1 · Hello!", teaser "say hello · say who you are · say goodbye", and both kid faces are all present (f52) — the job IS announced and the cast IS introduced. BUT the 92px title sits at y=320 directly behind the two faces (KID centers y=272), so "He**llo** & Greeti**ngs**" reads with both flanks occluded → title is only partly legible. Discovery survives via the teaser line, but the headline is degraded. |
| **meet-hello** | "Hello!/Hi! is what you say AT meeting; greeting rides the wave" | **PASS** | f122: left girl waves (coral hand mark beside head), "Hello!" bubble pops on the wave, read-along surfaces "Hello!" with the coral underline cursor at the bottom. Concrete stage held; the wave + bubble + read-along all co-fire on the meeting moment. |
| **intro-self** | "after greeting you say 'I'm ___'; the SOUND of I'm = one held syllable /aɪm/" | **PASS** | climax-still: right boy's "Hi! I'm Sam." bubble, "Sam" name card under him, read-along row "Hi! / **I'm** / Sam." with **I'm** swelled inside a coral ring + underline as ONE unit (not split [ai-m]). Emphasis pulse fires once on "I'm". Match-the-spoken-count rule honored: I'm = one swelling unit. |
| **part-goodbye** | "Goodbye!/Bye-Bye! said AT parting; same two kids close the encounter" | **PASS** | Multiplicity.png: both kids present, "Goodbye!" (left, dimmed prior) + "Bye-Bye!" (right, active) bubbles, boy waves (coral hand), read-along surfaces the farewell with the coral cursor on "Bye-Bye!". Concrete parting moment reads. Same cast → encounter closes the one that opened with Hello. |
| **recap** | "the whole arc as ONE connected sequence: meet→name→part, three moments of one encounter" | **PARTIAL** | recap-still: the three phrases stacked "Hello! / I'm Sam. / Goodbye!" with the live sweep landing on "Goodbye!" and the two kids present — the arc-as-one-encounter reads. BUT the closing coral PulseCircle (pulse #2 of 2) is centered at RECAP_PULSE_CY=480 = the MIDDLE row ("I'm Sam.", already dimmed/stale), while the active highlight is on "Goodbye!" (row 552). The punctuation lands on the wrong line, so it reads as re-emphasizing the middle phrase rather than punctuating the arc/close. |

Contact-sheet teach test: a child who doesn't know this lesson WOULD learn the three
routines and their moments from this strip — the greet/name/part arc is concrete,
identity-invariant (same two kids throughout), and the read-along surfaces each exact
phrase. The lesson never climbs above `represent` (no spelling/letters), honoring the
out-of-scope fence. The two PARTIAL beats degrade polish, not comprehension.

---

## §2 layout / legibility gates

- **Linear collisions: 0** (`summary.collisionCount=0`). Clean.
- **Measured collisions: 2** (`summary.measuredCollisionCount=2`), both `readalong-recap`
  ↔ `recap-pulse` at frames 533 & 577, zones labels↔marks, ratio 1.
  **Ruling: by-design adjacency, NOT a true overlap** — a punctuation PulseCircle is
  *meant* to sit on the phrase stack; a labels-vs-marks overlap with a translucent ring is
  the expected geometry, confirmed on f533/f577 (the ring is a thin coral outline over the
  dimmed middle row, text stays readable). The geometry is acceptable; the *semantic*
  placement is the defect logged in §1 recap (pulse on the wrong row) → owned by composer,
  not a collision fix.
- **INTRO title occlusion is NOT in the manifest** — the linear keyframe (frame 30) sampled
  the cast at 33% opacity, but by f52 the cast is fully opaque on top of the title. The
  fast-pre-filter is blind to this opacity-ramp overlap; the measured pass didn't sample a
  late intro frame either. This is a real legibility defect the gates missed (finding below).
- **contrast gate: PASS** all 5 sampled labels (5.67–12.24 : 1, floor 4.5).
- **legibility gate: PASS** all (glyph 110–236px on the 720 render; floor 24).
- **motionFast: PASS** (WARN-only; peak 13.98 px/frame at the I'm swell, no calibrated fail).
- **Every visual-design §3 element has a manifest entry** (intro-card, kid-left/right,
  exchange-* per cue, readalong-* per cue, self-namecard, recap-pulse) — confirmed in
  `bbox-manifest.json` keyFrames + measured elements.

## §3 sound gates

- **lufs gate: FAIL** — integrated **−17.2 LUFS** (target −16, off by **−1.2 LU**), true
  peak −1.6 dBFS (within the −1 ceiling), LRA 3. The master is slightly quiet; the
  loudnorm 2nd pass landed under target. Minor, audible only as "a touch low". Owned by
  W5 (render/loudnorm), not a teaching defect.
- **captionRedundancy gate: FAIL (jaccard=1, all 5 cues) — JUSTIFIED EXEMPT.** This is the
  literacy/language carve-out the gate spec names. The flagged "redundancy" is between the
  Chinese narration WAV and the Chinese caption ribbon — they match by design (the caption
  ribbon IS the narration's on-screen home for the Mandarin learner, per visual-design §1).
  The English teaching unit (the read-along phrase) is a SEPARATE element, not the caption,
  so there is no real narration/caption clutter. No fix; record as expected.
- **Qualitative checks (cannot watch MP4; judged from cues.json + design intent):**
  - `toneSafe:false`, bed `literacy-playful-76`, intro sting `kids-section-lift`, outro
    `resolve:true`, SFX = whoosh(intro) / pop(each popin) / chime(recap reward). The SFX→beat
    map is semantic and sparse (1 per cue + reward chime). Cannot confirm the 3-point duck or
    melody-under-narration by ear; flagged for a human pass with sound on (see finding).

---

## §4 primitive-check observations

- **Hardest.png** (intro-self peak, the hardest frame): the "Hi! I'm Sam." bubble, the
  "Sam" name card, the two faces, and the read-along row "Hi! / I'm / Sam." all render
  crisply at real size; the I'm swell + coral ring reads as ONE held unit. Meets the
  visual-design §5 acceptance ("the I'm segment is the largest mark at its beat"). PASS.
- **Multiplicity.png** (part-goodbye, worst-case two-bubble multiplicity): both farewell
  bubbles + both faces + the wave hand + the read-along all coexist without crowding;
  DialogueExchange's two-bubble cap holds. PASS.
- Kid faces (GIRL_FACE / boy) are clean flat-SVG portraits, identity-invariant across all
  five cues (same two faces) — the continuity promise the pedagogy depends on. PASS.

---

## §5 punch list (mapped to owning wave)

1. **[W4 composer — HIGH] INTRO title occluded by the cast.** The 92px title (TITLE_CY=320)
   runs straight under the two kid faces (STAGE_CY=272), so "Hello & Greetings" reads with
   both ends covered (f52). Fix in layout/scene: either lift the title clear of the faces
   (raise TITLE_CY / lower or fade the cast during the title's settle), shrink/reposition the
   cast for the intro beat, or stage the cast to fade in only AFTER the title has read. Keep
   the cast introduced before intro ends (pedagogy needs them met). Re-render the intro and
   confirm the full title is legible at the cast-opaque frame (~f52). Add a late-intro
   sample to the measured-frame set so the gate catches this class next time.
2. **[W4 composer — MEDIUM] Recap pulse lands on the stale middle phrase.**
   `RECAP_PULSE_CY = RECAP_CY (480)` = the "I'm Sam." row. The closing punctuation pulse
   should land on the live/closing phrase ("Goodbye!", row 552) or be a single arc-wide
   punctuation, not re-ring the middle (already-dimmed) line. Retarget RECAP_PULSE_CY (and
   fire it on the closing beat), then re-render the recap tail.
3. **[W5 render/loudnorm — LOW] Master is −1.2 LU quiet** (−17.2 vs −16 LUFS). Re-run the
   loudnorm pass targeting −16 LUFS / −1 dBTP (true peak has 0.6 dB of headroom). Cosmetic.
4. **[human / W6 follow-up — LOW] Sound qualitative pass.** I cannot watch the MP4; a human
   should confirm with sound on: 3-point duck (intro duck / mid-gap rise / outro resolve),
   melody NOT hummable under narration, no SFX louder than the voice, chime fires once.

**Not blocking / no action:** measured recap collision (by-design adjacency, ruled above);
captionRedundancy gate (language-lesson exempt, ruled above).
