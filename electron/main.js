const { app, BrowserWindow } = require('electron')
const path =  require('path')
const { pathToFileURL } = require('url');
const net = require('net');

const isProduction = process.env.NODE_ENV !== 'development';
const userPath = app.getPath('userData');

isProduction ?
  process.env.ROOT = path.join(process.resourcesPath) :
  process.env.ROOT = path.resolve(__dirname, "../")


if (isProduction) {
  moveDatabaseFile();
  assignPort();

  process.env.NUXT_PUBLIC_BASE_URL = "http://localhost:" + process.env.PORT;
}

assignEnvsFromFile();

app.whenReady().then(async () => {
  if (isProduction) {
    await startWebServer();
  }

  createWindow();
})


app.on('activate', function () {
    mainWindow.show()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
})


function moveDatabaseFile() {
  const fs = require('fs');
  const path = require('path');

  if (!isProduction) {
    return;
  }

  const databasePath = path.join(process.env.ROOT, 'server/prisma/app.sqlite');
  const userDatabasePath = path.join(userPath, 'app.sqlite');

  if (app.isPackaged) {
    if (!fs.existsSync(userDatabasePath)) {
      fs.copyFileSync(databasePath, userDatabasePath);
      fs.unlinkSync(databasePath);
    }
  
  }

  process.env.DATABASE_URL = "file:" + userDatabasePath;
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
  const fs = require('fs');
  const path = require('path');

  let envPath;

  if (isProduction) {
    envPath = path.join(userPath, '.env');
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
  const { writeFileSync } = require('fs');

  const accessTokenSecret = crypto.randomBytes(64).toString('hex');
  const refreshTokenSecret = crypto.randomBytes(64).toString('hex');
  const authSecret = crypto.randomBytes(64).toString('hex');

  writeFileSync(
    path.join(userPath, '.env'),
    `ACCESS_TOKEN_SECRET=${accessTokenSecret}\nREFRESH_TOKEN_SECRET=${refreshTokenSecret}\nAUTH_SECRET=${authSecret}`
  );

  process.env.ACCESS_TOKEN_SECRET = accessTokenSecret;
  process.env.REFRESH_TOKEN_SECRET = refreshTokenSecret;
  process.env.AUTH_SECRET = authSecret;
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
      backgroundColor: '#fff',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      autoHideMenuBar: true,
      title: 'Glossário de conservação-restauro de livros e documentos em papel',
      icon: path.join(process.env.ROOT, '.output/public/logo-pmca.png'),
    })

    win.maximize()

    if (!isProduction) {
      win.webContents.openDevTools();
    }

    win.loadURL(process.env.NUXT_PUBLIC_BASE_URL)
}
