// QA-only throwaway entry — registers ONLY CompleteKptestCountThreeLesson so a
// `remotion still` can render-and-critique stills WITHOUT the shared
// _lessonRegistry.generated.tsx (which the sandbox blocks regenerating).
// Not a driver artifact; does not export `lessonComposition`; not hand-registered.
import { Composition, registerRoot } from "remotion";
import { CompleteKptestCountThreeLesson } from "../CompleteKptestCountThreeLesson";
import { kptestCountThreeDuration } from "../kptestCountThreeLessonTimeline";
import { video } from "../../theme";

const KptestCountThreeQaRoot = () => (
  <Composition
    id="CompleteKptestCountThreeLesson"
    component={CompleteKptestCountThreeLesson}
    durationInFrames={kptestCountThreeDuration}
    fps={video.fps}
    width={video.width}
    height={video.height}
  />
);

registerRoot(KptestCountThreeQaRoot);
