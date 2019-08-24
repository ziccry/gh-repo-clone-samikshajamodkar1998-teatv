require('./mobile');
const EventRegister = require('js-events-listener');

EventRegister.emit("MESSAGE", JSON.stringify({
    type: "init",
    payload: {
        dbPath: __dirname,
        platform: "nodejs"
    }
}))

EventRegister.on("TO_MESSAGE", msg => {
    if(msg == "ready") {
        startTest();
    } else {
        console.log(msg);
    }
})

const startTest = () => {
    EventRegister.emit("MESSAGE", JSON.stringify({
        type: "get link",
        payload: {
            type: "movie",
            title: "Wonder Woman",
            year: 2017,
            eachLinkCallback: true,
            returnType: "direct"
        }
    }))
}