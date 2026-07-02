const os = require('os');
const path = require('path');
const fs = require('fs-extra');

const HOME_DIR = path.join(os.homedir(), '.claudeswitch');
const ACCOUNTS_DIR = path.join(HOME_DIR, 'accounts');
const STATE_FILE = path.join(HOME_DIR, 'accounts.json');

function defaultClaudeConfigDir() {
  return process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
}

function accountDir(name) {
  return path.join(ACCOUNTS_DIR, name);
}

function loadState() {
  fs.ensureDirSync(HOME_DIR);
  fs.ensureDirSync(ACCOUNTS_DIR);
  if (!fs.existsSync(STATE_FILE)) {
    return { current: null, accounts: {} };
  }
  try {
    return fs.readJsonSync(STATE_FILE);
  } catch (err) {
    throw new Error(`Could not read ${STATE_FILE}: ${err.message}`);
  }
}

function saveState(state) {
  fs.ensureDirSync(HOME_DIR);
  fs.writeJsonSync(STATE_FILE, state, { spaces: 2 });
}

module.exports = {
  HOME_DIR,
  ACCOUNTS_DIR,
  STATE_FILE,
  defaultClaudeConfigDir,
  accountDir,
  loadState,
  saveState,
};
