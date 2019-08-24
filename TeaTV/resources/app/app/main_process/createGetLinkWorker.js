const electron = require("electron");
const app = electron.app;
const { ipcMain } = require("electron");
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const url = require("url");
const APP_PATH = require("./path");

const getLinkWorker = () => {
  let getLinkWorker = new BrowserWindow({
    width: 0,
    height: 0,
    titleBarStyle: "hidden",
    frame: false,
    show: false,
    webPreferences: {
      nodeIntegrationInWorker: true
    }
  });

  // and load the index.html of the app.
  getLinkWorker.loadURL(
    url.format({
      pathname: APP_PATH.GETLINK_WORKER,
      protocol: "file:",
      slashes: true
    })
  );
  // getLinkWorker.openDevTools();
  return getLinkWorker;
};

module.exports = getLinkWorker;
