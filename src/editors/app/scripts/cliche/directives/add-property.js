/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .controller('AddPropertyCtrl', ['$scope', '$uibModal', '$templateCache', 'Cliche', 'Helper', 'lodash',
        function($scope, $modal, $templateCache, Cliche, Helper, _) {

            $scope.view = {};
            $scope.view.tooltipMsg = $scope.tooltipMsg || '';
            $scope.view.tooltipPlacement = $scope.tooltipPlacement || 'top';
            /**
             * Show the modal for adding property items
             *
             * @param e
             */
            $scope.addItem = function(e) {
                $scope.setDirty();

                e.stopPropagation();

                var tplName = $scope.toolType ? $scope.toolType + '-' + $scope.type : $scope.type;

                var modalInstance = $modal.open({
                    template: $templateCache.get('views/cliche/manage/' + tplName + '.html'),
                    controller: 'ManageProperty' + $scope.type.charAt(0).toUpperCase() + $scope.type.slice(1) + 'Ctrl',
                    windowClass: 'modal-prop',
                    size: 'lg',
                    resolve: {
                        options: function() {
                            return {
                                mode: 'add',
                                key: $scope.key,
                                toolType: $scope.toolType,
                                properties: $scope.properties
                            };
                        }
                    }
                });

                modalInstance.result.then(function(result) {

                    /* set default value for the input, but only for the first level */
                    if ($scope.type === 'input' && $scope.inputs) {

                        var name = Cliche.parseName(result.prop);
                        var schema = result.prop.type;
                        var typeObj = schema[0] === 'null' ? schema[1] : schema[0]; //in case property is not required
                        var enumObj = Cliche.parseEnum(typeObj);
                        var type = Cliche.parseType(typeObj);
                        var itemType = Cliche.getItemsType(typeObj.items);

                        if (typeObj.items && itemType === 'enum') {
                            enumObj = Cliche.parseEnum(typeObj.items);
                        }

                        $scope.inputs[name] = Helper.getDefaultInputValue(name, enumObj.symbols, type, itemType);
                    }

                    if (_.isFunction($scope.handler)) {
                        $scope.handler();
                    }

                    Cliche.generateCommand();
                    $scope.setDirty();

                }, function() {

                    $scope.setPristine();
                });

                return modalInstance;
            };

        }])
    .directive('addProperty', [function() {

        return {
            restrict: 'E',
            template: '<a uib-tooltip="{{ ::view.tooltipMsg }}" tooltip-placement="{{ ::view.tooltipPlacement }}" href ng-click="addItem($event)" class="btn btn-default"><i class="fa fa-plus"></i></a>',
            scope: {
                type: '@',
                key: '@',
                tooltipMsg: '@',
                tooltipPlacement: '@',
                toolType: '@',
                properties: '=',
                inputs: '=?',
                handler: '&',
                ngModel: '=?'
            },
            require: '?ngModel',
            controller: 'AddPropertyCtrl',
            link: function(scope, element, attr, ngModelCtrl) {
                var originalPristineStatus;

                scope.setDirty = function() {

                    if (ngModelCtrl) {
                        if (typeof originalPristineStatus === 'undefined') {
                            // ngModel parent = inputs, inputs parent = form.tool
                            originalPristineStatus = ngModelCtrl.$$parentForm.$$parentForm.$pristine;
                        }
                        ngModelCtrl.$setDirty();
                    }
                };

                scope.setPristine = function() {
                    // will not set form to pristine if it was not so originally
                    if (ngModelCtrl && originalPristineStatus) {
                        // ngModel -> inputs form -> tool form
                        ngModelCtrl.$$parentForm.$$parentForm.$setPristine();
                        ngModelCtrl.$$parentForm.$setPristine();
                        ngModelCtrl.$setPristine();
                    }
                };
            }
        };
    }]);