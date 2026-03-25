import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { getFsEntryKind } from './fs.js';

export interface GitignoreUpdateResult {
  added: string[];
  skipped: string[];
  warning?: string;
}

export async function ensureGitignoreEntries(
  projectRoot: string,
  entries: readonly string[],
): Promise<GitignoreUpdateResult> {
  const gitignorePath = join(projectRoot, '.gitignore');
  const added: string[] = [];
  const skipped: string[] = [];

  try {
    let content = '';

    if ((await getFsEntryKind(gitignorePath)) === 'file') {
      content = await readFile(gitignorePath, 'utf8');
    }

    const existingLines = new Set(content.split('\n').map((line) => line.trim()));
    const toAdd: string[] = [];

    for (const entry of entries) {
      if (existingLines.has(entry)) {
        skipped.push(entry);
      } else {
        toAdd.push(entry);
        added.push(entry);
      }
    }

    if (toAdd.length > 0) {
      const suffix = content.endsWith('\n') || content === '' ? '' : '\n';
      const newContent = content + suffix + toAdd.join('\n') + '\n';

      await writeFile(gitignorePath, newContent, 'utf8');
    }

    return { added, skipped };
  } catch {
    const manualEntries = entries.join('\n');

    return {
      added: [],
      skipped: [],
      warning: `Failed to update .gitignore. Please add the following entries manually:\n${manualEntries}`,
    };
  }
}
