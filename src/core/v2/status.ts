import { emptyDecisionKindCounts, listDecisionsByTask } from './decision.js';
import { listEvents } from './events.js';
import { listQuestionsByTask } from './question.js';
import { getCurrentTaskId } from './state.js';
import { openDatabase } from './store.js';
import { getTaskById, updateTaskStatus } from './task.js';

import type { StatusView } from '../../types/index.js';
import type { DatabaseSync } from 'node:sqlite';

export function buildStatusView(projectRoot: string): StatusView {
  const db = openDatabase(projectRoot);
  try {
    const taskId = getCurrentTaskId(projectRoot);
    if (taskId === null) {
      return {
        task: null,
        indicators: {
          contextItems: 0,
          draftSubmissions: 0,
          questionsOpen: 0,
          questionsAnswered: 0,
          decisionsByKind: emptyDecisionKindCounts(),
          briefSnapshots: 0,
          implementationTraces: 0,
          exports: 0,
        },
      };
    }
    const task = getTaskById(db, taskId);
    if (task === null) throw new Error(`Task not found: ${taskId}`);
    const decisions = listDecisionsByTask(db, task.id);
    const decisionsByKind = emptyDecisionKindCounts();
    for (const decision of decisions) {
      decisionsByKind[decision.kind] += 1;
    }
    const questions = listQuestionsByTask(db, task.id);
    const events = listEvents(db, task.id);
    const counts = {
      contextItems: scalarCount(
        db,
        `SELECT COUNT(*) AS count FROM context_items WHERE task_id = ?`,
        task.id,
      ),
      draftSubmissions: events.filter((event) => event.type === 'DRAFT_SUBMITTED').length,
      questionsOpen: questions.filter((question) => !question.answered).length,
      questionsAnswered: questions.filter((question) => question.answered).length,
      decisionsByKind,
      briefSnapshots: scalarCount(
        db,
        `SELECT COUNT(*) AS count FROM brief_snapshots WHERE task_id = ?`,
        task.id,
      ),
      implementationTraces: scalarCount(
        db,
        `SELECT COUNT(*) AS count FROM implementation_traces WHERE task_id = ?`,
        task.id,
      ),
      exports: events.filter((event) => event.type === 'EXPORT_WRITTEN').length,
    };
    return { task, indicators: counts };
  } finally {
    db.close();
  }
}

export function maybeMarkBriefReady(projectRoot: string): void {
  const db = openDatabase(projectRoot);
  try {
    const taskId = getCurrentTaskId(projectRoot);
    if (taskId === null) return;
    const task = getTaskById(db, taskId);
    if (task?.status !== 'OPEN') return;
    const openQuestions = scalarCount(
      db,
      `SELECT COUNT(*) AS count FROM questions WHERE task_id = ? AND answered = 0`,
      taskId,
    );
    const decisions = scalarCount(
      db,
      `SELECT COUNT(*) AS count FROM decisions WHERE task_id = ?`,
      taskId,
    );
    if (openQuestions === 0 && decisions > 0) {
      updateTaskStatus(db, taskId, 'BRIEF_READY');
    }
  } finally {
    db.close();
  }
}

function scalarCount(db: DatabaseSync, sql: string, value: string): number {
  const row = db.prepare(sql).get(value) as { count: number };
  return row.count;
}
