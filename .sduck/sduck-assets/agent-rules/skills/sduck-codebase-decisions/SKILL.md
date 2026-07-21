---
name: sduck-codebase-decisions
description: Reads an existing codebase, docs, tests, and configuration to record explicit or inferred architectural and implementation decisions in sduck's decision store. Use when the user asks to inspect a codebase for existing decisions, preserve prior rationale, build project memory, or save discovered decisions for future agents.
---

# Codebase Decisions

## Quick start

Use this skill to turn existing codebase knowledge into reusable sduck memory.

```bash
sduck work "Codebase decision inventory"
sduck context
sduck grill complete --reason "Inventory scope and evidence sources are understood."
sduck context add "src/**"
sduck context add "docs/**"
sduck submit --stdin < draft.md
sduck ask
sduck answer QUESTION-1 --option 1
sduck brief
sduck confirm
sduck trace
sduck evaluate --check "decision inventory=completed" --limitation "No automated code checks were required"
sduck remember
sduck recall "architecture decisions"
sduck close
```

## Workflow

1. Confirm or create a decision task with `sduck status --json`; if none exists, run `sduck work "Codebase decision inventory"`.
2. Run `sduck context` and identify relevant sources: README, ADRs, specs, agent rules, package/config files, core modules, tests, and migration/history docs.
3. Record `sduck grill complete --reason "..."` before submitting a draft for new policy-required tasks; `sduck grill-me` is only a compatibility prompt/start command.
4. Add explored context with `sduck context add <path-or-glob>` for important files or directories.
5. Extract decision candidates and separate observed facts from inferred rationale.
6. Classify each candidate as `EXPLICIT`, `INFERRED`, `CARRIED`, `CONFLICT`, or `OPEN`.
7. Submit a `SduckDraft` using raw JSON or a ```json sduck-draft fenced block via `sduck submit --stdin`.
8. Resolve every open question with `sduck ask` and `sduck answer`.
9. Render and confirm the brief with `sduck brief` and `sduck confirm`.
10. Perform the implementation activity, then record it with `sduck trace`.
11. Record validation evidence or limitations with `sduck evaluate --check "name=outcome"`.
12. Export durable artifacts with `sduck remember`, then verify recall with `sduck recall <query>`.
13. Finish with `sduck close`.

## Decision classification

- `EXPLICIT`: directly stated in ADRs, docs, specs, comments, or user instructions.
- `INFERRED`: implied by repeated code structure, tests, module boundaries, or naming.
- `CARRIED`: a previous convention still preserved by current code.
- `CONFLICT`: code, docs, tests, or configuration point to incompatible decisions.
- `OPEN`: a decision is needed but evidence is insufficient.

Use conservative `confidence` for inferred decisions. Prefer questions over pretending certainty.

## Draft format

```json sduck-draft
{
  "schemaVersion": "v2alpha1",
  "expectedScope": ["src/core/", "tests/unit/", "docs/adr/"],
  "avoidScope": ["node_modules/", "dist/", "coverage/"],
  "decisions": [
    {
      "title": "Keep CLI wrappers thin and behavior in core modules",
      "kind": "INFERRED",
      "confidence": 0.82,
      "summary": "Command modules parse input and delegate behavior to src/core so logic remains testable outside the CLI.",
      "rationale": [
        "Command files mostly handle IO.",
        "Unit tests exercise core modules directly."
      ],
      "appliesTo": ["src/commands/", "src/core/"],
      "avoids": ["Embedding business logic directly in command action handlers"],
      "sourceRefs": ["src/commands/init.ts:1-80", "src/core/init.ts:1-120"]
    }
  ],
  "evidence": [
    {
      "sourceType": "CODE",
      "sourceRef": "src/commands/init.ts:1-80",
      "summary": "Init command translates CLI options and delegates initialization to core code.",
      "confidence": 0.9
    }
  ],
  "questions": [
    {
      "text": "Should inferred decisions remain DRAFT until user confirmation?",
      "recommendedAnswer": "Keep inferred decisions as DRAFT until confirmed by the user.",
      "rationale": [
        "Agents can infer intent but cannot authoritatively approve historical rationale."
      ],
      "options": ["Keep DRAFT", "Mark CONFIRMED", "Decide by confidence threshold"]
    }
  ]
}
```

## Evidence and safety rules

- Use `path:line` or `path:line-line` for `sourceRefs` and `evidence.sourceRef` whenever possible.
- Summarize evidence; do not paste large source excerpts.
- Never copy secrets, tokens, credentials, private keys, or sensitive customer data into decisions or evidence summaries.
- If sources disagree, record a `CONFLICT` decision and a follow-up `question`.
- If a decision affects future implementation, include `appliesTo` and `avoids`.

## Verification

- Run project checks separately; sduck has no built-in CI trace verifier. Record outcomes or limitations with `sduck evaluate` before close.
- Run `sduck remember` only after the brief has been confirmed and the implementation trace has been recorded and evaluated.
- Run `sduck recall <important topic>` and confirm the new decisions are retrievable.
- Leave unresolved assumptions as `questions` instead of silently dropping them.
