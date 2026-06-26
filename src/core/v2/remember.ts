import * as fs from 'node:fs';
import * as path from 'node:path';

import { ensureReadableCache } from './cache.js';
import { graphifyExportDir } from './paths.js';
import { rebuildDecisionCache } from './rebuild.js';
import { appendSourceEvent, loadSourceBundleForWrite, writeSourceBundle } from './source-store.js';
import { getCurrentTaskId } from './state.js';

import type { Decision, Evidence, ImplementationTrace, Task } from '../../types/index.js';

export interface RememberResult {
  created: string[];
}

export function remember(projectRoot: string): RememberResult {
  ensureReadableCache(projectRoot);
  const bundle = loadSourceBundleForWrite(projectRoot);
  const taskId = getCurrentTaskId(projectRoot);
  if (taskId === null) throw new Error('No current task. Run `sduck work "..."` first.');
  const task = bundle.tasks.find((item) => item.id === taskId);
  if (task === undefined) throw new Error(`Task not found: ${taskId}`);
  const decisions = bundle.decisions.filter((decision) => decision.taskId === task.id);
  const evidence = bundle.evidence.filter((item) => item.taskId === task.id);
  const traces = bundle.implementationTraces.filter((trace) => trace.taskId === task.id);
  const created: string[] = [];
  created.push(
    writeFile(
      graphifyExportDir(projectRoot),
      'DECISION_REPORT.md',
      renderDecisionReport(task, decisions, traces),
    ),
  );
  created.push(
    writeFile(
      graphifyExportDir(projectRoot),
      'decision-graph.json',
      `${JSON.stringify(buildDecisionGraph(task, decisions, evidence, traces), null, 2)}\n`,
    ),
  );
  appendSourceEvent(bundle, { taskId: task.id, type: 'EXPORT_WRITTEN', payload: { created } });
  created.unshift(...writeSourceBundle(projectRoot, bundle).written);
  rebuildDecisionCache(projectRoot);
  return { created };
}

function writeFile(dir: string, fileName: string, content: string): string {
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, fileName);
  fs.writeFileSync(filePath, content);
  return filePath;
}

function renderDecisionReport(
  task: Task,
  decisions: Decision[],
  traces: ImplementationTrace[],
): string {
  return `# Decision Report\n\nTask: ${task.id} — ${task.title}\n\n## Decisions\n${decisions.map((decision) => `- ${decision.id} [${decision.kind}] ${decision.title}`).join('\n') || '- none'}\n\n## Implementation Traces\n${traces.map((trace) => `- ${trace.id}: ${trace.summary}`).join('\n') || '- none'}\n`;
}

function buildDecisionGraph(
  task: Task,
  decisions: Decision[],
  evidence: Evidence[],
  traces: ImplementationTrace[],
): Record<string, unknown> {
  const nodes = [
    { id: task.id, type: 'task', label: task.title },
    ...decisions.map((decision) => ({
      id: decision.id,
      type: 'decision',
      kind: decision.kind,
      label: decision.title,
      confidence: decision.confidence,
    })),
    ...evidence.map((item) => ({ id: item.id, type: 'evidence', label: item.sourceRef })),
    ...traces.map((trace) => ({
      id: trace.id,
      type: 'implementation_trace',
      label: trace.summary,
    })),
  ];
  const fileNodes = new Map<string, { id: string; type: string; label: string }>();
  const links: Record<string, string>[] = [];
  for (const decision of decisions) {
    links.push({ source: task.id, target: decision.id, relation: 'HAS_DECISION' });
    for (const file of decision.appliesTo) {
      fileNodes.set(file, { id: file, type: 'file', label: file });
      links.push({ source: decision.id, target: file, relation: 'APPLIES_TO' });
    }
    for (const file of decision.avoids) {
      fileNodes.set(file, { id: file, type: 'file', label: file });
      links.push({ source: decision.id, target: file, relation: 'AVOIDS' });
    }
  }
  for (const item of evidence) {
    links.push({ source: task.id, target: item.id, relation: 'HAS_EVIDENCE' });
    if (item.decisionId !== null)
      links.push({ source: item.decisionId, target: item.id, relation: 'SUPPORTED_BY' });
  }
  for (const trace of traces) {
    links.push({ source: task.id, target: trace.id, relation: 'TRACE_FOR' });
    for (const file of trace.filesChanged) {
      fileNodes.set(file, { id: file, type: 'file', label: file });
      links.push({ source: trace.id, target: file, relation: 'CHANGED_FILE' });
    }
  }
  return { nodes: [...nodes, ...fileNodes.values()], links };
}
