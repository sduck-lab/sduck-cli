import { enV2Messages } from './messages.js';
import { renderBriefMarkdown } from '../../core/v2/brief.js';

import type { V2MessageCatalog } from './messages.js';
import type { DoctorResult } from '../../core/v2/doctor.js';
import type { RebuildResult } from '../../core/v2/rebuild.js';
import type { RememberResult } from '../../core/v2/remember.js';
import type {
  BriefView,
  ContextPack,
  RecallResult,
  StatusView,
  TraceView,
} from '../../types/index.js';

export function renderStatus(view: StatusView, messages: V2MessageCatalog = enV2Messages): string {
  if (view.task === null) {
    return `${messages.task.noCurrent}\n${messages.workflow.nextWork}`;
  }
  const lines = [
    messages.task.current(view.task.id),
    messages.task.title(view.task.title),
    messages.task.status(view.task.status),
    '',
    `${messages.labels.progress}:`,
    `  ${messages.labels.contextItems}: ${String(view.indicators.contextItems)}`,
    `  ${messages.labels.grillMe}: ${formatGrillMe(view, messages)}`,
    `  ${messages.labels.draftSubmissions}: ${String(view.indicators.draftSubmissions)}`,
    `  ${messages.labels.questionsAnswered}: ${String(view.indicators.questionsAnswered)}`,
    `  ${messages.labels.questionsOpen}: ${String(view.indicators.questionsOpen)}`,
    `  ${messages.labels.briefSnapshots}: ${String(view.indicators.briefSnapshots)}`,
    `  ${messages.labels.implementationTraces}: ${String(view.indicators.implementationTraces)}`,
    `  ${messages.labels.exports}: ${String(view.indicators.exports)}`,
    '',
    `${messages.labels.decisions}:`,
  ];
  for (const [kind, count] of Object.entries(view.indicators.decisionsByKind)) {
    lines.push(`  ${kind}: ${String(count)}`);
  }
  lines.push('', nextAction(view, messages));
  return lines.join('\n');
}

export function renderContextPack(
  pack: ContextPack,
  messages: V2MessageCatalog = enV2Messages,
  nextAction: string = messages.workflow.nextSubmit,
): string {
  const lines = [
    messages.common.contextPackFor(pack.task.id),
    pack.task.title,
    '',
    `${messages.labels.contextItems}:`,
  ];
  if (pack.items.length === 0) lines.push(`  - ${messages.common.none}`);
  for (const item of pack.items) {
    lines.push(
      `  - [${item.sourceType}] ${item.sourceRef}: ${item.summary}${formatItemRelevance(item.metadata, messages)}`,
    );
  }
  lines.push('', `${messages.labels.priorDecisions}:`);
  if (pack.priorDecisions.length === 0) lines.push(`  - ${messages.common.none}`);
  for (const decision of pack.priorDecisions) {
    lines.push(`  - ${decision.id} [${decision.kind}] ${decision.title}: ${decision.summary}`);
  }
  lines.push('', `${messages.labels.priorTraces}:`);
  if (pack.priorTraces.length === 0) lines.push(`  - ${messages.common.none}`);
  for (const trace of pack.priorTraces) {
    lines.push(`  - ${trace.id}: ${trace.summary}`);
  }
  lines.push('', `${messages.labels.currentEvidence}:`);
  if (pack.evidence.length === 0) lines.push(`  - ${messages.common.none}`);
  for (const evidence of pack.evidence) {
    lines.push(`  - [${evidence.sourceType}] ${evidence.sourceRef}: ${evidence.summary}`);
  }
  lines.push('', `${messages.labels.agentGrillPrompt}:`, pack.grillMePrompt);
  lines.push('', `${messages.labels.checklist}:`);
  for (const item of pack.grillMeChecklist) lines.push(`  - ${item}`);
  lines.push('', `${messages.labels.grillProtocol}:`);
  for (const rule of pack.grillMeProtocol) lines.push(`  - ${rule}`);
  lines.push(
    '',
    `${messages.labels.draftSchema}:`,
    JSON.stringify(pack.draftSchemaExample, null, 2),
  );
  lines.push('', nextAction);
  return lines.join('\n');
}

export function renderBrief(view: BriefView): string {
  return renderBriefMarkdown(view);
}

