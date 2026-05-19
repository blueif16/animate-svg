import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors, typography } from "../theme";

export type CaptionCue = {
  emphasis?: boolean;
  fromFrame: number;
  text: string;
  toFrame: number;
};

type Props = {
  cues: CaptionCue[];
};

export const LessonCaptionLayer = ({ cues }: Props) => {
  const frame = useCurrentFrame();
  const activeCues = cues.filter(
    (cue) => frame >= cue.fromFrame && frame <= cue.toFrame,
  );

  if (activeCues.length === 0) {
    return null;
  }

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "0 112px 46px",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
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
        }}
      >
        {activeCues.map((cue) => (
          <span
            key={`${cue.fromFrame}-${cue.text}`}
            style={{
              color: cue.emphasis ? colors.coral : colors.textNavy,
              margin: "0 0.18em",
            }}
          >
            {cue.text}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};
