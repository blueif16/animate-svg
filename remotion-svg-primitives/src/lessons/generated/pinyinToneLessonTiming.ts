import type { AlignedLessonCue } from "../timingTypes";

export const pinyinToneLessonAlignedDuration = 725;

export const pinyinToneLessonAlignedCues = [
  {
    "asrText": "今 天 我 们 来 听 拼 音 的 四 个 声 调 一 声 二 声",
    "caption": "今天我们来听拼音的四个声调。",
    "confidence": "asr-derived",
    "endFrame": 94,
    "endSeconds": 3.12,
    "id": "opening",
    "matchScore": 1.0,
    "matchText": "今 天 我 们 来 听 拼 音 的 四 个 声 调",
    "phrase": "今天我们来听拼音的四个声调",
    "startFrame": 8,
    "startSeconds": 0.25,
    "targetTokens": [
      "今",
      "天",
      "我",
      "们",
      "来",
      "听",
      "拼",
      "音",
      "的",
      "四",
      "个",
      "声",
      "调"
    ]
  },
  {
    "asrText": "四 个 声 调 一 声 二 声 三 声 先 低 再 起 来 马 四",
    "caption": "一声，声音平平的：mā。",
    "confidence": "asr-derived",
    "endFrame": 246,
    "endSeconds": 8.2,
    "id": "first-tone",
    "matchScore": 0.605,
    "matchText": "一 声 二 声 三 声 先 低 再",
    "phrase": "一声声音平平的妈",
    "startFrame": 122,
    "startSeconds": 4.05,
    "targetTokens": [
      "一",
      "声",
      "声",
      "音",
      "平",
      "平",
      "的",
      "妈"
    ]
  },
  {
    "asrText": "声 调 一 声 二 声 三 声 先 低 再 起 来 马 四 声 看",
    "caption": "二声，声音往上扬：má。",
    "confidence": "asr-derived",
    "endFrame": 379,
    "endSeconds": 12.65,
    "id": "second-tone",
    "matchScore": 0.605,
    "matchText": "二 声 三 声 先 低 再 起 来",
    "phrase": "二声声音往上扬麻",
    "startFrame": 248,
    "startSeconds": 8.25,
    "targetTokens": [
      "二",
      "声",
      "声",
      "音",
      "往",
      "上",
      "扬",
      "麻"
    ]
  },
  {
    "asrText": "一 声 二 声 三 声 先 低 再 起 来 马 四 声 看 声",
    "caption": "三声，先低再起来：mǎ。",
    "confidence": "asr-derived",
    "endFrame": 487,
    "endSeconds": 16.22,
    "id": "third-tone",
    "matchScore": 1.0,
    "matchText": "三 声 先 低 再 起 来 马",
    "phrase": "三声先低再起来马",
    "startFrame": 381,
    "startSeconds": 12.7,
    "targetTokens": [
      "三",
      "声",
      "先",
      "低",
      "再",
      "起",
      "来",
      "马"
    ]
  },
  {
    "asrText": "再 起 来 马 四 声 看 声 调 就 能 独 转 拼 音",
    "caption": "四声，声音往下落：mà。",
    "confidence": "asr-derived",
    "endFrame": 639,
    "endSeconds": 21.3,
    "id": "fourth-tone",
    "matchScore": 0.605,
    "matchText": "四 声 看 声 调 就 能 独 转",
    "phrase": "四声声音往下落骂",
    "startFrame": 506,
    "startSeconds": 16.85,
    "targetTokens": [
      "四",
      "声",
      "声",
      "音",
      "往",
      "下",
      "落",
      "骂"
    ]
  },
  {
    "asrText": "来 马 四 声 看 声 调 就 能 独 转 拼 音",
    "caption": "看声调，就能读准拼音。",
    "confidence": "asr-derived",
    "emphasis": true,
    "endFrame": 707,
    "endSeconds": 23.57,
    "id": "recap",
    "matchScore": 0.882,
    "matchText": "看 声 调 就 能 独 转 拼 音",
    "phrase": "看声调就能读准拼音",
    "startFrame": 640,
    "startSeconds": 21.35,
    "targetTokens": [
      "看",
      "声",
      "调",
      "就",
      "能",
      "读",
      "准",
      "拼",
      "音"
    ]
  }
] satisfies AlignedLessonCue[];
