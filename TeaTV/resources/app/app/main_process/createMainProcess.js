const electron = require("electron");
const isDev = require("electron-is-dev");
const app = electron.app;
const Menu = electron.Menu;
// const { download } = require('electron-dl')
const { ipcmainWindow, dialog, shell } = require("electron");
const BrowserWindow = electron.BrowserWindow;
const EventRegister = require("js-events-listener");
const APP_PATH = require("./path");
const url = require("url");
const storage = require("electron-json-storage");
var _timeout;
const ElectronUpdater = require("@appota/electron-renderer-updater");
const fsExtra = require("fs-extra");
const downloader = require('./downloader');

const createmainWindowProcess = (windowSize, callback) => {
  let mainWindow = new BrowserWindow({
    width: windowSize.width || 1006,
    height: windowSize.height || 786,
    // titleBarStyle: "hidden",
    movable: true,
    frame: true, //process.platform === "win32" ? true : false,
    minHeight: 711,
    minWidth: 1006,
    show: false,
    webPreferences: {
      nodeIntegrationInWorker: true,
      preload: './preloadMain.js'
    },
    x: windowSize.x,
    y: windowSize.y,
    backgroundColor: "#1a242d"
  });

  mainWindow.once("ready-to-show", async () => {
    mainWindow.show();

    if (!isDev) {
      let haveNewUpdate = await ElectronUpdater.checkUpdate();
      if (haveNewUpdate) {
        let message = "TeaTv has new update!";
        message += ElectronUpdater.bigUpdate
          ? " This is an big update and you have to install it manually."
          : "";
        let indexButton = dialog.showMessageBox({
          message: message,
          buttons: ["Install and Relaunch"]
        });
        if (indexButton === 0 && ElectronUpdater.bigUpdate === false) {
          if (typeof ElectronUpdater.data.changeLog === "string") {
            mainWindow.webContents.send(
              "UPDATE_CHANGELOG",
              ElectronUpdater.data.changeLog
            );
          }
          await ElectronUpdater.installUpdate();
          app.relaunch();
          app.exit();
        } else if (indexButton === 0 && ElectronUpdater.bigUpdate) {
          shell.openExternal(ElectronUpdater.zipUrl);
          app.exit();
        }
      }
    }
  });

  mainWindow.on("move", ev => {
    if (_timeout) clearTimeout(_timeout);
    let position = mainWindow.getPosition();
    _timeout = setTimeout(() => {
      storage.set("window_position", position, function (err) {
        //
      });
    }, 350);
  });

  mainWindow.loadURL(
    url.format({
      pathname: APP_PATH.MAIN_WINDOW,
      protocol: "file:",
      slashes: true
    })
  );

  mainWindow.webContents.on("will-navigate", ev => {
    ev.preventDefault();
  });

  mainWindow.webContents.on("new-window", ev => {
    ev.preventDefault();
  });

  mainWindow.on("closed", function () {
    EventRegister.emit("MAIN_CLOSE");
    mainWindow = null;
  });

  let menuTemplate = [
    {
      label: "TeaTV",
      submenu: [
        {
          label: "About TeaTV",
          selector: "orderFrontStandardAboutPanel:"
        },
        { type: "separator" },
        {
          label: "Quit",
          accelerator: "Command+Q",
          click: function () {
            app.quit();
          }
        }
      ]
    },
    {
      label: "Edit",
      submenu: [
        {
          label: "Open DevTools",
          accelerator: "CmdOrCtrl+Shift+O",
          click: function () {
            mainWindow.openDevTools();
          }
        },
        {
          label: "Open GetLink DevTools",
          accelerator: "CmdOrCtrl+Shift+P",
          click: function () {
            // mainWindow.openDevTools();
            typeof callback === "function" && callback("GELINK_DEVTOOL");
          }
        },
        {
          label: "Reload",
          accelerator: "CmdOrCtrl+R",
          click: function () {
            let win = BrowserWindow.getFocusedWindow();
            if (win) win.webContents.reloadIgnoringCache();
          }
        },
        {
          label: "Recorder",
          accelerator: "Shift+R",
          click: function () {
            typeof callback === "function" && callback("RECORDER");
          }
        },
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        {
          label: "Select All",
          accelerator: "CmdOrCtrl+A",
          selector: "selectAll:"
        }
      ]
    }
  ];
  if (!isDev) {
    menuTemplate[1].submenu.shift();
    menuTemplate[1].submenu.shift();
  }
  process.platform !== "win32" &&
    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));


  mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
    let isRecorder = false;
    for (let i = 0; i < webContents.history.length; i++) {
      if (webContents.history[i].includes("recorder.html")) {
        isRecorder = true;
        break;
      }
    }
    isRecorder === false && downloader.catchDownloadEvent(event, item, webContents);
  })

  mainWindow.on("close", function (e) {

    e.preventDefault();
    console.log(Object.keys(downloader.downloadData));
    if (Object.keys(downloader.downloadData).length > 0) {
      let indexButton = dialog.showMessageBox({
        message: "Still downloading. Do you want to cancel and exit",
        buttons: ["Cancel download and Exit", "Stay on App"]
      });
      if (indexButton == 0) {
        for (let url in downloader.downloadData) {
          EventRegister.emit("DOWNLOAD_VIDEO_ACTION", {
            url: url, action: "cancel"
          });
        }
        setTimeout(() => {
          app.exit();
        }, 1000)
      }
    } else {
      app.exit();
    }

    // if(Object.keys(downloader.downloadData).length > 0) {
    //   let indexButton = dialog.showMessageBox({
    //     message: "Still downloading. Do you want to cancel and exit",
    //     buttons: ["Cancel download and Exit", "Stay on App"]
    //   });
    //   if (indexButton == 1) {
    //     return e.preventDefault();
    //   } 
    // }
  });

  return mainWindow;
};

module.exports = createmainWindowProcess;
