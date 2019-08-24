const { app } = require('electron')
const EventRegister = require('js-events-listener')
const ElectronUpdater = require('@appota/electron-renderer-updater')
const storage = require('electron-json-storage')
ElectronUpdater.setup({
  initialVersion: '1.5.0',
  folderName: 'renderer_process',
  jsPath: app.getPath('userData'),
  releaseInfoUrl: process.platform === "darwin" ?
    'https://raw.githubusercontent.com/TeaTV/TeaTV-macOS/master/version-update.json'
    : 'https://raw.githubusercontent.com/TeaTV/TeaTV-Windows/master/version-update.json'
  // releaseInfoUrl: "http://localhost:8000/version-update.json"
})

ElectronUpdater.onInstallProgress(data => {
  console.log(data)
  EventRegister.emit("UPDATE_PROGRESS", data);
})
