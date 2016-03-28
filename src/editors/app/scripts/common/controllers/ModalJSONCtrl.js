'use strict';

angular.module('registryApp.common')
    .controller('ModalJSONCtrl', ['$scope', '$uibModalInstance', 'data', function($scope, $modalInstance, data) {

        $scope.data = data;
        $scope.view = {};

        $scope.view.url = typeof data.url === 'undefined' ? true : data.url;

        $scope.view.saving = false;
        $scope.view.json = data.json;

        $scope.view.stringJson = JSON.stringify(data.json);

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };

        $scope.getUrl = function() {
            $modalInstance.close($scope.view.json);
        };

    }]);
