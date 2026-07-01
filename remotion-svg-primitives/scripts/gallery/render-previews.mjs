// =========================================================================
// render-previews.mjs — render a SMALL poster PNG + a short looping GIF for
// every registered component that has gallery demoProps, into
// gallery/previews/<id>/{poster.png,loop.gif}.
//
// REUSES, invents nothing:
//   - the registry (which ids exist) — src/capabilities/primitive-registry.json
//   - the EXACT demoProps render map (via the PreviewComposition that mounts
//     demoProps[id].render()) — src/component-gallery/demoProps.tsx
// One parametrized composition ("component-preview"); we override `id` per
// component. No new data model.
//
// Discipline:
//   - SMALL: scale 0.5 (→ 380×220), gif at low fps, ~64 frames. Tiny files.
//   - GENTLE: concurrency 1, single browser — a lesson validation render may be
//     running on this machine; we don't fight it. Override with GALLERY_CONCURRENCY.
//   - NON-BLOCKING: every id is try/caught; a failure is recorded and skipped,
//     never aborts the batch. A manifest of {ok,failed} is written.
//   - The 90 IconAssets are NOT re-rendered here — the page shows their SVGs live.
//
// Usage:
//   npm run gallery:previews              # render all
//   npm run gallery:previews -- --only fen-he-diagram,pop-in   # subset
//   GALLERY_POSTER_ONLY=1 npm run gallery:previews            # skip the gifs (faster)
// =========================================================================

import { bundle } from "@remotion/bundler";
import { renderStill, renderMedia, selectComposition } from "@remotion/renderer";
import { enableTailwind } from "@remotion/tailwind-v4";
import { readFileSync, mkdirSync, writeFileSync, existsSync, rmSync, statSync, mkdtempSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, "..", "..");
const REGISTRY = join(REPO, "src", "capabilities", "primitive-registry.json");
const DEMO_PROPS = join(REPO, "src", "component-gallery", "demoProps.tsx");
const ENTRY = join(REPO, "src", "component-gallery", "PreviewRoot.tsx");
const OUT_DIR = join(REPO, "gallery", "previews");

// ---- small-and-gentle knobs ----
const SCALE = Number(process.env.GALLERY_SCALE || 0.5); // 760x440 -> 380x220
const CONCURRENCY = Number(process.env.GALLERY_CONCURRENCY || 1);
const GIF_EVERY_NTH = Number(process.env.GALLERY_GIF_EVERY_NTH || 2); // 30fps -> 15fps gif
// Mid-action still (see PREVIEW_POSTER_FRAME in PreviewComposition.tsx) — samples
// while a one-shot effect is firing rather than its idle tail.
const POSTER_FRAME = Number(process.env.GALLERY_POSTER_FRAME || 16);
const POSTER_ONLY = process.env.GALLERY_POSTER_ONLY === "1";

const argv = process.argv.slice(2);
const onlyArg = (() => {
  const i = argv.indexOf("--only");
  return i >= 0 && argv[i + 1] ? argv[i + 1].split(",").map((s) => s.trim()) : null;
})();

// ---- which ids to render: every registry id that HAS a demoProps entry. ----
// We read the ids straight from the registry sections, then keep only those the
// demoProps map knows. Demo keys come in TWO forms — kebab string-literal keys
// (`"fen-he-diagram":`) AND bare single-word identifiers (`drag:`, `sparkle:`) —
// exactly as the check-gallery gate parses them, so our preview set matches the
// gate's "demoed" set 1:1 (no false "noDemo" for the bare-ident components).
const registry = JSON.parse(readFileSync(REGISTRY, "utf8"));
const demoSrc = readFileSync(DEMO_PROPS, "utf8");

// HONEST PREVIEW: a card animates only if its gif TRULY moves. Coalesce the gif
// and RMSE-diff frame 0 vs the middle frame via ImageMagick (already on the
// machine); a normalized RMSE under ~0.003 means identical frames = static (45
// posters wearing a "live" badge was the bug). If magick is unavailable, fall
// back to "declares loopFrames" (the only demos built to move).
const hasLoopFrames = (id) =>
  new RegExp(`["']?${id}["']?\\s*:\\s*\\{[^}]*loopFrames`).test(demoSrc);
