# sduck

[한국어 README](README.ko.md)

`sduck` is a terminal-first decision briefing harness for coding agents. It helps a developer and an agent agree on implementation decisions before code changes begin, records the confirmed brief, traces the implementation afterward, and makes prior decisions searchable for future work.

The primary public workflow is v2, stored in `.decision/`. Legacy SDD commands still exist for compatibility, but new documentation and installed agent rules point to the v2 decision briefing flow.

## What is new in 0.6.0

- CLI-first guided workflow: every new `sduck work` task is guided from creation.
- `sduck work` automatically records the grill start; agents review context and converse before `sduck grill complete --reason "..."`.
- One implementation brief now includes the problem, decisions, evidence, scope, `implementationPlan`, and `verificationPlan`.
- `sduck evaluate` records evidence for the latest trace before a guided task can close. It does not execute commands.
- `sduck graph show <TASK-*|DEC-*>` inspects the local SQLite graph projection. Markdown remains canonical; SQLite is a rebuildable local cache.
- Bundled agent rules and documentation are aligned to the CLI-only v2 lane: `grill complete`, `brief`/`confirm`, `trace`, `evaluate`, `remember`, and `close`.
- Repository-only Phase 0 fixtures document future brief-digest/source-envelope contracts. MCP runtime, MCP control-plane commands, and built-in CI trace verification are deferred and absent from 0.6.0.

## Requirements and installation

- Node.js `>=22.13`
- npm
- A Git work tree for `sduck trace`

Node `>=22.13` is required because the v2 local cache uses Node's built-in `node:sqlite`, which may print an experimental warning.

```bash
npm install -g @sduck/sduck-cli
sduck --help
```

From a checkout:

```bash
npm install
npm run build
npm run dev -- --help
```

## Language and locale

- English is the default README and CLI language.
- [README.ko.md](README.ko.md) is a full Korean counterpart.
- `sduck config locale en|ko` stores a user-global display preference for v2 terminal output.
- There is no `--locale` flag.
- Locale does not alter tracked project files, `.decision/policy.json`, canonical Markdown exports, JSON output, or installed agent-rule templates.
- Korean CLI output applies only to v2/root/config surfaces. Legacy v1/SDD compatibility commands remain English.

## Quick start

```bash
# 1. Initialize the v2 workspace and canonical English agent rules.
sduck init

# Optional: install selected agent rule files only.
sduck init --agents claude-code,codex,opencode

# 2. Start a decision task.
sduck work "add payment retry support"

# Optional Stage 1 syntax; FULL is the default and LIGHTWEIGHT is currently a no-op.
sduck work --record-depth FULL "add payment retry support"
sduck work --record-depth LIGHTWEIGHT "add payment retry support"

# 3. Give the agent the context pack.
sduck context

# 4. Complete the guided grill after the agent reviews context and converses.
sduck grill complete --reason "Retry behavior and scope are clear"

# 5. Submit the agent's structured decisions, plans, questions, evidence, and scope.
sduck submit --stdin < draft.json

# 6. Resolve open questions.
sduck ask
sduck answer QUESTION-1 --option 1
# or
sduck answer QUESTION-1 --text "Use exponential backoff with jitter."

# 7. Review and confirm the brief.
sduck brief
sduck confirm

# 8. Implement the change with your editor or coding agent, then trace and evaluate it.
sduck trace
sduck evaluate --check "tests=passed"

# Optional: inspect the local graph projection.
sduck graph show TASK-20260507-payment-retry --depth 2

# 9. Reuse prior decisions and finish the task.
sduck remember
sduck recall "payment retry"
sduck close
```

Here “implement” means the development activity after `sduck confirm`; it is not the legacy `sduck implement` command.

## User-facing interaction model

Most users interact with sduck through their coding agent, not by running lifecycle commands themselves. The agent uses `sduck work`, `context`, `grill complete`, `submit`, `brief`, `confirm`, `trace`, `evaluate`, and `remember` internally to record decisions and evidence, then speaks in plain language: restate the request, inspect code and prior decisions, ask only blocking questions with a recommended answer and rationale, summarize what will and will not change plus verification, ask “Implement this direction?”, implement after approval, and report verification.

## Workflow contract and gates

Canonical v2 sequence:

```text
init → work → context/conversation → grill complete → submit → ask/answer → brief/confirm → implement → trace → evaluate → graph show? → remember/recall → close
```

The practical contract is:

