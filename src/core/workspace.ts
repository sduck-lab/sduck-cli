import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { getFsEntryKind } from './fs.js';

export interface ActiveTaskSummary {
  id: string;
  path: string;
  status: string;
}

const ACTIVE_STATUSES = new Set(['IN_PROGRESS', 'PENDING_SPEC_APPROVAL', 'PENDING_PLAN_APPROVAL']);

interface ParsedMeta {
  id?: string;
  status?: string;
}

function parseMetaText(content: string): ParsedMeta {
  const idMatch = /^id:\s+(.+)$/m.exec(content);
  const statusMatch = /^status:\s+(.+)$/m.exec(content);
  const parsedMeta: ParsedMeta = {};

  if (idMatch?.[1] !== undefined) {
    parsedMeta.id = idMatch[1].trim();
  }

  if (statusMatch?.[1] !== undefined) {
    parsedMeta.status = statusMatch[1].trim();
  }

  return parsedMeta;
}

export async function findActiveTask(projectRoot: string): Promise<ActiveTaskSummary | null> {
  const workspaceRoot = join(projectRoot, 'sduck-workspace');

  if ((await getFsEntryKind(workspaceRoot)) !== 'directory') {
    return null;
  }

  const { readdir } = await import('node:fs/promises');
  const entries = await readdir(workspaceRoot, { withFileTypes: true });

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

    if (
      parsedMeta.id !== undefined &&
      parsedMeta.status !== undefined &&
      ACTIVE_STATUSES.has(parsedMeta.status)
    ) {
      return {
        id: parsedMeta.id,
        path: relativePath,
        status: parsedMeta.status,
      };
    }
  }

  return null;
}
