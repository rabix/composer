/**
 * Author: Milica Kadic
 * Date: 12/18/14
 * Time: 12:10 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .controller('ManagePropertyArgCtrl', ['$scope', '$uibModalInstance', 'Cliche', 'options', 'lodash', 'SandBox', '$timeout', function($scope, $modalInstance, Cliche, options, _, SandBox, $timeout) {

        $scope.view = {};
        $scope.view.property = angular.copy(options.property);
        $scope.view.mode = options.mode;

        if (options.property && options.property.valueFrom && options.property.valueFrom.script) {
            checkIsArray(options.property.valueFrom.script);
        }


        if (_.isUndefined($scope.view.property)) {
            $scope.view.property = {separate: true};
        }

        /**
         * Save property changes
         *
         * @returns {boolean}
         */
        $scope.save = function() {

            $scope.view.error = '';
            $scope.view.form.$setDirty();

            if ($scope.view.form.$invalid) {
                return false;
            }

            Cliche.manageArg(options.mode, $scope.view.property)
                .then(function() {
                    $modalInstance.close({prop: $scope.view.property});
                }, function(error) {
                    $scope.view.error = error;
                });

        };

        /**
         * Update argument if expression defined
         *
         * @param {*} value
         */
        $scope.updateArgument = function(value) {
            $scope.view.property.valueFrom = value;

            if (!!value.script) {
                checkIsArray(value.script);
            }
        };

        function checkIsArray(value) {
            $timeout(function() {
                SandBox.evaluate(value)
                    .then(function(result) {
                        if (_.isArray(result)) {
                            $scope.view.showItemSeparator = true;
                            $scope.view.property.itemSeparator = null;
                        } else {
                            $scope.view.showItemSeparator = false;
                            delete $scope.view.property.itemSeparator;
                        }
                    });
            });
        }

        /**
         * Dismiss modal
         */
        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };

    }]);
