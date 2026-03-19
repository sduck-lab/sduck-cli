# SDD Workflow Rules

- Start each session by checking `sduck-workspace/` and any active task `meta.yml`.
- Do not write implementation code before spec approval.
- Do not start implementation before plan approval.
- Follow the workflow order: `spec -> approval -> plan -> approval -> implementation`.
- Respect `meta.yml` state transitions and update step completion immediately.
- Read and apply user memo text appended with `<-` in `spec.md` and `plan.md`.
- Use `sduck-assets/eval/spec.yml`, `sduck-assets/eval/plan.yml`, and `sduck-assets/eval/task.yml` when evaluating spec, plan, and completed task quality.
- After implementation is complete, run task evaluation, show the results, and only then move to `task done` or final completion processing.
- Do not mark a task `DONE` until all completion criteria are satisfied.
