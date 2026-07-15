import type { Locale } from '../../config/global-config.js';
import type { V2ExpectedErrorCode, V2ExpectedErrorParams } from '../../core/v2/errors.js';

export interface V2MessageCatalog {
  common: {
    next: string;
    none: string;
    error: string;
    warning: string;
    created: string;
    existing: string;
    use: string;
    path: string;
    status: string;
    task: string;
    snapshot: string;
    contextPackFor: (taskId: string) => string;
    question: (questionId: string) => string;
    score: string;
    files: string;
    noFiles: string;
    relevance: (reason: string, score?: number) => string;
  };
  commander: {
    help: string;
    helpCommand: string;
    usage: string;
    arguments: string;
    options: string;
    globalOptions: string;
    commands: string;
    versionOption: string;
    unknownCommand: (command: string) => string;
    unknownOption: (option: string) => string;
    missingArgument: (argument: string) => string;
    missingOptionValue: (option: string) => string;
    tooManyArguments: string;
  };
  init: {
    completed: string;
    completedNoChanges: string;
    primaryCompatibility: string;
    selectedAgents: string;
    agentRulesSkipped: string;
    decisionCreated: string;
    decisionExisting: string;
    warnings: string;
    statusCreated: string;
    statusPrepended: string;
    statusKept: string;
    statusOverwritten: string;
    promptMessage: string;
    promptInstructions: string;
    promptRequired: string;
    warning: (code: string, path?: string, detail?: string) => string;
    error: (code: string, path?: string, detail?: string) => string;
    invalidAgent: (agent: string) => string;
  };
  config: {
    localeSet: (locale: Locale, path: string) => string;
    malformedWarning: (path: string, detail: string) => string;
    unsupportedWarning: (path: string, schemaVersion: number) => string;
    unsupportedRefuse: (path: string, schemaVersion: number) => string;
  };
  task: {
    current: (taskId: string) => string;
    title: (title: string) => string;
    status: (status: string) => string;
    started: string;
    resumed: (taskId: string) => string;
    closed: (taskId: string) => string;
    abandoned: (taskId: string) => string;
    noCurrent: string;
  };
  labels: {
    contextItems: string;
    grillMe: string;
    grillMePermissive: string;
    grillMeStarted: string;
    draftSubmissions: string;
    questionsAnswered: string;
    questionsOpen: string;
    briefSnapshots: string;
    implementationTraces: string;
    exports: string;
    progress: string;
    tasks: string;
    questions: string;
    events: string;
    implementationBrief: string;
    decisions: string;
    evidence: string;
    priorDecisions: string;
    priorTraces: string;
    currentEvidence: string;
    changedFiles: string;
    decisionCodeMap: string;
    unmapped: string;
    query: string;
    relatedDecisions: string;
    relatedTraces: string;
    explicit: string;
    inferred: string;
    carried: string;
    conflicts: string;
    open: string;
    confidence: string;
    summary: string;
    sourceRefs: string;
    rationale: string;
    appliesTo: string;
    avoids: string;
    scopeExpected: string;
    scopeAvoided: string;
    options: string;
    agentGrillPrompt: string;
    checklist: string;
    grillProtocol: string;
    draftSchema: string;
    trace: string;
    event: string;
  };
  workflow: {
    work: string;
    grillMe: string;
    submit: string;
    confirm: string;
    implement: string;
    context: string;
    ask: string;
    trace: string;
    remember: string;
    close: string;
    nextWork: string;
    nextContext: string;
    nextGrillMe: string;
    nextSubmit: string;
    nextAsk: string;
    nextBriefConfirm: string;
    nextImplementTrace: string;
    nextRemember: string;
    nextRecallClose: string;
  };
  commands: {
    initDone: string;
    workStarted: string;
    nextForAgent: string;
    grillStarted: string;
    grillAlreadyStarted: string;
    draftSubmitted: string;
    answerSaved: (questionId: string, answer: string) => string;
    noOpenQuestions: string;
    briefConfirmed: string;
    traceCreated: string;
    remembered: string;
    cacheRebuilt: string;
    contextAdded: (count: number) => string;
  };
  errors: {
    unexpected: (detail: string) => string;
    invalidLocale: (locale: string) => string;
    noCurrentTask: string;
    noDraftStdin: string;
    useStdin: string;
    provideOneAnswer: string;
    expected: (code: V2ExpectedErrorCode, params: V2ExpectedErrorParams) => string;
  };
  doctor: {
    healthy: string;
    problems: string;
    repaired: string;
    recovery: string;
    issueMessages: Record<string, (params: Record<string, string>) => string>;
    recoveries: Record<string, string>;
    repairs: Record<string, (params: Record<string, string>) => string>;
  };
  prompt: {
    question: (questionId: string) => string;
    recommended: string;
    rationale: string;
    directInput: string;
    inputAnswer: string;
  };
}

