const OpenSubtitles = require('opensubtitles-api');
const USER_AGENT = "SolEol 0.0.8";
const OS = new OpenSubtitles(USER_AGENT);
const request = require('request');
const fs = require('fs');
const { app } = require('electron');
const path = require('path');
var iconv = require('iconv-lite');

const SUB_FOLDER = path.join(app.getPath("userData"), "/subtitles");

const writeSubToDisk = (url, filePath, encoding) => new Promise((resolve, reject) => {
  request({
    url: url,
    encoding: null
  }, (error, response, data) => {
    if (error) throw error;
    require('zlib').unzip(data, (error, buffer) => {
      if (error) return reject(error);
      let subtitle_content = iconv.decode(buffer, encoding);
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
});



const getSub = async ({ imdb, episode, season, title, lang }) => {
  !fs.existsSync(SUB_FOLDER) && fs.mkdirSync(SUB_FOLDER);
  let filePath = path.join(SUB_FOLDER, "/" + title.replace(/\s/g, "_") + lang + ".srt");
  if (fs.existsSync(filePath)) return filePath;
  let searchObj = {
    extensions: ['srt', 'vtt'],
    sublanguageid: lang,
    gzip: true
  };
  searchObj.imdbid = imdb;

  if (episode != undefined) {
    searchObj.season = season;
    searchObj.episode = episode;
  }

  let subtitles = await OS.search(searchObj);
  if (!subtitles.hasOwnProperty(lang)) {
    lang = 'en';
    if (!subtitles.hasOwnProperty(lang)) return Promise.reject("No sub found")
  }
  console.log('Subtitle found:', subtitles[lang]);
  return writeSubToDisk(subtitles[lang].url, filePath, subtitles[lang].encoding);
}

module.exports = getSub;