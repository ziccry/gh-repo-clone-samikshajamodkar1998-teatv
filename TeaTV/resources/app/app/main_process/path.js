const isDev = require('electron-is-dev')
const { app } = require('electron')
const path = require('path')
const fs = require('fs')

const ALL_PATH = {
  DEV: {
    MAIN_WINDOW: path.join(__dirname, '../renderer_process/index.html'),
    ASSET: path.join(__dirname, '../renderer_process/asset/'),
    RECORDER_WINDOW: path.join(__dirname, '../renderer_process/recorder.html'),
    GETLINK_WORKER: path.join(__dirname, '../renderer_process/getlink-worker.html')
  },
  PRODUCT: {
    MAIN_WINDOW: path.join(app.getPath('userData'), '/renderer_process/index.html'),
    ASSET: path.join(app.getPath('userData'), '/renderer_process/asset/'),
    RECORDER_WINDOW: path.join(app.getPath('userData'), '/renderer_process/recorder.html'),
    GETLINK_WORKER: path.join(app.getPath('userData'), '/renderer_process/getlink-worker.html')
  }
}

const APP_PATH = isDev
  ? {
    MAIN_WINDOW: ALL_PATH.DEV.MAIN_WINDOW,
    ASSET: ALL_PATH.DEV.ASSET,
    RECORDER_WINDOW: ALL_PATH.DEV.RECORDER_WINDOW,
    GETLINK_WORKER: ALL_PATH.DEV.GETLINK_WORKER
  }
  : {
    MAIN_WINDOW: fs.existsSync(ALL_PATH.PRODUCT.MAIN_WINDOW)
      ? ALL_PATH.PRODUCT.MAIN_WINDOW
      : ALL_PATH.DEV.MAIN_WINDOW,
    RECORDER_WINDOW: fs.existsSync(ALL_PATH.PRODUCT.RECORDER_WINDOW)
      ? ALL_PATH.PRODUCT.RECORDER_WINDOW
      : ALL_PATH.DEV.RECORDER_WINDOW,
    GETLINK_WORKER: fs.existsSync(ALL_PATH.PRODUCT.GETLINK_WORKER)
      ? ALL_PATH.PRODUCT.GETLINK_WORKER
      : ALL_PATH.DEV.GETLINK_WORKER,
    ASSET: fs.existsSync(ALL_PATH.PRODUCT.ASSET)
      ? ALL_PATH.PRODUCT.ASSET
      : ALL_PATH.DEV.ASSET
  }

module.exports = APP_PATH
