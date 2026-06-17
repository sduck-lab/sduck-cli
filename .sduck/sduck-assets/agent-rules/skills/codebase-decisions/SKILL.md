---
name: codebase-decisions
description: Reads an existing codebase, docs, tests, and configuration to record explicit or inferred architectural and implementation decisions in sduck's decision store. Use when the user asks to inspect a codebase for existing decisions, preserve prior rationale, build project memory, or save discovered decisions for future agents.
---

# Codebase Decisions

## Quick start

Use this skill to turn existing codebase knowledge into reusable sduck memory.

```bash
sduck work "Codebase decision inventory"
sduck context add "src/**"
sduck context add "docs/**"
sduck submit --stdin < draft.md
sduck remember
sduck recall "architecture decisions"
```

## Workflow

1. Confirm or create a decision task with `sduck status --json`; if none exists, run `sduck work "Codebase decision inventory"`.
2. Identify relevant sources: README, ADRs, specs, agent rules, package/config files, core modules, tests, and migration/history docs.
3. Add explored context with `sduck context add <path-or-glob>` for important files or directories.
4. Extract decision candidates and separate observed facts from inferred rationale.
5. Classify each candidate as `EXPLICIT`, `INFERRED`, `CARRIED`, `CONFLICT`, or `OPEN`.
6. Submit a `SduckDraft` using raw JSON or a ```json sduck-draft fenced block via `sduck submit --stdin`.
7. Export durable artifacts with `sduck remember`.
8. Verify recall with `sduck recall <query>`.

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
      "rationale": ["Command files mostly handle IO.", "Unit tests exercise core modules directly."],
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
      "rationale": ["Agents can infer intent but cannot authoritatively approve historical rationale."],
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

- Run `sduck remember` after submission.
- Run `sduck recall <important topic>` and confirm the new decisions are retrievable.
- Leave unresolved assumptions as `questions` instead of silently dropping them.
