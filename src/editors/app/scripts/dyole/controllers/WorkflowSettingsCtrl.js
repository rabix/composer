/**
 * @ngdoc controller
 * @name registryApp.dyole.controller:WorkflowSettingsCtrl
 *
 * @description
 * Ctrl for editing workflow settings
 *
 * @requires $scope
 * */


angular.module('registryApp.dyole')
    .controller('WorkflowSettingsCtrl', ['$scope', '$uibModalInstance', 'data', 'HelpMessages', 'lodash', '$q',
        function($scope, $modalInstance, data, HelpMessages, _, $q) {
            'use strict';

            $scope.help = HelpMessages;

            $scope.view = {};
            $scope.view.type = data.type || 'Workflow';
            $scope.view.requireSBGMetadata = _.clone(data.requireSBGMetadata);
            $scope.view.instanceHint = {
                class: 'sbg:AWSInstanceType',
                value: ''
            };
            var instances = _.map(data.instances, function(instance) {
                return {
                    text: instance.typeId
                };
            });

            /** @type Hint[] */
            $scope.view.hints = _.clone(data.hints) || [];

            // angular form
            $scope.view.appSettings = {};

            $scope.addMetadata = function() {
                $scope.view.hints.push({
                    class: '',
                    value: ''
                });
            };

            /**
             * Remove meta data from the output
             *
             * @param {integer} index
             */
            $scope.removeMetadata = function(index) {
                $scope.view.hints.splice(index, 1);

                $scope.view.appSettings.$setDirty();
            };

            /**
             * Updates hint value when it is changed
             * @param {string|Expression} value
             * @param {number} index
             */
            $scope.updateHintValue = function(value, index) {
                $scope.view.hints[index].value = value;
            };


            /**
             * Calculates fuzzy finder score for each available instance
             *
             * @param {string} value
             * @returns {*}
             */
            $scope.autoSuggestInstances = function(value) {
                var deferred = $q.defer();

                var regex = new RegExp(value.toLowerCase().split('').join('.*'));

                deferred.resolve(_(instances).filter(function(instance) {
                    var score = instance.text.toLowerCase().search(regex);

                    if (score !== -1) {
                        instance.score = score;
                        return instance;
                    }
                }).sortBy('score').value().slice(0, 6));

                return deferred.promise;
            };


            var _stripEmptyHints = function() {
                _.remove($scope.view.hints, function(meta) {
                    return meta.class === '';
                });
            };

            $scope.ok = function() {

                _stripEmptyHints();

                $modalInstance.close({
                    requireSBGMetadata: $scope.view.requireSBGMetadata,
                    hints: $scope.view.hints
                });

            };
            /**
             * Close the modal window
             */
            $scope.cancel = function() {
                $modalInstance.dismiss('cancel');
            };
        }]);
