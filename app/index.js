'use strict';
const electron = require('electron')
const app = electron.app
const ipc = electron.ipcMain

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
