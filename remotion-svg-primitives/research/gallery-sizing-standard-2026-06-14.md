# Coordinated Sizing Standard for the SVG Component Library + Gallery Size-View

**Date:** 2026-06-14
**Owner (this brief):** sizing standard + gallery extra-size overlay only. The registry field-taxonomy / intent-vs-functionality question is owned by a parallel agent; this brief only specifies the ONE sizing field that must be added.
**Scope fence:** research + design only. No source/component files edited. Where a needed fact was not in the repo, it is marked "not found".

---

## 0. TL;DR

- The stakeholder's belief — "fixed design size on a known canvas + uniform proportional upscale, relative sizes never drift" — is **correct as the rendering model and ALREADY the de-facto architecture** (the lesson scene root is one `<svg width="100%" height="100%" viewBox="0 0 1280 720">`, `kptestFenyuheSixLessonScene.tsx:615-619`). What's missing is the *coordination*: there is **no enforced minimum-size token, no per-component declared footprint, and the one skill that states size minimums targets the WRONG canvas** (1920×1080, not the real 1280×720). So the belief is right; the system that should guarantee it does not exist yet.
- **Legibility floor (single rule):** every load-bearing glyph renders at **≥ 36 px tall in 1280×720 user units = ≥ 5.0 % of the 720 frame height**; captions at **≥ 48 px = 6.67 %**. Because the root scales uniformly, the % survives any upscale to 1080p/4K.
- **Declare-your-size mechanism:** add a `footprint` block to each registry entry (`primitive-registry.json`) — `{ designW, designH, minFontPx }` in canonical 1280×720 user units — hand-authored beside `intent`/`useWhen`, carried-forward by id like the other prose fields.
- **Gallery overlay:** the existing single fit-to-frame preview gains TWO extra renders — a **TRUE-SIZE** render (component at its `footprint` inside a faint 1280×720 frame outline) and a **STRESS** render (squeezed to `footprint.designW × 0.45`) — with any text whose measured height drops below the 36 px floor boxed in coral.

---

## 1. Current state (file:line evidence)

### 1.1 The canonical coordinate system today

- The final canvas is fixed: `src/theme.ts:15-21` — `export const video = { width: 1280, height: 720, fps: 30, ... }`. There is **no** `minFontPx`, `spacing`, `typeScale`, or `sizes` token anywhere in `theme.ts` (it holds only `colors`, `video`, `typography.fontFamily`, `shadows`). **The sizing tokens this brief recommends do not exist** (confirmed by reading the whole file, `theme.ts:1-32`).
- A lesson scene authors **directly in 1280×720 user units** and scales the whole tree uniformly: `kptestFenyuheSixLessonScene.tsx:615-619` renders `<svg width="100%" height="100%" viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}>`, with `CANVAS_WIDTH = video.width`, `CANVAS_HEIGHT = video.height` (`kptestFenyuheSix/layout.ts:18-19`). So a primitive's `width={120}` means **120 of 1280 user units = 9.4 % of frame width**, and the player maps that viewBox onto any physical size with no relative-size drift. **This is exactly the model the stakeholder wants — it is already present, just not enforced.**
- `SceneFrame.tsx:43-49` (the demo/showcase wrapper) likewise uses `viewBox={`0 0 ${video.width} ${video.height}`}` with `height={video.height}` — same 1:1 user-space → frame mapping.

### 1.2 Is scaling uniform today, or does it mix px with viewBox units? (the coordinate-space-bug class)

- **Inside the SVG tree: uniform and clean.** Every primitive draws in viewBox user units; there is no `px`/user-unit mixing inside the scene `<svg>`. Good.
- **But `SceneFrame` mixes two coordinate spaces in one component:** the decorative background is SVG user-space (`SceneFrame.tsx:50-53`, `cx={1164} cy={618}`), while the title block is **HTML/CSS pixels in an absolutely-positioned `<div>`** (`SceneFrame.tsx:67-110`: `left: 84, top: 48, fontSize: 58`). Those CSS px are **NOT** in the scaling viewBox — they are laid out by the browser against the player's CSS pixel box. At native 1280×720 they coincide 1:1, so the bug is invisible today, but a CSS-px title and a user-unit background **do not scale by the same factor** if the player's CSS box ever differs from 1280×720 (Remotion's `<Player>` scales the composition, but the relationship is exactly the "client-rect px vs viewBox coords" mix the project's own discipline rule warns against). This is the one real coordinate-space hazard found and it lives in chrome, not in teaching primitives.

