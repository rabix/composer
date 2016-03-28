'use strict';

angular.module('registryApp.common')
    .controller('LiteralCtrl', ['$scope', '$uibModalInstance', 'options', function($scope, $modalInstance, options) {

        $scope.view = {};

        $scope.view.literal = options.literal || '';

        /**
         * Close modal and set literal value
         *
         * @param literal
         */
        $scope.ok = function(literal) {

            $modalInstance.close(literal);
        };

        /**
         * Cancel close the modal
         */
        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };

    }]);
