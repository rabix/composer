/**
 * Author: Milica Kadic
 * Date: 12/9/14
 * Time: 5:14 PM
 */
'use strict';

angular.module('registryApp.common')
    .directive('jsonPreview', ['$templateCache', '$uibModal', function($templateCache, $modal) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                title: '@',
                json: '@',
                id: '@'
            },
            template: '<a href ng-click="showJson()" id="{{ ::id }}"><i class="fa fa-code"></i> {{ title || \'JSON\' }}</a>',
            link: function(scope) {

                /**
                 * Show json in modal
                 */
                scope.showJson = function() {

                    $modal.open({
                        template: $templateCache.get('views/partials/json-preview.html'),
                        controller: 'ModalCtrl',
                        resolve: {
                            data: function() {
                                return {
                                    jsonString: scope.json,
                                    json: JSON.parse(scope.json)
                                };
                            }
                        }
                    });
                };
            }
        };
    }]);