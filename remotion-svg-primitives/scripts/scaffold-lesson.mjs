#!/usr/bin/env node
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const parseArgs = (argv) => {
  const args = { id: undefined, composition: undefined, force: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--force") {
      args.force = true;
    } else if (arg.startsWith("--")) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for ${arg}`);
      }
      args[key] = value;
      i += 1;
    }
  }
  return args;
};

const toCamel = (kebab) =>
  kebab.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

const toPascal = (kebab) => {
  const camel = toCamel(kebab);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
};

const isValidLessonId = (id) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(id);

const substitute = (template, values) =>
  template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in values)) {
      throw new Error(`Template placeholder {{${key}}} has no value`);
    }
    return values[key];
  });

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  if (!args.id) {
    throw new Error("Missing --id <lessonId> (kebab-case, e.g. ten-ones-make-one-ten)");
  }
  if (!isValidLessonId(args.id)) {
    throw new Error(`Invalid lessonId "${args.id}". Use kebab-case: lowercase letters, digits, hyphens.`);
  }

  const lessonDir = path.join("lesson-data", args.id);
  const pipelinePath = path.join(lessonDir, "pipeline.json");

  if (existsSync(pipelinePath) && !args.force) {
    throw new Error(`${pipelinePath} already exists. Re-run with --force to overwrite.`);
  }

  const templatePath = path.join("lesson-data", "_template", "pipeline.json");
  const template = await fs.readFile(templatePath, "utf8");

  const camelLessonId = toCamel(args.id);
  const compositionName = args.composition ?? `Complete${toPascal(args.id)}Lesson`;

  const rendered = substitute(template, {
    lessonId: args.id,
    camelLessonId,
    compositionName,
  });

  // Validate JSON before writing.
  JSON.parse(rendered);

  await fs.mkdir(lessonDir, { recursive: true });
  await fs.writeFile(pipelinePath, rendered);

  console.log(`Wrote ${pipelinePath}`);
  console.log(`  lessonId:    ${args.id}`);
  console.log(`  composition: ${compositionName}`);
  console.log(`  constPrefix: ${camelLessonId}`);
  console.log(`\nNext: write ${lessonDir}/brief.md and start Wave 1 (lesson-storyboard).`);
};

main().catch((error) => {
  console.error(error.message ?? error);
  process.exitCode = 1;
});
