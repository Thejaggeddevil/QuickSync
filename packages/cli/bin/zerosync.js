#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const initCommand = require('../commands/init');
const simulateCommand = require('../commands/simulate');
const deployCommand = require('../commands/deploy');
const runCommand = require('../commands/run');

const program = new Command();

program
  .name('zerosync')
  .description('ZeroSync SDK - Build and deploy rollups in minutes')
  .version('0.1.0');

program
  .command('init <project-name>')
  .description('Initialize a new ZeroSync rollup project')
  .option('-t, --type <type>', 'Rollup type (groth16-zk, polygon-cdk, zksync-stack)', 'groth16-zk')
  .action(initCommand);

program
  .command('simulate')
  .description('Simulate rollup locally with dummy transactions')
  .option('--audit', 'Run performance audit during simulation')
  .option('--txs <count>', 'Number of transactions to simulate', '10')
  .action(simulateCommand);

program
  .command('deploy')
  .description('Deploy Anchor contract to target chain')
  .option('--chain <chain>', 'Target chain (sepolia, polygon, base)', 'sepolia')
  .option('--private-key <key>', 'Deployer private key (or use .env)')
  .action(deployCommand);

program
  .command('run')
  .description('Start live rollup mode with real ZK proofs (sequencer + proof engine)')
  .option('-p, --port <port>', 'API server port', '3001')
  .option('--batch-size <size>', 'Batch size (transactions per batch)', '8')
  .option('--batch-timeout <ms>', 'Batch timeout in milliseconds', '10000')
  .action(runCommand);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
