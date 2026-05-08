import { join } from 'node:path';

import { getFsEntryKind } from './fs.js';
import { assertTransition, refreshAgentContextBestEffort } from './task-lifecycle.js';
import { approveSpecInMeta, patchTaskMeta } from './task-meta.js';
import { resolveTaskTargets } from './task-target.js';
import { formatUtcTimestamp } from '../utils/utc-date.js';

import type { WorkspaceTaskSummary } from './workspace.js';

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

export function validateSpecApprovalTargets(tasks: readonly SpecApproveTarget[]): void {
  if (tasks.length === 0) {
    throw new Error('No approvable spec tasks found.');
  }

  for (const task of tasks) assertTransition(task.status, 'approve-spec', task.id);
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

    await patchTaskMeta(metaPath, (meta) => approveSpecInMeta(meta, approvedAt));

    await refreshAgentContextBestEffort(projectRoot, task.id);
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
  return await resolveTaskTargets(projectRoot, {
    allowedStatuses: ['PENDING_SPEC_APPROVAL'],
    cardinality: 'many',
    commandName: 'spec approve',
    fallback: 'current-or-all',
    target: input.target,
  });
}

export function createSpecApprovedAt(date = new Date()): string {
  return formatUtcTimestamp(date);
}
