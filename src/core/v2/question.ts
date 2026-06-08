import { insertDecision, updateDecisionFromAnswer } from './decision.js';
import { appendEvent } from './events.js';
import { insertEvidence } from './evidence.js';
import { nextEntityId, nowIso } from './ids.js';
import { maybeMarkBriefReadyInDb } from './status.js';
import { decodeJson, encodeJson, openDatabase } from './store.js';
import { requireMutableCurrentTask } from './task.js';

import type { DraftQuestion, Question } from '../../types/index.js';
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
  try {
    db.prepare(
      `INSERT INTO questions
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
  } catch (error) {
    throwDuplicateIdError(error, 'Question', question.id);
  }
  return question;
}

function throwDuplicateIdError(error: unknown, entityName: string, id: string): never {
  if (error instanceof Error && /constraint|unique|primary/i.test(error.message)) {
    throw new Error(`${entityName} id already exists: ${id}`);
  }
  throw error;
}

export function listQuestionsByTask(db: DatabaseSync, taskId: string): Question[] {
  const rows = db
    .prepare(`SELECT * FROM questions WHERE task_id = ? ORDER BY created_at ASC`)
    .all(taskId) as unknown as QuestionRow[];
  return rows.map(mapQuestion);
}

export function getQuestion(db: DatabaseSync, questionId: string): Question | null {
  const row = db.prepare(`SELECT * FROM questions WHERE id = ?`).get(questionId) as
    | QuestionRow
    | undefined;
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
  const db = openDatabase(projectRoot);
  try {
    const currentTask = requireMutableCurrentTask(projectRoot, db);
    const question = getQuestion(db, questionId);
    if (question === null) {
      throw new Error(`Question not found: ${questionId}`);
    }
    if (question.answered) {
      throw new Error(`Question is already answered: ${questionId}`);
    }
    if (question.taskId !== currentTask.id) {
      throw new Error(`Question ${questionId} does not belong to current task ${currentTask.id}.`);
    }
    const answer = resolveAnswer(question, input);
    db.prepare(`UPDATE questions SET answered = 1, answer = ? WHERE id = ?`).run(
      answer,
      question.id,
    );
    const evidenceDraft = {
      sourceType: 'USER_ANSWER',
      sourceRef: question.id,
      summary: answer,
      confidence: 1,
    } as const;
    const evidence = insertEvidence(
      db,
      question.taskId,
      question.decisionId === null
        ? evidenceDraft
        : { ...evidenceDraft, decisionId: question.decisionId },
    );
    if (question.decisionId !== null) {
      updateDecisionFromAnswer(db, question.decisionId, answer, question.id);
    } else {
      insertDecision(db, question.taskId, {
        title: question.text,
        kind: 'EXPLICIT',
        status: 'CONFIRMED',
        confidence: 1,
        summary: answer,
        rationale: [`User answered ${question.id}.`],
        sourceRefs: [`USER_ANSWER:${question.id}`, evidence.id],
      });
    }
    appendEvent(db, {
      taskId: question.taskId,
      type: 'QUESTION_ANSWERED',
      payload: { questionId: question.id, answer },
    });
    const updated = getQuestion(db, question.id);
    if (updated === null) {
      throw new Error(`Question not found after answer: ${question.id}`);
    }
    maybeMarkBriefReadyInDb(db, question.taskId);
    return { question: updated, answer };
  } finally {
    db.close();
  }
}

function resolveAnswer(question: Question, input: { optionIndex?: number; text?: string }): string {
  if (input.text !== undefined && input.text.trim() !== '') return input.text.trim();
  if (input.optionIndex !== undefined) {
    if (input.optionIndex < 1 || input.optionIndex > question.options.length) {
      throw new Error(`Option index out of range: ${String(input.optionIndex)}`);
    }
    const option = question.options[input.optionIndex - 1];
    if (option === undefined) {
      throw new Error(`Option index out of range: ${String(input.optionIndex)}`);
    }
    if (option === '추천안 사용') return question.recommendedAnswer;
    return option;
  }
  throw new Error('Provide --option or --text.');
}
