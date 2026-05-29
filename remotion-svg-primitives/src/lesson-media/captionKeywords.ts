import type { AlignedLessonCue } from "@studio/narration-kit";

// Redundancy principle (Mayer, Cognitive Theory of Multimedia Learning): when
// graphics carry the meaning, on-screen TEXT that duplicates the spoken
// narration verbatim splits the learner's visual attention and adds extraneous
// load. Our captions historically defaulted to the full narration sentence
// (script-cues `caption` === narration), which the verification redundancy gate
// flags at jaccard 1.0. This helper replaces each cue's `caption` with a short
// authored KEYWORD anchor where the lesson provides one.
//
// LESSON-AGNOSTIC. The lesson supplies a per-cue-id keyword map; cues absent
// from the map keep their full caption. Literacy / pinyin lessons (where the
// on-screen syllable IS the lesson, not a redundant gloss) simply pass no map,
// or omit the cues that must show full text.
//
// AUDIO-FROZEN-SAFE. This only rewrites the on-screen caption string. It never
// touches the voice WAV, the ASR `phrase`, or cue timing — the spoken narration
// is unchanged. Apply it to the RECONCILED cue list so the keyword flows to
// every downstream consumer (caption layer AND the bbox-manifest cues the
// verification gate reads), keeping them consistent.
//
// AUTHORING NOTE. In the full pipeline the keyword is the Wave-2b
// audio/captions author's job (one short anchor per cue, pedagogy-reviewed).
// A map hand-authored at the timeline level is provisional until that wave
// owns it.

export type CaptionKeywordMap = Record<string, string>;

export const withCaptionKeywords = <Cue extends AlignedLessonCue>(
  cues: readonly Cue[],
  keywords: CaptionKeywordMap,
): Cue[] =>
  cues.map((cue) =>
    keywords[cue.id] ? { ...cue, caption: keywords[cue.id] } : cue,
  );
