// Agent-facing LESSON-MEDIA API digest — the composer's authoritative
// "where does each audio / caption / SFX / timeline symbol live" menu.
//
// WHY THIS EXISTS
// ---------------
// The primitive catalog-digest.md answers "which teaching PRIMITIVE do I mount".
// It does NOT answer "how do I import the audio/caption/SFX layers + the cue /
// timeline helpers" — those live in src/lesson-media/* (thin animation-test
// wrappers) and in the two shared kits (@studio/narration-kit, @studio/sound-kit)
// the wrappers re-export. With no authoritative surface for THOSE import paths,
// the composer had to trust prose — and the skill mis-stated them (it claimed the
// Lesson*Layer components + spansToWindows are exports of @studio/narration-kit;
// they are NOT), so the composer spent a whole run `find`-ing /Users/tk/Desktop
// and cat-ing node_modules/@studio/* hunting symbols that don't exist there.
//
// This digest closes that hole the same way catalog-digest.md closed the primitive
// one: a CODE-GENERATED, drift-gated read-view. The source of truth is the repo's
// OWN source text — the src/lesson-media/* wrapper exports and the @studio/* import
// statements the repo actually writes — so a renamed / moved export changes this
// file and `--check` fails. The composer READS this (it is under readScope
// src/capabilities/); it NEVER hunts the disk.
//
// HERMETIC: reads only in-repo files under remotion-svg-primitives/ (never the
// sibling shared-narration / shared-sound repos), so the gate runs anywhere.
//
// Two modes (mirroring catalog-digest.mjs):
//   (default / "build")  regenerate the digest and WRITE it.
//   "--check"            regenerate in memory and DIFF against the committed
//                        digest; exit non-zero if stale. Never writes.
//
// Conventions: ESM, node:fs / node:path, standard library only — no deps.

import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {stripComments, isComponentName} from "./code-unions.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const mediaDir = path.join(root, "src/lesson-media");
const outPath = path.join(root, "src/capabilities/lesson-media-digest.md");

const read = (p) => fs.readFileSync(p, "utf8");
const exists = (p) => fs.existsSync(p);

// Classify a symbol → component | type | const | helper. SCREAMING_SNAKE is a
// const (checked BEFORE the leading-capital component test, or BED_UNDUCKED_…
// would read as a "component"). PascalCase value = component; the rest = helper.
const classify = (name, isType) =>
  isType ? "type"
    : /^[A-Z0-9][A-Z0-9_]*$/.test(name) ? "const"
      : isComponentName(name) ? "component"
        : "helper";

// --- parsers (code-as-truth, comment-stripped) -----------------------------
// Every named export of a source file, whatever the form:
//   export { A, B as C } from "mod";      export type { T } from "mod";
//   export { A as B };  export type { T };  (bare re-export, no `from`)
//   export const N = …;  export function N(…) {}  export class N {}
//   export type N = …;   export interface N {}
// Returns [{name, kind}] where kind ∈ component|type|const|helper.
const parseExports = (src) => {
  const clean = stripComments(src);
  const found = new Map(); // name -> kind (first wins)
  const add = (name, kind) => {
    if (!/^[A-Za-z_$][\w$]*$/.test(name)) return;
    if (!found.has(name)) found.set(name, kind);
  };

  // 1. brace re-export blocks (`export [type] { … }` with or without `from`)
  const blockRe = /export\s+(type\s+)?\{([^}]*)\}/g;
  for (const m of clean.matchAll(blockRe)) {
    const isType = Boolean(m[1]);
    for (const raw of m[2].split(/[,\n]/)) {
      const name = raw.trim().split(/\s+as\s+/).pop().trim();
      if (name) add(name, classify(name, isType));
    }
  }
  // 2. local value declarations
  for (const m of clean.matchAll(
    /export\s+(?:const|let|var|function|async\s+function|class)\s+([A-Za-z_$][\w$]*)/g,
  )) {
    add(m[1], classify(m[1], false));
  }
  // 3. local type declarations (`export type Name` / `export interface Name`,
  //    NOT the `export type {` re-export form — that has `{` after `type `).
  for (const m of clean.matchAll(
    /export\s+(?:type|interface)\s+([A-Za-z_$][\w$]*)/g,
  )) {
    add(m[1], "type");
  }
  return [...found.entries()].map(([name, kind]) => ({name, kind}));
};

