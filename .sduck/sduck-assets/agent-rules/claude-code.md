Use v2 `.decision` briefing as the default workflow. Legacy SDD gates apply only when `current_work_id` is non-null.

## Claude Code Instructions

- Read `CLAUDE.md` as the project instruction file.
- Use the CLI for lifecycle changes; do not hand-edit state or cache files.
- The installed hook is advisory; CLI and CI checks are authoritative.
