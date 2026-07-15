import * as fs from 'node:fs';

import { V2ExpectedError } from './errors.js';
import { statePath } from './paths.js';

import type { SourceBundle } from './source-types.js';

export interface DecisionState {
  currentTaskId: string | null;
  updatedAt: string;
}

export function readState(projectRoot: string): DecisionState {
  const filePath = statePath(projectRoot);
  if (!fs.existsSync(filePath)) {
    return { currentTaskId: null, updatedAt: new Date().toISOString() };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, 'utf8')) as unknown;
  } catch (error) {
    throw new V2ExpectedError('STATE_JSON_INVALID', {
      detail: error instanceof Error ? error.message : String(error),
    });
  }
  validateDecisionState(parsed);
  return parsed;
}

export function validateDecisionState(
  state: unknown,
  bundle?: SourceBundle,
): asserts state is DecisionState {
  if (typeof state !== 'object' || state === null || Array.isArray(state)) {
    throw new V2ExpectedError('STATE_INVALID', { problemCode: 'json-object' });
  }
  const candidate = state as Record<string, unknown>;
  if (
    candidate['currentTaskId'] !== null &&
    (typeof candidate['currentTaskId'] !== 'string' ||
      candidate['currentTaskId'].trim() === '' ||
      candidate['currentTaskId'].includes('/') ||
      candidate['currentTaskId'].includes('\\'))
  ) {
    throw new V2ExpectedError('STATE_INVALID', { field: 'currentTaskId', problemCode: 'task-id' });
  }
  if (typeof candidate['updatedAt'] !== 'string' || candidate['updatedAt'].trim() === '') {
    throw new V2ExpectedError('STATE_INVALID', {
      field: 'updatedAt',
      problemCode: 'non-empty-string',
    });
  }
  if (bundle !== undefined && candidate['currentTaskId'] !== null) {
    const task = bundle.tasks.find((item) => item.id === candidate['currentTaskId']);
    if (task === undefined)
      throw new V2ExpectedError('STATE_INVALID', {
        problemCode: 'missing-task',
        taskId: candidate['currentTaskId'],
      });
    if (task.status === 'CLOSED' || task.status === 'ABANDONED') {
      throw new V2ExpectedError('STATE_INVALID', {
        problemCode: 'terminal-task',
        taskId: task.id,
      });
    }
  }
}

export function writeState(projectRoot: string, state: DecisionState): void {
  fs.writeFileSync(statePath(projectRoot), `${JSON.stringify(state, null, 2)}\n`);
}

export function getCurrentTaskId(projectRoot: string): string | null {
  return readState(projectRoot).currentTaskId;
}

export function setCurrentTaskId(projectRoot: string, taskId: string | null): void {
  writeState(projectRoot, { currentTaskId: taskId, updatedAt: new Date().toISOString() });
}
