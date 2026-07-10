import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';

import type { GitBaseline } from '../../types/index.js';

const NON_IMPLEMENTATION_PREFIXES = [
  '.decision/',
  '.sduck/',
  '.sduck-worktrees/',
  'node_modules/',
  'dist/',
  'build/',
  'coverage/',
  'out/',
  '.next/',
  'test/workspaces/',
] as const;

export function captureGitBaseline(projectRoot: string): GitBaseline {
  try {
    assertGitWorkTree(projectRoot);
  } catch {
    return { head: null, dirtyFileHashes: {} };
  }
  const head = runGitOptional(projectRoot, ['rev-parse', 'HEAD']);
  const dirtyFiles = listCurrentChanges(projectRoot, head);
  return {
    head,
    dirtyFileHashes: Object.fromEntries(
      dirtyFiles.map((file) => [file, hashWorkingFile(projectRoot, file)]),
    ),
  };
}

export function listChangedFiles(
  projectRoot: string,
  base?: string,
  baseline?: GitBaseline,
): string[] {
  assertGitWorkTree(projectRoot);
  const comparisonBase = base ?? baseline?.head ?? null;
  const files = listCurrentChanges(projectRoot, comparisonBase);
  if (base !== undefined || baseline === undefined) return files;

  return files.filter((file) => {
    if (!(file in baseline.dirtyFileHashes)) return true;
    return baseline.dirtyFileHashes[file] !== hashWorkingFile(projectRoot, file);
  });
}

function listCurrentChanges(projectRoot: string, comparisonBase: string | null): string[] {
  const files = new Set<string>();
  if (comparisonBase === null) {
    addFiles(files, runGit(projectRoot, ['diff', '--name-only', '--']));
    addFiles(files, runGit(projectRoot, ['diff', '--name-only', '--cached', '--']));
  } else {
    addFiles(files, runGit(projectRoot, ['diff', '--name-only', comparisonBase, '--']));
  }
  addFiles(files, runGit(projectRoot, ['ls-files', '--others', '--exclude-standard', '--']));
  return [...files].filter(isImplementationPath).sort();
}

function addFiles(output: Set<string>, files: string[]): void {
  for (const file of files) {
    const normalized = file.replaceAll('\\', '/').replace(/^\.\//, '');
    if (normalized !== '') output.add(normalized);
  }
}

function isImplementationPath(file: string): boolean {
  return !NON_IMPLEMENTATION_PREFIXES.some(
    (prefix) => file === prefix.slice(0, -1) || file.startsWith(prefix),
  );
}

function hashWorkingFile(projectRoot: string, file: string): string | null {
  const absolutePath = path.join(projectRoot, file);
  try {
    const stat = fs.lstatSync(absolutePath);
    if (stat.isSymbolicLink()) {
      return createHash('sha256').update(fs.readlinkSync(absolutePath)).digest('hex');
    }
    if (!stat.isFile()) return null;
    return createHash('sha256').update(fs.readFileSync(absolutePath)).digest('hex');
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null;
    throw error;
  }
}

function assertGitWorkTree(projectRoot: string): void {
  runGit(projectRoot, ['rev-parse', '--is-inside-work-tree']);
}

function runGitOptional(projectRoot: string, args: string[]): string | null {
  try {
    return runGit(projectRoot, args)[0] ?? null;
  } catch {
    return null;
  }
}

function runGit(projectRoot: string, args: string[]): string[] {
  try {
    const output = execFileSync('git', args, {
      cwd: projectRoot,
      encoding: 'utf8',
      env: isolatedGitEnv(),
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
    return output === '' ? [] : output.split('\n').map((line) => line.trim());
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`git ${args.join(' ')} failed: ${message}`);
  }
}

function isolatedGitEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  delete env['GIT_DIR'];
  delete env['GIT_WORK_TREE'];
  delete env['GIT_INDEX_FILE'];
  delete env['GIT_PREFIX'];
  return env;
}
