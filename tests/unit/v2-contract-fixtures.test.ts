import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const briefDigestDir = join(repoRoot, 'tests', 'fixtures', 'brief-digest', 'v1');
const sourceEnvelopeDir = join(repoRoot, 'tests', 'fixtures', 'source-envelope', 'v1');
const traceStatusValues = ['A', 'M', 'D', 'R'] as const;
const verifierExitCodes = [0, 10, 20, 30, 40, 50];

const toolContracts = {
  status: {
    mode: 'read',
    inputKeys: [],
    resultSchema: 'sduck-status-result/v1',
    resultKeys: ['schema', 'taskId'],
  },
  get_context: {
    mode: 'read',
    inputKeys: ['taskId'],
    resultSchema: 'sduck-context-result/v1',
    resultKeys: ['schema', 'items'],
  },
  brief: {
    mode: 'read',
    inputKeys: ['taskId'],
    resultSchema: 'sduck-brief-result/v1',
    resultKeys: ['schema', 'diagnosticOnly'],
  },
  recall: {
    mode: 'read',
    inputKeys: ['query'],
    resultSchema: 'sduck-recall-result/v1',
    resultKeys: ['schema', 'matches'],
  },
  prepare_confirmation: {
    mode: 'read',
    inputKeys: ['taskId'],
    resultSchema: 'sduck-prepare-confirmation-result/v1',
    resultKeys: ['schema', 'approvalViewVersion', 'digest', 'approvalView'],
  },
  start_task: {
    mode: 'mutation',
    inputKeys: ['identity', 'description'],
    resultSchema: 'sduck-mutation-result/v1',
    resultKeys: ['schema', 'receiptId'],
  },
  record: {
    mode: 'mutation',
    inputKeys: ['identity', 'decisions', 'evidence', 'expectedScope', 'avoidScope'],
    resultSchema: 'sduck-mutation-result/v1',
    resultKeys: ['schema', 'receiptId'],
  },
  raise_question: {
    mode: 'mutation',
    inputKeys: ['identity', 'questions'],
    resultSchema: 'sduck-mutation-result/v1',
    resultKeys: ['schema', 'receiptId'],
  },
  record_answer: {
    mode: 'mutation',
    inputKeys: ['identity', 'questionId', 'answer'],
    resultSchema: 'sduck-mutation-result/v1',
    resultKeys: ['schema', 'receiptId'],
  },
  refresh_context: {
    mode: 'mutation',
    inputKeys: ['identity'],
    resultSchema: 'sduck-mutation-result/v1',
    resultKeys: ['schema', 'receiptId'],
  },
  add_context: {
    mode: 'mutation',
    inputKeys: ['identity', 'refs'],
    resultSchema: 'sduck-mutation-result/v1',
    resultKeys: ['schema', 'receiptId'],
  },
  trace: {
    mode: 'mutation',
    inputKeys: ['identity', 'briefDigest'],
    resultSchema: 'sduck-mutation-result/v1',
    resultKeys: ['schema', 'receiptId'],
  },
  close_task: {
    mode: 'mutation',
    inputKeys: ['identity'],
    resultSchema: 'sduck-mutation-result/v1',
    resultKeys: ['schema', 'receiptId'],
  },
  abandon_task: {
    mode: 'mutation',
    inputKeys: ['identity', 'reason'],
    resultSchema: 'sduck-mutation-result/v1',
    resultKeys: ['schema', 'receiptId'],
  },
} as const;

type JsonObject = Record<string, unknown>;
type ToolName = keyof typeof toolContracts;

interface BriefDigestProjectionV1 {
  schema: 'sduck-brief-digest/v1';
  task: JsonObject;
  decisions: JsonObject[];
  questions: JsonObject[];
  evidence: JsonObject[];
}

async function readJsonFixture<T>(...segments: string[]): Promise<T> {
  return JSON.parse(await readFile(join(...segments), 'utf8')) as T;
}

