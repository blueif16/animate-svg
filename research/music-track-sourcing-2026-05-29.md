# Gathering music beds + SFX for the lesson pipeline — sourcing playbook
_scope: tooling/APIs last ~12mo • kids-edu media lens • deep dive • generated 2026-05-29_

**Extends** `research/music-sound-design.md` + `research/music-sound-palette-2026-05-29.md`. Those settled mix numbers + palette + LICENSING. This one settles **HOW TO OBTAIN** the assets author-time.

Honesty markers: [VERIFIED] = primary source/file; [ASSUMED] = synthesis; [BLOCKED] = couldn't gather.

---

## TL;DR

- **For SFX (~6 assets): freesound CC0 via APIv2 token-auth is the clear primary.** Download is allowed without OAuth; search by tag (`pop`, `chime`, `whoosh`, `tick`, `success`); filter `license=Creative Commons 0`; download the WAV; save `<name>.license.txt`. One-time manual build of ~6 files — API automation is available but not worth scripting for this count.
- **For beds (~5-8 assets): a single Suno Pro session ($10/mo, cancel after) is the primary.** Generate all beds in one sitting with precise prompt control; quality is demonstrably above Pixabay or freesound music; Pro tier = perpetual commercial license + multi-platform + app-embed. The tone-safe pad/drone is the one exception — generate it in ElevenLabs Music (better drone/ambient control) or source a CC0 freesound pad.
- **The whole library is ~12 assets authored once.** This is a small, one-time manual build — NOT a case for API automation pipelines. Renders read local WAVs forever after.
- **Suno and ElevenLabs Music carry no Content-ID on generated tracks** (you own the output under the license); Pixabay Music CAN carry Content-ID on some tracks [VERIFIED: Leg C / prior palette brief] — use Pixabay only as a fallback, with dispute-proof download receipts.
- **Mubert is excluded** for this pipeline: no software/app-embedding clause [VERIFIED: prior palette brief ToS] — and app-embedding is a live possibility.

---

## The gathering playbook (the concrete answer) — RANKED

### BEDS (~5-8 assets) — ranked source order

#### 1. Suno Pro ($10/mo — PRIMARY for most beds)

**Why first:** Best prompt-following for specified BPM + key + instrumentation; perpetual commercial license; multi-platform + app-embed OK on Pro/Premier; no Content-ID on generated tracks (you own the output). Quality is 1-2 tiers above Pixabay or freesound music. The 12-month-old lawsuit risk (Suno training data) is mitigated for OUR use case: we are the end licensee of generated output under a paid Pro license, not a re-distributor of Suno's training data. [VERIFIED: Leg C / jam.com Mar 2026; prior palette brief ToS summary]

**What to generate in one session (all beds):**
1. `math-calm-68-cmaj` — prompt: `"soft piano + warm synth pad, C major, 68 BPM, no percussion, no vocals, minimal melodic variation, flat dynamics, kindergarten calm background music, 3 minutes, instrumental"`. Export as WAV.
2. `literacy-playful-76` — prompt: `"piano + glockenspiel + light ukulele, bright major key, 76 BPM, no vocals, happy children's background music, simple melody, 2.5 minutes, instrumental"`.
3. `celebration-resolve` — prompt: `"uplifting piano fanfare, major key, 80 BPM, no vocals, orchestral resolution, 15 seconds, children's educational success jingle, warm brass, instrumental"`.
4. `mandarin-accent-sting` — prompt: `"pentatonic dizi flute motif, Chinese folk 5-second sting, bright major mode, no percussion, children's educational intro accent, 5 seconds"`. (Optionally, Suno handles this well; dizi timbre quality variable — verify by ear.)