export const enV2Messages = {
  common: {
    next: 'Next',
    none: 'none',
    error: 'Error',
    warning: 'Warning',
    created: 'Created',
    existing: 'Existing',
    use: 'Use',
    path: 'Path',
    status: 'Status',
    task: 'Task',
    snapshot: 'Snapshot',
    contextPackFor: (taskId) => `Context Pack for ${taskId}`,
    question: (questionId) => `Question ${questionId}`,
    score: 'score',
    files: 'files',
    noFiles: 'none',
    relevance: (reason, score) =>
      score === undefined ? ` — ${reason}` : ` — ${reason} (score ${formatScore(score)})`,
  },
  commander: {
    help: 'Display help for command',
    helpCommand: 'display help for command',
    usage: 'Usage:',
    arguments: 'Arguments:',
    options: 'Options:',
    globalOptions: 'Global Options:',
    commands: 'Commands:',
    versionOption: 'output the version number',
    unknownCommand: (command) => `error: unknown command '${command}'`,
    unknownOption: (option) => `error: unknown option '${option}'`,
    missingArgument: (argument) => `error: missing required argument '${argument}'`,
    missingOptionValue: (option) => `error: option '${option}' argument missing`,
    tooManyArguments: 'error: too many arguments',
  },
  init: {
    completed: 'sduck init completed.',
    completedNoChanges: 'sduck init completed with no file changes.',
    primaryCompatibility:
      'Primary: .decision decision-briefing workspace. Compatibility: bundled .sduck SDD assets.',
    selectedAgents: 'Selected agents',
    agentRulesSkipped: 'Agent rules: skipped.',
    decisionCreated: 'Decision created',
    decisionExisting: 'Decision existing',
    warnings: 'Warnings',
    statusCreated: 'created',
    statusPrepended: 'prepended',
    statusKept: 'kept',
    statusOverwritten: 'overwritten',
    promptMessage: 'Select AI agents to generate v2-first repository rule files for',
    promptInstructions: 'Use space to toggle agents, arrow keys to move, and enter to submit.',
    promptRequired: 'Select at least one agent. Use space to toggle and enter to submit.',
    warning: (code, path, detail) => {
      if (code === 'gitignore-update-failed') {
        return `Failed to update ${path ?? '.gitignore'}. Please add the following entries manually:\n${detail ?? ''}`;
      }
      return [code, path, detail].filter((part) => part !== undefined && part !== '').join(': ');
    },
    error: (code, path, detail) =>
      [code, path, detail].filter((part) => part !== undefined && part !== '').join(': '),
    invalidAgent: (agent) => `Unsupported agent: ${agent}`,
  },
  config: {
    localeSet: (locale, path) => `Locale set to ${locale}.\nConfig: ${path}`,
    malformedWarning: (path, detail) => `Ignoring malformed sduck config (${detail}): ${path}`,
    unsupportedWarning: (path, schemaVersion) =>
      `Ignoring unsupported sduck config schemaVersion ${String(schemaVersion)}: ${path}`,
    unsupportedRefuse: (path, schemaVersion) =>
      `Refusing to overwrite unsupported sduck config schemaVersion ${String(schemaVersion)}: ${path}`,
  },
  task: {
    current: (taskId: string) => `Current decision task: ${taskId}`,
    title: (title: string) => `Title: ${title}`,
    status: (status: string) => `Status: ${status}`,
    started: 'Decision task started.',
    resumed: (taskId) => `Decision task resumed: ${taskId}`,
    closed: (taskId) => `Decision task closed: ${taskId}`,
    abandoned: (taskId) => `Decision task abandoned: ${taskId}`,
    noCurrent: 'No current decision task.',
  },
  labels: {
    contextItems: 'Context items',
    grillMe: 'Grill-me',
    grillMePermissive: 'legacy/permissive',
    grillMeStarted: 'started',
    draftSubmissions: 'Draft submissions',
    questionsAnswered: 'Questions answered',
    questionsOpen: 'Questions open',
    briefSnapshots: 'Brief snapshots',
    implementationTraces: 'Implementation traces',
    exports: 'Exports',
    progress: 'Progress',
    tasks: 'Tasks',
    questions: 'Questions',
    events: 'Events',
    implementationBrief: 'Implementation Brief',
    decisions: 'Decisions',
    evidence: 'Evidence',
    priorDecisions: 'Prior decisions',
    priorTraces: 'Prior implementation traces',
    currentEvidence: 'Current evidence',
    changedFiles: 'Changed files',
    decisionCodeMap: 'Decision → code map',
    unmapped: 'Unmapped decisions requiring review',
    query: 'Query',
    relatedDecisions: 'Related decisions',
    relatedTraces: 'Related implementation traces',
    explicit: 'A. Explicit decisions',
    inferred: 'B. Inferred decisions',
    carried: 'C. Carried decisions',
    conflicts: 'D. Conflicts',
    open: 'E. Open decisions',
    confidence: 'Confidence',
    summary: 'Summary',
    sourceRefs: 'Source refs',
    rationale: 'Rationale',
    appliesTo: 'Applies to',
    avoids: 'Avoids',
    scopeExpected: 'Scope expected',
    scopeAvoided: 'Scope avoided',
    options: 'Options',
    agentGrillPrompt: 'Agent grill-me prompt',
    checklist: 'Skill-backed checklist',
    grillProtocol: 'Grill-me protocol',
    draftSchema: 'Draft schema example',
    trace: 'Trace',
    event: 'Event',
  },
  workflow: {
    work: 'work',
    grillMe: 'grill-me',
    submit: 'submit',
    confirm: 'confirm',
    implement: 'implement',
    context: 'context',
    ask: 'ask',
    trace: 'trace',
    remember: 'remember',
    close: 'close',
    nextWork: 'Next: sduck work "<task description>"',
    nextContext: 'Next: sduck context',
    nextGrillMe: 'Next: sduck grill-me',
    nextSubmit: 'Next: sduck submit --stdin < draft.json',
    nextAsk: 'Next: sduck ask',
    nextBriefConfirm: 'Next: sduck brief && sduck confirm',
    nextImplementTrace: 'Next: implement, then sduck trace',
    nextRemember: 'Next: sduck remember',
    nextRecallClose: 'Next: sduck recall "<query>" or sduck close',
  },
  commands: {
    initDone: 'Decision workspace initialized.',
    workStarted: 'Decision task started.',
    nextForAgent: 'Next for agent:',
    grillStarted: 'Grill-me started.',
    grillAlreadyStarted: 'Grill-me already started.',
    draftSubmitted: 'Draft submitted.',
    answerSaved: (questionId, answer) => `Answer saved for ${questionId}: ${answer}`,
    noOpenQuestions: 'No open questions.',
    briefConfirmed: 'Implementation brief confirmed.',
    traceCreated: 'Implementation trace created.',
    remembered: 'Memory exported.',
    cacheRebuilt: 'Decision cache rebuilt.',
    contextAdded: (count) => `Context item(s) added: ${String(count)}`,
  },
  errors: {
    unexpected: (detail) => `Error: ${detail}`,
    invalidLocale: (locale) => `Invalid locale: ${locale}. Expected: en, ko.`,
    noCurrentTask: 'No current decision task. Run `sduck work "..."` first.',
    noDraftStdin: 'No draft received on stdin.',
    useStdin: 'Use --stdin to read draft content.',
    provideOneAnswer: 'Provide exactly one of --option or --text.',
    expected: renderEnExpectedError,
  },
  doctor: {
    healthy: 'Decision workspace is healthy.',
    problems: 'Decision workspace has problems:',
    repaired: 'Repaired',
    recovery: 'Recovery',
    issueMessages: {
      DB_ONLY: () => 'Workspace contains decision data only in the legacy SQLite cache.',
      CACHE_STALE: () => 'Local SQLite cache is missing or does not match canonical source.',
      MALFORMED_SOURCE: (params) =>
        `Canonical source is malformed: ${[
          params['path'],
          params['field'],
          enProblem(params['problemCode'] ?? ''),
          params['allowed'] === undefined ? '' : `allowed: ${params['allowed']}`,
          params['value'] === undefined ? '' : `value: ${params['value']}`,
          params['detail'],
        ]
          .filter(Boolean)
          .join(': ')}`,
      INTERRUPTED_JOURNAL_RECOVERY_FAILED: (params) =>
        `Interrupted commit journal recovery failed: ${params['detail'] ?? ''}`,
    },
    recoveries: {
      DB_ONLY: 'Run `sduck doctor --repair` or `sduck remember` to create canonical source.',
      CACHE_STALE: 'Run `sduck rebuild` or `sduck doctor --repair`.',
      MALFORMED_SOURCE: 'Fix the malformed source file, then run `sduck rebuild`.',
      INTERRUPTED_JOURNAL_RECOVERY_FAILED:
        'Preserve the .commit-*.json journal and rollback directory, then inspect with `sduck doctor`.',
    },
    repairs: {
      INTERRUPTED_COMMIT: () => 'Recovered an interrupted DecisionWorkspace commit journal.',
      DB_ONLY_MIGRATED: () => 'Migrated DB-only cache to canonical Markdown source.',
      CACHE_REBUILT: () => 'Rebuilt the local SQLite cache from canonical Markdown source.',
    },
  },
  prompt: {
    question: (questionId) => `Question ${questionId}`,
    recommended: 'Recommended:',
    rationale: 'Rationale:',
    directInput: 'Type your own answer',
    inputAnswer: 'Enter answer',
  },
} satisfies V2MessageCatalog;

