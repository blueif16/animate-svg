import {
  Scene3D,
  Stage,
  PortalRing,
  PortalPassThroughCamera,
} from "@studio/three-effects";
import {resolvePreset} from "@studio/three-effects/presets";
import {kidsPreset} from "../../three-effects/preset-kids";

type SectionHandoffProps = {
  // Frame inside the cue where the portal-ring entrance starts. Caller
  // computes this from `cues[id].startFrame + offset` — never a master-
  // timeline absolute.
  entranceFrame?: number;
};

// Section handoff transition — an iridescent portal-ring scaling in with
// a slow pass-through camera. Used between major lesson sections. Pair
// with a whoosh audio cue.
export const SectionHandoff: React.FC<SectionHandoffProps> = ({
  entranceFrame = 0,
}) => {
  const resolved = resolvePreset(kidsPreset, {effect: "portal-ring"});

  return (
    <Scene3D {...resolved.scene}>
      {resolved.stage !== null ? <Stage {...resolved.stage} /> : null}
      <PortalPassThroughCamera />
      <PortalRing entranceFrame={entranceFrame} {...resolved.effectProps} />
    </Scene3D>
  );
};
