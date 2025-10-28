const fs = require('fs');
const path = require('path');

function loadConfig() {
  const configPath = path.join(process.cwd(), 'zerosync.config.json');
  
  if (!fs.existsSync(configPath)) {
    throw new Error('zerosync.config.json not found. Run "zerosync init" first.');
  }

  const configData = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(configData);
}

function updateConfig(config) {
  const configPath = path.join(process.cwd(), 'zerosync.config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

module.exports = {
  loadConfig,
  updateConfig
};
