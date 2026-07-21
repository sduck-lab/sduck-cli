# sduck conversational workflow design — historical draft

Status: **HISTORICAL / SUPERSEDED for 0.6.0**
Release lane: **0.6.0 CLI foundations**

This document previously explored a conversation-native MCP server and editor guard lane. That lane is **not implemented in 0.6.0**. The release ships the CLI v2 guided decision workflow and repository-only Phase 0 contract fixtures; all MCP runtime/control-plane features are deferred and absent.

## Current 0.6.0 workflow

Agents and users should use the CLI-only sequence:

```text
sduck work -> sduck context -> sduck grill complete --reason "..." -> sduck submit --stdin -> sduck ask/sduck answer -> sduck brief/sduck confirm -> implementation activity -> sduck trace -> sduck evaluate -> sduck remember/sduck recall -> sduck close
```

Key properties:

- `sduck work` creates the guided task and records grill start automatically.
- The agent follows the printed interview protocol, then records `sduck grill complete --reason "..."` before draft submission.
- `sduck brief` renders the proposed implementation brief; `sduck confirm` is the local CLI confirmation gate.
- `sduck trace` records changed files after confirmation.
- `sduck evaluate` records validation results or limitations supplied by the operator. It does not run shell commands, CI, or a trace verifier.
- `sduck remember`/`sduck recall` make confirmed decisions and traces reusable.
- `sduck close` finishes only after required trace/evaluation evidence exists.

## Superseded MCP/guard proposal

The following ideas from the earlier draft are deferred and must not be described as 0.6.0 behavior:

- `sduck mcp` stdio server.
- MCP tools such as `sduck_start_task`, `sduck_record`, `sduck_confirm_brief`, `sduck_trace`, or `sduck_finish_task`.
- MCP permission prompts as confirmation evidence.
- `.mcp.json` installation or automatic MCP server configuration.
- A new v2 editor guard/control-plane hook.
- A built-in CI trace verifier or `sduck verify` command.
- Automatic close-time `remember` behavior.

The bundled Git post-commit retrospective hook is unrelated to this deferred MCP lane. It is a safe, local, best-effort marker writer for disabled-workflow retrospective capture. It reads only `.decision/policy.json` to decide whether to no-op, never inspects source content, and never runs sduck, an LLM, or network requests. Installation is absent-path only; existing hooks are preserved even with force. Enabled workflow mode is a hook no-op, `workflow enable` rejects pending markers, and disabled mode remains advisory when hook automation is unavailable.

## Future restart conditions

Restarting MCP/control-plane work requires a separate confirmed decision task. That task should explicitly decide scope, digest semantics, source-envelope migration, idempotency, context persistence, trace/verifier behavior, transport, security boundaries, fixtures, and tests before implementation begins.
