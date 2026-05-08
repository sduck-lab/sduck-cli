import { join } from 'node:path';

import { getFsEntryKind } from './fs.js';
import {
  addWorktree,
  deleteBranch,
  getCurrentBranch,
  isBranchMerged,
  removeWorktree,
} from './git.js';
import { getProjectWorktreePath, SDUCK_WORKTREES_DIR } from './project-paths.js';

export interface GitResourceDescriptor {
  baseBranch: string | null;
  branch: string | null;
  worktreePath: string | null;
}

export interface GitResourceCleanInput extends GitResourceDescriptor {
  id: string;
}

export interface GitResourceCleanResult {
  branchDeleted: boolean;
  note: string;
  workId: string;
  worktreeRemoved: boolean;
}

export interface GitResourceView {
  worktreeAbsolutePath: string | null;
  worktreePath: string | null;
}

export interface GitResourceAdapter {
  addWorktree(
    worktreePath: string,
    branchName: string,
    baseBranch: string,
    cwd: string,
  ): Promise<void>;
  deleteBranch(branchName: string, force: boolean, cwd: string): Promise<void>;
  getCurrentBranch(cwd: string): Promise<string>;
  isBranchMerged(branchName: string, baseBranch: string, cwd: string): Promise<boolean>;
  removeWorktree(worktreePath: string, cwd: string): Promise<void>;
}

const defaultAdapter: GitResourceAdapter = {
  addWorktree,
  deleteBranch,
  getCurrentBranch,
  isBranchMerged,
  removeWorktree,
};

export interface AllocateGitResourceOptions {
  noGit?: boolean;
}

export async function allocateGitResource(
  projectRoot: string,
  taskId: string,
  type: string,
  slug: string,
  options: AllocateGitResourceOptions | undefined,
  adapter: GitResourceAdapter = defaultAdapter,
): Promise<GitResourceDescriptor> {
  if (options?.noGit === true) {
    return { baseBranch: null, branch: null, worktreePath: null };
  }

  const baseBranch = await adapter.getCurrentBranch(projectRoot);
  const branch = `work/${type}/${slug}`;
  const absoluteWorktreePath = getProjectWorktreePath(projectRoot, taskId);
  const worktreePath = `${SDUCK_WORKTREES_DIR}/${taskId}`;

  await adapter.addWorktree(absoluteWorktreePath, branch, baseBranch, projectRoot);

  return { baseBranch, branch, worktreePath };
}

export async function cleanGitResource(
  projectRoot: string,
  descriptor: GitResourceCleanInput,
  options: { force: boolean },
  adapter: GitResourceAdapter = defaultAdapter,
): Promise<GitResourceCleanResult> {
  if (descriptor.branch === null || descriptor.baseBranch === null) {
    return {
      branchDeleted: false,
      note: 'no git resources to clean (--no-git work)',
      workId: descriptor.id,
      worktreeRemoved: false,
    };
  }

  const merged = await adapter.isBranchMerged(
    descriptor.branch,
    descriptor.baseBranch,
    projectRoot,
  );
  let worktreeRemoved = false;

  if (descriptor.worktreePath !== null) {
    const absoluteWorktreePath = join(projectRoot, descriptor.worktreePath);

    if ((await getFsEntryKind(absoluteWorktreePath)) === 'missing') {
      // eslint-disable-next-line no-console
      console.warn(
        `Warning: worktree path ${descriptor.worktreePath} does not exist for work ${descriptor.id}.`,
      );
    } else {
      await adapter.removeWorktree(absoluteWorktreePath, projectRoot);
      worktreeRemoved = true;
    }
  }

  let branchDeleted = false;

  if (merged) {
    await adapter.deleteBranch(descriptor.branch, false, projectRoot);
    branchDeleted = true;
  } else if (options.force) {
    await adapter.deleteBranch(descriptor.branch, true, projectRoot);
    branchDeleted = true;
  } else {
    // eslint-disable-next-line no-console
    console.warn(
      `Warning: branch ${descriptor.branch} is not merged into ${descriptor.baseBranch}. Use --force to delete.`,
    );
  }

  return {
    branchDeleted,
    note: merged
      ? 'cleaned (merged)'
      : options.force
        ? 'cleaned (forced)'
        : 'worktree removed, branch kept',
    workId: descriptor.id,
    worktreeRemoved,
  };
}

export function describeGitResource(
  projectRoot: string,
  descriptor: Pick<GitResourceDescriptor, 'worktreePath'>,
): GitResourceView {
  return {
    worktreeAbsolutePath:
      descriptor.worktreePath !== null ? join(projectRoot, descriptor.worktreePath) : null,
    worktreePath: descriptor.worktreePath,
  };
}
