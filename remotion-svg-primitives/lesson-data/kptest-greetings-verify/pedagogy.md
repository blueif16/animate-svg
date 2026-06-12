# Pedagogy — kptest-greetings-verify

lesson kind: **language/L2** (§9 applies — voice delivers target sounds, picture delivers the moment; §4 narration-leakage carve-out active for all English target tokens. L1+L2 mix: teacher framing in Mandarin, target words in English. Narration is Chinese-medium with embedded English target words per the brief's narration notes.)

## Reinforcement reasoning (per §8)

This is an **acquisition** lesson — three spoken routines the child must *produce*, not merely recognize. Acquisition difficulty varies across the targets:

- **Hello / Hi** — the child has greeted people since toddlerhood; only the English *sounds* (/həˈloʊ/, /haɪ/) are new. Low-to-moderate difficulty. Needs a clean model and a later retrieval, but not heavy drilling. ~4 exposures across the lesson (model + recap + brief replay in recap).
- **I'm /aɪm/** — the lesson's `key_difficult`. A new diphthong the child's Mandarin phonology does not contain, easily confused with [em] or split into two syllables [ai-m]. High difficulty, high novelty. Needs slow model, choral echo, learner-response gap, and spaced recall — the full acquisition stack. ~7 exposures across the lesson (slow model ×2 + choral model + gap attempt + recap).
- **Goodbye / Bye-Bye** — the child parts from people daily; only the English sounds are new. Low difficulty. Needs a clean model and a later retrieval. ~3 exposures across the lesson (model + recap).

Spacing strategy: the I'm thread is interleaved with the other phrases (model → choral → gap → [farewell interrupt] → recap) rather than massed in one block. The farewell cue between the learner gap and the recap provides natural spacing so the final retrieval is genuine recall, not echo.

---

## C1 — greet

**discovery:** On meeting someone, you can greet them in English with "Hello" or "Hi" — two sounds for the same action the child already knows.
**stage:** concrete — two characters physically meet at the school gate; the greeting is an action in a real moment.
**focal:** the two kid characters — their approach, wave, and face-to-face meeting. The ReadAlongHighlight surfaces "Hello" then "Hi" as each is spoken, but the *change* the child watches is the meeting itself.
**reinforcement:** One pass is sufficient for this easy target. Kid A models "Hello"; Kid B responds "Hi" — the child hears both greeting variants in one natural exchange. The recap cue (C6) retrieves them later. Teaching moves: `stage-the-moment` → `model-target-slow` (Hello, at normal speed — easy target) → `track-read-along`.

## C2 — I'm (slow model)

**discovery:** To tell someone who you are in English, you say "I'm" followed by your name — and "I'm" is **one smooth sound /aɪm/**, not [em] and not two beats.
**stage:** concrete — Kid B introduces themselves to Kid A in the same gate encounter. The self-introduction is a real social action, not a grammar lesson.
**focal:** the `DialogueExchange` emphasis turn on "I'm Sam" — the emphasis flag fires a pulse on the I'm token. The ReadAlongHighlight slows its cursor to match the exaggerated model. Everything else (Kid A, the gate background) is quiet.
**reinforcement:** This is the lesson's hardest acquisition target and earns the fullest modeling. The `DialogueExchange` emphasis flag gives "I'm" a visual pulse; the narration delivers /aɪm/ slowly and held (~2 models within this cue, each in its own breath-group per `model-target-slow` requires). Kid B says "Hi! I'm… Sam" — the slight predictive pause before "Sam" lets the /aɪm/ land before the name completes the meaning. Teaching moves: `model-target-slow` (I'm, exaggerated) → `track-read-along`.

## C3 — I'm (choral echo)

**discovery:** The child can begin producing "I'm Sam" together with the teacher — the sound /aɪm/ starts living in the child's own mouth, not just in the teacher's.
**stage:** concrete — same encounter moment, now the narrator invites the child into it ("跟我说").
**focal:** the ReadAlongHighlight text "I'm Sam" with a "your turn" visual affordance (e.g. a soft glow or prompt icon). The characters hold their positions from C2 — no new scene change; the only *change* is the invitation prompt appearing.
**reinforcement:** Choral repetition — the teacher models once more at natural speed, then invites the echo ("跟我说：I'm Sam"). This is supported production: the child speaks along with or just after the model, which reduces the risk of fossilizing the wrong sound. One choral pass is enough before the unsupported gap (C4). Teaching moves: `invite-echo` (model + choral invitation).

## C4 — I'm (learner gap)

**discovery:** The child can say "I'm Sam" (or attempt the /aɪm/ sound) **on their own**, without the teacher's voice carrying them — the transition from echo to independent production.
**stage:** concrete — the picture holds the meeting moment; Kid A looks at Kid B expectantly, as if waiting for the introduction. The social pressure of the encounter motivates the child to fill the silence.
**focal:** the held scene itself — the expectant pause, the "your turn" affordance, and the ≥3–5s of **real silence** where the child speaks. Nothing new enters; the focal *change* is the gap itself (the silence after sound).
**reinforcement:** Learner-response gap — unsupported production. The narrator prompts ("你来试试：I'm…"), then silence for ≥3–5s baked into the WAV at zero TTS cost (`gap: { reason: "learner-response" }`). This is the acquisition floor in action: the child must retrieve and produce /aɪm/ without support before the lesson moves on. Teaching moves: `learner-response-gap`.

## C5 — farewell

**discovery:** When parting, you can say "Goodbye" or "Bye-Bye" in English — two sounds for the same action the child already does every day.
**stage:** concrete — the two kids wave and walk apart at the gate. The parting is a real physical action; the English labels attach to it.
**focal:** the two characters separating — the wave, the turning away, the growing distance. The ReadAlongHighlight surfaces "Goodbye" then "Bye-Bye" as each is spoken. The *change* the child watches is the parting motion.
**reinforcement:** One clean pass — the difficulty is low (familiar action, new label only). The brief models both variants; the recap (C6) retrieves them. The farewell also serves as a **natural spacer** between the I'm learner gap (C4) and the recap (C6), so the final retrieval of "I'm" is genuine recall, not echo. Teaching moves: `stage-the-moment` → `model-target-slow` (Goodbye, normal pace) → `track-read-along`.

## C6 — recap

**discovery:** The three routines — greet, introduce, part — form one complete encounter, and the child can retrieve all of them, with "I'm" getting a final retrieval to cement /aɪm/.
**stage:** concrete — brief replay snippets of the encounter (the wave, the introduction, the parting), each surfacing its target phrase. The child sees the whole story reassembled.
**focal:** the ReadAlongHighlight cycling through the three phrases in encounter order (Hello → I'm Sam → Goodbye), with a **single live marker** on the currently-spoken item. The highlight on "I'm" is slightly longer/held — the hardest target gets the most retrieval time.
**reinforcement:** Spaced recall — all three phrases are interleaved in one quick montage, forcing retrieval rather than re-exposure. "I'm" gets extra dwell (~3–5s) within the recap because it is the hardest target and benefits from a final retrieval. The recap is the closing bracket of the lesson: what the child can retrieve here is what they own. Teaching moves: `spaced-recall`.
