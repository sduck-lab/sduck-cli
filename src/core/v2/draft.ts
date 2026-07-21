import { DecisionWorkspace } from './decision-workspace.js';
import { noCurrentTask, taskNotFound, V2ExpectedError } from './errors.js';
import { nowIso } from './ids.js';
import { appendSourceEvent, nextSourceEntityId } from './source-store.js';
import { TaskLifecycle } from './task-lifecycle.js';

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
    try {
      return JSON.parse(trimmed) as SduckDraft;
    } catch (error) {
      throw new V2ExpectedError('DRAFT_JSON_INVALID', { detail: formatParseDetail(error) });
    }
  }
  const match = /```json\s+sduck-draft\s*\n([\s\S]*?)\n```/m.exec(content);
  if (match?.[1] === undefined) {
    throw new V2ExpectedError('DRAFT_FENCE_MISSING');
  }
  try {
    return JSON.parse(match[1]) as SduckDraft;
  } catch (error) {
    throw new V2ExpectedError('DRAFT_JSON_INVALID', { detail: formatParseDetail(error) });
  }
}

function formatParseDetail(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function submitDraft(projectRoot: string, content: string): SubmitDraftResult {
  const draft = validateDraft(parseDraftInput(content));
  return new DecisionWorkspace(projectRoot).mutate(({ bundle, state }) => {
    const currentTaskId = state.currentTaskId;
    if (currentTaskId === null) throw noCurrentTask();
    const taskId = draft.taskId ?? currentTaskId;
    if (taskId !== currentTaskId) {
      throw new V2ExpectedError('DRAFT_TASK_MISMATCH', { taskId, currentTaskId });
    }
    const task = bundle.tasks.find((item) => item.id === taskId);
    if (task === undefined) throw taskNotFound(taskId);
    new TaskLifecycle(bundle, taskId).assertAllowed('submit');
    const decisions = draft.decisions ?? [];
    const questions = draft.questions ?? [];
    const evidence = draft.evidence ?? [];
    const now = nowIso();
    validateCarriedDecisions(bundle, taskId, decisions);
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
            expectedScope: draft.expectedScope ?? item.expectedScope,
            avoidScope: draft.avoidScope ?? item.avoidScope,
            ...(draft.implementationPlan === undefined
              ? {}
              : { implementationPlan: draft.implementationPlan }),
            ...(draft.verificationPlan === undefined
              ? {}
              : { verificationPlan: draft.verificationPlan }),
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
        implementationPlan: draft.implementationPlan ?? [],
        verificationPlan: draft.verificationPlan ?? [],
      },
    });
    new TaskLifecycle(bundle, taskId).reconcileBriefReadiness(now);
    return {
      taskId,
      decisions: decisions.length,
      questions: questions.length,
      evidence: evidence.length,
    };
  });
}

export function validateDraft(draft: unknown): SduckDraft {
  if (typeof draft !== 'object' || draft === null || !('schemaVersion' in draft)) {
    throw new V2ExpectedError('DRAFT_SCHEMA', { problemCode: 'missing-schema-version' });
  }
  const raw = draft as Record<string, unknown>;
  if (raw['schemaVersion'] !== 'v2alpha1') {
    throw new V2ExpectedError('DRAFT_SCHEMA', { problemCode: 'unsupported-schema-version' });
  }
  const candidate = draft as SduckDraft;
  assertOptionalArray(candidate.decisions, 'decisions');
  assertOptionalArray(candidate.questions, 'questions');
  assertOptionalArray(candidate.evidence, 'evidence');
  assertOptionalStringArray(candidate.expectedScope, 'expectedScope');
  assertOptionalStringArray(candidate.avoidScope, 'avoidScope');
  assertOptionalStringArray(candidate.implementationPlan, 'implementationPlan');
  assertOptionalStringArray(candidate.verificationPlan, 'verificationPlan');
  for (const decision of candidate.decisions ?? []) {
    assertString(decision.title, 'decision.title');
    assertString(decision.summary, 'decision.summary');
    if (!['EXPLICIT', 'INFERRED', 'CARRIED', 'CONFLICT', 'OPEN'].includes(decision.kind)) {
      throw new V2ExpectedError('DRAFT_DECISION_KIND', { kind: decision.kind });
    }
    assertOptionalStringArray(decision.rationale, 'decision.rationale');
    assertOptionalStringArray(decision.appliesTo, 'decision.appliesTo');
    assertOptionalStringArray(decision.avoids, 'decision.avoids');
    assertOptionalStringArray(decision.sourceRefs, 'decision.sourceRefs');
    if (decision.confidence !== undefined && (decision.confidence < 0 || decision.confidence > 1)) {
      throw new V2ExpectedError('DRAFT_CONFIDENCE', { field: 'Decision', ref: decision.title });
    }
  }
  for (const item of candidate.evidence ?? []) {
    assertString(item.sourceType, 'evidence.sourceType');
    assertString(item.sourceRef, 'evidence.sourceRef');
    assertString(item.summary, 'evidence.summary');
    if (item.confidence !== undefined && (item.confidence < 0 || item.confidence > 1)) {
      throw new V2ExpectedError('DRAFT_CONFIDENCE', { field: 'Evidence', ref: item.sourceRef });
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

export function validateCarriedDecisions(
  bundle: { decisions: Decision[]; tasks: { id: string; status: string }[] },
  taskId: string,
  decisions: NonNullable<SduckDraft['decisions']>,
): void {
  for (const decision of decisions) {
    if (decision.kind !== 'CARRIED') continue;
    if (
      (decision.rationale ?? []).length === 0 ||
      decision.rationale?.some((item) => item.trim() === '')
    ) {
      throw new V2ExpectedError('CARRIED_DECISION_INVALID', {
        decision: decision.title,
        reason: 'rationale',
      });
    }
    if ((decision.sourceRefs ?? []).length === 0) {
      throw new V2ExpectedError('CARRIED_DECISION_INVALID', {
        decision: decision.title,
        reason: 'sourceRefs',
      });
    }
    for (const sourceRef of decision.sourceRefs ?? []) {
      const source = bundle.decisions.find((item) => item.id === sourceRef);
      const sourceTask = bundle.tasks.find((item) => item.id === source?.taskId);
      if (
        source?.status !== 'CONFIRMED' ||
        source.taskId === taskId ||
        sourceTask?.status === 'ABANDONED'
      ) {
        throw new V2ExpectedError('CARRIED_DECISION_INVALID', {
          decision: decision.title,
          sourceRef,
        });
      }
    }
  }
}

function assertString(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string' || value.trim() === '')
    throw new V2ExpectedError('DRAFT_FIELD', { field, problemCode: 'non-empty-string' });
}

function assertOptionalArray(value: unknown, field: string): void {
  if (value !== undefined && !Array.isArray(value))
    throw new V2ExpectedError('DRAFT_FIELD', { field, problemCode: 'array' });
}

function assertOptionalStringArray(value: unknown, field: string): void {
  if (value === undefined) return;
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new V2ExpectedError('DRAFT_FIELD', { field, problemCode: 'string-array' });
  }
}
