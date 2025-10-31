#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { addPlugin, listPlugins, removePlugin } from './pluginManager.js';
import { runAudit } from './audit.js';

const program = new Command();

program
  .name('zerosync')
  .description('Unified SDK CLI for Rollup Development')
  .version('1.0.0');

program
  .command('plugin')
  .description('Manage rollup plugins')
  .option('--add <name>', 'Add a rollup plugin')
  .option('--list', 'List all plugins')
  .option('--remove <name>', 'Remove a rollup plugin')
  .action(async (options) => {
    if (options.add) await addPlugin(options.add);
    else if (options.list) await listPlugins();
    else if (options.remove) await removePlugin(options.remove);
    else console.log(chalk.yellow('Use --add, --list, or --remove'));
  });

program
  .command('audit')
  .description('Run performance and simulation audit')
  .action(async () => {
    await runAudit();
  });

program.parse(process.argv);
