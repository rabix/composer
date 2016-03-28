/**
 * Created by filip on 12/3/14.
 */
/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.dyole')
    .controller('DyoleJsonEditorCtrl', ['$scope', '$uibModalInstance', '$timeout', 'options', 'Workflow', function($scope, $modalInstance, $timeout, options, Workflow) {

        $scope.view = {};
        $scope.view.user = options.user;

        var mirror;

        var timeoutId = $timeout(function() {

            mirror = CodeMirror(document.querySelector('.codemirror-editor'), {
                lineNumbers: true,
                value: '',
                mode: {name: "javascript", json: true},
                theme: 'mbo'
            });

        }, 100);

        /**
         * Check if json is valid
         * @param str
         * @returns {boolean}
         */
        var isJsonString = function(str) {

            try {
                JSON.parse(str);
            } catch (e) {
                return false;
            }

            return true;
        };

        /**
         * Do the pipeline import
         */
        $scope.import = function() {

            var json = mirror.getValue();
            $scope.view.error = '';

            if (!isJsonString(json)) {
                $scope.view.error = 'You must provide valid json format';
                return false;
            }

            $scope.view.validating = true;

            Workflow.validateJson(json)
                .then(function(data) {

                    $scope.view.validating = false;

                    $modalInstance.close(data);

                }, function() {
                    $scope.view.validating = false;
                });


        };

        /**
         * Close the modal window
         */
        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };

        $scope.$on('$destroy', function() {
            if (angular.isDefined(timeoutId)) {
                $timeout.cancel(timeoutId);
                timeoutId = undefined;
            }
        });

    }]);