// Names imported FROM a given @studio/* kit anywhere under a set of dirs — the
// kit-DIRECT surface the composer legitimately imports (helpers/types the local
// wrappers do NOT re-export). `import { a, type B } from "@studio/narration-kit"`.
const parseKitImports = (dirs, kit) => {
  // Track per name whether it was ever imported as a VALUE vs only as a type —
  // a name imported only via `import type {…}` / `type X` is a type; any value
  // import means it's a value (component/helper/const).
  const seen = new Map(); // name -> {value:boolean, type:boolean}
  const mark = (name, isType) => {
    if (!/^[A-Za-z_$][\w$]*$/.test(name)) return;
    const s = seen.get(name) || {value: false, type: false};
    if (isType) s.type = true; else s.value = true;
    seen.set(name, s);
  };
  const kitRe = kit.replace(/[/\\^$*+?.()|[\]{}]/g, "\\$&");
  const walk = (dir) => {
    if (!exists(dir)) return;
    for (const ent of fs.readdirSync(dir, {withFileTypes: true})) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(p);
      else if (/\.(ts|tsx)$/.test(ent.name)) {
        const clean = stripComments(read(p));
        const re = new RegExp(`import\\s+(type\\s+)?\\{([^}]*)\\}\\s*from\\s*["']${kitRe}["']`, "g");
        for (const m of clean.matchAll(re)) {
          const blockType = Boolean(m[1]);
          for (const raw of m[2].split(/[,\n]/)) {
            const t = raw.trim();
            if (!t) continue;
            const perType = /^type\s+/.test(t);
            const name = t.replace(/^type\s+/, "").split(/\s+as\s+/)[0].trim();
            mark(name, blockType || perType);
          }
        }
      }
    }
  };
  for (const d of dirs) walk(d);
  return [...seen.entries()]
    .map(([name, s]) => ({name, kind: classify(name, s.type && !s.value)}))
    .sort((a, b) => a.name.localeCompare(b.name));
};

