import { describe, expect, it } from 'vitest';

import { formatImplementOutput, type ImplementContext } from '../../src/core/implement.js';

describe('formatImplementOutput', () => {
  it('displays all fields for a normal work', () => {
    const context: ImplementContext = {
      baseBranch: 'main',
      branch: 'work/feature/login',
      id: '20260324-0100-feature-login',
      planPath: '.sduck/sduck-workspace/20260324-0100-feature-login/plan.md',
      specPath: '.sduck/sduck-workspace/20260324-0100-feature-login/spec.md',
      status: 'IN_PROGRESS',
      worktreePath: '.sduck-worktrees/20260324-0100-feature-login',
      workspacePath: '.sduck/sduck-workspace/20260324-0100-feature-login',
    };

    const output = formatImplementOutput(context);

    expect(output).toContain('Work ID:      20260324-0100-feature-login');
    expect(output).toContain('Branch:       work/feature/login');
    expect(output).toContain('Worktree:     .sduck-worktrees/20260324-0100-feature-login');
    expect(output).toContain('Spec:');
    expect(output).toContain('Plan:');
    expect(output).toContain('cd .sduck-worktrees/20260324-0100-feature-login');
  });

  it('displays (none) for --no-git work', () => {
    const context: ImplementContext = {
      baseBranch: null,
      branch: null,
      id: '20260324-0100-feature-login',
      planPath: '.sduck/sduck-workspace/20260324-0100-feature-login/plan.md',
      specPath: '.sduck/sduck-workspace/20260324-0100-feature-login/spec.md',
      status: 'IN_PROGRESS',
      worktreePath: null,
      workspacePath: '.sduck/sduck-workspace/20260324-0100-feature-login',
    };

    const output = formatImplementOutput(context);

    expect(output).toContain('Branch:       (none)');
    expect(output).toContain('Worktree:     (none)');
    expect(output).not.toContain('cd ');
  });

  it('includes agent-context.json path in output', () => {
    const context: ImplementContext = {
      baseBranch: 'main',
      branch: 'work/feature/login',
      id: '20260324-0100-feature-login',
      planPath: '.sduck/sduck-workspace/20260324-0100-feature-login/plan.md',
      specPath: '.sduck/sduck-workspace/20260324-0100-feature-login/spec.md',
      status: 'IN_PROGRESS',
      worktreePath: '.sduck-worktrees/20260324-0100-feature-login',
      workspacePath: '.sduck/sduck-workspace/20260324-0100-feature-login',
    };

    const output = formatImplementOutput(context);

    expect(output).toContain(
      'Context File: .sduck/sduck-workspace/20260324-0100-feature-login/agent-context.json',
    );
  });
});
