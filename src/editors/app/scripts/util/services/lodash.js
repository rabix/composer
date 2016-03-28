/**
 * Created by Maya on 1.4.15.
 */

'use strict';

angular.module('registryApp.util')
    .service('lodash', [function() {
        return window.lodash || window._;
    }]);