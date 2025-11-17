// const { app, BrowserWindow } = require('electron');
// const path = require('node:path');
// const crypto = require('node:crypto')
// const { ipcMain } = require('electron');
// const ListenerFunc = require('./peerNode/node')

import {app, BrowserWindow} from 'electron'
import path from 'node:path';
import crypto from "node:crypto"
import { ipcMain } from 'electron';
import { multiaddr } from '@multiformats/multiaddr'
// import ListenerFunc from './peerNode/node.js';
import P2PListener from './peerNode/node.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);  // Current file's URL
const __dirname = dirname(__filename); 
// const Store = require('electron-store');

// const schema = {
// 	user: {
// 		type: 'object',
//     properties:{
//       name: {type: 'string'},

//     }
// 	},
// 	friends: {
// 		type: 'array',
// 		items:{
//       type:'object',
//       properties:{
//         name:{type:'string'}
//       }
//     }
// 	}
// };
// const store = new Store(schema);


let DEVMODE = "true"
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// if (require('electron-squirrel-startup')) {
//   app.quit();
// }

function generateKeyPairs() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki', // Public key format
      format: 'pem', // PEM format
    },
    privateKeyEncoding: {
      type: 'pkcs8', // Private key format
      format: 'pem', // PEM format
    },
  });
  // console.log(privateKey)
  return { publicKey, privateKey };
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 980,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });


 if(DEVMODE == "true"){
  mainWindow.loadURL("http://localhost:5173")
 }else{
    // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
 }
  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle("generateKeyPairs",(event, message)=>{
  console.log('ipcRenderer worked')  
  const data =  generateKeyPairs();
  console.log(data)
  if(data) return JSON.stringify(data);
  else null
  // event.sender.send('recieveKeyPairs', { keyPair: data });
})

ipcMain.handle('get-variable', (event) => {
  return { someVariable: 'Hello from main process' }; // Example data
});

ipcMain.handle('get-friendlist', (event) => {
  return { show: 'friendlist' }; // Example data
});
const startListener = async () => {
  const listener = new P2PListener();
   await listener.start()
  try {
    let friendAddr= [multiaddr('/ip4/127.0.0.1/tcp/61263/ws/p2p/12D3KooWLVc5DFYdRpBsVN4JKQn8BCXyAu6S6zUdKYYU1kVWJAbn/p2p-circuit/webrtc/p2p/12D3KooWNccPjdGaQhufuKShJYreVBPq9frCSB8UKr7De2Wd5Wzf')]

   await listener.dialFriend(friendAddr)
    await listener.sendMessage(friendAddr, 4)
    console.log('Listener started:', listener);

    // Use the listener for whatever you need
    // listener.startNode();  // If the listener object has a start method
  } catch (error) {
    console.error('Error starting listener:', error);
  }
};

startListener();
// console.log(typeof(Listener.startNode))
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
