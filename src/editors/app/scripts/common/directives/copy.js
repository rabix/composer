/**
 * Author: Maja Nedeljkovic
 * Date: 11/18/15
 * Time: 13:16 PM
 */

/* globals Clipboard */

angular.module('registryApp.common')
    .directive('copy', ['$templateCache', '$timeout', function($templateCache, $timeout) {
        'use strict';

        return {
            restrict: 'E',
            scope: {
                src: '@'
            },
            template: $templateCache.get('views/partials/copy.html'),
            link: function(scope, element) {

                scope.view = {};
                scope.view.text = 'Copy';
                scope.view.error = '';
                scope.view.tooltipMessage = '';
                scope.view.isTooltipOpen = false;

                var timeoutId;

                var $button = element.find('button');
                var clipboard = new Clipboard($button.get(0));

                clipboard.on('success', function(e) {
                    e.clearSelection();

                    scope.view.text = 'Copied';
                    scope.view.copying = true;
                    scope.$apply();

                    timeoutId = _resetText(2000);
                });

                clipboard.on('error', function(e) {

                    scope.view.tooltipMessage = fallbackMessage(e.action);
                    scope.view.isTooltipOpen = true;
                    scope.$apply();

                    timeoutId = _resetText(5000);
                });

                function _resetText(time) {
                    return $timeout(function() {
                        scope.view.text = 'Copy';
                        scope.view.copying = false;
                        scope.view.isTooltipOpen = false;
                    }, time);
                }

                // gotten from clipboard.js website
                function fallbackMessage(action) {
                    var actionMsg = '';
                    var actionKey = (action === 'cut' ? 'X' : 'C');

                    if (/iPhone|iPad/i.test(navigator.userAgent)) {
                        actionMsg = 'Not supported';
                    } else if (/Mac/i.test(navigator.userAgent)) {
                        actionMsg = 'Press ⌘-' + actionKey + ' to ' + action;
                    } else {
                        actionMsg = 'Press Ctrl-' + actionKey + ' to ' + action;
                    }

                    return actionMsg;
                }


                scope.cancelTimeout = function() {
                    if (angular.isDefined(timeoutId)) {
                        $timeout.cancel(timeoutId);
                        timeoutId = undefined;
                    }
                };

                scope.$on('$destroy', function() {
                    clipboard.destroy();
                    scope.cancelTimeout();
                });
            }
        };
    }]);