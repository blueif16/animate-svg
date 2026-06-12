#!/usr/bin/env node
// Deterministic audio gate (v4 cue-anchored audio). Runs right after voice
// generation — NOT at full-gen — so an audio defect is caught in seconds, by
// tool, before render + before a human ever has to listen. Two checks, both
// pure-deterministic:
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
//   4) TRUNCATION / COVERAGE — the TTS produced a NON-empty clip that stops
//      mid-phrase (it spoke only the first few characters/words and cut off).
//      The clip is loud, trimmed, and long enough to pass checks 1–3, but it is
//      missing the END of the line — and it gets FROZEN. Two deterministic,
//      language-GENERAL signals (no lesson content, no magic absolute rate):
//        (a) TRANSCRIPT COVERAGE — tokenize the expected phrase AND the model's
//            per-cue transcriptText self-report with voice.json's tokenPattern
//            (CJK char OR latin word), then coverage = (expected tokens present,
//            IN ORDER, in the transcript) / (expected token count). The model
//            literally reports speaking fewer tokens — the strongest signal.
//            If transcriptText is ABSENT (a dedicated-TTS model may omit it),
//            (a) SKIPs and the gate falls back to (b) alone.
//        (b) DURATION SANITY — per-cue seconds-per-token vs the cohort: compute
//            this lesson's OWN median s/char and flag a cue whose s/char is far
//            below it (a clip much shorter than its peers for its length is cut).
//            Self-calibrating per lesson + voice — no hard-coded rate. A loose
//            absolute floor is kept only as a documented secondary backstop.
//      A cue is TRUNCATED if (a) trips OR (b) trips. This is the check the
//      kptest-fenyuhe-six post-mortem added: 5/9 Mandarin cues were silently
//      cut mid-phrase and frozen, invisible to checks 1–3 (matchScore is
//      informational and nothing checked transcript-vs-script fidelity).
//
// Reads out/<id>/voice-clips.json (the generator manifest) + the per-cue clip
// WAVs + (for check 4a) out/<id>/gemini-voice.json's per-cue transcriptText +
// voice.json's tokenPattern. Advisory by contract (CLAUDE.md: "the check is advisory, not blocking")
// — it prints a loud PASS/FAIL banner and writes a JSON report, but never blocks
// the build. A gate that cannot run prints `SKIP: <reason>` (never a silent
// pass). Exit code is 0 unless `--strict` is passed.

import fs from "node:fs";
import path from "node:path";

const SR_FALLBACK = 24000;
const SILENCE_ABS = 180; // ~ -45 dB
const FRAME_SECONDS = 0.1;
const MIN_DRONE_SECONDS = 1.5; // a held vowel beyond this is not natural speech
const DRONE_ZCR_MAX = 0.07; // held vowel/nasal: very few zero crossings
const DRONE_RMS_DB_MIN = -28; // loud enough to be heard as a drone
const EDGE_SILENCE_MAX = 0.3; // trimmed clips should start/end on speech
const MIN_CLIP_SECONDS = 0.25; // a cue with a phrase is always longer; near-zero = TTS silently failed to render it

