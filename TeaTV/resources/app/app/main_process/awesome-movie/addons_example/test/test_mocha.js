const expect = require('chai').expect;
const libs = require("../../libs/index.node");
const dataSample = require("./data_sample.json");

const openload = require("../hosts/openload");
const streamango = require("../hosts/streamango");
const vidlink = require("../hosts/vidlink")
const afdah = require("../hosts/afdah");

const primeware = require("../providers/primeware");
// const afdah = require('../providers/m4ufree');

const regUrl = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;

const testHost = async (host, url, settings) => {

    let hostInstance = host(libs, { platform: "nodejs" });
    let data = await hostInstance.getLink(url);
    // let data = await host(libs, url, { platform: "nodejs"});
    return data;
}

const testProvider = async (provider, movieInfo, settings) => {

    let data = await provider(libs, movieInfo, settings);
    return data;
}

function uniTestOneHost(hostName, hostFunction, link) {
  it(hostName, async () => {
    const data = await testHost(hostFunction, link);
    // expect(data.result[0].file).to.be.an('string');
    // expect(data).to.have.own.property('result');
    expect(data.result[0].file).to.match(regUrl);
  });
}  


function uniTestAllProvider(nameSource, hostFunction, info) {
  
  
  // it(nameSource, async () => {
  //   const data = await testProvider(nameSource, info, {});

  //   expect()
  // }); 
}

describe('host', () => {
  // dataSample.host.openload.map(link => uniTestOneHost("openload", openload, link));
  // dataSample.host.streamango.map(link => uniTestOneHost("streamango", streamango, link));
  dataSample.host.afdah.map(link => uniTestOneHost("afdah", afdah, link));
});

describe('provider', () => {

})