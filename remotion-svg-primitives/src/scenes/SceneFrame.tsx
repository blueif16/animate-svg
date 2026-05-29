import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { useStyle, useStylePalette } from "../styles";
import { colors, typography, video } from "../theme";

type SceneFrameProps = {
  eyebrow: string;
  title: string;
  accent?: string;
  children: ReactNode;
};

export const SceneFrame: React.FC<SceneFrameProps> = ({
  eyebrow,
  title,
  accent = colors.sky,
  children,
}) => {
  const frame = useCurrentFrame();
  const palette = useStylePalette();
  const { activeStyle } = useStyle();
  const bg = palette.background ?? colors.cream;
  const text = palette.textNavy ?? colors.textNavy;
  const titleY = interpolate(frame, [0, 18], [-18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleOpacity = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bg,
        color: text,
        fontFamily: typography.fontFamily,
        overflow: "hidden",
      }}
    >
      {activeStyle === "default" ? (
        <svg
          aria-hidden="true"
          height={video.height}
          style={{ position: "absolute", inset: 0 }}
          viewBox={`0 0 ${video.width} ${video.height}`}
          width={video.width}
        >
          <circle cx={96} cy={118} fill={colors.sunshine} opacity={0.4} r={58} />
          <circle cx={1164} cy={112} fill={colors.mint} opacity={0.45} r={68} />
          <circle cx={1132} cy={618} fill={colors.sky} opacity={0.25} r={118} />
          <circle cx={102} cy={626} fill={colors.coral} opacity={0.22} r={92} />
          {Array.from({ length: 13 }, (_, index) => (
            <circle
              cx={175 + index * 80}
              cy={84 + (index % 2) * 18}
              fill={index % 3 === 0 ? colors.lavender : colors.reward}
              key={index}
              opacity={0.24}
              r={7}
            />
          ))}
        </svg>
      ) : null}

      <div
        style={{
          left: 84,
          opacity: titleOpacity,
          position: "absolute",
          top: 48,
          transform: `translateY(${titleY}px)`,
          width: 720,
        }}
      >
        <div
          style={{
            alignItems: "center",
            color: colors.softGrayBlue,
            display: "flex",
            fontSize: 24,
            fontWeight: 800,
            gap: 12,
            letterSpacing: 0,
            marginBottom: 8,
          }}
        >
          <span
            style={{
              backgroundColor: accent,
              borderRadius: 999,
              display: "inline-block",
              height: 18,
              width: 18,
            }}
          />
          {eyebrow}
        </div>
        <div
          style={{
            fontSize: 58,
            fontWeight: 900,
            letterSpacing: 0,
            lineHeight: 1.02,
          }}
        >
          {title}
        </div>
      </div>

      {children}
    </AbsoluteFill>
  );
};
