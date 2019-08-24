const { ipcMain, BrowserWindow, session, dialog, app } = require('electron')
let videoInfo = require('./videoInfo')
const fsExtra = require('fs-extra')
const storage = require('electron-json-storage')
const downloader = require('./downloader')
const EventRegister = require('js-events-listener')
const fs = require('fs')
const p = require('path')
const axios = require('axios')
const request = require('request')
const { exec, spawn } = require('child_process')
const subtitle = require('./subtitle');
const openOtherApp = require('./openOtherApp')

const getFinalUrl = url =>
  new Promise((resolve, reject) => {
    console.log('GET FINAL URL')
    axios
      .head(url, { headers: { Range: 'bytes=0-0' } })
      .then(res => resolve(res.request.res.responseUrl))
      .catch(err => {
        console.log('ERR')
        console.log(Object.keys(err))
        console.log(err.request.res.responseUrl)
        resolve(err.request.res.responseUrl)
      })
  })

const removeSync = path => {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file, index) {
      var curPath = p.join(path, file)
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        removeSync(curPath)
      } else {
        // delete file
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(path)
  }
}

const startCommunicateBetweenProcesses = (mainWindow, getLinkWorker, recorderWindow) => {
  require('./requestCapture')

  setTimeout(() => {
    mainWindow.webContents.send('CONSTANTS', {
      userDataPath: app.getPath('userData'),
      downloadPath: downloader.DOWNLOAD_DIR,
      appPath: app.getAppPath()
    });

  }, 500);

  setTimeout(() => {
    require('./checkAppInstalled')(mainWindow);
  }, 5000);

  ipcMain.on("CONSTANTS", (e, arg) => {
    mainWindow.webContents.send('CONSTANTS', {
      userDataPath: app.getPath('userData'),
      downloadPath: downloader.DOWNLOAD_DIR,
      appPath: app.getAppPath()
    });
  })

  ipcMain.on("UPDATE_DOWNLOAD_PATH", (e, arg) => {
    // let path = dialog.showOpenDialog({ properties: ['openDirectory'] });
    downloader.setUserDownloadDir(arg);
  });

  ipcMain.on('download', (e, arg) => {
    download(BrowserWindow.getFocusedWindow(), arg.url, {
      saveAs: false,
      onProgress: function (perc) {
        e.sender.send('download-percent', perc)
      }
    })
      .then(dl => console.log(dl.getSavePath()))
      .catch(console.error)
  })

  ipcMain.on('DOWNLOAD_VIDEO', (e, arg) => {
    downloader.catchDownloadInfo(arg)
    mainWindow.webContents.downloadURL(arg.downloadUrl)
  })

  ipcMain.on('GET_LIST_DOWNLOAD', (e, arg) => {
    downloader.getListDownloadingAndDownloaded().then(arrlist => {
      mainWindow.webContents.send('RETURN_LIST_DOWNLOAD', arrlist)
    })
  })

  ipcMain.on('OPEN_MAIN_CONSOLE', (e, arg) => {
    mainWindow.openDevTools()
  })

  ipcMain.on('OPEN_GETLINK_CONSOLE', (e, arg) => {
    getLinkWorker.openDevTools()
  })

  ipcMain.on('OPEN_PLAYER', async (e, arg) => {
    mainWindow.webContents.send('player link', arg)
  })

  ipcMain.on('GET_LINK', (e, arg) => {
    getLinkWorker.webContents.send('GET_LINK', arg)
  })

  ipcMain.on('RETURN_LINK', (e, arg) => {
    console.log('RETURN_LINK');
    mainWindow.webContents.send('RETURN_LINK', arg)
  })

  ipcMain.on('SET_COOKIE', (e, arg) => {
    session.defaultSession.cookies.set(arg, err => {
      if (err) console.error(err)
      e.sender.send(true)
    })
  })

  ipcMain.on('UPDATE_FINISH', (e, arg) => {
    startApp()
  })

  ipcMain.on('WINDOW_RESIZE', (e, arg) => {
    storage.set('window_size', arg, function (error) {
      if (error) throw error
    })
  })

  ipcMain.on('TO_MAIN_WINDOW', (e, arg) => {
    mainWindow.webContents.send('TO_MAIN_WINDOW', arg)
  })

  ipcMain.on('TO_GETLINK_WORKER', (e, arg) => {
    getLinkWorker.webContents.send('TO_GETLINK_WORKER', arg)
  })

  ipcMain.on('GET_VIDEO_INFO', (e, arg) => {
    videoInfo.method === 'ffmpeg' &&
      videoInfo.getInfo(arg).then(info => {
        info.url = arg
        mainWindow.webContents.send('RETURN_VIDEO_INFO', info)
      })
  })

  ipcMain.on('DELETE_USER_DATA', (e, arg) => {
    mainWindow.webContents.clearHistory()
    mainWindow.webContents.session.clearStorageData()

    if (Object.keys(downloader.downloadData).length > 0) {
      for (let url in downloader.downloadData) {
        EventRegister.emit('DOWNLOAD_VIDEO_ACTION', {
          url: url,
          action: 'cancel'
        })
      }
      setTimeout(() => {
        app.exit()
        app.relaunch()
      }, 1000)
    } else {
      app.exit()
      app.relaunch()
    }
  })

  ipcMain.on('DOWNLOAD_VIDEO_ACTION', (e, arg) => {
    EventRegister.emit('DOWNLOAD_VIDEO_ACTION', arg)
  })

  EventRegister.on('DOWNLOAD_VIDEO_PROGRESS', arg => {
    mainWindow.webContents.send('DOWNLOAD_VIDEO_PROGRESS', arg)
  })

  EventRegister.on('9X_BUDDY', () => {
    getLinkWorker.webContents.send('9X_BUDDY')
  })

  ipcMain.on('CAPTURE_REQUEST', (e, arg) => {
    EventRegister.emit('CAPTURE_REQUEST', arg)
  })

  EventRegister.on('CAPTURE_REQUEST', arg => {
    getLinkWorker.webContents.send('CAPTURE_REQUEST', arg)
  })

  EventRegister.on('UPDATE_PROGRESS', arg => {
    mainWindow.webContents.send('UPDATE_PROGRESS', arg)
  })

  ipcMain.on('GET_SUBTITLE', (e, arg) => {
    subtitle.getSubInfo(arg).then(filePath => {
      mainWindow.webContents.send('GET_SUBTITLE', filePath)
    }).catch(err => {
      mainWindow.webContents.send('GET_SUBTITLE', false)
      console.log(err)
    })
  })

  ipcMain.on('SYNC_SUBTITLE_SUPPORT', (e, arg) => {
    subtitle.syncSupportedSub(arg);
  })

  ipcMain.on("START_RECORD", (e, arg) => {
    mainWindow.webContents.send('START_RECORD');
  });

  ipcMain.on("MAIN_RECORD_READY", (e, arg) => {
    recorderWindow.webContents.send('START_RECORD');
  })

  ipcMain.on("STOP_RECORD", (e, arg) => {
    mainWindow.webContents.send('STOP_RECORD');
  })

  ipcMain.on("OPEN_RECORDER", (e, arg) => {
    recorderWindow.show();
  })

  ipcMain.on("CONVERT_TO_MP4", (e, arg) => {
    videoInfo.convertWebmToMp4(arg).then(savePath => {
      recorderWindow.webContents.send('CONVERT_DONE', savePath)
    })
      .catch((e) => {
        console.log(err);
        recorderWindow.webContents.send('CONVERT_DONE', "false");
      })
  })

  ipcMain.on("OPEN_OTHER_APP", (e, arg) => {
    openOtherApp(arg);
  })

  ipcMain.on("CHECK_APP_INSTALLED", (e, arg) => {
    require('./checkAppInstalled')(mainWindow);
  })

  const Awesome = require("./awesome-movie/index.node");
  let awesome = new Awesome({
    dbPath: app.getPath('userData'),
    platform: "nodejs",
    useExampleAddons: false
  });

  awesome.onReady(() => {
    console.log("AVAILABLE_PROVIDER", Object.keys(awesome.addons.state.all_provider));
    console.log("AVAILABLE_HOST", Object.keys(awesome.addons.state.all_host));
    let movieProcess = {};
    ipcMain.on("AWESOME_CANCEL", (e, arg) => {
      if (!movieProcess[arg.title]) return;
      movieProcess[arg.title].cancel();
      delete movieProcess[arg.title]
    });

    ipcMain.on("AWESOME_GET_LINK", (e, arg) => {
      movieProcess[arg.title] = awesome.getLinks.getLinks(arg, {
        returnType: "direct",
        eachLinkCallback: true
      }, (singleLink) => {
        // console.log(singleLink);
        if (singleLink == undefined || singleLink.result.length === 0) return;
        mainWindow.webContents.send('AWESOME_RETURN_LINK', {
          movieInfo: arg,
          linkData: singleLink
        });
      }, singleEmbed => {
        mainWindow.webContents.send('RETURN_EMBED_LINK', {
          movieInfo: arg,
          linkData: singleEmbed
        });
      })

      movieProcess[arg.title].done().then(() => {
        mainWindow.webContents.send('AWESOME_DONE_GET_LINK', arg);
      });
    });
  });
}



module.exports = startCommunicateBetweenProcesses
