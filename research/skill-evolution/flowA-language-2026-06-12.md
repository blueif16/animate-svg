# Flow A — Robotic narration language (not how a real teacher speaks)

**Date.** 2026-06-12
**Investigator.** deep-dive diagnosis agent (read-only; proposes, does not edit)
**Lessons under examination.** `kptest-fenyuhe-six` (6的分与合), `kptest-first-second-third` (序数 第一/第二/第三)
**Status.** Brief for human review. No skill/scene/lesson file edited. Samples below are the centerpiece — discuss, then approve before anything lands.

---

## 1. Symptom

The narration is grammatically valid and pedagogically "correct" but reads as 书面语 / machine-stamped, not a warm teacher talking to a 6-year-old. Real output:

**kptest-fenyuhe-six** (`script-cues.json`):
- `六的分与合。和五的分与合一样，我们来分六。` — "我们来分六" is not natural Chinese (a real teacher says "我们一起来分一分6" / "我们来分分看").
- `六可以分成一和五。一和五合成六。` — then `…二和四…`, then `…三和三…` — **the identical template stamped three times**, zero variation, zero warmth, no "你看" / "对不对" / "试试看".
- `六可以分成几和几？` — a bare quiz prompt with no invitation ("谁来告诉我…" / "我们一起数数看…").
- `一和五。二和四。三和三。它们合起来，都是六。` — a recap that is a bare list read by a robot.

**kptest-first-second-third** (`script-cues.json`):
- `队里，每个位置都有名字。` — abstract/declarative; a teacher says "排队的时候呀，每个小动物都有自己的位置".
- `看，第一个小动物来了，站在最前面。` — closer, but still flat.
- `从前面数——第一，第二。这只小动物排第二。` — mechanical; "这只小动物排第二" is a label-stamp, not "数一数就知道啦，它呀，排第二！".

**Human's verdict (verbatim).** "this is not intuitive… 我们来分六 就不是中国话… 这模型根本就是没有在认真思考怎么正常地说一个中文… 正常的说法是说，我们来学习怎么…… 六还可以分成一和五，同样一和五一起也可以合成六… right now it's not even human that's speaking this." He wants the script written **in the tone of a great teacher** — a teacher persona / character baked into the prompt, natural spoken Mandarin, and samples to react to.

---

## 2. Root cause — a missing axis, not a broken rule

**One-liner.** Our skill chain specifies narration on four axes — *which fact to name, utterance completeness, ASR-safety, and length* — but has **zero guidance on spoken register, teacher persona, warmth, child-directed rhythm, or natural Mandarin idiom**, so a non-Claude planner model defaults to the terse, repeatable 书面语 template that satisfies every rule it was actually given.

This is a **gap, not a bug**: every existing rule fired correctly. The robotic lines are *rule-compliant*. What's missing is an entire dimension nobody told the model to optimize.

### 2.1 Where narration TEXT is actually decided

`lesson-audio-captions/SKILL.md` (Wave 2b) is the only skill that authors the spoken words. Its whole frame is **"narration is COMMENTARY ON THE VISUAL … written TO FIT each cue's `visualMotionSeconds`"** (`SKILL.md:3`, `:8`). Read the section headings — every one is a *constraint*, none is a *register*:

- `SKILL.md:24` **"The targeting rule"** → narration is a *length function* (~0.30s/char to hit the motion budget).
- `SKILL.md:30` **"Narration-leakage rule"** → don't pre-announce the count.
- `SKILL.md:41` **"Every narration line is a complete, grammatical utterance"** → name every term a relation binds (this is the rule that, well-intentioned, *produced* the template — see 2.3).
- `SKILL.md:61` **"ASR risk flags"**, `:76` **"Captions"**, `:79` **"Reinforcement & replay"**, `:88` **"What this skill does NOT do anymore"**.

