// electron/main.js
const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,

    autoHideMenuBar: true,     // hide menu bar
    resizable: false,          // prevent resizing
    minimizable: false,        // prevent minimize
    maximizable: false,        // prevent maximize button

    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Maximize window but keep taskbar visible
  win.maximize();

  // Remove application menu
  win.removeMenu();

  // Load Vite dev server
  win.loadURL("http://localhost:5173");

  // Optional: open DevTools
  // win.webContents.openDevTools();
}

// App ready
app.whenReady().then(createWindow);

// Quit app when all windows closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// macOS behavior: re-open window if dock icon clicked
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});