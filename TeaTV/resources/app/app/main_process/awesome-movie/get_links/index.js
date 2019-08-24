const EventRegister = require('js-events-listener');

class GetLinks {

    constructor(props) {

        this.platform = props.platform;
        this.loadAddons = props.loadAddons;
        this._init(props.loadAddons);
    }

    async _init(loadAddons) {

        let [providers, hosts] = await Promise.all([
            loadAddons.loadProviders(),
            loadAddons.loadHosts()
        ]);
        this.providers = providers;
        this.hosts = hosts;
        this._notifyLoadSourcesReady();
    }

    _notifyLoadSourcesReady() {

        EventRegister.emit("AWESOME_MOVIE_LOAD_SOURCES_READY");
    }

    getLinks({ title, year, season, episode, type }, options = {}, onEachLink = () => { }, onEachEmbed = () => { }) {

        // TODO: add to queue
        console.log('getlinks', { title, year, season, episode, type });
        let { returnType,
            eachLinkCallback } = options;
        let cancel = false;
        let promiseArr = [];
        let directs = [];
        const includeTitle = obj => Object.assign(obj, { title });
        const getEmbed = this.providers.getEmbed({ title, year, season, episode, type }, async (embedObj) => {
            if (cancel) return;
            let singleEmbedObj = includeTitle(embedObj);
            onEachEmbed(singleEmbedObj);
            if (returnType == "embed" && singleEmbedObj != undefined && eachLinkCallback === true) return onEachLink(singleEmbedObj);
            if (returnType == "embed") return;
            const handleOneDirect = async () => {
                try {
                    /* 
                    if(singleEmbedObj.result.type === "direct") {
                        let { httpRequest  } = this.loadAddons.libs;
                        let isDieOrSize = await httpRequest.isLinkDie(singleEmbedObj.result.file);
                        if( isDieOrSize === false ) return;
                        directs.push(Object.assign(singleEmbedObj, {
                            result: [ Object.assign(singleEmbedObj.result, { size: isDieOrSize }) ],
                            host: singleEmbedObj.provider
                        }));
                    }
                    */
                    let singleGetDirect = this.hosts.getDirect([singleEmbedObj]);
                    let singleResults = await singleGetDirect.done();
                    if (cancel) return;
                    if (eachLinkCallback === true && singleResults.length !== 0) onEachLink(singleResults[0]);
                    directs = [...directs, ...singleResults];
                } catch (error) { }
            }
            promiseArr.push(handleOneDirect());
        });
        return {
            cancel: () => {
                cancel = true;
            },
            done: async () => {
                let embeds = await getEmbed.done();
                if (cancel) throw new Error("Canceled");
                if (returnType == "embed") return embeds;
                await Promise.all(promiseArr);
                if (cancel) throw new Error("Canceled");
                return directs;
            }
        }
    }
}

module.exports = exports.default = GetLinks;