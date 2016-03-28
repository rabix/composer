/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .controller('JsonEditorCtrl', ['$scope', '$rootScope', '$uibModalInstance', '$timeout', '$document', 'options', 'SchemaValidator', '$http', 'Globals', function($scope, $rootScope, $modalInstance, $timeout, $document, options, SchemaValidator, $http, Globals) {

        $scope.view = {};
        $scope.view.urlImport = false;

        //$scope.mirror = null;

        $scope.$watch('view.urlImport', function(n, o) {
            if (o !== n) {
                $scope.view.error = '';
            }
        });

        // TODO: make this pretty, use directive which will serve as general purpose codemirror container
        var timeoutId = $timeout(function() {

            $scope.mirror = CodeMirror($document[0].querySelector('.codemirror-editor'), {
                lineNumbers: true,
                value: '',
                mode: {name: 'javascript', json: true},
                theme: 'mbo',
                lineWrapping: true
            });

        }, 100);

        /**
         * Check if json is valid
         *
         * @param str
         * @returns {boolean}
         */
        var isJsonString = function(str) {

            try {
                JSON.parse(str);
                return true;
            } catch (e) {
                return false;
            }

        };

        /**
         * Do the app import
         */
        $scope.import = function() {

            if ($scope.view.urlImport) {
                if (!$scope.urlImport.url.$invalid) {

                    $scope.view.error = '';

                    $http.post(Globals.apiUrls.brood + 'import', {url: $scope.view.url}).then(function(response) {

                        if (!response.data) {
                            $rootScope.$broadcast('httpError', {message: 'Something has gone wrong, summon the avengers.'});
                            return false;
                        }

                        var data = response.data.message;
                        $scope.view.validating = false;

                        if (typeof data === 'object') {
                            validateJson(JSON.stringify(data));
                        } else {
                            try {
                                var test = JSON.parse(data);
                                validateJson(data);
                            } catch (e) {
                                $rootScope.$broadcast('httpError', {message: 'Error while parsing json response'});
                            }
                        }

                    }, function(trace) {
                        $scope.view.validating = false;
                    });
                } else {
                    $scope.view.error = 'You must provide valid url';
                }

            } else {
                validateJson($scope.mirror.getValue());
            }

        };

        function validateJson(json) {

            $scope.view.error = '';

            if (!$scope.view.urlImport && !isJsonString(json)) {
                $scope.view.error = 'You must provide valid json format';
                return false;
            }

            $scope.view.validating = true;

            SchemaValidator.validate(options.type, JSON.parse(json))
                .then(function() {

                    $scope.view.validating = false;

                    $modalInstance.close(json);

                }, function(trace) {
                    $scope.view.validating = false;
                    $rootScope.$broadcast('httpError', {message: trace});
                });

        }

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
