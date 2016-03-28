/**
 * Created by filip on 30.6.15..
 */


'use strict';

angular.module('registryApp.cliche')
    .directive('selectValue', ['$templateCache', 'lodash', function($templateCache, _) {
        return {
            restrict: 'E',
            template: $templateCache.get('views/cliche/partials/select.html'),
            scope: {
                type: '@',
                model: '=',
                isDisabled: '='
            },
            controller: ['$scope', function($scope) {

                var option;

                $scope.view = {};

                $scope.view.map = {
                    cpu: [
                        {name: 'Single threaded', value: '1'},
                        {name: 'Multi threaded', value: '0'}
                    ]
                };

                option = _.find($scope.view.map[$scope.type], {value: $scope.model});

                $scope.view.value = option ? option.name : 'Single threaded';

                $scope.$watch('view.value', function(n, o) {
                    if (n !== o) {
                        var option = _.find($scope.view.map[$scope.type], {name: n});
                        $scope.model = option.value;
                        console.log($scope.model);
                    }
                });

                $scope.$watch('model', function(n, o) {
                    if (n !== o) {
                        option = _.find($scope.view.map[$scope.type], {value: n});
                        $scope.view.value = option ? option.name : 'Single threaded';
                    }
                });

            }],
            link: function() {
            }
        };
    }]);