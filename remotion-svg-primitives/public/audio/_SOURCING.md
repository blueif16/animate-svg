# Audio asset sourcing — real-asset shortlist (placeholder swap-in)

**Date:** 2026-05-29
**Sourcing decision (locked):** CC0 freesound + Pixabay Music/SFX only.
**Status:** every WAV currently in `_sfx/`, `_beds/`, `_stings/` is a **locally
synthesized PLACEHOLDER** (ffmpeg, trivially CC0). They make the pipeline run
end-to-end and offline NOW. This file is the human swap-in queue: for each asset,
1–2 specific real CC0/Pixabay candidates so a person can download, verify, and
replace the placeholder later. Filenames must stay byte-identical (the runtime
hardcodes the paths — see `src/lesson-media/sfx.ts` + `LessonBgmLayer.tsx`).

## Why a shortlist and not a download

Autonomous download from freesound/Pixabay needs an API key or login, and renders
must stay deterministic + offline. So the placeholders ship now; the real assets
are a deliberate, reviewed, human step. Do NOT wire any download into the render
path. The chosen candidates below are starting points — confirm the live license
string on the page at download time (freesound sounds can change license; Pixabay
content can be removed or carry Content-ID).

## Licensing rules to enforce at swap-in (from the proposal §5 / research §licensing)

- **freesound:** CC0 ONLY. CC-BY needs attribution; **CC BY-NC is NOT monetizable** — reject it.
- **Pixabay Music/SFX:** commercial embedded use OK, no attribution required; **cannot
  redistribute the file standalone**; **some tracks carry Content-ID** — verify per
  track and keep the download as dispute proof.
- Save the real `<name>.license.txt` next to the WAV with these fields (replacing the
  placeholder text):
  - `source:` the exact sound/track page URL
  - `license:` the verified license string copied from that page (e.g. "Creative Commons 0" / "Pixabay Content License")
  - `date:` retrieval date (absolute YYYY-MM-DD)
  - `cleared for monetized children's media: yes` (only after confirming the two rules above)
  - `content-id:` note Yes/No for Pixabay tracks; if Yes, keep the download receipt path
- Normalize on swap-in to match the placeholder envelope so the mix constants still hold:
  SFX peak roughly -18 dB and < 1.5s; beds ≥ 180s, peak ~0.30 linear (~-10.5 dB), no vocals;
  the proposal also wants an author-time -4 dB EQ shelf 800–3000 Hz baked into beds.

---

## SFX — `_sfx/` (each < 1.5s, brighter, clean, no vocals)

### pop.wav — soft entrance pop (~0.12s)
- freesound (CC0): search "pop ui" / "bubble pop" — e.g. https://freesound.org/search/?q=pop+ui+short&f=license:%22Creative+Commons+0%22+duration:[0+TO+1] ; pick a short tonal blip, ~0.1–0.2s.
- Pixabay SFX: https://pixabay.com/sound-effects/search/pop/ (filter short) — "pop" / "bubble pop" one-shots, ~0.1–0.3s, Pixabay Content License.

### chime.wav — light reward shimmer (~0.5–0.7s)
- freesound (CC0): https://freesound.org/search/?q=chime+bell+shimmer&f=license:%22Creative+Commons+0%22 — bright bell/shimmer, ~0.5–0.8s.
- Pixabay SFX: https://pixabay.com/sound-effects/search/chime/ — "success chime" / "magic shimmer", ~0.5–0.9s.

### whoosh.wav — transition (~0.4s)
- freesound (CC0): https://freesound.org/search/?q=whoosh+transition&f=license:%22Creative+Commons+0%22+duration:[0+TO+1] — soft low-passed whoosh, ~0.3–0.6s. Pull to ~-15 dB on swap-in.
- Pixabay SFX: https://pixabay.com/sound-effects/search/whoosh/ — "soft whoosh transition", ~0.3–0.6s.

### tick.wav — count step (~0.05–0.08s, short & tonal ~800–1000Hz)
- freesound (CC0): https://freesound.org/search/?q=tick+click+ui&f=license:%22Creative+Commons+0%22+duration:[0+TO+0.5] — a short tonal click/tick. Keep it short so the rising-pitch playbackRate ramp stays crisp.
- Pixabay SFX: https://pixabay.com/sound-effects/search/tick/ — "clock tick" / "ui click", trim to ~0.05–0.08s.

