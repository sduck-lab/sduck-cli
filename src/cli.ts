#!/usr/bin/env node

import { Command, InvalidArgumentError } from 'commander';

import { runAbandonCommand as runSddAbandonCommand } from './commands/abandon.js';
import { runArchiveCommand } from './commands/archive.js';
import { runCleanCommand } from './commands/clean.js';
import { runDoneCommand } from './commands/done.js';
import { runFastTrackCommand } from './commands/fast-track.js';
import { runImplementCommand } from './commands/implement.js';
import { runInitCommand as runSddInitCommand } from './commands/init.js';
import { runPlanApproveCommand } from './commands/plan-approve.js';
import { runReopenCommand } from './commands/reopen.js';
import { runReviewReadyCommand } from './commands/review.js';
import { runSpecApproveCommand } from './commands/spec-approve.js';
import { runStartCommand } from './commands/start.js';
import { runStepCommand } from './commands/step.js';
import { runUpdateCommand } from './commands/update.js';
import { runUseCommand } from './commands/use.js';
import { isV2CommandError, V2CommandError } from './commands/v2/errors.js';
import {
  readStdinIfRequested,
  createV2Runtime,
  runAbandonCommand as runV2AbandonCommand,
  runAnswerCommand,
  runAskCommand,
  runBriefCommand,
  runCloseCommand,
  runConfirmCommand,
  runContextAddCommand,
  runContextCommand,
  runConfigLocaleCommand,
  runDoctorCommand,
  runEvaluateCommand,
  runGraphShowCommand,
  runGrillCompleteCommand,
  runGrillMeCommand,
  runRecallCommand,
  runRebuildCommand,
  runRememberCommand,
  runRetrospectiveCaptureCommand,
  runResumeCommand,
  runStatusCommand,
  runSubmitCommand,
  runTraceCommand,
  runWorkflowDisableCommand,
  runWorkflowEnableCommand,
  runWorkflowStatusCommand,
  runWorkCommand,
  renderConfigWarning,
  renderV2CommandError,
} from './commands/v2/index.js';
import { CLI_DESCRIPTION, CLI_NAME, CLI_VERSION } from './core/command-metadata.js';

const program = new Command();
const v2Runtime = createV2Runtime();
const rawRoute = classifyRawRoute(process.argv);

if (v2Runtime.configWarning !== undefined && shouldRenderV2ConfigWarning(process.argv)) {
  console.error(renderConfigWarning(v2Runtime.configWarning, v2Runtime.messages));
}

program
  .name(CLI_NAME)
  .description(
    v2Runtime.locale === 'ko' ? 'AI 코딩 에이전트를 위한 decision briefing 도구' : CLI_DESCRIPTION,
  )
  .version(CLI_VERSION, '-V, --version', v2Runtime.messages.commander.versionOption);

function parseInteger(value: string, label: string, minimum: number): number {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < minimum) {
    throw new InvalidArgumentError(
      `${label} must be an integer greater than or equal to ${String(minimum)}.`,
    );
  }

  return parsedValue;
}

function parseRecordDepth(value: string): 'FULL' | 'LIGHTWEIGHT' {
  if (value === 'FULL' || value === 'LIGHTWEIGHT') return value;
  throw new InvalidArgumentError('--record-depth must be FULL or LIGHTWEIGHT.');
}

function toStartOptions(options: { git?: boolean }): { noGit?: boolean } | undefined {
  return options.git === false ? { noGit: true } : undefined;
}

function withOptionalTarget(target: string | undefined): { target?: string } {
  return target === undefined ? {} : { target };
}

function withOptionalKeep(keep: number | undefined): { keep?: number } {
  return keep === undefined ? {} : { keep };
}

function toInitOptions(options: { agentRules?: boolean; agents?: string; force?: boolean }): {
  agentRules?: boolean;
  agents?: string;
  force: boolean;
} {
  return {
    force: options.force === true,
    ...(options.agentRules === undefined ? {} : { agentRules: options.agentRules }),
    ...(options.agents === undefined ? {} : { agents: options.agents }),
  };
}

function printResult(result: { stdout: string; stderr: string; exitCode: number }): void {
  if (result.stdout !== '') console.log(result.stdout);
  if (result.stderr !== '') console.error(result.stderr);
  if (result.exitCode !== 0) process.exitCode = result.exitCode;
}

