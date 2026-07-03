// Self-contained runnable test for the PURE core of the measured text-fitting
// module (src/layout/fitText.ts). No test framework is installed; this uses
// node:assert/strict and runs via:
//   npx tsx src/layout/fitText.test.ts        (or: npm run test:fittext)
//
// The pure core takes an INJECTED `measure(text, fontSize)` so the CJK-wrap and
// floor-clamp logic is testable WITHOUT a browser/DOM. Production binds
// `measure` to @remotion/layout-utils `measureText` (browser-only) — that thin
// glue is not unit-tested here (it is exercised by the LessonIntroCard still
// render). A fake measure below models real font behaviour: a CJK glyph is ~1
// em wide, a Latin glyph ~0.55 em, a space ~0.3 em, all scaling linearly with
// fontSize — the property real proportional text has.
//
// The headline law (test-discipline): every check FAILS when the code is wrong.
// The mutation drill run during authoring is reported in the module's Progress
// entry; here the CJK check is additionally demonstrated RED against the vendor
// naive space-splitting path (the named remotion scan C3 failure).

import assert from "node:assert/strict";

import {sizing, video} from "../theme";
import {
  REFERENCE_WIDTH,
  ROLE_FLOORS,
  fitTextBox,
  roleFloorPx,
  segmentText,
  wrapSegments,
  type MeasureFn,
  type Segment,
} from "./fitText";

let passes = 0;
const check = (label: string, fn: () => void): void => {
  fn();
  passes += 1;
  // eslint-disable-next-line no-console
  console.log(`  ok  ${label}`);
};

// --- fake measurement: proportional glyph widths, decoupled from the module's
// own isCJK so a broken segmenter cannot hide behind the fake. A char above the
// CJK ideograph/kana/hangul block counts as full-em; ASCII space is 0.3 em; all
// other (Latin) glyphs 0.55 em. Width scales linearly with fontSize.
const emWidth = (ch: string): number => {
  const code = ch.codePointAt(0) ?? 0;
  if (ch === " ") return 0.3;
  if (code >= 0x2e80) return 1; // CJK & friends region and up
  return 0.55;
};
const measure: MeasureFn = (text, fontSize) =>
  Array.from(text).reduce((sum, ch) => sum + emWidth(ch), 0) * fontSize;

// The vendor bug (remotion scan C3): `text.split(' ')` treats a spaceless
// Chinese sentence as ONE unbreakable word. Reproduced here to prove the module
// fixes it.
const naiveSpaceSegments = (text: string): Segment[] =>
  text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .map((w, i) => ({text: w, spaceBefore: i > 0}));

// ---------------------------------------------------------------------------
// 1. CJK — a spaceless Chinese string wraps across lines; the SAME assertion is
//    RED under the naive space-split path (shown, then asserted broken).
// ---------------------------------------------------------------------------
check("(1) spaceless CJK wraps across lines (naive space-split is RED)", () => {
  const zh = "认识分数的加法与减法的基本运算规则"; // 16 spaceless CJK chars
  const box = {width: 300};
  const cap = 60; // at fontSize 60, a CJK glyph is 60 wide → 5 per 300px line
  const maxLines = 4;

  const cjk = fitTextBox({
    text: zh,
    role: "label", // low floor (36) so the wrap is what is under test, not clamp
    box,
    maxLines,
    cap,
    measure,
  });

  // Wrapped across multiple lines, every line within the box, nothing overflows.
  assert.ok(cjk.lines.length > 1, `expected multi-line, got ${cjk.lines.length}`);
  assert.equal(cjk.overflow, false, "CJK-aware fit must not overflow this box");
  for (const line of cjk.lines) {
    assert.ok(
      measure(line, cjk.fontSize) <= box.width + 1e-6,
      `line "${line}" width ${measure(line, cjk.fontSize)} > box ${box.width}`,
    );
  }
  // Order preserved: joining the lines reconstructs the original characters.
  assert.equal(cjk.lines.join(""), zh, "wrapped lines must preserve char order");

  // Show the RED run: the SAME correctness assertion, evaluated against the
  // vendor naive space-split, FAILS — it produces ONE unbreakable line that
  // blows the box. Captured so the suite stays green while the red is visible.
  const naive = wrapSegments({
    segments: naiveSpaceSegments(zh),
    fontSize: cap,
    maxWidth: box.width,
    maxLines,
    measure,
  });
  let redSeen = false;
  try {
    assert.ok(naive.lines.length > 1, "naive should wrap (it does NOT)");
  } catch (e) {
    redSeen = true;
    // eslint-disable-next-line no-console
    console.log(
      `      RED (naive space-split): ${(e as Error).message} ` +
        `→ lines=${naive.lines.length}, exceedsBox=${naive.exceedsBox}`,
    );
  }
  assert.equal(redSeen, true, "naive space-split MUST be red (proves the fix)");
  assert.equal(naive.lines.length, 1, "naive keeps the whole string as one word");
  assert.equal(naive.exceedsBox, true, "naive one-liner overflows the box");
});

