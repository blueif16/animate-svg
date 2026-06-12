#!/usr/bin/env node
// Deterministic audio gate (v4 cue-anchored audio). Runs right after voice
// generation — NOT at full-gen — so an audio defect is caught in seconds, by
// tool, before render + before a human ever has to listen. Three pure-
// deterministic HARD checks gate `pass` (drone / empty-short / dead-air), plus
// one ADVISORY signal (truncation) that only WARNs and never blocks:
//
//   1) HELD-VOWEL DRONE — Gemini renders an in-text ellipsis ("I'm…… Sam") as a
//      sustained held vowel/nasal, a 5s drone the listener hears as "white
//      noise". Signature: a run >= MIN_DRONE_SECONDS of steady, loud, low-
//      zero-crossing audio. An intra-cue pause must be a typed gap or sub-beat,
//      never in-text dots (see the lesson-audio-captions / cue-plan-author
//      skills + the generator's held-vowel guard).
//   2) UNTRIMMED DEAD-AIR — each clip must be trimmed of TTS padding; large
//      leading/trailing silence means the trim regressed (→ timeline drift).
//   3) EMPTY / SHORT CLIP — a cue that authored a phrase but whose clip is
//      near-zero (narrationFrames <= 1, or audible duration < MIN_CLIP_SECONDS)
//      means the TTS silently failed to render that cue. Catastrophic on a
//      climax (a silent beat reads as "audio out of sync") yet invisible to the
//      drone + dead-air checks, so it gets its own gate.
//   4) TRUNCATION / COVERAGE — ADVISORY (NON-BLOCKING). Surfaces a NON-empty
//      clip that *might* stop mid-phrase (it spoke only the first few
//      characters/words and cut off). The clip is loud, trimmed, and long enough
//      to pass checks 1–3, but may be missing the END of the line. This is a
//      WARN only: it NEVER sets pass:false and never blocks the freeze. The
//      STRUCTURAL cure for mid-utterance truncation is the dedicated-TTS model
//      (gemini-…-tts-preview), which eliminates it at the source; this signal is
//      a noisy backstop that false-positives on clean renders (a longer Mandarin
//      sentence ASRs low even when fully spoken; a heterogeneous drill cue skews
//      the s/char cohort), so a clean render must never be blocked by it — it
//      only flags clips for a human spot-check. Two deterministic, language-
//      GENERAL signals (no lesson content, no magic absolute rate):
//        (a) ASR COVERAGE (GENERATION-INDEPENDENT) — tokenize the expected phrase
//            AND a per-cue transcription of what was ACTUALLY spoken, with
//            voice.json's tokenPattern (CJK char OR latin word), then coverage =
//            (expected tokens present, IN ORDER, in the transcription) / (expected
//            token count). The transcription is sourced ONLY from signals that do
//            NOT depend on the TTS model, in this precedence:
//              1. PER-CLIP ASR — the gate ASRs each cue's OWN clip WAV (via the
//                 sherpa config in voice.json + scripts/asr-clip-coverage.py).
//                 ASR runs on the rendered audio regardless of which TTS produced
//                 it, so this is the durable, principled "what was said" signal.
//                 (coverageSource: "asr-clip")
//              2. asr-alignment.json per-cue `asrText` — a FALLBACK used only when
//                 per-clip ASR can't run. NOTE: the kit's whole-recording ASR
//                 emits `asrText` as a window EXCERPT of one continuous transcript
//                 (overlapping, weaker per cue), so it is a backstop, not the
//                 primary. (coverageSource: "asr-align")
//              3. gemini-voice.json transcriptText self-report — corroborator ONLY
//                 when present (the Live path). The dedicated-TTS model DROPS it,
//                 which is exactly why coverage no longer DEPENDS on it.
//                 (coverageSource: "transcript")
//            We deliberately do NOT just reuse asr-alignment's matchScore — that
//            is a fuzzy window-fit ratio, not a measure of how much of the line
//            was spoken; coverage is computed fresh from the transcription tokens.
//        (b) DURATION SANITY — per-cue seconds-per-token vs the cohort: compute
//            this lesson's OWN median s/char and flag a cue whose s/char is far
//            below it (a clip much shorter than its peers for its length is cut).
//            Self-calibrating per lesson + voice — no hard-coded rate. A loose
//            absolute floor is kept only as a documented secondary backstop.
//      Coverage is calibrated COHORT-RELATIVELY (ASR is imperfect even on a full
//      clip, so a flat self-report floor would false-positive good cues): a cue
//      trips coverage if its coverage is far below THIS lesson's own median ASR
//      coverage (median × factor) OR below a loose absolute floor. No hard-coded
//      per-lesson value — the cohort baseline self-calibrates per lesson + model.
//      A cue is FLAGGED (advisory) if (a) trips OR (b) trips. This check was
//      added after the kptest-fenyuhe-six post-mortem (5/9 Mandarin cues were
//      silently cut mid-phrase and frozen, invisible to checks 1–3), but the
//      real fix turned out to be the dedicated-TTS model, which removes the
//      truncation at the source; the signal itself false-positived on the
//      re-voiced (cured) clips, so it is now ADVISORY, not a gate.
//
// Reads out/<id>/voice-clips.json (the generator manifest) + the per-cue clip
// WAVs + (for check 4a) per-clip ASR of those WAVs (else asr-alignment.json
// asrText, else gemini-voice.json transcriptText) + voice.json's tokenPattern +
// sherpa ASR config. Advisory by contract (CLAUDE.md: "the check is advisory, not blocking")
// — it prints a loud PASS/FAIL banner and writes a JSON report, but never blocks
// the build. A gate that cannot run prints `SKIP: <reason>` (never a silent
// pass). Exit code is 0 unless `--strict` is passed.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SR_FALLBACK = 24000;
const SILENCE_ABS = 180; // ~ -45 dB
const FRAME_SECONDS = 0.1;
const MIN_DRONE_SECONDS = 1.5; // a held vowel beyond this is not natural speech
const DRONE_ZCR_MAX = 0.07; // held vowel/nasal: very few zero crossings
const DRONE_RMS_DB_MIN = -28; // loud enough to be heard as a drone
const EDGE_SILENCE_MAX = 0.3; // trimmed clips should start/end on speech
const MIN_CLIP_SECONDS = 0.25; // a cue with a phrase is always longer; near-zero = TTS silently failed to render it

