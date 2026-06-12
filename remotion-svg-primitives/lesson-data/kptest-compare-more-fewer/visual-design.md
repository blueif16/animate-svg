# visual-design — kptest-compare-more-fewer

Wave 2a Visual Contract. INTENT ONLY — no absolute frames; the composer derives every frame from `cues[id].startFrame + offset`. Each rule stated ONCE; cues cross-reference.

## Kids'-eye measurement block

```
composition:          1920×1080 @ 30fps   (fixed)
short-side:           1080 px

teaching-unit:        one CountableObject dot (the countable; color = group ID, identical size)
teaching-unit-min:    ≥ 8% short-side = 86 px diameter
teaching-unit-target: 12–14% short-side = 130–150 px   → USE 140 px dot diameter
primary-label-min:    48 px  (the two phrase rows 五比三多 / 三比五少 — load-bearing acquisition targets)
body-label-min:       36 px  (group amount tags "5" "3" in two-groups only)
caption-line-min:     56 px
comparison-symbol:    ≥ 90 px tall (the > glyph between the two groups)
separation-gap-min:   ≥ 6% short-side = 65 px (vertical gap between the two rows so they read as TWO groups)

DENSEST CUE fit-check (the held pairing, 5 over 3, widest cue = not-by-size spread):
  columns: 5 dots @ 140 px, columnGap 130 → row span = 5·140 + 4·130 = 1220 px = 64% of 1920 width (binding axis OK, clears float floor).
  rows: 2 rows @ 140 px, rowGap 150 → block height = 2·140 + 150 = 430 px; the 150 rowGap > 65 px gap floor → rows read as two groups. ✓
  not-by-size SPREAD: bottom 3 dots at columnGap ~300 → bottom span = 3·140 + 2·300 = 1020 px (still < 1920, fits) but now LONGER-LOOKING than its 3-count warrants — that visual lie is the point of the cue.
  phrase row: 4 hanzi @ ~64 px advance = ~260 px glyph + read-along cursor; sits in zone-labels above the picture, 64 px > 48 primary-min. ✓
```

## Spatial zones (disjoint; px boxes at 1920×1080, origin top-left)

```
zone-title:   (260,300)–(1660,780)  w1400 h480 | intro ONLY — LessonIntroCard. Time-disjoint from all object/label/phrase zones (dots absent in intro per announce-topic.requires).
zone-objects: (350,330)–(1570,760)  w1220 h430 | the two dot rows + pair-connector lines + unmatched-slot ghosts. NOTHING readable else.
zone-amount:  (350,250)–(1570,318)  w1220 h68  | two-groups ONLY — the per-group amount tags "5"/"3" beside each row. Empty after match.
zone-phrase:  (660,120)–(1260,236)  w600  h116 | the spoken acquisition phrase row (五比三多 / 三比五少) + read-along cursor. Lives ABOVE objects, never inside.
zone-symbol:  (1600,330)–(1740,760) w140  h430  | the comparison-symbol > between top & bottom groups, to the RIGHT of the rows (off the dots).
zone-turn:    (660,790)–(1260,900)  w600  h110  | echo cues — the "your turn" pointer-hand + turn-cue, below objects, through the silence.
zone-caption: (160,980)–(1760,1064) w1600 h84  | caption ribbon.
zone-marks:   full-bleed             | sketch (likely NONE this lesson). Marks may trace over zone-objects, never sit in zone-phrase.
```

Co-present disjointness (computed): zone-objects.y∈[330,760] vs zone-phrase.y∈[120,236] (gap 94 px), vs zone-amount.y∈[250,318] (gap 12 px above objects, but amount only present in two-groups before any pair line — no overlap), vs zone-symbol.x∈[1600,1740] starts at objects.x-max 1570 (gap 30 px, right of dots), vs zone-turn.y∈[790,900] (gap 30 px below objects), vs zone-caption.y∈[980,1064]. All co-present pairs have empty intersection. zone-title overlaps object area but is TIME-disjoint (only cue: intro; dots absent there).

## Visual Contract

