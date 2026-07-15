import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import { createRequire } from 'node:module';
import * as path from 'node:path';

import { V2ExpectedError } from './errors.js';
import {
  sourceDecisionsDir,
  sourceDirs,
  sourceImplementationsDir,
  sourceTasksDir,
} from './paths.js';
import { cacheHasRows } from './store.js';

import type {
  DecisionSourceDocument,
  SourceBundle,
  SourceWriteResult,
  TaskSourceDocument,
  TraceSourceDocument,
} from './source-types.js';
import type {
  BriefSnapshot,
  ContextItem,
  Decision,
  DecisionKind,
  DecisionStatus,
  EventRecord,
  EventType,
  Evidence,
  ImplementationTrace,
  Question,
  Task,
  TaskStatus,
} from '../../types/index.js';

const require = createRequire(import.meta.url);
const yaml = require('js-yaml') as {
  dump(value: unknown, options?: Record<string, unknown>): string;
  load(value: string): unknown;
};

const SOURCE_BLOCK_RE = /```json\s+sduck-source\s*\n([\s\S]*?)\n```/m;

export interface SourceManifestEntry {
  path: string;
  size: number;
  sha256: string;
}

export type V2ProblemCode =
  | 'array'
  | 'boolean'
  | 'confidence'
  | 'duplicate-id'
  | 'expected-reference'
  | 'hash-or-null'
  | 'json-object'
  | 'missing-decision'
  | 'missing-task'
  | 'missing-trace-decision'
  | 'non-empty-string'
  | 'non-negative-number'
  | 'number'
  | 'parse'
  | 'portable-id'
  | 'string'
  | 'unsupported-enum-value'
  | 'wrong-task'
  | 'yaml-frontmatter'
  | 'yaml-object';

export class SourceParseError extends V2ExpectedError {
  constructor(
    readonly filePath: string,
    readonly field: string,
    problemCode: V2ProblemCode,
    params: Record<string, string | number | boolean> = {},
    detail = '',
  ) {
    super(
      'SOURCE_PARSE',
      {
        path: filePath,
        field,
        problemCode,
        detail,
        ...params,
      },
      `${filePath}: ${field}: ${problemCode}${detail === '' ? '' : `: ${detail}`}`,
    );
    this.name = 'SourceParseError';
  }
}

export function emptySourceBundle(): SourceBundle {
  return {
    tasks: [],
    decisions: [],
    questions: [],
    evidence: [],
    contextItems: [],
    briefSnapshots: [],
    implementationTraces: [],
    events: [],
  };
}

export function ensureSourceDirs(projectRoot: string): void {
  for (const dir of sourceDirs(projectRoot)) fs.mkdirSync(dir, { recursive: true });
}

export function sourceFileCount(projectRoot: string): number {
  return sourceDirs(projectRoot).reduce((count, dir) => count + markdownFiles(dir).length, 0);
}

export function sourceManifest(projectRoot: string): SourceManifestEntry[] {
  const entries: SourceManifestEntry[] = [];
  for (const dir of sourceDirs(projectRoot)) {
    for (const file of markdownFiles(dir)) {
      const content = fs.readFileSync(file);
      entries.push({
        path: path.relative(projectRoot, file).split(path.sep).join('/'),
        size: content.byteLength,
        sha256: createHash('sha256').update(content).digest('hex'),
      });
    }
  }
  return entries.sort((a, b) => a.path.localeCompare(b.path));
}

export function sourceFingerprint(projectRoot: string): string {
  return JSON.stringify(sourceManifest(projectRoot));
}

export function loadSourceBundle(projectRoot: string): SourceBundle {
  const bundle = emptySourceBundle();
  for (const file of markdownFiles(sourceTasksDir(projectRoot))) {
    const doc = parseTaskSource(file);
    bundle.tasks.push(doc.task);
    bundle.questions.push(...doc.questions);
    bundle.evidence.push(...doc.evidence);
    bundle.contextItems.push(...doc.contextItems);
    bundle.briefSnapshots.push(...doc.briefSnapshots);
    bundle.events.push(...doc.events);
  }
  for (const file of markdownFiles(sourceDecisionsDir(projectRoot))) {
    bundle.decisions.push(parseDecisionSource(file).decision);
  }
  for (const file of markdownFiles(sourceImplementationsDir(projectRoot))) {
    bundle.implementationTraces.push(parseTraceSource(file).trace);
  }
  validateSourceBundle(bundle);
  return bundle;
}

export function loadSourceBundleForWrite(projectRoot: string): SourceBundle {
  if (sourceFileCount(projectRoot) === 0 && cacheHasRows(projectRoot)) {
    throw new V2ExpectedError('SOURCE_DB_ONLY');
  }
  return loadSourceBundle(projectRoot);
}

export function nextSourceEntityId(ids: string[], prefix: string): string {
  const max = ids.reduce((highest, id) => {
    const match = new RegExp(`^${escapeRegExp(prefix)}-(\\d+)$`).exec(id);
    if (match?.[1] === undefined) return highest;
    return Math.max(highest, Number.parseInt(match[1], 10));
  }, 0);
  return `${prefix}-${String(max + 1).padStart(4, '0')}`;
}

