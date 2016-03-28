/**
 * Created by filip on 4.5.15..
 */

'use strict';

angular.module('registryApp.common')
    .controller('FilePickerCtrl', ['$scope', 'lodash', 'File', function($scope, _, File) {

        $scope.view = {};

        $scope.view.classes = [];

        $scope.view.limit = 0;
        $scope.view.page = 1;
        $scope.view.total = 1;
        $scope.view.searchTerm = '';
        $scope.view.perPage = 10;

        $scope.view.loading = false;

        angular.forEach($scope.view.files, function(file) {
            if (file && file.attrs && typeof file.attrs.metadata !== 'undefined' && typeof file.attrs.metadata.value === 'string') {
                file.attrs.metadata.value = JSON.parse(file.attrs.metadata.value);
            } else {
                file.attrs.metadata = {};
                file.attrs.metadata.value = {};
            }
        });

        $scope.breadcrumbs = [];

        var getFiles = function(config) {
            $scope.view.loading = true;

            config = config || {};
            config.folders = $scope.showFolders;


            File.getFilesInProject(config).then(function(files) {
                updateView(files);
                $scope.view.loading = false;
            });
        };

        var updateView = function(files) {
            $scope.view.page = files.start == 0 ? 1 : $scope.view.page;
            $scope.view.total = files.matching;
            $scope.view.files = files.resultSet;
            $scope.view.loading = false;


            console.log('Updating view', $scope.selectedFiles);
            _.forEach(files.resultSet, function(file) {

                var exists = _.find($scope.selectedFiles, function(f) {
                    return f.id === file.id;
                });

                if (exists) {
                    file.selected = true;
                }
            });
        };

        $scope.goToBreadcrumb = function($index) {
            var path = '';
            for (var i = 0; i <= $index; i++) {
                path += '/';
                path += $scope.breadcrumbs[i];
            }

            $scope.breadcrumbs.splice($index + 1);

            getFiles({limit: $scope.view.limit, offset: $scope.view.perPage, path: path});
        };

        $scope.goToRoot = function() {

            getFiles({offset: $scope.view.perPage});
            $scope.breadcrumbs = [];
        };

        $scope.getMoreFiles = function(limit) {
            console.log(limit);
            getFiles({limit: limit, offset: $scope.view.perPage});
        };

        $scope.goToFolder = function(folderName) {
            $scope.breadcrumbs.push(folderName);
            $scope.goToBreadcrumb($scope.breadcrumbs.length - 1);
        };


        $scope.onFileSelect = function(file) {
            var id = file.id;
            var selected = file.selected;

            if (selected) {
                console.log('Calling onSelect with file id: ', id);
                onSelect(file);
            } else {
                console.log('Calling onDeSelect with file id: ', id);
                onDeSelect(file);
            }
        };

        var onSelect = function(file) {
            var exists = _.find($scope.selectedFiles, function(f) {
                return f.id === file.id;
            });

            if (!exists && !$scope.selectOne) {
                $scope.selectedFiles.push(file);
            }

            if ($scope.selectOne) {
                _.forEach($scope.selectedFiles, function(f) {
                    f.selected = false;
                });
                $scope.selectedFiles.length = 0;
                $scope.selectedFiles.push(file);
            }
        };

        var onDeSelect = function(file) {
            var selected = _.remove($scope.selectedFiles, function(f) {
                return f.id === file.id;
            });

            _.forEach(selected, function(f) {
                f.selected = false;
            })
        };

        $scope.toggleSelect = function(file) {

            if (file.type === 'DIRECTORY') {
                $scope.goToFolder(file.name);
                return false;
            }

            file.selected = typeof file.selected === 'undefined' ? false : file.selected;
            file.selected = !file.selected;

            $scope.onFileSelect(file);
        };

        $scope.onKeyDown = function($event) {
            if ($event.which === 27) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.view.searchTerm = '';
            }
        };

        $scope.goToRoot();
    }])
    .directive('filePicker', ['$templateCache', function($templateCache) {
        return {
            restrict: 'E',
            template: $templateCache.get('views/partials/file-picker.html'),
            scope: {
                files: '=',
                selectedFiles: '=',
                showFolders: '=',
                selectOne: '='
            },
            controller: 'FilePickerCtrl',
            link: function(scope, element, attrs) {
            }
        };
    }]);

