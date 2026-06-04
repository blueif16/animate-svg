import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CountingBeadDevice } from "../shape-primitives";
import { EASE } from "../motion-primitives/curves";
import { colors, video } from "../theme";

// ---------------------------------------------------------------------------
// CountingBeadDeviceDemo — proof/check scenes for the single-rod bead counter
// (计数器). These are DEMO scenes, so explicit frame literals are allowed here
// (the zero-frame-literal law governs src/lessons/*LessonScene.tsx). A real
// lesson drives `atFrame` from `cues[id].startFrame + offset` and passes the
// derived revealProgress/activePulse exactly as these demos compute them.
//
// Two compositions:
//   CountingBeadDeviceHardest      — the 4→5 transition: the 5th bead mid-slide
//                                    with its one-more highlight pulse and the
//                                    value readout reading 5. THE hardest frame.
//   CountingBeadDeviceMultiplicity — capacity=10 fully filled (10 distinct beads)
//                                    on one rod at render size. Worst case.
// ---------------------------------------------------------------------------

// HARDEST: the newest (5th) bead slides in over [SLIDE_AT, SLIDE_AT+SLIDE_DUR]
// and its one-more ring swells over the same window. The review frame parks the
// playhead so the bead sits mid-rod with the ring half-swelled — the moment the
// "one more → the number is now 5" beat must read unmistakably.
export const COUNTING_BEAD_HARDEST_DURATION = 90;
const SLIDE_AT = 6;
const SLIDE_DUR = 24;

export const CountingBeadDeviceHardest = () => {
  const frame = useCurrentFrame();
  // Caller-derived, cue-relative: ZERO frame literals would live in a real
  // lesson scene; here the demo plays the role of that caller.
  const local = frame - SLIDE_AT;
  const revealProgress = interpolate(local, [0, SLIDE_DUR], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.outCubic,
  });
  // The one-more ring swells then fades across the slide window.
  const activePulse = interpolate(local, [0, SLIDE_DUR], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.balanced,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.cream }}>
      <svg
        height="100%"
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${video.width} ${video.height}`}
        width="100%"
      >
        <CountingBeadDevice
          activeIndex={4}
          activePulse={activePulse}
          beadRadius={42}
          capacity={5}
          count={5}
          revealProgress={revealProgress}
          rodLength={760}
          x={video.width / 2 - 70}
          y={video.height / 2}
        />
      </svg>
    </AbsoluteFill>
  );
};

// WORST-CASE MULTIPLICITY: a full rod of 10 beads, all settled, all distinct at
// render size. Beads must stay legibly separated and read as a row of ten beads.
export const COUNTING_BEAD_MULTIPLICITY_DURATION = 60;

export const CountingBeadDeviceMultiplicity = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.cream }}>
      <svg
        height="100%"
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${video.width} ${video.height}`}
        width="100%"
      >
        <CountingBeadDevice
          beadRadius={34}
          capacity={10}
          count={10}
          revealProgress={1}
          rodLength={920}
          x={video.width / 2 - 60}
          y={video.height / 2}
        />
      </svg>
    </AbsoluteFill>
  );
};
