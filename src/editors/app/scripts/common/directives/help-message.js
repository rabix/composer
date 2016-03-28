/**
 * Created by Maya on 2.4.15.
 */
'use strict';

angular.module('registryApp.common')
    .directive('helpMessage', ['lodash', function(_) {
        return {
            scope: {
                message: '@'
            },
            restrict: 'E',
            replace: true,
            template: '<div class="help-message">' +
            '<i ng-if="showButton" class="fa fa-question-circle help-button"></i>' +
            '<help-message-popover></help-message-popover>' +
            '</div>',
            link: function(scope, element) {
                var MAX_WIDTH = 500;

                scope.showButton = !_.isEmpty(scope.message);
                scope.showPopup = false;
                scope.position = 'right';

                function handler(e) {
                    scope.showPopup = !scope.showPopup;
                    var width;

                    if (e.clientX > ($(window).width() / 2)) {
                        width = e.clientX - 40;
                        scope.position = 'left';
                    } else {
                        width = $(window).width() - e.clientX - 40;
                        scope.position = 'right';
                    }

                    width = width > MAX_WIDTH ? MAX_WIDTH : width;
                    angular.element(element).find('.help-popup').css('width', width);


                    scope.$apply();
                }

                angular.element(element).on('click', '.help-button', handler);

                scope.$on('$destroy', function() {
                    angular.element(element).off('click', '.help-button', handler);
                });
            }
        };
    }])
    .directive('helpMessagePopover', ['$templateCache', '$document', function($templateCache, $document) {
        return {
            restrict: 'EA',
            replace: true,
            template: $templateCache.get('views/partials/help-message-popover.html'),
            link: function(scope) {
                function closeHandler(e) {
                    var target = $(e.target);

                    // hide popover only if click is outside help message directive
                    if (scope.showPopup && target.parents('.help-message').length === 0) {
                        scope.showPopup = false;
                        scope.$apply();
                    }
                }

                // remove event listener when popover isn't visible
                scope.$watch('showPopup', function(n) {
                    if (n) {
                        $document.on('click', closeHandler);
                    } else {
                        $document.off('click', closeHandler);
                    }
                });
            }
        };
    }]);