# create-actrone-app

> **Scaffold a local-first AI-agent memory app in one command.** No services, no API key,
> no account.

[![npm version](https://img.shields.io/npm/v/create-actrone-app?color=brightgreen&label=npm)](https://www.npmjs.com/package/create-actrone-app)
[![node](https://img.shields.io/node/v/create-actrone-app)](https://www.npmjs.com/package/create-actrone-app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**[Quickstart](https://actrone.com/docs/getting-started/quickstart)** · [Documentation](https://actrone.com/docs/memory/overview) · [Framework integrations](https://actrone.com/docs/memory/integrations) · [Changelog](https://actrone.com/changelog)

Generates a working TypeScript starter powered by
[`actrone-memory`](https://github.com/actrone/actrone-memory-ts): an agent with memory wired
up and running, with nothing to install but Node.

```bash
npm create actrone-app@latest my-agent
cd my-agent
npm install
npm start
```

Requires Node.js 22 or newer. That is the whole prerequisite list.

## What you get

Five files, no hidden config, nothing to delete before you start working:

```text
my-agent/
├── src/agent.ts      a runnable agent with memory wired up
├── package.json      one dependency, actrone-memory; TypeScript 7 and tsx for development
├── tsconfig.json     strict mode, ESM, ready for tsx
├── .gitignore        node_modules, build output and .env files
└── README.md         how to run it and where to go next
```

Run `npm start` and the agent stores a fact and a conversation turn, recalls what is relevant
to the next question, and prints it. The behaviour you came for is visible in the first thirty
seconds, not after you configure a vector database. Memory lives in the process by default, so
each run starts empty; [Going to production](#going-to-production) shows how to keep it.

## Add a framework

```bash
npm create actrone-app@latest my-agent -- --framework langgraph
```

Every project starts from the same agent. `--framework` adds the one command that wires memory
into that framework to the generated README and to the next steps the CLI prints:

```bash
npx actrone-memory add langgraph --write src/langgraph.ts
```

It writes one new self-contained file and prints the packages to install. The files come from
the examples `actrone-memory` type-checks against each framework in CI.

| Slug | Framework |
| --- | --- |
| `core` | None: the library on its own (default) |
| `vercel` | Vercel AI SDK |
| `langchain` | LangChain.js |
| `langgraph` | LangGraph.js |
| `mastra` | Mastra |
| `llamaindex` | LlamaIndex.TS |
| `openai-agents` | OpenAI Agents JS |
| `genkit` | Firebase Genkit |
| `voltagent` | VoltAgent |
| `claude-agent-sdk` | Claude Agent SDK |
| `cloudflare-agents` | Cloudflare Agents |
| `inngest-agentkit` | Inngest AgentKit |

`--help` prints the same list. An unknown slug fails immediately with the valid set rather
than scaffolding something broken.

## Greenfield vs existing project

This tool creates a **new** project. It refuses to write into a directory that is not empty.

If you already have a codebase, use the same command the starter uses, in your project:

```bash
npx actrone-memory add <framework>
```

It prints a copy-paste recipe, or with `--write <file>` creates exactly one new
self-contained file. It never edits code you already wrote.

## Going to production

The starter is deliberately local-first, and it stays useful as-is. When you need more,
there are two independent directions and neither requires a rewrite:

- **Durable self-hosted.** Pass stores to `MemoryManager.create()`: Redis or Valkey for recent
  turns, and Qdrant or Postgres with pgvector for long-term memory. Same API, same result
  shapes. Install `fastembed` for recall by meaning with a local model.
- **Governed and hosted.** Actrone's hosted platform has not launched. When it does, its
  `ActroneMemoryManager` is planned as a drop-in replacement for `MemoryManager`, adding PII
  tokenisation before inference, an audit trail and policy limits.

You are never required to take either step. `actrone-memory` is MIT and works standalone
indefinitely.

## License

[MIT](LICENSE). Free to use in any project, commercial or otherwise.