function param(params: V2ExpectedErrorParams, key: string): string {
  return String(params[key] ?? '');
}

function formatScore(score: number): string {
  return Number.isInteger(score) ? score.toFixed(1) : String(score);
}

function enProblem(code: string): string {
  const labels: Record<string, string> = {
    'missing-schema-version': 'missing schemaVersion',
    'unsupported-schema-version': 'schemaVersion must be v2alpha1',
    'non-empty-string': 'must be a non-empty string',
    array: 'must be an array',
    'string-array': 'must be a string array',
    boolean: 'must be a boolean',
    string: 'must be a string',
    'json-object': 'must be a JSON object',
    'yaml-object': 'frontmatter must be a YAML object',
    'yaml-frontmatter': 'missing YAML frontmatter',
    confidence: 'must be a number between 0 and 1',
    'missing-decision': 'references a missing decision',
    'wrong-task': 'belongs to another task',
    'duplicate-id': 'duplicate id',
    'expected-reference': 'reference did not match expected id',
    parse: 'parse error',
    'hash-or-null': 'must be a hash string or null',
    'non-negative-number': 'must be a non-negative number',
    number: 'must be a number',
    'portable-id': 'must be a portable single-segment id',
    'unsupported-enum-value': 'must be one of the allowed values',
    'missing-trace-decision': 'references a decision not included in the trace',
    'task-id': 'must be a valid task id',
    'missing-task': 'references a missing task',
    'terminal-task': 'references a terminal task',
  };
  return labels[code] ?? code;
}

