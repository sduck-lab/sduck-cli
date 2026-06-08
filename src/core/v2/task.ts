import { appendEvent } from './events.js';
import { createTaskId, nowIso } from './ids.js';
import { getCurrentTaskId, setCurrentTaskId } from './state.js';
import { decodeJson, encodeJson, openDatabase } from './store.js';

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
  const db = openDatabase(projectRoot);
  try {
    let id = createTaskId(description);
    let suffix = 2;
    while (getTaskById(db, id) !== null) {
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
    db.prepare(
      `INSERT INTO tasks (id, title, description, status, expected_scope_json, avoid_scope_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      task.id,
      task.title,
      task.description,
      task.status,
      encodeJson(task.expectedScope),
      encodeJson(task.avoidScope),
      task.createdAt,
      task.updatedAt,
    );
    appendEvent(db, { taskId: task.id, type: 'TASK_CREATED', payload: { description } });
    setCurrentTaskId(projectRoot, task.id);
    return task;
  } finally {
    db.close();
  }
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

export function isTerminalTaskStatus(status: TaskStatus): boolean {
  return status === 'CLOSED' || status === 'ABANDONED';
}

export function requireCurrentTaskId(projectRoot: string): string {
  const taskId = getCurrentTaskId(projectRoot);
  if (taskId === null) {
    throw new Error('No current task. Run `sduck work "..."` first.');
  }
  return taskId;
}

export function requireCurrentTask(projectRoot: string, db: DatabaseSync): Task {
  const taskId = requireCurrentTaskId(projectRoot);
  const task = getTaskById(db, taskId);
  if (task === null) {
    throw new Error(`Task not found: ${taskId}`);
  }
  return task;
}

export function requireMutableCurrentTask(projectRoot: string, db: DatabaseSync): Task {
  const task = requireCurrentTask(projectRoot, db);
  if (isTerminalTaskStatus(task.status)) {
    throw new Error(`Cannot mutate a ${task.status} task: ${task.id}`);
  }
  return task;
}

export function setTerminalStatus(projectRoot: string, status: 'CLOSED' | 'ABANDONED'): Task {
  const db = openDatabase(projectRoot);
  try {
    const task = requireMutableCurrentTask(projectRoot, db);
    updateTaskStatus(db, task.id, status);
    appendEvent(db, {
      taskId: task.id,
      type: status === 'CLOSED' ? 'TASK_CLOSED' : 'TASK_ABANDONED',
      payload: {},
    });
    const updated = getTaskById(db, task.id);
    if (updated === null) {
      throw new Error(`Task not found after update: ${task.id}`);
    }
    setCurrentTaskId(projectRoot, null);
    return updated;
  } finally {
    db.close();
  }
}
