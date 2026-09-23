# create-actrone-app

> **Scaffold a local-first AI-agent memory app in one command.** No services, no API key,
> no account.

[![npm version](https://img.shields.io/npm/v/create-actrone-app?color=brightgreen&label=npm)](https://www.npmjs.com/package/create-actrone-app)
[![node](https://img.shields.io/node/v/create-actrone-app)](https://www.npmjs.com/package/create-actrone-app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Generates a working starter powered by
[`actrone-memory`](https://github.com/actrone/actrone-memory-ts): an agent that remembers
what you told it, across restarts, with nothing running but Node.

```bash
npm create actrone-app@latest my-agent
cd my-agent
npm install
npm start
```

Requires Node.js 22 or newer. That is the whole prerequisite list.

## What you get

Four files, no hidden config, nothing to delete before you start working:

```text
my-agent/
├── src/agent.ts      a runnable agent with memory wired up
├── package.json      one dependency: actrone-memory
├── tsconfig.json     strict mode, ESM, ready for tsx
└── README.md         how to run it and where to go next
```

Run `npm start` and the agent stores a turn, recalls it, and prints what it remembered.
Restart the process and it still remembers. That is the whole point of the starter: the
behaviour you came for is visible in the first thirty seconds, not after you configure a
vector database.

## Pick a framework wiring

```bash
npm create actrone-app@latest my-agent -- --framework langgraph
```

| Slug | Wires memory into |
| --- | --- |
| `core` | No framework. The library on its own (default). |
| `vercel` | Vercel AI SDK |
| `langchain` | LangChain.js |
| `langgraph` | LangGraph.js |
| `mastra` | Mastra |
| `llamaindex` | LlamaIndex.TS |
| `openai-agents` | OpenAI Agents JS |
| `genkit` | Firebase Genkit |

`--help` prints the same list. An unknown slug fails immediately with the valid set rather
than scaffolding something broken.

## Greenfield vs existing project

This tool creates a **new** project. It will not touch an existing one.

If you already have a codebase, use the non-destructive snippet printer instead:

```bash
npx actrone-memory add <framework>
```

It prints a copy-paste recipe, or with `--write <file>` creates exactly one new
self-contained file. It never edits code you already wrote.

## Going to production

The starter is deliberately local-first, and it stays useful as-is. When you need more,
there are two independent directions and neither requires a rewrite:

- **Durable self-hosted.** Inject Redis and Qdrant adapters into `MemoryManager.create()`.
  Same API, same result shapes.
- **Governed and hosted** (when Actrone's hosted platform launches). Swap one import to
  its drop-in `ActroneMemoryManager` and every call runs through [Actrone](https://actrone.com)
  with PII tokenised before inference, an audit trail, and policy limits. Same methods.

You are never required to take either step. `actrone-memory` is MIT and works standalone
indefinitely.

## License

[MIT](LICENSE). Free to use in any project, commercial or otherwise.