// --- curated usage notes (the only hand-authored text; honest fallback) -----
// Keyed by symbol. Verbatim-terse — the digest is a menu, not prose.
const NOTES = {
  LessonAudioLayer: "Per-cue voice. Mount ONCE in the Complete wrapper: `<LessonAudioLayer voiceClips={<id>VoiceClips} />`. Never a single teacherAudioSrc/continuous WAV.",
  LessonBgmLayer: "Music bed (2nd track). `<LessonBgmLayer bed={audioCues.bed} windows={spansToWindows(voiceoverSpans)} totalFrames={<id>Duration} />` — mechanical envelope, you wire it, never tune it.",
  LessonCaptionLayer: "Bottom caption ribbon (kids theme baked in). PROP IS `cues` (NOT `captions`): `<LessonCaptionLayer cues={captionCues} labelWindows={[…]?} />`.",
  LessonSfxLayer: "One-shot SFX at composer-owned motion frames. `<LessonSfxLayer events={sfxEvents} />`. Each SfxEvent.fromFrame = cues[id].startFrame + a named layout.ts offset, never a literal.",
  spansToWindows: "Clip spans → bed-duck windows for <LessonBgmLayer windows={…}>. `spansToWindows(voiceClips.map(c => [c.fromFrame, c.fromFrame + c.durationInFrames]))`.",
  bedVolume: "Deterministic frame-keyed music-bed envelope (used inside LessonBgmLayer; you rarely call it directly).",
  SFX_REGISTRY: "The SFX vocabulary map (pop|chime|whoosh|tick|ta-da → asset). Reach for a registered key, never a raw path.",
  sfxSrc: "Resolve an SFX key → its asset src.",
  semitonesToPlaybackRate: "Pitch-shift an SFX via playbackRate (the rising-pitch-per-count effect).",
  SfxSound: "The SFX key union: \"pop\" | \"chime\" | \"whoosh\" | \"tick\" | \"ta-da\".",
  SfxEvent: "One scheduled SFX: { sound, fromFrame, volume?, semitones? }. Build an SfxEvent[] then pass to <LessonSfxLayer events={…} />.",
  assertConcurrentAudioBudget: "Throws AT MODULE LOAD if the SFX schedule exceeds MAX_CONCURRENT_AUDIO. Call once after building sfxEvents.",
  sampleAudioEvents: "Deterministic down-sample a dense SFX schedule to ≤ max (even stride, never Math.random).",
  MAX_CONCURRENT_AUDIO: "Ceiling on simultaneously-audible SFX one-shots.",
  filterCaptionsAroundLabels: "Drop caption cues whose midpoint falls inside an on-screen label window (one representation per beat).",
  CaptionCue: "One caption row: { fromFrame, toFrame, text|tokens }. Build the array yourself when a cue has a gap (clamp toFrame to narrationEndFrame).",
  LabelWindow: "{ startFrame, endFrame } — a window during which an in-canvas label suppresses the ribbon.",
  withCaptionKeywords: "Rewrite each cue's caption to a short authored keyword anchor (redundancy gate). Apply to the reconciled cue list.",
  CAPTION_BAND: "The one shared caption-ribbon footprint [x,y,w,h] the measured gate treats as no-go for teaching marks.",
  mediaSrc: "staticFile() helper for public/ assets. Re-exported from the kit.",
  AudioCues: "Authored sound-manifest schema (audio-cues.json): { bed, sfx[], toneSafe? }.",
  reconcileClipTimeline: "Wave-3.5 reconcile: chains per-cue clips → { cues, voiceClips, durationFrames }. Used in the <id>LessonTimeline.ts module.",
  reconcileCueTimeline: "Cue-level reconcile variant (pre-clip lessons).",
  tokenOnsetFrame: "ABSOLUTE frame of a cue's i-th spoken token (already start-offset). Use for per-token/per-count binding — never a fixed grid.",
  stepFramesFromOnsets: "Absolute step frames from a cue's token onsets (count-up / read-along enumerations).",
  cueToCaption: "Derive a CaptionCue from a reconciled cue (mechanical; Wave 3.5).",
  cueMap: "Index the reconciled cues by id for O(1) lookup.",
  VoiceClip: "One per-cue voice clip: { src, fromFrame, durationInFrames }. Pass the array straight to <LessonAudioLayer voiceClips={…} />.",
  PlacedCue: "A reconciled cue: carries startFrame/endFrame/narrationStartFrame/narrationEndFrame/gapFrames/holdFrames/tokenOnsets.",
  AlignedLessonCue: "An ASR-aligned cue (phrase + token onsets) — the pre-reconcile shape.",
  AudioLayer: "KIT-INTERNAL — wrapped locally as LessonAudioLayer. Use the wrapper, not this.",
  CaptionLayer: "KIT-INTERNAL — wrapped locally as LessonCaptionLayer. Use the wrapper, not this.",
  BgmLayer: "KIT-INTERNAL — wrapped locally as LessonBgmLayer. Use the wrapper, not this.",
  SfxLayer: "KIT-INTERNAL — wrapped locally as LessonSfxLayer. Use the wrapper, not this.",
};
const note = (name) => NOTES[name] || "_(needs prose)_";
const esc = (s) => String(s).replace(/\|/g, "\\|").replace(/\n/g, " ");

