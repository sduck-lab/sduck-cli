---
name: sd-build-wiki
description: Build the initial evidence-backed sduck Markdown Wiki. Use when docs/wiki has not been built, when onboarding a project to Auto Wiki, or when the user asks for an initial Overview, Glossary, Capabilities, Architecture & Flows, or Decisions & Recent Changes view.
---

# Build the initial Wiki

Create a human-readable materialized view of canonical `.decision` records. Do not present the Wiki as a second source of truth, and do not add an LLM runtime or daemon.

## Prepare

1. Run `sduck wiki status --json`. If Wiki policy is disabled in an existing workspace, run the approved `sduck update` migration; do not edit policy, state, or cache files manually.
2. Inspect tracked code, README files, domain docs, and existing `.decision/exports/markdown/**` before asking anything the repository can answer.
3. Use the normal sduck decision workflow to record durable project decisions and evidence before citing them. Do not invent source IDs.

## Interview

Interview at grill-me depth. Ask one question at a time. For every question, include a recommended answer and the reason for recommending it.

Resolve these topics without forcing premature implementation choices:

- project purpose and primary users;
- core capabilities and successful outcomes;
- project vocabulary and terms that must not be conflated;
- explicit non-goals and boundaries;
- operational, security, compatibility, and delivery constraints;
- measurable success criteria.

Stop when the answers and inspected evidence are sufficient to build all five pages. Record new decisions through `sduck submit --stdin`, resolve questions, and confirm the brief before treating them as confirmed intent.

## Compose the payload

Submit `schemaVersion: sduck-wiki/v1` with exactly these stable pages and sections:

- `overview`: `purpose`, `users-and-success`, `scope-and-constraints`
- `glossary`: `terms`
- `capabilities`: `capabilities`, `boundaries`
- `architecture-and-flows`: `architecture`, `flows`
- `decisions-and-recent-changes`: `decisions`, `recent-changes`, `validation-reports`

Each section contains non-empty `blocks`. Each block contains `type`, `markdown`, and existing `sourceIds`. Use only these block types:

- `explanation` for sourced explanatory prose;
- `decision-intent` for what was decided; include a Decision ID;
- `implementation-claim` for an agent-submitted implementation statement; never say the CLI verified code meaning;
- `change-tracking` for files recorded by a Trace; include a Trace ID;
- `validation-report` for checks reported through Evaluation; include an Evaluation ID and do not call it CI proof;
- `semantic-conflict` only for an agent-proposed meaning conflict; state that it is not CLI-verified.

Keep citations at block level. Do not attach citations to every ordinary sentence. Never place sduck ownership markers inside block Markdown.

## Build and verify

1. Pipe the complete JSON payload to `sduck wiki build --stdin`.
2. Run `sduck wiki status` and `sduck wiki lint`.
3. Fix missing IDs, malformed links, schema errors, or ownership errors through a new validated payload. Do not edit generated markers or manifest metadata by hand.
4. Leave `## Team Notes` and all content outside generated markers human-owned.

Do not commit, tag, push, or publish automatically.
