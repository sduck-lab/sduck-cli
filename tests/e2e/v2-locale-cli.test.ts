import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { createAgentCheckboxConfig, renderInitCommandData } from '../../src/commands/init.js';
import { getV2Messages } from '../../src/ui/v2/messages.js';
import { runCli } from '../helpers/run-cli.js';
import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';

describe('v2 localized CLI presentation', () => {
  const cliRoot = process.cwd();
  let workspace: string | null = null;
  let configHome: string | null = null;

  afterEach(async () => {
    if (workspace !== null) await removeTempWorkspace(workspace);
    if (configHome !== null) await removeTempWorkspace(configHome);
    workspace = null;
    configHome = null;
  });

  it('persists locale across processes outside the workspace and localizes v2 help/status', async () => {
    workspace = await createTempWorkspace('v2-locale-workspace-');
    configHome = await createTempWorkspace('v2-locale-config-');
    const env = { SDUCK_CONFIG_HOME: configHome };

    const set = await runCli(['config', 'locale', 'ko'], { cliRoot, cwd: workspace, env });
    expect(set.exitCode).toBe(0);
    expect(set.stdout).toContain('언어 설정: ko');
    expect(JSON.parse(await readFile(join(configHome, 'config.json'), 'utf8'))).toEqual({
      schemaVersion: 1,
      locale: 'ko',
    });

    const help = await runCli(['status', '--help'], { cliRoot, cwd: workspace, env });
    expect(help.stdout).toContain('현재 decision briefing 상태 표시');
    expect(help.stdout).toContain('사용법:');
    expect(help.stdout).toContain('옵션:');

    const initHelp = await runCli(['init', '--help'], { cliRoot, cwd: workspace, env });
    expect(initHelp.stdout).toContain('초기화합니다');
    expect(initHelp.stdout).toContain('옵션:');

    const rootHelp = await runCli(['--help'], { cliRoot, cwd: workspace, env });
    expect(rootHelp.stdout).toContain('사용법:');
    expect(rootHelp.stdout).toContain('명령:');
    expect(rootHelp.stdout).toContain('버전 번호 출력');

    const versionHelp = await runCli(['--version'], { cliRoot, cwd: workspace, env });
    expect(versionHelp.stdout.trim()).toMatch(/^\d+\.\d+\.\d+/);

    const status = await runCli(['status'], { cliRoot, cwd: workspace, env });
    expect(status.stdout).toContain('현재 decision task가 없습니다.');

    const invalid = await runCli(['config', 'locale', 'fr'], { cliRoot, cwd: workspace, env });
    expect(invalid.exitCode).toBe(1);
    expect(invalid.stderr).toContain('지원하지 않는 locale: fr');

    const unknown = await runCli(['no-such-command'], { cliRoot, cwd: workspace, env });
    expect(unknown.exitCode).toBe(1);
    expect(unknown.stderr).toContain('알 수 없는 명령');

    const unknownOption = await runCli(['status', '--bogus'], { cliRoot, cwd: workspace, env });
    expect(unknownOption.exitCode).toBe(1);
    expect(unknownOption.stderr).toContain('알 수 없는 옵션');

    const missingOptionValue = await runCli(['trace', '--base'], { cliRoot, cwd: workspace, env });
    expect(missingOptionValue.exitCode).toBe(1);
    expect(missingOptionValue.stderr).toContain("옵션 '--base <ref>' 인자가 누락되었습니다");
  }, 15_000);

  it('keeps English as the default for root and v2 Commander surfaces', async () => {
    workspace = await createTempWorkspace('v2-locale-default-en-');

    const rootHelp = await runCli(['--help'], { cliRoot, cwd: workspace });
    expect(rootHelp.stdout).toContain('Usage:');
    expect(rootHelp.stdout).toContain('output the version number');

    const statusHelp = await runCli(['status', '--help'], { cliRoot, cwd: workspace });
    expect(statusHelp.stdout).toContain('Show current decision briefing status');

    const missingOptionValue = await runCli(['trace', '--base'], { cliRoot, cwd: workspace });
    expect(missingOptionValue.stderr).toContain("error: option '--base <ref>' argument missing");
  });

  it('localizes workflow status and disabled work errors', async () => {
    workspace = await createTempWorkspace('v2-locale-workflow-');
    configHome = await createTempWorkspace('v2-locale-workflow-config-');
    const env = { SDUCK_CONFIG_HOME: configHome };
    await runCli(['config', 'locale', 'ko'], { cliRoot, cwd: workspace, env });

    const statusBeforeInit = await runCli(['workflow', 'status', '--json'], {
      cliRoot,
      cwd: workspace,
      env,
    });
    expect(JSON.parse(statusBeforeInit.stdout) as unknown).toMatchObject({
      enabled: true,
      initialized: false,
    });

    const disable = await runCli(['workflow', 'disable'], { cliRoot, cwd: workspace, env });
    expect(disable.stdout).toContain('Workflow를 비활성화했습니다.');

    const status = await runCli(['workflow', 'status'], { cliRoot, cwd: workspace, env });
    expect(status.stdout).toContain('Workflow: 비활성화됨');

    const blocked = await runCli(['work', 'blocked'], { cliRoot, cwd: workspace, env });
    expect(blocked.exitCode).toBe(1);
    expect(blocked.stderr).toContain('Decision workflow가 비활성화되어 있습니다');
    expect(blocked.stderr).toContain('sduck workflow enable');

    const enable = await runCli(['workflow', 'enable', '--json'], { cliRoot, cwd: workspace, env });
    expect(JSON.parse(enable.stdout) as unknown).toMatchObject({
      enabled: true,
      initialized: true,
    });
  });

  it('renders structured Korean init output without string replacement', async () => {
    workspace = await createTempWorkspace('v2-locale-init-');
    configHome = await createTempWorkspace('v2-locale-init-config-');
    const env = { SDUCK_CONFIG_HOME: configHome };
    await runCli(['config', 'locale', 'ko'], { cliRoot, cwd: workspace, env });

    const init = await runCli(['init', '--no-agent-rules'], { cliRoot, cwd: workspace, env });

    expect(init.exitCode).toBe(0);
    expect(init.stdout).toContain('sduck init 완료.');
    expect(init.stdout).toContain('| 상태');
    expect(init.stdout).toContain('| 경로');
    expect(init.stdout).toContain('Decision workspace가 초기화되었습니다.');
  });

  it('renders Korean init expected errors and warnings from structured data', async () => {
    workspace = await createTempWorkspace('v2-locale-init-warnings-');
    configHome = await createTempWorkspace('v2-locale-init-warnings-config-');
    const env = { SDUCK_CONFIG_HOME: configHome };
    await runCli(['config', 'locale', 'ko'], { cliRoot, cwd: workspace, env });

    const invalidAgent = await runCli(['init', '--agents', 'nope'], {
      cliRoot,
      cwd: workspace,
      env,
    });
    expect(invalidAgent.exitCode).toBe(1);
    expect(invalidAgent.stderr).toContain('지원하지 않는 agent: nope');
    expect(invalidAgent.stderr).not.toContain('Unsupported agent');

    await mkdir(join(workspace, '.sduck', 'sduck-assets', 'types'), { recursive: true });
    await writeFile(join(workspace, '.sduck', 'sduck-assets', 'types', 'feature.md'), 'custom');
    await mkdir(join(workspace, '.gitignore'));
    const warned = await runCli(['init', '--no-agent-rules'], { cliRoot, cwd: workspace, env });
    expect(warned.exitCode).toBe(0);
    expect(warned.stdout).toContain('기존 asset 유지: .sduck/sduck-assets/types/feature.md');
    expect(warned.stdout).toContain('.gitignore 업데이트 실패. 다음 항목을 직접 추가하세요');
    expect(warned.stdout).toContain('.decision/db.sqlite');
    expect(warned.stdout).toContain('bundled assets를 재생성할 수 있습니다');
    expect(warned.stdout).not.toContain('Kept existing asset');
    expect(warned.stdout).not.toContain('Failed to update .gitignore');
    expect(warned.stdout).not.toContain('Run `sduck init --force`');
  });

  it('renders mixed structured and unstructured init warnings without dropping either', () => {
    const rendered = renderInitCommandData(
      {
        projectRoot: workspace ?? process.cwd(),
        didChange: false,
        decisionWorkspace: { created: [], existing: [] },
        agents: [],
        summary: {
          rows: [],
          warnings: [
            'Failed to update .gitignore. Please add the following entries manually:\n.decision/db.sqlite',
            'Legacy warning from an older extension.',
          ],
          structuredWarnings: [
            {
              code: 'gitignore-update-failed',
              path: '.gitignore',
              detail: '.decision/db.sqlite',
            },
          ],
        },
      },
      getV2Messages('en'),
    );

    expect(rendered).toContain(
      'Failed to update .gitignore. Please add the following entries manually:\n.decision/db.sqlite',
    );
    expect(rendered).toContain('Legacy warning from an older extension.');
  });

  it('localizes Korean init prompt configuration without changing validation semantics', () => {
    const config = createAgentCheckboxConfig(getV2Messages('ko'));

    expect(config.message).toContain('AI agent를 선택하세요');
    expect(config.instructions).toContain('space로 선택');
    expect(config.validate([])).toContain('하나 이상의 agent를 선택하세요');
    expect(config.validate([{ value: 'codex' }])).toBe(true);
  });

  it('keeps generated init artifacts identical under English and Korean locale', async () => {
    workspace = await createTempWorkspace('v2-locale-artifacts-en-');
    const koWorkspace = await createTempWorkspace('v2-locale-artifacts-ko-');
    configHome = await createTempWorkspace('v2-locale-artifacts-config-');
    try {
      const env = { SDUCK_CONFIG_HOME: configHome };
      await runCli(['init', '--no-agent-rules'], { cliRoot, cwd: workspace, env });
      await runCli(['config', 'locale', 'ko'], { cliRoot, cwd: koWorkspace, env });
      await runCli(['init', '--no-agent-rules'], { cliRoot, cwd: koWorkspace, env });

      const relativePath = join('.sduck', 'sduck-assets', 'types', 'feature.md');
      expect(await readFile(join(koWorkspace, relativePath), 'utf8')).toBe(
        await readFile(join(workspace, relativePath), 'utf8'),
      );
      expect(await readFile(join(koWorkspace, '.gitignore'), 'utf8')).toBe(
        await readFile(join(workspace, '.gitignore'), 'utf8'),
      );
    } finally {
      await removeTempWorkspace(koWorkspace);
    }
  });

  it('directs context to grill-me before submit for required tasks', async () => {
    workspace = await createTempWorkspace('v2-locale-context-next-');
    configHome = await createTempWorkspace('v2-locale-context-config-');
    const env = { SDUCK_CONFIG_HOME: configHome };

    await runCli(['config', 'locale', 'ko'], { cliRoot, cwd: workspace, env });
    await runCli(['init', '--no-agent-rules'], { cliRoot, cwd: workspace, env });
    await runCli(['work', 'context next'], { cliRoot, cwd: workspace, env });
    const context = await runCli(['context'], { cliRoot, cwd: workspace, env });

    expect(context.stdout).toContain('다음: sduck grill complete --reason');
    expect(context.stdout).not.toContain('다음: sduck submit --stdin');
  }, 10_000);

  it('renders representative Korean v2 typed errors and localized structured outputs', async () => {
    workspace = await createTempWorkspace('v2-locale-phase2b-');
    configHome = await createTempWorkspace('v2-locale-phase2b-config-');
    const env = { SDUCK_CONFIG_HOME: configHome };
    await runCli(['config', 'locale', 'ko'], { cliRoot, cwd: workspace, env });
    execFileSync('git', ['init'], { cwd: workspace });
    await writeFile(join(workspace, 'ko.ts'), 'export const ko = 1;\n');
    execFileSync('git', ['add', 'ko.ts'], { cwd: workspace });
    execFileSync(
      'git',
      ['-c', 'user.name=t', '-c', 'user.email=t@example.com', 'commit', '-m', 'init'],
      { cwd: workspace },
    );

    const noCurrentRemember = await runCli(['remember'], { cliRoot, cwd: workspace, env });
    expect(noCurrentRemember.exitCode).toBe(1);
    expect(noCurrentRemember.stderr).toContain('기억할 decision record가 없습니다');
    expect(noCurrentRemember.stderr).not.toContain('No decision records to remember');

    await runCli(['init', '--no-agent-rules'], { cliRoot, cwd: workspace, env });
    await runCli(['work', 'phase 2b locale'], { cliRoot, cwd: workspace, env });

    const noMatch = await runCli(['context', 'add', 'missing-file.ts'], {
      cliRoot,
      cwd: workspace,
      env,
    });
    expect(noMatch.exitCode).toBe(1);
    expect(noMatch.stderr).toContain('일치하는 파일이 없습니다: missing-file.ts');
    expect(noMatch.stderr).not.toContain('No matching files');

    const badDraft = await runCli(['submit', '--stdin'], {
      cliRoot,
      cwd: workspace,
      env,
      stdin: JSON.stringify({
        schemaVersion: 'v2alpha1',
        decisions: [{ title: 'Bad', kind: 'WRONG', summary: 'Bad.' }],
      }),
    });
    expect(badDraft.exitCode).toBe(1);
    expect(badDraft.stderr).toContain('잘못된 decision kind: WRONG');
    expect(badDraft.stderr).not.toContain('Invalid decision kind');

    const context = await runCli(['context'], { cliRoot, cwd: workspace, env });
    expect(context.stdout).toContain('다음: sduck grill complete --reason');
    expect(context.stdout).not.toContain('다음: sduck submit --stdin');

    const grillDone = await runCli(['grill', 'complete', '--reason', 'Locale ready'], {
      cliRoot,
      cwd: workspace,
      env,
    });
    expect(grillDone.stdout).toContain('Grill을 완료했습니다.');
    const status = await runCli(['status', '--json'], { cliRoot, cwd: workspace, env });
    const taskId = (JSON.parse(status.stdout) as { task: { id: string } }).task.id;
    const draft = JSON.stringify({
      schemaVersion: 'v2alpha1',
      taskId,
      implementationPlan: ['Keep locale data stable.'],
      verificationPlan: ['Verify Korean rendering.'],
      decisions: [
        { id: 'DEC-ko', title: 'Korean parity', kind: 'EXPLICIT', summary: 'Same data.' },
      ],
      questions: [{ id: 'Q-ko', text: '옵션?', recommendedAnswer: 'A', options: ['A'] }],
    });
    await runCli(['submit', '--stdin'], { cliRoot, cwd: workspace, env, stdin: draft });
    const badAnswer = await runCli(['answer', 'Q-ko', '--option', '2'], {
      cliRoot,
      cwd: workspace,
      env,
    });
    expect(badAnswer.exitCode).toBe(1);
    expect(badAnswer.stderr).toContain('옵션 번호 범위를 벗어났습니다: 2');

    await runCli(['answer', 'Q-ko', '--option', '1'], { cliRoot, cwd: workspace, env });
    const briefKo = await runCli(['brief'], { cliRoot, cwd: workspace, env });
    expect(briefKo.stdout).toContain('구현 Brief');
    expect(briefKo.stdout).toContain('DEC-ko');
    expect(briefKo.stdout).toContain('Q-ko');
    expect(briefKo.stdout).not.toContain('Implementation Brief');
    await runCli(['confirm'], { cliRoot, cwd: workspace, env });
    const graph = await runCli(['graph', 'show', taskId], { cliRoot, cwd: workspace, env });
    expect(graph.stdout).toContain(`${taskId} Graph`);
    expect(graph.stdout).toContain('잘림: false');
    expect(graph.stdout).toContain('노드:');
    expect(graph.stdout).toContain('엣지:');
    await writeFile(join(workspace, 'ko.ts'), 'export const ko = 2;\n');
    const traceKo = await runCli(['trace', '--base', 'HEAD'], { cliRoot, cwd: workspace, env });
    expect(traceKo, `${traceKo.stdout}\n${traceKo.stderr}`).toMatchObject({ exitCode: 0 });
    const statusAfterTrace = await runCli(['status'], { cliRoot, cwd: workspace, env });
    expect(statusAfterTrace.stdout).toContain('다음: sduck evaluate');
    const evalKo = await runCli(['evaluate', '--check', 'locale=passed'], {
      cliRoot,
      cwd: workspace,
      env,
    });
    expect(evalKo.stdout).toContain('Evaluation을 기록했습니다.');
    expect(evalKo.stdout).toContain('Evaluation:');

    const remember = await runCli(['remember'], { cliRoot, cwd: workspace, env });
    expect(remember.stdout).toContain('메모리를 export했습니다.');
    expect(remember.stdout).toContain('다음: sduck recall');

    const rebuild = await runCli(['rebuild'], { cliRoot, cwd: workspace, env });
    expect(rebuild.stdout).toContain('Decision cache를 재빌드했습니다.');
    expect(rebuild.stdout).toContain('질문: 1');

    const doctor = await runCli(['doctor'], { cliRoot, cwd: workspace, env });
    expect(doctor.stdout).toContain('Decision workspace가 정상입니다.');

    const canonical = await readFile(
      join(workspace, '.decision', 'exports', 'markdown', 'tasks', `${taskId}.md`),
      'utf8',
    );
    expect(canonical).toContain('Implementation Brief');
    expect(canonical).not.toContain('구현 Brief');
  }, 40_000);

  it('localizes corrected v2 validation failures without English expected prose', async () => {
    workspace = await createTempWorkspace('v2-locale-validation-');
    configHome = await createTempWorkspace('v2-locale-validation-config-');
    const env = { SDUCK_CONFIG_HOME: configHome };
    await runCli(['config', 'locale', 'ko'], { cliRoot, cwd: workspace, env });
    await runCli(['init', '--no-agent-rules'], { cliRoot, cwd: workspace, env });
    await runCli(['work', 'validation errors'], { cliRoot, cwd: workspace, env });

    const malformedDraft = await runCli(['submit', '--stdin'], {
      cliRoot,
      cwd: workspace,
      env,
      stdin: '{ bad json',
    });
    expect(malformedDraft.exitCode).toBe(1);
    expect(malformedDraft.stderr).toContain('Draft JSON 형식이 잘못되었습니다');

    await writeFile(join(workspace, '.decision', 'policy.json'), '{ bad json');
    const badPolicy = await runCli(['work', 'bad policy'], { cliRoot, cwd: workspace, env });
    expect(badPolicy.exitCode).toBe(1);
    expect(badPolicy.stderr).toContain('.decision/policy.json JSON 형식이 잘못되었습니다');

    await writeFile(
      join(workspace, '.decision', 'policy.json'),
      JSON.stringify({ schemaVersion: 'v2alpha1', requireGrillMe: true }),
    );
    await writeFile(join(workspace, '.decision', 'state.json'), '{ bad json');
    const badState = await runCli(['status'], { cliRoot, cwd: workspace, env });
    expect(badState.exitCode).toBe(1);
    expect(badState.stderr).toContain('.decision/state.json JSON 형식이 잘못되었습니다');

    await writeFile(
      join(workspace, '.decision', 'state.json'),
      JSON.stringify({ currentTaskId: null, updatedAt: new Date().toISOString() }),
    );
    await writeFile(
      join(workspace, '.decision', 'exports', 'markdown', 'tasks', 'bad.md'),
      '---\nnot: [valid\n---\n# Bad\n',
    );
    const badSource = await runCli(['doctor'], { cliRoot, cwd: workspace, env });
    expect(badSource.exitCode).toBe(1);
    const badSourceOutput = `${badSource.stdout}\n${badSource.stderr}`;
    expect(badSourceOutput).toContain('잘못된 source 파일을 수정한 뒤');
    expect(badSourceOutput).not.toContain('must be');
    expect(badSourceOutput).not.toContain('missing task');
  }, 10_000);

  it('keeps JSON output locale-neutral while warnings go to stderr', async () => {
    workspace = await createTempWorkspace('v2-locale-json-');
    configHome = await createTempWorkspace('v2-locale-bad-config-');
    await writeFile(join(configHome, 'config.json'), '{ bad json');
    const env = { SDUCK_CONFIG_HOME: configHome };

    const enStatus = await runCli(['status', '--json'], { cliRoot, cwd: workspace });
    const badStatus = await runCli(['status', '--json'], { cliRoot, cwd: workspace, env });

    expect(JSON.parse(badStatus.stdout)).toEqual(JSON.parse(enStatus.stdout));
    expect(badStatus.stderr).toContain('Ignoring malformed sduck config');
  });

  it('keeps canonical brief snapshots locale-neutral', async () => {
    workspace = await createTempWorkspace('v2-locale-canonical-');
    configHome = await createTempWorkspace('v2-locale-canonical-config-');
    const env = { SDUCK_CONFIG_HOME: configHome };

    await runCli(['init', '--no-agent-rules'], { cliRoot, cwd: workspace, env });
    await runCli(['work', 'locale canonical'], { cliRoot, cwd: workspace, env });
    await runCli(['grill', 'complete', '--reason', 'Canonical ready'], {
      cliRoot,
      cwd: workspace,
      env,
    });
    const status = await runCli(['status', '--json'], { cliRoot, cwd: workspace, env });
    const taskId = (JSON.parse(status.stdout) as { task: { id: string } }).task.id;
    const draft = JSON.stringify({
      schemaVersion: 'v2alpha1',
      taskId,
      implementationPlan: ['Keep canonical brief English.'],
      verificationPlan: ['Confirm under Korean locale.'],
      decisions: [
        {
          id: 'DEC-locale',
          title: 'Locale neutral',
          kind: 'EXPLICIT',
          summary: 'Canonical English.',
        },
      ],
    });
    await runCli(['submit', '--stdin'], { cliRoot, cwd: workspace, env, stdin: draft });
    await runCli(['config', 'locale', 'ko'], { cliRoot, cwd: workspace, env });
    const confirm = await runCli(['confirm'], { cliRoot, cwd: workspace, env });
    expect(confirm.stdout).toContain('구현 brief를 확정했습니다.');
    const taskSource = await readFile(
      join(workspace, '.decision', 'exports', 'markdown', 'tasks', `${taskId}.md`),
      'utf8',
    );
    expect(taskSource).toContain('Implementation Brief');
    expect(taskSource).not.toContain('구현 Brief');
  });

  it('keeps representative legacy command output identical across locale preferences', async () => {
    workspace = await createTempWorkspace('v2-locale-v1-');
    configHome = await createTempWorkspace('v2-locale-v1-config-');
    await mkdir(configHome, { recursive: true });
    const env = { SDUCK_CONFIG_HOME: configHome };

    const en = await runCli(['start', 'feature', 'same-output', '--help'], {
      cliRoot,
      cwd: workspace,
      env,
    });
    await runCli(['config', 'locale', 'ko'], { cliRoot, cwd: workspace, env });
    const ko = await runCli(['start', 'feature', 'same-output', '--help'], {
      cliRoot,
      cwd: workspace,
      env,
    });

    expect(ko.stdout).toBe(en.stdout);
    expect(ko.stderr).toBe(en.stderr);
  });

  it('keeps targeted abandon as an unlocalized legacy route under stored locales', async () => {
    const enWorkspace = await createTempWorkspace('v2-locale-abandon-en-');
    const koWorkspace = await createTempWorkspace('v2-locale-abandon-ko-');
    configHome = await createTempWorkspace('v2-locale-abandon-config-');
    try {
      const env = { SDUCK_CONFIG_HOME: configHome };
      const target = 'TASK-20260714-feature-abandon-same';
      await runCli(['start', 'feature', 'abandon-same', '--no-git'], {
        cliRoot,
        cwd: enWorkspace,
        env,
      });
      const enHelp = await runCli(['abandon', target, '--help'], {
        cliRoot,
        cwd: enWorkspace,
        env,
      });
      const enParserError = await runCli(['abandon', target, 'extra'], {
        cliRoot,
        cwd: enWorkspace,
        env,
      });
      const enSuccess = await runCli(['abandon', target], { cliRoot, cwd: enWorkspace, env });

      await runCli(['config', 'locale', 'ko'], { cliRoot, cwd: koWorkspace, env });
      await runCli(['start', 'feature', 'abandon-same', '--no-git'], {
        cliRoot,
        cwd: koWorkspace,
        env,
      });
      const koHelp = await runCli(['abandon', target, '--help'], {
        cliRoot,
        cwd: koWorkspace,
        env,
      });
      const koParserError = await runCli(['abandon', target, 'extra'], {
        cliRoot,
        cwd: koWorkspace,
        env,
      });
      const koSuccess = await runCli(['abandon', target], { cliRoot, cwd: koWorkspace, env });

      expect(koHelp.stdout).toBe(enHelp.stdout);
      expect(koHelp.stderr).toBe(enHelp.stderr);
      expect(koHelp.stdout).toContain('Usage:');
      expect(koHelp.stdout).toContain(
        'Abandon the current decision task, or a legacy SDD task when a target is given',
      );
      expect(koHelp.stdout).not.toContain('Legacy SDD: abandon an SDD task');
      expect(koHelp.stdout).not.toContain('사용법:');
      expect(koParserError.stderr).toBe(enParserError.stderr);
      expect(koParserError.stderr).toContain('error: too many arguments');
      expect(koSuccess.stdout).toBe(enSuccess.stdout);
    } finally {
      await removeTempWorkspace(enWorkspace);
      await removeTempWorkspace(koWorkspace);
    }
  }, 10_000);

  it('does not print malformed-config warnings for legacy commands', async () => {
    workspace = await createTempWorkspace('v2-locale-v1-warning-');
    configHome = await createTempWorkspace('v2-locale-v1-warning-config-');
    await writeFile(join(configHome, 'config.json'), '{ bad json');
    const env = { SDUCK_CONFIG_HOME: configHome };

    const legacy = await runCli(['start', '--help'], { cliRoot, cwd: workspace, env });
    const legacyHelpCommand = await runCli(['help', 'start'], { cliRoot, cwd: workspace, env });
    const legacyHelpError = await runCli(['help', 'start', 'extra'], {
      cliRoot,
      cwd: workspace,
      env,
    });
    const targetedAbandonHelp = await runCli(['abandon', 'TASK-does-not-matter', '--help'], {
      cliRoot,
      cwd: workspace,
      env,
    });
    const v2 = await runCli(['status'], { cliRoot, cwd: workspace, env });

    expect(legacy.stderr).toBe('');
    expect(legacyHelpCommand.stderr).toBe('');
    expect(legacyHelpError.stderr).not.toContain('Ignoring malformed sduck config');
    expect(targetedAbandonHelp.stderr).toBe('');
    expect(legacyHelpCommand.stdout).toContain('Usage:');
    expect(legacyHelpCommand.stdout).not.toContain('사용법:');
    expect(targetedAbandonHelp.stdout).toContain('Usage:');
    expect(targetedAbandonHelp.stdout).not.toContain('사용법:');
    expect(v2.stderr).toContain('Ignoring malformed sduck config');
  });
});
