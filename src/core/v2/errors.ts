export type V2ExpectedErrorCode =
  | 'NO_CURRENT_TASK'
  | 'TASK_NOT_FOUND'
  | 'TASK_STATUS_NOT_ALLOWED'
  | 'GRILL_ME_REQUIRED'
  | 'CONFIRM_OPEN_QUESTIONS'
  | 'CONFIRM_UNRESOLVED_DECISIONS'
  | 'CONFIRM_BRIEF_NOT_READY'
  | 'DRAFT_JSON_INVALID'
  | 'DRAFT_FENCE_MISSING'
  | 'DRAFT_TASK_MISMATCH'
  | 'DRAFT_SCHEMA'
  | 'DRAFT_FIELD'
  | 'DRAFT_DECISION_KIND'
  | 'DRAFT_CONFIDENCE'
  | 'QUESTION_NOT_FOUND'
  | 'QUESTION_TASK_MISMATCH'
  | 'QUESTION_ALREADY_ANSWERED'
  | 'QUESTION_OPTION_RANGE'
  | 'QUESTION_ANSWER_REQUIRED'
  | 'CONTEXT_NO_MATCHES'
  | 'PATH_OUTSIDE_PROJECT'
  | 'ARTIFACT_PATH_INVALID'
  | 'ARTIFACT_PATH_OUTSIDE_WORKSPACE'
  | 'ARTIFACT_PATH_RESERVED'
  | 'WORKSPACE_LOCKED'
  | 'SOURCE_DB_ONLY'
  | 'SOURCE_PARSE'
  | 'SOURCE_VALIDATION'
  | 'POLICY_JSON_INVALID'
  | 'POLICY_INVALID'
  | 'STATE_JSON_INVALID'
  | 'STATE_INVALID'
  | 'REMEMBER_NO_RECORDS';

export type V2ExpectedErrorParams = Record<string, string | number | boolean>;

export class V2ExpectedError extends Error {
  constructor(
    readonly code: V2ExpectedErrorCode,
    readonly params: V2ExpectedErrorParams = {},
    detail?: string,
  ) {
    super(detail ?? code);
    this.name = 'V2ExpectedError';
  }
}

export function isV2ExpectedError(error: unknown): error is V2ExpectedError {
  return error instanceof V2ExpectedError;
}

export function noCurrentTask(): V2ExpectedError {
  return new V2ExpectedError('NO_CURRENT_TASK');
}

export function taskNotFound(taskId: string): V2ExpectedError {
  return new V2ExpectedError('TASK_NOT_FOUND', { taskId });
}
