const { app, BrowserWindow } = require('electron')
const path =  require('path')
const { pathToFileURL } = require('url');

const isProduction = process.env.NODE_ENV !== 'development';

isProduction ?
  process.env.ROOT = path.join(process.resourcesPath) :
  process.env.ROOT = path.resolve(__dirname, "../")


// TODO: Remove hardcoded values
process.env.IS_ELECTRON = true;
process.env.DATABASE_URL = "file:" + path.join(process.env.ROOT, 'server/prisma/app.sqlite');
process.env.NUXT_PUBLIC_BASE_URL = "http://localhost:3000";
process.env.ACCESS_TOKEN_SECRET= "SECRET123";
process.env.REFRESH_TOKEN_SECRET = "SECRET123";
process.env.AUTH_SECRET = "SECRET123";


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
    win.loadURL('http://localhost:3000')
}


app.whenReady().then(async () => {
  await startWebServer();
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
