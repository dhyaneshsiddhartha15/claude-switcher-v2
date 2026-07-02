# Contributing to ClaudeSwitch

Thanks for considering a contribution! This is a small monorepo — most changes will touch exactly one workspace.

## Setup

```bash
git clone https://github.com/claudeswitch/claudeswitch.git
cd claudeswitch
npm install
```

## Project layout

- `packages/cli` — the published `claudeswitch` npm package. Plain Node.js, no build step.
- `packages/desktop` — Electron tray app, depends on `packages/cli` via a workspace link.
- `apps/landing` — Next.js landing page.

## Workflow

1. Fork the repo and create a branch off `main`.
2. Make your change. Keep pull requests focused — one concern per PR.
3. If you touch `packages/cli`, run it manually against a throwaway `CLAUDE_CONFIG_DIR` to confirm `add`, `use`, `list`, and `remove` still behave (there's no mock Claude Code install, so exercise the real commands):
   ```bash
   export CLAUDE_CONFIG_DIR=/tmp/fake-claude-config
   mkdir -p "$CLAUDE_CONFIG_DIR" && echo '{}' > "$CLAUDE_CONFIG_DIR/credentials.json"
   node packages/cli/bin/claudeswitch.js add --name test
   node packages/cli/bin/claudeswitch.js list
   ```
4. Open a pull request describing what changed and why.

## Reporting bugs / requesting features

Open a GitHub issue. Include your OS, Node version, and (for CLI bugs) the exact command and output.

## Code style

Keep it simple — no new dependencies unless they solve a real problem. Match the existing formatting (2-space indent, semicolons, `const`/`let`).

## License

By contributing, you agree your contributions are licensed under the project's [MIT license](LICENSE).
