import * as fs from 'node:fs';
import * as path from 'node:path';

import { DecisionWorkspace, recoverInterruptedDecisionWorkspace } from './decision-workspace.js';
import { V2ExpectedError } from './errors.js';
import {
  buildMemorySourceCatalog,
  memoryReferenceProblems,
  type MemoryReferenceProblem,
} from './memory-source.js';
import { dbPath, decisionRoot } from './paths.js';
import { rebuildDecisionCache } from './rebuild.js';
import {
  listMemorySourceFiles,
  loadSourceBundle,
  sourceFileCount,
  sourceFingerprint,
} from './source-store.js';
import { readState, setCurrentTaskId, validateDecisionState } from './state.js';
import { cacheHasRows, getCacheMetadata, openDatabase } from './store.js';
import { withDecisionWorkspaceLock } from './workspace-lock.js';

import type { SourceBundle } from './source-types.js';

export interface DoctorIssue {
  code:
    | 'CACHE_STALE'
    | 'DB_ONLY'
    | 'INVALID_STATE'
    | 'INTERRUPTED_JOURNAL_RECOVERY_FAILED'
    | 'MALFORMED_SOURCE'
    | 'MISSING_CURRENT_TASK_POINTER'
    | 'ORPHANED_MEMORY_CAPSULE'
    | 'STALE_TERMINAL_TASK_POINTER';
  message: string;
  recovery: string;
  params: Record<string, string>;
}

export interface DoctorRepair {
  code:
    | 'INTERRUPTED_COMMIT'
    | 'DB_ONLY_MIGRATED'
    | 'CACHE_REBUILT'
    | 'MEMORY_CAPSULE_QUARANTINED'
    | 'TERMINAL_TASK_POINTER_CLEARED';
  params: Record<string, string>;
}

export interface DoctorResult {
  healthy: boolean;
  issues: DoctorIssue[];
  repaired: DoctorRepair[];
}

export function doctorDecisionWorkspace(
  projectRoot: string,
  options: { repair?: boolean } = {},
): DoctorResult {
  const issues: DoctorIssue[] = [];
  const repaired: DoctorRepair[] = [];
  try {
    if (recoverInterruptedDecisionWorkspace(projectRoot)) {
      repaired.push({ code: 'INTERRUPTED_COMMIT', params: {} });
    }
  } catch (error) {
    issues.push({
      code: 'INTERRUPTED_JOURNAL_RECOVERY_FAILED',
      message: error instanceof Error ? error.message : String(error),
      recovery:
        'Preserve the .commit-*.json journal and rollback directory, then inspect with `sduck doctor`.',
      params: { detail: error instanceof Error ? error.message : String(error) },
    });
    return { healthy: false, issues, repaired };
  }
  const sourceCount = sourceFileCount(projectRoot);

  if (sourceCount === 0 && cacheHasRows(projectRoot)) {
    if (options.repair === true) {
      new DecisionWorkspace(projectRoot).mutate(() => undefined);
      repaired.push({ code: 'DB_ONLY_MIGRATED', params: {} });
    } else {
      issues.push({
        code: 'DB_ONLY',
        message: 'Workspace contains decision data only in the legacy SQLite cache.',
        recovery: 'Run `sduck doctor --repair` or `sduck remember` to create canonical source.',
        params: {},
      });
    }
    return { healthy: issues.length === 0, issues, repaired };
  }

  let bundle: SourceBundle;
  try {
    bundle = loadSourceBundle(projectRoot);
    const stateIssue = diagnoseState(projectRoot, bundle);
    if (stateIssue !== null) {
      if (options.repair === true) {
        if (
          stateIssue.code === 'STALE_TERMINAL_TASK_POINTER' &&
          clearTerminalTaskPointer(projectRoot)
        ) {
          repaired.push({
            code: 'TERMINAL_TASK_POINTER_CLEARED',
            params: { taskId: stateIssue.params['taskId'] ?? '' },
          });
        } else {
          issues.push(stateIssue);
          return { healthy: false, issues, repaired };
        }
      } else {
        issues.push(stateIssue);
        return { healthy: false, issues, repaired };
      }
    }
  } catch (error) {
    issues.push({
      code: 'MALFORMED_SOURCE',
      message: error instanceof Error ? error.message : String(error),
      recovery: 'Fix the malformed source file, then run `sduck rebuild`.',
      params: sourceIssueParams(error),
    });
    return { healthy: false, issues, repaired };
  }

  const invalidMemories = findInvalidMemoryCapsules(bundle);
  if (invalidMemories.length > 0) {
    if (options.repair === true) {
      const quarantined = quarantineInvalidMemoryCapsules(
        projectRoot,
        invalidMemories.map((item) => item.memoryId),
      );
      for (const item of quarantined) {
        repaired.push({
          code: 'MEMORY_CAPSULE_QUARANTINED',
          params: { memoryId: item.memoryId, path: item.path },
        });
      }
      rebuildDecisionCache(projectRoot);
    } else {
      for (const item of invalidMemories) {
        issues.push({
          code: 'ORPHANED_MEMORY_CAPSULE',
          message: `Memory capsule ${item.memoryId} has invalid canonical source references.`,
          recovery: 'Run `sduck doctor --repair` to quarantine the capsule and rebuild the cache.',
          params: { memoryId: item.memoryId, reasons: item.reasons.join(',') },
        });
      }
      return { healthy: false, issues, repaired };
    }
  }

  if (sourceCount > 0 && cacheNeedsRebuild(projectRoot)) {
    if (options.repair === true) {
      rebuildDecisionCache(projectRoot);
      repaired.push({ code: 'CACHE_REBUILT', params: {} });
    } else {
      issues.push({
        code: 'CACHE_STALE',
        message: 'Local SQLite cache is missing or does not match canonical source.',
        recovery: 'Run `sduck rebuild` or `sduck doctor --repair`.',
        params: {},
      });
    }
  }

  return { healthy: issues.length === 0, issues, repaired };
}

