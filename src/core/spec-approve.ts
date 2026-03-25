import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { writeAgentContext } from './agent-context.js';
import { getFsEntryKind } from './fs.js';
import { readCurrentWorkId } from './state.js';
import { listWorkspaceTasks, type WorkspaceTaskSummary } from './workspace.js';
import { formatUtcTimestamp } from '../utils/utc-date.js';

export interface SpecApproveCommandInput {
  target?: string;
}

export interface SpecApproveTarget {
  createdAt?: string;
  id: string;
  path: string;
  slug?: string;
  status: string;
}

export interface SpecApproveResult {
  approvedAt: string;
  approvedTaskIds: string[];
  nextStatus: 'SPEC_APPROVED';
}

export function filterApprovalCandidates(
  tasks: readonly WorkspaceTaskSummary[],
): SpecApproveTarget[] {
  return tasks.filter((task) => task.status === 'PENDING_SPEC_APPROVAL');
}

export function resolveTargetCandidates(
  tasks: readonly WorkspaceTaskSummary[],
  target: string | undefined,
): SpecApproveTarget[] {
  const candidates = filterApprovalCandidates(tasks);

  if (target === undefined || target.trim() === '') {
    return candidates;
  }

  const trimmedTarget = target.trim();

  return candidates.filter((task) => task.id === trimmedTarget || task.slug === trimmedTarget);
}

export function validateSpecApprovalTargets(tasks: readonly SpecApproveTarget[]): void {
  if (tasks.length === 0) {
    throw new Error('No approvable spec tasks found.');
  }

  const invalidTask = tasks.find((task) => task.status !== 'PENDING_SPEC_APPROVAL');

  if (invalidTask !== undefined) {
    throw new Error(
      `Task ${invalidTask.id} is not awaiting spec approval (${invalidTask.status}).`,
    );
  }
}

function updateSpecApprovalBlock(metaContent: string, approvedAt: string): string {
  const withStatus = metaContent.replace(/^status:\s+.+$/m, 'status: SPEC_APPROVED');

  return withStatus.replace(
    /spec:\n {2}approved:\s+false\n {2}approved_at:\s+null/m,
    `spec:\n  approved: true\n  approved_at: ${approvedAt}`,
  );
}

export async function approveSpecs(
  projectRoot: string,
  tasks: readonly SpecApproveTarget[],
  approvedAt: string,
): Promise<SpecApproveResult> {
  validateSpecApprovalTargets(tasks);

  for (const task of tasks) {
    const metaPath = join(projectRoot, task.path, 'meta.yml');

    if ((await getFsEntryKind(metaPath)) !== 'file') {
      throw new Error(`Missing meta.yml for task ${task.id}.`);
    }

    const updatedContent = updateSpecApprovalBlock(await readFile(metaPath, 'utf8'), approvedAt);
    await writeFile(metaPath, updatedContent, 'utf8');

    try {
      await writeAgentContext(projectRoot, task.id);
    } catch {
      // non-fatal
    }
  }

  return {
    approvedAt,
    approvedTaskIds: tasks.map((task) => task.id),
    nextStatus: 'SPEC_APPROVED',
  };
}

export async function loadSpecApprovalCandidates(
  projectRoot: string,
  input: SpecApproveCommandInput,
): Promise<SpecApproveTarget[]> {
  const tasks = await listWorkspaceTasks(projectRoot);

  if (input.target !== undefined) {
    return resolveTargetCandidates(tasks, input.target);
  }

  // current work fallback
  const currentWorkId = await readCurrentWorkId(projectRoot);

  if (currentWorkId !== null) {
    return resolveTargetCandidates(tasks, currentWorkId);
  }

  // No current work: return all candidates (original behavior)
  return resolveTargetCandidates(tasks, undefined);
}

export function createSpecApprovedAt(date = new Date()): string {
  return formatUtcTimestamp(date);
}
