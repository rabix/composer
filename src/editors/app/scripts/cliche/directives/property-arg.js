/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .controller('PropertyArgCtrl', ['$scope', '$templateCache', '$uibModal', 'SandBox', 'Cliche', 'lodash', function($scope, $templateCache, $modal, SandBox, Cliche, _) {

        $scope.view = {};
        $scope.view.exprError = '';
        $scope.view.tpl = 'views/cliche/property/property-arg.html';

        /**
         * Check if expression is valid
         */
        var checkExpression = function() {

            if ($scope.prop.valueFrom && $scope.prop.valueFrom.value) {

                SandBox.evaluate($scope.prop.valueFrom.script, {})
                    .then(function() {
                        $scope.view.exprError = '';
                    }, function(error) {
                        $scope.view.exprError = error.name + ':' + error.message;
                    });
            } else {
                $scope.view.exprError = '';
            }

        };

        /* init check of the expression if defined */
        checkExpression();

        /**
         * Toggle argument box visibility
         */
        $scope.toggle = function() {
            $scope.active = !$scope.active;
        };

        /**
         * Remove particular property
         */
        $scope.remove = function() {

            var modalInstance = $modal.open({
                template: $templateCache.get('views/partials/confirm-delete.html'),
                controller: 'ModalCtrl',
                windowClass: 'modal-confirm',
                resolve: {
                    data: function() {
                        return {};
                    }
                }
            });

            modalInstance.result.then(function() {
                Cliche.deleteArg($scope.prop);
                Cliche.generateCommand();
                $scope.setDirty();
            });
        };

        /**
         * Edit property
         */
        $scope.edit = function() {

            var modalInstance = $modal.open({
                template: $templateCache.get('views/cliche/manage/arg.html'),
                controller: 'ManagePropertyArgCtrl',
                windowClass: 'modal-prop',
                size: 'lg',
                resolve: {
                    options: function() {
                        return {
                            type: 'arg',
                            mode: 'edit',
                            property: angular.copy($scope.prop)
                        };
                    }
                }
            });

            modalInstance.result.then(function(result) {
                if (result.prop !== $scope.prop) {
                    _.each(result.prop, function(value, key) {
                        $scope.prop[key] = value;
                    });

                    checkExpression();
                    Cliche.generateCommand();
                    $scope.setDirty();
                } else {
                    $scope.setPristine();
                }

            }, function() {
                $scope.setPristine();
            });

            return modalInstance;

        };

        /**
         * Handle actions initiated from the property header
         *
         * @param action
         */
        $scope.handleAction = function(action) {

            if (typeof $scope[action] === 'function') {
                $scope[action]();
            }
        };

    }])
    .directive('propertyArg', [function() {

        return {
            restrict: 'E',
            template: '<div class="property-box" ng-class="{active: active}"><ng-include class="include" src="view.tpl"></ng-include></div>',
            scope: {
                prop: '=ngModel',
                index: '@'
            },
            require: '?ngModel',
            controller: 'PropertyArgCtrl',
            link: function(scope, element, attr, ngModelCtrl) {
                var originalPristineStatus;

                scope.setDirty = function() {

                    if (ngModelCtrl) {
                        if (typeof originalPristineStatus === 'undefined') {
                            // ngModel parent = general, general parent = form.tool
                            originalPristineStatus = ngModelCtrl.$$parentForm.$$parentForm.$pristine;
                        }
                        ngModelCtrl.$setDirty();
                    }
                };

                scope.setPristine = function() {
                    // will not set form to pristine if it was not so originally
                    if (ngModelCtrl && originalPristineStatus) {
                        // ngModel -> general form -> tool form
                        ngModelCtrl.$$parentForm.$$parentForm.$setPristine();
                        ngModelCtrl.$setPristine();
                    }
                };
            }
        };
    }]);
