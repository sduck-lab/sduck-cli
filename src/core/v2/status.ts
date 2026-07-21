import { ensureReadableCache } from './cache.js';
import { DecisionWorkspace } from './decision-workspace.js';
import { emptyDecisionKindCounts, listDecisionsByTask } from './decision.js';
import { taskNotFound } from './errors.js';
import { listEvents } from './events.js';
import { hasGrillMeCompleted, hasGrillMeStarted } from './grill.js';
import { listQuestionsByTask } from './question.js';
import { getCurrentTaskId } from './state.js';
import { openDatabase } from './store.js';
import { TaskLifecycle } from './task-lifecycle.js';
import { getTaskById } from './task.js';

import type { StatusView } from '../../types/index.js';
import type { DatabaseSync } from 'node:sqlite';

export function buildStatusView(projectRoot: string): StatusView {
  ensureReadableCache(projectRoot);
  const db = openDatabase(projectRoot);
  try {
    const taskId = getCurrentTaskId(projectRoot);
    if (taskId === null) {
      return {
        task: null,
        indicators: {
          contextItems: 0,
          draftSubmissions: 0,
          grillMeRequired: false,
          grillMeStarted: false,
          grillMeCompleted: false,
          questionsOpen: 0,
          questionsAnswered: 0,
          decisionsByKind: emptyDecisionKindCounts(),
          briefSnapshots: 0,
          implementationTraces: 0,
          evaluations: 0,
          latestTraceEvaluated: false,
          exports: 0,
        },
      };
    }
    const task = getTaskById(db, taskId);
    if (task === null) throw taskNotFound(taskId);
    const decisions = listDecisionsByTask(db, task.id);
    const decisionsByKind = emptyDecisionKindCounts();
    for (const decision of decisions) {
      decisionsByKind[decision.kind] += 1;
    }
    const questions = listQuestionsByTask(db, task.id);
    const events = listEvents(db, task.id);
    const latestTrace = db
      .prepare(
        `SELECT id FROM implementation_traces WHERE task_id = ? ORDER BY created_at DESC LIMIT 1`,
      )
      .get(task.id) as { id: string } | undefined;
    const evaluations = scalarCount(
      db,
      `SELECT COUNT(*) AS count FROM evaluations WHERE task_id = ?`,
      task.id,
    );
    const counts = {
      contextItems: scalarCount(
        db,
        `SELECT COUNT(*) AS count FROM context_items WHERE task_id = ?`,
        task.id,
      ),
      draftSubmissions: events.filter((event) => event.type === 'DRAFT_SUBMITTED').length,
      grillMeRequired: task.guided === true,
      grillMeStarted: hasGrillMeStarted(events, task.id),
      grillMeCompleted: hasGrillMeCompleted(events, task.id),
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
      evaluations,
      latestTraceEvaluated:
        latestTrace !== undefined &&
        scalarCount2(
          db,
          `SELECT COUNT(*) AS count FROM evaluations WHERE task_id = ? AND trace_id = ?`,
          task.id,
          latestTrace.id,
        ) > 0,
      exports: events.filter((event) => event.type === 'EXPORT_WRITTEN').length,
    };
    return { task, indicators: counts };
  } finally {
    db.close();
  }
}

export function maybeMarkBriefReady(projectRoot: string): void {
  new DecisionWorkspace(projectRoot).mutate(({ bundle, state }) => {
    if (state.currentTaskId === null) return;
    new TaskLifecycle(bundle, state.currentTaskId).reconcileBriefReadiness(
      new Date().toISOString(),
    );
  });
}

function scalarCount(db: DatabaseSync, sql: string, value: string): number {
  const row = db.prepare(sql).get(value) as { count: number };
  return row.count;
}

function scalarCount2(db: DatabaseSync, sql: string, first: string, second: string): number {
  const row = db.prepare(sql).get(first, second) as { count: number };
  return row.count;
}