### 1.3 Where font sizes come from — tokens or magic numbers?

**Magic numbers, pervasively.** There is no font-size token; every glyph picks its own number:

- `shared.tsx:217-244` `PrimitiveLabel` defaults `fontSize = 24` — the closest thing to a shared default, but it is a function default, not a token, and callers override freely.
- `counting.tsx:471` `<PrimitiveLabel fontSize={22} …>`; `counting.tsx:639` and `:660` `fontSize={Math.max(16, size * 0.45)}` — a **16 px floor baked inline**, well under any legibility standard.
- `NumberCard` derives its glyph from card geometry: `counting.tsx` `glyphFontSize = cardShortSide * (isTwoDigit ? 0.46 : 0.56)` with `width = 92, height = 112` defaults → a default single-digit glyph of `min(92,112)*0.56 ≈ 51 px` (fine), but a caller passing a small `width` silently shrinks the digit below any floor with nothing to stop it.
- `literacy.tsx:1236` `LessonIntroCard` `titleSize = 96`, deriving `sectionSize = titleSize*0.34 ≈ 33`, `teaserSize = titleSize*0.44 ≈ 42` (`literacy.tsx:1253-1254`) — a real internal ratio scale, but one-off to this component.
- Raw `fontSize` literals counted across `src/shape-primitives` + `src/motion-primitives`: **23 distinct hardcoded values** (e.g. `22`×3, `36`×2, `34`×2, `24`×2, `20`×2, `19`×2, `18`×2, plus singletons 16/23/38/40/42/44/48/56/78/92). No shared ramp; neighbouring components disagree by a few px for no reason.
- The gallery's own demo captions hardcode `fontSize={16}` (`demoProps.tsx:131`) and `fontSize={26}` for the UNMAPPED marker (`PreviewComposition.tsx:159`) — 16 px is below the floor even in the tool meant to audit legibility.

### 1.4 What the skills already say about size — and the contradiction

- `kids-eye/SKILL.md:20-31` prints a measurement block whose header is **`composition: 1920×1080 @ 30fps (fixed; non-negotiable)`, `short-side: 1080 px`**, with `primary-label-min: 48 px`, `body-label-min: 36 px`, `caption-line-min: 56 px`, `teaching-unit-min: ≥ 8 % of short-side = 86 px`. `early-childhood-visual-taste/SKILL.md:37-40` repeats 48/36/56 px. **These minimums are expressed in 1080-px-short-side absolute pixels, but the real canvas short-side is 720 px** (`theme.ts:17`). Read literally against the actual canvas, a "48 px" label is **6.67 %** of 720 (correct intent) but the skill's own arithmetic ("= 8 % of short-side = 86 px") is computed against 1080 and is wrong here. **This is the core uncoordinated-sizing defect: the authority document and the canvas disagree.**
- The only *enforced* size number today is the measured legibility gate: `docs/proposals/machine-gated-verification.md:219` floors rendered glyph height at **"≥ ~24 px"** — roughly half the skills' 48 px and **only 3.3 % of 720 px height**. So the machine gate, the taste skills, and the canvas each carry a different number.

**Six+ citations for §1:** `theme.ts:15-21`; `theme.ts:1-32` (no size tokens); `kptestFenyuheSixLessonScene.tsx:615-619`; `kptestFenyuheSix/layout.ts:18-19`; `SceneFrame.tsx:43-49` + `:67-110` (px/unit mix); `shared.tsx:217-244` (`PrimitiveLabel fontSize=24`); `counting.tsx:639,660` (`Math.max(16,…)`); `kids-eye/SKILL.md:20-31` (wrong canvas); `machine-gated-verification.md:219` (24 px gate).

---

## 2. External best practice (each claim cited + URL)

