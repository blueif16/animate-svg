// Run via tsx as a subprocess from scripts/lesson-measured.mjs (the same
// native-TS-stripper workaround the other extractors use). LESSON-AGNOSTIC.
//
// Args: <camelLessonId> <framesCsv>
//   camelLessonId  — e.g. "fenYuHe"
//   framesCsv      — comma-separated absolute frames the measured pass samples
//
// stdout JSON:
//   {
//     lessonId, composition, fps, width, height,
//     cues:    [{ id, startFrame, endFrame }],            // reconciled timeline
//     zones:   Partial<Record<ZoneName, Bbox>> | null,
//     // Per requested frame: the manifest's LINEAR bbox for every mounted
//     // load-bearing element (so the harness can diff measured-vs-manifest and
//     // run the SAME AABB overlap math the fast path runs, on the measured set).
//     manifestByFrame: { [frame]: [{ id, zone, bbox, opacity }] }
//   }
//
// This reads the SAME manifest module (which reads layout.ts) the fast path
// reads — no lesson topic, id, or path is hardcoded here.
import { pathToFileURL } from "node:url";
import path from "node:path";

const camelLessonId = process.argv[2];
const framesCsv = process.argv[3] ?? "";
if (!camelLessonId) {
  console.error("usage: _measured-extract.ts <camelLessonId> <framesCsv>");
  process.exit(1);
}
const frames = framesCsv
  .split(",")
  .map((s) => Number(s.trim()))
  .filter((n) => Number.isFinite(n));

const main = async () => {
  const manifestAbs = path.resolve(
    process.cwd(),
    "src",
    "lessons",
    camelLessonId,
    "manifest.ts",
  );
  const mod = await import(pathToFileURL(manifestAbs).href);
  const manifest = mod.LESSON_MANIFEST;
  if (!manifest) {
    throw new Error("Manifest module did not export LESSON_MANIFEST");
  }

  // The canonical allowed-zone-pair list lives in manifestTypes.ts; import it
  // here (under tsx) and forward it so the .mjs measured script has ONE source
  // and no longer keeps its own copy.
  const typesAbs = path.resolve(
    process.cwd(),
    "src",
    "lessons",
    "manifestTypes.ts",
  );
  const { ALLOWED_OVERLAP_PAIRS } = await import(pathToFileURL(typesAbs).href);

  const manifestByFrame: Record<number, unknown[]> = {};
  for (const frame of frames) {
    const els: unknown[] = [];
    for (const el of manifest.elements) {
      const snap = el.bboxAt(frame);
      if (!snap) continue;
      els.push({ id: el.id, zone: el.zone, bbox: snap.bbox, opacity: snap.opacity });
    }
    manifestByFrame[frame] = els;
  }

  process.stdout.write(
    JSON.stringify({
      lessonId: manifest.lessonId,
      composition: manifest.composition,
      fps: manifest.fps,
      width: manifest.width,
      height: manifest.height,
      // Reconciled cue window + author metadata (caption/phrase/emphasis). The
      // caption-redundancy gate that consumed caption/phrase/emphasis was cut
      // (the human is the eye); these fields are still forwarded for any future
      // consumer and stay part of the stdout contract.
      cues: manifest.cues.map((c: any) => ({
        id: c.id,
        startFrame: c.startFrame,
        endFrame: c.endFrame,
        caption: c.caption ?? null,
        phrase: c.phrase ?? null,
        emphasis: c.emphasis ?? false,
      })),
      zones: manifest.zones ?? null,
      // Manifest-declared intentional element-id overlap pairs (allowedOverlaps).
      // Zone tags never grant a collision exemption — only these pairs do.
      allowedOverlaps: manifest.allowedOverlaps ?? null,
      // The canonical allowed-zone-pair list from manifestTypes.ts, forwarded so
      // the .mjs measured script has ONE source — it no longer keeps its own copy.
      allowedZonePairs: ALLOWED_OVERLAP_PAIRS,
      // FULL declared element id+zone set (every element, regardless of whether
      // it is mounted at a sampled frame) — the bbox-binding bijection audit
      // compares measured ids against THIS set, not the per-frame snapshots, so a
      // declared element merely absent from the sampled frames is not a false
      // "orphan tag".
      elements: manifest.elements.map((e: any) => ({ id: e.id, zone: e.zone })),
      manifestByFrame,
    }),
  );
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
