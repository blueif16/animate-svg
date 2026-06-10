// Scene-mountable style COMPONENT barrel — the registry discovery selector for
// the style family's WRAPPER component.
//
// NOTE the distinction the registry already encodes: `styles[]` tracks style
// IDS (the membership-gated aesthetic overlays — "default", "ink-wash"), whereas
// this barrel surfaces the React COMPONENT a scene mounts to apply one (the root
// <StylePreset style=…> wrapper). The full styles/index.ts barrel also exports
// hooks (useStyle…), a React context object, and ink-wash internals
// (InkWashDefs/Background, INK_WASH_* constants) that a scene never mounts
// directly; this barrel re-exports ONLY the wrapper so the registry catalogs the
// scene-facing surface and not those internals.
//
// Lesson-agnostic: the wrapper is the same for every lesson — the per-lesson
// choice is just the `style` prop value (a style id from `styles[]`).
export { StylePreset } from "./StylePreset";