export function appendSourceEvent(
  bundle: SourceBundle,
  input: { taskId: string | null; type: EventType; payload?: Record<string, unknown> },
): EventRecord {
  const event: EventRecord = {
    id: nextSourceEntityId(
      bundle.events.map((item) => item.id),
      'EVT',
    ),
    taskId: input.taskId,
    type: input.type,
    payload: input.payload ?? {},
    createdAt: new Date().toISOString(),
  };
  bundle.events.push(event);
  return event;
}

export function writeSourceBundle(projectRoot: string, bundle: SourceBundle): SourceWriteResult {
  validateSourceBundle(bundle);
  ensureSourceDirs(projectRoot);
  const written: string[] = [];
  for (const task of bundle.tasks) {
    const doc: TaskSourceDocument = {
      task,
      questions: bundle.questions.filter((question) => question.taskId === task.id),
      evidence: bundle.evidence.filter((item) => item.taskId === task.id),
      contextItems: bundle.contextItems.filter((item) => item.taskId === task.id),
      briefSnapshots: bundle.briefSnapshots.filter((snapshot) => snapshot.taskId === task.id),
      events: bundle.events.filter((event) => event.taskId === task.id),
    };
    written.push(
      writeAtomic(path.join(sourceTasksDir(projectRoot), `${task.id}.md`), renderTaskSource(doc)),
    );
  }
  for (const decision of bundle.decisions) {
    const doc: DecisionSourceDocument = { decision };
    written.push(
      writeAtomic(
        path.join(sourceDecisionsDir(projectRoot), `${decision.id}.md`),
        renderDecisionSource(doc),
      ),
    );
  }
  for (const trace of bundle.implementationTraces) {
    const doc: TraceSourceDocument = { trace };
    written.push(
      writeAtomic(
        path.join(sourceImplementationsDir(projectRoot), `${trace.id}.md`),
        renderTraceSource(doc),
      ),
    );
  }
  return { written };
}

export function writeTaskSource(projectRoot: string, doc: TaskSourceDocument): string {
  ensureSourceDirs(projectRoot);
  return writeAtomic(
    path.join(sourceTasksDir(projectRoot), `${doc.task.id}.md`),
    renderTaskSource(doc),
  );
}

export function writeDecisionSource(projectRoot: string, doc: DecisionSourceDocument): string {
  ensureSourceDirs(projectRoot);
  return writeAtomic(
    path.join(sourceDecisionsDir(projectRoot), `${doc.decision.id}.md`),
    renderDecisionSource(doc),
  );
}

export function writeTraceSource(projectRoot: string, doc: TraceSourceDocument): string {
  ensureSourceDirs(projectRoot);
  return writeAtomic(
    path.join(sourceImplementationsDir(projectRoot), `${doc.trace.id}.md`),
    renderTraceSource(doc),
  );
}

function renderTaskSource(doc: TaskSourceDocument): string {
  const task = doc.task;
  return renderMarkdown(
    {
      id: task.id,
      type: 'task',
      status: task.status,
      title: task.title,
      created_at: task.createdAt,
      updated_at: task.updatedAt,
    },
    `# ${task.id}: ${task.title}\n\n${task.description}\n\n## Sduck source\n\n${renderSourceJson(doc)}`,
  );
}

function renderDecisionSource(doc: DecisionSourceDocument): string {
  const decision = doc.decision;
  return renderMarkdown(
    {
      id: decision.id,
      type: 'decision',
      task_id: decision.taskId,
      kind: decision.kind,
      status: decision.status,
      confidence: decision.confidence,
      source_refs: decision.sourceRefs,
      applies_to: decision.appliesTo,
      avoids: decision.avoids,
      created_at: decision.createdAt,
      updated_at: decision.updatedAt,
    },
    `# ${decision.id}: ${decision.title}\n\n## Decision\n${decision.summary}\n\n## Rationale\n${decision.rationale.map((item) => `- ${item}`).join('\n') || '- none'}\n\n## Sduck source\n\n${renderSourceJson(doc)}`,
  );
}

function renderTraceSource(doc: TraceSourceDocument): string {
  const trace = doc.trace;
  const mapped = trace.decisionToCodeMap.map(formatTraceMapLine).join('\n') || '- none';
  const unmapped =
    (trace.unmappedDecisions ?? []).map(formatUnmappedDecisionLine).join('\n') || '- none';
  return renderMarkdown(
    {
      id: trace.id,
      type: 'implementation_trace',
      task_id: trace.taskId,
      implements: trace.decisionIds,
      files_changed: trace.filesChanged,
      created_at: trace.createdAt,
    },
    `# ${trace.id}: Implementation trace\n\n## Summary\n${trace.summary}\n\n## Decision to code map\n${mapped}\n\n## Unmapped decisions requiring review\n${unmapped}\n\n## Sduck source\n\n${renderSourceJson(doc)}`,
  );
}

