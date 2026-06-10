// Scene-mountable transition COMPONENT barrel — the registry discovery selector
// for the lesson-transition family.
//
// The capability registry discovers "what a scene can mount" from barrels (see
// scripts/registry/build-registry.mjs). These are the decorative 3D moments a
// lesson composes between sections (topic-intro card, section handoff). They are
// lesson-agnostic and decorative-only (never teaching primitives — see the 3D
// rules in CLAUDE.md).
export { TopicIntroCard } from "./TopicIntroCard";
export { SectionHandoff } from "./SectionHandoff";