1. `sduck init` creates `.decision/`, `.decision/policy.json`, compatibility `.sduck` assets, `.gitignore` entries, and managed agent rules unless disabled.
2. `sduck work "..."` starts the current guided decision task and automatically records `GRILL_STARTED`. `--record-depth FULL` is the default and preserves the current full lifecycle. `--record-depth LIGHTWEIGHT` is accepted/documented for Stage 1 only and is a behavioral no-op; the same lifecycle and gates still apply.
3. `sduck context` prints relevant files, prior decisions/traces, the grill-me protocol, and the draft schema.
4. The agent reviews context, converses with the user as needed, then records completion with `sduck grill complete --reason "..." [--carried DEC-...]`.
5. `sduck submit --stdin` accepts the agent draft only after grill completion for guided tasks. Guided drafts must include non-empty `implementationPlan` and `verificationPlan`.
6. `sduck ask` and `sduck answer` resolve open questions.
7. `sduck brief` renders the localized terminal brief; `sduck confirm` records the canonical English confirmed brief and captures a Git baseline.
8. The developer or agent implements the change outside sduck.
9. `sduck trace` records changed implementation files since confirmation.
10. `sduck evaluate --check "name=outcome"` records evidence against the latest trace. It never runs shell commands or verification tools.
11. Optionally inspect relationships with `sduck graph show <TASK-*|DEC-*> [--depth N] [--json]`.
12. `sduck remember` exports reusable graph artifacts; `sduck recall` searches remembered decisions/traces.
13. `sduck close` completes the guided task only after the latest trace has an evaluation, or `sduck abandon` abandons it.

`confirm`, `trace`, `close`, and `abandon` reject invalid or terminal transitions without changing canonical source. `confirm` also rejects remaining open questions, active `OPEN` decisions, and active `CONFLICT` decisions.

## Guided workflow and compatibility

New `sduck work` tasks are guided. The CLI automatically records grill start, but guided `submit` and `confirm` require explicit grill completion with a non-empty reason:

```bash
sduck context
# Review context, discuss assumptions, carry prior decisions if needed.
sduck grill complete --reason "Shared understanding reached" --carried DEC-0021
```

`sduck grill-me` remains as a compatibility command: it prints the grill prompt/protocol and idempotently records `GRILL_STARTED` when needed. For new guided tasks, completion is the gate that allows `submit` and `confirm`.

Historical tasks without the guided marker preserve legacy/permissive behavior, including old policy-snapshot behavior. Users should finish or resume those tasks as they are, and use the guided flow for new `sduck work` tasks.

The tracked `.decision/policy.json` also includes `workflowEnabled`. It defaults to `true`. `sduck workflow disable` blocks only new `sduck work` creation; read-only commands and existing history remain available. Re-enable with `sduck workflow enable`. Changing this mode requires no active non-terminal decision task.

### Automatic retrospective capture while disabled

When workflow creation is disabled, `sduck init` and `sduck update` install an advisory local post-commit hook only when the hook path is absent. Existing hooks are preserved, including with `--force`; sduck does not overwrite them. If workflow creation is enabled, the installed hook no-ops. To decide whether to no-op, the hook reads only `.decision/policy.json`; it never inspects source content and never runs `sduck`, an LLM, or the network. When disabled, after a commit it writes a local Git marker containing the commit and first-parent SHA.

`sduck workflow enable` rejects a pending retrospective marker so the marker is handled or cleared before normal workflow creation resumes. If hook installation is unavailable because an existing hook is preserved, disabled mode still remains safe and advisory: no automatic marker is written, and agents can perform retrospective capture only when given an explicit Git range.

An active coding agent checks for that marker after its own commit or at the start of its next response. It can inspect the `parent..commit` diff and run `sduck retrospective capture --stdin` to record concise retrospective draft decisions, then clears the marker after success. Ordinary `sduck work` creation remains disabled.

This is best-effort automation, not a commit-time LLM runtime. A commit made outside an active agent session waits until the next agent response. Capture requires disabled workflow mode and no active decision task; unsupported rationale remains `INFERRED` or `OPEN` rather than being presented as user-confirmed intent.

The grill step is about decision quality, not ceremony. For small work, the agent may submit one concise decision and no unnecessary questions after completing the grill. For complex work, the agent should explore the codebase first, ask one question at a time only when needed, include a recommended answer and rationale, and make expected/avoided scope plus implementation/verification plans explicit.

## Locale and config details

```bash
sduck config locale en
sduck config locale ko
```

The preference is user-global. Resolution order is:

1. `SDUCK_CONFIG_HOME/config.json`
2. `$XDG_CONFIG_HOME/sduck/config.json`
3. platform user config directory, such as `~/Library/Application Support/sduck/config.json` on macOS, `~/.config/sduck/config.json` on Linux, `%APPDATA%\\sduck\\config.json` on Windows, or the fallback `~/AppData/Roaming/sduck/config.json`

