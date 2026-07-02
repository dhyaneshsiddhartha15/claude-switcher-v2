const fs = require('fs-extra');
const chalk = require('chalk');
const { spawn } = require('child_process');
const { loadState, saveState } = require('../config');

module.exports = async function use(name, opts) {
  const state = loadState();
  const account = state.accounts[name];

  if (!account) {
    console.error(chalk.red(`Error: no saved account named "${name}".`));
    console.error(chalk.gray('Run "claudeswitch list" to see available accounts.'));
    process.exitCode = 1;
    return;
  }

  if (!fs.existsSync(account.path)) {
    console.error(chalk.red(`Error: account folder for "${name}" is missing (${account.path}).`));
    process.exitCode = 1;
    return;
  }

  state.current = name;
  saveState(state);

  if (opts.printEnv) {
    // For shells that want to eval the env var into the current session instead
    // of spawning a nested Claude process, e.g. eval "$(claudeswitch use hashir --print-env)".
    const isWindows = process.platform === 'win32';
    console.log(isWindows ? `set CLAUDE_CONFIG_DIR=${account.path}` : `export CLAUDE_CONFIG_DIR="${account.path}"`);
    return;
  }

  console.log(chalk.green(`Switching to "${name}"...`));

  const env = { ...process.env, CLAUDE_CONFIG_DIR: account.path };
  const args = opts.args || [];
  const child = spawn('claude', args, {
    env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  child.on('error', (err) => {
    if (err.code === 'ENOENT') {
      console.error(chalk.red('Error: could not find the "claude" command on your PATH.'));
      console.error(chalk.gray('Install Claude Code first: https://docs.claude.com/claude-code'));
    } else {
      console.error(chalk.red(`Error launching Claude Code: ${err.message}`));
    }
    process.exitCode = 1;
  });

  child.on('exit', (code) => {
    process.exitCode = code === null ? 1 : code;
  });
};