// --- PART A: local wrapper surface (canonical composer import paths) --------
// Each source file → one authoritative local import path. The 4 layer
// components are shown ONCE via the `components` barrel; their individual .tsx
// files contribute only their OTHER exports (types/helpers).
const LAYERS = new Set(["LessonAudioLayer", "LessonBgmLayer", "LessonSfxLayer", "LessonCaptionLayer"]);
const LOCAL_SOURCES = [
  {file: "components.ts", imp: "../lesson-media/components", title: "Audio / caption / SFX layers — mount in the Complete<Lesson> wrapper", only: LAYERS},
  {file: "audioMix.ts", imp: "../lesson-media/audioMix", title: "Mix engine (bed duck windows + constants)"},
  {file: "sfx.ts", imp: "../lesson-media/sfx", title: "SFX vocabulary + registry"},
  {file: "LessonSfxLayer.tsx", imp: "../lesson-media/LessonSfxLayer", title: "SFX event type + concurrency budget", skip: LAYERS},
  {file: "LessonCaptionLayer.tsx", imp: "../lesson-media/LessonCaptionLayer", title: "Caption cue type + label-window helpers", skip: LAYERS},
  {file: "captionKeywords.ts", imp: "../lesson-media/captionKeywords", title: "Caption keyword rewrite (redundancy gate)"},
  {file: "captionBand.ts", imp: "../lesson-media/captionBand", title: "Shared caption-ribbon footprint"},
  {file: "audioCuesTypes.ts", imp: "../lesson-media/audioCuesTypes", title: "Authored sound-manifest schema (audio-cues.json)"},
  {file: "mediaSrc.ts", imp: "../lesson-media/mediaSrc", title: "staticFile helper"},
];

const KIND_LABEL = {component: "component", type: "type", const: "const", helper: "helper"};
const symbolTable = (rows, importPath) => {
  const out = ["| symbol | kind | import | use |", "| --- | --- | --- | --- |"];
  for (const r of rows) {
    out.push(`| \`${r.name}\` | ${KIND_LABEL[r.kind]} | \`import { ${r.kind === "type" ? "type " : ""}${r.name} } from "${importPath}"\` | ${esc(note(r.name))} |`);
  }
  return out.join("\n");
};

// --- build the document -----------------------------------------------------
const BANNER =
  "<!-- GENERATED by `npm run registry:lesson-media-digest` (or registry:build) " +
  "from src/lesson-media/* + the repo's @studio/* imports. Do NOT hand-edit — " +
  "fix the source export/import or the NOTES map in " +
  "scripts/registry/lesson-media-digest.mjs, then regenerate. -->";

const out = [BANNER, ""];
out.push("# Lesson-media API digest — the composer's authoritative import surface\n");
out.push(
  "**READING LAW.** This file is the COMPLETE, code-generated inventory of every audio / caption / " +
  "SFX / timeline symbol the composer imports, and the EXACT path to import each from. Consult it; " +
  "NEVER `find`/`grep`/`ls`/`cat` the repo, `node_modules`, or `@studio/*` to discover where a symbol " +
  "lives — the answer is here. If a symbol you genuinely need is absent, that is a SKILL/DIGEST GAP: " +
  "record it as a `pipelineFinding` and proceed; do NOT spelunk.\n",
);

// The wrong-path callout — the exact mistake this digest exists to kill.
out.push("> ❌ **NOT exported by `@studio/narration-kit`** (a common wrong import): " +
  "`LessonAudioLayer`, `LessonBgmLayer`, `LessonSfxLayer`, `LessonCaptionLayer`, `spansToWindows`. " +
  "These are LOCAL wrappers — import them from `../lesson-media/*` (PART A). The `Lesson*Layer` names " +
  "exist ONLY locally; the kit exports the un-prefixed `AudioLayer`/`CaptionLayer`/`BgmLayer`/`SfxLayer` " +
  "which you do NOT use directly.\n");

