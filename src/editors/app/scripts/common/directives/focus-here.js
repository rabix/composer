'use strict';

angular.module('registryApp.common')
    .directive('focusHere', ['$timeout', function($timeout) {
        return {
            scope: {trigger: '@focusHere'},
            link: function(scope, element) {

                var dewatch = scope.$watch('trigger', function(value) {
                    if (value === 'true') {
                        $timeout(function() {
                            element[0].focus();
                        });
                    }
                });

                scope.$on('$destroy', function() {
                    dewatch();
                });
            }
        };
    }]);