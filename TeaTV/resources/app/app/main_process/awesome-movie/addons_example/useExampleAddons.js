module.exports = exports.default = {
  "providers": {
      "primeware": {
          "name": "primeware",
          "domain": "primeware.ag",
          "version": "0.0.1",
          "function": require("./providers/primeware").default,
          "type": ["movie", "tv"]
      },
      "afdah": {
          "name": "afdah",
          "domain": "afdah.to",
          "version": "0.0.1",
          "function": require("./providers/afdah").default,
          "type": ["movie"]
      },
      "alluc-hand": {
          "name": "alluc-hand",
          "domain": "alluc.ee",
          "version": "0.0.1",
          "function": require("./providers/alluc-hand").default,
          "type": ["movie", "tv"],
          "request_data": ["api_key"]
      },
      "flixanity": {
          "name": "flixanity",
          "domain": "flixanity.mobi",
          "version": "0.0.1",
          "function": require("./providers/flixanity").default,
          "type": ["movie", "tv"]
      },
      "gowatchfreemovies": {
          "name": "gowatchfreemovies",
          "domain": "gowatchfreemovies.to",
          "version": "0.0.1",
          "function": require("./providers/gowatchfreemovies").default,
          "type": ["movie", "tv"]
      },
      "m4ufree": {
          "name": "m4ufree",
          "domain": "m4ufree.club",
          "version": "0.0.1",
          "function": require("./providers/m4ufree").default,
          "type": ["movie", "tv"]
      },
      "mytv": {
          "name": "mytv",
          "domain": "api.teatv.net",
          "version": "0.0.1",
          "function": require("./providers/mytv").default,
          "type": ["movie", "tv"]
      },
      "playdk": {
          "name": "playdk",
          "domain": "api.teatv.net",
          "version": "0.0.1",
          "function": require("./providers/playdk").default,
          "type": ["movie", "tv"]
      },
      "putlockerhd": {
          "name": "putlockerhd",
          "domain": "api.teatv.net",
          "version": "0.0.1",
          "function": require("./providers/putlockerhd").default,
          "type": ["movie", "tv"]
      },
      "seehd": {
          "name": "seehd",
          "domain": "api.teatv.net",
          "version": "0.0.1",
          "function": require("./providers/seehd").default,
          "type": ["movie", "tv"]
      },
      "seehduno": {
          "name": "seehduno",
          "domain": "api.teatv.net",
          "version": "0.0.1",
          "function": require("./providers/seehduno").default,
          "type": ["tv", "movie"]
      }
  },
  "hosts": {
      "streamango": {
          "name": "streamango",
          "domain": "streamango.com",
          "version": "0.0.1",
          "function": require("./hosts/afdah").default
      },
      "openload": {
          "name": "openload",
          "domain": ["openload.com", "openload.co", "oload.tv", "oload.stream", "oload.info"],
          "version": "0.0.5",
          "function": require("./hosts/openload").default
      },
      "teamdk": {
          "name": "teamdk",
          "domain": ["teamdk.net"],
          "version": "0.0.1",
          "function": require("./hosts/teamdk").default
      },
      "estream": {
          "name": "estream",
          "domain": ["estream.to"],
          "version": "0.0.1",
          "function": require("./hosts/estream").default
      },
      "thevideo": {
          "name": "thevideo",
          "domain": ["thevideo.me"],
          "version": "0.0.1",
          "function": require("./hosts/thevideo").default
      },
      "vidlink": {
          "name": "vidlink",
          "domain": ["vidlink.org"],
          "version": "0.0.1",
          "function": require("./hosts/vidlink").default
      },
      "vidoza": {
          "name": "vidoza",
          "domain": ["vidoza.net"],
          "version": "0.0.1",
          "function": require("./hosts/vidoza").default
      },
      "vidstreaming": {
          "name": "vidstreaming",
          "domain": ["vidstreaming.net"],
          "version": "0.0.1",
          "function": require("./hosts/vidstreaming").default
      },
      "vidushare": {
          "name": "vidushare",
          "domain": ["vidushare.com"],
          "version": "0.0.1",
          "function": require("./hosts/vidushare").default
      }
  }
};