import { Composition, registerRoot } from "remotion";
import {
  PREVIEW_DURATION,
  PREVIEW_FPS,
  PREVIEW_HEIGHT,
  PREVIEW_WIDTH,
  PreviewComposition,
} from "./PreviewComposition";

// =========================================================================
// PreviewRoot — a DEDICATED Remotion root for the gallery preview pipeline.
//
// It registers exactly ONE parametrized composition ("component-preview"); the
// render script overrides its `id` inputProp per registered component. Keeping
// this OUT of the app Root.tsx means the preview pipeline (npm run
// gallery:previews) never perturbs the lesson compositions or the studio.
// Bundled directly by scripts/gallery/render-previews.mjs.
// =========================================================================

const PreviewRoot: React.FC = () => {
  return (
    <Composition
      component={PreviewComposition}
      defaultProps={{ id: "answer-tile" }}
      durationInFrames={PREVIEW_DURATION}
      fps={PREVIEW_FPS}
      height={PREVIEW_HEIGHT}
      id="component-preview"
      width={PREVIEW_WIDTH}
    />
  );
};

registerRoot(PreviewRoot);
