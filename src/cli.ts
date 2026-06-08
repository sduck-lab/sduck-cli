#!/usr/bin/env node

import { Command } from 'commander';

import {
  readStdinIfRequested,
  runAbandonCommand,
  runAnswerCommand,
  runAskCommand,
  runBriefCommand,
  runCloseCommand,
  runConfirmCommand,
  runContextAddCommand,
  runContextCommand,
  runImpactCommand,
  runInitCommand,
  runRecallCommand,
  runRememberCommand,
  runStatusCommand,
  runSubmitCommand,
  runTraceCommand,
  runWorkCommand,
} from './commands/v2/index.js';
import { CLI_DESCRIPTION, CLI_NAME, CLI_VERSION } from './core/command-metadata.js';
import { resolveV2ProjectRoot } from './core/v2/project-root.js';

const program = new Command();

program.name(CLI_NAME).description(CLI_DESCRIPTION).version(CLI_VERSION);

function printResult(result: { stdout: string; stderr: string; exitCode: number }): void {
  if (result.stdout !== '') console.log(result.stdout);
  if (result.stderr !== '') console.error(result.stderr);
  if (result.exitCode !== 0) process.exitCode = result.exitCode;
}

async function resolveProjectRoot(): Promise<string> {
  return await resolveV2ProjectRoot(process.cwd());
}

program
  .command('init')
  .description('Initialize .decision workspace')
  .option('--no-agent', 'Do not install or update AGENTS.md agent rails')
  .action((options: { agent?: boolean }) => {
    printResult(runInitCommand(process.cwd(), { agentRails: options.agent !== false }));
  });

program
  .command('work <description...>')
  .description('Start a decision briefing task and index context')
  .action(async (descriptionParts: string[]) => {
    printResult(runWorkCommand(await resolveProjectRoot(), descriptionParts.join(' ')));
  });

program
  .command('status')
  .description('Show current decision briefing status')
  .option('--json', 'Print machine-readable JSON')
  .action(async (options: { json?: boolean }) => {
    printResult(runStatusCommand(await resolveProjectRoot(), options.json === true));
  });

const context = program.command('context').description('Show or extend current context pack');

context
  .option('--json', 'Print machine-readable JSON')
  .action(async (options: { json?: boolean }) => {
    printResult(runContextCommand(await resolveProjectRoot(), options.json === true));
  });

context
  .command('add <pathOrGlob>')
  .description('Add file/path context to current task')
  .action(async (pathOrGlob: string) => {
    printResult(runContextAddCommand(await resolveProjectRoot(), pathOrGlob));
  });

program
  .command('submit')
  .description('Submit agent-generated JSON or Markdown draft from stdin')
  .option('--stdin', 'Read draft from stdin')
  .action(async (options: { stdin?: boolean }) => {
    try {
      printResult(
        runSubmitCommand(await resolveProjectRoot(), readStdinIfRequested(options.stdin)),
      );
    } catch (error) {
      printResult({
        stdout: '',
        stderr: error instanceof Error ? error.message : String(error),
        exitCode: 1,
      });
    }
  });

program
  .command('ask')
  .description('Ask the next open question')
  .action(async () => {
    printResult(await runAskCommand(await resolveProjectRoot()));
  });

program
  .command('answer <questionId>')
  .description('Answer a question non-interactively')
  .option('--option <n>', 'Answer with a 1-based option number')
  .option('--text <answer>', 'Answer with free text')
  .action(async (questionId: string, options: { option?: string; text?: string }) => {
    printResult(runAnswerCommand(await resolveProjectRoot(), questionId, options));
  });

program
  .command('brief')
  .description('Render the current implementation brief')
  .option('--json', 'Print machine-readable JSON')
  .action(async (options: { json?: boolean }) => {
    printResult(runBriefCommand(await resolveProjectRoot(), options.json === true));
  });

program
  .command('confirm')
  .description('Confirm the current implementation brief')
  .action(async () => {
    printResult(runConfirmCommand(await resolveProjectRoot()));
  });

program
  .command('trace')
  .description('Create implementation trace from git changes')
  .option('--base <ref>', 'Diff base ref')
  .option('--json', 'Print machine-readable JSON')
  .action(async (options: { base?: string; json?: boolean }) => {
    printResult(runTraceCommand(await resolveProjectRoot(), options));
  });

program
  .command('impact <files...>')
  .description('Show file-aware decision provenance')
  .option('--json', 'Print machine-readable JSON')
  .action(async (files: string[], options: { json?: boolean }) => {
    printResult(runImpactCommand(await resolveProjectRoot(), files, options.json === true));
  });

program
  .command('remember')
  .description('Export markdown and decision graph artifacts')
  .action(async () => {
    printResult(runRememberCommand(await resolveProjectRoot()));
  });

program
  .command('recall <query...>')
  .description('Search prior decisions and implementation traces')
  .action(async (queryParts: string[]) => {
    printResult(runRecallCommand(await resolveProjectRoot(), queryParts.join(' ')));
  });

program
  .command('close')
  .description('Close current task')
  .action(async () => {
    printResult(runCloseCommand(await resolveProjectRoot()));
  });

program
  .command('abandon')
  .description('Abandon current task')
  .action(async () => {
    printResult(runAbandonCommand(await resolveProjectRoot()));
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
