// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
// Preload (Isolated World)
const { contextBridge, ipcRenderer } = require('electron')

console.log('preload loaded here')
contextBridge.exposeInMainWorld('api',
  {
    getVariable: () => ipcRenderer.invoke('get-variable'),
    generateKeyPairs: (...args) => ipcRenderer.invoke('generateKeyPairs',...args),
    getFriendList: ()=> ipcRenderer.invoke('get-friendlist'),
    addFriend: ()=> ipcRenderer.invoke('add-friend', ...args),
    sendMessage: ()=> ipcRenderer.invoke('send-message', ...args),
    startNode: ()=> ipcRenderer.invoke('start-node'),
    onMessage: (channel, callback) => {
    ipcRenderer.on(channel, (event, data) => {
      callback(data);
    });
  },
  }
)
console.log('API exposed');