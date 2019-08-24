require("babel-polyfill");
const isDev = require('electron-is-dev')
const {
  ipcMain,
  session,
  BrowserWindow,
  Menu,
  app,
  dialog
} = require("electron");
app.disableHardwareAcceleration()
require('./main_process/initialSetup');
const videoInfo = require('./main_process/videoInfo');
const EventRegister = require('js-events-listener');

const createWindow = require('./main_process/createMainProcess')
const createGetLinkWorker = require('./main_process/createGetLinkWorker')
const createRecorderWindow = require('./main_process/createRecorderWindow')

let windowSize, mainWindow, getLinkWorker, recorderWindow;

const { getWindowSize, getWindowPosition, getSizeAndPosition } = require('./main_process/windowResize');
const startCommunicateBetweenProcesses = require('./main_process/comunicator');

videoInfo.setup({
  path: app.getPath("userData") + "/ffmpeg-binaries",
  platform: process.platform === "win32" ? "windows-32" : "osx-64"
}).then(() => {
  console.log('done setup ffmpeg');
  mainWindow != null && mainWindow.webContents.send("VIDEO_INFO_READY");
})

const startApp = () => {
  recorderWindow = createRecorderWindow();
  getLinkWorker = createGetLinkWorker();
  mainWindow = createWindow(windowSize, code => {
    switch (code) {
      case "GELINK_DEVTOOL":
        getLinkWorker != null && getLinkWorker.openDevTools();
        break;
      case "RECORDER":
        recorderWindow != null && recorderWindow != null && recorderWindow.show();
        // recorderWindow != null && recorderWindow.openDevTools();
        break;
    }

  });
  setTimeout(() => {
    videoInfo.method === 'ffmpeg' && mainWindow.webContents.send("VIDEO_INFO_READY");
  }, 3000);
  startCommunicateBetweenProcesses(mainWindow, getLinkWorker, recorderWindow);
  process.platform === "darwin" &&
    app.setAboutPanelOptions({
      applicationName: 'TeaTV',
      applicationVersion: '1.x',
      version: '1.x'
    })
}

app.on("ready", async () => {
  console.log(app.getPath("userData"));
  windowSize = {}; //await getSizeAndPosition();
  startApp();
});

app.on("window-all-closed", function () {
  app.quit();
});

EventRegister.on("MAIN_CLOSE", () => {
  app.quit();
});

app.on("activate", function () {
  if (mainWindow === null) {
    mainWindow = createWindow()
  }
})

module.exports = {
  mainWindow, getLinkWorker
}