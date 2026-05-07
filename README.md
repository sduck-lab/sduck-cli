# sduck

Terminal-first decision briefing harness for AI coding agents.

`sduck` helps a developer and a coding agent align on implementation decisions before code changes start. It gives the agent a compact project context, lets the agent submit structured decisions/questions/evidence, renders an implementation brief, and records the implementation trace afterward.

The current public CLI is the v2 `.decision` workflow. The source of truth is `.decision/db.sqlite`; Markdown and graph files are generated artifacts for review, sharing, and recall.

## Requirements

- Node.js `>=22.13`
- npm
- A git work tree for `sduck trace`

Node `>=22.13` is required because the v2 store uses Node's built-in SQLite support.

## Installation and local usage

```bash
# Install from npm
npm install -g @sduck/sduck-cli

# Or run from a checkout
npm install
npm run build
npm run dev -- --help
```

The package exposes one binary:

```bash
sduck --help
```

## Quick start

```bash
# 1) Create the decision workspace in the current project
sduck init

# 2) Start a decision briefing task
sduck work "add payment retry support"

# 3) Show the context pack for the coding agent
sduck context

# 4) Let the agent submit decisions, questions, evidence, and scope
sduck submit --stdin < draft.json

# 5) Resolve open questions, if any
sduck ask
sduck answer QUESTION-1 --option 1
# or
sduck answer QUESTION-1 --text "Use exponential backoff with jitter"

# 6) Review and confirm the implementation brief
sduck brief
sduck confirm

# 7) Implement with your coding agent, then record what changed
sduck trace
sduck remember

# 8) Reuse prior decisions later
sduck recall "payment retry"

# 9) Finish or abandon the current task
sduck close
# sduck abandon
```

## How the workflow works

1. **Initialize**: `sduck init` creates `.decision/`, the SQLite database, export directories, and `state.json`.
2. **Start work**: `sduck work "..."` creates the current task and builds a lightweight context pack from the project.
3. **Give context to the agent**: `sduck context` prints relevant files, prior decisions, prior implementation traces, the grill-me protocol, and the draft schema.
4. **Clarify decisions**: the agent explores the codebase first, asks the user only when needed, and submits a structured draft with `sduck submit --stdin`.
5. **Answer questions**: `sduck ask` shows the next unresolved question; `sduck answer` records the user's answer and promotes it to explicit decision evidence.
6. **Confirm the brief**: `sduck brief` renders the implementation brief; `sduck confirm` snapshots it and marks the task as confirmed.
7. **Trace implementation**: after code changes, `sduck trace` reads git changes and maps confirmed decisions to changed files where possible.
8. **Remember**: `sduck remember` exports task, decision, and implementation memory for future `sduck recall` searches.

## Agent-led grill-me loop

The v2 workflow is designed for an agent that interviews the developer only when the codebase cannot answer the question.

The agent should:

- infer from existing files, prior decisions, traces, and Graphify artifacts before asking the user;
- ask one question at a time;
- include a recommended answer and rationale when asking;
- classify decisions as explicit, inferred, carried over, conflicting, or still open;
- submit decisions, questions, evidence, expected scope, and avoid scope as a structured draft.

This keeps the conversation terminal-first while still producing durable decision records.

## Commands

### Workspace and task

```bash
sduck init
sduck work "<task description>"
sduck status [--json]
```

- `init` initializes `.decision/` in the current project.
- `work` starts a new decision briefing task and indexes lightweight context.
- `status` shows the active task and counts for context items, questions, decisions, brief snapshots, traces, and exports.

### Context

```bash
sduck context [--json]
sduck context add <path-or-glob>
```

- `context` prints the current context pack for the agent.
- `context add` adds a project-local file/path/glob to the current task context.

### Drafts and questions

```bash
sduck submit --stdin
sduck ask
sduck answer <question-id> --option <n>
sduck answer <question-id> --text "<answer>"
```

- `submit --stdin` accepts either raw JSON or Markdown containing a fenced `json sduck-draft` block.
- `ask` displays the next open question.
- `answer` records either a numbered option or free text answer.

### Brief confirmation

```bash
sduck brief [--json]
sduck confirm
```

- `brief` renders grouped decisions, open questions, evidence, expected scope, and avoid scope.
- `confirm` snapshots the brief and marks the task `CONFIRMED`.

### Implementation memory

```bash
sduck trace [--base <ref>] [--json]
sduck remember
sduck recall "<query>"
```

- `trace` records changed files from git and creates an implementation trace.
- `remember` exports Markdown and graph-style artifacts.
- `recall` searches prior decisions and implementation traces.

### Lifecycle

```bash
sduck close
sduck abandon
```

- `close` marks the current task `CLOSED`.
- `abandon` marks it `ABANDONED`.

## Draft input

`sduck submit --stdin` accepts JSON directly:

