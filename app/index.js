'use strict';
const electron = require('electron')
const app = electron.app
const ipc = electron.ipcMain
const ipcRenderer = electron
const globalShortcut = electron.globalShortcut

require('electron-debug')()

// prevent window being garbage collected
let mainWindow, win;

function onClosed() {
	mainWindow = null;
}

function createMainWindow() {
	win = new electron.BrowserWindow({
		width: 1000,
		height: 600,
    minWidth: 800,
    frame: false,
    icon: 'assets/images/app-icon/main_tray.png'
	});
	win.loadURL(`file://${__dirname}/views/index.html`);

  // Global Shortcut for Playing Next song
  globalShortcut.register('CommandOrControl+Alt+Right', ()=>{
    win.webContents.send( 'playNext' );
  })
  globalShortcut.register('MediaNextTrack', ()=>{
    win.webContents.send( 'playNext' );
  })

  // Global Shortcut for Playing Previous song
  globalShortcut.register('CommandOrControl+Alt+Left', ()=>{
    win.webContents.send( 'playPrevious' );
  })
  globalShortcut.register('MediaPreviousTrack', ()=>{
    win.webContents.send( 'playPrevious' );
  })

  // Global Shortcut for Playing/Pausing song
  globalShortcut.register('CommandOrControl+Alt+Space', ()=>{
    win.webContents.send( 'pause' );
  })
  globalShortcut.register('MediaPlayPause', ()=>{
    win.webContents.send( 'pause' );
  })

  // Global Shortcut for Reducing Volume
  globalShortcut.register('CommandOrControl+Alt+Up', ()=>{
    win.webContents.send( 'volumeUp' );
  })
  // globalShortcut.register('VolumeUp', ()=>{
  //   win.webContents.send( 'volumeUp' );
  // })

  // Global Shortcut for Increasing Volume
  globalShortcut.register('CommandOrControl+Alt+Down', ()=>{
    win.webContents.send( 'volumeDown' );
  })
  // globalShortcut.register('VolumeDown', ()=>{
  //   win.webContents.send( 'volumeDown' );
  // })


  // Listening for window minimize event call
  ipc.on('minimize', ()=>{
    win.minimize()
  })

  // Listening for window maximize event call
  ipc.on('maximize', ()=>{
    win.maximize()
  })

  // Listening for window unmaximize event call
  ipc.on('unmaximize', ()=>{
    win.unmaximize()
  })

  // Listening for window close event call
  ipc.on('close', ()=>{
    win.close()
  })

	win.on('closed', onClosed);

	return win;
}

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

app.on('ready', () => {
	mainWindow = createMainWindow();
});
