process.platform === 'win32' &&
  $('body').append('<style>.jw-dock-button{float: right !important;}</style>')
var loading = `
<div class="spinner-container">
<div class="sk-folding-cube">
    <div class="sk-cube1 sk-cube"></div>
    <div class="sk-cube2 sk-cube"></div>
    <div class="sk-cube4 sk-cube"></div>
    <div class="sk-cube3 sk-cube"></div>
</div>
</div>
`
var errorCounter = 0
var videoData = {}
var playerInterval
var didPlayed = false

window.jsEvent.on('OPEN_PLAYER', function(arg) {
  console.log(arg)
  didPlayed = false
  var title = arg.title
  var year = arg.year
  var url = arg.url
  var season = arg.season
  var episode = arg.episode
  var item = arg.item
  var episodeInfo = arg.episodeInfo
  var headingTitle =
    season != undefined
      ? `${title} Season ${season} Episode ${episode}`
      : `${title} (${year})`
  videoData = { item, season, episode, episodeInfo }
  $('header').html('<h4>' + headingTitle + '</h4>')
  $('#player-container').fadeIn()
  //get link direct
  if (
    arg.data.host.includes('drive.google.com') ||
    arg.data.host.includes('docs.google.com')
  ) {
    embedGoodleDrive(arg.data.host)
  } else {
    loadPlayer(arg.data.host, arg.data.result)
  }
})

window.jsEvent.on('RECIEVE_PERCENT', function(recentPercent) {
  let duration = jwplayer('player').getDuration()
  if (recentPercent != undefined) {
    console.log('percent ' + recentPercent)
    jwplayer('player').seek(recentPercent * duration)
  }
})

