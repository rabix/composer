'use strict';

angular.module('registryApp.dyole')
    .controller('NodeEditCtrl', ['$scope', '$uibModalInstance', 'data', '$timeout', function($scope, $modalInstance, data, $timeout) {

        $scope.data = data;
        $scope.view = {
            error: null,
            label: data.label
        };
        $timeout(function() {
            angular.element('.node-label-edit').trigger('focus');
        }, 1);
        $scope.ok = function() {
            data.onSave.call(data.scope, $scope.view.label);
            $modalInstance.close();
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };

    }]);
