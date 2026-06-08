import { renderBriefMarkdown } from '../../core/v2/brief.js';

import type {
  BriefView,
  ContextPack,
  ImpactItem,
  ImpactResult,
  RecallResult,
  StatusView,
  TraceView,
} from '../../types/index.js';

export function renderStatus(view: StatusView): string {
  if (view.task === null) {
    return 'No current task.\nNext: sduck work "<작업 설명>"';
  }
  const lines = [
    `Current task: ${view.task.id}`,
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
    lines.push(`  - [${item.sourceType}] ${item.sourceRef}: ${item.summary}`);
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
  for (const map of view.trace.decisionToCodeMap) {
    lines.push(`  - ${map.decisionId}: ${map.files.join(', ') || 'none'}`);
  }
  return lines.join('\n');
}

export function renderImpact(result: ImpactResult): string {
  const lines: string[] = [];
  for (const file of result.files) {
    if (lines.length > 0) lines.push('');
    lines.push(`Impact for ${file}`, '');
    appendImpactSection(lines, 'Direct decisions', result.directDecisions, file);
    appendImpactSection(lines, 'Avoid warnings', result.avoidWarnings, file);
    appendImpactSection(lines, 'Related plans', result.plans, file);
    appendImpactSection(lines, 'Historical traces', result.traces, file);
    appendImpactSection(lines, 'Provenance', result.provenance, file);
    appendImpactSection(lines, 'Fallback search', result.fallbackSearch, file);
  }
  return lines.join('\n');
}

function appendImpactSection(
  lines: string[],
  title: string,
  items: ImpactItem[],
  file: string,
): void {
  lines.push(`${title}:`);
  const matchingItems = items.filter((item) => item.file === file);
  if (matchingItems.length === 0) {
    lines.push('  - none', '');
    return;
  }
  for (const item of matchingItems) {
    lines.push(
      `  - ${item.entityId} [${item.matchSource}, ${item.confidence.toFixed(2)}] ${item.title}`,
    );
    if (item.summary.trim() !== '') lines.push(`    ${item.summary}`);
    lines.push(`    ${item.explanation}`);
  }
  lines.push('');
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
