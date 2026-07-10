import * as fs from 'node:fs';

import { DecisionWorkspace } from './decision-workspace.js';
import { dbPath } from './paths.js';
import { rebuildDecisionCache } from './rebuild.js';
import { loadSourceBundle, sourceFileCount, sourceFingerprint } from './source-store.js';
import { cacheHasRows, getCacheMetadata, openDatabase } from './store.js';

export interface DoctorIssue {
  code: 'CACHE_STALE' | 'DB_ONLY' | 'MALFORMED_SOURCE';
  message: string;
  recovery: string;
}

export interface DoctorResult {
  healthy: boolean;
  issues: DoctorIssue[];
  repaired: string[];
}

export function doctorDecisionWorkspace(
  projectRoot: string,
  options: { repair?: boolean } = {},
): DoctorResult {
  const issues: DoctorIssue[] = [];
  const repaired: string[] = [];
  const sourceCount = sourceFileCount(projectRoot);

  if (sourceCount === 0 && cacheHasRows(projectRoot)) {
    if (options.repair === true) {
      new DecisionWorkspace(projectRoot).mutate(() => undefined);
      repaired.push('Migrated DB-only cache to canonical Markdown source.');
    } else {
      issues.push({
        code: 'DB_ONLY',
        message: 'Workspace contains decision data only in the legacy SQLite cache.',
        recovery: 'Run `sduck doctor --repair` or `sduck remember` to create canonical source.',
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
    });
    return { healthy: false, issues, repaired };
  }

  if (sourceCount > 0 && cacheNeedsRebuild(projectRoot)) {
    if (options.repair === true) {
      rebuildDecisionCache(projectRoot);
      repaired.push('Rebuilt the local SQLite cache from canonical Markdown source.');
    } else {
      issues.push({
        code: 'CACHE_STALE',
        message: 'Local SQLite cache is missing or does not match canonical source.',
        recovery: 'Run `sduck rebuild` or `sduck doctor --repair`.',
      });
    }
  }

  return { healthy: issues.length === 0, issues, repaired };
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
      ...result.repaired.map((item) => `Repaired: ${item}`),
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
