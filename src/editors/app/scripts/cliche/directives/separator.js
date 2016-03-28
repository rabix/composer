/**
 * Author: Milica Kadic
 * Date: 11/20/14
 * Time: 6:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .directive('separator', ['$templateCache', 'lodash', function($templateCache, _) {
        return {
            restrict: 'E',
            template: $templateCache.get('views/cliche/partials/separator.html'),
            scope: {
                type: '@',
                model: '=',
                isDisabled: '='
            },
            controller: ['$scope', 'Separator', function($scope, Separator) {

                var option;

                $scope.view = {};

                $scope.view.map = Separator.getMap();

                option = _.find($scope.view.map[$scope.type], {value: $scope.model});

                $scope.view.separator = option ? option.name : 'space';

                $scope.$watch('view.separator', function(n, o) {
                    if (n !== o) {
                        var option = _.find($scope.view.map[$scope.type], {name: n});
                        $scope.model = option.value;
                    }
                });

                $scope.$watch('model', function(n, o) {
                    if (n !== o) {
                        option = _.find($scope.view.map[$scope.type], {value: n});
                        $scope.view.separator = option ? option.name : 'space';
                    }
                });

            }],
            link: function() {
            }
        };
    }]);