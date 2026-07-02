const chalk = require('chalk');
const { loadState } = require('../config');

module.exports = function list() {
  const state = loadState();
  const names = Object.keys(state.accounts);

  if (names.length === 0) {
    console.log(chalk.gray('No accounts saved yet. Run "claudeswitch add --name <alias>" first.'));
    return;
  }

  console.log(chalk.bold('Saved accounts:'));
  for (const name of names.sort()) {
    const account = state.accounts[name];
    const marker = name === state.current ? chalk.green('* ') : '  ';
    const label = name === state.current ? chalk.green.bold(name) : name;
    console.log(`${marker}${label}${chalk.gray(`  (${account.path})`)}`);
  }
};
