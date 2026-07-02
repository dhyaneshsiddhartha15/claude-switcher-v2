const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('claudeswitch', {
  // Account switcher popup
  listAccounts: () => ipcRenderer.invoke('claudeswitch:list-accounts'),
  switchAccount: (name) => ipcRenderer.invoke('claudeswitch:switch-account', name),
  removeAccount: (name) => ipcRenderer.invoke('claudeswitch:remove-account', name),
  addAccount: (name) => ipcRenderer.invoke('claudeswitch:add-account', name),
  openAddPrompt: () => ipcRenderer.invoke('claudeswitch:open-add-prompt'),
  hidePopup: () => ipcRenderer.invoke('claudeswitch:hide-popup'),
  quit: () => ipcRenderer.invoke('claudeswitch:quit'),
  // Popup re-fetches whenever it is shown
  onRefresh: (cb) => ipcRenderer.on('claudeswitch:refresh', cb),
});
