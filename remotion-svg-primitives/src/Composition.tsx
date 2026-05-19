import { AbsoluteFill, Sequence } from "remotion";
import { CountingDemo } from "./scenes/CountingDemo";
import { PathFollowDemo } from "./scenes/PathFollowDemo";
import { StrokeTraceDemo } from "./scenes/StrokeTraceDemo";
import {
  FishCountingLesson,
  HanziMatchLesson,
  OneToOneCompareLesson,
  PinyinToneLesson,
  ShapePrimitiveGallery,
  educationSceneDuration,
} from "./shape-demos";
import { video } from "./theme";

export const MyComposition: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={video.sceneDuration}>
        <CountingDemo />
      </Sequence>
      <Sequence
        durationInFrames={video.sceneDuration}
        from={video.sceneDuration}
      >
        <PathFollowDemo />
      </Sequence>
      <Sequence
        durationInFrames={video.sceneDuration}
        from={video.sceneDuration * 2}
      >
        <StrokeTraceDemo />
      </Sequence>
    </AbsoluteFill>
  );
};

export const EducationShapeShowcase: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={educationSceneDuration}>
        <ShapePrimitiveGallery />
      </Sequence>
      <Sequence
        durationInFrames={educationSceneDuration}
        from={educationSceneDuration}
      >
        <FishCountingLesson />
      </Sequence>
      <Sequence
        durationInFrames={educationSceneDuration}
        from={educationSceneDuration * 2}
      >
        <OneToOneCompareLesson />
      </Sequence>
      <Sequence
        durationInFrames={educationSceneDuration}
        from={educationSceneDuration * 3}
      >
        <PinyinToneLesson />
      </Sequence>
      <Sequence
        durationInFrames={educationSceneDuration}
        from={educationSceneDuration * 4}
      >
        <HanziMatchLesson />
      </Sequence>
    </AbsoluteFill>
  );
};

export { CountingDemo } from "./scenes/CountingDemo";
export {
  HybridSketchMotionDemo,
  hybridSketchMotionDuration,
} from "./scenes/HybridSketchMotionDemo";
export { PathFollowDemo } from "./scenes/PathFollowDemo";
export { StrokeTraceDemo } from "./scenes/StrokeTraceDemo";
export {
  CompleteComparisonLesson,
  completeComparisonLessonDefaultProps,
} from "./lessons/CompleteComparisonLesson";
export { completeComparisonLessonDuration } from "./lessons/comparisonLessonTimeline";
export {
  CompleteMakeTenLesson,
  completeMakeTenLessonDefaultProps,
} from "./lessons/CompleteMakeTenLesson";
export { completeMakeTenLessonDuration } from "./lessons/makeTenLessonTimeline";
export {
  CompletePinyinToneLesson,
  completePinyinToneLessonDefaultProps,
} from "./lessons/CompletePinyinToneLesson";
export { completePinyinToneLessonDuration } from "./lessons/pinyinToneLessonTimeline";
export {
  FishCountingLesson,
  HanziMatchLesson,
  OneToOneCompareLesson,
  PinyinToneLesson,
  ShapePrimitiveGallery,
  educationSceneDuration,
  educationShowcaseDuration,
} from "./shape-demos";
