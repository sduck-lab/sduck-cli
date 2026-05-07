import * as path from 'node:path';

export const DECISION_DIR = '.decision';

export function decisionRoot(projectRoot: string): string {
  return path.join(projectRoot, DECISION_DIR);
}

export function dbPath(projectRoot: string): string {
  return path.join(decisionRoot(projectRoot), 'db.sqlite');
}

export function statePath(projectRoot: string): string {
  return path.join(decisionRoot(projectRoot), 'state.json');
}

export function markdownTasksDir(projectRoot: string): string {
  return path.join(decisionRoot(projectRoot), 'exports', 'markdown', 'tasks');
}

export function markdownDecisionsDir(projectRoot: string): string {
  return path.join(decisionRoot(projectRoot), 'exports', 'markdown', 'decisions');
}

export function markdownImplementationsDir(projectRoot: string): string {
  return path.join(decisionRoot(projectRoot), 'exports', 'markdown', 'implementations');
}

export function graphifyExportDir(projectRoot: string): string {
  return path.join(decisionRoot(projectRoot), 'exports', 'graphify');
}

export function graphifyReportPath(projectRoot: string): string {
  return path.join(projectRoot, 'graphify-out', 'GRAPH_REPORT.md');
}

export function graphifyGraphPath(projectRoot: string): string {
  return path.join(projectRoot, 'graphify-out', 'graph.json');
}

export function toRelativePath(projectRoot: string, absolutePath: string): string {
  return path.relative(projectRoot, absolutePath).split(path.sep).join('/');
}

export function resolveInsideProject(projectRoot: string, inputPath: string): string {
  const resolved = path.resolve(projectRoot, inputPath);
  const relative = path.relative(projectRoot, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Path is outside project: ${inputPath}`);
  }
  return resolved;
}
