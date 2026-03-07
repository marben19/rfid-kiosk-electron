// electron/main.js
const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    fullscreen: false,       // kiosk mode
    autoHideMenuBar: false,  // hide menu
    webPreferences: {
      nodeIntegration: true, // allow Node.js in renderer
      contextIsolation: false, 
      preload: path.join(__dirname, "preload.js") // optional
    },
  });

  // Load Vite dev server in dev mode
  win.loadURL("http://localhost:5173");

  // Optional: open DevTools
  // win.webContents.openDevTools();
}

// App ready
app.whenReady().then(createWindow);

// Quit app when all windows closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// macOS behavior: re-open window if dock icon clicked
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});