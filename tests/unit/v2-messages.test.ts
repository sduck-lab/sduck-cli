import { describe, expect, it } from 'vitest';

import { V2_MESSAGE_CATALOGS, getV2Messages } from '../../src/ui/v2/messages.js';
import { renderDoctorResult } from '../../src/ui/v2/render.js';

import type { V2ExpectedErrorCode } from '../../src/core/v2/errors.js';
import type { V2ProblemCode } from '../../src/core/v2/source-store.js';

const expectedErrorCodes = [
  'NO_CURRENT_TASK',
  'TASK_NOT_FOUND',
  'TASK_STATUS_NOT_ALLOWED',
  'GRILL_ME_REQUIRED',
  'CONFIRM_OPEN_QUESTIONS',
  'CONFIRM_UNRESOLVED_DECISIONS',
  'CONFIRM_BRIEF_NOT_READY',
  'DRAFT_JSON_INVALID',
  'DRAFT_FENCE_MISSING',
  'DRAFT_TASK_MISMATCH',
  'DRAFT_SCHEMA',
  'DRAFT_FIELD',
  'DRAFT_DECISION_KIND',
  'DRAFT_CONFIDENCE',
  'QUESTION_NOT_FOUND',
  'QUESTION_TASK_MISMATCH',
  'QUESTION_ALREADY_ANSWERED',
  'QUESTION_OPTION_RANGE',
  'QUESTION_ANSWER_REQUIRED',
  'CONTEXT_NO_MATCHES',
  'PATH_OUTSIDE_PROJECT',
  'ARTIFACT_PATH_INVALID',
  'ARTIFACT_PATH_OUTSIDE_WORKSPACE',
  'ARTIFACT_PATH_RESERVED',
  'WORKSPACE_LOCKED',
  'SOURCE_DB_ONLY',
  'SOURCE_PARSE',
  'SOURCE_VALIDATION',
  'POLICY_JSON_INVALID',
  'POLICY_INVALID',
  'WORKFLOW_DISABLED',
  'WORKFLOW_TOGGLE_ACTIVE_TASK',
  'STATE_JSON_INVALID',
  'STATE_INVALID',
  'REMEMBER_NO_RECORDS',
  'CLOSE_REQUIRES_TRACE',
  'CLOSE_REQUIRES_EVALUATION',
  'EVALUATION_REQUIRED',
  'CARRIED_DECISION_INVALID',
  'GRAPH_ROOT_NOT_FOUND',
  'GRAPH_DEPTH_INVALID',
] as const satisfies readonly V2ExpectedErrorCode[];

type MissingExpectedErrorCodes = Exclude<V2ExpectedErrorCode, (typeof expectedErrorCodes)[number]>;
const expectedErrorCodesAreComplete: MissingExpectedErrorCodes extends never ? true : never = true;
void expectedErrorCodesAreComplete;

