import {Scene3D, Stage, TopicCard3D, SlowPushInCamera} from "@studio/three-effects";
import {resolvePreset} from "@studio/three-effects/presets";
import {kidsPreset} from "../../three-effects/preset-kids";

type TopicIntroCardProps = {
  // Frame inside the cue where the card spring starts. Caller computes this
  // from `cues[id].startFrame + offset` — never a master-timeline absolute.
  entranceFrame?: number;
  // Override scene background if you want a non-default backdrop for this
  // intro (e.g. dimmer for an after-recap intro).
  backgroundOverride?: string;
};

// Topic intro card — a single ceramic 3D card landing with a slow push-in.
// The lesson title goes on it (via a child Text3D or as a texture overlay).
// Used at lesson open and section transitions. Decorative; never touches
// teaching primitives.
export const TopicIntroCard: React.FC<TopicIntroCardProps> = ({
  entranceFrame = 0,
  backgroundOverride,
}) => {
  const resolved = resolvePreset(kidsPreset, {effect: "topic-card-3d"});
  const scene = backgroundOverride
    ? {...resolved.scene, background: backgroundOverride}
    : resolved.scene;

  return (
    <Scene3D {...scene}>
      {resolved.stage !== null ? <Stage {...resolved.stage} /> : null}
      <SlowPushInCamera from={[0, 0.5, 7]} to={[0, 0.4, 4.8]} />
      <TopicCard3D entranceFrame={entranceFrame} {...resolved.effectProps} />
    </Scene3D>
  );
};
