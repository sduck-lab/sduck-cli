import { ensureReadableCache } from './cache.js';
import { nowIso } from './ids.js';
import { rebuildDecisionCache } from './rebuild.js';
import {
  appendSourceEvent,
  loadSourceBundleForWrite,
  nextSourceEntityId,
  writeSourceBundle,
} from './source-store.js';
import { getCurrentTaskId } from './state.js';

import type { Decision, Evidence, Question, SduckDraft } from '../../types/index.js';

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
  ensureReadableCache(projectRoot);
  const currentTaskId = getCurrentTaskId(projectRoot);
  if (currentTaskId === null) throw new Error('No current task. Run `sduck work "..."` first.');
  const draft = validateDraft(parseDraftInput(content));
  const taskId = draft.taskId ?? currentTaskId;
  if (taskId !== currentTaskId) {
    throw new Error(`Draft taskId ${taskId} does not match current task ${currentTaskId}.`);
  }
  const bundle = loadSourceBundleForWrite(projectRoot);
  const task = bundle.tasks.find((item) => item.id === taskId);
  if (task === undefined) throw new Error(`Task not found: ${taskId}`);
  const decisions = draft.decisions ?? [];
  const questions = draft.questions ?? [];
  const evidence = draft.evidence ?? [];
  const now = nowIso();
  let decisionIds = bundle.decisions.map((item) => item.id);
  let questionIds = bundle.questions.map((item) => item.id);
  let evidenceIds = bundle.evidence.map((item) => item.id);
  for (const draftDecision of decisions) {
    const id = draftDecision.id ?? nextSourceEntityId(decisionIds, 'DEC');
    decisionIds = [...decisionIds, id];
    const decision: Decision = {
      id,
      taskId,
      title: draftDecision.title,
      kind: draftDecision.kind,
      status: draftDecision.status ?? 'DRAFT',
      confidence: draftDecision.confidence ?? (draftDecision.kind === 'EXPLICIT' ? 1 : 0.7),
      summary: draftDecision.summary,
      rationale: draftDecision.rationale ?? [],
      appliesTo: draftDecision.appliesTo ?? [],
      avoids: draftDecision.avoids ?? [],
      sourceRefs: draftDecision.sourceRefs ?? [],
      createdAt: now,
      updatedAt: now,
    };
    bundle.decisions.push(decision);
    appendSourceEvent(bundle, { taskId, type: 'DECISION_CREATED', payload: { decisionId: id } });
  }
  for (const draftQuestion of questions) {
    const id = draftQuestion.id ?? nextSourceEntityId(questionIds, 'Q');
    questionIds = [...questionIds, id];
    const question: Question = {
      id,
      taskId,
      decisionId: draftQuestion.decisionId ?? null,
      text: draftQuestion.text,
      recommendedAnswer: draftQuestion.recommendedAnswer,
      rationale: draftQuestion.rationale ?? [],
      options: draftQuestion.options ?? ['추천안 사용', '직접 입력'],
      answered: false,
      answer: null,
      createdAt: now,
    };
    bundle.questions.push(question);
  }
  for (const draftEvidence of evidence) {
    const id = draftEvidence.id ?? nextSourceEntityId(evidenceIds, 'EVD');
    evidenceIds = [...evidenceIds, id];
    const item: Evidence = {
      id,
      taskId,
      decisionId: draftEvidence.decisionId ?? null,
      sourceType: draftEvidence.sourceType,
      sourceRef: draftEvidence.sourceRef,
      summary: draftEvidence.summary,
      confidence: draftEvidence.confidence ?? 0.7,
      createdAt: now,
    };
    bundle.evidence.push(item);
  }
  bundle.tasks = bundle.tasks.map((item) =>
    item.id === taskId
      ? {
          ...item,
          expectedScope: draft.expectedScope ?? [],
          avoidScope: draft.avoidScope ?? [],
          updatedAt: now,
        }
      : item,
  );
  appendSourceEvent(bundle, {
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
  writeSourceBundle(projectRoot, bundle);
  rebuildDecisionCache(projectRoot);
  return {
    taskId,
    decisions: decisions.length,
    questions: questions.length,
    evidence: evidence.length,
  };
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
