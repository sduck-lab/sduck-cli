import * as fs from 'node:fs';
import * as path from 'node:path';

import { loadLegacyCacheBundle } from './cache-bundle.js';
import { V2ExpectedError } from './errors.js';
import {
  dbPath,
  dbSidecarPaths,
  decisionRoot,
  sourceDecisionsDir,
  sourceImplementationsDir,
  sourceTasksDir,
  statePath,
} from './paths.js';
import { rebuildDecisionCache } from './rebuild.js';
import {
  loadSourceBundle,
  sourceFileCount,
  validateSourceBundle,
  writeSourceBundle,
} from './source-store.js';
import { readState, validateDecisionState } from './state.js';
import { cacheHasRows } from './store.js';
import { withDecisionWorkspaceLock } from './workspace-lock.js';

import type { SourceBundle } from './source-types.js';
import type { DecisionState } from './state.js';

export interface DecisionWorkspaceTransaction {
  artifacts: Map<string, string>;
  bundle: SourceBundle;
  state: DecisionState;
}

interface Replacement {
  backupPath: string;
  hadOriginal: boolean;
  stagedPath: string | null;
  targetPath: string;
  originalMoved: boolean;
  stagedMoved: boolean;
}

interface CommitJournal {
  stagingRoot: string;
  backupRoot: string;
  replacements: Replacement[];
}

/**
 * Serializes and commits every canonical v2 mutation. Invalid drafts only touch
 * staging; source and cache are swapped after full-bundle validation succeeds.
 */
export class DecisionWorkspace {
  constructor(private readonly projectRoot: string) {}

  mutate<T>(mutation: (transaction: DecisionWorkspaceTransaction) => T): T {
    return withDecisionWorkspaceLock(this.projectRoot, () => {
      this.recoverInterruptedCommit();
      const bundle = this.loadBundleForMutation();
      const state = readState(this.projectRoot);
      validateDecisionState(state, bundle);
      const transaction: DecisionWorkspaceTransaction = {
        artifacts: new Map(),
        bundle,
        state,
      };
      const result = mutation(transaction);
      validateSourceBundle(transaction.bundle);
      this.commit(transaction);
      return result;
    });
  }

  recoverInterruptedCommitForDoctor(): boolean {
    return this.recoverInterruptedCommit() > 0;
  }

  private loadBundleForMutation(): SourceBundle {
    if (sourceFileCount(this.projectRoot) > 0) return loadSourceBundle(this.projectRoot);
    if (cacheHasRows(this.projectRoot)) return loadLegacyCacheBundle(this.projectRoot);
    return loadSourceBundle(this.projectRoot);
  }