function gifHasMotion(gifPath, id) {
  try {
    const tmp = mkdtempSync(join(tmpdir(), "gifmo-"));
    try {
      execFileSync("magick", [gifPath, "-coalesce", join(tmp, "f-%03d.png")], { stdio: "ignore" });
      const frames = readdirSync(tmp).filter((f) => f.startsWith("f-")).sort();
      if (frames.length < 2) return false;
      // Sample several frames vs frame 0 — motion can peak AWAY from the midpoint
      // (e.g. a morph that returns near its start at the middle), so a single
      // f0-vs-mid compare false-negatives. Take the max normalized RMSE.
      // `compare` prints the metric to stderr and exits 0 for IDENTICAL frames /
      // non-zero when they differ — spawnSync captures stderr either way (the
      // try/catch on execFileSync missed the exit-0 identical case → false "live").
      const last = frames.length - 1;
      const probes = [...new Set([0.25, 0.5, 0.75, 1].map((q) => Math.min(last, Math.round(last * q))))];
      let maxRmse = 0;
      for (const i of probes) {
        const r = spawnSync("compare", ["-metric", "RMSE", join(tmp, frames[0]), join(tmp, frames[i]), "null:"], { encoding: "utf8" });
        const m = `${r.stderr || ""}${r.stdout || ""}`.match(/\(([\d.]+)\)/); // normalized RMSE
        if (m) maxRmse = Math.max(maxRmse, Number(m[1]));
      }
      return maxRmse > 0.003; // any sampled frame differs from frame 0 → moving
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  } catch {
    return hasLoopFrames(id); // magick missing — best-effort fallback
  }
}
const mappedIds = (() => {
  const startIdx = demoSrc.indexOf("export const demoProps");
  const braceOpen = demoSrc.indexOf("{", startIdx);
  let depth = 0;
  let braceClose = -1;
  for (let i = braceOpen; i < demoSrc.length; i++) {
    if (demoSrc[i] === "{") depth++;
    else if (demoSrc[i] === "}" && --depth === 0) { braceClose = i; break; }
  }
  const body = demoSrc.slice(braceOpen, braceClose === -1 ? undefined : braceClose + 1);
  const keyRe = /(?:["']([a-z0-9-]+)["']|\b([a-z][a-z0-9]*))\s*:/g;
  const set = new Set();
  let m;
  while ((m = keyRe.exec(body)) !== null) set.add(m[1] ?? m[2]);
  return set; // intersected with registry ids below — nested camelCase props drop out.
})();

const registryIds = [
  ...(registry.primitives ?? []),
  ...(registry.motionComponents ?? []),
  ...(registry.specialComponents ?? []),
  ...(registry.fxComponents ?? []),
]
  .map((e) => e.id)
  // skip the IconAsset primitive (90 SVGs already shown live) — a single demo
  // poster adds nothing the live grid doesn't.
  .filter((id) => id !== "icon-asset");

// every demoed id (the full universe a complete run renders) — the manifest is
// rebuilt from disk over THIS set so a `--only` run keeps the rest visible.
const mappedAllIds = registryIds.filter((id) => mappedIds.has(id));
const noDemo = registryIds.filter((id) => !mappedIds.has(id));
let targets = mappedAllIds.slice();
if (onlyArg) targets = targets.filter((id) => onlyArg.includes(id));

console.log(
  `Rendering previews for ${targets.length} components ` +
    `(scale ${SCALE}, ${POSTER_ONLY ? "poster only" : "poster + gif"}, concurrency ${CONCURRENCY}).` +
    (noDemo.length ? ` ${noDemo.length} registry ids have no demoProps (skipped).` : ""),
);

mkdirSync(OUT_DIR, { recursive: true });

console.log("Bundling preview entry…");
const serveUrl = await bundle({
  entryPoint: ENTRY,
  webpackOverride: (config) => enableTailwind(config),
  enableCaching: false, // disable webpack's shared persistent cache — parallel-fleet safe (see render-complete-lesson.mjs)
  // quiet: keep the machine calm; default onProgress prints a lot.
  onProgress: () => {},
});

const ok = []; // ids with a poster (and gif unless POSTER_ONLY)
const posterOnlyOk = []; // ids whose poster rendered but gif failed
const failed = [];

async function renderOne(id) {
  const dir = join(OUT_DIR, id);
  mkdirSync(dir, { recursive: true });
  const fitProps = { id, mode: "fit" };

  const composition = await selectComposition({
    serveUrl,
    id: "component-preview",
    inputProps: fitProps,
  });

  // Remotion 4.0 renders from composition.props (the EFFECTIVE props), not the
  // per-call inputProps — so override composition.props per render or both modes
  // come out as the baked default ("fit").
  const withMode = (mode) => ({ ...composition, props: { id, mode } });

  // FIT poster (the grid thumbnail) — the demo scaled to FILL the cell.
  await renderStill({
    composition: withMode("fit"),
    serveUrl,
    inputProps: fitProps,
    output: join(dir, "poster.png"),
    frame: POSTER_FRAME,
    scale: SCALE,
    imageFormat: "png",
    overwrite: true,
    chromiumOptions: { gl: "angle" },
  });

  // SIZE still — the component at its DEFAULT size (one unit + the typical group)
  // placed 1:1 inside the to-scale 1280×720 frame, so its real on-canvas size
  // reads honestly. A still: size is the point, not motion.
  await renderStill({
    composition: withMode("size"),
    serveUrl,
    inputProps: { id, mode: "size" },
    output: join(dir, "size.png"),
    frame: POSTER_FRAME,
    scale: SCALE,
    imageFormat: "png",
    overwrite: true,
    chromiumOptions: { gl: "angle" },
  });

  // Looping GIF. NOTE: with the gif codec in this Remotion build, passing
  // `output` returns OK but writes no file — the bytes come back on
  // `result.buffer`, so we write it ourselves. A gif failure is non-fatal.
  if (!POSTER_ONLY) {
    try {
      const result = await renderMedia({
        composition: withMode("fit"),
        serveUrl,
        inputProps: fitProps,
        codec: "gif",
        imageFormat: "png",
        scale: SCALE,
        everyNthFrame: GIF_EVERY_NTH,
        numberOfGifLoops: 0, // infinite loop
        concurrency: 1,
        chromiumOptions: { gl: "angle" },
      });
      if (!result || !result.buffer) throw new Error("gif render returned no buffer");
      writeFileSync(join(dir, "loop.gif"), result.buffer);
      return "full";
    } catch (gifErr) {
      const reason = (gifErr?.message || String(gifErr)).split("\n")[0].slice(0, 160);
      console.warn(`    ↳ gif failed, poster kept: ${reason}`);
      return "poster-only";
    }
  }
  return "poster-only";
}

// simple bounded pool (default 1 = fully serial / gentle)
let cursor = 0;
async function worker(n) {
  while (cursor < targets.length) {
    const i = cursor++;
    const id = targets[i];
    const tag = `[${i + 1}/${targets.length}] ${id}`;
    try {
      const t0 = Date.now();
      const kind = await renderOne(id);
      if (kind === "poster-only" && !POSTER_ONLY) posterOnlyOk.push(id);
      ok.push(id);
      console.log(`  ✓ ${tag}  (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    } catch (err) {
      const reason = (err && err.message ? err.message : String(err)).split("\n")[0].slice(0, 200);
      failed.push({ id, reason });
      console.warn(`  ✗ ${tag}  FAILED: ${reason}`);
      // leave no half-written dir behind that could read as "ok"
      try {
        const dir = join(OUT_DIR, id);
        if (existsSync(join(dir, "poster.png")) === false && existsSync(dir)) rmSync(dir, { recursive: true, force: true });
      } catch { /* ignore */ }
    }
  }
}

await Promise.all(Array.from({ length: Math.max(1, CONCURRENCY) }, (_, n) => worker(n)));

// manifest the page reads to know which posters/gifs exist (derived, gitignored).
// Build it from what's actually ON DISK across ALL targets considered this run
// (not just the rendered subset) so a `--only` run never clobbers previously
// rendered previews — the page should see every poster/gif present, period.
const allConsidered = onlyArg ? mappedAllIds : targets;
const diskOk = [];
const diskWithGif = []; // gif present AND actually moves — the honest "live" set
const diskStaticGif = []; // gif on disk but visually static (45 identical frames)
const diskPosterOnly = [];
const diskSize = []; // ids with a true-size view (size.png) on disk
console.log("Classifying gif motion (honest preview)…");
for (const id of allConsidered) {
  const dir = join(OUT_DIR, id);
  const hasPoster = existsSync(join(dir, "poster.png"));
  if (!hasPoster) continue;
  diskOk.push(id);
  const gifPath = join(dir, "loop.gif");
  if (existsSync(gifPath)) {
    if (gifHasMotion(gifPath, id)) diskWithGif.push(id);
    else {
      diskStaticGif.push(id);
      diskPosterOnly.push(id);
    }
  } else diskPosterOnly.push(id);
  if (existsSync(join(dir, "size.png"))) diskSize.push(id);
}

const manifest = {
  generatedAt: new Date().toISOString().slice(0, 10),
  scale: SCALE,
  posterOnlyMode: POSTER_ONLY, // run was --poster-only (no gifs attempted)
  width: Math.round(760 * SCALE),
  height: Math.round(440 * SCALE),
  ok: diskOk.sort(), // ids that have a poster.png on disk
  withGif: diskWithGif.sort(), // HONEST: ids whose gif actually moves (live badge)
  staticGif: diskStaticGif.sort(), // gif on disk but static — shown as poster, no badge
  posterOnly: diskPosterOnly.sort(), // poster present, no MOVING gif
  size: diskSize.sort(), // ids with a true-size view (size.png)
  failed: failed.sort((a, b) => a.id.localeCompare(b.id)), // failures THIS run
  noDemo: noDemo.sort(),
};
writeFileSync(join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));

console.log(
  `\nDone: ${ok.length} rendered, ${failed.length} failed, ${noDemo.length} skipped (no demoProps).`,
);
if (failed.length) {
  console.log("Failures:");
  for (const f of failed) console.log(`  - ${f.id}: ${f.reason}`);
}
console.log(`\nManifest: gallery/previews/manifest.json`);
process.exit(0);
