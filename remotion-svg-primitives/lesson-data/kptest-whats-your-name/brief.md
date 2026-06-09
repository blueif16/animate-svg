# kptest-whats-your-name

**Audience.** 三年级 (~8 years old), Mandarin-speaking children in their first English unit. Teacher narration is in Chinese; the target words/phrases are in English.
**Length.** 60–90s band — HINT for scope only, not a target to pad to.
**Builds on.** kp1-hello-greetings (the child already greets with Hello/Hi and can say "I'm…" + a name).
**Style.** default

## Knowledge point
The child leaves able to run the name exchange in English: ask **What's your name?** and answer **My name's ___.** These are two CO-EQUAL halves of one routine — the question AND the answer, each a real spoken move the child must produce, neither an afterthought. Special care on two hard contractions: **What's** /wɒts/ (one beat, not "what is") and **name's** /neɪmz/ (the final /mz/ cluster Mandarin phonology lacks).

## The one beat
Two kids meet. One leans in and asks — "What's your name?" The other points to themselves and answers — "My name's Lily." Then they swap roles, so the child hears and practices BOTH asking and answering inside one little encounter, not as two disconnected flashcards.

## Out of scope
No Hello/Hi/Goodbye (that is §1.1 greetings — assume known). No "How are you?", no "Nice to meet you". No stationery vocabulary. ONLY the name exchange: What's your name? / My name's ___.

## Continuity
Reuse the two identity-invariant kid characters established in kp1-hello-greetings. Reuse the registered special components rather than hand-coding: `DialogueExchange` for the ask/answer turns and `ReadAlongHighlight` for surfacing the target phrase as it is spoken. The name slot (___) is a fill-in the child can swap.

## Narration notes
Chinese-medium framing with embedded English targets. Each target phrase must be its own clean beat so it lands ON its animation — the ask-turn and the answer-turn are separate beats; do NOT bury the English at the tail of a long Chinese line. The two contractions What's and name's are the `key_difficult` — model slow, invite an echo, and give a real wait-time gap for the child to answer. Do not harsh-drill (model warmly).
