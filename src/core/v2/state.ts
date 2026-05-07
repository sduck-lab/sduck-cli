import * as fs from 'node:fs';

import { statePath } from './paths.js';

export interface DecisionState {
  currentTaskId: string | null;
  updatedAt: string;
}

export function readState(projectRoot: string): DecisionState {
  const filePath = statePath(projectRoot);
  if (!fs.existsSync(filePath)) {
    return { currentTaskId: null, updatedAt: new Date().toISOString() };
  }
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Partial<DecisionState>;
  return {
    currentTaskId: parsed.currentTaskId ?? null,
    updatedAt: parsed.updatedAt ?? new Date().toISOString(),
  };
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
