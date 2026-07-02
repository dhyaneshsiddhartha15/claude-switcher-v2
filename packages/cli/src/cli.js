const { Command } = require('commander');
const chalk = require('chalk');
const pkg = require('../package.json');

const add = require('./commands/add');
const use = require('./commands/use');
const list = require('./commands/list');
const remove = require('./commands/remove');
const current = require('./commands/current');

function run(argv) {
  const program = new Command();

  program
    .name('claudeswitch')
    .description('Save and switch between multiple Claude Code accounts instantly.')
    .version(pkg.version);

  program
    .command('add')
    .description('Save the currently logged-in Claude Code account under an alias')
    .requiredOption('--name <alias>', 'name to save this account as')
    .option('--from <dir>', 'source config directory to copy (defaults to $CLAUDE_CONFIG_DIR or ~/.claude)')
    .option('--force', 'overwrite an existing account with the same name without prompting')
    .action((opts) => add(opts.name, opts));

  program
    .command('use <alias>')
    .description('Switch to a saved account and launch Claude Code with it')
    .option('--print-env', 'print an export/set command instead of launching Claude Code')
    .allowUnknownOption(true)
    .action((alias, opts, command) => use(alias, { ...opts, args: command.args.slice(1) }));

  program
    .command('list')
    .alias('ls')
    .description('List all saved accounts')
    .action(() => list());

  program
    .command('remove <alias>')
    .alias('rm')
    .description('Remove a saved account and delete its stored credentials')
    .option('-y, --yes', 'skip the confirmation prompt')
    .action((alias, opts) => remove(alias, opts));

  program
    .command('current')
    .description('Print the currently active account (as last set by "use")')
    .action(() => current());

  program.exitOverride();

  try {
    program.parse(argv);
  } catch (err) {
    if (err.code && err.code.startsWith('commander.')) {
      process.exitCode = err.exitCode ?? 1;
      return;
    }
    console.error(chalk.red(err.message || err));
    process.exitCode = 1;
  }
}

module.exports = { run };
