import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { AssetMorph } from "../motion-primitives";
import { IconAsset, StickGroup } from "../shape-primitives";
import { colors, video } from "../theme";

// ---------------------------------------------------------------------------
// AssetMorphDemo — proof scene for the parametric → asset magic-transition.
//
// Ten PARAMETRIC sticks gather into a tight cluster, a sparkle masks the swap,
// and they BECOME the generated `stick-bundle-roped` asset; then it reverses
// (the bundle un-bundles, sticks fan back out). This is a check/demo scene, so
// explicit frame literals are allowed (the zero-frame-literal law governs
// `src/lessons/*LessonScene.tsx`, not demos). The real lesson drives `atFrame`
// from `cues[id].startFrame + offset`.
// ---------------------------------------------------------------------------

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const CX = video.width / 2;
const CY = video.height / 2;

const STICK_COUNT = 10;
const GAP_SPREAD = 60;
const GAP_TIGHT = 18;
const ASSET_WIDTH = 260;

// Timeline (30fps).
const GATHER_START = 6;
const GATHER_END = 32;
const BUNDLE_AT = 42; // morph completes — bundle fully present
const UNBUNDLE_AT = 84; // morph begins — bundle starts dissolving
const FAN_END = 110;
const DIRECTION_SWITCH = 63; // mid-hold; asset-only on both sides of the swap
export const ASSET_MORPH_DEMO_DURATION = 132;

export const AssetMorphDemo = () => {
  const frame = useCurrentFrame();

  const bundleGap =
    frame < UNBUNDLE_AT
      ? interpolate(frame, [GATHER_START, GATHER_END], [GAP_SPREAD, GAP_TIGHT], CLAMP)
      : interpolate(frame, [UNBUNDLE_AT, FAN_END], [GAP_TIGHT, GAP_SPREAD], CLAMP);

  const direction = frame < DIRECTION_SWITCH ? "bundle" : "unbundle";
  const atFrame = direction === "bundle" ? BUNDLE_AT : UNBUNDLE_AT;

  const sticks = (
    <StickGroup
      bundleGap={bundleGap}
      color={colors.reward}
      count={STICK_COUNT}
      layout="bundle"
      seed={7}
      stickLength={120}
      stickThickness={18}
      x={CX}
      y={CY}
    />
  );

  const bundle = (
    <IconAsset name="stick-bundle-roped" variant="color" width={ASSET_WIDTH} x={CX} y={CY} />
  );

  return (
    <AbsoluteFill style={{ backgroundColor: colors.cream }}>
      <svg
        height="100%"
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${video.width} ${video.height}`}
        width="100%"
      >
        <AssetMorph
          atFrame={atFrame}
          centerX={CX}
          centerY={CY}
          direction={direction}
          durationInFrames={10}
          from={sticks}
          fxRadius={150}
          to={bundle}
        />
      </svg>
    </AbsoluteFill>
  );
};
