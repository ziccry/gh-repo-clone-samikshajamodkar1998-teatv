const { ipcRenderer } = require("electron");
global.pingHost = () => {
  ipcRenderer.sendToHost("ping");
};
global.sendHtml = () => {
  ipcRenderer.sendToHost("html-content", document.body.innerHTML);
};
