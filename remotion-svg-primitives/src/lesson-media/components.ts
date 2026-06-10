// Scene-mountable lesson-media COMPONENT barrel — the registry discovery
// selector for this family.
//
// The capability registry discovers "what a scene can mount" from barrels (see
// scripts/registry/build-registry.mjs). This directory has helpers + types +
// shims mixed together; this barrel re-exports ONLY the React components a
// Complete<Lesson> wrapper actually mounts, so the generator catalogs exactly
// the scene-facing surface and never the internal helpers (audioMix,
// captionKeywords, mediaSrc, …) or types.
//
// Lesson-agnostic: these are the audio/caption layers EVERY lesson composes
// with — never a lesson topic.
export { LessonAudioLayer } from "./LessonAudioLayer";
export { LessonBgmLayer } from "./LessonBgmLayer";
export { LessonSfxLayer } from "./LessonSfxLayer";
export { LessonCaptionLayer } from "./LessonCaptionLayer";
