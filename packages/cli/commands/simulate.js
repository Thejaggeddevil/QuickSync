const chalk = require('chalk');
const ora = require('ora');
const { Sequencer } = require('@zerosync/sdk-core');
const { loadConfig } = require('../utils/config');

module.exports = async function simulate(options) {
  console.log(chalk.cyan('🚀 Starting ZeroSync simulation...\n'));

  try {
    const config = loadConfig();
    const sequencer = new Sequencer(config);

    const txCount = parseInt(options.txs);
    const spinner = ora('Generating transactions...').start();

    // Generate dummy transactions
    const transactions = [];
    for (let i = 0; i < txCount; i++) {
      transactions.push({
        from: `0x${Math.random().toString(16).substr(2, 40)}`,
        to: `0x${Math.random().toString(16).substr(2, 40)}`,
        value: Math.floor(Math.random() * 1000),
        nonce: i
      });
    }
    spinner.succeed(`Generated ${txCount} transactions`);

    // Process transactions through sequencer
    spinner.start('Creating batches...');
    const batches = await sequencer.processBatch(transactions);
    spinner.succeed(`Created ${batches.length} batch(es)`);

    // Generate proofs
    spinner.start('Generating mock proofs...');
    for (const batch of batches) {
      await sequencer.generateProof(batch);
    }
    spinner.succeed('Mock proofs generated');

    // Show results
    console.log(chalk.green('\n✓ Simulation complete!\n'));
    console.log(chalk.white('Results:'));
    console.log(chalk.gray(`  Transactions: ${txCount}`));
    console.log(chalk.gray(`  Batches: ${batches.length}`));
    console.log(chalk.gray(`  Batch size: ${config.rollup.batchSize}`));

    if (options.audit) {
      console.log(chalk.cyan('\n📊 Performance Audit:'));
      const gasPerTx = 21000;
      const l1GasCost = txCount * gasPerTx;
      const rollupGasCost = batches.length * 100000; // Simplified
      const savings = ((l1GasCost - rollupGasCost) / l1GasCost * 100).toFixed(1);

      console.log(chalk.gray(`  L1 Gas Cost: ${l1GasCost.toLocaleString()}`));
      console.log(chalk.gray(`  Rollup Gas Cost: ${rollupGasCost.toLocaleString()}`));
      console.log(chalk.green(`  Savings: ${savings}%`));
      console.log(chalk.gray(`  Avg Finality: ${config.rollup.blockTime * config.rollup.proofInterval}ms`));
    }

    console.log(chalk.yellow('\n💡 Tip: Run "zerosync deploy" to deploy the anchor contract'));
  } catch (error) {
    console.error(chalk.red('Simulation failed:'), error.message);
    process.exit(1);
  }
};
