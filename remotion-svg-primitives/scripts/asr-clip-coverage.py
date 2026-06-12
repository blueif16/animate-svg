#!/usr/bin/env python3
# Per-CLIP ASR for the Wave-3a truncation gate (lesson-audio-gate.mjs).
#
# WHY THIS EXISTS — generation-independent coverage. The truncation gate needs a
# "what was ACTUALLY said on this cue" signal that does NOT depend on which TTS
# model produced the audio. The Gemini Live model used to self-report a per-cue
# transcriptText; the dedicated-TTS model (gemini-3.1-flash-tts-preview) DROPS
# that self-report. ASR runs on the rendered WAV regardless of the TTS path, so
# it is the durable source. The kit's whole-recording asr-align.py emits per-cue
# `asrText` only as a window EXCERPT of one continuous transcript (overlapping,
# unreliable per cue) — so this helper ASRs each per-cue CLIP WAV directly,
# giving a clean per-cue transcription the gate can compute coverage from.
#
# Pure sidecar: reads a JSON spec on argv[1], prints {clipPath: asrText} JSON on
# stdout. The gate shells out to it with the sherpa config from voice.json and
# SKIPs coverage(a) gracefully if this helper (or its deps) is unavailable — the
# gate never blocks on ASR being installed.
#
# Spec (argv[1], JSON): {decoder,encoder,joiner,tokens, sampleRate, clips:[abs]}.

import json
import subprocess
import sys


def main() -> None:
    if len(sys.argv) < 2:
        print("{}")
        return
    cfg = json.loads(sys.argv[1])

    # Imported lazily so a missing dep degrades to an empty result (→ gate SKIPs
    # coverage(a)) rather than crashing the build.
    import numpy as np
    import sherpa_onnx

    sample_rate = int(cfg["sampleRate"])
    recognizer = sherpa_onnx.OnlineRecognizer.from_transducer(
        encoder=cfg["encoder"],
        decoder=cfg["decoder"],
        joiner=cfg["joiner"],
        tokens=cfg["tokens"],
        num_threads=2,
        sample_rate=sample_rate,
        feature_dim=80,
        decoding_method="greedy_search",
        # No endpoint detection: each clip is ONE trimmed utterance — we want its
        # full transcription, not segmented sub-utterances.
        enable_endpoint_detection=False,
        provider="cpu",
    )

    def load_audio(path: str) -> "np.ndarray":
        raw = subprocess.check_output(
            ["ffmpeg", "-v", "error", "-i", path, "-ac", "1",
             "-ar", str(sample_rate), "-f", "s16le", "-"]
        )
        return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0

    def transcribe(path: str) -> str:
        stream = recognizer.create_stream()
        samples = load_audio(path)
        chunk = int(0.1 * sample_rate)
        for offset in range(0, len(samples), chunk):
            stream.accept_waveform(sample_rate, samples[offset:offset + chunk])
            while recognizer.is_ready(stream):
                recognizer.decode_stream(stream)
        # Flush with a short tail of silence so the last token decodes.
        stream.accept_waveform(sample_rate, np.zeros(int(0.5 * sample_rate), dtype=np.float32))
        stream.input_finished()
        while recognizer.is_ready(stream):
            recognizer.decode_stream(stream)
        return recognizer.get_result(stream).strip()

    result = {}
    for clip_path in cfg["clips"]:
        try:
            result[clip_path] = transcribe(clip_path)
        except Exception:  # noqa: BLE001 — one bad clip must not kill the rest
            result[clip_path] = None
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    try:
        main()
    except Exception:  # noqa: BLE001 — any failure → empty result, gate SKIPs coverage(a)
        print("{}")
