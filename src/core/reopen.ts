import { copyFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';

import { ensureDirectory, getFsEntryKind } from './fs.js';
import { assertTransition, refreshAgentContextBestEffort } from './task-lifecycle.js';
import {
  parseTaskMeta,
  readTaskMeta,
  renderTaskMeta,
  reopenMeta,
  writeTaskMeta,
} from './task-meta.js';
import { resolveTaskTarget } from './task-target.js';

import type { WorkspaceTaskSummary } from './workspace.js';

export interface ReopenCommandInput {
  target?: string;
}

export interface ReopenResult {
  newCycle: number;
  // Legacy SDD task status (e.g. IN_PROGRESS, PENDING_SPEC_APPROVAL) derived
  // from the persisted meta -- not the v2 decision TaskStatus.
  newStatus: string;
  previousCycle: number;
  snapshots: string[];
  taskId: string;
}

export function getCurrentCycle(metaContent: string): number {
  return parseTaskMeta(metaContent).cycle ?? 1;
}

export function buildReopenedMeta(metaContent: string, newCycle: number): string {
  return renderTaskMeta(reopenMeta(parseTaskMeta(metaContent), newCycle));
}

export function filterReopenCandidates(
  tasks: readonly WorkspaceTaskSummary[],
): WorkspaceTaskSummary[] {
  return tasks.filter((task) => task.status === 'DONE' || task.status === 'REVIEW_READY');
}

export async function snapshotHistoryFiles(
  taskDir: string,
  currentCycle: number,
): Promise<string[]> {
  const historyDir = join(taskDir, 'history');
  const created: string[] = [];

  const filesToSnapshot = ['spec.md', 'plan.md'];
  const snapshotPaths: { dest: string; source: string }[] = [];

  // Check for conflicts and determine which files to snapshot
  for (const fileName of filesToSnapshot) {
    const sourcePath = join(taskDir, fileName);

    if ((await getFsEntryKind(sourcePath)) !== 'file') {
      continue;
    }

    const destName = `${String(currentCycle)}_${fileName}`;
    const destPath = join(historyDir, destName);

    if ((await getFsEntryKind(destPath)) !== 'missing') {
      throw new Error(`History snapshot already exists: ${destPath}`);
    }

    snapshotPaths.push({ dest: destPath, source: sourcePath });
  }

  if (snapshotPaths.length === 0) {
    return [];
  }

  // Create history directory
  await ensureDirectory(historyDir);

  // Copy files with rollback on failure
  try {
    for (const { dest, source } of snapshotPaths) {
      await copyFile(source, dest);
      created.push(dest);
    }
  } catch (error) {
    // Rollback: delete any files we created
    for (const path of created) {
      try {
        await unlink(path);
      } catch {
        // Best effort rollback
      }
    }

    throw error;
  }

  return created;
}

export async function runReopenWorkflow(
  projectRoot: string,
  task: WorkspaceTaskSummary,
): Promise<ReopenResult> {
  assertTransition(task.status, 'reopen', task.id);
  const taskDir = join(projectRoot, task.path);
  const metaPath = join(taskDir, 'meta.yml');

  const meta = await readTaskMeta(metaPath);
  const currentCycle = meta.cycle ?? 1;
  const newCycle = currentCycle + 1;

  const isReviewReady = task.status === 'REVIEW_READY';

  // Snapshot history files only for DONE tasks (REVIEW_READY preserves spec/plan)
  const snapshots = isReviewReady ? [] : await snapshotHistoryFiles(taskDir, currentCycle);

  const reopenedMeta = reopenMeta(meta, newCycle);

  try {
    await writeTaskMeta(metaPath, reopenedMeta);
  } catch (error) {
    // Rollback snapshots
    for (const path of snapshots) {
      try {
        await unlink(path);
      } catch {
        // Best effort rollback
      }
    }

    throw error;
  }

  await refreshAgentContextBestEffort(projectRoot, task.id);

  return {
    newCycle,
    newStatus: reopenedMeta.status,
    previousCycle: currentCycle,
    snapshots,
    taskId: task.id,
  };
}

export async function loadReopenTarget(
  projectRoot: string,
  input: ReopenCommandInput,
): Promise<WorkspaceTaskSummary> {
  return await resolveTaskTarget(projectRoot, {
    allowedStatuses: ['DONE', 'REVIEW_READY'],
    commandName: 'reopen',
    fallback: 'all',
    target: input.target,
  });
}
