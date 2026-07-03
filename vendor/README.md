# Vendor reference library — Remotion best-practice study (2026-07-03)

Shallow clones (`--depth 1`) of external Remotion repos, selected via Exa research for two
questions: **(A)** how production codebases prevent overlay/layout defects (text + box sizing,
flexible-but-structured layouts) and **(B)** how they coordinate narration audio with visuals.
Everything here is gitignored except this README. Re-clone any repo with:
`git clone --depth 1 --single-branch <url> vendor/<name>`.

Findings live in `research/remotion-vendor-best-practices-2026-07-03.md`.

| Dir | Repo | Pinned SHA | Why cloned |
| --- | --- | --- | --- |
| `remotion/` | https://github.com/remotion-dev/remotion (52K★) | 8130c9d | The framework monorepo: `packages/layout-utils` (measureText/fitText/fillTextBox), `packages/captions` (Caption type, createTikTokStyleCaptions), whisper integrations — line-level ground truth |
| `skills/` | https://github.com/remotion-dev/skills (4K★) | 8dad6ec | Official 2026 agent-skill rules: `video-layout.md` (overlap prevention by construction, safe areas, text minimums), `measuring-text.md`, `subtitles.md`, `calculate-metadata.md` |
| `recorder/` | https://github.com/remotion-dev/recorder | 1512730 | Remotion's own production app: automatic scene layout (webcam+screen), whisper captions, font-loaded measurement patterns |
| `github-unwrapped/` | https://github.com/remotion-dev/github-unwrapped | ece8397 | Remotion's flagship production video app (GitHub Wrapped): data-driven scenes at scale |
| `template-tiktok/` | https://github.com/remotion-dev/template-tiktok (260★) | 386ec6a | Canonical word-timestamp caption template (whisper.cpp → Caption[] → TikTok pages) |
| `template-audiogram/` | https://github.com/remotion-dev/template-audiogram | 24b1b26 | Canonical audio-driven visuals template (waveform + subtitle sync) |
| `short-video-maker/` | https://github.com/gyoridavid/short-video-maker (1.2K★) | 9bb9a21 | Production shorts generator: kokoro TTS → whisper alignment → Remotion scenes, MCP/REST driven |
| `remotion-superpowers/` | https://github.com/DojoCodingLabs/remotion-superpowers | 9cd0466 | Practice codification: `voiceover-sync.md` (TTS-first timing), add-voiceover/transcribe command workflows, ducking |
| `editor-pro-max/` | https://github.com/Hainrixz/editor-pro-max (195★) | 743f46c | NL→MP4 agent editor: 25 components, 9 templates, 7 skills — component/template layout system |
| `remotion-cinematic/` | https://github.com/codeverbojan/remotion-cinematic | 18dbb50 | Zone-based layout engine, prop-driven choreography, snap guides, editable window layout |
| `claude-video-kit/` | https://github.com/runesleo/claude-video-kit (103★) | a41b174 | JSON script → vertical video: dual TTS backend, narration/caption/visual sync pipeline |
| `vanta/` | https://github.com/itsjwill/vanta (70★) | 1923e9e | Local AI video engine: whisper-server word timestamps, animated captions, transitions |
