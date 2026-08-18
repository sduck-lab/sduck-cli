import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

import { withPathLock } from './workspace-lock.js';

// git worktrees each have their own working directory, so uncommitted `.decision/` files in one
// worktree are invisible to another -- two worktrees branched from the same base can independently
// compute the same "next DEC-/IMPL-/... number" and collide. What worktrees of the same repo DO
// share is the git common dir (refs/objects/etc). Storing the cross-worktree id floor there is
// what makes that collision impossible instead of just unlikely.
//
// Cached per projectRoot: a repo's git common dir never changes within a process's lifetime, and
// nextSourceEntityId can be called dozens of times in a single mutate() (one per decision in a
// bulk submit), so spawning a `git` subprocess for every single id would be wasteful and, under
// concurrent load, a real source of latency/flakiness -- this was observed directly during testing.
const gitCommonDirCache = new Map<string, string | null>();

function gitCommonDir(projectRoot: string): string | null {
  const cached = gitCommonDirCache.get(projectRoot);
  if (cached !== undefined) return cached;
  let result: string | null;
  try {
    const out = execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    result = out === '' ? null : out;
  } catch {
    // Not a git repo (e.g. test fixtures under os.tmpdir()) or git isn't available -- fall back
    // to purely local numbering, matching the pre-existing behavior exactly.
    result = null;
  }
  gitCommonDirCache.set(projectRoot, result);
  return result;
}

type CounterFile = Record<string, number>;

function readCounters(filePath: string): CounterFile {
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8')) as unknown;
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
    const result: CounterFile = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === 'number' && Number.isInteger(value)) result[key] = value;
    }
    return result;
  } catch {
    return {};
  }
}

// Reserves the next sequential number for `prefix` across every worktree of this repo.
// `localMax` is the highest number this worktree can currently see in its own `.decision/`
// files -- used as a floor so a missing or stale shared-counter file never hands out an id that
// collides with what this worktree already has on disk.
export function reserveSharedId(projectRoot: string, prefix: string, localMax: number): number {
  const commonDir = gitCommonDir(projectRoot);
  if (commonDir === null) return localMax + 1;
  const countersPath = path.join(commonDir, 'sduck-id-counters.json');
  return withPathLock(path.join(commonDir, 'sduck-id-counters.lock'), () => {
    const counters = readCounters(countersPath);
    const next = Math.max(localMax, counters[prefix] ?? 0) + 1;
    counters[prefix] = next;
    fs.writeFileSync(countersPath, `${JSON.stringify(counters, null, 2)}\n`);
    return next;
  });
}
