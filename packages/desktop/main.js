const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const { app, Tray, Menu, BrowserWindow, ipcMain, dialog, nativeImage, screen } = require('electron');
const { config } = require('claude-multi-account');

let tray = null;
let popupWindow = null;
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

function getAccounts() {
  const state = config.loadState();
  const names = Object.keys(state.accounts).sort();
  return {
    current: state.current,
    accounts: names.map((name) => ({
      name,
      active: name === state.current,
      path: state.accounts[name].path,
    })),
  };
}

function switchToAccount(name) {
  const state = config.loadState();
  const account = state.accounts[name];
  if (!account || !fs.existsSync(account.path)) {
    dialog.showErrorBox('ClaudeSwitch', `Account "${name}" is missing or was deleted.`);
    return false;
  }
  state.current = name;
  config.saveState(state);
  launchTerminalWithAccount(account.path);
  refreshUi();
  return true;
}

function removeAccount(name) {
  const state = config.loadState();
  if (!state.accounts[name]) return false;

  const choice = dialog.showMessageBoxSync({
    type: 'question',
    buttons: ['Cancel', 'Remove'],
    defaultId: 0,
    cancelId: 0,
    title: 'Remove account',
    message: `Remove "${name}" and delete its stored credentials? This cannot be undone.`,
  });
  if (choice !== 1) return false;

  fs.rmSync(state.accounts[name].path, { recursive: true, force: true });
  delete state.accounts[name];
  if (state.current === name) state.current = null;
  config.saveState(state);
  refreshUi();
  return true;
}

function saveCurrentSessionAs(name) {
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
  refreshUi();
  return { ok: true };
}

// ---------- Windows ----------

function createPopupWindow() {
  popupWindow = new BrowserWindow({
    width: 320,
    height: 440,
    show: false,
    frame: false,
    resizable: false,
    movable: false,
    fullscreenable: false,
    skipTaskbar: true,
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });
  popupWindow.setMenuBarVisibility(false);
  popupWindow.loadFile(path.join(__dirname, 'popup.html'));

  // Hide when it loses focus so it behaves like a real tray dropdown.
  popupWindow.on('blur', () => {
    if (popupWindow && !popupWindow.webContents.isDevToolsFocused()) {
      popupWindow.hide();
    }
  });
}

function positionPopupNearTray() {
  if (!popupWindow || !tray) return;
  const { width, height } = popupWindow.getBounds();
  const trayBounds = tray.getBounds();
  const display = screen.getDisplayNearestPoint(
    trayBounds && trayBounds.width
      ? { x: trayBounds.x, y: trayBounds.y }
      : screen.getCursorScreenPoint()
  );
  const area = display.workArea;

  let x;
  let y;
  if (trayBounds && trayBounds.width) {
    // macOS / Windows: anchor to the tray icon.
    x = Math.round(trayBounds.x + trayBounds.width / 2 - width / 2);
    y = process.platform === 'darwin'
      ? Math.round(trayBounds.y + trayBounds.height + 4)
      : Math.round(trayBounds.y - height - 4);
  } else {
    // Linux and other cases where tray bounds are unreliable: top-right corner.
    x = area.x + area.width - width - 12;
    y = area.y + 12;
  }

  // Clamp inside the visible work area.
  x = Math.max(area.x + 8, Math.min(x, area.x + area.width - width - 8));
  y = Math.max(area.y + 8, Math.min(y, area.y + area.height - height - 8));
  popupWindow.setPosition(x, y, false);
}

function togglePopup() {
  if (!popupWindow) createPopupWindow();
  if (popupWindow.isVisible()) {
    popupWindow.hide();
    return;
  }
  positionPopupNearTray();
  popupWindow.webContents.send('claudeswitch:refresh');
  popupWindow.show();
  popupWindow.focus();
}

function openAddAccountPrompt() {
  if (promptWindow) {
    promptWindow.focus();
    return;
  }

  promptWindow = new BrowserWindow({
    width: 360,
    height: 220,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    resizable: false,
    minimizable: false,
    maximizable: false,
    skipTaskbar: true,
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

function refreshUi() {
  buildTrayMenu();
  if (popupWindow && popupWindow.isVisible()) {
    popupWindow.webContents.send('claudeswitch:refresh');
  }
}

// ---------- IPC ----------

ipcMain.handle('claudeswitch:list-accounts', () => getAccounts());
ipcMain.handle('claudeswitch:switch-account', (_e, name) => {
  const ok = switchToAccount(name);
  if (ok && popupWindow) popupWindow.hide();
  return { ok };
});
ipcMain.handle('claudeswitch:remove-account', (_e, name) => ({ ok: removeAccount(name) }));
ipcMain.handle('claudeswitch:add-account', (_e, name) => saveCurrentSessionAs(name));
ipcMain.handle('claudeswitch:open-add-prompt', () => {
  if (popupWindow) popupWindow.hide();
  openAddAccountPrompt();
});
ipcMain.handle('claudeswitch:hide-popup', () => {
  if (popupWindow) popupWindow.hide();
});
ipcMain.handle('claudeswitch:quit', () => app.quit());

// Right-click still gets a native menu as a reliable fallback.
function buildTrayMenu() {
  const state = config.loadState();
  tray.setToolTip(state.current ? `ClaudeSwitch — ${state.current}` : 'ClaudeSwitch');
}

function buildTrayContextMenu() {
  return Menu.buildFromTemplate([
    { label: 'Open switcher', click: togglePopup },
    { label: 'Add current session as...', click: openAddAccountPrompt },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]);
}

app.whenReady().then(() => {
  const icon = nativeImage.createFromPath(path.join(__dirname, 'assets', 'tray-icon.png'));
  tray = new Tray(icon);
  createPopupWindow();
  buildTrayMenu();

  // Left-click toggles the glass popup; right-click shows the fallback menu.
  tray.on('click', togglePopup);
  tray.on('right-click', () => tray.popUpContextMenu(buildTrayContextMenu()));

  if (process.platform === 'darwin') {
    app.dock.hide();
  }
});

app.on('window-all-closed', (event) => {
  // Keep running in the tray even when all windows are closed/hidden.
  event.preventDefault();
});
