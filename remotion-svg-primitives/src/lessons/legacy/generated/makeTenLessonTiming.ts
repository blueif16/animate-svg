import type { AlignedLessonCue } from "../../timingTypes";

export const makeTenLessonAlignedDuration = 496;

export const makeTenLessonAlignedCues = [
  {
    "asrText": "今 天 我 们 来 凑 时 放 六 个 看",
    "caption": "今天我们来凑十。",
    "confidence": "asr-derived",
    "endFrame": 54,
    "endSeconds": 1.8,
    "id": "opening",
    "matchScore": 0.923,
    "matchText": "今 天 我 们 来 凑 时",
    "phrase": "今天我们来凑十",
    "startFrame": 8,
    "startSeconds": 0.25,
    "targetTokens": [
      "今",
      "天",
      "我",
      "们",
      "来",
      "凑",
      "十"
    ]
  },
  {
    "asrText": "我 们 来 凑 时 放 六 个 看 看 还 空",
    "caption": "先放六个。",
    "confidence": "asr-derived",
    "endFrame": 103,
    "endSeconds": 3.42,
    "id": "show-six",
    "matchScore": 0.857,
    "matchText": "时 放 六 个",
    "phrase": "先放六个",
    "startFrame": 56,
    "startSeconds": 1.85,
    "targetTokens": [
      "先",
      "放",
      "六",
      "个"
    ]
  },
  {
    "asrText": "时 放 六 个 看 看 还 空 着 四 个 格 子 我 把 四 个",
    "caption": "看看，还空着四个格子。",
    "confidence": "asr-derived",
    "endFrame": 190,
    "endSeconds": 6.32,
    "id": "find-four",
    "matchScore": 1.0,
    "matchText": "看 看 还 空 着 四 个 格 子",
    "phrase": "看看还空着四个格子",
    "startFrame": 122,
    "startSeconds": 4.05,
    "targetTokens": [
      "看",
      "看",
      "还",
      "空",
      "着",
      "四",
      "个",
      "格",
      "子"
    ]
  },
  {
    "asrText": "四 个 格 子 我 把 四 个 放 进 去 六 和 四 合",
    "caption": "我们把四个放进去。",
    "confidence": "asr-derived",
    "endFrame": 257,
    "endSeconds": 8.57,
    "id": "add-four",
    "matchScore": 0.909,
    "matchText": "我 把 四 个 放 进 去",
    "phrase": "我们把四个放进去",
    "startFrame": 208,
    "startSeconds": 6.95,
    "targetTokens": [
      "我",
      "们",
      "把",
      "四",
      "个",
      "放",
      "进",
      "去"
    ]
  },
  {
    "asrText": "个 放 进 去 六 和 四 合 起 来 正 好 是 十 所 以 六 加",
    "caption": "六和四合起来，正好是十。",
    "confidence": "asr-derived",
    "emphasis": true,
    "endFrame": 371,
    "endSeconds": 12.37,
    "id": "make-ten",
    "matchScore": 1.0,
    "matchText": "六 和 四 合 起 来 正 好 是 十",
    "phrase": "六和四合起来正好是十",
    "startFrame": 285,
    "startSeconds": 9.5,
    "targetTokens": [
      "六",
      "和",
      "四",
      "合",
      "起",
      "来",
      "正",
      "好",
      "是",
      "十"
    ]
  },
  {
    "asrText": "正 好 是 十 所 以 六 加 四 等 于 十",
    "caption": "所以，六加四等于十。",
    "confidence": "asr-derived",
    "emphasis": true,
    "endFrame": 478,
    "endSeconds": 15.92,
    "id": "equation",
    "matchScore": 1.0,
    "matchText": "所 以 六 加 四 等 于 十",
    "phrase": "所以六加四等于十",
    "startFrame": 381,
    "startSeconds": 12.7,
    "targetTokens": [
      "所",
      "以",
      "六",
      "加",
      "四",
      "等",
      "于",
      "十"
    ]
  }
] satisfies AlignedLessonCue[];
