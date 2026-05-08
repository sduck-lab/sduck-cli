export interface CommandResult {
  exitCode: number;
  stderr: string;
  stdout: string;
}

export function ok(stdout: string): CommandResult {
  return { exitCode: 0, stderr: '', stdout };
}

export function fail(stderr: string): CommandResult {
  return { exitCode: 1, stderr, stdout: '' };
}

export function formatError(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export async function runCommand(
  handler: () => Promise<string> | string,
  fallbackError: string,
): Promise<CommandResult> {
  try {
    return ok(await handler());
  } catch (error) {
    return fail(formatError(error, fallbackError));
  }
}

function padCell(value: string, width: number): string {
  return value.padEnd(width, ' ');
}

export function renderTable(
  headers: readonly string[],
  rows: readonly (readonly string[])[],
): string {
  const widths = headers.map((header, index) =>
    Math.max(header.length, ...rows.map((row) => row[index]?.length ?? 0)),
  );
  const border = `+-${widths.map((width) => '-'.repeat(width)).join('-+-')}-+`;
  const header = `| ${headers.map((value, index) => padCell(value, widths[index] ?? value.length)).join(' | ')} |`;
  const body = rows.map(
    (row) =>
      `| ${row.map((value, index) => padCell(value, widths[index] ?? value.length)).join(' | ')} |`,
  );

  return [border, header, border, ...body, border].join('\n');
}