**Grep evidence.** Searching `lesson-audio-captions`, `lesson-storyboard`, `lesson-pedagogy`, `cue-plan-author`, `tts-voice-direction`, and `.agents/TEACHING-ACTIONS.md` for `tone | persona | warm | natural | register | spoken | teacher voice | character` returns **no rule that governs how warm/natural/teacherly the spoken line is.** The closest hits are mechanical: `cue-plan-author` "Whatever sounds right in the voice's mouth" (`SKILL.md:11`, undefined — no criteria) and `tts-voice-direction`'s prosody knobs (voice/pace/gap — *acoustic delivery of given text*, not *what text to write*). The "great teacher voice" axis exists nowhere.

### 2.2 The upstream waves don't supply it either, by design

- `lesson-storyboard` is explicitly **"narration beat (INTENT, no copy) … NEVER the actual words"** (`SKILL.md:23`). It owns *what the beat is for*, never *how it's said*.
- `lesson-pedagogy` owns *what the child discovers* and, in §9, mandates the voice **name the acquisition target** — but says nothing about the *manner*. So the discovery sentence "6 can be split into 1 and 5" travels downstream and gets transcribed into the flattest possible Mandarin that names "6", "1", "5", "分成". Nobody is charged with making it sound like a person.

So the register gap is **structural**: pedagogy decides the fact, storyboard decides the intent, audio-captions decides the length + completeness + ASR-safety — and **the manner of speech falls between the seats.** Default model behavior fills the vacuum with书面语.

### 2.3 The completeness rule actively *amplifies* the robot (the sharp finding)

`lesson-audio-captions/SKILL.md:47-55` and `lesson-pedagogy §8` (`SKILL.md:123`) were recently hardened to forbid stranded fragments (`一和五，分成。`) and bare recap lists (`一和五。二和四。三和三。`). Correct in spirit. But the rule's **worked examples are themselves the bare template** the human is now rejecting:

- `SKILL.md:49` ✅ `六可以分成一和五。`
- `SKILL.md:50` ✅ `一和五合起来是六。`
- `SKILL.md:51` ✅ `六可以分成一和五、二和四、三和三。`

The model did exactly what the skill showed it, three times, verbatim, and the rule's "carry it verbatim; never compress" clause (`:55`) *discouraged natural variation*. **A completeness rule with template exemplars, and no co-equal naturalness rule, manufactures the stamped output.** The fix must add the missing axis *without* weakening completeness — the two are orthogonal (a line can be both complete *and* warm: `你看，6呀，可以分成1和5；那1和5抱在一起，又变回6啦！`).

### 2.4 Why "great-teacher voice" is the right lever (not a one-off rewrite)

The human asked for *character design / teacher persona / teacher's-perspective scripting baked into the prompt*. That maps to a real, citable production practice (§3): top children's content does not write "correct sentences" — it writes **a specific warm grown-up talking to one child**, and every line passes through that persona. We have the persona slot empty. Filling it generalizes to every future lesson and topic; rewriting two scripts does not.

---

## 3. Research synthesis (every claim cited)

### 3.1 Child-directed speech / teacher register (ages ~4–6) — what makes spoken language warm and followable

- **CDS is acoustically and structurally distinct and it aids learning**: slower pace, exaggerated/positive-affect prosody, **shorter utterances, frequent repetition, concrete ideas, simple syntax** — documented across languages *including Mandarin*. Source: Frontiers in Psychology, *Understanding Child-Directed Speech Around Book Reading* (2021), summarizing Rowe, Snow et al. https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.719783/full ; cross-linguistic incl. Mandarin: Grieser & Kuhl via *Journal of Child Language*, https://www.cambridge.org/core/journals/journal-of-child-language/article/pause-and-utterance-duration-in-childdirected-speech-in-relation-to-child-vocabulary-size/BD3BB52311A8375F700842F00E78E993
- **Elicit + extend, don't just declare.** Teacher talk that *elicits* (open/closed questions, "now you say it") and *extends* (builds on the child's contribution) drives engagement and vocabulary far more than flat comments; children respond to **direct elicitations** at much higher rates than to statements. Source: *Teacher–child conversations in preschool classrooms*, ScienceDirect, https://www.sciencedirect.com/science/article/pii/S0885200614001070 . **Our lines are almost all flat declaratives** — the opposite of this.
- **Prosody + second-person framing signal "I'm talking to YOU, little one."** 5–10-year-olds use prosody to infer the intended listener; warmth/affect is carried as much by *how* as by *what*. Source: *Guess who? Children use prosody to infer intended listeners*, BJDP, https://bpspsychub.onlinelibrary.wiley.com/doi/10.1111/bjdp.12135