**Steps:**
1. Subscribe to Suno Pro. Generate each track. Download WAV (not MP3 — MP3 adds silence padding that breaks one-shot SFX timing; WAVs are cleaner). [VERIFIED: prior design brief F6]
2. Apply the EQ carve author-time: `ffmpeg -i input.wav -af "equalizer=f=2000:t=o:w=2000:g=-4" output.wav` (−4 dB centered at 2 kHz, 2-oct width covers the 800–3000 Hz speech-intelligibility zone). [VERIFIED: prior design brief Spec 1]
3. Pad each bed to ≥ max expected lesson length (use `ffmpeg -i input.wav -af apad=whole_dur=300 output.wav` for a 5-min ceiling so the kit's `loop` never audibly fires). [VERIFIED: palette brief — loop fires if bed is shorter than composition]
4. Save `public/audio/_beds/<name>.wav` + `public/audio/_beds/<name>.license.txt` containing: date, Suno account email, subscription tier (Pro), plan URL, and the verbatim commercial-use clause from suno.com/terms.

**License capture (`<name>.license.txt`) template:**
```
Source: Suno AI  https://suno.com
Account: <your email>
Subscription: Pro  ($10/mo as of <date>)
Commercial-use clause: "You own all music you create with Suno on a paid plan and may use it commercially including monetized video."  (suno.com/terms, verified <date>)
Use: background music bed for monetized children's educational video, multi-platform including possible app embedding.
Generated: <YYYY-MM-DD>
Prompt: <exact prompt used>
```

---

#### 2. Tone-safe pad/drone — ElevenLabs Music (SPECIALIZED for this one asset)

**Why separate:** The `tone-safe-pad` asset requires a **flat pitch contour with near-zero melodic motion** under pinyin/tone-narration. Suno's generative model tends to add subtle melody even with "no melody" prompts (trained on melodic music). ElevenLabs Music's API has explicit `instrumental` and `ambient/pad` type controls and is the only "agency-safe" provider with a cleanest API for agentic workflows [VERIFIED: Leg C / digitalapplied.com Apr 2026]. One asset — sign up for Self-Serve free tier (requires Eleven Music attribution) or the lowest paid tier for clean license. Alternatively, source from freesound CC0 (a pad/drone synth is available; see fallback below).

**Prompt:** `"pure ambient synth drone pad, single sustained chord, no melodic movement, no rhythm, no percussion, no vocals, warm low-frequency pad, 4 minutes, suitable as background under speech teaching Mandarin tones"`.

**License capture:** Same template as above but with ElevenLabs Music provider + tier. Free tier requires attribution ("Powered by Eleven Music") in video description — paid Self-Serve tier removes attribution requirement. [VERIFIED: prior palette brief / elevenlabs.io/eleven-music-v1-terms]

**Fallback:** search freesound.org for `tag:drone tag:pad license:0` (CC0), download a synthesized pad WAV ~2-3 min, verify by ear it has no melodic contour, apply the EQ carve.

---

#### 3. Pixabay Music (FALLBACK only — beds 2-3 if Suno not available)

**Why fallback:** No attribution required, commercial embedded use OK, free [VERIFIED: prior palette brief]. BUT some Pixabay Music tracks carry active Content-ID fingerprints even after download [VERIFIED: Leg C / prior palette brief]. Using it as primary bed source introduces a non-zero Content-ID dispute risk on every upload.

**If used:** Download from pixabay.com/music, filter by `BPM 60-80`, `Genre: Children`, verify the specific track has no Content-ID flag visible on the download page. Save the download receipt (URL + timestamp) as `<name>.license.txt` alongside the proof that the track was downloaded (screenshot of the Pixabay license page for that specific track). Run the EQ carve + apad pass same as Suno beds.

---

### SFX (~6 assets) — ranked source order

#### 1. freesound.org CC0 via APIv2 token auth (PRIMARY — all SFX)

**Why first:** freesound APIv2 allows download with simple token auth (no OAuth for read+download); CC0 license is unambiguous — no attribution, no Content-ID, perpetual commercial + app-embed. The asset class (UI/interaction SFX) is extremely well-represented. [VERIFIED: Leg C / freesound.org/docs/api/authentication.html]

**Steps:**
1. Apply for an API key at freesound.org/apiv2/apply (free, instant for small projects). [VERIFIED: Leg C]
2. For each SFX, search with: `GET https://freesound.org/apiv2/search/text/?query=<term>&filter=license:"Creative+Commons+0"&fields=id,name,previews,license,duration&token=<your_key>`.
3. From results, pick by ear (use the preview URL from `previews["preview-hq-mp3"]`), pick shortest that reads clearly (target <1.5 s per palette brief).
4. Download: `GET https://freesound.org/apiv2/sounds/<id>/download/?token=<your_key>` → save as WAV to `public/audio/_sfx/<name>.wav`.
5. Save `public/audio/_sfx/<name>.license.txt`:
```
Source: freesound.org  https://freesound.org/s/<id>/
Author: <username from API response>
License: CC0 1.0 Universal  https://creativecommons.org/publicdomain/zero/1.0/
Downloaded: <YYYY-MM-DD>
Query used: <search term + filter string>
```

**Search terms per SFX asset:**
| Asset | freesound query | Duration target | Notes |
|---|---|---|---|
| `pop` | `pop UI notification` | 0.1–0.4 s | Must be soft; avoid "bubble pop" — too wet |
| `chime` | `chime shimmer bright reward` | 0.3–1.0 s | Light, high-pitched; avoid bell that sustains too long |
| `whoosh` | `whoosh transition swipe` | 0.3–0.8 s | Low-pass post-download (`ffmpeg -af lowpass=f=3000`) to tame high-end [VERIFIED: Leg B / Vane Motion] |
| `tick` | `tick click short digital` | 0.05–0.2 s | Crisp, clean; optional: collect 5 in rising pitch for the count-step sequence |
| `ta-da` | `success fanfare jingle children` | 0.8–1.5 s | Bright, major; the only "big" SFX per lesson |
| `whoosh-soft` | `swipe soft whoosh subtle` | 0.2–0.5 s | Optional lighter version for section changes vs major transitions |

**Post-download processing for all SFX:**
- Normalize peak to -18 dBFS: `ffmpeg -i input.wav -af "loudnorm=I=-18:TP=-1:LRA=5" output.wav` [VERIFIED: prior design brief Spec 1 / SFX level]
- Trim any leading silence: `ffmpeg -i input.wav -af silenceremove=start_periods=1:start_silence=0.02:start_threshold=-50dB output.wav`
- Verify duration <1.5 s [VERIFIED: palette brief / Duolingo-style SFX guidance]

---

#### 2. Pixabay SFX section (FALLBACK — if a specific SFX unavailable on freesound CC0)

Same commercial-embed OK, no attribution, same Content-ID caveat as beds. freesound CC0 SFX almost always covers the needed vocabulary — Pixabay SFX should only be needed if a specific timbre isn't found after a 10-minute freesound search. Same license-capture protocol.

---

### Stings — `public/audio/_stings/` (1–2)

- **`intro-sting`** — generate in Suno Pro alongside the beds (same session). Prompt: `"4-second upbeat children's educational intro jingle, bright piano + glockenspiel, major key, energetic but not loud, no vocals, ends cleanly"`. Apply EQ carve + normalize.
- **`mandarin-accent-sting`** — see bed #4 above (can live in either `_beds/` or `_stings/`; move to stings if it's used only as a one-shot intro accent).

---

## What's working (claimed)

- [E] **freesound APIv2 token auth is functional for download** — the auth docs (Leg C) confirm token-only for read + download; OAuth2 only needed for write/upload. Token-key-in-header pattern is the same as the GitHub YouTube-Automation-Bot bulk pipeline example [VERIFIED: Leg C / github.com/PrintN]. No rate limit published, but the Bot example runs in bulk without hitting limits.
- [Y] **AI music gen reduces sourcing from ~47-minute hunts to ~1 minute** per track (Tech with Ayrass, 2026, Leg B). For a one-time library of ~8 beds this saves perhaps 4 hours of manual search.
- [E] **Suno v5 (late 2025)** has 12-stem export + MIDI on Premier tier ($30/mo); Pro ($10/mo) covers our needs (we only need the WAV). No public Suno API as of Apr 2026 — MANUAL generation via web UI is the only path. [VERIFIED: Leg C / jam.com Mar 2026]
- [E] **ElevenLabs Music is the cleanest API path if programmatic generation becomes needed** — best for agentic workflows, explicit instrumental flag, "agency-safe" (no pending lawsuits), quality one tier below Suno for melodic content but adequate for ambient/pad. [VERIFIED: Leg C / digitalapplied.com Apr 2026]
- [Y] **"Royalty-free" ≠ copyright/Content-ID safe** — the distinction that a license = unlimited-use permission, NOT ownership, means the original Content-ID fingerprint can still fire even with a valid license. Only CC0 + AI-generated (no pre-existing fingerprint) are truly claim-proof. [VERIFIED: Leg B / Envato Tuts+ 2022]

## What's broken / contested

- [R: BLOCKED] **Practitioner horror stories on Content-ID claims for specific libraries** — Reddit was 403 on all three research passes. The YouTube-based confirmation (Leg B: "trending sounds get copyright claimed 2 weeks later") partially substitutes but doesn't name specific platforms or show data.
- [E] **Suno training-data lawsuits still IN FLIGHT as of Apr 2026** [VERIFIED: Leg C / jam.com]. This is a platform risk (Suno could be shut down or terms could change), not a use-risk for tracks already generated and downloaded under a Pro license. The mitigation: generate all beds in one session now, store WAVs locally, cancel subscription — WAVs are perpetual under the Pro license.
- [E] **Udio legal footing is better post-UMG/WMG settlement (Oct–Nov 2025)** but commercial API is still limited/waitlisted. [VERIFIED: Leg C] Not a viable path for this build.
- [Y/E] **Mubert is excluded** — no app-embedding clause in the Render subscription agreement [VERIFIED: prior palette brief]. Leg B's Mubert Fuse/Maraca auto-scoring tool is genuinely useful for future LONG-form work but inapplicable here (we duck deterministically with `interpolate()`, not auto-score).
- [ASSUMED] **Pixabay Music Content-ID exposure** — the Leg C finding says "some tracks still carry Content-ID"; this is a known-but-unquantified risk. No percentage is available. Use as fallback only.

## Numbers worth verifying

- Freesound APIv2 exact rate limit — not published in their docs [Leg C notes "no published rate-limit number"]. For a one-time ~6 download session, irrelevant; for any future bulk-automation, test empirically before looping.
- Pixabay Music API music-only endpoint — the Leg C gap-item. If Pixabay is used as fallback for beds, the manual web download + receipt path is safer than the API (avoids accidental re-licensing edge cases from programmatic bulk download).
- ElevenLabs Music API pricing + `instrumental` flag behavior — Leg C notes this as an open gap. For the tone-safe-pad specifically, test a free-tier generation to confirm the "no melodic contour" prompt is honored before subscribing.
- Suno API availability — Leg C confirms still waitlist/limited as of Apr 2026. For manual generation this is irrelevant. If per-lesson programmatic generation is ever needed, revisit ElevenLabs Music API (it's the only one with a real endpoint today).

## Recommended decision

**SFX: freesound CC0 via APIv2 token + manual ear-check.**
**Beds: one Suno Pro session (web UI) for all melodic beds; one ElevenLabs Music generation (or freesound CC0 pad) for the tone-safe drone.**

**Justification:**

1. **Scale argument.** This is ~12 assets, built once. Heavy API automation is engineering overhead with no payoff. A single Suno Pro web session (~30 min) + a freesound APIv2 token search (~20 min) gets the whole library. Cancel Suno Pro after the session — WAVs are perpetual.

2. **Quality argument.** Suno's prompt-following for `BPM + key + instrumentation` is the best available for melodic beds [Leg C; Leg B]. Freesound CC0 is the gold standard for UI SFX — the category exists in abundance.

3. **License argument.** Suno Pro = perpetual commercial license, multi-platform, app-embed OK [prior palette brief]. CC0 = no restrictions, no Content-ID fingerprint, no attribution. Together they cover every constraint (offline, deterministic, monetized, multi-platform, possible app-embed).

4. **Tone-safe pad exception.** The pinyin/tone lesson hard constraint — a flat-pitch drone, no melodic contour — is difficult to guarantee with Suno. ElevenLabs Music's ambient/pad mode is better-controlled; the free tier works if attribution is acceptable (add "Music by ElevenLabs" in description), or pay one month of Self-Serve and cancel. Fallback: search freesound for a CC0 synthesized pad (query: `tag:drone tag:ambient tag:pad license:0 duration:[120 TO 300]`) — zero cost.

5. **Exclusions.** Mubert excluded (no app-embed). YouTube Audio Library excluded (YouTube-only). Udio excluded (no public API, unsettled commercial terms). Pixabay Music is a fallback only (Content-ID risk).

**The one-session action plan:**
1. Open freesound.org/apiv2/apply → get token → run the 6 SFX searches from the playbook above → download WAVs → post-process + write license files. (~20 min)
2. Subscribe to Suno Pro → generate 4 beds + 1 intro sting using prompts above → download WAVs → apply EQ carve + apad → write license files → cancel subscription. (~35 min)
3. For tone-safe pad: try ElevenLabs Music free tier first (prompt above) → verify by ear → if melodic contour present, fall back to freesound CC0 pad.
4. Run `ffmpeg` loudnorm + EQ carve on all beds (one bash loop — see Spec 1 in `music-sound-design.md`).
5. Commit to `public/audio/{_beds,_sfx,_stings}/` + license files. Update `_SOURCING.md` placeholders.

---

## Open questions / gaps

- **O-S1** [Leg C gap] Freesound rate limits for bulk automation — irrelevant for this 6-asset build; document if automation ever scales.
- **O-S2** [Leg C gap] Pixabay Music API music-only endpoint terms — resolve before any Pixabay API-driven bed workflow (use manual download + receipt in the meantime).
- **O-S3** [Leg C gap] ElevenLabs Music free tier `instrumental` flag + "no melodic contour" prompt reliability — test empirically before committing to it for the tone-safe pad.
- **O-S4** [Leg A: BLOCKED] Practitioner Content-ID horror stories for specific libraries — Reddit 403 still blocks the third consecutive pass. Re-run with `reddit-mcp-buddy --auth` to get r/NewTubers + r/VideoEditing confirmations. Until then: trust the Leg B/Leg C cross-confirmation (Envato Tuts+ + Leg C "some Pixabay tracks carry Content-ID") and default to CC0/AI-generated.
- **O-S5** [Assumed] Are there CC0 high-quality pentatonic dizi samples on freesound? — search `tag:dizi tag:chinese license:0` before attempting Suno for the mandarin-accent-sting; a real dizi recording will beat a Suno synthesis on authenticity.

---

## Next moves

1. **freesound token**: apply at freesound.org/apiv2/apply → run the 6-query SFX build session. Save token in local `.env` (gitignored).
2. **Suno Pro session**: generate all 4 melodic beds + intro sting in one sitting using exact prompts above → download WAVs → apply `ffmpeg` EQ carve + apad → commit with license files.
3. **Tone-safe pad**: ElevenLabs Music free-tier test first → ear-verify → commit or fall back to freesound CC0 pad.
4. **Update `public/audio/_SOURCING.md`** (already exists per prior brief) with actual asset names, sources, and per-asset license status once the library is built.
5. **Reddit unblock**: run `reddit-mcp-buddy --auth` before any future research pass (this is the THIRD consecutive 403 — the unauthenticated MCP is consistently rate-limited and should never be used for production research again).
6. **BabyBus / Super Simple Songs yt-rag ingest** (from prior palette brief next-moves): before the Suno session, optionally ingest one episode each for sonic reference — but don't let it block the sourcing session.
7. **Verify the tone-safe pad works** by rendering `pinyin-four-tones` lesson with it and doing a listen-through against the `toneSafe: true` guard. Confirm: spoken lexical tones are unambiguous over the bed.

---

## Sources

### Reddit
**BLOCKED** — `mcp__reddit__*` returned HTTP 403 "Access forbidden" on all queries across three consecutive research passes (this brief + two prior). The MCP runs unauthenticated (10 req/min cap). No Reddit data gathered for any of these three briefs. Practitioner-tier confirmations (Content-ID claims, looping notices, kids-content gotchas) remain outstanding. Re-run REQUIRES `reddit-mcp-buddy --auth`.

### YouTube (yt-rag — deep-links)
- Tech with Ayrass — "How I Score My Videos in 60 Seconds" — Maraca/Mubert auto-scoring; Suno vs Mubert comparison; "sometimes 3 tries" on first generation — https://youtu.be/5gUeH00rGZE?t=2 , https://youtu.be/5gUeH00rGZE?t=276
- Tech with Ayrass — AI scoring needs no keywords; Suno/Udio one-shot non-iterative — https://youtu.be/5gUeH00rGZE?t=94
- Envato Tuts+ — royalty-free ≠ copyright-safe; license = unlimited use, NOT ownership; Content-ID still fires — https://youtu.be/oDjAiDUq-QY?t=459
- Envato Tuts+ — music must not compete with VO; ~-40 dB under narration — https://youtu.be/oDjAiDUq-QY?t=550
- How To 1 Minute — audio ducking sidechain params — https://youtu.be/T4cS2iA1eXs?t=3
- Brett Albano — without ducking, music takes over dialogue — https://youtu.be/6-_TIanP9Co?t=1
- Vane Motion — tame whoosh with low-pass, pull to ~-14/-15 dB — https://youtu.be/NUQyUctGQIQ?t=2291

### Exa (web)
- digitalapplied.com (Apr 28 2026) — ElevenLabs Music = only agency-safe + cleanest API; Suno v4.5/v5 lawsuits; quality ordering — https://www.digitalapplied.com/blog/ai-music-generation-platforms-suno-udio-elevenlabs-2026
- freesound.org API auth docs — token auth for read+download; OAuth2 for write/upload — https://freesound.org/docs/api/authentication.html
- jam.com (Mar 2026) — Suno v5 12-stem + MIDI on Premier; API waitlist; Udio post-settlement; Soundraw; Riffusion; AIVA — https://jam.com/resources/best-ai-music-generators-2026
- github.com/PrintN — YouTube-Automation-Bot bulk Pixabay + freesound pipeline — https://github.com/PrintN/YouTube-Automation-Bot
- Prior palette brief licensing verdicts (primary ToS): suno.com/terms; elevenlabs.io/eleven-music-v1-terms; mubert.com subscription agreement; freesound CC0 FAQ; pixabay.com/service/terms

---

## Method notes

Legs run: A (Reddit) — **BLOCKED 403, third consecutive pass**; B (yt-rag) — ran, 8 scored findings (Maraca/Mubert/Suno comparison + mixing practice + Content-ID education); C (Exa) — ran, primary-source heavy (freesound auth, provider quality+licensing, bulk pipeline example). This brief synthesizes only — no new searches run. The "how to obtain" question is fully answerable from Leg B+C + prior palette brief licensing verdicts; Reddit data remains a gap for practitioner anecdote confirmation only (it would not change the primary recommendation).

## Progress

- 2026-05-29 — **Freesound API auth CORRECTED** (TL;DR/Leg C said token download — wrong). Verified against freesound.org/docs/api: original-quality download requires **OAuth2**; token covers search + `previews` (mp3/ogg) only. SFX recipe → either one-time OAuth2 browser auth for WAVs, or accept preview quality (fine for <1.5 s SFX).
- 2026-05-29 — **Synthesis leg tested ahead of the burst build** (the "synth →" head of the synth→Suno→Pixabay order). `fluidsynth 2.5.4` + **FluidR3_GM.sf2 (MIT)** → real 4-voice C-major bed (string pad + e-piano + glockenspiel + bass, C–Am–F–G, 68 BPM). Objectively real music, not the sine-drone failure mode: crest ~5.4 (drone≈1.4), flat-factor 0. **Integrated into the comparison lesson** (`remotion-svg-primitives/out/_synth-test/` + re-rendered MP4): in-mix crest 4.39, 0 silent gaps, win peak −2.5 dB, −15.7 LUFS. Verdict: clears the no-mock bar; GM string patch slightly synthy on sustains → **Suno preferred for final bed warmth**. SFX synth clean.
- 2026-05-29 — **Mix-level fix shipped** independently in commit `715bf88` `fix(sound)` (per-utterance duck spans via `spokenSpansFromSilences` + bed/SFX gains + −3 dBFS SFX normalize + outro sting). User confirms voice now audible.
- 2026-05-29 — **DECISION (user):** build the curated library in ONE short burst of generation calls (Suno-preferred beds + synth/freesound SFX), capture per-asset license, then **drop the subscription** — no per-render API; renders read local WAVs forever. DEFERRED (next session): full 185 s library build; `tone-safe-pad` must be melody-free; replace placeholder outro sting; beds authored ≥185 s so the kit `Html5Audio` loop never fires. Status mirrored to memory `sound-asset-library-status`.