// --- TRUNCATION / COVERAGE (check 4) ---------------------------------------
// (a) ASR coverage: the fraction of the expected tokens (IN ORDER) that the
//     per-cue ASR transcription contains. Calibrated COHORT-RELATIVELY because
//     ASR is imperfect even on a fully-spoken clip (a small Mandarin model drops
//     ~10–25% of tokens on good audio), so a flat self-report-era floor (0.85)
//     would false-positive good cues. A cue trips coverage if it falls FAR below
//     this lesson's OWN median ASR coverage (median × factor) OR below a loose
//     absolute floor. Both are self-calibrating / language-general — no lesson id
//     and no per-lesson magic number.
//     COVERAGE_COHORT_FACTOR: a cue whose coverage < cohortMedianCoverage × this
//     is a truncation outlier relative to its peers (catches a cut even when the
//     whole cohort's ASR is noisy and the absolute floor would be too strict).
const COVERAGE_COHORT_FACTOR = 0.8;
//     COVERAGE_ABS_FLOOR: a loose absolute floor. On the kptest-fenyuhe-six bad
//     run the per-clip ASR coverages separated cleanly — truncated cues topped
//     out at 0.60 and the worst GOOD cue sat at 0.75 — so a floor inside that
//     (0.60, 0.75) gap flags every truncated cue with zero false-positives. We
//     sit at 0.70 (mid-gap), tuned from REAL numbers, not a guess.
const COVERAGE_ABS_FLOOR = 0.7;
// (b) duration sanity: flag a cue whose seconds-per-token is below this fraction
//     of the lesson's OWN cohort-median s/char. Self-calibrating per lesson +
//     voice — NOT a hard-coded rate. A truncated clip is far shorter than its
//     peers for the same token count; a fully-spoken line stays near the median.
const SCHAR_COHORT_FACTOR = 0.65;
// Secondary BACKSTOP only (NOT the primary mechanism): an absolute s/char floor
// below which any speech is implausibly fast for its token count, used to catch
// a cohort where (almost) every clip is itself truncated and the median is
// already depressed. The cohort-relative test above is the real signal.
const SCHAR_ABS_BACKSTOP = 0.18;
// At least this many phrased cues are needed before the cohort median is a
// trustworthy baseline; below it, fall back to the absolute floor(s) alone.
const MIN_COHORT_FOR_MEDIAN = 4;

