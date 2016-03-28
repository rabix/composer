'use strict';

angular.module('registryApp.util')
    .filter('isEmpty', ['lodash', function(_) {
        return function(object) {

            return _.isEmpty(object);

        };
    }]);