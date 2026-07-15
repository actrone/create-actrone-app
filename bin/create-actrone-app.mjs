#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

import { FRAMEWORKS, scaffold, validateProjectName } from "../lib/scaffold.mjs";

/**
 * create-actrone-app — greenfield scaffolder for a local-first Actrone memory app.
 * The non-destructive existing-project path is `npx @actrone/memory add <framework>`.
 *
 *   npm create actrone-app@latest my-agent
 *   npm create actrone-app@latest my-agent -- --framework langgraph
 */

const USAGE = `create-actrone-app — scaffold a local-first AI-agent memory app

Usage:
  npm create actrone-app@latest <project-name> [-- --framework <name>]

Options:
  --framework <name>   one of: ${FRAMEWORKS.join(", ")} (default: core)
  --help               show this help

The target directory must not already exist (or must be empty).`;

function parseArgs(argv) {
  const args = { projectName: undefined, framework: "core", help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") args.help = true;
    else if (a === "--framework") args.framework = argv[++i];
    else if (!a.startsWith("-") && args.projectName === undefined) args.projectName = a;
  }
  return args;
}

/** True when `dir` does not exist or exists and is empty. */
function isEmptyDir(dir) {
  if (!existsSync(dir)) return true;
  return readdirSync(dir).length === 0;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(`${USAGE}\n`);
    process.exit(0);
  }

  const nameErr = validateProjectName(args.projectName);
  if (nameErr) {
    process.stderr.write(`Error: ${nameErr}\n\n${USAGE}\n`);
    process.exit(1);
  }
  if (!FRAMEWORKS.includes(args.framework)) {
    process.stderr.write(
      `Error: unknown framework "${args.framework}" (known: ${FRAMEWORKS.join(", ")})\n`,
    );
    process.exit(1);
  }

  const targetDir = resolve(process.cwd(), args.projectName);
  if (!isEmptyDir(targetDir)) {
    process.stderr.write(`Error: refusing to scaffold into a non-empty directory: ${targetDir}\n`);
    process.exit(1);
  }

  const files = scaffold({ projectName: args.projectName, framework: args.framework });
  for (const [relPath, content] of files) {
    const abs = join(targetDir, relPath);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, content, "utf8");
  }

  process.stdout.write(
    `\nScaffolded ${args.projectName} (${args.framework}) — ${files.size} files.\n\n` +
      "Next steps:\n" +
      `  cd ${args.projectName}\n` +
      "  npm install\n" +
      "  npm start\n\n" +
      "Memory that never phones home — local-first, zero services, no API key.\n",
  );
}

main();
