#!/usr/bin/env node
/**
 * e2e: prove a scaffolded project works the way the README says, against the live npm registry.
 *
 *   node scripts/e2e.mjs              the starter: install, typecheck with TypeScript 7, run it
 *   node scripts/e2e.mjs <framework>  the same, then write the framework's wiring file with
 *                                     `npx actrone-memory add`, install the packages it names
 *                                     and typecheck the whole project again
 *
 * The unit tests check the file map; this checks what a user actually gets: that the published
 * `actrone-memory` installs, that the starter compiles under the TypeScript the template asks for,
 * that it prints recalled memory, and that every framework's wiring compiles against that
 * framework's newest release. Needs network access. Exits non-zero on the first failure.
 * Lives outside `test/` so `node --test` (which runs offline) never picks it up.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { FRAMEWORKS, addCommand } from "../lib/scaffold.mjs";

const BIN = fileURLToPath(new URL("../bin/create-actrone-app.mjs", import.meta.url));
const IS_WINDOWS = process.platform === "win32";
// Generous per-command ceiling: a cold install of a large framework can take minutes on CI.
const COMMAND_TIMEOUT_MS = 15 * 60_000;

const framework = process.argv[2] ?? "core";
if (!FRAMEWORKS.includes(framework)) {
  console.error(`unknown framework "${framework}" (known: ${FRAMEWORKS.join(", ")})`);
  process.exit(2);
}

/** Run a command, echo it, and return its stdout. stderr streams through for diagnosis. */
function run(command, args, cwd) {
  console.log(`$ ${command} ${args.join(" ")}`);
  return execFileSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
    // npm and npx are .cmd shims on Windows, which only start through a shell. Nothing else
    // goes through one: Node's own path can contain spaces.
    shell: IS_WINDOWS && (command === "npm" || command === "npx"),
    timeout: COMMAND_TIMEOUT_MS,
  });
}

function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log(`ok: ${message}`);
}

const NPM_RETRY_FLAGS = ["--no-audit", "--no-fund", "--fetch-retries=5", "--fetch-retry-mintimeout=20000"];

const workDir = mkdtempSync(join(tmpdir(), "create-actrone-app-e2e-"));
try {
  run(process.execPath, [BIN, "my-agent", "--framework", framework], workDir);
  const project = join(workDir, "my-agent");

  run("npm", ["install", ...NPM_RETRY_FLAGS], project);
  const typescript = JSON.parse(readFileSync(join(project, "node_modules", "typescript", "package.json"), "utf8"));
  check(typescript.version.startsWith("7."), `the starter installs TypeScript 7 (got ${typescript.version})`);
  const memory = JSON.parse(readFileSync(join(project, "node_modules", "actrone-memory", "package.json"), "utf8"));
  console.log(`actrone-memory ${memory.version}`);

  run("npm", ["run", "typecheck"], project);
  check(true, "the starter typechecks");

  const output = run("npm", ["start"], project);
  check(output.includes("The user prefers concise, no-preamble answers."), "the starter prints the recalled fact");
  check(output.includes("User: My name is Alex."), "the starter prints the recent turn");

  if (framework !== "core") {
    const [command, ...args] = addCommand(framework).split(" ");
    const written = run(command, args, project);
    const install = /^Install: npm i (.+)$/m.exec(written)?.[1];
    check(
      Boolean(install),
      `\`actrone-memory add ${framework}\` names the packages to install (it printed: ${JSON.stringify(written)})`,
    );
    const packages = install.split(/\s+/).filter((name) => name && name !== "actrone-memory");
    run("npm", ["install", ...NPM_RETRY_FLAGS, ...packages], project);
    run("npm", ["run", "typecheck"], project);
    check(true, `src/${framework}.ts typechecks against ${packages.join(", ")} with TypeScript 7`);
  }

  console.log(`\ne2e passed: ${framework}`);
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
