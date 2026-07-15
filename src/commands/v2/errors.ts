export type V2ErrorCode =
  'INVALID_LOCALE' | 'NO_DRAFT_STDIN' | 'USE_STDIN' | 'ANSWER_INPUT_CONFLICT' | 'NO_CURRENT_TASK';

export class V2CommandError extends Error {
  constructor(
    readonly code: V2ErrorCode,
    readonly params: Record<string, string | number> = {},
  ) {
    super(code);
    this.name = 'V2CommandError';
  }
}

export function isV2CommandError(error: unknown): error is V2CommandError {
  return error instanceof V2CommandError;
}
