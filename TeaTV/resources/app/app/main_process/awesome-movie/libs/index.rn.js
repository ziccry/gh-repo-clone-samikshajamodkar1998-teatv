class JSDOM {
  constructor(...args) {
      throw new Error("NOT SUPPORTED IN RN");
  }
}

const jsdom = { JSDOM };

module.exports = exports.default = {
  cheerio         : require('cheerio-without-node-native'),
  jsdom           : jsdom,
  httpRequest     : require('./http_request/request.rn'),
  cryptoJs        : require("crypto-js"),
  _               : require('lodash'),
  axios           : require('axios'),
  stringHelper    : require('./string_helper'),
  base64          : require('base-64'),
  qs              : require('qs')
};