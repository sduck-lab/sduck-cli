import { cleanGitResource } from './git-resource.js';
import { resolveTaskTarget, resolveTaskTargets } from './task-target.js';

import type { WorkspaceTaskSummary } from './workspace.js';

export interface CleanCandidate {
  baseBranch: string | null;
  branch: string | null;
  id: string;
  path: string;
  worktreePath: string | null;
}

export interface CleanSuccessRow {
  branchDeleted: boolean;
  note: string;
  workId: string;
  worktreeRemoved: boolean;
}

export interface CleanResult {
  cleaned: CleanSuccessRow[];
}

const CLEANABLE_STATUSES = new Set(['DONE', 'ABANDONED']);

export async function resolveCleanCandidates(
  projectRoot: string,
  target?: string,
): Promise<CleanCandidate[]> {
  if (target !== undefined && target.trim() !== '') {
    const match = await resolveTaskTarget(projectRoot, {
      allowedStatuses: [...CLEANABLE_STATUSES],
      commandName: 'clean',
      fallback: 'none',
      includeArchive: true,
      target,
    });

    return [toCleanCandidate(match)];
  }

  // No target: workspace DONE/ABANDONED only
  const tasks = await resolveTaskTargets(projectRoot, {
    allowedStatuses: [...CLEANABLE_STATUSES],
    cardinality: 'many',
    commandName: 'clean',
    fallback: 'all',
  });

  return tasks.map(toCleanCandidate);
}

function toCleanCandidate(task: WorkspaceTaskSummary): CleanCandidate {
  return {
    baseBranch: task.baseBranch ?? null,
    branch: task.branch ?? null,
    id: task.id,
    path: task.path,
    worktreePath: task.worktreePath ?? null,
  };
}

export async function runCleanWorkflow(
  projectRoot: string,
  target?: string,
  force = false,
): Promise<CleanResult> {
  const candidates = await resolveCleanCandidates(projectRoot, target);
  const cleaned: CleanSuccessRow[] = [];

  for (const candidate of candidates) {
    cleaned.push(await cleanGitResource(projectRoot, candidate, { force }));
  }

  return { cleaned };
}