  private commit(transaction: DecisionWorkspaceTransaction): void {
    for (const relativePath of transaction.artifacts.keys()) {
      assertArtifactPath(relativePath);
    }
    fs.mkdirSync(decisionRoot(this.projectRoot), { recursive: true });
    const nonce = `${String(process.pid)}-${String(Date.now())}-${Math.random().toString(36).slice(2)}`;
    const stagingRoot = path.join(decisionRoot(this.projectRoot), `.staging-${nonce}`);
    const backupRoot = path.join(decisionRoot(this.projectRoot), `.rollback-${nonce}`);
    const journalPath = path.join(decisionRoot(this.projectRoot), `.commit-${nonce}.json`);
    const planned: Replacement[] = [];
    let cleanupBackup = false;

    try {
      writeSourceBundle(stagingRoot, transaction.bundle);
      for (const [relativePath, content] of transaction.artifacts) {
        const stagedArtifact = resolveRelative(stagingRoot, relativePath);
        fs.mkdirSync(path.dirname(stagedArtifact), { recursive: true });
        fs.writeFileSync(stagedArtifact, content);
      }
      const stagedBundle = loadSourceBundle(stagingRoot);
      validateSourceBundle(stagedBundle);
      rebuildDecisionCache(stagingRoot);

      const stagedStatePath = statePath(stagingRoot);
      fs.mkdirSync(path.dirname(stagedStatePath), { recursive: true });
      fs.writeFileSync(stagedStatePath, `${JSON.stringify(transaction.state, null, 2)}\n`);

      planned.push(...this.planSourceReplacements(stagingRoot, backupRoot));
      for (const relativePath of [...transaction.artifacts.keys()].sort()) {
        const stagedArtifact = resolveRelative(stagingRoot, relativePath);
        const targetArtifact = resolveRelative(this.projectRoot, relativePath);
        if (
          fs.existsSync(targetArtifact) &&
          fs.readFileSync(stagedArtifact).equals(fs.readFileSync(targetArtifact))
        ) {
          continue;
        }
        planned.push(
          this.replacement(
            stagedArtifact,
            targetArtifact,
            backupRoot,
            path.join('artifacts', relativePath),
          ),
        );
      }
      const stagedCachePaths = dbSidecarPaths(stagingRoot);
      const targetCachePaths = dbSidecarPaths(this.projectRoot);
      for (let index = 1; index < targetCachePaths.length; index += 1) {
        const targetCachePath = targetCachePaths[index];
        const stagedCachePath = stagedCachePaths[index];
        if (targetCachePath === undefined || stagedCachePath === undefined) continue;
        if (!fs.existsSync(targetCachePath) && !fs.existsSync(stagedCachePath)) continue;
        planned.push(
          this.replacement(
            fs.existsSync(stagedCachePath) ? stagedCachePath : null,
            targetCachePath,
            backupRoot,
            path.basename(targetCachePath),
          ),
        );
      }
      planned.push(
        this.replacement(dbPath(stagingRoot), dbPath(this.projectRoot), backupRoot, 'db.sqlite'),
      );
      const nextState = fs.readFileSync(stagedStatePath, 'utf8');
      const currentStatePath = statePath(this.projectRoot);
      const currentState = fs.existsSync(currentStatePath)
        ? fs.readFileSync(currentStatePath, 'utf8')
        : null;
      if (nextState !== currentState) {
        planned.push(this.replacement(stagedStatePath, currentStatePath, backupRoot, 'state.json'));
      }

      this.writeJournal(journalPath, { stagingRoot, backupRoot, replacements: planned });
      for (const replacement of planned) {
        this.applyReplacement(replacement);
        this.writeJournal(journalPath, { stagingRoot, backupRoot, replacements: planned });
      }
      cleanupBackup = true;
    } catch (error) {
      try {
        this.rollback(planned);
        cleanupBackup = true;
        fs.rmSync(journalPath, { force: true });
      } catch (rollbackError) {
        throw new AggregateError(
          [error, rollbackError],
          'Decision workspace commit failed and rollback was incomplete; run `sduck doctor` to recover.',
        );
      }
      throw error;
    } finally {
      fs.rmSync(stagingRoot, { force: true, recursive: true });
      if (cleanupBackup) fs.rmSync(backupRoot, { force: true, recursive: true });
      if (cleanupBackup) fs.rmSync(journalPath, { force: true });
    }
  }

  private recoverInterruptedCommit(): number {
    const root = decisionRoot(this.projectRoot);
    if (!fs.existsSync(root)) return 0;
    const journals = fs
      .readdirSync(root)
      .filter((entry) => entry.startsWith('.commit-') && entry.endsWith('.json'))
      .sort();
    for (const journalName of journals) {
      const journalPath = path.join(root, journalName);
      const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8')) as CommitJournal;
      this.rollback(journal.replacements);
      fs.rmSync(journal.stagingRoot, { force: true, recursive: true });
      fs.rmSync(journal.backupRoot, { force: true, recursive: true });
      fs.rmSync(journalPath, { force: true });
    }
    return journals.length;
  }

  private writeJournal(journalPath: string, journal: CommitJournal): void {
    const temporaryPath = `${journalPath}.tmp`;
    fs.writeFileSync(temporaryPath, `${JSON.stringify(journal, null, 2)}\n`);
    fs.renameSync(temporaryPath, journalPath);
  }