// Copy-paste canonical wiring block (the paths below are exactly PART A / PART B).
out.push("## Copy-paste wiring (the canonical Complete<Lesson> block)\n");
out.push("```tsx");
out.push('import { LessonAudioLayer, LessonBgmLayer, LessonCaptionLayer, LessonSfxLayer } from "../lesson-media/components";');
out.push('import { spansToWindows } from "../lesson-media/audioMix";');
out.push('import type { SfxEvent } from "../lesson-media/LessonSfxLayer";');
out.push('import type { CaptionCue } from "../lesson-media/LessonCaptionLayer";');
out.push('// cue/timeline helpers + types come DIRECTLY from the kit (PART B):');
out.push('import { reconcileClipTimeline, tokenOnsetFrame } from "@studio/narration-kit";');
out.push('import type { VoiceClip, PlacedCue } from "@studio/narration-kit";');
out.push("");
out.push("// …then mount (props are load-bearing — LessonCaptionLayer takes `cues`, not `captions`):");
out.push("//   <LessonAudioLayer voiceClips={<id>VoiceClips} />");
out.push("//   <LessonCaptionLayer cues={captionCues} />");
out.push("//   <LessonBgmLayer bed={audioCues.bed} windows={spansToWindows(voiceoverSpans)} totalFrames={<id>Duration} />");
out.push("//   <LessonSfxLayer events={sfxEvents} />");
out.push("```\n");

// PART A
out.push("## PART A — local wrappers (`src/lesson-media/*`) — import from these\n");
const missingFiles = [];
for (const s of LOCAL_SOURCES) {
  const abs = path.join(mediaDir, s.file);
  if (!exists(abs)) {
    missingFiles.push(s.file);
    continue;
  }
  let rows = parseExports(read(abs));
  if (s.only) rows = rows.filter((r) => s.only.has(r.name));
  if (s.skip) rows = rows.filter((r) => !s.skip.has(r.name));
  if (!rows.length) continue;
  rows.sort((a, b) => (a.kind === b.kind ? a.name.localeCompare(b.name) : (a.kind === "component" ? -1 : b.kind === "component" ? 1 : a.kind.localeCompare(b.kind))));
  out.push(`### ${s.title}  — \`${s.imp}\`\n`);
  out.push(symbolTable(rows, s.imp));
  out.push("");
}

// PART B — kit-direct narration surface (discovered from the repo's own imports)
const narr = parseKitImports([mediaDir, path.join(root, "src/lessons")], "@studio/narration-kit");
if (narr.length) {
  out.push("## PART B — cue / timeline helpers + types — import directly from `@studio/narration-kit`\n");
  out.push("_These are NOT re-exported by the local wrappers; import them straight from the kit. " +
    "(The un-prefixed layer components here — AudioLayer/CaptionLayer — are KIT-INTERNAL; use the PART A `Lesson*Layer` wrappers instead.)_\n");
  out.push(symbolTable(narr, "@studio/narration-kit"));
  out.push("");
}

// PART C — underlying sound kit (brief; the composer uses the PART A wrappers)
const snd = parseKitImports([mediaDir, path.join(root, "src/lessons")], "@studio/sound-kit");
if (snd.length) {
  out.push("## PART C — underlying `@studio/sound-kit` surface (reference)\n");
  out.push("_You normally reach these through the PART A wrappers (`../lesson-media/sfx`, `audioMix`, `LessonBgmLayer`, `LessonSfxLayer`). Listed for completeness._\n");
  out.push(symbolTable(snd, "@studio/sound-kit"));
  out.push("");
}

if (missingFiles.length) {
  out.push(`> ⚠ source file(s) not found (digest out of date with the tree): ${missingFiles.join(", ")}\n`);
}

const generated = out.join("\n") + "\n";

// --- main (mirrors catalog-digest.mjs) --------------------------------------
const checkMode = process.argv.includes("--check");
if (checkMode) {
  const committed = exists(outPath) ? read(outPath) : null;
  if (committed === generated) {
    console.log("registry:lesson-media-digest --check ok — lesson-media-digest.md in sync.");
    process.exit(0);
  }
  console.error("registry:lesson-media-digest --check FAILED — lesson-media-digest.md is stale. Run `npm run registry:lesson-media-digest`.");
  process.exit(1);
}

const prior = exists(outPath) ? read(outPath) : null;
if (prior === generated) {
  console.log("registry:lesson-media-digest — no change.");
} else {
  fs.writeFileSync(outPath, generated);
  console.log(`registry:lesson-media-digest — wrote ${path.relative(root, outPath)} (${narr.length} narration + ${snd.length} sound kit-direct symbols).`);
}
process.exit(0);
