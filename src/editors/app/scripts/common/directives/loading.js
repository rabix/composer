'use strict';

angular.module('registryApp.common')
    .service('Loading', [function() {

        var self = {};

        self.classes = [];

        /**
         * Set classes for the screen
         * @param classes
         */
        self.setClasses = function(classes) {
            self.classes = classes;
        };

        return self;
    }])
    .directive('loading', ['$timeout', 'Loading', 'lodash', function($timeout, Loading, _) {
        return {
            scope: {
                loading: '='
            },
            link: function(scope) {

                var timeoutId;

                scope.classes = Loading.classes;

                if (scope.loading) {
                    scope.classes.push('loading');
                    scope.classes.push('loading-fade');
                }

                scope.$watch('loading', function(newVal, oldVal) {

                    if (newVal === true && !_.contains(scope.classes, 'loading')) {
                        scope.classes.push('loading');
                        scope.classes.push('loading-fade');
                    } else if (newVal === false) {
                        scope.stopLoadingDelay();

                        _.remove(scope.classes, function(cls) {
                            return cls === 'loading-fade';
                        });

                        timeoutId = $timeout(function() {
                            _.remove(scope.classes, function(cls) {
                                return cls === 'loading';
                            });
                        }, 300);
                    }
                });

                scope.stopLoadingDelay = function() {
                    if (angular.isDefined(timeoutId)) {
                        $timeout.cancel(timeoutId);
                        timeoutId = undefined;
                    }
                };

                scope.$on('$destroy', function() {
                    scope.stopLoadingDelay();
                });

            }
        };
    }]);