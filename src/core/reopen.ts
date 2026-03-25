import { copyFile, readFile, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { writeAgentContext } from './agent-context.js';
import { ensureDirectory, getFsEntryKind } from './fs.js';
import { listWorkspaceTasks, type WorkspaceTaskSummary } from './workspace.js';

export interface ReopenCommandInput {
  target?: string;
}

export interface ReopenResult {
  newCycle: number;
  previousCycle: number;
  snapshots: string[];
  taskId: string;
}

export function getCurrentCycle(metaContent: string): number {
  const match = /^cycle:[ \t]+(\d+)$/m.exec(metaContent);

  if (match?.[1] === undefined) {
    return 1;
  }

  return Number(match[1]);
}

export function buildReopenedMeta(metaContent: string, newCycle: number): string {
  let result = metaContent;

  // Update or insert cycle field
  if (/^cycle:\s+/m.test(result)) {
    result = result.replace(/^cycle:\s+.+$/m, `cycle: ${String(newCycle)}`);
  } else {
    result = result.replace(/^(status:\s+.+)$/m, `cycle: ${String(newCycle)}\n\n$1`);
  }

  // Reset status
  result = result.replace(/^status:\s+.+$/m, 'status: PENDING_SPEC_APPROVAL');

  // Reset spec approval
  result = result.replace(
    /spec:\n {2}approved:\s+.+\n {2}approved_at:\s+.+/m,
    'spec:\n  approved: false\n  approved_at: null',
  );

  // Reset plan approval
  result = result.replace(
    /plan:\n {2}approved:\s+.+\n {2}approved_at:\s+.+/m,
    'plan:\n  approved: false\n  approved_at: null',
  );

  // Reset steps
  result = result.replace(
    /steps:\n {2}total:\s+.+\n {2}completed:\s+.+/m,
    'steps:\n  total: null\n  completed: []',
  );

  // Reset completed_at
  result = result.replace(/^completed_at:\s+.+$/m, 'completed_at: null');

  return result;
}

export function filterReopenCandidates(
  tasks: readonly WorkspaceTaskSummary[],
): WorkspaceTaskSummary[] {
  return tasks.filter((task) => task.status === 'DONE');
}

function formatCandidateList(candidates: readonly WorkspaceTaskSummary[]): string {
  return candidates
    .map((task) => `  - ${task.id}${task.slug !== undefined ? ` (${task.slug})` : ''}`)
    .join('\n');
}

export function resolveReopenTarget(
  tasks: readonly WorkspaceTaskSummary[],
  target?: string,
): WorkspaceTaskSummary {
  const candidates = filterReopenCandidates(tasks);

  if (candidates.length === 0) {
    throw new Error('No DONE tasks found to reopen.');
  }

  if (target === undefined || target.trim() === '') {
    if (candidates.length === 1) {
      const [candidate] = candidates;

      if (candidate === undefined) {
        throw new Error('No DONE tasks found to reopen.');
      }

      return candidate;
    }

    throw new Error(
      `Multiple DONE tasks found. Specify a target:\n${formatCandidateList(candidates)}`,
    );
  }

  const trimmedTarget = target.trim();

  // id exact match first
  const idMatch = candidates.filter((task) => task.id === trimmedTarget);

  if (idMatch.length === 1) {
    const [match] = idMatch;

    if (match === undefined) {
      throw new Error(`No DONE task found matching '${trimmedTarget}'.`);
    }

    return match;
  }

  // slug exact match
  const slugMatch = candidates.filter((task) => task.slug === trimmedTarget);

  if (slugMatch.length === 1) {
    const [match] = slugMatch;

    if (match === undefined) {
      throw new Error(`No DONE task found matching '${trimmedTarget}'.`);
    }

    return match;
  }

  if (slugMatch.length > 1) {
    throw new Error(
      `Multiple DONE tasks match slug '${trimmedTarget}':\n${formatCandidateList(slugMatch)}`,
    );
  }

  throw new Error(`No DONE task found matching '${trimmedTarget}'.`);
}

export async function snapshotHistoryFiles(
  taskDir: string,
  currentCycle: number,
): Promise<string[]> {
  const historyDir = join(taskDir, 'history');
  const created: string[] = [];

  const filesToSnapshot = ['spec.md', 'plan.md'];
  const snapshotPaths: { dest: string; source: string }[] = [];

  // Check for conflicts and determine which files to snapshot
  for (const fileName of filesToSnapshot) {
    const sourcePath = join(taskDir, fileName);

    if ((await getFsEntryKind(sourcePath)) !== 'file') {
      continue;
    }

    const destName = `${String(currentCycle)}_${fileName}`;
    const destPath = join(historyDir, destName);

    if ((await getFsEntryKind(destPath)) !== 'missing') {
      throw new Error(`History snapshot already exists: ${destPath}`);
    }

    snapshotPaths.push({ dest: destPath, source: sourcePath });
  }

  if (snapshotPaths.length === 0) {
    return [];
  }

  // Create history directory
  await ensureDirectory(historyDir);

  // Copy files with rollback on failure
  try {
    for (const { dest, source } of snapshotPaths) {
      await copyFile(source, dest);
      created.push(dest);
    }
  } catch (error) {
    // Rollback: delete any files we created
    for (const path of created) {
      try {
        await unlink(path);
      } catch {
        // Best effort rollback
      }
    }

    throw error;
  }

  return created;
}

export async function runReopenWorkflow(
  projectRoot: string,
  task: WorkspaceTaskSummary,
): Promise<ReopenResult> {
  const taskDir = join(projectRoot, task.path);
  const metaPath = join(taskDir, 'meta.yml');

  const metaContent = await readFile(metaPath, 'utf8');
  const currentCycle = getCurrentCycle(metaContent);
  const newCycle = currentCycle + 1;

  // Snapshot history files (handles its own rollback on failure)
  const snapshots = await snapshotHistoryFiles(taskDir, currentCycle);

  // Update meta (rollback snapshots if meta write fails)
  const updatedMeta = buildReopenedMeta(metaContent, newCycle);

  try {
    await writeFile(metaPath, updatedMeta, 'utf8');
  } catch (error) {
    // Rollback snapshots
    for (const path of snapshots) {
      try {
        await unlink(path);
      } catch {
        // Best effort rollback
      }
    }

    throw error;
  }

  try {
    await writeAgentContext(projectRoot, task.id);
  } catch {
    // non-fatal
  }

  return {
    newCycle,
    previousCycle: currentCycle,
    snapshots,
    taskId: task.id,
  };
}

export async function loadReopenTarget(
  projectRoot: string,
  input: ReopenCommandInput,
): Promise<WorkspaceTaskSummary> {
  const tasks = await listWorkspaceTasks(projectRoot);
  return resolveReopenTarget(tasks, input.target);
}
