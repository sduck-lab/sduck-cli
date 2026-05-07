import { listDecisionsByTask } from './decision.js';
import { appendEvent } from './events.js';
import { listEvidenceByTask } from './evidence.js';
import { nextEntityId, nowIso } from './ids.js';
import { listQuestionsByTask } from './question.js';
import { getCurrentTaskId } from './state.js';
import { encodeJson, openDatabase } from './store.js';
import { getTaskById, updateTaskStatus } from './task.js';

import type { BriefSnapshot, BriefView, DecisionKind } from '../../types/index.js';

export function buildBriefView(projectRoot: string): BriefView {
  const db = openDatabase(projectRoot);
  try {
    const taskId = getCurrentTaskId(projectRoot);
    if (taskId === null) throw new Error('No current task. Run `sduck work "..."` first.');
    const task = getTaskById(db, taskId);
    if (task === null) throw new Error(`Task not found: ${taskId}`);
    const grouped: Record<DecisionKind, BriefView['decisions'][DecisionKind]> = {
      EXPLICIT: [],
      INFERRED: [],
      CARRIED: [],
      CONFLICT: [],
      OPEN: [],
    };
    const decisions = listDecisionsByTask(db, task.id);
    for (const decision of decisions) grouped[decision.kind].push(decision);
    const questions = listQuestionsByTask(db, task.id);
    return {
      task,
      decisions: grouped,
      questions,
      evidence: listEvidenceByTask(db, task.id),
      expectedScope: task.expectedScope,
      avoidScope: task.avoidScope,
      openQuestionCount: questions.filter((question) => !question.answered).length,
    };
  } finally {
    db.close();
  }
}

export function renderBriefMarkdown(view: BriefView): string {
  const lines: string[] = [];
  lines.push('────────────────────────────────────────');
  lines.push('Implementation Brief');
  lines.push('────────────────────────────────────────');
  lines.push(`Task: ${view.task.id}`);
  lines.push(view.task.title);
  lines.push('');
  renderDecisionSection(lines, 'A. Explicit decisions', view.decisions.EXPLICIT);
  renderDecisionSection(lines, 'B. Inferred decisions', view.decisions.INFERRED);
  renderDecisionSection(lines, 'C. Carried decisions', view.decisions.CARRIED);
  renderDecisionSection(lines, 'D. Conflicts', view.decisions.CONFLICT);
  renderDecisionSection(lines, 'E. Open decisions', view.decisions.OPEN);
  lines.push('Scope expected:');
  pushList(lines, view.expectedScope);
  lines.push('Scope avoided:');
  pushList(lines, view.avoidScope);
  lines.push(`Open questions: ${String(view.openQuestionCount)}`);
  lines.push('Evidence:');
  if (view.evidence.length === 0) {
    lines.push('  - none');
  } else {
    for (const evidence of view.evidence) {
      lines.push(
        `  - [${evidence.sourceType}] ${evidence.sourceRef} (${String(evidence.confidence)}): ${evidence.summary}`,
      );
    }
  }
  lines.push('────────────────────────────────────────');
  return lines.join('\n');
}

export function confirmBrief(projectRoot: string): BriefSnapshot {
  const db = openDatabase(projectRoot);
  try {
    const view = buildBriefView(projectRoot);
    if (view.task.status === 'CLOSED' || view.task.status === 'ABANDONED') {
      throw new Error(`Cannot confirm a ${view.task.status} task.`);
    }
    const snapshot: BriefSnapshot = {
      id: nextEntityId(db, 'brief_snapshots', 'BRF'),
      taskId: view.task.id,
      snapshot: view,
      renderedMarkdown: renderBriefMarkdown(view),
      createdAt: nowIso(),
    };
    db.prepare(
      `INSERT INTO brief_snapshots (id, task_id, snapshot_json, rendered_markdown, created_at) VALUES (?, ?, ?, ?, ?)`,
    ).run(
      snapshot.id,
      snapshot.taskId,
      encodeJson(snapshot.snapshot),
      snapshot.renderedMarkdown,
      snapshot.createdAt,
    );
    updateTaskStatus(db, snapshot.taskId, 'CONFIRMED');
    appendEvent(db, {
      taskId: snapshot.taskId,
      type: 'BRIEF_CONFIRMED',
      payload: { snapshotId: snapshot.id },
    });
    return snapshot;
  } finally {
    db.close();
  }
}

function renderDecisionSection(
  lines: string[],
  title: string,
  decisions: BriefView['decisions'][DecisionKind],
): void {
  lines.push(title);
  if (decisions.length === 0) {
    lines.push('  - none');
    lines.push('');
    return;
  }
  for (const decision of decisions) {
    lines.push(`[${decision.kind}] ${decision.id}. ${decision.title}`);
    lines.push(`Confidence: ${decision.confidence.toFixed(2)}`);
    lines.push(`Summary: ${decision.summary}`);
    if (decision.sourceRefs.length > 0) {
      lines.push('Source refs:');
      pushList(lines, decision.sourceRefs);
    }
    if (decision.rationale.length > 0) {
      lines.push('Rationale:');
      pushList(lines, decision.rationale);
    }
    if (decision.appliesTo.length > 0) {
      lines.push('Applies to:');
      pushList(lines, decision.appliesTo);
    }
    if (decision.avoids.length > 0) {
      lines.push('Avoids:');
      pushList(lines, decision.avoids);
    }
    lines.push('');
  }
}

function pushList(lines: string[], values: string[]): void {
  if (values.length === 0) {
    lines.push('  - none');
    return;
  }
  for (const value of values) lines.push(`  - ${value}`);
}
