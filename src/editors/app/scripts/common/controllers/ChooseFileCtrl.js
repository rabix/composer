/**
 * Created by filip on 4.5.15..
 */

angular.module('registryApp.common')
    .controller('ChooseFileCtrl', ['$scope', '$uibModalInstance', 'data', 'lodash', function($scope, $modalInstance, data, _) {

        $scope.selectedFiles = data.selectedFiles || [];
        $scope.selectOne = data.selectOne || false;

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };

        $scope.choose = function() {
            $modalInstance.close($scope.selectedFiles);
        };

    }]);