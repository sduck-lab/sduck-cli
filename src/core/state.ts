import { readFile, writeFile } from 'node:fs/promises';

import { getFsEntryKind } from './fs.js';
import { getProjectSduckStatePath } from './project-paths.js';
import { formatUtcTimestamp } from '../utils/utc-date.js';

export async function readCurrentWorkId(projectRoot: string): Promise<string | null> {
  const statePath = getProjectSduckStatePath(projectRoot);

  if ((await getFsEntryKind(statePath)) !== 'file') {
    return null;
  }

  const content = await readFile(statePath, 'utf8');
  const match = /^current_work_id:[ \t]+(.+)$/m.exec(content);
  const value = match?.[1]?.trim();

  if (value === undefined || value === 'null') {
    return null;
  }

  return value;
}

export async function writeCurrentWorkId(
  projectRoot: string,
  workId: string | null,
  date = new Date(),
): Promise<void> {
  const statePath = getProjectSduckStatePath(projectRoot);
  const idValue = workId ?? 'null';
  const content = `current_work_id: ${idValue}\nupdated_at: ${formatUtcTimestamp(date)}\n`;

  await writeFile(statePath, content, 'utf8');
}

export function throwNoCurrentWorkError(command: string): never {
  throw new Error(`No current work set. Run \`sduck ${command} <target>\` with explicit target.`);
}
