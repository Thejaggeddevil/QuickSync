const chalk = require('chalk');
const ora = require('ora');
const { deployAnchor } = require('@zerosync/contracts-interface');
const { loadConfig, updateConfig } = require('../utils/config');

module.exports = async function deploy(options) {
  console.log(chalk.cyan('🚀 Deploying Anchor contract...\n'));

  const spinner = ora('Loading configuration...').start();

  try {
    const config = loadConfig();
    
    // Get private key from options or environment
    const privateKey = options.privateKey || process.env.PRIVATE_KEY;
    if (!privateKey) {
      spinner.fail(chalk.red('Private key not provided!'));
      console.log(chalk.yellow('Set PRIVATE_KEY in .env or use --private-key flag'));
      process.exit(1);
    }

    const rpcUrl = config.chain.rpcUrl || process.env.RPC_URL;
    if (!rpcUrl) {
      spinner.fail(chalk.red('RPC URL not configured!'));
      console.log(chalk.yellow('Set RPC_URL in .env or zerosync.config.json'));
      process.exit(1);
    }

    spinner.text = `Deploying to ${options.chain}...`;

    // Deploy contract
    const result = await deployAnchor({
      privateKey,
      rpcUrl,
      chain: options.chain
    });

    spinner.succeed(chalk.green('Contract deployed!'));

    console.log(chalk.white('\nDeployment details:'));
    console.log(chalk.gray(`  Address: ${result.address}`));
    console.log(chalk.gray(`  Transaction: ${result.txHash}`));
    console.log(chalk.gray(`  Block: ${result.blockNumber}`));

    // Update config with contract address
    config.chain.anchorAddress = result.address;
    updateConfig(config);

    console.log(chalk.green('\n✓ Config updated with anchor address'));
    console.log(chalk.yellow('\n💡 Next: Run "zerosync run" to start the rollup'));
  } catch (error) {
    spinner.fail(chalk.red('Deployment failed'));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
};
