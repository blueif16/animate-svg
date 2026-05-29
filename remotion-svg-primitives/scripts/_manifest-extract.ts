// Run via tsx as a subprocess from the .mjs scripts.
// Args: <camelLessonId>  -> stdout JSON:
//   { lessonId, composition, fps,
//     zones: Partial<Record<ZoneName, Bbox>> | null,   // declared zone bands (caption ribbon etc.)
//     keyFrames: [{ id, frame, cueId, offset, label, elements:[{id,zone,bbox,opacity}] }] }
import { pathToFileURL } from "node:url";
import path from "node:path";

const camelLessonId = process.argv[2];
if (!camelLessonId) {
  console.error("usage: _manifest-extract.ts <camelLessonId>");
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
  const typesAbs = path.resolve(
    process.cwd(),
    "src",
    "lessons",
    "manifestTypes.ts",
  );

  const mod = await import(pathToFileURL(manifestAbs).href);
  const manifest = mod.LESSON_MANIFEST;
  if (!manifest) throw new Error("Manifest module did not export LESSON_MANIFEST");
  const types = await import(pathToFileURL(typesAbs).href);
  const { resolveKeyFrameAbsolute } = types;

  const keyFrames = manifest.keyFrames.map((kf: any) => {
    const frame = resolveKeyFrameAbsolute(manifest, kf);
    const elements: any[] = [];
    for (const el of manifest.elements) {
      const snap = el.bboxAt(frame);
      if (!snap) continue;
      elements.push({
        id: el.id,
        zone: el.zone,
        bbox: snap.bbox,
        opacity: snap.opacity,
      });
    }
    return {
      id: kf.id,
      frame,
      cueId: kf.cueId,
      offset: kf.offset,
      label: kf.label,
      elements,
    };
  });

  process.stdout.write(
    JSON.stringify({
      lessonId: manifest.lessonId,
      composition: manifest.composition,
      fps: manifest.fps,
      // Forward the declared zone bands (currently only `caption` is read by the
      // caller's caption-safe-region check). `manifest.zones` is the optional
      // Partial<Record<ZoneName, Bbox>> from manifestTypes.ts; manifests that do
      // not declare it serialize to `undefined` and the downstream check stays a
      // no-op, so this is backward-compatible.
      zones: manifest.zones ?? null,
      keyFrames,
    }),
  );
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
