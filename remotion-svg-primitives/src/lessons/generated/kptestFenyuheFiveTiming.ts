import type { AlignedLessonCue } from "@studio/narration-kit";

export const kptestFenyuheFiveAlignedDuration = 457;

export const kptestFenyuheFiveAlignedCues = [
  {
    "asrText": "一 看 着 和 二 现 在",
    "caption": "一和四",
    "confidence": "asr-derived",
    "endFrame": 34,
    "endSeconds": 1.15,
    "id": "cue-announce-topic-split-1of4",
    "matchScore": 0.6,
    "matchText": "一 看 着",
    "phrase": "一和四",
    "startFrame": 26,
    "startSeconds": 0.85,
    "targetTokens": [
      "一",
      "和",
      "四"
    ]
  },
  {
    "asrText": "一 看 着 和 二 现 在 合",
    "caption": "看着合",
    "confidence": "asr-derived",
    "endFrame": 54,
    "endSeconds": 1.8,
    "id": "cue-conserve-1of4",
    "matchScore": 0.8,
    "matchText": "看 着 和",
    "phrase": "看着合",
    "startFrame": 36,
    "startSeconds": 1.2,
    "targetTokens": [
      "看",
      "着",
      "合"
    ]
  },
  {
    "asrText": "一 看 着 和 二 现 在 合 成",
    "caption": "二和三",
    "confidence": "asr-derived",
    "endFrame": 111,
    "endSeconds": 3.7,
    "id": "cue-split-2of3",
    "matchScore": 0.6,
    "matchText": "着 和 二",
    "phrase": "二和三",
    "startFrame": 56,
    "startSeconds": 1.85,
    "targetTokens": [
      "二",
      "和",
      "三"
    ]
  },
  {
    "asrText": "看 着 和 二 现 在 合 成 一 个 圆",
    "caption": "现在合",
    "confidence": "asr-derived",
    "endFrame": 161,
    "endSeconds": 5.37,
    "id": "cue-conserve-2of3",
    "matchScore": 1.0,
    "matchText": "现 在 合",
    "phrase": "现在合",
    "startFrame": 112,
    "startSeconds": 3.75,
    "targetTokens": [
      "现",
      "在",
      "合"
    ]
  },
  {
    "asrText": "一 个 圆 圈 想 象 一 下 s",
    "caption": "想",
    "confidence": "asr-derived",
    "endFrame": 238,
    "endSeconds": 7.92,
    "id": "cue-learner-response-gap",
    "matchScore": 1.0,
    "matchText": "想",
    "phrase": "想",
    "startFrame": 228,
    "startSeconds": 7.6,
    "targetTokens": [
      "想"
    ]
  },
  {
    "asrText": "小 树 苗 sil 看 s",
    "caption": "看",
    "confidence": "asr-derived",
    "endFrame": 417,
    "endSeconds": 13.9,
    "id": "cue-reveal-answer",
    "matchScore": 1.0,
    "matchText": "看",
    "phrase": "看",
    "startFrame": 410,
    "startSeconds": 13.65,
    "targetTokens": [
      "看"
    ]
  },
  {
    "asrText": "小 树 苗 sil 看 s",
    "caption": "分合",
    "confidence": "asr-low-evidence",
    "endFrame": 439,
    "endSeconds": 14.62,
    "id": "cue-spaced-recap-both",
    "matchScore": 0.333,
    "matchText": "看 s",
    "phrase": "分合",
    "startFrame": 410,
    "startSeconds": 13.65,
    "targetTokens": [
      "分",
      "合"
    ]
  }
] satisfies AlignedLessonCue[];
