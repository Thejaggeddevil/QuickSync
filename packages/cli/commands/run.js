const chalk = require('chalk');
const { spawn } = require('child_process');
const path = require('path');

module.exports = async function run(options) {
  console.log(chalk.cyan('🚀 Starting ZeroSync rollup in live mode...\n'));

  try {
    // Start the Express API server
    const apiPath = path.join(__dirname, '../../api/src/server.js');
    const apiProcess = spawn('node', [apiPath], {
      env: { ...process.env, PORT: options.port },
      stdio: 'inherit'
    });

    console.log(chalk.green(`✓ API server running on port ${options.port}`));
    console.log(chalk.white('\nEndpoints:'));
    console.log(chalk.gray(`  POST http://localhost:${options.port}/api/transactions`));
    console.log(chalk.gray(`  GET  http://localhost:${options.port}/api/batches`));
    console.log(chalk.gray(`  GET  http://localhost:${options.port}/api/proofs`));
    console.log(chalk.gray(`  GET  http://localhost:${options.port}/api/status`));
    
    console.log(chalk.cyan('\n📊 Dashboard available at:'));
    console.log(chalk.white(`  http://localhost:3000 (connect to API on port ${options.port})`));
    
    console.log(chalk.yellow('\n💡 Press Ctrl+C to stop the rollup\n'));

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
