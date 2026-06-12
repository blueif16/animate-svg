import type { AlignedLessonCue } from "@studio/narration-kit";

export const kptestWhatsYourNameAlignedDuration = 389;

export const kptestWhatsYourNameAlignedCues = [
  {
    "asrText": "听 他 在 问 名 字 说 自 己 的",
    "caption": "听，他在问名字",
    "confidence": "asr-derived",
    "emphasis": true,
    "endFrame": 74,
    "endSeconds": 2.47,
    "id": "ask",
    "matchScore": 1.0,
    "matchText": "他 在 问 名 字",
    "phrase": "他在问名字",
    "startFrame": 45,
    "startSeconds": 1.5,
    "targetTokens": [
      "他",
      "在",
      "问",
      "名",
      "字"
    ]
  },
  {
    "asrText": "在 问 名 字 说 自 己 的 名 字 现 在 轮 到",
    "caption": "说自己的名字",
    "confidence": "asr-derived",
    "emphasis": true,
    "endFrame": 142,
    "endSeconds": 4.72,
    "id": "answer",
    "matchScore": 1.0,
    "matchText": "说 自 己 的 名 字",
    "phrase": "说自己的名字",
    "startFrame": 84,
    "startSeconds": 2.8,
    "targetTokens": [
      "说",
      "自",
      "己",
      "的",
      "名",
      "字"
    ]
  },
  {
    "asrText": "己 的 名 字 现 在 轮 到 你 问 啦 sil 现 在",
    "caption": "现在轮到你问",
    "confidence": "asr-derived",
    "endFrame": 209,
    "endSeconds": 6.97,
    "id": "ask‑swap",
    "matchScore": 1.0,
    "matchText": "现 在 轮 到 你 问",
    "phrase": "现在轮到你问",
    "startFrame": 160,
    "startSeconds": 5.35,
    "targetTokens": [
      "现",
      "在",
      "轮",
      "到",
      "你",
      "问"
    ]
  },
  {
    "asrText": "你 问 啦 sil 现 在 轮 到 你 答 了 s sil 这",
    "caption": "现在轮到你答",
    "confidence": "asr-derived",
    "endFrame": 275,
    "endSeconds": 9.17,
    "id": "answer‑swap",
    "matchScore": 1.0,
    "matchText": "现 在 轮 到 你 答",
    "phrase": "现在轮到你答",
    "startFrame": 228,
    "startSeconds": 7.6,
    "targetTokens": [
      "现",
      "在",
      "轮",
      "到",
      "你",
      "答"
    ]
  },
  {
    "asrText": "答 了 s sil 这 样 问 答 s sil 认 识 朋 友",
    "caption": "这样问答认识朋友",
    "confidence": "asr-derived",
    "endFrame": 371,
    "endSeconds": 12.37,
    "id": "recap",
    "matchScore": 0.793,
    "matchText": "这 样 问 答 s sil 认 识 朋 友",
    "phrase": "这样问答认识朋友",
    "startFrame": 285,
    "startSeconds": 9.5,
    "targetTokens": [
      "这",
      "样",
      "问",
      "答",
      "认",
      "识",
      "朋",
      "友"
    ]
  }
] satisfies AlignedLessonCue[];
