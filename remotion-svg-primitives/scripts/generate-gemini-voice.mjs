#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const parseArgs = (argv) => {
  const args = {
    align: false,
    alignOutJson: undefined,
    alignOutTs: undefined,
    apiKey: process.env.GOOGLE_API_KEY,
    apiKeyEnvFile: undefined,
    apiVersion: undefined,
    asrDecoder: undefined,
    asrEncoder: undefined,
    asrJoiner: undefined,
    asrSampleRate: undefined,
    asrScript: undefined,
    asrTokens: undefined,
    config: undefined,
    constPrefix: undefined,
    cuePlan: undefined,
    debug: false,
    gapSeconds: undefined,
    generationMode: undefined,
    genaiEntry: process.env.GENAI_ENTRY,
    lessonId: undefined,
    maxClipSeconds: undefined,
    metaOut: undefined,
    model: undefined,
    out: undefined,
    promptTemplate: undefined,
    renderFps: undefined,
    scriptField: undefined,
    sherpaPython: process.env.SHERPA_PYTHON,
    timingImportPath: undefined,
    timeoutMs: 90_000,
    tokenPattern: undefined,
    voiceName: undefined,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--align") {
      args.align = true;
    } else if (arg === "--debug") {
      args.debug = true;
    } else if (arg.startsWith("--")) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, char) =>
        char.toUpperCase(),
      );
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for ${arg}`);
      }
      args[key] =
        key === "timeoutMs" || key === "renderFps" || key === "asrSampleRate"
          || key === "gapSeconds"
          || key === "maxClipSeconds"
          ? Number(value)
          : value;
      index += 1;
    }
  }

  return args;
};

const mergeConfig = async (args) => {
  if (!args.config) {
    return args;
  }

  const config = JSON.parse(await fs.readFile(args.config, "utf8"));
  const voice = config.voice ?? {};
  const asr = voice.asr ?? {};

  return {
    ...args,
    alignOutJson: args.alignOutJson ?? voice.alignOutJson,
    alignOutTs: args.alignOutTs ?? voice.alignOutTs,
    apiKeyEnvFile: args.apiKeyEnvFile ?? voice.apiKeyEnvFile,
    asrDecoder: args.asrDecoder ?? asr.decoder,
    asrEncoder: args.asrEncoder ?? asr.encoder,
    asrJoiner: args.asrJoiner ?? asr.joiner,
    asrSampleRate: args.asrSampleRate ?? asr.sampleRate,
    asrScript: args.asrScript ?? voice.asrScript,
    asrTokens: args.asrTokens ?? asr.tokens,
    constPrefix: args.constPrefix ?? voice.constPrefix,
    cuePlan: args.cuePlan ?? config.cuePlan,
    gapSeconds: args.gapSeconds ?? voice.gapSeconds,
    generationMode: args.generationMode ?? voice.generationMode,
    genaiEntry: args.genaiEntry ?? voice.genaiEntry,
    lessonId: args.lessonId ?? config.lessonId,
    maxClipSeconds: args.maxClipSeconds ?? voice.maxClipSeconds,
    metaOut: args.metaOut ?? voice.metaOut,
    model: args.model ?? voice.model,
    out: args.out ?? voice.out,
    promptTemplate: args.promptTemplate ?? voice.promptTemplate,
    renderFps: args.renderFps ?? config.fps,
    scriptField: args.scriptField ?? voice.scriptField,
    sherpaPython: args.sherpaPython ?? voice.sherpaPython,
    timingImportPath: args.timingImportPath ?? asr.timingImportPath,
    timeoutMs: args.timeoutMs ?? voice.timeoutMs,
    tokenPattern: args.tokenPattern ?? asr.tokenPattern,
    voiceName: args.voiceName ?? voice.voiceName,
  };
};

const requireFields = (args, fields) => {
  const missing = fields.filter((field) => !args[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required option(s): ${missing.join(", ")}`);
  }
};

const parseEnvLine = (line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }
  const separator = trimmed.indexOf("=");
  if (separator === -1) {
    return null;
  }
  const key = trimmed.slice(0, separator).trim();
  let value = trimmed.slice(separator + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return [key, value];
};

const loadApiKey = async (explicitKey, envFile) => {
  if (explicitKey) {
    return explicitKey;
  }

  if (envFile) {
    if (!existsSync(envFile)) {
      throw new Error(`Configured API key env file does not exist: ${envFile}`);
    }
    const content = await fs.readFile(envFile, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const parsed = parseEnvLine(line);
      if (parsed?.[0] === "GOOGLE_API_KEY" && parsed[1]) {
        return parsed[1];
      }
    }
  }

  throw new Error("Missing GOOGLE_API_KEY. Set it in the environment or configure voice.apiKeyEnvFile.");
};