function canonicalize(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => canonicalize(item)).join(',')}]`;
  const object = value as JsonObject;
  return `{${Object.keys(object)
    .sort(compareStrings)
    .map((key) => `${JSON.stringify(key)}:${canonicalize(object[key])}`)
    .join(',')}}`;
}

function projectBriefDigest(input: BriefDigestProjectionV1): BriefDigestProjectionV1 {
  return {
    schema: 'sduck-brief-digest/v1',
    task: {
      id: input.task['id'],
      title: input.task['title'],
      description: input.task['description'],
      expectedScope: input.task['expectedScope'],
      avoidScope: input.task['avoidScope'],
    },
    decisions: input.decisions.map(projectDecision).sort(compareById),
    questions: input.questions.map(projectQuestion).sort(compareById),
    evidence: input.evidence.map(projectEvidence).sort(compareById),
  };
}

function compareById(left: JsonObject, right: JsonObject): number {
  return compareStrings(String(left['id']), String(right['id']));
}

function projectDecision(item: JsonObject): JsonObject {
  return {
    id: item['id'],
    kind: item['kind'],
    status: item['status'],
    title: item['title'],
    summary: item['summary'],
    rationale: item['rationale'],
    appliesTo: item['appliesTo'],
    avoids: item['avoids'],
  };
}

function projectQuestion(item: JsonObject): JsonObject {
  return {
    id: item['id'],
    decisionId: item['decisionId'],
    text: item['text'],
    answered: item['answered'],
    answer: item['answer'],
  };
}

function projectEvidence(item: JsonObject): JsonObject {
  return {
    id: item['id'],
    decisionId: item['decisionId'],
    sourceType: item['sourceType'],
    sourceRef: item['sourceRef'],
    summary: item['summary'],
  };
}

describe('v2 0.6 static Phase 0 contract fixtures', () => {
  let workspace: string | null = null;

  afterEach(async () => {
    if (workspace !== null) await removeTempWorkspace(workspace);
    workspace = null;
  });

  it('verifies the Unicode canonical projection, sort projection, and digest fixtures', async () => {
    const canonicalBytes = await readFile(
      join(briefDigestDir, 'unicode-projection.canonical.json'),
    );
    const expectedDigest = (
      await readFile(join(briefDigestDir, 'unicode-projection.digest.txt'), 'utf8')
    ).trim();
    const expectedProjection = await readJsonFixture<BriefDigestProjectionV1>(
      briefDigestDir,
      'unicode-projection.source.json',
    );
    const unsortedInput = await readJsonFixture<BriefDigestProjectionV1>(
      briefDigestDir,
      'unicode-projection.unsorted-input.json',
    );
    const canonicalProjection = JSON.parse(
      canonicalBytes.toString('utf8'),
    ) as BriefDigestProjectionV1;

    expect(canonicalProjection).toEqual(expectedProjection);
    expect(canonicalBytes.toString('utf8')).toContain('카페 é / café / 승인 ✅');
    expect(canonicalBytes.toString('utf8')).not.toContain('\n');
    expect(unsortedInput.decisions.map((item) => item['id'])).toEqual([
      'DEC-0002-나',
      'DEC-0001-가',
    ]);
    expect(unsortedInput.questions.map((item) => item['id'])).toEqual([
      'Q-0002-범위',
      'Q-0001-유니코드',
    ]);
    expect(unsortedInput.evidence.map((item) => item['id'])).toEqual([
      'EVD-0002-계획',
      'EVD-0001-문서',
    ]);

    const projected = projectBriefDigest(unsortedInput);
    expect(projected).toEqual(expectedProjection);
    expect(projected.decisions[0]).not.toHaveProperty('confidence');
    expect(projected.questions[0]).not.toHaveProperty('recommendedAnswer');
    expect(projected.evidence[0]).not.toHaveProperty('createdAt');

    expect(canonicalize(expectedProjection)).toBe(canonicalBytes.toString('utf8'));
    const digest = `sduck-brief-digest/v1:${createHash('sha256').update(canonicalBytes).digest('hex')}`;
    expect(digest).toBe(expectedDigest);
  });

  it('validates non-runtime source envelope and control-plane contract fixtures', async () => {
    const taskEnvelope = await readJsonFixture<JsonObject>(
      sourceEnvelopeDir,
      'task-envelope.contract.json',
    );
    const decisionEnvelope = await readJsonFixture<JsonObject>(
      sourceEnvelopeDir,
      'decision-envelope.contract.json',
    );
    const confirmation = await readJsonFixture<JsonObject>(
      sourceEnvelopeDir,
      'confirmation-snapshot.contract.json',
    );
    const receipt = await readJsonFixture<JsonObject>(
      sourceEnvelopeDir,
      'receipt-event.contract.json',
    );
    const trace = await readJsonFixture<JsonObject>(
      sourceEnvelopeDir,
      'trace-manifest.contract.json',
    );
    const verifier = await readJsonFixture<JsonObject>(
      sourceEnvelopeDir,
      'verifier-result.contract.json',
    );
    const mcp = await readJsonFixture<JsonObject>(sourceEnvelopeDir, 'mcp-tools.contract.json');
    const expectedProjection = await readJsonFixture<BriefDigestProjectionV1>(
      briefDigestDir,
      'unicode-projection.source.json',
    );

    assertEnvelopeFixture(taskEnvelope, 'task');
    assertEnvelopeFixture(decisionEnvelope, 'decision');
    assertConfirmationFixture(confirmation);
    assertReceiptFixture(receipt);
    assertTraceFixture(trace);
    assertVerifierFixture(verifier);
    assertMcpToolsFixture(mcp, expectedProjection);
  });

  it('does not alter the current parser to load v1 source envelopes', async () => {
    workspace = await createTempWorkspace('v2-envelope-parser-');
    const root = workspace;
    const { initDecisionWorkspace } = await import('../../src/core/v2/workspace.js');
    const { loadSourceBundle } = await import('../../src/core/v2/source-store.js');
    const taskEnvelope = await readJsonFixture<JsonObject>(
      sourceEnvelopeDir,
      'task-envelope.contract.json',
    );
    const fence = asObject(taskEnvelope['fence'], 'task.fence');
    const frontmatter = asObject(fence['frontmatter'], 'task.fence.frontmatter');
    const envelope = asObject(taskEnvelope['envelope'], 'task.envelope');
    const canonical = asObject(envelope['canonical'], 'task.envelope.canonical');
    const bodyTask = asObject(canonical['task'], 'task.envelope.canonical.task');

    initDecisionWorkspace(root);
    const tasksDir = join(root, '.decision', 'exports', 'markdown', 'tasks');
    await mkdir(tasksDir, { recursive: true });
    await writeFile(
      join(tasksDir, `${stringField(frontmatter, 'id')}.md`),
      `---\nid: ${stringField(frontmatter, 'id')}\ntype: ${stringField(frontmatter, 'type')}\nstatus: ${stringField(
        frontmatter,
        'status',
      )}\ncreated_at: '${stringField(frontmatter, 'created_at')}'\n---\n# ${stringField(
        fence,
        'h1',
      )}\n\n\`\`\`${stringField(fence, 'infoString')}\n${JSON.stringify(envelope, null, 2)}\n\`\`\`\n`,
    );

    expect(bodyTask['title']).not.toBe(fence['h1']);
    expect(bodyTask['description']).not.toBe(fence['h1']);

    const bundle = loadSourceBundle(root);
    expect(bundle.tasks).toHaveLength(1);
    expect(bundle.tasks[0]?.id).toBe(frontmatter['id']);
    expect(bundle.tasks[0]?.title).toBe(fence['h1']);
    expect(bundle.tasks[0]?.description).toBe(fence['h1']);
    expect(bundle.tasks[0]?.title).not.toBe(bodyTask['title']);
    expect(bundle.tasks[0]?.description).not.toBe(bodyTask['description']);
    expect(bundle.questions).toEqual([]);
    expect(bundle.events).toEqual([]);
  });
});

