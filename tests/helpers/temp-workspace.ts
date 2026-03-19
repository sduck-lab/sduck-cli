import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export async function createTempWorkspace(prefix = 'sduck-'): Promise<string> {
  return await mkdtemp(join(tmpdir(), prefix));
}

export async function removeTempWorkspace(path: string): Promise<void> {
  await rm(path, { force: true, recursive: true });
}