### 3.2 Fred Rogers' "Freddish" — the canonical persona-driven child-scripting discipline

Rogers ran every line through a **nine-step translation into child-hearable language**: state the idea simply → rephrase positively → anticipate literal misreadings → strip prescriptive/over-certain wording → add a gentle motivation → relate it to the child's growth. "There were no accidents." Sources (primary excerpt + the nine rules): The Atlantic via Open Culture, https://www.openculture.com/2019/05/mr-rogers-nine-rules-for-speaking-to-children-1977.html ; biography excerpt, https://kottke.org/18/06/freddish-the-special-language-mister-rogers-used-when-talking-to-children . **The transferable principles for us:** (1) speak *to* the child, not *about* the content; (2) positive, concrete, never coldly declarative; (3) anticipate how a 6-year-old hears the literal words. "我们来分六" fails (1) and (2) — it is a procedure announced at the content, not a warm invitation to the child.

### 3.3 Sesame Street / CTW — write the *engaging human moment first*, map curriculum onto it

CTW's enduring lesson: **start with the scene/character/feeling, then attach the curriculum — never the reverse.** "The starting point for the writers isn't the curriculum; it's the scene, the storylines and the characters." Source: Storythings, *Formats Unpacked: Sesame Street*, https://formatsunpacked.storythings.com/p/formats-unpacked-sesame-street ; CTW Writer's Notebook (primary), https://files.eric.ed.gov/fulltext/ED126860.pdf . **We do the reverse** — pedagogy hands down the fact, and audio-captions transcribes it. The persona layer is how we inject "a warm teacher saying this to a kid" between the fact and the words.

### 3.4 Teacher-persona / character design improves engagement — and is how the Chinese market does it

- **Khan Academy Kids** routes all guidance through a **named, warm character narrator (Kodi Bear) with a designed personality**; the character-as-guide and its expressiveness are research-grounded (Stanford collab). Source: Khan Academy, https://khankids.zendesk.com/hc/en-us/articles/360049358751 (and engagement guide, https://www.edu.com/blog/understanding-khan-academy-kids-a-complete-guide-for-k-2-teachers-and-parents ).
- **凯叔讲故事 (Kaishu)** — China's reference IP for child content — built the whole company on **"用孩子的视角看，用孩子喜欢的方式讲"**: persona-first, joy-first ("第一性原理是快乐"), and **iteratively de-jargoned by reading lines to a real child and rewriting every spot the child stumbled** ("我把女儿提出的问题都写出来…反复修改和打磨…让3、4岁的孩子听起来没有任何情节障碍"). The new AI persona even **refuses to answer flatly and instead asks a guiding question back** ("你觉得和大气层有关吗？"). Sources: 混沌学园 王凯 talk, https://www.hundun.cn/articles/c3f58759eff1a107.html ; 数英 product talk, https://www.digitaling.com/articles/43884.html ; 新华网 interview, https://app.xinhuanet.com/news/article.html?articleId=a8762575429aa40fe3ceb9acbc8d8f5d . **Takeaway: a persona + a guiding-question reflex is exactly the warmth our lines lack.**

### 3.5 The authentic native register — straight from real Chinese 教案 (this is the gold)

Real 幼儿园/一年级 number-bond and 序数 lesson plans show how a Chinese teacher *actually* talks. The contrast with our output is the whole point.