### ta-da.wav — success (~0.6s, ascending)
- freesound (CC0): https://freesound.org/search/?q=tada+success+win&f=license:%22Creative+Commons+0%22+duration:[0+TO+1.5] — short two-note "ta-da" / success jingle.
- Pixabay SFX: https://pixabay.com/sound-effects/search/success/ — "ta da" / "level complete" short cue, ~0.6–1.2s (trim < 1.5s).

---

## Beds — `_beds/` (≥180s, calm, no vocals, peak ~0.30)

Beds are the hardest to source CC0 at ≥180s. Two viable real-asset routes:
1. **Pixabay Music** (lo-fi / calm-kids / meditation playlists) — many tracks are
   2–4 min, no vocals, Pixabay Content License. Best match for "ship a real bed".
2. **freesound CC0 ambient/pad loops** — usually shorter; concatenate/extend to
   ≥180s at author-time (loop-with-crossfade) and re-verify length + peak.

### math-calm-68-cmaj.wav — soft major pad, ~68 BPM, flat dynamics
- Pixabay Music: https://pixabay.com/music/search/calm%20kids/ or https://pixabay.com/music/search/lo-fi%20calm/ — pick a soft-piano + pad track, major, no vocals, 2–4 min, ~60–70 BPM.
- freesound (CC0): https://freesound.org/search/?q=soft+pad+c+major+calm&f=license:%22Creative+Commons+0%22+duration:[60+TO+600] — extend to ≥180s if shorter.

### literacy-playful-76.wav — brighter major pad / mallet feel
- Pixabay Music: https://pixabay.com/music/search/playful%20kids/ — light ukulele/glockenspiel/mallet, major, ~70–80 BPM, no vocals.
- freesound (CC0): https://freesound.org/search/?q=playful+mallet+glockenspiel+loop&f=license:%22Creative+Commons+0%22 — extend to ≥180s.

### tone-safe-pad.wav — FLAT drone, minimal pitch movement (pinyin/tone lessons)
- Pixabay Music: https://pixabay.com/music/search/drone%20ambient/ or https://pixabay.com/music/search/meditation%20pad/ — a flat sustained pad/drone, NO melodic motion, no vocals.
- freesound (CC0): https://freesound.org/search/?q=drone+pad+sustained+ambient&f=license:%22Creative+Commons+0%22+duration:[60+TO+600] — confirm minimal pitch contour (critical: must not compete with spoken lexical tone).

### celebration-resolve.wav — fuller conclusive major pad
- Pixabay Music: https://pixabay.com/music/search/uplifting%20calm/ — a warm major track that resolves to tonic, no vocals.
- freesound (CC0): https://freesound.org/search/?q=major+resolve+warm+pad&f=license:%22Creative+Commons+0%22 — extend to ≥180s.

---

## Stings — `_stings/` (~3–5s)

### soft-rise.wav — gentle rising intro flourish (~4s)
- freesound (CC0): https://freesound.org/search/?q=rise+intro+swell+soft&f=license:%22Creative+Commons+0%22+duration:[2+TO+6] — a soft ascending swell, ~3–5s.
- Pixabay SFX/Music: https://pixabay.com/sound-effects/search/rise/ — "soft riser" / "intro swell", ~3–5s.

---

## Swap-in checklist (per asset)

1. Download the chosen file; confirm the LIVE license string on the page (CC0 for
   freesound; Pixabay Content License + Content-ID check for Pixabay).
2. Normalize: SFX → < 1.5s, peak ~-18 dB, no vocals; beds → ≥ 180s, peak ~0.30
   linear, no vocals, -4 dB EQ shelf 800–3000 Hz; sting → 3–5s.
3. Save over the placeholder WAV with the EXACT same filename.
4. Replace `<name>.license.txt` with the real source/license/date/clearance fields.
5. Update the matching `_index.json` row's `license` + `lengthSeconds`.
6. Re-run `ffprobe` duration + a `volumedetect` peak check; confirm no clipping.
