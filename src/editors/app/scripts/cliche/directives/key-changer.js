/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .directive('keyChanger', ['lodash', function(_) {

        return {
            restrict: 'A',
            scope: {
                key: '=',
                items: '=',
                hasError: '='
            },
            link: function(scope, element) {
                function checkKey() {
                    scope.hasError = _.where(scope.items, {key: scope.key}).length > 1;
                    if (!scope.$$phase) {
                        scope.$apply();
                    }
                }

                angular.element(element).on('keypress keyup keydown blur change', _.debounce(checkKey, 100));

                scope.$on('$destroy', function() {
                    angular.element(element).off('keypress keyup keydown blur change');
                });
            }
        };
    }]);