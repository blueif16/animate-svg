# Storyboard — kptest-greetings-verify

**Lesson shape.** Two kids meet at a school gate, exchange three English routines (Hello / I'm Sam / Goodbye) in one continuous encounter, then replay the encounter as an integrated whole. The key_difficult is the /aɪm/ sound in "I'm," which gets its own dedicated practice beat (im-echo) separate from the in-context exposure (hi-intro). The spine is: announce → meet+greet → introduce+model → drill the hard sound → part → recap. All five post-intro cues are one unbroken social scene — the same two characters, the same gate — so the lesson reads as one tiny encounter, not three flashcards.

---

### intro

**discovery ref:** _(lesson-level framing — no single discovery; sets the topic for all five cues that follow.)_

**stage:** concrete

**teaching action(s):** `announce-topic`

**narration beat (INTENT):** Name the lesson's topic and unit — "今天我们来学英语打招呼" — briefly, so the child knows what's coming. The title/teaser reads alone; the cast enters only after this beat has fully read.

**required visual:**
- `LessonIntroCard` — title + section eyebrow + KP teaser. Reads first, alone on screen. No cast, no teaching objects overlaid. (announce-topic `requires`: title/teaser is the only readable thing; cast enters after.)

---

### meet-hello

**discovery ref:** When I meet someone, I can greet them by saying "Hello" (or "Hi") in English.

**stage:** concrete — the child watches a real social moment: two kids approach, one waves and speaks.

**teaching action(s):** `stage-the-moment` → `model-target-slow` → `gloss` → `invite-echo`

**narration beat (INTENT):** Set the scene (two kids arriving at the school gate), model "Hello" clearly and slowly as Kid A's greeting, gloss it ("Hello 就是你好"), then invite the child to echo ("跟我说：Hello!").

**required visual:**
- Two identity-invariant kid characters (e.g. `<IconAsset name="boy-face"/>` as Kid A, `<IconAsset name="girl-face"/>` as Kid B) approaching a school-gate backdrop.
- `DialogueExchange` — Kid A's first turn with `gesture: "wave"`, speech bubble showing "Hello!". The wave and bubble arriving together IS the discovery.
- `ReadAlongHighlight` — surface "Hello" as it is spoken, cursor tracking the word.
- `gloss` requires: the L1 meaning ("你好") shown **beside/under** the target, never over it.
- `invite-echo` requires: a clear "your turn" visual cue after the model.

---

### hi-intro

**discovery ref:** I can tell someone my name in English using "I'm ___" — and the word "I'm" is one smooth sound (/aɪm/), not "em" and not two syllables.

**stage:** concrete — the child watches Kid B respond in the same encounter, modeling self-introduction as a real social act.

**teaching action(s):** `stage-the-moment` → `model-target-slow` → `track-read-along`

**narration beat (INTENT):** Kid B responds in the same encounter — "Hi! I'm Sam." The teacher models the full phrase in context, with "I'm" voiced BIG and slow (the key_difficult). The narration draws attention to the /aɪm/ sound within the natural phrase. This is the in-context exposure; the isolated drill comes next.

**required visual:**
- `DialogueExchange` — Kid B's response turn, **`emphasis: true`** on the "I'm Sam" turn. The emphasis flag fires a `PulseCircle` pulse on "I'm" — drawing eye and ear to the key_difficult sound. Kid B's `gesture` may be `"point-self"` (pointing at self while introducing).
- `ReadAlongHighlight` — surface "Hi! I'm Sam" as it is spoken, cursor tracking token-by-token. The cursor **dwells** on "I'm" to match the slow model.
- Same two characters, same gate — identity-invariant, continuous scene.

---

### im-echo

**discovery ref:** "I'm" sounds like /aɪm/ — one glide from "ah" to "m," not "em" and not "ai-m." I can copy that sound.

**stage:** concrete — the child hears the isolated sound and practices producing it.

**teaching action(s):** `model-target-slow` → `invite-echo`

**narration beat (INTENT):** The teacher frames in Chinese ("这个音是 /aɪm/，一个音，不是两个"), then models "I'm" slowly and exaggeratedly, then at normal speed, then invites echo ("跟我说：I'm"). Three exposures within one short cue. Warm modeling, no error-correction — the child absorbs through repetition.

**required visual:**
- `ReadAlongHighlight` — displaying "I'm" prominently. The visual is a **zoom-in** on the speech bubble from the encounter we just watched (not a separate flashcard — continuity with the scene). The highlight dwells on "I'm" during each model.
- `model-target-slow` requires: the target glyph **big, centered, nothing on top**, held at least its spoken length.
- `invite-echo` requires: a clear "your turn" visual cue after each model.
- `DialogueExchange` emphasis turn may be reused here with the emphasis flag pulsing on "I'm" for each repetition.

---

### part-goodbye

**discovery ref:** When I leave someone, I can say "Goodbye" or "Bye-Bye" in English.

**stage:** concrete — the child watches the same two kids part, completing the encounter.

**teaching action(s):** `stage-the-moment` → `model-target-slow` → `invite-echo`

**narration beat (INTENT):** The two kids part, waving. "Goodbye!" and "Bye-Bye!" are modeled as two interchangeable variants (just as "Hello" and "Hi" were in meet-hello). The teacher invites echo ("跟我说：Goodbye!"). The pattern is now familiar: hear it, copy it.

**required visual:**
- `DialogueExchange` — both kids' parting turns, `gesture: "wave"`. Speech bubbles showing "Goodbye!" and "Bye-Bye!" arrive naturally as the two variants.
- `ReadAlongHighlight` — surface "Goodbye" / "Bye-Bye" as spoken.
- Same two characters, same gate — the visual change is the kids turning/waving apart (completing the encounter).

---

### recap-encounter

**discovery ref:** Greeting, introducing myself, and saying goodbye are three things I can do in one real English conversation — I just did all three.

**stage:** concrete — the child re-sees the full encounter, retrieving each phrase as it replays. Integration: three separate discoveries become one social routine.

**teaching action(s):** `spaced-recall`

**narration beat (INTENT):** The encounter replays in condensed form. The teacher names the structure: "打招呼、介绍自己、说再见——你会用英语交朋友了！" Each phrase lights up as it replays. This is retrieval, not new content — spaced recall after a short gap strengthens retention.

**required visual:**
- The encounter replaying with all three `DialogueExchange` turns (Hello → I'm Sam → Goodbye), each surfacing in sequence.
- `ReadAlongHighlight` — tracks each phrase as it replays. The live highlight lands **only on the currently-spoken** item; a marker sitting on a stale/earlier row is a bug (spaced-recall `requires`).
- Sequential highlighting across the three moments — the child tracks which phrase comes when in the encounter.

---

## Reinforcement map

| Cue | Reinforcement role | Reasoning |
|---|---|---|
| `intro` | none — framing only | announce-topic sets the topic; no discovery to reinforce. |
| `meet-hello` | **first model** of "Hello/Hi" | Moderate reinforcement (per pedagogy): one clear model + choral invitation. Familiar concept, novel English form. |
| `hi-intro` | **first model** of "I'm Sam" in context | Heavy reinforcement (key_difficult): in-context exposure with emphasis flag. A dedicated follow-up cue (im-echo) provides isolated practice. |
| `im-echo` | **dedicated practice** for /aɪm/ | Heavy reinforcement (key_difficult): slow model → normal speed → choral echo. Three exposures in one cue. This IS the reinforcement that hi-intro set up. |
| `part-goodbye` | **first model** of "Goodbye/Bye-Bye" | Light reinforcement: phonetically straightforward, child already knows the lesson rhythm. One model + echo suffices. |
| `recap-encounter` | **spaced recall** of all three phrases | This IS the reinforcement — retrieval of all three discoveries after a short gap, converting isolated discoveries into one integrated routine. |

No cue is a `replay of <id>` — each cue delivers distinct teaching content. The recap replays the encounter's *phrases* but re-authors the visual (condensed, sequentially highlighted) to serve the retrieval beat rather than re-showing identical clips.

---

## Capability gap flags for Wave 3

| Demand | Source | Gap? |
|---|---|---|
| Two identity-invariant kid character SVGs (boy, girl) | `stage-the-moment` requires identity-invariant cast | Check asset library: `boy-face` and `girl-face` exist as `<IconAsset>` — **no gap** if they render at the needed quality. W2 visual design confirms. |
| School-gate backdrop | `stage-the-moment` + brief's narrative setting | No registered backdrop primitive. May need a generated `<IconAsset>` or a minimal scene SVG. **Flag for W3b gap scan.** |
| `DialogueExchange` with `gesture`, `emphasis` | `stage-the-moment`, `model-target-slow` | **Exists** — registered, full prop surface. No gap. |
| `ReadAlongHighlight` with cursor | `track-read-along`, `spaced-recall` | **Exists** — registered, multiple cursor variants. No gap. |
| `LessonIntroCard` | `announce-topic` | **Exists** — registered. No gap. |
| "Your turn" visual cue | `invite-echo` requires a clear signal | No dedicated "your turn" indicator primitive. May be served by a `PointerHandArrow`, a `PulseCircle` on the child's position, or a simple text cue. **Flag for W3b gap scan** — low priority, may be satisfiable by composing existing primitives. |
