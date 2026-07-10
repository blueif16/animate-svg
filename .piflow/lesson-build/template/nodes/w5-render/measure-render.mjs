#!/usr/bin/env node
// w5-render HARD measure — "render-stream-sanity" (optimize.measure, thin wrapper per
// piflow-overlord/references/building-measures.md Part D). Reused signals (trace detectors, digest
// anomalies, verified status, the return-schema-free floor) do NOT reach inside the produced MP4 — the
// node's existing `checks.post` only asserts the file is non-empty, not that it is a well-formed,
// complete media container. This script closes that gap: ffprobe the DELIVERABLE mp4 and assert it
// carries both a video and an audio stream above a sane duration floor. It is a SANITY floor, not a
// correctness oracle — it cannot tell you the render is the RIGHT length (that needs the reconciled
// timeline's expected duration, a cross-node comparison intentionally left for a follow-up; see
// memory.md). Never throws: an unavailable ffprobe or a missing mp4 is reported as a failed check, not a
// crashed measurement (a measurement crash must not masquerade as a gate failure).
//
// Also independently RE-MEASURES loudness on the deliverable via the SAME 2-pass loudnorm target
// render-complete-lesson.mjs itself aims for (I=-16 LUFS, TP=-1.0 dBTP — see its `LOUDNORM` constant). The
// render script's own loudnorm block is wrapped in a try/catch that WARNS and continues on failure, so the
// mp4 can ship un-normalized with no artifact-level signal; lesson-measured.mjs documents LUFS as "the only
// thresholded gate that fails the run" yet it only ever measures a PRE-render voice proxy or the frozen
// master from an EARLIER render (whichever ran last) — never THIS run's fresh deliverable. Re-measuring here
// closes that gap without touching the shared render script.
//
// Also closes the CONTACT-SHEET freshness/correspondence hole an adversarial verification pass proved: the
// soft judge in criteria.md only ever reads `<lessonId>-contact.png` as a still image — it has no way to know
// whether that PNG actually corresponds to THIS run's mp4. `make-contact-sheet.mjs`'s call site in
// render-complete-lesson.mjs ("Contact sheet" step) is wrapped in a non-fatal try/catch: a failed regen
// silently leaves whichever PNG was already on disk (a PRIOR run's, possibly a different/shorter cut)
// untouched, and `checks.post` only asserts the PNG is non-empty — never fresh, never derived from this
// deliverable. So a stale-but-clean PNG can false-green a broken/changed render. Two checks close this:
//   - `contactFreshness` — the contact PNG's mtime must not be OLDER than the mp4's own mtime (beyond a small
//     tolerance). In a normal run make-contact-sheet.mjs runs strictly AFTER the render + loudnorm rename in
//     the SAME `render-complete-lesson.mjs` invocation, so a fresh regen's PNG mtime is always >= the mp4's.
//     A stale prior-run PNG left behind by a swallowed regen failure is OLDER than a freshly-rendered mp4
//     and fails this.
//   - `contactDurationMatch` — the sidecar `<lessonId>-contact.json` legend's own `totalDuration`/`fps` must
//     match the mp4's ffprobe-measured duration within tolerance. This is a CONTENT correspondence check
//     (not just a timestamp), so it also catches a PNG that was copied/touched forward from a different
//     render (a mtime-only check would miss that) — the legend can only match a duration if the contact
//     sheet was actually built by sampling THIS deliverable's cues.
//
// Usage: node measure-render.mjs --mp4 <path> --out <report.json> [--min-duration-sec 2] [--lufs-target -16]
//        [--lufs-tolerance 1] [--true-peak-max -1.0] [--contact-png <path>] [--contact-json <path>]
//        [--freshness-tolerance-sec 5] [--duration-tolerance-sec 2]

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const parseArgs = (argv) => {
  const args = {
    minDurationSec: 2,
    lufsTarget: -16,
    lufsTolerance: 1,
    truePeakMax: -1.0,
    freshnessToleranceSec: 5,
    durationToleranceSec: 2,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--mp4") args.mp4 = argv[++i];
    else if (a === "--out") args.out = argv[++i];
    else if (a === "--min-duration-sec") args.minDurationSec = Number(argv[++i]);
    else if (a === "--lufs-target") args.lufsTarget = Number(argv[++i]);
    else if (a === "--lufs-tolerance") args.lufsTolerance = Number(argv[++i]);
    else if (a === "--true-peak-max") args.truePeakMax = Number(argv[++i]);
    else if (a === "--contact-png") args.contactPng = argv[++i];
    else if (a === "--contact-json") args.contactJson = argv[++i];
    else if (a === "--freshness-tolerance-sec") args.freshnessToleranceSec = Number(argv[++i]);
    else if (a === "--duration-tolerance-sec") args.durationToleranceSec = Number(argv[++i]);
  }
  return args;
};

