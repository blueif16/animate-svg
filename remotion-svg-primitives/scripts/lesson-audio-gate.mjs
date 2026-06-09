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
//
// Reads out/<id>/voice-clips.json (the generator manifest) + the per-cue clip
// WAVs. Advisory by contract (CLAUDE.md: "the check is advisory, not blocking")
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
  let manifestPath = args.manifest;
  if (!manifestPath && args.config) {
    const cfg = JSON.parse(fs.readFileSync(args.config, "utf8"));
    manifestPath = path.join("out", cfg.lessonId, "voice-clips.json");
  } else if (!manifestPath && args.lessonId) {
    manifestPath = path.join("out", args.lessonId, "voice-clips.json");
  }

  if (!manifestPath || !fs.existsSync(manifestPath)) {
    console.log(
      `SKIP: audio gate — no voice-clips.json (${manifestPath ?? "no --config/--lessonId/--manifest"}). ` +
        `A v4 cue-anchored lesson writes it at voice generation.`,
    );
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const publicRoot = "public";
  console.log(`\n== Audio gate (${manifest.clips.length} clips) — ${manifestPath}`);

  const findings = [];
  let droneFails = 0;
  let deadAirWarns = 0;

  for (const clip of manifest.clips) {
    const file = path.join(publicRoot, clip.clipSrc);
    if (!fs.existsSync(file)) {
      console.log(`  SKIP ${clip.id}: clip file missing (${file})`);
      continue;
    }
    const a = analyzeClip(readWavPcm(file));
    const isDrone = a.droneSeconds >= MIN_DRONE_SECONDS;
    const isDeadAir =
      a.leadSilence > EDGE_SILENCE_MAX || a.trailSilence > EDGE_SILENCE_MAX;
    if (isDrone) droneFails += 1;
    if (isDeadAir) deadAirWarns += 1;

    const flags = [
      isDrone ? `🔴 DRONE ${a.droneSeconds.toFixed(1)}s held` : null,
      isDeadAir
        ? `🟡 dead-air lead ${a.leadSilence.toFixed(2)}s / trail ${a.trailSilence.toFixed(2)}s`
        : null,
    ].filter(Boolean);

    console.log(
      `  ${flags.length ? "FAIL" : "ok  "} ${clip.id.padEnd(16)} ` +
        `dur ${a.durationSeconds.toFixed(2)}s  maxHeld ${a.droneSeconds.toFixed(1)}s` +
        (flags.length ? `  ${flags.join("  ")}` : ""),
    );
    findings.push({ id: clip.id, ...a, isDrone, isDeadAir });
  }

  const pass = droneFails === 0 && deadAirWarns === 0;
  console.log(
    `\n== Audio gate: ${pass ? "✅ PASS" : `⚠ FAIL — ${droneFails} drone, ${deadAirWarns} dead-air`}`,
  );
  if (droneFails > 0) {
    console.log(
      `   A held-vowel drone means an intra-cue pause was authored as in-text dots ("I'm…… Sam"). ` +
        `Author it as a typed gap or a sub-beat (lesson-audio-captions / cue-plan-author skills).`,
    );
  }

  const reportPath = path.join(path.dirname(manifestPath), "audio-gate.json");
  fs.writeFileSync(
    reportPath,
    `${JSON.stringify({ pass, droneFails, deadAirWarns, findings }, null, 2)}\n`,
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
