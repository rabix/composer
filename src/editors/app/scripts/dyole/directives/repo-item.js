'use strict';
angular.module('registryApp.dyole').directive('repoItem', ['RecursionHelper', '$templateCache',
    function(RecursionHelper, $templateCache) {
        return {
            restrict: 'E',
            scope: {
                directory: '='
            },
            template: $templateCache.get('views/dyole/repo-item.html'),
            compile: function(element) {
                return RecursionHelper.compile(element, function(scope, element) {

                });
            }
        }
    }
]);