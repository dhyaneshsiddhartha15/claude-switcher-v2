const fs = require('fs-extra');
const chalk = require('chalk');
const prompts = require('prompts');
const { accountDir, defaultClaudeConfigDir, loadState, saveState } = require('../config');

module.exports = async function add(name, opts) {
  if (!name || !/^[a-zA-Z0-9_-]+$/.test(name)) {
    console.error(chalk.red('Error: account name must be non-empty and contain only letters, numbers, "-" and "_".'));
    process.exitCode = 1;
    return;
  }

  const sourceDir = opts.from || defaultClaudeConfigDir();
  if (!fs.existsSync(sourceDir)) {
    console.error(chalk.red(`Error: no Claude Code config found at ${sourceDir}.`));
    console.error(chalk.gray('Log in with "claude" first, or pass --from <dir> to point at an existing config.'));
    process.exitCode = 1;
    return;
  }

  const state = loadState();
  const dest = accountDir(name);

  if (fs.existsSync(dest) && !opts.force) {
    const { overwrite } = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: `Account "${name}" already exists. Overwrite it?`,
      initial: false,
    });
    if (!overwrite) {
      console.log(chalk.gray('Aborted.'));
      return;
    }
  }

  fs.removeSync(dest);
  fs.copySync(sourceDir, dest, { dereference: true });

  state.accounts[name] = {
    name,
    path: dest,
    createdAt: state.accounts[name]?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveState(state);

  console.log(chalk.green(`Saved account "${name}" from ${sourceDir}.`));
  console.log(chalk.gray(`Run "claudeswitch use ${name}" to switch to it.`));
};
