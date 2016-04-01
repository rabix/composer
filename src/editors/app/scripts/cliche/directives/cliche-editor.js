angular.module('registryApp.cliche')
    .directive('clicheEditor', [function() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                app: '=',
                externalAppId: '=',
                externalAppPath: '=',
                callbacks: '=',
            },
            controller: 'ClicheCtrl',
            template: '<div class="cliche-editor rabix">' +
            '<ng-include class="main" src="\'views/cliche/cliche.html\'"></ng-include>' +
            '</div>',
        }
    }]);

