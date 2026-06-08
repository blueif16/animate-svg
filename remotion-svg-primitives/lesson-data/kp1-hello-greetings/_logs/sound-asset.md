# W3c — Sound-Asset Gap-Scan — kp1-hello-greetings

**Status:** OK — clean REUSE pass. Every key in `audio-cues.json` resolves to a licensed, valid WAV in the shared library. Zero gaps; nothing minted; nothing to freeze.

## INPUTS READ
- `lesson-data/kp1-hello-greetings/audio-cues.json` — the keys this lesson uses.
- `lesson-data/kp1-hello-greetings/pedagogy.md` — context (English greeting routines; literacy lesson, `toneSafe:false` is correct — no tone-language guard needed).
- `.agents/skills/lesson-sound-design/SKILL.md` (asset side).
- Shared library indexes: `/Users/tk/Desktop/shared-sound/public/audio/_beds/_index.json`, `_sfx/_index.json`, `_stings/_index.json`.
- Runtime key→path mapping (to avoid assuming resolution): `@studio/sound-kit` (= `/Users/tk/Desktop/shared-sound/src`):
  - `components/BgmLayer.tsx:36` → bed = `public/audio/_beds/${bed}.wav`
  - `audioCuesTypes.ts:32` → `intro.sting` = `public/audio/_stings/${sting}.wav`
  - `sfx.ts:49–54` → SFX_REGISTRY: `pop`→`audio/_sfx/pop.wav`, `chime`→`audio/_sfx/chime.wav`, `whoosh`→`audio/_sfx/whoosh.wav`.

## KEY → RESOLVED FILE (all via lesson-repo symlinks → shared-sound)
The lesson repo `public/audio/{_beds,_sfx,_stings}` are symlinks → `/Users/tk/Desktop/shared-sound/public/audio/...`, so renders resolve these offline-deterministically.

| audio-cues key | type | resolved file | license file | valid? |
|---|---|---|---|---|
| `literacy-playful-76` | bed | `_beds/literacy-playful-76.wav` (185.05s) | `_beds/literacy-playful-76.license.txt` | RIFF PCM 16-bit stereo 44100 Hz ✓ |
| `kids-section-lift` | intro.sting | `_stings/kids-section-lift.wav` (1.41s) | `_stings/kids-section-lift.license.txt` | RIFF PCM 16-bit stereo 48000 Hz ✓ |
| `whoosh` | sfx (intro/transition) | `_sfx/whoosh.wav` (0.30s) | `_sfx/whoosh.license.txt` | RIFF PCM 16-bit mono 48000 Hz ✓ |
| `pop` | sfx (meet-hello / intro-self / part-goodbye popins) | `_sfx/pop.wav` (0.18s) | `_sfx/pop.license.txt` | RIFF PCM 16-bit mono 48000 Hz ✓ |
| `chime` | sfx (recap reward) | `_sfx/chime.wav` (0.39s) | `_sfx/chime.license.txt` | RIFF PCM 16-bit mono 48000 Hz ✓ |
| `outro.resolve: true` | (no asset) | — bed-envelope rise on the already-loaded `literacy-playful-76` bed; BgmLayer plays no separate `_stings` outro file | n/a | n/a |

All licenses: "ElevenLabs Eleven Music / Sound Effects (API) — commercial via paid plan" (per-asset `.license.txt` present).

## COMMANDS RUN
- `ls -la` on shared-sound `_beds/_sfx/_stings` + lesson-repo `public/audio` — exit 0; confirmed symlinks and WAV+license presence.
- `cat` the three `_index.json` files — exit 0.
- `grep` in `@studio/sound-kit/src` for the key→path mapping — exit 0; mapping confirmed (not assumed).
- `file -b` on the 5 used WAVs — exit 0; all valid RIFF PCM WAVE audio (no zero-byte placeholders).

## KEY DECISIONS
- **REUSE only — no mint.** All keys resolve; no spec row added to `vlog_test/pipeline/sound-assets.manifest.json`, no `generate-sound-assets.mjs` run. Nothing to freeze.
- **`outro.resolve` needs no asset.** Verified BgmLayer references no `_stings` outro file; resolve is the bed envelope rising as the last narration ends. So there is no outro key to resolve.
- **`toneSafe:false` is correct** for this English-literacy lesson — no tone-language guard applies, melodic bed is fine.
- Did NOT touch render path, manifests, WAVs, or any code. Read-only scan + log write.

## ISSUES
- None blocking. The repo-root `git status` shows the shared `public/audio/_beds|_sfx|_stings` `_index.json` and `.license.txt` files as deleted/added/typechanged in the working tree — these are shared-library bookkeeping outside this node's scope and outside this lesson. Flagged in pipelineFindings; not edited here.

## PIPELINE FINDINGS (workflow backlog)
- The W3c node has no programmatic resolver to invoke — resolution is a manual cross-check of `audio-cues.json` keys against three `_index.json` files plus a grep into `@studio/sound-kit` for the key→path mapping. A tiny shared `npm run sound:check -- --cues <audio-cues.json>` (resolve every bed/sting/sfx key against the registry + on-disk WAV + `.license.txt`, print resolved table or list gaps) would make this an O(1) deterministic gate instead of an ad-hoc ls/grep pass, and would also catch the symlink-broken case.
- The lesson-repo `public/audio/_index.json` + `.license.txt` files appear churned in `git status` (deleted in index / added in worktree). Worth confirming the shared-sound symlink target is the single source of truth so these don't keep showing up dirty across lessons — a recurring noise source for every sound node.
- `audioCuesTypes.ts` documents `intro.sting` → `_stings/`, but the SKILL's intro-sting examples (`mandarin-accent`) don't match the actual library sting names (`kids-section-lift`, `sting-section-riser*`). The SKILL's sting vocabulary table is stale vs the minted library; aligning it would stop W2c from authoring a sting key that W3c then has to reconcile.
