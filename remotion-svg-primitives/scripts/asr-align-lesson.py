#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import subprocess
from dataclasses import dataclass
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any

import numpy as np
import sherpa_onnx


@dataclass(frozen=True)
class Cue:
    caption: str
    emphasis: bool
    id: str
    phrase: str


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Align a lesson voice recording to planned cue phrases."
    )
    parser.add_argument("--decoder", type=Path, required=True)
    parser.add_argument("--encoder", type=Path, required=True)
    parser.add_argument("--lesson-id", required=True)
    parser.add_argument("--joiner", type=Path, required=True)
    parser.add_argument("--const-prefix", required=True)
    parser.add_argument("--recording", type=Path, required=True)
    parser.add_argument(
        "--cue-plan",
        type=Path,
        required=True,
    )
    parser.add_argument("--fps", type=int, required=True)
    parser.add_argument("--sample-rate", type=int, required=True)
    parser.add_argument("--timing-import", required=True)
    parser.add_argument("--token-pattern", required=True)
    parser.add_argument("--tokens-file", type=Path, required=True)
    parser.add_argument(
        "--out-json",
        type=Path,
        required=True,
    )
    parser.add_argument(
        "--out-ts",
        type=Path,
        required=True,
    )
    return parser.parse_args()


def load_cues(path: Path) -> list[Cue]:
    with path.open() as f:
        data = json.load(f)

    return [
        Cue(
            caption=str(item["caption"]),
            emphasis=bool(item.get("emphasis", False)),
            id=str(item["id"]),
            phrase=str(item["phrase"]),
        )
        for item in data["cues"]
    ]


def build_asr(args: argparse.Namespace) -> sherpa_onnx.OnlineRecognizer:
    assets = {
        "decoder": args.decoder,
        "encoder": args.encoder,
        "joiner": args.joiner,
        "tokens": args.tokens_file,
    }
    missing = [str(path) for path in assets.values() if not path.exists()]
    if missing:
        raise FileNotFoundError("Missing Sherpa-ONNX ASR assets:\n" + "\n".join(missing))

    return sherpa_onnx.OnlineRecognizer.from_transducer(
        encoder=str(assets["encoder"]),
        decoder=str(assets["decoder"]),
        joiner=str(assets["joiner"]),
        tokens=str(assets["tokens"]),
        num_threads=2,
        sample_rate=args.sample_rate,
        feature_dim=80,
        decoding_method="greedy_search",
        enable_endpoint_detection=True,
        rule1_min_trailing_silence=2.4,
        rule2_min_trailing_silence=0.8,
        rule3_min_utterance_length=20.0,
        provider="cpu",
    )


def load_audio(recording: Path, sample_rate: int) -> np.ndarray:
    raw = subprocess.check_output(
        [
            "ffmpeg",
            "-v",
            "error",
            "-i",
            str(recording),
            "-ac",
            "1",
            "-ar",
            str(sample_rate),
            "-f",
            "s16le",
            "-",
        ]
    )
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0


def tokens(text: str, token_re: re.Pattern[str]) -> list[str]:
    return [match.group(0).lower() for match in token_re.finditer(text)]


def token_text(items: list[str]) -> str:
    return " ".join(items)


def decode(
    recognizer: sherpa_onnx.OnlineRecognizer,
    samples: np.ndarray,
    sample_rate: int,
    token_re: re.Pattern[str],
) -> dict[str, Any]:
    stream = recognizer.create_stream()
    chunk_size = int(0.05 * sample_rate)
    current_start: float | None = None
    previous_tokens: list[str] = []
    token_events: list[dict[str, Any]] = []
    segments: list[dict[str, Any]] = []

    def accept_result(end_time: float) -> None:
        nonlocal current_start, previous_tokens, stream
        text = recognizer.get_result(stream).strip()
        if text or current_start is not None:
            segments.append(
                {
                    "end": round(end_time, 2),
                    "start": round(current_start or 0, 2),
                    "text": text,
                    "tokens": tokens(text, token_re),
                }
            )
        recognizer.reset(stream)
        current_start = None
        previous_tokens = []

    for offset in range(0, len(samples), chunk_size):
        end = min(offset + chunk_size, len(samples))
        end_time = end / sample_rate
        stream.accept_waveform(sample_rate, samples[offset:end])
        while recognizer.is_ready(stream):
            recognizer.decode_stream(stream)

        text = recognizer.get_result(stream).strip()
        current_tokens = tokens(text, token_re)
        if current_tokens and current_start is None:
            current_start = max(0.0, offset / sample_rate - 0.2)

        shared_prefix = 0
        for previous, current in zip(previous_tokens, current_tokens):
            if previous != current:
                break
            shared_prefix += 1

        for token in current_tokens[shared_prefix:]:
            token_events.append({"time": round(end_time, 2), "token": token})
        previous_tokens = current_tokens

        if current_start is not None and recognizer.is_endpoint(stream):
            accept_result(end_time)

    stream.accept_waveform(sample_rate, np.zeros(int(0.8 * sample_rate), dtype=np.float32))
    stream.input_finished()
    while recognizer.is_ready(stream):
        recognizer.decode_stream(stream)
    if recognizer.get_result(stream).strip() or current_start is not None:
        accept_result(len(samples) / sample_rate)

    return {
        "duration": round(len(samples) / sample_rate, 3),
        "segments": segments,
        "tokenEvents": token_events,
    }


def score_window(target: list[str], window: list[str]) -> float:
    target_text = token_text(target)
    window_text = token_text(window)
    score = SequenceMatcher(None, target_text, window_text).ratio()
    score -= abs(len(window) - len(target)) * 0.02
    return score


