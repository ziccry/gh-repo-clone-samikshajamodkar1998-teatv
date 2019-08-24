const electron = require("electron");
const app = electron.app;
const { ipcMain } = require("electron");
const BrowserWindow = electron.BrowserWindow;
const APP_PATH = require("./path");
const url = require("url");

const openRecorder = () => {
  let recorderWindow = new BrowserWindow({
    width: 300,
    height: 500,
    movable: true,
    frame: true,
    show: false,
    resizable: false
  });

  recorderWindow.once("ready-to-show", () => {
    // recorderWindow.webContents.send("player link", obj);
  });

  // and load the index.html of the app.
  recorderWindow.loadURL(
    url.format({
      pathname: APP_PATH.RECORDER_WINDOW,
      protocol: "file:",
      slashes: true
    })
  );

  recorderWindow.webContents.session.on('will-download', (event, item, webContents) => {
    // downloader.catchDownloadEvent(event, item, webContents);
    // console.log('HERE');
    // console
  })

  recorderWindow.webContents.on("will-navigate", ev => {
    ev.preventDefault();
  });

  recorderWindow.webContents.on("new-window", ev => {
    ev.preventDefault();
  });

  recorderWindow.on("close", ev => {
    // ev.preventDefault();
    // recorderWindow = null;
    recorderWindow.hide();
    ev.preventDefault();
  });

  return recorderWindow;
};

module.exports = openRecorder;
