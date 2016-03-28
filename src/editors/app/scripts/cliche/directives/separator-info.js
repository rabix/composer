/**
 * Author: Milica Kadic
 * Date: 12/02/14
 * Time: 4:36 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .directive('separatorInfo', ['lodash', function(_) {
        return {
            restrict: 'E',
            template: '<span>{{ view.separator }}</span>',
            scope: {
                type: '@',
                model: '='
            },
            controller: ['$scope', 'Separator', function($scope, Separator) {

                var option;
                var map = Separator.getMap();

                $scope.view = {};

                option = _.find(map[$scope.type], {value: $scope.model});

                $scope.view.separator = option ? option.name : 'space';

                $scope.$watch('model', function(n, o) {
                    if (n !== o) {
                        option = _.find(map[$scope.type], {value: n});
                        $scope.view.separator = option ? option.name : 'space';
                    }
                });

            }],
            link: function() {
            }
        };
    }]);