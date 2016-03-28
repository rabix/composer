/**
 * Author: Milica Kadic
 * Date: 11/26/14
 * Time: 1:40 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .controller('InputFileMoreCtrl', ['$scope', '$uibModalInstance', 'data', 'lodash', function($scope, $modalInstance, data, _) {

        $scope.view = {};
        $scope.view.schema = angular.copy(data.schema);
        $scope.view.key = data.key;

        $scope.view.metadata = [];
        if ($scope.view.schema && $scope.view.schema.metadata) {
            _.forOwn($scope.view.schema.metadata, function(value, key) {
                $scope.view.metadata.push({value: value, key: key});
            });
        }

        if (_.isUndefined($scope.view.schema.secondaryFiles)) {
            $scope.view.schema.secondaryFiles = [];
        }

        /**
         * Do the schema update
         *
         * @returns {boolean}
         */
        $scope.update = function() {

            $scope.view.error = '';

            $scope.view.form.$setDirty();

            if ($scope.view.form.$invalid) {
                return false;
            }

            if (!_.isEmpty($scope.view.metadata)) {
                if (_.isUndefined($scope.view.schema.metadata)) {
                    $scope.view.schema.metadata = {};
                }
                _.forEach($scope.view.metadata, function(meta) {
                    if (!meta.error && meta.key !== '') {
                        $scope.view.schema.metadata[meta.key] = meta.value;
                    }
                });
            }

            $modalInstance.close($scope.view.schema);

        };

        $scope.addMetadata = function() {
            $scope.view.metadata.push({
                key: '',
                value: ''
            });
        };

        /**
         * Remove meta data from the output
         *
         * @param {integer} index
         */
        $scope.removeMetadata = function(index) {
            $scope.view.metadata.splice(index, 1);
        };

        /**
         * Update existing meta value with expression or literal
         *
         * @param index
         * @param value
         */
        $scope.updateMetaValue = function(index, value) {
            $scope.view.metadata[index].value = value;
        };

        /**
         * Dismiss the modal
         */
        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };


    }]);
