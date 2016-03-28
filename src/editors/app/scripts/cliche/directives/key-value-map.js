/**
 * Created by Maya on 28.9.15.
 */

angular.module('registryApp.cliche')
    .controller('KeyValueMapCtrl', ['$scope', 'Cliche', 'lodash', function($scope, Cliche, _) {
        'use strict';

        $scope.view = {};

        $scope.view.list = [];

        _.forIn($scope.list, function(value, key) {
            $scope.view.list.push({
                value: value,
                key: key
            });
        });

        $scope.addItem = function() {
            $scope.view.list.push({
                value: '',
                key: ''
            });
        };

        $scope.removeItem = function(item, index) {
            delete $scope.list[item.key];
            $scope.view.list.splice(index, 1);
        };

        $scope.$watch('view.list', function(n, o) {
            if (n !== o) {

                _.forIn($scope.list, function(val, key) {
                    delete $scope.list[key];
                });
                _.forEach(n, function(item) {
                    $scope.list[item.key] = item.value;
                });
            }
        }, true);

    }])
    .directive('keyValueMap', ['$templateCache', function($templateCache) {
        'use strict';

        return {
            restrict: 'E',
            template: $templateCache.get('views/cliche/partials/key-value-map.html'),
            controller: 'KeyValueMapCtrl',
            scope: {
                list: '=',
                keyLabel: '@',
                valueLabel: '@',
                emptyListLabel: '@',
                hasExpr: '=',
                ngDisabled: '='
            }
        };
    }]);