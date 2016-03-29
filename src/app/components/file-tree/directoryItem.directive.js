// breaking away from ES6 because of dependency injection inside a directive
// http://stackoverflow.com/questions/28620479/using-es6-classes-as-angular-1-x-directives?answertab=votes#tab-top

angular.module('cottontail').directive('directoryItem', ['RecursionHelper', '$timeout', function (RecursionHelper, $timeout) {
    return {
        templateUrl: 'app/components/file-tree/directory-item.html',
        restrict: 'E',
        replace: true,
        scope: {
            directory: '='
        },
        compile: function (element) {

            var link = function (scope) {

                scope.directoryLoadingInProgress = false;

                scope.openFile = function (file) {
                    scope.$emit('fileOpened', file);
                };

                scope.reloadTree = function () {
                    const startTime = new Date().valueOf();
                    scope.directoryLoadingInProgress = true;

                    scope.$emit('reloadDirectoryTree', {
                        onComplete: function stopSpinner() {

                            // For the sake of UX, let the spinner spin for at least 1 second before stopping
                            const timeDiff = (new Date().valueOf()) - startTime;
                            const minSpinningTime = 1000;

                            if (timeDiff < minSpinningTime) {
                                $timeout(() => scope.directoryLoadingInProgress = false, minSpinningTime - timeDiff);
                            } else {
                                scope.directoryLoadingInProgress = false;
                            }
                        }
                    });
                };

                scope.directory.isOpen = scope.directory.isRoot;


            };

            return RecursionHelper.compile(element, link);
        }
    }
}]);

