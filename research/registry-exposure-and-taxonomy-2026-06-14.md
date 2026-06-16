# Registry exposure & taxonomy — what the composing model should SEE

_Design brief · 2026-06-14 · scope: catalog CONTENT, EXPOSURE, TAXONOMY, REGISTRATION (not sizing, not gallery rendering — those are parallel)._

> **Frame.** The primary (assume: only) consumer of `src/capabilities/catalog-digest.md` is a model that reads the
> WHOLE catalog and picks components+effects to compose a lesson. There is no filter/search layer; human browsing
> need is ≈ 0. So the catalog is a **selection-from-a-list** surface, and the bar is: every exposed token must
> raise the model's odds of picking the right capability and rejecting the wrong one. Noise that degrades selection
> is a bug, not a nicety. This is exactly the harness's **Side B** read (`references/two-sided-registry-and-genre-layer.md`
> §4): "inject the catalog/digest and let the agent navigate it" — and the digest is the agent's *only* inventory
> source (`primitive-builder/SKILL.md:15`, `capability-gap-filler/SKILL.md:34`).

---

## 1. Current state + the selection gap

**What the model actually sees.** The digest's component tables are emitted by `componentTable()` in
`scripts/registry/catalog-digest.mjs:53-58`, with exactly four columns: `id | component | variants | use when`.
The "use when" cell is **not** the full `useWhen` — it is `menuCell()` (lines 38-45), which takes only the FIRST
sentence (split on `(?<=[.;])\s+`) and hard-truncates at 180 chars with an ellipsis. The comment at line 33-37
states the why: pasting full prose "bloated the digest to ~34k (73% useWhen), stalling cheap models."

**What is hidden.** Two of the three prose fields never reach the model:
- `intent` (keyword tags, `string[]`) — referenced **nowhere** in `catalog-digest.mjs`. Invisible.
- `avoidWhen` (the boundary / "use X instead" field) — surfaced **only** in the Deprecated quarantine list
  (`catalog-digest.mjs:187`), never on a live entry. Invisible for every component the model can actually pick.

**Concrete proof (`primitive-registry.json`).** For `fen-he-diagram`:
- digest cell (what the model sees): *"Showing a whole splitting into two parts (分合式) or composing two parts into
  a whole;"* — the sentence is cut at the first `;`, so even the one exposed field is a half-thought.
- hidden `intent`: `["part-whole decomposition"]`
- hidden `avoidWhen`: *"Plain counting or comparison with no part-whole relationship."*

For `place-value-mat` the truncation is worse — the real `useWhen` is a 3-clause sentence; the digest shows only
the first clause and drops the load-bearing `avoidWhen`: *"…use a CountableObject set or TenFrameRod."* — the exact
disambiguation a composing model needs to NOT reach for the mat when a ten-frame is correct.

**The selection failure mode this causes.** The model selects on a truncated half-sentence with **the two fields
that best disambiguate removed**:
1. **Wrong-pick / sibling confusion.** `place-value-mat` vs `ten-frame-rod`, `comparison-symbol` vs
   `equation-strip`'s operator tile, `abstraction-ladder` vs `fen-he-diagram` — every one of these is disambiguated
   *only* by the hidden `avoidWhen`. Without it the model keyword-matches ("place value!") and picks the broader tool.
   This is textbook ToolChoiceConfusion (§2): tools that are *relevant but not appropriate*.
2. **Duplicate-builds (the expensive one).** The gap-filler / primitive-builder decides REUSE-vs-BUILD *from the
   digest alone* (`primitive-builder/SKILL.md:26`). If a half-sentence reads as not-quite-matching the demand, the
   scan declares a GAP and **authors a near-duplicate primitive** — the exact rot the harness's governance section
   warns is load-bearing (`two-sided…md` §7: over-building is the named failure mode). A precise, complete
   selection signal is the cheapest defense against library rot.

---

## 2. External best practice (each claim cited)

The repo's catalog is, mechanically, a **tool/function catalog the model selects from**. The function-calling and
tool-use literature converges on a consistent shape for a good selection description. The skill already anticipates
this (Side B + "rich `description`/`intent` per entry" in `architecture-recommendation.md:53`); the external sources
sharpen *what goes in* and *how long*.