// Mirrors render-complete-lesson.mjs's own `measureLoudness` (print_format=json 1-pass measure, never the
// full 2-pass apply — we only need the READING, not another rewrite of the file). Note: loudnorm's reported
// `input_i`/`input_tp` are the file's OWN measured loudness — independent of the I/TP/LRA filter args below —
// so the target/tolerance comparison is entirely driven by `args.lufsTarget`/`truePeakMax`, not this string.
const measureLufs = (file, target, truePeakMax) => {
  const res = spawnSync(
    "ffmpeg",
    ["-hide_banner", "-nostats", "-i", file, "-af", `loudnorm=I=${target}:TP=${truePeakMax}:LRA=11:print_format=json`, "-f", "null", "-"],
    { encoding: "utf8" },
  );
  if (res.error) return { error: "ffmpeg unavailable (" + res.error.message + ")" };
  const text = `${res.stdout ?? ""}${res.stderr ?? ""}`;
  const start = text.lastIndexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) return { error: "no loudnorm JSON in ffmpeg output" };
  try {
    const json = JSON.parse(text.slice(start, end + 1));
    return { inputI: Number(json.input_i), inputTp: Number(json.input_tp) };
  } catch (e) {
    return { error: "unparseable loudnorm JSON (" + e.message + ")" };
  }
};

