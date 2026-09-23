import assert from "node:assert/strict";
import { test } from "node:test";

import { FRAMEWORKS, scaffold, validateProjectName } from "../lib/scaffold.mjs";

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
  assert.ok(pkg.dependencies["actrone-memory"], "depends on actrone-memory");
  assert.equal(pkg.type, "module");

  const agent = files.get("src/agent.ts");
  assert.match(agent, /MemoryManager\.create\(\)/);
  assert.match(agent, /ActroneMemoryManager/); // the hosted-upgrade seed, not yet a published package
});

test("scaffold with a framework adds the `add` hint to the README", () => {
  const files = scaffold({ projectName: "my-agent", framework: "langgraph" });
  assert.match(files.get("README.md"), /npx actrone-memory add langgraph/);
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
