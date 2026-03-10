const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,

    autoHideMenuBar: false,  // show menu bar
    kiosk:true,
    resizable: false,
    minimizable: false,
    maximizable: false,

    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.maximize();

  win.loadURL("http://localhost:5173");

  // MENU TEMPLATE
  const menuTemplate = [
    {
      label: "File",
      submenu: [
        {
          label: "Reload",
          click: () => win.reload(),
        },
        {
          label: "Exit",
          click: () => app.quit(),
        },
      ],
    },
    {
      label: "View",
      submenu: [
        {
          label: "Toggle DevTools",
          click: () => win.webContents.toggleDevTools(),
        },
        {
          label: "Fullscreen",
          click: () => win.setFullScreen(!win.isFullScreen()),
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});