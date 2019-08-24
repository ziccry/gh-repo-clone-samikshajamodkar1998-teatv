const OpenSubtitles = require('opensubtitles-api');
const USER_AGENT = "SolEol 0.0.8";
const OS = new OpenSubtitles(USER_AGENT);
const request = require('request');
const fs = require('fs');
const { app } = require('electron');
const path = require('path');
var iconv = require('iconv-lite');

const SUB_FOLDER = path.join(app.getPath("userData"), "/subtitles");
let SUPPORTED_SUB = [
  { code: 'none', name: '(None)' },
  { code: 'ar', name: 'Arabic' },
  { code: 'zh', name: 'Chinese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'el', name: 'Greek' },
  { code: 'he', name: 'Hebrew' },
  { code: 'hr', name: 'Croatian' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'la', name: 'Latin' },
  { code: 'pl', name: 'Polish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'es', name: 'Spanish' },
  { code: 'sr', name: 'Serbian' },
  { code: 'th', name: 'Thai' },
  { code: 'tr', name: 'Turkish' },
  { code: 'vi', name: 'Vietnamese' }
];

class Subtitle {
  constructor() {
    !fs.existsSync(SUB_FOLDER) && fs.mkdirSync(SUB_FOLDER);
    this.getSubInfo = this.getSubInfo.bind(this);
    this.makeFilePath = this.makeFilePath.bind(this);
    this.writeSubToDisk = this.writeSubToDisk.bind(this);
    this.checkExist = this.checkExist.bind(this);
    this.syncSupportedSub = this.syncSupportedSub.bind(this);
    this.SUPPORTED_SUB = SUPPORTED_SUB;
  }

  syncSupportedSub(obj) {
    this.SUPPORTED_SUB = obj;
  }

  makeFilePath(title, lang) {
    let subArr = [{
      code: 'en', name: 'English', "default": true,
      kind: "captions",
      file: path.join(SUB_FOLDER, "/" + title.replace(/\s/g, "_") + "en" + ".srt")
    }];
    if (lang != "en") {
      subArr[0]["default"] = false;
      let langObj = {
        code: lang,
        name: this.SUPPORTED_SUB.find(val => val.code == lang).name,
        "default": true,
        kind: "captions",
        file: path.join(SUB_FOLDER, "/" + title.replace(/\s/g, "_") + lang + ".srt")
      };
      subArr.unshift(langObj);
    }
    return subArr;
  }

  makeFilePathOld(title, lang) {

    return this.SUPPORTED_SUB.map(val => {
      val.file = path.join(SUB_FOLDER, "/" + title.replace(/\s/g, "_") + val.code + ".srt");
      val.kind = "captions",
        val.default = val.code === lang;
      return val;
    })
  }

  writeSubToDisk(url, filePath, encoding) {
    return new Promise((resolve, reject) => {
      request({
        url: url,
        encoding: null
      }, (error, response, data) => {
        if (error) throw error;
        require('zlib').unzip(data, (error, buffer) => {
          if (error) return reject(error);
          if (encoding.includes("|")) {
            encoding = encoding.substring(0, encoding.indexOf("|"))
          }
          let subtitle_content
          try {
            subtitle_content = iconv.decode(buffer, encoding);
          } catch (err) {
            console.log(err);
            subtitle_content = iconv.decode(buffer, "utf8");
          }
          // console.log('Subtitle content:', subtitle_content);
          subtitle_content = subtitle_content.replace("Advertise your product or brand here", "::: TeaTV.net :::");
          subtitle_content = subtitle_content.replace("contact www.OpenSubtitles.org today", "Have a good time :)");
          fs.writeFile(filePath, subtitle_content, function (err) {
            if (err) {
              return reject(err);
            }
            console.log("The subtitle was saved!");
            resolve(filePath);
          });
        });
      });
    })
  }

  checkExist(filePathArr) {
    for (let i = 0; i < filePathArr.length; i++) {
      if (!fs.existsSync(filePathArr[i].file)) return false;
    }
    return true;
  }

  async getSubInfo({ imdb, episode, season, title, lang, checkExist }) {
    let filePathArr = this.makeFilePath(title, lang);
    if (this.checkExist(filePathArr)) {
      return filePathArr;
    } else if (checkExist == true) {
      return false;
    }
    let searchObj = {
      extensions: ['srt', 'vtt'],
      sublanguageid: 'all',
      gzip: true
    };
    searchObj.imdbid = imdb;
    if (episode != undefined) {
      searchObj.season = season;
      searchObj.episode = episode;
    }
    let subtitles = await OS.search(searchObj);
    let subtitlesArray = [];
    let promiseArr = filePathArr.map((val, index) => {
      if (!subtitles.hasOwnProperty(val.code)) {
        subtitlesArray[index] = undefined;
        return Promise.resolve();
      }
      if (fs.existsSync(val.file)) {
        subtitlesArray[index] = val;
        return Promise.resolve();
      }
      return this.writeSubToDisk(subtitles[val.code].url, val.file, subtitles[val.code].encoding)
        .then(() => {
          subtitlesArray[index] = val;
        }).catch(err => {
          subtitlesArray[index] = undefined;
        })
    });

    await Promise.all(promiseArr);
    return subtitlesArray;
  }
}

module.exports = new Subtitle();