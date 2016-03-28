/**
 * Created by Maya on 8.5.15.
 */

'use strict';

angular.module('registryApp.common')
    .controller('SelectedFilesCtrl', ['$scope', 'lodash', function($scope, _) {
        $scope.fileCount = function() {
            return _.where($scope.files, {type: 'FILE'}).length;
        };

        $scope.deselectFile = function(file, $event) {
            $event.preventDefault();
            $event.stopPropagation();

            removeSelected(file);
        };

        $scope.selectAll = function() {
            _.forEach($scope.files, function(f) {
                if (f.type !== 'DIRECTORY') {
                    f.selected = true;
                    selectFile(f);
                }
            })
        };

        $scope.clearSelection = function() {
            _.forEach($scope.selectedFiles, function(f) {
                f.selected = false;
            });

            var length = _.clone($scope.selectedFiles.length);
            for (var i = 0; i < length; i++) {
                $scope.selectedFiles.pop();
            }
        };

        function removeSelected(file) {
            file.selected = false;
            _.remove($scope.selectedFiles, function(f) {
                return f.id === file.id;
            });
        }

        function selectFile(file) {
            var exists = _.find($scope.selectedFiles, function(f) {
                return f.id === file.id;
            });

            if (!exists) {
                $scope.selectedFiles.push(file)
            }
        }
    }])
    .directive('selectedFiles', [function() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                selectedFiles: '=',
                files: '='
            },
            templateUrl: 'views/partials/selected-files.html',
            controller: 'SelectedFilesCtrl'
        }
    }]);