```
metaphor:        ONE paired picture — 5 red dots over 3 blue dots, matched one-to-one by lines; the two red dots with NO partner ARE "more", and the same picture read the other way IS "fewer". One picture, two readings.
regions:         zone-objects = the invariant 5-over-3 dot pairing (the ONLY teaching object); zone-phrase = the spoken 比-utterance; zone-symbol = the > direction glyph; zone-amount = transient count tags (two-groups only); zone-turn = your-turn affordance (echoes); zone-caption = narration.
between-states:  the SAME 8 dots + the SAME 3 pair lines live the whole spine. Match→more→echo-more→more-replay→fewer→echo-fewer→fewer-replay = NO re-layout, NO redraw — only the reading-focus highlight / surplus pulse / > glyph / phrase row change. not-by-size is the ONLY cue that moves dots (spread bottom row), then re-pairs to the SAME surplus and restores. recap restores the matched (un-spread) picture.
reading-order:   intro: title→teaser. two-groups: top row→bottom row→amounts. match: pair lines drop→two leftover top dots→ghosts. more: surplus pulse→> glyph→phrase row read-along. fewer: short-row focus→re-read > as 少→phrase row. not-by-size: spread→re-pair→leftover unchanged. recap: surplus→五比三多, short row→三比五少.
decoration-budget: 1 cream background + 1 caption ribbon = 2 surfaces. NO card behind dots, NO box behind phrase rows.
text-budget:     五比三多 / 三比五少 (load-bearing — the acquisition targets, the moral); "5"/"3" amount tags (load-bearing ONLY in two-groups, naming counts before any matching — dropped after); captions (load-bearing accessibility). The > glyph is geometry, not text. NO lesson-title chrome over the picture, NO redundant "more/少" label when the > already carries direction.
occupancy:       horizontal axis binding (the rows + match run horizontally). Dot row span 1220 px = 64% of 1920 ✓ (>50% float floor). Vertical: block 430 px + phrase 116 + symbol within = teaching content ≈ 50% of 1080 non-binding axis ✓.
identity-invariant: every dot is the SAME CountableObject at the SAME 140 px size for the whole video — top row one group color, bottom row the other, NEVER changing hue, size, or shape across match/more/fewer/spread/recap. "more" and "fewer" are the SAME dots; color = which group, never which is bigger. The surplus is shown by PARTNERLESSNESS (unmatched-slot ghost), never by enlarging or recoloring the surplus dots.
```

## Per-cue motion budget (visualMotionSeconds — the MINIMUM the motion needs to READ; intent only)

| cue | visualMotionSeconds | what the motion is (1 sentence) | pedagogy discovery served |
|---|---|---|---|
| intro | 2.5 | title write-on + teaser fade; dots NOT present (announce-topic: title reads alone first) | intro framing — names "谁多谁少" |
| two-groups | 4.0 | 5 top dots then 3 bottom dots PopIn (snap) row-by-row + amount tags "5"/"3" fade; per-item dwell so the child takes in two groups | two groups, only COUNT differs |
| match | 5.5 | 3 pair-connector lines grow top→bottom one-to-one (staggered), then the 2 leftover top dots get unmatched-slot ghosts; HOLD on the surplus | one-to-one match reveals surplus before any word |
| more-direction | 5.5 | surplus pair pulse-circle + > glyph reveals top-over-bottom + read-along sweeps 五比三多 token-by-token (model said ×2, slow) | 五比三多 named, bound to the seen surplus |
| echo-more | 5.5 | picture HELD unchanged; turn-cue + pointer-hand at phrase; held SILENT your-turn gap (≥3–5s wait-time) | child re-produces 五比三多 |
| more-replay | 5.5 | identical to more-direction (reuse clip+visual): surplus pulse + > + read-along | spaced reinforcement of 五比三多 |
| fewer-direction | 7.0 | LONGEST dwell, keystone — NO dot moves; reading-focus slides surplus→short bottom row, > re-reads as 少 direction, read-along sweeps 三比五少 (model ×2) | same picture, read the other way = 三比五少 |
| echo-fewer | 5.5 | picture HELD; turn-cue + pointer-hand at short-row phrase; held SILENT your-turn gap | child re-produces 三比五少 |
| fewer-replay | 5.5 | identical to fewer-direction (reuse clip+visual) | spaced reinforcement of 三比五少 |
| not-by-size | 6.0 | bottom 3 dots spread WIDER (row looks longer), then pair lines re-pair one-to-one → STILL 2 top leftover; restore | more is by matching, not by spread |
| recap | 7.0 | recap-spotlight ONE live highlight: surplus→五比三多 phrase, then short row→三比五少 phrase, equal airtime; original matched picture restored | retrieve both co-equal targets |