function koProblem(code: string): string {
  const labels: Record<string, string> = {
    'missing-schema-version': 'schemaVersion 누락',
    'unsupported-schema-version': 'schemaVersion은 v2alpha1이어야 합니다',
    'non-empty-string': '비어 있지 않은 문자열이어야 합니다',
    array: '배열이어야 합니다',
    'string-array': '문자열 배열이어야 합니다',
    boolean: 'boolean이어야 합니다',
    string: '문자열이어야 합니다',
    'json-object': 'JSON object여야 합니다',
    'yaml-object': 'frontmatter는 YAML object여야 합니다',
    'yaml-frontmatter': 'YAML frontmatter가 없습니다',
    confidence: '0과 1 사이 숫자여야 합니다',
    'missing-decision': '없는 decision을 참조합니다',
    'wrong-task': '다른 task에 속한 항목입니다',
    'duplicate-id': '중복 id입니다',
    'expected-reference': '참조가 예상 id와 일치하지 않습니다',
    parse: 'parse 오류',
    'hash-or-null': 'hash 문자열 또는 null이어야 합니다',
    'non-negative-number': '0 이상의 숫자여야 합니다',
    number: '숫자여야 합니다',
    'portable-id': 'portable single-segment id여야 합니다',
    'unsupported-enum-value': '허용된 값 중 하나여야 합니다',
    'missing-trace-decision': 'trace에 포함되지 않은 decision을 참조합니다',
    'task-id': '유효한 task id여야 합니다',
    'missing-task': '없는 task를 참조합니다',
    'terminal-task': '종료된 task를 참조합니다',
  };
  return labels[code] ?? code;
}

function renderEnExpectedError(code: V2ExpectedErrorCode, params: V2ExpectedErrorParams): string {
  const p = (key: string) => param(params, key);
  const sourceDetail = () =>
    [
      enProblem(p('problemCode')),
      p('allowed') === '' ? '' : `allowed: ${p('allowed')}`,
      p('value') === '' ? '' : `value: ${p('value')}`,
      p('taskId') === '' ? '' : `task: ${p('taskId')}`,
      p('decisionId') === '' ? '' : `decision: ${p('decisionId')}`,
      p('expectedId') === '' ? '' : `expected: ${p('expectedId')}`,
      p('actualId') === '' ? '' : `actual: ${p('actualId')}`,
      p('detail'),
    ]
      .filter((item) => item !== '')
      .join('; ');
  switch (code) {
    case 'NO_CURRENT_TASK':
      return 'No current decision task. Run `sduck work "..."` first.';
    case 'TASK_NOT_FOUND':
      return `Task not found: ${p('taskId')}`;
    case 'TASK_STATUS_NOT_ALLOWED':
      return `Cannot ${p('command')} task ${p('taskId')}: status is ${p('status')}. Expected: ${p('expected')}.`;
    case 'GRILL_ME_REQUIRED':
      return `Cannot ${p('command')} task ${p('taskId')}: grill-me is required before submitting or confirming. Run \`sduck grill-me\`.`;
    case 'CONFIRM_OPEN_QUESTIONS':
      return `Cannot confirm task ${p('taskId')}: ${p('count')} open question(s) remain.`;
    case 'CONFIRM_UNRESOLVED_DECISIONS':
      return `Cannot confirm task ${p('taskId')}: unresolved ${p('items')}.`;
    case 'CONFIRM_BRIEF_NOT_READY':
      return `Cannot confirm task ${p('taskId')}: the current decision brief is not ready. Submit at least one active decision.`;
    case 'DRAFT_JSON_INVALID':
      return `Draft JSON is malformed: ${p('detail')}`;
    case 'DRAFT_FENCE_MISSING':
      return 'Markdown draft must contain a ```json sduck-draft fenced block.';
    case 'DRAFT_TASK_MISMATCH':
      return `Draft taskId ${p('taskId')} does not match current task ${p('currentTaskId')}.`;
    case 'DRAFT_SCHEMA':
      return `Draft schema error: ${enProblem(p('problemCode'))}`;
    case 'DRAFT_FIELD':
      return `${p('field')} ${enProblem(p('problemCode'))}.`;
    case 'DRAFT_DECISION_KIND':
      return `Invalid decision kind: ${p('kind')}`;
    case 'DRAFT_CONFIDENCE':
      return `${p('field')} confidence must be between 0 and 1: ${p('ref')}`;
    case 'QUESTION_NOT_FOUND':
      return `Question not found: ${p('questionId')}`;
    case 'QUESTION_TASK_MISMATCH':
      return `Question ${p('questionId')} does not belong to current task ${p('taskId')}.`;
    case 'QUESTION_ALREADY_ANSWERED':
      return `Question is already answered: ${p('questionId')}`;
    case 'QUESTION_OPTION_RANGE':
      return `Option index out of range: ${p('optionIndex')}`;
    case 'QUESTION_ANSWER_REQUIRED':
      return 'Provide --option or --text.';
    case 'CONTEXT_NO_MATCHES':
      return `No matching files: ${p('path')}`;
    case 'PATH_OUTSIDE_PROJECT':
      return `Path is outside project: ${p('path')}`;
    case 'ARTIFACT_PATH_INVALID':
      return `Artifact path is invalid: ${p('path')}`;
    case 'ARTIFACT_PATH_OUTSIDE_WORKSPACE':
      return `Artifact path is outside decision workspace: ${p('path')}`;
    case 'ARTIFACT_PATH_RESERVED':
      return `Artifact path targets a reserved ${p('namespace')} path: ${p('path')}`;
    case 'WORKSPACE_LOCKED':
      return `Decision workspace is locked by another process: ${p('path')}`;
    case 'SOURCE_DB_ONLY':
      return 'No markdown source files found. Run `sduck remember` before continuing this DB-only workspace.';
    case 'SOURCE_PARSE':
      return `${p('path')}: ${p('field')}: ${sourceDetail()}`;
    case 'SOURCE_VALIDATION':
      return `${p('field')}: ${sourceDetail()}`;
    case 'POLICY_JSON_INVALID':
      return `.decision/policy.json JSON is malformed: ${p('detail')}`;
    case 'POLICY_INVALID':
      return `.decision/policy.json ${p('field') ? `${p('field')} ` : ''}${enProblem(p('problemCode'))}`;
    case 'STATE_JSON_INVALID':
      return `.decision/state.json JSON is malformed: ${p('detail')}`;
    case 'STATE_INVALID':
      return `.decision/state.json ${p('field') ? `${p('field')} ` : ''}${enProblem(p('problemCode'))}${p('taskId') ? `: ${p('taskId')}` : ''}`;
    case 'REMEMBER_NO_RECORDS':
      return 'No decision records to remember. Run `sduck work "..."` first.';
  }
}

