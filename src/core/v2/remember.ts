import * as fs from 'node:fs';
import * as path from 'node:path';

import { buildBriefView, renderBriefMarkdown } from './brief.js';
import { listDecisionsByTask } from './decision.js';
import { appendEvent } from './events.js';
import { listEvidenceByTask } from './evidence.js';
import {
  graphifyExportDir,
  markdownDecisionsDir,
  markdownImplementationsDir,
  markdownTasksDir,
} from './paths.js';
import { openDatabase } from './store.js';
import { requireMutableCurrentTask } from './task.js';
import { listImplementationTraces } from './trace.js';

import type { Decision, Evidence, ImplementationTrace, Task } from '../../types/index.js';

export interface RememberResult {
  created: string[];
}

export function remember(projectRoot: string): RememberResult {
  const db = openDatabase(projectRoot);
  try {
    const task = requireMutableCurrentTask(projectRoot, db);
    const decisions = listDecisionsByTask(db, task.id);
    const evidence = listEvidenceByTask(db, task.id);
    const traces = listImplementationTraces(projectRoot, task.id);
    const created: string[] = [];
    created.push(
      writeFile(
        markdownTasksDir(projectRoot),
        `${task.id}.md`,
        renderTaskMarkdown(projectRoot, task),
      ),
    );
    for (const decision of decisions) {
      created.push(
        writeFile(
          markdownDecisionsDir(projectRoot),
          `${decision.id}.md`,
          renderDecisionMarkdown(decision),
        ),
      );
    }
    for (const trace of traces) {
      created.push(
        writeFile(
          markdownImplementationsDir(projectRoot),
          `${trace.id}.md`,
          renderTraceMarkdown(trace),
        ),
      );
    }
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
    const eventDb = openDatabase(projectRoot);
    try {
      appendEvent(eventDb, { taskId: task.id, type: 'EXPORT_WRITTEN', payload: { created } });
    } finally {
      eventDb.close();
    }
    return { created };
  } finally {
    db.close();
  }
}

function writeFile(dir: string, fileName: string, content: string): string {
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, fileName);
  fs.writeFileSync(filePath, content);
  return filePath;
}

function renderTaskMarkdown(projectRoot: string, task: Task): string {
  const view = buildBriefView(projectRoot);
  return `---\nid: ${task.id}\ntype: task\nstatus: ${task.status}\ncreated_at: ${task.createdAt}\n---\n# ${task.id}: ${task.title}\n\n${renderBriefMarkdown(view)}\n`;
}

function renderDecisionMarkdown(decision: Decision): string {
  return `---\nid: ${decision.id}\ntype: decision\ntask_id: ${decision.taskId}\nkind: ${decision.kind}\nstatus: ${decision.status}\nconfidence: ${String(decision.confidence)}\nsource_refs:\n${decision.sourceRefs.map((ref) => `  - ${ref}`).join('\n')}\napplies_to:\n${decision.appliesTo.map((ref) => `  - ${ref}`).join('\n')}\navoids:\n${decision.avoids.map((ref) => `  - ${ref}`).join('\n')}\ncreated_at: ${decision.createdAt}\n---\n# ${decision.id}: ${decision.title}\n\n## Decision\n${decision.summary}\n\n## Rationale\n${decision.rationale.map((item) => `- ${item}`).join('\n') || '- none'}\n`;
}

function renderTraceMarkdown(trace: ImplementationTrace): string {
  return `---\nid: ${trace.id}\ntype: implementation_trace\ntask_id: ${trace.taskId}\nimplements:\n${trace.decisionIds.map((id) => `  - ${id}`).join('\n')}\nfiles_changed:\n${trace.filesChanged.map((file) => `  - ${file}`).join('\n')}\ncreated_at: ${trace.createdAt}\n---\n# ${trace.id}: Implementation trace\n\n## Summary\n${trace.summary}\n\n## Decision to code map\n${trace.decisionToCodeMap.map((map) => `- ${map.decisionId}: ${map.files.join(', ')}`).join('\n') || '- none'}\n`;
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