Re-engagement: a new focal move lands every cue (≤7s), so no static stretch exceeds the 15–30s floor. The keystone (fewer-direction) earns the longest dwell per `lesson-pedagogy`.

## Palette (theme keys — never inline hex)

| token | meaning here |
|---|---|
| `cream` | canvas background |
| `reward` | top group (the 5 / more group) dot color — group-A ID |
| `coral` | bottom group (the 3 / fewer group) dot color — group-B ID |
| `textNavy` | phrase rows, amount tags, > glyph, captions, pair-connector lines, ghosts |
| `sunshine` | transient highlight — the surplus pulse + the read-along active token + recap live highlight ONLY (never persistent) |

4 meaningful colors + cream. Note: the two group colors are the ONLY semantic use of reward/coral — they encode WHICH group, never which is bigger (size is identical; surplus reads via partnerlessness).

## Motion vocabulary (intent — concrete API per CAPABILITIES.md)

| move | intent |
|---|---|
| dot entrances (two-groups) | `<PopIn motion="snap">`, staggered via `<Drag staggerFrames={3}>` per row |
| pair lines | grow via `progress`, `EASE.outCubic`, staggered onset per pair |
| surplus pulse | `pulse-circle` on the unmatched pair (sunshine) |
| > glyph reveal | `comparison-symbol symbol=">" style="formal"`, fade/scale-in `EASE.enter` |
| read-along | `read-along-highlight` cursor on the currently-spoken token ONLY |
| keystone focus-slide (fewer) | reading-focus highlight migrates surplus→short row via `EASE.inOutCubic` — the dots DO NOT move |
| dot spread (not-by-size) | bottom-row x positions widen via `EASE.inOutCubic`, then re-pair |
| recap | `recap-spotlight` — ONE live moving highlight |
| your-turn (echoes) | `pointer-hand-arrow variant="hand"` held through the silent gap |
| moving-hold | wrap the held picture group in `<Breathe>` during static stretches (echo gaps, dwell) |

ONE accent reserved: `motion="bouncy"` allowed once, on the surplus reveal at more-direction (the new concept). Everywhere else `snap`/`settle`.

## Reuse-primitive table (catalog ids — REUSE, no new primitives needed)

| need | primitive (catalog id) |
|---|---|
| intro card | `lesson-intro-card` |
| the dots | `countable-object` (one group color per row; identical size) |
| match layout placement | `paired-column-layout` helper `getPairedColumnPlacement(5,3,{columnGap:130,rowGap:150})` |
| the match lines | `pair-connector` (top[c]→bottom[c] for c<3) |
| surplus has no partner | `unmatched-slot` (state ghost) on the 2 overhang columns |
| direction glyph | `comparison-symbol` (symbol `>`, style formal) |
| spoken phrase row | `read-along-highlight` (cursor on spoken token) |
| surplus / focus pulse | `pulse-circle` |
| your-turn affordance | `pointer-hand-arrow` (hand) |
| retrieval | `recap-spotlight` |
| amount tags (two-groups) | `number-card` or plain text in zone-amount |
| moving-hold | `breathe` |

No gap named — every teaching demand maps to an existing catalog primitive (W3b default = reuse).

## Anti-patterns (refuse on sight)

- Re-laying-out / redrawing the dots or pair lines between match→fewer-replay — the keystone DIES if the picture changes. Only focus/pulse/>/phrase change.
- Showing "more" by enlarging or recoloring the surplus dots — surplus reads via partnerlessness (ghost) ONLY; size + hue are invariant.
- A > or 多/少 word that PRE-NAMES the answer before the match delivers it in `match` / before the spread re-pairs in `not-by-size` (voice + visual must let the picture reveal — `reveal.requires`).
- Phrase row or > glyph landing on the dots (zone-objects occlusion) — phrase lives in zone-phrase above, > in zone-symbol right.
- Two side-by-side "more picture vs fewer picture" panels — it is ONE picture, two readings (kids-eye §6).
- Title chrome or amount tags persisting over the picture after their cue.
