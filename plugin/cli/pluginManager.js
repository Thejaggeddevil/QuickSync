import fs from 'fs-extra';
import chalk from 'chalk';

const pluginDir = './plugins';

export async function addPlugin(name) {
  const pluginPath = `${pluginDir}/${name}.plugin.json`;
  if (fs.existsSync(pluginPath)) {
    console.log(chalk.red(` Plugin '${name}' already exists.`));
    return;
  }

  const pluginTemplate = {
    name,
    type: "zk",
    config: {
      prover: "mock",
      bridge: "plasma"
    }
  };

  await fs.writeJson(pluginPath, pluginTemplate, { spaces: 2 });
  console.log(chalk.green(` Plugin '${name}' added successfully.`));
}

export async function listPlugins() {
  const files = fs.readdirSync(pluginDir).filter(f => f.endsWith('.plugin.json'));
  if (files.length === 0) {
    console.log(chalk.yellow('No plugins found.'));
    return;
  }
  console.log(chalk.cyan('\nInstalled Plugins:\n'));
  files.forEach(file => {
    const data = fs.readJsonSync(`${pluginDir}/${file}`);
    console.log(`🔹 ${data.name} (${data.type})`);
  });
}

export async function removePlugin(name) {
  const pluginPath = `${pluginDir}/${name}.plugin.json`;
  if (!fs.existsSync(pluginPath)) {
    console.log(chalk.red(` Plugin '${name}' not found.`));
    return;
  }
  fs.removeSync(pluginPath);
  console.log(chalk.green(` Removed plugin '${name}'.`));
}