// Tokenizer: split on the SAME pattern the ASR/voice config uses, so the check
// is language-general (a CJK char OR a latin word is one token). Falls back to a
// safe built-in if voice.json or its asr.tokenPattern is unavailable.
const DEFAULT_TOKEN_PATTERN = "[\\u3400-\\u9fff]|[A-Za-z']+";
const loadTokenizer = (configPath) => {
  let pattern = DEFAULT_TOKEN_PATTERN;
  let source = "default";
  try {
    const voiceJsonPath = configPath
      ? path.join(path.dirname(configPath), "..", "_shared", "voice.json")
      : path.join("lesson-data", "_shared", "voice.json");
    if (fs.existsSync(voiceJsonPath)) {
      const vj = JSON.parse(fs.readFileSync(voiceJsonPath, "utf8"));
      if (vj?.asr?.tokenPattern) {
        pattern = vj.asr.tokenPattern;
        source = voiceJsonPath;
      }
    }
  } catch {
    /* fall back to default below */
  }
  let re;
  try {
    re = new RegExp(pattern, "gu");
  } catch {
    re = new RegExp(DEFAULT_TOKEN_PATTERN, "gu");
    source = "default(invalid-pattern)";
  }
  return {
    source,
    pattern,
    tokenize: (s) => (typeof s === "string" ? s.match(re) || [] : []),
  };
};

// Resolve voice.json and return its full parsed object (for the sherpa ASR
// config) — same lookup the tokenizer uses, kept separate so each can fail
// independently. Returns null if unreadable (→ per-clip ASR SKIPs).
const loadVoiceJson = (configPath) => {
  try {
    const voiceJsonPath = configPath
      ? path.join(path.dirname(configPath), "..", "_shared", "voice.json")
      : path.join("lesson-data", "_shared", "voice.json");
    if (fs.existsSync(voiceJsonPath)) {
      return JSON.parse(fs.readFileSync(voiceJsonPath, "utf8"));
    }
  } catch {
    /* fall through to null */
  }
  return null;
};

// The streaming ASR emits filler markers ("sil" silence, stray "s") as tokens
// under the latin part of the token pattern. They are not spoken words, so they
// must be stripped before coverage — otherwise a noisy "sil sil" stretch would
// inflate `got` and a truncated clip could look covered.
const ASR_JUNK_TOKENS = new Set(["sil", "s"]);
const stripAsrJunk = (tokens) =>
  tokens.filter((t) => !ASR_JUNK_TOKENS.has(t.toLowerCase()));

// Per-clip ASR (generation-independent coverage source #1). ASRs each cue's OWN
// trimmed clip WAV via the sherpa config in voice.json + the python sidecar.
// Returns a Map<clipSrc, asrText> (asrText may be ""/null per clip), or null if
// it cannot run (no sherpa config / python / assets) so the gate falls back.
const runPerClipAsr = (voiceJson, clips, publicRoot) => {
  const py = voiceJson?.sherpaPython;
  const asr = voiceJson?.asr;
  if (!py || !asr?.decoder || !asr?.encoder || !asr?.joiner || !asr?.tokens) {
    return null;
  }
  const helper = path.join(path.dirname(fileURLToPath(import.meta.url)), "asr-clip-coverage.py");
  if (!fs.existsSync(helper) || !fs.existsSync(py)) return null;

  // Absolute clip paths the helper can ffmpeg-decode; skip any missing on disk.
  const present = clips
    .map((c) => ({ clipSrc: c.clipSrc, abs: path.resolve(publicRoot, c.clipSrc) }))
    .filter((c) => fs.existsSync(c.abs));
  if (present.length === 0) return null;

  const spec = {
    decoder: asr.decoder,
    encoder: asr.encoder,
    joiner: asr.joiner,
    tokens: asr.tokens,
    sampleRate: asr.sampleRate || 16000,
    clips: present.map((c) => c.abs),
  };
  try {
    const out = execFileSync(py, [helper, JSON.stringify(spec)], {
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"],
    });
    const byAbs = JSON.parse(out);
    const byClipSrc = new Map();
    for (const c of present) byClipSrc.set(c.clipSrc, byAbs[c.abs] ?? null);
    // Empty result object = helper ran but produced nothing usable → fall back.
    return byClipSrc.size > 0 ? byClipSrc : null;
  } catch {
    return null;
  }
};

