'use strict';

angular.module('registryApp.util')
    .filter('repo', ['lodash', function(_) {
        return function(owner, name) {

            var outout = '';

            if (_.isEmpty(owner) && _.isEmpty(name)) {
                outout = 'none';
            } else if (!_.isEmpty(owner) && _.isEmpty(name)) {
                outout = 'owner:' + owner;
            } else if (_.isEmpty(owner) && !_.isEmpty(name)) {
                outout = 'name:' + name;
            } else {
                outout = owner + '/' + name;
            }

            return outout;

        };
    }]);