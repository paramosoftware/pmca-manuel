
const fs = require('fs');
const path = require('path');
const date = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate()
const fileLog = path.join(__dirname, 'data', 'logs', 'pm2-' + date + '.log');

if (!fs.existsSync(fileLog)) {
  fs.writeFileSync(fileLog, '');
}

module.exports = {
  apps : [        {
    name: "pmca-glossario",
    script: ".output/server/index.mjs",
    watch: true,
    node_args: "-r dotenv/config",
    log_file: fileLog.toString(), // TODO: Not working [DISCUSS]
    time: true
  }]
}