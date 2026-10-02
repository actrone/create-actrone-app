import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { FRAMEWORKS, addCommand, scaffold, validateProjectName } from "../lib/scaffold.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const BIN = join(ROOT, "bin", "create-actrone-app.mjs");

test("validateProjectName accepts valid names and rejects invalid ones", () => {
  assert.equal(validateProjectName("my-agent"), null);
  assert.equal(validateProjectName("agent_1.2"), null);
  assert.notEqual(validateProjectName(""), null);
  assert.notEqual(validateProjectName("My Agent"), null); // spaces / uppercase
  assert.notEqual(validateProjectName("-bad"), null); // must start alphanumeric
});

test("scaffold produces a coherent, runnable starter file map", () => {
  const files = scaffold({ projectName: "my-agent" });
  const paths = [...files.keys()].sort();
  assert.deepEqual(paths, [".gitignore", "README.md", "package.json", "src/agent.ts", "tsconfig.json"]);

  const pkg = JSON.parse(files.get("package.json"));
  assert.equal(pkg.name, "my-agent");
  assert.equal(pkg.type, "module");
  assert.equal(pkg.engines.node, ">=22");

  const agent = files.get("src/agent.ts");
  assert.match(agent, /MemoryManager\.create\(\)/);
  assert.match(agent, /ActroneMemoryManager/); // the hosted-upgrade seed, not yet a published package
  assert.match(agent, /every run starts empty/); // in-memory by default: it does not claim persistence
});

test("the starter depends on the fixed library and TypeScript 7", () => {
  const pkg = JSON.parse(scaffold({ projectName: "my-agent" }).get("package.json"));
  // 0.1.2 is the first actrone-memory that installs next to the current framework majors.
  assert.equal(pkg.dependencies["actrone-memory"], "^0.1.2");
  assert.equal(pkg.devDependencies.typescript, "^7");
});

test("the generated README says memory starts empty and how to keep it", () => {
  const readme = scaffold({ projectName: "my-agent" }).get("README.md");
  assert.match(readme, /each run starts empty/);
  assert.match(readme, /pgvector/);
  assert.match(readme, /has not\s+launched/); // the hosted platform is described as future, not present
});

test("scaffold with a framework adds the command that writes its wiring", () => {
  const files = scaffold({ projectName: "my-agent", framework: "langgraph" });
  assert.equal(addCommand("langgraph"), "npx actrone-memory add langgraph --write src/langgraph.ts");
  assert.ok(files.get("README.md").includes(addCommand("langgraph")));
  assert.match(files.get("README.md"), /## Wire it into LangGraph\.js/);
});

test("core framework README has no add hint", () => {
  const files = scaffold({ projectName: "my-agent", framework: "core" });
  assert.doesNotMatch(files.get("README.md"), /npx actrone-memory add/);
});

test("scaffold rejects invalid project names and unknown frameworks", () => {
  assert.throws(() => scaffold({ projectName: "Bad Name" }), /project name/);
  assert.throws(() => scaffold({ projectName: "ok", framework: "django" }), /unknown framework/);
});

test("every known framework scaffolds without error", () => {
  for (const fw of FRAMEWORKS) {
    const files = scaffold({ projectName: "ok", framework: fw });
    assert.ok(files.get("package.json"));
  }
});

test("the package README lists exactly the frameworks the CLI accepts", () => {
  // The README listed 8 slugs while the CLI accepted 12; this keeps the two in step.
  const readme = readFileSync(join(ROOT, "README.md"), "utf8");
  const listed = [...readme.matchAll(/^\| `([a-z-]+)` \|/gm)].map((match) => match[1]);
  assert.deepEqual([...listed].sort(), [...FRAMEWORKS].sort());
});

test("the CLI writes the project and prints the framework step", () => {
  const dir = mkdtempSync(join(tmpdir(), "create-actrone-app-"));
  try {
    const out = execFileSync(process.execPath, [BIN, "my-agent", "--framework", "mastra"], { cwd: dir, encoding: "utf8" });
    assert.ok(out.includes(addCommand("mastra")), out);
    assert.deepEqual(readdirSync(join(dir, "my-agent")).sort(), [".gitignore", "README.md", "package.json", "src", "tsconfig.json"]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("the CLI refuses a directory that is not empty", () => {
  const dir = mkdtempSync(join(tmpdir(), "create-actrone-app-"));
  try {
    execFileSync(process.execPath, [BIN, "my-agent"], { cwd: dir, encoding: "utf8" });
    assert.throws(
      () => execFileSync(process.execPath, [BIN, "my-agent"], { cwd: dir, encoding: "utf8", stdio: "pipe" }),
      /refusing to scaffold into a non-empty directory/,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
