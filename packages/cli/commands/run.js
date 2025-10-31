const chalk = require('chalk');
const { spawn } = require('child_process');
const path = require('path');

module.exports = async function run(options) {
  console.log(chalk.cyan('🚀 Starting ZeroSync Rollup Engine\n'));
  
  console.log(chalk.white('Configuration:'));
  console.log(chalk.gray(`  Proof Mode: Real ZK (Groth16)`));
  console.log(chalk.gray(`  Batch Size: ${options.batchSize}`));
  console.log(chalk.gray(`  Batch Timeout: ${options.batchTimeout}ms`));
  console.log(chalk.gray(`  API Port: ${options.port}`));
  console.log('');

  try {
    // Start the Express API server with proof mode
    const apiPath = path.join(__dirname, '../../api/src/server-v2.js');
    const apiProcess = spawn('node', [apiPath], {
      env: { 
        ...process.env, 
        PORT: options.port,
        BATCH_SIZE: options.batchSize,
        BATCH_TIMEOUT: options.batchTimeout
      },
      stdio: 'inherit'
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n\n🛑 Shutting down...'));
      apiProcess.kill();
      process.exit(0);
    });

    apiProcess.on('error', (error) => {
      console.error(chalk.red('Failed to start API server:'), error.message);
      process.exit(1);
    });

  } catch (error) {
    console.error(chalk.red('Failed to start rollup:'), error.message);
    process.exit(1);
  }
};