function findInvalidMemoryCapsules(
  bundle: SourceBundle,
): { memoryId: string; reasons: MemoryReferenceProblem['reason'][] }[] {
  const catalog = buildMemorySourceCatalog(bundle);
  return bundle.memoryCapsules.flatMap((memory) => {
    const reasons = [
      ...new Set(memoryReferenceProblems(bundle, memory, catalog).map((problem) => problem.reason)),
    ];
    return reasons.length === 0 ? [] : [{ memoryId: memory.id, reasons }];
  });
}

function quarantineInvalidMemoryCapsules(
  projectRoot: string,
  memoryIds: readonly string[],
): { memoryId: string; path: string }[] {
  return withDecisionWorkspaceLock(projectRoot, () => {
    const bundle = loadSourceBundle(projectRoot);
    const invalidIds = new Set(findInvalidMemoryCapsules(bundle).map((item) => item.memoryId));
    const requestedIds = new Set(memoryIds.filter((memoryId) => invalidIds.has(memoryId)));
    const sources = listMemorySourceFiles(projectRoot).filter((source) =>
      requestedIds.has(source.document.memory.id),
    );
    const quarantineRoot = path.join(decisionRoot(projectRoot), 'quarantine', 'memories');
    fs.mkdirSync(quarantineRoot, { recursive: true });
    return sources.map((source) => {
      const memoryId = source.document.memory.id;
      const target = availableQuarantinePath(quarantineRoot, path.basename(source.path));
      fs.renameSync(source.path, target);
      return {
        memoryId,
        path: path.relative(projectRoot, target).split(path.sep).join('/'),
      };
    });
  });
}

function availableQuarantinePath(directory: string, basename: string): string {
  const extension = path.extname(basename);
  const stem = basename.slice(0, basename.length - extension.length);
  let candidate = path.join(directory, basename);
  let suffix = 2;
  while (fs.existsSync(candidate)) {
    candidate = path.join(directory, `${stem}-${String(suffix)}${extension}`);
    suffix += 1;
  }
  return candidate;
}

function diagnoseState(
  projectRoot: string,
  bundle = loadSourceBundle(projectRoot),
): DoctorIssue | null {
  let state: ReturnType<typeof readState>;
  try {
    state = readState(projectRoot);
    validateDecisionState(state, bundle);
  } catch (error) {
    return stateIssue(error);
  }
  return null;
}

function clearTerminalTaskPointer(projectRoot: string): boolean {
  return withDecisionWorkspaceLock(projectRoot, () => {
    const issue = diagnoseState(projectRoot);
    if (issue?.code !== 'STALE_TERMINAL_TASK_POINTER') return false;
    setCurrentTaskId(projectRoot, null);
    return true;
  });
}

function stateIssue(error: unknown): DoctorIssue {
  const params = expectedErrorParams(error);
  if (error instanceof V2ExpectedError && error.code === 'STATE_INVALID') {
    if (params['problemCode'] === 'terminal-task') {
      const taskId = params['taskId'] ?? '';
      return {
        code: 'STALE_TERMINAL_TASK_POINTER',
        message: `State currentTaskId references terminal canonical task ${taskId}.`,
        recovery: 'Run `sduck doctor --repair` to clear the stale current task pointer.',
        params,
      };
    }
    if (params['problemCode'] === 'missing-task') {
      const taskId = params['taskId'] ?? '';
      return {
        code: 'MISSING_CURRENT_TASK_POINTER',
        message: `State currentTaskId references missing canonical task ${taskId}.`,
        recovery:
          'Inspect .decision/state.json and canonical tasks; repair manually before retrying.',
        params,
      };
    }
  }
  return {
    code: 'INVALID_STATE',
    message: `Decision state is invalid: ${error instanceof Error ? error.message : String(error)}.`,
    recovery: 'Fix .decision/state.json manually, then rerun `sduck doctor`.',
    params: {
      ...params,
      detail: error instanceof Error ? error.message : String(error),
      code: error instanceof V2ExpectedError ? error.code : 'UNKNOWN',
    },
  };
}

function expectedErrorParams(error: unknown): Record<string, string> {
  if (!(error instanceof V2ExpectedError)) {
    return { detail: error instanceof Error ? error.message : String(error) };
  }
  return Object.fromEntries(
    Object.entries(error.params).map(([key, value]) => [key, String(value)]),
  );
}

function sourceIssueParams(error: unknown): Record<string, string> {
  if (typeof error === 'object' && error !== null && 'params' in error) {
    const params = (error as { params?: Record<string, string | number | boolean> }).params ?? {};
    return Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)]));
  }
  return { detail: error instanceof Error ? error.message : String(error) };
}

function cacheNeedsRebuild(projectRoot: string): boolean {
  if (!fs.existsSync(dbPath(projectRoot))) return true;
  const db = openDatabase(projectRoot);
  try {
    return getCacheMetadata(db, 'source_fingerprint') !== sourceFingerprint(projectRoot);
  } finally {
    db.close();
  }
}

export function formatDoctorResult(result: DoctorResult): string {
  if (result.healthy) {
    return [
      'Decision workspace is healthy.',
      ...result.repaired.map((item) => `Repaired: ${item.code}`),
    ].join('\n');
  }
  return [
    'Decision workspace has problems:',
    ...result.issues.flatMap((issue) => [
      `- [${issue.code}] ${issue.message}`,
      `  Recovery: ${issue.recovery}`,
    ]),
  ].join('\n');
}
