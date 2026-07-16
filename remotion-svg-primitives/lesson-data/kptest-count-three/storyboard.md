# kptest-count-three — storyboard

Lesson kind: math-insight. The spine is an `announce-topic` opener (the mandated topic-intro) followed by the two teaching-discovery cues pedagogy set: a concrete **count-climb** where three identical apples arrive one at a time, each taking exactly one count word and one persistent count tag (one-to-one correspondence, the cue's own tri-repetition serving as its built-in drill for the half-known sequence), then a single **cardinality** landing where the same count tags consolidate into one cardinal 3 standing for the whole group — the picture delivering the 3→whole relation before the voice names the total. Per pedagogy there is **no separate recap cue**; the cardinality beat itself is the closing landing.

### topic-intro
- **discovery ref:** (announce-topic opener — frames the composite lesson knowledge point, i.e. both pedagogy discoveries together: the one-to-one count-climb 一/二/三 + the cardinal "last number said = how many altogether"; no single per-cue pedagogy discovery)
- **stage:** opener (no stage)
- **teaching action(s):** announce-topic
- **narration beat (intent):** name the lesson topic as a one-line teaser — we are counting to three. Reads **alone first**; the apple cast enters **after** the title has read.
- **required visual:** `lesson-intro-card` (LessonIntroCard) — optional section eyebrow + TITLE (largest line) + one-line KP teaser, centered with write-on accent underline. Title/teaser is the ONLY readable thing on screen while it reads. **Beat-ordering note for composer:** sequence title-read → cast-enter; the apples enter only at count-climb's start, never overlaid on the title (announce-topic binding require).

### count-climb
- **discovery ref:** "each apple gets exactly one count word, in order (一, 二, 三) — one object = one count, counted up (one-to-one correspondence + the counting sequence, which the child half-knows)"
- **stage:** concrete (the identical apples are the objects counted) with represent tags (the running numeral 1, 2, 3 attaches to each apple as its count lands; the apples stay identical and each keeps its tag once placed — the one-to-one is stable and reusable)
- **teaching action(s):** count-on (one new item per spoken number, in sync)
- **narration beat (intent):** drive the one-to-one climb — voice the three count words **in order**, each spoken AS its apple arrives (one object = one count word), paced with breath gaps between the three arrivals. Open ON the first count word — no carrier intro (the opener already named the topic, and each count word is a syncable target at the head of its arrival). Say nothing after the third count word — no total yet (that is cardinality's reveal; leakage rule). The three paced arrivals are this cue's own drill for the half-known sequence.
- **required visual:** `countable-object` (variant: **fruit** = apple) ×3, arriving ONE per spoken count word, in sync. A per-apple **count tag** that ATTACHES as its count word lands and STAYS (the running numeral 1 / 2 / 3 — one-to-one stable & reusable, per pedagogy's represent-tags); live badge candidates: `number-card` (persistent digit per apple) or `count-step-indicator` (running-count badge per step — *confirm it persists, does not fade out*); Wave-3 picks the badge primitive. count-on's single-signal rule holds: the tag is the SOLE count mark on each apple — **no competing highlight ring** (kids-eye §2). Already-placed apples stay put, identity & tag preserved (continuity); each arriving apple enters via `pop-in` (entrance, not a count-signal highlight).

### cardinality
- **discovery ref:** "the last number said (三 / 3) tells how many there are altogether — the 3 that labeled the third apple now stands for the whole group (cardinality)"
- **stage:** represent (the numeral 3 stops being one apple's tag and becomes the set's number — the cardinal bridge; no equation, no numeral beyond 3)
- **teaching action(s):** reveal (the picture delivers the 3→whole insight; the voice names the total only AFTER)
- **narration beat (intent):** name the cardinal total AFTER the picture has shown the 3 re-scope to stand for the whole group — voice how many there are altogether as the count of all three (referentially: the cardinal "how-many-altogether" total, the 三个 / 一共有三个 **sense** — Wave 2b owns the exact wording). The picture leads (3 → whole), the voice confirms; naming the total after the picture is the teaching, not leakage. One clean delivery — the insight clicks once, no recap.
- **required visual:** the three `countable-object` apples from count-climb, **carried and now quiet** underneath (no re-count). `cardinal-consolidation` (CardinalConsolidation) performs the move: the per-item count tags (1, 2, 3 — the SAME tags carried from count-climb for continuity) consolidate via converging guide lines into ONE cardinal-3 total glyph that settle-pops in above the group; the per-item tags recede. The total glyph IS the third apple's tag 3 re-scoped to the whole (**continuity note for composer:** the 3 that labeled the third apple becomes the group's number). The focal change (per-object 3 tag → whole-group number) carries the discovery (reveal requires). No equation, no numeral beyond 3.

exposures:
  一: 1
  二: 1
  三: 2
