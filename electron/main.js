const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

// 设置VITE_DEV_SERVER_URL环境变量，防止Vite自动打开浏览器
if (isDev) {
  process.env.VITE_DEV_SERVER_URL = 'http://localhost:5173';
}

let mainWindow = null;

function createWindow() {
  // 如果窗口已存在，则不创建新窗口
  if (mainWindow) {
    return;
  }

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    center: true,
    resizable: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // 监听窗口关闭事件，清除窗口引用
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 根据开发环境或生产环境加载不同的URL
  if (isDev) {
    // 在开发环境中，等待一段时间确保开发服务器已启动
    setTimeout(() => {
      if (mainWindow) {
        mainWindow.loadURL('http://localhost:5173').catch(() => {
          console.log('Failed to load dev server, retrying...');
        });
      }
    }, 2000);
  } else {
    // 在生产环境中，加载打包后的文件
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html')).catch((err) => {
      console.error('Failed to load app:', err);
    });
  }

  // 禁用默认打开开发者工具的行为
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.key.toLowerCase() === 'i') {
      event.preventDefault();
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});