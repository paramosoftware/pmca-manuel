const builder = require('electron-builder');
const Platform = builder.Platform;
/**
* @type {import('electron-builder').Configuration}
*/
const config = {
  appId: "pmca.glossario",
  productName: process.env.APP_NAME,
  compression: process.env.NODE_ENV === "development" ? "store" : "normal",
  files: [
    "electron/**/*",
    "!node_modules/**/*"
  ],
  extraResources: [
    ".output/**/*"
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
    icon: "public/icons/icon.icns",
    target: ["AppImage", "deb"],
    artifactName: "${name}-${version}.${ext}"
  },
  win: {
    target: 'nsis',
    artifactName: "${name}-${version}.${ext}",
    icon: "public/favicon.ico",
  },
  nsis: {
    oneClick: false,
    perMachine: false,
    deleteAppDataOnUninstall: true
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
