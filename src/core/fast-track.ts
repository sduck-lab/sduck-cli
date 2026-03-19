import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { isSupportedTaskType, type SupportedTaskType } from './assets.js';
import { getFsEntryKind } from './fs.js';
import {
  approvePlans,
  createPlanApprovedAt,
  type PlanApproveFailureRow,
  type PlanApproveSuccessRow,
  type PlanApproveTarget,
} from './plan-approve.js';
import { approveSpecs, createSpecApprovedAt, type SpecApproveTarget } from './spec-approve.js';
import { startTask } from './start.js';

export interface FastTrackCommandInput {
  slug: string;
  type: string;
}

export interface FastTrackTarget {
  id: string;
  path: string;
  slug: string;
  status: 'PENDING_SPEC_APPROVAL';
}

export interface FastTrackSuccessRow {
  note: string;
  taskId: string;
}

export interface FastTrackFailureRow {
  note: string;
  taskId: string;
}

export interface FastTrackResult {
  failed: FastTrackFailureRow[];
  nextStatus: 'IN_PROGRESS' | 'PENDING_SPEC_APPROVAL';
  path: string;
  planCreated: boolean;
  specCreated: boolean;
  succeeded: FastTrackSuccessRow[];
  taskId: string;
}

export interface FastTrackApprovalResult {
  approved: boolean;
  failed: FastTrackFailureRow[];
  nextStatus: 'IN_PROGRESS' | 'PENDING_SPEC_APPROVAL' | 'SPEC_APPROVED';
  succeeded: FastTrackSuccessRow[];
  taskId: string;
}

function toSpecApprovalTarget(target: FastTrackTarget): SpecApproveTarget {
  return target;
}

function toPlanApprovalTarget(target: FastTrackTarget): PlanApproveTarget {
  return {
    ...target,
    status: 'SPEC_APPROVED',
  };
}

export function renderMinimalSpec(type: SupportedTaskType, slug: string): string {
  const displayName = slug.replace(/-/g, ' ');

  return [
    `# [${type}] ${displayName}`,
    '',
    '## 목표',
    '',
    `- ${displayName} 작업을 빠르게 시작할 수 있는 최소 스펙을 정의한다`,
    '',
    '## 범위',
    '',
    `- ${displayName} 구현에 필요한 핵심 변경만 포함한다`,
    '',
    '## 제외 범위',
    '',
    '- 요구사항과 직접 관련 없는 리팩터링은 포함하지 않는다',
    '',
    '## 완료 조건',
    '',
    '- [ ] 핵심 동작이 구현된다',
    '- [ ] 관련 테스트가 통과한다',
    '- [ ] 문서 또는 워크플로우 영향이 반영된다',
    '',
  ].join('\n');
}

export function renderMinimalPlan(slug: string): string {
  const displayName = slug.replace(/-/g, ' ');

  return [
    '# Plan',
    '',
    `## Step 1. ${displayName} 요구사항 반영`,
    '',
    '- 핵심 구현 파일을 수정해 요구사항을 반영한다.',
    '',
    '## Step 2. 검증과 마무리',
    '',
    '- 관련 테스트와 문서를 업데이트한다.',
    '- `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`로 검증한다.',
    '',
  ].join('\n');
}

export function isInteractiveApprovalAvailable(): boolean {
  return process.stdin.isTTY && process.stdout.isTTY;
}

export async function createFastTrackTask(
  input: FastTrackCommandInput,
  projectRoot: string,
): Promise<FastTrackResult> {
  if (!isSupportedTaskType(input.type)) {
    throw new Error(`Unsupported type: ${input.type}`);
  }

  const startedTask = await startTask(input.type, input.slug, projectRoot);
  const taskPath = join(projectRoot, startedTask.workspacePath);
  const specPath = join(taskPath, 'spec.md');
  const planPath = join(taskPath, 'plan.md');

  if ((await getFsEntryKind(specPath)) !== 'file') {
    throw new Error(`Missing spec.md for fast-track task ${startedTask.workspaceId}.`);
  }

  if ((await getFsEntryKind(planPath)) !== 'file') {
    throw new Error(`Missing plan.md for fast-track task ${startedTask.workspaceId}.`);
  }

  await writeFile(specPath, renderMinimalSpec(input.type, input.slug), 'utf8');
  await writeFile(planPath, renderMinimalPlan(input.slug), 'utf8');

  return {
    failed: [],
    nextStatus: 'PENDING_SPEC_APPROVAL',
    path: startedTask.workspacePath,
    planCreated: true,
    specCreated: true,
    succeeded: [{ note: 'created minimal spec and plan', taskId: startedTask.workspaceId }],
    taskId: startedTask.workspaceId,
  };
}

function buildFailureRows(
  taskId: string,
  failedRows: readonly PlanApproveFailureRow[],
  fallbackNote: string,
): FastTrackFailureRow[] {
  if (failedRows.length === 0) {
    if (fallbackNote === '') {
      return [];
    }

    return [{ note: fallbackNote, taskId }];
  }

  return failedRows.map((row) => ({ note: row.note, taskId: row.taskId }));
}

function buildSuccessRows(succeededRows: readonly PlanApproveSuccessRow[]): FastTrackSuccessRow[] {
  return succeededRows.map((row) => ({
    note: `${row.note} (${String(row.steps)} steps)`,
    taskId: row.taskId,
  }));
}

export async function approveFastTrackTask(
  target: FastTrackTarget,
  projectRoot: string,
): Promise<FastTrackApprovalResult> {
  await approveSpecs(projectRoot, [toSpecApprovalTarget(target)], createSpecApprovedAt());

  const planResult = await approvePlans(
    projectRoot,
    [toPlanApprovalTarget(target)],
    createPlanApprovedAt(),
  );

  if (planResult.succeeded.length === 0) {
    return {
      approved: false,
      failed: buildFailureRows(target.id, planResult.failed, 'plan approval failed'),
      nextStatus: 'SPEC_APPROVED',
      succeeded: [{ note: 'approved minimal spec', taskId: target.id }],
      taskId: target.id,
    };
  }

  return {
    approved: true,
    failed: buildFailureRows(target.id, planResult.failed, ''),
    nextStatus: 'IN_PROGRESS',
    succeeded: [
      { note: 'approved minimal spec', taskId: target.id },
      ...buildSuccessRows(planResult.succeeded),
    ],
    taskId: target.id,
  };
}