function assertEnvelopeFixture(fixture: JsonObject, kind: 'task' | 'decision'): void {
  assertExactKeys(fixture, ['contract', 'kind', 'runtimeSupport', 'note', 'fence', 'envelope']);
  expect(fixture['contract']).toBe('sduck-source-envelope/v1');
  expect(fixture['kind']).toBe(kind);
  expect(fixture['runtimeSupport']).toBe('phase-1');
  expect(stringField(fixture, 'note')).toContain('runtime parser support begins in Phase 1');
  expect(fixture).not.toHaveProperty('body');

  const fence = asObject(fixture['fence'], `${kind}.fence`);
  if (kind === 'task') {
    assertExactKeys(fence, ['infoString', 'frontmatter', 'h1']);
    expect(stringField(fence, 'h1')).toBe('Fallback task title from markdown');
    const frontmatter = asObject(fence['frontmatter'], 'task.fence.frontmatter');
    assertExactKeys(frontmatter, ['id', 'type', 'status', 'created_at']);
    expect(stringField(frontmatter, 'id')).toBe('TASK-envelope');
    expect(stringField(frontmatter, 'type')).toBe('task');
    expect(stringField(frontmatter, 'status')).toBe('OPEN');
    assertIsoTimestamp(frontmatter['created_at']);
  } else {
    assertExactKeys(fence, ['infoString']);
  }
  expect(stringField(fence, 'infoString')).toBe('json sduck-source-envelope/v1');

  const envelope = asObject(fixture['envelope'], `${kind}.envelope`);
  assertExactKeys(envelope, ['schema', 'kind', 'revision', 'canonical']);
  expect(envelope['schema']).toBe('sduck-source-envelope/v1');
  expect(envelope['kind']).toBe(kind);
  expect(envelope['revision']).toBe(1);
  const canonical = asObject(envelope['canonical'], `${kind}.envelope.canonical`);
  if (kind === 'task') {
    assertTaskCanonical(canonical);
    const frontmatter = asObject(fence['frontmatter'], 'task.fence.frontmatter');
    const task = asObject(canonical['task'], 'task.envelope.canonical.task');
    expect(task['id']).toBe(frontmatter['id']);
  } else assertDecisionCanonical(canonical);
}

