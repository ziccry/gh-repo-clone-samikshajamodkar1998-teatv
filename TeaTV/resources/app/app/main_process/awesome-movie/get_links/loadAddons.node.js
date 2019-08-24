const CONFIG_URL = "https://raw.githubusercontent.com/TeaTV/TeaTV-add-ons/master/add-ons/es5/config.json";
// const CONFIG_URL = "http://localhost:8000/config.json";
const libs = require("../libs/index.node");
const { httpRequest } = libs;
const Storage = require("dom-storage");
const compareVersions = require('compare-versions');
const queue = require("../get_links/queue");
const exampleAddons = require("../addons_example/useExampleAddons");

class LoadAddOns {
    constructor(props) {
        this.platform = props.platform;
        this.useExampleAddons = props.useExampleAddons;
        console.log(this.platform);
        this.libs = libs;
        this.CONFIG_URL = CONFIG_URL;
        this.state = {
            dbPath: props.dbPath,
            addOnsUrl: "",
            all_provider: {},
            all_host: {},
            requirementData: {
                host: {},
                provider: {}
            }
        };
    }

    async init() {
        console.log('loadAddons init');
        if (this.useExampleAddons) {
            this._loadAddonsExample();
            return;
        }
        await this._loadConfig();
        this._db = new Storage(this.state.dbPath + "/addons.json", { strict: false, ws: "  " });
        await Promise.all([
            this._loadRemote("provider"),
            this._loadRemote("host")
        ]);
    }

    _loadAddonsExample() {
        this.state.all_provider = exampleAddons.providers;
        this.state.all_host = exampleAddons.hosts;
    }

    async _loadConfig() {
        let configJson = await httpRequest.getJSON(this.CONFIG_URL);
        this.state.addOnsUrl = configJson["addon_list"];
        console.log("addOnsUrl: " + this.state.addOnsUrl);
    }

    _database() {
        return {
            getItem: async (name) => {
                let item = this._db.getItem(name);
                return item == null ? "{}" : item;
            },
            setItem: async (name, value) => {
                this._db.setItem(name, value);
                return;
            },
            removeItem: async (name) => {
                this._db.removeItem(name);
                return;
            }
        }
    }

    _compareVersionList(newList, currentList) {
        let needUpdatedList = {};
        let enableList = {};
        if (Object.keys(currentList).length === 0) return { enableList: {}, needUpdatedList: newList }
        for (let source in newList) {
            try {
                if (!currentList.hasOwnProperty(source)) {
                    needUpdatedList[source] = newList[source];
                } else if (compareVersions(newList[source].version, currentList[source].version) > 0) {
                    needUpdatedList[source] = newList[source];
                } else if (compareVersions(newList[source].version, currentList[source].version) == 0) {
                    enableList[source] = newList[source];
                }
            } catch (err) {
                console.log("error _compareVersionList: " + source, err);
            }

        }
        return { enableList, needUpdatedList };
    }

    async _saveNewSourceCode(needUpdatedList, type) {
        let promiseArr = [];
        const _loadOneSource = async (url, name) => {
            let jsString = await httpRequest.getHTML(url);
            await this._database().setItem(type + "_" + name, jsString);
        }
        for (let source in needUpdatedList) {
            let { url, name } = needUpdatedList[source];
            promiseArr.push(_loadOneSource(url, name))
        }
        await Promise.all(promiseArr);
    }

    async _loadIntoFunctions(type) {
        let list = this.state["all_" + type];
        let promiseArr = [];

        const _handleOneSource = async (name) => {

            let jsString = await this._database().getItem(type + "_" + name);
            jsString = jsString.replace("exports.default", "thisSource.function");
            jsString = jsString.replace(/exports\.testing(.*)\;/, "");
            let thisSource = {};

            try {
                eval(jsString);
                this.state["all_" + type][name].function = thisSource.function;
            } catch (err) {
                console.log("eror _loadIntoFunctions at source: " + name, err);
            }
        };
        for (let source in list) {
            promiseArr.push(_handleOneSource(source))
        }
        await Promise.all(promiseArr);
    }

