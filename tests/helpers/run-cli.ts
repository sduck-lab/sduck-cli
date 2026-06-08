import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export interface RunCliResult {
  exitCode: number;
  stderr: string;
  stdout: string;
}

export interface RunCliOptions {
  cliRoot: string;
  cwd: string;
  input?: string;
}

async function resolveRepoLocalTsxBinary(cliRoot: string): Promise<string> {
  const tsxBinaryName = process.platform === 'win32' ? 'tsx.cmd' : 'tsx';
  let currentDir = cliRoot;

  for (;;) {
    const candidate = join(currentDir, 'node_modules', '.bin', tsxBinaryName);
    try {
      await access(candidate);
      return candidate;
    } catch {
      const parentDir = dirname(currentDir);
      if (parentDir === currentDir) {
        throw new Error(`Could not find ${tsxBinaryName} from ${cliRoot}`);
      }
      currentDir = parentDir;
    }
  }
}

export async function resolveRepoLocalCliEntrypoint(
  cliRoot: string,
): Promise<{ cliEntrypoint: string; tsxBinaryPath: string }> {
  const cliEntrypoint = join(cliRoot, 'src', 'cli.ts');
  const tsxBinaryPath = await resolveRepoLocalTsxBinary(cliRoot);

  await access(cliEntrypoint);

  return { cliEntrypoint, tsxBinaryPath };
}

export async function runCli(args: string[], options: RunCliOptions): Promise<RunCliResult> {
  const { cliEntrypoint, tsxBinaryPath } = await resolveRepoLocalCliEntrypoint(options.cliRoot);

  return await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [tsxBinaryPath, cliEntrypoint, ...args], {
      cwd: options.cwd,
      env: process.env,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    if (options.input !== undefined) {
      child.stdin.end(options.input);
    } else {
      child.stdin.end();
    }

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
