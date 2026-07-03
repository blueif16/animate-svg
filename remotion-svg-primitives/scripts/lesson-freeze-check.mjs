#!/usr/bin/env node
// W3a FREEZE CHECK — the hard gate that closes self-scan C6.
//
// An accepted Wave-3a freeze log is NOT proof that its claimed numbers match the
// artifact actually committed to disk. A cross-artifact divergence in the
// voice-generation step (an EPERM-tainted partial write left voice-clips.json /
// gemini-voice.json / the freeze log stale while Clips.ts rolled forward) ships
// undetected today. The real kptest-count-to-two case: the log recorded
// narrationFrames 73/185/177 while the committed Clips.ts had 63/175/168.
//
// This gate treats the COMMITTED <X>Clips.ts as the audio truth (per the W3a
// freeze contract: "the per-cue CLIPS are canonical") and FAILS LOUDLY — non-zero
// exit + a per-cue diff table — when any per-cue-narrationFrames source it can
// find disagrees, or when the freeze record is partial (fewer cues than the
// clips). A divergence between sources IS the observable symptom of a partial /
// EPERM-tainted write, so the numeric-consistency check is the taint detector.
//
// Lesson-agnostic: every lesson-specific value comes from --config <pipeline.json>.
// Run at the END of Wave 3a (after voice + audio-gate, before freeze is declared)
// and again after any repair. Never re-generates voice.
//
// Usage:
//   node scripts/lesson-freeze-check.mjs --config lesson-data/<id>/pipeline.json
//   (npm run lesson:freeze-check -- --config <path>)

import fs from "node:fs";
import path from "node:path";

const parseArgs = (argv) => {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for ${arg}`);
      }
      args[key] = value;
      i += 1;
    }
  }
  return args;
};

// Parse the committed <X>Clips.ts (the AUDIO TRUTH) → ordered [{id, narrationFrames}].
// The kit emits one object literal per cue: `{ id: "...", clipSrc: "...",
// narrationFrames: N, ... }`. matchAll preserves file order.
const parseClips = (clipsPath) => {
  const src = fs.readFileSync(clipsPath, "utf8");
  const rows = [];
  const re = /\{\s*id:\s*"([^"]+)"[^}]*?narrationFrames:\s*(\d+)[^}]*?\}/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    rows.push({ id: m[1], narrationFrames: Number(m[2]) });
  }
  const totalMatch = src.match(/TotalNarrationFrames\s*=\s*(\d+)/);
  return { rows, total: totalMatch ? Number(totalMatch[1]) : undefined };
};

// Parse the accepted W3a log's per-cue narrationFrames. Two accepted forms:
//   (1) a fenced ```freeze block of `<cue-id>: <frames>` lines (+ optional
//       `total: <frames>`) — the machine-readable freeze record (preferred).
//   (2) prose fallback: the OUTPUTS line marked "AUDIO TRUTH" carrying
//       `narrationFrames a/b/.../k` (+ `total N`), mapped POSITIONALLY to the
//       clips order. This is what pre-repair logs carry.
// Returns { byId?, ordered?, total?, form } or null when nothing parses.
const parseLog = (logPath) => {
  const text = fs.readFileSync(logPath, "utf8");

  const fenced = text.match(/```freeze\s*([\s\S]*?)```/);
  if (fenced) {
    const byId = {};
    let total;
    for (const line of fenced[1].split("\n")) {
      const pair = line.match(/^\s*([A-Za-z0-9][A-Za-z0-9_-]*)\s*:\s*(\d+)\s*$/);
      if (!pair) continue;
      if (pair[1].toLowerCase() === "total") total = Number(pair[2]);
      else byId[pair[1]] = Number(pair[2]);
    }
    if (Object.keys(byId).length > 0) {
      return { byId, total, form: "freeze-block" };
    }
  }

  // Prose fallback: the "AUDIO TRUTH" outputs line.
  for (const line of text.split("\n")) {
    if (!/AUDIO TRUTH/i.test(line)) continue;
    const nums = line.match(/narrationFrames\s+(\d+(?:\/\d+)+)/i);
    if (!nums) continue;
    const ordered = nums[1].split("/").map(Number);
    const totalMatch = line.match(/total\s+(\d+)/i);
    return {
      ordered,
      total: totalMatch ? Number(totalMatch[1]) : undefined,
      form: "prose-audio-truth",
    };
  }
  return null;
};

