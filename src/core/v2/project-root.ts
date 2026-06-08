import * as fs from 'node:fs';
import * as path from 'node:path';

import { resolveRealProjectRoot } from '../project-paths.js';
import { DECISION_DIR } from './paths.js';

export interface ResolveV2ProjectRootOptions {
  init?: boolean;
}

export async function resolveV2ProjectRoot(
  startDir: string,
  options: ResolveV2ProjectRootOptions = {},
): Promise<string> {
  const absoluteStart = path.resolve(startDir);
  if (options.init === true) {
    return absoluteStart;
  }

  const decisionRoot = findUp(absoluteStart, DECISION_DIR);
  if (decisionRoot !== null) {
    return await resolveRealProjectRoot(decisionRoot);
  }

  const gitRoot = findGitRoot(absoluteStart);
  if (gitRoot !== null) {
    return await resolveRealProjectRoot(gitRoot);
  }

  return absoluteStart;
}

function findUp(startDir: string, entryName: string): string | null {
  let current = startDir;
  for (;;) {
    if (fs.existsSync(path.join(current, entryName))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      return null;
    }
    current = parent;
  }
}

function findGitRoot(startDir: string): string | null {
  return findUp(startDir, '.git');
}