    async _loadRemote(type) {
        let list = await httpRequest.getJSON(this.state.addOnsUrl);
        list = type === "provider" ? list.providers : list.hosts;
        // console.log("newest list", list);
        let currentList = await this._database().getItem("list" + type);
        currentList = JSON.parse(currentList);
        // console.log('currentList_'+type, currentList);
        let { needUpdatedList, enableList } = this._compareVersionList(list, currentList);
        // console.log( "needUpdatedList", needUpdatedList);
        // console.log( "enableList", enableList);
        await this._saveNewSourceCode(needUpdatedList, type);
        this.state["all_" + type] = Object.assign(needUpdatedList, enableList);
        // console.log("this.state.all_"+type, this.state["all_"+type])
        await this._database().setItem("list" + type, JSON.stringify(this.state["all_" + type]));
        await this._loadIntoFunctions(type);
    }

    _getRequirementData(sourceName, type) {
        let { requirementData } = this.state;
        let data = { platform: this.platform };
        if (!requirementData || !requirementData[type]
            || !requirementData[type][sourceName]) return data;

        return Object.assign(data, requirementData[type][sourceName]);
    }


    getProviderByType(type) {
        let results = {};
        for (let provider in this.state.all_provider) {
            if (this.state.all_provider[provider].type == type
                || this.state.all_provider[provider].type.indexOf(type) !== -1) {
                results[provider] = this.state.all_provider[provider];
            }
        }
        return results;
    }

    getSupportedHostForUrl(url) {
        let host;
        for (let host in this.state.all_host) {
            let hostDomains = this.state.all_host[host].domain;
            let allDomain = typeof hostDomains === "string" ? [hostDomains] : hostDomains;
            let didSupport = false;
            for (let i = 0; i < allDomain.length; i++) {
                if (url.indexOf(allDomain[i]) !== -1) {
                    // console.log('HERE', url, allDomain[i]);
                    didSupport = true;
                    break;
                }
            }
            if (didSupport) {
                host = this.state.all_host[host];
                return host;
            }
        }
    }

    loadProviders() {
        return {
            getEmbed: ({ title, year, season, episode, type }, onEachLink = () => { }) => {
                let proviers = this.getProviderByType(type);
                let promiseArr = [];
                let listEmbeds = [];
                const _handleOneProvider = async (provider) => {
                    try {
                        let settings = this._getRequirementData(provider.name, "provider");
                        let embedLinks = await provider.function(libs, { title, year, season, episode, type }, settings);
                        listEmbeds = [...listEmbeds, ...embedLinks];
                        embedLinks.forEach(val => onEachLink(val));
                    } catch (error) {
                        // console.log(error);
                    }
                    return;
                }
                for (let provider in proviers) {
                    promiseArr.push(queue.addToQueue(async () => {
                        return await _handleOneProvider(proviers[provider]);
                    }))
                }
                let cancel = false;
                return {
                    cancel: () => {
                        cancel = true;
                    },
                    done: async () => {
                        if (cancel) throw new Error("Get link direct - Canceled");
                        await Promise.all(promiseArr);
                        if (cancel) throw new Error("Get link direct - Canceled");
                        return listEmbeds;
                    }
                }
            }
        }
    }

    loadHosts() {
        return {
            getDirect: (embedLinkDatas) => {
                let results = [];
                const _handleOnEmbed = async (embedObject) => {
                    let url = embedObject.result.file;
                    console.log(url);
                    let host = this.getSupportedHostForUrl(url);
                    if (host == undefined) return;
                    try {
                        let settings = this._getRequirementData(host.name, "host");
                        let hostFunctionInstance = host.function(libs, settings);
                        let directLinkObject = await queue.addToQueue(async () => {
                            return await hostFunctionInstance.getLink(url);
                        });
                        // console.log("directLinkObject".toUpperCase(), directLinkObject);
                        if (directLinkObject == undefined || directLinkObject.result.length === 0) return;
                        directLinkObject = Object.assign(embedObject, directLinkObject);
                        results.push(directLinkObject);
                    } catch (error) {
                        console.log("ERROR getDirect " + url, error);
                    }
                }
                let promiseArr = embedLinkDatas.map(_handleOnEmbed);
                let cancel = false;
                return {
                    cancel: () => {
                        cancel = true;
                    },
                    done: async () => {
                        if (cancel) throw new Error("Get link direct - Canceled");
                        await Promise.all(promiseArr);
                        if (cancel) throw new Error("Get link direct - Canceled");
                        return results;
                    }
                }
            }
        }
    }
}

module.exports = exports.default = LoadAddOns;