class ConfigProvider {

    constructor($resource, $http, $location) {
        'ngInject';

        var protocol = $location.protocol();
        var host = $location.host();
        var port = $location.port();

        this.BASE = protocol + '://' + host + ':' + port + '/api/common';
        this.$resource = $resource;
        this.$http = $http;
        this.setupConfig();
    }

    setupConfig() {
        this.config = this.$resource(this.BASE + '/config', {}, {
            query: {method: 'GET'},
            create: {method: 'POST'}
        });
    }
}

angular.module('cottontail').service('ConfigProvider', ConfigProvider);

export default ConfigProvider;
