# Audio Captions & Narration Plan

## Narration Targeting Rule
For each cue, write narration that, when spoken at the calibrated voice rate (~0.30s per Chinese character for Aoede), lands within ±20% of the visualMotionSeconds budget from the Visual Contract.

## Per-Cue Narration Analysis

| Cue ID | Narration Text | Char Count | Est. Sec (0.30s/char) | Visual Budget (s) | Delta (s) | Gap (s/reason) | Notes |
|--------|----------------|------------|-----------------------|-------------------|-----------|----------------|-------|
| announce-topic | 我们来学凑十。 | 5 | 1.5 | 2.0 | -0.5 | - | Topic introduction |
| bond-9-1 | 还有几个空？ | 5 | 1.5 | 3.0 | -1.5 | 4.0/learner-response | Invite-echo prompt |
| bond-8-2 | 还需要几个点？ | 5 | 1.5 | 3.0 | -1.5 | 4.0/learner-response | Invite-echo prompt |
| bond-7-3 | 还缺几个点？ | 4 | 1.2 | 3.0 | -1.8 | 4.0/learner-response | Invite-echo prompt |
| bond-6-4 | 还需要几个点才能满？ | 7 | 2.1 | 3.0 | -0.9 | 4.0/learner-response | Invite-echo prompt |
| bond-5-5 | 还放几个点？ | 4 | 1.2 | 3.0 | -1.8 | 4.0/learner-response | Invite-echo prompt |
| recap | 九加一，八加二，七加三，六加四，五加五。 | 15 | 4.5 | 6.0 | -1.5 | - | Spaced-recall review |

## Narration-Leakage Compliance Check
- **announce-topic**: Names activity ("learn to make ten"); visual shows ten-frame setup - compliant
- **bond-9-1**: Names action (asking about spaces); visual shows 9 dots + highlights empty cell - compliant
- **bond-8-2**: Names action (asking about needed dots); visual shows 8 dots + highlights 2 empty cells - compliant
- **bond-7-3**: Names action (asking about missing dots); visual shows 7 dots + highlights 3 empty cells - compliant
- **bond-6-4**: Names action (asking about dots to fill); visual shows 6 dots + highlights 4 empty cells - compliant
- **bond-5-5**: Names action (asking about dots to place); visual shows 5 dots + highlights 5 empty cells - compliant
- **recap**: Names addends for each bond (e.g., "九加一"); visual shows progressive completion to ten-frame - compliant

## ASR Risk Assessment
All narration candidates avoid single-character utterances and homophone-rich phrasing. No special mitigations required.

## Caption Plan
Each cue displays verbatim narration as caption, centered in zone-caption, visible for full cue window (start to end) with ≤0.3s linger tail.
