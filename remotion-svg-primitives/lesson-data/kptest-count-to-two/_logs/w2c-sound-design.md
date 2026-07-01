# w2c-sound-design — kptest-count-to-two

## INPUTS READ
- brief.md — topic = count-to-two math (ages 3–5, Mandarin medium); NOT a pinyin/tone-teaching lesson (narration voices 一/二 but they are near-known, not acquisition targets).
- pedagogy.md — lesson kind math-insight; §9 carve-out does NOT apply (no choral/echo/wait-time, no language-acquisition floors). Two cues: cue-1 (count action, one pass, no replay) and cue-2 (cardinality = the genuinely new idea; one delivery + one end-recall re-voiced total which IS the §6 reserved pulse). The single success beat = the cardinality reveal (group "2" bouncy-settle climax).
- visual-design.md — per-cue motion: announce-topic (title reads alone, then apples fade in under it), cue-1 (apple-1 lands + tag "1" pulse → apple-2 lands + tag "2" pulse, tags never both at once), cue-2 (quiet hold → tags migrate/merge → group "2" bouncy climax → brace stroke-on → end-recall pulse).
- LIBRARY INDEXES (read with read tool, not ls/glob):
  - _beds/_index.json — enumerated: math-calm-68-cmaj, literacy-playful-76, tone-safe-pad, celebration-resolve, kids-wonder-discovery, kids-story-calm, kids-counting-game, + promo-* (not kid-audience).
  - _sfx/_index.json — enumerated: pop, chime, whoosh, tick, ta-da, sparkle, bell-ding, woodblock-count, twinkle-reward, vox-*, plop-soft, etc.
  - _stings/_index.json — enumerated: mandarin-accent, soft-rise, sting-logo-impact, kids-outro-resolve, kids-section-lift, sting-section-riser-*, sting-outro-resolve.

## OUTPUTS WRITTEN
- audio-cues.json (bed + toneSafe + intro.sting + outro.resolve + sfx[]) — all keys resolve in the shared library indexes.

## KEY DECISIONS
- bed = `math-calm-68-cmaj`, toneSafe=false. Rationale: this is a number/math lesson per the skill's bed table (default math). The §9 tone-language guard is triggered ONLY by pinyin/tone-teaching (acquisition target); pedagogy explicitly carves this OUT (一/二 near-known, not acquired), so no flat-pad requirement and a melodic motif is permitted — BUT I placed none under narration anyway (see density).
- intro.sting = `mandarin-accent` — allowed for a Mandarin topic, sits over the topic-intro card before narration (mandarin-accent length 3.0s ≈ announce-topic 2.2s read + small tail).
- outro.resolve = true (default on); bed rises to full as last narration ends.
- SFX rows (5 total, ≤1 per beat, none over instruction narration):
  1. announce-topic / transition / `whoosh` — the ONE handoff from title card → apples entering (motivated by SectionHandoff- class title-clears-to-objects move).
  2. cue-1-count / popin / `pop` perStep — each apple lands via PopIn snap at its spoken count word.
  3. cue-1-count / count / `tick` perStep risingPitch=true — ordinal tag attaches synced to spoken 一/二; risingPitch ascends pitch across the counted set = auditory magnitude. `[ASSUMED]` — flagged for Wave 6 sanity-check (evidence-informed, not proven for counting specifically).
  4. cue-2-cardinality / transition / `whoosh` — the two per-object tags migrate/merge into one group "2" (the consolidation move; fen-he anchor migration = a section/handoff-class motion).
  5. cue-2-cardinality / reward / `ta-da` — THE single success beat, the bouncy-settle climax reveal of the group "2" (cardinality). ta-da at most ONCE per lesson; placed here, not at the end-recall pulse.
- NO SFX over instruction narration: I deliberately placed NO chime/sfx on (a) the cue-2 setup hold narration nor (d) the end-recall re-voiced total — both carry teaching voice, and per the hard rule reward/interaction sounds land in a narration GAP or after the line. The brace stroke-on (cue-2) was left silent to keep density at ≤1 motivated SFX on its beat (the ta-da already owns the climax beat).
- ZERO frames / offsets / durations in the manifest (semantic only; composer computes frames from cues[id].startFrame+offset).

## ISSUES
- None blocking. (See pipeline findings for the bed-choice ambiguity.)

## PIPELINE FINDINGS
- The skill's bed table gives "Number / math (default) → `math-calm-68-cmaj`", yet the shared library also exposes `kids-counting-game` which would tonally fit a counting lesson for ages 3–5. The table does not mention kids-audience beds (kids-wonder-discovery, kids-story-calm, kids-counting-game also exist). Suggest the skill table acknowledge the kids-targeted beds (or rank them) so sound-design can choose between the math-default and a kids-counting bed by rule rather than by feel. (I followed the table literally — math-calm-68-cmaj — but flag the ambiguity.)
- `risingPitch` (auditory magnitude on a counted set) is evidence-informed but not proven for counting; flagged `[ASSUMED]` for Wave 6. The skill already names this expectation, so no process change needed beyond Wave 6 honoring the flag.
