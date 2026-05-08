import { join } from 'node:path';

import { getFsEntryKind } from './fs.js';
import { assertTransition, refreshAgentContextBestEffort } from './task-lifecycle.js';
import { completeStepInMeta, patchTaskMeta, readTaskMeta } from './task-meta.js';
import { resolveTaskTarget } from './task-target.js';

export interface StepResult {
  alreadyCompleted: boolean;
  completed: number[];
  stepNumber: number;
  total: number;
  workId: string;
}

export async function markStepCompleted(
  projectRoot: string,
  stepNumber: number,
  target?: string,
  date = new Date(),
): Promise<StepResult> {
  const work = await resolveTaskTarget(projectRoot, {
    commandName: 'step done',
    fallback: 'current',
    target,
  });
  const workId = work.id;
  const workspacePath = work.path;
  const metaPath = join(projectRoot, workspacePath, 'meta.yml');

  if ((await getFsEntryKind(metaPath)) !== 'file') {
    throw new Error(
      `Current work ${workId} not found in workspace. It may have been archived or removed.`,
    );
  }

  const meta = await readTaskMeta(metaPath);

  try {
    assertTransition(meta.status, 'record-step', workId);
  } catch {
    throw new Error(
      `Work ${workId} is in ${meta.status} state. Only IN_PROGRESS works can record step completion.`,
    );
  }

  const steps = meta.steps;

  if (steps.total === null) {
    throw new Error('Steps not initialized. Run `sduck plan approve` first.');
  }

  if (stepNumber < 1 || stepNumber > steps.total) {
    throw new Error(`Step ${String(stepNumber)} is out of range (1-${String(steps.total)}).`);
  }

  const alreadyCompleted = steps.completed.includes(stepNumber);

  if (!alreadyCompleted) {
    await patchTaskMeta(metaPath, (currentMeta) =>
      completeStepInMeta(currentMeta, stepNumber, date),
    );
  }

  await refreshAgentContextBestEffort(projectRoot, workId);

  const completed = alreadyCompleted
    ? steps.completed
    : [...new Set([...steps.completed, stepNumber])];
  const sorted = [...completed].sort((a, b) => a - b);

  return {
    alreadyCompleted,
    completed: sorted,
    stepNumber,
    total: steps.total,
    workId,
  };
}
