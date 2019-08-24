const alertOnlineStatus = () => {
  window.alert(
    "Seems like your internet connection is off! Please check and enable it back."
  );
};

// window.addEventListener('online',  alertOnlineStatus)
window.addEventListener("offline", alertOnlineStatus);
/*
if (process.platform === "win32") {
  let titleBar = `
  <style>
    #title-bar-teatv {
      height: 30px;
      width: 100%;
      background-color: #131d26;
      position: fixed;
      z-index: 1000;
      top:0;left:0;
      padding-right: 5px;
      padding-top: 3px;
      display: flex;
    }

    #title-bar-teatv div {
      display: flex;
      justify-content: flex-end;
      flex: 1
    }

    #title-bar-teatv .drag {
      -webkit-app-region: drag;
      display: flex;
      flex: 8
    }

    .search-container, .back-header {
      -webkit-app-region: no-drag;
      top: 30px;
    }
    #main {
      padding-top: 30px;
    }

    .resize-btns i {
      margin: 4px;
    }
  </style>
  <div id="title-bar-teatv">
    <div class="drag"></div>
    <div class="resize-btns">
      <i class="fa fa-window-minimize" aria-hidden="true" id="app-minimize"></i>
      <i class="fa fa-window-maximize" aria-hidden="true" id="app-maximize"></i>
      <i class="fa fa-window-close" aria-hidden="true" id="app-close"></i>
    </div>
  </div>
  `;
  $("body").prepend(titleBar);
  let win = remote.getCurrentWindow();
  $(document).on("click", "#app-minimize", function() {
    win.minimize();
  });
  $(document).on("click", "#app-maximize", function() {
    if (win.isMaximized()) {
      win.unmaximize();
      $("#app-maximize").addClass("fa-window-maximize");
      $("#app-maximize").removeClass("fa-window-restore");
    } else {
      win.maximize();
      $("#app-maximize").removeClass("fa-window-maximize");
      $("#app-maximize").addClass("fa-window-restore");
    }
  });
  $(document).on("click", "#app-close", function() {
    win.close();
  });
}
*/
var _timeout;
const onWindowResize = () => {
  let height = window.innerHeight;
  let width = window.innerWidth;
  let win = remote.getCurrentWindow();
  if (!!player && jwplayer("player").getState() !== null) {
    jwplayer("player").resize(window.innerWidth, window.innerHeight - 20);
  }
  if (_timeout != undefined) {
    clearTimeout(_timeout);
  }
  _timeout = setTimeout(() => {
    require("electron").ipcRenderer.send("WINDOW_RESIZE", { width, height });
    if (win.isMaximized()) {
      $("#app-maximize").removeClass("fa-window-maximize");
      $("#app-maximize").addClass("fa-window-restore");
    } else {
      $("#app-maximize").addClass("fa-window-maximize");
      $("#app-maximize").removeClass("fa-window-restore");
    }
  }, 350);
};
window.addEventListener("resize", function() {
  onWindowResize();
});


var progressBarUpdate = `
  <div class="indeterminate-bar">
  <div class="slider">
    <div class="line" />
    <div class="subline inc" />
    <div class="subline dec" />
  </div>
  </div>
`;
ipcRenderer.on("UPDATE_CHANGELOG", function(event, arg) {
  var changeLog = '<pre>'+arg+'</pre>';
  $('#welcome-message .modal-body').html(changeLog);
})

ipcRenderer.on("UPDATE_PROGRESS", function(event, arg) {
  $('#welcome-message').modal('show');
  $('#welcome-message .modal-header .cursor').hide();
  // console.log(arg.percent.toFixed(2) * 100 + "%");
  // $("#update-loader").fadeIn();
  // $("#update-loader").css("display", "flex");
  // $("#update-progress #update-percent").text(
  //   Math.floor(arg.percent.toFixed(2) * 100) + "%"
  // );
  $("#update-message").show();
  $("#update-message span").text( Math.floor(arg.percent.toFixed(2) * 100) + "%");
  $( progressBarUpdate ).insertAfter( "#welcome-message .modal-header" );
});

var firstOpen = localStorage.getItem("first-open-app") == null ? true : false ;

if(firstOpen) $('#welcome-message').modal('show');
$('#welcome-message .modal-header .cursor').click(function(){
  localStorage.setItem("first-open-app", "true")
})