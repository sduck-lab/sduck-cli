#!/usr/bin/env node

import { Command } from 'commander';

import { runAbandonCommand } from './commands/abandon.js';
import { runArchiveCommand } from './commands/archive.js';
import { runCleanCommand } from './commands/clean.js';
import { runDoneCommand } from './commands/done.js';
import { runFastTrackCommand } from './commands/fast-track.js';
import { runImplementCommand } from './commands/implement.js';
import { runInitCommand } from './commands/init.js';
import { runPlanApproveCommand } from './commands/plan-approve.js';
import { runReopenCommand } from './commands/reopen.js';
import { runReviewReadyCommand } from './commands/review.js';
import { runSpecApproveCommand } from './commands/spec-approve.js';
import { runStartCommand } from './commands/start.js';
import { runStepCommand } from './commands/step.js';
import { runUpdateCommand } from './commands/update.js';
import { runUseCommand } from './commands/use.js';
import {
  CLI_DESCRIPTION,
  CLI_NAME,
  CLI_VERSION,
  PLACEHOLDER_MESSAGE,
  normalizeCommandName,
} from './core/command-metadata.js';
import { resolveRealProjectRoot } from './core/project-paths.js';

const program = new Command();

program.name(CLI_NAME).description(CLI_DESCRIPTION).version(CLI_VERSION);

program
  .command('init')
  .description('Initialize the current repository for the SDD workflow')
  .option('--force', 'Regenerate the bundled assets in .sduck/sduck-assets')
  .option(
    '--agents <agents>',
    'Comma-separated agents (claude-code,codex,opencode,gemini-cli,cursor,antigravity)',
  )
  .action(async (options: { agents?: string; force?: boolean }) => {
    const initOptions =
      options.agents === undefined
        ? { force: options.force ?? false }
        : { agents: options.agents, force: options.force ?? false };
    const result = await runInitCommand(initOptions, await resolveRealProjectRoot(process.cwd()));

    if (result.stdout !== '') {
      console.log(result.stdout);
    }

    if (result.stderr !== '') {
      console.error(result.stderr);
    }

    if (result.exitCode !== 0) {
      process.exitCode = result.exitCode;
    }
  });

program
  .command('update')
  .description('Update sduck assets and agent rules to the current CLI version')
  .option('--dry-run', 'Show what would be updated without making changes')
  .action(async (options: { dryRun?: boolean }) => {
    const result = await runUpdateCommand(
      { dryRun: options.dryRun ?? false },
      await resolveRealProjectRoot(process.cwd()),
    );

    if (result.stdout !== '') {
      console.log(result.stdout);
    }

    if (result.stderr !== '') {
      console.error(result.stderr);
    }

    if (result.exitCode !== 0) {
      process.exitCode = result.exitCode;
    }
  });

program
  .command('preview <name>')
  .description('Print the normalized command name for bootstrap verification')
  .action((name: string) => {
    console.log(normalizeCommandName(name));
  });

program
  .command('start <type> <slug>')
  .description('Create a new task workspace from a type template')
  .option('--no-git', 'Skip git worktree creation')
  .action(async (type: string, slug: string, options: { git: boolean }) => {
    const startOptions = options.git ? undefined : { noGit: true };
    const result = await runStartCommand(
      type,
      slug,
      await resolveRealProjectRoot(process.cwd()),
      startOptions,
    );

    if (result.stdout !== '') {
      console.log(result.stdout);
    }

    if (result.stderr !== '') {
      console.error(result.stderr);
    }

    if (result.exitCode !== 0) {
      process.exitCode = result.exitCode;
    }
  });

program
  .command('fast-track <type> <slug>')
  .description('Create a minimal spec/plan task with optional bundled approval')
  .option('--no-git', 'Skip git worktree creation')
  .action(async (type: string, slug: string, options: { git: boolean }) => {
    const startOptions = options.git ? undefined : { noGit: true };
    const result = await runFastTrackCommand(
      { slug, type },
      await resolveRealProjectRoot(process.cwd()),
      startOptions,
    );

    if (result.stdout !== '') {
      console.log(result.stdout);
    }

    if (result.stderr !== '') {
      console.error(result.stderr);
    }

    if (result.exitCode !== 0) {
      process.exitCode = result.exitCode;
    }
  });

program
  .command('spec')
  .description('Manage spec workflow state')
  .command('approve [target]')
  .description('Approve a task spec and move it to plan writing')
  .action(async (target?: string) => {
    const input = target === undefined ? {} : { target };
    const result = await runSpecApproveCommand(input, await resolveRealProjectRoot(process.cwd()));

    if (result.stdout !== '') {
      console.log(result.stdout);
    }

    if (result.stderr !== '') {
      console.error(result.stderr);
    }

    if (result.exitCode !== 0) {
      process.exitCode = result.exitCode;
    }
  });

program
  .command('plan')
  .description('Manage plan workflow state')
  .command('approve [target]')
  .description('Approve a task plan and move it to implementation')
  .action(async (target?: string) => {
    const input = target === undefined ? {} : { target };
    const result = await runPlanApproveCommand(input, await resolveRealProjectRoot(process.cwd()));

    if (result.stdout !== '') {
      console.log(result.stdout);
    }

    if (result.stderr !== '') {
      console.error(result.stderr);
    }

    if (result.exitCode !== 0) {
      process.exitCode = result.exitCode;
    }
  });

