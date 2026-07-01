import type { AlignedLessonCue } from "@studio/narration-kit";

export const kptestCountToTwoAlignedDuration = 467;

export const kptestCountToTwoAlignedCues = [
  {
    "asrText": "我 们 一 起 数 到 二 吧 你 看 一 个",
    "caption": "我们一起数到二吧。",
    "confidence": "asr-derived",
    "endFrame": 83,
    "endSeconds": 2.77,
    "id": "announce-topic",
    "matchScore": 1.0,
    "matchText": "我 们 一 起 数 到 二 吧",
    "phrase": "我们一起数到二吧",
    "startFrame": 8,
    "startSeconds": 0.25,
    "targetTokens": [
      "我",
      "们",
      "一",
      "起",
      "数",
      "到",
      "二",
      "吧"
    ],
    "tokenEndIndex": 7
  },
  {
    "asrText": "数 到 二 吧 你 看 一 个 苹 果 来 了 一 再 来 一 个 苹 果 二 看 一 看 这",
    "caption": "你看，一个苹果来了——一；再来一个苹果——二。",
    "confidence": "asr-derived",
    "endFrame": 275,
    "endSeconds": 9.17,
    "id": "cue-1-count",
    "matchScore": 1.0,
    "matchText": "你 看 一 个 苹 果 来 了 一 再 来 一 个 苹 果 二",
    "phrase": "你看 一个苹果来了 一 再来一个苹果 二",
    "startFrame": 93,
    "startSeconds": 3.1,
    "targetTokens": [
      "你",
      "看",
      "一",
      "个",
      "苹",
      "果",
      "来",
      "了",
      "一",
      "再",
      "来",
      "一",
      "个",
      "苹",
      "果",
      "二"
    ],
    "tokenStartIndex": 8,
    "tokenEndIndex": 23
  },
  {
    "asrText": "个 苹 果 二 看 一 看 这 一 群 一 共 有 几 个 呢 一 共 二 个",
    "caption": "看一看这一群，一共有几个呢？——一共二个呀。",
    "confidence": "asr-derived",
    "endFrame": 449,
    "endSeconds": 14.97,
    "id": "cue-2-cardinality",
    "matchScore": 0.949,
    "matchText": "看 一 看 这 一 群 一 共 有 几 个 呢 一 共 二 个",
    "phrase": "看一看这一群 一共有几个呢 一共二个呀",
    "startFrame": 285,
    "startSeconds": 9.5,
    "targetTokens": [
      "看",
      "一",
      "看",
      "这",
      "一",
      "群",
      "一",
      "共",
      "有",
      "几",
      "个",
      "呢",
      "一",
      "共",
      "二",
      "个",
      "呀"
    ],
    "tokenStartIndex": 24,
    "tokenEndIndex": 39
  }
] satisfies AlignedLessonCue[];
