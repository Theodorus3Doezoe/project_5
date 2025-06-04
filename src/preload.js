// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');


contextBridge.exposeInMainWorld('electronAPI', {
  saveCoordinates: (coords) => ipcRenderer.invoke('save-coordinates', coords),
  getCoordinates: () => ipcRenderer.invoke('get-coordinates'),
  getIPInfo: () => ipcRenderer.invoke('get-ip-info'),
});