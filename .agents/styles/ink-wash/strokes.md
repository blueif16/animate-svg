# Ink-wash strokes

**Stroke width.** Default `strokeWidth` of 4 (TeacherMark default) reads fine. Optionally bump to 5 for climax marks.
**Stroke color.** All strokes pass through the primary filter; original `stroke` color is displaced + blurred + alpha-thresholded. No per-stroke change needed.
**Stroke caps.** Keep `strokeLinecap="round"` and `strokeLinejoin="round"` everywhere — the filter chain assumes round terminals and edges artifact on miter joins.
**Brush pattern.** Available but not default. `INK_WASH_FILTER_IDS.brush` is a diagonal-line ink pattern usable as a `fill="url(#style-ink-wash-brush)"` on countables for the rare case a primitive wants a textured ink fill. Use sparingly.
