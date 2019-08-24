
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const request = require("request")
const jqueryUrl = "http://code.jquery.com/jquery-1.11.0.min.js";
const { httpRequest } = require("./libs")


const getOpenloadAll = async url => {
    let html = await httpRequest.getHTML(url);
    if (html.indexOf('<h3>We’re Sorry!</h3>') > -1) throw new Error("Invalid fileId");
    let jquery = await httpRequest.getHTML(jqueryUrl);
    const dom = new JSDOM(html, {
        runScripts: "outside-only"
    });
    const window = dom.window;
    window.eval(jquery);
    var script = html.substring(html.indexOf("ﾟωﾟﾉ= /｀ｍ´"));
    script = script.substring(0, script.indexOf("</script>"));
    window.eval(script);
    script = script.substring(script.indexOf("$(document)"));
    script = script.substring(script.indexOf("var"))
    script = script.substring(0, script.indexOf("ﾟωﾟ"))
    script = script.substring(0, script.lastIndexOf("});"))
    script = script.replace("document.createTextNode.toString().indexOf('[native code')", "1");
    script = script.replace("_0x3d7b02=[];", "");
    window.eval(script);
    let streamUrl = window.document.getElementById("streamurj").innerHTML;
    return "https://openload.co/stream/" + streamUrl + "?mime=true";
}

const getOpenload = async html => {
    if (html.indexOf('<h3>We’re Sorry!</h3>') > -1) throw new Error("Invalid fileId");
    let jquery = await httpRequest.getHTML(jqueryUrl);
    const dom = new JSDOM(html, {
        runScripts: "outside-only"
    });
    const window = dom.window;
    window.eval(jquery);
    var script = html.substring(html.indexOf("ﾟωﾟﾉ= /｀ｍ´"));
    script = script.substring(0, script.indexOf("</script>"));
    window.eval(script);
    script = script.substring(script.indexOf("$(document)"));
    script = script.substring(script.indexOf("var"))
    script = script.substring(0, script.indexOf("ﾟωﾟ"))
    script = script.substring(0, script.lastIndexOf("});"))
    script = script.replace("document.createTextNode.toString().indexOf('[native code')", "1");
    script = script.replace("_0x3d7b02=[];", "");
    window.eval(script);
    let streamUrl = window.document.getElementById("streamurj").innerHTML;
    return "https://openload.co/stream/" + streamUrl + "?mime=true";
}

const getOpenloadOld = (html) => {
    return new Promise((resolve, reject) => {
        if (html.indexOf('<h3>We’re Sorry!</h3>') > -1) return reject("Invalid fileId")
        
            request(jqueryUrl, function (err, res, jquery) {
        
                const dom = new JSDOM(html, {
                    runScripts: "outside-only"
                });
            
                const window = dom.window;
            
                window.eval(jquery)
            
                var script = html.substring(html.indexOf("ﾟωﾟﾉ= /｀ｍ´"));
            
                script = script.substring(0, script.indexOf("</script>"));
                window.eval(script);
            
                script = script.substring(script.indexOf("$(document)"))
        
                script = script.substring(script.indexOf("var"))
            
                script = script.substring(0, script.indexOf("ﾟωﾟ"))
            
                script = script.substring(0, script.lastIndexOf("});"))
            
            
            
                script = script.replace("document.createTextNode.toString().indexOf('[native code')", "1");
            
                script = script.replace("_0x3d7b02=[];", "");
            
                window.eval(script);
            
                let streamUrl = window.document.getElementById("streamurj").innerHTML;
            
                return resolve("https://openload.co/stream/" + streamUrl + "?mime=true");
            })
            
    });
}

module.exports = getOpenloadAll;