const loadScriptLines = async (cuePlanPath, scriptField) => {
  const cuePlan = JSON.parse(await fs.readFile(cuePlanPath, "utf8"));
  return cuePlan.cues
    .map((cue, index) => {
      const value = cue[scriptField];
      if (typeof value !== "string" || value.trim() === "") {
        throw new Error(
          `Cue ${index} in ${cuePlanPath} is missing voice script field "${scriptField}".`,
        );
      }
      return value.trim();
    });
};

const buildPrompt = ({ promptTemplate, script }) => {
  if (!promptTemplate.includes("{{script}}")) {
    throw new Error('voice.promptTemplate must include "{{script}}".');
  }
  return promptTemplate.replaceAll("{{script}}", script);
};

const wavHeader = ({ dataBytes, sampleRate }) => {
  const header = Buffer.alloc(44);
  const byteRate = sampleRate * 2;
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataBytes, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataBytes, 40);
  return header;
};

const parseSampleRate = (mimeType) => {
  const match = /rate=(\d+)/.exec(mimeType || "");
  return match ? Number(match[1]) : 24_000;
};

const writeWav = async ({ chunks, out, sampleRate }) => {
  const data = Buffer.concat(chunks);
  const header = wavHeader({ dataBytes: data.length, sampleRate });
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, Buffer.concat([header, data]));
  return {
    bytes: data.length + header.length,
    durationSeconds: Number((data.length / 2 / sampleRate).toFixed(3)),
  };
};

