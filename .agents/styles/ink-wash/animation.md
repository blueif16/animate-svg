# Ink-wash motion vocabulary

**Inheritance.** Ink-wash inherits the full default motion vocabulary (`EASE.*`, `SPRING.*`, `<PopIn>`, `<TeacherMark>`). Identity-invariance still holds.

**Tweaks for this style.**
- Prefer `EASE.outCubic` / `EASE.outQuint` over `EASE.overshoot` for entrances. Wet-edge ink reads against snap accents.
- Prefer `SPRING.smooth` over `SPRING.snappy` for camera-class moves.
- `<PopIn motion="bouncy">` allowed, but cap to 1 per video — the bouncy three-stop interpolate's overshoot looks like ink splash if used liberally.
- Boil and settle on `<TeacherMark>` look excellent under ink-wash. Increase `boil.magnitude` by ~25% over default (e.g., 4 → 5) to compensate for the bleed softening edges.
- Breathing micro-loop (`<Breathe>`) at amplitude 1.02–1.025 — lower than default; the medium itself already implies softness.
