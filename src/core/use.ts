import { writeCurrentWorkId } from './state.js';
import { resolveTaskTarget } from './task-target.js';

import type { WorkspaceTaskSummary } from './workspace.js';

export async function resolveUseTarget(
  projectRoot: string,
  target: string,
): Promise<WorkspaceTaskSummary> {
  return await resolveTaskTarget(projectRoot, {
    commandName: 'use',
    fallback: 'none',
    target,
  });
}

export async function runUseWorkflow(
  projectRoot: string,
  target: string,
): Promise<{ workId: string }> {
  const work = await resolveUseTarget(projectRoot, target);
  await writeCurrentWorkId(projectRoot, work.id);

  return { workId: work.id };
}
