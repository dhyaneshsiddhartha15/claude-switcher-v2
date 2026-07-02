# ClaudeSwitch

An open-source multi-account switcher for [Claude Code](https://docs.claude.com/claude-code). Save multiple accounts — personal, work, a friend's — and switch between them instantly, without logging out or re-entering an OTP.

```bash
npm install -g claudeswitch

claude login && claudeswitch add --name personal
claude login && claudeswitch add --name work

claudeswitch use work
```

## How it works

Claude Code stores its credentials and settings in a config directory — `~/.claude` by default, or wherever `CLAUDE_CONFIG_DIR` points. ClaudeSwitch copies that directory into `~/.claudeswitch/accounts/<name>/` when you run `add`, and launches `claude` with `CLAUDE_CONFIG_DIR` pointed at the right folder when you run `use`.

Everything happens on your machine. Credentials are never uploaded anywhere.

## What's in this repo

This is an npm-workspaces monorepo with three pieces:

| Package | Description |
| --- | --- |
| [`packages/cli`](packages/cli) | The `claudeswitch` npm package — the CLI, published to the registry. |
| [`packages/desktop`](packages/desktop) | An optional Electron system tray app for switching accounts without the terminal. |
| [`apps/landing`](apps/landing) | The Next.js marketing/landing page. |

## CLI usage

```bash
claudeswitch add --name <alias>     # save the currently logged-in account
claudeswitch use <alias>            # switch to it and launch `claude`
claudeswitch list                   # show all saved accounts
claudeswitch remove <alias>         # delete a saved account
claudeswitch current                # print the active account
```

See [`packages/cli/README.md`](packages/cli/README.md) for the full command reference, including `--from`, `--force`, `--print-env`, and where files are stored on disk.

## Desktop app

```bash
cd packages/desktop
npm install
npm start
```

See [`packages/desktop/README.md`](packages/desktop/README.md).

## Development

This repo uses npm workspaces, so a single install at the root wires up all three packages (the desktop app depends on the local `claudeswitch` CLI package via workspace linking):

```bash
npm install
npm run cli -- list          # run the CLI from source
npm run desktop              # launch the tray app from source
npm run landing              # run the landing page dev server
```

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

ClaudeSwitch never transmits credentials anywhere; it only copies files between local directories on the machine it runs on. That said, anyone with filesystem access to `~/.claudeswitch/accounts/` can read the saved credentials, the same as they could with `~/.claude` today. Treat that directory with the same care as your existing Claude Code config.

## License

[MIT](LICENSE). Not affiliated with or endorsed by Anthropic.