const problemFragments = {
  array: { en: 'must be an array', ko: '배열이어야 합니다' },
  boolean: { en: 'must be a boolean', ko: 'boolean이어야 합니다' },
  confidence: { en: 'must be a number between 0 and 1', ko: '0과 1 사이 숫자여야 합니다' },
  'duplicate-id': { en: 'duplicate id', ko: '중복 id입니다' },
  'expected-reference': {
    en: 'reference did not match expected id',
    ko: '참조가 예상 id와 일치하지 않습니다',
  },
  'hash-or-null': { en: 'must be a hash string or null', ko: 'hash 문자열 또는 null이어야 합니다' },
  'json-object': { en: 'must be a JSON object', ko: 'JSON object여야 합니다' },
  'missing-decision': { en: 'references a missing decision', ko: '없는 decision을 참조합니다' },
  'missing-task': { en: 'references a missing task', ko: '없는 task를 참조합니다' },
  'missing-trace-decision': {
    en: 'references a decision not included in the trace',
    ko: 'trace에 포함되지 않은 decision을 참조합니다',
  },
  'non-empty-string': {
    en: 'must be a non-empty string',
    ko: '비어 있지 않은 문자열이어야 합니다',
  },
  'non-negative-number': {
    en: 'must be a non-negative number',
    ko: '0 이상의 숫자여야 합니다',
  },
  number: { en: 'must be a number', ko: '숫자여야 합니다' },
  parse: { en: 'parse error', ko: 'parse 오류' },
  'portable-id': {
    en: 'must be a portable single-segment id',
    ko: 'portable single-segment id여야 합니다',
  },
  string: { en: 'must be a string', ko: '문자열이어야 합니다' },
  'terminal-task': { en: 'references a terminal task', ko: '종료된 task를 참조합니다' },
  'unsupported-enum-value': {
    en: 'must be one of the allowed values',
    ko: '허용된 값 중 하나여야 합니다',
  },
  'wrong-task': { en: 'belongs to another task', ko: '다른 task에 속한 항목입니다' },
  'yaml-frontmatter': { en: 'missing YAML frontmatter', ko: 'YAML frontmatter가 없습니다' },
  'yaml-object': {
    en: 'frontmatter must be a YAML object',
    ko: 'frontmatter는 YAML object여야 합니다',
  },
} as const satisfies Record<V2ProblemCode, { en: string; ko: string }>;

type MissingProblemCodes = Exclude<V2ProblemCode, keyof typeof problemFragments>;
const problemCodesAreComplete: MissingProblemCodes extends never ? true : never = true;
void problemCodesAreComplete;

