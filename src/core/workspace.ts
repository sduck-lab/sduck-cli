import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { getFsEntryKind } from './fs.js';

export interface ActiveTaskSummary {
  id: string;
  path: string;
  status: string;
}

export interface WorkspaceTaskSummary {
  createdAt?: string;
  id: string;
  path: string;
  slug?: string;
  status: string;
}

const ACTIVE_STATUSES = new Set(['IN_PROGRESS', 'PENDING_SPEC_APPROVAL', 'PENDING_PLAN_APPROVAL']);

interface ParsedMeta {
  createdAt?: string;
  id?: string;
  slug?: string;
  status?: string;
}

function parseMetaText(content: string): ParsedMeta {
  const createdAtMatch = /^created_at:\s+(.+)$/m.exec(content);
  const idMatch = /^id:\s+(.+)$/m.exec(content);
  const slugMatch = /^slug:\s+(.+)$/m.exec(content);
  const statusMatch = /^status:\s+(.+)$/m.exec(content);
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

  return parsedMeta;
}

export function sortTasksByRecency(tasks: readonly WorkspaceTaskSummary[]): WorkspaceTaskSummary[] {
  return [...tasks].sort((left, right) => {
    const leftValue = left.createdAt ?? '';
    const rightValue = right.createdAt ?? '';

    return rightValue.localeCompare(leftValue);
  });
}

export async function listWorkspaceTasks(projectRoot: string): Promise<WorkspaceTaskSummary[]> {
  const workspaceRoot = join(projectRoot, 'sduck-workspace');

  if ((await getFsEntryKind(workspaceRoot)) !== 'directory') {
    return [];
  }

  const { readdir } = await import('node:fs/promises');
  const entries = await readdir(workspaceRoot, { withFileTypes: true });
  const tasks: WorkspaceTaskSummary[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const relativePath = join('sduck-workspace', entry.name);
    const metaPath = join(projectRoot, relativePath, 'meta.yml');

    if ((await getFsEntryKind(metaPath)) !== 'file') {
      continue;
    }

    const parsedMeta = parseMetaText(await readFile(metaPath, 'utf8'));

    if (parsedMeta.id !== undefined && parsedMeta.status !== undefined) {
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

      tasks.push(task);
    }
  }

  return sortTasksByRecency(tasks);
}

export async function findActiveTask(projectRoot: string): Promise<ActiveTaskSummary | null> {
  const tasks = await listWorkspaceTasks(projectRoot);

  for (const task of tasks) {
    if (ACTIVE_STATUSES.has(task.status)) {
      return {
        id: task.id,
        path: task.path,
        status: task.status,
      };
    }
  }

  return null;
}
