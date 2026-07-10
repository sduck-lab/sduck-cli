import * as fs from 'node:fs';
import * as path from 'node:path';

import { loadLegacyCacheBundle } from './cache-bundle.js';
import { dbPath, dbSidecarPaths, decisionRoot, sourceTasksDir, statePath } from './paths.js';
import { rebuildDecisionCache } from './rebuild.js';
import {
  loadSourceBundle,
  sourceFileCount,
  validateSourceBundle,
  writeSourceBundle,
} from './source-store.js';
import { readState } from './state.js';
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
}

/**
 * Serializes and commits every canonical v2 mutation. Invalid drafts only touch
 * staging; source and cache are swapped after full-bundle validation succeeds.
 */
export class DecisionWorkspace {
  constructor(private readonly projectRoot: string) {}

  mutate<T>(mutation: (transaction: DecisionWorkspaceTransaction) => T): T {
    return withDecisionWorkspaceLock(this.projectRoot, () => {
      const transaction: DecisionWorkspaceTransaction = {
        artifacts: new Map(),
        bundle: this.loadBundleForMutation(),
        state: readState(this.projectRoot),
      };
      const result = mutation(transaction);
      validateSourceBundle(transaction.bundle);
      this.commit(transaction);
      return result;
    });
  }

  private loadBundleForMutation(): SourceBundle {
    if (sourceFileCount(this.projectRoot) > 0) return loadSourceBundle(this.projectRoot);
    if (cacheHasRows(this.projectRoot)) return loadLegacyCacheBundle(this.projectRoot);
    return loadSourceBundle(this.projectRoot);
  }

  private commit(transaction: DecisionWorkspaceTransaction): void {
    fs.mkdirSync(decisionRoot(this.projectRoot), { recursive: true });
    const nonce = `${String(process.pid)}-${String(Date.now())}-${Math.random().toString(36).slice(2)}`;
    const stagingRoot = path.join(decisionRoot(this.projectRoot), `.staging-${nonce}`);
    const backupRoot = path.join(decisionRoot(this.projectRoot), `.rollback-${nonce}`);
    const planned: Replacement[] = [];
    const applied: Replacement[] = [];

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

      for (const replacement of planned) {
        applied.push(replacement);
        this.applyReplacement(replacement);
      }
    } catch (error) {
      this.rollback(applied);
      throw error;
    } finally {
      fs.rmSync(stagingRoot, { force: true, recursive: true });
      fs.rmSync(backupRoot, { force: true, recursive: true });
    }
  }

  private planSourceReplacements(stagingRoot: string, backupRoot: string): Replacement[] {
    const stagedMarkdownRoot = path.dirname(sourceTasksDir(stagingRoot));
    const targetMarkdownRoot = path.dirname(sourceTasksDir(this.projectRoot));
    const stagedFiles = listFiles(stagedMarkdownRoot);
    const targetFiles = listFiles(targetMarkdownRoot);
    const relativeFiles = new Set([...stagedFiles.keys(), ...targetFiles.keys()]);
    const replacements: Replacement[] = [];

    for (const relativePath of [...relativeFiles].sort()) {
      const stagedPath = stagedFiles.get(relativePath) ?? null;
      const targetPath =
        targetFiles.get(relativePath) ?? path.join(targetMarkdownRoot, relativePath);
      if (
        stagedPath !== null &&
        fs.existsSync(targetPath) &&
        fs.readFileSync(stagedPath).equals(fs.readFileSync(targetPath))
      ) {
        continue;
      }
      replacements.push(
        this.replacement(stagedPath, targetPath, backupRoot, path.join('markdown', relativePath)),
      );
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
    };
  }

  private applyReplacement(replacement: Replacement): void {
    fs.mkdirSync(path.dirname(replacement.targetPath), { recursive: true });
    if (replacement.hadOriginal) {
      fs.mkdirSync(path.dirname(replacement.backupPath), { recursive: true });
      fs.renameSync(replacement.targetPath, replacement.backupPath);
    }
    if (replacement.stagedPath !== null) {
      fs.renameSync(replacement.stagedPath, replacement.targetPath);
    }
  }

  private rollback(replacements: Replacement[]): void {
    for (const replacement of [...replacements].reverse()) {
      if (fs.existsSync(replacement.targetPath)) {
        fs.rmSync(replacement.targetPath, { force: true, recursive: true });
      }
      if (replacement.hadOriginal && fs.existsSync(replacement.backupPath)) {
        fs.mkdirSync(path.dirname(replacement.targetPath), { recursive: true });
        fs.renameSync(replacement.backupPath, replacement.targetPath);
      }
    }
  }
}

function listFiles(root: string): Map<string, string> {
  const files = new Map<string, string>();
  if (!fs.existsSync(root)) return files;

  const visit = (directory: string): void => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolutePath);
      if (entry.isFile()) files.set(path.relative(root, absolutePath), absolutePath);
    }
  };
  visit(root);
  return files;
}

function resolveRelative(root: string, relativePath: string): string {
  const resolved = path.resolve(root, relativePath);
  const relative = path.relative(root, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Artifact path is outside decision workspace: ${relativePath}`);
  }
  return resolved;
}