**(A) Uniform proportional scale = "author once in a viewBox, scale the single root."** The stakeholder's model is the textbook SVG approach. MDN: a `viewBox` "transform stretches or resizes the SVG viewport to fit a particular container element," and `preserveAspectRatio` (default `xMidYMid meet`) "is used to force a uniform scaling for the purposes of preserving the aspect ratio of a graphic" — the entire viewBox stays visible, scaled up as much as possible, aspect ratio preserved. So one viewBox + default `meet` gives zero relative-size drift on upscale.
- MDN `viewBox`: https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/viewBox
- MDN `preserveAspectRatio`: https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/preserveAspectRatio
- Soueidan, "Understanding SVG Coordinate Systems": "`preserveAspectRatio` is used to force a uniform scaling for the purposes of preserving the aspect ratio of a graphic." https://www.sarasoueidan.com/blog/svg-coordinate-systems/
- CSS-Tricks "How to Scale SVG": "the image is scaled until it just fits both the height and width, and it is centered." https://css-tricks.com/scale-svg/

**(B) The legibility FLOOR is conventionally expressed as a % of picture HEIGHT — exactly so it survives any resolution.** Multiple broadcast authorities:
- **BBC Subtitle Guidelines:** caption "font size should be set to fit within a line height in the range **7 % to 8 % of the active video height** for 16:9." The EBU-TT-D technical thread states the BBC requirement as "**around 6.667 % of the render area height** for landscape video." https://www.bbc.co.uk/accessibility/forproducts/guides/subtitles/ and https://github.com/bbc/ttml-validator/discussions/10
- **BBC GEL:** "Each line currently occupies approximately **8 % of the screen height**. So no matter what size device you use, the size of the subtitles should appear to take up a similar amount of screen space." https://www.bbc.co.uk/gel/features/subtitles-customisation
- **ASA/BCAP (UK ad regulator), superimposed text:** minimum on-screen text height is **16 SDTV lines**, which it converts to **30 HDTV (1080-line) lines** via `(16 ÷ 576) × 1080 = 30` — i.e. **2.78 % of picture height** is the *bare regulatory minimum* for European text; the *standard* is 18 SDTV / 34 HDTV lines. Crucially: "the size of text for **[pictographic/ideographic, e.g. Chinese]** languages should be **greater** … an increase of two SDTV lines (minimum) … four HDTV lines (standard)." https://www.asa.org.uk/static/uploaded/986c01bc-f666-4c74-b550200fbf59af1b.pdf
  - This is the single most relevant external source: the audience is **young children reading Mandarin hanzi**, and the standard explicitly says CJK glyphs must be **larger than** the Latin floor.

**(C) Safe area / title-safe convention (where text may live):** EBU R95 / ITU-R BT.1848: **action-safe = 3.5 %** inset, **graphics-safe = 5 %** inset on every edge. SMPTE ST 2046-1 (via ATSC A/343): the **safe title area is the middle 90 %** (origin 5 %,5 %, extent 90 %×90 %).
- EBU R95: https://tech.ebu.ch/docs/r/r095.pdf ("action safe area is 3.5 % and the graphics safe area is 5 %")
- ITU-R BT.1848: https://www.itu.int/dms_pubrec/itu-r/rec/bt/R-REC-BT.1848-1-201510-I!!PDF-E.pdf
- ATSC A/343 §5.3: "the safe title area as the middle 90 % … origin (5 % 5 %) and extent (90 % 90 %)." https://www.atsc.org/wp-content/uploads/2021/09/A343-2018-Captions-and-Subtitles-with-Amend-1-2.pdf

**(D) Type scale / design-token practice on a fixed canvas:** the consensus three-tier token architecture is **primitive scale steps → semantic names → components consume only semantic tokens, never raw numbers**, with one mathematical ratio (commonly 1.2 Minor Third or 1.25 Major Third):
- Lucky Graphics, "Typography Scale System": "Level 1 Primitive tokens … Level 2 Semantic tokens … Level 3 Components consume semantic tokens, never primitives directly," ratio 1.25 or 1.333. https://lucky.graphics/learn/typography-scale-system-guide/
- Material Design 3 type scale: one type scale, token-per-style, "**Avoid changing the type size**; this can affect how components render and reflow," Major Second base. https://m3.material.io/styles/typography/type-scale-tokens
- Penpot, proportional type scale via tokens: "tokens can reference other tokens' values … create a sophisticated typographic scale using very few design tokens … similar tokens for proportional spacing, icon sizes." https://penpot.app/blog/using-design-tokens-for-a-proportional-typographic-scale/

