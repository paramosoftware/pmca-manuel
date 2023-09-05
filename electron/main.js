const { app, BrowserWindow, protocol, net: electronNet } = require('electron')
const { pathToFileURL } = require('url');
const net = require('net');
const fs = require('fs');
const path = require('path');


const isProduction = process.env.NODE_ENV !== 'development';
const userDataPath = app.getPath('userData');
process.env.USER_DATA_PATH = userDataPath;

isProduction ?
  process.env.ROOT = path.join(process.resourcesPath) :
  process.env.ROOT = path.resolve(__dirname, "../")


if (isProduction) {
  moveDatabaseFile();
  moveMediaFolder();
  assignPort();

  process.env.NUXT_PUBLIC_BASE_URL = "http://localhost:" + process.env.PORT;
}

assignEnvsFromFile();


protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      bypassCSP: true
    }
  }
])

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

app.whenReady().then(async () => {

  protocol.handle('app', (request) => {
    const filePath = request.url.slice('app://'.length);
    const file = path.join(userDataPath, filePath);
    const fileUrl = pathToFileURL(file).href;

    return electronNet.fetch(fileUrl);
  })
    
  if (isProduction) {
    await startWebServer();
  }

  const win = createWindow();

  if (!isProduction) {
    win.webContents.openDevTools();
  }

  win.loadURL(process.env.NUXT_PUBLIC_BASE_URL)

  win.once('ready-to-show', () => {
    win.maximize();
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith(process.env.NUXT_PUBLIC_BASE_URL)) {
        return { action: 'allow' };
      }
      
      require('electron').shell.openExternal(url);
      return { action: 'deny' };
  });

})

app.on('second-instance', () => {
  const openedWindow = BrowserWindow.getAllWindows()[0];

  if (openedWindow.isMinimized()) {
    openedWindow.restore();
  }

  openedWindow.focus();
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
})

function moveDatabaseFile() {
  if (!isProduction) {
    return;
  }

  const databasePath = path.join(process.env.ROOT, 'server/prisma/app.sqlite');
  const userDatabasePath = path.join(userDataPath, 'app.sqlite');

  if (app.isPackaged) {
    if (!fs.existsSync(userDatabasePath)) {
      fs.copyFileSync(databasePath, userDatabasePath);
      fs.unlinkSync(databasePath);
    }
  
  }

  process.env.DATABASE_URL = "file:" + userDatabasePath;
}


// TODO: while there is no import/export feature
function moveMediaFolder() {
  if (!isProduction) {
    return;
  }

  const mediaPath = path.join(process.env.ROOT, '.output/public/media');
  const userMediaPath = path.join(process.env.USER_DATA_PATH, 'media');

  if (app.isPackaged) {
    if (!fs.existsSync(userMediaPath) && fs.existsSync(mediaPath)) {

      fs.mkdirSync(userMediaPath);

      fs.readdirSync(mediaPath).forEach((file) => {
        fs.copyFileSync(path.join(mediaPath, file), path.join(userMediaPath, file));
      });

    }
  }
}





async function assignPort(port = 3458) {
  const server = net.createServer();

  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      assignPort(port + 1);
    }
  });

  server.once('listening', () => {
    server.close();
  });

  server.listen(port);
  server.unref();

  process.env.PORT = port;
}

function assignEnvsFromFile() {
  let envPath;

  if (isProduction) {
    envPath = path.join(userDataPath, '.env');
  } else {
    envPath = path.join(process.env.ROOT, '.env');
  }

  if (!fs.existsSync(envPath) && app.isPackaged) {
    generateEnvFile();
  }

  const env = fs.readFileSync(envPath, 'utf8');

  env.split('\n').forEach((line) => {
    const [key, value] = line.split('=');

    process.env[key] = value;
  });
}

function generateEnvFile() {
  const crypto = require('crypto');

  const env = {
    APP_NAME: 'Glossário de conservação-restauro de livros e documentos',
    APP_DESCRIPTION: '',
    ACCESS_TOKEN_SECRET: crypto.randomBytes(64).toString('hex'),
    REFRESH_TOKEN_SECRET: crypto.randomBytes(64).toString('hex'),
    AUTH_SECRET: crypto.randomBytes(64).toString('hex'),
  }

  fs.writeFileSync(
    path.join(userDataPath, '.env'),
    Object.entries(env).map(([key, value]) => `${key}=${value}`).join('\n')
  );

  for (const [key, value] of Object.entries(env)) {
    process.env[key] = value;
  }
}

async function startWebServer() {
  const serverPath = path.join(process.env.ROOT, '.output/server/index.mjs');
  const serverUrl = pathToFileURL(serverPath).href;
  const { default: startServer } = await import(serverUrl);

  if (typeof startServer === 'function') {
    startServer();
  }
}

function createWindow () {
    const win = new BrowserWindow({
      show: false,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      autoHideMenuBar: true,
      title: process.env.APP_NAME,
      icon: path.join(process.env.ROOT, '.output/public/favicon.ico'),
    })
    
    return win;
}
