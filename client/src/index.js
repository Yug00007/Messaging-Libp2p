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
import Store from 'electron-store'
import { fromString } from 'uint8arrays';

const __filename = fileURLToPath(import.meta.url);  // Current file's URL
const __dirname = dirname(__filename); 
// let friendList =[];
import Gun from 'gun';
const gun = new Gun({peers: ['http://localhost:8100:/gun']});
// const Store = require('electron-store');

// let GlobalNode;
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
 return mainWindow
};


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
let friendList;
let store;
let GlobalNodePromise;
var listener
let mainProcess
app.whenReady().then(async() => {
 mainProcess= createWindow();
  store = new Store();
  await store.set('friendList', ['duck'])
  friendList = await store.get('friendList', friendList) || [];
  
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
   await startListener(mainProcess);
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
  mainProcess.webContents.send('test', 'Works')
  if(data) return JSON.stringify(data);
  else null
  // event.sender.send('recieveKeyPairs', { keyPair: data });
})

ipcMain.handle('get-variable', (event) => {
  return { someVariable: 'Hello from main process' }; // random test data
});
ipcMain.handle('add-friend', (event,message)=>{
  friendList.push(message.username)
  store.set('friendList', friendList)
  return;
})
ipcMain.handle('get-friendlist', (event) => {
  return friendList; // friendlist data in RAM
});
ipcMain.handle('send-message', async(event,friend, message) => {
    let friendAddr;
   gun.get("users").get(friend).once((data)=>{
    console.log(data)
   friendAddr= multiaddr(data)
  //  return friendAddr
  })
  // const GlobalNode =  GlobalNodePromise
  await listener.sendMsg(friendAddr, message);
//  await GlobalNode.listenForResponses()
  return;
});
ipcMain.handle('start-node',async(event)=>{
  try {
    await startListener(mainProcess);
    return 'Success';
  } catch (error) {
    console.log('IpcHandler gave error at Start-node',error);
    return 'Failed';
  }
})

const startListener = async (mainProcess) => {
   listener = new P2PListener('meow1', [multiaddr('/ip4/127.0.0.1/tcp/56188/ws/p2p/12D3KooWBDP72qbrrNE3wi4exAMwwkfztd8RuBXQWmhPHCKPGsB6')]);
  
  let friendAddr;
   gun.get("users").get("meow").once((data)=>{
    console.log(data)
   friendAddr= multiaddr(data)
    // return data
  })
   await listener.start(mainProcess)
  
  try {
    // let friendAddr= [multiaddr('/ip4/127.0.0.1/tcp/13317/ws/p2p/12D3KooWQzarvF9AYwJUGfL4jx3iXoRyJHk3xtskXFMLCBM6HX2T/p2p-circuit/webrtc/p2p/12D3KooWAktrVp16UxJuPA4MCYPaVyuZuV7bTTZTxWw663QBKfwr')]
  //   console.log(friendAddr)
  //  await listener.dialFriend(friendAddr)
    await listener.sendMsg(friendAddr, 4)
    
    // this thing is useless but purely for debugging later or super rare edge case
    mainProcess.webContents.once('did-finish-load', () => {
      console.log('mainProcess loaded');
      listener.listenForResponses(mainProcess);
    });

   
    // console.log('Listener started:', listener);

    //  return listener

    // Use the listener for whatever you need
    // listener.startNode();  // If the listener object has a start method
  } catch (error) {
    console.error('Error starting listener:', error);
  }
};

// GlobalNode = await startListener();
// console.log(typeof(Listener.startNode))
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
