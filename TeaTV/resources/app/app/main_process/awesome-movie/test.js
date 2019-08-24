const Awesome = require('./index.node');
const awesome = new Awesome({
    dbPath              : __dirname,
    platform            : "nodejs",
    useExampleAddons    : true
});
const libs = require('./libs/index.node');

const foo = [1], bar = [2];

const testProviders = async () => {
    let getEmbeds      =  awesome.getLinks.getLinks({
        type: 'movie',
        title: 'Karpenter',
        year: 2017
    }, { returnType: "direct", eachLinkCallback: true }, (embed) => {
        console.log(" embed single callback ", embed);
    });
    // console.log(getEmbeds);
    let embeds         = await getEmbeds.done();
    return embeds;
}

const testHosts = async () => {
    let link = await awesome.addons.state.all_host.openload.function(libs, "https://oload.stream/embed/aoiV82o6DQ0");
    // let link = await awesome.addons.state.all_host.streamango.function(libs, "https://streamango.com/embed/rrnsqobrsmklnmnc");
    return link;
}

const testAll = async (callback) => {
    let getDirects      = awesome.getLinks.getLinks({
        type: 'movie',
        title: 'Wonder Woman',
        year: 2017
    }, { returnType: "direct", eachLinkCallback: true }, callback);
    let directs         = await getDirects.done();
    return directs;
}

const testCancel = async () => {
    
    let getDirects      = awesome.getLinks.getLinks({
        type: 'movie',
        title: 'Karpenter',
        year: 2017
    }, { returnType: "embed", eachLinkCallback: false });
    setTimeout(() => {
        getDirects.cancel();
    }, 3000)
    let directs         = await getDirects.done();
    console.log('RESULT', JSON.stringify(directs, undefined, 4));
    
}

awesome.onReady(async () => {
    // console.log(awesome.addons.state);
    // let rData = awesome.getRequirementDataForAddons();
    // console.log("rDATA", rData);
    awesome.saveRequirementDataForAddons({
        provider: {
            "alluc-hand": {
                "api_key": "1234567"
            }
        }
    })
    // process.exit(0);
    try {
        
        let data = await testAll(obj => {

            // callback run each time link is return
            console.log('Return', JSON.stringify(obj, undefined, 4));
        });
        console.log('RESULT', JSON.stringify(data, undefined, 4));
        

    //    await testCancel();
    } catch (err) {
        console.log("ERRORR", err);
    }
});