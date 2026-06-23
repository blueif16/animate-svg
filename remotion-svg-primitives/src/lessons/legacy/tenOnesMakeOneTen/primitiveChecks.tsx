import { AbsoluteFill } from "remotion";
import { BundleWrap, StickGroup } from "../../../shape-primitives";
import { colors } from "../../../theme";
import {
  BUNDLE_FINAL_WIDTH,
  BUNDLE_GAP,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  ROW_GAP,
  STICK_COUNT,
  STICK_LENGTH,
  STICK_THICKNESS,
} from "./layout";

export const PRIMITIVE_CHECK_DURATION = 1;

const cx = CANVAS_WIDTH / 2;
const cy = CANVAS_HEIGHT / 2;

export const PrimitiveCheckTenOnesMakeOneTenBundleWrap = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.cream }}>
      <svg
        height="100%"
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        width="100%"
      >
        <g transform={`translate(${cx} ${cy})`}>
          <StickGroup
            bundleGap={BUNDLE_GAP}
            color={colors.reward}
            count={STICK_COUNT}
            layout="bundle"
            rowGap={ROW_GAP}
            seed={7}
            stickLength={STICK_LENGTH}
            stickThickness={STICK_THICKNESS}
          />
          <BundleWrap
            color={colors.coral}
            height={BUNDLE_FINAL_WIDTH * 0.32}
            knotPosition="top"
            outlineColor={colors.textNavy}
            style="rope"
            width={BUNDLE_FINAL_WIDTH}
            wrapProgress={1}
          />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const PrimitiveCheckTenOnesMakeOneTenStickRow = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.cream }}>
      <svg
        height="100%"
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        width="100%"
      >
        <g transform={`translate(${cx} ${cy})`}>
          <StickGroup
            color={colors.reward}
            count={STICK_COUNT}
            layout="row"
            rowGap={ROW_GAP}
            seed={7}
            stickLength={STICK_LENGTH}
            stickThickness={STICK_THICKNESS}
          />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
