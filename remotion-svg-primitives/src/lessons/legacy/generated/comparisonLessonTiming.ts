import type { AlignedLessonCue } from "../../timingTypes";

export const comparisonLessonAlignedDuration = 457;

export const comparisonLessonAlignedCues = [
  {
    "asrText": "我 们 来 比 一 比 左 边 有 五",
    "caption": "我们来比一比。",
    "confidence": "asr-derived",
    "endFrame": 55,
    "endSeconds": 1.82,
    "id": "opening",
    "matchScore": 1.0,
    "matchText": "我 们 来 比 一 比",
    "phrase": "我们来比一比",
    "startFrame": 8,
    "startSeconds": 0.25,
    "targetTokens": [
      "我",
      "们",
      "来",
      "比",
      "一",
      "比"
    ]
  },
  {
    "asrText": "来 比 一 比 左 边 有 五 个 星 星 右 边 有 三",
    "caption": "左边有五个星星，",
    "confidence": "asr-derived",
    "endFrame": 122,
    "endSeconds": 4.07,
    "id": "left-five",
    "matchScore": 1.0,
    "matchText": "左 边 有 五 个 星 星",
    "phrase": "左边有五个星星",
    "startFrame": 74,
    "startSeconds": 2.45,
    "targetTokens": [
      "左",
      "边",
      "有",
      "五",
      "个",
      "星",
      "星"
    ]
  },
  {
    "asrText": "五 个 星 星 右 边 有 三 个 积 木 先 一 一 配",
    "caption": "右边有三个积木。",
    "confidence": "asr-derived",
    "endFrame": 199,
    "endSeconds": 6.62,
    "id": "right-three",
    "matchScore": 1.0,
    "matchText": "右 边 有 三 个 积 木",
    "phrase": "右边有三个积木",
    "startFrame": 141,
    "startSeconds": 4.7,
    "targetTokens": [
      "右",
      "边",
      "有",
      "三",
      "个",
      "积",
      "木"
    ]
  },
  {
    "asrText": "三 个 积 木 先 一 一 配 对 配 完 以 后",
    "caption": "先一一配对。",
    "confidence": "asr-derived",
    "emphasis": true,
    "endFrame": 257,
    "endSeconds": 8.57,
    "id": "pairing",
    "matchScore": 1.0,
    "matchText": "先 一 一 配 对",
    "phrase": "先一一配对",
    "startFrame": 228,
    "startSeconds": 7.6,
    "targetTokens": [
      "先",
      "一",
      "一",
      "配",
      "对"
    ]
  },
  {
    "asrText": "一 一 配 对 配 完 以 后 左 边 还 剩 两 个 所 以 五 大",
    "caption": "配完以后，左边还剩两个。",
    "confidence": "asr-derived",
    "endFrame": 353,
    "endSeconds": 11.77,
    "id": "leftover",
    "matchScore": 1.0,
    "matchText": "配 完 以 后 左 边 还 剩 两 个",
    "phrase": "配完以后左边还剩两个",
    "startFrame": 276,
    "startSeconds": 9.2,
    "targetTokens": [
      "配",
      "完",
      "以",
      "后",
      "左",
      "边",
      "还",
      "剩",
      "两",
      "个"
    ]
  },
  {
    "asrText": "还 剩 两 个 所 以 五 大 于 三",
    "caption": "所以，五大于三。",
    "confidence": "asr-derived",
    "emphasis": true,
    "endFrame": 439,
    "endSeconds": 14.62,
    "id": "result",
    "matchScore": 1.0,
    "matchText": "所 以 五 大 于 三",
    "phrase": "所以五大于三",
    "startFrame": 372,
    "startSeconds": 12.4,
    "targetTokens": [
      "所",
      "以",
      "五",
      "大",
      "于",
      "三"
    ]
  }
] satisfies AlignedLessonCue[];