// asr-alignment.json per-cue `asrText` (generation-independent coverage source
// #2, a FALLBACK). The kit's whole-recording ASR emits this as a window excerpt
// of one continuous transcript, so it is weaker per cue than per-clip ASR, but
// still ASR-derived (not the model self-report). Returns Map<cueId, asrText>.
const loadAlignmentAsr = (outDir) => {
  const p = path.join(outDir, "asr-alignment.json");
  if (!fs.existsSync(p)) return null;
  try {
    const j = JSON.parse(fs.readFileSync(p, "utf8"));
    if (!Array.isArray(j.cues)) return null;
    const m = new Map();
    for (const c of j.cues) {
      if (c?.id && typeof c.asrText === "string") m.set(c.id, c.asrText);
    }
    return m.size > 0 ? m : null;
  } catch {
    return null;
  }
};

// In-order subsequence coverage: how many of `expected`'s tokens appear, in the
// same order, somewhere in `got`. (Order matters — a trailing-cut clip's tokens
// are a strict prefix, so this is exactly "how much of the line was spoken".)
const orderedCoverage = (expected, got) => {
  if (expected.length === 0) return 1;
  let j = 0;
  let matched = 0;
  for (const t of expected) {
    while (j < got.length && got[j] !== t) j += 1;
    if (j < got.length) {
      matched += 1;
      j += 1;
    }
  }
  return matched / expected.length;
};

const median = (nums) => {
  if (nums.length === 0) return null;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor((s.length - 1) / 2);
  return s.length % 2 ? s[mid] : (s[mid] + s[mid + 1]) / 2;
};

const parseArgs = (argv) => {
  const a = { strict: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--strict") a.strict = true;
    else if (arg.startsWith("--")) {
      a[arg.slice(2)] = argv[i + 1];
      i += 1;
    }
  }
  return a;
};