---

## 3. Proposed sizing standard (numbers, rules, the declare-your-size mechanism)

### 3.1 The canonical authoring size + uniform-scale rule (confirms the stakeholder)

1. **Canonical canvas = 1280 × 720 user units** (`theme.ts:15-21`, unchanged). Every primitive, every lesson, is authored in these units. A number like `width={120}` is **always** "120 of 1280", never device px.
2. **One scaling root, `meet`, no per-element re-scaling for fit.** The scene root stays `<svg width="100%" height="100%" viewBox="0 0 1280 720">` (already true). Upscaling to 1080p/4K is the player scaling this one viewBox uniformly → **zero relative-size drift** (source §2A). Lessons must never hardcode device px; the one offender pattern to fix over time is `SceneFrame`'s CSS-px title block (§1.2) — move it into the viewBox as SVG `<text>` so it scales with everything else.

### 3.2 The legibility FLOOR — a single checkable rule

Convert the broadcast %-of-height floors to the 720 canvas and pick the value appropriate for **6-year-olds reading hanzi** (ASA §2B: CJK must exceed the Latin floor; BBC §2B: comfortable caption reading is 6.67–8 % of height):

| Standard (source) | % of height | px on 720 |
| --- | --- | --- |
| ASA bare minimum, Latin (30/1080 lines) | 2.78 % | 20 px |
| Machine gate today (`mgv.md:219`) | 3.33 % | 24 px |
| **THIS STANDARD — load-bearing teaching glyph / label floor** | **5.0 %** | **36 px** |
| Caption ribbon floor (BBC 6.67 %) | 6.67 % | 48 px |
| Primary signal label / title target | ≥ 8 % | ≥ 58 px |

> **THE FLOOR (one rule):** *Any glyph a child must read to learn — a teaching numeral, hanzi, pinyin, or a load-bearing label — renders at **≥ 36 px in 1280×720 user units (≥ 5.0 % of the 720 frame height)**. Captions render at **≥ 48 px (6.67 %)**. Because the root scales uniformly, the % is invariant under upscale.*

Rationale for 36 px (not the 24 px gate, not 48): 36 px = 5 % of height sits **above** the ASA Latin minimum AND honours ASA's "CJK must be larger" rule (it is ~1.8× the 20 px Latin floor), while staying achievable for a dense count-to-10 row. 48 px (the old skills' `primary-label-min`) is retained as the **caption/primary-label** target, not the universal floor — applying 48 to every body label is what makes dense multiplicity scenes impossible. This **replaces the 24 px gate threshold** (`machine-gated-verification.md:219`) and **reconciles the 1920×1080 confusion** in `kids-eye/SKILL.md:20-31` (the % is canvas-independent; the px column is now correct for 720).

### 3.3 A spacing + type scale (warranted — §1.3 shows 23 ad-hoc font sizes)

Add ONE modular type ramp (ratio 1.25 / Major Third, base = the 36 px floor) so components stop inventing numbers (source §2D). New tokens in `theme.ts` (the natural home — it already holds `video`, `colors`, `typography`):

```ts
// src/theme.ts — ADD (all values are 1280x720 user units)
export const sizing = {
  canvasShortSide: 720,
  minFontPx: 36,        // legibility floor, load-bearing glyphs (5.0% of 720)
  captionFontPx: 48,    // caption ribbon floor (6.67%)
  safeInsetPct: 0.05,   // graphics-safe margin (EBU R95 / SMPTE 90% title-safe)
} as const;

export const typeScale = {           // Major Third (1.25), anchored at the 36px floor
  label:   36,   // floor — body labels, counts, badges
  body:    45,   // round(36*1.25)
  title:   56,   // round(45*1.25)
  display: 70,   // round(56*1.25)
  hero:    88,   // round(70*1.25)
} as const;

export const spacing = { xs: 8, sm: 16, md: 24, lg: 40, xl: 64 } as const; // 8px base, matches existing rhythm
```

`PrimitiveLabel`'s default (`shared.tsx:217`) becomes `fontSize = typeScale.label` (36, up from 24); the inline `Math.max(16, …)` floors (`counting.tsx:639,660`) become `Math.max(sizing.minFontPx, …)`. No new dependency — these are plain TS consts (the project forbids framework deps).

