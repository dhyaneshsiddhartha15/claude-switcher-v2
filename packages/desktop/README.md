# claudeswitch-desktop

An optional Electron system tray companion for [`claudeswitch`](../cli). It reads the same `~/.claudeswitch/accounts.json` the CLI uses, so accounts added from either one show up in both.

## Features

- Tray menu listing every saved account, with the active one checked.
- Click an account to launch a terminal with `claude` running under that account's config.
- "Add current session as..." saves whatever account is currently logged in under a new name.
- Remove accounts without touching the terminal.

## Develop

```bash
npm install
npm start
```

## Package installers

```bash
npm run dist
```

Uses [electron-builder](https://www.electron.build/) to produce a Windows NSIS installer, a macOS app, or a Linux AppImage depending on the host platform.

## Notes

- This app only manages *which* account's config directory Claude Code sees — it does not embed a terminal itself. Switching an account opens your OS's default terminal with `claude` already running.
- Credentials never leave your machine; the tray app reads/writes local files only.
