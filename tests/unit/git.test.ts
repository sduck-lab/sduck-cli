import { execFile } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { isBranchMerged } from '../../src/core/git.js';

function git(args: readonly string[], cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile('git', [...args], { cwd }, (error, stdout, stderr) => {
      if (error !== null) {
        reject(new Error(`git ${args.join(' ')} failed: ${stderr}`));
        return;
      }

      resolve(stdout.trim());
    });
  });
}

async function commitFile(repoDir: string, fileName: string, content: string): Promise<void> {
  await writeFile(join(repoDir, fileName), content, 'utf8');
  await git(['add', '.'], repoDir);
  await git(['commit', '-m', `add ${fileName}`], repoDir);
}

describe('isBranchMerged', () => {
  let baseDir: string;
  let repoDir: string;

  beforeEach(async () => {
    baseDir = await mkdtemp(join(tmpdir(), 'sduck-git-test-'));
    repoDir = join(baseDir, 'repo');
    await git(['init', '-b', 'main', 'repo'], baseDir);
    await git(['config', 'user.email', 'test@example.com'], repoDir);
    await git(['config', 'user.name', 'Test'], repoDir);
    await commitFile(repoDir, 'base.txt', 'base');
  });

  afterEach(async () => {
    await rm(baseDir, { force: true, recursive: true });
  });

  it('detects a fast-forward merged branch even while checked out in a worktree', async () => {
    const worktreeDir = join(baseDir, 'wt');
    await git(['worktree', 'add', worktreeDir, '-b', 'work/fix/sample', 'main'], repoDir);
    await commitFile(worktreeDir, 'change.txt', 'change');
    await git(['merge', '--ff-only', 'work/fix/sample'], repoDir);

    // Branch is still checked out in the worktree ('+' prefix in `git branch --merged`).
    await expect(isBranchMerged('work/fix/sample', 'main', repoDir)).resolves.toBe(true);
  });

  it('returns false for an unmerged branch', async () => {
    const worktreeDir = join(baseDir, 'wt-unmerged');
    await git(['worktree', 'add', worktreeDir, '-b', 'work/fix/unmerged', 'main'], repoDir);
    await commitFile(worktreeDir, 'other.txt', 'other');

    await expect(isBranchMerged('work/fix/unmerged', 'main', repoDir)).resolves.toBe(false);
  });

  it('returns true for a merged branch that is not checked out anywhere', async () => {
    await git(['branch', 'work/fix/plain', 'main'], repoDir);

    await expect(isBranchMerged('work/fix/plain', 'main', repoDir)).resolves.toBe(true);
  });

  it('rejects for a branch that does not exist', async () => {
    await expect(isBranchMerged('work/fix/missing', 'main', repoDir)).rejects.toThrow();
  });
});
