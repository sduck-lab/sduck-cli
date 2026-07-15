import * as fs from 'node:fs';

import { DecisionWorkspace, recoverInterruptedDecisionWorkspace } from './decision-workspace.js';
import { dbPath } from './paths.js';
import { rebuildDecisionCache } from './rebuild.js';
import { loadSourceBundle, sourceFileCount, sourceFingerprint } from './source-store.js';
import { cacheHasRows, getCacheMetadata, openDatabase } from './store.js';

export interface DoctorIssue {
  code: 'CACHE_STALE' | 'DB_ONLY' | 'INTERRUPTED_JOURNAL_RECOVERY_FAILED' | 'MALFORMED_SOURCE';
  message: string;
  recovery: string;
  params: Record<string, string>;
}

export interface DoctorRepair {
  code: 'INTERRUPTED_COMMIT' | 'DB_ONLY_MIGRATED' | 'CACHE_REBUILT';
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

  try {
    loadSourceBundle(projectRoot);
  } catch (error) {
    issues.push({
      code: 'MALFORMED_SOURCE',
      message: error instanceof Error ? error.message : String(error),
      recovery: 'Fix the malformed source file, then run `sduck rebuild`.',
      params: sourceIssueParams(error),
    });
    return { healthy: false, issues, repaired };
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
