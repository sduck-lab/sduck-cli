import { insertDecision } from './decision.js';
import { appendEvent } from './events.js';
import { insertEvidence } from './evidence.js';
import { insertQuestion } from './question.js';
import { maybeMarkBriefReadyInDb } from './status.js';
import { openDatabase } from './store.js';
import { requireMutableCurrentTask, updateTaskScopes } from './task.js';

import type { SduckDraft } from '../../types/index.js';
import type { DatabaseSync } from 'node:sqlite';

export interface SubmitDraftResult {
  taskId: string;
  decisions: number;
  questions: number;
  evidence: number;
}

export function parseDraftInput(content: string): unknown {
  const trimmed = content.trim();
  if (trimmed.startsWith('{')) {
    return JSON.parse(trimmed) as SduckDraft;
  }
  const match = /```json\s+sduck-draft\s*\n([\s\S]*?)\n```/m.exec(content);
  if (match?.[1] === undefined) {
    throw new Error('Markdown draft must contain a ```json sduck-draft fenced block.');
  }
  return JSON.parse(match[1]) as SduckDraft;
}

export function submitDraft(projectRoot: string, content: string): SubmitDraftResult {
  const db = openDatabase(projectRoot);
  try {
    const currentTask = requireMutableCurrentTask(projectRoot, db);
    const currentTaskId = currentTask.id;
    const draft = validateDraft(parseDraftInput(content));
    const taskId = draft.taskId ?? currentTaskId;
    if (taskId !== currentTaskId) {
      throw new Error(`Draft taskId ${taskId} does not match current task ${currentTaskId}.`);
    }
    const decisions = draft.decisions ?? [];
    const questions = draft.questions ?? [];
    const evidence = draft.evidence ?? [];
    assertUniqueDraftIds(decisions, 'decision');
    assertUniqueDraftIds(questions, 'question');
    assertUniqueDraftIds(evidence, 'evidence');
    assertIdsDoNotExist(db, 'decisions', idsFrom(decisions), 'Decision');
    assertIdsDoNotExist(db, 'questions', idsFrom(questions), 'Question');
    assertIdsDoNotExist(db, 'evidence', idsFrom(evidence), 'Evidence');
    for (const decision of decisions) insertDecision(db, taskId, decision);
    for (const question of questions) insertQuestion(db, taskId, question);
    for (const item of evidence) insertEvidence(db, taskId, item);
    updateTaskScopes(db, taskId, draft.expectedScope ?? [], draft.avoidScope ?? []);
    appendEvent(db, {
      taskId,
      type: 'DRAFT_SUBMITTED',
      payload: {
        decisions: decisions.length,
        questions: questions.length,
        evidence: evidence.length,
        expectedScope: draft.expectedScope ?? [],
        avoidScope: draft.avoidScope ?? [],
      },
    });
    maybeMarkBriefReadyInDb(db, taskId);
    return {
      taskId,
      decisions: decisions.length,
      questions: questions.length,
      evidence: evidence.length,
    };
  } finally {
    db.close();
  }
}

function idsFrom(items: readonly { id?: string }[]): string[] {
  return items.flatMap((item) => (item.id === undefined ? [] : [item.id]));
}

function assertUniqueDraftIds(items: readonly { id?: string }[], entityName: string): void {
  const seen = new Set<string>();
  for (const id of idsFrom(items)) {
    if (seen.has(id)) {
      throw new Error(`Duplicate ${entityName} id in draft: ${id}`);
    }
    seen.add(id);
  }
}

function assertIdsDoNotExist(
  db: DatabaseSync,
  table: 'decisions' | 'questions' | 'evidence',
  ids: readonly string[],
  entityName: string,
): void {
  for (const id of ids) {
    const existing = db.prepare(`SELECT id FROM ${table} WHERE id = ?`).get(id) as
      | { id: string }
      | undefined;
    if (existing !== undefined) {
      throw new Error(`${entityName} id already exists: ${id}`);
    }
  }
}

function validateDraft(draft: unknown): SduckDraft {
  if (typeof draft !== 'object' || draft === null || !('schemaVersion' in draft)) {
    throw new Error('Draft must be an object with schemaVersion.');
  }
  const raw = draft as Record<string, unknown>;
  if (raw['schemaVersion'] !== 'v2alpha1') {
    throw new Error('Draft schemaVersion must be v2alpha1.');
  }
  const candidate = draft as SduckDraft;
  assertOptionalArray(candidate.decisions, 'decisions');
  assertOptionalArray(candidate.questions, 'questions');
  assertOptionalArray(candidate.evidence, 'evidence');
  assertOptionalStringArray(candidate.expectedScope, 'expectedScope');
  assertOptionalStringArray(candidate.avoidScope, 'avoidScope');
  for (const decision of candidate.decisions ?? []) {
    assertString(decision.title, 'decision.title');
    assertString(decision.summary, 'decision.summary');
    if (!['EXPLICIT', 'INFERRED', 'CARRIED', 'CONFLICT', 'OPEN'].includes(decision.kind)) {
      throw new Error(`Invalid decision kind: ${decision.kind}`);
    }
    assertOptionalStringArray(decision.rationale, 'decision.rationale');
    assertOptionalStringArray(decision.appliesTo, 'decision.appliesTo');
    assertOptionalStringArray(decision.avoids, 'decision.avoids');
    assertOptionalStringArray(decision.sourceRefs, 'decision.sourceRefs');
    if (decision.confidence !== undefined && (decision.confidence < 0 || decision.confidence > 1)) {
      throw new Error(`Decision confidence must be between 0 and 1: ${decision.title}`);
    }
  }
  for (const item of candidate.evidence ?? []) {
    assertString(item.sourceType, 'evidence.sourceType');
    assertString(item.sourceRef, 'evidence.sourceRef');
    assertString(item.summary, 'evidence.summary');
    if (item.confidence !== undefined && (item.confidence < 0 || item.confidence > 1)) {
      throw new Error(`Evidence confidence must be between 0 and 1: ${item.sourceRef}`);
    }
  }
  for (const question of candidate.questions ?? []) {
    assertString(question.text, 'question.text');
    assertString(question.recommendedAnswer, 'question.recommendedAnswer');
    assertOptionalStringArray(question.rationale, 'question.rationale');
    assertOptionalStringArray(question.options, 'question.options');
  }
  return candidate;
}

function assertString(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string' || value.trim() === '')
    throw new Error(`${field} must be a non-empty string.`);
}

function assertOptionalArray(value: unknown, field: string): void {
  if (value !== undefined && !Array.isArray(value)) throw new Error(`${field} must be an array.`);
}

function assertOptionalStringArray(value: unknown, field: string): void {
  if (value === undefined) return;
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new Error(`${field} must be a string array.`);
  }
}
