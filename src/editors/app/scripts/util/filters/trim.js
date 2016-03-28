'use strict';

angular.module('registryApp.util')
    .filter('trim', [function() {
        return function(string) {

            return string.trim();

        };
    }]);