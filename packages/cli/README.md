# claudeswitch

Save multiple [Claude Code](https://docs.claude.com/claude-code) accounts (personal, work, a friend's, etc.) and switch between them instantly — no logging out, no re-entering an OTP.

## How it works

Claude Code reads its credentials and settings from a config directory, normally `~/.claude`, or wherever the `CLAUDE_CONFIG_DIR` environment variable points. `claudeswitch` copies that directory into its own per-account folder (`~/.claudeswitch/accounts/<name>/`) and, when you switch, launches `claude` with `CLAUDE_CONFIG_DIR` pointed at the saved folder for that account.

Everything stays on your machine — `claudeswitch` never talks to a network of its own, it only copies files locally.

## Install

```bash
npm install -g claudeswitch
```

## Usage

```bash
# Log into Claude Code normally, then snapshot that session:
claude login
claudeswitch add --name personal

# Log into a different account, save it under another name:
claude login
claudeswitch add --name work

# See what you've saved:
claudeswitch list

# Switch — this launches `claude` with that account's credentials:
claudeswitch use work

# Remove an account you no longer need:
claudeswitch remove work
```

### Commands

| Command | Description |
| --- | --- |
| `claudeswitch add --name <alias>` | Save the currently logged-in Claude Code account under `<alias>`. Add `--from <dir>` to copy a specific config directory instead of the active one, or `--force` to overwrite without prompting. |
| `claudeswitch use <alias>` | Point `CLAUDE_CONFIG_DIR` at the saved account and launch `claude`. Anything after `use <alias>` is forwarded to `claude` as arguments. |
| `claudeswitch list` (alias `ls`) | List saved accounts; the active one (as last set by `use`) is marked with `*`. |
| `claudeswitch remove <alias>` (alias `rm`) | Delete a saved account's folder and its entry. Prompts for confirmation unless `-y`/`--yes` is passed. |
| `claudeswitch current` | Print the name of the account last switched to. |

### Using it in your current shell instead of a subprocess

`claudeswitch use <alias>` spawns `claude` as a child process. If you'd rather keep using `claude` directly in your current shell, print the env var instead and eval it:

```bash
# bash/zsh
eval "$(claudeswitch use personal --print-env)"

# PowerShell — copy the printed value manually, or wrap similarly in your profile
claudeswitch use personal --print-env
```

## Where things are stored

```
~/.claudeswitch/
├── accounts.json          # metadata: names, paths, current account
└── accounts/
    ├── personal/          # full copy of that account's CLAUDE_CONFIG_DIR
    └── work/
```

## License

MIT