const generateAudioClip = async ({ ai, args, modality, script }) => {
  const prompt = buildPrompt({ promptTemplate: args.promptTemplate, script });

  const chunks = [];
  const transcripts = [];
  let sampleRate = 24_000;
  let session;

  const done = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timed out after ${args.timeoutMs}ms waiting for audio.`));
    }, args.timeoutMs);

    ai.live
      .connect({
        callbacks: {
          onclose: (event) => {
            if (args.debug) {
              console.error(
                JSON.stringify({
                  closeCode: event?.code,
                  closeReason: event?.reason,
                  type: "close",
                }),
              );
            }
            clearTimeout(timeout);
            resolve();
          },
          onerror: (event) => {
            clearTimeout(timeout);
            reject(new Error(event.message || "Gemini Live API error"));
          },
          onmessage: (message) => {
            if (args.debug) {
              console.error(
                JSON.stringify({
                  dataLength: message.data?.length ?? 0,
                  generationComplete:
                    message.serverContent?.generationComplete ?? false,
                  hasModelTurn: Boolean(message.serverContent?.modelTurn),
                  partCount:
                    message.serverContent?.modelTurn?.parts?.length ?? 0,
                  setupComplete: Boolean(message.setupComplete),
                  turnComplete: message.serverContent?.turnComplete ?? false,
                }),
              );
            }
            const parts = message.serverContent?.modelTurn?.parts ?? [];
            let sawInlineData = false;
            for (const part of parts) {
              const inlineData = part.inlineData;
              if (inlineData?.data) {
                sampleRate = parseSampleRate(inlineData.mimeType);
                chunks.push(Buffer.from(inlineData.data, "base64"));
                sawInlineData = true;
              }
              if (part.text) {
                transcripts.push(part.text);
              }
            }

            if (!sawInlineData && message.data) {
              chunks.push(Buffer.from(message.data, "base64"));
            }

            const outputText = message.serverContent?.outputTranscription?.text;
            if (outputText) {
              transcripts.push(outputText);
            }

            if (
              message.serverContent?.generationComplete ||
              message.serverContent?.turnComplete
            ) {
              clearTimeout(timeout);
              resolve();
            }
          },
          onopen: () => {
            if (args.debug) {
              console.error(JSON.stringify({ type: "open" }));
            }
          },
        },
        config: {
          responseModalities: [modality.AUDIO],
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: args.voiceName,
              },
            },
          },
          temperature: 0,
        },
        model: args.model,
      })
      .then((connectedSession) => {
        session = connectedSession;
        session.sendRealtimeInput({ text: prompt });
      })
      .catch((error) => {
        clearTimeout(timeout);
        reject(error);
      });
  });

  try {
    await done;
  } finally {
    session?.close();
  }

  if (chunks.length === 0) {
    throw new Error("Gemini returned no audio chunks.");
  }

  return {
    chunks,
    sampleRate,
    transcriptText: transcripts.join("").trim(),
  };
};

const silenceChunk = ({ sampleRate, seconds }) =>
  Buffer.alloc(Math.max(0, Math.round(sampleRate * seconds * 2)));

const truncateChunks = ({ chunks, maxBytes }) => {
  const truncated = [];
  let remaining = maxBytes;

  for (const chunk of chunks) {
    if (remaining <= 0) {
      break;
    }
    if (chunk.length <= remaining) {
      truncated.push(chunk);
      remaining -= chunk.length;
    } else {
      truncated.push(chunk.subarray(0, remaining));
      remaining = 0;
    }
  }

  return truncated;
};

const generateVoice = async (args) => {
  const apiKey = await loadApiKey(args.apiKey, args.apiKeyEnvFile);
  const scriptLines = await loadScriptLines(args.cuePlan, args.scriptField);
  const { GoogleGenAI, Modality } = await import(
    pathToFileURL(args.genaiEntry).href
  );
  const ai = new GoogleGenAI({
    apiKey,
    ...(args.apiVersion ? { apiVersion: args.apiVersion } : {}),
  });

  const scripts =
    args.generationMode === "single"
      ? [scriptLines.join("\n")]
      : args.generationMode === "perCue"
        ? scriptLines
        : [];

  if (scripts.length === 0) {
    throw new Error(`Unsupported voice.generationMode: ${args.generationMode}`);
  }

  const allChunks = [];
  const transcripts = [];
  let sampleRate;

  for (let index = 0; index < scripts.length; index += 1) {
    const clip = await generateAudioClip({
      ai,
      args,
      modality: Modality,
      script: scripts[index],
    });
    if (sampleRate === undefined) {
      sampleRate = clip.sampleRate;
    }
    if (sampleRate !== clip.sampleRate) {
      throw new Error("Generated clips used inconsistent sample rates.");
    }
    const chunks =
      args.maxClipSeconds === undefined
        ? clip.chunks
        : truncateChunks({
            chunks: clip.chunks,
            maxBytes: Math.round(sampleRate * args.maxClipSeconds * 2),
          });
    allChunks.push(...chunks);
    transcripts.push(clip.transcriptText);
    if (args.generationMode === "perCue" && index < scripts.length - 1) {
      allChunks.push(
        silenceChunk({ sampleRate, seconds: Number(args.gapSeconds) }),
      );
    }
  }

  const script = scriptLines.join("\n");
  const wav = await writeWav({
    chunks: allChunks,
    out: args.out,
    sampleRate,
  });
  await fs.mkdir(path.dirname(args.metaOut), { recursive: true });
  await fs.writeFile(
    args.metaOut,
    `${JSON.stringify(
      {
        chunkCount: allChunks.length,
        durationSeconds: wav.durationSeconds,
        generationMode: args.generationMode,
        maxClipSeconds: args.maxClipSeconds,
        model: args.model,
        output: args.out,
        sampleRate,
        script,
        source: "Gemini Live API",
        transcriptText: transcripts.filter(Boolean).join("\n").trim(),
        voiceName: args.voiceName,
        wavBytes: wav.bytes,
      },
      null,
      2,
    )}\n`,
  );

  return wav;
};

const runAlignment = (args) => {
  execFileSync(
    args.sherpaPython,
    [
      args.asrScript,
      "--lesson-id",
      args.lessonId,
      "--recording",
      args.out,
      "--cue-plan",
      args.cuePlan,
      "--out-json",
      args.alignOutJson,
      "--out-ts",
      args.alignOutTs,
      "--const-prefix",
      args.constPrefix,
      "--fps",
      String(args.renderFps),
      "--sample-rate",
      String(args.asrSampleRate),
      "--token-pattern",
      args.tokenPattern,
      "--timing-import",
      args.timingImportPath,
      "--encoder",
      args.asrEncoder,
      "--decoder",
      args.asrDecoder,
      "--joiner",
      args.asrJoiner,
      "--tokens-file",
      args.asrTokens,
    ],
    {
      stdio: "inherit",
    },
  );
};

const main = async () => {
  const args = await mergeConfig(parseArgs(process.argv.slice(2)));
  requireFields(args, ["cuePlan", "lessonId", "metaOut", "out"]);
  requireFields(args, [
    "genaiEntry",
    "generationMode",
    "model",
    "promptTemplate",
    "scriptField",
    "voiceName",
  ]);
  if (args.align) {
    requireFields(args, [
      "alignOutJson",
      "alignOutTs",
      "asrDecoder",
      "asrEncoder",
      "asrJoiner",
      "asrSampleRate",
      "asrScript",
      "asrTokens",
      "constPrefix",
      "renderFps",
      "sherpaPython",
      "timingImportPath",
      "tokenPattern",
    ]);
  }
  const wav = await generateVoice(args);
  console.log(`Wrote ${args.out} (${wav.durationSeconds}s)`);
  console.log(`Wrote ${args.metaOut}`);
  if (args.align) {
    runAlignment(args);
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
