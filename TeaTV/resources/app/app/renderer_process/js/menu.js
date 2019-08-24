const { ipcRenderer, remote } = require("electron");
const main = remote.require("./main.js");
const { Menu, MenuItem } = remote;
const menu = new Menu();
if(isDev) {
  menu.append(
    new MenuItem({
      label: "Open GetLink console (Cmd/Ctrl + Shift + P)",
      click() {
        ipcRenderer.send("OPEN_GETLINK_CONSOLE", null);
      }
    })
  );
  menu.append(new MenuItem({ type: "separator" }));
  menu.append(
    new MenuItem({
      label: "open TeaTV console (Cmd/Ctrl + Shift + O)",
      click() {
        ipcRenderer.send("OPEN_MAIN_CONSOLE", null);
      }
    })
  );
  window.addEventListener(
    "contextmenu",
    e => {
      e.preventDefault();
      menu.popup(remote.getCurrentWindow());
    },
    false
  );
  
}
