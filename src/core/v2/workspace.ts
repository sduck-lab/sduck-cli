import * as fs from 'node:fs';

import {
  decisionRoot,
  graphifyExportDir,
  markdownDecisionsDir,
  markdownImplementationsDir,
  markdownTasksDir,
  policyPath,
} from './paths.js';
import { writeDefaultPolicy } from './policy.js';
import { sourceFileCount } from './source-store.js';
import { writeState } from './state.js';
import { cacheHasRows, openDatabase } from './store.js';

export interface InitWorkspaceResult {
  created: string[];
  existing: string[];
}

export function initDecisionWorkspace(projectRoot: string): InitWorkspaceResult {
  const root = decisionRoot(projectRoot);
  const shouldCreatePolicy = !hasExistingDurableWorkspace(projectRoot);
  const dirs = [
    root,
    markdownTasksDir(projectRoot),
    markdownDecisionsDir(projectRoot),
    markdownImplementationsDir(projectRoot),
    graphifyExportDir(projectRoot),
  ];
  const created: string[] = [];
  const existing: string[] = [];
  for (const dir of dirs) {
    if (fs.existsSync(dir)) {
      existing.push(dir);
    } else {
      fs.mkdirSync(dir, { recursive: true });
      created.push(dir);
    }
  }
  const db = openDatabase(projectRoot);
  db.close();
  const stateFilePath = `${decisionRoot(projectRoot)}/state.json`;
  if (!fs.existsSync(stateFilePath)) {
    writeState(projectRoot, { currentTaskId: null, updatedAt: new Date().toISOString() });
    created.push(stateFilePath);
  } else {
    existing.push(stateFilePath);
  }
  const policyFilePath = policyPath(projectRoot);
  if (shouldCreatePolicy && !fs.existsSync(policyFilePath)) {
    created.push(writeDefaultPolicy(projectRoot));
  } else if (fs.existsSync(policyFilePath)) {
    existing.push(policyFilePath);
  }
  return { created, existing };
}

function hasExistingDurableWorkspace(projectRoot: string): boolean {
  return (
    fs.existsSync(policyPath(projectRoot)) ||
    sourceFileCount(projectRoot) > 0 ||
    cacheHasRows(projectRoot)
  );
}