function renderKoExpectedError(code: V2ExpectedErrorCode, params: V2ExpectedErrorParams): string {
  const p = (key: string) => param(params, key);
  const sourceDetail = () =>
    [
      koProblem(p('problemCode')),
      p('allowed') === '' ? '' : `허용: ${p('allowed')}`,
      p('value') === '' ? '' : `값: ${p('value')}`,
      p('taskId') === '' ? '' : `task: ${p('taskId')}`,
      p('decisionId') === '' ? '' : `decision: ${p('decisionId')}`,
      p('expectedId') === '' ? '' : `예상: ${p('expectedId')}`,
      p('actualId') === '' ? '' : `실제: ${p('actualId')}`,
      p('detail'),
    ]
      .filter((item) => item !== '')
      .join('; ');
  switch (code) {
    case 'NO_CURRENT_TASK':
      return '현재 decision task가 없습니다. 먼저 `sduck work "..."`를 실행하세요.';
    case 'TASK_NOT_FOUND':
      return `Task를 찾을 수 없습니다: ${p('taskId')}`;
    case 'TASK_STATUS_NOT_ALLOWED':
      return `${p('command')} 실행 불가: task ${p('taskId')} 상태는 ${p('status')}입니다. 필요 상태: ${p('expected')}.`;
    case 'GRILL_ME_REQUIRED':
      return `${p('command')} 실행 전 grill-me가 필요합니다. task: ${p('taskId')}. \`sduck grill-me\`를 실행하세요.`;
    case 'CONFIRM_OPEN_QUESTIONS':
      return `confirm 불가: task ${p('taskId')}에 열린 질문 ${p('count')}개가 남았습니다.`;
    case 'CONFIRM_UNRESOLVED_DECISIONS':
      return `confirm 불가: task ${p('taskId')}에 미해결 결정이 있습니다: ${p('items')}.`;
    case 'CONFIRM_BRIEF_NOT_READY':
      return `confirm 불가: task ${p('taskId')}의 decision brief가 아직 준비되지 않았습니다. active decision을 하나 이상 제출하세요.`;
    case 'DRAFT_JSON_INVALID':
      return `Draft JSON 형식이 잘못되었습니다: ${p('detail')}`;
    case 'DRAFT_FENCE_MISSING':
      return 'Markdown draft에는 ```json sduck-draft fenced block이 필요합니다.';
    case 'DRAFT_TASK_MISMATCH':
      return `Draft taskId ${p('taskId')}가 현재 task ${p('currentTaskId')}와 다릅니다.`;
    case 'DRAFT_SCHEMA':
      return `Draft schema 오류: ${koProblem(p('problemCode'))}`;
    case 'DRAFT_FIELD':
      return `${p('field')} ${koProblem(p('problemCode'))}.`;
    case 'DRAFT_DECISION_KIND':
      return `잘못된 decision kind: ${p('kind')}`;
    case 'DRAFT_CONFIDENCE':
      return `${p('field')} confidence는 0과 1 사이여야 합니다: ${p('ref')}`;
    case 'QUESTION_NOT_FOUND':
      return `질문을 찾을 수 없습니다: ${p('questionId')}`;
    case 'QUESTION_TASK_MISMATCH':
      return `질문 ${p('questionId')}은 현재 task ${p('taskId')}에 속하지 않습니다.`;
    case 'QUESTION_ALREADY_ANSWERED':
      return `이미 답변한 질문입니다: ${p('questionId')}`;
    case 'QUESTION_OPTION_RANGE':
      return `옵션 번호 범위를 벗어났습니다: ${p('optionIndex')}`;
    case 'QUESTION_ANSWER_REQUIRED':
      return '--option 또는 --text를 제공하세요.';
    case 'CONTEXT_NO_MATCHES':
      return `일치하는 파일이 없습니다: ${p('path')}`;
    case 'PATH_OUTSIDE_PROJECT':
      return `프로젝트 밖 경로입니다: ${p('path')}`;
    case 'ARTIFACT_PATH_INVALID':
      return `Artifact path가 잘못되었습니다: ${p('path')}`;
    case 'ARTIFACT_PATH_OUTSIDE_WORKSPACE':
      return `Artifact path가 decision workspace 밖입니다: ${p('path')}`;
    case 'ARTIFACT_PATH_RESERVED':
      return `Artifact path가 예약된 ${p('namespace')} 경로입니다: ${p('path')}`;
    case 'WORKSPACE_LOCKED':
      return `Decision workspace가 다른 프로세스에 의해 잠겨 있습니다: ${p('path')}`;
    case 'SOURCE_DB_ONLY':
      return 'Markdown source 파일이 없습니다. 이 DB-only workspace를 계속하려면 `sduck remember`를 먼저 실행하세요.';
    case 'SOURCE_PARSE':
      return `${p('path')}: ${p('field')}: ${sourceDetail()}`;
    case 'SOURCE_VALIDATION':
      return `${p('field')}: ${sourceDetail()}`;
    case 'POLICY_JSON_INVALID':
      return `.decision/policy.json JSON 형식이 잘못되었습니다: ${p('detail')}`;
    case 'POLICY_INVALID':
      return `.decision/policy.json ${p('field') ? `${p('field')} ` : ''}${koProblem(p('problemCode'))}`;
    case 'STATE_JSON_INVALID':
      return `.decision/state.json JSON 형식이 잘못되었습니다: ${p('detail')}`;
    case 'STATE_INVALID':
      return `.decision/state.json ${p('field') ? `${p('field')} ` : ''}${koProblem(p('problemCode'))}${p('taskId') ? `: ${p('taskId')}` : ''}`;
    case 'REMEMBER_NO_RECORDS':
      return '기억할 decision record가 없습니다. 먼저 `sduck work "..."`를 실행하세요.';
  }
}

