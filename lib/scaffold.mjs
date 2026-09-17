// Pure project scaffolder for create-actrone-app. Generates the file map for a
// new local-first Actrone memory starter. No I/O here so it is trivially testable.

/** Framework slugs create-actrone-app knows about (aligned with `@actrone/memory add`). */
export const FRAMEWORKS = [
  "core",
  "vercel",
  "langchain",
  "langgraph",
  "mastra",
  "llamaindex",
  "openai-agents",
  "genkit",
];

/** Validate a project name for filesystem + npm safety. Returns null when ok. */
export function validateProjectName(name) {
  if (typeof name !== "string" || name.trim().length === 0) return "project name is required";
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(name)) {
    return "project name must be lowercase and start alphanumeric (a-z, 0-9, -, _, .)";
  }
  return null;
}

const AGENT_TS = `import { MemoryManager } from "@actrone/memory";
import { memoryFor } from "@actrone/memory/adapters";

// Local-first by default: no Redis, no Qdrant, no API key.
// ⬆ swap MemoryManager for @actrone/sdk's ActroneMemoryManager → hosted, governed.
async function main() {
  const mm = await MemoryManager.create();
  const memory = memoryFor(mm, "starter-agent", "session-1");

  // Seed a durable fact and a conversation turn.
  await memory.inject("The user prefers concise, no-preamble answers.");
  await memory.remember("My name is Alex.", "Nice to meet you, Alex!");

  // Recall relevant context for the next turn.
  const { systemPrompt } = await memory.recall("what does the user prefer?");
  console.log("--- memory context ---");
  console.log(systemPrompt || "(nothing relevant yet)");

  await mm.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
`;

const TSCONFIG = `{
  "compilerOptions": {
    "target": "ES2023",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["src"]
}
`;

const GITIGNORE = "node_modules\ndist\n.env\n.env.*\n";

function packageJson(projectName) {
  return `${JSON.stringify(
    {
      name: projectName,
      version: "0.1.0",
      private: true,
      type: "module",
      scripts: {
        start: "tsx src/agent.ts",
        typecheck: "tsc --noEmit",
      },
      dependencies: {
        "@actrone/memory": "^0.1.0",
      },
      devDependencies: {
        "@types/node": "^22",
        tsx: "^4",
        typescript: "^5",
      },
      engines: { node: ">=22" },
    },
    null,
    2,
  )}\n`;
}

function readme(projectName, framework) {
  const frameworkLine =
    framework && framework !== "core"
      ? `\n## Wire it into ${framework}\n\nAdd framework-specific memory wiring without touching your code:\n\n\`\`\`bash\nnpx @actrone/memory add ${framework}\n\`\`\`\n`
      : "";
  return `# ${projectName}

A local-first AI-agent memory starter, powered by [\`@actrone/memory\`](https://github.com/actrone/actrone-memory-ts).
Runs with **no services and no API key** — memory that never phones home.

## Get started

\`\`\`bash
npm install
npm start
\`\`\`
${frameworkLine}
## Going to production

Swap \`MemoryManager\` for \`@actrone/sdk\`'s \`ActroneMemoryManager\` (one import) to
move to governed, hosted memory — or plug in Redis + Qdrant adapters for a durable
self-hosted backend. See the docs at https://actrone.com/docs/memory/overview.
`;
}

/**
 * Build the file map for a new project. Keys are project-relative paths.
 * @param {{ projectName: string, framework?: string }} opts
 * @returns {Map<string,string>}
 */
export function scaffold(opts) {
  const projectName = opts.projectName;
  const err = validateProjectName(projectName);
  if (err) throw new Error(err);
  const framework = opts.framework ?? "core";
  if (!FRAMEWORKS.includes(framework)) {
    throw new Error(`unknown framework: ${framework} (known: ${FRAMEWORKS.join(", ")})`);
  }
  return new Map([
    ["package.json", packageJson(projectName)],
    ["tsconfig.json", TSCONFIG],
    [".gitignore", GITIGNORE],
    ["src/agent.ts", AGENT_TS],
    ["README.md", readme(projectName, framework)],
  ]);
}
