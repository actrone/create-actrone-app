# create-actrone-app

Scaffold a **local-first** AI-agent memory app powered by
[`@actrone/memory`](https://github.com/actrone/actrone-memory-ts) — zero services,
no API key. *Memory that never phones home.*

```bash
npm create actrone-app@latest my-agent
cd my-agent
npm install
npm start
```

Pick a framework wiring:

```bash
npm create actrone-app@latest my-agent -- --framework langgraph
```

Supported: `core`, `vercel`, `langchain`, `langgraph`, `mastra`, `llamaindex`,
`openai-agents`, `genkit`.

## Greenfield vs existing project

- **New project** → `create-actrone-app` (this tool).
- **Existing project** → the non-destructive snippet printer:
  `npx @actrone/memory add <framework>` — it prints a recipe or writes **one new
  file**, and never edits your code.

## Going to production

The scaffolded app swaps to governed, hosted memory with a single import
(`ActroneMemoryManager` from `@actrone/sdk`), or plugs in Redis + Qdrant adapters
for a durable self-hosted backend.
