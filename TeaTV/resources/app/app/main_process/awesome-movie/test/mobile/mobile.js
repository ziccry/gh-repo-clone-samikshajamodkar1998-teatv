const Awesome = require("../../index");
let awesome;
const libs = require("../../libs");
const EventRegister = require('js-events-listener');

let movieProcess = {};

const sendToMobile = (msq) => {
    
    EventRegister.emit("TO_MESSAGE", msq);
}

const handleGetLink = async (movieInfo) => {
    console.log(":MOVIE INFO", movieInfo);
    console.log(awesome.addons.state);
    try {
        let { type, title, season, episode, year, returnType } = movieInfo;
        const onEachLinkReturn = (linkObj) => {
            sendToMobile("onEachLinkReturn" + JSON.stringify(linkObj) );
        }
        movieProcess[title] = awesome.getLinks.getLinks({ 
            type, title, season, episode, year 
        } , {
            returnType, eachLinkCallback: true
        }, onEachLinkReturn);
        let allLinksReturn = await movieProcess[title].done();
        sendToMobile("allLinksReturn" + JSON.stringify(allLinksReturn) );
        if(!!movieProcess[title]) delete movieProcess[title];
    } catch(err) {
        console.log("handleGetLink", err);
    }
}

const handleCancel = (movieInfo) => {

    let { title } = movieInfo;
    if(!!movieProcess[title] && !!movieProcess[title].cancel) {
        movieProcess[title].cancel();
    }
}

EventRegister.on('MESSAGE', (msg) => {

    let obj = JSON.parse(msg);
    console.log(obj);
    switch(obj.type) {
        case "init": 
            awesome = new Awesome(obj.payload);
            awesome.onReady(() => {
                sendToMobile("ready");
            });
        break;
        case "get link": handleGetLink(obj.payload); break;
        case "cancel": handleCancel(obj.payload); break;

        break;
    }
});