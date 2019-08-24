const fs = require('fs');

module.exports = (mainWindow) => {
  console.log('here')
  let installed = {
    chrome: process.platform === "darwin" ? fs.existsSync("/Applications/Google Chrome.app") : fs.existsSync("C://Program Files (x86)//Google//Chrome//Application//chrome.exe"),
    idm: fs.existsSync("C://Program Files (x86)//Internet Download Manager//IDMan.exe")
  };
  console.log(installed);
  mainWindow.webContents.send('CHECK_APP_INSTALL', installed);
}