### 3.4 Declare-your-size mechanism (the coordination contract)

A component must **declare its intended footprint in canonical units** so the gallery and lessons can size it consistently and the floor can be checked. Add a `footprint` block to each entry in `src/capabilities/primitive-registry.json`, **hand-authored beside `intent`/`useWhen`/`avoidWhen`** and carried-forward by id exactly like those prose fields (the registry already separates code-derived fields from hand-authored prose — see the `$comment` and `manifestAuthoredSections`; `schema.ts` `capabilityBase` is `.passthrough()`, so adding a field needs **no schema edit**, per its own header "Adding a capability never requires touching this file").

```jsonc
// primitive-registry.json — per entry, NEW hand-authored block
"footprint": {
  "designW": 92,        // canonical width in 1280x720 user units (the size lessons should default to)
  "designH": 112,       // canonical height
  "minFontPx": 36,      // smallest glyph this component renders at designW (must be >= sizing.minFontPx)
  "scalable": true      // false => fixed-size chrome (e.g. a badge) the gallery must NOT stress-shrink
}
```

- **Why the registry, not a prop:** size *coordination* is a catalog-level fact ("how big is a NumberCard meant to be?") that the gallery (`demoProps`), the gap-scan, and lessons all need to agree on — exactly what the registry is for. It does not change any component's runtime API (those already take `width`/`height`/`size`).
- **Schema/types:** add `footprint` to `capabilityBase` in `src/capabilities/schema.ts` as an `.optional()` object (documents intent + lets `registry:check` warn when a `scalable` component has no footprint). This is the ONE registry field this brief adds (scope fence respected).
- **Self-completing gate (mirrors the existing `demoProps` completeness gate):** `registry:check` warns if an entry lacks `footprint` or if `footprint.minFontPx < sizing.minFontPx`. Advisory, not blocking — consistent with the project's gate philosophy.

---

## 4. Registry / schema + component-API impact

| Surface | Change | File |
| --- | --- | --- |
| Tokens | ADD `sizing`, `typeScale`, `spacing` consts | `src/theme.ts` |
| Shared label default | `PrimitiveLabel fontSize` default `24 → typeScale.label` (36) | `src/shape-primitives/shared.tsx:223` |
| Inline floors | `Math.max(16,…) → Math.max(sizing.minFontPx,…)` | `src/shape-primitives/counting.tsx:639,660` (sweep others) |
| Registry data | ADD hand-authored `footprint{designW,designH,minFontPx,scalable}` per entry | `src/capabilities/primitive-registry.json` |
| Registry schema | ADD `footprint` as `.optional()` to `capabilityBase` | `src/capabilities/schema.ts` |
| Registry gate | `registry:check` warns on missing/under-floor `footprint` | `scripts/registry/*` |
| Machine gate | legibility threshold `~24 px → 36 px` (load-bearing); cite §3.2 | `docs/proposals/machine-gated-verification.md:219` + the gate impl |
| Skill reconcile | `kids-eye`/`early-childhood-visual-taste` measurement block: canvas `1920×1080 → 1280×720`, short-side 720, px column = the §3.2 table; keep the % framing | `.agents/skills/kids-eye/SKILL.md:20-31`; `early-childhood-visual-taste/SKILL.md:37-40` |