program
  .command('done [target]')
  .description('Complete an in-progress task after validation')
  .action(async (target?: string) => {
    const input = target === undefined ? {} : { target };
    const result = await runDoneCommand(input, await resolveRealProjectRoot(process.cwd()));

    if (result.stdout !== '') {
      console.log(result.stdout);
    }

    if (result.stderr !== '') {
      console.error(result.stderr);
    }

    if (result.exitCode !== 0) {
      process.exitCode = result.exitCode;
    }
  });

program
  .command('reopen [target]')
  .description('Reopen a completed task for a new cycle')
  .action(async (target?: string) => {
    const input = target === undefined ? {} : { target };
    const result = await runReopenCommand(input, await resolveRealProjectRoot(process.cwd()));

    if (result.stdout !== '') {
      console.log(result.stdout);
    }

    if (result.stderr !== '') {
      console.error(result.stderr);
    }

    if (result.exitCode !== 0) {
      process.exitCode = result.exitCode;
    }
  });

program
  .command('archive')
  .description('Archive completed tasks into monthly directories')
  .option('--keep <n>', 'Keep the N most recently completed tasks in workspace', '0')
  .action(async (options: { keep: string }) => {
    const keep = Number(options.keep);
    const result = await runArchiveCommand({ keep }, await resolveRealProjectRoot(process.cwd()));

    if (result.stdout !== '') {
      console.log(result.stdout);
    }

    if (result.stderr !== '') {
      console.error(result.stderr);
    }

    if (result.exitCode !== 0) {
      process.exitCode = result.exitCode;
    }
  });

program
  .command('use <target>')
  .description('Switch the current active work')
  .action(async (target: string) => {
    const result = await runUseCommand(target, await resolveRealProjectRoot(process.cwd()));

    if (result.stdout !== '') {
      console.log(result.stdout);
    }

    if (result.stderr !== '') {
      console.error(result.stderr);
    }

    if (result.exitCode !== 0) {
      process.exitCode = result.exitCode;
    }
  });

program
  .command('implement [target]')
  .description('Show implementation context for the current work')
  .action(async (target?: string) => {
    const result = await runImplementCommand(await resolveRealProjectRoot(process.cwd()), target);

    if (result.stdout !== '') {
      console.log(result.stdout);
    }

    if (result.stderr !== '') {
      console.error(result.stderr);
    }

    if (result.exitCode !== 0) {
      process.exitCode = result.exitCode;
    }
  });

program
  .command('abandon <target>')
  .description('Abandon an active work')
  .action(async (target: string) => {
    const result = await runAbandonCommand(target, await resolveRealProjectRoot(process.cwd()));

    if (result.stdout !== '') {
      console.log(result.stdout);
    }

    if (result.stderr !== '') {
      console.error(result.stderr);
    }

    if (result.exitCode !== 0) {
      process.exitCode = result.exitCode;
    }
  });

const reviewCmd = program.command('review').description('Manage review workflow state');

reviewCmd
  .command('ready [target]')
  .description('Mark a work as review ready')
  .action(async (target?: string) => {
    const result = await runReviewReadyCommand(target, await resolveRealProjectRoot(process.cwd()));

    if (result.stdout !== '') {
      console.log(result.stdout);
    }

    if (result.stderr !== '') {
      console.error(result.stderr);
    }

    if (result.exitCode !== 0) {
      process.exitCode = result.exitCode;
    }
  });

program
  .command('clean [target]')
  .description('Clean up completed or abandoned works')
  .option('--force', 'Force delete unmerged branches')
  .action(async (target: string | undefined, options: { force?: boolean }) => {
    const result = await runCleanCommand(
      { force: options.force, target },
      await resolveRealProjectRoot(process.cwd()),
    );

    if (result.stdout !== '') {
      console.log(result.stdout);
    }

    if (result.stderr !== '') {
      console.error(result.stderr);
    }

    if (result.exitCode !== 0) {
      process.exitCode = result.exitCode;
    }
  });

const stepCmd = program.command('step').description('Manage plan step progress');

stepCmd
  .command('done <number> [target]')
  .description('Mark a plan step as completed')
  .action(async (number: string, target?: string) => {
    const stepNumber = Number.parseInt(number, 10);

    if (Number.isNaN(stepNumber)) {
      console.error(`Invalid step number: ${number}`);
      process.exitCode = 1;

      return;
    }

    const result = await runStepCommand(
      stepNumber,
      await resolveRealProjectRoot(process.cwd()),
      target,
    );

    if (result.stdout !== '') {
      console.log(result.stdout);
    }

    if (result.stderr !== '') {
      console.error(result.stderr);
    }

    if (result.exitCode !== 0) {
      process.exitCode = result.exitCode;
    }
  });

program
  .command('roadmap')
  .description('Show the current bootstrap status')
  .action(() => {
    console.log(PLACEHOLDER_MESSAGE);
  });

await program.parseAsync(process.argv);