```json
{
  "schemaVersion": "v2alpha1",
  "taskId": "TASK-20260507-payment-retry",
  "decisions": [
    {
      "title": "Retry policy",
      "kind": "INFERRED",
      "confidence": 0.8,
      "summary": "Use exponential backoff with jitter for retryable payment failures.",
      "rationale": ["Existing network retry utilities already use this pattern."],
      "appliesTo": ["src/payments/**"],
      "avoids": ["Retrying validation errors"],
      "sourceRefs": ["src/network/retry.ts"]
    }
  ],
  "questions": [
    {
      "text": "What is the maximum retry count?",
      "recommendedAnswer": "3 retries",
      "rationale": ["Keeps worst-case latency bounded."],
      "options": ["3 retries", "5 retries"]
    }
  ],
  "evidence": [
    {
      "sourceType": "CODE",
      "sourceRef": "src/network/retry.ts",
      "summary": "Existing retry helper supports backoff and jitter.",
      "confidence": 0.9
    }
  ],
  "expectedScope": ["Payment retry flow"],
  "avoidScope": ["Changing payment provider contracts"]
}
```

It also accepts Markdown containing a canonical draft block:

````markdown
# Sduck Draft

```json sduck-draft
{
  "schemaVersion": "v2alpha1",
  "decisions": [],
  "questions": [],
  "evidence": []
}
```
````

The schema is intentionally small:

- `decisions`: proposed or recorded implementation decisions.
- `questions`: unresolved user questions with recommended answers.
- `evidence`: code, prior decision, implementation trace, user-answer, discovery, or Graphify references.
- `expectedScope`: work that should be included.
- `avoidScope`: work that should stay out of the implementation.

## Storage and generated artifacts

```text
.decision/
  db.sqlite
  state.json
  exports/
    markdown/
      tasks/
      decisions/
      implementations/
    graphify/
      DECISION_REPORT.md
      decision-graph.json
```

- `.decision/db.sqlite` stores tasks, decisions, questions, evidence, context items, brief snapshots, implementation traces, and events.
- `.decision/state.json` tracks the active task.
- `.decision/exports/markdown/*` contains generated Markdown memory.
- `.decision/exports/graphify/*` contains graph-style decision exports.

Graphify is not required at runtime. `sduck` can read existing `graphify-out/GRAPH_REPORT.md` or `graphify-out/graph.json` as context evidence when present, and it can generate Graphify-style exports itself.

## Concepts

- **Task**: the current unit of work. Status values are `OPEN`, `BRIEF_READY`, `CONFIRMED`, `CLOSED`, and `ABANDONED`.
- **Decision**: an implementation choice. Decision kinds are `EXPLICIT`, `INFERRED`, `CARRIED`, `CONFLICT`, and `OPEN`.
- **Question**: an unresolved point for the user. Questions can include options and a recommended answer.
- **Evidence**: a cited reason for a decision or question, such as source code, prior decisions, implementation traces, user answers, discovery notes, or Graphify artifacts.
- **Brief**: the rendered implementation contract that the developer confirms before coding.
- **Trace**: the post-implementation link between confirmed decisions and changed files.
- **Recall**: a lightweight search over prior decisions and traces.

## Development

```bash
npm run dev -- --help
npm run typecheck
npm run lint
npm run format:check
npm run test:unit
npm run test:e2e
npm run test
npm run build
```

Run a single test file with Vitest:

```bash
npx vitest run tests/unit/v2-core.test.ts
```

## Project structure

```text
src/
  cli.ts                 CLI entry point and command registration
  commands/              Thin command wrappers for CLI I/O
  core/                  Core logic
    v2/                  Decision briefing workflow implementation
  types/                 Shared v2 domain types and draft schema
tests/
  unit/                  Core unit tests
  e2e/                   End-to-end CLI workflow tests
```

The CLI layer is intentionally thin: it parses arguments, delegates to core functions, and prints `{ stdout, stderr, exitCode }` results. The core layer owns workspace initialization, context indexing, draft validation, question handling, brief rendering, tracing, exporting, and recall.

## Limitations and notes

- `sduck trace` requires a git work tree and depends on git status/diff output.
- Context discovery is lightweight filename/path keyword matching, not AST indexing or vector search.
- `context add` resolves paths inside the project and rejects paths outside the project root.
- Graphify is optional; `sduck` only reads existing Graphify output when it is already present.
- Markdown and graph files under `.decision/exports/` are generated artifacts. Treat `.decision/db.sqlite` as the v2 source of truth.

## Legacy `.sduck` workflow in this repository

This repository also contains older `.sduck` Spec-Driven Development assets and legacy core files. They are useful as project history and internal workflow context, but they are not the current public v2 command surface registered by `src/cli.ts`.

For current end-user usage, prefer the `.decision` workflow documented above.
