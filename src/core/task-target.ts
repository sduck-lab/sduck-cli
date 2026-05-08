import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

import { getFsEntryKind } from './fs.js';
import { getProjectSduckArchivePath } from './project-paths.js';
import { readCurrentWorkId, throwNoCurrentWorkError } from './state.js';
import { parseTaskMeta } from './task-meta.js';
import { listWorkspaceTasks, type WorkspaceTaskSummary } from './workspace.js';

export type TargetFallback = 'all' | 'current' | 'current-or-all' | 'none';
export type TargetCardinality = 'many' | 'one';

export interface ResolveTaskTargetOptions {
  allowedStatuses?: readonly string[];
  cardinality: TargetCardinality;
  commandName: string;
  fallback: TargetFallback;
  includeArchive?: boolean | undefined;
  target?: string | undefined;
}

function formatTargetList(tasks: readonly WorkspaceTaskSummary[]): string {
  return tasks.map((task) => task.id).join(', ');
}

async function readArchiveTasks(projectRoot: string): Promise<WorkspaceTaskSummary[]> {
  const archivePath = getProjectSduckArchivePath(projectRoot);

  if ((await getFsEntryKind(archivePath)) !== 'directory') return [];

  const months = await readdir(archivePath, { withFileTypes: true });
  const tasks: WorkspaceTaskSummary[] = [];

  for (const month of months) {
    if (!month.isDirectory()) continue;

    const monthPath = join(archivePath, month.name);
    const entries = await readdir(monthPath, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const metaPath = join(monthPath, entry.name, 'meta.yml');
      if ((await getFsEntryKind(metaPath)) !== 'file') continue;

      try {
        const meta = parseTaskMeta(await readFile(metaPath, 'utf8'));
        const task: WorkspaceTaskSummary = {
          id: meta.id,
          path: join('.sduck/sduck-archive', month.name, entry.name),
          status: meta.status,
        };
        if (meta.baseBranch !== null) task.baseBranch = meta.baseBranch;
        if (meta.branch !== null) task.branch = meta.branch;
        if (meta.createdAt !== '') task.createdAt = meta.createdAt;
        if (meta.slug !== '') task.slug = meta.slug;
        if (meta.type !== '') task.type = meta.type;
        if (meta.updatedAt !== '') task.updatedAt = meta.updatedAt;
        if (meta.worktreePath !== null) task.worktreePath = meta.worktreePath;
        tasks.push(task);
      } catch {
        // Invalid archived meta is ignored like invalid workspace meta.
      }
    }
  }

  return tasks;
}

async function loadResolvableTasks(
  projectRoot: string,
  includeArchive: boolean,
): Promise<WorkspaceTaskSummary[]> {
  const tasks = await listWorkspaceTasks(projectRoot);
  if (!includeArchive) return tasks;
  return [...tasks, ...(await readArchiveTasks(projectRoot))];
}

function matchByTarget(
  tasks: readonly WorkspaceTaskSummary[],
  target: string,
  commandName: string,
  cardinality: TargetCardinality,
): WorkspaceTaskSummary[] {
  const trimmed = target.trim();
  const idMatch = tasks.find((task) => task.id === trimmed);
  if (idMatch !== undefined) return [idMatch];

  const slugMatches = tasks.filter((task) => task.slug === trimmed);
  if (slugMatches.length === 1 || (cardinality === 'many' && slugMatches.length > 1)) {
    return slugMatches;
  }

  if (slugMatches.length > 1) {
    throw new Error(
      `Multiple works match slug '${trimmed}': ${formatTargetList(slugMatches)}. Use \`sduck ${commandName} <id>\` to specify.`,
    );
  }

  throw new Error(`No work matches '${trimmed}'.`);
}

function filterAllowed(
  tasks: readonly WorkspaceTaskSummary[],
  allowedStatuses: readonly string[] | undefined,
): WorkspaceTaskSummary[] {
  if (allowedStatuses === undefined) return [...tasks];
  const allowed = new Set(allowedStatuses);
  return tasks.filter((task) => allowed.has(task.status));
}

function assertAllowed(
  task: WorkspaceTaskSummary,
  allowedStatuses: readonly string[] | undefined,
  commandName: string,
): void {
  if (allowedStatuses === undefined || allowedStatuses.includes(task.status)) return;
  throw new Error(
    `Cannot ${commandName} work ${task.id}: status is ${task.status}. Expected: ${allowedStatuses.join(', ')}.`,
  );
}

export async function resolveTaskTargets(
  projectRoot: string,
  options: ResolveTaskTargetOptions,
): Promise<WorkspaceTaskSummary[]> {
  const tasks = await loadResolvableTasks(projectRoot, options.includeArchive === true);

  if (options.target !== undefined && options.target.trim() !== '') {
    const matches = matchByTarget(tasks, options.target, options.commandName, options.cardinality);
    return options.cardinality === 'many'
      ? filterAllowed(matches, options.allowedStatuses)
      : matches.map((task) => {
          assertAllowed(task, options.allowedStatuses, options.commandName);
          return task;
        });
  }

  if (options.fallback === 'none') return [];

  if (options.fallback === 'all') {
    return filterAllowed(tasks, options.allowedStatuses);
  }

  const currentWorkId = await readCurrentWorkId(projectRoot);

  if (currentWorkId === null) {
    if (options.fallback === 'current-or-all') {
      return filterAllowed(tasks, options.allowedStatuses);
    }

    throwNoCurrentWorkError(options.commandName);
  }

  const matches = matchByTarget(tasks, currentWorkId, options.commandName, options.cardinality);
  return options.cardinality === 'many'
    ? filterAllowed(matches, options.allowedStatuses)
    : matches.map((task) => {
        assertAllowed(task, options.allowedStatuses, options.commandName);
        return task;
      });
}

export async function resolveTaskTarget(
  projectRoot: string,
  options: Omit<ResolveTaskTargetOptions, 'cardinality'>,
): Promise<WorkspaceTaskSummary> {
  const matches = await resolveTaskTargets(projectRoot, { ...options, cardinality: 'one' });

  if (matches.length === 0) {
    throw new Error(`No work matches target for ${options.commandName}.`);
  }

  if (matches.length > 1) {
    throw new Error(
      `Multiple works match target for ${options.commandName}: ${formatTargetList(matches)}. Use an exact task id.`,
    );
  }

  const [match] = matches;
  if (match === undefined) throw new Error(`No work matches target for ${options.commandName}.`);
  return match;
}
