import type { AlignedLessonCue } from "@studio/narration-kit";

export const kp2CountingByTensAlignedDuration = 793;

export const kp2CountingByTensAlignedCues = [
  {
    "asrText": "看 这 是 我 们 的 一 个 十 把 它 打 开",
    "caption": "看，这是我们的一个十。",
    "confidence": "asr-derived",
    "endFrame": 113,
    "endSeconds": 3.77,
    "id": "bundle-recall",
    "matchScore": 1.0,
    "matchText": "看 这 是 我 们 的 一 个 十",
    "phrase": "看这是我们的一个十",
    "startFrame": 16,
    "startSeconds": 0.55,
    "targetTokens": [
      "看",
      "这",
      "是",
      "我",
      "们",
      "的",
      "一",
      "个",
      "十"
    ]
  },
  {
    "asrText": "的 一 个 十 把 它 打 开 里 面 有 十 根 一 根 一 根",
    "caption": "把它打开，里面有十根。",
    "confidence": "asr-derived",
    "endFrame": 218,
    "endSeconds": 7.27,
    "id": "untie-reveal",
    "matchScore": 1.0,
    "matchText": "把 它 打 开 里 面 有 十 根",
    "phrase": "把它打开里面有十根",
    "startFrame": 122,
    "startSeconds": 4.05,
    "targetTokens": [
      "把",
      "它",
      "打",
      "开",
      "里",
      "面",
      "有",
      "十",
      "根"
    ]
  },
  {
    "asrText": "面 有 十 根 一 根 一 根 的 数 要 数 十 次 捆 起 来 只",
    "caption": "一根一根地数，要数十次。",
    "confidence": "asr-derived",
    "endFrame": 343,
    "endSeconds": 11.42,
    "id": "slow-count-ones",
    "matchScore": 0.947,
    "matchText": "一 根 一 根 的 数 要 数 十 次",
    "phrase": "一根一根地数要数十次",
    "startFrame": 237,
    "startSeconds": 7.9,
    "targetTokens": [
      "一",
      "根",
      "一",
      "根",
      "地",
      "数",
      "要",
      "数",
      "十",
      "次"
    ]
  },
  {
    "asrText": "要 数 十 次 捆 起 来 只 要 数 一 次 加 一 捆 就",
    "caption": "捆起来，只要数一次。",
    "confidence": "asr-derived",
    "emphasis": true,
    "endFrame": 458,
    "endSeconds": 15.27,
    "id": "fast-vs-slow",
    "matchScore": 1.0,
    "matchText": "捆 起 来 只 要 数 一 次",
    "phrase": "捆起来只要数一次",
    "startFrame": 372,
    "startSeconds": 12.4,
    "targetTokens": [
      "捆",
      "起",
      "来",
      "只",
      "要",
      "数",
      "一",
      "次"
    ]
  },
  {
    "asrText": "再 加 一 捆 就 是 两 个 十",
    "caption": "再加一捆，就是两个十。",
    "confidence": "asr-derived",
    "endFrame": 558,
    "endSeconds": 18.6,
    "id": "two-tens",
    "matchScore": 0.941,
    "matchText": "再 加 一 捆 就 是 两 个 十",
    "phrase": "再加一捆就是两个十",
    "startFrame": 467,
    "startSeconds": 15.58,
    "targetTokens": [
      "再",
      "加",
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
    "asrText": "是 两 个 十 再 加 一 捆 就 是 三 个 十 一 捆 一 捆",
    "caption": "再加一捆，就是三个十。",
    "confidence": "asr-derived",
    "endFrame": 679,
    "endSeconds": 22.62,
    "id": "three-tens",
    "matchScore": 1.0,
    "matchText": "再 加 一 捆 就 是 三 个 十",
    "phrase": "再加一捆就是三个十",
    "startFrame": 592,
    "startSeconds": 19.75,
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
    "asrText": "是 三 个 十 一 捆 一 捆 的 数 更 快",
    "caption": "一捆一捆地数，更快。",
    "confidence": "asr-derived",
    "emphasis": true,
    "endFrame": 775,
    "endSeconds": 25.82,
    "id": "recap",
    "matchScore": 0.933,
    "matchText": "一 捆 一 捆 的 数 更 快",
    "phrase": "一捆一捆地数更快",
    "startFrame": 698,
    "startSeconds": 23.25,
    "targetTokens": [
      "一",
      "捆",
      "一",
      "捆",
      "地",
      "数",
      "更",
      "快"
    ]
  }
] satisfies AlignedLessonCue[];
