export const CLI_NAME = 'sduck';

export const CLI_DESCRIPTION = 'Spec-Driven Development workflow bootstrap CLI';

export const PLACEHOLDER_MESSAGE =
  'Core workflow commands are planned but not implemented in this bootstrap yet.';

export function normalizeCommandName(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, '-');
}
