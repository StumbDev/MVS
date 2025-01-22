import { app, BrowserWindow, Menu, dialog, Tray } from 'electron';
import path from 'path';
import started from 'electron-squirrel-startup';
import fs from 'fs'; // For file handling

let tray = null;
app.whenReady().then(() => {
  tray = new Tray(path.join(__dirname, 'icon.png'));
  tray.setToolTip('Click here');
  tray.on('click', () => {
    console.log('Tray clicked');
  });
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    icon: path.join(__dirname, '../icon.ico'),
    autoHideMenuBar: true,
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Create the menu bar
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Open',
          click: async () => {
            const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [{ name: 'All Files', extensions: ['*'] }],
            });
            if (!canceled && filePaths.length > 0) {
              fs.readFile(filePaths[0], 'utf-8', (err, data) => {
                if (err) {
                  dialog.showErrorBox('File Open Error', `Could not open file: ${err.message}`);
                  return;
                }
                mainWindow.webContents.send('file-opened', data);
              });
            }
          },
        },
        {
          label: 'Save As',
          click: async () => {
            const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
              title: 'Save File',
              filters: [{ name: 'All Files', extensions: ['*'] }],
            });
            if (!canceled && filePath) {
              mainWindow.webContents.send('save-file', filePath);
            }
          },
        },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' },
      ],
    },
    {
      label: 'Language',
      submenu: [
        {
          label: 'JavaScript',
          click: () => mainWindow.webContents.send('change-programming-language', 'javascript'),
        },
        {
          label: 'Python',
          click: () => mainWindow.webContents.send('change-programming-language', 'python'),
        },
        {
          label: 'C++',
          click: () => mainWindow.webContents.send('change-programming-language', 'cpp'),
        },
        {
          label: 'HTML',
          click: () => mainWindow.webContents.send('change-programming-language', 'html'),
        },
        {
          label: 'CSS',
          click: () => mainWindow.webContents.send('change-programming-language', 'css'),
        },
      ],
    },
  ]);

  Menu.setApplicationMenu(menu);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
