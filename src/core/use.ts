import { writeCurrentWorkId } from './state.js';
import { listWorkspaceTasks, type WorkspaceTaskSummary } from './workspace.js';

export async function resolveUseTarget(
  projectRoot: string,
  target: string,
): Promise<WorkspaceTaskSummary> {
  const tasks = await listWorkspaceTasks(projectRoot);
  const trimmed = target.trim();

  // id exact match first
  const idMatch = tasks.find((task) => task.id === trimmed);

  if (idMatch !== undefined) {
    return idMatch;
  }

  // slug exact match
  const slugMatches = tasks.filter((task) => task.slug === trimmed);

  if (slugMatches.length === 1) {
    const match = slugMatches[0];

    if (match !== undefined) {
      return match;
    }
  }

  if (slugMatches.length > 1) {
    const candidates = slugMatches.map((task) => task.id).join(', ');
    throw new Error(
      `Multiple works match slug '${trimmed}': ${candidates}. Use \`sduck use <id>\` to specify.`,
    );
  }

  throw new Error(`No work matches '${trimmed}'.`);
}

export async function runUseWorkflow(
  projectRoot: string,
  target: string,
): Promise<{ workId: string }> {
  const work = await resolveUseTarget(projectRoot, target);
  await writeCurrentWorkId(projectRoot, work.id);

  return { workId: work.id };
}
