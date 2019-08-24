
import * as cloudscraper from "react-native-cloudscraper"
const axios         = require('axios');
const StringDecoder = require('string_decoder').StringDecoder;
const converter     = require('byte-converter').converterBase2;
const qs            = require('qs');

const parseHeaderBody = (headers, body) => {
    let result = {
        headers: headers || {},
        body: body
    };
    let contentType = result.headers["content-type"] || result.headers["Content-Type"];

    if(contentType == undefined) {
        result.headers["content-type"] = "application/x-www-form-urlencoded";
        result.body = typeof body === 'object' ? qs.stringify(body) : body;
        return result;
    }

    if(contentType.includes("x-www-form-urlencoded")) {
        result.body = typeof body === 'object' ? qs.stringify(body) : body;
        return result;
    }

    if(contentType.includes("json")) {
        result.body = typeof body === 'object' ? JSON.stringify(body) : body;
        return result;
    }

}

class Request {
    constructor() {
        this.request = fetch;
    }

    async getHTML(url, headers) {
        try {
            let response = await fetch(url, { headers });
            let html = await response.text();
            return html;
        } catch(err) {
            throw new Error(err);
        }
        
    }

    async getJSON(url, headers) {
        try {
            let response = await fetch(url, { headers });
            let json = await response.json();
            return json;
        } catch(err) {
            throw new Error(err);
        }
    }

    async get(url, headers={}) {
        try {
            let response = await fetch(url, { headers });
            let textOrJSONString = await response.text();
            try {
                textOrJSONString = JSON.parse(textOrJSONString);
            }catch(e) {}
            
            return {headers: response ? response.headers._headers : {},data: textOrJSONString};
        } catch(err) {
            throw new Error(err);
        }
        return {headers: {}, data: {}};
    }


    async getHeader(url) {
        try {

            let response = await fetch(url); 
            return response.headers._headers;
        } catch(e) {
            return {};
        }
    }

    async post(url, headers={}, body) {
        let parsed = parseHeaderBody(headers, body);
        try {
            let response = await fetch(url, { 
                method: "POST",
                headers: parsed.headers,
                body: parsed.body
            });

            let textOrJSONString = await response.text();

            try {
                textOrJSONString = JSON.parse(textOrJSONString);
            }catch(e) {}
            
            return {headers:  response ? response.headers._headers : {}  ,data: textOrJSONString};
        } catch (err) {
            throw new Error(err);
        }
        return {headers: {}, data: {}};
    }

    getRedirectUrl(url) {
        return new Promise((resolve, reject) => {
            let isDone = false;
            let timeout = setTimeout(()=>{
                if(isDone === false) {
                    isDone = true;
                    reject("TIME OUT");
                } 
            }, 5000);
            axios.request({
                url: url,
                method: 'head',
                headers: {
                    Range: `bytes=0-0`
                },
                maxRedirects: 0
            }).then(response => {
                let { request } = response;
                isDone = true;
                clearTimeout(timeout);
                resolve(request.responseURL);
            })
            .catch(err => {
                let { request } = err;
                let url = request.responseURL;
                isDone = true;
                clearTimeout(timeout);
                resolve(url);
            })
        });
    }

    async getRedirectUrlOld(url) {
        let isDone = false;
        setTimeout(() => {
            if(isDone) throw new Error ("TIME_OUT");
        }, 5000);
        try {
            let response = await axios.request({
                url: url,
                method: 'head',
                headers: {
                    Range: `bytes=0-0`
                },
                maxRedirects: 0
            });
            let { request } = response;
            if(request == undefined) return false;
            // let url = request.res.headers.location;
            console.log(request.responseURL);
            isDone = true;
            return request.responseURL;
            
        } catch(err) {
            // dont know why it's in error for nodejs

            let { request } = err;
            if(request == undefined) return false;
            // console.log("getRedirectUrl", err)
            let url = request.responseURL;
            isDone = true;
            return url;
        }
    }

    async getCloudflare(url, headers={}){

        let res = await cloudscraper.get(url, { headers });
        let { _bodyText } = res;
        let textOrJSONString = _bodyText;
        try {
            textOrJSONString = JSON.parse(body);
        } catch(parseError) {}
        return { headers: res ? res.headers : {}, data:textOrJSONString };
    }


    redirectCloudflare(url){

        return new Promise((resolve, reject) => {
            cloudscraper.request({
                method: 'GET',
                url: url,
                encoding: 'utf8'
            }).then(res => {resolve(res)})
        })
    }

    async postCloudflare(url, headers, body) {
        let parsed = parseHeaderBody(headers, body);
        let res = await cloudscraper.request(url, {
            method: "POST",
            headers: parsed.headers,
            body: parsed.body
        });
        let { _bodyText } = res;
        let textOrJSONString = _bodyText;
        try {
            textOrJSONString = JSON.parse(body);
        } catch(parseError) {}
        return { headers: res ? res.headers : {}, data:textOrJSONString };
    }

    async isLinkDie(url) {

        if( url.indexOf('.m3u') != -1 ) return "NOR";

        let size     = await this.getFileSize(url);
        
        try {

            let sizeMb      = converter(+size, 'B', 'MB');

            if( sizeMb <= 20 ) return false;
            sizeMb = parseInt(+sizeMb);  
            if( sizeMb >= 1000 ) {
                sizeMb = converter(+size, 'B', 'GB');
                sizeMb = parseFloat(+sizeMb).toFixed(2);
                return `${sizeMb} GB`;
            }
            
            return parseInt(+sizeMb) + ' MB';
        } catch(e) {
            return false;
        }
         
    }

    async getFileSize(url) {

        let res = await axios.head(url);
        return res.headers["content-length"];
    }
}

module.exports = exports.default = new Request();