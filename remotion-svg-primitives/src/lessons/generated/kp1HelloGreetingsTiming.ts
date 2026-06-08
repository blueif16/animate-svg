import type { AlignedLessonCue } from "@studio/narration-kit";

export const kp1HelloGreetingsAlignedDuration = 736;

export const kp1HelloGreetingsAlignedCues = [
  {
    "asrText": "今 天 我 们 学 三 句 英 语 看 他 们 见",
    "caption": "今天，我们学三句英语。",
    "confidence": "asr-derived",
    "endFrame": 94,
    "endSeconds": 3.12,
    "id": "intro",
    "matchScore": 1.0,
    "matchText": "今 天 我 们 学 三 句 英 语",
    "phrase": "今天我们学三句英语",
    "startFrame": 8,
    "startSeconds": 0.25,
    "targetTokens": [
      "今",
      "天",
      "我",
      "们",
      "学",
      "三",
      "句",
      "英",
      "语"
    ]
  },
  {
    "asrText": "三 句 英 语 看 他 们 见 面 打 招 呼 hello 现 在 sil 轮",
    "caption": "看，他们见面，打招呼：Hello！",
    "confidence": "asr-derived",
    "endFrame": 238,
    "endSeconds": 7.92,
    "id": "meet-hello",
    "matchScore": 1.0,
    "matchText": "看 他 们 见 面 打 招 呼 hello",
    "phrase": "看他们见面打招呼 Hello",
    "startFrame": 122,
    "startSeconds": 4.05,
    "targetTokens": [
      "看",
      "他",
      "们",
      "见",
      "面",
      "打",
      "招",
      "呼",
      "hello"
    ]
  },
  {
    "asrText": "打 招 呼 hello 现 在 sil 轮 到 自 我 介 绍 im sam 时 间 到 了",
    "caption": "现在，轮到自我介绍：I'm Sam。",
    "confidence": "asr-derived",
    "emphasis": true,
    "endFrame": 382,
    "endSeconds": 12.72,
    "id": "intro-self",
    "matchScore": 0.878,
    "matchText": "现 在 sil 轮 到 自 我 介 绍 im sam",
    "phrase": "现在轮到自我介绍 I'm Sam",
    "startFrame": 266,
    "startSeconds": 8.85,
    "targetTokens": [
      "现",
      "在",
      "轮",
      "到",
      "自",
      "我",
      "介",
      "绍",
      "i'm",
      "sam"
    ]
  },
  {
    "asrText": "介 绍 im sam 时 间 到 了 该 说 再 见 goodby goodbye 见 面 说",
    "caption": "时间到了，该说再见：Goodbye！",
    "confidence": "asr-derived",
    "endFrame": 506,
    "endSeconds": 16.87,
    "id": "part-goodbye",
    "matchScore": 0.978,
    "matchText": "时 间 到 了 该 说 再 见 goodby",
    "phrase": "时间到了该说再见 Goodbye",
    "startFrame": 410,
    "startSeconds": 13.65,
    "targetTokens": [
      "时",
      "间",
      "到",
      "了",
      "该",
      "说",
      "再",
      "见",
      "goodbye"
    ]
  },
  {
    "asrText": "再 见 goodby goodbye 见 面 说 hello 介 绍 说 im 再 见 说 good",
    "caption": "见面说 Hello。介绍说 I'm。再见说 Goodbye。",
    "confidence": "asr-derived",
    "emphasis": true,
    "endFrame": 718,
    "endSeconds": 23.92,
    "id": "recap",
    "matchScore": 0.939,
    "matchText": "见 面 说 hello 介 绍 说 im 再 见 说 good",
    "phrase": "见面说 Hello 介绍说 I'm 再见说 Goodbye",
    "startFrame": 536,
    "startSeconds": 17.85,
    "targetTokens": [
      "见",
      "面",
      "说",
      "hello",
      "介",
      "绍",
      "说",
      "i'm",
      "再",
      "见",
      "说",
      "goodbye"
    ]
  }
] satisfies AlignedLessonCue[];
