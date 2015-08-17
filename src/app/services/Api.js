/**
 * Created by filip on 8/11/15.
 */

class Api {

    constructor($resource, $http) {
        'ngInject';

        this._loadConfig();
        this.$resource = $resource;
        this.$http = $http;
        this._setResources();
    }



    _loadConfig() {

        this.BASE = '/api';
        this.WORKSPACE = '/:workspace';

    }

    _setResources() {

        this.file = this.$resource(this.BASE + '/fs'+ this.WORKSPACE + '/:file', {ws: '@ws', file: '@file'}, {
            query: {method: 'GET'},
            add: {method: 'POST'},
            update: {method: 'PUT'}
        });

    }


}

angular.module('cottontail')
    .service('Api', Api);

export default Api;
