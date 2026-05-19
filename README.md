# Animation Test — Lesson Video Pipeline

A Remotion-based pipeline for early-childhood lesson videos. The main agent orchestrates; specialist subagents own discrete artifacts; one config file drives the renderer end-to-end.

## End-to-End Flow

```mermaid
flowchart TD
    Idea([Lesson idea])

    subgraph Plan["Phase A — Planning (parallel subagents)"]
        SB[storyboard sub<br/>skill: lesson-storyboard]
        VD[visual-design sub<br/>skill: early-childhood-visual-taste]
        AC[audio/caption sub<br/>skill: lesson-audio-captions]
        SK[sketch-layer sub<br/>skill: sketch-explainer-layer]
    end

    Cues[/lesson-data/&lt;id&gt;/script-cues.json/]

    subgraph Prims["Phase B — Primitives"]
        Gap{Gap in<br/>src/shape-primitives/?}
        PB[primitive-builder sub<br/>owns: src/shape-primitives/]
    end

    subgraph Comp["Phase C — Composition"]
        CO[composer sub<br/>skill: remotion-lesson-composer]
        Scene[/src/lessons/&lt;Lesson&gt;Scene.tsx + timeline/]
    end

    Cfg[/lesson-data/&lt;id&gt;/pipeline.json/]

    subgraph Pipe["Phase D — npm run lesson:render"]
        V[voice gen<br/>generate-gemini-voice.mjs]
        A[ASR align<br/>asr-align-lesson.py]
        ASR[/asr-alignment.json/]
        Fix[main inspects ASR<br/>corrects cue timing]
        L[lint]
        B[bundle]
        R[render MP4]
    end

    subgraph Ver["Phase E — Verification"]
        VS[verification sub<br/>skill: lesson-verification]
    end

    MP4([Final MP4])

    Idea --> Plan
    SB --> Cues
    VD --> Cues
    AC --> Cues
    SK --> Cues
    Cues --> Gap
    Gap -- yes --> PB --> CO
    Gap -- no --> CO
    CO --> Scene
    Scene --> Cfg
    Cfg --> V --> A --> ASR --> Fix --> L --> B --> R --> VS --> MP4

    classDef sub fill:#e0f2fe,stroke:#0369a1,color:#0c4a6e
    classDef art fill:#fef3c7,stroke:#b45309,color:#78350f
    classDef step fill:#dcfce7,stroke:#15803d,color:#14532d
    class SB,VD,AC,SK,PB,CO,VS sub
    class Cues,Cfg,ASR,Scene art
    class V,A,L,B,R,Fix step
```

## Skill ↔ Subagent Map

The main agent loads `complete-video-pipeline` as its orchestrator overview. Each subagent is spawned with one focused skill:

| Phase | Subagent          | Skill                          | Owns                                       | Output                                       |
| ----- | ----------------- | ------------------------------ | ------------------------------------------ | -------------------------------------------- |
| A     | storyboard        | `lesson-storyboard`            | (planning only)                            | cue IDs, narration beats, required visuals   |
| A     | visual design     | `early-childhood-visual-taste` | (planning only)                            | object choices, layout, tone, clarity risks  |
| A     | audio / captions  | `lesson-audio-captions`        | (planning only)                            | teacher script, caption text, cue boundaries |
| A     | sketch layer      | `sketch-explainer-layer`       | (planning only)                            | teacher-mark / pointer plan                  |
| B     | primitive builder | (none — design rule)           | `src/shape-primitives/` + focused demos    | new prop-driven primitives                   |
| C     | composer          | `remotion-lesson-composer`     | `src/lessons/<Lesson>*.tsx` + timeline     | composed scene, timing from cues             |
| E     | verification      | `lesson-verification`          | (read-only review)                         | render-readiness report                      |

The main agent itself owns: `lesson-data/<id>/pipeline.json`, ASR cue-timing corrections, and merging subagent artifacts.

## Per-Lesson Artifacts

Everything lesson-specific lives in `remotion-svg-primitives/lesson-data/<lesson-id>/`:

```
pipeline.json         # config the renderer reads (composition, entry, output, voice, paths)
script-cues.json      # narration + cue plan (from Phase A)
gemini-voice.json     # voice-gen output metadata
asr-alignment.json    # detected transcript + token timings (production artifact, not a gate)
```

Reusable code under `remotion-svg-primitives/src/` stays lesson-agnostic — no lesson topics, copy, timings, or paths hardcoded.

## Single Entry Point

```bash
cd remotion-svg-primitives
npm run lesson:render -- --config lesson-data/<lesson-id>/pipeline.json
```

The runner script executes, in order: voice generation → ASR alignment → lint+typecheck → bundle → `remotion render` → ffprobe of the output. Add `-- --skip-voice` to reuse an existing aligned voice file (e.g. after fixing cue timing).

## ASR Alignment

ASR output is an owned artifact, not a pass/fail check. After voice gen the main agent inspects the detected transcript, token events, timestamps, and tokenizer settings, then corrects cue timing in `script-cues.json` from evidence before re-rendering with `--skip-voice`.

## Dev

- `npm run dev` — Remotion studio (live preview)
- `npm run lint` — ESLint + `tsc`
