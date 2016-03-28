/**
 * Created by Maya on 23.4.15.
 */
'use strict';

angular.module('registryApp.common')
    .directive('ngEnter', ['$document', function($document) {
        return {
            scope: {
                callback: '&ngEnter'
            },
            link: function(scope) {
                $document.on('keydown keyup keypress', function(event) {
                    if (event.which === 13) {
                        scope.$apply(function() {
                            scope.callback();
                        });
                    }

                    event.preventDefault();
                });

                scope.$on('$destroy', function() {
                    $document.off('keydown keyup keypress');
                });
            }
        };

    }]);