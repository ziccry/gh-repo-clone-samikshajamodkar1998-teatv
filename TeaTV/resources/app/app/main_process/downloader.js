const { app } = require('electron')
const storage = require('electron-json-storage')
const path = require('path')
const fs = require('fs')
const EventRegister = require('js-events-listener')
const sanitize = require("sanitize-filename")

const APP_PATH = app.getPath('userData')
const DOWNLOAD_DIR = path.join(APP_PATH, '/downloads')
const DB_KEY = 'downloaded_list'

class Downloader {
  constructor() {
    this.catchDownloadEvent = this.catchDownloadEvent.bind(this)
    this.startDownloadAnItem = this.startDownloadAnItem.bind(this)
    this.catchDownloadInfo = this.catchDownloadInfo.bind(this)
    this.haveAllPart = this.haveAllPart.bind(this)
    this.genTempFilename = this.genTempFilename.bind(this)
    this.onDownloaded = this.onDownloaded.bind(this)
    this.saveToDB = this.saveToDB.bind(this)
    this.getFromDB = this.getFromDB.bind(this)
    this.getListDownloaded = this.getListDownloaded.bind(this)
    this.getListDownloading = this.getListDownloading.bind(this)
    this.getListDownloadingAndDownloaded = this.getListDownloadingAndDownloaded.bind(
      this
    )
    this.sendEvent = this.sendEvent.bind(this)
    this.setupListener = this.setupListener.bind(this)
    this.removeListerner = this.removeListerner.bind(this)
    this.delete = this.delete.bind(this)
    this.clearUnfinishedDownload = this.clearUnfinishedDownload.bind(this)
    this.getUserDownloadDir = this.getUserDownloadDir.bind(this);
    this.setUserDownloadDir = this.setUserDownloadDir.bind(this);

    this.initTime = new Date().getTime()
    this.downloadData = {}
    this.filedownloadCount = 0
    this.listener = {}
    this.DOWNLOAD_DIR = DOWNLOAD_DIR;

    this.clearUnfinishedDownload()
    this.getUserDownloadDir();
  }

  getUserDownloadDir() {
    storage.get("user_download_dir", (err, data) => {
      if (data.hasOwnProperty("path")) {
        this.DOWNLOAD_DIR = data.path;
      }
    })
  }

  setUserDownloadDir(path) {
    this.DOWNLOAD_DIR = path
    storage.set("user_download_dir", { path }, (err) => { })
  }

  clearUnfinishedDownload() {
    !fs.existsSync(APP_PATH) && fs.mkdirSync(APP_PATH)
    !fs.existsSync(this.DOWNLOAD_DIR) && fs.mkdirSync(this.DOWNLOAD_DIR)
    let fileArr = fs.readdirSync(this.DOWNLOAD_DIR)
    fileArr.forEach((item, index) => {
      if (!item.includes('mp4')) fs.unlink(path.join(this.DOWNLOAD_DIR, '/' + item))
    })
  }

  saveToDB(url, filename) {
    let thisdownload = this.downloadData[url]
    thisdownload.filename = filename
    thisdownload.status = 'completed'
    this.sendEvent(url, 'completed', 100)
    this.removeListerner(url)
    this.getFromDB()
      .then(data => {
        data[filename] = thisdownload
        storage.set(DB_KEY, data, err => {
          console.log(err)
          delete this.downloadData[url]
        })
      })
      .catch(err => console.log(err))
  }

  getFromDB() {
    return new Promise((resolve, reject) => {
      storage.get(DB_KEY, function (error, data) {
        if (error) return reject(error)
        resolve(data)
      })
    })
  }

  delete(url) {
    console.log('delete file')
    if (this.downloadData.hasOwnProperty(url)) {
      let thisdownload = this.downloadData[url]
      let { filename, tempFilename } = thisdownload
      console.log(filename)
      console.log(tempFilename)
      setTimeout(() => {
        fs.existsSync(filename) && fs.unlinkSync(filename)
        fs.existsSync(tempFilename) && fs.unlinkSync(tempFilename)
      }, 1000)
      delete this.downloadData[url]
    } else {
      this.getFromDB()
        .then(data => {
          for (let key in data) {
            if (data[key].url == url) {
              let { filename, tempFilename } = data[key]
              fs.existsSync(filename) && fs.unlinkSync(filename)
              fs.existsSync(tempFilename) && fs.unlinkSync(tempFilename)
              delete data[key]
              storage.set(DB_KEY, data, function (err) {
                console.log(err)
              })
              break
            }
          }
        })
        .catch(err => console.log(err))
    }
  }

  getListDownloaded() {
    return new Promise((resolve, reject) => {
      storage.get(DB_KEY, (error, data) => {
        if (error) return reject(error)
        if (Object.keys(data) === 0) return resolve([])
        let arr = []
        for (let download in data) {
          arr.push(data[download]);
          this.setupListener(data[download].url, data[download].item)
        }
        resolve(arr)
      })
    })
  }

  getListDownloading() {
    let arr = []
    for (let download in this.downloadData) {
      // console.log(this.downloadData[download].status);
      if (this.downloadData[download].status !== 'completed') {
        arr.push(this.downloadData[download])
      }
    }
    return Promise.resolve(arr)
  }

