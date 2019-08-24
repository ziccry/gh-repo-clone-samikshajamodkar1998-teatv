var ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
var ffbinaries = require('ffbinaries');
const axios = require('axios')
const GBSIZE = 1024 * 1024 * 1024;
const storage = require('electron-json-storage');
const p = require('path');

class VideoInfo {
    constructor() {
        this.setup = this.setup.bind(this);
        this.convertHeightToResolution = this.convertHeightToResolution.bind(this);
        this.getInfo = this.getInfo.bind(this);
        this.getInfoFfmpeg = this.getInfoFfmpeg.bind(this);
        this.isDoneSetup = this.isDoneSetup.bind(this);
        this.convertWebmToMp4 = this.convertWebmToMp4.bind(this);
        this.data = {};
        this.method = 'http-request';
    }

    setup({ path, platform }) {
        return new Promise((resolve, reject) => {
            this.data = { path, platform };
            // platform = osx-64 // windows-32 //windows-64 //linux-64 //linux-32
            storage.get("setup_ffmpeg", (err, arg) => {
                if (err) return reject(err);
                if (arg.status !== true) {
                    ffbinaries.downloadFiles(['ffmpeg', 'ffprobe'], { platform: platform, quiet: true, destination: path }, () => {
                        storage.set("setup_ffmpeg", { status: true }, (err) => {
                            if (err) return reject(err);
                            ffmpeg.setFfmpegPath(path);
                            ffmpeg.setFfprobePath(p.join(path, process.platform == 'wind32' ? '/ffprobe.exe' : '/ffprobe'));
                            this.method = 'ffmpeg';
                            resolve();
                        });
                    });
                } else {
                    ffmpeg.setFfmpegPath(path);
                    ffmpeg.setFfprobePath(p.join(path, process.platform == 'wind32' ? '/ffprobe.exe' : '/ffprobe'));
                    this.method = 'ffmpeg';
                    resolve();
                }
            })
        });
    }

    isDoneSetup() {
        return this.method === 'ffmpeg'
    }

    getInfo(url) {
        if (this.method === 'ffmpeg') {
            return this.getInfoFfmpeg(url)
        } else {
            return Promise.reject('Not done setup')
        }
    }

    getInfoFfmpeg(url) {
        return new Promise((resolve, reject) => {
            ffmpeg.setFfmpegPath(this.data.path);
            ffmpeg.ffprobe(url, (err, metadata) => {
                // console.log(metadata);
                if (err) return reject(err);
                if (typeof metadata === "undefined") return reject("Not a Video");
                let { streams, format } = metadata;
                let { width, height } = streams[0];
                let { size, duration } = format;
                size = (size / GBSIZE).toFixed(2);
                duration = Math.floor(duration / 60);
                resolve({
                    resolution: this.convertHeightToResolution(width, height),
                    size: size,
                    duration: duration
                })
            });
        });
    }

    convertHeightToResolution(width, height) {
        if (width > 1920) return "2K";
        if (width > 1280) return "1080p";
        if (width > 640) return "720p";
        if (width > 480) return "480p";
        return "360p";
    }

    convertWebmToMp4(path) {
        if (this.isDoneSetup() === false) return Promise.reject();
        // let filename = p.basename(path, p.extname(path));
        // let savePath = path.includes(filename + ".webm") ? path.replace(filename + ".webm", filename + ".mp4") : path + "_outputfile.mp4";
        // console.log(savePath);
        // return new Promise((resolve, reject) => {
        //     ffmpeg(path)
        //         .output(savePath)
        //         .on('error', function (e) {
        //             console.log('ERR', e)
        //             reject(e);
        //         })
        //         .on('end', function () {
        //             resolve(savePath);
        //         })
        //         .run();
        // });
        let ffmpegPath = p.join(this.data.path, "/ffmpeg");
        let filename = p.basename(path, p.extname(path));
        let savePath = path.includes(filename + ".webm") ? path.replace(filename + ".webm", filename + ".mp4") : path + "_outputfile.mp4";
        const command = `"${ffmpegPath}" -y -i ${path} ${savePath}`;
        return new Promise((resolve, reject) => {
            const exec = require('child_process').exec
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`)
                    return reject(error);
                }
                resolve(savePath);
            });
        })
    }
}

let videoInfo = new VideoInfo();

module.exports = videoInfo;
exports.default = videoInfo;
exports.videoInfo = videoInfo;