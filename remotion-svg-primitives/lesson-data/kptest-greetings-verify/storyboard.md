# Storyboard — kptest-greetings-verify

**Lesson shape.** Two kids meet at the school gate, exchange English greetings (Hello / Hi), one introduces themselves (I'm Sam — the key-difficult /aɪm/ sound), the child practices through echo then independent attempt, they part with farewells (Goodbye / Bye-Bye), and a final recap retrieves all three routines. The entire lesson is one small social encounter — greeting → self-intro → farewell — not three flashcards. Teacher narration is Chinese-medium with embedded English target words; the voice delivers target sounds, the picture delivers the moment.

**Cast (identity-invariant across the lesson):** Two kid characters — `<IconAsset name='boy-face' />` (Kid A) and `<IconAsset name='girl-face' />` (Kid B). Same two figures in every DialogueExchange turn; no substitute characters.

**Acquisition spine.** The I'm thread is interleaved with other phrases: model (C2) → choral (C3) → gap (C4) → [farewell interrupt (C5)] → recap (C6). The farewell between the learner gap and the recap provides natural spacing so the final retrieval is genuine recall, not echo.

---

### topic-intro

- **discovery ref:** (Lesson opening — the `announce-topic` move. The child learns this lesson is about three English routines they'll use at the school gate.)
- **stage:** pre-concrete — text only, no scene yet.
- **teaching action(s):** `announce-topic`
- **narration beat (intent):** Name what we're about to learn — greeting, introducing yourself, and saying goodbye in English. Tease the three target phrases.
- **required visual:** `LessonIntroCard` (title + section/unit eyebrow + one-line KP teaser). **Beat-ordering note for composer:** the card reads alone first — cast and teaching objects enter AFTER the title/teaser has read, never overlaid on it. No scene, no characters.

---

### greet

- **discovery ref:** On meeting someone, you can greet them in English with "Hello" or "Hi" — two sounds for the same action the child already knows.
- **stage:** concrete — two characters physically meet at the school gate; the greeting is an action in a real moment.
- **teaching action(s):** `stage-the-moment` → `model-target-slow` (Hello, normal speed — easy target; then Hi, normal speed) → `track-read-along`
- **narration beat (intent):** Stage the meeting moment. Kid A waves and says "Hello"; Kid B waves back and says "Hi". Both greeting variants modeled cleanly in one natural exchange. Narrator frames the moment in Chinese; the English targets ride as isolated tokens.
- **required visual:** `DialogueExchange` with two turns (left/Kid A: "Hello", gesture:wave; right/Kid B: "Hi", gesture:wave). Identity-invariant cast (boy-face, girl-face). `ReadAlongHighlight` surfaces "Hello" then "Hi" as each is spoken — live cursor on the currently-spoken token. School-gate context established here and held through C2–C4.

---

### im-slow-model

- **discovery ref:** To tell someone who you are in English, you say "I'm" followed by your name — and "I'm" is **one smooth sound /aɪm/**, not [em] and not two beats.
- **stage:** concrete — Kid B introduces themselves to Kid A in the same gate encounter. The self-introduction is a real social action, not a grammar lesson.
- **teaching action(s):** `model-target-slow` (I'm, exaggerated — key_difficult; ~2 models within this cue, each in its own breath-group) → `track-read-along`
- **narration beat (intent):** Model "I'm" slowly and held — the diphthong /aɪm/ delivered in its own breath-group, slower than narration default. A brief predictive pause BEFORE "I'm" lets the sound land. Kid B says "Hi! I'm… Sam" — the slight pause before "Sam" lets /aɪm/ complete before the name gives meaning. Warm modeling, not drill.
- **required visual:** `DialogueExchange` with emphasis flag on the "I'm Sam" turn — the emphasis flag fires a `PulseCircle` visual pulse on the "I'm" token. `ReadAlongHighlight` slows its cursor to match the exaggerated model; beats array weights "I'm" higher for extended dwell. Everything else (Kid A, gate background) is quiet — the target glyph reads big, centered, nothing on top.

---

### im-choral-echo

- **discovery ref:** The child can begin producing "I'm Sam" together with the teacher — the sound /aɪm/ starts living in the child's own mouth, not just in the teacher's.
- **stage:** concrete — same encounter moment, now the narrator invites the child into it ("跟我说").
- **teaching action(s):** `invite-echo` (model at natural speed + choral invitation) → `track-read-along`
- **narration beat (intent):** Teacher models "I'm Sam" once more at natural speed, then invites the child to repeat together ("跟我说：I'm Sam"). Supported production — the child speaks along with or just after the model, reducing risk of fossilizing the wrong sound.
- **required visual:** `ReadAlongHighlight` text "I'm Sam" with a "your turn" visual affordance (a soft glow or prompt icon on the text). Characters hold their positions from im-slow-model — no new scene change; the only change is the invitation prompt appearing. The `ReadAlongHighlight` cursor sweeps during the teacher model, then holds on the text during the invitation.

---

### im-learner-gap

- **discovery ref:** The child can say "I'm Sam" (or attempt the /aɪm/ sound) **on their own**, without the teacher's voice carrying them — the transition from echo to independent production.
- **stage:** concrete — the picture holds the meeting moment; Kid A looks at Kid B expectantly, as if waiting for the introduction. The social pressure of the encounter motivates the child to fill the silence.
- **teaching action(s):** `learner-response-gap`
- **narration beat (intent):** Narrator prompts ("你来试试：I'm…"), then **real silence** (≥3–5s baked into the WAV at zero TTS cost via `gap: { reason: "learner-response" }`). This is the acquisition floor — the child must retrieve and produce /aɪm/ without support before the lesson moves on.
- **required visual:** Scene holds from im-choral-echo — characters in place, `ReadAlongHighlight` text "I'm Sam" remains visible as a "your turn" affordance (cursor inactive, text glowing). The expectant pause and the held text ARE the focal change (the silence after sound). No new visual elements enter.

---

### farewell

- **discovery ref:** When parting, you can say "Goodbye" or "Bye-Bye" in English — two sounds for the same action the child already does every day.
- **stage:** concrete — the two kids wave and walk apart at the gate. The parting is a real physical action; the English labels attach to it.
- **teaching action(s):** `stage-the-moment` → `model-target-slow` (Goodbye, normal pace; then Bye-Bye, normal pace) → `track-read-along`
- **narration beat (intent):** Stage the parting moment. The two characters wave and begin separating; "Goodbye" and "Bye-Bye" are each modeled cleanly. Narrator frames the parting in Chinese; the English targets ride as isolated tokens. This cue also serves as a **natural spacer** between the I'm learner gap and the recap, so the final retrieval of "I'm" is genuine recall, not echo.
- **required visual:** `DialogueExchange` with two turns (gesture:wave on both — Kid A: "Goodbye"; Kid B: "Bye-Bye"). Characters begin separating (the parting motion is the focal change). `ReadAlongHighlight` surfaces "Goodbye" then "Bye-Bye" as each is spoken.

---

### recap

- **discovery ref:** The three routines — greet, introduce, part — form one complete encounter, and the child can retrieve all of them, with "I'm" getting a final retrieval to cement /aɪm/.
- **stage:** concrete — brief replay snippets of the encounter (the wave, the introduction, the parting), each surfacing its target phrase. The child sees the whole story reassembled.
- **teaching action(s):** `spaced-recall`
- **narration beat (intent):** Cycle through all three phrases in encounter order (Hello → I'm Sam → Goodbye). Each phrase is retrieved, not just re-shown. "I'm" gets extra dwell within the recap — the hardest target gets the most retrieval time. The recap is the closing bracket: what the child can retrieve here is what they own.
- **required visual:** `ReadAlongHighlight` cycling through the three phrases in encounter order with a **single live marker** on the currently-spoken item — a marker sitting on a stale/earlier row is a bug. The highlight on "I'm" is held longer (beats array weights "I'm" higher). Recap stack layout with the three phrases visible; only the active one is highlighted.

---

## Reinforcement cue map

| Cue | Type | Reinforcement role | Reasoning |
|-----|------|--------------------|-----------|
| topic-intro | opener | — | `announce-topic` required opening; sets context |
| greet | teaching | model (Hello + Hi) | First clean model of both greeting variants |
| im-slow-model | teaching | model (I'm) | Key-difficult /aɪm/ gets exaggerated slow model |
| im-choral-echo | reinforcement | choral (I'm) | Supported production — child speaks with teacher |
| im-learner-gap | reinforcement | independent (I'm) | Unsupported production — the acquisition floor |
| farewell | teaching + spacer | model (Goodbye + Bye-Bye) | Farewell model; natural spacing before I'm recap |
| recap | reinforcement | spaced recall (all three) | Final retrieval of all targets; extra dwell on I'm |

## Required-visual notes for W3 gap-scan

All required components exist in `catalog-digest.md`:
- `LessonIntroCard` — topic-intro card (title + eyebrow + teaser)
- `DialogueExchange` — turn-taking exchange (greet, I'm model, farewell)
- `ReadAlongHighlight` — cursor-swept text tracking (greet, I'm model, choral, gap, farewell, recap)
- `IconAsset` name='boy-face' / name='girl-face' — identity-invariant cast figures
- `PulseCircle` — emphasis pulse on I'm turn (composed inside DialogueExchange)
- `PopIn` — bubble entrance motion (composed inside DialogueExchange)

**Asset gap (for W3):** A school-gate background SVG asset is needed for the scene context (C1–C5). Check whether a suitable background exists in the generated asset library or needs to be authored as a new `IconAsset`.

---

```
exposures:
  I'm: 7
  Hello: 4
  Hi: 4
  Goodbye: 3
  Bye-Bye: 3
```
