const { app, BrowserWindow, protocol, net: electronNet } = require('electron');
const { pathToFileURL } = require('url');
const net = require('net');
const fs = require('fs');
const path = require('path');

const isProduction = process.env.NODE_ENV !== 'development';

isProduction
    ? (process.env.ROOT = path.join(process.resourcesPath))
    : (process.env.ROOT = path.resolve(__dirname, '../'));

assignEnvsFromFile();

if (isProduction) {
    handleAppData();
    assignPort();
    process.env.NUXT_PUBLIC_BASE_URL = 'http://localhost:' + process.env.PORT;
    process.env.DATA_DIR = path.join(app.getPath('userData'), 'data');
}

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
]);

if (!app.requestSingleInstanceLock()) {
    app.quit();
}

app.whenReady().then(async () => {
    protocol.handle('app', (request) => {
        const filePath = request.url.slice('app://'.length);
        const file = path.join(process.env.DATA_DIR, 'media', filePath);

        let fileUrl = pathToFileURL(file).href;

        if (fileUrl.endsWith('/')) {
            fileUrl = fileUrl.slice(0, -1);
        }

        return electronNet.fetch(fileUrl);
    });

    if (isProduction) {
        await startWebServer();
    }

    const win = createWindow();

    if (!isProduction) {
        win.webContents.openDevTools();
    }

    win.loadURL(process.env.NUXT_PUBLIC_BASE_URL);

    win.once('ready-to-show', () => {
        win.maximize();
    });

    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith(process.env.NUXT_PUBLIC_BASE_URL)) {
            return { action: 'allow' };
        }

        require('electron').shell.openExternal(url);
        return { action: 'deny' };
    });
});


app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        const win = createWindow();
        win.loadURL(process.env.NUXT_PUBLIC_BASE_URL);

        win.once('ready-to-show', () => {
            win.maximize();
        });
    }
});


app.on('second-instance', () => {
    const openedWindow = BrowserWindow.getAllWindows()[0];

    if (openedWindow.isMinimized()) {
        openedWindow.restore();
    }

    openedWindow.focus();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

function handleAppData() {
    const appDataPath = path.join(process.env.ROOT, 'data');
    const userDataPath = path.join(app.getPath('userData'), 'data');

    if (app.isPackaged && !fs.existsSync(userDataPath)) {
        fs.mkdirSync(userDataPath);

        fs.cpSync(appDataPath, userDataPath, {
            recursive: true,
            overwrite: false,
            errorOnExist: true
        });
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
    if (isProduction) {
        envPath = path.join(app.getPath('userData'), '.env');
    } else {
        envPath = path.join(process.env.ROOT, '.env');
    }

    if (app.isPackaged && !fs.existsSync(envPath)) {
        generateEnvFile();
    }

    const envFile = fs.readFileSync(envPath, 'utf-8');

    envFile.split('\n').forEach((line) => {
        const [key, value] = line.split('=');
        process.env[key] = value.replace(/(\r\n|\n|\r)/gm, '');
    });
}

function generateEnvFile() {
    const crypto = require('crypto');

    const userDataPath = path.join(app.getPath('userData'), 'data');

    const env = {
        DATA_DIR: userDataPath,
        DATABASE_URL: 'file:' + path.join(userDataPath, 'db', 'app.sqlite'),
        ACCESS_TOKEN_SECRET: crypto.randomBytes(64).toString('hex'),
        REFRESH_TOKEN_SECRET: crypto.randomBytes(64).toString('hex')
    };

    const envExamplePath = path.join(process.env.ROOT, '.env.example');
    const envPath = path.join(app.getPath('userData'), '.env');

    const envExampleFile = fs.readFileSync(envExamplePath, 'utf-8');

    const envExample = {};

    envExampleFile.split('\n').forEach((line) => {
        const [key, value] = line.split('=');
        envExample[key] = value;
    });

    Object.keys(envExample).forEach((key) => {
        if (env[key]) {
            envExample[key] = env[key];
        }
    });

    const envFile = Object.keys(envExample)
        .map((key) => {
            return `${key}=${envExample[key]}`;
        })
        .join('\n');

    fs.writeFileSync(envPath, envFile);
}

async function startWebServer() {
    const serverPath = path.join(process.env.ROOT, '.output/server/index.mjs');
    const serverUrl = pathToFileURL(serverPath).href;

    try {
        const { default: startServer } = await import(serverUrl);
        if (typeof startServer === 'function') {
            startServer();
        }
    } catch (error) {
        log(error);
    }
}

function createWindow() {
    const win = new BrowserWindow({
        show: false,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        autoHideMenuBar: true,
        title: process.env.APP_NAME,
        icon: path.join(process.env.ROOT, '.output/public/favicon.ico')
    });

    return win;
}

function log(message) {
    const logPath = path.join(app.getPath('userData'), 'log.txt');
    fs.appendFileSync(logPath, message + '\n');
}
