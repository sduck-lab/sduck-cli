import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

import { getFsEntryKind } from './fs.js';
import { deleteBranch, isBranchMerged, removeWorktree } from './git.js';
import { getProjectSduckArchivePath, getProjectSduckWorkspacePath } from './project-paths.js';
import { parseMetaText, type WorkspaceTaskSummary } from './workspace.js';

export interface CleanCandidate {
  baseBranch: string | null;
  branch: string | null;
  id: string;
  path: string;
  worktreePath: string | null;
}

export interface CleanSuccessRow {
  branchDeleted: boolean;
  note: string;
  workId: string;
  worktreeRemoved: boolean;
}

export interface CleanResult {
  cleaned: CleanSuccessRow[];
}

const CLEANABLE_STATUSES = new Set(['DONE', 'ABANDONED']);

async function readTasksFromDirectory(
  _projectRoot: string,
  dirPath: string,
  relativeDirPath: string,
): Promise<WorkspaceTaskSummary[]> {
  if ((await getFsEntryKind(dirPath)) !== 'directory') {
    return [];
  }

  const entries = await readdir(dirPath, { withFileTypes: true });
  const tasks: WorkspaceTaskSummary[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const metaPath = join(dirPath, entry.name, 'meta.yml');

    if ((await getFsEntryKind(metaPath)) !== 'file') {
      continue;
    }

    const content = await readFile(metaPath, 'utf8');
    const meta = parseMetaText(content);

    if (meta.id !== undefined && meta.status !== undefined) {
      const task: WorkspaceTaskSummary = {
        id: meta.id,
        path: join(relativeDirPath, entry.name),
        status: meta.status,
      };

      if (meta.baseBranch !== undefined) task.baseBranch = meta.baseBranch;
      if (meta.branch !== undefined) task.branch = meta.branch;
      if (meta.slug !== undefined) task.slug = meta.slug;
      if (meta.worktreePath !== undefined) task.worktreePath = meta.worktreePath;

      tasks.push(task);
    }
  }

  return tasks;
}

async function readArchiveTasks(projectRoot: string): Promise<WorkspaceTaskSummary[]> {
  const archivePath = getProjectSduckArchivePath(projectRoot);

  if ((await getFsEntryKind(archivePath)) !== 'directory') {
    return [];
  }

  const months = await readdir(archivePath, { withFileTypes: true });
  const tasks: WorkspaceTaskSummary[] = [];

  for (const month of months) {
    if (!month.isDirectory()) {
      continue;
    }

    const monthPath = join(archivePath, month.name);
    const relativePath = join('.sduck/sduck-archive', month.name);
    const monthTasks = await readTasksFromDirectory(projectRoot, monthPath, relativePath);
    tasks.push(...monthTasks);
  }

  return tasks;
}

export async function resolveCleanCandidates(
  projectRoot: string,
  target?: string,
): Promise<CleanCandidate[]> {
  if (target !== undefined && target.trim() !== '') {
    const trimmed = target.trim();
    const workspacePath = getProjectSduckWorkspacePath(projectRoot);
    const workspaceTasks = await readTasksFromDirectory(
      projectRoot,
      workspacePath,
      '.sduck/sduck-workspace',
    );
    const archiveTasks = await readArchiveTasks(projectRoot);
    const allTasks = [...workspaceTasks, ...archiveTasks];

    // id exact match first
    const idMatch = allTasks.find((task) => task.id === trimmed);

    if (idMatch !== undefined) {
      if (!CLEANABLE_STATUSES.has(idMatch.status)) {
        throw new Error(
          `Cannot clean work ${idMatch.id}: status is ${idMatch.status}. Only DONE or ABANDONED works can be cleaned.`,
        );
      }

      return [toCleanCandidate(idMatch)];
    }

    // slug exact match across workspace + archive
    const slugMatches = allTasks.filter((task) => task.slug === trimmed);

    if (slugMatches.length === 1) {
      const match = slugMatches[0];

      if (match === undefined) {
        throw new Error(`No work matches '${trimmed}'.`);
      }

      if (!CLEANABLE_STATUSES.has(match.status)) {
        throw new Error(
          `Cannot clean work ${match.id}: status is ${match.status}. Only DONE or ABANDONED works can be cleaned.`,
        );
      }

      return [toCleanCandidate(match)];
    }

    if (slugMatches.length > 1) {
      const candidates = slugMatches.map((task) => task.id).join(', ');
      throw new Error(
        `Multiple works match slug '${trimmed}': ${candidates}. Use \`sduck clean <id>\` to specify.`,
      );
    }

    throw new Error(`No work matches '${trimmed}'.`);
  }

  // No target: workspace DONE/ABANDONED only
  const workspacePath = getProjectSduckWorkspacePath(projectRoot);
  const tasks = await readTasksFromDirectory(projectRoot, workspacePath, '.sduck/sduck-workspace');

  return tasks.filter((task) => CLEANABLE_STATUSES.has(task.status)).map(toCleanCandidate);
}

function toCleanCandidate(task: WorkspaceTaskSummary): CleanCandidate {
  return {
    baseBranch: task.baseBranch ?? null,
    branch: task.branch ?? null,
    id: task.id,
    path: task.path,
    worktreePath: task.worktreePath ?? null,
  };
}

export async function runCleanWorkflow(
  projectRoot: string,
  target?: string,
  force = false,
): Promise<CleanResult> {
  const candidates = await resolveCleanCandidates(projectRoot, target);
  const cleaned: CleanSuccessRow[] = [];

  for (const candidate of candidates) {
    // 1. branch/baseBranch null → skip all git steps
    if (candidate.branch === null || candidate.baseBranch === null) {
      cleaned.push({
        branchDeleted: false,
        note: 'no git resources to clean (--no-git work)',
        workId: candidate.id,
        worktreeRemoved: false,
      });
      continue;
    }

    // 2. merge check
    const merged = await isBranchMerged(candidate.branch, candidate.baseBranch, projectRoot);

    // 3. worktree removal
    let worktreeRemoved = false;

    if (candidate.worktreePath !== null) {
      const absoluteWorktreePath = join(projectRoot, candidate.worktreePath);

      if ((await getFsEntryKind(absoluteWorktreePath)) === 'missing') {
        // Warn but continue to branch deletion
        // eslint-disable-next-line no-console
        console.warn(
          `Warning: worktree path ${candidate.worktreePath} does not exist for work ${candidate.id}.`,
        );
      } else {
        // Fail-fast: if removal fails, abort entire clean
        await removeWorktree(absoluteWorktreePath, projectRoot);
        worktreeRemoved = true;
      }
    }

    // 4. branch deletion
    let branchDeleted = false;

    if (merged) {
      await deleteBranch(candidate.branch, false, projectRoot);
      branchDeleted = true;
    } else if (force) {
      await deleteBranch(candidate.branch, true, projectRoot);
      branchDeleted = true;
    } else {
      // eslint-disable-next-line no-console
      console.warn(
        `Warning: branch ${candidate.branch} is not merged into ${candidate.baseBranch}. Use --force to delete.`,
      );
    }

    cleaned.push({
      branchDeleted,
      note: merged
        ? 'cleaned (merged)'
        : force
          ? 'cleaned (forced)'
          : 'worktree removed, branch kept',
      workId: candidate.id,
      worktreeRemoved,
    });
  }

  return { cleaned };
}