// ---------------------------------------------------------------------------
// 2. Floor-clamp — a fit that would land below the role floor returns the FLOOR
//    plus an overflow flag, never a smaller size; verified at a NON-1080 width.
// ---------------------------------------------------------------------------
check("(2) below-floor fit returns floor + overflow (width-scaled)", () => {
  const zh = "一二三四五六七八九十"; // 10 CJK chars, forced onto ONE line
  const box = {width: 200};
  const opts = {text: zh, role: "headline" as const, box, maxLines: 1, cap: 120};

  // At the fixed canvas (1280): headline floor is 84. 10 chars on one 200px line
  // need fontSize 20 — far below 84 — so the fit is clamped UP to the floor and
  // flagged.
  const at1280 = fitTextBox({...opts, compositionWidth: 1280, measure});
  const floor1280 = roleFloorPx("headline", 1280);
  assert.equal(floor1280, 84, "headline floor at reference width is 84");
  assert.equal(at1280.fontSize, floor1280, "clamped exactly to the floor");
  assert.equal(at1280.overflow, true, "overflow signalled");
  assert.equal(at1280.atFloor, true, "atFloor signalled");
  assert.ok(at1280.fontSize >= floor1280, "NEVER below the floor");

  // Non-1080 width: the floor scales with compositionWidth. At 640 the headline
  // floor halves to 42, and the clamp lands there — proving width-relative
  // scaling in the real fit path (not just in roleFloorPx).
  assert.equal(roleFloorPx("headline", 640), 42, "floor scales to 42 at width 640");
  const at640 = fitTextBox({...opts, compositionWidth: 640, measure});
  assert.equal(at640.fontSize, 42, "clamp lands on the width-scaled floor");
  assert.equal(at640.overflow, true, "still overflows at 640");
});

// ---------------------------------------------------------------------------
// 3. roleFloorPx width scaling is linear in compositionWidth and reference-based.
// ---------------------------------------------------------------------------
check("(3) roleFloorPx scales linearly by compositionWidth/REFERENCE_WIDTH", () => {
  assert.equal(REFERENCE_WIDTH, video.width, "reference width is the fixed canvas");
  assert.equal(roleFloorPx("label", REFERENCE_WIDTH), ROLE_FLOORS.label);
  // Doubling the width doubles every floor; halving halves it. Checked at
  // non-1080 widths (2560, 640).
  assert.equal(
    roleFloorPx("label", 2 * REFERENCE_WIDTH),
    2 * roleFloorPx("label", REFERENCE_WIDTH),
    "2x width → 2x floor",
  );
  assert.equal(
    roleFloorPx("supporting", REFERENCE_WIDTH / 2),
    roleFloorPx("supporting", REFERENCE_WIDTH) / 2,
    "half width → half floor",
  );
  // kids-eye WINS: supporting/caption == theme.captionFontPx, label == minFontPx.
  assert.equal(ROLE_FLOORS.label, sizing.minFontPx, "label floor from theme (kids-eye)");
  assert.equal(ROLE_FLOORS.supporting, sizing.captionFontPx, "supporting from theme");
  assert.equal(ROLE_FLOORS.caption, sizing.captionFontPx, "caption from theme");
});

// ---------------------------------------------------------------------------
// 4. A string that FITS above the floor returns a real fitted size, no overflow,
//    capped at `cap`.
// ---------------------------------------------------------------------------
check("(4) fits-above-floor returns capped size, no overflow/atFloor", () => {
  const r = fitTextBox({
    text: "你好", // 2 CJK chars in a roomy box
    role: "headline",
    box: {width: 1000},
    maxLines: 2,
    cap: 96,
    measure,
  });
  assert.equal(r.fontSize, 96, "short string fits at the cap (ceiling)");
  assert.equal(r.lines.length, 1, "one line");
  assert.equal(r.overflow, false, "no overflow");
  assert.equal(r.atFloor, false, "well above the floor");
});

// ---------------------------------------------------------------------------
// 5. segmentText — CJK per-char, Latin per-word, mixed handled; spaceBefore only
//    on the first sub-segment of a non-first whitespace word.
// ---------------------------------------------------------------------------
check("(5) segmentText: CJK per-char, Latin per-word, mixed", () => {
  // Pure CJK, spaceless → one segment per char, no leading spaces.
  const zh = segmentText("你好世界");
  assert.deepEqual(
    zh.map((s) => s.text),
    ["你", "好", "世", "界"],
    "each CJK char is its own segment",
  );
  assert.ok(zh.every((s) => s.spaceBefore === false), "spaceless → no spaceBefore");

  // Mixed inside one word: Latin runs grouped, CJK split, no spaces (one word).
  const mixed = segmentText("AI你好World");
  assert.deepEqual(mixed.map((s) => s.text), ["AI", "你", "好", "World"]);
  assert.ok(mixed.every((s) => s.spaceBefore === false), "one word → no spaces");

  // Space-separated words: only the FIRST sub of a non-first word gets spaceBefore.
  const latinCjk = segmentText("hello 世界 foo");
  assert.deepEqual(
    latinCjk.map((s) => `${s.spaceBefore ? " " : ""}${s.text}`),
    ["hello", " 世", "界", " foo"],
    "space marks word starts (not intra-CJK, not intra-word)",
  );

  // Latin-only wraps by WORD, never mid-word.
  const latin = segmentText("the quick brown fox");
  assert.deepEqual(latin.map((s) => s.text), ["the", "quick", "brown", "fox"]);
});

// ---------------------------------------------------------------------------
// 6. wrapSegments — a single unbreakable segment wider than the box is placed
//    but flagged (exceedsBox), so the binary search shrinks.
// ---------------------------------------------------------------------------
check("(6) wrapSegments flags an unbreakable over-wide segment", () => {
  const seg: Segment[] = [{text: "WWWWWWWW", spaceBefore: false}]; // 8*0.55*fs
  const r = wrapSegments({segments: seg, fontSize: 100, maxWidth: 100, maxLines: 3, measure});
  assert.equal(r.lines.length, 1, "one segment → one line");
  assert.equal(r.exceedsBox, true, "over-wide single segment is flagged");
});

// eslint-disable-next-line no-console
console.log(`\nfitText: ${passes}/${passes} checks passing`);
