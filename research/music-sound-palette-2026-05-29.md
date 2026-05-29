# Best sound for the lesson system — palette, SFX & sourcing — research brief
_scope: evergreen (palette/pedagogy) + last ~12mo (tooling/licensing) • generic lens • deep dive • generated 2026-05-29_

**Extends** `research/music-sound-design.md` (the mix-engineering brief). That brief settled the NUMBERS (deterministic frame-keyed ducking, bed ~0.14 un-ducked / ~0.04 ducked, -16 LUFS / -1 dBTP). This pass answers the question that one left open: **what should the sound actually BE** — instrumentation, SFX vocabulary/density, and which sources are legally usable for monetized kids' media. It also closes O1 (the kit's `AudioLayer`) by reading the code.

**Honesty marker:** [VERIFIED] = grounded in a primary source / a file:line; [ASSUMED] = synthesis needing a validation pass.

---

## TL;DR
- **Default bed = Western calm-kids, not a cultural pastiche.** Soft piano + warm pad + light mallet/glockenspiel, **major key, 60–80 BPM, no vocals, flat dynamics.** Tempo (not key) is the cross-cultural arousal lever, so a slow steady tempo is the universal "calm" signal; major-mode "happy" is Western-specific but safe for our audience. [VERIFIED: Husain/Schellenberg; Song Creator Pro; RouteNote; FreshMadeMusic; Montessori 60 BPM study; Hallam]
- **Mandarin instruments are an ACCENT, never the bed — and on tone lessons, a hazard.** Pentatonic + dizi/guzheng/erhu carry measurable perceptual weight for Chinese kids and pitch-training measurably improves 4-year-olds' Mandarin **tone** perception — so a sparse pentatonic motif in *intro stings / section beats / success* is a real engagement+comprehension win. BUT because Mandarin is tonal and we teach pinyin tones, a **melodic** bed pitch-contour can compete with lexical-tone perception: under tone-teaching narration the bed must be drone/pad (flat pitch), and any pentatonic melody confined to narration GAPS. [VERIFIED: Nature Sci Reports 2025; ASHA JSLHR; Music Island localization] [ASSUMED: the tonal-interference guard — strongly inferred, not directly measured]
- **SFX: restraint is the finding, the "1 per beat" cap is validated and even conservative-good** — and the load-bearing rule is *no SFX during instruction narration* (reward/interaction sounds belong in gaps or after the line, mirroring the bed duck). Rising-pitch-per-count-step is supported in principle (pitch→magnitude sonification + amodal number sense) but has no count-specific RCT → adopt as evidence-informed, A/B it. [VERIFIED: TomsProject; Mt. Mograph; game post-mortem; sonification/ANS] [ASSUMED: rising-pitch specifics]
- **Licensing is now resolved per provider (closes O3).** Cleanest for our multi-platform, possibly-monetized, possibly-app-embedded case: **CC0 freesound + Pixabay Music + a paid Suno tier**. Avoid YouTube-Audio-Library "standard" tracks (YouTube-only — breaks multi-platform) and Mubert if lessons ever embed in an app (no software-embedding clause). [VERIFIED: primary ToS pages]

## What's working (claimed)
- **Calm instrumental at ~60 BPM measurably improves young-learner affect and task performance.** A Montessori early-childhood study saw smiles rise 16.9→50.6 and negative emotion drop ~20% under ~60 BPM instrumental; Hallam found calming music *sped up* children's arithmetic while arousing/aggressive music hurt memory and prosocial behavior. [E] → keep math beds slow, steady, low-arousal.
- **Light, bright instrumentation is the kids-edu default:** ukulele, piano, glockenspiel, mallets; pops/sparkles/chimes are "less fatiguing for kids" than dense SFX. [E, RouteNote] Keep K-2 music in **major** keys; reserve minor only for "scared/frustrated" beats — which we don't have. [E, FreshMadeMusic composer]
- **Pentatonic + traditional timbre is a genuine, measurable lever for Chinese kids — used sparingly.** Nature *Scientific Reports* (Nov 2025, N=117) shows Gong/Shang/Jue/Zhi/Yu modes and dizi/guzheng/erhu carry consistent perceptual associations (dizi = brightest timbre, L*≈84; erhu = darkest, L*≈41, tracking spectral centroid), explicitly framed as a basis for Chinese-music *teaching tools*. [E] A China localization case (Music Island) found swapping in guzheng/erhu + Chinese rhymes strengthened engagement over a Western-default score. [E]
- **Pitch-based musical training improves Mandarin TONE perception in preschoolers.** A JSLHR study: carillon/pitch training improved 4-year-olds' categorical perception of lexical tones vs rhythm/control groups. [E] → for a *tone* lesson, tone-aware/pitched audio cues are a comprehension aid, not decoration — but must not collide with the spoken tone (see contested).
- **SFX must be visually motivated and sparse.** "Mute the video and edit like a podcast — every SFX must be justifiable." [Y, TomsProject] "With a music bed or VO you add a lot LESS sound effects… piling SFX on every action is over sound design." [Y, Mt. Mograph] Sync each impact's terminus onto the audio/visual beat rather than sprinkling. [Y, ECAbrams]
- **Pitch→magnitude mapping is the de facto sonification standard and the number sense is amodal.** 6-month-olds map tone-counts to dot-counts; rising tone sequences encode magnitude via a shared fronto-parietal network. [E] → a gentle rising pitch across a counted set is theory-aligned.
- **Short, distinct, brighter interaction cues for young users.** Duolingo-style guidance: keep cues <1.5 s, one distinct sound per distinct action, younger learners prefer brighter/higher-pitched cues; A/B test. [E, soundcy]

