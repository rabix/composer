'use strict';

angular.module('registryApp.common')
    .directive('error', ['$templateCache', 'lodash', function($templateCache, _) {
        return {
            restrict: 'E',
            template: $templateCache.get('views/partials/error.html'),
            link: function(scope) {

                scope.errors = [];

                scope.$on('httpError', function(obj, message) {
                    if (typeof message.message !== 'string') {
                        return;
                    }

                    var messages = _.pluck(scope.errors, 'message');

                    if (!_.contains(messages, message.message)) {
                        scope.errors.push(message);
                    }
                });

                /**
                 * Close the error alert
                 */
                scope.closeErrors = function() {
                    scope.errors = [];
                };

            }
        };
    }]);