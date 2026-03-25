import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { runCli } from '../helpers/run-cli.js';
import { prepareProjectWorkspace, removeProjectWorkspace } from '../helpers/temp-workspace.js';

import type { AgentContext } from '../../src/core/agent-context.js';

describe('agent-context.json lifecycle', () => {
  const cliRoot = process.cwd();
  let tempWorkspace = '';
  const workspaceName = 'agent-context-e2e';

  afterEach(async () => {
    await removeProjectWorkspace(cliRoot, workspaceName);
    tempWorkspace = '';
  });

  async function getTaskDir(slug: string): Promise<string> {
    const entries = await readdir(join(tempWorkspace, '.sduck', 'sduck-workspace'));
    const taskDir = entries.find((entry) => entry.endsWith(`-${slug}`));

    if (taskDir === undefined) {
      throw new Error(`Expected created task directory for ${slug}.`);
    }

    return taskDir;
  }

  it('creates agent-context.json on start', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await runCli(['init'], { cliRoot, cwd: tempWorkspace });

    await runCli(['start', 'feature', 'ctx-start', '--no-git'], { cliRoot, cwd: tempWorkspace });
    const taskDir = await getTaskDir('ctx-start');

    const contextPath = join(
      tempWorkspace,
      '.sduck',
      'sduck-workspace',
      taskDir,
      'agent-context.json',
    );
    const content = await readFile(contextPath, 'utf8');
    const ctx = JSON.parse(content) as AgentContext;

    expect(ctx.id).toBe(taskDir);
    expect(ctx.type).toBe('feature');
    expect(ctx.slug).toBe('ctx-start');
    expect(ctx.status).toBe('PENDING_SPEC_APPROVAL');
    expect(ctx.worktreePath).toBeNull();
    expect(ctx.worktreeAbsolutePath).toBeNull();
    expect(ctx.branch).toBeNull();
    expect(ctx.baseBranch).toBeNull();
    expect(ctx.specApproved).toBe(false);
    expect(ctx.planApproved).toBe(false);
  });

  it('updates specApproved on spec approve', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await runCli(['init'], { cliRoot, cwd: tempWorkspace });

    await runCli(['start', 'feature', 'ctx-spec', '--no-git'], { cliRoot, cwd: tempWorkspace });
    const taskDir = await getTaskDir('ctx-spec');

    await runCli(['spec', 'approve', taskDir], { cliRoot, cwd: tempWorkspace });

    const contextPath = join(
      tempWorkspace,
      '.sduck',
      'sduck-workspace',
      taskDir,
      'agent-context.json',
    );
    const content = await readFile(contextPath, 'utf8');
    const ctx = JSON.parse(content) as AgentContext;

    expect(ctx.specApproved).toBe(true);
    expect(ctx.status).toBe('SPEC_APPROVED');
  });

  it('updates planApproved and status on plan approve', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await runCli(['init'], { cliRoot, cwd: tempWorkspace });

    await runCli(['start', 'feature', 'ctx-plan', '--no-git'], { cliRoot, cwd: tempWorkspace });
    const taskDir = await getTaskDir('ctx-plan');

    await runCli(['spec', 'approve', taskDir], { cliRoot, cwd: tempWorkspace });

    const taskRoot = join(tempWorkspace, '.sduck', 'sduck-workspace', taskDir);
    await writeFile(
      join(taskRoot, 'plan.md'),
      '# Plan\n\n## Step 1. First\n\n## Step 2. Second\n',
      'utf8',
    );
    await runCli(['plan', 'approve', taskDir], { cliRoot, cwd: tempWorkspace });

    const contextPath = join(taskRoot, 'agent-context.json');
    const content = await readFile(contextPath, 'utf8');
    const ctx = JSON.parse(content) as AgentContext;

    expect(ctx.planApproved).toBe(true);
    expect(ctx.status).toBe('IN_PROGRESS');
    expect(ctx.steps.total).toBe(2);
    expect(ctx.steps.completed).toEqual([]);
  });

  it('updates steps.completed on step done', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await runCli(['init'], { cliRoot, cwd: tempWorkspace });

    await runCli(['start', 'feature', 'ctx-step', '--no-git'], { cliRoot, cwd: tempWorkspace });
    const taskDir = await getTaskDir('ctx-step');

    await runCli(['spec', 'approve', taskDir], { cliRoot, cwd: tempWorkspace });

    const taskRoot = join(tempWorkspace, '.sduck', 'sduck-workspace', taskDir);
    await writeFile(
      join(taskRoot, 'plan.md'),
      '# Plan\n\n## Step 1. First\n\n## Step 2. Second\n',
      'utf8',
    );
    await runCli(['plan', 'approve', taskDir], { cliRoot, cwd: tempWorkspace });
    await runCli(['step', 'done', '1'], { cliRoot, cwd: tempWorkspace });

    const contextPath = join(taskRoot, 'agent-context.json');
    const content = await readFile(contextPath, 'utf8');
    const ctx = JSON.parse(content) as AgentContext;

    expect(ctx.steps.completed).toEqual([1]);
  });

  it('has null worktreePath for --no-git work', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await runCli(['init'], { cliRoot, cwd: tempWorkspace });

    await runCli(['start', 'feature', 'ctx-nogit', '--no-git'], { cliRoot, cwd: tempWorkspace });
    const taskDir = await getTaskDir('ctx-nogit');

    const contextPath = join(
      tempWorkspace,
      '.sduck',
      'sduck-workspace',
      taskDir,
      'agent-context.json',
    );
    const content = await readFile(contextPath, 'utf8');
    const ctx = JSON.parse(content) as AgentContext;

    expect(ctx.worktreePath).toBeNull();
    expect(ctx.worktreeAbsolutePath).toBeNull();
    expect(ctx.branch).toBeNull();
    expect(ctx.baseBranch).toBeNull();
  });
});
