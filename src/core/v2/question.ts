import { DecisionWorkspace } from './decision-workspace.js';
import { V2ExpectedError } from './errors.js';
import { nextEntityId, nowIso } from './ids.js';
import { appendSourceEvent, nextSourceEntityId } from './source-store.js';
import { decodeJson, encodeJson } from './store.js';
import { TaskLifecycle } from './task-lifecycle.js';

import type { Decision, Evidence, DraftQuestion, Question } from '../../types/index.js';
import type { DatabaseSync } from 'node:sqlite';

interface QuestionRow {
  id: string;
  task_id: string;
  decision_id: string | null;
  text: string;
  recommended_answer: string;
  rationale_json: string;
  options_json: string;
  answered: number;
  answer: string | null;
  created_at: string;
}

export function mapQuestion(row: QuestionRow): Question {
  return {
    id: row.id,
    taskId: row.task_id,
    decisionId: row.decision_id,
    text: row.text,
    recommendedAnswer: row.recommended_answer,
    rationale: decodeJson<string[]>(row.rationale_json, []),
    options: decodeJson<string[]>(row.options_json, []),
    answered: row.answered === 1,
    answer: row.answer,
    createdAt: row.created_at,
  };
}

export function insertQuestion(db: DatabaseSync, taskId: string, draft: DraftQuestion): Question {
  const question: Question = {
    id: draft.id ?? nextEntityId(db, 'questions', 'Q'),
    taskId,
    decisionId: draft.decisionId ?? null,
    text: draft.text,
    recommendedAnswer: draft.recommendedAnswer,
    rationale: draft.rationale ?? [],
    options: draft.options ?? ['추천안 사용', '직접 입력'],
    answered: false,
    answer: null,
    createdAt: nowIso(),
  };
  db.prepare(
    `INSERT OR REPLACE INTO questions
      (id, task_id, decision_id, text, recommended_answer, rationale_json, options_json, answered, answer, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    question.id,
    question.taskId,
    question.decisionId,
    question.text,
    question.recommendedAnswer,
    encodeJson(question.rationale),
    encodeJson(question.options),
    0,
    null,
    question.createdAt,
  );
  return question;
}

export function listQuestionsByTask(db: DatabaseSync, taskId: string): Question[] {
  const rows = db
    .prepare(`SELECT * FROM questions WHERE task_id = ? ORDER BY created_at ASC`)
    .all(taskId) as unknown as QuestionRow[];
  return rows.map(mapQuestion);
}

export function getQuestion(db: DatabaseSync, questionId: string): Question | null {
  const row = db.prepare(`SELECT * FROM questions WHERE id = ?`).get(questionId) as
    QuestionRow | undefined;
  return row === undefined ? null : mapQuestion(row);
}

export function getNextOpenQuestion(db: DatabaseSync, taskId: string): Question | null {
  const row = db
    .prepare(
      `SELECT * FROM questions WHERE task_id = ? AND answered = 0 ORDER BY created_at ASC LIMIT 1`,
    )
    .get(taskId) as QuestionRow | undefined;
  return row === undefined ? null : mapQuestion(row);
}

export function answerQuestion(
  projectRoot: string,
  questionId: string,
  input: { optionIndex?: number; text?: string },
): { question: Question; answer: string } {
  return new DecisionWorkspace(projectRoot).mutate(({ bundle, state }) => {
    const question = bundle.questions.find((item) => item.id === questionId);
    if (question === undefined) {
      throw new V2ExpectedError('QUESTION_NOT_FOUND', { questionId });
    }
    if (state.currentTaskId !== question.taskId) {
      throw new V2ExpectedError('QUESTION_TASK_MISMATCH', {
        questionId,
        taskId: state.currentTaskId ?? 'none',
        expectedTaskId: question.taskId,
      });
    }
    if (question.answered) {
      throw new V2ExpectedError('QUESTION_ALREADY_ANSWERED', { questionId });
    }
    new TaskLifecycle(bundle, question.taskId).assertAllowed('answer');
    const answer = resolveAnswer(question, input);
    const answeredAt = nowIso();
    const updatedQuestion: Question = { ...question, answered: true, answer };
    const evidenceId = nextSourceEntityId(
      bundle.evidence.map((item) => item.id),
      'EVD',
    );
    const evidence: Evidence = {
      id: evidenceId,
      taskId: question.taskId,
      decisionId: question.decisionId,
      sourceType: 'USER_ANSWER',
      sourceRef: question.id,
      summary: answer,
      confidence: 1,
      createdAt: answeredAt,
    };
    bundle.questions = bundle.questions.map((item) =>
      item.id === question.id ? updatedQuestion : item,
    );
    bundle.evidence.push(evidence);
    if (question.decisionId !== null) {
      bundle.decisions = bundle.decisions.map((decision) =>
        decision.id === question.decisionId
          ? {
              ...decision,
              kind: 'EXPLICIT',
              status: 'CONFIRMED',
              confidence: 1,
              summary: answer,
              sourceRefs: [...decision.sourceRefs, `USER_ANSWER:${question.id}`],
              updatedAt: answeredAt,
            }
          : decision,
      );
    } else {
      const decisionId = nextSourceEntityId(
        bundle.decisions.map((item) => item.id),
        'DEC',
      );
      const decision: Decision = {
        id: decisionId,
        taskId: question.taskId,
        title: question.text,
        kind: 'EXPLICIT',
        status: 'CONFIRMED',
        confidence: 1,
        summary: answer,
        rationale: [`User answered ${question.id}.`],
        appliesTo: [],
        avoids: [],
        sourceRefs: [`USER_ANSWER:${question.id}`, evidence.id],
        createdAt: answeredAt,
        updatedAt: answeredAt,
      };
      bundle.decisions.push(decision);
      appendSourceEvent(bundle, {
        taskId: question.taskId,
        type: 'DECISION_CREATED',
        payload: { decisionId },
      });
    }
    appendSourceEvent(bundle, {
      taskId: question.taskId,
      type: 'QUESTION_ANSWERED',
      payload: { questionId: question.id, answer },
    });
    new TaskLifecycle(bundle, question.taskId).reconcileBriefReadiness(answeredAt);
    return { question: updatedQuestion, answer };
  });
}

function resolveAnswer(question: Question, input: { optionIndex?: number; text?: string }): string {
  if (input.text !== undefined && input.text.trim() !== '') return input.text.trim();
  if (input.optionIndex !== undefined) {
    if (input.optionIndex < 1 || input.optionIndex > question.options.length) {
      throw new V2ExpectedError('QUESTION_OPTION_RANGE', { optionIndex: input.optionIndex });
    }
    const option = question.options[input.optionIndex - 1];
    if (option === undefined) {
      throw new V2ExpectedError('QUESTION_OPTION_RANGE', { optionIndex: input.optionIndex });
    }
    if (option === '추천안 사용') return question.recommendedAnswer;
    return option;
  }
  throw new V2ExpectedError('QUESTION_ANSWER_REQUIRED');
}