def best_phrase_match(
    token_events: list[dict[str, Any]],
    phrase: str,
    min_time: float,
    token_re: re.Pattern[str],
) -> dict[str, Any]:
    target = tokens(phrase, token_re)
    candidates = [
        (index, item)
        for index, item in enumerate(token_events)
        if float(item["time"]) >= min_time
    ]
    if not target or not candidates:
        return {
            "confidence": "asr-low-evidence",
            "end": max(min_time + 0.35, min_time),
            "matchScore": 0,
            "matchText": "",
            "start": min_time,
            "targetTokens": target,
            "tokenEndIndex": None,
            "tokenStartIndex": None,
        }

    best: dict[str, Any] | None = None
    min_len = max(1, len(target) - 3)
    max_len = min(len(candidates), len(target) + 6)

    for local_start in range(len(candidates)):
        for length in range(min_len, max_len + 1):
            local_end = local_start + length
            if local_end > len(candidates):
                continue

            window = candidates[local_start:local_end]
            window_tokens = [str(item["token"]) for _, item in window]
            score = score_window(target, window_tokens)
            if best is None or score > float(best["matchScore"]):
                start_index = window[0][0]
                end_index = window[-1][0]
                best = {
                    "confidence": "asr-derived" if score >= 0.58 else "asr-low-evidence",
                    "end": round(float(window[-1][1]["time"]) + 0.12, 2),
                    "matchScore": round(score, 3),
                    "matchText": token_text(window_tokens),
                    "start": round(max(0.0, float(window[0][1]["time"]) - 0.2), 2),
                    "targetTokens": target,
                    "tokenEndIndex": end_index,
                    "tokenStartIndex": start_index,
                }

    assert best is not None
    return best


def transcript_excerpt(
    token_events: list[dict[str, Any]],
    start_index: int | None,
    end_index: int | None,
) -> str:
    if start_index is None or end_index is None:
        return ""

    start = max(0, start_index - 4)
    end = min(len(token_events), end_index + 5)
    return token_text([str(item["token"]) for item in token_events[start:end]])


def align_cues(
    cues: list[Cue],
    transcript: dict[str, Any],
    fps: int,
    token_re: re.Pattern[str],
) -> list[dict[str, Any]]:
    token_events = transcript["tokenEvents"]
    aligned: list[dict[str, Any]] = []
    min_time = 0.0

    for cue in cues:
        match = best_phrase_match(token_events, cue.phrase, min_time, token_re)
        start = float(match["start"])
        end = max(float(match["end"]), start + 0.25)
        aligned_cue = {
            "asrText": transcript_excerpt(
                token_events,
                match["tokenStartIndex"],
                match["tokenEndIndex"],
            ),
            "caption": cue.caption,
            "confidence": match["confidence"],
            "emphasis": cue.emphasis,
            "endFrame": round(end * fps),
            "endSeconds": round(end, 2),
            "id": cue.id,
            "matchScore": match["matchScore"],
            "matchText": match["matchText"],
            "phrase": cue.phrase,
            "startFrame": round(start * fps),
            "startSeconds": round(start, 2),
            "targetTokens": match["targetTokens"],
        }
        aligned.append(aligned_cue)
        min_time = max(min_time, start + 0.18)

    for index, cue in enumerate(aligned[:-1]):
        next_start = float(aligned[index + 1]["startSeconds"])
        if float(cue["endSeconds"]) >= next_start:
            end = max(float(cue["startSeconds"]) + 0.25, next_start - 0.05)
            cue["endSeconds"] = round(end, 2)
            cue["endFrame"] = round(end * fps)

    return aligned


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
        f.write("\n")


def write_ts(
    path: Path,
    cues: list[dict[str, Any]],
    duration_seconds: float,
    fps: int,
    const_prefix: str,
    timing_import: str,
) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    slim_cues = []
    for cue in cues:
        slim = {key: value for key, value in cue.items() if value not in (None, False, "")}
        slim_cues.append(slim)

    last_cue_frame = max((int(cue["endFrame"]) for cue in cues), default=0)
    duration_frames = max(last_cue_frame + round(0.6 * fps), round(duration_seconds * fps))
    body = json.dumps(slim_cues, ensure_ascii=False, indent=2)
    path.write_text(
        "\n".join(
            [
                f'import type {{ AlignedLessonCue }} from "{timing_import}";',
                "",
                f"export const {const_prefix}AlignedDuration = {duration_frames};",
                "",
                f"export const {const_prefix}AlignedCues = {body} satisfies AlignedLessonCue[];",
                "",
            ]
        )
    )


def main() -> None:
    args = parse_args()
    token_re = re.compile(args.token_pattern, re.IGNORECASE)
    cues = load_cues(args.cue_plan)
    recognizer = build_asr(args)
    transcript = decode(
        recognizer,
        load_audio(args.recording, args.sample_rate),
        args.sample_rate,
        token_re,
    )
    aligned = align_cues(cues, transcript, args.fps, token_re)
    payload = {
        "fps": args.fps,
        "lessonId": args.lesson_id,
        "asrAssets": {
            "decoder": str(args.decoder),
            "encoder": str(args.encoder),
            "joiner": str(args.joiner),
            "tokens": str(args.tokens_file),
        },
        "recording": str(args.recording),
        "source": "local sherpa-onnx streaming ASR",
        "status": "asr-derived",
        "transcript": transcript,
        "cues": aligned,
    }
    write_json(args.out_json, payload)
    write_ts(
        args.out_ts,
        aligned,
        float(transcript["duration"]),
        args.fps,
        args.const_prefix,
        args.timing_import,
    )
    print(args.out_json)
    print(args.out_ts)


if __name__ == "__main__":
    main()
