const libs = require("../libs/index.node");

const openload = require("./hosts/openload").default;
const streamango = require("./hosts/streamango").default;
const thevideo = require('./hosts/hulu').default;

const Afdah = require('./providers/flixanity.js').default;


const dataSample = require("./test/data_sample.json")

const testHost = async (host, url, settings) => {

    let getLinkFromHost = await host(libs, settings).getLink(url);
    // let data = await getLinkFromHost(url);
    return getLinkFromHost;
}

const testProvider = async (provider, movieInfo, settings) => {

    let data = await provider(libs, movieInfo, settings);
    return data;
}

(async () => {
    
    // let data = await testHost(thevideo, "https://dus-05.hulu.so/play/dda90349d192e6b9475f0d049283e771c43f29e989902c4bffbc8898fbbaf13c475a5f962e-ddee5f4e9099a8a439156177d6", { platform: "nodejs" });
    // let data = await testHost(openload, "https://openload.co/embed/aoiV82o6DQ0", { platform: "android" });
    // let data = await testHost(vidlox, "https://vidlox.tv/embed-x1egv4ji5nwc.html");

    // console.log(data);
    
    let data = await testProvider(Afdah, {
        type: 'movie',
        title: "Logan",
        season: 5,
        episode: 2,
        year: 2017
    });


    console.log(data);

    // let data = {
    //     type: 'movie',
    //     title: 'Thor',
    //     season: 1,
    //     episode: 1,
    //     year: 2011 
    // };

    // for(let item of dataSample.provider.tv) {

    //     const a = require(`./providers/${item}.js`).default;
        
    //     console.log(`load source: ${item}`);
    //     try {
    //         let result = await testProvider(a, data);
    //         console.log(result);
    //     }catch(error) {}
        
    // } 

})();