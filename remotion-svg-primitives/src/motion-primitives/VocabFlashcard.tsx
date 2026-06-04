import type { ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { ListenIcon } from "../shape-primitives";
import { fontFamily } from "../shape-primitives/shared";
import { ShineSweep } from "../fx/ShineSweep";
import { colors } from "../theme";
import { PopIn } from "./PopIn";
import { PulseCircle } from "./PulseCircle";
import { EASE } from "./curves";

export type VocabFlashcardMode = "reveal" | "flip" | "label-after";

export type VocabFlashcardProps = {
  /**
   * The object illustration — the PICTURE of the thing the word names. The
   * caller passes `<IconAsset name="..." />` or ANY node (a CountableObject, a
   * hand-drawn group). NEVER baked: this component only places + reveals it.
   */
  picture: ReactNode;
  /**
   * The word / character that names the picture — the localized label node
   * (e.g. `crayon`, `pencil`, or a hanzi `木`). NEVER baked; the caller owns the
   * string + its styling. Drawn centered on the word face.
   */
  label: ReactNode;
  /**
   * Optional phonetic / pinyin hint shown UNDER the label (e.g. `[ˈpensl]` or
   * `mù`). NEVER baked. Sits in a smaller, lighter type below the word.
   */
  phonetic?: ReactNode;
  /**
   * How the picture↔word binding is revealed:
   *  - `reveal`     — picture + label settle in together on one card face.
   *  - `flip`       — the card rotates on its Y-axis from the PICTURE face to
   *    the WORD face (the classic flashcard flip; a shine sweeps the card edge
   *    as it turns).
   *  - `label-after`— the picture lands first, then the word writes/fades in
   *    below it (for "see the thing, THEN learn its name").
   * Default `reveal`.
   */
  mode?: VocabFlashcardMode;
  /**
   * Local (cue-relative) frame at which this card's reveal BEGINS. The composer
   * passes `cues[id].startFrame + offset` — never a literal. Every sub-phase
   * (picture settle, flip rotation, label write-in) is derived by FRACTION of
   * `revealDurationFrames` from this frame; ZERO frame literals.
   */
  atFrame: number;
  /** Frames the whole reveal (entrance → flip/label settle) occupies. Default 36. */
  revealDurationFrames?: number;
  /**
   * Show a `<ListenIcon>` speaker affordance in the card's corner, signalling
   * the word is sayable (for the audio beat). It pulses to "playing" over the
   * back half of the reveal. Default false.
   */
  listenCue?: boolean;
  /**
   * Pulse a ring around the label — the "hard to pronounce" flag (multi-syllable
   * words 不易读准). Fires a `<PulseCircle>` ripple at the word once the face is
   * up. Default false.
   */
  highlightLabel?: boolean;
  /** Emphasis ring / shine accent color (the pronunciation flag). Default coral. */
  emphasisColor?: string;
  /** Card fill. Default white. */
  fill?: string;
  /** Card stroke. Default textNavy. */
  stroke?: string;
  /** Card corner radius. Default 28. */
  cornerRadius?: number;
  /** Card footprint (px). Default 240 × 300 (portrait, picture over word). */
  width?: number;
  height?: number;
  /** Ink color of the label text. Default textNavy. */
  inkColor?: string;
  /** Ink color of the phonetic hint. Default softGrayBlue. */
  phoneticColor?: string;
  /** Center of the card in the parent coordinate system. */
  x?: number;
  y?: number;
  /** Extra transform applied after placement (e.g. a row's per-card rotation). */
  transform?: string;
};

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/**
 * VocabFlashcard — binds a vocabulary WORD to the PICTURE of the thing it names,
 * revealed as ONE beat (and optionally flipped picture↔word). The single
 * reusable card the whole picture-word library is built from: map several in a
 * row (staggering each card's `atFrame`) to show a vocab SET; pass one with a
 * `phonetic` + `listenCue` + `highlightLabel` for the hardest "say this tricky
 * word" beat.
 *
 * Lesson-agnostic & prop-driven — it bakes NO topic, NO English/Chinese string:
 * `picture`, `label`, and `phonetic` are ALL caller ReactNodes. The SAME card
 * drives 人教版PEP English stationery vocab (crayon / pencil / eraser, the
 * multi-syllable words highlight-flagged) AND 统编版 Chinese 图文对照 (an object
 * illustration + 生字 + 拼音, e.g. 木 / mù) — the caller only varies props.
 *
 * Composes registered capabilities only — `<PopIn>` for the card entrance,
 * `<ListenIcon>` for the audio affordance, `<ShineSweep>` across the card on
 * the flip/reveal, `<PulseCircle>` for the pronunciation flag — with named
 * `EASE.*` motion for the flip rotation + label settle. ZERO frame literals
 * (public API takes `atFrame` + `revealDurationFrames`; every sub-phase derived
 * by FRACTION), ZERO raw motion literals.
 */
export const VocabFlashcard: React.FC<VocabFlashcardProps> = ({
  picture,
  label,
  phonetic,
  mode = "reveal",
  atFrame,
  revealDurationFrames = 36,
  listenCue = false,
  highlightLabel = false,
  emphasisColor,
  fill,
  stroke,
  cornerRadius = 28,
  width = 240,
  height = 300,
  inkColor,
  phoneticColor,
  x = 0,
  y = 0,
  transform,
}) => {
  const frame = useCurrentFrame();
  const D = Math.max(1, revealDurationFrames);
  const local = frame - atFrame;
  // Whole-reveal progress 0..1 — the master clock every sub-phase reads.
  const t = interpolate(local, [0, D], [0, 1], CLAMP);

  const cardFill = fill ?? colors.white;
  const cardStroke = stroke ?? colors.textNavy;
  const ink = inkColor ?? colors.textNavy;
  const phoneticInk = phoneticColor ?? colors.softGrayBlue;
  const accent = emphasisColor ?? colors.coral;

  const halfW = width / 2;
  const halfH = height / 2;
  // Word-block sits in the lower band; picture in the upper band. On `flip` the
  // whole face swaps, so both share the card center.
  const pictureY = mode === "flip" ? 0 : -height * 0.16;
  const labelY = mode === "flip" ? -height * 0.06 : height * 0.24;
  const phoneticY = labelY + height * 0.13;
  const labelFontSize = Math.round(Math.min(width, height) * 0.2);
  const phoneticFontSize = Math.round(labelFontSize * 0.55);

  // Picture face. On `flip` it is the FRONT face (shown first, then hidden as
  // the card turns past 90°); otherwise it always shows.
  const pictureBlock = (
    <g transform={`translate(0 ${pictureY})`}>{picture}</g>
  );

  const wordBlock = (
    <g transform={`translate(0 ${labelY})`}>
      <text
        dominantBaseline="middle"
        fill={ink}
        fontFamily={fontFamily}
        fontSize={labelFontSize}
        fontWeight={900}
        textAnchor="middle"
        y={0}
      >
        {label}
      </text>
      {phonetic ? (
        <text
          dominantBaseline="middle"
          fill={phoneticInk}
          fontFamily={fontFamily}
          fontSize={phoneticFontSize}
          fontWeight={700}
          textAnchor="middle"
          y={phoneticY - labelY}
        >
          {phonetic}
        </text>
      ) : null}
    </g>
  );

  // The rounded card surface (re-used by both flip faces).
  const cardSurface = (faceFill: string) => (
    <rect
      fill={faceFill}
      height={height}
      rx={cornerRadius}
      stroke={cardStroke}
      strokeWidth={5}
      width={width}
      x={-halfW}
      y={-halfH}
    />
  );

  // ---- mode-specific reveal of the card's CONTENTS ----------------------
  // flip: Y-axis rotation. 0°→180° over the back ~70% of the reveal; the
  // picture face shows while |angle|<90°, the word face after. We fake the 3D
  // Y-rotation with a horizontal scaleX = |cos(angle)| so the card narrows to a
  // sliver at 90° and opens onto the other face — no real perspective needed.
  // ONLY flip mode rotates — reveal / label-after never touch flipRot/flipScaleX
  // (a non-zero rotation there would mirror the text), so they stay at rest.
  const flipRot =
    mode === "flip"
      ? interpolate(t, [0.3, 1], [0, 180], {
          ...CLAMP,
          easing: EASE.inOutCubic,
        })
      : 0;
  const flipRad = (flipRot * Math.PI) / 180;
  // The card narrows to a sliver at 90° via a POSITIVE scaleX (|cos|), so it
  // never mirrors either face — we just SWAP which face's content is drawn at
  // the 90° crossover. No content counter-scale is needed (or correct): both
  // faces always render upright.
  const flipScaleX = mode === "flip" ? Math.abs(Math.cos(flipRad)) : 1;
  const showWordFace = mode !== "flip" || flipRot > 90;

  // label-after: picture lands first (front 55%), word fades+rises in after.
  const labelAfterReveal =
    mode === "label-after"
      ? interpolate(t, [0.55, 1], [0, 1], { ...CLAMP, easing: EASE.enter })
      : 1;
  const labelAfterRise =
    mode === "label-after"
      ? interpolate(labelAfterReveal, [0, 1], [height * 0.06, 0], CLAMP)
      : 0;

  // reveal: picture + word settle together (the PopIn entrance carries them).
  // Picture is always visible except on flip's word face.
  const showPicture = mode !== "flip" || !showWordFace;

  // Listen affordance swells to "playing" over the back half of the reveal.
  const listenProgress = interpolate(t, [0.5, 1], [0, 1], CLAMP);
  // The face is "up" (word legible) once the reveal is mostly done — gates the
  // pronunciation pulse so it fires on the settled word, not mid-flip.
  const faceUp = (mode === "flip" ? flipRot > 120 : t > 0.6) && t > 0.55;

  return (
    <g transform={[`translate(${x} ${y})`, transform].filter(Boolean).join(" ")}>
      <PopIn delay={atFrame} motion="bouncy" originX={0} originY={0}>
        {/* The card body. On flip we scaleX it (|cos|, always positive) about
            center to mime the turn — it narrows to a sliver at 90°, never
            mirroring, and the picture/word faces swap at the crossover. */}
        <g transform={`scale(${flipScaleX} 1)`}>
          {cardSurface(cardFill)}
          {showPicture ? pictureBlock : null}
          {showWordFace ? (
            <g
              opacity={mode === "label-after" ? labelAfterReveal : 1}
              transform={`translate(0 ${labelAfterRise})`}
            >
              {wordBlock}
            </g>
          ) : null}
        </g>
      </PopIn>

      {/* Shine sweeps the card on the flip/reveal — fires as the face turns up. */}
      <ShineSweep
        durationInFrames={Math.round(D * 0.7)}
        height={height}
        startFrame={atFrame + Math.round(D * 0.35)}
        width={width}
        x={-halfW}
        y={-halfH}
      />

      {/* Audio affordance — top-right corner, signals the word is sayable. */}
      {listenCue ? (
        <ListenIcon
          progress={listenProgress}
          size={56}
          state={listenProgress > 0 ? "playing" : "idle"}
          x={halfW - 34}
          y={-halfH + 34}
        />
      ) : null}

      {/* Pronunciation flag — pulse a ring at the settled label (hard word). */}
      {highlightLabel && faceUp ? (
        <PulseCircle
          color={accent}
          cx={0}
          cy={labelY}
          durationInFrames={Math.round(D * 0.5)}
          radius={Math.max(width, labelFontSize * 3) * 0.42}
          repeatCount={2}
          spread={22}
          startFrame={atFrame + Math.round(D * 0.62)}
        />
      ) : null}
    </g>
  );
};
