import { readFile, rename } from 'node:fs/promises';
import { join } from 'node:path';

import { ensureDirectory, getFsEntryKind } from './fs.js';
import { getProjectSduckArchivePath } from './project-paths.js';
import { listWorkspaceTasks, type WorkspaceTaskSummary } from './workspace.js';

export interface ArchiveCommandInput {
  keep?: number;
}

export interface ArchiveTarget {
  completedAt: string;
  id: string;
  month: string;
  path: string;
  slug?: string | undefined;
}

export interface ArchiveSuccessRow {
  month: string;
  taskId: string;
}

export interface ArchiveSkipRow {
  reason: string;
  taskId: string;
}

export interface ArchiveResult {
  archived: ArchiveSuccessRow[];
  skipped: ArchiveSkipRow[];
}

export function extractCompletedAt(metaContent: string): string | null {
  const match = /^completed_at:\s+(.+)$/m.exec(metaContent);
  const value = match?.[1]?.trim();

  if (value === undefined || value === 'null') {
    return null;
  }

  return value;
}

export function deriveArchiveMonth(completedAt: string): string {
  return completedAt.slice(0, 7);
}

export function filterArchiveCandidates(
  tasks: readonly WorkspaceTaskSummary[],
): WorkspaceTaskSummary[] {
  return tasks.filter((task) => task.status === 'DONE');
}

export async function isAlreadyArchived(
  archivePath: string,
  taskDirName: string,
): Promise<boolean> {
  const targetPath = join(archivePath, taskDirName);
  return (await getFsEntryKind(targetPath)) === 'directory';
}

export async function loadArchiveTargets(
  projectRoot: string,
  input: ArchiveCommandInput,
): Promise<ArchiveTarget[]> {
  const tasks = await listWorkspaceTasks(projectRoot);
  const doneTasks = filterArchiveCandidates(tasks);
  const targets: ArchiveTarget[] = [];

  for (const task of doneTasks) {
    const metaPath = join(projectRoot, task.path, 'meta.yml');
    const metaContent = await readFile(metaPath, 'utf8');
    const completedAt = extractCompletedAt(metaContent);

    if (completedAt === null) {
      continue;
    }

    targets.push({
      completedAt,
      id: task.id,
      month: deriveArchiveMonth(completedAt),
      path: task.path,
      slug: task.slug,
    });
  }

  targets.sort((a, b) => a.completedAt.localeCompare(b.completedAt));

  const keep = input.keep ?? 0;

  if (keep > 0 && targets.length > keep) {
    return targets.slice(0, targets.length - keep);
  }

  return targets;
}

export async function runArchiveWorkflow(
  projectRoot: string,
  targets: readonly ArchiveTarget[],
): Promise<ArchiveResult> {
  const archiveRoot = getProjectSduckArchivePath(projectRoot);
  const archived: ArchiveSuccessRow[] = [];
  const skipped: ArchiveSkipRow[] = [];

  for (const target of targets) {
    const monthDir = join(archiveRoot, target.month);
    await ensureDirectory(monthDir);

    const segments = target.path.split('/');
    const taskDirName = segments.at(-1) ?? target.id;

    if (await isAlreadyArchived(monthDir, taskDirName)) {
      skipped.push({ reason: 'already archived', taskId: target.id });
      continue;
    }

    const sourcePath = join(projectRoot, target.path);
    const destPath = join(monthDir, taskDirName);

    await rename(sourcePath, destPath);
    archived.push({ month: target.month, taskId: target.id });
  }

  return { archived, skipped };
}