function assertTaskCanonical(canonical: JsonObject): void {
  assertExactKeys(canonical, [
    'task',
    'questions',
    'evidence',
    'contextItems',
    'briefSnapshots',
    'events',
  ]);
  const task = asObject(canonical['task'], 'task.canonical.task');
  assertExactKeys(task, [
    'id',
    'title',
    'description',
    'status',
    'expectedScope',
    'avoidScope',
    'createdAt',
    'updatedAt',
  ]);
  expect(stringField(task, 'id')).toBe('TASK-envelope');
  expect(stringField(task, 'title')).toBe('Envelope body task title not used by current parser');
  expect(stringField(task, 'description')).toBe(
    'Envelope body task description not used by current parser',
  );
  expect(stringField(task, 'status')).toBe('OPEN');
  assertStringArray(task['expectedScope']);
  assertStringArray(task['avoidScope']);
  assertIsoTimestamp(task['createdAt']);
  assertIsoTimestamp(task['updatedAt']);
  expect(canonical['questions']).toEqual([]);
  expect(canonical['evidence']).toEqual([]);
  expect(canonical['contextItems']).toEqual([]);
  expect(canonical['briefSnapshots']).toEqual([]);
  expect(canonical['events']).toEqual([]);
}

function assertDecisionCanonical(canonical: JsonObject): void {
  assertExactKeys(canonical, ['decision']);
  const decision = asObject(canonical['decision'], 'decision.canonical.decision');
  assertExactKeys(decision, [
    'id',
    'taskId',
    'title',
    'kind',
    'status',
    'confidence',
    'summary',
    'rationale',
    'appliesTo',
    'avoids',
    'sourceRefs',
    'createdAt',
    'updatedAt',
  ]);
  expect(stringField(decision, 'id')).toMatch(/^DEC_/);
  expect(stringField(decision, 'taskId')).toMatch(/^TASK_/);
  expect(stringField(decision, 'kind')).toBe('EXPLICIT');
  expect(stringField(decision, 'status')).toBe('CONFIRMED');
  expect(decision['confidence']).toBe(1);
  for (const key of ['title', 'summary'] as const) expect(typeof decision[key]).toBe('string');
  for (const key of ['rationale', 'appliesTo', 'avoids', 'sourceRefs'] as const) {
    assertStringArray(decision[key]);
  }
  assertIsoTimestamp(decision['createdAt']);
  assertIsoTimestamp(decision['updatedAt']);
}

function assertConfirmationFixture(fixture: JsonObject): void {
  assertExactKeys(fixture, ['contract', 'kind', 'runtimeSupport', 'note', 'snapshot']);
  expect(fixture['contract']).toBe('sduck-confirmation-snapshot/v1');
  expect(fixture['kind']).toBe('confirmation-snapshot');
  expect(fixture['runtimeSupport']).toBe('phase-1');
  const snapshot = asObject(fixture['snapshot'], 'confirmation.snapshot');
  assertExactKeys(snapshot, [
    'schema',
    'taskId',
    'briefDigest',
    'approvalViewVersion',
    'provenance',
    'confirmedAt',
  ]);
  expect(snapshot['schema']).toBe('sduck-confirmation-snapshot/v1');
  expect(stringField(snapshot, 'taskId')).toMatch(/^TASK_/);
  assertBriefDigest(snapshot['briefDigest']);
  expect(snapshot['approvalViewVersion']).toBe('Approval View V1');
  const provenance = asObject(snapshot['provenance'], 'confirmation.snapshot.provenance');
  assertExactKeys(provenance, ['channel', 'mechanism']);
  expect(provenance).toEqual({ channel: 'cli', mechanism: 'local-operator-acknowledgement' });
  assertIsoTimestamp(snapshot['confirmedAt']);
}