The file contains `schemaVersion` and `locale`. Missing config defaults to English. Malformed supported config falls back to English with a warning on v2/root/config routes and can be repaired by `sduck config locale en|ko`. Unsupported future schemas are not overwritten by older CLIs.

This user-global config is separate from tracked `.decision/policy.json`.

## Command reference

### Workspace and config

| Command                                                     | Purpose                                                                                      |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `sduck --help`                                              | Show root help.                                                                              |
| `sduck init [--agents <list>] [--force] [--no-agent-rules]` | Initialize `.decision`, compatibility assets, and managed agent rules.                       |
| `sduck config locale <en\|ko>`                              | Set the user-global v2 display locale.                                                       |
| `sduck status [--json]`                                     | Show the current task and progress counts.                                                   |
| `sduck workflow status [--json]`                            | Show whether new `sduck work` creation is enabled.                                           |
| `sduck workflow enable [--json]`                            | Enable new decision workflow creation.                                                       |
| `sduck workflow disable [--json]`                           | Disable new decision workflow creation without changing existing records.                    |
| `sduck retrospective capture --stdin`                       | Capture the pending post-commit marker as a retrospective draft while workflow is disabled.  |
| `sduck doctor [--repair]`                                   | Diagnose malformed source, DB-only cache, interrupted journal, and cache consistency issues. |
| `sduck rebuild`                                             | Rebuild local SQLite cache from canonical Markdown source.                                   |

`--agents` accepts `claude-code,codex,opencode,gemini-cli,cursor,antigravity`. `--force` refreshes bundled assets and managed blocks. `--no-agent-rules` skips managed agent instructions.

### Decision task flow

