const path = require('path');
function ondeviceup(host, url, Client, DefaultMediaReceiver) {
  return new Promise((resolve, reject) => {
    var client = new Client();

    client.connect(host, function () {
      console.log('connected, launching app ...');

      client.launch(DefaultMediaReceiver, function (err, player) {
        var media = {

          // Here you can plug an URL to any mp4, webm, mp3 or jpg file with the proper contentType.
          contentId: url,
          contentType: 'video/mp4',
          streamType: 'BUFFERED', // or LIVE

          // Title and cover displayed while buffering
          metadata: {
            type: 0,
            metadataType: 0,
            title: "TeaTV Desktop",
            images: [
              { url: 'https://i.imgur.com/tZdUTSM.png' }
            ]
          }
        };

        // player.on('status', function (status) {
        //   console.log(status)
        //   console.log('status broadcast playerState = ' + status.playerState);
        // });

        console.log(`app ${player.session.displayName} launched, loading media ${media.contentId} ...`);

        player.load(media, { autoplay: true }, function (err, status) {
          console.log('media loaded playerState = ' + status.playerState);
          resolve(player);
          // Seek to 2 minutes after 15 seconds playing.
          // setTimeout(function () {
          //   player.seek(2 * 60, function (err, status) {
          //     //
          //   });
          // }, 15000);

        });

      });

    });

    client.on('error', function (err) {
      console.log('Error: %s', err.message);
      reject(err.message);
      client.close();
    });
  })
}

const farRequire = (nodeModulePath, name) => {
  return require(path.join(nodeModulePath, '/' + name));
}

function runCast(nodeModulePath) {
  if (window.platform == "web") return;
  const Client = farRequire(nodeModulePath, 'castv2-client').Client;
  const DefaultMediaReceiver = farRequire(nodeModulePath, 'castv2-client').DefaultMediaReceiver;
  const mdns = farRequire(nodeModulePath, 'mdns');
  const browser = mdns.createBrowser(mdns.tcp('googlecast'));

  class Cast {
    constructor() {
      this.devices = {};
      this.deviceListener = this.deviceListener.bind(this);
      this.castToDevice = this.castToDevice.bind(this);
      this.listDevice = this.listDevice.bind(this);
      this.canCast = this.canCast.bind(this);
      this.deviceListener();
    }

    deviceListener() {
      browser.on('serviceUp', (service) => {
        // console.log('service', service);
        console.log('found device "%s" at %s:%d', service.txtRecord.md, service.addresses[0], service.port);
        // ondeviceup(service.addresses[0], Client, DefaultMediaReceiver);
        this.devices[service.name] = {
          name: service.txtRecord.md,
          address: service.addresses[0],
          port: service.port
        }
      });

      browser.start();
    }

    canCast() {
      return Object.keys(this.devices).length > 0
    }

    listDevice() {
      return this.devices;
    }

    castToDevice(deviceAddress, url) {
      return ondeviceup(deviceAddress, url, Client, DefaultMediaReceiver);
    }

  };

  window.cast = new Cast();



};


window.getConstants().then(constants => {
  window.CONSTANTS = constants;
  console.log(constants);
  let nodeModulePath = path.join(constants.appPath, "/node_modules")
  console.log(nodeModulePath);
  runCast(nodeModulePath);
});