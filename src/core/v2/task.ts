import { ensureReadableCache } from './cache.js';
import { createTaskId, nowIso } from './ids.js';
import { rebuildDecisionCache } from './rebuild.js';
import { appendSourceEvent, loadSourceBundleForWrite, writeSourceBundle } from './source-store.js';
import { getCurrentTaskId, setCurrentTaskId } from './state.js';
import { decodeJson, encodeJson } from './store.js';

import type { Task, TaskStatus } from '../../types/index.js';
import type { DatabaseSync } from 'node:sqlite';

interface TaskRow {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  expected_scope_json: string;
  avoid_scope_json: string;
  created_at: string;
  updated_at: string;
}

export function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    expectedScope: decodeJson<string[]>(row.expected_scope_json, []),
    avoidScope: decodeJson<string[]>(row.avoid_scope_json, []),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getTaskById(db: DatabaseSync, taskId: string): Task | null {
  const row = db.prepare(`SELECT * FROM tasks WHERE id = ?`).get(taskId) as TaskRow | undefined;
  return row === undefined ? null : mapTask(row);
}

export function createTask(projectRoot: string, description: string): Task {
  const bundle = loadSourceBundleForWrite(projectRoot);
  let id = createTaskId(description);
  let suffix = 2;
  while (bundle.tasks.some((task) => task.id === id)) {
    id = `${createTaskId(description)}-${String(suffix)}`;
    suffix += 1;
  }
  const createdAt = nowIso();
  const task: Task = {
    id,
    title: description,
    description,
    status: 'OPEN',
    expectedScope: [],
    avoidScope: [],
    createdAt,
    updatedAt: createdAt,
  };
  bundle.tasks.push(task);
  appendSourceEvent(bundle, { taskId: task.id, type: 'TASK_CREATED', payload: { description } });
  writeSourceBundle(projectRoot, bundle);
  setCurrentTaskId(projectRoot, task.id);
  rebuildDecisionCache(projectRoot);
  return task;
}

export function updateTaskStatus(db: DatabaseSync, taskId: string, status: TaskStatus): void {
  db.prepare(`UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?`).run(
    status,
    nowIso(),
    taskId,
  );
}

export function updateTaskScopes(
  db: DatabaseSync,
  taskId: string,
  expectedScope: string[],
  avoidScope: string[],
): void {
  db.prepare(
    `UPDATE tasks SET expected_scope_json = ?, avoid_scope_json = ?, updated_at = ? WHERE id = ?`,
  ).run(encodeJson(expectedScope), encodeJson(avoidScope), nowIso(), taskId);
}

export function setTerminalStatus(projectRoot: string, status: 'CLOSED' | 'ABANDONED'): Task {
  ensureReadableCache(projectRoot);
  const bundle = loadSourceBundleForWrite(projectRoot);
  const taskId = requireCurrentTaskId(projectRoot);
  const task = bundle.tasks.find((item) => item.id === taskId);
  if (task === undefined) {
    throw new Error(`Task not found: ${taskId}`);
  }
  const updated: Task = { ...task, status, updatedAt: nowIso() };
  bundle.tasks = bundle.tasks.map((item) => (item.id === taskId ? updated : item));
  appendSourceEvent(bundle, {
    taskId: task.id,
    type: status === 'CLOSED' ? 'TASK_CLOSED' : 'TASK_ABANDONED',
    payload: {},
  });
  writeSourceBundle(projectRoot, bundle);
  rebuildDecisionCache(projectRoot);
  return updated;
}

function requireCurrentTaskId(projectRoot: string): string {
  const taskId = getCurrentTaskId(projectRoot);
  if (taskId === null) {
    throw new Error('No current task. Run `sduck work "..."` first.');
  }
  return taskId;
}
