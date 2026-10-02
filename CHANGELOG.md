# Changelog

All notable changes to `create-actrone-app` are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to
[Semantic Versioning](https://semver.org/).

---

## [0.1.1] - 2026-10-02

### Changed

- **New projects use TypeScript 7 and actrone-memory 0.1.3.** The starter's `typescript` dev
  dependency is `^7`, the native compiler, and `actrone-memory` is `^0.1.3`: the first release
  that installs next to the current framework majors (Vercel AI SDK 7, Mastra 1, VoltAgent 2) and
  whose `npx actrone-memory add`, which the generated README tells you to run, works on macOS and
  Linux.
- **`--framework` gives the command that writes the wiring.** The generated README and the CLI's
  next steps now show `npx actrone-memory add <framework> --write src/<framework>.ts`, which
  writes one new file with memory wired into the framework and prints the packages to install.
- **npm listing.** The homepage link opens the quickstart instead of the site's front page, and
  the keywords cover what people search for (agent-memory, ai-agents, local-first, starter,
  template, typescript).
- **Author and licence.** Both now name Apocalypse Technologies, the company that publishes the
  package, as `actrone-memory` does.

### Fixed

- **The README described wiring the starter does not do.** Every project starts from the same
  agent, and `--framework` adds the command that writes the wiring. The README now says so and
  lists all 12 frameworks the CLI accepts; it listed 8.
- **The README claimed memory survives a restart.** The starter uses the in-memory store, so
  each run starts empty; it only looked persistent because it stores the same facts on every
  run. The README, the generated README and the starter's comments now say so, and show how to
  keep memory with Redis or Valkey, Qdrant or Postgres with pgvector.
- **The hosted platform read as available.** The starter's comment and both READMEs now say it
  has not launched.

## [0.1.0] - 2026-09-24 (initial release)

### Added

- **`npm create actrone-app@latest <name>`** scaffolds a new project with five files:
  `src/agent.ts`, a runnable agent with memory wired up; `package.json`, with `actrone-memory` as
  its one dependency; a strict ESM `tsconfig.json`; a `.gitignore`; and a `README.md` that says
  how to run it.
- **`--framework <slug>`** for `core` (the default) and 11 frameworks: `vercel`, `langchain`,
  `langgraph`, `mastra`, `llamaindex`, `openai-agents`, `genkit`, `voltagent`,
  `claude-agent-sdk`, `cloudflare-agents` and `inngest-agentkit`. It adds the
  `npx actrone-memory add <slug>` command to the generated README. An unknown name fails with the
  list of valid ones instead of scaffolding something broken, and `--help` prints the same list.
- **New projects only.** It refuses to write into a non-empty directory. For an existing project,
  `npx actrone-memory add <framework>` prints a recipe instead and never edits your code.
- Requires Node.js 22 or newer.

### Supply chain

- Published to npm via **OIDC Trusted Publishing** with **npm provenance**, no long-lived tokens.
