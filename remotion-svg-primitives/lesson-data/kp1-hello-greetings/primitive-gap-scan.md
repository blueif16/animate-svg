# kp1-hello-greetings — Primitive Gap-Scan (Wave 3b)

Reuse/gap table for every visual demand the Visual Contract makes. The DEFAULT
answer is COMPOSE EXISTING. A gap is real ONLY if nothing in
`src/capabilities/catalog-digest.md` covers it.

**Outcome: ZERO new hand-coded primitives. ONE new generated ASSET (`girl-face`)**
— because the lesson needs TWO identity-invariant kids and only ONE kid face
(`boy-face`) existed.

> NOTE — this file supersedes an earlier scaffolded draft that (a) treated the
> topic-intro card as a primitive to BUILD and (b) marked the second kid face
> BLOCKED on `GOOGLE_API_KEY`. Both premises are now false: `LessonIntroCard`
> already ships in the registry (REUSE), and the key IS available
> (`Omniscience/.env`), so `girl-face` was generated this wave.

---

## Reuse / Gap table — every visual demand in the Visual Contract

| # | Visual demand (cue) | Catalog entry | Verdict |
|---|---|---|---|
| 1 | Topic-intro title + Unit-1 "Hello!" section teaser resolving in (`intro`, zone-title). visual-design calls this "GAP-1" | `lesson-intro-card` (`LessonIntroCard`) — "drives a Math title, a Chinese title, an **English greetings** title"; `title`/`section`/`teaser` caller nodes + `progress` | **REUSE** (NOT a gap) |
| 2 | Turn-taking spoken exchange: wave + speech bubble pops on the wave, tail at speaker, bubbles accumulate then demote (`meet-hello`, `intro-self`, `part-goodbye`) | `dialogue-exchange` (`DialogueExchange`) — prose LITERALLY names Hello!/Hi!/I'm Sam./Goodbye!/Bye-Bye! + `gesture:'wave'` + `emphasis` | **REUSE** |
| 3 | Read-along sweep over the spoken English phrase, item-by-item, active swells (`meet-hello`, `intro-self`, `part-goodbye`, `recap`) | `read-along-highlight` (`ReadAlongHighlight`) — `lines[][]` + weighted `beats[]` + `activeScale` + `cursor` | **REUSE** |
| 4 | "I'm" held as ONE swelling unit, biggest+slowest mark of the lesson (`intro-self`) | `read-along-highlight` `beats[]` (one weighted-long entry) + `dialogue-exchange` `emphasis:true` | **REUSE** |
| 5 | ONE coral attention pulse on "I'm" + ONE closing recap punctuation pulse (`intro-self`, `recap`) | `pulse-circle` (`PulseCircle`); `DialogueExchange` already fires #1 via `emphasis:true` | **REUSE** |
| 6 | Bubble entrance physics (pops in on the wave, three-stop bell) | `popin-motion-variants` (`<PopIn motion="bouncy">`) — composed INSIDE `DialogueExchange` | **REUSE** |
| 7 | "Sam" name-card under the right kid, ONCE (`intro-self`, zone-kid-right) | `DialogueExchange` `right.nameCard` slot takes any caller node (a `<text>`); no new primitive | **REUSE** |
| 8 | Moving-hold breathing on each cue's load-bearing group during static stretches | `breathe` (`<Breathe phaseSeed=…>`) | **REUSE** |
| 9 | Optional FocusPointer toward the speaking kid (only if wave+bubble don't already say "this one's talking") | `signal-focus-pointer` (`<FocusPointer>`) — composer-owned, likely UNUSED here (the stills show wave+bubble already make the speaker obvious) | **REUSE (if needed)** |
| 10 | Chinese narration caption ribbon (zone-caption) | scene chrome, not a registered primitive (a `<rect>` + `<text>`, same as every lesson) | **N/A — scene chrome** |
| 11 | Cream background surface | scene chrome | **N/A — scene chrome** |
| 12 | The TWO identity-invariant KID FIGURES (visual-design "GAP-2") — must read as TWO distinct PEOPLE, reused intro→recap | `icon-asset`: `boy-face` exists; the OTHER `character-face` assets are robot/cloud — **no second KID** | **GAP → BUILT (asset `girl-face`)** |

**Score:** 11 REUSE/chrome, 1 BUILD (the `girl-face` asset). The two teaching
motion components (`DialogueExchange` + `ReadAlongHighlight`) + the normalized
`LessonIntroCard` already cover the entire spoken-routine spine + the mandated
intro card with zero baked copy — exactly as the storyboard predicted.

---

## The one gap, BUILT — `girl-face` (generated decorative SVG asset)

**Why a gap.** `DialogueExchange.left/right.figure` takes a caller ReactNode face.
The lesson's central metaphor is TWO kids carrying all three phrases — they must
read as two DIFFERENT people, persisting intro→recap (and reused by later Unit-1
lessons). The asset catalog `character-face` category had exactly one kid face,
`boy-face`; the rest are `robot-face-round`/`robot-face-square`/`sad-cloud-face`
(not children). A second, visually-distinct kid is the missing cast member.

**Why a generated ASSET, not a hand-coded primitive.** A kid face is fixed-form
(no count/progress/state prop), decorative (the child does NOT reason about the
face as a teaching unit — the spoken routine is the teaching unit; same fence as
the 3D-decorative rule), and recognizability at render size is the whole point.
All three generation fences hold (CLAUDE.md "Generated decorative SVG assets") →
generate, do not hand-code a one-off SVG in the scene.

**How built.** `gen_asset_svg.py` (Gemini image → background color-key → trace →
flat on-palette SVG, palette = `theme.ts`). Generated TWICE:
1. First pass ("warm orange shirt") posterized the **skin to `--icon-coral`** AND
   the shirt to coral — which would COLLIDE with this lesson's reserved coral
   emphasis channel (the I'm pulse) and made skin == shirt. **Rejected.**
2. Regenerated with "light peach skin tone + sky-blue shirt + brown pigtails" →
   traced to `--icon-skin` / `--icon-blue` / `--icon-yellow` / `--icon-slate` /
   `--icon-stroke`. **No coral.** Distinct from `boy-face` (peach skin + green
   shirt + short hair). The two read as a girl and a boy.

**Registered.** `public/icons/girl-face.svg` (+ `mono/girl-face.svg` +
`girl-face.meta.json` provenance) · `npm run icons:build` → 90 assets in
`iconAssetData.ts` · `registry:build` + `registry:check` GREEN. Assets are
catalogued in the digest's asset-library section (character-face); they carry no
`primitive-registry.json` prose entry and no `demoProps.tsx` gallery entry — the
gallery gate covers registered COMPONENTS; assets are the AssetGallery's
catalog-driven surface (`check-gallery` stays green).

---

## Topic-intro card — REUSE, no new layout designed

The normalized intro primitive `LessonIntroCard` FITS this subject unchanged — it
is built to drive an English-greetings title (title/section/teaser as caller
nodes, a write-on underline, card surface default-OFF so the cream canvas stays
the only background per the decoration budget). No new intro layout was needed.
The composer passes: `title` = the lesson title, `section` = "Unit 1 · Hello!",
`teaser` = the KP one-liner; `progress` derived from `cues.intro.startFrame+off`;
then the two kid faces (`girl-face` left, `boy-face` right) settle beneath it as
the cast.

---

## Test stills — verified at REAL render size (`out/kp1-hello-greetings/primitive-checks/`)

The lesson ships no new primitive, so these two stills verify the NEW ASSET
(`girl-face`) alongside the reused components in the lesson's two hardest frames,
at the repo's real composition resolution (1280×720, theme `video`):

- **`Hardest.png`** — the `intro-self` beat: girl (left) + boy (right, "Sam" name
  card) + boy's "Hi! I'm Sam." active bubble (the "Hello!" bubble demoted/dimmed)
  + the coral emphasis ring (the ONLY coral mark on screen — confirms no skin
  collision) + the read-along row swelling **"I'm"** in reward-orange with the
  glow ring + underline cursor. The densest, most accent-loaded frame. **PASS.**
- **`Multiplicity.png`** — the `part-goodbye` beat: BOTH kids present + both
  farewell bubbles up at once (Goodbye dimmed / Bye-Bye active — the
  max-2-bubbles density) + the boy's coral wave gesture + the read-along sweeping
  Goodbye!→Bye-Bye!. The two DISTINCT faces hold identity side-by-side; nothing
  crowds. **PASS.**

kids-eye minimums clear: each face reads as a PERSON (≥ ~130px at this size); the
two faces read as two different kids; the swept phrase words are well over the
86px floor; the "I'm" segment is the largest mark at its beat.

---

## §5 self-check (kids-eye §5)

1. **§1 measurement block met.** Stills rendered at 1280×720 (real size): faces
   read as people, the two kids are distinguishable, the read-along words and the
   swelled "I'm" clear the legibility floor.
2. **Zones respected.** The asset is a cast member placed by `DialogueExchange` in
   zone-kid-left/right; it renders nothing in zone-title/caption/readalong.
3. **One-signal.** The second face carries "this is the OTHER kid" — a signal no
   other element carries. No within-asset duplication; no chrome.
4. **Finger-cover.** Cover the two faces → "two kids meeting" collapses to
   disembodied bubbles (so the faces are load-bearing cast, not decoration). The
   two distinct faces are what make greeting→self-intro→farewell read as ONE
   encounter between the SAME two people.
5. **Identity preserved.** The whole point of GAP-2 is identity invariance — each
   speaker is the SAME `IconAsset` (girl / boy) every cue intro→recap; no recolor,
   no swap. The asset is fixed-form, so identity cannot drift.

---

## Pipeline findings (W3b backlog)

- **visual-design assumes 1920×1080 but the repo composition is fixed at
  1280×720** (`src/theme.ts` `video`; every Complete lesson + `compositionDefaults`
  use it; no lesson renders at 1920). The kids-eye minimums are %-of-short-side so
  they translate, but the W2a §1 measurement block should state the ACTUAL render
  size (or `video` should be bumped if 1920 is intended). The composer must build
  at 1280×720.
- **`ReadAlongHighlight` items must be full `<text fill="currentColor">` nodes,
  not bare `<tspan>`.** The component's JSDoc example shows `<tspan fill=
  "currentColor">`, which renders INVISIBLE — a `<tspan>` is not a valid direct
  child of the `<g>` the component wraps each item in (caught here: the first
  still showed the glow ring + underline but no glyph text). Fix the prose +
  JSDoc to say "a `<text>` node". The composer must pass `<text>` items.
- **No npm script wires `scripts/lesson-primitive-checks.mjs`.** It must be run as
  `node scripts/lesson-primitive-checks.mjs --config <path>` (there is a
  `lesson:check` script but not `lesson:primitive-checks`). Add a
  `lesson:primitive-checks` package.json script so the wave doesn't guess.
- **The scaffolded `primitive-gap-scan.md` carried stale assumptions** (intro-card
  as a gap; `GOOGLE_API_KEY` unset). A scaffold should seed an EMPTY table, not
  pre-filled verdicts, so a wave doesn't have to detect-and-reverse prior guesses.
- **`character-face` asset coverage is still thin** (now 2 kid faces: boy + girl).
  Per MEMORY ("build library in one burst"), a single generation burst could add a
  small cast set (more kids, varied skin/hair) now that the key is wired, so future
  multi-character lessons (你/我/他, dialogues) are not one asset short each time.