function v2Text(en: string, ko: string): string {
  return v2Runtime.locale === 'ko' ? ko : en;
}

function shouldRenderV2ConfigWarning(argv: string[]): boolean {
  const command = argv.slice(2).find((arg) => !arg.startsWith('-'));
  if (command === undefined) return true;
  const route = classifyRawRoute(argv);
  if (route === 'legacy-help' || route === 'targeted-abandon') return false;
  if (command === 'abandon') return true;
  return !new Set([
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
  ]).has(command);
}

function getCommandArgs(argv: string[], command: string): string[] {
  const commandIndex = argv.indexOf(command);
  return commandIndex === -1 ? [] : argv.slice(commandIndex + 1);
}

function hasAbandonTarget(argv: string[]): boolean {
  const args = getCommandArgs(argv, 'abandon');
  for (const [index, arg] of args.entries()) {
    if (arg === '--') return args.slice(args.indexOf(arg) + 1).length > 0;
    if (arg === '--help' || arg === '-h') continue;
    if (arg.startsWith('--')) continue;
    if (arg.startsWith('-')) continue;
    if (index > 0 && args[index - 1]?.startsWith('--') === true && args[index - 1] !== '--help') {
      return true;
    }
    return true;
  }
  return false;
}

function classifyRawRoute(argv: string[]): 'targeted-abandon' | 'legacy-help' | 'other' {
  if (isLegacyHelpRoute(argv)) return 'legacy-help';
  if (argv.slice(2).includes('abandon') && hasAbandonTarget(argv)) return 'targeted-abandon';
  return 'other';
}

function isLegacyHelpRoute(argv: string[]): boolean {
  if (argv[2] !== 'help') return false;
  const target = argv[3];
  return target !== undefined && isLegacyCommandName(target);
}

function isLegacyCommandName(command: string): boolean {
  return new Set([
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
  ]).has(command);
}

function localizeCommanderError(text: string): string {
  const unknownCommand = /^error: unknown command '([^']+)'/.exec(text);
  if (unknownCommand?.[1] !== undefined) {
    return `${v2Runtime.messages.commander.unknownCommand(unknownCommand[1])}\n`;
  }
  const unknownOption = /^error: unknown option '([^']+)'/.exec(text);
  if (unknownOption?.[1] !== undefined) {
    return `${v2Runtime.messages.commander.unknownOption(unknownOption[1])}\n`;
  }
  const missingArgument = /^error: missing required argument '([^']+)'/.exec(text);
  if (missingArgument?.[1] !== undefined) {
    return `${v2Runtime.messages.commander.missingArgument(missingArgument[1])}\n`;
  }
  const missingOptionValue = /^error: option '([^']+)' argument missing/.exec(text);
  if (missingOptionValue?.[1] !== undefined) {
    return `${v2Runtime.messages.commander.missingOptionValue(missingOptionValue[1])}\n`;
  }
  if (text.startsWith('error: too many arguments')) {
    return `${v2Runtime.messages.commander.tooManyArguments}\n`;
  }
  return text;
}

function applyLocalizedCommander(command: Command): void {
  if (v2Runtime.locale !== 'ko') return;
  command
    .configureHelp({
      styleTitle: (title: string) => {
        const mapped: Record<string, string> = {
          'Usage:': v2Runtime.messages.commander.usage,
          'Arguments:': v2Runtime.messages.commander.arguments,
          'Options:': v2Runtime.messages.commander.options,
          'Global Options:': v2Runtime.messages.commander.globalOptions,
          'Commands:': v2Runtime.messages.commander.commands,
        };
        return mapped[title] ?? title;
      },
    })
    .helpOption('-h, --help', v2Runtime.messages.commander.help)
    .configureOutput({
      outputError: (str, write) => {
        write(localizeCommanderError(str));
      },
    })
    .showHelpAfterError(v2Runtime.messages.commander.help);
}

function applyLocalizedCommanderToV2(): void {
  if (v2Runtime.locale !== 'ko' || rawRoute === 'legacy-help' || rawRoute === 'targeted-abandon') {
    return;
  }
  applyLocalizedCommander(program);
  program.helpCommand('help [command]', v2Runtime.messages.commander.helpCommand);
  for (const command of program.commands) {
    if (isLegacyCommandName(command.name())) continue;
    applyLocalizedCommander(command);
    for (const child of command.commands) applyLocalizedCommander(child);
  }
}

