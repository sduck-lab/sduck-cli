# sduck

[한국어 README](README.ko.md)

`sduck` is a terminal-first decision briefing harness for coding agents. It helps a developer and an agent agree on implementation decisions before code changes begin, records the confirmed brief, traces the implementation afterward, and makes prior decisions searchable for future work.

The primary public workflow is v2, stored in `.decision/`. Legacy SDD commands still exist for compatibility, but new documentation and installed agent rules point to the v2 decision briefing flow.

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

# 3. Give the agent the context pack.
sduck context

# 4. Run the required grill-me gate for new policy-required tasks.
sduck grill-me

# 5. Submit the agent's structured decisions, questions, evidence, and scope.
sduck submit --stdin < draft.json

# 6. Resolve open questions.
sduck ask
sduck answer QUESTION-1 --option 1
# or
sduck answer QUESTION-1 --text "Use exponential backoff with jitter."

# 7. Review and confirm the brief.
sduck brief
sduck confirm

# 8. Implement the change with your editor or coding agent, then trace it.
sduck trace
sduck remember

# 9. Reuse prior decisions and finish the task.
sduck recall "payment retry"
sduck close
```

Here “implement” means the development activity after `sduck confirm`; it is not the legacy `sduck implement` command.

## Workflow contract and gates

Canonical v2 sequence:

```text
init → work → context → grill-me → submit → ask/answer → brief/confirm → implement → trace → remember/recall → close
```

The practical contract is:

1. `sduck init` creates `.decision/`, `.decision/policy.json`, compatibility `.sduck` assets, `.gitignore` entries, and managed agent rules unless disabled.
2. `sduck work "..."` starts the current decision task.
3. `sduck context` prints relevant files, prior decisions/traces, the grill-me protocol, and the draft schema.
4. `sduck grill-me` records the required clarification/interview gate for new policy-required tasks.
5. `sduck submit --stdin` accepts the agent draft only after the gate for required tasks.
6. `sduck ask` and `sduck answer` resolve open questions.
7. `sduck brief` renders the localized terminal brief; `sduck confirm` records the canonical English confirmed brief and captures a Git baseline.
8. The developer or agent implements the change outside sduck.
9. `sduck trace` records changed implementation files since confirmation.
10. `sduck remember` exports reusable graph artifacts; `sduck recall` searches remembered decisions/traces.
11. `sduck close` completes the task, or `sduck abandon` abandons it.

`confirm`, `trace`, `close`, and `abandon` reject invalid or terminal transitions without changing canonical source. `confirm` also rejects remaining open questions, active `OPEN` decisions, and active `CONFLICT` decisions.

## Grill-me and policy

Newly initialized v2 workspaces write a tracked `.decision/policy.json` that requires `sduck grill-me` before `submit` or `confirm` for new tasks. This is a project policy file and should be reviewed like other tracked project configuration.

Existing pre-policy workspaces and tasks remain permissive/legacy-compatible. They are reported as `legacy/permissive` and are not silently tightened by a newer CLI.

The grill-me rule is intentionally about decision quality, not ceremony. For small work, the agent may submit one concise decision and no unnecessary questions after the required grill step. For complex work, the agent should explore the codebase first, ask one question at a time only when needed, include a recommended answer and rationale, and make expected/avoided scope explicit.

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
| `sduck doctor [--repair]`                                   | Diagnose malformed source, DB-only cache, interrupted journal, and cache consistency issues. |
| `sduck rebuild`                                             | Rebuild local SQLite cache from canonical Markdown source.                                   |

`--agents` accepts `claude-code,codex,opencode,gemini-cli,cursor,antigravity`. `--force` refreshes bundled assets and managed blocks. `--no-agent-rules` skips managed agent instructions.

### Decision task flow

| Command                                     | Purpose                                                 |
| ------------------------------------------- | ------------------------------------------------------- |
| `sduck work <description...>`               | Start a decision briefing task and index context.       |
| `sduck resume <taskId>`                     | Resume a previous non-terminal task.                    |
| `sduck context [--json]`                    | Show the current context pack.                          |
| `sduck context add <pathOrGlob>`            | Add project-local context.                              |
| `sduck grill-me [--json]`                   | Record and print the required grill-me prompt/protocol. |
| `sduck submit --stdin`                      | Read a JSON or Markdown draft from stdin.               |
| `sduck ask`                                 | Show the next open question.                            |
| `sduck answer <questionId> --option <n>`    | Answer with a 1-based option number.                    |
| `sduck answer <questionId> --text <answer>` | Answer with free text.                                  |
| `sduck brief [--json]`                      | Render the implementation brief.                        |
| `sduck confirm`                             | Confirm a ready brief and capture the baseline.         |
| `sduck trace [--base <ref>] [--json]`       | Record implementation files changed since confirmation. |
| `sduck remember`                            | Export Markdown-derived graph artifacts for reuse.      |
| `sduck recall <query...>`                   | Search prior confirmed decisions and traces.            |
| `sduck close`                               | Mark the current task closed.                           |
| `sduck abandon`                             | Abandon the current v2 task.                            |

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

Every successful mutation validates the complete bundle, writes canonical source atomically, and updates the ignored SQLite cache. `.decision/.commit-*.json` files are temporary transactional journals used for interrupted-write recovery and are ignored. `sduck rebuild` recreates the cache from canonical Markdown. `sduck doctor --repair` can migrate DB-only legacy data to Markdown or rebuild a stale cache. `sduck remember` writes reusable graph exports; canonical Markdown has already been updated by the successful workflow commands.

Terminal output may be localized. JSON output and canonical Markdown remain locale-neutral.

## Concepts

- **Decision task**: one unit of briefing and implementation alignment.
- **Context pack**: project files, prior decisions, traces, prompts, and draft schema shown to the agent.
- **Grill-me**: the required clarification gate for new policy-required tasks.
- **Brief**: grouped decisions, questions, evidence, expected scope, and avoided scope.
- **Confirmation baseline**: the Git baseline captured by `sduck confirm` for later tracing.
- **Trace**: implementation files mapped back to confirmed decisions.
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
- Agent hooks are advisory. CLI and CI validation are authoritative.
- The local SQLite cache depends on Node's experimental `node:sqlite` API.
- Legacy v1/SDD behavior is compatibility-only and is not localized.

## License

MIT. See [LICENSE](LICENSE).