function loadPlayer(link, sourceArr) {
  $('#player-container').fadeIn()
  var player = jwplayer('player')
  let sources = sourceArr.map(val => {
    return {
      file: val.file,
      label: val.label,
      type: val.file.includes('m3u8') ? 'hls' : 'mp4'
    }
  })
  player.setup({
    sources: sources,
    height: window.innerHeight - 20,
    width: window.innerWidth,
    preload: 'auto',
    autostart: true,
    playbackRateControls: true,
    cast: {},
    skin: {
      name: 'tube'
    }
  })

  player.on('error', function() {
    errorCounter++
    if (errorCounter < 10) {
      jwplayer('player').remove()
      loadPlayer(link, sourceArr)
    } else {
      alert("There is an error playing this link, please try another link")
    }
  })

  player.on('meta', function(e) {
    // console.log(e)
    videoData.duration = e.duration;
    videoData.position = 0;
    playerInterval = setInterval(function() {
      var position = player.getPosition()
      if (position == videoData.position) {
        $('#player').addClass('jw-state-buffering');
        $('#player').removeClass('jw-state-playing');
      } else {
        $('#player').removeClass('jw-state-buffering');
        $('#player').addClass('jw-state-playing');
        videoData.position = position;
      }
    }, 1000)
  })

  player.on('play', function() {
    if (didPlayed) return;
    getRecent();
    didPlayed = true;
  })

  player.on('complete', function() {
    clearInterval(playerInterval);
  })

  player.on('pause', function() {
    saveRecent();
  })

  // add button to controlbar

  function openPlaylist() {
    player.pause(true);
    let { episodeInfo, season, episode } = videoData;
    let episodeHtml = "<div class='episode-list'>";
    episodeInfo.forEach(val => {
      let htmlString = `<div><h5>Season ${val.season_number}</h5>`;
      for(let i=0; i< val.availableEpisode; i++) {
        let isActive = season == val.season_number && episode == i+1;
        htmlString += `<span class="${isActive ? "active" :""}" data-episode="${i+1}" data-season="${val.season_number}">${i+1}</span>`;
      }
      htmlString += "</div><hr class='divider' />";
      episodeHtml += htmlString;
    })
    episodeHtml += "</div>";
    let modalHtml = `
    <div class="modal fade" data-backdrop="static" data-keyboard="false" id="episode-modal" style="z-index:99999;background-color: rgba(0,0,0,0.7)">
    <div class="modal-dialog link-modal" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <div class="cursor" data-dismiss="modal" aria-label="Close">
            <i class="material-icons">close</i>
          </div>
          <h5 class="modal-title modal-item-title">
            Choose Episode
          </h5>
        </div>
        <div class="modal-body">
          ${episodeHtml}
        </div>
      </div>
    </div>
  </div>
    `;
    $("#player").append(modalHtml);
    $("#episode-modal").modal('toggle');
    $("#episode-modal .modal-header .cursor").click(function(){
      setTimeout(() => {
        $("#episode-modal").remove();
        clearInterval(playerInterval)
      }, 500);
    });
    $(document).on("click", "#episode-modal .episode-list span", function(){
      let season = $(this).data("season");
      let episode = $(this).data("episode");
      // console.log(season, episode);
      window.jsEvent.emit("GET_LINK_IN_PLAYER", {season, episode});
      $("#episode-modal").remove();
      $("#player-container").css("z-index", "1010");
    })
  }

  player.onReady(function() {
    if(videoData.episodeInfo == undefined || videoData.episodeInfo.length === 0) return;
    var myLogo = document.createElement("div");
    myLogo.id = "back-button";
    myLogo.setAttribute(
      "style",
      "padding-left: 5px; margin-right: 5px; width: 70px; height: 100%;"
    );
    myLogo.setAttribute(
      "class",
      "jw-icon jw-icon-inline jw-button-color jw-reset jw-icon-logo"
    );
    // myLogo.setAttribute(
    //   "onclick",
    //   'openPlaylist()'
    // );
    myLogo.onclick = openPlaylist;
    myLogo.innerHTML =
      '<i class="material-icons" style="font-size:20px; margin-top: -3px;">playlist_play</i>';
    // $(".jw-controlbar").prepend(myLogo);
    $(myLogo).insertAfter(".jw-icon-playback");
  });

  function getRecent() {
    let { season, episode, item } = videoData
    window.jsEvent.emit('SENT_ITEM', {
      item: item,
      season: season,
      episode: episode
    })
  }

  function saveRecent() {
    if (jwplayer('player').getDuration == 0) return
    let { item, season, episode, duration } = videoData
    var position = player.getPosition()
    var recentPercent = position / duration

    if (recentPercent > 0.95) {
      window.jsEvent.emit('REMOVE_RECENT', {
        item: item,
        season: season,
        episode: episode
      })
    } else {
      window.jsEvent.emit('SAVE_RECENT', {
        item: item,
        percent: recentPercent,
        season: season,
        episode: episode
      })
    }
  }

  function closeVideo() {
    $('#player-container').fadeOut(function() {
      try {
        saveRecent()
      } catch(err) {
        console.log(err);
      }
      $('#player').html(loading)
      // webkitExitFullscreen();
      jwplayer('player').remove()
      errorCounter = 0
      videoData = {}
      didPlayed = false
      clearInterval(playerInterval)
      $(document).off('keydown')
      $(document).off('keypress')
    })
  }

  player.addButton('asset/ic_close_white.svg', '', closeVideo, 'close')

  function jumpBySeconds(seksToJump) {
    var time = player.getPosition() + seksToJump
    if (time < 0) {
      time = 0
    }
    player.seek(time)
  }

  $(document).keypress(function(e) {
    switch(e.which) {
      case 45: 
        // Press -
        player.setVolume(player.getVolume() - 10);
      break;
      case 61:
        // Press +
        player.setVolume(player.getVolume() + 10);
      break;
      case 43:
        // Press +
        player.setVolume(player.getVolume() + 10);
      break;
      case 109:
        // Press M
        player.setMute(undefined)
      break;
    }
  })

  $(document).keydown(function(e) {
    switch(e.which) {
      case 13: 
        // Press Enter
        player.setFullscreen(!player.getFullscreen());
      break;
      case 70:
        // Press Enter
        player.setFullscreen(!player.getFullscreen());
      break;
      case 32:
        // Press Space
        player.getState() === 'paused' ? player.play() : player.pause();
      break;
      case 8:
        // Press Backspace
        closeVideo()
      break;
      case 39:
        // Press ->
        jumpBySeconds(5)
      break;
      case 37:
        // Press <-
        jumpBySeconds(-5)
      break;
    }
  })
}
