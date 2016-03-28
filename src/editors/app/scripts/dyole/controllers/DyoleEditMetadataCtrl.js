/**
 * @ngdoc controller
 * @name registryApp.dyole.controller:DyoleEditMetadataCtrl
 *
 * @description
 * Ctrl for editing workflow metadata
 *
 * @requires $scope
 * */


angular.module('registryApp.dyole')
    .controller('DyoleEditMetadataCtrl', ['$scope', '$uibModalInstance', 'data', 'HelpMessages', 'lodash', function($scope, $modalInstance, data, HelpMessages, _) {
        $scope.help = HelpMessages;
        $scope.view = {};

        $scope.view.tool = angular.copy(data.tool);
        $scope.view.categories = [];

        $scope.view.categories = _.map($scope.view.tool['sbg:categories'], function(cat) {
            return {text: cat};
        });

        /**
         * Toggle markdown preview
         */
        $scope.togglePreview = function() {
            $scope.view.preview = !$scope.view.preview;
        };

        /**
         * Updates $scope.view.tool.categories
         */
        $scope.updateCategories = function() {
            $scope.view.tool['sbg:categories'] = _.pluck($scope.view.categories, 'text');
        };


        /**
         * Adds a new link field under 'sbg:links'
         */
        $scope.addLink = function() {
            if (_.isUndefined($scope.view.tool['sbg:links'])) {
                $scope.view.tool['sbg:links'] = [];
            }

            $scope.view.tool['sbg:links'].push({
                label: '',
                id: ''
            });
        };

        /**
         * Removes link by index from 'sbg:links'.
         *
         * if 'sbg:links' is empty, then it will remove the whole field from the tool
         *
         * @param index
         */
        $scope.removeLink = function(index) {
            $scope.view.tool['sbg:links'].splice(index, 1);

            if (_.isEmpty($scope.view.tool['sbg:links'])) {
                delete $scope.view.tool['sbg:links'];
            }
        };


        /**
         * Close the modal window
         *
         * also removes empty link fields.
         */
        $scope.edit = function() {

            var links = $scope.view.tool['sbg:links'];
            if (!_.isUndefined(links)) {
                _.remove(links, function(link) {
                    return link.id === '' && link.label === '';
                });
            }

            $modalInstance.close($scope.view.tool);
        };

        /**
         * Close the modal window
         */
        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    }]);
