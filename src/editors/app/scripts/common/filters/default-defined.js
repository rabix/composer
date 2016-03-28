/**
 * Created by filip on 4.5.15..
 */

angular.module('registryApp.common')
    .filter('defined', [function() {
        return function(str) {
            return str || '-';
        };
    }]);