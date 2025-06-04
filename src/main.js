// main.js
const { app, BrowserWindow, session } = require('electron'); // <-- Ensure 'session' is imported here
const path = require('node:path');
const Database = require('better-sqlite3');
const { ipcMain } = require('electron');

const dbPath = path.join(app.getPath('userData'), 'database.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

db.prepare(`
  CREATE TABLE IF NOT EXISTS Positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    breedtegraad REAL,
    lengtegraad REAL,
    text TEXT
  )
`).run();
db.prepare(`
  CREATE TABLE IF NOT EXISTS EENHEDEN (
  ID INTEGER PRIMARY KEY AUTOINCREMENT
  )
  `).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS EENHEID (
  ID INTEGER PRIMARY KEY AUTOINCREMENT,
  EenhedenID INTERGER NOT NULL,
  FOREIGN KEY (EenhedenID) REFERENCES EENHEDEN(ID) ON DELETE CASCADE  
  )
  `).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS MODULE (
  ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Hartslag INTEGER,
  Zuurstof INTEGER,
  Temperatuur FLOAT, 
  EenheidID INTEGER NOT NULL,
  FOREIGN KEY (EenheidID) REFERENCES EENHEID(ID) ON DELETE CASCADE 
  )
  `).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS PADEN (
  ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Posities TEXT,
  StartDatumTijd DATETIME,
  ModuleID INTEGER NOT NULL,
  FOREIGN KEY (ModuleID) REFERENCES MODULE(ID) ON DELETE CASCADE 
  )
  `).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS WEERGEGEVENS (
  ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Tekst TEXT,
  Temperatuur FLOAT,
  Wind TEXT,
  Neerslag FLOAT,
  Zichtbaarheid INTEGER,
  Luchtvochtigheid INTEGER 
  )
  `).run();

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
    const cspValue = "default-src 'self'; img-src 'self' data: https://*.tile.openstreetmap.org https://unpkg.com https://server.arcgisonline.com; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-eval'; connect-src 'self' https://localhost:7063 https://ipapi.co;";

    // This will replace any existing Content-Security-Policy header
    // from the dev server or meta tag.
    details.responseHeaders['Content-Security-Policy'] = [cspValue];

    callback({ cancel: false, responseHeaders: details.responseHeaders });
  });
  // ---------------------------------------------------------------

};

ipcMain.handle('save-coordinates', (event, { lat, lng }) => {
  const statement = db.prepare('INSERT INTO Positions (breedtegraad, lengtegraad) VALUES (?, ?)');
  statement.run(lat, lng);
});

ipcMain.handle('get-coordinates', () => {
  const statement = db.prepare('SELECT breedtegraad, lengtegraad FROM Positions');
  return statement.all();
});
ipcMain.handle('get-ip-info', async () => {
  const response = await fetch('https://ipapi.co/json/');
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error fetching IP info: ${text}`);
  }

  const data = await response.json();
  return data;
});

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