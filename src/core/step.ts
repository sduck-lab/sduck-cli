import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { writeAgentContext } from './agent-context.js';
import { getFsEntryKind } from './fs.js';
import { getProjectRelativeSduckWorkspacePath } from './project-paths.js';
import { readCurrentWorkId, throwNoCurrentWorkError } from './state.js';
import { resolveUseTarget } from './use.js';
import { parseMetaText } from './workspace.js';
import { formatUtcTimestamp } from '../utils/utc-date.js';

export interface StepResult {
  alreadyCompleted: boolean;
  completed: number[];
  stepNumber: number;
  total: number;
  workId: string;
}

export interface StepsBlock {
  completed: number[];
  total: number | null;
}

export function parseStepsBlock(metaContent: string): StepsBlock {
  const totalMatch = /^ {2}total:[ \t]+(.+)$/m.exec(metaContent);
  const completedMatch = /^ {2}completed:[ \t]+\[(.*)\]$/m.exec(metaContent);

  if (totalMatch?.[1] === undefined || completedMatch?.[1] === undefined) {
    throw new Error('Meta is missing a valid steps block.');
  }

  const totalRaw = totalMatch[1].trim();
  let total: number | null = null;

  if (totalRaw !== 'null') {
    const parsed = Number.parseInt(totalRaw, 10);

    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new Error(`Invalid steps.total value: ${totalRaw}`);
    }

    total = parsed;
  }

  const completedRaw = completedMatch[1].trim();
  let completed: number[] = [];

  if (completedRaw !== '') {
    completed = completedRaw.split(',').map((segment) => {
      const parsed = Number.parseInt(segment.trim(), 10);

      if (!Number.isInteger(parsed)) {
        throw new Error(`Invalid completed step value: ${segment.trim()}`);
      }

      return parsed;
    });
  }

  return { completed, total };
}

export function updateStepsCompleted(
  metaContent: string,
  completedSteps: number[],
  date = new Date(),
): string {
  const sorted = [...completedSteps].sort((a, b) => a - b);
  const completedStr = sorted.length === 0 ? '' : sorted.join(', ');

  const withCompleted = metaContent.replace(
    /^ {2}completed:[ \t]+\[.*\]$/m,
    `  completed: [${completedStr}]`,
  );

  return withCompleted.replace(/^updated_at:[ \t]+.+$/m, `updated_at: ${formatUtcTimestamp(date)}`);
}

export async function markStepCompleted(
  projectRoot: string,
  stepNumber: number,
  target?: string,
  date = new Date(),
): Promise<StepResult> {
  let workId: string;

  if (target !== undefined) {
    const work = await resolveUseTarget(projectRoot, target);
    workId = work.id;
  } else {
    const currentWorkId = await readCurrentWorkId(projectRoot);

    if (currentWorkId === null) {
      throwNoCurrentWorkError('step done');
    }

    workId = currentWorkId;
  }

  const workspacePath = getProjectRelativeSduckWorkspacePath(workId);
  const metaPath = join(projectRoot, workspacePath, 'meta.yml');

  if ((await getFsEntryKind(metaPath)) !== 'file') {
    throw new Error(
      `Current work ${workId} not found in workspace. It may have been archived or removed.`,
    );
  }

  const metaContent = await readFile(metaPath, 'utf8');
  const meta = parseMetaText(metaContent);

  if (meta.status !== 'IN_PROGRESS') {
    throw new Error(
      `Work ${workId} is in ${meta.status ?? 'UNKNOWN'} state. Only IN_PROGRESS works can record step completion.`,
    );
  }

  const steps = parseStepsBlock(metaContent);

  if (steps.total === null) {
    throw new Error('Steps not initialized. Run `sduck plan approve` first.');
  }

  if (stepNumber < 1 || stepNumber > steps.total) {
    throw new Error(`Step ${String(stepNumber)} is out of range (1-${String(steps.total)}).`);
  }

  const alreadyCompleted = steps.completed.includes(stepNumber);

  if (!alreadyCompleted) {
    steps.completed.push(stepNumber);
  }

  const updatedMeta = updateStepsCompleted(metaContent, steps.completed, date);
  await writeFile(metaPath, updatedMeta, 'utf8');

  try {
    await writeAgentContext(projectRoot, workId);
  } catch {
    // non-fatal
  }

  const sorted = [...steps.completed].sort((a, b) => a - b);

  return {
    alreadyCompleted,
    completed: sorted,
    stepNumber,
    total: steps.total,
    workId,
  };
}
