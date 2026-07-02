const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('claudeswitch', {
  addAccount: (name) => ipcRenderer.invoke('claudeswitch:add-account', name),
});
