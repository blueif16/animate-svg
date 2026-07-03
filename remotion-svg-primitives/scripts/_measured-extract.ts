// Run via tsx as a subprocess from scripts/lesson-measured.mjs (the same
// native-TS-stripper workaround the other extractors use). LESSON-AGNOSTIC.
//
// Args: <camelLessonId>
//
// stdout JSON: the metadata-only manifest forwarded for the .mjs measured pass
// (which runs under plain node and can't import this .ts):
//   {
//     lessonId, composition, fps, width, height,
//     cues:             [{ id, startFrame, endFrame, ... }],   // reconciled timeline
//     zones:            Partial<Record<ZoneName, Bbox>> | null,
//     allowedOverlaps:  [[idA, idB], ...] | null,              // intentional pairs
//     allowedZonePairs: string[],                              // ALLOWED_OVERLAP_PAIRS
//     captionBand:      Bbox,                                  // shared ribbon footprint
//     elements:         [{ id, zone }],                        // declared load-bearing set
//   }
//
// No geometry is forwarded — the measured pass reads every box off the render.
import { pathToFileURL } from "node:url";
import path from "node:path";

const camelLessonId = process.argv[2];
if (!camelLessonId) {
  console.error("usage: _measured-extract.ts <camelLessonId>");
  process.exit(1);
}

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
  const {
    ALLOWED_OVERLAP_PAIRS,
    // Legibility / safe-area constants (opportunity #4). manifestTypes.ts is the
    // SINGLE source; forwarded here so the plain-node measured pass keeps no copy.
    REFERENCE_WIDTH,
    SAFE_AREA,
    TYPE_FLOORS,
    TEXT_ZONE_ROLE,
  } = await import(pathToFileURL(typesAbs).href);

  // The caption ribbon's footprint is lesson-agnostic (one shared component), so
  // it lives as ONE constant (src/lesson-media/captionBand.ts) and is forwarded
  // here — no per-manifest `zones.caption`. The measured pass checks every
  // teaching element against this band (the caption-collision gate).
  const captionBandAbs = path.resolve(
    process.cwd(),
    "src",
    "lesson-media",
    "captionBand.ts",
  );
  const { CAPTION_BAND } = await import(pathToFileURL(captionBandAbs).href);

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
      // Legibility / safe-area single-source numbers (opportunity #4), forwarded
      // raw so scripts/lesson-measured.mjs width-scales them without a hardcode.
      referenceWidth: REFERENCE_WIDTH,
      safeArea: SAFE_AREA,
      typeFloors: TYPE_FLOORS,
      textZoneRole: TEXT_ZONE_ROLE,
      // The lesson-agnostic caption-ribbon footprint (src/lesson-media/captionBand.ts),
      // forwarded so the .mjs measured pass runs the caption-intrusion check.
      captionBand: CAPTION_BAND,
      // FULL declared element id+zone set (every element, regardless of whether
      // it is mounted at a sampled frame) — the bbox-binding bijection audit
      // compares measured ids against THIS set, not the per-frame snapshots, so a
      // declared element merely absent from the sampled frames is not a false
      // "orphan tag".
      elements: manifest.elements.map((e: any) => ({ id: e.id, zone: e.zone })),
    }),
  );
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
