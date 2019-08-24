const LoadAddonsClass   = require("./get_links/loadAddons.rn");
const GetlinksClass     = require("./get_links");
const EventRegister     = require("js-events-listener");

class AwesomeMovie {
    constructor(props) {
        this.platform   = props.platform;
        this.addons     = new LoadAddonsClass({ 
            dbPath          : props.dbPath, 
            platform        : this.platform,
            useExampleAddons: !!props.useExampleAddons ? props.useExampleAddons : false
        });
        this.getLinks   = undefined;
        this.init();
    }

    async init() {
        console.log('AwesomeMovie init');
        await this.addons.init();
        this.getLinks   = new GetlinksClass({ loadAddons: this.addons, platform: this.platform });
    }

    onReady(callback) {
        EventRegister.on("AWESOME_MOVIE_LOAD_SOURCES_READY", () => {
            typeof callback === "function" && callback();
        })
    }

    getRequirementDataForAddons() {
        let result = {
            host: {},
            provider: {}
        };
        let { all_host, all_provider } = this.addons.state;
        for(let host in all_host) {
            if(!!all_host[host].request_data) result.host[host] = all_host[host].request_data
        }
        for(let provider in all_provider) {
            if(!!all_provider[provider].request_data) result.provider[provider] = all_provider[provider].request_data
        }
        return result;
    }

    saveRequirementDataForAddons({ host, provider }) {
        this.addons.state.requirementData = { host, provider };
    }
}

module.exports = exports.default = AwesomeMovie;