/**
 * Created by filip on 8/11/15.
 */

class Api {

    constructor($resource, $http) {
        'ngInject';

        this._loadConfig();
        this.$resource = $resource;
        this.$http = $http;
    }

    _loadConfig() {

        this.BASE = '/api';
        this.WORKSPACE = '/workspace';

    }

}

angular.module('cottontail')
    .service(Api);

export default Api;