**Component public API does NOT change** — primitives keep taking `width`/`height`/`size`. `footprint` is descriptive metadata (the *intended* default), not a new required prop. (Skill edits are structural-adjacent and need the user's approval per CLAUDE.md; the token + registry edits are normal spec edits.)

---

## 5. Gallery overlay spec — the extra-size view

### 5.1 What's there now (and why it hides size bugs)

`PreviewComposition.tsx` renders ONE view: it measures the demo's `getBBox()` and applies `scale = Math.min(1, availW/bbox.width, availH/bbox.height)` to fit it into a **760×440** preview canvas with **MARGIN 40** (`PreviewComposition.tsx:78-79,88,112-119`). Because it **fits-to-frame and never up-scales past 1**, every component is shown at a *different, frame-relative* scale — so the viewer **cannot see how big the component actually is in a real 1280×720 lesson**, and **cannot see what breaks when it's squeezed** (the stakeholder's exact fear: text that collapses when small). The fit view is good for "does it look right in isolation"; it is blind to true size and to size-stress.

### 5.2 The two added renders (hover/click overlay)

When a card is hovered (or its detail opened), render a strip of **three** panels, each its own SVG, left→right:

1. **FIT** (existing, unchanged) — the measured fit-to-760×440 view. Label: "fit".
2. **TRUE SIZE** — a panel whose SVG is `viewBox="0 0 1280 720"` rendered into a **640×360 element** (exactly ½ of 1280×720, so 1 displayed px = 2 user units; uniform, honest). Inside it draw:
   - a faint frame outline rect at the **5 % graphics-safe inset** (`x=64 y=36 w=1152 h=648` in user units — the EBU R95 / SMPTE 90 % box, §2C);
   - the component rendered at its registry `footprint.designW × designH`, centered.
   This answers "how much of a real lesson frame does this thing occupy, and does it sit inside title-safe?" Label: "true size · ½ scale".
3. **STRESS** — same `viewBox="0 0 1280 720"` at **640×360**, but the component scaled to **`footprint.designW × 0.45`** (a deliberate worst-case squeeze, mirroring the column-compress that historically broke a caption, `machine-gated-verification.md:219` context). Label: "stress · 0.45×".

### 5.3 Flagging a legibility-floor violation visually

In the **STRESS** panel only, after layout, walk the rendered `<text>`/glyph nodes' `getBBox().height` (the same `getBBox` measurement the component already trusts, and the same mechanism `measureHook` uses in the lesson gate). For each glyph whose **measured height < 36 user units** (the §3.2 floor): draw a **coral (`colors.coral`) 3 px stroke rectangle** around its bbox plus a small coral "↓<px>" tag. If any glyph fails, tint the STRESS panel's label coral and append "✗ < 36 px". A component that stays legible at 0.45× shows no coral; one whose text collapses lights up exactly where. This makes the stakeholder's failure mode — "text too small is a poor experience" — **visible at a glance in the gallery**, before it ever reaches a lesson.

- **Concrete sizes named:** FIT 760×440 (existing); TRUE-SIZE and STRESS panels each **640×360 element** rendering a `0 0 1280 720` viewBox (½ scale, uniform); safe-area rect `64,36,1152,648`; component drawn at `footprint.designW×designH` (true) and `footprint.designW×0.45` (stress); floor check at **36 user units**; flag = coral 3 px stroke.
- **Data source:** all three panels read the SAME `demoProps[id].render()` (no new data model) plus the new `footprint` from the registry. Components with `footprint.scalable === false` skip the STRESS panel (rendering it would be meaningless) and show a "fixed-size" badge instead.

---

## 6. Where I agree / disagree with the stakeholder

**The "fixed size on a known canvas + uniform proportional upscale, relative sizes never drift" belief is CORRECT — and is already the rendering architecture** (one `viewBox="0 0 1280 720"` root scaled with `width/height=100%`, `kptestFenyuheSixLessonScene.tsx:615-619`; confirmed best practice, §2A). So I do **not** refute it. Three refinements, each evidence-backed:

1. **"Fixed size" must mean fixed in CANONICAL UNITS, not device px.** The single real coordinate-space hazard found is `SceneFrame`'s title rendered as **CSS pixels** in an HTML `<div>` (`SceneFrame.tsx:67-110`) sitting beside a user-space SVG background — those two do not scale by the same factor off-native. "Fixed size" is only drift-free when everything lives inside the one viewBox. (Partial correction: the belief is right; one piece of chrome violates it.)
2. **"Nothing ends up too small" cannot be a vibe — it needs the floor + the declared footprint.** Today nothing enforces it: 23 ad-hoc font sizes, a 16 px inline floor (`counting.tsx:639`), a 24 px machine gate, and a taste skill that floors at 48 px against the WRONG (1080) canvas (`kids-eye/SKILL.md:20-31`). The coordination the stakeholder asks for **literally does not exist yet** — §3 supplies it (one floor: 36 px = 5 % of height; one ramp; one `footprint` field).
3. **One place I push back on the stakeholder's "relative sizing must NOT change":** that is the right default, but a *uniform* scale that keeps a 36 px hanzi at 36 px is fine on a 32" TV and on a 4" phone the BBC data says the SAME % "seems relatively larger" up close and smaller far away (BBC GEL, §2B). For our pipeline the output is one fixed 1280×720 master that gets upscaled, so uniform scale is correct and I am **not** proposing per-device font multipliers — but the floor is set at **5 %, above the 2.78 % bare minimum**, precisely to keep margin for the worst viewing case the stakeholder worries about. The belief holds; the floor is the insurance.

---

## Self-check (Required bar — audited)

1. **≥6 file:line citations for current state** — PASS: `theme.ts:15-21`, `theme.ts:1-32`, `kptestFenyuheSixLessonScene.tsx:615-619`, `kptestFenyuheSix/layout.ts:18-19`, `SceneFrame.tsx:43-49`/`:67-110`, `shared.tsx:217-244`, `counting.tsx:639,660`/`:471`, `kids-eye/SKILL.md:20-31`, `machine-gated-verification.md:219` (≫6).
2. **≥4 external sources w/ URLs** — PASS: BBC subtitles, BBC GEL, BBC EBU-TT-D thread, ASA/BCAP, EBU R95, ITU-R BT.1848, ATSC A/343, MDN×2, Soueidan, CSS-Tricks, Lucky Graphics, Material 3, Penpot (14 URLs).
3. **Floor = single number in canvas units AND % height** — PASS: **36 px in 1280×720 units = 5.0 % of 720 frame height** (captions 48 px / 6.67 %).
4. **"Declare your size" concrete enough to code** — PASS: `footprint{designW,designH,minFontPx,scalable}` in `primitive-registry.json`, `.optional()` on `capabilityBase` in `schema.ts`, gated by `registry:check`.
5. **Overlay names exact pixel sizes** — PASS: FIT 760×440; TRUE-SIZE + STRESS each 640×360 rendering `0 0 1280 720`; safe rect `64,36,1152,648`; stress `designW×0.45`; floor check 36 user units; coral 3 px flag.
6. **Explicit verdict on the belief** — PASS: §0 + §6 — **correct (and already the architecture)**, with three evidence-backed refinements, not a refutation.

---

## Progress

### 2026-06-14 — proof-batch scaffold landed (uncommitted, pending human review)
- **§3 proposed standard → `src/theme.ts` `sizing`** — added `sizing{minFontPx:36, captionFontPx:48, safeInsetPct:0.05, safeArea, typeScale(1.25), spacing(8px)}`. Single source of truth for the floor + safe area + ramps. No new dependency.
- **§3 legibility floor (36px = 5% frame height) → `.agents/skills/kids-eye/SKILL.md`** — fixed the wrong-canvas bug (1920×1080 → 1280×720) and re-derived the %-minimums (teaching-unit-min 86→58, target 130–160→86–108, gap 65→43); tied the text floor to `theme.sizing`. caption-min reconciled 56→48 (the brief's number) — **flagged for the human** to confirm.
- **§3 declare-your-size → `footprint` registry field** — `footprint{designW,designH,minFontPx,scalable}` added to `src/capabilities/schema.ts` (optional, `.passthrough()`, carried-forward by `build-registry.mjs`). Authored for the 20 live counting primitives (proof); the 5 sub-floor cases (`unit-block` 16px, `number-line-track` 18px, `part-whole-brace` 22px, `region-split` 27px, `count-step-indicator` 34.7px) carry `minFontPx:36` + a `_note` with the size that clears it.
- **§5 gallery size-view → `PreviewComposition.tsx` + `scripts/gallery/render-previews.mjs` + `gallery/index.html`** — `mode: fit|truesize|stress`; truesize seats the component at its footprint inside the real 1280×720 viewBox with the 5% safe rect; stress squeezes to 45% and flags any glyph < 36 units. Surfaced in a big click-to-open lightbox (the overlay now maps to the in-video size).
- **NOT bridged yet:** component-level font bumps (`PrimitiveLabel` 24→36, inline `Math.max(16→36)`) — deferred per the brief's "measure-then-fix"; the STRESS view + the 5 flagged footprints ARE the measurement. Bump in a follow-up.