function assertReceiptFixture(fixture: JsonObject): void {
  assertExactKeys(fixture, ['contract', 'kind', 'runtimeSupport', 'note', 'receipt']);
  expect(fixture['contract']).toBe('sduck-operation-receipt/v1');
  expect(fixture['kind']).toBe('operation-receipt');
  expect(fixture['runtimeSupport']).toBe('phase-2');
  const receipt = asObject(fixture['receipt'], 'receipt');
  assertExactKeys(receipt, ['schema', 'event']);
  expect(receipt['schema']).toBe('sduck-operation-receipt/v1');
  const event = asObject(receipt['event'], 'receipt.event');
  assertExactKeys(event, ['id', 'taskId', 'type', 'createdAt', 'payload']);
  expect(stringField(event, 'id')).toMatch(/^EVT_/);
  expect(stringField(event, 'taskId')).toMatch(/^TASK_/);
  expect(event['type']).toBe('protocol-receipt-recorded');
  assertIsoTimestamp(event['createdAt']);
  const payload = asObject(event['payload'], 'receipt.event.payload');
  assertExactKeys(payload, ['identity', 'requestHash', 'resultRefs']);
  expect(payload).not.toHaveProperty('timestamp');
  const identity = asObject(payload['identity'], 'receipt.event.payload.identity');
  assertIdentity(identity, 'record');
  expect(identity['clientRequestId']).toBe('request-0001');
  expect(stringField(payload, 'requestHash')).toMatch(/^sha256:[a-f0-9]{64}$/);
  const resultRefs = asArray(payload['resultRefs'], 'receipt.event.payload.resultRefs');
  expect(resultRefs).toHaveLength(1);
  const resultRef = asObject(resultRefs[0], 'receipt.event.payload.resultRefs[0]');
  assertExactKeys(resultRef, ['type', 'id']);
  expect(resultRef['type']).toBe('decision');
  expect(stringField(resultRef, 'id')).toMatch(/^DEC_/);
}

function assertTraceFixture(fixture: JsonObject): void {
  assertExactKeys(fixture, ['contract', 'kind', 'runtimeSupport', 'note', 'manifest']);
  expect(fixture['contract']).toBe('sduck-trace-manifest/v1');
  expect(fixture['kind']).toBe('trace-manifest');
  expect(fixture['runtimeSupport']).toBe('phase-4');
  const manifest = asObject(fixture['manifest'], 'trace.manifest');
  assertExactKeys(manifest, [
    'schema',
    'id',
    'taskId',
    'briefDigest',
    'baseCommit',
    'observedHead',
    'files',
    'manifestHash',
  ]);
  expect(manifest['schema']).toBe('sduck-trace-manifest/v1');
  expect(stringField(manifest, 'id')).toMatch(/^IMPL_/);
  expect(stringField(manifest, 'taskId')).toMatch(/^TASK_/);
  assertBriefDigest(manifest['briefDigest']);
  expect(stringField(manifest, 'baseCommit')).toMatch(/^[a-f0-9]{40}$/);
  expect(stringField(manifest, 'observedHead')).toMatch(/^[a-f0-9]{40}$/);
  const files = asArray(manifest['files'], 'trace.manifest.files').map((file, index) =>
    asObject(file, `trace.manifest.files[${String(index)}]`),
  );
  expect(files.map((file) => stringField(file, 'status')).sort(compareStrings)).toEqual([
    'A',
    'D',
    'M',
    'R',
  ]);
  for (const file of files) assertTraceFile(file);
  const traceProjection = {
    briefDigest: manifest['briefDigest'],
    baseCommit: manifest['baseCommit'],
    observedHead: manifest['observedHead'],
    files: [...files].sort(compareTraceFiles),
  };
  const manifestHash = `sduck-trace-manifest/v1:${createHash('sha256')
    .update(canonicalize(traceProjection))
    .digest('hex')}`;
  expect(manifest['manifestHash']).toBe(manifestHash);
}

function assertTraceFile(file: JsonObject): void {
  const status = stringField(file, 'status');
  expect(traceStatusValues).toContain(status as (typeof traceStatusValues)[number]);
  if (status === 'R') assertExactKeys(file, ['path', 'oldPath', 'status', 'contentSha256']);
  else assertExactKeys(file, ['path', 'status', 'contentSha256']);
  expect(stringField(file, 'path')).not.toBe('');
  if (status === 'R') expect(stringField(file, 'oldPath')).not.toBe('');
  if (status === 'D') expect(file['contentSha256']).toBeNull();
  else expect(stringField(file, 'contentSha256')).toMatch(/^[a-f0-9]{64}$/);
}

function assertVerifierFixture(fixture: JsonObject): void {
  assertExactKeys(fixture, ['contract', 'kind', 'runtimeSupport', 'note', 'result']);
  expect(fixture['contract']).toBe('sduck-verify-result/v1');
  expect(fixture['kind']).toBe('verifier-result');
  expect(fixture['runtimeSupport']).toBe('phase-4');
  const result = asObject(fixture['result'], 'verifier.result');
  assertExactKeys(result, [
    'schema',
    'ok',
    'exitCode',
    'code',
    'base',
    'mergeBase',
    'head',
    'checkedDiffMode',
    'unmatchedFiles',
    'matchedTraceManifests',
  ]);
  expect(result['schema']).toBe('sduck-verify-result/v1');
  expect(result['ok']).toBe(false);
  expect(verifierExitCodes).toContain(result['exitCode'] as number);
  expect(result['exitCode']).toBe(20);
  expect(result['code']).toBe('TRACE_COVERAGE_MISSING');
  expect(typeof result['base']).toBe('string');
  expect(stringField(result, 'mergeBase')).toMatch(/^[a-f0-9]{40}$/);
  expect(stringField(result, 'head')).toMatch(/^[a-f0-9]{40}$/);
  expect(result['checkedDiffMode']).toBe('base...HEAD');
  const unmatched = asArray(result['unmatchedFiles'], 'verifier.result.unmatchedFiles');
  expect(unmatched).toHaveLength(1);
  assertTraceFile(asObject(unmatched[0], 'verifier.result.unmatchedFiles[0]'));
  expect(result['matchedTraceManifests']).toEqual([]);
}

