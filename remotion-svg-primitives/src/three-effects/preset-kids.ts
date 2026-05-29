import type {Preset} from "@studio/three-effects/presets";
import {colors} from "../theme";

// KIDS preset — early-childhood math lessons.
//
// 3D in lessons is decorative ONLY: topic-intro cards and section-handoff
// transitions. The teaching primitives stay SVG (see CLAUDE.md). Identity
// is preserved on countables — the kids-eye no-rainbow-on-teaching-primitive
// rule applies. Since 3D never touches teaching primitives in this preset,
// iridescent is allowed broadly on 3D cards (decorative, not identity).
//
// Palette anchor: cream background, reward orange for hero objects, coral
// for accents, navy ink for any text. Soft and warm — kids materials need
// brighter exposure than tech because there's less specular contrast.

export const kidsPreset: Preset = {
  id: "kids",
  scene: {
    background: colors.cream,
    hdriPath: "hdri/studio_small_09_1k.hdr",
    enableEnvironment: true,
    enableContactShadows: true,
    fillLightIntensity: 0.35,
    toneMappingExposure: 1.15,
  },
  stage: {
    floorColor: colors.paleCream,
    wallColor: colors.cream,
    rimColor: colors.coral,
    rimIntensity: 10,
  },
  accent: colors.reward,
  effectDefaults: {
    "topic-card-3d": {
      // Topic intro card. Ceramic in warm cream — like a softly lit object
      // on a paper surface. The lesson title sits on this.
      material: "ceramic",
      materialProps: {
        color: colors.cream,
      },
    },
    "glass-caption": {
      // Title or section-name caption. Warm-tinted glass so it sits in the
      // cream palette instead of fighting it with cool aquamarine.
      material: "glass",
      materialProps: {
        attenuationColor: colors.paleCream,
        iridescence: 0.2,
      },
    },
    "portal-ring": {
      // Section handoff. Iridescent allowed — but tuned to the cream
      // palette, not the kit's default cool baseColor.
      material: "iridescent",
      materialProps: {
        baseColor: colors.lavender,
      },
    },
    "floating-screen": {
      sceneOverrides: {
        background: colors.cream,
      },
    },
  },
};
