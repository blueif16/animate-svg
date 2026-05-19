import "./index.css";
import { Composition } from "remotion";
import {
  CountingDemo,
  CompleteComparisonLesson,
  CompleteMakeTenLesson,
  CompletePinyinToneLesson,
  EducationShapeShowcase,
  FishCountingLesson,
  HanziMatchLesson,
  HybridSketchMotionDemo,
  MyComposition,
  OneToOneCompareLesson,
  PathFollowDemo,
  PinyinToneLesson,
  ShapePrimitiveGallery,
  StrokeTraceDemo,
  completeComparisonLessonDefaultProps,
  completeComparisonLessonDuration,
  completeMakeTenLessonDefaultProps,
  completeMakeTenLessonDuration,
  completePinyinToneLessonDefaultProps,
  completePinyinToneLessonDuration,
  educationSceneDuration,
  educationShowcaseDuration,
  hybridSketchMotionDuration,
} from "./Composition";
import { video } from "./theme";

const compositionDefaults = {
  fps: video.fps,
  height: video.height,
  width: video.width,
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SvgPrimitiveShowcase"
        component={MyComposition}
        durationInFrames={video.showcaseDuration}
        {...compositionDefaults}
      />
      <Composition
        id="CountingDemo"
        component={CountingDemo}
        durationInFrames={video.sceneDuration}
        {...compositionDefaults}
      />
      <Composition
        id="PathFollowDemo"
        component={PathFollowDemo}
        durationInFrames={video.sceneDuration}
        {...compositionDefaults}
      />
      <Composition
        id="StrokeTraceDemo"
        component={StrokeTraceDemo}
        durationInFrames={video.sceneDuration}
        {...compositionDefaults}
      />
      <Composition
        id="HybridSketchMotionDemo"
        component={HybridSketchMotionDemo}
        durationInFrames={hybridSketchMotionDuration}
        {...compositionDefaults}
      />
      <Composition
        id="EducationShapeShowcase"
        component={EducationShapeShowcase}
        durationInFrames={educationShowcaseDuration}
        {...compositionDefaults}
      />
      <Composition
        id="ShapePrimitiveGallery"
        component={ShapePrimitiveGallery}
        durationInFrames={educationSceneDuration}
        {...compositionDefaults}
      />
      <Composition
        id="FishCountingLesson"
        component={FishCountingLesson}
        durationInFrames={educationSceneDuration}
        {...compositionDefaults}
      />
      <Composition
        id="OneToOneCompareLesson"
        component={OneToOneCompareLesson}
        durationInFrames={educationSceneDuration}
        {...compositionDefaults}
      />
      <Composition
        id="CompleteComparisonLesson"
        component={CompleteComparisonLesson}
        durationInFrames={completeComparisonLessonDuration}
        defaultProps={completeComparisonLessonDefaultProps}
        {...compositionDefaults}
      />
      <Composition
        id="CompleteMakeTenLesson"
        component={CompleteMakeTenLesson}
        durationInFrames={completeMakeTenLessonDuration}
        defaultProps={completeMakeTenLessonDefaultProps}
        {...compositionDefaults}
      />
      <Composition
        id="CompletePinyinToneLesson"
        component={CompletePinyinToneLesson}
        durationInFrames={completePinyinToneLessonDuration}
        defaultProps={completePinyinToneLessonDefaultProps}
        {...compositionDefaults}
      />
      <Composition
        id="PinyinToneLesson"
        component={PinyinToneLesson}
        durationInFrames={educationSceneDuration}
        {...compositionDefaults}
      />
      <Composition
        id="HanziMatchLesson"
        component={HanziMatchLesson}
        durationInFrames={educationSceneDuration}
        {...compositionDefaults}
      />
    </>
  );
};
