/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .controller('EnumCtrl', ['$scope', '$uibModal', '$templateCache', 'lodash', function($scope, $modal, $templateCache, _) {

        $scope.view = {};
        $scope.view.tplPath = 'views/cliche/enum/enum-' + $scope.type.toLowerCase() + '.html';
        $scope.view.symbols = $scope.symbols;

        /**
         * Get schema for the appropriate enum type
         * @returns {*}
         */
        var getSchema = function() {

            var itemScheme;

            if ($scope.type === 'ext') {
                itemScheme = {path: $scope.path};
            } else if ($scope.type === 'File') {
                itemScheme = {path: ''};
            } else if ($scope.type === 'object' || $scope.type === 'map') {
                itemScheme = {};
            } else {
                itemScheme = '';
            }

            return itemScheme;

        };

        /**
         * Transform the list with proper structure applied
         *
         * @param list
         */
        $scope.transformList = function(list) {

            if ($scope.isDisabled) {
                delete $scope.view.list;
                return false;
            }

            $scope.view.list = [];

            if ((!_.isArray(list) || list.length === 0) && !isNaN($scope.min)) {
                _.times($scope.min, function() {
                    $scope.view.list.push({value: getSchema()});
                });
            } else {
                _.each(list, function(item) {
                    $scope.view.list.push({value: item});
                });
            }
        };

        /* init transform */
        $scope.transformList($scope.model);

        /**
         * Add item to the list
         */
        $scope.addItem = function() {

            if ($scope.isDisabled) {
                return false;
            }

            if (_.isUndefined($scope.view.list)) {
                $scope.transformList($scope.model);
            }

            if ($scope.max && $scope.view.list.length >= $scope.max) {
                return false;
            }
            $scope.view.list.push({value: getSchema()});
        };

        /**
         * Remove item from the list
         * @param index
         */
        $scope.removeItem = function(index) {
            if (($scope.min && $scope.view.list.length <= $scope.min) || $scope.isDisabled) {
                return false;
            }
            $scope.view.list.splice(index, 1);
        };

        /**
         * Open modal to enter more parameters for the input file
         */
        $scope.more = function(index) {

            var modalInstance = $modal.open({
                template: $templateCache.get('views/cliche/partials/input-file-more.html'),
                controller: 'InputFileMoreCtrl',
                windowClass: 'modal-prop',
                resolve: {
                    data: function() {
                        return {schema: $scope.view.list[index].value, key: 'item ' + index};
                    }
                }
            });

            modalInstance.result.then(function(schema) {
                $scope.view.list[index].value = angular.copy(schema);
            });

        };

        $scope.$watch('view.list', function(n, o) {
            if (n !== o) {
                $scope.model = _.pluck(n, 'value');
            }
        }, true);

        $scope.$watch('model', function(n, o) {
            if (n !== o) {
                $scope.transformList(n);
                $scope.setDirty();
            }
        });

        $scope.$watch('path', function(n, o) {
            if (n !== o) {
                _.each($scope.view.list, function(item) {
                    if (_.isEmpty(item.value.path) || item.value.path === o) {
                        item.value.path = n;
                    }
                });
            }
        });

    }])
    .directive('enum', ['$templateCache', function($templateCache) {
        return {
            restrict: 'E',
            template: $templateCache.get('views/cliche/partials/enum.html'),
            require: '?ngModel',
            scope: {
                model: '=ngModel',
                type: '=',
                min: '=',
                max: '=',
                properties: '=',
                isRequired: '=',
                path: '=',
                form: '=',
                exposible: '@',
                isDisabled: '=?',
                symbols: '=?'
            },
            controller: 'EnumCtrl',
            link: function(scope, element, attr, ngModelCtrl) {
                scope.setDirty = function() {
                    if (ngModelCtrl) {
                        ngModelCtrl.$setDirty();
                    }
                };
            }
        };
    }]);