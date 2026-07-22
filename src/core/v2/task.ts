import { DecisionWorkspace } from './decision-workspace.js';
import { noCurrentTask, taskNotFound } from './errors.js';
import { createTaskId, nowIso } from './ids.js';
import { assertWorkflowEnabledForTaskCreation, resolveTaskCreationPolicy } from './policy.js';
import { appendSourceEvent } from './source-store.js';
import { decodeJson, encodeJson } from './store.js';
import { TaskLifecycle } from './task-lifecycle.js';

import type { RecordDepth, Task, TaskStatus } from '../../types/index.js';
import type { DatabaseSync } from 'node:sqlite';

interface TaskRow {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  expected_scope_json: string;
  avoid_scope_json: string;
  implementation_plan_json?: string | null;
  verification_plan_json?: string | null;
  guided?: number | null;
  retrospective?: number | null;
  record_depth?: RecordDepth | null;
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
    ...(row.implementation_plan_json == null
      ? {}
      : { implementationPlan: decodeJson<string[]>(row.implementation_plan_json, []) }),
    ...(row.verification_plan_json == null
      ? {}
      : { verificationPlan: decodeJson<string[]>(row.verification_plan_json, []) }),
    ...(row.guided == null ? {} : { guided: row.guided === 1 }),
    ...(row.retrospective == null ? {} : { retrospective: row.retrospective === 1 }),
    recordDepth: row.record_depth ?? 'FULL',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getTaskById(db: DatabaseSync, taskId: string): Task | null {
  const row = db.prepare(`SELECT * FROM tasks WHERE id = ?`).get(taskId) as TaskRow | undefined;
  return row === undefined ? null : mapTask(row);
}

export function createTask(
  projectRoot: string,
  description: string,
  options: { guided?: boolean; recordDepth?: RecordDepth } = {},
): Task {
  return new DecisionWorkspace(projectRoot).mutate(({ bundle, state }) => {
    assertWorkflowEnabledForTaskCreation(projectRoot);
    const policy = resolveTaskCreationPolicy(projectRoot);
    let id = createTaskId(description);
    let suffix = 2;
    while (bundle.tasks.some((task) => task.id === id)) {
      id = `${createTaskId(description)}-${String(suffix)}`;
      suffix += 1;
    }
    const createdAt = nowIso();
    const guided = options.guided === true;
    const task: Task = {
      id,
      title: description,
      description,
      status: 'OPEN',
      expectedScope: [],
      avoidScope: [],
      ...(guided ? { guided: true } : {}),
      recordDepth: options.recordDepth ?? 'FULL',
      createdAt,
      updatedAt: createdAt,
    };
    bundle.tasks.push(task);
    appendSourceEvent(bundle, {
      taskId: task.id,
      type: 'TASK_CREATED',
      payload: { description, policy },
    });
    if (guided) {
      appendSourceEvent(bundle, {
        taskId: task.id,
        type: 'GRILL_STARTED',
        payload: { automatic: true },
      });
    }
    state.currentTaskId = task.id;
    state.updatedAt = createdAt;
    return task;
  });
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
  return new DecisionWorkspace(projectRoot).mutate(({ bundle, state }) => {
    const taskId = requireCurrentTaskId(state.currentTaskId);
    const task = bundle.tasks.find((item) => item.id === taskId);
    if (task === undefined) {
      throw taskNotFound(taskId);
    }
    const updatedAt = nowIso();
    new TaskLifecycle(bundle, taskId).setTerminal(status, updatedAt);
    const updated = bundle.tasks.find((item) => item.id === taskId);
    if (updated === undefined) throw taskNotFound(taskId);
    appendSourceEvent(bundle, {
      taskId: task.id,
      type: status === 'CLOSED' ? 'TASK_CLOSED' : 'TASK_ABANDONED',
      payload: {},
    });
    state.currentTaskId = null;
    state.updatedAt = updatedAt;
    return updated;
  });
}

export function resumeTask(projectRoot: string, taskId: string): Task {
  return new DecisionWorkspace(projectRoot).mutate(({ bundle, state }) => {
    const lifecycle = new TaskLifecycle(bundle, taskId);
    lifecycle.assertAllowed('resume');
    state.currentTaskId = taskId;
    state.updatedAt = nowIso();
    return lifecycle.task;
  });
}

function requireCurrentTaskId(taskId: string | null): string {
  if (taskId === null) {
    throw noCurrentTask();
  }
  return taskId;
}
