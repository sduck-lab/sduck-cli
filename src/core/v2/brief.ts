import { ensureReadableCache } from './cache.js';
import { DecisionWorkspace } from './decision-workspace.js';
import { listDecisionsByTask } from './decision.js';
import { listEvidenceByTask } from './evidence.js';
import { captureGitBaseline } from './git-diff.js';
import { nowIso } from './ids.js';
import { listQuestionsByTask } from './question.js';
import { appendSourceEvent, nextSourceEntityId } from './source-store.js';
import { getCurrentTaskId } from './state.js';
import { openDatabase } from './store.js';
import { TaskLifecycle } from './task-lifecycle.js';
import { getTaskById } from './task.js';

import type { SourceBundle } from './source-types.js';
import type { BriefSnapshot, BriefView, DecisionKind } from '../../types/index.js';

export function buildBriefView(projectRoot: string): BriefView {
  ensureReadableCache(projectRoot);
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
  return new DecisionWorkspace(projectRoot).mutate(({ bundle, state }) => {
    const confirmedAt = nowIso();
    const taskId = state.currentTaskId;
    if (taskId === null) throw new Error('No current task. Run `sduck work "..."` first.');
    const lifecycle = new TaskLifecycle(bundle, taskId);
    lifecycle.confirm(confirmedAt);
    const view = buildBriefViewFromBundle(bundle, taskId);
    const snapshot: BriefSnapshot = {
      id: nextSourceEntityId(
        bundle.briefSnapshots.map((item) => item.id),
        'BRF',
      ),
      taskId: view.task.id,
      snapshot: view,
      renderedMarkdown: renderBriefMarkdown(view),
      gitBaseline: captureGitBaseline(projectRoot),
      createdAt: nowIso(),
    };
    bundle.briefSnapshots.push(snapshot);
    appendSourceEvent(bundle, {
      taskId: snapshot.taskId,
      type: 'BRIEF_CONFIRMED',
      payload: { snapshotId: snapshot.id },
    });
    return snapshot;
  });
}

function buildBriefViewFromBundle(bundle: SourceBundle, taskId: string): BriefView {
  const task = bundle.tasks.find((item) => item.id === taskId);
  if (task === undefined) throw new Error(`Task not found: ${taskId}`);
  const grouped: BriefView['decisions'] = {
    EXPLICIT: [],
    INFERRED: [],
    CARRIED: [],
    CONFLICT: [],
    OPEN: [],
  };
  for (const decision of bundle.decisions.filter((item) => item.taskId === taskId)) {
    grouped[decision.kind].push(decision);
  }
  const questions = bundle.questions.filter((item) => item.taskId === taskId);
  return {
    task,
    decisions: grouped,
    questions,
    evidence: bundle.evidence.filter((item) => item.taskId === taskId),
    expectedScope: task.expectedScope,
    avoidScope: task.avoidScope,
    openQuestionCount: questions.filter((question) => !question.answered).length,
  };
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
