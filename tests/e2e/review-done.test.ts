import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { runCli } from '../helpers/run-cli.js';
import { prepareProjectWorkspace, removeProjectWorkspace } from '../helpers/temp-workspace.js';

describe('review ready → done flow', () => {
  const cliRoot = process.cwd();
  let tempWorkspace = '';
  const workspaceName = 'review-done-e2e';

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

  it('requires review ready before done (full state machine path)', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await runCli(['init'], { cliRoot, cwd: tempWorkspace });

    // Create task and move to IN_PROGRESS
    await runCli(['start', 'feature', 'flow-test', '--no-git'], { cliRoot, cwd: tempWorkspace });
    await runCli(['spec', 'approve', 'flow-test'], { cliRoot, cwd: tempWorkspace });

    const taskDir = await getTaskDir('flow-test');
    const taskRoot = join(tempWorkspace, '.sduck', 'sduck-workspace', taskDir);

    await writeFile(join(taskRoot, 'plan.md'), '# Plan\n\n## Step 1. Do stuff\n', 'utf8');
    await runCli(['plan', 'approve', 'flow-test'], { cliRoot, cwd: tempWorkspace });

    // Mark steps complete and spec checklist
    const metaPath = join(taskRoot, 'meta.yml');
    let meta = await readFile(metaPath, 'utf8');
    meta = meta.replace(/^ {2}completed:\s+\[.*\]$/m, '  completed: [1]');
    await writeFile(metaPath, meta, 'utf8');
    await writeFile(join(taskRoot, 'spec.md'), '# Spec\n\n- [x] AC1: done\n', 'utf8');

    // Attempt done before review ready — should fail
    const doneBeforeReview = await runCli(['done', 'flow-test'], { cliRoot, cwd: tempWorkspace });
    expect(doneBeforeReview.exitCode).toBe(1);
    expect(doneBeforeReview.stderr).toContain('not in REVIEW_READY state');

    // Mark review ready
    const reviewResult = await runCli(['review', 'ready', 'flow-test'], {
      cliRoot,
      cwd: tempWorkspace,
    });
    expect(reviewResult.exitCode).toBe(0);

    // Now done should succeed
    const doneResult = await runCli(['done', 'flow-test'], { cliRoot, cwd: tempWorkspace });
    expect(doneResult.exitCode).toBe(0);
    expect(doneResult.stdout).toContain('상태: DONE');

    const finalMeta = await readFile(metaPath, 'utf8');
    expect(finalMeta).toContain('status: DONE');
  });
});