  getListDownloadingAndDownloaded() {
    let promise1 = this.getListDownloading()
    let promise2 = this.getListDownloaded()

    return new Promise((resolve, reject) => {
      Promise.all([promise1, promise2])
        .then(arrList => {
          let list = arrList[0].concat(arrList[1])
          list = list.sort((a, b) => {
            return a.timestamp > b.timestamp ? -1 : 1
          })
          resolve(list)
        })
        .catch(err => reject(err))
    })
  }

  onDownloaded(url, savedPath) {
    let thisdownload = this.downloadData[url]
    let renamedFile = fs.existsSync(thisdownload.filename)
      ? thisdownload.filename.replace(
        '.mp4',
        '_' + new Date().getTime() + '.mp4'
      )
      : thisdownload.filename
    fs.rename(savedPath, renamedFile, err => {
      if (err) {
        console.log('ERROR: ' + err)
      } else {
        console.log('DONE')
        this.saveToDB(url, renamedFile)
      }
    })
  }

  startDownloadAnItem(url) {
    console.log('START DOWNLOAD AN ITEM')
    let { item, info } = this.downloadData[url]
    let { title, year, season, episode } = info
    let filename = sanitize(title.replace(/\s/g, '_')) + '_' + year
    if (season != undefined) filename += '_Season_' + season
    if (episode != undefined) filename += '_Season_' + episode
    filename += '.mp4'
    filename = path.join(this.DOWNLOAD_DIR, '/' + filename)
    this.downloadData[url].filename = filename
    console.log('startDownloadAnItem', filename)
  }

  haveAllPart(downloadData) {
    if (downloadData.hasOwnProperty('info') === false) return
    if (downloadData.hasOwnProperty('item') === false) return
    return true
  }

  genTempFilename() {
    this.filedownloadCount++
    return path.join(
      this.DOWNLOAD_DIR,
      '/' + this.initTime + '_temp_name_download_' + this.filedownloadCount
    )
  }

  sendEvent(url, status, progress) {
    EventRegister.emit('DOWNLOAD_VIDEO_PROGRESS', { url, status, progress })
  }

  setupListener(url) {
    let thisdownload = this.downloadData[url]
    this.listener[url] = EventRegister.on('DOWNLOAD_VIDEO_ACTION', obj => {
      console.log('DOWNLOAD_VIDEO_ACTION');
      if (obj.url != url) return;
      switch (obj.action) {
        case 'cancel':
          this.delete(url)
          break
        case 'delete':
          this.delete(url)
          break
      }
    })
  }

  removeListerner(url) {
    EventRegister.rm(this.listener[url])
  }

  catchDownloadInfo(data) {
    console.log('CATCH DOWNLOAD INFO')
    this.tempInfo = {
      info: data,
      progress: 0
    }
  }

  catchDownloadEvent(event, item, webContents) {
    console.log('CATCH DOWNLOAD EVENT')
    // console.log(item);
    let downloadUrl = item.getURL()
    let filename = this.genTempFilename()
    this.downloadData[downloadUrl] = Object.assign({}, this.tempInfo)
    console.log(this.downloadData[downloadUrl])
    this.downloadData[downloadUrl].item = item
    this.downloadData[downloadUrl].tempFilename = filename
    this.downloadData[downloadUrl].url = downloadUrl
    this.downloadData[downloadUrl].timestamp = new Date().getTime()
    this.startDownloadAnItem(downloadUrl)
    let thisdownload = this.downloadData[downloadUrl]
    let totalSize = item.getTotalBytes()
    item.setSavePath(filename)
    EventRegister.on('DOWNLOAD_VIDEO_ACTION', obj => {
      // console.log('DOWNLOAD_VIDEO_ACTION')
      if (obj.url != downloadUrl) return
      switch (obj.action) {
        case 'pause':
          item.pause()
          break
        case 'resume':
          item.resume()
          break
        case 'cancel':
          try {
            item.cancel()
            this.delete(downloadUrl)
          } catch (err) {
            console.log(err);
            this.delete(downloadUrl)
          }
          break
        case 'delete':
          this.delete(downloadUrl)
          break
      }
    })
    item.on('updated', (event, state) => {
      if (state === 'interrupted') {
        console.log('Download is interrupted but can be resumed')
        this.sendEvent(downloadUrl, 'failed', thisdownload.progress || 0)
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          console.log('Download is paused')
          thisdownload.status = 'paused'
          this.sendEvent(downloadUrl, 'paused', thisdownload.progress || 0)
        } else {
          let progress = Math.floor(
            (item.getReceivedBytes() / totalSize).toFixed(2) * 100
          )
          thisdownload.progress = progress
          thisdownload.status = 'downloading'
          this.sendEvent(downloadUrl, 'downloading', progress || 0)
          console.log(`Received percent: ${progress}%`)
        }
      }
    })
    item.once('done', (event, state) => {
      if (state === 'completed') {
        console.log(item);
        console.log('PATH', item.getSavePath());
        console.log('Download successfully')
        this.onDownloaded(downloadUrl, item.getSavePath())
      } else {
        console.log(`Download failed: ${state}`)
        thisdownload.status = 'failed'
        this.sendEvent(downloadUrl, 'failed', thisdownload.progress || 0)
      }
    })
  }
}

const downloader = new Downloader()
module.exports = downloader
exports.default = downloader
exports.downloader = downloader