## What's broken / contested
- **The kit LOOPS the bed — directly against the no-loop rule.** `shared-narration/src/AudioLayer.tsx:71` renders `<Html5Audio loop … />`. The prior brief (F5/§2.3) says "generate beds to actual length so they NEVER loop — audible loops are distracting." *Reconciliation:* `loop` is only audible if the bed asset is SHORTER than the composition; if we author/pad each bed to ≥ reconciled total frames (Wave 3.5 knows the total), the loop never fires. Safer still: drop `loop` or crossfade. **This is a real system divergence to decide, not a hope.** [VERIFIED: file:line]
- **Tone-language interference (the sharpest new constraint).** Generic kids-edu advice ("add a happy melodic bed") is *wrong* under pinyin/tone-teaching narration: a melodic pitch contour competes with the very lexical-pitch the child must hear. The duck (bed → ~0.04) helps, but melody should also be flattened to pad/drone under tone narration, with pentatonic melody only in gaps. No source says this explicitly — it's the intersection of "pitch training aids tone perception" (good in gaps) and "two competing pitches interfere" (bad under narration). [ASSUMED — flag for a viewer check on `pinyin-four-tones`.]
- **"Random well-done!" mid-task is harmful.** A preschool-game audio post-mortem: cut interactivity sounds *during* instruction dialogue; intrusive reward sounds mid-task hurt. [E] → reward SFX go AFTER the narration line or in the gap, never over the teaching words. Reinforces "1 ta-da per lesson, at success only."
- **Over-layering for "texture" risks our calm goal.** TomsProject's "layer 3 SFX at high/mid/low pitch" and "use unexpected sounds" are pro-editor tricks that can startle anxious 3–8yo learners — adopt the *restraint* half of his advice, not the density half. [Y, lone-wolf]
- **YouTube Audio Library "standard" tracks are YouTube-only** — fine if we only publish to YouTube, but breaks the prior brief's stated *multi-platform* -16 LUFS goal. CC-BY tracks there need a description credit. [E]
- **Reddit practitioner tier still unreachable** (403 on every query — same outage as the prior brief's O5). The "looping noticed / music too loud / copyright-claim" practitioner confirmations remain ungathered. [R: BLOCKED]

## Numbers worth verifying
- Pentatonic timbre brightness ordering (dizi L*≈84 > guzheng ≈72 > erhu ≈41) — Nature 2025, N=117 Chinese students. Use to pick the *brightest* (dizi) for positive/intro accents.
- Montessori affect deltas (smiles 16.9→50.6; negative −20%) at ~60 BPM — directional, single study.
- Duolingo-style cue length **<1.5 s** for interaction SFX — adopt as the SFX max-duration lint.
- The "1 motivated SFX per beat" cap (prior brief O4): validated as directionally correct by two independent creators + a game post-mortem, but still no measured K-3 SFX-per-minute threshold — keep as a lint, validate on a real lesson + the action-aware contact sheet. [ASSUMED]
- Whoosh transitions: low-pass + pull to ~-14/-15 dB so they add movement without poking through. [Y, Vane Motion]

## Recommended curated library (the concrete answer)
Author-time only; renders read local WAVs (determinism preserved). Store a `<name>.license.txt` next to every asset.

**Beds — `public/audio/_beds/` (5–6):**
1. `math-calm-68-cmaj` — soft piano + warm pad, C major, ~68 BPM, flat dynamics. *The default neutral base.*
2. `literacy-playful-76` — piano + glockenspiel/mallet + light ukulele, major, ~76 BPM.
3. `tone-safe-pad` — pad/drone-dominant, **minimal melodic pitch contour** (for pinyin/tone lessons; safe under tone narration).
4. `celebration-resolve` — fuller, brief, resolves to tonic (outro/success).
5. *(optional)* `mandarin-accent-sting` — sparse **pentatonic dizi/guzheng** motif, ~3–6 s, intro card / Mandarin-topic only — never under narration.

All: no vocals, EQ-carved -4 dB across 800–3000 Hz (author-time), authored/padded ≥ longest expected section so the kit's `loop` never fires.

**SFX — `public/audio/_sfx/` (5–6):** `pop` (PopIn entrance), `chime`/`shimmer` (Sparkle/reward), `whoosh` (transition; low-pass, ~-15 dB), `tick` (count step, optional rising pitch), `ta-da` (success, once per lesson). All WAV, <1.5 s, brighter pitch, CC0 or paid-cleared.

## System fit (current pipeline — closes O1)
Reading `/Users/tk/Desktop/shared-narration/src/AudioLayer.tsx`:
- ✅ **O1 answered:** the kit DOES build a deterministic frame-keyed duck envelope (`volumeAtFrame()` + `interpolate`, NOT a runtime compressor) with numbers ≈ spec (`bgmVolume=0.14`, `duckedBgmVolume=0.04`).
- ❌ It **loops** the bed (`<Html5Audio loop>`, line 71) — see contested above (mitigate by authoring beds ≥ length, or drop `loop`).
- ⚠️ Ramps are **symmetric `fadeFrames=8`**, not the spec's 10f-down/15f-up. Minor; align if cheap.
- ❌ **No lesson-edge fade** (spec wants 0.75 s / 22f in+out) — add it.
- ❌ **No SFX path at all** — `AudioLayer` takes no SFX list; the `LessonSfxLayer` from `music-sound-design.md` §2.4 must be built fresh.
- ❌ **No -16 LUFS master** (Remotion can't; post-render `ffmpeg loudnorm` pass per prior O2).

## Next moves
- **Build the curated library above** to the prior brief's Spec 1/6, with per-asset license files. Source order: CC0 freesound + Pixabay for SFX; a paid Suno tier (or ElevenLabs Music Self-Serve) for beds; reserve the pentatonic accent for a hand-picked/generated dizi loop.
- **Add the tone-safe bed + the "no melody under tone narration" rule** as a per-lesson choice keyed off topic (the `pinyin-four-tones` lesson is the test case). Verify by ear that the spoken tone is unmistakable over `tone-safe-pad`.
- **Patch the kit** (or wrap it): add the 0.75 s edge fade; either author beds ≥ length or remove `loop`; thread an SFX list. Then wire `LessonSfxLayer` per §2.4.
- **Validation experiment:** render one lesson with the `math-calm` bed + the 5-SFX set at "1 per beat", check the action-aware contact sheet + a listen-through for (a) melody inaudible under narration, (b) no SFX over instruction words, (c) loop never audible, (d) rising-pitch count reads as "more."
- **Follow-up search to run:** ingest `@BabyBusChannel (宝宝巴士)` (and a Western benchmark like `@supersimplesongs`) into yt-rag for a future pass — the corpus currently has ZERO Mandarin kids-edu sonic reference. Re-run the Reddit leg when the MCP 403 clears (kids-content copyright-claim + looping-noticed confirmations still owed).

## Sources
### Reddit
- **BLOCKED** — `reddit_*` MCP returned "Access forbidden" on all site-wide and subreddit queries (r/NewTubers, r/VideoEditing, r/youtube, r/musicproduction, r/ECEProfessionals). Same outage as the prior brief's O5/O8. No data.

### YouTube (yt-rag — deep-links)
- TomsProject (Veritasium editor) — mute & justify every SFX; restraint > density — https://youtu.be/_6UA2Laetiw?t=453 ; "no motivation for sound → don't add it" https://youtu.be/_6UA2Laetiw?t=361
- Mt. Mograph — "with a bed/VO you use a lot LESS SFX; piling on = over sound design" — https://youtu.be/3W_6ndPOl4A?t=637
- ECAbrams — audio-driven workflow: lock VO, align impact terminus onto the beat — https://youtu.be/rpMGPhUER48?t=627
- Envato Tuts+ — music must complement not compete; "math class" mood; bed low — https://youtu.be/oDjAiDUq-QY?t=550
- Vane Motion — tame whoosh with low-pass, pull to ~-14/-15 dB — https://youtu.be/NUQyUctGQIQ?t=2291
- *Corpus gap:* no Chinese kids-edu channel ingested → zero Mandarin-palette evidence here.

### Exa (web)
- Chinese pentatonic modes + dizi/guzheng/erhu perceptual associations (N=117) — https://www.nature.com/articles/s41598-025-23220-7 (Nov 2025)
- Pitch-based training improves 4yo Mandarin lexical-tone perception — JSLHR (pubs.asha.org)
- Husain/Schellenberg: tempo=arousal (cross-cultural), mode=mood (Western-specific) — utm.utoronto.ca (PDF)
- Montessori ~60 BPM affect study — academia.edu ("Space Between the Notes")
- Hallam: calming music sped children's arithmetic; arousing music hurt — readkong.com
- Kids-edu instrumentation/SFX defaults — https://licensing.routenote.com ; FreshMadeMusic (K-2 major keys)
- Sonification pitch→magnitude standard — journals.sagepub.com (Sonic Interaction Design); amodal number sense (tone↔dot counts) — frontiersin.org/articles/10.3389/fpsyg.2020.02085
- Preschool-game audio post-mortem (cut interactivity during instruction) — gamedeveloper.com (2014)
- Duolingo-style SFX guidance (<1.5 s, distinct, brighter for young) — soundcy.com (Nov 2025)
- **Licensing (primary ToS):** Suno https://undetectr.com/blog/suno-commercial-use ; ElevenLabs Music https://elevenlabs.io/eleven-music-v1-terms ; Mubert https://mubert.com/documents/mubert_render_subscription_license_agreement.pdf ; YouTube Audio Library https://support.google.com/youtube/answer/3376882 ; freesound https://freesound.org/help/faq/#licenses ; Pixabay https://safesearch.pixabay.com/service/terms

### Licensing verdict (monetized kids YouTube/multi-platform)
- **Suno** — cleared on Pro/Premier ($10/$30 mo, perpetual commercial *license*, not ownership); free tier non-commercial.
- **ElevenLabs Music** — paid Self-Serve cleared for YouTube background; ~Scale tier for paid/sponsored ads; free requires "Eleven Music" attribution.
- **Mubert** — Creator license cleared for monetized YouTube; **no app/software embedding** (bites if lessons ship inside an app); Ambassador = non-commercial.
- **YouTube Audio Library** — cleared, copyright-safe, monetizable; standard tracks **YouTube-only** (breaks multi-platform); CC-BY needs credit.
- **freesound** — CC0 only is clean; CC-BY needs attribution; **CC BY-NC NOT monetizable**.
- **Pixabay Music** — commercial embedded use, no attribution; can't resell standalone; **some tracks still carry Content-ID** (dispute with download proof).
- **COPPA "made for kids"** governs data/ads (disables personalized ads → lower RPM), NOT audio content — no music-specific clause.

## Method notes
- Legs run: A (Reddit) — **BLOCKED 403**; B (yt-rag) — ran, thin on topic (no Mandarin channel); C (Exa) — ran, primary-source heavy, carried the brief. No A/B WebSearch probe (deep dive).
- Open items updated: **O1 RESOLVED** (kit code read), **O3 RESOLVED** (per-provider verdicts above), **O4 VALIDATED-but-unmeasured** (keep the "1 SFX/beat" lint), **O5 still BLOCKED** (Reddit). New item: **tonal-language bed-pitch guard** needs a listen-test on `pinyin-four-tones`.

## Progress
- 2026-05-29 — brief authored. Extends `research/music-sound-design.md`. Not yet implemented.
- 2026-05-29 — turned into a build-ready integration plan: `docs/proposals/sound-layer-integration.md` (dedicated sound lane: Wave 2c sound-design ∥ 2b, Wave 3c sound-asset factory ∥ 3a/3b; bed mechanical + SFX composer-owned at Wave 4; CC0-freesound+Pixabay sourcing; loudnorm render step; 4 Wave-6 checks). Decisions locked with user: dedicated lane, CC0+Pixabay. Awaiting approval on the structural changes (§8) before any wave-contract edits.
- 2026-05-29 — SHIPPED (user-approved). Code: `src/lesson-media/{audioMix,sfx,LessonSfxLayer,LessonBgmLayer,audioCuesTypes}.*` (→ `CAPABILITIES.md#lesson-music-bed`, `#lesson-sfx-layer`). Structural: Wave 2c/3c in `CLAUDE.md`; new skill `lesson-sound-design`; composer + verification skill contracts; `pipeline-architecture.md` Changelog v2 (two-track principle). Render: loudnorm pass in `render-complete-lesson.mjs` (resolves **O2**). Assets: placeholder library + `_SOURCING.md` for the CC0/Pixabay swap-in (closes the asset gap with placeholders; real-asset swap is author-time). Still open: **O4** (SFX-density cap, validate on a real lesson), tonal-language `toneSafe` listen-test on `pinyin-four-tones`, **O5** (Reddit). Smoke test = next.
