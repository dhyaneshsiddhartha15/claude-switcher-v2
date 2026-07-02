const fs = require('fs-extra');
const chalk = require('chalk');
const prompts = require('prompts');
const { loadState, saveState } = require('../config');

module.exports = async function remove(name, opts) {
  const state = loadState();
  const account = state.accounts[name];

  if (!account) {
    console.error(chalk.red(`Error: no saved account named "${name}".`));
    process.exitCode = 1;
    return;
  }

  if (!opts.yes) {
    const { confirm } = await prompts({
      type: 'confirm',
      name: 'confirm',
      message: `Remove account "${name}" and delete its stored credentials? This cannot be undone.`,
      initial: false,
    });
    if (!confirm) {
      console.log(chalk.gray('Aborted.'));
      return;
    }
  }

  fs.removeSync(account.path);
  delete state.accounts[name];
  if (state.current === name) {
    state.current = null;
  }
  saveState(state);

  console.log(chalk.green(`Removed account "${name}".`));
};
