# SDD Workflow Rules

- Start each session by checking `sduck-workspace/` and any active task `meta.yml`.
- Do not write implementation code before spec approval.
- Do not start implementation before plan approval.
- Follow the workflow order: `spec -> approval -> plan -> approval -> implementation`.
- Respect `meta.yml` state transitions and update step completion immediately.
- Read and apply user memo text appended with `<-` in `spec.md` and `plan.md`.
- Use `sduck-assets/spec-evaluation.yml` and `sduck-assets/plan-evaluation.yml` when evaluating spec and plan quality.
- Do not mark a task `DONE` until all completion criteria are satisfied.
