const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function generateEnvFile() {
    const envPath = path.resolve(__dirname, '../.env');
    const envExamplePath = path.resolve(__dirname, '../.env.example');

    const exampleContent = fs.readFileSync(envExamplePath, 'utf-8');

    const projectAbsolutePath = path.resolve(__dirname, '../');
    const dataFolder = path.resolve(projectAbsolutePath, 'data');
    const dbFolder = path.resolve(dataFolder, 'db');
    const databasePath = path.resolve(dbFolder, 'app.sqlite');

    const env = {
        DATA_DIR: dataFolder,
        DATABASE_URL: 'file:' + databasePath,
        ACCESS_TOKEN_SECRET: crypto.randomBytes(64).toString('hex'),
        REFRESH_TOKEN_SECRET: crypto.randomBytes(64).toString('hex')
    };

    const envContent = exampleContent.split('\n').map((line) => {
        const [key, value] = line.split('=');
        return `${key}=${env[key] || value}`;
    }).join('\n');


    fs.writeFileSync(envPath, envContent);
}

generateEnvFile();
