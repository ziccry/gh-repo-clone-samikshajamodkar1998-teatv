const { desktopCapturer, ipcRenderer, remote } = require('electron');
const { dialog } = remote;
let blobs = [];

let recorder;
let localStream;

const record = (title) => {
  desktopCapturer.getSources({ types: ['window', 'screen'] }, (error, sources) => {
    if (error) throw error
    for (let i = 0; i < sources.length; ++i) {
      if (sources[i].name === title) {
        navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: sources[i].id,
              minWidth: 1280,
              maxWidth: 1280,
              minHeight: 720,
              maxHeight: 720
            }
          }
        })
          .then((stream) => handleStream(stream))
          .catch((e) => handleError(e))
        return
      }
    }
  })

  const recorderOnDataAvailable = (event) => {
    blobs.push(event.data);
    let blob = new Blob(blobs, { type: 'video/webm' })
    let url = URL.createObjectURL(blob)
    let a = document.createElement('a')
    document.body.appendChild(a)
    a.style = 'display: none'
    a.href = url
    a.download = 'teatv-video-clip-recorded.webm'
    a.click();
    ipcRenderer.send("STOP_RECORD");
    // localStream.stop();
    localStream.getTracks()[0].stop();
    $("video").remove();
    $("body").append("<video></video>");
    $("#start").toggle();
    $("#save").toggle();
    // if (event.data && event.data.size > 0) {
    //   blobs.push(event.data)
    // }
  }

  function handleStream(stream) {
    localStream = stream;
    // let options = { mimeType: 'video/webm;codecs=h264' };
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = recorderOnDataAvailable
    recorder.start();
    const video = document.querySelector('video')
    video.srcObject = stream
    video.onloadedmetadata = (e) => {
      console.log(e);
      video.play()
    }
  }

  function handleError(e) {
    console.log(e)
  }
}

let btnStart = document.querySelector("#start");
btnStart.onclick = function () {
  ipcRenderer.send("START_RECORD");
}

ipcRenderer.on("START_RECORD", (e, arg) => {
  $("#start").toggle();
  $("#save").toggle();
  $("#message").empty();
  record("TeaTV");
})

let btnSave = document.querySelector("#save");
btnSave.onclick = function () {
  console.log(blobs.length);
  recorder.stop();
}

// $("#externalmp4").click(function () {
//   require('electron').shell.openExternal('https://convertio.co/webm-mp4/');
// })

$("#convert").click(function () {
  require('electron').shell.openExternal('https://convert-video-online.com/');
  // let file = dialog.showOpenDialog({ properties: ['openFile'] });
  // if (file == undefined) return;
  // file = file[0];
  // ipcRenderer.send("CONVERT_TO_MP4", file);
  // $("#message").html("Converting...");
  // $("#externalmp4").show();
});

ipcRenderer.on("CONVERT_DONE", (e, arg) => {
  if (arg == "false") {
    $("#message").html("Failed to Convert. Close app and try again, or using external tools");
  } else {
    $("#message").html('Done! <br>' + arg);
  }
});