program
  .command('init')
  .description(
    v2Runtime.locale === 'ko'
      ? 'v2 .decision decision-briefing workspace, 호환 .sduck assets, agent rule 파일을 초기화합니다'
      : 'Initialize the v2 .decision decision-briefing workspace, compatibility .sduck assets, and agent rule files',
  )
  .option(
    '--agents <list>',
    v2Text(
      'Comma-separated agents: claude-code,codex,opencode,gemini-cli,cursor,antigravity',
      '쉼표로 구분한 agents: claude-code,codex,opencode,gemini-cli,cursor,antigravity',
    ),
  )
  .option(
    '--force',
    v2Text(
      'Overwrite bundled assets and managed rule blocks',
      '번들 assets와 managed rule 블록 덮어쓰기',
    ),
  )
  .option(
    '--no-agent-rules',
    v2Text('Skip managed agent rule installation', 'managed agent rule 설치 건너뛰기'),
  )
  .action(async (options: { agentRules?: boolean; agents?: string; force?: boolean }) => {
    printResult(await runSddInitCommand(toInitOptions(options), process.cwd(), v2Runtime.messages));
  });

const config = program
  .command('config')
  .description(
    v2Runtime.locale === 'ko'
      ? '사용자 전역 sduck 설정 관리'
      : 'Manage user-global sduck configuration',
  );

config
  .command('locale <locale>')
  .description(
    v2Runtime.locale === 'ko'
      ? 'v2 표시 언어를 en 또는 ko로 설정'
      : 'Set v2 display locale to en or ko',
  )
  .action((locale: string) => {
    if (locale !== 'en' && locale !== 'ko') {
      printResult({
        stdout: '',
        stderr: renderV2CommandError(
          new V2CommandError('INVALID_LOCALE', { locale }),
          v2Runtime.messages,
        ),
        exitCode: 1,
      });
      return;
    }
    printResult(runConfigLocaleCommand(locale, v2Runtime));
  });

program
  .command('start <type> <slug>')
  .description('Legacy SDD: start an SDD task workspace')
  .option('--no-git', 'Skip git worktree/branch allocation')
  .action(async (type: string, slug: string, options: { git?: boolean }) => {
    printResult(await runStartCommand(type, slug, process.cwd(), toStartOptions(options)));
  });

program
  .command('fast-track <type> <slug>')
  .description('Legacy SDD: create a minimal SDD task, spec, and plan')
  .option('--no-git', 'Skip git worktree/branch allocation')
  .action(async (type: string, slug: string, options: { git?: boolean }) => {
    printResult(await runFastTrackCommand({ slug, type }, process.cwd(), toStartOptions(options)));
  });

const spec = program.command('spec').description('Legacy SDD spec workflow commands');

spec
  .command('approve [target]')
  .description('Legacy SDD: approve an SDD spec')
  .action(async (target?: string) => {
    printResult(await runSpecApproveCommand(withOptionalTarget(target), process.cwd()));
  });

const plan = program.command('plan').description('Legacy SDD plan workflow commands');

plan
  .command('approve [target]')
  .description('Legacy SDD: approve an SDD plan')
  .action(async (target?: string) => {
    printResult(await runPlanApproveCommand(withOptionalTarget(target), process.cwd()));
  });

const step = program.command('step').description('Legacy SDD step workflow commands');

step
  .command('done <number> [target]')
  .description('Legacy SDD: mark an SDD plan step done')
  .action(async (stepNumberText: string, target?: string) => {
    printResult(
      await runStepCommand(parseInteger(stepNumberText, 'step number', 1), process.cwd(), target),
    );
  });

const review = program.command('review').description('Legacy SDD review workflow commands');

review
  .command('ready [target]')
  .description('Legacy SDD: mark an SDD task review ready')
  .action(async (target?: string) => {
    printResult(await runReviewReadyCommand(target, process.cwd()));
  });

program
  .command('done [target]')
  .description('Legacy SDD: mark an SDD task done')
  .action(async (target?: string) => {
    printResult(await runDoneCommand(withOptionalTarget(target), process.cwd()));
  });

program
  .command('use <target>')
  .description('Legacy SDD: switch current SDD task')
  .action(async (target: string) => {
    printResult(await runUseCommand(target, process.cwd()));
  });

