// main.js
const { app, BrowserWindow, session } = require('electron'); // <-- Ensure 'session' is imported here
const path = require('node:path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      // Consider adding nodeIntegration and contextIsolation based on your preload usage
      // nodeIntegration: false,
      // contextIsolation: true, // Recommended for security
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // --- ADD THIS BLOCK TO ENFORCE CSP DIRECTLY IN MAIN PROCESS ---
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const cspValue = "default-src 'self'; img-src 'self' data: https://*.tile.openstreetmap.org https://unpkg.com; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-eval'; connect-src 'self' https://localhost:7063;";

    // This will replace any existing Content-Security-Policy header
    // from the dev server or meta tag.
    details.responseHeaders['Content-Security-Policy'] = [cspValue];

    callback({ cancel: false, responseHeaders: details.responseHeaders });
  });
  // ---------------------------------------------------------------

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

app.on('web-contents-created', (_, contents) => {
  contents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'geolocation') {
      callback(true); // allow geolocation
    } else {
      callback(false);
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