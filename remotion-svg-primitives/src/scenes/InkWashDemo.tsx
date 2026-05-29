import { AbsoluteFill } from "remotion";
import { FXDefs, GlintFlash, Breathe } from "../fx";
import { CountableObject } from "../shape-primitives/counting";
import { TeacherMark } from "../shape-primitives/sketch";
import { StylePreset, useStyleFilter } from "../styles";
import { video } from "../theme";
import { SceneFrame } from "./SceneFrame";

/**
 * Demo composition for the ink-wash style overlay. Verifies the runtime
 * end-to-end: <StylePreset> + <FXDefs> + filtered teaching <g> + boil/settle
 * on TeacherMark + Breathe wrap + GlintFlash event. Not a lesson — verification
 * artifact for style-overlay-system / style-ink-wash / magic-fx-library.
 */
const InkWashDemoInner = () => {
  const filter = useStyleFilter();
  const cx = video.width / 2;
  const cy = video.height / 2;

  return (
    <SceneFrame eyebrow="Style demo" title="Ink-wash">
      <svg
        aria-hidden="true"
        height={video.height}
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${video.width} ${video.height}`}
        width={video.width}
      >
        <g filter={filter}>
          <CountableObject
            color="reward"
            size={120}
            variant="fruit"
            x={cx - 220}
            y={cy}
          />

          <TeacherMark
            anchor={{
              kind: "span",
              start: { x: cx - 320, y: cy + 110 },
              end: { x: cx + 320, y: cy + 110 },
            }}
            boil={{ magnitude: 5 }}
            drawProgress={1}
            kind="wrap-arc"
            settle={{ magnitude: 0.08 }}
            strokeWidth={5}
          />

          <Breathe originX={cx + 220} originY={cy}>
            <CountableObject
              color="coral"
              size={80}
              variant="star"
              x={cx + 220}
              y={cy}
            />
          </Breathe>

          <GlintFlash size={32} startFrame={30} x={cx} y={cy - 80} />
        </g>
      </svg>
    </SceneFrame>
  );
};

export const InkWashDemo = () => (
  <AbsoluteFill>
    <StylePreset style="ink-wash">
      <FXDefs />
      <InkWashDemoInner />
    </StylePreset>
  </AbsoluteFill>
);