// Optional structured sibling: out/<id>/voice-clips.json → id→narrationFrames.
const readVoiceClipsJson = (jsonPath) => {
  if (!fs.existsSync(jsonPath)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    const byId = {};
    for (const clip of data.clips || []) {
      if (clip && typeof clip.id === "string") byId[clip.id] = clip.narrationFrames;
    }
    return { byId, count: (data.clips || []).length };
  } catch {
    return { byId: {}, count: 0, unreadable: true };
  }
};

const main = () => {
  const args = parseArgs(process.argv.slice(2));
  if (!args.config) throw new Error("Missing required option: --config <path>");

  const cfg = JSON.parse(fs.readFileSync(args.config, "utf8"));
  const lessonId = cfg.lessonId;
  if (!lessonId) throw new Error(`pipeline.json missing lessonId: ${args.config}`);
  const alignOutTs = cfg.voice?.alignOutTs;
  if (!alignOutTs || !/Timing\.ts$/.test(alignOutTs)) {
    throw new Error(
      `pipeline.json voice.alignOutTs must end in Timing.ts (got: ${alignOutTs})`,
    );
  }
  const cwd = process.cwd();
  const clipsPath = path.resolve(cwd, alignOutTs.replace(/Timing\.ts$/, "Clips.ts"));
  // W3a wave log. Default is the canonical name; fall back to any voice/asr log
  // in _logs/ (naming has drifted between voice.md and w3a-voice-asr.md); --log
  // overrides. Lesson-agnostic — the dir is derived from lessonId.
  const logsDir = path.resolve(cwd, "lesson-data", lessonId, "_logs");
  const resolveLogPath = () => {
    if (args.log) return path.resolve(cwd, args.log);
    const canonical = path.join(logsDir, "w3a-voice-asr.md");
    if (fs.existsSync(canonical)) return canonical;
    if (fs.existsSync(logsDir)) {
      const cand = fs
        .readdirSync(logsDir)
        .filter((f) => /(voice.*asr|w3a.*voice|^voice)\.md$/i.test(f))
        .sort();
      if (cand.length > 0) return path.join(logsDir, cand[0]);
    }
    return canonical; // reported as not-found below
  };
  const logPath = resolveLogPath();
  const voiceClipsJsonPath = path.resolve(cwd, "out", lessonId, "voice-clips.json");
  const geminiVoicePath = path.resolve(cwd, "out", lessonId, "gemini-voice.json");

  const rel = (p) => path.relative(cwd, p);
  const failures = [];

  console.log(`\n== W3a freeze check — ${lessonId}`);

  // 1) The committed AUDIO TRUTH must exist.
  if (!fs.existsSync(clipsPath)) {
    console.error(`  FAIL: committed Clips.ts not found: ${rel(clipsPath)}`);
    process.exit(1);
  }
  const clips = parseClips(clipsPath);
  if (clips.rows.length === 0) {
    console.error(`  FAIL: no cue clips parsed from ${rel(clipsPath)} (partial write?).`);
    process.exit(1);
  }
  console.log(`   Clips.ts (committed truth): ${rel(clipsPath)}`);

  // 2) The accepted freeze log must exist and carry a parseable per-cue record.
  if (!fs.existsSync(logPath)) {
    console.error(`  FAIL: freeze log not found: ${rel(logPath)}`);
    process.exit(1);
  }
  const log = parseLog(logPath);
  console.log(`   Log (accepted freeze):      ${rel(logPath)}`);
  if (!log) {
    console.error(
      `  FAIL: no parseable per-cue freeze record in ${rel(logPath)} ` +
        `(expected a \`\`\`freeze block or an "AUDIO TRUTH … narrationFrames a/b/c" line).`,
    );
    process.exit(1);
  }

  // Resolve the log's per-cue value for a given cue (by id, else positional).
  const logValueFor = (id, index) => {
    if (log.byId) return log.byId[id];
    if (log.ordered) return log.ordered[index];
    return undefined;
  };
  const logCount = log.byId ? Object.keys(log.byId).length : log.ordered.length;
  if (logCount !== clips.rows.length) {
    failures.push(
      `freeze record has ${logCount} cue(s) but Clips.ts has ${clips.rows.length} — PARTIAL write.`,
    );
  }

  // 3) Optional structured siblings (gitignored derivables; checked when present).
  const vcj = readVoiceClipsJson(voiceClipsJsonPath);
  if (vcj?.unreadable) {
    failures.push(`out/${lessonId}/voice-clips.json is present but unreadable (corrupt/partial).`);
  }
  let geminiCount;
  if (fs.existsSync(geminiVoicePath)) {
    try {
      geminiCount = JSON.parse(fs.readFileSync(geminiVoicePath, "utf8")).clipCount;
    } catch {
      failures.push(`out/${lessonId}/gemini-voice.json is present but unreadable.`);
    }
  }
  if (typeof geminiCount === "number" && geminiCount !== clips.rows.length) {
    failures.push(
      `gemini-voice.json clipCount ${geminiCount} != Clips.ts cue count ${clips.rows.length} (stale/partial).`,
    );
  }

  // 4) Per-cue diff table across every source found on disk.
  const showVcj = vcj && Object.keys(vcj.byId).length > 0;
  const header =
    `  ${"cue".padEnd(20)} ${"Clips.ts".padStart(9)} ${"log".padStart(6)}` +
    (showVcj ? ` ${"voice-clips".padStart(12)}` : "") +
    "   status";
  const rowsOut = [header];
  for (let i = 0; i < clips.rows.length; i += 1) {
    const { id, narrationFrames: truth } = clips.rows[i];
    const logVal = logValueFor(id, i);
    const vcjVal = showVcj ? vcj.byId[id] : undefined;
    const disagree =
      (logVal !== undefined && logVal !== truth) ||
      (showVcj && vcjVal !== undefined && vcjVal !== truth) ||
      logVal === undefined;
    if (disagree) {
      failures.push(
        `cue "${id}": Clips.ts=${truth}` +
          ` log=${logVal === undefined ? "MISSING" : logVal}` +
          (showVcj ? ` voice-clips.json=${vcjVal === undefined ? "MISSING" : vcjVal}` : ""),
      );
    }
    rowsOut.push(
      `  ${id.padEnd(20)} ${String(truth).padStart(9)} ` +
        `${String(logVal ?? "—").padStart(6)}` +
        (showVcj ? ` ${String(vcjVal ?? "—").padStart(12)}` : "") +
        `   ${disagree ? "MISMATCH" : "ok"}`,
    );
  }
  // total row
  if (log.total !== undefined || clips.total !== undefined) {
    const totalDisagree =
      log.total !== undefined && clips.total !== undefined && log.total !== clips.total;
    if (totalDisagree) {
      failures.push(`total: Clips.ts=${clips.total} log=${log.total}`);
    }
    rowsOut.push(
      `  ${"(total narration)".padEnd(20)} ${String(clips.total ?? "—").padStart(9)} ` +
        `${String(log.total ?? "—").padStart(6)}` +
        (showVcj ? ` ${"".padStart(12)}` : "") +
        `   ${totalDisagree ? "MISMATCH" : "ok"}`,
    );
  }
  console.log(rowsOut.join("\n"));

  // 5) EPERM/partial-write context (advisory annotation; the numeric diff drives pass/fail).
  const logText = fs.readFileSync(logPath, "utf8");
  const epermMentioned = /EPERM|partial[- ]success|stale/i.test(logText);
  if (epermMentioned) {
    console.log(
      "\n   note: the freeze log documents EPERM/partial-write conditions — a known" +
        " cause of the divergence this gate catches.",
    );
  }

  if (failures.length > 0) {
    console.error(
      `\nFREEZE CHECK FAILED (${failures.length}) — the accepted freeze record and/or a` +
        ` sibling artifact is stale relative to the committed Clips.ts (audio truth):`,
    );
    for (const f of failures) console.error(`  ✗ ${f}`);
    console.error(
      "\nRepair from evidence: Clips.ts is the frozen truth — re-derive the stale artifacts" +
        " (the _logs freeze record, voice-clips.json) FROM it. Do NOT re-generate voice.",
    );
    process.exit(1);
  }

  console.log(
    `\n== W3a freeze check: PASS — all per-cue narrationFrames agree with Clips.ts (${clips.rows.length} cues).`,
  );
};

try {
  main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
