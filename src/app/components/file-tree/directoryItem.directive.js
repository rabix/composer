// breaking away from ES6 because of dependency injection inside a directive
// http://stackoverflow.com/questions/28620479/using-es6-classes-as-angular-1-x-directives?answertab=votes#tab-top

angular.module('cottontail').directive('directoryItem', ['RecursionHelper', function(RecursionHelper) {
    return {
        templateUrl: 'app/components/file-tree/directory-item.html',
        restrict: 'E',
        replace: true,
        scope: {
            directory: '='
        },
        compile: function(element) {
            var link = function(scope) {
                scope.openFile = function(file) {
                    scope.$emit('fileOpened', file);
                };

                scope.directory.isOpen = scope.directory.name === 'root';
            };

            return RecursionHelper.compile(element, link);
        }
    }
}]);

