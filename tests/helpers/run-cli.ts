import { spawn } from 'node:child_process';
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

export async function runCli(args: string[], options: RunCliOptions): Promise<RunCliResult> {
  return await new Promise((resolve, reject) => {
    const tsxBinaryName = process.platform === 'win32' ? 'tsx.cmd' : 'tsx';
    const tsxBinaryPath = join(options.cliRoot, 'node_modules', '.bin', tsxBinaryName);

    const child = spawn(tsxBinaryPath, [join(options.cliRoot, 'src/cli.ts'), ...args], {
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
