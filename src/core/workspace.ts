import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

import { getFsEntryKind } from './fs.js';
import {
  getProjectRelativeSduckWorkspacePath,
  getProjectSduckWorkspacePath,
} from './project-paths.js';

export interface ActiveTaskSummary {
  id: string;
  path: string;
  status: string;
}

export interface WorkspaceTaskSummary {
  baseBranch?: string;
  branch?: string;
  createdAt?: string;
  id: string;
  path: string;
  slug?: string;
  status: string;
  type?: string;
  updatedAt?: string;
  worktreePath?: string;
}

const ACTIVE_STATUSES = new Set([
  'IN_PROGRESS',
  'PENDING_SPEC_APPROVAL',
  'PENDING_PLAN_APPROVAL',
  'REVIEW_READY',
]);

export interface ParsedMeta {
  baseBranch?: string;
  branch?: string;
  createdAt?: string;
  id?: string;
  slug?: string;
  status?: string;
  type?: string;
  updatedAt?: string;
  worktreePath?: string;
}

function setIfNotNull(meta: ParsedMeta, key: keyof ParsedMeta, value: string | undefined): void {
  if (value !== undefined) {
    const trimmed = value.trim();

    if (trimmed !== 'null') {
      meta[key] = trimmed;
    }
  }
}

export function parseMetaText(content: string): ParsedMeta {
  const createdAtMatch = /^created_at:[ \t]+(.+)$/m.exec(content);
  const idMatch = /^id:[ \t]+(.+)$/m.exec(content);
  const slugMatch = /^slug:[ \t]+(.+)$/m.exec(content);
  const statusMatch = /^status:[ \t]+(.+)$/m.exec(content);
  const typeMatch = /^type:[ \t]+(.+)$/m.exec(content);
  const branchMatch = /^branch:[ \t]+(.+)$/m.exec(content);
  const baseBranchMatch = /^base_branch:[ \t]+(.+)$/m.exec(content);
  const worktreePathMatch = /^worktree_path:[ \t]+(.+)$/m.exec(content);
  const updatedAtMatch = /^updated_at:[ \t]+(.+)$/m.exec(content);
  const parsedMeta: ParsedMeta = {};

  if (createdAtMatch?.[1] !== undefined) {
    parsedMeta.createdAt = createdAtMatch[1].trim();
  }

  if (idMatch?.[1] !== undefined) {
    parsedMeta.id = idMatch[1].trim();
  }

  if (slugMatch?.[1] !== undefined) {
    parsedMeta.slug = slugMatch[1].trim();
  }

  if (statusMatch?.[1] !== undefined) {
    parsedMeta.status = statusMatch[1].trim();
  }

  if (typeMatch?.[1] !== undefined) {
    parsedMeta.type = typeMatch[1].trim();
  }

  setIfNotNull(parsedMeta, 'branch', branchMatch?.[1]);
  setIfNotNull(parsedMeta, 'baseBranch', baseBranchMatch?.[1]);
  setIfNotNull(parsedMeta, 'worktreePath', worktreePathMatch?.[1]);
  setIfNotNull(parsedMeta, 'updatedAt', updatedAtMatch?.[1]);

  return parsedMeta;
}

export function sortTasksByRecency(tasks: readonly WorkspaceTaskSummary[]): WorkspaceTaskSummary[] {
  return [...tasks].sort((left, right) => {
    const leftValue = left.createdAt ?? '';
    const rightValue = right.createdAt ?? '';

    return rightValue.localeCompare(leftValue);
  });
}

async function readTaskFromEntry(
  projectRoot: string,
  dirName: string,
): Promise<WorkspaceTaskSummary | null> {
  const relativePath = getProjectRelativeSduckWorkspacePath(dirName);
  const metaPath = join(projectRoot, relativePath, 'meta.yml');

  if ((await getFsEntryKind(metaPath)) !== 'file') {
    return null;
  }

  const parsedMeta = parseMetaText(await readFile(metaPath, 'utf8'));

  if (parsedMeta.id === undefined || parsedMeta.status === undefined) {
    return null;
  }

  const task: WorkspaceTaskSummary = {
    id: parsedMeta.id,
    path: relativePath,
    status: parsedMeta.status,
  };

  if (parsedMeta.createdAt !== undefined) {
    task.createdAt = parsedMeta.createdAt;
  }

  if (parsedMeta.slug !== undefined) {
    task.slug = parsedMeta.slug;
  }

  if (parsedMeta.type !== undefined) {
    task.type = parsedMeta.type;
  }

  if (parsedMeta.branch !== undefined) {
    task.branch = parsedMeta.branch;
  }

  if (parsedMeta.baseBranch !== undefined) {
    task.baseBranch = parsedMeta.baseBranch;
  }

  if (parsedMeta.worktreePath !== undefined) {
    task.worktreePath = parsedMeta.worktreePath;
  }

  if (parsedMeta.updatedAt !== undefined) {
    task.updatedAt = parsedMeta.updatedAt;
  }

  return task;
}

export async function listWorkspaceTasks(projectRoot: string): Promise<WorkspaceTaskSummary[]> {
  const workspaceRoot = getProjectSduckWorkspacePath(projectRoot);

  if ((await getFsEntryKind(workspaceRoot)) !== 'directory') {
    return [];
  }

  const entries = await readdir(workspaceRoot, { withFileTypes: true });
  const dirNames = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);

  const results = await Promise.allSettled(
    dirNames.map((dirName) => readTaskFromEntry(projectRoot, dirName)),
  );

  const tasks: WorkspaceTaskSummary[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value !== null) {
      tasks.push(result.value);
    }
  }

  return sortTasksByRecency(tasks);
}

/** @deprecated Use readCurrentWorkId() + listWorkspaceTasks() instead. */
export async function findActiveTask(projectRoot: string): Promise<ActiveTaskSummary | null> {
  const workspaceRoot = getProjectSduckWorkspacePath(projectRoot);

  if ((await getFsEntryKind(workspaceRoot)) !== 'directory') {
    return null;
  }

  const entries = await readdir(workspaceRoot, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const relativePath = getProjectRelativeSduckWorkspacePath(entry.name);
    const metaPath = join(projectRoot, relativePath, 'meta.yml');

    if ((await getFsEntryKind(metaPath)) !== 'file') {
      continue;
    }

    const content = await readFile(metaPath, 'utf8');
    const statusMatch = /^status:[ \t]+(.+)$/m.exec(content);
    const status = statusMatch?.[1]?.trim();

    if (status !== undefined && ACTIVE_STATUSES.has(status)) {
      const idMatch = /^id:[ \t]+(.+)$/m.exec(content);

      return {
        id: idMatch?.[1]?.trim() ?? entry.name,
        path: relativePath,
        status,
      };
    }
  }

  return null;
}
