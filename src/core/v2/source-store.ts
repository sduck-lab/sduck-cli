import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import { createRequire } from 'node:module';
import * as path from 'node:path';

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

export class SourceParseError extends Error {
  constructor(
    readonly filePath: string,
    readonly field: string,
    message: string,
  ) {
    super(`${filePath}: ${field}: ${message}`);
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
  validateUnique(bundle.tasks.map((task) => task.id), 'tasks.id');
  validateUnique(bundle.decisions.map((decision) => decision.id), 'decisions.id');
  validateUnique(bundle.questions.map((question) => question.id), 'questions.id');
  validateUnique(bundle.evidence.map((item) => item.id), 'evidence.id');
  validateUnique(bundle.contextItems.map((item) => item.id), 'contextItems.id');
  validateUnique(bundle.briefSnapshots.map((snapshot) => snapshot.id), 'briefSnapshots.id');
  validateUnique(bundle.implementationTraces.map((trace) => trace.id), 'implementationTraces.id');
  validateUnique(bundle.events.map((event) => event.id), 'events.id');
  validateBundleReferences(bundle);
  return bundle;
}

export function loadSourceBundleForWrite(projectRoot: string): SourceBundle {
  if (sourceFileCount(projectRoot) === 0 && cacheHasRows(projectRoot)) {
    throw new Error('No markdown source files found. Run `sduck remember` before writing to this DB-only workspace.');
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
    written.push(writeAtomic(path.join(sourceTasksDir(projectRoot), `${task.id}.md`), renderTaskSource(doc)));
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
  return writeAtomic(path.join(sourceTasksDir(projectRoot), `${doc.task.id}.md`), renderTaskSource(doc));
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
  return renderMarkdown(
    {
      id: trace.id,
      type: 'implementation_trace',
      task_id: trace.taskId,
      implements: trace.decisionIds,
      files_changed: trace.filesChanged,
      created_at: trace.createdAt,
    },
    `# ${trace.id}: Implementation trace\n\n## Summary\n${trace.summary}\n\n## Decision to code map\n${trace.decisionToCodeMap.map((item) => `- ${item.decisionId}: ${item.files.join(', ')} — ${item.summary}`).join('\n') || '- none'}\n\n## Sduck source\n\n${renderSourceJson(doc)}`,
  );
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
    throw new SourceParseError(filePath, 'sduck-source', formatUnknownError(error));
  }
}

function parseFrontmatter(filePath: string): { frontmatter: Record<string, unknown>; body: string } {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/m.exec(content);
  if (match?.[1] === undefined || match[2] === undefined) {
    throw new SourceParseError(filePath, 'frontmatter', 'missing YAML frontmatter');
  }
  try {
    const loaded = yaml.load(match[1]);
    if (typeof loaded !== 'object' || loaded === null || Array.isArray(loaded)) {
      throw new SourceParseError(filePath, 'frontmatter', 'must be a YAML object');
    }
    return { frontmatter: loaded as Record<string, unknown>, body: match[2] };
  } catch (error) {
    if (error instanceof SourceParseError) throw error;
    throw new SourceParseError(filePath, 'frontmatter', formatUnknownError(error));
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
  assertNonEmptyString(value['id'], filePath, `${field}.id`);
  assertNonEmptyString(value['title'], filePath, `${field}.title`);
  assertNonEmptyString(value['description'], filePath, `${field}.description`);
  assertNonEmptyString(value['status'], filePath, `${field}.status`);
  assertArray(value['expectedScope'], filePath, `${field}.expectedScope`);
  assertArray(value['avoidScope'], filePath, `${field}.avoidScope`);
  assertNonEmptyString(value['createdAt'], filePath, `${field}.createdAt`);
  assertNonEmptyString(value['updatedAt'], filePath, `${field}.updatedAt`);
}

function assertDecision(value: unknown, filePath: string, field: string): asserts value is Decision {
  assertObject(value, filePath, field);
  for (const key of ['id', 'taskId', 'title', 'kind', 'status', 'summary', 'createdAt', 'updatedAt']) {
    assertNonEmptyString(value[key], filePath, `${field}.${key}`);
  }
  if (typeof value['confidence'] !== 'number') {
    throw new SourceParseError(filePath, `${field}.confidence`, 'must be a number');
  }
  for (const key of ['rationale', 'appliesTo', 'avoids', 'sourceRefs']) {
    assertArray(value[key], filePath, `${field}.${key}`);
  }
}

function assertTrace(
  value: unknown,
  filePath: string,
  field: string,
): asserts value is ImplementationTrace {
  assertObject(value, filePath, field);
  for (const key of ['id', 'taskId', 'summary', 'createdAt']) {
    assertNonEmptyString(value[key], filePath, `${field}.${key}`);
  }
  for (const key of ['decisionIds', 'filesChanged', 'decisionToCodeMap']) {
    assertArray(value[key], filePath, `${field}.${key}`);
  }
  const decisionToCodeMap = value['decisionToCodeMap'];
  assertArray(decisionToCodeMap, filePath, `${field}.decisionToCodeMap`);
  decisionToCodeMap.forEach((item, index) => {
    assertDecisionToCodeMap(item, filePath, `${field}.decisionToCodeMap[${String(index)}]`);
  });
}

function assertQuestion(value: unknown, filePath: string, field: string): asserts value is Question {
  assertObject(value, filePath, field);
  for (const key of ['id', 'taskId', 'text', 'recommendedAnswer', 'createdAt']) {
    assertNonEmptyString(value[key], filePath, `${field}.${key}`);
  }
  if (value['decisionId'] !== null && value['decisionId'] !== undefined) {
    assertNonEmptyString(value['decisionId'], filePath, `${field}.decisionId`);
  }
  for (const key of ['rationale', 'options']) assertArray(value[key], filePath, `${field}.${key}`);
  if (typeof value['answered'] !== 'boolean') {
    throw new SourceParseError(filePath, `${field}.answered`, 'must be a boolean');
  }
  if (value['answer'] !== null && value['answer'] !== undefined) {
    assertNonEmptyString(value['answer'], filePath, `${field}.answer`);
  }
}

function assertEvidence(value: unknown, filePath: string, field: string): asserts value is Evidence {
  assertObject(value, filePath, field);
  for (const key of ['id', 'taskId', 'sourceType', 'sourceRef', 'summary', 'createdAt']) {
    assertNonEmptyString(value[key], filePath, `${field}.${key}`);
  }
  if (value['decisionId'] !== null && value['decisionId'] !== undefined) {
    assertNonEmptyString(value['decisionId'], filePath, `${field}.decisionId`);
  }
  if (typeof value['confidence'] !== 'number') {
    throw new SourceParseError(filePath, `${field}.confidence`, 'must be a number');
  }
}

function assertContextItem(
  value: unknown,
  filePath: string,
  field: string,
): asserts value is ContextItem {
  assertObject(value, filePath, field);
  for (const key of ['id', 'taskId', 'sourceType', 'sourceRef', 'summary', 'createdAt']) {
    assertNonEmptyString(value[key], filePath, `${field}.${key}`);
  }
  assertObject(value['metadata'], filePath, `${field}.metadata`);
}

function assertBriefSnapshot(
  value: unknown,
  filePath: string,
  field: string,
): asserts value is BriefSnapshot {
  assertObject(value, filePath, field);
  for (const key of ['id', 'taskId', 'renderedMarkdown', 'createdAt']) {
    assertNonEmptyString(value[key], filePath, `${field}.${key}`);
  }
  assertObject(value['snapshot'], filePath, `${field}.snapshot`);
}

function assertEvent(value: unknown, filePath: string, field: string): asserts value is EventRecord {
  assertObject(value, filePath, field);
  assertNonEmptyString(value['id'], filePath, `${field}.id`);
  if (value['taskId'] !== null && value['taskId'] !== undefined) {
    assertNonEmptyString(value['taskId'], filePath, `${field}.taskId`);
  }
  assertNonEmptyString(value['type'], filePath, `${field}.type`);
  assertObject(value['payload'], filePath, `${field}.payload`);
  assertNonEmptyString(value['createdAt'], filePath, `${field}.createdAt`);
}

function assertDecisionToCodeMap(
  value: unknown,
  filePath: string,
  field: string,
): asserts value is ImplementationTrace['decisionToCodeMap'][number] {
  assertObject(value, filePath, field);
  assertNonEmptyString(value['decisionId'], filePath, `${field}.decisionId`);
  assertArray(value['files'], filePath, `${field}.files`);
  assertNonEmptyString(value['summary'], filePath, `${field}.summary`);
}

function assertObject(
  value: unknown,
  filePath: string,
  field: string,
): asserts value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new SourceParseError(filePath, field, 'must be an object');
  }
}