program
  .command('implement [target]')
  .description('Legacy SDD: render SDD implementation context')
  .action(async (target?: string) => {
    printResult(await runImplementCommand(process.cwd(), target));
  });

program
  .command('clean [target]')
  .description('Legacy SDD: clean archived or abandoned SDD task resources')
  .option('--force', 'Clean without confirmation guards')
  .action(async (target: string | undefined, options: { force?: boolean }) => {
    printResult(await runCleanCommand({ force: options.force, target }, process.cwd()));
  });

program
  .command('reopen [target]')
  .description('Legacy SDD: reopen an SDD task')
  .action(async (target?: string) => {
    printResult(await runReopenCommand(withOptionalTarget(target), process.cwd()));
  });

program
  .command('archive')
  .description('Legacy SDD: archive DONE SDD tasks')
  .option('--keep <n>', 'Keep the most recent N DONE tasks in workspace', (value: string) =>
    parseInteger(value, '--keep', 0),
  )
  .action(async (options: { keep?: number }) => {
    printResult(await runArchiveCommand(withOptionalKeep(options.keep), process.cwd()));
  });

program
  .command('update')
  .description('Legacy SDD: update bundled SDD assets in the current project')
  .option('--dry-run', 'Preview changes without writing files')
  .action(async (options: { dryRun?: boolean }) => {
    printResult(await runUpdateCommand({ dryRun: options.dryRun === true }, process.cwd()));
  });

program
  .command('work <description...>')
  .description(
    v2Text(
      'Start a decision briefing task and index context',
      'Decision briefing task를 시작하고 context를 색인',
    ),
  )
  .option('--record-depth <depth>', 'Record depth: FULL or LIGHTWEIGHT', parseRecordDepth)
  .action((descriptionParts: string[], options: { recordDepth?: 'FULL' | 'LIGHTWEIGHT' }) => {
    printResult(
      runWorkCommand(
        process.cwd(),
        descriptionParts.join(' '),
        { recordDepth: options.recordDepth ?? 'FULL' },
        v2Runtime,
      ),
    );
  });

program
  .command('status')
  .description(v2Text('Show current decision briefing status', '현재 decision briefing 상태 표시'))
  .option('--json', v2Text('Print machine-readable JSON', '기계가 읽는 JSON 출력'))
  .action((options: { json?: boolean }) => {
    printResult(runStatusCommand(process.cwd(), options.json === true, v2Runtime));
  });

program
  .command('resume <taskId>')
  .description(
    v2Text(
      'Resume a previous non-terminal decision briefing task',
      '종료되지 않은 이전 decision task 재개',
    ),
  )
  .action((taskId: string) => {
    printResult(runResumeCommand(process.cwd(), taskId, v2Runtime));
  });

const workflow = program
  .command('workflow')
  .description(v2Text('Manage new work creation mode', '새 작업 생성 모드 관리'));

workflow
  .command('status')
  .description(
    v2Text(
      'Show whether new decision workflow is enabled',
      '새 decision workflow 활성화 상태 표시',
    ),
  )
  .option('--json', v2Text('Print machine-readable JSON', '기계가 읽는 JSON 출력'))
  .action((options: { json?: boolean }) => {
    printResult(runWorkflowStatusCommand(process.cwd(), options.json === true, v2Runtime));
  });

workflow
  .command('enable')
  .description(v2Text('Enable new decision workflow', '새 decision workflow 활성화'))
  .option('--json', v2Text('Print machine-readable JSON', '기계가 읽는 JSON 출력'))
  .action((options: { json?: boolean }) => {
    printResult(runWorkflowEnableCommand(process.cwd(), options.json === true, v2Runtime));
  });

workflow
  .command('disable')
  .description(
    v2Text('Disable new decision workflow creation', '새 decision workflow 생성 비활성화'),
  )
  .option('--json', v2Text('Print machine-readable JSON', '기계가 읽는 JSON 출력'))
  .action((options: { json?: boolean }) => {
    printResult(runWorkflowDisableCommand(process.cwd(), options.json === true, v2Runtime));
  });

const context = program
  .command('context')
  .description(v2Text('Show or extend current context pack', '현재 context pack 표시 또는 확장'));

context
  .option('--json', v2Text('Print machine-readable JSON', '기계가 읽는 JSON 출력'))
  .action((options: { json?: boolean }) => {
    printResult(runContextCommand(process.cwd(), options.json === true, v2Runtime));
  });

