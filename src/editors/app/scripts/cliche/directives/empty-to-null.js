'use strict';

angular.module('registryApp.cliche')
    .directive('emptyToNull', [function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attr, ngModel) {
                ngModel.$parsers.push(function(val) {
                    if (val === '') {
                        return null;
                    }

                    return val;
                });
            }
        }
    }]);