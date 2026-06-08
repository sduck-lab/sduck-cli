import * as fs from 'node:fs';

import { installAgentRails, type AgentRailsInstallResult } from './agent-rails.js';
import {
  decisionRoot,
  graphifyExportDir,
  markdownDecisionsDir,
  markdownImplementationsDir,
  markdownTasksDir,
} from './paths.js';
import { writeState } from './state.js';
import { openDatabase } from './store.js';

export interface InitWorkspaceResult {
  agentRails: AgentRailsInstallResult | null;
  created: string[];
  existing: string[];
}

export interface InitWorkspaceOptions {
  agentRails?: boolean;
}

export function initDecisionWorkspace(
  projectRoot: string,
  options: InitWorkspaceOptions = {},
): InitWorkspaceResult {
  const dirs = [
    decisionRoot(projectRoot),
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
  }
  const agentRails = options.agentRails === false ? null : installAgentRails(projectRoot);
  return { agentRails, created, existing };
}