context
  .command('add <pathOrGlob>')
  .description(
    v2Text(
      'Add file/path context to the current decision task',
      '현재 decision task에 파일/경로 context 추가',
    ),
  )
  .action((pathOrGlob: string) => {
    printResult(runContextAddCommand(process.cwd(), pathOrGlob, v2Runtime));
  });

program
  .command('grill-me')
  .description(
    v2Text(
      'Record the required grill-me entry for the current decision task',
      '현재 decision task의 필수 grill-me 기록',
    ),
  )
  .option('--json', v2Text('Print machine-readable JSON', '기계가 읽는 JSON 출력'))
  .action((options: { json?: boolean }) => {
    printResult(runGrillMeCommand(process.cwd(), options.json === true, v2Runtime));
  });

const grill = program
  .command('grill')
  .description(v2Text('Guided grilling workflow commands', 'Guided grilling workflow 명령'));

grill
  .command('complete')
  .description(v2Text('Record guided grill completion', 'guided grill 완료 기록'))
  .requiredOption('--reason <reason>', v2Text('Completion rationale', '완료 이유'))
  .option('--carried <decisionId...>', v2Text('Carried decision ids', '가져온 decision ID'))
  .option('--changed-assumption <text>', v2Text('Changed assumption', '변경된 가정'))
  .action((options: { reason?: string; carried?: string[]; changedAssumption?: string }) => {
    printResult(runGrillCompleteCommand(process.cwd(), options, v2Runtime));
  });

program
  .command('submit')
  .description(
    v2Text(
      'Submit agent-generated JSON or Markdown draft from stdin',
      'stdin에서 agent draft JSON/Markdown 제출',
    ),
  )
  .option('--stdin', v2Text('Read draft from stdin', 'stdin에서 draft 읽기'))
  .action((options: { stdin?: boolean }) => {
    try {
      printResult(
        runSubmitCommand(process.cwd(), readStdinIfRequested(options.stdin, v2Runtime), v2Runtime),
      );
    } catch (error) {
      printResult({
        stdout: '',
        stderr: isV2CommandError(error)
          ? renderV2CommandError(error, v2Runtime.messages)
          : error instanceof Error
            ? error.message
            : String(error),
        exitCode: 1,
      });
    }
  });

const retrospective = program
  .command('retrospective')
  .description(
    v2Text('Retrospective capture workflow commands', 'Retrospective capture workflow 명령'),
  );

retrospective
  .command('capture')
  .description(
    v2Text(
      'Capture a retrospective decision draft from stdin while workflow is disabled',
      'workflow 비활성화 상태에서 stdin으로 retrospective decision draft 기록',
    ),
  )
  .option('--stdin', v2Text('Read draft from stdin', 'stdin에서 draft 읽기'))
  .action((options: { stdin?: boolean }) => {
    try {
      printResult(
        runRetrospectiveCaptureCommand(
          process.cwd(),
          readStdinIfRequested(options.stdin, v2Runtime),
          v2Runtime,
        ),
      );
    } catch (error) {
      printResult({
        stdout: '',
        stderr: isV2CommandError(error)
          ? renderV2CommandError(error, v2Runtime.messages)
          : error instanceof Error
            ? error.message
            : String(error),
        exitCode: 1,
      });
    }
  });

program
  .command('ask')
  .description(v2Text('Ask the next open question', '다음 열린 질문 표시'))
  .action(async () => {
    printResult(await runAskCommand(process.cwd(), v2Runtime));
  });

program
  .command('answer <questionId>')
  .description(v2Text('Answer a question non-interactively', '질문에 비대화형으로 답변'))
  .option(
    '--option <n>',
    v2Text('Answer with a 1-based option number', '1부터 시작하는 옵션 번호로 답변'),
  )
  .option('--text <answer>', v2Text('Answer with free text', '자유 텍스트로 답변'))
  .action((questionId: string, options: { option?: string; text?: string }) => {
    printResult(runAnswerCommand(process.cwd(), questionId, options, v2Runtime));
  });

program
  .command('brief')
  .description(v2Text('Render the current implementation brief', '현재 구현 brief 표시'))
  .option('--json', v2Text('Print machine-readable JSON', '기계가 읽는 JSON 출력'))
  .action((options: { json?: boolean }) => {
    printResult(runBriefCommand(process.cwd(), options.json === true, v2Runtime));
  });