**数的分与合 — authentic teacher phrasings** (人教版一年级 + 幼儿园大班 教案):
- Opening: not "我们来分六" but **"今天我们一起来学习6的分与合，好不好？"** / **"我们先从数字…开始研究"** / **"我们一起来分一分"**. Sources: 人教版一年级《分与合》教案 (book118, https://max.book118.com/html/2026/0520/6011225113012135.shtm ); 51jiaoxi 教案 ("之前我们学习了5以内数的分与合，今天我们开始学习6，7的分与合。同学们，我们一起来学习吧！", https://www.51jiaoxi.com/doc-17282397.html ).
- The bond, said warmly with a hands/objects frame and the **reverse stated as a discovery, not a clone**: "可以先给熊大1罐，那么熊二就可以吃5罐蜂蜜了。6就可以分成1和5." → then **"反过来…一共合起来就是6罐蜂蜜。"** Source: 幼师ok网《光头强分蜂蜜》, https://www.youshiok.com/video/7203 .
- Variation per split (not one template): **"6条小鱼水中游，一边1一边5。6条小鱼吐泡泡，一边2一边4…"** — each split gets its own little image. Source: 幼师ok网《帮小动物分家》, https://www.youshiok.com/blog/4429 .
- The "分与合是一件事的两种说法" insight, voiced plainly: **"看，'分'和'合'其实是一件事情的两种不同说法。4可以分成1和3，反过来，就是1和3合成4。"** Source: book118 教案 above.
- Choral retrieval framed as togetherness: **"我们一起来说说：6可以分成1和5…还可以反过来说，一起来说说：1和5合起来是6…"** Source: zjan56《6的分成》, https://www.zjan56.com/zhongbanjiaoan/7081.html .

**序数 第几 — authentic teacher phrasings** (幼儿园中班 序数 教案):
- Establish the front, warmly, with a look: **"看，谁来了？" / "从红旗这里排，从左往右一个一个排"** then **"排在第一个的是谁？谁排在第三个？大象排在第几个？"** Source: 查字典《认识序数》, https://ye.chazidian.com/mip/jiaoan-2108/ .
- The signature call-and-response game (this is the natural retrieval shape): **"我来问、你来答：XX，我问你，小兔在第几节？" — "刘老师，我来答，小兔在第2节。"** Source: 屈老师《排第几》, https://www.qulaoshi.com/zhongban/shuxue/19384/ ; 范文派 小动物排队, https://www.fanwenpai.com/jiaoxue/jiaoan/666942.html .
- "你是怎么知道的？你是从哪边开始数的？" — the **guiding question** that makes the child do the counting. Source: 屈老师《数字排队1-6》, https://www.qulaoshi.com/zhongban/shuxue/41703/ .
- Closing recap as a shared rule, not a list: **"排在最前面的是第一，接下来是第二……还学会了从左往右数。"** Source: credit189 小动物排队序数, http://yxzw.credit189.com/jiaoan/1255652.html .

**The five register markers every one of these shares (and ours lacks):**
1. **First-person-plural invitation** — 我们一起来…，好不好？ (never "我们来分六").
2. **A look/point hook** — 看！/ 你瞧 / 谁来了 — orienting the child before the content.
3. **Guiding question that hands the work to the child** — 你发现了什么？/ 你是从哪边数的？/ 谁来告诉我？
4. **The reverse/insight stated as a small discovery**, with its own words — 反过来…/ 抱在一起又变回… — not a cloned mirror clause.
5. **Per-instance variation + a touch of play** — each split or each animal gets a slightly different little frame; affect words 呀/啦/啦 carry warmth.

---

## 4. Proposed fix (generalizes across all lessons + topics)

### 4.1 Owning location

**Primary: a new short skill `lesson-teacher-voice` (Wave 2b companion), authored as a persona + register spec that `lesson-audio-captions` MUST consult before finalizing `narration`.** Reasons it is its own skill, not just a paragraph inside audio-captions:
- It is a distinct *axis* (manner of speech), co-equal with length/completeness/ASR — bundling it inside the length-and-completeness skill is exactly how it got starved.
- It must be readable by the **pi production executor** too; a named skill file is the unit both the Claude Workflow and `pi-runner/extract.mjs` carry (per CLAUDE.md "Workflow is ground truth").
- A persona spec is reusable verbatim across every topic; the fact/length rules are per-cue.

**Wiring (one line each, minimal):**
- `lesson-audio-captions/SKILL.md`: add a required step "Run every `narration` line through `lesson-teacher-voice` before finalizing; a line that is complete + on-budget but flat/书面语 is **not done**." Add a teacher-voice item to the read-aloud self-check (`:57`) and the Report-back (`:102`).
- Replace the *template* exemplars at `:49-51` with **warm, complete** exemplars (kills the stamp at its source — see 2.3).
- `lesson-pedagogy` and `lesson-storyboard`: no rule change; add one pointer that the *manner* is owned by `lesson-teacher-voice` at Wave 2b (so upstream stays intent-only).
- `lesson-build.js`: the Wave 2b node prompt references the new skill (auto-flows to pi).

### 4.2 What the new skill encodes (topic-agnostic principles)

A **persona** (a warm, named, patient kindergarten-teacher voice — e.g. a default "X 老师" the brief can override per lesson via a `**Teacher.** <persona-id|default>` field, mirroring `**Style.**`) plus **five register laws**, each lifted from §3 and stated as topic-agnostic transforms:

1. **Speak TO the child, not AT the content.** Default to 我们一起… / 你看… / 你试试… Lead with an invitation or a look-hook, not a procedure announcement. (Freddish rule 1–2; CDS second-person.)
2. **Hand the thinking to the child with a guiding question** at least once per teaching arc — 你发现了什么？/ 你是怎么知道的？/ 谁来告诉我？ — never only flat declaratives. (Elicit-and-extend; 凯叔 guiding-question reflex.)
3. **State the reverse / the insight in its own warm words**, never a cloned mirror clause. The 合 after a 分 is a little "变回来" discovery, not a stamped second sentence. (Authentic 教案 "反过来…".)
4. **Vary every repeated beat** — co-equal repeats get distinct little frames + light play particles (呀/啦/吧); identical-template-×N is a defect flagged by name. (Sesame "scene first"; 凯叔 per-scene craft.) **This is the explicit anti-stamp law.**
5. **Stay concrete and positive; anticipate the literal ear.** Short utterances, no abstract framing ("每个位置都有名字" → "每个小动物都站在自己的位置上"), no 书面语 connectives a 6-year-old wouldn't say. (Freddish 1–4; CDS concreteness.)

**Orthogonality guard (so we don't regress):** the skill states up front that **warmth never licenses dropping a term the relation binds** (completeness, `audio-captions:45`) and **never re-introduces an in-text ellipsis/drone or a baked pause** (`audio-captions:73`); a line must be warm *and* complete *and* ASR-safe *and* on-budget. Play particles add ~0 chars and don't move the length budget.

**Verification = human ear (per CLAUDE.md skill-system stewardship).** The skill's own self-check is the read-aloud test from a *teacher's* mouth: "would a real 幼儿园 teacher say this to one child?" The human is the eye; no reward-hackable test.

### 4.3 Why this generalizes and won't hard-code

The skill encodes *transforms and a persona*, never a topic phrasing. It contains **no** 分与合 or 第几 string as a rule — those appear only as *illustrative* before/after pairs (clearly marked e.g., like `lesson-audio-captions` already does). Any future lesson (counting, pinyin, English greetings, shapes) runs the same five laws through its own content. This is the same shape as our existing `**Style.**` overlay: a reusable manner, per-lesson copy.

---

## 5. Sample rewrites (THE CENTERPIECE — react to these)

Each "after" obeys the same cue's pedagogy + completeness + ASR-safety, fits a similar length (≤ ~0.30s/char, ≤6.5s clip), and adds the missing teacher warmth. Play particles 呀/啦/吧 cost ~0 ASR tokens.

### kptest-fenyuhe-six (6的分与合)

| cue | BEFORE (robotic) | AFTER (warm teacher) | why |
|---|---|---|---|
| routine-reprise | 六的分与合。和五的分与合一样，我们来分六。 | **今天我们一起来分一分6，就像上次分5那样，好不好？** | invitation + 好不好 hook; "分一分" is natural; drops the书面语 "我们来分六" (laws 1, 5). |
| split-1-and-5 (split half) | 六可以分成一和五。 | **你看，6可以分成1和5——** | look-hook + same complete clause (law 1; completeness kept). |
| split-1-and-5 (合 half) | 一和五合成六。 | **那1和5抱在一起，又变回6啦！** | reverse stated as a *discovery* in its own words, not a clone; 抱在一起/变回 is concrete + warm (law 3). |
| split-2-and-4 | 六可以分成二和四。二和四合成六。 | **再看，6还可以这样分：2和4。2和4手拉手，还是6！** | "再看…还可以这样分" varies the frame so it's not a stamp; different verb image (手拉手) from the 1和5 line (law 4). |
| split-3-and-3 (highlight) | 六可以分成三和三。三和三合成六。 | **这次最特别啦——6正好分成一样多的3和3！3和3合起来，又是6。** | the equal-split highlight gets genuine affect ("最特别"); "一样多" lets the symmetry be felt without pre-naming "equal" as a leak; still complete (law 4 + highlight). |
| aggregator-prompt | 六可以分成几和几？ | **那现在，谁来告诉我——6可以分成几和几呀？** | turns a bare quiz into a warm guiding question handed to the child (law 2). |
| recap | 一和五。二和四。三和三。它们合起来，都是六。 | **我们一起数：1和5、2和4、3和3——它们呀，合起来都是6！** | "我们一起数" + 呀 makes the recap a shared chant, not a list read; the binding whole is kept (law 1 + completeness). |

### kptest-first-second-third (序数 第一/第二/第三)

| cue | BEFORE (robotic) | AFTER (warm teacher) | why |
|---|---|---|---|
| intro | 队里，每个位置都有名字。 | **小动物们要排队啦！排队的时候呀，每个位置都有自己的名字。** | concrete moment + 啦/呀 instead of abstract declarative (laws 1, 5). |
| arrive-first | 看，第一个小动物来了，站在最前面。 | **看，第一个小伙伴来啦！它呀，站在最前面。** | already had "看"; add warmth + 小伙伴/啦 (law 1). |
| name-first | 站在最前面——排第一。 | **站在最前面的，我们就说它——排第一！** | "我们就说它" frames the naming as something *we* do together, not a label stamped (law 1). |
| count-second | 从前面数——第一，第二。这只小动物排第二。 | **我们从前面数一数：第一、第二。数到啦——它排第二！** | "我们…数一数" invitation + "数到啦" makes the answer a little reveal, not a flat label (laws 1, 3). |
| ask-second | 谁排第二？ | **猜猜看，谁排第二呀？** | bare quiz → guiding question with 猜猜看 (law 2). |
| reveal-second | 是这只！它排第二。 | **就是它呀！数一数，它排第二，对不对？** | "对不对" invites the child to confirm — elicit-and-extend (law 2). |
| recap-count | 第一。第二。第三。 | **跟我一起，从前面数：第一、第二、第三！** | (recap-invite already warm) — the count itself framed as "跟我一起" chant (law 4 togetherness). |

**Note for discussion.** A few "after" lines are 1–3 chars longer; all stay within the same cue's `maxClipSeconds` 6.5 and within ±20% of budget (the particles 呀/啦 are sub-syllable in spoken Aoede). If any runs long at W3a, the persona is preserved by trimming a frame word, not by reverting to书面语.

---

## 6. Recommended next step

If approved: encode §4 as the new `lesson-teacher-voice` skill + the four one-line wirings via the `hermes-skill-system` skill (one atomic, revertible `skillsys(lesson-teacher-voice): …` commit), replacing the template exemplars at `lesson-audio-captions/SKILL.md:49-51` in the same change, then re-run Wave 2b clean-room on both lessons (pi or Workflow) and read the new `script-cues.json` aloud as the human eye. Do **not** patch the two lessons by hand — that fixes two scripts and leaves the gap.
