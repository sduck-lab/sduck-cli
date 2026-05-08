import { join } from 'node:path';

import { getFsEntryKind } from './fs.js';
import { readCurrentWorkId, writeCurrentWorkId } from './state.js';
import {
  assertTransition,
  getAllowedStatuses,
  refreshAgentContextBestEffort,
} from './task-lifecycle.js';
import { abandonMeta, patchTaskMeta } from './task-meta.js';
import { resolveTaskTarget } from './task-target.js';

import type { WorkspaceTaskSummary } from './workspace.js';

const ABANDONABLE_STATUSES = getAllowedStatuses('abandon');

export async function resolveAbandonTarget(
  projectRoot: string,
  target: string,
): Promise<WorkspaceTaskSummary> {
  return await resolveTaskTarget(projectRoot, {
    allowedStatuses: ABANDONABLE_STATUSES,
    commandName: 'abandon',
    fallback: 'none',
    target,
  });
}

export async function runAbandonWorkflow(
  projectRoot: string,
  target: string,
  date = new Date(),
): Promise<{ workId: string }> {
  const work = await resolveAbandonTarget(projectRoot, target);
  assertTransition(work.status, 'abandon', work.id);
  const metaPath = join(projectRoot, work.path, 'meta.yml');

  if ((await getFsEntryKind(metaPath)) !== 'file') {
    throw new Error(`Missing meta.yml for work ${work.id}.`);
  }

  await patchTaskMeta(metaPath, (meta) => abandonMeta(meta, date));
  await refreshAgentContextBestEffort(projectRoot, work.id);

  // Clear current work if this was the current one
  const currentWorkId = await readCurrentWorkId(projectRoot);

  if (currentWorkId === work.id) {
    await writeCurrentWorkId(projectRoot, null, date);
  }

  return { workId: work.id };
}
