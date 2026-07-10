import * as path from 'node:path';

import { DecisionWorkspace } from './decision-workspace.js';
import {
  decisionGraphExportPath,
  graphifyExportDir,
  sourceDecisionsDir,
  sourceImplementationsDir,
  sourceTasksDir,
  toRelativePath,
} from './paths.js';
import { appendSourceEvent } from './source-store.js';

import type { Decision, Evidence, ImplementationTrace, Task } from '../../types/index.js';

export interface RememberResult {
  created: string[];
}

export function remember(projectRoot: string): RememberResult {
  return new DecisionWorkspace(projectRoot).mutate(({ artifacts, bundle, state }) => {
    const taskId = state.currentTaskId;
    const sourcePaths = [
      ...bundle.tasks.map((item) => path.join(sourceTasksDir(projectRoot), `${item.id}.md`)),
      ...bundle.decisions.map((item) =>
        path.join(sourceDecisionsDir(projectRoot), `${item.id}.md`),
      ),
      ...bundle.implementationTraces.map((item) =>
        path.join(sourceImplementationsDir(projectRoot), `${item.id}.md`),
      ),
    ];
    if (taskId === null) {
      if (bundle.tasks.length === 0) {
        throw new Error('No decision records to remember. Run `sduck work "..."` first.');
      }
      return { created: sourcePaths };
    }
    const task = bundle.tasks.find((item) => item.id === taskId);
    if (task === undefined) throw new Error(`Task not found: ${taskId}`);
    const decisions = bundle.decisions.filter(
      (decision) => decision.taskId === task.id && decision.status === 'CONFIRMED',
    );
    const evidence = bundle.evidence.filter((item) => item.taskId === task.id);
    const traces = bundle.implementationTraces.filter((trace) => trace.taskId === task.id);
    const reportPath = path.join(graphifyExportDir(projectRoot), 'DECISION_REPORT.md');
    const graphPath = decisionGraphExportPath(projectRoot);
    artifacts.set(
      toRelativePath(projectRoot, reportPath),
      renderDecisionReport(task, decisions, traces),
    );
    artifacts.set(
      toRelativePath(projectRoot, graphPath),
      `${JSON.stringify(buildDecisionGraph(task, decisions, evidence, traces), null, 2)}\n`,
    );
    const created = [...sourcePaths, reportPath, graphPath];
    appendSourceEvent(bundle, { taskId: task.id, type: 'EXPORT_WRITTEN', payload: { created } });
    return { created };
  });
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
