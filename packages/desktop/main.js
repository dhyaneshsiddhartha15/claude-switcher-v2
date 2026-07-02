const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const fs = require('fs');
const { app, Tray, Menu, BrowserWindow, ipcMain, dialog, nativeImage } = require('electron');
const { config } = require('claudeswitch');

let tray = null;
let promptWindow = null;

function launchTerminalWithAccount(accountPath) {
  const env = { ...process.env, CLAUDE_CONFIG_DIR: accountPath };

  if (process.platform === 'win32') {
    spawn('cmd.exe', ['/c', 'start', '""', 'cmd', '/k', `set "CLAUDE_CONFIG_DIR=${accountPath}" && claude`], {
      env,
      shell: true,
      detached: true,
      stdio: 'ignore',
    }).unref();
    return;
  }

  if (process.platform === 'darwin') {
    const escapedPath = accountPath.replace(/"/g, '\\"');
    const script = `tell application "Terminal" to do script "export CLAUDE_CONFIG_DIR=\\"${escapedPath}\\"; claude"`;
    spawn('osascript', ['-e', script], { detached: true, stdio: 'ignore' }).unref();
    return;
  }

  // Linux: best-effort across common terminal emulators.
  const candidates = [
    ['x-terminal-emulator', ['-e', 'bash', '-c', `CLAUDE_CONFIG_DIR="${accountPath}" claude; exec bash`]],
    ['gnome-terminal', ['--', 'bash', '-c', `CLAUDE_CONFIG_DIR="${accountPath}" claude; exec bash`]],
    ['xterm', ['-e', `CLAUDE_CONFIG_DIR="${accountPath}" claude`]],
  ];
  for (const [cmd, args] of candidates) {
    try {
      spawn(cmd, args, { env, detached: true, stdio: 'ignore' }).unref();
      return;
    } catch {
      continue;
    }
  }
  dialog.showErrorBox('ClaudeSwitch', 'Could not find a terminal emulator to launch. Install x-terminal-emulator, gnome-terminal, or xterm.');
}

function switchToAccount(name) {
  const state = config.loadState();
  const account = state.accounts[name];
  if (!account || !fs.existsSync(account.path)) {
    dialog.showErrorBox('ClaudeSwitch', `Account "${name}" is missing or was deleted.`);
    return;
  }
  state.current = name;
  config.saveState(state);
  launchTerminalWithAccount(account.path);
  buildTrayMenu();
}

function removeAccount(name) {
  const state = config.loadState();
  if (!state.accounts[name]) return;

  const choice = dialog.showMessageBoxSync({
    type: 'question',
    buttons: ['Cancel', 'Remove'],
    defaultId: 0,
    cancelId: 0,
    title: 'Remove account',
    message: `Remove "${name}" and delete its stored credentials? This cannot be undone.`,
  });
  if (choice !== 1) return;

  fs.rmSync(state.accounts[name].path, { recursive: true, force: true });
  delete state.accounts[name];
  if (state.current === name) state.current = null;
  config.saveState(state);
  buildTrayMenu();
}

function openAddAccountPrompt() {
  if (promptWindow) {
    promptWindow.focus();
    return;
  }

  promptWindow = new BrowserWindow({
    width: 360,
    height: 180,
    resizable: false,
    minimizable: false,
    maximizable: false,
    title: 'Add ClaudeSwitch account',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });
  promptWindow.setMenuBarVisibility(false);
  promptWindow.loadFile(path.join(__dirname, 'prompt.html'));
  promptWindow.on('closed', () => {
    promptWindow = null;
  });
}

ipcMain.handle('claudeswitch:add-account', (_event, name) => {
  const trimmed = (name || '').trim();
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { ok: false, error: 'Use only letters, numbers, "-" and "_".' };
  }

  const sourceDir = config.defaultClaudeConfigDir();
  if (!fs.existsSync(sourceDir)) {
    return { ok: false, error: `No Claude Code config found at ${sourceDir}. Log in with "claude" first.` };
  }

  const state = config.loadState();
  const dest = config.accountDir(trimmed);

  fs.rmSync(dest, { recursive: true, force: true });
  fs.cpSync(sourceDir, dest, { recursive: true, dereference: true });

  state.accounts[trimmed] = {
    name: trimmed,
    path: dest,
    createdAt: state.accounts[trimmed]?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  config.saveState(state);
  buildTrayMenu();

  return { ok: true };
});

function buildTrayMenu() {
  const state = config.loadState();
  const names = Object.keys(state.accounts).sort();

  const accountItems = names.length
    ? names.map((name) => ({
        label: name === state.current ? `✓ ${name}` : `   ${name}`,
        submenu: [
          { label: 'Switch to this account', click: () => switchToAccount(name) },
          { label: 'Remove...', click: () => removeAccount(name) },
        ],
      }))
    : [{ label: 'No accounts saved yet', enabled: false }];

  const menu = Menu.buildFromTemplate([
    { label: 'ClaudeSwitch', enabled: false },
    { type: 'separator' },
    ...accountItems,
    { type: 'separator' },
    { label: 'Add current session as...', click: openAddAccountPrompt },
    { label: 'Refresh', click: buildTrayMenu },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]);

  tray.setContextMenu(menu);
  tray.setToolTip(state.current ? `ClaudeSwitch — ${state.current}` : 'ClaudeSwitch');
}

app.whenReady().then(() => {
  const icon = nativeImage.createFromPath(path.join(__dirname, 'assets', 'tray-icon.png'));
  tray = new Tray(icon);
  buildTrayMenu();

  if (process.platform === 'darwin') {
    app.dock.hide();
  }
});

app.on('window-all-closed', (event) => {
  // Keep running in the tray even when the add-account window closes.
  event.preventDefault();
});