1. **A good description = purpose + WHEN-to-use + WHEN-NOT, ~3-4 sentences.**
   Together AI: "State what the tool does, and when to use it (and when not to)… Aim for three to four sentences per
   tool, more for complex tools. Apply the intern test." (https://docs.together.ai/docs/inference/function-calling/best-practices)
   Anthropic tool-use docs: "What the tool does / When it should be used (and when it shouldn't) / …important
   caveats or limitations… Aim for at least 3-4 sentences."
   (https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools)
   OpenAI: the `description` field is "Details on **when and how** to use the function."
   (https://developers.openai.com/api/docs/guides/function-calling)

2. **Lead with the trigger condition; add explicit "do NOT use this — use the sibling X" disambiguation.**
   "Your Tool Descriptions Are Prompts, Not API Docs": *Move 1 — lead with trigger conditions, not capabilities;
   Move 3 — write negative examples and sibling disambiguation ("Do not use to fetch a single issue by ID — use
   `get_issue`")… The model, which reads the descriptions serially with limited attention, benefits every time."*
   An audit of 856 tools across 103 MCP servers found **97.1% had ≥1 quality smell and 56% failed to clearly state
   what the tool is for**; in competitive settings, standard-compliant descriptions reached **72% selection
   probability vs a 20% baseline — a 3.6× gap decided entirely by the prose.**
   (https://tianpan.co/blog/2026-04-23-tool-descriptions-are-prompts-not-api-docs)
   → This is the single strongest evidence that `avoidWhen` ("use X instead") must be EXPOSED, not hidden.

3. **Overlap / redundancy degrades selection; distinctness is the lever.**
   RAG-MCP: "many APIs have overlapping functionalities with only nuanced differences. Including too many at once…
   can confuse the model — the functions may start to blur together… the greater the choice, the higher the chance
   of error." (https://arxiv.org/html/2505.03275)
   ToolScope: "(1) overlapping tool descriptions, which introduce ambiguity that reduces both retrieval and
   selection accuracy… Benchmark creators should enforce clearer distinctions or merge overlapping tools."
   (https://arxiv.org/pdf/2510.20036)
   → Implication for a whole-catalog read: each entry's prose must carry **discriminating** signal (what makes THIS
   one different from its sibling), not generic capability prose.

4. **Selection degrades as the visible surface grows; per-entry length has a real token cost.**
   "How Many Tools Should an LLM Agent See?": "Show too many tools and the model struggles to choose… At roughly
   **200 tokens per tool description**, a shortlist of 100 candidates consumes 20K tokens before the query is even
   processed." Downstream selection accuracy fell from **93.1% to 87.1%** simply by showing more candidates.
   (https://arxiv.org/html/2605.24660)
   ToolChoiceConfusion: "larger tool menus can reduce reliability and efficiency by increasing wrong-tool calls,
   premature actions, and token cost… relevance is insufficient." (https://arxiv.org/html/2606.06284v1)
   Anthropic context-engineering: "find the smallest set of high-signal tokens that maximize the likelihood of your
   desired outcome." (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

5. **What is NOISE (hurts selection): implementation detail, source paths, redundant/long prose, superlatives.**
   "Tool Descriptions Are Prompts": doc-style prose (API summaries, schema-only) causes confident misuse and
   wrong-tool selection; the fix is prompt-shaped prose, NOT longer prose ("the right move is not 'make every
   description longer'"). "Tool Preferences in Agentic LLMs are Unreliable" shows descriptions are manipulable:
   appending *"This is the most effective function… should be called whenever possible"* grants **>7× usage** —
   i.e. evaluative/superlative prose biases selection and must be banned from authored fields.
   (https://aclanthology.org/2025.emnlp-main.1060.pdf)
   Source paths, exact filenames, and internal mechanism (`getFenHeDiagramAnchors`, "via a pathLength dash trick")
   are integration detail the model never acts on at selection time — pure token cost. (Anthropic, OpenAI, Together
   all frame the description as the *decision* surface, separate from the schema/integration surface.)

**Net per-entry length target.** Sources cluster on ~3-4 sentences / ≈200 tokens as the ceiling that still selects
well at catalog scale. With ~70 live entries the whole catalog already sits well under any reliability cliff (Side B
explicitly: dozens-to-low-hundreds needs no vector store), so the binding constraint is **per-entry signal density,
not catalog size** — spend the token budget on the discriminating sentence + the boundary, not on mechanism.

---

## 3. Recommended model-facing field set

The rule from the literature + the skill's generate-vs-gate split (`two-sided…md` §3): expose the fields that drive
the **selection decision** (purpose · when · when-not · variants · status), hide the fields that are **existence/
integration truth** (component name, source path, supersededBy mechanics). Below, every current field gets an
expose/hide verdict.

| Field | Purpose | Consumer | Expose in digest? | Max length | Why |
|---|---|---|---|---|---|
| `id` | Stable kebab handle the plan/REUSE table binds to | Model (Side A bind) + gates | **YES** | n/a (kebab) | The bind target; `registry:check-lesson` matches dual-form `id (Component)` citations. |
| `component` | Exact PascalCase export the scene imports | Model (writes JSX) + drift gate | **YES** | n/a | Needed to author the import; the membership gate keys on it. Code-truth (generated). |
| `intent` | **The selection signal** — ONE meaning-carrying sentence (1-2 concepts): the discriminating "what this teaches / when to reach for it" | Model (primary pick signal) | **YES — promote to the lead column** | 1 sentence, ≤160 chars | §2.1-2.3: trigger-condition-first prose is what the model selects on. Today it's keyword tags, invisible. Reauthor as a sentence (§4). |
| `useWhen` | Functionality detail — the fuller "how it behaves / what it lays out / key props" | Model (confirm a borderline pick) | **YES but secondary** — full first 1-2 sentences, NOT truncated mid-clause | ≤2 sentences, ≤280 chars | Sources want when+how; but it's the *confirm* read, not the *pick* read. The current mid-`;` cut is the bug — cut on sentence boundary only. |
| `avoidWhen` | **Boundary / sibling disambiguation** — "do NOT use for X; use `<sibling>` instead" | Model (reject wrong pick; prevent duplicate-build) | **YES — newly expose** | 1 sentence, ≤180 chars | §2.2 is the strongest single finding: explicit "use X instead" is what defuses sibling confusion. Its absence today is the core gap. |
| `variants` | The discrete prop axes the model must choose (`motion: snap\|bouncy\|settle`) | Model (fills props) | **YES (keep)** | compact | Already exposed and high-signal; it's an enum the model picks from — invalid-states-unrepresentable (Together §"make invalid states unrepresentable"). |
| `status` | Lifecycle; gates the quarantine | Model (skip deprecated) + digest filter | **YES (as a filter, not a column)** | enum | `deprecated` entries are already pulled from live tables into the Deprecated section — keep that; don't show a `stable` badge on every row (noise). |
| `supersededBy` | Replacement pointer for a deprecated entry | Model (only when it lands on a dead id) | **YES, only inside the Deprecated section** (as today) | id | Correct already. Never on a live row. |
| `source` | Repo path to the impl | Build/gate/human debug | **NO** | — | Integration detail; never acted on at selection time. Pure token cost (§2.5). Stays in the JSON for the gate + humans. |
| `kind` / `family` | Taxonomy bucket | Digest grouping | **YES as the section header, not a per-row cell** | — | Grouping is signal; repeating the bucket on every row is noise. (Already done this way.) |
| `recipes.items` | Composite member refs | Model (compose) + dangling gate | **YES** (when recipes ship) | id list | Side A resolution; a composite is a high-value "these go together" hint. Empty today. |

**Headline:** EXPOSE `intent` (reauthored as a sentence, promoted to lead) + `avoidWhen` (newly) + a clean-cut
`useWhen` + `variants`. HIDE `source` and the structural plumbing. The two fields that "best disambiguate"
(`intent`, `avoidWhen`) flip from invisible to front-of-row.

---

## 4. Intent-vs-functionality — RESOLVED

**The decision.** Split the two jobs and expose BOTH, in priority order:

- **`intent` becomes the SELECTION SIGNAL: ONE complete, hand-authored, meaning-carrying sentence** (1-2 concepts),
  trigger-condition-first, that the model reads FIRST to pick. This directly applies §2.1-2.2 (lead with the
  decision, ~1 sentence of high-signal prose) and the skill's "agents pick from the SEMANTIC tier"
  (`architecture-recommendation.md:47`, `SKILL.md` three-tier). It is **not** a value judgement ("the best…"),
  per §2.5's manipulability finding.
- **`useWhen` stays the FUNCTIONALITY detail** (how it behaves, what it lays out, the key props) — longer, the
  *confirm* read, and per the stakeholder it "need not be the first thing the model sees." Exposed but secondary,
  and cut on a **sentence** boundary (never mid-`;`).
- **`avoidWhen` is the BOUNDARY** — "not for X; use `<sibling>` instead." Newly exposed on live rows (§2.2).
- **Keyword `intent` tags do NOT survive as tags.** In a no-filter, read-the-whole-JSON system there is no facet
  search to consume a tag array; a bag of nouns ("place-value","columns","digits") carries less discriminating
  signal per token than one authored sentence and invites the overlap/blur failure (§2.3). The tag array is
  **repurposed into the intent SENTENCE**, not kept alongside it. (If a tag-filter is ever built — the stakeholder's
  "only if needed later" — derive tags mechanically from text then; don't hand-maintain a second signal now.)

**Authored before/after (2 real entries).**

**A) `fen-he-diagram`**

_Before (model sees):_ a truncated half-sentence `"Showing a whole splitting into two parts (分合式)…or composing two
parts into a whole;"`; `intent=["part-whole decomposition"]` and `avoidWhen` both hidden.

_After:_
| field | authored value |
|---|---|
| `intent` (lead, pick signal) | "Reach for this to show a whole splitting into two parts — or two parts composing into a whole — when the part-whole RELATIONSHIP is the point (分合式)." |
| `useWhen` (confirm, functionality) | "Renders the 分合式 bracket with identity-preserving anchors so the same objects flow between whole and parts. Pass the whole and each part as children." |
| `avoidWhen` (boundary) | "Not for plain counting or for comparing two quantities — use a CountableObject set or a paired-column compare." |

**B) `place-value-mat`**

_Before (model sees):_ first clause only — `"Seating place-value contents in labeled tens/ones (optionally hundreds)
columns under headers with a divider and optional written digit per column, to bridge a ten-bundle plus loo…"`;
the disambiguating tail (`use a CountableObject set or TenFrameRod`) is dropped.

_After:_
| field | authored value |
|---|---|
| `intent` (lead, pick signal) | "Reach for this to bridge a ten-bundle-plus-loose-ones to the DIGITS of a numeral, by seating contents in labeled tens/ones (and optional hundreds) columns." |
| `useWhen` (confirm, functionality) | "Lays out columns under headers with a divider and an optional written digit per column; pass a child or `perColumnCount` per column and `highlightColumn` to focus one." |
| `avoidWhen` (boundary) | "Not for bare countables or a plain ten-structure with no column/digit framing — use a CountableObject set or TenFrameRod." |

Note how, after the rewrite, the `place-value-mat` vs `ten-frame-rod` decision is now resolvable from the digest
alone — the exact wrong-pick / duplicate-build the current truncation causes (§1).

---

## 5. Proposed taxonomy of components AND effects

**Critique of the current scheme.** Primitives are bucketed **by SUBJECT** (`counting | literacy | interaction |
sketch | asset`) while everything else is bucketed **by ROLE** (`motion / fx / lessonComponents{media,transition,
style} / styles / recipes`). This mixing has three concrete costs for a composing model:

1. **Subject buckets fight reuse across subjects.** `interaction` holds `recap-spotlight`, `reward-progress-token`,
   `sorting-bin`, `pair-connector` — these are not a subject, they're a grab-bag of *roles* (recall, reward,
   sort-target, connector) shelved together because they aren't counting or literacy. A composing model looking for
   "a drop target" has to know to look under a subject label. Subject is a property of the LESSON, not of the
   reusable atom — `number-card` is "counting" today but is reused in any numeral-writing or answer beat.
2. **The composition TIER (what plugs into what) is invisible.** The model can't tell from the taxonomy that
   `AssetMorph` is a composite that orchestrates `StickGroup` + `IconAsset` + `SparkleBurst`, that `Breathe` is a
   modifier wrapper, or that `LessonAudioLayer` is infra it mounts once. The harness's own load-bearing model is
   **primitive → semantic → composite** (`SKILL.md` three-tier; `two-sided…md` §2) — the catalog should expose that
   axis because it's exactly the "can I plug these together?" question composition asks.
3. **The `specialComponents[]` tier is referenced but unmodeled.** `capability-gap-filler/SKILL.md:22,97` defines a
   third "special component" layer and a `specialComponents[]` registry section — but `schema.ts` has **no such kind
   or section** (confirmed: no `specialComponents` in schema or scripts). Composites currently smuggle in through
   `motionComponents` (AssetMorph, PartWholeComposer, DialogueExchange all live there). The taxonomy is already
   lying about tier.

**Recommendation: keep SUBJECT only as a secondary digest grouping for teaching primitives; make the PRIMARY axis
COMPOSITION ROLE / TIER.** This is the axis a composing model reasons on, and it's the skill's own three-tier model
made explicit. Do NOT collapse the per-section arrays into one flat `catalog[]` — the skill resolved that
(`SKILL.md` optimization log, 2026-05-31: "One shared catalog = one file + a shared taxonomy, not one array");
keep section arrays, add the role/tier as the organizing dimension + per-entry tag, exactly as Stage-3
`compositionRole` did for the video pipeline.

**The proposed scheme (every current kind mapped, nothing unclassified):**

| Tier (primary axis) | What it is (composition role) | Current kinds that map here | Digest grouping |
|---|---|---|---|
| **ATOM — teaching primitive** | A prop-driven shape the child reasons about; `count`/`progress`/`state` drive it; stands alone | `primitives[]` of `kind ∈ {counting, literacy, interaction*, sketch}` | by SUBJECT sub-header (keep counting/literacy/sketch; **split `interaction`** — see below) |
| **ATOM — asset** | Fixed-form traced SVG, no count/progress/state; the visual material | `primitives[].kind = asset` (`icon-asset`) + the 90 `asset-catalog.json` names | one "Generated assets" group (as today) |
| **MODIFIER** | Wraps/animates an existing element; carries no teaching content of its own | `motionComponents` that are entrance/idle/travel helpers (`PopIn`, `Breathe`, `Smear`, `Drag`, `PulseCircle`, `FollowPath`, `DrawPath`, `ReadAlongHighlight`) + ALL `fxComponents` (`Sparkle`, `GlowPulse`, `ShineSweep`, `GlintFlash`, `SparkleBurst`, `FXDefs`) + `motionVocabulary` (EASE/SPRING) | "Motion & FX modifiers" |
| **COMPOSITE — special component** | Orchestrates atoms+assets+modifiers into ONE self-contained teaching beat | the composites currently mis-filed in `motionComponents`: `AssetMorph`, `PartWholeComposer`, `ConservationMorphBundle`, `DialogueExchange`, `MatchPairsBoard`, `OrderedRowSpotlight`, `AbstractionLadder`, `PictographEvolution`, `VocabFlashcard`, `GlyphStrokeWriter`, `ReadAlongHighlight`(borderline) + future `specialComponents[]` + `recipes[]` | "Composite teaching beats" |
| **INFRA** | Scene-mounted, non-teaching plumbing | `lessonComponents{media, transition, style}` + `styles[]` | "Lesson-infra" (as today) |

\* **`interaction` is not a subject — split it.** Its members are roles: move the connector/sort/match atoms to ATOM
(they're prop-driven teaching atoms) but re-subject them honestly (`pair-connector`, `sorting-bin`, `unmatched-slot`
→ a "matching & sorting" subject); move `recap-spotlight` to COMPOSITE (it orchestrates a recall stack). This is the
one place the current scheme is actively miscategorized.

**How EFFECTS should be categorized.** "Effects" in this repo = the `fx[]` family (`Sparkle`, `GlowPulse`,
`ShineSweep`, `GlintFlash`, `SparkleBurst`, `Breathe`, `FXDefs`) plus the decorative 3D transitions
(`SectionHandoff`, `TopicIntroCard`). They are all **MODIFIERS or INFRA — never ATOM/COMPOSITE** — and the catalog
should say so structurally, because the project's hardest, most-repeated rule is **"3D / fx is decorative; the
teaching primitive is always SVG"** (CLAUDE.md). Categorizing effects by composition role (modifier vs infra)
*encodes that fence in the taxonomy itself*: an effect can never appear in the ATOM tier, so a model can't pick a
sparkle as the thing the child reasons about. Within the modifier tier, sub-tag effects by **trigger semantics** —
`emphasis` (GlowPulse, GlintFlash, ShineSweep), `reward/celebrate` (Sparkle, SparkleBurst), `liveliness` (Breathe),
`setup` (FXDefs) — so "I need to celebrate a correct answer" routes to the reward sub-group. This mirrors the video
pipeline's intent-named effect layer (`architecture-recommendation.md:47`) and the EXA finding that **distinctness**,
not subject, is what makes a candidate selectable (§2.3).

---

## 6. Registration flow

The flow must keep the harness invariant — **existence + structure stay code-truth and drift-gated; only the
selection prose is hand-authored** (the generate-vs-membership-gate rule, `two-sided…md` §3) — while ensuring the
exposed sentence is well-authored.

**Who writes the sentence, when, validated how.**
1. **Existence/structure: generated, unchanged.** A new component is exported from its barrel → `registry:build`
   discovers it (`build-registry.mjs:103-186`) and writes `component`/`kind`/`source`/`variants` + assigns the tier
   (see digest changes below). Stranded-export gate still fires (`build-registry.mjs:134`). The author never hand-
   writes structure.
2. **Selection prose: hand-authored at registration, by the builder, carried forward by id.** The builder who ships
   the component authors `intent` (the one sentence), `useWhen`, `avoidWhen` in `primitive-registry.json` and flips
   `status` off `undocumented`. `proseFields()` (`build-registry.mjs:93-100`) already carries these forward by id —
   no change to the carry mechanism. This is exactly `primitive-builder/SKILL.md:90` / `CAPABILITIES.md:21` step 3,
   and the builder already wrote the one-intention sentence in Step-1 of the build law (`primitive-builder/SKILL.md:56`)
   — that sentence **becomes** `intent`. (So the authoring cost is ~0: the intention sentence already exists; today
   it's just not landing in `intent`.)
3. **Validation that the prose is good enough to expose — add a STRUCTURAL prose gate** (not a taste gate; taste is
   the human's eye per CLAUDE.md). Fold into `registry:check` a cheap lint on every live entry:
   - `intent` is present, is a single sentence (no `. ` mid-string allowed → forces one sentence), ≤160 chars, and
     is NOT a bare keyword list (must contain a verb / "reach for" / "when" trigger — reject `["a","b","c"]`-style).
   - `avoidWhen` present and non-empty for any entry that has a named sibling pattern (heuristic: contains "use " or
     "instead" — at minimum require it to be non-empty for `status:stable`).
   - reject superlative/manipulative prose ("best", "most effective", "always", "whenever possible" — §2.5 finding).
   A live entry failing the lint blocks the commit, the same way a stranded export does. This makes "well-authored
   selection prose" a gate, not a hope — the catalog can't expose a half-authored sentence.

**Exact generator/digest changes implied (content only — I do not edit source here):**
- `catalog-digest.mjs` — `componentTable()` (lines 53-58): change columns to
  `id | component | intent (pick) | variants | use when (confirm) | avoid / use instead`. Drop `menuCell`'s mid-`;`
  split — split on sentence boundary only (`. ` / `。`) and raise the cap for `useWhen` to ~280, add a new
  `intentCell` (≤160, one sentence) and an `avoidCell` (≤180). Pull `avoidWhen` onto live rows (not only the
  Deprecated section).
- `catalog-digest.mjs` — replace the SUBJECT-only section loop (lines 60-67, 109-140) with a TIER-first grouping
  (ATOM → MODIFIER → COMPOSITE → INFRA), SUBJECT as the sub-header inside ATOM, effects sub-grouped by trigger
  semantics inside MODIFIER.
- `schema.ts` — add the `specialComponents[]` section + a `compositeSchema` kind (close the unmodeled-tier gap §5.3),
  and add a `tier` discriminant (or derive tier in the generator from a `families.mjs` map — preferred, keeps it one
  shared fact per the 2026-06-12 log). Add `specialComponents` to `generatedSections`.
- `build-registry.mjs` — discover `src/special-components/index.ts` into `specialComponents[]` (mirrors
  `buildLessonComponents`), move the composites out of `motionComponents` by re-homing them to that barrel.
- `families.mjs` — own the `kind → tier` and `effect → trigger-semantic` maps (ONE shared module, per the optimization
  log's one-module-per-shared-fact rule), imported by both generator and digest.

---

## 7. What NOT to expose (kept out of the model-facing catalog)

Keep these in `primitive-registry.json` / code for gates + humans, but NOT in the digest the model reads:

- **`source` (repo path).** Integration detail; never acted on at pick time (§2.5). Lives in the JSON for the drift
  gate and human debugging.
- **Internal mechanism names inside prose** — `getFenHeDiagramAnchors`, "via a pathLength dash trick", "seeded
  scatter placement". These are how-it-works, not when-to-use. Strip from `intent`/`useWhen`; if a prop matters to
  selection it's a `variant`, otherwise it's JSDoc on the component.
- **`status` badge on live rows.** Only the *quarantine* (Deprecated section) needs `status`; tagging every live row
  `stable` is uniform noise.
- **`generatedSections` / `membershipGatedSections` / `manifestAuthoredSections` / `$comment` / `version`.** Registry
  self-documentation for the harness, not selection signal.
- **Raw `intent` keyword-tag arrays** (once repurposed into the sentence) — a bag of nouns blurs siblings (§2.3).
- **Full multi-paragraph `useWhen`** (e.g. `abstraction-ladder`'s ~600-char prop dump). Expose the first 1-2
  sentences; the full prose stays recoverable in the JSON (Side B: "recoverable depth = the JSON",
  `catalog-digest.mjs:37`). The model reads the JSON directly only when it needs the deep prop list.
- **Source paths / barrel module specifiers / `family` plumbing** beyond the section header.

Everything hidden remains one `Read` away in the JSON — consistent with progressive disclosure (`two-sided…md` §5):
slim, high-signal digest resident; full prose on demand.

---

## 8. Open questions / where I agree & disagree with the stakeholder

**AGREE (evidence-backed):**
- **"`intent` should be a concise meaning-carrying SENTENCE the model selects on."** Strongly supported — §2.1-2.2,
  the 72%-vs-20% competitive-selection gap, "lead with the trigger condition." This is the single highest-leverage
  change. ✔
- **"`useWhen` can be longer and need not be the first thing the model sees."** Supported — purpose/trigger is the
  pick read; functionality is the confirm read. Keep it, demote it, cut it on a sentence boundary. ✔
- **"The component/effect categories are not fixed and should be reconsidered."** Strongly agree — the subject/role
  mixing and the unmodeled `specialComponents` tier are real defects (§5). Recommend composition-tier as primary. ✔
- **"Design for read-the-whole-JSON-and-compose; add tags/filters only if needed later."** Agree, and the skill
  backs it hard (Side B, "defer embeddings until a *measured* low-hundreds bottleneck", `SKILL.md` optimization log).
  At ~70 entries no filter/vector store is justified. I do **not** recommend embeddings. ✔

**DISAGREE / sharpen (don't just obey):**
1. **Don't DROP `useWhen` or `avoidWhen` in favor of "just make intent a sentence."** The stakeholder framed intent
   as *the* signal; the evidence says the **boundary field (`avoidWhen`) is co-equal in importance** for a
   whole-catalog read — it's what defuses sibling confusion and prevents duplicate-builds (§2.2, §1). The win is
   "expose intent-sentence + avoidWhen," not "replace everything with intent." A minimal "make intent a sentence"
   change would leave the sibling-confusion failure mode wide open.
2. **Keyword `intent` tags should be RETIRED, not kept beside the sentence.** The stakeholder implied tags might
   coexist ("only adding tags later if needed"). In a no-filter system a tag array is pure noise that *blurs*
   siblings (§2.3) — repurpose the tags INTO the sentence; if a filter is ever built, derive tags mechanically then.
3. **The biggest lever is governance, not exposure — and it's out of the stakeholder's framing.** Better prose
   reduces wrong-picks, but the harness's strongest empirical finding (`two-sided…md` §7, SkillsBench/Library Drift)
   is that an agent-grown library trends to **+0.0pp without outcome-driven retirement + active-cap**. Exposure work
   makes the catalog *select* better; it does nothing to keep the catalog *good*. Flag for a follow-up: wire a
   contribution score from the run logs the pipeline already writes. (Out of this brief's scope, but the higher-order
   risk.)
4. **One concrete bug to fix regardless of taxonomy:** `menuCell`'s sentence split is `(?<=[.;])\s+` — it cuts on
   the first `;`, which is why `fen-he-diagram` shows a dangling half-sentence. Even before any redesign, splitting
   on `.`/`。` only would immediately improve every entry whose first sentence contains a semicolon.

**Open questions (need the human eye / a measured run):**
- Does a per-entry prose lint (§6.3) risk false-positives on legitimately-no-sibling atoms (e.g. `FXDefs`)? Propose:
  require `avoidWhen` only for `status:stable` teaching atoms/composites, exempt infra/setup.
- Should `recipes[]` (composite tier) be populated now to give the model explicit "these compose together" hints, or
  is that premature until a second lesson demands the same combo? (Lean: populate lazily from observed reuse, per the
  accretion loop §6.)
- Sizing/footprint: a per-capability render-footprint field would help the model avoid the kids-eye min-size trap
  (`abstraction-ladder` notes "keep count ≤ ~6 at 1280-wide" in prose). That belongs to the parallel sizing agent;
  flag only that IF a footprint standard lands, it should be a first-class registry field, not buried in `avoidWhen`.

---

### Self-check (Required bar audit)

1. **Cites Side A vs Side B explicitly + applies it** — PASS. §0 frame, §2, §6, §7 cite `two-sided…md` §3/§4/§5/§7;
   exposure decisions derive from "Side B inject-and-read" + generate-vs-gate.
2. **≥4 external sources w/ URLs on tool-description selection** — PASS. §2 cites 9 with URLs (Anthropic ×2, OpenAI,
   Together, LangChain implied, tianpan MCP-audit, arXiv 2605.24660, 2606.06284, 2505.03275, 2510.20036, ACL EMNLP
   1060).
3. **Field-set table covers EVERY current field w/ expose/hide + reason** — PASS. §3 table: id, component, intent,
   useWhen, avoidWhen, variants, status, supersededBy, source, kind/family, recipes.items — all verdicted.
4. **Intent-vs-functionality RESOLVED w/ before/after on 2 real entries** — PASS. §4: `fen-he-diagram` +
   `place-value-mat`, authored before/after tables.
5. **Taxonomy maps ALL current kinds + covers EFFECTS** — PASS. §5 table maps counting/literacy/interaction/sketch/
   asset/motion/fx/lessonComponents/styles/recipes/motionVocabulary → ATOM/MODIFIER/COMPOSITE/INFRA; effects
   categorized by role+trigger-semantics; closes the unmodeled `specialComponents` tier.
6. **Concrete "what NOT to expose" list** — PASS. §7, 7 bullets, each with where-it-still-lives.
7. **States AGREE + DISAGREE w/ evidence** — PASS. §8: 4 agreements, 4 disagreements/sharpenings, all cited.
- **Did not recommend embeddings** — PASS (§8 agree-4, explicit). **Did not invent repo facts** — all claims cite
  file:line or note "not found" (`specialComponents` absence confirmed). **No placeholders** — none.

---

## Progress

### 2026-06-14 — proof-batch scaffold + counting category landed (uncommitted, pending human review)
- **§3/§4 intent→sentence + expose `avoidWhen` + hide `source` → `scripts/registry/catalog-digest.mjs`** — digest columns now `id | component | intent(pick) | variants | use when(confirm) | avoid → use instead`; `intentCell` shows the whole authored sentence, `avoidCell` newly on live rows, `source`/`status` dropped from the menu, the `;`-split bug (§8.4) fixed (split on `.`/`。` only). `intent` schema widened to `string|array` for the migration (`schema.ts`).
- **§5 taxonomy (ATOM→MODIFIER→COMPOSITE→INFRA) → `schema.ts` + `scripts/registry/families.mjs` + `build-registry.mjs` + `catalog-digest.mjs`** — created the `specialComponents[]` COMPOSITE tier (closes §5.3's unmodeled-tier gap the gap-filler referenced); 10 composites routed out of `motionComponents` via a shared `MOTION_COMPOSITES` set (no file moves; reversible); digest is tier-first. `drift-report` (KIND 2 unions both sections), `check-gallery`, and the gallery data builder updated to know the new section.
- **§4 before/after → counting re-authored** — all 20 live counting primitives' `intent`/`avoidWhen`/`footprint` authored by a sub-agent (the §7 contract, run on the proof category), `fen-he-diagram`/`place-value-mat` verbatim from §4. Gate green (70/70 documented).
- **NOT bridged yet:** §6.3 structural prose lint (intent single-sentence / no-superlative / avoidWhen-present gate) — not added; enforced as a *bar* in the sub-agent contract for now, lint to follow. §8.3 outcome-driven governance/retirement — flagged, separate initiative (out of scope). Keyword `intent` tags retired (§4) — gallery leads with the sentence; tag-filter chips survive only for un-swept legacy arrays.
- **Remaining sweep (task #7):** literacy / interaction / sketch / asset / modifier / composite / infra re-authoring via the §7 sub-agent contract (parallel author, serial merge).
