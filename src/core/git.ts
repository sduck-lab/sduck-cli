import { execFile } from 'node:child_process';

function execGit(args: readonly string[], cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile('git', [...args], { cwd }, (error, stdout, stderr) => {
      if (error !== null) {
        const command = args[0] ?? 'unknown';
        reject(new Error(`git ${command} failed: ${stderr.trim() || error.message}`));
        return;
      }

      resolve(stdout.trim());
    });
  });
}

export async function getCurrentBranch(cwd: string): Promise<string> {
  const branch = await execGit(['rev-parse', '--abbrev-ref', 'HEAD'], cwd);

  if (branch === 'HEAD') {
    throw new Error(
      'Detached HEAD state. Cannot determine base branch. Use --no-git to skip worktree creation.',
    );
  }

  return branch;
}

export async function addWorktree(
  worktreePath: string,
  branch: string,
  baseBranch: string,
  cwd: string,
): Promise<void> {
  await execGit(['worktree', 'add', worktreePath, '-b', branch, baseBranch], cwd);
}

export async function removeWorktree(worktreePath: string, cwd: string): Promise<void> {
  await execGit(['worktree', 'remove', worktreePath], cwd);
}

export async function isBranchMerged(
  branch: string,
  baseBranch: string,
  cwd: string,
): Promise<boolean> {
  const output = await execGit(['branch', '--merged', baseBranch], cwd);
  const branches = output.split('\n').map((line) => line.replace(/^\*?\s*/, '').trim());

  return branches.includes(branch);
}

export async function deleteBranch(branch: string, force: boolean, cwd: string): Promise<void> {
  const flag = force ? '-D' : '-d';

  await execGit(['branch', flag, branch], cwd);
}
