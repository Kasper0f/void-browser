const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0d0d0f',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true,
    },
    icon: path.join(__dirname, 'icon.png'),
  });

  mainWindow.loadFile('index.html');

  // Allow webview to open new windows as new tabs
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    mainWindow.webContents.send('open-tab', url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();

  // Block ads/trackers
  session.defaultSession.webRequest.onBeforeRequest({ urls: ['*://*/*'] }, (details, callback) => {
    const adPatterns = [
      /googlesyndication\.com/,
      /doubleclick\.net/,
      /adservice\.google\./,
      /ads\.yahoo\.com/,
      /tracking\./,
      /analytics\./,
      /pixel\./,
    ];
    const blocked = adPatterns.some(p => p.test(details.url));
    callback({ cancel: blocked });
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('minimize-window', () => mainWindow.minimize());
ipcMain.on('maximize-window', () => {
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});
ipcMain.on('close-window', () => mainWindow.close());
