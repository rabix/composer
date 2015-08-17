/**
 * Created by filip on 8/11/15.
 */

import Model from './base.model';

class Workspace extends Model{

    constructor() {
        super();
    }

    get() {

    }
}


angular.module('cottontail')
    .factory('Workspace', () => new Workspace());

export default Workspace;