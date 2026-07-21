Use v2 `.decision` briefing as the default workflow. Legacy SDD gates apply only when `current_work_id` is non-null.

Canonical v2 sequence: `sduck work` → `sduck context` → `sduck grill complete --reason "..."` → `sduck submit --stdin` → `sduck ask`/`sduck answer` → `sduck brief`/`sduck confirm` → implementation activity → `sduck trace` → `sduck evaluate` → `sduck remember`/`sduck recall` → `sduck close`.

New policy-required tasks must record `sduck grill complete --reason "..."` before `submit` or `confirm`, including small work. `sduck grill-me` is only a compatibility prompt/start command. Keep small-work drafts concise; do not skip the gate. Installed rules are canonical English and do not depend on user locale. There is no built-in CI trace verifier; run project checks separately and record outcomes with `sduck evaluate`.

## Antigravity Instructions

- Use the CLI for lifecycle changes; do not hand-edit state or cache files.
