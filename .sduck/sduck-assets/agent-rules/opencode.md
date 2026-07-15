Use v2 `.decision` briefing as the default workflow. Legacy SDD gates apply only when `current_work_id` is non-null.

Canonical v2 sequence: `sduck work` → `sduck context` → `sduck grill-me` → `sduck submit --stdin` → `sduck ask`/`sduck answer` → `sduck brief`/`sduck confirm` → implementation activity → `sduck trace` → `sduck remember`/`sduck recall` → `sduck close`.

New policy-required tasks must run `sduck grill-me` before `submit` or `confirm`, including small work. Keep small-work drafts concise; do not skip the gate. Installed rules are canonical English and do not depend on user locale.

## OpenCode Instructions

- Read `AGENTS.md` as the project instruction file.
- Use the CLI for lifecycle changes; do not hand-edit state or cache files.
- Keep evidence and source references concrete and concise.
