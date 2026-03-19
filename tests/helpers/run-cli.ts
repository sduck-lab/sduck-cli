import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import { join } from 'node:path';

export interface RunCliResult {
  exitCode: number;
  stderr: string;
  stdout: string;
}

export interface RunCliOptions {
  cliRoot: string;
  cwd: string;
}

async function resolveRepoLocalCliEntrypoint(
  cliRoot: string,
): Promise<{ cliEntrypoint: string; tsxBinaryPath: string }> {
  const tsxBinaryName = process.platform === 'win32' ? 'tsx.cmd' : 'tsx';
  const tsxBinaryPath = join(cliRoot, 'node_modules', '.bin', tsxBinaryName);
  const cliEntrypoint = join(cliRoot, 'src', 'cli.ts');

  await access(tsxBinaryPath);
  await access(cliEntrypoint);

  return { cliEntrypoint, tsxBinaryPath };
}

export async function runCli(args: string[], options: RunCliOptions): Promise<RunCliResult> {
  const { cliEntrypoint, tsxBinaryPath } = await resolveRepoLocalCliEntrypoint(options.cliRoot);

  return await new Promise((resolve, reject) => {
    const child = spawn(tsxBinaryPath, [cliEntrypoint, ...args], {
      cwd: options.cwd,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      resolve({
        exitCode: code ?? 1,
        stderr,
        stdout,
      });
    });
  });
}
