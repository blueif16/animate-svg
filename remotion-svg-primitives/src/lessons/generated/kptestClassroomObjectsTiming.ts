import type { AlignedLessonCue } from "@studio/narration-kit";

export const kptestClassroomObjectsAlignedDuration = 870;

export const kptestClassroomObjectsAlignedCues = [
  {
    "asrText": "pen pencle 吧 pen pencil 看 铅 笔 出 来 了 潘 跟 我 说",
    "caption": "pencil！\n看，铅笔出来了",
    "confidence": "asr-derived",
    "endFrame": 275,
    "endSeconds": 9.17,
    "id": "pencil-reveal",
    "matchScore": 1.0,
    "matchText": "pencil 看 铅 笔 出 来 了",
    "phrase": "pencil看铅笔出来了",
    "startFrame": 200,
    "startSeconds": 6.65,
    "targetTokens": [
      "pencil",
      "看",
      "铅",
      "笔",
      "出",
      "来",
      "了"
    ]
  },
  {
    "asrText": "出 来 了 潘 跟 我 说 一 下 盼 吧 盼 ru ruler 看",
    "caption": "跟我说一下：pencil吧",
    "confidence": "asr-derived",
    "endFrame": 382,
    "endSeconds": 12.72,
    "id": "pencil-invite-echo",
    "matchScore": 0.774,
    "matchText": "跟 我 说 一 下 盼 吧",
    "phrase": "跟我说一下pencil吧",
    "startFrame": 314,
    "startSeconds": 10.45,
    "targetTokens": [
      "跟",
      "我",
      "说",
      "一",
      "下",
      "pencil",
      "吧"
    ]
  },
  {
    "asrText": "跟 我 说 如 乐 看 尺 子 出 来 了 看 铅 笔 喷",
    "caption": "pencil！\n看，铅笔出来了",
    "confidence": "asr-derived",
    "endFrame": 620,
    "endSeconds": 20.65,
    "id": "pencil-replay",
    "matchScore": 0.645,
    "matchText": "乐 看 尺 子 出 来 了",
    "phrase": "pencil看铅笔出来了",
    "startFrame": 612,
    "startSeconds": 20.4,
    "targetTokens": [
      "pencil",
      "看",
      "铅",
      "笔",
      "出",
      "来",
      "了"
    ]
  },
  {
    "asrText": "跟 我 说 如 乐 看 尺 子 出 来 了 看 铅 笔 喷",
    "caption": "pen！\n看，钢笔出来了",
    "confidence": "asr-derived",
    "endFrame": 620,
    "endSeconds": 20.65,
    "id": "pen-reveal",
    "matchScore": 0.714,
    "matchText": "乐 看 尺 子 出 来 了",
    "phrase": "pen看钢笔出来了",
    "startFrame": 612,
    "startSeconds": 20.4,
    "targetTokens": [
      "pen",
      "看",
      "钢",
      "笔",
      "出",
      "来",
      "了"
    ]
  },
  {
    "asrText": "跟 我 说 如 乐 看 尺 子 出 来 了 看 铅 笔 喷",
    "caption": "跟我说一下：pen吧",
    "confidence": "asr-low-evidence",
    "endFrame": 620,
    "endSeconds": 20.65,
    "id": "pen-invite-echo",
    "matchScore": 0.429,
    "matchText": "乐 看 尺 子 出 来 了",
    "phrase": "跟我说一下pen吧",
    "startFrame": 612,
    "startSeconds": 20.4,
    "targetTokens": [
      "跟",
      "我",
      "说",
      "一",
      "下",
      "pen",
      "吧"
    ]
  },
  {
    "asrText": "跟 我 说 如 乐 看 尺 子 出 来 了 看 铅 笔 喷",
    "caption": "pen！\n看，钢笔出来了",
    "confidence": "asr-derived",
    "endFrame": 620,
    "endSeconds": 20.65,
    "id": "pen-replay",
    "matchScore": 0.714,
    "matchText": "乐 看 尺 子 出 来 了",
    "phrase": "pen看钢笔出来了",
    "startFrame": 612,
    "startSeconds": 20.4,
    "targetTokens": [
      "pen",
      "看",
      "钢",
      "笔",
      "出",
      "来",
      "了"
    ]
  },
  {
    "asrText": "跟 我 说 如 乐 看 尺 子 出 来 了 看 铅 笔 喷",
    "caption": "ruler！\n看，尺子出来了",
    "confidence": "asr-derived",
    "endFrame": 620,
    "endSeconds": 20.65,
    "id": "ruler-reveal",
    "matchScore": 0.8,
    "matchText": "乐 看 尺 子 出 来 了",
    "phrase": "ruler看尺子出来了",
    "startFrame": 612,
    "startSeconds": 20.4,
    "targetTokens": [
      "ruler",
      "看",
      "尺",
      "子",
      "出",
      "来",
      "了"
    ]
  },
  {
    "asrText": "跟 我 说 如 乐 看 尺 子 出 来 了 看 铅 笔",
    "caption": "请跟我说：ruler吧",
    "confidence": "asr-low-evidence",
    "endFrame": 620,
    "endSeconds": 20.65,
    "id": "ruler-invite-echo-first",
    "matchScore": 0.385,
    "matchText": "乐 看 尺 子 出 来",
    "phrase": "请跟我说ruler吧",
    "startFrame": 612,
    "startSeconds": 20.4,
    "targetTokens": [
      "请",
      "跟",
      "我",
      "说",
      "ruler",
      "吧"
    ]
  },
  {
    "asrText": "跟 我 说 如 乐 看 尺 子 出 来 了 看 铅 笔",
    "caption": "请跟我说：ruler吧",
    "confidence": "asr-low-evidence",
    "endFrame": 620,
    "endSeconds": 20.65,
    "id": "ruler-invite-echo-additional",
    "matchScore": 0.385,
    "matchText": "乐 看 尺 子 出 来",
    "phrase": "请跟我说ruler吧",
    "startFrame": 612,
    "startSeconds": 20.4,
    "targetTokens": [
      "请",
      "跟",
      "我",
      "说",
      "ruler",
      "吧"
    ]
  },
  {
    "asrText": "跟 我 说 如 乐 看 尺 子 出 来 了 看 铅 笔 喷",
    "caption": "ruler！\n看，尺子出来了",
    "confidence": "asr-derived",
    "endFrame": 658,
    "endSeconds": 21.95,
    "id": "ruler-replay",
    "matchScore": 0.8,
    "matchText": "乐 看 尺 子 出 来 了",
    "phrase": "ruler看尺子出来了",
    "startFrame": 612,
    "startSeconds": 20.4,
    "targetTokens": [
      "ruler",
      "看",
      "尺",
      "子",
      "出",
      "来",
      "了"
    ]
  },
  {
    "asrText": "说 如 乐 看 尺 子 出 来 了 看 铅 笔 喷 洒 钢 笔",
    "caption": "看，铅笔：pencil。\n看，钢笔：pen。\n看，尺子：ruler",
    "confidence": "asr-low-evidence",
    "endFrame": 842,
    "endSeconds": 28.07,
    "id": "recall-together",
    "matchScore": 0.386,
    "matchText": "尺 子 出 来 了 看 铅 笔 喷 洒 钢 笔",
    "phrase": "看铅笔pencil看钢笔pen看尺子ruler",
    "startFrame": 660,
    "startSeconds": 22.0,
    "targetTokens": [
      "看",
      "铅",
      "笔",
      "pencil",
      "看",
      "钢",
      "笔",
      "pen",
      "看",
      "尺",
      "子",
      "ruler"
    ]
  }
] satisfies AlignedLessonCue[];