function formatTraceMapLine(item: ImplementationTrace['decisionToCodeMap'][number]): string {
  return `- ${item.decisionId}: ${item.files.join(', ')} — ${item.summary}${formatRelevance(item.reason, item.score)}`;
}

function formatUnmappedDecisionLine(
  item: NonNullable<ImplementationTrace['unmappedDecisions']>[number],
): string {
  return `- ${item.decisionId}: ${item.reason} (score ${formatScore(item.score)}) — ${item.summary}`;
}

function formatRelevance(reason: string | undefined, score: number | undefined): string {
  if (reason === undefined && score === undefined) return '';
  if (reason !== undefined && score !== undefined) {
    return ` (${reason}; score ${formatScore(score)})`;
  }
  if (reason !== undefined) return ` (${reason})`;
  return ` (score ${formatScore(score ?? 0)})`;
}

function formatScore(score: number): string {
  return Number.isInteger(score) ? score.toFixed(1) : String(score);
}

function renderMarkdown(frontmatter: Record<string, unknown>, body: string): string {
  const header = yaml.dump(frontmatter, { lineWidth: 120, noRefs: true }).trimEnd();
  return `---\n${header}\n---\n${body.trimEnd()}\n`;
}

function renderSourceJson(value: unknown): string {
  return `\`\`\`json sduck-source\n${JSON.stringify(value, null, 2)}\n\`\`\``;
}

function parseTaskSource(filePath: string): TaskSourceDocument {
  const raw = parseSourceBlock(filePath);
  if (raw !== null) {
    assertObject(raw, filePath, 'sduck-source');
    assertTask(raw['task'], filePath, 'task');
    assertArray(raw['questions'], filePath, 'questions');
    assertArray(raw['evidence'], filePath, 'evidence');
    assertArray(raw['contextItems'], filePath, 'contextItems');
    assertArray(raw['briefSnapshots'], filePath, 'briefSnapshots');
    assertArray(raw['events'], filePath, 'events');
    raw['questions'].forEach((item, index) => {
      assertQuestion(item, filePath, `questions[${String(index)}]`);
    });
    raw['evidence'].forEach((item, index) => {
      assertEvidence(item, filePath, `evidence[${String(index)}]`);
    });
    raw['contextItems'].forEach((item, index) => {
      assertContextItem(item, filePath, `contextItems[${String(index)}]`);
    });
    raw['briefSnapshots'].forEach((item, index) => {
      assertBriefSnapshot(item, filePath, `briefSnapshots[${String(index)}]`);
    });
    raw['events'].forEach((item, index) => {
      assertEvent(item, filePath, `events[${String(index)}]`);
    });
    return raw as unknown as TaskSourceDocument;
  }
  const { frontmatter, body } = parseFrontmatter(filePath);
  const id = assertFrontmatterString(frontmatter, filePath, 'id');
  const status = assertFrontmatterString(frontmatter, filePath, 'status') as TaskStatus;
  const createdAt = assertFrontmatterString(frontmatter, filePath, 'created_at');
  const title = extractTitle(body, id);
  return {
    task: {
      id,
      title,
      description: title,
      status,
      expectedScope: [],
      avoidScope: [],
      createdAt,
      updatedAt: stringField(frontmatter['updated_at'], createdAt),
    },
    questions: [],
    evidence: [],
    contextItems: [],
    briefSnapshots: [],
    events: [],
  };
}

function parseDecisionSource(filePath: string): DecisionSourceDocument {
  const raw = parseSourceBlock(filePath);
  if (raw !== null) {
    assertObject(raw, filePath, 'sduck-source');
    assertDecision(raw['decision'], filePath, 'decision');
    return raw as unknown as DecisionSourceDocument;
  }
  const { frontmatter, body } = parseFrontmatter(filePath);
  const id = assertFrontmatterString(frontmatter, filePath, 'id');
  const createdAt = assertFrontmatterString(frontmatter, filePath, 'created_at');
  return {
    decision: {
      id,
      taskId: assertFrontmatterString(frontmatter, filePath, 'task_id'),
      title: extractTitle(body, id),
      kind: assertFrontmatterString(frontmatter, filePath, 'kind') as DecisionKind,
      status: assertFrontmatterString(frontmatter, filePath, 'status') as DecisionStatus,
      confidence: numberField(frontmatter['confidence'], 0.7),
      summary: extractSection(body, 'Decision'),
      rationale: extractListSection(body, 'Rationale'),
      appliesTo: stringArrayField(frontmatter['applies_to']),
      avoids: stringArrayField(frontmatter['avoids']),
      sourceRefs: stringArrayField(frontmatter['source_refs']),
      createdAt,
      updatedAt: stringField(frontmatter['updated_at'], createdAt),
    },
  };
}

