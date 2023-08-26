const builder = require('electron-builder');
const Platform = builder.Platform;

/**
* @type {import('electron-builder').Configuration}
*/
const config = {
  appId: "pmca.glossario",
  compression: process.env.NODE_ENV === "development" ? "store" : "maximum",
  files: [
    "electron/**/*",
    "!node_modules/**/*"
  ],
  extraResources: [
    ".output/**/*",
    "server/prisma/app.sqlite"
  ],
  directories: {
    output: "builds/${version}"
  },
  linux: {
    category: "Education",
    desktop: {
      StartupNotify: "false",
      Encoding: "UTF-8",
    },
    icon: "public/logo-pmca.png",
    target: ["AppImage", "deb"],
    artifactName: "${productName}-${version}.${ext}"
  },
  win: {
    target: 'nsis',
    artifactName: "${productName}-${version}.${ext}",
    icon: "public/logo-pmca.png",
  },
  nsis: {
    oneClick: false,
    perMachine: false,
    deleteAppDataOnUninstall: false // TODO: see if is the better approach
  }
};


let platform = "LINUX"

builder
.build({
  targets: Platform[platform].createTarget(),
  config: config
})
.then((result) => {
  console.log(JSON.stringify(result))
})
.catch((error) => {
  console.error(error)
})
