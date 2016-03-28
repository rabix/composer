/**
 * Created by mate on 26.1.16..
 */
'use strict';

angular.module('registryApp.common')
    .controller('ConfirmCustomCtrl', ['$scope', '$uibModalInstance', 'data', 'HotkeyRegistry', function($scope, $modalInstance, data, HotkeyRegistry) {

        $scope.data = data;
        $scope.view = {};

        $scope.view.message = data.message;
        $scope.view.buttons = data.buttons;

        $scope.modalInstance = $modalInstance;

        var unloadHotkeys = HotkeyRegistry.loadHotkeys({name: 'confirm', callback: $scope.ok, preventDefault: true});

        $scope.$on('$destroy', function() {
            unloadHotkeys();
        });
    }]);