describe('v2 message catalogs', () => {
  it('keeps English and Korean catalog structure in parity', () => {
    expect(shapeOf(V2_MESSAGE_CATALOGS.ko)).toEqual(shapeOf(V2_MESSAGE_CATALOGS.en));
    expect(getV2Messages('en').task.current('TASK-1')).toContain('TASK-1');
    expect(getV2Messages('ko').task.current('TASK-1')).toContain('TASK-1');
  });

  it('renders dynamic presentation messages across both locales with concrete behavior', () => {
    const en = getV2Messages('en');
    const ko = getV2Messages('ko');

    expect(en.common.contextPackFor('TASK-1')).toBe('Context Pack for TASK-1');
    expect(ko.common.contextPackFor('TASK-1')).toBe('TASK-1 Context Pack');
    expect(en.common.question('Q-1')).toBe('Question Q-1');
    expect(ko.common.question('Q-1')).toBe('질문 Q-1');
    expect(en.common.relevance('matched')).toBe(' — matched');
    expect(en.common.relevance('matched', 1)).toBe(' — matched (score 1.0)');
    expect(ko.common.relevance('일치', 0.75)).toBe(' — 일치 (점수 0.75)');

    expect(en.commander.unknownCommand('nope')).toBe("error: unknown command 'nope'");
    expect(ko.commander.unknownCommand('nope')).toBe("오류: 알 수 없는 명령 'nope'");
    expect(en.commander.unknownOption('--bad')).toBe("error: unknown option '--bad'");
    expect(ko.commander.unknownOption('--bad')).toBe("오류: 알 수 없는 옵션 '--bad'");
    expect(en.commander.missingArgument('taskId')).toBe(
      "error: missing required argument 'taskId'",
    );
    expect(ko.commander.missingArgument('taskId')).toBe("오류: 필수 인자 누락 'taskId'");
    expect(en.commander.missingOptionValue('--base <ref>')).toBe(
      "error: option '--base <ref>' argument missing",
    );
    expect(ko.commander.missingOptionValue('--base <ref>')).toBe(
      "오류: 옵션 '--base <ref>' 인자가 누락되었습니다",
    );
    expect(en.commander.tooManyArguments).toBe('error: too many arguments');
    expect(ko.commander.tooManyArguments).toBe('오류: 인자가 너무 많습니다');

    expect(en.init.warning('gitignore-update-failed', '.gitignore', '.decision/db.sqlite')).toBe(
      'Failed to update .gitignore. Please add the following entries manually:\n.decision/db.sqlite',
    );
    expect(en.init.warning('custom-warning', 'path.txt', 'detail')).toBe(
      'custom-warning: path.txt: detail',
    );
    expect(ko.init.warning('kept-existing-asset', '.sduck', 'unchanged')).toBe(
      '기존 asset 유지: .sduck: unchanged',
    );
    expect(ko.init.warning('gitignore-update-failed', '.gitignore', 'entry')).toBe(
      '.gitignore 업데이트 실패. 다음 항목을 직접 추가하세요: .gitignore: entry',
    );
    expect(en.init.error('asset-root-conflict', '.sduck', 'not a directory')).toBe(
      'asset-root-conflict: .sduck: not a directory',
    );
    expect(ko.init.error('asset-root-conflict', '.sduck', 'not a directory')).toBe(
      'asset root는 디렉터리여야 합니다: .sduck: not a directory',
    );
    expect(en.init.invalidAgent('robot')).toBe('Unsupported agent: robot');
    expect(ko.init.invalidAgent('robot')).toBe('지원하지 않는 agent: robot');

    expect(en.config.localeSet('ko', '/tmp/config.json')).toBe(
      'Locale set to ko.\nConfig: /tmp/config.json',
    );
    expect(ko.config.localeSet('ko', '/tmp/config.json')).toBe(
      '언어 설정: ko\n설정 파일: /tmp/config.json',
    );
    expect(en.config.malformedWarning('/tmp/config.json', 'bad json')).toContain(
      'Ignoring malformed sduck config (bad json)',
    );
    expect(ko.config.malformedWarning('/tmp/config.json', 'bad json')).toContain(
      '잘못된 sduck 설정을 무시합니다(bad json)',
    );
    expect(en.config.unsupportedWarning('/tmp/config.json', 99)).toContain('schemaVersion 99');
    expect(ko.config.unsupportedWarning('/tmp/config.json', 99)).toContain('schemaVersion 99');
    expect(en.config.unsupportedRefuse('/tmp/config.json', 99)).toContain('Refusing to overwrite');
    expect(ko.config.unsupportedRefuse('/tmp/config.json', 99)).toContain('덮어쓰지 않습니다');

    expect(en.task.current('TASK-2')).toBe('Current decision task: TASK-2');
    expect(ko.task.current('TASK-2')).toBe('현재 decision task: TASK-2');
    expect(en.task.title('Ship it')).toBe('Title: Ship it');
    expect(ko.task.title('출시')).toBe('제목: 출시');
    expect(en.task.status('CONFIRMED')).toBe('Status: CONFIRMED');
    expect(ko.task.status('CONFIRMED')).toBe('상태: CONFIRMED');
    expect(en.task.resumed('TASK-2')).toBe('Decision task resumed: TASK-2');
    expect(ko.task.resumed('TASK-2')).toBe('Decision task 재개: TASK-2');
    expect(en.task.closed('TASK-2')).toBe('Decision task closed: TASK-2');
    expect(ko.task.closed('TASK-2')).toBe('Decision task 종료: TASK-2');
    expect(en.task.abandoned('TASK-2')).toBe('Decision task abandoned: TASK-2');
    expect(ko.task.abandoned('TASK-2')).toBe('Decision task 폐기: TASK-2');

    expect(en.commands.answerSaved('Q-1', 'Yes')).toBe('Answer saved for Q-1: Yes');
    expect(ko.commands.answerSaved('Q-1', '네')).toBe('Q-1 답변 저장: 네');
    expect(en.commands.contextAdded(2)).toBe('Context item(s) added: 2');
    expect(ko.commands.contextAdded(2)).toBe('컨텍스트 항목 추가: 2');
    expect(en.errors.unexpected('boom')).toBe('Error: boom');
    expect(ko.errors.unexpected('boom')).toBe('오류: boom');
    expect(en.errors.invalidLocale('fr')).toBe('Invalid locale: fr. Expected: en, ko.');
    expect(ko.errors.invalidLocale('fr')).toBe(
      '지원하지 않는 locale: fr. en 또는 ko를 사용하세요.',
    );
    expect(en.prompt.question('Q-9')).toBe('Question Q-9');
    expect(ko.prompt.question('Q-9')).toBe('질문 Q-9');
  });

  it('renders every structured doctor issue and repair in both locales', () => {
    const issueParams = {
      DB_ONLY: {},
      CACHE_STALE: {},
      INVALID_STATE: { code: 'STATE_INVALID', field: 'updatedAt', problemCode: 'non-empty-string' },
      MISSING_CURRENT_TASK_POINTER: { taskId: 'TASK-missing', problemCode: 'missing-task' },
      STALE_TERMINAL_TASK_POINTER: { taskId: 'TASK-closed' },
      MALFORMED_SOURCE: {
        path: '.decision/exports/markdown/tasks/bad.md',
        field: 'task.status',
        problemCode: 'unsupported-enum-value',
        allowed: 'OPEN, CLOSED',
        value: 'BROKEN',
      },
      INTERRUPTED_JOURNAL_RECOVERY_FAILED: { detail: 'rollback missing' },
    } as const;

    for (const locale of ['en', 'ko'] as const) {
      const messages = getV2Messages(locale);
      expect(messages.doctor.healthy).toContain(locale === 'en' ? 'healthy' : '정상');
      for (const [code, params] of Object.entries(issueParams)) {
        const rendered = messages.doctor.issueMessages[code]?.(params) ?? '';
        expect(rendered, `${locale} ${code}`).not.toBe('');
        expect(messages.doctor.recoveries[code], `${locale} recovery ${code}`).not.toBe('');
      }
      for (const code of [
        'INTERRUPTED_COMMIT',
        'DB_ONLY_MIGRATED',
        'CACHE_REBUILT',
        'TERMINAL_TASK_POINTER_CLEARED',
      ]) {
        const rendered = messages.doctor.repairs[code]?.({}) ?? '';
        expect(rendered, `${locale} repair ${code}`).not.toBe('');
      }
    }

    expect(
      getV2Messages('en').doctor.issueMessages['MALFORMED_SOURCE']?.(issueParams.MALFORMED_SOURCE),
    ).toContain('allowed: OPEN, CLOSED');
    expect(
      getV2Messages('ko').doctor.issueMessages['MALFORMED_SOURCE']?.(issueParams.MALFORMED_SOURCE),
    ).toContain('허용: OPEN, CLOSED');
  });

  it('renders source validation problem codes with stable detail in both locales', () => {
    const params = {
      field: 'decisions[0].kind',
      path: '.decision/exports/markdown/decisions/DEC.md',
      problemCode: 'unsupported-enum-value',
      allowed: 'EXPLICIT, INFERRED',
      value: 'WRONG',
    };
    expect(getV2Messages('en').errors.expected('SOURCE_PARSE', params)).toContain(
      'allowed: EXPLICIT, INFERRED',
    );
    expect(getV2Messages('ko').errors.expected('SOURCE_PARSE', params)).toContain(
      '허용: EXPLICIT, INFERRED',
    );

    const refParams = {
      field: 'question.decisionId',
      problemCode: 'missing-decision',
      decisionId: 'DEC-missing',
    };
    expect(getV2Messages('en').errors.expected('SOURCE_VALIDATION', refParams)).toContain(
      'decision: DEC-missing',
    );
    expect(getV2Messages('ko').errors.expected('SOURCE_VALIDATION', refParams)).toContain(
      'decision: DEC-missing',
    );
  });

  it('renders every expected error and source problem code in both locales without fallback leakage', () => {
    const params = {
      actualId: 'TASK-actual',
      allowed: 'OPEN, BRIEF_READY',
      command: 'submit',
      count: 1,
      currentTaskId: 'TASK-current',
      decisionId: 'DEC-1',
      detail: 'technical detail',
      expected: 'OPEN',
      expectedId: 'TASK-expected',
      field: 'field.path',
      items: 'OPEN DEC-1',
      kind: 'WRONG',
      max: 1,
      min: 0,
      namespace: 'legacy',
      optionIndex: 9,
      path: 'path.md',
      problemCode: 'unsupported-enum-value',
      ref: 'ref',
      status: 'CLOSED',
      taskId: 'TASK-1',
      value: 'BAD',
    };
    for (const code of expectedErrorCodes) {
      for (const locale of ['en', 'ko'] as const) {
        const rendered = getV2Messages(locale).errors.expected(code, params);
        expect(rendered, `${locale} ${code}`).not.toContain(`${code}: {`);
        expect(rendered.length).toBeGreaterThan(0);
      }
    }

    for (const [problemCode, fragments] of Object.entries(problemFragments)) {
      const en = getV2Messages('en').errors.expected('SOURCE_VALIDATION', {
        ...params,
        problemCode,
      });
      const ko = getV2Messages('ko').errors.expected('SOURCE_VALIDATION', {
        ...params,
        problemCode,
      });
      expect(en).toContain('field.path');
      expect(en, `en ${problemCode}`).toContain(fragments.en);
      expect(ko, `ko ${problemCode}`).toContain(fragments.ko);
      expect(ko, `ko ${problemCode}`).not.toContain(`${problemCode}: {`);
    }
  });

  it('distinguishes doctor malformed source and interrupted journal recovery diagnostics', () => {
    const malformed = renderDoctorResult(
      {
        healthy: false,
        repaired: [],
        issues: [
          {
            code: 'MALFORMED_SOURCE',
            message: '',
            recovery: '',
            params: {
              path: '.decision/exports/markdown/tasks/bad.md',
              field: 'tasks[0].status',
              problemCode: 'unsupported-enum-value',
              allowed: 'OPEN, BRIEF_READY',
              value: 'BAD',
            },
          },
        ],
      },
      getV2Messages('ko'),
    );
    expect(malformed).toContain('Canonical source 형식이 잘못되었습니다');
    expect(malformed).toContain('허용: OPEN, BRIEF_READY');
    expect(malformed).toContain('잘못된 source 파일을 수정한 뒤');

    const journal = renderDoctorResult(
      {
        healthy: false,
        repaired: [],
        issues: [
          {
            code: 'INTERRUPTED_JOURNAL_RECOVERY_FAILED',
            message: '',
            recovery: '',
            params: { detail: 'rollback missing' },
          },
        ],
      },
      getV2Messages('ko'),
    );
    expect(journal).toContain('중단된 commit journal 복구 실패');
    expect(journal).toContain('rollback missing');
    expect(journal).toContain('journal과 rollback 디렉터리를 보존');
    expect(journal).not.toContain('잘못된 source 파일을 수정');

    for (const [code, en, ko] of [
      [
        'INTERRUPTED_COMMIT',
        'Recovered an interrupted DecisionWorkspace commit journal.',
        '중단된 DecisionWorkspace commit journal을 복구했습니다.',
      ],
      [
        'DB_ONLY_MIGRATED',
        'Migrated DB-only cache to canonical Markdown source.',
        'DB-only cache를 canonical Markdown source로 마이그레이션했습니다.',
      ],
      [
        'CACHE_REBUILT',
        'Rebuilt the local SQLite cache from canonical Markdown source.',
        'canonical Markdown source에서 로컬 SQLite cache를 재빌드했습니다.',
      ],
    ] as const) {
      expect(
        renderDoctorResult(
          { healthy: true, issues: [], repaired: [{ code, params: {} }] },
          getV2Messages('en'),
        ),
      ).toContain(en);
      expect(
        renderDoctorResult(
          { healthy: true, issues: [], repaired: [{ code, params: {} }] },
          getV2Messages('ko'),
        ),
      ).toContain(ko);
    }
  });
});

function shapeOf(value: unknown): unknown {
  if (typeof value === 'function') return 'function';
  if (typeof value !== 'object' || value === null) return typeof value;
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => [key, shapeOf(child)]),
  );
}
