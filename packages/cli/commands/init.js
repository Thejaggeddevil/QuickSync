const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');

module.exports = async function init(projectName, options) {
  const spinner = ora('Initializing ZeroSync project...').start();

  try {
    const projectPath = path.join(process.cwd(), projectName);

    // Create project directory
    if (fs.existsSync(projectPath)) {
      spinner.fail(chalk.red(`Directory ${projectName} already exists!`));
      process.exit(1);
    }

    fs.mkdirSync(projectPath);

    // Create config file
    const config = {
      name: projectName,
      type: options.type,
      version: '0.1.0',
      rollup: {
        batchSize: 10,
        blockTime: 2000,
        proofInterval: 5,
        gasLimit: 8000000
      },
      chain: {
        target: 'sepolia',
        rpcUrl: process.env.RPC_URL || ''
      },
      plugins: []
    };

    fs.writeFileSync(
      path.join(projectPath, 'zerosync.config.json'),
      JSON.stringify(config, null, 2)
    );

    // Create .env template
    const envTemplate = `# ZeroSync Configuration
PRIVATE_KEY=your_private_key_here
RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
ANCHOR_ADDRESS=
`;

    fs.writeFileSync(path.join(projectPath, '.env.example'), envTemplate);

    // Create data directory for state storage
    fs.mkdirSync(path.join(projectPath, 'data'));

    // Create README
    const readme = `# ${projectName}

ZeroSync Rollup Project

## Quick Start

\`\`\`bash
# Simulate rollup locally
zerosync simulate

# Deploy anchor contract
zerosync deploy

# Run live rollup
zerosync run
\`\`\`

## Configuration

Edit \`zerosync.config.json\` to customize your rollup.
`;

    fs.writeFileSync(path.join(projectPath, 'README.md'), readme);

    spinner.succeed(chalk.green(`✓ Project ${projectName} created!`));
    console.log(chalk.cyan(`\nNext steps:`));
    console.log(chalk.white(`  cd ${projectName}`));
    console.log(chalk.white(`  zerosync simulate`));
  } catch (error) {
    spinner.fail(chalk.red('Failed to initialize project'));
    console.error(error);
    process.exit(1);
  }
};
