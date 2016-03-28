'use strict';

angular.module('registryApp.util')
    .filter('encode', [function() {
        return function(string) {

            return string.replace(/\//g, '&');

        };
    }]);