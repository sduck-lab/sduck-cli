export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export function ok(stdout = ''): CommandResult {
  return { stdout, stderr: '', exitCode: 0 };
}

export function fail(stderr: string, exitCode = 1): CommandResult {
  return { stdout: '', stderr, exitCode };
}