  private planSourceReplacements(stagingRoot: string, backupRoot: string): Replacement[] {
    const managedRoots = [
      ['tasks', sourceTasksDir(stagingRoot), sourceTasksDir(this.projectRoot)],
      ['decisions', sourceDecisionsDir(stagingRoot), sourceDecisionsDir(this.projectRoot)],
      [
        'implementations',
        sourceImplementationsDir(stagingRoot),
        sourceImplementationsDir(this.projectRoot),
      ],
    ] as const;
    const replacements: Replacement[] = [];

    for (const [directory, stagedRoot, targetRoot] of managedRoots) {
      const stagedFiles = listTopLevelFiles(stagedRoot);
      const targetFiles = listTopLevelFiles(targetRoot);
      const relativeFiles = new Set([...stagedFiles.keys(), ...targetFiles.keys()]);
      for (const relativePath of [...relativeFiles].sort()) {
        const stagedPath = stagedFiles.get(relativePath) ?? null;
        const targetPath = targetFiles.get(relativePath) ?? path.join(targetRoot, relativePath);
        if (
          stagedPath !== null &&
          fs.existsSync(targetPath) &&
          fs.readFileSync(stagedPath).equals(fs.readFileSync(targetPath))
        ) {
          continue;
        }
        replacements.push(
          this.replacement(
            stagedPath,
            targetPath,
            backupRoot,
            path.join('markdown', directory, relativePath),
          ),
        );
      }
    }
    return replacements;
  }

  private replacement(
    stagedPath: string | null,
    targetPath: string,
    backupRoot: string,
    backupRelativePath: string,
  ): Replacement {
    return {
      backupPath: path.join(backupRoot, backupRelativePath),
      hadOriginal: fs.existsSync(targetPath),
      stagedPath,
      targetPath,
      originalMoved: false,
      stagedMoved: false,
    };
  }

  private applyReplacement(replacement: Replacement): void {
    fs.mkdirSync(path.dirname(replacement.targetPath), { recursive: true });
    if (replacement.hadOriginal) {
      fs.mkdirSync(path.dirname(replacement.backupPath), { recursive: true });
      fs.renameSync(replacement.targetPath, replacement.backupPath);
      replacement.originalMoved = true;
    }
    if (replacement.stagedPath !== null) {
      fs.renameSync(replacement.stagedPath, replacement.targetPath);
      replacement.stagedMoved = true;
    }
  }

  private rollback(replacements: Replacement[]): void {
    for (const replacement of [...replacements].reverse()) {
      const stagedMoved =
        replacement.stagedMoved ||
        (replacement.stagedPath !== null &&
          !fs.existsSync(replacement.stagedPath) &&
          fs.existsSync(replacement.targetPath));
      const originalMoved =
        replacement.originalMoved ||
        (replacement.hadOriginal && fs.existsSync(replacement.backupPath));
      if (stagedMoved && fs.existsSync(replacement.targetPath)) {
        fs.rmSync(replacement.targetPath, { force: true, recursive: true });
      }
      if (originalMoved && fs.existsSync(replacement.backupPath)) {
        fs.mkdirSync(path.dirname(replacement.targetPath), { recursive: true });
        fs.renameSync(replacement.backupPath, replacement.targetPath);
      }
    }
  }
}

export function recoverInterruptedDecisionWorkspace(projectRoot: string): boolean {
  return withDecisionWorkspaceLock(projectRoot, () => {
    return new DecisionWorkspace(projectRoot).recoverInterruptedCommitForDoctor();
  });
}

function listTopLevelFiles(root: string): Map<string, string> {
  const files = new Map<string, string>();
  if (!fs.existsSync(root)) return files;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.isFile()) files.set(entry.name, path.join(root, entry.name));
  }
  return files;
}

function resolveRelative(root: string, relativePath: string): string {
  const resolved = path.resolve(root, relativePath);
  const relative = path.relative(root, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new V2ExpectedError('ARTIFACT_PATH_OUTSIDE_WORKSPACE', { path: relativePath });
  }
  return resolved;
}

function assertArtifactPath(relativePath: string): void {
  const normalized = relativePath.replaceAll('\\', '/');
  if (normalized === '' || path.posix.isAbsolute(normalized)) {
    throw new V2ExpectedError('ARTIFACT_PATH_INVALID', { path: relativePath });
  }
  if (normalized === '.decision' || normalized.startsWith('.decision/')) {
    const generatedRoot = '.decision/exports/graphify/';
    if (!normalized.startsWith(generatedRoot)) {
      throw new V2ExpectedError('ARTIFACT_PATH_RESERVED', {
        path: relativePath,
        namespace: 'decision',
      });
    }
  }
  if (normalized === '.sduck' || normalized.startsWith('.sduck/')) {
    throw new V2ExpectedError('ARTIFACT_PATH_RESERVED', {
      path: relativePath,
      namespace: 'legacy',
    });
  }
}
