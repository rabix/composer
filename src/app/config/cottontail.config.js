class CottonTailConfig {
    constructor() {
        this.config = null;
    }

    setConfig(conf) {
        this.config = conf;
    }

    getConfig() {
        return this.config;
    }
}

angular.module('cottontail').service('CottonTailConfig', CottonTailConfig);

export default CottonTailConfig;
