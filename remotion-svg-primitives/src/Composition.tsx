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
  CompleteKp2CountingByTensLesson,
  completeKp2CountingByTensLessonDefaultProps,
} from "./lessons/CompleteKp2CountingByTensLesson";
export { completeKp2CountingByTensLessonDuration } from "./lessons/kp2CountingByTensLessonTimeline";
export {
  CompleteKp2v2CountingByTensLesson,
  completeKp2v2CountingByTensLessonDefaultProps,
} from "./lessons/CompleteKp2v2CountingByTensLesson";
export { completeKp2v2CountingByTensLessonDuration } from "./lessons/kp2v2CountingByTensLessonTimeline";
export {
  CompleteMakeTenLesson,
  completeMakeTenLessonDefaultProps,
} from "./lessons/CompleteMakeTenLesson";
export { completeMakeTenLessonDuration } from "./lessons/makeTenLessonTimeline";
export {
  CompleteTenOnesMakeOneTenLesson,
  completeTenOnesMakeOneTenLessonDefaultProps,
} from "./lessons/CompleteTenOnesMakeOneTenLesson";
export { completeTenOnesMakeOneTenLessonDuration } from "./lessons/tenOnesMakeOneTenLessonTimeline";
export {
  PRIMITIVE_CHECK_DURATION as primitiveCheckTenOnesMakeOneTenDuration,
  PrimitiveCheckTenOnesMakeOneTenBundleWrap,
  PrimitiveCheckTenOnesMakeOneTenStickRow,
} from "./lessons/tenOnesMakeOneTen/primitiveChecks";
export {
  CompleteFenYuHeLesson,
  completeFenYuHeLessonDefaultProps,
  completeFenYuHeLessonDuration,
} from "./lessons/CompleteFenYuHeLesson";
export {
  CompleteKp1FenYuHeIntroLesson,
  completeKp1FenYuHeIntroLessonDefaultProps,
  completeKp1FenYuHeIntroLessonDuration,
} from "./lessons/CompleteKp1FenYuHeIntroLesson";
export {
  CompleteKp1HelloGreetingsLesson,
  completeKp1HelloGreetingsLessonDefaultProps,
  completeKp1HelloGreetingsLessonDuration,
} from "./lessons/CompleteKp1HelloGreetingsLesson";
export {
  PRIMITIVE_CHECK_FEN_HE_DURATION as primitiveCheckKp1FenHeDuration,
  PrimitiveCheckKp1FenHeDiagramHardest,
  PrimitiveCheckKp1FenHeDiagramMigration,
  PrimitiveCheckKp1FenHeDiagramMultiplicity,
} from "./lessons/kp1FenYuHeIntro/primitiveChecks";
export {
  PRIMITIVE_CHECK_KP1_HELLO_DURATION as primitiveCheckKp1HelloDuration,
  PrimitiveCheckKp1HelloGreetingsHardest,
  PrimitiveCheckKp1HelloGreetingsMultiplicity,
} from "./lessons/kp1HelloGreetings/primitiveChecks";
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
