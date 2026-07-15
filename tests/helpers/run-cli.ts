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
  stdin?: string;
  env?: NodeJS.ProcessEnv;
}

async function resolveRepoLocalCliEntrypoint(
  cliRoot: string,
): Promise<{ cliEntrypoint: string; tsxLoaderPath: string }> {
  const tsxLoaderPath = join(cliRoot, 'node_modules', 'tsx', 'dist', 'loader.mjs');
  const cliEntrypoint = join(cliRoot, 'src', 'cli.ts');

  await access(tsxLoaderPath);
  await access(cliEntrypoint);

  return { cliEntrypoint, tsxLoaderPath };
}

export async function runCli(args: string[], options: RunCliOptions): Promise<RunCliResult> {
  const { cliEntrypoint, tsxLoaderPath } = await resolveRepoLocalCliEntrypoint(options.cliRoot);

  return await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['--import', tsxLoaderPath, cliEntrypoint, ...args], {
      cwd: options.cwd,
      env: {
        ...process.env,
        SDUCK_CONFIG_HOME: join(options.cwd, '.sduck-test-config'),
        ...options.env,
      },
      stdio: ['pipe', 'pipe', 'pipe'],
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

    child.stdin.end(options.stdin ?? '');
  });
}
