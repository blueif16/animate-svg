import type { AlignedLessonCue } from "@studio/narration-kit";

export const kp2v2CountingByTensAlignedDuration = 764;

export const kp2v2CountingByTensAlignedCues = [
  {
    "asrText": "我 们 一 根 一 根 的 数 十 根 走 了 十 步 这 十 根 捆",
    "caption": "我们一根一根地数 …… 十根，走了十步。",
    "confidence": "asr-derived",
    "endFrame": 209,
    "endSeconds": 6.97,
    "id": "loose-count-felt",
    "matchScore": 0.963,
    "matchText": "我 们 一 根 一 根 的 数 十 根 走 了 十 步",
    "phrase": "我们一根一根地数十根走了十步",
    "startFrame": 8,
    "startSeconds": 0.25,
    "targetTokens": [
      "我",
      "们",
      "一",
      "根",
      "一",
      "根",
      "地",
      "数",
      "十",
      "根",
      "走",
      "了",
      "十",
      "步"
    ]
  },
  {
    "asrText": "走 了 十 步 这 十 根 捆 成 一 捆 是 一 个 十 再 来 一 捆",
    "caption": "这十根，捆成一捆，就是一个十。",
    "confidence": "asr-derived",
    "endFrame": 334,
    "endSeconds": 11.12,
    "id": "bundle-is-one-count",
    "matchScore": 0.935,
    "matchText": "这 十 根 捆 成 一 捆 是 一 个 十",
    "phrase": "这十根捆成一捆就是一个十",
    "startFrame": 218,
    "startSeconds": 7.25,
    "targetTokens": [
      "这",
      "十",
      "根",
      "捆",
      "成",
      "一",
      "捆",
      "就",
      "是",
      "一",
      "个",
      "十"
    ]
  },
  {
    "asrText": "是 一 个 十 再 来 一 捆 就 是 两 个 十 再 加 一 捆",
    "caption": "再来一捆，就是两个十。",
    "confidence": "asr-derived",
    "endFrame": 449,
    "endSeconds": 14.97,
    "id": "tens-count-like-ones",
    "matchScore": 1.0,
    "matchText": "再 来 一 捆 就 是 两 个 十",
    "phrase": "再来一捆就是两个十",
    "startFrame": 362,
    "startSeconds": 12.05,
    "targetTokens": [
      "再",
      "来",
      "一",
      "捆",
      "就",
      "是",
      "两",
      "个",
      "十"
    ]
  },
  {
    "asrText": "是 两 个 十 再 加 一 捆 就 是 三 个 十 数 一 要 走",
    "caption": "再加一捆，就是三个十。",
    "confidence": "asr-derived",
    "endFrame": 554,
    "endSeconds": 18.47,
    "id": "pattern-holds",
    "matchScore": 1.0,
    "matchText": "再 加 一 捆 就 是 三 个 十",
    "phrase": "再加一捆就是三个十",
    "startFrame": 477,
    "startSeconds": 15.9,
    "targetTokens": [
      "再",
      "加",
      "一",
      "捆",
      "就",
      "是",
      "三",
      "个",
      "十"
    ]
  },
  {
    "asrText": "是 三 个 十 数 一 要 走 十 步 属 实 制 奏 三 步",
    "caption": "数一，要走十步；数十，只走三步。",
    "confidence": "asr-derived",
    "emphasis": true,
    "endFrame": 746,
    "endSeconds": 24.87,
    "id": "tens-are-the-faster-way",
    "matchScore": 0.826,
    "matchText": "数 一 要 走 十 步 属 实 制 奏 三 步",
    "phrase": "数一要走十步数十只走三步",
    "startFrame": 584,
    "startSeconds": 19.45,
    "targetTokens": [
      "数",
      "一",
      "要",
      "走",
      "十",
      "步",
      "数",
      "十",
      "只",
      "走",
      "三",
      "步"
    ]
  }
] satisfies AlignedLessonCue[];