function assertMcpToolsFixture(
  fixture: JsonObject,
  expectedProjection: BriefDigestProjectionV1,
): void {
  assertExactKeys(fixture, ['contract', 'kind', 'runtimeSupport', 'note', 'tools']);
  expect(fixture['contract']).toBe('sduck-mcp-tools/v1');
  expect(fixture['kind']).toBe('mcp-tools');
  expect(fixture['runtimeSupport']).toBe('phase-5');
  const tools = asArray(fixture['tools'], 'mcp.tools').map((tool, index) =>
    asObject(tool, `mcp.tools[${String(index)}]`),
  );
  const expectedNames = Object.keys(toolContracts).sort(compareStrings);
  expect(tools.map((tool) => stringField(tool, 'name')).sort(compareStrings)).toEqual(
    expectedNames,
  );
  expect(tools.some((tool) => tool['name'] === 'confirm_brief')).toBe(false);
  for (const tool of tools) assertMcpTool(tool, expectedProjection);
}

function assertMcpTool(tool: JsonObject, expectedProjection: BriefDigestProjectionV1): void {
  assertExactKeys(tool, ['name', 'mode', 'input', 'result']);
  const name = stringField(tool, 'name');
  expect(isToolName(name)).toBe(true);
  if (!isToolName(name)) throw new Error(`Unexpected MCP tool: ${name}`);
  const contract = toolContracts[name];
  expect(tool['mode']).toBe(contract.mode);
  const input = asObject(tool['input'], `mcp.${name}.input`);
  const result = asObject(tool['result'], `mcp.${name}.result`);
  assertExactKeys(input, contract.inputKeys);
  assertExactKeys(result, contract.resultKeys);
  expect(result['schema']).toBe(contract.resultSchema);
  if (contract.mode === 'mutation') {
    const identity = asObject(input['identity'], `mcp.${name}.input.identity`);
    assertIdentity(identity, name);
    expect(stringField(result, 'receiptId')).toMatch(/^EVT_/);
  } else {
    expect(input).not.toHaveProperty('identity');
  }
  assertMcpInputValues(name, input);
  assertMcpResultValues(name, result, expectedProjection);
}

function assertMcpInputValues(name: ToolName, input: JsonObject): void {
  switch (name) {
    case 'status':
    case 'refresh_context':
    case 'close_task':
      break;
    case 'get_context':
    case 'brief':
    case 'prepare_confirmation':
      expect(stringField(input, 'taskId')).toMatch(/^TASK[-_]/);
      break;
    case 'recall':
      expect(typeof input['query']).toBe('string');
      break;
    case 'start_task':
      expect(typeof input['description']).toBe('string');
      break;
    case 'record':
      assertRecordInput(input);
      break;
    case 'raise_question':
      assertRaiseQuestionInput(input);
      break;
    case 'record_answer':
      expect(stringField(input, 'questionId')).toMatch(/^Q_/);
      expect(typeof input['answer']).toBe('string');
      break;
    case 'add_context':
      assertAddContextRefs(input['refs']);
      break;
    case 'trace':
      assertBriefDigest(input['briefDigest']);
      break;
    case 'abandon_task':
      expect(typeof input['reason']).toBe('string');
      break;
  }
}

function assertMcpResultValues(
  name: ToolName,
  result: JsonObject,
  expectedProjection: BriefDigestProjectionV1,
): void {
  switch (name) {
    case 'status':
      expect(stringField(result, 'taskId')).toMatch(/^TASK_/);
      break;
    case 'get_context':
      assertContextItems(result['items']);
      break;
    case 'brief':
      expect(result['diagnosticOnly']).toBe(true);
      break;
    case 'recall':
      assertRecallMatches(result['matches']);
      break;
    case 'prepare_confirmation':
      expect(result['approvalViewVersion']).toBe('Approval View V1');
      assertBriefDigest(result['digest']);
      assertApprovalView(result['approvalView'], expectedProjection, stringField(result, 'digest'));
      break;
    default:
      expect(stringField(result, 'receiptId')).toMatch(/^EVT_/);
  }
}