program
  .command('confirm')
  .description(v2Text('Confirm the current implementation brief', '현재 구현 brief 확정'))
  .action(() => {
    printResult(runConfirmCommand(process.cwd(), v2Runtime));
  });

program
  .command('trace')
  .description(
    v2Text('Create implementation trace from git changes', 'Git 변경에서 구현 trace 생성'),
  )
  .option('--base <ref>', v2Text('Diff base ref', 'Diff 기준 ref'))
  .option('--json', v2Text('Print machine-readable JSON', '기계가 읽는 JSON 출력'))
  .action((options: { base?: string; json?: boolean }) => {
    printResult(runTraceCommand(process.cwd(), options, v2Runtime));
  });

program
  .command('evaluate')
  .description(
    v2Text(
      'Record structured evaluation for the latest trace',
      '최신 trace에 대한 구조화 evaluation 기록',
    ),
  )
  .option('--check <name=outcome...>', v2Text('Structured check outcome', '구조화 check 결과'))
  .option('--limitation <text...>', v2Text('Evaluation limitation', 'Evaluation 제한사항'))
  .option('--json', v2Text('Print machine-readable JSON', '기계가 읽는 JSON 출력'))
  .action((options: { check?: string[]; limitation?: string[]; json?: boolean }) => {
    printResult(runEvaluateCommand(process.cwd(), options, v2Runtime));
  });

const graph = program
  .command('graph')
  .description(v2Text('Inspect cache-only decision graph', 'cache-only decision graph 조회'));

graph
  .command('show <root>')
  .description(
    v2Text('Show graph around a TASK-* or DEC-* root', 'TASK-* 또는 DEC-* 주변 graph 표시'),
  )
  .option('--depth <n>', v2Text('Traversal depth (max 4)', '탐색 깊이 (최대 4)'))
  .option('--json', v2Text('Print machine-readable JSON', '기계가 읽는 JSON 출력'))
  .action((root: string, options: { depth?: string; json?: boolean }) => {
    printResult(runGraphShowCommand(process.cwd(), root, options, v2Runtime));
  });

program
  .command('remember')
  .description(
    v2Text(
      'Export markdown and decision graph artifacts',
      'Markdown 및 decision graph 산출물 export',
    ),
  )
  .action(() => {
    printResult(runRememberCommand(process.cwd(), v2Runtime));
  });

program
  .command('rebuild')
  .description(
    v2Text(
      'Rebuild the local decision DB cache from markdown source files',
      'Markdown source에서 로컬 decision DB cache 재빌드',
    ),
  )
  .action(() => {
    printResult(runRebuildCommand(process.cwd(), v2Runtime));
  });

program
  .command('doctor')
  .description(
    v2Text(
      'Diagnose malformed source, legacy cache, and cache consistency',
      '잘못된 source, legacy cache, cache 일관성 진단',
    ),
  )
  .option(
    '--repair',
    v2Text(
      'Repair DB-only migration or rebuildable cache problems',
      'DB-only 마이그레이션 또는 재빌드 가능한 cache 문제 복구',
    ),
  )
  .action((options: { repair?: boolean }) => {
    printResult(runDoctorCommand(process.cwd(), options.repair === true, v2Runtime));
  });

program
  .command('recall <query...>')
  .description(
    v2Text('Search prior decisions and implementation traces', '이전 결정과 구현 trace 검색'),
  )
  .action((queryParts: string[]) => {
    printResult(runRecallCommand(process.cwd(), queryParts.join(' '), v2Runtime));
  });

program
  .command('close')
  .description(v2Text('Close the current decision task', '현재 decision task 종료'))
  .action(() => {
    printResult(runCloseCommand(process.cwd(), v2Runtime));
  });

program
  .command('abandon')
  .description(
    rawRoute === 'targeted-abandon'
      ? 'Abandon the current decision task, or a legacy SDD task when a target is given'
      : v2Text(
          'Abandon the current decision task, or a legacy SDD task when a target is given',
          '현재 decision task 폐기 또는 target 지정 시 legacy SDD task 폐기',
        ),
  )
  .argument('[target]')
  .action(async (target?: string) => {
    printResult(
      target === undefined
        ? runV2AbandonCommand(process.cwd(), v2Runtime)
        : await runSddAbandonCommand(target, process.cwd()),
    );
  });

applyLocalizedCommanderToV2();

program.parseAsync(process.argv).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
