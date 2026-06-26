import { renderBriefMarkdown } from '../../core/v2/brief.js';

import type {
  BriefView,
  ContextPack,
  RecallResult,
  StatusView,
  TraceView,
} from '../../types/index.js';

export function renderStatus(view: StatusView): string {
  if (view.task === null) {
    return 'No current decision task.\nNext: sduck work "<작업 설명>"';
  }
  const lines = [
    `Current decision task: ${view.task.id}`,
    `Title: ${view.task.title}`,
    `Status: ${view.task.status}`,
    '',
    'Progress:',
    `  Context items: ${String(view.indicators.contextItems)}`,
    `  Draft submissions: ${String(view.indicators.draftSubmissions)}`,
    `  Questions answered: ${String(view.indicators.questionsAnswered)}`,
    `  Questions open: ${String(view.indicators.questionsOpen)}`,
    `  Brief snapshots: ${String(view.indicators.briefSnapshots)}`,
    `  Implementation traces: ${String(view.indicators.implementationTraces)}`,
    `  Exports: ${String(view.indicators.exports)}`,
    '',
    'Decisions:',
  ];
  for (const [kind, count] of Object.entries(view.indicators.decisionsByKind)) {
    lines.push(`  ${kind}: ${String(count)}`);
  }
  lines.push('', nextAction(view));
  return lines.join('\n');
}

export function renderContextPack(pack: ContextPack): string {
  const lines = [`Context Pack for ${pack.task.id}`, pack.task.title, '', 'Context items:'];
  if (pack.items.length === 0) lines.push('  - none');
  for (const item of pack.items) {
    lines.push(
      `  - [${item.sourceType}] ${item.sourceRef}: ${item.summary}${formatItemRelevance(item.metadata)}`,
    );
  }
  lines.push('', 'Prior decisions:');
  if (pack.priorDecisions.length === 0) lines.push('  - none');
  for (const decision of pack.priorDecisions) {
    lines.push(`  - ${decision.id} [${decision.kind}] ${decision.title}: ${decision.summary}`);
  }
  lines.push('', 'Prior implementation traces:');
  if (pack.priorTraces.length === 0) lines.push('  - none');
  for (const trace of pack.priorTraces) {
    lines.push(`  - ${trace.id}: ${trace.summary}`);
  }
  lines.push('', 'Current evidence:');
  if (pack.evidence.length === 0) lines.push('  - none');
  for (const evidence of pack.evidence) {
    lines.push(`  - [${evidence.sourceType}] ${evidence.sourceRef}: ${evidence.summary}`);
  }
  lines.push('', 'Agent grill-me prompt:', pack.grillMePrompt);
  lines.push('', 'Skill-backed checklist:');
  for (const item of pack.grillMeChecklist) lines.push(`  - ${item}`);
  lines.push('', 'Grill-me protocol:');
  for (const rule of pack.grillMeProtocol) lines.push(`  - ${rule}`);
  lines.push('', 'Draft schema example:', JSON.stringify(pack.draftSchemaExample, null, 2));
  lines.push('', 'Next: create draft and run `sduck submit --stdin < draft.json`');
  return lines.join('\n');
}

export function renderBrief(view: BriefView): string {
  return renderBriefMarkdown(view);
}

export function renderTrace(view: TraceView): string {
  const lines = ['Implementation trace created.', `Trace: ${view.trace.id}`, '', 'Changed files:'];
  for (const file of view.filesChanged) lines.push(`  - ${file}`);
  lines.push('', 'Decision → code map:');
  if (view.trace.decisionToCodeMap.length === 0) lines.push('  - none');
  for (const map of view.trace.decisionToCodeMap) {
    lines.push(
      `  - ${map.decisionId}: ${map.files.join(', ') || 'none'}${formatRelevance(map.reason, map.score)}`,
    );
  }
  lines.push('', 'Unmapped decisions requiring review:');
  const unmappedDecisions = view.trace.unmappedDecisions ?? [];
  if (unmappedDecisions.length === 0) lines.push('  - none');
  for (const item of unmappedDecisions) {
    const files =
      item.files === undefined || item.files.length === 0 ? 'none' : item.files.join(', ');
    lines.push(
      `  - ${item.decisionId}: ${item.reason} (score ${formatScore(item.score)}; files: ${files}) — ${item.summary}`,
    );
  }
  return lines.join('\n');
}

export function renderRecall(result: RecallResult): string {
  const lines = [`검색어: ${result.query}`, '', '관련 decision:'];
  if (result.decisions.length === 0) lines.push('  - none');
  for (const decision of result.decisions) {
    lines.push(`  - ${decision.id} [${decision.kind}] ${decision.title}`);
    lines.push(`    ${decision.summary}`);
  }
  lines.push('', '관련 implementation trace:');
  if (result.traces.length === 0) lines.push('  - none');
  for (const trace of result.traces) lines.push(`  - ${trace.id}: ${trace.summary}`);
  return lines.join('\n');
}

function nextAction(view: StatusView): string {
  if (view.indicators.questionsOpen > 0) return 'Next: sduck ask';
  if (view.task?.status === 'CONFIRMED') return 'Next: implement, then sduck trace';
  if (view.task?.status === 'BRIEF_READY') return 'Next: sduck brief && sduck confirm';
  return 'Next: sduck context or sduck submit --stdin';
}

function formatItemRelevance(metadata: Record<string, unknown>): string {
  const reason = typeof metadata['reason'] === 'string' ? metadata['reason'] : undefined;
  const score = typeof metadata['score'] === 'number' ? metadata['score'] : undefined;
  return formatRelevance(reason, score);
}

function formatRelevance(reason: string | undefined, score: number | undefined): string {
  if (reason === undefined && score === undefined) return '';
  if (reason !== undefined && score !== undefined)
    return ` — ${reason} (score ${formatScore(score)})`;
  if (reason !== undefined) return ` — ${reason}`;
  return ` — score ${formatScore(score ?? 0)}`;
}

function formatScore(score: number): string {
  return Number.isInteger(score) ? score.toFixed(1) : String(score);
}
