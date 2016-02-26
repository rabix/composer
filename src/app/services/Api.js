/**
 * Created by filip on 8/11/15.
 */

class Api {

    constructor($resource, $http, Config) {
        'ngInject';

        this.Config = Config;

        this._loadConfig();
        this.$resource = $resource;
        this.$http = $http;
        this._setResources();
    }

    _loadConfig() {

        this.BASE =  this.Config.DOMAIN + '/api';
        this.WORKSPACE = this.BASE + '/:workspace';

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

Api.$inject = ['$resource', '$http', 'Config'];

angular.module('cottontail').service('Api', Api);

export default Api;
