import { execFileSync } from 'node:child_process';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { openDatabase } from '../../src/core/v2/store.js';
import { runCli } from '../helpers/run-cli.js';
import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';

describe('phase 2c v2 localization matrix', () => {
  const cliRoot = process.cwd();
  let workspace: string | null = null;
  let configHome: string | null = null;

  afterEach(async () => {
    if (workspace !== null) await removeTempWorkspace(workspace);
    if (configHome !== null) await removeTempWorkspace(configHome);
    workspace = null;
    configHome = null;
  });

  it('covers root and every public v2 help surface in English and persisted Korean', async () => {
    workspace = await createTempWorkspace('v2-phase2c-help-');
    configHome = await createTempWorkspace('v2-phase2c-help-config-');
    const env = { SDUCK_CONFIG_HOME: configHome };
    const helpCommands: { args: string[]; en: string; ko: string }[] = [
      { args: [], en: 'Terminal-first decision briefing', ko: 'AI 코딩 에이전트' },
      { args: ['init'], en: 'Initialize the v2', ko: '초기화합니다' },
      { args: ['config'], en: 'Manage user-global', ko: '사용자 전역' },
      { args: ['config', 'locale'], en: 'Set v2 display locale', ko: '표시 언어' },
      { args: ['work'], en: 'Start a decision briefing task', ko: 'task를 시작' },
      {
        args: ['status'],
        en: 'Show current decision briefing status',
        ko: '현재 decision briefing 상태',
      },
      { args: ['resume'], en: 'Resume a previous', ko: '이전 decision task 재개' },
      { args: ['context'], en: 'Show or extend current context pack', ko: 'context pack' },
      { args: ['context', 'add'], en: 'Add file/path context', ko: '파일/경로 context 추가' },
      { args: ['grill-me'], en: 'Record the required grill-me', ko: '필수 grill-me 기록' },
      { args: ['submit'], en: 'Submit agent-generated', ko: 'agent draft' },
      { args: ['ask'], en: 'Ask the next open question', ko: '다음 열린 질문' },
      { args: ['answer'], en: 'Answer a question', ko: '질문에' },
      { args: ['brief'], en: 'Render the current implementation brief', ko: '현재 구현 brief' },
      {
        args: ['confirm'],
        en: 'Confirm the current implementation brief',
        ko: '현재 구현 brief 확정',
      },
      { args: ['trace'], en: 'Create implementation trace', ko: '구현 trace 생성' },
      { args: ['remember'], en: 'Export markdown', ko: 'Markdown 및 decision graph' },
      {
        args: ['rebuild'],
        en: 'Rebuild the local decision DB cache',
        ko: '로컬 decision DB cache 재빌드',
      },
      { args: ['doctor'], en: 'Diagnose malformed source', ko: '잘못된 source' },
      { args: ['recall'], en: 'Search prior decisions', ko: '이전 결정' },
      { args: ['close'], en: 'Close the current decision task', ko: '현재 decision task 종료' },
      { args: ['abandon'], en: 'Abandon the current decision task', ko: '현재 decision task 폐기' },
    ];

    for (const command of helpCommands) {
      const en = await runCli([...command.args, '--help'], { cliRoot, cwd: workspace, env });
      expect(en.exitCode, command.args.join(' ') || 'root').toBe(0);
      expect(en.stdout).toContain('Usage:');
      expect(en.stdout).toContain('Options:');
      expect(en.stdout).toContain(command.en);
    }
    const rootEn = await runCli(['--help'], { cliRoot, cwd: workspace, env });
    expect(rootEn.stdout).toContain('output the version number');

    await runCli(['config', 'locale', 'ko'], { cliRoot, cwd: workspace, env });
    for (const command of helpCommands) {
      const ko = await runCli([...command.args, '--help'], { cliRoot, cwd: workspace, env });
      expect(ko.exitCode, command.args.join(' ') || 'root').toBe(0);
      expect(ko.stdout).toContain('사용법:');
      expect(ko.stdout).toContain('옵션:');
      expect(ko.stdout).toContain(command.ko);
    }
    const rootKo = await runCli(['--help'], { cliRoot, cwd: workspace, env });
    expect(rootKo.stdout).toContain('버전 번호 출력');

    const legacyEn = await runCli(['help', 'start'], { cliRoot, cwd: workspace, env });
    const legacyKo = await runCli(['start', '--help'], { cliRoot, cwd: workspace, env });
    expect(legacyEn.stdout).toContain('Usage:');
    expect(legacyKo.stdout).toContain('Usage:');
    expect(legacyKo.stdout).not.toContain('사용법:');

    const parserChecks: [string[], string][] = [
      [['resume'], '필수 인자 누락'],
      [['trace', '--base'], "옵션 '--base <ref>' 인자가 누락"],
      [['status', '--bogus'], '알 수 없는 옵션'],
      [['not-a-v2-command'], '알 수 없는 명령'],
    ];
    for (const [args, expected] of parserChecks) {
      const result = await runCli(args, { cliRoot, cwd: workspace, env });
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain(expected);
    }
  }, 20_000);

  it('keeps JSON-capable v2 command data locale-neutral across en and ko', async () => {
    workspace = await createTempWorkspace('v2-phase2c-json-');
    configHome = await createTempWorkspace('v2-phase2c-json-config-');
    const env = { SDUCK_CONFIG_HOME: configHome };
    execFileSync('git', ['init'], { cwd: workspace });
    await writeFile(join(workspace, 'tracked.ts'), 'export const value = 1;\n');
    execFileSync('git', ['add', 'tracked.ts'], { cwd: workspace });
    execFileSync(
      'git',
      ['-c', 'user.name=t', '-c', 'user.email=t@example.com', 'commit', '-m', 'init'],
      {
        cwd: workspace,
      },
    );

    await runCli(['init', '--no-agent-rules'], { cliRoot, cwd: workspace, env });
    await runCli(['work', 'json parity'], { cliRoot, cwd: workspace, env });
    const initialStatus = await runCli(['status', '--json'], { cliRoot, cwd: workspace, env });
    const taskId = (JSON.parse(initialStatus.stdout) as { task: { id: string } }).task.id;
    await runCli(['grill-me', '--json'], { cliRoot, cwd: workspace, env });
    const draft = JSON.stringify({
      schemaVersion: 'v2alpha1',
      taskId,
      decisions: [{ id: 'DEC-json', title: 'JSON', kind: 'EXPLICIT', summary: 'Locale-neutral.' }],
    });
    await runCli(['submit', '--stdin'], { cliRoot, cwd: workspace, env, stdin: draft });
    await runCli(['brief', '--json'], { cliRoot, cwd: workspace, env });
    await runCli(['confirm'], { cliRoot, cwd: workspace, env });
    await writeFile(join(workspace, 'tracked.ts'), 'export const value = 2;\n');
    const trace = await runCli(['trace', '--json'], { cliRoot, cwd: workspace, env });
    const status = await runCli(['status', '--json'], { cliRoot, cwd: workspace, env });
    const context = await runCli(['context', '--json'], { cliRoot, cwd: workspace, env });
    const grill = await runCli(['grill-me', '--json'], { cliRoot, cwd: workspace, env });
    const brief = await runCli(['brief', '--json'], { cliRoot, cwd: workspace, env });

    await runCli(['config', 'locale', 'ko'], { cliRoot, cwd: workspace, env });
    await runCli(['resume', taskId], { cliRoot, cwd: workspace, env });
    expect(
      JSON.parse((await runCli(['status', '--json'], { cliRoot, cwd: workspace, env })).stdout),
    ).toEqual(JSON.parse(status.stdout));
    expect(
      JSON.parse((await runCli(['context', '--json'], { cliRoot, cwd: workspace, env })).stdout),
    ).toEqual(JSON.parse(context.stdout));
    expect(
      JSON.parse((await runCli(['grill-me', '--json'], { cliRoot, cwd: workspace, env })).stdout),
    ).toEqual(JSON.parse(grill.stdout));
    expect(
      JSON.parse((await runCli(['brief', '--json'], { cliRoot, cwd: workspace, env })).stdout),
    ).toEqual(JSON.parse(brief.stdout));
    const koTrace = JSON.parse(
      (await runCli(['trace', '--json'], { cliRoot, cwd: workspace, env })).stdout,
    ) as { trace: { id: string; createdAt: string }; filesChanged: string[] };
    const enTrace = JSON.parse(trace.stdout) as {
      trace: { id: string; createdAt: string };
      filesChanged: string[];
    };
    koTrace.trace.id = '<id>';
    koTrace.trace.createdAt = '<createdAt>';
    enTrace.trace.id = '<id>';
    enTrace.trace.createdAt = '<createdAt>';
    expect(koTrace).toEqual(enTrace);
  }, 20_000);

  it('covers workflow next-step transitions and canonical brief equality across locales', async () => {
    workspace = await createTempWorkspace('v2-phase2c-flow-');
    configHome = await createTempWorkspace('v2-phase2c-flow-config-');
    const env = { SDUCK_CONFIG_HOME: configHome };
    execFileSync('git', ['init'], { cwd: workspace });
    await writeFile(join(workspace, 'flow.ts'), 'export const flow = 1;\n');
    execFileSync('git', ['add', 'flow.ts'], { cwd: workspace });
    execFileSync(
      'git',
      ['-c', 'user.name=t', '-c', 'user.email=t@example.com', 'commit', '-m', 'init'],
      {
        cwd: workspace,
      },
    );
    await runCli(['init', '--no-agent-rules'], { cliRoot, cwd: workspace, env });
    const work = await runCli(['work', 'transition matrix'], { cliRoot, cwd: workspace, env });
    expect(work.stdout).toContain('sduck context');
    let context = await runCli(['context'], { cliRoot, cwd: workspace, env });
    expect(context.stdout).toContain('Next: sduck grill-me');
    await runCli(['grill-me'], { cliRoot, cwd: workspace, env });
    context = await runCli(['context'], { cliRoot, cwd: workspace, env });
    expect(context.stdout).toContain('Next: sduck submit --stdin');
    const taskId = (
      JSON.parse((await runCli(['status', '--json'], { cliRoot, cwd: workspace, env })).stdout) as {
        task: { id: string };
      }
    ).task.id;
    const submit = await runCli(['submit', '--stdin'], {
      cliRoot,
      cwd: workspace,
      env,
      stdin: JSON.stringify({
        schemaVersion: 'v2alpha1',
        taskId,
        decisions: [{ id: 'DEC-flow', title: 'Flow', kind: 'EXPLICIT', summary: 'Complete.' }],
        questions: [
          { id: 'Q-one', text: 'First?', recommendedAnswer: 'A', options: ['A'] },
          { id: 'Q-two', text: 'Second?', recommendedAnswer: 'B', options: ['B'] },
        ],
      }),
    });
    expect(submit.stdout).toContain('Next: sduck ask');
    expect((await runCli(['ask'], { cliRoot, cwd: workspace, env })).stdout).toContain(
      'Question Q-one',
    );
    const answerOne = await runCli(['answer', 'Q-one', '--option', '1'], {
      cliRoot,
      cwd: workspace,
      env,
    });
    expect(answerOne.stdout).toContain('Next: sduck ask');
    const answerTwo = await runCli(['answer', 'Q-two', '--option', '1'], {
      cliRoot,
      cwd: workspace,
      env,
    });
    expect(answerTwo.stdout).toContain('Next: sduck brief && sduck confirm');
    expect((await runCli(['brief'], { cliRoot, cwd: workspace, env })).stdout).toContain(
      'Implementation Brief',
    );
    const confirm = await runCli(['confirm'], { cliRoot, cwd: workspace, env });
    expect(confirm.stdout).toContain('Next: implement, then sduck trace');
    await writeFile(join(workspace, 'flow.ts'), 'export const flow = 2;\n');
    const trace = await runCli(['trace'], { cliRoot, cwd: workspace, env });
    expect(trace.stdout).toContain('Next: sduck remember');
    const canonicalEn = await readFile(
      join(workspace, '.decision', 'exports', 'markdown', 'tasks', `${taskId}.md`),
      'utf8',
    );
    await runCli(['config', 'locale', 'ko'], { cliRoot, cwd: workspace, env });
    const canonicalKo = await readFile(
      join(workspace, '.decision', 'exports', 'markdown', 'tasks', `${taskId}.md`),
      'utf8',
    );
    expect(canonicalKo).toBe(canonicalEn);
    const remember = await runCli(['remember'], { cliRoot, cwd: workspace, env });
    expect(remember.stdout).toContain('다음: sduck recall');
    expect((await runCli(['recall', 'Flow'], { cliRoot, cwd: workspace, env })).stdout).toContain(
      '검색어',
    );
    expect((await runCli(['close'], { cliRoot, cwd: workspace, env })).stdout).toContain('종료');

    const legacyWorkspace = await createTempWorkspace('v2-phase2c-permissive-');
    try {
      await runCli(['init', '--no-agent-rules'], { cliRoot, cwd: legacyWorkspace, env });
      await runCli(['work', 'historical source before policy deletion'], {
        cliRoot,
        cwd: legacyWorkspace,
        env,
      });
      await rm(join(legacyWorkspace, '.decision', 'policy.json'));
      await runCli(['work', 'permissive transition'], { cliRoot, cwd: legacyWorkspace, env });
      const permissive = await runCli(['status'], { cliRoot, cwd: legacyWorkspace, env });
      expect(permissive.stdout).toContain('legacy/permissive');
      const permissiveTaskId = (
        JSON.parse(
          (await runCli(['status', '--json'], { cliRoot, cwd: legacyWorkspace, env })).stdout,
        ) as { task: { id: string } }
      ).task.id;
      const directSubmit = await runCli(['submit', '--stdin'], {
        cliRoot,
        cwd: legacyWorkspace,
        env,
        stdin: JSON.stringify({
          schemaVersion: 'v2alpha1',
          taskId: permissiveTaskId,
          decisions: [
            { id: 'DEC-permissive', title: 'Permissive', kind: 'EXPLICIT', summary: 'No gate.' },
          ],
        }),
      });
      expect(directSubmit.exitCode).toBe(0);
      expect(directSubmit.stderr).not.toContain('grill-me가 필요');
      expect((await runCli(['brief'], { cliRoot, cwd: legacyWorkspace, env })).stdout).toContain(
        '구현 Brief',
      );
      const directConfirm = await runCli(['confirm'], { cliRoot, cwd: legacyWorkspace, env });
      expect(directConfirm.exitCode).toBe(0);
      expect(directConfirm.stderr).not.toContain('grill-me가 필요');
      expect(directConfirm.stdout).toContain('다음: 구현 후 sduck trace');
    } finally {
      await removeTempWorkspace(legacyWorkspace);
    }
  }, 20_000);

  it('renders complete brief fields in both locales and keeps canonical rendered brief equal', async () => {
    configHome = await createTempWorkspace('v2-phase2c-brief-config-');
    const enWorkspace = await createTempWorkspace('v2-phase2c-brief-en-');
    const koWorkspace = await createTempWorkspace('v2-phase2c-brief-ko-');
    try {
      const env = { SDUCK_CONFIG_HOME: configHome };
      const runBriefFlow = async (cwd: string, locale: 'en' | 'ko') => {
        if (locale === 'ko') await runCli(['config', 'locale', 'ko'], { cliRoot, cwd, env });
        await runCli(['init', '--no-agent-rules'], { cliRoot, cwd, env });
        await runCli(['work', 'complete brief'], { cliRoot, cwd, env });
        await runCli(['grill-me'], { cliRoot, cwd, env });
        const taskId = (
          JSON.parse((await runCli(['status', '--json'], { cliRoot, cwd, env })).stdout) as {
            task: { id: string };
          }
        ).task.id;
        await runCli(['submit', '--stdin'], {
          cliRoot,
          cwd,
          env,
          stdin: JSON.stringify({
            schemaVersion: 'v2alpha1',
            taskId,
            expectedScope: ['src/keep.ts'],
            avoidScope: ['src/avoid.ts'],
            decisions: [
              {
                id: 'DEC-complete',
                title: 'Complete decision',
                kind: 'EXPLICIT',
                summary: 'Use the complete path.',
                confidence: 0.9,
                rationale: ['Because evidence says so.'],
                appliesTo: ['src/keep.ts'],
                avoids: ['src/avoid.ts'],
                sourceRefs: ['REF-1'],
              },
            ],
            questions: [
              {
                id: 'Q-complete',
                text: 'Which option?',
                recommendedAnswer: 'Option A',
                options: ['Option A', 'Option B'],
              },
            ],
            evidence: [
              {
                id: 'EVD-complete',
                sourceType: 'CODE',
                sourceRef: 'src/keep.ts',
                summary: 'Code evidence.',
                confidence: 0.8,
              },
            ],
          }),
        });
        await runCli(['answer', 'Q-complete', '--option', '1'], { cliRoot, cwd, env });
        const terminal = await runCli(['brief'], { cliRoot, cwd, env });
        await runCli(['confirm'], { cliRoot, cwd, env });
        const source = await readFile(
          join(cwd, '.decision', 'exports', 'markdown', 'tasks', `${taskId}.md`),
          'utf8',
        );
        const match = /```json sduck-source\n([\s\S]*?)\n```/.exec(source);
        if (match?.[1] === undefined) throw new Error('missing sduck source block');
        const parsed = JSON.parse(match[1]) as {
          briefSnapshots: { snapshot: unknown; renderedMarkdown: string }[];
        };
        return {
          terminal: terminal.stdout,
          renderedMarkdown: parsed.briefSnapshots[0]?.renderedMarkdown ?? '',
        };
      };
      const en = await runBriefFlow(enWorkspace, 'en');
      const ko = await runBriefFlow(koWorkspace, 'ko');
      for (const raw of [
        'DEC-complete',
        'Complete decision',
        '0.90',
        'REF-1',
        'Because evidence says so.',
        'src/keep.ts',
        'src/avoid.ts',
        'Q-complete',
        'Option A',
        'Code evidence.',
      ]) {
        expect(en.terminal).toContain(raw);
        expect(ko.terminal).toContain(raw);
      }
      for (const section of [
        'Implementation Brief',
        'Explicit',
        'Confidence',
        'Summary',
        'Source refs',
        'Rationale',
        'Applies',
        'Avoids',
        'Scope expected',
        'Scope avoided',
        'Questions open: 0',
        'Question Q-complete',
        'Recommended:',
        'Options:',
        'Evidence',
      ]) {
        expect(en.terminal).toContain(section);
      }
      for (const section of [
        '구현 Brief',
        '명시적',
        '신뢰도',
        '요약',
        'Source 참조',
        '근거',
        '적용 대상',
        '피할 범위',
        '예상 범위',
        '제외 범위',
        '열린 질문: 0',
        '질문 Q-complete',
        '추천:',
        '선택지:',
      ]) {
        expect(ko.terminal).toContain(section);
      }
      expect(ko.renderedMarkdown).toBe(en.renderedMarkdown);
    } finally {
      await removeTempWorkspace(enWorkspace);
      await removeTempWorkspace(koWorkspace);
    }
  }, 20_000);

  it('covers doctor, rebuild, remember, and legacy invariance matrices', async () => {
    workspace = await createTempWorkspace('v2-phase2c-doctor-');
    configHome = await createTempWorkspace('v2-phase2c-doctor-config-');
    const env = { SDUCK_CONFIG_HOME: configHome };
    await runCli(['config', 'locale', 'ko'], { cliRoot, cwd: workspace, env });
    await runCli(['init', '--no-agent-rules'], { cliRoot, cwd: workspace, env });
    expect((await runCli(['remember'], { cliRoot, cwd: workspace, env })).stderr).toContain(
      '기억할 decision record',
    );
    expect((await runCli(['rebuild'], { cliRoot, cwd: workspace, env })).stdout).toContain(
      '재빌드',
    );
    expect((await runCli(['doctor'], { cliRoot, cwd: workspace, env })).stdout).toContain('정상');
    await runCli(['work', 'doctor stale'], { cliRoot, cwd: workspace, env });
    const taskId = (
      JSON.parse((await runCli(['status', '--json'], { cliRoot, cwd: workspace, env })).stdout) as {
        task: { id: string };
      }
    ).task.id;
    await runCli(['grill-me'], { cliRoot, cwd: workspace, env });
    await runCli(['submit', '--stdin'], {
      cliRoot,
      cwd: workspace,
      env,
      stdin: JSON.stringify({
        schemaVersion: 'v2alpha1',
        taskId,
        decisions: [{ id: 'DEC-doctor', title: 'Doctor', kind: 'EXPLICIT', summary: 'Stale.' }],
      }),
    });
    await runCli(['remember'], { cliRoot, cwd: workspace, env });
    await rm(join(workspace, '.decision', 'db.sqlite'));
    const stale = await runCli(['doctor'], { cliRoot, cwd: workspace, env });
    expect(`${stale.stdout}\n${stale.stderr}`).toContain('CACHE_STALE');
    const staleRepair = await runCli(['doctor', '--repair'], { cliRoot, cwd: workspace, env });
    expect(staleRepair.stdout).toContain('로컬 SQLite cache를 재빌드했습니다');
    await writeFile(
      join(workspace, '.decision', 'exports', 'markdown', 'tasks', 'bad.md'),
      '---\nstatus: [\n---\n',
    );
    const malformed = await runCli(['doctor'], { cliRoot, cwd: workspace, env });
    expect(`${malformed.stdout}\n${malformed.stderr}`).toContain('MALFORMED_SOURCE');
    expect(`${malformed.stdout}\n${malformed.stderr}`).toContain('bad.md');

    const dbOnlyWorkspace = await createTempWorkspace('v2-phase2c-db-only-');
    try {
      await runCli(['init', '--no-agent-rules'], { cliRoot, cwd: dbOnlyWorkspace, env });
      await runCli(['work', 'db only'], { cliRoot, cwd: dbOnlyWorkspace, env });
      await rm(join(dbOnlyWorkspace, '.decision', 'exports', 'markdown'), {
        force: true,
        recursive: true,
      });
      const db = openDatabase(dbOnlyWorkspace);
      db.prepare(`DELETE FROM cache_metadata WHERE key = 'source_fingerprint'`).run();
      db.close();
      const dbOnly = await runCli(['doctor'], { cliRoot, cwd: dbOnlyWorkspace, env });
      expect(`${dbOnly.stdout}\n${dbOnly.stderr}`).toContain('DB_ONLY');
      const dbOnlyRebuild = await runCli(['rebuild'], { cliRoot, cwd: dbOnlyWorkspace, env });
      expect(dbOnlyRebuild.exitCode).toBe(1);
      expect(dbOnlyRebuild.stderr).toContain('Markdown source 파일이 없습니다');
      const dbOnlyRepair = await runCli(['doctor', '--repair'], {
        cliRoot,
        cwd: dbOnlyWorkspace,
        env,
      });
      expect(dbOnlyRepair.stdout).toContain(
        'DB-only cache를 canonical Markdown source로 마이그레이션',
      );
    } finally {
      await removeTempWorkspace(dbOnlyWorkspace);
    }

    const journalWorkspace = await createTempWorkspace('v2-phase2c-journal-');
    try {
      await runCli(['init', '--no-agent-rules'], { cliRoot, cwd: journalWorkspace, env });
      await writeFile(join(journalWorkspace, '.decision', '.commit-bad.json'), '{ bad json');
      const journal = await runCli(['doctor'], { cliRoot, cwd: journalWorkspace, env });
      expect(`${journal.stdout}\n${journal.stderr}`).toContain(
        'INTERRUPTED_JOURNAL_RECOVERY_FAILED',
      );
      expect(`${journal.stdout}\n${journal.stderr}`).toContain('Expected property name');
      expect(`${journal.stdout}\n${journal.stderr}`).toContain('journal과 rollback 디렉터리');
    } finally {
      await removeTempWorkspace(journalWorkspace);
    }

    const legacyEnv = { SDUCK_CONFIG_HOME: configHome };
    await runCli(['config', 'locale', 'en'], { cliRoot, cwd: workspace, env: legacyEnv });
    const legacyCommands = [
      'start',
      'fast-track',
      'spec',
      'plan',
      'step',
      'review',
      'done',
      'use',
      'implement',
      'clean',
      'reopen',
      'archive',
      'update',
    ];
    const legacyHelpEn = new Map<string, string>();
    const legacyParserEn = new Map<string, string>();
    for (const command of legacyCommands) {
      const help = await runCli([command, '--help'], { cliRoot, cwd: workspace, env: legacyEnv });
      expect(help.exitCode, command).toBe(0);
      expect(help.stdout, command).toContain('Usage:');
      expect(help.stdout, command).not.toContain('사용법:');
      legacyHelpEn.set(command, help.stdout);
      const parser = await runCli([command, '--definitely-unknown-option'], {
        cliRoot,
        cwd: workspace,
        env: legacyEnv,
      });
      expect(parser.stderr, command).toContain(
        "error: unknown option '--definitely-unknown-option'",
      );
      legacyParserEn.set(command, parser.stderr);
    }
    const abandonHelpEn = await runCli(['abandon', 'TASK-target', '--help'], {
      cliRoot,
      cwd: workspace,
      env: legacyEnv,
    });
    await runCli(['config', 'locale', 'ko'], { cliRoot, cwd: workspace, env: legacyEnv });
    for (const command of legacyCommands) {
      const help = await runCli([command, '--help'], { cliRoot, cwd: workspace, env: legacyEnv });
      expect(help.stdout, command).toBe(legacyHelpEn.get(command));
      expect(help.stderr, command).toBe('');
      const parser = await runCli([command, '--definitely-unknown-option'], {
        cliRoot,
        cwd: workspace,
        env: legacyEnv,
      });
      expect(parser.stderr, command).toBe(legacyParserEn.get(command));
    }
    const abandonHelpKo = await runCli(['abandon', 'TASK-target', '--help'], {
      cliRoot,
      cwd: workspace,
      env: legacyEnv,
    });
    expect(abandonHelpKo.stdout).toBe(abandonHelpEn.stdout);
    await writeFile(join(configHome, 'config.json'), '{ bad json');
    for (const command of legacyCommands) {
      const help = await runCli([command, '--help'], { cliRoot, cwd: workspace, env: legacyEnv });
      expect(help.stdout, command).toBe(legacyHelpEn.get(command));
      expect(help.stderr, command).toBe('');
      const parser = await runCli([command, '--definitely-unknown-option'], {
        cliRoot,
        cwd: workspace,
        env: legacyEnv,
      });
      expect(parser.stderr, command).toBe(legacyParserEn.get(command));
    }
    expect(
      (await runCli(['help', 'start'], { cliRoot, cwd: workspace, env: legacyEnv })).stderr,
    ).toBe('');
    expect(
      (
        await runCli(['abandon', 'TASK-target', '--help'], {
          cliRoot,
          cwd: workspace,
          env: legacyEnv,
        })
      ).stderr,
    ).toBe('');
  }, 20_000);
});
