---
id: english-default-korean-v2-locale
type: decision
task_id: TASK-20260714-organize-the-complete-workflow-and-update-the-re
kind: EXPLICIT
status: CONFIRMED
confidence: 1
source_refs:
  - 'user: 2026-07-14 locale decisions'
  - src/cli.ts:43-357
  - src/commands/v2/index.ts:31-301
  - src/ui/v2/render.ts:11-142
  - src/core/v2/policy.ts:6-40
applies_to:
  - v2 command output, help, errors, and next-step guidance
  - a user-global locale configuration command and durable config file
  - README.md and README.ko.md
avoids:
  - Adding a v1 translation layer
  - Storing locale in tracked .decision/policy.json
  - Making locale a project-shared setting
created_at: '2026-07-14T05:14:52.654Z'
updated_at: '2026-07-14T05:14:53.216Z'
---
# english-default-korean-v2-locale: Default to English and offer a global Korean v2 locale

## Decision
Use English as the default for CLI output and documentation, publish a Korean README, and provide a user-global locale preference for Korean v2 CLI output; v1 is not localized or redesigned.

## Rationale
- The user explicitly chose English as the default, a Korean README, user-global storage, and v2-only localization.
- Locale is a personal display preference, not a tracked workspace policy.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "english-default-korean-v2-locale",
    "taskId": "TASK-20260714-organize-the-complete-workflow-and-update-the-re",
    "title": "Default to English and offer a global Korean v2 locale",
    "kind": "EXPLICIT",
    "status": "CONFIRMED",
    "confidence": 1,
    "summary": "Use English as the default for CLI output and documentation, publish a Korean README, and provide a user-global locale preference for Korean v2 CLI output; v1 is not localized or redesigned.",
    "rationale": [
      "The user explicitly chose English as the default, a Korean README, user-global storage, and v2-only localization.",
      "Locale is a personal display preference, not a tracked workspace policy."
    ],
    "appliesTo": [
      "v2 command output, help, errors, and next-step guidance",
      "a user-global locale configuration command and durable config file",
      "README.md and README.ko.md"
    ],
    "avoids": [
      "Adding a v1 translation layer",
      "Storing locale in tracked .decision/policy.json",
      "Making locale a project-shared setting"
    ],
    "sourceRefs": [
      "user: 2026-07-14 locale decisions",
      "src/cli.ts:43-357",
      "src/commands/v2/index.ts:31-301",
      "src/ui/v2/render.ts:11-142",
      "src/core/v2/policy.ts:6-40"
    ],
    "createdAt": "2026-07-14T05:14:52.654Z",
    "updatedAt": "2026-07-14T05:14:53.216Z"
  }
}
```