// --- TRUNCATION / COVERAGE (check 4) ---------------------------------------
// (a) transcript coverage: the model must report speaking at least this
//     fraction of the expected tokens (in order). A short phrase that drops its
//     final token reads as ~0.8 coverage, so the floor sits just above that —
//     low enough that a fully-spoken line (coverage 1.0) NEVER trips.
const COVERAGE_FLOOR = 0.85;
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
// trustworthy baseline; below it, fall back to the absolute backstop alone.
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

  // --- Check 4 setup: tokenizer + per-cue transcriptText self-report ---------
  const tok = loadTokenizer(configPath);
  // gemini-voice.json carries the model's per-cue transcriptText, newline-joined
  // and POSITIONALLY aligned to manifest.clips (one line per clip, in order).
  // Absent on a dedicated-TTS model that omits the self-report → coverage SKIPs.
  let transcriptLines = null;
  const geminiVoicePath = path.join(outDir, "gemini-voice.json");
  if (fs.existsSync(geminiVoicePath)) {
    try {
      const gv = JSON.parse(fs.readFileSync(geminiVoicePath, "utf8"));
      if (typeof gv.transcriptText === "string") {
        const lines = gv.transcriptText.split("\n");
        // Only trust positional alignment when the line count matches the clips.
        if (lines.length === manifest.clips.length) transcriptLines = lines;
      }
    } catch {
      /* leave transcriptLines null → coverage (a) SKIPs, falls back to (b) */
    }
  }

  const findings = [];
  let droneFails = 0;
  let deadAirWarns = 0;
  let emptyClipFails = 0;

  // PASS 1 — analyse every clip + gather the cohort baseline for check 4(b).
  // Each entry carries its raw audio analysis, the expected phrase + token count
  // and the model's transcript coverage, so PASS 2 can flag truncation relative
  // to THIS lesson's own median s/char (self-calibrating, no hard-coded rate).
  const pre = [];
  const sCharCohort = [];
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
    const transcript = transcriptLines ? transcriptLines[idx] : null;
    const hasTranscript = typeof transcript === "string";
    const coverage = hasTranscript
      ? orderedCoverage(expectedTokens, tok.tokenize(transcript))
      : null;
    const sCharRatio =
      expectedTokens.length > 0 ? a.durationSeconds / expectedTokens.length : null;
    if (sCharRatio != null && phrase.length > 0) sCharCohort.push(sCharRatio);
    pre.push({
      clip,
      a,
      phrase,
      expectedText,
      expectedTokenCount: expectedTokens.length,
      transcript,
      hasTranscript,
      coverage,
      sCharRatio,
    });
  });

  // Cohort baseline for check 4(b): this lesson's OWN median seconds-per-token.
  const cohortMedian = median(sCharCohort);
  const cohortReliable =
    cohortMedian != null && sCharCohort.length >= MIN_COHORT_FOR_MEDIAN;
  const sCharFloor = cohortReliable ? cohortMedian * SCHAR_COHORT_FACTOR : null;

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
    // (a) coverage trips when the model reports speaking < COVERAGE_FLOOR of the
    //     expected tokens; (b) duration trips when s/char is far below the cohort
    //     median (or below the absolute backstop). Either signal = truncated.
    const coverageTrips =
      p.coverage != null && p.expectedTokenCount > 0 && p.coverage < COVERAGE_FLOOR;
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
      coverageSkipped: !p.hasTranscript,
      sCharRatio: p.sCharRatio,
      cohortMedianSChar: cohortMedian,
      sCharFloor,
      coverageTrips,
      durationTrips,
      truncated: isTruncated,
    });

    const covStr =
      p.coverage == null ? "cov SKIP" : `cov ${(p.coverage * 100).toFixed(0)}%`;
    const flags = [
      isDrone ? `🔴 DRONE ${a.droneSeconds.toFixed(1)}s held` : null,
      isEmptyClip
        ? `🔴 EMPTY/SHORT ${a.durationSeconds.toFixed(2)}s for phrase "${phrase.slice(0, 10)}" (TTS failed — re-roll)`
        : null,
      isTruncated
        ? `🔴 TRUNCATED (${covStr}` +
          (coverageTrips ? ` <${(COVERAGE_FLOOR * 100).toFixed(0)}%` : "") +
          (p.sCharRatio != null ? `, s/char ${p.sCharRatio.toFixed(3)}` : "") +
          (durationTrips ? " short-vs-cohort" : "") +
          `) — clip cut mid-phrase, re-roll`
        : null,
      isDeadAir
        ? `🟡 dead-air lead ${a.leadSilence.toFixed(2)}s / trail ${a.trailSilence.toFixed(2)}s`
        : null,
    ].filter(Boolean);

    console.log(
      `  ${flags.length ? "FAIL" : "ok  "} ${clip.id.padEnd(16)} ` +
        `dur ${a.durationSeconds.toFixed(2)}s  maxHeld ${a.droneSeconds.toFixed(1)}s  ${covStr}` +
        (flags.length ? `  ${flags.join("  ")}` : ""),
    );
    findings.push({ id: clip.id, ...a, isDrone, isDeadAir, isEmptyClip, isTruncated });
  }

  const truncation = {
    fails: truncationFails,
    coverageFloor: COVERAGE_FLOOR,
    sCharCohortFactor: SCHAR_COHORT_FACTOR,
    sCharAbsBackstop: SCHAR_ABS_BACKSTOP,
    cohortMedianSChar: cohortMedian,
    sCharFloor,
    cohortReliable,
    tokenPattern: tok.pattern,
    coverageAvailable: transcriptLines != null,
    findings: truncationFindings,
  };

  const pass =
    droneFails === 0 &&
    deadAirWarns === 0 &&
    emptyClipFails === 0 &&
    truncationFails === 0;
  console.log(
    `\n== Audio gate: ${pass ? "✅ PASS" : `⚠ FAIL — ${droneFails} drone, ${emptyClipFails} empty/short, ${truncationFails} truncated, ${deadAirWarns} dead-air`}`,
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
  if (truncationFails > 0) {
    console.log(
      `   A TRUNCATED clip is non-empty but stops mid-phrase: the model reported speaking < ${(COVERAGE_FLOOR * 100).toFixed(0)}% of the expected tokens, ` +
        `and/or its seconds-per-token is far below this lesson's cohort median (${cohortMedian != null ? cohortMedian.toFixed(3) : "n/a"}s/char). ` +
        `Re-roll that cue's voice; if it keeps truncating after a few attempts, shorten/split the cue's text in script-cues.json or record an explicit justification — NEVER freeze a clip that cuts off mid-line.`,
    );
  }
  if (truncation.coverageAvailable === false) {
    console.log(
      `   NOTE: coverage signal (4a) SKIPPED — no per-cue transcriptText self-report in gemini-voice.json (a dedicated-TTS model may omit it). Truncation relied on duration-sanity (4b) alone.`,
    );
  }

  const reportPath = path.join(outDir, "audio-gate.json");
  fs.writeFileSync(
    reportPath,
    `${JSON.stringify({ pass, droneFails, emptyClipFails, truncationFails, deadAirWarns, truncation, findings }, null, 2)}\n`,
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
