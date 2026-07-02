const chalk = require('chalk');
const { loadState } = require('../config');

module.exports = function current() {
  const state = loadState();
  if (!state.current || !state.accounts[state.current]) {
    console.log(chalk.gray('No account currently active (via claudeswitch).'));
    return;
  }
  console.log(state.current);
};