function assertRecordInput(input: JsonObject): void {
  const decisions = asArray(input['decisions'], 'mcp.record.input.decisions');
  expect(decisions).toHaveLength(1);
  const decision = asObject(decisions[0], 'mcp.record.input.decisions[0]');
  assertExactKeys(decision, ['id', 'kind', 'title', 'summary', 'rationale', 'appliesTo', 'avoids']);
  expect(stringField(decision, 'id')).toMatch(/^DEC_/);
  expect(stringField(decision, 'kind')).toBe('EXPLICIT');
  for (const key of ['title', 'summary'] as const) expect(typeof decision[key]).toBe('string');
  for (const key of ['rationale', 'appliesTo', 'avoids'] as const) assertStringArray(decision[key]);

  const evidence = asArray(input['evidence'], 'mcp.record.input.evidence');
  expect(evidence).toHaveLength(1);
  assertEvidenceItem(asObject(evidence[0], 'mcp.record.input.evidence[0]'));
  assertStringArray(input['expectedScope']);
  assertStringArray(input['avoidScope']);
}

function assertRaiseQuestionInput(input: JsonObject): void {
  const questions = asArray(input['questions'], 'mcp.raise_question.input.questions');
  expect(questions).toHaveLength(1);
  const question = asObject(questions[0], 'mcp.raise_question.input.questions[0]');
  assertExactKeys(question, [
    'id',
    'decisionId',
    'text',
    'recommendedAnswer',
    'rationale',
    'options',
  ]);
  expect(stringField(question, 'id')).toMatch(/^Q_/);
  expect(stringField(question, 'decisionId')).toMatch(/^DEC_/);
  for (const key of ['text', 'recommendedAnswer'] as const) {
    expect(typeof question[key]).toBe('string');
  }
  assertStringArray(question['rationale']);
  assertStringArray(question['options']);
}

function assertAddContextRefs(value: unknown): void {
  const refs = asArray(value, 'mcp.add_context.input.refs');
  expect(refs).toHaveLength(1);
  assertContextReference(asObject(refs[0], 'mcp.add_context.input.refs[0]'));
}

function assertContextItems(value: unknown): void {
  const items = asArray(value, 'mcp.get_context.result.items');
  expect(items).toHaveLength(1);
  assertContextReference(asObject(items[0], 'mcp.get_context.result.items[0]'));
}

function assertContextReference(ref: JsonObject): void {
  assertExactKeys(ref, ['sourceType', 'sourceRef', 'summary', 'metadata']);
  expect(stringField(ref, 'sourceType')).toBe('FILE');
  expect(stringField(ref, 'sourceRef')).toBe('docs/design/mcp-control-plane-0.6-contract.md');
  expect(stringField(ref, 'summary')).toMatch(/contract/i);
  const metadata = asObject(ref['metadata'], 'context.metadata');
  const allowedKeys = Object.keys(metadata).sort(compareStrings);
  expect(allowedKeys).toEqual(expect.arrayContaining(['contentSha256', 'path']));
  expect(stringField(metadata, 'path')).toBe('docs/design/mcp-control-plane-0.6-contract.md');
  expect(stringField(metadata, 'contentSha256')).toMatch(/^[a-f0-9]{64}$/);
  if (metadata['range'] !== undefined) {
    const range = asObject(metadata['range'], 'context.metadata.range');
    assertExactKeys(range, ['startLine', 'endLine']);
    expect(typeof range['startLine']).toBe('number');
    expect(typeof range['endLine']).toBe('number');
  }
}

function assertRecallMatches(value: unknown): void {
  const matches = asArray(value, 'mcp.recall.result.matches');
  expect(matches).toHaveLength(1);
  const match = asObject(matches[0], 'mcp.recall.result.matches[0]');
  assertExactKeys(match, ['id', 'type', 'summary', 'score']);
  expect(stringField(match, 'id')).toMatch(/^DEC-/);
  expect(stringField(match, 'type')).toBe('decision');
  expect(typeof match['summary']).toBe('string');
  expect(typeof match['score']).toBe('number');
}

