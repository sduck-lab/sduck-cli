import { writeAgentContext } from './agent-context.js';

export type TaskLifecycleEvent =
  | 'abandon'
  | 'approve-plan'
  | 'approve-spec'
  | 'mark-done'
  | 'mark-review-ready'
  | 'record-step'
  | 'reopen';

export const INITIAL_TASK_STATUS = 'PENDING_SPEC_APPROVAL';

const EVENT_ALLOWED_STATUSES: Record<TaskLifecycleEvent, readonly string[]> = {
  abandon: [
    'PENDING_SPEC_APPROVAL',
    'PENDING_PLAN_APPROVAL',
    'SPEC_APPROVED',
    'IN_PROGRESS',
    'REVIEW_READY',
  ],
  'approve-plan': ['SPEC_APPROVED'],
  'approve-spec': ['PENDING_SPEC_APPROVAL'],
  'mark-done': ['REVIEW_READY'],
  'mark-review-ready': ['IN_PROGRESS'],
  'record-step': ['IN_PROGRESS'],
  reopen: ['DONE', 'REVIEW_READY'],
};

export function getAllowedStatuses(event: TaskLifecycleEvent): readonly string[] {
  return EVENT_ALLOWED_STATUSES[event];
}

export function transitionStatus(currentStatus: string, event: TaskLifecycleEvent): string {
  assertTransition(currentStatus, event);

  switch (event) {
    case 'abandon':
      return 'ABANDONED';
    case 'approve-plan':
      return 'IN_PROGRESS';
    case 'approve-spec':
      return 'SPEC_APPROVED';
    case 'mark-done':
      return 'DONE';
    case 'mark-review-ready':
      return 'REVIEW_READY';
    case 'record-step':
      return 'IN_PROGRESS';
    case 'reopen':
      return currentStatus === 'REVIEW_READY' ? 'IN_PROGRESS' : 'PENDING_SPEC_APPROVAL';
  }
}

export function assertTransition(
  currentStatus: string,
  event: TaskLifecycleEvent,
  taskId = 'task',
): void {
  const allowed = getAllowedStatuses(event);
  if (allowed.includes(currentStatus)) return;

  throw new Error(
    `Cannot ${event} ${taskId}: status is ${currentStatus}. Expected: ${allowed.join(', ')}.`,
  );
}

export async function refreshAgentContextBestEffort(
  projectRoot: string,
  workId: string,
): Promise<void> {
  try {
    await writeAgentContext(projectRoot, workId);
  } catch {
    // non-fatal lifecycle side effect
  }
}