export function renderBriefTerminal(
  view: BriefView,
  messages: V2MessageCatalog = enV2Messages,
): string {
  const lines: string[] = [];
  lines.push('────────────────────────────────────────');
  lines.push(messages.labels.implementationBrief);
  lines.push('────────────────────────────────────────');
  lines.push(`${messages.common.task}: ${view.task.id}`);
  lines.push(view.task.title);
  lines.push('');
  renderLocalizedDecisionSection(
    lines,
    messages.labels.explicit,
    view.decisions.EXPLICIT,
    messages,
  );
  renderLocalizedDecisionSection(
    lines,
    messages.labels.inferred,
    view.decisions.INFERRED,
    messages,
  );
  renderLocalizedDecisionSection(lines, messages.labels.carried, view.decisions.CARRIED, messages);
  renderLocalizedDecisionSection(
    lines,
    messages.labels.conflicts,
    view.decisions.CONFLICT,
    messages,
  );
  renderLocalizedDecisionSection(lines, messages.labels.open, view.decisions.OPEN, messages);
  lines.push(`${messages.labels.scopeExpected}:`);
  pushLocalizedList(lines, view.expectedScope, messages);
  lines.push(`${messages.labels.scopeAvoided}:`);
  pushLocalizedList(lines, view.avoidScope, messages);
  lines.push(`${messages.labels.questionsOpen}: ${String(view.openQuestionCount)}`);
  for (const question of view.questions) {
    lines.push(`${messages.common.question(question.id)}: ${question.text}`);
    lines.push(`${messages.prompt.recommended} ${question.recommendedAnswer}`);
    if (question.options.length > 0) {
      lines.push(`${messages.labels.options}:`);
      pushLocalizedList(lines, question.options, messages);
    }
  }
  lines.push(`${messages.labels.evidence}:`);
  if (view.evidence.length === 0) lines.push(`  - ${messages.common.none}`);
  for (const evidence of view.evidence) {
    lines.push(
      `  - [${evidence.sourceType}] ${evidence.sourceRef} (${String(evidence.confidence)}): ${evidence.summary}`,
    );
  }
  lines.push('────────────────────────────────────────');
  return lines.join('\n');
}

function renderLocalizedDecisionSection(
  lines: string[],
  title: string,
  decisions: BriefView['decisions']['EXPLICIT'],
  messages: V2MessageCatalog,
): void {
  lines.push(title);
  if (decisions.length === 0) {
    lines.push(`  - ${messages.common.none}`);
    lines.push('');
    return;
  }
  for (const decision of decisions) {
    lines.push(`[${decision.kind}] ${decision.id}. ${decision.title}`);
    lines.push(`${messages.labels.confidence}: ${decision.confidence.toFixed(2)}`);
    lines.push(`${messages.labels.summary}: ${decision.summary}`);
    if (decision.sourceRefs.length > 0) {
      lines.push(`${messages.labels.sourceRefs}:`);
      pushLocalizedList(lines, decision.sourceRefs, messages);
    }
    if (decision.rationale.length > 0) {
      lines.push(`${messages.labels.rationale}:`);
      pushLocalizedList(lines, decision.rationale, messages);
    }
    if (decision.appliesTo.length > 0) {
      lines.push(`${messages.labels.appliesTo}:`);
      pushLocalizedList(lines, decision.appliesTo, messages);
    }
    if (decision.avoids.length > 0) {
      lines.push(`${messages.labels.avoids}:`);
      pushLocalizedList(lines, decision.avoids, messages);
    }
    lines.push('');
  }
}

function pushLocalizedList(lines: string[], values: string[], messages: V2MessageCatalog): void {
  if (values.length === 0) {
    lines.push(`  - ${messages.common.none}`);
    return;
  }
  for (const value of values) lines.push(`  - ${value}`);
}

export function renderTrace(view: TraceView, messages: V2MessageCatalog = enV2Messages): string {
  const lines = [
    messages.commands.traceCreated,
    `${messages.labels.trace}: ${view.trace.id}`,
    '',
    `${messages.labels.changedFiles}:`,
  ];
  for (const file of view.filesChanged) lines.push(`  - ${file}`);
  lines.push('', `${messages.labels.decisionCodeMap}:`);
  if (view.trace.decisionToCodeMap.length === 0) lines.push(`  - ${messages.common.none}`);
  for (const map of view.trace.decisionToCodeMap) {
    lines.push(
      `  - ${map.decisionId}: ${map.files.join(', ') || messages.common.noFiles}${formatRelevance(map.reason, map.score, messages)}`,
    );
  }
  lines.push('', `${messages.labels.unmapped}:`);
  const unmappedDecisions = view.trace.unmappedDecisions ?? [];
  if (unmappedDecisions.length === 0) lines.push(`  - ${messages.common.none}`);
  for (const item of unmappedDecisions) {
    const files =
      item.files === undefined || item.files.length === 0
        ? messages.common.noFiles
        : item.files.join(', ');
    lines.push(
      `  - ${item.decisionId}: ${item.reason} (${messages.common.score} ${formatScore(item.score)}; ${messages.common.files}: ${files}) — ${item.summary}`,
    );
  }
  return lines.join('\n');
}

export function renderRecall(result: RecallResult): string {
  return renderRecallLocalized(result, enV2Messages);
}

