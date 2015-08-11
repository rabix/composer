/**
 * Created by filip on 8/11/15.
 */

class Workspace {
    constructor(Api) {
        'ngInject';

        this.Api = Api;
    }

    get() {

    }
}


angular.module('cottontail')
    .factory('Workspace', () => new Workspace());

export default Workspace;