function parseTraceSource(filePath: string): TraceSourceDocument {
  const raw = parseSourceBlock(filePath);
  if (raw !== null) {
    assertObject(raw, filePath, 'sduck-source');
    assertTrace(raw['trace'], filePath, 'trace');
    return raw as unknown as TraceSourceDocument;
  }
  const { frontmatter, body } = parseFrontmatter(filePath);
  return {
    trace: {
      id: assertFrontmatterString(frontmatter, filePath, 'id'),
      taskId: assertFrontmatterString(frontmatter, filePath, 'task_id'),
      decisionIds: stringArrayField(frontmatter['implements']),
      filesChanged: stringArrayField(frontmatter['files_changed']),
      summary: extractSection(body, 'Summary'),
      decisionToCodeMap: [],
      createdAt: assertFrontmatterString(frontmatter, filePath, 'created_at'),
    },
  };
}

function parseSourceBlock(filePath: string): unknown {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = SOURCE_BLOCK_RE.exec(content);
  if (match?.[1] === undefined) return null;
  try {
    return JSON.parse(match[1]) as unknown;
  } catch (error) {
    throw new SourceParseError(filePath, 'sduck-source', 'parse', {}, formatUnknownError(error));
  }
}

function parseFrontmatter(filePath: string): {
  frontmatter: Record<string, unknown>;
  body: string;
} {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/m.exec(content);
  if (match?.[1] === undefined || match[2] === undefined) {
    throw new SourceParseError(filePath, 'frontmatter', 'yaml-frontmatter');
  }
  try {
    const loaded = yaml.load(match[1]);
    if (typeof loaded !== 'object' || loaded === null || Array.isArray(loaded)) {
      throw new SourceParseError(filePath, 'frontmatter', 'yaml-object');
    }
    return { frontmatter: loaded as Record<string, unknown>, body: match[2] };
  } catch (error) {
    if (error instanceof SourceParseError) throw error;
    throw new SourceParseError(filePath, 'frontmatter', 'parse', {}, formatUnknownError(error));
  }
}

function markdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((entry) => entry.endsWith('.md'))
    .map((entry) => path.join(dir, entry))
    .sort();
}