export function renderRecallLocalized(
  result: RecallResult,
  messages: V2MessageCatalog = enV2Messages,
): string {
  const lines = [
    `${messages.labels.query}: ${result.query}`,
    '',
    `${messages.labels.relatedDecisions}:`,
  ];
  if (result.decisions.length === 0) lines.push(`  - ${messages.common.none}`);
  for (const decision of result.decisions) {
    lines.push(`  - ${decision.id} [${decision.kind}] ${decision.title}`);
    lines.push(`    ${decision.summary}`);
  }
  lines.push('', `${messages.labels.relatedTraces}:`);
  if (result.traces.length === 0) lines.push(`  - ${messages.common.none}`);
  for (const trace of result.traces) lines.push(`  - ${trace.id}: ${trace.summary}`);
  return lines.join('\n');
}

export function renderRebuildResult(
  result: RebuildResult,
  messages: V2MessageCatalog = enV2Messages,
): string {
  return [
    messages.commands.cacheRebuilt,
    `${messages.labels.tasks}: ${String(result.tasks)}`,
    `${messages.labels.decisions}: ${String(result.decisions)}`,
    `${messages.labels.questions}: ${String(result.questions)}`,
    `${messages.labels.evidence}: ${String(result.evidence)}`,
    `${messages.labels.contextItems}: ${String(result.contextItems)}`,
    `${messages.labels.briefSnapshots}: ${String(result.briefSnapshots)}`,
    `${messages.labels.implementationTraces}: ${String(result.implementationTraces)}`,
    `${messages.labels.events}: ${String(result.events)}`,
  ].join('\n');
}

export function renderRememberResult(
  result: RememberResult,
  messages: V2MessageCatalog = enV2Messages,
): string {
  return [
    messages.commands.remembered,
    `${messages.common.created}:`,
    ...result.created.map((item) => `  - ${item}`),
    messages.workflow.nextRecallClose,
  ].join('\n');
}

export function renderDoctorResult(
  result: DoctorResult,
  messages: V2MessageCatalog = enV2Messages,
): string {
  if (result.healthy) {
    return [
      messages.doctor.healthy,
      ...result.repaired.map(
        (item) =>
          `${messages.doctor.repaired}: ${renderDoctorRepair(item.code, item.params, messages)}`,
      ),
    ].join('\n');
  }
  return [
    messages.doctor.problems,
    ...result.issues.flatMap((issue) => [
      `- [${issue.code}] ${renderDoctorIssueMessage(issue.code, issue.params, issue.message, messages)}`,
      `  ${messages.doctor.recovery}: ${renderDoctorRecovery(issue.code, issue.recovery, messages)}`,
    ]),
  ].join('\n');
}

function renderDoctorIssueMessage(
  code: string,
  params: Record<string, string>,
  fallback: string,
  messages: V2MessageCatalog,
): string {
  return messages.doctor.issueMessages[code]?.(params) ?? fallback;
}

function renderDoctorRecovery(code: string, fallback: string, messages: V2MessageCatalog): string {
  return messages.doctor.recoveries[code] ?? fallback;
}

function renderDoctorRepair(
  code: string,
  params: Record<string, string>,
  messages: V2MessageCatalog,
): string {
  return messages.doctor.repairs[code]?.(params) ?? code;
}

function nextAction(view: StatusView, messages: V2MessageCatalog): string {
  if (view.indicators.grillMeRequired && !view.indicators.grillMeStarted)
    return messages.workflow.nextGrillMe;
  if (view.indicators.questionsOpen > 0) return messages.workflow.nextAsk;
  if (view.task?.status === 'CONFIRMED') return messages.workflow.nextImplementTrace;
  if (view.task?.status === 'BRIEF_READY') return messages.workflow.nextBriefConfirm;
  return `${messages.workflow.nextContext} / ${messages.workflow.nextSubmit}`;
}

function formatGrillMe(view: StatusView, messages: V2MessageCatalog): string {
  if (!view.indicators.grillMeRequired) return messages.labels.grillMePermissive;
  return view.indicators.grillMeStarted
    ? messages.labels.grillMeStarted
    : messages.workflow.nextGrillMe;
}

function formatItemRelevance(
  metadata: Record<string, unknown>,
  messages: V2MessageCatalog,
): string {
  const reason = typeof metadata['reason'] === 'string' ? metadata['reason'] : undefined;
  const score = typeof metadata['score'] === 'number' ? metadata['score'] : undefined;
  return formatRelevance(reason, score, messages);
}

function formatRelevance(
  reason: string | undefined,
  score: number | undefined,
  messages: V2MessageCatalog,
): string {
  if (reason === undefined && score === undefined) return '';
  if (reason !== undefined) return messages.common.relevance(reason, score);
  return ` — ${messages.common.score} ${formatScore(score ?? 0)}`;
}

function formatScore(score: number): string {
  return Number.isInteger(score) ? score.toFixed(1) : String(score);
}
