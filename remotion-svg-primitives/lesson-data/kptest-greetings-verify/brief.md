# kptest-greetings-verify

**Audience.** 三年级 (~8 years old), Mandarin-speaking children in their first English unit. Teacher narration is in Chinese; the target words/phrases are in English.
**Length.** 45–60s band — HINT for scope only, not a target to pad to.
**Builds on.** none (this is the first lesson of PEP English Unit 1 "Hello!").
**Style.** default

## Knowledge point
The child leaves able to use three spoken English routines: greet on meeting — Hello. / Hi.; introduce themselves — Hello, I'm… / Hi, I'm…; and part — Goodbye. / Bye-Bye. Special care on the one hard sound: **I'm is one syllable /aɪm/**, not [em] and not two beats [ai-m].

## The one beat
Two kids meet at the school gate. One waves — "Hello!" The other waves back — "Hi! I'm Sam." (the I'm sound modeled BIG and slow, held for a beat.) A moment later they part, waving — "Goodbye!" The SAME two characters carry all three phrases, so greeting → self-intro → farewell reads as one tiny encounter, not three flashcards.

## Out of scope
No "What's your name? / My name's…" (that is §1.4). No stationery vocabulary — crayon/pencil/pen/eraser/ruler (§1.2, §1.5). No alphabet / ABC song (§1.3). ONLY the three phrases: Hello/Hi, I'm…, Goodbye/Bye-Bye.

## Continuity
Establish the two kid characters as identity-invariant — the same two are reused by later Unit 1 lessons. Reuse the registered special components rather than hand-coding: `DialogueExchange` for the meet/part turns (its `emphasis` flag fires a pulse on the I'm turn) and `ReadAlongHighlight` for surfacing the target phrase as it is spoken.

## Narration notes
Narration is **Chinese-medium with embedded English target words** — the existing Aoede voice + Chinese ASR `tokenPattern` ([㐀-鿿]) aligns the Chinese; the short English words ride along and set no cue boundary of their own. Keep each English token short and isolated (Hello / Hi / I'm Sam / Goodbye) so TTS pronounces it cleanly and the child hears it un-blended. The I'm cue is the lesson's `key_difficult`: give it the `DialogueExchange` emphasis flag and an exaggerated, slow model in both motion and narration. Do NOT correct-drill harshly (per curriculum 应对建议) — model it warmly, let the child absorb it.
