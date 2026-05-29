import { CaptionLayer, type CaptionCue, type CaptionLayerTheme } from "@studio/narration-kit";
import { colors, typography } from "../theme";

export type { CaptionCue };

/**
 * A frame window during which an in-canvas teaching label is on screen.
 * When provided, the caption ribbon is suppressed for any caption cue whose
 * midpoint falls inside such a window — pedagogy rule "one on-screen
 * representation per beat" enforced programmatically rather than per-lesson.
 *
 * The mechanism is intentionally blunt: any active label hides the ribbon
 * for that window. The rare case where both should appear can opt in by
 * omitting the label from the windows array.
 */
export type LabelWindow = {
  startFrame: number;
  endFrame: number;
};

// Thin wrapper around the kit's CaptionLayer that injects the kids-cute
// render theme (cream paper ribbon, navy ink, coral emphasis). Visuals
// match the original LessonCaptionLayer exactly.
const kidsTheme: CaptionLayerTheme = {
  containerStyle: {
    padding: "0 112px 46px",
  },
  ribbonStyle: {
    background: "rgba(255, 255, 255, 0.88)",
    border: `4px solid ${colors.textNavy}`,
    borderRadius: 24,
    boxShadow: "0 14px 30px rgba(36, 50, 75, 0.16)",
    color: colors.textNavy,
    fontFamily: typography.fontFamily,
    fontSize: 34,
    fontWeight: 900,
    lineHeight: 1.25,
    maxWidth: 860,
    padding: "16px 28px 18px",
    textAlign: "center",
  },
  emphasisStyle: {
    color: colors.coral,
  },
};

const cueMidpoint = (cue: CaptionCue) =>
  (cue.fromFrame + cue.toFrame) / 2;

const insideAnyWindow = (frame: number, windows: LabelWindow[]) =>
  windows.some((w) => frame >= w.startFrame && frame <= w.endFrame);

export const filterCaptionsAroundLabels = (
  cues: CaptionCue[],
  labelWindows: LabelWindow[] = [],
): CaptionCue[] => {
  if (labelWindows.length === 0) {
    return cues;
  }
  return cues.filter((cue) => !insideAnyWindow(cueMidpoint(cue), labelWindows));
};

type Props = {
  cues: CaptionCue[];
  labelWindows?: LabelWindow[];
};

export const LessonCaptionLayer = ({ cues, labelWindows }: Props) => (
  <CaptionLayer
    cues={filterCaptionsAroundLabels(cues, labelWindows)}
    theme={kidsTheme}
  />
);