function assertApprovalView(
  value: unknown,
  expectedProjection: BriefDigestProjectionV1,
  expectedDigest: string,
): void {
  const approvalView = asObject(value, 'mcp.prepare_confirmation.result.approvalView');
  assertExactKeys(approvalView, ['schema', 'task', 'decisions', 'questions', 'evidence']);
  expect(approvalView['schema']).toBe('sduck-approval-view/v1');
  const task = asObject(approvalView['task'], 'approvalView.task');
  assertExactKeys(task, ['id', 'title', 'description', 'expectedScope', 'avoidScope']);
  expect(stringField(task, 'id')).toMatch(/^TASK[-_]/);
  for (const key of ['title', 'description'] as const) expect(typeof task[key]).toBe('string');
  assertStringArray(task['expectedScope']);
  assertStringArray(task['avoidScope']);

  const decisions = asArray(approvalView['decisions'], 'approvalView.decisions');
  expect(decisions).toHaveLength(expectedProjection.decisions.length);
  for (const [index, item] of decisions.entries()) {
    const decision = asObject(item, `approvalView.decisions[${String(index)}]`);
    assertExactKeys(decision, [
      'id',
      'kind',
      'status',
      'title',
      'summary',
      'rationale',
      'appliesTo',
      'avoids',
    ]);
    expect(stringField(decision, 'id')).toMatch(/^DEC-/);
    for (const key of ['rationale', 'appliesTo', 'avoids'] as const)
      assertStringArray(decision[key]);
  }

  const questions = asArray(approvalView['questions'], 'approvalView.questions');
  expect(questions).toHaveLength(expectedProjection.questions.length);
  for (const [index, item] of questions.entries()) {
    const question = asObject(item, `approvalView.questions[${String(index)}]`);
    assertExactKeys(question, ['id', 'decisionId', 'text', 'answered', 'answer']);
    expect(stringField(question, 'id')).toMatch(/^Q-/);
    expect(typeof question['answered']).toBe('boolean');
    expect(typeof question['answer']).toBe('string');
  }

  const evidence = asArray(approvalView['evidence'], 'approvalView.evidence');
  expect(evidence).toHaveLength(expectedProjection.evidence.length);
  for (const [index, item] of evidence.entries()) {
    assertEvidenceItem(asObject(item, `approvalView.evidence[${String(index)}]`));
  }

  const projection = approvalViewToProjection(approvalView);
  expect(projection).toEqual(expectedProjection);
  const digest = `sduck-brief-digest/v1:${createHash('sha256')
    .update(canonicalize(projection))
    .digest('hex')}`;
  expect(digest).toBe(expectedDigest);
}

function approvalViewToProjection(approvalView: JsonObject): BriefDigestProjectionV1 {
  return {
    schema: 'sduck-brief-digest/v1',
    task: approvalView['task'] as JsonObject,
    decisions: approvalView['decisions'] as JsonObject[],
    questions: approvalView['questions'] as JsonObject[],
    evidence: approvalView['evidence'] as JsonObject[],
  };
}

function assertEvidenceItem(evidence: JsonObject): void {
  assertExactKeys(evidence, ['id', 'decisionId', 'sourceType', 'sourceRef', 'summary']);
  expect(stringField(evidence, 'id')).toMatch(/^EVD[-_]/);
  expect(stringField(evidence, 'decisionId')).toMatch(/^DEC[-_]/);
  expect(typeof evidence['sourceType']).toBe('string');
  expect(typeof evidence['sourceRef']).toBe('string');
  expect(typeof evidence['summary']).toBe('string');
}

function assertIdentity(identity: JsonObject, operation: string): void {
  assertExactKeys(identity, ['clientId', 'clientRequestId', 'operation']);
  expect(typeof identity['clientId']).toBe('string');
  expect(typeof identity['clientRequestId']).toBe('string');
  expect(identity['operation']).toBe(operation);
}

function assertExactKeys(object: JsonObject, keys: readonly string[]): void {
  expect(Object.keys(object).sort(compareStrings)).toEqual([...keys].sort(compareStrings));
}

function asObject(value: unknown, label: string): JsonObject {
  expect(isJsonObject(value), label).toBe(true);
  return value as JsonObject;
}

function asArray(value: unknown, label: string): unknown[] {
  expect(Array.isArray(value), label).toBe(true);
  return value as unknown[];
}

function stringField(object: JsonObject, key: string): string {
  expect(typeof object[key]).toBe('string');
  return object[key] as string;
}

function assertStringArray(value: unknown): void {
  const array = asArray(value, 'string array');
  for (const item of array) expect(typeof item).toBe('string');
}

function assertBriefDigest(value: unknown): void {
  expect(value).toMatch(/^sduck-brief-digest\/v1:[a-f0-9]{64}$/);
}

function assertIsoTimestamp(value: unknown): void {
  expect(value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
}

function isJsonObject(value: unknown): value is JsonObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isToolName(value: string): value is ToolName {
  return Object.hasOwn(toolContracts, value);
}

function compareTraceFiles(left: JsonObject, right: JsonObject): number {
  return compareStrings(traceSortKey(left), traceSortKey(right));
}

function traceSortKey(file: JsonObject): string {
  return `${stringField(file, 'path')}\0${stringField(file, 'status')}\0${optionalString(file['oldPath'])}`;
}

function optionalString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function compareStrings(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}
