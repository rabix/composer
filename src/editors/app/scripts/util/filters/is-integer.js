'use strict';

angular.module('registryApp.util')
    .filter('isInteger', [function() {
        return function(integer) {

            integer = integer || 0;

            return integer === parseInt(integer, 10);

        };
    }]);