function assertArray(value: unknown, filePath: string, field: string): asserts value is unknown[] {
  if (!Array.isArray(value)) throw new SourceParseError(filePath, field, 'must be an array');
}

function assertNonEmptyString(
  value: unknown,
  filePath: string,
  field: string,
): asserts value is string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new SourceParseError(filePath, field, 'must be a non-empty string');
  }
}

function assertFrontmatterString(
  frontmatter: Record<string, unknown>,
  filePath: string,
  field: string,
): string {
  const value = frontmatter[field];
  assertNonEmptyString(value, filePath, field);
  return value;
}

function validateUnique(values: string[], field: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) throw new Error(`${field}: duplicate id ${value}`);
    seen.add(value);
  }
}

function validateBundleReferences(bundle: SourceBundle): void {
  const taskIds = new Set(bundle.tasks.map((task) => task.id));
  const decisionIds = new Set(bundle.decisions.map((decision) => decision.id));
  for (const decision of bundle.decisions) {
    if (!taskIds.has(decision.taskId)) throw new Error(`decision.taskId: missing task ${decision.taskId}`);
  }
  for (const question of bundle.questions) {
    if (!taskIds.has(question.taskId)) throw new Error(`question.taskId: missing task ${question.taskId}`);
    if (question.decisionId !== null && !decisionIds.has(question.decisionId)) {
      throw new Error(`question.decisionId: missing decision ${question.decisionId}`);
    }
  }
  for (const item of bundle.evidence) {
    if (!taskIds.has(item.taskId)) throw new Error(`evidence.taskId: missing task ${item.taskId}`);
    if (item.decisionId !== null && !decisionIds.has(item.decisionId)) {
      throw new Error(`evidence.decisionId: missing decision ${item.decisionId}`);
    }
  }
  for (const item of bundle.contextItems) {
    if (!taskIds.has(item.taskId)) throw new Error(`contextItem.taskId: missing task ${item.taskId}`);
  }
  for (const snapshot of bundle.briefSnapshots) {
    if (!taskIds.has(snapshot.taskId)) throw new Error(`briefSnapshot.taskId: missing task ${snapshot.taskId}`);
  }
  for (const trace of bundle.implementationTraces) {
    if (!taskIds.has(trace.taskId)) throw new Error(`trace.taskId: missing task ${trace.taskId}`);
    for (const decisionId of trace.decisionIds) {
      if (!decisionIds.has(decisionId)) throw new Error(`trace.decisionIds: missing decision ${decisionId}`);
    }
  }
}

function stringArrayField(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function stringField(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
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
