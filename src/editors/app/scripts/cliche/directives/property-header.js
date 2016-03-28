/**
 * Author: Milica Kadic
 * Date: 12/02/14
 * Time: 3:58 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .directive('propertyHeader', ['$templateCache', function($templateCache) {
        return {
            template: $templateCache.get('views/cliche/property/property-header.html'),
            scope: {
                position: '=?',
                name: '@',
                type: '@',
                toolType: '@',
                mode: '@',
                index: '=',
                idPrefix: '@',
                itemType: '@',
                isRequired: '=',
                adapter: '=?',
                symbols: '=',
                handle: '&'
            },
            controller: ['$scope', 'Helper', function($scope, Helper) {

                $scope.view = {};

                if ($scope.toolType === 'tool') {

                    $scope.view.position = $scope.position || 0;

                    /* watch for position to change */
                    $scope.$watch('position', function(n, o) {
                        if (n !== o) {
                            $scope.view.position = n || 0;
                        }
                    });
                }

                /**
                 * Trigger handler for particular action
                 *
                 * @param action
                 * @param e
                 */
                $scope.triggerAction = function(action, e) {

                    if ($scope.toolType === 'script' && action === 'toggle') {
                        return false;
                    }

                    Helper.stopPropagation(e);

                    $scope.handle({action: action});

                };


            }],
            link: function() {
            }
        };
    }]);