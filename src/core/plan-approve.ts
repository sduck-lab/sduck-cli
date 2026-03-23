import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { getFsEntryKind } from './fs.js';
import { listWorkspaceTasks, type WorkspaceTaskSummary } from './workspace.js';
import { formatUtcTimestamp } from '../utils/utc-date.js';

export interface PlanApproveCommandInput {
  target?: string;
}

export interface PlanApproveTarget {
  createdAt?: string;
  id: string;
  path: string;
  slug?: string;
  status: string;
}

export interface PlanApproveSuccessRow {
  note: string;
  steps: number;
  taskId: string;
}

export interface PlanApproveFailureRow {
  note: string;
  taskId: string;
}

export interface PlanApproveResult {
  approvedAt: string;
  failed: PlanApproveFailureRow[];
  nextStatus: 'IN_PROGRESS';
  succeeded: PlanApproveSuccessRow[];
}

export function filterPlanApprovalCandidates(
  tasks: readonly WorkspaceTaskSummary[],
): PlanApproveTarget[] {
  return tasks.filter((task) => task.status === 'SPEC_APPROVED');
}

export function resolvePlanApprovalCandidates(
  tasks: readonly WorkspaceTaskSummary[],
  target: string | undefined,
): PlanApproveTarget[] {
  const candidates = filterPlanApprovalCandidates(tasks);

  if (target === undefined || target.trim() === '') {
    return candidates;
  }

  const trimmedTarget = target.trim();

  return candidates.filter((task) => task.id === trimmedTarget || task.slug === trimmedTarget);
}

export function countPlanSteps(planContent: string): number {
  const matches = planContent.match(/^#{2,3} Step \d+\. .+$/gm);
  return matches?.length ?? 0;
}

export function validatePlanHasSteps(planContent: string): void {
  if (countPlanSteps(planContent) === 0) {
    throw new Error(
      'Plan does not contain any valid `## Step N. 제목` or `### Step N. 제목` headers.',
    );
  }
}

function updatePlanApprovalBlock(
  metaContent: string,
  approvedAt: string,
  totalSteps: number,
): string {
  const withStatus = metaContent.replace(/^status:\s+.+$/m, 'status: IN_PROGRESS');
  const withPlan = withStatus.replace(
    /plan:\n {2}approved:\s+false\n {2}approved_at:\s+null/m,
    `plan:\n  approved: true\n  approved_at: ${approvedAt}`,
  );

  return withPlan.replace(
    /steps:\n {2}total:\s+null\n {2}completed:\s+\[\]/m,
    `steps:\n  total: ${String(totalSteps)}\n  completed: []`,
  );
}

export async function approvePlans(
  projectRoot: string,
  tasks: readonly PlanApproveTarget[],
  approvedAt: string,
): Promise<PlanApproveResult> {
  const succeeded: PlanApproveSuccessRow[] = [];
  const failed: PlanApproveFailureRow[] = [];

  for (const task of tasks) {
    if (task.status !== 'SPEC_APPROVED') {
      failed.push({
        note: `task is not awaiting plan approval (${task.status})`,
        taskId: task.id,
      });
      continue;
    }

    const metaPath = join(projectRoot, task.path, 'meta.yml');
    const planPath = join(projectRoot, task.path, 'plan.md');

    if ((await getFsEntryKind(metaPath)) !== 'file') {
      failed.push({ note: 'missing meta.yml', taskId: task.id });
      continue;
    }

    if ((await getFsEntryKind(planPath)) !== 'file') {
      failed.push({ note: 'missing plan.md', taskId: task.id });
      continue;
    }

    const planContent = await readFile(planPath, 'utf8');
    const totalSteps = countPlanSteps(planContent);

    if (totalSteps === 0) {
      failed.push({ note: 'missing valid Step headers', taskId: task.id });
      continue;
    }

    const updatedMeta = updatePlanApprovalBlock(
      await readFile(metaPath, 'utf8'),
      approvedAt,
      totalSteps,
    );
    await writeFile(metaPath, updatedMeta, 'utf8');

    succeeded.push({ note: 'moved to IN_PROGRESS', steps: totalSteps, taskId: task.id });
  }

  return {
    approvedAt,
    failed,
    nextStatus: 'IN_PROGRESS',
    succeeded,
  };
}

export async function loadPlanApprovalCandidates(
  projectRoot: string,
  input: PlanApproveCommandInput,
): Promise<PlanApproveTarget[]> {
  const tasks = await listWorkspaceTasks(projectRoot);
  return resolvePlanApprovalCandidates(tasks, input.target);
}

export function createPlanApprovedAt(date = new Date()): string {
  return formatUtcTimestamp(date);
}
