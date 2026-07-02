# claudeswitch-desktop

An optional Electron system tray companion for [`claudeswitch`](../cli). It reads the same `~/.claudeswitch/accounts.json` the CLI uses, so accounts added from either one show up in both.

## Features

- Left-click the tray icon to open a frosted-glass popup listing every saved account, with the active one marked by a green dot.
- Click an account to switch to it and launch a terminal with `claude` running under that account's config.
- "+ Add current session" saves whatever account is currently logged in under a new name.
- Remove an account inline from the popup, no terminal needed.
- Right-click the tray icon for a native fallback menu (open switcher, add session, quit).

The UI uses the same glassmorphism + claymorphism design as the landing page — frosted surfaces, soft pastel gradient-mesh background, and puffy clay buttons.

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