| Command                                                          | Purpose                                                                                                                                                                                   |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sduck work [--record-depth FULL\|LIGHTWEIGHT] <description...>` | Start a guided decision briefing task, auto-start grill, and index context. `FULL` is the default/current behavior; `LIGHTWEIGHT` is a Stage 1 no-op and does not change lifecycle gates. |
| `sduck resume <taskId>`                                          | Resume a previous non-terminal task.                                                                                                                                                      |
| `sduck context [--json]`                                         | Show the current context pack.                                                                                                                                                            |
| `sduck context add <pathOrGlob>`                                 | Add project-local context.                                                                                                                                                                |
| `sduck grill-me [--json]`                                        | Compatibility command: print/record the grill start prompt/protocol.                                                                                                                      |
| `sduck grill complete --reason <text> [--carried <DEC-ID>...]`   | Record guided grill completion so submit/confirm can proceed.                                                                                                                             |
| `sduck submit --stdin`                                           | Read a JSON or Markdown draft from stdin.                                                                                                                                                 |
| `sduck ask`                                                      | Show the next open question.                                                                                                                                                              |
| `sduck answer <questionId> --option <n>`                         | Answer with a 1-based option number.                                                                                                                                                      |
| `sduck answer <questionId> --text <answer>`                      | Answer with free text.                                                                                                                                                                    |
| `sduck brief [--json]`                                           | Render the implementation brief.                                                                                                                                                          |
| `sduck confirm`                                                  | Confirm a ready brief and capture the baseline.                                                                                                                                           |
| `sduck trace [--base <ref>] [--json]`                            | Record implementation files changed since confirmation.                                                                                                                                   |
| `sduck evaluate --check "name=outcome"`                          | Record evaluation evidence for the latest trace; does not execute commands.                                                                                                               |
| `sduck graph show <TASK-*\|DEC-*> [--depth N] [--json]`          | Inspect bounded relationships from the rebuildable local SQLite graph projection.                                                                                                         |
| `sduck remember`                                                 | Export Markdown-derived graph artifacts for reuse.                                                                                                                                        |
| `sduck recall <query...>`                                        | Search prior confirmed decisions and traces.                                                                                                                                              |
| `sduck close`                                                    | Mark the current task closed after guided trace evaluation.                                                                                                                               |
| `sduck abandon`                                                  | Abandon the current v2 task.                                                                                                                                                              |

### Legacy compatibility commands

These commands remain available for v1/SDD compatibility and are intentionally English-only:

```bash
sduck start <type> <slug>
sduck fast-track <type> <slug>
sduck spec approve [target]
sduck plan approve [target]
sduck step done <number> [target]
sduck review ready [target]
sduck done [target]
sduck use <target>
sduck implement [target]
sduck clean [target]
sduck reopen [target]
sduck archive
sduck update
sduck abandon <target>
```

Legacy gates apply only when `.sduck/sduck-state.yml` has a non-null `current_work_id`. `sduck abandon <target>` routes to legacy behavior; bare `sduck abandon` routes to v2.

## Draft input

`sduck submit --stdin` accepts raw JSON:

```json
{
  "schemaVersion": "v2alpha1",
  "taskId": "TASK-20260507-payment-retry",
  "expectedScope": ["Payment retry flow"],
  "avoidScope": ["Changing payment provider contracts"],
  "implementationPlan": ["Use existing retry helper for retryable payment failures."],
  "verificationPlan": ["Run payment retry unit tests and record outcomes with sduck evaluate."],
  "decisions": [
    {
      "id": "DEC-retry-policy",
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
      "id": "Q-retry-count",
      "text": "What is the maximum retry count?",
      "recommendedAnswer": "3 retries",
      "rationale": ["Keeps worst-case latency bounded."],
      "options": ["3 retries", "5 retries"]
    }
  ],
  "evidence": [
    {
      "id": "EVD-retry-helper",
      "sourceType": "CODE",
      "sourceRef": "src/network/retry.ts",
      "summary": "Existing retry helper supports backoff and jitter.",
      "confidence": 0.9
    }
  ]
}
```

It also accepts Markdown containing a fenced `json sduck-draft` block:

````markdown
# Draft

```json sduck-draft
{
  "schemaVersion": "v2alpha1",
  "decisions": [],
  "questions": [],
  "evidence": []
}
```
````

Decision kinds are `EXPLICIT`, `INFERRED`, `CARRIED`, `CONFLICT`, and `OPEN`. Confidence values are numbers from `0` to `1`. Portable explicit IDs are optional; sduck generates IDs when they are omitted.

For guided tasks, `implementationPlan` and `verificationPlan` must both be present and non-empty before the brief can be confirmed. A `CARRIED` decision must include rationale and source references to confirmed decisions from another non-abandoned task.

## Storage and artifacts

Tracked canonical source:

- `.decision/policy.json`
- `.decision/exports/markdown/tasks/*.md`
- `.decision/exports/markdown/decisions/*.md`
- `.decision/exports/markdown/implementations/*.md`

Local/generated files:

- `.decision/state.json`
- `.decision/db.sqlite*`
- `.decision/.commit-*.json`
- `.decision/workspace.lock/`
- `.decision/exports/graphify/`
- temporary staging and rollback directories

Every successful mutation validates the complete bundle, writes canonical source atomically, and updates the ignored SQLite cache. `.decision/.commit-*.json` files are temporary transactional journals used for interrupted-write recovery and are ignored. `sduck rebuild` recreates the cache from canonical Markdown. `sduck doctor --repair` can migrate DB-only legacy data to Markdown or rebuild a stale cache. `sduck graph show` reads bounded relationships from the local SQLite projection; the projection is never canonical authority. `sduck remember` writes reusable graph exports; canonical Markdown has already been updated by the successful workflow commands.

Terminal output may be localized. JSON output and canonical Markdown remain locale-neutral.

## Concepts

- **Decision task**: one unit of briefing and implementation alignment.
- **Context pack**: project files, prior decisions, traces, prompts, and draft schema shown to the agent.
- **Guided grill**: the clarification/interview phase auto-started by `work` and completed with `grill complete`.
- **Brief**: problem, grouped decisions, questions, evidence, expected/avoided scope, implementation plan, and verification plan.
- **Confirmation baseline**: the Git baseline captured by `sduck confirm` for later tracing.
- **Trace**: implementation files mapped back to confirmed decisions.
- **Evaluation**: evidence recorded for the latest trace. It does not execute commands.
- **Graph projection**: rebuildable local SQLite relationships inspectable with `graph show`; Markdown remains canonical.
- **Memory**: prior confirmed decisions/traces exported and searchable by `recall`.

## Legacy compatibility

The legacy SDD workflow remains reachable for existing teams and old workspaces. It is not the primary workflow for new documentation. Legacy help, parser errors, and command output stay English even when `sduck config locale ko` is set.

Installed agent rules say to use v2 by default and to apply legacy SDD gates only when `.sduck/sduck-state.yml` names an active legacy task.

## Development

```bash
npm install
npm run typecheck
npm run lint
npm run format:check
npm run test:unit
npm run test:e2e
npm run build
npm run package:check
```

Most tests create temporary workspaces outside the repository. CLI-spawning tests isolate user-global config with `SDUCK_CONFIG_HOME`.

## Limitations

- v2 is designed for terminal-driven agent workflows; it does not replace code review or CI.
- Agent hooks are advisory. The CLI records workflow evidence but has no built-in CI trace verifier; run project checks separately and record outcomes with `sduck evaluate`.
- The local SQLite cache depends on Node's experimental `node:sqlite` API.
- Legacy v1/SDD behavior is compatibility-only and is not localized.

## License

MIT. See [LICENSE](LICENSE).
