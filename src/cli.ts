#!/usr/bin/env node

import { Command } from 'commander';

import {
  CLI_DESCRIPTION,
  CLI_NAME,
  PLACEHOLDER_MESSAGE,
  normalizeCommandName,
} from './core/command-metadata.js';

const program = new Command();

program.name(CLI_NAME).description(CLI_DESCRIPTION).version('0.1.0');

program
  .command('preview <name>')
  .description('Print the normalized command name for bootstrap verification')
  .action((name: string) => {
    console.log(normalizeCommandName(name));
  });

program
  .command('roadmap')
  .description('Show the current bootstrap status')
  .action(() => {
    console.log(PLACEHOLDER_MESSAGE);
  });

await program.parseAsync(process.argv);
