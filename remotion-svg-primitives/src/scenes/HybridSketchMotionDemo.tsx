import { interpolate, useCurrentFrame } from "remotion";
import {
  DrawPath,
  FollowPath,
  PopIn,
  PulseCircle,
  SparkleBurst,
  type CubicPath,
} from "../motion-primitives";
import {
  CountableObject,
  NumberCard,
  PointerHandArrow,
} from "../shape-primitives";
import { colors, typography, video } from "../theme";
import { SceneFrame } from "./SceneFrame";

export const hybridSketchMotionDuration = 150;

const sketchFontFamily =
  '"Virgil", "Comic Sans MS", "Marker Felt", cursive, ' +
  typography.fontFamily;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const reveal = (frame: number, startFrame: number, durationInFrames: number) =>
  interpolate(frame, [startFrame, startFrame + durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const fadeOut = (frame: number, startFrame: number, durationInFrames: number) =>
  interpolate(frame, [startFrame, startFrame + durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const paperPath =
  "M 184 184 C 342 172 805 174 1018 188 C 1037 287 1033 451 1011 566 C 762 584 414 579 197 563 C 171 425 174 296 184 184 Z";

const paperPathOffset =
  "M 194 194 C 375 183 786 187 1009 198 C 1026 294 1022 438 1000 555 C 760 569 405 568 207 552 C 184 414 185 308 194 194 Z";

const hachureLines = [
  "M 254 236 L 326 198",
  "M 236 300 L 416 206",
  "M 232 366 L 544 202",
  "M 240 432 L 660 211",
  "M 282 498 L 770 242",
  "M 424 552 L 902 300",
  "M 620 562 L 974 376",
  "M 790 556 L 1000 446",
];

const motionPathD = "M 374 498 C 492 404 734 394 908 458";

const motionPath: CubicPath = {
  type: "cubic",
  from: { x: 374, y: 498 },
  control1: { x: 492, y: 404 },
  control2: { x: 734, y: 394 },
  to: { x: 908, y: 458 },
};

const SketchPen = ({
  opacity,
  x,
  y,
}: {
  opacity: number;
  x: number;
  y: number;
}) => (
  <g opacity={opacity} transform={`translate(${x} ${y}) rotate(-18)`}>
    <rect
      fill={colors.reward}
      height={72}
      rx={12}
      stroke={colors.textNavy}
      strokeWidth={4}
      width={24}
      x={-12}
      y={-66}
    />
    <path
      d="M -12 0 L 0 24 L 12 0 Z"
      fill={colors.paleCream}
      stroke={colors.textNavy}
      strokeLinejoin="round"
      strokeWidth={4}
    />
  </g>
);

const PaperTexture = ({ progress }: { progress: number }) => (
  <g>
    <path
      d={paperPath}
      fill={colors.white}
      opacity={0.96 * progress}
      stroke="none"
    />
    <g opacity={0.12}>
      {hachureLines.map((d, index) => (
        <DrawPath
          d={d}
          durationInFrames={1}
          key={d}
          progress={clamp01(progress * 1.4 - index * 0.08)}
          stroke={colors.textNavy}
          strokeWidth={3}
        />
      ))}
    </g>
    <DrawPath
      d={paperPath}
      durationInFrames={1}
      progress={progress}
      stroke={colors.textNavy}
      strokeWidth={5}
    />
    <DrawPath
      d={paperPathOffset}
      durationInFrames={1}
      opacity={0.5}
      progress={progress}
      stroke={colors.textNavy}
      strokeWidth={2}
    />
  </g>
);

const HandwrittenNote = ({
  cursorOpacity,
  maskWidth,
  penX,
  progress,
}: {
  cursorOpacity: number;
  maskWidth: number;
  penX: number;
  progress: number;
}) => (
  <g>
    <clipPath id="hybrid-note-reveal">
      <rect height={150} width={maskWidth} x={260} y={250} />
    </clipPath>
    <g clipPath="url(#hybrid-note-reveal)">
      <text
        fill={colors.textNavy}
        fontFamily={sketchFontFamily}
        fontSize={40}
        fontWeight={700}
        x={260}
        y={286}
      >
        sketch the idea
      </text>
      <text
        fill={colors.softGrayBlue}
        fontFamily={sketchFontFamily}
        fontSize={30}
        fontWeight={700}
        x={264}
        y={334}
      >
        loose text, rough frame
      </text>
      <text
        fill={colors.coral}
        fontFamily={sketchFontFamily}
        fontSize={34}
        fontWeight={800}
        x={264}
        y={382}
      >
        then trace the motion
      </text>
    </g>
    <DrawPath
      d="M 261 403 C 340 391 484 394 595 402"
      durationInFrames={1}
      progress={progress}
      stroke={colors.coral}
      strokeWidth={7}
    />
    <SketchPen opacity={cursorOpacity} x={penX} y={402} />
  </g>
);

const MotionLayer = ({ frame }: { frame: number }) => {
  const pathProgress = reveal(frame, 76, 42);
  const pointerOpacity =
    reveal(frame, 74, 8) * fadeOut(frame, 124, 12);
  const finishOpacity = reveal(frame, 110, 12);

  return (
    <g>
      <PopIn delay={60} originX={352} originY={498} scaleFrom={0.55}>
        <NumberCard
          color={colors.paleCream}
          focused={frame > 68}
          value={2}
          x={352}
          y={498}
        />
      </PopIn>
      <PopIn delay={106} originX={948} originY={458} scaleFrom={0.55}>
        <NumberCard
          color={colors.mint}
          selected={frame > 120}
          value={5}
          x={948}
          y={458}
        />
      </PopIn>

      <path
        d={motionPathD}
        fill="none"
        opacity={0.16}
        stroke={colors.textNavy}
        strokeLinecap="round"
        strokeWidth={17}
      />
      <DrawPath
        d={motionPathD}
        progress={pathProgress}
        stroke={colors.sky}
        strokeWidth={13}
      />
      <g opacity={pointerOpacity}>
        <FollowPath path={motionPath} progress={pathProgress}>
          <PointerHandArrow direction="right" progress={1} size={70} />
        </FollowPath>
      </g>

      <PulseCircle
        color={colors.sunshine}
        cx={352}
        cy={498}
        radius={34}
        repeatCount={2}
        startFrame={64}
      />
      <PulseCircle
        color={colors.mint}
        cx={948}
        cy={458}
        radius={36}
        repeatCount={2}
        startFrame={112}
      />

      <g opacity={finishOpacity}>
        <CountableObject
          color={colors.sky}
          label="agent sketch"
          selected={frame > 122}
          size={72}
          transform="rotate(-8)"
          variant="fish"
          x={720}
          y={530}
        />
        <SparkleBurst
          count={12}
          radius={82}
          startFrame={124}
          x={948}
          y={458}
        />
      </g>
    </g>
  );
};

export const HybridSketchMotionDemo = () => {
  const frame = useCurrentFrame();
  const paperProgress = reveal(frame, 14, 30);
  const noteProgress = reveal(frame, 38, 32);
  const noteMaskWidth = 390 * noteProgress;
  const penX = interpolate(noteProgress, [0, 1], [262, 642]);
  const penOpacity = noteProgress > 0 && noteProgress < 1 ? 1 : 0;
  const badgeOpacity = reveal(frame, 128, 12);

  return (
    <SceneFrame
      accent={colors.lavender}
      eyebrow="Hybrid sketch + SVG motion"
      title="Draw loose, animate exact"
    >
      <svg
        height={video.height}
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${video.width} ${video.height}`}
        width={video.width}
      >
        <g transform="translate(0 34)">
          <PaperTexture progress={paperProgress} />

          <g opacity={reveal(frame, 24, 14)}>
            <rect
              fill={colors.paleCream}
              height={54}
              opacity={0.9}
              rx={18}
              stroke={colors.textNavy}
              strokeWidth={4}
              width={246}
              x={254}
              y={203}
            />
            <text
              fill={colors.textNavy}
              fontFamily={sketchFontFamily}
              fontSize={30}
              fontWeight={800}
              x={278}
              y={239}
            >
              Excalidraw note
            </text>
          </g>

          <HandwrittenNote
            cursorOpacity={penOpacity}
            maskWidth={noteMaskWidth}
            penX={penX}
            progress={noteProgress}
          />

          <MotionLayer frame={frame} />

          <g opacity={badgeOpacity}>
            <rect
              fill={colors.sunshine}
              height={60}
              rx={22}
              stroke={colors.textNavy}
              strokeWidth={5}
              width={310}
              x={608}
              y={184}
            />
            <text
              dominantBaseline="middle"
              fill={colors.textNavy}
              fontFamily={typography.fontFamily}
              fontSize={28}
              fontWeight={900}
              textAnchor="middle"
              x={763}
              y={214}
            >
              one render timeline
            </text>
          </g>
        </g>
      </svg>
    </SceneFrame>
  );
};