const readWavPcm = (file) => {
  const buf = fs.readFileSync(file);
  // minimal WAV parse: sampleRate at byte 24, data after the "data" chunk.
  const sampleRate = buf.readUInt32LE(24);
  let off = 12;
  while (off + 8 <= buf.length) {
    const id = buf.toString("ascii", off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    if (id === "data") {
      return { sampleRate, data: buf.subarray(off + 8, off + 8 + size) };
    }
    off += 8 + size;
  }
  return { sampleRate: sampleRate || SR_FALLBACK, data: buf.subarray(44) };
};

const analyzeClip = ({ data, sampleRate }) => {
  const n = Math.floor(data.length / 2);
  const durationSeconds = n / sampleRate;
  const hop = Math.max(1, Math.round(sampleRate * FRAME_SECONDS));
  const frames = [];
  for (let i = 0; i < n; i += hop) {
    let sumSq = 0;
    let crossings = 0;
    let prev = 0;
    const end = Math.min(n, i + hop);
    for (let s = i; s < end; s += 1) {
      const v = data.readInt16LE(s * 2);
      sumSq += v * v;
      if (s > i && (v >= 0) !== (prev >= 0)) crossings += 1;
      prev = v;
    }
    const count = end - i;
    const rms = Math.sqrt(sumSq / count);
    frames.push({
      rmsDb: rms > 0 ? 20 * Math.log10(rms / 32768) : -99,
      zcr: count > 1 ? crossings / (count - 1) : 0,
    });
  }

  // Longest run of steady, loud, low-ZCR frames = a held-vowel drone.
  let longest = 0;
  let run = 0;
  for (const f of frames) {
    if (f.zcr < DRONE_ZCR_MAX && f.rmsDb > DRONE_RMS_DB_MIN) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }
  const droneSeconds = longest * FRAME_SECONDS;

  // Edge silence (trim regression).
  let lead = 0;
  while (lead < n && Math.abs(data.readInt16LE(lead * 2)) < SILENCE_ABS) lead += 1;
  let tail = n - 1;
  while (tail > 0 && Math.abs(data.readInt16LE(tail * 2)) < SILENCE_ABS) tail -= 1;
  const leadSilence = lead / sampleRate;
  const trailSilence = (n - 1 - tail) / sampleRate;

  return { durationSeconds, droneSeconds, leadSilence, trailSilence };
};

const main = () => {
  const args = parseArgs(process.argv.slice(2));

  // Resolve the manifest: --manifest <path>, or out/<lessonId>/voice-clips.json.
  let configPath = args.config;
  let manifestPath = args.manifest;
  let outDir = null;
  if (!manifestPath && args.config) {
    const cfg = JSON.parse(fs.readFileSync(args.config, "utf8"));
    outDir = path.join("out", cfg.lessonId);
    manifestPath = path.join(outDir, "voice-clips.json");
  } else if (!manifestPath && args.lessonId) {
    outDir = path.join("out", args.lessonId);
    manifestPath = path.join(outDir, "voice-clips.json");
  }

  if (!manifestPath || !fs.existsSync(manifestPath)) {
    console.log(
      `SKIP: audio gate — no voice-clips.json (${manifestPath ?? "no --config/--lessonId/--manifest"}). ` +
        `A v4 cue-anchored lesson writes it at voice generation.`,
    );
    return;
  }
  if (!outDir) outDir = path.dirname(manifestPath);

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const publicRoot = "public";
  console.log(`\n== Audio gate (${manifest.clips.length} clips) — ${manifestPath}`);

  // --- Check 4 setup: tokenizer + GENERATION-INDEPENDENT coverage sources -----
  const tok = loadTokenizer(configPath);
  const voiceJson = loadVoiceJson(configPath);

  // Source #1 (preferred): per-clip ASR — the durable "what was said on THIS
  // cue's clip" signal, independent of which TTS model produced the audio.
  const clipAsrBySrc = runPerClipAsr(voiceJson, manifest.clips, publicRoot);
  // Source #2 (fallback): asr-alignment.json per-cue asrText (window excerpt).
  const alignAsrById = clipAsrBySrc ? null : loadAlignmentAsr(outDir);

  // Source #3 (corroborator ONLY, if present): gemini-voice.json transcriptText
  // — the Live model's self-report. The dedicated-TTS model DROPS it, which is
  // why coverage no longer DEPENDS on it; we keep it only to corroborate.
  let transcriptLines = null;
  const geminiVoicePath = path.join(outDir, "gemini-voice.json");
  if (fs.existsSync(geminiVoicePath)) {
    try {
      const gv = JSON.parse(fs.readFileSync(geminiVoicePath, "utf8"));
      if (typeof gv.transcriptText === "string") {
        const lines = gv.transcriptText.split("\n");
        if (lines.length === manifest.clips.length) transcriptLines = lines;
      }
    } catch {
      /* leave transcriptLines null */
    }
  }

  // The coverage source actually used (first available, in precedence order).
  const coverageSource = clipAsrBySrc
    ? "asr-clip"
    : alignAsrById
      ? "asr-align"
      : transcriptLines
        ? "transcript"
        : null;

  const findings = [];
  let droneFails = 0;
  let deadAirWarns = 0;
  let emptyClipFails = 0;

  // PASS 1 — analyse every clip + gather the cohort baselines for check 4.
  // Each entry carries its raw audio analysis, the expected phrase + token count,
  // its per-cue ASR coverage and its s/char, so PASS 2 can flag truncation
  // relative to THIS lesson's own median COVERAGE and median s/char (both
  // self-calibrating, no hard-coded rate).
  const pre = [];
  const sCharCohort = [];
  const coverageCohort = [];
  manifest.clips.forEach((clip, idx) => {
    const file = path.join(publicRoot, clip.clipSrc);
    if (!fs.existsSync(file)) {
      console.log(`  SKIP ${clip.id}: clip file missing (${file})`);
      pre.push(null);
      return;
    }
    const a = analyzeClip(readWavPcm(file));
    // EMPTY/SHORT: a cue that authored a phrase but rendered to near-nothing —
    // the TTS silently failed to produce it (a silent climax reads as desync).
    const phrase = (clip.phrase ?? clip.caption ?? "").trim();
    // Coverage uses the CAPTION as the expected narration (the human-authored
    // line shown on screen); falls back to phrase if a clip carries no caption.
    const expectedText = (clip.caption ?? clip.phrase ?? "").trim();
    const expectedTokens = tok.tokenize(expectedText);

    // Per-cue ASR transcription, from the chosen generation-independent source.
    let asrText = null;
    if (coverageSource === "asr-clip") asrText = clipAsrBySrc.get(clip.clipSrc) ?? null;
    else if (coverageSource === "asr-align") asrText = alignAsrById.get(clip.id) ?? null;
    else if (coverageSource === "transcript")
      asrText = transcriptLines ? transcriptLines[idx] : null;
    const hasCoverage = typeof asrText === "string";
    // Strip ASR filler markers (sil/s) before measuring how much was spoken.
    const gotTokens = hasCoverage ? stripAsrJunk(tok.tokenize(asrText)) : [];
    const coverage =
      hasCoverage && expectedTokens.length > 0
        ? orderedCoverage(expectedTokens, gotTokens)
        : null;
    if (coverage != null && phrase.length > 0) coverageCohort.push(coverage);

    const sCharRatio =
      expectedTokens.length > 0 ? a.durationSeconds / expectedTokens.length : null;
    if (sCharRatio != null && phrase.length > 0) sCharCohort.push(sCharRatio);
    pre.push({
      clip,
      a,
      phrase,
      expectedText,
      expectedTokenCount: expectedTokens.length,
      asrText,
      hasCoverage,
      coverage,
      sCharRatio,
    });
  });

  // Cohort baseline for check 4(b): this lesson's OWN median seconds-per-token.
  const cohortMedian = median(sCharCohort);
  const cohortReliable =
    cohortMedian != null && sCharCohort.length >= MIN_COHORT_FOR_MEDIAN;
  const sCharFloor = cohortReliable ? cohortMedian * SCHAR_COHORT_FACTOR : null;

  // Cohort baseline for check 4(a): this lesson's OWN median ASR coverage. ASR is
  // imperfect even on a fully-spoken clip, so we flag a cue whose coverage is far
  // BELOW its peers (median × factor) in addition to the loose absolute floor.
  const coverageMedian = median(coverageCohort);
  const coverageCohortReliable =
    coverageMedian != null && coverageCohort.length >= MIN_COHORT_FOR_MEDIAN;
  const coverageCohortFloor = coverageCohortReliable
    ? coverageMedian * COVERAGE_COHORT_FACTOR
    : null;

  const truncationFindings = [];
  let truncationFails = 0;

  // PASS 2 — per-cue flagging (drone / dead-air / empty / truncation) + report.
  for (const p of pre) {
    if (!p) continue;
    const { clip, a, phrase } = p;
    const isDrone = a.droneSeconds >= MIN_DRONE_SECONDS;
    const isDeadAir =
      a.leadSilence > EDGE_SILENCE_MAX || a.trailSilence > EDGE_SILENCE_MAX;
    const isEmptyClip =
      phrase.length > 0 &&
      ((typeof clip.narrationFrames === "number" && clip.narrationFrames <= 1) ||
        a.durationSeconds < MIN_CLIP_SECONDS);

    // --- Check 4: TRUNCATION (only meaningful for a cue that has a phrase, and
    // NOT for one already failing EMPTY/SHORT — that has its own re-roll path).
    // (a) coverage trips when the per-cue ASR transcription covers far below this
    //     lesson's cohort-median coverage (median × factor) OR below the loose
    //     absolute floor; (b) duration trips when s/char is far below the cohort
    //     median (or below the absolute backstop). Either signal = truncated.
    const coverageTrips =
      p.coverage != null &&
      p.expectedTokenCount > 0 &&
      ((coverageCohortFloor != null && p.coverage < coverageCohortFloor) ||
        p.coverage < COVERAGE_ABS_FLOOR);
    const durationTrips =
      p.sCharRatio != null &&
      ((sCharFloor != null && p.sCharRatio < sCharFloor) ||
        p.sCharRatio < SCHAR_ABS_BACKSTOP);
    const isTruncated =
      phrase.length > 0 && !isEmptyClip && (coverageTrips || durationTrips);

    if (isDrone) droneFails += 1;
    if (isDeadAir) deadAirWarns += 1;
    if (isEmptyClip) emptyClipFails += 1;
    if (isTruncated) truncationFails += 1;

    truncationFindings.push({
      id: clip.id,
      expectedTokens: p.expectedTokenCount,
      coverage: p.coverage,
      coverageSource: p.coverage == null ? null : coverageSource,
      coverageSkipped: !p.hasCoverage,
      asrText: p.asrText ?? null,
      cohortMedianCoverage: coverageMedian,
      coverageCohortFloor,
      sCharRatio: p.sCharRatio,
      cohortMedianSChar: cohortMedian,
      sCharFloor,
      coverageTrips,
      durationTrips,
      truncated: isTruncated,
    });

    const covStr =
      p.coverage == null ? "cov SKIP" : `cov ${(p.coverage * 100).toFixed(0)}%`;
    // HARD-check flags decide the row label (FAIL/ok) and the gate's pass.
    const hardFlags = [
      isDrone ? `🔴 DRONE ${a.droneSeconds.toFixed(1)}s held` : null,
      isEmptyClip
        ? `🔴 EMPTY/SHORT ${a.durationSeconds.toFixed(2)}s for phrase "${phrase.slice(0, 10)}" (TTS failed — re-roll)`
        : null,
      isDeadAir
        ? `🟡 dead-air lead ${a.leadSilence.toFixed(2)}s / trail ${a.trailSilence.toFixed(2)}s`
        : null,
    ].filter(Boolean);
    // Truncation is ADVISORY — it appends to the line but never sets the label.
    const advisoryFlags = [
      isTruncated
        ? `⚠ ADVISORY: possible truncation (${covStr}` +
          (coverageTrips ? " low-vs-cohort/floor" : "") +
          (p.sCharRatio != null ? `, s/char ${p.sCharRatio.toFixed(3)}` : "") +
          (durationTrips ? " short-vs-cohort" : "") +
          `) — non-blocking, spot-check this clip`
        : null,
    ].filter(Boolean);
    const lineFlags = [...hardFlags, ...advisoryFlags];

    console.log(
      `  ${hardFlags.length ? "FAIL" : "ok  "} ${clip.id.padEnd(16)} ` +
        `dur ${a.durationSeconds.toFixed(2)}s  maxHeld ${a.droneSeconds.toFixed(1)}s  ${covStr}` +
        (lineFlags.length ? `  ${lineFlags.join("  ")}` : ""),
    );
    findings.push({ id: clip.id, ...a, isDrone, isDeadAir, isEmptyClip, isTruncated });
  }

  const truncation = {
    advisory: true, // NON-BLOCKING: surfaced for the human eye, never sets pass.
    advisories: truncationFails, // count of cues flagged (advisory)
    fails: truncationFails, // retained for back-compat; does NOT gate pass
    // Coverage (4a) — generation-independent ASR source + cohort-relative floor.
    coverageSource, // "asr-clip" | "asr-align" | "transcript" | null
    coverageAvailable: coverageSource != null,
    coverageCohortFactor: COVERAGE_COHORT_FACTOR,
    coverageAbsFloor: COVERAGE_ABS_FLOOR,
    cohortMedianCoverage: coverageMedian,
    coverageCohortFloor,
    coverageCohortReliable,
    // Duration sanity (4b).
    sCharCohortFactor: SCHAR_COHORT_FACTOR,
    sCharAbsBackstop: SCHAR_ABS_BACKSTOP,
    cohortMedianSChar: cohortMedian,
    sCharFloor,
    cohortReliable,
    tokenPattern: tok.pattern,
    findings: truncationFindings,
  };

  // `pass` tracks ONLY the three HARD checks (drone / empty-short / dead-air).
  // Truncation is ADVISORY (non-blocking): the dedicated-TTS model is the
  // STRUCTURAL cure for mid-utterance truncation; a noisy ASR/cohort backstop
  // false-positives on clean renders (full clips of longer Mandarin sentences
  // score low ASR coverage; heterogeneous cue lengths skew the s/char cohort),
  // so it must never set pass:false / block the freeze. truncationAdvisories
  // is still reported so a real regression stays visible in the JSON.
  const truncationAdvisories = truncationFails;
  const pass =
    droneFails === 0 && deadAirWarns === 0 && emptyClipFails === 0;
  console.log(
    `\n== Audio gate: ${pass ? "✅ PASS" : `⚠ FAIL — ${droneFails} drone, ${emptyClipFails} empty/short, ${deadAirWarns} dead-air`}` +
      (truncationAdvisories > 0
        ? `  (+ ${truncationAdvisories} truncation ${truncationAdvisories === 1 ? "advisory" : "advisories"}, non-blocking)`
        : ""),
  );
  if (droneFails > 0) {
    console.log(
      `   A held-vowel drone means an intra-cue pause was authored as in-text dots ("I'm…… Sam"). ` +
        `Author it as a typed gap or a sub-beat (lesson-audio-captions / cue-plan-author skills).`,
    );
  }
  if (emptyClipFails > 0) {
    console.log(
      `   An EMPTY/SHORT clip means the TTS produced (near) silence for a cue that has a phrase. ` +
        `Re-roll that cue's voice (often a tweak to script-cues.json text fixes the TTS miss); a silent cue is never acceptable.`,
    );
  }
  if (truncationAdvisories > 0) {
    console.log(
      `   ${truncationAdvisories} truncation ${truncationAdvisories === 1 ? "advisory" : "advisories"} (NON-BLOCKING — the dedicated-TTS model is the structural fix for mid-utterance truncation; spot-check the flagged clip(s)). ` +
        `A flagged clip's per-cue ASR coverage is far below this lesson's cohort median ` +
        `(${coverageMedian != null ? (coverageMedian * 100).toFixed(0) : "n/a"}%) or below the ${(COVERAGE_ABS_FLOOR * 100).toFixed(0)}% floor, ` +
        `and/or its seconds-per-token is far below this lesson's cohort median (${cohortMedian != null ? cohortMedian.toFixed(3) : "n/a"}s/char). ` +
        `This signal false-positives on clean renders (a longer Mandarin sentence ASRs low; a drill cue skews the s/char cohort), so it does NOT fail the gate — if a clip is GENUINELY cut on listen, re-roll it; otherwise the advisory is harmless.`,
    );
  }
  if (coverageSource == null) {
    console.log(
      `   NOTE: coverage signal (4a) SKIPPED — no generation-independent ASR source available (per-clip ASR could not run, no asr-alignment.json asrText, no transcriptText). Truncation relied on duration-sanity (4b) alone.`,
    );
  } else if (coverageSource !== "asr-clip") {
    console.log(
      `   NOTE: coverage signal (4a) used the "${coverageSource}" fallback source (per-clip ASR unavailable). asr-clip is the most reliable per-cue source when the sherpa ASR config + clips are present.`,
    );
  }

  const reportPath = path.join(outDir, "audio-gate.json");
  fs.writeFileSync(
    reportPath,
    `${JSON.stringify({ pass, droneFails, emptyClipFails, deadAirWarns, truncationAdvisories, truncationFails, truncation, findings }, null, 2)}\n`,
  );
  console.log(`   report -> ${reportPath}`);

  if (args.strict && !pass) process.exitCode = 1;
};

try {
  main();
} catch (error) {
  console.error(`audio gate error: ${error.message || error}`);
  // advisory: never block the build on a gate error.
}