function writeAtomic(filePath: string, content: string): string {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.${String(process.pid)}.${String(Date.now())}.tmp`;
  fs.writeFileSync(tmp, content);
  fs.renameSync(tmp, filePath);
  return filePath;
}

function assertTask(value: unknown, filePath: string, field: string): asserts value is Task {
  assertObject(value, filePath, field);
  assertPortableId(value['id'], filePath, `${field}.id`);
  assertNonEmptyString(value['title'], filePath, `${field}.title`);
  assertNonEmptyString(value['description'], filePath, `${field}.description`);
  assertEnum(
    value['status'],
    ['OPEN', 'BRIEF_READY', 'CONFIRMED', 'CLOSED', 'ABANDONED'],
    filePath,
    `${field}.status`,
  );
  assertStringArray(value['expectedScope'], filePath, `${field}.expectedScope`);
  assertStringArray(value['avoidScope'], filePath, `${field}.avoidScope`);
  assertNonEmptyString(value['createdAt'], filePath, `${field}.createdAt`);
  assertNonEmptyString(value['updatedAt'], filePath, `${field}.updatedAt`);
}

function assertDecision(
  value: unknown,
  filePath: string,
  field: string,
): asserts value is Decision {
  assertObject(value, filePath, field);
  assertPortableId(value['id'], filePath, `${field}.id`);
  assertPortableId(value['taskId'], filePath, `${field}.taskId`);
  for (const key of ['title', 'kind', 'status', 'summary', 'createdAt', 'updatedAt'])
    assertNonEmptyString(value[key], filePath, `${field}.${key}`);
  assertEnum(
    value['kind'],
    ['EXPLICIT', 'INFERRED', 'CARRIED', 'CONFLICT', 'OPEN'],
    filePath,
    `${field}.kind`,
  );
  assertEnum(
    value['status'],
    ['DRAFT', 'CONFIRMED', 'REJECTED', 'SUPERSEDED'],
    filePath,
    `${field}.status`,
  );
  assertConfidence(value['confidence'], filePath, `${field}.confidence`);
  for (const key of ['rationale', 'appliesTo', 'avoids', 'sourceRefs']) {
    assertStringArray(value[key], filePath, `${field}.${key}`);
  }
}

function assertTrace(
  value: unknown,
  filePath: string,
  field: string,
): asserts value is ImplementationTrace {
  assertObject(value, filePath, field);
  assertPortableId(value['id'], filePath, `${field}.id`);
  assertPortableId(value['taskId'], filePath, `${field}.taskId`);
  for (const key of ['summary', 'createdAt'])
    assertNonEmptyString(value[key], filePath, `${field}.${key}`);
  assertStringArray(value['decisionIds'], filePath, `${field}.decisionIds`);
  assertStringArray(value['filesChanged'], filePath, `${field}.filesChanged`);
  const decisionToCodeMap = value['decisionToCodeMap'];
  assertArray(decisionToCodeMap, filePath, `${field}.decisionToCodeMap`);
  decisionToCodeMap.forEach((item, index) => {
    assertDecisionToCodeMap(item, filePath, `${field}.decisionToCodeMap[${String(index)}]`);
  });
  if (value['unmappedDecisions'] !== undefined) {
    const unmappedDecisions = value['unmappedDecisions'];
    assertArray(unmappedDecisions, filePath, `${field}.unmappedDecisions`);
    unmappedDecisions.forEach((item, index) => {
      assertUnmappedDecision(item, filePath, `${field}.unmappedDecisions[${String(index)}]`);
    });
  }
}

function assertQuestion(
  value: unknown,
  filePath: string,
  field: string,
): asserts value is Question {
  assertObject(value, filePath, field);
  assertPortableId(value['id'], filePath, `${field}.id`);
  assertPortableId(value['taskId'], filePath, `${field}.taskId`);
  for (const key of ['text', 'recommendedAnswer', 'createdAt'])
    assertNonEmptyString(value[key], filePath, `${field}.${key}`);
  if (value['decisionId'] !== null && value['decisionId'] !== undefined) {
    assertPortableId(value['decisionId'], filePath, `${field}.decisionId`);
  }
  for (const key of ['rationale', 'options'])
    assertStringArray(value[key], filePath, `${field}.${key}`);
  if (typeof value['answered'] !== 'boolean') {
    throw new SourceParseError(filePath, `${field}.answered`, 'boolean');
  }
  if (value['answer'] !== null && value['answer'] !== undefined) {
    assertNonEmptyString(value['answer'], filePath, `${field}.answer`);
  }
}

function assertEvidence(
  value: unknown,
  filePath: string,
  field: string,
): asserts value is Evidence {
  assertObject(value, filePath, field);
  assertPortableId(value['id'], filePath, `${field}.id`);
  assertPortableId(value['taskId'], filePath, `${field}.taskId`);
  for (const key of ['sourceRef', 'summary', 'createdAt'])
    assertNonEmptyString(value[key], filePath, `${field}.${key}`);
  assertEnum(
    value['sourceType'],
    [
      'USER_ANSWER',
      'CODE',
      'DECISION_DOC',
      'IMPLEMENTATION_TRACE',
      'GRAPHIFY_REPORT',
      'GRAPHIFY_GRAPH',
      'DISCOVERY',
    ],
    filePath,
    `${field}.sourceType`,
  );
  if (value['decisionId'] !== null && value['decisionId'] !== undefined) {
    assertPortableId(value['decisionId'], filePath, `${field}.decisionId`);
  }
  assertConfidence(value['confidence'], filePath, `${field}.confidence`);
}

function assertContextItem(
  value: unknown,
  filePath: string,
  field: string,
): asserts value is ContextItem {
  assertObject(value, filePath, field);
  assertPortableId(value['id'], filePath, `${field}.id`);
  assertPortableId(value['taskId'], filePath, `${field}.taskId`);
  for (const key of ['sourceRef', 'summary', 'createdAt'])
    assertNonEmptyString(value[key], filePath, `${field}.${key}`);
  assertEnum(
    value['sourceType'],
    ['DISCOVERY', 'FILE', 'GRAPHIFY_REPORT', 'GRAPHIFY_GRAPH', 'MEMORY'],
    filePath,
    `${field}.sourceType`,
  );
  assertObject(value['metadata'], filePath, `${field}.metadata`);
}

function assertBriefSnapshot(
  value: unknown,
  filePath: string,
  field: string,
): asserts value is BriefSnapshot {
  assertObject(value, filePath, field);
  assertPortableId(value['id'], filePath, `${field}.id`);
  assertPortableId(value['taskId'], filePath, `${field}.taskId`);
  for (const key of ['renderedMarkdown', 'createdAt'])
    assertNonEmptyString(value[key], filePath, `${field}.${key}`);
  assertObject(value['snapshot'], filePath, `${field}.snapshot`);
  const snapshot = value['snapshot'];
  assertTask(snapshot['task'], filePath, `${field}.snapshot.task`);
  assertObject(snapshot['decisions'], filePath, `${field}.snapshot.decisions`);
  for (const kind of ['EXPLICIT', 'INFERRED', 'CARRIED', 'CONFLICT', 'OPEN']) {
    const decisions = snapshot['decisions'][kind];
    assertArray(decisions, filePath, `${field}.snapshot.decisions.${kind}`);
    decisions.forEach((decision, index) => {
      assertDecision(decision, filePath, `${field}.snapshot.decisions.${kind}[${String(index)}]`);
    });
  }
  assertArray(snapshot['questions'], filePath, `${field}.snapshot.questions`);
  snapshot['questions'].forEach((question, index) => {
    assertQuestion(question, filePath, `${field}.snapshot.questions[${String(index)}]`);
  });
  assertArray(snapshot['evidence'], filePath, `${field}.snapshot.evidence`);
  snapshot['evidence'].forEach((evidence, index) => {
    assertEvidence(evidence, filePath, `${field}.snapshot.evidence[${String(index)}]`);
  });
  assertStringArray(snapshot['expectedScope'], filePath, `${field}.snapshot.expectedScope`);
  assertStringArray(snapshot['avoidScope'], filePath, `${field}.snapshot.avoidScope`);
  if (typeof snapshot['openQuestionCount'] !== 'number' || snapshot['openQuestionCount'] < 0) {
    throw new SourceParseError(
      filePath,
      `${field}.snapshot.openQuestionCount`,
      'non-negative-number',
    );
  }
  if (value['gitBaseline'] !== undefined) {
    assertObject(value['gitBaseline'], filePath, `${field}.gitBaseline`);
    const baseline = value['gitBaseline'];
    if (baseline['head'] !== null) {
      assertNonEmptyString(baseline['head'], filePath, `${field}.gitBaseline.head`);
    }
    assertObject(baseline['dirtyFileHashes'], filePath, `${field}.gitBaseline.dirtyFileHashes`);
    for (const [file, hash] of Object.entries(baseline['dirtyFileHashes'])) {
      if (hash !== null && (typeof hash !== 'string' || hash === '')) {
        throw new SourceParseError(
          filePath,
          `${field}.gitBaseline.dirtyFileHashes.${file}`,
          'hash-or-null',
        );
      }
    }
  }
}

function assertEvent(
  value: unknown,
  filePath: string,
  field: string,
): asserts value is EventRecord {
  assertObject(value, filePath, field);
  assertPortableId(value['id'], filePath, `${field}.id`);
  if (value['taskId'] !== null && value['taskId'] !== undefined) {
    assertPortableId(value['taskId'], filePath, `${field}.taskId`);
  }
  assertEnum(
    value['type'],
    [
      'TASK_CREATED',
      'CONTEXT_INDEXED',
      'CONTEXT_ITEM_ADDED',
      'GRILL_STARTED',
      'DRAFT_SUBMITTED',
      'QUESTION_ANSWERED',
      'DECISION_CREATED',
      'BRIEF_CONFIRMED',
      'TRACE_CREATED',
      'EXPORT_WRITTEN',
      'TASK_CLOSED',
      'TASK_ABANDONED',
    ],
    filePath,
    `${field}.type`,
  );
  assertObject(value['payload'], filePath, `${field}.payload`);
  if (value['type'] === 'TASK_CREATED' && value['payload']['policy'] !== undefined) {
    assertTaskCreatedPolicySnapshot(
      value['payload']['policy'],
      filePath,
      `${field}.payload.policy`,
    );
  }
  assertNonEmptyString(value['createdAt'], filePath, `${field}.createdAt`);
}

function assertTaskCreatedPolicySnapshot(value: unknown, filePath: string, field: string): void {
  assertObject(value, filePath, field);
  if (typeof value['grillMeRequired'] !== 'boolean') {
    throw new SourceParseError(filePath, `${field}.grillMeRequired`, 'boolean');
  }
}

function assertDecisionToCodeMap(
  value: unknown,
  filePath: string,
  field: string,
): asserts value is ImplementationTrace['decisionToCodeMap'][number] {
  assertObject(value, filePath, field);
  assertPortableId(value['decisionId'], filePath, `${field}.decisionId`);
  assertStringArray(value['files'], filePath, `${field}.files`);
  assertNonEmptyString(value['summary'], filePath, `${field}.summary`);
}

function assertUnmappedDecision(
  value: unknown,
  filePath: string,
  field: string,
): asserts value is NonNullable<ImplementationTrace['unmappedDecisions']>[number] {
  assertObject(value, filePath, field);
  assertPortableId(value['decisionId'], filePath, `${field}.decisionId`);
  assertNonEmptyString(value['summary'], filePath, `${field}.summary`);
  assertNonEmptyString(value['reason'], filePath, `${field}.reason`);
  if (typeof value['score'] !== 'number') {
    throw new SourceParseError(filePath, `${field}.score`, 'number');
  }
  if (value['files'] !== undefined) assertStringArray(value['files'], filePath, `${field}.files`);
  if (value['appliesTo'] !== undefined)
    assertStringArray(value['appliesTo'], filePath, `${field}.appliesTo`);
}

function assertObject(
  value: unknown,
  filePath: string,
  field: string,
): asserts value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new SourceParseError(filePath, field, 'json-object');
  }
}

function assertArray(value: unknown, filePath: string, field: string): asserts value is unknown[] {
  if (!Array.isArray(value)) throw new SourceParseError(filePath, field, 'array');
}

function assertStringArray(
  value: unknown,
  filePath: string,
  field: string,
): asserts value is string[] {
  assertArray(value, filePath, field);
  value.forEach((item, index) => {
    if (typeof item !== 'string') {
      throw new SourceParseError(filePath, `${field}[${String(index)}]`, 'string');
    }
  });
}

function assertEnum(
  value: unknown,
  allowed: readonly string[],
  filePath: string,
  field: string,
): asserts value is string {
  assertNonEmptyString(value, filePath, field);
  if (!allowed.includes(value)) {
    throw new SourceParseError(filePath, field, 'unsupported-enum-value', {
      allowed: allowed.join(', '),
      value,
    });
  }
}

function assertConfidence(
  value: unknown,
  filePath: string,
  field: string,
): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1) {
    throw new SourceParseError(filePath, field, 'confidence', { min: 0, max: 1 });
  }
}

function assertNonEmptyString(
  value: unknown,
  filePath: string,
  field: string,
): asserts value is string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new SourceParseError(filePath, field, 'non-empty-string');
  }
}

function assertPortableId(
  value: unknown,
  filePath: string,
  field: string,
): asserts value is string {
  assertNonEmptyString(value, filePath, field);
  if (
    value !== value.trim() ||
    value === '.' ||
    value === '..' ||
    value.includes('/') ||
    value.includes('\\') ||
    hasControlCharacter(value)
  ) {
    throw new SourceParseError(filePath, field, 'portable-id', { value });
  }
}

function hasControlCharacter(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code < 0x20 || code === 0x7f) return true;
  }
  return false;
}

// js-yaml resolves unquoted timestamps (e.g. `created_at: 2026-07-07T05:00:00.000Z`)
// to JS Date objects. Normalize them back to ISO strings so externally written
// frontmatter does not break the whole source bundle.
function normalizeFrontmatterValue(value: unknown): unknown {
  return value instanceof Date ? value.toISOString() : value;
}

function assertFrontmatterString(
  frontmatter: Record<string, unknown>,
  filePath: string,
  field: string,
): string {
  const value = normalizeFrontmatterValue(frontmatter[field]);
  assertNonEmptyString(value, filePath, field);
  return value;
}

function validateUnique(values: string[], field: string): void {
  const seen = new Map<string, string>();
  for (const value of values) {
    const normalized = value.toLocaleLowerCase('en-US');
    const previous = seen.get(normalized);
    if (previous !== undefined) {
      throw sourceValidation(field, 'duplicate-id', { value, previous });
    }
    seen.set(normalized, value);
  }
}

export function validateSourceBundle(bundle: SourceBundle): void {
  const filePath = '<decision-workspace>';
  bundle.tasks.forEach((item, index) => {
    assertTask(item, filePath, `tasks[${String(index)}]`);
  });
  bundle.decisions.forEach((item, index) => {
    assertDecision(item, filePath, `decisions[${String(index)}]`);
  });
  bundle.questions.forEach((item, index) => {
    assertQuestion(item, filePath, `questions[${String(index)}]`);
  });
  bundle.evidence.forEach((item, index) => {
    assertEvidence(item, filePath, `evidence[${String(index)}]`);
  });
  bundle.contextItems.forEach((item, index) => {
    assertContextItem(item, filePath, `contextItems[${String(index)}]`);
  });
  bundle.briefSnapshots.forEach((item, index) => {
    assertBriefSnapshot(item, filePath, `briefSnapshots[${String(index)}]`);
  });
  bundle.implementationTraces.forEach((item, index) => {
    assertTrace(item, filePath, `implementationTraces[${String(index)}]`);
  });
  bundle.events.forEach((item, index) => {
    assertEvent(item, filePath, `events[${String(index)}]`);
  });

  const idGroups: [string, string[]][] = [
    ['tasks.id', bundle.tasks.map((item) => item.id)],
    ['decisions.id', bundle.decisions.map((item) => item.id)],
    ['questions.id', bundle.questions.map((item) => item.id)],
    ['evidence.id', bundle.evidence.map((item) => item.id)],
    ['contextItems.id', bundle.contextItems.map((item) => item.id)],
    ['briefSnapshots.id', bundle.briefSnapshots.map((item) => item.id)],
    ['implementationTraces.id', bundle.implementationTraces.map((item) => item.id)],
    ['events.id', bundle.events.map((item) => item.id)],
  ];
  for (const [field, ids] of idGroups) validateUnique(ids, field);

  const taskIds = new Set(bundle.tasks.map((task) => task.id));
  const decisionsById = new Map(bundle.decisions.map((decision) => [decision.id, decision]));
  const decisionIds = new Set(decisionsById.keys());
  for (const decision of bundle.decisions) {
    if (!taskIds.has(decision.taskId))
      throw sourceValidation('decision.taskId', 'missing-task', { taskId: decision.taskId });
  }
  for (const question of bundle.questions) {
    if (!taskIds.has(question.taskId))
      throw sourceValidation('question.taskId', 'missing-task', { taskId: question.taskId });
    if (question.decisionId !== null && !decisionIds.has(question.decisionId)) {
      throw sourceValidation('question.decisionId', 'missing-decision', {
        decisionId: question.decisionId,
      });
    }
    if (
      question.decisionId !== null &&
      decisionsById.get(question.decisionId)?.taskId !== question.taskId
    ) {
      throw sourceValidation('question.decisionId', 'wrong-task', {
        decisionId: question.decisionId,
        taskId: question.taskId,
      });
    }
  }
  for (const item of bundle.evidence) {
    if (!taskIds.has(item.taskId))
      throw sourceValidation('evidence.taskId', 'missing-task', { taskId: item.taskId });
    if (item.decisionId !== null && !decisionIds.has(item.decisionId)) {
      throw sourceValidation('evidence.decisionId', 'missing-decision', {
        decisionId: item.decisionId,
      });
    }
    if (item.decisionId !== null && decisionsById.get(item.decisionId)?.taskId !== item.taskId) {
      throw sourceValidation('evidence.decisionId', 'wrong-task', {
        decisionId: item.decisionId,
        taskId: item.taskId,
      });
    }
  }
  for (const item of bundle.contextItems) {
    if (!taskIds.has(item.taskId))
      throw sourceValidation('contextItem.taskId', 'missing-task', { taskId: item.taskId });
  }
  for (const snapshot of bundle.briefSnapshots) {
    if (!taskIds.has(snapshot.taskId))
      throw sourceValidation('briefSnapshot.taskId', 'missing-task', { taskId: snapshot.taskId });
    if (snapshot.snapshot.task.id !== snapshot.taskId) {
      throw sourceValidation('briefSnapshot.snapshot.task.id', 'expected-reference', {
        expectedId: snapshot.taskId,
        actualId: snapshot.snapshot.task.id,
      });
    }
    for (const decisions of Object.values(snapshot.snapshot.decisions)) {
      for (const decision of decisions) {
        if (decision.taskId !== snapshot.taskId) {
          throw sourceValidation('briefSnapshot.snapshot.decisions', 'wrong-task', {
            decisionId: decision.id,
            taskId: decision.taskId,
            expectedTaskId: snapshot.taskId,
          });
        }
      }
    }
    for (const question of snapshot.snapshot.questions) {
      if (question.taskId !== snapshot.taskId) {
        throw sourceValidation('briefSnapshot.snapshot.questions', 'wrong-task', {
          questionId: question.id,
          taskId: question.taskId,
          expectedTaskId: snapshot.taskId,
        });
      }
    }
    for (const evidence of snapshot.snapshot.evidence) {
      if (evidence.taskId !== snapshot.taskId) {
        throw sourceValidation('briefSnapshot.snapshot.evidence', 'wrong-task', {
          evidenceId: evidence.id,
          taskId: evidence.taskId,
          expectedTaskId: snapshot.taskId,
        });
      }
    }
  }
  for (const trace of bundle.implementationTraces) {
    if (!taskIds.has(trace.taskId))
      throw sourceValidation('trace.taskId', 'missing-task', { taskId: trace.taskId });
    for (const decisionId of trace.decisionIds) {
      if (!decisionIds.has(decisionId))
        throw sourceValidation('trace.decisionIds', 'missing-decision', { decisionId });
      if (decisionsById.get(decisionId)?.taskId !== trace.taskId) {
        throw sourceValidation('trace.decisionIds', 'wrong-task', {
          decisionId,
          taskId: trace.taskId,
        });
      }
    }
    for (const mapping of trace.decisionToCodeMap) {
      if (!trace.decisionIds.includes(mapping.decisionId)) {
        throw sourceValidation('trace.decisionToCodeMap', 'missing-trace-decision', {
          decisionId: mapping.decisionId,
        });
      }
    }
    for (const unmapped of trace.unmappedDecisions ?? []) {
      if (!trace.decisionIds.includes(unmapped.decisionId)) {
        throw sourceValidation('trace.unmappedDecisions', 'missing-trace-decision', {
          decisionId: unmapped.decisionId,
        });
      }
    }
  }
  for (const event of bundle.events) {
    if (event.taskId !== null && !taskIds.has(event.taskId)) {
      throw sourceValidation('event.taskId', 'missing-task', { taskId: event.taskId });
    }
  }
}

function sourceValidation(
  field: string,
  problemCode: V2ProblemCode,
  params: Record<string, string | number | boolean> = {},
): V2ExpectedError {
  return new V2ExpectedError('SOURCE_VALIDATION', {
    field,
    problemCode,
    ...params,
  });
}

function stringArrayField(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function stringField(value: unknown, fallback: string): string {
  const normalized = normalizeFrontmatterValue(value);
  return typeof normalized === 'string' ? normalized : fallback;
}

function numberField(value: unknown, fallback: number): number {
  return typeof value === 'number' ? value : Number(value ?? fallback);
}

function extractTitle(body: string, id: string): string {
  const match = /^#\s+(.+)$/m.exec(body);
  if (match?.[1] === undefined) return id;
  return match[1].replace(new RegExp(`^${escapeRegExp(id)}:\\s*`), '').trim();
}

function extractSection(body: string, heading: string): string {
  const regex = new RegExp(`^## ${escapeRegExp(heading)}\\n([\\s\\S]*?)(?=^## |$)`, 'm');
  const match = regex.exec(body);
  return match?.[1]?.trim() ?? '';
}

function extractListSection(body: string, heading: string): string[] {
  return extractSection(body, heading)
    .split('\n')
    .map((line) => line.replace(/^[-*]\s+/, '').trim())
    .filter((line) => line !== '' && line !== 'none');
}

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function formatUnknownError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
