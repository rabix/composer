/**
 * Author: Milica Kadic
 * Date: 11/24/14
 * Time: 2:38 PM
 */

'use strict';

angular.module('registryApp.common')
    .controller('MarkdownCtrl', ['$scope', '$uibModalInstance', 'data', function($scope, $modalInstance, data) {

        $scope.view = {};
        $scope.view.description = data.markdown;
        $scope.view.preview = false;

        /**
         * Close the modal
         */
        $scope.ok = function() {
            $modalInstance.close();
        };

        /**
         * Dismiss the modal
         */
        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };

        /**
         * Toggle markdown preview
         */
        $scope.togglePreview = function() {
            $scope.view.preview = !$scope.view.preview;
        };

        /**
         * Confirm description changes
         */
        $scope.finish = function() {
            $modalInstance.close($scope.view.description);
        };

    }]);
