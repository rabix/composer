class Api {

    constructor($rootScope, $resource, $http, CottonTailConfig) {
        'ngInject';

        this.serverConfig = null;

        this.$rootScope = $rootScope;
        this.$resource = $resource;
        this.$http = $http;
        this.CottonTailConfig = CottonTailConfig;
    }

    setupApi() {
        this.serverConfig = this.CottonTailConfig.getConfig();
        this._loadConfig();
        this._setResources();
        this.$rootScope.$broadcast('setupApi');
    }

    _loadConfig() {

        this.BASE = `http://${this.serverConfig.host}:${this.serverConfig.port}/api`;
    }

    _setResources() {

        this.files = this.$resource(this.BASE + '/fs' + '/:file', {file: '@file'}, {
            query: {method: 'GET'},
            create: {method: 'POST'},
            update: {method: 'PUT'}
        });

        this.toolbox = this.$resource(this.BASE + '/fs/toolbox', {}, {
            query: {method: 'GET'}
        });

        this.workspaces = this.$resource(this.BASE + '/fs', {}, {
            query: {method: 'GET'}
        });
    }
}

angular.module('cottontail').service('Api', Api);

export default Api;