export const koV2Messages = {
  common: {
    next: '다음',
    none: '없음',
    error: '오류',
    warning: '경고',
    created: '생성됨',
    existing: '기존 항목',
    use: '사용',
    path: '경로',
    status: '상태',
    task: 'Task',
    snapshot: '스냅샷',
    contextPackFor: (taskId) => `${taskId} Context Pack`,
    question: (questionId) => `질문 ${questionId}`,
    score: '점수',
    files: '파일',
    noFiles: '없음',
    relevance: (reason, score) =>
      score === undefined ? ` — ${reason}` : ` — ${reason} (점수 ${formatScore(score)})`,
  },
  commander: {
    help: '명령 도움말 표시',
    helpCommand: '명령 도움말 표시',
    usage: '사용법:',
    arguments: '인자:',
    options: '옵션:',
    globalOptions: '전역 옵션:',
    commands: '명령:',
    versionOption: '버전 번호 출력',
    unknownCommand: (command) => `오류: 알 수 없는 명령 '${command}'`,
    unknownOption: (option) => `오류: 알 수 없는 옵션 '${option}'`,
    missingArgument: (argument) => `오류: 필수 인자 누락 '${argument}'`,
    missingOptionValue: (option) => `오류: 옵션 '${option}' 인자가 누락되었습니다`,
    tooManyArguments: '오류: 인자가 너무 많습니다',
  },
  init: {
    completed: 'sduck init 완료.',
    completedNoChanges: 'sduck init 완료: 파일 변경 없음.',
    primaryCompatibility:
      'Primary: .decision decision-briefing workspace. Compatibility: bundled .sduck SDD assets.',
    selectedAgents: '선택한 agents',
    agentRulesSkipped: 'Agent rules: 건너뜀.',
    decisionCreated: 'Decision 생성됨',
    decisionExisting: 'Decision 기존 항목',
    warnings: '경고',
    statusCreated: '생성됨',
    statusPrepended: '앞에 추가됨',
    statusKept: '유지됨',
    statusOverwritten: '덮어씀',
    promptMessage: 'v2 우선 repository rule 파일을 생성할 AI agent를 선택하세요',
    promptInstructions: 'space로 선택을 토글하고, 방향키로 이동한 뒤 enter로 제출하세요.',
    promptRequired: '하나 이상의 agent를 선택하세요. space로 선택하고 enter로 제출하세요.',
    warning: (code, path, detail) => {
      const labels: Record<string, string> = {
        'kept-existing-asset': '기존 asset 유지',
        'kept-existing-rule': '기존 rule 파일 유지',
        'kept-existing-non-file-hook': '파일이 아닌 Claude Code hook 경로 유지',
        'kept-settings-non-object-hooks': 'hooks가 object가 아닌 Claude Code settings 유지',
        'kept-settings-non-array-pre-tool-use':
          'PreToolUse hooks가 배열이 아닌 Claude Code settings 유지',
        'kept-invalid-settings': '잘못된 Claude Code settings 파일 유지',
        'kept-existing-non-file-settings': '파일이 아닌 Claude Code settings 경로 유지',
        'cannot-create-skills-directory': 'skills 디렉터리를 만들 수 없음',
        'cannot-copy-skill-non-file': 'skill을 복사할 수 없음',
        'skill-source-not-found': 'skill source를 찾을 수 없음',
        'gitignore-update-failed': '.gitignore 업데이트 실패. 다음 항목을 직접 추가하세요',
        'refresh-assets-recommended':
          '`sduck init --force`로 bundled assets를 재생성할 수 있습니다',
        'refresh-rules-recommended':
          '`sduck init --force`로 선택한 agent rule content를 갱신할 수 있습니다',
      };
      return [labels[code] ?? code, path, detail]
        .filter((part) => part !== undefined && part !== '')
        .join(': ');
    },
    error: (code, path, detail) => {
      const labels: Record<string, string> = {
        'asset-root-conflict': 'asset root는 디렉터리여야 합니다',
        'workspace-root-conflict': 'workspace root는 디렉터리여야 합니다',
        'type-conflict': '파일이 필요하지만 디렉터리가 있습니다',
        'invalid-agent': '지원하지 않는 agent',
        'asset-write-failed': 'asset 쓰기 실패',
        'unknown-fs-error': '알 수 없는 파일 시스템 오류',
      };
      return [labels[code] ?? code, path, detail]
        .filter((part) => part !== undefined && part !== '')
        .join(': ');
    },
    invalidAgent: (agent) => `지원하지 않는 agent: ${agent}`,
  },
  config: {
    localeSet: (locale, path) => `언어 설정: ${locale}\n설정 파일: ${path}`,
    malformedWarning: (path, detail) => `잘못된 sduck 설정을 무시합니다(${detail}): ${path}`,
    unsupportedWarning: (path, schemaVersion) =>
      `지원하지 않는 sduck 설정 schemaVersion ${String(schemaVersion)}을 무시합니다: ${path}`,
    unsupportedRefuse: (path, schemaVersion) =>
      `지원하지 않는 sduck 설정 schemaVersion ${String(schemaVersion)}은 덮어쓰지 않습니다: ${path}`,
  },
  task: {
    current: (taskId: string) => `현재 decision task: ${taskId}`,
    title: (title: string) => `제목: ${title}`,
    status: (status: string) => `상태: ${status}`,
    started: 'Decision task를 시작했어요.',
    resumed: (taskId) => `Decision task 재개: ${taskId}`,
    closed: (taskId) => `Decision task 종료: ${taskId}`,
    abandoned: (taskId) => `Decision task 폐기: ${taskId}`,
    noCurrent: '현재 decision task가 없습니다.',
  },
  labels: {
    contextItems: '컨텍스트 항목',
    grillMe: 'Grill-me',
    grillMePermissive: 'legacy/permissive',
    grillMeStarted: '시작됨',
    draftSubmissions: 'Draft 제출',
    questionsAnswered: '답변한 질문',
    questionsOpen: '열린 질문',
    briefSnapshots: 'Brief 스냅샷',
    implementationTraces: '구현 trace',
    exports: 'Export',
    progress: '진행 상황',
    tasks: '작업',
    questions: '질문',
    events: '이벤트',
    implementationBrief: '구현 Brief',
    decisions: '결정',
    evidence: '근거',
    priorDecisions: '이전 결정',
    priorTraces: '이전 구현 trace',
    currentEvidence: '현재 근거',
    changedFiles: '변경 파일',
    decisionCodeMap: 'Decision → code 매핑',
    unmapped: '검토가 필요한 미매핑 결정',
    query: '검색어',
    relatedDecisions: '관련 결정',
    relatedTraces: '관련 구현 trace',
    explicit: 'A. 명시적 결정',
    inferred: 'B. 추론한 결정',
    carried: 'C. 이어받은 결정',
    conflicts: 'D. 충돌',
    open: 'E. 열린 결정',
    confidence: '신뢰도',
    summary: '요약',
    sourceRefs: 'Source 참조',
    rationale: '근거',
    appliesTo: '적용 대상',
    avoids: '피할 범위',
    scopeExpected: '예상 범위',
    scopeAvoided: '제외 범위',
    options: '선택지',
    agentGrillPrompt: 'Agent grill-me 프롬프트',
    checklist: 'Skill 기반 체크리스트',
    grillProtocol: 'Grill-me 프로토콜',
    draftSchema: 'Draft schema 예시',
    trace: 'Trace',
    event: '이벤트',
  },
  workflow: {
    work: 'work',
    grillMe: 'grill-me',
    submit: 'submit',
    confirm: 'confirm',
    implement: 'implement',
    context: 'context',
    ask: 'ask',
    trace: 'trace',
    remember: 'remember',
    close: 'close',
    nextWork: '다음: sduck work "<작업 설명>"',
    nextContext: '다음: sduck context',
    nextGrillMe: '다음: sduck grill-me',
    nextSubmit: '다음: sduck submit --stdin < draft.json',
    nextAsk: '다음: sduck ask',
    nextBriefConfirm: '다음: sduck brief && sduck confirm',
    nextImplementTrace: '다음: 구현 후 sduck trace',
    nextRemember: '다음: sduck remember',
    nextRecallClose: '다음: sduck recall "<query>" 또는 sduck close',
  },
  commands: {
    initDone: 'Decision workspace가 초기화되었습니다.',
    workStarted: 'Decision task를 시작했어요.',
    nextForAgent: '에이전트 다음 단계:',
    grillStarted: 'Grill-me를 시작했습니다.',
    grillAlreadyStarted: 'Grill-me가 이미 시작되었습니다.',
    draftSubmitted: 'Draft를 제출했습니다.',
    answerSaved: (questionId, answer) => `${questionId} 답변 저장: ${answer}`,
    noOpenQuestions: '열린 질문이 없습니다.',
    briefConfirmed: '구현 brief를 확정했습니다.',
    traceCreated: '구현 trace를 생성했습니다.',
    remembered: '메모리를 export했습니다.',
    cacheRebuilt: 'Decision cache를 재빌드했습니다.',
    contextAdded: (count) => `컨텍스트 항목 추가: ${String(count)}`,
  },
  errors: {
    unexpected: (detail) => `오류: ${detail}`,
    invalidLocale: (locale) => `지원하지 않는 locale: ${locale}. en 또는 ko를 사용하세요.`,
    noCurrentTask: '현재 decision task가 없습니다. 먼저 `sduck work "..."`를 실행하세요.',
    noDraftStdin: 'stdin으로 받은 draft가 없습니다.',
    useStdin: 'draft 내용을 읽으려면 --stdin을 사용하세요.',
    provideOneAnswer: '--option 또는 --text 중 하나만 제공하세요.',
    expected: renderKoExpectedError,
  },
  doctor: {
    healthy: 'Decision workspace가 정상입니다.',
    problems: 'Decision workspace에 문제가 있습니다:',
    repaired: '복구됨',
    recovery: '복구 방법',
    issueMessages: {
      DB_ONLY: () => 'Workspace decision data가 legacy SQLite cache에만 있습니다.',
      CACHE_STALE: () => '로컬 SQLite cache가 없거나 canonical source와 일치하지 않습니다.',
      MALFORMED_SOURCE: (params) =>
        `Canonical source 형식이 잘못되었습니다: ${[
          params['path'],
          params['field'],
          koProblem(params['problemCode'] ?? ''),
          params['allowed'] === undefined ? '' : `허용: ${params['allowed']}`,
          params['value'] === undefined ? '' : `값: ${params['value']}`,
          params['detail'],
        ]
          .filter(Boolean)
          .join(': ')}`,
      INTERRUPTED_JOURNAL_RECOVERY_FAILED: (params) =>
        `중단된 commit journal 복구 실패: ${params['detail'] ?? ''}`,
    },
    recoveries: {
      DB_ONLY:
        'canonical source를 만들려면 `sduck doctor --repair` 또는 `sduck remember`를 실행하세요.',
      CACHE_STALE: '`sduck rebuild` 또는 `sduck doctor --repair`를 실행하세요.',
      MALFORMED_SOURCE: '잘못된 source 파일을 수정한 뒤 `sduck rebuild`를 실행하세요.',
      INTERRUPTED_JOURNAL_RECOVERY_FAILED:
        '.commit-*.json journal과 rollback 디렉터리를 보존한 뒤 `sduck doctor`로 확인하세요.',
    },
    repairs: {
      INTERRUPTED_COMMIT: () => '중단된 DecisionWorkspace commit journal을 복구했습니다.',
      DB_ONLY_MIGRATED: () => 'DB-only cache를 canonical Markdown source로 마이그레이션했습니다.',
      CACHE_REBUILT: () => 'canonical Markdown source에서 로컬 SQLite cache를 재빌드했습니다.',
    },
  },
  prompt: {
    question: (questionId) => `질문 ${questionId}`,
    recommended: '추천:',
    rationale: '근거:',
    directInput: '직접 입력',
    inputAnswer: '답변을 입력하세요',
  },
} satisfies V2MessageCatalog;

export const V2_MESSAGE_CATALOGS: Record<Locale, V2MessageCatalog> = {
  en: enV2Messages,
  ko: koV2Messages,
};

export function getV2Messages(locale: Locale): V2MessageCatalog {
  return V2_MESSAGE_CATALOGS[locale];
}
