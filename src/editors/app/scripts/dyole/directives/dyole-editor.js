angular.module('registryApp.dyole')
    .directive('dyoleEditor', [function() {

        return {
            restrict: 'E',
            replace: true,
            scope: {
                app: '=',
                externalAppId: '=',
                externalAppPath: '=',
                isDirty: '=',
                callbacks: '=',
                getToolbox: '=',
                getApp: '='
            },
            controller: 'WorkflowEditorCtrl',
            template: '<div class="dyole-editor rabix">' +
            '<ng-include class="main" src="\'views/app/workflow-editor.html\'"></ng-include>' +
            '</div>'
        }
    }]);