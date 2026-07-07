# sduck

Terminal-first decision briefing harness for AI coding agents.

`sduck` helps a developer and a coding agent align on implementation decisions before code changes start. It gives the agent a compact project context, lets the agent submit structured decisions/questions/evidence, renders an implementation brief, and records the implementation trace afterward.

The current public CLI is the v2 `.decision` decision briefing workflow. The source of truth is the durable markdown/entity text files under `.decision/exports/markdown/{tasks,decisions,implementations}/`, written by `sduck remember` and read back by `sduck rebuild`. `.decision/db.sqlite` is a Git-ignored, rebuildable local cache regenerated from that markdown source.

## Requirements

- Node.js `>=22.13`
- npm
- A git work tree for `sduck trace`

Node `>=22.13` is required because the v2 store uses Node's built-in `node:sqlite`, which may emit an experimental warning.

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
# 1) Create the .decision decision-briefing workspace and v2-first agent rules
#    (also installs the bundled .sduck SDD assets as compatibility/supporting assets)
sduck init
# or install a specific rule set only
sduck init --agents claude-code

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

1. **Initialize**: `sduck init` creates the `.decision` decision-briefing workspace (primary), plus compatibility `.sduck` SDD assets and managed agent rule files such as `CLAUDE.md`.
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

### Decision briefing workspace and task

```bash
sduck init [--agents <list>] [--force] [--no-agent-rules]
sduck work "<task description>"
sduck status [--json]
```

- `init` initializes `.decision/`, copies bundled `.sduck/sduck-assets`, and installs managed rule files for selected agents.
- In non-interactive shells, `sduck init` defaults to all supported agents unless `--agents` or `--no-agent-rules` is provided.
- `--agents` accepts `claude-code,codex,opencode,gemini-cli,cursor,antigravity`.
- `--force` refreshes bundled assets and managed rule blocks.
- `--no-agent-rules` skips managed instruction file installation.
- `work` starts a new decision briefing task and indexes lightweight context.
- `status` shows the active task and counts for context items, questions, decisions, brief snapshots, traces, and exports.

After init, selected agents receive managed instruction files and hooks where applicable, for example `CLAUDE.md` and `.claude/hooks/sdd-guard.sh` for Claude Code.

### Legacy SDD workflow

These are legacy SDD compatibility/internal gated workflow commands for spec and plan approval gates — they are not the primary `.decision` workflow, but remain reachable for teams that want explicit gates.

```bash
sduck start <type> <slug>
sduck spec approve [target]
sduck plan approve [target]
sduck step done <number> [target]
sduck review ready [target]
sduck done [target]
```

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
  state.json                       # active task pointer
  db.sqlite                        # Git-ignored, rebuildable local cache (+ -shm, -wal, -journal sidecars)
  exports/
    markdown/                      # SOURCE OF TRUTH — durable markdown/entity text
      tasks/
      decisions/
      implementations/
    graphify/                      # generated graph-style exports
      DECISION_REPORT.md
      decision-graph.json
```

- `.decision/exports/markdown/{tasks,decisions,implementations}/` is the source of truth: durable markdown/entity text written by `sduck remember` and read back by `sduck rebuild`.
- `.decision/db.sqlite` (and its `-shm`, `-wal`, `-journal` sidecars) is a Git-ignored, rebuildable local cache that stores tasks, decisions, questions, evidence, context items, brief snapshots, implementation traces, and events. It is regenerated from the markdown source via `sduck rebuild` (or auto-rebuild), and can be deleted freely.
- `.decision/state.json` tracks the active task.
- `.decision/exports/graphify/*` contains generated graph-style decision exports.

Graphify is not required at runtime. `sduck` can read existing `graphify-out/GRAPH_REPORT.md` or `graphify-out/graph.json` as context evidence when present, and it can generate Graphify-style exports itself.

## Concepts

- **Decision task**: the current unit of work in the v2 `.decision` workflow (distinct from a legacy SDD task). Status values are `OPEN`, `BRIEF_READY`, `CONFIRMED`, `CLOSED`, and `ABANDONED`.
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
- `.decision/db.sqlite` (and its `-shm`, `-wal`, `-journal` sidecars) is a rebuildable local cache, not the source of truth. It is Git-ignored and regenerated from the markdown files under `.decision/exports/markdown/**` via `sduck rebuild`.

### Adoption notes

- **Pre-1.0 status**: `sduck` is pre-1.0, and the `v2alpha1` draft/task schema may have breaking changes between releases. Pin a version before relying on it.
- **Node and `node:sqlite`**: the v2 store uses Node's built-in `node:sqlite` (requires Node `>=22.13`), which currently emits an experimental warning.
- **CI gate**: CI now runs as a repository-level verification gate, but it does not guarantee API or schema stability.
- **Ownership**: teams should designate an owner/maintainer before adoption.
- **Bus factor**: the project is small with a low bus factor; treat decision records as the durable artifact, not the running tool.

## Legacy `.sduck` workflow in this repository

The `.decision` decision briefing workflow documented above is the primary public workflow of `sduck`. The `.sduck` Spec-Driven Development workflow is a legacy compatibility/internal gated workflow kept for agents and teams that need explicit spec and plan approval gates. `sduck init` installs the managed rule files that point agents at the `.sduck` workflow, and the legacy SDD commands remain available alongside the `.decision` workflow.

For decision briefing, use the `.decision` workflow. For gated agent implementation with spec/plan approval, use the legacy `.sduck` SDD commands.

### `.sduck` state ownership

The canonical source of `.sduck` state (`sduck-workspace/`, `sduck-archive/`, `sduck-state.yml`) is the **project root**. All `sduck` commands read and write state there, even when executed from inside a work worktree. This state is never committed to a work branch: `sduck start` adds `.sduck/sduck-workspace/`, `.sduck/sduck-archive/`, `.sduck/sduck-state.yml`, and `.sduck-worktrees/` to `.gitignore`, so work branches do not carry stale snapshots of task metadata.

Repositories created with older versions of `sduck` may still track workspace state in Git. To migrate, untrack it once (the CLI never force-untracks existing history):

```bash
git rm -r --cached .sduck/sduck-workspace .sduck/sduck-archive
git commit -m "chore: stop tracking sduck workspace state"
```