const main = () => {
  const args = parseArgs(process.argv.slice(2));
  if (!args.mp4 || !args.out) {
    console.error(
      "Usage: measure-render.mjs --mp4 <path> --out <report.json> [--min-duration-sec N] " +
        "[--contact-png <path>] [--contact-json <path>]",
    );
    process.exitCode = 1;
    return;
  }

  const report = {
    mp4: args.mp4,
    minDurationSec: args.minDurationSec,
    lufsTarget: args.lufsTarget,
    lufsTolerance: args.lufsTolerance,
    truePeakMax: args.truePeakMax,
    contactPng: args.contactPng ?? null,
    contactJson: args.contactJson ?? null,
    freshnessToleranceSec: args.freshnessToleranceSec,
    durationToleranceSec: args.durationToleranceSec,
    checks: {
      mp4Exists: false,
      ffprobeRan: false,
      hasVideoStream: false,
      hasAudioStream: false,
      durationFloorMet: false,
      lufsWithinTolerance: false,
      contactFreshness: false,
      contactDurationMatch: false,
    },
    streams: [],
    durationSec: null,
    measuredLufs: null,
    measuredTruePeak: null,
    mp4MtimeMs: null,
    contactMtimeMs: null,
    contactLegendDurationSec: null,
    passingChecks: [],
    failedChecks: [],
  };

  report.checks.mp4Exists = fs.existsSync(args.mp4);
  if (!report.checks.mp4Exists) {
    report.failedChecks.push("mp4Exists: file not found at " + args.mp4);
  }

  if (report.checks.mp4Exists) {
    const probe = spawnSync(
      "ffprobe",
      [
        "-v", "error",
        "-show_entries", "stream=index,codec_type,codec_name,duration",
        "-show_entries", "format=duration",
        "-of", "json",
        args.mp4,
      ],
      { encoding: "utf8" },
    );

    if (probe.error) {
      report.failedChecks.push("ffprobeRan: ffprobe unavailable (" + probe.error.message + ")");
    } else if (probe.status !== 0) {
      report.failedChecks.push("ffprobeRan: ffprobe exited " + probe.status + " — " + (probe.stderr || "").trim().slice(-300));
    } else {
      try {
        const parsed = JSON.parse(probe.stdout);
        report.checks.ffprobeRan = true;
        report.streams = parsed.streams ?? [];
        const videoStreams = report.streams.filter((s) => s.codec_type === "video");
        const audioStreams = report.streams.filter((s) => s.codec_type === "audio");
        report.checks.hasVideoStream = videoStreams.length > 0;
        report.checks.hasAudioStream = audioStreams.length > 0;
        if (!report.checks.hasVideoStream) report.failedChecks.push("hasVideoStream: no video stream in container");
        if (!report.checks.hasAudioStream) report.failedChecks.push("hasAudioStream: no audio stream in container (silent/dropped audio)");

        const duration = Number(parsed.format?.duration ?? videoStreams[0]?.duration ?? NaN);
        report.durationSec = Number.isFinite(duration) ? duration : null;
        report.checks.durationFloorMet = Number.isFinite(duration) && duration >= args.minDurationSec;
        if (!report.checks.durationFloorMet) {
          report.failedChecks.push(
            "durationFloorMet: duration " + (report.durationSec ?? "unreadable") + "s < floor " + args.minDurationSec + "s",
          );
        }
      } catch (e) {
        report.failedChecks.push("ffprobeRan: unparseable ffprobe JSON (" + e.message + ")");
      }
    }

    if (report.checks.hasAudioStream) {
      const lufs = measureLufs(args.mp4, args.lufsTarget, args.truePeakMax);
      if (lufs.error) {
        report.failedChecks.push("lufsWithinTolerance: " + lufs.error);
      } else {
        report.measuredLufs = lufs.inputI;
        report.measuredTruePeak = lufs.inputTp;
        const lufsOk = Number.isFinite(lufs.inputI) && Math.abs(lufs.inputI - args.lufsTarget) <= args.lufsTolerance;
        const tpOk = Number.isFinite(lufs.inputTp) && lufs.inputTp <= args.truePeakMax;
        report.checks.lufsWithinTolerance = lufsOk && tpOk;
        if (!report.checks.lufsWithinTolerance) {
          report.failedChecks.push(
            `lufsWithinTolerance: measured I=${lufs.inputI} LUFS, TP=${lufs.inputTp} dBTP ` +
              `(target ${args.lufsTarget}±${args.lufsTolerance} LUFS, TP<=${args.truePeakMax}) — ` +
              "the master likely shipped un-normalized (loudnorm silently skipped/failed at render)",
          );
        }
      }
    } else {
      report.failedChecks.push("lufsWithinTolerance: skipped (no audio stream to measure)");
    }

    // --- Contact-sheet freshness + correspondence (the stale-clean-PNG hole) ---
    // Fail-CLOSED: an absent/unsuppliable input to either check is a recorded FAIL, never a silent pass.
    if (!args.contactPng || !args.contactJson) {
      report.failedChecks.push(
        "contactFreshness: --contact-png/--contact-json not supplied — cannot evaluate correspondence (fail-closed, not skipped)",
      );
      report.failedChecks.push(
        "contactDurationMatch: --contact-png/--contact-json not supplied — cannot evaluate correspondence (fail-closed, not skipped)",
      );
    } else if (!fs.existsSync(args.contactPng)) {
      report.failedChecks.push("contactFreshness: contact PNG not found at " + args.contactPng);
      report.failedChecks.push("contactDurationMatch: contact PNG not found at " + args.contactPng);
    } else {
      const mp4MtimeMs = fs.statSync(args.mp4).mtimeMs;
      const contactMtimeMs = fs.statSync(args.contactPng).mtimeMs;
      report.mp4MtimeMs = mp4MtimeMs;
      report.contactMtimeMs = contactMtimeMs;

      const toleranceMs = args.freshnessToleranceSec * 1000;
      report.checks.contactFreshness = contactMtimeMs >= mp4MtimeMs - toleranceMs;
      if (!report.checks.contactFreshness) {
        report.failedChecks.push(
          `contactFreshness: contact PNG mtime (${new Date(contactMtimeMs).toISOString()}) is ` +
            `${((mp4MtimeMs - contactMtimeMs) / 1000).toFixed(1)}s older than the mp4's ` +
            `(${new Date(mp4MtimeMs).toISOString()}), beyond the ${args.freshnessToleranceSec}s tolerance — ` +
            "the contact sheet was NOT regenerated for this render (make-contact-sheet.mjs likely failed/skipped " +
            "and a stale prior-run PNG shipped instead)",
        );
      }

      if (!fs.existsSync(args.contactJson)) {
        report.failedChecks.push(
          "contactDurationMatch: contact legend JSON not found at " + args.contactJson +
            " (cannot confirm the sheet was derived from THIS mp4)",
        );
      } else {
        try {
          const legend = JSON.parse(fs.readFileSync(args.contactJson, "utf8"));
          const fps = Number(legend.fps);
          const totalDuration = Number(legend.totalDuration);
          if (!Number.isFinite(fps) || fps <= 0 || !Number.isFinite(totalDuration)) {
            report.failedChecks.push(
              "contactDurationMatch: legend JSON missing/invalid fps or totalDuration",
            );
          } else if (!Number.isFinite(report.durationSec)) {
            report.failedChecks.push(
              "contactDurationMatch: mp4 duration unreadable (ffprobe above did not resolve it)",
            );
          } else {
            const legendDurationSec = totalDuration / fps;
            report.contactLegendDurationSec = legendDurationSec;
            const diff = Math.abs(legendDurationSec - report.durationSec);
            report.checks.contactDurationMatch = diff <= args.durationToleranceSec;
            if (!report.checks.contactDurationMatch) {
              report.failedChecks.push(
                `contactDurationMatch: contact sheet legend implies ${legendDurationSec.toFixed(2)}s ` +
                  `(totalDuration ${totalDuration}f @ ${fps}fps) vs the mp4's actual ${report.durationSec.toFixed(2)}s ` +
                  `— diff ${diff.toFixed(2)}s exceeds tolerance ${args.durationToleranceSec}s (the contact sheet ` +
                  "was built against a DIFFERENT-length render, not this mp4)",
              );
            }
          }
        } catch (e) {
          report.failedChecks.push("contactDurationMatch: unparseable legend JSON (" + e.message + ")");
        }
      }
    }
  }

  report.passingChecks = Object.entries(report.checks)
    .filter(([, ok]) => ok)
    .map(([name]) => name);

  fs.mkdirSync(path.dirname(args.out), { recursive: true });
  fs.writeFileSync(args.out, JSON.stringify(report, null, 2) + "\n");

  const totalChecks = Object.keys(report.checks).length;
  console.log(
    `render-stream-sanity: ${report.passingChecks.length}/${totalChecks} checks pass` +
      (report.failedChecks.length ? ` — FAILED: ${report.failedChecks.join("; ")}` : ""),
  );
};

main();
